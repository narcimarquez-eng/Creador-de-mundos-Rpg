// Props realistas de New-Rol, portados al visor (generados en código, sin archivos de terceros):
//  - rocaGeo: canto suelto del modo realista (boulderGeoReal de New-Rol), con ruido fbm.
//  - arbolPartes: arbustos y setos de ez-tree (Bush 1 y Bush 3 de New-Rol), horneados en js/arboles.js
//    (TreeLib), con corteza y hojas recortadas. Las geometrías y materiales se comparten entre usos.
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

// ---------------------------------------------------------------- ruido (como en New-Rol, core/utils.js)
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

// ---------------------------------------------------------------- roca
// Canto suelto del modo realista: esfera deformada con ruido coherente, base aplastada para asentarse.
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

// ---------------------------------------------------------------- árboles y arbustos (ez-tree)
const texCache = {}, matCache = {}, geoCache = {};

function texturaDe(nombre) {
  const url = globalThis.TreeLib ? TreeLib.textura(nombre) : null;
  if (!url) return null;
  if (!texCache[nombre]) {
    const img = new Image();
    const tex = new THREE.Texture(img);
    tex.magFilter = THREE.NearestFilter;
    img.onload = () => { tex.needsUpdate = true; };
    img.src = url;
    texCache[nombre] = tex;
  }
  return texCache[nombre];
}

// Partes de un arbusto o seto horneado: [{ geo, mat }] con corteza (ramas) y hojas (hojas recortadas).
// nivel: «cerca» (más hojas) o «lejos». null si TreeLib no está cargado o no existe la especie.
export function arbolPartes(id, nivel = 'lejos') {
  if (!globalThis.TreeLib) return null;
  const key = id + ':' + nivel;
  if (geoCache[key]) return geoCache[key];
  const d = TreeLib.datos(id, nivel);
  if (!d) return null;
  const geoDe = (p) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p.pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(p.nrm, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(p.uv, 2));
    g.setIndex(new THREE.BufferAttribute(p.idx, 1));
    return g;
  };
  if (!matCache[id + ':ramas']) {
    matCache[id + ':ramas'] = new THREE.MeshLambertMaterial({ map: texturaDe(TreeLib.corteza(id)), side: THREE.DoubleSide });
  }
  if (!matCache[id + ':hojas']) {
    // Hojas recortadas por su canal alfa; el tinte de la especie va en el material
    matCache[id + ':hojas'] = new THREE.MeshLambertMaterial({ map: texturaDe(TreeLib.hoja(id)), color: new THREE.Color(TreeLib.tinta(id)), alphaTest: 0.5, side: THREE.DoubleSide });
  }
  return (geoCache[key] = [
    { geo: geoDe(d.ramas), mat: matCache[id + ':ramas'] },
    { geo: geoDe(d.hojas), mat: matCache[id + ':hojas'] },
  ]);
}
