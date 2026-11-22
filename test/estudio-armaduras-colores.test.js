// Pruebas del estudio de armaduras Armaduras-glb, texturas, grados D..SR, skills por arma, rostros y aldeanos.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

const htmlPath = path.join(__dirname, '..', 'estudio-armaduras', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Extraer tablas declarativas de la nueva versión de estudio-armaduras/index.html
const iState = html.indexOf('const STATE = {');
const iFit = html.indexOf('const FIT_DEFAULTS =');
const iApply = html.indexOf('function applyArmorLook(');
const iVil = html.indexOf('const VILLAGER_PROFESSIONS = [');
const iVilEnd = html.indexOf('function buildVillagerWardrobe(');
const iFace = html.indexOf('const FACE_TEXTURES = {');
const iFaceEnd = html.indexOf('const _FACE_TEX_CACHE =');
assert.ok(iState > 0 && iFit > iState && iApply > iFit && iVil > 0 && iVilEnd > iVil && iFace > 0 && iFaceEnd > iFace,
  'Deben existir los bloques declarativos actualizados en estudio-armaduras/index.html');

const snippet = [
  html.slice(iState, iApply),
  html.slice(iVil, iVilEnd),
  html.slice(iFace, iFaceEnd),
  'module.exports = { STATE, ITEMS_DB, WEAPON_LOADOUT, WEAPON_CLASS_SKILLS, TEXTURE_PRESETS, CHARACTER_PRESETS, ARMOR_CLASSES, ARMOR_RANKS, ARMOR_LOOKS, VILLAGER_PROFESSIONS, VILLAGER_PALETTES, FACE_TEXTURES };'
].join('\n');

const ctx = { module: { exports: {} }, Math, Array, Object, Set, JSON, console };
vm.runInNewContext(snippet, ctx);
const S = ctx.module.exports;

const COLORES_BLANCOS_LAVADOS = new Set([
  '#ffffff', '#f8fafc', '#f1f5f9', '#fffbeb', '#fdf4ff', '#e2e8f0', '#e0f2fe', '#cbd5e1', '#f0f9ff'
]);

t('TEXTURE_PRESETS conserva paleta cromática variada con hex válidos', () => {
  assert.ok(Array.isArray(S.TEXTURE_PRESETS) && S.TEXTURE_PRESETS.length >= 50, 'TEXTURE_PRESETS poblado');
  const prims = new Set();
  let saturadas = 0;
  for (const tp of S.TEXTURE_PRESETS) {
    const prim = (tp.primary || '').toLowerCase();
    assert.ok(/^#[0-9a-f]{6}$/.test(prim), `Color primario inválido en ${tp.id}: ${prim}`);
    if (!COLORES_BLANCOS_LAVADOS.has(prim)) saturadas++;
    prims.add(prim);
  }
  assert.ok(prims.size >= 25, 'Debe existir gran variedad cromática entre armaduras');
  assert.ok(saturadas >= 45, 'La mayoría de sets conserva tonos ricos no lavados');
});

t('STATE arranca con material, acabado metálico/tela y colores ricos (no blancos planos)', () => {
  assert.ok(S.STATE.materialType && S.STATE.surfaceTexture, 'STATE tiene preset de textura inicial');
  assert.ok(!COLORES_BLANCOS_LAVADOS.has(S.STATE.secondaryColor.toLowerCase()), 'STATE.secondaryColor no debe ser blanco');
  assert.ok(!COLORES_BLANCOS_LAVADOS.has(S.STATE.clothColor.toLowerCase()), 'STATE.clothColor no debe ser blanco');
  assert.ok(S.STATE.fit && S.STATE.fit.villagerOutfit === null, 'STATE.fit.villagerOutfit empieza nulo');
});

t('ARMOR_RANKS cubre D..SR y ARMOR_CLASSES cubre pesada, ligera y mago con looks reales', () => {
  ['D', 'C', 'B', 'A', 'S', 'SR'].forEach(r => assert.ok(S.ARMOR_RANKS[r], 'Falta ARMOR_RANKS.' + r));
  ['pesada', 'ligera', 'mago'].forEach(c => assert.ok(S.ARMOR_CLASSES[c], 'Falta ARMOR_CLASSES.' + c));
  assert.ok(Array.isArray(S.ARMOR_LOOKS) && S.ARMOR_LOOKS.length >= 50, 'ARMOR_LOOKS debe incluir sets completos');
  for (const r of ['D', 'C', 'B', 'A', 'S', 'SR']) {
    for (const c of ['pesada', 'ligera', 'mago']) {
      assert.ok(S.ARMOR_LOOKS.some(l => l.rank === r && l.cls === c), `Debe haber al menos un look para ${c} grado ${r}`);
    }
  }
});

t('WEAPON_CLASS_SKILLS, CHARACTER_PRESETS, VILLAGER_PROFESSIONS y FACE_TEXTURES están completos con sus 57 texturas en disco', () => {
  assert.ok(Object.keys(S.WEAPON_CLASS_SKILLS).length >= 9);
  assert.ok(Array.isArray(S.CHARACTER_PRESETS) && S.CHARACTER_PRESETS.length >= 15);
  assert.ok(Array.isArray(S.VILLAGER_PROFESSIONS) && S.VILLAGER_PROFESSIONS.length >= 8);
  const faceEntries = Object.entries(S.FACE_TEXTURES).filter(([, v]) => v && v.url);
  assert.ok(faceEntries.length >= 40, 'FACE_TEXTURES debe ofrecer rostros configurables');
  for (const [id, f] of faceEntries) {
    const texFile = path.join(__dirname, '..', 'estudio-armaduras', f.url);
    assert.ok(fs.existsSync(texFile), `Falta archivo de textura de rostro ${id}: ${texFile}`);
  }
  const texDir = fs.readdirSync(path.join(__dirname, '..', 'estudio-armaduras', 'textures'));
  assert.strictEqual(texDir.length, 57, 'Deben existir los 57 ficheros en estudio-armaduras/textures/');
});

t('el puente postMessage del estudio y visor-mundo.html soportan rostros fijados, aldeanos y caché v3', () => {
  ['exportar-personaje', 'exportar-aldeano', 'listar-rostros', 'bloquear-rostro'].forEach(cmd => {
    assert.ok(html.includes(cmd), `Falta comando bridge '${cmd}' en estudio-armaduras/index.html`);
  });
  const visorHtml = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');
  assert.ok(visorHtml.includes("DB_HEROE = 'rpg-heroe-glb-v4'"), 'DB_HEROE debe usar v4 para incluir rostro fijado, grados y clips/marcadores de arma del Estudio');
  assert.ok(visorHtml.includes('id="crear-rostro"') && visorHtml.includes('id="crear-aldeano"'), 'visor-mundo debe integrar selector de rostro y creador de aldeanos');
});

console.log(`Total: ${n} pruebas pasadas.`);
