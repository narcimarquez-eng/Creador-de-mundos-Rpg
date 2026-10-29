// Pruebas de los colores de los monstruos por zona. Ejecutar: node test/paletas.test.js
const assert = require('assert');
const P = require('../js/paletas.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

// Los 8 materiales del editor de enemigos (solo los colores, como en MATERIAL_PRESETS)
const PRESETS = {};
P.TODAS.forEach((k, i) => { PRESETS[k] = { label: k, primaryColor: '#7a161b', secondaryColor: '#d49442', underbodyColor: '#261314', emissiveColor: '#ff5722', metalness: 0.1 * i }; });
PRESETS.feral_fur_hide = Object.assign({}, PRESETS.feral_fur_hide, { primaryColor: '#3d352e', secondaryColor: '#a69378' });
const hex = /^#[0-9a-f]{6}$/;

t('cada zona toma un material de su bioma; sin bioma conocido, cualquiera', () => {
  for (let i = 0; i < 30; i++) {
    assert.ok(P.POR_BIOMA.tundra.includes(P.paletaDeZona({ id: 'z' + i, biome: 'tundra' })));
    assert.ok(P.TODAS.includes(P.paletaDeZona({ id: 'z' + i, biome: 'raro' })));
  }
});

t('el pelaje marrón solo sale en bosque y taiga', () => {
  Object.keys(P.POR_BIOMA).forEach(b => {
    if (b !== 'bosque' && b !== 'taiga') assert.ok(!P.POR_BIOMA[b].includes('feral_fur_hide'), b);
  });
});

t('zonas distintas dan paletas distintas (hay variedad)', () => {
  const vistas = new Set();
  for (let i = 0; i < 20; i++) vistas.add(P.paletaDeZona({ id: 'zona' + i, biome: 'pradera' }));
  assert.ok(vistas.size >= 3, [...vistas].join(','));
});

t('el material de un monstruo es determinista, con colores válidos y la clave de su paleta', () => {
  const zona = { id: 'z7', biome: 'desierto' };
  const a = P.materialDeMonstruo(PRESETS, zona, 'z7|0|0'), b = P.materialDeMonstruo(PRESETS, zona, 'z7|0|0');
  assert.deepStrictEqual(a, b);
  assert.strictEqual(a.preset, P.paletaDeZona(zona));
  ['primaryColor', 'secondaryColor', 'underbodyColor', 'emissiveColor'].forEach(k => assert.match(a[k], hex, k));
  assert.strictEqual(a.metalness, PRESETS[a.preset].metalness);   // el resto del material, el del editor
});

t('los monstruos de una zona varían de tono entre sí y salen más saturados que el material base', () => {
  const zona = { id: 'z3', biome: 'pradera' };
  const tonos = new Set();
  for (let i = 0; i < 6; i++) {
    const m = P.materialDeMonstruo(PRESETS, zona, 'z3|' + i + '|0');
    tonos.add(m.primaryColor);
    assert.ok(P.hexAHsl(m.primaryColor).s >= P.hexAHsl(PRESETS[m.preset].primaryColor).s - 0.01);
  }
  assert.ok(tonos.size >= 4);
});

t('variar color: girar el tono 0 y multiplicar por 1 deja el mismo color', () => {
  assert.strictEqual(P.variarColor('#7a161b', 0, 1, 1), '#7a161b');
  assert.strictEqual(P.variarColor('#808080', 30, 1.5, 1), '#808080');   // gris: no tiene tono
});

console.log(`\n${n} pruebas de paletas superadas.`);
