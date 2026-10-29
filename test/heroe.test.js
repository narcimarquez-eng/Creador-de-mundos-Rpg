// Pruebas de estadísticas, habilidades, misiones y puntos. Ejecutar: node test/heroe.test.js
const assert = require('assert');
const H = require('../js/heroe.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

t('héroe nuevo: sin puntos ni habilidades', () => {
  const h = H.nuevoHeroe();
  assert.strictEqual(h.puntos, 0);
  assert.deepStrictEqual(h.gastados, {});
});

t('lucha: cada 20 monstruos, 1 punto (sin contar misiones)', () => {
  const h = H.nuevoHeroe();
  // Las misiones de cazador dan puntos a los 5 y 25 monstruos; se cuentan aparte
  for (let i = 0; i < 19; i++) H.registrarMuerte(h, false);
  const antes = h.puntos;
  H.registrarMuerte(h, false);
  assert.strictEqual(h.puntos - antes, 1);
});

t('misión de cazadores: 5 monstruos dan puntos y se completa una vez', () => {
  const h = H.nuevoHeroe();
  let hechas = [];
  for (let i = 0; i < 5; i++) hechas = hechas.concat(H.registrarMuerte(h, false));
  assert.ok(hechas.some(m => m.id === 'cazador1'));
  assert.ok(h.puntos >= 2);
  const otra = H.registrarMuerte(h, false);
  assert.ok(!otra.some(m => m.id === 'cazador1'));
});

t('misión de viaje: visitar 3 pueblos desbloquea la patada', () => {
  const h = H.nuevoHeroe();
  H.registrarEvento(h, 'visitar', 2);
  assert.ok(!h.desbloqueadas.patada);
  H.registrarEvento(h, 'visitar', 3);
  assert.ok(h.desbloqueadas.patada);
});

t('activas: solo se mejoran si están desbloqueadas; cada nivel cuesta un punto', () => {
  const h = H.nuevoHeroe();
  h.puntos = 5;
  assert.throws(() => H.mejorar(h, 'nova'), /misión/);
  h.desbloqueadas.nova = true;
  assert.strictEqual(H.mejorar(h, 'nova'), 1);
  assert.strictEqual(H.mejorar(h, 'nova'), 2);
  assert.strictEqual(h.puntos, 3);
});

t('pasivas: hasta el máximo y sin puntos no se mejora', () => {
  const h = H.nuevoHeroe();
  h.puntos = 1;
  H.mejorar(h, 'vitalidad');
  assert.throws(() => H.mejorar(h, 'vitalidad'), /No tienes puntos/);
  h.puntos = 20;
  h.gastados.vitalidad = 10;
  assert.throws(() => H.mejorar(h, 'vitalidad'), /máximo/);
});

t('estadísticas: vitalidad y fuerza suman; el escudo da bloqueo', () => {
  const h = H.nuevoHeroe();
  h.gastados = { vitalidad: 2, fuerza: 3 };
  const base = H.estadisticas(h, 1, []);
  assert.strictEqual(base.vida, 100 + 20);
  assert.strictEqual(base.ataque, 3);
  const escudo = { ranura: 'weapon', nombre: 'Espada solar + Escudo Heráldico', piezaId: 'weapon.1', nivel: 1, estado: 1, ataque: 3 };
  const s = H.estadisticas(h, 1, [escudo]);
  assert.ok(s.bloqueo > 0);
  assert.strictEqual(s.ataque, 3 + 3);
});

t('armadura: defensa reduce el daño, con tope', () => {
  const h = H.nuevoHeroe();
  const pesada = { ranura: 'torso', nombre: 'Coraza', piezaId: 'torso.5', nivel: 12, estado: 1, defensa: 30 };
  const s = H.estadisticas(h, 1, [pesada]);
  assert.ok(s.reduccion > 0.3 && s.reduccion <= 0.7);
  const enorme = H.estadisticas(h, 1, [{ ranura: 'torso', nombre: 'X', piezaId: 'x', nivel: 1, estado: 1, defensa: 1e6 }]);
  assert.ok(enorme.reduccion <= 0.7);
});

t('especiales: aparecen con el nivel del objeto y son deterministas', () => {
  const bajo = { ranura: 'torso', nombre: 'Coraza', piezaId: 'torso.5', nivel: 4, estado: 1 };
  assert.strictEqual(H.especialesDe(bajo).length, 0);
  const medio = Object.assign({}, bajo, { nivel: 15 });
  assert.strictEqual(H.especialesDe(medio).length, 2);
  assert.deepStrictEqual(H.especialesDe(medio).map(e => e.id), H.especialesDe(medio).map(e => e.id));
});

t('limpiar: un estado dañado se corrige sin romper la partida', () => {
  const h = H.limpiarHeroe({ puntos: -4, kills: 'x', gastados: { fuerza: 99, nope: 2 }, desbloqueadas: { nova: true, zzz: true } });
  assert.strictEqual(h.puntos, 0);
  assert.strictEqual(h.gastados.fuerza, 10);
  assert.ok(!h.gastados.nope);
  assert.ok(h.desbloqueadas.nova && !h.desbloqueadas.zzz);
});

t('encargos de zona: matar cuenta cualquier monstruo; se completa y se entrega una vez', () => {
  const h = H.nuevoHeroe();
  H.aceptarZona(h, 'z1', { tipo: 'matar', cantidad: 2 });
  assert.throws(() => H.aceptarZona(h, 'z1', { tipo: 'matar', cantidad: 2 }), /Ya tienes/);
  assert.strictEqual(H.registrarZona(h, 'z1', 'matar'), false);
  assert.strictEqual(H.registrarZona(h, 'z1', 'jefe'), true);   // el jefe también cuenta como monstruo
  assert.ok(h.zonas.z1.lista);
  assert.strictEqual(H.registrarZona(h, 'z1', 'matar'), false); // ya completado: no vuelve a contar
  assert.throws(() => H.entregarZona(H.nuevoHeroe(), 'z1', 0), /no se puede entregar/);
  H.entregarZona(h, 'z1', 1);
  assert.strictEqual(h.puntos, 1);
  assert.throws(() => H.entregarZona(h, 'z1', 1), /no se puede entregar/);
});

t('encargos de zona: el jefe solo cuenta jefes; visitar solo cuenta visitas; otra zona no cuenta', () => {
  const h = H.nuevoHeroe();
  H.aceptarZona(h, 'j', { tipo: 'jefe', cantidad: 1 });
  H.aceptarZona(h, 'v', { tipo: 'visitar', cantidad: 1 });
  assert.strictEqual(H.registrarZona(h, 'j', 'matar'), false);
  assert.strictEqual(H.registrarZona(h, 'v', 'matar'), false);
  assert.strictEqual(H.registrarZona(h, 'j', 'visitar'), false);
  assert.strictEqual(H.registrarZona(h, 'v', 'visitar'), true);
  assert.strictEqual(H.registrarZona(h, 'j', 'jefe'), true);
  assert.strictEqual(H.registrarZona(h, 'sin-encargo', 'matar'), false);
});

t('encargos de zona: se guardan y se sanean al cargar la partida', () => {
  const h = H.nuevoHeroe();
  H.aceptarZona(h, 'z1', { tipo: 'matar', cantidad: 3 });
  H.registrarZona(h, 'z1', 'matar');
  const copia = H.limpiarHeroe(JSON.parse(JSON.stringify(h)));
  assert.deepStrictEqual(copia.zonas.z1, { tipo: 'matar', cantidad: 3, progreso: 1, lista: false, entregada: false });
  const dañado = H.limpiarHeroe({ zonas: { a: { tipo: 'raro', cantidad: 2 }, b: { tipo: 'jefe', cantidad: -4, progreso: 9 } } });
  assert.deepStrictEqual(Object.keys(dañado.zonas), ['b']);
  assert.strictEqual(dañado.zonas.b.cantidad, 1);
  assert.strictEqual(dañado.zonas.b.progreso, 1);   // el progreso guardado se acota al total del encargo
});

console.log(`\n${n} pruebas del héroe superadas.`);
