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
        style: 'european', terrainType: 'valley', relief: 0.35, seed: 1011, size: 4,
        houseDensity: 0.85, specialCount: 3, maxFloors: 2, roadWidth: 7, curve: 0.25,
        treeDensity: 0.55, hasWalls: true, hasRiver: true, hasMagic: false,
        hasProps: true, hasLamps: true, hasFences: true, casas: 'mixta', time: 'day'
      },
      notes: 'Ciudad forjadora del valle oriental donde resiste el último yunque libre de Brann bajo vigilancia del Consejo del Eclipse.'
    },
    {
      id: 't_2', name: 'Puerto Brisal', x: 300, y: 600, level: 3, isStart: false,
      services: ['posada', 'tienda', 'herrero', 'almacén'],
      cfg: {
        style: 'trade', terrainType: 'plains', relief: 0.25, seed: 2022, size: 3,
        houseDensity: 0.8, specialCount: 2, maxFloors: 2, roadWidth: 7, curve: 0.2,
        treeDensity: 0.35, hasWalls: true, hasRiver: true, hasMagic: false,
        hasProps: true, hasLamps: true, hasFences: true, casas: 'mixta', time: 'day'
      },
      notes: 'Puerto mercante frente a la bahía interior de Valdris, asfixiado por aranceles eclesiales y saqueadores de marea.'
    },
    {
      id: 't_3', name: 'Robledal Sombrío', x: 1150, y: 1850, level: 5, isStart: false,
      services: ['posada', 'tienda', 'herrero'],
      cfg: {
        style: 'frontier', terrainType: 'hills', relief: 0.45, seed: 3033, size: 3,
        houseDensity: 0.72, specialCount: 2, maxFloors: 2, roadWidth: 6, curve: 0.4,
        treeDensity: 0.85, hasWalls: false, hasRiver: true, hasMagic: false,
        hasProps: true, hasLamps: true, hasFences: true, casas: 'madera', time: 'day'
      },
      notes: 'Aldea maderera en el bosque sur. La savia de los robles antiguos sangra gris desde que excavaron la Cripta de las Raíces Negras.'
    },
    {
      id: 't_4', name: 'Limoquieto', x: -500, y: 1750, level: 8, isStart: false,
      services: ['posada', 'tienda', 'herrero', 'almacén'],
      cfg: {
        style: 'frontier', terrainType: 'valley', relief: 0.2, seed: 4044, size: 2,
        houseDensity: 0.65, specialCount: 1, maxFloors: 1, roadWidth: 5.5, curve: 0.35,
        treeDensity: 0.5, hasWalls: false, hasRiver: false, hasMagic: false,
        hasProps: true, hasLamps: true, hasFences: false, casas: 'madera', time: 'sunset'
      },
      notes: 'Enclave palustre entre ciénagas donde desertores y boticarios ocultaron los registros alquímicos de la Orden del Eclipse.'
    },
    {
      id: 't_5', name: 'Ámbar de Dunas', x: 2250, y: -450, level: 11, isStart: false,
      services: ['posada', 'tienda', 'herrero', 'gremio', 'almacén', 'subastas'],
      cfg: {
        style: 'l2_fantasy', terrainType: 'plains', relief: 0.3, seed: 5055, size: 4,
        houseDensity: 0.85, specialCount: 3, maxFloors: 3, roadWidth: 7.5, curve: 0.18,
        treeDensity: 0.18, hasWalls: true, hasRiver: false, hasMagic: true,
        hasProps: true, hasLamps: true, hasFences: false, casas: 'original', time: 'day'
      },
      notes: 'Ciudad caravana del desierto dorado. Aquí se alza el Altar Rúnico que rompe el monopolio comercial del Cónclave a partir de nivel 12.'
    },
    {
      id: 't_6', name: 'Atalaya de Escarcha', x: -2000, y: 400, level: 14, isStart: false,
      services: ['posada', 'tienda', 'herrero', 'gremio', 'almacén'],
      cfg: {
        style: 'fortified', terrainType: 'highlands', relief: 0.55, seed: 6066, size: 3,
        houseDensity: 0.78, specialCount: 2, maxFloors: 2, roadWidth: 6.5, curve: 0.2,
        treeDensity: 0.45, hasWalls: true, hasRiver: false, hasMagic: false,
        hasProps: true, hasLamps: true, hasFences: true, casas: 'mixta', time: 'day'
      },
      notes: 'Bastión boreal de la guardia rebelde entre taigas heladas; contiene las columnas mecanizadas que descienden desde el norte.'
    },
    {
      id: 't_7', name: 'Trono de Ceniza', x: 800, y: -1500, level: 18, isStart: false,
      services: ['posada', 'tienda', 'herrero', 'gremio', 'almacén', 'teletransporte'],
      cfg: {
        style: 'dwarven', terrainType: 'highlands', relief: 0.7, seed: 7077, size: 4,
        houseDensity: 0.82, specialCount: 3, maxFloors: 3, roadWidth: 7, curve: 0.15,
        treeDensity: 0.2, hasWalls: true, hasRiver: false, hasMagic: true,
        hasProps: true, hasLamps: true, hasFences: false, casas: 'original', time: 'night'
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
        { name: 'Salteador de Caminos', level: 3, density: 'baja', boss: false, enemigo: 'outlaw_bandit_cutthroat' }
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
        { name: 'Cortacuellos Renegado', level: 5, density: 'baja', boss: false, enemigo: 'outlaw_bandit_cutthroat' }
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
        { name: 'Ciervo Astado Furioso', level: 6, density: 'media', boss: false, enemigo: 'furious_antler_stag' },
        { name: 'Oso Pardo Salvaje', level: 7, density: 'baja', boss: false, enemigo: 'furious_grizzly_bear' }
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
        { name: 'Lobo Huargo Alfa', level: 8, density: 'baja', boss: false, enemigo: 'dire_wolf' },
        { name: 'Caballero Oscuro de Patrulla', level: 9, density: 'baja', boss: false, enemigo: 'caballero_oscuro' }
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
        { name: 'Troll Regenerador del Cieno', level: 10, density: 'baja', boss: false, enemigo: 'elite_bog_troll_regenerator' }
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
        { name: 'Quimera Mantícora', level: 12, density: 'baja', boss: false, enemigo: 'manticore_chimera' }
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
        { name: 'Djinn del Vacío', level: 14, density: 'baja', boss: false, enemigo: 'void_djinn' }
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
        { name: 'Acechador Wendigo Glacial', level: 15, density: 'baja', boss: false, enemigo: 'df_05_frostbite_wendigo_stalker' }
      ])
    },
    {
      id: 'z_9', name: 'Estribaciones del Ventisquero', roadId: 'r_8', roadT: 0.34, radius: 210, type: 'elite',
      levelMin: 14, levelMax: 17, respawnSec: 26,
      relieve: { activo: false },
      notes: 'Altiplano gélido al noreste de Atalaya de Escarcha donde bestias elementales escoltan convoyes hacia el cráter.',
      monsters: validarEnemigos([
        { name: 'Centauro de Aurora Helada', level: 14, density: 'media', boss: false, enemigo: 'aurora_ice_centaur' },
        { name: 'Grifo de Ventisca Boreal', level: 15, density: 'media', boss: false, enemigo: 'boreal_blizzard_griffin' },
        { name: 'Escorpión de Cristal Glacial', level: 16, density: 'baja', boss: false, enemigo: 'frost_crystal_scorpion' },
        { name: 'Gólem Témpano Ártico', level: 17, density: 'baja', boss: false, enemigo: 'arctic_iceberg_golem' }
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
        { name: 'Behemoth de Obsidiana', level: 18, density: 'baja', boss: false, enemigo: 'df_07_obsidian_behemoth_juggernaut' }
      ])
    },
    {
      id: 'z_11', name: 'Paso del Dragón Blanco', roadId: 'r_8', roadT: 0.72, radius: 220, type: 'caza',
      levelMin: 16, levelMax: 19, respawnSec: 25,
      relieve: { activo: false },
      notes: 'Riscos nevados que conducen al flanco occidental de Trono de Ceniza.',
      monsters: validarEnemigos([
        { name: 'Dientes de Sable Glaciar', level: 16, density: 'alta', boss: false, enemigo: 'df_11_glacier_fangs_sabertooth' },
        { name: 'Guiverno de Escarcha', level: 17, density: 'media', boss: false, enemigo: 'frost_wyrm' },
        { name: 'Fénix Astral de Hielo', level: 18, density: 'baja', boss: false, enemigo: 'astral_frost_phoenix' },
        { name: 'Hidra Tridente Criogénica', level: 19, density: 'baja', boss: false, enemigo: 'cryo_hydra_trident' }
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
      id: 'dun_raices', name: 'Cripta de las Raíces Negras', x: 960, y: 1580, level: 8, rotacion: 0.4,
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
      id: 'dun_sol', name: 'Catacumbas del Sol Enterrado', x: 2030, y: -220, level: 13, rotacion: -0.6,
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
      id: 'dun_eclipse', name: 'Sanctum del Trono Quebrado', x: 980, y: -1310, level: 18, rotacion: 1.1,
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
  // 5. Puntos de Interés (POIs) vinculados a zonas
  // -------------------------------------------------------------------------
  const poiSpecs = [
    { id: 'poi_1', name: 'Campamento de la Fragua Libre', type: 'campamento', zoneId: 'z_1', dx: 65, dy: -55, notes: 'Puesto avanzado de aprendices de Brann que recogen correas y hierros intactos.' },
    { id: 'poi_2', name: 'Faro Hundido de Brisal', type: 'ruinas', zoneId: 'z_2', dx: -70, dy: 50, notes: 'Antigua torre portuaria donde atracaban galeones antes del bloqueo del Cónclave.' },
    { id: 'poi_3', name: 'Veta del Roble Partido', type: 'mina', zoneId: 'z_3', dx: 55, dy: 65, notes: 'Excavación donde la savia del bosque se tiñó de escoria metálica.' },
    { id: 'poi_4', name: 'Mina del Hierro Rojo', type: 'mina', zoneId: 'z_6', dx: -60, dy: -45, notes: 'Cantera libre disputada entre contrabandistas de Albaferro e inquisidores.' },
    { id: 'poi_5', name: 'Santuario del Espejismo', type: 'santuario', zoneId: 'z_7', dx: 70, dy: 55, notes: 'Obelisco solar que antecede a los pactos del Cónclave.' },
    { id: 'poi_6', name: 'Portal de la Escarcha', type: 'portal', zoneId: 'z_9', dx: -55, dy: 60, notes: 'Monolito rúnico boreal usado antaño por los exploradores de Atalaya de Escarcha.' },
    { id: 'poi_7', name: 'Altar de Aurelio', type: 'jefe', zoneId: 'z_12', dx: 45, dy: -40, notes: 'Forja al rojo vivo del Titán del Sol Quebrado.' }
  ];

  world.pois = poiSpecs.map(ps => {
    const z = W.findZone(world, ps.zoneId);
    const x = Math.round(z.x + ps.dx);
    const y = Math.round(z.y + ps.dy);
    assert.ok(!T.isWater(x, y), `POI ${ps.name} en agua`);
    return {
      id: ps.id,
      name: ps.name,
      type: ps.type,
      x,
      y,
      level: z.levelMax + (ps.type === 'jefe' ? 3 : 0),
      zoneId: ps.zoneId,
      dx: ps.dx,
      dy: ps.dy,
      notes: ps.notes
    };
  });

  // -------------------------------------------------------------------------
  // 6. Validar salidas de pueblos, ríos y lugares secretos deterministas
  // -------------------------------------------------------------------------
  W.updateAllExits(world);
  W.calcularRios(world);
  world.secretPlaces = Secretos.generarLugaresSecretos(world);

  // -------------------------------------------------------------------------
  // 7. Generar la historia oficial completa para Valdris
  // -------------------------------------------------------------------------
  world.historia = Historia.generarHistoriaParaMundo(world, {
    nombreMundo: 'Valdris',
    tituloFinal: 'Libertadores de Valdris'
  });
  world.historia.titulo = 'Crónica de Valdris · El Sol Quebrado';
  world.historia.subtitulo = 'Campaña épica de 4 Actos · Desde Albaferro hasta el Cráter del Sol Quebrado';
  world.historia.sinopsis = 'La Orden del Eclipse envenena las fraguas y rutas de Valdris creando aberraciones con hierro militar. Junto al Herrero Brann y tu compañero leal deberás armarte en secreto, atravesar 3 laberintos y desvelar la conspiración desde Puerto Brisal y Robledal Sombrío hasta Ámbar de Dunas y el Cráter del Sol Quebrado.';

  // Verificación de que los 16 capítulos de historia resuelven 100 % contra este mundo
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
