// Guarded downloads for buyer-supplied URLs. A host runs this agent on its own
// network, so a buyer must not be able to make it fetch private addresses (the
// host's router, LAN services, cloud metadata at 169.254.169.254, ...).
// The check runs on the IP actually connected to, after DNS resolution, so a
// public hostname that resolves to a private address is refused too.

const dns = require('node:dns');
const fs = require('node:fs');
const http = require('node:http');
const https = require('node:https');
const net = require('node:net');
const { pipeline } = require('node:stream/promises');

class JobError extends Error {
  constructor(message, { retryable = false } = {}) {
    super(message);
    this.retryable = retryable;
  }
}

const blocked = new net.BlockList();
for (const [prefix, bits] of [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16],
  ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15],
  ['198.51.100.0', 24], ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4],
]) blocked.addSubnet(prefix, bits, 'ipv4');
for (const [prefix, bits] of [
  ['::', 128], ['::1', 128], ['64:ff9b::', 96], ['100::', 64], ['2001:db8::', 32],
  ['fc00::', 7], ['fe80::', 10], ['ff00::', 8],
]) blocked.addSubnet(prefix, bits, 'ipv6');

function isPublicAddress(ip) {
  const family = net.isIP(ip);
  if (family === 4) return !blocked.check(ip, 'ipv4');
  if (family === 6) {
    // IPv4-mapped (::ffff:a.b.c.d) must be judged by its IPv4 address.
    const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(ip);
    if (mapped) return isPublicAddress(mapped[1]);
    if (/^::ffff:/i.test(ip)) return false; // hex-form mapped address: refuse rather than parse
    return !blocked.check(ip, 'ipv6');
  }
  return false;
}

function guardedLookup(hostname, options, callback) {
  dns.lookup(hostname, options, (err, address, family) => {
    if (err) return callback(err);
    const list = Array.isArray(address) ? address : [{ address, family }];
    const bad = list.find((a) => !isPublicAddress(a.address));
    if (bad) {
      const e = new Error(`refusing to connect to non-public address ${bad.address}`);
      e.code = 'EPRIVATEADDR';
      return callback(e);
    }
    callback(null, address, family);
  });
}

function requestOnce(url, { allowPrivate, signal, timeoutMs }) {
  return new Promise((resolve, reject) => {
    const host = url.hostname.replace(/^\[|\]$/g, '');
    if (!allowPrivate && net.isIP(host) && !isPublicAddress(host)) {
      return reject(new JobError(`refusing to connect to non-public address ${host}`));
    }
    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.get(url, {
      signal,
      timeout: timeoutMs,
      lookup: allowPrivate ? undefined : guardedLookup,
      headers: { 'user-agent': 'computedistribute-agent' },
    }, resolve);
    req.on('timeout', () => req.destroy(new JobError(`download timed out after ${timeoutMs} ms of inactivity`, { retryable: true })));
    req.on('error', (err) => {
      if (err instanceof JobError || err.name === 'AbortError') return reject(err);
      if (err.code === 'EPRIVATEADDR') return reject(new JobError(err.message));
      reject(new JobError(`download failed: ${err.message}`, { retryable: true }));
    });
  });
}

// Downloads url to destPath. Throws JobError; retryable only for transient failures.
async function download(rawUrl, destPath, { maxBytes, allowPrivate = false, signal, timeoutMs = 30_000, maxRedirects = 5 } = {}) {
  let url = new URL(rawUrl);
  for (let hop = 0; ; hop++) {
    if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new JobError(`unsupported URL scheme ${url.protocol}`);
    const res = await requestOnce(url, { allowPrivate, signal, timeoutMs });

    if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
      res.resume();
      if (hop >= maxRedirects) throw new JobError('too many redirects');
      url = new URL(res.headers.location, url); // re-checked on the next request
      continue;
    }
    if (res.statusCode !== 200) {
      res.resume();
      throw new JobError(`download failed: HTTP ${res.statusCode}`, { retryable: res.statusCode >= 500 || res.statusCode === 429 });
    }
    const declared = Number(res.headers['content-length']);
    if (Number.isFinite(declared) && declared > maxBytes) {
      res.destroy();
      throw new JobError(`file is ${declared} bytes; the limit is ${maxBytes}`);
    }

    let received = 0;
    res.on('data', (chunk) => {
      received += chunk.length;
      if (received > maxBytes) res.destroy(new JobError(`file exceeds the ${maxBytes}-byte limit`));
    });
    try {
      await pipeline(res, fs.createWriteStream(destPath), { signal });
    } catch (err) {
      await fs.promises.rm(destPath, { force: true });
      if (err instanceof JobError || err.name === 'AbortError') throw err;
      throw new JobError(`download interrupted: ${err.message}`, { retryable: true });
    }
    return { bytes: received, finalUrl: url.href };
  }
}

module.exports = { download, isPublicAddress, JobError };
