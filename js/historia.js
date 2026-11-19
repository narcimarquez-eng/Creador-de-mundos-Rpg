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

  function capitulosDe(world) {
    return (world && world.historia && Array.isArray(world.historia.capitulos) && world.historia.capitulos.length)
      ? world.historia.capitulos
      : CAPITULOS;
  }
  function actosDe(world) {
    return (world && world.historia && Array.isArray(world.historia.actos) && world.historia.actos.length)
      ? world.historia.actos
      : ACTOS;
  }
  function hitosDe(world) {
    return (world && world.historia && world.historia.hitos && typeof world.historia.hitos === 'object')
      ? world.historia.hitos
      : HITOS_NARRATIVOS;
  }
  function dialogosDe(world) {
    return (world && world.historia && world.historia.dialogosNpc && typeof world.historia.dialogosNpc === 'object')
      ? world.historia.dialogosNpc
      : DIALOGOS_NPC;
  }

  function nuevaPrincipal() { return { paso: 0, progreso: 0, objetivo: null }; }
  function terminada(p, world) { return p.paso >= capitulosDe(world).length; }
  function capituloActual(p, world) {
    const caps = capitulosDe(world);
    return terminada(p, world) ? null : caps[p.paso];
  }
  function contados(p, world) {
    const caps = capitulosDe(world);
    return caps.slice(0, Math.min(p.paso, caps.length));
  }

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
      const explicito = m.pueblo ? (world.towns || []).find(t => t.id === m.pueblo) : null;
      if (explicito) {
        o = { tipo: 'visitar', cantidad: 1, pueblo: explicito.id, nombre: explicito.name, texto: 'Llega a ' + explicito.name + ' siguiendo el camino' };
      } else {
        const otros = (world.towns || []).filter(t => !inicio || !inicio.id || t.id !== inicio.id);
        if (!otros.length) return hablarConSabio('No hay más pueblos en el mundo: vuelve con ' + cap.sabio + '.');
        const vecino = otros.slice().sort((a, b) => dist(a, inicio) - dist(b, inicio))[0];
        let t = vecino;
        if (m.pueblo === 'norte') {
          const lejanos = otros.length > 1 ? otros.filter(x => x.id !== vecino.id) : otros;
          t = lejanos.slice().sort((a, b) => a.y - b.y || dist(b, inicio) - dist(a, inicio))[0];
        }
        o = { tipo: 'visitar', cantidad: 1, pueblo: t.id, nombre: t.name, texto: 'Llega a ' + t.name + ' siguiendo el camino' };
      }
    } else if (m.tipo === 'jefe') {
      const zExp = (!desdePos && m.zona) ? (world.zones || []).find(x => x.id === m.zona && x.monsters && x.monsters.length) : null;
      const jefes = (world.zones || []).filter(z => z.type === 'jefe' && z.monsters && z.monsters.some(x => x.boss));
      const coste = z => Math.abs(z.levelMin - m.nivel) * 100000 + (inicio ? dist(z, inicio) : 0);
      const z = zExp || jefes.slice().sort((a, b) => coste(a) - coste(b))[0];
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
      const sExp = m.secretoId ? secretos.find(s => s.id === m.secretoId) : null;
      let candidatos = m.secreto ? secretos.filter(s => s.tipo === m.secreto) : secretos;
      if (!candidatos.length) candidatos = secretos;

      if (sExp || candidatos.length) {
        const s = sExp || candidatos.slice().sort((a, b) => (inicio ? dist(a, inicio) - dist(b, inicio) : 0))[0];
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
      const zExp = (!desdePos && m.zona) ? (world.zones || []).find(x => x.id === m.zona && x.monsters && x.monsters.length) : null;
      const z = zExp || zonaParaLuchar(world, m.nivel, inicio);
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
    const caps = capitulosDe(world);
    if (terminada(p, world)) { p.objetivo = null; p.progreso = 0; return null; }
    if (!objetivoValido(p.objetivo, world)) {
      p.objetivo = resolverObjetivo(caps[p.paso], world, desdePos);
      p.progreso = 0;
    }
    return p.objetivo;
  }

  // Si aún no hay progreso en el capítulo, reorienta el objetivo al lugar válido más cercano a pos
  function reajustarObjetivoCercano(p, world, pos) {
    if (!p || terminada(p, world) || !pos || !world) return p ? p.objetivo : null;
    const cap = capitulosDe(world)[p.paso];
    if (!cap) return null;
    if (p.progreso === 0) {
      p.objetivo = resolverObjetivo(cap, world, pos);
    }
    return p.objetivo;
  }

  // Registra un evento de progreso
  function registrar(p, ev) {
    const o = p.objetivo;
    if (!o || !o.cantidad || p.progreso >= o.cantidad) return false;
    let cuenta = false;

    if (o.tipo === 'matar') {
      if (ev.tipo === 'avance_interactivo' && (!ev.zona || ev.zona === o.zona)) {
        const inc = Math.max(1, Math.floor(ev.cantidad || 1));
        p.progreso = Math.min(o.cantidad, p.progreso + inc);
        return p.progreso >= o.cantidad;
      }
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

  function completar(p, world) {
    const o = p.objetivo;
    if (!o || p.progreso < o.cantidad) throw new Error('El capítulo aún no está cumplido');
    const capitulo = capitulosDe(world)[p.paso];
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

  function actoActual(p, world) {
    const paso = p && typeof p.paso === 'number' ? p.paso : 0;
    const caps = capitulosDe(world);
    const actos = actosDe(world);
    if (paso >= caps.length) {
      if (world && world.historia && world.historia.epilogo) {
        return Object.assign({ numero: 5, id: 'epilogo', terminado: true }, world.historia.epilogo);
      }
      return {
        numero: 5,
        id: 'epilogo',
        nombre: 'Epílogo · Campeones de Aden',
        resumen: 'Los Sabios conspiradores han caído y las fraguas, caminos y mazmorras de Aden quedan abiertos para los héroes libres.',
        terminado: true
      };
    }
    const encontrado = actos.find(a => paso >= a.desdePaso && paso <= a.hastaPaso) || actos[0];
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

  // Diálogos dinámicos por NPC y Acto narrativo: reflejan la evolución política y arcana del mundo
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

  function matizReputacionNpc(baseId, heroeEst) {
    if (!heroeEst || typeof heroeEst !== 'object') return '';
    const rep = heroeEst.reputacion || {};
    const dec = heroeEst.decisiones || {};
    if (baseId === 'serv-comandante' && dec.d_c2_lista === 'guardia') {
      return ' Tu entrega de la orden de ejecución demostró lealtad a la plaza.';
    }
    if (baseId === 'serv-comandante' && (rep.sombra || 0) > (rep.pueblo || 0) + 3) {
      return ' Mis exploradores murmuran sobre tus tratos en las sombras; no cruces la línea.';
    }
    if (baseId === 'serv-informante' && dec.d_c2_lista === 'informante') {
      return ' Aquella copia sellada me abrió media docena de cofres; sigues teniendo preferencia aquí.';
    }
    if (baseId === 'serv-hereje' && (dec.d_c6_fuente === 'extraer' || dec.d_c11_altar === 'absorber')) {
      return ' Percibo el frío del poder antiguo en tu acero… ya no peleas como un simple guardia.';
    }
    if (baseId === 'guru-1' && (rep.sombra || 0) >= 6) {
      return ' Tu aura pesa como el eclipse… recuerda por qué alzamos esta lucha.';
    }
    if ((rep.vinculo || 0) >= 6 && (baseId === 'guru-4' || baseId === 'serv-herrero')) {
      return ' La hermandad entre tu compañero y tú ya es leyenda en las posadas.';
    }
    return '';
  }

  function fraseContextualNpc(npcId, p, world, heroeEst) {
    const baseId = normalizarNpcId(npcId);
    const acto = actoActual(p, world);
    const claveActo = acto.terminado ? 'fin' : acto.numero;
    const cap = capituloActual(p, world);
    const tabla = dialogosDe(world)[baseId] || DIALOGOS_NPC[baseId] || null;
    const fraseBase = tabla ? (tabla[claveActo] || tabla[1]) : null;
    const esProtagonistaCap = !!(cap && cap.npc === baseId);
    const matiz = matizReputacionNpc(baseId, heroeEst);

    if (esProtagonistaCap && cap && world) {
      const obj = resolverObjetivo(cap, world);
      return {
        npcId: baseId,
        acto: acto.numero,
        actoNombre: acto.nombre,
        esProtagonista: true,
        frase: fraseBase ? `${fraseBase}${matiz} (${cap.titulo}: ${obj.texto})` : obj.encargo
      };
    }

    return {
      npcId: baseId,
      acto: acto.numero,
      actoNombre: acto.nombre,
      esProtagonista: false,
      frase: fraseBase ? `${fraseBase}${matiz}` : null
    };
  }

  // Hitos narrativos de transición entre Actos y giros clave de la Crónica
  const HITOS_NARRATIVOS = {
    5: {
      capitulo: 5,
      icono: '🛡️',
      etiqueta: 'Fin del Acto I → Acto II · Reliquias y Poder Antiguo',
      titulo: 'Mente Blindada ante el Óxido',
      detalle: 'El yelmo óseo bloquea la telepatía del cónclave. Dejas atrás la mera supervivencia para infiltrarte en fuentes arcanas y refugios ocultos.'
    },
    8: {
      capitulo: 8,
      icono: '✨',
      etiqueta: 'Giro del Acto II · El Poder de los Reyes Antiguos',
      titulo: 'Despertar de la Nova y Halo Ámbar',
      detalle: 'La Hermana Ysolde rompe en secreto la disciplina del cónclave al liberar la Explosión Nova; por un instante, los ojos de tu compañero brillan con luz ancestral.'
    },
    10: {
      capitulo: 10,
      icono: '⚔️',
      etiqueta: 'Fin del Acto II → Acto III · Ruptura del Monopolio y Asalto al Titán',
      titulo: 'Cerco Roto hacia las Cumbres',
      detalle: 'Las defensas inquisitoriales caen y el paso norte queda abierto. La Hermana Ysolde rompe abiertamente sus votos y se pasa a la rebelión.'
    },
    11: {
      capitulo: 11,
      icono: '🔓',
      etiqueta: 'Hito Económico y Político · Altar Rúnico Consagrado',
      titulo: '¡Monopolio de los Sabios Quebrado!',
      detalle: 'El sello eclesial sobre el acero desaparece: el Herrero Brann y los mercaderes reabren su catálogo superior (Nv. 12+) y la guarnición de Kaelen apoya al pueblo.'
    },
    14: {
      capitulo: 14,
      icono: '⚙️',
      etiqueta: 'Fin del Acto III → Acto IV · Purificación y Liberación de Aden',
      titulo: 'Caída del Titán Mecánico',
      detalle: 'El Señor de las Bestias mecánicas yace inmóvil gracias al sacrificio de tu camarada. Las fundiciones clandestinas se apagan; solo resta purificar la fuente.'
    },
    16: {
      capitulo: 16,
      icono: '👑',
      etiqueta: 'Epílogo Desbloqueado · Campeones de Aden',
      titulo: 'Juicio Público en la Plaza',
      detalle: 'La Erudita Mirel lee las actas ante el pueblo libre y los Sabios conspiradores son depuestos. Las 5 cabañas fronterizas y las Mazmorras Ancestrales aguardan vuestra gesta final.'
    }
  };

  function hitoDeCapituloCompletado(numero, world) {
    const mapa = hitosDe(world);
    return mapa[Number(numero)] || HITOS_NARRATIVOS[Number(numero)] || null;
  }

  function prologoDe(world) {
    if (world && world.historia && world.historia.prologo) return world.historia.prologo;
    const p0 = puebloInicial(world);
    const nomP = (p0 && p0.name) || 'tu aldea inicial';
    const nomM = (world && world.name) || 'estas tierras';
    return {
      titulo: `🔥 Prólogo · La Emboscada en ${nomP}`,
      parrafo1: `La noche cae sobre las murallas de <b>${nomP}</b>, en <b>${nomM}</b>. Mientras el <b>Herrero Brann</b> martillea a escondidas fuera del control del cónclave, un estruendo rompe las vigas: criaturas deformadas con placas de hierro remachadas en carne viva irrumpen en la fragua.`,
      parrafo2: `Brann logra abatir a la primera bestia antes de caer herido sobre el yunque, apretando en su mano un <b>sello de bronce perteneciente al consejo de la plaza</b>. <i>«Nos han tendido una trampa… alguien fabrica estas aberraciones desde dentro de nuestras propias murallas»</i>, jadea.`
    };
  }

  // Generador de historia completa y determinista a partir de la geografía real de cualquier mundo
  function generarHistoriaParaMundo(world, opts) {
    opts = opts || {};
    if (!world) return null;
    const nombreMundo = opts.nombreMundo || world.name || 'Tierras Inexploradas';
    const pueblos = (world.towns || []).slice().sort((a, b) => (a.level || 1) - (b.level || 1));
    const pIni = puebloInicial(world) || pueblos[0] || { id: 't_1', name: 'Alba', x: 0, y: 0 };
    const otrosPueblos = pueblos.filter(t => t.id !== pIni.id);
    const p2 = otrosPueblos[0] || pIni;
    const pMid = otrosPueblos[Math.floor(otrosPueblos.length / 2)] || p2;
    const pFin = otrosPueblos[otrosPueblos.length - 1] || pMid;

    const zonas = (world.zones || []).filter(z => z.monsters && z.monsters.length);
    const zonasNormales = zonas.filter(z => z.type !== 'jefe').sort((a, b) => (a.levelMin || 1) - (b.levelMin || 1));
    const zonaAt = idx => zonasNormales[Math.min(idx, Math.max(0, zonasNormales.length - 1))] || zonas[0] || null;
    const zBoss = zonas.filter(z => z.type === 'jefe' && z.monsters.some(m => m.boss)).sort((a, b) => (b.levelMin || 1) - (a.levelMin || 1))[0]
      || zonas[zonas.length - 1] || null;

    let secretos = Array.isArray(world.secretPlaces) ? world.secretPlaces : [];
    if (!secretos.length) {
      const gen = (typeof root !== 'undefined' && root.LugaresSecretosLib)
        ? root.LugaresSecretosLib.generarLugaresSecretos
        : (typeof require !== 'undefined' ? (() => { try { return require('./lugares-secretos.js').generarLugaresSecretos; } catch (e) { return null; } })() : null);
      if (gen) secretos = gen(world);
    }
    const secPorTipo = tipo => secretos.find(s => s.tipo === tipo) || secretos[0] || null;
    const secFuente = secPorTipo('fuente');
    const secCabana = secPorTipo('cabana');
    const secAltar = secPorTipo('altar');
    const secSantuario = secPorTipo('santuario');

    const dungs = (world.dungeons || []).slice().sort((a, b) => (a.level || 1) - (b.level || 1));
    const dunIni = dungs[0] ? dungs[0].name : 'la cripta subterránea';
    const dunFin = dungs[dungs.length - 1] ? dungs[dungs.length - 1].name : dunIni;
    const bossNombre = (zBoss && zBoss.monsters && (zBoss.monsters.find(m => m.boss) || {}).name) || 'el Titán del Eclipse';
    const tituloFinal = opts.tituloFinal || (`Libertadores de ${nombreMundo.split('·')[0].trim()}`);

    const nZ = (i, fallback) => {
      const z = zonaAt(i);
      return z ? z.name : (fallback || 'las tierras salvajes');
    };
    const idZ = i => {
      const z = zonaAt(i);
      return z ? z.id : undefined;
    };
    const labMsg = z => (z && z.relieve && z.relieve.activo !== false) ? ' Adéntrate en el laberinto natural y ' : ' ';

    const z1 = zonaAt(0), z2 = zonaAt(1), z3 = zonaAt(2), z4 = zonaAt(3), z5 = zonaAt(4),
          z6 = zonaAt(5), z7 = zonaAt(6), z8 = zonaAt(7), z9 = zonaAt(Math.max(8, zonasNormales.length - 2));

    const capitulos = [
      {
        id: 'c1', nivel: 1, sabio: 'Sabia Elara', npc: 'guru-1',
        titulo: `Cenizas en ${pIni.name} y el primer cinturón`,
        encargo: `El Herrero Brann tose sangre sobre el yunque de ${pIni.name} tras la emboscada: «¡Nos han tendido una trampa en nuestras propias murallas! Id a {lugar} y abated a {n} criaturas alteradas; traedme sus correas de cuero y placas de hierro para forjar tu cinturón antes de que la guardia cierre las puertas».`,
        texto: `Regresas de {lugar} cubierto de hollín. Brann remacha la hebilla del cinturón y señala el sello hallado entre los despojos: «Alguien en ${pIni.name} está forjando monstruos con hierro militar».`,
        mision: { tipo: 'matar', cantidad: 8, nivel: (z1 && z1.levelMin) || 1, zona: z1 && z1.id },
        recompensa: { puntos: 1, forjarPieza: 'belt', desbloquea: 'acompanante' }
      },
      {
        id: 'c2', nivel: (z2 && z2.levelMin) || 2, sabio: 'Maestro Oren', npc: 'guru-2',
        titulo: `Rumbo a ${p2.name} y las botas de marcha`,
        encargo: `El Maestro Oren te intercepta en el sendero de ${pIni.name}: «Un emisario de ${p2.name} llevaba la lista real de sospechosos antes de desaparecer en {lugar}. Abate a {n} bestias allí y recupera sus tendones reforzados para que Brann te forje unas botas de marcha».`,
        texto: `En {lugar} recuperas tanto el cuero de marcha como una orden sellada con tu nombre rumbo a ${p2.name}. Tus pasos ahora resisten cualquier calzada o risco.`,
        mision: { tipo: 'matar', cantidad: 12, nivel: (z2 && z2.levelMin) || 2, zona: z2 && z2.id },
        recompensa: { puntos: 2, forjarPieza: 'boots' }
      },
      {
        id: 'c3', nivel: (z3 && z3.levelMin) || 4, sabio: 'Hermana Ysolde', npc: 'guru-3',
        titulo: 'Savia oscura y guantes de combate',
        encargo: `La Hermana Ysolde oculta un vial turbio bajo su túnica: «Las caravanas que cruzan {lugar} están cayendo en emboscadas. Abate a {n} criaturas alteradas allí y arráncales sus garras blindadas para forjar guantes de combate».`,
        texto: `Combates espalda con espalda con tu compañero en {lugar}. Con las garras obtenidas, Brann templa tus guanteletes y sella la hermandad total con tu acompañante.`,
        mision: { tipo: 'matar', cantidad: 15, nivel: (z3 && z3.levelMin) || 4, zona: z3 && z3.id },
        recompensa: { puntos: 2, forjarPieza: 'gloves', desbloquea: 'acompanante' }
      },
      {
        id: 'c4', nivel: (z4 && z4.levelMin) || 6, sabio: 'Viejo Tamsin', npc: 'guru-4',
        titulo: `El cerco de ${nZ(3)} y el peto de acero`,
        encargo: `El Viejo Tamsin señala hacia ${nZ(3)}: «Los capataces del cónclave esconden sus remesas tras los muros de {lugar}.${labMsg(z4)}Destroza a {n} guardianes allí y trae sus placas para forjar tu peto; te enseñaré a partir la tierra con Impacto Sísmico (Q)».`,
        texto: `Con las planchas recogidas en {lugar}, Brann martilla un peto macizo y Tamsin despierta en tu brazo el Impacto Sísmico (Q).`,
        mision: { tipo: 'matar', cantidad: 18, nivel: (z4 && z4.levelMin) || 6, zona: idZ(3) },
        recompensa: { puntos: 2, forjarPieza: 'torso', desbloquea: 'sismo' }
      },
      {
        id: 'c5', nivel: (z5 && z5.levelMin) || 8, sabio: 'Erudita Mirel', npc: 'guru-5',
        titulo: 'Susurros en la bruma y el yelmo protector',
        encargo: `La Erudita Mirel examina los mapas de ${pMid.name}: «Las emanaciones cercanas a {lugar} doblan la voluntad de los viajeros. Abate a {n} criaturas allí para recolectar refuerzos óseos con los que sellar tu yelmo».`,
        texto: `Al ajustar el yelmo forjado con piezas de {lugar}, las voces telepáticas del cónclave se apagan al instante. Estás listo para seguir su rastro hacia los santuarios ocultos.`,
        mision: { tipo: 'matar', cantidad: 20, nivel: (z5 && z5.levelMin) || 8, zona: idZ(4) },
        recompensa: { puntos: 2, forjarPieza: 'helmet' }
      },
      {
        id: 'c6', nivel: 9, sabio: 'Sabia Elara', npc: 'guru-1',
        titulo: 'La fuente arcana y las hombreras templadas',
        encargo: `Elara te entrega un mapa cifrado hacia {lugar}: «Sumerge tus placas de hombro en la fuente luminiscente para resistir el acero rúnico, pero mantente alerta: el agua guarda secretos de la Corona».`,
        texto: `En {lugar}, las hombreras absorben un fulgor azulado indestructible. Bajo la superficie descubres jaulas selladas con emblemas idénticos a los de las patrullas corruptas.`,
        mision: { tipo: 'secreto', secreto: 'fuente', secretoId: secFuente && secFuente.id },
        recompensa: { puntos: 3, forjarPieza: 'shoulders' }
      },
      {
        id: 'c7', nivel: (z6 && z6.levelMin) || 10, sabio: 'Maestro Oren', npc: 'guru-2',
        titulo: 'Hierro salvaje y la forja del arma',
        encargo: `Oren señala la ruta que une las tierras medias con ${pMid.name}: «Las vetas de hierro puro en {lugar} están tomadas por escoltas renegados. Abate a {n} enemigos allí y recupera metal suficiente para forjar tu arma maestra».`,
        texto: `Con el mineral puro de {lugar}, Brann templa tu arma maestra entre chispas azules. Tu equipo completo de campaña queda forjado y unido bajo una sola voluntad.`,
        mision: { tipo: 'matar', cantidad: 22, nivel: (z6 && z6.levelMin) || 10, zona: idZ(5) },
        recompensa: { puntos: 3, forjarPieza: 'weapon' }
      },
      {
        id: 'c8', nivel: (z7 && z7.levelMin) || 11, sabio: 'Hermana Ysolde', npc: 'guru-3',
        titulo: `El despertar de la Nova en ${nZ(6)}`,
        encargo: `Ysolde rasga sus votos frente a ti: «La energía encerrada en {lugar}.${labMsg(z7)}pertenece a los reyes antiguos, no al cónclave. Derrota a {n} centinelas allí para liberar la Explosión Nova (E)».`,
        texto: `Una onda expansiva dorada recorre {lugar}. Has desbloqueado la Explosión Nova (E) y confirmado que las reliquias de ${nombreMundo} responden a los libres, no a los tiranos.`,
        mision: { tipo: 'matar', cantidad: 25, nivel: (z7 && z7.levelMin) || 11, zona: idZ(6) },
        recompensa: { puntos: 3, desbloquea: 'nova' }
      },
      {
        id: 'c9', nivel: 12, sabio: 'Viejo Tamsin', npc: 'guru-4',
        titulo: 'Los archivos de la cabaña oculta',
        encargo: `Tamsin baja la voz: «Antes de morir, el cronista escondió en {lugar} los planos de ${dunIni} y el registro de envíos hacia ${pFin.name}. Llega hasta allí antes de que los inquisidores lo reduzcan a cenizas».`,
        texto: `En {lugar} hallas el diario completo: revela los nombres de los conspiradores, la red de monopolio mercantil y el despertar subterráneo bajo ${pFin.name}.`,
        mision: { tipo: 'secreto', secreto: 'cabana', secretoId: secCabana && secCabana.id },
        recompensa: { puntos: 3 }
      },
      {
        id: 'c10', nivel: (z8 && z8.levelMin) || 13, sabio: 'Sabia Elara', npc: 'guru-1',
        titulo: `Ruptura del cerco hacia ${pFin.name}`,
        encargo: `Los pasos fronterizos hacia ${pFin.name} arden bajo patrullas de choque en {lugar}. «Hay que romper el bloqueo ahora mismo: abatid a {n} enemigos en {lugar} para abrir paso al norte».`,
        texto: `El cerco de {lugar} se desmorona. Las caravanas rebeldes y los exploradores de ${p2.name} y ${pMid.name} por fin tienen vía libre hacia la frontera.`,
        mision: { tipo: 'matar', cantidad: 25, nivel: (z8 && z8.levelMin) || 13, zona: idZ(7) },
        recompensa: { puntos: 3 }
      },
      {
        id: 'c11', nivel: 14, sabio: 'Maestro Oren', npc: 'guru-2',
        titulo: `El altar de ${pMid.name} y el fin del monopolio`,
        encargo: `Oren te confía la llave rúnica: «Consagra {lugar} cerca de ${pMid.name}. Cuando caiga su sello eclesial, Brann y los mercaderes volverán a forjar y vender equipo superior (Nv. 12+) sin censura».`,
        texto: `Un haz luminoso parte el cielo sobre {lugar}: ¡el monopolio mercantil del cónclave queda destruido! Las fraguas superiores y tiendas de todo ${nombreMundo} reabren sus puertas.`,
        mision: { tipo: 'secreto', secreto: 'altar', secretoId: secAltar && secAltar.id },
        recompensa: { puntos: 4 }
      },
      {
        id: 'c12', nivel: (z9 && z9.levelMin) || 15, sabio: 'Hermana Ysolde', npc: 'guru-3',
        titulo: `Pilar de resonancia en ${nZ(Math.max(8, zonasNormales.length - 2))}`,
        encargo: `La ciudadela cercana a ${pFin.name} resiste protegida por un velo arcano alimentado desde {lugar}. «Derrota a {n} guardianes en {lugar} para derribar los pilares de resonancia».`,
        texto: `La cúpula energética colapsa con un rugido sobre {lugar}. El acceso al corazón mismo de la conspiración en ${pFin.name} queda abierto.`,
        mision: { tipo: 'matar', cantidad: 30, nivel: (z9 && z9.levelMin) || 15, zona: idZ(Math.max(8, zonasNormales.length - 2)) },
        recompensa: { puntos: 4 }
      },
      {
        id: 'c13', nivel: 16, sabio: 'Sabia Elara', npc: 'guru-1',
        titulo: 'El santuario del sol quebrado',
        encargo: `Elara te cita frente a los monolitos de {lugar}: «Contempla la fuente original que el cónclave intentó usurpar bajo ${dunFin}. Descubre sus ruinas para localizar el núcleo del titán».`,
        texto: `En {lugar}, las estelas revelan la verdad definitiva: el cónclave planeaba fusionar la savia corrupta con ${bossNombre} para someter todas las rutas de ${nombreMundo}.`,
        mision: { tipo: 'secreto', secreto: 'santuario', secretoId: secSantuario && secSantuario.id },
        recompensa: { puntos: 4 }
      },
      {
        id: 'c14', nivel: (zBoss && zBoss.levelMin) || 18, sabio: 'Viejo Tamsin', npc: 'guru-4',
        titulo: `El asalto final contra ${bossNombre}`,
        encargo: `Tamsin alza su mandoble hacia {lugar}, junto a ${pFin.name}: «Nadie ha vuelto vivo de los dominios de ${bossNombre}. Derriba al coloso en {lugar} antes de que despierte la última fragua abisal».`,
        texto: `En un combate épico en {lugar}, tu compañero desvía el golpe mortal y atraviesas el núcleo de ${bossNombre}. Las líneas de suministro de monstruos mecánicos se apagan para siempre.`,
        mision: { tipo: 'jefe', nivel: (zBoss && zBoss.levelMin) || 18, zona: zBoss && zBoss.id },
        recompensa: { puntos: 5 }
      },
      {
        id: 'c15', nivel: 18, sabio: 'Hermana Ysolde', npc: 'guru-3',
        titulo: 'Purificación en las aguas sagradas',
        encargo: `Con el titán derrotado, tu compañero te pide acudir una última vez a {lugar} para purificar los restos de aceite oscuro y sellar el pacto de los pueblos libres de ${nombreMundo}.`,
        texto: `En {lugar}, la savia gris se disuelve en vapor limpio. Los ríos que alimentan ${pIni.name} y ${p2.name} vuelven a correr puros bajo el cielo abierto.`,
        mision: { tipo: 'secreto', secreto: 'fuente', secretoId: secFuente && secFuente.id },
        recompensa: { puntos: 4 }
      },
      {
        id: 'c16', nivel: 19, sabio: 'Erudita Mirel', npc: 'guru-5',
        titulo: `Juicio y victoria en ${pIni.name}`,
        encargo: `Regresa a la plaza de ${pIni.name}. La Erudita Mirel, Brann y los enviados desde ${p2.name} hasta ${pFin.name} aguardan para juzgar al cónclave y grabar vuestro título en la crónica.`,
        texto: `Entre vítores bajo la arcada de ${pIni.name}, las campanas tañen desde ${p2.name} hasta ${pFin.name}. Vuestra gesta queda sellada para la eternidad: ¡sois los ${tituloFinal}!`,
        mision: { tipo: 'hablar', npc: 'guru-5', nombre: 'Erudita Mirel' },
        recompensa: { puntos: 6, titulo: tituloFinal }
      }
    ];

    const actos = [
      {
        numero: 1, id: 'acto-1',
        nombre: `Acto I · Asedio en ${pIni.name} y Forja Clandestina`,
        resumen: `Tras la emboscada en ${pIni.name}, reúnes cuero, tendones, garras y acero desde ${nZ(0)} hasta ${nZ(4)} para equiparte sin el permiso del cónclave.`,
        desdePaso: 0, hastaPaso: 4
      },
      {
        numero: 2, id: 'acto-2',
        nombre: `Acto II · Savia, Laberintos y Secretos de ${nombreMundo}`,
        resumen: `Templas tu armadura en la fuente arcana, despiertas la Explosión Nova y descubres las pruebas escritas de la conspiración entre ${p2.name} y ${pMid.name}.`,
        desdePaso: 5, hastaPaso: 9
      },
      {
        numero: 3, id: 'acto-3',
        nombre: `Acto III · Ruptura del Monopolio y Caída de ${bossNombre}`,
        resumen: `Consagras el Altar Rúnico junto a ${pMid.name} para reabrir las fraguas de nivel 12+, abres ruta hacia ${pFin.name} y abates a ${bossNombre}.`,
        desdePaso: 10, hastaPaso: 13
      },
      {
        numero: 4, id: 'acto-4',
        nombre: `Acto IV · Purificación y Liberación de ${nombreMundo}`,
        resumen: `Purificas las aguas de ${nombreMundo} y regresas a la plaza de ${pIni.name} para sellar el juicio que proclama a los ${tituloFinal}.`,
        desdePaso: 14, hastaPaso: 15
      }
    ];

    const epilogo = {
      nombre: `Epílogo · ${tituloFinal}`,
      resumen: `El cónclave ha caído y todas las rutas de ${nombreMundo} son libres. Las cabañas fronterizas, laberintos y mazmorras como ${dunFin} esperan a los campeones.`
    };

    const hitos = {
      5: { capitulo: 5, icono: '🛡️', etiqueta: `Fin del Acto I → Acto II · ${nombreMundo}`, titulo: 'Mente Blindada ante la Corrupción', detalle: `El yelmo óseo forjado con trofeos de ${nZ(4)} sella tu mente. Comienza la búsqueda de santuarios y pruebas.` },
      8: { capitulo: 8, icono: '✨', etiqueta: `Giro del Acto II · ${nZ(6)}`, titulo: 'Despertar de la Explosión Nova', detalle: `La Hermana Ysolde rompe en secreto la disciplina del cónclave y libera el poder antiguo en ${nZ(6)}.` },
      10: { capitulo: 10, icono: '⚔️', etiqueta: `Fin del Acto II → Acto III · Camino a ${pFin.name}`, titulo: 'Frontera Desbloqueada', detalle: `Cae el bloqueo hacia ${pFin.name} y las regiones extremas de ${nombreMundo} quedan a tu alcance.` },
      11: { capitulo: 11, icono: '🔓', etiqueta: `Hito Económico · ${pMid.name}`, titulo: '¡Monopolio Comercial Quebrado!', detalle: 'Las forjas de Brann y los mercaderes reabren todo el catálogo superior (Nv. 12+) en todos los pueblos.' },
      14: { capitulo: 14, icono: '⚙️', etiqueta: `Fin del Acto III → Acto IV · ${pFin.name}`, titulo: `Caída de ${bossNombre}`, detalle: `${bossNombre} yace derrotado junto a ${pFin.name}. Solo resta purificar las aguas y regresar a ${pIni.name}.` },
      16: { capitulo: 16, icono: '👑', etiqueta: `Epílogo Desbloqueado · ${tituloFinal}`, titulo: `Triunfo en la Plaza de ${pIni.name}`, detalle: `Has completado la crónica de ${nombreMundo}. Las mazmorras (${dungs.map(d => d.name).join(', ') || 'criptas'}) y las 5 cabañas quedan abiertas.` }
    };

    const dialogosNpc = {
      'guru-1': {
        1: `En ${pIni.name} todos vigilan lo que llevas al yunque de Brann. Empieza limpiando ${nZ(0)}.`,
        2: `Las fuentes arcanas de ${nombreMundo} guardan rastros de cargamentos desaparecidos entre ${pIni.name} y ${p2.name}.`,
        3: `Si llegas al santuario cerca de ${pFin.name}, entenderás por qué el cónclave temía tu avance.`,
        4: `${bossNombre} ha caído… quizá la voluntad de los pueblos libres valga más que todos nuestros sellos.`,
        fin: `Tu nombre ya forma parte eterna de las crónicas de ${nombreMundo}.`
      },
      'guru-2': {
        1: `Sigue las calzadas entre ${pIni.name} y ${p2.name}; las patrullas corruptas vigilan cada bifurcación.`,
        2: `Las vetas libres cerca de ${pMid.name} son vitales para templar tu arma maestra.`,
        3: `¡Con el Altar Rúnico consagrado, los caminos entre ${pIni.name}, ${pMid.name} y ${pFin.name} vuelven a ser libres!`,
        4: `Las caravanas vuelven a circular sin miedo desde la costa hasta ${pFin.name}.`,
        fin: `Cada camino de ${nombreMundo} lleva hoy la huella de los ${tituloFinal}.`
      },
      'guru-3': {
        1: `Entrena tus técnicas en silencio en ${pIni.name}. Las runas antiguas no pertenecen al cónclave.`,
        2: `Cuando alcances ${nZ(6)}, la Explosión Nova despertará ante tus manos.`,
        3: `He roto mis votos definitivamente. Derriba la barrera que protege ${pFin.name}.`,
        4: `Purifica las aguas de ${nombreMundo} para que ninguna otra forja oscura vuelva a nacer.`,
        fin: `Las runas sirven ahora al pueblo libre, no a las sombras.`
      },
      'guru-4': {
        1: `Aprende a partir la tierra: los constructos que merodean por ${nZ(3)} se quiebran con impacto sísmico.`,
        2: `El diario de la cabaña contiene las rutas secretas hacia ${dunIni}.`,
        3: `Cuando entres al territorio de ${bossNombre}, lleva contigo todo tu temple.`,
        4: `${bossNombre} ya no volverá a alzarse sobre ${pFin.name}.`,
        fin: `Las criptas como ${dunFin} siguen guardando pruebas para guerreros legendarios.`
      },
      'guru-5': {
        1: `Revisa siempre la durabilidad de tu equipo y blinda tu yelmo en cuanto llegues a ${nZ(4)}.`,
        2: `Cada pieza recuperada demuestra quién financia estas aberraciones desde ${pMid.name} hasta ${pFin.name}.`,
        3: `Reúno todas las actas y testimonios para el juicio en la plaza de ${pIni.name}.`,
        4: `Todo ${nombreMundo} aguarda en la plaza para escuchar vuestro veredicto.`,
        fin: `Los anales de ${pIni.name} honran por siempre a los ${tituloFinal}.`
      },
      'serv-herrero': {
        1: `Mi yunque en ${pIni.name} sigue ardiendo a escondidas. Tráeme trofeos de ${nZ(0)} y ${nZ(1)}.`,
        2: `En cuanto consigas hierro puro de ${nZ(5)}, forjaré tu arma definitiva.`,
        3: `¡El monopolio cayó! Ya puedo trabajar equipo superior desde nivel 12 en toda ${nombreMundo}.`,
        4: `El acero sale limpio de la fragua; es hora de cerrar el juicio en ${pIni.name}.`,
        fin: `Para los ${tituloFinal}, mi fragua siempre arderá con fuego perfecto.`
      },
      'serv-mercader': {
        1: `Los inspectores bloquean las ventas superiores en ${pIni.name} y ${p2.name} hasta que rompas el monopolio (Nv. 12).`,
        2: `Tráeme el botín de las cacerías y aprovisiónate de pociones antes de cruzar hacia ${pMid.name}.`,
        3: `¡Libre comercio al fin! Las rutas desde ${p2.name} hasta ${pMid.name} vuelven a fluir.`,
        4: `Las caravanas celebran vuestro triunfo en cada plaza.`,
        fin: `¡El mercado de ${nombreMundo} nunca había visto tanta abundancia!`
      },
      'serv-comandante': {
        1: `Tráeme pruebas del cónclave y no tendrás problemas con mi guarnición.`,
        2: `Esos diarios incriminan a los jefes de plaza. Mis exploradores despejarán vuestra marcha hacia ${pMid.name}.`,
        3: `La guardia está con vosotros para asegurar los flancos rumbo a ${pFin.name}.`,
        4: `Las murallas de ${pIni.name} vuelven a servir al pueblo.`,
        fin: `La guardia rinde honores a los ${tituloFinal}.`
      },
      'serv-informante': {
        1: `Dicen que las cabañas cercanas a ${pIni.name} esconden pistas sobre cargamentos perdidos.`,
        2: `Entre ${p2.name} y ${pMid.name} desaparecen caravanas enteras rumbo a ${dunIni}.`,
        3: `Mis contactos ven humo saliendo cerca de ${pFin.name}. Prepara tus mejores elixires.`,
        4: `Con ${bossNombre} vencido, solo quedan tesoros ocultos en las criptas profundas.`,
        fin: `Si buscas retos en ${dunFin}, siempre tengo coordenadas frescas.`
      },
      'serv-boticaria': {
        1: `Mis destilados mantienen en pie a quien se atreve a entrar en ${nZ(0)} sin armadura completa.`,
        2: `En los pantanos y bosques de ${nombreMundo} la savia corrupta quema la piel: lleva fuego líquido.`,
        3: `Contra ${bossNombre} necesitarás pociones de furia y temple.`,
        4: `Purificar las aguas devolvió la pureza incluso a mis hierbas.`,
        fin: `Las mazmorras de ${nombreMundo} siguen exigiendo buenos brebajes.`
      },
      'serv-hereje': {
        1: `Si buscas poder más allá de las leyes de ${pIni.name}, mis runas esperan en la sombra.`,
        2: `Ellos llaman herejía a mis grabados mientras infectan los bosques de ${p2.name}.`,
        3: `Graba furia en tu acero antes de enfrentarte a ${bossNombre}.`,
        4: `Incluso en tiempos libres, alguien debe vigilar lo que duerme bajo tierra.`,
        fin: `Mi yunque oscuro sigue abierto para quienes desciendan a ${dunFin}.`
      }
    };

    const prologo = {
      titulo: `🔥 Prólogo · La Emboscada en ${pIni.name}`,
      parrafo1: `La noche cae sobre las murallas de <b>${pIni.name}</b>, puerta de entrada a <b>${nombreMundo}</b>. Mientras el <b>Herrero Brann</b> forja a escondidas del cónclave, un estruendo quiebra las vigas: bestias alteradas con placas de hierro remachadas irrumpen desde la oscuridad.`,
      parrafo2: `Brann abatió a la primera criatura antes de desplomarse herido junto al yunque, aferrando un <b>sello de bronce del Consejo</b>. <i>«Nos han traicionado desde dentro… alguien alimenta esta plaga más allá de ${p2.name} y hasta ${pFin.name}»</i>, susurra.`
    };

    return {
      titulo: `Crónica de ${nombreMundo}`,
      subtitulo: `Campaña de 4 Actos · Desde ${pIni.name} hasta ${pFin.name}`,
      mundoNombre: nombreMundo,
      tituloFinal,
      generadaEn: new Date().toISOString(),
      prologo,
      actos,
      epilogo,
      capitulos,
      hitos,
      dialogosNpc
    };
  }

  // Encrucijadas interactivas en capítulos clave (decisiones persistentes y múltiples finales)
  const DECISIONES_CAPITULO = {
    2: {
      id: 'd_c2_lista',
      capitulo: 2,
      pregunta: 'La orden de ejecución oficial lleva vuestros nombres. ¿Qué haces con el pergamino sellado?',
      contexto: 'La guardia patrulla la entrada del pueblo y el mercado negro puja por información del cónclave.',
      opciones: [
        {
          id: 'guardia',
          etiqueta: '🛡️ Entregarlo al Comandante Kaelen',
          tendencia: 'Pueblo +3 · Vínculo +1',
          resumen: 'Buscas que la guarnición vea quién firma realmente las desapariciones.',
          efectoTxt: '+3 Pueblo · +1 Vínculo · +80 🪙',
          deltaRep: { pueblo: 3, sombra: 0, vinculo: 1 },
          premio: { oro: 80 },
          consecuencia: 'Kaelen examina el lacre con el ceño fruncido. La guardia empieza a dudar del cónclave y te abre crédito en la plaza.',
          reaccionRowan: '«Es arriesgado confiar en el uniforme, pero si Kaelen abre los ojos nos ahorrará muchas espadas en contra.»'
        },
        {
          id: 'informante',
          etiqueta: '🌘 Vender una copia a Varek en la sombra',
          tendencia: 'Sombra +3',
          resumen: 'Conviertes el peligro en oro y favor en los bajos fondos.',
          efectoTxt: '+3 Sombra · +120 🪙 · +1 🧪',
          deltaRep: { pueblo: 0, sombra: 3, vinculo: 0 },
          premio: { oro: 120, vida: 1 },
          consecuencia: 'Varek desliza las monedas bajo la manga: «Con esta firma tengo al consejo agarrado por el cuello».',
          reaccionRowan: '«Oro sucio… pero en las calzadas necesitaremos cada frasco de cura y cada moneda.»'
        },
        {
          id: 'rowan',
          etiqueta: '🤝 Quemarla junto a Rowan y cerrar filas',
          tendencia: 'Vínculo +3',
          resumen: 'No dependéis ni de la guardia ni de los espías: solo espalda con espalda.',
          efectoTxt: '+3 Vínculo · +1 🧬',
          deltaRep: { pueblo: 0, sombra: 0, vinculo: 3 },
          premio: { puntos: 1 },
          consecuencia: 'Las cenizas de la orden se las lleva el viento. Ningún bando tiene vuestra firma y vuestro temple se afila.',
          reaccionRowan: '«Pase lo que pase, tú cubres mi flanco y yo el tuyo. No necesitamos permiso de nadie.»'
        }
      ]
    },
    4: {
      id: 'd_c4_espectro',
      capitulo: 4,
      pregunta: 'La proyección espectral de la Sabia Elara vibra tras tu Impacto Sísmico. ¿Cómo respondes?',
      contexto: 'El eco arcano aún conserva parte de su canalización entre las placas del bosque.',
      opciones: [
        {
          id: 'desafiar',
          etiqueta: '🛡️ Desafiarla y quebrar el foco espectral',
          tendencia: 'Pueblo +3 · Vínculo +1',
          resumen: 'Rompes la transmisión delante de los suyos para marcar desafío abierto.',
          efectoTxt: '+3 Pueblo · +1 Vínculo · +100 EXP',
          deltaRep: { pueblo: 3, sombra: 0, vinculo: 1 },
          premio: { xp: 100 },
          consecuencia: 'El espejo rúnico estalla en mil chispas; los aldeanos presentes comprenden que el cónclave ya no es invencible.',
          reaccionRowan: '«Eso le habrá dolido hasta la torre del consejo. Que sepan que no somos presa fácil.»'
        },
        {
          id: 'fingir',
          etiqueta: '🌘 Drenar en silencio su esquirla de enlace',
          tendencia: 'Sombra +3',
          resumen: 'Dejas creer al espectro que falló mientras saqueas su energía residual.',
          efectoTxt: '+3 Sombra · +150 🪙',
          deltaRep: { pueblo: 0, sombra: 3, vinculo: 0 },
          premio: { oro: 150 },
          consecuencia: 'Aíslas el residuo arcano sin alertar a Elara: oro fácil al vender los fragmentos al mercado negro.',
          reaccionRowan: '«Qué frío estuviste ahí… parece que ya les lees la mente mejor que Mirel.»'
        },
        {
          id: 'preguntar_rowan',
          etiqueta: '🤝 Compartir la visión con Rowan',
          tendencia: 'Vínculo +3',
          resumen: 'Analizáis juntos los latidos subterráneos antes de disiparla.',
          efectoTxt: '+3 Vínculo · +150 EXP',
          deltaRep: { pueblo: 0, sombra: 0, vinculo: 3 },
          premio: { xp: 150 },
          consecuencia: 'Rowan reconoce el símbolo que palpita en la proyección: exactamente el mismo de los talleres olvidados bajo la montaña.',
          reaccionRowan: '«Gracias por confiar en lo que vi. Ya no caminamos a ciegas entre sus trampas.»'
        }
      ]
    },
    6: {
      id: 'd_c6_fuente',
      capitulo: 6,
      pregunta: 'Bajo las aguas luminiscentes yacen jaulas con el sello de la Corona llenas de aceite oscuro.',
      contexto: 'Las hombreras ya están templadas; aún puedes decidir qué hacer con el hallazgo sumergido.',
      opciones: [
        {
          id: 'liberar',
          etiqueta: '🛡️ Romper los candados y avisar a los ribereños',
          tendencia: 'Pueblo +3 · Vínculo +2',
          resumen: 'Hundes las trampas y dejas limpia la fuente para los viajeros.',
          efectoTxt: '+3 Pueblo · +2 Vínculo · +150 🪙',
          deltaRep: { pueblo: 3, sombra: 0, vinculo: 2 },
          premio: { oro: 150 },
          consecuencia: 'El agua recupera su transparencia azul y los pescadores agradecen el rescate entre aplausos.',
          reaccionRowan: '«Las aguas vuelven a respirar. Por esto merece la pena aguantar tantos golpes.»'
        },
        {
          id: 'extraer',
          etiqueta: '🌘 Embotellar el elixir concentrado para Saelen',
          tendencia: 'Sombra +4',
          resumen: 'Aprovechas la savia residual antes de que se disuelva.',
          efectoTxt: '+4 Sombra · +200 🪙 · +1 💧',
          deltaRep: { pueblo: 0, sombra: 4, vinculo: 0 },
          premio: { oro: 200, mana: 1 },
          consecuencia: 'Llenas dos frascos de agua negra hirviente; el hereje y los contrabandistas pagarán bien por su pureza.',
          reaccionRowan: '«Saelen se frotará las manos con eso… solo prométeme que no dejarás que oscurezca tu filo.»'
        }
      ]
    },
    9: {
      id: 'd_c9_diario',
      capitulo: 9,
      pregunta: 'Tienes el diario completo que incrimina a los cinco Sabios. ¿Qué destino le das a la prueba?',
      contexto: 'Están en juego tanto la revuelta popular como la caída silenciosa de la cúpula.',
      opciones: [
        {
          id: 'publicar',
          etiqueta: '🛡️ Sacar copias para todas las posadas y guardias',
          tendencia: 'Pueblo +4 · Vínculo +1',
          resumen: 'Conviertes el secreto en clamor abierto en cada plaza.',
          efectoTxt: '+4 Pueblo · +1 Vínculo · +1 🧬',
          deltaRep: { pueblo: 4, sombra: 0, vinculo: 1 },
          premio: { puntos: 1 },
          consecuencia: 'En menos de un día los nombres de los conspiradores corren de boca en boca y las caravanas dejan de temer.',
          reaccionRowan: '«Ahora sí que no pueden ocultarse tras togas doradas. Todo el reino sabe la verdad.»'
        },
        {
          id: 'chantajear',
          etiqueta: '🌘 Exigir rescate y salvoconductos a sus emisarios',
          tendencia: 'Sombra +4',
          resumen: 'Usas el diario como moneda de cambio para financiar tu campaña.',
          efectoTxt: '+4 Sombra · +300 🪙 · +2 🧪',
          deltaRep: { pueblo: 0, sombra: 4, vinculo: 0 },
          premio: { oro: 300, vida: 2 },
          consecuencia: 'Los mensajeros del cónclave dejan bolsas de oro selladas en la espesura, aunque con ojos llenos de rencor.',
          reaccionRowan: '«Les has hecho pagar por adelantado. Pero ten por seguro que enviarán asesinos más duros.»'
        },
        {
          id: 'confiar_ysolde',
          etiqueta: '🤝 Entregarlo a Ysolde para que rompa sus votos',
          tendencia: 'Vínculo +4',
          resumen: 'Le das la coartada moral necesaria para desertar del consejo.',
          efectoTxt: '+4 Vínculo · +1 🧬',
          deltaRep: { pueblo: 0, sombra: 0, vinculo: 4 },
          premio: { puntos: 1 },
          consecuencia: 'Ysolde lee los párrafos con rabia contenida y arroja su medallón eclesial al suelo, jurando ayudaros hasta el final.',
          reaccionRowan: '«Ganar a Ysolde dentro de su propio templo vale más que diez armerías.»'
        }
      ]
    },
    11: {
      id: 'd_c11_altar',
      capitulo: 11,
      pregunta: 'La llama del Altar Rúnico acaba de quebrar el monopolio comercial. ¿A quién confías las runas?',
      contexto: 'Las fraguas superiores acaban de abrirse; el poder restante del altar todavía vibra.',
      opciones: [
        {
          id: 'gremios',
          etiqueta: '🛡️ Entregar la llave al gremio de Brann y Tovi',
          tendencia: 'Pueblo +3',
          resumen: 'Garantizas que ningún otro consejo vuelva a cerrar el libre comercio.',
          efectoTxt: '+3 Pueblo · +250 🪙',
          deltaRep: { pueblo: 3, sombra: 0, vinculo: 0 },
          premio: { oro: 250 },
          consecuencia: 'Los artesanos y mercaderes celebran el fin de los aranceles abusivos con un generoso premio de campaña.',
          reaccionRowan: '«¡Por fin Brann puede golpear acero de verdad sin esconderse tras un muro!»'
        },
        {
          id: 'absorber',
          etiqueta: '🌘 Absorber el resto del sello rúnico para tu técnica',
          tendencia: 'Sombra +3',
          resumen: 'Concentras el remanente del altar directamente en tus habilidades.',
          efectoTxt: '+3 Sombra · +1 🧬',
          deltaRep: { pueblo: 0, sombra: 3, vinculo: 0 },
          premio: { puntos: 1 },
          consecuencia: 'Una corriente fría recorre tu brazo: el monopolio ha muerto y tú heredas su antigua potencia concentrada.',
          reaccionRowan: '«¡Cuidado! Ese altar lleva siglos acumulando energía ajena… aunque reconozco tu fuerza.»'
        }
      ]
    },
    13: {
      id: 'd_c13_corazon',
      capitulo: 13,
      pregunta: 'El cristal flotante del Santuario late sincronizado con el Titán mecánico. ¿Cómo actúas?',
      contexto: 'Aún queda el combate decisivo contra la bestia titánica.',
      opciones: [
        {
          id: 'destruir',
          etiqueta: '🛡️ Astillar sus conductos para proteger los caminos',
          tendencia: 'Pueblo +3 · Vínculo +2',
          resumen: 'Cortas los enlaces arcanos hacia las aldeas antes del asalto.',
          efectoTxt: '+3 Pueblo · +2 Vínculo · +200 EXP',
          deltaRep: { pueblo: 3, sombra: 0, vinculo: 2 },
          premio: { xp: 200 },
          consecuencia: 'Las placas del santuario quedan silenciadas; los pueblos ya no corren peligro de sufrir otra oleada mientras subes.',
          reaccionRowan: '«Las rutas de abajo están a salvo. Ahora sí podemos encarar al coloso con la mente limpia.»'
        },
        {
          id: 'drenar',
          etiqueta: '🌘 Arrancar una esquirla viva del cristal',
          tendencia: 'Sombra +4',
          resumen: 'Aseguras un núcleo de energía pura de altísimo valor.',
          efectoTxt: '+4 Sombra · +250 🪙',
          deltaRep: { pueblo: 0, sombra: 4, vinculo: 0 },
          premio: { oro: 250 },
          consecuencia: 'El fragmento aún palpita en tu bolsa con un brillo ambarino temible y valiosísimo.',
          reaccionRowan: '«Ese pedazo late como si siguiera vivo… no tardes en acabar con su dueño.»'
        }
      ]
    },
    16: {
      id: 'd_c16_juicio',
      capitulo: 16,
      pregunta: 'La plaza entera aguarda tu veredicto sobre los Sabios derrotados y el futuro del reino.',
      contexto: 'Tu última elección sellará qué clase de leyenda cantarán las próximas generaciones.',
      opciones: [
        {
          id: 'luz',
          etiqueta: '☀️ Justicia del Alba: destruir el núcleo y restaurar el consejo abierto',
          tendencia: 'Final Luz · +25 Vida Máx permanente',
          resumen: 'Sometes a los culpables a juicio público y fundas leyes limpias para todos los pueblos.',
          efectoTxt: '+4 Pueblo · +2 Vínculo · +2 🧬 · 👑 Guardianes del Alba',
          deltaRep: { pueblo: 4, sombra: 0, vinculo: 2 },
          premio: { puntos: 2, titulo: 'Guardianes del Alba' },
          finalId: 'luz',
          consecuencia: 'El núcleo es pulverizado ante la multitud. Nacen asambleas abiertas desde la costa hasta la sierra.',
          reaccionRowan: '«¡Lo logramos de verdad! Hoy nadie volverá a mandar en la sombra sobre estas murallas.»'
        },
        {
          id: 'sombra',
          etiqueta: '🌘 Trono del Eclipse: conservar el sello del cónclave bajo tu mano',
          tendencia: 'Final Sombra · +8% Crítico permanente',
          resumen: 'Exiges sumisión de los gremios ocultos y tomas las riendas del antiguo poder.',
          efectoTxt: '+5 Sombra · +400 🪙 · +2 🧬 · 👑 Señores del Eclipse',
          deltaRep: { pueblo: 0, sombra: 5, vinculo: 0 },
          premio: { oro: 400, puntos: 2, titulo: 'Señores del Eclipse' },
          finalId: 'sombra',
          consecuencia: 'Ningún funcionario alza la vista al pasar ante ti. Las arcas reales y los secretos arcanos cambian de dueño.',
          reaccionRowan: '«Vaya silencio en la plaza… cumpliste nuestra promesa, pero ten cuidado en quién te conviertes.»'
        },
        {
          id: 'equilibrio',
          etiqueta: '⚖️ Pacto de la Hermandad: repartir el mandato con Rowan y Brann',
          tendencia: 'Final Equilibrio · +2 Maestría de Compañero',
          resumen: 'Ni consejo tirano ni trono solitario: una guardia errante vela por las rutas.',
          efectoTxt: '+2 Pueblo · +4 Vínculo · +2 🧬 · +2 ⭐ Comp · 👑 Custodios del Pacto',
          deltaRep: { pueblo: 2, sombra: 0, vinculo: 4 },
          premio: { puntos: 2, compPuntos: 2, titulo: 'Custodios del Pacto' },
          finalId: 'equilibrio',
          consecuencia: 'Brann abre hermandad de forjadores libres, Ysolde custodia los altares y Rowan cabalga a tu par.',
          reaccionRowan: '«De aprendiz de aldea a Custodio del Pacto… ¡aún nos esperan muchas mazmorras juntos!»'
        }
      ]
    }
  };

  const EPILOGOS_FINALES = {
    luz: {
      id: 'luz',
      titulo: '☀️ Final del Alba · La Plaza Libre',
      badge: 'Guardianes del Alba (+25 Vida Máxima permanente)',
      texto: 'Las antiguas jaulas y fraguas prohibidas fueron desmanteladas ante toda la ciudad. Brann encabeza un gremio abierto de artesanos, Kaelen patrulla rutas seguras y tu nombre abre todas las puertas sin miedo.'
    },
    sombra: {
      id: 'sombra',
      titulo: '🌘 Final del Eclipse · El Nuevo Señorío',
      badge: 'Señores del Eclipse (+8% Crítico permanente)',
      texto: 'Los sellos del cónclave sobrevivieron bajo tu custodia. Varek y Saelen te rinden cuentas entre murmullos mientras nadie osa bloquear tus caravanas: el reino vive en paz, pero tiembla cuando desenvainas.'
    },
    equilibrio: {
      id: 'equilibrio',
      titulo: '⚖️ Final del Pacto · Hermandad de los Caminos',
      badge: 'Custodios del Pacto (+2 Maestría para tu Compañero)',
      texto: 'Ni consejo oculto ni corona férrea: el poder volvió a los pueblos y a quienes protegen los senderos. Tú y Rowan seguís siendo los guardianes errantes de cada frontera, cabaña y cripta olvidada.'
    }
  };

  function decisionDeCapitulo(numero) {
    return DECISIONES_CAPITULO[Number(numero)] || null;
  }

  function aplicarDecision(heroeEst, numero, opcionId) {
    const dec = decisionDeCapitulo(numero);
    if (!dec) throw new Error('Este capítulo no tiene decisión asociada: ' + numero);
    const opt = dec.opciones.find(o => o.id === opcionId);
    if (!opt) throw new Error('Opción de decisión inválida: ' + opcionId);
    if (!heroeEst || typeof heroeEst !== 'object') throw new Error('Estado de héroe requerido');
    heroeEst.decisiones = heroeEst.decisiones || {};
    heroeEst.reputacion = heroeEst.reputacion || { pueblo: 0, sombra: 0, vinculo: 0 };
    heroeEst.titulos = Array.isArray(heroeEst.titulos) ? heroeEst.titulos : [];

    if (heroeEst.decisiones[dec.id]) {
      const prevOpt = dec.opciones.find(o => o.id === heroeEst.decisiones[dec.id]) || opt;
      return {
        yaTomada: true,
        decision: dec,
        opcion: prevOpt,
        premio: {},
        epilogo: heroeEst.finalId ? (EPILOGOS_FINALES[heroeEst.finalId] || null) : null
      };
    }

    heroeEst.decisiones[dec.id] = opt.id;
    const clmp = v => Math.max(-20, Math.min(50, Math.trunc(v)));
    const dr = opt.deltaRep || {};
    heroeEst.reputacion.pueblo = clmp((heroeEst.reputacion.pueblo || 0) + (dr.pueblo || 0));
    heroeEst.reputacion.sombra = clmp((heroeEst.reputacion.sombra || 0) + (dr.sombra || 0));
    heroeEst.reputacion.vinculo = clmp((heroeEst.reputacion.vinculo || 0) + (dr.vinculo || 0));
    if (opt.finalId) heroeEst.finalId = opt.finalId;
    const premio = opt.premio || {};
    if (premio.puntos) heroeEst.puntos = (heroeEst.puntos || 0) + premio.puntos;
    if (premio.titulo && !heroeEst.titulos.includes(premio.titulo)) heroeEst.titulos.push(premio.titulo);
    return {
      yaTomada: false,
      decision: dec,
      opcion: opt,
      premio,
      epilogo: opt.finalId ? (EPILOGOS_FINALES[opt.finalId] || null) : null
    };
  }

  function epilogoDe(heroeEst, world) {
    if (heroeEst && heroeEst.finalId && EPILOGOS_FINALES[heroeEst.finalId]) {
      return EPILOGOS_FINALES[heroeEst.finalId];
    }
    const acto = actoActual(heroeEst && heroeEst.principal ? heroeEst.principal : { paso: 0 }, world);
    return {
      id: 'base',
      titulo: acto.nombre,
      badge: 'Crónica de campaña',
      texto: acto.resumen
    };
  }

  // Diálogos interactivos con 3 opciones reales al hablar con cualquier Sabio o Servicio
  function dialogoInteractivoNpc(npcId, heroeEst, world) {
    const baseId = normalizarNpcId(npcId);
    const p = (heroeEst && heroeEst.principal) ? heroeEst.principal : { paso: 0, progreso: 0, objetivo: null };
    const acto = actoActual(p, world);
    const claveActo = acto.terminado ? 'fin' : acto.numero;
    const cap = capituloActual(p, world);
    const obj = (!terminada(p, world) && world) ? resolverObjetivo(cap, world) : null;
    const ctx = fraseContextualNpc(baseId, p, world, heroeEst);
    const vistos = (heroeEst && heroeEst.dialogosVistos) || {};
    const dun = (world && world.dungeons && world.dungeons[0]) ? world.dungeons[0].name : 'la cripta antigua';
    const pobIni = puebloInicial(world);
    const nomIni = (pobIni && pobIni.name) || 'la plaza';

    const tramas = {
      'guru-1': {
        1: 'El cónclave controla cada yunque desde la sombra. Si encuentras sellos de bronce entre las bestias, no confíes ni en tu propia sombra.',
        2: 'Las jaulas bajo las fuentes se fabricaron con hierro de las minas reales antes del asedio.',
        3: 'Ya no finjas obediencia: si llegas al santuario mayor entenderás qué intentábamos contener bajo el cráter.',
        4: 'Solo un alma templada puede cerrar el juicio sin repetir nuestra caída.',
        fin: 'La historia siempre olvida los nombres de quienes firman las leyes en secreto… pero recordará los vuestros.'
      },
      'guru-2': {
        1: 'Cortamos los mapas de las calzadas para que los inquisidores perdieran el rastro de vuestros pasos.',
        2: 'Las vetas fuera de la carretera principal escapan al recuento fiscal de los Sabios.',
        3: 'Ahora que el Altar Rúnico arde libre, ningún comerciante pagará tributo al Óxido.',
        4: 'Hasta los arrieros de las fronteras regresan cargados de especias y acero limpio.',
        fin: 'Las siete rutas de comercio cantan baladas de vuestra travesía.'
      },
      'guru-3': {
        1: 'Cada túnica blanca oculta manchas grises de aceite rúnico. Sigue entrenando tus técnicas.',
        2: 'Cuando liberé el sello antiguo de la Nova supe que nuestro tiempo como consejo había terminado.',
        3: 'No tengas piedad con los centinelas de élite de la cúpula; no son hombres, sino cascarones.',
        4: 'Limpia la última mancha en la fuente y serás libre de todo juramento.',
        fin: 'Por fin enseño las runas sin miedo a una purga.'
      },
      'guru-4': {
        1: 'Llevo veinte inviernos oliendo esta corrupción. Las piezas de metal incrustadas en los lobos salen de un mismo crisol.',
        2: 'En aquella cabaña dejé marcas en las vigas para que quien encontrara el diario supiera bajar hasta las criptas.',
        3: 'Cuando cargues contra el titán, no golpees su escudo: espera al instante tras su impacto pesado.',
        4: 'Al ver caer a aquel coloso respiré por primera vez sin sentir metal bajo los pies.',
        fin: 'Si aún buscas desafíos de acero puro, desciende a ' + dun + '.'
      },
      'guru-5': {
        1: 'Reviso las bajas de cada patrulla: hay envíos enteros de armaduras que nunca llegaron al frente.',
        2: 'Con cada prueba que recoges, un nombre nuevo cae en mis actas de acusación.',
        3: 'Falta poco para reunir al pueblo entero bajo la arcada y dictar sentencia.',
        4: 'Cada testigo desde los muelles hasta el norte ha confirmado vuestro relato.',
        fin: 'Vuestro nombre abre el primer tomo de la Nueva Crónica de ' + nomIni + '.'
      },
      'serv-herrero': {
        1: 'Cada coraza de bestia que deshago en la fragua tiene estampado el punzón del consejo.',
        2: 'Dame mineral sin contaminar y haré saltar chispas azules hasta forjar tu arma.',
        3: '¡Qué descanso volver a golpear el yunque a plena luz del día!',
        4: 'Solo queda cerrar el juicio para que jamás cierren otra forja libre.',
        fin: 'Mientras siga en pie, nunca te faltará acero.'
      },
      'serv-mercader': {
        1: 'Me sellaron los cofres con lacre rojo; apenas puedo comerciar pociones y retales.',
        2: 'Dicen en las posadas que pronto caerá algún altar grande cerca del camino.',
        3: '¡Libre comercio! Los precios vuelven a fluir y tengo mejor género listo.',
        4: 'Las caravanas brindan por vuestra victoria en cada taberna.',
        fin: 'Ningún sello prohibido volverá a cerrar nuestras tiendas.'
      },
      'serv-comandante': {
        1: 'Mis hombres obedecen órdenes selladas… pero no soy ciego: las desapariciones huelen mal.',
        2: 'Ya tengo medio batallón listo para ignorar los avisos del cónclave cuando pases.',
        3: 'Cubrimos las puertas de la plaza para que avances hacia las cumbres sin emboscadas por la espalda.',
        4: 'La guarnición espera tu veredicto final con las lanzas firmes.',
        fin: 'Un honor haber luchado del lado correcto de la muralla.'
      },
      'serv-informante': {
        1: 'Por aquí pasan demasiados mensajeros con bolsas pesadas y pocas respuestas.',
        2: 'Si buscas cabañas o jaulas, sigue las huellas de carros sin marca oficial.',
        3: 'Hasta mis espías celebran que rompieras el monopolio: hay más oro circulando para todos.',
        4: 'Cuando acabe la fiesta en la plaza, los tesoros de ' + dun + ' seguirán intactos.',
        fin: 'Siempre seremos socios mientras quede un rincón oscuro por explorar.'
      },
      'serv-boticaria': {
        1: 'Ese aceite oscuro que enloquece a las fieras es el mismo que destilan en secreto los templos.',
        2: 'Si pisas los pantanos sin bálsamo, la savia te delatará a cien metros.',
        3: 'El corazón del titán late con alquimia vieja: lleva pociones concentradas.',
        4: 'Me alegra que eligieras purificar la fuente en lugar de quemarla.',
        fin: 'Si bajas a las catacumbas, pasa primero por mis destilados.'
      },
      'serv-hereje': {
        1: 'Me desterraron por grabar runas de maná mientras ellos clavaban placas a lobos vivos.',
        2: 'Cada vez que rompes uno de sus sellos, mis viejos planos cobran vida.',
        3: 'Para tumbar al señor de las bestias hace falta filo oscuro, no rezos suaves.',
        4: 'Incluso en un reino en paz alguien debe vigilar lo que respira bajo la roca.',
        fin: 'Mi yunque no juzga bandos: solo tempera poder real.'
      }
    };

    const pistaActual = obj
      ? `Objetivo actual (Cap. ${p.paso + 1}): ${obj.texto}. Recuerda ajustar la hora con T o usar la ruta automática (🧭) si buscas el camino rápido.`
      : `Toda la crónica está completa. Explora ${dun} o habla con las 5 cabañas especiales para desafíos mayores.`;

    const keyTrama = `${baseId}_trama_${claveActo}`;
    const keyPista = `${baseId}_pista_${cap ? cap.id : 'fin'}`;
    const keyPost = `${baseId}_postura_${claveActo}`;
    const esSombraNpc = baseId === 'serv-informante' || baseId === 'serv-boticaria' || baseId === 'serv-hereje';

    return {
      npcId: baseId,
      acto: acto.numero,
      saludo: ctx.frase || '',
      opciones: [
        {
          id: 'trama',
          etiqueta: '🔍 Preguntar sobre el cónclave y este acto',
          respuesta: (tramas[baseId] && tramas[baseId][claveActo]) || 'Los vientos cambian sobre el reino. Mantén los ojos abiertos.',
          deltaRep: { vinculo: 1 },
          xp: 35,
          vistoKey: keyTrama,
          vista: !!vistos[keyTrama]
        },
        {
          id: 'pista',
          etiqueta: '🧭 Pedir orientación práctica sobre el siguiente objetivo',
          respuesta: pistaActual,
          pista: obj ? obj.texto : null,
          vistoKey: keyPista,
          vista: !!vistos[keyPista]
        },
        {
          id: 'postura',
          etiqueta: esSombraNpc ? '🌘 Acordar discreción y favor en la sombra' : '🛡️ Prometer defensa del pueblo y las rutas',
          respuesta: esSombraNpc
            ? '«Trato hecho. Quien mueve oro sin hacer ruido siempre encuentra puertas entreabiertas aquí.»'
            : '«Que así sea. Las gentes de estas tierras recordarán quién sostuvo el escudo por ellas.»',
          deltaRep: esSombraNpc ? { sombra: 1 } : { pueblo: 1 },
          xp: 20,
          vistoKey: keyPost,
          vista: !!vistos[keyPost]
        }
      ]
    };
  }

  function resolverOpcionDialogo(heroeEst, opcion) {
    if (!heroeEst || !opcion) return { primeraVez: false, respuesta: '', deltaRep: null, xp: 0, oro: 0, pista: null };
    heroeEst.dialogosVistos = heroeEst.dialogosVistos || {};
    heroeEst.reputacion = heroeEst.reputacion || { pueblo: 0, sombra: 0, vinculo: 0 };
    const clave = opcion.vistoKey || '';
    const primeraVez = !!(clave && !heroeEst.dialogosVistos[clave]);
    if (clave) heroeEst.dialogosVistos[clave] = true;
    let appliedRep = null;
    if (primeraVez && opcion.deltaRep) {
      const clmp = v => Math.max(-20, Math.min(50, Math.trunc(v)));
      ['pueblo', 'sombra', 'vinculo'].forEach(k => {
        if (opcion.deltaRep[k]) heroeEst.reputacion[k] = clmp((heroeEst.reputacion[k] || 0) + opcion.deltaRep[k]);
      });
      appliedRep = opcion.deltaRep;
    }
    return {
      primeraVez,
      respuesta: opcion.respuesta || '',
      deltaRep: appliedRep,
      xp: primeraVez ? (opcion.xp || 0) : 0,
      oro: primeraVez ? (opcion.oro || 0) : 0,
      pista: opcion.pista || null
    };
  }

  function subtituloVivo(evento, heroeEst, world, nombreCompanero) {
    if (!evento || !evento.tipo) return null;
    const comp = nombreCompanero || 'Rowan';
    const p = (heroeEst && heroeEst.principal) ? heroeEst.principal : { paso: 0 };
    const rep = (heroeEst && heroeEst.reputacion) || {};
    const acto = actoActual(p, world);
    const nom = evento.nombre || '';

    if (evento.tipo === 'decision' && evento.reaccion) {
      return {
        hablante: comp,
        icono: '🗣️',
        texto: evento.reaccion,
        replica: evento.replicaHeroe ? { hablante: 'Héroe', texto: evento.replicaHeroe } : null
      };
    }
    if (evento.tipo === 'pueblo') {
      const pNom = nom || 'el pueblo';
      const msg = monopolioRoto(p)
        ? `«Las fraguas y mercados de ${pNom} respiran libres al fin. Buen trabajo, camarada.»`
        : ((rep.sombra || 0) > (rep.pueblo || 0) + 2
          ? `«Cuidado al cruzar la plaza de ${pNom}: tus tratos en la sombra ya despiertan rumores.»`
          : `«Entramos en ${pNom}. Revisa el estado de tu cota en el yunque de Brann antes de salir.»`);
      const repH = monopolioRoto(p)
        ? '«Y aún nos queda asegurar las fronteras y las criptas antiguas.»'
        : '«Echemos un vistazo rápido a provisiones y encargos antes de partir.»';
      return { hablante: comp, icono: '🏘️', texto: msg, replica: { hablante: 'Héroe', texto: repH } };
    }
    if (evento.tipo === 'mazmorra') {
      const mNom = nom || 'la cripta';
      return {
        hablante: comp,
        icono: '🗝️',
        texto: `«Qué aire tan helado sube de ${mNom}… prepárate para esquivar (X) si el guardián ruge.»`,
        replica: { hablante: 'Héroe', texto: '«Mantén la formación cerrada tras de mí. Vamos a limpiar esta cámara.»' }
      };
    }
    if (evento.tipo === 'zona_peligrosa') {
      const zNom = nom || 'esta comarca hostil';
      return {
        hablante: comp,
        icono: '⚠️',
        texto: `«¡Atención al entrar en ${zNom}! Las patrullas de élite aquí no dan tregua.»`,
        replica: { hablante: 'Héroe', texto: '«Buen ojo. Prepara tus dopes en cuanto rompan la distancia.»' }
      };
    }
    if (evento.tipo === 'jefe_caido') {
      const jNom = nom || 'el coloso';
      return {
        hablante: comp,
        icono: '⚔️',
        texto: `«¡${jNom} ha caído! Todo el reino sentirá que el cónclave pierde el control.»`,
        replica: { hablante: 'Héroe', texto: '«Recojamos las pruebas de este combate y sigamos la pista principal.»' }
      };
    }
    if (evento.tipo === 'cabana') {
      const cNom = nom || 'el puesto fronterizo';
      if (evento.fase === 'rastro') {
        return {
          hablante: comp,
          icono: '🔎',
          texto: `«¡Por aquí cerca de ${cNom} hay huellas frescas del líder de la manada!»`,
          replica: { hablante: 'Héroe', texto: '«Inspeccionemos el rastro y acabemos con el alfa de una vez.»' }
        };
      }
      if (evento.fase === 'lider') {
        return {
          hablante: comp,
          icono: '🐺',
          texto: `«¡Ese alfa de ${cNom} ha caído! Los aldeanos de la cabaña respirarán en paz.»`,
          replica: { hablante: 'Héroe', texto: '«Volvamos con el guarda de la cabaña a entregar el contrato.»' }
        };
      }
      return {
        hablante: comp,
        icono: '🏡',
        texto: `«Cuidar puestos avanzados como ${cNom} deja sin guarida a las bestias del cónclave.»`,
        replica: { hablante: 'Héroe', texto: '«Paso a paso aseguraremos todos los senderos entre pueblos.»' }
      };
    }
    if (evento.tipo === 'mision_comp') {
      if (evento.fase === 'talento') {
        const tNom = evento.talento || 'juramento marcial';
        return {
          hablante: comp,
          icono: '🌟',
          texto: `«Luchar contigo ha despertado mi ${tNom}. ¡Ya no hay bestia ni inquisidor que me haga retroceder!»`,
          replica: { hablante: 'Héroe', texto: '«Eres irreemplazable en este camino. Seguimos espalda con espalda.»' }
        };
      }
      return {
        hablante: comp,
        icono: '🤝',
        texto: `«Avanzamos en nuestra propia senda juntos, camarada. Siento el pulso más firme en cada lance.»`,
        replica: { hablante: 'Héroe', texto: '«Nuestra alianza pesa más que cualquier decreto del consejo.»' }
      };
    }
    if (evento.tipo === 'charla_camino') {
      const arq = evento.arquetipo || 'rowan';
      if (arq === 'lyra') {
        return {
          hablante: comp,
          icono: '🗡️',
          texto: (rep.sombra || 0) >= 4
            ? '«Sabes moverte entre los secretos de esta tierra mejor que mis antiguos informantes.»'
            : '«No dejes que el cónclave marque el ritmo: golpeamos donde menos vigilan.»',
          replica: { hablante: 'Héroe', texto: '«Tus dagas y mis técnicas cubren cualquier emboscada.»' }
        };
      }
      if (arq === 'elian') {
        return {
          hablante: comp,
          icono: '✨',
          texto: acto.numero >= 3
            ? '«Las runas antiguas ya responden limpias fuera del yugo de los Sabios.»'
            : '«Incluso en la espesura queda luz pura que el Óxido no ha logrado corromper.»',
          replica: { hablante: 'Héroe', texto: '«Tus barreras nos mantendrán enteros hasta cerrar la crónica.»' }
        };
      }
      if (arq === 'brenda') {
        return {
          hablante: comp,
          icono: '🪓',
          texto: '«¡Tanto rodeo de sellos y papeles! Donde entra el acero libre no queda trampa en pie.»',
          replica: { hablante: 'Héroe', texto: '«Mantén esa furia lista para el próximo élite de la ruta.»' }
        };
      }
      const lineaRowan = acto.terminado
        ? '«Quién iba a decir al salir de la aldea que acabaríamos siendo leyenda en las rutas.»'
        : (acto.numero >= 3
          ? '«Con las fraguas abiertas y medio consejo acorralado, cada paso nos acerca al juicio final.»'
          : (acto.numero === 2
            ? '«Entre fuentes arcanas y diarios ocultos, el cerco de mentiras de Elara se agrieta.»'
            : '«Brann confió en nosotros al darnos aquel primer cinturón. No le fallaremos.»'));
      return {
        hablante: comp,
        icono: '🥾',
        texto: lineaRowan,
        replica: { hablante: 'Héroe', texto: '«Sigamos la calzada; aún hay mucho por descubrir y proteger.»' }
      };
    }
    if (evento.tipo === 'hora') {
      if (evento.hora === 'night') {
        return {
          hablante: comp, icono: '🌙',
          texto: '«Cae la noche sobre el valle… mantén las pociones a mano y los ojos en las sombras.»',
          replica: { hablante: 'Héroe', texto: '«Seguiremos atentos a las antorchas de los caminos.»' }
        };
      }
      if (evento.hora === 'golden') {
        return {
          hablante: comp, icono: '🌇',
          texto: '«El cielo arde en oro; buen momento para explorar antes de que oscurezca.»',
          replica: { hablante: 'Héroe', texto: '«Aprovechemos la última luz para revisar pistas cercanas.»' }
        };
      }
      return {
        hablante: comp, icono: '☀️',
        texto: '«Amanece limpio sobre el camino. Sigamos adelante.»',
        replica: { hablante: 'Héroe', texto: '«Un día más para ganar terreno al cónclave.»' }
      };
    }
    return null;
  }

  // Bloque H2: Pistas investigables en 3D, rituales de secretos, reliquias de mazmorras/laberintos y eventos de camino
  function hashPistaStr(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
    return h;
  }

  function sumarRepHito(heroeEst, dr) {
    if (!heroeEst || !dr) return;
    heroeEst.reputacion = heroeEst.reputacion || { pueblo: 0, sombra: 0, vinculo: 0 };
    const clmp = v => Math.max(-20, Math.min(50, Math.trunc(v)));
    ['pueblo', 'sombra', 'vinculo'].forEach(k => {
      if (dr[k]) heroeEst.reputacion[k] = clmp((heroeEst.reputacion[k] || 0) + dr[k]);
    });
  }

  function pistasDeCapitulo(cap, objetivo, world) {
    if (!cap || !objetivo || objetivo.tipo !== 'matar' || !objetivo.zona || !world || !Array.isArray(world.zones)) {
      return [];
    }
    const z = world.zones.find(x => x.id === objetivo.zona);
    if (!z) return [];
    const zx = z.x || 0;
    const zz = (z.y !== undefined ? z.y : z.z) || 0;
    const R = Math.max(24, (z.radius || 100) * 0.85);
    const numCap = parseInt(String(cap.id || 'c1').replace(/\D/g, ''), 10) || 1;
    const actoIdx = numCap <= 5 ? 0 : (numCap <= 10 ? 1 : 2);
    const PLANTILLAS_PISTA = [
      [
        { icono: '🔏', nombre: 'Sello de bronce partido', lore: `Emblema del Cónclave incrustado junto a restos metálicos en ${z.name}.`, reacc: '«Este sello lleva la marca oficial de la plaza… otro indicio de su conspiración.»' },
        { icono: '🛞', nombre: 'Carreta de forja saqueada', lore: `Restos de carro con placas grabadas halladas entre la maleza de ${z.name}.`, reacc: '«Transportaban hierro militar sin declarar rumbo hacia las afueras.»' },
        { icono: '📜', nombre: 'Orden cifrada del Cónclave', lore: `Pergamino a medio arder con rutas secretas de patrullas en ${z.name}.`, reacc: '«Mira estas coordenadas… ahora sabemos dónde concentran sus fuerzas.»' }
      ],
      [
        { icono: '🧪', nombre: 'Vial de savia gris', lore: `Frasco alquímico roto cuya sustancia tiñe el suelo de ${z.name}.`, reacc: '«El mismo aceite turbio que goteaba de la túnica de Ysolde…»' },
        { icono: '🗿', nombre: 'Marca rúnica en piedra', lore: `Estela oculta en ${z.name} con glifos hacia las fuentes y altares antiguos.`, reacc: '«Esos símbolos no son suyos: pertenecen a los antiguos guardianes del reino.»' },
        { icono: '📓', nombre: 'Diario de explorador caído', lore: `Anotaciones de campo sobre los convoyes blindados de ${z.name}.`, reacc: '«Alguien pagó muy caro por dejarnos este aviso antes de caer.»' }
      ],
      [
        { icono: '⚙️', nombre: 'Núcleo de autómata fundido', lore: `Engranaje rúnico aún tibio recuperado tras las patrullas de ${z.name}.`, reacc: '«Cada pieza que apagamos debilita al coloso antes del asalto final.»' },
        { icono: '🗺️', nombre: 'Mapa de suministros al cráter', lore: `Carta logística con los envíos de mineral hacia la fortaleza norte desde ${z.name}.`, reacc: '«Sus líneas de abasto quedan al descubierto. Sigamos avanzando.»' },
        { icono: '🚩', nombre: 'Estandarte inquisitorial rasgado', lore: `Pendón calcinado de la guardia de choque en el paso de ${z.name}.`, reacc: '«Su cerco ya se resquebraja bajo nuestros pasos.»' }
      ]
    ];
    const grupo = PLANTILLAS_PISTA[actoIdx];
    const h = hashPistaStr((cap.id || 'c') + ':' + z.id);
    const ang0 = ((h % 360) * Math.PI) / 180;
    const avance = Math.max(2, Math.floor((objetivo.cantidad || 8) * 0.22));
    return grupo.map((tpl, i) => {
      const ang = ang0 + (i * Math.PI * 2) / 3;
      const rFrac = 0.28 + 0.13 * ((h >>> (i * 3)) % 3);
      return {
        id: `pista_${cap.id || 'c'}_${i}`,
        capId: cap.id || 'c',
        zona: z.id,
        idx: i,
        icono: tpl.icono,
        nombre: tpl.nombre,
        x: Math.round(zx + Math.cos(ang) * R * rFrac),
        z: Math.round(zz + Math.sin(ang) * R * rFrac),
        avance,
        lore: tpl.lore,
        reaccionRowan: tpl.reacc
      };
    });
  }

  function inspeccionarPista(heroeEst, pista) {
    if (!heroeEst || !pista) return { nueva: false, avance: 0, xp: 0, oro: 0, bonoVinculo: 0, lore: '', reaccionRowan: '' };
    heroeEst.hitosMundo = heroeEst.hitosMundo || {};
    if (heroeEst.hitosMundo[pista.id]) {
      return { nueva: false, avance: 0, xp: 0, oro: 0, bonoVinculo: 0, lore: pista.lore, reaccionRowan: pista.reaccionRowan };
    }
    heroeEst.hitosMundo[pista.id] = true;
    let cont = 0;
    for (let i = 0; i < 3; i++) {
      if (heroeEst.hitosMundo[`pista_${pista.capId}_${i}`]) cont++;
    }
    let bonoVinculo = 0;
    if (cont === 3) {
      sumarRepHito(heroeEst, { vinculo: 1 });
      bonoVinculo = 1;
    }
    return {
      nueva: true,
      avance: pista.avance || 2,
      xp: 60,
      oro: 45,
      bonoVinculo,
      completas: cont,
      lore: pista.lore,
      reaccionRowan: pista.reaccionRowan
    };
  }

  function ritualDeSecreto(secreto, cap) {
    const tipo = (secreto && (secreto.tipo || secreto.secretoTipo)) || 'fuente';
    if (tipo === 'altar') {
      return {
        tipo: 'altar',
        titulo: 'Consagración del Altar Rúnico',
        pasos: [
          { id: 'pilar-1', dx: -2.0, dz: -2.0, icono: '✨', etiqueta: 'Encender Pilar Norte-Oeste' },
          { id: 'pilar-2', dx:  2.0, dz: -2.0, icono: '✨', etiqueta: 'Encender Pilar Norte-Este' },
          { id: 'pilar-3', dx:  2.0, dz:  2.0, icono: '✨', etiqueta: 'Encender Pilar Sur-Este' }
        ],
        emboscada: false,
        textoFin: '¡Las tres runas resuenan al unísono y quiebran el sello del Cónclave!'
      };
    }
    if (tipo === 'cabana') {
      return {
        tipo: 'cabana',
        titulo: 'Registro de la Cabaña Oculta',
        pasos: [
          { id: 'baul', dx: -3.2, dz: 4.5, icono: '📦', etiqueta: 'Registrar el baúl junto al porche' },
          { id: 'diario', dx: 3.2, dz: 4.5, icono: '📖', etiqueta: 'Recuperar el diario oculto' }
        ],
        emboscada: false,
        textoFin: 'Encuentras el diario completo que delata a los cinco Sabios.'
      };
    }
    if (tipo === 'santuario') {
      return {
        tipo: 'santuario',
        titulo: 'Sintonía del Santuario de Luz',
        pasos: [
          { id: 'cristal', dx: 0, dz: 2.8, icono: '🏛️', etiqueta: 'Canalizar el Cristal del Santuario' }
        ],
        emboscada: { cantidad: 2, nombre: 'Centinela del Eclipse', nivelMin: 14 },
        textoFin: 'El cristal revela la verdad del Titán tras caer sus centinelas.'
      };
    }
    if (cap && cap.id === 'c15') {
      return {
        tipo: 'fuente',
        titulo: 'Purificación de la Fuente Arcana',
        pasos: [
          { id: 'purificar', dx: 0, dz: 2.6, icono: '💧', etiqueta: 'Purificar las aguas de la Fuente' }
        ],
        emboscada: false,
        textoFin: 'El aceite oscuro se disuelve en vapor limpio sobre las aguas sagradas.'
      };
    }
    return {
      tipo: 'fuente',
      titulo: 'Templado en la Fuente Arcana',
      pasos: [
        { id: 'sumergir', dx: 0, dz: 2.6, icono: '⛲', etiqueta: 'Sumergir las placas en la Fuente' }
      ],
      emboscada: { cantidad: 2, nombre: 'Inquisidor de la Fuente', nivelMin: 5 },
      textoFin: 'Las hombreras absorben el fulgor arcano tras repeler a los inquisidores.'
    };
  }

  function recompensaReliquiaHistoria(tipo, id, nombre, heroeEst, world) {
    const esMaz = tipo === 'mazmorra';
    const key = (esMaz ? 'dun_' : 'lab_') + String(id || 'desconocida');
    if (!heroeEst || typeof heroeEst !== 'object') {
      return { primeraVez: false, key, avance: 0, puntos: 0, deltaRep: null, texto: '', reaccionRowan: '' };
    }
    heroeEst.hitosMundo = heroeEst.hitosMundo || {};
    if (heroeEst.hitosMundo[key]) {
      return { primeraVez: false, key, avance: 0, puntos: 0, deltaRep: null, texto: '', reaccionRowan: '' };
    }
    heroeEst.hitosMundo[key] = true;
    const nom = nombre || (esMaz ? 'la mazmorra' : 'el laberinto');
    if (esMaz) {
      const deltaRep = { pueblo: 2, sombra: 0, vinculo: 2 };
      sumarRepHito(heroeEst, deltaRep);
      heroeEst.puntos = (heroeEst.puntos || 0) + 1;
      return {
        primeraVez: true,
        key,
        avance: 6,
        puntos: 1,
        deltaRep,
        texto: `Cripta purgada: los archivos recuperados de ${nom} debilitan al Cónclave (+2 Pueblo · +2 Vínculo · +1 🧬).`,
        reaccionRowan: `«¡Lo que ocultaban en ${nom} basta para hacer temblar a los Sabios!»`
      };
    }
    const deltaRep = { pueblo: 1, sombra: 0, vinculo: 1 };
    sumarRepHito(heroeEst, deltaRep);
    return {
      primeraVez: true,
      key,
      avance: 4,
      puntos: 0,
      deltaRep,
      texto: `Reliquia de laberinto asegurada en ${nom} (+1 Pueblo · +1 Vínculo).`,
      reaccionRowan: `«Esta reliquia de ${nom} nos acerca un paso más al final de la conspiración.»`
    };
  }

  function generarEventoCamino(pos, dir, world, heroeEst, rng) {
    const r = typeof rng === 'function' ? rng : Math.random;
    const dx = dir && isFinite(dir.x) ? dir.x : 1;
    const dz = dir && isFinite(dir.z) ? dir.z : 0;
    const len = Math.hypot(dx, dz) || 1;
    const px = ((pos && pos.x) || 0) + (dx / len) * 26;
    const pz = ((pos && pos.z) || 0) + (dz / len) * 26;
    const tipos = ['viajero', 'emboscada', 'cofre_conclave'];
    const tipo = tipos[Math.floor(r() * tipos.length) % tipos.length];
    const id = `ev_${tipo}_${Math.floor(r() * 1000000)}`;
    const paso = (heroeEst && heroeEst.principal && typeof heroeEst.principal.paso === 'number') ? heroeEst.principal.paso : 0;
    const nivel = Math.max(2, Math.min(20, 2 + paso));

    if (tipo === 'emboscada') {
      return {
        id,
        tipo,
        x: Math.round(px),
        z: Math.round(pz),
        icono: '⚔️',
        titulo: 'Emboscada de Patrulla del Cónclave',
        desc: '¡Guardias del Eclipse salen de la cuneta para interceptarte!',
        oleada: { cantidad: 2, nombre: 'Patrullero del Eclipse', nivel },
        premio: { oro: 120, xp: 150, arena: 2, avance: 2 },
        deltaRep: { pueblo: 1, sombra: 0, vinculo: 1 },
        reaccionRowan: '«¡Cuidado en el camino, nos cortan el paso!»'
      };
    }
    if (tipo === 'cofre_conclave') {
      return {
        id,
        tipo,
        x: Math.round(px),
        z: Math.round(pz),
        icono: '🧰',
        titulo: 'Arcón Sellado del Cónclave',
        desc: 'Un arcón de suministros caído de un convoy yace junto al sendero.',
        opciones: [
          {
            id: 'repartir',
            etiqueta: '🛡️ Enviar los suministros a la aldea (+2 Pueblo · +110 🪙 · +80 EXP)',
            deltaRep: { pueblo: 2, sombra: 0, vinculo: 0 },
            premio: { oro: 110, xp: 80, avance: 2 },
            texto: 'Entregas el sello a los arrieros de la aldea más cercana.',
            reaccionRowan: '«Las familias del valle agradecerán esos víveres más que nadie.»'
          },
          {
            id: 'saquear',
            etiqueta: '🌘 Forzar el candado y quedarnos el botín (+2 Sombra · +220 🪙 · +2 🧱)',
            deltaRep: { pueblo: 0, sombra: 2, vinculo: 0 },
            premio: { oro: 220, arena: 2 },
            texto: 'Fuerzas la cerradura rúnica y guardas monedas y arena de forja.',
            reaccionRowan: '«Bien equipado pesa menos la carretera… aunque el cónclave notará la falta.»'
          }
        ],
        reaccionRowan: '«Mira junto al camino: ¡un arcón con el emblema del cónclave!»'
      };
    }
    return {
      id,
      tipo: 'viajero',
      x: Math.round(px),
      z: Math.round(pz),
      icono: '🩹',
      titulo: 'Arriero Herido en la Calzada',
      desc: 'Un mensajero cojeando pide ayuda tras esquivar a las bestias de la ruta.',
      opciones: [
        {
          id: 'ayudar',
          etiqueta: '🛡️ Escoltarlo y compartir víveres (+2 Pueblo · +1 Vínculo · +120 🪙 · +90 EXP)',
          deltaRep: { pueblo: 2, sombra: 0, vinculo: 1 },
          premio: { oro: 120, xp: 90, avance: 2 },
          texto: 'Aseguras su carreta y te entrega su bolsa de gratitud e información del camino.',
          reaccionRowan: '«Un buen gesto abre más puertas que diez salvoconductos.»'
        },
        {
          id: 'interrogar',
          etiqueta: '🌘 Exigirle el paso franco y sus cartas (+2 Sombra · +140 🪙)',
          deltaRep: { pueblo: 0, sombra: 2, vinculo: 0 },
          premio: { oro: 140, mana: 1 },
          texto: 'El arriero vacía su alforja por miedo antes de escabullirse camino abajo.',
          reaccionRowan: '«Duro trato, pero tenemos oro y un frasco de maná más para el viaje.»'
        }
      ],
      reaccionRowan: '«¡Espera! Hay un viajero herido pidiendo auxilio más adelante.»'
    };
  }

  function resolverEventoCamino(heroeEst, evento, opcionId) {
    if (!heroeEst || !evento) return { yaResuelto: false, texto: '', premio: {}, deltaRep: null, reaccionRowan: '' };
    heroeEst.hitosMundo = heroeEst.hitosMundo || {};
    const evKey = evento.id || ('ev_' + evento.tipo);
    if (heroeEst.hitosMundo[evKey]) {
      return { yaResuelto: true, texto: '', premio: {}, deltaRep: null, reaccionRowan: '' };
    }
    heroeEst.hitosMundo[evKey] = true;
    if (evento.tipo === 'emboscada') {
      sumarRepHito(heroeEst, evento.deltaRep);
      return {
        yaResuelto: false,
        texto: 'Patrulla del Cónclave neutralizada en la calzada.',
        premio: evento.premio || {},
        deltaRep: evento.deltaRep || null,
        reaccionRowan: '«Camino despejado. Ya no molestarán a ninguna caravana aquí.»'
      };
    }
    const opt = (evento.opciones || []).find(o => o.id === opcionId) || (evento.opciones && evento.opciones[0]);
    if (!opt) return { yaResuelto: false, texto: '', premio: {}, deltaRep: null, reaccionRowan: '' };
    sumarRepHito(heroeEst, opt.deltaRep);
    return {
      yaResuelto: false,
      opcion: opt,
      texto: opt.texto || '',
      premio: opt.premio || {},
      deltaRep: opt.deltaRep || null,
      reaccionRowan: opt.reaccionRowan || ''
    };
  }

  // Bloque H3: Códice de Investigación (personajes sospechosos/aliados, pistas e hitos, decisiones)
  const PERSONAJES_CODICE = [
    { id: 'guru-1', nombre: 'Sabia Elara', icono: '🔮', faccion: 'Cónclave de los Siete' },
    { id: 'guru-2', nombre: 'Maestro Oren', icono: '🧭', faccion: 'Maestres de Rutas' },
    { id: 'guru-3', nombre: 'Hermana Ysolde', icono: '🕯️', faccion: 'Orden Rúnica' },
    { id: 'guru-4', nombre: 'Viejo Tamsin', icono: '🗡️', faccion: 'Viejos Guardianes' },
    { id: 'guru-5', nombre: 'Erudita Mirel', icono: '📜', faccion: 'Cronistas del Reino' },
    { id: 'serv-herrero', nombre: 'Herrero Brann', icono: '🔨', faccion: 'Fragua Libre' },
    { id: 'companero-rowan', nombre: 'Rowan y la Cuadrilla', icono: '🛡️', faccion: 'Compañeros de Camino' },
    { id: 'serv-comandante', nombre: 'Comandante Kaelen', icono: '🏰', faccion: 'Guardia de la Plaza' },
    { id: 'serv-hereje', nombre: 'Herrero Hereje', icono: '🌒', faccion: 'Talleres de la Sombra' },
    { id: 'serv-boticaria', nombre: 'Boticaria e Informante', icono: '🧪', faccion: 'Alquimia y Bajos Fondos' }
  ];

  function codicePersonajes(heroeEst, world) {
    const p = (heroeEst && heroeEst.principal) ? heroeEst.principal : { paso: 0 };
    const paso = p.paso || 0;
    const dec = (heroeEst && heroeEst.decisiones) || {};
    const rep = (heroeEst && heroeEst.reputacion) || {};
    const finalId = heroeEst && heroeEst.finalId;
    const hitos = (heroeEst && heroeEst.hitosMundo) || {};
    const compM = (heroeEst && heroeEst.companeroMisiones) || {};
    const nTalentos = Object.values(compM).filter(x => x && x.talentoDesbloqueado).length;
    const nPistasC1 = [0, 1, 2].filter(i => hitos[`pista_c1_${i}`]).length;
    const dunCount = Object.keys(hitos).filter(k => k.startsWith('dun_')).length;

    return PERSONAJES_CODICE.map(base => {
      let estadoId = 'neutral';
      let estadoEtiqueta = 'Sin confirmar';
      let color = '#94a3b8';
      let sospecha = 25;
      let resumen = '';
      const notas = [];

      if (base.id === 'guru-1') {
        if (paso >= 16 || finalId) {
          estadoId = 'juzgado';
          estadoEtiqueta = finalId === 'sombra' ? 'Juzgada · Sometida al Eclipse' : (finalId === 'equilibrio' ? 'Juzgada · Depuesta ante el Pacto' : 'Juzgada · Condenada en la Plaza');
          color = '#a855f7';
          sospecha = 100;
          resumen = 'Cabeza visible del cónclave tras el proyecto del Titán y el sellado de forjas.';
        } else if (paso >= 6) {
          estadoId = 'culpable';
          estadoEtiqueta = paso >= 9 ? 'Culpable Incriminada' : 'Principal Sospechosa';
          color = '#ef4444';
          sospecha = paso >= 9 ? 100 : 85;
          resumen = paso >= 9
            ? 'El diario del ermitaño en la cabaña y las jaulas sumergidas confirman su implicación directa.'
            : 'Os envió a una Fuente Arcana rodeada de trampas con el sello oficial del Consejo.';
        } else if (paso >= 4) {
          estadoId = 'sospechoso';
          estadoEtiqueta = 'Sospechosa (Vigilancia Espectral)';
          color = '#f97316';
          sospecha = 70;
          resumen = 'Su proyección espectral vigila vuestro despertar sísmico desde la torre del consejo.';
        } else {
          estadoId = 'sospechoso';
          estadoEtiqueta = 'Sospechosa en la Plaza';
          color = '#facc15';
          sospecha = 45 + nPistasC1 * 5;
          resumen = 'Mantiene el control oficial mientras las bestias atacan con sellos de bronce del cónclave.';
        }
        notas.push('Sello de bronce hallado junto a Brann en el prólogo.');
        if (paso >= 4) notas.push('Vigiló tu técnica del Impacto Sísmico por proyección.');
        if (paso >= 6) notas.push('Ordenó sumergir jaulas con aceite oscuro bajo la Fuente Arcana.');
        if (paso >= 9) notas.push('Su firma aparece en los cuadernos secretos de la cabaña fronteriza.');
      } else if (base.id === 'guru-2') {
        if (paso >= 11) {
          estadoId = 'aliado';
          estadoEtiqueta = 'Aliado del Libre Comercio';
          color = '#4ade80';
          sospecha = 0;
          resumen = 'Consagró contigo el Altar Rúnico para reabrir rutas y fraguas superiores (Nv. 12+).';
        } else if (paso >= 6) {
          estadoId = 'observado';
          estadoEtiqueta = 'Colaborador Discreto';
          color = '#38bdf8';
          sospecha = 25;
          resumen = 'Desvía mapas e inspecciones lejos de tus suministros de hierro salvaje.';
        } else {
          estadoId = 'sospechoso';
          estadoEtiqueta = 'Evasivo en la Plaza';
          color = '#facc15';
          sospecha = 50;
          resumen = 'Teme represalias del consejo si habla abiertamente en la muralla.';
        }
        notas.push('Conoce todas las rutas seguras y vetas libres de mineral.');
        if (paso >= 11) notas.push('Participó activamente en la ruptura del monopolio.');
      } else if (base.id === 'guru-3') {
        if (paso >= 16) {
          estadoId = finalId === 'equilibrio' ? 'aliado' : 'disidente';
          estadoEtiqueta = finalId === 'equilibrio' ? 'Aliada · Custodia de Altares' : 'Disidente Reformada';
          color = '#4ade80';
          sospecha = 10;
          resumen = 'Abandonó los dogmas del cónclave para devolver la magia antigua al reino libre.';
        } else if (paso >= 8) {
          estadoId = 'disidente';
          estadoEtiqueta = 'Disidente del Cónclave';
          color = '#38bdf8';
          sospecha = 20;
          resumen = 'Rompió la disciplina del consejo liberando el sello de la Explosión Nova.';
        } else {
          estadoId = 'sospechoso';
          estadoEtiqueta = 'Sospechosa (Savia Gris)';
          color = '#f97316';
          sospecha = 75;
          resumen = 'Murmura cánticos en trance mientras gotea aceite alquímico de sus túnicas.';
        }
        notas.push('Vigilada por manchas de savia gris en Acto I.');
        if (paso >= 8) notas.push('Liberó el conocimiento real de la Explosión Nova.');
        if (paso >= 10) notas.push('Rompió votos abiertamente para abrir paso hacia las cumbres.');
      } else if (base.id === 'guru-4') {
        if (paso >= 14) {
          estadoId = 'aliado';
          estadoEtiqueta = 'Aliado Veterano';
          color = '#4ade80';
          sospecha = 0;
          resumen = 'Desenfundó su mandoble para combatir contigo contra el Titán mecánico.';
        } else if (paso >= 4) {
          estadoId = 'aliado';
          estadoEtiqueta = 'Mentor Clandestino';
          color = '#38bdf8';
          sospecha = 5;
          resumen = 'Te instruyó en el Impacto Sísmico y te guió hacia el diario incriminatorio.';
        } else {
          estadoId = 'observado';
          estadoEtiqueta = 'Testigo Reservado';
          color = '#94a3b8';
          sospecha = 20;
          resumen = 'Observa desde las sombras de la taberna buscando quién se atreva a resistir.';
        }
        notas.push('Conoce el origen de las placas remachadas desde hace veinte años.');
        if (paso >= 9) notas.push('Marcó las pistas hacia la cabaña del guarda ejecutado.');
      } else if (base.id === 'guru-5') {
        if (paso >= 16) {
          estadoId = 'aliado';
          estadoEtiqueta = 'Aliada · Cronista del Juicio';
          color = '#4ade80';
          sospecha = 0;
          resumen = 'Preside la lectura pública de actas que sella vuestra gesta en la Crónica.';
        } else if (paso >= 11) {
          estadoId = 'aliado';
          estadoEtiqueta = 'Aliada en Investigación';
          color = '#38bdf8';
          sospecha = 15;
          resumen = 'Reúne testimonios y envíos desaparecidos para sostener el juicio en la plaza.';
        } else {
          estadoId = 'sospechoso';
          estadoEtiqueta = 'Analítica y Distante';
          color = '#facc15';
          sospecha = 45;
          resumen = 'Registra hechos sin tomar partido abierto hasta ver pruebas tangibles.';
        }
        notas.push('Advirtió contra la influencia mental del Óxido.');
        if (dunCount > 0) notas.push(`Ha catalogado ${dunCount} archivo(s) de criptas purgadas.`);
      } else if (base.id === 'serv-herrero') {
        estadoId = 'aliado';
        estadoEtiqueta = paso >= 11 ? 'Aliado · Forja Superior Libre' : 'Aliado Clandestino';
        color = '#4ade80';
        sospecha = 0;
        resumen = paso >= 11
          ? 'Tras caer el monopolio, su yunque forja armamento superior sin censura eclesial.'
          : 'Sobrevivió a la emboscada del prólogo y forja en secreto tu equipo pieza a pieza.';
        notas.push('Primer aliado desde la emboscada inicial.');
      } else if (base.id === 'companero-rowan') {
        estadoId = 'aliado';
        estadoEtiqueta = nTalentos > 0 ? `Hermandad (${nTalentos} talento/s único/s)` : 'Compañero Leal';
        color = '#38bdf8';
        sospecha = 0;
        resumen = `Vínculo actual: ${rep.vinculo || 0}. Cada etapa personal junto a Rowan, Lyra, Elian o Brenda refuerza su historial y poder.`;
        notas.push(paso >= 8 ? 'En Cap. 8 sus ojos brillaron con un misterioso halo ámbar.' : 'Te cubre el flanco desde el estallido en la fragua.');
        if (paso >= 14) notas.push('Desvió con su escudo el golpe mortal del Señor de las Bestias.');
      } else if (base.id === 'serv-comandante') {
        if (dec.d_c2_lista === 'guardia' || paso >= 11 || (rep.pueblo || 0) >= 6) {
          estadoId = 'aliado';
          estadoEtiqueta = paso >= 11 ? 'Aliado · Guarnición Libre' : 'Aliado en la Guardia';
          color = '#4ade80';
          sospecha = 5;
          resumen = 'Kaelen conoce las órdenes falsificadas del cónclave y despeja las patrullas de tus pasos.';
        } else if (dec.d_c2_lista === 'informante' && (rep.sombra || 0) > (rep.pueblo || 0)) {
          estadoId = 'hostil';
          estadoEtiqueta = 'Receloso / Bajo Sospecha';
          color = '#f97316';
          sospecha = 60;
          resumen = 'Tus tratos en los bajos fondos despiertan las alarmas de la guardia oficial.';
        } else {
          estadoId = 'neutral';
          estadoEtiqueta = 'Neutral (Disciplina Oficial)';
          color = '#94a3b8';
          sospecha = 35;
          resumen = 'Cumple órdenes selladas de plaza mientras busca pruebas concretas de la traición.';
        }
        if (dec.d_c2_lista) notas.push(`Decisión Cap. 2 registrada: elegiste "${dec.d_c2_lista}".`);
      } else if (base.id === 'serv-hereje') {
        if ((rep.sombra || 0) >= 4 || dec.d_c11_monopolio === 'oscuro') {
          estadoId = 'sombra';
          estadoEtiqueta = 'Socio en la Sombra';
          color = '#c084fc';
          sospecha = 30;
          resumen = 'Graba runas oscuras de alto filo sin preguntar por las leyes de la plaza.';
        } else {
          estadoId = 'neutral';
          estadoEtiqueta = 'Forjador Proscrito';
          color = '#94a3b8';
          sospecha = 45;
          resumen = 'Desterrado por el consejo; ofrece encantamientos agresivos lejos de Brann.';
        }
        notas.push('Desterrado por desafiar el sello único de los Sabios.');
      } else {
        if (paso >= 6 || dec.d_c2_lista === 'informante') {
          estadoId = 'informado';
          estadoEtiqueta = 'Red Activa de Indicios';
          color = '#38bdf8';
          sospecha = 25;
          resumen = 'Varek rastrea envíos clandestinos y la Boticaria analiza la savia gris hallada en templos.';
        } else {
          estadoId = 'neutral';
          estadoEtiqueta = 'Informadores Locales';
          color = '#94a3b8';
          sospecha = 35;
          resumen = 'Sus espías y destilados ofrecen ventaja en rutas si sabes qué preguntar.';
        }
        notas.push('Sus pistas del mercado negro complementan los diarios oficiales.');
      }

      return {
        id: base.id,
        nombre: base.nombre,
        icono: base.icono,
        faccion: base.faccion,
        estadoId,
        estadoEtiqueta,
        color,
        sospecha,
        resumen,
        notasDesbloqueadas: notas
      };
    });
  }

  function codiceInvestigacion(heroeEst, world) {
    const caps = capitulosDe(world);
    const p = (heroeEst && heroeEst.principal) ? heroeEst.principal : { paso: 0 };
    const paso = p.paso || 0;
    const hitos = (heroeEst && heroeEst.hitosMundo) || {};

    const pistas = [];
    const rituales = [];
    caps.forEach((cap, idx) => {
      if (cap.mision && cap.mision.tipo === 'matar' && world && Array.isArray(world.zones)) {
        const obj = resolverObjetivo(cap, world);
        if (obj && obj.tipo === 'matar' && obj.zona) {
          pistasDeCapitulo(cap, obj, world).forEach(pi => {
            pistas.push({
              id: pi.id,
              capNum: idx + 1,
              capId: cap.id,
              capTitulo: cap.titulo,
              icono: pi.icono,
              nombre: pi.nombre,
              lore: pi.lore,
              encontrada: !!hitos[pi.id]
            });
          });
        }
      } else if (cap.mision && cap.mision.tipo === 'secreto') {
        const completado = idx < paso;
        const obj = world ? resolverObjetivo(cap, world) : { nombre: cap.mision.secreto };
        rituales.push({
          id: cap.id,
          capNum: idx + 1,
          titulo: cap.titulo,
          tipoSecreto: cap.mision.secreto,
          completado,
          detalle: completado ? rellenar(cap.texto, obj) : 'Ritual pendiente de activar sobre el terreno.'
        });
      }
    });

    const reliquias = { mazmorras: [], laberintos: [] };
    const vistosKeys = new Set();
    if (world && Array.isArray(world.dungeons)) {
      world.dungeons.forEach(d => {
        const k = 'dun_' + String(d.id || d.name || 'd');
        vistosKeys.add(k);
        reliquias.mazmorras.push({ key: k, nombre: d.name || d.id, completada: !!hitos[k] });
      });
    }
    if (world && Array.isArray(world.zones)) {
      world.zones.filter(z => z.relieve && z.relieve.activo).forEach(z => {
        const k = 'lab_' + String(z.id || 'z');
        vistosKeys.add(k);
        reliquias.laberintos.push({ key: k, nombre: z.name || z.id, completada: !!hitos[k] });
      });
    }
    Object.keys(hitos).forEach(k => {
      if (!hitos[k] || vistosKeys.has(k)) return;
      if (k.startsWith('dun_')) reliquias.mazmorras.push({ key: k, nombre: k.slice(4), completada: true });
      else if (k.startsWith('lab_')) reliquias.laberintos.push({ key: k, nombre: k.slice(4), completada: true });
    });

    const eventos = Object.keys(hitos).filter(k => k.startsWith('ev_') && hitos[k]);
    return {
      pistas,
      rituales,
      reliquias,
      eventos,
      resumen: {
        pistasHalladas: pistas.filter(x => x.encontrada).length,
        pistasTotal: pistas.length,
        ritualesHechos: rituales.filter(x => x.completado).length,
        ritualesTotal: rituales.length,
        mazmorras: reliquias.mazmorras.filter(x => x.completada).length,
        mazmorrasTotal: reliquias.mazmorras.length,
        laberintos: reliquias.laberintos.filter(x => x.completada).length,
        laberintosTotal: reliquias.laberintos.length,
        eventosResueltos: eventos.length
      }
    };
  }

  function codiceDecisiones(heroeEst, world) {
    const caps = capitulosDe(world);
    const p = (heroeEst && heroeEst.principal) ? heroeEst.principal : { paso: 0 };
    const paso = p.paso || 0;
    const decisiones = (heroeEst && heroeEst.decisiones) || {};
    const rep = (heroeEst && heroeEst.reputacion) || {};
    const pueblo = Number(rep.pueblo) || 0;
    const sombra = Number(rep.sombra) || 0;
    const senda = pueblo >= sombra + 2 ? 'guardia' : (sombra >= pueblo + 2 ? 'sombra' : 'equilibrio');
    const sendaNombre = senda === 'guardia' ? 'Senda del Alba' : (senda === 'sombra' ? 'Senda de la Sombra' : 'Senda del Equilibrio');

    const nums = Object.keys(DECISIONES_CAPITULO).map(Number).sort((a, b) => a - b);
    const lista = nums.map(capNum => {
      const dec = DECISIONES_CAPITULO[capNum];
      const cap = caps[capNum - 1];
      const eid = decisiones[dec.id];
      const opt = eid ? (dec.opciones || []).find(o => o.id === eid) || null : null;
      const estado = opt ? 'decidida' : (paso >= capNum ? 'pendiente' : 'bloqueada');
      return {
        capNum,
        id: dec.id,
        titulo: (cap && cap.titulo) || ('Capítulo ' + capNum),
        pregunta: dec.pregunta,
        contexto: dec.contexto,
        estado,
        opcionElegida: opt ? { id: opt.id, etiqueta: opt.etiqueta, tendencia: opt.tendencia } : null,
        consecuencia: opt ? opt.consecuencia : null
      };
    });

    return {
      lista,
      decididas: lista.filter(x => x.estado === 'decidida').length,
      total: lista.length,
      epilogo: epilogoDe(heroeEst, world),
      senda,
      sendaNombre
    };
  }

  const api = {
    CAPITULOS,
    ACTOS,
    HITOS_NARRATIVOS,
    MATERIALES_FORJA,
    DIALOGOS_NPC,
    DECISIONES_CAPITULO,
    EPILOGOS_FINALES,
    PERSONAJES_CODICE,
    capitulosDe,
    actosDe,
    hitosDe,
    dialogosDe,
    prologoDe,
    generarHistoriaParaMundo,
    nuevaPrincipal,
    terminada,
    capituloActual,
    contados,
    actoActual,
    hitoDeCapituloCompletado,
    monopolioRoto,
    materialDeCapitulo,
    fraseContextualNpc,
    decisionDeCapitulo,
    aplicarDecision,
    epilogoDe,
    dialogoInteractivoNpc,
    resolverOpcionDialogo,
    subtituloVivo,
    codicePersonajes,
    codiceInvestigacion,
    codiceDecisiones,
    pistasDeCapitulo,
    inspeccionarPista,
    ritualDeSecreto,
    recompensaReliquiaHistoria,
    generarEventoCamino,
    resolverEventoCamino,
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
