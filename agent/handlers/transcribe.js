const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { download, JobError } = require('../net');

const SCRIPT = path.join(__dirname, 'transcribe.py');

// Runs a Python process, resolving with stdout. Killed if `signal` aborts.
function runPython(python, args, { signal }) {
  return new Promise((resolve, reject) => {
    const child = spawn(python, args, { stdio: ['ignore', 'pipe', 'pipe'], signal, killSignal: 'SIGKILL' });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr = (stderr + d).slice(-4000); });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) return resolve(stdout);
      const lastLine = stderr.trim().split('\n').pop() || `exit code ${code}`;
      // Exit 3 = the input itself is unacceptable. Other failures are usually
      // environmental (OOM, missing CUDA), so another host may succeed.
      reject(new JobError(`whisper failed: ${lastLine}`, { retryable: code !== 3 }));
    });
  });
}

// Python with faster-whisper installed; returns true when it imports cleanly.
async function isAvailable(python) {
  try {
    await runPython(python, ['-c', 'import faster_whisper'], {});
    return true;
  } catch {
    return false;
  }
}

function createTranscribeHandler({ python, maxBytes, allowPrivateUrls = false, device = 'auto' }) {
  return async function transcribe(input, { signal }) {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'cd-transcribe-'));
    try {
      const audioPath = path.join(dir, 'audio');
      await download(input.audio_url, audioPath, { maxBytes, allowPrivate: allowPrivateUrls, signal });
      const args = [SCRIPT, audioPath, '--model', input.model ?? 'small', '--task', input.task ?? 'transcribe', '--device', device];
      if (input.language) args.push('--language', input.language);
      const stdout = await runPython(python, args, { signal });
      try {
        return JSON.parse(stdout);
      } catch {
        throw new JobError('whisper produced unreadable output', { retryable: true });
      }
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  };
}

module.exports = { createTranscribeHandler, isAvailable };
