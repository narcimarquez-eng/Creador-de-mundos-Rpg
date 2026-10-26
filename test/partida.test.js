// Pruebas del guardado de partidas. Ejecutar: node test/partida.test.js
const assert = require('assert');
const P = require('../js/partida.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }
function memStore() {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), _m: m };
}
const base = {
  name: 'Partida 1', worldName: 'Reino', worldSeed: 42, now: 1700000000000,
  player: { x: 12.34, z: -5.67, yaw: 1.2345 },
  hero: { level: 3, xp: 42.9, hp: 80.25, mp: 30 },
  inv: { gold: 120.7, vida: 2, mana: 1 },
  visited: ['t_1', 't_3'], timeOfDay: 'night'
};

t('crear una partida redondea los valores y guarda el formato', () => {
  const p = P.makePartida(base);
  assert.strictEqual(p.format, 'rpg-partida');
  assert.strictEqual(p.version, 1);
  assert.strictEqual(p.player.x, 12.3);
  assert.strictEqual(p.hero.xp, 42);
  assert.strictEqual(p.inv.gold, 120);
  assert.ok(p.id.length > 3);
  assert.deepStrictEqual(p.visited, ['t_1', 't_3']);
});

t('el archivo se valida al leerlo; uno dañado se descarta', () => {
  const p = P.makePartida(base);
  assert.doesNotThrow(() => P.parsePartida(JSON.stringify(p)));
  assert.throws(() => P.parsePartida('{"format":"otra"}'));
  assert.throws(() => P.parsePartida('no es json'));
  const store = memStore();
  P.writeList(store, 'w1', [p, { format: 'rpg-partida', version: 1, id: 'x' }]);
  assert.strictEqual(P.readList(store, 'w1').length, 1);
});

t('versión futura: no se carga', () => {
  const p = P.makePartida(base);
  p.version = 99;
  assert.throws(() => P.validate(p));
});

t('varias partidas por mundo; máximo 5', () => {
  let list = [];
  for (let i = 0; i < P.MAX_PER_WORLD; i++) list = P.upsert(list, P.makePartida(Object.assign({}, base, { name: 'P' + i })));
  assert.strictEqual(list.length, 5);
  assert.throws(() => P.upsert(list, P.makePartida(base)));
});

t('guardar de nuevo reemplaza la misma partida (mismo id)', () => {
  const p = P.makePartida(base);
  let list = P.upsert([], p);
  const p2 = Object.assign({}, p, { hero: Object.assign({}, p.hero, { level: 5 }) });
  list = P.upsert(list, p2);
  assert.strictEqual(list.length, 1);
  assert.strictEqual(list[0].hero.level, 5);
});

t('borrar una partida la quita sin tocar las demás', () => {
  const a = P.makePartida(base), b = P.makePartida(Object.assign({}, base, { name: 'B' }));
  const list = P.remove([a, b], a.id);
  assert.deepStrictEqual(list.map(x => x.id), [b.id]);
});

t('partida activa por mundo, separada de la lista de otros mundos', () => {
  const store = memStore();
  P.setActiveId(store, 'w1', 'pA');
  assert.strictEqual(P.getActiveId(store, 'w1'), 'pA');
  assert.strictEqual(P.getActiveId(store, 'w2'), null);
  P.setActiveId(store, 'w1', null);
  assert.strictEqual(P.getActiveId(store, 'w1'), null);
});

t('restaurar: devuelve los campos de juego, con copia de los pueblos visitados', () => {
  const p = P.makePartida(base);
  const r = P.restoreFields(p);
  assert.strictEqual(r.level, 3);
  assert.strictEqual(r.gold, 120);
  assert.deepStrictEqual(r.visited, ['t_1', 't_3']);
  r.visited.push('x');
  assert.strictEqual(p.visited.length, 2);
});

console.log(`\n${n} pruebas correctas`);
