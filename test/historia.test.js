// Pruebas de la misión principal (la crónica capítulo a capítulo). Ejecutar: node test/historia.test.js
const assert = require('assert');
const H = require('../js/historia.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

const normal = [{ name: 'Lobo', level: 2, boss: false }];
function mundo() {
  return {
    startTownId: 't1',
    towns: [
      { id: 't1', name: 'Lorrin', x: 0, y: 0, isStart: true },
      { id: 't2', name: 'Corwyn', x: 500, y: 0 },
      { id: 't3', name: 'Haltag', x: 0, y: -2000 },
      { id: 't4', name: 'Eldia', x: 3000, y: 3000 }
    ],
    zones: [
      { id: 'z1', name: 'Prados', type: 'caza', x: 200, y: 0, levelMin: 1, levelMax: 4, monsters: normal },
      { id: 'z2', name: 'Tundra', type: 'caza', x: 600, y: 100, levelMin: 4, levelMax: 7, monsters: normal },
      { id: 'z3', name: 'Cumbres', type: 'elite', x: 1000, y: 500, levelMin: 10, levelMax: 13, monsters: normal },
      { id: 'zj', name: 'Guarida', type: 'jefe', x: 2000, y: 0, levelMin: 12, levelMax: 15, monsters: normal.concat([{ name: 'Rey', level: 18, boss: true }]) },
      { id: 'zs', name: 'Remanso', type: 'segura', x: 100, y: 100, levelMin: 1, levelMax: 1, monsters: [] }
    ],
    roads: []
  };
}

// Evento que cumple una unidad del objetivo activo
function eventoDe(o) {
  if (o.tipo === 'matar') return { tipo: 'matar', zona: o.zona };
  if (o.tipo === 'jefe') return { tipo: 'jefe', zona: o.zona };
  if (o.tipo === 'visitar') return { tipo: 'visitar', pueblo: o.pueblo };
  if (o.tipo === 'hablar') return { tipo: 'hablar', npc: o.npc };
  return { tipo: 'forjar' };
}
function cumplir(p, w) {
  const o = H.asegurarObjetivo(p, w);
  let hecho = false;
  for (let i = 0; i < o.cantidad; i++) hecho = H.registrar(p, eventoDe(o));
  assert.ok(hecho);
  return H.completar(p);
}

t('empieza de 0: capítulo 1, hablar con la Sabia Elara, sin progreso', () => {
  const p = H.nuevaPrincipal();
  const o = H.asegurarObjetivo(p, mundo());
  assert.strictEqual(p.paso, 0);
  assert.strictEqual(p.progreso, 0);
  assert.strictEqual(o.tipo, 'hablar');
  assert.strictEqual(o.npc, 'guru-1');
});

t('uno a uno: lo que pide un capítulo futuro no cuenta hasta que llega su turno', () => {
  const w = mundo(), p = H.nuevaPrincipal();
  H.asegurarObjetivo(p, w);
  assert.strictEqual(H.registrar(p, { tipo: 'matar', zona: 'z1' }), false);
  assert.strictEqual(H.registrar(p, { tipo: 'visitar', pueblo: 't2' }), false);
  assert.strictEqual(H.registrar(p, { tipo: 'hablar', npc: 'guru-2' }), false);
  assert.strictEqual(p.progreso, 0);
  assert.throws(() => H.completar(p), /no está cumplido/);
  assert.strictEqual(H.registrar(p, { tipo: 'hablar', npc: 'guru-1' }), true);
  const r = H.completar(p);
  assert.strictEqual(r.numero, 1);
  assert.strictEqual(r.capitulo.titulo, 'Los siete reinos');
  assert.strictEqual(p.paso, 1);
  assert.strictEqual(p.objetivo, null);
});

t('cada capítulo nuevo empieza con su progreso a 0, aunque antes hubiera luchado', () => {
  const w = mundo(), p = H.nuevaPrincipal();
  cumplir(p, w);   // 1: hablar
  for (let i = 0; i < 10; i++) H.registrar(p, { tipo: 'matar', zona: 'z1' });   // durante el 2 (visitar) no cuenta
  cumplir(p, w);   // 2: visitar
  const o = H.asegurarObjetivo(p, w);
  assert.strictEqual(o.tipo, 'matar');
  assert.strictEqual(p.progreso, 0);
});

t('el capítulo de visitar pide el pueblo vecino; el del norte, el más al norte', () => {
  const w = mundo(), p = H.nuevaPrincipal();
  cumplir(p, w);
  assert.strictEqual(H.asegurarObjetivo(p, w).pueblo, 't2');
  const norte = H.resolverObjetivo(H.CAPITULOS[6], w);
  assert.strictEqual(norte.pueblo, 't3');
});

t('luchar: solo cuentan los monstruos de la zona pedida (el jefe también)', () => {
  const w = mundo(), p = H.nuevaPrincipal();
  cumplir(p, w); cumplir(p, w);
  const o = H.asegurarObjetivo(p, w);
  assert.strictEqual(o.zona, 'z1');   // nivel 2: la zona de nivel más cercano
  assert.strictEqual(H.registrar(p, { tipo: 'matar', zona: 'z2' }), false);
  assert.strictEqual(p.progreso, 0);
  H.registrar(p, { tipo: 'jefe', zona: 'z1' });
  assert.strictEqual(p.progreso, 1);
});

t('la historia completa: diez capítulos en orden, con el impacto sísmico en el 4 y la nova en el 8', () => {
  const w = mundo(), p = H.nuevaPrincipal();
  const resultados = [];
  while (!H.terminada(p)) resultados.push(cumplir(p, w));
  assert.strictEqual(resultados.length, H.CAPITULOS.length);
  assert.deepStrictEqual(resultados.map(r => r.numero), H.CAPITULOS.map((c, i) => i + 1));
  assert.strictEqual(resultados[3].recompensa.desbloquea, 'sismo');
  assert.strictEqual(resultados[7].recompensa.desbloquea, 'nova');
  assert.strictEqual(H.asegurarObjetivo(p, w), null);
  assert.strictEqual(H.contados(p).length, H.CAPITULOS.length);
});

t('el jefe se busca en un territorio de jefe; sin él, se lucha en la zona más difícil', () => {
  const w = mundo();
  assert.deepStrictEqual([H.resolverObjetivo(H.CAPITULOS[8], w).tipo, H.resolverObjetivo(H.CAPITULOS[8], w).zona], ['jefe', 'zj']);
  w.zones = w.zones.filter(z => z.type !== 'jefe');
  const o = H.resolverObjetivo(H.CAPITULOS[8], w);
  assert.strictEqual(o.tipo, 'matar');
  assert.strictEqual(o.zona, 'z3');
});

t('si el objetivo guardado ya no existe (zona borrada), se elige otro y el progreso vuelve a 0', () => {
  const w = mundo(), p = H.nuevaPrincipal();
  cumplir(p, w); cumplir(p, w);
  H.asegurarObjetivo(p, w);
  H.registrar(p, { tipo: 'matar', zona: 'z1' });
  assert.strictEqual(p.progreso, 1);
  w.zones = w.zones.filter(z => z.id !== 'z1');
  const o = H.asegurarObjetivo(p, w);
  assert.notStrictEqual(o.zona, 'z1');
  assert.strictEqual(p.progreso, 0);
});

t('sin más pueblos, el capítulo de viajar se cambia por hablar con su sabio', () => {
  const w = mundo();
  w.towns = w.towns.slice(0, 1);
  const o = H.resolverObjetivo(H.CAPITULOS[1], w);
  assert.strictEqual(o.tipo, 'hablar');
  assert.strictEqual(o.npc, 'guru-2');
});

t('los textos contados y los encargos nombran el lugar y no dejan marcas sin rellenar', () => {
  const w = mundo(), p = H.nuevaPrincipal();
  while (!H.terminada(p)) {
    const o = H.asegurarObjetivo(p, w);
    assert.ok(!/[{}]/.test(o.encargo + o.texto), o.encargo);
    const r = cumplir(p, w);
    assert.ok(!/[{}]/.test(r.texto), r.texto);
  }
  const p2 = H.nuevaPrincipal();
  cumplir(p2, w);
  assert.ok(H.asegurarObjetivo(p2, w).encargo.includes('Corwyn'));
});

t('la crónica repite el texto contado con el mismo lugar', () => {
  const w = mundo(), p = H.nuevaPrincipal();
  cumplir(p, w);
  const r = cumplir(p, w);
  assert.strictEqual(H.textoContado(H.CAPITULOS[1], w), r.texto);
  assert.ok(r.texto.includes('Corwyn'));
});

console.log(`\n${n} pruebas de la historia superadas.`);
