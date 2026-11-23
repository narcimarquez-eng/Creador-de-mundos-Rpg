// Pruebas de los monstruos de carpeta (js/enemigos-carpeta-fusion.js) y de js/enemigos-carpeta.js generado.
// Ejecutar: node test/enemigos-carpeta.test.js
const assert = require('assert');
const F = require('../js/enemigos-carpeta-fusion.js');

let pasadas = 0;
function prueba(nombre, fn) { fn(); pasadas++; console.log('ok -', nombre); }

prueba('la clave y el nombre salen del nombre de archivo, sin numeración ni sufijo', () => {
  assert.strictEqual(F.claveDesdeArchivo('enemy-highland-lynx-stalker_low.glb'), 'highland_lynx_stalker');
  assert.strictEqual(F.claveDesdeArchivo('enemy_undead_banshee_queen_low.glb'), 'banshee_queen');
  assert.strictEqual(F.nombreDesdeArchivo('enemy-df-01-abyssal-gore-chimera_low.glb'), 'Abyssal Gore Chimera');
  assert.strictEqual(F.nombreDesdeArchivo('enemy_undead_banshee_queen_low.glb'), 'Banshee Queen');
});

prueba('el nivel es el centro del rango de la carpeta; 15 si no tiene rango', () => {
  assert.strictEqual(F.nivelDesdeRuta('glb/low/zonas-iniciales-nv-1-20/x.glb'), 11);
  assert.strictEqual(F.nivelDesdeRuta('glb/low/animales-nv-1-12-lineage/x.glb'), 7);
  assert.strictEqual(F.nivelDesdeRuta('glb/low/bestias-elite/x.glb'), 15);
});

const carpeta = {
  nuevo_monstruo: { key: 'nuevo_monstruo', name: 'Nuevo Monstruo', level: 9, glb: { low: 'glb/low/x/nuevo.glb' } },
  ya_existe: { key: 'ya_existe', name: 'Ya Existe', level: 5, glb: { low: 'glb/low/x/otro.glb' } }
};

prueba('la fusión añade presets, rutas y entradas de catálogo sin sobrescribir lo que existe', () => {
  const presets = { ya_existe: { name: 'Original', archetype: 'ya_existe', stats: { level: 30, tier: 'Elite' } } };
  const glbIndex = { ya_existe: { low: 'glb/low/original.glb' } };
  const catalogo = [{ key: 'ya_existe', name: 'Original', level: 30 }];
  const cuenta = F.fusionar({ carpeta, presets, glbIndex, catalogo });
  assert.deepStrictEqual(cuenta, { presets: 1, glbIndex: 1, catalogo: 1 });
  assert.strictEqual(presets.nuevo_monstruo.archetype, 'nuevo_monstruo');
  assert.strictEqual(presets.nuevo_monstruo.stats.level, 9);
  assert.strictEqual(presets.nuevo_monstruo.raceCategory, 'carpeta');
  assert.strictEqual(glbIndex.nuevo_monstruo.low, 'glb/low/x/nuevo.glb');
  assert.strictEqual(catalogo.find(c => c.key === 'nuevo_monstruo').boss, false);
  assert.strictEqual(presets.ya_existe.name, 'Original', 'no sobrescribe');
  assert.strictEqual(glbIndex.ya_existe.low, 'glb/low/original.glb', 'no sobrescribe');
});

prueba('una segunda fusión no duplica nada', () => {
  const presets = {}; const glbIndex = {}; const catalogo = [];
  F.fusionar({ carpeta, presets, glbIndex, catalogo });
  const otra = F.fusionar({ carpeta, presets, glbIndex, catalogo });
  assert.deepStrictEqual(otra, { presets: 0, glbIndex: 0, catalogo: 0 });
  assert.strictEqual(catalogo.length, 2);
});

prueba('el archivo generado de carpeta carga y trae los monstruos fuera del catálogo', () => {
  const fs = require('fs');
  const src = fs.readFileSync(require('path').join(__dirname, '..', 'js', 'enemigos-carpeta.js'), 'utf8');
  const g = {};
  new Function('globalThis', src)(g);
  const claves = Object.keys(g.ENEMY_CARPETA || {});
  assert.ok(claves.length > 0, 'hay monstruos de carpeta');
  claves.forEach(k => assert.ok(g.ENEMY_CARPETA[k].glb.low || g.ENEMY_CARPETA[k].glb.medium, k + ' tiene GLB'));
});

console.log(`\n${pasadas} pruebas de monstruos de carpeta pasadas`);
