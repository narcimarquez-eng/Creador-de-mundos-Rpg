// Props procedurales portados de New-Rol (generados en código, sin archivos): roca de lajas y cantos,
// arbusto, seto y valla. Las funciones devuelven BufferGeometry con color por vértice (o sin color, para
// teñirlas por instancia). Se usan desde js/decorado.js.
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

// ---------------------------------------------------------------- ruido
function hash2(x, y, seed = 0) {
  let h = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function noise2(x, y, seed = 0) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, seed), b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed), d = hash2(xi + 1, yi + 1, seed);
  const lerp = (p, q, t) => p + (q - p) * t;
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}
function fbm(x, y, seed = 0, oct = 3) {
  let s = 0, amp = 0.5, f = 1, norm = 0;
  for (let i = 0; i < oct; i++) {
    s += noise2(x * f, y * f, seed + i * 17) * amp;
    norm += amp; amp *= 0.5; f *= 2;
  }
  return s / norm;
}

// ---------------------------------------------------------------- utilidades
// Deforma una geometría con ruido coherente por posición (sin grietas entre caras)
function rockify(geo, amp = 0.15, seed = 1, freq = 2.3) {
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = hash2(Math.round(v.x * 100 * freq), Math.round((v.y * 37 + v.z) * 100 * freq), seed) - 0.5;
    const len = v.length() || 1;
    v.multiplyScalar(1 + (n * amp * 2) / len);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

// Pieza con su transformación y su color por vértice (más oscuro abajo, para dar volumen)
function spart(geo, color, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1, ao = 0.18, flat = false } = {}) {
  let g = geo;
  for (const k of Object.keys(g.attributes)) if (k !== 'position') g.deleteAttribute(k);
  if (flat) g = g.index ? g.toNonIndexed() : g;
  else if (!g.index) g = mergeVertices(g, 1e-4);
  g.applyMatrix4(new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
    new THREE.Vector3(sx, sy, sz),
  ));
  g.computeVertexNormals();
  g.computeBoundingBox();
  const bb = g.boundingBox;
  const c = new THREE.Color(color);
  const pos = g.attributes.position;
  const arr = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const t = bb.max.y - bb.min.y > 1e-4 ? (pos.getY(i) - bb.min.y) / (bb.max.y - bb.min.y) : 1;
    const k = 1 - ao * (1 - t);
    arr[i * 3] = c.r * k; arr[i * 3 + 1] = c.g * k; arr[i * 3 + 2] = c.b * k;
  }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return g;
}

function smerge(partes) {
  const anyIndexed = partes.some(p => p.index);
  const norm = anyIndexed ? partes.map(p => (p.index ? p : mergeVertices(p))) : partes;
  return mergeGeometries(norm, false);
}

// Pieza plana con color uniforme (para el valla)
function part(geo, color, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1 } = {}) {
  let g = geo.index ? geo.toNonIndexed() : geo;
  g.deleteAttribute('uv');
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
    new THREE.Vector3(sx, sy, sz),
  );
  g.applyMatrix4(m);
  g.computeVertexNormals();
  const c = new THREE.Color(color);
  const n = g.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return g;
}
const merge = partes => mergeGeometries(partes, false);

// ---------------------------------------------------------------- props
// Roca suelta: esfera deformada con ruido coherente, base aplastada para asentarse en el suelo.
// Sin color (se tiñe por instancia). seed cambia la forma.
export function rocaGeo(seed = 1, detalle = 3) {
  let g = new THREE.IcosahedronGeometry(1, detalle);
  g.deleteAttribute('normal'); g.deleteAttribute('uv');
  g = mergeVertices(g, 1e-4);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const n = fbm(x * 1.3 + seed * 5.3 + y * 0.7, z * 1.3 - y * 0.9 + seed * 1.7, seed + 3, 4);
    const k = 0.72 + n * 0.6;
    let ny = y * k * 0.72;
    if (ny < -0.15) ny = -0.15 + (ny + 0.15) * 0.25;   // base plana
    pos.setXYZ(i, x * k * (1 + (seed % 3) * 0.08), ny + 0.2, z * k);
  }
  g.computeVertexNormals();
  return g;
}

// Arbusto: tres masas de follaje sobre un tronco corto
export function arbustoGeo(pal = {}) {
  const verde = pal.verde ?? 0x4f7a3a, verde2 = pal.verde2 ?? 0x6b9a48;
  return smerge([
    spart(rockify(new THREE.IcosahedronGeometry(1.1, 1), 0.12, 8), verde, { y: 0.75, sy: 0.8, ao: 0.45 }),
    spart(rockify(new THREE.IcosahedronGeometry(0.8, 1), 0.12, 9), verde2, { x: 0.6, y: 1.15, z: 0.2, ao: 0.3 }),
    spart(rockify(new THREE.IcosahedronGeometry(0.7, 1), 0.12, 10), verde, { x: -0.6, y: 1.0, z: -0.3, ao: 0.3 }),
  ]);
}

// Seto: bloque denso de 4 m, para lindes de campo
export function setoGeo(pal = {}) {
  const verde = pal.verde ?? 0x3d6b33, verde2 = pal.verde2 ?? 0x4f8040;
  return smerge([
    spart(new THREE.BoxGeometry(4, 3, 4, 2, 2, 2), verde, { y: 1.5, ao: 0.5 }),
    spart(rockify(new THREE.IcosahedronGeometry(1.6, 1), 0.12, 11), verde2, { x: -1, y: 3, z: -1, ao: 0.3 }),
    spart(rockify(new THREE.IcosahedronGeometry(1.6, 1), 0.12, 12), verde2, { x: 1, y: 3.2, z: 1, ao: 0.3 }),
    spart(rockify(new THREE.IcosahedronGeometry(1.4, 1), 0.12, 13), verde, { x: 1, y: 2.9, z: -1.1, ao: 0.3 }),
    spart(rockify(new THREE.IcosahedronGeometry(1.4, 1), 0.12, 14), verde, { x: -1.1, y: 3.1, z: 1, ao: 0.3 }),
  ]);
}

// Valla de madera: tres postes y dos largueros, de 4 m (alongX: a lo largo del eje X)
export function vallaGeo(pal = {}, alongX = true) {
  const madera = pal.madera ?? 0x7a5a36, madera2 = pal.madera2 ?? 0x6b4a2b;
  const rot = alongX ? 0 : Math.PI / 2;
  const cos = Math.cos(rot), sin = Math.sin(rot);
  const partes = [];
  for (const t of [-1.8, 0, 1.8]) {
    partes.push(part(new THREE.BoxGeometry(0.3, 1.4, 0.3), madera, { x: t * cos, y: 0.7, z: -t * sin }));
  }
  partes.push(part(new THREE.BoxGeometry(4, 0.18, 0.12), madera2, { y: 1.0, ry: rot }));
  partes.push(part(new THREE.BoxGeometry(4, 0.18, 0.12), madera2, { y: 0.55, ry: rot }));
  return merge(partes);
}
