// Reference worker agent: registers with the marketplace, claims jobs, heartbeats
// while running them, and reports results.
//
// Handlers run on the host without a sandbox. That is acceptable for the fixed job
// types here (no buyer code runs; buyer URLs are fetched through a private-address
// guard), but buyer-supplied code would need a VM or sandbox first.
//
// Env: CD_API_URL (default http://localhost:3000), CD_HOST_KEY (required),
//      CD_WORKER_ID (reuse a registered worker), CD_WORKER_NAME, CD_VRAM_GB, CD_POLL_MS,
//      CD_PYTHON (Python with faster-whisper; enables "transcribe"),
//      CD_MAX_DOWNLOAD_MB (default 500), CD_ALLOW_PRIVATE_URLS=1 (local testing only).

const { createTranscribeHandler, isAvailable } = require('./handlers/transcribe');

const API = (process.env.CD_API_URL || 'http://localhost:3000').replace(/\/$/, '');
const KEY = process.env.CD_HOST_KEY;
const POLL_MS = Number(process.env.CD_POLL_MS || 2000);

const handlers = {
  echo: async (input) => input,
};

async function loadOptionalHandlers() {
  const python = process.env.CD_PYTHON;
  if (!python) {
    console.log('transcribe: disabled (set CD_PYTHON to a Python with faster-whisper installed)');
    return;
  }
  if (!(await isAvailable(python))) {
    console.log(`transcribe: disabled (${python} cannot import faster_whisper)`);
    return;
  }
  const allowPrivateUrls = process.env.CD_ALLOW_PRIVATE_URLS === '1';
  if (allowPrivateUrls) console.warn('WARNING: CD_ALLOW_PRIVATE_URLS=1 lets jobs fetch private network addresses. Local testing only.');
  handlers.transcribe = createTranscribeHandler({
    python,
    maxBytes: Number(process.env.CD_MAX_DOWNLOAD_MB || 500) * 1024 * 1024,
    allowPrivateUrls,
  });
  console.log('transcribe: enabled');
}

class LeaseLost extends Error {}

async function api(method, path, body) {
  const res = await fetch(`${API}/v1/host${path}`, {
    method,
    headers: { authorization: `Bearer ${KEY}`, 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (res.status === 409 && data.error === 'lease_lost') throw new LeaseLost();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${JSON.stringify(data)}`);
  return data;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runJob(claimed) {
  const { lease_id: leaseId, lease_seconds: leaseSeconds, job } = claimed;
  const controller = new AbortController();
  const beat = setInterval(() => {
    api('POST', `/leases/${leaseId}/heartbeat`).catch((err) => {
      if (err instanceof LeaseLost) controller.abort();
      else console.error('heartbeat failed:', err.message);
    });
  }, Math.max(1000, (leaseSeconds * 1000) / 3));

  try {
    console.log(`→ job ${job.id} (${job.type}, attempt ${job.attempt})`);
    const handler = handlers[job.type];
    if (!handler) throw Object.assign(new Error(`this agent cannot run "${job.type}" jobs`), { retryable: true });
    const output = await handler(job.input, { signal: controller.signal });
    if (controller.signal.aborted) throw new LeaseLost();
    await api('POST', `/leases/${leaseId}/complete`, { output });
    console.log(`✓ job ${job.id} succeeded`);
  } catch (err) {
    if (err instanceof LeaseLost || controller.signal.aborted) {
      console.log(`✗ job ${job.id}: lease lost (canceled or reassigned), dropping it`);
      return;
    }
    console.error(`✗ job ${job.id} failed: ${err.message}`);
    // Errors are retried on another attempt unless the handler marked them permanent
    // (e.g. a 404 audio URL), which would fail the same way everywhere.
    await api('POST', `/leases/${leaseId}/fail`, { error: err.message, retryable: err.retryable !== false }).catch(() => {});
  } finally {
    clearInterval(beat);
  }
}

async function main() {
  if (!KEY) {
    console.error('Set CD_HOST_KEY to a host API key (npm run create-account -- host "<name>")');
    process.exit(2);
  }
  await loadOptionalHandlers();
  const registration = {
    name: process.env.CD_WORKER_NAME || require('node:os').hostname(),
    job_types: Object.keys(handlers),
    vram_gb: Number(process.env.CD_VRAM_GB || 0),
  };
  let workerId = process.env.CD_WORKER_ID;
  if (workerId) {
    // Sync what this machine can do now, so a reused worker gets newly enabled job types.
    await api('PUT', `/workers/${workerId}`, registration);
    console.log(`Worker ${workerId} ready for: ${registration.job_types.join(', ')}`);
  } else {
    workerId = (await api('POST', '/workers', registration)).id;
    console.log(`Registered worker ${workerId} for: ${registration.job_types.join(', ')}. Set CD_WORKER_ID=${workerId} to reuse it.`);
  }

  let stopping = false;
  process.on('SIGINT', () => {
    if (stopping) process.exit(1);
    stopping = true;
    console.log('Finishing the current job, then exiting (Ctrl-C again to force).');
  });

  while (!stopping) {
    try {
      const claimed = await api('POST', `/workers/${workerId}/claim`);
      if (claimed) await runJob(claimed);
      else await sleep(POLL_MS);
    } catch (err) {
      console.error('claim failed:', err.message);
      await sleep(POLL_MS * 2);
    }
  }
}

main();
