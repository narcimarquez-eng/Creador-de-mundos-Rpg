// Pruebas de los encargos de zona (un NPC por zona en el pueblo más cercano). Ejecutar: node test/mision-zona.test.js
const assert = require('assert');
const M = require('../js/mision-zona.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

const PUEBLOS = [
  { id: 'p1', name: 'Lorrin', x: 0, y: 0 },
  { id: 'p2', name: 'Vasa', x: 1000, y: 0 },
  { id: 'p3', name: 'Marrón', x: 0, y: 1000 }
];
const zona = (id, type, extra) => Object.assign({ id, name: 'Zona ' + id, type, x: 100, y: 100, radius: 200, levelMin: 3, levelMax: 6 }, extra || {});

t('cada zona tiene su encargo, en el pueblo más cercano', () => {
  const zonas = [zona('a', 'caza', { x: 900, y: 50 }), zona('b', 'caza', { x: 50, y: 900 }), zona('c', 'segura', { x: 10, y: 20 })];
  const lista = M.encargosDeMundo(zonas, PUEBLOS);
  assert.strictEqual(lista.length, 3);
  assert.deepStrictEqual(lista.map(m => m.pueblo), ['p2', 'p3', 'p1']);
  assert.strictEqual(lista[0].puebloNombre, 'Vasa');
});

t('sin pueblos no hay encargos', () => {
  assert.deepStrictEqual(M.encargosDeMundo([zona('a', 'caza')], []), []);
});

t('el encargo es determinista: la misma zona da siempre el mismo personaje y texto', () => {
  const a = M.misionDeZona(zona('x', 'elite'), PUEBLOS[0]);
  const b = M.misionDeZona(zona('x', 'elite'), PUEBLOS[0]);
  assert.deepStrictEqual(a, b);
});

t('tipo de objetivo según la zona: segura visita, jefe derrota al jefe, resto mata', () => {
  assert.deepStrictEqual(M.objetivoDe(zona('s', 'segura')), { tipo: 'visitar', cantidad: 1 });
  assert.deepStrictEqual(M.objetivoDe(zona('j', 'jefe')), { tipo: 'jefe', cantidad: 1 });
  assert.strictEqual(M.objetivoDe(zona('e', 'elite')).tipo, 'matar');
  assert.strictEqual(M.objetivoDe(zona('p', 'pvp')).tipo, 'matar');
  assert.strictEqual(M.objetivoDe(zona('c', 'caza')).tipo, 'matar');
});

t('la cantidad crece con el tamaño de la zona y se queda entre 3 y 10', () => {
  const pequena = M.objetivoDe(zona('p', 'caza', { radius: 100 })).cantidad;
  const grande = M.objetivoDe(zona('g', 'caza', { radius: 900 })).cantidad;
  assert.ok(pequena >= 3 && grande <= 10);
  assert.ok(grande > pequena);
});

t('el texto del encargo nombra la zona y la cantidad, y el personaje tiene nombre y modelo', () => {
  const m = M.misionDeZona(zona('k', 'caza', { name: 'Bosque Negro' }), PUEBLOS[0]);
  assert.ok(m.texto.includes('Bosque Negro') && m.texto.includes(String(m.objetivo.cantidad)), m.texto);
  assert.ok(m.npc.frase.includes('Bosque Negro'), m.npc.frase);
  assert.ok(!/\\{(zona|n)\\}/.test(m.npc.frase + m.texto + m.gracias));
  assert.ok(m.npc.nombre && m.npc.tema);
  assert.ok(M.MODELOS.includes(m.npc.modelo));
});

t('recompensas: el oro crece con el nivel; el jefe da un punto de habilidad', () => {
  const bajo = M.misionDeZona(zona('r1', 'caza', { levelMin: 1 }), PUEBLOS[0]);
  const alto = M.misionDeZona(zona('r2', 'caza', { levelMin: 8 }), PUEBLOS[0]);
  assert.ok(alto.recompensa.oro > bajo.recompensa.oro);
  assert.strictEqual(M.misionDeZona(zona('r3', 'jefe'), PUEBLOS[0]).recompensa.puntos, 1);
  assert.strictEqual(M.misionDeZona(zona('r4', 'caza'), PUEBLOS[0]).recompensa.puntos, 0);
});

t('zonas de tipo desconocido usan los encargos de caza', () => {
  const m = M.misionDeZona(zona('z', 'rara'), PUEBLOS[0]);
  assert.strictEqual(m.objetivo.tipo, 'matar');
});

t('los encargos cambian de texto entre zonas (no todos iguales)', () => {
  const textos = new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(id => M.misionDeZona(zona(id, 'caza'), PUEBLOS[0]).titulo));
  assert.ok(textos.size >= 2);
});

console.log(`\n${n} pruebas de encargos de zona superadas.`);
