#!/usr/bin/env node
/*
 * tools/construir-mundo-oficial.mjs
 *
 * Construye y valida el mundo oficial diseñado para la campaña:
 *   "Valdris · Tierras del Sol Quebrado"
 *
 * Salidas:
 *   - mundos/valdris.mundo.json  (.mundo.json importable en el Creador y el Visor)
 *   - js/mundo-campana.js        (módulo UMD/navegador compatible con file:// y Node)
 */
'use strict';

import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

global.ENEMY_GLB_INDEX = {};
require('../js/enemigos-glb-indice.js');
const ENEMY_GLB = global.ENEMY_GLB_INDEX;

const W = require('../js/world-core.js');
global.WorldCore = W;
const Mazmorras = require('../js/mazmorras.js');
const Relieve = require('../js/relieve-zona.js');
const Secretos = require('../js/lugares-secretos.js');
global.LugaresSecretosLib = Secretos;
const Historia = require('../js/historia.js');

const SEED = 271828;
const T = W.getTerrain(SEED);

function build() {
  const world = W.emptyWorld('Valdris · Tierras del Sol Quebrado', SEED, {
    townCount: 7,
    spacing: 1400,
    extraLinks: 0.35,
    zonesPerRoad: 2,
    poiChance: 0.6,
    metersPerLevel: 180,
    enemyMode: 'niveles',
    enemyScale: 1
  });

  world.id = 'valdris-sol-quebrado-v1';
  world.campaignId = 'valdris-sol-quebrado-v1';
  world.campaignVersion = 4;
  world.secretPlacesFijos = true;
  world.bloqueadoJuego = true;
  world.version = 1;
  world.nextId = 100;

  // -------------------------------------------------------------------------
  // 1. Pueblos (7 regiones y biomas reales verificados sobre la semilla 271828)
  // -------------------------------------------------------------------------
  const townSpecs = [
    {
      id: 't_1', name: 'Albaferro', x: 1850, y: 950, level: 1, isStart: true,
      services: ['posada', 'tienda', 'herrero', 'gremio', 'almacén', 'teletransporte'],
      cfg: {
        style: 'european', terrainType: 'valley', relief: 30, seed: 1011, size: 4,
        houseDensity: 90, specialCount: 4, maxFloors: 3, roadWidth: 7.5, curve: 3.5,
        treeDensity: 48, hasWalls: true, hasRiver: true, hasMagic: false,
        hasProps: true, hasLamps: true, hasFences: true, hasGardens: true,
        trazado: 'manzanas', casas: 'variada', casaVar: 'alta', streetTexture: 't02',
        bridgeStyle: 0, rotation: 12, time: 'day'
      },
      notes: 'Ciudad forjadora del valle oriental donde resiste el último yunque libre de Brann bajo vigilancia del Consejo del Eclipse.'
    },
    {
      id: 't_2', name: 'Puerto Brisal', x: 300, y: 600, level: 3, isStart: false,
      services: ['posada', 'tienda', 'herrero', 'almacén'],
      cfg: {
        style: 'trade', terrainType: 'plains', relief: 18, seed: 2022, size: 4,
        houseDensity: 92, specialCount: 4, maxFloors: 3, roadWidth: 8.0, curve: 2.2,
        treeDensity: 35, hasWalls: true, hasRiver: true, hasMagic: false,
        hasProps: true, hasLamps: true, hasFences: false, hasGardens: true,
        trazado: 'manzanas', casas: 'casa_entramado', casaVar: 'alineada', streetTexture: 't09',
        bridgeStyle: 2, rotation: 38, time: 'day'
      },
      notes: 'Puerto mercante frente a la bahía interior de Valdris, asfixiado por aranceles eclesiales y saqueadores de marea.'
    },
    {
      id: 't_3', name: 'Robledal Sombrío', x: 1150, y: 1850, level: 5, isStart: false,
      services: ['posada', 'tienda', 'herrero'],
      cfg: {
        style: 'frontier', terrainType: 'hills', relief: 46, seed: 3033, size: 3,
        houseDensity: 84, specialCount: 2, maxFloors: 2, roadWidth: 6.0, curve: 7.5,
        treeDensity: 95, hasWalls: false, hasRiver: true, hasMagic: false,
        hasProps: true, hasLamps: true, hasFences: true, hasGardens: true,
        trazado: 'radial', casas: 'cabana', casaVar: 'libre', streetTexture: 't05',
        bridgeStyle: 1, rotation: 74, time: 'day'
      },
      notes: 'Aldea maderera en el bosque sur. La savia de los robles antiguos sangra gris desde que excavaron la Cripta de las Raíces Negras.'
    },
    {
      id: 't_4', name: 'Limoquieto', x: -500, y: 1750, level: 8, isStart: false,
      services: ['posada', 'tienda', 'herrero', 'almacén'],
      cfg: {
        style: 'elven', terrainType: 'valley', relief: 22, seed: 4044, size: 3,
        houseDensity: 78, specialCount: 2, maxFloors: 2, roadWidth: 5.5, curve: 6.2,
        treeDensity: 68, hasWalls: false, hasRiver: true, hasMagic: true,
        hasProps: true, hasLamps: true, hasFences: false, hasGardens: true,
        trazado: 'radial', casas: 'madera', casaVar: 'libre', streetTexture: 't03',
        bridgeStyle: 1, rotation: -28, time: 'sunset'
      },
      notes: 'Enclave palustre entre ciénagas donde desertores y boticarios ocultaron los registros alquímicos de la Orden del Eclipse.'
    },
    {
      id: 't_5', name: 'Ámbar de Dunas', x: 2250, y: -450, level: 11, isStart: false,
      services: ['posada', 'tienda', 'herrero', 'gremio', 'almacén', 'subastas'],
      cfg: {
        style: 'l2_fantasy', terrainType: 'plains', relief: 28, seed: 5055, size: 5,
        houseDensity: 94, specialCount: 4, maxFloors: 3, roadWidth: 8.5, curve: 3.0,
        treeDensity: 24, hasWalls: true, hasRiver: false, hasMagic: true,
        hasProps: true, hasLamps: true, hasFences: false, hasGardens: false,
        trazado: 'manzanas', casas: 'original', casaVar: 'alta', streetTexture: 't04',
        bridgeStyle: 0, rotation: 52, time: 'day'
      },
      notes: 'Ciudad caravana del desierto dorado. Aquí se alza el Altar Rúnico que rompe el monopolio comercial del Cónclave a partir de nivel 12.'
    },
    {
      id: 't_6', name: 'Atalaya de Escarcha', x: -2000, y: 400, level: 14, isStart: false,
      services: ['posada', 'tienda', 'herrero', 'gremio', 'almacén'],
      cfg: {
        style: 'fortified', terrainType: 'highlands', relief: 54, seed: 6066, size: 3,
        houseDensity: 86, specialCount: 3, maxFloors: 2, roadWidth: 6.5, curve: 4.5,
        treeDensity: 55, hasWalls: true, hasRiver: false, hasMagic: true,
        hasProps: true, hasLamps: true, hasFences: true, hasGardens: false,
        trazado: 'radial', casas: 'mixta', casaVar: 'alta', streetTexture: 't08',
        bridgeStyle: 2, rotation: 105, time: 'day'
      },
      notes: 'Bastión boreal de la guardia rebelde entre taigas heladas; contiene las columnas mecanizadas que descienden desde el norte.'
    },
    {
      id: 't_7', name: 'Trono de Ceniza', x: 800, y: -1500, level: 18, isStart: false,
      services: ['posada', 'tienda', 'herrero', 'gremio', 'almacén', 'teletransporte'],
      cfg: {
        style: 'dwarven', terrainType: 'highlands', relief: 65, seed: 7077, size: 4,
        houseDensity: 90, specialCount: 4, maxFloors: 3, roadWidth: 7.5, curve: 2.0,
        treeDensity: 20, hasWalls: true, hasRiver: false, hasMagic: true,
        hasProps: true, hasLamps: true, hasFences: false, hasGardens: false,
        trazado: 'manzanas', casas: 'original', casaVar: 'alineada', streetTexture: 't06',
        bridgeStyle: 0, rotation: -15, time: 'night'
      },
      notes: 'Ciudadela ciclópea de alta montaña al pie del Cráter del Sol Quebrado; último bastión de la Orden del Eclipse.'
    }
  ];

  world.towns = townSpecs.map(spec => {
    const biome = T.biomeAt(spec.x, spec.y);
    assert.ok(!T.isWater(spec.x, spec.y), `El pueblo ${spec.name} no puede estar bajo el agua`);
    return Object.assign({}, spec, {
      biome,
      radius: W.townRadius(spec.cfg.size)
    });
  });
  world.startTownId = 't_1';

  // -------------------------------------------------------------------------
  // 2. Caminos (8 rutas limpias, 0 tramos bajo el agua)
  // -------------------------------------------------------------------------
  const roadSpecs = [
    { id: 'r_1', from: 't_1', to: 't_2', kind: 'calzada', bend: 0.08 },
    { id: 'r_2', from: 't_1', to: 't_3', kind: 'camino',  bend: -0.06 },
    { id: 'r_3', from: 't_2', to: 't_4', kind: 'camino',  bend: 0.05 },
    { id: 'r_4', from: 't_3', to: 't_4', kind: 'sendero', bend: 0.06 },
    { id: 'r_5', from: 't_1', to: 't_5', kind: 'calzada', bend: 0.22 },
    { id: 'r_6', from: 't_4', to: 't_6', kind: 'camino',  bend: -0.14 },
    { id: 'r_7', from: 't_5', to: 't_7', kind: 'calzada', bend: 0.06 },
    { id: 'r_8', from: 't_6', to: 't_7', kind: 'camino',  bend: 0.10 }
  ];

  roadSpecs.forEach(rs => {
    const r = W.createRoad(world, rs.from, rs.to, { kind: rs.kind, bend: rs.bend });
    r.id = rs.id;
    const waterPts = r.points.filter(p => T.isWater(p.x, p.y)).length;
    assert.strictEqual(waterPts, 0, `Camino ${rs.id} (${rs.from}->${rs.to}) tiene ${waterPts} puntos en el agua`);
  });

  // -------------------------------------------------------------------------
  // 3. Zonas de caza, élite, laberintos y jefe (12 zonas con enemigos GLB reales)
  // -------------------------------------------------------------------------
  function validarEnemigos(lista) {
    return lista.map(m => {
      assert.ok(ENEMY_GLB[m.enemigo], `Falta modelo GLB para enemigo "${m.enemigo}" (${m.name})`);
      return m;
    });
  }

  const zoneSpecs = [
    {
      id: 'z_1', name: 'Prados del Yunque Roto', roadId: 'r_1', roadT: 0.28, radius: 185, type: 'caza',
      levelMin: 1, levelMax: 3, respawnSec: 18,
      relieve: { activo: false },
      notes: 'Campiña saqueada a las puertas de Albaferro donde merodean bestias alteradas tras la emboscada a Brann.',
      monsters: validarEnemigos([
        { name: 'Keltir Enfurecido', level: 1, density: 'alta', boss: false, enemigo: 'furious_keltir' },
        { name: 'Lobo Gris Rabioso', level: 2, density: 'media', boss: false, enemigo: 'rabid_grey_wolf' },
        { name: 'Jabalí Navajero', level: 2, density: 'media', boss: false, enemigo: 'rabid_razorback_boar' },
        { name: 'Salteador de Caminos', level: 3, density: 'baja', boss: false, enemigo: 'outlaw_bandit_cutthroat' },
        { name: 'Colmillo de Hierro', level: 3, density: 'baja', boss: false, campeonZona: true, rangoEliteFijo: 4, enemigo: 'dire_wolf' }
      ])
    },
    {
      id: 'z_2', name: 'Acantilados de la Marea Roja', roadId: 'r_1', roadT: 0.72, radius: 190, type: 'caza',
      levelMin: 2, levelMax: 5, respawnSec: 20,
      relieve: { activo: false },
      notes: 'Ladera costera sobre la bahía de Puerto Brisal infestada de carroñeros, goblins y vigías corruptos.',
      monsters: validarEnemigos([
        { name: 'Halcón Garra de Sangre', level: 2, density: 'media', boss: false, enemigo: 'bloodclaw_raptor_hawk' },
        { name: 'Escarabajo de Fango', level: 3, density: 'alta', boss: false, enemigo: 'mud_shell_crab_beetle' },
        { name: 'Arquero Goblin del Bosque', level: 4, density: 'media', boss: false, enemigo: 'archer_species_2_forest_goblin_bowman' },
        { name: 'Cortacuellos Renegado', level: 5, density: 'baja', boss: false, enemigo: 'outlaw_bandit_cutthroat' },
        { name: 'Garra Roja de la Bahía', level: 5, density: 'baja', boss: false, campeonZona: true, rangoEliteFijo: 4, enemigo: 'elite_goblin_wolf_rider_boss' }
      ])
    },
    {
      id: 'z_3', name: 'Claro de la Savia Oscura', roadId: 'r_2', roadT: 0.50, radius: 195, type: 'caza',
      levelMin: 4, levelMax: 7, respawnSec: 22,
      relieve: { activo: false },
      notes: 'Arboleda entre Albaferro y Robledal Sombrío cuya fauna bebe de manantiales manchados por aceite gris.',
      monsters: validarEnemigos([
        { name: 'Araña Cazadora del Bosque', level: 4, density: 'alta', boss: false, enemigo: 'forest_hunter_spider' },
        { name: 'Spriggan de Zarza', level: 5, density: 'media', boss: false, enemigo: 'briar_wood_spriggan' },
        { name: 'Vigía Silvano del Robledal', level: 5, density: 'media', boss: false, enemigo: 'archer_species_1_wood_elf_ranger' },
        { name: 'Ciervo Astado Furioso', level: 6, density: 'media', boss: false, enemigo: 'furious_antler_stag' },
        { name: 'Oso Pardo Salvaje', level: 7, density: 'baja', boss: false, enemigo: 'furious_grizzly_bear' },
        { name: 'Raíz Corrupta del Robledal', level: 7, density: 'baja', boss: false, campeonZona: true, rangoEliteFijo: 4, enemigo: 'treant_ancient' }
      ])
    },
    {
      id: 'z_4', name: 'Laberinto del Seto Maldito', roadId: 'r_4', roadT: 0.48, radius: 165, type: 'elite',
      levelMin: 6, levelMax: 9, respawnSec: 26,
      relieve: {
        activo: true,
        estilo: 'laberinto_setos',
        culminacion: 'objeto_mision',
        complejidad: 'medio',
        radio: 135,
        tamGrid: 11,
        alturaMuro: 13,
        profundidadHendidura: 3.5,
        anchoPasillo: 10,
        seed: 44109,
        patronesMonstruos: {
          p1: { id: 'p1', color: '#22c55e', name: 'Araña de Catacumba', clase: 'rapido', levelMin: 6, levelMax: 8, count: 2, icono: '🕷️' },
          p2: { id: 'p2', color: '#a855f7', name: 'Caballero Oscuro', clase: 'elite', levelMin: 8, levelMax: 9, count: 1, icono: '⚔️' }
        },
        celdasMonstruos: {}
      },
      notes: 'Muralla viva de setos oscuros entre Robledal Sombrío y Limoquieto donde el Cónclave oculta remesas de placas blindadas.',
      monsters: validarEnemigos([
        { name: 'Araña de Catacumba', level: 6, density: 'media', boss: false, enemigo: 'catacomb_necro_arachnid' },
        { name: 'Acechador de Quitina', level: 7, density: 'media', boss: false, enemigo: 'chitin_stalker' },
        { name: 'Sátiro Trampero del Seto', level: 7, density: 'media', boss: false, enemigo: 'archer_species_6_satyr_felbow_trickster' },
        { name: 'Lobo Huargo Alfa', level: 8, density: 'baja', boss: false, enemigo: 'dire_wolf' },
        { name: 'Caballero Oscuro de Patrulla', level: 9, density: 'baja', boss: false, enemigo: 'caballero_oscuro' },
        { name: 'Señor del Seto Maldito', level: 9, density: 'baja', boss: false, campeonZona: true, rangoEliteFijo: 4, enemigo: 'brood_spider_queen' }
      ])
    },
    {
      id: 'z_5', name: 'Marismas del Silencio', roadId: 'r_3', roadT: 0.64, radius: 205, type: 'caza',
      levelMin: 7, levelMax: 10, respawnSec: 22,
      relieve: { activo: false },
      notes: 'Ciénagas brumosas rumbo a Limoquieto; el cónclave vierte aquí los residuos tóxicos de sus fraguas.',
      monsters: validarEnemigos([
        { name: 'Sapo Venenoso del Cieno', level: 7, density: 'alta', boss: false, enemigo: 'venom_marsh_toad' },
        { name: 'Sanguijuela Gigante', level: 8, density: 'media', boss: false, enemigo: 'marsh_leech_worm' },
        { name: 'Francotirador Escama de Pantano', level: 9, density: 'media', boss: false, enemigo: 'archer_species_8_lizardfolk_scale_sniper' },
        { name: 'Troll Regenerador del Cieno', level: 10, density: 'baja', boss: false, enemigo: 'elite_bog_troll_regenerator' },
        { name: 'Hidra del Cieno Gris', level: 10, density: 'baja', boss: false, campeonZona: true, rangoEliteFijo: 4, enemigo: 'elite_frilled_venom_basilisk' }
      ])
    },
    {
      id: 'z_6', name: 'Desfiladero del Óxido', roadId: 'r_5', roadT: 0.30, radius: 190, type: 'elite',
      levelMin: 9, levelMax: 12, respawnSec: 25,
      relieve: { activo: false },
      notes: 'Corredor rocoso del puente oriental donde escoltas armados custodian vetas de hierro salvaje hacia Ámbar de Dunas.',
      monsters: validarEnemigos([
        { name: 'Cazador Gnoll de la Estepa', level: 9, density: 'media', boss: false, enemigo: 'archer_species_4_gnoll_poacher_archer' },
        { name: 'Escorpión de Hueso Ensamblado', level: 10, density: 'media', boss: false, enemigo: 'elite_bone_scorpion_construct' },
        { name: 'Jabalí Blindado de Hierro', level: 11, density: 'baja', boss: false, enemigo: 'iron_boar_juggernaut' },
        { name: 'Quimera Mantícora', level: 12, density: 'baja', boss: false, enemigo: 'manticore_chimera' },
        { name: 'Acorazado de la Fragua Roja', level: 12, density: 'baja', boss: false, campeonZona: true, rangoEliteFijo: 4, enemigo: 'df_14_iron_spined_boar_beast' }
      ])
    },
    {
      id: 'z_7', name: 'Cañón del Pacto de Arena', roadId: 'r_5', roadT: 0.60, radius: 165, type: 'caza',
      levelMin: 11, levelMax: 14, respawnSec: 24,
      relieve: {
        activo: true,
        estilo: 'arenisca_desierto',
        culminacion: 'santuario',
        complejidad: 'medio',
        radio: 125,
        tamGrid: 11,
        alturaMuro: 15,
        profundidadHendidura: 3.5,
        anchoPasillo: 10,
        seed: 77213,
        patronesMonstruos: {
          p1: { id: 'p1', color: '#eab308', name: 'Escorpión de Dunas', clase: 'rapido', levelMin: 11, levelMax: 13, count: 2, icono: '🦂' },
          p2: { id: 'p2', color: '#3b82f6', name: 'Djinn Astral', clase: 'mago', levelMin: 13, levelMax: 14, count: 1, icono: '🔮' }
        },
        celdasMonstruos: {}
      },
      notes: 'Cañón de arenisca antes de Ámbar de Dunas. En su cámara central reposa el sello antiguo de la Explosión Nova.',
      monsters: validarEnemigos([
        { name: 'Escorpión Amarillo de Dunas', level: 11, density: 'alta', boss: false, enemigo: 'dune_yellow_scorpion' },
        { name: 'Centinela Chacal de Anubis', level: 12, density: 'media', boss: false, enemigo: 'anubis_jackal_guard' },
        { name: 'Arquero Estelar Djinn', level: 13, density: 'media', boss: false, enemigo: 'archer_species_15_astral_djinn_starbow' },
        { name: 'Djinn del Vacío', level: 14, density: 'baja', boss: false, enemigo: 'void_djinn' },
        { name: 'Visir del Espejismo Solar', level: 14, density: 'baja', boss: false, campeonZona: true, rangoEliteFijo: 4, enemigo: 'crowned_catacomb_pharaoh' }
      ])
    },
    {
      id: 'z_8', name: 'Costa de las Brumas Boreales', roadId: 'r_6', roadT: 0.50, radius: 215, type: 'caza',
      levelMin: 12, levelMax: 15, respawnSec: 24,
      relieve: { activo: false },
      notes: 'Franja occidental de taiga donde patrullas inquisitoriales intentan aislar a Atalaya de Escarcha.',
      monsters: validarEnemigos([
        { name: 'Pantera Sombría Feral', level: 12, density: 'alta', boss: false, enemigo: 'feral_shadow_panther' },
        { name: 'Explorador Huargo de Sangre', level: 13, density: 'media', boss: false, enemigo: 'archer_species_10_worgen_bloodhound_ranger' },
        { name: 'Oso de Guerra Rúnico', level: 14, density: 'media', boss: false, enemigo: 'runic_warbear' },
        { name: 'Acechador Wendigo Glacial', level: 15, density: 'baja', boss: false, enemigo: 'df_05_frostbite_wendigo_stalker' },
        { name: 'Alfa Wendigo de la Bruma', level: 15, density: 'baja', boss: false, campeonZona: true, rangoEliteFijo: 4, enemigo: 'permafrost_warg_alpha' }
      ])
    },
    {
      id: 'z_9', name: 'Estribaciones del Ventisquero', roadId: 'r_8', roadT: 0.25, radius: 210, type: 'elite',
      levelMin: 14, levelMax: 17, respawnSec: 26,
      relieve: { activo: false },
      notes: 'Altiplano gélido al noreste de Atalaya de Escarcha donde bestias elementales escoltan convoyes hacia el cráter.',
      monsters: validarEnemigos([
        { name: 'Centauro de Aurora Helada', level: 14, density: 'media', boss: false, enemigo: 'aurora_ice_centaur' },
        { name: 'Grifo de Ventisca Boreal', level: 15, density: 'media', boss: false, enemigo: 'boreal_blizzard_griffin' },
        { name: 'Escorpión de Cristal Glacial', level: 16, density: 'baja', boss: false, enemigo: 'frost_crystal_scorpion' },
        { name: 'Gólem Témpano Ártico', level: 17, density: 'baja', boss: false, enemigo: 'arctic_iceberg_golem' },
        { name: 'Coloso del Ventisquero', level: 17, density: 'baja', boss: false, campeonZona: true, rangoEliteFijo: 4, enemigo: 'polar_glacier_bear' }
      ])
    },
    {
      id: 'z_10', name: 'Garganta de Obsidiana', roadId: 'r_7', roadT: 0.46, radius: 175, type: 'elite',
      levelMin: 15, levelMax: 18, respawnSec: 28,
      relieve: {
        activo: true,
        estilo: 'obsidiana_volcanica',
        culminacion: 'tesoro',
        complejidad: 'dificil',
        radio: 145,
        tamGrid: 13,
        alturaMuro: 16,
        profundidadHendidura: 4,
        anchoPasillo: 10,
        seed: 90451,
        patronesMonstruos: {
          p1: { id: 'p1', color: '#f97316', name: 'Sabueso Cerbero', clase: 'guerrero', levelMin: 15, levelMax: 17, count: 1, icono: '🔥' },
          p2: { id: 'p2', color: '#a855f7', name: 'Coloso de Obsidiana', clase: 'elite', levelMin: 17, levelMax: 18, count: 1, icono: '🗿' }
        },
        celdasMonstruos: {}
      },
      notes: 'Paso volcánico de obsidiana negra cuyos pilares de resonancia blindan la cúpula de Trono de Ceniza.',
      monsters: validarEnemigos([
        { name: 'Gólem de Obsidiana', level: 15, density: 'media', boss: false, enemigo: 'obsidian_golem' },
        { name: 'Sabueso Infernal Cerbero', level: 16, density: 'media', boss: false, enemigo: 'cerberus_hellhound' },
        { name: 'Coloso Gárgola de Ceniza', level: 17, density: 'baja', boss: false, enemigo: 'df_03_ashen_gargoyle_colossus' },
        { name: 'Behemoth de Obsidiana', level: 18, density: 'baja', boss: false, enemigo: 'df_07_obsidian_behemoth_juggernaut' },
        { name: 'Señor de los Pilares Negros', level: 18, density: 'baja', boss: false, campeonZona: true, rangoEliteFijo: 4, enemigo: 'df_06_bloodhound_cerberus_prime' }
      ])
    },
    {
      id: 'z_11', name: 'Paso del Dragón Blanco', roadId: 'r_8', roadT: 0.48, radius: 220, type: 'caza',
      levelMin: 16, levelMax: 19, respawnSec: 25,
      relieve: { activo: false },
      notes: 'Riscos alpinos entre las cumbres heladas que conducen al flanco occidental de Trono de Ceniza.',
      monsters: validarEnemigos([
        { name: 'Dientes de Sable Glaciar', level: 16, density: 'alta', boss: false, enemigo: 'df_11_glacier_fangs_sabertooth' },
        { name: 'Guiverno de Escarcha', level: 17, density: 'media', boss: false, enemigo: 'frost_wyrm' },
        { name: 'Fénix Astral de Hielo', level: 18, density: 'baja', boss: false, enemigo: 'astral_frost_phoenix' },
        { name: 'Hidra Tridente Criogénica', level: 19, density: 'baja', boss: false, enemigo: 'cryo_hydra_trident' },
        { name: 'Guiverno Blanco Ancestral', level: 19, density: 'baja', boss: false, campeonZona: true, rangoEliteFijo: 4, enemigo: 'glacier_wyrm_ancient' }
      ])
    },
    {
      id: 'z_12', name: 'Cráter del Sol Quebrado', roadId: 'r_7', roadT: 0.80, radius: 215, type: 'jefe',
      levelMin: 18, levelMax: 22, respawnSec: 35,
      relieve: { activo: false },
      notes: 'Cámara al aire libre al pie de Trono de Ceniza donde Aurelio, Titán del Sol Quebrado custodia el último yunque del Eclipse.',
      monsters: validarEnemigos([
        { name: 'Caballero Abisal del Eclipse', level: 18, density: 'media', boss: false, enemigo: 'abyssal_knight' },
        { name: 'Archiliche del Cónclave', level: 19, density: 'baja', boss: false, enemigo: 'arch_lich' },
        { name: 'Quimera Abisal de Sangre', level: 20, density: 'baja', boss: false, enemigo: 'df_01_abyssal_gore_chimera' },
        { name: 'Quimera del Eclipse Ápice', level: 21, density: 'baja', boss: false, enemigo: 'df_25_celestial_eclipse_chimera_apex' },
        { name: 'Aurelio, Titán del Sol Quebrado', level: 22, density: 'baja', boss: true, enemigo: 'balrog_archdemon' }
      ])
    }
  ];

  world.zones = zoneSpecs.map(zs => {
    const road = W.findRoad(world, zs.roadId);
    const p = W.pointOnPolyline(road.points, zs.roadT);
    const biome = T.biomeAt(p.x, p.y);
    assert.ok(!T.isWater(p.x, p.y), `La zona ${zs.name} cayó en agua`);
    return {
      id: zs.id,
      name: zs.name,
      type: zs.type,
      x: Math.round(p.x),
      y: Math.round(p.y),
      radius: zs.radius,
      shapeSeed: W.hashString(zs.id + ':' + zs.name) & 0x7fffffff,
      biome,
      levelMin: zs.levelMin,
      levelMax: zs.levelMax,
      roadId: zs.roadId,
      roadT: zs.roadT,
      anchored: true,
      respawnSec: zs.respawnSec,
      notes: zs.notes,
      monsters: zs.monsters,
      relieve: zs.relieve
    };
  });

  // Verificar que los 3 laberintos no chocan con ningún pueblo, agua ni entre sí
  const recs = [];
  for (const z of world.zones) {
    if (z.relieve && z.relieve.activo) {
      const rec = Relieve.obtenerRecinto(z, (x, zz) => T.heightAt(x, zz));
      assert.ok(rec, `No se generó recinto para ${z.name}`);
      assert.strictEqual(rec.problema, null, `Problema de recinto en ${z.name}: ${rec.problema}`);
      for (const t of world.towns) {
        const dt = Math.hypot(t.x - rec.zx, t.y - rec.zz);
        assert.ok(dt > rec.rMax + t.radius + 30, `Recinto ${z.name} demasiado cerca de ${t.name} (${Math.round(dt)}m)`);
      }
      for (const prev of recs) {
        const dr = Math.hypot(prev.zx - rec.zx, prev.zz - rec.zz);
        assert.ok(dr > prev.rMax + rec.rMax + 20, `Recintos solapados: ${prev.zona.name} y ${z.name}`);
      }
      recs.push(rec);
      delete z._cacheLaberinto;
      delete z._cacheLaberintoKey;
    }
  }

  // -------------------------------------------------------------------------
  // 4. Mazmorras Ancestrales (3 mazmorras escalonadas con Jefe y Élites x4/x8)
  // -------------------------------------------------------------------------
  const dungeonSpecs = [
    {
      id: 'dun_raices', name: 'Cripta de las Raíces Negras', estilo: 'ruinas_musgosas', x: 960, y: 1580, level: 8, rotacion: 0.4,
      boss: {
        name: 'Arácnido Necrófago de la Savia', level: 10, rangoElite: 10,
        recompensaOro: 1800, recompensaArena: 40, recompensaEquipo: 'Coraza de Savia Templada'
      },
      elites: [
        { name: 'Tejedora de Quitina', level: 8, multiplicador: 4, cantidad: 5, modelo: 'catacomb_necro_arachnid' },
        { name: 'Centinela de Raíz Oscura', level: 9, multiplicador: 8, cantidad: 3, modelo: 'caballero_oscuro' }
      ]
    },
    {
      id: 'dun_sol', name: 'Catacumbas del Sol Enterrado', estilo: 'arenisca_desierto', x: 2030, y: -220, level: 13, rotacion: -0.6,
      boss: {
        name: 'Faraón del Sol Enterrado', level: 15, rangoElite: 10,
        recompensaOro: 3200, recompensaArena: 70, recompensaEquipo: 'Filo del Oasis Ancestral'
      },
      elites: [
        { name: 'Chacal Guardián de Tumbas', level: 13, multiplicador: 4, cantidad: 6, modelo: 'anubis_jackal_guard' },
        { name: 'Inquisidor de la Cripta', level: 14, multiplicador: 8, cantidad: 4, modelo: 'crowned_crypt_inquisitor' }
      ]
    },
    {
      id: 'dun_eclipse', name: 'Sanctum del Trono Quebrado', estilo: 'cripta_glaciar', x: 980, y: -1310, level: 18, rotacion: 1.1,
      boss: {
        name: 'Soberano del Eclipse Helado', level: 21, rangoElite: 10,
        recompensaOro: 6000, recompensaArena: 120, recompensaEquipo: 'Corona del Sol Quebrado'
      },
      elites: [
        { name: 'Verdugo de Corona Ceniza', level: 18, multiplicador: 4, cantidad: 6, modelo: 'ashen_crown_executioner_skeleton' },
        { name: 'Titán del Osario Abisal', level: 19, multiplicador: 8, cantidad: 4, modelo: 'abyssal_crown_ossuary_titan' }
      ]
    }
  ];

  world.dungeons = dungeonSpecs.map(ds => {
    assert.ok(!T.isWater(ds.x, ds.y), `Mazmorra ${ds.name} bajo agua`);
    assert.ok(T.elevation(ds.x, ds.y) > W.SEA_LEVEL + 0.02, `Mazmorra ${ds.name} demasiado baja`);
    return Mazmorras.generarMazmorraPorDefecto(world, ds.x, ds.y, ds);
  });

  // -------------------------------------------------------------------------
  // 5. Puntos de Interés (POIs) vinculados a zonas (1 por zona, 12 en total)
  // -------------------------------------------------------------------------
  const poiSpecs = [
    { id: 'poi_1', name: 'Campamento de la Fragua Libre', type: 'campamento', zoneId: 'z_1', dx: 65, dy: -55, notes: 'Puesto avanzado de aprendices de Brann que recogen correas y hierros intactos.' },
    { id: 'poi_2', name: 'Faro Hundido de Brisal', type: 'ruinas', zoneId: 'z_2', dx: -70, dy: 50, notes: 'Antigua torre portuaria donde atracaban galeones antes del bloqueo del Cónclave.' },
    { id: 'poi_3', name: 'Veta del Roble Partido', type: 'mina', zoneId: 'z_3', dx: 55, dy: 65, notes: 'Excavación donde la savia del bosque se tiñó de escoria metálica.' },
    { id: 'poi_8', name: 'Arco de los Guardabosques', type: 'ruinas', zoneId: 'z_4', absX: 280, absY: 2062, notes: 'Antiguo arco de piedra frente a la entrada del Laberinto del Seto Maldito.' },
    { id: 'poi_9', name: 'Muelle de los Boticarios', type: 'campamento', zoneId: 'z_5', dx: 55, dy: -60, notes: 'Refugio sobre pilotes donde los boticarios de Limoquieto filtran muestras del cieno.' },
    { id: 'poi_4', name: 'Mina del Hierro Rojo', type: 'mina', zoneId: 'z_6', dx: -60, dy: -45, notes: 'Cantera libre disputada entre contrabandistas de Albaferro e inquisidores.' },
    { id: 'poi_5', name: 'Santuario del Espejismo', type: 'santuario', zoneId: 'z_7', absX: 2242, absY: -200, notes: 'Obelisco solar de piedra dorada en la antesala norte del Cañón del Pacto de Arena.' },
    { id: 'poi_10', name: 'Vigía de la Guardia Rebelde', type: 'campamento', zoneId: 'z_8', dx: -65, dy: 45, notes: 'Avanzada de exploradores de Atalaya de Escarcha frente a las patrullas del Cónclave.' },
    { id: 'poi_6', name: 'Portal de la Escarcha', type: 'portal', zoneId: 'z_9', dx: -55, dy: 60, notes: 'Monolito rúnico boreal usado por los exploradores de Atalaya de Escarcha como piedra de viaje.' },
    { id: 'poi_11', name: 'Forja de los Pilares Negros', type: 'ruinas', zoneId: 'z_10', absX: 1709, absY: -633, notes: 'Puesto en ruinas junto a la boca de la Garganta de Obsidiana.' },
    { id: 'poi_12', name: 'Huesos del Viejo Guiverno', type: 'santuario', zoneId: 'z_11', dx: 60, dy: -50, notes: 'Altar glaciar erigido sobre los restos de un dragón ancestral en el Paso del Dragón Blanco.' },
    { id: 'poi_7', name: 'Altar de Aurelio', type: 'jefe', zoneId: 'z_12', dx: 45, dy: -40, notes: 'Forja al rojo vivo del Titán del Sol Quebrado.' }
  ];

  world.pois = poiSpecs.map(ps => {
    const z = W.findZone(world, ps.zoneId);
    const x = typeof ps.absX === 'number' ? Math.round(ps.absX) : Math.round(z.x + ps.dx);
    const y = typeof ps.absY === 'number' ? Math.round(ps.absY) : Math.round(z.y + ps.dy);
    assert.ok(!T.isWater(x, y), `POI ${ps.name} en agua`);
    for (const rec of recs) {
      const dRec = Math.hypot(x - rec.zx, y - rec.zz);
      assert.ok(dRec > rec.rMax + 15, `POI ${ps.name} dentro de recinto ${rec.zona.name} (${Math.round(dRec)} <= ${Math.round(rec.rMax)})`);
    }
    return {
      id: ps.id,
      name: ps.name,
      type: ps.type,
      x,
      y,
      level: z.levelMax + (ps.type === 'jefe' ? 3 : 0),
      zoneId: ps.zoneId,
      dx: x - z.x,
      dy: y - z.y,
      notes: ps.notes
    };
  });

  // -------------------------------------------------------------------------
  // 6. Validar salidas de pueblos, ríos y lugares secretos curados a mano
  // -------------------------------------------------------------------------
  W.updateAllExits(world);
  W.calcularRios(world);

  const cabBase = Object.fromEntries(Secretos.CABANAS_GLB.map(c => [c.id, c]));
  function hacerCabanaValdris(id, opts) {
    const def = cabBase[id];
    assert.ok(def, `Falta definición CABANAS_GLB para ${id}`);
    const z = W.findZone(world, opts.zonaId);
    assert.ok(z, `Falta zona ${opts.zonaId} para cabaña ${id}`);
    assert.ok(!T.isWater(opts.x, opts.z), `Cabaña ${id} cayó en agua`);
    const mNormal = z.monsters.find(m => !m.boss && !m.campeonZona) || z.monsters[0];
    const especie = opts.especie || mNormal.name;
    const hR = W.hashString(id + '|valdris|rastro');
    const angR = ((hR % 360) * Math.PI) / 180;
    const distR = 28 + ((hR >>> 8) % 7);
    const cab = {
      id,
      tipo: 'cabana',
      nombre: opts.nombre || def.nombre,
      aldeano: def.aldeano,
      aldeanoModelo: def.aldeanoModelo || 'npc/aldeanos/campesino.glb',
      frase: opts.frase || def.frase,
      trama: opts.trama || def.trama,
      modeloGLB: def.archivo,
      esMar: !!opts.esMar,
      zonaAsignada: z.id,
      x: opts.x,
      z: opts.z,
      radio: 32,
      radioPlano: 16.0,
      radioRebaje: 36.0,
      icono: opts.esMar ? '🛖🌊' : '🛖',
      desc: (opts.nombre || def.nombre) + ': refugio habitado por ' + def.aldeano + (opts.esMar ? ', frente a la bahía de Puerto Brisal.' : ' junto a ' + z.name + '.'),
      recompensa: 'Cacería mayor de 100 monstruos y forja de armaduras superiores',
      rotacion: opts.rotacion || 0.4,
      misionCabana: {
        id: 'mision-' + id,
        cabanaId: id,
        cabanaNombre: opts.nombre || def.nombre,
        aldeano: def.aldeano,
        frase: opts.frase || def.frase,
        especie,
        objetivoEspecie: especie,
        nivelMonstruo: mNormal.level || z.levelMin || 1,
        zonaId: z.id,
        zonaNombre: z.name,
        cantidad: 100,
        objetivoCantidad: 100,
        progreso: 0,
        aceptada: false,
        entregada: false,
        cumplida: false,
        completada: false,
        modalidad: null,
        faseActual: 1,
        cantidadFases: 15,
        rastroEncontrado: false,
        liderDerrotado: false,
        multiplicadorPremio: 1,
        rastroNombre: def.encargoFases ? def.encargoFases.rastroNombre : 'Rastro Sospechoso',
        rastroLore: def.encargoFases ? def.encargoFases.rastroLore : 'Huellas frescas de una bestia alfa merodeando el puesto.',
        liderNombre: def.encargoFases ? def.encargoFases.liderNombre : ('Alfa de ' + especie),
        rastroOffset: {
          dx: Math.round(Math.cos(angR) * distR * 10) / 10,
          dz: Math.round(Math.sin(angR) * distR * 10) / 10
        },
        recompensa: {
          oroMin: 1, oroMax: 2000,
          arenaMin: 10, arenaMax: 50,
          pocionesVida: 4,
          nivelPiezaMultiplicador: 10,
          calidadMin: 0.50, calidadMax: 0.90
        }
      }
    };
    return cab;
  }

  world.secretPlaces = [
    hacerCabanaValdris('cabana-1-clasica', {
      nombre: 'Cabaña de Troncos de Albaferro',
      x: 1680, z: 880, zonaId: 'z_1', rotacion: 0.75,
      trama: 'Las manadas desplazadas de las fundiciones clandestinas del Cónclave acechan a las puertas de Albaferro.',
      frase: 'Las bestias alteradas merodean los Prados del Yunque Roto. Despeja 100 o caza a Colmillo de Ceniza para proteger Albaferro.'
    }),
    hacerCabanaValdris('cabana-3-pescador', {
      nombre: 'Cabaña del Pescador de Brisal',
      x: 275, z: 250, zonaId: 'z_2', esMar: true, rotacion: 2.35,
      trama: 'La marea de la bahía arrastra restos de jaulas sumergidas con el sello de la Orden del Eclipse.',
      frase: 'Las criaturas costeras de los Acantilados de la Marea Roja asaltan nuestras redes en Puerto Brisal. Despeja la costa y compartiré los tesoros de la marea.'
    }),
    hacerCabanaValdris('cabana-5-redonda', {
      nombre: 'Cabaña del Herbolario del Robledal',
      x: 996, z: 1666, zonaId: 'z_3', rotacion: -0.9,
      trama: 'El aceite oscuro vertido en el Robledal Sombrío corrompe la savia de los robles antiguos.',
      frase: 'Mis cultivos de raíces curativas cerca de Robledal Sombrío sufren ataques constantes. Limpia el Claro de la Savia Oscura para salvar el bosque.'
    }),
    hacerCabanaValdris('cabana-2-posada', {
      nombre: 'Posada de la Bruma de Limoquieto',
      x: -273, z: 1790, zonaId: 'z_5', rotacion: 1.4,
      trama: 'Esta posada palustre es el único refugio seguro para quienes cruzan las Marismas del Silencio rumbo a Limoquieto.',
      frase: 'Los viajeros temen cruzar las Marismas del Silencio. Ayúdame abatiendo a las plagas del cieno y obtendrás oro, arena y equipo.'
    }),
    hacerCabanaValdris('cabana-4-vigia', {
      nombre: 'Torre Vigía de Atalaya de Escarcha',
      x: -1839, z: 208, zonaId: 'z_8', rotacion: -2.1,
      trama: 'Desde esta torre boreal la guardia rebelde vigila las columnas de bestias que cercan Atalaya de Escarcha.',
      frase: 'Las manadas salvajes rodean la Costa de las Brumas Boreales. Despeja la ruta hacia Atalaya de Escarcha.'
    }),
    {
      id: 'sec-fuente-brisal',
      tipo: 'fuente',
      nombre: 'Fuente Arcana de la Bahía',
      x: 40, z: 1046,
      radio: 16,
      icono: '⛲',
      desc: 'Fuente de piedra ancestral oculta entre Puerto Brisal y Limoquieto cuyas aguas luminiscentes templan el acero libre.',
      recompensa: 'Templado arcano de armadura y bendición de vitalidad',
      rotacion: 0.6
    },
    {
      id: 'sec-cabana-cronista',
      tipo: 'cabana',
      nombre: 'Cabaña del Cronista Oculto',
      x: 720, z: 1600,
      radio: 18,
      icono: '🏚️',
      desc: 'Refugio solitario en la espesura entre Robledal Sombrío y Limoquieto donde el último cronista escondió las actas del Cónclave.',
      recompensa: 'Diario incriminatorio de los Sabios y planos de la Cripta',
      rotacion: 1.15
    },
    {
      id: 'sec-altar-ambar',
      tipo: 'altar',
      nombre: 'Altar Rúnico de Ámbar de Dunas',
      x: 2161, z: -206,
      radio: 16,
      icono: '⛩️',
      desc: 'Cuatro pilares solares grabados con runas reales a las puertas de Ámbar de Dunas; su consagración rompe el monopolio mercantil.',
      recompensa: 'Ruptura del monopolio comercial Nv. 12+ y resonancia rúnica',
      rotacion: -0.45
    },
    {
      id: 'sec-santuario-sol',
      tipo: 'santuario',
      nombre: 'Santuario del Sol Quebrado',
      x: 845, z: -1756,
      radio: 20,
      icono: '🏛️',
      desc: 'Monolitos ciclópeos erigidos sobre las cumbres de Trono de Ceniza frente al corazón del Titán mecánico.',
      recompensa: 'Revelación del núcleo del Titán y bendición de los siete reinos',
      rotacion: 0.25
    },
    {
      id: 'sec-fuente-cumbres',
      tipo: 'fuente',
      nombre: 'Manantial Puro de las Cumbres',
      x: -650, z: -813,
      radio: 16,
      icono: '⛲',
      desc: 'Manantial prístino de alta montaña entre Atalaya de Escarcha y Trono de Ceniza donde se purifica la savia oscura.',
      recompensa: 'Purificación de las aguas de Valdris',
      rotacion: 1.9
    }
  ];

  // Validar que ningún secreto caiga en agua, dentro de pueblos o dentro de recintos de laberinto
  for (const s of world.secretPlaces) {
    assert.ok(!T.isWater(s.x, s.z), `Secreto ${s.id} en agua`);
    for (const t of world.towns) {
      const dt = Math.hypot(t.x - s.x, t.y - s.z);
      assert.ok(dt >= 170, `Secreto ${s.id} demasiado cerca del pueblo ${t.name} (${Math.round(dt)}m)`);
    }
    for (const rec of recs) {
      const dr = Math.hypot(rec.zx - s.x, rec.zz - s.z);
      assert.ok(dr > rec.rMax + 20, `Secreto ${s.id} dentro de recinto ${rec.zona.name} (${Math.round(dr)}m)`);
    }
  }

  // -------------------------------------------------------------------------
  // 7. Historia oficial completa y 100 % coherente para Valdris
  // -------------------------------------------------------------------------
  function construirHistoriaValdris() {
    const prologo = {
      titulo: '🔥 Prólogo · La Emboscada en Albaferro',
      parrafo1: 'La noche cae sobre las murallas de <b>Albaferro</b>, último baluarte libre de <b>Valdris</b>. Mientras el <b>Herrero Brann</b> martillea a escondidas del Cónclave del Eclipse, un estruendo quiebra las vigas: bestias deformadas con placas de hierro remachadas en carne viva irrumpen en la fragua.',
      parrafo2: 'Brann abatió a la primera criatura antes de caer herido junto al yunque, aferrando un <b>sello de bronce del Consejo de la plaza</b>. <i>«Nos han traicionado desde dentro… alguien alimenta esta plaga desde Puerto Brisal hasta las cumbres de Trono de Ceniza»</i>, jadea.'
    };

    const capitulos = [
      {
        id: 'c1', nivel: 1, sabio: 'Sabia Elara', npc: 'guru-1',
        titulo: 'Cenizas en Albaferro y los pantalones reforzados',
        encargo: 'El Herrero Brann tose sangre sobre el yunque de Albaferro: «¡Nos han tendido una trampa dentro de nuestras propias murallas! Escapa hacia {lugar} y abate a {n} criaturas alteradas; tráeme sus correas de cuero y placas de pierna para forjar tus primeros pantalones reforzados».',
        texto: 'Regresas de {lugar} cubierto de ceniza y barro. Brann remacha tus pantalones reforzados y señala el cuño de bronce hallado entre los restos: «Este sello pertenece a los Sabios de la plaza. La plaga no es salvaje: la están fabricando en secreto».',
        mision: { tipo: 'matar', cantidad: 8, nivel: 1, zona: 'z_1' },
        recompensa: { puntos: 1, forjarPieza: 'pants', desbloquea: 'acompanante' }
      },
      {
        id: 'c2', nivel: 2, sabio: 'Maestro Oren', npc: 'guru-2',
        titulo: 'Rumbo a Puerto Brisal y las botas de marcha',
        encargo: 'El Maestro Oren te intercepta junto a la puerta occidental de Albaferro: «Un emisario que venía desde Puerto Brisal llevaba la lista real de sospechosos cuando fue emboscado en {lugar}. Abate a {n} criaturas allí y recupera tendones firmes para tus botas de marcha».',
        texto: 'Entre los despojos de {lugar} recuperas las suelas reforzadas y una orden de captura con tu nombre y el de tu compañero sellada rumbo a Puerto Brisal. Con tus botas nuevas, ningún camino de Valdris te cerrará el paso.',
        mision: { tipo: 'matar', cantidad: 12, nivel: 2, zona: 'z_2' },
        recompensa: { puntos: 2, forjarPieza: 'boots' }
      },
      {
        id: 'c3', nivel: 4, sabio: 'Hermana Ysolde', npc: 'guru-3',
        titulo: 'Savia oscura en el Robledal y guantes de combate',
        encargo: 'La Hermana Ysolde oculta un vial turbio bajo su manga: «Las caravanas madereras que marchan hacia Robledal Sombrío caen en {lugar}, donde la savia brota teñida de gris. Abate a {n} aberraciones y arráncales garras blindadas para forjar tus guanteletes».',
        texto: 'Lucháis espalda con espalda bajo la arboleda sombría de {lugar}. Con las garras y escamas recuperadas, Brann remata tus guantes de combate y sella la hermandad táctica total con tu compañero.',
        mision: { tipo: 'matar', cantidad: 15, nivel: 4, zona: 'z_3' },
        recompensa: { puntos: 2, forjarPieza: 'gloves', desbloquea: 'acompanante' }
      },
      {
        id: 'c4', nivel: 6, sabio: 'Viejo Tamsin', npc: 'guru-4',
        titulo: 'El cerco del Seto Maldito y el peto de acero',
        encargo: 'El Viejo Tamsin señala el corredor meridional entre Robledal Sombrío y Limoquieto: «Los capataces del Cónclave ocultan remesas de hierro tras las murallas vivas de {lugar}. Adéntrate en el laberinto, destroza a {n} guardianes y trae sus planchas para tu peto; te enseñaré el Impacto Sísmico (Q)».',
        texto: 'Con las placas acorazadas recuperadas en el corazón de {lugar}, Brann martilla un sólido peto con hombreras integradas y Tamsin despierta en tu brazo el Impacto Sísmico (Q). Elara proyecta una advertencia: cada temblor resuena bajo las montañas del norte.',
        mision: { tipo: 'matar', cantidad: 18, nivel: 6, zona: 'z_4' },
        recompensa: { puntos: 2, forjarPieza: 'torso', desbloquea: 'sismo' }
      },
      {
        id: 'c5', nivel: 7, sabio: 'Erudita Mirel', npc: 'guru-5',
        titulo: 'Susurros en Limoquieto y el yelmo protector',
        encargo: 'La Erudita Mirel despliega los mapas de las ciénagas de Limoquieto: «Los vertidos tóxicos en {lugar} emiten un zumbido mental que doblega a los viajeros. Caza a {n} criaturas alteradas allí para reunir astas óseas y sellar tu yelmo protector».',
        texto: 'Al encajar los refuerzos óseos en tu yelmo forjado por Brann, los susurros del Cónclave en {lugar} se apagan al instante. Tus cinco piezas de armadura quedan completas para internarte en los secretos de Valdris.',
        mision: { tipo: 'matar', cantidad: 20, nivel: 7, zona: 'z_5' },
        recompensa: { puntos: 2, forjarPieza: 'helmet' }
      },
      {
        id: 'c6', nivel: 9, sabio: 'Sabia Elara', npc: 'guru-1',
        titulo: 'La fuente arcana y el templado del conjunto',
        encargo: 'Elara te entrega una carta cifrada hacia {lugar}, oculta en los bosques entre Puerto Brisal y Limoquieto: «Sumerge tu armadura de cinco piezas en sus aguas luminiscentes para resistir el acero rúnico, pero ten cuidado: la corona ocultó allí más de un secreto».',
        texto: 'En {lugar}, las cinco piezas de tu armadura absorben un fulgor azulado indestructible. En el fondo cristalino descubres jaulas sumergidas con los mismos punzones metálicos que marcan a las bestias de la plaga.',
        mision: { tipo: 'secreto', secreto: 'fuente', secretoId: 'sec-fuente-brisal' },
        recompensa: { puntos: 3, templarArmadura: true }
      },
      {
        id: 'c7', nivel: 10, sabio: 'Maestro Oren', npc: 'guru-2',
        titulo: 'Hierro salvaje y la forja del arma',
        encargo: 'Oren señala la calzada oriental que asciende desde Albaferro hacia Ámbar de Dunas: «Las vetas de hierro puro en {lugar} están tomadas por escoltas renegados. Abate a {n} enemigos allí y recupera metal limpio para forjar tu arma maestra».',
        texto: 'El hierro salvaje de {lugar} arde con chispas azules bajo el martillo de Brann. De la fragua surge tu arma definitiva, sellada con runas de insumisión fuera del control eclesial.',
        mision: { tipo: 'matar', cantidad: 22, nivel: 10, zona: 'z_6' },
        recompensa: { puntos: 3, forjarPieza: 'weapon' }
      },
      {
        id: 'c8', nivel: 11, sabio: 'Hermana Ysolde', npc: 'guru-3',
        titulo: 'El despertar de la Nova en el Cañón de Arena',
        encargo: 'Ysolde rasga sus votos frente a ti al pie del desierto: «La energía encerrada en {lugar} pertenece a los antiguos reyes de Valdris, no al Cónclave. Adéntrate en el cañón de arenisca y derrota a {n} centinelas para liberar la Explosión Nova (E)».',
        texto: 'Una onda dorada barre las paredes de {lugar} y despierta la Explosión Nova (E) en tus manos. Por un instante, los ojos de tu compañero brillan con un halo ámbar idéntico al de los monolitos del desierto.',
        mision: { tipo: 'matar', cantidad: 25, nivel: 11, zona: 'z_7' },
        recompensa: { puntos: 3, desbloquea: 'nova' }
      },
      {
        id: 'c9', nivel: 12, sabio: 'Viejo Tamsin', npc: 'guru-4',
        titulo: 'Los archivos del Cronista Oculto',
        encargo: 'Tamsin baja la voz tras inspeccionar los túneles del sur: «Antes de ser ejecutado, el cronista escondió en {lugar}, entre Robledal Sombrío y Limoquieto, los planos de la Cripta de las Raíces Negras y las órdenes de envío hacia Trono de Ceniza. Llega antes de que los inquisidores lo quemen».',
        texto: 'En {lugar} recuperas el diario íntegro del cronista: expone los nombres de los conspiradores, el desvío de caravanas hacia el desierto y los planos de un Titán mecánico oculto bajo las cumbres del norte.',
        mision: { tipo: 'secreto', secreto: 'cabana', secretoId: 'sec-cabana-cronista' },
        recompensa: { puntos: 3 }
      },
      {
        id: 'c10', nivel: 13, sabio: 'Sabia Elara', npc: 'guru-1',
        titulo: 'Ruptura del cerco sobre Atalaya de Escarcha',
        encargo: 'Las columnas mecanizadas intentan aislar el bastión boreal de Atalaya de Escarcha en {lugar}. «Hay que romper el bloqueo ahora mismo: abate a {n} enemigos en las brumas boreales para abrir ruta hacia las cumbres del norte».',
        texto: 'El cerco de {lugar} se desmorona bajo tu avance. La guarnición rebelde de Atalaya de Escarcha queda conectada con los valles del sur y lista para apoyar la marcha final hacia Trono de Ceniza.',
        mision: { tipo: 'matar', cantidad: 25, nivel: 13, zona: 'z_8' },
        recompensa: { puntos: 3 }
      },
      {
        id: 'c11', nivel: 14, sabio: 'Maestro Oren', npc: 'guru-2',
        titulo: 'El altar de Ámbar de Dunas y el fin del monopolio',
        encargo: 'Oren te confía la llave ceremonial: «Consagra {lugar}, a las puertas de Ámbar de Dunas. Cuando caiga su sello eclesial, Brann y todos los mercaderes de Valdris volverán a forjar y vender equipo superior (Nv. 12+) sin censura».',
        texto: 'Un haz solar parte el cielo del desierto sobre {lugar}: ¡el monopolio comercial del Cónclave queda destruido para siempre! Todas las fraguas superiores y tiendas de Valdris reabren sus puertas.',
        mision: { tipo: 'secreto', secreto: 'altar', secretoId: 'sec-altar-ambar' },
        recompensa: { puntos: 4 }
      },
      {
        id: 'c12', nivel: 15, sabio: 'Hermana Ysolde', npc: 'guru-3',
        titulo: 'Pilares de resonancia en Garganta de Obsidiana',
        encargo: 'La ciudadela volcánica de Trono de Ceniza resiste tras un velo arcano alimentado desde {lugar}. «Cruza los pasillos de piedra negra y derrota a {n} guardianes para derribar los pilares de resonancia que blindan el cráter».',
        texto: 'Los pilares de obsidiana estallan en cascadas de ceniza sobre {lugar}. La barrera que protegía las faldas de Trono de Ceniza colapsa con un rugido que retumba en todo el continente.',
        mision: { tipo: 'matar', cantidad: 30, nivel: 15, zona: 'z_10' },
        recompensa: { puntos: 4 }
      },
      {
        id: 'c13', nivel: 16, sabio: 'Sabia Elara', npc: 'guru-1',
        titulo: 'El santuario de las cumbres quebradas',
        encargo: 'Elara te cita frente a los monolitos de {lugar}, sobre las crestas de Trono de Ceniza y el Sanctum del Trono Quebrado: «Contempla la fuente original que el Cónclave intentó usurpar y localiza el núcleo del Titán».',
        texto: 'En {lugar}, las estelas ancestrales revelan la última verdad: la Orden del Eclipse fusionó la savia corrupta con Aurelio, Titán del Sol Quebrado, para someter todas las rutas de Valdris.',
        mision: { tipo: 'secreto', secreto: 'santuario', secretoId: 'sec-santuario-sol' },
        recompensa: { puntos: 4 }
      },
      {
        id: 'c14', nivel: 18, sabio: 'Viejo Tamsin', npc: 'guru-4',
        titulo: 'El asalto final contra Aurelio, Titán del Sol Quebrado',
        encargo: 'Tamsin alza su mandoble hacia {lugar}, al pie de Trono de Ceniza: «Nadie ha regresado con vida de los dominios de Aurelio, Titán del Sol Quebrado. Derriba al coloso antes de que despierte la última fragua abisal».',
        texto: 'La tierra se agrieta bajo vuestros pies en {lugar}. Cuando el coloso descarga su martillo letal, tu compañero se interpone con temple inquebrantable y atraviesas el núcleo rúnico de Aurelio: las forjas de pesadilla se apagan para siempre.',
        mision: { tipo: 'jefe', nivel: 18, zona: 'z_12' },
        recompensa: { puntos: 5 }
      },
      {
        id: 'c15', nivel: 18, sabio: 'Hermana Ysolde', npc: 'guru-3',
        titulo: 'Purificación en el Manantial de las Cumbres',
        encargo: 'Con Aurelio derrotado, tu compañero te pide ascender hasta {lugar}, entre Atalaya de Escarcha y Trono de Ceniza, para purificar los últimos restos de aceite oscuro antes de que desciendan hacia los valles.',
        texto: 'En {lugar}, la savia gris se disuelve en vapor limpio bajo el cielo abierto. Los ríos que riegan desde Puerto Brisal y Robledal Sombrío hasta Albaferro vuelven a fluir cristalinos.',
        mision: { tipo: 'secreto', secreto: 'fuente', secretoId: 'sec-fuente-cumbres' },
        recompensa: { puntos: 4 }
      },
      {
        id: 'c16', nivel: 19, sabio: 'Erudita Mirel', npc: 'guru-5',
        titulo: 'Juicio público y victoria en Albaferro',
        encargo: 'Regresa a la plaza de Albaferro. La Erudita Mirel, Brann y los enviados desde Puerto Brisal, Limoquieto, Ámbar de Dunas y Atalaya de Escarcha aguardan para juzgar al Cónclave y proclamar vuestra gesta.',
        texto: 'Bajo la arcada de Albaferro, las campanas tañen desde el puerto occidental hasta las cumbres del norte. Vuestros nombres quedan grabados para la eternidad en la Crónica: ¡sois los Libertadores de Valdris!',
        mision: { tipo: 'hablar', npc: 'guru-5', nombre: 'Erudita Mirel' },
        recompensa: { puntos: 6, titulo: 'Libertadores de Valdris' }
      }
    ];

    const actos = [
      {
        numero: 1, id: 'acto-1',
        nombre: 'Acto I · Asedio en Albaferro y Forja Clandestina',
        resumen: 'Tras la emboscada en la fragua de Albaferro, reúnes materiales desde los Prados del Yunque Roto hasta las Marismas del Silencio para que Brann forje en secreto las cinco piezas de tu armadura.',
        desdePaso: 0, hastaPaso: 4
      },
      {
        numero: 2, id: 'acto-2',
        nombre: 'Acto II · Savia, Laberintos y Archivos de Valdris',
        resumen: 'Templas tu armadura en la Fuente Arcana de la Bahía, forjas tu arma maestra, despiertas la Explosión Nova en el Cañón del Pacto de Arena y recuperas el diario del Cronista Oculto.',
        desdePaso: 5, hastaPaso: 9
      },
      {
        numero: 3, id: 'acto-3',
        nombre: 'Acto III · Ruptura del Monopolio y Caída de Aurelio',
        resumen: 'Consagras el Altar Rúnico de Ámbar de Dunas para reabrir el equipo Nv. 12+, derribas los pilares de Garganta de Obsidiana y abates a Aurelio, Titán del Sol Quebrado.',
        desdePaso: 10, hastaPaso: 13
      },
      {
        numero: 4, id: 'acto-4',
        nombre: 'Acto IV · Purificación y Liberación de Valdris',
        resumen: 'Purificas el Manantial Puro de las Cumbres y regresas a la plaza de Albaferro para el juicio público que consagra a los Libertadores de Valdris.',
        desdePaso: 14, hastaPaso: 15
      }
    ];

    const epilogo = {
      nombre: 'Epílogo · Libertadores de Valdris',
      resumen: 'El Cónclave del Eclipse ha caído y las siete comarcas de Valdris respiran libres. Las 5 Cabañas Fronterizas, los 12 Campeones Alfa, los 3 Laberintos y las 3 Mazmorras Ancestrales esperan a los campeones.'
    };

    const hitos = {
      5: { capitulo: 5, icono: '🛡️', etiqueta: 'Fin del Acto I → Acto II · Valdris', titulo: 'Mente Blindada ante la Corrupción', detalle: 'El yelmo óseo forjado con trofeos de las Marismas del Silencio sella tu mente. Comienza la búsqueda de santuarios y pruebas.' },
      8: { capitulo: 8, icono: '✨', etiqueta: 'Giro del Acto II · Cañón del Pacto de Arena', titulo: 'Despertar de la Explosión Nova', detalle: 'La Hermana Ysolde rompe la disciplina del Cónclave y libera el poder antiguo en el Cañón del Pacto de Arena.' },
      10: { capitulo: 10, icono: '⚔️', etiqueta: 'Fin del Acto II → Acto III · Atalaya de Escarcha', titulo: 'Paso Boreal Desbloqueado', detalle: 'Cae el bloqueo sobre Atalaya de Escarcha y las cumbres de Trono de Ceniza quedan al alcance de la rebelión.' },
      11: { capitulo: 11, icono: '🔓', etiqueta: 'Hito Económico · Ámbar de Dunas', titulo: '¡Monopolio Comercial Quebrado!', detalle: 'Las forjas de Brann y los mercaderes de toda Valdris reabren el catálogo superior (Nv. 12+).' },
      14: { capitulo: 14, icono: '⚙️', etiqueta: 'Fin del Acto III → Acto IV · Cráter del Sol Quebrado', titulo: 'Caída de Aurelio, Titán del Sol Quebrado', detalle: 'Aurelio yace derrotado junto a Trono de Ceniza. Solo resta purificar el Manantial de las Cumbres y volver a Albaferro.' },
      16: { capitulo: 16, icono: '👑', etiqueta: 'Epílogo Desbloqueado · Libertadores de Valdris', titulo: 'Triunfo en la Plaza de Albaferro', detalle: 'Has completado la crónica de Valdris. Las 3 Mazmorras Ancestrales, las 5 Cabañas Fronterizas y la Maestría de las 12 Zonas quedan abiertas.' }
    };

    const dialogosNpc = {
      'guru-1': {
        1: 'En Albaferro todos vigilan lo que llevas al yunque de Brann. Empieza limpiando los Prados del Yunque Roto.',
        2: 'La Fuente Arcana de la Bahía guarda rastros de cargamentos desaparecidos entre Puerto Brisal y Limoquieto.',
        3: 'Si alcanzas el Santuario del Sol Quebrado sobre Trono de Ceniza, verás por qué el Cónclave temía tu avance.',
        4: 'Aurelio ha caído… quizá la voluntad de los pueblos de Valdris valga más que todos nuestros sellos.',
        fin: 'Vuestro nombre abre el primer tomo de la nueva historia de Valdris.'
      },
      'guru-2': {
        1: 'Sigue la calzada entre Albaferro y Puerto Brisal; las patrullas corruptas vigilan cada cruce.',
        2: 'Las vetas de hierro del Desfiladero del Óxido son vitales para templar tu arma maestra antes de cruzar a Ámbar de Dunas.',
        3: '¡Con el Altar Rúnico de Ámbar de Dunas consagrado, todas las rutas de Valdris vuelven a ser libres!',
        4: 'Las caravanas vuelven a circular sin miedo desde la costa de Brisal hasta las cumbres del norte.',
        fin: 'Cada camino de Valdris lleva hoy la huella de los Libertadores.'
      },
      'guru-3': {
        1: 'Entrena tus técnicas en silencio en Albaferro. Las runas antiguas no pertenecen al Cónclave.',
        2: 'Cuando entres en el Cañón del Pacto de Arena, la Explosión Nova despertará ante tus manos.',
        3: 'He roto mis votos definitivamente. Derriba los pilares de Garganta de Obsidiana que blindan Trono de Ceniza.',
        4: 'Purifica el Manantial de las Cumbres para que la savia gris no vuelva a envenenar nuestros ríos.',
        fin: 'Las runas de Valdris sirven ahora al pueblo libre, no a las sombras.'
      },
      'guru-4': {
        1: 'Aprende a partir la tierra: los constructos del Laberinto del Seto Maldito se quiebran con Impacto Sísmico.',
        2: 'En la Cabaña del Cronista Oculto aguardan las rutas hacia la Cripta de las Raíces Negras.',
        3: 'Cuando pises el Cráter del Sol Quebrado frente a Aurelio, lleva contigo tu mejor temple.',
        4: 'Aurelio ya no volverá a alzarse sobre Trono de Ceniza.',
        fin: 'El Sanctum del Trono Quebrado y los Campeones Alfa aún ofrecen gloria a los valientes.'
      },
      'guru-5': {
        1: 'Blinda tu yelmo con astas de las Marismas del Silencio para acallar los susurros del Cónclave.',
        2: 'Cada prueba recuperada demuestra quién financia estas aberraciones desde Ámbar de Dunas hasta el norte.',
        3: 'Reúno todas las actas y testimonios para el juicio público en Albaferro.',
        4: 'Todo Valdris aguarda en la plaza para escuchar vuestro veredicto.',
        fin: 'Los anales de Albaferro honran por siempre a los Libertadores de Valdris.'
      },
      'serv-herrero': {
        1: 'Mi yunque en Albaferro sigue ardiendo a escondidas. Tráeme trofeos de los Prados y los Acantilados.',
        2: 'Con hierro salvaje del Desfiladero del Óxido forjaré tu arma definitiva.',
        3: '¡El monopolio de Ámbar de Dunas cayó! Ya trabajo equipo superior de nivel 12+ en toda Valdris.',
        4: 'El acero sale limpio de la fragua; es hora de cerrar el juicio en Albaferro.',
        fin: 'Para los Libertadores de Valdris, mi fragua siempre arderá con fuego perfecto.'
      },
      'serv-mercader': {
        1: 'Los inspectores bloquean las ventas superiores en Albaferro y Puerto Brisal hasta que rompas el monopolio.',
        2: 'Tráeme el botín de caza y aprovisiónate de pociones antes de cruzar hacia el desierto.',
        3: '¡Libre comercio al fin! Las caravanas entre Puerto Brisal y Ámbar de Dunas vuelven a fluir.',
        4: 'Los mercados celebran vuestro triunfo en cada plaza de Valdris.',
        fin: '¡Las rutas comerciales de Valdris nunca habían visto tanta abundancia!'
      },
      'serv-comandante': {
        1: 'Tráeme pruebas de la conspiración del Cónclave y mi guarnición mirará hacia otro lado.',
        2: 'Esos diarios del cronista incriminan a los mandos de plaza. Mis exploradores vigilan el paso hacia Atalaya de Escarcha.',
        3: 'La Guardia de Valdris cierra filas contigo para asegurar los flancos hacia Trono de Ceniza.',
        4: 'Las murallas de Albaferro vuelven a servir al pueblo.',
        fin: 'La Guardia de Valdris rinde honores a los Libertadores.'
      },
      'serv-informante': {
        1: 'Las Cabañas Fronterizas cercanas a Albaferro y Puerto Brisal esconden contratos muy lucrativos.',
        2: 'Entre Robledal Sombrío y Limoquieto desaparecen caravanas enteras rumbo a la Cripta de las Raíces Negras.',
        3: 'Mis espías ven ceniza ascender desde Trono de Ceniza. Lleva tus mejores elixires.',
        4: 'Con Aurelio vencido, aún quedan fortunas ocultas en las Catacumbas del Sol Enterrado y el Sanctum.',
        fin: 'Mientras quede un rincón oscuro en Valdris, siempre tendremos negocios.'
      },
      'serv-boticaria': {
        1: 'Mis destilados mantienen en pie a quien entra en los Prados sin armadura completa.',
        2: 'En las Marismas del Silencio de Limoquieto la savia quema la piel: lleva pociones de sobra.',
        3: 'Contra Aurelio en el Cráter necesitarás frascos de furia y temple.',
        4: 'Purificar el Manantial de las Cumbres devolvió la pureza incluso a mis hierbas.',
        fin: 'Las mazmorras de Valdris siguen exigiendo buenos brebajes.'
      },
      'serv-hereje': {
        1: 'Si buscas poder más allá de las leyes de Albaferro, mis runas esperan en la sombra.',
        2: 'Ellos llaman herejía a mis grabados mientras envenenan los robles del sur.',
        3: 'Graba furia en tu acero antes de enfrentarte a Aurelio.',
        4: 'Incluso en un reino libre, alguien debe vigilar lo que respira bajo la roca.',
        fin: 'Mi yunque oscuro sigue abierto para quienes desciendan al Sanctum del Trono Quebrado.'
      }
    };

    return {
      titulo: 'Crónica de Valdris · El Sol Quebrado',
      subtitulo: 'Campaña épica de 4 Actos · Desde Albaferro hasta el Cráter del Sol Quebrado',
      tituloFinal: 'Libertadores de Valdris',
      sinopsis: 'La Orden del Eclipse envenena las fraguas y rutas de Valdris creando aberraciones con hierro militar. Junto al Herrero Brann y tu compañero leal deberás armarte en secreto, atravesar 3 laberintos, derrotar a 12 Campeones Alfa y desmantelar la conspiración desde Albaferro y Puerto Brisal hasta Ámbar de Dunas y el Cráter del Sol Quebrado.',
      prologo,
      actos,
      capitulos,
      hitos,
      epilogo,
      dialogosNpc
    };
  }

  world.historia = construirHistoriaValdris();

  // Verificación estricta de que los 16 capítulos resuelven 100 % contra este mundo sin fugas ni marcas vacías
  const histStr = JSON.stringify(world.historia);
  assert.ok(!/\bAden\b/i.test(histStr), 'La crónica oficial de Valdris no debe mencionar "Aden"');

  const pTest = Historia.nuevaPrincipal();
  const resueltos = [];
  while (!Historia.terminada(pTest, world)) {
    const o = Historia.asegurarObjetivo(pTest, world);
    assert.ok(o && !/[{}]/.test(o.encargo + o.texto), `Marca sin rellenar en cap ${pTest.paso + 1}`);
    resueltos.push({ paso: pTest.paso + 1, tipo: o.tipo, nombre: o.nombre });
    for (let i = 0; i < o.cantidad; i++) {
      if (o.tipo === 'matar') Historia.registrar(pTest, { tipo: 'matar', zona: o.zona });
      else if (o.tipo === 'jefe') Historia.registrar(pTest, { tipo: 'jefe', zona: o.zona });
      else if (o.tipo === 'visitar') Historia.registrar(pTest, { tipo: 'visitar', pueblo: o.pueblo });
      else if (o.tipo === 'hablar') Historia.registrar(pTest, { tipo: 'hablar', npc: o.npc });
      else if (o.tipo === 'secreto') Historia.registrar(pTest, { tipo: 'secreto', id: o.secretoId, tipoSecreto: o.secretoTipo });
      else Historia.registrar(pTest, { tipo: 'forjar' });
    }
    Historia.completar(pTest, world);
  }
  assert.strictEqual(resueltos.length, 16, 'La campaña de Valdris debe tener 16 capítulos');

  W.validate(world);
  return world;
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const world = build();
  const rootDir = path.join(__dirname, '..');
  const mundosDir = path.join(rootDir, 'mundos');
  fs.mkdirSync(mundosDir, { recursive: true });

  const jsonPath = path.join(mundosDir, 'valdris.mundo.json');
  fs.writeFileSync(jsonPath, JSON.stringify(world, null, 2) + '\n', 'utf8');

  const jsPath = path.join(rootDir, 'js', 'mundo-campana.js');
  const jsContent =
    '/*\n' +
    ' * mundo-campana.js — Mundo oficial de campaña ("Valdris · Tierras del Sol Quebrado")\n' +
    ' * Generado por tools/construir-mundo-oficial.mjs a partir de mundos/valdris.mundo.json.\n' +
    ' * Expone window.MUNDO_OFICIAL y module.exports.\n' +
    ' */\n' +
    '(function (root) {\n' +
    '  "use strict";\n' +
    '  const MUNDO_OFICIAL = ' + JSON.stringify(world) + ';\n' +
    '  function clonarMundoOficial() {\n' +
    '    return JSON.parse(JSON.stringify(MUNDO_OFICIAL));\n' +
    '  }\n' +
    '  MUNDO_OFICIAL.clonar = clonarMundoOficial;\n' +
    '  if (typeof module !== "undefined" && module.exports) module.exports = MUNDO_OFICIAL;\n' +
    '  else { root.MUNDO_OFICIAL = MUNDO_OFICIAL; root.clonarMundoOficial = clonarMundoOficial; }\n' +
    '})(typeof window !== "undefined" ? window : globalThis);\n';
  fs.writeFileSync(jsPath, jsContent, 'utf8');

  console.log('OK - Mundo oficial generado:', world.name);
  console.log('  Pueblos:', world.towns.length, '| Caminos:', world.roads.length, '| Zonas:', world.zones.length, '| Mazmorras:', world.dungeons.length, '| POIs:', world.pois.length, '| Secretos:', world.secretPlaces.length);
  console.log('  Archivos escritos:', jsonPath, 'y', jsPath);
}

export { build };
