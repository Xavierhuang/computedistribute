// Host payout requests. Requesting a payout moves the amount out of the host's
// balance immediately; an admin then pays it (outside the app, until Stripe Connect
// is added) and marks it paid, or rejects it, which returns the money.

const { withTx, addEntry, balanceMicros, lockAccount } = require('./ledger');
const { usd } = require('./pricing');

const MIN_PAYOUT_MICROS = 10 * 1_000_000;

class PayoutError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function toPublicPayout(row) {
  return {
    id: row.id,
    amount_usd: usd(row.amount_micros),
    destination: row.destination,
    status: row.status,
    admin_note: row.admin_note,
    created_at: row.created_at,
    resolved_at: row.resolved_at,
  };
}

async function requestPayout(pool, hostId, { amountMicros, destination }) {
  return withTx(pool, async (client) => {
    const account = await lockAccount(client, hostId);
    if (account.suspended_at) throw new PayoutError('account_suspended', 'suspended accounts cannot request payouts');
    if (amountMicros < MIN_PAYOUT_MICROS) {
      throw new PayoutError('below_minimum', `the minimum payout is $${usd(MIN_PAYOUT_MICROS)}`);
    }
    const balance = await balanceMicros(client, hostId);
    if (balance < amountMicros) {
      throw new PayoutError('insufficient_balance', `your balance is $${usd(balance).toFixed(2)}`);
    }
    const { rows: [payout] } = await client.query(
      'INSERT INTO payout_requests (account_id, amount_micros, destination) VALUES ($1, $2, $3) RETURNING *',
      [hostId, amountMicros, destination],
    );
    await addEntry(client, { accountId: hostId, amountMicros: -amountMicros, kind: 'payout', ref: payout.id, memo: `Payout to ${destination}` });
    return payout;
  });
}

async function listPayouts(pool, { accountId = null, status = null, limit = 100 } = {}) {
  const { rows } = await pool.query(
    `SELECT p.*, a.name AS account_name FROM payout_requests p JOIN accounts a ON a.id = p.account_id
     WHERE ($1::uuid IS NULL OR p.account_id = $1) AND ($2::text IS NULL OR p.status = $2)
     ORDER BY p.created_at DESC LIMIT $3`,
    [accountId, status, limit],
  );
  return rows;
}

// Admin: resolve a pending payout. Rejecting returns the amount to the host.
async function resolvePayout(pool, payoutId, { status, note = null }) {
  return withTx(pool, async (client) => {
    const { rows: [payout] } = await client.query(
      `UPDATE payout_requests SET status = $2, admin_note = $3, resolved_at = now()
       WHERE id = $1 AND status = 'requested' RETURNING *`,
      [payoutId, status, note],
    );
    if (payout && status === 'rejected') {
      await addEntry(client, { accountId: payout.account_id, amountMicros: Number(payout.amount_micros), kind: 'payout_reversal', ref: payout.id, memo: note ? `Payout rejected: ${note}` : 'Payout rejected' });
    }
    return payout || null;
  });
}

module.exports = { requestPayout, listPayouts, resolvePayout, toPublicPayout, PayoutError, MIN_PAYOUT_MICROS };
