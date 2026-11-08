// Job types buyers may submit. Each validates its own input and returns an error
// message, or null when the input is acceptable. Add real workloads (transcription,
// embeddings, image generation, LLM batch) here as worker handlers are built.
const MAX_INPUT_BYTES = 64 * 1024; // larger payloads belong in file storage, referenced by URL

const jobTypes = {
  // Returns its input unchanged. Proves the claim → run → complete loop end to end.
  echo: {
    validate: () => null,
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

module.exports = { jobTypes, validateJobInput };
