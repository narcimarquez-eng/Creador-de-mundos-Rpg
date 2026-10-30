// Versiones simplificadas de los NPCs, sin tocar los originales:
//   npc/gurus/guru-N.glb → guru-N-cerca.glb (la que se ve de cerca, ~25 % de los triángulos)
//                        → guru-N-lejos.glb (a más de 35 m de la cámara, ~11 %)
// Cada pieza se simplifica por separado con meshoptimizer teniendo en cuenta normales, uv y color (la misma
// función que usa el visor con los monstruos: js/fusionar-modelo.js) y se dejan los nodos tal cual, así la
// animación por nodos sigue valiendo. Uso: node tools/simplificar-npcs.mjs
import { NodeIO, PropertyType } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize, weld, prune, compactPrimitive } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
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
  cerca: { ratio: 0.25, error: 0.008, peso: 0.2 },
  lejos: { ratio: 0.1, error: 0.03, peso: 0.3 }
};
const MIN_TRIS = 300;   // las piezas más pequeñas se dejan como están
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
await MeshoptSimplifier.ready;

const triangulos = doc => doc.getRoot().listMeshes().reduce((s, m) => s + m.listPrimitives().reduce((t, p) => t + (p.getIndices() ? p.getIndices().getCount() : p.getAttribute('POSITION').getCount()) / 3, 0), 0);

// Valores de un accesor como Float32Array de 'k' componentes por vértice (ya sin cuantizar)
function comoFloat(acc, k) {
  const n = acc.getCount(), out = new Float32Array(n * k), e = [];
  for (let i = 0; i < n; i++) { acc.getElement(i, e); for (let c = 0; c < k; c++) out[i * k + c] = c < e.length ? e[c] : 0; }
  return out;
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
    await doc.transform(dequantize(), weld());
    simplificarDocumento(doc, o);
    await doc.transform(prune({ propertyTypes: [PropertyType.ACCESSOR, PropertyType.BUFFER] }));
    const salida = join(DIR, f.replace('.glb', '-' + nombre + '.glb'));
    await io.write(salida, doc);
    console.log(f, nombre, Math.round(antes / 1000) + 'k →', Math.round(triangulos(doc) / 1000) + 'k triángulos,', (statSync(join(DIR, f)).size / 1e6).toFixed(1) + ' → ' + (statSync(salida).size / 1e6).toFixed(1) + ' MB');
  }
}
