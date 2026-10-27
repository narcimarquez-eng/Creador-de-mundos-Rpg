// Hornea los árboles realistas (ez-tree, MIT, de New-Rol) en js/arboles.js.
// Cada especie se genera en dos niveles de detalle: «cerca» (más hojas) y «lejos» (menos hojas).
// Uso: cd tools && npm install && node hornear-arboles.mjs ../js/arboles.js
// Las texturas salen de assets/arboles/tex (ver reducir-texturas-arboles.py).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Tree } from './vendor/ez-tree/tree.js';

const aquí = path.dirname(fileURLToPath(import.meta.url));
const salida = process.argv[2];
if (!salida) { console.error('Uso: node hornear-arboles.mjs <salida js/arboles.js>'); process.exit(1); }
const texDir = path.join(aquí, '..', 'assets', 'arboles', 'tex');

// Presets de ez-tree y altura final en metros (igual que los tipos de vegetación de New-Rol)
const ESPECIES = {
  roble:   { preset: 'Oak Medium',   alto: 9.5,  corteza: 'corteza_roble.jpg', hoja: 'hoja_roble.png',  tinta: 0xd8e8b0, seed: 4242 },
  alamo:   { preset: 'Aspen Medium', alto: 10.5, corteza: 'corteza_abedul.jpg', hoja: 'hoja_alamo.png', tinta: 0xe2ecc0, seed: 5151 },
  pino:    { preset: 'Pine Medium',  alto: 11,   corteza: 'corteza_pino.jpg',  hoja: 'hoja_pino.png',   tinta: 0xbfd8a8, seed: 3131 },
  arbusto: { preset: 'Bush 1',       alto: 2.0,  corteza: 'corteza_roble.jpg', hoja: 'hoja_roble.png',  tinta: 0xc8e0a0, seed: 7373 }
};
// Detalle por nivel: fracción de hojas, secciones y segmentos radiales de las ramas (menos = menos triángulos)
const NIVELES = {
  // «cerca»: árboles junto al pueblo. «lejos»: el bosque, que es casi todo lo demás.
  cerca: { hojas: 0.4, secciones: { 0: 8, 1: 6, 2: 5, 3: 4 }, segmentos: { 0: 6, 1: 5, 2: 4, 3: 3 }, hijos: null, niveles: 3 },
  lejos: { hojas: 0.3, secciones: { 0: 4, 1: 3, 2: 3, 3: 2 }, segmentos: { 0: 4, 1: 3, 2: 3, 3: 3 }, hijos: null, niveles: 2 }
};

function aBase64(arr) { return Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength).toString('base64'); }
function imagenDataUri(file) {
  const ext = path.extname(file) === '.png' ? 'png' : 'jpeg';
  return `data:image/${ext};base64,` + fs.readFileSync(path.join(texDir, file)).toString('base64');
}

// Geometría de una malla de ez-tree, ya normalizada: posiciones, normales, UV e índices
// Cuantización: posiciones y UV en Int16 (escala 1/1024: precisión de 1 mm y rango de ±32 m), normales en Int8
const ESCALA = 1024;
function cuantizar(arr, escala, Ctor) {
  const out = new Ctor(arr.length);
  for (let i = 0; i < arr.length; i++) out[i] = Math.max(-32767, Math.min(32767, Math.round(arr[i] * escala)));
  return out;
}
function extraer(geo) {
  const pos = geo.attributes.position.array, nrm = geo.attributes.normal.array;
  const uv = geo.attributes.uv ? geo.attributes.uv.array : new Float32Array(pos.length / 3 * 2);
  const idx = geo.index.array;
  if (pos.length / 3 > 65535) throw new Error('demasiados vértices para índices de 16 bits');
  const nrm8 = cuantizar(nrm, 127, Int8Array);
  return {
    pos: aBase64(cuantizar(pos, ESCALA, Int16Array)), nrm: aBase64(nrm8),
    uv: aBase64(cuantizar(uv, ESCALA, Int16Array)), idx: aBase64(new Uint16Array(idx)),
    vertices: pos.length / 3, triangulos: idx.length / 3
  };
}

function generar(esp, cfg) {
  const t = new Tree();
  t.loadPreset(esp.preset);
  t.options.seed = esp.seed;
  t.options.bark.textured = false;
  t.options.leaves.count = Math.max(4, Math.round(t.options.leaves.count * cfg.hojas));
  t.options.branch.levels = Math.min(t.options.branch.levels, cfg.niveles);
  Object.assign(t.options.branch.sections, cfg.secciones);
  Object.assign(t.options.branch.segments, cfg.segmentos);
  if (cfg.hijos) Object.assign(t.options.branch.children, cfg.hijos);
  t.generate();
  const ramas = t.branchesMesh.geometry, hojas = t.leavesMesh.geometry;
  ramas.computeBoundingBox(); hojas.computeBoundingBox();
  const caja = ramas.boundingBox.clone().union(hojas.boundingBox);
  // Escala a la altura final y apoya la base en y = 0 (igual que en New-Rol)
  const s = esp.alto / Math.max(0.01, caja.max.y - caja.min.y);
  return { ramas, hojas, s, baseY: caja.min.y };
}

const TEX = {};
const datos = {};
for (const [id, esp] of Object.entries(ESPECIES)) {
  TEX[esp.corteza] = TEX[esp.corteza] || imagenDataUri(esp.corteza);
  TEX[esp.hoja] = TEX[esp.hoja] || imagenDataUri(esp.hoja);
  datos[id] = { alto: esp.alto, tinta: esp.tinta, corteza: esp.corteza, hoja: esp.hoja, niveles: {} };
  for (const [nivel, cfg] of Object.entries(NIVELES)) {
    const { ramas, hojas, s, baseY } = generar(esp, cfg);
    // Escalar y apoyar en el suelo (las normales no cambian con una escala uniforme)
    for (const g of [ramas, hojas]) {
      const p = g.attributes.position.array;
      for (let i = 0; i < p.length; i += 3) { p[i] *= s; p[i + 1] = (p[i + 1] - baseY) * s; p[i + 2] *= s; }
      g.attributes.position.needsUpdate = true;
      g.computeBoundingBox();
    }
    // Normales de hojas «esféricas» desde el centro de la copa (luz más suave, como en New-Rol)
    const bb = hojas.boundingBox;
    const cen = { x: (bb.min.x + bb.max.x) / 2, y: (bb.min.y + bb.max.y) / 2, z: (bb.min.z + bb.max.z) / 2 };
    const P = hojas.attributes.position.array, N = hojas.attributes.normal.array;
    for (let i = 0; i < P.length; i += 3) {
      let vx = P[i] - cen.x, vy = P[i + 1] - cen.y, vz = P[i + 2] - cen.z;
      const vl = Math.hypot(vx, vy, vz) || 1; vx /= vl; vy /= vl; vz /= vl;
      let nx = N[i] * 0.4 + vx * 0.6, ny = N[i + 1] * 0.4 + vy * 0.6 + 0.2, nz = N[i + 2] * 0.4 + vz * 0.6;
      const nl = Math.hypot(nx, ny, nz) || 1;
      N[i] = nx / nl; N[i + 1] = ny / nl; N[i + 2] = nz / nl;
    }
    const r = extraer(ramas), h = extraer(hojas);
    datos[id].niveles[nivel] = { ramas: r, hojas: h };
    console.log(id, nivel, 'ramas', r.triangulos, 'tri', 'hojas', h.triangulos, 'tri');
  }
}

const cuerpo = `// Árboles realistas generados con ez-tree (MIT, Daniel Greenheck; copiado de New-Rol) y horneados con
// tools/hornear-arboles.mjs. Texturas de corteza y hojas CC0 (Poly Haven y TextureCan, vía New-Rol).
// No editar a mano: se regenera con el horneador. Ver docs/ASSETS.md.
(function (root) {
  'use strict';
  function decode(b64, Ctor) {
    const bin = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Ctor(bytes.buffer);
  }
  const TEX = ${JSON.stringify(TEX)};
  const RAW = ${JSON.stringify(datos)};
  const cache = {};
  const api = {
    especies: Object.keys(RAW),
    niveles: ${JSON.stringify(Object.keys(NIVELES))},
    tinta(id) { return RAW[id] ? RAW[id].tinta : null; },
    alto(id) { return RAW[id] ? RAW[id].alto : null; },
    textura(nombre) { return TEX[nombre] || null; },
    corteza(id) { return RAW[id] ? RAW[id].corteza : null; },
    hoja(id) { return RAW[id] ? RAW[id].hoja : null; },
    // Malla de un árbol en un nivel de detalle: { ramas, hojas } con arrays listos para THREE.BufferGeometry
    datos(id, nivel) {
      const e = RAW[id] && RAW[id].niveles[nivel];
      if (!e) return null;
      const key = id + ':' + nivel;
      if (!cache[key]) {
        // Se descuantiza a Float32 para THREE.BufferAttribute (posiciones /1024, normales /127, UV /1024)
      const f = (b64, Ctor, escala) => { const q = decode(b64, Ctor); const o = new Float32Array(q.length); for (let i = 0; i < q.length; i++) o[i] = q[i] / escala; return o; };
      const parte = (p) => ({ pos: f(p.pos, Int16Array, 1024), nrm: f(p.nrm, Int8Array, 127), uv: f(p.uv, Int16Array, 1024), idx: decode(p.idx, Uint16Array) });
        cache[key] = { ramas: parte(e.ramas), hojas: parte(e.hojas) };
      }
      return cache[key];
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TreeLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
`;
fs.writeFileSync(salida, cuerpo, 'utf8');
console.log('escrito', salida, fs.statSync(salida).size, 'bytes');
