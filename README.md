# Warplands

A tactical card game across four eras (Hamlet, Township, City, Empire), played in the browser.

- **Play the computer** — runs entirely in your browser.
- **Online** — one player creates a game and shares the 5-letter room code; the other joins with it.

## How it's built

| Path | What it is |
|---|---|
| `public/index.html` | The page and its styles |
| `public/game.js` | Rules engine, card data, computer opponent and interface. The same file runs in the browser and on the server. |
| `src/worker.js` | Cloudflare Worker: serves the page, creates rooms, routes players to their room |
| `src/room.js` | Durable Object, one per room: runs the real game, keeps each player's hand private, saves the game between actions |
| `wrangler.jsonc` | Cloudflare configuration |
| `tools/build_artifact.py` | Builds a single-file, offline copy of the game |

Online games are server-authoritative: the opponent's hand never reaches your browser (only how many cards of each level they hold).

## Deploying on Cloudflare (free plan)

1. In the Cloudflare dashboard, go to **Workers & Pages → Create → Import a repository**.
2. Connect GitHub if asked, then pick **nairul/warplands**.
3. Keep the defaults (deploy command `npx wrangler deploy`) and click **Deploy**.

Every push to `main` redeploys automatically. The game is served at `https://warplands.<your-subdomain>.workers.dev`.

## Running locally

```
npm install
npx wrangler dev
```

Then open http://localhost:8787 in two browser windows to test online play.
