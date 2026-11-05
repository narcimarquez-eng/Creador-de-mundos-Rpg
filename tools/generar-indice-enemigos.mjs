// Genera js/enemigos-glb-indice.js: para cada clave de enemigo, la ruta de su GLB «low» y «medium» en glb/.
// Fuente: tools/datos/indice-monstruos.json (índice exportado por el editor, con la clave de cada archivo).
// Cada fila busca su archivo por nombre dentro de glb/low o glb/medium, así no depende de la carpeta exacta
// que figure en el índice. Solo entran las claves que existen en el juego (js/enemigos-catalogo.js) y archivos presentes.
// Uso: node tools/generar-indice-enemigos.mjs   (vuelve a ejecutarlo cada vez que subas más archivos)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INDICE = path.join(raiz, 'tools', 'datos', 'indice-monstruos.json');
const SALIDA = path.join(raiz, 'js', 'enemigos-glb-indice.js');
const SALIDA_CARPETA = path.join(raiz, 'js', 'enemigos-carpeta.js');
const F = createRequire(import.meta.url)('../js/enemigos-carpeta-fusion.js');
const CALIDADES = ['low', 'medium'];

// Carga el catálogo de enemigos (sin Three): deja window.ENEMY_CATALOG
globalThis.window = globalThis;
await import(pathToFileURL(path.join(raiz, 'js', 'enemigos-catalogo.js')).href);
const claves = new Set(globalThis.ENEMY_CATALOG.map(e => e.key));

// Todos los .glb de glb/<calidad>/ (recursivo), indexados por nombre de archivo
function archivosPorNombre(calidad) {
  const mapa = new Map();
  (function recorrer(d) {
    if (!fs.existsSync(d)) return;
    for (const nombre of fs.readdirSync(d)) {
      const p = path.join(d, nombre);
      if (fs.statSync(p).isDirectory()) recorrer(p);
      else if (nombre.toLowerCase().endsWith('.glb')) {
        if (!mapa.has(nombre)) mapa.set(nombre, []);
        mapa.get(nombre).push(path.relative(raiz, p).split(path.sep).join('/'));
      }
    }
  })(path.join(raiz, 'glb', calidad));
  return mapa;
}
const enRepo = Object.fromEntries(CALIDADES.map(c => [c, archivosPorNombre(c)]));

const filas = JSON.parse(fs.readFileSync(INDICE, 'utf8'));
const indice = {};
const sinArchivo = [];
const fueraDelJuego = new Set();
const ambiguos = [];
const usados = { low: new Set(), medium: new Set() };

for (const fila of filas) {
  const { clave, calidad, archivo } = fila;
  if (!CALIDADES.includes(calidad)) continue;
  if (!claves.has(clave)) { fueraDelJuego.add(clave); continue; }
  const nombre = path.basename(archivo);
  const hallados = enRepo[calidad].get(nombre) || [];
  if (!hallados.length) { sinArchivo.push(`${calidad}/${clave}: ${nombre}`); continue; }
  if (hallados.length > 1) ambiguos.push(`${calidad}/${clave}: ${hallados.join(' y ')}`);
  indice[clave] = indice[clave] || {};
  if (indice[clave][calidad]) continue;
  indice[clave][calidad] = hallados[0];
  usados[calidad].add(hallados[0]);
}

// Monstruos de carpeta: GLB que no tienen enemigo en el catálogo. Se añaden al índice y a js/enemigos-carpeta.js
// (nivel = centro del rango de su carpeta nv-A-B, o 15). Así las zonas y las mazmorras los pueden elegir.
const carpeta = {};
for (const c of CALIDADES) for (const [nombre, rutas] of enRepo[c]) for (const r of rutas) {
  if (usados[c].has(r)) continue;
  const key = F.claveDesdeArchivo(nombre);
  if (claves.has(key)) continue;                       // ya está en el catálogo: si falta su fila, no se inventa
  carpeta[key] = carpeta[key] || { key, name: F.nombreDesdeArchivo(nombre), level: F.nivelDesdeRuta(r), glb: {} };
  if (!carpeta[key].glb[c]) { carpeta[key].glb[c] = r; usados[c].add(r); }
}
for (const key of Object.keys(carpeta)) if (!indice[key]) indice[key] = carpeta[key].glb;
fs.writeFileSync(SALIDA_CARPETA, `// Generado por tools/generar-indice-enemigos.mjs. No editar a mano: vuelve a ejecutar el script al subir archivos.
// Monstruos de glb/low y glb/medium que no están en el catálogo del editor: se unen con js/enemigos-carpeta-fusion.js.
(function (root) {
  'use strict';
  root.ENEMY_CARPETA = ${JSON.stringify(carpeta, null, 2)};
})(typeof window !== 'undefined' ? window : globalThis);
`);
console.log(`monstruos de carpeta (sin catálogo): ${Object.keys(carpeta).length}`);

const sinFila = CALIDADES.flatMap(c => [...enRepo[c].values()].flat().filter(r => !usados[c].has(r)));

const ordenado = Object.fromEntries(Object.keys(indice).sort().map(k => [k, indice[k]]));
fs.writeFileSync(SALIDA, `// Generado por tools/generar-indice-enemigos.mjs. No editar a mano: vuelve a ejecutar el script al subir archivos.
// Clave del enemigo → GLB de cada versión (medium: cerca, low: lejos). Las claves que no están aquí usan el procedural.
(function (root) {
  'use strict';
  root.ENEMY_GLB_INDEX = ${JSON.stringify(ordenado, null, 2)};
})(typeof window !== 'undefined' ? window : globalThis);
`);

const cuenta = c => Object.values(indice).filter(e => e[c]).length;
console.log(`claves con GLB: ${Object.keys(indice).length} de ${claves.size} (low: ${cuenta('low')}, medium: ${cuenta('medium')}, ambas: ${Object.values(indice).filter(e => e.low && e.medium).length})`);
console.log(`escrito ${path.relative(raiz, SALIDA)}`);
console.log(`filas del índice sin archivo subido: ${sinArchivo.length}`);
console.log(`claves del índice que no existen en el juego: ${fueraDelJuego.size}`);
if (sinFila.length) { console.log(`\narchivos en glb/ que el índice no nombra (${sinFila.length}):`); sinFila.forEach(s => console.log('  ' + s)); }
if (ambiguos.length) { console.log(`\nnombres repetidos (se usa el primero):`); ambiguos.forEach(s => console.log('  ' + s)); }
