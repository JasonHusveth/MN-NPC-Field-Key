import fs from 'fs'; import { ecsLookup } from '../engine.js';
const E = JSON.parse(fs.readFileSync(new URL('../data/ecs.json', import.meta.url)));
for (const [n, la, lo] of [['Stillwater office', 45.0567, -92.8063], ['Itasca SP', 47.2394, -95.2069], ['Ely', 47.9032, -91.8671], ['Red Wing bluffs', 44.5625, -92.5338],
  ['Fergus Falls', 46.283, -96.0776], ['Moorhead', 46.8738, -96.7678], ['Big Bog', 48.21, -94.55], ['Pipestone', 44.0, -96.32], ['Duluth', 46.7867, -92.1005], ['Cedar Creek', 45.40, -93.20],
  ['Mille Lacs', 46.08, -93.66], ['Grand Marais', 47.75, -90.33], ['Lancaster LAP', 48.86, -96.80], ['Des Moines (IA)', 41.59, -93.62]]) {
  const r = ecsLookup(la, lo, E); console.log(n.padEnd(18), r.outside ? 'OUTSIDE' : `${r.sec} ${r.sub} (${r.subCode}) ${r.prov} edge ${r.edgeKm.toFixed(1)} km`);
}
