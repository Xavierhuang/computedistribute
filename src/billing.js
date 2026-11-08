// Buyer top-ups through Stripe Checkout, plus admin credit grants.
// Stripe is optional: without STRIPE_SECRET_KEY, top-ups are disabled and admins
// can still grant credit (e.g. for customers paying by invoice).

const Stripe = require('stripe');
const { addEntry } = require('./ledger');

const CENTS_TO_MICROS = 10_000;

function createStripeBilling({ secretKey, webhookSecret, publicUrl }) {
  if (!secretKey || !webhookSecret) return null;
  const stripe = new Stripe(secretKey);
  return {
    async createTopupSession({ account, email, amountCents }) {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: { name: 'computedistribute compute credits' },
          },
        }],
        client_reference_id: account.id,
        metadata: { account_id: account.id },
        customer_email: email || undefined,
        success_url: `${publicUrl}/?topup=success`,
        cancel_url: `${publicUrl}/?topup=canceled`,
      });
      return session.url;
    },
    // Throws if the signature doesn't match the raw request body.
    parseWebhook(rawBody, signature) {
      return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    },
  };
}

// Credits a paid Checkout session exactly once (keyed by the session id).
// Returns 'credited' | 'duplicate' | 'ignored'.
async function handleStripeEvent(pool, event) {
  const paidTypes = ['checkout.session.completed', 'checkout.session.async_payment_succeeded'];
  if (!paidTypes.includes(event.type)) return 'ignored';
  const session = event.data.object;
  if (session.payment_status !== 'paid' || session.currency !== 'usd') return 'ignored';
  const accountId = session.metadata?.account_id;
  const { rows } = await pool.query('SELECT id FROM accounts WHERE id = $1', [accountId]);
  if (!rows[0]) return 'ignored';
  const added = await addEntry(pool, {
    accountId,
    amountMicros: session.amount_total * CENTS_TO_MICROS,
    kind: 'topup',
    ref: session.id,
    memo: 'Card top-up',
  });
  return added ? 'credited' : 'duplicate';
}

module.exports = { createStripeBilling, handleStripeEvent };
