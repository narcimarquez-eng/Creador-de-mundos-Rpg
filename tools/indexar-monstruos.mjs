// Genera glb/monstruos/indice.json con todos los GLB de la carpeta glb/monstruos/ (nombre, clips de animación y altura).
// Hay que volver a ejecutarlo tras añadir, quitar o cambiar un monstruo. Uso: node tools/indexar-monstruos.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const carpeta = join(raiz, 'glb', 'monstruos');

// Lee el JSON de un GLB (cabecera binaria + primer fragmento)
function leerJson(ruta) {
  const b = readFileSync(ruta);
  if (b.toString('ascii', 0, 4) !== 'glTF') throw new Error(`${ruta} no es un GLB`);
  const n = b.readUInt32LE(12);
  return JSON.parse(b.toString('utf8', 20, 20 + n));
}

// Altura del monstruo: extensión en Y de sus posiciones (min/max de los accessors POSITION)
function alturaDe(j) {
  let min = Infinity;
  let max = -Infinity;
  for (const mesh of j.meshes || []) for (const p of mesh.primitives || []) {
    const acc = j.accessors[p.attributes && p.attributes.POSITION];
    if (!acc || !acc.min || !acc.max) continue;
    min = Math.min(min, acc.min[1]);
    max = Math.max(max, acc.max[1]);
  }
  return Number.isFinite(min) ? +(max - min).toFixed(3) : null;
}

const archivos = readdirSync(carpeta).filter(f => /\.glb$/i.test(f)).sort();
const indice = archivos.map(archivo => {
  const j = leerJson(join(carpeta, archivo));
  const clips = (j.animations || []).map(a => a.name || '');
  const id = archivo.replace(/\.glb$/i, '');
  const nombre = id.replace(/^enemy[-_](undead[-_])?/i, '').replace(/[-_]low$/i, '').split(/[-_\s]+/).filter(Boolean)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'Monstruo';
  return { id, nombre, archivo, clips, altura: alturaDe(j) };
});
writeFileSync(join(carpeta, 'indice.json'), JSON.stringify(indice, null, 2) + '\n');
console.log(`indice.json: ${indice.length} monstruos`);
