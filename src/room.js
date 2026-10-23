import { createGame } from '../public/game.js';

/* One Durable Object per room code. It runs the real game, keeps each player's hand private,
   and saves the game between actions so a server restart doesn't lose it. */
const IDLE_MS = 30 * 60 * 1000;            // close idle connections after 30 minutes
const EXPIRE_MS = 7 * 24 * 60 * 60 * 1000; // forget rooms a week after their last activity

export class Room {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.seats = [null, null];   // {token, name}
    this.sockets = [null, null]; // live WebSocket per seat
    this.created = false;
    this.game = null;
    this.saved = null;
    this.fx = [];
    this.queued = false;
    this.idleTimer = null;
    ctx.blockConcurrencyWhile(async () => {
      this.created = !!(await ctx.storage.get('created'));
      this.seats = (await ctx.storage.get('seats')) || [null, null];
      this.saved = (await ctx.storage.get('state')) || null;
    });
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/claim') {
      if (this.created) return new Response('taken', { status: 409 });
      this.created = true;
      await this.ctx.storage.put('created', true);
      await this.ctx.storage.setAlarm(Date.now() + EXPIRE_MS);
      return new Response('ok');
    }
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected a WebSocket', { status: 426 });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();
    this.join(server, url);
    return new Response(null, { status: 101, webSocket: client });
  }

  join(ws, url) {
    const fail = (msg, code) => {
      ws.send(JSON.stringify({ t: 'error', msg, fatal: true }));
      ws.close(code, msg);
    };
    if (!this.created) return fail('That room code does not exist. Check it and try again.', 4004);
    const token = url.searchParams.get('token') || '';
    let name = (url.searchParams.get('name') || '').replace(/[<>]/g, '').trim().slice(0, 18);
    if (/^you$/i.test(name)) name = '';
    let seat = token ? this.seats.findIndex(s => s && s.token === token) : -1;
    if (seat < 0) {
      seat = this.seats.findIndex(s => !s);
      if (seat < 0) return fail('That game already has two players.', 4003);
      this.seats[seat] = { token: crypto.randomUUID(), name: name || `Player ${seat + 1}` };
      if (seat === 1 && this.seats[0] && this.seats[1].name === this.seats[0].name) this.seats[1].name += ' 2';
      this.ctx.storage.put('seats', this.seats);
    }
    const old = this.sockets[seat];
    this.sockets[seat] = ws;
    if (old && old !== ws) { try { old.close(4001, 'Replaced by a newer connection'); } catch (e) {} }

    ws.addEventListener('message', ev => this.onMessage(seat, ws, ev.data));
    const gone = () => {
      if (this.sockets[seat] === ws) { this.sockets[seat] = null; this.sendLobby(); this.broadcast(); }
    };
    ws.addEventListener('close', gone);
    ws.addEventListener('error', gone);

    ws.send(JSON.stringify({ t: 'hello', seat, token: this.seats[seat].token, code: url.pathname.split('/')[3] || '' }));
    this.touch();
    this.ensureGame();
    this.sendLobby();
    if (this.game) this.sendState(seat);
  }

  ensureGame() {
    if (this.game) return;
    if (this.saved) {
      this.makeGame();
      this.game.load(this.saved);
      return;
    }
    if (this.seats[0] && this.seats[1] && this.sockets[0] && this.sockets[1]) {
      this.makeGame();
      this.game.newOnline();
    }
  }

  makeGame() {
    this.game = createGame({
      server: true,
      names: () => this.seats.map((s, i) => (s && s.name) || `Player ${i + 1}`),
      broadcast: () => this.broadcast(),
      fx: (k, n) => { if (this.fx.length < 40) this.fx.push({ k, n }); }
    });
  }

  onMessage(seat, ws, data) {
    if (this.sockets[seat] !== ws) return;
    let m;
    try { m = JSON.parse(data); } catch (e) { return; }
    this.touch();
    if (!this.game) return;
    if (m.t === 'act') this.game.act(seat, m);
    else if (m.t === 'answer') this.game.answer(seat, m);
    else if (m.t === 'rematch') {
      if (this.game.isOver()) { this.saved = null; this.game = null; this.ensureGame(); this.broadcast(); }
    }
    else if (m.t === 'sync') { this.sendState(seat); return; }
    else if (m.t === 'leave') { /* the seat stays reserved so the player can rejoin */ }
    this.broadcast();
  }

  /* Many engine steps can call render() in a row; send one update per tick. */
  broadcast() {
    if (this.queued) return;
    this.queued = true;
    setTimeout(() => {
      this.queued = false;
      if (!this.game) return;
      const fx = this.fx; this.fx = [];
      for (const seat of [0, 1]) this.sendState(seat, fx);
      if (this.game.safe()) {
        this.saved = this.game.full();
        this.ctx.storage.put('state', this.saved);
      }
    }, 0);
  }

  sendState(seat, fx = []) {
    const ws = this.sockets[seat];
    if (!ws || !this.game || !this.game.hasGame()) return;
    const s = this.game.snapshot(seat);
    s.conn = this.sockets.map(Boolean);
    s.fx = fx;
    try { ws.send(JSON.stringify({ t: 'state', s })); } catch (e) {}
  }

  sendLobby() {
    const msg = JSON.stringify({ t: 'lobby', conn: this.sockets.map(Boolean), names: this.seats.map(s => s && s.name) });
    for (const ws of this.sockets) if (ws) { try { ws.send(msg); } catch (e) {} }
  }

  touch() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      for (const ws of this.sockets) if (ws) { try { ws.close(4000, 'Closed after 30 minutes without activity'); } catch (e) {} }
    }, IDLE_MS);
    this.ctx.storage.setAlarm(Date.now() + EXPIRE_MS);
  }

  async alarm() {
    for (const ws of this.sockets) if (ws) { try { ws.close(4010, 'This room has expired'); } catch (e) {} }
    await this.ctx.storage.deleteAll();
    this.created = false; this.seats = [null, null]; this.saved = null; this.game = null;
  }
}
