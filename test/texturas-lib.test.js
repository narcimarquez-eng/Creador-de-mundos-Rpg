const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const T = require('../js/texturas-lib.js');

const RAIZ = path.join(__dirname, '..');

test('Texturas: 5 grupos de 10, con su foto y su miniatura', () => {
  assert.deepStrictEqual(T.GRUPOS, ['tejados', 'madera', 'suelo', 'piedra', 'agua']);
  T.GRUPOS.forEach(g => {
    const l = T.lista(g);
    assert.strictEqual(l.length, 10, g);
    l.forEach(id => {
      assert.ok(fs.existsSync(path.join(RAIZ, T.ruta(id))), id);
      assert.ok(fs.existsSync(path.join(RAIZ, T.miniatura(id))), 'miniatura ' + id);
      assert.ok(T.nombre(id).length > 0);
    });
  });
});

test('Texturas: validación de identificadores', () => {
  assert.ok(T.valida('suelo/t08'));
  assert.ok(!T.valida('suelo/t11'));
  assert.ok(!T.valida('nada/t01'));
  assert.ok(!T.valida('suelo/nombre'), 'la clave «nombre» del grupo no es una textura');
  assert.ok(!T.valida(null));
  assert.strictEqual(T.textura(null, 'suelo/t08'), null);
});

test('Texturas: las casas GLB usan el mismo catálogo', () => {
  const C = require('../js/casas-glb.js');
  Object.values(C.MODELOS).forEach(def => Object.values(def.cambiables).forEach(c => {
    if (c.igualA) return;
    c.opciones.forEach(id => assert.ok(T.valida(c.grupo + '/' + id), c.grupo + '/' + id));
  }));
});

test('Casas GLB: texturas fijadas para el pueblo mandan en todas las variantes', () => {
  const C = require('../js/casas-glb.js');
  const vars = C.variantes('cabana', 3, 5, { tejado: 'tejados/t07', piedra: 'piedra/t08' });
  vars.forEach(v => {
    assert.strictEqual(v.cambios.tejado.id, 't07');
    assert.strictEqual(v.cambios.tejado_musgo.id, 't07');
    assert.strictEqual(v.cambios.piedra.id, 't08');
  });
});
