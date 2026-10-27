// Pruebas de los modelos de árboles incrustados (js/arboles.js). Ejecutar: node test/arboles.test.js
const assert = require('assert');
const T = require('../js/arboles.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

const catalogo = [
  { id: 'roble', triangulos: 196, alto: 9.0 },
  { id: 'alamo', triangulos: 72, alto: 11.0 },
  { id: 'pino', triangulos: 230, alto: 10.5 },
  { id: 'arbusto', triangulos: 104, alto: 1.6 }
];

t('hay las cuatro especies del catálogo', () => {
  assert.deepStrictEqual(T.especies.slice().sort(), catalogo.map(c => c.id).sort());
});

t('cada especie decodifica con los triángulos y la altura del catálogo', () => {
  catalogo.forEach(c => {
    const d = T.datos(c.id);
    assert.strictEqual(d.idx.length / 3, c.triangulos, c.id + ': triángulos');
    assert.ok(Math.abs(d.alto - c.alto) < 0.05, c.id + ': altura ' + d.alto);
    assert.strictEqual(d.pos.length, d.nrm.length, c.id + ': normales');
    assert.strictEqual(d.pos.length / 3 * 2, d.uv.length, c.id + ': UV');
  });
});

t('los índices apuntan a vértices existentes', () => {
  catalogo.forEach(c => {
    const d = T.datos(c.id), vmax = d.pos.length / 3;
    for (let i = 0; i < d.idx.length; i++) assert.ok(d.idx[i] < vmax, c.id + ': índice fuera de rango');
  });
});

t('cada especie lleva su textura PNG y su licencia', () => {
  catalogo.forEach(c => {
    assert.ok(T.datos(c.id).png.startsWith('data:image/png;base64,'));
    assert.strictEqual(T.info(c.id).licencia, 'CC0 1.0');
  });
});

t('una especie que no existe devuelve null', () => {
  assert.strictEqual(T.datos('palmera'), null);
});

console.log('\n' + n + ' pruebas correctas');
