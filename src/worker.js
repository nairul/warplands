export { Room } from './room.js';

/* Room codes avoid look-alike characters (0/O, 1/I/L). */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(5)), b => ALPHABET[b % ALPHABET.length]).join('');
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

const LOG_REPO = 'nairul/warplands-logs';
const MAX_LOG = 400_000;               /* bytes; a normal game log is ~30-100 KB */
const recent = new Map();              /* ip -> recent upload times (per Worker instance) */

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
  const d = new Date(), pad = n => String(n).padStart(2, '0');
  const winner = String(log.result.winner || 'unknown').replace(/[^A-Za-z]/g, '').toLowerCase() || 'unknown';
  const path = `games/${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}/${pad(d.getUTCDate())}-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}-${winner}-${crypto.randomUUID().slice(0, 6)}.json`;
  const bytes = new TextEncoder().encode(JSON.stringify(log, null, 1));
  let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  const put = fetch(`https://api.github.com/repos/${LOG_REPO}/contents/${path}`, {
    method: 'PUT',
    headers: { authorization: `Bearer ${env.GITHUB_LOGS_TOKEN}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28', 'user-agent': 'warplands-worker' },
    body: JSON.stringify({ message: `Game log: ${log.result.winner} won (${log.result.type}, ${log.result.turns} turns)`, content: btoa(bin) })
  }).then(async r => { if (!r.ok) console.log('log upload failed', r.status, (await r.text()).slice(0, 200)); });
  ctx.waitUntil(put);
  return json({ ok: true, path }, 202);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/ping') return json({ warplands: true });

    /* Game logs from games against the computer, saved to the warplands-logs GitHub repo */
    if (url.pathname === '/api/log' && request.method === 'POST') return saveLog(request, env, ctx);

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
