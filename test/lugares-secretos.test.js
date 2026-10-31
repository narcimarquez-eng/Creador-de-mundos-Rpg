// Pruebas del sistema de lugares secretos con arquitectura peculiar. Ejecutar: node test/lugares-secretos.test.js
const assert = require('assert');
const L = require('../js/lugares-secretos.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

function mundoMock() {
  return {
    id: 'mundo-test',
    name: 'Aden-Test',
    size: 2000,
    towns: [
      { id: 't1', name: 'Lorrin', x: 200, y: 200, isStart: true },
      { id: 't2', name: 'Corwyn', x: 800, y: 500 }
    ],
    zones: [
      { id: 'z1', name: 'Prados', type: 'caza', x: 400, y: 400 }
    ]
  };
}

t('tipos de secretos: define fuente, cabaña, altar y santuario con arquitectura distintiva', () => {
  const tipos = Object.keys(L.TIPOS_SECRETO);
  assert.ok(tipos.includes('fuente'));
  assert.ok(tipos.includes('cabana'));
  assert.ok(tipos.includes('altar'));
  assert.ok(tipos.includes('santuario'));

  tipos.forEach(k => {
    const s = L.TIPOS_SECRETO[k];
    assert.ok(s.nombre && s.desc && s.icono && s.radioDeteccion > 10);
  });
});

t('generación determinista: genera lugares secretos distribuidos orgánicamente', () => {
  const w = mundoMock();
  const sec1 = L.generarLugaresSecretos(w);
  const sec2 = L.generarLugaresSecretos(w);

  assert.ok(sec1.length >= 6);
  assert.strictEqual(sec1.length, sec2.length);
  assert.strictEqual(sec1[0].id, sec2[0].id);
  assert.strictEqual(sec1[0].x, sec2[0].x);
  assert.strictEqual(sec1[0].z, sec2[0].z);
});

t('ubicación de secretos: se colocan lejos de las plazas de los pueblos', () => {
  const w = mundoMock();
  const secretos = L.generarLugaresSecretos(w);

  secretos.forEach(s => {
    w.towns.forEach(p => {
      const d = Math.hypot(p.x - s.x, p.y - s.z);
      assert.ok(d >= 120, `Secreto ${s.id} demasiado cerca del pueblo ${p.name}: d=${d}`);
    });
  });
});

console.log(`\n${n} pruebas de lugares secretos superadas.`);
