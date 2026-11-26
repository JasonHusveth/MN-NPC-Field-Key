// node app/test/systems.mjs [T indW] — how often the system step picks the right system on plots simulated from the class profiles.
// The appendices are an independent DNR source (system-level tables), so the class profiles are a fair test bed for them.
import fs from 'fs';
import { rankClasses, candidatesFor, systemClasses, systemProbs, APP_W } from '../engine.js';
const data = JSON.parse(fs.readFileSync(new URL('../data/npc-data.json', import.meta.url)));
const byKey = new Map(); for (const s of data.species) if (!byKey.has(s.k) || s.r === 'species') byKey.set(s.k, s.n);
const byGenus = new Map(); for (const s of data.species) { const g = s.k.split(' ')[0]; if (!byGenus.has(g)) byGenus.set(g, s.n); }
const nameFor = key => { const k = key.split('|')[0]; return k.startsWith('g:') ? byGenus.get(k.slice(2)) : k.startsWith('b:') ? k.slice(2) : byKey.get(k); };
let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function simPlot(code, detect) {
  const p = data.profiles[code], sp = [];
  for (const [key, [f, cv]] of Object.entries(p.g)) if (rnd() < f / 100 && rnd() < detect) { const n = nameFor(key); if (n) sp.push({ n, layer: 'G', cover: cv || 1 }); }
  for (const [key, lays] of Object.entries(p.t)) for (const [L, [f, cv]] of Object.entries(lays)) if (rnd() < f / 100 && rnd() < detect) { const n = nameFor(key); if (n) sp.push({ n, layer: L === 'U' ? 'S' : L, cover: cv || 2 }); }
  return { species: sp };
}
const [T, indW] = process.argv.slice(2).map(Number);
const W = { ...APP_W, ...(T ? { temperature: T } : {}), ...(indW >= 0 && process.argv[3] ? { indW } : {}) };
for (const detect of [0.7, 0.3]) {
  const tally = { ind: 0, app: 0, comb: 0, freq: 0 }; let n = 0, brier = 0; const conf = {}; const cal = Array.from({ length: 10 }, () => [0, 0]);
  for (const sec of data.sections) {
    const cands = candidatesFor(sec.code, data);
    for (const panel of data.systemKeys[sec.code] || []) {
      for (const code of cands) {
        if (!data.profiles[code] || data.profiles[code].prov) continue;       // only classes with DNR frequency tables
        const truth = panel.cols.find(c => systemClasses(sec.code, c, data).includes(code)); if (!truth) continue;
        for (let i = 0; i < 8; i++) {
          const plot = { section: sec.code, ...simPlot(code, detect) }; if (plot.species.length < 3) continue;
          const r = systemProbs(plot, panel, data, {}, W); n++;
          const byInd = [...r.scored].sort((a, b) => b.indScore - a.indScore)[0];
          const byApp = r.scored.some(x => x.pApp !== null) ? [...r.scored].sort((a, b) => b.pApp - a.pApp)[0] : null;
          if (byInd.col === truth) tally.ind++; if (byApp?.col === truth) tally.app++;
          if (r.scored[0].col === truth) tally.comb++; else conf[code + '>' + r.scored[0].code] = (conf[code + '>' + r.scored[0].code] || 0) + 1;
          const rk = rankClasses(plot, data, cands); const sup = c => rk.filter(x => systemClasses(sec.code, c.col, data).includes(x.code)).reduce((a, x) => a + x.prob, 0);
          if ([...r.scored].sort((a, b) => sup(b) - sup(a))[0].col === truth) tally.freq++;
          const pt = r.scored.find(x => x.col === truth).p; brier += (1 - pt) ** 2;
          const b = Math.min(9, Math.floor(r.scored[0].p * 10)); cal[b][0]++; if (r.scored[0].col === truth) cal[b][1]++;
        }
      }
    }
  }
  const pc = v => (100 * v / n).toFixed(1) + '%';
  console.log(`detect ${detect} (${n} plots, T=${W.temperature}, indW=${W.indW}): indicator lists ${pc(tally.ind)} | appendix ${pc(tally.app)} | combined ${pc(tally.comb)} | class-frequency sum ${pc(tally.freq)} | brier ${(brier / n).toFixed(3)}`);
  console.log('  calibration:', cal.map((b, i) => b[0] ? `${i * 10}%:${Math.round(100 * b[1] / b[0])}%/${b[0]}` : null).filter(Boolean).join(' '));
  console.log('  worst:', Object.entries(conf).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k} ${v}`).join(', '));
}
