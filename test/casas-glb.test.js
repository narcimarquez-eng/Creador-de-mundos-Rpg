const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const L = require('../js/casas-glb.js');

const RAIZ = path.join(__dirname, '..');
function materialesGLB(archivo) {
  const b = fs.readFileSync(path.join(RAIZ, archivo));
  const j = JSON.parse(b.slice(20, 20 + b.readUInt32LE(12)).toString());
  return { nombres: j.materials.map(m => m.name), j };
}

test('Casas GLB: cada papel cambiable existe como material en el modelo y en su versión lejana', () => {
  Object.entries(L.MODELOS).forEach(([clave, def]) => {
    ['', '_lejos'].forEach(suf => {
      const { nombres } = materialesGLB(`glb/pueblo/${clave}${suf}.glb`);
      Object.keys(def.cambiables).forEach(papel => assert.ok(nombres.includes(papel), `${clave}${suf}: falta el material «${papel}»`));
    });
  });
});

test('Casas GLB: el tejado pintado de la casa de entramado trae UV planas (uv1) para las variantes', () => {
  const { j } = materialesGLB('glb/pueblo/casa_entramado.glb');
  const prim = j.meshes.flatMap(m => m.primitives).find(p => j.materials[p.material].name === 'tejado');
  assert.ok(prim && prim.attributes.TEXCOORD_1 !== undefined);
});

test('Casas GLB: las 50 texturas del catálogo existen y las opciones de cada modelo apuntan a ellas', () => {
  Object.entries(L.TEXTURAS).forEach(([grupo, lista]) => {
    assert.strictEqual(Object.keys(lista).length, 10);
    Object.keys(lista).forEach(id => assert.ok(fs.existsSync(path.join(RAIZ, `assets/texturas/${grupo}/${id}.jpg`)), `${grupo}/${id}`));
  });
  Object.values(L.MODELOS).forEach(def => Object.values(def.cambiables).forEach(c => {
    if (c.igualA) return;
    c.opciones.forEach(id => assert.ok(L.TEXTURAS[c.grupo][id], `${c.grupo}/${id}`));
  }));
});

test('Casas GLB: variantes deterministas, la primera es la original y las demás cambian algo', () => {
  const a = L.variantes('cabana', 4, 77), b = L.variantes('cabana', 4, 77);
  assert.deepStrictEqual(a, b);
  assert.strictEqual(a[0].id, 'original');
  a.slice(1).forEach(v => {
    assert.ok(v.cambios.tejado && v.cambios.madera_troncos && v.cambios.piedra);
    assert.deepStrictEqual(v.cambios.madera_tablas.id, v.cambios.madera_troncos.id, 'las tablas siguen a los troncos');
  });
});

test('Casas GLB: piezas sueltas presentes', () => {
  L.PIEZAS.forEach(n => assert.ok(fs.existsSync(path.join(RAIZ, `glb/pueblo/piezas/${n}.glb`)), n));
});
