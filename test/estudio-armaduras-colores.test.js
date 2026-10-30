// Pruebas de coloración de armaduras en el estudio de creación y exportación al visor. Ejecutar: node test/estudio-armaduras-colores.test.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

const htmlPath = path.join(__dirname, '..', 'estudio-armaduras', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Extraer las tablas y funciones declarativas de estudio-armaduras/index.html (STATE hasta CHARACTER_PRESETS)
const iState = html.indexOf('const STATE = {');
const iClasses = html.indexOf('const FIT_DEFAULTS =');
assert.ok(iState > 0 && iClasses > iState, 'No se localizó el bloque declarativo de STATE/ITEMS_DB/TEXTURE_PRESETS');

const snippet = html.slice(iState, iClasses) + '\nmodule.exports = { STATE, ITEMS_DB, WEAPON_LOADOUT, TEXTURE_PRESETS, TEXTURE_PRESET_ALIASES, ITEM_DEFAULT_TEXTURES, findTexturePreset, getDefaultPresetForItem, resolveSlotTexturePreset, CHARACTER_PRESETS };';
const ctx = { module: { exports: {} }, Math, Array, Object };
vm.runInNewContext(snippet, ctx);
const S = ctx.module.exports;

const COLORES_BLANCOS_LAVADOS = new Set([
  '#ffffff', '#f8fafc', '#f1f5f9', '#fffbeb', '#fdf4ff', '#e2e8f0', '#e0f2fe', '#cbd5e1', '#f0f9ff'
]);

t('las 56 texturas de TEXTURE_PRESETS conservan cantidad exacta y ninguna tiene color primario blanco lavado', () => {
  assert.strictEqual(S.TEXTURE_PRESETS.length, 56);
  for (const tp of S.TEXTURE_PRESETS) {
    const prim = (tp.primary || '').toLowerCase();
    assert.ok(/^#[0-9a-f]{6}$/.test(prim), `Color primario inválido en ${tp.id}: ${prim}`);
    assert.ok(!COLORES_BLANCOS_LAVADOS.has(prim), `El preset ${tp.id} sigue teniendo color primario blanco/lavado (${prim})`);
  }
});

t('STATE arranca con colores ricos y modo por pieza activo (useGlobalMaterial = false)', () => {
  assert.strictEqual(S.STATE.useGlobalMaterial, false);
  assert.ok(!COLORES_BLANCOS_LAVADOS.has(S.STATE.primaryColor.toLowerCase()), 'STATE.primaryColor no debe ser blanco');
  assert.ok(!COLORES_BLANCOS_LAVADOS.has(S.STATE.clothColor.toLowerCase()), 'STATE.clothColor no debe ser blanco');
});

t('cada pieza de armadura, escudo y arma en ITEMS_DB resuelve a un preset colorido válido', () => {
  const ranuras = ['helmet', 'shoulders', 'torso', 'gloves', 'belt', 'tassets', 'cuisses', 'knees', 'boots', 'shield', 'weapon'];
  for (const slot of ranuras) {
    const items = S.ITEMS_DB[slot];
    assert.ok(Array.isArray(items) && items.length > 1, `Ranura vacía: ${slot}`);
    const coloresVistos = new Set();
    for (let idx = 1; idx < items.length; idx++) {
      S.STATE.equipment[slot] = idx;
      S.STATE.slotTextures[slot] = null;
      S.STATE.useGlobalMaterial = false;
      const tp = S.resolveSlotTexturePreset(slot);
      assert.ok(tp && tp.id, `Sin preset por defecto para ${slot}[${idx}] (${items[idx].name})`);
      assert.ok(!COLORES_BLANCOS_LAVADOS.has(tp.primary.toLowerCase()), `${slot}[${idx}] resolvió a blanco: ${tp.primary}`);
      coloresVistos.add(tp.primary.toLowerCase());
    }
    assert.ok(coloresVistos.size >= 3, `La ranura ${slot} debe ofrecer variedad real de colores (encontrados: ${coloresVistos.size})`);
  }
});

t('los 15 CHARACTER_PRESETS (incluidos Lineage II 12-15) resuelven a una textura válida sin caer en blanco', () => {
  assert.strictEqual(S.CHARACTER_PRESETS.length, 15);
  for (const cp of S.CHARACTER_PRESETS) {
    const tp = S.findTexturePreset(cp.texturePreset);
    assert.ok(tp, `CHARACTER_PRESET "${cp.name}" referencia una textura inexistente: ${cp.texturePreset}`);
    assert.ok(!COLORES_BLANCOS_LAVADOS.has(tp.primary.toLowerCase()), `CHARACTER_PRESET "${cp.name}" usa primario blanco: ${tp.primary}`);
  }
});

t('visor-mundo.html invalida la caché IndexedDB antigua de héroes blancos', () => {
  const visorHtml = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');
  assert.ok(visorHtml.includes("DB_HEROE = 'rpg-heroe-glb-v2'"), 'DB_HEROE debe usar v2 para regenerar GLB en color');
});

console.log(`Total: ${n} pruebas pasadas.`);
