/*
 * historia.js — Misión principal: la crónica épica contada capítulo a capítulo.
 *
 * La historia acompaña al héroe y a su compañero aldeano Rowan (equipado con ropas de cuero,
 * cinturón con hebilla y botas de viaje) a través de 16 capítulos que exploran los secretos
 * del mapa: fuentes arcanas luminiscentes, cabañas de ermitaños, altares rúnicos y santuarios.
 * Cada capítulo tiene un objetivo dinámico determinista según el mundo generado.
 *
 * Sin gráficos. Expone window.HistoriaLib (o module.exports en Node para las pruebas).
 */
(function (root) {
  "use strict";

  // {lugar} es el nombre del objetivo (zona, pueblo, NPC o lugar secreto) y {n} la cantidad.
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
      id: 'c3', nivel: 2, sabio: 'Hermana Ysolde', npc: 'guru-3', titulo: 'El joven de la aldea',
      encargo: 'Rowan, un joven aldeano con jubón de cuero y botas de viaje, quiere aprender a defender su tierra. La Hermana Ysolde te pide que lo lleves contigo a {lugar} y derrotes a {n} criaturas.',
      texto: 'Rowan empuña su espada corta con determinación: «¡No seré una carga! Te cubriré la espalda». Rowan el aldeano se une a tu aventura como fiel acompañante.',
      mision: { tipo: 'matar', cantidad: 4, nivel: 2 },
      recompensa: { puntos: 2, desbloquea: 'acompanante' }
    },
    {
      id: 'c4', nivel: 4, sabio: 'Viejo Tamsin', npc: 'guru-4', titulo: 'Los que no temen al acero',
      encargo: 'El Viejo Tamsin no se fía de los forasteros. «Demuéstrame que tu acero y el coraje de tu aldeano sirven: {n} criaturas en {lugar}, y hablamos.»',
      texto: 'En los bosques viven criaturas que el acero vence sin esfuerzo. Tamsin asiente, salta y golpea el suelo con las dos manos: la tierra tiembla bajo las bestias. El impacto sísmico (Q) ya es tuyo.',
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
      id: 'c6', nivel: 5, sabio: 'Sabia Elara', npc: 'guru-1', titulo: 'El susurro de la fuente',
      encargo: 'Rowan recuerda haber visto reflejos azulados en lo profundo de los riscos. Elara confirma que una legendaria {lugar} mana aguas mágicas. ¡Explorad hasta encontrarla!',
      texto: 'Encontráis la fuente arcana brotando entre sillares pulidos. Rowan se arrodilla fascinado: el agua cristalina revitaliza vuestras fuerzas y ahuyenta el cansancio de las batallas.',
      mision: { tipo: 'secreto', secreto: 'fuente' },
      recompensa: { puntos: 3 }
    },
    {
      id: 'c7', nivel: 8, sabio: 'Maestro Oren', npc: 'guru-2', titulo: 'Los caminos del norte',
      encargo: 'Oren señala el norte en su mapa: «{lugar} es el último pueblo antes de los caminos que no figuran en ningún mapa. Ve con Rowan y míralo con tus ojos».',
      texto: 'Más allá de las zonas de caza hay caminos que no figuran en ningún mapa. En {lugar} hablan de criaturas salvajes que acechan a los viajeros y de viejas cabañas solitarias en los valles.',
      mision: { tipo: 'visitar', pueblo: 'norte' },
      recompensa: { puntos: 3 }
    },
    {
      id: 'c8', nivel: 10, sabio: 'Hermana Ysolde', npc: 'guru-3', titulo: 'El sello de la nova',
      encargo: 'Ysolde por fin ha descifrado la profecía: «El sello de poder despierta con la sangre de {lugar}». Derrota a {n} criaturas allí junto a Rowan.',
      texto: 'La nova de energía pura brota de tus manos. Rowan observa maravillado el estallido: la explosión nova (E) ya es tuya para combatir a las hordas del territorio.',
      mision: { tipo: 'matar', cantidad: 12, nivel: 10 },
      recompensa: { puntos: 3, desbloquea: 'nova' }
    },
    {
      id: 'c9', nivel: 10, sabio: 'Viejo Tamsin', npc: 'guru-4', titulo: 'La cabaña en la espesura',
      encargo: 'Tamsin menciona un viejo ermitaño que vigilaba los bosques desde una cabaña escondida. Encuentra la {lugar} para recuperar sus mapas olvidados.',
      texto: 'Entre la espesura halláis la cabaña de troncos envejecidos. Entre viejos pergaminos descubrís bocetos de un altar astronómico y anotaciones sobre las bestias.',
      mision: { tipo: 'secreto', secreto: 'cabana' },
      recompensa: { puntos: 3 }
    },
    {
      id: 'c10', nivel: 11, sabio: 'Sabia Elara', npc: 'guru-1', titulo: 'Caza en la espesura',
      encargo: 'Las notas del ermitaño alertan de un nido de bestias feroces en {lugar}. Limpia el sendero derrotando a {n} criaturas.',
      texto: 'Rowan y tú coordináis cada golpe: mientras tú atraes a las bestias, el aldeano remata con su espada de acero. El camino hacia las cumbres queda despejado.',
      mision: { tipo: 'matar', cantidad: 10, nivel: 11 },
      recompensa: { puntos: 3 }
    },
    {
      id: 'c11', nivel: 12, sabio: 'Maestro Oren', npc: 'guru-2', titulo: 'El altar de las estrellas',
      encargo: 'Oren os encomienda seguir los mapas del ermitaño hasta el {lugar}. Dicen que allí resuena la memoria de los antiguos gobernantes.',
      texto: 'Los monolitos del altar rúnico se alzan hacia el cielo. Al posar la mano sobre la losa central, una oleada de energía recorre vuestras armas. Rowan siente que el destino os guía.',
      mision: { tipo: 'secreto', secreto: 'altar' },
      recompensa: { puntos: 4 }
    },
    {
      id: 'c12', nivel: 13, sabio: 'Hermana Ysolde', npc: 'guru-3', titulo: 'Resonancia ancestral',
      encargo: 'Para abrir el paso hacia el gran santuario, Ysolde pide purificar las cumbres de {lugar} eliminando a {n} criaturas de élite.',
      texto: 'La resonancia de las runas envuelve vuestra cacería. Las criaturas caen una tras otra, confirmando que la fuerza de la alianza entre héroe y aldeano es inquebrantable.',
      mision: { tipo: 'matar', cantidad: 12, nivel: 13 },
      recompensa: { puntos: 4 }
    },
    {
      id: 'c13', nivel: 14, sabio: 'Sabia Elara', npc: 'guru-1', titulo: 'El santuario de la luz',
      encargo: 'Elara revela la cúspide de la crónica: «En el corazón del mundo se yergue el {lugar}, la mayor maravilla de los siete reinos. Descubridlo».',
      texto: 'Ante vosotros se alza el Santuario de Piedra y Luz: columnas ciclópeas y un cristal flotante que ilumina las nubes. El aire mismo vibra de poder milenario.',
      mision: { tipo: 'secreto', secreto: 'santuario' },
      recompensa: { puntos: 4 }
    },
    {
      id: 'c14', nivel: 15, sabio: 'Viejo Tamsin', npc: 'guru-4', titulo: 'El titán de las sombras',
      encargo: 'Tamsin advierte con gravedad: «El señor de las bestias en {lugar} vigila los accesos finales. Nadie ha regresado de allí. Derrotadlo».',
      texto: 'Tras un combate colosal donde Rowan te cubre en el momento crítico, el titán cae derribado haciendo temblar el valle entero. Las tierras quedan por fin liberadas.',
      mision: { tipo: 'jefe', nivel: 15 },
      recompensa: { puntos: 5 }
    },
    {
      id: 'c15', nivel: 15, sabio: 'Hermana Ysolde', npc: 'guru-3', titulo: 'El juramento en la fuente',
      encargo: 'Rowan te pide visitar una {lugar} para purificar las armas tras la gran batalla y renovar vuestro juramento de protección sobre Aden.',
      texto: 'Bajo el fulgor de la fuente arcana, las aguas limpian el óxido y el cansancio. Rowan sonríe: ya no es un muchacho tímido de aldea, sino un auténtico explorador.',
      mision: { tipo: 'secreto', secreto: 'fuente' },
      recompensa: { puntos: 4 }
    },
    {
      id: 'c16', nivel: 15, sabio: 'Erudita Mirel', npc: 'guru-5', titulo: 'Los héroes de la crónica',
      encargo: 'Regresad a la plaza de la aldea inicial. La Erudita Mirel os aguarda para sellar la crónica y coronaros como los héroes eternos de Aden.',
      texto: 'Las campanas de la aldea doblan al unísono. La Sabia Elara, Oren, Ysolde, Tamsin y Mirel os aclaman ante toda la multitud. Vuestra crónica vivirá para siempre.',
      mision: { tipo: 'hablar', npc: 'guru-5', nombre: 'Erudita Mirel' },
      recompensa: { puntos: 6, titulo: 'Campeones de Aden' }
    }
  ];

  const TIPOS = ['matar', 'jefe', 'visitar', 'hablar', 'forjar', 'secreto'];
  const dist = (a, b) => Math.hypot(a.x - b.x, (a.y !== undefined ? a.y : a.z) - (b.y !== undefined ? b.y : b.z));

  function nuevaPrincipal() { return { paso: 0, progreso: 0, objetivo: null }; }
  function terminada(p) { return p.paso >= CAPITULOS.length; }
  function capituloActual(p) { return terminada(p) ? null : CAPITULOS[p.paso]; }
  function contados(p) { return CAPITULOS.slice(0, Math.min(p.paso, CAPITULOS.length)); }

  function rellenar(texto, o) {
    return String(texto)
      .replace(/\{lugar\}/g, o ? o.nombre : '')
      .replace(/\{n\}/g, o ? String(o.cantidad) : '');
  }

  function puebloInicial(world) {
    if (!world || !world.towns) return null;
    return world.towns.find(t => t.id === world.startTownId) ||
           world.towns.find(t => t.isStart) ||
           world.towns[0] || null;
  }

  // Zona para luchar: de caza o élite, con monstruos, del nivel más cercano al pedido
  function zonaParaLuchar(world, nivel, inicio) {
    if (!world || !world.zones) return null;
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
    const hablarConSabio = motivo => ({
      tipo: 'hablar', cantidad: 1, npc: cap.npc, nombre: cap.sabio,
      texto: 'Habla con ' + cap.sabio + ' en la plaza', encargo: motivo
    });

    let o;
    if (m.tipo === 'hablar' || m.tipo === 'forjar') {
      o = {
        tipo: m.tipo,
        cantidad: 1,
        npc: m.npc,
        nombre: m.nombre,
        texto: m.tipo === 'hablar'
          ? 'Habla con ' + m.nombre + ' en la plaza'
          : 'Encarga una pieza al ' + m.nombre + ' (🔨, en la plaza)'
      };
    } else if (m.tipo === 'visitar') {
      const otros = (world.towns || []).filter(t => !inicio || t.id !== inicio.id);
      if (!otros.length) return hablarConSabio('No hay más pueblos en el mundo: vuelve con ' + cap.sabio + '.');
      const vecino = otros.slice().sort((a, b) => dist(a, inicio) - dist(b, inicio))[0];
      let t = vecino;
      if (m.pueblo === 'norte') {
        const lejanos = otros.length > 1 ? otros.filter(x => x.id !== vecino.id) : otros;
        t = lejanos.slice().sort((a, b) => a.y - b.y || dist(b, inicio) - dist(a, inicio))[0];
      }
      o = { tipo: 'visitar', cantidad: 1, pueblo: t.id, nombre: t.name, texto: 'Llega a ' + t.name + ' siguiendo el camino' };
    } else if (m.tipo === 'jefe') {
      const jefes = (world.zones || []).filter(z => z.type === 'jefe' && z.monsters && z.monsters.some(x => x.boss));
      const coste = z => Math.abs(z.levelMin - m.nivel) * 100000 + (inicio ? dist(z, inicio) : 0);
      const z = jefes.slice().sort((a, b) => coste(a) - coste(b))[0];
      if (z) {
        o = { tipo: 'jefe', cantidad: 1, zona: z.id, nombre: z.name, texto: 'Derrota al jefe de ' + z.name };
      } else {
        const dura = (world.zones || []).filter(x => x.monsters && x.monsters.length).sort((a, b) => b.levelMin - a.levelMin)[0];
        if (!dura) return hablarConSabio('No hay zonas de combate en el mundo: vuelve con ' + cap.sabio + '.');
        o = { tipo: 'matar', cantidad: 15, zona: dura.id, nombre: dura.name, texto: 'Derrota a 15 criaturas en ' + dura.name };
      }
    } else if (m.tipo === 'secreto') {
      let secretos = world.secretPlaces || [];
      if (!secretos.length) {
        const generador = (typeof root !== 'undefined' && root.LugaresSecretosLib)
          ? root.LugaresSecretosLib.generarLugaresSecretos
          : (typeof require !== 'undefined' ? (() => { try { return require('./lugares-secretos.js').generarLugaresSecretos; } catch(e){ return null; } })() : null);
        if (generador) secretos = generador(world);
      }
      let candidatos = m.secreto ? secretos.filter(s => s.tipo === m.secreto) : secretos;
      if (!candidatos.length) candidatos = secretos;

      if (candidatos.length) {
        const s = candidatos.slice().sort((a, b) => (inicio ? dist(a, inicio) - dist(b, inicio) : 0))[0];
        o = {
          tipo: 'secreto',
          cantidad: 1,
          secretoId: s.id,
          secretoTipo: s.tipo,
          nombre: s.nombre,
          texto: 'Descubre ' + s.nombre + ' en el mapa'
        };
      } else {
        return hablarConSabio('Explora las tierras lejanas y habla con ' + cap.sabio + '.');
      }
    } else {
      const z = zonaParaLuchar(world, m.nivel, inicio);
      if (!z) return hablarConSabio('No hay zonas de combate en el mundo: vuelve con ' + cap.sabio + '.');
      o = { tipo: 'matar', cantidad: m.cantidad, zona: z.id, nombre: z.name, texto: 'Derrota a ' + m.cantidad + ' criaturas en ' + z.name };
    }

    o.encargo = rellenar(cap.encargo, o);
    return o;
  }

  function objetivoValido(o, world) {
    if (!o || !TIPOS.includes(o.tipo)) return false;
    if (o.zona) return (world.zones || []).some(z => z.id === o.zona);
    if (o.pueblo) return (world.towns || []).some(t => t.id === o.pueblo);
    if (o.tipo === 'secreto') return true;
    return !!o.npc;
  }

  function asegurarObjetivo(p, world) {
    if (terminada(p)) { p.objetivo = null; p.progreso = 0; return null; }
    if (!objetivoValido(p.objetivo, world)) {
      p.objetivo = resolverObjetivo(CAPITULOS[p.paso], world);
      p.progreso = 0;
    }
    return p.objetivo;
  }

  // Registra un evento de progreso
  function registrar(p, ev) {
    const o = p.objetivo;
    if (!o || terminada(p) || p.progreso >= o.cantidad) return false;
    let cuenta = false;

    if (o.tipo === 'matar') {
      cuenta = (ev.tipo === 'matar' || ev.tipo === 'jefe') && ev.zona === o.zona;
    } else if (o.tipo === 'jefe') {
      cuenta = ev.tipo === 'jefe' && ev.zona === o.zona;
    } else if (o.tipo === 'visitar') {
      cuenta = ev.tipo === 'visitar' && ev.pueblo === o.pueblo;
    } else if (o.tipo === 'hablar') {
      cuenta = ev.tipo === 'hablar' && ev.npc === o.npc;
    } else if (o.tipo === 'forjar') {
      cuenta = ev.tipo === 'forjar';
    } else if (o.tipo === 'secreto') {
      cuenta = ev.tipo === 'secreto' && (!o.secretoId || ev.id === o.secretoId || ev.secretoId === o.secretoId || ev.tipoSecreto === o.secretoTipo);
    }

    if (!cuenta) return false;
    p.progreso += 1;
    return p.progreso >= o.cantidad;
  }

  function completar(p) {
    const o = p.objetivo;
    if (!o || p.progreso < o.cantidad) throw new Error('El capítulo aún no está cumplido');
    const capitulo = CAPITULOS[p.paso];
    p.paso += 1;
    p.progreso = 0;
    p.objetivo = null;
    return { capitulo, numero: p.paso, texto: rellenar(capitulo.texto, o), recompensa: capitulo.recompensa };
  }

  function textoContado(cap, world) {
    return rellenar(cap.texto, resolverObjetivo(cap, world));
  }

  const api = {
    CAPITULOS,
    nuevaPrincipal,
    terminada,
    capituloActual,
    contados,
    resolverObjetivo,
    objetivoValido,
    asegurarObjetivo,
    registrar,
    completar,
    rellenar,
    puebloInicial,
    textoContado
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HistoriaLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
