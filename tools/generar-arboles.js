// Convierte los modelos GLB de árboles en js/arboles.js (datos incrustados, sin cargas asíncronas).
// Uso: node tools/generar-arboles.js <carpeta con los .glb y catalogo.json> <salida js/arboles.js>
// Solo lee la malla (posiciones, normales, UV, índices) y la textura PNG del primer material.
const fs = require('fs');
const path = require('path');

const dirIn = process.argv[2], fileOut = process.argv[3];
if (!dirIn || !fileOut) { console.error('Uso: node tools/generar-arboles.js <carpeta> <salida.js>'); process.exit(1); }

function leerGlb(file) {
  const b = fs.readFileSync(file);
  if (b.toString('ascii', 0, 4) !== 'glTF') throw new Error(file + ': no es GLB');
  const jl = b.readUInt32LE(12);
  const j = JSON.parse(b.toString('utf8', 20, 20 + jl));
  const binStart = 20 + jl + 8;
  const bin = b.subarray(binStart);
  const readAcc = (idx, Ctor) => {
    const a = j.accessors[idx], bv = j.bufferViews[a.bufferView];
    const size = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[a.type];
    const total = a.count * size;
    const off = (bv.byteOffset || 0) + (a.byteOffset || 0);
    const out = new Ctor(total);
    const stride = bv.byteStride || 0;
    const bytesPer = Ctor.BYTES_PER_ELEMENT;
    for (let i = 0; i < a.count; i++) {
      for (let k = 0; k < size; k++) {
        const pos = off + i * (stride || size * bytesPer) + k * bytesPer;
        out[i * size + k] = Ctor === Uint16Array ? bin.readUInt16LE(pos) : bin.readFloatLE(pos);
      }
    }
    return out;
  };
  const prim = j.meshes[0].primitives[0];
  const pos = readAcc(prim.attributes.POSITION, Float32Array);
  const nrm = prim.attributes.NORMAL !== undefined ? readAcc(prim.attributes.NORMAL, Float32Array) : new Float32Array(pos.length);
  const uv = prim.attributes.TEXCOORD_0 !== undefined ? readAcc(prim.attributes.TEXCOORD_0, Float32Array) : new Float32Array(pos.length / 3 * 2);
  const idx = readAcc(prim.indices, Uint16Array);
  const img = j.images[0];
  const bv = j.bufferViews[img.bufferView];
  const png = bin.subarray(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
  let maxY = 0;
  for (let i = 1; i < pos.length; i += 3) maxY = Math.max(maxY, pos[i]);
  return { pos, nrm, uv, idx, png, alto: maxY, tri: idx.length / 3 };
}

const catalogo = JSON.parse(fs.readFileSync(path.join(dirIn, 'catalogo.json'), 'utf8'));
const b64 = (arr) => Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength).toString('base64');
const modelos = {};
catalogo.forEach(c => {
  const m = leerGlb(path.join(dirIn, path.basename(c.archivo)));
  modelos[c.id] = {
    nombre: c.nombre, licencia: c.licencia, autor: c.autor, fuente: c.fuente,
    alto: Math.round(m.alto * 100) / 100, triangulos: m.tri,
    pos: b64(m.pos), nrm: b64(m.nrm), uv: b64(m.uv), idx: b64(m.idx),
    png: 'data:image/png;base64,' + Buffer.from(m.png).toString('base64')
  };
});

const cuerpo = `// Árboles de los modelos de Kenney (Nature Kit, CC0 1.0), convertidos con tools/generar-arboles.js.
// No editar a mano: se regenera desde los .glb. Ver docs/ASSETS.md.
(function (root) {
  'use strict';
  function decode(b64, Ctor) {
    const bin = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Ctor(bytes.buffer);
  }
  const RAW = ${JSON.stringify(modelos)};
  const api = {
    especies: Object.keys(RAW),
    info(id) { const m = RAW[id]; return { nombre: m.nombre, licencia: m.licencia, autor: m.autor, fuente: m.fuente, alto: m.alto, triangulos: m.triangulos }; },
    // Datos listos para THREE.BufferGeometry (se decodifican una vez por especie)
    datos(id) {
      const m = RAW[id];
      if (!m) return null;
      if (!m._cache) m._cache = { pos: decode(m.pos, Float32Array), nrm: decode(m.nrm, Float32Array), uv: decode(m.uv, Float32Array), idx: decode(m.idx, Uint16Array), png: m.png, alto: m.alto };
      return m._cache;
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TreeLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
`;
fs.writeFileSync(fileOut, cuerpo, 'utf8');
console.log('escrito', fileOut, 'especies:', Object.keys(modelos).join(', '), 'tamaño', fs.statSync(fileOut).size, 'bytes');
