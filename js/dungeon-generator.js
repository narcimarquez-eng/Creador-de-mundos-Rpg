/**
 * dungeon-generator.js
 * Generador procedural de mazmorras 3D para Creador de Mundos RPG.
 * Estilo arquitectónico modular similar al creador de pueblos (village-core.js).
 * 
 * Incluye:
 *  - Generador pseudoaleatorio reproducible (PRNG Mulberry32)
 *  - Distintos tipos de piedra y temáticas (Gótica oscura, Caliza antigua, Ruinas musgosas, Basalto volcánico)
 *  - Atlas procedural de texturas PBR (mortero, sillares, losas, musgo, madera, hierro)
 *  - Generación de salas (Vestíbulo, Gran Salón de Columnas, Santuario de la Fuente, Cripta funeraria,
 *    Cámara del Tesoro, Salón del Trono del Jefe) y pasillos con arcos y refuerzos
 *  - Elementos y props:
 *      * Fuentes ornamentales con pileta de piedra y agua
 *      * Manchas de musgo, maleza y yerbas subterráneas
 *      * Hongos bioluminiscentes con resplandor
 *      * Antorchas de pared y braseros de forja con luz dinámica
 *      * Jarrones y vasijas de cerámica
 *      * Cofres del tesoro con herrajes de hierro y cerraduras
 *      * Sarcófagos y lápidas talladas
 *      * Columnas, pilares y arquerías
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['three'], factory);
  } else if (typeof module === 'object' && module.exports) {
    let threeRef = null;
    try { threeRef = require('three'); } catch (e) { threeRef = (typeof global !== 'undefined' ? global.THREE : null); }
    module.exports = factory(threeRef);
  } else {
    root.DungeonGenerator = factory(root.THREE);
  }
}(typeof self !== 'undefined' ? self : this, function (THREE) {
  'use strict';

  // --- 1. PRNG REPRODUCIBLE (MULBERRY32) ---
  function resolveThree(explicitRef) {
    if (explicitRef && (explicitRef.Mesh || explicitRef.Group || explicitRef.Vector3)) return explicitRef;
    if (typeof THREE !== 'undefined' && THREE && THREE.Mesh) return THREE;
    if (typeof window !== 'undefined' && window.THREE && window.THREE.Mesh) return window.THREE;
    if (typeof global !== 'undefined' && global.THREE && global.THREE.Mesh) return global.THREE;
    if (typeof self !== 'undefined' && self.THREE && self.THREE.Mesh) return self.THREE;
    return null;
  }

  class PRNG {
    constructor(seed = 12345) {
      this.s = (typeof seed === 'number' ? seed : this._hash(String(seed))) >>> 0;
    }
    _hash(str) {
      let h = 2166136261;
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return h >>> 0;
    }
    next() {
      let t = this.s += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    range(min, max) { return min + this.next() * (max - min); }
    int(min, max) { return Math.floor(this.range(min, max + 1)); }
    pick(arr) { return arr[this.int(0, arr.length - 1)]; }
    chance(prob) { return this.next() < prob; }
  }

  // --- 2. TEMAS Y TIPOS DE PIEDRA (MÁS DE 20 ESTILOS PROCEDURALES) ---
  const ESTILOS_PIEDRA = {
    cripta_gotica: {
      id: 'cripta_gotica',
      nombre: 'Cripta Gótica Oscura',
      colorBase: '#1e293b',
      colorSecundario: '#0f172a',
      colorMortero: '#090d16',
      colorLosa: '#334155',
      colorMusgo: '#15803d',
      colorAgua: 0x0ea5e9,
      luzAntorchas: 0xf59e0b,
      luzJefe: 0xa855f7,
      densidadMusgo: 0.35,
      densidadHierba: 0.25,
      rugosidad: 0.85
    },
    ruinas_musgosas: {
      id: 'ruinas_musgosas',
      nombre: 'Ruinas de Granito y Musgo',
      colorBase: '#334155',
      colorSecundario: '#1e293b',
      colorMortero: '#14532d',
      colorLosa: '#475569',
      colorMusgo: '#22c55e',
      colorAgua: 0x10b981,
      luzAntorchas: 0xfbbf24,
      luzJefe: 0x22c55e,
      densidadMusgo: 0.85,
      densidadHierba: 0.65,
      rugosidad: 0.90
    },
    catacumbas_caliza: {
      id: 'catacumbas_caliza',
      nombre: 'Catacumbas de Caliza Antigua',
      colorBase: '#78716c',
      colorSecundario: '#57534e',
      colorMortero: '#292524',
      colorLosa: '#a8a29e',
      colorMusgo: '#4d7c0f',
      colorAgua: 0x38bdf8,
      luzAntorchas: 0xf97316,
      luzJefe: 0xef4444,
      densidadMusgo: 0.20,
      densidadHierba: 0.15,
      rugosidad: 0.80
    },
    fortaleza_basalto: {
      id: 'fortaleza_basalto',
      nombre: 'Fortaleza de Basalto y Obsidiana',
      colorBase: '#09090b',
      colorSecundario: '#18181b',
      colorMortero: '#27272a',
      colorLosa: '#1c1917',
      colorMusgo: '#b91c1c',
      colorAgua: 0x6366f1,
      luzAntorchas: 0xff4400,
      luzJefe: 0xdc2626,
      densidadMusgo: 0.10,
      densidadHierba: 0.05,
      rugosidad: 0.60
    },
    marmol_imperial: {
      id: 'marmol_imperial',
      nombre: 'Templo de Mármol Blanco Imperial',
      colorBase: '#e2e8f0',
      colorSecundario: '#f8fafc',
      colorMortero: '#cbd5e1',
      colorLosa: '#f1f5f9',
      colorMusgo: '#94a3b8',
      colorAgua: 0x38bdf8,
      luzAntorchas: 0x60a5fa,
      luzJefe: 0x3b82f6,
      densidadMusgo: 0.05,
      densidadHierba: 0.05,
      rugosidad: 0.35
    },
    caverna_obsidiana: {
      id: 'caverna_obsidiana',
      nombre: 'Caverna de Obsidiana Abisal',
      colorBase: '#0a0a0f',
      colorSecundario: '#12111a',
      colorMortero: '#1e1b4b',
      colorLosa: '#181826',
      colorMusgo: '#4c1d95',
      colorAgua: 0x818cf8,
      luzAntorchas: 0xa855f7,
      luzJefe: 0x7c3aed,
      densidadMusgo: 0.15,
      densidadHierba: 0.05,
      rugosidad: 0.40
    },
    ladrillo_medieval: {
      id: 'ladrillo_medieval',
      nombre: 'Mazmorra de Ladrillo Medieval Rojizo',
      colorBase: '#7c2d12',
      colorSecundario: '#9a3412',
      colorMortero: '#475569',
      colorLosa: '#451a03',
      colorMusgo: '#365314',
      colorAgua: 0x0284c7,
      luzAntorchas: 0xf59e0b,
      luzJefe: 0xd97706,
      densidadMusgo: 0.40,
      densidadHierba: 0.20,
      rugosidad: 0.88
    },
    minas_amatista: {
      id: 'minas_amatista',
      nombre: 'Minas de Cuarzo y Amatista',
      colorBase: '#3b0764',
      colorSecundario: '#581c87',
      colorMortero: '#1e1b4b',
      colorLosa: '#6b21a8',
      colorMusgo: '#a21caf',
      colorAgua: 0xc084fc,
      luzAntorchas: 0xe879f9,
      luzJefe: 0xc026d3,
      densidadMusgo: 0.20,
      densidadHierba: 0.10,
      rugosidad: 0.50
    },
    santuario_jade: {
      id: 'santuario_jade',
      nombre: 'Santuario de Jade y Esmeralda',
      colorBase: '#064e3b',
      colorSecundario: '#065f46',
      colorMortero: '#022c22',
      colorLosa: '#047857',
      colorMusgo: '#10b981',
      colorAgua: 0x34d399,
      luzAntorchas: 0x10b981,
      luzJefe: 0x059669,
      densidadMusgo: 0.60,
      densidadHierba: 0.45,
      rugosidad: 0.45
    },
    bastion_hierro: {
      id: 'bastion_hierro',
      nombre: 'Bastión de Hierro Oxidado',
      colorBase: '#3f3f46',
      colorSecundario: '#52525b',
      colorMortero: '#7c2d12',
      colorLosa: '#27272a',
      colorMusgo: '#9a3412',
      colorAgua: 0x0284c7,
      luzAntorchas: 0xf97316,
      luzJefe: 0xe11d48,
      densidadMusgo: 0.10,
      densidadHierba: 0.05,
      rugosidad: 0.70
    },
    cripta_glaciar: {
      id: 'cripta_glaciar',
      nombre: 'Cripta de Hielo y Glaciar Azul',
      colorBase: '#0e7490',
      colorSecundario: '#155e75',
      colorMortero: '#083344',
      colorLosa: '#164e63',
      colorMusgo: '#67e8f9',
      colorAgua: 0x22d3ee,
      luzAntorchas: 0x38bdf8,
      luzJefe: 0x06b6d4,
      densidadMusgo: 0.10,
      densidadHierba: 0.05,
      rugosidad: 0.30
    },
    arenisca_desierto: {
      id: 'arenisca_desierto',
      nombre: 'Necrópolis de Arenisca del Desierto',
      colorBase: '#b45309',
      colorSecundario: '#d97706',
      colorMortero: '#78350f',
      colorLosa: '#92400e',
      colorMusgo: '#854d0e',
      colorAgua: 0x06b6d4,
      luzAntorchas: 0xfbbf24,
      luzJefe: 0xf59e0b,
      densidadMusgo: 0.05,
      densidadHierba: 0.05,
      rugosidad: 0.85
    },
    huesos_calcinados: {
      id: 'huesos_calcinados',
      nombre: 'Catacumbas de Calaveras y Huesos',
      colorBase: '#57534e',
      colorSecundario: '#78716c',
      colorMortero: '#1c1917',
      colorLosa: '#44403c',
      colorMusgo: '#a8a29e',
      colorAgua: 0x94a3b8,
      luzAntorchas: 0xf87171,
      luzJefe: 0xdc2626,
      densidadMusgo: 0.15,
      densidadHierba: 0.10,
      rugosidad: 0.90
    },
    alquimia_azufre: {
      id: 'alquimia_azufre',
      nombre: 'Laboratorio de Azufre y Alquimia',
      colorBase: '#713f12',
      colorSecundario: '#854d0e',
      colorMortero: '#365314',
      colorLosa: '#a16207',
      colorMusgo: '#84cc16',
      colorAgua: 0xa3e635,
      luzAntorchas: 0xeab308,
      luzJefe: 0x65a30d,
      densidadMusgo: 0.50,
      densidadHierba: 0.35,
      rugosidad: 0.80
    },
    cloacas_pizarra: {
      id: 'cloacas_pizarra',
      nombre: 'Cloacas de Pizarra Subterránea',
      colorBase: '#1f2937',
      colorSecundario: '#111827',
      colorMortero: '#064e3b',
      colorLosa: '#374151',
      colorMusgo: '#047857',
      colorAgua: 0x059669,
      luzAntorchas: 0xfacc15,
      luzJefe: 0x10b981,
      densidadMusgo: 0.70,
      densidadHierba: 0.50,
      rugosidad: 0.75
    },
    cripta_sangrienta: {
      id: 'cripta_sangrienta',
      nombre: 'Cripta Sangrienta de Pórfido Rojo',
      colorBase: '#4c0519',
      colorSecundario: '#881337',
      colorMortero: '#1f1e24',
      colorLosa: '#9f1239',
      colorMusgo: '#be123c',
      colorAgua: 0xe11d48,
      luzAntorchas: 0xf43f5e,
      luzJefe: 0xbe123c,
      densidadMusgo: 0.30,
      densidadHierba: 0.15,
      rugosidad: 0.75
    },
    lapislazuli_oro: {
      id: 'lapislazuli_oro',
      nombre: 'Salón Regio de Lapislázuli y Oro',
      colorBase: '#1e3a8a',
      colorSecundario: '#172554',
      colorMortero: '#b45309',
      colorLosa: '#1d4ed8',
      colorMusgo: '#f59e0b',
      colorAgua: 0x60a5fa,
      luzAntorchas: 0xfacc15,
      luzJefe: 0xeab308,
      densidadMusgo: 0.10,
      densidadHierba: 0.05,
      rugosidad: 0.40
    },
    ruinas_celestiales: {
      id: 'ruinas_celestiales',
      nombre: 'Ruinas Celestiales de Cuarzo Blanco',
      colorBase: '#f1f5f9',
      colorSecundario: '#e2e8f0',
      colorMortero: '#94a3b8',
      colorLosa: '#f8fafc',
      colorMusgo: '#bae6fd',
      colorAgua: 0x7dd3fc,
      luzAntorchas: 0x93c5fd,
      luzJefe: 0x38bdf8,
      densidadMusgo: 0.20,
      densidadHierba: 0.10,
      rugosidad: 0.35
    },
    forja_magma: {
      id: 'forja_magma',
      nombre: 'Forja Titánica de Magma y Carbón',
      colorBase: '#18181b',
      colorSecundario: '#27272a',
      colorMortero: '#b91c1c',
      colorLosa: '#09090b',
      colorMusgo: '#dc2626',
      colorAgua: 0xf97316,
      luzAntorchas: 0xff3300,
      luzJefe: 0xe11d48,
      densidadMusgo: 0.05,
      densidadHierba: 0.05,
      rugosidad: 0.85
    },
    vacio_umbrio: {
      id: 'vacio_umbrio',
      nombre: 'Mazmorra Umbría del Vacío Estelar',
      colorBase: '#030712',
      colorSecundario: '#111827',
      colorMortero: '#312e81',
      colorLosa: '#1e1b4b',
      colorMusgo: '#4338ca',
      colorAgua: 0x6366f1,
      luzAntorchas: 0x818cf8,
      luzJefe: 0x6366f1,
      densidadMusgo: 0.15,
      densidadHierba: 0.05,
      rugosidad: 0.50
    },
    madera_petrificada: {
      id: 'madera_petrificada',
      nombre: 'Cripta de Madera Petrificada',
      colorBase: '#291809',
      colorSecundario: '#3b2310',
      colorMortero: '#1c1917',
      colorLosa: '#451a03',
      colorMusgo: '#15803d',
      colorAgua: 0x0284c7,
      luzAntorchas: 0xf59e0b,
      luzJefe: 0xb45309,
      densidadMusgo: 0.60,
      densidadHierba: 0.40,
      rugosidad: 0.85
    },
    coral_abisal: {
      id: 'coral_abisal',
      nombre: 'Capilla Sumergida de Coral Abisal',
      colorBase: '#0f2b38',
      colorSecundario: '#164e63',
      colorMortero: '#042f2e',
      colorLosa: '#155e75',
      colorMusgo: '#f43f5e',
      colorAgua: 0x06b6d4,
      luzAntorchas: 0x38bdf8,
      luzJefe: 0xf43f5e,
      densidadMusgo: 0.40,
      densidadHierba: 0.30,
      rugosidad: 0.65
    }
  };

  // --- 2.1 CATÁLOGO DE TIPOS DE ESTANCIA ---
  const TIPOS_ESTANCIA = {
    entrada: { id: 'entrada', nombre: 'Vestíbulo de Entrada', icono: '🚪', desc: 'Pórtico monumental y acceso a la mazmorra', w: 12, d: 14, h: 4.8 },
    fuente: { id: 'fuente', nombre: 'Santuario de la Fuente', icono: '⛲', desc: 'Pileta central, agua arcana y flora fúngica', w: 18, d: 16, h: 5.6 },
    tesoro: { id: 'tesoro', nombre: 'Cámara del Tesoro', icono: '🪙', desc: 'Cofres dorados con botín, gemas y vasijas antiguas', w: 14, d: 14, h: 4.6 },
    cripta_columnas: { id: 'cripta_columnas', nombre: 'Gran Cripta de Columnas', icono: '🏛️', desc: 'Columnatas monumentales y sarcófagos de piedra labrada', w: 22, d: 20, h: 6.2 },
    armeria: { id: 'armeria', nombre: 'Armería de la Guardia', icono: '⚔️', desc: 'Percheros de armas, escudos de hierro y barriles', w: 16, d: 14, h: 4.8 },
    biblioteca: { id: 'biblioteca', nombre: 'Biblioteca Arcana', icono: '📜', desc: 'Atriles de piedra, grimorios y monolitos con orbe flotante', w: 16, d: 16, h: 5.4 },
    prision: { id: 'prision', nombre: 'Mazmorra de Celdas', icono: '⛓️', desc: 'Celdas con rejas de hierro, cadenas y bancos rústicos', w: 15, d: 15, h: 4.8 },
    laboratorio: { id: 'laboratorio', nombre: 'Laboratorio de Alquimia', icono: '⚗️', desc: 'Caldero con poción resplandeciente, mesa y redomas', w: 16, d: 15, h: 5.0 },
    jardin_subterraneo: { id: 'jardin_subterraneo', nombre: 'Jardín Fúngico de Esporas', icono: '🍄', desc: 'Densa maleza, musgo y colonias de hongos bioluminiscentes', w: 18, d: 18, h: 5.8 },
    sala_jefe: { id: 'sala_jefe', nombre: 'Cámara del Trono del Jefe', icono: '👑', desc: 'Estrado elevado, trono de piedra y braseros mágicos', w: 24, d: 24, h: 7.5 }
  };

  // --- 2.2 CONFIGURACIÓN Y SIMULADOR DE BOTÍN DE COFRES ---
  const DEFAULT_LOOT_CONFIG = {
    probabilidadApertura: 90, // % de éxito en apertura
    oroMin: 80,
    oroMax: 350,
    arenaMin: 5,
    arenaMax: 25,
    items: [
      { id: 'espada_acero', nombre: 'Espada de Acero Templado', tipo: 'arma', prob: 45, rareza: 'comun' },
      { id: 'coraza_hierro', nombre: 'Coraza de Malla y Hierro', tipo: 'armadura', prob: 35, rareza: 'comun' },
      { id: 'pocion_vida_mayor', nombre: 'Poción de Vida Mayor', tipo: 'pocion', prob: 75, rareza: 'comun' },
      { id: 'pocion_mana', nombre: 'Elixir de Maná Concentrado', tipo: 'pocion', prob: 60, rareza: 'comun' },
      { id: 'zafiro_arcano', nombre: 'Zafiro Arcano Purificado', tipo: 'gema', prob: 30, rareza: 'raro' },
      { id: 'pergamino_portal', nombre: 'Pergamino de Teletransporte', tipo: 'pergamino', prob: 25, rareza: 'raro' },
      { id: 'reliquia_ancestral', nombre: 'Reliquia de los Titanes Caídos', tipo: 'legendario', prob: 12, rareza: 'legendario' }
    ]
  };

  function simularAperturaCofre(lootConfig = DEFAULT_LOOT_CONFIG, rng = null) {
    const r = rng || Math;
    const cfg = Object.assign({}, DEFAULT_LOOT_CONFIG, lootConfig);
    const probExito = typeof cfg.probabilidadExito === 'number'
    ? (cfg.probabilidadExito <= 1 ? cfg.probabilidadExito * 100 : cfg.probabilidadExito)
    : (typeof cfg.probabilidadApertura === 'number' ? cfg.probabilidadApertura : 90);
    const rollExito = (r.random ? r.random() : Math.random()) * 100;

    if (rollExito > probExito) {
      return {
        exito: false,
        mensaje: '¡Cerradura atascada o mecanismo trampa activado!',
        oro: 0,
        arena: 0,
        itemsObtenidos: [], items: []
      };
    }

    const oMin = cfg.oroMin || 50;
    const oMax = Math.max(oMin, cfg.oroMax || 250);
    const oro = Math.floor(oMin + (r.random ? r.random() : Math.random()) * (oMax - oMin + 1));

    const aMin = cfg.arenaMin || 0;
    const aMax = Math.max(aMin, cfg.arenaMax || 20);
    const arena = Math.floor(aMin + (r.random ? r.random() : Math.random()) * (aMax - aMin + 1));

    const itemsObtenidos = [];
    const pool = Array.isArray(cfg.items) ? cfg.items : DEFAULT_LOOT_CONFIG.items;
    pool.forEach(it => {
      const prob = typeof it.prob === 'number'
    ? (it.prob <= 1 ? it.prob * 100 : it.prob)
    : (typeof it.probabilidad === 'number' ? (it.probabilidad <= 1 ? it.probabilidad * 100 : it.probabilidad) : 30);
      const roll = (r.random ? r.random() : Math.random()) * 100;
      if (roll <= prob) {
        itemsObtenidos.push({ ...it });
      }
    });

    return {
      exito: true,
      mensaje: '¡Cofre abierto con éxito!',
      oro,
      arena,
      itemsObtenidos,
      items: itemsObtenidos
    };
  }

  // --- 2.3 RESOLUTOR DE MATERIALES INDIVIDUALES POR ESTANCIA ---
  function resolverMaterialesSala(ThreeLib, kitBase, kitsPorEstilo, sala) {
    const kPared = (kitsPorEstilo && (kitsPorEstilo[sala.estiloPared || sala.estilo])) || kitBase;
    const kSuelo = (kitsPorEstilo && (kitsPorEstilo[sala.estiloSuelo])) || (kitsPorEstilo && kitsPorEstilo[sala.estilo]) || kitBase;
    const kZocalo = (kitsPorEstilo && (kitsPorEstilo[sala.estiloZocalo])) || (kitsPorEstilo && kitsPorEstilo[sala.estiloPared || sala.estilo]) || kitBase;
    const kTecho = (kitsPorEstilo && (kitsPorEstilo[sala.estiloTecho])) || (kitsPorEstilo && kitsPorEstilo[sala.estiloPared || sala.estilo]) || kPared;
    const kFuente = (kitsPorEstilo && (kitsPorEstilo[sala.estiloFuente])) || (kitsPorEstilo && kitsPorEstilo[sala.estilo]) || kitBase;

    let matPared = kPared.piedraMuro;
    if (sala.colorPared && sala.colorPared !== 'default') {
      matPared = (matPared && typeof matPared.clone === 'function') ? matPared.clone() : Object.assign({}, matPared);
      if (matPared.color && typeof matPared.color.set === 'function') matPared.color.set(sala.colorPared);
      else matPared.color = sala.colorPared;
    }

    let matSuelo = kSuelo.sueloLosas;
    if (sala.colorSuelo && sala.colorSuelo !== 'default') {
      matSuelo = (matSuelo && typeof matSuelo.clone === 'function') ? matSuelo.clone() : Object.assign({}, matSuelo);
      if (matSuelo.color && typeof matSuelo.color.set === 'function') matSuelo.color.set(sala.colorSuelo);
      else matSuelo.color = sala.colorSuelo;
    }

    let matZocalo = kZocalo.zocalo || kZocalo.piedraMuro;
    if (sala.colorZocalo && sala.colorZocalo !== 'default') {
      matZocalo = (matZocalo && typeof matZocalo.clone === 'function') ? matZocalo.clone() : Object.assign({}, matZocalo);
      if (matZocalo.color && typeof matZocalo.color.set === 'function') matZocalo.color.set(sala.colorZocalo);
      else matZocalo.color = sala.colorZocalo;
    }

    let matTecho = kTecho.techo || kTecho.piedraMuro;
    if (sala.colorTecho && sala.colorTecho !== 'default') {
      matTecho = (matTecho && typeof matTecho.clone === 'function') ? matTecho.clone() : Object.assign({}, matTecho);
      if (matTecho.color && typeof matTecho.color.set === 'function') matTecho.color.set(sala.colorTecho);
      else matTecho.color = sala.colorTecho;
    }

    let matAgua = kFuente.agua;
    if (sala.colorAgua && sala.colorAgua !== 'default') {
      matAgua = (matAgua && typeof matAgua.clone === 'function') ? matAgua.clone() : Object.assign({}, matAgua);
      if (matAgua.color && typeof matAgua.color.set === 'function') matAgua.color.set(sala.colorAgua);
      else matAgua.color = sala.colorAgua;
    }

    return {
      kPared,
      kSuelo,
      kZocalo,
      kTecho,
      kFuente,
      matPared,
      matSuelo,
      matZocalo,
      matTecho,
      matAgua,
      colorAgua: (sala.colorAgua && sala.colorAgua !== "default") ? sala.colorAgua : "#38bdf8",
      kitCompleto: Object.assign({}, kitBase, {
        piedraMuro: matPared,
        sueloLosas: matSuelo,
        zocalo: matZocalo,
        techo: matTecho,
        agua: matAgua
      })
    };
  }

  // --- 3. GENERADORES DE TEXTURAS INDEPENDIENTES Y DEDICADAS (PBR PROCEDURAL) ---
  // Se generan texturas separadas al 100% para cada superficie (Pared, Suelo, Zócalo, Techo, Madera, Hierro)
  // evitando que se mezclen cuadrantes en una misma malla.
  const _texParedCache = new Map();
  const _texSueloCache = new Map();
  const _texZocaloCache = new Map();
  const _texTechoCache = new Map();
  let _texMaderaCache = null;
  let _texHierroCache = null;

  function crearTexturaPared(estilo, ThreeLib) {
    const key = estilo.id;
    if (_texParedCache.has(key)) return _texParedCache.get(key);
    if (typeof document === 'undefined') return { diffuse: null, bump: null };

    const size = 512;
    const canvasD = document.createElement('canvas');
    const canvasB = document.createElement('canvas');
    canvasD.width = canvasD.height = size;
    canvasB.width = canvasB.height = size;
    const ctxD = canvasD.getContext('2d');
    const ctxB = canvasB.getContext('2d');

    // Fondo: mortero entre juntas
    ctxD.fillStyle = estilo.colorMortero || '#1e293b';
    ctxD.fillRect(0, 0, size, size);
    ctxB.fillStyle = '#111111';
    ctxB.fillRect(0, 0, size, size);

    // Sillares de piedra biselados en hiladas regulares (8 filas trabadas)
    const filas = 8;
    const altoFila = size / filas;
    for (let f = 0; f < filas; f++) {
      const y = f * altoFila;
      const cols = (f % 2 === 0) ? 4 : 5;
      const anchoCol = size / cols;
      const shift = (f % 2) * (anchoCol * 0.5);

      for (let c = -1; c <= cols; c++) {
        const x = c * anchoCol + shift;
        const pad = 4;
        const gradD = ctxD.createLinearGradient(x, y, x + anchoCol, y + altoFila);
        gradD.addColorStop(0.0, estilo.colorBase);
        gradD.addColorStop(0.7, estilo.colorSecundario);
        gradD.addColorStop(1.0, estilo.colorBase);
        ctxD.fillStyle = gradD;
        ctxD.fillRect(x + pad, y + pad, anchoCol - pad * 2, altoFila - pad * 2);

        // Bump map biselado
        const gradB = ctxB.createRadialGradient(x + anchoCol / 2, y + altoFila / 2, 4, x + anchoCol / 2, y + altoFila / 2, anchoCol / 2);
        gradB.addColorStop(0.0, '#ffffff');
        gradB.addColorStop(0.85, '#aaaaaa');
        gradB.addColorStop(1.0, '#1a1a1a');
        ctxB.fillStyle = gradB;
        ctxB.fillRect(x + pad, y + pad, anchoCol - pad * 2, altoFila - pad * 2);

        // Grietas orgánicas de cantería
        if ((f + c) % 3 === 0) {
          ctxD.strokeStyle = 'rgba(0,0,0,0.38)';
          ctxD.lineWidth = 1.5;
          ctxD.beginPath();
          ctxD.moveTo(x + pad + 10, y + pad + 8);
          ctxD.lineTo(x + pad + 24, y + pad + 18);
          ctxD.lineTo(x + pad + 18, y + altoFila - pad - 6);
          ctxD.stroke();
        }

        // Pátina de musgo en juntas si el estilo lo tiene
        if (estilo.densidadMusgo > 0.18 && (f + c) % 4 === 0) {
          ctxD.fillStyle = estilo.colorMusgo || 'rgba(34,197,94,0.35)';
          ctxD.beginPath();
          ctxD.arc(x + pad + 8, y + altoFila - pad - 4, 9, 0, Math.PI * 2);
          ctxD.fill();
        }
      }
    }

    const texD = new ThreeLib.CanvasTexture(canvasD);
    texD.wrapS = texD.wrapT = ThreeLib.RepeatWrapping;
    texD.colorSpace = ThreeLib.SRGBColorSpace;

    const texB = new ThreeLib.CanvasTexture(canvasB);
    texB.wrapS = texB.wrapT = ThreeLib.RepeatWrapping;

    const result = { diffuse: texD, bump: texB };
    _texParedCache.set(key, result);
    return result;
  }

  function crearTexturaSuelo(estilo, ThreeLib) {
    const key = estilo.id;
    if (_texSueloCache.has(key)) return _texSueloCache.get(key);
    if (typeof document === 'undefined') return { diffuse: null, bump: null };

    const size = 512;
    const canvasD = document.createElement('canvas');
    const canvasB = document.createElement('canvas');
    canvasD.width = canvasD.height = size;
    canvasB.width = canvasB.height = size;
    const ctxD = canvasD.getContext('2d');
    const ctxB = canvasB.getContext('2d');

    // Fondo: mortero oscuro de junta de losa
    ctxD.fillStyle = estilo.colorMortero || '#0f172a';
    ctxD.fillRect(0, 0, size, size);
    ctxB.fillStyle = '#0a0a0a';
    ctxB.fillRect(0, 0, size, size);

    // Cuadrícula limpia y uniforme de losas grandes de pavimento (4x4)
    const losasX = 4;
    const losasY = 4;
    const pasoLosa = size / losasX;
    for (let ly = 0; ly < losasY; ly++) {
      for (let lx = 0; lx < losasX; lx++) {
        const px = lx * pasoLosa;
        const py = ly * pasoLosa;
        const pad = 5;

        const gradLosa = ctxD.createLinearGradient(px, py, px + pasoLosa, py + pasoLosa);
        gradLosa.addColorStop(0.0, estilo.colorLosa || estilo.colorBase);
        gradLosa.addColorStop(0.5, estilo.colorBase);
        gradLosa.addColorStop(1.0, estilo.colorSecundario);
        ctxD.fillStyle = gradLosa;
        ctxD.fillRect(px + pad, py + pad, pasoLosa - pad * 2, pasoLosa - pad * 2);

        // Bisel y relieve de losa
        ctxB.fillStyle = '#d4d4d4';
        ctxB.fillRect(px + pad, py + pad, pasoLosa - pad * 2, pasoLosa - pad * 2);
        ctxB.strokeStyle = '#222222';
        ctxB.lineWidth = 4;
        ctxB.strokeRect(px + pad, py + pad, pasoLosa - pad * 2, pasoLosa - pad * 2);

        // Resalte sutil en el borde de la losa
        ctxD.strokeStyle = 'rgba(255,255,255,0.1)';
        ctxD.lineWidth = 1;
        ctxD.strokeRect(px + pad + 1, py + pad + 1, pasoLosa - pad * 2 - 2, pasoLosa - pad * 2 - 2);

        // Manchas de humedad o musgo sutil en esquinas de losa
        if (estilo.densidadMusgo > 0.2 && (lx + ly) % 2 === 0) {
          ctxD.fillStyle = estilo.colorMusgo || 'rgba(34,197,94,0.3)';
          ctxD.beginPath();
          ctxD.arc(px + pad + 14, py + pad + 14, 16, 0, Math.PI * 2);
          ctxD.fill();
        }
      }
    }

    const texD = new ThreeLib.CanvasTexture(canvasD);
    texD.wrapS = texD.wrapT = ThreeLib.RepeatWrapping;
    texD.colorSpace = ThreeLib.SRGBColorSpace;

    const texB = new ThreeLib.CanvasTexture(canvasB);
    texB.wrapS = texB.wrapT = ThreeLib.RepeatWrapping;

    const result = { diffuse: texD, bump: texB };
    _texSueloCache.set(key, result);
    return result;
  }

  function crearTexturaZocalo(estilo, ThreeLib) {
    const key = estilo.id;
    if (_texZocaloCache.has(key)) return _texZocaloCache.get(key);
    if (typeof document === 'undefined') return { diffuse: null, bump: null };

    const size = 512;
    const canvasD = document.createElement('canvas');
    const canvasB = document.createElement('canvas');
    canvasD.width = canvasD.height = size;
    canvasB.width = canvasB.height = size;
    const ctxD = canvasD.getContext('2d');
    const ctxB = canvasB.getContext('2d');

    // Fondo mortero
    ctxD.fillStyle = estilo.colorMortero || '#090d16';
    ctxD.fillRect(0, 0, size, size);
    ctxB.fillStyle = '#141414';
    ctxB.fillRect(0, 0, size, size);

    // Moldura superior del zócalo (cincelada y biselada)
    const gradMoldura = ctxD.createLinearGradient(0, 0, 0, 96);
    gradMoldura.addColorStop(0.0, estilo.colorSecundario);
    gradMoldura.addColorStop(0.5, estilo.colorBase);
    gradMoldura.addColorStop(1.0, estilo.colorMortero);
    ctxD.fillStyle = gradMoldura;
    ctxD.fillRect(0, 0, size, 96);

    ctxB.fillStyle = '#ffffff';
    ctxB.fillRect(0, 0, size, 48);
    ctxB.fillStyle = '#888888';
    ctxB.fillRect(0, 48, size, 48);

    // Sillares ciclópeos de base (3 grandes bloques pesados horizontales)
    const bloques = 3;
    const anchoB = size / bloques;
    for (let b = 0; b < bloques; b++) {
      const bx = b * anchoB;
      const pad = 4;
      const gradB = ctxD.createLinearGradient(bx, 102, bx + anchoB, size);
      gradB.addColorStop(0.0, estilo.colorBase);
      gradB.addColorStop(0.8, estilo.colorSecundario);
      ctxD.fillStyle = gradB;
      ctxD.fillRect(bx + pad, 102 + pad, anchoB - pad * 2, size - 102 - pad * 2);

      ctxB.fillStyle = '#cccccc';
      ctxB.fillRect(bx + pad, 102 + pad, anchoB - pad * 2, size - 102 - pad * 2);
      ctxB.strokeStyle = '#1a1a1a';
      ctxB.lineWidth = 3;
      ctxB.strokeRect(bx + pad, 102 + pad, anchoB - pad * 2, size - 102 - pad * 2);
    }

    const texD = new ThreeLib.CanvasTexture(canvasD);
    texD.wrapS = texD.wrapT = ThreeLib.RepeatWrapping;
    texD.colorSpace = ThreeLib.SRGBColorSpace;

    const texB = new ThreeLib.CanvasTexture(canvasB);
    texB.wrapS = texB.wrapT = ThreeLib.RepeatWrapping;

    const result = { diffuse: texD, bump: texB };
    _texZocaloCache.set(key, result);
    return result;
  }

  function crearTexturaTecho(estilo, ThreeLib) {
    const key = estilo.id;
    if (_texTechoCache.has(key)) return _texTechoCache.get(key);
    if (typeof document === 'undefined') return { diffuse: null, bump: null };

    const size = 512;
    const canvasD = document.createElement('canvas');
    const canvasB = document.createElement('canvas');
    canvasD.width = canvasD.height = size;
    canvasB.width = canvasB.height = size;
    const ctxD = canvasD.getContext('2d');
    const ctxB = canvasB.getContext('2d');

    // Bóveda abovedada oscura con aristas de crucería
    ctxD.fillStyle = '#05070e';
    ctxD.fillRect(0, 0, size, size);

    const gradT = ctxD.createRadialGradient(size / 2, size / 2, 8, size / 2, size / 2, size * 0.75);
    gradT.addColorStop(0.0, estilo.colorBase);
    gradT.addColorStop(0.65, estilo.colorSecundario);
    gradT.addColorStop(1.0, '#040508');
    ctxD.fillStyle = gradT;
    ctxD.fillRect(0, 0, size, size);

    // Aristas de cantería cruzadas
    ctxD.strokeStyle = estilo.colorMortero || '#1e293b';
    ctxD.lineWidth = 6;
    ctxD.beginPath();
    ctxD.moveTo(0, 0); ctxD.lineTo(size, size);
    ctxD.moveTo(size, 0); ctxD.lineTo(0, size);
    ctxD.stroke();

    ctxB.fillStyle = '#222222';
    ctxB.fillRect(0, 0, size, size);
    ctxB.strokeStyle = '#aaaaaa';
    ctxB.lineWidth = 6;
    ctxB.beginPath();
    ctxB.moveTo(0, 0); ctxB.lineTo(size, size);
    ctxB.moveTo(size, 0); ctxB.lineTo(0, size);
    ctxB.stroke();

    const texD = new ThreeLib.CanvasTexture(canvasD);
    texD.wrapS = texD.wrapT = ThreeLib.RepeatWrapping;
    texD.colorSpace = ThreeLib.SRGBColorSpace;

    const texB = new ThreeLib.CanvasTexture(canvasB);
    texB.wrapS = texB.wrapT = ThreeLib.RepeatWrapping;

    const result = { diffuse: texD, bump: texB };
    _texTechoCache.set(key, result);
    return result;
  }

  function crearTexturaMadera(ThreeLib) {
    if (_texMaderaCache) return _texMaderaCache;
    if (typeof document === 'undefined') return { diffuse: null, bump: null };

    const size = 512;
    const canvasD = document.createElement('canvas');
    const canvasB = document.createElement('canvas');
    canvasD.width = canvasD.height = size;
    canvasB.width = canvasB.height = size;
    const ctxD = canvasD.getContext('2d');
    const ctxB = canvasB.getContext('2d');

    ctxD.fillStyle = '#3a1700';
    ctxD.fillRect(0, 0, size, size);
    ctxB.fillStyle = '#444444';
    ctxB.fillRect(0, 0, size, size);

    const vigas = 6;
    const altoViga = size / vigas;
    for (let v = 0; v < vigas; v++) {
      const vy = v * altoViga;
      ctxD.fillStyle = v % 2 === 0 ? '#78350f' : '#92400e';
      ctxD.fillRect(2, vy + 2, size - 4, altoViga - 4);

      // Vetas de madera
      ctxD.fillStyle = 'rgba(0,0,0,0.18)';
      for (let s = 6; s < size; s += 18) {
        ctxD.fillRect(s, vy + 2, 2, altoViga - 4);
      }

      ctxB.fillStyle = '#777777';
      ctxB.fillRect(2, vy + 2, size - 4, altoViga - 4);
      ctxB.strokeStyle = '#111111';
      ctxB.lineWidth = 3;
      ctxB.strokeRect(2, vy + 2, size - 4, altoViga - 4);
    }

    const texD = new ThreeLib.CanvasTexture(canvasD);
    texD.wrapS = texD.wrapT = ThreeLib.RepeatWrapping;
    texD.colorSpace = ThreeLib.SRGBColorSpace;

    const texB = new ThreeLib.CanvasTexture(canvasB);
    texB.wrapS = texB.wrapT = ThreeLib.RepeatWrapping;

    _texMaderaCache = { diffuse: texD, bump: texB };
    return _texMaderaCache;
  }

  function crearTexturaHierro(ThreeLib) {
    if (_texHierroCache) return _texHierroCache;
    if (typeof document === 'undefined') return { diffuse: null, bump: null };

    const size = 512;
    const canvasD = document.createElement('canvas');
    const canvasB = document.createElement('canvas');
    canvasD.width = canvasD.height = size;
    canvasB.width = canvasB.height = size;
    const ctxD = canvasD.getContext('2d');
    const ctxB = canvasB.getContext('2d');

    ctxD.fillStyle = '#27272a';
    ctxD.fillRect(0, 0, size, size);
    ctxB.fillStyle = '#888888';
    ctxB.fillRect(0, 0, size, size);

    // Bandas de forja y remaches
    ctxD.fillStyle = '#3f3f46';
    ctxD.fillRect(0, 64, size, 96);
    ctxD.fillRect(0, 320, size, 96);

    ctxD.fillStyle = '#d4d4d8';
    for (let rx = 32; rx < size; rx += 64) {
      ctxD.beginPath();
      ctxD.arc(rx, 112, 8, 0, Math.PI * 2);
      ctxD.arc(rx, 368, 8, 0, Math.PI * 2);
      ctxD.fill();

      ctxB.fillStyle = '#ffffff';
      ctxB.beginPath();
      ctxB.arc(rx, 112, 8, 0, Math.PI * 2);
      ctxB.arc(rx, 368, 8, 0, Math.PI * 2);
      ctxB.fill();
    }

    const texD = new ThreeLib.CanvasTexture(canvasD);
    texD.wrapS = texD.wrapT = ThreeLib.RepeatWrapping;
    texD.colorSpace = ThreeLib.SRGBColorSpace;

    const texB = new ThreeLib.CanvasTexture(canvasB);
    texB.wrapS = texB.wrapT = ThreeLib.RepeatWrapping;

    _texHierroCache = { diffuse: texD, bump: texB };
    return _texHierroCache;
  }

  // Compatibilidad: función previa crearAtlasMazmorra delegando en las texturas desacopladas
  function crearAtlasMazmorra(estilo, ThreeLib) {
    const texPared = crearTexturaPared(estilo, ThreeLib);
    const texSuelo = crearTexturaSuelo(estilo, ThreeLib);
    const texZocalo = crearTexturaZocalo(estilo, ThreeLib);
    const texTecho = crearTexturaTecho(estilo, ThreeLib);
    return {
      diffuse: texPared.diffuse,
      bump: texPared.bump,
      pared: texPared,
      suelo: texSuelo,
      zocalo: texZocalo,
      techo: texTecho
    };
  }

  // --- 4. CREADOR DE KITS DE MATERIALES PROCEDURALES INDEPENDIENTES ---
  function crearKitMateriales(estilo, ThreeLib) {
    const texPared = crearTexturaPared(estilo, ThreeLib);
    const texSuelo = crearTexturaSuelo(estilo, ThreeLib);
    const texZocalo = crearTexturaZocalo(estilo, ThreeLib);
    const texTecho = crearTexturaTecho(estilo, ThreeLib);
    const texMadera = crearTexturaMadera(ThreeLib);
    const texHierro = crearTexturaHierro(ThreeLib);

    // Muros: usa exclusivamente textura de pared
    const matPiedraMuro = new ThreeLib.MeshStandardMaterial({
      color: estilo.colorBase,
      roughness: estilo.rugosidad,
      metalness: 0.1,
      map: texPared.diffuse,
      bumpMap: texPared.bump,
      bumpScale: 0.08
    });

    // Suelo: usa exclusivamente textura de losas de pavimento
    const matSueloLosas = new ThreeLib.MeshStandardMaterial({
      color: estilo.colorLosa,
      roughness: 0.75,
      metalness: 0.05,
      map: texSuelo.diffuse,
      bumpMap: texSuelo.bump,
      bumpScale: 0.06
    });

    // Zócalo perimetral: moldura y sillar ciclópeo inferior
    const matZocalo = new ThreeLib.MeshStandardMaterial({
      color: estilo.colorBase,
      roughness: estilo.rugosidad * 0.95,
      metalness: 0.12,
      map: texZocalo.diffuse,
      bumpMap: texZocalo.bump,
      bumpScale: 0.09
    });

    // Techo / Bóveda
    const matTecho = new ThreeLib.MeshStandardMaterial({
      color: estilo.colorSecundario,
      roughness: 0.85,
      metalness: 0.05,
      map: texTecho.diffuse,
      bumpMap: texTecho.bump,
      bumpScale: 0.06
    });

    // Madera para props (cofres, mesas, puertas)
    const matMadera = new ThreeLib.MeshStandardMaterial({
      color: 0x854d0e,
      roughness: 0.7,
      metalness: 0.05,
      map: texMadera.diffuse,
      bumpMap: texMadera.bump,
      bumpScale: 0.05
    });

    // Hierro forjado
    const matHierro = new ThreeLib.MeshStandardMaterial({
      color: 0x3f3f46,
      roughness: 0.45,
      metalness: 0.85,
      map: texHierro.diffuse,
      bumpMap: texHierro.bump,
      bumpScale: 0.04
    });

    const matOro = new ThreeLib.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.3,
      metalness: 0.95
    });

    const matAgua = new ThreeLib.MeshStandardMaterial({
      color: estilo.colorAgua,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.82
    });

    const matLlama = new ThreeLib.MeshBasicMaterial({
      color: estilo.luzAntorchas
    });

    const matMusgo = new ThreeLib.MeshStandardMaterial({
      color: estilo.colorMusgo,
      roughness: 0.95,
      metalness: 0.0
    });

    const matHongo = new ThreeLib.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.3
    });

    return {
      estilo,
      atlas: { diffuse: texPared.diffuse, bump: texPared.bump },
      texPared,
      texSuelo,
      texZocalo,
      texTecho,
      texMadera,
      texHierro,
      piedraMuro: matPiedraMuro,
      sueloLosas: matSueloLosas,
      zocalo: matZocalo,
      techo: matTecho,
      madera: matMadera,
      hierro: matHierro,
      oro: matOro,
      agua: matAgua,
      llama: matLlama,
      musgo: matMusgo,
      hongo: matHongo
    };
  }

  // --- 5. FABRICA DE PROPS PROCEDURALES ---

  // A) Antorcha con soporte de forja, candelabros, faroles, braseros o cristales arcanos
  function crearAntorcha(ThreeLib, kit, luzHex, intensidad = 2.4, opciones = {}) {
    const g = new ThreeLib.Group();
    const forma = opciones.forma || opciones.formaAntorcha || 'antorcha_hierro';
    const colorLuzVal = (luzHex !== undefined && luzHex !== null) ? luzHex : ((kit && kit.estilo && kit.estilo.luzAntorchas) || 0xf59e0b);

    // Material de llama sintonizado con el color de la luz
    const matLlamaActual = new ThreeLib.MeshBasicMaterial({ color: colorLuzVal });

    let luz, llamaObj, animarFn;

    if (forma === 'candelabro_aplique') {
      // 1. Candelabro mural con 3 velas ornamentadas
      const basePared = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(0.16, 0.38, 0.08), kit.hierro);
      basePared.position.set(0, 0, 0.04);
      basePared.castShadow = true;
      g.add(basePared);

      const brazoC = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(0.06, 0.06, 0.26), kit.hierro);
      brazoC.position.set(0, -0.04, 0.15);
      brazoC.castShadow = true;
      g.add(brazoC);

      const barraT = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(0.48, 0.05, 0.05), kit.hierro);
      barraT.position.set(0, -0.04, 0.27);
      barraT.castShadow = true;
      g.add(barraT);

      const llamas = [];
      [-0.18, 0, 0.18].forEach(vx => {
        const platillo = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.06, 0.04, 0.03, 8), kit.hierro);
        platillo.position.set(vx, -0.01, 0.27);
        g.add(platillo);

        const vela = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.035, 0.035, 0.22, 8), new ThreeLib.MeshStandardMaterial({
          color: 0xfef3c7, roughness: 0.4
        }));
        vela.position.set(vx, 0.11, 0.27);
        g.add(vela);

        const ll = new ThreeLib.Mesh(new ThreeLib.ConeGeometry(0.045, 0.14, 6), matLlamaActual);
        ll.position.set(vx, 0.28, 0.27);
        g.add(ll);
        llamas.push(ll);
      });

      luz = new ThreeLib.PointLight(colorLuzVal, intensidad, 18, 1.6);
      luz.position.set(0, 0.35, 0.3);
      g.add(luz);

      animarFn = (t) => {
        luz.intensity = intensidad * (0.88 + Math.sin(t * 11.0) * 0.09 + Math.cos(t * 23.0) * 0.03);
        llamas.forEach((ll, idx) => {
          ll.scale.set(
            1 + Math.sin(t * 14.0 + idx) * 0.12,
            1 + Math.cos(t * 17.0 + idx) * 0.16,
            1 + Math.sin(t * 14.0 + idx) * 0.12
          );
        });
      };
      llamaObj = llamas[1];

    } else if (forma === 'farol_jaula') {
      // 2. Farol gótico con cúpula y jaula de rejas de hierro
      const base = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(0.12, 0.36, 0.08), kit.hierro);
      base.position.set(0, 0, 0.04);
      base.castShadow = true;
      g.add(base);

      const brazo = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(0.06, 0.06, 0.34), kit.hierro);
      brazo.position.set(0, 0.18, 0.19);
      brazo.castShadow = true;
      g.add(brazo);

      const cadena = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.02, 0.02, 0.12, 4), kit.hierro);
      cadena.position.set(0, 0.09, 0.32);
      g.add(cadena);

      const cupula = new ThreeLib.Mesh(new ThreeLib.ConeGeometry(0.18, 0.13, 6), kit.hierro);
      cupula.position.set(0, 0.04, 0.32);
      cupula.castShadow = true;
      g.add(cupula);

      const baseFarol = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.15, 0.12, 0.04, 6), kit.hierro);
      baseFarol.position.set(0, -0.3, 0.32);
      baseFarol.castShadow = true;
      g.add(baseFarol);

      // Cristal traslúcido
      const cristal = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.13, 0.13, 0.28, 6), new ThreeLib.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.1,
        metalness: 0.1,
        transparent: true,
        opacity: 0.42
      }));
      cristal.position.set(0, -0.14, 0.32);
      g.add(cristal);

      // Llama interna
      const llama = new ThreeLib.Mesh(new ThreeLib.ConeGeometry(0.065, 0.18, 6), matLlamaActual);
      llama.position.set(0, -0.15, 0.32);
      g.add(llama);

      luz = new ThreeLib.PointLight(colorLuzVal, intensidad, 18, 1.6);
      luz.position.set(0, -0.12, 0.32);
      g.add(luz);

      animarFn = (t) => {
        luz.intensity = intensidad * (0.90 + Math.sin(t * 8.0) * 0.08 + Math.cos(t * 19.0) * 0.02);
        llama.scale.set(
          1 + Math.sin(t * 12.0) * 0.08,
          1 + Math.cos(t * 15.0) * 0.12,
          1 + Math.sin(t * 12.0) * 0.08
        );
      };
      llamaObj = llama;

    } else if (forma === 'brasero_calavera') {
      // 3. Aplique mural esculpido en piedra con calavera escupiendo fuego
      const basePiedra = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(0.24, 0.42, 0.14), kit.piedraMuro);
      basePiedra.position.set(0, 0, 0.07);
      basePiedra.castShadow = true;
      g.add(basePiedra);

      const craneo = new ThreeLib.Mesh(new ThreeLib.SphereGeometry(0.15, 8, 8), kit.piedraMuro);
      craneo.position.set(0, 0.02, 0.20);
      craneo.scale.set(1, 1.15, 1);
      craneo.castShadow = true;
      g.add(craneo);

      [-0.05, 0.05].forEach(ex => {
        const ojo = new ThreeLib.Mesh(new ThreeLib.SphereGeometry(0.03, 6, 6), new ThreeLib.MeshBasicMaterial({ color: 0x09090b }));
        ojo.position.set(ex, 0.06, 0.32);
        g.add(ojo);
      });

      const cuenco = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.13, 0.08, 0.11, 8), kit.hierro);
      cuenco.position.set(0, -0.05, 0.26);
      cuenco.castShadow = true;
      g.add(cuenco);

      const llama = new ThreeLib.Mesh(new ThreeLib.ConeGeometry(0.10, 0.30, 6), matLlamaActual);
      llama.position.set(0, 0.14, 0.26);
      g.add(llama);

      luz = new ThreeLib.PointLight(colorLuzVal, intensidad, 18, 1.6);
      luz.position.set(0, 0.2, 0.29);
      g.add(luz);

      animarFn = (t) => {
        luz.intensity = intensidad * (0.85 + Math.sin(t * 13.0) * 0.1 + Math.cos(t * 29.0) * 0.05);
        llama.scale.set(
          1 + Math.sin(t * 16.0) * 0.14,
          1 + Math.cos(t * 20.0) * 0.18,
          1 + Math.sin(t * 16.0) * 0.14
        );
      };
      llamaObj = llama;

    } else if (forma === 'cristal_arcano') {
      // 4. Cristal rúnico flotante sobre soporte de hierro y piedra
      const base = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(0.16, 0.38, 0.09), kit.piedraMuro);
      base.position.set(0, 0, 0.045);
      base.castShadow = true;
      g.add(base);

      const garra = new ThreeLib.Mesh(new ThreeLib.TorusGeometry(0.14, 0.03, 6, 8, Math.PI), kit.hierro);
      garra.position.set(0, -0.06, 0.22);
      garra.rotation.x = -Math.PI / 2;
      garra.castShadow = true;
      g.add(garra);

      const matCristal = new ThreeLib.MeshStandardMaterial({
        color: colorLuzVal,
        emissive: colorLuzVal,
        emissiveIntensity: 1.4,
        roughness: 0.1,
        metalness: 0.2,
        transparent: true,
        opacity: 0.92
      });
      const geoCristal = (typeof ThreeLib.OctahedronGeometry === 'function')
        ? new ThreeLib.OctahedronGeometry(0.14, 0)
        : new ThreeLib.ConeGeometry(0.12, 0.28, 6);
      const cristal = new ThreeLib.Mesh(geoCristal, matCristal);
      cristal.position.set(0, 0.12, 0.22);
      cristal.scale.set(0.8, 1.4, 0.8);
      g.add(cristal);

      luz = new ThreeLib.PointLight(colorLuzVal, intensidad, 18, 1.6);
      luz.position.set(0, 0.14, 0.24);
      g.add(luz);

      animarFn = (t) => {
        const pulso = 0.88 + Math.sin(t * 3.5) * 0.12;
        luz.intensity = intensidad * pulso;
        cristal.rotation.y = t * 1.5;
        cristal.position.y = 0.12 + Math.sin(t * 2.5) * 0.03;
        matCristal.emissiveIntensity = 1.3 * pulso;
      };
      llamaObj = cristal;

    } else {
      // 5. 'antorcha_hierro': Clásica con forja de hierro y cazoleta
      const basePared = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(0.12, 0.4, 0.1), kit.hierro);
      basePared.position.set(0, 0, 0.05);
      basePared.castShadow = true;
      g.add(basePared);

      const brazo = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(0.08, 0.08, 0.32), kit.hierro);
      brazo.position.set(0, 0.05, 0.2);
      brazo.castShadow = true;
      g.add(brazo);

      const cazoleta = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.12, 0.06, 0.18, 8), kit.hierro);
      cazoleta.position.set(0, 0.14, 0.34);
      cazoleta.castShadow = true;
      g.add(cazoleta);

      const llama = new ThreeLib.Mesh(new ThreeLib.ConeGeometry(0.09, 0.26, 6), matLlamaActual);
      llama.position.set(0, 0.3, 0.34);
      g.add(llama);

      luz = new ThreeLib.PointLight(colorLuzVal, intensidad, 18, 1.6);
      luz.position.set(0, 0.35, 0.36);
      g.add(luz);

      animarFn = (t) => {
        luz.intensity = intensidad * (0.88 + Math.sin(t * 12.0) * 0.08 + Math.cos(t * 27.0) * 0.04);
        llama.scale.set(
          1 + Math.sin(t * 15.0) * 0.1,
          1 + Math.cos(t * 18.0) * 0.15,
          1 + Math.sin(t * 15.0) * 0.1
        );
      };
      llamaObj = llama;
    }

    // Configuración de sombras
    if (opciones.sombrasAntorchas !== false && !opciones.sinSombras && luz) {
      luz.castShadow = true;
      if (luz.shadow) {
        luz.shadow.bias = -0.002;
        if (luz.shadow.mapSize) {
          luz.shadow.mapSize.width = 512;
          luz.shadow.mapSize.height = 512;
        }
      }
    }

    g.userData = {
      tipo: 'antorcha',
      forma,
      luz,
      llama: llamaObj,
      baseIntensity: intensidad,
      flicker: animarFn
    };

    return g;
  }

  // B) Fuente ornamental de piedra con pileta de agua
  function crearFuente(ThreeLib, kit, radio = 2.8, altura = 1.4, colorAguaOverride = null) {
    const g = new ThreeLib.Group();

    // Pileta octogonal exterior
    const basePiedra = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(radio, radio * 1.05, altura * 0.7, 8), kit.piedraMuro);
    basePiedra.position.y = altura * 0.35;
    basePiedra.castShadow = true;
    basePiedra.receiveShadow = true;
    g.add(basePiedra);

    // Reborde de la pileta
    const borde = new ThreeLib.Mesh(new ThreeLib.TorusGeometry(radio * 0.95, 0.22, 6, 8), kit.piedraMuro);
    borde.rotation.x = Math.PI / 2;
    borde.position.y = altura * 0.7;
    borde.castShadow = true;
    borde.receiveShadow = true;
    g.add(borde);

    // Superficie de agua (con color override si se define por estancia)
    let matAgua = kit.agua;
    if (colorAguaOverride && colorAguaOverride !== 'default') {
      matAgua = (kit.agua && typeof kit.agua.clone === 'function') ? kit.agua.clone() : Object.assign({}, kit.agua);
      if (matAgua.color && typeof matAgua.color.set === 'function') matAgua.color.set(colorAguaOverride);
      else matAgua.color = colorAguaOverride;
    }
    const agua = new ThreeLib.Mesh(new ThreeLib.CircleGeometry(radio * 0.88, 16), matAgua);
    agua.rotation.x = -Math.PI / 2;
    agua.position.y = altura * 0.62;
    agua.receiveShadow = true;
    g.add(agua);

    // Pedestal central y cuenco superior
    const pilar = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.45, 0.55, altura * 1.3, 8), kit.piedraMuro);
    pilar.position.y = altura * 0.65;
    pilar.castShadow = true;
    pilar.receiveShadow = true;
    g.add(pilar);

    const cuenco = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.95, 0.3, 0.45, 8), kit.piedraMuro);
    cuenco.position.y = altura * 1.35;
    cuenco.castShadow = true;
    cuenco.receiveShadow = true;
    g.add(cuenco);

    // Chorro de agua central
    const chorro = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.08, 0.16, 0.6, 6), matAgua);
    chorro.position.y = altura * 1.7;
    g.add(chorro);

    // Luz ambiental mística
    const colLuz = colorAguaOverride || kit.estilo.colorAgua;
    const luzFuente = new ThreeLib.PointLight(colLuz, 1.8, 14, 1.4);
    luzFuente.position.set(0, altura + 0.5, 0);
    g.add(luzFuente);

    g.userData = {
      tipo: 'fuente',
      agua,
      chorro,
      luzFuente,
      update: (t) => {
        chorro.rotation.y = t * 1.5;
        agua.position.y = (altura * 0.62) + Math.sin(t * 3.0) * 0.02;
      }
    };

    return g;
  }

  // C) Cofre del tesoro con herrajes de hierro, cerradura dorada y tabla de botín configurable
  function crearCofre(ThreeLib, kit, abierto = false, lootConfig = null) {
    const g = new ThreeLib.Group();
    const w = 1.1, h = 0.65, d = 0.75;

    // Cuerpo principal de madera
    const cuerpo = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(w, h * 0.65, d), kit.madera);
    cuerpo.position.y = (h * 0.65) / 2;
    cuerpo.castShadow = true;
    cuerpo.receiveShadow = true;
    g.add(cuerpo);

    // Herrajes de hierro
    const herraje1 = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(w * 1.02, h * 0.66, 0.08), kit.hierro);
    herraje1.position.set(0, (h * 0.65) / 2, d * 0.25);
    herraje1.castShadow = true;
    herraje1.receiveShadow = true;
    g.add(herraje1);

    const herraje2 = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(w * 1.02, h * 0.66, 0.08), kit.hierro);
    herraje2.position.set(0, (h * 0.65) / 2, -d * 0.25);
    herraje2.castShadow = true;
    herraje2.receiveShadow = true;
    g.add(herraje2);

    // Tapa abovedada
    const tapaGroup = new ThreeLib.Group();
    tapaGroup.position.set(0, h * 0.65, -d / 2); // Eje de bisagra trasero

    const tapa = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(d / 2, d / 2, w, 12, 1, false, 0, Math.PI), kit.madera);
    tapa.rotation.z = Math.PI / 2;
    tapa.rotation.x = Math.PI / 2;
    tapa.position.set(0, 0, d / 2);
    tapa.castShadow = true;
    tapa.receiveShadow = true;
    tapaGroup.add(tapa);

    if (abierto) {
      tapaGroup.rotation.x = -Math.PI * 0.55;
    }
    g.add(tapaGroup);

    // Cerradura de oro
    const cerradura = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(0.18, 0.22, 0.08), kit.oro);
    cerradura.position.set(0, (h * 0.65) * 0.75, d / 2 + 0.04);
    cerradura.castShadow = true;
    g.add(cerradura);

    // Halo dorado si está cerrado (tesoro dentro)
    let halo = null;
    if (!abierto) {
      halo = new ThreeLib.PointLight(0xf59e0b, 1.2, 5, 2);
      halo.position.set(0, h + 0.2, 0);
      g.add(halo);
    }

    const cfgBotin = lootConfig || JSON.parse(JSON.stringify(DEFAULT_LOOT_CONFIG));

    g.userData = {
      tipo: 'cofre',
      abierto,
      tapaGroup,
      halo,
      lootConfig: cfgBotin
    };
    return g;
  }

  // D) Jarrones y vasijas de cerámica
  function crearJarron(ThreeLib, kit, escala = 1.0, roto = false) {
    const g = new ThreeLib.Group();

    // Material terracota / cerámica antigua
    const matCeramica = new ThreeLib.MeshStandardMaterial({
      color: 0x9a3412,
      roughness: 0.85,
      metalness: 0.05
    });

    if (roto) {
      // Pedazos de vasija rota
      const p1 = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(0.35 * escala, 0.12 * escala, 0.35 * escala), matCeramica);
      p1.position.set(0.1, 0.06 * escala, 0);
      g.add(p1);
      const p2 = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(0.25 * escala, 0.08 * escala, 0.2 * escala), matCeramica);
      p2.position.set(-0.2, 0.04 * escala, 0.15);
      p2.rotation.y = 0.5;
      g.add(p2);
    } else {
      // Cuerpo abombado
      const cuerpo = new ThreeLib.Mesh(new ThreeLib.SphereGeometry(0.42 * escala, 10, 8), matCeramica);
      cuerpo.scale.set(1, 1.3, 1);
      cuerpo.position.y = 0.5 * escala;
      g.add(cuerpo);

      // Cuello y boca
      const cuello = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.2 * escala, 0.28 * escala, 0.35 * escala, 8), matCeramica);
      cuello.position.y = 0.9 * escala;
      g.add(cuello);

      const borde = new ThreeLib.Mesh(new ThreeLib.TorusGeometry(0.22 * escala, 0.06 * escala, 4, 8), matCeramica);
      borde.rotation.x = Math.PI / 2;
      borde.position.y = 1.06 * escala;
      g.add(borde);
    }

    g.userData = { tipo: 'jarron', roto };
    return g;
  }

  // E) Sarcófago de piedra labrada
  function crearSarcofago(ThreeLib, kit) {
    const g = new ThreeLib.Group();
    const l = 2.4, w = 1.1, h = 0.85;

    // Caja inferior
    const caja = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(w, h * 0.7, l), kit.piedraMuro);
    caja.position.y = (h * 0.7) / 2;
    g.add(caja);

    // Tapa con relieve
    const tapa = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(w * 1.06, 0.22, l * 1.04), kit.sueloLosas);
    tapa.position.y = (h * 0.7) + 0.11;
    g.add(tapa);

    // Efigie / cruz en relieve
    const relieve = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(w * 0.5, 0.08, l * 0.7), kit.piedraMuro);
    relieve.position.y = (h * 0.7) + 0.24;
    g.add(relieve);

    g.userData = { tipo: 'sarcofago' };
    return g;
  }

  // F) Columna monumental con capitel y basa
  function crearColumna(ThreeLib, kit, altura = 4.2, radio = 0.5) {
    const g = new ThreeLib.Group();

    // Basa cuadrada
    const basa = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(radio * 2.5, 0.45, radio * 2.5), kit.piedraMuro);
    basa.position.y = 0.225;
    g.add(basa);

    // Fuste estriado octogonal
    const fuste = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(radio * 0.9, radio, altura - 0.9, 8), kit.piedraMuro);
    fuste.position.y = 0.45 + (altura - 0.9) / 2;
    g.add(fuste);

    // Capitel superior
    const capitel = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(radio * 2.6, 0.45, radio * 2.6), kit.piedraMuro);
    capitel.position.y = altura - 0.225;
    g.add(capitel);

    g.userData = { tipo: 'columna' };
    return g;
  }

  // G) Vegetación subterránea: musgo y yerbas entre losas
  function crearManchaVegetacion(ThreeLib, kit, rng, radio = 1.2) {
    const g = new ThreeLib.Group();

    // Capa de musgo pegada al suelo
    const geoMusgo = new ThreeLib.CircleGeometry(radio, 7);
    const mallaMusgo = new ThreeLib.Mesh(geoMusgo, kit.musgo);
    mallaMusgo.rotation.x = -Math.PI / 2;
    mallaMusgo.position.y = 0.015;
    g.add(mallaMusgo);

    // Briznas de yerbas (planos cruzados)
    const cantHierba = rng.int(3, 7);
    const geoHierba = new ThreeLib.PlaneGeometry(0.35, 0.45);
    for (let i = 0; i < cantHierba; i++) {
      const hMesh = new ThreeLib.Mesh(geoHierba, kit.musgo);
      const ang = rng.range(0, Math.PI * 2);
      const dist = rng.range(0.1, radio * 0.7);
      hMesh.position.set(Math.cos(ang) * dist, 0.22, Math.sin(ang) * dist);
      hMesh.rotation.y = rng.range(0, Math.PI);
      g.add(hMesh);
    }

    return g;
  }

  // H) Hongos bioluminiscentes
  function crearHongosLuminosos(ThreeLib, kit, rng) {
    const g = new ThreeLib.Group();
    const cant = rng.int(2, 5);

    for (let i = 0; i < cant; i++) {
      const hScale = rng.range(0.6, 1.2);
      const ox = rng.range(-0.4, 0.4);
      const oz = rng.range(-0.4, 0.4);

      // Pie
      const pie = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.04 * hScale, 0.06 * hScale, 0.35 * hScale, 5), kit.hongo);
      pie.position.set(ox, 0.17 * hScale, oz);
      g.add(pie);

      // Sombrero brillante
      const sombrero = new ThreeLib.Mesh(new ThreeLib.ConeGeometry(0.18 * hScale, 0.16 * hScale, 6), kit.hongo);
      sombrero.position.set(ox, 0.35 * hScale, oz);
      g.add(sombrero);
    }

    // Luz bioluminiscente sutil
    const luzHongo = new ThreeLib.PointLight(0x38bdf8, 0.9, 4.5, 2.0);
    luzHongo.position.set(0, 0.4, 0);
    g.add(luzHongo);

    g.userData = { tipo: 'hongos', luzHongo };
    return g;
  }

  // I) Armería: soportes de armas, percheros y barriles
  function crearArmeriaProps(ThreeLib, kit, rng) {
    const g = new ThreeLib.Group();

    // Perchero de madera y hierro para armas
    const baseArmero = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(2.4, 0.25, 0.8), kit.madera);
    baseArmero.position.y = 0.125;
    g.add(baseArmero);

    const posteL = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(0.14, 1.8, 0.14), kit.madera);
    posteL.position.set(-1.0, 1.0, 0);
    g.add(posteL);

    const posteR = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(0.14, 1.8, 0.14), kit.madera);
    posteR.position.set(1.0, 1.0, 0);
    g.add(posteR);

    const barra = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(2.2, 0.12, 0.12), kit.hierro);
    barra.position.set(0, 1.7, 0);
    g.add(barra);

    // Lanzas y alabardas apoyadas
    [-0.6, -0.2, 0.2, 0.6].forEach((xOff, i) => {
      const lanza = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.03, 0.04, 2.1, 6), kit.hierro);
      lanza.position.set(xOff, 1.05, 0.05);
      lanza.rotation.z = (i % 2 === 0 ? 0.08 : -0.08);
      g.add(lanza);
    });

    // Barril de suministros
    const barril = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.45, 0.42, 1.1, 10), kit.madera);
    barril.position.set(1.8, 0.55, 0.2);
    g.add(barril);

    [-0.35, 0.35].forEach(yRing => {
      const aro = new ThreeLib.Mesh(new ThreeLib.TorusGeometry(0.46, 0.04, 4, 10), kit.hierro);
      aro.rotation.x = Math.PI / 2;
      aro.position.set(1.8, 0.55 + yRing, 0.2);
      g.add(aro);
    });

    g.userData = { tipo: 'armeria' };
    return g;
  }

  // J) Biblioteca arcana: atril de lectura, grimorio y monolito con orbe
  function crearBibliotecaProps(ThreeLib, kit, rng) {
    const g = new ThreeLib.Group();

    // Atril de lectura monumental
    const baseAtril = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(0.8, 0.9, 0.7), kit.piedraMuro);
    baseAtril.position.y = 0.45;
    g.add(baseAtril);

    const tablaAtril = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(1.0, 0.1, 0.8), kit.madera);
    tablaAtril.position.set(0, 0.95, 0);
    tablaAtril.rotation.x = -0.35;
    g.add(tablaAtril);

    const libro = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(0.7, 0.08, 0.5), kit.hierro);
    libro.position.set(0, 1.02, -0.04);
    libro.rotation.x = -0.35;
    g.add(libro);

    // Monolito rúnico con orbe arcano flotante
    const monolito = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.35, 0.55, 1.6, 6), kit.sueloLosas);
    monolito.position.set(0, 0.8, 2.5);
    g.add(monolito);

    const orbe = new ThreeLib.Mesh(new ThreeLib.SphereGeometry(0.32, 12, 12), new ThreeLib.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.4,
      roughness: 0.2
    }));
    orbe.position.set(0, 1.95, 2.5);
    g.add(orbe);

    const luzOrbe = new ThreeLib.PointLight(0x38bdf8, 2.4, 18, 1.5);
    luzOrbe.position.set(0, 2.0, 2.5);
    g.add(luzOrbe);

    g.userData = {
      tipo: 'biblioteca',
      update: (t) => {
        orbe.position.y = 1.95 + Math.sin(t * 2.2) * 0.08;
        luzOrbe.intensity = 2.4 * (0.9 + Math.sin(t * 3.5) * 0.1);
      }
    };
    return g;
  }

  // K) Prisión / Mazmorra de celdas: rejas de hierro y banco
  function crearPrisionProps(ThreeLib, kit, rng, H = 4.8) {
    const g = new ThreeLib.Group();

    // Rejas de celda verticales
    const cantBarrotes = 8;
    const anchoReja = 3.6;
    for (let i = 0; i <= cantBarrotes; i++) {
      const x = -anchoReja / 2 + (i / cantBarrotes) * anchoReja;
      const barrote = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.04, 0.04, H * 0.85, 6), kit.hierro);
      barrote.position.set(x, (H * 0.85) / 2, 0);
      g.add(barrote);
    }

    [H * 0.2, H * 0.5, H * 0.8].forEach(y => {
      const trav = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(anchoReja + 0.2, 0.08, 0.08), kit.hierro);
      trav.position.set(0, y, 0);
      g.add(trav);
    });

    // Banco de madera
    const banco = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(2.0, 0.45, 0.6), kit.madera);
    banco.position.set(0, 0.225, -1.4);
    g.add(banco);

    // Argolla en muro
    const argolla = new ThreeLib.Mesh(new ThreeLib.TorusGeometry(0.12, 0.03, 4, 8), kit.hierro);
    argolla.position.set(-1.0, 1.2, -2.0);
    g.add(argolla);

    g.userData = { tipo: 'prision' };
    return g;
  }

  // L) Laboratorio de alquimia: caldero burbujeante y mesa de pociones
  function crearLaboratorioProps(ThreeLib, kit, rng) {
    const g = new ThreeLib.Group();

    // Caldero de hierro
    const caldero = new ThreeLib.Mesh(new ThreeLib.SphereGeometry(0.85, 12, 10), kit.hierro);
    caldero.scale.set(1, 0.75, 1);
    caldero.position.y = 0.8;
    g.add(caldero);

    const boca = new ThreeLib.Mesh(new ThreeLib.TorusGeometry(0.72, 0.09, 6, 12), kit.hierro);
    boca.rotation.x = Math.PI / 2;
    boca.position.y = 1.15;
    g.add(boca);

    // Líquido mágico verde
    const liquido = new ThreeLib.Mesh(new ThreeLib.CircleGeometry(0.68, 12), new ThreeLib.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 1.6,
      roughness: 0.1
    }));
    liquido.rotation.x = -Math.PI / 2;
    liquido.position.y = 1.14;
    g.add(liquido);

    const luzCaldero = new ThreeLib.PointLight(0x10b981, 2.5, 16, 1.4);
    luzCaldero.position.set(0, 1.4, 0);
    g.add(luzCaldero);

    // Patas del caldero
    for (let i = 0; i < 3; i++) {
      const ang = (i * Math.PI * 2) / 3;
      const pata = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.06, 0.08, 0.65, 6), kit.hierro);
      pata.position.set(Math.cos(ang) * 0.65, 0.32, Math.sin(ang) * 0.65);
      pata.rotation.z = Math.cos(ang) * 0.25;
      pata.rotation.x = -Math.sin(ang) * 0.25;
      g.add(pata);
    }

    // Mesa de viales
    const mesa = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(1.6, 0.85, 0.8), kit.madera);
    mesa.position.set(2.4, 0.425, 0);
    g.add(mesa);

    [0xef4444, 0x8b5cf6, 0x06b6d4].forEach((col, i) => {
      const vial = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.08, 0.12, 0.32, 6), new ThreeLib.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 1.2
      }));
      vial.position.set(2.0 + i * 0.4, 0.85 + 0.16, 0);
      g.add(vial);
    });

    g.userData = {
      tipo: 'laboratorio',
      update: (t) => {
        luzCaldero.intensity = 2.5 * (0.85 + Math.sin(t * 5.0) * 0.15);
      }
    };
    return g;
  }

  // --- 6. ARQUITECTURA DE SALAS Y CORREDORES (HERMÉTICA SIN HUECOS) ---

  function construirCajaHabitacion(ThreeLib, kit, sala, opciones = {}) {
    const g = new ThreeLib.Group();
    g.position.set(sala.x, sala.y || 0, sala.z);
    g.userData = { idSala: sala.id, salaRef: sala };

    const W = sala.w, H = sala.h, D = sala.d;

    const mats = resolverMaterialesSala(ThreeLib, kit, opciones.kitsPorEstilo, sala);

    // Suelo
    const sueloGeo = new ThreeLib.PlaneGeometry(W, D);
    const suelo = new ThreeLib.Mesh(sueloGeo, mats.matSuelo);
    suelo.rotation.x = -Math.PI / 2;
    suelo.receiveShadow = true;
    suelo.userData = { tipo: 'suelo', idSala: sala.id, salaRef: sala };
    g.add(suelo);

    // Techo: si se especifica sinTecho (o techo: false), se omite para vista cenital e isométrica de editor
    if (opciones.techo !== false && !opciones.sinTecho) {
      const techoGeo = new ThreeLib.PlaneGeometry(W, D);
      const techo = new ThreeLib.Mesh(techoGeo, mats.matTecho);
      techo.rotation.x = Math.PI / 2;
      techo.position.y = H;
      techo.name = 'techo_' + sala.id;
      techo.castShadow = true;
      techo.receiveShadow = true;
      techo.userData = { tipo: 'techo', idSala: sala.id };
      g.add(techo);
    }

    // Muros herméticos con hombros completos y zócalo perimetral inferior
    const grosorMuro = 0.6;
    const ap = sala.aperturas || {};

    function agregarMuroConZocalo(w, d, px, pz, tipoLado, isHombro = false) {
      const hZoc = Math.min(0.7, H * 0.22);
      const hMur = H - hZoc;
      const tipoMuro = isHombro ? 'muro_hombro' : 'muro';

      // 1. Zócalo inferior
      const zocMesh = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(w, hZoc, d), mats.matZocalo);
      zocMesh.position.set(px, hZoc / 2, pz);
      zocMesh.castShadow = true; zocMesh.receiveShadow = true;
      zocMesh.userData = { tipo: 'zocalo', lado: 'zocalo_' + tipoLado, idSala: sala.id };
      g.add(zocMesh);

      // 2. Muro superior
      const murMesh = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(w, hMur, d), mats.matPared);
      murMesh.position.set(px, hZoc + hMur / 2, pz);
      murMesh.castShadow = true; murMesh.receiveShadow = true;
      murMesh.userData = { tipo: tipoMuro, lado: tipoLado, idSala: sala.id };
      g.add(murMesh);
    }

    // 1. Muro Norte (-Z)
    const apN = sala.abiertoNorte ? (ap.norte || { w: Math.min(W - 0.4, opciones.anchoPasillos || 6.8), cx: 0, puertaH: Math.min(H, 3.8) }) : null;
    if (!apN) {
      agregarMuroConZocalo(W, grosorMuro, 0, -D / 2 + grosorMuro / 2, 'norte', false);
    } else {
      const pw = Math.min(W - 0.2, apN.w || 6.8);
      const cx = apN.cx || 0;
      const pH = apN.puertaH || Math.min(H, 3.8);

      // Hombro izquierdo (-X / Oeste)
      const wIzq = (cx - pw / 2) - (-W / 2);
      if (wIzq > 0.05) {
        agregarMuroConZocalo(wIzq, grosorMuro, -W / 2 + wIzq / 2, -D / 2 + grosorMuro / 2, 'norte_oeste', true);
      }
      // Hombro derecho (+X / Este)
      const wDer = (W / 2) - (cx + pw / 2);
      if (wDer > 0.05) {
        agregarMuroConZocalo(wDer, grosorMuro, cx + pw / 2 + wDer / 2, -D / 2 + grosorMuro / 2, 'norte_este', true);
      }
      // Dintel superior sobre la puerta
      if (H > pH + 0.2) {
        const dH = H - pH;
        const dintel = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(pw, dH, grosorMuro), mats.matPared);
        dintel.position.set(cx, H - dH / 2, -D / 2 + grosorMuro / 2);
        dintel.castShadow = true; dintel.receiveShadow = true;
        dintel.userData = { tipo: 'dintel', lado: 'norte', idSala: sala.id };
        g.add(dintel);
      }
    }

    // 2. Muro Sur (+Z)
    const apS = sala.abiertoSur ? (ap.sur || { w: Math.min(W - 0.4, opciones.anchoPasillos || 6.8), cx: 0, puertaH: Math.min(H, 3.8) }) : null;
    if (!apS) {
      agregarMuroConZocalo(W, grosorMuro, 0, D / 2 - grosorMuro / 2, 'sur', false);
    } else {
      const pw = Math.min(W - 0.2, apS.w || 6.8);
      const cx = apS.cx || 0;
      const pH = apS.puertaH || Math.min(H, 3.8);

      const wIzq = (cx - pw / 2) - (-W / 2);
      if (wIzq > 0.05) {
        agregarMuroConZocalo(wIzq, grosorMuro, -W / 2 + wIzq / 2, D / 2 - grosorMuro / 2, 'sur_oeste', true);
      }
      const wDer = (W / 2) - (cx + pw / 2);
      if (wDer > 0.05) {
        agregarMuroConZocalo(wDer, grosorMuro, cx + pw / 2 + wDer / 2, D / 2 - grosorMuro / 2, 'sur_este', true);
      }
      if (H > pH + 0.2) {
        const dH = H - pH;
        const dintel = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(pw, dH, grosorMuro), mats.matPared);
        dintel.position.set(cx, H - dH / 2, D / 2 - grosorMuro / 2);
        dintel.castShadow = true; dintel.receiveShadow = true;
        dintel.userData = { tipo: 'dintel', lado: 'sur', idSala: sala.id };
        g.add(dintel);
      }
    }

    // 3. Muro Oeste (-X)
    const apO = sala.abiertoOeste ? (ap.oeste || { d: Math.min(D - 0.4, 6.0), cz: 0, puertaH: Math.min(H, 3.8) }) : null;
    if (!apO) {
      agregarMuroConZocalo(grosorMuro, D, -W / 2 + grosorMuro / 2, 0, 'oeste', false);
    } else {
      const pd = Math.min(D - 0.2, apO.d || 6.0);
      const cz = apO.cz || 0;
      const pH = apO.puertaH || Math.min(H, 3.8);

      const dNorte = (cz - pd / 2) - (-D / 2);
      if (dNorte > 0.05) {
        agregarMuroConZocalo(grosorMuro, dNorte, -W / 2 + grosorMuro / 2, -D / 2 + dNorte / 2, 'oeste_norte', true);
      }
      const dSur = (D / 2) - (cz + pd / 2);
      if (dSur > 0.05) {
        agregarMuroConZocalo(grosorMuro, dSur, -W / 2 + grosorMuro / 2, cz + pd / 2 + dSur / 2, 'oeste_sur', true);
      }
      if (H > pH + 0.2) {
        const dH = H - pH;
        const dintel = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(grosorMuro, dH, pd), mats.matPared);
        dintel.position.set(-W / 2 + grosorMuro / 2, H - dH / 2, cz);
        dintel.castShadow = true; dintel.receiveShadow = true;
        dintel.userData = { tipo: 'dintel', lado: 'oeste', idSala: sala.id };
        g.add(dintel);
      }
    }

    // 4. Muro Este (+X)
    const apE = sala.abiertoEste ? (ap.este || { d: Math.min(D - 0.4, 6.0), cz: 0, puertaH: Math.min(H, 3.8) }) : null;
    if (!apE) {
      agregarMuroConZocalo(grosorMuro, D, W / 2 - grosorMuro / 2, 0, 'este', false);
    } else {
      const pd = Math.min(D - 0.2, apE.d || 6.0);
      const cz = apE.cz || 0;
      const pH = apE.puertaH || Math.min(H, 3.8);

      const dNorte = (cz - pd / 2) - (-D / 2);
      if (dNorte > 0.05) {
        agregarMuroConZocalo(grosorMuro, dNorte, W / 2 - grosorMuro / 2, -D / 2 + dNorte / 2, 'este_norte', true);
      }
      const dSur = (D / 2) - (cz + pd / 2);
      if (dSur > 0.05) {
        agregarMuroConZocalo(grosorMuro, dSur, W / 2 - grosorMuro / 2, cz + pd / 2 + dSur / 2, 'este_sur', true);
      }
      if (H > pH + 0.2) {
        const dH = H - pH;
        const dintel = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(grosorMuro, dH, pd), mats.matPared);
        dintel.position.set(W / 2 - grosorMuro / 2, H - dH / 2, cz);
        dintel.castShadow = true; dintel.receiveShadow = true;
        dintel.userData = { tipo: 'dintel', lado: 'este', idSala: sala.id };
        g.add(dintel);
      }
    }

    return g;
  }

  // --- 7. DECORACIÓN MODULAR DE HABITACIONES Y CORREDORES ---

  function decorarHabitacion(ThreeLib, kit, sala, estilo, rng, animables, props, config = {}) {
    const g = new ThreeLib.Group();
    g.position.set(sala.x, sala.y || 0, sala.z);

    const cfgProps = config.props || {};
    const W = sala.w;
    const D = sala.d;
    const H = sala.h;

    // Luz ambiental o puntual propia configurada individualmente para la estancia
    if (sala.colorLuz && sala.colorLuz !== 'default') {
      const intLuz = typeof sala.intensidadLuz === 'number' ? sala.intensidadLuz : 2.0;
      const distLuz = Math.max(W, D) * 1.8;
      const luzSala = new ThreeLib.PointLight(sala.colorLuz, intLuz, distLuz, 1.5);
      luzSala.position.set(0, H - 0.5, 0);
      if (config.sombrasAntorchas !== false) {
        luzSala.castShadow = true;
        if (luzSala.shadow) {
          luzSala.shadow.bias = -0.002;
          if (luzSala.shadow.mapSize) {
            luzSala.shadow.mapSize.width = 512;
            luzSala.shadow.mapSize.height = 512;
          }
        }
      }
      g.add(luzSala);
    }

    const distEntreAntorchas = (config && (config.distanciaAntorchas || config.distanciaEntreAntorchas)) || 8.0;
    const colorLuzDefinido = (config && (config.colorLuzAntorcha || config.colorLuz)) || estilo.luzAntorchas || 0xf59e0b;
    const intLuzDefinida = (config && typeof config.intensidadAntorchas === 'number') ? config.intensidadAntorchas : 2.4;
    const formaAntorchaDef = (config && (config.formaAntorcha || config.forma)) || 'antorcha_hierro';

    switch (sala.tipo) {
      case 'entrada': {
        if (cfgProps.antorchas !== false) {
          const aL = crearAntorcha(ThreeLib, kit, colorLuzDefinido, intLuzDefinida, Object.assign({}, config, { forma: formaAntorchaDef }));
          aL.position.set(-2.8, 2.2, D / 2 - 0.4);
          aL.rotation.y = Math.PI / 2;
          g.add(aL);
          animables.push(aL);
          props.antorchas.push(aL);

          const aR = crearAntorcha(ThreeLib, kit, colorLuzDefinido, intLuzDefinida, Object.assign({}, config, { forma: formaAntorchaDef }));
          aR.position.set(2.8, 2.2, D / 2 - 0.4);
          aR.rotation.y = -Math.PI / 2;
          g.add(aR);
          animables.push(aR);
          props.antorchas.push(aR);
        }
        break;
      }

      case 'fuente': {
        if (cfgProps.fuentes !== false) {
          const radioF = Math.max(1.8, Math.min(3.6, W * 0.18));
          const kitFuente = (config.kitsPorEstilo && config.kitsPorEstilo[sala.estiloFuente]) || kit;
          const fuente = crearFuente(ThreeLib, kitFuente, radioF, 1.4, sala.colorAgua);
          fuente.position.set(0, 0, 0);
          g.add(fuente);
          animables.push(fuente);
          props.fuentes.push(fuente);
        }
        if (cfgProps.musgo !== false) {
          [-W * 0.32, W * 0.32].forEach(vx => {
            [-D * 0.32, D * 0.32].forEach(vz => {
              const veg = crearManchaVegetacion(ThreeLib, kit, rng, rng.range(1.2, 2.0));
              veg.position.set(vx, 0, vz);
              g.add(veg);
            });
          });
        }
        if (cfgProps.hongos !== false) {
          const h1 = crearHongosLuminosos(ThreeLib, kit, rng);
          h1.position.set(-2.2, 0, -1.8);
          g.add(h1);
          const h2 = crearHongosLuminosos(ThreeLib, kit, rng);
          h2.position.set(2.2, 0, 1.8);
          g.add(h2);
        }
        break;
      }

      case 'tesoro': {
        if (cfgProps.cofres !== false) {
          const loot1 = (sala.lootCofres && sala.lootCofres[0]) || JSON.parse(JSON.stringify(DEFAULT_LOOT_CONFIG));
          const c1 = crearCofre(ThreeLib, kit, false, loot1);
          c1.position.set(0, 0, 0);
          c1.userData.idProp = 'cofre_auto_' + sala.id + '_0';
          c1.userData.idSala = sala.id;
          g.add(c1);
          props.cofres.push(c1);

          if (W >= 11) {
            const loot2 = (sala.lootCofres && sala.lootCofres[1]) || JSON.parse(JSON.stringify(DEFAULT_LOOT_CONFIG));
            const c2 = crearCofre(ThreeLib, kit, rng.chance(0.5), loot2);
            c2.position.set(W * 0.28, 0, -D * 0.18);
            c2.rotation.y = -Math.PI / 4;
            c2.userData.idProp = 'cofre_auto_' + sala.id + '_1';
            c2.userData.idSala = sala.id;
            g.add(c2);
            props.cofres.push(c2);
          }
        }
        if (cfgProps.jarrones !== false) {
          [-W * 0.28, W * 0.28].forEach(jx => {
            const jarron = crearJarron(ThreeLib, kit, rng.range(0.9, 1.25), rng.chance(0.25));
            jarron.position.set(jx, 0, D * 0.22);
            g.add(jarron);
          });
        }
        break;
      }

      case 'cripta_columnas': {
        const spanX = Math.max(3.5, W * 0.28);
        const spanZ = Math.max(3.5, D * 0.28);
        [-spanX, spanX].forEach(cx => {
          [-spanZ, spanZ].forEach(cz => {
            const col = crearColumna(ThreeLib, kit, H, Math.min(0.65, W * 0.035));
            col.position.set(cx, 0, cz);
            g.add(col);
          });
        });
        if (cfgProps.sarcofagos !== false) {
          const sarc1 = crearSarcofago(ThreeLib, kit);
          sarc1.position.set(-W * 0.36, 0, 0);
          sarc1.rotation.y = Math.PI / 2;
          g.add(sarc1);

          const sarc2 = crearSarcofago(ThreeLib, kit);
          sarc2.position.set(W * 0.36, 0, 0);
          sarc2.rotation.y = -Math.PI / 2;
          g.add(sarc2);
        }
        break;
      }

      case 'armeria': {
        const arm = crearArmeriaProps(ThreeLib, kit, rng);
        arm.position.set(0, 0, -D * 0.22);
        g.add(arm);

        if (cfgProps.cofres !== false) {
          const cofreArmas = crearCofre(ThreeLib, kit, false);
          cofreArmas.position.set(-W * 0.28, 0, D * 0.2);
          g.add(cofreArmas);
          props.cofres.push(cofreArmas);
        }
        break;
      }

      case 'biblioteca': {
        const bib = crearBibliotecaProps(ThreeLib, kit, rng);
        bib.position.set(0, 0, 0);
        g.add(bib);
        animables.push(bib);
        break;
      }

      case 'prision': {
        const pris = crearPrisionProps(ThreeLib, kit, rng, H);
        pris.position.set(0, 0, 0);
        g.add(pris);
        break;
      }

      case 'laboratorio': {
        const lab = crearLaboratorioProps(ThreeLib, kit, rng);
        lab.position.set(0, 0, 0);
        g.add(lab);
        animables.push(lab);
        break;
      }

      case 'jardin_subterraneo': {
        [-W * 0.25, 0, W * 0.25].forEach((vx, idx) => {
          [-D * 0.25, D * 0.25].forEach((vz, idz) => {
            const veg = crearManchaVegetacion(ThreeLib, kit, rng, rng.range(1.3, 2.2));
            veg.position.set(vx + (idz % 2 ? 0.6 : -0.6), 0, vz);
            g.add(veg);
          });
        });
        if (cfgProps.hongos !== false) {
          [-W * 0.22, W * 0.22].forEach(hx => {
            const h = crearHongosLuminosos(ThreeLib, kit, rng);
            h.position.set(hx, 0, 0);
            g.add(h);
          });
        }
        break;
      }

      case 'sala_jefe': {
        const estradoW = Math.min(W * 0.55, 12);
        const estradoD = Math.min(D * 0.45, 9);
        const estrado = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(estradoW, 0.6, estradoD), kit.piedraMuro);
        estrado.position.set(0, 0.3, -D * 0.15);
        g.add(estrado);

        const tronoBase = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(2.4, 0.9, 1.8), kit.sueloLosas);
        tronoBase.position.set(0, 0.6 + 0.45, -D * 0.15 - 1.0);
        g.add(tronoBase);

        const tronoRespaldo = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(2.2, 3.2, 0.4), kit.piedraMuro);
        tronoRespaldo.position.set(0, 0.6 + 1.6, -D * 0.15 - 1.8);
        g.add(tronoRespaldo);

        const bxOff = Math.min(estradoW * 0.35, 3.4);
        [-bxOff, bxOff].forEach(bx => {
          const brasero = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.65, 0.35, 1.2, 8), kit.hierro);
          brasero.position.set(bx, 0.6, -D * 0.15 + 1.8);
          g.add(brasero);

          const llamaBoss = new ThreeLib.Mesh(new ThreeLib.ConeGeometry(0.35, 0.8, 6), new ThreeLib.MeshBasicMaterial({ color: estilo.luzJefe }));
          llamaBoss.position.set(bx, 1.45, -D * 0.15 + 1.8);
          g.add(llamaBoss);

          const luzBoss = new ThreeLib.PointLight(estilo.luzJefe, 3.6, 26, 1.4);
          luzBoss.position.set(bx, 1.8, -D * 0.15 + 1.8);
          g.add(luzBoss);

          animables.push({
            flicker: (t) => {
              luzBoss.intensity = 3.6 * (0.85 + Math.sin(t * 8.0 + bx) * 0.12);
            }
          });
        });
        break;
      }

      case 'pasillo': {
        if (cfgProps.antorchas !== false && D >= 6) {
          const cantPares = Math.max(1, Math.floor(D / distEntreAntorchas));
          for (let p = 0; p < cantPares; p++) {
            const zRel = -D / 2 + (p + 0.5) * (D / cantPares);
            const aL = crearAntorcha(ThreeLib, kit, colorLuzDefinido, intLuzDefinida, Object.assign({}, config, { forma: formaAntorchaDef }));
            aL.position.set(-W / 2 + 0.25, 2.2, zRel);
            aL.rotation.y = Math.PI / 2;
            g.add(aL);
            animables.push(aL);
            props.antorchas.push(aL);

            const aR = crearAntorcha(ThreeLib, kit, colorLuzDefinido, intLuzDefinida, Object.assign({}, config, { forma: formaAntorchaDef }));
            aR.position.set(W / 2 - 0.25, 2.2, zRel);
            aR.rotation.y = -Math.PI / 2;
            g.add(aR);
            animables.push(aR);
            props.antorchas.push(aR);
          }
        }
        break;
      }
    }

    // Distribución automática paramétrica de antorchas en paredes de salas (según distancia, color, intensidad y forma)
    if (config && cfgProps.antorchas !== false && config.antorchasAutomaticas !== false && sala.tipo !== 'pasillo' && sala.tipo !== 'entrada') {
      const ap = sala.aperturas || {};
      const altPared = 2.4;
      const offP = 0.22;

      const ponerAntorchasEnPared = (x1, z1, x2, z2, rotY, apPuerta, esHoriz) => {
        const dx = x2 - x1;
        const dz = z2 - z1;
        const distTotal = Math.hypot(dx, dz);
        if (distTotal < 3.2) return;

        const count = Math.max(1, Math.round(distTotal / distEntreAntorchas));
        for (let i = 1; i <= count; i++) {
          const t = i / (count + 1);
          const ax = x1 + dx * t;
          const az = z1 + dz * t;

          // Evitar colisión con el hueco o vano de paso de la puerta
          if (apPuerta) {
            if (esHoriz) {
              const cx = apPuerta.cx || 0;
              const halfW = (apPuerta.w || 6.8) / 2 + 0.5;
              if (ax >= cx - halfW && ax <= cx + halfW) continue;
            } else {
              const cz = apPuerta.cz || 0;
              const halfD = (apPuerta.d || 6.0) / 2 + 0.5;
              if (az >= cz - halfD && az <= cz + halfD) continue;
            }
          }

          const ant = crearAntorcha(ThreeLib, kit, colorLuzDefinido, intLuzDefinida, Object.assign({}, config, { forma: formaAntorchaDef }));
          ant.position.set(ax, altPared, az);
          ant.rotation.y = rotY;
          ant.userData = ant.userData || {};
          ant.userData.esAuto = true;
          ant.userData.idPropAuto = 'antorcha_auto_' + sala.id + '_' + props.antorchas.length;
          ant.userData.idSala = sala.id;
          g.add(ant);
          animables.push(ant);
          props.antorchas.push(ant);
        }
      };

      // 1. Pared Norte
      ponerAntorchasEnPared(-W / 2 + 1.2, -D / 2 + offP, W / 2 - 1.2, -D / 2 + offP, 0, sala.abiertoNorte ? (ap.norte || { w: 6.8, cx: 0 }) : null, true);
      // 2. Pared Sur
      ponerAntorchasEnPared(-W / 2 + 1.2, D / 2 - offP, W / 2 - 1.2, D / 2 - offP, Math.PI, sala.abiertoSur ? (ap.sur || { w: 6.8, cx: 0 }) : null, true);
      // 3. Pared Oeste
      ponerAntorchasEnPared(-W / 2 + offP, -D / 2 + 1.2, -W / 2 + offP, D / 2 - 1.2, Math.PI / 2, sala.abiertoOeste ? (ap.oeste || { d: 6.0, cz: 0 }) : null, false);
      // 4. Pared Este
      ponerAntorchasEnPared(W / 2 - offP, -D / 2 + 1.2, W / 2 - offP, D / 2 - 1.2, -Math.PI / 2, sala.abiertoEste ? (ap.este || { d: 6.0, cz: 0 }) : null, false);
    }

    // Props decorativos introducidos individualmente en esta estancia
    if (Array.isArray(sala.propsPersonalizados)) {
      sala.propsPersonalizados.forEach(pDef => {
        try {
          const pMesh = crearObjetoDecorativo(ThreeLib, kit, pDef.tipo, estilo, rng, animables, props, pDef);
          if (pMesh) {
            pMesh.position.set(pDef.x || 0, pDef.y || 0, pDef.z || 0);
            if (typeof pDef.rotY === 'number') pMesh.rotation.y = pDef.rotY;
            if (typeof pDef.escala === 'number') if (pMesh.scale.setScalar) pMesh.scale.setScalar(pDef.escala); else if (pMesh.scale.set) pMesh.scale.set(pDef.escala, pDef.escala, pDef.escala);
            pMesh.userData = pMesh.userData || {};
            pMesh.userData.idProp = pDef.id;
            pMesh.userData.propId = pDef.id;
            pMesh.userData.tipoProp = pDef.tipo;
            pMesh.userData.idSala = sala.id;
            pMesh.userData.propDef = pDef;
            if (pDef.lootConfig || pDef.tipo === 'cofre' || pDef.tipo === 'cofre_oro') {
              pMesh.userData.lootConfig = pDef.lootConfig || JSON.parse(JSON.stringify(DEFAULT_LOOT_CONFIG));
            }
            if (typeof pMesh.traverse === 'function') {
              pMesh.traverse(child => {
                if (child) {
                  child.userData = child.userData || {};
                  child.userData.idProp = pDef.id;
                  child.userData.propId = pDef.id;
                  child.userData.tipoProp = pDef.tipo;
                  child.userData.idSala = sala.id;
                  child.userData.propDef = pDef;
                }
              });
            }
            g.add(pMesh);
          }
        } catch (e) {
          console.warn('Error instanciando prop personalizado en estancia:', pDef, e);
        }
      });
    }

    return g;
  }

  // --- 7.1 CATÁLOGO Y CREADOR DE PROPS DECORATIVOS ---

  const CATALOGO_PROPS_DECORATIVOS = {
    armero: { id: 'armero', nombre: 'Armero y Barriles', icono: '⚔️' },
    biblioteca: { id: 'biblioteca', nombre: 'Atril Arcano con Orbe', icono: '📜' },
    celda: { id: 'celda', nombre: 'Rejas de Celda y Cadenas', icono: '⛓️' },
    caldero: { id: 'caldero', nombre: 'Caldero de Alquimia y Pociones', icono: '⚗️' },
    hongos: { id: 'hongos', nombre: 'Colonia de Hongos Luminosos', icono: '🍄' },
    fuente: { id: 'fuente', nombre: 'Fuente de Agua Tallada', icono: '⛲' },
    cofre: { id: 'cofre', nombre: 'Cofre de Hierro', icono: '📦' },
    cofre_oro: { id: 'cofre_oro', nombre: 'Cofre Dorado del Tesoro', icono: '🪙' },
    jarron: { id: 'jarron', nombre: 'Jarrones de Cerámica', icono: '🏺' },
    sarcofago: { id: 'sarcofago', nombre: 'Sarcófago de Piedra Labrada', icono: '🪦' },
    antorcha: { id: 'antorcha', nombre: 'Antorcha Mágica de Pared', icono: '🔥' },
    pebetero: { id: 'pebetero', nombre: 'Pebetero de Suelo con Fuego', icono: '🪔' },
    musgo: { id: 'musgo', nombre: 'Parche de Vegetación y Musgo', icono: '🌿' },
    columna: { id: 'columna', nombre: 'Columna / Pilar Monumental', icono: '🏛️' }
  };

  function crearObjetoDecorativo(ThreeLib, kit, tipo, estilo, rng, animables, props, opciones = {}) {
    if (!rng) rng = new PRNG(12345);
    const tipoNorm = (tipo || 'antorcha').toLowerCase();
    let res = null;

    switch (tipoNorm) {
      case 'armero':
        res = crearArmeriaProps(ThreeLib, kit, rng);
        break;
      case 'biblioteca':
      case 'atril':
        res = crearBibliotecaProps(ThreeLib, kit, rng);
        break;
      case 'celda':
      case 'prision':
        res = crearPrisionProps(ThreeLib, kit, rng, opciones.h || 5.0);
        break;
      case 'caldero':
      case 'laboratorio':
        res = crearLaboratorioProps(ThreeLib, kit, rng);
        break;
      case 'hongos':
      case 'esporas':
        res = crearHongosLuminosos(ThreeLib, kit, rng);
        break;
      case 'fuente': {
        const f = crearFuente(ThreeLib, kit, 2.5, 1.2, opciones.colorAgua);
        if (animables) animables.push(f);
        if (props && props.fuentes) props.fuentes.push(f);
        res = f;
        break;
      }
      case 'cofre': {
        const loot = opciones.lootConfig || JSON.parse(JSON.stringify(DEFAULT_LOOT_CONFIG));
        const c = crearCofre(ThreeLib, kit, opciones.abierto || false, loot);
        c.userData.idProp = opciones.id;
        c.userData.tipoProp = 'cofre';
        c.userData.lootConfig = loot;
        if (props && props.cofres) props.cofres.push(c);
        res = c;
        break;
      }
      case 'cofre_oro': {
        const loot = opciones.lootConfig || JSON.parse(JSON.stringify(DEFAULT_LOOT_CONFIG));
        const c = crearCofre(ThreeLib, kit, true, loot);
        c.userData.idProp = opciones.id;
        c.userData.tipoProp = 'cofre_oro';
        c.userData.lootConfig = loot;
        if (props && props.cofres) props.cofres.push(c);
        res = c;
        break;
      }
      case 'jarron':
        res = crearJarron(ThreeLib, kit, 1.0, false);
        break;
      case 'sarcofago':
        res = crearSarcofago(ThreeLib, kit);
        break;
      case 'antorcha': {
        const a = crearAntorcha(ThreeLib, kit, (estilo && estilo.luzAntorchas) || 0xf59e0b, 2.5, opciones);
        if (animables) animables.push(a);
        if (props && props.antorchas) props.antorchas.push(a);
        res = a;
        break;
      }
      case 'pebetero': {
        const p = new ThreeLib.Group();
        p.userData = { tipo: 'pebetero' };
        const base = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.7, 0.9, 0.7, 8), kit.piedraMuro);
        base.position.y = 0.35;
        base.castShadow = true;
        base.receiveShadow = true;
        p.add(base);
        const fuego = new ThreeLib.Mesh(new ThreeLib.ConeGeometry(0.35, 0.75, 6), kit.llama);
        fuego.position.y = 0.85;
        p.add(fuego);
        const colLuz = (estilo && estilo.luzAntorchas) || 0xf59e0b;
        const luz = new ThreeLib.PointLight(colLuz, 2.8, 16, 1.4);
        luz.position.y = 1.0;
        if (opciones.sombrasAntorchas !== false && !opciones.sinSombras) {
          luz.castShadow = true;
          if (luz.shadow) {
            luz.shadow.bias = -0.002;
            if (luz.shadow.mapSize) {
              luz.shadow.mapSize.width = 512;
              luz.shadow.mapSize.height = 512;
            }
          }
        }
        p.add(luz);
        p.userData.flicker = t => {
          fuego.scale.y = 0.9 + Math.sin(t * 12.0) * 0.18;
          luz.intensity = 2.8 * (0.85 + Math.sin(t * 10.0) * 0.15);
        };
        if (animables) animables.push(p);
        res = p;
        break;
      }
      case 'musgo':
        res = crearManchaVegetacion(ThreeLib, kit, rng, opciones.radio || 1.6);
        break;
      case 'columna':
        res = crearColumna(ThreeLib, kit, opciones.h || 5.0, opciones.radio || 0.6);
        break;
      default:
        res = crearJarron(ThreeLib, kit, 1.0, false);
        break;
    }

    if (res && typeof res.traverse === 'function') {
      res.traverse(child => {
        if (child && child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }

    return res;
  }

  // --- 7.2 CÁLCULO DE APERTURAS Y HOMBROS HERMÉTICOS ENTRE ESTANCIAS ---

  function calcularAperturasEntreSalas(salas, config = {}) {
    if (!Array.isArray(salas)) return;
    const anchoPasillos = typeof config.anchoPasillos === 'number' ? config.anchoPasillos : 6.8;

    salas.forEach(s => {
      s.aperturas = s.aperturas || { norte: null, sur: null, este: null, oeste: null };
    });

    for (let i = 0; i < salas.length; i++) {
      const a = salas[i];
      for (let j = i + 1; j < salas.length; j++) {
        const b = salas[j];

        // 1. Conexión Norte-Sur: a está al sur de b (a.z > b.z)
        const gapZ = (a.z - a.d / 2) - (b.z + b.d / 2);
        if (Math.abs(gapZ) <= 3.0 || (a.z > b.z && gapZ < 6.0 && (a.abiertoNorte || a.tipo === 'pasillo' || b.tipo === 'pasillo'))) {
          const minX = Math.max(a.x - a.w / 2, b.x - b.w / 2);
          const maxX = Math.min(a.x + a.w / 2, b.x + b.w / 2);
          const overlapX = maxX - minX;

          if (overlapX > 1.2 && a.z > b.z) {
            const pw = Math.max(2.5, Math.min(overlapX, a.w - 0.2, b.w - 0.2, anchoPasillos));
            const cxMundo = (minX + maxX) / 2;
            const pH = Math.min(a.h, b.h, 3.8);

            a.abiertoNorte = true;
            a.aperturas.norte = { w: pw, cx: cxMundo - a.x, puertaH: pH };

            b.abiertoSur = true;
            b.aperturas.sur = { w: pw, cx: cxMundo - b.x, puertaH: pH };
          }
        }

        // 2. Conexión Este-Oeste: a está al oeste de b (a.x < b.x)
        const gapX = (b.x - b.w / 2) - (a.x + a.w / 2);
        if (Math.abs(gapX) <= 6.0 || (a.abiertoEste && b.abiertoOeste)) {
          const minZ = Math.max(a.z - a.d / 2, b.z - b.d / 2);
          const maxZ = Math.min(a.z + a.d / 2, b.z + b.d / 2);
          const overlapZ = maxZ - minZ;

          if (overlapZ > 1.2 && a.x < b.x) {
            const pd = Math.max(2.5, Math.min(overlapZ, a.d - 0.2, b.d - 0.2, 6.0));
            const czMundo = (minZ + maxZ) / 2;
            const pH = Math.min(a.h, b.h, 3.8);

            a.abiertoEste = true;
            a.aperturas.este = { d: pd, cz: czMundo - a.z, puertaH: pH };

            b.abiertoOeste = true;
            b.aperturas.oeste = { d: pd, cz: czMundo - b.z, puertaH: pH };
          }
        }
      }
    }

    // Asegurar aperturas herméticas por defecto si una sala tiene abierta una dirección
    salas.forEach(s => {
      const defW = Math.min(s.w - 0.4, anchoPasillos);
      const defD = Math.min(s.d - 0.4, 6.0);
      const pH = Math.min(s.h, 3.8);

      if (s.abiertoNorte && !s.aperturas.norte) s.aperturas.norte = { w: defW, cx: 0, puertaH: pH };
      if (s.abiertoSur && !s.aperturas.sur) s.aperturas.sur = { w: defW, cx: 0, puertaH: pH };
      if (s.abiertoEste && !s.aperturas.este) s.aperturas.este = { d: defD, cz: 0, puertaH: pH };
      if (s.abiertoOeste && !s.aperturas.oeste) s.aperturas.oeste = { d: defD, cz: 0, puertaH: pH };
    });
  }

  // --- 8. PLANIFICADOR DE PLANTA PROCEDURAL Y ESTANCIAS ---

  function generarPlanEstancias(config, rng) {
    const radio = typeof config.radio === 'number' ? Math.max(35, config.radio) : (typeof config.radioMazmorra === 'number' ? Math.max(35, config.radioMazmorra) : 60);
    const tamanoMedio = typeof config.tamanoMedio === 'number' ? Math.max(8, config.tamanoMedio) : (typeof config.tamanoSalasMedio === 'number' ? Math.max(8, config.tamanoSalasMedio) : 16);
    const varianzaTamano = typeof config.varianzaTamano === 'number' ? Math.min(1.0, Math.max(0, config.varianzaTamano)) : (typeof config.varianzaTamanoSalas === 'number' ? Math.min(1.0, Math.max(0, config.varianzaTamanoSalas)) : 0.35);
    const numeroSalas = typeof config.numeroSalas === 'number' ? Math.max(4, Math.min(25, config.numeroSalas)) : 6;
    const ramificacion = typeof config.ramificacion === 'number' ? Math.min(1.0, Math.max(0, config.ramificacion)) : 0.5;
    const anchoPasillos = typeof config.anchoPasillos === 'number' ? Math.max(3.5, config.anchoPasillos) : 6.8;
    const alturaTechos = typeof config.alturaTechos === 'number' ? Math.max(3.5, config.alturaTechos) : 5.2;

    const salasPersonalizadas = Array.isArray(config.salasPersonalizadas) ? config.salasPersonalizadas : (Array.isArray(config.estanciasAdicionales) ? config.estanciasAdicionales : []);

    const esDefault = (radio === 60 && numeroSalas === 6 && tamanoMedio === 16 && varianzaTamano === 0.35 && salasPersonalizadas.length === 0 && (!config.customLayout));

    if (esDefault) {
      return [
        { id: 'room_entrada', tipo: 'entrada', nombre: 'Vestíbulo de Entrada', x: 0, y: 0, z: 42, w: 12, d: 14, h: 4.8, abiertoNorte: true },
        { id: 'corridor_1', tipo: 'pasillo', nombre: 'Corredor de los Guardias', x: 0, y: 0, z: 27, w: 6.8, d: 16, h: 4.2, abiertoSur: true, abiertoNorte: true },
        { id: 'room_fuente', tipo: 'fuente', nombre: 'Santuario de la Fuente', x: 0, y: 0, z: 11, w: 18, d: 16, h: 5.6, abiertoSur: true, abiertoNorte: true, abiertoEste: true },
        { id: 'room_tesoro', tipo: 'tesoro', nombre: 'Cámara Secreta del Tesoro', x: 17, y: 0, z: 11, w: 12, d: 12, h: 4.4, abiertoOeste: true },
        { id: 'corridor_2', tipo: 'pasillo', nombre: 'Galería de Arcos', x: 0, y: 0, z: -5, w: 7.2, d: 16, h: 4.5, abiertoSur: true, abiertoNorte: true },
        { id: 'room_columnas', tipo: 'cripta_columnas', nombre: 'Gran Cripta de Columnas', x: 0, y: 0, z: -23, w: 22, d: 20, h: 6.2, abiertoSur: true, abiertoNorte: true },
        { id: 'corridor_3', tipo: 'pasillo', nombre: 'Pasaje del Trono', x: 0, y: 0, z: -38, w: 7.2, d: 10, h: 4.5, abiertoSur: true, abiertoNorte: true },
        { id: 'room_boss', tipo: 'sala_jefe', nombre: 'Cámara del Trono del Caído', x: 0, y: 0, z: -55, w: 24, d: 24, h: 7.5, abiertoSur: true }
      ];
    }

    // --- GENERACIÓN DINÁMICA DE LA RED DE ESTANCIAS ---
    const salas = [];
    const poolTiposIntermedios = ['fuente', 'cripta_columnas', 'armeria', 'biblioteca', 'prision', 'laboratorio', 'jardin_subterraneo'];
    const poolTiposLaterales = ['tesoro', 'armeria', 'biblioteca', 'prision', 'laboratorio', 'jardin_subterraneo'];

    const zEntrada = Math.round(radio - (tamanoMedio * 0.7));
    const zBoss = Math.round(-radio + (tamanoMedio * 0.7));
    const spanZ = zEntrada - zBoss;

    const cantIntermedias = Math.max(2, numeroSalas - 2);
    const pasoZ = spanZ / (cantIntermedias + 1);

    // 1. Vestíbulo de entrada
    const varEntrada = 1 + (rng.range(-1, 1) * varianzaTamano * 0.5);
    const entradaW = Math.round(Math.max(10, tamanoMedio * 0.85 * varEntrada));
    const entradaD = Math.round(Math.max(10, tamanoMedio * 0.95 * varEntrada));
    const roomEntrada = {
      id: 'room_entrada',
      tipo: 'entrada',
      nombre: 'Vestíbulo de Entrada',
      x: 0, y: 0, z: zEntrada,
      w: entradaW, d: entradaD, h: Math.round(alturaTechos * 0.95),
      abiertoNorte: true
    };
    salas.push(roomEntrada);

    let zAnterior = zEntrada;
    let dAnterior = entradaD;

    // 2. Cámaras intermedias a lo largo de la columna vertebral
    let tiposDisponibles = [...poolTiposIntermedios];
    let branchCounter = 0;

    for (let i = 1; i <= cantIntermedias; i++) {
      const zCamara = Math.round(zEntrada - i * pasoZ);

      // Conector / pasillo intermedio
      const gap = (zAnterior - dAnterior / 2) - (zCamara + (tamanoMedio / 2));
      const distCorredor = Math.max(8, gap);
      const zCorredor = Math.round((zAnterior - dAnterior / 2 + zCamara + tamanoMedio / 2) / 2);
      const varPasillo = 1 + (rng.range(-0.5, 0.5) * varianzaTamano * 0.3);
      const wPasillo = Math.round(anchoPasillos * varPasillo);

      salas.push({
        id: `corridor_${i}`,
        tipo: 'pasillo',
        nombre: `Galería del Sector ${i}`,
        x: 0, y: 0, z: zCorredor,
        w: wPasillo, d: distCorredor, h: Math.round(alturaTechos * 0.85),
        abiertoSur: true, abiertoNorte: true
      });

      // Dimensiones con varianza aleatoria
      const factorVarW = 1 + (rng.range(-1, 1) * varianzaTamano);
      const factorVarD = 1 + (rng.range(-1, 1) * varianzaTamano);
      const wCamara = Math.round(Math.max(10, tamanoMedio * factorVarW));
      const dCamara = Math.round(Math.max(10, tamanoMedio * factorVarD));
      const hCamara = Math.round(Math.max(4.2, alturaTechos * (1 + rng.range(-0.3, 0.3) * varianzaTamano)));

      if (tiposDisponibles.length === 0) tiposDisponibles = [...poolTiposIntermedios];
      const tipoIdx = rng.int(0, tiposDisponibles.length - 1);
      const tipoCamara = tiposDisponibles.splice(tipoIdx, 1)[0];
      const tipoDef = TIPOS_ESTANCIA[tipoCamara] || { nombre: 'Cripta Subterránea' };

      const camaraObj = {
        id: `room_${tipoCamara}_${i}`,
        tipo: tipoCamara,
        nombre: `${tipoDef.nombre} (${i})`,
        x: 0, y: 0, z: zCamara,
        w: wCamara, d: dCamara, h: hCamara,
        abiertoSur: true, abiertoNorte: true
      };

      // 3. Ramificaciones laterales (alas Este / Oeste)
      if (rng.chance(ramificacion)) {
        branchCounter++;
        const ladoEste = (branchCounter % 2 === 1);
        if (ladoEste) camaraObj.abiertoEste = true; else camaraObj.abiertoOeste = true;

        const tipoLateral = poolTiposLaterales[rng.int(0, poolTiposLaterales.length - 1)];
        const latDef = TIPOS_ESTANCIA[tipoLateral] || { nombre: 'Cámara Lateral' };
        const latW = Math.round(Math.max(9, tamanoMedio * 0.85 * (1 + rng.range(-1, 1) * varianzaTamano)));
        const latD = Math.round(Math.max(9, tamanoMedio * 0.85 * (1 + rng.range(-1, 1) * varianzaTamano)));
        const distSep = (wCamara / 2 + latW / 2 + 5.0);
        const latX = Math.round(ladoEste ? distSep : -distSep);

        salas.push({
          id: `room_lateral_${branchCounter}`,
          tipo: tipoLateral,
          nombre: `${latDef.nombre} Lateral`,
          x: latX, y: 0, z: zCamara,
          w: latW, d: latD, h: Math.round(hCamara * 0.9),
          abiertoEste: !ladoEste,
          abiertoOeste: ladoEste
        });
      }

      salas.push(camaraObj);
      zAnterior = zCamara;
      dAnterior = dCamara;
    }

    // 4. Último pasillo procesional hacia la sala del jefe
    const distCorredorFinal = Math.max(8, (zAnterior - dAnterior / 2) - (zBoss + tamanoMedio * 0.6));
    const zCorredorFinal = Math.round((zAnterior - dAnterior / 2 + zBoss + tamanoMedio * 0.6) / 2);
    salas.push({
      id: 'corridor_final',
      tipo: 'pasillo',
      nombre: 'Avenida Procesional del Caído',
      x: 0, y: 0, z: zCorredorFinal,
      w: Math.round(anchoPasillos * 1.15), d: distCorredorFinal, h: Math.round(alturaTechos * 0.9),
      abiertoSur: true, abiertoNorte: true
    });

    // 5. Salón del trono del Jefe
    const varBoss = 1 + (rng.range(-0.5, 0.5) * varianzaTamano * 0.4);
    const bossW = Math.round(Math.max(18, tamanoMedio * 1.45 * varBoss));
    const bossD = Math.round(Math.max(18, tamanoMedio * 1.45 * varBoss));
    const bossH = Math.round(alturaTechos * 1.35);

    const roomBoss = {
      id: 'room_boss',
      tipo: 'sala_jefe',
      nombre: 'Cámara del Trono del Caído',
      x: 0, y: 0, z: zBoss,
      w: bossW, d: bossD, h: bossH,
      abiertoSur: true
    };
    salas.push(roomBoss);

    // 6. Añadir cualquier estancia manual personalizada añadida por el usuario
    salasPersonalizadas.forEach((custom, cIdx) => {
      const defT = TIPOS_ESTANCIA[custom.tipo] || { nombre: 'Estancia Personalizada', icono: '🏛️' };
      salas.push({
        id: custom.id || `custom_room_${cIdx + 1}`,
        tipo: custom.tipo || 'cripta_columnas',
        nombre: custom.nombre || `${defT.nombre} ${cIdx + 1}`,
        x: typeof custom.x === 'number' ? custom.x : 0,
        y: typeof custom.y === 'number' ? custom.y : 0,
        z: typeof custom.z === 'number' ? custom.z : 0,
        w: typeof custom.w === 'number' ? custom.w : tamanoMedio,
        d: typeof custom.d === 'number' ? custom.d : tamanoMedio,
        h: typeof custom.h === 'number' ? custom.h : alturaTechos,
        abiertoSur: custom.abiertoSur !== false,
        abiertoNorte: custom.abiertoNorte !== false,
        abiertoEste: !!custom.abiertoEste,
        abiertoOeste: !!custom.abiertoOeste,
        esPersonalizada: true
      });
    });

    return salas;
  }

  // --- 9. GENERADOR PRINCIPAL PROCEDURAL ---

  function generarMazmorra(arg1, arg2) {
    let ThreeLib = null;
    let config = {};

    if (arg1 && (arg1.Mesh || arg1.Group || arg1.Vector3)) {
      ThreeLib = arg1;
      config = arg2 || {};
    } else if (arg1 && typeof arg1 === 'object') {
      config = arg1;
      ThreeLib = resolveThree(arg2);
    } else {
      ThreeLib = resolveThree(arg1);
      config = arg2 || {};
    }

    if (!ThreeLib) {
      ThreeLib = resolveThree();
    }
    if (!ThreeLib) {
      throw new Error('DungeonGenerator: Three.js no está disponible.');
    }

    const THREE_REF = ThreeLib;

    const rng = new PRNG(config.seed || 108);
    const estiloKey = config.estilo || rng.pick(Object.keys(ESTILOS_PIEDRA));
    const estilo = ESTILOS_PIEDRA[estiloKey] || ESTILOS_PIEDRA.cripta_gotica;
    const kit = crearKitMateriales(estilo, THREE_REF);

    const kitsPorEstilo = {};
    Object.keys(ESTILOS_PIEDRA).forEach(k => {
      kitsPorEstilo[k] = crearKitMateriales(ESTILOS_PIEDRA[k], THREE_REF);
    });

    const dungeonGroup = new THREE_REF.Group();
    dungeonGroup.name = 'DungeonProcedural_' + (config.id || 'seed_' + rng.s);

    const animables = [];
    const props = {
      antorchas: [],
      cofres: [],
      fuentes: [],
      animables
    };

    // 1. Obtener el plan de salas y pasillos (desde config si se editan individualmente, o dinámico)
    let salas = [];
    if (Array.isArray(config.salas) && config.salas.length > 0) {
      salas = config.salas;
    } else if (Array.isArray(config.salasPersonalizadas) && config.salasPersonalizadas.length > 0) {
      salas = config.salasPersonalizadas;
    } else {
      salas = generarPlanEstancias(config, rng);
    }

    // Calcular aperturas herméticas exactas entre salas y pasillos contiguos (evita huecos al vacío)
    calcularAperturasEntreSalas(salas, config);

    // 2. Construir geometría estructural y decorar cada sala (respetando textura/estilo y color individual de paredes, suelos, techos y fuentes)
    const configCompleta = Object.assign({}, config, { kitsPorEstilo });

    salas.forEach(s => {
      const estiloKeySala = s.estilo || estiloKey;
      const estiloSala = ESTILOS_PIEDRA[estiloKeySala] || estilo;
      const kitSala = kitsPorEstilo[estiloKeySala] || kit;

      const meshSala = construirCajaHabitacion(THREE_REF, kitSala, s, configCompleta);
      dungeonGroup.add(meshSala);

      const decMesh = decorarHabitacion(THREE_REF, kitSala, s, estiloSala, rng, animables, props, configCompleta);
      dungeonGroup.add(decMesh);
    });

    // 3. Luz ambiental cenital (calibrada según el modo de iluminación elegido)
    const intAmbiente = (config.modoLuz === 'antorchas') ? 0.35 : (config.modoLuz === 'foco_personalizado' ? 0.45 : 1.3);
    const luzAmbiente = new THREE_REF.AmbientLight(0xffffff, intAmbiente);
    luzAmbiente.name = 'dungeon_ambient_light';
    dungeonGroup.add(luzAmbiente);

    // 4. Calcular Puntos de Aparición (Spawns)
    const roomEntrada = salas.find(s => s.tipo === 'entrada') || salas[0];
    const radioVal = typeof config.radio === 'number' ? config.radio : 60;
    const esDefault = (radioVal === 60 && (!config.numeroSalas || config.numeroSalas === 6) && (!config.customLayout) && (!config.salasPersonalizadas || config.salasPersonalizadas.length === 0));

    const heroZ = esDefault ? 46.0 : (roomEntrada.z + roomEntrada.d / 2 - 1.2);
    const spawns = {
      hero: { x: roomEntrada.x, y: 0.0, z: heroZ, rotY: Math.PI },
      acompanante: { x: roomEntrada.x - 1.2, y: 0.0, z: heroZ + 2.0, rotY: Math.PI },
      elites: [],
      boss: null
    };

    const roomBoss = salas.find(s => s.tipo === 'sala_jefe') || salas[salas.length - 1];
    const bossZ = esDefault ? -58.0 : (roomBoss.z - roomBoss.d * 0.15);
    spawns.boss = {
      x: roomBoss.x,
      y: 0.6,
      z: bossZ,
      name: config.boss && config.boss.name ? config.boss.name : 'Señor del Trono Caído',
      rangoElite: config.boss && config.boss.rangoElite ? config.boss.rangoElite : 10
    };

    if (esDefault) {
      spawns.elites = [
        { x: -1.4, z: 27.0, multiplicador: 4, name: 'Centinela de la Cripta' },
        { x: 1.4, z: 27.0, multiplicador: 4, name: 'Centinela de la Cripta' },
        { x: -1.8, z: -5.0, multiplicador: 4, name: 'Guardián del Santuario' },
        { x: 1.8, z: -5.0, multiplicador: 4, name: 'Guardián del Santuario' },
        { x: -2.8, z: -23.0, multiplicador: 8, name: 'Campeón Esqueleto Élite' },
        { x: 2.8, z: -23.0, multiplicador: 8, name: 'Campeón Esqueleto Élite' }
      ];
    } else {
      const salasIntermedias = salas.filter(s => s.tipo !== 'entrada' && s.tipo !== 'sala_jefe');
      salasIntermedias.forEach((s, idx) => {
        const mult = (idx % 2 === 0) ? 4 : 8;
        const offX = Math.min(s.w * 0.22, 2.4);
        spawns.elites.push({
          x: Math.round(s.x - offX),
          z: Math.round(s.z),
          multiplicador: mult,
          name: `Guardián de ${s.nombre}`
        });
        spawns.elites.push({
          x: Math.round(s.x + offX),
          z: Math.round(s.z),
          multiplicador: mult,
          name: `Guardián de ${s.nombre}`
        });
      });
    }

    const areaTotal = Math.round(salas.reduce((acc, s) => acc + (s.w * s.d), 0));

    return {
      group: dungeonGroup,
      salas,
      estilo,
      kit,
      props,
      spawns,
      areaTotal,
      update: (dt, nowSec) => {
        const t = nowSec || (performance.now() / 1000);
        for (let i = 0; i < animables.length; i++) {
          const item = animables[i];
          if (item.userData && item.userData.flicker) {
            item.userData.flicker(t);
          } else if (item.userData && item.userData.update) {
            item.userData.update(t);
          } else if (typeof item.flicker === 'function') {
            item.flicker(t);
          }
        }
      }
    };
  }

  // --- 3.1 GENERADOR DE THUMBNAILS VISUALES PROCEDURALES (PREVIEWS) ---
  const _thumbCache = new Map();

  function generarDataURLThumbnail(estiloId, tipo = 'pared', tam = 80) {
    const key = `${estiloId || 'def'}_${tipo || 'pared'}_${tam}`;
    if (_thumbCache.has(key)) return _thumbCache.get(key);

    if (typeof document === 'undefined') {
      return '';
    }

    const estilo = ESTILOS_PIEDRA[estiloId] || ESTILOS_PIEDRA.cripta_gotica;
    const canvas = document.createElement('canvas');
    canvas.width = tam;
    canvas.height = tam;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    if (tipo === 'suelo') {
      ctx.fillStyle = estilo.colorMortero || '#0f172a';
      ctx.fillRect(0, 0, tam, tam);

      const losas = 3;
      const lTam = tam / losas;
      const pad = Math.max(1, Math.round(tam * 0.04));

      for (let r = 0; r < losas; r++) {
        for (let c = 0; c < losas; c++) {
          const x = c * lTam;
          const y = r * lTam;
          const grad = ctx.createLinearGradient(x, y, x + lTam, y + lTam);
          grad.addColorStop(0, estilo.colorLosa || estilo.colorBase);
          grad.addColorStop(0.7, estilo.colorBase);
          grad.addColorStop(1, estilo.colorSecundario);
          ctx.fillStyle = grad;
          ctx.fillRect(x + pad, y + pad, lTam - pad * 2, lTam - pad * 2);

          ctx.strokeStyle = 'rgba(255,255,255,0.12)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + pad + 0.5, y + pad + 0.5, lTam - pad * 2 - 1, lTam - pad * 2 - 1);
        }
      }
    } else if (tipo === 'fuente') {
      ctx.fillStyle = estilo.colorBase || '#1e293b';
      ctx.fillRect(0, 0, tam, tam);

      const cx = tam / 2;
      const cy = tam / 2;
      const radExt = tam * 0.44;
      const radInt = tam * 0.32;

      ctx.beginPath();
      ctx.arc(cx, cy, radExt, 0, Math.PI * 2);
      ctx.fillStyle = estilo.colorSecundario || '#334155';
      ctx.fill();
      ctx.strokeStyle = estilo.colorMortero || '#090d16';
      ctx.lineWidth = 2;
      ctx.stroke();

      const colAguaHex = (typeof estilo.colorAgua === 'number')
        ? '#' + estilo.colorAgua.toString(16).padStart(6, '0')
        : (estilo.colorAgua || '#38bdf8');
      const gradAgua = ctx.createRadialGradient(cx, cy, 2, cx, cy, radInt);
      gradAgua.addColorStop(0, '#ffffff');
      gradAgua.addColorStop(0.35, colAguaHex);
      gradAgua.addColorStop(1, '#0369a1');
      ctx.beginPath();
      ctx.arc(cx, cy, radInt, 0, Math.PI * 2);
      ctx.fillStyle = gradAgua;
      ctx.fill();
    } else if (tipo === 'techo') {
      ctx.fillStyle = estilo.colorSecundario || '#0f172a';
      ctx.fillRect(0, 0, tam, tam);

      const gradT = ctx.createRadialGradient(tam / 2, tam / 2, 4, tam / 2, tam / 2, tam * 0.7);
      gradT.addColorStop(0, estilo.colorBase);
      gradT.addColorStop(1, '#050508');
      ctx.fillStyle = gradT;
      ctx.fillRect(0, 0, tam, tam);

      ctx.strokeStyle = estilo.colorMortero || '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(tam, tam);
      ctx.moveTo(tam, 0); ctx.lineTo(0, tam);
      ctx.stroke();
    } else if (tipo === 'zocalo') {
      ctx.fillStyle = estilo.colorMortero || '#090d16';
      ctx.fillRect(0, 0, tam, tam);

      // Moldura superior
      const gradM = ctx.createLinearGradient(0, 0, 0, tam * 0.3);
      gradM.addColorStop(0, estilo.colorSecundario);
      gradM.addColorStop(0.5, estilo.colorBase);
      gradM.addColorStop(1, estilo.colorMortero);
      ctx.fillStyle = gradM;
      ctx.fillRect(0, 0, tam, tam * 0.3);

      // Sillares ciclópeos
      const bAncho = tam / 2;
      for (let b = 0; b < 2; b++) {
        const bx = b * bAncho;
        const pad = Math.max(1, Math.round(tam * 0.03));
        const gradB = ctx.createLinearGradient(bx, tam * 0.32, bx + bAncho, tam);
        gradB.addColorStop(0, estilo.colorBase);
        gradB.addColorStop(0.8, estilo.colorSecundario);
        ctx.fillStyle = gradB;
        ctx.fillRect(bx + pad, tam * 0.32 + pad, bAncho - pad * 2, tam * 0.68 - pad * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + pad + 0.5, tam * 0.32 + pad + 0.5, bAncho - pad * 2 - 1, tam * 0.68 - pad * 2 - 1);
      }
    } else {
      ctx.fillStyle = estilo.colorMortero || '#090d16';
      ctx.fillRect(0, 0, tam, tam);

      const filas = 4;
      const altoFila = tam / filas;
      const pad = Math.max(1, Math.round(tam * 0.035));

      for (let f = 0; f < filas; f++) {
        const y = f * altoFila;
        const cols = (f % 2 === 0) ? 2 : 3;
        const anchoCol = tam / cols;
        const shift = (f % 2 === 0) ? 0 : -(anchoCol * 0.5);

        for (let c = -1; c <= cols + 1; c++) {
          const x = c * anchoCol + shift;
          if (x + anchoCol < 0 || x > tam) continue;

          const gradS = ctx.createLinearGradient(x, y, x + anchoCol, y + altoFila);
          gradS.addColorStop(0, estilo.colorBase);
          gradS.addColorStop(0.5, estilo.colorSecundario);
          gradS.addColorStop(1, estilo.colorBase);
          ctx.fillStyle = gradS;

          const rx = Math.max(0, x + pad);
          const ry = Math.max(0, y + pad);
          const rw = Math.min(tam - rx, anchoCol - pad * 2);
          const rh = Math.min(tam - ry, altoFila - pad * 2);

          if (rw > 0 && rh > 0) {
            ctx.fillRect(rx, ry, rw, rh);
            ctx.strokeStyle = 'rgba(255,255,255,0.14)';
            ctx.lineWidth = 1;
            ctx.strokeRect(rx + 0.5, ry + 0.5, rw - 1, rh - 1);
          }
        }
      }

      if (estilo.densidadMusgo && estilo.densidadMusgo > 0.2) {
        ctx.fillStyle = estilo.colorMusgo || 'rgba(34,197,94,0.4)';
        ctx.beginPath();
        ctx.arc(tam * 0.8, tam * 0.85, tam * 0.14, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const dataUrl = canvas.toDataURL();
    _thumbCache.set(key, dataUrl);
    return dataUrl;
  }

  return {
    TIPOS_ESTANCIA,
    ESTILOS_PIEDRA,
    DEFAULT_LOOT_CONFIG,
    CATALOGO_PROPS_DECORATIVOS,
    PRNG,
    simularAperturaCofre,
    resolverMaterialesSala,
    crearAtlasMazmorra,
    crearTexturaPared,
    crearTexturaSuelo,
    crearTexturaZocalo,
    crearTexturaTecho,
    crearTexturaMadera,
    crearTexturaHierro,
    generarDataURLThumbnail,
    crearKitMateriales,
    crearAntorcha,
    crearFuente,
    crearCofre,
    crearJarron,
    crearSarcofago,
    crearColumna,
    crearManchaVegetacion,
    crearHongosLuminosos,
    crearArmeriaProps,
    crearBibliotecaProps,
    crearPrisionProps,
    crearLaboratorioProps,
    crearObjetoDecorativo,
    calcularAperturasEntreSalas,
    construirCajaHabitacion,
    decorarHabitacion,
    generarPlanEstancias,
    generarMazmorra
  };
}));
