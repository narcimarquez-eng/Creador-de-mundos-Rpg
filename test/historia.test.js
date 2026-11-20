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
    secretPlaces: [
      { id: 'sec-f1', tipo: 'fuente', nombre: 'Fuente Arcana de las Ninfas', x: 300, z: 200 },
      { id: 'sec-c1', tipo: 'cabana', nombre: 'Cabaña del Viejo Erudito', x: 600, z: -300 },
      { id: 'sec-a1', tipo: 'altar', nombre: 'Altar Rúnico de las Estrellas', x: 1100, z: 500 },
      { id: 'sec-s1', tipo: 'santuario', nombre: 'Santuario de Piedra y Luz', x: 2200, z: 100 }
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
  if (o.tipo === 'secreto') return { tipo: 'secreto', id: o.secretoId, tipoSecreto: o.secretoTipo };
  return { tipo: 'forjar' };
}
function cumplir(p, w) {
  const o = H.asegurarObjetivo(p, w);
  let hecho = false;
  for (let i = 0; i < o.cantidad; i++) hecho = H.registrar(p, eventoDe(o));
  assert.ok(hecho);
  return H.completar(p);
}

t('empieza de 0: capítulo 1, cazar criaturas nivel 1 para forjar cinturón, sin progreso', () => {
  const p = H.nuevaPrincipal();
  const o = H.asegurarObjetivo(p, mundo());
  assert.strictEqual(p.paso, 0);
  assert.strictEqual(p.progreso, 0);
  assert.strictEqual(o.tipo, 'matar');
  assert.strictEqual(o.cantidad, 8);
  assert.strictEqual(H.CAPITULOS[0].recompensa.forjarPieza, 'belt');
});

t('uno a uno: lo que pide un capítulo futuro no cuenta hasta que llega su turno', () => {
  const w = mundo(), p = H.nuevaPrincipal();
  H.asegurarObjetivo(p, w);
  assert.strictEqual(H.registrar(p, { tipo: 'matar', zona: 'z2' }), false);
  assert.strictEqual(H.registrar(p, { tipo: 'visitar', pueblo: 't2' }), false);
  assert.strictEqual(H.registrar(p, { tipo: 'hablar', npc: 'guru-1' }), false);
  assert.strictEqual(p.progreso, 0);
  assert.throws(() => H.completar(p), /no está cumplido/);
  for (let i = 0; i < 7; i++) assert.strictEqual(H.registrar(p, { tipo: 'matar', zona: 'z1' }), false);
  assert.strictEqual(H.registrar(p, { tipo: 'matar', zona: 'z1' }), true);
  const r = H.completar(p);
  assert.strictEqual(r.numero, 1);
  assert.strictEqual(r.capitulo.titulo, 'Pieles de caza y el primer cinturón');
  assert.strictEqual(r.recompensa.forjarPieza, 'belt');
  assert.strictEqual(p.paso, 1);
  assert.strictEqual(p.objetivo, null);
});

t('los primeros 7 capítulos otorgan las 7 piezas de equipo básico completo', () => {
  const ranuras = H.CAPITULOS.slice(0, 7).map(c => c.recompensa.forjarPieza);
  assert.deepStrictEqual(ranuras, ['belt', 'boots', 'gloves', 'torso', 'helmet', 'shoulders', 'weapon']);
});

t('cada capítulo nuevo empieza con su progreso a 0, aunque antes hubiera luchado', () => {
  const w = mundo(), p = H.nuevaPrincipal();
  cumplir(p, w);   // 1: matar 3 en z1 (belt)
  for (let i = 0; i < 10; i++) H.registrar(p, { tipo: 'matar', zona: 'z2' });   // no cuenta para cap 2
  cumplir(p, w);   // 2: matar 4 en z1 (boots)
  const o = H.asegurarObjetivo(p, w);
  assert.strictEqual(o.tipo, 'matar');
  assert.strictEqual(p.progreso, 0);
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

t('la historia completa: 16 capítulos en orden, con el acompañante en el 3, impacto sísmico en el 4 y la nova en el 8', () => {
  const w = mundo(), p = H.nuevaPrincipal();
  const resultados = [];
  while (!H.terminada(p)) resultados.push(cumplir(p, w));
  assert.strictEqual(resultados.length, H.CAPITULOS.length);
  assert.deepStrictEqual(resultados.map(r => r.numero), H.CAPITULOS.map((c, i) => i + 1));
  assert.strictEqual(resultados[2].recompensa.desbloquea, 'acompanante');
  assert.strictEqual(resultados[3].recompensa.desbloquea, 'sismo');
  assert.strictEqual(resultados[7].recompensa.desbloquea, 'nova');
  assert.strictEqual(H.asegurarObjetivo(p, w), null);
  assert.strictEqual(H.contados(p).length, H.CAPITULOS.length);
});

t('el jefe se busca en un territorio de jefe; sin él, se lucha en la zona más difícil', () => {
  const w = mundo();
  const capJefe = H.CAPITULOS.find(c => c.mision.tipo === 'jefe');
  assert.deepStrictEqual([H.resolverObjetivo(capJefe, w).tipo, H.resolverObjetivo(capJefe, w).zona], ['jefe', 'zj']);
  w.zones = w.zones.filter(z => z.type !== 'jefe');
  const o = H.resolverObjetivo(capJefe, w);
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

t('soporte de misión visitar: pide pueblo vecino o más al norte, y sin pueblos cambia a sabio', () => {
  const w = mundo();
  const capTest = { sabio: 'Maestro Oren', npc: 'guru-2', encargo: 'Ve a {lugar}', mision: { tipo: 'visitar', pueblo: 'vecino' } };
  const o1 = H.resolverObjetivo(capTest, w);
  assert.strictEqual(o1.tipo, 'visitar');
  assert.strictEqual(o1.pueblo, 't2');
  const capNorte = { sabio: 'Maestro Oren', npc: 'guru-2', encargo: 'Ve al norte {lugar}', mision: { tipo: 'visitar', pueblo: 'norte' } };
  const oNorte = H.resolverObjetivo(capNorte, w);
  assert.strictEqual(oNorte.pueblo, 't3');

  w.towns = w.towns.slice(0, 1);
  const o2 = H.resolverObjetivo(capTest, w);
  assert.strictEqual(o2.tipo, 'hablar');
  assert.strictEqual(o2.npc, 'guru-2');
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
  assert.ok(H.asegurarObjetivo(p2, w).encargo.includes('Prados'));
});

t('la crónica repite el texto contado con el mismo lugar', () => {
  const w = mundo(), p = H.nuevaPrincipal();
  cumplir(p, w);
  const r = cumplir(p, w);
  assert.strictEqual(H.textoContado(H.CAPITULOS[1], w), r.texto);
  assert.ok(r.texto.includes('Prados'));
});

t('reajustarObjetivoCercano: selecciona la zona más cercana a la posición actual del héroe cuando progreso es 0', () => {
  // Crear mundo con dos zonas de nivel 1: z1 en (100, 100) y z_lejana en (2000, 2000)
  const w = mundo();
  w.zones.push({ id: 'z_cercana', name: 'Bosque Cercano', type: 'caza', levelMin: 1, x: 1950, y: 1950, radius: 50, monsters: [{ boss: false }] });
  
  const p = H.nuevaPrincipal();
  // Al inicio (cerca de t1 en 0,0), el objetivo por defecto es z1
  H.asegurarObjetivo(p, w);
  assert.strictEqual(p.objetivo.zona, 'z1');

  // Si el jugador se ha desplazado a (2000, 2000) y pulsa la misión automática (reajustarObjetivoCercano)
  H.reajustarObjetivoCercano(p, w, { x: 2000, y: 2000 });
  assert.strictEqual(p.objetivo.zona, 'z_cercana');
  assert.ok(p.objetivo.texto.includes('Bosque Cercano'));

  // Si ya tiene progreso > 0, no cambia de zona para no perder los avances ya hechos
  p.progreso = 1;
  H.reajustarObjetivoCercano(p, w, { x: 0, y: 0 });
  assert.strictEqual(p.objetivo.zona, 'z_cercana');
});

t('las misiones de matar de la historia principal tienen aumentadas las cantidades de monstruos', () => {
  const matarCaps = H.CAPITULOS.filter(c => c.mision && c.mision.tipo === 'matar');
  const cantEsperadas = [8, 12, 15, 18, 20, 22, 25, 25, 30];
  assert.strictEqual(matarCaps.length, cantEsperadas.length);
  matarCaps.forEach((c, idx) => {
    assert.strictEqual(c.mision.cantidad, cantEsperadas[idx], `Capítulo ${c.id} debe requerir ${cantEsperadas[idx]} monstruos`);
  });
});

t('visor-mundo.html cuenta con círculo amarillo indicador para los monstruos del capítulo activo', () => {
  const fs = require('fs'), path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');
  assert.ok(html.includes('function crearAnilloMisionMonstruo'), 'visor-mundo define crearAnilloMisionMonstruo');
  assert.ok(html.includes('0xfacc15'), 'usa color amarillo dorado para el círculo de misión');
  assert.ok(html.includes('function actualizarMarcadoresMisionMonstruos'), 'visor-mundo define actualizarMarcadoresMisionMonstruos');
  assert.ok(html.includes('m.questRing'), 'monstruos disponen de m.questRing');
});

t('estructura en 4 Actos y epílogo cubre todos los capítulos sin huecos', () => {
  assert.strictEqual(H.ACTOS.length, 4);
  assert.strictEqual(H.actoActual({ paso: 0 }).numero, 1);
  assert.strictEqual(H.actoActual({ paso: 4 }).numero, 1);
  assert.strictEqual(H.actoActual({ paso: 5 }).numero, 2);
  assert.strictEqual(H.actoActual({ paso: 10 }).numero, 3);
  assert.strictEqual(H.actoActual({ paso: 14 }).numero, 4);
  const epi = H.actoActual({ paso: H.CAPITULOS.length });
  assert.strictEqual(epi.terminado, true);
  assert.ok(epi.nombre.includes('Epílogo'));
});

t('monopolioRoto se activa al completar el capítulo 11 (Altar Rúnico)', () => {
  assert.strictEqual(H.monopolioRoto({ paso: 0 }), false);
  assert.strictEqual(H.monopolioRoto({ paso: 10 }), false);
  assert.strictEqual(H.monopolioRoto({ paso: 11 }), true);
  assert.strictEqual(H.monopolioRoto({ paso: 16 }), true);
});

t('materialDeCapitulo devuelve el material narrativo en los capítulos de forja', () => {
  assert.ok(H.materialDeCapitulo(H.CAPITULOS[0]).includes('correas'));
  assert.ok(H.materialDeCapitulo(H.CAPITULOS[6]).includes('hierro salvaje'));
  assert.strictEqual(H.materialDeCapitulo(H.CAPITULOS[15]), null);
});

t('fraseContextualNpc adapta los diálogos de sabios y servicios por Acto y pueblo', () => {
  const w = mundo();
  const f1 = H.fraseContextualNpc('guru-3', { paso: 0 }, w);
  const f3 = H.fraseContextualNpc('guru-3', { paso: 11 }, w);
  assert.strictEqual(f1.acto, 1);
  assert.strictEqual(f3.acto, 3);
  assert.notStrictEqual(f1.frase, f3.frase);
  assert.strictEqual(f3.esProtagonista, true);
  assert.ok(f3.frase.includes('Resonancia ancestral'));

  // Normaliza IDs de servicios en pueblos secundarios (ej. serv-herrero-t2)
  const fh1 = H.fraseContextualNpc('serv-herrero-t2', { paso: 0 }, w);
  const fh3 = H.fraseContextualNpc('serv-herrero-t2', { paso: 11 }, w);
  assert.strictEqual(fh1.npcId, 'serv-herrero');
  assert.notStrictEqual(fh1.frase, fh3.frase);
});

t('visor-mundo.html integra diálogos contextuales, actos en la crónica y feedback de materiales', () => {
  const fs = require('fs'), path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');
  assert.ok(html.includes('function fraseVivaNpc'), 'visor-mundo define fraseVivaNpc');
  assert.ok(html.includes('HistoriaLib.monopolioRoto'), 'visor-mundo consulta monopolioRoto');
  assert.ok(html.includes('HistoriaLib.materialDeCapitulo'), 'visor-mundo muestra materiales de forja');
  assert.ok(html.includes('HistoriaLib.actoActual'), 'visor-mundo muestra el acto actual');
});

t('visor-mundo.html ofrece portada de juego completo, prólogo de emboscada en 2 pasos y persistencia de prologoVisto', () => {
  const fs = require('fs'), path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');
  ['modal-portada', 'btn-portada-continuar', 'btn-portada-nueva', 'btn-portada-partidas', 'btn-portada-visor',
   'prologo-paso-1', 'prologo-paso-2', 'btn-prologo-siguiente', 'btn-prologo-volver', 'btn-prologo-saltar', 'btn-prologo-iniciar',
   'function abrirPortada', 'function abrirPrologo', 'function finalizarPrologo', 'prologoVistoActual', 'sinPortada'].forEach(token => {
    assert.ok(html.includes(token), `visor-mundo debe incluir ${token}`);
  });
});

t('HITOS_NARRATIVOS destaca transiciones clave de Actos II-IV, ruptura del monopolio y juicio final', () => {
  [5, 8, 10, 11, 14, 16].forEach(num => {
    const hito = H.hitoDeCapituloCompletado(num);
    assert.ok(hito && hito.titulo && hito.detalle, `Capítulo ${num} debe tener hito narrativo`);
  });
  assert.strictEqual(H.hitoDeCapituloCompletado(1), null);
  assert.ok(H.hitoDeCapituloCompletado(11).titulo.includes('Monopolio'));
  assert.ok(H.hitoDeCapituloCompletado(16).etiqueta.includes('Epílogo'));

  const fs = require('fs'), path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');
  ['cap-hito', 'hitoDeCapituloCompletado', 'contextoCabana', 'contextoNarrativoMazmorra', 'dv-lore'].forEach(tok => {
    assert.ok(html.includes(tok), `visor-mundo.html debe integrar ${tok}`);
  });
});

t('generarHistoriaParaMundo crea una crónica completa de 16 capítulos adaptada a cualquier mundo', () => {
  const W = require('../js/world-core.js');
  const wCustom = W.generateWorld({ name: 'Costa de Hierro', seed: 424242, settings: { townCount: 5 } });
  const hist = H.generarHistoriaParaMundo(wCustom);
  assert.ok(hist && hist.titulo.includes('Costa de Hierro'));
  assert.strictEqual(hist.capitulos.length, 16);
  assert.strictEqual(hist.actos.length, 4);
  assert.strictEqual(hist.tituloFinal, 'Libertadores de Costa de Hierro');
  assert.ok(hist.prologo && hist.prologo.parrafo1.includes(H.puebloInicial(wCustom).name));
  wCustom.historia = hist;

  assert.strictEqual(H.capitulosDe(wCustom).length, 16);
  assert.strictEqual(H.actosDe(wCustom), hist.actos);
  assert.strictEqual(H.prologoDe(wCustom), hist.prologo);
  assert.strictEqual(H.hitoDeCapituloCompletado(16, wCustom), hist.hitos[16]);

  const p = H.nuevaPrincipal();
  const vistos = [];
  while (!H.terminada(p, wCustom)) {
    const o = H.asegurarObjetivo(p, wCustom);
    assert.ok(o && !/[{}]/.test(o.encargo + o.texto), 'Sin llaves sin resolver en ' + o.encargo);
    for (let i = 0; i < o.cantidad; i++) H.registrar(p, eventoDe(o));
    vistos.push(H.completar(p, wCustom));
  }
  assert.strictEqual(vistos.length, 16);
  assert.strictEqual(H.actoActual(p, wCustom).terminado, true);
  assert.ok(H.fraseContextualNpc('guru-1', { paso: 0 }, wCustom).frase.includes(H.puebloInicial(wCustom).name));
});

t('DECISIONES_CAPITULO cubre los 7 capítulos clave y aplicarDecision es idempotente', () => {
  [2, 4, 6, 9, 11, 13, 16].forEach(num => {
    const d = H.decisionDeCapitulo(num);
    assert.ok(d && Array.isArray(d.opciones) && d.opciones.length >= 2, `Capítulo ${num} debe tener opciones`);
  });
  assert.strictEqual(H.decisionDeCapitulo(1), null);

  const Heroe = require('../js/heroe.js');
  const est = Heroe.nuevoHeroe();
  const r1 = H.aplicarDecision(est, 2, 'guardia');
  assert.strictEqual(r1.yaTomada, false);
  assert.strictEqual(est.decisiones.d_c2_lista, 'guardia');
  assert.deepStrictEqual(est.reputacion, { pueblo: 3, sombra: 0, vinculo: 1 });

  // Intentar cambiar/repetir la misma decisión no duplica reputación ni cambia lo ya sellado
  const r2 = H.aplicarDecision(est, 2, 'informante');
  assert.strictEqual(r2.yaTomada, true);
  assert.deepStrictEqual(est.reputacion, { pueblo: 3, sombra: 0, vinculo: 1 });

  // Los 3 finales del Capítulo 16 asignan finalId, título y epílogo propios
  ['luz', 'sombra', 'equilibrio'].forEach(rama => {
    const h = Heroe.nuevoHeroe();
    const resFin = H.aplicarDecision(h, 16, rama);
    assert.strictEqual(h.finalId, rama);
    assert.ok(resFin.epilogo && resFin.epilogo.id === rama);
    assert.ok(h.titulos.includes(resFin.opcion.premio.titulo));
    assert.strictEqual(H.epilogoDe(h, mundo()).id, rama);
  });
});

t('dialogoInteractivoNpc y resolverOpcionDialogo generan 3 opciones y solo premian la primera vez', () => {
  const Heroe = require('../js/heroe.js');
  const w = mundo();
  const est = Heroe.nuevoHeroe();
  const dlg = H.dialogoInteractivoNpc('serv-comandante-t2', est, w);
  assert.strictEqual(dlg.npcId, 'serv-comandante');
  assert.strictEqual(dlg.opciones.length, 3);
  assert.ok(!/[{}]/.test(dlg.opciones.map(o => o.etiqueta + o.respuesta).join(' ')));

  const r1 = H.resolverOpcionDialogo(est, dlg.opciones[0]);
  assert.strictEqual(r1.primeraVez, true);
  assert.ok(r1.xp > 0);
  assert.strictEqual(est.dialogosVistos[dlg.opciones[0].vistoKey], true);
  const vinAntes = est.reputacion.vinculo;

  const r2 = H.resolverOpcionDialogo(est, dlg.opciones[0]);
  assert.strictEqual(r2.primeraVez, false);
  assert.strictEqual(r2.xp, 0);
  assert.strictEqual(est.reputacion.vinculo, vinAntes);
});

t('subtituloVivo genera réplicas contextuales de compañero sin vacíos', () => {
  const w = mundo();
  ['pueblo', 'mazmorra', 'jefe_caido', 'hora', 'decision'].forEach(tipo => {
    const ev = tipo === 'hora' ? { tipo, hora: 'night' }
      : tipo === 'decision' ? { tipo, reaccion: '«Bien hecho.»' }
      : { tipo, nombre: 'Albaferro' };
    const sub = H.subtituloVivo(ev, { principal: { paso: 11 }, reputacion: { pueblo: 5, sombra: 0, vinculo: 2 } }, w, 'Rowan');
    assert.ok(sub && sub.hablante === 'Rowan' && sub.texto.length > 4);
  });
});

t('visor-mundo.html integra UI interactiva de decisiones, banner narrativo y desbloqueo de audio', () => {
  const fs = require('fs'), path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');
  ['cap-decision', 'banner-narrativo', 'npc-conv-box', 'Sonidos.desbloquear',
   'HistoriaLib.aplicarDecision', 'HistoriaLib.dialogoInteractivoNpc', 'HeroeLib.bonosReputacion',
   'banner-derrota', 'banner-zona', 'Sonidos.golpeVeloz', '#hint { display: none !important; }'].forEach(tok => {
    assert.ok(html.includes(tok), `visor-mundo.html debe incluir ${tok}`);
  });
});

t('sonidos.js desbloquea AudioContext, crea ambiente y arranca/detiene el secuenciador de música', () => {
  const vm = require('vm'), fs = require('fs'), path = require('path');
  let resumed = false, suspended = false, intervals = 0, cleared = 0, oscCount = 0, srcCount = 0;
  function makeParam(v = 0) {
    return { value: v, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, cancelScheduledValues() {} };
  }
  class FakeAudioContext {
    constructor() { this.sampleRate = 22050; this.currentTime = 1.0; this.state = 'suspended'; this.destination = {}; }
    createGain() { return { gain: makeParam(1), connect() {} }; }
    createBiquadFilter() { return { type: 'lowpass', frequency: makeParam(400), Q: makeParam(0.7), connect() {} }; }
    createBuffer(ch, len) { return { getChannelData: () => new Float32Array(len) }; }
    createBufferSource() { srcCount++; return { buffer: null, loop: false, connect() {}, start() {}, stop() {} }; }
    createOscillator() { oscCount++; return { type: 'sine', frequency: makeParam(440), connect() {}, start() {}, stop() {} }; }
    resume() { resumed = true; this.state = 'running'; return { then(cb) { cb(); return this; }, catch() { return this; } }; }
    suspend() { suspended = true; this.state = 'suspended'; return { then(cb) { if (cb) cb(); return this; }, catch() { return this; } }; }
  }
  const sb = {
    AudioContext: FakeAudioContext,
    Math,
    Promise,
    setInterval: () => { intervals++; return intervals; },
    clearInterval: () => { cleared++; }
  };
  sb.window = sb; sb.globalThis = sb;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'js/sonidos.js'), 'utf8'), sb);
  sb.Sonidos.setAmbiente('pueblo', 'day');
  sb.Sonidos.desbloquear();
  assert.ok(resumed, 'desbloquear debe llamar a resume()');
  assert.ok(intervals >= 1, 'Debe arrancar el temporizador de música ambiente');
  assert.ok(oscCount >= 2, 'Debe crear osciladores para LFO ambiental y notas musicales');
  assert.strictEqual(typeof sb.Sonidos.golpeVeloz, 'function', 'Debe exponer Sonidos.golpeVeloz');
  const oscAntes = oscCount, srcAntes = srcCount;
  sb.Sonidos.golpeVeloz(1.0);
  assert.ok(oscCount > oscAntes && srcCount > srcAntes, 'golpeVeloz debe crear nodos de barrido e impacto');
  const oscTrasPrimero = oscCount, srcTrasPrimero = srcCount;
  sb.Sonidos.golpeVeloz(1.0);
  assert.strictEqual(oscCount, oscTrasPrimero, 'golpeVeloz debe respetar throttle sin saturar en el mismo instante');
  assert.strictEqual(srcCount, srcTrasPrimero, 'golpeVeloz throttle también limita bufferSources');
  sb.Sonidos.activar(false);
  assert.ok(suspended && cleared >= 1, 'activar(false) debe suspender audio y detener música');
});

t('pistasDeCapitulo e inspeccionarPista generan pistas en zona, avanzan progreso y suman vínculo', () => {
  const w = mundo();
  const z1 = w.zones[0];
  const capMatar = H.CAPITULOS[0];
  const pistas = H.pistasDeCapitulo(capMatar, { tipo: 'matar', zona: z1.id, cantidad: 6 }, w);
  assert.strictEqual(pistas.length, 3);

  const ids = new Set();
  for (let i = 0; i < pistas.length; i++) {
    const p = pistas[i];
    assert.strictEqual(p.zona, z1.id);
    assert.strictEqual(p.id, `pista_${capMatar.id}_${i}`);
    assert.ok(!ids.has(p.id), 'Cada pista debe tener un id único');
    ids.add(p.id);
    const d = Math.hypot(p.x - z1.x, p.z - z1.y);
    assert.ok(d >= 1 && d <= (z1.radius || 100) * 0.85, `Pista ${p.id} fuera del radio de zona (${d})`);
  }

  assert.deepStrictEqual(H.pistasDeCapitulo(capMatar, { tipo: 'hablar', zona: z1.id }, w), []);
  assert.deepStrictEqual(H.pistasDeCapitulo(capMatar, { tipo: 'secreto', secreto: 'altar' }, w), []);

  const h = { reputacion: { pueblo: 0, vinculo: 0, sombra: 0 }, hitosMundo: {} };
  const r0 = H.inspeccionarPista(h, pistas[0]);
  assert.strictEqual(r0.nueva, true);
  assert.strictEqual(r0.completas, 1);
  assert.ok(r0.avance >= 1 && r0.xp > 0 && r0.oro > 0);
  assert.strictEqual(h.hitosMundo[pistas[0].id], true);
  assert.strictEqual(h.reputacion.vinculo, 0);

  const r0Dup = H.inspeccionarPista(h, pistas[0]);
  assert.strictEqual(r0Dup.nueva, false);
  assert.strictEqual(r0Dup.avance, 0);
  assert.strictEqual(h.reputacion.vinculo, 0);

  const r1 = H.inspeccionarPista(h, pistas[1]);
  assert.strictEqual(r1.nueva, true);
  assert.strictEqual(r1.completas, 2);
  assert.strictEqual(h.reputacion.vinculo, 0);

  const r2 = H.inspeccionarPista(h, pistas[2]);
  assert.strictEqual(r2.nueva, true);
  assert.strictEqual(r2.completas, 3);
  assert.strictEqual(r2.bonoVinculo, 1);
  assert.strictEqual(h.reputacion.vinculo, 1);
});

t('registrar avance_interactivo respeta zona, topa progreso y completa capítulos de caza', () => {
  const est = { paso: 0, progreso: 0, objetivo: { tipo: 'matar', zona: 'z1', cantidad: 5 } };
  assert.strictEqual(H.registrar(est, { tipo: 'avance_interactivo', zona: 'z2', cantidad: 3 }), false);
  assert.strictEqual(est.progreso, 0);

  assert.strictEqual(H.registrar(est, { tipo: 'avance_interactivo', zona: 'z1', cantidad: 2 }), false);
  assert.strictEqual(est.progreso, 2);

  assert.strictEqual(H.registrar(est, { tipo: 'avance_interactivo', zona: 'z1', cantidad: 10 }), true);
  assert.strictEqual(est.progreso, 5);
});

t('ritualDeSecreto define pasos y emboscada según tipo de lugar secreto y capítulo', () => {
  const altar = H.ritualDeSecreto({ id: 'sec-a1', tipo: 'altar', nombre: 'Altar Antiguo' }, { id: 'c7' });
  assert.strictEqual(altar.pasos.length, 3);
  assert.ok(!altar.emboscada);

  const cabana = H.ritualDeSecreto({ id: 'sec-c1', tipo: 'cabana', nombre: 'Cabaña' }, { id: 'c4' });
  assert.strictEqual(cabana.pasos.length, 2);
  assert.ok(!cabana.emboscada);

  const santuario = H.ritualDeSecreto({ id: 'sec-s1', tipo: 'santuario', nombre: 'Santuario' }, { id: 'c12' });
  assert.strictEqual(santuario.pasos.length, 1);
  assert.ok(santuario.emboscada && santuario.emboscada.cantidad >= 2);

  const fuente6 = H.ritualDeSecreto({ id: 'sec-f1', tipo: 'fuente', nombre: 'Fuente' }, { id: 'c6' });
  assert.strictEqual(fuente6.pasos.length, 1);
  assert.ok(fuente6.emboscada && fuente6.emboscada.cantidad >= 2);

  const fuente15 = H.ritualDeSecreto({ id: 'sec-f1', tipo: 'fuente', nombre: 'Fuente' }, { id: 'c15' });
  assert.strictEqual(fuente15.pasos.length, 1);
  assert.ok(!fuente15.emboscada);
});

t('recompensaReliquiaHistoria es idempotente y actualiza reputación, puntos e hitosMundo', () => {
  const w = mundo();
  const h = { puntos: 0, reputacion: { pueblo: 0, vinculo: 0, sombra: 0 }, hitosMundo: {} };

  const dun1 = H.recompensaReliquiaHistoria('mazmorra', 'dun1', 'Cripta del Alba', h, w);
  assert.strictEqual(h.hitosMundo.dun_dun1, true);
  assert.strictEqual(h.reputacion.pueblo, 2);
  assert.strictEqual(h.reputacion.vinculo, 2);
  assert.strictEqual(h.puntos, 1);
  assert.strictEqual(dun1.avance, 6);

  const dunDup = H.recompensaReliquiaHistoria('mazmorra', 'dun1', 'Cripta del Alba', h, w);
  assert.strictEqual(h.reputacion.pueblo, 2);
  assert.strictEqual(h.reputacion.vinculo, 2);
  assert.strictEqual(h.puntos, 1);
  assert.ok(!dunDup || dunDup.avance === 0 || dunDup.nueva === false || dunDup.yaReclamada === true);

  const lab1 = H.recompensaReliquiaHistoria('laberinto', 'lab1', 'Laberinto Exterior', h, w);
  assert.strictEqual(h.hitosMundo.lab_lab1, true);
  assert.strictEqual(h.reputacion.pueblo, 3);
  assert.strictEqual(h.reputacion.vinculo, 3);
  assert.strictEqual(h.puntos, 1);
  assert.strictEqual(lab1.avance, 4);

  H.recompensaReliquiaHistoria('laberinto', 'lab1', 'Laberinto Exterior', h, w);
  assert.strictEqual(h.reputacion.pueblo, 3);
  assert.strictEqual(h.reputacion.vinculo, 3);
});

t('generarEventoCamino y resolverEventoCamino cubren viajero, emboscada y cofre_conclave', () => {
  const w = mundo();
  const pos = { x: 0, z: 0 };
  const dir = { x: 0, z: 1 };
  const tiposVistos = new Set();

  for (let i = 0; i < 30; i++) {
    const r = (i + 0.2) / 30;
    const h = { reputacion: { pueblo: 0, vinculo: 0, sombra: 0 }, hitosMundo: {} };
    const ev = H.generarEventoCamino(pos, dir, w, h, () => r);
    if (!ev) continue;
    tiposVistos.add(ev.tipo);
    const dist = Math.hypot(ev.x - pos.x, ev.z - pos.z);
    assert.ok(Math.abs(dist - 26) < 2.5, `Evento debe aparecer ~26m delante (${dist})`);

    let opcionId;
    if (ev.tipo === 'emboscada') {
      assert.ok(ev.oleada && ev.oleada.cantidad === 2, 'Emboscada debe definir oleada de 2 enemigos');
      opcionId = 'victoria';
    } else {
      assert.ok(Array.isArray(ev.opciones) && ev.opciones.length === 2, `Evento ${ev.tipo} debe ofrecer 2 opciones`);
      opcionId = ev.opciones[0].id;
    }

    const res = H.resolverEventoCamino(h, ev, opcionId);
    assert.strictEqual(res.yaResuelto, false);
    assert.strictEqual(h.hitosMundo[ev.id], true);
    assert.ok((h.reputacion.pueblo || 0) + (h.reputacion.vinculo || 0) + (h.reputacion.sombra || 0) > 0);

    const rep = H.resolverEventoCamino(h, ev, opcionId);
    assert.strictEqual(rep.yaResuelto, true);
  }

  assert.ok(tiposVistos.has('viajero'), 'Debe poder generarse evento viajero');
  assert.ok(tiposVistos.has('emboscada'), 'Debe poder generarse evento emboscada');
  assert.ok(tiposVistos.has('cofre_conclave'), 'Debe poder generarse evento cofre_conclave');
});

t('visor-mundo.html integra los sistemas interactivos H2', () => {
  const fs = require('fs');
  const path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');
  for (const token of [
    'historia-prompt',
    'reconstruirPistasCapitulo',
    'iniciarRitualSecreto',
    'engendrarEnemigosEvento',
    'recompensaReliquiaHistoria',
    'generarEventoCamino',
    'inv.gold = (inv.gold || 0) + 750',
  ]) {
    assert.ok(html.includes(token), `Falta en visor-mundo.html: ${token}`);
  }
});

t('codicePersonajes evoluciona sospechas y alianzas de Elara, Ysolde, Oren y Kaelen por Acto y decisión', () => {
  const w = mundo();
  const hActo1 = { principal: { paso: 1 }, reputacion: { pueblo: 0, sombra: 0, vinculo: 0 }, decisiones: {}, hitosMundo: {} };
  const f1 = H.codicePersonajes(hActo1, w);
  assert.strictEqual(f1.length, 10);
  const elara1 = f1.find(x => x.id === 'guru-1');
  const oren1 = f1.find(x => x.id === 'guru-2');
  const ysolde1 = f1.find(x => x.id === 'guru-3');
  const kaelen1 = f1.find(x => x.id === 'serv-comandante');
  assert.strictEqual(elara1.estadoId, 'sospechoso');
  assert.strictEqual(oren1.estadoId, 'sospechoso');
  assert.strictEqual(ysolde1.estadoId, 'sospechoso');
  assert.strictEqual(kaelen1.estadoId, 'neutral');

  const hActo3 = {
    principal: { paso: 11 },
    reputacion: { pueblo: 6, sombra: 0, vinculo: 3 },
    decisiones: { d_c2_lista: 'guardia' },
    hitosMundo: { dun_m1: true },
  };
  const f3 = H.codicePersonajes(hActo3, w);
  assert.strictEqual(f3.find(x => x.id === 'guru-1').estadoId, 'culpable');
  assert.strictEqual(f3.find(x => x.id === 'guru-2').estadoId, 'aliado');
  assert.strictEqual(f3.find(x => x.id === 'guru-3').estadoId, 'disidente');
  assert.strictEqual(f3.find(x => x.id === 'serv-comandante').estadoId, 'aliado');

  const hFin = { principal: { paso: 16 }, finalId: 'luz', reputacion: { pueblo: 10, sombra: 0, vinculo: 5 }, decisiones: {}, hitosMundo: {} };
  const fFin = H.codicePersonajes(hFin, w);
  assert.strictEqual(fFin.find(x => x.id === 'guru-1').estadoId, 'juzgado');
});

t('codiceInvestigacion y codiceDecisiones resumen pistas, rituales, reliquias, eventos y encrucijadas', () => {
  const baseW = mundo();
  const w = {
    ...baseW,
    dungeons: [{ id: 'dun1', name: 'Cripta Norte' }],
    zones: baseW.zones.concat([{ id: 'zlab', name: 'Laberinto del Eco', type: 'caza', x: 50, y: 50, radius: 40, monsters: [{ name: 'Lobo', level: 2 }], relieve: { activo: true } }]),
  };
  const h = {
    principal: { paso: 9 },
    reputacion: { pueblo: 5, sombra: 1, vinculo: 3 },
    decisiones: { d_c2_lista: 'guardia', d_c6_fuente: 'liberar' },
    hitosMundo: {
      pista_c1_0: true,
      pista_c1_1: true,
      dun_dun1: true,
      lab_zlab: true,
      ev_viajero_12: true,
    },
  };

  const inv = H.codiceInvestigacion(h, w);
  assert.ok(inv.pistas.length >= 6);
  assert.strictEqual(inv.resumen.pistasHalladas, 2);
  assert.ok(inv.resumen.ritualesHechos >= 2);
  assert.strictEqual(inv.resumen.mazmorras, 1);
  assert.strictEqual(inv.resumen.mazmorrasTotal, 1);
  assert.strictEqual(inv.resumen.laberintos, 1);
  assert.strictEqual(inv.resumen.laberintosTotal, 1);
  assert.strictEqual(inv.resumen.eventosResueltos, 1);

  const dec = H.codiceDecisiones(h, w);
  assert.strictEqual(dec.total, 7);
  assert.strictEqual(dec.decididas, 2);
  assert.strictEqual(dec.senda, 'guardia');
  assert.strictEqual(dec.lista.find(x => x.capNum === 2).estado, 'decidida');
  assert.strictEqual(dec.lista.find(x => x.capNum === 4).estado, 'pendiente');
  assert.strictEqual(dec.lista.find(x => x.capNum === 16).estado, 'bloqueada');
});

t('subtituloVivo ampliado genera réplicas de 2 líneas para eventos H3 y H4', () => {
  const w = mundo();
  const h = { principal: { paso: 7 }, reputacion: { pueblo: 2, sombra: 0, vinculo: 2 } };
  [
    { tipo: 'zona_peligrosa', nombre: 'Cumbres Negras' },
    { tipo: 'cabana', fase: 'rastro', nombre: 'Cabaña Costera' },
    { tipo: 'cabana', fase: 'lider', nombre: 'Cabaña Costera' },
    { tipo: 'mision_comp', fase: 'talento', talento: 'Juramento del Alba' },
    { tipo: 'charla_camino', arquetipo: 'lyra' },
    { tipo: 'charla_camino', arquetipo: 'elian' },
    { tipo: 'charla_camino', arquetipo: 'brenda' },
    { tipo: 'charla_camino', arquetipo: 'rowan' },
  ].forEach(ev => {
    const sub = H.subtituloVivo(ev, h, w, 'Compañero');
    assert.ok(sub && sub.hablante === 'Compañero' && sub.texto.length > 5);
    assert.ok(sub.replica && sub.replica.hablante === 'Héroe' && sub.replica.texto.length > 5);
  });
});

t('visor-mundo.html integra UI y lógica de Bloques H3 y H4', () => {
  const fs = require('fs');
  const path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');
  for (const token of [
    'cro-tabs',
    'comp-mision-personal',
    'codicePersonajes',
    'codiceInvestigacion',
    'codiceDecisiones',
    'elegirModalidadCabana',
    'registrarProgresoCabana',
    'invocarLiderCabana3D',
    'reconstruirRastrosCabanas3D',
    'notificarProgresoCompanero',
    'crear-clase-info',
    'atajosDeClase',
    'data-cambiar-clase',
    'data-respec-heroe',
    'asegurarArmaDeClase',
    'claseArmadura',
    'escudoArcano',
    'orbe_arcano',
    'data-elegir-subclase',
    'comp-sinergia',
    'textoForjaClase',
    'sinergiaConProfesion',
    '_manaShieldMesh',
    '_poisonRing',
    'trampa_espinas',
    'paso_sombrio',
    'hoja_veneno',
    'flecha_perforante',
  ]) {
    assert.ok(html.includes(token), `Falta en visor-mundo.html: ${token}`);
  }
});

t('P4 historia: textoForjaClase, materialDeCapitulo y fraseContextualNpc se adaptan a la profesión', () => {
  const fMago = H.textoForjaClase('torso', 'mago');
  const fGuer = H.textoForjaClase('torso', 'guerrero');
  assert.strictEqual(fMago.nombrePieza, 'Túnica Arcana');
  assert.strictEqual(fGuer.nombrePieza, 'Peto de Placas');
  assert.ok(fMago.fraseBrann !== fGuer.fraseBrann);

  const capTorso = H.CAPITULOS[3];
  assert.strictEqual(H.materialDeCapitulo(capTorso), 'planchas de caparazón blindado');
  assert.ok(H.materialDeCapitulo(capTorso, 'mago').includes('éter'));

  const w = mundo();
  const est = { paso: 2, reputacion: { pueblo: 0, sombra: 0, vinculo: 0 }, decisiones: {} };
  const npcSin = H.fraseContextualNpc('serv-herrero-t1', est, w, null);
  const npcMago = H.fraseContextualNpc('serv-herrero-t1', est, w, null, 'mago');
  assert.ok(npcMago.frase.length > npcSin.frase.length && npcMago.frase.includes('Mago'));
});

console.log(`\n${n} pruebas de la historia superadas.`);

