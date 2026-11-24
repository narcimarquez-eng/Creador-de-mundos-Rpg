// Pruebas integrales del juego completo y bloqueado «Valdris · Tierras del Sol Quebrado».
// Ejecutar: node test/valdris-juego-completo.test.js
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
const MisionZona = require('../js/mision-zona.js');
const Heroe = require('../js/heroe.js');
const Historia = require('../js/historia.js');
const Valdris = require('../js/valdris-juego.js');
const MundoOficial = require('../js/mundo-campana.js');

let passed = 0;
function t(nombre, fn) {
  fn();
  passed++;
  console.log('ok -', nombre);
}

t('Valdris v5 tiene escenario bloqueado, 12 zonas completas con Campeones Alfa, geometría limpia y biomas coherentes', () => {
  const w = MundoOficial.clonar();
  const T = W.getTerrain(w.seed);

  function distMinCamino(world, x, y) {
    let best = Infinity;
    for (const r of (world.roads || [])) {
      const pts = r.points || [];
      for (let i = 0; i < pts.length - 1; i++) {
        const ax = pts[i].x, ay = pts[i].y, bx = pts[i + 1].x, by = pts[i + 1].y;
        const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
        const tVal = l2 < 1e-6 ? 0 : Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l2));
        best = Math.min(best, Math.hypot(x - (ax + tVal * dx), y - (ay + tVal * dy)));
      }
    }
    return best;
  }

  assert.strictEqual(w.campaignVersion, 5);
  assert.strictEqual(w.bloqueadoJuego, true);
  assert.strictEqual(w.secretPlacesFijos, true);
  assert.strictEqual(w.towns.length, 7);
  assert.strictEqual(w.roads.length, 8);
  assert.strictEqual(w.zones.length, 12);
  assert.strictEqual(w.pois.length, 12);

  for (const r of w.roads) {
    const pts = r.points || [];
    let maxSl = 0;
    for (let i = 0; i < pts.length; i++) {
      assert.ok(!T.isWater(pts[i].x, pts[i].y), `Camino ${r.id} entra en el agua`);
      if (i > 0) {
        const seg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
        if (seg > 0.1) maxSl = Math.max(maxSl, Math.abs(T.heightAt(pts[i].x, pts[i].y) - T.heightAt(pts[i - 1].x, pts[i - 1].y)) / seg);
      }
    }
    assert.ok(maxSl <= 0.42, `Camino ${r.id} tiene pendiente excesiva (${Math.round(maxSl * 100)}%)`);
  }

  // z_9 y z_11 en zonas frías/alpinas reales
  const z9 = w.zones.find(z => z.id === 'z_9');
  const z11 = w.zones.find(z => z.id === 'z_11');
  assert.ok(z9 && z9.biome === 'nieve', `z_9 debe estar en nieve (actual: ${z9 && z9.biome})`);
  assert.ok(z11 && (z11.biome === 'montana' || z11.biome === 'nieve'), `z_11 debe estar en montaña o nieve (actual: ${z11 && z11.biome})`);
  assert.ok(Math.hypot(z9.x - z11.x, z9.y - z11.y) > 450, 'z_9 y z_11 no deben solaparse');

  const recintos = w.zones
    .filter(z => z.relieve && z.relieve.activo)
    .map(z => Relieve.obtenerRecinto(z, (x, zz) => T.heightAt(x, zz)));
  assert.strictEqual(recintos.length, 3);
  for (const rec of recintos) {
    const dCam = distMinCamino(w, rec.zx, rec.zz);
    assert.ok(dCam >= rec.rMax + 35, `Laberinto ${rec.zona.name} bloquea camino (${Math.round(dCam)}m < ${Math.round(rec.rMax + 35)}m)`);
  }

  for (const z of w.zones) {
    assert.ok(z.monsters.length >= 5, `${z.name} debe tener al menos 5 especies/enemigos (actual: ${z.monsters.length})`);
    for (const m of z.monsters) {
      assert.ok(ENEMY_GLB[m.enemigo], `Falta GLB para ${m.enemigo} en ${z.name}`);
    }
    const tieneLider = z.monsters.some(m => m.campeonZona || m.boss);
    assert.ok(tieneLider, `${z.name} debe tener un Campeón Alfa o Jefe`);

    for (let a = 0; a < 24; a++) {
      for (const f of [0.3, 0.65, 1.0]) {
        const px = z.x + Math.cos(a * Math.PI / 12) * z.radius * f;
        const py = z.y + Math.sin(a * Math.PI / 12) * z.radius * f;
        assert.ok(!T.isWater(px, py), `Zona ${z.name} pisa el agua`);
      }
    }

    const poi = w.pois.find(p => p.zoneId === z.id);
    assert.ok(poi, `La zona ${z.name} debe tener su POI vinculado`);
    assert.ok(!T.isWater(poi.x, poi.y), `POI ${poi.name} en agua`);
    assert.ok(distMinCamino(w, poi.x, poi.y) >= 55, `POI ${poi.name} demasiado cerca de un camino`);
    for (const rec of recintos) {
      const d = Math.hypot(poi.x - rec.zx, poi.y - rec.zz);
      assert.ok(d > rec.rMax + 15, `POI ${poi.name} dentro de recinto ${rec.zona.name}`);
    }
  }

  for (const dg of w.dungeons) {
    assert.ok(distMinCamino(w, dg.x, dg.y) >= 60, `Mazmorra ${dg.name} demasiado cerca de camino`);
    for (const z of w.zones) {
      const d = Math.hypot(dg.x - z.x, dg.y - z.y);
      assert.ok(d > z.radius + 25, `Mazmorra ${dg.name} invade la zona ${z.name}`);
    }
  }

  for (const s of w.secretPlaces) {
    const dCam = distMinCamino(w, s.x, s.z);
    const minD = (s.tipo === 'cabana' && s.modeloGLB) ? 70 : 60;
    assert.ok(dCam >= minD, `Lugar secreto ${s.id} demasiado cerca de camino (${Math.round(dCam)}m)`);
  }
});

t('Lugares secretos de Valdris: 5 cabañas regionales y 5 secretos de historia fijos en su lugar exacto', () => {
  const w = MundoOficial.clonar();
  const secretos = Secretos.generarLugaresSecretos(w);
  assert.strictEqual(secretos.length, 10);

  const cabanasContrato = secretos.filter(s => s.tipo === 'cabana' && s.misionCabana);
  assert.strictEqual(cabanasContrato.length, 5, 'Debe haber exactamente 5 cabañas de contrato');
  const mar = cabanasContrato.find(c => c.esMar);
  assert.ok(mar && mar.nombre.includes('Brisal'), 'La cabaña costera debe estar en la bahía de Puerto Brisal');

  const cap6 = w.historia.capitulos[5];
  const cap9 = w.historia.capitulos[8];
  const cap11 = w.historia.capitulos[10];
  const cap13 = w.historia.capitulos[12];
  const cap15 = w.historia.capitulos[14];
  assert.strictEqual(cap6.mision.secretoId, 'sec-fuente-brisal');
  assert.strictEqual(cap9.mision.secretoId, 'sec-cabana-cronista');
  assert.strictEqual(cap11.mision.secretoId, 'sec-altar-ambar');
  assert.strictEqual(cap13.mision.secretoId, 'sec-santuario-sol');
  assert.strictEqual(cap15.mision.secretoId, 'sec-fuente-cumbres');
  assert.notStrictEqual(cap6.mision.secretoId, cap15.mision.secretoId, 'Cap. 6 y Cap. 15 deben usar fuentes distintas');

  const histRaw = JSON.stringify(w.historia);
  assert.ok(!/\bAden\b/i.test(histRaw), 'La historia de Valdris no debe mencionar Aden');
});

t('Los 12 encargos de zona en Valdris tienen diálogos, NPCs y comarcas coherentes', () => {
  const w = MundoOficial.clonar();
  const encargos = MisionZona.encargosDeMundo(w.zones, w.towns);
  assert.strictEqual(encargos.length, 12);
  const nombresNpc = new Set();
  const esperadoPueblo = {
    z_1: 't_1', z_2: 't_2', z_3: 't_3', z_4: 't_3',
    z_5: 't_4', z_6: 't_1', z_7: 't_5', z_8: 't_6',
    z_9: 't_6', z_10: 't_5', z_11: 't_7', z_12: 't_7'
  };
  for (const e of encargos) {
    assert.ok(!/ovejas|gallinas|molino/i.test(e.npc.frase + e.titulo), `Encargo genérico colado en ${e.zona}: ${e.titulo}`);
    assert.strictEqual(e.pueblo, esperadoPueblo[e.zona], `Pueblo incoherente en ${e.zona}: ${e.puebloName || e.pueblo}`);
    nombresNpc.add(e.npc.nombre);
  }
  assert.strictEqual(nombresNpc.size, 12, 'Cada una de las 12 zonas debe tener un NPC propio');
});

t('ValdrisJuegoLib: maestría de caza, rachas, bestiario, viaje rápido y progreso global', () => {
  const w = MundoOficial.clonar();
  const h = Heroe.nuevoHeroe();
  const visited = new Set(['t_1']);

  assert.strictEqual(Valdris.esValdris(w), true);

  // Bestiario y bono de daño
  for (let i = 0; i < 5; i++) Valdris.registrarBestiario(h, { name: '👑 [Élite ×4] Keltir Enfurecido', level: 1, zone: w.zones[0] });
  const b5 = Valdris.bonoConocimientoEspecie(h, 'Keltir Enfurecido');
  assert.strictEqual(b5.rango, 1);
  assert.strictEqual(b5.bonusDanio, 0.05);
  for (let i = 0; i < 10; i++) Valdris.registrarBestiario(h, { name: 'Keltir Enfurecido', level: 1, zone: w.zones[0] });
  const b15 = Valdris.bonoConocimientoEspecie(h, 'Keltir Enfurecido');
  assert.strictEqual(b15.rango, 2);
  assert.strictEqual(b15.bonusDanio, 0.10);

  // Racha de caza
  const rachaSt = { count: 0, lastKillAt: 0 };
  let rInfo = null;
  for (let i = 0; i < 10; i++) {
    rInfo = Valdris.actualizarRachaCaza(rachaSt, 10000 + i * 5000);
  }
  assert.strictEqual(rInfo.count, 10);
  assert.strictEqual(rInfo.xpMult, 1.16);
  assert.strictEqual(rInfo.oroMult, 1.22);

  // Maestría completa de z_1 (cuota + campeón + POI)
  const z1 = w.zones[0];
  const meta1 = Valdris.metaCazaDeZona(z1, w);
  let totalOro = 0, totalPuntos = 0;
  for (let i = 0; i < meta1.metaKills; i++) {
    const r = Valdris.registrarCazaZona(h, z1, { name: 'Keltir Enfurecido' }, w);
    totalOro += r.oro; totalPuntos += r.puntos;
  }
  const rCamp = Valdris.registrarCazaZona(h, z1, { name: 'Colmillo de Hierro', campeonZona: true }, w);
  totalOro += rCamp.oro; totalPuntos += rCamp.puntos;
  const poi1 = w.pois.find(p => p.zoneId === 'z_1');
  const rPoi = Valdris.registrarPoiDescubierto(h, poi1, w);
  totalOro += rPoi.oro; totalPuntos += rPoi.puntos;

  assert.strictEqual(rPoi.dominadaAhora, true, 'z_1 debe quedar dominada al completar cuota, campeón y POI');
  assert.ok(totalOro > 400 && totalPuntos >= 2);
  assert.strictEqual(Valdris.multiplicadorZonaDominada(h, 'z_1').dominada, true);

  // Viaje rápido: bloqueado en combate o sin descubrir, permitido al descubrir
  const vrComb = Valdris.puedeViajarRapido({ enCombate: true, destinoId: 'town:t_1', heroeEst: h, visitedSet: visited, world: w, oro: 1000 });
  assert.strictEqual(vrComb.ok, false);
  const vrLock = Valdris.puedeViajarRapido({ enCombate: false, destinoId: 'town:t_2', heroeEst: h, visitedSet: visited, world: w, oro: 1000 });
  assert.strictEqual(vrLock.ok, false);
  Valdris.desbloquearViajeRapido(h, 'town:t_2');
  const vrOk = Valdris.puedeViajarRapido({ enCombate: false, destinoId: 'town:t_2', heroeEst: h, visitedSet: visited, world: w, oro: 1000 });
  assert.strictEqual(vrOk.ok, true);
  assert.strictEqual(vrOk.nombre, 'Puerto Brisal');

  // Descanso en campamento POI_1
  const camp = Valdris.campamentoCercano(w, poi1.x + 5, poi1.y - 5, 22);
  assert.ok(camp && camp.id === 'poi_1');

  // Persistencia en HeroeLib.limpiarHeroe
  h.principal.objetivo = { tipo: 'secreto', cantidad: 1, secretoId: 'sec-fuente-brisal', secretoTipo: 'fuente', nombre: 'Fuente', texto: 'Descubre', encargo: 'Ve' };
  const limpio = Heroe.limpiarHeroe(h);
  assert.strictEqual(limpio.cazaValdris.z_1.dominada, true);
  assert.strictEqual(limpio.bestiario.keltir_enfurecido.kills, 15);
  assert.ok(limpio.viajeRapido.includes('town:t_2'));
  assert.strictEqual(limpio.principal.objetivo.secretoId, 'sec-fuente-brisal');

  // Progreso global > 0
  const prog = Valdris.progresoGlobalValdris(limpio, w, visited, w.secretPlaces);
  assert.ok(prog.porcentaje > 0 && prog.zonasDominadas.hechos === 1);
});

t('valdris.html, index.html, creador-de-mundos.html y visor-mundo.html integran el hub y el modo juego bloqueado de Valdris', () => {
  const valHtml = fs.readFileSync(path.join(__dirname, '..', 'valdris.html'), 'utf8');
  const hubHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const edHtml = fs.readFileSync(path.join(__dirname, '..', 'creador-de-mundos.html'), 'utf8');
  const visHtml = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');

  assert.ok(valHtml.includes('visor-mundo.html?juego=valdris'));
  assert.ok(hubHtml.includes('visor-mundo.html?juego=valdris'));
  assert.ok(hubHtml.includes('creador-de-mundos.html'));
  assert.ok(edHtml.includes('id="btn-play-valdris"'));
  assert.ok(edHtml.includes('id="btn-home"'));
  assert.ok(visHtml.includes('js/valdris-juego.js'));
  assert.ok(visHtml.includes('MODO_JUEGO_VALDRIS'));
  assert.ok(visHtml.includes('body.modo-juego-valdris'));
  assert.ok(visHtml.includes('id="btn-portada-inicio"'));
  assert.ok(visHtml.includes('id="sec-atlas"'));
  assert.ok(visHtml.includes('buildAtlasUI'));
  assert.ok(visHtml.includes('ejecutarViajeRapido'));
});

console.log(`\n${passed} pruebas de Valdris Juego Completo superadas.`);
