// Versión lejana de los NPCs: npc/gurus/guru-N.glb → npc/gurus/guru-N-lejos.glb con ~10 % de los triángulos.
// Se simplifica cada pieza por separado (meshoptimizer) y se dejan los nodos tal cual, así la animación
// por nodos sigue valiendo. Uso: node tools/simplificar-npcs.mjs
import { NodeIO, PropertyType } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, simplify, prune } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import { readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'npc', 'gurus');
const RATIO = 0.1, ERROR = 0.02;   // error relativo al tamaño de cada pieza (de lejos no se nota)
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
await MeshoptSimplifier.ready;

const triangulos = doc => doc.getRoot().listMeshes().reduce((s, m) => s + m.listPrimitives().reduce((t, p) => t + (p.getIndices() ? p.getIndices().getCount() : p.getAttribute('POSITION').getCount()) / 3, 0), 0);

for (const f of readdirSync(DIR).filter(f => /^guru-\d+\.glb$/.test(f))) {
  const doc = await io.read(join(DIR, f));
  const antes = triangulos(doc);
  await doc.transform(
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: RATIO, error: ERROR, lockBorder: false }),
    prune({ propertyTypes: [PropertyType.ACCESSOR, PropertyType.BUFFER] })
  );
  const salida = join(DIR, f.replace('.glb', '-lejos.glb'));
  await io.write(salida, doc);
  console.log(f, Math.round(antes / 1000) + 'k →', Math.round(triangulos(doc) / 1000) + 'k triángulos,', (statSync(join(DIR, f)).size / 1e6).toFixed(1) + ' → ' + (statSync(salida).size / 1e6).toFixed(1) + ' MB');
}
