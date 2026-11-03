// Genera js/enemigos-glb-indice.js: para cada clave de enemigo, la ruta de su GLB «low» (glb/low/…) y «medium» (glb/medium/…).
// Empareja cada archivo con la clave del catálogo (js/enemigos-catalogo.js) por su nombre: exacto o como prefijo.
// Los archivos sin pareja clara no entran en el índice (ese enemigo usa el modelo procedural); se listan al final.
// Para confirmar una pareja a mano, añádela a ALIAS (nombre del archivo sin .glb → clave del enemigo).
// Uso: node tools/generar-indice-enemigos.mjs   (vuelve a ejecutarlo cada vez que subas más archivos)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SALIDA = path.join(raiz, 'js', 'enemigos-glb-indice.js');
const CARPETAS = { low: 'glb/low', medium: 'glb/medium' };

const ALIAS = {
  // 'enemy_iron_boar_gorgrond': 'iron_boar_juggernaut',
};

// Carga el catálogo de enemigos (sin Three): deja window.ENEMY_CATALOG
globalThis.window = globalThis;
await import(pathToFileURL(path.join(raiz, 'js', 'enemigos-catalogo.js')).href);
const claves = globalThis.ENEMY_CATALOG.map(e => e.key);

// Quita prefijos y sufijos habituales del nombre de archivo para compararlo con la clave
function normalizar(nombre) {
  return nombre.toLowerCase()
    .replace(/\.glb$/, '')
    .replace(/[-\s]/g, '_')
    .replace(/^enemy_/, '')
    .replace(/^(lineage|elem)_/, '')
    .replace(/_(low|medium)$/, '');
}

function claveDeArchivo(nombre) {
  const stem = nombre.replace(/\.glb$/i, '');
  if (ALIAS[stem]) return ALIAS[stem];
  const n = normalizar(nombre);
  const candidatas = claves.filter(k => n === k || n.startsWith(k + '_'));
  candidatas.sort((a, b) => b.length - a.length);   // la clave más larga gana (archer_species_1 frente a archer)
  return candidatas[0] || null;
}

function archivosGlb(dir) {
  const salida = [];
  (function recorrer(d) {
    if (!fs.existsSync(d)) return;
    for (const nombre of fs.readdirSync(d)) {
      const p = path.join(d, nombre);
      if (fs.statSync(p).isDirectory()) recorrer(p);
      else if (nombre.toLowerCase().endsWith('.glb')) salida.push(p);
    }
  })(path.join(raiz, dir));
  return salida.sort();
}

const indice = {};
const sinPareja = [];
const duplicados = [];
for (const version of Object.keys(CARPETAS)) {
  for (const abs of archivosGlb(CARPETAS[version])) {
    const nombre = path.basename(abs);
    const clave = claveDeArchivo(nombre);
    const ruta = path.relative(raiz, abs).split(path.sep).join('/');
    if (!clave) { sinPareja.push(ruta); continue; }
    indice[clave] = indice[clave] || {};
    if (indice[clave][version]) { duplicados.push(`${clave} (${version}): ${indice[clave][version]} y ${ruta}`); continue; }
    indice[clave][version] = ruta;
  }
}

const ordenado = Object.fromEntries(Object.keys(indice).sort().map(k => [k, indice[k]]));
const cuerpo = `// Generado por tools/generar-indice-enemigos.mjs. No editar a mano: vuelve a ejecutar el script al subir archivos.
// Clave del enemigo → GLB de cada versión (medium: cerca, low: lejos). Las claves que no están aquí usan el procedural.
(function (root) {
  'use strict';
  root.ENEMY_GLB_INDEX = ${JSON.stringify(ordenado, null, 2)};
})(typeof window !== 'undefined' ? window : globalThis);
`;
fs.writeFileSync(SALIDA, cuerpo);

const conLow = Object.values(indice).filter(e => e.low).length;
const conMedium = Object.values(indice).filter(e => e.medium).length;
const conAmbas = Object.values(indice).filter(e => e.low && e.medium).length;
console.log(`claves con GLB: ${Object.keys(indice).length} de ${claves.length} (low: ${conLow}, medium: ${conMedium}, ambas: ${conAmbas})`);
console.log(`escrito ${path.relative(raiz, SALIDA)}`);
if (sinPareja.length) { console.log(`\nsin pareja clara (${sinPareja.length}), no entran en el índice:`); sinPareja.forEach(s => console.log('  ' + s)); }
if (duplicados.length) { console.log(`\nduplicados (se usa el primero):`); duplicados.forEach(s => console.log('  ' + s)); }
