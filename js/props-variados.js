// Decoración variada del campo: 310 variantes procedurales en 12 familias (rocas, troncos caídos, tocones,
// ramas secas, setas, pilas de piedra, helechos, cactus, palmeras, juncos, lajas y restos de madera).
// Cada variante sale de una semilla fija y de sus parámetros; la colocación depende del bioma del mundo.
// Las piezas se funden en una malla por celda de 400 m (pocas llamadas de dibujo), con color por vértice.
// Requiere three.js como módulo (import).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Generador pseudoaleatorio con semilla (mulberry32): cada variante siempre sale igual
function rng(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Ruido suave barato en 3D (suma de senos con fases de la variante)
function ruido3(x, y, z, f) {
  return 0.5 + 0.28 * Math.sin(x * 3.1 + f[0]) * Math.cos(z * 2.3 - y * 1.1 + f[1]) + 0.22 * Math.sin(y * 4.7 + z * 1.9 + f[2]);
}

// Vuelve la geometría no indexada, quita uv y pinta todos los vértices con un color base (+ variación)
function pintar(geo, hex, r, variacion = 0.12) {
  let g = geo.index ? geo.toNonIndexed() : geo;
  if (g.attributes.uv) g.deleteAttribute('uv');
  if (g.attributes.normal) g.deleteAttribute('normal');
  const n = g.attributes.position.count;
  const c = new THREE.Color(hex);
  const col = new Float32Array(n * 3);
  for (let i = 0; i < n; i += 3) {
    // Una tonalidad por triángulo: el aspecto es más rico sin texturas
    const k = 1 + (r() - 0.5) * 2 * variacion;
    for (let j = 0; j < 3; j++) {
      const q = (i + j) * 3;
      col[q] = c.r * k; col[q + 1] = c.g * k; col[q + 2] = c.b * k;
    }
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

const PALETAS = {
  piedra: [0x8a8580, 0x9a948c, 0x7b766f, 0xa39d93, 0x6f6a64, 0x8c7f70],
  corteza: [0x6b4a2b, 0x5a3e24, 0x7a5a36, 0x4f3a24],
  hoja: [0x3f7a34, 0x4d8a3c, 0x2f6b2c, 0x5f8f3f, 0x6e8f3a],
  seta: [0xc8483c, 0xd9a441, 0xb9a48a, 0xe8e0d0, 0x8a5a3c, 0xd4cfb8],
  arena: [0xc9a46e, 0xb89058, 0xd6b47e],
  cactus: [0x4f7d3a, 0x5d8c44, 0x3f6e33],
  junco: [0x8a7a3e, 0x9b8a4a, 0x6f6a32],
  madera: [0x9a7347, 0x8a6a40, 0x7a5a35],
};
const elegir = (r, lista) => lista[Math.floor(r() * lista.length)];

// --- Familias: cada una recibe (r, v) y devuelve una geometría con color ---
const FAMILIAS = {
  roca(r, v) {
    const g = new THREE.IcosahedronGeometry(1, 2);
    const p = g.attributes.position, f = [v.s1, v.s2, v.s3];
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const k = (0.72 + 0.5 * ruido3(x, y, z, f)) * v.tam;
      const yy = y < 0 ? y * 0.25 : y * v.aplana;   // base plana, como un canto asentado
      p.setXYZ(i, x * k, yy * k, z * k);
    }
    return pintar(g, elegir(r, PALETAS.piedra), r, 0.1);
  },
  tronco(r, v) {
    const largo = v.largo, radio = v.radio;
    const cuerpo = new THREE.CylinderGeometry(radio * 0.85, radio, largo, 8, 3).rotateZ(Math.PI / 2);
    const partes = [pintar(cuerpo, elegir(r, PALETAS.corteza), r, 0.08)];
    for (let k = 0; k < v.ramas; k++) {
      const rama = new THREE.CylinderGeometry(radio * 0.18, radio * 0.25, largo * 0.25, 5).translate(0, largo * 0.12, 0);
      rama.rotateZ(Math.PI / 2 + 0.6).rotateY(r() * 6.28).translate((r() - 0.5) * largo * 0.6, radio * 0.8, 0);
      partes.push(pintar(rama, PALETAS.corteza[0], r, 0.1));
    }
    return mergeGeometries(partes.map(g => g.index ? g.toNonIndexed() : g));
  },
  tocon(r, v) {
    const cuerpo = new THREE.CylinderGeometry(v.radio, v.radio * 1.15, v.alto, 10, 2).translate(0, v.alto / 2, 0);
    const corona = new THREE.CircleGeometry(v.radio * 0.92, 10).rotateX(-Math.PI / 2).translate(0, v.alto + 0.01, 0);
    return mergeGeometries([pintar(cuerpo, elegir(r, PALETAS.corteza), r, 0.08), pintar(corona, 0xc49a62, r, 0.06)].map(g => g.index ? g.toNonIndexed() : g));
  },
  rama(r, v) {
    const partes = [];
    for (let k = 0; k < v.cuantas; k++) {
      const largo = 0.6 + r() * 1.2;
      const g = new THREE.CylinderGeometry(0.02 + r() * 0.02, 0.035, largo, 4).translate(0, largo / 2, 0);
      g.rotateZ((r() - 0.5) * 1.1).rotateY(r() * 6.28).translate((r() - 0.5) * 0.4, 0.05, (r() - 0.5) * 0.4);
      partes.push(pintar(g, PALETAS.corteza[k % 4], r, 0.1));
    }
    return mergeGeometries(partes.map(g => g.index ? g.toNonIndexed() : g));
  },
  seta(r, v) {
    const partes = [];
    for (let k = 0; k < v.cuantas; k++) {
      const x = (r() - 0.5) * 0.35, z = (r() - 0.5) * 0.35, s = 0.5 + r() * 0.6;
      const tallo = new THREE.CylinderGeometry(0.03 * s, 0.045 * s, 0.25 * s, 6).translate(x, 0.125 * s, z);
      const sombrero = new THREE.SphereGeometry(0.16 * s, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.55, 1).translate(x, 0.25 * s, z);
      const color = elegir(r, PALETAS.seta);
      partes.push(pintar(tallo, 0xefe7d5, r, 0.05), pintar(sombrero, color, r, 0.08));
    }
    return mergeGeometries(partes.map(g => g.index ? g.toNonIndexed() : g));
  },
  pila(r, v) {
    const partes = [];
    let y = 0;
    for (let k = 0; k < v.cuantas; k++) {
      const t = FAMILIAS.roca(r, { tam: 0.22 + r() * 0.2, aplana: 0.6, s1: v.s1 + k, s2: v.s2, s3: v.s3 });
      t.translate((r() - 0.5) * 0.3, y, (r() - 0.5) * 0.3);
      y += 0.2 + r() * 0.12;
      partes.push(t);
    }
    return mergeGeometries(partes.map(g => g.index ? g.toNonIndexed() : g));
  },
  helecho(r, v) {
    const partes = [];
    for (let k = 0; k < v.hojas; k++) {
      const largo = 0.5 + r() * 0.5;
      const g = new THREE.PlaneGeometry(0.16, largo, 1, 4).translate(0, largo / 2, 0);
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) p.setZ(i, p.getY(i) * p.getY(i) * -0.5);   // curva hacia fuera
      const a = (k / v.hojas) * Math.PI * 2;
      g.rotateX(-0.9).rotateY(a).translate(0, 0.05, 0);
      partes.push(pintar(g, elegir(r, PALETAS.hoja), r, 0.12));
    }
    return mergeGeometries(partes.map(g => g.index ? g.toNonIndexed() : g));
  },
  cactus(r, v) {
    const partes = [];
    const tronco = new THREE.CylinderGeometry(0.2 * v.grosor, 0.22 * v.grosor, v.alto, 10, 4).translate(0, v.alto / 2, 0);
    partes.push(pintar(tronco, elegir(r, PALETAS.cactus), r, 0.05));
    for (let k = 0; k < v.brazos; k++) {
      const alt = v.alto * (0.4 + r() * 0.35), lado = k % 2 ? 1 : -1;
      const brazo = new THREE.CylinderGeometry(0.1 * v.grosor, 0.11 * v.grosor, 0.45 * v.alto, 8).translate(0, 0.225 * v.alto, 0);
      brazo.rotateZ(lado * (0.9 + r() * 0.3)).translate(lado * 0.2 * v.grosor, alt, 0);
      partes.push(pintar(brazo, elegir(r, PALETAS.cactus), r, 0.05));
    }
    return mergeGeometries(partes.map(g => g.index ? g.toNonIndexed() : g));
  },
  palma(r, v) {
    const partes = [];
    const tronco = new THREE.CylinderGeometry(0.14, 0.24, v.alto, 8, 6).translate(0, v.alto / 2, 0);
    const p = tronco.attributes.position;
    for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) + v.curva * (p.getY(i) / v.alto) * (p.getY(i) / v.alto));
    partes.push(pintar(tronco, 0x7a5a3a, r, 0.06));
    for (let k = 0; k < v.hojas; k++) {
      const largo = 2.2 + r() * 0.8;
      const g = new THREE.PlaneGeometry(0.7, largo, 1, 6).rotateX(Math.PI / 2).translate(0, 0, largo / 2);
      const q = g.attributes.position;
      for (let i = 0; i < q.count; i++) q.setY(i, -0.3 * q.getZ(i) * q.getZ(i) / largo);
      g.rotateY((k / v.hojas) * Math.PI * 2).rotateX(-0.25).translate(v.curva * 0.6, v.alto, 0);
      partes.push(pintar(g, elegir(r, PALETAS.hoja), r, 0.1));
    }
    return mergeGeometries(partes.map(g => g.index ? g.toNonIndexed() : g));
  },
  junco(r, v) {
    const partes = [];
    for (let k = 0; k < v.cuantos; k++) {
      const alto = 1.2 + r() * 1.2;
      const tallo = new THREE.CylinderGeometry(0.02, 0.025, alto, 4).translate((r() - 0.5) * 0.25, alto / 2, (r() - 0.5) * 0.25);
      partes.push(pintar(tallo, elegir(r, PALETAS.junco), r, 0.1));
      if (r() < 0.5) {
        const espiga = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 5).translate(tallo.attributes.position.getX(0), alto * 0.9, tallo.attributes.position.getZ(0));
        partes.push(pintar(espiga, 0x5a4a2a, r, 0.05));
      }
    }
    return mergeGeometries(partes.map(g => g.index ? g.toNonIndexed() : g));
  },
  laja(r, v) {
    const g = new THREE.BoxGeometry(v.ancho, v.grosor, v.ancho * (0.6 + r() * 0.6), 2, 1, 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) + 0.08 * ruido3(p.getX(i), 0, p.getZ(i), [v.s1, v.s2, v.s3]));
    return pintar(g.translate(0, v.grosor / 2, 0), elegir(r, PALETAS.piedra), r, 0.08);
  },
  restos(r, v) {
    const partes = [];
    for (let k = 0; k < v.tablas; k++) {
      const g = new THREE.BoxGeometry(0.18, 0.04, 0.9 + r() * 0.4).translate(0, 0.02, 0);
      g.rotateY((r() - 0.5) * 1.2).translate((r() - 0.5) * 0.6, r() * 0.12, (r() - 0.5) * 0.6);
      partes.push(pintar(g, elegir(r, PALETAS.madera), r, 0.1));
    }
    return mergeGeometries(partes.map(g => g.index ? g.toNonIndexed() : g));
  },
};

// --- Catálogo: 310 variantes, cada una con familia, parámetros y semilla ---
const CUENTA = { roca: 60, tronco: 30, tocon: 20, rama: 20, seta: 25, pila: 25, helecho: 30, cactus: 25, palma: 15, junco: 20, laja: 20, restos: 20 };
function parametros(familia, r) {
  switch (familia) {
    case 'roca': return { tam: 0.5 + r() * 1.3, aplana: 0.45 + r() * 0.45 };
    case 'tronco': return { largo: 2 + r() * 4, radio: 0.2 + r() * 0.25, ramas: Math.floor(r() * 3) };
    case 'tocon': return { radio: 0.25 + r() * 0.3, alto: 0.3 + r() * 0.5 };
    case 'rama': return { cuantas: 3 + Math.floor(r() * 5) };
    case 'seta': return { cuantas: 1 + Math.floor(r() * 4) };
    case 'pila': return { cuantas: 3 + Math.floor(r() * 4) };
    case 'helecho': return { hojas: 6 + Math.floor(r() * 5) };
    case 'cactus': return { alto: 1.6 + r() * 2.2, grosor: 0.8 + r() * 0.5, brazos: Math.floor(r() * 3) };
    case 'palma': return { alto: 5 + r() * 2.5, curva: (r() - 0.5) * 1.6, hojas: 8 + Math.floor(r() * 4) };
    case 'junco': return { cuantos: 4 + Math.floor(r() * 6) };
    case 'laja': return { ancho: 0.8 + r() * 1.2, grosor: 0.12 + r() * 0.2 };
    case 'restos': return { tablas: 2 + Math.floor(r() * 3) };
  }
  return {};
}
// Familia por nombre de catálogo: «tocon» y «palma» etc. usan la función de su familia
const FAMILIA_DE = { roca: 'roca', tronco: 'tronco', tocon: 'tocon', rama: 'rama', seta: 'seta', pila: 'pila', helecho: 'helecho', cactus: 'cactus', palma: 'palma', junco: 'junco', laja: 'laja', restos: 'restos' };
export const CATALOGO = [];
Object.keys(CUENTA).forEach((familia, fi) => {
  for (let k = 0; k < CUENTA[familia]; k++) {
    const semilla = 1000 + fi * 997 + k * 31;
    const r = rng(semilla);
    CATALOGO.push({ id: familia + '-' + k, familia, semilla, v: { ...parametros(familia, r), s1: r() * 6, s2: r() * 6, s3: r() * 6 } });
  }
});

const cacheGeo = new Map();
// Geometría de una variante (se crea una vez y se reutiliza)
export function geometriaVariante(i) {
  if (cacheGeo.has(i)) return cacheGeo.get(i);
  const c = CATALOGO[i];
  const r = rng(c.semilla + 7);
  const g = FAMILIAS[FAMILIA_DE[c.familia]](r, c.v);
  cacheGeo.set(i, g);
  return g;
}

// Hábitat: en qué biomas aparece cada familia, y con qué probabilidad por intento
const HABITAT = {
  roca: { montana: 0.5, nieve: 0.4, tundra: 0.3, pradera: 0.12, costa: 0.2 },
  tronco: { bosque: 0.25, taiga: 0.3 },
  tocon: { bosque: 0.12, taiga: 0.1 },
  rama: { bosque: 0.2, taiga: 0.2 },
  seta: { bosque: 0.15, taiga: 0.12, pantano: 0.1 },
  pila: { montana: 0.2, pradera: 0.08, costa: 0.1, tundra: 0.1 },
  helecho: { bosque: 0.25, pantano: 0.2, taiga: 0.15 },
  cactus: { desierto: 0.3 },
  palma: { desierto: 0.05, costa: 0.08 },
  junco: { pantano: 0.3, costa: 0.2 },
  laja: { montana: 0.18, tundra: 0.15, nieve: 0.08 },
  restos: { pradera: 0.02, desierto: 0.02 },
};
const indicesPorFamilia = {};
CATALOGO.forEach((c, i) => { (indicesPorFamilia[c.familia] = indicesPorFamilia[c.familia] || []).push(i); });

// Coloca la decoración del campo. o: { rng (con next()), limites, altura(x,z), bioma(x,z), agua(x,z), libre(x,z) }
// Devuelve un grupo con una malla por celda de 400 m y familia.
export function generarCampo(o) {
  const L = o.limites, r = o.rng;
  const grupo = new THREE.Group();
  const celdas = new Map();
  const intentos = Math.min(60000, Math.round((L.maxX - L.minX) * (L.maxZ - L.minZ) / 900));
  for (let k = 0; k < intentos; k++) {
    const x = L.minX + r.next() * (L.maxX - L.minX), z = L.minZ + r.next() * (L.maxZ - L.minZ);
    if (o.agua(x, z) || !o.libre(x, z)) continue;
    const b = o.bioma(x, z);
    const familias = Object.keys(HABITAT).filter(f => HABITAT[f][b]);
    if (!familias.length) continue;
    const f = familias[Math.floor(r.next() * familias.length)];
    if (!r.chance(HABITAT[f][b])) continue;
    const lista = indicesPorFamilia[f];
    const i = lista[Math.floor(r.next() * lista.length)];
    const clave = Math.floor(x / 400) + ',' + Math.floor(z / 400);
    if (!celdas.has(clave)) celdas.set(clave, []);
    celdas.get(clave).push({ i, x, y: o.altura(x, z), z, s: 0.75 + r.next() * 0.6, ry: r.next() * Math.PI * 2 });
  }
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3();
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  celdas.forEach(items => {
    const partes = items.map(it => {
      const g = geometriaVariante(it.i).clone();
      m.compose(p.set(it.x, it.y - 0.05, it.z), q.setFromEuler(e.set(0, it.ry, 0)), s.set(it.s, it.s, it.s));
      return g.applyMatrix4(m);
    });
    const fusion = mergeGeometries(partes);
    fusion.computeBoundingSphere();
    const malla = new THREE.Mesh(fusion, mat);
    malla.castShadow = false;
    malla.receiveShadow = true;
    malla.userData.lejos = 350;   // piezas pequeñas: el visor oculta la celda más lejos de la cámara
    grupo.add(malla);
  });
  return grupo;
}
