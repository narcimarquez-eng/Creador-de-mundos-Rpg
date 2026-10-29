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

t('lucha: cada 20 monstruos, 1 punto', () => {
  const h = H.nuevoHeroe();
  for (let i = 0; i < 19; i++) assert.strictEqual(H.registrarMuerte(h), false);
  assert.strictEqual(H.registrarMuerte(h), true);
  assert.strictEqual(h.puntos, 1);
  assert.strictEqual(h.kills, 20);
});

t('recompensa de un capítulo: suma puntos y desbloquea la activa que diga', () => {
  const h = H.nuevoHeroe();
  H.recompensar(h, { puntos: 2, desbloquea: 'sismo' });
  assert.strictEqual(h.puntos, 2);
  assert.ok(h.desbloqueadas.sismo && !h.desbloqueadas.nova);
  H.recompensar(h, { puntos: 1, desbloquea: 'inexistente' });
  assert.strictEqual(h.puntos, 3);
  assert.ok(!h.desbloqueadas.inexistente);
});

t('activas: solo se mejoran si están desbloqueadas; cada nivel cuesta un punto', () => {
  const h = H.nuevoHeroe();
  h.puntos = 5;
  assert.throws(() => H.mejorar(h, 'nova'), /historia \(capítulo 8\)/);
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

t('partidas antiguas: la patada giratoria pasa a ser el impacto sísmico, con sus puntos', () => {
  const h = H.limpiarHeroe({ puntos: 1, gastados: { patada: 2, fuerza: 3 }, desbloqueadas: { patada: true } });
  assert.strictEqual(h.gastados.sismo, 2);
  assert.ok(h.desbloqueadas.sismo);
  assert.ok(!('patada' in h.gastados) && !('patada' in h.desbloqueadas));
  assert.strictEqual(H.estadisticas(h, 1, []).mult.sismo, 1.5);
});

t('técnicas: se usan desde su nivel; los puntos las mejoran (+25 % de daño por punto)', () => {
  const h = H.nuevoHeroe();
  assert.ok(!H.disponible(h, 'estocada', 4));
  assert.ok(H.disponible(h, 'estocada', 5));
  assert.ok(!H.disponible(h, 'nova', 50));          // la nova la da la historia, no el nivel
  h.puntos = 2;
  assert.throws(() => H.mejorar(h, 'estocada', 4), /nivel 5/);
  assert.strictEqual(H.mejorar(h, 'estocada', 5), 1);
  assert.strictEqual(H.estadisticas(h, 5, []).mult.estocada, 1.25);
  assert.strictEqual(H.estadisticas(h, 5, []).mult.tajo, 1);
  assert.match(H.requisito('tornillo'), /nivel 18/);
  assert.match(H.requisito('sismo'), /capítulo 4/);
});

t('barra: cuatro huecos con valores iniciales; asignar intercambia si ya estaba en otro hueco', () => {
  const h = H.nuevoHeroe();
  assert.deepStrictEqual(h.barra, { q: 'sismo', e: 'nova', z: 'tajo', v: 'estocada' });
  H.asignar(h, 'q', 'torbellino');
  assert.strictEqual(h.barra.q, 'torbellino');
  H.asignar(h, 'z', 'torbellino');                    // estaba en Q: Q recibe lo que había en Z
  assert.deepStrictEqual([h.barra.q, h.barra.z], ['tajo', 'torbellino']);
  assert.throws(() => H.asignar(h, 'x', 'tajo'), /Hueco/);
  assert.throws(() => H.asignar(h, 'q', 'fuerza'), /barra/);
});

t('barra: se guarda y se sanea (sin repetidas, sin pasivas, la patada antigua pasa al sismo)', () => {
  const h = H.limpiarHeroe({ barra: { q: 'patada', e: 'fuerza', z: 'tajo', v: 'tajo' } });
  assert.deepStrictEqual(h.barra, { q: 'sismo', e: null, z: 'tajo', v: null });
  assert.deepStrictEqual(H.limpiarHeroe({ puntos: 1 }).barra, H.BARRA_INICIAL);
});

t('arco: se reconoce por el nombre del arma', () => {
  assert.ok(H.esArco({ ranura: 'weapon', nombre: 'Arco de Caza' }));
  assert.ok(!H.esArco({ ranura: 'weapon', nombre: 'Espada Solar + Escudo Heráldico Sol' }));
  assert.ok(!H.esArco({ ranura: 'torso', nombre: 'Arco' }));
  assert.ok(!H.esArco(null));
});

t('historia: un héroe nuevo empieza en el capítulo 1 con el progreso a 0', () => {
  assert.deepStrictEqual(H.nuevoHeroe().principal, { paso: 0, progreso: 0, objetivo: null });
  // Partidas antiguas, sin historia: también empiezan de 0
  assert.deepStrictEqual(H.limpiarHeroe({ puntos: 3, hechas: { cazador1: true } }).principal, { paso: 0, progreso: 0, objetivo: null });
});

t('historia: el paso, el progreso y el objetivo se guardan y se sanean', () => {
  const guardado = { principal: { paso: 3, progreso: 99, objetivo: { tipo: 'matar', cantidad: 8, zona: 'z1', nombre: 'Prados', texto: 'Derrota a 8', encargo: 'Tamsin…', raro: 'x' } } };
  const h = H.limpiarHeroe(JSON.parse(JSON.stringify(guardado)));
  assert.strictEqual(h.principal.paso, 3);
  assert.strictEqual(h.principal.progreso, 8);   // acotado a la cantidad
  assert.strictEqual(h.principal.objetivo.zona, 'z1');
  assert.ok(!('raro' in h.principal.objetivo));
  const malo = H.limpiarHeroe({ principal: { paso: -2, progreso: 4, objetivo: { tipo: 'bailar' } } });
  assert.deepStrictEqual(malo.principal, { paso: 0, progreso: 0, objetivo: null });
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
