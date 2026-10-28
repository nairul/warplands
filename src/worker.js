export { Room } from './room.js';

/* Room codes avoid look-alike characters (0/O, 1/I/L). */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(5)), b => ALPHABET[b % ALPHABET.length]).join('');
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

const LOG_REPO = 'nairul/warplands-logs';
const MAX_LOG = 400_000;               /* bytes; a normal game log is ~30-100 KB */
const recent = new Map();              /* ip -> recent upload times (per Worker instance) */

const GH = token => ({ authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28', 'user-agent': 'warplands-worker' });
let lastUpload = null;  /* result of the most recent upload attempt (per Worker instance) */

async function logStatus(env) {
  const out = { tokenSet: !!env.GITHUB_LOGS_TOKEN, repo: LOG_REPO, lastUpload };
  if (!out.tokenSet) return json({ ...out, verdict: 'The GITHUB_LOGS_TOKEN secret is missing on this Worker.' });
  const r = await fetch(`https://api.github.com/repos/${LOG_REPO}`, { headers: GH(env.GITHUB_LOGS_TOKEN) });
  out.githubStatus = r.status;
  if (r.ok) { const j = await r.json(); out.canWrite = !!(j.permissions && j.permissions.push); }
  out.verdict = r.status === 401 ? 'GitHub rejected the token (wrong, revoked or expired).'
    : r.status === 404 ? 'The token cannot see the warplands-logs repo (repo not selected for this token, or wrong name/owner).'
    : !r.ok ? `GitHub answered ${r.status}.`
    : out.canWrite ? 'All good: the token can write to the logs repo.'
    : 'The token can read the repo but not write: set Contents to "Read and write".';
  return json(out);
}

async function saveLog(request, env, ctx) {
  if (!env.GITHUB_LOGS_TOKEN) return json({ error: 'Logging is not configured' }, 503);
  const len = +request.headers.get('content-length') || 0;
  if (len > MAX_LOG) return json({ error: 'Too large' }, 413);
  /* at most 6 uploads per 10 minutes from one address (a game takes far longer than that) */
  const ip = request.headers.get('cf-connecting-ip') || 'unknown', now = Date.now();
  const times = (recent.get(ip) || []).filter(t => now - t < 600_000);
  if (times.length >= 6) return json({ error: 'Slow down' }, 429);
  times.push(now); recent.set(ip, times);
  let text;
  try { text = await request.text(); } catch (e) { return json({ error: 'Bad request' }, 400); }
  if (text.length > MAX_LOG) return json({ error: 'Too large' }, 413);
  let log;
  try { log = JSON.parse(text); } catch (e) { return json({ error: 'Not JSON' }, 400); }
  if (!log || log.v !== 1 || log.mode !== 'ai' || !Array.isArray(log.log) || !log.result) return json({ error: 'Not a game log' }, 400);
  if (log.claim != null && !/^[A-Za-z0-9]{8,64}$/.test(String(log.claim))) return json({ error: 'Bad claim' }, 400);
  const d = new Date(), pad = n => String(n).padStart(2, '0');
  const winner = String(log.result.winner || 'unknown').replace(/[^A-Za-z]/g, '').toLowerCase() || 'unknown';
  const player = String(log.playerName || '').replace(/[^A-Za-z0-9]/g, '').toLowerCase().slice(0, 20);
  const path = `games/${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}/${pad(d.getUTCDate())}-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}-${winner}${player ? '-' + player : ''}-${crypto.randomUUID().slice(0, 6)}.json`;
  const bytes = new TextEncoder().encode(JSON.stringify(log, null, 1));
  let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  const put = fetch(`https://api.github.com/repos/${LOG_REPO}/contents/${path}`, {
    method: 'PUT',
    headers: GH(env.GITHUB_LOGS_TOKEN),
    body: JSON.stringify({ message: `Game log${player ? ' (' + String(log.playerName).slice(0, 40) + ')' : ''}: ${log.result.winner} won (${log.result.type}, ${log.result.turns} turns)`, content: btoa(bin) })
  }).then(async r => {
    lastUpload = { at: new Date().toISOString(), status: r.status, path };
    if (!r.ok) { lastUpload.error = (await r.text()).slice(0, 300); console.log('log upload failed', r.status, lastUpload.error); }
  }).catch(e => { lastUpload = { at: new Date().toISOString(), error: String(e) }; });
  ctx.waitUntil(put);
  return json({ ok: true, path }, 202);
}

/* The player's name, added after the game's log was already saved. The browser proves it sent that log
   by repeating the random claim code that log carries. The log may still be uploading, so retry a few times. */
const b64dec = b => { const bin = atob(b.replace(/\n/g, '')); return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))); };
const b64enc = t => { const bytes = new TextEncoder().encode(t); let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(bin); };
const nameTimes = new Map();
async function nameLog(request, env, ctx) {
  if (!env.GITHUB_LOGS_TOKEN) return json({ error: 'Logging is not configured' }, 503);
  const ip = request.headers.get('cf-connecting-ip') || 'unknown', now = Date.now();
  const times = (nameTimes.get(ip) || []).filter(t => now - t < 600_000);
  if (times.length >= 10) return json({ error: 'Slow down' }, 429);
  times.push(now); nameTimes.set(ip, times);
  let b;
  try { const t = await request.text(); if (t.length > 2000) return json({ error: 'Too large' }, 413); b = JSON.parse(t); } catch (e) { return json({ error: 'Bad request' }, 400); }
  const path = String(b && b.path || ''), claim = String(b && b.claim || ''), name = String(b && b.name || '').trim().slice(0, 40);
  if (!/^games\/\d{4}-\d{2}\/[A-Za-z0-9-]+\.json$/.test(path) || !/^[A-Za-z0-9]{8,64}$/.test(claim) || !name) return json({ error: 'Bad request' }, 400);
  const url = `https://api.github.com/repos/${LOG_REPO}/contents/${path}`;
  const job = (async () => {
    for (let i = 0; i < 6; i++) {
      if (i) await new Promise(r => setTimeout(r, 2500 * i));
      const g = await fetch(url, { headers: GH(env.GITHUB_LOGS_TOKEN) });
      if (g.status === 404) continue;              /* still uploading */
      if (!g.ok) return;
      const f = await g.json();
      let log; try { log = JSON.parse(f.content ? b64dec(f.content) : await (await fetch(f.download_url, { headers: GH(env.GITHUB_LOGS_TOKEN) })).text()); } catch (e) { return; }
      if (log.claim !== claim) return;             /* not this player's game */
      log.playerName = name;
      const r = await fetch(url, { method: 'PUT', headers: GH(env.GITHUB_LOGS_TOKEN),
        body: JSON.stringify({ message: `Game log: played by ${name}`, content: b64enc(JSON.stringify(log, null, 1)), sha: f.sha }) });
      if (r.ok) return;
      if (r.status !== 409 && r.status !== 422) return;
    }
  })().catch(e => console.log('name update failed', String(e)));
  ctx.waitUntil(job);
  return json({ ok: true }, 202);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/ping') return json({ warplands: true });

    /* Game logs from games against the computer, saved to the warplands-logs GitHub repo */
    if (url.pathname === '/api/log' && request.method === 'POST') return saveLog(request, env, ctx);
    if (url.pathname === '/api/log/name' && request.method === 'POST') return nameLog(request, env, ctx);
    /* Self-check for game logging: is the token set, and does GitHub accept it for the logs repo? */
    if (url.pathname === '/api/log/status') return logStatus(env);

    if (url.pathname === '/api/new' && request.method === 'POST') {
      for (let i = 0; i < 6; i++) {
        const code = newCode();
        const stub = env.ROOM.get(env.ROOM.idFromName(code));
        const r = await stub.fetch('https://room/claim', { method: 'POST' });
        if (r.ok) return json({ code });
      }
      return json({ error: 'Could not create a room. Try again.' }, 503);
    }

    const m = url.pathname.match(/^\/api\/room\/([A-Z0-9]{4,6})\/ws$/);
    if (m) {
      if (request.headers.get('Upgrade') !== 'websocket') return new Response('Expected a WebSocket', { status: 426 });
      return env.ROOM.get(env.ROOM.idFromName(m[1])).fetch(request);
    }

    if (url.pathname.startsWith('/api/')) return json({ error: 'Not found' }, 404);
    return env.ASSETS.fetch(request);
  }
};
