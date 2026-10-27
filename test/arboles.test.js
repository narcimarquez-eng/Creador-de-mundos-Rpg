// Pruebas de los modelos de árboles horneados (js/arboles.js). Ejecutar: node test/arboles.test.js
const assert = require('assert');
const T = require('../js/arboles.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

const ESPECIES = ['roble', 'alamo', 'pino', 'arbusto'];
const NIVELES = ['cerca', 'lejos'];

t('hay las cuatro especies y los dos niveles de detalle', () => {
  assert.deepStrictEqual(T.especies.slice().sort(), ESPECIES.slice().sort());
  assert.deepStrictEqual(T.niveles.slice().sort(), NIVELES.slice().sort());
});

t('cada especie y nivel tiene ramas y hojas con sus atributos', () => {
  ESPECIES.forEach(e => NIVELES.forEach(v => {
    const d = T.datos(e, v);
    ['ramas', 'hojas'].forEach(parte => {
      const p = d[parte];
      assert.ok(p.pos.length > 0 && p.pos.length % 3 === 0, e + ' ' + v + ' ' + parte + ': posiciones');
      assert.strictEqual(p.nrm.length, p.pos.length, e + ' ' + v + ': normales');
      assert.strictEqual(p.uv.length, p.pos.length / 3 * 2, e + ' ' + v + ': UV');
      assert.ok(p.idx.length % 3 === 0 && p.idx.length > 0, e + ' ' + v + ': índices');
    });
  }));
});

t('los índices apuntan a vértices existentes', () => {
  ESPECIES.forEach(e => NIVELES.forEach(v => {
    const d = T.datos(e, v);
    ['ramas', 'hojas'].forEach(parte => {
      const vmax = d[parte].pos.length / 3;
      for (let i = 0; i < d[parte].idx.length; i++) assert.ok(d[parte].idx[i] < vmax, e + ' ' + v + ': índice fuera de rango');
    });
  }));
});

t('el nivel cercano tiene más triángulos que el lejano', () => {
  ESPECIES.forEach(e => {
    const tri = (v) => (T.datos(e, v).hojas.idx.length + T.datos(e, v).ramas.idx.length) / 3;
    assert.ok(tri('cerca') > tri('lejos'), e + ': cerca debe tener más detalle');
  });
});

t('la altura de cada especie coincide con la del diseño (metros)', () => {
  const alturas = { roble: 9.5, alamo: 10.5, pino: 11, arbusto: 2.0 };
  ESPECIES.forEach(e => {
    assert.strictEqual(T.alto(e), alturas[e], e + ': altura');
    const pos = T.datos(e, 'cerca').ramas.pos;
    let maxY = 0;
    for (let i = 1; i < pos.length; i += 3) maxY = Math.max(maxY, pos[i]);
    assert.ok(maxY <= alturas[e] + 0.6 && maxY > alturas[e] * 0.6, e + ': la copa llega a ' + maxY.toFixed(2) + ' m');
  });
});

t('cada especie lleva textura de corteza y de hojas y tinta de hojas', () => {
  ESPECIES.forEach(e => {
    assert.ok(T.textura(T.corteza(e)).startsWith('data:image/'), e + ': corteza');
    assert.ok(T.textura(T.hoja(e)).startsWith('data:image/'), e + ': hojas');
    assert.ok(typeof T.tinta(e) === 'number', e + ': tinta');
  });
});

t('una especie o nivel que no existen devuelven null', () => {
  assert.strictEqual(T.datos('palmera', 'cerca'), null);
  assert.strictEqual(T.datos('roble', 'lejanisimo'), null);
});

console.log('\n' + n + ' pruebas correctas');
