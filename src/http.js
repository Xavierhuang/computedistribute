// Small helpers shared by the route modules.

class BadRequest extends Error {}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function intInRange(value, name, min, max, fallback) {
  if (value === undefined) return fallback;
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new BadRequest(`${name} must be an integer between ${min} and ${max}`);
  }
  return value;
}

function numInRange(value, name, min, max, fallback) {
  if (value === undefined) return fallback;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new BadRequest(`${name} must be a number between ${min} and ${max}`);
  }
  return value;
}

function requiredString(value, name, max) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) {
    throw new BadRequest(`${name} is required (max ${max} characters)`);
  }
  return value.trim();
}

// Router.param handler: malformed ids read as "not found" rather than a database error.
function uuidParam(req, res, next, id) {
  if (!UUID_RE.test(id)) return res.status(404).json({ error: 'not_found' });
  next();
}

// A dollar amount with at most two decimals → integer cents. Tolerates float
// representation (0.29 * 100 === 28.999999999999996).
function centsFromUsd(value, name, min, max) {
  const cents = typeof value === 'number' ? Math.round(value * 100) : NaN;
  if (!Number.isFinite(value) || Math.abs(cents - value * 100) > 1e-6 || value < min || value > max) {
    throw new BadRequest(`${name} must be between ${min} and ${max}, in dollars and cents`);
  }
  return cents;
}

module.exports = { BadRequest, wrap, intInRange, numInRange, requiredString, uuidParam, centsFromUsd };
