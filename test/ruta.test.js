// Pruebas de la ruta a pie por los caminos. Ejecutar: node test/ruta.test.js
const assert = require('assert');
const R = require('../js/ruta.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

// Camino recto de a a b con un punto cada 50 m
function recta(a, b) {
  const L = Math.hypot(b.x - a.x, b.y - a.y), pasos = Math.round(L / 50), pts = [];
  for (let i = 0; i <= pasos; i++) pts.push({ x: a.x + (b.x - a.x) * i / pasos, y: a.y + (b.y - a.y) * i / pasos });
  return pts;
}
// Mundo: A —— B
//              |
//              C        D (sin caminos)
const A = { id: 'A', name: 'A', x: 0, y: 0 }, B = { id: 'B', name: 'B', x: 1000, y: 0 };
const C = { id: 'C', name: 'C', x: 1000, y: 1000 }, D = { id: 'D', name: 'D', x: 5000, y: 5000 };
const MUNDO = {
  towns: [A, B, C, D],
  roads: [{ id: 'ab', from: 'A', to: 'B', points: recta(A, B) }, { id: 'bc', from: 'B', to: 'C', points: recta(B, C) }]
};
// Puerta de cada pueblo: el borde del terreno (100 m) en la dirección del camino y 12 m más allá
const OPC = {
  mitad: () => 100,
  salida: (idPueblo, idCamino) => {
    const t = MUNDO.towns.find(x => x.id === idPueblo), r = MUNDO.roads.find(x => x.id === idCamino);
    const otro = MUNDO.towns.find(x => x.id === (r.from === idPueblo ? r.to : r.from));
    const L = Math.hypot(otro.x - t.x, otro.y - t.y), ux = (otro.x - t.x) / L, uy = (otro.y - t.y) / L;
    return [{ x: t.x + ux * 100, y: t.y + uy * 100 }, { x: t.x + ux * 112, y: t.y + uy * 112 }];
  }
};
const dentro = (p, c) => Math.max(Math.abs(p.x - c.x), Math.abs(p.y - c.y)) < 100;
const cerca = (p, q) => Math.hypot(p.x - q.x, p.y - q.y) < 1e-6;

t('del pueblo a una zona del camino: sale por la puerta y sigue el camino hasta la zona', () => {
  const ruta = R.calcularRuta(MUNDO, { x: 5, y: 5 }, { x: 500, y: 40 }, OPC);
  assert.ok(cerca(ruta[0], { x: 12, y: 0 }), JSON.stringify(ruta[0]));    // primero, la boca de la calle de salida
  assert.ok(cerca(ruta[1], { x: 100, y: 0 }), JSON.stringify(ruta[1]));   // luego, la puerta
  assert.ok(cerca(ruta[ruta.length - 1], { x: 500, y: 40 }));
  assert.ok(ruta.slice(0, -1).every(p => p.y === 0 && p.x <= 500), JSON.stringify(ruta));
  for (let i = 1; i < ruta.length - 1; i++) assert.ok(ruta[i].x >= ruta[i - 1].x);   // siempre hacia delante
});

t('a otro pueblo pasando por uno intermedio: entra por su puerta, cruza su plaza y sale por la otra', () => {
  const ruta = R.calcularRuta(MUNDO, { x: 0, y: 0 }, { x: 1000, y: 1000 }, OPC);
  const iPlazaB = ruta.findIndex(p => cerca(p, B));
  assert.ok(iPlazaB > 0, 'pasa por la plaza de B');
  assert.ok(cerca(ruta[iPlazaB - 1], { x: 900, y: 0 }), 'entra en B por su puerta');
  assert.ok(ruta[iPlazaB].plaza, 'la plaza va marcada');
  assert.ok(cerca(ruta[iPlazaB + 1], { x: 1000, y: 12 }), 'sale por la calle de salida hacia C');
  assert.ok(cerca(ruta[iPlazaB + 2], { x: 1000, y: 100 }), 'y por su puerta');
  assert.ok(cerca(ruta[ruta.length - 1], C));
  // Fuera de las puertas, nunca atraviesa el terreno de un pueblo salvo por la plaza
  ruta.forEach(p => { if (dentro(p, B) && !cerca(p, B)) assert.ok([{ x: 900, y: 0 }, { x: 1000, y: 12 }, { x: 1000, y: 100 }].some(q => cerca(p, q)), JSON.stringify(p)); });
});

t('desde mitad de un camino hacia atrás: no pasa por ningún pueblo', () => {
  const ruta = R.calcularRuta(MUNDO, { x: 600, y: 5 }, { x: 300, y: 0 }, OPC);
  assert.ok(ruta.every(p => !dentro(p, A) && !dentro(p, B)));
  for (let i = 1; i < ruta.length; i++) assert.ok(ruta[i].x <= ruta[i - 1].x, JSON.stringify(ruta));
});

t('desde fuera de un camino: primero se acerca a él y luego llega a la plaza de destino', () => {
  const ruta = R.calcularRuta(MUNDO, { x: 1060, y: 600 }, { x: 0, y: 0 }, OPC);
  assert.ok(Math.abs(ruta[0].x - 1000) < 1e-6 && Math.abs(ruta[0].y - 600) < 1e-6, JSON.stringify(ruta[0]));   // al camino B–C
  assert.ok(ruta.some(p => cerca(p, B)), 'pasa por B');
  assert.ok(cerca(ruta[ruta.length - 1], A));
});

t('dentro del mismo pueblo: directo al destino', () => {
  assert.deepStrictEqual(R.calcularRuta(MUNDO, { x: 5, y: 5 }, { x: 20, y: -10 }, OPC), [{ x: 20, y: -10 }]);
});

t('lejos de la plaza dentro de un pueblo: primero va a la plaza y luego a la puerta', () => {
  const ruta = R.calcularRuta(MUNDO, { x: -60, y: 50 }, { x: 500, y: 0 }, OPC);
  assert.ok(cerca(ruta[0], A) && cerca(ruta[1], { x: 12, y: 0 }) && cerca(ruta[2], { x: 100, y: 0 }), JSON.stringify(ruta.slice(0, 3)));
});

t('sin camino que llegue: en línea recta al destino', () => {
  assert.deepStrictEqual(R.calcularRuta(MUNDO, { x: 0, y: 0 }, { x: 5000, y: 5000 }, OPC), [{ x: 5000, y: 5000 }]);
});

t('elige el camino más corto cuando hay varios', () => {
  const conAtajo = { towns: MUNDO.towns, roads: MUNDO.roads.concat([{ id: 'ac', from: 'A', to: 'C', points: recta(A, C) }]) };
  const op = Object.assign({}, OPC, { salida: () => [] });
  const ruta = R.calcularRuta(conAtajo, { x: 0, y: 0 }, { x: 1000, y: 1000 }, op);
  assert.ok(!ruta.some(p => cerca(p, B)), 'no da la vuelta por B');
  assert.ok(ruta.every(p => Math.abs(p.x - p.y) < 1e-6), 'va por la diagonal');
});

t('los puntos no quedan pegados (a menos de 3 m)', () => {
  const ruta = R.calcularRuta(MUNDO, { x: 0, y: 0 }, { x: 1000, y: 1000 }, OPC);
  for (let i = 1; i < ruta.length; i++) assert.ok(Math.hypot(ruta[i].x - ruta[i - 1].x, ruta[i].y - ruta[i - 1].y) >= 3);
});

console.log(`\n${n} pruebas de la ruta superadas.`);
