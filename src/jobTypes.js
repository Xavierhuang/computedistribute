// Job types buyers may submit. Each validates its own input (returning an error
// message, or null when acceptable) and may derive a default minimum VRAM.
const net = require('node:net');

const MAX_INPUT_BYTES = 64 * 1024; // larger payloads belong in file storage, referenced by URL

// Approximate GPU memory each Whisper model needs (GB), used as the default min_vram_gb.
const WHISPER_MODELS = { tiny: 1, base: 1, small: 2, medium: 5, 'large-v3': 10 };
const DEFAULT_WHISPER_MODEL = 'small';

function onlyKeys(input, allowed) {
  const extra = Object.keys(input).filter((k) => !allowed.includes(k));
  return extra.length ? `unknown input field(s): ${extra.join(', ')} (allowed: ${allowed.join(', ')})` : null;
}

// Cheap early rejection of URLs that obviously point at private hosts. The worker
// agent re-checks the resolved IP before connecting; that check is the real guard.
function publicHttpUrlProblem(value, field) {
  if (typeof value !== 'string' || value.length > 2048) return `${field} must be a URL string (max 2048 chars)`;
  let url;
  try {
    url = new URL(value);
  } catch {
    return `${field} is not a valid URL`;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return `${field} must use http or https`;
  if (url.username || url.password) return `${field} must not contain credentials`;
  const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    return `${field} must point at a public host`;
  }
  if (net.isIP(host)) return `${field} must use a hostname, not an IP address`;
  return null;
}

const jobTypes = {
  // Returns its input unchanged. Proves the claim → run → complete loop end to end.
  echo: {
    validate: () => null,
  },

  // Speech-to-text with Whisper. Output: { text, language, duration_s, segments[] }.
  transcribe: {
    validate(input) {
      return onlyKeys(input, ['audio_url', 'model', 'language', 'task'])
        || publicHttpUrlProblem(input.audio_url, 'audio_url')
        || (input.model !== undefined && !Object.hasOwn(WHISPER_MODELS, input.model)
          ? `model must be one of: ${Object.keys(WHISPER_MODELS).join(', ')}` : null)
        || (input.language !== undefined && !/^[a-z]{2,3}$/.test(input.language)
          ? 'language must be an ISO 639-1 code such as "en" (omit to auto-detect)' : null)
        || (input.task !== undefined && !['transcribe', 'translate'].includes(input.task)
          ? 'task must be "transcribe" or "translate" (translate outputs English)' : null);
    },
    defaultMinVramGb: (input) => WHISPER_MODELS[input.model ?? DEFAULT_WHISPER_MODEL],
  },
};

function validateJobInput(type, input) {
  const def = Object.hasOwn(jobTypes, type) ? jobTypes[type] : null;
  if (!def) return `unknown job type "${type}" (supported: ${Object.keys(jobTypes).join(', ')})`;
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    return 'input must be a JSON object';
  }
  if (Buffer.byteLength(JSON.stringify(input)) > MAX_INPUT_BYTES) {
    return `input exceeds ${MAX_INPUT_BYTES} bytes; upload large data to storage and pass a URL`;
  }
  return def.validate(input);
}

// The buyer's explicit min_vram_gb wins; otherwise the job type may supply one.
function defaultMinVramGb(type, input) {
  return jobTypes[type].defaultMinVramGb?.(input) ?? 0;
}

module.exports = { jobTypes, validateJobInput, defaultMinVramGb, WHISPER_MODELS, DEFAULT_WHISPER_MODEL };
