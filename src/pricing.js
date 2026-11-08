// Prices in micro-dollars (1 USD = 1,000,000 µ$) so sub-cent rates stay exact integers.
const MICROS_PER_USD = 1_000_000;
const HOST_SHARE = 0.7;
const MAX_AUDIO_SECONDS = 4 * 3600;

// Per minute of audio. large-v3 at $0.004/min undercuts the main hosted APIs (~$0.006).
const TRANSCRIBE_MICROS_PER_MINUTE = { tiny: 1000, base: 1500, small: 2000, medium: 3000, 'large-v3': 4000 };
const DEFAULT_TRANSCRIBE_MODEL = 'small';

const usd = (micros) => Number(micros) / MICROS_PER_USD;

const pricing = {
  echo: {
    hold: () => 0,
    cost: () => 0,
    validateOutput: () => null,
  },
  transcribe: {
    // Reserve enough for the longest audio a host will accept (or the clip, when one is
    // given, plus 2 s of slack); the unused part is released.
    hold: (input) => Math.ceil((clipSeconds(input) ?? MAX_AUDIO_SECONDS) / 60 * rate(input)),
    cost: (input, output) => Math.ceil((Math.min(output.duration_s, MAX_AUDIO_SECONDS) / 60) * rate(input)),
    validateOutput(output) {
      if (output === null || typeof output !== 'object' || Array.isArray(output)) return 'output must be an object';
      if (typeof output.text !== 'string') return 'output.text must be a string';
      if (!Number.isFinite(output.duration_s) || output.duration_s < 0 || output.duration_s > MAX_AUDIO_SECONDS + 60) {
        return `output.duration_s must be a number between 0 and ${MAX_AUDIO_SECONDS}`;
      }
      if (!Array.isArray(output.segments)) return 'output.segments must be an array';
      return null;
    },
  },
};

function clipSeconds(input) {
  return input.clip_end_s === undefined ? null : input.clip_end_s - input.clip_start_s + 2;
}

function rate(input) {
  return TRANSCRIBE_MICROS_PER_MINUTE[input.model ?? DEFAULT_TRANSCRIBE_MODEL];
}

// Settlement for a successful job: what the buyer pays (never more than was held)
// and what the host earns.
function settle(type, input, output, holdMicros) {
  const cost = Math.min(pricing[type].cost(input, output), Number(holdMicros));
  return { costMicros: cost, hostEarningMicros: Math.floor(cost * HOST_SHARE) };
}

function publicPriceList() {
  return {
    currency: 'USD',
    host_share: HOST_SHARE,
    job_types: {
      echo: { price: 'free (for testing)' },
      transcribe: {
        unit: 'audio minute, billed per second',
        max_audio_seconds: MAX_AUDIO_SECONDS,
        per_minute_usd: Object.fromEntries(
          Object.entries(TRANSCRIBE_MICROS_PER_MINUTE).map(([m, micros]) => [m, usd(micros)]),
        ),
      },
    },
  };
}

module.exports = { pricing, settle, publicPriceList, usd, MICROS_PER_USD, HOST_SHARE, MAX_AUDIO_SECONDS };
