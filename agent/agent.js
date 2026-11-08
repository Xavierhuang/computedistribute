// Reference worker agent: registers with the marketplace, claims jobs, heartbeats
// while running them, and reports results.
//
// Handlers run IN-PROCESS. That is fine for the trusted job types defined here, but
// it is NOT isolation: before running buyer-supplied code on third-party hosts, each
// job must run inside a VM or sandbox (see the research report's security section).
//
// Env: CD_API_URL (default http://localhost:3000), CD_HOST_KEY (required),
//      CD_WORKER_ID (reuse a registered worker), CD_WORKER_NAME, CD_VRAM_GB, CD_POLL_MS.

const API = (process.env.CD_API_URL || 'http://localhost:3000').replace(/\/$/, '');
const KEY = process.env.CD_HOST_KEY;
const POLL_MS = Number(process.env.CD_POLL_MS || 2000);

const handlers = {
  echo: async (input) => input,
};

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
    const output = await handlers[job.type](job.input, { signal: controller.signal });
    if (controller.signal.aborted) throw new LeaseLost();
    await api('POST', `/leases/${leaseId}/complete`, { output });
    console.log(`✓ job ${job.id} succeeded`);
  } catch (err) {
    if (err instanceof LeaseLost || controller.signal.aborted) {
      console.log(`✗ job ${job.id}: lease lost (canceled or reassigned), dropping it`);
      return;
    }
    console.error(`✗ job ${job.id} failed: ${err.message}`);
    await api('POST', `/leases/${leaseId}/fail`, { error: err.message, retryable: true }).catch(() => {});
  } finally {
    clearInterval(beat);
  }
}

async function main() {
  if (!KEY) {
    console.error('Set CD_HOST_KEY to a host API key (npm run create-account -- host "<name>")');
    process.exit(2);
  }
  let workerId = process.env.CD_WORKER_ID;
  if (!workerId) {
    const worker = await api('POST', '/workers', {
      name: process.env.CD_WORKER_NAME || require('node:os').hostname(),
      job_types: Object.keys(handlers),
      vram_gb: Number(process.env.CD_VRAM_GB || 0),
    });
    workerId = worker.id;
    console.log(`Registered worker ${workerId}. Set CD_WORKER_ID=${workerId} to reuse it next time.`);
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
