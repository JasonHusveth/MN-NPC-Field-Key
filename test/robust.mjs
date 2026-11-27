// node app/test/robust.mjs — robustness to "stray" species: each simulated plot also gets 2 species that are common in a
// sibling class of the same system but are not on the true class's table (e.g. an oak grub in a dry prairie).
// Compares the unlisted-species floor (eps) settings.
import fs from 'fs';
import { rankClasses, candidatesFor, PARAMS } from '../engine.js';
const data = JSON.parse(fs.readFileSync(new URL('../data/npc-data.json', import.meta.url)));
const byKey = new Map(); for (const s of data.species) if (!byKey.has(s.k) || s.r === 'species') byKey.set(s.k, s.n);
const nameFor = key => { const k = key.split('|')[0]; return k.startsWith('g:') || k.startsWith('b:') ? null : byKey.get(k); };
const keysOf = p => new Set([...Object.keys(p.g), ...Object.keys(p.t)].flatMap(k => k.split('|')));
let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function simPlot(code, sibs, detect, strays) {
  const p = data.profiles[code], sp = [];
  for (const [key, [f]] of Object.entries(p.g)) if (rnd() < f / 100 && rnd() < detect) { const n = nameFor(key); if (n) sp.push({ n, layer: 'G', cover: 1 }); }
  for (const [key, lays] of Object.entries(p.t)) for (const [L, [f]] of Object.entries(lays)) if (rnd() < f / 100 && rnd() < detect) { const n = nameFor(key); if (n) sp.push({ n, layer: L === 'U' ? 'S' : L, cover: 2 }); }
  const own = keysOf(p), pool = [];
  for (const s of sibs) { const q = data.profiles[s]; for (const [key, v] of Object.entries(q.g)) if (v[0] >= 40 && !key.split('|').some(k => own.has(k))) pool.push(key); }
  for (let i = 0; i < strays && pool.length; i++) { const n = nameFor(pool[Math.floor(rnd() * pool.length)]); if (n) sp.push({ n, layer: 'G', cover: 1 }); }
  return { species: sp };
}
for (const eps of [0.03, 0.05, 0.08]) for (const strays of [0, 2]) {
  let n = 0, top1 = 0; seed = 3;
  for (const sec of data.sections) {
    const cands = candidatesFor(sec.code, data).filter(c => data.profiles[c] && !data.profiles[c].prov);
    for (const code of cands) {
      const sibs = cands.filter(c => c !== code && c.slice(0, 2) === code.slice(0, 2)); if (!sibs.length) continue;
      for (let i = 0; i < 12; i++) { const r = rankClasses(simPlot(code, sibs, 0.6, strays), data, cands.filter(c => c.slice(0, 2) === code.slice(0, 2)), { ...PARAMS, eps }); n++; if (r[0].code === code) top1++; }
    }
  }
  console.log(`eps ${eps}  strays ${strays}: within-system top1 ${(100 * top1 / n).toFixed(1)}% of ${n}`);
}
