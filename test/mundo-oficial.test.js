// Pruebas del mundo oficial «Valdris · Tierras del Sol Quebrado» y su historia. Ejecutar: node test/mundo-oficial.test.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');

global.ENEMY_GLB_INDEX = {};
require('../js/enemigos-glb-indice.js');
const ENEMY_GLB = global.ENEMY_GLB_INDEX;

const W = require('../js/world-core.js');
global.WorldCore = W;
const Relieve = require('../js/relieve-zona.js');
const Secretos = require('../js/lugares-secretos.js');
global.LugaresSecretosLib = Secretos;
const H = require('../js/historia.js');
const MundoOficial = require('../js/mundo-campana.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

t('mundos/valdris.mundo.json y js/mundo-campana.js coinciden y pasan RPGWorld.validate', () => {
  const rawJson = fs.readFileSync(path.join(__dirname, '..', 'mundos', 'valdris.mundo.json'), 'utf8');
  const desdeJson = W.deserialize(rawJson);
  const clon = MundoOficial.clonar();
  W.validate(clon);

  assert.strictEqual(desdeJson.name, 'Valdris · Tierras del Sol Quebrado');
  assert.strictEqual(desdeJson.campaignId, 'valdris-sol-quebrado-v1');
  assert.strictEqual(clon.campaignId, desdeJson.campaignId);
  assert.strictEqual(clon.towns.length, 7);
  assert.strictEqual(clon.roads.length, 8);
  assert.strictEqual(clon.zones.length, 12);
  assert.strictEqual(clon.dungeons.length, 3);
  assert.strictEqual(clon.pois.length, 7);
  assert.ok(Array.isArray(clon.secretPlaces) && clon.secretPlaces.length >= 8);
});

t('todos los pueblos, caminos, zonas, mazmorras y POIs de Valdris están en tierra firme', () => {
  const w = MundoOficial.clonar();
  const T = W.getTerrain(w.seed);

  for (const town of w.towns) {
    assert.ok(!T.isWater(town.x, town.y), `Pueblo ${town.name} en agua`);
  }
  for (const road of w.roads) {
    for (const pt of road.points) {
      assert.ok(!T.isWater(pt.x, pt.y), `Camino ${road.id} cruza agua en (${Math.round(pt.x)}, ${Math.round(pt.y)})`);
    }
  }
  for (const z of w.zones) {
    assert.ok(!T.isWater(z.x, z.y), `Zona ${z.name} en agua`);
  }
  for (const d of w.dungeons) {
    assert.ok(!T.isWater(d.x, d.y), `Mazmorra ${d.name} en agua`);
  }
  for (const p of w.pois) {
    assert.ok(!T.isWater(p.x, p.y), `POI ${p.name} en agua`);
  }
});

t('todas las zonas de Valdris usan claves reales de ENEMY_GLB_INDEX y tienen 3 laberintos válidos', () => {
  const w = MundoOficial.clonar();
  const T = W.getTerrain(w.seed);
  const laberintos = [];

  for (const z of w.zones) {
    assert.ok(z.monsters.length >= 4, `${z.name} necesita al menos 4 tipos de monstruo`);
    for (const m of z.monsters) {
      assert.ok(m.enemigo && ENEMY_GLB[m.enemigo], `Enemigo inexistente en índice GLB: ${m.enemigo} (${z.name})`);
    }
    if (z.relieve && z.relieve.activo) {
      const rec = Relieve.obtenerRecinto(z, (x, zz) => T.heightAt(x, zz));
      assert.strictEqual(rec.problema, null, `Laberinto inválido en ${z.name}: ${rec.problema}`);
      laberintos.push(z);
    }
  }
  assert.strictEqual(laberintos.length, 3);
  const zonaJefe = w.zones.find(z => z.type === 'jefe');
  assert.ok(zonaJefe && zonaJefe.monsters.some(m => m.boss && m.name.includes('Aurelio')));
});

t('la crónica oficial de Valdris resuelve 16 capítulos de principio a fin sin marcas vacías', () => {
  const w = MundoOficial.clonar();
  assert.ok(w.historia && w.historia.titulo.includes('Valdris'));
  assert.strictEqual(w.historia.tituloFinal, 'Libertadores de Valdris');

  const p = H.nuevaPrincipal();
  let caps = 0;
  while (!H.terminada(p, w)) {
    const o = H.asegurarObjetivo(p, w);
    assert.ok(o && !/[{}]/.test(o.encargo + o.texto));
    for (let i = 0; i < o.cantidad; i++) {
      if (o.tipo === 'matar') H.registrar(p, { tipo: 'matar', zona: o.zona });
      else if (o.tipo === 'jefe') H.registrar(p, { tipo: 'jefe', zona: o.zona });
      else if (o.tipo === 'visitar') H.registrar(p, { tipo: 'visitar', pueblo: o.pueblo });
      else if (o.tipo === 'hablar') H.registrar(p, { tipo: 'hablar', npc: o.npc });
      else if (o.tipo === 'secreto') H.registrar(p, { tipo: 'secreto', id: o.secretoId, tipoSecreto: o.secretoTipo });
      else H.registrar(p, { tipo: 'forjar' });
    }
    const r = H.completar(p, w);
    assert.ok(!/[{}]/.test(r.texto));
    caps++;
  }
  assert.strictEqual(caps, 16);
  assert.strictEqual(H.actoActual(p, w).terminado, true);
});

t('index.html y visor-mundo.html cargan Valdris y exponen controles de historia', () => {
  const idxHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const visHtml = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');

  assert.ok(idxHtml.includes('js/mundo-campana.js'));
  assert.ok(idxHtml.includes('generarHistoriaParaMundo'));
  assert.ok(idxHtml.includes('btn-official-world'));
  assert.ok(idxHtml.includes('gen-story'));

  assert.ok(visHtml.includes('js/mundo-campana.js'));
  assert.ok(visHtml.includes('cargarMundoOficialYEntrar'));
  assert.ok(visHtml.includes('btn-portada-oficial'));
  assert.ok(visHtml.includes('HistoriaLib.prologoDe'));
});

t('Valdris v2 tiene pueblos con alta densidad de casas y estilos arquitectónicos variados', () => {
  const w = MundoOficial.clonar();
  assert.ok((w.campaignVersion || 1) >= 2, 'campaignVersion debe ser >= 2');
  const estilos = new Set();
  const tiposCasas = new Set();
  const texturasCalle = new Set();
  for (const town of w.towns) {
    assert.ok(town.cfg && town.cfg.houseDensity >= 75, `${town.name} tiene houseDensity baja: ${town.cfg && town.cfg.houseDensity}`);
    estilos.add(town.cfg.style);
    if (town.cfg.casas) tiposCasas.add(town.cfg.casas);
    if (town.cfg.streetTexture) texturasCalle.add(town.cfg.streetTexture);
  }
  assert.strictEqual(estilos.size, 7, 'Los 7 pueblos de Valdris deben tener estilos distintos: ' + [...estilos].join(', '));
  assert.ok(tiposCasas.size >= 5, 'Se esperan al menos 5 estilos de casas distintos en Valdris: ' + [...tiposCasas].join(', '));
  assert.ok(texturasCalle.size >= 6, 'Se esperan al menos 6 texturas de calle distintas en Valdris: ' + [...texturasCalle].join(', '));
});

console.log(`\n${n} pruebas del mundo oficial superadas.`);
