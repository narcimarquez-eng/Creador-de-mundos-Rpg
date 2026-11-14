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
      encargo: 'El Herrero Brann tose sangre sobre el yunque tras la emboscada: «¡Nos han tendido una trampa! Esas aberraciones con injertos de metal venían a silenciar mi forja. Rowan, sácale de aquí antes de que la guardia cierre la empalizada. Id a {lugar} y abated a {n} de esas criaturas alteradas; traedme sus correas de cuero y placas de hierro para forjar tu primer cinturón reforzado antes de que nos cacen».',
      texto: 'Rowan y tú regresáis cubiertos de ceniza y fango. Brann remacha la hebilla de bronce con manos temblorosas y te entrega el cinturón: «Entre los restos de esas bestias había un sello de bronce de los Sabios de la plaza... La plaga no es salvaje: alguien la está fabricando en secreto desde dentro de nuestras propias murallas». Has forjado tu primer cinturón básico.',
      mision: { tipo: 'matar', cantidad: 8, nivel: 1 },
      recompensa: { puntos: 1, forjarPieza: 'belt', desbloquea: 'acompanante' }
    },
    {
      id: 'c2', nivel: 1, sabio: 'Maestro Oren', npc: 'guru-2', titulo: 'El camino agreste y las botas de marcha',
      encargo: 'El Maestro Oren finge serenidad en la plaza, pero sus ojos esquivan tu mirada. Rowan te susurra con urgencia: «El guarda forestal de {lugar} tenía un duplicado de la lista de fugitivos antes de ser silenciado. Sígueme por las calzadas de piedra; eliminemos a {n} criaturas alteradas en {lugar} para cruzar el sendero y conseguir tendones con los que forjar unas botas de marcha resistentes».',
      texto: 'Con las indicaciones de Rowan y el cuero reforzado recogido en {lugar}, Brann remata las suelas de tus botas de marcha. Entre los despojos halláis una orden de ejecución oficial: tu nombre y el de Rowan figuran como objetivos prioritarios. Tus pasos ahora son firmes, ágiles y seguros en cualquier terreno.',
      mision: { tipo: 'matar', cantidad: 12, nivel: 1 },
      recompensa: { puntos: 2, forjarPieza: 'boots' }
    },
    {
      id: 'c3', nivel: 2, sabio: 'Hermana Ysolde', npc: 'guru-3', titulo: 'Garras de bestia y el aldeano leal',
      encargo: 'La Hermana Ysolde murmura cánticos en trance mientras una sustancia gris gotea de sus mangas. Rowan desenvaina con determinación: «Ysolde está enviando patrullas a morir a {lugar}. Vamos a adelantarnos: abatiremos a {n} aberraciones blindadas para arrancarles sus garras corrompidas y forjar guantes de combate antes de que la guardia nos acorrale».',
      texto: 'Combatís espalda con espalda en un torbellino de acero y esquivas. Con las garras y escamas recogidas, Brann forja tus guantes y brazales de combate. Rowan contempla sus manos temblorosas, jurando proteger tu espalda contra la conspiración que pudre el reino. Desbloqueado el apoyo completo del Acompañante.',
      mision: { tipo: 'matar', cantidad: 15, nivel: 2 },
      recompensa: { puntos: 2, forjarPieza: 'gloves', desbloquea: 'acompanante' }
    },
    {
      id: 'c4', nivel: 4, sabio: 'Viejo Tamsin', npc: 'guru-4', titulo: 'Planchas de caparazón y el peto de acero',
      encargo: 'El Viejo Tamsin te intercepta en la penumbra de la taberna: «La fundición clandestina de {lugar} devora a los aldeanos secuestrados. Destrozad a {n} autómatas de caparazón blindado allí y traedme sus resistentes placas pectorales; os enseñaré a partir la tierra antes de que sea tarde». Rowan y tú marcháis al asalto.',
      texto: 'Con las duras planchas de caparazón recogidas tras el combate, Brann martilla un sólido peto sobre el yunque. Tamsin sonríe con amargura y os enseña a canalizar la fuerza al golpear el suelo: ¡has desbloqueado el impacto sísmico (Q) y equipado tu nuevo peto! Pero una proyección espectral de Elara os advierte: cada golpe alimenta el despertar subterráneo.',
      mision: { tipo: 'matar', cantidad: 18, nivel: 4 },
      recompensa: { puntos: 2, forjarPieza: 'torso', desbloquea: 'sismo' }
    },
    {
      id: 'c5', nivel: 4, sabio: 'Erudita Mirel', npc: 'guru-5', titulo: 'Astas de hueso y el yelmo protector',
      encargo: 'La Erudita Mirel os observa con frialdad analítica: «Los susurros del Óxido penetran por los oídos descubiertos. Si queréis conservar la cordura, cazad a {n} criaturas corrompidas en {lugar} y recolectad sus astas óseas para blindar vuestra cabeza contra la telepatía de los Siete».',
      texto: 'Brann encaja los refuerzos óseos en una corona de hierro acolchada. Al colocarte el yelmo sientes cómo el zumbido mental de los Sabios se amortigua al instante. Tu cabeza queda protegida de los golpes y la influencia oculta.',
      mision: { tipo: 'matar', cantidad: 20, nivel: 4 },
      recompensa: { puntos: 2, forjarPieza: 'helmet' }
    },
    {
      id: 'c6', nivel: 5, sabio: 'Sabia Elara', npc: 'guru-1', titulo: 'La fuente arcana y las hombreras benditas',
      encargo: 'Elara finge colaborar entregándoos un vial vacío: «Para que vuestras hombreras soporten las cuchillas de los verdugos debéis templar las placas en la mística {lugar}». Rowan desconfía: «Es una trampa o el laboratorio donde extraen su elixir. Vayamos armados hasta los dientes».',
      texto: 'Al pie de la fuente arcana sumergís las hombreras forjadas en sus aguas luminiscentes. Las placas absorben el fulgor místico, dotándolas de una resistencia prodigiosa para proteger vuestros hombros. En el fondo del agua descubrís jaulas sumergidas con el emblema de la Corona.',
      mision: { tipo: 'secreto', secreto: 'fuente' },
      recompensa: { puntos: 3, forjarPieza: 'shoulders' }
    },
    {
      id: 'c7', nivel: 8, sabio: 'Maestro Oren', npc: 'guru-2', titulo: 'Mineral salvaje y la forja del arma',
      encargo: 'Oren os cita en una encrucijada solitaria: «Las tropas de los Sabios devoran vetas de mineral puro en los valles de {lugar}. Si queréis un filo capaz de cortar autómatas, abated a {n} de ellos y arrebatarles el hierro salvaje para forjar vuestra arma maestra».',
      texto: 'El mineral extraído brilla al rojo vivo bajo los martillazos de Brann en la fragua. De las chispas surge un arma formidable forjada a medida de tu clase y estilo, sellada con runas de insumisión. ¡Tu equipo de combate básico de nivel de entrada queda completamente ensamblado!',
      mision: { tipo: 'matar', cantidad: 22, nivel: 8 },
      recompensa: { puntos: 3, forjarPieza: 'weapon' }
    },
    {
      id: 'c8', nivel: 10, sabio: 'Hermana Ysolde', npc: 'guru-3', titulo: 'El sello de la nova',
      encargo: 'Ysolde pierde la compostura: el pozo rúnico exige sacrificios. «El sello de la destrucción solo despertará con la sangre de las aberraciones de {lugar}». Derrota a {n} criaturas allí junto a Rowan antes de que la orden enemiga se reorganice.',
      texto: 'La nova de energía pura no es magia divina: es la fuerza de los antiguos reyes que los Sabios intentaron suprimir. Rowan contempla maravillado la onda expansiva: ¡la explosión nova (E) ya es tuya! Por un segundo, los ojos de Rowan brillan con un halo ámbar idéntico al de las reliquias subterráneas.',
      mision: { tipo: 'matar', cantidad: 25, nivel: 10 },
      recompensa: { puntos: 3, desbloquea: 'nova' }
    },
    {
      id: 'c9', nivel: 10, sabio: 'Viejo Tamsin', npc: 'guru-4', titulo: 'La cabaña en la espesura',
      encargo: 'Tamsin confiesa la verdad sobre el Guarda ejecutado: «En su cabaña oculta en {lugar} guardaba las cartas que incriminan a los cinco Sabios. Debéis infiltraros antes de que los inquisidores quemen el bosque».',
      texto: 'Entre la espesura halláis la cabaña de troncos envejecidos. Oculto tras el hogar encontráis el diario del ermitaño: describe la ubicación del altar rúnico donde los Sabios canalizan la energía vital de las caravanas y los planos de un autómata titánico.',
      mision: { tipo: 'secreto', secreto: 'cabana' },
      recompensa: { puntos: 3 }
    },
    {
      id: 'c10', nivel: 11, sabio: 'Sabia Elara', npc: 'guru-1', titulo: 'Caza en la espesura',
      encargo: 'Los inquisidores han bloqueado el paso hacia las tierras altas con un regimiento de bestias acorazadas en {lugar}. Rowan blande su espada con furia: «¡Hay que abrirse paso o quedaremos atrapados en este valle! Abatamos a {n} de ellos».',
      texto: 'Rowan y tú coordináis cada estocada y contraataque: mientras tú atraes a las bestias mayores, el aldeano remata a los flanqueadores. El paso montañoso queda sembrado de metal quebrado y el camino hacia las cumbres queda despejado.',
      mision: { tipo: 'matar', cantidad: 25, nivel: 11 },
      recompensa: { puntos: 3 }
    },
    {
      id: 'c11', nivel: 12, sabio: 'Maestro Oren', npc: 'guru-2', titulo: 'El altar de las estrellas y el despertar del comercio',
      encargo: 'Oren os entrega una llave ceremonial: «Consagrad el altar rúnico en {lugar}. Al hacerlo, quebraréis el monopolio de los Sabios sobre el comercio y permitiréis que los mercaderes y Brann abran sus forjas superiores a partir de nivel 12».',
      texto: 'Los monolitos del altar rúnico se alzan hacia el cielo nocturno. Al posar la mano sobre la losa central, una llamarada disipa la niebla de censura: a partir de nivel 12, el Herrero Brann y los mercaderes abren sus tiendas y fraguas para la compra y forja directa de equipo superior sin supervisión eclesial.',
      mision: { tipo: 'secreto', secreto: 'altar' },
      recompensa: { puntos: 4 }
    },
    {
      id: 'c12', nivel: 13, sabio: 'Hermana Ysolde', npc: 'guru-3', titulo: 'Resonancia ancestral',
      encargo: 'Para quebrar la cúpula que protege el bastión de los conspiradores en las cumbres, Ysolde pide neutralizar a los guardianes de élite en {lugar}. «Eliminad a {n} aberraciones de élite para desactivar sus pilares de resonancia».',
      texto: 'La resonancia de las runas envuelve vuestra cacería. Los guardianes caen uno tras otro, confirmando que la alianza entre héroe y aldeano ha superado cualquier manipulación de los Sabios. La barrera del santuario central colapsa con estruendo.',
      mision: { tipo: 'matar', cantidad: 30, nivel: 13 },
      recompensa: { puntos: 4 }
    },
    {
      id: 'c13', nivel: 14, sabio: 'Sabia Elara', npc: 'guru-1', titulo: 'El santuario de la luz',
      encargo: 'Elara os cita en el corazón del continente: «Si tenéis la osadía de desafiar el orden supremo, contemplad con vuestros propios ojos el {lugar}, la fuente originaria del poder de los siete reinos».',
      texto: 'Ante vosotros se alza el Santuario de Piedra y Luz: columnas ciclópeas y un cristal flotante que ilumina las nubes. Allí descubrís que el cristal es en realidad el corazón latiente del titán mecánico que los Sabios intentan despertar.',
      mision: { tipo: 'secreto', secreto: 'santuario' },
      recompensa: { puntos: 4 }
    },
    {
      id: 'c14', nivel: 15, sabio: 'Viejo Tamsin', npc: 'guru-4', titulo: 'Los jefes del bosque y el titán',
      encargo: 'Tamsin desenfunda su mandoble por primera vez: «El Señor de las Bestias mecánicas custodia la cámara de control en {lugar}. Nadie ha regresado con vida de sus dominios. Es la hora de destruirlo o ser asimilados».',
      texto: 'Un combate titánico estremece la tierra. Cuando el coloso está a punto de aplastarte, Rowan se interpone con su escudo desviando el martillo letal en el último milisegundo. Con una estocada certera atraviesas el núcleo rúnico del titán: la maquinaria de transmutación se apaga para siempre.',
      mision: { tipo: 'jefe', nivel: 15 },
      recompensa: { puntos: 5 }
    },
    {
      id: 'c15', nivel: 15, sabio: 'Hermana Ysolde', npc: 'guru-3', titulo: 'El juramento en la fuente',
      encargo: 'Rowan te pide acudir a la {lugar} más remota para purificar las armas teñidas de aceite oscuro y sellar un pacto que impida que nadie vuelva a alzar una forja de pesadilla en Aden.',
      texto: 'Bajo el fulgor de las aguas transparentes, el aceite negro se disuelve en vapor blanco. Rowan sonríe: el muchacho campesino con ropas gastadas es ahora un auténtico señor de armas y el guardián más leal que jamás haya cabalgado a tu lado.',
      mision: { tipo: 'secreto', secreto: 'fuente' },
      recompensa: { puntos: 4 }
    },
    {
      id: 'c16', nivel: 15, sabio: 'Erudita Mirel', npc: 'guru-5', titulo: 'El héroe de la plaza',
      encargo: 'Regresad a la plaza de la aldea inicial. La Erudita Mirel y los ciudadanos congregados os aguardan para juzgar a los Sabios derrotados y grabar vuestros nombres como los Libertadores de Aden.',
      texto: 'Al cruzar la arcada de piedra, el clamor de la multitud estalla entre banderas y vítores. Las campanas tañen libres de miedo, los puestos del mercado vuelven a lucir sus frutos y telas de colores, y las murallas del reino vuelven a pertenecer a su gente. Vuestras hazañas quedan inmortalizadas en la Crónica: ¡sois los legendarios Campeones de Aden!',
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

  // Cuatro Actos narrativos de la Crónica de Aden (alinean combate, farmeo y misiones)
  const ACTOS = [
    {
      numero: 1,
      id: 'acto-1',
      nombre: 'Acto I · Emboscada y Forja Clandestina',
      resumen: 'Huidos tras el ataque a Brann, tú y Rowan recogéis piezas en la caza para forjar equipo sin depender del monopolio de los Sabios.',
      desdePaso: 0,
      hastaPaso: 4
    },
    {
      numero: 2,
      id: 'acto-2',
      nombre: 'Acto II · Reliquias y Poder Antiguo',
      resumen: 'Templas tu armadura en la Fuente Arcana, despiertas la Nova de los reyes antiguos y hallas el diario que incrimina a los Sabios.',
      desdePaso: 5,
      hastaPaso: 9
    },
    {
      numero: 3,
      id: 'acto-3',
      nombre: 'Acto III · Ruptura del Monopolio y Asalto al Titán',
      resumen: 'Consagras el Altar Rúnico para reabrir las fraguas de nivel 12+, abres paso en las cumbres y destruyes al Señor de las Bestias mecánicas.',
      desdePaso: 10,
      hastaPaso: 13
    },
    {
      numero: 4,
      id: 'acto-4',
      nombre: 'Acto IV · Purificación y Liberación de Aden',
      resumen: 'Purificas el aceite oscuro en la Fuente Arcana y regresas a la plaza para el juicio final que libera el reino.',
      desdePaso: 14,
      hastaPaso: 15
    }
  ];

  // Materiales narrativos que explican por qué cada capítulo de caza alimenta la forja de Brann
  const MATERIALES_FORJA = {
    belt: 'correas de cuero y placas de hierro',
    boots: 'tendones y cuero de marcha',
    gloves: 'garras y escamas acorazadas',
    torso: 'planchas de caparazón blindado',
    helmet: 'astas óseas anti-telepatía',
    shoulders: 'hombreras templadas en agua arcana',
    weapon: 'hierro salvaje de veta pura'
  };

  function actoActual(p) {
    const paso = p && typeof p.paso === 'number' ? p.paso : 0;
    if (paso >= CAPITULOS.length) {
      return {
        numero: 5,
        id: 'epilogo',
        nombre: 'Epílogo · Campeones de Aden',
        resumen: 'Los Sabios conspiradores han caído y las fraguas, caminos y mazmorras de Aden quedan abiertos para los héroes libres.',
        terminado: true
      };
    }
    const encontrado = ACTOS.find(a => paso >= a.desdePaso && paso <= a.hastaPaso) || ACTOS[0];
    return Object.assign({ terminado: false }, encontrado);
  }

  // El monopolio eclesial de los Sabios se rompe al completar el Capítulo 11 (Altar Rúnico, paso >= 11)
  function monopolioRoto(p) {
    return !!(p && typeof p.paso === 'number' && p.paso >= 11);
  }

  function materialDeCapitulo(cap) {
    if (!cap || !cap.recompensa || !cap.recompensa.forjarPieza) return null;
    return MATERIALES_FORJA[cap.recompensa.forjarPieza] || null;
  }

  function normalizarNpcId(npcId) {
    const s = String(npcId || '');
    if (s.indexOf('serv-herrero') === 0) return 'serv-herrero';
    if (s.indexOf('serv-mercader') === 0) return 'serv-mercader';
    if (s.indexOf('serv-informante') === 0) return 'serv-informante';
    if (s.indexOf('serv-boticaria') === 0) return 'serv-boticaria';
    if (s.indexOf('serv-comandante') === 0) return 'serv-comandante';
    if (s.indexOf('serv-hereje') === 0) return 'serv-hereje';
    return s;
  }

  // Diálogos dinámicos por NPC y Acto narrativo: reflejan la evolución política y arcana de Aden
  const DIALOGOS_NPC = {
    'guru-1': {
      1: 'Los siete reinos cayeron por orgullo, joven. Cuida qué piezas llevas al yunque de Brann: las murallas tienen oídos.',
      2: 'Si buscas las aguas luminiscentes, ten cautela; la Corona no dejó aquellas jaulas sumergidas por caridad.',
      3: '¿Así que osáis cuestionar el orden supremo en el Santuario? El cristal late por una razón que aún no comprendéis.',
      4: 'El núcleo del titán se ha apagado… quizá subestimamos hasta dónde llegaría un aldeano con su espada.',
      fin: 'Las crónicas antiguas ya no bastan: ahora el nombre que resuena en Aden es el vuestro.'
    },
    'guru-2': {
      1: 'No te apartes de las calzadas de piedra. Las patrullas vigilan cada cruce desde que atacaron a Brann.',
      2: 'Las vetas de hierro salvaje fuera de las rutas reales son nuestra única oportunidad de armar a quien resista.',
      3: 'Con el Altar Rúnico consagrado, los sellos del cónclave saltaron por los aires. ¡Las forjas vuelven a ser libres!',
      4: 'Los caminos hacia el norte vuelven a abrirse para las caravanas sin escolta inquisitorial.',
      fin: 'Cada sendero de Aden lleva hoy el rastro de vuestra marcha, Campeones.'
    },
    'guru-3': {
      1: 'Las runas se leen de abajo arriba. Entrena tus técnicas conmigo en silencio; finjo servir al cónclave para desviar sus patrullas.',
      2: 'La Nova que buscas no pertenece a los Sabios sino a los antiguos reyes. Úsala para sobrevivir cuando el pozo rúnico arda.',
      3: 'Ya no hay vuelta atrás: he roto mis votos con el cónclave. Abate a los guardianes de élite y derrumba su cúpula.',
      4: 'Purifica ese aceite oscuro en la fuente más remota. Ninguna forja de pesadilla volverá a manchar este reino.',
      fin: 'Mis runas vuelven a servir a quienes protegen la plaza, no a quienes la encadenan.'
    },
    'guru-4': {
      1: 'Conozco ese brillo en tu hoja. Aprende a partir la tierra en la penumbra; los autómatas no sangran, se quiebran.',
      2: 'El diario del guarda sigue oculto en la espesura. Si lo quemaran los inquisidores, perderíamos la única prueba escrita.',
      3: 'He afilado mi mandoble después de veinte años. Cuando entres en la cámara del Señor de las Bestias, iré contigo.',
      4: 'El coloso yace frío bajo la montaña. Por fin puedo colgar el acero en paz.',
      fin: 'Las bestias que quedan en el campo son solo ecos salvajes; ya nadie las fabrica en la sombra.'
    },
    'guru-5': {
      1: 'Observa el estado de tu cota y protege tu cabeza con refuerzos óseos: los susurros del Óxido buscan mentes descubiertas.',
      2: 'Cada pieza que recuperas del campo confirma que alguien funde armaduras militares para criaturas salvajes.',
      3: 'Tengo actas, sellos y testimonios de cada aldea. Cuando caiga el titán, el juicio en la plaza será implacable.',
      4: 'La multitud ya se congrega bajo la arcada. Solo falta cerrar el juicio de Aden.',
      fin: 'Vuestra gesta quedó grabada en los anales de la plaza para todas las generaciones.'
    },
    'serv-herrero': {
      1: 'Aún tengo ceniza y sangre en el yunque. Tráeme pieles, tendones y caparazones de la caza: forjaré en secreto hasta que rompamos su yugo.',
      2: 'El hierro salvaje de las vetas libres corta mejor que el acero de la guardia. Sigue trayendo planos si encuentras hojas en nivel 8+.',
      3: '¡Por fin reabrimos los fuelles superiores! Con el monopolio roto y tu nivel, mi fragua vuelve a trabajar acero completo.',
      4: 'El aceite negro desapareció de las aguas. Hoy cada hoja que sale de este yunque es limpia y digna de Aden.',
      fin: 'Para el Campeón de Aden siempre habrá fuego encendido y acero perfecto en mi forja.'
    },
    'serv-mercader': {
      1: 'Los inspectores del cónclave revisan cada carreta: tengo prohibido vender equipo superior hasta que ganes renombre (nivel 12) y caiga su sello.',
      2: 'Las rutas siguen peligrosas, pero te compraré cualquier pieza saqueada a las aberraciones. Guárdate las pociones.',
      3: '¡Las tasas abusivas han caído con el Altar Rúnico! Mi catálogo completo se abre para viajeros curtidos.',
      4: 'Las caravanas vuelven a cruzar las calzadas sin pagar mordidas a los inquisidores.',
      fin: '¡El mercado de Aden florece como antaño! Todo mi género está a disposición del Libertador.'
    },
    'serv-comandante': {
      1: 'Si tienes pruebas reales contra los Sabios, dámelas. Hasta entonces, mantén tu acero lejos de mis conscriptos.',
      2: 'Esas órdenes de ejecución y diarios confirman mis sospechas. Mis patrullas empezarán a mirar hacia otro lado cuando pases.',
      3: 'La guarnición ya conoce la traición del cónclave. Mis hombres cubrirán la retaguardia mientras asaltas las cumbres.',
      4: 'Las murallas vuelven a responder ante la ley del pueblo, no ante el Óxido.',
      fin: 'La Guardia de Aden rinde honores al Campeón que salvó la plaza.'
    },
    'serv-informante': {
      1: 'Los Sabios pagan caro por cabezas como la tuya y la de Rowan. Por unas monedas te diré qué élites patrullan cerca.',
      2: 'Dicen que hay jaulas con el emblema de la Corona bajo el agua… alguien está haciendo desaparecer caravanas enteras.',
      3: 'El monopolio tiembla y los contrabandistas brindan por ti. Aprovecha mis mapas para localizar los últimos altares.',
      4: 'Con el titán muerto, hasta mis espías duermen tranquilos… aunque las mazmorras antiguas siguen llenas de oro.',
      fin: 'Eres leyenda viva, aunque si aún buscas presas en las criptas, siempre tengo un chivatazo.'
    },
    'serv-boticaria': {
      1: 'Mis brebajes huelen a hollín y sangre, pero te mantendrán en pie mientras Brann remienda tu cuero.',
      2: 'Esa sustancia gris que gotea en los templos no es bendita: es savia alquímica corrupta. Toma fuego líquido si vas a enfrentarla.',
      3: 'Contra autómatas gigantes no valen las hierbas dulces de los monjes. Bebe furia y rompe su coraza.',
      4: 'Incluso yo respeto haber purificado la fuente sin destruir el valle.',
      fin: 'Las mazmorras ancestrales no perdonan errores; vuelve por mis elixires cuando bajes a las criptas.'
    },
    'serv-hereje': {
      1: 'Brann solo remienda harapos de fugitivo. Cuando quieras que tu hoja devore maná de los verdugos, búscame en la sombra.',
      2: 'Los Sabios llaman herejía a mis runas mientras ellos funden aldeanos en acero. Hipócritas.',
      3: 'Has quebrado su altar y vas a por su titán. Deja que grabe furia oscura en tu arma para atravesar su núcleo.',
      4: 'Incluso en un reino libre hace falta alguien que forje lo que nadie se atreve a nombrar.',
      fin: 'Aden respira en paz, pero bajo tierra esperan los señores de las criptas. Mi yunque sigue ardiendo.'
    }
  };

  function fraseContextualNpc(npcId, p, world) {
    const baseId = normalizarNpcId(npcId);
    const acto = actoActual(p);
    const claveActo = acto.terminado ? 'fin' : acto.numero;
    const cap = capituloActual(p);
    const tabla = DIALOGOS_NPC[baseId] || null;
    const fraseBase = tabla ? (tabla[claveActo] || tabla[1]) : null;
    const esProtagonistaCap = !!(cap && cap.npc === baseId);

    if (esProtagonistaCap && cap && world) {
      const obj = resolverObjetivo(cap, world);
      return {
        npcId: baseId,
        acto: acto.numero,
        actoNombre: acto.nombre,
        esProtagonista: true,
        frase: fraseBase ? `${fraseBase} (${cap.titulo}: ${obj.texto})` : obj.encargo
      };
    }

    return {
      npcId: baseId,
      acto: acto.numero,
      actoNombre: acto.nombre,
      esProtagonista: false,
      frase: fraseBase
    };
  }

  const api = {
    CAPITULOS,
    ACTOS,
    MATERIALES_FORJA,
    DIALOGOS_NPC,
    nuevaPrincipal,
    terminada,
    capituloActual,
    contados,
    actoActual,
    monopolioRoto,
    materialDeCapitulo,
    fraseContextualNpc,
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
