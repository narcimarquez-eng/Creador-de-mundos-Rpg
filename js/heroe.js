/*
 * heroe.js — Estadísticas del héroe, habilidades (pasivas y activas), puntos y estado guardado (sin gráficos).
 * Expone window.HeroeLib (o module.exports en Node para las pruebas).
 *
 * Los puntos llegan de la historia (capítulos de js/historia.js), de los encargos de zona y de la lucha
 * (cada PUNTOS_KILLS monstruos). Se gastan en el entrenador. Las activas: el impacto sísmico y la nova las desbloquea la historia;
 * las técnicas de arma y de arco, el nivel del héroe. Cuatro huecos (Q, E, Z, V) eligen cuáles se usan.
 */
(function (root) {
  "use strict";

  const PUNTOS_KILLS = 20;   // cada 20 monstruos derrotados, 1 punto de lucha

  const CLASES_ARMA_DE_PROFESION = {
    guerrero: ['espadas', 'mandobles', 'hachas', 'hachas_2m', 'mazas', 'lanzas'],
    cazador:  ['arcos', 'lanzas', 'dagas'],
    mago:     ['bastones'],
    picaro:   ['dagas', 'espadas']
  };

  const NOMBRES_CLASE_ARMA = {
    espadas:   'Espada (1M)',
    mandobles: 'Mandoble (2M)',
    dagas:     'Dagas',
    hachas:    'Hacha (1M)',
    hachas_2m: 'Hacha / Guadaña (2M)',
    mazas:     'Maza / Martillo',
    lanzas:    'Lanza (2M)',
    arcos:     'Arco (2M)',
    bastones:  'Báculo / Cetro (2M)'
  };

  // Profesiones jugables: cada una define silueta de armadura, familias de arma, estadísticas base y barra inicial
  const PROFESIONES = {
    guerrero: {
      id: 'guerrero',
      nombre: 'Guerrero',
      icono: '🛡️',
      rol: 'Vanguardia · Cuerpo a cuerpo',
      desc: 'Maestro de armas pesadas y escudo. Alta resistencia y golpes demoledores en primera línea.',
      pasiva: '+20 vida base, +3 vida/nivel, +5 % reducción de daño; espada, mandoble, hacha, maza y lanza.',
      tipoArmadura: 'pesada',
      familiasArma: ['legado', 'espada', 'mandoble', 'hacha', 'maza', 'lanza'],
      clasesArma: CLASES_ARMA_DE_PROFESION.guerrero,
      vidaBase: 120, vidaNivel: 15,
      manaBase: 45, manaNivel: 5,
      ataqueBase: 2,
      poderMagicoNivel: 0, poderMagicoPorInt: 0,
      criticoBase: 0.05,
      reduccionBonus: 0.05, velocidadBonus: 0, velAtaqueBonus: 0,
      dodgeCdMult: 1.0, mpRegenMult: 1.0,
      barraInicial: { q: 'sw_iaido', e: 'sw_solar', z: 'sw_blitz', v: 'sw_cross' },
      atajos: ['sw_iaido', 'sw_blitz', 'sw_celestial']
    },
    cazador: {
      id: 'cazador',
      nombre: 'Cazador',
      icono: '🏹',
      rol: 'Tirador · Combate a distancia',
      desc: 'Rastreador ágil con arco largo, lanza y dagas. Dispara desde lejos, atrapa presas y esquiva con soltura.',
      pasiva: '+4 % crítico base, +6 % velocidad de movimiento, -15 % recarga de esquiva; arcos, lanzas y dagas.',
      tipoArmadura: 'ligera',
      familiasArma: ['arco', 'lanza', 'daga'],
      clasesArma: CLASES_ARMA_DE_PROFESION.cazador,
      vidaBase: 95, vidaNivel: 11,
      manaBase: 55, manaNivel: 7,
      ataqueBase: 1,
      poderMagicoNivel: 0, poderMagicoPorInt: 0,
      criticoBase: 0.09,
      reduccionBonus: 0.01, velocidadBonus: 0.06, velAtaqueBonus: 0.05,
      dodgeCdMult: 0.85, mpRegenMult: 1.1,
      barraInicial: { q: 'bw_bolt', e: 'bw_double', z: 'bw_frost', v: 'bw_aerial' },
      atajos: ['bw_bolt', 'bw_barrage', 'bw_prism']
    },
    mago: {
      id: 'mago',
      nombre: 'Mago',
      icono: '🔮',
      rol: 'Arcanista · Conjuros elementales',
      desc: 'Portador de báculo y magia elemental. Menor defensa física, pero gran maná y conjuros devastadores.',
      pasiva: '+40 maná base, +50 % regen de maná y Poder Mágico (+1.5/nivel y +2.5/Intelecto); báculos y cetros.',
      tipoArmadura: 'mago',
      familiasArma: ['baculo', 'cetro'],
      clasesArma: CLASES_ARMA_DE_PROFESION.mago,
      vidaBase: 80, vidaNivel: 9,
      manaBase: 90, manaNivel: 12,
      ataqueBase: 0,
      poderMagicoNivel: 1.5, poderMagicoPorInt: 2.5,
      criticoBase: 0.06,
      reduccionBonus: 0, velocidadBonus: 0.02, velAtaqueBonus: 0,
      dodgeCdMult: 0.95, mpRegenMult: 1.5,
      barraInicial: { q: 'st_tempest', e: 'st_meteor', z: 'bola_fuego', v: 'lanza_hielo' },
      atajos: ['st_tempest', 'st_meteor', 'st_nova']
    },
    picaro: {
      id: 'picaro',
      nombre: 'Pícaro',
      icono: '🗡️',
      rol: 'Asesino · Sigilo y veneno',
      desc: 'Combatiente veloz con dagas y espadas ligeras. Altísimo crítico, paso sombrío y hojas envenenadas.',
      pasiva: '+7 % crítico base, +8 % velocidad, +10 % vel. ataque y -30 % recarga de esquiva; dagas y espadas.',
      tipoArmadura: 'ligera',
      familiasArma: ['daga', 'espada'],
      clasesArma: CLASES_ARMA_DE_PROFESION.picaro,
      vidaBase: 95, vidaNivel: 11,
      manaBase: 50, manaNivel: 6,
      ataqueBase: 1,
      poderMagicoNivel: 0, poderMagicoPorInt: 0,
      criticoBase: 0.12,
      reduccionBonus: 0.02, velocidadBonus: 0.08, velAtaqueBonus: 0.10,
      dodgeCdMult: 0.7, mpRegenMult: 1.15,
      barraInicial: { q: 'dg_dash', e: 'dg_blink', z: 'dg_rush', v: 'dg_venom' },
      atajos: ['dg_dash', 'dg_venom', 'dg_zigzag']
    }
  };

  const NIVEL_SUBCLASE = 15;

  // Especializaciones de nivel 15 (2 subclases por profesión)
  const SUBCLASES = {
    paladin: {
      id: 'paladin', clase: 'guerrero', nombre: 'Paladín del Alba', icono: '🛡️',
      desc: 'Baluarte sagrado: +60 vida, +8 % reducción de daño, +8 % bloqueo y +6 % reflejo.',
      bonos: { vida: 60, reduccion: 0.08, bloqueo: 0.08, reflejo: 0.06 }
    },
    berserker: {
      id: 'berserker', clase: 'guerrero', nombre: 'Berserker Carmesí', icono: '🪓',
      desc: 'Furia imparable: +16 % daño, +5 % robo de vida, +12 % vel. ataque y +5 % crítico.',
      bonos: { danio: 0.16, robo: 0.05, velocidadAtaque: 0.12, critico: 0.05 }
    },
    francotirador: {
      id: 'francotirador', clase: 'cazador', nombre: 'Francotirador Real', icono: '🎯',
      desc: 'Puntería letal: +12 % crítico, +14 % daño y +8 % velocidad de ataque.',
      bonos: { critico: 0.12, danio: 0.14, velocidadAtaque: 0.08 }
    },
    trampero: {
      id: 'trampero', clase: 'cazador', nombre: 'Trampero Silvestre', icono: '🌿',
      desc: 'Control del terreno: +35 vida, +8 % velocidad, -15 % CD esquiva y +25 % daño a ralentizados.',
      bonos: { vida: 35, velocidad: 0.08, dodgeCdMult: 0.85, multSlowBonus: 0.25 }
    },
    piromante: {
      id: 'piromante', clase: 'mago', nombre: 'Piromante Solar', icono: '🔥',
      desc: 'Dominio ígneo: +14 Poder Mágico, +8 % crítico y +25 % daño con fuego.',
      bonos: { poderMagico: 14, critico: 0.08, fuegoMult: 0.25 }
    },
    criomante: {
      id: 'criomante', clase: 'mago', nombre: 'Criomante Glacial', icono: '❄️',
      desc: 'Armadura de éter: +60 maná, ×1.25 regen maná, +10 % escudo de maná y +25 % daño con hielo.',
      bonos: { mana: 60, mpRegenMult: 1.25, escudoBonusPct: 0.10, hieloMult: 0.25 }
    },
    asesino: {
      id: 'asesino', clase: 'picaro', nombre: 'Asesino Letal', icono: '☠️',
      desc: 'Toxinas mortales: +10 % crítico, +12 % daño y +45 % daño de veneno.',
      bonos: { critico: 0.10, danio: 0.12, venenoMult: 0.45 }
    },
    sombra: {
      id: 'sombra', clase: 'picaro', nombre: 'Caminante de Sombras', icono: '🌑',
      desc: 'Reflejos letales: +10 % velocidad, -20 % CD esquiva, +15 % vel. ataque y +4 % robo de vida.',
      bonos: { velocidad: 0.10, dodgeCdMult: 0.80, velocidadAtaque: 0.15, robo: 0.04 }
    }
  };

  // Habilidades: pasivas (cada punto suma) y activas (se mejoran hasta el máximo)
  const HABILIDADES = {
    vitalidad: { tipo: 'pasiva', nombre: 'Vitalidad', desc: '+10 vida máxima por punto', max: 10 },
    fuerza: { tipo: 'pasiva', nombre: 'Fuerza', desc: '+1 de ataque por punto', max: 10 },
    destreza: { tipo: 'pasiva', nombre: 'Destreza', desc: '+1 % de crítico por punto', max: 10 },
    entereza: { tipo: 'pasiva', nombre: 'Entereza', desc: '+1 % de reducción de daño por punto', max: 10 },
    intelecto: { tipo: 'pasiva', nombre: 'Intelecto', desc: '+8 maná máximo por punto (y +Poder Mágico en Mago)', max: 10 },
    piel_acero: { tipo: 'pasiva', nombre: 'Piel de Acero', desc: '+15 vida máxima y +1.5 % reducción de daño por punto', max: 5, clases: ['guerrero'] },
    ojo_halcon: { tipo: 'pasiva', nombre: 'Ojo de Halcón', desc: '+2 % crítico y +2 % daño por punto', max: 5, clases: ['cazador'] },
    maestria_arcana: { tipo: 'pasiva', nombre: 'Maestría Arcana', desc: '+3 Poder Mágico y +10 maná máximo por punto', max: 5, clases: ['mago'] },
    paso_silencioso: { tipo: 'pasiva', nombre: 'Paso Silencioso', desc: '+2 % crítico, +1.5 % velocidad y +2 % vel. ataque por punto', max: 5, clases: ['picaro'] },
    sismo: { tipo: 'activa', nombre: 'Impacto sísmico', desc: '+25 % de daño por nivel', max: 3, capitulo: 4, clases: null },
    nova: { tipo: 'activa', nombre: 'Explosión nova', desc: '+25 % de daño por nivel', max: 3, capitulo: 8, clases: null },
    acompanante: { tipo: 'especial', nombre: 'Acompañante Aldeano (Rowan)', desc: 'Un leal aldeano explorador te acompaña y lucha a tu lado', max: 1, capitulo: 3 },
    // Técnicas: se pueden usar desde su nivel; los puntos las mejoran. arma: 'cuerpo', 'arco' o 'baculo'
    tajo: { tipo: 'activa', nombre: 'Tajo giratorio', desc: '+25 % de daño por nivel', max: 3, nivel: 3, arma: 'cuerpo', clases: ['guerrero'] },
    estocada: { tipo: 'activa', nombre: 'Estocada a fondo', desc: '+25 % de daño por nivel', max: 3, nivel: 5, arma: 'cuerpo', clases: ['picaro'] },
    suspension: { tipo: 'activa', nombre: 'Flecha en suspensión', desc: '+25 % de daño por nivel', max: 3, nivel: 6, arma: 'arco', clases: ['cazador'] },
    ascendente: { tipo: 'activa', nombre: 'Tajo ascendente', desc: '+25 % de daño por nivel', max: 3, nivel: 7, arma: 'cuerpo', clases: ['guerrero'] },
    hendidura: { tipo: 'activa', nombre: 'Hendidura vertical', desc: '+25 % de daño por nivel', max: 3, nivel: 9, arma: 'cuerpo', clases: ['guerrero'] },
    contraataque: { tipo: 'activa', nombre: 'Parada y contraataque', desc: '+25 % de daño por nivel', max: 3, nivel: 11, arma: 'cuerpo', clases: ['guerrero'] },
    torbellino: { tipo: 'activa', nombre: 'Torbellino', desc: '+25 % de daño por nivel', max: 3, nivel: 13, arma: 'cuerpo', clases: ['guerrero'] },
    voltereta: { tipo: 'activa', nombre: 'Voltereta mortal', desc: '+25 % de daño por nivel', max: 3, nivel: 15, arma: 'cuerpo', clases: ['cazador', 'picaro'] },
    tornillo: { tipo: 'activa', nombre: 'Tornillo triple', desc: '+25 % de daño por nivel', max: 3, nivel: 18, arma: 'cuerpo', clases: ['picaro'] },
    // Habilidades activas desbloqueables por nivel y profesión
    corte_cruzado: { tipo: 'activa', nombre: 'Corte en Cruz', desc: '+25 % de daño por nivel · dos tajos cruzados veloces', max: 3, nivel: 2, arma: 'cuerpo', clases: ['guerrero', 'picaro'] },
    flecha_perforante: { tipo: 'activa', nombre: 'Flecha Perforante', desc: '+25 % de daño por nivel · flecha que atraviesa enemigos en línea', max: 3, nivel: 2, arma: 'arco', clases: ['cazador'] },
    rafaga: { tipo: 'activa', nombre: 'Ráfaga de Viento', desc: '+25 % de daño por nivel · proyectil cortante de viento', max: 3, nivel: 4, arma: 'cuerpo', clases: ['cazador', 'picaro'] },
    escudo_mana: { tipo: 'activa', nombre: 'Escudo de Maná', desc: '+25 % de daño por nivel · onda arcana con barrera protectora', max: 3, nivel: 4, arma: 'baculo', clases: ['mago'] },
    paso_sombrio: { tipo: 'activa', nombre: 'Paso Sombrío', desc: '+25 % de daño por nivel · asalto veloz hacia el objetivo con +25 % crítico', max: 3, nivel: 4, arma: 'cuerpo', clases: ['picaro'] },
    hoja_veneno: { tipo: 'activa', nombre: 'Hoja Envenenada', desc: '+25 % de daño por nivel · envenena al objetivo durante 5 s', max: 3, nivel: 6, arma: 'cuerpo', clases: ['picaro'] },
    furia: { tipo: 'activa', nombre: 'Furia Sangrienta', desc: '+25 % de daño por nivel · tajo salvaje devastador', max: 3, nivel: 8, arma: 'cuerpo', clases: ['guerrero', 'picaro'] },
    trampa_espinas: { tipo: 'activa', nombre: 'Trampa de Espinas', desc: '+25 % de daño por nivel · zarzas en área que ralentizan enemigos', max: 3, nivel: 8, arma: 'arco', clases: ['cazador'] },
    escudo_espiritu: { tipo: 'activa', nombre: 'Escudo del Bastión', desc: '+25 % de daño por nivel · golpe contundente con barrera', max: 3, nivel: 10, arma: 'cuerpo', clases: ['guerrero'] },
    salto_demoledor: { tipo: 'activa', nombre: 'Salto Demoledor', desc: '+25 % de daño por nivel · caída sísmica circular', max: 3, nivel: 12, arma: 'cuerpo', clases: ['guerrero'] },
    lluvia_proyectiles: { tipo: 'activa', nombre: 'Lluvia de Flechas', desc: '+25 % de daño por nivel · salva perforante a distancia', max: 3, nivel: 14, arma: 'arco', clases: ['cazador'] },
    juicio_relampago: { tipo: 'activa', nombre: 'Filo Relámpago', desc: '+25 % de daño por nivel · descarga eléctrica veloz', max: 3, nivel: 16, arma: 'cuerpo', clases: ['picaro'] },
    sentencia_titan: { tipo: 'activa', nombre: 'Sentencia del Titán', desc: '+25 % de daño por nivel · ataque colosal en área', max: 3, nivel: 20, arma: 'cuerpo', clases: ['guerrero'] },
    // Magia elemental (exclusiva de Mago)
    bola_fuego: { tipo: 'activa', nombre: 'Bola de Fuego', desc: '+25 % de daño por nivel · proyectil ígneo explosivo en área', max: 3, nivel: 1, clases: ['mago'] },
    lanza_hielo: { tipo: 'activa', nombre: 'Lanza de Hielo', desc: '+25 % de daño por nivel · proyectil glacial que ralentiza enemigos', max: 3, nivel: 1, clases: ['mago'] },
    ventisca_glacial: { tipo: 'activa', nombre: 'Ventisca Glacial', desc: '+25 % de daño por nivel · tormenta helada en área que congela', max: 3, nivel: 6, clases: ['mago'] },
    tormenta_fuego: { tipo: 'activa', nombre: 'Lluvia de Meteoros', desc: '+25 % de daño por nivel · bombardeo meteórico en área', max: 3, nivel: 8, clases: ['mago'] },
    rayo_arcano: { tipo: 'activa', nombre: 'Tormenta Eléctrica', desc: '+25 % de daño por nivel · relámpagos arcanos alrededor', max: 3, nivel: 12, clases: ['mago'] },
    // ===== Nuevas Skills por clase de arma (aprendizaje progresivo) =====
    // Espadas (1M)
    sw_iaido:     { tipo: 'activa', nombre: 'Desenvaine Veloz',       desc: '+25 % daño/nv · estocada eléctrica veloz con espada', max: 5, nivel: 1,  arma: 'cuerpo', armaClase: 'espadas', clases: ['guerrero', 'picaro'] },
    sw_solar:     { tipo: 'activa', nombre: 'Tajo de Fuego Solar',    desc: '+25 % daño/nv · corte ascendente ardiente con espada', max: 5, nivel: 4,  arma: 'cuerpo', armaClase: 'espadas', clases: ['guerrero', 'picaro'] },
    sw_blitz:     { tipo: 'activa', nombre: 'Asalto Relámpago',       desc: '+25 % daño/nv · embestida eléctrica hacia el enemigo', max: 5, nivel: 7,  arma: 'cuerpo', armaClase: 'espadas', clases: ['guerrero', 'picaro'] },
    sw_cross:     { tipo: 'activa', nombre: 'Doble Tajo en Cruz',     desc: '+25 % daño/nv · doble corte arcano en X', max: 5, nivel: 11, arma: 'cuerpo', armaClase: 'espadas', clases: ['guerrero', 'picaro'] },
    sw_lightning: { tipo: 'activa', nombre: 'Corte Relámpago',        desc: '+25 % daño/nv · creciente eléctrica a distancia', max: 5, nivel: 16, arma: 'cuerpo', armaClase: 'espadas', clases: ['guerrero', 'picaro'] },
    sw_celestial: { tipo: 'activa', nombre: 'Espada Celestial',       desc: '+25 % daño/nv · tajo sagrado rompecielos', max: 5, nivel: 22, arma: 'cuerpo', armaClase: 'espadas', clases: ['guerrero', 'picaro'] },
    // Mandobles (2M)
    gs_sweep:     { tipo: 'activa', nombre: 'Gran Barrido (2M)',      desc: '+25 % daño/nv · amplio arco eléctrico con mandoble', max: 5, nivel: 1,  arma: 'cuerpo', armaClase: 'mandobles', clases: ['guerrero'] },
    gs_titan:     { tipo: 'activa', nombre: 'Tajo Titánico (2M)',     desc: '+25 % daño/nv · golpe ígneo pesado de dos manos', max: 5, nivel: 4,  arma: 'cuerpo', armaClase: 'mandobles', clases: ['guerrero'] },
    gs_cross:     { tipo: 'activa', nombre: 'Doble Cruz del Dragón',  desc: '+25 % daño/nv · doble corte dracónico de fuego', max: 5, nivel: 8,  arma: 'cuerpo', armaClase: 'mandobles', clases: ['guerrero'] },
    gs_colossus:  { tipo: 'activa', nombre: 'Hendidura Colosal (2M)', desc: '+25 % daño/nv · hendidura de magma y acero', max: 5, nivel: 12, arma: 'cuerpo', armaClase: 'mandobles', clases: ['guerrero'] },
    gs_crescent:  { tipo: 'activa', nombre: 'Onda de Titanio (2M)',   desc: '+25 % daño/nv · onda relámpago de largo alcance', max: 5, nivel: 17, arma: 'cuerpo', armaClase: 'mandobles', clases: ['guerrero'] },
    gs_skybreak:  { tipo: 'activa', nombre: 'Tajo Rompecielos (2M)',  desc: '+25 % daño/nv · impacto celestial definitivo de mandoble', max: 5, nivel: 24, arma: 'cuerpo', armaClase: 'mandobles', clases: ['guerrero'] },
    // Dagas
    dg_dash:      { tipo: 'activa', nombre: 'Paso de Sombra',         desc: '+25 % daño/nv · teletransporte sombrío y golpe crítico', max: 5, nivel: 1,  arma: 'cuerpo', armaClase: 'dagas', clases: ['picaro', 'cazador'] },
    dg_blink:     { tipo: 'activa', nombre: 'Corte Fantasma',         desc: '+25 % daño/nv · corte fugaz con dagas', max: 5, nivel: 4,  arma: 'cuerpo', armaClase: 'dagas', clases: ['picaro', 'cazador'] },
    dg_rush:      { tipo: 'activa', nombre: 'Asalto Asesino',         desc: '+25 % daño/nv · carga por la espalda con +25 % crítico', max: 5, nivel: 7,  arma: 'cuerpo', armaClase: 'dagas', clases: ['picaro', 'cazador'] },
    dg_venom:     { tipo: 'activa', nombre: 'Hélice Venenosa',        desc: '+25 % daño/nv · giro tóxico que envenena 5 s', max: 5, nivel: 11, arma: 'cuerpo', armaClase: 'dagas', clases: ['picaro', 'cazador'] },
    dg_shadow:    { tipo: 'activa', nombre: 'Ráfaga Sombría',         desc: '+25 % daño/nv · ráfaga múltiple de cortes sombríos', max: 5, nivel: 16, arma: 'cuerpo', armaClase: 'dagas', clases: ['picaro', 'cazador'] },
    dg_zigzag:    { tipo: 'activa', nombre: 'Zigzag Relámpago',       desc: '+25 % daño/nv · triple impacto eléctrico en área', max: 5, nivel: 22, arma: 'cuerpo', armaClase: 'dagas', clases: ['picaro', 'cazador'] },
    // Hachas (1M)
    ax_thunder:   { tipo: 'activa', nombre: 'Furia del Trueno',       desc: '+25 % daño/nv · golpe cargado de trueno con hacha', max: 5, nivel: 1,  arma: 'cuerpo', armaClase: 'hachas', clases: ['guerrero'] },
    ax_inferno:   { tipo: 'activa', nombre: 'Tornado Ígneo',          desc: '+25 % daño/nv · giro ardiente 360°', max: 5, nivel: 5,  arma: 'cuerpo', armaClase: 'hachas', clases: ['guerrero'] },
    ax_berserk:   { tipo: 'activa', nombre: 'Salto Berserker',        desc: '+25 % daño/nv · salto demoledor contra el objetivo', max: 5, nivel: 10, arma: 'cuerpo', armaClase: 'hachas', clases: ['guerrero'] },
    ax_reap:      { tipo: 'activa', nombre: 'Siega Salvaje',          desc: '+25 % daño/nv · doble segado eléctrico giratorio', max: 5, nivel: 15, arma: 'cuerpo', armaClase: 'hachas', clases: ['guerrero'] },
    ax_nordic:    { tipo: 'activa', nombre: 'Juicio Nórdico',         desc: '+25 % daño/nv · tormenta eléctrica de área', max: 5, nivel: 22, arma: 'cuerpo', armaClase: 'hachas', clases: ['guerrero'] },
    // Hachas 2M
    a2_sweep:     { tipo: 'activa', nombre: 'Barrido Segador (2M)',   desc: '+25 % daño/nv · barrido del vacío con hacha 2M', max: 5, nivel: 1,  arma: 'cuerpo', armaClase: 'hachas_2m', clases: ['guerrero'] },
    a2_titan:     { tipo: 'activa', nombre: 'Tajo Titánico Hacha (2M)', desc: '+25 % daño/nv · arco demoledor de fuego', max: 5, nivel: 5, arma: 'cuerpo', armaClase: 'hachas_2m', clases: ['guerrero'] },
    a2_colossus:  { tipo: 'activa', nombre: 'Hendidura Hacha (2M)',   desc: '+25 % daño/nv · golpe colosal ígneo', max: 5, nivel: 10, arma: 'cuerpo', armaClase: 'hachas_2m', clases: ['guerrero'] },
    a2_vortex:    { tipo: 'activa', nombre: 'Guadaña del Vacío (2M)', desc: '+25 % daño/nv · vórtice abisal de doble impacto', max: 5, nivel: 16, arma: 'cuerpo', armaClase: 'hachas_2m', clases: ['guerrero'] },
    a2_demolish:  { tipo: 'activa', nombre: 'Triple Demolición (2M)', desc: '+25 % daño/nv · triple impacto prismático sísmico', max: 5, nivel: 22, arma: 'cuerpo', armaClase: 'hachas_2m', clases: ['guerrero'] },
    // Mazas y Martillos
    mc_storm:     { tipo: 'activa', nombre: 'Martillo de Tormenta',   desc: '+25 % daño/nv · descarga eléctrica vertical', max: 5, nivel: 1,  arma: 'cuerpo', armaClase: 'mazas', clases: ['guerrero'] },
    mc_crush:     { tipo: 'activa', nombre: 'Aplastamiento Colosal',  desc: '+25 % daño/nv · impacto contundente de trueno', max: 5, nivel: 5,  arma: 'cuerpo', armaClase: 'mazas', clases: ['guerrero'] },
    mc_seismic:   { tipo: 'activa', nombre: 'Furia Sísmica',          desc: '+25 % daño/nv · doble onda de magma en área', max: 5, nivel: 10, arma: 'cuerpo', armaClase: 'mazas', clases: ['guerrero'] },
    mc_titan:     { tipo: 'activa', nombre: 'Impacto Titán',          desc: '+25 % daño/nv · salto sagrado devastador', max: 5, nivel: 16, arma: 'cuerpo', armaClase: 'mazas', clases: ['guerrero'] },
    mc_judgment:  { tipo: 'activa', nombre: 'Juicio del Trueno',      desc: '+25 % daño/nv · pilar celestial eléctrico', max: 5, nivel: 22, arma: 'cuerpo', armaClase: 'mazas', clases: ['guerrero'] },
    // Lanzas (2M)
    ln_sweep:     { tipo: 'activa', nombre: 'Gran Barrido de Asta',   desc: '+25 % daño/nv · barrido amplio con lanza 2M', max: 5, nivel: 1,  arma: 'cuerpo', armaClase: 'lanzas', clases: ['guerrero', 'cazador'] },
    ln_skewer:    { tipo: 'activa', nombre: 'Empalamiento Total (2M)',desc: '+25 % daño/nv · estocada eléctrica de largo alcance', max: 5, nivel: 5,  arma: 'cuerpo', armaClase: 'lanzas', clases: ['guerrero', 'cazador'] },
    ln_phalanx:   { tipo: 'activa', nombre: 'Barrido de Falange (2M)',desc: '+25 % daño/nv · tajo glacial que ralentiza', max: 5, nivel: 10, arma: 'cuerpo', armaClase: 'lanzas', clases: ['guerrero', 'cazador'] },
    ln_valkyrie:  { tipo: 'activa', nombre: 'Salto de Valquiria (2M)',desc: '+25 % daño/nv · salto con pértiga hacia el objetivo', max: 5, nivel: 16, arma: 'cuerpo', armaClase: 'lanzas', clases: ['guerrero', 'cazador'] },
    ln_dragon:    { tipo: 'activa', nombre: 'Lanza del Dragón (2M)',  desc: '+25 % daño/nv · ciclón eléctrico doble', max: 5, nivel: 22, arma: 'cuerpo', armaClase: 'lanzas', clases: ['guerrero', 'cazador'] },
    // Arcos (2M)
    bw_bolt:      { tipo: 'activa', nombre: 'Flecha de Relámpago',    desc: '+25 % daño/nv · disparo eléctrico preciso', max: 5, nivel: 1,  arma: 'arco', armaClase: 'arcos', clases: ['cazador'] },
    bw_double:    { tipo: 'activa', nombre: 'Doble Shot',             desc: '+25 % daño/nv · descarga doble veloz', max: 5, nivel: 4,  arma: 'arco', armaClase: 'arcos', clases: ['cazador'] },
    bw_frost:     { tipo: 'activa', nombre: 'Flecha Glacial',         desc: '+25 % daño/nv · flecha helada que ralentiza', max: 5, nivel: 8,  arma: 'arco', armaClase: 'arcos', clases: ['cazador'] },
    bw_aerial:    { tipo: 'activa', nombre: 'Mortal Celestial',       desc: '+25 % daño/nv · tiro acrobático aéreo arcano', max: 5, nivel: 12, arma: 'arco', armaClase: 'arcos', clases: ['cazador'] },
    bw_barrage:   { tipo: 'activa', nombre: 'Descarga de Meteoros',   desc: '+25 % daño/nv · salva ígnea explosiva en área', max: 5, nivel: 17, arma: 'arco', armaClase: 'arcos', clases: ['cazador'] },
    bw_prism:     { tipo: 'activa', nombre: 'Lluvia Prisma',          desc: '+25 % daño/nv · lluvia prismática de área total', max: 5, nivel: 23, arma: 'arco', armaClase: 'arcos', clases: ['cazador'] },
    // Bastones y cetros (Mago)
    st_tempest:   { tipo: 'activa', nombre: 'Tempestad Arcana (2M)',  desc: '+25 % daño/nv · descarga arcana con báculo', max: 5, nivel: 1,  arma: 'baculo', armaClase: 'bastones', clases: ['mago'] },
    st_meteor:    { tipo: 'activa', nombre: 'Meteoros Astrales',      desc: '+25 % daño/nv · impacto dual de meteoros ígneos', max: 5, nivel: 5,  arma: 'baculo', armaClase: 'bastones', clases: ['mago'] },
    st_judgment:  { tipo: 'activa', nombre: 'Juicio Celestial (2M)',  desc: '+25 % daño/nv · pilar de luz sagrada', max: 5, nivel: 10, arma: 'baculo', armaClase: 'bastones', clases: ['mago'] },
    st_solar:     { tipo: 'activa', nombre: 'Cañón Solar',            desc: '+25 % daño/nv · haz de energía solar concentrada', max: 5, nivel: 16, arma: 'baculo', armaClase: 'bastones', clases: ['mago'] },
    st_nova:      { tipo: 'activa', nombre: 'Supernova Astral',       desc: '+25 % daño/nv · explosión prismática suprema', max: 5, nivel: 22, arma: 'baculo', armaClase: 'bastones', clases: ['mago'] }
  };

  // Huecos de la barra de habilidades y lo que llevan al empezar
  const TECLAS = ['q', 'e', 'z', 'v'];
  const BARRA_INICIAL = { q: 'sismo', e: 'nova', z: 'tajo', v: 'estocada' };

  // Habilidades con otro nombre en partidas antiguas: la patada giratoria es ahora el impacto sísmico
  const RENOMBRADAS = { patada: 'sismo' };

  // Tipos de objetivo de la historia (ver js/historia.js)
  const TIPOS_HISTORIA = ['matar', 'jefe', 'visitar', 'hablar', 'forjar', 'secreto'];

  // Habilidades especiales de los objetos (según el tipo de pieza). Se eligen por piezaId y nivel.
  const ESPECIALES = {
    arma: [
      { id: 'filo', nombre: 'Filo sangrante', efecto: { critico: 0.05 } },
      { id: 'pesado', nombre: 'Golpe pesado', efecto: { danio: 0.10 } },
      { id: 'veloz', nombre: 'Ataque veloz', efecto: { velocidadAtaque: 0.10 } },
      { id: 'vampirica', nombre: 'Vampírica', efecto: { robo: 0.03 } }
    ],
    armadura: [
      { id: 'acero', nombre: 'Piel de acero', efecto: { defensa: 0.10 } },
      { id: 'vigia', nombre: 'Vigía', efecto: { vida: 15 } },
      { id: 'ligera', nombre: 'Ligera', efecto: { velocidad: 0.05 } },
      { id: 'espinas', nombre: 'Espinas', efecto: { reflejo: 0.05 } }
    ],
    escudo: [
      { id: 'bloqueo', nombre: 'Bloqueo firme', efecto: { bloqueo: 0.05 } },
      { id: 'solar', nombre: 'Escudo solar', efecto: { vida: 10 } }
    ]
  };

  function hash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }

  // Tipo de objeto: un arma con «Escudo» en el nombre es un escudo; el resto de armas son armas
  function tipoDe(obj) {
    if (obj.ranura === 'weapon') return /Escudo/i.test(obj.nombre) ? 'escudo' : 'arma';
    return 'armadura';
  }

  // ¿Es un arco? (las técnicas de arco lo necesitan; con él no se usan las de cuerpo a cuerpo)
  function esArco(obj) {
    return !!obj && obj.ranura === 'weapon' && (obj.familia === 'arco' || /\bArco\b/.test(obj.nombre));
  }

  function esBaculo(obj) {
    return !!obj && obj.ranura === 'weapon' && (obj.familia === 'baculo' || /Báculo|Baculo|Cetro|Bastón|Baston|Vara/i.test(obj.nombre));
  }

  function esDaga(obj) {
    return !!obj && obj.ranura === 'weapon' && (obj.familia === 'daga' || /Daga|Kris/i.test(obj.nombre));
  }

  function profesionDe(clase) {
    return PROFESIONES[clase] || PROFESIONES.guerrero;
  }

  function barraInicialDeClase(clase) {
    const p = PROFESIONES[clase];
    return Object.assign({}, (p && p.barraInicial) || BARRA_INICIAL);
  }

  function habilidadDeClase(id, clase) {
    const hab = HABILIDADES[id];
    if (!hab) return false;
    if (!clase) return true;
    if (Array.isArray(hab.clases)) return hab.clases.includes(clase);
    return true;
  }

  function habilidadesDeClase(clase) {
    return Object.keys(HABILIDADES).filter(id => HABILIDADES[id].tipo === 'activa' && habilidadDeClase(id, clase));
  }

  function habilidadesDeArma(claseArma, clase = null) {
    if (!claseArma) return [];
    return Object.keys(HABILIDADES)
      .filter(id => HABILIDADES[id].tipo === 'activa' && HABILIDADES[id].armaClase === claseArma && (!clase || habilidadDeClase(id, clase)))
      .sort((a, b) => (HABILIDADES[a].nivel || 1) - (HABILIDADES[b].nivel || 1));
  }

  function barraInicialDeArma(claseArma, clase = null) {
    const ids = habilidadesDeArma(claseArma, clase);
    if (!ids.length) return barraInicialDeClase(clase);
    const barra = { q: null, e: null, z: null, v: null };
    TECLAS.forEach((t, i) => { if (ids[i]) barra[t] = ids[i]; });
    return barra;
  }

  function sincronizarBarraConArma(h, claseArma, nivelHeroe = 1, clase = null) {
    if (!h) return {};
    if (!h.barrasPorArma || typeof h.barrasPorArma !== 'object') h.barrasPorArma = {};
    if (h.armaClaseActual && NOMBRES_CLASE_ARMA[h.armaClaseActual]) {
      h.barrasPorArma[h.armaClaseActual] = Object.assign({}, h.barra);
    }
    if (!claseArma || !NOMBRES_CLASE_ARMA[claseArma]) return h.barra;
    const guardada = h.barrasPorArma[claseArma];
    if (guardada && typeof guardada === 'object') {
      const nueva = { q: null, e: null, z: null, v: null };
      const usadas = new Set();
      TECLAS.forEach(t => {
        const id = guardada[t];
        if (id && HABILIDADES[id] && HABILIDADES[id].tipo === 'activa' && !usadas.has(id) && (!clase || habilidadDeClase(id, clase))) {
          nueva[t] = id;
          usadas.add(id);
        }
      });
      h.barra = nueva;
    } else {
      h.barra = barraInicialDeArma(claseArma, clase);
    }
    h.armaClaseActual = claseArma;
    h.barrasPorArma[claseArma] = Object.assign({}, h.barra);
    return h.barra;
  }

  function nuevasHabilidadesAlSubirNivel(nivelAntes, nivelDespues, clase = null, claseArma = null) {
    const a = Number(nivelAntes) || 1;
    const b = Number(nivelDespues) || 1;
    if (b <= a) return [];
    const out = [];
    Object.keys(HABILIDADES).forEach(id => {
      const hab = HABILIDADES[id];
      if (!hab || hab.tipo !== 'activa' || !hab.nivel) return;
      if (hab.nivel > a && hab.nivel <= b) {
        if (clase && !habilidadDeClase(id, clase)) return;
        if (claseArma && hab.armaClase && hab.armaClase !== claseArma) return;
        out.push({ id, nombre: hab.nombre, nivel: hab.nivel, armaClase: hab.armaClase || null });
      }
    });
    return out.sort((x, y) => x.nivel - y.nivel);
  }

  function atajosDeClase(clase) {
    const p = PROFESIONES[clase];
    return p && Array.isArray(p.atajos) ? p.atajos.slice() : ['bola_fuego', 'lanza_hielo', 'tormenta_fuego'];
  }

  function subclasesDeClase(clase) {
    return Object.values(SUBCLASES).filter(s => s.clase === clase);
  }

  function subclaseDe(h, clase = null) {
    if (!h || !h.subclase || !SUBCLASES[h.subclase]) return null;
    const sub = SUBCLASES[h.subclase];
    if (clase && sub.clase !== clase) return null;
    return sub;
  }

  function elegirSubclase(h, subclaseId, nivelHeroe, clase = null) {
    if (!h) throw new Error('Estado de héroe inválido');
    if ((Number(nivelHeroe) || 1) < NIVEL_SUBCLASE) {
      throw new Error('La especialización se desbloquea en el nivel ' + NIVEL_SUBCLASE);
    }
    const sub = SUBCLASES[subclaseId];
    if (!sub) throw new Error('Subclase desconocida: ' + subclaseId);
    if (clase && sub.clase !== clase) {
      const nom = PROFESIONES[sub.clase] ? PROFESIONES[sub.clase].nombre : sub.clase;
      throw new Error(sub.nombre + ' es exclusiva de ' + nom);
    }
    h.subclase = sub.id;
    return sub;
  }

  function reiniciarPuntos(h) {
    if (!h) return 0;
    const g = h.gastados || {};
    let total = 0;
    Object.keys(g).forEach(k => { total += Math.max(0, Number(g[k]) || 0); });
    h.puntos = (h.puntos || 0) + total;
    h.gastados = {};
    return total;
  }

  function aplicarBarraDeClase(h, clase) {
    if (!h) return {};
    h.barra = barraInicialDeClase(clase);
    h.barrasPorArma = {};
    const defArma = (CLASES_ARMA_DE_PROFESION[clase] && CLASES_ARMA_DE_PROFESION[clase][0]) || null;
    h.armaClaseActual = defArma;
    if (h.subclase && SUBCLASES[h.subclase] && SUBCLASES[h.subclase].clase !== clase) {
      h.subclase = null;
    }
    return h.barra;
  }

  // Número de habilidades especiales según el nivel del objeto
  function cantidadEspeciales(nivel) {
    return nivel >= 30 ? 3 : nivel >= 15 ? 2 : nivel >= 5 ? 1 : 0;
  }

  // Especiales de un objeto: deterministas (no hace falta guardarlas)
  function especialesDe(obj) {
    const lista = ESPECIALES[tipoDe(obj)];
    const n = Math.min(cantidadEspeciales(obj.nivel), lista.length);
    const h = hash(obj.piezaId || obj.nombre);
    const out = [];
    for (let i = 0; i < n; i++) out.push(lista[(h + i) % lista.length]);
    return out;
  }

  // Estado de un héroe nuevo
  const FINALES_VALIDOS = new Set(['luz', 'sombra', 'equilibrio']);

  function nuevoHeroe() {
    return { puntos: 0, kills: 0, gastados: {}, desbloqueadas: {}, zonas: {}, titulos: [], barra: Object.assign({}, BARRA_INICIAL),
      barrasPorArma: {}, armaClaseActual: null,
      subclase: null,
      principal: { paso: 0, progreso: 0, objetivo: null },
      reputacion: { pueblo: 0, sombra: 0, vinculo: 0 },
      decisiones: {},
      finalId: null,
      dialogosVistos: {},
      hitosMundo: {},
      companeroMisiones: {} };
  }

  // Sanea el estado guardado en una partida (campos desconocidos o dañados se descartan)
  function limpiarHeroe(h) {
    const base = nuevoHeroe();
    if (!h || typeof h !== 'object') return base;
    const num = x => (isFinite(x) && x >= 0 ? Math.floor(x) : 0);
    const repNum = x => (isFinite(x) ? Math.max(-20, Math.min(50, Math.trunc(x))) : 0);
    base.puntos = num(h.puntos);
    base.kills = num(h.kills);
    Object.keys(h.gastados || {}).forEach(k => {
      const id = RENOMBRADAS[k] || k;
      if (HABILIDADES[id]) base.gastados[id] = Math.min(HABILIDADES[id].max, Math.max(base.gastados[id] || 0, num(h.gastados[k])));
    });
    Object.keys(h.desbloqueadas || {}).forEach(k => { const id = RENOMBRADAS[k] || k; if (HABILIDADES[id]) base.desbloqueadas[id] = true; });
    // Barra: solo habilidades activas, cada una en un hueco como mucho (partidas sin barra: la inicial)
    if (h.barra && typeof h.barra === 'object') {
      const usadas = new Set();
      TECLAS.forEach(t => {
        const id = RENOMBRADAS[h.barra[t]] || h.barra[t];
        base.barra[t] = HABILIDADES[id] && HABILIDADES[id].tipo === 'activa' && !usadas.has(id) ? id : null;
        if (base.barra[t]) usadas.add(base.barra[t]);
      });
    }
    if (typeof h.armaClaseActual === 'string' && NOMBRES_CLASE_ARMA[h.armaClaseActual]) {
      base.armaClaseActual = h.armaClaseActual;
    }
    if (h.barrasPorArma && typeof h.barrasPorArma === 'object') {
      Object.keys(h.barrasPorArma).forEach(wc => {
        if (!NOMBRES_CLASE_ARMA[wc] || !h.barrasPorArma[wc] || typeof h.barrasPorArma[wc] !== 'object') return;
        const b = {}, usadas = new Set();
        TECLAS.forEach(t => {
          const id = RENOMBRADAS[h.barrasPorArma[wc][t]] || h.barrasPorArma[wc][t];
          b[t] = HABILIDADES[id] && HABILIDADES[id].tipo === 'activa' && !usadas.has(id) ? id : null;
          if (b[t]) usadas.add(b[t]);
        });
        base.barrasPorArma[wc] = b;
      });
    }
    Object.keys(h.zonas || {}).forEach(k => {
      const z = h.zonas[k];
      if (!z || !TIPOS_ZONA.includes(z.tipo)) return;
      const cantidad = Math.max(1, num(z.cantidad));
      base.zonas[k] = { tipo: z.tipo, cantidad, progreso: Math.min(cantidad, num(z.progreso)),
        lista: !!z.lista, entregada: !!z.entregada };
    });
    // Historia: paso actual, su progreso y el objetivo ya elegido. Las partidas antiguas empiezan en el capítulo 1.
    const pr = h.principal;
    if (pr && typeof pr === 'object') {
      base.principal.paso = num(pr.paso);
      base.principal.objetivo = limpiarObjetivo(pr.objetivo);
      base.principal.progreso = base.principal.objetivo ? Math.min(base.principal.objetivo.cantidad, num(pr.progreso)) : 0;
    }
    // Reputación, decisiones narrativas, diálogos vistos y final elegido
    if (h.reputacion && typeof h.reputacion === 'object') {
      base.reputacion.pueblo = repNum(h.reputacion.pueblo);
      base.reputacion.sombra = repNum(h.reputacion.sombra);
      base.reputacion.vinculo = repNum(h.reputacion.vinculo);
    }
    if (h.decisiones && typeof h.decisiones === 'object') {
      Object.keys(h.decisiones).forEach(k => {
        const val = h.decisiones[k];
        if (typeof k === 'string' && k.trim() && typeof val === 'string' && val.trim()) {
          base.decisiones[k.trim().slice(0, 40)] = val.trim().slice(0, 40);
        }
      });
    }
    if (typeof h.finalId === 'string' && FINALES_VALIDOS.has(h.finalId)) {
      base.finalId = h.finalId;
    }
    if (typeof h.subclase === 'string' && SUBCLASES[h.subclase]) {
      base.subclase = h.subclase;
    }
    const copiarMapaBool = (src, dest, maxKeys) => {
      if (!src || typeof src !== 'object') return;
      Object.keys(src).slice(0, maxKeys).forEach(k => {
        if (typeof k === 'string' && k.trim() && src[k]) dest[k.trim().slice(0, 64)] = true;
      });
    };
    copiarMapaBool(h.dialogosVistos, base.dialogosVistos, 120);
    copiarMapaBool(h.hitosMundo, base.hitosMundo, 160);
    if (h.companeroMisiones && typeof h.companeroMisiones === 'object') {
      ['rowan', 'lyra', 'elian', 'brenda'].forEach(arq => {
        const entry = h.companeroMisiones[arq];
        if (!entry || typeof entry !== 'object') return;
        const etapa = Math.max(0, Math.min(3, num(entry.etapa)));
        const progreso = Math.max(0, Math.min(999, num(entry.progreso)));
        base.companeroMisiones[arq] = {
          etapa,
          progreso,
          activa: etapa >= 3 ? false : !!entry.activa,
          talentoDesbloqueado: !!(entry.talentoDesbloqueado || etapa >= 3)
        };
      });
    }
    // Títulos honoríficos desbloqueados (p. ej. "Campeones de Aden" al completar el capítulo 16)
    const vistosTit = new Set();
    if (Array.isArray(h.titulos)) {
      h.titulos.forEach(t => {
        if (typeof t === 'string') {
          const limpio = t.trim().slice(0, 60);
          if (limpio && !vistosTit.has(limpio)) { vistosTit.add(limpio); base.titulos.push(limpio); }
        }
      });
    }
    const tieneTituloFinal = base.titulos.some(x => x.startsWith('Campeones de ') || x.startsWith('Libertadores de '));
    if (base.principal.paso >= 16 && !tieneTituloFinal) {
      base.titulos.push('Campeones de Aden');
    }
    return base;
  }

  function bonosReputacion(h) {
    const rep = (h && h.reputacion) || { pueblo: 0, sombra: 0, vinculo: 0 };
    const pueblo = Number(rep.pueblo) || 0;
    const sombra = Number(rep.sombra) || 0;
    const vinculo = Number(rep.vinculo) || 0;
    const finalId = (h && h.finalId) || null;
    const senda = pueblo >= sombra + 2 ? 'guardia' : sombra >= pueblo + 2 ? 'sombra' : 'equilibrio';
    const sendaNombre = senda === 'guardia' ? 'Senda del Alba' : senda === 'sombra' ? 'Senda de la Sombra' : 'Senda del Equilibrio';
    return {
      pueblo, sombra, vinculo, finalId,
      senda, sendaNombre,
      descuentoTienda: pueblo >= 10 ? 0.18 : pueblo >= 6 ? 0.12 : pueblo >= 3 ? 0.05 : 0,
      descuentoSombra: sombra >= 10 ? 0.30 : sombra >= 6 ? 0.20 : sombra >= 3 ? 0.10 : 0,
      bonusDefensa: pueblo >= 10 ? 0.08 : pueblo >= 5 ? 0.04 : 0,
      bonusCritico: sombra >= 10 ? 0.06 : sombra >= 5 ? 0.03 : 0,
      bonusCriticoFinal: finalId === 'sombra' ? 0.08 : 0,
      bonusVida: (vinculo >= 10 ? 25 : vinculo >= 6 ? 15 : 0) + (finalId === 'luz' ? 25 : 0),
      bonusDanioComp: vinculo >= 10 ? 0.30 : vinculo >= 6 ? 0.20 : vinculo >= 3 ? 0.10 : 0
    };
  }

  function limpiarObjetivo(o) {
    if (!o || typeof o !== 'object' || !TIPOS_HISTORIA.includes(o.tipo)) return null;
    const texto = v => (typeof v === 'string' ? v : '');
    const out = { tipo: o.tipo, cantidad: Math.max(1, isFinite(o.cantidad) ? Math.floor(o.cantidad) : 1), nombre: texto(o.nombre), texto: texto(o.texto), encargo: texto(o.encargo) };
    ['zona', 'pueblo', 'npc'].forEach(k => { if (typeof o[k] === 'string' && o[k]) out[k] = o[k]; });
    return out;
  }

  // Encargos de zona (ver js/mision-zona.js). Cada uno cuenta lo que pide su tipo: matar (cualquier monstruo de la
  // zona, también el jefe), jefe (solo el jefe) o visitar (entrar en la zona).
  const TIPOS_ZONA = ['matar', 'jefe', 'visitar'];

  // Acepta un encargo de zona. objetivo: {tipo, cantidad}
  function aceptarZona(h, zonaId, objetivo) {
    if (!TIPOS_ZONA.includes(objetivo.tipo)) throw new Error('Tipo de encargo desconocido');
    if (h.zonas[zonaId]) throw new Error('Ya tienes este encargo');
    h.zonas[zonaId] = { tipo: objetivo.tipo, cantidad: Math.max(1, objetivo.cantidad), progreso: 0, lista: false, entregada: false };
    return h.zonas[zonaId];
  }

  // Un evento en una zona: evento es 'matar' (monstruo normal), 'jefe' o 'visitar'.
  // Devuelve true solo si este evento completa el encargo.
  function registrarZona(h, zonaId, evento) {
    const z = h.zonas[zonaId];
    if (!z || z.lista) return false;
    const cuenta = z.tipo === 'visitar' ? evento === 'visitar'
      : z.tipo === 'jefe' ? evento === 'jefe'
      : evento === 'matar' || evento === 'jefe';
    if (!cuenta) return false;
    z.progreso = Math.min(z.cantidad, z.progreso + 1);
    if (z.progreso < z.cantidad) return false;
    z.lista = true;
    return true;
  }

  // Entrega un encargo completado en su pueblo. Los premios (oro, pociones) los da la visor; aquí, los puntos.
  function entregarZona(h, zonaId, puntos) {
    const z = h.zonas[zonaId];
    if (!z || !z.lista || z.entregada) throw new Error('Este encargo no se puede entregar');
    z.entregada = true;
    h.puntos += puntos || 0;
    return z;
  }

  // Recompensa de un capítulo de la historia: puntos, título honorífico y, si procede, una habilidad activa
  function recompensar(h, r) {
    h.puntos += (r && r.puntos) || 0;
    if (r && r.desbloquea && HABILIDADES[r.desbloquea]) h.desbloqueadas[r.desbloquea] = true;
    if (r && typeof r.titulo === 'string' && r.titulo.trim()) {
      h.titulos = Array.isArray(h.titulos) ? h.titulos : [];
      if (!h.titulos.includes(r.titulo.trim())) h.titulos.push(r.titulo.trim());
    }
  }

  // Monstruo derrotado: cuenta para los puntos de lucha. Devuelve true si gana un punto.
  function registrarMuerte(h) {
    h.kills += 1;
    if (h.kills % PUNTOS_KILLS !== 0) return false;
    h.puntos += 1;
    return true;
  }

  // ¿Se puede usar ya? Las de la historia, al cumplir su capítulo; las técnicas, desde su nivel (y profesión si se indica)
  function disponible(h, id, nivelHeroe, clase = null) {
    const hab = HABILIDADES[id];
    if (!hab) return false;
    if (clase && !habilidadDeClase(id, clase)) return false;
    if (hab.tipo !== 'activa') return true;
    if (hab.capitulo) return !!h.desbloqueadas[id];
    return nivelHeroe >= (hab.nivel || 1);
  }

  // Por qué no se puede usar aún (texto para la interfaz)
  function requisito(id, clase = null) {
    const hab = HABILIDADES[id];
    if (!hab) return '';
    if (clase && !habilidadDeClase(id, clase)) {
      const nombres = (hab.clases || []).map(c => PROFESIONES[c] ? PROFESIONES[c].nombre : c).join('/');
      return 'exclusiva de ' + (nombres || 'otra profesión');
    }
    if (hab.tipo !== 'activa') return '';
    return hab.capitulo ? 'se desbloquea con la historia (capítulo ' + hab.capitulo + ')' : 'se aprende en el nivel ' + hab.nivel;
  }

  // Pone una habilidad activa en un hueco de la barra. Si ya estaba en otro, se intercambian.
  function asignar(h, tecla, id, clase = null) {
    if (!TECLAS.includes(tecla)) throw new Error('Hueco desconocido: ' + tecla);
    if (id !== null && (!HABILIDADES[id] || HABILIDADES[id].tipo !== 'activa')) throw new Error('Esa habilidad no va en la barra');
    if (id !== null && clase && !habilidadDeClase(id, clase)) {
      throw new Error(HABILIDADES[id].nombre + ' no pertenece a esta profesión');
    }
    const otra = TECLAS.find(t => t !== tecla && h.barra[t] === id);
    if (otra) h.barra[otra] = h.barra[tecla];
    h.barra[tecla] = id;
    return h.barra;
  }

  // Gasta un punto en una habilidad. nivelHeroe: para las técnicas, que piden un nivel.
  function mejorar(h, id, nivelHeroe = Infinity, clase = null) {
    const hab = HABILIDADES[id];
    if (!hab) throw new Error('Habilidad desconocida: ' + id);
    if (!disponible(h, id, nivelHeroe, clase)) { const r = requisito(id, clase); throw new Error(r.charAt(0).toUpperCase() + r.slice(1)); }
    const nivel = h.gastados[id] || 0;
    if (nivel >= hab.max) throw new Error(hab.nombre + ' ya está al máximo');
    if (h.puntos < 1) throw new Error('No tienes puntos de habilidad');
    h.puntos -= 1;
    h.gastados[id] = nivel + 1;
    return h.gastados[id];
  }

  // Estadísticas del héroe a partir de su nivel, equipo, profesión y subclase opcionales
  function estadisticas(h, nivelHeroe, equipados, clase = null) {
    const prof = clase && PROFESIONES[clase] ? PROFESIONES[clase] : null;
    const sub = clase ? subclaseDe(h, clase) : null;
    const sb = (sub && sub.bonos) || {};
    const pas = k => (h.gastados[k] || 0);
    const pasClase = k => (!clase || habilidadDeClase(k, clase)) ? pas(k) : 0;
    const br = bonosReputacion(h);
    const pAcero = pasClase('piel_acero');
    const oHalcon = pasClase('ojo_halcon');
    const mArcana = pasClase('maestria_arcana');
    const pSilencio = pasClase('paso_silencioso');
    const vidaBase = prof ? prof.vidaBase : 100;
    const vidaNivel = prof ? prof.vidaNivel : 12;
    const manaBase = prof ? prof.manaBase : 50;
    const manaNivel = prof ? prof.manaNivel : 6;
    const ataqueClase = prof ? prof.ataqueBase : 0;
    const critBase = prof ? prof.criticoBase : 0.05;
    const redBonus = prof ? prof.reduccionBonus : 0;
    const velBonus = prof ? prof.velocidadBonus : 0;
    const velAtkBonus = prof ? prof.velAtaqueBonus : 0;
    const poderMagicoBase = prof
      ? (prof.poderMagicoNivel * (nivelHeroe - 1) + prof.poderMagicoPorInt * pas('intelecto'))
      : 0;
    const poderMagico = Math.round((poderMagicoBase + 3 * mArcana + (sb.poderMagico || 0)) * 10) / 10;
    const s = {
      vida: vidaBase + vidaNivel * (nivelHeroe - 1) + 10 * pas('vitalidad') + 15 * pAcero + br.bonusVida + (sb.vida || 0),
      maná: manaBase + manaNivel * (nivelHeroe - 1) + 8 * pas('intelecto') + 10 * mArcana + (sb.mana || 0),
      ataque: ataqueClase + pas('fuerza'),
      poderMagico,
      critico: critBase + 0.01 * pas('destreza') + 0.02 * oHalcon + 0.02 * pSilencio + (sb.critico || 0),
      defensa: 0,
      reduccion: 0,
      bloqueo: sb.bloqueo || 0,
      danio: 0.02 * oHalcon + (sb.danio || 0),
      robo: sb.robo || 0,
      reflejo: sb.reflejo || 0,
      velocidad: velBonus + 0.015 * pSilencio + (sb.velocidad || 0),
      velocidadAtaque: velAtkBonus + 0.02 * pSilencio + (sb.velocidadAtaque || 0),
      mpRegenMult: (prof ? prof.mpRegenMult : 1) * (sb.mpRegenMult || 1),
      dodgeCdMult: Math.max(0.5, (prof ? prof.dodgeCdMult : 1) * (sb.dodgeCdMult || 1)),
      clase: prof ? prof.id : null,
      subclase: sub ? sub.id : null,
      tipoArmadura: prof ? prof.tipoArmadura : null,
      fuegoMult: sb.fuegoMult || 0,
      hieloMult: sb.hieloMult || 0,
      venenoMult: sb.venenoMult || 0,
      multSlowBonus: sb.multSlowBonus || 0,
      escudoBonusPct: sb.escudoBonusPct || 0,
      mult: {}   // daño de cada habilidad activa: +25 % por punto
    };
    Object.keys(HABILIDADES).forEach(id => { if (HABILIDADES[id].tipo === 'activa') s.mult[id] = 1 + 0.25 * (h.gastados[id] || 0); });
    let defensaArmadura = 0, ataqueArma = 0;
    equipados.forEach(obj => {
      if (obj.defensa) defensaArmadura += obj.defensa;
      if (obj.ataque) ataqueArma += obj.ataque;
      if (tipoDe(obj) === 'escudo') s.bloqueo += 0.15 * (obj.estado || 1);
      especialesDe(obj).forEach(e => {
        Object.keys(e.efecto).forEach(k => {
          if (k === 'critico') s.critico += e.efecto[k];
          else if (k === 'danio') s.danio += e.efecto[k];
          else if (k === 'velocidadAtaque') s.velocidadAtaque += e.efecto[k];
          else if (k === 'robo') s.robo += e.efecto[k];
          else if (k === 'reflejo') s.reflejo += e.efecto[k];
          else if (k === 'velocidad') s.velocidad += e.efecto[k];
          else if (k === 'vida') s.vida += e.efecto[k];
          else if (k === 'bloqueo') s.bloqueo += e.efecto[k];
          else if (k === 'defensa') defensaArmadura *= 1 + e.efecto[k];
        });
      });
    });
    s.ataque += ataqueArma;
    s.defensa = Math.round(defensaArmadura * 10) / 10;
    s.reduccion = Math.min(0.7, defensaArmadura / (defensaArmadura + 60) + 0.01 * pas('entereza') + 0.015 * pAcero + br.bonusDefensa + redBonus + (sb.reduccion || 0));
    s.bloqueo = Math.min(0.6, s.bloqueo);
    s.critico = Math.min(0.75, s.critico + br.bonusCritico + br.bonusCriticoFinal);
    return s;
  }

  // Texto de un efecto de habilidad especial («+10 % de daño», «vida máxima +15», ...)
  function efectoTexto(efecto) {
    const pct = v => Math.round(v * 100) + ' %';
    const frases = {
      critico: v => '+' + pct(v) + ' de crítico',
      danio: v => '+' + pct(v) + ' de daño',
      velocidadAtaque: v => '+' + pct(v) + ' de velocidad de ataque',
      robo: v => 'roba ' + pct(v) + ' del daño como vida',
      reflejo: v => 'devuelve ' + pct(v) + ' del daño recibido',
      velocidad: v => '+' + pct(v) + ' de velocidad',
      vida: v => 'vida máxima +' + v,
      bloqueo: v => '+' + pct(v) + ' de bloqueo',
      defensa: v => '+' + pct(v) + ' de defensa'
    };
    return Object.keys(efecto).map(k => frases[k](efecto[k])).join(', ');
  }

  // Texto de las estadísticas y especiales de un objeto, para el panel
  function ficha(obj) {
    const lineas = [];
    if (obj.ataque) lineas.push('Ataque ' + obj.ataque);
    if (obj.defensa) lineas.push('Defensa ' + obj.defensa);
    if (tipoDe(obj) === 'escudo') lineas.push('Bloqueo ' + Math.round(15 * (obj.estado || 1)) + ' %');
    const especiales = especialesDe(obj).map(e => ({ nombre: e.nombre, texto: efectoTexto(e.efecto) }));
    return { tipo: tipoDe(obj), lineas, especiales };
  }

  const api = { PROFESIONES, NIVEL_SUBCLASE, SUBCLASES, HABILIDADES, ESPECIALES, PUNTOS_KILLS, TECLAS, BARRA_INICIAL,
    CLASES_ARMA_DE_PROFESION, NOMBRES_CLASE_ARMA,
    nuevoHeroe, limpiarHeroe, recompensar, registrarMuerte,
    disponible, requisito, asignar, esArco, esBaculo, esDaga, profesionDe, barraInicialDeClase, habilidadDeClase, habilidadesDeClase, atajosDeClase,
    habilidadesDeArma, barraInicialDeArma, sincronizarBarraConArma, nuevasHabilidadesAlSubirNivel,
    subclasesDeClase, subclaseDe, elegirSubclase, reiniciarPuntos, aplicarBarraDeClase, bonosReputacion,
    aceptarZona, registrarZona, entregarZona,
    mejorar, estadisticas, ficha, especialesDe, tipoDe, cantidadEspeciales, efectoTexto };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HeroeLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
