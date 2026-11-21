// Pruebas de la geometría del mapa: límites, escalas, orientación y rejilla. Ejecutar: node test/mapa.test.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const M = require('../js/mapa.js');
const RPGWorld = require('../js/world-core.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

const MUNDO = {
  towns: [{ id: 'a', name: 'Lorrin', x: 0, y: 0 }, { id: 'b', name: 'Vasa', x: 2000, y: 1000 }],
  zones: [{ id: 'z', x: 3000, y: -500, radius: 200 }],
  roads: [{ points: [{ x: 0, y: 0 }, { x: 2000, y: 1000 }] }],
  pois: [{ id: 'p', x: -800, y: 300 }]
};

t('límites: incluyen pueblos (con margen), zonas, caminos y lugares de interés', () => {
  const l = M.limites(MUNDO);
  assert.strictEqual(l.minX, -800);
  assert.strictEqual(l.maxX, 3200);
  assert.strictEqual(l.minY, -700);
  assert.strictEqual(l.maxY, 1500);
});

t('encajar: escala uniforme, todo el mundo dentro del lienzo y la inversa devuelve el punto', () => {
  const l = M.limites(MUNDO);
  const T = M.encajar(l, 800, 800, 40);
  [[l.minX, l.minY], [l.maxX, l.maxY], [0, 0]].forEach(([x, y]) => {
    const px = T.px(x), py = T.py(y);
    assert.ok(px >= 0 && px <= 800 && py >= 0 && py <= 800, px + ',' + py);
    const back = T.mundo(px, py);
    assert.ok(Math.abs(back.x - x) < 1e-6 && Math.abs(back.y - y) < 1e-6);
  });
  // Escala igual en los dos ejes: 1 m en x y en y ocupa lo mismo
  assert.ok(Math.abs((T.px(100) - T.px(0)) - T.escala * 100) < 1e-9);
  assert.ok(Math.abs((T.py(100) - T.py(0)) - T.escala * 100) < 1e-9);
});

t('vista centrada: el personaje queda en el centro y 100 m se ven a su escala', () => {
  const V = M.centrada(500, -200, 290, 300);
  assert.strictEqual(V.px(500), 150);
  assert.strictEqual(V.py(-200), 150);
  assert.ok(Math.abs(V.px(600) - V.px(500) - 100 * V.escala) < 1e-9);
});

t('orientación: el frente coincide con la dirección 3D (sin yaw, cos yaw) y yaw 0 mira hacia abajo del mapa', () => {
  const f0 = M.frente(0);
  assert.ok(Math.abs(f0.dx) < 1e-9 && Math.abs(f0.dy - 1) < 1e-9, JSON.stringify(f0));   // +z: hacia abajo
  const f90 = M.frente(Math.PI / 2);
  assert.ok(Math.abs(f90.dx - 1) < 1e-9 && Math.abs(f90.dy) < 1e-9, JSON.stringify(f90)); // +x: a la derecha
  const f = M.frente(0.7);
  assert.ok(Math.abs(Math.hypot(f.dx, f.dy) - 1) < 1e-9);
});

t('rejilla: el paso deja como mucho 10 líneas', () => {
  assert.strictEqual(M.pasoRejilla(800), 100);
  const p = M.pasoRejilla(4000);
  assert.ok(4000 / p <= 10, p);
  assert.strictEqual(M.pasoRejilla(1e9), 10000);
});

t('pueblo más cercano: elige el de menor distancia y da la distancia en metros', () => {
  const r = M.puebloCercano(MUNDO, 1900, 1000);
  assert.strictEqual(r.town.name, 'Vasa');
  assert.ok(Math.abs(r.d - 100) < 1e-9);
  assert.strictEqual(M.puebloCercano({ towns: [] }, 0, 0), null);
});

t('cámara del mapa grande: encajarVista, zoomVistaEn y escalaBonita conservan punto bajo cursor', () => {
  const lim = M.limites(MUNDO);
  const v = M.encajarVista(lim, 1000, 700, 36);
  assert.ok(v.scale >= 0.004 && v.scale <= 1.5);
  assert.strictEqual(v.cx, (lim.minX + lim.maxX) / 2);
  assert.strictEqual(v.cy, (lim.minY + lim.maxY) / 2);

  const T0 = M.crearTransformacionVista(v, 1000, 700);
  const focoAntes = T0.toWorld(310, 220);
  const vZoom = M.zoomVistaEn(v, 1000, 700, 310, 220, 2.5);
  assert.ok(vZoom.scale > v.scale);
  const T1 = M.crearTransformacionVista(vZoom, 1000, 700);
  const focoDespues = T1.toWorld(310, 220);
  assert.ok(Math.abs(focoAntes.x - focoDespues.x) < 1e-6 && Math.abs(focoAntes.y - focoDespues.y) < 1e-6);

  const esc = M.escalaBonita(vZoom.scale, 110);
  assert.ok(esc.metros >= 10 && esc.px > 0 && / (m|km)$/.test(esc.texto));
});

t('muestrearChunkTerreno replica el sombreado de biomas y elevación estilo Creador de Mundos', () => {
  const terrain = RPGWorld.getTerrain(4242);
  const chunk = M.muestrearChunkTerreno(terrain, RPGWorld, 2, 0, 0, 64);
  assert.strictEqual(chunk.length, 64 * 64 * 4);
  let vioAgua = false, vioTierra = false;
  for (let j = 0; j < 64 && (!vioAgua || !vioTierra); j++) {
    for (let i = 0; i < 64 && (!vioAgua || !vioTierra); i++) {
      const mpp = 4;
      const e = terrain.elevation(i * mpp, j * mpp);
      const b = terrain.biomeAt(i * mpp, j * mpp, e);
      const o = (j * 64 + i) * 4;
      assert.strictEqual(chunk[o + 3], 255);
      if (RPGWorld.BIOMES[b].water) {
        vioAgua = true;
        assert.ok(chunk[o + 2] >= chunk[o], 'píxel de agua debe predominar azul/cian');
      } else {
        vioTierra = true;
      }
    }
  }
  assert.ok(vioTierra || vioAgua, 'debe muestrear píxeles válidos');
  // Verificar contraste directo buscando una zona mixta de océano y tierra si no tocó en (0,0)
  let cAgua = null, cTierra = null;
  for (let cx = -3; cx <= 3 && (!cAgua || !cTierra); cx++) {
    for (let cy = -3; cy <= 3 && (!cAgua || !cTierra); cy++) {
      const mx = cx * 256 + 128, my = cy * 256 + 128;
      const e = terrain.elevation(mx, my);
      const b = terrain.biomeAt(mx, my, e);
      if (RPGWorld.BIOMES[b].water && !cAgua) cAgua = M.muestrearChunkTerreno(terrain, RPGWorld, 2, cx, cy, 64);
      if (!RPGWorld.BIOMES[b].water && !cTierra) cTierra = M.muestrearChunkTerreno(terrain, RPGWorld, 2, cx, cy, 64);
    }
  }
  assert.ok(cAgua && cTierra, 'el terreno debe generar tanto chunks con agua como de tierra');
});

t('visor-mundo.html integra mapa agrandado interactivo con chunks LOD y marcador en vivo', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');
  ['drawMapaTerreno', 'renderMapaChunk', 'mapa-centrar-tu', 'mapa-ver-todo', 'mapa-zoom-in',
    'mapa-zoom-out', 'MapaLib.muestrearChunkTerreno', 'MapaLib.encajarVista', 'MapaLib.zoomVistaEn']
    .forEach(tok => assert.ok(html.includes(tok), 'Falta en visor-mundo.html: ' + tok));
});

console.log(`\n${n} pruebas del mapa superadas.`);
