// computedistribute dashboard. Plain DOM, no framework. All server data is inserted
// as text (never HTML): transcripts come from third-party hosts and are untrusted.
'use strict';

const $app = document.getElementById('app');
const $nav = document.getElementById('nav');
const $toast = document.getElementById('toast');
let pollTimer = null;

// ---------- helpers ----------

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v == null) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) if (c != null && c !== false) el.append(c instanceof Node ? c : String(c));
  return el;
}

async function api(method, path, body) {
  const res = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: body === undefined ? {} : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = res.status === 204 ? null : await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data?.message || data?.error || `HTTP ${res.status}`), { status: res.status, data });
  return data;
}

function toast(msg) {
  $toast.textContent = msg;
  $toast.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => { $toast.hidden = true; }, 4000);
}

const money = (n, digits = 2) => `$${Number(n).toFixed(digits)}`;
const fineMoney = (n) => (n === null || n === undefined ? '—' : n < 0.01 && n > 0 ? `$${Number(n).toFixed(4)}` : money(n));
const when = (t) => (t ? new Date(t).toLocaleString() : '—');
const pill = (status) => h('span', { class: `pill s-${status}` }, status);

function form(onSubmit, ...children) {
  return h('form', {
    onsubmit: async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      try { await onSubmit(new FormData(e.target), e.target); } catch (err) { toast(err.message); } finally { if (btn) btn.disabled = false; }
    },
  }, ...children);
}

function field(label, input) {
  return [h('label', { for: input.id }, label), input];
}

// ---------- live network ----------

let netTimer = null;
let lastNetwork = null;

// Machines online and job flow, refreshed every 3 s. One timer for the whole page.
function networkCard() {
  clearInterval(netTimer);
  const body = h('div', {}, h('p', { class: 'muted small' }, 'Loading…'));
  const card = h('div', { class: 'card' }, h('h2', {}, 'Live network'), body);
  function paint(n) {
      body.replaceChildren(
        h('div', { class: 'row' },
          h('span', { class: 'big' }, String(n.workers_online.length)), h('span', { class: 'muted' }, 'machines online ·'),
          h('strong', {}, String(n.running)), h('span', { class: 'muted' }, 'running ·'),
          h('strong', {}, String(n.queued)), h('span', { class: 'muted' }, 'queued ·'),
          h('strong', {}, String(n.done_last_10_min)), h('span', { class: 'muted' }, `done in 10 min (${Math.round(n.audio_seconds_last_10_min / 60)} min of audio)`)),
        n.workers_online.length
          ? h('table', {}, h('tr', {}, h('th', {}, 'Machine'), h('th', {}, 'Now'), h('th', { class: 'num' }, 'VRAM'), h('th', { class: 'num' }, 'Jobs (1 h)')),
            ...n.workers_online.map((w) => h('tr', {}, h('td', {}, w.name), h('td', {}, pill(w.running ? 'running' : 'online')),
              h('td', { class: 'num' }, `${w.vram_gb} GB`), h('td', { class: 'num' }, w.done_last_hour))))
          : h('p', { class: 'muted small' }, 'No machines online right now.'));
  }
  async function refresh() {
    if (!card.isConnected && netTimer) return clearInterval(netTimer);
    try { lastNetwork = await api('GET', '/v1/network'); paint(lastNetwork); } catch { /* keep the last view */ }
  }
  if (lastNetwork) paint(lastNetwork);
  refresh();
  netTimer = setInterval(refresh, 3000);
  return card;
}

// ---------- signed out ----------

function renderAuth(mode = 'signup') {
  $nav.replaceChildren(h('a', { href: '/v1/pricing' }, 'Pricing (JSON)'));
  const tabs = h('div', { class: 'tabs' },
    h('button', { type: 'button', 'aria-pressed': String(mode === 'signup'), onclick: () => renderAuth('signup') }, 'Create account'),
    h('button', { type: 'button', 'aria-pressed': String(mode === 'login'), onclick: () => renderAuth('login') }, 'Sign in'));

  const email = h('input', { id: 'email', name: 'email', type: 'email', autocomplete: 'email', required: true });
  const password = h('input', { id: 'password', name: 'password', type: 'password', minlength: '10', autocomplete: mode === 'login' ? 'current-password' : 'new-password', required: true });
  const kind = h('select', { id: 'kind', name: 'kind' },
    h('option', { value: 'buyer' }, 'I want to run jobs (buyer)'),
    h('option', { value: 'host' }, 'I want to earn from my GPU (host)'));

  const f = form(async (data) => {
    const body = { email: data.get('email'), password: data.get('password') };
    if (mode === 'signup') await api('POST', '/v1/auth/signup', { ...body, kind: data.get('kind') });
    else await api('POST', '/v1/auth/login', body);
    await boot();
  },
  ...field('Email', email),
  ...field(mode === 'signup' ? 'Password (10+ characters)' : 'Password', password),
  ...(mode === 'signup' ? field('Account type', kind) : []),
  h('div', { class: 'row' }, h('button', { class: 'primary', type: 'submit' }, mode === 'signup' ? 'Create account' : 'Sign in')));

  $app.replaceChildren(
    h('section', { class: 'hero' },
      h('h1', {}, 'Speech-to-text on spare GPUs'),
      h('p', { class: 'muted' }, 'Whisper transcription from $0.001 per audio minute, billed per second. Have an idle GPU? Run our agent and earn 70% of every job it completes.')),
    h('div', { class: 'card auth' }, tabs, f),
    networkCard());
}

// ---------- shared panels ----------

function balanceCard(me) {
  const card = h('div', { class: 'card' },
    h('h2', {}, me.account.kind === 'host' ? 'Earnings balance' : 'Credit balance'),
    h('div', { class: 'big' }, fineMoney(me.balance_usd)));
  if (me.account.kind === 'buyer') {
    if (me.topups_enabled) {
      card.append(h('div', { class: 'row' }, ...[10, 25, 100].map((amt) =>
        h('button', { onclick: async (e) => {
          e.target.disabled = true;
          try { location.href = (await api('POST', '/v1/me/topups', { amount_usd: amt })).checkout_url; } catch (err) { toast(err.message); e.target.disabled = false; }
        } }, `Add ${money(amt, 0)}`))));
    } else if (me.demo_credit_usd > 0) {
      card.append(h('p', { class: 'muted small' }, 'Demo mode: credit is free.'),
        h('div', { class: 'row' }, h('button', { onclick: async (e) => {
          e.target.disabled = true;
          try { await api('POST', '/v1/me/demo-credit', {}); toast('Demo credit added.'); render(); } catch (err) { toast(err.message); e.target.disabled = false; }
        } }, `Add ${money(me.demo_credit_usd, 0)} demo credit`)));
    } else {
      card.append(h('p', { class: 'muted small' }, 'Card top-ups are not enabled yet. Contact us to add credit.'));
    }
  }
  return card;
}

async function apiKeysCard(me) {
  const card = h('div', { class: 'card' }, h('h2', {}, 'API keys'));
  const list = h('div');
  const revealed = h('div');
  async function refresh() {
    const { keys } = await api('GET', '/v1/me/api-keys');
    list.replaceChildren(keys.length
      ? h('table', {}, h('tr', {}, h('th', {}, 'Name'), h('th', {}, 'Key'), h('th', {}, 'Last used'), h('th')),
        ...keys.map((k) => h('tr', {}, h('td', {}, k.name || '—'), h('td', {}, h('code', {}, `${k.key_prefix}…`)), h('td', {}, when(k.last_used_at)),
          h('td', { class: 'num' }, h('button', { class: 'danger', onclick: async () => {
            if (!confirm(`Revoke key "${k.name}"? Anything using it stops working.`)) return;
            await api('DELETE', `/v1/me/api-keys/${k.id}`); refresh();
          } }, 'Revoke')))))
      : h('p', { class: 'muted small' }, 'No keys yet.'));
  }
  const name = h('input', { id: 'keyname', name: 'name', placeholder: me.account.kind === 'host' ? 'e.g. gaming-pc' : 'e.g. production', maxlength: '100' });
  card.append(list, form(async (data, el) => {
    const k = await api('POST', '/v1/me/api-keys', { name: data.get('name') || 'key' });
    revealed.replaceChildren(h('div', { class: 'secret' }, h('strong', {}, 'Copy this key now. It will not be shown again: '), h('code', {}, k.api_key)));
    el.reset(); refresh();
  }, ...field('New key name', name), h('div', { class: 'row' }, h('button', { type: 'submit' }, 'Create key'))), revealed);
  await refresh();
  return card;
}

async function ledgerCard() {
  const { entries } = await api('GET', '/v1/me/ledger');
  return h('div', { class: 'card' }, h('h2', {}, 'Activity'),
    entries.length
      ? h('table', {}, h('tr', {}, h('th', {}, 'When'), h('th', {}, 'Type'), h('th', {}, 'Details'), h('th', { class: 'num' }, 'Amount')),
        ...entries.slice(0, 30).map((e) => h('tr', {}, h('td', {}, when(e.created_at)), h('td', {}, e.kind), h('td', { class: 'muted' }, e.memo || ''),
          h('td', { class: 'num' }, (e.amount_usd > 0 ? '+' : '') + fineMoney(e.amount_usd)))))
      : h('p', { class: 'muted small' }, 'Nothing yet.'));
}

function dangerCard() {
  const pw = h('input', { id: 'delpw', name: 'password', type: 'password', autocomplete: 'current-password', required: true });
  return h('div', { class: 'card' }, h('h2', {}, 'Delete account'),
    h('p', { class: 'muted small' }, 'Permanently deletes your account, API keys, jobs, workers and any remaining balance. This cannot be undone.'),
    form(async (data) => {
      if (!confirm('Delete your account permanently?')) return;
      await api('DELETE', '/v1/me', { password: data.get('password') });
      toast('Account deleted.');
      renderAuth('signup');
    }, ...field('Confirm with your password', pw), h('div', { class: 'row' }, h('button', { class: 'danger', type: 'submit' }, 'Delete my account'))));
}

// ---------- buyer ----------

async function buyerView(me) {
  const pricing = await api('GET', '/v1/pricing');
  const rates = pricing.job_types.transcribe.per_minute_usd;

  const url = h('input', { id: 'audio', name: 'audio_url', type: 'url', placeholder: 'https://example.com/interview.mp3', required: true });
  const model = h('select', { id: 'model', name: 'model' }, ...Object.entries(rates).map(([m, r]) =>
    h('option', { value: m, selected: m === 'small' }, `${m}: $${r}/min`)));
  const lang = h('input', { id: 'lang', name: 'language', placeholder: 'auto-detect (or e.g. en, es, ja)', maxlength: '3' });
  const translate = h('input', { id: 'translate', name: 'translate', type: 'checkbox' });
  const split = h('select', { id: 'split', name: 'split' }, ...[1, 2, 3, 4, 6, 8].map((n) =>
    h('option', { value: String(n) }, n === 1 ? '1 machine (whole file)' : `${n} machines in parallel`)));

  const submitCard = h('div', { class: 'card' }, h('h2', {}, 'New transcription'),
    form(async (data, el) => {
      const base = { audio_url: data.get('audio_url'), model: data.get('model') };
      if (data.get('language')) base.language = String(data.get('language')).toLowerCase();
      if (data.get('translate')) base.task = 'translate';
      const n = Number(data.get('split'));
      if (n === 1) {
        await api('POST', '/v1/jobs', { type: 'transcribe', input: base });
      } else {
        // Map step: cut the recording into n time ranges; each becomes its own job,
        // so the scheduler hands them to different machines at the same time.
        const duration = await audioDuration(base.audio_url);
        const group = `g${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
        const step = duration / n;
        await Promise.all(Array.from({ length: n }, (_, i) => api('POST', '/v1/jobs', { type: 'transcribe', input: {
          ...base, group,
          clip_start_s: Math.round(i * step * 100) / 100,
          clip_end_s: i === n - 1 ? Math.round(duration * 100) / 100 : Math.round((i + 1) * step * 100) / 100,
        } })));
      }
      el.reset(); toast(n === 1 ? 'Job submitted.' : `Split into ${n} chunks.`); render();
    },
    ...field('Audio URL (public link to an audio or video file)', url),
    ...field('Model', model),
    ...field('Split across', split),
    ...field('Language', lang),
    h('label', { class: 'check' }, translate, 'Translate to English'),
    h('p', { class: 'muted small' }, 'We hold the cost of 4 hours of audio while the job runs, then charge only for the actual length.'),
    h('div', { class: 'row' }, h('button', { class: 'primary', type: 'submit' }, 'Transcribe'))));

  const { jobs } = await api('GET', '/v1/jobs?limit=100');
  const jobsCard = h('div', { class: 'card' }, h('h2', {}, 'Your jobs'),
    jobs.length ? h('table', {}, h('tr', {}, h('th', {}, 'Submitted'), h('th', {}, 'Type'), h('th', {}, 'Status'), h('th', { class: 'num' }, 'Cost'), h('th', {}, 'Result')),
      ...groupJobs(jobs).map((item) => (item.group ? groupRow(item) : h('tr', {},
        h('td', {}, when(item.created_at)),
        h('td', {}, item.type, item.input?.model ? h('div', { class: 'muted small' }, item.input.model) : null),
        h('td', {}, pill(item.status), item.worker_name ? h('div', { class: 'muted small' }, `on ${item.worker_name}`) : null,
          item.attempts > 1 ? h('div', { class: 'muted small' }, `attempt ${item.attempts}`) : null),
        h('td', { class: 'num' }, fineMoney(item.cost_usd)),
        h('td', {}, jobResult(item))))))
      : h('p', { class: 'muted small' }, 'No jobs yet. Submit one above or through the API.'));

  const apiCard = h('div', { class: 'card' }, h('h2', {}, 'Use the API'),
    h('pre', {}, `curl -X POST ${location.origin}/v1/jobs \\\n  -H "authorization: Bearer <your API key>" \\\n  -H "content-type: application/json" \\\n  -d '{"type":"transcribe","input":{"audio_url":"https://…/audio.mp3","model":"small"}}'\n\ncurl ${location.origin}/v1/jobs/<job id> -H "authorization: Bearer <your API key>"`));

  if (jobs.some((j) => j.status === 'queued' || j.status === 'running')) pollTimer = setTimeout(render, 2000);
  return [h('div', { class: 'grid' }, balanceCard(me), submitCard), networkCard(), jobsCard, h('div', { class: 'grid' }, await apiKeysCard(me), apiCard), await ledgerCard(), dangerCard()];
}

// Reads an audio file's length in the browser (metadata only, no full download).
function audioDuration(url) {
  return new Promise((resolve, reject) => {
    const a = new Audio();
    const fail = (msg) => { clearTimeout(timer); a.src = ''; reject(new Error(msg)); };
    const timer = setTimeout(() => fail('Timed out reading the audio length. Try "1 machine".'), 15000);
    a.preload = 'metadata';
    a.onloadedmetadata = () => {
      clearTimeout(timer);
      if (Number.isFinite(a.duration) && a.duration > 0) resolve(a.duration);
      else fail('Could not read the audio length. Try "1 machine".');
    };
    a.onerror = () => fail('The browser could not open this audio to measure it. Try "1 machine".');
    a.src = url;
  });
}

// Collapses chunk jobs that share input.group into one item, keeping list order.
function groupJobs(jobs) {
  const out = [];
  const groups = new Map();
  for (const j of jobs) {
    const g = j.input?.group;
    if (!g) { out.push(j); continue; }
    if (!groups.has(g)) { const item = { group: g, chunks: [] }; groups.set(g, item); out.push(item); }
    groups.get(g).chunks.push(j);
  }
  return out;
}

// Reduce step: shows progress across machines and the transcript stitched in time order.
function groupRow({ chunks }) {
  chunks.sort((a, b) => a.input.clip_start_s - b.input.clip_start_s);
  const done = chunks.filter((c) => c.status === 'succeeded');
  const machines = [...new Set(chunks.map((c) => c.worker_name).filter(Boolean))];
  const allDone = done.length === chunks.length;
  const failed = chunks.some((c) => c.status === 'failed' || c.status === 'canceled');
  const created = Math.min(...chunks.map((c) => new Date(c.created_at)));
  const finished = allDone ? Math.max(...chunks.map((c) => new Date(c.finished_at))) : null;
  const audio = chunks[chunks.length - 1].input.clip_end_s;
  const cost = done.reduce((s, c) => s + (c.cost_usd || 0), 0);
  const status = failed ? 'failed' : allDone ? 'succeeded' : 'running';

  const perChunk = h('table', {}, h('tr', {}, h('th', {}, 'Chunk'), h('th', {}, 'Machine'), h('th', {}, 'Status'), h('th', { class: 'num' }, 'Took')),
    ...chunks.map((c, i) => h('tr', {},
      h('td', {}, `#${i + 1} ${c.input.clip_start_s.toFixed(0)}–${c.input.clip_end_s.toFixed(0)} s`),
      h('td', {}, c.worker_name || '—', c.attempts > 1 ? h('div', { class: 'muted small' }, `retried (attempt ${c.attempts})`) : null),
      h('td', {}, pill(c.status)),
      h('td', { class: 'num' }, c.started_at && c.finished_at ? `${((new Date(c.finished_at) - new Date(c.started_at)) / 1000).toFixed(1)} s` : '—'))));
  const merged = done.length ? chunks.map((c) => c.output?.text || '…').join(' ') : '';

  return h('tr', {},
    h('td', {}, when(chunks[0].created_at)),
    h('td', {}, 'transcribe', h('div', { class: 'muted small' }, `split ${chunks.length} ways · ${chunks[0].input.model ?? 'small'}`)),
    h('td', {}, pill(status), h('div', { class: 'muted small' }, `${done.length}/${chunks.length} chunks · ${machines.length} machine${machines.length === 1 ? '' : 's'}`)),
    h('td', { class: 'num' }, fineMoney(cost)),
    h('td', {},
      h('div', { class: 'small' }, finished ? `Done in ${((finished - created) / 1000).toFixed(1)} s for ${Math.round(audio)} s of audio` : 'Working…'),
      h('details', { 'data-key': `${chunks[0].input.group}-chunks` }, h('summary', {}, 'Chunks by machine'), perChunk),
      merged ? h('details', { 'data-key': `${chunks[0].input.group}-merged` }, h('summary', {}, allDone ? 'Merged transcript' : 'Partial transcript'), h('pre', {}, merged),
        h('button', { onclick: () => navigator.clipboard.writeText(merged).then(() => toast('Copied.')) }, 'Copy')) : null));
}

function jobResult(j) {
  if (j.status === 'succeeded' && j.output) {
    const text = typeof j.output.text === 'string' ? j.output.text : JSON.stringify(j.output, null, 2);
    const meta = j.output.duration_s != null ? `${Math.round(j.output.duration_s)} s · ${j.output.language ?? ''}` : '';
    return h('details', { 'data-key': `${j.id}-out` }, h('summary', {}, meta ? `Show transcript (${meta})` : 'Show output'),
      h('pre', {}, text),
      h('button', { onclick: () => navigator.clipboard.writeText(text).then(() => toast('Copied.')) }, 'Copy'));
  }
  if (j.status === 'failed') return h('span', { class: 'muted small' }, j.error || 'failed');
  if (j.status === 'queued' || j.status === 'running') {
    return h('button', { onclick: async () => { await api('POST', `/v1/jobs/${j.id}/cancel`, {}); render(); } }, 'Cancel');
  }
  return '';
}

// ---------- host ----------

async function hostView(me) {
  const [{ workers }, { payouts }] = await Promise.all([api('GET', '/v1/me/workers'), api('GET', '/v1/me/payouts')]);
  const online = (w) => w.last_seen_at && Date.now() - new Date(w.last_seen_at) < 2 * 60_000;

  const amount = h('input', { id: 'amt', name: 'amount_usd', type: 'number', min: '10', step: '0.01', required: true });
  const dest = h('input', { id: 'dest', name: 'destination', placeholder: 'PayPal email or Wise details', maxlength: '200', required: true });
  const payoutCard = h('div', { class: 'card' }, h('h2', {}, 'Withdraw'),
    h('p', { class: 'muted small' }, 'Minimum $10. Payouts are sent manually, usually within 3 business days.'),
    form(async (data) => {
      await api('POST', '/v1/me/payouts', { amount_usd: Number(data.get('amount_usd')), destination: data.get('destination') });
      toast('Payout requested.'); render();
    }, ...field('Amount (USD)', amount), ...field('Send to', dest), h('div', { class: 'row' }, h('button', { class: 'primary', type: 'submit', disabled: me.account.suspended }, 'Request payout'))));

  const workersCard = h('div', { class: 'card' }, h('h2', {}, 'Your machines'),
    workers.length ? h('table', {}, h('tr', {}, h('th', {}, 'Name'), h('th', {}, 'Status'), h('th', {}, 'Job types'), h('th', { class: 'num' }, 'VRAM'), h('th', { class: 'num' }, 'Jobs done'), h('th', { class: 'num' }, 'Earned')),
      ...workers.map((w) => h('tr', {}, h('td', {}, w.name), h('td', {}, pill(online(w) ? 'online' : 'offline'), h('div', { class: 'muted small' }, `seen ${when(w.last_seen_at)}`)),
        h('td', {}, w.job_types.join(', ')), h('td', { class: 'num' }, `${w.vram_gb} GB`), h('td', { class: 'num' }, w.jobs_succeeded), h('td', { class: 'num' }, fineMoney(w.earned_usd)))))
      : h('p', { class: 'muted small' }, 'No machines yet. Follow the setup steps below.'));

  const setupCard = h('div', { class: 'card' }, h('h2', {}, 'Connect a machine'),
    h('p', { class: 'small' }, '1. Create an API key below. 2. On the machine with the GPU (Node 22+, Python 3.12):'),
    h('pre', {}, `git clone <this repo> && cd computedistribute && npm install\nuv venv --python 3.12 ~/.cd-venv && uv pip install --python ~/.cd-venv/bin/python -r agent/requirements.txt\n\nCD_API_URL=${location.origin} \\\nCD_HOST_KEY=<your host API key> \\\nCD_PYTHON=~/.cd-venv/bin/python \\\nCD_VRAM_GB=24 \\\nnpm run agent`),
    h('p', { class: 'muted small' }, 'About 5% of jobs are re-run on another machine to check results. Machines that return wrong results lose that job’s earnings, and repeated failures suspend the account.'));

  const payoutsCard = h('div', { class: 'card' }, h('h2', {}, 'Payouts'),
    payouts.length ? h('table', {}, h('tr', {}, h('th', {}, 'Requested'), h('th', {}, 'To'), h('th', {}, 'Status'), h('th', { class: 'num' }, 'Amount')),
      ...payouts.map((p) => h('tr', {}, h('td', {}, when(p.created_at)), h('td', {}, p.destination), h('td', {}, pill(p.status), p.admin_note ? h('div', { class: 'muted small' }, p.admin_note) : null), h('td', { class: 'num' }, money(p.amount_usd)))))
      : h('p', { class: 'muted small' }, 'No payouts yet.'));

  return [h('div', { class: 'grid' }, balanceCard(me), payoutCard), networkCard(), workersCard, h('div', { class: 'grid' }, setupCard, await apiKeysCard(me)), payoutsCard, await ledgerCard(), dangerCard()];
}

// ---------- shell ----------

async function render() {
  clearTimeout(pollTimer);
  let me;
  try {
    me = await api('GET', '/v1/me');
  } catch (err) {
    if (err.status === 401) return renderAuth(new URLSearchParams(location.search).has('login') ? 'login' : 'signup');
    throw err;
  }
  $nav.replaceChildren(
    h('span', {}, me.email || me.account.name), h('span', { class: 'pill' }, me.account.kind),
    h('button', { onclick: async () => { await api('POST', '/v1/auth/logout', {}); renderAuth('login'); } }, 'Sign out'));

  const banners = [];
  const params = new URLSearchParams(location.search);
  if (params.get('topup') === 'success') banners.push(h('div', { class: 'banner ok' }, 'Payment received. Credit appears within a minute.'));
  if (params.get('topup') === 'canceled') banners.push(h('div', { class: 'banner' }, 'Top-up canceled.'));
  if (me.account.suspended) banners.push(h('div', { class: 'banner bad' }, `This account is suspended: ${me.account.suspended_reason || 'contact support'}.`));

  const body = me.account.kind === 'host' ? await hostView(me) : await buyerView(me);
  // Re-rendering replaces the page; keep the reader's place and any sections they opened.
  const scrollY = window.scrollY;
  const open = new Set([...document.querySelectorAll('details[open][data-key]')].map((d) => d.dataset.key));
  $app.replaceChildren(...banners, ...body);
  for (const d of document.querySelectorAll('details[data-key]')) if (open.has(d.dataset.key)) d.open = true;
  window.scrollTo(0, scrollY);
}

async function boot() {
  try { await render(); } catch (err) { $app.replaceChildren(h('div', { class: 'banner bad' }, `Something went wrong: ${err.message}`)); }
}

boot();
