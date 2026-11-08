const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { download, isPublicAddress, JobError } = require('../agent/net');

test('isPublicAddress blocks private, loopback, link-local and mapped addresses', () => {
  for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254',
    '100.64.0.1', '0.0.0.0', '224.0.0.1', '255.255.255.255', '::1', '::', 'fe80::1', 'fd00::1', 'ff02::1',
    '::ffff:127.0.0.1', '::ffff:192.168.0.1', '::ffff:7f00:1', 'not-an-ip']) {
    assert.equal(isPublicAddress(ip), false, ip);
  }
  for (const ip of ['8.8.8.8', '1.1.1.1', '172.32.0.1', '2606:4700:4700::1111', '::ffff:8.8.8.8']) {
    assert.equal(isPublicAddress(ip), true, ip);
  }
});

let server;
let base;
let dir;
before(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), 'cd-net-test-'));
  server = http.createServer((req, res) => {
    if (req.url === '/file') return res.end('hello audio');
    if (req.url === '/big') return res.end(Buffer.alloc(2048));
    if (req.url === '/chunked-big') {
      res.write(Buffer.alloc(1024));
      return res.end(Buffer.alloc(1024)); // no content-length declared up front
    }
    if (req.url === '/redirect') return res.writeHead(302, { location: '/file' }).end();
    if (req.url === '/loop') return res.writeHead(302, { location: '/loop' }).end();
    res.writeHead(404).end();
  }).listen(0, '127.0.0.1');
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  server.close();
  await fs.rm(dir, { recursive: true, force: true });
});

const dest = () => path.join(dir, `f-${Math.random().toString(36).slice(2)}`);

test('download refuses private addresses by default, as a permanent failure', async () => {
  await assert.rejects(download(`${base}/file`, dest(), { maxBytes: 1e6 }), (err) => {
    assert.ok(err instanceof JobError);
    assert.match(err.message, /non-public address/);
    assert.equal(err.retryable, false);
    return true;
  });
  // A hostname that resolves to loopback is refused after DNS resolution.
  const port = server.address().port;
  await assert.rejects(download(`http://localhost:${port}/file`, dest(), { maxBytes: 1e6 }), /non-public address/);
});

test('download fetches, follows redirects, and enforces limits when private URLs are allowed', async () => {
  const file = dest();
  const ok = await download(`${base}/redirect`, file, { maxBytes: 1e6, allowPrivate: true });
  assert.equal(ok.bytes, 11);
  assert.equal(await fs.readFile(file, 'utf8'), 'hello audio');

  await assert.rejects(download(`${base}/big`, dest(), { maxBytes: 1000, allowPrivate: true }), /limit is 1000/);
  const partial = dest();
  await assert.rejects(download(`${base}/chunked-big`, partial, { maxBytes: 1500, allowPrivate: true }), /exceeds the 1500-byte limit/);
  await assert.rejects(fs.access(partial), 'partial file is removed');
  await assert.rejects(download(`${base}/loop`, dest(), { maxBytes: 1e6, allowPrivate: true }), /too many redirects/);
  await assert.rejects(download(`${base}/missing`, dest(), { maxBytes: 1e6, allowPrivate: true }), (err) => {
    assert.match(err.message, /HTTP 404/);
    assert.equal(err.retryable, false, '404 fails the same everywhere');
    return true;
  });
});
