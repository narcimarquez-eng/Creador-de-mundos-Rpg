/*
 * acompanante.js — Sistema de acompañante aldeano para el Visor del Mundo.
 *
 * El aldeano Rowan es un explorador novato vestido con ropas básicas de cuero,
 * cinturón de hebilla y botas de viaje (diseño acorde al catálogo del Estudio de Armaduras).
 * Sigue al héroe en formación táctica sin estorbar, asiste activamente en combate contra
 * las bestias del mapa, comenta al descubrir lugares secretos y reacciona al mundo.
 *
 * Expone window.AcompananteLib (o module.exports para tests en Node).
 */
(function (root) {
  "use strict";

  // Configuración de equipamiento básico de cuero del aldeano (equivalente al Estudio de Armaduras)
  const EQUIPO_ALDEANO = {
    nombre: 'Rowan',
    rol: 'Aldeano Explorador',
    underlayer: 'Cuero Oscuro Articulado',
    torso: 'Jubón de Cuero Curtido con Refuerzos',
    belt: 'Cinturón de Brigantina con Hebilla de Bronce',
    boots: 'Botas de Cuero de Viaje con Puntera Reforzada',
    gloves: 'Guanteletes Ligeros de Cuero',
    weapon: 'Espada Corta de Acero y Madera',
    helmet: null // Rostro descubierto de aldeano
  };

  // Frases contextuales del aldeano Rowan
  const FRASES = {
    secreto_fuente: [
      '¡Mira allí! ¡El agua de esa fuente brilla con luz propia!',
      '¡Increíble! Una fuente arcana perdida en la espesura. Dicen que sus aguas curan el cansancio.',
      'Las leyendas de los ancianos eran ciertas... ¡La fuente sigue manando energía pura!'
    ],
    secreto_cabana: [
      '¡Una cabaña oculta entre la maleza! ¿Quién habrá vivido aquí tan lejos de las murallas?',
      'Huele a leña vieja y pergaminos... Alguien se refugió en esta cabaña hace mucho tiempo.',
      '¡Cuidado al entrar! Este refugio de ermitaño podría guardar provisiones o trampas.'
    ],
    secreto_altar: [
      '¡Siento una vibración en el suelo! Es un altar rúnico de los primeros reyes.',
      'Las runas de esos monolitos coinciden con las de la muralla de la aldea...',
      '¡Qué arquitectura tan imponente! Los sabios darían cualquier cosa por ver este altar.'
    ],
    secreto_santuario: [
      '¡Por todos los cielos! ¡El santuario de los siete reinos! Jamás vi nada tan majestuoso.',
      'Los pilares de luz siguen activos después de tantos siglos... ¡Qué hallazgo tan colosal!',
      '¡Lo hemos logrado! La historia del pueblo se escribió bajo estos mismos arcos de piedra.'
    ],
    combate_inicio: [
      '¡Cuidado, bestias al frente! ¡Te cubro la espalda!',
      '¡Por la aldea! ¡No dejaré que te rodeen!',
      '¡Saca el acero, que vienen con hambre!'
    ],
    monstruo_duro: [
      '¡Atento, esta criatura tiene una vitalidad y salud enormes! ¡Usa tus habilidades y combínalas con mis dopes!',
      '¡Vaya resistencia! Su barra de vida es descomunal: ¡no bajes la guardia y esquiva sus zarpazos!',
      '¡Es una bestia colosal! Yo potenciaré tu ataque mientras tú buscas su punto débil.'
    ],
    salud_baja: [
      '¡Cuidado, camarada! Tu salud está peligrosamente baja. ¡Usa una poción o retrocede un momento!',
      '¡Aguanta, no caigas! ¡Toma una poción de vida antes del siguiente golpe!',
      '¡Peligro! Tu barra de vida flaquea. ¡Aléjate mientras yo entretengo al monstruo!'
    ],
    guia_camino: [
      '¡Mantén el rumbo! El sabio nos indicó la dirección y los senderos de piedra nos llevarán a salvo.',
      'Si te sientes desorientado, pregúntame en cualquier momento y te señalaré hacia dónde ir.',
      'Caminar a tu lado me hace sentir seguro. ¿Seguimos hacia nuestro objetivo?'
    ],
    charla_inicial: [
      '¡Por fin en marcha! No seremos más simples aldeanos: salvaremos las comarcas de Aden.',
      'Los sabios nos observan desde la muralla. Demostremos de qué pasta estamos hechos.',
      'Mi espada corta y mis dopes marciales están listos. ¡Dime a dónde vamos y te seguiré!'
    ],
    combate_victoria: [
      '¡Bien peleado! Una bestia menos que amenace los caminos.',
      '¡Qué golpe! Vas dominando el combate a la perfección.',
      'Despejado por ahora... Recuperemos el aliento y sigamos.'
    ],
    ambiente: [
      'El camino es largo, pero a tu lado me siento como un verdadero héroe.',
      'Mis botas de cuero están llenas de barro, pero vale la pena cada paso.',
      '¿Hacia qué rincón del mapa nos dirigiremos ahora?'
    ]
  };

  function elegirFrase(categoria) {
    const lista = FRASES[categoria] || FRASES.ambiente;
    return lista[Math.floor(Math.random() * lista.length)];
  }

  // Calcula distancia euclídea y dirección cardinal (Norte, Sur, Este, Oeste, etc.) hacia un destino
  function calcularDireccionYDistancia(origen, destino) {
    if (!origen || !destino) return { dist: 0, dir: 'Norte' };
    const ox = (typeof origen.x === 'number') ? origen.x : 0;
    const oz = (typeof origen.z === 'number') ? origen.z : ((typeof origen.y === 'number') ? origen.y : 0);
    const dx = ((typeof destino.x === 'number') ? destino.x : 0) - ox;
    const dz = ((typeof destino.z === 'number') ? destino.z : ((typeof destino.y === 'number') ? destino.y : 0)) - oz;
    const dist = Math.round(Math.hypot(dx, dz));

    let dir = 'Norte';
    if (Math.abs(dx) > Math.abs(dz) * 1.5) {
      dir = dx > 0 ? 'Este' : 'Oeste';
    } else if (Math.abs(dz) > Math.abs(dx) * 1.5) {
      dir = dz > 0 ? 'Sur' : 'Norte';
    } else {
      const ns = dz > 0 ? 'Sur' : 'Norte';
      const eo = dx > 0 ? 'este' : 'oeste';
      dir = `${ns}${eo}`;
    }
    return { dist, dir };
  }

  // Genera un consejo contextual de guía donde el acompañante te dice dónde ir y te advierte de los monstruos
  function darConsejoGuia(acompanante, destino, heroePos, heroeInfo) {
    if (!acompanante) return '';
    const nomComp = acompanante.nombre || 'Rowan';
    if (!destino) {
      return `${nomComp}: «Hemos cumplido con los objetivos por ahora. ¡Vayamos a la plaza del pueblo inicial a hablar con los sabios para nuevas órdenes!»`;
    }

    const { dist, dir } = calcularDireccionYDistancia(heroePos, destino);
    const nomObj = destino.nombre || 'nuestro objetivo';

    let consejo = '';
    if (dist <= 18) {
      consejo = `«¡Ya estamos en ${nomObj}! Desenvaina y mantén la guardia alta: las bestias de esta zona poseen una vitalidad y dureza descomunales. ¡Lucharemos espalda contra espalda!»`;
    } else {
      consejo = `«Camarada, debemos marchar hacia «${nomObj}». Queda hacia el ${dir}, a unos ${dist} metros. Sigamos las calzadas empedradas: yo te cubriré las espaldas con mis dopes de combate.»`;
    }

    if (heroeInfo && heroeInfo.hp && heroeInfo.maxHp && (heroeInfo.hp < heroeInfo.maxHp * 0.40)) {
      consejo += ` ¡Por cierto, tu salud está algo baja (${Math.round(heroeInfo.hp)} / ${heroeInfo.maxHp} HP)! Bebe una poción antes de entablar combate.`;
    }

    return `${nomComp}: ${consejo}`;
  }

  const MAX_SLOTS_INVENTARIO = 20;

  // Catálogo de los 4 Compañeros de Camino seleccionables con roles y habilidades diferenciadas
  // El tiempo de espera (cooldown) es estrictamente mayor que la duración del efecto (cd > duracion),
  // calibrado en función del impacto e importancia de cada habilidad.
  const COMPANEROS = {
    rowan: {
      id: 'rowan',
      nombre: 'Rowan el Guardián',
      titulo: 'Especialista en Dopes de Ataque',
      icono: '⚔️',
      avatar: '🧑‍🌾',
      rol: 'Guardián del Aliento (Buffer Ofensivo)',
      desc: 'Aldeano fornido que inspira fervor en el combate. Proporciona dopes continuos de ataque, velocidad y motivación marcial a ambos héroes.',
      hp: 180,
      dano: 24,
      defensa: 14,
      modeloGLB: 'npc/aldeanos/aldeano.glb',
      skillsCatalogo: [
        { id: 'grito', nombre: 'Grito de Aliento', icono: '⚔️', tipo: 'buff', nivel: 1, maxNivel: 5, cd: 22, timer: 0, duracion: 10, potencia: 25, desc: '+{potencia}% daño de ataque a ambos por {duracion}s' },
        { id: 'impetu', nombre: 'Golpe de Ímpetu', icono: '💥', tipo: 'ataque', nivel: 1, maxNivel: 5, cd: 12, timer: 0, potencia: 38, desc: 'Golpe demoledor que inflige {potencia} de daño contundente' },
        { id: 'fervor', nombre: 'Fervor Bélico', icono: '🔥', tipo: 'buff', nivel: 1, maxNivel: 5, cd: 20, timer: 0, duracion: 8, potencia: 30, desc: '+{potencia}% velocidad y ritmo de ataque por {duracion}s' },
        { id: 'partesuelos', nombre: 'Hendedura Letal', icono: '🪓', tipo: 'debuff', nivel: 1, maxNivel: 5, cd: 16, timer: 0, duracion: 6, potencia: 20, desc: 'Debilita al objetivo reduciendo su defensa un {potencia}% por {duracion}s' }
      ],
      skillsEquipadas: ['grito', 'impetu', 'fervor']
    },
    lyra: {
      id: 'lyra',
      nombre: 'Lyra de las Sombras',
      titulo: 'Pícara Asesina con Dagas',
      icono: '🗡️',
      avatar: '🧝‍♀️',
      rol: 'DPS Rápido con Dagas (Críticos & Sangrado)',
      desc: 'Ágil y escurridiza cazadora de las sombras. Ataca a velocidad vertiginosa con dos dagas causando tajos críticos continuos y sangrado mortal.',
      hp: 145,
      dano: 34,
      defensa: 10,
      modeloGLB: 'npc/aldeanos/aldeano.glb',
      skillsCatalogo: [
        { id: 'danza_dagas', nombre: 'Danza de Dagas', icono: '🗡️', tipo: 'ataque', nivel: 1, maxNivel: 5, cd: 10, timer: 0, potencia: 46, desc: 'Ráfaga de tres estocadas rápidas que inflige {potencia} daño crítico' },
        { id: 'veneno', nombre: 'Veneno Letal', icono: '🧪', tipo: 'buff', nivel: 1, maxNivel: 5, cd: 18, timer: 0, duracion: 8, potencia: 18, desc: 'Unta las armas con toxinas: +{potencia} daño de veneno por {duracion}s' },
        { id: 'sangrado', nombre: 'Corte Hemorrágico', icono: '🩸', tipo: 'debuff', nivel: 1, maxNivel: 5, cd: 15, timer: 0, duracion: 6, potencia: 22, desc: 'Aplica sangrado que desangra al objetivo por {potencia} daño/s por {duracion}s' },
        { id: 'remate', nombre: 'Filo del Verdugo', icono: '⚡', tipo: 'ataque', nivel: 1, maxNivel: 5, cd: 15, timer: 0, potencia: 65, desc: 'Ejecuta al enemigo con daño x2.5 si tiene menos del 40% de vida' }
      ],
      skillsEquipadas: ['danza_dagas', 'veneno', 'sangrado']
    },
    elian: {
      id: 'elian',
      nombre: 'Elian el Teúrgo',
      titulo: 'Mago de Apoyo, Defensa & Curas',
      icono: '✨',
      avatar: '🧙‍♂️',
      rol: 'Clérigo Sanador & Protección Sacra',
      desc: 'Erudito arcano devoto de la luz celestial. Despliega barreras impenetrables, sana heridas críticas y purifica con furia a criaturas no-muertas.',
      hp: 150,
      dano: 18,
      defensa: 12,
      modeloGLB: 'npc/aldeanos/aldeano.glb',
      skillsCatalogo: [
        { id: 'rocio_sanador', nombre: 'Gracia Sanadora', icono: '🌿', tipo: 'cura', nivel: 1, maxNivel: 5, cd: 22, timer: 0, potencia: 50, desc: 'Restaura {potencia} HP al instante para ambos si la salud cae < 50%' },
        { id: 'baluarte_luz', nombre: 'Baluarte de Luz', icono: '🛡️', tipo: 'buff', nivel: 1, maxNivel: 5, cd: 24, timer: 0, duracion: 8, potencia: 35, desc: 'Escudo sacro que absorbe y mitiga un {potencia}% de daño por {duracion}s' },
        { id: 'purificacion', nombre: 'Castigo Sagrado', icono: '☀️', tipo: 'ataque', nivel: 1, maxNivel: 5, cd: 14, timer: 0, potencia: 44, desc: 'Haz de luz que inflige {potencia} daño sagrado (daño x3 contra no-muertos)' },
        { id: 'manantial', nombre: 'Manantial Místico', icono: '💧', tipo: 'buff', nivel: 1, maxNivel: 5, cd: 22, timer: 0, duracion: 8, potencia: 14, desc: 'Regenera +{potencia} HP y maná por segundo durante {duracion}s' }
      ],
      skillsEquipadas: ['rocio_sanador', 'baluarte_luz', 'purificacion']
    },
    brenda: {
      id: 'brenda',
      nombre: 'Brenda la Berserker',
      titulo: 'Tanque & Furia Berserker',
      icono: '🪓',
      avatar: '👩‍🦰',
      rol: 'Tanque de Choque (Frenesí & Absorción)',
      desc: 'Guerrera impetuosa que se interpone entre el peligro y el héroe. Cuanto más daño recibe, más se enfurece, entrando en modo Berserker.',
      hp: 230,
      dano: 22,
      defensa: 18,
      modeloGLB: 'npc/aldeanos/aldeano.glb',
      skillsCatalogo: [
        { id: 'frenesi', nombre: 'Modo Berserker', icono: '🔥', tipo: 'buff', nivel: 1, maxNivel: 5, cd: 26, timer: 0, duracion: 8, potencia: 40, desc: 'Desata furia salvaje ante el dolor: +{potencia}% daño y resistencia férrea por {duracion}s' },
        { id: 'provocacion', nombre: 'Grito Provocador', icono: '📢', tipo: 'buff', nivel: 1, maxNivel: 5, cd: 18, timer: 0, duracion: 6, potencia: 35, desc: 'Atrae a los monstruos hacia ella protegiendo al héroe por {duracion}s' },
        { id: 'sed_sangre', nombre: 'Sed de Sangre', icono: '🩸', tipo: 'buff', nivel: 1, maxNivel: 5, cd: 22, timer: 0, duracion: 8, potencia: 30, desc: 'Convierte el {potencia}% del daño asestado en curación por {duracion}s' },
        { id: 'torbellino', nombre: 'Torbellino Feroz', icono: '🌀', tipo: 'ataque', nivel: 1, maxNivel: 5, cd: 14, timer: 0, potencia: 38, desc: 'Giro con hacha pesada que hiere a todos los enemigos circundantes' }
      ],
      skillsEquipadas: ['frenesi', 'provocacion', 'torbellino']
    }
  };

  // Clona un catálogo de habilidades para un acompañante
  function clonarSkillsCatalogo(lista) {
    return (lista || []).map(s => Object.assign({}, s));
  }

  // Clona el estado base inicial de un arquetipo a Nivel 1 con 0 XP
  function clonarEstadoBaseArquetipo(arqKey) {
    const arq = COMPANEROS[arqKey] || COMPANEROS.rowan;
    return {
      arquetipo: arq.id,
      nombre: arq.nombre,
      rol: arq.rol,
      titulo: arq.titulo,
      icono: arq.icono,
      avatar: arq.avatar,
      nivel: 1,
      xp: 0,
      puntosCompanero: 2,
      hp: arq.hp,
      maxHp: arq.hp,
      defensa: arq.defensa,
      dano: arq.dano,
      combatesLuchados: 0,
      skillsCatalogo: clonarSkillsCatalogo(arq.skillsCatalogo),
      skillsEquipadas: arq.skillsEquipadas.slice(0, 3)
    };
  }

  // Estado lógico del acompañante con roster persistente independiente por cada arquetipo
  function crearAcompanante(config = {}) {
    const roster = {};
    Object.keys(COMPANEROS).forEach(k => {
      roster[k] = clonarEstadoBaseArquetipo(k);
    });

    if (config.roster && typeof config.roster === 'object') {
      Object.keys(config.roster).forEach(k => {
        if (roster[k] && config.roster[k]) {
          const r = config.roster[k];
          roster[k].nivel = typeof r.nivel === 'number' ? r.nivel : roster[k].nivel;
          roster[k].xp = typeof r.xp === 'number' ? r.xp : roster[k].xp;
          roster[k].puntosCompanero = typeof r.puntosCompanero === 'number' ? r.puntosCompanero : roster[k].puntosCompanero;
          roster[k].hp = typeof r.hp === 'number' ? r.hp : roster[k].hp;
          roster[k].maxHp = typeof r.maxHp === 'number' ? r.maxHp : roster[k].maxHp;
          roster[k].defensa = typeof r.defensa === 'number' ? r.defensa : roster[k].defensa;
          roster[k].dano = typeof r.dano === 'number' ? r.dano : roster[k].dano;
          roster[k].combatesLuchados = typeof r.combatesLuchados === 'number' ? r.combatesLuchados : 0;
          if (Array.isArray(r.skillsCatalogo)) roster[k].skillsCatalogo = clonarSkillsCatalogo(r.skillsCatalogo);
          if (Array.isArray(r.skillsEquipadas)) roster[k].skillsEquipadas = r.skillsEquipadas.slice(0, 3);
        }
      });
    }

    const arqKey = config.arquetipo || 'rowan';
    const arq = COMPANEROS[arqKey] || COMPANEROS.rowan;
    const arqData = roster[arq.id] || clonarEstadoBaseArquetipo(arq.id);

    // Compatibilidad si config traía propiedades específicas a nivel raíz para el inicial
    if (typeof config.nivel === 'number') arqData.nivel = config.nivel;
    if (typeof config.puntosCompanero === 'number') arqData.puntosCompanero = config.puntosCompanero;
    if (typeof config.hp === 'number') arqData.hp = config.hp;
    if (typeof config.maxHp === 'number') arqData.maxHp = config.maxHp;
    if (typeof config.dano === 'number') arqData.dano = config.dano;
    if (typeof config.defensa === 'number') arqData.defensa = config.defensa;
    if (Array.isArray(config.skillsCatalogo)) arqData.skillsCatalogo = clonarSkillsCatalogo(config.skillsCatalogo);
    if (Array.isArray(config.skillsEquipadas)) arqData.skillsEquipadas = config.skillsEquipadas.slice(0, 3);
    roster[arq.id] = arqData;

    const acompanante = {
      id: arq.id + '-companero',
      roster,
      arquetipo: arq.id,
      arquetipoInfo: arq,
      nombre: config.nombre || (config.arquetipo ? arqData.nombre : EQUIPO_ALDEANO.nombre),
      rol: config.rol || (config.arquetipo ? arqData.rol : EQUIPO_ALDEANO.rol),
      titulo: arqData.titulo,
      icono: arqData.icono,
      avatar: arqData.avatar,
      equipo: Object.assign({}, EQUIPO_ALDEANO, config.equipo || {}),
      desbloqueado: !!config.desbloqueado,
      activo: !!config.activo,
      nivel: arqData.nivel,
      xp: arqData.xp || 0,
      puntosCompanero: arqData.puntosCompanero,
      hp: arqData.hp,
      maxHp: arqData.maxHp,
      defensa: arqData.defensa,
      dano: arqData.dano,
      combatesLuchados: arqData.combatesLuchados || 0,
      inconsciente: false,
      // Inventario propio de 20 ranuras para equipamiento y pociones automáticas (compartido por la cuadrilla)
      inventario: Array.isArray(config.inventario) ? config.inventario.slice(0, MAX_SLOTS_INVENTARIO) : [],
      pocionesVida: typeof config.pocionesVida === 'number' ? config.pocionesVida : 0,
      // Catálogo de habilidades del arquetipo y hasta 3 habilidades activas equipadas
      skillsCatalogo: arqData.skillsCatalogo,
      skillsEquipadas: arqData.skillsEquipadas,
      // Dopes y buffs actualmente activos en pantalla para el HUD con temporizadores
      buffsActivos: [],
      // Habilidades complementarias de apoyo (retrocompatibilidad)
      // Cooldown estrictamente mayor que la duración (cd > duracion)
      skills: {
        cura: { id: 'cura', nombre: 'Rocío Sanador', desc: 'Restaura salud cuando cae < 45%', cooldown: 22, timer: 0 },
        ataque: { id: 'ataque', nombre: 'Grito de Aliento', desc: 'Aumenta el daño de ataque un 25% por 10s', cooldown: 22, timer: 0 },
        defensa: { id: 'defensa', nombre: 'Baluarte de Cuero', desc: 'Reduce el daño recibido un 20% por 8s', cooldown: 20, timer: 0 }
      },
      buffs: {
        ataqueTimer: 0,
        defensaTimer: 0
      },
      rangoAtaque: 2.2,
      cooldownAtaque: 1.25,
      tiempoSiguienteAtaque: 0,
      x: config.x || 0,
      y: config.y || 0,
      z: config.z || 0,
      rotacion: 0,
      velocidadActual: 0,
      estado: 'idle', // 'idle' | 'walk' | 'run' | 'attack' | 'debilitado'
      tiempoEstado: 0,
      fraseActual: null,
      tiempoFrase: 0,
      ultimoComentarioMs: 0,
      distanciaFormacion: 2.8,
      anguloFormacion: 2.4, // Radianes detrás y al lado del héroe
      mesh: null,
      limbs: null,
      bocadilloDom: null
    };

    return acompanante;
  }

  // Sincroniza las estadísticas, nivel, xp y skills del compañero activo en su entrada del roster
  function sincronizarArquetipoActivo(acompanante) {
    if (!acompanante || !acompanante.roster || !acompanante.arquetipo) return;
    const r = acompanante.roster[acompanante.arquetipo];
    if (!r) return;
    r.nivel = acompanante.nivel || 1;
    r.xp = acompanante.xp || 0;
    r.puntosCompanero = acompanante.puntosCompanero || 0;
    r.hp = acompanante.hp;
    r.maxHp = acompanante.maxHp;
    r.defensa = acompanante.defensa;
    r.dano = acompanante.dano;
    r.combatesLuchados = acompanante.combatesLuchados || 0;
    r.skillsCatalogo = acompanante.skillsCatalogo;
    r.skillsEquipadas = acompanante.skillsEquipadas;
  }

  // Cambia el compañero de camino activo (Rowan, Lyra, Elian, Brenda) preservando inventario y progreso independiente
  function cambiarArquetipo(acompanante, idArquetipo) {
    if (!acompanante || !COMPANEROS[idArquetipo]) return false;
    // 1. Guardar el estado actual del compañero saliente en su roster
    sincronizarArquetipoActivo(acompanante);

    if (!acompanante.roster) {
      acompanante.roster = {};
      Object.keys(COMPANEROS).forEach(k => {
        acompanante.roster[k] = clonarEstadoBaseArquetipo(k);
      });
    }
    if (!acompanante.roster[idArquetipo]) {
      acompanante.roster[idArquetipo] = clonarEstadoBaseArquetipo(idArquetipo);
    }

    // 2. Cargar el estado persistente del nuevo compañero
    const nuevo = acompanante.roster[idArquetipo];
    const info = COMPANEROS[idArquetipo];

    acompanante.arquetipo = nuevo.arquetipo;
    acompanante.arquetipoInfo = info;
    acompanante.nombre = nuevo.nombre;
    acompanante.rol = nuevo.rol;
    acompanante.titulo = nuevo.titulo;
    acompanante.icono = nuevo.icono;
    acompanante.avatar = nuevo.avatar;
    acompanante.nivel = nuevo.nivel;
    acompanante.xp = nuevo.xp;
    acompanante.puntosCompanero = nuevo.puntosCompanero;
    acompanante.hp = nuevo.hp;
    acompanante.maxHp = nuevo.maxHp;
    acompanante.defensa = nuevo.defensa;
    acompanante.dano = nuevo.dano;
    acompanante.combatesLuchados = nuevo.combatesLuchados || 0;
    acompanante.skillsCatalogo = nuevo.skillsCatalogo;
    acompanante.skillsEquipadas = nuevo.skillsEquipadas.slice(0, 3);
    acompanante.buffsActivos = [];

    decirFrase(acompanante, `🤝 ¡${nuevo.nombre} (Nivel ${nuevo.nivel}) se prepara para el combate!`, 4.0);
    return true;
  }

  // Equipa una habilidad en una de las 3 ranuras activas (slotIndex: 0, 1, 2)
  function equiparSkill(acompanante, slotIndex, skillId) {
    if (!acompanante || slotIndex < 0 || slotIndex > 2) return false;
    const existe = acompanante.skillsCatalogo.find(s => s.id === skillId);
    if (!existe) return false;
    // Si ya estaba en otra ranura, se intercambian
    const idxPrevio = acompanante.skillsEquipadas.indexOf(skillId);
    if (idxPrevio !== -1) {
      acompanante.skillsEquipadas[idxPrevio] = acompanante.skillsEquipadas[slotIndex];
    }
    acompanante.skillsEquipadas[slotIndex] = skillId;
    sincronizarArquetipoActivo(acompanante);
    return true;
  }

  // Sube de nivel una habilidad del acompañante usando puntos de maestría.
  // Regla de diseño: El tiempo de espera (cooldown) es estrictamente mayor que la duración del efecto
  // en todos los niveles (1 al 5), calibrado según la trascendencia e impacto de cada habilidad.
  function subirNivelSkill(acompanante, skillId) {
    if (!acompanante || (acompanante.puntosCompanero || 0) < 1) return false;
    const sk = (acompanante.skillsCatalogo || []).find(s => s.id === skillId);
    if (!sk || sk.nivel >= (sk.maxNivel || 5)) return false;
    sk.nivel++;
    acompanante.puntosCompanero--;
    sk.potencia = Math.round(sk.potencia * 1.18);

    if (sk.duracion) {
      // La duración crece moderadamente (+0.5s por nivel) con un tope firme según la importancia del efecto
      const topeDuracion = (sk.tipo === 'debuff' || sk.id === 'provocacion') ? 8 : (sk.id === 'frenesi' || sk.id === 'baluarte_luz' ? 10 : 12);
      sk.duracion = Math.min(topeDuracion, Number((sk.duracion + 0.5).toFixed(1)));
    }

    if (sk.cd) {
      // El cooldown se reduce de forma medida (-0.8s por nivel), asegurando siempre una cota mínima proporcional:
      // Cooldown estrictamente mayor que la duración (ratio mínimo 1.6x a 2.0x según importancia).
      let cdMinimo = 6;
      if (sk.duracion) {
        if (sk.id === 'frenesi' || sk.id === 'baluarte_luz') {
          cdMinimo = Math.max(Math.round(sk.duracion * 2.0), sk.duracion + 10);
        } else {
          cdMinimo = Math.max(Math.round(sk.duracion * 1.6), sk.duracion + 6);
        }
      }
      sk.cd = Math.max(cdMinimo, Number((sk.cd - 0.8).toFixed(1)));
    }

    sincronizarArquetipoActivo(acompanante);
    return true;
  }

  // Otorga experiencia al acompañante activo solo si está luchando, sube de nivel y concede puntos de maestría
  function ganarXpAcompanante(acompanante, amount) {
    if (!acompanante || amount <= 0) return { subioNivel: false, nivelesGanados: 0 };
    acompanante.xp = (acompanante.xp || 0) + amount;
    acompanante.nivel = acompanante.nivel || 1;
    let ganados = 0;
    const xpNecesaria = n => 100 * n;
    while (acompanante.xp >= xpNecesaria(acompanante.nivel)) {
      acompanante.xp -= xpNecesaria(acompanante.nivel);
      acompanante.nivel++;
      ganados++;
      acompanante.maxHp = Math.round(acompanante.maxHp + 25);
      acompanante.hp = acompanante.maxHp;
      acompanante.dano = Math.round(acompanante.dano + 3);
      acompanante.defensa = Math.round(acompanante.defensa + 2);
      acompanante.puntosCompanero = (acompanante.puntosCompanero || 0) + 1;
    }
    sincronizarArquetipoActivo(acompanante);
    return {
      subioNivel: ganados > 0,
      nivelesGanados: ganados,
      nuevoNivel: acompanante.nivel,
      puntosGanados: ganados,
      xpActual: acompanante.xp
    };
  }

  // Aplica o refresca un dope activo en pantalla con temporizador
  function aplicarDopeActivo(acompanante, dopeInfo) {
    if (!acompanante) return null;
    if (!acompanante.buffsActivos) acompanante.buffsActivos = [];
    const idx = acompanante.buffsActivos.findIndex(b => b.id === dopeInfo.id);
    const duracion = dopeInfo.duracion || 10;
    const item = {
      id: dopeInfo.id,
      nombre: dopeInfo.nombre,
      icono: dopeInfo.icono || '✨',
      desc: dopeInfo.desc || '',
      efecto: dopeInfo.efecto || 'buff',
      valor: dopeInfo.valor || 0,
      timer: duracion,
      maxTimer: duracion
    };
    if (idx !== -1) acompanante.buffsActivos[idx] = item;
    else acompanante.buffsActivos.push(item);
    return item;
  }

  // Daño recibido por el acompañante con mitigación por armadura y buff de defensa
  function recibirDanoAcompanante(acompanante, danoBruto) {
    if (!acompanante || !acompanante.activo || acompanante.inconsciente) return 0;
    
    // Mitigación por defensa base
    let defTotal = acompanante.defensa || 0;
    let factor = 1 - (defTotal / (defTotal + 80));
    let dmg = Math.max(1, Math.round(danoBruto * factor));

    // Mitigación adicional si tiene activo el Baluarte de Cuero (-20%)
    if (acompanante.buffs && acompanante.buffs.defensaTimer > 0) {
      dmg = Math.max(1, Math.round(dmg * 0.80));
    }

    acompanante.hp = Math.max(0, acompanante.hp - dmg);

    if (acompanante.hp <= 0) {
      acompanante.inconsciente = true;
      acompanante.estado = 'debilitado';
      decirFrase(acompanante, '¡He caído! Protégeme... necesito recuperarme.', 5.0);
    } else if (acompanante.hp < acompanante.maxHp * 0.40) {
      const ahora = Date.now();
      if (ahora - (acompanante._avisoVidaBaja || 0) > 8000) {
        acompanante._avisoVidaBaja = ahora;
        decirFrase(acompanante, '¡Me hieren de gravedad! ¡Cuidado con sus garras!', 3.5);
      }
    }

    return dmg;
  }

  // Revivir o restaurar al acompañante tras descansar o curar
  function revivirAcompanante(acompanante, porcentaje = 0.50) {
    if (!acompanante) return;
    acompanante.inconsciente = false;
    acompanante.hp = Math.max(Math.round(acompanante.maxHp * porcentaje), acompanante.hp);
    if (acompanante.estado === 'debilitado') acompanante.estado = 'idle';
  }

  // Añade un objeto al inventario del acompañante (hasta 20 slots)
  function agregarObjetoAcompanante(acompanante, obj) {
    if (!acompanante) return false;
    acompanante.inventario = acompanante.inventario || [];
    if (acompanante.inventario.length >= MAX_SLOTS_INVENTARIO) {
      throw new Error('El inventario de Rowan está lleno (máximo 20 objetos)');
    }
    acompanante.inventario.push(obj);
    if (obj.tipo === 'pocion_vida') {
      acompanante.pocionesVida = (acompanante.pocionesVida || 0) + 1;
    }
    return true;
  }

  // Retira un objeto del inventario del acompañante por su uid
  function removerObjetoAcompanante(acompanante, uid) {
    if (!acompanante || !acompanante.inventario) return null;
    const idx = acompanante.inventario.findIndex(o => o.uid === uid);
    if (idx === -1) return null;
    const [removido] = acompanante.inventario.splice(idx, 1);
    if (removido.tipo === 'pocion_vida') {
      acompanante.pocionesVida = Math.max(0, (acompanante.pocionesVida || 0) - 1);
    }
    return removido;
  }

  // Da pociones de vida al inventario del acompañante
  function darPocionesVidaAcompanante(acompanante, cantidad = 1) {
    if (!acompanante) return 0;
    let dadas = 0;
    for (let i = 0; i < cantidad; i++) {
      if (acompanante.inventario.length >= MAX_SLOTS_INVENTARIO) break;
      const pocion = {
        uid: 'pocion-vida-acomp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        tipo: 'pocion_vida',
        nombre: 'Poción de Salud',
        cura: 0.35,
        icono: '🧪'
      };
      acompanante.inventario.push(pocion);
      acompanante.pocionesVida = (acompanante.pocionesVida || 0) + 1;
      dadas++;
    }
    return dadas;
  }

  // Auto-consumo de poción de vida por el propio acompañante si baja de 50% HP
  function tomarPocionAutomaticaAcompanante(acompanante) {
    if (!acompanante || acompanante.inconsciente) return false;
    if (acompanante.hp >= acompanante.maxHp * 0.50) return false;

    // Buscar una poción en su inventario
    const idxPocion = (acompanante.inventario || []).findIndex(o => o.tipo === 'pocion_vida');
    if (idxPocion === -1 && (!acompanante.pocionesVida || acompanante.pocionesVida <= 0)) return false;

    if (idxPocion !== -1) {
      acompanante.inventario.splice(idxPocion, 1);
    }
    acompanante.pocionesVida = Math.max(0, (acompanante.pocionesVida || 1) - 1);

    const cura = Math.round(acompanante.maxHp * 0.35);
    acompanante.hp = Math.min(acompanante.maxHp, acompanante.hp + cura);
    decirFrase(acompanante, '¡He tomado una poción de salud! (+' + cura + ' HP)', 3.5);
    return cura;
  }

  // Equipar una pieza de armadura o arma en el acompañante
  function equiparPiezaAcompanante(acompanante, obj) {
    if (!acompanante || !obj || !obj.ranura) return false;
    acompanante.equipo = acompanante.equipo || {};
    acompanante.equipo[obj.ranura] = obj.nombre || obj.uid;

    // Bonificaciones de stats según la pieza
    if (obj.ranura === 'weapon') {
      acompanante.dano = Math.max(24, Math.round(18 + (obj.ataque || 10)));
    } else {
      acompanante.defensa = Math.max(14, Math.round(10 + (obj.defensa || 8)));
      acompanante.maxHp = Math.max(180, Math.round(160 + (obj.defensa || 6) * 4));
      acompanante.hp = Math.min(acompanante.hp, acompanante.maxHp);
    }
    return true;
  }

  // Construcción del modelo 3D del aldeano en Three.js con materiales y vestimenta de cuero
  function construirModeloAcompanante(THREE) {
    const grupo = new THREE.Group();
    grupo.name = 'Acompanante_Rowan';

    // Paleta de materiales: cuero curtido, cuero oscuro, bronce, piel, lino y acero
    const matCuero = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Marrón cuero cálido
      roughness: 0.78,
      metalness: 0.08
    });
    const matCueroOscuro = new THREE.MeshStandardMaterial({
      color: 0x3b1d11, // Cuero oscuro para botas y correas
      roughness: 0.85,
      metalness: 0.05
    });
    const matLino = new THREE.MeshStandardMaterial({
      color: 0xd6c7a1, // Camisa de lino rústico
      roughness: 0.9,
      metalness: 0.0
    });
    const matPantalon = new THREE.MeshStandardMaterial({
      color: 0x334155, // Tela resistente pizarra azulada
      roughness: 0.82,
      metalness: 0.02
    });
    const matPiel = new THREE.MeshStandardMaterial({
      color: 0xfbd0a6, // Tono de piel natural
      roughness: 0.65,
      metalness: 0.0
    });
    const matCabello = new THREE.MeshStandardMaterial({
      color: 0x451a03, // Pelo castaño oscuro
      roughness: 0.9,
      metalness: 0.02
    });
    const matHebilla = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Latón / bronce dorado
      roughness: 0.35,
      metalness: 0.75
    });
    const matAcero = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Acero de espada
      roughness: 0.25,
      metalness: 0.85
    });

    // 1. Torso y Jubón de Cuero
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.68, 0.28), matCuero);
    torso.position.y = 1.08;
    torso.castShadow = true;
    torso.receiveShadow = true;
    grupo.add(torso);

    // Cuello de la camisa de lino que asoma sobre el jubón
    const cuelloLino = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.22), matLino);
    cuelloLino.position.set(0, 1.42, 0);
    grupo.add(cuelloLino);

    // 2. Cinturón de Cuero con Hebilla de Bronce
    const cinturon = new THREE.Mesh(new THREE.BoxGeometry(0.53, 0.11, 0.30), matCueroOscuro);
    cinturon.position.y = 0.78;
    cinturon.castShadow = true;
    grupo.add(cinturon);

    const hebilla = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, 0.32), matHebilla);
    hebilla.position.set(0, 0.78, 0.01);
    grupo.add(hebilla);

    // Pequeño saquito / bolsa de provisiones de cuero al costado del cinturón
    const bolsita = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.12), matCuero);
    bolsita.position.set(0.28, 0.75, 0.05);
    grupo.add(bolsita);

    // 3. Cabeza y Cabello de Aldeano
    const cabeza = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.38, 0.36), matPiel);
    cabeza.position.y = 1.66;
    cabeza.castShadow = true;
    grupo.add(cabeza);

    const cabello = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.18, 0.38), matCabello);
    cabello.position.set(0, 1.82, -0.02);
    grupo.add(cabello);

    const flequillo = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.10, 0.10), matCabello);
    flequillo.position.set(0, 1.76, 0.16);
    grupo.add(flequillo);

    // 4. Piernas y Botas de Cuero
    // Pierna Izquierda
    const piernaIzqGrupo = new THREE.Group();
    piernaIzqGrupo.position.set(-0.14, 0.74, 0);
    const pantalonIzq = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.44, 0.20), matPantalon);
    pantalonIzq.position.y = -0.22;
    pantalonIzq.castShadow = true;
    piernaIzqGrupo.add(pantalonIzq);
    const botaIzq = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.34, 0.24), matCueroOscuro);
    botaIzq.position.set(0, -0.56, 0.02);
    botaIzq.castShadow = true;
    piernaIzqGrupo.add(botaIzq);
    grupo.add(piernaIzqGrupo);

    // Pierna Derecha
    const piernaDerGrupo = new THREE.Group();
    piernaDerGrupo.position.set(0.14, 0.74, 0);
    const pantalonDer = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.44, 0.20), matPantalon);
    pantalonDer.position.y = -0.22;
    pantalonDer.castShadow = true;
    piernaDerGrupo.add(pantalonDer);
    const botaDer = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.34, 0.24), matCueroOscuro);
    botaDer.position.set(0, -0.56, 0.02);
    botaDer.castShadow = true;
    piernaDerGrupo.add(botaDer);
    grupo.add(piernaDerGrupo);

    // 5. Brazos y Espada Corta
    // Brazo Izquierdo
    const brazoIzqGrupo = new THREE.Group();
    brazoIzqGrupo.position.set(-0.35, 1.34, 0);
    const mangaIzq = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.38, 0.18), matLino);
    mangaIzq.position.y = -0.19;
    brazoIzqGrupo.add(mangaIzq);
    const antebrazoIzq = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.28, 0.16), matCuero);
    antebrazoIzq.position.y = -0.48;
    antebrazoIzq.castShadow = true;
    brazoIzqGrupo.add(antebrazoIzq);
    grupo.add(brazoIzqGrupo);

    // Brazo Derecho (Mano de combate con espada corta)
    const brazoDerGrupo = new THREE.Group();
    brazoDerGrupo.position.set(0.35, 1.34, 0);
    const mangaDer = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.38, 0.18), matLino);
    mangaDer.position.y = -0.19;
    brazoDerGrupo.add(mangaDer);
    const antebrazoDer = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.28, 0.16), matCuero);
    antebrazoDer.position.y = -0.48;
    antebrazoDer.castShadow = true;
    brazoDerGrupo.add(antebrazoDer);

    // Espada corta de aldeano
    const espadaGrupo = new THREE.Group();
    espadaGrupo.position.set(0, -0.62, 0.12);
    const hoja = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.65, 0.02), matAcero);
    hoja.position.y = 0.30;
    hoja.castShadow = true;
    espadaGrupo.add(hoja);
    const guarda = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.04, 0.06), matHebilla);
    guarda.position.y = 0.0;
    espadaGrupo.add(guarda);
    const empunadura = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.05), matCueroOscuro);
    empunadura.position.y = -0.09;
    espadaGrupo.add(empunadura);
    brazoDerGrupo.add(espadaGrupo);

    grupo.add(brazoDerGrupo);

    // Marcador sutil de aliado (halo tenue verde a sus pies)
    const haloGeo = new THREE.RingGeometry(0.4, 0.55, 24);
    haloGeo.rotateX(-Math.PI / 2);
    const matHalo = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    const halo = new THREE.Mesh(haloGeo, matHalo);
    halo.position.y = 0.04;
    grupo.add(halo);

    return {
      root: grupo,
      torso,
      cabeza,
      limbs: {
        piernaIzq: piernaIzqGrupo,
        piernaDer: piernaDerGrupo,
        brazoIzq: brazoIzqGrupo,
        brazoDer: brazoDerGrupo,
        espada: espadaGrupo
      }
    };
  }

  // Actualización de animaciones de los miembros (paso de marcha / carrera / golpe de espada)
  function animarMiembros(limbs, estado, tiempo, velocidad) {
    if (!limbs) return;
    const cadencia = estado === 'run' ? 12.0 : (estado === 'walk' ? 7.5 : 2.5);
    const f = tiempo * cadencia;

    if (estado === 'attack') {
      // Golpe dinámico de espada con el brazo derecho
      const tGolpe = Math.min(1, (tiempo % 0.6) / 0.6);
      const arco = Math.sin(tGolpe * Math.PI);
      limbs.brazoDer.rotation.x = -1.2 + arco * 2.2;
      limbs.brazoDer.rotation.z = -0.3 + arco * 0.5;
      limbs.brazoIzq.rotation.x = 0.4;
      limbs.piernaIzq.rotation.x = -0.2;
      limbs.piernaDer.rotation.x = 0.2;
    } else if (estado === 'walk' || estado === 'run') {
      const amplitud = estado === 'run' ? 0.85 : 0.48;
      const osc = Math.sin(f) * amplitud;
      limbs.piernaIzq.rotation.x = osc;
      limbs.piernaDer.rotation.x = -osc;
      limbs.brazoIzq.rotation.x = -osc * 0.9;
      limbs.brazoDer.rotation.x = osc * 0.9;
      limbs.brazoDer.rotation.z = 0;
    } else {
      // Reposo (respiración suave)
      const respiro = Math.sin(f * 0.8) * 0.04;
      limbs.brazoIzq.rotation.x = 0.1 + respiro;
      limbs.brazoDer.rotation.x = 0.1 - respiro;
      limbs.brazoDer.rotation.z = 0;
      limbs.piernaIzq.rotation.x = 0;
      limbs.piernaDer.rotation.x = 0;
    }
  }

  // Reproducción de animaciones esqueléticas para el modelo GLB del Estudio de Armaduras
  function reproducirAnimacionGLB(acompanante, nombreAnim, fadeDuration = 0.22) {
    if (!acompanante || !acompanante.mixer || !acompanante.actions) return;

    let clipName = nombreAnim;
    if (nombreAnim === 'attack') {
      const ataques = ['overhead_cleave', 'thrust_lunge', 'spin_slash'];
      clipName = ataques.find(n => acompanante.actions[n]) || 'punch';
    }

    if (!acompanante.actions[clipName]) {
      clipName = 'idle';
    }

    const proxima = acompanante.actions[clipName];
    if (!proxima) return;

    if (acompanante.nombreAnimActual === clipName && proxima.isRunning()) {
      return;
    }

    const anterior = acompanante.accionActual;
    proxima.reset();
    proxima.enabled = true;

    if (nombreAnim === 'attack') {
      proxima.setLoop(1, 1);
      proxima.clampWhenFinished = false;
    } else {
      proxima.setLoop(1000);
    }

    if (anterior && anterior !== proxima) {
      proxima.crossFadeFrom(anterior, Math.min(fadeDuration, 0.25), true);
    }
    proxima.play();
    acompanante.accionActual = proxima;
    acompanante.nombreAnimActual = clipName;
  }

  // Integración del modelo humanoide GLB generado con el Estudio de Armaduras
  function instalarModeloGLBAcompanante(acompanante, gltf, THREE) {
    if (!acompanante || !gltf || !gltf.scene) return null;
    const root = gltf.scene;

    // Normalizar escala anatómica a 1.82m
    const bbox = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    if (size.y > 0.01) {
      const escala = 1.82 / size.y;
      root.scale.setScalar(escala);
    }
    bbox.setFromObject(root);
    root.position.y = -bbox.min.y;

    const contenedor = new THREE.Group();
    contenedor.name = 'Acompanante_Rowan_GLB';
    contenedor.add(root);

    // Ajustar materiales y sombras
    root.traverse(o => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (o.material) {
          if (Array.isArray(o.material)) {
            o.material.forEach(m => { if (m) m.roughness = Math.max(0.35, m.roughness || 0.6); });
          } else {
            o.material.roughness = Math.max(0.35, o.material.roughness || 0.6);
          }
        }
      }
    });

    // Marcador sutil de aliado (halo tenue verde a sus pies)
    const haloGeo = new THREE.RingGeometry(0.4, 0.55, 24);
    haloGeo.rotateX(-Math.PI / 2);
    const matHalo = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    const halo = new THREE.Mesh(haloGeo, matHalo);
    halo.position.y = 0.04;
    contenedor.add(halo);

    // AnimationMixer y mapeo de animaciones disponibles
    let mixer = null;
    const actions = {};
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(root);
      gltf.animations.forEach(clip => {
        actions[clip.name] = mixer.clipAction(clip);
      });
    }

    // Reemplazo limpio en la escena
    if (acompanante.mesh) {
      contenedor.position.copy(acompanante.mesh.position);
      contenedor.rotation.copy(acompanante.mesh.rotation);
      if (acompanante.mesh.parent) {
        const parent = acompanante.mesh.parent;
        parent.remove(acompanante.mesh);
        parent.add(contenedor);
      }
    }

    acompanante.mesh = contenedor;
    acompanante.limbs = null;
    acompanante.mixer = mixer;
    acompanante.actions = actions;
    acompanante.accionActual = null;
    acompanante.nombreAnimActual = null;

    reproducirAnimacionGLB(acompanante, 'idle', 0.1);
    return contenedor;
  }

  // Validador estricto de monstruos vivos y combatibles
  function esMonstruoCombatible(m) {
    if (!m) return false;
    if (m.alive === false || m.muerto) return false;
    if (typeof m.hp === 'number' && m.hp <= 0) return false;
    if (m.muriendo && typeof performance !== 'undefined' && performance.now() < m.muriendo) return false;
    return true;
  }

  // Actualización de la IA del acompañante en cada frame
  function actualizarAcompanante(acompanante, dt, heroePos, heroeRot, monstruos, heroeObjetivo, getAlturaFn, registrarEventoFn, aplicarDanoMonstruoFn, heroeInfo, alLanzarSkillFn) {
    if (!acompanante || !acompanante.activo || !acompanante.mesh) return;

    acompanante.tiempoEstado += dt;
    acompanante.tiempoSiguienteAtaque = Math.max(0, acompanante.tiempoSiguienteAtaque - dt);

    // Actualización de timers de buffs y habilidades de apoyo
    if (acompanante.buffs) {
      acompanante.buffs.ataqueTimer = Math.max(0, (acompanante.buffs.ataqueTimer || 0) - dt);
      acompanante.buffs.defensaTimer = Math.max(0, (acompanante.buffs.defensaTimer || 0) - dt);
    }
    if (acompanante.skills) {
      if (acompanante.skills.cura) acompanante.skills.cura.timer = Math.max(0, acompanante.skills.cura.timer - dt);
      if (acompanante.skills.ataque) acompanante.skills.ataque.timer = Math.max(0, acompanante.skills.ataque.timer - dt);
      if (acompanante.skills.defensa) acompanante.skills.defensa.timer = Math.max(0, acompanante.skills.defensa.timer - dt);
    }
    // Descontar temporizadores del catálogo de habilidades
    if (acompanante.skillsCatalogo) {
      acompanante.skillsCatalogo.forEach(sk => {
        if (sk.timer > 0) sk.timer = Math.max(0, sk.timer - dt);
      });
    }
    // Descontar y depurar temporizadores de dopes activos en pantalla (HUD)
    if (acompanante.buffsActivos && acompanante.buffsActivos.length) {
      for (let i = acompanante.buffsActivos.length - 1; i >= 0; i--) {
        const b = acompanante.buffsActivos[i];
        b.timer = Math.max(0, b.timer - dt);
        if (b.timer <= 0) {
          acompanante.buffsActivos.splice(i, 1);
        }
      }
    }

    // Si ha caído inconsciente, no ataca ni se desplaza hasta ser curado
    if (acompanante.inconsciente) {
      acompanante.estado = 'debilitado';
      acompanante.velocidadActual = 0;
      const ySuelo = getAlturaFn ? getAlturaFn(acompanante.x, acompanante.z) : 0;
      acompanante.y = ySuelo;
      acompanante.mesh.position.set(acompanante.x, ySuelo, acompanante.z);
      if (acompanante.mixer) acompanante.mixer.update(dt);
      return;
    }

    // Auto-toma de poción de vida automática si la salud cae por debajo del 50%
    if (acompanante.hp < acompanante.maxHp * 0.50) {
      tomarPocionAutomaticaAcompanante(acompanante);
    }

    // 1. Determinar si hay un monstruo hostil al alcance o el objetivo actual del héroe
    let objetivoCombate = null;
    let distObjetivoMin = Infinity;

    if (esMonstruoCombatible(heroeObjetivo)) {
      const dHeroe = Math.hypot(heroeObjetivo.x - heroePos.x, heroeObjetivo.z - heroePos.z);
      if (dHeroe < 14) {
        objetivoCombate = heroeObjetivo;
        distObjetivoMin = Math.hypot(heroeObjetivo.x - acompanante.x, heroeObjetivo.z - acompanante.z);
      }
    }

    if (!objetivoCombate && monstruos && monstruos.length) {
      monstruos.forEach(m => {
        if (!esMonstruoCombatible(m)) return;
        const d = Math.hypot(m.x - heroePos.x, m.z - heroePos.z);
        if (d < 10) {
          const dComp = Math.hypot(m.x - acompanante.x, m.z - acompanante.z);
          if (dComp < distObjetivoMin) {
            distObjetivoMin = dComp;
            objetivoCombate = m;
          }
        }
      });
    }

    // Detección de inicio de combate y aviso de monstruo endurecido
    const ahoraMs = (typeof Date !== 'undefined' ? Date.now() : 0);
    if (objetivoCombate && !acompanante._enCombateActivo) {
      acompanante._enCombateActivo = true;
      if (!acompanante.ultimoComentarioMs || ahoraMs - acompanante.ultimoComentarioMs > 10000) {
        const esDuro = (objetivoCombate.maxHp && objetivoCombate.maxHp > 60) || objetivoCombate.boss || (objetivoCombate.rangoElite && objetivoCombate.rangoElite >= 2);
        const cat = esDuro ? 'monstruo_duro' : 'combate_inicio';
        decirFrase(acompanante, elegirFrase(cat), 4.5);
      }
    } else if (!objetivoCombate) {
      acompanante._enCombateActivo = false;
    }

    // Aviso de salud crítica del héroe
    if (heroeInfo && heroeInfo.hp && heroeInfo.maxHp && (heroeInfo.hp < heroeInfo.maxHp * 0.35)) {
      if (!acompanante._ultimoAvisoSalud || ahoraMs - acompanante._ultimoAvisoSalud > 14000) {
        acompanante._ultimoAvisoSalud = ahoraMs;
        decirFrase(acompanante, elegirFrase('salud_baja'), 4.0);
      }
    }

    // Gestión y activación de las 3 Skills Equipadas y Dopes de Apoyo
    const heroeHpActual = (heroeInfo && typeof heroeInfo.hp === 'number') ? heroeInfo.hp : 100;
    const heroeHpMax = (heroeInfo && typeof heroeInfo.maxHp === 'number') ? heroeInfo.maxHp : 100;
    const heroeBajo = (heroeHpActual / heroeHpMax) < 0.50;
    const compBajo = (acompanante.hp / acompanante.maxHp) < 0.50;

    // Ejecutar hasta las 3 habilidades equipadas del catálogo
    if (acompanante.skillsCatalogo && acompanante.skillsEquipadas) {
      acompanante.skillsEquipadas.forEach(skId => {
        const sk = acompanante.skillsCatalogo.find(s => s.id === skId);
        if (!sk || sk.timer > 0) return;

        // 1. Habilidades de Curación
        if (sk.tipo === 'cura' && (heroeBajo || compBajo)) {
          sk.timer = sk.cd || 22;
          const pct = (sk.potencia || 45) / 100;
          const curaComp = Math.round(acompanante.maxHp * pct);
          acompanante.hp = Math.min(acompanante.maxHp, acompanante.hp + curaComp);
          aplicarDopeActivo(acompanante, {
            id: sk.id,
            nombre: sk.nombre,
            icono: sk.icono || '🌿',
            desc: `+${sk.potencia}% HP Sanado`,
            duracion: 3,
            efecto: 'cura',
            valor: sk.potencia
          });
          decirFrase(acompanante, `🌿 ¡${sk.nombre}! ¡Sano vuestras heridas!`, 3.5);
          if (typeof alLanzarSkillFn === 'function') {
            alLanzarSkillFn('cura', { nombre: sk.nombre, potencia: sk.potencia, curaComp });
          }
        }

        // 2. Habilidades de Buff / Dope (en combate)
        else if (sk.tipo === 'buff' && (objetivoCombate || heroeBajo || compBajo)) {
          sk.timer = sk.cd || 22;
          const dur = sk.duracion || 8;
          if (sk.id === 'grito' || sk.id === 'fervor') {
            acompanante.buffs.ataqueTimer = dur;
          }
          if (sk.id === 'baluarte_luz' || sk.id === 'baluarte') {
            acompanante.buffs.defensaTimer = dur;
          }
          if (sk.id === 'frenesi') {
            acompanante.buffs.ataqueTimer = dur;
            acompanante.buffs.defensaTimer = dur;
          }
          aplicarDopeActivo(acompanante, {
            id: sk.id,
            nombre: sk.nombre,
            icono: sk.icono || '✨',
            desc: sk.desc ? sk.desc.replace('{potencia}', sk.potencia).replace('{duracion}', dur) : `+${sk.potencia}% potencia`,
            duracion: dur,
            efecto: 'buff',
            valor: sk.potencia
          });
          decirFrase(acompanante, `${sk.icono || '✨'} ¡${sk.nombre}! (+${sk.potencia}% efectividad)`, 3.5);
          if (typeof alLanzarSkillFn === 'function') {
            alLanzarSkillFn(sk.id, { nombre: sk.nombre, duracion: dur, valor: sk.potencia, icono: sk.icono });
          }
        }

        // 3. Habilidades Ofensivas Especiales
        else if (sk.tipo === 'ataque' && objetivoCombate && distObjetivoMin <= (acompanante.rangoAtaque + 1.5)) {
          sk.timer = sk.cd || 12;
          let bonusDano = Math.round((sk.potencia || 35) * (0.9 + Math.random() * 0.3));
          // Daño triplicado contra no-muertos si es Castigo Sagrado de Elian
          if (sk.id === 'purificacion' && objetivoCombate.name && /esqueleto|zombi|muerto|sombra|espectro|fantasma/i.test(objetivoCombate.name)) {
            bonusDano *= 3;
            decirFrase(acompanante, '☀️ ¡Luz celestial! ¡Purificación para los no-muertos!', 3.5);
          } else {
            decirFrase(acompanante, `${sk.icono || '💥'} ¡${sk.nombre}!`, 3.0);
          }

          if (typeof aplicarDanoMonstruoFn === 'function') {
            aplicarDanoMonstruoFn(objetivoCombate, bonusDano);
          } else if (typeof objetivoCombate.recibirDano === 'function') {
            objetivoCombate.recibirDano(bonusDano, 'companero_skill');
          } else if (typeof objetivoCombate.hp === 'number') {
            objetivoCombate.hp = Math.max(0, objetivoCombate.hp - bonusDano);
          }

          if (typeof alLanzarSkillFn === 'function') {
            alLanzarSkillFn('ataque_skill', { nombre: sk.nombre, dano: bonusDano });
          }
        }

        // 4. Habilidades de Debuff sobre el enemigo
        else if (sk.tipo === 'debuff' && objetivoCombate && distObjetivoMin <= (acompanante.rangoAtaque + 2.0)) {
          sk.timer = sk.cd || 16;
          const dur = sk.duracion || 6;
          aplicarDopeActivo(acompanante, {
            id: sk.id,
            nombre: sk.nombre,
            icono: sk.icono || '🩸',
            desc: `Debuff: -${sk.potencia}% armadura`,
            duracion: dur,
            efecto: 'debuff',
            valor: sk.potencia
          });
          decirFrase(acompanante, `${sk.icono || '🩸'} ¡${sk.nombre}! El enemigo flaquea.`, 3.0);
        }
      });
    }

    // Retrocompatibilidad con la estructura anterior de 3 skills
    if (acompanante.skills) {
      // 1. Skill de Cura: Rocío Sanador
      if (acompanante.skills.cura && acompanante.skills.cura.timer <= 0 && (heroeBajo || compBajo)) {
        acompanante.skills.cura.timer = acompanante.skills.cura.cooldown;
        const curaRowan = Math.round(acompanante.maxHp * 0.30);
        acompanante.hp = Math.min(acompanante.maxHp, acompanante.hp + curaRowan);
        aplicarDopeActivo(acompanante, { id: 'cura', nombre: 'Rocío Sanador', icono: '🌿', desc: '+30% HP Curado', duracion: 3, efecto: 'cura', valor: 30 });
        decirFrase(acompanante, '🌿 ¡Rocío Sanador! ¡Ánimo, resistiremos juntos!', 4.0);
        if (typeof alLanzarSkillFn === 'function') {
          alLanzarSkillFn({ tipo: 'cura', nombre: 'Rocío Sanador', valor: 0.30, curaRowan });
        }
      }

      // 2. Skill de Dope de Ataque: Grito de Aliento (en combate)
      if (objetivoCombate && acompanante.skills.ataque && acompanante.skills.ataque.timer <= 0) {
        acompanante.skills.ataque.timer = acompanante.skills.ataque.cooldown;
        acompanante.buffs.ataqueTimer = 10;
        aplicarDopeActivo(acompanante, { id: 'ataque', nombre: 'Grito de Aliento', icono: '⚔️', desc: '+25% Daño de Ataque', duracion: 10, efecto: 'buff', valor: 25 });
        decirFrase(acompanante, '⚔️ ¡Por la gloria de Aden! ¡Aplastémoslos a todos! (+25% daño)', 4.0);
        if (typeof alLanzarSkillFn === 'function') {
          alLanzarSkillFn({ tipo: 'buff_ataque', nombre: 'Grito de Aliento', duracion: 10, valor: 0.25 });
        }
      }

      // 3. Skill de Dope de Defensa: Baluarte de Cuero (al luchar o sufrir daño)
      if (objetivoCombate && acompanante.skills.defensa && acompanante.skills.defensa.timer <= 0 && (compBajo || (distObjetivoMin < 3.5))) {
        acompanante.skills.defensa.timer = acompanante.skills.defensa.cooldown;
        acompanante.buffs.defensaTimer = 8;
        aplicarDopeActivo(acompanante, { id: 'defensa', nombre: 'Baluarte de Cuero', icono: '🛡️', desc: '-20% Daño Recibido', duracion: 8, efecto: 'buff', valor: 20 });
        decirFrase(acompanante, '🛡️ ¡Formación cerrada! ¡Escudos arriba! (-20% daño)', 4.0);
        if (typeof alLanzarSkillFn === 'function') {
          alLanzarSkillFn({ tipo: 'buff_defensa', nombre: 'Baluarte de Cuero', duracion: 8, valor: 0.20 });
        }
      }
    }

    // 2. Destino de movimiento: combate o formación táctica
    let destX = heroePos.x;
    let destZ = heroePos.z;
    let distanciaFreno = 1.0;

    if (objetivoCombate) {
      // Acercarse al monstruo para atacar
      destX = objetivoCombate.x;
      destZ = objetivoCombate.z;
      distanciaFreno = acompanante.rangoAtaque;
    } else {
      // Posición de formación: a un lado y detrás del héroe
      const ang = heroeRot + acompanante.anguloFormacion;
      destX = heroePos.x + Math.sin(ang) * acompanante.distanciaFormacion;
      destZ = heroePos.z + Math.cos(ang) * acompanante.distanciaFormacion;
      distanciaFreno = 0.8;
    }

    const dx = destX - acompanante.x;
    const dz = destZ - acompanante.z;
    const distDestino = Math.hypot(dx, dz);

    // Resituado de emergencia si queda demasiado lejos por viaje rápido o desync (> 60m)
    if (distDestino > 60) {
      acompanante.x = heroePos.x - Math.sin(heroeRot) * 2;
      acompanante.z = heroePos.z - Math.cos(heroeRot) * 2;
    }

    // 3. Comportamiento y velocidad
    let estadoNuevo = 'idle';
    let velocidad = 0;

    if (objetivoCombate && distDestino <= acompanante.rangoAtaque + 0.3) {
      // En rango de ataque: golpear al monstruo
      estadoNuevo = 'attack';
      acompanante.rotacion = Math.atan2(dx, dz);

      if (acompanante.tiempoSiguienteAtaque <= 0) {
        acompanante.tiempoSiguienteAtaque = acompanante.cooldownAtaque;
        const multAtaque = (acompanante.buffs && acompanante.buffs.ataqueTimer > 0) ? 1.25 : 1.0;
        const golpeDano = Math.round(acompanante.dano * multAtaque * (0.85 + Math.random() * 0.3));

        if (typeof aplicarDanoMonstruoFn === 'function') {
          aplicarDanoMonstruoFn(objetivoCombate, golpeDano);
        } else if (typeof objetivoCombate.recibirDano === 'function') {
          objetivoCombate.recibirDano(golpeDano, 'companero');
        } else if (typeof objetivoCombate.damageMonster === 'function') {
          objetivoCombate.damageMonster(golpeDano);
        } else if (typeof objetivoCombate.hp === 'number') {
          objetivoCombate.hp = Math.max(0, objetivoCombate.hp - golpeDano);
          if (objetivoCombate.hp <= 0) {
            objetivoCombate.alive = false;
            objetivoCombate.muerto = true;
            if (typeof objetivoCombate.kill === 'function') objetivoCombate.kill();
            if (registrarEventoFn) {
              const zId = objetivoCombate.zoneId || (objetivoCombate.zone && objetivoCombate.zone.id);
              registrarEventoFn({ tipo: objetivoCombate.boss ? 'jefe' : 'matar', zona: zId });
            }
          }
        }

        // Si el monstruo ha muerto con este golpe, celebrar victoria
        if (!esMonstruoCombatible(objetivoCombate)) {
          const ahora = typeof performance !== 'undefined' ? performance.now() : Date.now();
          if (ahora - acompanante.ultimoComentarioMs > 6000) {
            acompanante.ultimoComentarioMs = ahora;
            decirFrase(acompanante, elegirFrase('combate_victoria'), 4.0);
          }
          objetivoCombate = null;
        }
      }
    } else if (distDestino > distanciaFreno) {
      // Desplazarse hacia el objetivo
      if (distDestino > 4.5 || (objetivoCombate && distDestino > 2.8)) {
        estadoNuevo = 'run';
        velocidad = 10.5;
      } else {
        estadoNuevo = 'walk';
        velocidad = 5.8;
      }

      const paso = Math.min(distDestino, velocidad * dt);
      const dirX = dx / distDestino;
      const dirZ = dz / distDestino;

      acompanante.x += dirX * paso;
      acompanante.z += dirZ * paso;

      // Rotación suave hacia el vector de movimiento
      const angDeseado = Math.atan2(dirX, dirZ);
      let diffAng = angDeseado - acompanante.rotacion;
      while (diffAng < -Math.PI) diffAng += Math.PI * 2;
      while (diffAng > Math.PI) diffAng -= Math.PI * 2;
      acompanante.rotacion += diffAng * Math.min(1, dt * 10);
    } else {
      // Reposo: mirar suavemente hacia donde mira el héroe o hacia el frente
      estadoNuevo = 'idle';
      let diffAng = heroeRot - acompanante.rotacion;
      while (diffAng < -Math.PI) diffAng += Math.PI * 2;
      while (diffAng > Math.PI) diffAng -= Math.PI * 2;
      acompanante.rotacion += diffAng * Math.min(1, dt * 3.5);
    }

    if (estadoNuevo !== acompanante.estado) {
      acompanante.estado = estadoNuevo;
      acompanante.tiempoEstado = 0;
    }

    // 4. Actualizar malla 3D y altura del terreno
    const ySuelo = getAlturaFn ? getAlturaFn(acompanante.x, acompanante.z) : 0;
    acompanante.y = ySuelo;
    acompanante.mesh.position.set(acompanante.x, ySuelo, acompanante.z);
    acompanante.mesh.rotation.y = acompanante.rotacion;

    if (acompanante.mixer) {
      acompanante.mixer.update(dt);
      reproducirAnimacionGLB(acompanante, acompanante.estado, 0.2);
    } else if (acompanante.limbs) {
      animarMiembros(acompanante.limbs, acompanante.estado, acompanante.tiempoEstado, velocidad);
    }

    // 5. Gestión del tiempo del bocadillo de diálogo flotante
    if (acompanante.tiempoFrase > 0) {
      acompanante.tiempoFrase -= dt;
      if (acompanante.tiempoFrase <= 0 && acompanante.bocadilloDom) {
        acompanante.bocadilloDom.style.opacity = '0';
      }
    }
  }

  // Muestra un mensaje flotante del aldeano sobre su cabeza en la interfaz
  function decirFrase(acompanante, texto, duracionSeg = 4.5) {
    if (!acompanante) return;
    acompanante.fraseActual = texto;
    acompanante.tiempoFrase = duracionSeg;
    acompanante.ultimoComentarioMs = Date.now();

    if (acompanante.bocadilloDom) {
      acompanante.bocadilloDom.textContent = texto;
      acompanante.bocadilloDom.style.opacity = '1';
    }
  }

  // Comprueba si el héroe o el acompañante se han acercado a un lugar secreto
  function comprobarLugaresSecretos(acompanante, lugaresSecretos, posHeroe, alDescubrirFn) {
    if (!lugaresSecretos || !lugaresSecretos.length) return null;
    const ahora = Date.now();

    for (let i = 0; i < lugaresSecretos.length; i++) {
      const sec = lugaresSecretos[i];
      const d = Math.hypot(sec.x - posHeroe.x, sec.z - posHeroe.z);
      if (d <= (sec.radio || 18)) {
        if (!sec.descubierto) {
          sec.descubierto = true;
          if (acompanante && acompanante.activo && ahora - acompanante.ultimoComentarioMs > 4000) {
            const cat = 'secreto_' + (sec.tipo || 'fuente');
            decirFrase(acompanante, elegirFrase(cat), 5.5);
          }
          if (alDescubrirFn) alDescubrirFn(sec);
          return sec;
        }
      }
    }
    return null;
  }

  const api = {
    EQUIPO_ALDEANO,
    FRASES,
    COMPANEROS,
    MAX_SLOTS_INVENTARIO,
    elegirFrase,
    crearAcompanante,
    cambiarArquetipo,
    equiparSkill,
    subirNivelSkill,
    ganarXpAcompanante,
    aplicarDopeActivo,
    construirModeloAcompanante,
    instalarModeloGLBAcompanante,
    reproducirAnimacionGLB,
    animarMiembros,
    actualizarAcompanante,
    esMonstruoCombatible,
    decirFrase,
    calcularDireccionYDistancia,
    darConsejoGuia,
    comprobarLugaresSecretos,
    recibirDanoAcompanante,
    revivirAcompanante,
    agregarObjetoAcompanante,
    removerObjetoAcompanante,
    darPocionesVidaAcompanante,
    tomarPocionAutomaticaAcompanante,
    equiparPiezaAcompanante,
    sincronizarArquetipoActivo,
    clonarEstadoBaseArquetipo
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AcompananteLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
