// Pruebas de clases y armaduras por niveles. Ejecutar: node test/equipo.test.js
const assert = require('assert');
const E = require('../js/equipo.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

t('guerrero: genera ligera y pesada, todos los tramos por nivel', () => {
  const lista = E.generarArmaduras('guerrero');
  assert.strictEqual(lista.length, 8);
  assert.ok(lista.some(a => a.linea === 'ligera'));
  assert.ok(lista.some(a => a.linea === 'pesada'));
  for (let i = 1; i < lista.length; i++) assert.ok(lista[i - 1].nivelMin <= lista[i].nivelMin);
});

t('mago: solo túnicas, sin armaduras de guerrero', () => {
  const lista = E.generarArmaduras('mago');
  assert.ok(lista.length > 0);
  assert.ok(lista.every(a => a.clase === 'mago' && a.linea === 'tunica'));
});

t('personaje nuevo sale con la cota (primer tramo de la línea ligera)', () => {
  const p = E.crearPersonaje('guerrero');
  const equipada = p.armaduras.find(a => a.id === p.equipada);
  assert.strictEqual(equipada.nombre, 'Cota de malla');
  assert.strictEqual(equipada.nivelMin, 1);
});

t('no se puede equipar una armadura por encima del nivel del héroe', () => {
  const p = E.crearPersonaje('guerrero');
  assert.throws(() => E.equipar(p, 'guerrero.pesada.1', 4), /requiere nivel 5/);
  assert.notStrictEqual(p.equipada, 'guerrero.pesada.1');
});

t('al subir de nivel se desbloquean y se equipan las armaduras', () => {
  const p = E.crearPersonaje('guerrero');
  const antes = E.disponibles(p, 4).length;
  const despues = E.disponibles(p, 5).length;
  assert.ok(despues > antes);
  const armadura = E.equipar(p, 'guerrero.pesada.1', 5);
  assert.strictEqual(armadura.nombre, 'Coraza de placas');
  assert.strictEqual(p.equipada, 'guerrero.pesada.1');
});

t('equipar un id de otra clase falla', () => {
  const p = E.crearPersonaje('mago');
  assert.throws(() => E.equipar(p, 'guerrero.ligera.1', 99), /no disponible/);
});

t('mejor armadura disponible: la de más defensa que cumple el nivel', () => {
  const p = E.crearPersonaje('guerrero');
  assert.strictEqual(E.mejorDisponible(p, 1).nombre, 'Cota de malla');
  assert.strictEqual(E.mejorDisponible(p, 9).nombre, 'Armadura de placas');
  assert.strictEqual(E.mejorDisponible(p, 99).nombre, 'Armadura de placas de adamante');
});

t('clase desconocida se rechaza', () => {
  assert.throws(() => E.crearPersonaje('paladin'), /Clase desconocida/);
});

console.log(`\n${n} pruebas de equipo superadas.`);
