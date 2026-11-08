// Operator endpoints, authenticated with `Authorization: Bearer <ADMIN_TOKEN>`.
// Disabled entirely when ADMIN_TOKEN is not set.
const crypto = require('node:crypto');
const express = require('express');
const { addEntry, balanceMicros } = require('../ledger');
const { listPayouts, resolvePayout, toPublicPayout } = require('../payouts');
const { usd } = require('../pricing');
const { BadRequest, wrap, requiredString, uuidParam, centsFromUsd } = require('../http');

const digest = (s) => crypto.createHash('sha256').update(String(s)).digest();

function adminRouter({ pool, adminToken }) {
  const r = express.Router();
  r.use((req, res, next) => {
    if (!adminToken) return res.status(404).json({ error: 'not_found' });
    const match = /^Bearer\s+(\S+)$/i.exec(req.get('authorization') || '');
    if (!match || !crypto.timingSafeEqual(digest(match[1]), digest(adminToken))) {
      return res.status(401).json({ error: 'invalid_admin_token' });
    }
    next();
  });
  r.param('id', uuidParam);

  r.get('/stats', wrap(async (req, res) => {
    const { rows: [s] } = await pool.query(`SELECT
      (SELECT count(*) FROM accounts WHERE kind = 'buyer' AND NOT is_system)::int AS buyers,
      (SELECT count(*) FROM accounts WHERE kind = 'host')::int AS hosts,
      (SELECT count(*) FROM workers WHERE last_seen_at > now() - interval '2 minutes')::int AS workers_online,
      (SELECT count(*) FROM jobs WHERE status = 'queued')::int AS jobs_queued,
      (SELECT count(*) FROM jobs WHERE status = 'running')::int AS jobs_running,
      (SELECT count(*) FROM jobs WHERE status = 'succeeded' AND finished_at > now() - interval '24 hours')::int AS jobs_succeeded_24h,
      (SELECT coalesce(sum(-amount_micros), 0) FROM ledger_entries WHERE kind = 'charge')::bigint AS charged_micros,
      (SELECT coalesce(sum(amount_micros), 0) FROM ledger_entries WHERE kind = 'refund')::bigint AS refunded_micros,
      (SELECT coalesce(sum(amount_micros), 0) FROM ledger_entries WHERE kind IN ('earning', 'clawback'))::bigint AS host_earned_micros,
      (SELECT count(*) FROM verifications)::int AS verifications,
      (SELECT count(*) FROM verifications WHERE NOT passed)::int AS verifications_failed,
      (SELECT count(*) FROM payout_requests WHERE status = 'requested')::int AS payouts_pending`);
    const revenue = Number(s.charged_micros) - Number(s.refunded_micros);
    res.json({
      ...s,
      charged_micros: undefined, refunded_micros: undefined, host_earned_micros: undefined,
      buyer_revenue_usd: usd(revenue),
      host_earnings_usd: usd(s.host_earned_micros),
      platform_margin_usd: usd(revenue - Number(s.host_earned_micros)),
    });
  }));

  r.get('/accounts', wrap(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT a.id, a.name, a.kind, a.created_at, a.suspended_at, a.suspended_reason, u.email,
         coalesce((SELECT sum(amount_micros) FROM ledger_entries l WHERE l.account_id = a.id), 0)::bigint AS balance_micros
       FROM accounts a LEFT JOIN users u ON u.account_id = a.id
       WHERE NOT a.is_system ORDER BY a.created_at DESC LIMIT 500`,
    );
    res.json({ accounts: rows.map((a) => ({ ...a, balance_usd: usd(a.balance_micros), balance_micros: undefined })) });
  }));

  // Adds credit, e.g. for a customer who paid by invoice or as a goodwill credit.
  r.post('/grants', wrap(async (req, res) => {
    const accountId = req.body?.account_id;
    const cents = centsFromUsd(req.body?.amount_usd, 'amount_usd', 0.01, 10_000);
    const { rows } = await pool.query('SELECT id FROM accounts WHERE id = $1', [accountId]).catch(() => ({ rows: [] }));
    if (!rows[0]) return res.status(404).json({ error: 'account_not_found' });
    const memo = requiredString(req.body.memo ?? 'Credit grant', 'memo', 200);
    await addEntry(pool, { accountId, amountMicros: cents * 10_000, kind: 'grant', memo });
    res.status(201).json({ account_id: accountId, balance_usd: usd(await balanceMicros(pool, accountId)) });
  }));

  r.post('/accounts/:id/suspend', wrap(async (req, res) => {
    const reason = requiredString(req.body?.reason, 'reason', 200);
    const { rowCount } = await pool.query('UPDATE accounts SET suspended_at = now(), suspended_reason = $2 WHERE id = $1', [req.params.id, reason]);
    res.status(rowCount ? 200 : 404).json(rowCount ? { ok: true } : { error: 'not_found' });
  }));

  r.post('/accounts/:id/unsuspend', wrap(async (req, res) => {
    const { rowCount } = await pool.query('UPDATE accounts SET suspended_at = NULL, suspended_reason = NULL WHERE id = $1', [req.params.id]);
    res.status(rowCount ? 200 : 404).json(rowCount ? { ok: true } : { error: 'not_found' });
  }));

  r.get('/payouts', wrap(async (req, res) => {
    const status = req.query.status ?? 'requested';
    if (!['requested', 'paid', 'rejected'].includes(status)) throw new BadRequest('status must be requested, paid or rejected');
    const payouts = await listPayouts(pool, { status });
    res.json({ payouts: payouts.map((p) => ({ ...toPublicPayout(p), account_id: p.account_id, account_name: p.account_name })) });
  }));

  for (const [path, status] of [['paid', 'paid'], ['reject', 'rejected']]) {
    r.post(`/payouts/:id/${path}`, wrap(async (req, res) => {
      const note = req.body?.note === undefined ? null : requiredString(req.body.note, 'note', 500);
      const payout = await resolvePayout(pool, req.params.id, { status, note });
      if (!payout) return res.status(409).json({ error: 'not_pending' });
      res.json(toPublicPayout(payout));
    }));
  }

  return r;
}

module.exports = { adminRouter };
