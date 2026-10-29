/*
 * historia.js — Misión principal: la crónica del pueblo inicial contada capítulo a capítulo.
 * Cada capítulo lo encarga un sabio de la plaza. Solo hay uno activo a la vez; su progreso empieza en 0
 * al activarse, y al cumplirlo se cuenta su parte de la historia y empieza el siguiente.
 * El objetivo (zona, pueblo o NPC) se elige con los datos del mundo y queda guardado en la partida.
 * Sin gráficos. Expone window.HistoriaLib (o module.exports en Node para las pruebas).
 */
(function (root) {
  "use strict";

  // {lugar} es el nombre del objetivo (zona, pueblo o NPC) y {n} la cantidad.
  // nivel: nivel recomendado. mision.nivel: nivel de la zona que se busca para luchar.
  const CAPITULOS = [
    {
      id: 'c1', nivel: 1, sabio: 'Sabia Elara', npc: 'guru-1', titulo: 'Los siete reinos',
      encargo: 'Has llegado a la plaza con una espada nueva y ninguna historia. La Sabia Elara te espera junto a los puestos del mercado: dice que quien llega aquí debe saber dónde pisa.',
      texto: 'Antes de Aden hubo siete reinos. Cuando cayeron, sus piedras quedaron en los caminos y en nuestras murallas. «Tú también vienes de lejos», te dice Elara. «Empieza por aprender el camino.»',
      mision: { tipo: 'hablar', npc: 'guru-1', nombre: 'Sabia Elara' },
      recompensa: { puntos: 1 }
    },
    {
      id: 'c2', nivel: 1, sabio: 'Maestro Oren', npc: 'guru-2', titulo: 'El camino de piedra',
      encargo: 'El Maestro Oren quiere saber si el camino de piedra sigue abierto. Síguelo hasta {lugar} y mira quién vive allí.',
      texto: 'El camino de piedra une los pueblos desde antes que existieran los mapas. Quien lo sigue no se pierde, aunque cambie el tiempo. En {lugar} te reciben con pan y preguntas: hace semanas que nadie llegaba por ese camino.',
      mision: { tipo: 'visitar', pueblo: 'vecino' },
      recompensa: { puntos: 2 }
    },
    {
      id: 'c3', nivel: 2, sabio: 'Hermana Ysolde', npc: 'guru-3', titulo: 'Las runas de la muralla',
      encargo: 'La Hermana Ysolde ha visto runas grabadas en la piel de las bestias de {lugar}. Derrota a {n} y fíjate bien en las marcas.',
      texto: 'Las runas de la muralla se leen de abajo arriba. Las marcas de las bestias son las mismas que las de la piedra del pozo, la frase que nadie ha descifrado. Alguien las está copiando.',
      mision: { tipo: 'matar', cantidad: 4, nivel: 2 },
      recompensa: { puntos: 2 }
    },
    {
      id: 'c4', nivel: 4, sabio: 'Viejo Tamsin', npc: 'guru-4', titulo: 'Los que no temen al acero',
      encargo: 'El Viejo Tamsin no se fía de los forasteros. «Demuéstrame que tu acero sirve: {n} criaturas en {lugar}, y hablamos.»',
      texto: 'En los bosques de la zona viven criaturas que el acero vence sin esfuerzo. Son el primer examen de cualquier guerrero. Tamsin asiente, salta y golpea el suelo con las dos manos: la tierra tiembla bajo las bestias. El impacto sísmico (Q) ya es tuyo.',
      mision: { tipo: 'matar', cantidad: 8, nivel: 4 },
      recompensa: { puntos: 2, desbloquea: 'sismo' }
    },
    {
      id: 'c5', nivel: 4, sabio: 'Erudita Mirel', npc: 'guru-5', titulo: 'El valor de una cota',
      encargo: 'La Erudita Mirel ha visto cómo vuelves de la caza: con el equipo hecho jirones. Encarga una pieza nueva al Herrero Brann.',
      texto: 'Una cota malgastada rinde la mitad. Quien conoce el estado de su equipo sabe cuándo luchar y cuándo reparar. Brann te guiña un ojo: «Vuelve cuando quieras, que el hierro no se acaba».',
      mision: { tipo: 'forjar', npc: 'serv-herrero', nombre: 'Herrero Brann' },
      recompensa: { puntos: 2 }
    },
    {
      id: 'c6', nivel: 6, sabio: 'Sabia Elara', npc: 'guru-1', titulo: 'La arena del herrero',
      encargo: 'Elara ha oído que las bestias de {lugar} se tragan la arena de las dunas. Derrota a {n} y mira qué sueltan.',
      texto: 'Dicen que la arena de las dunas templa el acero de las armaduras superiores. Pero solo quien tenga la hoja de la pieza puede forjarla. Ahora sabes de dónde sale la arena: el herrero sabrá qué hacer con ella.',
      mision: { tipo: 'matar', cantidad: 10, nivel: 6 },
      recompensa: { puntos: 2 }
    },
    {
      id: 'c7', nivel: 8, sabio: 'Maestro Oren', npc: 'guru-2', titulo: 'Los caminos del norte',
      encargo: 'Oren señala el norte en su mapa: «{lugar} es el último pueblo antes de los caminos que no figuran en ningún mapa. Ve y míralo con tus ojos».',
      texto: 'Más allá de las zonas de caza hay caminos que no figuran en ningún mapa. Algunos conducen a los jefes que guardan las rutas. En {lugar} hablan de un guardián que corta el paso a las caravanas.',
      mision: { tipo: 'visitar', pueblo: 'norte' },
      recompensa: { puntos: 3 }
    },
    {
      id: 'c8', nivel: 10, sabio: 'Hermana Ysolde', npc: 'guru-3', titulo: 'El sello de la nova',
      encargo: 'Ysolde por fin ha descifrado la frase del pozo: «El sello despierta con la sangre de {lugar}». Derrota a {n} criaturas allí.',
      texto: 'La nova de la energía no es un truco de guerrero: es un sello que las runas antiguas dejaron a quien lo merezca. Sientes el sello en las manos: la explosión nova (E) ya es tuya.',
      mision: { tipo: 'matar', cantidad: 12, nivel: 10 },
      recompensa: { puntos: 3, desbloquea: 'nova' }
    },
    {
      id: 'c9', nivel: 13, sabio: 'Viejo Tamsin', npc: 'guru-4', titulo: 'Los jefes del bosque',
      encargo: 'Tamsin se pone serio: «El guardián de {lugar} corta los caminos. Nadie ha vuelto de allí. Tú podrías».',
      texto: 'Cada territorio de jefe tiene su guardián. Ninguno cae a la primera, y todos dejan algo que vale la pena recordar. Las caravanas vuelven a salir, y en la plaza ya cuentan tu nombre.',
      mision: { tipo: 'jefe', nivel: 13 },
      recompensa: { puntos: 4 }
    },
    {
      id: 'c10', nivel: 15, sabio: 'Erudita Mirel', npc: 'guru-5', titulo: 'El héroe de la plaza',
      encargo: 'Vuelve a la plaza. La Erudita Mirel quiere escribir tu nombre en la crónica, junto a los siete reinos.',
      texto: 'Cuando alguien sube hasta aquí, la plaza le recuerda. Los puestos siguen abiertos, las runas siguen en la muralla, y el camino de piedra lleva a casa. Fin de la crónica… por ahora.',
      mision: { tipo: 'hablar', npc: 'guru-5', nombre: 'Erudita Mirel' },
      recompensa: { puntos: 5 }
    }
  ];

  const TIPOS = ['matar', 'jefe', 'visitar', 'hablar', 'forjar'];
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function nuevaPrincipal() { return { paso: 0, progreso: 0, objetivo: null }; }
  function terminada(p) { return p.paso >= CAPITULOS.length; }
  function capituloActual(p) { return terminada(p) ? null : CAPITULOS[p.paso]; }
  // Capítulos ya contados (cumplidos), en orden
  function contados(p) { return CAPITULOS.slice(0, Math.min(p.paso, CAPITULOS.length)); }

  function rellenar(texto, o) {
    return String(texto).replace(/\{lugar\}/g, o ? o.nombre : '').replace(/\{n\}/g, o ? String(o.cantidad) : '');
  }

  function puebloInicial(world) {
    return world.towns.find(t => t.id === world.startTownId) || world.towns.find(t => t.isStart) || world.towns[0] || null;
  }

  // Zona para luchar: de caza o élite, con monstruos, del nivel más cercano al pedido; a igualdad, la más cercana al inicio
  function zonaParaLuchar(world, nivel, inicio) {
    const conMonstruos = z => z.monsters && z.monsters.some(m => !m.boss);
    let lista = world.zones.filter(z => (z.type === 'caza' || z.type === 'elite') && conMonstruos(z));
    if (!lista.length) lista = world.zones.filter(conMonstruos);
    const coste = z => Math.abs(z.levelMin - nivel) * 100000 + (inicio ? dist(z, inicio) : 0);
    return lista.slice().sort((a, b) => coste(a) - coste(b))[0] || null;
  }

  // Objetivo de un capítulo en este mundo
  function resolverObjetivo(cap, world) {
    const m = cap.mision;
    const inicio = puebloInicial(world);
    const hablarConSabio = motivo => ({ tipo: 'hablar', cantidad: 1, npc: cap.npc, nombre: cap.sabio,
      texto: 'Habla con ' + cap.sabio + ' en la plaza', encargo: motivo });
    let o;
    if (m.tipo === 'hablar' || m.tipo === 'forjar') {
      o = { tipo: m.tipo, cantidad: 1, npc: m.npc, nombre: m.nombre,
        texto: m.tipo === 'hablar' ? 'Habla con ' + m.nombre + ' en la plaza' : 'Encarga una pieza al ' + m.nombre + ' (🔨, en la plaza)' };
    } else if (m.tipo === 'visitar') {
      const otros = world.towns.filter(t => !inicio || t.id !== inicio.id);
      if (!otros.length) return hablarConSabio('No hay más pueblos en el mundo: vuelve con ' + cap.sabio + '.');
      const vecino = otros.slice().sort((a, b) => dist(a, inicio) - dist(b, inicio))[0];
      let t = vecino;
      if (m.pueblo === 'norte') {
        const lejanos = otros.length > 1 ? otros.filter(x => x.id !== vecino.id) : otros;
        t = lejanos.slice().sort((a, b) => a.y - b.y || dist(b, inicio) - dist(a, inicio))[0];
      }
      o = { tipo: 'visitar', cantidad: 1, pueblo: t.id, nombre: t.name, texto: 'Llega a ' + t.name + ' siguiendo el camino' };
    } else if (m.tipo === 'jefe') {
      const jefes = world.zones.filter(z => z.type === 'jefe' && z.monsters && z.monsters.some(x => x.boss));
      const coste = z => Math.abs(z.levelMin - m.nivel) * 100000 + (inicio ? dist(z, inicio) : 0);
      const z = jefes.slice().sort((a, b) => coste(a) - coste(b))[0];
      if (z) o = { tipo: 'jefe', cantidad: 1, zona: z.id, nombre: z.name, texto: 'Derrota al jefe de ' + z.name };
      else {
        // Sin territorio de jefe: se lucha en la zona más difícil
        const dura = world.zones.filter(x => x.monsters && x.monsters.length).sort((a, b) => b.levelMin - a.levelMin)[0];
        if (!dura) return hablarConSabio('No hay zonas de combate en el mundo: vuelve con ' + cap.sabio + '.');
        o = { tipo: 'matar', cantidad: 15, zona: dura.id, nombre: dura.name, texto: 'Derrota a 15 criaturas en ' + dura.name };
      }
    } else {
      const z = zonaParaLuchar(world, m.nivel, inicio);
      if (!z) return hablarConSabio('No hay zonas de combate en el mundo: vuelve con ' + cap.sabio + '.');
      o = { tipo: 'matar', cantidad: m.cantidad, zona: z.id, nombre: z.name, texto: 'Derrota a ' + m.cantidad + ' criaturas en ' + z.name };
    }
    o.encargo = rellenar(cap.encargo, o);
    return o;
  }

  // ¿Sigue existiendo el objetivo guardado? (el mundo puede haber cambiado en el editor)
  function objetivoValido(o, world) {
    if (!o || !TIPOS.includes(o.tipo)) return false;
    if (o.zona) return world.zones.some(z => z.id === o.zona);
    if (o.pueblo) return world.towns.some(t => t.id === o.pueblo);
    return !!o.npc;
  }

  // Deja listo el objetivo del capítulo activo. Si hay que elegirlo de nuevo, el progreso vuelve a 0.
  function asegurarObjetivo(p, world) {
    if (terminada(p)) { p.objetivo = null; p.progreso = 0; return null; }
    if (!objetivoValido(p.objetivo, world)) {
      p.objetivo = resolverObjetivo(CAPITULOS[p.paso], world);
      p.progreso = 0;
    }
    return p.objetivo;
  }

  // Un evento del juego. Solo cuenta para el capítulo activo y en su lugar.
  // ev: {tipo: 'matar'|'jefe'|'visitar'|'hablar'|'forjar', zona?, pueblo?, npc?}. Devuelve true si lo completa.
  function registrar(p, ev) {
    const o = p.objetivo;
    if (!o || terminada(p) || p.progreso >= o.cantidad) return false;
    let cuenta = false;
    if (o.tipo === 'matar') cuenta = (ev.tipo === 'matar' || ev.tipo === 'jefe') && ev.zona === o.zona;
    else if (o.tipo === 'jefe') cuenta = ev.tipo === 'jefe' && ev.zona === o.zona;
    else if (o.tipo === 'visitar') cuenta = ev.tipo === 'visitar' && ev.pueblo === o.pueblo;
    else if (o.tipo === 'hablar') cuenta = ev.tipo === 'hablar' && ev.npc === o.npc;
    else if (o.tipo === 'forjar') cuenta = ev.tipo === 'forjar';
    if (!cuenta) return false;
    p.progreso += 1;
    return p.progreso >= o.cantidad;
  }

  // Cierra el capítulo activo (ya cumplido) y pasa al siguiente, con su progreso a 0.
  // Devuelve el capítulo, su número, su texto contado y la recompensa.
  function completar(p) {
    const o = p.objetivo;
    if (!o || p.progreso < o.cantidad) throw new Error('El capítulo aún no está cumplido');
    const capitulo = CAPITULOS[p.paso];
    p.paso += 1;
    p.progreso = 0;
    p.objetivo = null;
    return { capitulo, numero: p.paso, texto: rellenar(capitulo.texto, o), recompensa: capitulo.recompensa };
  }

  // Texto de un capítulo ya contado, con su lugar (el mismo que se eligió: la elección es determinista)
  function textoContado(cap, world) {
    return rellenar(cap.texto, resolverObjetivo(cap, world));
  }

  const api = { CAPITULOS, nuevaPrincipal, terminada, capituloActual, contados, resolverObjetivo, objetivoValido,
    asegurarObjetivo, registrar, completar, rellenar, puebloInicial, textoContado };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HistoriaLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
