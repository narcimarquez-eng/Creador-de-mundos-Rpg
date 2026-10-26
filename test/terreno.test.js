// Pruebas de los pesos del terreno. Ejecutar: node test/terreno.test.js
const assert = require('assert');
const T = require('../js/terreno.js');
let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }
const sum = (w) => w.splat.reduce((a, b) => a + b, 0) + w.snow;

t('los pesos siempre suman 1 (nieve incluida)', () => {
  for (const b of ['pradera', 'bosque', 'pantano', 'taiga', 'tundra', 'desierto', 'montana', 'nieve', 'costa', 'oceano', 'agua']) {
    for (const steep of [0, 0.3, 0.6, 1]) for (const h of [0, 150, 260]) {
      const w = T.splatFor(b, steep, h);
      assert.ok(Math.abs(sum(w) - 1) < 1e-9, b + ' ' + steep + ' ' + h + ' suma ' + sum(w));
    }
  }
});

t('pradera: hierba; desierto: arena; nieve: nieve', () => {
  assert.deepStrictEqual(T.splatFor('pradera', 0, 0).splat.map(v => Math.round(v * 100) / 100), [1, 0, 0, 0]);
  assert.deepStrictEqual(T.splatFor('desierto', 0, 0).splat.map(v => Math.round(v * 100) / 100), [0, 0, 0, 1]);
  assert.strictEqual(T.splatFor('nieve', 0, 0).snow, 1);
});

t('pendiente fuerte cambia el suelo a roca', () => {
  const w = T.splatFor('pradera', 0.9, 0);
  assert.ok(w.splat[2] > 0.9, 'roca ' + w.splat[2]);
  assert.ok(w.splat[0] < 0.1);
});

t('altura alta: nieve aunque el bioma sea pradera', () => {
  assert.ok(T.splatFor('pradera', 0, 260).snow > 0.9);
  assert.strictEqual(T.splatFor('pradera', 0, 100).snow, 0);
});

t('normal de un terreno plano apunta hacia arriba', () => {
  const flat = () => 5;
  const nrm = T.nodeNormal(flat, 3, 3, 10, 20);
  assert.ok(Math.abs(nrm[0]) < 1e-9 && Math.abs(nrm[2]) < 1e-9 && Math.abs(nrm[1] - 1) < 1e-9);
});

console.log(`\n${n} pruebas correctas`);
