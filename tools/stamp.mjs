/* Run by `wrangler deploy` (see "build" in wrangler.jsonc): writes public/version.json with the
   commit being deployed, so the game can show which version is live. */
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
let sha = process.env.WORKERS_CI_COMMIT_SHA || '';
if (!sha) { try { sha = execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch (e) {} }
const out = { sha: sha.slice(0, 7) || 'dev', built: new Date().toISOString() };
writeFileSync(new URL('../public/version.json', import.meta.url), JSON.stringify(out) + '\n');
console.log('version stamp', out);
