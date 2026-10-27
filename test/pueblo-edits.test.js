// Pruebas de las ediciones del pueblo (mover, borrar, añadir casas). Ejecutar: node test/pueblo-edits.test.js
const assert = require('assert');
const E = require('../js/pueblo-edits.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

const cfg = { style: 'l2_fantasy', terrainType: 'valley', relief: 45, seed: 77420, size: 3, houseDensity: 85,
  specialCount: 6, maxFloors: 3, roadWidth: 7, curve: 6, treeDensity: 80, hasWalls: true, hasRiver: true,
  hasMagic: true, hasProps: true, hasLamps: true, hasFences: true, time: 'day', rotation: 30, exits: [] };

t('la base no cambia con el giro, las salidas ni la hora', () => {
  const k = E.baseKey(cfg);
  assert.strictEqual(E.baseKey(Object.assign({}, cfg, { rotation: 200, time: 'night', exits: [{ angle: 10 }] })), k);
});

t('la base sí cambia con la semilla o el tamaño', () => {
  assert.notStrictEqual(E.baseKey(Object.assign({}, cfg, { seed: 5 })), E.baseKey(cfg));
  assert.notStrictEqual(E.baseKey(Object.assign({}, cfg, { size: 4 })), E.baseKey(cfg));
});

t('las ediciones de otra base no se aplican', () => {
  const edits = { base: E.baseKey(Object.assign({}, cfg, { seed: 5 })), ops: [{ op: 'quitar-casa', id: '0:13' }] };
  assert.strictEqual(E.activeOps(Object.assign({}, cfg, { edits })), null);
  const ok = { base: E.baseKey(cfg), ops: [{ op: 'quitar-casa', id: '0:13' }] };
  assert.strictEqual(E.activeOps(Object.assign({}, cfg, { edits: ok })).length, 1);
});

t('sin ediciones no hay operaciones activas', () => {
  assert.strictEqual(E.activeOps(cfg), null);
  assert.deepStrictEqual(E.indexOps(null).removedHouses.size, 0);
});

t('el índice recoge quitar, mover y añadir casas, y quitar o mover calles', () => {
  const idx = E.indexOps([
    { op: 'quitar-casa', id: '-28:-32' },
    { op: 'mover-casa', id: '28:13', x: 40, z: 50 },
    { op: 'añadir-casa', id: 'n1', x: 60, z: -70 },
    { op: 'quitar-calle', id: 'principal' },
    { op: 'mover-calle', id: 'anillo:28', dx: 3, dz: -2 }
  ]);
  assert.ok(idx.removedHouses.has('-28:-32'));
  assert.deepStrictEqual(idx.movedHouses.get('28:13'), { x: 40, z: 50 });
  assert.deepStrictEqual(idx.addedHouses, [{ id: 'n1', x: 60, z: -70 }]);
  assert.ok(idx.removedStreets.has('principal'));
  assert.deepStrictEqual(idx.movedStreets.get('anillo:28'), { dx: 3, dz: -2 });
});

t('la última operación de mover una casa es la que cuenta', () => {
  const idx = E.indexOps([{ op: 'mover-casa', id: 'a', x: 1, z: 1 }, { op: 'mover-casa', id: 'a', x: 9, z: 9 }]);
  assert.deepStrictEqual(idx.movedHouses.get('a'), { x: 9, z: 9 });
});

t('las casas añadidas reciben ids nuevos sin repetir', () => {
  assert.strictEqual(E.nextAddedId([]), 'n1');
  assert.strictEqual(E.nextAddedId([{ op: 'añadir-casa', id: 'n1' }, { op: 'añadir-casa', id: 'n4' }]), 'n5');
  assert.strictEqual(E.nextAddedId([{ op: 'quitar-casa', id: '0:13' }]), 'n1');
});

t('elegir casa: la más cercana dentro de la distancia', () => {
  const hs = [{ id: 'a', x: 0, z: 0 }, { id: 'b', x: 3, z: 0 }, { id: 'c', x: 40, z: 0 }];
  assert.strictEqual(E.pickHouse(hs, 2.5, 0.5).id, 'b');
  assert.strictEqual(E.pickHouse(hs, 20, 0), null);
});

t('elegir calle: el punto tiene que caer sobre el eje, con la anchura', () => {
  const streets = [{ id: 'principal', width: 6, pts: [{ x: 0, z: -50 }, { x: 0, z: 50 }] }];
  assert.strictEqual(E.pickStreet(streets, 2.5, 10).id, 'principal');
  assert.strictEqual(E.pickStreet(streets, 6, 10), null);
});

t('elegir calle en un tramo inclinado usa la distancia al segmento, no al vértice', () => {
  const streets = [{ id: 'anillo:-28', width: 4, pts: [{ x: -20, z: 0 }, { x: 20, z: 0 }] }];
  assert.strictEqual(E.pickStreet(streets, 0, 2), streets[0]);
  assert.strictEqual(E.pickStreet(streets, 25, 0), null);
});

t('desplazar una calle no cambia el original', () => {
  const pts = [{ x: 1, z: 1 }];
  const moved = E.offsetPts(pts, 4, -2);
  assert.deepStrictEqual(moved, [{ x: 5, z: -1 }]);
  assert.deepStrictEqual(pts, [{ x: 1, z: 1 }]);
  assert.strictEqual(E.offsetPts(pts, 0, 0), pts);
});

t('etiquetas de calles y casas', () => {
  assert.strictEqual(E.streetLabel('principal'), 'Calle principal');
  assert.strictEqual(E.streetLabel('anillo:-28'), 'Calle de anillo');
  assert.strictEqual(E.streetLabel('especial-2'), 'Acceso a edificio especial');
  assert.strictEqual(E.streetLabel('acceso--28:13'), 'Acceso a casa');
  assert.strictEqual(E.houseLabel('n3'), 'Casa nueva');
  assert.strictEqual(E.houseLabel('-28:13'), 'Casa');
});

t('una calle dibujada guarda sus puntos y su tipo', () => {
  const idx = E.indexOps([{ op: 'añadir-calle', id: 'u1', kind: 'sendero', pts: [{ x: 0, z: 0 }, { x: 10, z: 0 }] }]);
  assert.deepStrictEqual(idx.addedStreets.get('u1'), { kind: 'sendero', pts: [{ x: 0, z: 0 }, { x: 10, z: 0 }] });
});

t('los puntos de una calle se mueven, se añaden y se quitan en orden', () => {
  const idx = E.indexOps([
    { op: 'añadir-calle', id: 'u1', kind: 'calle', pts: [{ x: 0, z: 0 }, { x: 10, z: 0 }, { x: 20, z: 0 }] },
    { op: 'mover-nodo-calle', id: 'u1', i: 1, x: 12, z: 5 },
    { op: 'añadir-nodo-calle', id: 'u1', i: 2, x: 15, z: 9 },
    { op: 'quitar-nodo-calle', id: 'u1', i: 0 }
  ]);
  assert.deepStrictEqual(idx.addedStreets.get('u1').pts, [{ x: 12, z: 5 }, { x: 15, z: 9 }, { x: 20, z: 0 }]);
});

t('no se quita un punto si la calle quedaría con menos de dos', () => {
  const idx = E.indexOps([
    { op: 'añadir-calle', id: 'u1', pts: [{ x: 0, z: 0 }, { x: 10, z: 0 }] },
    { op: 'quitar-nodo-calle', id: 'u1', i: 0 }
  ]);
  assert.strictEqual(idx.addedStreets.get('u1').pts.length, 2);
});

t('cambiar el tipo de una calle dibujada', () => {
  const idx = E.indexOps([
    { op: 'añadir-calle', id: 'u1', kind: 'calle', pts: [{ x: 0, z: 0 }, { x: 10, z: 0 }] },
    { op: 'cambiar-tipo-calle', id: 'u1', kind: 'calzada' }
  ]);
  assert.strictEqual(idx.addedStreets.get('u1').kind, 'calzada');
});

t('muros: tramos quitados y puertas', () => {
  const idx = E.indexOps([{ op: 'quitar-muro', id: 5 }, { op: 'puerta-muro', id: 10 }]);
  assert.ok(idx.removedWalls.has(5));
  assert.ok(idx.gates.has(10));
  assert.ok(!idx.removedWalls.has(10));
});

t('farolas: nuevas y quitadas', () => {
  const idx = E.indexOps([{ op: 'añadir-farola', id: 'g1', x: 3, z: 4 }, { op: 'quitar-farola', id: 'f2' }]);
  assert.deepStrictEqual(idx.addedLamps, [{ id: 'g1', x: 3, z: 4 }]);
  assert.ok(idx.removedLamps.has('f2'));
});

t('ids nuevos por tipo con su prefijo', () => {
  assert.strictEqual(E.nextId([], 'añadir-calle', 'u'), 'u1');
  assert.strictEqual(E.nextId([{ op: 'añadir-calle', id: 'u3' }], 'añadir-calle', 'u'), 'u4');
  assert.strictEqual(E.nextId([{ op: 'añadir-farola', id: 'g1' }], 'añadir-calle', 'u'), 'u1');
  assert.strictEqual(E.nextId([{ op: 'añadir-farola', id: 'g2' }], 'añadir-farola', 'g'), 'g3');
});

t('curva suave: pasa por los puntos de control y respeta los extremos', () => {
  const ctrl = [{ x: 0, z: 0 }, { x: 10, z: 10 }, { x: 20, z: 0 }];
  const c = E.curvePts(ctrl, 2);
  assert.deepStrictEqual(c[0], { x: 0, z: 0 });
  assert.deepStrictEqual(c[c.length - 1], { x: 20, z: 0 });
  const pasa = c.some(p => Math.hypot(p.x - 10, p.z - 10) < 1e-6);
  assert.ok(pasa, 'la curva pasa por el punto central');
  assert.ok(c.length > ctrl.length, 'muestrea más puntos que los de control');
});

t('punto más cercano de una polilínea: segmento, proyección y distancia', () => {
  const near = E.nearestOnPolyline([{ x: 0, z: 0 }, { x: 10, z: 0 }, { x: 10, z: 10 }], 12, 4);
  assert.strictEqual(near.seg, 1);
  assert.ok(Math.abs(near.x - 10) < 1e-9 && Math.abs(near.z - 4) < 1e-9);
  assert.ok(Math.abs(near.d - 2) < 1e-9);
});

t('elegir punto de calle dentro de la distancia', () => {
  assert.strictEqual(E.pickNode([{ x: 0, z: 0 }, { x: 10, z: 0 }], 9.5, 0.5), 1);
  assert.strictEqual(E.pickNode([{ x: 0, z: 0 }, { x: 10, z: 0 }], 5, 5), -1);
});

t('anchura según el tipo de calle', () => {
  assert.strictEqual(E.widthFor('calle', 7), 7);
  assert.strictEqual(E.widthFor('calzada', 7), 8.5);
  assert.strictEqual(E.widthFor('sendero', 7), 3.4);
});

t('etiqueta de calle dibujada', () => {
  assert.strictEqual(E.streetLabel('u2'), 'Calle dibujada');
});

t('árboles: quitados y puestos a mano', () => {
  const idx = E.indexOps([{ op: 'quitar-arbol', id: 'b3' }, { op: 'añadir-arbol', id: 'a1', x: 4, z: 5, especie: 'pino' }]);
  assert.ok(idx.removedTrees.has('b3'));
  assert.deepStrictEqual(idx.addedTrees, [{ id: 'a1', x: 4, z: 5, especie: 'pino' }]);
});

t('árbol sin especie usa el roble', () => {
  const idx = E.indexOps([{ op: 'añadir-arbol', id: 'a1', x: 0, z: 0 }]);
  assert.strictEqual(idx.addedTrees[0].especie, 'roble');
});

t('vallas: tramos quitados y valla nueva con sus dos puntos', () => {
  const idx = E.indexOps([{ op: 'quitar-valla', id: 'c1.2' }, { op: 'añadir-valla', id: 'c1', x1: 0, z1: 0, x2: 10, z2: 0 }]);
  assert.ok(idx.removedFences.has('c1.2'));
  assert.deepStrictEqual(idx.addedFences, [{ id: 'c1', x1: 0, z1: 0, x2: 10, z2: 0 }]);
});

t('ids de árboles y vallas nuevos con su prefijo', () => {
  assert.strictEqual(E.nextId([], 'añadir-arbol', 'a'), 'a1');
  assert.strictEqual(E.nextId([{ op: 'añadir-valla', id: 'c4' }], 'añadir-valla', 'c'), 'c5');
});

t('especies que se pueden poner a mano', () => {
  assert.deepStrictEqual(Object.keys(E.TREE_SPECIES).sort(), ['alamo', 'arbusto', 'pino', 'roble']);
});

console.log('\n' + n + ' pruebas correctas');
