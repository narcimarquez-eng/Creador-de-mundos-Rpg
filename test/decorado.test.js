// Pruebas de la decoración del campo: troceado en celdas y ocultación de lejos. Ejecutar: node test/decorado.test.js
const assert = require('assert');
const THREE = require('../tools/node_modules/three/build/three.cjs');
const D = require('../js/decorado.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

function rngDe(semilla) { let s = semilla >>> 0; const next = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; return { next, chance: p => next() < p, range: (a, b) => a + next() * (b - a) }; }

t('trocear: cada instancia va a la celda de su posición, con su matriz y su color', () => {
  const malla = new THREE.InstancedMesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial(), 5);
  const pos = [[10, 10], [20, 250], [310, 5], [650, 640], [-20, 15]];
  const m = new THREE.Matrix4(), c = new THREE.Color();
  pos.forEach(([x, z], i) => { m.makeTranslation(x, i, z); malla.setMatrixAt(i, m); malla.setColorAt(i, c.setRGB(i / 10, 0, 0)); });
  malla.userData.lejos = 400;
  const celdas = D.trocear(THREE, malla, 300);
  assert.strictEqual(celdas.length, 4);   // (0,0) con dos, (1,0), (2,2) y (-1,0)
  assert.strictEqual(celdas.reduce((a, x) => a + x.malla.count, 0), 5);
  const p = new THREE.Vector3();
  celdas.forEach(x => {
    for (let j = 0; j < x.malla.count; j++) {
      x.malla.getMatrixAt(j, m); p.setFromMatrixPosition(m);
      const i = p.y;   // la y guarda el índice original
      assert.deepStrictEqual([p.x, p.z], pos[i]);
      x.malla.getColorAt(j, c); assert.ok(Math.abs(c.r - i / 10) < 1e-6);
      assert.ok(p.x >= x.x0 && p.x <= x.x1 && p.z >= x.z0 && p.z <= x.z1);
    }
    assert.strictEqual(x.malla.geometry, malla.geometry);
    assert.strictEqual(x.malla.userData.lejos, 400);
  });
});

t('las distancias de ocultación crecen con el tamaño de lo que se oculta', () => {
  const L = D.LEJOS;
  assert.ok(L.cascotes < L.rocas && L.rocas < L.ruinas && L.ruinas < L.arboles);
  assert.ok(L.vallas <= L.muretes && L.matorrales < L.cabanas);
});

t('generar: lo lejano de la cámara se oculta y lo cercano se ve', () => {
  const lim = { minX: -1500, maxX: 1500, minZ: -1500, maxZ: 1500 };
  const g = D.generar(THREE, {
    rng: rngDe(7), limites: lim, altura: () => 0, bioma: () => 'montana', agua: () => false, libre: () => true,
    caminos: [[{ x: -1400, y: 0 }, { x: 1400, y: 0 }]]
  });
  const lej = g.userData.lejanos;
  assert.ok(lej.length > 20, 'troceado en celdas: ' + lej.length);
  // Ninguna malla instanciada con distancia de ocultación se queda entera para todo el mundo
  g.traverse(o => { if (o.isInstancedMesh && o.userData.lejos) assert.ok(o.userData.enLejania); });
  g.userData.actualizar(0, 0);
  const caja = c => Math.hypot(Math.max(c.x0, 0, -c.x1), Math.max(c.z0, 0, -c.z1));
  let vistas = 0, ocultas = 0;
  lej.forEach(c => {
    const d = caja(c);
    assert.strictEqual(c.malla.visible, d < c.dist, 'celda a ' + Math.round(d) + ' m con límite ' + c.dist);
    if (c.malla.visible) vistas++; else ocultas++;
  });
  assert.ok(vistas > 0 && ocultas > 0, vistas + ' vistas, ' + ocultas + ' ocultas');
  // Al ir a la otra punta, lo de aquí se oculta
  const cerca = lej.filter(c => c.malla.visible);
  g.userData.actualizar(1400, 1400);
  assert.ok(cerca.some(c => !c.malla.visible));
});

console.log(`\n${n} pruebas de la decoración superadas.`);
