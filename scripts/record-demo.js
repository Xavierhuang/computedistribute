// Records a captioned demo video of the real dashboard: three worker agents on this
// machine, a recording split across them, and a worker crashing mid-job.
//
// Needs (outside the repo, see README): Playwright + Chromium in
// ~/.local/share/computedistribute/videotools, the Whisper venv, and the local dev
// Postgres on :54329. Output: demo-video/computedistribute-demo.mp4
//
// Usage: node scripts/record-demo.js

const { spawn, execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const HOME = os.homedir();
const TOOLS = path.join(HOME, '.local/share/computedistribute');
const { chromium } = require(path.join(TOOLS, 'videotools/node_modules/playwright-core'));
const { createPool } = require('../src/db');
const { createAccount } = require('../src/auth');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'demo-video');
const PORT = 3477;
const BASE = `http://localhost:${PORT}`;
const DB = 'postgresql://postgres@127.0.0.1:54329/computedistribute';
const PYTHON = path.join(TOOLS, 'venv/bin/python');
const AUDIO = 'https://archive.org/download/gettysburg_johng_librivox/gettysburg_address_64kb.mp3';
const SIZE = { width: 1280, height: 800 };
// Narration: macOS text-to-speech. Override with DEMO_VOICE="Samantha" if Ava isn't installed.
const VOICE = process.env.DEMO_VOICE || 'Ava (Premium)';
const VOICE_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'cd-voice-'));
const clips = []; // { file, atMs } relative to the start of the video
let videoStart = 0;
let speechEndsAt = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const children = [];

function run(args, env, name) {
  const child = spawn(process.execPath, args, { cwd: ROOT, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  const log = fs.createWriteStream(path.join(os.tmpdir(), `cd-demo-${name}.log`));
  child.stdout.pipe(log);
  child.stderr.pipe(log);
  children.push(child);
  return child;
}

async function waitFor(fn, { timeoutMs = 90_000, everyMs = 500, what = 'condition' } = {}) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    const v = await fn();
    if (v) return v;
    await sleep(everyMs);
  }
  throw new Error(`timed out waiting for ${what}`);
}

// Renders a spoken line to an audio file and returns { file, seconds }.
function renderSpeech(text) {
  const file = path.join(VOICE_DIR, `line-${clips.length}.aiff`);
  execFileSync('say', ['-v', VOICE, '-r', '180', '-o', file, text]);
  const seconds = Number(/estimated duration: ([\d.]+)/.exec(execFileSync('afinfo', [file]).toString())[1]);
  return { file, seconds };
}

// Starts a rendered line "now" in the video's timeline.
function startSpeech(clip) {
  clips.push({ file: clip.file, atMs: Date.now() - videoStart });
  speechEndsAt = Date.now() + clip.seconds * 1000;
}

// Waits for the narrator to finish the previous line (plus a short pause).
async function untilQuiet(gapMs = 450) {
  const wait = speechEndsAt + gapMs - Date.now();
  if (wait > 0) await sleep(wait);
}

// Caption bar overlaid on the page (outside #app, so dashboard re-renders keep it).
async function caption(page, text, spoken = text) {
  await untilQuiet();
  const clip = renderSpeech(spoken);
  await page.evaluate((t) => {
    let el = document.getElementById('demo-caption');
    if (!el) {
      el = document.createElement('div');
      el.id = 'demo-caption';
      el.style.cssText = 'position:fixed;left:50%;top:66px;transform:translateX(-50%);max-width:1100px;'
        + 'background:rgba(15,15,20,.92);color:#fff;font:600 22px/1.4 -apple-system,Helvetica,Arial,sans-serif;'
        + 'padding:14px 22px;border-radius:12px;z-index:99999;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.35)';
      document.body.append(el);
    }
    el.textContent = t;
  }, text);
  startSpeech(clip);
}

async function card(page, title, lines, spoken) {
  await untilQuiet();
  const clip = renderSpeech(spoken);
  await page.setContent(`<!doctype html><html><body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;
    background:linear-gradient(135deg,#101425,#23306b);color:#fff;font-family:-apple-system,Helvetica,Arial,sans-serif">
    <div style="max-width:980px;padding:40px"><div style="font-size:54px;font-weight:800;letter-spacing:-0.02em;margin-bottom:18px">${title}</div>
    ${lines.map((l) => `<div style="font-size:26px;line-height:1.5;opacity:.9;margin-top:10px">${l}</div>`).join('')}</div></body></html>`);
  startSpeech(clip);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const pool = createPool(DB);

  // A host account with three machines (separate agent processes).
  const { apiKey: hostKey } = await createAccount(pool, { name: 'Demo GPU owners', kind: 'host' });
  run(['src/index.js'], { DATABASE_URL: DB, PORT: String(PORT), DEMO_CREDIT_USD: '5', LEASE_SECONDS: '15', REAPER_INTERVAL_MS: '2000', VERIFY_RATE: '0' }, 'server');
  await waitFor(() => fetch(`${BASE}/health`).then((r) => r.ok).catch(() => false), { what: 'server' });
  const agents = {};
  for (const name of ['gpu-node-1', 'gpu-node-2', 'gpu-node-3']) {
    agents[name] = run(['agent/agent.js'], {
      CD_API_URL: BASE, CD_HOST_KEY: hostKey, CD_WORKER_NAME: name, CD_VRAM_GB: '16', CD_POLL_MS: '300', CD_PYTHON: PYTHON,
    }, name);
  }
  await waitFor(async () => (await (await fetch(`${BASE}/v1/network`)).json()).workers_online.length >= 3, { what: 'agents online' });

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: SIZE, recordVideo: { dir: OUT_DIR, size: SIZE }, bypassCSP: true, colorScheme: 'light' });
  const page = await context.newPage();
  videoStart = Date.now(); // recording starts with the page

  try {
    // 1. Title
    await card(page, 'computedistribute', [
      'A marketplace for spare GPU compute.',
      'Buyers submit speech-to-text jobs. Anyone with an idle GPU runs our agent and earns 70% of every job.',
      'This demo: one recording split across three machines, and a machine crashing mid-job.',
    ], 'This is compute distribute: a marketplace for spare GPU compute. Buyers submit speech-to-text jobs, and anyone with an idle GPU can run our agent and earn seventy percent of every job. In this demo, we split one recording across three machines, then crash one of them mid-job.');
    await sleep(6000);

    // 2. Live network
    await page.goto(BASE);
    await page.waitForSelector('text=Live network');
    await page.waitForSelector('text=gpu-node-3');
    await caption(page, 'Three GPU machines are running our worker agent and have joined the network.', 'Three GPU machines are running our worker agent, and have joined the network.');
    await sleep(5000);

    // 3. Sign up as a buyer
    await caption(page, 'A buyer signs up and gets free demo credit. No card needed for the hackathon.', 'A buyer signs up, and gets free demo credit. No card needed for the hackathon.');
    await page.fill('#email', `judge-${Date.now()}@example.com`);
    await page.type('#password', 'distributed compute', { delay: 25 });
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=New transcription');
    await sleep(3500);

    // 4. Split one recording across three machines
    await caption(page, 'Submit the Gettysburg Address (2 min 38 s) and split it across 3 machines.', "Let's submit the Gettysburg Address, about two and a half minutes of audio, and split it across three machines.");
    await page.type('#audio', AUDIO, { delay: 4 });
    await page.selectOption('#model', 'tiny');
    await page.selectOption('#split', '3');
    await sleep(1500);
    await page.click('button:has-text("Transcribe")');
    await page.waitForSelector('text=split 3 ways');
    await page.locator('summary:has-text("Chunks by machine")').first().click();
    await page.locator('text=Your jobs').evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await page.evaluate(() => window.scrollBy(0, -70));
    await caption(page, 'The recording became 3 chunk jobs. The scheduler hands each to a different machine at once.', 'The recording became three chunk jobs. The scheduler hands each one to a different machine, at the same time.');
    await waitFor(() => page.locator('text=/Done in .* s for/').count(), { what: 'first split to finish' });
    await caption(page, 'All 3 chunks ran in parallel, one per machine. The buyer pays per second of audio.', 'All three chunks ran in parallel, one per machine. The buyer pays per second of audio.');
    await sleep(5000);
    await page.locator('summary:has-text("Merged transcript")').first().click();
    await page.locator('pre').first().evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await caption(page, 'The chunks are stitched back together in time order.', 'And the chunks are stitched back together, in time order.');
    await sleep(5000);

    // 5. Failover: kill a worker mid-job
    await page.locator('#audio').scrollIntoViewIfNeeded();
    await caption(page, 'Now the same job again, and one machine will crash in the middle of it.', 'Now, the same job again. But this time, one machine will crash in the middle of it.');
    await page.fill('#audio', AUDIO);
    await page.selectOption('#model', 'tiny');
    await page.selectOption('#split', '3');
    await page.click('button:has-text("Transcribe")');
    const victim = await waitFor(async () => {
      const { rows } = await pool.query(
        `SELECT w.name FROM jobs j JOIN workers w ON w.id = j.worker_id
         WHERE j.status = 'running' AND j.input ? 'group' ORDER BY j.started_at DESC LIMIT 1`);
      return rows[0]?.name;
    }, { everyMs: 200, what: 'a running chunk' });
    await page.locator('summary:has-text("Chunks by machine")').first().click();
    await page.locator('text=Your jobs').evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await page.evaluate(() => window.scrollBy(0, -70));
    await sleep(1200);
    agents[victim].kill('SIGKILL');
    await caption(page, `${victim} just crashed while working on a chunk.`, `${victim.replace('gpu-node-', 'GPU node ')} just crashed, while working on a chunk.`);
    await sleep(5000);
    await caption(page, 'Its lease expires after 15 seconds, and another machine picks the chunk up.', 'Its lease expires after fifteen seconds, and another machine picks the chunk up.');
    await caption(page, 'Meanwhile, the healthy machines finish their own chunks.', 'Meanwhile, the healthy machines finish their own chunks.');
    await waitFor(async () => {
      const { rows } = await pool.query(`SELECT count(*)::int AS n FROM jobs WHERE status = 'running' AND input ? 'group'`);
      return rows[0].n === 0 && (await page.locator('text=/Done in .* s for/').count()) >= 2;
    }, { timeoutMs: 120_000, what: 'failover run to finish' });
    await sleep(1500);
    await caption(page, 'Finished anyway: the crashed chunk was retried on another machine, and the buyer paid nothing extra.', 'Finished anyway. The crashed chunk was retried on another machine, and the buyer paid nothing extra.');
    await sleep(7000);

    // 6. Close
    await card(page, 'Distributed by design', [
      '• Atomic job claims: many machines, no job ever runs twice at once',
      '• Leases and heartbeats: crashed machines lose their work to healthy ones',
      '• Spot-check re-runs on a different owner\'s machine catch cheating hosts',
      '• Per-second billing in a ledger; hosts earn 70%',
      '<br>computedistribute-7e117eb4.apps.lingcode.app',
    ], 'Compute distribute is distributed by design. Atomic job claims mean no job ever runs twice at once. Leases and heartbeats move work off crashed machines. Spot-check re-runs catch cheating hosts. And every second is billed through a ledger, with hosts earning seventy percent.');
    await untilQuiet(2000);
  } finally {
    const video = page.video();
    await context.close();
    await browser.close();
    const webm = await video.path();
    const mp4 = path.join(OUT_DIR, 'computedistribute-demo.mp4');
    const ffmpeg = execFileSync(PYTHON, ['-c', 'import imageio_ffmpeg as f; print(f.get_ffmpeg_exe())']).toString().trim();
    // Each narration clip is delayed to the moment its caption appeared, then mixed.
    // Skip the blank frames before the title card appeared (first line rendering).
    const trimMs = Math.max(0, (clips[0]?.atMs ?? 0) - 300);
    const inputs = clips.flatMap((c) => ['-i', c.file]);
    const delays = clips.map((c, i) => `[${i + 1}:a]aresample=48000,adelay=${Math.max(0, c.atMs - trimMs)}:all=1[a${i}]`);
    const mix = `${clips.map((_, i) => `[a${i}]`).join('')}amix=inputs=${clips.length}:normalize=0:duration=longest[aout]`;
    execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', String(trimMs / 1000), '-i', webm, ...inputs,
      '-filter_complex', [...delays, mix].join(';'), '-map', '0:v', '-map', '[aout]',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', '-preset', 'medium',
      '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', mp4]);
    fs.rmSync(VOICE_DIR, { recursive: true, force: true });
    fs.rmSync(webm, { force: true });
    console.log(`Saved ${mp4}`);
    for (const c of children) c.kill('SIGKILL');
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  for (const c of children) c.kill('SIGKILL');
  process.exit(1);
});
