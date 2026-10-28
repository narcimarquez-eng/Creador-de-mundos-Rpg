// Pruebas de piezas, equipo, drops y forja. Ejecutar: node test/equipo.test.js
const assert = require('assert');
const E = require('../js/equipo.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

// Catálogo de prueba con la misma forma que piezas/catalogo.json (armaduras-glb)
const CATALOGO = {
  maxNivel: 10,
  inicial: { underlayer: 2, torso: 1 },
  ranuras: {
    underlayer: [{ idx: 1, nombre: 'Gambesón', nivel: 2, archivo: null }, { idx: 2, nombre: 'Cota', nivel: 1, archivo: null }],
    torso: [{ idx: 1, nombre: 'Coraza', nivel: 1, archivo: 'piezas/torso/1.glb' }, { idx: 2, nombre: 'Peto', nivel: 6, archivo: 'piezas/torso/2.glb' }],
    helmet: [{ idx: 1, nombre: 'Corona', nivel: 4, archivo: 'piezas/helmet/1.glb' }]
  },
  clases: { guerrero: ['underlayer', 'torso', 'helmet'], mago: [] }
};
const sec = (...v) => { let i = 0; return () => v[i++ % v.length]; };

t('piezas de la clase ordenadas por nivel, con id estable', () => {
  const lista = E.piezasDeClase(CATALOGO, 'guerrero');
  assert.deepStrictEqual(lista.map(p => p.id), ['torso.1', 'underlayer.2', 'underlayer.1', 'helmet.1', 'torso.2']);
});

t('clase sin piezas o desconocida: error', () => {
  assert.deepStrictEqual(E.piezasDeClase(CATALOGO, 'mago'), []);
  assert.throws(() => E.piezasDeClase(CATALOGO, 'paladin'), /Clase sin piezas o desconocida/);
});

t('personaje nuevo sale con las piezas iniciales del catálogo', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero', 'Ana');
  assert.strictEqual(p.nombre, 'Ana');
  assert.strictEqual(p.equipo.underlayer, 2);
  assert.strictEqual(p.equipo.torso, 1);
  assert.strictEqual(p.equipo.helmet, 0);
  assert.deepStrictEqual(p.posee.sort(), ['torso.1', 'underlayer.2']);
});

t('equipar: hace falta poseer la pieza y tener el nivel', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero');
  assert.throws(() => E.equipar(p, CATALOGO, 'helmet.1', 10), /Aún no tienes Corona/);
  p.posee.push('helmet.1');
  assert.throws(() => E.equipar(p, CATALOGO, 'helmet.1', 3), /requiere nivel 4/);
  E.equipar(p, CATALOGO, 'helmet.1', 4);
  assert.strictEqual(p.equipo.helmet, 1);
});

t('monstruo normal: sin suerte no suelta nada', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero');
  assert.strictEqual(E.piezaDeMonstruo(p, CATALOGO, 6, false, () => 0.99), null);
});

t('monstruo normal con suerte: suelta una pieza de su nivel que aún no tiene', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero');
  const pieza = E.piezaDeMonstruo(p, CATALOGO, 6, false, sec(0.0, 0.0));
  assert.ok(pieza);
  assert.ok(pieza.nivel <= 6 && pieza.nivel >= 1);
  assert.ok(p.posee.includes(pieza.id));
});

t('drop: no repite piezas que ya posee y no suelta de niveles muy altos', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero');
  const a = E.piezaDeMonstruo(p, CATALOGO, 4, true, sec(0.0, 0.0));
  const b = E.piezaDeMonstruo(p, CATALOGO, 4, true, sec(0.0, 0.0));
  assert.notStrictEqual(a.id, b.id);
  assert.strictEqual(E.piezaDeMonstruo(p, CATALOGO, 1, true, sec(0.0)), null);
});

t('herrero: fabrica una pieza no poseída pagando oro', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero');
  assert.throws(() => E.fabricar(p, CATALOGO, 'torso.1', 10, 1000), /Ya tienes/);
  assert.throws(() => E.fabricar(p, CATALOGO, 'helmet.1', 3, 1000), /requiere nivel 4/);
  assert.throws(() => E.fabricar(p, CATALOGO, 'helmet.1', 10, 10), /Faltan/);
  const coste = E.fabricar(p, CATALOGO, 'helmet.1', 10, 1000);
  assert.strictEqual(coste, E.FORJA_ORO * 4);
  assert.ok(p.posee.includes('helmet.1'));
});

console.log(`\n${n} pruebas de equipo superadas.`);
