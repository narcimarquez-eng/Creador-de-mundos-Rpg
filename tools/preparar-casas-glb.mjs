/*
 * preparar-casas-glb.mjs — Prepara las casas GLB del pueblo a partir de los modelos originales.
 *
 *   node tools/preparar-casas-glb.mjs
 *
 * Entrada (tools/datos/casas-origen/):
 *   casa_entramado_juego_1.glb      casa de entramado con fachada pintada
 *   cabana_patio_juego_draco.glb    cabaña de troncos con patio, fuente, muros, bancos… (Draco)
 *
 * Salida (glb/pueblo/):
 *   casa_entramado.glb, casa_entramado_lejos.glb   casa y su versión lejana (pocos triángulos, texturas 128 px)
 *   cabana.glb, cabana_lejos.glb
 *   piezas/<nombre>.glb                           piezas sueltas para calles y plazas (fuente, banco, barril,
 *                                                 leñera, farol, jardinera, valla, muro del patio, pino…)
 *
 * Los modelos originales funden las piezas por material (cada malla lleva el nombre de su primera pieza), así
 * que aquí se separan por componentes conexos y se reparten por zonas del modelo. Cada material sale con un
 * nombre de papel ('tejado', 'madera', 'piedra'…) para que el juego pueda cambiarle la textura por otra de
 * assets/texturas/ y sacar variantes de la misma casa. En la casa de entramado el tejado y las vigas comparten
 * material: el tejado se separa por la inclinación y la altura de cada triángulo.
 */
import { Document, NodeIO, PropertyType } from '@gltf-transform/core';
import { ALL_EXTENSIONS, KHRTextureTransform, KHRMaterialsEmissiveStrength } from '@gltf-transform/extensions';
import { weld, simplify, dedup, prune } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGEN = path.join(RAIZ, 'tools/datos/casas-origen');
const DESTINO = path.join(RAIZ, 'glb/pueblo');

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });

// ---------------------------------------------------------------------------------------------------------
// Reglas de cada modelo: nombre de papel de cada material y a qué pieza va cada componente (por su caja)
// ---------------------------------------------------------------------------------------------------------
const dentro = (c, x0, x1, z0, z1) => c.cx >= x0 && c.cx <= x1 && c.cz >= z0 && c.cz <= z1;

const MODELOS = {
  casa_entramado: {
    archivo: 'casa_entramado_juego_1.glb',
    materiales: ['fachada', 'madera', 'piedra', 'farol_luz', 'hierro'],
    // El tejado está pintado en el atlas de la fachada: sus triángulos inclinados y altos salen como 'tejado'
    // (mismo atlas) con un segundo juego de UV planas (uv1) para poder cubrirlo con una textura de tejas.
    partirTriangulo: (mat, n, cy) => (mat === 'fachada' && Math.abs(n[1]) > 0.25 && Math.abs(n[1]) < 0.97 && cy > 3.0) ? 'tejado' : mat,
    uvPlanar: ['tejado'],
    pieza: () => 'casa'
  },
  cabana: {
    archivo: 'cabana_patio_juego_draco.glb',
    materiales: ['piedra', 'madera_troncos', 'madera_tablas', 'tejado', 'tejado_musgo', 'humo', 'hierro', 'ventana_luz',
      'flor_roja', 'hojas', 'flor_amarilla', 'farol_luz', 'corteza', 'empedrado', 'empedrado_entrada', 'muro',
      'piedra_muro', 'piedra_fuente', 'agua', 'agua_taza', 'chorro', 'cortina', 'tierra'],
    pieza: c => {
      if (c.mat === 'humo') return null;                                        // el humo lo pone el juego
      if (dentro(c, -5.3, -2.0, -10.4, -6.6) || dentro(c, 2.4, 5.6, -10.4, -6.6)) return c.cx < 0 ? 'pino' : 'pino_b';
      if (Math.abs(c.cx) > 5.7 && c.cz < -0.2) return c.cx < 0 ? 'valla' : 'valla_b';
      // Lo grande (suelo empedrado, muros, paredes de la cabaña) nunca cuenta como pieza pequeña
      const grande = (c.max[0] - c.min[0]) * (c.max[2] - c.min[2]) > 6;
      if (dentro(c, -1.85, 1.85, 2.0, 5.9) && c.max[0] - c.min[0] < 4) return 'fuente';   // la pileta es ancha
      if (grande) return c.cz < -0.3 ? 'casa' : 'muro_patio';
      if (dentro(c, -4.45, -3.2, -6.45, -3.6) && c.max[1] < 2.2) return 'lenera';
      if (dentro(c, -5.3, -3.75, -3.05, -2.1)) return 'tocon';
      if (dentro(c, -3.3, -2.5, -0.5, 0.4)) return 'barril';
      if (dentro(c, -4.0, -3.25, -1.0, -0.1)) return 'barril_b';
      if (c.cz < -0.3 || dentro(c, -0.95, 0.95, -1.1, 0.1)) return 'casa';
      if (dentro(c, 2.85, 3.75, 2.85, 4.95)) return 'banco';
      if (dentro(c, -3.75, -2.85, 2.85, 4.95)) return 'banco_b';
      if (dentro(c, -1.85, 1.85, 2.0, 5.9)) return 'fuente';
      if (dentro(c, 0.95, 1.75, 7.4, 8.6)) return 'farol';
      if (dentro(c, 3.75, 5.25, 0.05, 1.55)) return 'jardinera';
      if (dentro(c, -5.3, -2.1, 5.1, 7.9)) return 'jardinera_arbol';
      return 'muro_patio';
    }
  }
};

// Piezas que se exportan (las *_b son copias simétricas: se descartan)
const EXPORTAR = {
  casa_entramado: { casa: 'casa_entramado' },
  cabana: {
    casa: 'cabana', pino: 'piezas/pino', valla: 'piezas/valla', lenera: 'piezas/lenera', tocon: 'piezas/tocon',
    barril: 'piezas/barril', banco: 'piezas/banco', fuente: 'piezas/fuente', farol: 'piezas/farol',
    jardinera: 'piezas/jardinera', jardinera_arbol: 'piezas/jardinera_arbol', muro_patio: 'piezas/muro_patio'
  }
};
const CASAS = ['casa_entramado', 'cabana'];

// Limpieza: los materiales no se funden (cada papel —'tejado', 'fachada'…— debe seguir siendo cambiable aunque
// hoy sean iguales) y se conservan las UV de reserva (uv1) aunque ningún material las use todavía
const limpiar = () => [dedup({ propertyTypes: [PropertyType.ACCESSOR, PropertyType.MESH, PropertyType.TEXTURE] }), prune({ keepAttributes: true })];

// ---------------------------------------------------------------------------------------------------------
function componentes(prim) {
  const pos = prim.getAttribute('POSITION').getArray(), idx = prim.getIndices().getArray();
  const key = i => `${Math.round(pos[i * 3] * 500)},${Math.round(pos[i * 3 + 1] * 500)},${Math.round(pos[i * 3 + 2] * 500)}`;
  const wid = new Map(), wv = new Int32Array(pos.length / 3);
  for (let i = 0; i < wv.length; i++) { const k = key(i); if (!wid.has(k)) wid.set(k, wid.size); wv[i] = wid.get(k); }
  const par = new Int32Array(wid.size).map((_, i) => i);
  const f = a => { while (par[a] !== a) { par[a] = par[par[a]]; a = par[a]; } return a; };
  for (let t = 0; t < idx.length; t += 3) { const a = f(wv[idx[t]]); par[f(wv[idx[t + 1]])] = a; par[f(wv[idx[t + 2]])] = a; }
  const grupos = new Map();
  for (let t = 0; t < idx.length; t += 3) {
    const r = f(wv[idx[t]]);
    if (!grupos.has(r)) grupos.set(r, { tris: [], min: [1e9, 1e9, 1e9], max: [-1e9, -1e9, -1e9] });
    const g = grupos.get(r);
    g.tris.push(t / 3);
    for (const v of [idx[t], idx[t + 1], idx[t + 2]]) for (let k = 0; k < 3; k++) {
      g.min[k] = Math.min(g.min[k], pos[v * 3 + k]); g.max[k] = Math.max(g.max[k], pos[v * 3 + k]);
    }
  }
  return [...grupos.values()].map(g => ({ ...g, cx: (g.min[0] + g.max[0]) / 2, cy: (g.min[1] + g.max[1]) / 2, cz: (g.min[2] + g.max[2]) / 2 }));
}

async function imagenRedimensionada(buf, max) {
  const meta = await sharp(buf).metadata();
  const k = Math.min(1, max / Math.max(meta.width, meta.height));
  return sharp(buf).resize(Math.round(meta.width * k), Math.round(meta.height * k)).jpeg({ quality: 84 }).toBuffer();
}

// Copia un material del documento original al nuevo (color, textura con su transformación, emisión, transparencia)
async function copiarMaterial(dst, cache, src, nombre, texMax) {
  const clave = nombre + '|' + texMax;
  if (cache.has(clave)) return cache.get(clave);
  const m = dst.createMaterial(nombre)
    .setBaseColorFactor(src.getBaseColorFactor()).setRoughnessFactor(src.getRoughnessFactor())
    .setMetallicFactor(src.getMetallicFactor()).setEmissiveFactor(src.getEmissiveFactor())
    .setAlphaMode(src.getAlphaMode()).setDoubleSided(src.getDoubleSided());
  const t = src.getBaseColorTexture();
  if (t) {
    // Una sola copia de cada imagen aunque la usen varios materiales (el atlas lo comparten fachada y tejado)
    if (!cache.has(t)) cache.set(t, dst.createTexture(nombre).setMimeType('image/jpeg').setImage(await imagenRedimensionada(t.getImage(), texMax)));
    const tex = cache.get(t);
    m.setBaseColorTexture(tex);
    const info = src.getBaseColorTextureInfo(), infoD = m.getBaseColorTextureInfo();
    infoD.setWrapS(info.getWrapS()).setWrapT(info.getWrapT());
    const tr = info.getExtension('KHR_textureTransform');
    if (tr) {
      const ext = dst.createExtension(KHRTextureTransform);
      infoD.setExtension('KHR_textureTransform', ext.createTransform().setOffset(tr.getOffset()).setScale(tr.getScale()).setRotation(tr.getRotation()));
    }
  }
  const em = src.getExtension('KHR_materials_emissive_strength');
  if (em) {
    const ext = dst.createExtension(KHRMaterialsEmissiveStrength);
    m.setExtension('KHR_materials_emissive_strength', ext.createEmissiveStrength().setEmissiveStrength(em.getEmissiveStrength()));
  }
  cache.set(clave, m);
  return m;
}

// Documento con los triángulos de una pieza (centrada en x/z, apoyada en y = 0)
async function documentoPieza(trozos, texMax, centrar) {
  const doc = new Document();
  const buf = doc.createBuffer();
  const malla = doc.createMesh('pieza');
  const cache = new Map();
  let min = [1e9, 1e9, 1e9], max = [-1e9, -1e9, -1e9];
  trozos.forEach(tr => tr.tris.forEach(t => [0, 1, 2].forEach(k => {
    const v = tr.idx[t * 3 + k];
    for (let a = 0; a < 3; a++) { min[a] = Math.min(min[a], tr.pos[v * 3 + a]); max[a] = Math.max(max[a], tr.pos[v * 3 + a]); }
  })));
  const off = centrar ? [-(min[0] + max[0]) / 2, -min[1], -(min[2] + max[2]) / 2] : [0, 0, 0];
  for (const tr of trozos) {
    // Vértices de la pieza. Con UV planas cada triángulo lleva los suyos (cada faldón tiene su propio plano).
    const esquinas = [];   // [vértice original, triángulo]
    const remap = new Map(), nuevosIdx = [];
    tr.tris.forEach(t => [0, 1, 2].forEach(k => {
      const v = tr.idx[t * 3 + k];
      if (tr.planar) { nuevosIdx.push(esquinas.length); esquinas.push([v, t]); return; }
      if (!remap.has(v)) { remap.set(v, esquinas.length); esquinas.push([v, t]); }
      nuevosIdx.push(remap.get(v));
    }));
    const prim = doc.createPrimitive();
    for (const sem of tr.prim.listSemantics()) {
      const acc = tr.prim.getAttribute(sem), n = acc.getElementSize(), src = acc.getArray();
      const arr = new src.constructor(esquinas.length * n);
      esquinas.forEach(([v], nv) => { for (let k = 0; k < n; k++) arr[nv * n + k] = src[v * n + k] + (sem === 'POSITION' ? off[k] : 0); });
      prim.setAttribute(sem, doc.createAccessor().setType(acc.getType()).setArray(arr).setNormalized(acc.getNormalized()).setBuffer(buf));
    }
    if (tr.planar) {
      // uv1: u a lo largo del alero (horizontal), v pendiente arriba; una repetición cada 2,5 m
      const P = v => [tr.pos[v * 3], tr.pos[v * 3 + 1], tr.pos[v * 3 + 2]];
      const uv = new Float32Array(esquinas.length * 2);
      esquinas.forEach(([v, t], i) => {
        const a = P(tr.idx[t * 3]), b = P(tr.idx[t * 3 + 1]), c = P(tr.idx[t * 3 + 2]);
        const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
        let nx = e1[1] * e2[2] - e1[2] * e2[1], ny = e1[2] * e2[0] - e1[0] * e2[2], nz = e1[0] * e2[1] - e1[1] * e2[0];
        const ln = Math.hypot(nx, ny, nz) || 1; nx /= ln; ny /= ln; nz /= ln;
        let tx = -nz, tz = nx; const lt = Math.hypot(tx, tz) || 1; tx /= lt; tz /= lt;   // horizontal en el faldón
        const bx = ny * tz, by = nz * tx - nx * tz, bz = -ny * tx;                         // pendiente
        const p = P(v);
        uv[i * 2] = (p[0] * tx + p[2] * tz) / 2.5;
        uv[i * 2 + 1] = -(p[0] * bx + p[1] * by + p[2] * bz) / 2.5;
      });
      prim.setAttribute('TEXCOORD_1', doc.createAccessor().setType('VEC2').setArray(uv).setBuffer(buf));
    }
    prim.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(nuevosIdx)).setBuffer(buf));
    prim.setMaterial(await copiarMaterial(doc, cache, tr.material, tr.nombreMat, texMax));
    malla.addPrimitive(prim);
  }
  doc.createScene('escena').addChild(doc.createNode('pieza').setMesh(malla));
  return { doc, tam: [max[0] - min[0], max[1] - min[1], max[2] - min[2]] };
}

async function procesar(clave) {
  const reglas = MODELOS[clave];
  const src = await io.read(path.join(ORIGEN, reglas.archivo));
  const mats = src.getRoot().listMaterials();
  const porPieza = new Map();   // pieza → [{ prim, pos, idx, tris, material, nombreMat }]
  for (const nodo of src.getRoot().listNodes()) {
    const mesh = nodo.getMesh();
    if (!mesh) continue;
    for (const prim of mesh.listPrimitives()) {
      const material = prim.getMaterial();
      const nombreMat = reglas.materiales[mats.indexOf(material)];
      const pos = prim.getAttribute('POSITION').getArray(), idx = prim.getIndices().getArray();
      for (const c of componentes(prim)) {
        const pieza = reglas.pieza({ ...c, mat: nombreMat });
        if (!pieza || !EXPORTAR[clave][pieza]) continue;
        // Reparto opcional por triángulo (tejado dentro de la madera)
        const grupos = new Map();
        c.tris.forEach(t => {
          let nm = nombreMat;
          if (reglas.partirTriangulo) {
            const P = k => [pos[idx[t * 3 + k] * 3], pos[idx[t * 3 + k] * 3 + 1], pos[idx[t * 3 + k] * 3 + 2]];
            const a = P(0), b = P(1), d = P(2);
            const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [d[0] - a[0], d[1] - a[1], d[2] - a[2]];
            const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
            const l = Math.hypot(...n) || 1;
            nm = reglas.partirTriangulo(nombreMat, n.map(x => x / l), (a[1] + b[1] + d[1]) / 3);
          }
          if (!grupos.has(nm)) grupos.set(nm, []);
          grupos.get(nm).push(t);
        });
        if (!porPieza.has(pieza)) porPieza.set(pieza, new Map());
        const lista = porPieza.get(pieza);
        grupos.forEach((tris, nm) => {
          const k = nm + '#' + mats.indexOf(material);
          if (!lista.has(k)) lista.set(k, { prim, pos, idx, tris: [], material, nombreMat: nm, planar: (reglas.uvPlanar || []).includes(nm) });
          lista.get(k).tris.push(...tris);
        });
      }
    }
  }
  const resumen = [];
  for (const [pieza, trozos] of porPieza) {
    const salida = EXPORTAR[clave][pieza];
    const lista = [...trozos.values()];
    const esCasa = CASAS.includes(salida);
    const { doc, tam } = await documentoPieza(lista, !esCasa ? 256 : clave === 'casa_entramado' ? 1024 : 512, true);
    await doc.transform(...limpiar());
    const archivo = path.join(DESTINO, salida + '.glb');
    fs.mkdirSync(path.dirname(archivo), { recursive: true });
    await io.write(archivo, doc);
    let tris = 0;
    doc.getRoot().listMeshes().forEach(m => m.listPrimitives().forEach(p => { tris += p.getIndices().getCount() / 3; }));
    resumen.push({ archivo: salida + '.glb', tris, tam: tam.map(v => +v.toFixed(2)), kb: Math.round(fs.statSync(archivo).size / 1024) });
    // Versión lejana de las casas: ~10 % de los triángulos y texturas de 128 px
    if (esCasa) {
      // A lo lejos no se ven bisagras, flores ni hojitas: fuera antes de simplificar
      const SIN_DETALLE = ['hierro', 'flor_roja', 'flor_amarilla', 'hojas'];
      const { doc: lejos } = await documentoPieza(lista.filter(t => !SIN_DETALLE.includes(t.nombreMat)), 128, true);
      // Sin normales (las rehace el juego al cargar): así se sueldan más vértices y la simplificación llega más lejos
      lejos.getRoot().listMeshes().forEach(m => m.listPrimitives().forEach(p => p.setAttribute('NORMAL', null)));
      await lejos.transform(weld(), simplify({ simplifier: MeshoptSimplifier, ratio: 0.1, error: 0.12, lockBorder: false }), ...limpiar());
      const archL = path.join(DESTINO, salida + '_lejos.glb');
      await io.write(archL, lejos);
      let trisL = 0;
      lejos.getRoot().listMeshes().forEach(m => m.listPrimitives().forEach(p => { trisL += p.getIndices().getCount() / 3; }));
      resumen.push({ archivo: salida + '_lejos.glb', tris: trisL, kb: Math.round(fs.statSync(archL).size / 1024) });
    }
  }
  return resumen;
}

await MeshoptSimplifier.ready;
fs.mkdirSync(DESTINO, { recursive: true });
const todo = [];
for (const clave of Object.keys(MODELOS)) todo.push(...await procesar(clave));
console.table(todo);
fs.writeFileSync(path.join(DESTINO, 'indice.json'), JSON.stringify(todo, null, 1) + '\n');
