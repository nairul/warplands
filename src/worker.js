export { Room } from './room.js';

/* Room codes avoid look-alike characters (0/O, 1/I/L). */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(5)), b => ALPHABET[b % ALPHABET.length]).join('');
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/ping') return json({ warplands: true });

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
