// Pruebas de la carpeta de monstruos GLB (js/monstruos-glb.js).
// Ejecutar: node test/monstruos-glb.test.js
const assert = require('assert');
const M = require('../js/monstruos-glb.js');
const indice = require('../glb/monstruos/indice.json');

let pasadas = 0;
function prueba(nombre, fn) {
  fn();
  pasadas++;
  console.log('ok -', nombre);
}

prueba('el nombre sale del archivo sin prefijos ni sufijo de bajo detalle', () => {
  assert.strictEqual(M.nombreDesdeArchivo('enemy_undead_banshee_queen_low.glb'), 'Banshee Queen');
  assert.strictEqual(M.nombreDesdeArchivo('enemy-blood-crown-reaper-marquis_low.glb'), 'Blood Crown Reaper Marquis');
  assert.strictEqual(M.nombreDesdeArchivo('mi_monstruo.glb'), 'Mi Monstruo');
  assert.strictEqual(M.nombreDesdeArchivo('.glb'), 'Monstruo');
});

prueba('el índice generado trae todos los GLB de la carpeta con sus clips', () => {
  assert.strictEqual(indice.length, 25);
  const titan = M.buscarMonstruo(indice, 'enemy-abyssal-crown-ossuary-titan_low');
  assert.ok(titan);
  assert.deepStrictEqual(titan.clips, ['Idle', 'Walk', 'Attack', 'JumpBite', 'Hit', 'Death']);
  assert.ok(titan.altura > 0);
});

prueba('la ruta del GLB va dentro de glb/monstruos/', () => {
  const e = M.entradaDeMonstruo('enemy_undead_lich_king_low.glb', { clips: ['Idle'], altura: 2.1 });
  assert.strictEqual(e.id, 'enemy_undead_lich_king_low');
  assert.strictEqual(M.rutaMonstruo(e), 'glb/monstruos/enemy_undead_lich_king_low.glb');
  assert.strictEqual(M.rutaMonstruo(null), null);
});

prueba('las opciones de zona usan el id y las de mazmorra el prefijo glb:', () => {
  const zona = M.opcionesMonstruos(indice);
  assert.strictEqual(zona.length, 25);
  assert.strictEqual(zona[0].value, indice[0].id);
  const maz = M.opcionesMonstruos(indice, { mazmorra: true });
  assert.strictEqual(maz[0].value, 'glb:' + indice[0].id);
  assert.strictEqual(M.idDesdeValorMazmorra(maz[0].value), indice[0].id);
  assert.strictEqual(M.idDesdeValorMazmorra('jefe_caballero_titan'), null);
});

prueba('elegir un monstruo es determinista con el generador dado', () => {
  const seq = [0, 0.999];
  const rnd = () => seq.shift();
  assert.strictEqual(M.elegirMonstruo(indice, rnd).id, indice[0].id);
  assert.strictEqual(M.elegirMonstruo(indice, () => 0.999).id, indice[indice.length - 1].id);
  assert.strictEqual(M.elegirMonstruo([], Math.random), null);
});

prueba('asignarModelos da un GLB a los monstruos sin modelo y respeta los que ya lo tienen', () => {
  const lista = [{ name: 'A' }, { name: 'B', modeloGlb: 'elegido' }];
  const out = M.asignarModelos(lista, indice, () => 0);
  assert.strictEqual(out[0].modeloGlb, indice[0].id);
  assert.strictEqual(out[1].modeloGlb, 'elegido');
  assert.strictEqual(lista[0].modeloGlb, undefined, 'no modifica la lista original');
  assert.deepStrictEqual(M.asignarModelos(lista, [], () => 0), lista);
});

console.log(`\n${pasadas} pruebas pasadas`);
