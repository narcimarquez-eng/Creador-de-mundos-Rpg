// Catálogo oficial de Modelos 3D de Monstruos en GLB (glb/monstruos_salon3d)
// Provee resolución de arquetipos con fallback automático a EnemyLib y procedural geométrico.
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CatalogoMonstruosGLB = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const CATEGORIAS_GLB = {
  "dragones": {
    "nombre": "Dragones y Vermis Ancestrales",
    "icono": "🐉"
  },
  "bestias-elite": {
    "nombre": "Bestias de Élite y Cazadores Alfa",
    "icono": "🐺"
  },
  "bestias-fantasia-oscura-aaa-12k-18k": {
    "nombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸"
  },
  "no-muertos": {
    "nombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀"
  },
  "magicos-y-demonios": {
    "nombre": "Entes Mágicos, Abisales y Demonios",
    "icono": "🔮"
  },
  "mitologicos": {
    "nombre": "Criaturas Mitológicas y Colosos",
    "icono": "🏛️"
  },
  "world-of-warcraft": {
    "nombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️"
  },
  "campeones-y-arqueros": {
    "nombre": "Campeones y Arqueros Multirraza",
    "icono": "🏹"
  },
  "elite-nv-1-20": {
    "nombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡"
  },
  "aire-agua-y-hielo": {
    "nombre": "Elementales de Aire, Agua y Hielo",
    "icono": "❄️"
  },
  "animales-nv-1-12-lineage": {
    "nombre": "Fauna Salvaje Lineage Nivel 1-12",
    "icono": "🐗"
  },
  "zonas-iniciales-nv-1-20": {
    "nombre": "Zonas Iniciales y Mazmorras Nv 1-20",
    "icono": "🦇"
  }
};

  const MODELOS_GLB = {
  "enemy-archer-species-11-naga-siren-coralbow": {
    "id": "enemy-archer-species-11-naga-siren-coralbow",
    "nombre": "Naga Siren Coralbow",
    "categoria": "aire-agua-y-hielo",
    "categoriaNombre": "Elementales de Aire, Agua y Hielo",
    "icono": "❄️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/aire-agua-y-hielo/enemy-archer-species-11-naga-siren-coralbow_medium.glb",
    "low": "glb/monstruos_salon3d/low/aire-agua-y-hielo/enemy-archer-species-11-naga-siren-coralbow_low.glb"
  },
  "enemy-archer-species-8-lizardfolk-scale-sniper": {
    "id": "enemy-archer-species-8-lizardfolk-scale-sniper",
    "nombre": "Lizardfolk Scale Sniper",
    "categoria": "aire-agua-y-hielo",
    "categoriaNombre": "Elementales de Aire, Agua y Hielo",
    "icono": "❄️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/aire-agua-y-hielo/enemy-archer-species-8-lizardfolk-scale-sniper_medium.glb",
    "low": "glb/monstruos_salon3d/low/aire-agua-y-hielo/enemy-archer-species-8-lizardfolk-scale-sniper_low.glb"
  },
  "enemy_elem_arctic_golem": {
    "id": "enemy_elem_arctic_golem",
    "nombre": "Arctic Golem",
    "categoria": "aire-agua-y-hielo",
    "categoriaNombre": "Elementales de Aire, Agua y Hielo",
    "icono": "❄️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/aire-agua-y-hielo/enemy_elem_arctic_golem_medium.glb",
    "low": "glb/monstruos_salon3d/low/aire-agua-y-hielo/enemy_elem_arctic_golem_low.glb"
  },
  "enemy_elem_aurora_centaur": {
    "id": "enemy_elem_aurora_centaur",
    "nombre": "Aurora Centaur",
    "categoria": "aire-agua-y-hielo",
    "categoriaNombre": "Elementales de Aire, Agua y Hielo",
    "icono": "❄️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/aire-agua-y-hielo/enemy_elem_aurora_centaur_medium.glb",
    "low": "glb/monstruos_salon3d/low/aire-agua-y-hielo/enemy_elem_aurora_centaur_low.glb"
  },
  "enemy_elem_boreal_griffin": {
    "id": "enemy_elem_boreal_griffin",
    "nombre": "Boreal Griffin",
    "categoria": "aire-agua-y-hielo",
    "categoriaNombre": "Elementales de Aire, Agua y Hielo",
    "icono": "❄️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/aire-agua-y-hielo/enemy_elem_boreal_griffin_medium.glb",
    "low": "glb/monstruos_salon3d/low/aire-agua-y-hielo/enemy_elem_boreal_griffin_low.glb"
  },
  "enemy_elem_coral_serpent": {
    "id": "enemy_elem_coral_serpent",
    "nombre": "Coral Serpent",
    "categoria": "aire-agua-y-hielo",
    "categoriaNombre": "Elementales de Aire, Agua y Hielo",
    "icono": "❄️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/aire-agua-y-hielo/enemy_elem_coral_serpent_medium.glb",
    "low": "glb/monstruos_salon3d/low/aire-agua-y-hielo/enemy_elem_coral_serpent_low.glb"
  },
  "enemy_elem_cryo_hydra": {
    "id": "enemy_elem_cryo_hydra",
    "nombre": "Cryo Hydra",
    "categoria": "aire-agua-y-hielo",
    "categoriaNombre": "Elementales de Aire, Agua y Hielo",
    "icono": "❄️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/aire-agua-y-hielo/enemy_elem_cryo_hydra_medium.glb",
    "low": "glb/monstruos_salon3d/low/aire-agua-y-hielo/enemy_elem_cryo_hydra_low.glb"
  },
  "enemy_elem_cyclone_archon": {
    "id": "enemy_elem_cyclone_archon",
    "nombre": "Cyclone Archon",
    "categoria": "aire-agua-y-hielo",
    "categoriaNombre": "Elementales de Aire, Agua y Hielo",
    "icono": "❄️",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/aire-agua-y-hielo/enemy_elem_cyclone_archon_medium.glb",
    "low": "glb/monstruos_salon3d/low/aire-agua-y-hielo/enemy_elem_cyclone_archon_low.glb"
  },
  "enemy_elem_frost_phoenix": {
    "id": "enemy_elem_frost_phoenix",
    "nombre": "Frost Phoenix",
    "categoria": "aire-agua-y-hielo",
    "categoriaNombre": "Elementales de Aire, Agua y Hielo",
    "icono": "❄️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/aire-agua-y-hielo/enemy_elem_frost_phoenix_medium.glb",
    "low": "glb/monstruos_salon3d/low/aire-agua-y-hielo/enemy_elem_frost_phoenix_low.glb"
  },
  "enemy_elem_frost_scorpion": {
    "id": "enemy_elem_frost_scorpion",
    "nombre": "Frost Scorpion",
    "categoria": "aire-agua-y-hielo",
    "categoriaNombre": "Elementales de Aire, Agua y Hielo",
    "icono": "❄️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/aire-agua-y-hielo/enemy_elem_frost_scorpion_medium.glb",
    "low": "glb/monstruos_salon3d/low/aire-agua-y-hielo/enemy_elem_frost_scorpion_low.glb"
  },
  "enemy_elem_gale_manticore": {
    "id": "enemy_elem_gale_manticore",
    "nombre": "Gale Manticore",
    "categoria": "aire-agua-y-hielo",
    "categoriaNombre": "Elementales de Aire, Agua y Hielo",
    "icono": "❄️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/aire-agua-y-hielo/enemy_elem_gale_manticore_medium.glb",
    "low": "glb/monstruos_salon3d/low/aire-agua-y-hielo/enemy_elem_gale_manticore_low.glb"
  },
  "enemy_elem_glacier_wyrm": {
    "id": "enemy_elem_glacier_wyrm",
    "nombre": "Glacier Wyrm",
    "categoria": "aire-agua-y-hielo",
    "categoriaNombre": "Elementales de Aire, Agua y Hielo",
    "icono": "❄️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/aire-agua-y-hielo/enemy_elem_glacier_wyrm_medium.glb",
    "low": "glb/monstruos_salon3d/low/aire-agua-y-hielo/enemy_elem_glacier_wyrm_low.glb"
  },
  "enemy_elem_hailstorm_stag": {
    "id": "enemy_elem_hailstorm_stag",
    "nombre": "Hailstorm Stag",
    "categoria": "aire-agua-y-hielo",
    "categoriaNombre": "Elementales de Aire, Agua y Hielo",
    "icono": "❄️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/aire-agua-y-hielo/enemy_elem_hailstorm_stag_medium.glb",
    "low": "glb/monstruos_salon3d/low/aire-agua-y-hielo/enemy_elem_hailstorm_stag_low.glb"
  },
  "enemy_elem_kraken_watcher": {
    "id": "enemy_elem_kraken_watcher",
    "nombre": "Kraken Watcher",
    "categoria": "aire-agua-y-hielo",
    "categoriaNombre": "Elementales de Aire, Agua y Hielo",
    "icono": "❄️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/aire-agua-y-hielo/enemy_elem_kraken_watcher_medium.glb",
    "low": "glb/monstruos_salon3d/low/aire-agua-y-hielo/enemy_elem_kraken_watcher_low.glb"
  },
  "enemy_elem_leviathan_abyssal": {
    "id": "enemy_elem_leviathan_abyssal",
    "nombre": "Leviathan Abyssal",
    "categoria": "aire-agua-y-hielo",
    "categoriaNombre": "Elementales de Aire, Agua y Hielo",
    "icono": "❄️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/aire-agua-y-hielo/enemy_elem_leviathan_abyssal_medium.glb",
    "low": "glb/monstruos_salon3d/low/aire-agua-y-hielo/enemy_elem_leviathan_abyssal_low.glb"
  },
  "enemy_elem_permafrost_warg": {
    "id": "enemy_elem_permafrost_warg",
    "nombre": "Permafrost Warg",
    "categoria": "aire-agua-y-hielo",
    "categoriaNombre": "Elementales de Aire, Agua y Hielo",
    "icono": "❄️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/aire-agua-y-hielo/enemy_elem_permafrost_warg_medium.glb",
    "low": "glb/monstruos_salon3d/low/aire-agua-y-hielo/enemy_elem_permafrost_warg_low.glb"
  },
  "enemy_elem_polar_bear": {
    "id": "enemy_elem_polar_bear",
    "nombre": "Polar Bear",
    "categoria": "aire-agua-y-hielo",
    "categoriaNombre": "Elementales de Aire, Agua y Hielo",
    "icono": "❄️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/aire-agua-y-hielo/enemy_elem_polar_bear_medium.glb",
    "low": "glb/monstruos_salon3d/low/aire-agua-y-hielo/enemy_elem_polar_bear_low.glb"
  },
  "enemy_elem_tempest_djinn": {
    "id": "enemy_elem_tempest_djinn",
    "nombre": "Tempest Djinn",
    "categoria": "aire-agua-y-hielo",
    "categoriaNombre": "Elementales de Aire, Agua y Hielo",
    "icono": "❄️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/aire-agua-y-hielo/enemy_elem_tempest_djinn_medium.glb",
    "low": "glb/monstruos_salon3d/low/aire-agua-y-hielo/enemy_elem_tempest_djinn_low.glb"
  },
  "enemy_elem_tidal_naiad": {
    "id": "enemy_elem_tidal_naiad",
    "nombre": "Tidal Naiad",
    "categoria": "aire-agua-y-hielo",
    "categoriaNombre": "Elementales de Aire, Agua y Hielo",
    "icono": "❄️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/aire-agua-y-hielo/enemy_elem_tidal_naiad_medium.glb",
    "low": "glb/monstruos_salon3d/low/aire-agua-y-hielo/enemy_elem_tidal_naiad_low.glb"
  },
  "enemy_elem_triton_warden": {
    "id": "enemy_elem_triton_warden",
    "nombre": "Triton Warden",
    "categoria": "aire-agua-y-hielo",
    "categoriaNombre": "Elementales de Aire, Agua y Hielo",
    "icono": "❄️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/aire-agua-y-hielo/enemy_elem_triton_warden_medium.glb",
    "low": "glb/monstruos_salon3d/low/aire-agua-y-hielo/enemy_elem_triton_warden_low.glb"
  },
  "enemy_elem_valkyrie_gale": {
    "id": "enemy_elem_valkyrie_gale",
    "nombre": "Valkyrie Gale",
    "categoria": "aire-agua-y-hielo",
    "categoriaNombre": "Elementales de Aire, Agua y Hielo",
    "icono": "❄️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/aire-agua-y-hielo/enemy_elem_valkyrie_gale_medium.glb",
    "low": "glb/monstruos_salon3d/low/aire-agua-y-hielo/enemy_elem_valkyrie_gale_low.glb"
  },
  "enemy_elem_zephyr_storm": {
    "id": "enemy_elem_zephyr_storm",
    "nombre": "Zephyr Storm",
    "categoria": "aire-agua-y-hielo",
    "categoriaNombre": "Elementales de Aire, Agua y Hielo",
    "icono": "❄️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/aire-agua-y-hielo/enemy_elem_zephyr_storm_medium.glb",
    "low": "glb/monstruos_salon3d/low/aire-agua-y-hielo/enemy_elem_zephyr_storm_low.glb"
  },
  "enemy_lineage_antler_stag": {
    "id": "enemy_lineage_antler_stag",
    "nombre": "Antler Stag",
    "categoria": "animales-nv-1-12-lineage",
    "categoriaNombre": "Fauna Salvaje Lineage Nivel 1-12",
    "icono": "🐗",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/animales-nv-1-12-lineage/enemy_lineage_antler_stag_medium.glb",
    "low": "glb/monstruos_salon3d/low/animales-nv-1-12-lineage/enemy_lineage_antler_stag_low.glb"
  },
  "enemy_lineage_bloodclaw_hawk": {
    "id": "enemy_lineage_bloodclaw_hawk",
    "nombre": "Bloodclaw Hawk",
    "categoria": "animales-nv-1-12-lineage",
    "categoriaNombre": "Fauna Salvaje Lineage Nivel 1-12",
    "icono": "🐗",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/animales-nv-1-12-lineage/enemy_lineage_bloodclaw_hawk_medium.glb",
    "low": "glb/monstruos_salon3d/low/animales-nv-1-12-lineage/enemy_lineage_bloodclaw_hawk_low.glb"
  },
  "enemy_lineage_forest_spider": {
    "id": "enemy_lineage_forest_spider",
    "nombre": "Forest Spider",
    "categoria": "animales-nv-1-12-lineage",
    "categoriaNombre": "Fauna Salvaje Lineage Nivel 1-12",
    "icono": "🐗",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/animales-nv-1-12-lineage/enemy_lineage_forest_spider_medium.glb",
    "low": "glb/monstruos_salon3d/low/animales-nv-1-12-lineage/enemy_lineage_forest_spider_low.glb"
  },
  "enemy_lineage_furious_grizzly": {
    "id": "enemy_lineage_furious_grizzly",
    "nombre": "Furious Grizzly",
    "categoria": "animales-nv-1-12-lineage",
    "categoriaNombre": "Fauna Salvaje Lineage Nivel 1-12",
    "icono": "🐗",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/animales-nv-1-12-lineage/enemy_lineage_furious_grizzly_medium.glb",
    "low": "glb/monstruos_salon3d/low/animales-nv-1-12-lineage/enemy_lineage_furious_grizzly_low.glb"
  },
  "enemy_lineage_furious_keltir": {
    "id": "enemy_lineage_furious_keltir",
    "nombre": "Furious Keltir",
    "categoria": "animales-nv-1-12-lineage",
    "categoriaNombre": "Fauna Salvaje Lineage Nivel 1-12",
    "icono": "🐗",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/animales-nv-1-12-lineage/enemy_lineage_furious_keltir_medium.glb",
    "low": "glb/monstruos_salon3d/low/animales-nv-1-12-lineage/enemy_lineage_furious_keltir_low.glb"
  },
  "enemy_lineage_rabid_bat": {
    "id": "enemy_lineage_rabid_bat",
    "nombre": "Rabid Bat",
    "categoria": "animales-nv-1-12-lineage",
    "categoriaNombre": "Fauna Salvaje Lineage Nivel 1-12",
    "icono": "🐗",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/animales-nv-1-12-lineage/enemy_lineage_rabid_bat_medium.glb",
    "low": "glb/monstruos_salon3d/low/animales-nv-1-12-lineage/enemy_lineage_rabid_bat_low.glb"
  },
  "enemy_lineage_rabid_wolf": {
    "id": "enemy_lineage_rabid_wolf",
    "nombre": "Rabid Wolf",
    "categoria": "animales-nv-1-12-lineage",
    "categoriaNombre": "Fauna Salvaje Lineage Nivel 1-12",
    "icono": "🐗",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/animales-nv-1-12-lineage/enemy_lineage_rabid_wolf_medium.glb",
    "low": "glb/monstruos_salon3d/low/animales-nv-1-12-lineage/enemy_lineage_rabid_wolf_low.glb"
  },
  "enemy_lineage_razorback_boar": {
    "id": "enemy_lineage_razorback_boar",
    "nombre": "Razorback Boar",
    "categoria": "animales-nv-1-12-lineage",
    "categoriaNombre": "Fauna Salvaje Lineage Nivel 1-12",
    "icono": "🐗",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/animales-nv-1-12-lineage/enemy_lineage_razorback_boar_medium.glb",
    "low": "glb/monstruos_salon3d/low/animales-nv-1-12-lineage/enemy_lineage_razorback_boar_low.glb"
  },
  "enemy_lineage_shadow_panther": {
    "id": "enemy_lineage_shadow_panther",
    "nombre": "Shadow Panther",
    "categoria": "animales-nv-1-12-lineage",
    "categoriaNombre": "Fauna Salvaje Lineage Nivel 1-12",
    "icono": "🐗",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/animales-nv-1-12-lineage/enemy_lineage_shadow_panther_medium.glb",
    "low": "glb/monstruos_salon3d/low/animales-nv-1-12-lineage/enemy_lineage_shadow_panther_low.glb"
  },
  "enemy_lineage_venom_toad": {
    "id": "enemy_lineage_venom_toad",
    "nombre": "Venom Toad",
    "categoria": "animales-nv-1-12-lineage",
    "categoriaNombre": "Fauna Salvaje Lineage Nivel 1-12",
    "icono": "🐗",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/animales-nv-1-12-lineage/enemy_lineage_venom_toad_medium.glb",
    "low": "glb/monstruos_salon3d/low/animales-nv-1-12-lineage/enemy_lineage_venom_toad_low.glb"
  },
  "enemy_brood_spider_queen": {
    "id": "enemy_brood_spider_queen",
    "nombre": "Brood Spider Queen",
    "categoria": "bestias-elite",
    "categoriaNombre": "Bestias de Élite y Cazadores Alfa",
    "icono": "🐺",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/bestias-elite/enemy_brood_spider_queen_medium.glb",
    "low": "glb/monstruos_salon3d/low/bestias-elite/enemy_brood_spider_queen_low.glb"
  },
  "enemy_chitin_stalker": {
    "id": "enemy_chitin_stalker",
    "nombre": "Chitin Stalker",
    "categoria": "bestias-elite",
    "categoriaNombre": "Bestias de Élite y Cazadores Alfa",
    "icono": "🐺",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-elite/enemy_chitin_stalker_medium.glb",
    "low": "glb/monstruos_salon3d/low/bestias-elite/enemy_chitin_stalker_low.glb"
  },
  "enemy_dire_wolf_fenrir": {
    "id": "enemy_dire_wolf_fenrir",
    "nombre": "Dire Wolf Fenrir",
    "categoria": "bestias-elite",
    "categoriaNombre": "Bestias de Élite y Cazadores Alfa",
    "icono": "🐺",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-elite/enemy_dire_wolf_fenrir_medium.glb",
    "low": "glb/monstruos_salon3d/low/bestias-elite/enemy_dire_wolf_fenrir_low.glb"
  },
  "enemy_iron_boar_gorgrond": {
    "id": "enemy_iron_boar_gorgrond",
    "nombre": "Iron Boar Gorgrond",
    "categoria": "bestias-elite",
    "categoriaNombre": "Bestias de Élite y Cazadores Alfa",
    "icono": "🐺",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-elite/enemy_iron_boar_gorgrond_medium.glb",
    "low": "glb/monstruos_salon3d/low/bestias-elite/enemy_iron_boar_gorgrond_low.glb"
  },
  "enemy_runic_warbear": {
    "id": "enemy_runic_warbear",
    "nombre": "Runic Warbear",
    "categoria": "bestias-elite",
    "categoriaNombre": "Bestias de Élite y Cazadores Alfa",
    "icono": "🐺",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-elite/enemy_runic_warbear_medium.glb",
    "low": "glb/monstruos_salon3d/low/bestias-elite/enemy_runic_warbear_low.glb"
  },
  "enemy_sabertooth_raksha": {
    "id": "enemy_sabertooth_raksha",
    "nombre": "Sabertooth Raksha",
    "categoria": "bestias-elite",
    "categoriaNombre": "Bestias de Élite y Cazadores Alfa",
    "icono": "🐺",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-elite/enemy_sabertooth_raksha_medium.glb",
    "low": "glb/monstruos_salon3d/low/bestias-elite/enemy_sabertooth_raksha_low.glb"
  },
  "enemy-archer-species-1-wood-elf-ranger": {
    "id": "enemy-archer-species-1-wood-elf-ranger",
    "nombre": "Wood Elf Ranger",
    "categoria": "campeones-y-arqueros",
    "categoriaNombre": "Campeones y Arqueros Multirraza",
    "icono": "🏹",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/campeones-y-arqueros/enemy-archer-species-1-wood-elf-ranger_medium.glb",
    "low": "glb/monstruos_salon3d/low/campeones-y-arqueros/enemy-archer-species-1-wood-elf-ranger_low.glb"
  },
  "enemy-archer-species-10-worgen-bloodhound-ranger": {
    "id": "enemy-archer-species-10-worgen-bloodhound-ranger",
    "nombre": "Worgen Bloodhound Ranger",
    "categoria": "campeones-y-arqueros",
    "categoriaNombre": "Campeones y Arqueros Multirraza",
    "icono": "🏹",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/campeones-y-arqueros/enemy-archer-species-10-worgen-bloodhound-ranger_medium.glb",
    "low": "glb/monstruos_salon3d/low/campeones-y-arqueros/enemy-archer-species-10-worgen-bloodhound-ranger_low.glb"
  },
  "enemy-archer-species-5-troll-headhunter-bow": {
    "id": "enemy-archer-species-5-troll-headhunter-bow",
    "nombre": "Troll Headhunter Bow",
    "categoria": "campeones-y-arqueros",
    "categoriaNombre": "Campeones y Arqueros Multirraza",
    "icono": "🏹",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/campeones-y-arqueros/enemy-archer-species-5-troll-headhunter-bow_medium.glb",
    "low": "glb/monstruos_salon3d/low/campeones-y-arqueros/enemy-archer-species-5-troll-headhunter-bow_low.glb"
  },
  "enemy-archer-species-9-orc-wolf-master-bowman": {
    "id": "enemy-archer-species-9-orc-wolf-master-bowman",
    "nombre": "Orc Wolf Master Bowman",
    "categoria": "campeones-y-arqueros",
    "categoriaNombre": "Campeones y Arqueros Multirraza",
    "icono": "🏹",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/campeones-y-arqueros/enemy-archer-species-9-orc-wolf-master-bowman_medium.glb",
    "low": "glb/monstruos_salon3d/low/campeones-y-arqueros/enemy-archer-species-9-orc-wolf-master-bowman_low.glb"
  },
  "enemy_abyssal_dreadknight": {
    "id": "enemy_abyssal_dreadknight",
    "nombre": "Abyssal Dreadknight",
    "categoria": "campeones-y-arqueros",
    "categoriaNombre": "Campeones y Arqueros Multirraza",
    "icono": "🏹",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/campeones-y-arqueros/enemy_abyssal_dreadknight_medium.glb",
    "low": "glb/monstruos_salon3d/low/campeones-y-arqueros/enemy_abyssal_dreadknight_low.glb"
  },
  "enemy_anubis_jackal_anpu": {
    "id": "enemy_anubis_jackal_anpu",
    "nombre": "Anubis Jackal Anpu",
    "categoria": "campeones-y-arqueros",
    "categoriaNombre": "Campeones y Arqueros Multirraza",
    "icono": "🏹",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/campeones-y-arqueros/enemy_anubis_jackal_anpu_medium.glb",
    "low": "glb/monstruos_salon3d/low/campeones-y-arqueros/enemy_anubis_jackal_anpu_low.glb"
  },
  "enemy_drake_berserker": {
    "id": "enemy_drake_berserker",
    "nombre": "Drake Berserker",
    "categoria": "campeones-y-arqueros",
    "categoriaNombre": "Campeones y Arqueros Multirraza",
    "icono": "🏹",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/campeones-y-arqueros/enemy_drake_berserker_medium.glb",
    "low": "glb/monstruos_salon3d/low/campeones-y-arqueros/enemy_drake_berserker_low.glb"
  },
  "enemy_samurai_oni_kensei": {
    "id": "enemy_samurai_oni_kensei",
    "nombre": "Samurai Oni Kensei",
    "categoria": "campeones-y-arqueros",
    "categoriaNombre": "Campeones y Arqueros Multirraza",
    "icono": "🏹",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/campeones-y-arqueros/enemy_samurai_oni_kensei_medium.glb",
    "low": "glb/monstruos_salon3d/low/campeones-y-arqueros/enemy_samurai_oni_kensei_low.glb"
  },
  "enemy_solar_valkyrie": {
    "id": "enemy_solar_valkyrie",
    "nombre": "Solar Valkyrie",
    "categoria": "campeones-y-arqueros",
    "categoriaNombre": "Campeones y Arqueros Multirraza",
    "icono": "🏹",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/campeones-y-arqueros/enemy_solar_valkyrie_medium.glb",
    "low": "glb/monstruos_salon3d/low/campeones-y-arqueros/enemy_solar_valkyrie_low.glb"
  },
  "enemy_vampire_lord_valerius": {
    "id": "enemy_vampire_lord_valerius",
    "nombre": "Vampire Lord Valerius",
    "categoria": "campeones-y-arqueros",
    "categoriaNombre": "Campeones y Arqueros Multirraza",
    "icono": "🏹",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/campeones-y-arqueros/enemy_vampire_lord_valerius_medium.glb",
    "low": "glb/monstruos_salon3d/low/campeones-y-arqueros/enemy_vampire_lord_valerius_low.glb"
  },
  "enemy_abyssal_hydra_tiamat": {
    "id": "enemy_abyssal_hydra_tiamat",
    "nombre": "Abyssal Hydra Tiamat",
    "categoria": "dragones",
    "categoriaNombre": "Dragones y Vermis Ancestrales",
    "icono": "🐉",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/dragones/enemy_abyssal_hydra_tiamat_medium.glb",
    "low": "glb/monstruos_salon3d/low/dragones/enemy_abyssal_hydra_tiamat_low.glb"
  },
  "enemy_elder_dragon_ignis": {
    "id": "enemy_elder_dragon_ignis",
    "nombre": "Elder Dragon Ignis",
    "categoria": "dragones",
    "categoriaNombre": "Dragones y Vermis Ancestrales",
    "icono": "🐉",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/dragones/enemy_elder_dragon_ignis_medium.glb",
    "low": "glb/monstruos_salon3d/low/dragones/enemy_elder_dragon_ignis_low.glb"
  },
  "enemy_frost_wyrm_vorthrax": {
    "id": "enemy_frost_wyrm_vorthrax",
    "nombre": "Frost Wyrm Vorthrax",
    "categoria": "dragones",
    "categoriaNombre": "Dragones y Vermis Ancestrales",
    "icono": "🐉",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/dragones/enemy_frost_wyrm_vorthrax_medium.glb",
    "low": "glb/monstruos_salon3d/low/dragones/enemy_frost_wyrm_vorthrax_low.glb"
  },
  "enemy_necrotic_archdragon": {
    "id": "enemy_necrotic_archdragon",
    "nombre": "Necrotic Archdragon",
    "categoria": "dragones",
    "categoriaNombre": "Dragones y Vermis Ancestrales",
    "icono": "🐉",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/dragones/enemy_necrotic_archdragon_medium.glb",
    "low": "glb/monstruos_salon3d/low/dragones/enemy_necrotic_archdragon_low.glb"
  },
  "enemy_storm_drake_voltaris": {
    "id": "enemy_storm_drake_voltaris",
    "nombre": "Storm Drake Voltaris",
    "categoria": "dragones",
    "categoriaNombre": "Dragones y Vermis Ancestrales",
    "icono": "🐉",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/dragones/enemy_storm_drake_voltaris_medium.glb",
    "low": "glb/monstruos_salon3d/low/dragones/enemy_storm_drake_voltaris_low.glb"
  },
  "enemy-archer-species-4-gnoll-poacher-archer": {
    "id": "enemy-archer-species-4-gnoll-poacher-archer",
    "nombre": "Gnoll Poacher Archer",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-archer-species-4-gnoll-poacher-archer_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-archer-species-4-gnoll-poacher-archer_low.glb"
  },
  "enemy-elite-abyssal-angler-lurker": {
    "id": "enemy-elite-abyssal-angler-lurker",
    "nombre": "Abyssal Angler Lurker",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-abyssal-angler-lurker_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-abyssal-angler-lurker_low.glb"
  },
  "enemy-elite-ancient-raptor-skeleton": {
    "id": "enemy-elite-ancient-raptor-skeleton",
    "nombre": "Ancient Raptor Skeleton",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-ancient-raptor-skeleton_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-ancient-raptor-skeleton_low.glb"
  },
  "enemy-elite-armored-pangolin-roller": {
    "id": "enemy-elite-armored-pangolin-roller",
    "nombre": "Armored Pangolin Roller",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-armored-pangolin-roller_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-armored-pangolin-roller_low.glb"
  },
  "enemy-elite-bloodmane-mandrill": {
    "id": "enemy-elite-bloodmane-mandrill",
    "nombre": "Bloodmane Mandrill",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-bloodmane-mandrill_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-bloodmane-mandrill_low.glb"
  },
  "enemy-elite-bog-troll-regenerator": {
    "id": "enemy-elite-bog-troll-regenerator",
    "nombre": "Bog Troll Regenerator",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-bog-troll-regenerator_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-bog-troll-regenerator_low.glb"
  },
  "enemy-elite-bone-scorpion-construct": {
    "id": "enemy-elite-bone-scorpion-construct",
    "nombre": "Bone Scorpion Construct",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-bone-scorpion-construct_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-bone-scorpion-construct_low.glb"
  },
  "enemy-elite-caged-rib-jailer-skeleton": {
    "id": "enemy-elite-caged-rib-jailer-skeleton",
    "nombre": "Caged Rib Jailer Skeleton",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-caged-rib-jailer-skeleton_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-caged-rib-jailer-skeleton_low.glb"
  },
  "enemy-elite-casqued-chameleon-stalker": {
    "id": "enemy-elite-casqued-chameleon-stalker",
    "nombre": "Casqued Chameleon Stalker",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-casqued-chameleon-stalker_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-casqued-chameleon-stalker_low.glb"
  },
  "enemy-elite-centaur-steppe-khan": {
    "id": "enemy-elite-centaur-steppe-khan",
    "nombre": "Centaur Steppe Khan",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-centaur-steppe-khan_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-centaur-steppe-khan_low.glb"
  },
  "enemy-elite-clubtail-ankylo-drake": {
    "id": "enemy-elite-clubtail-ankylo-drake",
    "nombre": "Clubtail Ankylo Drake",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-clubtail-ankylo-drake_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-clubtail-ankylo-drake_low.glb"
  },
  "enemy-elite-crest-pterosaur-skydrake": {
    "id": "enemy-elite-crest-pterosaur-skydrake",
    "nombre": "Crest Pterosaur Skydrake",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-crest-pterosaur-skydrake_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-crest-pterosaur-skydrake_low.glb"
  },
  "enemy-elite-crimson-wyvern-matriarch": {
    "id": "enemy-elite-crimson-wyvern-matriarch",
    "nombre": "Crimson Wyvern Matriarch",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-crimson-wyvern-matriarch_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-crimson-wyvern-matriarch_low.glb"
  },
  "enemy-elite-crypt-stalker-bone-spider": {
    "id": "enemy-elite-crypt-stalker-bone-spider",
    "nombre": "Crypt Stalker Bone Spider",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-crypt-stalker-bone-spider_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-crypt-stalker-bone-spider_low.glb"
  },
  "enemy-elite-dire-wolf-bone-alpha": {
    "id": "enemy-elite-dire-wolf-bone-alpha",
    "nombre": "Dire Wolf Bone Alpha",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-dire-wolf-bone-alpha_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-dire-wolf-bone-alpha_low.glb"
  },
  "enemy-elite-four-armed-bone-reaver": {
    "id": "enemy-elite-four-armed-bone-reaver",
    "nombre": "Four Armed Bone Reaver",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-four-armed-bone-reaver_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-four-armed-bone-reaver_low.glb"
  },
  "enemy-elite-frilled-venom-basilisk": {
    "id": "enemy-elite-frilled-venom-basilisk",
    "nombre": "Frilled Venom Basilisk",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-frilled-venom-basilisk_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-frilled-venom-basilisk_low.glb"
  },
  "enemy-elite-fungal-myconid-colossus": {
    "id": "enemy-elite-fungal-myconid-colossus",
    "nombre": "Fungal Myconid Colossus",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-fungal-myconid-colossus_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-fungal-myconid-colossus_low.glb"
  },
  "enemy-elite-glacial-plesio-drake": {
    "id": "enemy-elite-glacial-plesio-drake",
    "nombre": "Glacial Plesio Drake",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-glacial-plesio-drake_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-glacial-plesio-drake_low.glb"
  },
  "enemy-elite-glacier-wolverine-fiend": {
    "id": "enemy-elite-glacier-wolverine-fiend",
    "nombre": "Glacier Wolverine Fiend",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-glacier-wolverine-fiend_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-glacier-wolverine-fiend_low.glb"
  },
  "enemy-elite-goblin-wolf-rider-boss": {
    "id": "enemy-elite-goblin-wolf-rider-boss",
    "nombre": "Goblin Wolf Rider Boss",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-goblin-wolf-rider-boss_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-goblin-wolf-rider-boss_low.glb"
  },
  "enemy-elite-great-antler-moose": {
    "id": "enemy-elite-great-antler-moose",
    "nombre": "Great Antler Moose",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-great-antler-moose_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-great-antler-moose_low.glb"
  },
  "enemy-elite-harpy-storm-matriarch": {
    "id": "enemy-elite-harpy-storm-matriarch",
    "nombre": "Harpy Storm Matriarch",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-harpy-storm-matriarch_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-harpy-storm-matriarch_low.glb"
  },
  "enemy-elite-hobgoblin-iron-warmonger": {
    "id": "enemy-elite-hobgoblin-iron-warmonger",
    "nombre": "Hobgoblin Iron Warmonger",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-hobgoblin-iron-warmonger_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-hobgoblin-iron-warmonger_low.glb"
  },
  "enemy-elite-hooded-king-cobra": {
    "id": "enemy-elite-hooded-king-cobra",
    "nombre": "Hooded King Cobra",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-hooded-king-cobra_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-hooded-king-cobra_low.glb"
  },
  "enemy-elite-horned-minotaur-skeleton": {
    "id": "enemy-elite-horned-minotaur-skeleton",
    "nombre": "Horned Minotaur Skeleton",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-horned-minotaur-skeleton_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-horned-minotaur-skeleton_low.glb"
  },
  "enemy-elite-ironhorn-rhino-beast": {
    "id": "enemy-elite-ironhorn-rhino-beast",
    "nombre": "Ironhorn Rhino Beast",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-ironhorn-rhino-beast_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-ironhorn-rhino-beast_low.glb"
  },
  "enemy-elite-komodo-monitor-ravager": {
    "id": "enemy-elite-komodo-monitor-ravager",
    "nombre": "Komodo Monitor Ravager",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-komodo-monitor-ravager_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-komodo-monitor-ravager_low.glb"
  },
  "enemy-elite-mammoth-ossuary-behemoth": {
    "id": "enemy-elite-mammoth-ossuary-behemoth",
    "nombre": "Mammoth Ossuary Behemoth",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-mammoth-ossuary-behemoth_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-mammoth-ossuary-behemoth_low.glb"
  },
  "enemy-elite-marsupial-claw-ripper": {
    "id": "enemy-elite-marsupial-claw-ripper",
    "nombre": "Marsupial Claw Ripper",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-marsupial-claw-ripper_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-marsupial-claw-ripper_low.glb"
  },
  "enemy-elite-ogre-two-headed-mauler": {
    "id": "enemy-elite-ogre-two-headed-mauler",
    "nombre": "Ogre Two Headed Mauler",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-ogre-two-headed-mauler_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-ogre-two-headed-mauler_low.glb"
  },
  "enemy-elite-pirate-captain-skeleton": {
    "id": "enemy-elite-pirate-captain-skeleton",
    "nombre": "Pirate Captain Skeleton",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-pirate-captain-skeleton_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-pirate-captain-skeleton_low.glb"
  },
  "enemy-elite-plague-doctor-lich-skeleton": {
    "id": "enemy-elite-plague-doctor-lich-skeleton",
    "nombre": "Plague Doctor Lich Skeleton",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-plague-doctor-lich-skeleton_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-plague-doctor-lich-skeleton_low.glb"
  },
  "enemy-elite-quillback-porcupine": {
    "id": "enemy-elite-quillback-porcupine",
    "nombre": "Quillback Porcupine",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-quillback-porcupine_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-quillback-porcupine_low.glb"
  },
  "enemy-elite-saber-prowler-leopard": {
    "id": "enemy-elite-saber-prowler-leopard",
    "nombre": "Saber Prowler Leopard",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-saber-prowler-leopard_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-saber-prowler-leopard_low.glb"
  },
  "enemy-elite-sabertooth-skull-stalker": {
    "id": "enemy-elite-sabertooth-skull-stalker",
    "nombre": "Sabertooth Skull Stalker",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-sabertooth-skull-stalker_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-sabertooth-skull-stalker_low.glb"
  },
  "enemy-elite-salamander-magma-spearman": {
    "id": "enemy-elite-salamander-magma-spearman",
    "nombre": "Salamander Magma Spearman",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-salamander-magma-spearman_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-salamander-magma-spearman_low.glb"
  },
  "enemy-elite-satyr-bloodhorn-shaman": {
    "id": "enemy-elite-satyr-bloodhorn-shaman",
    "nombre": "Satyr Bloodhorn Shaman",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-satyr-bloodhorn-shaman_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-satyr-bloodhorn-shaman_low.glb"
  },
  "enemy-elite-shadow-maned-lion": {
    "id": "enemy-elite-shadow-maned-lion",
    "nombre": "Shadow Maned Lion",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-shadow-maned-lion_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-shadow-maned-lion_low.glb"
  },
  "enemy-elite-silverback-ape": {
    "id": "enemy-elite-silverback-ape",
    "nombre": "Silverback Ape",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-silverback-ape_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-silverback-ape_low.glb"
  },
  "enemy-elite-snapping-chelonian-tortoise": {
    "id": "enemy-elite-snapping-chelonian-tortoise",
    "nombre": "Snapping Chelonian Tortoise",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-snapping-chelonian-tortoise_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-snapping-chelonian-tortoise_low.glb"
  },
  "enemy-elite-spiked-wheel-bone-martyr": {
    "id": "enemy-elite-spiked-wheel-bone-martyr",
    "nombre": "Spiked Wheel Bone Martyr",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-spiked-wheel-bone-martyr_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-spiked-wheel-bone-martyr_low.glb"
  },
  "enemy-elite-spitting-salamander-drake": {
    "id": "enemy-elite-spitting-salamander-drake",
    "nombre": "Spitting Salamander Drake",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-spitting-salamander-drake_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-spitting-salamander-drake_low.glb"
  },
  "enemy-elite-steppe-dire-jackal": {
    "id": "enemy-elite-steppe-dire-jackal",
    "nombre": "Steppe Dire Jackal",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-steppe-dire-jackal_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-steppe-dire-jackal_low.glb"
  },
  "enemy-elite-swamp-alligator-snapper": {
    "id": "enemy-elite-swamp-alligator-snapper",
    "nombre": "Swamp Alligator Snapper",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-swamp-alligator-snapper_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-swamp-alligator-snapper_low.glb"
  },
  "enemy-elite-thorny-devil-moloch": {
    "id": "enemy-elite-thorny-devil-moloch",
    "nombre": "Thorny Devil Moloch",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-thorny-devil-moloch_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-thorny-devil-moloch_low.glb"
  },
  "enemy-elite-three-tailed-kitsune-fox": {
    "id": "enemy-elite-three-tailed-kitsune-fox",
    "nombre": "Three Tailed Kitsune Fox",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-three-tailed-kitsune-fox_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-three-tailed-kitsune-fox_low.glb"
  },
  "enemy-elite-thunderhoof-bison": {
    "id": "enemy-elite-thunderhoof-bison",
    "nombre": "Thunderhoof Bison",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-thunderhoof-bison_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-thunderhoof-bison_low.glb"
  },
  "enemy-elite-twin-head-amphisbaena": {
    "id": "enemy-elite-twin-head-amphisbaena",
    "nombre": "Twin Head Amphisbaena",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-twin-head-amphisbaena_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-twin-head-amphisbaena_low.glb"
  },
  "enemy-elite-twin-skull-ettin-skeleton": {
    "id": "enemy-elite-twin-skull-ettin-skeleton",
    "nombre": "Twin Skull Ettin Skeleton",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-twin-skull-ettin-skeleton_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-twin-skull-ettin-skeleton_low.glb"
  },
  "enemy-elite-wendigo-antler-fiend": {
    "id": "enemy-elite-wendigo-antler-fiend",
    "nombre": "Wendigo Antler Fiend",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-wendigo-antler-fiend_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-wendigo-antler-fiend_low.glb"
  },
  "enemy-elite-winged-gargoyle-skeleton": {
    "id": "enemy-elite-winged-gargoyle-skeleton",
    "nombre": "Winged Gargoyle Skeleton",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-winged-gargoyle-skeleton_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-winged-gargoyle-skeleton_low.glb"
  },
  "enemy-elite-woolly-mammoth-calf": {
    "id": "enemy-elite-woolly-mammoth-calf",
    "nombre": "Woolly Mammoth Calf",
    "categoria": "elite-nv-1-20",
    "categoriaNombre": "Criaturas Élite Nivel 1-20",
    "icono": "⚡",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/elite-nv-1-20/enemy-elite-woolly-mammoth-calf_medium.glb",
    "low": "glb/monstruos_salon3d/low/elite-nv-1-20/enemy-elite-woolly-mammoth-calf_low.glb"
  },
  "enemy-archer-species-14-draenei-crystal-vindicator-bow": {
    "id": "enemy-archer-species-14-draenei-crystal-vindicator-bow",
    "nombre": "Draenei Crystal Vindicator Bow",
    "categoria": "magicos-y-demonios",
    "categoriaNombre": "Entes Mágicos, Abisales y Demonios",
    "icono": "🔮",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/magicos-y-demonios/enemy-archer-species-14-draenei-crystal-vindicator-bow_medium.glb",
    "low": "glb/monstruos_salon3d/low/magicos-y-demonios/enemy-archer-species-14-draenei-crystal-vindicator-bow_low.glb"
  },
  "enemy-archer-species-15-astral-djinn-starbow": {
    "id": "enemy-archer-species-15-astral-djinn-starbow",
    "nombre": "Astral Djinn Starbow",
    "categoria": "magicos-y-demonios",
    "categoriaNombre": "Entes Mágicos, Abisales y Demonios",
    "icono": "🔮",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/magicos-y-demonios/enemy-archer-species-15-astral-djinn-starbow_medium.glb",
    "low": "glb/monstruos_salon3d/low/magicos-y-demonios/enemy-archer-species-15-astral-djinn-starbow_low.glb"
  },
  "enemy_arcane_beholder": {
    "id": "enemy_arcane_beholder",
    "nombre": "Arcane Beholder",
    "categoria": "magicos-y-demonios",
    "categoriaNombre": "Entes Mágicos, Abisales y Demonios",
    "icono": "🔮",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/magicos-y-demonios/enemy_arcane_beholder_medium.glb",
    "low": "glb/monstruos_salon3d/low/magicos-y-demonios/enemy_arcane_beholder_low.glb"
  },
  "enemy_arch_lich_velkan": {
    "id": "enemy_arch_lich_velkan",
    "nombre": "Arch Lich Velkan",
    "categoria": "magicos-y-demonios",
    "categoriaNombre": "Entes Mágicos, Abisales y Demonios",
    "icono": "🔮",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/magicos-y-demonios/enemy_arch_lich_velkan_medium.glb",
    "low": "glb/monstruos_salon3d/low/magicos-y-demonios/enemy_arch_lich_velkan_low.glb"
  },
  "enemy_balrog_archdemon": {
    "id": "enemy_balrog_archdemon",
    "nombre": "Balrog Archdemon",
    "categoria": "magicos-y-demonios",
    "categoriaNombre": "Entes Mágicos, Abisales y Demonios",
    "icono": "🔮",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/magicos-y-demonios/enemy_balrog_archdemon_medium.glb",
    "low": "glb/monstruos_salon3d/low/magicos-y-demonios/enemy_balrog_archdemon_low.glb"
  },
  "enemy_obsidian_colossus": {
    "id": "enemy_obsidian_colossus",
    "nombre": "Obsidian Colossus",
    "categoria": "magicos-y-demonios",
    "categoriaNombre": "Entes Mágicos, Abisales y Demonios",
    "icono": "🔮",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/magicos-y-demonios/enemy_obsidian_colossus_medium.glb",
    "low": "glb/monstruos_salon3d/low/magicos-y-demonios/enemy_obsidian_colossus_low.glb"
  },
  "enemy_solar_phoenix": {
    "id": "enemy_solar_phoenix",
    "nombre": "Solar Phoenix",
    "categoria": "magicos-y-demonios",
    "categoriaNombre": "Entes Mágicos, Abisales y Demonios",
    "icono": "🔮",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/magicos-y-demonios/enemy_solar_phoenix_medium.glb",
    "low": "glb/monstruos_salon3d/low/magicos-y-demonios/enemy_solar_phoenix_low.glb"
  },
  "enemy_treant_yggdrakor": {
    "id": "enemy_treant_yggdrakor",
    "nombre": "Treant Yggdrakor",
    "categoria": "magicos-y-demonios",
    "categoriaNombre": "Entes Mágicos, Abisales y Demonios",
    "icono": "🔮",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/magicos-y-demonios/enemy_treant_yggdrakor_medium.glb",
    "low": "glb/monstruos_salon3d/low/magicos-y-demonios/enemy_treant_yggdrakor_low.glb"
  },
  "enemy_void_djinn_alzahir": {
    "id": "enemy_void_djinn_alzahir",
    "nombre": "Void Djinn Alzahir",
    "categoria": "magicos-y-demonios",
    "categoriaNombre": "Entes Mágicos, Abisales y Demonios",
    "icono": "🔮",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/magicos-y-demonios/enemy_void_djinn_alzahir_medium.glb",
    "low": "glb/monstruos_salon3d/low/magicos-y-demonios/enemy_void_djinn_alzahir_low.glb"
  },
  "enemy-archer-species-12-mantid-amber-wingbow": {
    "id": "enemy-archer-species-12-mantid-amber-wingbow",
    "nombre": "Mantid Amber Wingbow",
    "categoria": "mitologicos",
    "categoriaNombre": "Criaturas Mitológicas y Colosos",
    "icono": "🏛️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/mitologicos/enemy-archer-species-12-mantid-amber-wingbow_medium.glb",
    "low": "glb/monstruos_salon3d/low/mitologicos/enemy-archer-species-12-mantid-amber-wingbow_low.glb"
  },
  "enemy-archer-species-13-minotaur-greatbow-titan": {
    "id": "enemy-archer-species-13-minotaur-greatbow-titan",
    "nombre": "Minotaur Greatbow Titan",
    "categoria": "mitologicos",
    "categoriaNombre": "Criaturas Mitológicas y Colosos",
    "icono": "🏛️",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/mitologicos/enemy-archer-species-13-minotaur-greatbow-titan_medium.glb",
    "low": "glb/monstruos_salon3d/low/mitologicos/enemy-archer-species-13-minotaur-greatbow-titan_low.glb"
  },
  "enemy-archer-species-6-satyr-felbow-trickster": {
    "id": "enemy-archer-species-6-satyr-felbow-trickster",
    "nombre": "Satyr Felbow Trickster",
    "categoria": "mitologicos",
    "categoriaNombre": "Criaturas Mitológicas y Colosos",
    "icono": "🏛️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/mitologicos/enemy-archer-species-6-satyr-felbow-trickster_medium.glb",
    "low": "glb/monstruos_salon3d/low/mitologicos/enemy-archer-species-6-satyr-felbow-trickster_low.glb"
  },
  "enemy-archer-species-7-centaur-khan-horsebow": {
    "id": "enemy-archer-species-7-centaur-khan-horsebow",
    "nombre": "Centaur Khan Horsebow",
    "categoria": "mitologicos",
    "categoriaNombre": "Criaturas Mitológicas y Colosos",
    "icono": "🏛️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/mitologicos/enemy-archer-species-7-centaur-khan-horsebow_medium.glb",
    "low": "glb/monstruos_salon3d/low/mitologicos/enemy-archer-species-7-centaur-khan-horsebow_low.glb"
  },
  "enemy_astral_centaur": {
    "id": "enemy_astral_centaur",
    "nombre": "Astral Centaur",
    "categoria": "mitologicos",
    "categoriaNombre": "Criaturas Mitológicas y Colosos",
    "icono": "🏛️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/mitologicos/enemy_astral_centaur_medium.glb",
    "low": "glb/monstruos_salon3d/low/mitologicos/enemy_astral_centaur_low.glb"
  },
  "enemy_cerberus_hellhound": {
    "id": "enemy_cerberus_hellhound",
    "nombre": "Cerberus Hellhound",
    "categoria": "mitologicos",
    "categoriaNombre": "Criaturas Mitológicas y Colosos",
    "icono": "🏛️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/mitologicos/enemy_cerberus_hellhound_medium.glb",
    "low": "glb/monstruos_salon3d/low/mitologicos/enemy_cerberus_hellhound_low.glb"
  },
  "enemy_gorgon_medusa_euryale": {
    "id": "enemy_gorgon_medusa_euryale",
    "nombre": "Gorgon Medusa Euryale",
    "categoria": "mitologicos",
    "categoriaNombre": "Criaturas Mitológicas y Colosos",
    "icono": "🏛️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/mitologicos/enemy_gorgon_medusa_euryale_medium.glb",
    "low": "glb/monstruos_salon3d/low/mitologicos/enemy_gorgon_medusa_euryale_low.glb"
  },
  "enemy_griffin_skyhunter": {
    "id": "enemy_griffin_skyhunter",
    "nombre": "Griffin Skyhunter",
    "categoria": "mitologicos",
    "categoriaNombre": "Criaturas Mitológicas y Colosos",
    "icono": "🏛️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/mitologicos/enemy_griffin_skyhunter_medium.glb",
    "low": "glb/monstruos_salon3d/low/mitologicos/enemy_griffin_skyhunter_low.glb"
  },
  "enemy_labyrinth_minotaur": {
    "id": "enemy_labyrinth_minotaur",
    "nombre": "Labyrinth Minotaur",
    "categoria": "mitologicos",
    "categoriaNombre": "Criaturas Mitológicas y Colosos",
    "icono": "🏛️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/mitologicos/enemy_labyrinth_minotaur_medium.glb",
    "low": "glb/monstruos_salon3d/low/mitologicos/enemy_labyrinth_minotaur_low.glb"
  },
  "enemy_manticore_chimera": {
    "id": "enemy_manticore_chimera",
    "nombre": "Manticore Chimera",
    "categoria": "mitologicos",
    "categoriaNombre": "Criaturas Mitológicas y Colosos",
    "icono": "🏛️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/mitologicos/enemy_manticore_chimera_medium.glb",
    "low": "glb/monstruos_salon3d/low/mitologicos/enemy_manticore_chimera_low.glb"
  },
  "enemy-abyssal-crown-ossuary-titan": {
    "id": "enemy-abyssal-crown-ossuary-titan",
    "nombre": "Abyssal Crown Ossuary Titan",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-abyssal-crown-ossuary-titan_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-abyssal-crown-ossuary-titan_low.glb"
  },
  "enemy-ashen-crown-executioner-skeleton": {
    "id": "enemy-ashen-crown-executioner-skeleton",
    "nombre": "Ashen Crown Executioner Skeleton",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-ashen-crown-executioner-skeleton_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-ashen-crown-executioner-skeleton_low.glb"
  },
  "enemy-blood-crown-reaper-marquis": {
    "id": "enemy-blood-crown-reaper-marquis",
    "nombre": "Blood Crown Reaper Marquis",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-blood-crown-reaper-marquis_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-blood-crown-reaper-marquis_low.glb"
  },
  "enemy-bone-tiara-oracle-siren": {
    "id": "enemy-bone-tiara-oracle-siren",
    "nombre": "Bone Tiara Oracle Siren",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-bone-tiara-oracle-siren_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-bone-tiara-oracle-siren_low.glb"
  },
  "enemy-bone-viscount-duelist": {
    "id": "enemy-bone-viscount-duelist",
    "nombre": "Bone Viscount Duelist",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-bone-viscount-duelist_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-bone-viscount-duelist_low.glb"
  },
  "enemy-crowned-catacomb-pharaoh": {
    "id": "enemy-crowned-catacomb-pharaoh",
    "nombre": "Crowned Catacomb Pharaoh",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-crowned-catacomb-pharaoh_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-crowned-catacomb-pharaoh_low.glb"
  },
  "enemy-crowned-crypt-inquisitor": {
    "id": "enemy-crowned-crypt-inquisitor",
    "nombre": "Crowned Crypt Inquisitor",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-crowned-crypt-inquisitor_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-crowned-crypt-inquisitor_low.glb"
  },
  "enemy-cursed-diadem-valkyrie-skeleton": {
    "id": "enemy-cursed-diadem-valkyrie-skeleton",
    "nombre": "Cursed Diadem Valkyrie Skeleton",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-cursed-diadem-valkyrie-skeleton_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-cursed-diadem-valkyrie-skeleton_low.glb"
  },
  "enemy-emerald-crown-necromancer-lord": {
    "id": "enemy-emerald-crown-necromancer-lord",
    "nombre": "Emerald Crown Necromancer Lord",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-emerald-crown-necromancer-lord_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-emerald-crown-necromancer-lord_low.glb"
  },
  "enemy-gilded-skull-praetorian": {
    "id": "enemy-gilded-skull-praetorian",
    "nombre": "Gilded Skull Praetorian",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-gilded-skull-praetorian_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-gilded-skull-praetorian_low.glb"
  },
  "enemy-glacial-crown-revenant-king": {
    "id": "enemy-glacial-crown-revenant-king",
    "nombre": "Glacial Crown Revenant King",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-glacial-crown-revenant-king_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-glacial-crown-revenant-king_low.glb"
  },
  "enemy-iron-crown-cataphract-skeleton": {
    "id": "enemy-iron-crown-cataphract-skeleton",
    "nombre": "Iron Crown Cataphract Skeleton",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-iron-crown-cataphract-skeleton_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-iron-crown-cataphract-skeleton_low.glb"
  },
  "enemy-obsidian-crown-dread-skeleton": {
    "id": "enemy-obsidian-crown-dread-skeleton",
    "nombre": "Obsidian Crown Dread Skeleton",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-obsidian-crown-dread-skeleton_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-obsidian-crown-dread-skeleton_low.glb"
  },
  "enemy-ossuary-king-leoric": {
    "id": "enemy-ossuary-king-leoric",
    "nombre": "Ossuary King Leoric",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-ossuary-king-leoric_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-ossuary-king-leoric_low.glb"
  },
  "enemy-skeletal-archbishop-pontiff": {
    "id": "enemy-skeletal-archbishop-pontiff",
    "nombre": "Skeletal Archbishop Pontiff",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-skeletal-archbishop-pontiff_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-skeletal-archbishop-pontiff_low.glb"
  },
  "enemy-skeletal-dragonbone-jarl": {
    "id": "enemy-skeletal-dragonbone-jarl",
    "nombre": "Skeletal Dragonbone Jarl",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-skeletal-dragonbone-jarl_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-skeletal-dragonbone-jarl_low.glb"
  },
  "enemy-skeletal-royal-halberdier": {
    "id": "enemy-skeletal-royal-halberdier",
    "nombre": "Skeletal Royal Halberdier",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-skeletal-royal-halberdier_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-skeletal-royal-halberdier_low.glb"
  },
  "enemy-skeleton-emperor-goldcrown": {
    "id": "enemy-skeleton-emperor-goldcrown",
    "nombre": "Skeleton Emperor Goldcrown",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-skeleton-emperor-goldcrown_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-skeleton-emperor-goldcrown_low.glb"
  },
  "enemy-skeleton-warlord-chariot-knight": {
    "id": "enemy-skeleton-warlord-chariot-knight",
    "nombre": "Skeleton Warlord Chariot Knight",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-skeleton-warlord-chariot-knight_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-skeleton-warlord-chariot-knight_low.glb"
  },
  "enemy-star-crown-astral-lich": {
    "id": "enemy-star-crown-astral-lich",
    "nombre": "Star Crown Astral Lich",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-star-crown-astral-lich_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-star-crown-astral-lich_low.glb"
  },
  "enemy-undead-archer-1-bone-scout": {
    "id": "enemy-undead-archer-1-bone-scout",
    "nombre": "Undead Archer 1 Bone Scout",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-undead-archer-1-bone-scout_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-undead-archer-1-bone-scout_low.glb"
  },
  "enemy-undead-archer-10-lich-deadeye-sovereign": {
    "id": "enemy-undead-archer-10-lich-deadeye-sovereign",
    "nombre": "Undead Archer 10 Lich Deadeye Sovereign",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-undead-archer-10-lich-deadeye-sovereign_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-undead-archer-10-lich-deadeye-sovereign_low.glb"
  },
  "enemy-undead-archer-2-barrow-bowman": {
    "id": "enemy-undead-archer-2-barrow-bowman",
    "nombre": "Undead Archer 2 Barrow Bowman",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-undead-archer-2-barrow-bowman_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-undead-archer-2-barrow-bowman_low.glb"
  },
  "enemy-undead-archer-3-poison-rib-hunter": {
    "id": "enemy-undead-archer-3-poison-rib-hunter",
    "nombre": "Undead Archer 3 Poison Rib Hunter",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-undead-archer-3-poison-rib-hunter_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-undead-archer-3-poison-rib-hunter_low.glb"
  },
  "enemy-undead-archer-4-watchtower-longbow": {
    "id": "enemy-undead-archer-4-watchtower-longbow",
    "nombre": "Undead Archer 4 Watchtower Longbow",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-undead-archer-4-watchtower-longbow_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-undead-archer-4-watchtower-longbow_low.glb"
  },
  "enemy-undead-archer-5-frostbone-ranger": {
    "id": "enemy-undead-archer-5-frostbone-ranger",
    "nombre": "Undead Archer 5 Frostbone Ranger",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-undead-archer-5-frostbone-ranger_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-undead-archer-5-frostbone-ranger_low.glb"
  },
  "enemy-undead-archer-6-hellfire-ash-marksman": {
    "id": "enemy-undead-archer-6-hellfire-ash-marksman",
    "nombre": "Undead Archer 6 Hellfire Ash Marksman",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-undead-archer-6-hellfire-ash-marksman_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-undead-archer-6-hellfire-ash-marksman_low.glb"
  },
  "enemy-undead-archer-7-catacomb-sniper-captain": {
    "id": "enemy-undead-archer-7-catacomb-sniper-captain",
    "nombre": "Undead Archer 7 Catacomb Sniper Captain",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-undead-archer-7-catacomb-sniper-captain_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-undead-archer-7-catacomb-sniper-captain_low.glb"
  },
  "enemy-undead-archer-8-abyssal-soul-bowman": {
    "id": "enemy-undead-archer-8-abyssal-soul-bowman",
    "nombre": "Undead Archer 8 Abyssal Soul Bowman",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-undead-archer-8-abyssal-soul-bowman_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-undead-archer-8-abyssal-soul-bowman_low.glb"
  },
  "enemy-undead-archer-9-royal-ossuary-greatbow": {
    "id": "enemy-undead-archer-9-royal-ossuary-greatbow",
    "nombre": "Undead Archer 9 Royal Ossuary Greatbow",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy-undead-archer-9-royal-ossuary-greatbow_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy-undead-archer-9-royal-ossuary-greatbow_low.glb"
  },
  "enemy_undead_ash_naga": {
    "id": "enemy_undead_ash_naga",
    "nombre": "Undead Ash Naga",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy_undead_ash_naga_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy_undead_ash_naga_low.glb"
  },
  "enemy_undead_banshee_queen": {
    "id": "enemy_undead_banshee_queen",
    "nombre": "Undead Banshee Queen",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy_undead_banshee_queen_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy_undead_banshee_queen_low.glb"
  },
  "enemy_undead_crypt_cerberus": {
    "id": "enemy_undead_crypt_cerberus",
    "nombre": "Undead Crypt Cerberus",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy_undead_crypt_cerberus_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy_undead_crypt_cerberus_low.glb"
  },
  "enemy_undead_death_knight": {
    "id": "enemy_undead_death_knight",
    "nombre": "Undead Death Knight",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy_undead_death_knight_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy_undead_death_knight_low.glb"
  },
  "enemy_undead_embalmed_sentinel": {
    "id": "enemy_undead_embalmed_sentinel",
    "nombre": "Undead Embalmed Sentinel",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy_undead_embalmed_sentinel_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy_undead_embalmed_sentinel_low.glb"
  },
  "enemy_undead_fallen_valkyrie": {
    "id": "enemy_undead_fallen_valkyrie",
    "nombre": "Undead Fallen Valkyrie",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy_undead_fallen_valkyrie_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy_undead_fallen_valkyrie_low.glb"
  },
  "enemy_undead_flayed_centaur": {
    "id": "enemy_undead_flayed_centaur",
    "nombre": "Undead Flayed Centaur",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy_undead_flayed_centaur_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy_undead_flayed_centaur_low.glb"
  },
  "enemy_undead_flesh_abomination": {
    "id": "enemy_undead_flesh_abomination",
    "nombre": "Undead Flesh Abomination",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy_undead_flesh_abomination_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy_undead_flesh_abomination_low.glb"
  },
  "enemy_undead_lich_king": {
    "id": "enemy_undead_lich_king",
    "nombre": "Undead Lich King",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy_undead_lich_king_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy_undead_lich_king_low.glb"
  },
  "enemy_undead_necro_arachnid": {
    "id": "enemy_undead_necro_arachnid",
    "nombre": "Undead Necro Arachnid",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy_undead_necro_arachnid_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy_undead_necro_arachnid_low.glb"
  },
  "enemy_undead_nosferatu_elder": {
    "id": "enemy_undead_nosferatu_elder",
    "nombre": "Undead Nosferatu Elder",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy_undead_nosferatu_elder_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy_undead_nosferatu_elder_low.glb"
  },
  "enemy_undead_ossuary_minotaur": {
    "id": "enemy_undead_ossuary_minotaur",
    "nombre": "Undead Ossuary Minotaur",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy_undead_ossuary_minotaur_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy_undead_ossuary_minotaur_low.glb"
  },
  "enemy_undead_phantom_boar": {
    "id": "enemy_undead_phantom_boar",
    "nombre": "Undead Phantom Boar",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy_undead_phantom_boar_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy_undead_phantom_boar_low.glb"
  },
  "enemy_undead_plague_dragon": {
    "id": "enemy_undead_plague_dragon",
    "nombre": "Undead Plague Dragon",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy_undead_plague_dragon_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy_undead_plague_dragon_low.glb"
  },
  "enemy_undead_plague_mummy": {
    "id": "enemy_undead_plague_mummy",
    "nombre": "Undead Plague Mummy",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy_undead_plague_mummy_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy_undead_plague_mummy_low.glb"
  },
  "enemy_undead_putrid_hydra": {
    "id": "enemy_undead_putrid_hydra",
    "nombre": "Undead Putrid Hydra",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy_undead_putrid_hydra_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy_undead_putrid_hydra_low.glb"
  },
  "enemy_undead_skeleton_berserker": {
    "id": "enemy_undead_skeleton_berserker",
    "nombre": "Undead Skeleton Berserker",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy_undead_skeleton_berserker_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy_undead_skeleton_berserker_low.glb"
  },
  "enemy_undead_skull_tyrant": {
    "id": "enemy_undead_skull_tyrant",
    "nombre": "Undead Skull Tyrant",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy_undead_skull_tyrant_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy_undead_skull_tyrant_low.glb"
  },
  "enemy_undead_stitched_chimera": {
    "id": "enemy_undead_stitched_chimera",
    "nombre": "Undead Stitched Chimera",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy_undead_stitched_chimera_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy_undead_stitched_chimera_low.glb"
  },
  "enemy_undead_wraith_reaper": {
    "id": "enemy_undead_wraith_reaper",
    "nombre": "Undead Wraith Reaper",
    "categoria": "no-muertos",
    "categoriaNombre": "Huestes No-Muertas y Señores de la Tumba",
    "icono": "💀",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/no-muertos/enemy_undead_wraith_reaper_medium.glb",
    "low": "glb/monstruos_salon3d/low/no-muertos/enemy_undead_wraith_reaper_low.glb"
  },
  "enemy-wow-abomination-patchwerk": {
    "id": "enemy-wow-abomination-patchwerk",
    "nombre": "Abomination Patchwerk",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-abomination-patchwerk_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-abomination-patchwerk_low.glb"
  },
  "enemy-wow-alakir-windlord": {
    "id": "enemy-wow-alakir-windlord",
    "nombre": "Alakir Windlord",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-alakir-windlord_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-alakir-windlord_low.glb"
  },
  "enemy-wow-alalor-void-walker": {
    "id": "enemy-wow-alalor-void-walker",
    "nombre": "Alalor Void Walker",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-alalor-void-walker_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-alalor-void-walker_low.glb"
  },
  "enemy-wow-anubarak-crypt-lord": {
    "id": "enemy-wow-anubarak-crypt-lord",
    "nombre": "Anubarak Crypt Lord",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-anubarak-crypt-lord_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-anubarak-crypt-lord_low.glb"
  },
  "enemy-wow-archimonde-eredar-warlock": {
    "id": "enemy-wow-archimonde-eredar-warlock",
    "nombre": "Archimonde Eredar Warlock",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-archimonde-eredar-warlock_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-archimonde-eredar-warlock_low.glb"
  },
  "enemy-wow-arthas-lich-king": {
    "id": "enemy-wow-arthas-lich-king",
    "nombre": "Arthas Lich King",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-arthas-lich-king_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-arthas-lich-king_low.glb"
  },
  "enemy-wow-banshee-dark-ranger-queen": {
    "id": "enemy-wow-banshee-dark-ranger-queen",
    "nombre": "Banshee Dark Ranger Queen",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-banshee-dark-ranger-queen_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-banshee-dark-ranger-queen_low.glb"
  },
  "enemy-wow-blood-elf-spellbreaker": {
    "id": "enemy-wow-blood-elf-spellbreaker",
    "nombre": "Blood Elf Spellbreaker",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-blood-elf-spellbreaker_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-blood-elf-spellbreaker_low.glb"
  },
  "enemy-wow-centaur-kolkar-marauder": {
    "id": "enemy-wow-centaur-kolkar-marauder",
    "nombre": "Centaur Kolkar Marauder",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-centaur-kolkar-marauder_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-centaur-kolkar-marauder_low.glb"
  },
  "enemy-wow-chromaggus-chromatic-drake": {
    "id": "enemy-wow-chromaggus-chromatic-drake",
    "nombre": "Chromaggus Chromatic Drake",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-chromaggus-chromatic-drake_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-chromaggus-chromatic-drake_low.glb"
  },
  "enemy-wow-core-hound-magmadar": {
    "id": "enemy-wow-core-hound-magmadar",
    "nombre": "Core Hound Magmadar",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-core-hound-magmadar_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-core-hound-magmadar_low.glb"
  },
  "enemy-wow-cthun-old-god-eye": {
    "id": "enemy-wow-cthun-old-god-eye",
    "nombre": "Cthun Old God Eye",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-cthun-old-god-eye_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-cthun-old-god-eye_low.glb"
  },
  "enemy-wow-death-knight-ebon-blade": {
    "id": "enemy-wow-death-knight-ebon-blade",
    "nombre": "Death Knight Ebon Blade",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-death-knight-ebon-blade_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-death-knight-ebon-blade_low.glb"
  },
  "enemy-wow-deathwing-cataclysm-aspect": {
    "id": "enemy-wow-deathwing-cataclysm-aspect",
    "nombre": "Deathwing Cataclysm Aspect",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-deathwing-cataclysm-aspect_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-deathwing-cataclysm-aspect_low.glb"
  },
  "enemy-wow-defias-pillager-bandit": {
    "id": "enemy-wow-defias-pillager-bandit",
    "nombre": "Defias Pillager Bandit",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-defias-pillager-bandit_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-defias-pillager-bandit_low.glb"
  },
  "enemy-wow-devilsaur-king-mosh": {
    "id": "enemy-wow-devilsaur-king-mosh",
    "nombre": "Devilsaur King Mosh",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-devilsaur-king-mosh_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-devilsaur-king-mosh_low.glb"
  },
  "enemy-wow-doomguard-fel-enforcer": {
    "id": "enemy-wow-doomguard-fel-enforcer",
    "nombre": "Doomguard Fel Enforcer",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-doomguard-fel-enforcer_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-doomguard-fel-enforcer_low.glb"
  },
  "enemy-wow-draenei-vindicator-paladin": {
    "id": "enemy-wow-draenei-vindicator-paladin",
    "nombre": "Draenei Vindicator Paladin",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-draenei-vindicator-paladin_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-draenei-vindicator-paladin_low.glb"
  },
  "enemy-wow-dwarven-mountain-king": {
    "id": "enemy-wow-dwarven-mountain-king",
    "nombre": "Dwarven Mountain King",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-dwarven-mountain-king_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-dwarven-mountain-king_low.glb"
  },
  "enemy-wow-faceless-kthir-general": {
    "id": "enemy-wow-faceless-kthir-general",
    "nombre": "Faceless Kthir General",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-faceless-kthir-general_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-faceless-kthir-general_low.glb"
  },
  "enemy-wow-fel-reaver-construct": {
    "id": "enemy-wow-fel-reaver-construct",
    "nombre": "Fel Reaver Construct",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-fel-reaver-construct_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-fel-reaver-construct_low.glb"
  },
  "enemy-wow-felguard-legion-axeman": {
    "id": "enemy-wow-felguard-legion-axeman",
    "nombre": "Felguard Legion Axeman",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-felguard-legion-axeman_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-felguard-legion-axeman_low.glb"
  },
  "enemy-wow-felhound-mana-stalker": {
    "id": "enemy-wow-felhound-mana-stalker",
    "nombre": "Felhound Mana Stalker",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-felhound-mana-stalker_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-felhound-mana-stalker_low.glb"
  },
  "enemy-wow-forsaken-royal-apothecary": {
    "id": "enemy-wow-forsaken-royal-apothecary",
    "nombre": "Forsaken Royal Apothecary",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-forsaken-royal-apothecary_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-forsaken-royal-apothecary_low.glb"
  },
  "enemy-wow-frostsaber-winterspring-alpha": {
    "id": "enemy-wow-frostsaber-winterspring-alpha",
    "nombre": "Frostsaber Winterspring Alpha",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-frostsaber-winterspring-alpha_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-frostsaber-winterspring-alpha_low.glb"
  },
  "enemy-wow-furbolg-timbermaw-ursa": {
    "id": "enemy-wow-furbolg-timbermaw-ursa",
    "nombre": "Furbolg Timbermaw Ursa",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-furbolg-timbermaw-ursa_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-furbolg-timbermaw-ursa_low.glb"
  },
  "enemy-wow-goblin-steamwheedle-shredder": {
    "id": "enemy-wow-goblin-steamwheedle-shredder",
    "nombre": "Goblin Steamwheedle Shredder",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-goblin-steamwheedle-shredder_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-goblin-steamwheedle-shredder_low.glb"
  },
  "enemy-wow-hakkar-soulflayer-loa": {
    "id": "enemy-wow-hakkar-soulflayer-loa",
    "nombre": "Hakkar Soulflayer Loa",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-hakkar-soulflayer-loa_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-hakkar-soulflayer-loa_low.glb"
  },
  "enemy-wow-harpy-witchwing-slayer": {
    "id": "enemy-wow-harpy-witchwing-slayer",
    "nombre": "Harpy Witchwing Slayer",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-harpy-witchwing-slayer_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-harpy-witchwing-slayer_low.glb"
  },
  "enemy-wow-hogger-gnoll-chieftain": {
    "id": "enemy-wow-hogger-gnoll-chieftain",
    "nombre": "Hogger Gnoll Chieftain",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-hogger-gnoll-chieftain_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-hogger-gnoll-chieftain_low.glb"
  },
  "enemy-wow-illidan-betrayer-demonhunter": {
    "id": "enemy-wow-illidan-betrayer-demonhunter",
    "nombre": "Illidan Betrayer Demonhunter",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-illidan-betrayer-demonhunter_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-illidan-betrayer-demonhunter_low.glb"
  },
  "enemy-wow-infernal-abyssal-golem": {
    "id": "enemy-wow-infernal-abyssal-golem",
    "nombre": "Infernal Abyssal Golem",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-infernal-abyssal-golem_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-infernal-abyssal-golem_low.glb"
  },
  "enemy-wow-kelthuzad-archlich": {
    "id": "enemy-wow-kelthuzad-archlich",
    "nombre": "Kelthuzad Archlich",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-kelthuzad-archlich_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-kelthuzad-archlich_low.glb"
  },
  "enemy-wow-kobold-candle-geomancer": {
    "id": "enemy-wow-kobold-candle-geomancer",
    "nombre": "Kobold Candle Geomancer",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-kobold-candle-geomancer_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-kobold-candle-geomancer_low.glb"
  },
  "enemy-wow-kodo-ancient-warbeast": {
    "id": "enemy-wow-kodo-ancient-warbeast",
    "nombre": "Kodo Ancient Warbeast",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-kodo-ancient-warbeast_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-kodo-ancient-warbeast_low.glb"
  },
  "enemy-wow-lady-vashj-coilfang-matron": {
    "id": "enemy-wow-lady-vashj-coilfang-matron",
    "nombre": "Lady Vashj Coilfang Matron",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-lady-vashj-coilfang-matron_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-lady-vashj-coilfang-matron_low.glb"
  },
  "enemy-wow-lord-marrowgar-bonestorm": {
    "id": "enemy-wow-lord-marrowgar-bonestorm",
    "nombre": "Lord Marrowgar Bonestorm",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-lord-marrowgar-bonestorm_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-lord-marrowgar-bonestorm_low.glb"
  },
  "enemy-wow-magnataur-northrend-behemoth": {
    "id": "enemy-wow-magnataur-northrend-behemoth",
    "nombre": "Magnataur Northrend Behemoth",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-magnataur-northrend-behemoth_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-magnataur-northrend-behemoth_low.glb"
  },
  "enemy-wow-mannoroth-pit-lord": {
    "id": "enemy-wow-mannoroth-pit-lord",
    "nombre": "Mannoroth Pit Lord",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-mannoroth-pit-lord_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-mannoroth-pit-lord_low.glb"
  },
  "enemy-wow-murloc-tidehunter": {
    "id": "enemy-wow-murloc-tidehunter",
    "nombre": "Murloc Tidehunter",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-murloc-tidehunter_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-murloc-tidehunter_low.glb"
  },
  "enemy-wow-naga-myrmidon-royal-guard": {
    "id": "enemy-wow-naga-myrmidon-royal-guard",
    "nombre": "Naga Myrmidon Royal Guard",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-naga-myrmidon-royal-guard_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-naga-myrmidon-royal-guard_low.glb"
  },
  "enemy-wow-nathrezim-dreadlord": {
    "id": "enemy-wow-nathrezim-dreadlord",
    "nombre": "Nathrezim Dreadlord",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-nathrezim-dreadlord_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-nathrezim-dreadlord_low.glb"
  },
  "enemy-wow-neptulon-tidehunter": {
    "id": "enemy-wow-neptulon-tidehunter",
    "nombre": "Neptulon Tidehunter",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-neptulon-tidehunter_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-neptulon-tidehunter_low.glb"
  },
  "enemy-wow-night-elf-warden-avatar": {
    "id": "enemy-wow-night-elf-warden-avatar",
    "nombre": "Night Elf Warden Avatar",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-night-elf-warden-avatar_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-night-elf-warden-avatar_low.glb"
  },
  "enemy-wow-ogre-gordok-magi": {
    "id": "enemy-wow-ogre-gordok-magi",
    "nombre": "Ogre Gordok Magi",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-ogre-gordok-magi_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-ogre-gordok-magi_low.glb"
  },
  "enemy-wow-orc-warsong-blademaster": {
    "id": "enemy-wow-orc-warsong-blademaster",
    "nombre": "Orc Warsong Blademaster",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-orc-warsong-blademaster_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-orc-warsong-blademaster_low.glb"
  },
  "enemy-wow-pandaren-shado-master": {
    "id": "enemy-wow-pandaren-shado-master",
    "nombre": "Pandaren Shado Master",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-pandaren-shado-master_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-pandaren-shado-master_low.glb"
  },
  "enemy-wow-qiraji-prophet-skeram": {
    "id": "enemy-wow-qiraji-prophet-skeram",
    "nombre": "Qiraji Prophet Skeram",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-qiraji-prophet-skeram_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-qiraji-prophet-skeram_low.glb"
  },
  "enemy-wow-quillboar-thornweaver": {
    "id": "enemy-wow-quillboar-thornweaver",
    "nombre": "Quillboar Thornweaver",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-quillboar-thornweaver_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-quillboar-thornweaver_low.glb"
  },
  "enemy-wow-ragnaros-firelord": {
    "id": "enemy-wow-ragnaros-firelord",
    "nombre": "Ragnaros Firelord",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-ragnaros-firelord_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-ragnaros-firelord_low.glb"
  },
  "enemy-wow-shivarra-sixblade-priestess": {
    "id": "enemy-wow-shivarra-sixblade-priestess",
    "nombre": "Shivarra Sixblade Priestess",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-shivarra-sixblade-priestess_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-shivarra-sixblade-priestess_low.glb"
  },
  "enemy-wow-silithid-colossus-reaver": {
    "id": "enemy-wow-silithid-colossus-reaver",
    "nombre": "Silithid Colossus Reaver",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-silithid-colossus-reaver_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-silithid-colossus-reaver_low.glb"
  },
  "enemy-wow-sindragosa-frostbrood-queen": {
    "id": "enemy-wow-sindragosa-frostbrood-queen",
    "nombre": "Sindragosa Frostbrood Queen",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-sindragosa-frostbrood-queen_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-sindragosa-frostbrood-queen_low.glb"
  },
  "enemy-wow-tauren-cairne-chieftain": {
    "id": "enemy-wow-tauren-cairne-chieftain",
    "nombre": "Tauren Cairne Chieftain",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-tauren-cairne-chieftain_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-tauren-cairne-chieftain_low.glb"
  },
  "enemy-wow-therazane-stonemother": {
    "id": "enemy-wow-therazane-stonemother",
    "nombre": "Therazane Stonemother",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-therazane-stonemother_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-therazane-stonemother_low.glb"
  },
  "enemy-wow-trogg-stonevault-mauler": {
    "id": "enemy-wow-trogg-stonevault-mauler",
    "nombre": "Trogg Stonevault Mauler",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-trogg-stonevault-mauler_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-trogg-stonevault-mauler_low.glb"
  },
  "enemy-wow-troll-gurubashi-berserker": {
    "id": "enemy-wow-troll-gurubashi-berserker",
    "nombre": "Troll Gurubashi Berserker",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-troll-gurubashi-berserker_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-troll-gurubashi-berserker_low.glb"
  },
  "enemy-wow-valkyr-shadowguard": {
    "id": "enemy-wow-valkyr-shadowguard",
    "nombre": "Valkyr Shadowguard",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-valkyr-shadowguard_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-valkyr-shadowguard_low.glb"
  },
  "enemy-wow-void-lord-dimensius": {
    "id": "enemy-wow-void-lord-dimensius",
    "nombre": "Void Lord Dimensius",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-void-lord-dimensius_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-void-lord-dimensius_low.glb"
  },
  "enemy-wow-worgen-gilneas-stalker": {
    "id": "enemy-wow-worgen-gilneas-stalker",
    "nombre": "Worgen Gilneas Stalker",
    "categoria": "world-of-warcraft",
    "categoriaNombre": "World of Warcraft y Jefes de Incursión",
    "icono": "⚔️",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/world-of-warcraft/enemy-wow-worgen-gilneas-stalker_medium.glb",
    "low": "glb/monstruos_salon3d/low/world-of-warcraft/enemy-wow-worgen-gilneas-stalker_low.glb"
  },
  "enemy-archer-species-2-forest-goblin-bowman": {
    "id": "enemy-archer-species-2-forest-goblin-bowman",
    "nombre": "Forest Goblin Bowman",
    "categoria": "zonas-iniciales-nv-1-20",
    "categoriaNombre": "Zonas Iniciales y Mazmorras Nv 1-20",
    "icono": "🦇",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/zonas-iniciales-nv-1-20/enemy-archer-species-2-forest-goblin-bowman_medium.glb",
    "low": "glb/monstruos_salon3d/low/zonas-iniciales-nv-1-20/enemy-archer-species-2-forest-goblin-bowman_low.glb"
  },
  "enemy-archer-species-3-kobold-tunnel-snipe": {
    "id": "enemy-archer-species-3-kobold-tunnel-snipe",
    "nombre": "Kobold Tunnel Snipe",
    "categoria": "zonas-iniciales-nv-1-20",
    "categoriaNombre": "Zonas Iniciales y Mazmorras Nv 1-20",
    "icono": "🦇",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/zonas-iniciales-nv-1-20/enemy-archer-species-3-kobold-tunnel-snipe_medium.glb",
    "low": "glb/monstruos_salon3d/low/zonas-iniciales-nv-1-20/enemy-archer-species-3-kobold-tunnel-snipe_low.glb"
  },
  "enemy-briar-wood-spriggan": {
    "id": "enemy-briar-wood-spriggan",
    "nombre": "Briar Wood Spriggan",
    "categoria": "zonas-iniciales-nv-1-20",
    "categoriaNombre": "Zonas Iniciales y Mazmorras Nv 1-20",
    "icono": "🦇",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/zonas-iniciales-nv-1-20/enemy-briar-wood-spriggan_medium.glb",
    "low": "glb/monstruos_salon3d/low/zonas-iniciales-nv-1-20/enemy-briar-wood-spriggan_low.glb"
  },
  "enemy-cave-vampire-wingbat": {
    "id": "enemy-cave-vampire-wingbat",
    "nombre": "Cave Vampire Wingbat",
    "categoria": "zonas-iniciales-nv-1-20",
    "categoriaNombre": "Zonas Iniciales y Mazmorras Nv 1-20",
    "icono": "🦇",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/zonas-iniciales-nv-1-20/enemy-cave-vampire-wingbat_medium.glb",
    "low": "glb/monstruos_salon3d/low/zonas-iniciales-nv-1-20/enemy-cave-vampire-wingbat_low.glb"
  },
  "enemy-dune-yellow-scorpion": {
    "id": "enemy-dune-yellow-scorpion",
    "nombre": "Dune Yellow Scorpion",
    "categoria": "zonas-iniciales-nv-1-20",
    "categoriaNombre": "Zonas Iniciales y Mazmorras Nv 1-20",
    "icono": "🦇",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/zonas-iniciales-nv-1-20/enemy-dune-yellow-scorpion_medium.glb",
    "low": "glb/monstruos_salon3d/low/zonas-iniciales-nv-1-20/enemy-dune-yellow-scorpion_low.glb"
  },
  "enemy-forest-goblin-scavenger": {
    "id": "enemy-forest-goblin-scavenger",
    "nombre": "Forest Goblin Scavenger",
    "categoria": "zonas-iniciales-nv-1-20",
    "categoriaNombre": "Zonas Iniciales y Mazmorras Nv 1-20",
    "icono": "🦇",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/zonas-iniciales-nv-1-20/enemy-forest-goblin-scavenger_medium.glb",
    "low": "glb/monstruos_salon3d/low/zonas-iniciales-nv-1-20/enemy-forest-goblin-scavenger_low.glb"
  },
  "enemy-graveyard-zombie-hound": {
    "id": "enemy-graveyard-zombie-hound",
    "nombre": "Graveyard Zombie Hound",
    "categoria": "zonas-iniciales-nv-1-20",
    "categoriaNombre": "Zonas Iniciales y Mazmorras Nv 1-20",
    "icono": "🦇",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/zonas-iniciales-nv-1-20/enemy-graveyard-zombie-hound_medium.glb",
    "low": "glb/monstruos_salon3d/low/zonas-iniciales-nv-1-20/enemy-graveyard-zombie-hound_low.glb"
  },
  "enemy-highland-lynx-stalker": {
    "id": "enemy-highland-lynx-stalker",
    "nombre": "Highland Lynx Stalker",
    "categoria": "zonas-iniciales-nv-1-20",
    "categoriaNombre": "Zonas Iniciales y Mazmorras Nv 1-20",
    "icono": "🦇",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/zonas-iniciales-nv-1-20/enemy-highland-lynx-stalker_medium.glb",
    "low": "glb/monstruos_salon3d/low/zonas-iniciales-nv-1-20/enemy-highland-lynx-stalker_low.glb"
  },
  "enemy-horned-field-viper": {
    "id": "enemy-horned-field-viper",
    "nombre": "Horned Field Viper",
    "categoria": "zonas-iniciales-nv-1-20",
    "categoriaNombre": "Zonas Iniciales y Mazmorras Nv 1-20",
    "icono": "🦇",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/zonas-iniciales-nv-1-20/enemy-horned-field-viper_medium.glb",
    "low": "glb/monstruos_salon3d/low/zonas-iniciales-nv-1-20/enemy-horned-field-viper_low.glb"
  },
  "enemy-lesser-fire-imp": {
    "id": "enemy-lesser-fire-imp",
    "nombre": "Lesser Fire Imp",
    "categoria": "zonas-iniciales-nv-1-20",
    "categoriaNombre": "Zonas Iniciales y Mazmorras Nv 1-20",
    "icono": "🦇",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/zonas-iniciales-nv-1-20/enemy-lesser-fire-imp_medium.glb",
    "low": "glb/monstruos_salon3d/low/zonas-iniciales-nv-1-20/enemy-lesser-fire-imp_low.glb"
  },
  "enemy-marsh-leech-worm": {
    "id": "enemy-marsh-leech-worm",
    "nombre": "Marsh Leech Worm",
    "categoria": "zonas-iniciales-nv-1-20",
    "categoriaNombre": "Zonas Iniciales y Mazmorras Nv 1-20",
    "icono": "🦇",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/zonas-iniciales-nv-1-20/enemy-marsh-leech-worm_medium.glb",
    "low": "glb/monstruos_salon3d/low/zonas-iniciales-nv-1-20/enemy-marsh-leech-worm_low.glb"
  },
  "enemy-mine-kobold-pickaxe": {
    "id": "enemy-mine-kobold-pickaxe",
    "nombre": "Mine Kobold Pickaxe",
    "categoria": "zonas-iniciales-nv-1-20",
    "categoriaNombre": "Zonas Iniciales y Mazmorras Nv 1-20",
    "icono": "🦇",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/zonas-iniciales-nv-1-20/enemy-mine-kobold-pickaxe_medium.glb",
    "low": "glb/monstruos_salon3d/low/zonas-iniciales-nv-1-20/enemy-mine-kobold-pickaxe_low.glb"
  },
  "enemy-mountain-bighorn-ram": {
    "id": "enemy-mountain-bighorn-ram",
    "nombre": "Mountain Bighorn Ram",
    "categoria": "zonas-iniciales-nv-1-20",
    "categoriaNombre": "Zonas Iniciales y Mazmorras Nv 1-20",
    "icono": "🦇",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/zonas-iniciales-nv-1-20/enemy-mountain-bighorn-ram_medium.glb",
    "low": "glb/monstruos_salon3d/low/zonas-iniciales-nv-1-20/enemy-mountain-bighorn-ram_low.glb"
  },
  "enemy-mud-shell-crab-beetle": {
    "id": "enemy-mud-shell-crab-beetle",
    "nombre": "Mud Shell Crab Beetle",
    "categoria": "zonas-iniciales-nv-1-20",
    "categoriaNombre": "Zonas Iniciales y Mazmorras Nv 1-20",
    "icono": "🦇",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/zonas-iniciales-nv-1-20/enemy-mud-shell-crab-beetle_medium.glb",
    "low": "glb/monstruos_salon3d/low/zonas-iniciales-nv-1-20/enemy-mud-shell-crab-beetle_low.glb"
  },
  "enemy-outlaw-bandit-cutthroat": {
    "id": "enemy-outlaw-bandit-cutthroat",
    "nombre": "Outlaw Bandit Cutthroat",
    "categoria": "zonas-iniciales-nv-1-20",
    "categoriaNombre": "Zonas Iniciales y Mazmorras Nv 1-20",
    "icono": "🦇",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/zonas-iniciales-nv-1-20/enemy-outlaw-bandit-cutthroat_medium.glb",
    "low": "glb/monstruos_salon3d/low/zonas-iniciales-nv-1-20/enemy-outlaw-bandit-cutthroat_low.glb"
  },
  "enemy-prairie-red-fox": {
    "id": "enemy-prairie-red-fox",
    "nombre": "Prairie Red Fox",
    "categoria": "zonas-iniciales-nv-1-20",
    "categoriaNombre": "Zonas Iniciales y Mazmorras Nv 1-20",
    "icono": "🦇",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/zonas-iniciales-nv-1-20/enemy-prairie-red-fox_medium.glb",
    "low": "glb/monstruos_salon3d/low/zonas-iniciales-nv-1-20/enemy-prairie-red-fox_low.glb"
  },
  "enemy-ruins-skeleton-pawn": {
    "id": "enemy-ruins-skeleton-pawn",
    "nombre": "Ruins Skeleton Pawn",
    "categoria": "zonas-iniciales-nv-1-20",
    "categoriaNombre": "Zonas Iniciales y Mazmorras Nv 1-20",
    "icono": "🦇",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/zonas-iniciales-nv-1-20/enemy-ruins-skeleton-pawn_medium.glb",
    "low": "glb/monstruos_salon3d/low/zonas-iniciales-nv-1-20/enemy-ruins-skeleton-pawn_low.glb"
  },
  "enemy-steppe-spotted-hyena": {
    "id": "enemy-steppe-spotted-hyena",
    "nombre": "Steppe Spotted Hyena",
    "categoria": "zonas-iniciales-nv-1-20",
    "categoriaNombre": "Zonas Iniciales y Mazmorras Nv 1-20",
    "icono": "🦇",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/zonas-iniciales-nv-1-20/enemy-steppe-spotted-hyena_medium.glb",
    "low": "glb/monstruos_salon3d/low/zonas-iniciales-nv-1-20/enemy-steppe-spotted-hyena_low.glb"
  },
  "enemy-swamp-poison-newt": {
    "id": "enemy-swamp-poison-newt",
    "nombre": "Swamp Poison Newt",
    "categoria": "zonas-iniciales-nv-1-20",
    "categoriaNombre": "Zonas Iniciales y Mazmorras Nv 1-20",
    "icono": "🦇",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/zonas-iniciales-nv-1-20/enemy-swamp-poison-newt_medium.glb",
    "low": "glb/monstruos_salon3d/low/zonas-iniciales-nv-1-20/enemy-swamp-poison-newt_low.glb"
  },
  "enemy-thicket-razor-badger": {
    "id": "enemy-thicket-razor-badger",
    "nombre": "Thicket Razor Badger",
    "categoria": "zonas-iniciales-nv-1-20",
    "categoriaNombre": "Zonas Iniciales y Mazmorras Nv 1-20",
    "icono": "🦇",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/zonas-iniciales-nv-1-20/enemy-thicket-razor-badger_medium.glb",
    "low": "glb/monstruos_salon3d/low/zonas-iniciales-nv-1-20/enemy-thicket-razor-badger_low.glb"
  },
  "enemy-tunnel-giant-rat": {
    "id": "enemy-tunnel-giant-rat",
    "nombre": "Tunnel Giant Rat",
    "categoria": "zonas-iniciales-nv-1-20",
    "categoriaNombre": "Zonas Iniciales y Mazmorras Nv 1-20",
    "icono": "🦇",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/zonas-iniciales-nv-1-20/enemy-tunnel-giant-rat_medium.glb",
    "low": "glb/monstruos_salon3d/low/zonas-iniciales-nv-1-20/enemy-tunnel-giant-rat_low.glb"
  },
  "enemy-young-green-drake": {
    "id": "enemy-young-green-drake",
    "nombre": "Young Green Drake",
    "categoria": "zonas-iniciales-nv-1-20",
    "categoriaNombre": "Zonas Iniciales y Mazmorras Nv 1-20",
    "icono": "🦇",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/zonas-iniciales-nv-1-20/enemy-young-green-drake_medium.glb",
    "low": "glb/monstruos_salon3d/low/zonas-iniciales-nv-1-20/enemy-young-green-drake_low.glb"
  },
  "enemy-df-01-abyssal-gore-chimera": {
    "id": "enemy-df-01-abyssal-gore-chimera",
    "nombre": "Abyssal Gore Chimera",
    "categoria": "bestias-fantasia-oscura-aaa-12k-18k",
    "categoriaNombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-fantasia-oscura-aaa-12k-18k/enemy-df-01-abyssal-gore-chimera_medium.glb",
    "low": null
  },
  "enemy-df-02-dread-manticore-scourge": {
    "id": "enemy-df-02-dread-manticore-scourge",
    "nombre": "Dread Manticore Scourge",
    "categoria": "bestias-fantasia-oscura-aaa-12k-18k",
    "categoriaNombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-fantasia-oscura-aaa-12k-18k/enemy-df-02-dread-manticore-scourge_medium.glb",
    "low": null
  },
  "enemy-df-03-ashen-gargoyle-colossus": {
    "id": "enemy-df-03-ashen-gargoyle-colossus",
    "nombre": "Ashen Gargoyle Colossus",
    "categoria": "bestias-fantasia-oscura-aaa-12k-18k",
    "categoriaNombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/bestias-fantasia-oscura-aaa-12k-18k/enemy-df-03-ashen-gargoyle-colossus_medium.glb",
    "low": null
  },
  "enemy-df-04-venom-chitin-arachnoraptor": {
    "id": "enemy-df-04-venom-chitin-arachnoraptor",
    "nombre": "Venom Chitin Arachnoraptor",
    "categoria": "bestias-fantasia-oscura-aaa-12k-18k",
    "categoriaNombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-fantasia-oscura-aaa-12k-18k/enemy-df-04-venom-chitin-arachnoraptor_medium.glb",
    "low": null
  },
  "enemy-df-05-frostbite-wendigo-stalker": {
    "id": "enemy-df-05-frostbite-wendigo-stalker",
    "nombre": "Frostbite Wendigo Stalker",
    "categoria": "bestias-fantasia-oscura-aaa-12k-18k",
    "categoriaNombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-fantasia-oscura-aaa-12k-18k/enemy-df-05-frostbite-wendigo-stalker_medium.glb",
    "low": null
  },
  "enemy-df-06-bloodhound-cerberus-prime": {
    "id": "enemy-df-06-bloodhound-cerberus-prime",
    "nombre": "Bloodhound Cerberus Prime",
    "categoria": "bestias-fantasia-oscura-aaa-12k-18k",
    "categoriaNombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-fantasia-oscura-aaa-12k-18k/enemy-df-06-bloodhound-cerberus-prime_medium.glb",
    "low": null
  },
  "enemy-df-07-obsidian-behemoth-juggernaut": {
    "id": "enemy-df-07-obsidian-behemoth-juggernaut",
    "nombre": "Obsidian Behemoth Juggernaut",
    "categoria": "bestias-fantasia-oscura-aaa-12k-18k",
    "categoriaNombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-fantasia-oscura-aaa-12k-18k/enemy-df-07-obsidian-behemoth-juggernaut_medium.glb",
    "low": null
  },
  "enemy-df-08-carrion-plague-wyvern": {
    "id": "enemy-df-08-carrion-plague-wyvern",
    "nombre": "Carrion Plague Wyvern",
    "categoria": "bestias-fantasia-oscura-aaa-12k-18k",
    "categoriaNombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-fantasia-oscura-aaa-12k-18k/enemy-df-08-carrion-plague-wyvern_medium.glb",
    "low": null
  },
  "enemy-df-09-bramble-horn-forest-fiend": {
    "id": "enemy-df-09-bramble-horn-forest-fiend",
    "nombre": "Bramble Horn Forest Fiend",
    "categoria": "bestias-fantasia-oscura-aaa-12k-18k",
    "categoriaNombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-fantasia-oscura-aaa-12k-18k/enemy-df-09-bramble-horn-forest-fiend_medium.glb",
    "low": null
  },
  "enemy-df-10-hellfire-basilisk-alpha": {
    "id": "enemy-df-10-hellfire-basilisk-alpha",
    "nombre": "Hellfire Basilisk Alpha",
    "categoria": "bestias-fantasia-oscura-aaa-12k-18k",
    "categoriaNombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-fantasia-oscura-aaa-12k-18k/enemy-df-10-hellfire-basilisk-alpha_medium.glb",
    "low": null
  },
  "enemy-df-11-glacier-fangs-sabertooth": {
    "id": "enemy-df-11-glacier-fangs-sabertooth",
    "nombre": "Glacier Fangs Sabertooth",
    "categoria": "bestias-fantasia-oscura-aaa-12k-18k",
    "categoriaNombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-fantasia-oscura-aaa-12k-18k/enemy-df-11-glacier-fangs-sabertooth_medium.glb",
    "low": null
  },
  "enemy-df-12-crypt-flayed-abomination": {
    "id": "enemy-df-12-crypt-flayed-abomination",
    "nombre": "Crypt Flayed Abomination",
    "categoria": "bestias-fantasia-oscura-aaa-12k-18k",
    "categoriaNombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-fantasia-oscura-aaa-12k-18k/enemy-df-12-crypt-flayed-abomination_medium.glb",
    "low": null
  },
  "enemy-df-13-void-rift-stalker-panther": {
    "id": "enemy-df-13-void-rift-stalker-panther",
    "nombre": "Void Rift Stalker Panther",
    "categoria": "bestias-fantasia-oscura-aaa-12k-18k",
    "categoriaNombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-fantasia-oscura-aaa-12k-18k/enemy-df-13-void-rift-stalker-panther_medium.glb",
    "low": null
  },
  "enemy-df-14-iron-spined-boar-beast": {
    "id": "enemy-df-14-iron-spined-boar-beast",
    "nombre": "Iron Spined Boar Beast",
    "categoria": "bestias-fantasia-oscura-aaa-12k-18k",
    "categoriaNombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-fantasia-oscura-aaa-12k-18k/enemy-df-14-iron-spined-boar-beast_medium.glb",
    "low": null
  },
  "enemy-df-15-scale-crested-wyrm-leviathan": {
    "id": "enemy-df-15-scale-crested-wyrm-leviathan",
    "nombre": "Scale Crested Wyrm Leviathan",
    "categoria": "bestias-fantasia-oscura-aaa-12k-18k",
    "categoriaNombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-fantasia-oscura-aaa-12k-18k/enemy-df-15-scale-crested-wyrm-leviathan_medium.glb",
    "low": null
  },
  "enemy-df-16-flesh-stitched-ghoul-titan": {
    "id": "enemy-df-16-flesh-stitched-ghoul-titan",
    "nombre": "Flesh Stitched Ghoul Titan",
    "categoria": "bestias-fantasia-oscura-aaa-12k-18k",
    "categoriaNombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/bestias-fantasia-oscura-aaa-12k-18k/enemy-df-16-flesh-stitched-ghoul-titan_medium.glb",
    "low": null
  },
  "enemy-df-17-storm-talon-thunder-griffin": {
    "id": "enemy-df-17-storm-talon-thunder-griffin",
    "nombre": "Storm Talon Thunder Griffin",
    "categoria": "bestias-fantasia-oscura-aaa-12k-18k",
    "categoriaNombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-fantasia-oscura-aaa-12k-18k/enemy-df-17-storm-talon-thunder-griffin_medium.glb",
    "low": null
  },
  "enemy-df-18-spectral-shadow-hydra": {
    "id": "enemy-df-18-spectral-shadow-hydra",
    "nombre": "Spectral Shadow Hydra",
    "categoria": "bestias-fantasia-oscura-aaa-12k-18k",
    "categoriaNombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-fantasia-oscura-aaa-12k-18k/enemy-df-18-spectral-shadow-hydra_medium.glb",
    "low": null
  },
  "enemy-df-19-ossuary-bone-reaver-gargant": {
    "id": "enemy-df-19-ossuary-bone-reaver-gargant",
    "nombre": "Ossuary Bone Reaver Gargant",
    "categoria": "bestias-fantasia-oscura-aaa-12k-18k",
    "categoriaNombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-fantasia-oscura-aaa-12k-18k/enemy-df-19-ossuary-bone-reaver-gargant_medium.glb",
    "low": null
  },
  "enemy-df-20-scythe-limbed-chitin-queen": {
    "id": "enemy-df-20-scythe-limbed-chitin-queen",
    "nombre": "Scythe Limbed Chitin Queen",
    "categoria": "bestias-fantasia-oscura-aaa-12k-18k",
    "categoriaNombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/bestias-fantasia-oscura-aaa-12k-18k/enemy-df-20-scythe-limbed-chitin-queen_medium.glb",
    "low": null
  },
  "enemy-df-21-blood-horned-minotaur-lord": {
    "id": "enemy-df-21-blood-horned-minotaur-lord",
    "nombre": "Blood Horned Minotaur Lord",
    "categoria": "bestias-fantasia-oscura-aaa-12k-18k",
    "categoriaNombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸",
    "esJefe": true,
    "medium": "glb/monstruos_salon3d/medium/bestias-fantasia-oscura-aaa-12k-18k/enemy-df-21-blood-horned-minotaur-lord_medium.glb",
    "low": null
  },
  "enemy-df-22-nether-drake-scourge-stalker": {
    "id": "enemy-df-22-nether-drake-scourge-stalker",
    "nombre": "Nether Drake Scourge Stalker",
    "categoria": "bestias-fantasia-oscura-aaa-12k-18k",
    "categoriaNombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-fantasia-oscura-aaa-12k-18k/enemy-df-22-nether-drake-scourge-stalker_medium.glb",
    "low": null
  },
  "enemy-df-23-corrupted-ancient-treant-horror": {
    "id": "enemy-df-23-corrupted-ancient-treant-horror",
    "nombre": "Corrupted Ancient Treant Horror",
    "categoria": "bestias-fantasia-oscura-aaa-12k-18k",
    "categoriaNombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-fantasia-oscura-aaa-12k-18k/enemy-df-23-corrupted-ancient-treant-horror_medium.glb",
    "low": null
  },
  "enemy-df-24-deep-trenches-kraken-beast": {
    "id": "enemy-df-24-deep-trenches-kraken-beast",
    "nombre": "Deep Trenches Kraken Beast",
    "categoria": "bestias-fantasia-oscura-aaa-12k-18k",
    "categoriaNombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-fantasia-oscura-aaa-12k-18k/enemy-df-24-deep-trenches-kraken-beast_medium.glb",
    "low": null
  },
  "enemy-df-25-celestial-eclipse-chimera-apex": {
    "id": "enemy-df-25-celestial-eclipse-chimera-apex",
    "nombre": "Celestial Eclipse Chimera Apex",
    "categoria": "bestias-fantasia-oscura-aaa-12k-18k",
    "categoriaNombre": "Fantasía Oscura AAA (12k-18k)",
    "icono": "🩸",
    "esJefe": false,
    "medium": "glb/monstruos_salon3d/medium/bestias-fantasia-oscura-aaa-12k-18k/enemy-df-25-celestial-eclipse-chimera-apex_medium.glb",
    "low": null
  }
};

  // Mapa de aliases para emparejar arquetipos de EnemyLib o Mazmorras con modelos GLB
  const ALIASES = {
    // Arquetipos clásicos
    'jefe_dragon_ancestral': 'enemy_elder_dragon_ignis',
    'guardian_esqueleto_guerrero': 'enemy-ashen-crown-executioner-skeleton',
    'elite_gargola_canteria': 'enemy-df-03-ashen-gargoyle-colossus',
    'jefe_caballero_titan': 'enemy-abyssal-crown-ossuary-titan',
    'jefe_nigromante_arcano': 'enemy_arch_lich_velkan',
    'guardian_espectro_abismal': 'enemy_shadow_fiend_lord',
    'elite_brujo_abismal': 'enemy-ashen-skull-pyromancer-lich',

    // EnemyLib presets abreviados
    'elder_dragon': 'enemy_elder_dragon_ignis',
    'frost_wyrm': 'enemy_frost_wyrm_vorthrax',
    'abyssal_hydra': 'enemy_abyssal_hydra_tiamat',
    'storm_drake': 'enemy_storm_drake_tempest',
    'necrotic_archdragon': 'enemy_necrotic_archdragon',
    'dire_wolf': 'enemy_dire_wolf_fenrir',
    'sabertooth_tiger': 'enemy_sabertooth_prideleader',
    'iron_boar_juggernaut': 'enemy_iron_boar_gorgrond',
    'obsidian_golem': 'enemy_obsidian_golem_ignis',
    'brood_spider_queen': 'enemy_brood_spider_queen',
    'chitin_stalker': 'enemy_chitin_stalker',
    'arch_lich': 'enemy_arch_lich_velkan',
    'arcane_beholder': 'enemy_arcane_beholder',
    'balor_infernal': 'enemy_balor_infernal',
    'dread_cerberus': 'enemy_dread_cerberus',
    'gorgon_medusa': 'enemy_gorgon_medusa_euryale',
    'shadow_fiend': 'enemy_shadow_fiend_lord'
  };

  function resolverRutaGlb(arquetipoId, calidad = 'medium') {
    if (!arquetipoId || typeof arquetipoId !== 'string') return null;
    const clean = arquetipoId.trim().toLowerCase();

    // 1. Alias directo
    if (ALIASES[clean] && MODELOS_GLB[ALIASES[clean]]) {
      const entry = MODELOS_GLB[ALIASES[clean]];
      const ruta = (calidad === 'low' && entry.low) ? entry.low : (entry.medium || entry.low);
      return { id: entry.id, categoria: entry.categoria, nombre: entry.nombre, ruta, entry };
    }

    // 2. Coincidencia exacta
    if (MODELOS_GLB[clean]) {
      const entry = MODELOS_GLB[clean];
      const ruta = (calidad === 'low' && entry.low) ? entry.low : (entry.medium || entry.low);
      return { id: entry.id, categoria: entry.categoria, nombre: entry.nombre, ruta, entry };
    }

    // 3. Normalización guiones/guiones bajos
    const under = clean.replace(/-/g, '_');
    const dash = clean.replace(/_/g, '-');
    if (MODELOS_GLB[under]) {
      const entry = MODELOS_GLB[under];
      const ruta = (calidad === 'low' && entry.low) ? entry.low : (entry.medium || entry.low);
      return { id: entry.id, categoria: entry.categoria, nombre: entry.nombre, ruta, entry };
    }
    if (MODELOS_GLB[dash]) {
      const entry = MODELOS_GLB[dash];
      const ruta = (calidad === 'low' && entry.low) ? entry.low : (entry.medium || entry.low);
      return { id: entry.id, categoria: entry.categoria, nombre: entry.nombre, ruta, entry };
    }

    // 4. Con prefijo enemy_ o enemy-
    const withEnemyUnder = 'enemy_' + under.replace(/^enemy_/, '');
    const withEnemyDash = 'enemy-' + dash.replace(/^enemy-/, '');
    if (MODELOS_GLB[withEnemyUnder]) {
      const entry = MODELOS_GLB[withEnemyUnder];
      const ruta = (calidad === 'low' && entry.low) ? entry.low : (entry.medium || entry.low);
      return { id: entry.id, categoria: entry.categoria, nombre: entry.nombre, ruta, entry };
    }
    if (MODELOS_GLB[withEnemyDash]) {
      const entry = MODELOS_GLB[withEnemyDash];
      const ruta = (calidad === 'low' && entry.low) ? entry.low : (entry.medium || entry.low);
      return { id: entry.id, categoria: entry.categoria, nombre: entry.nombre, ruta, entry };
    }

    // 5. Búsqueda por token / prefijo en el catálogo
    for (const [k, entry] of Object.entries(MODELOS_GLB)) {
      const normK = k.replace(/-/g, '_');
      if (normK.startsWith(withEnemyUnder) || normK.includes(under)) {
        const ruta = (calidad === 'low' && entry.low) ? entry.low : (entry.medium || entry.low);
        return { id: entry.id, categoria: entry.categoria, nombre: entry.nombre, ruta, entry };
      }
    }

    return null;
  }

  function obtenerTodosLosModelos() {
    return MODELOS_GLB;
  }

  function obtenerCategorias() {
    return CATEGORIAS_GLB;
  }

  return {
    CATEGORIAS_GLB,
    MODELOS_GLB,
    ALIASES,
    resolverRutaGlb,
    obtenerTodosLosModelos,
    obtenerCategorias
  };
}));
