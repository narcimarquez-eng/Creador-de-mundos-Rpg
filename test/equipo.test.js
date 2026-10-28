// Pruebas de objetos del personaje, estado y drops. Ejecutar: node test/equipo.test.js
const assert = require('assert');
const E = require('../js/equipo.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

// Catálogo de prueba con la forma de piezas/catalogo.json (armaduras-glb)
const CATALOGO = {
  maxNivel: 10,
  inicial: { underlayer: 2 },
  ranuras: {
    underlayer: [{ idx: 1, nombre: 'Gambesón', nivel: 2, archivo: null }, { idx: 2, nombre: 'Cota de malla', nivel: 1, archivo: null }],
    torso: [{ idx: 1, nombre: 'Cota de escamas', nivel: 3, archivo: 'piezas/torso/1.glb' }, { idx: 2, nombre: 'Peto', nivel: 6, archivo: 'piezas/torso/2.glb' }],
    helmet: [{ idx: 1, nombre: 'Corona', nivel: 4, archivo: 'piezas/helmet/1.glb' }],
    weapon: [{ idx: 1, nombre: 'Espada básica', nivel: 1, archivo: 'piezas/weapon/1.glb' }, { idx: 2, nombre: 'Maza', nivel: 1, archivo: 'piezas/weapon/2.glb' }, { idx: 3, nombre: 'Hacha', nivel: 4, archivo: 'piezas/weapon/3.glb' }, { idx: 4, nombre: 'Espada solar', nivel: 8, archivo: 'piezas/weapon/4.glb' }]
  },
  clases: { guerrero: ['underlayer', 'torso', 'helmet', 'weapon'], mago: [] }
};
// Valores de rnd en orden: 1.º = ¿cae algo? (<0,05), 2.º = qué pieza, 3.º = estado
const sec = (...v) => { let i = 0; return () => v[i++ % v.length]; };
const SUERTE = [0.0, 0.0, 0.5];

t('personaje nuevo: cota inicial y arma básica (la de menor ataque de nivel 1)', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero', 'Ana');
  assert.strictEqual(p.nombre, 'Ana');
  const cota = E.objeto(p, p.equipo.underlayer);
  assert.strictEqual(cota.nombre, 'Cota de malla');
  const arma = E.objeto(p, p.equipo.weapon);
  assert.strictEqual(arma.nombre, 'Espada básica');
  assert.ok(arma.ataque > 0);
  const idx = E.equipoPorIdx(p);
  assert.strictEqual(idx.underlayer, 2);
  assert.strictEqual(idx.weapon, 1);
  assert.strictEqual(idx.torso, 0);
});

t('hasta nivel 5 solo caen cotas, nunca armas', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero');
  for (let i = 0; i < 200; i++) {
    const r = Math.random();
    const o = E.soltarPieza(p, CATALOGO, 3, false, sec(0.0, r, 0.5));
    if (o) {
      assert.ok(E.esCota({ nombre: o.nombre }), o.nombre);
      assert.notStrictEqual(o.ranura, 'weapon');
    }
  }
});

t('el mismo nombre sale con distinto estado (de malo a perfecto)', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero');
  const malo = E.soltarPieza(p, CATALOGO, 1, false, sec(0.0, 0.0, 0.0));
  const perfecto = E.soltarPieza(p, CATALOGO, 1, false, sec(0.0, 0.0, 1.0));
  assert.strictEqual(malo.nombre, perfecto.nombre);
  assert.notStrictEqual(malo.uid, perfecto.uid);
  assert.ok(malo.defensa < perfecto.defensa);
});

t('nivel bajo: las armas que caen son las de menor ataque', () => {
  const lista = E.armasDeDrop(CATALOGO, 'guerrero', 1);
  assert.strictEqual(lista.length, 1);
  assert.strictEqual(lista[0].nivel, 1);
  assert.ok(lista.every(a => a.nivel <= 1));
});

t('a partir de nivel 6 también caen armaduras de su nivel', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero');
  const nombres = new Set();
  for (let i = 0; i < 50; i++) {
    const o = E.soltarPieza(p, CATALOGO, 6, false, sec(0.0, i / 50, 0.5));
    if (o) nombres.add(o.nombre);
  }
  assert.ok([...nombres].some(x => !/Espada|Maza|Hacha/.test(x)));
});

t('monstruo normal sin suerte no suelta nada; el jefe siempre suelta', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero');
  assert.strictEqual(E.soltarPieza(p, CATALOGO, 3, false, () => 0.99), null);
  assert.ok(E.soltarPieza(p, CATALOGO, 3, true, () => 0.99));
});

t('equipar: hace falta tener el objeto y el nivel', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero');
  E.fabricar(p, CATALOGO, 'weapon.3', 4, 1000);
  const hacha = p.inventario[p.inventario.length - 1];
  assert.throws(() => E.equipar(p, 'no-existe', 10), /No tienes ese objeto/);
  assert.throws(() => E.fabricar(p, CATALOGO, 'weapon.4', 4, 1000), /requiere nivel 8/);
  E.equipar(p, hacha.uid, 4);
  assert.strictEqual(E.equipoPorIdx(p).weapon, 3);
});

t('herrero: fabrica con estado perfecto, cuesta oro y exige nivel', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero');
  assert.throws(() => E.fabricar(p, CATALOGO, 'helmet.1', 3, 1000), /requiere nivel 4/);
  assert.throws(() => E.fabricar(p, CATALOGO, 'helmet.1', 10, 10), /Faltan/);
  const coste = E.fabricar(p, CATALOGO, 'helmet.1', 10, 1000);
  assert.strictEqual(coste, E.FORJA_ORO * 4);
  const casco = p.inventario[p.inventario.length - 1];
  assert.strictEqual(casco.estado, 1);
});

t('inventario: tope de huecos; sin hueco no cae nada', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero');
  while (!E.llena(p)) E.fabricar(p, CATALOGO, 'helmet.1', 10, 1e9);
  assert.strictEqual(E.huecosLibres(p), 0);
  assert.strictEqual(E.soltarPieza(p, CATALOGO, 1, true, () => 0.0), null);
  assert.throws(() => E.fabricar(p, CATALOGO, 'helmet.1', 10, 1e9), /Inventario lleno/);
});

t('vender: da oro según nivel y estado, no vende lo equipado', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero');
  // Con jefe no se tira el dado de «¿cae algo?»: 1.º = pieza, 2.º = estado
  const malo = E.soltarPieza(p, CATALOGO, 1, true, sec(0.0, 0.0));
  const perfecto = E.soltarPieza(p, CATALOGO, 1, true, sec(0.0, 0.99));
  assert.ok(malo.estado < perfecto.estado);
  assert.ok(E.precioVenta(p, perfecto) > E.precioVenta(p, malo));
  const antes = p.inventario.length;
  const oro = E.vender(p, malo.uid);
  assert.strictEqual(oro, E.precioVenta(p, malo));
  assert.strictEqual(p.inventario.length, antes - 1);
  assert.throws(() => E.vender(p, p.equipo.underlayer), /Desequipa/);
});

t('mercader: vende a nivel del héroe con calidad estándar y cobra', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero');
  const venta = E.piezasDeTienda(CATALOGO, 'guerrero', 4).map(x => x.id);
  assert.ok(venta.includes('helmet.1') && venta.includes('weapon.3'));
  assert.ok(!venta.includes('weapon.4'));
  assert.throws(() => E.comprar(p, CATALOGO, 'helmet.1', 4, 10), /Faltan/);
  assert.throws(() => E.comprar(p, CATALOGO, 'weapon.4', 4, 1e9), /requiere nivel 8/);
  const coste = E.comprar(p, CATALOGO, 'weapon.3', 4, 1e9);
  assert.strictEqual(coste, E.COMPRA_ORO * 4);
  assert.strictEqual(p.inventario[p.inventario.length - 1].estado, 0.75);
});

console.log(`\n${n} pruebas de equipo superadas.`);
