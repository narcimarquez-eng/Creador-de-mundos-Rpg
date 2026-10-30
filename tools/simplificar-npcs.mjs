// Versiones simplificadas de los NPCs, sin tocar los originales:
//   npc/gurus/guru-N.glb → guru-N-cerca.glb (la que se ve de cerca, comprimida con Meshopt y WebP)
//                        → guru-N-lejos.glb (a más de 35 m de la cámara, aún más ligera)
// Cada pieza se simplifica por separado con meshoptimizer teniendo en cuenta normales, uv y color (la misma
// función que usa el visor con los monstruos: js/fusionar-modelo.js), se deja solo la animación 'idle' y se
// comprime con EXT_meshopt_compression + WebP sin perder nitidez. Uso: node tools/simplificar-npcs.mjs
import { NodeIO, PropertyType } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize, weld, prune, dedup, meshopt, textureCompress, compactPrimitive } from '@gltf-transform/functions';
import { MeshoptSimplifier, MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';
import { readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const F = require('../js/fusionar-modelo.js');
const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'npc', 'gurus');
// ratio: parte de triángulos que se queda; error: cuánto puede cambiar la forma, relativo al tamaño de la pieza;
// peso: cuánto cuentan normales, uv y color frente a la forma (menos peso, más se puede bajar)
const VERSIONES = {
  cerca: { ratio: 0.08, error: 0.02, peso: 0.2, texMax: 512, texCalidad: 90, esLejos: false },
  lejos: { ratio: 0.035, error: 0.045, peso: 0.25, texMax: 256, texCalidad: 80, esLejos: true }
};
const MIN_TRIS = 150;   // las piezas más pequeñas se dejan como están
await MeshoptSimplifier.ready;
await MeshoptEncoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder });

const triangulos = doc => doc.getRoot().listMeshes().reduce((s, m) => s + m.listPrimitives().reduce((t, p) => t + (p.getIndices() ? p.getIndices().getCount() : p.getAttribute('POSITION').getCount()) / 3, 0), 0);

// Valores de un accesor como Float32Array de 'k' componentes por vértice (ya sin cuantizar)
function comoFloat(acc, k) {
  const n = acc.getCount(), out = new Float32Array(n * k), e = [];
  for (let i = 0; i < n; i++) { acc.getElement(i, e); for (let c = 0; c < k; c++) out[i * k + c] = c < e.length ? e[c] : 0; }
  return out;
}

// Pasa el color plano de los materiales opacos sin texturas a COLOR_0 y los reúne en pocos materiales compartidos
// para que fusionarPorMaterial reduzca drásticamente las llamadas de dibujo sin alterar el color ni el brillo.
function unificarMaterialesSinTextura(doc, esLejos) {
  const buffer = doc.getRoot().listBuffers()[0];
  const compartidos = new Map();
  function obtenerCompartido(dobleCara, mate) {
    const clave = (dobleCara ? '2c:' : '1c:') + (mate ? 'mate' : 'brillo');
    if (!compartidos.has(clave)) {
      const m = doc.createMaterial('MatComun_' + clave)
        .setBaseColorFactor([1, 1, 1, 1])
        .setRoughnessFactor(mate ? 0.48 : 0.1)
        .setMetallicFactor(mate ? 0.02 : 0.08)
        .setDoubleSided(dobleCara);
      compartidos.set(clave, m);
    }
    return compartidos.get(clave);
  }
  doc.getRoot().listMeshes().forEach(mesh => mesh.listPrimitives().forEach(prim => {
    if (prim.getMode() !== 4 || prim.listTargets().length) return;
    const mat = prim.getMaterial(), pos = prim.getAttribute('POSITION');
    if (!mat || !pos || mat.getAlphaMode() !== 'OPAQUE') return;
    if (mat.getBaseColorTexture() || mat.getNormalTexture() || mat.getMetallicRoughnessTexture() || mat.getOcclusionTexture() || mat.getEmissiveTexture()) return;
    const em = mat.getEmissiveFactor();
    const tieneEmision = em[0] > 0.05 || em[1] > 0.05 || em[2] > 0.05;
    if (tieneEmision && !esLejos) return;
    const fc = mat.getBaseColorFactor();
    const mr = Math.min(1, fc[0] + (esLejos ? em[0] * 0.6 : 0));
    const mg = Math.min(1, fc[1] + (esLejos ? em[1] * 0.6 : 0));
    const mb = Math.min(1, fc[2] + (esLejos ? em[2] * 0.6 : 0));
    const nV = pos.getCount(), cAcc = prim.getAttribute('COLOR_0'), col = new Float32Array(nV * 3);
    if (cAcc) {
      const prev = comoFloat(cAcc, 3);
      for (let i = 0; i < nV; i++) {
        col[i * 3] = prev[i * 3] * mr;
        col[i * 3 + 1] = prev[i * 3 + 1] * mg;
        col[i * 3 + 2] = prev[i * 3 + 2] * mb;
      }
    } else {
      for (let i = 0; i < nV; i++) { col[i * 3] = mr; col[i * 3 + 1] = mg; col[i * 3 + 2] = mb; }
    }
    prim.setAttribute('COLOR_0', doc.createAccessor().setType('VEC3').setArray(col).setBuffer(buffer));
    prim.setAttribute('TEXCOORD_0', null);   // material sin texturas: ahorra memoria y costuras innecesarias
    prim.setMaterial(obtenerCompartido(mat.getDoubleSided(), mat.getRoughnessFactor() >= 0.3));
  }));
}

function simplificarDocumento(doc, o) {
  const buffer = doc.getRoot().listBuffers()[0];
  doc.getRoot().listMeshes().forEach(mesh => mesh.listPrimitives().forEach(prim => {
    if (prim.getMode() !== 4 || prim.listTargets().length) return;   // solo triángulos, sin morph
    const pos = prim.getAttribute('POSITION');
    if (!pos) return;
    const idxAcc = prim.getIndices();
    const n = idxAcc ? idxAcc.getCount() : pos.getCount();
    if (n / 3 < MIN_TRIS) return;
    const campos = [['NORMAL', 3], ['TEXCOORD_0', 2], ['COLOR_0', 3]].map(([nom, k]) => [prim.getAttribute(nom), k]).filter(([a]) => a);
    let atributos = null;
    if (campos.length) {
      const stride = campos.reduce((a, c) => a + c[1], 0), nV = pos.getCount(), array = new Float32Array(nV * stride), pesos = [];
      let base = 0;
      campos.forEach(([a, k]) => {
        const v = comoFloat(a, k);
        for (let i = 0; i < nV; i++) for (let c = 0; c < k; c++) array[i * stride + base + c] = v[i * k + c];
        for (let c = 0; c < k; c++) pesos.push(o.peso);
        base += k;
      });
      atributos = { array, stride, pesos };
    }
    const nuevos = F.indicesSimplificados(MeshoptSimplifier, idxAcc ? Uint32Array.from(idxAcc.getArray()) : null, comoFloat(pos, 3), atributos, Object.assign({ podar: false }, o));
    if (!nuevos) return;
    prim.setIndices(doc.createAccessor().setType('SCALAR').setArray(nuevos).setBuffer(buffer));
    compactPrimitive(prim);   // quita los vértices que ya no usa ningún triángulo
  }));
}

for (const f of readdirSync(DIR).filter(f => /^guru-\d+\.glb$/.test(f))) {
  for (const [nombre, o] of Object.entries(VERSIONES)) {
    const doc = await io.read(join(DIR, f));
    const antes = triangulos(doc);
    // Los NPCs del mundo solo reproducen la animación de reposo ('idle')
    doc.getRoot().listAnimations().forEach(a => { if (a.getName() !== 'idle') a.dispose(); });
    await doc.transform(dequantize());
    unificarMaterialesSinTextura(doc, o.esLejos);
    await doc.transform(weld());
    simplificarDocumento(doc, o);
    await doc.transform(
      textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [o.texMax, o.texMax], quality: o.texCalidad }),
      dedup({ propertyTypes: [PropertyType.ACCESSOR, PropertyType.TEXTURE, PropertyType.MATERIAL] }),
      prune({ propertyTypes: [PropertyType.ACCESSOR, PropertyType.ANIMATION, PropertyType.TEXTURE, PropertyType.MATERIAL, PropertyType.BUFFER] }),
      meshopt({ encoder: MeshoptEncoder, level: 'high' })
    );
    const salida = join(DIR, f.replace('.glb', '-' + nombre + '.glb'));
    await io.write(salida, doc);
    console.log(f, nombre, Math.round(antes / 1000) + 'k →', Math.round(triangulos(doc) / 1000) + 'k triángulos,', (statSync(join(DIR, f)).size / 1e6).toFixed(2) + ' → ' + (statSync(salida).size / 1e6).toFixed(2) + ' MB');
  }
}
