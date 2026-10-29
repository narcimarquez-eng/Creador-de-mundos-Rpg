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

t('el suelo usa tres texturas distintas por clase, todas del atlas', () => {
  // La arena toma alguna textura arenosa que el atlas tiene en «tierra»: las de su clase son casi todas grava
  const meta = require('../assets/terreno/atlas.json');
  assert.strictEqual(T.CAPAS.length, 5);
  T.CAPAS.forEach(lista => assert.strictEqual(lista.length, 3));
  const todas = T.CAPAS.flat();
  assert.strictEqual(new Set(todas).size, todas.length);
  todas.forEach(i => assert.ok(Number.isInteger(i) && i >= 0 && i < meta.texturas.length, String(i)));
  const [bH, cH] = meta.clases.hierba, [bN, cN] = meta.clases.nieve;
  T.CAPAS[0].forEach(i => assert.ok(i >= bH && i < bH + cH, 'hierba ' + i));
  T.CAPAS[4].forEach(i => assert.ok(i >= bN && i < bN + cN, 'nieve ' + i));
});

t('las capas se recortan de su celda del atlas', () => {
  const lado = 40, tam = 4, rgba = new Uint8Array(lado * lado * 4);
  for (let y = 0; y < lado; y++) for (let x = 0; x < lado; x++) {
    const celda = Math.floor(y / tam) * 10 + Math.floor(x / tam), k = (y * lado + x) * 4;
    rgba[k] = celda; rgba[k + 1] = x % tam; rgba[k + 2] = y % tam; rgba[k + 3] = 255;
  }
  const r = T.capasDelAtlas(rgba, lado);
  assert.strictEqual(r.capas, 15);
  assert.strictEqual(r.tam, tam);
  T.CAPAS.flat().forEach((celda, l) => {
    for (let y = 0; y < tam; y++) for (let x = 0; x < tam; x++) {
      const k = ((l * tam + y) * tam + x) * 4;
      assert.deepStrictEqual([...r.datos.subarray(k, k + 3)], [celda, x, y]);
    }
  });
});

console.log(`\n${n} pruebas correctas`);
