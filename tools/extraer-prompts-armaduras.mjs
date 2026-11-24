import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ArmadurasLib = require('../js/armaduras.js');

const root = path.join(__dirname, '..');
const catalogo = JSON.parse(
  fs.readFileSync(path.join(root, 'estudio-armaduras', 'catalogo.json'), 'utf8')
);

const PALETA_NOMBRES = [
  ['obsidian black', [20, 22, 28]],
  ['charcoal iron', [52, 58, 70]],
  ['dark slate steel', [75, 88, 108]],
  ['burnished silver', [185, 198, 215]],
  ['ivory bone', [232, 226, 205]],
  ['chestnut brown leather', [115, 58, 24]],
  ['amber bronze', [185, 110, 32]],
  ['burnished gold', [235, 185, 48]],
  ['deep crimson', [150, 28, 32]],
  ['glowing ruby red', [225, 55, 65]],
  ['forest emerald green', [24, 118, 72]],
  ['jade cyan', [42, 185, 165]],
  ['deep sapphire blue', [28, 78, 175]],
  ['midnight indigo', [34, 42, 110]],
  ['arcane violet', [128, 62, 195]],
  ['celestial cyan glow', [90, 205, 245]]
];

function hexARgb(hex) {
  const m = String(hex || '').trim().match(/^#?([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function describirColor(hex) {
  const rgb = hexARgb(hex);
  if (!rgb) return 'dark steel';
  let best = PALETA_NOMBRES[0][0];
  let bestD = Infinity;
  for (const [nom, ref] of PALETA_NOMBRES) {
    const d = (rgb[0] - ref[0]) ** 2 + (rgb[1] - ref[1]) ** 2 + (rgb[2] - ref[2]) ** 2;
    if (d < bestD) {
      bestD = d;
      best = nom;
    }
  }
  return best;
}

const MOTIVOS = [
  [/solar|sol\b|aureo|dorad/i, 'sunburst golden crest engravings'],
  [/eclipse|luna|nocturn|noche|sombra|umbr/i, 'crescent eclipse twilight motifs'],
  [/drag[oó]n|escam|drak/i, 'dragonscale layered plates'],
  [/hielo|escarcha|glaci|frio|invierno/i, 'crystalline frost ice accents'],
  [/fuego|flam|bras|ascua|infier|volc/i, 'smoldering ember runes'],
  [/esmerald|bosque|caza|forest|hoj/i, 'sylvan forest leaf filigree'],
  [/g[oó]tic|oscur|abism|cripta/i, 'dark Gothicpointed cathedral armor ribs'],
  [/[eé]lfic|mithril|plata/i, 'slender elven silver filigree'],
  [/cruzad|templar|palad|sagr|luz|celest/i, 'sacred paladin heraldic trim'],
  [/dinast|real|imperi|coron|monar/i, 'royal imperial dynasty ornamentation'],
  [/astral|arcana|r[uú]n|et[eé]r|cosmos/i, 'glowing arcane rune sigils'],
  [/sangre|carmes|rub[ií]/i, 'crimson bloodstone inlays']
];

function extraerMotivos(texto) {
  const out = [];
  const t = String(texto || '');
  for (const [re, desc] of MOTIVOS) {
    if (re.test(t) && !out.includes(desc)) out.push(desc);
  }
  return out.slice(0, 3).join(', ');
}

const CLASE_SILUETA = {
  pesada: 'heavy medieval full-plate knight armor mannequin bust with layered sculpted pauldrons',
  ligera: 'agile medieval fantasy ranger leather brigandine armor torso bust with crossed straps and compact shoulder guards',
  mago: 'ornate fantasy battlemage grand arcane robe bust with high collar, embroidered stole and runic sash'
};

const GRADO_PRESTIGIO = {
  D: 'weathered practical starter craftsmanship, modest iron rivets',
  C: 'polished veteran guild forged trim',
  B: 'masterwork battle-ready etched plates and fine trim',
  A: 'aristocratic high-rank fantasy armor with ornate engravings',
  S: 'radiant epic champion relic armor with luminous rune aura',
  SR: 'mythic legendary royal artifact armor glowing with transcendent arcane filigree'
};

const PIEZA_SILUETA = {
  helmet: {
    pesada: 'medieval knight steel full helm',
    ligera: 'fantasy ranger hooded leather mask and visored cap',
    mago: 'ornate fantasy arcane circlet tiara crown'
  },
  torso: {
    pesada: 'heavy sculpted knight plate cuirass breastplate',
    ligera: 'fitted fantasy ranger leather brigandine vest',
    mago: 'embroidered fantasy battlemage arcane robe vestment'
  },
  gloves: {
    pesada: 'pair of articulated steel knight gauntlets',
    ligera: 'pair of reinforced leather archer bracers and gloves',
    mago: 'pair of gilded cloth mage spellcaster cuffs and gloves'
  },
  pants: {
    pesada: 'knight steel cuisses thigh plates and tassets greaves',
    ligera: 'reinforced medieval ranger leather leg armor trousers',
    mago: 'ornate flowing battlemage rune skirt tassets'
  },
  boots: {
    pesada: 'pair of heavy steel sabaton armored boots',
    ligera: 'pair of agile buckled leather hunter boots',
    mago: 'pair of gilded ritual mage boots with cloth cuffs'
  }
};

function describirArma(w) {
  const nom = String(w.nombre || '');
  const fam = String(w.claseArma || w.familia || '').toLowerCase();
  const motivos = extraerMotivos(nom);
  const gDesc = GRADO_PRESTIGIO[w.grado] || GRADO_PRESTIGIO.D;
  let base = 'gleaming medieval steel broadsword';
  if (w.ranura === 'shield') base = 'medieval kite tower battle shield with heraldic boss';
  else if (fam.includes('mandoble')) base = 'massive two-handed medieval greatsword';
  else if (fam.includes('arco')) base = 'carved medieval recurve war longbow with taut string';
  else if (fam.includes('bast')) base = 'ornate fantasy mage crystal-topped wooden spell staff';
  else if (fam.includes('daga')) base = 'curved medieval fantasy assassin dagger blade';
  else if (fam.includes('lanz')) base = 'long medieval steel-tipped halberd war spear';
  else if (fam.includes('hacha_2m')) base = 'heavy two-handed double-bit battle axe';
  else if (fam.includes('hacha')) base = 'bearded medieval iron war battle axe';
  else if (fam.includes('maza')) base = 'flanged medieval steel knight warhammer mace';
  return `RPG game inventory weapon icon of a single ${base}, ${gDesc}${motivos ? ', ' + motivos : ''}, diagonal centered weapon silhouette`;
}

const SETS_MUESTRA = new Set(['pesada_D_1', 'ligera_B_1', 'mago_SR_1']);
const PIEZAS_MUESTRA_SETS = new Set(['pesada_D_1', 'mago_SR_1']);
const ARMAS_MUESTRA = new Set(['weapon_1', 'weapon_2', 'shield_1']);

const sets = ArmadurasLib.SETS_ARMADURA.map((s, idx) => {
  const prim = describirColor(s.paleta && s.paleta.primary);
  const sec = describirColor(s.paleta && s.paleta.secondary);
  const cloth = describirColor(s.paleta && s.paleta.cloth);
  const glow = describirColor(s.paleta && s.paleta.glow);
  const motivos = extraerMotivos(`${s.nombre} ${s.diseno}`);
  const sil = CLASE_SILUETA[s.claseArmadura] || CLASE_SILUETA.pesada;
  const grad = GRADO_PRESTIGIO[s.grado] || GRADO_PRESTIGIO.D;
  return {
    id: s.id,
    nombre: s.nombre,
    claseArmadura: s.claseArmadura,
    grado: s.grado,
    nivel: s.nivel,
    archivo: `sets/${s.id}.webp`,
    width: 256,
    height: 256,
    gen_width: 768,
    gen_height: 768,
    seed: 8100 + idx,
    muestra: SETS_MUESTRA.has(s.id),
    prompt: `RPG equipment set portrait icon of ${sil} crafted in ${prim} with ${sec} trim, ${cloth} fabric underlayer, subtle ${glow} rune highlights, ${grad}${motivos ? ', ' + motivos : ''}, centered three-quarter studio bust without human head or face`
  };
});

const piezas = [];
let pIdx = 0;
for (const s of ArmadurasLib.SETS_ARMADURA) {
  const prim = describirColor(s.paleta && s.paleta.primary);
  const sec = describirColor(s.paleta && s.paleta.secondary);
  const glow = describirColor(s.paleta && s.paleta.glow);
  const motivos = extraerMotivos(`${s.nombre} ${s.diseno}`);
  const grad = GRADO_PRESTIGIO[s.grado] || GRADO_PRESTIGIO.D;
  for (const ranura of ArmadurasLib.RANURAS_SET) {
    const id = `${s.id}_${ranura}`;
    const pSil = (PIEZA_SILUETA[ranura] && PIEZA_SILUETA[ranura][s.claseArmadura]) || PIEZA_SILUETA.torso.pesada;
    piezas.push({
      id,
      setId: s.id,
      ranura,
      nombre: `${ArmadurasLib.NOMBRES_RANURA_SET[ranura]} · ${s.nombre}`,
      claseArmadura: s.claseArmadura,
      grado: s.grado,
      archivo: `piezas/${id}.webp`,
      width: 128,
      height: 128,
      gen_width: 768,
      gen_height: 768,
      seed: 9100 + pIdx++,
      muestra: PIEZAS_MUESTRA_SETS.has(s.id),
      prompt: `RPG inventory slot icon of an isolated ${pSil} in ${prim} and ${sec} trim with ${glow} accents, ${grad}${motivos ? ', ' + motivos : ''}, single isolated piece centered in square frame`
    });
  }
}

const weaponsList = (catalogo.ranuras && catalogo.ranuras.weapon) || [];
const shieldsList = (catalogo.ranuras && catalogo.ranuras.shield) || [];
const armas = [];
let aIdx = 0;

for (const w of weaponsList) {
  const key = `weapon_${w.idx}`;
  armas.push({
    id: key,
    ranura: 'weapon',
    idx: w.idx,
    nombre: w.nombre,
    grado: w.grado || 'D',
    archivo: `armas/${key}.webp`,
    width: 128,
    height: 128,
    gen_width: 768,
    gen_height: 768,
    seed: 10100 + aIdx++,
    muestra: ARMAS_MUESTRA.has(key),
    prompt: describirArma({ ...w, ranura: 'weapon' })
  });
}

for (const sh of shieldsList) {
  const key = `shield_${sh.idx}`;
  armas.push({
    id: key,
    ranura: 'shield',
    idx: sh.idx,
    nombre: sh.nombre,
    grado: sh.grado || 'D',
    archivo: `armas/${key}.webp`,
    width: 128,
    height: 128,
    gen_width: 768,
    gen_height: 768,
    seed: 10100 + aIdx++,
    muestra: ARMAS_MUESTRA.has(key),
    prompt: describirArma({ ...sh, ranura: 'shield' })
  });
}

const outDir = path.join(root, 'assets', 'armaduras');
fs.mkdirSync(outDir, { recursive: true });

const promptsData = {
  estilo_base: 'dark medieval fantasy oil painting, Lineage 2 RPG equipment icon art, dramatic studio rim lighting, intricate metallic and fabric detail, dark obsidian backdrop, crisp centered silhouette, no text',
  negative_prompt: 'text, watermark, signature, logo, frame, border, human face, bare skin, modern clothes, blurry, lowres, chibi, plastic 3d',
  sets,
  piezas,
  armas
};

fs.writeFileSync(
  path.join(outDir, 'prompts_armaduras.json'),
  JSON.stringify(promptsData, null, 2) + '\n',
  'utf8'
);

const manifestPath = path.join(outDir, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  fs.writeFileSync(
    manifestPath,
    JSON.stringify({
      version: '1.0.0',
      modelo: 'Lykon/dreamshaper-xl-v2-turbo',
      sets: {},
      piezas: {},
      armas: {}
    }, null, 2) + '\n',
    'utf8'
  );
}

console.log(
  `Prompts armaduras generados: sets=${sets.length}, piezas=${piezas.length}, armas=${armas.length}, muestra=${[...sets, ...piezas, ...armas].filter(x => x.muestra).length}`
);
