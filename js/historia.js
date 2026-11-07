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
      id: 'c1', nivel: 1, sabio: 'Sabia Elara', npc: 'guru-1', titulo: 'Pieles de caza y el primer cinturón',
      encargo: 'Rowan (tu leal compañero de camino) te acompaña desde la plaza y la Sabia Elara bendice vuestra alianza: «Las bestias han endurecido su piel y poseen una vitalidad colosal. Id juntos a {lugar} y abated a {n} criaturas. Tu compañero te guiará con indicaciones y te apoyará con sus habilidades para traer pieles resistentes y forjar tu primer cinturón».',
      texto: 'Rowan y tú regresáis triunfantes tras medir vuestras fuerzas contra las resistentes bestias. Brann remacha la hebilla de bronce del cinturón: «Gran trabajo en equipo; cubriéndoos mutuamente sobreviviréis a lo que viene». Has forjado tu primer cinturón básico.',
      mision: { tipo: 'matar', cantidad: 8, nivel: 1 },
      recompensa: { puntos: 1, forjarPieza: 'belt', desbloquea: 'acompanante' }
    },
    {
      id: 'c2', nivel: 1, sabio: 'Maestro Oren', npc: 'guru-2', titulo: 'El camino agreste y las botas de marcha',
      encargo: 'Rowan te señala los senderos lejanos hacia {lugar}: «El Maestro Oren necesita tendones y cuero grueso de {n} bestias endurecidas. Sígueme por las calzadas de piedra, te indicaré el camino seguro y te cubriré las espaldas con mis dopes marciales».',
      texto: 'Con las indicaciones de tu compañero y el cuero reforzado recogido en {lugar}, el herrero remata las suelas de tus nuevas botas de viaje. Tus pasos ahora son firmes y seguros en cualquier terreno.',
      mision: { tipo: 'matar', cantidad: 12, nivel: 1 },
      recompensa: { puntos: 2, forjarPieza: 'boots' }
    },
    {
      id: 'c3', nivel: 2, sabio: 'Hermana Ysolde', npc: 'guru-3', titulo: 'Garras de bestia y el aldeano leal',
      encargo: 'La Hermana Ysolde detecta perturbaciones en {lugar}. Rowan empuña su espada corta con determinación: «¡No temas a la vitalidad de esas criaturas! Con mis habilidades de apoyo y tus estocadas abatiremos a {n} monstruos para conseguir garras con las que reforzar brazales de combate».',
      texto: 'Rowan y tú combatís espalda contra espalda: sus estocadas coordinadas demuestran su valía. Con las garras y escamas recogidas, el herrero forja un par de guantes y brazales de protección. Rowan el aldeano reafirma su juramento como fiel acompañante.',
      mision: { tipo: 'matar', cantidad: 15, nivel: 2 },
      recompensa: { puntos: 2, forjarPieza: 'gloves', desbloquea: 'acompanante' }
    },
    {
      id: 'c4', nivel: 4, sabio: 'Viejo Tamsin', npc: 'guru-4', titulo: 'Planchas de caparazón y el peto de acero',
      encargo: 'El Viejo Tamsin exige temple: «Si queréis un peto que os salve el pellejo, abated a {n} criaturas en {lugar} y traed sus resistentes planchas quitinosas». Rowan y tú marcháis al combate.',
      texto: 'Con las duras planchas de caparazón recogidas tras el combate, Brann martilla un sólido peto sobre el yunque. Tamsin sonríe y os enseña a canalizar la fuerza al golpear el suelo: ¡has desbloqueado el impacto sísmico (Q) y equipado tu nuevo peto!',
      mision: { tipo: 'matar', cantidad: 18, nivel: 4 },
      recompensa: { puntos: 2, forjarPieza: 'torso', desbloquea: 'sismo' }
    },
    {
      id: 'c5', nivel: 4, sabio: 'Erudita Mirel', npc: 'guru-5', titulo: 'Astas de hueso y el yelmo protector',
      encargo: 'La Erudita Mirel advierte que una cabeza descubierta es presa fácil. Derrota a {n} criaturas en {lugar} para recolectar astas y fragmentos óseos para forjar un yelmo.',
      texto: 'Brann encaja los refuerzos óseos en una corona de hierro acolchada. Al colocarte el yelmo sientes la protección completa de tu cabeza ante los golpes enemigos. El equipo básico toma forma.',
      mision: { tipo: 'matar', cantidad: 20, nivel: 4 },
      recompensa: { puntos: 2, forjarPieza: 'helmet' }
    },
    {
      id: 'c6', nivel: 5, sabio: 'Sabia Elara', npc: 'guru-1', titulo: 'La fuente arcana y las hombreras benditas',
      encargo: 'Elara recuerda que para forjar unas hombreras que soporten el peso de los mandobles debéis templar las placas en la mística {lugar}. ¡Explorad con Rowan hasta descubrirla!',
      texto: 'Al pie de la fuente arcana sumergís las hombreras forjadas en sus aguas luminosas. Las placas absorben el fulgor místico, dotándolas de una resistencia prodigiosa para proteger vuestros hombros.',
      mision: { tipo: 'secreto', secreto: 'fuente' },
      recompensa: { puntos: 3, forjarPieza: 'shoulders' }
    },
    {
      id: 'c7', nivel: 8, sabio: 'Maestro Oren', npc: 'guru-2', titulo: 'Mineral salvaje y la forja del arma',
      encargo: 'Oren señala los valles salvajes de {lugar}: «Las criaturas de las profundidades devoran vetas de mineral puro. Derrotad a {n} de ellas para extraer el hierro salvaje y forjar un arma digna de vuestra clase». Rowan empuña su filo y asiente.',
      texto: 'El mineral extraído brilla al rojo vivo bajo los martillazos de Brann en la fragua. De las chispas surge un arma formidable forjada a medida de tu clase y estilo. ¡Tu equipo de combate básico de nivel de entrada queda completamente ensamblado!',
      mision: { tipo: 'matar', cantidad: 22, nivel: 8 },
      recompensa: { puntos: 3, forjarPieza: 'weapon' }
    },
    {
      id: 'c8', nivel: 10, sabio: 'Hermana Ysolde', npc: 'guru-3', titulo: 'El sello de la nova',
      encargo: 'Ysolde por fin ha descifrado la frase oculta del pozo: «El sello despierta con la sangre de {lugar}». Derrota a {n} criaturas allí junto a Rowan.',
      texto: 'La nova de energía pura no es un truco vulgar: es un sello sagrado que las runas antiguas dejaron a quien lo merezca. Rowan observa maravillado el estallido: la explosión nova (E) ya es tuya.',
      mision: { tipo: 'matar', cantidad: 25, nivel: 10 },
      recompensa: { puntos: 3, desbloquea: 'nova' }
    },
    {
      id: 'c9', nivel: 10, sabio: 'Viejo Tamsin', npc: 'guru-4', titulo: 'La cabaña en la espesura',
      encargo: 'Tamsin menciona un viejo ermitaño que vigilaba los bosques desde una cabaña escondida. Encuentra la {lugar} para recuperar sus mapas olvidados y advertencias sobre las bestias.',
      texto: 'Entre la espesura halláis la cabaña de troncos envejecidos. Entre viejos pergaminos descubrís bocetos de un altar astronómico y anotaciones sobre los grandes señores de la fauna salvaje.',
      mision: { tipo: 'secreto', secreto: 'cabana' },
      recompensa: { puntos: 3 }
    },
    {
      id: 'c10', nivel: 11, sabio: 'Sabia Elara', npc: 'guru-1', titulo: 'Caza en la espesura',
      encargo: 'Las notas del ermitaño alertan de un nido de bestias feroces en {lugar}. Limpia el sendero derrotando a {n} criaturas.',
      texto: 'Rowan y tú coordináis cada golpe: mientras tú atraes a las bestias, el aldeano remata con su espada de acero. El camino hacia las cumbres queda despejado.',
      mision: { tipo: 'matar', cantidad: 25, nivel: 11 },
      recompensa: { puntos: 3 }
    },
    {
      id: 'c11', nivel: 12, sabio: 'Maestro Oren', npc: 'guru-2', titulo: 'El altar de las estrellas y el despertar del comercio',
      encargo: 'Oren os encomienda seguir los mapas del ermitaño hasta el {lugar}. Al alcanzar el nivel 12 y consagrar el altar rúnico, las rutas de comercio y las forjas superiores del herrero quedarán desbloqueadas.',
      texto: 'Los monolitos del altar rúnico se alzan hacia el cielo. Al posar la mano sobre la losa central, una oleada de energía recorre vuestras armas. A partir de nivel 12, el Herrero Brann y los mercaderes abren sus tiendas y fraguas para la compra y forja directa de equipo superior.',
      mision: { tipo: 'secreto', secreto: 'altar' },
      recompensa: { puntos: 4 }
    },
    {
      id: 'c12', nivel: 13, sabio: 'Hermana Ysolde', npc: 'guru-3', titulo: 'Resonancia ancestral',
      encargo: 'Para abrir el paso hacia el gran santuario, Ysolde pide purificar las cumbres de {lugar} eliminando a {n} criaturas de élite.',
      texto: 'La resonancia de las runas envuelve vuestra cacería. Las criaturas caen una tras otra, confirmando que la fuerza de la alianza entre héroe y aldeano es inquebrantable.',
      mision: { tipo: 'matar', cantidad: 30, nivel: 13 },
      recompensa: { puntos: 4 }
    },
    {
      id: 'c13', nivel: 14, sabio: 'Sabia Elara', npc: 'guru-1', titulo: 'El santuario de la luz',
      encargo: 'Elara revela la cúspide de la crónica: «En el corazón del mundo se yergue el {lugar}, la mayor maravilla de los siete reinos. Descubrid su fulgor».',
      texto: 'Ante vosotros se alza el Santuario de Piedra y Luz: columnas ciclópeas y un cristal flotante que ilumina las nubes. El aire mismo vibra de poder milenario.',
      mision: { tipo: 'secreto', secreto: 'santuario' },
      recompensa: { puntos: 4 }
    },
    {
      id: 'c14', nivel: 15, sabio: 'Viejo Tamsin', npc: 'guru-4', titulo: 'Los jefes del bosque y el titán',
      encargo: 'Tamsin advierte con gravedad: «El señor de las bestias en {lugar} vigila los accesos finales. Nadie ha regresado de allí. Derrotadlo».',
      texto: 'Cada territorio de jefe tiene su guardián, y ninguno cae a la primera. Tras un combate colosal donde Rowan te cubre en el momento crítico, el titán cae derribado. Las caravanas vuelven a salir y los caminos quedan libres.',
      mision: { tipo: 'jefe', nivel: 15 },
      recompensa: { puntos: 5 }
    },
    {
      id: 'c15', nivel: 15, sabio: 'Hermana Ysolde', npc: 'guru-3', titulo: 'El juramento en la fuente',
      encargo: 'Rowan te pide visitar una {lugar} para purificar las armas tras la gran batalla y renovar vuestro juramento de protección sobre Aden.',
      texto: 'Bajo el fulgor de la fuente arcana, las aguas limpian el óxido y el cansancio. Rowan sonríe: ya no es un muchacho tímido de aldea, sino un auténtico héroe de leyenda.',
      mision: { tipo: 'secreto', secreto: 'fuente' },
      recompensa: { puntos: 4 }
    },
    {
      id: 'c16', nivel: 15, sabio: 'Erudita Mirel', npc: 'guru-5', titulo: 'El héroe de la plaza',
      encargo: 'Regresad a la plaza de la aldea inicial. La Erudita Mirel y los sabios os aguardan para grabar vuestros nombres en la crónica, junto a los siete reinos.',
      texto: 'Cuando alguien sube hasta aquí, la plaza le recuerda. Los puestos siguen abiertos, las runas siguen en la muralla, y el camino de piedra lleva a casa. Las campanas doblan al unísono y la multitud os aclama como los Campeones de Aden.',
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
  function resolverObjetivo(cap, world, desdePos) {
    const m = cap.mision;
    const inicio = desdePos || puebloInicial(world);
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
      const otros = (world.towns || []).filter(t => !inicio || !inicio.id || t.id !== inicio.id);
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

  function asegurarObjetivo(p, world, desdePos) {
    if (terminada(p)) { p.objetivo = null; p.progreso = 0; return null; }
    if (!objetivoValido(p.objetivo, world)) {
      p.objetivo = resolverObjetivo(CAPITULOS[p.paso], world, desdePos);
      p.progreso = 0;
    }
    return p.objetivo;
  }

  // Si aún no hay progreso en el capítulo, reorienta el objetivo al lugar válido más cercano a pos
  function reajustarObjetivoCercano(p, world, pos) {
    if (!p || terminada(p) || !pos || !world) return p ? p.objetivo : null;
    const cap = CAPITULOS[p.paso];
    if (!cap) return null;
    if (p.progreso === 0) {
      p.objetivo = resolverObjetivo(cap, world, pos);
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
    reajustarObjetivoCercano,
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
