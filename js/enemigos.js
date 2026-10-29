// Generado por tools/hornear-enemigos.mjs desde el editor «Enemigo-rpg». No editar a mano.
// Parche para Three r128: las mallas instanciadas no tienen computeBoundingSphere (el editor lo llama).
if (typeof THREE !== 'undefined' && THREE.InstancedMesh && !THREE.InstancedMesh.prototype.computeBoundingSphere) {
  THREE.InstancedMesh.prototype.computeBoundingSphere = function () {};
}

var EnemyLib = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/enemigos-src/entrada.ts
  var entrada_exports = {};
  __export(entrada_exports, {
    ARCHETYPE_PRESETS: () => ARCHETYPE_PRESETS,
    MATERIAL_PRESETS: () => MATERIAL_PRESETS,
    RACE_CATEGORY_LABELS: () => RACE_CATEGORY_LABELS,
    buildProceduralEnemy: () => buildProceduralEnemy,
    calculateThreatScore: () => calculateThreatScore,
    createProceduralTextureSet: () => createProceduralTextureSet,
    getEffectiveMeshDensity: () => getEffectiveMeshDensity,
    getEffectiveTexturePattern: () => getEffectiveTexturePattern,
    updateEnemyAnimation: () => updateEnemyAnimation,
    updateEnemyMaterialsInPlace: () => updateEnemyMaterialsInPlace
  });

  // tools/enemigos-src/types/enemy.ts
  var FURRY_BEAST_ARCHETYPES = /* @__PURE__ */ new Set([
    "furious_keltir",
    "rabid_grey_wolf",
    "furious_grizzly_bear",
    "rabid_razorback_boar",
    "furious_antler_stag",
    "feral_shadow_panther",
    "rabid_fang_bat",
    "bloodclaw_raptor_hawk",
    "tunnel_giant_rat",
    "prairie_red_fox",
    "cave_vampire_wingbat",
    "steppe_spotted_hyena",
    "mountain_bighorn_ram",
    "thicket_razor_badger",
    "graveyard_zombie_hound",
    "mine_kobold_pickaxe",
    "highland_lynx_stalker",
    "dire_wolf",
    "runic_warbear",
    "sabertooth_tiger",
    "iron_boar_juggernaut",
    "labyrinth_minotaur",
    "manticore_chimera",
    "cerberus_hellhound",
    "griffin_skyhunter",
    "astral_centaur",
    "anubis_jackal_guard",
    "boreal_blizzard_griffin",
    "permafrost_warg_alpha",
    "polar_glacier_bear",
    "astral_frost_phoenix",
    "gale_wind_manticore",
    "aurora_ice_centaur",
    "hailstorm_stag_spirit",
    "crypt_cerberus_hound",
    "ossuary_minotaur_jugger",
    "stitched_necromancy_chimera",
    "phantom_armored_boar",
    // Nuevos Mamíferos e Híbridos Peludos de Élite Nv.1-20
    "elite_quillback_porcupine",
    "elite_steppe_dire_jackal",
    "elite_silverback_ape",
    "elite_armored_pangolin_roller",
    "elite_bloodmane_mandrill",
    "elite_saber_prowler_leopard",
    "elite_marsupial_claw_ripper",
    "elite_great_antler_moose",
    "elite_glacier_wolverine_fiend",
    "elite_thunderhoof_bison",
    "elite_three_tailed_kitsune_fox",
    "elite_ironhorn_rhino_beast",
    "elite_woolly_mammoth_calf",
    "elite_shadow_maned_lion",
    "elite_satyr_bloodhorn_shaman",
    "elite_centaur_steppe_khan",
    "elite_wendigo_antler_fiend",
    "elite_harpy_storm_matriarch",
    // World of Warcraft Mamíferos e Híbridos Peludos
    "wow_hogger_gnoll_chieftain",
    "wow_kobold_candle_geomancer",
    "wow_quillboar_thornweaver",
    "wow_furbolg_timbermaw_ursa",
    "wow_centaur_kolkar_marauder",
    "wow_harpy_witchwing_slayer",
    "wow_tauren_cairne_chieftain",
    "wow_worgen_gilneas_stalker",
    "wow_pandaren_shado_master",
    "wow_Frostsaber_winterspring_alpha",
    "wow_magnataur_northrend_behemoth",
    // Arqueros Mamíferos e Híbridos Peludos de Diferentes Especies
    "archer_species_3_kobold_tunnel_snipe",
    "archer_species_4_gnoll_poacher_archer",
    "archer_species_6_satyr_felbow_trickster",
    "archer_species_7_centaur_khan_horsebow",
    "archer_species_10_worgen_bloodhound_ranger",
    "archer_species_13_minotaur_greatbow_titan"
  ]);
  function getEffectiveMeshDensity(config) {
    var _a;
    return (_a = config.morphology.meshDensity) != null ? _a : "medium";
  }
  function getEffectiveTexturePattern(config) {
    if (config.materials.texturePattern) {
      return config.materials.texturePattern;
    }
    if (FURRY_BEAST_ARCHETYPES.has(config.archetype)) {
      return "wolf_fur";
    }
    if (config.raceCategory === "dragons" || config.bodyPlan === "dragon_wyvern" || config.bodyPlan === "serpentine_naga" || config.archetype === "venom_marsh_toad" || config.archetype === "swamp_poison_newt" || config.archetype === "horned_field_viper" || config.archetype === "marsh_leech_worm" || config.archetype === "young_green_drake" || config.archetype === "elite_spitting_salamander_drake" || config.archetype === "elite_casqued_chameleon_stalker" || config.archetype === "elite_frilled_venom_basilisk" || config.archetype === "elite_thorny_devil_moloch" || config.archetype === "elite_hooded_king_cobra" || config.archetype === "elite_snapping_chelonian_tortoise" || config.archetype === "elite_swamp_alligator_snapper" || config.archetype === "elite_abyssal_angler_lurker" || config.archetype === "elite_crest_pterosaur_skydrake" || config.archetype === "elite_komodo_monitor_ravager" || config.archetype === "elite_glacial_plesio_drake" || config.archetype === "elite_clubtail_ankylo_drake" || config.archetype === "elite_twin_head_amphisbaena" || config.archetype === "elite_crimson_wyvern_matriarch" || config.archetype === "elite_salamander_magma_spearman" || config.archetype === "wow_murloc_tidehunter" || config.archetype === "wow_deathwing_cataclysm_aspect" || config.archetype === "wow_lady_vashj_coilfang_matron" || config.archetype === "wow_naga_myrmidon_royal_guard" || config.archetype === "wow_hakkar_soulflayer_loa" || config.archetype === "wow_chromaggus_chromatic_drake" || config.archetype === "wow_devilsaur_king_mosh" || config.archetype === "wow_kodo_ancient_warbeast" || config.archetype === "archer_species_8_lizardfolk_scale_sniper" || config.archetype === "archer_species_11_naga_siren_coralbow" || config.materials.preset === "dragon_crimson_scales") {
      return "scales";
    }
    if (config.bodyPlan === "arachnid_scorpion" || config.archetype === "forest_hunter_spider" || config.archetype === "mud_shell_crab_beetle" || config.archetype === "dune_yellow_scorpion" || config.archetype === "briar_wood_spriggan" || config.archetype === "chitin_stalker" || config.archetype === "brood_spider_queen" || config.archetype === "frost_crystal_scorpion" || config.archetype === "catacomb_necro_arachnid" || config.archetype === "elite_fungal_myconid_colossus" || config.archetype === "wow_anubarak_crypt_lord" || config.archetype === "wow_qiraji_prophet_skeram" || config.archetype === "wow_silithid_colossus_reaver" || config.archetype === "archer_species_12_mantid_amber_wingbow") {
      return "chitin_fur";
    }
    if (config.raceCategory === "starter_animals" || config.raceCategory === "beasts" || config.bodyPlan === "quadruped_beast" || config.materials.preset === "feral_fur_hide") {
      return "wolf_fur";
    }
    if (config.raceCategory === "magical" || config.materials.preset === "abyssal_obsidian" || config.materials.preset === "arcane_crystal") {
      return "runic_obsidian";
    }
    return "damascus_plate";
  }
  function getEffectiveHairStyle(config) {
    var _a;
    if (config.morphology.hairStyle && config.morphology.hairStyle !== "auto") {
      return config.morphology.hairStyle;
    }
    if (config.archetype === "manticore_chimera" || config.archetype === "labyrinth_minotaur" || config.archetype === "cerberus_hellhound" || config.archetype === "dire_wolf" || config.archetype === "sabertooth_tiger" || config.archetype === "astral_centaur" || config.archetype === "permafrost_warg_alpha" || config.archetype === "gale_wind_manticore" || config.archetype === "aurora_ice_centaur" || config.archetype === "crypt_cerberus_hound" || config.archetype === "stitched_necromancy_chimera" || config.archetype === "steppe_spotted_hyena" || config.archetype === "mountain_bighorn_ram" || config.archetype === "elite_bloodmane_mandrill" || config.archetype === "elite_thunderhoof_bison" || config.archetype === "elite_shadow_maned_lion" || config.archetype === "elite_satyr_bloodhorn_shaman" || config.archetype === "elite_centaur_steppe_khan" || config.archetype === "wow_hogger_gnoll_chieftain" || config.archetype === "wow_centaur_kolkar_marauder" || config.archetype === "wow_tauren_cairne_chieftain" || config.archetype === "wow_worgen_gilneas_stalker" || config.archetype === "wow_Frostsaber_winterspring_alpha" || config.archetype === "wow_magnataur_northrend_behemoth") {
      return "wild_mane_fur";
    }
    if (config.archetype === "rabid_razorback_boar" || config.archetype === "iron_boar_juggernaut" || config.archetype === "phantom_armored_boar" || config.archetype === "thicket_razor_badger" || config.archetype === "elite_quillback_porcupine" || config.archetype === "elite_steppe_dire_jackal" || config.archetype === "elite_goblin_wolf_rider_boss" || config.archetype === "elite_bog_troll_regenerator" || config.archetype === "wow_quillboar_thornweaver" || config.archetype === "wow_troll_gurubashi_berserker" || config.archetype === "wow_murloc_tidehunter") {
      return "dorsal_mohawk";
    }
    if (FURRY_BEAST_ARCHETYPES.has(config.archetype) || getEffectiveTexturePattern(config) === "wolf_fur") {
      return "full_fur_coat";
    }
    if (config.archetype === "vampire_lord" || config.archetype === "solar_valkyrie" || config.archetype === "tidal_naiad_queen" || config.archetype === "valkyrie_of_the_gale" || config.archetype === "crimson_nosferatu_elder" || config.archetype === "grave_fallen_valkyrie" || config.archetype === "banshee_frozen_throne" || config.archetype === "elite_woolly_mammoth_calf" || config.archetype === "elite_harpy_storm_matriarch" || config.archetype === "wow_arthas_lich_king" || config.archetype === "wow_blood_elf_spellbreaker" || config.archetype === "wow_night_elf_warden_avatar" || config.archetype === "wow_valkyr_shadowguard" || config.archetype === "wow_banshee_dark_ranger_queen" || config.archetype === "wow_illidan_betrayer_demonhunter") {
      return "long_flowing_hair";
    }
    if (((_a = config.morphology.furDensity) != null ? _a : 0) > 0.08) {
      return "full_fur_coat";
    }
    return "none";
  }
  function getEffectiveFurDensity(config) {
    if (typeof config.morphology.furDensity === "number" && Number.isFinite(config.morphology.furDensity)) {
      return config.morphology.furDensity;
    }
    const style = getEffectiveHairStyle(config);
    if (style === "wild_mane_fur") {
      return 1.25;
    }
    if (style === "full_fur_coat" || style === "dorsal_mohawk") {
      return 1.15;
    }
    if (style === "long_flowing_hair") {
      return 1;
    }
    return 0;
  }
  function getEffectiveHairLength(config) {
    if (typeof config.morphology.hairLength === "number" && Number.isFinite(config.morphology.hairLength)) {
      return config.morphology.hairLength;
    }
    const style = getEffectiveHairStyle(config);
    if (style === "wild_mane_fur" || style === "long_flowing_hair") {
      return 1.2;
    }
    return 1;
  }
  function getEffectiveMuscleDefinition(config) {
    if (typeof config.morphology.muscleDefinition === "number" && Number.isFinite(config.morphology.muscleDefinition)) {
      return config.morphology.muscleDefinition;
    }
    if (config.raceCategory === "starter_animals" || config.raceCategory === "low_level" || config.raceCategory === "beasts" || config.raceCategory === "dragons" || config.raceCategory === "mythological") {
      return 1.18;
    }
    if (config.bodyPlan === "floating_magical") {
      return 0.45;
    }
    return 0.85;
  }
  var ANIMAL_NATURAL_WEAPONS = /* @__PURE__ */ new Set([
    "feral_claws_fangs",
    "leap_fang_bite",
    "ram_charge",
    "dragon_breath_maw",
    "frost_breath_maw"
  ]);
  var UNDEAD_SKELETAL_ARCHETYPES = /* @__PURE__ */ new Set([
    // Esqueletos y No Muertos de Nivel Inicial / Magia / Dragones
    "ruins_skeleton_pawn",
    "arch_lich",
    "necrotic_archdragon",
    // Legión de No Muertos (40)
    "bone_crown_lich_king",
    "skeletal_plague_dragon",
    "death_knight_colossus",
    "wraith_soul_reaper",
    "flesh_bone_abomination",
    "flayed_underworld_centaur",
    "crypt_cerberus_hound",
    "ossuary_minotaur_jugger",
    "putrid_bog_hydra",
    "grave_fallen_valkyrie",
    "catacomb_necro_arachnid",
    "cursed_skeleton_berserker",
    "plague_hierophant_mummy",
    "stitched_necromancy_chimera",
    "banshee_frozen_throne",
    "ash_bone_naga_siren",
    "embalmed_anubis_sentinel",
    "phantom_armored_boar",
    "skull_tyrant_overlord",
    "skeleton_emperor_goldcrown",
    "ossuary_king_leoric",
    "crowned_catacomb_pharaoh",
    "skeletal_archbishop_pontiff",
    "bone_viscount_duelist",
    "cursed_diadem_valkyrie_skeleton",
    "obsidian_crown_dread_skeleton",
    "skeletal_royal_halberdier",
    "emerald_crown_necromancer_lord",
    "skeleton_warlord_chariot_knight",
    "crowned_crypt_inquisitor",
    "blood_crown_reaper_marquis",
    "skeletal_dragonbone_jarl",
    "glacial_crown_revenant_king",
    "bone_tiara_oracle_siren",
    "ashen_crown_executioner_skeleton",
    "gilded_skull_praetorian",
    "star_crown_astral_lich",
    "iron_crown_cataphract_skeleton",
    "abyssal_crown_ossuary_titan",
    // 14 Nuevos Esqueletos de Élite Nv.1-20 (Categoría Undead / Esqueleto Óseo)
    "elite_dire_wolf_bone_alpha",
    "elite_crypt_stalker_bone_spider",
    "elite_sabertooth_skull_stalker",
    "elite_pirate_captain_skeleton",
    "elite_bone_scorpion_construct",
    "elite_ancient_raptor_skeleton",
    "elite_winged_gargoyle_skeleton",
    "elite_plague_doctor_lich_skeleton",
    "elite_caged_rib_jailer_skeleton",
    "elite_spiked_wheel_bone_martyr",
    "elite_horned_minotaur_skeleton",
    "elite_four_armed_bone_reaver",
    "elite_twin_skull_ettin_skeleton",
    "elite_mammoth_ossuary_behemoth",
    // 10 No Muertos / La Plaga de World of Warcraft (Categoría Undead Esquelética)
    "wow_arthas_lich_king",
    "wow_kelthuzad_archlich",
    "wow_lord_marrowgar_bonestorm",
    "wow_sindragosa_frostbrood_queen",
    "wow_anubarak_crypt_lord",
    "wow_abomination_patchwerk",
    "wow_valkyr_shadowguard",
    "wow_death_knight_ebon_blade",
    "wow_forsaken_royal_apothecary",
    "wow_banshee_dark_ranger_queen",
    // 10 Arqueros Esqueleto de Distintos Niveles (Nv. 4 - Nv. 60)
    "undead_archer_1_bone_scout",
    "undead_archer_2_barrow_bowman",
    "undead_archer_3_poison_rib_hunter",
    "undead_archer_4_watchtower_longbow",
    "undead_archer_5_frostbone_ranger",
    "undead_archer_6_hellfire_ash_marksman",
    "undead_archer_7_catacomb_sniper_captain",
    "undead_archer_8_abyssal_soul_bowman",
    "undead_archer_9_royal_ossuary_greatbow",
    "undead_archer_10_lich_deadeye_sovereign"
  ]);
  function isUndeadArchetype(config) {
    if (config.morphology.anatomyCategory) {
      return config.morphology.anatomyCategory === "Undead";
    }
    const arch = config.archetype;
    if (UNDEAD_SKELETAL_ARCHETYPES.has(arch) || config.raceCategory === "undead" && arch !== "crimson_nosferatu_elder" || arch.includes("skeleton") || arch.includes("bone") || arch.includes("ossuary") || arch.includes("skull") || arch.includes("lich")) {
      return true;
    }
    return false;
  }
  function isAnimalEnemy(config) {
    if (config.raceCategory === "starter_animals" || config.raceCategory === "beasts" || config.raceCategory === "dragons") {
      return true;
    }
    if (config.bodyPlan === "dragon_wyvern" || config.bodyPlan === "arachnid_scorpion" || config.archetype === "horned_field_viper" || config.archetype === "cave_vampire_wingbat" || config.archetype === "marsh_leech_worm" || config.archetype === "lesser_fire_imp" || config.archetype === "solar_phoenix" || config.archetype === "arcane_beholder" || config.archetype === "leviathan_abyssal" || config.archetype === "kraken_deep_watcher" || config.archetype === "cryo_hydra_trident" || config.archetype === "astral_frost_phoenix" || config.archetype === "coral_sea_serpent" || config.archetype === "putrid_bog_hydra" || config.archetype === "banshee_frozen_throne" || config.archetype === "skull_tyrant_overlord" || config.archetype === "elite_silverback_ape" || config.archetype === "elite_bloodmane_mandrill" || config.archetype === "elite_marsupial_claw_ripper" || config.archetype === "elite_spitting_salamander_drake" || config.archetype === "elite_hooded_king_cobra" || config.archetype === "elite_abyssal_angler_lurker" || config.archetype === "elite_glacial_plesio_drake" || config.archetype === "elite_twin_head_amphisbaena" || config.archetype === "elite_fungal_myconid_colossus" || config.archetype === "elite_harpy_storm_matriarch" || config.archetype === "elite_wendigo_antler_fiend" || config.archetype === "wow_harpy_witchwing_slayer" || config.archetype === "wow_felhound_mana_stalker" || config.archetype === "wow_deathwing_cataclysm_aspect" || config.archetype === "wow_sindragosa_frostbrood_queen" || config.archetype === "wow_hakkar_soulflayer_loa" || config.archetype === "wow_chromaggus_chromatic_drake" || config.archetype === "wow_cthun_old_god_eye" || config.archetype === "wow_silithid_colossus_reaver" || config.archetype === "wow_core_hound_magmadar" || config.archetype === "wow_devilsaur_king_mosh" || config.archetype === "wow_kodo_ancient_warbeast" || config.archetype === "wow_Frostsaber_winterspring_alpha") {
      return true;
    }
    if (config.bodyPlan === "quadruped_beast" && config.archetype !== "astral_centaur" && config.archetype !== "aurora_ice_centaur" && config.archetype !== "flayed_underworld_centaur" && config.archetype !== "iron_crown_cataphract_skeleton" && config.archetype !== "elite_centaur_steppe_khan" && config.archetype !== "wow_centaur_kolkar_marauder" && config.archetype !== "wow_mannoroth_pit_lord" && config.archetype !== "wow_magnataur_northrend_behemoth" && config.archetype !== "archer_species_7_centaur_khan_horsebow") {
      return true;
    }
    return false;
  }
  function getEffectiveWeapon(config) {
    if (!isAnimalEnemy(config)) {
      return config.weapon;
    }
    if (ANIMAL_NATURAL_WEAPONS.has(config.weapon)) {
      return config.weapon;
    }
    if (config.archetype === "frost_wyrm" || config.archetype === "runic_warbear" || config.archetype === "leviathan_abyssal" || config.archetype === "glacier_wyrm_ancient" || config.archetype === "kraken_deep_watcher" || config.archetype === "cryo_hydra_trident" || config.archetype === "astral_frost_phoenix" || config.archetype === "banshee_frozen_throne" || config.archetype === "elite_glacial_plesio_drake" || config.archetype === "elite_wendigo_antler_fiend" || config.stats.element === "Escarcha") {
      return "frost_breath_maw";
    }
    if (config.archetype === "rabid_razorback_boar" || config.archetype === "iron_boar_juggernaut" || config.archetype === "furious_antler_stag" || config.archetype === "furious_grizzly_bear" || config.archetype === "mountain_bighorn_ram" || config.archetype === "polar_glacier_bear" || config.archetype === "hailstorm_stag_spirit" || config.archetype === "phantom_armored_boar" || config.archetype === "elite_great_antler_moose" || config.archetype === "elite_thunderhoof_bison" || config.archetype === "elite_ironhorn_rhino_beast" || config.archetype === "elite_woolly_mammoth_calf" || config.archetype === "elite_mammoth_ossuary_behemoth" || config.archetype === "elite_clubtail_ankylo_drake" || config.helm === "tauren_bull_horns") {
      return "ram_charge";
    }
    if (config.raceCategory === "dragons" || config.archetype === "cerberus_hellhound" || config.archetype === "solar_phoenix" || config.archetype === "swamp_poison_newt" || config.archetype === "lesser_fire_imp" || config.archetype === "young_green_drake" || config.archetype === "skeletal_plague_dragon" || config.archetype === "putrid_bog_hydra" || config.archetype === "skull_tyrant_overlord" || config.archetype === "elite_spitting_salamander_drake" || config.archetype === "elite_crimson_wyvern_matriarch" || config.stats.element === "Fuego Drac\xF3nico" || config.stats.element === "Fuego Solar") {
      return "dragon_breath_maw";
    }
    if (config.archetype === "sabertooth_tiger" || config.archetype === "feral_shadow_panther" || config.archetype === "manticore_chimera" || config.archetype === "tunnel_giant_rat" || config.archetype === "prairie_red_fox" || config.archetype === "horned_field_viper" || config.archetype === "cave_vampire_wingbat" || config.archetype === "steppe_spotted_hyena" || config.archetype === "graveyard_zombie_hound" || config.archetype === "marsh_leech_worm" || config.archetype === "highland_lynx_stalker" || config.archetype === "boreal_blizzard_griffin" || config.archetype === "permafrost_warg_alpha" || config.archetype === "gale_wind_manticore" || config.archetype === "coral_sea_serpent" || config.archetype === "crypt_cerberus_hound" || config.archetype === "catacomb_necro_arachnid" || config.archetype === "stitched_necromancy_chimera" || config.archetype === "elite_steppe_dire_jackal" || config.archetype === "elite_saber_prowler_leopard" || config.archetype === "elite_marsupial_claw_ripper" || config.archetype === "elite_glacier_wolverine_fiend" || config.archetype === "elite_shadow_maned_lion" || config.archetype === "elite_swamp_alligator_snapper" || config.archetype === "elite_komodo_monitor_ravager" || config.archetype === "elite_dire_wolf_bone_alpha" || config.archetype === "elite_sabertooth_skull_stalker" || config.archetype === "elite_ancient_raptor_skeleton" || config.stats.aiBehavior === "Ambush Stalker") {
      return "leap_fang_bite";
    }
    return "feral_claws_fangs";
  }
  var RACE_CATEGORY_LABELS = {
    starter_animals: "Animales Nv.1-12 Lineage (10)",
    low_level: "Zonas Iniciales Nv.1-20 (22)",
    elite_low_level: "\xC9lite Nv.1-20 (53)",
    beasts: "Bestias \xC9lite (6)",
    dragons: "Dragones (5)",
    mythological: "Mitol\xF3gicos (10)",
    magical: "M\xE1gicos y Demonios (9)",
    humanoids: "Campeones y Arqueros (10)",
    air_water_ice: "Aire, Agua y Hielo (22)",
    undead: "No Muertos (50)",
    warcraft_legends: "World of Warcraft (60)"
  };
  var MATERIAL_PRESETS = {
    dragon_crimson_scales: {
      label: "Escamas de Drag\xF3n \xCDgneo",
      description: "Dermis reptiliana iridiscente con placas ventrales de bronce e \xEDgor ardiente.",
      primaryColor: "#7a161b",
      secondaryColor: "#d49442",
      underbodyColor: "#261314",
      emissiveColor: "#ff5722",
      emissiveIntensity: 2.3,
      metalness: 0.48,
      roughness: 0.34,
      anisotropy: 0.55,
      crystalTransmission: 0.8,
      grainWearIntensity: 0.9
    },
    feral_fur_hide: {
      label: "Pelaje y Cuero Salvaje",
      description: "Piel org\xE1nica densa de bestia alfa con colmillos de marfil y ojos de \xE1mbar.",
      primaryColor: "#3d352e",
      secondaryColor: "#a69378",
      underbodyColor: "#1b1815",
      emissiveColor: "#f59e0b",
      emissiveIntensity: 1.8,
      metalness: 0.08,
      roughness: 0.78,
      anisotropy: 0.15,
      crystalTransmission: 0.4,
      grainWearIntensity: 1.05
    },
    blued_steel: {
      label: "Acero Pavonado Real",
      description: "Placas forjadas de alta densidad con ribetes de bronce templado.",
      primaryColor: "#28364d",
      secondaryColor: "#a88756",
      underbodyColor: "#141821",
      emissiveColor: "#38bdf8",
      emissiveIntensity: 1.5,
      metalness: 0.88,
      roughness: 0.24,
      anisotropy: 0.65,
      crystalTransmission: 0.75,
      grainWearIntensity: 0.8
    },
    anisotropic_gold: {
      label: "Oro Bru\xF1ido Celestial",
      description: "Aleaci\xF3n solar con anisotrop\xEDa cepillada y n\xFAcleo radiante.",
      primaryColor: "#d4a349",
      secondaryColor: "#f3e5ab",
      underbodyColor: "#2c221e",
      emissiveColor: "#fbbf24",
      emissiveIntensity: 1.9,
      metalness: 0.95,
      roughness: 0.16,
      anisotropy: 0.85,
      crystalTransmission: 0.9,
      grainWearIntensity: 0.65
    },
    abyssal_obsidian: {
      label: "Obsidiana Abisal",
      description: "Roca volc\xE1nica v\xEDtrea con vetas de magma carmes\xED.",
      primaryColor: "#1a1724",
      secondaryColor: "#433354",
      underbodyColor: "#0d0b12",
      emissiveColor: "#f43f5e",
      emissiveIntensity: 2.1,
      metalness: 0.45,
      roughness: 0.18,
      anisotropy: 0.2,
      crystalTransmission: 0.85,
      grainWearIntensity: 0.95
    },
    ancient_bone: {
      label: "Hueso y Quitina Ancestral",
      description: "Exoesqueleto org\xE1nico calcificado con energ\xEDa necr\xF3tica.",
      primaryColor: "#cbbba0",
      secondaryColor: "#5c5346",
      underbodyColor: "#1f1c18",
      emissiveColor: "#10b981",
      emissiveIntensity: 1.8,
      metalness: 0.15,
      roughness: 0.68,
      anisotropy: 0,
      crystalTransmission: 0.6,
      grainWearIntensity: 1.1
    },
    arcane_crystal: {
      label: "Cristal Et\xE9reo Arcano",
      description: "Coraza facetada semitransl\xFAcida con refracci\xF3n de vac\xEDo.",
      primaryColor: "#312e81",
      secondaryColor: "#818cf8",
      underbodyColor: "#111827",
      emissiveColor: "#a855f7",
      emissiveIntensity: 2.2,
      metalness: 0.35,
      roughness: 0.12,
      anisotropy: 0.4,
      crystalTransmission: 0.95,
      grainWearIntensity: 0.7
    },
    corroded_bronze: {
      label: "Bronce de Cripta Oxidado",
      description: "Metal antiguo con p\xE1tina verdosa y fuego de forja.",
      primaryColor: "#6b4c35",
      secondaryColor: "#3d6b5e",
      underbodyColor: "#1a1615",
      emissiveColor: "#84cc16",
      emissiveIntensity: 1.7,
      metalness: 0.78,
      roughness: 0.46,
      anisotropy: 0.35,
      crystalTransmission: 0.5,
      grainWearIntensity: 1.2
    }
  };
  var ARCHETYPE_PRESETS = {
    // ================= 1. DRAGONES Y SIERPES (5) =================
    elder_dragon: {
      id: "enemy_elder_dragon_ignis",
      name: "Ignisaurio el Primordial",
      title: "Drag\xF3n Ancestral de la Caldera",
      raceCategory: "dragons",
      bodyPlan: "dragon_wyvern",
      archetype: "elder_dragon",
      helm: "draconic_snout",
      weapon: "dragon_breath_maw",
      offhand: "none",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 1.25,
        torsoBulk: 1.32,
        shoulderWidth: 1.38,
        hornLength: 1.45,
        hornCurve: 1.15,
        pauldronSize: 1.1,
        weaponScale: 1.2,
        dorsalScale: 1.65,
        limbLength: 1.08,
        neckLength: 1.45,
        tailLength: 1.65,
        snoutLength: 1.4,
        headCount: 1,
        auraShardCount: 20
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales
      },
      stats: {
        level: 85,
        tier: "Raid Boss",
        element: "Fuego Drac\xF3nico",
        aiBehavior: "Aerial Breath Sweeper",
        hp: 46e3,
        attack: 1180,
        defense: 980,
        speed: 140,
        critChance: 32,
        aggroRadius: 28,
        attackRange: 9.5,
        xpReward: 22e3,
        headHitboxRadius: 0.48,
        torsoHitboxRadius: 0.95,
        torsoHitboxHeight: 1.85,
        lootTags: ["Coraz\xF3n de Drag\xF3n Ancestral", "Escama Imperial", "Aliento Cristalizado"]
      }
    },
    frost_wyrm: {
      id: "enemy_frost_wyrm_vorthrax",
      name: "Vorthrax Ala-Escarcha",
      title: "Sierpe Drac\xF3nica del Glaciar Eterno",
      raceCategory: "dragons",
      bodyPlan: "dragon_wyvern",
      archetype: "frost_wyrm",
      helm: "draconic_snout",
      weapon: "frost_breath_maw",
      offhand: "none",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 1.18,
        torsoBulk: 1.12,
        shoulderWidth: 1.28,
        hornLength: 1.6,
        hornCurve: 1.35,
        pauldronSize: 0.95,
        weaponScale: 1.15,
        dorsalScale: 1.75,
        limbLength: 1.02,
        neckLength: 1.65,
        tailLength: 1.8,
        snoutLength: 1.5,
        headCount: 1,
        auraShardCount: 22
      },
      materials: {
        preset: "arcane_crystal",
        ...MATERIAL_PRESETS.arcane_crystal,
        primaryColor: "#1e3a5f",
        secondaryColor: "#bae6fd",
        emissiveColor: "#38bdf8"
      },
      stats: {
        level: 74,
        tier: "Raid Boss",
        element: "Escarcha",
        aiBehavior: "Aerial Breath Sweeper",
        hp: 34500,
        attack: 960,
        defense: 820,
        speed: 155,
        critChance: 28,
        aggroRadius: 25,
        attackRange: 8.8,
        xpReward: 16400,
        headHitboxRadius: 0.44,
        torsoHitboxRadius: 0.85,
        torsoHitboxHeight: 1.7,
        lootTags: ["Colmillo Glacial", "Membrana de Sierpe", "Zafiro de Escarcha"]
      }
    },
    abyssal_hydra: {
      id: "enemy_abyssal_hydra_tiamat",
      name: "Tiamat Hidra del Pantano",
      title: "Hidra Tric\xE9fala de Veneno y Vac\xEDo",
      raceCategory: "dragons",
      bodyPlan: "serpentine_naga",
      archetype: "abyssal_hydra",
      helm: "draconic_snout",
      weapon: "dragon_breath_maw",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.28,
        torsoBulk: 1.36,
        shoulderWidth: 1.45,
        hornLength: 1.35,
        hornCurve: 1.1,
        pauldronSize: 0.9,
        weaponScale: 1.15,
        dorsalScale: 1.4,
        limbLength: 1,
        neckLength: 1.75,
        tailLength: 1.85,
        snoutLength: 1.45,
        headCount: 3,
        auraShardCount: 20
      },
      materials: {
        preset: "corroded_bronze",
        ...MATERIAL_PRESETS.corroded_bronze,
        primaryColor: "#133829",
        secondaryColor: "#4d7c0f",
        emissiveColor: "#84cc16"
      },
      stats: {
        level: 80,
        tier: "Raid Boss",
        element: "Veneno",
        aiBehavior: "Boss Multi-Phase",
        hp: 42e3,
        attack: 1090,
        defense: 860,
        speed: 130,
        critChance: 34,
        aggroRadius: 26,
        attackRange: 9,
        xpReward: 19500,
        headHitboxRadius: 0.55,
        torsoHitboxRadius: 0.95,
        torsoHitboxHeight: 1.8,
        lootTags: ["Tres Corazones de Hidra", "Colmillo Regenerativo", "Sangre \xC1cida"]
      }
    },
    storm_drake: {
      id: "enemy_storm_drake_voltaris",
      name: "Voltaris Fulgo-Draco",
      title: "Draco de Tormenta de las Cumbres",
      raceCategory: "dragons",
      bodyPlan: "dragon_wyvern",
      archetype: "storm_drake",
      helm: "draconic_snout",
      weapon: "dragon_breath_maw",
      offhand: "none",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 1.14,
        torsoBulk: 1.18,
        shoulderWidth: 1.3,
        hornLength: 1.5,
        hornCurve: 0.9,
        pauldronSize: 1.05,
        weaponScale: 1.1,
        dorsalScale: 1.6,
        limbLength: 1.1,
        neckLength: 1.35,
        tailLength: 1.55,
        snoutLength: 1.3,
        headCount: 1,
        auraShardCount: 24
      },
      materials: {
        preset: "blued_steel",
        ...MATERIAL_PRESETS.blued_steel,
        primaryColor: "#1e293b",
        secondaryColor: "#38bdf8",
        emissiveColor: "#60a5fa",
        emissiveIntensity: 2.5
      },
      stats: {
        level: 65,
        tier: "Mini-Boss",
        element: "Arcano",
        aiBehavior: "Aerial Breath Sweeper",
        hp: 24800,
        attack: 920,
        defense: 680,
        speed: 175,
        critChance: 35,
        aggroRadius: 24,
        attackRange: 8.5,
        xpReward: 11200,
        headHitboxRadius: 0.42,
        torsoHitboxRadius: 0.8,
        torsoHitboxHeight: 1.6,
        lootTags: ["Cuerno de Rel\xE1mpago", "Escama Conductora", "Orbe de Tempestad"]
      }
    },
    necrotic_archdragon: {
      id: "enemy_necrotic_archdragon",
      name: "Maldrakor Osario-Alado",
      title: "Drag\xF3n Esquel\xE9tico de Fuego Fatuo",
      raceCategory: "dragons",
      bodyPlan: "dragon_wyvern",
      archetype: "necrotic_archdragon",
      helm: "crowned_skull",
      weapon: "dragon_breath_maw",
      offhand: "none",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 1.28,
        torsoBulk: 1.15,
        shoulderWidth: 1.36,
        hornLength: 1.65,
        hornCurve: 1.25,
        pauldronSize: 1.1,
        weaponScale: 1.2,
        dorsalScale: 1.75,
        limbLength: 1.14,
        neckLength: 1.55,
        tailLength: 1.75,
        snoutLength: 1.35,
        headCount: 1,
        auraShardCount: 24
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        emissiveColor: "#10b981",
        emissiveIntensity: 2.4
      },
      stats: {
        level: 78,
        tier: "Raid Boss",
        element: "Abisal",
        aiBehavior: "Aerial Breath Sweeper",
        hp: 38e3,
        attack: 1050,
        defense: 790,
        speed: 145,
        critChance: 30,
        aggroRadius: 26,
        attackRange: 9.2,
        xpReward: 18400,
        headHitboxRadius: 0.45,
        torsoHitboxRadius: 0.86,
        torsoHitboxHeight: 1.75,
        lootTags: ["Cr\xE1neo de Archidrag\xF3n", "Fuego Fatuo Eterno", "Hueso Drac\xF3nico"]
      }
    },
    // ================= 2. MITOLÓGICOS Y LEYENDAS (6) =================
    labyrinth_minotaur: {
      id: "enemy_labyrinth_minotaur",
      name: "Asteri\xF3n Rompemuros",
      title: "Minotauro Guardi\xE1n del Laberinto",
      raceCategory: "mythological",
      bodyPlan: "biped_titan",
      archetype: "labyrinth_minotaur",
      helm: "tauren_bull_horns",
      weapon: "twin_reaver_axes",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.34,
        torsoBulk: 1.52,
        shoulderWidth: 1.55,
        hornLength: 1.65,
        hornCurve: 1.25,
        pauldronSize: 1.35,
        weaponScale: 1.48,
        dorsalScale: 1,
        limbLength: 1.12,
        neckLength: 0.75,
        tailLength: 1.1,
        snoutLength: 1.35,
        headCount: 1,
        auraShardCount: 12
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        secondaryColor: "#b45309",
        emissiveColor: "#ef4444"
      },
      stats: {
        level: 54,
        tier: "Mini-Boss",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Aggressive Berserker",
        hp: 19500,
        attack: 840,
        defense: 640,
        speed: 125,
        critChance: 24,
        aggroRadius: 18,
        attackRange: 3.8,
        xpReward: 6800,
        headHitboxRadius: 0.45,
        torsoHitboxRadius: 0.85,
        torsoHitboxHeight: 1.75,
        lootTags: ["Cuerno de Minotauro", "Labrys de Bronce", "Pezu\xF1a Acorazada"]
      }
    },
    manticore_chimera: {
      id: "enemy_manticore_chimera",
      name: "Khimaira Aguij\xF3n-Real",
      title: "Mant\xEDcora Alada de las Dunas Rojas",
      raceCategory: "mythological",
      bodyPlan: "quadruped_beast",
      archetype: "manticore_chimera",
      helm: "lupine_maw",
      weapon: "feral_claws_fangs",
      offhand: "none",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 1.18,
        torsoBulk: 1.35,
        shoulderWidth: 1.38,
        hornLength: 1.35,
        hornCurve: 0.95,
        pauldronSize: 1.2,
        weaponScale: 1.25,
        dorsalScale: 1.55,
        limbLength: 1.15,
        neckLength: 0.95,
        tailLength: 1.65,
        snoutLength: 1.25,
        headCount: 1,
        auraShardCount: 16
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#7c2d12",
        secondaryColor: "#d97706",
        emissiveColor: "#84cc16"
      },
      stats: {
        level: 62,
        tier: "Mini-Boss",
        element: "Veneno",
        aiBehavior: "Ambush Stalker",
        hp: 21400,
        attack: 890,
        defense: 580,
        speed: 160,
        critChance: 34,
        aggroRadius: 22,
        attackRange: 4.6,
        xpReward: 8900,
        headHitboxRadius: 0.42,
        torsoHitboxRadius: 0.82,
        torsoHitboxHeight: 1.45,
        lootTags: ["Aguij\xF3n de Mant\xEDcora", "Melena Quim\xE9rica", "Veneno Real"]
      }
    },
    astral_centaur: {
      id: "enemy_astral_centaur",
      name: "Ori\xF3n Lanza-Estelar",
      title: "Centauro Acorazado del Bosque Astral",
      raceCategory: "mythological",
      bodyPlan: "quadruped_beast",
      archetype: "astral_centaur",
      helm: "valkyrie_crest",
      weapon: "radiant_halberd",
      offhand: "runic_buckler",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.26,
        torsoBulk: 1.22,
        shoulderWidth: 1.28,
        hornLength: 1.15,
        hornCurve: 0.7,
        pauldronSize: 1.25,
        weaponScale: 1.35,
        dorsalScale: 1.2,
        limbLength: 1.22,
        neckLength: 1.1,
        tailLength: 1.25,
        snoutLength: 0.45,
        headCount: 1,
        auraShardCount: 18
      },
      materials: {
        preset: "anisotropic_gold",
        ...MATERIAL_PRESETS.anisotropic_gold,
        underbodyColor: "#3e2723"
      },
      stats: {
        level: 52,
        tier: "Elite",
        element: "Arcano",
        aiBehavior: "Pack Alpha Predator",
        hp: 14800,
        attack: 720,
        defense: 610,
        speed: 175,
        critChance: 26,
        aggroRadius: 20,
        attackRange: 4.2,
        xpReward: 5400,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.78,
        torsoHitboxHeight: 1.65,
        lootTags: ["Alabarda Astral", "Barda Equina de Oro", "Crin Estelar"]
      }
    },
    gorgon_medusa: {
      id: "enemy_gorgon_medusa_euryale",
      name: "Euryale Mirada-P\xE9trea",
      title: "Reina Gorgona del Templo Hundido",
      raceCategory: "mythological",
      bodyPlan: "serpentine_naga",
      archetype: "gorgon_medusa",
      helm: "crowned_skull",
      weapon: "arcane_staff",
      offhand: "dual_blade",
      dorsal: "beholder_eye_tentacles",
      morphology: {
        heightScale: 1.22,
        torsoBulk: 1.05,
        shoulderWidth: 1.18,
        hornLength: 1.3,
        hornCurve: 1.2,
        pauldronSize: 0.95,
        weaponScale: 1.25,
        dorsalScale: 1.35,
        limbLength: 1.1,
        neckLength: 0.85,
        tailLength: 1.85,
        snoutLength: 0.5,
        headCount: 1,
        auraShardCount: 18
      },
      materials: {
        preset: "corroded_bronze",
        ...MATERIAL_PRESETS.corroded_bronze,
        primaryColor: "#1b4332",
        secondaryColor: "#d4a349",
        emissiveColor: "#10b981"
      },
      stats: {
        level: 58,
        tier: "Mini-Boss",
        element: "Veneno",
        aiBehavior: "Arcane Artillery",
        hp: 16800,
        attack: 820,
        defense: 540,
        speed: 145,
        critChance: 32,
        aggroRadius: 22,
        attackRange: 10.5,
        xpReward: 7400,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.68,
        torsoHitboxHeight: 1.65,
        lootTags: ["Escama de Gorgona", "Ojo Petrificante", "Arco Serpentino"]
      }
    },
    cerberus_hellhound: {
      id: "enemy_cerberus_hellhound",
      name: "Kerberos Guardi\xE1n del Hades",
      title: "Sabueso Tric\xE9falo de las Puertas de Ceniza",
      raceCategory: "mythological",
      bodyPlan: "quadruped_beast",
      archetype: "cerberus_hellhound",
      helm: "lupine_maw",
      weapon: "dragon_breath_maw",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.24,
        torsoBulk: 1.45,
        shoulderWidth: 1.48,
        hornLength: 0.85,
        hornCurve: 0.55,
        pauldronSize: 1.25,
        weaponScale: 1.3,
        dorsalScale: 1.25,
        limbLength: 1.18,
        neckLength: 1.15,
        tailLength: 1.4,
        snoutLength: 1.45,
        headCount: 3,
        auraShardCount: 20
      },
      materials: {
        preset: "abyssal_obsidian",
        ...MATERIAL_PRESETS.abyssal_obsidian,
        primaryColor: "#1c1917",
        secondaryColor: "#991b1b",
        emissiveColor: "#f97316",
        emissiveIntensity: 2.4
      },
      stats: {
        level: 72,
        tier: "Raid Boss",
        element: "Fuego Drac\xF3nico",
        aiBehavior: "Pack Alpha Predator",
        hp: 32e3,
        attack: 990,
        defense: 760,
        speed: 165,
        critChance: 36,
        aggroRadius: 24,
        attackRange: 4,
        xpReward: 15200,
        headHitboxRadius: 0.52,
        torsoHitboxRadius: 0.88,
        torsoHitboxHeight: 1.55,
        lootTags: ["Collar del Inframundo", "Colmillo de Cerbero", "Ascua del Hades"]
      }
    },
    griffin_skyhunter: {
      id: "enemy_griffin_skyhunter",
      name: "Aquil\xF3n Garra-Real",
      title: "Grifo Imperial de las Cumbres Solares",
      raceCategory: "mythological",
      bodyPlan: "quadruped_beast",
      archetype: "griffin_skyhunter",
      helm: "avian_phoenix_beak",
      weapon: "feral_claws_fangs",
      offhand: "none",
      dorsal: "seraph_wings",
      morphology: {
        heightScale: 1.18,
        torsoBulk: 1.26,
        shoulderWidth: 1.32,
        hornLength: 1.1,
        hornCurve: 0.8,
        pauldronSize: 1.15,
        weaponScale: 1.25,
        dorsalScale: 1.75,
        limbLength: 1.16,
        neckLength: 1.05,
        tailLength: 1.25,
        snoutLength: 1.25,
        headCount: 1,
        auraShardCount: 14
      },
      materials: {
        preset: "anisotropic_gold",
        ...MATERIAL_PRESETS.anisotropic_gold,
        primaryColor: "#92400e",
        secondaryColor: "#fef08a",
        emissiveColor: "#f59e0b"
      },
      stats: {
        level: 50,
        tier: "Elite",
        element: "Fuego Solar",
        aiBehavior: "Aerial Breath Sweeper",
        hp: 15400,
        attack: 760,
        defense: 560,
        speed: 180,
        critChance: 32,
        aggroRadius: 24,
        attackRange: 3.8,
        xpReward: 5800,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.78,
        torsoHitboxHeight: 1.4,
        lootTags: ["Pluma de Grifo Real", "Pico Dorado", "Garra Celeste"]
      }
    },
    // ================= 3. ANIMALES Y BESTIAS SALVAJES (6) =================
    dire_wolf: {
      id: "enemy_dire_wolf_fenrir",
      name: "Fenrir Colmillo-Gris",
      title: "Lobo Huargo Alfa de la Tundra",
      raceCategory: "beasts",
      bodyPlan: "quadruped_beast",
      archetype: "dire_wolf",
      helm: "lupine_maw",
      weapon: "feral_claws_fangs",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.08,
        torsoBulk: 1.16,
        shoulderWidth: 1.18,
        hornLength: 0.75,
        hornCurve: 0.4,
        pauldronSize: 0.85,
        weaponScale: 1.15,
        dorsalScale: 0.95,
        limbLength: 1.14,
        neckLength: 0.9,
        tailLength: 1.35,
        snoutLength: 1.45,
        headCount: 1,
        auraShardCount: 10
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide
      },
      stats: {
        level: 34,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Pack Alpha Predator",
        hp: 6800,
        attack: 590,
        defense: 360,
        speed: 185,
        critChance: 38,
        aggroRadius: 20,
        attackRange: 2.6,
        xpReward: 2100,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.68,
        torsoHitboxHeight: 1.15,
        lootTags: ["Piel de Huargo Alfa", "Colmillo Afilado", "Garra de Cazador"]
      }
    },
    runic_warbear: {
      id: "enemy_runic_warbear",
      name: "Ursakor Quebrantarrocas",
      title: "Oso R\xFAnico Acorazado del Norte",
      raceCategory: "beasts",
      bodyPlan: "quadruped_beast",
      archetype: "runic_warbear",
      helm: "lupine_maw",
      weapon: "frost_breath_maw",
      offhand: "none",
      dorsal: "crystal_pylons",
      morphology: {
        heightScale: 1.24,
        torsoBulk: 1.56,
        shoulderWidth: 1.52,
        hornLength: 0.55,
        hornCurve: 0.35,
        pauldronSize: 1.4,
        weaponScale: 1.35,
        dorsalScale: 1.15,
        limbLength: 1.05,
        neckLength: 0.65,
        tailLength: 0.35,
        snoutLength: 1.1,
        headCount: 1,
        auraShardCount: 14
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#2b2119",
        secondaryColor: "#64748b",
        emissiveColor: "#38bdf8"
      },
      stats: {
        level: 48,
        tier: "Mini-Boss",
        element: "Escarcha",
        aiBehavior: "Shield Wall Tank",
        hp: 18200,
        attack: 710,
        defense: 840,
        speed: 115,
        critChance: 20,
        aggroRadius: 16,
        attackRange: 3.1,
        xpReward: 5200,
        headHitboxRadius: 0.44,
        torsoHitboxRadius: 0.92,
        torsoHitboxHeight: 1.45,
        lootTags: ["Zarpas de Ursakor", "Coraza de Oso R\xFAnico", "Sangre Boreal"]
      }
    },
    chitin_stalker: {
      id: "enemy_chitin_stalker",
      name: "Xylorath Aguij\xF3n-Abisal",
      title: "Escorpi\xF3n Ar\xE1cnido de las Profundidades",
      raceCategory: "beasts",
      bodyPlan: "arachnid_scorpion",
      archetype: "chitin_stalker",
      helm: "arachnid_mandibles",
      weapon: "feral_claws_fangs",
      offhand: "none",
      dorsal: "scorpion_stinger_tail",
      morphology: {
        heightScale: 1.05,
        torsoBulk: 1.22,
        shoulderWidth: 1.35,
        hornLength: 1.3,
        hornCurve: 1.2,
        pauldronSize: 1.1,
        weaponScale: 1.3,
        dorsalScale: 1.45,
        limbLength: 1.22,
        neckLength: 0.4,
        tailLength: 1.65,
        snoutLength: 0.95,
        headCount: 1,
        auraShardCount: 14
      },
      materials: {
        preset: "corroded_bronze",
        ...MATERIAL_PRESETS.corroded_bronze
      },
      stats: {
        level: 42,
        tier: "Elite",
        element: "Veneno",
        aiBehavior: "Ambush Stalker",
        hp: 8900,
        attack: 640,
        defense: 520,
        speed: 155,
        critChance: 35,
        aggroRadius: 16,
        attackRange: 3.4,
        xpReward: 2950,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.75,
        torsoHitboxHeight: 1.15,
        lootTags: ["Gl\xE1ndula \xC1cida", "Pinza Quitina", "Aguij\xF3n Venenoso"]
      }
    },
    brood_spider_queen: {
      id: "enemy_brood_spider_queen",
      name: "Arachne Madre-Tejedora",
      title: "Reina Viuda Negra de la Cripta de Seda",
      raceCategory: "beasts",
      bodyPlan: "arachnid_scorpion",
      archetype: "brood_spider_queen",
      helm: "arachnid_mandibles",
      weapon: "feral_claws_fangs",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.12,
        torsoBulk: 1.48,
        shoulderWidth: 1.4,
        hornLength: 1.15,
        hornCurve: 1.3,
        pauldronSize: 0.9,
        weaponScale: 1.25,
        dorsalScale: 1.35,
        limbLength: 1.35,
        neckLength: 0.35,
        tailLength: 0.25,
        snoutLength: 0.85,
        headCount: 1,
        auraShardCount: 16
      },
      materials: {
        preset: "abyssal_obsidian",
        ...MATERIAL_PRESETS.abyssal_obsidian,
        primaryColor: "#111827",
        secondaryColor: "#991b1b",
        emissiveColor: "#ef4444"
      },
      stats: {
        level: 50,
        tier: "Mini-Boss",
        element: "Veneno",
        aiBehavior: "Ambush Stalker",
        hp: 16400,
        attack: 780,
        defense: 540,
        speed: 165,
        critChance: 40,
        aggroRadius: 20,
        attackRange: 3.5,
        xpReward: 6200,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.88,
        torsoHitboxHeight: 1.2,
        lootTags: ["Seda Imperial", "Quel\xEDcero Venenoso", "Huevo de la Prole"]
      }
    },
    sabertooth_tiger: {
      id: "enemy_sabertooth_raksha",
      name: "Raksha Colmillo-Sable",
      title: "Depredador Dientes de Sable de la Jungla",
      raceCategory: "beasts",
      bodyPlan: "quadruped_beast",
      archetype: "sabertooth_tiger",
      helm: "lupine_maw",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "none",
      morphology: {
        heightScale: 1.06,
        torsoBulk: 1.22,
        shoulderWidth: 1.28,
        hornLength: 1.35,
        hornCurve: 1.2,
        pauldronSize: 0.95,
        weaponScale: 1.3,
        dorsalScale: 0.8,
        limbLength: 1.18,
        neckLength: 0.85,
        tailLength: 1.25,
        snoutLength: 1.2,
        headCount: 1,
        auraShardCount: 8
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#b45309",
        secondaryColor: "#fef3c7",
        emissiveColor: "#f59e0b"
      },
      stats: {
        level: 38,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Ambush Stalker",
        hp: 7600,
        attack: 680,
        defense: 340,
        speed: 195,
        critChance: 44,
        aggroRadius: 22,
        attackRange: 2.8,
        xpReward: 2600,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.68,
        torsoHitboxHeight: 1.15,
        lootTags: ["Colmillo de Sable", "Piel Atigrada", "Garra Veloz"]
      }
    },
    iron_boar_juggernaut: {
      id: "enemy_iron_boar_gorgrond",
      name: "Gorgrond Colmillo-Hierro",
      title: "Jabal\xED de Asedio Acorazado",
      raceCategory: "beasts",
      bodyPlan: "quadruped_beast",
      archetype: "iron_boar_juggernaut",
      helm: "tauren_bull_horns",
      weapon: "ram_charge",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.12,
        torsoBulk: 1.58,
        shoulderWidth: 1.55,
        hornLength: 1.45,
        hornCurve: 1.15,
        pauldronSize: 1.45,
        weaponScale: 1.2,
        dorsalScale: 1.3,
        limbLength: 0.92,
        neckLength: 0.5,
        tailLength: 0.55,
        snoutLength: 1.4,
        headCount: 1,
        auraShardCount: 12
      },
      materials: {
        preset: "blued_steel",
        ...MATERIAL_PRESETS.blued_steel,
        primaryColor: "#3f2e21",
        secondaryColor: "#64748b",
        emissiveColor: "#f97316"
      },
      stats: {
        level: 44,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Shield Wall Tank",
        hp: 14500,
        attack: 640,
        defense: 780,
        speed: 140,
        critChance: 22,
        aggroRadius: 16,
        attackRange: 2.9,
        xpReward: 3800,
        headHitboxRadius: 0.44,
        torsoHitboxRadius: 0.9,
        torsoHitboxHeight: 1.3,
        lootTags: ["Colmillo de Hierro", "Placa Dorsal de Jabal\xED", "Cuero Grueso"]
      }
    },
    // ================= 4. MÁGICOS, DEMONIOS Y ELEMENTALES (7) =================
    solar_phoenix: {
      id: "enemy_solar_phoenix",
      name: "Aethelgard F\xE9nix de Ascuas",
      title: "Ave Elemental del Sol Inmortal",
      raceCategory: "magical",
      bodyPlan: "floating_magical",
      archetype: "solar_phoenix",
      helm: "avian_phoenix_beak",
      weapon: "dragon_breath_maw",
      offhand: "none",
      dorsal: "seraph_wings",
      morphology: {
        heightScale: 1.22,
        torsoBulk: 0.95,
        shoulderWidth: 1.3,
        hornLength: 1.35,
        hornCurve: 0.9,
        pauldronSize: 1,
        weaponScale: 1.1,
        dorsalScale: 1.8,
        limbLength: 1,
        neckLength: 1.25,
        tailLength: 1.55,
        snoutLength: 1.2,
        headCount: 1,
        auraShardCount: 28
      },
      materials: {
        preset: "anisotropic_gold",
        ...MATERIAL_PRESETS.anisotropic_gold,
        primaryColor: "#ea580c",
        secondaryColor: "#facc15",
        emissiveColor: "#fef08a",
        emissiveIntensity: 2.6
      },
      stats: {
        level: 68,
        tier: "Raid Boss",
        element: "Fuego Solar",
        aiBehavior: "Aerial Breath Sweeper",
        hp: 26800,
        attack: 1020,
        defense: 540,
        speed: 190,
        critChance: 36,
        aggroRadius: 26,
        attackRange: 11,
        xpReward: 14200,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.72,
        torsoHitboxHeight: 1.55,
        lootTags: ["Pluma de Renacimiento", "Ceniza Solar", "N\xFAcleo \xCDgneo"]
      }
    },
    arcane_beholder: {
      id: "enemy_arcane_beholder",
      name: "Xanath el Omnisciente",
      title: "Ojo Tirano del Vac\xEDo Astral",
      raceCategory: "magical",
      bodyPlan: "floating_magical",
      archetype: "arcane_beholder",
      helm: "beholder_cyclops_eye",
      weapon: "dragon_breath_maw",
      offhand: "phylactery_orb",
      dorsal: "beholder_eye_tentacles",
      morphology: {
        heightScale: 1.15,
        torsoBulk: 1.38,
        shoulderWidth: 1.25,
        hornLength: 1.4,
        hornCurve: 1.1,
        pauldronSize: 0.8,
        weaponScale: 1,
        dorsalScale: 1.55,
        limbLength: 0.9,
        neckLength: 0.3,
        tailLength: 0.8,
        snoutLength: 0.6,
        headCount: 1,
        auraShardCount: 26
      },
      materials: {
        preset: "arcane_crystal",
        ...MATERIAL_PRESETS.arcane_crystal
      },
      stats: {
        level: 64,
        tier: "Raid Boss",
        element: "Arcano",
        aiBehavior: "Arcane Artillery",
        hp: 22400,
        attack: 980,
        defense: 490,
        speed: 120,
        critChance: 32,
        aggroRadius: 26,
        attackRange: 14.5,
        xpReward: 11800,
        headHitboxRadius: 0.62,
        torsoHitboxRadius: 0.78,
        torsoHitboxHeight: 1.45,
        lootTags: ["Lente de Ojo Tirano", "Tent\xE1culo Et\xE9reo", "Cristal de Disyunci\xF3n"]
      }
    },
    obsidian_golem: {
      id: "enemy_obsidian_colossus",
      name: "Kragmos N\xFAcleo-Forja",
      title: "Coloso de Obsidiana R\xFAnica",
      raceCategory: "magical",
      bodyPlan: "biped_titan",
      archetype: "obsidian_golem",
      helm: "monolith_visor",
      weapon: "obsidian_warhammer",
      offhand: "runic_buckler",
      dorsal: "crystal_pylons",
      morphology: {
        heightScale: 1.32,
        torsoBulk: 1.48,
        shoulderWidth: 1.5,
        hornLength: 0.45,
        hornCurve: 0.3,
        pauldronSize: 1.5,
        weaponScale: 1.35,
        dorsalScale: 1.4,
        limbLength: 1,
        neckLength: 0.4,
        tailLength: 0,
        snoutLength: 0.4,
        headCount: 1,
        auraShardCount: 24
      },
      materials: {
        preset: "abyssal_obsidian",
        ...MATERIAL_PRESETS.abyssal_obsidian
      },
      stats: {
        level: 60,
        tier: "Raid Boss",
        element: "Fuego Solar",
        aiBehavior: "Boss Multi-Phase",
        hp: 28500,
        attack: 740,
        defense: 980,
        speed: 65,
        critChance: 12,
        aggroRadius: 18,
        attackRange: 4,
        xpReward: 9800,
        headHitboxRadius: 0.42,
        torsoHitboxRadius: 0.88,
        torsoHitboxHeight: 1.75,
        lootTags: ["N\xFAcleo de Magma", "Martillo de Titanes", "Bloque de Obsidiana Pura"]
      }
    },
    arch_lich: {
      id: "enemy_arch_lich_velkan",
      name: "Archiliche Velkan",
      title: "Soberano de la Cripta Silente",
      raceCategory: "magical",
      bodyPlan: "floating_magical",
      archetype: "arch_lich",
      helm: "crowned_skull",
      weapon: "arcane_staff",
      offhand: "phylactery_orb",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.18,
        torsoBulk: 0.88,
        shoulderWidth: 1.1,
        hornLength: 1.25,
        hornCurve: 0.4,
        pauldronSize: 1.15,
        weaponScale: 1.25,
        dorsalScale: 1.35,
        limbLength: 1.15,
        neckLength: 0.6,
        tailLength: 0,
        snoutLength: 0.5,
        headCount: 1,
        auraShardCount: 26
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone
      },
      stats: {
        level: 55,
        tier: "Mini-Boss",
        element: "Escarcha",
        aiBehavior: "Arcane Artillery",
        hp: 12400,
        attack: 830,
        defense: 360,
        speed: 110,
        critChance: 28,
        aggroRadius: 22,
        attackRange: 12.5,
        xpReward: 5600,
        headHitboxRadius: 0.34,
        torsoHitboxRadius: 0.54,
        torsoHitboxHeight: 1.5,
        lootTags: ["Filacteria Real", "Bast\xF3n del Vac\xEDo", "Pergamino Prohibido"]
      }
    },
    void_djinn: {
      id: "enemy_void_djinn_alzahir",
      name: "Al-Zahir Se\xF1or del C\xE9firo",
      title: "Djinn Astral de las Arenas del Vac\xEDo",
      raceCategory: "magical",
      bodyPlan: "floating_magical",
      archetype: "void_djinn",
      helm: "valkyrie_crest",
      weapon: "twin_reaver_axes",
      offhand: "phylactery_orb",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.26,
        torsoBulk: 1.25,
        shoulderWidth: 1.42,
        hornLength: 1.2,
        hornCurve: 0.85,
        pauldronSize: 1.35,
        weaponScale: 1.3,
        dorsalScale: 1.5,
        limbLength: 1.1,
        neckLength: 0.55,
        tailLength: 1.2,
        snoutLength: 0.45,
        headCount: 1,
        auraShardCount: 30
      },
      materials: {
        preset: "arcane_crystal",
        ...MATERIAL_PRESETS.arcane_crystal,
        primaryColor: "#0284c7",
        secondaryColor: "#facc15",
        emissiveColor: "#38bdf8"
      },
      stats: {
        level: 62,
        tier: "Mini-Boss",
        element: "Arcano",
        aiBehavior: "Arcane Artillery",
        hp: 19200,
        attack: 880,
        defense: 520,
        speed: 165,
        critChance: 30,
        aggroRadius: 24,
        attackRange: 10,
        xpReward: 8600,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.72,
        torsoHitboxHeight: 1.65,
        lootTags: ["L\xE1mpara del Vac\xEDo", "Brazalete de Djinn", "Esencia de Tormenta"]
      }
    },
    balrog_archdemon: {
      id: "enemy_balrog_archdemon",
      name: "Baelgor Se\xF1or del Foso",
      title: "Archidemonio Primordial de Ceniza y Magma",
      raceCategory: "magical",
      bodyPlan: "biped_titan",
      archetype: "balrog_archdemon",
      helm: "tauren_bull_horns",
      weapon: "runic_greatsword",
      offhand: "dual_blade",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 1.42,
        torsoBulk: 1.5,
        shoulderWidth: 1.56,
        hornLength: 1.75,
        hornCurve: 1.35,
        pauldronSize: 1.45,
        weaponScale: 1.55,
        dorsalScale: 1.8,
        limbLength: 1.18,
        neckLength: 0.7,
        tailLength: 1.65,
        snoutLength: 0.95,
        headCount: 1,
        auraShardCount: 28
      },
      materials: {
        preset: "abyssal_obsidian",
        ...MATERIAL_PRESETS.abyssal_obsidian,
        primaryColor: "#18181b",
        secondaryColor: "#dc2626",
        emissiveColor: "#f97316",
        emissiveIntensity: 2.8
      },
      stats: {
        level: 90,
        tier: "Raid Boss",
        element: "Fuego Drac\xF3nico",
        aiBehavior: "Boss Multi-Phase",
        hp: 52e3,
        attack: 1280,
        defense: 940,
        speed: 135,
        critChance: 35,
        aggroRadius: 28,
        attackRange: 5.5,
        xpReward: 26e3,
        headHitboxRadius: 0.48,
        torsoHitboxRadius: 0.95,
        torsoHitboxHeight: 1.95,
        lootTags: ["Espada de Magma", "Cuerno de Baelgor", "Coraz\xF3n del Abismo"]
      }
    },
    treant_ancient: {
      id: "enemy_treant_yggdrakor",
      name: "Yggdrakor Ra\xEDz-Eterna",
      title: "Guardi\xE1n Arb\xF3reo Ancestral del Bosque",
      raceCategory: "magical",
      bodyPlan: "biped_titan",
      archetype: "treant_ancient",
      helm: "crowned_skull",
      weapon: "obsidian_warhammer",
      offhand: "tower_shield",
      dorsal: "crystal_pylons",
      morphology: {
        heightScale: 1.38,
        torsoBulk: 1.42,
        shoulderWidth: 1.48,
        hornLength: 1.6,
        hornCurve: 0.85,
        pauldronSize: 1.4,
        weaponScale: 1.35,
        dorsalScale: 1.5,
        limbLength: 1.25,
        neckLength: 0.5,
        tailLength: 0,
        snoutLength: 0.6,
        headCount: 1,
        auraShardCount: 22
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#3f2e21",
        secondaryColor: "#15803d",
        emissiveColor: "#4ade80",
        emissiveIntensity: 2
      },
      stats: {
        level: 56,
        tier: "Mini-Boss",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Shield Wall Tank",
        hp: 25600,
        attack: 690,
        defense: 910,
        speed: 75,
        critChance: 15,
        aggroRadius: 18,
        attackRange: 4.2,
        xpReward: 7800,
        headHitboxRadius: 0.44,
        torsoHitboxRadius: 0.88,
        torsoHitboxHeight: 1.85,
        lootTags: ["Corteza Milenaria", "Savia Luminosa", "Semilla del Mundo"]
      }
    },
    // ================= 5. CAMPEONES Y GUERREROS OSCUROS (6) =================
    abyssal_knight: {
      id: "enemy_abyssal_dreadknight",
      name: "Malakor el Juramentado",
      title: "Caballero Abisal de la Primera Guardia",
      raceCategory: "humanoids",
      bodyPlan: "biped_titan",
      archetype: "abyssal_knight",
      helm: "horned_greathelm",
      weapon: "runic_greatsword",
      offhand: "tower_shield",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.12,
        torsoBulk: 1.18,
        shoulderWidth: 1.25,
        hornLength: 1.15,
        hornCurve: 0.85,
        pauldronSize: 1.3,
        weaponScale: 1.2,
        dorsalScale: 1.15,
        limbLength: 1.05,
        neckLength: 0.5,
        tailLength: 0,
        snoutLength: 0.4,
        headCount: 1,
        auraShardCount: 16
      },
      materials: {
        preset: "blued_steel",
        ...MATERIAL_PRESETS.blued_steel
      },
      stats: {
        level: 45,
        tier: "Elite",
        element: "Abisal",
        aiBehavior: "Shield Wall Tank",
        hp: 9400,
        attack: 480,
        defense: 620,
        speed: 95,
        critChance: 18,
        aggroRadius: 14,
        attackRange: 3.2,
        xpReward: 2450,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.65,
        torsoHitboxHeight: 1.45,
        lootTags: ["Mandoble R\xFAnico", "Escama de Acero Abisal", "Esencia Sombr\xEDa"]
      }
    },
    solar_valkyrie: {
      id: "enemy_solar_valkyrie",
      name: "Seraphina Aurelia",
      title: "Valquiria Ejecutora del Trono Solar",
      raceCategory: "humanoids",
      bodyPlan: "biped_titan",
      archetype: "solar_valkyrie",
      helm: "valkyrie_crest",
      weapon: "radiant_halberd",
      offhand: "runic_buckler",
      dorsal: "seraph_wings",
      morphology: {
        heightScale: 1.2,
        torsoBulk: 0.96,
        shoulderWidth: 1.18,
        hornLength: 1.1,
        hornCurve: 0.65,
        pauldronSize: 1.15,
        weaponScale: 1.3,
        dorsalScale: 1.55,
        limbLength: 1.14,
        neckLength: 0.55,
        tailLength: 0,
        snoutLength: 0.4,
        headCount: 1,
        auraShardCount: 20
      },
      materials: {
        preset: "anisotropic_gold",
        ...MATERIAL_PRESETS.anisotropic_gold
      },
      stats: {
        level: 58,
        tier: "Raid Boss",
        element: "Fuego Solar",
        aiBehavior: "Boss Multi-Phase",
        hp: 18900,
        attack: 740,
        defense: 610,
        speed: 145,
        critChance: 30,
        aggroRadius: 20,
        attackRange: 4.5,
        xpReward: 8400,
        headHitboxRadius: 0.34,
        torsoHitboxRadius: 0.56,
        torsoHitboxHeight: 1.55,
        lootTags: ["Pluma de Oro Solar", "Alabarda Celestial", "Sello de Seraf\xEDn"]
      }
    },
    drake_berserker: {
      id: "enemy_drake_berserker",
      name: "Vorgar Sangredrag\xF3n",
      title: "Berserker Juramentado del Cr\xE1ter",
      raceCategory: "humanoids",
      bodyPlan: "biped_titan",
      archetype: "drake_berserker",
      helm: "drake_fang_helm",
      weapon: "twin_reaver_axes",
      offhand: "dual_blade",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.22,
        torsoBulk: 1.34,
        shoulderWidth: 1.42,
        hornLength: 1.55,
        hornCurve: 1.1,
        pauldronSize: 1.4,
        weaponScale: 1.3,
        dorsalScale: 1.25,
        limbLength: 1.08,
        neckLength: 0.65,
        tailLength: 1.25,
        snoutLength: 0.85,
        headCount: 1,
        auraShardCount: 16
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales
      },
      stats: {
        level: 50,
        tier: "Mini-Boss",
        element: "Fuego Drac\xF3nico",
        aiBehavior: "Aggressive Berserker",
        hp: 15200,
        attack: 730,
        defense: 510,
        speed: 130,
        critChance: 26,
        aggroRadius: 16,
        attackRange: 3.1,
        xpReward: 4900,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.72,
        torsoHitboxHeight: 1.6,
        lootTags: ["Colmillo de Drag\xF3n", "Hacha de Ceniza", "Coraz\xF3n \xCDgneo"]
      }
    },
    samurai_oni: {
      id: "enemy_samurai_oni_kensei",
      name: "Kensei Akuma",
      title: "Oni Samur\xE1i del Clan de la Luna Roja",
      raceCategory: "humanoids",
      bodyPlan: "biped_titan",
      archetype: "samurai_oni",
      helm: "horned_greathelm",
      weapon: "runic_greatsword",
      offhand: "dual_blade",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.2,
        torsoBulk: 1.26,
        shoulderWidth: 1.34,
        hornLength: 1.45,
        hornCurve: 1.15,
        pauldronSize: 1.4,
        weaponScale: 1.38,
        dorsalScale: 1.15,
        limbLength: 1.08,
        neckLength: 0.5,
        tailLength: 0,
        snoutLength: 0.5,
        headCount: 1,
        auraShardCount: 18
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#450a0a",
        secondaryColor: "#d4a349",
        emissiveColor: "#f43f5e"
      },
      stats: {
        level: 56,
        tier: "Mini-Boss",
        element: "Abisal",
        aiBehavior: "Aggressive Berserker",
        hp: 16800,
        attack: 860,
        defense: 580,
        speed: 155,
        critChance: 38,
        aggroRadius: 18,
        attackRange: 3.6,
        xpReward: 6900,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.68,
        torsoHitboxHeight: 1.55,
        lootTags: ["Nodachi Maldita", "M\xE1scara Oni", "Sello Carmes\xED"]
      }
    },
    vampire_lord: {
      id: "enemy_vampire_lord_valerius",
      name: "Lord Valerius Sangre-Real",
      title: "Patriarca Vampiro de la Ciudadela",
      raceCategory: "humanoids",
      bodyPlan: "biped_titan",
      archetype: "vampire_lord",
      helm: "crowned_skull",
      weapon: "runic_greatsword",
      offhand: "phylactery_orb",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 1.22,
        torsoBulk: 1.02,
        shoulderWidth: 1.24,
        hornLength: 0.85,
        hornCurve: 0.6,
        pauldronSize: 1.2,
        weaponScale: 1.2,
        dorsalScale: 1.55,
        limbLength: 1.16,
        neckLength: 0.6,
        tailLength: 0,
        snoutLength: 0.45,
        headCount: 1,
        auraShardCount: 22
      },
      materials: {
        preset: "abyssal_obsidian",
        ...MATERIAL_PRESETS.abyssal_obsidian,
        primaryColor: "#1f1218",
        secondaryColor: "#991b1b",
        emissiveColor: "#e11d48"
      },
      stats: {
        level: 64,
        tier: "Raid Boss",
        element: "Abisal",
        aiBehavior: "Boss Multi-Phase",
        hp: 23500,
        attack: 910,
        defense: 620,
        speed: 175,
        critChance: 36,
        aggroRadius: 22,
        attackRange: 4,
        xpReward: 12400,
        headHitboxRadius: 0.35,
        torsoHitboxRadius: 0.62,
        torsoHitboxHeight: 1.6,
        lootTags: ["C\xE1liz de Sangre", "Estoque Real", "Manto Nocturno"]
      }
    },
    anubis_jackal_guard: {
      id: "enemy_anubis_jackal_anpu",
      name: "Anpu Juez de las Almas",
      title: "Guardi\xE1n Chacal del Sepulcro Dorado",
      raceCategory: "humanoids",
      bodyPlan: "biped_titan",
      archetype: "anubis_jackal_guard",
      helm: "lupine_maw",
      weapon: "radiant_halberd",
      offhand: "tower_shield",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.3,
        torsoBulk: 1.15,
        shoulderWidth: 1.32,
        hornLength: 1.4,
        hornCurve: 0.25,
        pauldronSize: 1.28,
        weaponScale: 1.38,
        dorsalScale: 1.35,
        limbLength: 1.18,
        neckLength: 0.75,
        tailLength: 1.15,
        snoutLength: 1.35,
        headCount: 1,
        auraShardCount: 20
      },
      materials: {
        preset: "anisotropic_gold",
        ...MATERIAL_PRESETS.anisotropic_gold,
        primaryColor: "#171717",
        secondaryColor: "#eab308",
        emissiveColor: "#38bdf8"
      },
      stats: {
        level: 60,
        tier: "Mini-Boss",
        element: "Fuego Solar",
        aiBehavior: "Shield Wall Tank",
        hp: 21e3,
        attack: 810,
        defense: 790,
        speed: 135,
        critChance: 26,
        aggroRadius: 20,
        attackRange: 4.4,
        xpReward: 9200,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.7,
        torsoHitboxHeight: 1.7,
        lootTags: ["B\xE1culo de Anpu", "Escarabajo de Oro", "Balanza del Juicio"]
      }
    },
    // ================= 6. ANIMALES FURIOSOS NV.1-12 ESTILO LINEAGE (10) =================
    furious_keltir: {
      id: "enemy_lineage_furious_keltir",
      name: "Keltir Furioso de las Llanuras",
      title: "Zorro Chacal Salvaje de Isla Parlante (Nv. 1)",
      raceCategory: "starter_animals",
      bodyPlan: "quadruped_beast",
      archetype: "furious_keltir",
      helm: "lupine_maw",
      weapon: "feral_claws_fangs",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 0.78,
        torsoBulk: 0.76,
        shoulderWidth: 0.82,
        hornLength: 0.65,
        hornCurve: 0.25,
        pauldronSize: 0.35,
        weaponScale: 0.85,
        dorsalScale: 0.65,
        limbLength: 0.88,
        neckLength: 0.55,
        tailLength: 1.25,
        snoutLength: 1.05,
        headCount: 1,
        auraShardCount: 0
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#8c4324",
        secondaryColor: "#d99b52",
        underbodyColor: "#3b2116",
        emissiveColor: "#ff4500",
        emissiveIntensity: 1.9,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 1,
        tier: "Minion",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Pack Alpha Predator",
        hp: 145,
        attack: 22,
        defense: 14,
        speed: 145,
        critChance: 10,
        aggroRadius: 8,
        attackRange: 1.6,
        xpReward: 28,
        headHitboxRadius: 0.24,
        torsoHitboxRadius: 0.38,
        torsoHitboxHeight: 0.75,
        lootTags: ["Piel de Keltir", "Colmillo Peque\xF1o", "Adena (15-30)"]
      }
    },
    rabid_grey_wolf: {
      id: "enemy_lineage_rabid_wolf",
      name: "Lobo Gris Rabioso",
      title: "Depredador Furioso de Aldea Inicial (Nv. 3)",
      raceCategory: "starter_animals",
      bodyPlan: "quadruped_beast",
      archetype: "rabid_grey_wolf",
      helm: "lupine_maw",
      weapon: "feral_claws_fangs",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 0.88,
        torsoBulk: 0.88,
        shoulderWidth: 0.92,
        hornLength: 0.52,
        hornCurve: 0.2,
        pauldronSize: 0.35,
        weaponScale: 0.95,
        dorsalScale: 0.75,
        limbLength: 0.98,
        neckLength: 0.62,
        tailLength: 1.15,
        snoutLength: 1.2,
        headCount: 1,
        auraShardCount: 0
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#4b5563",
        secondaryColor: "#9ca3af",
        underbodyColor: "#1f2937",
        emissiveColor: "#ef4444",
        emissiveIntensity: 2.1,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 3,
        tier: "Minion",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Pack Alpha Predator",
        hp: 290,
        attack: 42,
        defense: 28,
        speed: 158,
        critChance: 14,
        aggroRadius: 11,
        attackRange: 1.9,
        xpReward: 65,
        headHitboxRadius: 0.28,
        torsoHitboxRadius: 0.45,
        torsoHitboxHeight: 0.9,
        lootTags: ["Pelaje de Lobo Gris", "Carne Cruda", "Colmillo Afilado"]
      }
    },
    rabid_fang_bat: {
      id: "enemy_lineage_rabid_bat",
      name: "Murci\xE9lago Colmillo Sangriento",
      title: "Quir\xF3ptero Furioso de las Ruinas (Nv. 4)",
      raceCategory: "starter_animals",
      bodyPlan: "dragon_wyvern",
      archetype: "rabid_fang_bat",
      helm: "lupine_maw",
      weapon: "feral_claws_fangs",
      offhand: "none",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 0.78,
        torsoBulk: 0.78,
        shoulderWidth: 0.88,
        hornLength: 0.78,
        hornCurve: 0.18,
        pauldronSize: 0.35,
        weaponScale: 0.88,
        dorsalScale: 1.18,
        limbLength: 0.82,
        neckLength: 0.32,
        tailLength: 0.35,
        snoutLength: 0.65,
        headCount: 1,
        auraShardCount: 0
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#311b2b",
        secondaryColor: "#701a3c",
        underbodyColor: "#170d14",
        emissiveColor: "#f43f5e",
        emissiveIntensity: 2.2,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 4,
        tier: "Minion",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Ambush Stalker",
        hp: 340,
        attack: 54,
        defense: 24,
        speed: 175,
        critChance: 18,
        aggroRadius: 12,
        attackRange: 1.8,
        xpReward: 85,
        headHitboxRadius: 0.25,
        torsoHitboxRadius: 0.4,
        torsoHitboxHeight: 0.8,
        lootTags: ["Ala de Murci\xE9lago", "Colmillo Vamp\xEDrico", "Hueso de Animal"]
      }
    },
    furious_grizzly_bear: {
      id: "enemy_lineage_furious_grizzly",
      name: "Oso Pardo Furioso",
      title: "Grizzly Desgarrador del Bosque \xC9lfico (Nv. 5)",
      raceCategory: "starter_animals",
      bodyPlan: "quadruped_beast",
      archetype: "furious_grizzly_bear",
      helm: "lupine_maw",
      weapon: "ram_charge",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.04,
        torsoBulk: 1.28,
        shoulderWidth: 1.24,
        hornLength: 0.28,
        hornCurve: 0.2,
        pauldronSize: 0.38,
        weaponScale: 1.15,
        dorsalScale: 0.72,
        limbLength: 0.94,
        neckLength: 0.42,
        tailLength: 0.22,
        snoutLength: 0.92,
        headCount: 1,
        auraShardCount: 0
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#452715",
        secondaryColor: "#78472a",
        underbodyColor: "#24140b",
        emissiveColor: "#f97316",
        emissiveIntensity: 1.9,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 5,
        tier: "Minion",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Aggressive Berserker",
        hp: 580,
        attack: 74,
        defense: 58,
        speed: 118,
        critChance: 12,
        aggroRadius: 11,
        attackRange: 2.2,
        xpReward: 120,
        headHitboxRadius: 0.34,
        torsoHitboxRadius: 0.62,
        torsoHitboxHeight: 1.15,
        lootTags: ["Piel de Oso Gruesa", "Garra de Grizzly", "Hiel de Oso"]
      }
    },
    venom_marsh_toad: {
      id: "enemy_lineage_venom_toad",
      name: "Sapo Gigante del Pantano",
      title: "Anfibio Venenoso de las Ci\xE9nagas (Nv. 5)",
      raceCategory: "starter_animals",
      bodyPlan: "quadruped_beast",
      archetype: "venom_marsh_toad",
      helm: "draconic_snout",
      weapon: "feral_claws_fangs",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 0.82,
        torsoBulk: 1.32,
        shoulderWidth: 1.22,
        hornLength: 0.18,
        hornCurve: 0.3,
        pauldronSize: 0.35,
        weaponScale: 0.85,
        dorsalScale: 0.8,
        limbLength: 0.82,
        neckLength: 0.25,
        tailLength: 0.12,
        snoutLength: 0.72,
        headCount: 1,
        auraShardCount: 0
      },
      materials: {
        preset: "corroded_bronze",
        ...MATERIAL_PRESETS.corroded_bronze,
        primaryColor: "#2d4f2e",
        secondaryColor: "#65a30d",
        underbodyColor: "#1a2e1b",
        emissiveColor: "#84cc16",
        emissiveIntensity: 2.1,
        texturePattern: "scales"
      },
      stats: {
        level: 5,
        tier: "Minion",
        element: "Veneno",
        aiBehavior: "Ambush Stalker",
        hp: 490,
        attack: 62,
        defense: 48,
        speed: 125,
        critChance: 14,
        aggroRadius: 10,
        attackRange: 2.4,
        xpReward: 115,
        headHitboxRadius: 0.35,
        torsoHitboxRadius: 0.58,
        torsoHitboxHeight: 0.9,
        lootTags: ["Gl\xE1ndula de Veneno", "Piel Viscosa", "Hierba de Pantano"]
      }
    },
    rabid_razorback_boar: {
      id: "enemy_lineage_razorback_boar",
      name: "Jabal\xED Lomo de Navaja",
      title: "Verraco Rabioso de Gludio (Nv. 6)",
      raceCategory: "starter_animals",
      bodyPlan: "quadruped_beast",
      archetype: "rabid_razorback_boar",
      helm: "tauren_bull_horns",
      weapon: "ram_charge",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 0.88,
        torsoBulk: 1.18,
        shoulderWidth: 1.15,
        hornLength: 0.92,
        hornCurve: 0.85,
        pauldronSize: 0.35,
        weaponScale: 0.95,
        dorsalScale: 1.05,
        limbLength: 0.82,
        neckLength: 0.35,
        tailLength: 0.42,
        snoutLength: 1.05,
        headCount: 1,
        auraShardCount: 0
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#3f2e21",
        secondaryColor: "#85684e",
        underbodyColor: "#1f1610",
        emissiveColor: "#ef4444",
        emissiveIntensity: 2,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 6,
        tier: "Minion",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Aggressive Berserker",
        hp: 640,
        attack: 82,
        defense: 64,
        speed: 138,
        critChance: 15,
        aggroRadius: 12,
        attackRange: 2,
        xpReward: 150,
        headHitboxRadius: 0.32,
        torsoHitboxRadius: 0.56,
        torsoHitboxHeight: 0.95,
        lootTags: ["Colmillo de Jabal\xED", "Cuero Duro", "Chuleta Salvaje"]
      }
    },
    bloodclaw_raptor_hawk: {
      id: "enemy_lineage_bloodclaw_hawk",
      name: "Halc\xF3n Garrasangrienta",
      title: "Ave de Presa Furiosa de las Colinas (Nv. 6)",
      raceCategory: "starter_animals",
      bodyPlan: "dragon_wyvern",
      archetype: "bloodclaw_raptor_hawk",
      helm: "avian_phoenix_beak",
      weapon: "feral_claws_fangs",
      offhand: "none",
      dorsal: "seraph_wings",
      morphology: {
        heightScale: 0.84,
        torsoBulk: 0.82,
        shoulderWidth: 0.92,
        hornLength: 0.48,
        hornCurve: 0.55,
        pauldronSize: 0.35,
        weaponScale: 0.98,
        dorsalScale: 1.22,
        limbLength: 0.88,
        neckLength: 0.52,
        tailLength: 0.78,
        snoutLength: 0.95,
        headCount: 1,
        auraShardCount: 0
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#5c3a21",
        secondaryColor: "#d97706",
        underbodyColor: "#291a0f",
        emissiveColor: "#f59e0b",
        emissiveIntensity: 2,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 6,
        tier: "Minion",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Aerial Breath Sweeper",
        hp: 510,
        attack: 88,
        defense: 42,
        speed: 182,
        critChance: 22,
        aggroRadius: 15,
        attackRange: 2.1,
        xpReward: 155,
        headHitboxRadius: 0.26,
        torsoHitboxRadius: 0.44,
        torsoHitboxHeight: 0.9,
        lootTags: ["Pluma de Halc\xF3n", "Garra Afilada", "Pico Curvo"]
      }
    },
    furious_antler_stag: {
      id: "enemy_lineage_antler_stag",
      name: "Ciervo Cornamenta Furioso",
      title: "Venado Enloquecido de los Bosques (Nv. 7)",
      raceCategory: "starter_animals",
      bodyPlan: "quadruped_beast",
      archetype: "furious_antler_stag",
      helm: "tauren_bull_horns",
      weapon: "ram_charge",
      offhand: "none",
      dorsal: "none",
      morphology: {
        heightScale: 1.06,
        torsoBulk: 0.88,
        shoulderWidth: 0.92,
        hornLength: 1.55,
        hornCurve: 1.15,
        pauldronSize: 0.35,
        weaponScale: 0.9,
        dorsalScale: 0.75,
        limbLength: 1.18,
        neckLength: 0.98,
        tailLength: 0.35,
        snoutLength: 1.12,
        headCount: 1,
        auraShardCount: 0
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#6b3e26",
        secondaryColor: "#d6c7b2",
        underbodyColor: "#2e1b10",
        emissiveColor: "#ef4444",
        emissiveIntensity: 2,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 7,
        tier: "Minion",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Aggressive Berserker",
        hp: 690,
        attack: 94,
        defense: 55,
        speed: 168,
        critChance: 16,
        aggroRadius: 13,
        attackRange: 2.2,
        xpReward: 185,
        headHitboxRadius: 0.32,
        torsoHitboxRadius: 0.5,
        torsoHitboxHeight: 1.1,
        lootTags: ["Asta de Ciervo", "Gamuza Suave", "Tend\xF3n El\xE1stico"]
      }
    },
    feral_shadow_panther: {
      id: "enemy_lineage_shadow_panther",
      name: "Pantera Acechadora Oscura",
      title: "Felino Furioso del Bosque Oscuro (Nv. 8)",
      raceCategory: "starter_animals",
      bodyPlan: "quadruped_beast",
      archetype: "feral_shadow_panther",
      helm: "lupine_maw",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "none",
      morphology: {
        heightScale: 0.92,
        torsoBulk: 0.86,
        shoulderWidth: 0.95,
        hornLength: 0.32,
        hornCurve: 0.22,
        pauldronSize: 0.35,
        weaponScale: 1.05,
        dorsalScale: 0.7,
        limbLength: 1.05,
        neckLength: 0.68,
        tailLength: 1.48,
        snoutLength: 0.95,
        headCount: 1,
        auraShardCount: 0
      },
      materials: {
        preset: "abyssal_obsidian",
        ...MATERIAL_PRESETS.abyssal_obsidian,
        primaryColor: "#181824",
        secondaryColor: "#312e48",
        underbodyColor: "#0c0c12",
        emissiveColor: "#facc15",
        emissiveIntensity: 2.2,
        roughness: 0.62,
        metalness: 0.12,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 8,
        tier: "Minion",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Ambush Stalker",
        hp: 760,
        attack: 118,
        defense: 52,
        speed: 185,
        critChance: 28,
        aggroRadius: 15,
        attackRange: 2.1,
        xpReward: 230,
        headHitboxRadius: 0.28,
        torsoHitboxRadius: 0.46,
        torsoHitboxHeight: 0.95,
        lootTags: ["Piel de Pantera Negra", "Colmillo Felino", "Ojo \xC1mbar"]
      }
    },
    forest_hunter_spider: {
      id: "enemy_lineage_forest_spider",
      name: "Ara\xF1a Cazadora de Dion",
      title: "Tar\xE1ntula Furiosa de las Llanuras (Nv. 9)",
      raceCategory: "starter_animals",
      bodyPlan: "arachnid_scorpion",
      archetype: "forest_hunter_spider",
      helm: "arachnid_mandibles",
      weapon: "feral_claws_fangs",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 0.84,
        torsoBulk: 0.92,
        shoulderWidth: 0.95,
        hornLength: 0.65,
        hornCurve: 0.55,
        pauldronSize: 0.35,
        weaponScale: 0.92,
        dorsalScale: 0.85,
        limbLength: 1.02,
        neckLength: 0.28,
        tailLength: 0.35,
        snoutLength: 0.72,
        headCount: 1,
        auraShardCount: 0
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#3b281e",
        secondaryColor: "#a16207",
        underbodyColor: "#1c130e",
        emissiveColor: "#84cc16",
        emissiveIntensity: 2.1,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 9,
        tier: "Minion",
        element: "Veneno",
        aiBehavior: "Ambush Stalker",
        hp: 840,
        attack: 126,
        defense: 68,
        speed: 162,
        critChance: 22,
        aggroRadius: 14,
        attackRange: 2.2,
        xpReward: 275,
        headHitboxRadius: 0.28,
        torsoHitboxRadius: 0.52,
        torsoHitboxHeight: 0.85,
        lootTags: ["Seda de Ara\xF1a", "Quel\xEDcero Venenoso", "Caparaz\xF3n Ligero"]
      }
    },
    // ============================================================================
    // 7. ELEMENTALES Y BESTIAS DE AIRE, AGUA Y HIELO (20)
    // ============================================================================
    leviathan_abyssal: {
      id: "enemy_elem_leviathan_abyssal",
      name: "Leviat\xE1n de las Fosas Abisales",
      title: "Drag\xF3n Marino de Marea Profunda (Nv. 84)",
      raceCategory: "air_water_ice",
      bodyPlan: "dragon_wyvern",
      archetype: "leviathan_abyssal",
      helm: "draconic_snout",
      weapon: "frost_breath_maw",
      offhand: "none",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 1.38,
        torsoBulk: 1.32,
        shoulderWidth: 1.28,
        hornLength: 1.45,
        hornCurve: 1.15,
        pauldronSize: 1.1,
        weaponScale: 1.25,
        dorsalScale: 1.55,
        limbLength: 1.12,
        neckLength: 1.38,
        tailLength: 1.65,
        snoutLength: 1.3,
        headCount: 1,
        auraShardCount: 16
      },
      materials: {
        preset: "arcane_crystal",
        ...MATERIAL_PRESETS.arcane_crystal,
        primaryColor: "#064e63",
        secondaryColor: "#14b8a6",
        underbodyColor: "#042f3e",
        emissiveColor: "#22d3ee",
        emissiveIntensity: 2.6,
        texturePattern: "scales",
        textureRelief: 1.15
      },
      stats: {
        level: 84,
        tier: "Raid Boss",
        element: "Escarcha",
        aiBehavior: "Aerial Breath Sweeper",
        hp: 46500,
        attack: 910,
        defense: 720,
        speed: 142,
        critChance: 26,
        aggroRadius: 34,
        attackRange: 9.5,
        xpReward: 26400,
        headHitboxRadius: 0.56,
        torsoHitboxRadius: 0.96,
        torsoHitboxHeight: 2.1,
        lootTags: ["Escama de Leviat\xE1n Abisal", "Coraz\xF3n de Marea Viva", "Perla del Abismo"]
      }
    },
    glacier_wyrm_ancient: {
      id: "enemy_elem_glacier_wyrm",
      name: "Sierpe Glacial de Escarcha Eterna",
      title: "Wyrm \xC1rtico de Cristal Helado (Nv. 82)",
      raceCategory: "air_water_ice",
      bodyPlan: "dragon_wyvern",
      archetype: "glacier_wyrm_ancient",
      helm: "drake_fang_helm",
      weapon: "frost_breath_maw",
      offhand: "none",
      dorsal: "crystal_pylons",
      morphology: {
        heightScale: 1.34,
        torsoBulk: 1.26,
        shoulderWidth: 1.24,
        hornLength: 1.52,
        hornCurve: 0.92,
        pauldronSize: 1.18,
        weaponScale: 1.2,
        dorsalScale: 1.48,
        limbLength: 1.15,
        neckLength: 1.32,
        tailLength: 1.58,
        snoutLength: 1.24,
        headCount: 1,
        auraShardCount: 18
      },
      materials: {
        preset: "arcane_crystal",
        ...MATERIAL_PRESETS.arcane_crystal,
        primaryColor: "#38bdf8",
        secondaryColor: "#e0f2fe",
        underbodyColor: "#0c4a6e",
        emissiveColor: "#7dd3fc",
        emissiveIntensity: 2.8,
        texturePattern: "scales",
        textureRelief: 1.2
      },
      stats: {
        level: 82,
        tier: "Raid Boss",
        element: "Escarcha",
        aiBehavior: "Aerial Breath Sweeper",
        hp: 43200,
        attack: 885,
        defense: 740,
        speed: 136,
        critChance: 25,
        aggroRadius: 32,
        attackRange: 9.2,
        xpReward: 24800,
        headHitboxRadius: 0.54,
        torsoHitboxRadius: 0.92,
        torsoHitboxHeight: 2.05,
        lootTags: ["Colmillo de T\xE9mpano", "Escama de Escarcha Eterna", "N\xFAcleo Crio-Drac\xF3nico"]
      }
    },
    zephyr_storm_elemental: {
      id: "enemy_elem_zephyr_storm",
      name: "Elemental de Tormenta C\xE9firos",
      title: "Se\xF1or de los Vientos y el Hurac\xE1n (Nv. 76)",
      raceCategory: "air_water_ice",
      bodyPlan: "floating_magical",
      archetype: "zephyr_storm_elemental",
      helm: "valkyrie_crest",
      weapon: "arcane_staff",
      offhand: "phylactery_orb",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.28,
        torsoBulk: 1.08,
        shoulderWidth: 1.32,
        hornLength: 1.25,
        hornCurve: 0.85,
        pauldronSize: 1.24,
        weaponScale: 1.3,
        dorsalScale: 1.45,
        limbLength: 1.18,
        neckLength: 0.68,
        tailLength: 0.95,
        snoutLength: 0.55,
        headCount: 1,
        auraShardCount: 24
      },
      materials: {
        preset: "blued_steel",
        ...MATERIAL_PRESETS.blued_steel,
        primaryColor: "#64748b",
        secondaryColor: "#e2e8f0",
        underbodyColor: "#1e293b",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.7,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 76,
        tier: "Mini-Boss",
        element: "Arcano",
        aiBehavior: "Arcane Artillery",
        hp: 26800,
        attack: 820,
        defense: 540,
        speed: 175,
        critChance: 28,
        aggroRadius: 30,
        attackRange: 10.5,
        xpReward: 15200,
        headHitboxRadius: 0.42,
        torsoHitboxRadius: 0.78,
        torsoHitboxHeight: 1.9,
        lootTags: ["Esencia de C\xE9firo", "Cristal de Ventisca", "Orbe Barom\xE9trico"]
      }
    },
    tidal_naiad_queen: {
      id: "enemy_elem_tidal_naiad",
      name: "N\xE1yade Reina de las Mareas",
      title: "Soberana Acu\xE1tica del Arrecife Abisal (Nv. 74)",
      raceCategory: "air_water_ice",
      bodyPlan: "serpentine_naga",
      archetype: "tidal_naiad_queen",
      helm: "valkyrie_crest",
      weapon: "radiant_halberd",
      offhand: "phylactery_orb",
      dorsal: "seraph_wings",
      morphology: {
        heightScale: 1.22,
        torsoBulk: 1.02,
        shoulderWidth: 1.14,
        hornLength: 1.18,
        hornCurve: 0.78,
        pauldronSize: 0.95,
        weaponScale: 1.22,
        dorsalScale: 1.35,
        limbLength: 1.1,
        neckLength: 0.76,
        tailLength: 1.6,
        snoutLength: 0.58,
        headCount: 1,
        auraShardCount: 14,
        hairStyle: "long_flowing_hair"
      },
      materials: {
        preset: "arcane_crystal",
        ...MATERIAL_PRESETS.arcane_crystal,
        primaryColor: "#0d9488",
        secondaryColor: "#99f6e4",
        underbodyColor: "#134e4a",
        emissiveColor: "#2dd4bf",
        emissiveIntensity: 2.4,
        texturePattern: "scales"
      },
      stats: {
        level: 74,
        tier: "Mini-Boss",
        element: "Escarcha",
        aiBehavior: "Arcane Artillery",
        hp: 24500,
        attack: 775,
        defense: 520,
        speed: 158,
        critChance: 24,
        aggroRadius: 28,
        attackRange: 7.5,
        xpReward: 13800,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.72,
        torsoHitboxHeight: 1.85,
        lootTags: ["Diadema de Coral Vivo", "L\xE1grima de N\xE1yade", "Escama de Sirena Real"]
      }
    },
    boreal_blizzard_griffin: {
      id: "enemy_elem_boreal_griffin",
      name: "Grifo de Ventisca Boreal",
      title: "Depredador Alado de las Cumbres Heladas (Nv. 68)",
      raceCategory: "air_water_ice",
      bodyPlan: "quadruped_beast",
      archetype: "boreal_blizzard_griffin",
      helm: "avian_phoenix_beak",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "seraph_wings",
      morphology: {
        heightScale: 1.18,
        torsoBulk: 1.14,
        shoulderWidth: 1.2,
        hornLength: 0.95,
        hornCurve: 0.72,
        pauldronSize: 0.78,
        weaponScale: 1.15,
        dorsalScale: 1.52,
        limbLength: 1.12,
        neckLength: 0.85,
        tailLength: 1.25,
        snoutLength: 0.98,
        headCount: 1,
        auraShardCount: 10,
        hairStyle: "full_fur_coat"
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#cbd5e1",
        secondaryColor: "#38bdf8",
        underbodyColor: "#475569",
        emissiveColor: "#7dd3fc",
        emissiveIntensity: 2.1,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 68,
        tier: "Elite",
        element: "Escarcha",
        aiBehavior: "Pack Alpha Predator",
        hp: 19400,
        attack: 710,
        defense: 480,
        speed: 172,
        critChance: 27,
        aggroRadius: 26,
        attackRange: 3.4,
        xpReward: 9800,
        headHitboxRadius: 0.4,
        torsoHitboxRadius: 0.76,
        torsoHitboxHeight: 1.65,
        lootTags: ["Pluma de Ventisca", "Pico Escarchado", "Garra Boreal"]
      }
    },
    kraken_deep_watcher: {
      id: "enemy_elem_kraken_watcher",
      name: "Kraken Ocular del Abismo",
      title: "Terror Tentacular de Aguas Profundas (Nv. 80)",
      raceCategory: "air_water_ice",
      bodyPlan: "floating_magical",
      archetype: "kraken_deep_watcher",
      helm: "beholder_cyclops_eye",
      weapon: "frost_breath_maw",
      offhand: "none",
      dorsal: "beholder_eye_tentacles",
      morphology: {
        heightScale: 1.3,
        torsoBulk: 1.38,
        shoulderWidth: 1.3,
        hornLength: 1.1,
        hornCurve: 0.95,
        pauldronSize: 1,
        weaponScale: 1.2,
        dorsalScale: 1.6,
        limbLength: 1.08,
        neckLength: 0.45,
        tailLength: 1.35,
        snoutLength: 0.75,
        headCount: 1,
        auraShardCount: 16
      },
      materials: {
        preset: "abyssal_obsidian",
        ...MATERIAL_PRESETS.abyssal_obsidian,
        primaryColor: "#0f172a",
        secondaryColor: "#0284c7",
        underbodyColor: "#020617",
        emissiveColor: "#06b6d4",
        emissiveIntensity: 2.8,
        texturePattern: "scales"
      },
      stats: {
        level: 80,
        tier: "Raid Boss",
        element: "Abisal",
        aiBehavior: "Boss Multi-Phase",
        hp: 39800,
        attack: 860,
        defense: 660,
        speed: 128,
        critChance: 24,
        aggroRadius: 32,
        attackRange: 9,
        xpReward: 22400,
        headHitboxRadius: 0.62,
        torsoHitboxRadius: 0.98,
        torsoHitboxHeight: 1.95,
        lootTags: ["Tent\xE1culo Abisal", "Ojo Bioluminiscente", "Tinta de las Fosas"]
      }
    },
    arctic_iceberg_golem: {
      id: "enemy_elem_arctic_golem",
      name: "G\xF3lem de T\xE9mpano \xC1rtico",
      title: "Coloso Monol\xEDtico de Hielo Perpetuo (Nv. 78)",
      raceCategory: "air_water_ice",
      bodyPlan: "biped_titan",
      archetype: "arctic_iceberg_golem",
      helm: "monolith_visor",
      weapon: "obsidian_warhammer",
      offhand: "tower_shield",
      dorsal: "crystal_pylons",
      morphology: {
        heightScale: 1.42,
        torsoBulk: 1.46,
        shoulderWidth: 1.45,
        hornLength: 0.85,
        hornCurve: 0.45,
        pauldronSize: 1.45,
        weaponScale: 1.38,
        dorsalScale: 1.42,
        limbLength: 1.15,
        neckLength: 0.35,
        tailLength: 0,
        snoutLength: 0.4,
        headCount: 1,
        auraShardCount: 14
      },
      materials: {
        preset: "arcane_crystal",
        ...MATERIAL_PRESETS.arcane_crystal,
        primaryColor: "#7dd3fc",
        secondaryColor: "#f0f9ff",
        underbodyColor: "#0369a1",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.3,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 78,
        tier: "Mini-Boss",
        element: "Escarcha",
        aiBehavior: "Shield Wall Tank",
        hp: 38500,
        attack: 790,
        defense: 890,
        speed: 96,
        critChance: 16,
        aggroRadius: 24,
        attackRange: 3.6,
        xpReward: 18600,
        headHitboxRadius: 0.46,
        torsoHitboxRadius: 1.02,
        torsoHitboxHeight: 2.15,
        lootTags: ["N\xFAcleo de Glaciar", "Bloque de Hielo Eterno", "Runa de Permafrost"]
      }
    },
    tempest_sky_djinn: {
      id: "enemy_elem_tempest_djinn",
      name: "Djinn del Hurac\xE1n Celeste",
      title: "Genio Astral de las Corrientes A\xE9reas (Nv. 75)",
      raceCategory: "air_water_ice",
      bodyPlan: "floating_magical",
      archetype: "tempest_sky_djinn",
      helm: "horned_greathelm",
      weapon: "twin_reaver_axes",
      offhand: "dual_blade",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.26,
        torsoBulk: 1.16,
        shoulderWidth: 1.34,
        hornLength: 1.18,
        hornCurve: 0.92,
        pauldronSize: 1.22,
        weaponScale: 1.26,
        dorsalScale: 1.35,
        limbLength: 1.14,
        neckLength: 0.62,
        tailLength: 0.85,
        snoutLength: 0.52,
        headCount: 1,
        auraShardCount: 20
      },
      materials: {
        preset: "anisotropic_gold",
        ...MATERIAL_PRESETS.anisotropic_gold,
        primaryColor: "#1e40af",
        secondaryColor: "#facc15",
        underbodyColor: "#0f172a",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.5,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 75,
        tier: "Mini-Boss",
        element: "Arcano",
        aiBehavior: "Aggressive Berserker",
        hp: 25400,
        attack: 835,
        defense: 560,
        speed: 168,
        critChance: 26,
        aggroRadius: 28,
        attackRange: 4.2,
        xpReward: 14900,
        headHitboxRadius: 0.42,
        torsoHitboxRadius: 0.82,
        torsoHitboxHeight: 1.92,
        lootTags: ["Brazalete del Hurac\xE1n", "C\xE9firo Embotellado", "Acero Celeste"]
      }
    },
    permafrost_warg_alpha: {
      id: "enemy_elem_permafrost_warg",
      name: "Huargo Alfa de Escarcha",
      title: "Lobo Gigante de la Tundra Helada (Nv. 56)",
      raceCategory: "air_water_ice",
      bodyPlan: "quadruped_beast",
      archetype: "permafrost_warg_alpha",
      helm: "lupine_maw",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.14,
        torsoBulk: 1.16,
        shoulderWidth: 1.18,
        hornLength: 0.62,
        hornCurve: 0.45,
        pauldronSize: 0.65,
        weaponScale: 1.18,
        dorsalScale: 1.15,
        limbLength: 1.12,
        neckLength: 0.78,
        tailLength: 1.38,
        snoutLength: 1.16,
        headCount: 1,
        auraShardCount: 8,
        hairStyle: "wild_mane_fur"
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#94a3b8",
        secondaryColor: "#e0f2fe",
        underbodyColor: "#334155",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.2,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 56,
        tier: "Elite",
        element: "Escarcha",
        aiBehavior: "Pack Alpha Predator",
        hp: 14200,
        attack: 615,
        defense: 410,
        speed: 178,
        critChance: 28,
        aggroRadius: 24,
        attackRange: 2.8,
        xpReward: 6800,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.7,
        torsoHitboxHeight: 1.48,
        lootTags: ["Pelaje de Huargo \xC1rtico", "Colmillo Congelado", "Garra de Tundra"]
      }
    },
    polar_glacier_bear: {
      id: "enemy_elem_polar_bear",
      name: "Oso Polar R\xFAnico de Glaciar",
      title: "Bestia Acorazada del C\xEDrculo \xC1rtico (Nv. 62)",
      raceCategory: "air_water_ice",
      bodyPlan: "quadruped_beast",
      archetype: "polar_glacier_bear",
      helm: "lupine_maw",
      weapon: "ram_charge",
      offhand: "none",
      dorsal: "crystal_pylons",
      morphology: {
        heightScale: 1.24,
        torsoBulk: 1.42,
        shoulderWidth: 1.36,
        hornLength: 0.48,
        hornCurve: 0.35,
        pauldronSize: 0.82,
        weaponScale: 1.25,
        dorsalScale: 1.22,
        limbLength: 1.05,
        neckLength: 0.65,
        tailLength: 0.35,
        snoutLength: 1.02,
        headCount: 1,
        auraShardCount: 10,
        hairStyle: "full_fur_coat"
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#e2e8f0",
        secondaryColor: "#7dd3fc",
        underbodyColor: "#64748b",
        emissiveColor: "#0ea5e9",
        emissiveIntensity: 2.1,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 62,
        tier: "Elite",
        element: "Escarcha",
        aiBehavior: "Aggressive Berserker",
        hp: 21600,
        attack: 675,
        defense: 610,
        speed: 126,
        critChance: 20,
        aggroRadius: 22,
        attackRange: 2.9,
        xpReward: 8400,
        headHitboxRadius: 0.42,
        torsoHitboxRadius: 0.86,
        torsoHitboxHeight: 1.68,
        lootTags: ["Piel de Oso Polar R\xFAnico", "Zarpa Rompehielos", "Cristal de Escarcha"]
      }
    },
    valkyrie_of_the_gale: {
      id: "enemy_elem_valkyrie_gale",
      name: "Valquiria de la Ventisca",
      title: "Doncella Escudera del Viento del Norte (Nv. 79)",
      raceCategory: "air_water_ice",
      bodyPlan: "biped_titan",
      archetype: "valkyrie_of_the_gale",
      helm: "valkyrie_crest",
      weapon: "radiant_halberd",
      offhand: "runic_buckler",
      dorsal: "seraph_wings",
      morphology: {
        heightScale: 1.22,
        torsoBulk: 1.02,
        shoulderWidth: 1.18,
        hornLength: 1.15,
        hornCurve: 0.76,
        pauldronSize: 1.08,
        weaponScale: 1.28,
        dorsalScale: 1.52,
        limbLength: 1.16,
        neckLength: 0.68,
        tailLength: 0,
        snoutLength: 0.48,
        headCount: 1,
        auraShardCount: 16,
        hairStyle: "long_flowing_hair"
      },
      materials: {
        preset: "blued_steel",
        ...MATERIAL_PRESETS.blued_steel,
        primaryColor: "#cbd5e1",
        secondaryColor: "#38bdf8",
        underbodyColor: "#1e293b",
        emissiveColor: "#7dd3fc",
        emissiveIntensity: 2.5,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 79,
        tier: "Mini-Boss",
        element: "Escarcha",
        aiBehavior: "Aerial Breath Sweeper",
        hp: 29400,
        attack: 845,
        defense: 640,
        speed: 166,
        critChance: 28,
        aggroRadius: 28,
        attackRange: 4.5,
        xpReward: 17800,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.74,
        torsoHitboxHeight: 1.88,
        lootTags: ["Alabarda del Viento Boreal", "Pluma de Valquiria", "\xC9gida de Hielo"]
      }
    },
    triton_abyss_warden: {
      id: "enemy_elem_triton_warden",
      name: "Trit\xF3n Guardi\xE1n del Abismo",
      title: "Campe\xF3n Acorazado de la Fosa Marina (Nv. 71)",
      raceCategory: "air_water_ice",
      bodyPlan: "biped_titan",
      archetype: "triton_abyss_warden",
      helm: "drake_fang_helm",
      weapon: "radiant_halberd",
      offhand: "tower_shield",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.24,
        torsoBulk: 1.22,
        shoulderWidth: 1.28,
        hornLength: 1.12,
        hornCurve: 0.85,
        pauldronSize: 1.22,
        weaponScale: 1.32,
        dorsalScale: 1.28,
        limbLength: 1.1,
        neckLength: 0.64,
        tailLength: 0.95,
        snoutLength: 0.68,
        headCount: 1,
        auraShardCount: 12
      },
      materials: {
        preset: "corroded_bronze",
        ...MATERIAL_PRESETS.corroded_bronze,
        primaryColor: "#0e7490",
        secondaryColor: "#d97706",
        underbodyColor: "#164e63",
        emissiveColor: "#22d3ee",
        emissiveIntensity: 2.2,
        texturePattern: "scales"
      },
      stats: {
        level: 71,
        tier: "Elite",
        element: "Abisal",
        aiBehavior: "Shield Wall Tank",
        hp: 25800,
        attack: 740,
        defense: 710,
        speed: 128,
        critChance: 21,
        aggroRadius: 24,
        attackRange: 3.8,
        xpReward: 12200,
        headHitboxRadius: 0.4,
        torsoHitboxRadius: 0.82,
        torsoHitboxHeight: 1.88,
        lootTags: ["Tridente de Marea", "Coraza de Bronce Abisal", "Aleta Real"]
      }
    },
    cryo_hydra_trident: {
      id: "enemy_elem_cryo_hydra",
      name: "Hidra de Marea Glacial",
      title: "Tric\xE9falo Serpiente del Mar Helado (Nv. 85)",
      raceCategory: "air_water_ice",
      bodyPlan: "serpentine_naga",
      archetype: "cryo_hydra_trident",
      helm: "draconic_snout",
      weapon: "frost_breath_maw",
      offhand: "none",
      dorsal: "crystal_pylons",
      morphology: {
        heightScale: 1.36,
        torsoBulk: 1.3,
        shoulderWidth: 1.34,
        hornLength: 1.28,
        hornCurve: 0.95,
        pauldronSize: 1.05,
        weaponScale: 1.2,
        dorsalScale: 1.42,
        limbLength: 1.12,
        neckLength: 1.48,
        tailLength: 1.7,
        snoutLength: 1.25,
        headCount: 3,
        auraShardCount: 18
      },
      materials: {
        preset: "arcane_crystal",
        ...MATERIAL_PRESETS.arcane_crystal,
        primaryColor: "#0284c7",
        secondaryColor: "#bae6fd",
        underbodyColor: "#0c4a6e",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.7,
        texturePattern: "scales",
        textureRelief: 1.18
      },
      stats: {
        level: 85,
        tier: "Raid Boss",
        element: "Escarcha",
        aiBehavior: "Boss Multi-Phase",
        hp: 48200,
        attack: 930,
        defense: 730,
        speed: 134,
        critChance: 26,
        aggroRadius: 35,
        attackRange: 9.8,
        xpReward: 27900,
        headHitboxRadius: 0.58,
        torsoHitboxRadius: 0.96,
        torsoHitboxHeight: 2.12,
        lootTags: ["Cabeza de Hidra Glacial", "Veneno Crio-Abisal", "Escama Tric\xE9fala"]
      }
    },
    astral_frost_phoenix: {
      id: "enemy_elem_frost_phoenix",
      name: "F\xE9nix de Hielo Astral",
      title: "Ave Inmortal de la Aurora Invernal (Nv. 81)",
      raceCategory: "air_water_ice",
      bodyPlan: "floating_magical",
      archetype: "astral_frost_phoenix",
      helm: "avian_phoenix_beak",
      weapon: "frost_breath_maw",
      offhand: "none",
      dorsal: "seraph_wings",
      morphology: {
        heightScale: 1.26,
        torsoBulk: 1.05,
        shoulderWidth: 1.22,
        hornLength: 1.32,
        hornCurve: 1.05,
        pauldronSize: 0.92,
        weaponScale: 1.18,
        dorsalScale: 1.65,
        limbLength: 1.12,
        neckLength: 0.95,
        tailLength: 1.55,
        snoutLength: 0.95,
        headCount: 1,
        auraShardCount: 22,
        hairStyle: "full_fur_coat"
      },
      materials: {
        preset: "arcane_crystal",
        ...MATERIAL_PRESETS.arcane_crystal,
        primaryColor: "#38bdf8",
        secondaryColor: "#f0f9ff",
        underbodyColor: "#0369a1",
        emissiveColor: "#67e8f9",
        emissiveIntensity: 3,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 81,
        tier: "Raid Boss",
        element: "Escarcha",
        aiBehavior: "Aerial Breath Sweeper",
        hp: 37600,
        attack: 895,
        defense: 610,
        speed: 184,
        critChance: 30,
        aggroRadius: 34,
        attackRange: 9.5,
        xpReward: 23500,
        headHitboxRadius: 0.44,
        torsoHitboxRadius: 0.78,
        torsoHitboxHeight: 1.88,
        lootTags: ["Pluma de Cero Absoluto", "Ceniza de Escarcha", "Coraz\xF3n de Aurora"]
      }
    },
    gale_wind_manticore: {
      id: "enemy_elem_gale_manticore",
      name: "Mant\xEDcora del Vendaval",
      title: "Quimera Alada de las Tormentas (Nv. 70)",
      raceCategory: "air_water_ice",
      bodyPlan: "quadruped_beast",
      archetype: "gale_wind_manticore",
      helm: "tauren_bull_horns",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 1.2,
        torsoBulk: 1.24,
        shoulderWidth: 1.26,
        hornLength: 1.28,
        hornCurve: 0.92,
        pauldronSize: 0.85,
        weaponScale: 1.2,
        dorsalScale: 1.48,
        limbLength: 1.1,
        neckLength: 0.78,
        tailLength: 1.48,
        snoutLength: 1.08,
        headCount: 1,
        auraShardCount: 12,
        hairStyle: "wild_mane_fur"
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#475569",
        secondaryColor: "#93c5fd",
        underbodyColor: "#1e293b",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.3,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 70,
        tier: "Elite",
        element: "Arcano",
        aiBehavior: "Ambush Stalker",
        hp: 21200,
        attack: 755,
        defense: 510,
        speed: 170,
        critChance: 27,
        aggroRadius: 27,
        attackRange: 3.5,
        xpReward: 11400,
        headHitboxRadius: 0.42,
        torsoHitboxRadius: 0.8,
        torsoHitboxHeight: 1.68,
        lootTags: ["Melena de Tormenta", "Membrana del Vendaval", "Cuerno de Trueno"]
      }
    },
    frost_crystal_scorpion: {
      id: "enemy_elem_frost_scorpion",
      name: "Escorpi\xF3n de Cristal Helado",
      title: "Ar\xE1cnido Perforador de los Glaciares (Nv. 64)",
      raceCategory: "air_water_ice",
      bodyPlan: "arachnid_scorpion",
      archetype: "frost_crystal_scorpion",
      helm: "arachnid_mandibles",
      weapon: "feral_claws_fangs",
      offhand: "none",
      dorsal: "scorpion_stinger_tail",
      morphology: {
        heightScale: 1.08,
        torsoBulk: 1.18,
        shoulderWidth: 1.2,
        hornLength: 0.95,
        hornCurve: 0.85,
        pauldronSize: 0.8,
        weaponScale: 1.15,
        dorsalScale: 1.42,
        limbLength: 1.14,
        neckLength: 0.35,
        tailLength: 1.55,
        snoutLength: 0.85,
        headCount: 1,
        auraShardCount: 10
      },
      materials: {
        preset: "arcane_crystal",
        ...MATERIAL_PRESETS.arcane_crystal,
        primaryColor: "#0284c7",
        secondaryColor: "#e0f2fe",
        underbodyColor: "#082f49",
        emissiveColor: "#22d3ee",
        emissiveIntensity: 2.5,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 64,
        tier: "Elite",
        element: "Escarcha",
        aiBehavior: "Ambush Stalker",
        hp: 18400,
        attack: 690,
        defense: 620,
        speed: 152,
        critChance: 26,
        aggroRadius: 24,
        attackRange: 3.2,
        xpReward: 9200,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.76,
        torsoHitboxHeight: 1.35,
        lootTags: ["Aguij\xF3n de Hielo Puro", "Quitina Cristalina", "Gl\xE1ndula Crio-Venenosa"]
      }
    },
    aurora_ice_centaur: {
      id: "enemy_elem_aurora_centaur",
      name: "Centauro de la Aurora Boreal",
      title: "Lancero Galopante del Hielo Eterno (Nv. 69)",
      raceCategory: "air_water_ice",
      bodyPlan: "quadruped_beast",
      archetype: "aurora_ice_centaur",
      helm: "horned_greathelm",
      weapon: "radiant_halberd",
      offhand: "runic_buckler",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.24,
        torsoBulk: 1.14,
        shoulderWidth: 1.22,
        hornLength: 1.18,
        hornCurve: 0.78,
        pauldronSize: 1.12,
        weaponScale: 1.32,
        dorsalScale: 1.25,
        limbLength: 1.18,
        neckLength: 0.68,
        tailLength: 1.28,
        snoutLength: 0.55,
        headCount: 1,
        auraShardCount: 14,
        hairStyle: "wild_mane_fur"
      },
      materials: {
        preset: "blued_steel",
        ...MATERIAL_PRESETS.blued_steel,
        primaryColor: "#e2e8f0",
        secondaryColor: "#38bdf8",
        underbodyColor: "#334155",
        emissiveColor: "#2dd4bf",
        emissiveIntensity: 2.4,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 69,
        tier: "Elite",
        element: "Escarcha",
        aiBehavior: "Pack Alpha Predator",
        hp: 20800,
        attack: 735,
        defense: 540,
        speed: 182,
        critChance: 25,
        aggroRadius: 28,
        attackRange: 4.4,
        xpReward: 10800,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.78,
        torsoHitboxHeight: 1.85,
        lootTags: ["Lanza de la Aurora", "Herradura de Escarcha", "Estandarte Boreal"]
      }
    },
    coral_sea_serpent: {
      id: "enemy_elem_coral_serpent",
      name: "Serpiente Marina de Arrecife",
      title: "Culebra Gigante de las Corrientes (Nv. 58)",
      raceCategory: "air_water_ice",
      bodyPlan: "serpentine_naga",
      archetype: "coral_sea_serpent",
      helm: "draconic_snout",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.18,
        torsoBulk: 1.12,
        shoulderWidth: 1.1,
        hornLength: 1.05,
        hornCurve: 0.88,
        pauldronSize: 0.72,
        weaponScale: 1.12,
        dorsalScale: 1.32,
        limbLength: 1.05,
        neckLength: 1.28,
        tailLength: 1.65,
        snoutLength: 1.18,
        headCount: 1,
        auraShardCount: 8
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#0891b2",
        secondaryColor: "#fb7185",
        underbodyColor: "#164e63",
        emissiveColor: "#2dd4bf",
        emissiveIntensity: 2.2,
        texturePattern: "scales",
        textureRelief: 1.1
      },
      stats: {
        level: 58,
        tier: "Elite",
        element: "Abisal",
        aiBehavior: "Ambush Stalker",
        hp: 15600,
        attack: 640,
        defense: 450,
        speed: 164,
        critChance: 24,
        aggroRadius: 24,
        attackRange: 3.5,
        xpReward: 7400,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.72,
        torsoHitboxHeight: 1.72,
        lootTags: ["Escama de Coral", "Colmillo de Marea", "Aleta Iridiscente"]
      }
    },
    cyclone_air_archon: {
      id: "enemy_elem_cyclone_archon",
      name: "Arconte del Cicl\xF3n",
      title: "Tit\xE1n Flotante de Presi\xF3n Atmosf\xE9rica (Nv. 83)",
      raceCategory: "air_water_ice",
      bodyPlan: "floating_magical",
      archetype: "cyclone_air_archon",
      helm: "monolith_visor",
      weapon: "arcane_staff",
      offhand: "phylactery_orb",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.35,
        torsoBulk: 1.24,
        shoulderWidth: 1.38,
        hornLength: 1.22,
        hornCurve: 0.65,
        pauldronSize: 1.36,
        weaponScale: 1.35,
        dorsalScale: 1.55,
        limbLength: 1.18,
        neckLength: 0.52,
        tailLength: 0.9,
        snoutLength: 0.45,
        headCount: 1,
        auraShardCount: 28
      },
      materials: {
        preset: "arcane_crystal",
        ...MATERIAL_PRESETS.arcane_crystal,
        primaryColor: "#cbd5e1",
        secondaryColor: "#38bdf8",
        underbodyColor: "#1e293b",
        emissiveColor: "#818cf8",
        emissiveIntensity: 2.9,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 83,
        tier: "Raid Boss",
        element: "Arcano",
        aiBehavior: "Arcane Artillery",
        hp: 41500,
        attack: 905,
        defense: 680,
        speed: 162,
        critChance: 28,
        aggroRadius: 34,
        attackRange: 11,
        xpReward: 25100,
        headHitboxRadius: 0.44,
        torsoHitboxRadius: 0.88,
        torsoHitboxHeight: 2.02,
        lootTags: ["N\xFAcleo de Cicl\xF3n", "Fragmento de Estrat\xF3sfera", "Sello del Viento Eterno"]
      }
    },
    hailstorm_stag_spirit: {
      id: "enemy_elem_hailstorm_stag",
      name: "Ciervo Espiritual de Granizo",
      title: "Guardi\xE1n Cornudo de la Niebla Invernal (Nv. 54)",
      raceCategory: "air_water_ice",
      bodyPlan: "quadruped_beast",
      archetype: "hailstorm_stag_spirit",
      helm: "tauren_bull_horns",
      weapon: "ram_charge",
      offhand: "none",
      dorsal: "crystal_pylons",
      morphology: {
        heightScale: 1.18,
        torsoBulk: 1.02,
        shoulderWidth: 1.08,
        hornLength: 1.65,
        hornCurve: 1.18,
        pauldronSize: 0.6,
        weaponScale: 1.15,
        dorsalScale: 1.25,
        limbLength: 1.22,
        neckLength: 0.95,
        tailLength: 0.55,
        snoutLength: 1.05,
        headCount: 1,
        auraShardCount: 12,
        hairStyle: "full_fur_coat"
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#bae6fd",
        secondaryColor: "#f8fafc",
        underbodyColor: "#0284c7",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.4,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 54,
        tier: "Elite",
        element: "Escarcha",
        aiBehavior: "Pack Alpha Predator",
        hp: 13800,
        attack: 590,
        defense: 430,
        speed: 180,
        critChance: 24,
        aggroRadius: 24,
        attackRange: 2.9,
        xpReward: 6400,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.68,
        torsoHitboxHeight: 1.58,
        lootTags: ["Cornamenta de Escarcha", "Piel de Niebla Invernal", "Pezu\xF1a de Cristal"]
      }
    },
    // ============================================================================
    // 8. LEGIÓN DE NO MUERTOS (20)
    // ============================================================================
    bone_crown_lich_king: {
      id: "enemy_undead_lich_king",
      name: "Rey Ex\xE1nime de la Corona de Hueso",
      title: "Monarca Supremo de la Nigromancia (Nv. 88)",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "bone_crown_lich_king",
      helm: "crowned_skull",
      weapon: "runic_greatsword",
      offhand: "phylactery_orb",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.38,
        torsoBulk: 1.18,
        shoulderWidth: 1.35,
        hornLength: 1.42,
        hornCurve: 0.85,
        pauldronSize: 1.42,
        weaponScale: 1.45,
        dorsalScale: 1.5,
        limbLength: 1.18,
        neckLength: 0.65,
        tailLength: 0,
        snoutLength: 0.52,
        headCount: 1,
        auraShardCount: 28
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#d6d3d1",
        secondaryColor: "#1e293b",
        underbodyColor: "#090d16",
        emissiveColor: "#10b981",
        emissiveIntensity: 3,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 88,
        tier: "Raid Boss",
        element: "Abisal",
        aiBehavior: "Boss Multi-Phase",
        hp: 52e3,
        attack: 980,
        defense: 790,
        speed: 138,
        critChance: 29,
        aggroRadius: 36,
        attackRange: 6.5,
        xpReward: 31500,
        headHitboxRadius: 0.45,
        torsoHitboxRadius: 0.88,
        torsoHitboxHeight: 2.1,
        lootTags: ["Corona del Rey Ex\xE1nime", "Filacteria Real", "Mandoble Devoraalmas"]
      }
    },
    skeletal_plague_dragon: {
      id: "enemy_undead_plague_dragon",
      name: "Drag\xF3n Esquel\xE9tico de Peste",
      title: "Wyrm Osario Reanimado (Nv. 86)",
      raceCategory: "undead",
      bodyPlan: "dragon_wyvern",
      archetype: "skeletal_plague_dragon",
      helm: "draconic_snout",
      weapon: "dragon_breath_maw",
      offhand: "none",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 1.4,
        torsoBulk: 1.16,
        shoulderWidth: 1.28,
        hornLength: 1.55,
        hornCurve: 1.12,
        pauldronSize: 1.1,
        weaponScale: 1.25,
        dorsalScale: 1.62,
        limbLength: 1.18,
        neckLength: 1.42,
        tailLength: 1.68,
        snoutLength: 1.32,
        headCount: 1,
        auraShardCount: 20
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e7e5e4",
        secondaryColor: "#3f6212",
        underbodyColor: "#1c1917",
        emissiveColor: "#84cc16",
        emissiveIntensity: 2.8,
        texturePattern: "scales",
        textureRelief: 1.15
      },
      stats: {
        level: 86,
        tier: "Raid Boss",
        element: "Veneno",
        aiBehavior: "Aerial Breath Sweeper",
        hp: 47800,
        attack: 940,
        defense: 710,
        speed: 146,
        critChance: 27,
        aggroRadius: 35,
        attackRange: 9.6,
        xpReward: 28900,
        headHitboxRadius: 0.56,
        torsoHitboxRadius: 0.92,
        torsoHitboxHeight: 2.1,
        lootTags: ["Costilla de Drag\xF3n Osario", "Aliento de Peste Condensado", "Cr\xE1neo Drac\xF3nico"]
      }
    },
    death_knight_colossus: {
      id: "enemy_undead_death_knight",
      name: "Caballero de la Muerte Abisal",
      title: "Palad\xEDn Ca\xEDdo de la Espada Maldita (Nv. 82)",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "death_knight_colossus",
      helm: "horned_greathelm",
      weapon: "runic_greatsword",
      offhand: "tower_shield",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.32,
        torsoBulk: 1.34,
        shoulderWidth: 1.38,
        hornLength: 1.28,
        hornCurve: 0.92,
        pauldronSize: 1.45,
        weaponScale: 1.42,
        dorsalScale: 1.38,
        limbLength: 1.14,
        neckLength: 0.58,
        tailLength: 0,
        snoutLength: 0.52,
        headCount: 1,
        auraShardCount: 16
      },
      materials: {
        preset: "abyssal_obsidian",
        ...MATERIAL_PRESETS.abyssal_obsidian,
        primaryColor: "#1e293b",
        secondaryColor: "#94a3b8",
        underbodyColor: "#090d16",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.6,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 82,
        tier: "Raid Boss",
        element: "Escarcha",
        aiBehavior: "Shield Wall Tank",
        hp: 44600,
        attack: 890,
        defense: 860,
        speed: 122,
        critChance: 24,
        aggroRadius: 28,
        attackRange: 4.2,
        xpReward: 24200,
        headHitboxRadius: 0.44,
        torsoHitboxRadius: 0.92,
        torsoHitboxHeight: 2.02,
        lootTags: ["Hoja R\xFAnica de Escarcha", "Coraza de Peste", "Sello de Sangre Fr\xEDa"]
      }
    },
    wraith_soul_reaper: {
      id: "enemy_undead_wraith_reaper",
      name: "Segador Espectral del Velo",
      title: "Aparici\xF3n Et\xE9rea Devoradora de Almas (Nv. 79)",
      raceCategory: "undead",
      bodyPlan: "floating_magical",
      archetype: "wraith_soul_reaper",
      helm: "crowned_skull",
      weapon: "venom_scythe_claws",
      offhand: "phylactery_orb",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.3,
        torsoBulk: 0.96,
        shoulderWidth: 1.24,
        hornLength: 1.15,
        hornCurve: 0.88,
        pauldronSize: 1.18,
        weaponScale: 1.48,
        dorsalScale: 1.55,
        limbLength: 1.2,
        neckLength: 0.66,
        tailLength: 1.15,
        snoutLength: 0.48,
        headCount: 1,
        auraShardCount: 22
      },
      materials: {
        preset: "abyssal_obsidian",
        ...MATERIAL_PRESETS.abyssal_obsidian,
        primaryColor: "#0f172a",
        secondaryColor: "#475569",
        underbodyColor: "#020617",
        emissiveColor: "#2dd4bf",
        emissiveIntensity: 2.9,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 79,
        tier: "Mini-Boss",
        element: "Abisal",
        aiBehavior: "Ambush Stalker",
        hp: 27400,
        attack: 875,
        defense: 510,
        speed: 184,
        critChance: 32,
        aggroRadius: 30,
        attackRange: 4.8,
        xpReward: 17900,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.74,
        torsoHitboxHeight: 1.94,
        lootTags: ["Guada\xF1a del Segador", "Sudario Et\xE9reo", "Fragmento de Alma"]
      }
    },
    flesh_bone_abomination: {
      id: "enemy_undead_flesh_abomination",
      name: "G\xF3lem de Carne y Osamenta",
      title: "Coloso Cosido de las Catacumbas (Nv. 77)",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "flesh_bone_abomination",
      helm: "monolith_visor",
      weapon: "obsidian_warhammer",
      offhand: "dual_blade",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.38,
        torsoBulk: 1.52,
        shoulderWidth: 1.48,
        hornLength: 0.75,
        hornCurve: 0.55,
        pauldronSize: 1.32,
        weaponScale: 1.4,
        dorsalScale: 1.35,
        limbLength: 1.12,
        neckLength: 0.38,
        tailLength: 0,
        snoutLength: 0.55,
        headCount: 1,
        auraShardCount: 10
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#78716c",
        secondaryColor: "#d6d3d1",
        underbodyColor: "#44403c",
        emissiveColor: "#84cc16",
        emissiveIntensity: 2.3,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 77,
        tier: "Mini-Boss",
        element: "Veneno",
        aiBehavior: "Aggressive Berserker",
        hp: 41200,
        attack: 830,
        defense: 760,
        speed: 102,
        critChance: 19,
        aggroRadius: 24,
        attackRange: 3.6,
        xpReward: 16800,
        headHitboxRadius: 0.46,
        torsoHitboxRadius: 1.06,
        torsoHitboxHeight: 2.1,
        lootTags: ["Gancho de Carnicero", "Sutura Alqu\xEDmica", "F\xE9mur Gigante"]
      }
    },
    crimson_nosferatu_elder: {
      id: "enemy_undead_nosferatu_elder",
      name: "Vampiro Primigenio Nosferatu",
      title: "Patriarca Inmortal de la Noche Roja (Nv. 84)",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "crimson_nosferatu_elder",
      helm: "drake_fang_helm",
      weapon: "venom_scythe_claws",
      offhand: "dual_blade",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 1.28,
        torsoBulk: 1.06,
        shoulderWidth: 1.26,
        hornLength: 1.18,
        hornCurve: 0.86,
        pauldronSize: 1.18,
        weaponScale: 1.32,
        dorsalScale: 1.56,
        limbLength: 1.18,
        neckLength: 0.72,
        tailLength: 0,
        snoutLength: 0.62,
        headCount: 1,
        auraShardCount: 18,
        hairStyle: "long_flowing_hair"
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#450a0a",
        secondaryColor: "#dc2626",
        underbodyColor: "#18181b",
        emissiveColor: "#f43f5e",
        emissiveIntensity: 2.7,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 84,
        tier: "Raid Boss",
        element: "Abisal",
        aiBehavior: "Ambush Stalker",
        hp: 42800,
        attack: 925,
        defense: 650,
        speed: 192,
        critChance: 34,
        aggroRadius: 32,
        attackRange: 3.9,
        xpReward: 26100,
        headHitboxRadius: 0.4,
        torsoHitboxRadius: 0.78,
        torsoHitboxHeight: 1.96,
        lootTags: ["C\xE1liz de Sangre Antigua", "Colmillo de Nosferatu", "Manto Carmes\xED"]
      }
    },
    flayed_underworld_centaur: {
      id: "enemy_undead_flayed_centaur",
      name: "Centauro Desollado del Inframundo",
      title: "Corcel de Hueso y M\xFAsculo Maldito (Nv. 73)",
      raceCategory: "undead",
      bodyPlan: "quadruped_beast",
      archetype: "flayed_underworld_centaur",
      helm: "crowned_skull",
      weapon: "radiant_halberd",
      offhand: "runic_buckler",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.26,
        torsoBulk: 1.15,
        shoulderWidth: 1.24,
        hornLength: 1.2,
        hornCurve: 0.82,
        pauldronSize: 1.1,
        weaponScale: 1.34,
        dorsalScale: 1.28,
        limbLength: 1.18,
        neckLength: 0.68,
        tailLength: 1.22,
        snoutLength: 0.58,
        headCount: 1,
        auraShardCount: 12,
        muscleDefinition: 1.65
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#7f1d1d",
        secondaryColor: "#e7e5e4",
        underbodyColor: "#292524",
        emissiveColor: "#10b981",
        emissiveIntensity: 2.3,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 73,
        tier: "Elite",
        element: "Abisal",
        aiBehavior: "Aggressive Berserker",
        hp: 23900,
        attack: 780,
        defense: 560,
        speed: 176,
        critChance: 26,
        aggroRadius: 28,
        attackRange: 4.5,
        xpReward: 13200,
        headHitboxRadius: 0.4,
        torsoHitboxRadius: 0.8,
        torsoHitboxHeight: 1.88,
        lootTags: ["Alabarda Osaria", "Herradura Maldita", "Costillar de Corcel"]
      }
    },
    crypt_cerberus_hound: {
      id: "enemy_undead_crypt_cerberus",
      name: "Sabueso de Cripta Tric\xE9falo",
      title: "Mast\xEDn Putrefacto Guardi\xE1n de Tumbas (Nv. 78)",
      raceCategory: "undead",
      bodyPlan: "quadruped_beast",
      archetype: "crypt_cerberus_hound",
      helm: "lupine_maw",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.22,
        torsoBulk: 1.28,
        shoulderWidth: 1.32,
        hornLength: 0.68,
        hornCurve: 0.52,
        pauldronSize: 0.82,
        weaponScale: 1.22,
        dorsalScale: 1.3,
        limbLength: 1.1,
        neckLength: 0.86,
        tailLength: 1.35,
        snoutLength: 1.18,
        headCount: 3,
        auraShardCount: 14,
        hairStyle: "wild_mane_fur"
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#27272a",
        secondaryColor: "#d6d3d1",
        underbodyColor: "#09090b",
        emissiveColor: "#84cc16",
        emissiveIntensity: 2.5,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 78,
        tier: "Mini-Boss",
        element: "Veneno",
        aiBehavior: "Pack Alpha Predator",
        hp: 31500,
        attack: 840,
        defense: 610,
        speed: 174,
        critChance: 28,
        aggroRadius: 30,
        attackRange: 3.4,
        xpReward: 17400,
        headHitboxRadius: 0.46,
        torsoHitboxRadius: 0.86,
        torsoHitboxHeight: 1.72,
        lootTags: ["Collar de Cripta", "Colmillo Necr\xF3tico", "Piel de Sabueso Sepulcral"]
      }
    },
    ossuary_minotaur_jugger: {
      id: "enemy_undead_ossuary_minotaur",
      name: "Minotauro Osario del Laberinto",
      title: "Bestia Cornuda de Cr\xE1neos Antiguos (Nv. 75)",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "ossuary_minotaur_jugger",
      helm: "tauren_bull_horns",
      weapon: "twin_reaver_axes",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.36,
        torsoBulk: 1.44,
        shoulderWidth: 1.42,
        hornLength: 1.58,
        hornCurve: 1.15,
        pauldronSize: 1.28,
        weaponScale: 1.42,
        dorsalScale: 1.32,
        limbLength: 1.14,
        neckLength: 0.58,
        tailLength: 0.95,
        snoutLength: 1.12,
        headCount: 1,
        auraShardCount: 12,
        hairStyle: "full_fur_coat"
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#d6d3d1",
        secondaryColor: "#78350f",
        underbodyColor: "#292524",
        emissiveColor: "#10b981",
        emissiveIntensity: 2.4,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 75,
        tier: "Mini-Boss",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Aggressive Berserker",
        hp: 34200,
        attack: 855,
        defense: 680,
        speed: 138,
        critChance: 25,
        aggroRadius: 26,
        attackRange: 3.9,
        xpReward: 15800,
        headHitboxRadius: 0.46,
        torsoHitboxRadius: 0.94,
        torsoHitboxHeight: 2.04,
        lootTags: ["Cuerno de Toro Osario", "Labrys de Tumbas", "Anillo de Catacumba"]
      }
    },
    putrid_bog_hydra: {
      id: "enemy_undead_putrid_hydra",
      name: "Hidra Putrefacta de Ci\xE9naga",
      title: "Sierpe Cadav\xE9rica de Tres Cabezas (Nv. 83)",
      raceCategory: "undead",
      bodyPlan: "serpentine_naga",
      archetype: "putrid_bog_hydra",
      helm: "draconic_snout",
      weapon: "dragon_breath_maw",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.35,
        torsoBulk: 1.32,
        shoulderWidth: 1.34,
        hornLength: 1.25,
        hornCurve: 0.92,
        pauldronSize: 1.05,
        weaponScale: 1.2,
        dorsalScale: 1.45,
        limbLength: 1.1,
        neckLength: 1.46,
        tailLength: 1.68,
        snoutLength: 1.26,
        headCount: 3,
        auraShardCount: 16
      },
      materials: {
        preset: "corroded_bronze",
        ...MATERIAL_PRESETS.corroded_bronze,
        primaryColor: "#365314",
        secondaryColor: "#d6d3d1",
        underbodyColor: "#1a2e05",
        emissiveColor: "#84cc16",
        emissiveIntensity: 2.6,
        texturePattern: "scales",
        textureRelief: 1.15
      },
      stats: {
        level: 83,
        tier: "Raid Boss",
        element: "Veneno",
        aiBehavior: "Boss Multi-Phase",
        hp: 45900,
        attack: 915,
        defense: 710,
        speed: 132,
        critChance: 25,
        aggroRadius: 34,
        attackRange: 9.4,
        xpReward: 25800,
        headHitboxRadius: 0.56,
        torsoHitboxRadius: 0.95,
        torsoHitboxHeight: 2.08,
        lootTags: ["Bilis de Hidra Muerta", "V\xE9rtebra de Ci\xE9naga", "Escama Necr\xF3tica"]
      }
    },
    grave_fallen_valkyrie: {
      id: "enemy_undead_fallen_valkyrie",
      name: "Valquiria Ca\xEDda del Sepulcro",
      title: "\xC1ngel de la Muerte de Alas Quebradas (Nv. 80)",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "grave_fallen_valkyrie",
      helm: "valkyrie_crest",
      weapon: "radiant_halberd",
      offhand: "runic_buckler",
      dorsal: "seraph_wings",
      morphology: {
        heightScale: 1.24,
        torsoBulk: 1.04,
        shoulderWidth: 1.2,
        hornLength: 1.22,
        hornCurve: 0.82,
        pauldronSize: 1.12,
        weaponScale: 1.32,
        dorsalScale: 1.54,
        limbLength: 1.16,
        neckLength: 0.68,
        tailLength: 0,
        snoutLength: 0.48,
        headCount: 1,
        auraShardCount: 18,
        hairStyle: "long_flowing_hair"
      },
      materials: {
        preset: "abyssal_obsidian",
        ...MATERIAL_PRESETS.abyssal_obsidian,
        primaryColor: "#334155",
        secondaryColor: "#cbd5e1",
        underbodyColor: "#0f172a",
        emissiveColor: "#a855f7",
        emissiveIntensity: 2.6,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 80,
        tier: "Mini-Boss",
        element: "Abisal",
        aiBehavior: "Aerial Breath Sweeper",
        hp: 30800,
        attack: 865,
        defense: 650,
        speed: 168,
        critChance: 28,
        aggroRadius: 29,
        attackRange: 4.6,
        xpReward: 19200,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.76,
        torsoHitboxHeight: 1.9,
        lootTags: ["Pluma de Cuervo Sepulcral", "Lanza de Juicio Oscuro", "Diadema F\xFAnebre"]
      }
    },
    catacomb_necro_arachnid: {
      id: "enemy_undead_necro_arachnid",
      name: "Viuda Necr\xF3faga de Catacumbas",
      title: "Ara\xF1a Tejedora de Mortajas y Huesos (Nv. 68)",
      raceCategory: "undead",
      bodyPlan: "arachnid_scorpion",
      archetype: "catacomb_necro_arachnid",
      helm: "arachnid_mandibles",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "scorpion_stinger_tail",
      morphology: {
        heightScale: 1.06,
        torsoBulk: 1.16,
        shoulderWidth: 1.18,
        hornLength: 0.92,
        hornCurve: 0.82,
        pauldronSize: 0.75,
        weaponScale: 1.14,
        dorsalScale: 1.38,
        limbLength: 1.18,
        neckLength: 0.34,
        tailLength: 1.48,
        snoutLength: 0.82,
        headCount: 1,
        auraShardCount: 10
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#1c1917",
        secondaryColor: "#e7e5e4",
        underbodyColor: "#0c0a09",
        emissiveColor: "#a855f7",
        emissiveIntensity: 2.5,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 68,
        tier: "Elite",
        element: "Veneno",
        aiBehavior: "Ambush Stalker",
        hp: 19600,
        attack: 725,
        defense: 580,
        speed: 168,
        critChance: 28,
        aggroRadius: 26,
        attackRange: 3.1,
        xpReward: 10400,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.76,
        torsoHitboxHeight: 1.32,
        lootTags: ["Seda de Mortaja", "Quel\xEDcero Osario", "Veneno Necr\xF3tico"]
      }
    },
    cursed_skeleton_berserker: {
      id: "enemy_undead_skeleton_berserker",
      name: "Berserker Esqueleto Maldito",
      title: "Guerrero Descarnado de Doble Hacha (Nv. 64)",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "cursed_skeleton_berserker",
      helm: "crowned_skull",
      weapon: "twin_reaver_axes",
      offhand: "dual_blade",
      dorsal: "none",
      morphology: {
        heightScale: 1.18,
        torsoBulk: 0.92,
        shoulderWidth: 1.22,
        hornLength: 0.88,
        hornCurve: 0.65,
        pauldronSize: 1.05,
        weaponScale: 1.3,
        dorsalScale: 0.9,
        limbLength: 1.15,
        neckLength: 0.62,
        tailLength: 0,
        snoutLength: 0.48,
        headCount: 1,
        auraShardCount: 8
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e7e5e4",
        secondaryColor: "#78350f",
        underbodyColor: "#292524",
        emissiveColor: "#f97316",
        emissiveIntensity: 2.3,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 64,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Aggressive Berserker",
        hp: 17200,
        attack: 745,
        defense: 460,
        speed: 172,
        critChance: 30,
        aggroRadius: 24,
        attackRange: 3.4,
        xpReward: 8900,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.68,
        torsoHitboxHeight: 1.82,
        lootTags: ["Cr\xE1neo Maldito", "Hacha Oxidada de Cripta", "Tibia Tallada"]
      }
    },
    plague_hierophant_mummy: {
      id: "enemy_undead_plague_mummy",
      name: "Sacerdote Momia de la Plaga",
      title: "Hierofante Embalsamado del Desierto Muerto (Nv. 72)",
      raceCategory: "undead",
      bodyPlan: "floating_magical",
      archetype: "plague_hierophant_mummy",
      helm: "crowned_skull",
      weapon: "arcane_staff",
      offhand: "phylactery_orb",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.24,
        torsoBulk: 1.06,
        shoulderWidth: 1.24,
        hornLength: 1.12,
        hornCurve: 0.75,
        pauldronSize: 1.18,
        weaponScale: 1.32,
        dorsalScale: 1.42,
        limbLength: 1.14,
        neckLength: 0.64,
        tailLength: 0.85,
        snoutLength: 0.5,
        headCount: 1,
        auraShardCount: 20
      },
      materials: {
        preset: "corroded_bronze",
        ...MATERIAL_PRESETS.corroded_bronze,
        primaryColor: "#a8a29e",
        secondaryColor: "#ca8a04",
        underbodyColor: "#44403c",
        emissiveColor: "#84cc16",
        emissiveIntensity: 2.5,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 72,
        tier: "Mini-Boss",
        element: "Veneno",
        aiBehavior: "Arcane Artillery",
        hp: 23400,
        attack: 795,
        defense: 530,
        speed: 144,
        critChance: 26,
        aggroRadius: 30,
        attackRange: 10,
        xpReward: 13400,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.74,
        torsoHitboxHeight: 1.88,
        lootTags: ["Venda Real Maldita", "Escarabajo de Oro Oscuro", "Urna Can\xF3pica"]
      }
    },
    stitched_necromancy_chimera: {
      id: "enemy_undead_stitched_chimera",
      name: "Quimera Cosida de Nigromancia",
      title: "Engendro Bic\xE9falo de Laboratorio Oscuro (Nv. 76)",
      raceCategory: "undead",
      bodyPlan: "quadruped_beast",
      archetype: "stitched_necromancy_chimera",
      helm: "draconic_snout",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "scorpion_stinger_tail",
      morphology: {
        heightScale: 1.24,
        torsoBulk: 1.3,
        shoulderWidth: 1.32,
        hornLength: 1.32,
        hornCurve: 0.95,
        pauldronSize: 0.88,
        weaponScale: 1.22,
        dorsalScale: 1.48,
        limbLength: 1.12,
        neckLength: 0.88,
        tailLength: 1.52,
        snoutLength: 1.15,
        headCount: 2,
        auraShardCount: 14,
        hairStyle: "wild_mane_fur"
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#3f3f46",
        secondaryColor: "#a1a1aa",
        underbodyColor: "#18181b",
        emissiveColor: "#10b981",
        emissiveIntensity: 2.5,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 76,
        tier: "Mini-Boss",
        element: "Veneno",
        aiBehavior: "Aggressive Berserker",
        hp: 32600,
        attack: 835,
        defense: 620,
        speed: 162,
        critChance: 27,
        aggroRadius: 28,
        attackRange: 3.6,
        xpReward: 16400,
        headHitboxRadius: 0.44,
        torsoHitboxRadius: 0.86,
        torsoHitboxHeight: 1.75,
        lootTags: ["Coraz\xF3n Reanimado", "Aguij\xF3n Quim\xE9rico", "Piel Suturada"]
      }
    },
    banshee_frozen_throne: {
      id: "enemy_undead_banshee_queen",
      name: "Banshee del Trono Helado",
      title: "Esp\xEDritu Aullador de Escarcha y Muerte (Nv. 74)",
      raceCategory: "undead",
      bodyPlan: "floating_magical",
      archetype: "banshee_frozen_throne",
      helm: "valkyrie_crest",
      weapon: "frost_breath_maw",
      offhand: "none",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.24,
        torsoBulk: 0.94,
        shoulderWidth: 1.16,
        hornLength: 1.15,
        hornCurve: 0.82,
        pauldronSize: 1.02,
        weaponScale: 1.15,
        dorsalScale: 1.48,
        limbLength: 1.16,
        neckLength: 0.7,
        tailLength: 1.1,
        snoutLength: 0.48,
        headCount: 1,
        auraShardCount: 20,
        hairStyle: "long_flowing_hair"
      },
      materials: {
        preset: "arcane_crystal",
        ...MATERIAL_PRESETS.arcane_crystal,
        primaryColor: "#1e293b",
        secondaryColor: "#bae6fd",
        underbodyColor: "#090d16",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.8,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 74,
        tier: "Mini-Boss",
        element: "Escarcha",
        aiBehavior: "Aerial Breath Sweeper",
        hp: 24100,
        attack: 815,
        defense: 490,
        speed: 178,
        critChance: 29,
        aggroRadius: 30,
        attackRange: 9,
        xpReward: 14200,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.72,
        torsoHitboxHeight: 1.88,
        lootTags: ["Lamento Cristalizado", "Velo de Banshee", "L\xE1grima Espectral"]
      }
    },
    ash_bone_naga_siren: {
      id: "enemy_undead_ash_naga",
      name: "Sierpe de Ceniza y Hueso",
      title: "Gorgona Esquel\xE9tica de las Ruinas (Nv. 70)",
      raceCategory: "undead",
      bodyPlan: "serpentine_naga",
      archetype: "ash_bone_naga_siren",
      helm: "crowned_skull",
      weapon: "venom_scythe_claws",
      offhand: "phylactery_orb",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.22,
        torsoBulk: 1.06,
        shoulderWidth: 1.18,
        hornLength: 1.18,
        hornCurve: 0.88,
        pauldronSize: 1.04,
        weaponScale: 1.28,
        dorsalScale: 1.32,
        limbLength: 1.1,
        neckLength: 0.78,
        tailLength: 1.58,
        snoutLength: 0.62,
        headCount: 1,
        auraShardCount: 14
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#d6d3d1",
        secondaryColor: "#312e81",
        underbodyColor: "#1c1917",
        emissiveColor: "#c084fc",
        emissiveIntensity: 2.5,
        texturePattern: "scales"
      },
      stats: {
        level: 70,
        tier: "Elite",
        element: "Abisal",
        aiBehavior: "Ambush Stalker",
        hp: 21400,
        attack: 760,
        defense: 530,
        speed: 162,
        critChance: 26,
        aggroRadius: 26,
        attackRange: 4.2,
        xpReward: 11600,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.74,
        torsoHitboxHeight: 1.84,
        lootTags: ["Escama de Ceniza", "Espina Dorsal Maldita", "Ojo Petrificante"]
      }
    },
    embalmed_anubis_sentinel: {
      id: "enemy_undead_embalmed_sentinel",
      name: "Guardi\xE1n Chacal Embalsamado",
      title: "Coloso Funerario de Tumba Real (Nv. 71)",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "embalmed_anubis_sentinel",
      helm: "lupine_maw",
      weapon: "radiant_halberd",
      offhand: "tower_shield",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.28,
        torsoBulk: 1.2,
        shoulderWidth: 1.3,
        hornLength: 1.25,
        hornCurve: 0.55,
        pauldronSize: 1.26,
        weaponScale: 1.35,
        dorsalScale: 1.35,
        limbLength: 1.16,
        neckLength: 0.68,
        tailLength: 1.1,
        snoutLength: 1.12,
        headCount: 1,
        auraShardCount: 14
      },
      materials: {
        preset: "corroded_bronze",
        ...MATERIAL_PRESETS.corroded_bronze,
        primaryColor: "#1c1917",
        secondaryColor: "#eab308",
        underbodyColor: "#0c0a09",
        emissiveColor: "#14b8a6",
        emissiveIntensity: 2.4,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 71,
        tier: "Elite",
        element: "Abisal",
        aiBehavior: "Shield Wall Tank",
        hp: 26400,
        attack: 750,
        defense: 720,
        speed: 134,
        critChance: 22,
        aggroRadius: 25,
        attackRange: 4,
        xpReward: 12500,
        headHitboxRadius: 0.4,
        torsoHitboxRadius: 0.82,
        torsoHitboxHeight: 1.92,
        lootTags: ["Cetro de Anubis", "Oro Funerario", "Amuleto del Inframundo"]
      }
    },
    phantom_armored_boar: {
      id: "enemy_undead_phantom_boar",
      name: "Jabal\xED Acorazado Fantasmal",
      title: "Bestia de Guerra Espectral (Nv. 62)",
      raceCategory: "undead",
      bodyPlan: "quadruped_beast",
      archetype: "phantom_armored_boar",
      helm: "tauren_bull_horns",
      weapon: "ram_charge",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.12,
        torsoBulk: 1.38,
        shoulderWidth: 1.32,
        hornLength: 1.18,
        hornCurve: 0.95,
        pauldronSize: 1.1,
        weaponScale: 1.2,
        dorsalScale: 1.28,
        limbLength: 0.96,
        neckLength: 0.48,
        tailLength: 0.65,
        snoutLength: 1.08,
        headCount: 1,
        auraShardCount: 10,
        hairStyle: "dorsal_mohawk"
      },
      materials: {
        preset: "abyssal_obsidian",
        ...MATERIAL_PRESETS.abyssal_obsidian,
        primaryColor: "#1e293b",
        secondaryColor: "#cbd5e1",
        underbodyColor: "#0f172a",
        emissiveColor: "#22d3ee",
        emissiveIntensity: 2.4,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 62,
        tier: "Elite",
        element: "Abisal",
        aiBehavior: "Aggressive Berserker",
        hp: 20400,
        attack: 685,
        defense: 630,
        speed: 148,
        critChance: 21,
        aggroRadius: 22,
        attackRange: 2.8,
        xpReward: 8600,
        headHitboxRadius: 0.4,
        torsoHitboxRadius: 0.84,
        torsoHitboxHeight: 1.52,
        lootTags: ["Colmillo Espectral", "Barda Fantasmal", "Pezu\xF1a de Cripta"]
      }
    },
    skull_tyrant_overlord: {
      id: "enemy_undead_skull_tyrant",
      name: "Se\xF1or de los Cr\xE1neos Flotante",
      title: "Orbe Ocular de Osamenta y Terror (Nv. 81)",
      raceCategory: "undead",
      bodyPlan: "floating_magical",
      archetype: "skull_tyrant_overlord",
      helm: "beholder_cyclops_eye",
      weapon: "dragon_breath_maw",
      offhand: "none",
      dorsal: "beholder_eye_tentacles",
      morphology: {
        heightScale: 1.28,
        torsoBulk: 1.34,
        shoulderWidth: 1.28,
        hornLength: 1.15,
        hornCurve: 0.92,
        pauldronSize: 1,
        weaponScale: 1.2,
        dorsalScale: 1.58,
        limbLength: 1.05,
        neckLength: 0.42,
        tailLength: 1.2,
        snoutLength: 0.72,
        headCount: 1,
        auraShardCount: 22
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e7e5e4",
        secondaryColor: "#7f1d1d",
        underbodyColor: "#1c1917",
        emissiveColor: "#10b981",
        emissiveIntensity: 2.9,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 81,
        tier: "Raid Boss",
        element: "Abisal",
        aiBehavior: "Boss Multi-Phase",
        hp: 40500,
        attack: 880,
        defense: 670,
        speed: 132,
        critChance: 26,
        aggroRadius: 34,
        attackRange: 9.5,
        xpReward: 23100,
        headHitboxRadius: 0.6,
        torsoHitboxRadius: 0.96,
        torsoHitboxHeight: 1.92,
        lootTags: ["Cr\xE1neo Ocular Supremo", "N\xFAcleo Nigrom\xE1ntico", "Corona de Tent\xE1culos \xD3seos"]
      }
    },
    // ============================================================================
    // 20 NEW LOW-LEVEL DESIGNS (Zonas Iniciales Nv. 1 - 20)
    // ============================================================================
    tunnel_giant_rat: {
      id: "enemy-tunnel-giant-rat",
      name: "Rata Gigante de Alcantarilla",
      title: "Plaga Voraz de las Catacumbas Iniciales (Nv. 1)",
      raceCategory: "low_level",
      bodyPlan: "quadruped_beast",
      archetype: "tunnel_giant_rat",
      helm: "lupine_maw",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "none",
      morphology: {
        heightScale: 0.68,
        torsoBulk: 0.82,
        shoulderWidth: 0.78,
        hornLength: 0.42,
        hornCurve: 0.15,
        pauldronSize: 0,
        weaponScale: 0.85,
        dorsalScale: 0.5,
        limbLength: 0.78,
        neckLength: 0.72,
        tailLength: 1.38,
        snoutLength: 1.08,
        headCount: 1,
        auraShardCount: 4,
        furDensity: 1.15,
        hairStyle: "full_fur_coat",
        hairLength: 0.85,
        muscleDefinition: 0.95
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#57534e",
        secondaryColor: "#a8a29e",
        underbodyColor: "#44403c",
        emissiveColor: "#ef4444",
        emissiveIntensity: 1.4,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 1,
        tier: "Minion",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Ambush Stalker",
        hp: 420,
        attack: 34,
        defense: 18,
        speed: 146,
        critChance: 16,
        aggroRadius: 8,
        attackRange: 1.5,
        xpReward: 28,
        headHitboxRadius: 0.25,
        torsoHitboxRadius: 0.42,
        torsoHitboxHeight: 0.72,
        lootTags: ["Incisivo de Rata", "Cola Escamosa", "Piel Ra\xEDda"]
      }
    },
    prairie_red_fox: {
      id: "enemy-prairie-red-fox",
      name: "Zorro Rojo de las Praderas",
      title: "Cazador Astuto del Valle Inicial (Nv. 2)",
      raceCategory: "low_level",
      bodyPlan: "quadruped_beast",
      archetype: "prairie_red_fox",
      helm: "lupine_maw",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "none",
      morphology: {
        heightScale: 0.74,
        torsoBulk: 0.86,
        shoulderWidth: 0.84,
        hornLength: 0.88,
        hornCurve: 0.2,
        pauldronSize: 0,
        weaponScale: 0.9,
        dorsalScale: 0.5,
        limbLength: 0.92,
        neckLength: 0.9,
        tailLength: 1.42,
        snoutLength: 1.16,
        headCount: 1,
        auraShardCount: 5,
        furDensity: 1.38,
        hairStyle: "full_fur_coat",
        hairLength: 1.15,
        muscleDefinition: 1.05
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#c2410c",
        secondaryColor: "#fed7aa",
        underbodyColor: "#431407",
        emissiveColor: "#f59e0b",
        emissiveIntensity: 1.5,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 2,
        tier: "Minion",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Ambush Stalker",
        hp: 510,
        attack: 42,
        defense: 22,
        speed: 158,
        critChance: 22,
        aggroRadius: 10,
        attackRange: 1.7,
        xpReward: 42,
        headHitboxRadius: 0.27,
        torsoHitboxRadius: 0.45,
        torsoHitboxHeight: 0.78,
        lootTags: ["Piel de Zorro Carmes\xED", "Colmillo Fino", "Cola Esponjosa"]
      }
    },
    horned_field_viper: {
      id: "enemy-horned-field-viper",
      name: "V\xEDbora Cornuda de los Trigales",
      title: "Serpiente Acechadora de Hierba Alta (Nv. 3)",
      raceCategory: "low_level",
      bodyPlan: "serpentine_naga",
      archetype: "horned_field_viper",
      helm: "draconic_snout",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "none",
      morphology: {
        heightScale: 0.78,
        torsoBulk: 0.8,
        shoulderWidth: 0.75,
        hornLength: 0.72,
        hornCurve: 0.55,
        pauldronSize: 0,
        weaponScale: 0.85,
        dorsalScale: 0.65,
        limbLength: 0.72,
        neckLength: 1.1,
        tailLength: 1.55,
        snoutLength: 1.12,
        headCount: 1,
        auraShardCount: 6,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.15
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#4d7c0f",
        secondaryColor: "#eab308",
        underbodyColor: "#1a2e05",
        emissiveColor: "#84cc16",
        emissiveIntensity: 1.8,
        texturePattern: "scales"
      },
      stats: {
        level: 3,
        tier: "Minion",
        element: "Veneno",
        aiBehavior: "Ambush Stalker",
        hp: 620,
        attack: 54,
        defense: 26,
        speed: 148,
        critChance: 24,
        aggroRadius: 11,
        attackRange: 2.1,
        xpReward: 58,
        headHitboxRadius: 0.28,
        torsoHitboxRadius: 0.46,
        torsoHitboxHeight: 0.92,
        lootTags: ["Gl\xE1ndula de Veneno", "Muda de Escamas Verdes", "Colmillo Hueco"]
      }
    },
    cave_vampire_wingbat: {
      id: "enemy-cave-vampire-wingbat",
      name: "Murci\xE9lago Chupasangre de Cueva",
      title: "Acechador Nocturno de Grutas (Nv. 4)",
      raceCategory: "low_level",
      bodyPlan: "dragon_wyvern",
      archetype: "cave_vampire_wingbat",
      helm: "lupine_maw",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 0.76,
        torsoBulk: 0.78,
        shoulderWidth: 0.84,
        hornLength: 0.92,
        hornCurve: 0.18,
        pauldronSize: 0,
        weaponScale: 0.95,
        dorsalScale: 1.28,
        limbLength: 0.86,
        neckLength: 0.72,
        tailLength: 0.52,
        snoutLength: 0.75,
        headCount: 1,
        auraShardCount: 6,
        furDensity: 1.18,
        hairStyle: "full_fur_coat",
        hairLength: 0.92,
        muscleDefinition: 1.02
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#3b0764",
        secondaryColor: "#9f1239",
        underbodyColor: "#1e1b4b",
        emissiveColor: "#f43f5e",
        emissiveIntensity: 1.9,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 4,
        tier: "Minion",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Ambush Stalker",
        hp: 710,
        attack: 62,
        defense: 28,
        speed: 164,
        critChance: 22,
        aggroRadius: 13,
        attackRange: 1.9,
        xpReward: 75,
        headHitboxRadius: 0.28,
        torsoHitboxRadius: 0.46,
        torsoHitboxHeight: 0.84,
        lootTags: ["Membrana de Murci\xE9lago", "Colmillo Sanguinario", "Polvo Nocturno"]
      }
    },
    mud_shell_crab_beetle: {
      id: "enemy-mud-shell-crab-beetle",
      name: "Escarabajo Pinza de Barro",
      title: "Cole\xF3ptero Acorazado de Ribera (Nv. 5)",
      raceCategory: "low_level",
      bodyPlan: "arachnid_scorpion",
      archetype: "mud_shell_crab_beetle",
      helm: "arachnid_mandibles",
      weapon: "feral_claws_fangs",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 0.75,
        torsoBulk: 1.14,
        shoulderWidth: 1.1,
        hornLength: 0.68,
        hornCurve: 0.45,
        pauldronSize: 0.85,
        weaponScale: 1.08,
        dorsalScale: 0.88,
        limbLength: 0.92,
        neckLength: 0.62,
        tailLength: 0.42,
        snoutLength: 0.65,
        headCount: 1,
        auraShardCount: 6,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.12
      },
      materials: {
        preset: "corroded_bronze",
        ...MATERIAL_PRESETS.corroded_bronze,
        primaryColor: "#78350f",
        secondaryColor: "#d97706",
        underbodyColor: "#451a03",
        emissiveColor: "#f59e0b",
        emissiveIntensity: 1.5,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 5,
        tier: "Minion",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Shield Wall Tank",
        hp: 980,
        attack: 68,
        defense: 74,
        speed: 96,
        critChance: 12,
        aggroRadius: 10,
        attackRange: 1.8,
        xpReward: 95,
        headHitboxRadius: 0.3,
        torsoHitboxRadius: 0.62,
        torsoHitboxHeight: 0.86,
        lootTags: ["Caparaz\xF3n de Quitina", "Tenaza de Barro", "Icor Espeso"]
      }
    },
    steppe_spotted_hyena: {
      id: "enemy-steppe-spotted-hyena",
      name: "Hiena Manchada de la Estepa",
      title: "Carro\xF1ero Feroz de las Colinas Secas (Nv. 6)",
      raceCategory: "low_level",
      bodyPlan: "quadruped_beast",
      archetype: "steppe_spotted_hyena",
      helm: "lupine_maw",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "none",
      morphology: {
        heightScale: 0.84,
        torsoBulk: 1.04,
        shoulderWidth: 1.06,
        hornLength: 0.62,
        hornCurve: 0.22,
        pauldronSize: 0,
        weaponScale: 0.96,
        dorsalScale: 0.5,
        limbLength: 0.95,
        neckLength: 0.96,
        tailLength: 0.92,
        snoutLength: 1.06,
        headCount: 1,
        auraShardCount: 6,
        furDensity: 1.32,
        hairStyle: "wild_mane_fur",
        hairLength: 1.12,
        muscleDefinition: 1.24
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#a16207",
        secondaryColor: "#422006",
        underbodyColor: "#292524",
        emissiveColor: "#f97316",
        emissiveIntensity: 1.6,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 6,
        tier: "Minion",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Pack Alpha Predator",
        hp: 1120,
        attack: 86,
        defense: 48,
        speed: 142,
        critChance: 21,
        aggroRadius: 14,
        attackRange: 1.9,
        xpReward: 120,
        headHitboxRadius: 0.32,
        torsoHitboxRadius: 0.56,
        torsoHitboxHeight: 0.96,
        lootTags: ["Piel Moteada de Hiena", "Mand\xEDbula Rompehuesos", "Crin \xC1spera"]
      }
    },
    mountain_bighorn_ram: {
      id: "enemy-mountain-bighorn-ram",
      name: "Carnero Cimarr\xF3n de Risco",
      title: "Embestidor Cornudo de las Cumbres Bajas (Nv. 7)",
      raceCategory: "low_level",
      bodyPlan: "quadruped_beast",
      archetype: "mountain_bighorn_ram",
      helm: "tauren_bull_horns",
      weapon: "ram_charge",
      offhand: "none",
      dorsal: "none",
      morphology: {
        heightScale: 0.88,
        torsoBulk: 1.16,
        shoulderWidth: 1.14,
        hornLength: 1.38,
        hornCurve: 0.92,
        pauldronSize: 0,
        weaponScale: 1.05,
        dorsalScale: 0.5,
        limbLength: 0.98,
        neckLength: 0.92,
        tailLength: 0.55,
        snoutLength: 0.94,
        headCount: 1,
        auraShardCount: 6,
        furDensity: 1.42,
        hairStyle: "wild_mane_fur",
        hairLength: 1.18,
        muscleDefinition: 1.28
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#78716c",
        secondaryColor: "#e7e5e4",
        underbodyColor: "#44403c",
        emissiveColor: "#fbbf24",
        emissiveIntensity: 1.4,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 7,
        tier: "Minion",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Aggressive Berserker",
        hp: 1380,
        attack: 98,
        defense: 68,
        speed: 134,
        critChance: 18,
        aggroRadius: 13,
        attackRange: 2.1,
        xpReward: 150,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.62,
        torsoHitboxHeight: 1.04,
        lootTags: ["Cuerno Espiral de Carnero", "Lana Gruesa de Monta\xF1a", "Pezu\xF1a de Roca"]
      }
    },
    swamp_poison_newt: {
      id: "enemy-swamp-poison-newt",
      name: "Salamandra Venenosa de Pantano",
      title: "Anfibio Escupidor de \xC1cido (Nv. 8)",
      raceCategory: "low_level",
      bodyPlan: "quadruped_beast",
      archetype: "swamp_poison_newt",
      helm: "draconic_snout",
      weapon: "dragon_breath_maw",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 0.78,
        torsoBulk: 0.96,
        shoulderWidth: 0.94,
        hornLength: 0.54,
        hornCurve: 0.35,
        pauldronSize: 0,
        weaponScale: 0.92,
        dorsalScale: 0.92,
        limbLength: 0.88,
        neckLength: 0.88,
        tailLength: 1.36,
        snoutLength: 1.05,
        headCount: 1,
        auraShardCount: 8,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.08
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#15803d",
        secondaryColor: "#facc15",
        underbodyColor: "#052e16",
        emissiveColor: "#a3e635",
        emissiveIntensity: 2.1,
        texturePattern: "scales"
      },
      stats: {
        level: 8,
        tier: "Minion",
        element: "Veneno",
        aiBehavior: "Arcane Artillery",
        hp: 1490,
        attack: 112,
        defense: 62,
        speed: 118,
        critChance: 19,
        aggroRadius: 15,
        attackRange: 5.2,
        xpReward: 185,
        headHitboxRadius: 0.32,
        torsoHitboxRadius: 0.56,
        torsoHitboxHeight: 0.94,
        lootTags: ["Piel Mucosa T\xF3xica", "Cresta Dorsal Amarilla", "Bilis Corrosiva"]
      }
    },
    thicket_razor_badger: {
      id: "enemy-thicket-razor-badger",
      name: "Tej\xF3n Garras de Hierro",
      title: "Excavador Furioso del Sotobosque (Nv. 9)",
      raceCategory: "low_level",
      bodyPlan: "quadruped_beast",
      archetype: "thicket_razor_badger",
      helm: "lupine_maw",
      weapon: "feral_claws_fangs",
      offhand: "none",
      dorsal: "none",
      morphology: {
        heightScale: 0.76,
        torsoBulk: 1.22,
        shoulderWidth: 1.18,
        hornLength: 0.45,
        hornCurve: 0.18,
        pauldronSize: 0,
        weaponScale: 1.28,
        dorsalScale: 0.52,
        limbLength: 0.96,
        neckLength: 0.78,
        tailLength: 0.68,
        snoutLength: 0.98,
        headCount: 1,
        auraShardCount: 6,
        furDensity: 1.36,
        hairStyle: "dorsal_mohawk",
        hairLength: 1.08,
        muscleDefinition: 1.32
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#27272a",
        secondaryColor: "#f4f4f5",
        underbodyColor: "#09090b",
        emissiveColor: "#fb923c",
        emissiveIntensity: 1.5,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 9,
        tier: "Minion",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Aggressive Berserker",
        hp: 1760,
        attack: 126,
        defense: 88,
        speed: 124,
        critChance: 22,
        aggroRadius: 12,
        attackRange: 1.8,
        xpReward: 220,
        headHitboxRadius: 0.32,
        torsoHitboxRadius: 0.62,
        torsoHitboxHeight: 0.92,
        lootTags: ["Garra Excavadora de Tej\xF3n", "Pelaje Rayado Denso", "Colmillo Obstinado"]
      }
    },
    dune_yellow_scorpion: {
      id: "enemy-dune-yellow-scorpion",
      name: "Escorpi\xF3n Dorado de las Dunas",
      title: "Ar\xE1cnido Aguij\xF3n de Arena (Nv. 10)",
      raceCategory: "low_level",
      bodyPlan: "arachnid_scorpion",
      archetype: "dune_yellow_scorpion",
      helm: "arachnid_mandibles",
      weapon: "feral_claws_fangs",
      offhand: "none",
      dorsal: "scorpion_stinger_tail",
      morphology: {
        heightScale: 0.82,
        torsoBulk: 1.06,
        shoulderWidth: 1.08,
        hornLength: 0.62,
        hornCurve: 0.55,
        pauldronSize: 0.88,
        weaponScale: 1.24,
        dorsalScale: 1.18,
        limbLength: 1.02,
        neckLength: 0.68,
        tailLength: 1.38,
        snoutLength: 0.72,
        headCount: 1,
        auraShardCount: 8,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.15
      },
      materials: {
        preset: "corroded_bronze",
        ...MATERIAL_PRESETS.corroded_bronze,
        primaryColor: "#ca8a04",
        secondaryColor: "#713f12",
        underbodyColor: "#422006",
        emissiveColor: "#84cc16",
        emissiveIntensity: 1.9,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 10,
        tier: "Elite",
        element: "Veneno",
        aiBehavior: "Ambush Stalker",
        hp: 2150,
        attack: 148,
        defense: 104,
        speed: 132,
        critChance: 25,
        aggroRadius: 14,
        attackRange: 2.3,
        xpReward: 290,
        headHitboxRadius: 0.32,
        torsoHitboxRadius: 0.64,
        torsoHitboxHeight: 0.98,
        lootTags: ["Aguij\xF3n Venenoso Dorado", "Pinza Quitina de Arena", "Veneno de Escorpi\xF3n"]
      }
    },
    forest_goblin_scavenger: {
      id: "enemy-forest-goblin-scavenger",
      name: "Trasgo Saqueador del Bosque",
      title: "Merodeador Pielverde de Caminos (Nv. 11)",
      raceCategory: "low_level",
      bodyPlan: "biped_titan",
      archetype: "forest_goblin_scavenger",
      helm: "goblin_feral_face",
      weapon: "twin_reaver_axes",
      offhand: "runic_buckler",
      dorsal: "none",
      morphology: {
        heightScale: 0.78,
        torsoBulk: 0.84,
        shoulderWidth: 0.88,
        hornLength: 0.92,
        hornCurve: 0.35,
        pauldronSize: 0.76,
        weaponScale: 0.95,
        dorsalScale: 0.5,
        limbLength: 0.94,
        neckLength: 0.82,
        tailLength: 0,
        snoutLength: 0.84,
        headCount: 1,
        auraShardCount: 6,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.18
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#4d7c0f",
        secondaryColor: "#78350f",
        underbodyColor: "#1a2e05",
        emissiveColor: "#ef4444",
        emissiveIntensity: 2.6,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 11,
        tier: "Minion",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Aggressive Berserker",
        hp: 2340,
        attack: 162,
        defense: 96,
        speed: 144,
        critChance: 22,
        aggroRadius: 15,
        attackRange: 2.1,
        xpReward: 330,
        headHitboxRadius: 0.3,
        torsoHitboxRadius: 0.54,
        torsoHitboxHeight: 1.08,
        lootTags: ["Hachuela Oxidada de Trasgo", "Bolsa de Monedas Robadas", "Oreja de Trasgo"]
      }
    },
    graveyard_zombie_hound: {
      id: "enemy-graveyard-zombie-hound",
      name: "Perro Carro\xF1ero del Cementerio",
      title: "Sabueso Putrefacto de Cripta Menor (Nv. 12)",
      raceCategory: "low_level",
      bodyPlan: "quadruped_beast",
      archetype: "graveyard_zombie_hound",
      helm: "lupine_maw",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 0.86,
        torsoBulk: 0.94,
        shoulderWidth: 0.96,
        hornLength: 0.68,
        hornCurve: 0.25,
        pauldronSize: 0,
        weaponScale: 1.08,
        dorsalScale: 0.78,
        limbLength: 0.94,
        neckLength: 0.94,
        tailLength: 0.98,
        snoutLength: 1.12,
        headCount: 1,
        auraShardCount: 8,
        furDensity: 0.88,
        hairStyle: "full_fur_coat",
        hairLength: 0.92,
        muscleDefinition: 1.26
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#44403c",
        secondaryColor: "#a8a29e",
        underbodyColor: "#1c1917",
        emissiveColor: "#10b981",
        emissiveIntensity: 2,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 12,
        tier: "Minion",
        element: "Veneno",
        aiBehavior: "Aggressive Berserker",
        hp: 2580,
        attack: 176,
        defense: 102,
        speed: 146,
        critChance: 23,
        aggroRadius: 16,
        attackRange: 2,
        xpReward: 380,
        headHitboxRadius: 0.32,
        torsoHitboxRadius: 0.56,
        torsoHitboxHeight: 1.02,
        lootTags: ["Colmillo Infectado", "Costilla de Sabueso", "Carne Necr\xF3tica"]
      }
    },
    ruins_skeleton_pawn: {
      id: "enemy-ruins-skeleton-pawn",
      name: "Esqueleto Pe\xF3n de las Ruinas",
      title: "Centinela \xD3seo de Muralla Antigua (Nv. 13)",
      raceCategory: "low_level",
      bodyPlan: "biped_titan",
      archetype: "ruins_skeleton_pawn",
      helm: "crowned_skull",
      weapon: "runic_greatsword",
      offhand: "runic_buckler",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 0.92,
        torsoBulk: 0.86,
        shoulderWidth: 0.92,
        hornLength: 0.42,
        hornCurve: 0.25,
        pauldronSize: 0.86,
        weaponScale: 1,
        dorsalScale: 0.72,
        limbLength: 0.96,
        neckLength: 0.9,
        tailLength: 0,
        snoutLength: 0.55,
        headCount: 1,
        auraShardCount: 8,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.12
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#d6d3d1",
        secondaryColor: "#57534e",
        underbodyColor: "#292524",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 1.8,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 13,
        tier: "Minion",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Aggressive Berserker",
        hp: 2890,
        attack: 192,
        defense: 118,
        speed: 122,
        critChance: 18,
        aggroRadius: 15,
        attackRange: 2.4,
        xpReward: 430,
        headHitboxRadius: 0.32,
        torsoHitboxRadius: 0.58,
        torsoHitboxHeight: 1.24,
        lootTags: ["Fragmento de Cr\xE1neo Antiguo", "Espada Mellada de Ruinas", "Rodela Quebrada"]
      }
    },
    mine_kobold_pickaxe: {
      id: "enemy-mine-kobold-pickaxe",
      name: "K\xF3bold Minero de Socav\xF3n",
      title: "Excavador Lupino de Vetas de Cobre (Nv. 14)",
      raceCategory: "low_level",
      bodyPlan: "biped_titan",
      archetype: "mine_kobold_pickaxe",
      helm: "lupine_maw",
      weapon: "obsidian_warhammer",
      offhand: "none",
      dorsal: "none",
      morphology: {
        heightScale: 0.82,
        torsoBulk: 0.9,
        shoulderWidth: 0.92,
        hornLength: 0.68,
        hornCurve: 0.25,
        pauldronSize: 0.78,
        weaponScale: 1.05,
        dorsalScale: 0.5,
        limbLength: 0.94,
        neckLength: 0.86,
        tailLength: 0.88,
        snoutLength: 1.05,
        headCount: 1,
        auraShardCount: 6,
        furDensity: 1.15,
        hairStyle: "full_fur_coat",
        hairLength: 0.95,
        muscleDefinition: 1.14
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#7c2d12",
        secondaryColor: "#d97706",
        underbodyColor: "#431407",
        emissiveColor: "#f59e0b",
        emissiveIntensity: 1.7,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 14,
        tier: "Minion",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Aggressive Berserker",
        hp: 3240,
        attack: 208,
        defense: 132,
        speed: 130,
        critChance: 20,
        aggroRadius: 15,
        attackRange: 2.3,
        xpReward: 490,
        headHitboxRadius: 0.32,
        torsoHitboxRadius: 0.56,
        torsoHitboxHeight: 1.12,
        lootTags: ["Pico Pesado de K\xF3bold", "Pepita de Cobre Bruto", "Vela de Sebo de Mina"]
      }
    },
    marsh_leech_worm: {
      id: "enemy-marsh-leech-worm",
      name: "Sanguijuela Voraz de Ci\xE9naga",
      title: "Gusano Chupasangre del Pantano Negro (Nv. 15)",
      raceCategory: "low_level",
      bodyPlan: "serpentine_naga",
      archetype: "marsh_leech_worm",
      helm: "arachnid_mandibles",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 0.84,
        torsoBulk: 1.02,
        shoulderWidth: 0.88,
        hornLength: 0.58,
        hornCurve: 0.65,
        pauldronSize: 0,
        weaponScale: 0.95,
        dorsalScale: 0.84,
        limbLength: 0.78,
        neckLength: 1.04,
        tailLength: 1.52,
        snoutLength: 0.88,
        headCount: 1,
        auraShardCount: 8,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.18
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#4c0519",
        secondaryColor: "#9f1239",
        underbodyColor: "#1f2937",
        emissiveColor: "#f43f5e",
        emissiveIntensity: 1.9,
        texturePattern: "scales"
      },
      stats: {
        level: 15,
        tier: "Minion",
        element: "Veneno",
        aiBehavior: "Ambush Stalker",
        hp: 3650,
        attack: 224,
        defense: 126,
        speed: 128,
        critChance: 22,
        aggroRadius: 15,
        attackRange: 2.2,
        xpReward: 560,
        headHitboxRadius: 0.34,
        torsoHitboxRadius: 0.58,
        torsoHitboxHeight: 1.08,
        lootTags: ["Ventosa Dentada", "Sangre Coagulada de Ci\xE9naga", "Mucosidad Regenerativa"]
      }
    },
    highland_lynx_stalker: {
      id: "enemy-highland-lynx-stalker",
      name: "Lince Boreal de las Colinas",
      title: "Felino Acechador de Pe\xF1ascos (Nv. 16)",
      raceCategory: "low_level",
      bodyPlan: "quadruped_beast",
      archetype: "highland_lynx_stalker",
      helm: "lupine_maw",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "none",
      morphology: {
        heightScale: 0.88,
        torsoBulk: 0.98,
        shoulderWidth: 1.02,
        hornLength: 0.88,
        hornCurve: 0.22,
        pauldronSize: 0,
        weaponScale: 1.16,
        dorsalScale: 0.5,
        limbLength: 0.98,
        neckLength: 0.94,
        tailLength: 0.62,
        snoutLength: 0.98,
        headCount: 1,
        auraShardCount: 8,
        furDensity: 1.4,
        hairStyle: "full_fur_coat",
        hairLength: 1.14,
        muscleDefinition: 1.3
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#d6d3d1",
        secondaryColor: "#57534e",
        underbodyColor: "#292524",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 1.8,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 16,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Ambush Stalker",
        hp: 4120,
        attack: 256,
        defense: 138,
        speed: 168,
        critChance: 32,
        aggroRadius: 18,
        attackRange: 2.1,
        xpReward: 650,
        headHitboxRadius: 0.34,
        torsoHitboxRadius: 0.58,
        torsoHitboxHeight: 1.06,
        lootTags: ["Piel Moteada de Lince", "Garra Retr\xE1ctil Afilada", "Oreja Penacho Boreal"]
      }
    },
    lesser_fire_imp: {
      id: "enemy-lesser-fire-imp",
      name: "Diablillo P\xEDrico Menor",
      title: "Engendro \xCDgneo de Grieta Volc\xE1nica (Nv. 17)",
      raceCategory: "low_level",
      bodyPlan: "floating_magical",
      archetype: "lesser_fire_imp",
      helm: "tauren_bull_horns",
      weapon: "dragon_breath_maw",
      offhand: "none",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 0.82,
        torsoBulk: 0.84,
        shoulderWidth: 0.9,
        hornLength: 0.96,
        hornCurve: 0.58,
        pauldronSize: 0.65,
        weaponScale: 1.05,
        dorsalScale: 1.12,
        limbLength: 0.92,
        neckLength: 0.84,
        tailLength: 1.24,
        snoutLength: 0.78,
        headCount: 1,
        auraShardCount: 10,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.08
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#b91c1c",
        secondaryColor: "#f97316",
        underbodyColor: "#450a0a",
        emissiveColor: "#fb923c",
        emissiveIntensity: 2.5,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 17,
        tier: "Minion",
        element: "Fuego Drac\xF3nico",
        aiBehavior: "Arcane Artillery",
        hp: 4380,
        attack: 278,
        defense: 134,
        speed: 152,
        critChance: 24,
        aggroRadius: 18,
        attackRange: 6.2,
        xpReward: 730,
        headHitboxRadius: 0.32,
        torsoHitboxRadius: 0.54,
        torsoHitboxHeight: 1.08,
        lootTags: ["Ascua de Diablillo", "Cuerno Chamuscado", "Ceniza Sulf\xFArica"]
      }
    },
    young_green_drake: {
      id: "enemy-young-green-drake",
      name: "Draco Verde Joven del Valle",
      title: "Cr\xEDa Alada de los Bosques Antiguos (Nv. 18)",
      raceCategory: "low_level",
      bodyPlan: "dragon_wyvern",
      archetype: "young_green_drake",
      helm: "draconic_snout",
      weapon: "dragon_breath_maw",
      offhand: "none",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 0.92,
        torsoBulk: 0.96,
        shoulderWidth: 1.02,
        hornLength: 0.94,
        hornCurve: 0.48,
        pauldronSize: 0,
        weaponScale: 1.12,
        dorsalScale: 1.32,
        limbLength: 0.98,
        neckLength: 1.14,
        tailLength: 1.34,
        snoutLength: 1.18,
        headCount: 1,
        auraShardCount: 10,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.22
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#15803d",
        secondaryColor: "#ca8a04",
        underbodyColor: "#052e16",
        emissiveColor: "#f97316",
        emissiveIntensity: 2.2,
        texturePattern: "scales"
      },
      stats: {
        level: 18,
        tier: "Elite",
        element: "Fuego Drac\xF3nico",
        aiBehavior: "Aerial Breath Sweeper",
        hp: 5250,
        attack: 304,
        defense: 176,
        speed: 146,
        critChance: 24,
        aggroRadius: 20,
        attackRange: 5.5,
        xpReward: 860,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.64,
        torsoHitboxHeight: 1.24,
        lootTags: ["Escama de Draco Joven", "Garra Esmeralda", "Gl\xE1ndula de Aliento \xCDgneo"]
      }
    },
    briar_wood_spriggan: {
      id: "enemy-briar-wood-spriggan",
      name: "Esp\xEDritu Zarza del Bosque Viejo",
      title: "Guardi\xE1n Arb\xF3reo de Ra\xEDces Espinosas (Nv. 19)",
      raceCategory: "low_level",
      bodyPlan: "biped_titan",
      archetype: "briar_wood_spriggan",
      helm: "tauren_bull_horns",
      weapon: "arcane_staff",
      offhand: "phylactery_orb",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 0.96,
        torsoBulk: 1.04,
        shoulderWidth: 1.08,
        hornLength: 1.18,
        hornCurve: 0.62,
        pauldronSize: 1.02,
        weaponScale: 1.14,
        dorsalScale: 1.05,
        limbLength: 1.06,
        neckLength: 0.94,
        tailLength: 0,
        snoutLength: 0.64,
        headCount: 1,
        auraShardCount: 12,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.16
      },
      materials: {
        preset: "corroded_bronze",
        ...MATERIAL_PRESETS.corroded_bronze,
        primaryColor: "#3f6212",
        secondaryColor: "#713f12",
        underbodyColor: "#14532d",
        emissiveColor: "#4ade80",
        emissiveIntensity: 2.2,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 19,
        tier: "Elite",
        element: "Veneno",
        aiBehavior: "Arcane Artillery",
        hp: 5890,
        attack: 318,
        defense: 205,
        speed: 118,
        critChance: 21,
        aggroRadius: 19,
        attackRange: 6.8,
        xpReward: 980,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.66,
        torsoHitboxHeight: 1.36,
        lootTags: ["Coraz\xF3n de Savia Viva", "Corteza de Zarza Espinosa", "Semilla Silvestre"]
      }
    },
    outlaw_bandit_cutthroat: {
      id: "enemy-outlaw-bandit-cutthroat",
      name: "Bandido Degollador de Caminos",
      title: "Cabecilla Forajido de la Frontera (Nv. 20)",
      raceCategory: "low_level",
      bodyPlan: "biped_titan",
      archetype: "outlaw_bandit_cutthroat",
      helm: "drake_fang_helm",
      weapon: "venom_scythe_claws",
      offhand: "dual_blade",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1,
        torsoBulk: 0.98,
        shoulderWidth: 1.04,
        hornLength: 0.58,
        hornCurve: 0.35,
        pauldronSize: 0.92,
        weaponScale: 1.08,
        dorsalScale: 0.95,
        limbLength: 1,
        neckLength: 0.92,
        tailLength: 0,
        snoutLength: 0.58,
        headCount: 1,
        auraShardCount: 8,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.2
      },
      materials: {
        preset: "blued_steel",
        ...MATERIAL_PRESETS.blued_steel,
        primaryColor: "#27272a",
        secondaryColor: "#991b1b",
        underbodyColor: "#09090b",
        emissiveColor: "#ef4444",
        emissiveIntensity: 1.8,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 20,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Ambush Stalker",
        hp: 6450,
        attack: 348,
        defense: 192,
        speed: 162,
        critChance: 34,
        aggroRadius: 20,
        attackRange: 2.3,
        xpReward: 1150,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.64,
        torsoHitboxHeight: 1.42,
        lootTags: ["Dagas Gemelas Envenenadas", "Capucha de Forajido", "Bot\xEDn de Caravana"]
      }
    },
    skeleton_emperor_goldcrown: {
      id: "enemy-skeleton-emperor-goldcrown",
      name: "Emperador Esqueleto de Corona \xC1urea",
      title: "Monarca Imperial del Trono Osario",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "skeleton_emperor_goldcrown",
      helm: "crowned_skull",
      weapon: "runic_greatsword",
      offhand: "tower_shield",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.24,
        torsoBulk: 1.02,
        shoulderWidth: 1.18,
        hornLength: 0.92,
        hornCurve: 0.38,
        pauldronSize: 1.22,
        weaponScale: 1.24,
        dorsalScale: 1.25,
        limbLength: 1.12,
        neckLength: 0.96,
        tailLength: 0,
        snoutLength: 0.56,
        headCount: 1,
        auraShardCount: 22,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.15
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e7e5e4",
        secondaryColor: "#eab308",
        underbodyColor: "#292524",
        emissiveColor: "#f59e0b",
        emissiveIntensity: 2.9,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 88,
        tier: "Raid Boss",
        element: "Abisal",
        aiBehavior: "Shield Wall Tank",
        hp: 94500,
        attack: 1620,
        defense: 1180,
        speed: 126,
        critChance: 28,
        aggroRadius: 28,
        attackRange: 3.4,
        xpReward: 42e3,
        headHitboxRadius: 0.42,
        torsoHitboxRadius: 0.78,
        torsoHitboxHeight: 1.72,
        lootTags: ["Corona Imperial de Hueso y Oro", "Mandoble del Emperador Ca\xEDdo", "Sello Real del Osario"]
      }
    },
    ossuary_king_leoric: {
      id: "enemy-ossuary-king-leoric",
      name: "Rey Esqueleto del Mausoleo Negro",
      title: "Soberano Maldito de la Corona Quebrada",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "ossuary_king_leoric",
      helm: "crowned_skull",
      weapon: "obsidian_warhammer",
      offhand: "none",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.28,
        torsoBulk: 1.12,
        shoulderWidth: 1.24,
        hornLength: 0.88,
        hornCurve: 0.42,
        pauldronSize: 1.32,
        weaponScale: 1.35,
        dorsalScale: 1.22,
        limbLength: 1.14,
        neckLength: 0.94,
        tailLength: 0,
        snoutLength: 0.58,
        headCount: 1,
        auraShardCount: 20,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.2
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#d6d3d1",
        secondaryColor: "#ca8a04",
        underbodyColor: "#1c1917",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.8,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 85,
        tier: "Raid Boss",
        element: "Abisal",
        aiBehavior: "Aggressive Berserker",
        hp: 89e3,
        attack: 1690,
        defense: 1090,
        speed: 122,
        critChance: 30,
        aggroRadius: 27,
        attackRange: 3.5,
        xpReward: 39500,
        headHitboxRadius: 0.44,
        torsoHitboxRadius: 0.82,
        torsoHitboxHeight: 1.78,
        lootTags: ["Corona Real del Rey Esqueleto", "Gran Maza del Mausoleo", "F\xE9mur del Trono Negro"]
      }
    },
    crowned_catacomb_pharaoh: {
      id: "enemy-crowned-catacomb-pharaoh",
      name: "Fara\xF3n Esqueleto de la Doble Corona",
      title: "Rey Dios Descarnado de las Pir\xE1mides de Ceniza",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "crowned_catacomb_pharaoh",
      helm: "crowned_skull",
      weapon: "arcane_staff",
      offhand: "phylactery_orb",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.18,
        torsoBulk: 0.96,
        shoulderWidth: 1.14,
        hornLength: 1.04,
        hornCurve: 0.48,
        pauldronSize: 1.16,
        weaponScale: 1.22,
        dorsalScale: 1.28,
        limbLength: 1.1,
        neckLength: 0.98,
        tailLength: 0,
        snoutLength: 0.55,
        headCount: 1,
        auraShardCount: 24,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.1
      },
      materials: {
        preset: "anisotropic_gold",
        ...MATERIAL_PRESETS.anisotropic_gold,
        primaryColor: "#e7e5e4",
        secondaryColor: "#f59e0b",
        underbodyColor: "#1e293b",
        emissiveColor: "#10b981",
        emissiveIntensity: 3,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 84,
        tier: "Raid Boss",
        element: "Fuego Solar",
        aiBehavior: "Arcane Artillery",
        hp: 82400,
        attack: 1580,
        defense: 980,
        speed: 132,
        critChance: 29,
        aggroRadius: 28,
        attackRange: 8.2,
        xpReward: 37800,
        headHitboxRadius: 0.4,
        torsoHitboxRadius: 0.74,
        torsoHitboxHeight: 1.66,
        lootTags: ["Nemes y Corona Fara\xF3nica", "Cetro Solar de Osiris", "Escarabajo de Lapisl\xE1zuli"]
      }
    },
    skeletal_archbishop_pontiff: {
      id: "enemy-skeletal-archbishop-pontiff",
      name: "Pont\xEDfice Esqueleto de la Mitra \xD3sea",
      title: "Sumo Arzobispo de la Catedral Profanada",
      raceCategory: "undead",
      bodyPlan: "floating_magical",
      archetype: "skeletal_archbishop_pontiff",
      helm: "crowned_skull",
      weapon: "arcane_staff",
      offhand: "phylactery_orb",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.2,
        torsoBulk: 0.94,
        shoulderWidth: 1.12,
        hornLength: 1.12,
        hornCurve: 0.32,
        pauldronSize: 1.18,
        weaponScale: 1.24,
        dorsalScale: 1.34,
        limbLength: 1.08,
        neckLength: 0.96,
        tailLength: 0,
        snoutLength: 0.54,
        headCount: 1,
        auraShardCount: 26,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.05
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#f5f5f4",
        secondaryColor: "#d97706",
        underbodyColor: "#31102f",
        emissiveColor: "#c084fc",
        emissiveIntensity: 3.1,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 82,
        tier: "Mini-Boss",
        element: "Abisal",
        aiBehavior: "Arcane Artillery",
        hp: 74500,
        attack: 1540,
        defense: 920,
        speed: 136,
        critChance: 28,
        aggroRadius: 27,
        attackRange: 8.6,
        xpReward: 34200,
        headHitboxRadius: 0.4,
        torsoHitboxRadius: 0.72,
        torsoHitboxHeight: 1.64,
        lootTags: ["Corona Pontificia de Marfil", "B\xE1culo de Excomuni\xF3n", "Relicario de Cripta"]
      }
    },
    bone_viscount_duelist: {
      id: "enemy-bone-viscount-duelist",
      name: "Vizconde Esqueleto de Diadema Carmes\xED",
      title: "Maestro Esgrimista de la Corte Eterna",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "bone_viscount_duelist",
      helm: "crowned_skull",
      weapon: "runic_greatsword",
      offhand: "dual_blade",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.08,
        torsoBulk: 0.88,
        shoulderWidth: 1.06,
        hornLength: 0.76,
        hornCurve: 0.34,
        pauldronSize: 1.04,
        weaponScale: 1.14,
        dorsalScale: 1.16,
        limbLength: 1.1,
        neckLength: 0.95,
        tailLength: 0,
        snoutLength: 0.54,
        headCount: 1,
        auraShardCount: 14,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.16
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e7e5e4",
        secondaryColor: "#991b1b",
        underbodyColor: "#1c1917",
        emissiveColor: "#f43f5e",
        emissiveIntensity: 2.6,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 74,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Ambush Stalker",
        hp: 54200,
        attack: 1380,
        defense: 780,
        speed: 168,
        critChance: 38,
        aggroRadius: 24,
        attackRange: 2.8,
        xpReward: 24500,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.66,
        torsoHitboxHeight: 1.54,
        lootTags: ["Diadema del Vizconde \xD3seo", "Estoque Real Gemelo", "Capa Aristocr\xE1tica Rasgada"]
      }
    },
    cursed_diadem_valkyrie_skeleton: {
      id: "enemy-cursed-diadem-valkyrie-skeleton",
      name: "Valquiria Esqueleto de Diadema Alada",
      title: "Doncella de Escudo \xD3sea del Valhalla Ca\xEDdo",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "cursed_diadem_valkyrie_skeleton",
      helm: "valkyrie_crest",
      weapon: "radiant_halberd",
      offhand: "runic_buckler",
      dorsal: "seraph_wings",
      morphology: {
        heightScale: 1.14,
        torsoBulk: 0.9,
        shoulderWidth: 1.08,
        hornLength: 0.96,
        hornCurve: 0.45,
        pauldronSize: 1.08,
        weaponScale: 1.2,
        dorsalScale: 1.38,
        limbLength: 1.12,
        neckLength: 0.96,
        tailLength: 0,
        snoutLength: 0.52,
        headCount: 1,
        auraShardCount: 18,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.14
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e2e8f0",
        secondaryColor: "#fbbf24",
        underbodyColor: "#1e293b",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.8,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 79,
        tier: "Mini-Boss",
        element: "Escarcha",
        aiBehavior: "Aggressive Berserker",
        hp: 68400,
        attack: 1460,
        defense: 910,
        speed: 158,
        critChance: 34,
        aggroRadius: 26,
        attackRange: 3.3,
        xpReward: 31200,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.68,
        torsoHitboxHeight: 1.6,
        lootTags: ["Diadema Alada de Hueso", "Alabarda de Cripta Celestial", "Pluma \xD3sea de Valquiria"]
      }
    },
    obsidian_crown_dread_skeleton: {
      id: "enemy-obsidian-crown-dread-skeleton",
      name: "Archiduque Esqueleto de Corona de Obsidiana",
      title: "Se\xF1or de la Guerra de la Ciudadela Negra",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "obsidian_crown_dread_skeleton",
      helm: "crowned_skull",
      weapon: "twin_reaver_axes",
      offhand: "tower_shield",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.22,
        torsoBulk: 1.08,
        shoulderWidth: 1.22,
        hornLength: 1.02,
        hornCurve: 0.44,
        pauldronSize: 1.28,
        weaponScale: 1.28,
        dorsalScale: 1.18,
        limbLength: 1.1,
        neckLength: 0.92,
        tailLength: 0,
        snoutLength: 0.58,
        headCount: 1,
        auraShardCount: 18,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.22
      },
      materials: {
        preset: "abyssal_obsidian",
        ...MATERIAL_PRESETS.abyssal_obsidian,
        primaryColor: "#d6d3d1",
        secondaryColor: "#312e81",
        underbodyColor: "#09090b",
        emissiveColor: "#a855f7",
        emissiveIntensity: 2.9,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 81,
        tier: "Mini-Boss",
        element: "Abisal",
        aiBehavior: "Shield Wall Tank",
        hp: 76800,
        attack: 1510,
        defense: 1120,
        speed: 118,
        critChance: 26,
        aggroRadius: 25,
        attackRange: 3.2,
        xpReward: 33400,
        headHitboxRadius: 0.4,
        torsoHitboxRadius: 0.76,
        torsoHitboxHeight: 1.68,
        lootTags: ["Corona Negra de Obsidiana", "Gran Hacha del Archiduque", "Escudo de Pavese Maldito"]
      }
    },
    skeletal_royal_halberdier: {
      id: "enemy-skeletal-royal-halberdier",
      name: "Alabardero Real de la Guardia Esqueleto",
      title: "Custodio Coronado de la C\xE1mara del Trono",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "skeletal_royal_halberdier",
      helm: "crowned_skull",
      weapon: "radiant_halberd",
      offhand: "tower_shield",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.06,
        torsoBulk: 0.94,
        shoulderWidth: 1.08,
        hornLength: 0.72,
        hornCurve: 0.3,
        pauldronSize: 1.12,
        weaponScale: 1.18,
        dorsalScale: 1.08,
        limbLength: 1.06,
        neckLength: 0.92,
        tailLength: 0,
        snoutLength: 0.55,
        headCount: 1,
        auraShardCount: 12,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.14
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#d6d3d1",
        secondaryColor: "#b45309",
        underbodyColor: "#1f2937",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.3,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 68,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Shield Wall Tank",
        hp: 46500,
        attack: 1180,
        defense: 920,
        speed: 124,
        critChance: 22,
        aggroRadius: 22,
        attackRange: 3.4,
        xpReward: 19800,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.68,
        torsoHitboxHeight: 1.52,
        lootTags: ["Yelmo Corona de Guardia Real", "Alabarda de Ceremonia \xD3sea", "Insignia de la Cripta Real"]
      }
    },
    emerald_crown_necromancer_lord: {
      id: "enemy-emerald-crown-necromancer-lord",
      name: "Archimago Esqueleto de Corona Esmeralda",
      title: "Se\xF1or de las Filacterias de Fuego Fatuo",
      raceCategory: "undead",
      bodyPlan: "floating_magical",
      archetype: "emerald_crown_necromancer_lord",
      helm: "crowned_skull",
      weapon: "arcane_staff",
      offhand: "phylactery_orb",
      dorsal: "crystal_pylons",
      morphology: {
        heightScale: 1.16,
        torsoBulk: 0.92,
        shoulderWidth: 1.1,
        hornLength: 0.98,
        hornCurve: 0.42,
        pauldronSize: 1.15,
        weaponScale: 1.22,
        dorsalScale: 1.32,
        limbLength: 1.08,
        neckLength: 0.95,
        tailLength: 0,
        snoutLength: 0.54,
        headCount: 1,
        auraShardCount: 24,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.08
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e7e5e4",
        secondaryColor: "#047857",
        underbodyColor: "#064e3b",
        emissiveColor: "#10b981",
        emissiveIntensity: 3.2,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 80,
        tier: "Mini-Boss",
        element: "Veneno",
        aiBehavior: "Arcane Artillery",
        hp: 69200,
        attack: 1520,
        defense: 860,
        speed: 138,
        critChance: 31,
        aggroRadius: 27,
        attackRange: 8.5,
        xpReward: 32e3,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.7,
        torsoHitboxHeight: 1.62,
        lootTags: ["Corona de Esmeraldas Necr\xF3ticas", "Orbe de Fuego Fatuo", "Tomo de Hueso Grabado"]
      }
    },
    skeleton_warlord_chariot_knight: {
      id: "enemy-skeleton-warlord-chariot-knight",
      name: "Caballero Esqueleto de Corona F\xE9rrea",
      title: "Palad\xEDn Descarnado de la Legi\xF3n Real",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "skeleton_warlord_chariot_knight",
      helm: "crowned_skull",
      weapon: "runic_greatsword",
      offhand: "tower_shield",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.14,
        torsoBulk: 1.02,
        shoulderWidth: 1.16,
        hornLength: 0.84,
        hornCurve: 0.36,
        pauldronSize: 1.24,
        weaponScale: 1.2,
        dorsalScale: 1.15,
        limbLength: 1.08,
        neckLength: 0.94,
        tailLength: 0,
        snoutLength: 0.56,
        headCount: 1,
        auraShardCount: 16,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.18
      },
      materials: {
        preset: "blued_steel",
        ...MATERIAL_PRESETS.blued_steel,
        primaryColor: "#d6d3d1",
        secondaryColor: "#64748b",
        underbodyColor: "#0f172a",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.5,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 72,
        tier: "Elite",
        element: "Escarcha",
        aiBehavior: "Shield Wall Tank",
        hp: 56800,
        attack: 1290,
        defense: 980,
        speed: 128,
        critChance: 25,
        aggroRadius: 24,
        attackRange: 3,
        xpReward: 23200,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.72,
        torsoHitboxHeight: 1.58,
        lootTags: ["Corona de Hierro Forjado", "Espad\xF3n de Caballero \xD3seo", "Grebas de Acero Sepulcral"]
      }
    },
    crowned_crypt_inquisitor: {
      id: "enemy-crowned-crypt-inquisitor",
      name: "Inquisidor Esqueleto de Corona de Espinas",
      title: "Verdugo Eclesi\xE1stico del Santo Osario",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "crowned_crypt_inquisitor",
      helm: "crowned_skull",
      weapon: "twin_reaver_axes",
      offhand: "phylactery_orb",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.15,
        torsoBulk: 0.98,
        shoulderWidth: 1.12,
        hornLength: 0.94,
        hornCurve: 0.48,
        pauldronSize: 1.16,
        weaponScale: 1.24,
        dorsalScale: 1.18,
        limbLength: 1.1,
        neckLength: 0.96,
        tailLength: 0,
        snoutLength: 0.56,
        headCount: 1,
        auraShardCount: 18,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.16
      },
      materials: {
        preset: "corroded_bronze",
        ...MATERIAL_PRESETS.corroded_bronze,
        primaryColor: "#e7e5e4",
        secondaryColor: "#78350f",
        underbodyColor: "#292524",
        emissiveColor: "#ef4444",
        emissiveIntensity: 2.7,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 76,
        tier: "Elite",
        element: "Fuego Solar",
        aiBehavior: "Aggressive Berserker",
        hp: 61500,
        attack: 1420,
        defense: 890,
        speed: 134,
        critChance: 29,
        aggroRadius: 25,
        attackRange: 3.1,
        xpReward: 26800,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.7,
        torsoHitboxHeight: 1.6,
        lootTags: ["Corona de Espinas de Bronce", "Hacha del Inquisidor \xD3seo", "Incensario de Ceniza Santa"]
      }
    },
    blood_crown_reaper_marquis: {
      id: "enemy-blood-crown-reaper-marquis",
      name: "Marqu\xE9s Esqueleto de la Corona Sangrienta",
      title: "Segador Arist\xF3crata de la Luna Roja",
      raceCategory: "undead",
      bodyPlan: "floating_magical",
      archetype: "blood_crown_reaper_marquis",
      helm: "crowned_skull",
      weapon: "venom_scythe_claws",
      offhand: "dual_blade",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.18,
        torsoBulk: 0.9,
        shoulderWidth: 1.12,
        hornLength: 0.96,
        hornCurve: 0.4,
        pauldronSize: 1.18,
        weaponScale: 1.26,
        dorsalScale: 1.28,
        limbLength: 1.12,
        neckLength: 0.96,
        tailLength: 0,
        snoutLength: 0.55,
        headCount: 1,
        auraShardCount: 22,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.12
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#f5f5f4",
        secondaryColor: "#991b1b",
        underbodyColor: "#450a0a",
        emissiveColor: "#ef4444",
        emissiveIntensity: 3.1,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 83,
        tier: "Mini-Boss",
        element: "Abisal",
        aiBehavior: "Ambush Stalker",
        hp: 71800,
        attack: 1610,
        defense: 840,
        speed: 164,
        critChance: 36,
        aggroRadius: 27,
        attackRange: 3.2,
        xpReward: 35600,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.68,
        torsoHitboxHeight: 1.64,
        lootTags: ["Corona de Rub\xEDes de Sangre", "Guada\xF1a del Marqu\xE9s Carmes\xED", "Manto de Terciopelo F\xFAnebre"]
      }
    },
    skeletal_dragonbone_jarl: {
      id: "enemy-skeletal-dragonbone-jarl",
      name: "Jarl Esqueleto de Corona Drac\xF3nica",
      title: "Rey B\xE1rbaro de los T\xFAmulos Escarchados",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "skeletal_dragonbone_jarl",
      helm: "crowned_skull",
      weapon: "twin_reaver_axes",
      offhand: "runic_buckler",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.22,
        torsoBulk: 1.1,
        shoulderWidth: 1.22,
        hornLength: 1.16,
        hornCurve: 0.52,
        pauldronSize: 1.26,
        weaponScale: 1.28,
        dorsalScale: 1.2,
        limbLength: 1.1,
        neckLength: 0.94,
        tailLength: 0,
        snoutLength: 0.58,
        headCount: 1,
        auraShardCount: 16,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.24
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e7e5e4",
        secondaryColor: "#0284c7",
        underbodyColor: "#0f172a",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.8,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 78,
        tier: "Mini-Boss",
        element: "Escarcha",
        aiBehavior: "Aggressive Berserker",
        hp: 69500,
        attack: 1490,
        defense: 960,
        speed: 136,
        critChance: 31,
        aggroRadius: 26,
        attackRange: 3.2,
        xpReward: 30400,
        headHitboxRadius: 0.4,
        torsoHitboxRadius: 0.76,
        torsoHitboxHeight: 1.66,
        lootTags: ["Corona de Colmillos de Drag\xF3n", "Hacha R\xFAnica del Jarl", "Cuerno de Hidromiel Helado"]
      }
    },
    glacial_crown_revenant_king: {
      id: "enemy-glacial-crown-revenant-king",
      name: "Rey Renacido de la Corona Glacial",
      title: "Monarca Esqueleto del Trono de Escarcha",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "glacial_crown_revenant_king",
      helm: "crowned_skull",
      weapon: "runic_greatsword",
      offhand: "phylactery_orb",
      dorsal: "crystal_pylons",
      morphology: {
        heightScale: 1.25,
        torsoBulk: 1.04,
        shoulderWidth: 1.2,
        hornLength: 1.08,
        hornCurve: 0.42,
        pauldronSize: 1.28,
        weaponScale: 1.28,
        dorsalScale: 1.32,
        limbLength: 1.12,
        neckLength: 0.96,
        tailLength: 0,
        snoutLength: 0.56,
        headCount: 1,
        auraShardCount: 26,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.18
      },
      materials: {
        preset: "arcane_crystal",
        ...MATERIAL_PRESETS.arcane_crystal,
        primaryColor: "#e2e8f0",
        secondaryColor: "#38bdf8",
        underbodyColor: "#0c4a6e",
        emissiveColor: "#7dd3fc",
        emissiveIntensity: 3.2,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 87,
        tier: "Raid Boss",
        element: "Escarcha",
        aiBehavior: "Aggressive Berserker",
        hp: 91200,
        attack: 1640,
        defense: 1110,
        speed: 132,
        critChance: 32,
        aggroRadius: 28,
        attackRange: 3.5,
        xpReward: 41e3,
        headHitboxRadius: 0.42,
        torsoHitboxRadius: 0.78,
        torsoHitboxHeight: 1.72,
        lootTags: ["Corona de Hielo Eterno", "Hoja R\xFAnica de Escarcha", "Coraz\xF3n Congelado del Rey"]
      }
    },
    bone_tiara_oracle_siren: {
      id: "enemy-bone-tiara-oracle-siren",
      name: "Or\xE1culo Esqueleto de Tiara Abisal",
      title: "Reina Serpiente \xD3sea de las Criptas Sumergidas",
      raceCategory: "undead",
      bodyPlan: "serpentine_naga",
      archetype: "bone_tiara_oracle_siren",
      helm: "crowned_skull",
      weapon: "arcane_staff",
      offhand: "phylactery_orb",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.16,
        torsoBulk: 0.94,
        shoulderWidth: 1.1,
        hornLength: 0.98,
        hornCurve: 0.46,
        pauldronSize: 1.12,
        weaponScale: 1.2,
        dorsalScale: 1.26,
        limbLength: 1.06,
        neckLength: 1.04,
        tailLength: 1.62,
        snoutLength: 0.56,
        headCount: 1,
        auraShardCount: 22,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.12
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e7e5e4",
        secondaryColor: "#14b8a6",
        underbodyColor: "#134e4a",
        emissiveColor: "#2dd4bf",
        emissiveIntensity: 3,
        texturePattern: "scales"
      },
      stats: {
        level: 77,
        tier: "Mini-Boss",
        element: "Escarcha",
        aiBehavior: "Arcane Artillery",
        hp: 65800,
        attack: 1450,
        defense: 870,
        speed: 144,
        critChance: 30,
        aggroRadius: 26,
        attackRange: 8,
        xpReward: 29400,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.68,
        torsoHitboxHeight: 1.56,
        lootTags: ["Tiara de Coral y Calavera", "V\xE9rtebra de Reina Naga", "Perla de Profec\xEDa Oscura"]
      }
    },
    ashen_crown_executioner_skeleton: {
      id: "enemy-ashen-crown-executioner-skeleton",
      name: "Coloso Esqueleto de Corona de Ceniza",
      title: "Tit\xE1n Decapitador del Pat\xEDbulo Real",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "ashen_crown_executioner_skeleton",
      helm: "crowned_skull",
      weapon: "obsidian_warhammer",
      offhand: "dual_blade",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.28,
        torsoBulk: 1.16,
        shoulderWidth: 1.26,
        hornLength: 0.88,
        hornCurve: 0.38,
        pauldronSize: 1.34,
        weaponScale: 1.34,
        dorsalScale: 1.22,
        limbLength: 1.12,
        neckLength: 0.92,
        tailLength: 0,
        snoutLength: 0.58,
        headCount: 1,
        auraShardCount: 18,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.26
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#d6d3d1",
        secondaryColor: "#ea580c",
        underbodyColor: "#27272a",
        emissiveColor: "#f97316",
        emissiveIntensity: 2.8,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 82,
        tier: "Mini-Boss",
        element: "Fuego Drac\xF3nico",
        aiBehavior: "Aggressive Berserker",
        hp: 78500,
        attack: 1590,
        defense: 1040,
        speed: 120,
        critChance: 28,
        aggroRadius: 26,
        attackRange: 3.4,
        xpReward: 34800,
        headHitboxRadius: 0.42,
        torsoHitboxRadius: 0.8,
        torsoHitboxHeight: 1.74,
        lootTags: ["Corona de Hierro Candente", "Mazo del Verdugo Real", "Cadenas de Tortura \xD3seas"]
      }
    },
    gilded_skull_praetorian: {
      id: "enemy-gilded-skull-praetorian",
      name: "Pretoriano de Calavera Dorada",
      title: "Centuri\xF3n Inmortal de la Guardia \xC1urea",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "gilded_skull_praetorian",
      helm: "crowned_skull",
      weapon: "radiant_halberd",
      offhand: "tower_shield",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.12,
        torsoBulk: 1,
        shoulderWidth: 1.14,
        hornLength: 0.82,
        hornCurve: 0.34,
        pauldronSize: 1.2,
        weaponScale: 1.2,
        dorsalScale: 1.18,
        limbLength: 1.08,
        neckLength: 0.94,
        tailLength: 0,
        snoutLength: 0.55,
        headCount: 1,
        auraShardCount: 16,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.18
      },
      materials: {
        preset: "anisotropic_gold",
        ...MATERIAL_PRESETS.anisotropic_gold,
        primaryColor: "#e7e5e4",
        secondaryColor: "#eab308",
        underbodyColor: "#451a03",
        emissiveColor: "#facc15",
        emissiveIntensity: 2.7,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 75,
        tier: "Elite",
        element: "Fuego Solar",
        aiBehavior: "Shield Wall Tank",
        hp: 62400,
        attack: 1350,
        defense: 1050,
        speed: 126,
        critChance: 26,
        aggroRadius: 24,
        attackRange: 3.3,
        xpReward: 25900,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.72,
        torsoHitboxHeight: 1.58,
        lootTags: ["Laurel \xC1ureo de Calavera", "Escudo de Torre Pretoriano", "Peto de Hueso Laminado"]
      }
    },
    star_crown_astral_lich: {
      id: "enemy-star-crown-astral-lich",
      name: "Ex\xE1nime Esqueleto de Corona Estelar",
      title: "Soberano C\xF3smico del Vac\xEDo Necr\xF3tico",
      raceCategory: "undead",
      bodyPlan: "floating_magical",
      archetype: "star_crown_astral_lich",
      helm: "crowned_skull",
      weapon: "arcane_staff",
      offhand: "phylactery_orb",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.22,
        torsoBulk: 0.92,
        shoulderWidth: 1.14,
        hornLength: 1.14,
        hornCurve: 0.45,
        pauldronSize: 1.22,
        weaponScale: 1.26,
        dorsalScale: 1.4,
        limbLength: 1.1,
        neckLength: 0.98,
        tailLength: 0,
        snoutLength: 0.54,
        headCount: 1,
        auraShardCount: 30,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.08
      },
      materials: {
        preset: "arcane_crystal",
        ...MATERIAL_PRESETS.arcane_crystal,
        primaryColor: "#e7e5e4",
        secondaryColor: "#6366f1",
        underbodyColor: "#1e1b4b",
        emissiveColor: "#818cf8",
        emissiveIntensity: 3.4,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 89,
        tier: "Raid Boss",
        element: "Abisal",
        aiBehavior: "Arcane Artillery",
        hp: 88500,
        attack: 1710,
        defense: 990,
        speed: 142,
        critChance: 35,
        aggroRadius: 30,
        attackRange: 9,
        xpReward: 43500,
        headHitboxRadius: 0.4,
        torsoHitboxRadius: 0.74,
        torsoHitboxHeight: 1.68,
        lootTags: ["Corona Astral de Siete Puntas", "Filacteria de Estrella Muerta", "B\xE1culo del Eclipse"]
      }
    },
    iron_crown_cataphract_skeleton: {
      id: "enemy-iron-crown-cataphract-skeleton",
      name: "Catafracto Esqueleto de Corona de Hierro",
      title: "Centauro Real de Hueso Forjado",
      raceCategory: "undead",
      bodyPlan: "quadruped_beast",
      archetype: "iron_crown_cataphract_skeleton",
      helm: "crowned_skull",
      weapon: "radiant_halberd",
      offhand: "tower_shield",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.18,
        torsoBulk: 1.06,
        shoulderWidth: 1.18,
        hornLength: 0.92,
        hornCurve: 0.38,
        pauldronSize: 1.24,
        weaponScale: 1.26,
        dorsalScale: 1.18,
        limbLength: 1.12,
        neckLength: 0.96,
        tailLength: 1.15,
        snoutLength: 0.56,
        headCount: 1,
        auraShardCount: 18,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.22
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#d6d3d1",
        secondaryColor: "#475569",
        underbodyColor: "#1e293b",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.7,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 81,
        tier: "Mini-Boss",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Aggressive Berserker",
        hp: 74200,
        attack: 1530,
        defense: 1020,
        speed: 158,
        critChance: 29,
        aggroRadius: 27,
        attackRange: 3.4,
        xpReward: 33800,
        headHitboxRadius: 0.4,
        torsoHitboxRadius: 0.78,
        torsoHitboxHeight: 1.64,
        lootTags: ["Corona Ecuestre de Hierro", "Lanza de Catafracto Real", "Barda \xD3sea de Corcel"]
      }
    },
    abyssal_crown_ossuary_titan: {
      id: "enemy-abyssal-crown-ossuary-titan",
      name: "Tit\xE1n del Osario de Corona Abisal",
      title: "Emperador Gigante de Mil Calaveras",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "abyssal_crown_ossuary_titan",
      helm: "crowned_skull",
      weapon: "runic_greatsword",
      offhand: "phylactery_orb",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 1.38,
        torsoBulk: 1.22,
        shoulderWidth: 1.32,
        hornLength: 1.22,
        hornCurve: 0.48,
        pauldronSize: 1.4,
        weaponScale: 1.38,
        dorsalScale: 1.46,
        limbLength: 1.16,
        neckLength: 0.98,
        tailLength: 0.92,
        snoutLength: 0.6,
        headCount: 1,
        auraShardCount: 32,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.28
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e7e5e4",
        secondaryColor: "#ca8a04",
        underbodyColor: "#18181b",
        emissiveColor: "#10b981",
        emissiveIntensity: 3.4,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 95,
        tier: "Raid Boss",
        element: "Abisal",
        aiBehavior: "Aggressive Berserker",
        hp: 112e3,
        attack: 1840,
        defense: 1260,
        speed: 128,
        critChance: 34,
        aggroRadius: 32,
        attackRange: 3.9,
        xpReward: 52e3,
        headHitboxRadius: 0.46,
        torsoHitboxRadius: 0.88,
        torsoHitboxHeight: 1.92,
        lootTags: ["Gran Corona Abisal del Tit\xE1n", "Espada Colosal del Osario", "N\xFAcleo de Mil Almas"]
      }
    },
    // 10A. MAMÍFEROS Y BESTIAS PELUDAS DE ÉLITE NV. 1-20 (14)
    elite_quillback_porcupine: {
      id: "enemy-elite-quillback-porcupine",
      name: "Puercoesp\xEDn Aguja de Hierro",
      title: "\xC9lite Erizado de P\xFAas Bicolores",
      raceCategory: "elite_low_level",
      bodyPlan: "quadruped_beast",
      archetype: "elite_quillback_porcupine",
      helm: "lupine_maw",
      weapon: "ram_charge",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 0.78,
        torsoBulk: 1.16,
        shoulderWidth: 1.08,
        hornLength: 0.45,
        hornCurve: 0.35,
        pauldronSize: 0.92,
        weaponScale: 0.9,
        dorsalScale: 1.55,
        limbLength: 0.82,
        neckLength: 0.48,
        tailLength: 0.68,
        snoutLength: 0.62,
        headCount: 1,
        auraShardCount: 4,
        furDensity: 1.48,
        hairStyle: "dorsal_mohawk",
        hairLength: 1.35,
        muscleDefinition: 1.15
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#3f342b",
        secondaryColor: "#e7dfd3",
        underbodyColor: "#1f1915",
        emissiveColor: "#f59e0b",
        emissiveIntensity: 1.9,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 1,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Shield Wall Tank",
        hp: 1450,
        attack: 95,
        defense: 165,
        speed: 108,
        critChance: 16,
        aggroRadius: 14,
        attackRange: 1.9,
        xpReward: 420,
        headHitboxRadius: 0.28,
        torsoHitboxRadius: 0.62,
        torsoHitboxHeight: 0.98,
        lootTags: ["P\xFAa Templada de Aguja de Hierro", "Pelaje Erizado de \xC9lite", "Incisivo de Roedor Alfa"]
      }
    },
    elite_steppe_dire_jackal: {
      id: "enemy-elite-steppe-dire-jackal",
      name: "Chacal Aullador Orejas de Radar",
      title: "Acechador \xC9lite de las Dunas Rojas",
      raceCategory: "elite_low_level",
      bodyPlan: "quadruped_beast",
      archetype: "elite_steppe_dire_jackal",
      helm: "lupine_maw",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "none",
      morphology: {
        heightScale: 0.92,
        torsoBulk: 0.88,
        shoulderWidth: 0.95,
        hornLength: 0.75,
        hornCurve: 0.28,
        pauldronSize: 0.76,
        weaponScale: 0.92,
        dorsalScale: 0.9,
        limbLength: 1.16,
        neckLength: 0.86,
        tailLength: 1.15,
        snoutLength: 1.18,
        headCount: 1,
        auraShardCount: 4,
        furDensity: 1.32,
        hairStyle: "dorsal_mohawk",
        hairLength: 1.18,
        muscleDefinition: 1.24
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#9a6b3b",
        secondaryColor: "#27201c",
        underbodyColor: "#d6bc98",
        emissiveColor: "#fbbf24",
        emissiveIntensity: 2.1,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 2,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Pack Alpha Predator",
        hp: 1680,
        attack: 128,
        defense: 112,
        speed: 164,
        critChance: 24,
        aggroRadius: 18,
        attackRange: 2.1,
        xpReward: 510,
        headHitboxRadius: 0.3,
        torsoHitboxRadius: 0.56,
        torsoHitboxHeight: 1.08,
        lootTags: ["Colmillo de Chacal Dorado", "Piel de Estepa \xC1rida", "Oreja de Cazador Nocturno"]
      }
    },
    elite_silverback_ape: {
      id: "enemy-elite-silverback-ape",
      name: "Gorila Espalda Plateada Colosal",
      title: "Patriarca Romperrocas de la Jungla",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_silverback_ape",
      helm: "lupine_maw",
      weapon: "feral_claws_fangs",
      offhand: "none",
      dorsal: "none",
      morphology: {
        heightScale: 1.16,
        torsoBulk: 1.44,
        shoulderWidth: 1.48,
        hornLength: 0,
        hornCurve: 0.2,
        pauldronSize: 1.22,
        weaponScale: 1.1,
        dorsalScale: 0.9,
        limbLength: 1.24,
        neckLength: 0.42,
        tailLength: 0,
        snoutLength: 0.68,
        headCount: 1,
        auraShardCount: 6,
        furDensity: 1.52,
        hairStyle: "full_fur_coat",
        hairLength: 1.28,
        muscleDefinition: 1.55
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#1e2229",
        secondaryColor: "#cbd5e1",
        underbodyColor: "#0f1318",
        emissiveColor: "#f59e0b",
        emissiveIntensity: 2,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 4,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Aggressive Berserker",
        hp: 2650,
        attack: 175,
        defense: 185,
        speed: 122,
        critChance: 19,
        aggroRadius: 17,
        attackRange: 2.4,
        xpReward: 780,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.82,
        torsoHitboxHeight: 1.48,
        lootTags: ["Manto Plateado de Patriarca", "Colmillo de Primate Alfa", "Pu\xF1o de Granito"]
      }
    },
    elite_armored_pangolin_roller: {
      id: "enemy-elite-armored-pangolin-roller",
      name: "Pangol\xEDn Acorazado Rompemuros",
      title: "Excavador \xC9lite de Placas y Cerdas",
      raceCategory: "elite_low_level",
      bodyPlan: "quadruped_beast",
      archetype: "elite_armored_pangolin_roller",
      helm: "draconic_snout",
      weapon: "ram_charge",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 0.86,
        torsoBulk: 1.24,
        shoulderWidth: 1.15,
        hornLength: 0.35,
        hornCurve: 0.4,
        pauldronSize: 1.18,
        weaponScale: 1,
        dorsalScale: 1.28,
        limbLength: 0.86,
        neckLength: 0.55,
        tailLength: 1.48,
        snoutLength: 1.12,
        headCount: 1,
        auraShardCount: 5,
        furDensity: 1.18,
        hairStyle: "full_fur_coat",
        hairLength: 0.95,
        muscleDefinition: 1.22
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#6b4f3a",
        secondaryColor: "#b89772",
        underbodyColor: "#3b2b20",
        emissiveColor: "#fbbf24",
        emissiveIntensity: 1.85,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 5,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Shield Wall Tank",
        hp: 3120,
        attack: 168,
        defense: 245,
        speed: 114,
        critChance: 15,
        aggroRadius: 15,
        attackRange: 2.1,
        xpReward: 920,
        headHitboxRadius: 0.3,
        torsoHitboxRadius: 0.72,
        torsoHitboxHeight: 1.12,
        lootTags: ["Escama Queratinosa Imbricada", "Garra Excavadora de Pangol\xEDn", "Coraza Enroscada"]
      }
    },
    elite_bloodmane_mandrill: {
      id: "enemy-elite-bloodmane-mandrill",
      name: "Mandril Melena de Sangre",
      title: "Acechador Feral de Faz Pintada",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_bloodmane_mandrill",
      helm: "lupine_maw",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "none",
      morphology: {
        heightScale: 1.04,
        torsoBulk: 1.18,
        shoulderWidth: 1.26,
        hornLength: 0.25,
        hornCurve: 0.3,
        pauldronSize: 1,
        weaponScale: 1,
        dorsalScale: 0.95,
        limbLength: 1.18,
        neckLength: 0.56,
        tailLength: 0.45,
        snoutLength: 1.14,
        headCount: 1,
        auraShardCount: 6,
        furDensity: 1.56,
        hairStyle: "wild_mane_fur",
        hairLength: 1.38,
        muscleDefinition: 1.38
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#3b332b",
        secondaryColor: "#dc2626",
        underbodyColor: "#1d4ed8",
        emissiveColor: "#f59e0b",
        emissiveIntensity: 2.2,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 6,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Aggressive Berserker",
        hp: 3480,
        attack: 215,
        defense: 162,
        speed: 148,
        critChance: 25,
        aggroRadius: 18,
        attackRange: 2.2,
        xpReward: 1120,
        headHitboxRadius: 0.34,
        torsoHitboxRadius: 0.68,
        torsoHitboxHeight: 1.34,
        lootTags: ["Colmillo Largo de Mandril", "Melena Carmes\xED de la Selva", "T\xF3tem Tribal Salvaje"]
      }
    },
    elite_saber_prowler_leopard: {
      id: "enemy-elite-saber-prowler-leopard",
      name: "Leopardo Dientes de Sable Boreal",
      title: "Depredador \xC9lite de las Cumbres",
      raceCategory: "elite_low_level",
      bodyPlan: "quadruped_beast",
      archetype: "elite_saber_prowler_leopard",
      helm: "lupine_maw",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "none",
      morphology: {
        heightScale: 1.02,
        torsoBulk: 1.08,
        shoulderWidth: 1.14,
        hornLength: 0.92,
        hornCurve: 0.55,
        pauldronSize: 0.92,
        weaponScale: 1.05,
        dorsalScale: 0.9,
        limbLength: 1.12,
        neckLength: 0.78,
        tailLength: 1.32,
        snoutLength: 0.88,
        headCount: 1,
        auraShardCount: 6,
        furDensity: 1.44,
        hairStyle: "full_fur_coat",
        hairLength: 1.16,
        muscleDefinition: 1.42
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#cbd5e1",
        secondaryColor: "#334155",
        underbodyColor: "#f8fafc",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.25,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 7,
        tier: "Elite",
        element: "Escarcha",
        aiBehavior: "Ambush Stalker",
        hp: 3920,
        attack: 254,
        defense: 174,
        speed: 172,
        critChance: 31,
        aggroRadius: 20,
        attackRange: 2.3,
        xpReward: 1340,
        headHitboxRadius: 0.33,
        torsoHitboxRadius: 0.64,
        torsoHitboxHeight: 1.2,
        lootTags: ["Sable de Marfil Congelado", "Piel Moteada de las Nieves", "Garra Retr\xE1ctil de \xC9lite"]
      }
    },
    elite_marsupial_claw_ripper: {
      id: "enemy-elite-marsupial-claw-ripper",
      name: "Canguro Destripador Garras de Acero",
      title: "Saltador Alfa del Ca\xF1\xF3n \xC1rido",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_marsupial_claw_ripper",
      helm: "lupine_maw",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "none",
      morphology: {
        heightScale: 1.12,
        torsoBulk: 1.06,
        shoulderWidth: 1.04,
        hornLength: 0.65,
        hornCurve: 0.25,
        pauldronSize: 0.88,
        weaponScale: 1,
        dorsalScale: 0.9,
        limbLength: 1.34,
        neckLength: 0.84,
        tailLength: 1.56,
        snoutLength: 0.96,
        headCount: 1,
        auraShardCount: 6,
        furDensity: 1.36,
        hairStyle: "full_fur_coat",
        hairLength: 1.12,
        muscleDefinition: 1.48
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#8c4a27",
        secondaryColor: "#d9a066",
        underbodyColor: "#e6ccb2",
        emissiveColor: "#f97316",
        emissiveIntensity: 2,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 8,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Aggressive Berserker",
        hp: 4380,
        attack: 278,
        defense: 190,
        speed: 168,
        critChance: 27,
        aggroRadius: 19,
        attackRange: 2.5,
        xpReward: 1580,
        headHitboxRadius: 0.32,
        torsoHitboxRadius: 0.66,
        torsoHitboxHeight: 1.46,
        lootTags: ["Tend\xF3n de Salto Colosal", "Garra Marsupial Afilada", "Cuero Rojo del Ca\xF1\xF3n"]
      }
    },
    elite_great_antler_moose: {
      id: "enemy-elite-great-antler-moose",
      name: "Alce Real de Astas Palmeadas",
      title: "Coloso Astado del Bosque Boreal",
      raceCategory: "elite_low_level",
      bodyPlan: "quadruped_beast",
      archetype: "elite_great_antler_moose",
      helm: "tauren_bull_horns",
      weapon: "ram_charge",
      offhand: "none",
      dorsal: "none",
      morphology: {
        heightScale: 1.24,
        torsoBulk: 1.22,
        shoulderWidth: 1.2,
        hornLength: 1.58,
        hornCurve: 0.88,
        pauldronSize: 1.05,
        weaponScale: 1.1,
        dorsalScale: 1.15,
        limbLength: 1.28,
        neckLength: 1.02,
        tailLength: 0.38,
        snoutLength: 1.22,
        headCount: 1,
        auraShardCount: 8,
        furDensity: 1.46,
        hairStyle: "wild_mane_fur",
        hairLength: 1.25,
        muscleDefinition: 1.36
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#3b281e",
        secondaryColor: "#d6c7b2",
        underbodyColor: "#1f1510",
        emissiveColor: "#fbbf24",
        emissiveIntensity: 2.1,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 9,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Shield Wall Tank",
        hp: 5150,
        attack: 292,
        defense: 238,
        speed: 136,
        critChance: 20,
        aggroRadius: 19,
        attackRange: 2.6,
        xpReward: 1850,
        headHitboxRadius: 0.4,
        torsoHitboxRadius: 0.76,
        torsoHitboxHeight: 1.42,
        lootTags: ["Corona de Astas Palmeadas", "Piel Gruesa de Alce Real", "Pezu\xF1a Hendida de Hierro"]
      }
    },
    elite_glacier_wolverine_fiend: {
      id: "enemy-elite-glacier-wolverine-fiend",
      name: "Glot\xF3n Feral Rompehuesos",
      title: "Furia Implacable de la Tundra",
      raceCategory: "elite_low_level",
      bodyPlan: "quadruped_beast",
      archetype: "elite_glacier_wolverine_fiend",
      helm: "lupine_maw",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "none",
      morphology: {
        heightScale: 0.88,
        torsoBulk: 1.28,
        shoulderWidth: 1.24,
        hornLength: 0.4,
        hornCurve: 0.3,
        pauldronSize: 1.08,
        weaponScale: 1.1,
        dorsalScale: 1,
        limbLength: 0.9,
        neckLength: 0.66,
        tailLength: 0.85,
        snoutLength: 0.86,
        headCount: 1,
        auraShardCount: 8,
        furDensity: 1.58,
        hairStyle: "full_fur_coat",
        hairLength: 1.32,
        muscleDefinition: 1.52
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#261c16",
        secondaryColor: "#c29b61",
        underbodyColor: "#120d0a",
        emissiveColor: "#ef4444",
        emissiveIntensity: 2.35,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 11,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Aggressive Berserker",
        hp: 6180,
        attack: 348,
        defense: 265,
        speed: 152,
        critChance: 29,
        aggroRadius: 20,
        attackRange: 2.2,
        xpReward: 2380,
        headHitboxRadius: 0.34,
        torsoHitboxRadius: 0.7,
        torsoHitboxHeight: 1.14,
        lootTags: ["Garras de Marfil de Glot\xF3n", "Pelaje Impermeable Boreal", "Mand\xEDbula Trituradora"]
      }
    },
    elite_thunderhoof_bison: {
      id: "enemy-elite-thunderhoof-bison",
      name: "Bisonte Pezu\xF1a de Trueno",
      title: "Ariete Lanudo de la Gran Llanura",
      raceCategory: "elite_low_level",
      bodyPlan: "quadruped_beast",
      archetype: "elite_thunderhoof_bison",
      helm: "tauren_bull_horns",
      weapon: "ram_charge",
      offhand: "none",
      dorsal: "none",
      morphology: {
        heightScale: 1.18,
        torsoBulk: 1.46,
        shoulderWidth: 1.42,
        hornLength: 1.08,
        hornCurve: 0.78,
        pauldronSize: 1.28,
        weaponScale: 1.15,
        dorsalScale: 1.25,
        limbLength: 1.02,
        neckLength: 0.68,
        tailLength: 0.74,
        snoutLength: 0.94,
        headCount: 1,
        auraShardCount: 9,
        furDensity: 1.64,
        hairStyle: "wild_mane_fur",
        hairLength: 1.42,
        muscleDefinition: 1.54
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#2d1e17",
        secondaryColor: "#5c4033",
        underbodyColor: "#17100c",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.3,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 12,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Shield Wall Tank",
        hp: 7450,
        attack: 365,
        defense: 325,
        speed: 134,
        critChance: 21,
        aggroRadius: 20,
        attackRange: 2.5,
        xpReward: 2740,
        headHitboxRadius: 0.42,
        torsoHitboxRadius: 0.84,
        torsoHitboxHeight: 1.46,
        lootTags: ["Cuerno Curvo de Bisonte Alfa", "Manto Lanudo de la Tormenta", "Pezu\xF1a S\xEDsmica"]
      }
    },
    elite_three_tailed_kitsune_fox: {
      id: "enemy-elite-three-tailed-kitsune-fox",
      name: "Zorro Kitsune de Tres Colas",
      title: "Esp\xEDritu Peludo de Fuego Fatuo",
      raceCategory: "elite_low_level",
      bodyPlan: "quadruped_beast",
      archetype: "elite_three_tailed_kitsune_fox",
      helm: "lupine_maw",
      weapon: "dragon_breath_maw",
      offhand: "none",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 0.98,
        torsoBulk: 0.92,
        shoulderWidth: 0.98,
        hornLength: 0.68,
        hornCurve: 0.32,
        pauldronSize: 0.84,
        weaponScale: 1,
        dorsalScale: 1.24,
        limbLength: 1.14,
        neckLength: 0.88,
        tailLength: 1.68,
        snoutLength: 1.16,
        headCount: 1,
        auraShardCount: 12,
        furDensity: 1.54,
        hairStyle: "full_fur_coat",
        hairLength: 1.36,
        muscleDefinition: 1.18
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#ea580c",
        secondaryColor: "#fef3c7",
        underbodyColor: "#fffbeb",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.65,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 14,
        tier: "Elite",
        element: "Fuego Solar",
        aiBehavior: "Arcane Artillery",
        hp: 7620,
        attack: 425,
        defense: 268,
        speed: 174,
        critChance: 32,
        aggroRadius: 22,
        attackRange: 6.2,
        xpReward: 3280,
        headHitboxRadius: 0.32,
        torsoHitboxRadius: 0.6,
        torsoHitboxHeight: 1.18,
        lootTags: ["Cola \xCDgnea de Kitsune", "Perla de Fuego Fatuo", "Pelaje Carmes\xED Encantado"]
      }
    },
    elite_ironhorn_rhino_beast: {
      id: "enemy-elite-ironhorn-rhino-beast",
      name: "Rinoceronte Cuerno de Hierro",
      title: "Juggernaut Acorazado de la Sabana",
      raceCategory: "elite_low_level",
      bodyPlan: "quadruped_beast",
      archetype: "elite_ironhorn_rhino_beast",
      helm: "tauren_bull_horns",
      weapon: "ram_charge",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.22,
        torsoBulk: 1.5,
        shoulderWidth: 1.44,
        hornLength: 1.48,
        hornCurve: 0.66,
        pauldronSize: 1.32,
        weaponScale: 1.2,
        dorsalScale: 1.18,
        limbLength: 0.96,
        neckLength: 0.62,
        tailLength: 0.58,
        snoutLength: 1.28,
        headCount: 1,
        auraShardCount: 10,
        furDensity: 1.22,
        hairStyle: "full_fur_coat",
        hairLength: 1.05,
        muscleDefinition: 1.56
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#475569",
        secondaryColor: "#cbd5e1",
        underbodyColor: "#1e293b",
        emissiveColor: "#f59e0b",
        emissiveIntensity: 2.2,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 15,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Shield Wall Tank",
        hp: 9480,
        attack: 448,
        defense: 410,
        speed: 126,
        critChance: 22,
        aggroRadius: 21,
        attackRange: 2.7,
        xpReward: 3750,
        headHitboxRadius: 0.44,
        torsoHitboxRadius: 0.88,
        torsoHitboxHeight: 1.5,
        lootTags: ["Gran Cuerno Nasal de Hierro", "Coraza D\xE9rmica Impenetrable", "Pezu\xF1a de Asedio"]
      }
    },
    elite_woolly_mammoth_calf: {
      id: "enemy-elite-woolly-mammoth-calf",
      name: "Mamut Lanudo de Colmillos Curvos",
      title: "Tit\xE1n Peludo de la Estepa Helada",
      raceCategory: "elite_low_level",
      bodyPlan: "quadruped_beast",
      archetype: "elite_woolly_mammoth_calf",
      helm: "tauren_bull_horns",
      weapon: "ram_charge",
      offhand: "none",
      dorsal: "none",
      morphology: {
        heightScale: 1.34,
        torsoBulk: 1.54,
        shoulderWidth: 1.46,
        hornLength: 1.68,
        hornCurve: 0.94,
        pauldronSize: 1.35,
        weaponScale: 1.28,
        dorsalScale: 1.22,
        limbLength: 1.14,
        neckLength: 0.58,
        tailLength: 0.56,
        snoutLength: 1.48,
        headCount: 1,
        auraShardCount: 12,
        furDensity: 1.72,
        hairStyle: "long_flowing_hair",
        hairLength: 1.65,
        muscleDefinition: 1.5
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#5c3a21",
        secondaryColor: "#f3e5ab",
        underbodyColor: "#2b1b10",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.4,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 18,
        tier: "Elite",
        element: "Escarcha",
        aiBehavior: "Shield Wall Tank",
        hp: 12400,
        attack: 525,
        defense: 465,
        speed: 118,
        critChance: 22,
        aggroRadius: 22,
        attackRange: 3.1,
        xpReward: 4850,
        headHitboxRadius: 0.48,
        torsoHitboxRadius: 0.94,
        torsoHitboxHeight: 1.68,
        lootTags: ["Colmillo Espiral de Mamut", "Vell\xF3n Lanudo Prehist\xF3rico", "Trompa de Escarcha"]
      }
    },
    elite_shadow_maned_lion: {
      id: "enemy-elite-shadow-maned-lion",
      name: "Le\xF3n Alfa de Melena Sombr\xEDa",
      title: "Soberano Depredador del Crep\xFAsculo",
      raceCategory: "elite_low_level",
      bodyPlan: "quadruped_beast",
      archetype: "elite_shadow_maned_lion",
      helm: "lupine_maw",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "none",
      morphology: {
        heightScale: 1.18,
        torsoBulk: 1.26,
        shoulderWidth: 1.32,
        hornLength: 0.52,
        hornCurve: 0.35,
        pauldronSize: 1.18,
        weaponScale: 1.18,
        dorsalScale: 1.14,
        limbLength: 1.16,
        neckLength: 0.84,
        tailLength: 1.38,
        snoutLength: 0.98,
        headCount: 1,
        auraShardCount: 14,
        furDensity: 1.68,
        hairStyle: "wild_mane_fur",
        hairLength: 1.54,
        muscleDefinition: 1.52
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#b45309",
        secondaryColor: "#18181b",
        underbodyColor: "#78350f",
        emissiveColor: "#f59e0b",
        emissiveIntensity: 2.6,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 19,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Pack Alpha Predator",
        hp: 11850,
        attack: 575,
        defense: 368,
        speed: 166,
        critChance: 34,
        aggroRadius: 24,
        attackRange: 2.7,
        xpReward: 5180,
        headHitboxRadius: 0.4,
        torsoHitboxRadius: 0.78,
        torsoHitboxHeight: 1.44,
        lootTags: ["Melena Real del Crep\xFAsculo", "Colmillo de Le\xF3n Soberano", "Garra Dorada Alfa"]
      }
    },
    // 10B. REPTILES, ANFIBIOS Y DRACOS ESCAMOSOS DE ÉLITE NV. 1-20 (14)
    elite_spitting_salamander_drake: {
      id: "enemy-elite-spitting-salamander-drake",
      name: "Salamandra \xCDgnea de Branquias",
      title: "Anfibio Escamoso de Cresta Ardiente",
      raceCategory: "elite_low_level",
      bodyPlan: "quadruped_beast",
      archetype: "elite_spitting_salamander_drake",
      helm: "draconic_snout",
      weapon: "dragon_breath_maw",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 0.84,
        torsoBulk: 0.96,
        shoulderWidth: 1.02,
        hornLength: 0.82,
        hornCurve: 0.52,
        pauldronSize: 0.82,
        weaponScale: 0.95,
        dorsalScale: 1.38,
        limbLength: 0.84,
        neckLength: 0.74,
        tailLength: 1.52,
        snoutLength: 0.92,
        headCount: 1,
        auraShardCount: 5,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.2
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#c2410c",
        secondaryColor: "#facc15",
        underbodyColor: "#431407",
        emissiveColor: "#ff5722",
        emissiveIntensity: 2.45,
        texturePattern: "scales",
        textureRelief: 1.12
      },
      stats: {
        level: 1,
        tier: "Elite",
        element: "Fuego Drac\xF3nico",
        aiBehavior: "Arcane Artillery",
        hp: 1380,
        attack: 112,
        defense: 118,
        speed: 134,
        critChance: 20,
        aggroRadius: 16,
        attackRange: 4.8,
        xpReward: 440,
        headHitboxRadius: 0.3,
        torsoHitboxRadius: 0.58,
        torsoHitboxHeight: 0.96,
        lootTags: ["Gl\xE1ndula Pirof\xF3rica de Salamandra", "Escama Anfibia Moteada", "Branquia de Brasa"]
      }
    },
    elite_casqued_chameleon_stalker: {
      id: "enemy-elite-casqued-chameleon-stalker",
      name: "Camale\xF3n Cornudo de Cresta Real",
      title: "Acechador Escamoso de Cola en Espiral",
      raceCategory: "elite_low_level",
      bodyPlan: "quadruped_beast",
      archetype: "elite_casqued_chameleon_stalker",
      helm: "draconic_snout",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 0.92,
        torsoBulk: 1.04,
        shoulderWidth: 0.94,
        hornLength: 1.18,
        hornCurve: 0.42,
        pauldronSize: 0.88,
        weaponScale: 1,
        dorsalScale: 1.32,
        limbLength: 0.98,
        neckLength: 0.56,
        tailLength: 1.44,
        snoutLength: 0.96,
        headCount: 1,
        auraShardCount: 6,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.16
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#15803d",
        secondaryColor: "#eab308",
        underbodyColor: "#064e3b",
        emissiveColor: "#22c55e",
        emissiveIntensity: 2.2,
        texturePattern: "scales",
        textureRelief: 1.18
      },
      stats: {
        level: 3,
        tier: "Elite",
        element: "Veneno",
        aiBehavior: "Ambush Stalker",
        hp: 2050,
        attack: 148,
        defense: 144,
        speed: 128,
        critChance: 28,
        aggroRadius: 18,
        attackRange: 3.6,
        xpReward: 640,
        headHitboxRadius: 0.34,
        torsoHitboxRadius: 0.62,
        torsoHitboxHeight: 1.1,
        lootTags: ["Casco Escamoso de Camale\xF3n", "Cuerno Rostral Triple", "Lengua Prensil Venenosa"]
      }
    },
    elite_frilled_venom_basilisk: {
      id: "enemy-elite-frilled-venom-basilisk",
      name: "Clamidosaurio de Gorguera Real",
      title: "Basilisco Escamoso de Abanico Venenoso",
      raceCategory: "elite_low_level",
      bodyPlan: "quadruped_beast",
      archetype: "elite_frilled_venom_basilisk",
      helm: "draconic_snout",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 0.96,
        torsoBulk: 0.98,
        shoulderWidth: 1.06,
        hornLength: 0.88,
        hornCurve: 0.48,
        pauldronSize: 0.92,
        weaponScale: 1,
        dorsalScale: 1.42,
        limbLength: 1.06,
        neckLength: 0.94,
        tailLength: 1.58,
        snoutLength: 1.04,
        headCount: 1,
        auraShardCount: 6,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.24
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#0f766e",
        secondaryColor: "#f97316",
        underbodyColor: "#134e4a",
        emissiveColor: "#a3e635",
        emissiveIntensity: 2.35,
        texturePattern: "scales",
        textureRelief: 1.16
      },
      stats: {
        level: 4,
        tier: "Elite",
        element: "Veneno",
        aiBehavior: "Ambush Stalker",
        hp: 2480,
        attack: 168,
        defense: 152,
        speed: 154,
        critChance: 26,
        aggroRadius: 18,
        attackRange: 2.8,
        xpReward: 790,
        headHitboxRadius: 0.34,
        torsoHitboxRadius: 0.62,
        torsoHitboxHeight: 1.12,
        lootTags: ["Membrana de Gorguera Escamosa", "Colmillo de Basilisco", "Escama Esmeralda"]
      }
    },
    elite_thorny_devil_moloch: {
      id: "enemy-elite-thorny-devil-moloch",
      name: "Moloch Espinosa del Desierto",
      title: "Demonio Escamoso de Mil Agujas",
      raceCategory: "elite_low_level",
      bodyPlan: "quadruped_beast",
      archetype: "elite_thorny_devil_moloch",
      helm: "draconic_snout",
      weapon: "ram_charge",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 0.9,
        torsoBulk: 1.18,
        shoulderWidth: 1.16,
        hornLength: 1.12,
        hornCurve: 0.56,
        pauldronSize: 1.14,
        weaponScale: 1,
        dorsalScale: 1.62,
        limbLength: 0.92,
        neckLength: 0.64,
        tailLength: 1.28,
        snoutLength: 0.88,
        headCount: 1,
        auraShardCount: 6,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.28
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#b45309",
        secondaryColor: "#fde047",
        underbodyColor: "#451a03",
        emissiveColor: "#f59e0b",
        emissiveIntensity: 2.15,
        texturePattern: "scales",
        textureRelief: 1.25
      },
      stats: {
        level: 5,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Shield Wall Tank",
        hp: 3180,
        attack: 176,
        defense: 235,
        speed: 118,
        critChance: 19,
        aggroRadius: 16,
        attackRange: 2.1,
        xpReward: 940,
        headHitboxRadius: 0.32,
        torsoHitboxRadius: 0.68,
        torsoHitboxHeight: 1.08,
        lootTags: ["Placa Osteod\xE9rmica de Moloch", "Cuerno Dorsal del Desierto", "Escama Ocre Solar"]
      }
    },
    elite_hooded_king_cobra: {
      id: "enemy-elite-hooded-king-cobra",
      name: "Cobra Real de Capucha Escamosa",
      title: "Emperatriz Serpentina de Colmillos Venenosos",
      raceCategory: "elite_low_level",
      bodyPlan: "serpentine_naga",
      archetype: "elite_hooded_king_cobra",
      helm: "draconic_snout",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.1,
        torsoBulk: 0.96,
        shoulderWidth: 1.28,
        hornLength: 0.55,
        hornCurve: 0.4,
        pauldronSize: 1.1,
        weaponScale: 1,
        dorsalScale: 1.25,
        limbLength: 0.95,
        neckLength: 1.18,
        tailLength: 1.72,
        snoutLength: 1.06,
        headCount: 1,
        auraShardCount: 7,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.26
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#1e293b",
        secondaryColor: "#d97706",
        underbodyColor: "#fef08a",
        emissiveColor: "#84cc16",
        emissiveIntensity: 2.4,
        texturePattern: "scales",
        textureRelief: 1.2
      },
      stats: {
        level: 6,
        tier: "Elite",
        element: "Veneno",
        aiBehavior: "Ambush Stalker",
        hp: 3420,
        attack: 228,
        defense: 168,
        speed: 158,
        critChance: 29,
        aggroRadius: 19,
        attackRange: 2.8,
        xpReward: 1150,
        headHitboxRadius: 0.34,
        torsoHitboxRadius: 0.64,
        torsoHitboxHeight: 1.38,
        lootTags: ["Capucha Escamosa de Cobra Real", "Colmillo Inyector de Neurotoxina", "Escama Ventral Dorada"]
      }
    },
    elite_snapping_chelonian_tortoise: {
      id: "enemy-elite-snapping-chelonian-tortoise",
      name: "Tortuga Caim\xE1n de Caparaz\xF3n Dentado",
      title: "Fortaleza Viviente del Pantano Profundo",
      raceCategory: "elite_low_level",
      bodyPlan: "quadruped_beast",
      archetype: "elite_snapping_chelonian_tortoise",
      helm: "draconic_snout",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 0.94,
        torsoBulk: 1.48,
        shoulderWidth: 1.38,
        hornLength: 0.48,
        hornCurve: 0.35,
        pauldronSize: 1.3,
        weaponScale: 1.05,
        dorsalScale: 1.45,
        limbLength: 0.84,
        neckLength: 0.92,
        tailLength: 1.18,
        snoutLength: 1.02,
        headCount: 1,
        auraShardCount: 6,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.32
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#365314",
        secondaryColor: "#a16207",
        underbodyColor: "#713f12",
        emissiveColor: "#f59e0b",
        emissiveIntensity: 1.95,
        texturePattern: "scales",
        textureRelief: 1.24
      },
      stats: {
        level: 9,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Shield Wall Tank",
        hp: 5850,
        attack: 274,
        defense: 345,
        speed: 98,
        critChance: 18,
        aggroRadius: 16,
        attackRange: 2.3,
        xpReward: 1920,
        headHitboxRadius: 0.34,
        torsoHitboxRadius: 0.86,
        torsoHitboxHeight: 1.18,
        lootTags: ["Caparaz\xF3n Abovedado de Tres Quillas", "Pico Cortante de Quelonio", "Escudo Plastr\xF3n"]
      }
    },
    elite_swamp_alligator_snapper: {
      id: "enemy-elite-swamp-alligator-snapper",
      name: "Caim\xE1n Acorazado Rompehierros",
      title: "Leviat\xE1n de Fauces Dentadas del Manglar",
      raceCategory: "elite_low_level",
      bodyPlan: "quadruped_beast",
      archetype: "elite_swamp_alligator_snapper",
      helm: "draconic_snout",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 0.92,
        torsoBulk: 1.32,
        shoulderWidth: 1.28,
        hornLength: 0.42,
        hornCurve: 0.3,
        pauldronSize: 1.12,
        weaponScale: 1.15,
        dorsalScale: 1.48,
        limbLength: 0.82,
        neckLength: 0.78,
        tailLength: 1.76,
        snoutLength: 1.62,
        headCount: 1,
        auraShardCount: 7,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.44
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#1f3a2e",
        secondaryColor: "#65a30d",
        underbodyColor: "#a3a380",
        emissiveColor: "#eab308",
        emissiveIntensity: 2.15,
        texturePattern: "scales",
        textureRelief: 1.28
      },
      stats: {
        level: 10,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Ambush Stalker",
        hp: 6120,
        attack: 332,
        defense: 288,
        speed: 128,
        critChance: 26,
        aggroRadius: 19,
        attackRange: 2.6,
        xpReward: 2180,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.76,
        torsoHitboxHeight: 1.12,
        lootTags: ["Osteodermo Dorsal de Caim\xE1n", "Mand\xEDbula Acorazada de 60 Dientes", "Cuero Escamoso de Manglar"]
      }
    },
    elite_abyssal_angler_lurker: {
      id: "enemy-elite-abyssal-angler-lurker",
      name: "Rape Abisal de Linterna Hipn\xF3tica",
      title: "Devorador Bioluminiscente de la Fosa",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_abyssal_angler_lurker",
      helm: "draconic_snout",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.08,
        torsoBulk: 1.36,
        shoulderWidth: 1.3,
        hornLength: 1.15,
        hornCurve: 0.72,
        pauldronSize: 1.1,
        weaponScale: 1.1,
        dorsalScale: 1.52,
        limbLength: 0.96,
        neckLength: 0.45,
        tailLength: 1.26,
        snoutLength: 1.18,
        headCount: 1,
        auraShardCount: 10,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.3
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#0f172a",
        secondaryColor: "#0284c7",
        underbodyColor: "#1e1b4b",
        emissiveColor: "#22d3ee",
        emissiveIntensity: 3.1,
        texturePattern: "scales",
        textureRelief: 1.16
      },
      stats: {
        level: 11,
        tier: "Elite",
        element: "Abisal",
        aiBehavior: "Ambush Stalker",
        hp: 6340,
        attack: 356,
        defense: 248,
        speed: 136,
        critChance: 28,
        aggroRadius: 21,
        attackRange: 2.5,
        xpReward: 2420,
        headHitboxRadius: 0.42,
        torsoHitboxRadius: 0.78,
        torsoHitboxHeight: 1.36,
        lootTags: ["Bulbo Bioluminiscente de Rape", "Aguja Dental Cristalina", "Aleta Espinosa Abisal"]
      }
    },
    elite_crest_pterosaur_skydrake: {
      id: "enemy-elite-crest-pterosaur-skydrake",
      name: "Pterodr\xE1co de Cresta de Cuchilla",
      title: "Cazador Alado de las Agujas Rocosas",
      raceCategory: "elite_low_level",
      bodyPlan: "dragon_wyvern",
      archetype: "elite_crest_pterosaur_skydrake",
      helm: "avian_phoenix_beak",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 1.08,
        torsoBulk: 0.94,
        shoulderWidth: 1.18,
        hornLength: 1.48,
        hornCurve: 0.25,
        pauldronSize: 0.95,
        weaponScale: 1.05,
        dorsalScale: 1.56,
        limbLength: 1.12,
        neckLength: 1.16,
        tailLength: 0.92,
        snoutLength: 1.46,
        headCount: 1,
        auraShardCount: 8,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.24
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#7c2d12",
        secondaryColor: "#f59e0b",
        underbodyColor: "#431407",
        emissiveColor: "#fbbf24",
        emissiveIntensity: 2.35,
        texturePattern: "scales",
        textureRelief: 1.15
      },
      stats: {
        level: 13,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Aerial Breath Sweeper",
        hp: 7120,
        attack: 398,
        defense: 256,
        speed: 178,
        critChance: 31,
        aggroRadius: 24,
        attackRange: 3.2,
        xpReward: 2980,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.66,
        torsoHitboxHeight: 1.26,
        lootTags: ["Cresta Craneal de Pterodr\xE1co", "Membrana Alar Escamosa", "Pico Dentado de Cielo"]
      }
    },
    elite_komodo_monitor_ravager: {
      id: "enemy-elite-komodo-monitor-ravager",
      name: "Varano de Komodo Devorador",
      title: "Coloso Reptiliano de Mordida S\xE9ptica",
      raceCategory: "elite_low_level",
      bodyPlan: "quadruped_beast",
      archetype: "elite_komodo_monitor_ravager",
      helm: "draconic_snout",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.04,
        torsoBulk: 1.28,
        shoulderWidth: 1.24,
        hornLength: 0.35,
        hornCurve: 0.3,
        pauldronSize: 1.08,
        weaponScale: 1.1,
        dorsalScale: 1.22,
        limbLength: 0.96,
        neckLength: 0.92,
        tailLength: 1.68,
        snoutLength: 1.28,
        headCount: 1,
        auraShardCount: 8,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.46
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#3f3f46",
        secondaryColor: "#84cc16",
        underbodyColor: "#18181b",
        emissiveColor: "#a3e635",
        emissiveIntensity: 2.2,
        texturePattern: "scales",
        textureRelief: 1.26
      },
      stats: {
        level: 14,
        tier: "Elite",
        element: "Veneno",
        aiBehavior: "Pack Alpha Predator",
        hp: 8240,
        attack: 432,
        defense: 312,
        speed: 142,
        critChance: 27,
        aggroRadius: 21,
        attackRange: 2.6,
        xpReward: 3340,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.74,
        torsoHitboxHeight: 1.22,
        lootTags: ["Piel Osteod\xE9rmica de Varano", "Gl\xE1ndula de Veneno Hemot\xF3xico", "Garra Curva de Komodo"]
      }
    },
    elite_glacial_plesio_drake: {
      id: "enemy-elite-glacial-plesio-drake",
      name: "Plesiodraco de Escamas Glaciales",
      title: "Sierpe Marina de Cuello Largo del \xC1rtico",
      raceCategory: "elite_low_level",
      bodyPlan: "quadruped_beast",
      archetype: "elite_glacial_plesio_drake",
      helm: "draconic_snout",
      weapon: "frost_breath_maw",
      offhand: "none",
      dorsal: "crystal_pylons",
      morphology: {
        heightScale: 1.16,
        torsoBulk: 1.24,
        shoulderWidth: 1.26,
        hornLength: 0.72,
        hornCurve: 0.48,
        pauldronSize: 1.1,
        weaponScale: 1.1,
        dorsalScale: 1.42,
        limbLength: 0.94,
        neckLength: 1.72,
        tailLength: 1.48,
        snoutLength: 1.18,
        headCount: 1,
        auraShardCount: 10,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.32
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#0369a1",
        secondaryColor: "#bae6fd",
        underbodyColor: "#0c4a6e",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.65,
        texturePattern: "scales",
        textureRelief: 1.22
      },
      stats: {
        level: 15,
        tier: "Elite",
        element: "Escarcha",
        aiBehavior: "Arcane Artillery",
        hp: 8950,
        attack: 455,
        defense: 335,
        speed: 138,
        critChance: 25,
        aggroRadius: 23,
        attackRange: 6.4,
        xpReward: 3680,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.78,
        torsoHitboxHeight: 1.36,
        lootTags: ["Escama Hidrodin\xE1mica de Plesiodraco", "Aleta de Hielo Abisal", "Colmillo de Mar Helado"]
      }
    },
    elite_clubtail_ankylo_drake: {
      id: "enemy-elite-clubtail-ankylo-drake",
      name: "Draco Anquilosaurio de Maza Caudal",
      title: "Basti\xF3n Viviente de Placas y Espinas",
      raceCategory: "elite_low_level",
      bodyPlan: "quadruped_beast",
      archetype: "elite_clubtail_ankylo_drake",
      helm: "draconic_snout",
      weapon: "ram_charge",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.08,
        torsoBulk: 1.52,
        shoulderWidth: 1.48,
        hornLength: 0.96,
        hornCurve: 0.44,
        pauldronSize: 1.38,
        weaponScale: 1.25,
        dorsalScale: 1.58,
        limbLength: 0.92,
        neckLength: 0.68,
        tailLength: 1.64,
        snoutLength: 0.96,
        headCount: 1,
        auraShardCount: 10,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.48
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#57534e",
        secondaryColor: "#d97706",
        underbodyColor: "#292524",
        emissiveColor: "#f59e0b",
        emissiveIntensity: 2.25,
        texturePattern: "scales",
        textureRelief: 1.32
      },
      stats: {
        level: 16,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Shield Wall Tank",
        hp: 10850,
        attack: 472,
        defense: 455,
        speed: 112,
        critChance: 21,
        aggroRadius: 21,
        attackRange: 2.8,
        xpReward: 4120,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.88,
        torsoHitboxHeight: 1.34,
        lootTags: ["Maza \xD3sea Caudal de Anquilosaurio", "Placa Dorsal Acorazada", "Cuerno Escamoso Lateral"]
      }
    },
    elite_twin_head_amphisbaena: {
      id: "enemy-elite-twin-head-amphisbaena",
      name: "Anfisbena Escamosa de Dos Cabezas",
      title: "Sierpe Gemela de Colmillos Venenosos",
      raceCategory: "elite_low_level",
      bodyPlan: "serpentine_naga",
      archetype: "elite_twin_head_amphisbaena",
      helm: "draconic_snout",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.18,
        torsoBulk: 1.14,
        shoulderWidth: 1.24,
        hornLength: 0.84,
        hornCurve: 0.52,
        pauldronSize: 1.08,
        weaponScale: 1.15,
        dorsalScale: 1.38,
        limbLength: 1,
        neckLength: 1.22,
        tailLength: 1.78,
        snoutLength: 1.16,
        headCount: 2,
        auraShardCount: 12,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.38
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#4c1d95",
        secondaryColor: "#10b981",
        underbodyColor: "#1e1b4b",
        emissiveColor: "#34d399",
        emissiveIntensity: 2.6,
        texturePattern: "scales",
        textureRelief: 1.25
      },
      stats: {
        level: 17,
        tier: "Elite",
        element: "Veneno",
        aiBehavior: "Aggressive Berserker",
        hp: 10450,
        attack: 528,
        defense: 348,
        speed: 152,
        critChance: 31,
        aggroRadius: 23,
        attackRange: 3.1,
        xpReward: 4480,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.74,
        torsoHitboxHeight: 1.48,
        lootTags: ["Doble Cr\xE1neo de Anfisbena", "Escama Bic\xE9fala Iridiscente", "Colmillo Gemelo de Veneno"]
      }
    },
    elite_crimson_wyvern_matriarch: {
      id: "enemy-elite-crimson-wyvern-matriarch",
      name: "Matriarca Wyvern de Escamas Carmes\xED",
      title: "Soberana Alada de Aguij\xF3n y Fuego",
      raceCategory: "elite_low_level",
      bodyPlan: "dragon_wyvern",
      archetype: "elite_crimson_wyvern_matriarch",
      helm: "draconic_snout",
      weapon: "dragon_breath_maw",
      offhand: "none",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 1.26,
        torsoBulk: 1.22,
        shoulderWidth: 1.34,
        hornLength: 1.38,
        hornCurve: 0.72,
        pauldronSize: 1.24,
        weaponScale: 1.25,
        dorsalScale: 1.68,
        limbLength: 1.16,
        neckLength: 1.28,
        tailLength: 1.74,
        snoutLength: 1.32,
        headCount: 1,
        auraShardCount: 16,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.46
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#881337",
        secondaryColor: "#f59e0b",
        underbodyColor: "#31102f",
        emissiveColor: "#ff5722",
        emissiveIntensity: 2.95,
        texturePattern: "scales",
        textureRelief: 1.34
      },
      stats: {
        level: 20,
        tier: "Elite",
        element: "Fuego Drac\xF3nico",
        aiBehavior: "Aerial Breath Sweeper",
        hp: 14200,
        attack: 615,
        defense: 445,
        speed: 164,
        critChance: 34,
        aggroRadius: 26,
        attackRange: 7.2,
        xpReward: 5850,
        headHitboxRadius: 0.42,
        torsoHitboxRadius: 0.84,
        torsoHitboxHeight: 1.62,
        lootTags: ["Escama Real de Matriarca Wyvern", "Aguij\xF3n Caudal Pirof\xF3rico", "Coraz\xF3n de Fuego Carmes\xED"]
      }
    },
    // 10C. ESQUELETOS DE ÉLITE ESTILO NO MUERTO NV. 1-20 (14) — Cráneo Humanoide Coronado, Costillas, Vértebras, Manos 5 Dedos y Armas
    elite_dire_wolf_bone_alpha: {
      id: "enemy-elite-dire-wolf-bone-alpha",
      name: "Esqueleto Explorador de Corona Lupina",
      title: "Rastreador \xD3seo de la Cripta Helada (Nv. 3)",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_dire_wolf_bone_alpha",
      helm: "crowned_skull",
      weapon: "twin_reaver_axes",
      offhand: "runic_buckler",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 0.98,
        torsoBulk: 0.9,
        shoulderWidth: 1.04,
        hornLength: 0.78,
        hornCurve: 0.36,
        pauldronSize: 1.04,
        weaponScale: 1.08,
        dorsalScale: 1.12,
        limbLength: 1.06,
        neckLength: 0.94,
        tailLength: 0,
        snoutLength: 0.55,
        headCount: 1,
        auraShardCount: 10,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.12
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e7e5e4",
        secondaryColor: "#0284c7",
        underbodyColor: "#0f172a",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.6,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 3,
        tier: "Elite",
        element: "Escarcha",
        aiBehavior: "Aggressive Berserker",
        hp: 1980,
        attack: 152,
        defense: 138,
        speed: 168,
        critChance: 26,
        aggroRadius: 19,
        attackRange: 2.4,
        xpReward: 660,
        headHitboxRadius: 0.34,
        torsoHitboxRadius: 0.62,
        torsoHitboxHeight: 1.44,
        lootTags: ["Corona \xD3sea de Explorador", "Hacha de Escarcha Sepulcral", "Costilla Grabada con Runas"]
      }
    },
    elite_crypt_stalker_bone_spider: {
      id: "enemy-elite-crypt-stalker-bone-spider",
      name: "Esqueleto Asesino de la Cripta Ar\xE1cnida",
      title: "Acechador Coronado de Dagas Venenosas (Nv. 4)",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_crypt_stalker_bone_spider",
      helm: "crowned_skull",
      weapon: "venom_scythe_claws",
      offhand: "dual_blade",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.02,
        torsoBulk: 0.88,
        shoulderWidth: 1.06,
        hornLength: 0.84,
        hornCurve: 0.42,
        pauldronSize: 1.06,
        weaponScale: 1.12,
        dorsalScale: 1.24,
        limbLength: 1.1,
        neckLength: 0.95,
        tailLength: 0,
        snoutLength: 0.54,
        headCount: 1,
        auraShardCount: 12,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.14
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e2e8f0",
        secondaryColor: "#6d28d9",
        underbodyColor: "#1e1b4b",
        emissiveColor: "#a855f7",
        emissiveIntensity: 2.7,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 4,
        tier: "Elite",
        element: "Veneno",
        aiBehavior: "Ambush Stalker",
        hp: 2380,
        attack: 172,
        defense: 158,
        speed: 162,
        critChance: 30,
        aggroRadius: 19,
        attackRange: 2.4,
        xpReward: 810,
        headHitboxRadius: 0.34,
        torsoHitboxRadius: 0.64,
        torsoHitboxHeight: 1.48,
        lootTags: ["Diadema Ar\xE1cnida de Hueso", "Dagas Gemelas de Ponzo\xF1a", "Falange Afilada de Cripta"]
      }
    },
    elite_sabertooth_skull_stalker: {
      id: "enemy-elite-sabertooth-skull-stalker",
      name: "Esqueleto Berserker de Colmillos Sable",
      title: "Degollador \xD3seo de Corona Salvaje (Nv. 5)",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_sabertooth_skull_stalker",
      helm: "crowned_skull",
      weapon: "twin_reaver_axes",
      offhand: "dual_blade",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.05,
        torsoBulk: 0.94,
        shoulderWidth: 1.12,
        hornLength: 0.92,
        hornCurve: 0.48,
        pauldronSize: 1.12,
        weaponScale: 1.16,
        dorsalScale: 1.2,
        limbLength: 1.08,
        neckLength: 0.94,
        tailLength: 0,
        snoutLength: 0.56,
        headCount: 1,
        auraShardCount: 12,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.18
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e7e5e4",
        secondaryColor: "#b45309",
        underbodyColor: "#1c1917",
        emissiveColor: "#10b981",
        emissiveIntensity: 2.65,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 5,
        tier: "Elite",
        element: "Abisal",
        aiBehavior: "Aggressive Berserker",
        hp: 2940,
        attack: 198,
        defense: 172,
        speed: 168,
        critChance: 32,
        aggroRadius: 20,
        attackRange: 2.5,
        xpReward: 980,
        headHitboxRadius: 0.35,
        torsoHitboxRadius: 0.66,
        torsoHitboxHeight: 1.5,
        lootTags: ["Cr\xE1neo Coronado de Colmillos Sable", "Hacha Doble de Osario", "Estern\xF3n Tallado"]
      }
    },
    elite_pirate_captain_skeleton: {
      id: "enemy-elite-pirate-captain-skeleton",
      name: "Capit\xE1n Esqueleto del Gale\xF3n Hundido",
      title: "Corsario No Muerto de Corona Naval y Doble Hoja (Nv. 7)",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_pirate_captain_skeleton",
      helm: "crowned_skull",
      weapon: "runic_greatsword",
      offhand: "dual_blade",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.08,
        torsoBulk: 0.94,
        shoulderWidth: 1.12,
        hornLength: 0.88,
        hornCurve: 0.36,
        pauldronSize: 1.14,
        weaponScale: 1.16,
        dorsalScale: 1.18,
        limbLength: 1.08,
        neckLength: 0.94,
        tailLength: 0,
        snoutLength: 0.55,
        headCount: 1,
        auraShardCount: 14,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.14
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e2e8f0",
        secondaryColor: "#0f766e",
        underbodyColor: "#134e4a",
        emissiveColor: "#2dd4bf",
        emissiveIntensity: 2.7,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 7,
        tier: "Elite",
        element: "Escarcha",
        aiBehavior: "Aggressive Berserker",
        hp: 3850,
        attack: 248,
        defense: 196,
        speed: 152,
        critChance: 28,
        aggroRadius: 19,
        attackRange: 2.6,
        xpReward: 1380,
        headHitboxRadius: 0.35,
        torsoHitboxRadius: 0.66,
        torsoHitboxHeight: 1.52,
        lootTags: ["Sable de Abordaje Maldito", "Corona Naval del Gale\xF3n", "Dobl\xF3n del Abismo"]
      }
    },
    elite_bone_scorpion_construct: {
      id: "enemy-elite-bone-scorpion-construct",
      name: "Esqueleto Pretoriano de las Dunas Muertas",
      title: "Guardi\xE1n Coronado de Alabarda y Escudo Real (Nv. 8)",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_bone_scorpion_construct",
      helm: "crowned_skull",
      weapon: "radiant_halberd",
      offhand: "tower_shield",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.1,
        torsoBulk: 0.96,
        shoulderWidth: 1.14,
        hornLength: 0.92,
        hornCurve: 0.42,
        pauldronSize: 1.18,
        weaponScale: 1.2,
        dorsalScale: 1.2,
        limbLength: 1.1,
        neckLength: 0.94,
        tailLength: 0,
        snoutLength: 0.55,
        headCount: 1,
        auraShardCount: 14,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.16
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e7e5e4",
        secondaryColor: "#ca8a04",
        underbodyColor: "#1c1917",
        emissiveColor: "#84cc16",
        emissiveIntensity: 2.7,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 8,
        tier: "Elite",
        element: "Veneno",
        aiBehavior: "Shield Wall Tank",
        hp: 4520,
        attack: 272,
        defense: 235,
        speed: 144,
        critChance: 27,
        aggroRadius: 19,
        attackRange: 2.8,
        xpReward: 1620,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.68,
        torsoHitboxHeight: 1.54,
        lootTags: ["Corona Dorada del Desierto", "Alabarda de Hueso Real", "Escudo de Pavese Fara\xF3nico"]
      }
    },
    elite_ancient_raptor_skeleton: {
      id: "enemy-elite-ancient-raptor-skeleton",
      name: "Esqueleto Duelista de Diadema Sangrienta",
      title: "Segador Veloz de Hoz R\xFAnica y Rodela (Nv. 9)",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_ancient_raptor_skeleton",
      helm: "crowned_skull",
      weapon: "venom_scythe_claws",
      offhand: "runic_buckler",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.08,
        torsoBulk: 0.9,
        shoulderWidth: 1.08,
        hornLength: 0.86,
        hornCurve: 0.38,
        pauldronSize: 1.08,
        weaponScale: 1.18,
        dorsalScale: 1.18,
        limbLength: 1.12,
        neckLength: 0.95,
        tailLength: 0,
        snoutLength: 0.54,
        headCount: 1,
        auraShardCount: 14,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.16
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e7e5e4",
        secondaryColor: "#991b1b",
        underbodyColor: "#1c1917",
        emissiveColor: "#f59e0b",
        emissiveIntensity: 2.7,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 9,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Ambush Stalker",
        hp: 4680,
        attack: 312,
        defense: 198,
        speed: 176,
        critChance: 34,
        aggroRadius: 22,
        attackRange: 2.6,
        xpReward: 1890,
        headHitboxRadius: 0.35,
        torsoHitboxRadius: 0.66,
        torsoHitboxHeight: 1.52,
        lootTags: ["Diadema Carmes\xED del Duelista", "Hoja Curva del Osario", "Clav\xEDcula Grabada"]
      }
    },
    elite_winged_gargoyle_skeleton: {
      id: "enemy-elite-winged-gargoyle-skeleton",
      name: "Esqueleto Seraf\xEDn de Corona Alada",
      title: "Arc\xE1ngel Ca\xEDdo de Alas \xD3seas y Alabarda (Nv. 10)",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_winged_gargoyle_skeleton",
      helm: "valkyrie_crest",
      weapon: "radiant_halberd",
      offhand: "runic_buckler",
      dorsal: "seraph_wings",
      morphology: {
        heightScale: 1.14,
        torsoBulk: 0.94,
        shoulderWidth: 1.14,
        hornLength: 0.98,
        hornCurve: 0.45,
        pauldronSize: 1.14,
        weaponScale: 1.22,
        dorsalScale: 1.42,
        limbLength: 1.12,
        neckLength: 0.96,
        tailLength: 0,
        snoutLength: 0.54,
        headCount: 1,
        auraShardCount: 16,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.16
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e2e8f0",
        secondaryColor: "#475569",
        underbodyColor: "#0f172a",
        emissiveColor: "#ef4444",
        emissiveIntensity: 2.8,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 10,
        tier: "Elite",
        element: "Abisal",
        aiBehavior: "Aerial Breath Sweeper",
        hp: 5420,
        attack: 328,
        defense: 254,
        speed: 162,
        critChance: 28,
        aggroRadius: 22,
        attackRange: 3.1,
        xpReward: 2150,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.68,
        torsoHitboxHeight: 1.56,
        lootTags: ["Diadema Alada de Cripta", "Alabarda de Catedral Negra", "Pluma de Hueso Tallado"]
      }
    },
    elite_plague_doctor_lich_skeleton: {
      id: "enemy-elite-plague-doctor-lich-skeleton",
      name: "Liche Esqueleto de la Corona de Peste",
      title: "Sumo Alquimista \xD3seo de B\xE1culo e Incensario (Nv. 11)",
      raceCategory: "elite_low_level",
      bodyPlan: "floating_magical",
      archetype: "elite_plague_doctor_lich_skeleton",
      helm: "crowned_skull",
      weapon: "arcane_staff",
      offhand: "phylactery_orb",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.14,
        torsoBulk: 0.92,
        shoulderWidth: 1.1,
        hornLength: 0.96,
        hornCurve: 0.4,
        pauldronSize: 1.14,
        weaponScale: 1.2,
        dorsalScale: 1.28,
        limbLength: 1.1,
        neckLength: 0.96,
        tailLength: 0,
        snoutLength: 0.54,
        headCount: 1,
        auraShardCount: 18,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.08
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e7e5e4",
        secondaryColor: "#15803d",
        underbodyColor: "#052e16",
        emissiveColor: "#4ade80",
        emissiveIntensity: 2.9,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 11,
        tier: "Elite",
        element: "Veneno",
        aiBehavior: "Arcane Artillery",
        hp: 5680,
        attack: 368,
        defense: 224,
        speed: 138,
        critChance: 29,
        aggroRadius: 23,
        attackRange: 7.4,
        xpReward: 2450,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.66,
        torsoHitboxHeight: 1.56,
        lootTags: ["Corona Esmeralda de la Peste", "Incensario de Miasma Verde", "B\xE1culo del Liche Alquimista"]
      }
    },
    elite_caged_rib_jailer_skeleton: {
      id: "enemy-elite-caged-rib-jailer-skeleton",
      name: "Carcelero Esqueleto de Costillas en Jaula",
      title: "Verdugo Coronado con Alma Cautiva en el Estern\xF3n (Nv. 12)",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_caged_rib_jailer_skeleton",
      helm: "crowned_skull",
      weapon: "obsidian_warhammer",
      offhand: "phylactery_orb",
      dorsal: "crystal_pylons",
      morphology: {
        heightScale: 1.16,
        torsoBulk: 1.04,
        shoulderWidth: 1.18,
        hornLength: 0.92,
        hornCurve: 0.4,
        pauldronSize: 1.22,
        weaponScale: 1.22,
        dorsalScale: 1.26,
        limbLength: 1.12,
        neckLength: 0.94,
        tailLength: 0,
        snoutLength: 0.56,
        headCount: 1,
        auraShardCount: 16,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.18
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#d6d3d1",
        secondaryColor: "#334155",
        underbodyColor: "#0f172a",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.85,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 12,
        tier: "Elite",
        element: "Abisal",
        aiBehavior: "Shield Wall Tank",
        hp: 7120,
        attack: 372,
        defense: 318,
        speed: 122,
        critChance: 23,
        aggroRadius: 20,
        attackRange: 2.8,
        xpReward: 2790,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.72,
        torsoHitboxHeight: 1.58,
        lootTags: ["Jaula Tor\xE1cica de Hierro Forjado", "Maza de Carcelero de Almas", "Llave Maestra del Osario"]
      }
    },
    elite_spiked_wheel_bone_martyr: {
      id: "enemy-elite-spiked-wheel-bone-martyr",
      name: "Esqueleto M\xE1rtir de Rueda Dentada",
      title: "Inquisidor Coronado de Rueda Dorsal y Mandoble (Nv. 13)",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_spiked_wheel_bone_martyr",
      helm: "crowned_skull",
      weapon: "runic_greatsword",
      offhand: "runic_buckler",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.14,
        torsoBulk: 0.98,
        shoulderWidth: 1.16,
        hornLength: 0.96,
        hornCurve: 0.44,
        pauldronSize: 1.16,
        weaponScale: 1.2,
        dorsalScale: 1.48,
        limbLength: 1.1,
        neckLength: 0.95,
        tailLength: 0,
        snoutLength: 0.55,
        headCount: 1,
        auraShardCount: 16,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.16
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e7e5e4",
        secondaryColor: "#991b1b",
        underbodyColor: "#1c1917",
        emissiveColor: "#f97316",
        emissiveIntensity: 2.8,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 13,
        tier: "Elite",
        element: "Fuego Solar",
        aiBehavior: "Aggressive Berserker",
        hp: 7350,
        attack: 408,
        defense: 295,
        speed: 138,
        critChance: 28,
        aggroRadius: 21,
        attackRange: 2.8,
        xpReward: 3020,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.7,
        torsoHitboxHeight: 1.56,
        lootTags: ["Rueda de Hierro con P\xFAas", "Corona de Espinas del M\xE1rtir", "Mandoble de Penitencia"]
      }
    },
    elite_horned_minotaur_skeleton: {
      id: "enemy-elite-horned-minotaur-skeleton",
      name: "Campe\xF3n Esqueleto de Corona Cornuda",
      title: "Se\xF1or de la Guerra \xD3seo de Gran Hacha y Pavese (Nv. 14)",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_horned_minotaur_skeleton",
      helm: "crowned_skull",
      weapon: "twin_reaver_axes",
      offhand: "tower_shield",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.2,
        torsoBulk: 1.08,
        shoulderWidth: 1.24,
        hornLength: 1.42,
        hornCurve: 0.78,
        pauldronSize: 1.26,
        weaponScale: 1.26,
        dorsalScale: 1.2,
        limbLength: 1.14,
        neckLength: 0.94,
        tailLength: 0,
        snoutLength: 0.56,
        headCount: 1,
        auraShardCount: 16,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.22
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e7e5e4",
        secondaryColor: "#b45309",
        underbodyColor: "#1c1917",
        emissiveColor: "#ef4444",
        emissiveIntensity: 2.8,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 14,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Aggressive Berserker",
        hp: 8650,
        attack: 446,
        defense: 328,
        speed: 136,
        critChance: 27,
        aggroRadius: 21,
        attackRange: 3,
        xpReward: 3420,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.76,
        torsoHitboxHeight: 1.64,
        lootTags: ["Corona Cornuda del Campe\xF3n", "Hacha Labrys del Laberinto", "Estern\xF3n Real Blindado"]
      }
    },
    elite_four_armed_bone_reaver: {
      id: "enemy-elite-four-armed-bone-reaver",
      name: "Segador Esqueleto de Cuatro Brazos",
      title: "Campe\xF3n Coronado de Cu\xE1druple H\xFAmero y Falanges (Nv. 16)",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_four_armed_bone_reaver",
      helm: "crowned_skull",
      weapon: "runic_greatsword",
      offhand: "dual_blade",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.2,
        torsoBulk: 1.04,
        shoulderWidth: 1.26,
        hornLength: 1.04,
        hornCurve: 0.46,
        pauldronSize: 1.24,
        weaponScale: 1.24,
        dorsalScale: 1.32,
        limbLength: 1.14,
        neckLength: 0.96,
        tailLength: 0,
        snoutLength: 0.56,
        headCount: 1,
        auraShardCount: 18,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.2
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e7e5e4",
        secondaryColor: "#7c3aed",
        underbodyColor: "#1e1b4b",
        emissiveColor: "#c084fc",
        emissiveIntensity: 2.9,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 16,
        tier: "Elite",
        element: "Abisal",
        aiBehavior: "Aggressive Berserker",
        hp: 9850,
        attack: 515,
        defense: 365,
        speed: 158,
        critChance: 33,
        aggroRadius: 23,
        attackRange: 3,
        xpReward: 4250,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.76,
        torsoHitboxHeight: 1.62,
        lootTags: ["Clav\xEDcula Doble de Cuatro Brazos", "Espada de Segador \xD3seo", "Mano Esquel\xE9tica Articulada"]
      }
    },
    elite_twin_skull_ettin_skeleton: {
      id: "enemy-elite-twin-skull-ettin-skeleton",
      name: "Esqueleto Bic\xE9falo Ettin del Osario",
      title: "Gigante de Dos Cr\xE1neos Coronados y Maza de Guerra (Nv. 17)",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_twin_skull_ettin_skeleton",
      helm: "crowned_skull",
      weapon: "obsidian_warhammer",
      offhand: "tower_shield",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.24,
        torsoBulk: 1.12,
        shoulderWidth: 1.3,
        hornLength: 1.02,
        hornCurve: 0.44,
        pauldronSize: 1.28,
        weaponScale: 1.28,
        dorsalScale: 1.24,
        limbLength: 1.14,
        neckLength: 0.94,
        tailLength: 0,
        snoutLength: 0.56,
        headCount: 2,
        auraShardCount: 18,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.22
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e7e5e4",
        secondaryColor: "#d97706",
        underbodyColor: "#1c1917",
        emissiveColor: "#fbbf24",
        emissiveIntensity: 2.85,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 17,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Shield Wall Tank",
        hp: 11400,
        attack: 538,
        defense: 435,
        speed: 124,
        critChance: 25,
        aggroRadius: 23,
        attackRange: 3.1,
        xpReward: 4580,
        headHitboxRadius: 0.42,
        torsoHitboxRadius: 0.82,
        torsoHitboxHeight: 1.68,
        lootTags: ["Cr\xE1neos Gemelos de Ettin Real", "Martillo de Hueso Forjado", "Atlas Cervical Bifurcado"]
      }
    },
    elite_mammoth_ossuary_behemoth: {
      id: "enemy-elite-mammoth-ossuary-behemoth",
      name: "Tit\xE1n Esqueleto de Corona de Marfil",
      title: "Coloso Soberano de Colmillos Imperiales y Gran Maza (Nv. 19)",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_mammoth_ossuary_behemoth",
      helm: "crowned_skull",
      weapon: "obsidian_warhammer",
      offhand: "tower_shield",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.28,
        torsoBulk: 1.14,
        shoulderWidth: 1.28,
        hornLength: 1.18,
        hornCurve: 0.52,
        pauldronSize: 1.32,
        weaponScale: 1.34,
        dorsalScale: 1.28,
        limbLength: 1.16,
        neckLength: 0.94,
        tailLength: 0,
        snoutLength: 0.58,
        headCount: 1,
        auraShardCount: 20,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.24
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e7e5e4",
        secondaryColor: "#ca8a04",
        underbodyColor: "#1c1917",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.95,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 19,
        tier: "Elite",
        element: "Escarcha",
        aiBehavior: "Shield Wall Tank",
        hp: 13600,
        attack: 585,
        defense: 495,
        speed: 120,
        critChance: 26,
        aggroRadius: 24,
        attackRange: 3.3,
        xpReward: 5350,
        headHitboxRadius: 0.44,
        torsoHitboxRadius: 0.84,
        torsoHitboxHeight: 1.76,
        lootTags: ["Corona Imperial de Colmillos de Marfil", "Maza Colosal del Osario", "Escudo Real de Hueso Antiguo"]
      }
    },
    // 10D. TRASGOS, MITOLÓGICOS Y ELEMENTALES DE ÉLITE NV. 1-20 (10)
    elite_goblin_wolf_rider_boss: {
      id: "enemy-elite-goblin-wolf-rider-boss",
      name: "Jefe Trasgo Caudillo Colmillo Rojo",
      title: "Se\xF1or Saqueador de Cresta Salvaje y Hacha Doble",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_goblin_wolf_rider_boss",
      helm: "goblin_feral_face",
      weapon: "twin_reaver_axes",
      offhand: "runic_buckler",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 0.94,
        torsoBulk: 1.04,
        shoulderWidth: 1.16,
        hornLength: 0.55,
        hornCurve: 0.35,
        pauldronSize: 1.18,
        weaponScale: 1.14,
        dorsalScale: 1.15,
        limbLength: 0.96,
        neckLength: 0.68,
        tailLength: 0,
        snoutLength: 0.88,
        headCount: 1,
        auraShardCount: 6,
        furDensity: 1.25,
        hairStyle: "dorsal_mohawk",
        hairLength: 1.24,
        muscleDefinition: 1.32
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#3f6212",
        secondaryColor: "#b91c1c",
        underbodyColor: "#1a2e05",
        emissiveColor: "#f59e0b",
        emissiveIntensity: 2.35,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 6,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Aggressive Berserker",
        hp: 3580,
        attack: 232,
        defense: 184,
        speed: 156,
        critChance: 27,
        aggroRadius: 19,
        attackRange: 2.4,
        xpReward: 1180,
        headHitboxRadius: 0.34,
        torsoHitboxRadius: 0.66,
        torsoHitboxHeight: 1.32,
        lootTags: ["Hacha Dentada de Caudillo Trasgo", "Aro de Oro de Colmillo Rojo", "Trofeo de Guerra Trasgo"]
      }
    },
    elite_satyr_bloodhorn_shaman: {
      id: "enemy-elite-satyr-bloodhorn-shaman",
      name: "S\xE1tiro Cham\xE1n Cuerno de Sangre",
      title: "Hechicero Caprino de Pezu\xF1as y Melena Salvaje",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_satyr_bloodhorn_shaman",
      helm: "tauren_bull_horns",
      weapon: "arcane_staff",
      offhand: "phylactery_orb",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.06,
        torsoBulk: 1.04,
        shoulderWidth: 1.14,
        hornLength: 1.36,
        hornCurve: 0.88,
        pauldronSize: 1.02,
        weaponScale: 1.16,
        dorsalScale: 1.22,
        limbLength: 1.14,
        neckLength: 0.82,
        tailLength: 0.55,
        snoutLength: 0.72,
        headCount: 1,
        auraShardCount: 10,
        furDensity: 1.48,
        hairStyle: "wild_mane_fur",
        hairLength: 1.32,
        muscleDefinition: 1.28
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#451a03",
        secondaryColor: "#991b1b",
        underbodyColor: "#1c1917",
        emissiveColor: "#ef4444",
        emissiveIntensity: 2.55,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 7,
        tier: "Elite",
        element: "Abisal",
        aiBehavior: "Arcane Artillery",
        hp: 3790,
        attack: 262,
        defense: 168,
        speed: 146,
        critChance: 28,
        aggroRadius: 21,
        attackRange: 6.8,
        xpReward: 1390,
        headHitboxRadius: 0.34,
        torsoHitboxRadius: 0.66,
        torsoHitboxHeight: 1.46,
        lootTags: ["Cuerno Espiral de S\xE1tiro", "B\xE1culo de Espino Sangriento", "Pezu\xF1a Hendida R\xFAnica"]
      }
    },
    elite_fungal_myconid_colossus: {
      id: "enemy-elite-fungal-myconid-colossus",
      name: "Coloso Mic\xF3nido de Sombrero Espor\xEDfero",
      title: "Guardi\xE1n F\xFAngico Bioluminiscente de la Caverna",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_fungal_myconid_colossus",
      helm: "monolith_visor",
      weapon: "feral_claws_fangs",
      offhand: "none",
      dorsal: "crystal_pylons",
      morphology: {
        heightScale: 1.18,
        torsoBulk: 1.38,
        shoulderWidth: 1.34,
        hornLength: 0.65,
        hornCurve: 0.3,
        pauldronSize: 1.28,
        weaponScale: 1.1,
        dorsalScale: 1.42,
        limbLength: 1.08,
        neckLength: 0.52,
        tailLength: 0,
        snoutLength: 0.54,
        headCount: 1,
        auraShardCount: 12,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.22
      },
      materials: {
        preset: "arcane_crystal",
        ...MATERIAL_PRESETS.arcane_crystal,
        primaryColor: "#312e81",
        secondaryColor: "#06b6d4",
        underbodyColor: "#1e1b4b",
        emissiveColor: "#22d3ee",
        emissiveIntensity: 2.85,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 8,
        tier: "Elite",
        element: "Veneno",
        aiBehavior: "Shield Wall Tank",
        hp: 4950,
        attack: 258,
        defense: 275,
        speed: 108,
        critChance: 20,
        aggroRadius: 18,
        attackRange: 2.5,
        xpReward: 1650,
        headHitboxRadius: 0.44,
        torsoHitboxRadius: 0.82,
        torsoHitboxHeight: 1.52,
        lootTags: ["Sombrero Bioluminiscente Real", "Saco de Esporas Alucin\xF3genas", "Micelio Petrificado"]
      }
    },
    elite_bog_troll_regenerator: {
      id: "enemy-elite-bog-troll-regenerator",
      name: "Trol del Pantano Colmilludo",
      title: "Bruto Regenerador de Colmillos Largos y Maza",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_bog_troll_regenerator",
      helm: "goblin_feral_face",
      weapon: "obsidian_warhammer",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.22,
        torsoBulk: 1.24,
        shoulderWidth: 1.3,
        hornLength: 0.85,
        hornCurve: 0.48,
        pauldronSize: 1.15,
        weaponScale: 1.22,
        dorsalScale: 1.24,
        limbLength: 1.26,
        neckLength: 0.78,
        tailLength: 0,
        snoutLength: 1.08,
        headCount: 1,
        auraShardCount: 7,
        furDensity: 1.32,
        hairStyle: "dorsal_mohawk",
        hairLength: 1.28,
        muscleDefinition: 1.44
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#14532d",
        secondaryColor: "#84cc16",
        underbodyColor: "#052e16",
        emissiveColor: "#eab308",
        emissiveIntensity: 2.2,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 9,
        tier: "Elite",
        element: "Veneno",
        aiBehavior: "Aggressive Berserker",
        hp: 5620,
        attack: 304,
        defense: 242,
        speed: 128,
        critChance: 23,
        aggroRadius: 20,
        attackRange: 2.8,
        xpReward: 1940,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.78,
        torsoHitboxHeight: 1.62,
        lootTags: ["Sangre Regeneradora de Trol", "Colmillo Curvo de Pantano", "Garrote de Ra\xEDz F\xE9rrea"]
      }
    },
    elite_hobgoblin_iron_warmonger: {
      id: "enemy-elite-hobgoblin-iron-warmonger",
      name: "Gran Hobgoblin Se\xF1or de la Guerra",
      title: "Comandante Acorazado de Dientes Afilados y Escudo",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_hobgoblin_iron_warmonger",
      helm: "goblin_feral_face",
      weapon: "runic_greatsword",
      offhand: "tower_shield",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.14,
        torsoBulk: 1.26,
        shoulderWidth: 1.32,
        hornLength: 0.74,
        hornCurve: 0.4,
        pauldronSize: 1.32,
        weaponScale: 1.22,
        dorsalScale: 1.24,
        limbLength: 1.1,
        neckLength: 0.74,
        tailLength: 0,
        snoutLength: 0.92,
        headCount: 1,
        auraShardCount: 8,
        furDensity: 1.1,
        hairStyle: "dorsal_mohawk",
        hairLength: 1.15,
        muscleDefinition: 1.46
      },
      materials: {
        preset: "blued_steel",
        ...MATERIAL_PRESETS.blued_steel,
        primaryColor: "#9a3412",
        secondaryColor: "#334155",
        underbodyColor: "#431407",
        emissiveColor: "#f97316",
        emissiveIntensity: 2.35,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 11,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Shield Wall Tank",
        hp: 6580,
        attack: 342,
        defense: 312,
        speed: 132,
        critChance: 24,
        aggroRadius: 20,
        attackRange: 2.7,
        xpReward: 2460,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.76,
        torsoHitboxHeight: 1.56,
        lootTags: ["Peto de Hierro de Hobgoblin", "Mandoble Dentado de Legi\xF3n", "Escudo de Asedio Trasgo"]
      }
    },
    elite_harpy_storm_matriarch: {
      id: "enemy-elite-harpy-storm-matriarch",
      name: "Matriarca Arp\xEDa Pluma de Tormenta",
      title: "Reina Alada de Garras Rapaces y Melena de Viento",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_harpy_storm_matriarch",
      helm: "avian_phoenix_beak",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "seraph_wings",
      morphology: {
        heightScale: 1.1,
        torsoBulk: 0.96,
        shoulderWidth: 1.18,
        hornLength: 0.92,
        hornCurve: 0.48,
        pauldronSize: 1.06,
        weaponScale: 1.05,
        dorsalScale: 1.62,
        limbLength: 1.2,
        neckLength: 0.9,
        tailLength: 1.15,
        snoutLength: 0.88,
        headCount: 1,
        auraShardCount: 10,
        furDensity: 1.44,
        hairStyle: "long_flowing_hair",
        hairLength: 1.48,
        muscleDefinition: 1.24
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#1e3a8a",
        secondaryColor: "#38bdf8",
        underbodyColor: "#0f172a",
        emissiveColor: "#7dd3fc",
        emissiveIntensity: 2.6,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 12,
        tier: "Elite",
        element: "Escarcha",
        aiBehavior: "Aerial Breath Sweeper",
        hp: 6420,
        attack: 386,
        defense: 238,
        speed: 178,
        critChance: 32,
        aggroRadius: 23,
        attackRange: 2.8,
        xpReward: 2780,
        headHitboxRadius: 0.34,
        torsoHitboxRadius: 0.66,
        torsoHitboxHeight: 1.48,
        lootTags: ["Pluma El\xE9ctrica de Matriarca", "Garra Rapaz de Arp\xEDa", "Diadema de Viento Boreal"]
      }
    },
    elite_salamander_magma_spearman: {
      id: "enemy-elite-salamander-magma-spearman",
      name: "Lancero Salamandra de Escamas de Magma",
      title: "Guerrero Reptiliano de Alabarda Incandescente",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_salamander_magma_spearman",
      helm: "draconic_snout",
      weapon: "radiant_halberd",
      offhand: "runic_buckler",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.16,
        torsoBulk: 1.14,
        shoulderWidth: 1.24,
        hornLength: 0.96,
        hornCurve: 0.52,
        pauldronSize: 1.18,
        weaponScale: 1.24,
        dorsalScale: 1.38,
        limbLength: 1.14,
        neckLength: 0.94,
        tailLength: 1.54,
        snoutLength: 1.08,
        headCount: 1,
        auraShardCount: 11,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.38
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#991b1b",
        secondaryColor: "#f97316",
        underbodyColor: "#450a0a",
        emissiveColor: "#ff5722",
        emissiveIntensity: 2.75,
        texturePattern: "scales",
        textureRelief: 1.26
      },
      stats: {
        level: 14,
        tier: "Elite",
        element: "Fuego Drac\xF3nico",
        aiBehavior: "Aggressive Berserker",
        hp: 8150,
        attack: 442,
        defense: 318,
        speed: 146,
        critChance: 28,
        aggroRadius: 21,
        attackRange: 3.1,
        xpReward: 3380,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.74,
        torsoHitboxHeight: 1.58,
        lootTags: ["Alabarda Forjada en Magma", "Escama Ventral Volc\xE1nica", "Rodela de Obsidiana"]
      }
    },
    elite_centaur_steppe_khan: {
      id: "enemy-elite-centaur-steppe-khan",
      name: "Kan Centauro de la Estepa Dorada",
      title: "Se\xF1or Ecuestre de Pelaje Salvaje y Alabarda Real",
      raceCategory: "elite_low_level",
      bodyPlan: "quadruped_beast",
      archetype: "elite_centaur_steppe_khan",
      helm: "horned_greathelm",
      weapon: "radiant_halberd",
      offhand: "runic_buckler",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.22,
        torsoBulk: 1.2,
        shoulderWidth: 1.28,
        hornLength: 1.12,
        hornCurve: 0.56,
        pauldronSize: 1.26,
        weaponScale: 1.28,
        dorsalScale: 1.24,
        limbLength: 1.18,
        neckLength: 0.92,
        tailLength: 1.36,
        snoutLength: 0.68,
        headCount: 1,
        auraShardCount: 12,
        furDensity: 1.46,
        hairStyle: "wild_mane_fur",
        hairLength: 1.34,
        muscleDefinition: 1.48
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#78350f",
        secondaryColor: "#d97706",
        underbodyColor: "#271712",
        emissiveColor: "#fbbf24",
        emissiveIntensity: 2.45,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 15,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Pack Alpha Predator",
        hp: 9120,
        attack: 468,
        defense: 348,
        speed: 174,
        critChance: 30,
        aggroRadius: 24,
        attackRange: 3.3,
        xpReward: 3790,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.8,
        torsoHitboxHeight: 1.64,
        lootTags: ["Alabarda del Gran Kan", "Barda Ecuestre de Bronce", "Crin Trenzada de la Estepa"]
      }
    },
    elite_ogre_two_headed_mauler: {
      id: "enemy-elite-ogre-two-headed-mauler",
      name: "Ogro Bic\xE9falo Machacahuesos",
      title: "Coloso de Dos Cabezas Colmilludas y Martillo de Asedio",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_ogre_two_headed_mauler",
      helm: "goblin_feral_face",
      weapon: "obsidian_warhammer",
      offhand: "tower_shield",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.32,
        torsoBulk: 1.48,
        shoulderWidth: 1.46,
        hornLength: 0.88,
        hornCurve: 0.45,
        pauldronSize: 1.38,
        weaponScale: 1.34,
        dorsalScale: 1.24,
        limbLength: 1.14,
        neckLength: 0.72,
        tailLength: 0,
        snoutLength: 0.94,
        headCount: 2,
        auraShardCount: 12,
        furDensity: 1.18,
        hairStyle: "dorsal_mohawk",
        hairLength: 1.15,
        muscleDefinition: 1.56
      },
      materials: {
        preset: "corroded_bronze",
        ...MATERIAL_PRESETS.corroded_bronze,
        primaryColor: "#7c2d12",
        secondaryColor: "#a16207",
        underbodyColor: "#431407",
        emissiveColor: "#ef4444",
        emissiveIntensity: 2.5,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 18,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Aggressive Berserker",
        hp: 12850,
        attack: 552,
        defense: 448,
        speed: 122,
        critChance: 26,
        aggroRadius: 23,
        attackRange: 3.2,
        xpReward: 4920,
        headHitboxRadius: 0.44,
        torsoHitboxRadius: 0.92,
        torsoHitboxHeight: 1.78,
        lootTags: ["Gran Martillo Machacahuesos", "Hombrera Doble de Ogro", "Colmillo Gemelo de Bruto"]
      }
    },
    elite_wendigo_antler_fiend: {
      id: "enemy-elite-wendigo-antler-fiend",
      name: "Wendigo Devorador de la Ventisca",
      title: "Horror Peludo de Cr\xE1neo Astado y Costillas Heladas",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "elite_wendigo_antler_fiend",
      helm: "tauren_bull_horns",
      weapon: "frost_breath_maw",
      offhand: "none",
      dorsal: "crystal_pylons",
      morphology: {
        heightScale: 1.34,
        torsoBulk: 1.02,
        shoulderWidth: 1.28,
        hornLength: 1.68,
        hornCurve: 0.88,
        pauldronSize: 1.12,
        weaponScale: 1.2,
        dorsalScale: 1.44,
        limbLength: 1.36,
        neckLength: 1.04,
        tailLength: 0.65,
        snoutLength: 1.18,
        headCount: 1,
        auraShardCount: 16,
        furDensity: 1.58,
        hairStyle: "wild_mane_fur",
        hairLength: 1.48,
        muscleDefinition: 1.42
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#e2e8f0",
        secondaryColor: "#94a3b8",
        underbodyColor: "#0f172a",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 3.1,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 20,
        tier: "Elite",
        element: "Escarcha",
        aiBehavior: "Ambush Stalker",
        hp: 13900,
        attack: 628,
        defense: 412,
        speed: 176,
        critChance: 36,
        aggroRadius: 26,
        attackRange: 5.8,
        xpReward: 5950,
        headHitboxRadius: 0.42,
        torsoHitboxRadius: 0.8,
        torsoHitboxHeight: 1.82,
        lootTags: ["Corona Astada de Wendigo", "Coraz\xF3n de Escarcha Eterna", "Pelaje Blanco de Ventisca"]
      }
    },
    // ============================================================================
    // 8. LEYENDAS DE WORLD OF WARCRAFT (60 ENEMIGOS ICÓNICOS DE AZEROTH)
    // ============================================================================
    wow_murloc_tidehunter: {
      id: "enemy-wow-murloc-tidehunter",
      name: "M\xFArloc Cazador de Mareas (Mrrglrlrl)",
      title: "Merodeador Anfibio de Costas con Aleta Dorsal y Lanza de Coral",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_murloc_tidehunter",
      helm: "goblin_feral_face",
      weapon: "radiant_halberd",
      offhand: "runic_buckler",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 0.78,
        torsoBulk: 0.88,
        shoulderWidth: 0.92,
        hornLength: 0.65,
        hornCurve: 0.42,
        pauldronSize: 0.52,
        weaponScale: 0.92,
        dorsalScale: 1.48,
        limbLength: 0.92,
        neckLength: 0.55,
        tailLength: 0.95,
        snoutLength: 0.92,
        headCount: 1,
        auraShardCount: 4,
        furDensity: 0,
        hairStyle: "dorsal_mohawk",
        hairLength: 1.25,
        muscleDefinition: 1.12,
        anatomyCategory: "Scaled"
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#0284c7",
        secondaryColor: "#f97316",
        underbodyColor: "#fde047",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.3,
        texturePattern: "scales",
        textureRelief: 1.18
      },
      stats: {
        level: 8,
        tier: "Elite",
        element: "Escarcha",
        aiBehavior: "Pack Alpha Predator",
        hp: 3450,
        attack: 245,
        defense: 158,
        speed: 175,
        critChance: 28,
        aggroRadius: 22,
        attackRange: 2.5,
        xpReward: 1420,
        headHitboxRadius: 0.34,
        torsoHitboxRadius: 0.58,
        torsoHitboxHeight: 1.18,
        lootTags: ["Aleta Dorsal de M\xFArloc", "Ojo Viscoso de Marea", "Lanza de Arrecife"]
      }
    },
    wow_hogger_gnoll_chieftain: {
      id: "enemy-wow-hogger-gnoll-chieftain",
      name: "Hogger, Azote Gnoll de Elwynn",
      title: "Caudillo Hiena-Lobo de Melena Rabiosa y Hacha Dentada",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_hogger_gnoll_chieftain",
      helm: "lupine_maw",
      weapon: "twin_reaver_axes",
      offhand: "runic_buckler",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.14,
        torsoBulk: 1.24,
        shoulderWidth: 1.28,
        hornLength: 0.72,
        hornCurve: 0.38,
        pauldronSize: 1.22,
        weaponScale: 1.24,
        dorsalScale: 1.18,
        limbLength: 1.08,
        neckLength: 0.88,
        tailLength: 0.92,
        snoutLength: 1.18,
        headCount: 1,
        auraShardCount: 8,
        furDensity: 1.56,
        hairStyle: "wild_mane_fur",
        hairLength: 1.42,
        muscleDefinition: 1.44
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#854d0e",
        secondaryColor: "#ca8a04",
        underbodyColor: "#422006",
        emissiveColor: "#ef4444",
        emissiveIntensity: 2.4,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 11,
        tier: "Mini-Boss",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Aggressive Berserker",
        hp: 6850,
        attack: 398,
        defense: 265,
        speed: 158,
        critChance: 32,
        aggroRadius: 24,
        attackRange: 2.7,
        xpReward: 2950,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.74,
        torsoHitboxHeight: 1.52,
        lootTags: ["Garra de Hogger", "Collar de Huesos R\xEDo Zarpa", "Hacha Gnoll de Hierro"]
      }
    },
    wow_kobold_candle_geomancer: {
      id: "enemy-wow-kobold-candle-geomancer",
      name: 'Geom\xE1ntico K\xF3bold "\xA1No lleves vela!"',
      title: "Cham\xE1n Cavern\xEDcola con Vela Ardiente en el Cr\xE1neo y Pico R\xFAnico",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_kobold_candle_geomancer",
      helm: "lupine_maw",
      weapon: "arcane_staff",
      offhand: "phylactery_orb",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 0.82,
        torsoBulk: 0.84,
        shoulderWidth: 0.9,
        hornLength: 0.85,
        hornCurve: 0.25,
        pauldronSize: 0.68,
        weaponScale: 0.96,
        dorsalScale: 1.05,
        limbLength: 0.9,
        neckLength: 0.65,
        tailLength: 1.24,
        snoutLength: 1.12,
        headCount: 1,
        auraShardCount: 8,
        furDensity: 1.28,
        hairStyle: "full_fur_coat",
        hairLength: 1.05,
        muscleDefinition: 1.05
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#78350f",
        secondaryColor: "#f59e0b",
        underbodyColor: "#451a03",
        emissiveColor: "#fbbf24",
        emissiveIntensity: 2.85,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 9,
        tier: "Elite",
        element: "Fuego Solar",
        aiBehavior: "Arcane Artillery",
        hp: 3890,
        attack: 285,
        defense: 175,
        speed: 148,
        critChance: 26,
        aggroRadius: 21,
        attackRange: 6.2,
        xpReward: 1680,
        headHitboxRadius: 0.32,
        torsoHitboxRadius: 0.56,
        torsoHitboxHeight: 1.22,
        lootTags: ["Vela Grande de Cera", "Pico de Mina de Jaspe", "Pepita de Oro de Elwynn"]
      }
    },
    wow_quillboar_thornweaver: {
      id: "enemy-wow-quillboar-thornweaver",
      name: "Tejeespinas Jabaesp\xEDn de Rajacieno",
      title: "Guerrero Jabal\xED B\xEDpedo con P\xFAas Dorsales y Colmillos Curvos",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_quillboar_thornweaver",
      helm: "goblin_feral_face",
      weapon: "arcane_staff",
      offhand: "runic_buckler",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.08,
        torsoBulk: 1.22,
        shoulderWidth: 1.24,
        hornLength: 1.18,
        hornCurve: 0.68,
        pauldronSize: 1.12,
        weaponScale: 1.14,
        dorsalScale: 1.56,
        limbLength: 1.02,
        neckLength: 0.72,
        tailLength: 0.55,
        snoutLength: 1.16,
        headCount: 1,
        auraShardCount: 9,
        furDensity: 1.48,
        hairStyle: "dorsal_mohawk",
        hairLength: 1.45,
        muscleDefinition: 1.38
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#7c2d12",
        secondaryColor: "#a16207",
        underbodyColor: "#292524",
        emissiveColor: "#84cc16",
        emissiveIntensity: 2.35,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 16,
        tier: "Elite",
        element: "Veneno",
        aiBehavior: "Aggressive Berserker",
        hp: 8950,
        attack: 448,
        defense: 335,
        speed: 146,
        critChance: 28,
        aggroRadius: 22,
        attackRange: 3.1,
        xpReward: 3680,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.74,
        torsoHitboxHeight: 1.52,
        lootTags: ["Espina de Agamaggan", "Colmillo de Jabaesp\xEDn", "B\xE1culo de Zarzas"]
      }
    },
    wow_defias_pillager_bandit: {
      id: "enemy-wow-defias-pillager-bandit",
      name: "Saqueador de la Hermandad Defias",
      title: "Forajido Enmascarado de P\xE1ramos de Poniente con Dagas y Pirotecnia",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_defias_pillager_bandit",
      helm: "monolith_visor",
      weapon: "venom_scythe_claws",
      offhand: "dual_blade",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.04,
        torsoBulk: 0.98,
        shoulderWidth: 1.12,
        hornLength: 0.35,
        hornCurve: 0.25,
        pauldronSize: 1.04,
        weaponScale: 1.12,
        dorsalScale: 1.24,
        limbLength: 1.06,
        neckLength: 0.78,
        tailLength: 0,
        snoutLength: 0.45,
        headCount: 1,
        auraShardCount: 8,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.22
      },
      materials: {
        preset: "blued_steel",
        ...MATERIAL_PRESETS.blued_steel,
        primaryColor: "#1e293b",
        secondaryColor: "#dc2626",
        underbodyColor: "#0f172a",
        emissiveColor: "#ef4444",
        emissiveIntensity: 2.55,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 15,
        tier: "Elite",
        element: "Fuego Solar",
        aiBehavior: "Ambush Stalker",
        hp: 7620,
        attack: 486,
        defense: 268,
        speed: 176,
        critChance: 38,
        aggroRadius: 24,
        attackRange: 2.6,
        xpReward: 3450,
        headHitboxRadius: 0.32,
        torsoHitboxRadius: 0.66,
        torsoHitboxHeight: 1.48,
        lootTags: ["Pa\xF1uelo de Seda Roja Defias", "Daga de las Minas de la Muerte", "Moneda de VanCleef"]
      }
    },
    wow_furbolg_timbermaw_ursa: {
      id: "enemy-wow-furbolg-timbermaw-ursa",
      name: "Ursa F\xFArbolg Fauces de Madera",
      title: "Coloso Hombre-Oso Cham\xE1nico de Frondavil y Cuna del Invierno",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_furbolg_timbermaw_ursa",
      helm: "lupine_maw",
      weapon: "arcane_staff",
      offhand: "phylactery_orb",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.28,
        torsoBulk: 1.46,
        shoulderWidth: 1.44,
        hornLength: 0.75,
        hornCurve: 0.42,
        pauldronSize: 1.28,
        weaponScale: 1.26,
        dorsalScale: 1.25,
        limbLength: 1.16,
        neckLength: 0.76,
        tailLength: 0.35,
        snoutLength: 1.04,
        headCount: 1,
        auraShardCount: 10,
        furDensity: 1.65,
        hairStyle: "full_fur_coat",
        hairLength: 1.42,
        muscleDefinition: 1.54
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#451a03",
        secondaryColor: "#92400e",
        underbodyColor: "#1c1917",
        emissiveColor: "#34d399",
        emissiveIntensity: 2.35,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 22,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Aggressive Berserker",
        hp: 15800,
        attack: 615,
        defense: 485,
        speed: 132,
        critChance: 26,
        aggroRadius: 23,
        attackRange: 3.1,
        xpReward: 6240,
        headHitboxRadius: 0.42,
        torsoHitboxRadius: 0.9,
        torsoHitboxHeight: 1.76,
        lootTags: ["T\xF3tem Fauces de Madera", "Pelaje de Ursa Ancestral", "Garra de Oso Corrupto"]
      }
    },
    wow_centaur_kolkar_marauder: {
      id: "enemy-wow-centaur-kolkar-marauder",
      name: "Kan Centauro del Clan Kolkar",
      title: "Se\xF1or de la Guerra Ecuestre de Los Bald\xEDos con Alabarda de Viento",
      raceCategory: "warcraft_legends",
      bodyPlan: "quadruped_beast",
      archetype: "wow_centaur_kolkar_marauder",
      helm: "horned_greathelm",
      weapon: "radiant_halberd",
      offhand: "runic_buckler",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.24,
        torsoBulk: 1.22,
        shoulderWidth: 1.3,
        hornLength: 1.15,
        hornCurve: 0.58,
        pauldronSize: 1.28,
        weaponScale: 1.3,
        dorsalScale: 1.26,
        limbLength: 1.2,
        neckLength: 0.94,
        tailLength: 1.38,
        snoutLength: 0.68,
        headCount: 1,
        auraShardCount: 10,
        furDensity: 1.48,
        hairStyle: "wild_mane_fur",
        hairLength: 1.38,
        muscleDefinition: 1.5
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#7c2d12",
        secondaryColor: "#d97706",
        underbodyColor: "#292524",
        emissiveColor: "#f59e0b",
        emissiveIntensity: 2.4,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 19,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Pack Alpha Predator",
        hp: 11850,
        attack: 545,
        defense: 392,
        speed: 178,
        critChance: 31,
        aggroRadius: 25,
        attackRange: 3.4,
        xpReward: 4820,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.82,
        torsoHitboxHeight: 1.66,
        lootTags: ["Brazales del Clan Kolkar", "Lanza de Marat\xF3n", "Pezu\xF1a Herrada de Desolace"]
      }
    },
    wow_harpy_witchwing_slayer: {
      id: "enemy-wow-harpy-witchwing-slayer",
      name: "Matriarca Arp\xEDa Alabruja",
      title: "Reina Alada de Sierra Espol\xF3n con Plumas de Tormenta y Garras",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_harpy_witchwing_slayer",
      helm: "avian_phoenix_beak",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "seraph_wings",
      morphology: {
        heightScale: 1.12,
        torsoBulk: 0.95,
        shoulderWidth: 1.2,
        hornLength: 0.96,
        hornCurve: 0.52,
        pauldronSize: 1.08,
        weaponScale: 1.08,
        dorsalScale: 1.68,
        limbLength: 1.22,
        neckLength: 0.92,
        tailLength: 1.18,
        snoutLength: 0.88,
        headCount: 1,
        auraShardCount: 12,
        furDensity: 1.46,
        hairStyle: "long_flowing_hair",
        hairLength: 1.52,
        muscleDefinition: 1.26
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#4c1d95",
        secondaryColor: "#06b6d4",
        underbodyColor: "#1e1b4b",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.75,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 21,
        tier: "Elite",
        element: "Escarcha",
        aiBehavior: "Aerial Breath Sweeper",
        hp: 12450,
        attack: 598,
        defense: 365,
        speed: 184,
        critChance: 35,
        aggroRadius: 25,
        attackRange: 3,
        xpReward: 5180,
        headHitboxRadius: 0.34,
        torsoHitboxRadius: 0.68,
        torsoHitboxHeight: 1.52,
        lootTags: ["Pluma de Alabruja", "Tal\xF3n de Viento Cortante", "Amuleto de Nido Alto"]
      }
    },
    wow_trogg_stonevault_mauler: {
      id: "enemy-wow-trogg-stonevault-mauler",
      name: "Trogg Rompepiedras de Uldaman",
      title: "Bruto Primitivo Subterr\xE1neo de Piel P\xE9trea y Maza de Excavaci\xF3n",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_trogg_stonevault_mauler",
      helm: "goblin_feral_face",
      weapon: "obsidian_warhammer",
      offhand: "none",
      dorsal: "crystal_pylons",
      morphology: {
        heightScale: 1.18,
        torsoBulk: 1.42,
        shoulderWidth: 1.44,
        hornLength: 0.78,
        hornCurve: 0.44,
        pauldronSize: 1.32,
        weaponScale: 1.34,
        dorsalScale: 1.28,
        limbLength: 1.16,
        neckLength: 0.64,
        tailLength: 0,
        snoutLength: 0.92,
        headCount: 1,
        auraShardCount: 8,
        furDensity: 0,
        hairStyle: "dorsal_mohawk",
        hairLength: 1.15,
        muscleDefinition: 1.62
      },
      materials: {
        preset: "corroded_bronze",
        ...MATERIAL_PRESETS.corroded_bronze,
        primaryColor: "#57534e",
        secondaryColor: "#a8a29e",
        underbodyColor: "#292524",
        emissiveColor: "#f59e0b",
        emissiveIntensity: 2.15,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 24,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Aggressive Berserker",
        hp: 18400,
        attack: 685,
        defense: 590,
        speed: 118,
        critChance: 24,
        aggroRadius: 22,
        attackRange: 2.9,
        xpReward: 7120,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.88,
        torsoHitboxHeight: 1.68,
        lootTags: ["Maza de Piedra de Uldaman", "Tablilla de los Titanes", "Quijada de Trogg"]
      }
    },
    wow_ogre_gordok_magi: {
      id: "enemy-wow-ogre-gordok-magi",
      name: "Rey Gordok, Ogro Mago Bic\xE9falo",
      title: "Soberano de Dos Cabezas de La Masacre con B\xE1culo Arcano y Maza",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_ogre_gordok_magi",
      helm: "goblin_feral_face",
      weapon: "arcane_staff",
      offhand: "phylactery_orb",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.38,
        torsoBulk: 1.52,
        shoulderWidth: 1.48,
        hornLength: 1.05,
        hornCurve: 0.48,
        pauldronSize: 1.42,
        weaponScale: 1.38,
        dorsalScale: 1.32,
        limbLength: 1.16,
        neckLength: 0.74,
        tailLength: 0,
        snoutLength: 0.94,
        headCount: 2,
        auraShardCount: 14,
        furDensity: 0,
        hairStyle: "dorsal_mohawk",
        hairLength: 1.2,
        muscleDefinition: 1.58
      },
      materials: {
        preset: "corroded_bronze",
        ...MATERIAL_PRESETS.corroded_bronze,
        primaryColor: "#9a3412",
        secondaryColor: "#3b82f6",
        underbodyColor: "#431407",
        emissiveColor: "#60a5fa",
        emissiveIntensity: 2.85,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 32,
        tier: "Mini-Boss",
        element: "Arcano",
        aiBehavior: "Boss Multi-Phase",
        hp: 34800,
        attack: 940,
        defense: 720,
        speed: 126,
        critChance: 30,
        aggroRadius: 26,
        attackRange: 5.5,
        xpReward: 12800,
        headHitboxRadius: 0.44,
        torsoHitboxRadius: 0.94,
        torsoHitboxHeight: 1.84,
        lootTags: ["Cetro del Rey Gordok", "Corona Ogra de La Masacre", "Tomo de Magia Bic\xE9fala"]
      }
    },
    wow_orc_warsong_blademaster: {
      id: "enemy-wow-orc-warsong-blademaster",
      name: "Maestro de Espadas Grito de Guerra",
      title: "Campe\xF3n Orco con Estandarte Dorsal del Clan y Gran Espada Ardiente",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_orc_warsong_blademaster",
      helm: "goblin_feral_face",
      weapon: "runic_greatsword",
      offhand: "none",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.24,
        torsoBulk: 1.34,
        shoulderWidth: 1.42,
        hornLength: 0.88,
        hornCurve: 0.48,
        pauldronSize: 1.38,
        weaponScale: 1.46,
        dorsalScale: 1.55,
        limbLength: 1.14,
        neckLength: 0.78,
        tailLength: 0,
        snoutLength: 0.76,
        headCount: 1,
        auraShardCount: 14,
        furDensity: 0,
        hairStyle: "long_flowing_hair",
        hairLength: 1.35,
        muscleDefinition: 1.66
      },
      materials: {
        preset: "corroded_bronze",
        ...MATERIAL_PRESETS.corroded_bronze,
        primaryColor: "#15803d",
        secondaryColor: "#dc2626",
        underbodyColor: "#14532d",
        emissiveColor: "#f97316",
        emissiveIntensity: 3.1,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 40,
        tier: "Mini-Boss",
        element: "Fuego Solar",
        aiBehavior: "Aggressive Berserker",
        hp: 46500,
        attack: 1380,
        defense: 890,
        speed: 178,
        critChance: 42,
        aggroRadius: 27,
        attackRange: 3.6,
        xpReward: 18400,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.86,
        torsoHitboxHeight: 1.76,
        lootTags: ["Estandarte del Clan Filo Ardiente", "Hoja de Viento de Kalimdor", "Cuentas de Guerra de Orgrimmar"]
      }
    },
    wow_tauren_cairne_chieftain: {
      id: "enemy-wow-tauren-cairne-chieftain",
      name: "Gran Jefe Tauren Pezu\xF1a de Sangre",
      title: "Coloso Minotauro de Mulgore con T\xF3tem Dorsal Ancestral y Lanza R\xFAnica",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_tauren_cairne_chieftain",
      helm: "tauren_bull_horns",
      weapon: "radiant_halberd",
      offhand: "none",
      dorsal: "crystal_pylons",
      morphology: {
        heightScale: 1.44,
        torsoBulk: 1.54,
        shoulderWidth: 1.56,
        hornLength: 1.68,
        hornCurve: 0.82,
        pauldronSize: 1.48,
        weaponScale: 1.48,
        dorsalScale: 1.65,
        limbLength: 1.18,
        neckLength: 0.86,
        tailLength: 1.15,
        snoutLength: 1.16,
        headCount: 1,
        auraShardCount: 16,
        furDensity: 1.62,
        hairStyle: "wild_mane_fur",
        hairLength: 1.48,
        muscleDefinition: 1.68
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#451a03",
        secondaryColor: "#dc2626",
        underbodyColor: "#1c1917",
        emissiveColor: "#f59e0b",
        emissiveIntensity: 2.8,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 45,
        tier: "Raid Boss",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Shield Wall Tank",
        hp: 68500,
        attack: 1560,
        defense: 1280,
        speed: 138,
        critChance: 32,
        aggroRadius: 28,
        attackRange: 3.8,
        xpReward: 26500,
        headHitboxRadius: 0.46,
        torsoHitboxRadius: 0.98,
        torsoHitboxHeight: 1.92,
        lootTags: ["Gran T\xF3tem de Cima del Trueno", "Alabarda R\xFAnica Pezu\xF1a de Sangre", "Cuerno de Guerra de Mulgore"]
      }
    },
    wow_troll_gurubashi_berserker: {
      id: "enemy-wow-troll-gurubashi-berserker",
      name: "Berserker Trol del Imperio Gurubashi",
      title: "Guerrero de Zul'Gurub de Grandes Colmillos, Cresta Mohawk y Hachas",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_troll_gurubashi_berserker",
      helm: "goblin_feral_face",
      weapon: "twin_reaver_axes",
      offhand: "dual_blade",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.32,
        torsoBulk: 1.28,
        shoulderWidth: 1.36,
        hornLength: 1.38,
        hornCurve: 0.64,
        pauldronSize: 1.28,
        weaponScale: 1.32,
        dorsalScale: 1.38,
        limbLength: 1.28,
        neckLength: 0.92,
        tailLength: 0,
        snoutLength: 0.94,
        headCount: 1,
        auraShardCount: 12,
        furDensity: 1.22,
        hairStyle: "dorsal_mohawk",
        hairLength: 1.62,
        muscleDefinition: 1.56
      },
      materials: {
        preset: "corroded_bronze",
        ...MATERIAL_PRESETS.corroded_bronze,
        primaryColor: "#0d9488",
        secondaryColor: "#dc2626",
        underbodyColor: "#134e4a",
        emissiveColor: "#10b981",
        emissiveIntensity: 2.65,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 38,
        tier: "Elite",
        element: "Veneno",
        aiBehavior: "Aggressive Berserker",
        hp: 41200,
        attack: 1240,
        defense: 780,
        speed: 168,
        critChance: 36,
        aggroRadius: 26,
        attackRange: 3.2,
        xpReward: 16200,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.82,
        torsoHitboxHeight: 1.78,
        lootTags: ["Colmillo Tallado de Zul'Gurub", "M\xE1scara Vud\xFA de Sangre", "Hacha Arrojadiza Amani"]
      }
    },
    wow_worgen_gilneas_stalker: {
      id: "enemy-wow-worgen-gilneas-stalker",
      name: "Huargen Acechador de Gilneas",
      title: "Lic\xE1ntropo Arist\xF3crata Maldito de Melena Oscura y Garras Lupinas",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_worgen_gilneas_stalker",
      helm: "lupine_maw",
      weapon: "venom_scythe_claws",
      offhand: "dual_blade",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.24,
        torsoBulk: 1.18,
        shoulderWidth: 1.34,
        hornLength: 0.82,
        hornCurve: 0.45,
        pauldronSize: 1.16,
        weaponScale: 1.22,
        dorsalScale: 1.32,
        limbLength: 1.26,
        neckLength: 0.96,
        tailLength: 1.12,
        snoutLength: 1.24,
        headCount: 1,
        auraShardCount: 10,
        furDensity: 1.68,
        hairStyle: "wild_mane_fur",
        hairLength: 1.54,
        muscleDefinition: 1.52
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#1e293b",
        secondaryColor: "#64748b",
        underbodyColor: "#0f172a",
        emissiveColor: "#f59e0b",
        emissiveIntensity: 2.9,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 36,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Ambush Stalker",
        hp: 36800,
        attack: 1290,
        defense: 710,
        speed: 188,
        critChance: 44,
        aggroRadius: 27,
        attackRange: 2.8,
        xpReward: 14900,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.78,
        torsoHitboxHeight: 1.72,
        lootTags: ["Colmillo de la Maldici\xF3n Huargen", "Capa Desgarrada de Gilneas", "Reloj de Bolsillo de Greymane"]
      }
    },
    wow_draenei_vindicator_paladin: {
      id: "enemy-wow-draenei-vindicator-paladin",
      name: "Vindicador Draenei del Exodar",
      title: "Palad\xEDn de Argus con Cuernos Frontales, Pezu\xF1as y Martillo de Cristal Naaru",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_draenei_vindicator_paladin",
      helm: "horned_greathelm",
      weapon: "obsidian_warhammer",
      offhand: "tower_shield",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.32,
        torsoBulk: 1.38,
        shoulderWidth: 1.46,
        hornLength: 1.18,
        hornCurve: 0.62,
        pauldronSize: 1.48,
        weaponScale: 1.38,
        dorsalScale: 1.44,
        limbLength: 1.18,
        neckLength: 0.84,
        tailLength: 1.18,
        snoutLength: 0.48,
        headCount: 1,
        auraShardCount: 16,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.46
      },
      materials: {
        preset: "arcane_crystal",
        ...MATERIAL_PRESETS.arcane_crystal,
        primaryColor: "#3b82f6",
        secondaryColor: "#c084fc",
        underbodyColor: "#1e1b4b",
        emissiveColor: "#e879f9",
        emissiveIntensity: 3.3,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 42,
        tier: "Mini-Boss",
        element: "Arcano",
        aiBehavior: "Shield Wall Tank",
        hp: 54200,
        attack: 1320,
        defense: 1180,
        speed: 142,
        critChance: 30,
        aggroRadius: 26,
        attackRange: 3.2,
        xpReward: 21400,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.88,
        torsoHitboxHeight: 1.82,
        lootTags: ["Martillo de los Naaru", "Sello de Luz de Karabor", "Fragmento de Cristal de Argus"]
      }
    },
    wow_pandaren_shado_master: {
      id: "enemy-wow-pandaren-shado-master",
      name: "Maestro Pandaren del Shado-Pan",
      title: "Guerrero Monje de Pandaria con Pelaje Bicolor y Alabarda de Jade",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_pandaren_shado_master",
      helm: "lupine_maw",
      weapon: "radiant_halberd",
      offhand: "phylactery_orb",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.22,
        torsoBulk: 1.44,
        shoulderWidth: 1.38,
        hornLength: 0.55,
        hornCurve: 0.35,
        pauldronSize: 1.26,
        weaponScale: 1.32,
        dorsalScale: 1.28,
        limbLength: 1.12,
        neckLength: 0.72,
        tailLength: 0.42,
        snoutLength: 0.88,
        headCount: 1,
        auraShardCount: 14,
        furDensity: 1.58,
        hairStyle: "full_fur_coat",
        hairLength: 1.28,
        muscleDefinition: 1.42
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#1e293b",
        secondaryColor: "#f8fafc",
        underbodyColor: "#0f172a",
        emissiveColor: "#10b981",
        emissiveIntensity: 2.75,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 44,
        tier: "Mini-Boss",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Boss Multi-Phase",
        hp: 58900,
        attack: 1440,
        defense: 1090,
        speed: 168,
        critChance: 38,
        aggroRadius: 26,
        attackRange: 3.4,
        xpReward: 23200,
        headHitboxRadius: 0.4,
        torsoHitboxRadius: 0.92,
        torsoHitboxHeight: 1.76,
        lootTags: ["B\xE1culo de Bamb\xFA de Jade", "Barril de Cerveza de Trueno", "Insignia del Shado-Pan"]
      }
    },
    wow_goblin_steamwheedle_shredder: {
      id: "enemy-wow-goblin-steamwheedle-shredder",
      name: "Trituradora Goblin del C\xE1rtel Bonvapor",
      title: "Meca-Armadura de Vapor con Sierra Circular y Reactor de Alquimia",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_goblin_steamwheedle_shredder",
      helm: "goblin_feral_face",
      weapon: "twin_reaver_axes",
      offhand: "runic_buckler",
      dorsal: "crystal_pylons",
      morphology: {
        heightScale: 1.28,
        torsoBulk: 1.48,
        shoulderWidth: 1.52,
        hornLength: 0.95,
        hornCurve: 0.42,
        pauldronSize: 1.54,
        weaponScale: 1.42,
        dorsalScale: 1.52,
        limbLength: 1.16,
        neckLength: 0.58,
        tailLength: 0,
        snoutLength: 0.86,
        headCount: 1,
        auraShardCount: 12,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.38
      },
      materials: {
        preset: "corroded_bronze",
        ...MATERIAL_PRESETS.corroded_bronze,
        primaryColor: "#ca8a04",
        secondaryColor: "#16a34a",
        underbodyColor: "#27272a",
        emissiveColor: "#f97316",
        emissiveIntensity: 3.1,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 35,
        tier: "Elite",
        element: "Fuego Solar",
        aiBehavior: "Aggressive Berserker",
        hp: 39500,
        attack: 1180,
        defense: 920,
        speed: 144,
        critChance: 32,
        aggroRadius: 25,
        attackRange: 3.1,
        xpReward: 15600,
        headHitboxRadius: 0.42,
        torsoHitboxRadius: 0.92,
        torsoHitboxHeight: 1.74,
        lootTags: ["Hoja de Sierra de Trituradora", "Pist\xF3n Hidr\xE1ulico de Kezan", "Dinamita Goblin Inestable"]
      }
    },
    wow_blood_elf_spellbreaker: {
      id: "enemy-wow-blood-elf-spellbreaker",
      name: "Rompehechizos Elfo de Sangre de Lunargenta",
      title: "Guardia Real Sin'dorei con Yelmo Alado de Oro, Guja Doble y Escudo",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_blood_elf_spellbreaker",
      helm: "valkyrie_crest",
      weapon: "radiant_halberd",
      offhand: "tower_shield",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.18,
        torsoBulk: 1.04,
        shoulderWidth: 1.28,
        hornLength: 1.34,
        hornCurve: 0.56,
        pauldronSize: 1.36,
        weaponScale: 1.34,
        dorsalScale: 1.38,
        limbLength: 1.18,
        neckLength: 0.88,
        tailLength: 0,
        snoutLength: 0.44,
        headCount: 1,
        auraShardCount: 14,
        furDensity: 0,
        hairStyle: "long_flowing_hair",
        hairLength: 1.48,
        muscleDefinition: 1.32
      },
      materials: {
        preset: "anisotropic_gold",
        ...MATERIAL_PRESETS.anisotropic_gold,
        primaryColor: "#dc2626",
        secondaryColor: "#fbbf24",
        underbodyColor: "#450a0a",
        emissiveColor: "#10b981",
        emissiveIntensity: 3.2,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 41,
        tier: "Elite",
        element: "Arcano",
        aiBehavior: "Shield Wall Tank",
        hp: 45200,
        attack: 1290,
        defense: 1060,
        speed: 166,
        critChance: 36,
        aggroRadius: 26,
        attackRange: 3.3,
        xpReward: 18900,
        headHitboxRadius: 0.34,
        torsoHitboxRadius: 0.74,
        torsoHitboxHeight: 1.68,
        lootTags: ["Guja de la Fuente del Sol", "Escudo F\xE9nix de Lunargenta", "Cristal de Man\xE1 Vil"]
      }
    },
    wow_night_elf_warden_avatar: {
      id: "enemy-wow-night-elf-warden-avatar",
      name: "Celadora Kaldorei de las B\xF3vedas",
      title: "Justiciera Elfa de la Noche con Manto de Cuchillas Lunares y Umbra",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_night_elf_warden_avatar",
      helm: "valkyrie_crest",
      weapon: "venom_scythe_claws",
      offhand: "runic_buckler",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.22,
        torsoBulk: 1.02,
        shoulderWidth: 1.28,
        hornLength: 1.28,
        hornCurve: 0.72,
        pauldronSize: 1.38,
        weaponScale: 1.36,
        dorsalScale: 1.58,
        limbLength: 1.22,
        neckLength: 0.88,
        tailLength: 0,
        snoutLength: 0.44,
        headCount: 1,
        auraShardCount: 16,
        furDensity: 0,
        hairStyle: "long_flowing_hair",
        hairLength: 1.52,
        muscleDefinition: 1.34
      },
      materials: {
        preset: "blued_steel",
        ...MATERIAL_PRESETS.blued_steel,
        primaryColor: "#1e1b4b",
        secondaryColor: "#10b981",
        underbodyColor: "#090d16",
        emissiveColor: "#34d399",
        emissiveIntensity: 3.1,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 46,
        tier: "Mini-Boss",
        element: "Abisal",
        aiBehavior: "Ambush Stalker",
        hp: 56400,
        attack: 1590,
        defense: 980,
        speed: 192,
        critChance: 45,
        aggroRadius: 28,
        attackRange: 3.2,
        xpReward: 24800,
        headHitboxRadius: 0.34,
        torsoHitboxRadius: 0.74,
        torsoHitboxHeight: 1.72,
        lootTags: ["Guja de Medialuna de Maiev", "Capa de Abanico de Cuchillas", "Sello de las Celadoras"]
      }
    },
    wow_dwarven_mountain_king: {
      id: "enemy-wow-dwarven-mountain-king",
      name: "Rey de la Monta\xF1a de Forjaz",
      title: "Avatar Enano Barbabronce de Acero Tit\xE1nico, Martillo de Tormenta y Hacha",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_dwarven_mountain_king",
      helm: "horned_greathelm",
      weapon: "obsidian_warhammer",
      offhand: "dual_blade",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.08,
        torsoBulk: 1.48,
        shoulderWidth: 1.52,
        hornLength: 1.32,
        hornCurve: 0.68,
        pauldronSize: 1.46,
        weaponScale: 1.38,
        dorsalScale: 1.28,
        limbLength: 0.98,
        neckLength: 0.62,
        tailLength: 0,
        snoutLength: 0.56,
        headCount: 1,
        auraShardCount: 16,
        furDensity: 1.38,
        hairStyle: "wild_mane_fur",
        hairLength: 1.44,
        muscleDefinition: 1.64
      },
      materials: {
        preset: "blued_steel",
        ...MATERIAL_PRESETS.blued_steel,
        primaryColor: "#475569",
        secondaryColor: "#fbbf24",
        underbodyColor: "#1e293b",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 3.25,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 45,
        tier: "Mini-Boss",
        element: "Escarcha",
        aiBehavior: "Shield Wall Tank",
        hp: 64200,
        attack: 1490,
        defense: 1320,
        speed: 136,
        critChance: 34,
        aggroRadius: 26,
        attackRange: 3,
        xpReward: 25600,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.92,
        torsoHitboxHeight: 1.58,
        lootTags: ["Martillo de Descarga de Tormenta", "Yelmo Astado de Khaz Modan", "Lingote de Acero Tit\xE1nico"]
      }
    },
    // --- GRUPO 11C: LA PLAGA Y TRONO HELADO (10 - CATEGORÍA UNDEAD CON HUESOS 3D) ---
    wow_arthas_lich_king: {
      id: "enemy-wow-arthas-lich-king",
      name: "Arthas, El Rey Ex\xE1nime del Trono Helado",
      title: "Soberano de la Plaga con Yelmo de Dominaci\xF3n sobre Cr\xE1neo y Agon\xEDa de Escarcha",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_arthas_lich_king",
      helm: "crowned_skull",
      weapon: "runic_greatsword",
      offhand: "none",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.38,
        torsoBulk: 1.34,
        shoulderWidth: 1.48,
        hornLength: 1.62,
        hornCurve: 0.78,
        pauldronSize: 1.56,
        weaponScale: 1.52,
        dorsalScale: 1.58,
        limbLength: 1.22,
        neckLength: 0.88,
        tailLength: 0,
        snoutLength: 0.56,
        headCount: 1,
        auraShardCount: 28,
        furDensity: 0,
        hairStyle: "long_flowing_hair",
        hairLength: 1.55,
        muscleDefinition: 1.48,
        anatomyCategory: "Undead"
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#1e293b",
        secondaryColor: "#94a3b8",
        underbodyColor: "#090d16",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 4.2,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 60,
        tier: "Raid Boss",
        element: "Escarcha",
        aiBehavior: "Boss Multi-Phase",
        hp: 145e3,
        attack: 2680,
        defense: 1950,
        speed: 162,
        critChance: 46,
        aggroRadius: 34,
        attackRange: 4.2,
        xpReward: 68e3,
        headHitboxRadius: 0.42,
        torsoHitboxRadius: 0.92,
        torsoHitboxHeight: 1.94,
        lootTags: ["Agon\xEDa de Escarcha (Frostmourne)", "Yelmo de Dominaci\xF3n", "Riendas de Invencible"]
      }
    },
    wow_kelthuzad_archlich: {
      id: "enemy-wow-kelthuzad-archlich",
      name: "Archiliche Kel'Thuzad de Naxxramas",
      title: "Se\xF1or Esquel\xE9tico de la Necr\xF3polis Flotante con Cadenas y Filacteria",
      raceCategory: "warcraft_legends",
      bodyPlan: "floating_magical",
      archetype: "wow_kelthuzad_archlich",
      helm: "crowned_skull",
      weapon: "arcane_staff",
      offhand: "phylactery_orb",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.42,
        torsoBulk: 1.08,
        shoulderWidth: 1.44,
        hornLength: 1.58,
        hornCurve: 0.84,
        pauldronSize: 1.52,
        weaponScale: 1.48,
        dorsalScale: 1.68,
        limbLength: 1.32,
        neckLength: 1.02,
        tailLength: 1.25,
        snoutLength: 0.58,
        headCount: 1,
        auraShardCount: 30,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.15,
        anatomyCategory: "Undead"
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e2e8f0",
        secondaryColor: "#3b82f6",
        underbodyColor: "#1e1b4b",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 4,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 58,
        tier: "Raid Boss",
        element: "Escarcha",
        aiBehavior: "Arcane Artillery",
        hp: 118e3,
        attack: 2540,
        defense: 1620,
        speed: 168,
        critChance: 44,
        aggroRadius: 34,
        attackRange: 8.5,
        xpReward: 56e3,
        headHitboxRadius: 0.4,
        torsoHitboxRadius: 0.86,
        torsoHitboxHeight: 1.92,
        lootTags: ["Filacteria de Kel'Thuzad", "Bast\xF3n de la Peste Helada", "Anillo del Culto de los Malditos"]
      }
    },
    wow_lord_marrowgar_bonestorm: {
      id: "enemy-wow-lord-marrowgar-bonestorm",
      name: 'Lord Tu\xE9tano "\xA1Tormenta de Huesos!"',
      title: "Coloso Multicr\xE1neo de Huesos Fusionados y Gran Hacha de M\xE9dula Helada",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_lord_marrowgar_bonestorm",
      helm: "crowned_skull",
      weapon: "twin_reaver_axes",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.48,
        torsoBulk: 1.42,
        shoulderWidth: 1.56,
        hornLength: 1.54,
        hornCurve: 0.72,
        pauldronSize: 1.58,
        weaponScale: 1.56,
        dorsalScale: 1.72,
        limbLength: 1.32,
        neckLength: 0.96,
        tailLength: 1.18,
        snoutLength: 0.68,
        headCount: 3,
        auraShardCount: 24,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.42,
        anatomyCategory: "Undead"
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#f1f5f9",
        secondaryColor: "#94a3b8",
        underbodyColor: "#0f172a",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 3.85,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 55,
        tier: "Raid Boss",
        element: "Escarcha",
        aiBehavior: "Aggressive Berserker",
        hp: 108e3,
        attack: 2290,
        defense: 1740,
        speed: 172,
        critChance: 40,
        aggroRadius: 32,
        attackRange: 4,
        xpReward: 49500,
        headHitboxRadius: 0.46,
        torsoHitboxRadius: 0.96,
        torsoHitboxHeight: 1.98,
        lootTags: ["Mandoble de Ciudadela de Hueso", "P\xFAa Osaria de Lord Tu\xE9tano", "Amuleto de Llama Fr\xEDa"]
      }
    },
    wow_sindragosa_frostbrood_queen: {
      id: "enemy-wow-sindragosa-frostbrood-queen",
      name: "Sindragosa, Reina de los Natoescarcha",
      title: "Dragona Esquel\xE9tica Consorte de Malygos con Costillas Expuestas y Aliento Glacial",
      raceCategory: "warcraft_legends",
      bodyPlan: "dragon_wyvern",
      archetype: "wow_sindragosa_frostbrood_queen",
      helm: "draconic_snout",
      weapon: "frost_breath_maw",
      offhand: "none",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 1.52,
        torsoBulk: 1.38,
        shoulderWidth: 1.54,
        hornLength: 1.68,
        hornCurve: 0.88,
        pauldronSize: 1.42,
        weaponScale: 1.45,
        dorsalScale: 1.88,
        limbLength: 1.28,
        neckLength: 1.58,
        tailLength: 1.85,
        snoutLength: 1.52,
        headCount: 1,
        auraShardCount: 28,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.45,
        anatomyCategory: "Undead"
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e2e8f0",
        secondaryColor: "#38bdf8",
        underbodyColor: "#0f172a",
        emissiveColor: "#7dd3fc",
        emissiveIntensity: 4.1,
        texturePattern: "scales"
      },
      stats: {
        level: 59,
        tier: "Raid Boss",
        element: "Escarcha",
        aiBehavior: "Aerial Breath Sweeper",
        hp: 132e3,
        attack: 2590,
        defense: 1820,
        speed: 176,
        critChance: 42,
        aggroRadius: 35,
        attackRange: 9.2,
        xpReward: 62e3,
        headHitboxRadius: 0.48,
        torsoHitboxRadius: 1.02,
        torsoHitboxHeight: 2.02,
        lootTags: ["Colmillo Impecable de Sindragosa", "Filacteria del Vuelo Azul Ca\xEDdo", "Escama de Escarcha Pura"]
      }
    },
    wow_anubarak_crypt_lord: {
      id: "enemy-wow-anubarak-crypt-lord",
      name: "Anub'arak, El Rey Traidor de Azjol-Nerub",
      title: "Se\xF1or de la Cripta No Muerto con Cuerno de Escarabajo y Costillas Quitinosas",
      raceCategory: "warcraft_legends",
      bodyPlan: "arachnid_scorpion",
      archetype: "wow_anubarak_crypt_lord",
      helm: "arachnid_mandibles",
      weapon: "venom_scythe_claws",
      offhand: "tower_shield",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.42,
        torsoBulk: 1.54,
        shoulderWidth: 1.58,
        hornLength: 1.65,
        hornCurve: 0.78,
        pauldronSize: 1.48,
        weaponScale: 1.44,
        dorsalScale: 1.68,
        limbLength: 1.32,
        neckLength: 0.82,
        tailLength: 1.42,
        snoutLength: 1.18,
        headCount: 1,
        auraShardCount: 22,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.52,
        anatomyCategory: "Undead"
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#312e81",
        secondaryColor: "#d97706",
        underbodyColor: "#0f172a",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 3.5,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 54,
        tier: "Raid Boss",
        element: "Escarcha",
        aiBehavior: "Shield Wall Tank",
        hp: 104e3,
        attack: 2180,
        defense: 1860,
        speed: 152,
        critChance: 36,
        aggroRadius: 30,
        attackRange: 3.8,
        xpReward: 47200,
        headHitboxRadius: 0.44,
        torsoHitboxRadius: 0.98,
        torsoHitboxHeight: 1.88,
        lootTags: ["Caparaz\xF3n Real de Azjol-Nerub", "Cuerno Empalador de Anub'arak", "Orbe de Escarabajo Helado"]
      }
    },
    wow_abomination_patchwerk: {
      id: "enemy-wow-abomination-patchwerk",
      name: "Remendejo, Abominaci\xF3n de Carne y Hueso",
      title: "G\xF3lem Necr\xF3fago Cosido de Naxxramas con Costillas Expuestas y Cuchilla",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_abomination_patchwerk",
      helm: "crowned_skull",
      weapon: "twin_reaver_axes",
      offhand: "dual_blade",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.46,
        torsoBulk: 1.58,
        shoulderWidth: 1.58,
        hornLength: 0.88,
        hornCurve: 0.45,
        pauldronSize: 1.46,
        weaponScale: 1.52,
        dorsalScale: 1.48,
        limbLength: 1.18,
        neckLength: 0.65,
        tailLength: 0,
        snoutLength: 0.72,
        headCount: 1,
        auraShardCount: 18,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.62,
        anatomyCategory: "Undead"
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#65a30d",
        secondaryColor: "#dc2626",
        underbodyColor: "#1a2e05",
        emissiveColor: "#84cc16",
        emissiveIntensity: 3.4,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 52,
        tier: "Raid Boss",
        element: "Veneno",
        aiBehavior: "Aggressive Berserker",
        hp: 112e3,
        attack: 2340,
        defense: 1580,
        speed: 128,
        critChance: 34,
        aggroRadius: 28,
        attackRange: 3.4,
        xpReward: 44800,
        headHitboxRadius: 0.44,
        torsoHitboxRadius: 1.02,
        torsoHitboxHeight: 1.92,
        lootTags: ["Gancho de Carnicero de Remendejo", "Cadena de Bilis de Peste", "Costillar Cosido de Abominaci\xF3n"]
      }
    },
    wow_valkyr_shadowguard: {
      id: "enemy-wow-valkyr-shadowguard",
      name: "Val'kyr Guardiana de las Sombras",
      title: "Doncella Alada No Muerta del Rey Ex\xE1nime con Lanza R\xFAnica y Cr\xE1neo Coronada",
      raceCategory: "warcraft_legends",
      bodyPlan: "floating_magical",
      archetype: "wow_valkyr_shadowguard",
      helm: "valkyrie_crest",
      weapon: "radiant_halberd",
      offhand: "runic_buckler",
      dorsal: "seraph_wings",
      morphology: {
        heightScale: 1.34,
        torsoBulk: 1.02,
        shoulderWidth: 1.34,
        hornLength: 1.48,
        hornCurve: 0.65,
        pauldronSize: 1.36,
        weaponScale: 1.42,
        dorsalScale: 1.84,
        limbLength: 1.28,
        neckLength: 0.94,
        tailLength: 0,
        snoutLength: 0.48,
        headCount: 1,
        auraShardCount: 22,
        furDensity: 0,
        hairStyle: "long_flowing_hair",
        hairLength: 1.56,
        muscleDefinition: 1.24,
        anatomyCategory: "Undead"
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#cbd5e1",
        secondaryColor: "#38bdf8",
        underbodyColor: "#0f172a",
        emissiveColor: "#7dd3fc",
        emissiveIntensity: 3.7,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 50,
        tier: "Mini-Boss",
        element: "Escarcha",
        aiBehavior: "Aerial Breath Sweeper",
        hp: 76500,
        attack: 1940,
        defense: 1380,
        speed: 184,
        critChance: 40,
        aggroRadius: 30,
        attackRange: 4,
        xpReward: 34200,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.78,
        torsoHitboxHeight: 1.82,
        lootTags: ["Pluma Espectral de Val'kyr", "Lanza de Ascensi\xF3n de Rasganorte", "Diadema del Trono Helado"]
      }
    },
    wow_death_knight_ebon_blade: {
      id: "enemy-wow-death-knight-ebon-blade",
      name: "Alto Se\xF1or de la Espada de \xC9bano",
      title: "Caballero de la Muerte de Acherus con Armadura de Calaveras y Mandoble R\xFAnico",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_death_knight_ebon_blade",
      helm: "horned_greathelm",
      weapon: "runic_greatsword",
      offhand: "none",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.32,
        torsoBulk: 1.36,
        shoulderWidth: 1.48,
        hornLength: 1.48,
        hornCurve: 0.74,
        pauldronSize: 1.54,
        weaponScale: 1.48,
        dorsalScale: 1.46,
        limbLength: 1.2,
        neckLength: 0.86,
        tailLength: 0,
        snoutLength: 0.54,
        headCount: 1,
        auraShardCount: 20,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.48,
        anatomyCategory: "Undead"
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#1e293b",
        secondaryColor: "#cbd5e1",
        underbodyColor: "#020617",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 3.65,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 51,
        tier: "Mini-Boss",
        element: "Escarcha",
        aiBehavior: "Aggressive Berserker",
        hp: 82400,
        attack: 2040,
        defense: 1560,
        speed: 156,
        critChance: 40,
        aggroRadius: 29,
        attackRange: 3.6,
        xpReward: 36800,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.88,
        torsoHitboxHeight: 1.84,
        lootTags: ["Hoja R\xFAnica de Acherus", "Sello de Sangre Profana", "Hombreras de Cr\xE1neos de Saronita"]
      }
    },
    wow_forsaken_royal_apothecary: {
      id: "enemy-wow-forsaken-royal-apothecary",
      name: "Gran Boticario Putress de Entra\xF1as",
      title: "Alquimista Real Renegado con Esqueleto Expuesto y Cilindros de Peste",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_forsaken_royal_apothecary",
      helm: "crowned_skull",
      weapon: "arcane_staff",
      offhand: "phylactery_orb",
      dorsal: "crystal_pylons",
      morphology: {
        heightScale: 1.24,
        torsoBulk: 0.96,
        shoulderWidth: 1.28,
        hornLength: 1.18,
        hornCurve: 0.62,
        pauldronSize: 1.34,
        weaponScale: 1.32,
        dorsalScale: 1.58,
        limbLength: 1.22,
        neckLength: 0.94,
        tailLength: 0,
        snoutLength: 0.62,
        headCount: 1,
        auraShardCount: 18,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.18,
        anatomyCategory: "Undead"
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#4c1d95",
        secondaryColor: "#84cc16",
        underbodyColor: "#1e1b4b",
        emissiveColor: "#a3e635",
        emissiveIntensity: 3.75,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 48,
        tier: "Mini-Boss",
        element: "Veneno",
        aiBehavior: "Arcane Artillery",
        hp: 68200,
        attack: 1890,
        defense: 1180,
        speed: 158,
        critChance: 38,
        aggroRadius: 30,
        attackRange: 7.4,
        xpReward: 31500,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.76,
        torsoHitboxHeight: 1.74,
        lootTags: ["Vial de la Nueva Peste", "M\xE1scara de Alquimista de Entra\xF1as", "B\xE1culo de la Puerta de C\xF3lera"]
      }
    },
    wow_banshee_dark_ranger_queen: {
      id: "enemy-wow-banshee-dark-ranger-queen",
      name: "Reina Alma en Pena Brisaveloz",
      title: "Dama Oscura de los Renegados con Arco de Sombra, Carcaj y Flecha Negra",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_banshee_dark_ranger_queen",
      helm: "crowned_skull",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.22,
        torsoBulk: 0.96,
        shoulderWidth: 1.24,
        hornLength: 1.15,
        hornCurve: 0.58,
        pauldronSize: 1.32,
        weaponScale: 1.32,
        dorsalScale: 1.54,
        limbLength: 1.22,
        neckLength: 0.9,
        tailLength: 0,
        snoutLength: 0.44,
        headCount: 1,
        auraShardCount: 24,
        furDensity: 0,
        hairStyle: "long_flowing_hair",
        hairLength: 1.58,
        muscleDefinition: 1.26,
        anatomyCategory: "Undead"
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#312e81",
        secondaryColor: "#94a3b8",
        underbodyColor: "#0f172a",
        emissiveColor: "#c084fc",
        emissiveIntensity: 3.9,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 57,
        tier: "Raid Boss",
        element: "Abisal",
        aiBehavior: "Ambush Stalker",
        hp: 109e3,
        attack: 2480,
        defense: 1520,
        speed: 194,
        critChance: 48,
        aggroRadius: 34,
        attackRange: 6.5,
        xpReward: 54e3,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.74,
        torsoHitboxHeight: 1.74,
        lootTags: ["Flecha Negra de la Dama Oscura", "Manto de Lamento de Banshee", "Daga de Sombra de Quel'Thalas"]
      }
    },
    // --- GRUPO 11D: LA LEGIÓN ARDIENTE Y TERRALLENDE (10) ---
    wow_illidan_betrayer_demonhunter: {
      id: "enemy-wow-illidan-betrayer-demonhunter",
      name: "Illidan Tempestira, El Traidor",
      title: "Se\xF1or de Terrallende con Venda Vil, Cuernos Curvos, Alas y Gujas de Azzinoth",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_illidan_betrayer_demonhunter",
      helm: "tauren_bull_horns",
      weapon: "venom_scythe_claws",
      offhand: "dual_blade",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 1.4,
        torsoBulk: 1.32,
        shoulderWidth: 1.5,
        hornLength: 1.72,
        hornCurve: 1.08,
        pauldronSize: 1.15,
        weaponScale: 1.56,
        dorsalScale: 1.85,
        limbLength: 1.24,
        neckLength: 0.88,
        tailLength: 0,
        snoutLength: 0.48,
        headCount: 1,
        auraShardCount: 28,
        furDensity: 0,
        hairStyle: "long_flowing_hair",
        hairLength: 1.62,
        muscleDefinition: 1.74
      },
      materials: {
        preset: "abyssal_obsidian",
        ...MATERIAL_PRESETS.abyssal_obsidian,
        primaryColor: "#312e81",
        secondaryColor: "#22c55e",
        underbodyColor: "#0f172a",
        emissiveColor: "#4ade80",
        emissiveIntensity: 4.3,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 60,
        tier: "Raid Boss",
        element: "Abisal",
        aiBehavior: "Boss Multi-Phase",
        hp: 142e3,
        attack: 2740,
        defense: 1780,
        speed: 196,
        critChance: 50,
        aggroRadius: 35,
        attackRange: 4.2,
        xpReward: 67500,
        headHitboxRadius: 0.4,
        torsoHitboxRadius: 0.88,
        torsoHitboxHeight: 1.94,
        lootTags: ["Gujas de Guerra de Azzinoth", "Venda Maldita de Sargeras", "Calavera de Gul'dan"]
      }
    },
    wow_mannoroth_pit_lord: {
      id: "enemy-wow-mannoroth-pit-lord",
      name: "Mannoroth, Se\xF1or del Foso Destructor",
      title: "Coloso Demon\xEDaco Cuadr\xFApedo con Colmillos Gigantes y Alabarda Doble Vil",
      raceCategory: "warcraft_legends",
      bodyPlan: "quadruped_beast",
      archetype: "wow_mannoroth_pit_lord",
      helm: "drake_fang_helm",
      weapon: "radiant_halberd",
      offhand: "none",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 1.54,
        torsoBulk: 1.58,
        shoulderWidth: 1.58,
        hornLength: 1.68,
        hornCurve: 0.82,
        pauldronSize: 1.56,
        weaponScale: 1.58,
        dorsalScale: 1.72,
        limbLength: 1.24,
        neckLength: 0.82,
        tailLength: 1.78,
        snoutLength: 1.18,
        headCount: 1,
        auraShardCount: 26,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.72
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#15803d",
        secondaryColor: "#ca8a04",
        underbodyColor: "#052e16",
        emissiveColor: "#4ade80",
        emissiveIntensity: 3.9,
        texturePattern: "scales"
      },
      stats: {
        level: 59,
        tier: "Raid Boss",
        element: "Fuego Drac\xF3nico",
        aiBehavior: "Aggressive Berserker",
        hp: 138e3,
        attack: 2620,
        defense: 1920,
        speed: 146,
        critChance: 40,
        aggroRadius: 34,
        attackRange: 4.5,
        xpReward: 63500,
        headHitboxRadius: 0.48,
        torsoHitboxRadius: 1.06,
        torsoHitboxHeight: 2.02,
        lootTags: ["Colmillo Roto de Mannoroth", "Sangre Hirviente del Foso", "Alabarda del Destructor"]
      }
    },
    wow_archimonde_eredar_warlock: {
      id: "enemy-wow-archimonde-eredar-warlock",
      name: "Archimonde, El Profanador Eredar",
      title: "Comandante Supremo de la Legi\xF3n Ardiente con Corona de Bronce y Fuego Vil",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_archimonde_eredar_warlock",
      helm: "horned_greathelm",
      weapon: "arcane_staff",
      offhand: "phylactery_orb",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.56,
        torsoBulk: 1.48,
        shoulderWidth: 1.58,
        hornLength: 1.66,
        hornCurve: 0.78,
        pauldronSize: 1.64,
        weaponScale: 1.54,
        dorsalScale: 1.78,
        limbLength: 1.28,
        neckLength: 0.9,
        tailLength: 1.38,
        snoutLength: 0.54,
        headCount: 1,
        auraShardCount: 32,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.64
      },
      materials: {
        preset: "abyssal_obsidian",
        ...MATERIAL_PRESETS.abyssal_obsidian,
        primaryColor: "#2563eb",
        secondaryColor: "#fbbf24",
        underbodyColor: "#1e1b4b",
        emissiveColor: "#4ade80",
        emissiveIntensity: 4.15,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 60,
        tier: "Raid Boss",
        element: "Abisal",
        aiBehavior: "Arcane Artillery",
        hp: 148e3,
        attack: 2790,
        defense: 1890,
        speed: 158,
        critChance: 45,
        aggroRadius: 36,
        attackRange: 9,
        xpReward: 69e3,
        headHitboxRadius: 0.46,
        torsoHitboxRadius: 0.98,
        torsoHitboxHeight: 2.06,
        lootTags: ["Grito del Profanador", "Corona Eredar de Argus", "Cenizas del \xC1rbol del Mundo"]
      }
    },
    wow_doomguard_fel_enforcer: {
      id: "enemy-wow-doomguard-fel-enforcer",
      name: "Guardia Apocal\xEDptico de la Legi\xF3n",
      title: "Ejecutor Demon\xEDaco Alado con Placas de Bronce y Mandoble de Fuego Vil",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_doomguard_fel_enforcer",
      helm: "tauren_bull_horns",
      weapon: "runic_greatsword",
      offhand: "none",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 1.38,
        torsoBulk: 1.44,
        shoulderWidth: 1.5,
        hornLength: 1.48,
        hornCurve: 0.74,
        pauldronSize: 1.48,
        weaponScale: 1.46,
        dorsalScale: 1.72,
        limbLength: 1.2,
        neckLength: 0.84,
        tailLength: 1.28,
        snoutLength: 0.72,
        headCount: 1,
        auraShardCount: 18,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.66
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#991b1b",
        secondaryColor: "#ca8a04",
        underbodyColor: "#450a0a",
        emissiveColor: "#4ade80",
        emissiveIntensity: 3.4,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 50,
        tier: "Mini-Boss",
        element: "Fuego Drac\xF3nico",
        aiBehavior: "Aggressive Berserker",
        hp: 84500,
        attack: 2080,
        defense: 1540,
        speed: 158,
        critChance: 38,
        aggroRadius: 30,
        attackRange: 3.8,
        xpReward: 37500,
        headHitboxRadius: 0.42,
        torsoHitboxRadius: 0.92,
        torsoHitboxHeight: 1.88,
        lootTags: ["Mandoble de Maldici\xF3n Apocal\xEDptica", "Cuerno de Se\xF1or Kazzak", "Sello del Trono Ardiente"]
      }
    },
    wow_felguard_legion_axeman: {
      id: "enemy-wow-felguard-legion-axeman",
      name: "Guardia Vil Verdugo de Terrallende",
      title: "Infanter\xEDa de Choque Demon\xEDaca con Espinas Dorsales y Hacha de Guerra",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_felguard_legion_axeman",
      helm: "drake_fang_helm",
      weapon: "twin_reaver_axes",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.28,
        torsoBulk: 1.38,
        shoulderWidth: 1.44,
        hornLength: 1.28,
        hornCurve: 0.62,
        pauldronSize: 1.44,
        weaponScale: 1.44,
        dorsalScale: 1.48,
        limbLength: 1.18,
        neckLength: 0.78,
        tailLength: 0,
        snoutLength: 0.68,
        headCount: 1,
        auraShardCount: 14,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.62
      },
      materials: {
        preset: "blued_steel",
        ...MATERIAL_PRESETS.blued_steel,
        primaryColor: "#dc2626",
        secondaryColor: "#334155",
        underbodyColor: "#450a0a",
        emissiveColor: "#22c55e",
        emissiveIntensity: 3.2,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 44,
        tier: "Elite",
        element: "Abisal",
        aiBehavior: "Aggressive Berserker",
        hp: 58200,
        attack: 1620,
        defense: 1180,
        speed: 154,
        critChance: 36,
        aggroRadius: 27,
        attackRange: 3.4,
        xpReward: 24500,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.88,
        torsoHitboxHeight: 1.78,
        lootTags: ["Segadora de Acero Vil", "Hombreras del Portal Oscuro", "Marca de Sargeras"]
      }
    },
    wow_felhound_mana_stalker: {
      id: "enemy-wow-felhound-mana-stalker",
      name: "Man\xE1fago Devorador de Hechizos",
      title: "Sabueso Demon\xEDaco Cuadr\xFApedo sin Ojos con Tent\xE1culos Dorsales Absorbe-Magia",
      raceCategory: "warcraft_legends",
      bodyPlan: "quadruped_beast",
      archetype: "wow_felhound_mana_stalker",
      helm: "draconic_snout",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "beholder_eye_tentacles",
      morphology: {
        heightScale: 1.04,
        torsoBulk: 1.18,
        shoulderWidth: 1.24,
        hornLength: 1.38,
        hornCurve: 0.82,
        pauldronSize: 0.92,
        weaponScale: 1.15,
        dorsalScale: 1.64,
        limbLength: 1.18,
        neckLength: 0.92,
        tailLength: 1.38,
        snoutLength: 1.28,
        headCount: 1,
        auraShardCount: 14,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.54
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#991b1b",
        secondaryColor: "#7e22ce",
        underbodyColor: "#3b0764",
        emissiveColor: "#4ade80",
        emissiveIntensity: 3.15,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 39,
        tier: "Elite",
        element: "Arcano",
        aiBehavior: "Ambush Stalker",
        hp: 42500,
        attack: 1380,
        defense: 860,
        speed: 186,
        critChance: 40,
        aggroRadius: 28,
        attackRange: 3,
        xpReward: 17800,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.78,
        torsoHitboxHeight: 1.48,
        lootTags: ["Tent\xE1culo Devorador de Man\xE1", "Lengua de bloqueo de Hechizo", "Colmillo Vil"]
      }
    },
    wow_infernal_abyssal_golem: {
      id: "enemy-wow-infernal-abyssal-golem",
      name: "Infernal Abisal de Meteorito Vil",
      title: "Coloso de Roca Volc\xE1nica Animado por Llamas Esmeralda de la Legi\xF3n",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_infernal_abyssal_golem",
      helm: "monolith_visor",
      weapon: "obsidian_warhammer",
      offhand: "none",
      dorsal: "crystal_pylons",
      morphology: {
        heightScale: 1.48,
        torsoBulk: 1.58,
        shoulderWidth: 1.58,
        hornLength: 1.42,
        hornCurve: 0.55,
        pauldronSize: 1.62,
        weaponScale: 1.45,
        dorsalScale: 1.68,
        limbLength: 1.24,
        neckLength: 0.56,
        tailLength: 0,
        snoutLength: 0.52,
        headCount: 1,
        auraShardCount: 28,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.68,
        anatomyCategory: "Elemental"
      },
      materials: {
        preset: "abyssal_obsidian",
        ...MATERIAL_PRESETS.abyssal_obsidian,
        primaryColor: "#27272a",
        secondaryColor: "#16a34a",
        underbodyColor: "#09090b",
        emissiveColor: "#4ade80",
        emissiveIntensity: 4.25,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 53,
        tier: "Mini-Boss",
        element: "Fuego Drac\xF3nico",
        aiBehavior: "Shield Wall Tank",
        hp: 106e3,
        attack: 2190,
        defense: 1940,
        speed: 124,
        critChance: 30,
        aggroRadius: 30,
        attackRange: 3.6,
        xpReward: 46200,
        headHitboxRadius: 0.44,
        torsoHitboxRadius: 1.04,
        torsoHitboxHeight: 1.96,
        lootTags: ["N\xFAcleo de Fuego Vil de Infernal", "Fragmento de Meteoro Abisal", "Piedra de Brujo"]
      }
    },
    wow_shivarra_sixblade_priestess: {
      id: "enemy-wow-shivarra-sixblade-priestess",
      name: "Madre Shahraz, Sacerdotisa Shivarra",
      title: "Demonio de Seis Brazos del Templo Oscuro con Cimitarras Danzantes",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_shivarra_sixblade_priestess",
      helm: "valkyrie_crest",
      weapon: "runic_greatsword",
      offhand: "dual_blade",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.42,
        torsoBulk: 1.12,
        shoulderWidth: 1.44,
        hornLength: 1.42,
        hornCurve: 0.68,
        pauldronSize: 1.36,
        weaponScale: 1.38,
        dorsalScale: 1.62,
        limbLength: 1.32,
        neckLength: 0.96,
        tailLength: 0,
        snoutLength: 0.46,
        headCount: 1,
        auraShardCount: 22,
        furDensity: 0,
        hairStyle: "long_flowing_hair",
        hairLength: 1.54,
        muscleDefinition: 1.38
      },
      materials: {
        preset: "arcane_crystal",
        ...MATERIAL_PRESETS.arcane_crystal,
        primaryColor: "#7e22ce",
        secondaryColor: "#f59e0b",
        underbodyColor: "#2e1065",
        emissiveColor: "#e879f9",
        emissiveIntensity: 3.65,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 54,
        tier: "Raid Boss",
        element: "Abisal",
        aiBehavior: "Aggressive Berserker",
        hp: 98500,
        attack: 2380,
        defense: 1480,
        speed: 188,
        critChance: 46,
        aggroRadius: 32,
        attackRange: 3.8,
        xpReward: 48200,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.84,
        torsoHitboxHeight: 1.9,
        lootTags: ["Cimitarra de Seis Filos Shivarra", "Velo de Atracci\xF3n Fatal", "Brazalete del Aquelarre"]
      }
    },
    wow_nathrezim_dreadlord: {
      id: "enemy-wow-nathrezim-dreadlord",
      name: "Mal'Ganis, Se\xF1or del Terror Nathrezim",
      title: "Maestro Vamp\xEDrico del Enga\xF1o con Cuernos Curvos, Alas y Garras de Sombra",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_nathrezim_dreadlord",
      helm: "tauren_bull_horns",
      weapon: "venom_scythe_claws",
      offhand: "phylactery_orb",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 1.34,
        torsoBulk: 1.28,
        shoulderWidth: 1.44,
        hornLength: 1.56,
        hornCurve: 0.88,
        pauldronSize: 1.46,
        weaponScale: 1.38,
        dorsalScale: 1.78,
        limbLength: 1.22,
        neckLength: 0.86,
        tailLength: 1.15,
        snoutLength: 0.56,
        headCount: 1,
        auraShardCount: 22,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.54
      },
      materials: {
        preset: "abyssal_obsidian",
        ...MATERIAL_PRESETS.abyssal_obsidian,
        primaryColor: "#4c1d95",
        secondaryColor: "#16a34a",
        underbodyColor: "#1e1b4b",
        emissiveColor: "#4ade80",
        emissiveIntensity: 3.6,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 52,
        tier: "Raid Boss",
        element: "Abisal",
        aiBehavior: "Ambush Stalker",
        hp: 94200,
        attack: 2240,
        defense: 1520,
        speed: 178,
        critChance: 42,
        aggroRadius: 31,
        attackRange: 5.5,
        xpReward: 44500,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.86,
        torsoHitboxHeight: 1.86,
        lootTags: ["Garra Vamp\xEDrica de Nathreza", "Manto de Enjambre de Carro\xF1a", "Sello de Stratholme"]
      }
    },
    wow_fel_reaver_construct: {
      id: "enemy-wow-fel-reaver-construct",
      name: "Atracador Vil de Fuego Infernal",
      title: "Tit\xE1n Mec\xE1nico-Demon\xEDaco de la Pen\xEDnsula con Horno de Plasma Esmeralda",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_fel_reaver_construct",
      helm: "monolith_visor",
      weapon: "venom_scythe_claws",
      offhand: "dual_blade",
      dorsal: "crystal_pylons",
      morphology: {
        heightScale: 1.58,
        torsoBulk: 1.56,
        shoulderWidth: 1.6,
        hornLength: 1.38,
        hornCurve: 0.52,
        pauldronSize: 1.68,
        weaponScale: 1.52,
        dorsalScale: 1.76,
        limbLength: 1.34,
        neckLength: 0.58,
        tailLength: 0,
        snoutLength: 0.54,
        headCount: 1,
        auraShardCount: 26,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.52,
        anatomyCategory: "Elemental"
      },
      materials: {
        preset: "corroded_bronze",
        ...MATERIAL_PRESETS.corroded_bronze,
        primaryColor: "#27272a",
        secondaryColor: "#ca8a04",
        underbodyColor: "#09090b",
        emissiveColor: "#4ade80",
        emissiveIntensity: 4.1,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 56,
        tier: "Raid Boss",
        element: "Fuego Drac\xF3nico",
        aiBehavior: "Shield Wall Tank",
        hp: 128e3,
        attack: 2490,
        defense: 2040,
        speed: 138,
        critChance: 34,
        aggroRadius: 36,
        attackRange: 4.4,
        xpReward: 56800,
        headHitboxRadius: 0.48,
        torsoHitboxRadius: 1.08,
        torsoHitboxHeight: 2.08,
        lootTags: ["Pist\xF3n del Atracador Vil", "N\xFAcleo de Forja de la Legi\xF3n", "Placa de Acero Abisal"]
      }
    },
    // --- GRUPO 11E: VUELOS DE DRAGONES, SEÑORES ELEMENTALES Y NAGA (10) ---
    wow_deathwing_cataclysm_aspect: {
      id: "enemy-wow-deathwing-cataclysm-aspect",
      name: "Alamuerte, El Aspecto del Cataclismo",
      title: "Drag\xF3n Negro Colosal con Mand\xEDbula de Hierro y Placas de Elementium Fundido",
      raceCategory: "warcraft_legends",
      bodyPlan: "dragon_wyvern",
      archetype: "wow_deathwing_cataclysm_aspect",
      helm: "draconic_snout",
      weapon: "dragon_breath_maw",
      offhand: "none",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 1.6,
        torsoBulk: 1.6,
        shoulderWidth: 1.6,
        hornLength: 1.78,
        hornCurve: 0.92,
        pauldronSize: 1.65,
        weaponScale: 1.6,
        dorsalScale: 1.9,
        limbLength: 1.32,
        neckLength: 1.56,
        tailLength: 1.9,
        snoutLength: 1.62,
        headCount: 1,
        auraShardCount: 34,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.76
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#18181b",
        secondaryColor: "#ea580c",
        underbodyColor: "#450a0a",
        emissiveColor: "#f97316",
        emissiveIntensity: 4.5,
        texturePattern: "scales",
        textureRelief: 1.38
      },
      stats: {
        level: 60,
        tier: "Raid Boss",
        element: "Fuego Drac\xF3nico",
        aiBehavior: "Aerial Breath Sweeper",
        hp: 165e3,
        attack: 2980,
        defense: 2180,
        speed: 168,
        critChance: 46,
        aggroRadius: 38,
        attackRange: 10.5,
        xpReward: 78e3,
        headHitboxRadius: 0.54,
        torsoHitboxRadius: 1.15,
        torsoHitboxHeight: 2.15,
        lootTags: ["Mand\xEDbula de Elementium de Neltharion", "Escama Fundida del Cataclismo", "Alma de Drag\xF3n"]
      }
    },
    wow_ragnaros_firelord: {
      id: "enemy-wow-ragnaros-firelord",
      name: 'Ragnaros, El Se\xF1or del Fuego "\xA1Purgaos con fuego!"',
      title: "Soberano Elemental de N\xFAcleo de Magma con Corona \xCDgnea y Martillo Sulfuras",
      raceCategory: "warcraft_legends",
      bodyPlan: "floating_magical",
      archetype: "wow_ragnaros_firelord",
      helm: "tauren_bull_horns",
      weapon: "obsidian_warhammer",
      offhand: "none",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.56,
        torsoBulk: 1.54,
        shoulderWidth: 1.6,
        hornLength: 1.72,
        hornCurve: 0.86,
        pauldronSize: 1.66,
        weaponScale: 1.68,
        dorsalScale: 1.82,
        limbLength: 1.28,
        neckLength: 0.78,
        tailLength: 1.48,
        snoutLength: 0.56,
        headCount: 1,
        auraShardCount: 34,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.68,
        anatomyCategory: "Elemental"
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#dc2626",
        secondaryColor: "#f59e0b",
        underbodyColor: "#450a0a",
        emissiveColor: "#fbbf24",
        emissiveIntensity: 4.6,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 60,
        tier: "Raid Boss",
        element: "Fuego Solar",
        aiBehavior: "Boss Multi-Phase",
        hp: 152e3,
        attack: 2890,
        defense: 1960,
        speed: 148,
        critChance: 44,
        aggroRadius: 36,
        attackRange: 8.8,
        xpReward: 72e3,
        headHitboxRadius: 0.48,
        torsoHitboxRadius: 1.06,
        torsoHitboxHeight: 2.08,
        lootTags: ["Sulfuras, Mano de Ragnaros", "Ojo de Sulfuras", "Esencia del Se\xF1or del Fuego"]
      }
    },
    wow_alalor_void_walker: {
      id: "enemy-wow-alalor-void-walker",
      name: "Abisario del Vac\xEDo Abisal",
      title: "Entidad Elemental de Sombra Pura con Brazales R\xFAnicos de Contenci\xF3n",
      raceCategory: "warcraft_legends",
      bodyPlan: "floating_magical",
      archetype: "wow_alalor_void_walker",
      helm: "monolith_visor",
      weapon: "arcane_staff",
      offhand: "phylactery_orb",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.34,
        torsoBulk: 1.52,
        shoulderWidth: 1.56,
        hornLength: 0.92,
        hornCurve: 0.48,
        pauldronSize: 1.54,
        weaponScale: 1.24,
        dorsalScale: 1.56,
        limbLength: 1.22,
        neckLength: 0.54,
        tailLength: 1.22,
        snoutLength: 0.42,
        headCount: 1,
        auraShardCount: 24,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.48,
        anatomyCategory: "Elemental"
      },
      materials: {
        preset: "abyssal_obsidian",
        ...MATERIAL_PRESETS.abyssal_obsidian,
        primaryColor: "#1e1b4b",
        secondaryColor: "#6366f1",
        underbodyColor: "#020617",
        emissiveColor: "#818cf8",
        emissiveIntensity: 3.9,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 43,
        tier: "Elite",
        element: "Abisal",
        aiBehavior: "Shield Wall Tank",
        hp: 62500,
        attack: 1460,
        defense: 1380,
        speed: 134,
        critChance: 28,
        aggroRadius: 26,
        attackRange: 4.5,
        xpReward: 23800,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.96,
        torsoHitboxHeight: 1.84,
        lootTags: ["Brazales de Vinculaci\xF3n del Vac\xEDo", "N\xFAcleo de Sombra Condensada", "Fragmento de Alma"]
      }
    },
    wow_alakir_windlord: {
      id: "enemy-wow-alakir-windlord",
      name: "Al'Akir, El Se\xF1or del Viento",
      title: "Soberano Elemental de C\xE9firo y Rel\xE1mpagos con Cimitarra de Tormenta",
      raceCategory: "warcraft_legends",
      bodyPlan: "floating_magical",
      archetype: "wow_alakir_windlord",
      helm: "valkyrie_crest",
      weapon: "runic_greatsword",
      offhand: "none",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.5,
        torsoBulk: 1.38,
        shoulderWidth: 1.54,
        hornLength: 1.58,
        hornCurve: 0.72,
        pauldronSize: 1.56,
        weaponScale: 1.58,
        dorsalScale: 1.78,
        limbLength: 1.28,
        neckLength: 0.84,
        tailLength: 1.45,
        snoutLength: 0.52,
        headCount: 1,
        auraShardCount: 30,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.56,
        anatomyCategory: "Elemental"
      },
      materials: {
        preset: "arcane_crystal",
        ...MATERIAL_PRESETS.arcane_crystal,
        primaryColor: "#0284c7",
        secondaryColor: "#fbbf24",
        underbodyColor: "#0c4a6e",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 4.1,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 57,
        tier: "Raid Boss",
        element: "Escarcha",
        aiBehavior: "Aerial Breath Sweeper",
        hp: 116e3,
        attack: 2520,
        defense: 1640,
        speed: 196,
        critChance: 44,
        aggroRadius: 35,
        attackRange: 8.2,
        xpReward: 55200,
        headHitboxRadius: 0.42,
        torsoHitboxRadius: 0.94,
        torsoHitboxHeight: 1.98,
        lootTags: ["Trueno Furioso, Espada Bendita del Hijo del Viento", "Corona de los Cuatro Vientos", "Esencia de Cicl\xF3n"]
      }
    },
    wow_neptulon_tidehunter: {
      id: "enemy-wow-neptulon-tidehunter",
      name: "Neptulon, El Cazador de las Mareas",
      title: "Se\xF1or Elemental de los Oc\xE9anos Abisales con Corona de Coral y Tridente",
      raceCategory: "warcraft_legends",
      bodyPlan: "floating_magical",
      archetype: "wow_neptulon_tidehunter",
      helm: "valkyrie_crest",
      weapon: "radiant_halberd",
      offhand: "phylactery_orb",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.48,
        torsoBulk: 1.36,
        shoulderWidth: 1.52,
        hornLength: 1.54,
        hornCurve: 0.68,
        pauldronSize: 1.52,
        weaponScale: 1.54,
        dorsalScale: 1.74,
        limbLength: 1.26,
        neckLength: 0.86,
        tailLength: 1.44,
        snoutLength: 0.52,
        headCount: 1,
        auraShardCount: 28,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.52,
        anatomyCategory: "Elemental"
      },
      materials: {
        preset: "arcane_crystal",
        ...MATERIAL_PRESETS.arcane_crystal,
        primaryColor: "#0369a1",
        secondaryColor: "#2dd4bf",
        underbodyColor: "#082f49",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 3.95,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 56,
        tier: "Raid Boss",
        element: "Escarcha",
        aiBehavior: "Arcane Artillery",
        hp: 114e3,
        attack: 2440,
        defense: 1720,
        speed: 168,
        critChance: 40,
        aggroRadius: 34,
        attackRange: 8,
        xpReward: 53800,
        headHitboxRadius: 0.42,
        torsoHitboxRadius: 0.92,
        torsoHitboxHeight: 1.96,
        lootTags: ["Tridente de las Fauces Abisales", "Agua Eterna de Neptulon", "Perla del Trono de las Mareas"]
      }
    },
    wow_therazane_stonemother: {
      id: "enemy-wow-therazane-stonemother",
      name: "Therazane, La Madre P\xE9trea de Infralar",
      title: "Soberana Elemental de Tierra y Cristales de Geoda con Cetro S\xEDsmico",
      raceCategory: "warcraft_legends",
      bodyPlan: "floating_magical",
      archetype: "wow_therazane_stonemother",
      helm: "horned_greathelm",
      weapon: "obsidian_warhammer",
      offhand: "tower_shield",
      dorsal: "crystal_pylons",
      morphology: {
        heightScale: 1.52,
        torsoBulk: 1.6,
        shoulderWidth: 1.6,
        hornLength: 1.46,
        hornCurve: 0.58,
        pauldronSize: 1.68,
        weaponScale: 1.48,
        dorsalScale: 1.82,
        limbLength: 1.2,
        neckLength: 0.68,
        tailLength: 1.18,
        snoutLength: 0.56,
        headCount: 1,
        auraShardCount: 28,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.64,
        anatomyCategory: "Elemental"
      },
      materials: {
        preset: "arcane_crystal",
        ...MATERIAL_PRESETS.arcane_crystal,
        primaryColor: "#57534e",
        secondaryColor: "#a855f7",
        underbodyColor: "#292524",
        emissiveColor: "#c084fc",
        emissiveIntensity: 3.85,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 56,
        tier: "Raid Boss",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Shield Wall Tank",
        hp: 136e3,
        attack: 2280,
        defense: 2240,
        speed: 118,
        critChance: 32,
        aggroRadius: 33,
        attackRange: 4.2,
        xpReward: 54500,
        headHitboxRadius: 0.46,
        torsoHitboxRadius: 1.12,
        torsoHitboxHeight: 2.02,
        lootTags: ["Cetro de Geoda de Infralar", "Coraz\xF3n de Piedra Inquebrantable", "Gema del Pilar del Mundo"]
      }
    },
    wow_lady_vashj_coilfang_matron: {
      id: "enemy-wow-lady-vashj-coilfang-matron",
      name: "Lady Vashj, Matriarca Colmillo Torcido",
      title: "Reina Naga de Seis Brazos y Cresta de Serpientes con Alabarda de Marea",
      raceCategory: "warcraft_legends",
      bodyPlan: "serpentine_naga",
      archetype: "wow_lady_vashj_coilfang_matron",
      helm: "valkyrie_crest",
      weapon: "radiant_halberd",
      offhand: "phylactery_orb",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.38,
        torsoBulk: 1.16,
        shoulderWidth: 1.42,
        hornLength: 1.48,
        hornCurve: 0.72,
        pauldronSize: 1.38,
        weaponScale: 1.44,
        dorsalScale: 1.72,
        limbLength: 1.24,
        neckLength: 0.96,
        tailLength: 1.86,
        snoutLength: 0.56,
        headCount: 1,
        auraShardCount: 24,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.42
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#0d9488",
        secondaryColor: "#f59e0b",
        underbodyColor: "#134e4a",
        emissiveColor: "#2dd4bf",
        emissiveIntensity: 3.7,
        texturePattern: "scales",
        textureRelief: 1.26
      },
      stats: {
        level: 55,
        tier: "Raid Boss",
        element: "Veneno",
        aiBehavior: "Boss Multi-Phase",
        hp: 108e3,
        attack: 2390,
        defense: 1580,
        speed: 176,
        critChance: 44,
        aggroRadius: 33,
        attackRange: 6.8,
        xpReward: 51200,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.86,
        torsoHitboxHeight: 1.9,
        lootTags: ["Arco de Serpiente de Caverna Santuario", "Vial de la Eternidad de Vashj", "Diadema de Azshara"]
      }
    },
    wow_naga_myrmidon_royal_guard: {
      id: "enemy-wow-naga-myrmidon-royal-guard",
      name: "Mirmid\xF3n Naga de la Guardia Real",
      title: "Guerrero Serpentino de Escamas Abisales, Cresta de Aletas y Tridente",
      raceCategory: "warcraft_legends",
      bodyPlan: "serpentine_naga",
      archetype: "wow_naga_myrmidon_royal_guard",
      helm: "drake_fang_helm",
      weapon: "radiant_halberd",
      offhand: "runic_buckler",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.32,
        torsoBulk: 1.36,
        shoulderWidth: 1.46,
        hornLength: 1.34,
        hornCurve: 0.64,
        pauldronSize: 1.42,
        weaponScale: 1.42,
        dorsalScale: 1.62,
        limbLength: 1.22,
        neckLength: 0.9,
        tailLength: 1.78,
        snoutLength: 0.78,
        headCount: 1,
        auraShardCount: 16,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.62
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#0284c7",
        secondaryColor: "#dc2626",
        underbodyColor: "#0c4a6e",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 3.1,
        texturePattern: "scales",
        textureRelief: 1.28
      },
      stats: {
        level: 43,
        tier: "Elite",
        element: "Escarcha",
        aiBehavior: "Aggressive Berserker",
        hp: 56800,
        attack: 1580,
        defense: 1140,
        speed: 162,
        critChance: 36,
        aggroRadius: 27,
        attackRange: 3.6,
        xpReward: 23400,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.88,
        torsoHitboxHeight: 1.82,
        lootTags: ["Tridente de Marea de Nazjatar", "Escama Real de Mirmid\xF3n", "Concha de Marea Alta"]
      }
    },
    wow_hakkar_soulflayer_loa: {
      id: "enemy-wow-hakkar-soulflayer-loa",
      name: "Hakkar, El Cazador de Almas (Dios de la Sangre)",
      title: "Loa Serpiente Alada de Zul'Gurub con Colmillos de Sangre y Alas Emplumadas",
      raceCategory: "warcraft_legends",
      bodyPlan: "dragon_wyvern",
      archetype: "wow_hakkar_soulflayer_loa",
      helm: "draconic_snout",
      weapon: "dragon_breath_maw",
      offhand: "none",
      dorsal: "seraph_wings",
      morphology: {
        heightScale: 1.48,
        torsoBulk: 1.34,
        shoulderWidth: 1.52,
        hornLength: 1.64,
        hornCurve: 0.84,
        pauldronSize: 1.44,
        weaponScale: 1.42,
        dorsalScale: 1.86,
        limbLength: 1.26,
        neckLength: 1.48,
        tailLength: 1.84,
        snoutLength: 1.42,
        headCount: 1,
        auraShardCount: 26,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.54
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#dc2626",
        secondaryColor: "#0284c7",
        underbodyColor: "#450a0a",
        emissiveColor: "#ef4444",
        emissiveIntensity: 3.95,
        texturePattern: "scales",
        textureRelief: 1.28
      },
      stats: {
        level: 53,
        tier: "Raid Boss",
        element: "Veneno",
        aiBehavior: "Aerial Breath Sweeper",
        hp: 106e3,
        attack: 2320,
        defense: 1560,
        speed: 178,
        critChance: 42,
        aggroRadius: 34,
        attackRange: 8.6,
        xpReward: 48800,
        headHitboxRadius: 0.46,
        torsoHitboxRadius: 0.96,
        torsoHitboxHeight: 1.98,
        lootTags: ["Zin'rokh, Destructora de Mundos", "Coraz\xF3n de Hakkar", "\xC9gida del Dios de la Sangre"]
      }
    },
    wow_chromaggus_chromatic_drake: {
      id: "enemy-wow-chromaggus-chromatic-drake",
      name: "Chromaggus, Bestia Crom\xE1tica de Nefarian",
      title: "Draco Cuadr\xFApedo Bic\xE9falo de Guarida Alanegra con Cinco Alientos de Vuelo",
      raceCategory: "warcraft_legends",
      bodyPlan: "quadruped_beast",
      archetype: "wow_chromaggus_chromatic_drake",
      helm: "draconic_snout",
      weapon: "dragon_breath_maw",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.44,
        torsoBulk: 1.54,
        shoulderWidth: 1.56,
        hornLength: 1.58,
        hornCurve: 0.78,
        pauldronSize: 1.48,
        weaponScale: 1.42,
        dorsalScale: 1.66,
        limbLength: 1.22,
        neckLength: 1.18,
        tailLength: 1.72,
        snoutLength: 1.46,
        headCount: 2,
        auraShardCount: 24,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.68
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#7e22ce",
        secondaryColor: "#dc2626",
        underbodyColor: "#1e1b4b",
        emissiveColor: "#f59e0b",
        emissiveIntensity: 3.8,
        texturePattern: "scales",
        textureRelief: 1.32
      },
      stats: {
        level: 55,
        tier: "Raid Boss",
        element: "Fuego Drac\xF3nico",
        aiBehavior: "Boss Multi-Phase",
        hp: 118e3,
        attack: 2460,
        defense: 1840,
        speed: 152,
        critChance: 40,
        aggroRadius: 33,
        attackRange: 8.4,
        xpReward: 53200,
        headHitboxRadius: 0.46,
        torsoHitboxRadius: 1.04,
        torsoHitboxHeight: 1.94,
        lootTags: ["Garra Crom\xE1tica de Guarida Alanegra", "Caparaz\xF3n de Cinco Vuelos", "Arena de Bronce"]
      }
    },
    // --- GRUPO 11F: DIOSES ANTIGUOS, IMPERIO NEGRO Y BESTIAS DE AZEROTH (10) ---
    wow_cthun_old_god_eye: {
      id: "enemy-wow-cthun-old-god-eye",
      name: "C'Thun, Dios Antiguo de Ahn'Qiraj",
      title: "Entidad C\xF3smica del Imperio Negro con Gran Ojo Abisal y Tent\xE1culos",
      raceCategory: "warcraft_legends",
      bodyPlan: "floating_magical",
      archetype: "wow_cthun_old_god_eye",
      helm: "beholder_cyclops_eye",
      weapon: "dragon_breath_maw",
      offhand: "none",
      dorsal: "beholder_eye_tentacles",
      morphology: {
        heightScale: 1.54,
        torsoBulk: 1.58,
        shoulderWidth: 1.58,
        hornLength: 1.68,
        hornCurve: 0.92,
        pauldronSize: 1.48,
        weaponScale: 1.52,
        dorsalScale: 1.88,
        limbLength: 1.28,
        neckLength: 0.52,
        tailLength: 1.65,
        snoutLength: 0.48,
        headCount: 1,
        auraShardCount: 34,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.45
      },
      materials: {
        preset: "abyssal_obsidian",
        ...MATERIAL_PRESETS.abyssal_obsidian,
        primaryColor: "#581c87",
        secondaryColor: "#f59e0b",
        underbodyColor: "#1e1b4b",
        emissiveColor: "#c084fc",
        emissiveIntensity: 4.4,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 60,
        tier: "Raid Boss",
        element: "Abisal",
        aiBehavior: "Arcane Artillery",
        hp: 156e3,
        attack: 2860,
        defense: 1920,
        speed: 144,
        critChance: 48,
        aggroRadius: 38,
        attackRange: 10,
        xpReward: 74e3,
        headHitboxRadius: 0.56,
        torsoHitboxRadius: 1.12,
        torsoHitboxHeight: 2.06,
        lootTags: ["Ojo de C'Thun", "Cetro del Mar de Dunas", "Guanteletes de Aniquilaci\xF3n Oscura"]
      }
    },
    wow_faceless_kthir_general: {
      id: "enemy-wow-faceless-kthir-general",
      name: "General Vezax, Comandante Ignoto N'raqi",
      title: "Heraldo sin Rostro de Yogg-Saron con Tent\xE1culos Faciales y Maza de Saronita",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_faceless_kthir_general",
      helm: "arachnid_mandibles",
      weapon: "obsidian_warhammer",
      offhand: "phylactery_orb",
      dorsal: "beholder_eye_tentacles",
      morphology: {
        heightScale: 1.44,
        torsoBulk: 1.48,
        shoulderWidth: 1.54,
        hornLength: 1.48,
        hornCurve: 0.84,
        pauldronSize: 1.52,
        weaponScale: 1.48,
        dorsalScale: 1.72,
        limbLength: 1.26,
        neckLength: 0.78,
        tailLength: 0,
        snoutLength: 1.18,
        headCount: 1,
        auraShardCount: 24,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.58
      },
      materials: {
        preset: "abyssal_obsidian",
        ...MATERIAL_PRESETS.abyssal_obsidian,
        primaryColor: "#3b0764",
        secondaryColor: "#0d9488",
        underbodyColor: "#0f172a",
        emissiveColor: "#a855f7",
        emissiveIntensity: 3.8,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 54,
        tier: "Raid Boss",
        element: "Abisal",
        aiBehavior: "Boss Multi-Phase",
        hp: 109e3,
        attack: 2360,
        defense: 1760,
        speed: 148,
        critChance: 40,
        aggroRadius: 32,
        attackRange: 5.2,
        xpReward: 50400,
        headHitboxRadius: 0.44,
        torsoHitboxRadius: 0.98,
        torsoHitboxHeight: 1.94,
        lootTags: ["Martillo de Vapores de Saronita", "\xCDdolo del Ignoto Corrupto", "Sangre de Yogg-Saron"]
      }
    },
    wow_qiraji_prophet_skeram: {
      id: "enemy-wow-qiraji-prophet-skeram",
      name: "El Profeta Skeram del Imperio Qiraji",
      title: "Sumo Sacerdote Insectoide de Ahn'Qiraj con Caparaz\xF3n Real y B\xE1culo",
      raceCategory: "warcraft_legends",
      bodyPlan: "biped_titan",
      archetype: "wow_qiraji_prophet_skeram",
      helm: "arachnid_mandibles",
      weapon: "arcane_staff",
      offhand: "phylactery_orb",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.36,
        torsoBulk: 1.24,
        shoulderWidth: 1.44,
        hornLength: 1.52,
        hornCurve: 0.76,
        pauldronSize: 1.42,
        weaponScale: 1.42,
        dorsalScale: 1.66,
        limbLength: 1.28,
        neckLength: 0.92,
        tailLength: 1.24,
        snoutLength: 1.08,
        headCount: 1,
        auraShardCount: 22,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.46,
        anatomyCategory: "Chitin"
      },
      materials: {
        preset: "anisotropic_gold",
        ...MATERIAL_PRESETS.anisotropic_gold,
        primaryColor: "#7e22ce",
        secondaryColor: "#fbbf24",
        underbodyColor: "#2e1065",
        emissiveColor: "#34d399",
        emissiveIntensity: 3.65,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 52,
        tier: "Raid Boss",
        element: "Arcano",
        aiBehavior: "Arcane Artillery",
        hp: 92400,
        attack: 2280,
        defense: 1480,
        speed: 174,
        critChance: 42,
        aggroRadius: 32,
        attackRange: 7.8,
        xpReward: 44800,
        headHitboxRadius: 0.4,
        torsoHitboxRadius: 0.86,
        torsoHitboxHeight: 1.88,
        lootTags: ["B\xE1culo del Profeta Qiraji", "Escarabajo de Oro de Silithus", "Anillo de la Colmena Real"]
      }
    },
    wow_silithid_colossus_reaver: {
      id: "enemy-wow-silithid-colossus-reaver",
      name: "Ouro y Coloso Sil\xEDtido de Silithus",
      title: "Depredador Ar\xE1cnido-Insectoide Acorazado con Aguij\xF3n y Mand\xEDbulas",
      raceCategory: "warcraft_legends",
      bodyPlan: "arachnid_scorpion",
      archetype: "wow_silithid_colossus_reaver",
      helm: "arachnid_mandibles",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "scorpion_stinger_tail",
      morphology: {
        heightScale: 1.38,
        torsoBulk: 1.48,
        shoulderWidth: 1.54,
        hornLength: 1.46,
        hornCurve: 0.72,
        pauldronSize: 1.42,
        weaponScale: 1.38,
        dorsalScale: 1.74,
        limbLength: 1.34,
        neckLength: 0.76,
        tailLength: 1.68,
        snoutLength: 1.24,
        headCount: 1,
        auraShardCount: 18,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.54,
        anatomyCategory: "Chitin"
      },
      materials: {
        preset: "abyssal_obsidian",
        ...MATERIAL_PRESETS.abyssal_obsidian,
        primaryColor: "#be185d",
        secondaryColor: "#0284c7",
        underbodyColor: "#4c0519",
        emissiveColor: "#f43f5e",
        emissiveIntensity: 3.4,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 49,
        tier: "Mini-Boss",
        element: "Veneno",
        aiBehavior: "Ambush Stalker",
        hp: 78500,
        attack: 2040,
        defense: 1580,
        speed: 172,
        critChance: 38,
        aggroRadius: 30,
        attackRange: 3.8,
        xpReward: 36400,
        headHitboxRadius: 0.42,
        torsoHitboxRadius: 0.94,
        torsoHitboxHeight: 1.82,
        lootTags: ["Caparaz\xF3n Intacto de Sil\xEDtido", "Aguij\xF3n de la Reina de la Colmena", "Quitina de Ahn'Qiraj"]
      }
    },
    wow_core_hound_magmadar: {
      id: "enemy-wow-core-hound-magmadar",
      name: "Magmadar, Can del N\xFAcleo Bic\xE9falo",
      title: "Sabueso Volc\xE1nico de Dos Cabezas de N\xFAcleo de Magma con Aliento de Lava",
      raceCategory: "warcraft_legends",
      bodyPlan: "quadruped_beast",
      archetype: "wow_core_hound_magmadar",
      helm: "draconic_snout",
      weapon: "dragon_breath_maw",
      offhand: "none",
      dorsal: "crystal_pylons",
      morphology: {
        heightScale: 1.38,
        torsoBulk: 1.52,
        shoulderWidth: 1.54,
        hornLength: 1.48,
        hornCurve: 0.72,
        pauldronSize: 1.42,
        weaponScale: 1.38,
        dorsalScale: 1.62,
        limbLength: 1.22,
        neckLength: 1.04,
        tailLength: 1.36,
        snoutLength: 1.38,
        headCount: 2,
        auraShardCount: 22,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.72
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#b91c1c",
        secondaryColor: "#f97316",
        underbodyColor: "#450a0a",
        emissiveColor: "#fbbf24",
        emissiveIntensity: 3.9,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 52,
        tier: "Raid Boss",
        element: "Fuego Drac\xF3nico",
        aiBehavior: "Pack Alpha Predator",
        hp: 98400,
        attack: 2260,
        defense: 1620,
        speed: 168,
        critChance: 40,
        aggroRadius: 32,
        attackRange: 6.2,
        xpReward: 45200,
        headHitboxRadius: 0.44,
        torsoHitboxRadius: 0.98,
        torsoHitboxHeight: 1.88,
        lootTags: ["Diente de Can del N\xFAcleo", "Piel de Cuero del N\xFAcleo", "Correa de Magmadar"]
      }
    },
    wow_devilsaur_king_mosh: {
      id: "enemy-wow-devilsaur-king-mosh",
      name: "Rey Mosh, Demosaurio Tirano de Un'Goro",
      title: "Coloso Tiranosaurio de Escamas Carmes\xEDes y Mand\xEDbulas Trituradoras",
      raceCategory: "warcraft_legends",
      bodyPlan: "dragon_wyvern",
      archetype: "wow_devilsaur_king_mosh",
      helm: "draconic_snout",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.48,
        torsoBulk: 1.54,
        shoulderWidth: 1.48,
        hornLength: 1.28,
        hornCurve: 0.62,
        pauldronSize: 1.18,
        weaponScale: 1.44,
        dorsalScale: 1.52,
        limbLength: 1.34,
        neckLength: 1.28,
        tailLength: 1.84,
        snoutLength: 1.58,
        headCount: 1,
        auraShardCount: 16,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.74
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#991b1b",
        secondaryColor: "#f59e0b",
        underbodyColor: "#450a0a",
        emissiveColor: "#ef4444",
        emissiveIntensity: 3.1,
        texturePattern: "scales",
        textureRelief: 1.34
      },
      stats: {
        level: 48,
        tier: "Mini-Boss",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Aggressive Berserker",
        hp: 86500,
        attack: 2140,
        defense: 1490,
        speed: 164,
        critChance: 42,
        aggroRadius: 32,
        attackRange: 4,
        xpReward: 38200,
        headHitboxRadius: 0.48,
        torsoHitboxRadius: 1.02,
        torsoHitboxHeight: 1.96,
        lootTags: ["Cuero de Demosaurio", "Diente del Rey Mosh", "Garra de Cr\xE1ter de Un'Goro"]
      }
    },
    wow_kodo_ancient_warbeast: {
      id: "enemy-wow-kodo-ancient-warbeast",
      name: "Gran Bestia Kodo de Guerra de Mulgore",
      title: "Behemoth Cuadr\xFApedo Acorazado con Gran Cuerno Nasal y Tambores de la Horda",
      raceCategory: "warcraft_legends",
      bodyPlan: "quadruped_beast",
      archetype: "wow_kodo_ancient_warbeast",
      helm: "tauren_bull_horns",
      weapon: "ram_charge",
      offhand: "none",
      dorsal: "crystal_pylons",
      morphology: {
        heightScale: 1.38,
        torsoBulk: 1.58,
        shoulderWidth: 1.56,
        hornLength: 1.62,
        hornCurve: 0.76,
        pauldronSize: 1.46,
        weaponScale: 1.38,
        dorsalScale: 1.58,
        limbLength: 1.12,
        neckLength: 0.78,
        tailLength: 1.34,
        snoutLength: 1.32,
        headCount: 1,
        auraShardCount: 12,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.68
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#57534e",
        secondaryColor: "#b45309",
        underbodyColor: "#292524",
        emissiveColor: "#f59e0b",
        emissiveIntensity: 2.6,
        texturePattern: "scales",
        textureRelief: 1.24
      },
      stats: {
        level: 37,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Shield Wall Tank",
        hp: 52400,
        attack: 1260,
        defense: 1280,
        speed: 128,
        critChance: 26,
        aggroRadius: 25,
        attackRange: 3.4,
        xpReward: 19400,
        headHitboxRadius: 0.44,
        torsoHitboxRadius: 1.04,
        torsoHitboxHeight: 1.82,
        lootTags: ["Tambores de Guerra de Kodo", "Cuerno de Marfil de Los Bald\xEDos", "Pellejo Grueso de Mulgore"]
      }
    },
    wow_Frostsaber_winterspring_alpha: {
      id: "enemy-wow-frostsaber-winterspring-alpha",
      name: "Shy-Rotam, Sable de Hielo Alfa",
      title: "Tigre Dientes de Sable de Cuna del Invierno con Pelaje Boreal y Colmillos",
      raceCategory: "warcraft_legends",
      bodyPlan: "quadruped_beast",
      archetype: "wow_Frostsaber_winterspring_alpha",
      helm: "lupine_maw",
      weapon: "leap_fang_bite",
      offhand: "none",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.16,
        torsoBulk: 1.26,
        shoulderWidth: 1.34,
        hornLength: 1.48,
        hornCurve: 0.68,
        pauldronSize: 1.12,
        weaponScale: 1.26,
        dorsalScale: 1.24,
        limbLength: 1.24,
        neckLength: 0.92,
        tailLength: 1.48,
        snoutLength: 1.22,
        headCount: 1,
        auraShardCount: 14,
        furDensity: 1.72,
        hairStyle: "wild_mane_fur",
        hairLength: 1.48,
        muscleDefinition: 1.62
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#f8fafc",
        secondaryColor: "#38bdf8",
        underbodyColor: "#0f172a",
        emissiveColor: "#7dd3fc",
        emissiveIntensity: 3.1,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 44,
        tier: "Mini-Boss",
        element: "Escarcha",
        aiBehavior: "Ambush Stalker",
        hp: 58400,
        attack: 1720,
        defense: 1020,
        speed: 194,
        critChance: 46,
        aggroRadius: 29,
        attackRange: 3.2,
        xpReward: 25400,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.82,
        torsoHitboxHeight: 1.62,
        lootTags: ["Riendas del Sable de Hielo de Cuna del Invierno", "Colmillo de Sable Boreal", "Pelaje Rayado Glacial"]
      }
    },
    wow_magnataur_northrend_behemoth: {
      id: "enemy-wow-magnataur-northrend-behemoth",
      name: "Grom'thar, Magnatauro Coloso de Rasganorte",
      title: "Tit\xE1n Centauro-Mamut Peludo con Colmillos de Marfil y Maza Glacial",
      raceCategory: "warcraft_legends",
      bodyPlan: "quadruped_beast",
      archetype: "wow_magnataur_northrend_behemoth",
      helm: "tauren_bull_horns",
      weapon: "obsidian_warhammer",
      offhand: "runic_buckler",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.52,
        torsoBulk: 1.58,
        shoulderWidth: 1.58,
        hornLength: 1.74,
        hornCurve: 0.86,
        pauldronSize: 1.54,
        weaponScale: 1.54,
        dorsalScale: 1.56,
        limbLength: 1.24,
        neckLength: 0.88,
        tailLength: 1.18,
        snoutLength: 1.18,
        headCount: 1,
        auraShardCount: 20,
        furDensity: 1.68,
        hairStyle: "wild_mane_fur",
        hairLength: 1.56,
        muscleDefinition: 1.72
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#451a03",
        secondaryColor: "#f1f5f9",
        underbodyColor: "#1c1917",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 3.15,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 51,
        tier: "Mini-Boss",
        element: "Escarcha",
        aiBehavior: "Aggressive Berserker",
        hp: 94500,
        attack: 2180,
        defense: 1680,
        speed: 142,
        critChance: 36,
        aggroRadius: 30,
        attackRange: 4,
        xpReward: 42500,
        headHitboxRadius: 0.46,
        torsoHitboxRadius: 1.04,
        torsoHitboxHeight: 1.98,
        lootTags: ["Colmillo de Mamut de Magnatauro", "Gran Maza de Tundra Boreal", "Cintur\xF3n de Gigante de Hielo"]
      }
    },
    wow_void_lord_dimensius: {
      id: "enemy-wow-void-lord-dimensius",
      name: "Dimensius, El Devorador de Mundos",
      title: "Se\xF1or Supremo del Vac\xEDo Astral con Singularidad C\xF3smica y Fragmentos Estelares",
      raceCategory: "warcraft_legends",
      bodyPlan: "floating_magical",
      archetype: "wow_void_lord_dimensius",
      helm: "monolith_visor",
      weapon: "arcane_staff",
      offhand: "phylactery_orb",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.58,
        torsoBulk: 1.56,
        shoulderWidth: 1.6,
        hornLength: 1.64,
        hornCurve: 0.82,
        pauldronSize: 1.66,
        weaponScale: 1.56,
        dorsalScale: 1.88,
        limbLength: 1.32,
        neckLength: 0.78,
        tailLength: 1.48,
        snoutLength: 0.48,
        headCount: 1,
        auraShardCount: 36,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.58,
        anatomyCategory: "Elemental"
      },
      materials: {
        preset: "arcane_crystal",
        ...MATERIAL_PRESETS.arcane_crystal,
        primaryColor: "#1e1b4b",
        secondaryColor: "#a855f7",
        underbodyColor: "#020617",
        emissiveColor: "#c084fc",
        emissiveIntensity: 4.5,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 60,
        tier: "Raid Boss",
        element: "Abisal",
        aiBehavior: "Arcane Artillery",
        hp: 158e3,
        attack: 2920,
        defense: 1940,
        speed: 164,
        critChance: 48,
        aggroRadius: 38,
        attackRange: 9.8,
        xpReward: 75e3,
        headHitboxRadius: 0.48,
        torsoHitboxRadius: 1.06,
        torsoHitboxHeight: 2.08,
        lootTags: ["Fragmento de K'aresh Devorado", "Corona del Se\xF1or del Vac\xEDo", "Orbe de Entrop\xEDa Estelar"]
      }
    },
    // =========================================================================================
    // 12. DIEZ ARQUEROS ESQUELETO DE DISTINTOS NIVELES (NV. 4 A NV. 60) QUE DISPARAN FLECHAS 3D
    // =========================================================================================
    undead_archer_1_bone_scout: {
      id: "enemy-undead-archer-1-bone-scout",
      name: "Arquero Esqueleto Explorador de Cripta",
      title: "Tirador \xD3seo de Nivel Inicial con Arco de Costilla y Flechas de Pedernal (Nv. 4)",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "undead_archer_1_bone_scout",
      helm: "crowned_skull",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "none",
      morphology: {
        heightScale: 0.94,
        torsoBulk: 0.84,
        shoulderWidth: 0.98,
        hornLength: 0.45,
        hornCurve: 0.32,
        pauldronSize: 0.78,
        weaponScale: 1.02,
        dorsalScale: 0.95,
        limbLength: 1.05,
        neckLength: 0.92,
        tailLength: 0,
        snoutLength: 0.52,
        headCount: 1,
        auraShardCount: 4,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.05,
        anatomyCategory: "Undead"
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e7e5e4",
        secondaryColor: "#78716c",
        underbodyColor: "#1c1917",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 2.1,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 4,
        tier: "Minion",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Arcane Artillery",
        hp: 1650,
        attack: 148,
        defense: 96,
        speed: 152,
        critChance: 24,
        aggroRadius: 24,
        attackRange: 8.5,
        xpReward: 520,
        headHitboxRadius: 0.32,
        torsoHitboxRadius: 0.58,
        torsoHitboxHeight: 1.42,
        lootTags: ["Arco Corto de F\xE9mur", "Carcaj de Flechas de Hueso", "Falange de Arquero"]
      }
    },
    undead_archer_2_barrow_bowman: {
      id: "enemy-undead-archer-2-barrow-bowman",
      name: "Flechador Esqueleto de los T\xFAmulos",
      title: "Centinela \xD3seo de las Colinas Funerarias con Arco Recurvo de Bronce (Nv. 10)",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "undead_archer_2_barrow_bowman",
      helm: "crowned_skull",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 0.98,
        torsoBulk: 0.88,
        shoulderWidth: 1.04,
        hornLength: 0.68,
        hornCurve: 0.42,
        pauldronSize: 0.92,
        weaponScale: 1.08,
        dorsalScale: 1.08,
        limbLength: 1.08,
        neckLength: 0.94,
        tailLength: 0,
        snoutLength: 0.54,
        headCount: 1,
        auraShardCount: 6,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.08,
        anatomyCategory: "Undead"
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#d6d3d1",
        secondaryColor: "#b45309",
        underbodyColor: "#1f2937",
        emissiveColor: "#10b981",
        emissiveIntensity: 2.35,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 10,
        tier: "Minion",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Arcane Artillery",
        hp: 4280,
        attack: 285,
        defense: 184,
        speed: 158,
        critChance: 27,
        aggroRadius: 26,
        attackRange: 9.2,
        xpReward: 1450,
        headHitboxRadius: 0.33,
        torsoHitboxRadius: 0.62,
        torsoHitboxHeight: 1.48,
        lootTags: ["Arco de Bronce Oxidado", "Flecha con Punta de T\xFAmulo", "Cr\xE1neo de Flechador"]
      }
    },
    undead_archer_3_poison_rib_hunter: {
      id: "enemy-undead-archer-3-poison-rib-hunter",
      name: "Cazador \xD3seo de Flecha Ponzo\xF1osa",
      title: "Arquero Esqueleto de la Ci\xE9naga con Saetas Impregnadas en Veneno (Nv. 16)",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "undead_archer_3_poison_rib_hunter",
      helm: "crowned_skull",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.04,
        torsoBulk: 0.9,
        shoulderWidth: 1.08,
        hornLength: 0.86,
        hornCurve: 0.54,
        pauldronSize: 1.04,
        weaponScale: 1.14,
        dorsalScale: 1.18,
        limbLength: 1.12,
        neckLength: 0.96,
        tailLength: 0,
        snoutLength: 0.55,
        headCount: 1,
        auraShardCount: 10,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.12,
        anatomyCategory: "Undead"
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#d9f99d",
        secondaryColor: "#3f6212",
        underbodyColor: "#14532d",
        emissiveColor: "#84cc16",
        emissiveIntensity: 2.75,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 16,
        tier: "Elite",
        element: "Veneno",
        aiBehavior: "Ambush Stalker",
        hp: 8640,
        attack: 482,
        defense: 295,
        speed: 168,
        critChance: 32,
        aggroRadius: 27,
        attackRange: 9.8,
        xpReward: 3420,
        headHitboxRadius: 0.34,
        torsoHitboxRadius: 0.65,
        torsoHitboxHeight: 1.54,
        lootTags: ["Arco de Costilla Venenosa", "Flechas de Bilis Necr\xF3tica", "Carcaj de Quitina de Pantano"]
      }
    },
    undead_archer_4_watchtower_longbow: {
      id: "enemy-undead-archer-4-watchtower-longbow",
      name: "Arquero Largo de la Atalaya Maldita",
      title: "Vig\xEDa Esqueleto Coronado de Largo Alcance con Arco de Asedio (Nv. 22)",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "undead_archer_4_watchtower_longbow",
      helm: "crowned_skull",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.1,
        torsoBulk: 0.94,
        shoulderWidth: 1.14,
        hornLength: 1.02,
        hornCurve: 0.48,
        pauldronSize: 1.16,
        weaponScale: 1.24,
        dorsalScale: 1.25,
        limbLength: 1.16,
        neckLength: 0.96,
        tailLength: 0,
        snoutLength: 0.56,
        headCount: 1,
        auraShardCount: 12,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.16,
        anatomyCategory: "Undead"
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e2e8f0",
        secondaryColor: "#475569",
        underbodyColor: "#0f172a",
        emissiveColor: "#60a5fa",
        emissiveIntensity: 2.85,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 22,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Arcane Artillery",
        hp: 15400,
        attack: 695,
        defense: 440,
        speed: 164,
        critChance: 34,
        aggroRadius: 30,
        attackRange: 10.6,
        xpReward: 6450,
        headHitboxRadius: 0.35,
        torsoHitboxRadius: 0.68,
        torsoHitboxHeight: 1.62,
        lootTags: ["Arco Largo de la Atalaya", "Flecha Perforacorazas", "Yelmo Coronado de Vig\xEDa"]
      }
    },
    undead_archer_5_frostbone_ranger: {
      id: "enemy-undead-archer-5-frostbone-ranger",
      name: "Guardabosques Esqueleto de Escarcha",
      title: "Francotirador \xD3seo Boreal que Dispara Flechas de Hielo R\xFAnico (Nv. 28)",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "undead_archer_5_frostbone_ranger",
      helm: "crowned_skull",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "crystal_pylons",
      morphology: {
        heightScale: 1.14,
        torsoBulk: 0.96,
        shoulderWidth: 1.18,
        hornLength: 1.16,
        hornCurve: 0.62,
        pauldronSize: 1.22,
        weaponScale: 1.28,
        dorsalScale: 1.34,
        limbLength: 1.18,
        neckLength: 0.98,
        tailLength: 0,
        snoutLength: 0.56,
        headCount: 1,
        auraShardCount: 14,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.2,
        anatomyCategory: "Undead"
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#e0f2fe",
        secondaryColor: "#0284c7",
        underbodyColor: "#082f49",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 3.25,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 28,
        tier: "Elite",
        element: "Escarcha",
        aiBehavior: "Arcane Artillery",
        hp: 24800,
        attack: 940,
        defense: 610,
        speed: 172,
        critChance: 36,
        aggroRadius: 31,
        attackRange: 11.2,
        xpReward: 10800,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.72,
        torsoHitboxHeight: 1.68,
        lootTags: ["Arco de Hueso Escarchado", "Flecha de Car\xE1mbano Letal", "Capa de Ventisca Sepulcral"]
      }
    },
    undead_archer_6_hellfire_ash_marksman: {
      id: "enemy-undead-archer-6-hellfire-ash-marksman",
      name: "Tirador Esqueleto de Ceniza \xCDgnea",
      title: "Artillero \xD3seo Calcinado que Dispara Flechas de Fuego Drac\xF3nico (Nv. 35)",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "undead_archer_6_hellfire_ash_marksman",
      helm: "crowned_skull",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.18,
        torsoBulk: 1.02,
        shoulderWidth: 1.24,
        hornLength: 1.28,
        hornCurve: 0.68,
        pauldronSize: 1.28,
        weaponScale: 1.32,
        dorsalScale: 1.4,
        limbLength: 1.2,
        neckLength: 0.98,
        tailLength: 0,
        snoutLength: 0.58,
        headCount: 1,
        auraShardCount: 16,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.24,
        anatomyCategory: "Undead"
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#44403c",
        secondaryColor: "#ea580c",
        underbodyColor: "#1c1917",
        emissiveColor: "#f97316",
        emissiveIntensity: 3.55,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 35,
        tier: "Elite",
        element: "Fuego Drac\xF3nico",
        aiBehavior: "Arcane Artillery",
        hp: 38500,
        attack: 1290,
        defense: 840,
        speed: 176,
        critChance: 39,
        aggroRadius: 32,
        attackRange: 11.8,
        xpReward: 16900,
        headHitboxRadius: 0.37,
        torsoHitboxRadius: 0.76,
        torsoHitboxHeight: 1.74,
        lootTags: ["Arco de Obsidiana y Hueso Quemado", "Flecha Incendiaria de Magma", "Corona de Brasa Oscura"]
      }
    },
    undead_archer_7_catacomb_sniper_captain: {
      id: "enemy-undead-archer-7-catacomb-sniper-captain",
      name: "Capit\xE1n Francotirador de las Catacumbas",
      title: "Comandante Esqueleto Coronado de Precisi\xF3n Letal y Salto Acrob\xE1tico (Nv. 42)",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "undead_archer_7_catacomb_sniper_captain",
      helm: "crowned_skull",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.24,
        torsoBulk: 1.06,
        shoulderWidth: 1.3,
        hornLength: 1.38,
        hornCurve: 0.74,
        pauldronSize: 1.36,
        weaponScale: 1.38,
        dorsalScale: 1.48,
        limbLength: 1.22,
        neckLength: 1,
        tailLength: 0,
        snoutLength: 0.58,
        headCount: 1,
        auraShardCount: 20,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.28,
        anatomyCategory: "Undead"
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#f5f5f4",
        secondaryColor: "#d97706",
        underbodyColor: "#1e1b4b",
        emissiveColor: "#fbbf24",
        emissiveIntensity: 3.65,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 42,
        tier: "Mini-Boss",
        element: "Fuego Solar",
        aiBehavior: "Ambush Stalker",
        hp: 58400,
        attack: 1680,
        defense: 1120,
        speed: 184,
        critChance: 42,
        aggroRadius: 34,
        attackRange: 12.5,
        xpReward: 26400,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.8,
        torsoHitboxHeight: 1.82,
        lootTags: ["Arco Compuesto Dorado del Capit\xE1n", "Carcaj Real de Catacumba", "Insignia de Punter\xEDa Letal"]
      }
    },
    undead_archer_8_abyssal_soul_bowman: {
      id: "enemy-undead-archer-8-abyssal-soul-bowman",
      name: "Arquero de Almas del Vac\xEDo Abisal",
      title: "Cazador Esqueleto Espectral que Dispara Saetas Devoradoras de Almas (Nv. 48)",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "undead_archer_8_abyssal_soul_bowman",
      helm: "crowned_skull",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.28,
        torsoBulk: 1.08,
        shoulderWidth: 1.34,
        hornLength: 1.48,
        hornCurve: 0.8,
        pauldronSize: 1.42,
        weaponScale: 1.42,
        dorsalScale: 1.56,
        limbLength: 1.24,
        neckLength: 1.02,
        tailLength: 0,
        snoutLength: 0.58,
        headCount: 1,
        auraShardCount: 24,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.32,
        anatomyCategory: "Undead"
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#cbd5e1",
        secondaryColor: "#7e22ce",
        underbodyColor: "#090d16",
        emissiveColor: "#c084fc",
        emissiveIntensity: 3.95,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 48,
        tier: "Mini-Boss",
        element: "Abisal",
        aiBehavior: "Arcane Artillery",
        hp: 76800,
        attack: 2050,
        defense: 1360,
        speed: 188,
        critChance: 45,
        aggroRadius: 35,
        attackRange: 13.2,
        xpReward: 35800,
        headHitboxRadius: 0.39,
        torsoHitboxRadius: 0.84,
        torsoHitboxHeight: 1.88,
        lootTags: ["Arco Astral Tejealmas", "Flecha de Singularidad Abisal", "Corona del Vac\xEDo Necr\xF3tico"]
      }
    },
    undead_archer_9_royal_ossuary_greatbow: {
      id: "enemy-undead-archer-9-royal-ossuary-greatbow",
      name: "Gran Arco Imperial del Osario Real",
      title: "Coloso Arquero Coronado con Arco de Hueso de Drag\xF3n y Lluvia de Saetas (Nv. 54)",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "undead_archer_9_royal_ossuary_greatbow",
      helm: "crowned_skull",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 1.36,
        torsoBulk: 1.18,
        shoulderWidth: 1.42,
        hornLength: 1.58,
        hornCurve: 0.86,
        pauldronSize: 1.5,
        weaponScale: 1.5,
        dorsalScale: 1.64,
        limbLength: 1.26,
        neckLength: 1.04,
        tailLength: 0,
        snoutLength: 0.6,
        headCount: 1,
        auraShardCount: 28,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.38,
        anatomyCategory: "Undead"
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#fef3c7",
        secondaryColor: "#b91c1c",
        underbodyColor: "#18181b",
        emissiveColor: "#f43f5e",
        emissiveIntensity: 4.15,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 54,
        tier: "Raid Boss",
        element: "Fuego Drac\xF3nico",
        aiBehavior: "Boss Multi-Phase",
        hp: 112e3,
        attack: 2490,
        defense: 1680,
        speed: 192,
        critChance: 47,
        aggroRadius: 36,
        attackRange: 14,
        xpReward: 52500,
        headHitboxRadius: 0.41,
        torsoHitboxRadius: 0.9,
        torsoHitboxHeight: 1.96,
        lootTags: ["Gran Arco Imperial de Hueso de Drag\xF3n", "Flecha Real Empaladora", "Diadema Carmes\xED del Osario"]
      }
    },
    undead_archer_10_lich_deadeye_sovereign: {
      id: "enemy-undead-archer-10-lich-deadeye-sovereign",
      name: "Soberano Ojo Muerto del Trono Helado",
      title: "Monarca Esqueleto Supremo de Nivel 60 con Arco Reliquia y Flechas de Escarcha Eterna",
      raceCategory: "undead",
      bodyPlan: "biped_titan",
      archetype: "undead_archer_10_lich_deadeye_sovereign",
      helm: "crowned_skull",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "seraph_wings",
      morphology: {
        heightScale: 1.44,
        torsoBulk: 1.24,
        shoulderWidth: 1.48,
        hornLength: 1.72,
        hornCurve: 0.92,
        pauldronSize: 1.58,
        weaponScale: 1.58,
        dorsalScale: 1.76,
        limbLength: 1.28,
        neckLength: 1.06,
        tailLength: 0,
        snoutLength: 0.62,
        headCount: 1,
        auraShardCount: 34,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.44,
        anatomyCategory: "Undead"
      },
      materials: {
        preset: "ancient_bone",
        ...MATERIAL_PRESETS.ancient_bone,
        primaryColor: "#f8fafc",
        secondaryColor: "#0ea5e9",
        underbodyColor: "#020617",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 4.5,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 60,
        tier: "Raid Boss",
        element: "Escarcha",
        aiBehavior: "Boss Multi-Phase",
        hp: 152e3,
        attack: 2960,
        defense: 1920,
        speed: 204,
        critChance: 52,
        aggroRadius: 40,
        attackRange: 15.5,
        xpReward: 74e3,
        headHitboxRadius: 0.44,
        torsoHitboxRadius: 0.94,
        torsoHitboxHeight: 2.06,
        lootTags: ["Arco Legendario Susurro de la Muerte", "Flecha de Cero Absoluto", "Corona Imperial del Ojo Muerto"]
      }
    },
    // ================= 12. QUINCE ARQUEROS DE DIFERENTES ESPECIES CON ARCO Y FLECHAS 3D (15) =================
    archer_species_1_wood_elf_ranger: {
      id: "enemy-archer-species-1-wood-elf-ranger",
      name: "Guardabosques Elfo Silvano de Lothl\xF3rien",
      title: "Arquero \xC9lfico de Melena Dorada con Arco Recurvo de Hoja Viva (Nv. 6)",
      raceCategory: "humanoids",
      bodyPlan: "biped_titan",
      archetype: "archer_species_1_wood_elf_ranger",
      helm: "valkyrie_crest",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.06,
        torsoBulk: 0.84,
        shoulderWidth: 0.98,
        hornLength: 0.65,
        hornCurve: 0.32,
        pauldronSize: 0.85,
        weaponScale: 1.15,
        dorsalScale: 1.12,
        limbLength: 1.16,
        neckLength: 0.82,
        tailLength: 0,
        snoutLength: 0.42,
        headCount: 1,
        auraShardCount: 4,
        furDensity: 0.95,
        hairStyle: "long_flowing_hair",
        hairLength: 1.35,
        muscleDefinition: 0.92,
        anatomyCategory: "Flesh"
      },
      materials: {
        preset: "anisotropic_gold",
        ...MATERIAL_PRESETS.anisotropic_gold,
        primaryColor: "#14532d",
        secondaryColor: "#d97706",
        underbodyColor: "#052e16",
        emissiveColor: "#4ade80",
        emissiveIntensity: 2.35,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 6,
        tier: "Minion",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Ambush Stalker",
        hp: 1950,
        attack: 165,
        defense: 95,
        speed: 178,
        critChance: 28,
        aggroRadius: 26,
        attackRange: 10.5,
        xpReward: 540,
        headHitboxRadius: 0.31,
        torsoHitboxRadius: 0.56,
        torsoHitboxHeight: 1.48,
        lootTags: ["Arco Silvano de Mallorn", "Flecha con Pluma de Cisne", "Capa \xC9lfica Camuflada"]
      }
    },
    archer_species_2_forest_goblin_bowman: {
      id: "enemy-archer-species-2-forest-goblin-bowman",
      name: "Flechador Trasgo Nocturno del Bosque",
      title: "Arquero Goblin Emboscador con Arco Corto y Saetas de Veneno de Ara\xF1a (Nv. 10)",
      raceCategory: "low_level",
      bodyPlan: "biped_titan",
      archetype: "archer_species_2_forest_goblin_bowman",
      helm: "goblin_feral_face",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 0.82,
        torsoBulk: 0.78,
        shoulderWidth: 0.88,
        hornLength: 0.78,
        hornCurve: 0.25,
        pauldronSize: 0.68,
        weaponScale: 0.98,
        dorsalScale: 0.88,
        limbLength: 0.92,
        neckLength: 0.64,
        tailLength: 0,
        snoutLength: 0.68,
        headCount: 1,
        auraShardCount: 0,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.05,
        anatomyCategory: "Flesh"
      },
      materials: {
        preset: "corroded_bronze",
        ...MATERIAL_PRESETS.corroded_bronze,
        primaryColor: "#3f6212",
        secondaryColor: "#78350f",
        underbodyColor: "#1a2e05",
        emissiveColor: "#84cc16",
        emissiveIntensity: 2.25,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 10,
        tier: "Minion",
        element: "Veneno",
        aiBehavior: "Ambush Stalker",
        hp: 3400,
        attack: 260,
        defense: 145,
        speed: 182,
        critChance: 30,
        aggroRadius: 25,
        attackRange: 9.8,
        xpReward: 1120,
        headHitboxRadius: 0.29,
        torsoHitboxRadius: 0.5,
        torsoHitboxHeight: 1.24,
        lootTags: ["Arco Tosco de Trasgo", "Flecha Untada en Ponzo\xF1a", "Bolsa de Monedas Robadas"]
      }
    },
    archer_species_3_kobold_tunnel_snipe: {
      id: "enemy-archer-species-3-kobold-tunnel-snipe",
      name: "Francotirador K\xF3bold Crin de Rata",
      title: "Arquero K\xF3bold Peludo de las Minas con Arco de Cuerda Tensada (Nv. 14)",
      raceCategory: "low_level",
      bodyPlan: "biped_titan",
      archetype: "archer_species_3_kobold_tunnel_snipe",
      helm: "lupine_maw",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 0.86,
        torsoBulk: 0.84,
        shoulderWidth: 0.92,
        hornLength: 0.56,
        hornCurve: 0.3,
        pauldronSize: 0.72,
        weaponScale: 1.02,
        dorsalScale: 0.86,
        limbLength: 0.94,
        neckLength: 0.68,
        tailLength: 1.05,
        snoutLength: 0.96,
        headCount: 1,
        auraShardCount: 2,
        furDensity: 1.25,
        hairStyle: "full_fur_coat",
        hairLength: 1.1,
        muscleDefinition: 1.08,
        anatomyCategory: "Flesh"
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#78350f",
        secondaryColor: "#d97706",
        underbodyColor: "#291508",
        emissiveColor: "#f59e0b",
        emissiveIntensity: 2.35,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 14,
        tier: "Minion",
        element: "Fuego Drac\xF3nico",
        aiBehavior: "Ambush Stalker",
        hp: 5800,
        attack: 390,
        defense: 230,
        speed: 174,
        critChance: 29,
        aggroRadius: 26,
        attackRange: 10,
        xpReward: 2150,
        headHitboxRadius: 0.3,
        torsoHitboxRadius: 0.54,
        torsoHitboxHeight: 1.32,
        lootTags: ["Arco de Galer\xEDa K\xF3bold", "Flecha con Mecha de Vela", "Pepita de Oro Bruto"]
      }
    },
    archer_species_4_gnoll_poacher_archer: {
      id: "enemy-archer-species-4-gnoll-poacher-archer",
      name: "Cazador Furtivo Gnoll Zarparrabia",
      title: "Arquero Hiena Antropomorfo con Pelaje Denso y Arco de Tend\xF3n Salvaje (Nv. 18)",
      raceCategory: "elite_low_level",
      bodyPlan: "biped_titan",
      archetype: "archer_species_4_gnoll_poacher_archer",
      helm: "lupine_maw",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.08,
        torsoBulk: 1.06,
        shoulderWidth: 1.16,
        hornLength: 0.68,
        hornCurve: 0.34,
        pauldronSize: 1.05,
        weaponScale: 1.18,
        dorsalScale: 1.14,
        limbLength: 1.08,
        neckLength: 0.84,
        tailLength: 0.85,
        snoutLength: 1.12,
        headCount: 1,
        auraShardCount: 6,
        furDensity: 1.42,
        hairStyle: "wild_mane_fur",
        hairLength: 1.28,
        muscleDefinition: 1.24,
        anatomyCategory: "Flesh"
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#854d0e",
        secondaryColor: "#422006",
        underbodyColor: "#1c1917",
        emissiveColor: "#ea580c",
        emissiveIntensity: 2.55,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 18,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Pack Alpha Predator",
        hp: 11200,
        attack: 560,
        defense: 360,
        speed: 170,
        critChance: 32,
        aggroRadius: 28,
        attackRange: 10.6,
        xpReward: 4600,
        headHitboxRadius: 0.34,
        torsoHitboxRadius: 0.68,
        torsoHitboxHeight: 1.58,
        lootTags: ["Arco de Cuerno de Carro\xF1ero", "Flecha Dentada Gnoll", "Crin Manchada de Hiena"]
      }
    },
    archer_species_5_troll_headhunter_bow: {
      id: "enemy-archer-species-5-troll-headhunter-bow",
      name: "Arrancacabezas Trol Lanza Negra con Arco",
      title: "Arquero Trol de la Jungla con Cresta Mohawk, Colmillos y Arco Vud\xFA (Nv. 22)",
      raceCategory: "humanoids",
      bodyPlan: "biped_titan",
      archetype: "archer_species_5_troll_headhunter_bow",
      helm: "drake_fang_helm",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.18,
        torsoBulk: 0.96,
        shoulderWidth: 1.18,
        hornLength: 1.15,
        hornCurve: 0.48,
        pauldronSize: 1.12,
        weaponScale: 1.26,
        dorsalScale: 1.22,
        limbLength: 1.24,
        neckLength: 0.88,
        tailLength: 0,
        snoutLength: 0.62,
        headCount: 1,
        auraShardCount: 8,
        furDensity: 1.2,
        hairStyle: "dorsal_mohawk",
        hairLength: 1.45,
        muscleDefinition: 1.28,
        anatomyCategory: "Flesh"
      },
      materials: {
        preset: "corroded_bronze",
        ...MATERIAL_PRESETS.corroded_bronze,
        primaryColor: "#0e7490",
        secondaryColor: "#dc2626",
        underbodyColor: "#164e63",
        emissiveColor: "#22d3ee",
        emissiveIntensity: 2.75,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 22,
        tier: "Elite",
        element: "Veneno",
        aiBehavior: "Arcane Artillery",
        hp: 16800,
        attack: 740,
        defense: 480,
        speed: 176,
        critChance: 35,
        aggroRadius: 30,
        attackRange: 11.2,
        xpReward: 7400,
        headHitboxRadius: 0.35,
        torsoHitboxRadius: 0.68,
        torsoHitboxHeight: 1.72,
        lootTags: ["Arco Ritual de Zul\u2019Gurub", "Flecha Maldita de Loa", "Amuleto Vud\xFA de Colmillo"]
      }
    },
    archer_species_6_satyr_felbow_trickster: {
      id: "enemy-archer-species-6-satyr-felbow-trickster",
      name: "Arquero S\xE1tiro Lenguavil de Sombra",
      title: "Demonio S\xE1tiro Cornudo con Pezu\xF1as, Pelaje Caprino y Arco de Fuego Vil (Nv. 26)",
      raceCategory: "mythological",
      bodyPlan: "biped_titan",
      archetype: "archer_species_6_satyr_felbow_trickster",
      helm: "tauren_bull_horns",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.12,
        torsoBulk: 1.02,
        shoulderWidth: 1.16,
        hornLength: 1.38,
        hornCurve: 0.88,
        pauldronSize: 1.08,
        weaponScale: 1.24,
        dorsalScale: 1.2,
        limbLength: 1.16,
        neckLength: 0.84,
        tailLength: 1.12,
        snoutLength: 0.58,
        headCount: 1,
        auraShardCount: 12,
        furDensity: 1.35,
        hairStyle: "wild_mane_fur",
        hairLength: 1.32,
        muscleDefinition: 1.26,
        anatomyCategory: "Flesh"
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#4c1d95",
        secondaryColor: "#16a34a",
        underbodyColor: "#1e1b4b",
        emissiveColor: "#4ade80",
        emissiveIntensity: 3.1,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 26,
        tier: "Elite",
        element: "Abisal",
        aiBehavior: "Ambush Stalker",
        hp: 22400,
        attack: 890,
        defense: 580,
        speed: 180,
        critChance: 37,
        aggroRadius: 31,
        attackRange: 11.4,
        xpReward: 9800,
        headHitboxRadius: 0.36,
        torsoHitboxRadius: 0.7,
        torsoHitboxHeight: 1.66,
        lootTags: ["Arco Retorcido de Xavius", "Saeta de Corrupci\xF3n Vil", "Cuerno de S\xE1tiro Grabado"]
      }
    },
    archer_species_7_centaur_khan_horsebow: {
      id: "enemy-archer-species-7-centaur-khan-horsebow",
      name: "Arquero Ecuestre Centauro del Clan Kolkar",
      title: "Cazador Centauro Cuadr\xFApedo que Tensa el Arco a la Altura de la Nariz al Galope (Nv. 30)",
      raceCategory: "mythological",
      bodyPlan: "quadruped_beast",
      archetype: "archer_species_7_centaur_khan_horsebow",
      helm: "horned_greathelm",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.22,
        torsoBulk: 1.12,
        shoulderWidth: 1.24,
        hornLength: 0.96,
        hornCurve: 0.54,
        pauldronSize: 1.18,
        weaponScale: 1.32,
        dorsalScale: 1.28,
        limbLength: 1.18,
        neckLength: 0.86,
        tailLength: 1.35,
        snoutLength: 0.48,
        headCount: 1,
        auraShardCount: 12,
        furDensity: 1.28,
        hairStyle: "wild_mane_fur",
        hairLength: 1.3,
        muscleDefinition: 1.32,
        anatomyCategory: "Flesh"
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#92400e",
        secondaryColor: "#fbbf24",
        underbodyColor: "#451a03",
        emissiveColor: "#f59e0b",
        emissiveIntensity: 2.85,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 30,
        tier: "Elite",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Arcane Artillery",
        hp: 29500,
        attack: 1080,
        defense: 720,
        speed: 196,
        critChance: 38,
        aggroRadius: 34,
        attackRange: 12.2,
        xpReward: 13200,
        headHitboxRadius: 0.37,
        torsoHitboxRadius: 0.82,
        torsoHitboxHeight: 1.78,
        lootTags: ["Arco Compuesto de las Estepas", "Carcaj de Cuero de Kodo", "Estribo de Bronce del Khan"]
      }
    },
    archer_species_8_lizardfolk_scale_sniper: {
      id: "enemy-archer-species-8-lizardfolk-scale-sniper",
      name: "Francotirador Saurio Escama Sangrienta",
      title: "Arquero Reptiliano Escamoso del Pantano con Arco de Colmillo de Hidra (Nv. 34)",
      raceCategory: "air_water_ice",
      bodyPlan: "biped_titan",
      archetype: "archer_species_8_lizardfolk_scale_sniper",
      helm: "draconic_snout",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.16,
        torsoBulk: 1.06,
        shoulderWidth: 1.2,
        hornLength: 1.08,
        hornCurve: 0.42,
        pauldronSize: 1.16,
        weaponScale: 1.28,
        dorsalScale: 1.32,
        limbLength: 1.14,
        neckLength: 0.92,
        tailLength: 1.48,
        snoutLength: 1.18,
        headCount: 1,
        auraShardCount: 14,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.3,
        anatomyCategory: "Scaled"
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#065f46",
        secondaryColor: "#dc2626",
        underbodyColor: "#022c22",
        emissiveColor: "#10b981",
        emissiveIntensity: 2.95,
        texturePattern: "scales"
      },
      stats: {
        level: 34,
        tier: "Elite",
        element: "Veneno",
        aiBehavior: "Ambush Stalker",
        hp: 36400,
        attack: 1240,
        defense: 860,
        speed: 178,
        critChance: 39,
        aggroRadius: 32,
        attackRange: 11.8,
        xpReward: 16200,
        headHitboxRadius: 0.37,
        torsoHitboxRadius: 0.74,
        torsoHitboxHeight: 1.72,
        lootTags: ["Arco Escamoso de Saurio", "Flecha Neurot\xF3xica de Pantano", "Escama Dorsal Carmes\xED"]
      }
    },
    archer_species_9_orc_wolf_master_bowman: {
      id: "enemy-archer-species-9-orc-wolf-master-bowman",
      name: "Maestro Arquero Orco Grito de Guerra",
      title: "Veterano Orco de Asedio con Arco Pesado de Acero Negro y Flechas Perforacorazas (Nv. 38)",
      raceCategory: "humanoids",
      bodyPlan: "biped_titan",
      archetype: "archer_species_9_orc_wolf_master_bowman",
      helm: "drake_fang_helm",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.22,
        torsoBulk: 1.24,
        shoulderWidth: 1.36,
        hornLength: 1.18,
        hornCurve: 0.56,
        pauldronSize: 1.38,
        weaponScale: 1.36,
        dorsalScale: 1.34,
        limbLength: 1.14,
        neckLength: 0.78,
        tailLength: 0,
        snoutLength: 0.64,
        headCount: 1,
        auraShardCount: 16,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.48,
        anatomyCategory: "Flesh"
      },
      materials: {
        preset: "blued_steel",
        ...MATERIAL_PRESETS.blued_steel,
        primaryColor: "#3f6212",
        secondaryColor: "#991b1b",
        underbodyColor: "#1c1917",
        emissiveColor: "#ef4444",
        emissiveIntensity: 3.15,
        texturePattern: "damascus_plate"
      },
      stats: {
        level: 38,
        tier: "Elite",
        element: "Fuego Drac\xF3nico",
        aiBehavior: "Aggressive Berserker",
        hp: 46800,
        attack: 1490,
        defense: 1020,
        speed: 175,
        critChance: 40,
        aggroRadius: 33,
        attackRange: 12,
        xpReward: 21400,
        headHitboxRadius: 0.38,
        torsoHitboxRadius: 0.82,
        torsoHitboxHeight: 1.8,
        lootTags: ["Gran Arco de Guerra de Orgrimmar", "Saeta Rompeescudos de Hierro", "Hombrera con Colmillos de Huargo"]
      }
    },
    archer_species_10_worgen_bloodhound_ranger: {
      id: "enemy-archer-species-10-worgen-bloodhound-ranger",
      name: "Acechador Huargen de Gilneas con Arco",
      title: "Lic\xE1ntropo Francotirador de Pelaje Oscuro que Salta y Dispara Flechas de Plata (Nv. 42)",
      raceCategory: "humanoids",
      bodyPlan: "biped_titan",
      archetype: "archer_species_10_worgen_bloodhound_ranger",
      helm: "lupine_maw",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.24,
        torsoBulk: 1.14,
        shoulderWidth: 1.32,
        hornLength: 0.84,
        hornCurve: 0.38,
        pauldronSize: 1.26,
        weaponScale: 1.36,
        dorsalScale: 1.38,
        limbLength: 1.22,
        neckLength: 0.92,
        tailLength: 0.95,
        snoutLength: 1.24,
        headCount: 1,
        auraShardCount: 18,
        furDensity: 1.55,
        hairStyle: "wild_mane_fur",
        hairLength: 1.4,
        muscleDefinition: 1.42,
        anatomyCategory: "Flesh"
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#1f2937",
        secondaryColor: "#9ca3af",
        underbodyColor: "#090d16",
        emissiveColor: "#f43f5e",
        emissiveIntensity: 3.45,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 42,
        tier: "Mini-Boss",
        element: "Salvaje / F\xEDsico",
        aiBehavior: "Ambush Stalker",
        hp: 61500,
        attack: 1740,
        defense: 1160,
        speed: 192,
        critChance: 44,
        aggroRadius: 35,
        attackRange: 12.6,
        xpReward: 28200,
        headHitboxRadius: 0.39,
        torsoHitboxRadius: 0.8,
        torsoHitboxHeight: 1.84,
        lootTags: ["Arco Recurvo de Cazador de Gilneas", "Flecha de Plata Consagrada", "Manto de Pelaje de Lic\xE1ntropo"]
      }
    },
    archer_species_11_naga_siren_coralbow: {
      id: "enemy-archer-species-11-naga-siren-coralbow",
      name: "Sirena Naga Escama Tormenta con Arco de Coral",
      title: "Arquera Serpentina Abisal de Escamas Iridiscentes y Flechas de Marea Helada (Nv. 46)",
      raceCategory: "air_water_ice",
      bodyPlan: "serpentine_naga",
      archetype: "archer_species_11_naga_siren_coralbow",
      helm: "valkyrie_crest",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "bio_chitin_spines",
      morphology: {
        heightScale: 1.28,
        torsoBulk: 1.08,
        shoulderWidth: 1.28,
        hornLength: 1.32,
        hornCurve: 0.65,
        pauldronSize: 1.24,
        weaponScale: 1.4,
        dorsalScale: 1.45,
        limbLength: 1.2,
        neckLength: 0.96,
        tailLength: 1.65,
        snoutLength: 0.52,
        headCount: 1,
        auraShardCount: 22,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.28,
        anatomyCategory: "Scaled"
      },
      materials: {
        preset: "dragon_crimson_scales",
        ...MATERIAL_PRESETS.dragon_crimson_scales,
        primaryColor: "#0284c7",
        secondaryColor: "#f59e0b",
        underbodyColor: "#082f49",
        emissiveColor: "#38bdf8",
        emissiveIntensity: 3.75,
        texturePattern: "scales"
      },
      stats: {
        level: 46,
        tier: "Mini-Boss",
        element: "Escarcha",
        aiBehavior: "Arcane Artillery",
        hp: 74200,
        attack: 1980,
        defense: 1320,
        speed: 186,
        critChance: 44,
        aggroRadius: 36,
        attackRange: 13,
        xpReward: 34500,
        headHitboxRadius: 0.39,
        torsoHitboxRadius: 0.84,
        torsoHitboxHeight: 1.88,
        lootTags: ["Arco Real de Coral Abisal", "Flecha Hidrodin\xE1mica de Escarcha", "Diadema de Escamas de Nazjatar"]
      }
    },
    archer_species_12_mantid_amber_wingbow: {
      id: "enemy-archer-species-12-mantid-amber-wingbow",
      name: "Tirador M\xE1ntide del Enjambre \xC1mbar",
      title: "Francotirador Insectoide Alado con Mand\xEDbulas de Quitina y Arco S\xF3nico (Nv. 50)",
      raceCategory: "mythological",
      bodyPlan: "biped_titan",
      archetype: "archer_species_12_mantid_amber_wingbow",
      helm: "arachnid_mandibles",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "dragon_membrane_wings",
      morphology: {
        heightScale: 1.28,
        torsoBulk: 1.06,
        shoulderWidth: 1.34,
        hornLength: 1.42,
        hornCurve: 0.72,
        pauldronSize: 1.32,
        weaponScale: 1.42,
        dorsalScale: 1.54,
        limbLength: 1.26,
        neckLength: 0.94,
        tailLength: 0.88,
        snoutLength: 0.76,
        headCount: 1,
        auraShardCount: 24,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.34,
        anatomyCategory: "Chitin"
      },
      materials: {
        preset: "anisotropic_gold",
        ...MATERIAL_PRESETS.anisotropic_gold,
        primaryColor: "#b45309",
        secondaryColor: "#fef08a",
        underbodyColor: "#451a03",
        emissiveColor: "#facc15",
        emissiveIntensity: 3.9,
        texturePattern: "chitin_fur"
      },
      stats: {
        level: 50,
        tier: "Mini-Boss",
        element: "Veneno",
        aiBehavior: "Arcane Artillery",
        hp: 89500,
        attack: 2240,
        defense: 1490,
        speed: 194,
        critChance: 46,
        aggroRadius: 36,
        attackRange: 13.5,
        xpReward: 42800,
        headHitboxRadius: 0.4,
        torsoHitboxRadius: 0.84,
        torsoHitboxHeight: 1.9,
        lootTags: ["Arco Quitinoso de Klaxxi\u2019vess", "Flecha de \xC1mbar Resonante", "\xC9litros Imperiales M\xE1ntide"]
      }
    },
    archer_species_13_minotaur_greatbow_titan: {
      id: "enemy-archer-species-13-minotaur-greatbow-titan",
      name: "Cazador Minotauro de Gran Arco de Asedio",
      title: "Coloso Taurino Peludo con Cuernos de Toro y Arco Gigante Perforamuros (Nv. 54)",
      raceCategory: "mythological",
      bodyPlan: "biped_titan",
      archetype: "archer_species_13_minotaur_greatbow_titan",
      helm: "tauren_bull_horns",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "tattered_mantle",
      morphology: {
        heightScale: 1.4,
        torsoBulk: 1.36,
        shoulderWidth: 1.48,
        hornLength: 1.68,
        hornCurve: 0.9,
        pauldronSize: 1.48,
        weaponScale: 1.56,
        dorsalScale: 1.5,
        limbLength: 1.22,
        neckLength: 0.86,
        tailLength: 1.24,
        snoutLength: 1.08,
        headCount: 1,
        auraShardCount: 26,
        furDensity: 1.5,
        hairStyle: "wild_mane_fur",
        hairLength: 1.38,
        muscleDefinition: 1.55,
        anatomyCategory: "Flesh"
      },
      materials: {
        preset: "feral_fur_hide",
        ...MATERIAL_PRESETS.feral_fur_hide,
        primaryColor: "#451a03",
        secondaryColor: "#d97706",
        underbodyColor: "#1c1917",
        emissiveColor: "#f97316",
        emissiveIntensity: 4.05,
        texturePattern: "wolf_fur"
      },
      stats: {
        level: 54,
        tier: "Raid Boss",
        element: "Fuego Solar",
        aiBehavior: "Boss Multi-Phase",
        hp: 118e3,
        attack: 2580,
        defense: 1790,
        speed: 184,
        critChance: 47,
        aggroRadius: 38,
        attackRange: 14.2,
        xpReward: 55e3,
        headHitboxRadius: 0.43,
        torsoHitboxRadius: 0.94,
        torsoHitboxHeight: 2.02,
        lootTags: ["Gran Arco de Asedio de Cima del Trueno", "Jabalina-Flecha de Minotauro", "Cuerno Real de Toro Ancestral"]
      }
    },
    archer_species_14_draenei_crystal_vindicator_bow: {
      id: "enemy-archer-species-14-draenei-crystal-vindicator-bow",
      name: "Artillero Draenei con Arco de Cristal Arcano",
      title: "Francotirador Espacial de Argus con Pilonos de Naaru y Saetas de Luz Sagrada (Nv. 57)",
      raceCategory: "magical",
      bodyPlan: "biped_titan",
      archetype: "archer_species_14_draenei_crystal_vindicator_bow",
      helm: "monolith_visor",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "crystal_pylons",
      morphology: {
        heightScale: 1.36,
        torsoBulk: 1.2,
        shoulderWidth: 1.42,
        hornLength: 1.48,
        hornCurve: 0.68,
        pauldronSize: 1.5,
        weaponScale: 1.52,
        dorsalScale: 1.62,
        limbLength: 1.26,
        neckLength: 0.94,
        tailLength: 1.18,
        snoutLength: 0.52,
        headCount: 1,
        auraShardCount: 30,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.38,
        anatomyCategory: "Elemental"
      },
      materials: {
        preset: "arcane_crystal",
        ...MATERIAL_PRESETS.arcane_crystal,
        primaryColor: "#3b0764",
        secondaryColor: "#e879f9",
        underbodyColor: "#1e1b4b",
        emissiveColor: "#f0abfc",
        emissiveIntensity: 4.3,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 57,
        tier: "Raid Boss",
        element: "Arcano",
        aiBehavior: "Boss Multi-Phase",
        hp: 136e3,
        attack: 2790,
        defense: 1860,
        speed: 194,
        critChance: 50,
        aggroRadius: 39,
        attackRange: 14.8,
        xpReward: 64500,
        headHitboxRadius: 0.43,
        torsoHitboxRadius: 0.92,
        torsoHitboxHeight: 2,
        lootTags: ["Arco de Cristal de Karabor", "Saeta Fot\xF3nica de los Naaru", "Sello Real del Exodar"]
      }
    },
    archer_species_15_astral_djinn_starbow: {
      id: "enemy-archer-species-15-astral-djinn-starbow",
      name: "Genio Astral del Vac\xEDo con Arco C\xF3smico Estelar",
      title: "Soberano Elemental Flotante de Nivel 60 que Dispara Cometas desde la Altura de la Nariz",
      raceCategory: "magical",
      bodyPlan: "floating_magical",
      archetype: "archer_species_15_astral_djinn_starbow",
      helm: "valkyrie_crest",
      weapon: "bone_recurved_bow",
      offhand: "none",
      dorsal: "runic_halo_ring",
      morphology: {
        heightScale: 1.44,
        torsoBulk: 1.22,
        shoulderWidth: 1.48,
        hornLength: 1.65,
        hornCurve: 0.85,
        pauldronSize: 1.56,
        weaponScale: 1.6,
        dorsalScale: 1.78,
        limbLength: 1.28,
        neckLength: 1,
        tailLength: 0,
        snoutLength: 0.54,
        headCount: 1,
        auraShardCount: 36,
        furDensity: 0,
        hairStyle: "none",
        hairLength: 1,
        muscleDefinition: 1.36,
        anatomyCategory: "Elemental"
      },
      materials: {
        preset: "arcane_crystal",
        ...MATERIAL_PRESETS.arcane_crystal,
        primaryColor: "#0f172a",
        secondaryColor: "#38bdf8",
        underbodyColor: "#020617",
        emissiveColor: "#7dd3fc",
        emissiveIntensity: 4.65,
        texturePattern: "runic_obsidian"
      },
      stats: {
        level: 60,
        tier: "Raid Boss",
        element: "Arcano",
        aiBehavior: "Boss Multi-Phase",
        hp: 158e3,
        attack: 3040,
        defense: 1960,
        speed: 208,
        critChance: 54,
        aggroRadius: 42,
        attackRange: 16,
        xpReward: 78e3,
        headHitboxRadius: 0.44,
        torsoHitboxRadius: 0.94,
        torsoHitboxHeight: 2.08,
        lootTags: ["Arco C\xF3smico de las Constelaciones", "Flecha de Supernova Astral", "Halo Et\xE9reo del Djinn Supremo"]
      }
    }
  };
  function calculateThreatScore(stats) {
    const tierMult = stats.tier === "Raid Boss" ? 2.2 : stats.tier === "Mini-Boss" ? 1.6 : stats.tier === "Elite" ? 1.25 : 1;
    const ehp = stats.hp * (1 + stats.defense / 600);
    const edps = stats.attack * (1 + stats.critChance / 100 * 0.75) * (stats.speed / 100);
    return Math.round((ehp * 0.08 + edps * 1.4) * tierMult / 10);
  }

  // tools/enemigos-src/three/proceduralTextures.ts
  var THREE = globalThis.THREE;
  function configureTileableTexture(canvas, maxAnisotropy, isColor, repeatX = 2, repeatY = 2) {
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.repeat.set(repeatX, repeatY);
    tex.anisotropy = maxAnisotropy;
    return tex;
  }
  function createNormalMapFromBumpCanvas(bumpCanvas, maxAnisotropy, strength = 3.2, repeatX = 2, repeatY = 2) {
    const w = bumpCanvas.width;
    const h = bumpCanvas.height;
    const bCtx = bumpCanvas.getContext("2d");
    const src = bCtx.getImageData(0, 0, w, h).data;
    const normCanvas = document.createElement("canvas");
    normCanvas.width = w;
    normCanvas.height = h;
    const nCtx = normCanvas.getContext("2d");
    const dstImg = nCtx.createImageData(w, h);
    const dst = dstImg.data;
    for (let y = 0; y < h; y++) {
      const yUp = (y - 1 + h) % h;
      const yDn = (y + 1) % h;
      for (let x = 0; x < w; x++) {
        const xLt = (x - 1 + w) % w;
        const xRt = (x + 1) % w;
        const hL = src[(y * w + xLt) * 4] / 255;
        const hR = src[(y * w + xRt) * 4] / 255;
        const hU = src[(yUp * w + x) * 4] / 255;
        const hD = src[(yDn * w + x) * 4] / 255;
        const dx = (hL - hR) * strength;
        const dy = (hD - hU) * strength;
        const dz = 1;
        const invLen = 1 / Math.hypot(dx, dy, dz);
        const idx = (y * w + x) * 4;
        dst[idx] = Math.round((dx * invLen * 0.5 + 0.5) * 255);
        dst[idx + 1] = Math.round((dy * invLen * 0.5 + 0.5) * 255);
        dst[idx + 2] = Math.round((dz * invLen * 0.5 + 0.5) * 255);
        dst[idx + 3] = 255;
      }
    }
    nCtx.putImageData(dstImg, 0, 0);
    return configureTileableTexture(normCanvas, maxAnisotropy, false, repeatX, repeatY);
  }
  function hash2D(ix, iy, seed) {
    const n = Math.sin(ix * 127.1 + iy * 311.7 + seed * 74.7) * 43758.5453123;
    return n - Math.floor(n);
  }
  function tileableSmoothNoise(u, v, freq, seed) {
    const x = u * freq;
    const y = v * freq;
    const ix0 = Math.floor(x);
    const iy0 = Math.floor(y);
    const fx = x - ix0;
    const fy = y - iy0;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const x0 = (ix0 % freq + freq) % freq;
    const x1 = (x0 + 1) % freq;
    const y0 = (iy0 % freq + freq) % freq;
    const y1 = (y0 + 1) % freq;
    const v00 = hash2D(x0, y0, seed);
    const v10 = hash2D(x1, y0, seed);
    const v01 = hash2D(x0, y1, seed);
    const v11 = hash2D(x1, y1, seed);
    const nx0 = v00 + (v10 - v00) * sx;
    const nx1 = v01 + (v11 - v01) * sx;
    return nx0 + (nx1 - nx0) * sy;
  }
  function bakeOrganicGrainAndWearLayer(aCtx, bCtx, size, seed, albedoContrast = 26, bumpContrast = 68, scratchCount = 45) {
    const aImg = aCtx.getImageData(0, 0, size, size);
    const bImg = bCtx.getImageData(0, 0, size, size);
    const aData = aImg.data;
    const bData = bImg.data;
    const grid = 256;
    const fbmGrid = new Float32Array(grid * grid);
    for (let gy = 0; gy < grid; gy++) {
      const v = gy / grid;
      for (let gx = 0; gx < grid; gx++) {
        const u = gx / grid;
        const n1 = tileableSmoothNoise(u, v, 8, seed);
        const n2 = tileableSmoothNoise(u, v, 20, seed + 13);
        const n3 = tileableSmoothNoise(u, v, 48, seed + 29);
        const n4 = tileableSmoothNoise(u, v, 96, seed + 53);
        fbmGrid[gy * grid + gx] = n1 * 0.35 + n2 * 0.3 + n3 * 0.22 + n4 * 0.13 - 0.5;
      }
    }
    for (let y = 0; y < size; y++) {
      const gy = (y >> 1) % grid;
      const rowOff = gy * grid;
      for (let x = 0; x < size; x++) {
        const gx = (x >> 1) % grid;
        const noiseVal = fbmGrid[rowOff + gx];
        const idx = (y * size + x) * 4;
        const dAlb = noiseVal * albedoContrast;
        aData[idx] = Math.min(255, Math.max(0, aData[idx] + dAlb));
        aData[idx + 1] = Math.min(255, Math.max(0, aData[idx + 1] + dAlb));
        aData[idx + 2] = Math.min(255, Math.max(0, aData[idx + 2] + dAlb));
        const dBump = noiseVal * bumpContrast;
        const bv = Math.min(255, Math.max(0, bData[idx] + dBump));
        bData[idx] = bv;
        bData[idx + 1] = bv;
        bData[idx + 2] = bv;
      }
    }
    aCtx.putImageData(aImg, 0, 0);
    bCtx.putImageData(bImg, 0, 0);
    aCtx.lineCap = "round";
    bCtx.lineCap = "round";
    const margin = 36;
    const innerSpan = size - margin * 2;
    for (let s = 0; s < scratchCount; s++) {
      const sx = margin + (s * 97 + seed * 31) % innerSpan;
      const sy = margin + (s * 163 + seed * 19) % innerSpan;
      const angle = s * 47 % 360 * (Math.PI / 180);
      const len = 10 + s % 16;
      const ex = sx + Math.cos(angle) * len;
      const ey = sy + Math.sin(angle) * len;
      const cx = (sx + ex) * 0.5 - Math.sin(angle) * 3.5;
      const cy = (sy + ey) * 0.5 + Math.cos(angle) * 3.5;
      aCtx.strokeStyle = s % 3 === 0 ? "rgba(255,255,255,0.11)" : "rgba(90,90,90,0.10)";
      aCtx.lineWidth = 1.1 + s % 2 * 0.5;
      aCtx.beginPath();
      aCtx.moveTo(sx, sy);
      aCtx.quadraticCurveTo(cx, cy, ex, ey);
      aCtx.stroke();
      bCtx.strokeStyle = s % 3 === 0 ? "rgba(205,205,205,0.26)" : "rgba(65,65,65,0.28)";
      bCtx.lineWidth = 1.2 + s % 2 * 0.6;
      bCtx.beginPath();
      bCtx.moveTo(sx, sy);
      bCtx.quadraticCurveTo(cx, cy, ex, ey);
      bCtx.stroke();
    }
  }
  var DRAGON_SCALE_UV_REPEAT_X = 2;
  var DRAGON_SCALE_UV_REPEAT_Y = 2;
  var DRAGON_SCALE_GRID_COLS = 10;
  var DRAGON_SCALE_GRID_ROWS = 12;
  function getDragonScaleCellHash(wrappedR, wrappedC) {
    return Math.abs(
      Math.sin(wrappedR * 127.1 + wrappedC * 311.7 + 19.3) * 43758.5453
    ) % 1;
  }
  function evaluateDragonScaleUVField(u, v) {
    const cols = DRAGON_SCALE_GRID_COLS;
    const rows = DRAGON_SCALE_GRID_ROWS;
    const gx = u * DRAGON_SCALE_UV_REPEAT_X * cols;
    const gy = (1 - v * DRAGON_SCALE_UV_REPEAT_Y) * rows;
    const baseR = Math.floor(gy);
    let bestR = baseR;
    let bestWrappedR = (baseR % rows + rows) % rows;
    let bestWrappedC = 0;
    let bestHash = 0.5;
    let bestLx = 0;
    let bestLy = 0;
    let bestNormDist = 999;
    for (let dr = -1; dr <= 1; dr++) {
      const r = baseR + dr;
      const wrappedR = (r % rows + rows) % rows;
      const rowShift = wrappedR % 2 * 0.5;
      const baseC = Math.floor(gx - rowShift);
      for (let dc = -1; dc <= 1; dc++) {
        const c = baseC + dc;
        const wrappedC = (c % cols + cols) % cols;
        const h = getDragonScaleCellHash(wrappedR, wrappedC);
        const isProtruding2 = h > 0.62;
        const isRecessed2 = h < 0.25;
        const scaleMult = isProtruding2 ? 1.1 : isRecessed2 ? 0.92 : 1;
        const cx = c + rowShift + 0.5;
        const cy = r + 0.5;
        const rx = 0.55 * scaleMult;
        const ry = 0.62 * scaleMult;
        const lx = (gx - cx) / rx;
        const ly = (gy - cy) / ry;
        const normY = (ly - 0.08) / 1;
        const halfW = ly < 0 ? Math.sqrt(Math.max(0.05, 1 - Math.pow(ly / 0.95, 2))) : Math.max(0.12, 1 - 0.72 * Math.pow(Math.max(0, ly) / 1.08, 1.35));
        const normDist = Math.hypot(lx / halfW, normY);
        const isInsideBoth = normDist < 0.96 && bestNormDist < 0.96;
        if (isInsideBoth && r > bestR || !isInsideBoth && normDist < bestNormDist) {
          bestR = r;
          bestWrappedR = wrappedR;
          bestWrappedC = wrappedC;
          bestHash = h;
          bestLx = lx;
          bestLy = ly;
          bestNormDist = normDist;
        }
      }
    }
    const isProtruding = bestHash > 0.62;
    const isRecessed = bestHash < 0.25;
    let displacement = 0;
    let colorShade = 1;
    if (bestNormDist > 0.92) {
      displacement = isProtruding ? -0.48 : -0.28;
      colorShade = isProtruding ? 0.84 : 0.9;
    } else if (isProtruding) {
      const dome = Math.max(0, 1 - bestNormDist * bestNormDist * 0.72);
      const keel = Math.max(0, 1 - Math.abs(bestLx) * 3.1) * Math.max(0, 1 - Math.abs(bestLy - 0.08) * 0.85);
      const tierBoost = (bestHash - 0.62) / 0.38;
      displacement = (0.48 + 0.45 * tierBoost) * dome + 0.34 * keel;
      colorShade = 1.02 + 0.12 * dome + 0.08 * keel;
    } else if (isRecessed) {
      const dome = Math.max(0, 1 - bestNormDist * bestNormDist * 0.65);
      displacement = -0.22 * dome;
      colorShade = 0.92;
    } else {
      const dome = Math.max(0, 1 - bestNormDist * bestNormDist * 0.82);
      displacement = 0.14 * dome;
      colorShade = 0.98 + 0.04 * dome;
    }
    return {
      wrappedR: bestWrappedR,
      wrappedC: bestWrappedC,
      hash: bestHash,
      isProtruding,
      isRecessed,
      displacement,
      colorShade,
      normDist: bestNormDist
    };
  }
  function createScalesPattern(maxAnisotropy) {
    const size = 512;
    const albCanvas = document.createElement("canvas");
    albCanvas.width = size;
    albCanvas.height = size;
    const aCtx = albCanvas.getContext("2d");
    const bumpCanvas = document.createElement("canvas");
    bumpCanvas.width = size;
    bumpCanvas.height = size;
    const bCtx = bumpCanvas.getContext("2d");
    aCtx.fillStyle = "#bcbcbc";
    aCtx.fillRect(0, 0, size, size);
    bCtx.fillStyle = "#484848";
    bCtx.fillRect(0, 0, size, size);
    const rows = DRAGON_SCALE_GRID_ROWS;
    const cols = DRAGON_SCALE_GRID_COLS;
    const cellW = size / cols;
    const cellH = size / rows;
    const drawShieldScalePath = (ctx, cx, cy, rx, ry) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy - ry * 0.92);
      ctx.quadraticCurveTo(cx + rx * 1.05, cy - ry * 0.25, cx + rx * 0.82, cy + ry * 0.42);
      ctx.quadraticCurveTo(cx + rx * 0.35, cy + ry * 0.96, cx, cy + ry * 1.08);
      ctx.quadraticCurveTo(cx - rx * 0.35, cy + ry * 0.96, cx - rx * 0.82, cy + ry * 0.42);
      ctx.quadraticCurveTo(cx - rx * 1.05, cy - ry * 0.25, cx, cy - ry * 0.92);
      ctx.closePath();
    };
    for (let r = -1; r <= rows; r++) {
      const wrappedR = (r % rows + rows) % rows;
      for (let c = -1; c <= cols; c++) {
        const wrappedC = (c % cols + cols) % cols;
        const h = getDragonScaleCellHash(wrappedR, wrappedC);
        const isProtruding = h > 0.62;
        const isRecessed = h < 0.25;
        const offsetX = wrappedR % 2 * (cellW * 0.5);
        const cx = c * cellW + offsetX + cellW * 0.5;
        const cy = r * cellH + cellH * 0.5;
        const scaleMult = isProtruding ? 1.1 : isRecessed ? 0.92 : 1;
        const rx = cellW * 0.55 * scaleMult;
        const ry = cellH * 0.62 * scaleMult;
        aCtx.fillStyle = isProtruding ? "rgba(18, 18, 18, 0.55)" : "rgba(32, 32, 32, 0.32)";
        drawShieldScalePath(aCtx, cx, cy + (isProtruding ? 4.5 : 2.2), rx * 1.04, ry * 1.04);
        aCtx.fill();
        bCtx.fillStyle = "#1e1e1e";
        drawShieldScalePath(bCtx, cx, cy + (isProtruding ? 4 : 2), rx * 1.05, ry * 1.05);
        bCtx.fill();
        const aGrad = aCtx.createRadialGradient(
          cx,
          cy - ry * (isProtruding ? 0.12 : 0.22),
          rx * 0.08,
          cx,
          cy,
          Math.max(rx, ry)
        );
        if (isProtruding) {
          aGrad.addColorStop(0, "#ffffff");
          aGrad.addColorStop(0.55, "#efefef");
          aGrad.addColorStop(0.85, "#c6c6c6");
          aGrad.addColorStop(1, "#787878");
        } else if (isRecessed) {
          aGrad.addColorStop(0, "#c2c2c2");
          aGrad.addColorStop(0.68, "#9e9e9e");
          aGrad.addColorStop(1, "#686868");
        } else {
          aGrad.addColorStop(0, "#e6e6e6");
          aGrad.addColorStop(0.65, "#cacaca");
          aGrad.addColorStop(1, "#848484");
        }
        aCtx.fillStyle = aGrad;
        drawShieldScalePath(aCtx, cx, cy, rx, ry);
        aCtx.fill();
        const bGrad = bCtx.createRadialGradient(
          cx,
          cy - ry * 0.1,
          rx * 0.06,
          cx,
          cy,
          Math.max(rx, ry)
        );
        if (isProtruding) {
          bGrad.addColorStop(0, "#ffffff");
          bGrad.addColorStop(0.58, "#dcdcdc");
          bGrad.addColorStop(0.88, "#969696");
          bGrad.addColorStop(1, "#343434");
        } else if (isRecessed) {
          bGrad.addColorStop(0, "#8a8a8a");
          bGrad.addColorStop(0.7, "#646464");
          bGrad.addColorStop(1, "#2c2c2c");
        } else {
          bGrad.addColorStop(0, "#c6c6c6");
          bGrad.addColorStop(0.72, "#8c8c8c");
          bGrad.addColorStop(1, "#383838");
        }
        bCtx.fillStyle = bGrad;
        drawShieldScalePath(bCtx, cx, cy, rx, ry);
        bCtx.fill();
        if (isProtruding) {
          const crownAlb = aCtx.createRadialGradient(
            cx,
            cy + ry * 0.08,
            rx * 0.04,
            cx,
            cy + ry * 0.08,
            rx * 0.52
          );
          crownAlb.addColorStop(0, "rgba(255, 255, 255, 0.38)");
          crownAlb.addColorStop(0.55, "rgba(255, 255, 255, 0.14)");
          crownAlb.addColorStop(1, "rgba(255, 255, 255, 0.0)");
          aCtx.fillStyle = crownAlb;
          drawShieldScalePath(aCtx, cx, cy, rx * 0.65, ry * 0.72);
          aCtx.fill();
          const crownBump = bCtx.createRadialGradient(
            cx,
            cy + ry * 0.08,
            rx * 0.04,
            cx,
            cy + ry * 0.08,
            rx * 0.56
          );
          crownBump.addColorStop(0, "rgba(255, 255, 255, 0.55)");
          crownBump.addColorStop(0.6, "rgba(240, 240, 240, 0.22)");
          crownBump.addColorStop(1, "rgba(200, 200, 200, 0.0)");
          bCtx.fillStyle = crownBump;
          drawShieldScalePath(bCtx, cx, cy, rx * 0.68, ry * 0.75);
          bCtx.fill();
        }
      }
    }
    bakeOrganicGrainAndWearLayer(aCtx, bCtx, size, 11, 28, 72, 42);
    return {
      albedoMap: configureTileableTexture(albCanvas, maxAnisotropy, true, 2, 2),
      bumpMap: configureTileableTexture(bumpCanvas, maxAnisotropy, false, 2, 2),
      normalMap: createNormalMapFromBumpCanvas(bumpCanvas, maxAnisotropy, 3.8, 2, 2)
    };
  }
  function createChitinFurPattern(maxAnisotropy) {
    const size = 512;
    const albCanvas = document.createElement("canvas");
    albCanvas.width = size;
    albCanvas.height = size;
    const aCtx = albCanvas.getContext("2d");
    const bumpCanvas = document.createElement("canvas");
    bumpCanvas.width = size;
    bumpCanvas.height = size;
    const bCtx = bumpCanvas.getContext("2d");
    aCtx.fillStyle = "#e4e4e4";
    aCtx.fillRect(0, 0, size, size);
    bCtx.fillStyle = "#808080";
    bCtx.fillRect(0, 0, size, size);
    aCtx.lineCap = "round";
    bCtx.lineCap = "round";
    for (let i = 0; i < 560; i++) {
      const x = i * 73 % size;
      const y = i * 137 % size;
      const len = 26 + i % 26;
      const dx = (i % 5 - 2) * 2.4;
      const isLight = i % 2 === 0;
      aCtx.strokeStyle = isLight ? "rgba(255,255,255,0.28)" : "rgba(150,150,150,0.26)";
      aCtx.lineWidth = 2.8;
      aCtx.beginPath();
      aCtx.moveTo(x, y);
      aCtx.quadraticCurveTo(x + dx * 0.5, y + len * 0.5, x + dx, y + len);
      aCtx.stroke();
      bCtx.strokeStyle = isLight ? "rgba(195,195,195,0.48)" : "rgba(75,75,75,0.48)";
      bCtx.lineWidth = 2.8;
      bCtx.beginPath();
      bCtx.moveTo(x, y);
      bCtx.quadraticCurveTo(x + dx * 0.5, y + len * 0.5, x + dx, y + len);
      bCtx.stroke();
    }
    bakeOrganicGrainAndWearLayer(aCtx, bCtx, size, 27, 32, 78, 50);
    return {
      albedoMap: configureTileableTexture(albCanvas, maxAnisotropy, true, 2, 2),
      bumpMap: configureTileableTexture(bumpCanvas, maxAnisotropy, false, 2, 2),
      normalMap: createNormalMapFromBumpCanvas(bumpCanvas, maxAnisotropy, 3.4, 2, 2)
    };
  }
  function createDamascusPlatePattern(maxAnisotropy) {
    const size = 512;
    const albCanvas = document.createElement("canvas");
    albCanvas.width = size;
    albCanvas.height = size;
    const aCtx = albCanvas.getContext("2d");
    const bumpCanvas = document.createElement("canvas");
    bumpCanvas.width = size;
    bumpCanvas.height = size;
    const bCtx = bumpCanvas.getContext("2d");
    aCtx.fillStyle = "#e6e6e6";
    aCtx.fillRect(0, 0, size, size);
    bCtx.fillStyle = "#808080";
    bCtx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 10) {
      aCtx.strokeStyle = y % 20 === 0 ? "rgba(255,255,255,0.28)" : "rgba(175,175,175,0.26)";
      aCtx.lineWidth = 3;
      bCtx.strokeStyle = y % 20 === 0 ? "rgba(185,185,185,0.42)" : "rgba(90,90,90,0.42)";
      bCtx.lineWidth = 3;
      aCtx.beginPath();
      bCtx.beginPath();
      for (let x = 0; x <= size; x += 16) {
        const wy = y + Math.sin(x / size * Math.PI * 2) * 8;
        if (x === 0) {
          aCtx.moveTo(x, wy);
          bCtx.moveTo(x, wy);
        } else {
          aCtx.lineTo(x, wy);
          bCtx.lineTo(x, wy);
        }
      }
      aCtx.stroke();
      bCtx.stroke();
    }
    bakeOrganicGrainAndWearLayer(aCtx, bCtx, size, 43, 28, 76, 65);
    return {
      albedoMap: configureTileableTexture(albCanvas, maxAnisotropy, true, 2, 2),
      bumpMap: configureTileableTexture(bumpCanvas, maxAnisotropy, false, 2, 2),
      normalMap: createNormalMapFromBumpCanvas(bumpCanvas, maxAnisotropy, 3, 2, 2)
    };
  }
  function createRunicObsidianPattern(maxAnisotropy) {
    const size = 512;
    const albCanvas = document.createElement("canvas");
    albCanvas.width = size;
    albCanvas.height = size;
    const aCtx = albCanvas.getContext("2d");
    const bumpCanvas = document.createElement("canvas");
    bumpCanvas.width = size;
    bumpCanvas.height = size;
    const bCtx = bumpCanvas.getContext("2d");
    aCtx.fillStyle = "#e2e2e2";
    aCtx.fillRect(0, 0, size, size);
    bCtx.fillStyle = "#808080";
    bCtx.fillRect(0, 0, size, size);
    for (let i = 0; i < 42; i++) {
      const cx = i * 97 % size;
      const cy = i * 151 % size;
      const rad = 36 + i % 44;
      const aGrad = aCtx.createRadialGradient(cx, cy, 4, cx, cy, rad);
      aGrad.addColorStop(0, "rgba(255,255,255,0.26)");
      aGrad.addColorStop(0.6, "rgba(195,195,195,0.16)");
      aGrad.addColorStop(1, "rgba(226,226,226,0)");
      aCtx.fillStyle = aGrad;
      aCtx.beginPath();
      aCtx.arc(cx, cy, rad, 0, Math.PI * 2);
      aCtx.fill();
      const bGrad = bCtx.createRadialGradient(cx, cy, 4, cx, cy, rad);
      bGrad.addColorStop(0, "rgba(190,190,190,0.45)");
      bGrad.addColorStop(0.65, "rgba(85,85,85,0.35)");
      bGrad.addColorStop(1, "rgba(128,128,128,0)");
      bCtx.fillStyle = bGrad;
      bCtx.beginPath();
      bCtx.arc(cx, cy, rad, 0, Math.PI * 2);
      bCtx.fill();
    }
    bakeOrganicGrainAndWearLayer(aCtx, bCtx, size, 61, 32, 82, 55);
    return {
      albedoMap: configureTileableTexture(albCanvas, maxAnisotropy, true, 2, 2),
      bumpMap: configureTileableTexture(bumpCanvas, maxAnisotropy, false, 2, 2),
      normalMap: createNormalMapFromBumpCanvas(bumpCanvas, maxAnisotropy, 3.5, 2, 2)
    };
  }
  function createWolfFurPattern(maxAnisotropy) {
    const size = 512;
    const albCanvas = document.createElement("canvas");
    albCanvas.width = size;
    albCanvas.height = size;
    const aCtx = albCanvas.getContext("2d");
    const bumpCanvas = document.createElement("canvas");
    bumpCanvas.width = size;
    bumpCanvas.height = size;
    const bCtx = bumpCanvas.getContext("2d");
    aCtx.fillStyle = "#cfcfcf";
    aCtx.fillRect(0, 0, size, size);
    bCtx.fillStyle = "#686868";
    bCtx.fillRect(0, 0, size, size);
    const tuftRows = 14;
    const tuftCols = 12;
    const cellW = size / tuftCols;
    const cellH = size / tuftRows;
    for (let r = -1; r <= tuftRows; r++) {
      for (let c = -1; c <= tuftCols; c++) {
        const jitterX = (hash2D(c + 10, r + 10, 71) - 0.5) * cellW * 0.45;
        const jitterY = (hash2D(c + 20, r + 20, 89) - 0.5) * cellH * 0.35;
        const cx = c * cellW + r % 2 * (cellW * 0.5) + cellW * 0.5 + jitterX;
        const cy = r * cellH + cellH * 0.5 + jitterY;
        const w = cellW * 0.68;
        const h = cellH * 1.35;
        const aGrad = aCtx.createLinearGradient(cx, cy - h * 0.45, cx, cy + h * 0.65);
        aGrad.addColorStop(0, "rgba(95, 95, 95, 0.55)");
        aGrad.addColorStop(0.55, "rgba(220, 220, 220, 0.5)");
        aGrad.addColorStop(1, "rgba(255, 255, 255, 0.72)");
        aCtx.fillStyle = aGrad;
        aCtx.beginPath();
        aCtx.moveTo(cx - w * 0.5, cy - h * 0.35);
        aCtx.quadraticCurveTo(cx, cy + h * 0.75, cx + w * 0.5, cy - h * 0.35);
        aCtx.closePath();
        aCtx.fill();
        const bGrad = bCtx.createLinearGradient(cx, cy - h * 0.45, cx, cy + h * 0.65);
        bGrad.addColorStop(0, "rgba(35, 35, 35, 0.65)");
        bGrad.addColorStop(0.6, "rgba(165, 165, 165, 0.65)");
        bGrad.addColorStop(1, "rgba(245, 245, 245, 0.85)");
        bCtx.fillStyle = bGrad;
        bCtx.beginPath();
        bCtx.moveTo(cx - w * 0.5, cy - h * 0.35);
        bCtx.quadraticCurveTo(cx, cy + h * 0.75, cx + w * 0.5, cy - h * 0.35);
        bCtx.closePath();
        bCtx.fill();
      }
    }
    aCtx.lineCap = "round";
    bCtx.lineCap = "round";
    const drawWrappedStrand = (ox, oy, ctrlDx, ctrlDy, endDx, endDy, albStyle, bumpStyle, width) => {
      for (const wx of [-size, 0, size]) {
        for (const wy of [-size, 0, size]) {
          const sx = ox + wx;
          const sy = oy + wy;
          if (sx < -60 || sx > size + 60 || sy < -60 || sy > size + 60) continue;
          aCtx.strokeStyle = albStyle;
          aCtx.lineWidth = width;
          aCtx.beginPath();
          aCtx.moveTo(sx, sy);
          aCtx.quadraticCurveTo(sx + ctrlDx, sy + ctrlDy, sx + endDx, sy + endDy);
          aCtx.stroke();
          bCtx.strokeStyle = bumpStyle;
          bCtx.lineWidth = width * 1.15;
          bCtx.beginPath();
          bCtx.moveTo(sx, sy);
          bCtx.quadraticCurveTo(sx + ctrlDx, sy + ctrlDy, sx + endDx, sy + endDy);
          bCtx.stroke();
        }
      }
    };
    for (let i = 0; i < 2200; i++) {
      const x = (i * 79 + i % 7 * 19) % size;
      const y = (i * 139 + i % 11 * 23) % size;
      const wave = Math.sin(x / size * Math.PI * 4 + y / size * Math.PI * 2);
      const len = 18 + i % 24;
      const sway = wave * 5.5 + (i % 5 - 2) * 2.1;
      const isGuardHighlight = i % 3 === 0;
      const isDarkUndercoat = i % 4 === 1;
      const albCol = isGuardHighlight ? "rgba(255, 255, 255, 0.42)" : isDarkUndercoat ? "rgba(85, 85, 85, 0.38)" : "rgba(205, 205, 205, 0.34)";
      const bumpCol = isGuardHighlight ? "rgba(245, 245, 245, 0.62)" : isDarkUndercoat ? "rgba(40, 40, 40, 0.58)" : "rgba(165, 165, 165, 0.48)";
      const w = isGuardHighlight ? 1.65 : 2.2;
      drawWrappedStrand(x, y, sway * 0.45, len * 0.5, sway, len, albCol, bumpCol, w);
    }
    bakeOrganicGrainAndWearLayer(aCtx, bCtx, size, 19, 24, 64, 24);
    return {
      albedoMap: configureTileableTexture(albCanvas, maxAnisotropy, true, 3, 3),
      bumpMap: configureTileableTexture(bumpCanvas, maxAnisotropy, false, 3, 3),
      normalMap: createNormalMapFromBumpCanvas(bumpCanvas, maxAnisotropy, 3.6, 3, 3)
    };
  }
  function createProceduralTextureSet(maxAnisotropy) {
    const wolf_fur = createWolfFurPattern(maxAnisotropy);
    const scales = createScalesPattern(maxAnisotropy);
    const chitin_fur = createChitinFurPattern(maxAnisotropy);
    const damascus_plate = createDamascusPlatePattern(maxAnisotropy);
    const runic_obsidian = createRunicObsidianPattern(maxAnisotropy);
    const roughCanvas = document.createElement("canvas");
    roughCanvas.width = 256;
    roughCanvas.height = 256;
    const rCtx = roughCanvas.getContext("2d");
    const rImg = rCtx.createImageData(256, 256);
    const rData = rImg.data;
    for (let y = 0; y < 256; y++) {
      const v = y / 256;
      for (let x = 0; x < 256; x++) {
        const u = x / 256;
        const n1 = tileableSmoothNoise(u, v, 6, 91);
        const n2 = tileableSmoothNoise(u, v, 18, 107);
        const n3 = tileableSmoothNoise(u, v, 42, 131);
        const val = Math.min(255, Math.max(90, Math.round((0.55 + (n1 * 0.45 + n2 * 0.35 + n3 * 0.2 - 0.5) * 0.75) * 255)));
        const idx = (y * 256 + x) * 4;
        rData[idx] = val;
        rData[idx + 1] = val;
        rData[idx + 2] = val;
        rData[idx + 3] = 255;
      }
    }
    rCtx.putImageData(rImg, 0, 0);
    const armorRoughnessMap = configureTileableTexture(roughCanvas, maxAnisotropy, false, 2, 2);
    const pedCanvas = document.createElement("canvas");
    pedCanvas.width = 512;
    pedCanvas.height = 512;
    const pCtx = pedCanvas.getContext("2d");
    const cx = 256;
    const cy = 256;
    pCtx.strokeStyle = "rgba(245, 158, 11, 0.45)";
    pCtx.lineWidth = 2;
    pCtx.beginPath();
    pCtx.arc(cx, cy, 230, 0, Math.PI * 2);
    pCtx.stroke();
    pCtx.strokeStyle = "rgba(148, 163, 184, 0.25)";
    pCtx.lineWidth = 1.5;
    pCtx.beginPath();
    pCtx.arc(cx, cy, 190, 0, Math.PI * 2);
    pCtx.stroke();
    pCtx.beginPath();
    pCtx.arc(cx, cy, 130, 0, Math.PI * 2);
    pCtx.stroke();
    for (let deg = 0; deg < 360; deg += 10) {
      const rad = deg * Math.PI / 180;
      const inner = deg % 30 === 0 ? 212 : 220;
      pCtx.strokeStyle = deg % 30 === 0 ? "rgba(245, 158, 11, 0.65)" : "rgba(148, 163, 184, 0.28)";
      pCtx.lineWidth = deg % 30 === 0 ? 2 : 1;
      pCtx.beginPath();
      pCtx.moveTo(cx + Math.cos(rad) * inner, cy + Math.sin(rad) * inner);
      pCtx.lineTo(cx + Math.cos(rad) * 230, cy + Math.sin(rad) * 230);
      pCtx.stroke();
    }
    const pedestalRunesMap = new THREE.CanvasTexture(pedCanvas);
    pedestalRunesMap.colorSpace = THREE.SRGBColorSpace;
    pedestalRunesMap.anisotropy = maxAnisotropy;
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext("2d");
    const grad = sCtx.createRadialGradient(64, 64, 6, 64, 64, 60);
    grad.addColorStop(0, "rgba(0, 0, 0, 0.85)");
    grad.addColorStop(0.5, "rgba(0, 0, 0, 0.42)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0.0)");
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 128, 128);
    const contactShadowMap = new THREE.CanvasTexture(shadowCanvas);
    contactShadowMap.colorSpace = THREE.SRGBColorSpace;
    const smokeCanvas = document.createElement("canvas");
    smokeCanvas.width = 64;
    smokeCanvas.height = 64;
    const smCtx = smokeCanvas.getContext("2d");
    const smGrad = smCtx.createRadialGradient(32, 32, 2, 32, 32, 30);
    smGrad.addColorStop(0, "rgba(255, 255, 255, 0.92)");
    smGrad.addColorStop(0.38, "rgba(235, 225, 215, 0.62)");
    smGrad.addColorStop(0.72, "rgba(180, 165, 155, 0.22)");
    smGrad.addColorStop(1, "rgba(0, 0, 0, 0.0)");
    smCtx.fillStyle = smGrad;
    smCtx.fillRect(0, 0, 64, 64);
    const particleSmokeMap = new THREE.CanvasTexture(smokeCanvas);
    particleSmokeMap.colorSpace = THREE.SRGBColorSpace;
    const sparkCanvas = document.createElement("canvas");
    sparkCanvas.width = 64;
    sparkCanvas.height = 64;
    const spCtx = sparkCanvas.getContext("2d");
    const spGrad = spCtx.createRadialGradient(32, 32, 1, 32, 32, 30);
    spGrad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
    spGrad.addColorStop(0.22, "rgba(255, 255, 255, 0.85)");
    spGrad.addColorStop(0.55, "rgba(255, 255, 255, 0.28)");
    spGrad.addColorStop(1, "rgba(255, 255, 255, 0.0)");
    spCtx.fillStyle = spGrad;
    spCtx.fillRect(0, 0, 64, 64);
    spCtx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    spCtx.lineWidth = 2;
    spCtx.beginPath();
    spCtx.moveTo(32, 6);
    spCtx.lineTo(32, 58);
    spCtx.moveTo(6, 32);
    spCtx.lineTo(58, 32);
    spCtx.stroke();
    const particleSparkMap = new THREE.CanvasTexture(sparkCanvas);
    particleSparkMap.colorSpace = THREE.SRGBColorSpace;
    const fireCanvas = document.createElement("canvas");
    fireCanvas.width = 256;
    fireCanvas.height = 256;
    const fCtx = fireCanvas.getContext("2d");
    const fImg = fCtx.createImageData(256, 256);
    const fData = fImg.data;
    const frostCanvas = document.createElement("canvas");
    frostCanvas.width = 256;
    frostCanvas.height = 256;
    const frCtx = frostCanvas.getContext("2d");
    const frImg = frCtx.createImageData(256, 256);
    const frData = frImg.data;
    for (let y = 0; y < 256; y++) {
      const v = y / 256;
      for (let x = 0; x < 256; x++) {
        const u = x / 256;
        const n1 = tileableSmoothNoise(u, v, 5, 301);
        const n2 = tileableSmoothNoise(u, v, 11, 317);
        const n3 = tileableSmoothNoise(u, v, 24, 349);
        const n4 = tileableSmoothNoise(u, v, 48, 389);
        const turb = n1 * 0.42 + n2 * 0.31 + n3 * 0.18 + n4 * 0.09;
        const filament = Math.pow(Math.max(0, Math.sin((u * 6 + (n1 - 0.5) * 1.4) * Math.PI * 2) * 0.5 + 0.5), 1.4);
        const heat = Math.min(1, Math.max(0, turb * 0.78 + filament * 0.36));
        let r = 0;
        let g = 0;
        let b = 0;
        if (heat > 0.76) {
          const t = (heat - 0.76) / 0.24;
          r = 255;
          g = Math.round(225 + t * 30);
          b = Math.round(110 + t * 145);
        } else if (heat > 0.46) {
          const t = (heat - 0.46) / 0.3;
          r = 255;
          g = Math.round(95 + t * 130);
          b = Math.round(8 + t * 102);
        } else if (heat > 0.2) {
          const t = (heat - 0.2) / 0.26;
          r = Math.round(135 + t * 120);
          g = Math.round(15 + t * 80);
          b = Math.round(2 + t * 6);
        } else {
          const t = heat / 0.2;
          r = Math.round(t * 135);
          g = Math.round(t * 15);
          b = 0;
        }
        const alpha = Math.round(Math.pow(Math.max(0, (heat - 0.12) / 0.88), 1.15) * 255);
        const idx = (y * 256 + x) * 4;
        fData[idx] = r;
        fData[idx + 1] = g;
        fData[idx + 2] = b;
        fData[idx + 3] = alpha;
        const frostIntensity = Math.min(1, Math.max(0, turb * 0.75 + filament * 0.38));
        frData[idx] = Math.round(85 + frostIntensity * 170);
        frData[idx + 1] = Math.round(195 + frostIntensity * 60);
        frData[idx + 2] = 255;
        frData[idx + 3] = Math.round(Math.pow(Math.max(0, (frostIntensity - 0.14) / 0.86), 1.1) * 255);
      }
    }
    fCtx.putImageData(fImg, 0, 0);
    frCtx.putImageData(frImg, 0, 0);
    const fireBreathMap = configureTileableTexture(fireCanvas, maxAnisotropy, true, 1, 1);
    const frostBreathMap = configureTileableTexture(frostCanvas, maxAnisotropy, true, 1, 1);
    const flameSpriteCanvas = document.createElement("canvas");
    flameSpriteCanvas.width = 64;
    flameSpriteCanvas.height = 64;
    const fsCtx = flameSpriteCanvas.getContext("2d");
    const fsImg = fsCtx.createImageData(64, 64);
    const fsData = fsImg.data;
    for (let y = 0; y < 64; y++) {
      const dy = (y - 32) / 30;
      for (let x = 0; x < 64; x++) {
        const dx = (x - 32) / 30;
        const dist = Math.hypot(dx, dy);
        const ang = Math.atan2(dy, dx);
        const lobe = Math.sin(ang * 3 + 0.7) * 0.08 + Math.cos(ang * 5 - 1.2) * 0.06 + Math.sin(ang * 8 + 2.1) * 0.04;
        const effDist = dist + lobe * dist;
        const falloff = Math.max(0, 1 - effDist);
        const core = Math.pow(falloff, 1.35);
        const idx = (y * 64 + x) * 4;
        fsData[idx] = 255;
        fsData[idx + 1] = Math.round(215 + Math.pow(falloff, 0.6) * 40);
        fsData[idx + 2] = Math.round(160 + Math.pow(falloff, 0.4) * 95);
        fsData[idx + 3] = Math.round(core * 255);
      }
    }
    fsCtx.putImageData(fsImg, 0, 0);
    const fireFlameSpriteMap = new THREE.CanvasTexture(flameSpriteCanvas);
    fireFlameSpriteMap.colorSpace = THREE.SRGBColorSpace;
    return {
      patterns: {
        wolf_fur,
        scales,
        chitin_fur,
        damascus_plate,
        runic_obsidian
      },
      armorBumpMap: damascus_plate.bumpMap,
      armorNormalMap: damascus_plate.normalMap,
      armorRoughnessMap,
      pedestalRunesMap,
      contactShadowMap,
      particleSmokeMap,
      particleSparkMap,
      fireBreathMap,
      frostBreathMap,
      fireFlameSpriteMap,
      dispose: () => {
        for (const p of Object.values({
          wolf_fur,
          scales,
          chitin_fur,
          damascus_plate,
          runic_obsidian
        })) {
          p.albedoMap.dispose();
          p.bumpMap.dispose();
          p.normalMap.dispose();
        }
        armorRoughnessMap.dispose();
        pedestalRunesMap.dispose();
        contactShadowMap.dispose();
        particleSmokeMap.dispose();
        particleSparkMap.dispose();
        fireBreathMap.dispose();
        frostBreathMap.dispose();
        fireFlameSpriteMap.dispose();
      }
    };
  }

  // tools/enemigos-src/three/enemyBuilder.ts
  var THREE2 = globalThis.THREE;
  var _targetPos = new THREE2.Vector3();
  var _pelvisAnimOffset = new THREE2.Vector3();
  var _zeroVec = new THREE2.Vector3();
  var _mouthWorldPos = new THREE2.Vector3();
  var _mouthLocalPos = new THREE2.Vector3();
  var _mouthForwardDir = new THREE2.Vector3();
  var _headWorldQuat = new THREE2.Quaternion();
  var _rootWorldQuat = new THREE2.Quaternion();
  var _dummyObj = new THREE2.Object3D();
  var _shardColor = new THREE2.Color();
  var _anchorLocalPos = new THREE2.Vector3();
  var _particleBaseColor = new THREE2.Color();
  var _particleAccentColor = new THREE2.Color();
  var _particleColorOut = new THREE2.Color();
  function sculptAndShadeGeometry(geo, muscleAmplitude = 0.014, freq = 5.5, aoDarkenBottom = 0.24, furClumpAmplitude = 0) {
    const pos = geo.getAttribute("position");
    if (!pos) return geo;
    if (!geo.getAttribute("normal")) {
      geo.computeVertexNormals();
    }
    const norm = geo.getAttribute("normal");
    geo.computeBoundingBox();
    const bbox = geo.boundingBox;
    const widthSpan = Math.max(1e-3, bbox.max.x - bbox.min.x);
    const heightSpan = Math.max(1e-3, bbox.max.y - bbox.min.y);
    const depthSpan = Math.max(1e-3, bbox.max.z - bbox.min.z);
    const midX = (bbox.min.x + bbox.max.x) * 0.5;
    const midZ = (bbox.min.z + bbox.max.z) * 0.5;
    const count = pos.count;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const normY = (y - bbox.min.y) / heightSpan;
      const normZ = (z - bbox.min.z) / depthSpan;
      const bellyEnv = Math.sin(normY * Math.PI);
      const theta = Math.atan2(x - midX, z - midZ);
      const primaryBelly = Math.cos(theta * 2) * 0.62 + Math.sin(theta * 3) * 0.38;
      const fiberStriation = Math.sin(theta * 6 + normY * freq) * 0.28;
      const muscleWave = bellyEnv * (primaryBelly + fiberStriation);
      const furWave = furClumpAmplitude > 1e-4 ? bellyEnv * (Math.sin(x * 22 + y * 14) * Math.cos(z * 22 - y * 11) * 0.65 + Math.sin(theta * 9 - normY * 12) * 0.35) : 0;
      const totalDisp = muscleWave * muscleAmplitude + furWave * furClumpAmplitude;
      if (norm && Math.abs(totalDisp) > 1e-5 && widthSpan > 0.05) {
        const nx = norm.getX(i);
        const ny = norm.getY(i);
        const nz = norm.getZ(i);
        pos.setXYZ(i, x + nx * totalDisp, y + ny * totalDisp * 0.45, z + nz * totalDisp);
      }
      const ridgeHighlight = bellyEnv * 0.1;
      const muscleTone = muscleAmplitude > 1e-3 ? muscleWave * 0.11 : 0;
      const furTipTone = furClumpAmplitude > 1e-3 ? furWave * 0.12 : 0;
      const aoFactor = 1 - (1 - normY) * aoDarkenBottom + ridgeHighlight + (normZ - 0.5) * 0.05 + muscleTone + furTipTone;
      const r = Math.min(1.08, Math.max(0.52, aoFactor * 1.01));
      const g = Math.min(1.06, Math.max(0.5, aoFactor * 0.99));
      const b = Math.min(1.06, Math.max(0.48, aoFactor * 0.97));
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }
    if (muscleAmplitude > 1e-3 || furClumpAmplitude > 1e-3) {
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    }
    geo.setAttribute("color", new THREE2.BufferAttribute(colors, 3));
    return geo;
  }
  function createFurLockGeometry(baseRadius = 0.065, length = 0.26, curveBack = 0.08, strandCount = 7) {
    const vertsPerStrand = 7;
    const trisPerStrand = 5;
    const totalVerts = strandCount * vertsPerStrand;
    const totalIndices = strandCount * trisPerStrand * 3;
    const positions = new Float32Array(totalVerts * 3);
    const normals = new Float32Array(totalVerts * 3);
    const uvs = new Float32Array(totalVerts * 2);
    const colors = new Float32Array(totalVerts * 3);
    const indices = new Uint16Array(totalIndices);
    const levels = [0, 0.34, 0.7, 1];
    const widthFactors = [1, 0.78, 0.44, 0];
    for (let s = 0; s < strandCount; s++) {
      const vBase = s * vertsPerStrand;
      const iBase = s * trisPerStrand * 3;
      const ang = s * 2.3999632;
      const radialFrac = s === 0 ? 0 : Math.sqrt(s / strandCount);
      const ox = Math.cos(ang) * baseRadius * 0.48 * radialFrac;
      const oz = Math.sin(ang) * baseRadius * 0.48 * radialFrac;
      const splayX = Math.cos(ang) * baseRadius * 0.65 * radialFrac;
      const splayZ = Math.sin(ang) * baseRadius * 0.45 * radialFrac;
      const bladeW = baseRadius * (0.28 + s % 3 * 0.05);
      const bladeLen = length * (0.84 + s * 37 % 10 * 0.028);
      const rx = Math.cos(ang * 0.5 + 0.35);
      const rz = -Math.sin(ang * 0.5 + 0.35);
      const shadeVar = 0.92 + s * 17 % 9 * 0.02;
      for (let segIdx = 0; segIdx < 4; segIdx++) {
        const t = levels[segIdx];
        const y = t * bladeLen;
        const bend = t * t * (curveBack * (0.85 + 0.12 * (s % 3)));
        const wave = Math.sin(t * Math.PI * 1.4 + s) * 0.014 * bladeLen;
        const cx = ox + splayX * t + wave;
        const cy = y;
        const cz = oz + splayZ * t - bend;
        let nx = splayX * 0.8 + rx * 0.15;
        let ny = 0.65;
        let nz = -0.55 + splayZ * 0.5;
        const nLen = Math.hypot(nx, ny, nz) || 1;
        nx /= nLen;
        ny /= nLen;
        nz /= nLen;
        const lum = (0.36 + Math.pow(t, 0.85) * 0.98) * shadeVar;
        const cr = Math.min(1.48, lum * (0.98 + t * 0.08));
        const cg = Math.min(1.42, lum * (0.96 + t * 0.04));
        const cb = Math.min(1.36, lum * (0.92 - t * 0.02));
        if (segIdx < 3) {
          const w = bladeW * widthFactors[segIdx];
          const vL = vBase + segIdx * 2;
          const vR = vL + 1;
          positions[vL * 3] = cx - rx * w;
          positions[vL * 3 + 1] = cy;
          positions[vL * 3 + 2] = cz - rz * w;
          positions[vR * 3] = cx + rx * w;
          positions[vR * 3 + 1] = cy;
          positions[vR * 3 + 2] = cz + rz * w;
          normals[vL * 3] = nx;
          normals[vL * 3 + 1] = ny;
          normals[vL * 3 + 2] = nz;
          normals[vR * 3] = nx;
          normals[vR * 3 + 1] = ny;
          normals[vR * 3 + 2] = nz;
          uvs[vL * 2] = 0;
          uvs[vL * 2 + 1] = t;
          uvs[vR * 2] = 1;
          uvs[vR * 2 + 1] = t;
          colors[vL * 3] = cr;
          colors[vL * 3 + 1] = cg;
          colors[vL * 3 + 2] = cb;
          colors[vR * 3] = cr;
          colors[vR * 3 + 1] = cg;
          colors[vR * 3 + 2] = cb;
        } else {
          const vTip = vBase + 6;
          positions[vTip * 3] = cx;
          positions[vTip * 3 + 1] = cy;
          positions[vTip * 3 + 2] = cz;
          normals[vTip * 3] = nx;
          normals[vTip * 3 + 1] = ny;
          normals[vTip * 3 + 2] = nz;
          uvs[vTip * 2] = 0.5;
          uvs[vTip * 2 + 1] = 1;
          colors[vTip * 3] = cr;
          colors[vTip * 3 + 1] = cg;
          colors[vTip * 3 + 2] = cb;
        }
      }
      indices[iBase + 0] = vBase + 0;
      indices[iBase + 1] = vBase + 1;
      indices[iBase + 2] = vBase + 2;
      indices[iBase + 3] = vBase + 1;
      indices[iBase + 4] = vBase + 3;
      indices[iBase + 5] = vBase + 2;
      indices[iBase + 6] = vBase + 2;
      indices[iBase + 7] = vBase + 3;
      indices[iBase + 8] = vBase + 4;
      indices[iBase + 9] = vBase + 3;
      indices[iBase + 10] = vBase + 5;
      indices[iBase + 11] = vBase + 4;
      indices[iBase + 12] = vBase + 4;
      indices[iBase + 13] = vBase + 5;
      indices[iBase + 14] = vBase + 6;
    }
    const geo = new THREE2.BufferGeometry();
    geo.setIndex(new THREE2.BufferAttribute(indices, 1));
    geo.setAttribute("position", new THREE2.BufferAttribute(positions, 3));
    geo.setAttribute("normal", new THREE2.BufferAttribute(normals, 3));
    geo.setAttribute("uv", new THREE2.BufferAttribute(uvs, 2));
    geo.setAttribute("color", new THREE2.BufferAttribute(colors, 3));
    return geo;
  }
  function buildSkinned3DHairCoatGeometry(params) {
    var _a;
    const {
      bodyGeos,
      hairStyle,
      furDensity,
      hairLength,
      lodMult,
      torsoBulk,
      heightScale,
      pelvisY,
      headBones,
      neckIdx,
      torsoIdx,
      tailBaseIdx,
      tailTipIdx,
      boneToIndex,
      boneWorldPos
    } = params;
    const hasBodyCoat = hairStyle === "full_fur_coat" || hairStyle === "wild_mane_fur" || hairStyle === "dorsal_mohawk";
    const hasCranialHair = hairStyle === "long_flowing_hair" || hairStyle === "wild_mane_fur";
    const tris = [];
    const cdf = [];
    let totalWeightedArea = 0;
    const neckPos = boneWorldPos[neckIdx] || new THREE2.Vector3(0, pelvisY + 0.5, 0.2);
    const headPositions = headBones.map((hb) => {
      const idx = boneToIndex.get(hb);
      return idx !== void 0 && boneWorldPos[idx] ? boneWorldPos[idx] : new THREE2.Vector3().setFromMatrixPosition(hb.matrixWorld);
    });
    if (hasBodyCoat && bodyGeos.length > 0) {
      for (let gIdx = 0; gIdx < bodyGeos.length; gIdx++) {
        const g = bodyGeos[gIdx];
        const posAttr = g.getAttribute("position");
        const normAttr = g.getAttribute("normal");
        const idxAttr = g.getIndex();
        if (!posAttr || !normAttr) continue;
        const indexArray = idxAttr ? idxAttr.array : null;
        const triCount = indexArray ? Math.floor(indexArray.length / 3) : Math.floor(posAttr.count / 3);
        for (let t = 0; t < triCount; t++) {
          const i0 = indexArray ? indexArray[t * 3] : t * 3;
          const i1 = indexArray ? indexArray[t * 3 + 1] : t * 3 + 1;
          const i2 = indexArray ? indexArray[t * 3 + 2] : t * 3 + 2;
          const x0 = posAttr.getX(i0), y0 = posAttr.getY(i0), z0 = posAttr.getZ(i0);
          const x1 = posAttr.getX(i1), y1 = posAttr.getY(i1), z1 = posAttr.getZ(i1);
          const x2 = posAttr.getX(i2), y2 = posAttr.getY(i2), z2 = posAttr.getZ(i2);
          const cy = (y0 + y1 + y2) / 3;
          if (cy < 0.095) continue;
          const cx = (x0 + x1 + x2) / 3;
          const cz = (z0 + z1 + z2) / 3;
          const ny = (normAttr.getY(i0) + normAttr.getY(i1) + normAttr.getY(i2)) / 3;
          const ux = x1 - x0, uy = y1 - y0, uz = z1 - z0;
          const vx = x2 - x0, vy = y2 - y0, vz = z2 - z0;
          const crossX = uy * vz - uz * vy;
          const crossY = uz * vx - ux * vz;
          const crossZ = ux * vy - uy * vx;
          const area = 0.5 * Math.hypot(crossX, crossY, crossZ);
          if (area < 1e-6) continue;
          let weight = area;
          if (hairStyle === "dorsal_mohawk") {
            const isDorsalCrest = Math.abs(cx) < 0.21 * torsoBulk && ny > 0.14;
            weight *= isDorsalCrest ? 9.5 : 0.35;
          } else if (hairStyle === "wild_mane_fur") {
            const distNeck = Math.hypot(cx - neckPos.x, cy - neckPos.y, cz - neckPos.z);
            if (distNeck < 0.52 * torsoBulk) {
              weight *= 3.4;
            }
          }
          totalWeightedArea += weight;
          tris.push({ geoIdx: gIdx, i0, i1, i2 });
          cdf.push(totalWeightedArea);
        }
      }
    }
    const numBodyStrands = hasBodyCoat && tris.length > 0 ? Math.min(
      4200,
      Math.max(
        240,
        Math.round(
          (hairStyle === "dorsal_mohawk" ? 1900 : 2800) * Math.max(0.2, furDensity) * Math.min(1.45, lodMult)
        )
      )
    ) : 0;
    const strandsPerHead = hasCranialHair ? Math.min(
      720,
      Math.max(
        160,
        Math.round(
          (hairStyle === "long_flowing_hair" ? 520 : 360) * Math.max(0.3, furDensity) * Math.min(1.4, lodMult)
        )
      )
    ) : 0;
    const numCranialStrands = strandsPerHead * headBones.length;
    const totalStrands = numBodyStrands + numCranialStrands;
    if (totalStrands === 0) return null;
    const vertsPerStrand = 7;
    const trisPerStrand = 5;
    const totalVerts = totalStrands * vertsPerStrand;
    const totalIndices = totalStrands * trisPerStrand * 3;
    const positions = new Float32Array(totalVerts * 3);
    const normals = new Float32Array(totalVerts * 3);
    const uvs = new Float32Array(totalVerts * 2);
    const colors = new Float32Array(totalVerts * 3);
    const skinIndices = new Uint16Array(totalVerts * 4);
    const skinWeights = new Float32Array(totalVerts * 4);
    const indices = totalVerts > 65535 ? new Uint32Array(totalIndices) : new Uint16Array(totalIndices);
    const levels = [0, 0.33, 0.68, 1];
    const widthFactors = [1, 0.78, 0.44, 0];
    const writeStrandRibbon = (strandIdx, ptsX2, ptsY2, ptsZ2, rx, ry, rz, nx, ny, nz, baseW, shadeVar, sIdx42, sW42, tipSkinIdx4, tipSkinW4) => {
      const vBase = strandIdx * vertsPerStrand;
      const iBase = strandIdx * trisPerStrand * 3;
      for (let segIdx = 0; segIdx < 4; segIdx++) {
        const t = levels[segIdx];
        const cx = ptsX2[segIdx];
        const cy = ptsY2[segIdx];
        const cz = ptsZ2[segIdx];
        const lum = (0.34 + Math.pow(t, 0.82) * 1.06) * shadeVar;
        const cr = Math.min(1.48, lum * (0.97 + t * 0.09));
        const cg = Math.min(1.44, lum * (0.95 + t * 0.05));
        const cb = Math.min(1.38, lum * (0.91 - t * 0.01));
        const useTipSkin = tipSkinIdx4 && tipSkinW4 && segIdx >= 2;
        const activeIdx = useTipSkin ? tipSkinIdx4 : sIdx42;
        const activeW = useTipSkin ? tipSkinW4 : sW42;
        if (segIdx < 3) {
          const w = baseW * widthFactors[segIdx];
          const vL = vBase + segIdx * 2;
          const vR = vL + 1;
          positions[vL * 3] = cx - rx * w;
          positions[vL * 3 + 1] = cy - ry * w;
          positions[vL * 3 + 2] = cz - rz * w;
          positions[vR * 3] = cx + rx * w;
          positions[vR * 3 + 1] = cy + ry * w;
          positions[vR * 3 + 2] = cz + rz * w;
          normals[vL * 3] = nx;
          normals[vL * 3 + 1] = ny;
          normals[vL * 3 + 2] = nz;
          normals[vR * 3] = nx;
          normals[vR * 3 + 1] = ny;
          normals[vR * 3 + 2] = nz;
          uvs[vL * 2] = 0;
          uvs[vL * 2 + 1] = t;
          uvs[vR * 2] = 1;
          uvs[vR * 2 + 1] = t;
          colors[vL * 3] = cr;
          colors[vL * 3 + 1] = cg;
          colors[vL * 3 + 2] = cb;
          colors[vR * 3] = cr;
          colors[vR * 3 + 1] = cg;
          colors[vR * 3 + 2] = cb;
          for (let k = 0; k < 4; k++) {
            skinIndices[vL * 4 + k] = activeIdx[k];
            skinWeights[vL * 4 + k] = activeW[k];
            skinIndices[vR * 4 + k] = activeIdx[k];
            skinWeights[vR * 4 + k] = activeW[k];
          }
        } else {
          const vTip = vBase + 6;
          positions[vTip * 3] = cx;
          positions[vTip * 3 + 1] = cy;
          positions[vTip * 3 + 2] = cz;
          normals[vTip * 3] = nx;
          normals[vTip * 3 + 1] = ny;
          normals[vTip * 3 + 2] = nz;
          uvs[vTip * 2] = 0.5;
          uvs[vTip * 2 + 1] = 1;
          colors[vTip * 3] = cr;
          colors[vTip * 3 + 1] = cg;
          colors[vTip * 3 + 2] = cb;
          for (let k = 0; k < 4; k++) {
            skinIndices[vTip * 4 + k] = activeIdx[k];
            skinWeights[vTip * 4 + k] = activeW[k];
          }
        }
      }
      indices[iBase + 0] = vBase + 0;
      indices[iBase + 1] = vBase + 1;
      indices[iBase + 2] = vBase + 2;
      indices[iBase + 3] = vBase + 1;
      indices[iBase + 4] = vBase + 3;
      indices[iBase + 5] = vBase + 2;
      indices[iBase + 6] = vBase + 2;
      indices[iBase + 7] = vBase + 3;
      indices[iBase + 8] = vBase + 4;
      indices[iBase + 9] = vBase + 3;
      indices[iBase + 10] = vBase + 5;
      indices[iBase + 11] = vBase + 4;
      indices[iBase + 12] = vBase + 4;
      indices[iBase + 13] = vBase + 5;
      indices[iBase + 14] = vBase + 6;
    };
    const ptsX = [0, 0, 0, 0];
    const ptsY = [0, 0, 0, 0];
    const ptsZ = [0, 0, 0, 0];
    const sIdx4 = [0, 0, 0, 0];
    const sW4 = [1, 0, 0, 0];
    let strandCursor = 0;
    for (let s = 0; s < numBodyStrands; s++) {
      const targetArea = (s + 0.5) / numBodyStrands * totalWeightedArea;
      let lo = 0;
      let hi = cdf.length - 1;
      while (lo < hi) {
        const mid = lo + hi >> 1;
        if (cdf[mid] < targetArea) lo = mid + 1;
        else hi = mid;
      }
      const tri = tris[lo];
      const g = bodyGeos[tri.geoIdx];
      const posAttr = g.getAttribute("position");
      const normAttr = g.getAttribute("normal");
      const skinIdxAttr = g.getAttribute("skinIndex");
      const skinWAttr = g.getAttribute("skinWeight");
      const r1 = (s * 0.61803398875 % 1 + 1) % 1;
      const r2 = ((s * 0.38196601125 + 0.17) % 1 + 1) % 1;
      const sqrtR1 = Math.sqrt(r1);
      const bU = 1 - sqrtR1;
      const bV = sqrtR1 * (1 - r2);
      const bW = sqrtR1 * r2;
      const { i0, i1, i2 } = tri;
      const px = bU * posAttr.getX(i0) + bV * posAttr.getX(i1) + bW * posAttr.getX(i2);
      const py = bU * posAttr.getY(i0) + bV * posAttr.getY(i1) + bW * posAttr.getY(i2);
      const pz = bU * posAttr.getZ(i0) + bV * posAttr.getZ(i1) + bW * posAttr.getZ(i2);
      let nx = bU * normAttr.getX(i0) + bV * normAttr.getX(i1) + bW * normAttr.getX(i2);
      let ny = bU * normAttr.getY(i0) + bV * normAttr.getY(i1) + bW * normAttr.getY(i2);
      let nz = bU * normAttr.getZ(i0) + bV * normAttr.getZ(i1) + bW * normAttr.getZ(i2);
      const nLen = Math.hypot(nx, ny, nz) || 1;
      nx /= nLen;
      ny /= nLen;
      nz /= nLen;
      if (skinIdxAttr && skinWAttr) {
        sIdx4[0] = skinIdxAttr.getX(i0);
        sIdx4[1] = skinIdxAttr.getY(i0);
        sIdx4[2] = skinIdxAttr.getZ(i0);
        sIdx4[3] = skinIdxAttr.getW(i0);
        sW4[0] = skinWAttr.getX(i0);
        sW4[1] = skinWAttr.getY(i0);
        sW4[2] = skinWAttr.getZ(i0);
        sW4[3] = skinWAttr.getW(i0);
      }
      const domBone = sIdx4[0];
      const sideSign = px >= 0 ? 1 : -1;
      let fx = 0.16 * sideSign;
      let fy = -0.36;
      let fz = -0.88;
      let zoneLenMult = 1.05;
      let minHeadDist = Infinity;
      let nearestHeadZ = 0;
      for (let h = 0; h < headPositions.length; h++) {
        const hp = headPositions[h];
        const d = Math.hypot(px - hp.x, py - hp.y, pz - hp.z);
        if (d < minHeadDist) {
          minHeadDist = d;
          nearestHeadZ = pz - hp.z;
        }
      }
      const distNeck = Math.hypot(px - neckPos.x, py - neckPos.y, pz - neckPos.z);
      if (domBone === tailBaseIdx || domBone === tailTipIdx) {
        zoneLenMult = 1.65;
        fx = 0.22 * sideSign;
        fy = -0.18;
        fz = -0.95;
      } else if (minHeadDist < 0.42 * torsoBulk) {
        if (nearestHeadZ > 0.18) {
          zoneLenMult = 0.36;
          fx = 0.28 * sideSign;
          fy = -0.12;
          fz = -0.94;
        } else if (Math.abs(px) > 0.11 * torsoBulk) {
          zoneLenMult = 1.42;
          fx = 0.56 * sideSign;
          fy = -0.32;
          fz = -0.76;
        } else {
          zoneLenMult = 1.38;
          fx = 0.12 * sideSign;
          fy = 0.18;
          fz = -0.96;
        }
      } else if (distNeck < 0.48 * torsoBulk || domBone === neckIdx) {
        zoneLenMult = hairStyle === "wild_mane_fur" ? 2.15 : 1.52;
        fx = 0.38 * sideSign;
        fy = -0.24;
        fz = -0.88;
      } else if (Math.abs(px) < 0.18 * torsoBulk && ny > 0.22) {
        zoneLenMult = hairStyle === "dorsal_mohawk" ? 2.45 : 1.45;
        fx = 0.08 * sideSign;
        fy = hairStyle === "dorsal_mohawk" ? 0.68 : 0.28;
        fz = -0.88;
      } else if (py < pelvisY + 0.14 && Math.abs(px) > 0.14 * torsoBulk) {
        zoneLenMult = nz < -0.06 ? 1.45 : 0.92;
        fx = 0.1 * sideSign;
        fy = -0.86;
        fz = -0.48;
      }
      const dotFN = fx * nx + fy * ny + fz * nz;
      let tx = fx - dotFN * nx * 0.72;
      let ty = fy - dotFN * ny * 0.72;
      let tz = fz - dotFN * nz * 0.72;
      const tLen = Math.hypot(tx, ty, tz) || 1;
      tx /= tLen;
      ty /= tLen;
      tz /= tLen;
      const hash1 = s * 173 % 100 / 100;
      const hash2 = s * 293 % 100 / 100;
      const strandLen = (0.135 + hash1 * 0.075) * hairLength * zoneLenMult * (0.8 + 0.2 * torsoBulk);
      const baseW = (0.018 + hash2 * 9e-3) * Math.sqrt(torsoBulk);
      const twistAng = s * 2.3999632;
      let rx = ny * tz - nz * ty;
      let ry = nz * tx - nx * tz;
      let rz = nx * ty - ny * tx;
      const rLen = Math.hypot(rx, ry, rz) || 1;
      rx /= rLen;
      ry /= rLen;
      rz /= rLen;
      const cosTw = Math.cos(twistAng);
      const sinTw = Math.sin(twistAng) * 0.55;
      let twistRx = rx * cosTw + nx * sinTw;
      let twistRy = ry * cosTw + ny * sinTw;
      let twistRz = rz * cosTw + nz * sinTw;
      const trLen = Math.hypot(twistRx, twistRy, twistRz) || 1;
      twistRx /= trLen;
      twistRy /= trLen;
      twistRz /= trLen;
      const curlX = Math.sin(s * 1.7) * 0.045;
      const curlZ = Math.cos(s * 2.3) * 0.045;
      ptsX[0] = px - nx * 6e-3;
      ptsY[0] = py - ny * 6e-3;
      ptsZ[0] = pz - nz * 6e-3;
      ptsX[1] = px + strandLen * (0.22 * nx + 0.26 * tx);
      ptsY[1] = py + strandLen * (0.22 * ny + 0.26 * ty);
      ptsZ[1] = pz + strandLen * (0.22 * nz + 0.26 * tz);
      ptsX[2] = px + strandLen * (0.3 * nx + 0.62 * tx + curlX);
      ptsY[2] = py + strandLen * (0.3 * ny + 0.62 * ty - 0.12);
      ptsZ[2] = pz + strandLen * (0.3 * nz + 0.62 * tz + curlZ);
      ptsX[3] = px + strandLen * (0.28 * nx + 0.96 * tx + curlX * 1.65);
      ptsY[3] = py + strandLen * (0.28 * ny + 0.96 * ty - 0.26);
      ptsZ[3] = pz + strandLen * (0.28 * nz + 0.96 * tz + curlZ * 1.65);
      let bnx = nx * 0.72 + tx * 0.28;
      let bny = ny * 0.72 + 0.35;
      let bnz = nz * 0.72 + tz * 0.28;
      const bnLen = Math.hypot(bnx, bny, bnz) || 1;
      bnx /= bnLen;
      bny /= bnLen;
      bnz /= bnLen;
      const shadeVar = 0.88 + s * 43 % 25 * 0.01;
      writeStrandRibbon(
        strandCursor++,
        ptsX,
        ptsY,
        ptsZ,
        twistRx,
        twistRy,
        twistRz,
        bnx,
        bny,
        bnz,
        baseW,
        shadeVar,
        sIdx4,
        sW4
      );
    }
    if (hasCranialHair && strandsPerHead > 0) {
      const localPt = new THREE2.Vector3();
      const localNorm = new THREE2.Vector3();
      const normalMat = new THREE2.Matrix3();
      const rootSkinIdx = [0, neckIdx, torsoIdx, 0];
      const rootSkinW = [0.88, 0.12, 0, 0];
      const tipSkinIdx = [torsoIdx, neckIdx, 0, 0];
      const tipSkinW = [0.58, 0.24, 0.18, 0];
      for (let h = 0; h < headBones.length; h++) {
        const hBone = headBones[h];
        const hBoneIdx = (_a = boneToIndex.get(hBone)) != null ? _a : neckIdx;
        rootSkinIdx[0] = hBoneIdx;
        tipSkinIdx[2] = hBoneIdx;
        normalMat.getNormalMatrix(hBone.matrixWorld);
        for (let k = 0; k < strandsPerHead; k++) {
          const u = (k + 0.5) / strandsPerHead;
          const v = (k * 0.61803398875 % 1 + 1) % 1;
          const theta = (v - 0.5) * 2 * Math.PI * 0.76;
          const phi = -0.22 + u * 1.52;
          const cosPhi = Math.cos(phi);
          const sinPhi = Math.sin(phi);
          const sinTheta = Math.sin(theta);
          const cosTheta = -Math.cos(theta);
          const sx = sinTheta * cosPhi;
          const sy = sinPhi;
          const sz = cosTheta * cosPhi;
          localPt.set(sx * 0.21, 0.2 + sy * 0.21, 0.02 + sz * 0.24);
          localPt.applyMatrix4(hBone.matrixWorld);
          localNorm.set(sx, sy, sz).applyMatrix3(normalMat).normalize();
          const nx = localNorm.x;
          const ny = localNorm.y;
          const nz = localNorm.z;
          const px = localPt.x;
          const py = localPt.y;
          const pz = localPt.z;
          const sideSign = sx >= 0 ? 1 : -1;
          const isLongStyle = hairStyle === "long_flowing_hair";
          const hash1 = k * 137 % 100 / 100;
          const hash2 = k * 251 % 100 / 100;
          const longLen = (isLongStyle ? 0.62 + hash1 * 0.44 : 0.36 + hash1 * 0.26) * hairLength * heightScale;
          const baseW = (isLongStyle ? 0.024 : 0.022) * (0.85 + hash2 * 0.35) * Math.sqrt(torsoBulk);
          const waveX = Math.sin(k * 1.9) * 0.065 + sideSign * Math.abs(sx) * 0.24;
          const waveZ = Math.cos(k * 1.3) * 0.055 - 0.38;
          ptsX[0] = px - nx * 8e-3;
          ptsY[0] = py - ny * 8e-3;
          ptsZ[0] = pz - nz * 8e-3;
          ptsX[1] = px + longLen * (0.26 * nx + sideSign * 0.08);
          ptsY[1] = py + longLen * (0.18 * Math.max(0, ny) + 0.04);
          ptsZ[1] = pz + longLen * (0.22 * nz - 0.16);
          ptsX[2] = px + longLen * (0.34 * nx + waveX * 0.65);
          ptsY[2] = py + longLen * (-0.42 + 0.08 * ny);
          ptsZ[2] = pz + longLen * (0.24 * nz + waveZ * 0.72);
          ptsX[3] = px + longLen * (0.36 * nx + waveX * 1.15);
          ptsY[3] = py + longLen * (-0.88 + 0.05 * ny);
          ptsZ[3] = pz + longLen * (0.24 * nz + waveZ * 1.15);
          const twistAng = k * 2.3999632;
          let rx = Math.cos(theta + twistAng * 0.35);
          let ry = 0.15 * Math.sin(twistAng);
          let rz = Math.sin(theta + twistAng * 0.35);
          const rLen = Math.hypot(rx, ry, rz) || 1;
          rx /= rLen;
          ry /= rLen;
          rz /= rLen;
          let bnx = nx * 0.68 + sideSign * 0.15;
          let bny = Math.max(0.25, ny * 0.68 + 0.35);
          let bnz = nz * 0.68 - 0.32;
          const bnLen = Math.hypot(bnx, bny, bnz) || 1;
          bnx /= bnLen;
          bny /= bnLen;
          bnz /= bnLen;
          const shadeVar = 0.88 + k * 59 % 24 * 0.011;
          writeStrandRibbon(
            strandCursor++,
            ptsX,
            ptsY,
            ptsZ,
            rx,
            ry,
            rz,
            bnx,
            bny,
            bnz,
            baseW,
            shadeVar,
            rootSkinIdx,
            rootSkinW,
            tipSkinIdx,
            tipSkinW
          );
        }
      }
    }
    const outGeo = new THREE2.BufferGeometry();
    outGeo.setIndex(new THREE2.BufferAttribute(indices, 1));
    outGeo.setAttribute("position", new THREE2.BufferAttribute(positions, 3));
    outGeo.setAttribute("normal", new THREE2.BufferAttribute(normals, 3));
    outGeo.setAttribute("uv", new THREE2.BufferAttribute(uvs, 2));
    outGeo.setAttribute("color", new THREE2.BufferAttribute(colors, 3));
    outGeo.setAttribute("skinIndex", new THREE2.Uint16BufferAttribute(skinIndices, 4));
    outGeo.setAttribute("skinWeight", new THREE2.Float32BufferAttribute(skinWeights, 4));
    return outGeo;
  }
  function buildSkinned3DDragonScaleReliefGeometry(params) {
    const {
      bodyGeo,
      lodMult,
      torsoBulk,
      dorsalScale,
      textureRelief,
      isDragon,
      tailBaseIdx,
      tailTipIdx,
      boneWorldPos
    } = params;
    const posAttr = bodyGeo.getAttribute("position");
    const normAttr = bodyGeo.getAttribute("normal");
    const uvAttr = bodyGeo.getAttribute("uv");
    const skinIdxAttr = bodyGeo.getAttribute("skinIndex");
    const skinWAttr = bodyGeo.getAttribute("skinWeight");
    const idxAttr = bodyGeo.getIndex();
    if (!posAttr || !normAttr || !uvAttr || !skinIdxAttr || !skinWAttr) return null;
    const indexArray = idxAttr ? idxAttr.array : null;
    const triCount = indexArray ? Math.floor(indexArray.length / 3) : Math.floor(posAttr.count / 3);
    const cols = DRAGON_SCALE_GRID_COLS;
    const rows = DRAGON_SCALE_GRID_ROWS;
    const totalColsUV = DRAGON_SCALE_UV_REPEAT_X * cols;
    const totalRowsUV = DRAGON_SCALE_UV_REPEAT_Y * rows;
    const rxGrid = 0.55 * 1.1;
    const ryGrid = 0.62 * 1.1;
    const reliefFactor = Math.max(0.35, textureRelief);
    const bulkFactor = Math.pow(Math.max(0.6, torsoBulk), 0.45);
    const dorsalFactor = 0.8 + 0.32 * Math.max(0.4, dorsalScale);
    const maxScales = Math.min(
      2200,
      Math.max(360, Math.round((isDragon ? 1450 : 980) * Math.min(1.4, lodMult)))
    );
    const emitted = [];
    const occupiedCells = /* @__PURE__ */ new Set();
    const minCellSpacing = 0.029 * Math.max(0.78, Math.sqrt(torsoBulk));
    for (let t = 0; t < triCount; t++) {
      if (emitted.length >= maxScales) break;
      const i0 = indexArray ? indexArray[t * 3] : t * 3;
      const i1 = indexArray ? indexArray[t * 3 + 1] : t * 3 + 1;
      const i2 = indexArray ? indexArray[t * 3 + 2] : t * 3 + 2;
      const x0 = posAttr.getX(i0), y0 = posAttr.getY(i0), z0 = posAttr.getZ(i0);
      const x1 = posAttr.getX(i1), y1 = posAttr.getY(i1), z1 = posAttr.getZ(i1);
      const x2 = posAttr.getX(i2), y2 = posAttr.getY(i2), z2 = posAttr.getZ(i2);
      const cy = (y0 + y1 + y2) / 3;
      if (cy < 0.095) continue;
      const cx = (x0 + x1 + x2) / 3;
      const triNx = (normAttr.getX(i0) + normAttr.getX(i1) + normAttr.getX(i2)) / 3;
      const triNy = (normAttr.getY(i0) + normAttr.getY(i1) + normAttr.getY(i2)) / 3;
      if (triNy < -0.38 && Math.abs(cx) < 0.25 * torsoBulk) continue;
      if (isDragon && Math.abs(cx) > 0.64 * torsoBulk && cy > 1.05 && Math.abs(triNx) < 0.34) continue;
      const ux = x1 - x0, uy = y1 - y0, uz = z1 - z0;
      const vx = x2 - x0, vy = y2 - y0, vz = z2 - z0;
      const area = 0.5 * Math.hypot(
        uy * vz - uz * vy,
        uz * vx - ux * vz,
        ux * vy - uy * vx
      );
      if (area < 1e-6) continue;
      const u0 = uvAttr.getX(i0), v0 = uvAttr.getY(i0);
      const u1 = uvAttr.getX(i1), v1 = uvAttr.getY(i1);
      const u2 = uvAttr.getX(i2), v2 = uvAttr.getY(i2);
      if (v0 < 0.08 || v0 > 0.92 || v1 < 0.08 || v1 > 0.92 || v2 < 0.08 || v2 > 0.92 || u0 < 0.03 || u0 > 0.97 || u1 < 0.03 || u1 > 0.97 || u2 < 0.03 || u2 > 0.97) {
        continue;
      }
      const gx0 = u0 * totalColsUV;
      const gy0 = (1 - v0 * DRAGON_SCALE_UV_REPEAT_Y) * rows;
      const gx1 = u1 * totalColsUV;
      const gy1 = (1 - v1 * DRAGON_SCALE_UV_REPEAT_Y) * rows;
      const gx2 = u2 * totalColsUV;
      const gy2 = (1 - v2 * DRAGON_SCALE_UV_REPEAT_Y) * rows;
      const dgx1 = gx1 - gx0;
      const dgy1 = gy1 - gy0;
      const dgx2 = gx2 - gx0;
      const dgy2 = gy2 - gy0;
      if (Math.abs(dgx1) > 5 || Math.abs(dgx2) > 5 || Math.abs(dgy1) > 5 || Math.abs(dgy2) > 5) {
        continue;
      }
      const det = dgx1 * dgy2 - dgx2 * dgy1;
      if (Math.abs(det) < 1e-3) continue;
      const invDet = 1 / det;
      const dPdgxX = (dgy2 * ux - dgy1 * vx) * invDet;
      const dPdgxY = (dgy2 * uy - dgy1 * vy) * invDet;
      const dPdgxZ = (dgy2 * uz - dgy1 * vz) * invDet;
      const dPdgyX = (-dgx2 * ux + dgx1 * vx) * invDet;
      const dPdgyY = (-dgx2 * uy + dgx1 * vy) * invDet;
      const dPdgyZ = (-dgx2 * uz + dgx1 * vz) * invDet;
      const rawHalfW = Math.hypot(dPdgxX, dPdgxY, dPdgxZ) * rxGrid;
      const rawHalfL = Math.hypot(dPdgyX, dPdgyY, dPdgyZ) * ryGrid;
      if (rawHalfW < 9e-3 || rawHalfL < 9e-3 || rawHalfW > 0.075 * bulkFactor || rawHalfL > 0.085 * bulkFactor || rawHalfW / rawHalfL > 2.4 || rawHalfL / rawHalfW > 2.4) {
        continue;
      }
      const minR = Math.floor(Math.min(gy0, gy1, gy2) - 0.5);
      const maxR = Math.ceil(Math.max(gy0, gy1, gy2) - 0.5);
      const minGX = Math.min(gx0, gx1, gx2);
      const maxGX = Math.max(gx0, gx1, gx2);
      for (let r = minR; r <= maxR; r++) {
        const wrappedR = (r % rows + rows) % rows;
        const rowShift = wrappedR % 2 * 0.5;
        const centerGY = r + 0.5;
        const minC = Math.floor(minGX - rowShift - 0.5);
        const maxC = Math.ceil(maxGX - rowShift - 0.5);
        for (let c = minC; c <= maxC; c++) {
          const wrappedC = (c % cols + cols) % cols;
          const hashVal = getDragonScaleCellHash(wrappedR, wrappedC);
          if (hashVal <= 0.62) continue;
          const centerGX = c + rowShift + 0.5;
          const relGX = centerGX - gx0;
          const relGY = centerGY - gy0;
          const b1 = (relGX * dgy2 - dgx2 * relGY) * invDet;
          const b2 = (dgx1 * relGY - relGX * dgy1) * invDet;
          const b0 = 1 - b1 - b2;
          if (b0 < 0.02 || b1 < 0.02 || b2 < 0.02) continue;
          const px = b0 * x0 + b1 * x1 + b2 * x2;
          const py = b0 * y0 + b1 * y1 + b2 * y2;
          const pz = b0 * z0 + b1 * z1 + b2 * z2;
          if (py < 0.095) continue;
          const domBoneIdx = skinIdxAttr.getX(i0);
          const boneOrigin = boneWorldPos[domBoneIdx];
          if (boneOrigin) {
            const rxBone = px - boneOrigin.x;
            const ryBone = py - boneOrigin.y;
            const rzBone = pz - boneOrigin.z;
            const rDist = Math.hypot(rxBone, ryBone, rzBone);
            if (rDist > 0.04) {
              const outwardDot = (rxBone * triNx + ryBone * triNy + rzBone * ((normAttr.getZ(i0) + normAttr.getZ(i1) + normAttr.getZ(i2)) / 3)) / rDist;
              if (outwardDot < 0.15) continue;
            }
          }
          const latX = Math.floor(px / minCellSpacing);
          const latY = Math.floor(py / minCellSpacing);
          const latZ = Math.floor(pz / minCellSpacing);
          const cellKey = `${latX},${latY},${latZ}`;
          if (occupiedCells.has(cellKey)) continue;
          occupiedCells.add(cellKey);
          let nx = b0 * normAttr.getX(i0) + b1 * normAttr.getX(i1) + b2 * normAttr.getX(i2);
          let ny = b0 * normAttr.getY(i0) + b1 * normAttr.getY(i1) + b2 * normAttr.getY(i2);
          let nz = b0 * normAttr.getZ(i0) + b1 * normAttr.getZ(i1) + b2 * normAttr.getZ(i2);
          const nLen = Math.hypot(nx, ny, nz) || 1;
          nx /= nLen;
          ny /= nLen;
          nz /= nLen;
          const dotFN = dPdgyX * nx + dPdgyY * ny + dPdgyZ * nz;
          let fx = dPdgyX - dotFN * nx;
          let fy = dPdgyY - dotFN * ny;
          let fz = dPdgyZ - dotFN * nz;
          let fLen = Math.hypot(fx, fy, fz);
          if (fLen < 1e-5) {
            const domBone = skinIdxAttr.getX(i0);
            const sideSign = px >= 0 ? 1 : -1;
            fx = 0.14 * sideSign;
            fy = domBone === tailBaseIdx || domBone === tailTipIdx ? -0.14 : -0.35;
            fz = -0.92;
            const d2 = fx * nx + fy * ny + fz * nz;
            fx -= d2 * nx;
            fy -= d2 * ny;
            fz -= d2 * nz;
            fLen = Math.hypot(fx, fy, fz) || 1;
          }
          fx /= fLen;
          fy /= fLen;
          fz /= fLen;
          let rx = fy * nz - fz * ny;
          let ry = fz * nx - fx * nz;
          let rz = fx * ny - fy * nx;
          const rLen = Math.hypot(rx, ry, rz) || 1;
          rx /= rLen;
          ry /= rLen;
          rz /= rLen;
          const uvSign = dPdgxX * rx + dPdgxY * ry + dPdgxZ * rz >= 0 ? 1 : -1;
          const scaleHalfW = THREE2.MathUtils.clamp(
            rawHalfW * 0.98,
            0.015 * bulkFactor,
            0.048 * bulkFactor
          );
          const scaleHalfL = THREE2.MathUtils.clamp(
            rawHalfL * 0.98,
            0.018 * bulkFactor,
            0.058 * bulkFactor
          );
          const isDominantOsteoderm = hashVal > 0.82 || Math.abs(px) < 0.24 * torsoBulk && ny > 0.25;
          const avgSpan = 0.5 * (scaleHalfW + scaleHalfL);
          const scaleLift = avgSpan * (isDominantOsteoderm ? 0.68 : 0.44) * dorsalFactor * (0.65 + 0.55 * reliefFactor);
          const shadeVar = isDominantOsteoderm ? 1.04 + (hashVal - 0.82) * 0.35 : 0.96 + (hashVal - 0.62) * 0.25;
          const bestV = b0 >= b1 && b0 >= b2 ? i0 : b1 >= b2 ? i1 : i2;
          emitted.push({
            px,
            py,
            pz,
            nx,
            ny,
            nz,
            fx,
            fy,
            fz,
            rx,
            ry,
            rz,
            uvSign,
            centerGX,
            centerGY,
            scaleHalfW,
            scaleHalfL,
            scaleLift,
            shadeVar,
            sIdx: [
              skinIdxAttr.getX(bestV),
              skinIdxAttr.getY(bestV),
              skinIdxAttr.getZ(bestV),
              skinIdxAttr.getW(bestV)
            ],
            sW: [
              skinWAttr.getX(bestV),
              skinWAttr.getY(bestV),
              skinWAttr.getZ(bestV),
              skinWAttr.getW(bestV)
            ]
          });
        }
      }
    }
    if (emitted.length === 0) return null;
    const vertsPerScale = 7;
    const trisPerScale = 8;
    const totalVerts = emitted.length * vertsPerScale;
    const totalIndices = emitted.length * trisPerScale * 3;
    const positions = new Float32Array(totalVerts * 3);
    const normals = new Float32Array(totalVerts * 3);
    const uvs = new Float32Array(totalVerts * 2);
    const colors = new Float32Array(totalVerts * 3);
    const skinIndices = new Uint16Array(totalVerts * 4);
    const skinWeights = new Float32Array(totalVerts * 4);
    const indices = totalVerts > 65535 ? new Uint32Array(totalIndices) : new Uint16Array(totalIndices);
    const localShieldVerts = [
      [0, -0.88, -0.08],
      // v0: Root anchor sunk slightly into skin
      [-0.96, -0.12, 0.12],
      // v1: Upper-left shoulder
      [0.96, -0.12, 0.12],
      // v2: Upper-right shoulder
      [0, 0.16, 1],
      // v3: Central raised keel crown
      [0, 1.05, 0.68],
      // v4: Pointed overhanging scale tip
      [-0.72, 0.52, 0.34],
      // v5: Lower-left tapered flank
      [0.72, 0.52, 0.34]
      // v6: Lower-right tapered flank
    ];
    const lumProfile = [0.76, 0.94, 0.94, 1.18, 1.12, 0.98, 0.98];
    for (let i = 0; i < emitted.length; i++) {
      const sc = emitted[i];
      const vBase = i * vertsPerScale;
      const iBase = i * trisPerScale * 3;
      const {
        px,
        py,
        pz,
        nx,
        ny,
        nz,
        fx,
        fy,
        fz,
        rx,
        ry,
        rz,
        uvSign,
        centerGX,
        centerGY,
        scaleHalfW,
        scaleHalfL,
        scaleLift,
        shadeVar,
        sIdx,
        sW
      } = sc;
      for (let v = 0; v < vertsPerScale; v++) {
        const [lx, ly, liftFactor] = localShieldVerts[v];
        const worldOffR = lx * scaleHalfW;
        const worldOffF = ly * scaleHalfL;
        const worldOffN = liftFactor * scaleLift;
        positions[(vBase + v) * 3 + 0] = px + rx * worldOffR + fx * worldOffF + nx * worldOffN;
        positions[(vBase + v) * 3 + 1] = py + ry * worldOffR + fy * worldOffF + ny * worldOffN;
        positions[(vBase + v) * 3 + 2] = pz + rz * worldOffR + fz * worldOffF + nz * worldOffN;
        let vnx = nx + lx * 0.52 * rx + ly * 0.38 * fx;
        let vny = ny + lx * 0.52 * ry + ly * 0.38 * fy;
        let vnz = nz + lx * 0.52 * rz + ly * 0.38 * fz;
        const vnLen = Math.hypot(vnx, vny, vnz) || 1;
        normals[(vBase + v) * 3 + 0] = vnx / vnLen;
        normals[(vBase + v) * 3 + 1] = vny / vnLen;
        normals[(vBase + v) * 3 + 2] = vnz / vnLen;
        const gxV = centerGX + uvSign * lx * rxGrid * 0.92;
        const gyV = centerGY + ly * ryGrid * 0.92;
        uvs[(vBase + v) * 2 + 0] = gxV / totalColsUV;
        uvs[(vBase + v) * 2 + 1] = (1 - gyV / rows) / DRAGON_SCALE_UV_REPEAT_Y;
        const lum = lumProfile[v] * shadeVar;
        colors[(vBase + v) * 3 + 0] = Math.min(1.38, lum);
        colors[(vBase + v) * 3 + 1] = Math.min(1.36, lum * 0.99);
        colors[(vBase + v) * 3 + 2] = Math.min(1.34, lum * 0.98);
        for (let k = 0; k < 4; k++) {
          skinIndices[(vBase + v) * 4 + k] = sIdx[k];
          skinWeights[(vBase + v) * 4 + k] = sW[k];
        }
      }
      indices[iBase + 0] = vBase + 3;
      indices[iBase + 1] = vBase + 0;
      indices[iBase + 2] = vBase + 2;
      indices[iBase + 3] = vBase + 3;
      indices[iBase + 4] = vBase + 2;
      indices[iBase + 5] = vBase + 6;
      indices[iBase + 6] = vBase + 3;
      indices[iBase + 7] = vBase + 6;
      indices[iBase + 8] = vBase + 4;
      indices[iBase + 9] = vBase + 3;
      indices[iBase + 10] = vBase + 4;
      indices[iBase + 11] = vBase + 5;
      indices[iBase + 12] = vBase + 3;
      indices[iBase + 13] = vBase + 5;
      indices[iBase + 14] = vBase + 1;
      indices[iBase + 15] = vBase + 3;
      indices[iBase + 16] = vBase + 1;
      indices[iBase + 17] = vBase + 0;
      indices[iBase + 18] = vBase + 4;
      indices[iBase + 19] = vBase + 6;
      indices[iBase + 20] = vBase + 2;
      indices[iBase + 21] = vBase + 5;
      indices[iBase + 22] = vBase + 4;
      indices[iBase + 23] = vBase + 1;
    }
    const outGeo = new THREE2.BufferGeometry();
    outGeo.setIndex(new THREE2.BufferAttribute(indices, 1));
    outGeo.setAttribute("position", new THREE2.BufferAttribute(positions, 3));
    outGeo.setAttribute("normal", new THREE2.BufferAttribute(normals, 3));
    outGeo.setAttribute("uv", new THREE2.BufferAttribute(uvs, 2));
    outGeo.setAttribute("color", new THREE2.BufferAttribute(colors, 3));
    outGeo.setAttribute("skinIndex", new THREE2.Uint16BufferAttribute(skinIndices, 4));
    outGeo.setAttribute("skinWeight", new THREE2.Float32BufferAttribute(skinWeights, 4));
    outGeo.computeBoundingBox();
    outGeo.computeBoundingSphere();
    return outGeo;
  }
  function createWeaponSlashArcGeometry(isClaws, segments = 22) {
    const ribbons = isClaws ? [
      { xOff: -0.14, innerR: 0.42, outerR: 0.66, arc: Math.PI * 0.78 },
      { xOff: 0, innerR: 0.46, outerR: 0.76, arc: Math.PI * 0.86 },
      { xOff: 0.14, innerR: 0.42, outerR: 0.66, arc: Math.PI * 0.78 }
    ] : [
      { xOff: 0, innerR: 0.52, outerR: 1.18, arc: Math.PI * 0.92 },
      { xOff: 0.025, innerR: 0.76, outerR: 1.24, arc: Math.PI * 0.76 }
    ];
    const vertsPerRibbon = (segments + 1) * 2;
    const totalVerts = ribbons.length * vertsPerRibbon;
    const trisPerRibbon = segments * 2;
    const totalIndices = ribbons.length * trisPerRibbon * 3;
    const positions = new Float32Array(totalVerts * 3);
    const normals = new Float32Array(totalVerts * 3);
    const uvs = new Float32Array(totalVerts * 2);
    const colors = new Float32Array(totalVerts * 3);
    const indices = new Uint16Array(totalIndices);
    let vCursor = 0;
    let iCursor = 0;
    for (let rIdx = 0; rIdx < ribbons.length; rIdx++) {
      const rb = ribbons[rIdx];
      const startAngle = -rb.arc * 0.45;
      const baseVertex = vCursor;
      for (let s = 0; s <= segments; s++) {
        const u = s / segments;
        const angle = startAngle + u * rb.arc;
        const taper = Math.sin(u * Math.PI);
        const midR = (rb.innerR + rb.outerR) * 0.5;
        const halfSpan = (rb.outerR - rb.innerR) * 0.5 * Math.pow(taper, 0.65);
        const rInner = midR - halfSpan;
        const rOuter = midR + halfSpan;
        const sinA = Math.sin(angle);
        const cosA = Math.cos(angle);
        const yIn = sinA * rInner;
        const zIn = cosA * rInner + 0.22;
        const yOut = sinA * rOuter;
        const zOut = cosA * rOuter + 0.22;
        positions[vCursor * 3] = rb.xOff - (1 - u) * 0.02;
        positions[vCursor * 3 + 1] = yIn;
        positions[vCursor * 3 + 2] = zIn;
        normals[vCursor * 3] = 1;
        normals[vCursor * 3 + 1] = 0;
        normals[vCursor * 3 + 2] = 0;
        uvs[vCursor * 2] = u;
        uvs[vCursor * 2 + 1] = 0;
        const innerGlow = Math.pow(u, 1.3) * 0.55;
        colors[vCursor * 3] = innerGlow;
        colors[vCursor * 3 + 1] = innerGlow;
        colors[vCursor * 3 + 2] = innerGlow;
        vCursor++;
        positions[vCursor * 3] = rb.xOff + (1 - u) * 0.02;
        positions[vCursor * 3 + 1] = yOut;
        positions[vCursor * 3 + 2] = zOut;
        normals[vCursor * 3] = 1;
        normals[vCursor * 3 + 1] = 0;
        normals[vCursor * 3 + 2] = 0;
        uvs[vCursor * 2] = u;
        uvs[vCursor * 2 + 1] = 1;
        const outerGlow = Math.min(1, Math.pow(u, 0.85) * 1.15 * taper);
        colors[vCursor * 3] = outerGlow;
        colors[vCursor * 3 + 1] = outerGlow;
        colors[vCursor * 3 + 2] = outerGlow;
        vCursor++;
      }
      for (let s = 0; s < segments; s++) {
        const i0 = baseVertex + s * 2;
        const i1 = i0 + 1;
        const i2 = i0 + 2;
        const i3 = i0 + 3;
        indices[iCursor++] = i0;
        indices[iCursor++] = i1;
        indices[iCursor++] = i2;
        indices[iCursor++] = i2;
        indices[iCursor++] = i1;
        indices[iCursor++] = i3;
      }
    }
    const geo = new THREE2.BufferGeometry();
    geo.setIndex(new THREE2.BufferAttribute(indices, 1));
    geo.setAttribute("position", new THREE2.BufferAttribute(positions, 3));
    geo.setAttribute("normal", new THREE2.BufferAttribute(normals, 3));
    geo.setAttribute("uv", new THREE2.BufferAttribute(uvs, 2));
    geo.setAttribute("color", new THREE2.BufferAttribute(colors, 3));
    geo.computeBoundingSphere();
    return geo;
  }
  function tagExplodablePart(obj, explodeDir, partInfo) {
    obj.userData.basePos = obj.position.clone();
    obj.userData.explodeVec = explodeDir.clone();
    obj.userData.partInfo = partInfo;
    obj.traverse((child) => {
      if (child.isMesh) {
        child.userData.partInfo = partInfo;
        child.layers.enable(1);
      }
    });
  }
  function applySurfaceTexturesToMaterials(materials, config, textures) {
    var _a, _b;
    const patternId = getEffectiveTexturePattern(config);
    const relief = (_a = config.materials.textureRelief) != null ? _a : 0.85;
    const grainWear = (_b = config.materials.grainWearIntensity) != null ? _b : 0.85;
    const surf = patternId !== "none" ? textures.patterns[patternId] : null;
    const isFurPattern = patternId === "wolf_fur" || patternId === "chitin_fur";
    const newAlbedo = surf ? surf.albedoMap : null;
    const newBump = surf ? surf.bumpMap : grainWear > 0.02 ? textures.armorBumpMap : null;
    const newNormal = surf ? surf.normalMap : grainWear > 0.02 ? textures.armorNormalMap : null;
    const newRoughMap = grainWear > 0.05 ? textures.armorRoughnessMap : null;
    const isScalesPattern = patternId === "scales";
    const patternMult = isScalesPattern ? 0.032 : isFurPattern ? 0.024 : 0.012;
    const primaryBump = (patternId !== "none" ? patternMult * relief : 0) + 0.028 * grainWear;
    const secondaryBump = (patternId !== "none" ? patternMult * 0.9 * relief : 0) + 0.022 * grainWear;
    const underbodyBump = (patternId !== "none" ? patternMult * 0.85 * relief : 0) + 0.024 * grainWear;
    const normStrength = Math.min(1.4, Math.max(0.25, relief * 0.75 + grainWear * 0.35));
    if (materials.primaryArmorMat.map !== newAlbedo) {
      materials.primaryArmorMat.map = newAlbedo;
      materials.primaryArmorMat.needsUpdate = true;
    }
    if (materials.primaryArmorMat.bumpMap !== newBump) {
      materials.primaryArmorMat.bumpMap = newBump;
      materials.primaryArmorMat.needsUpdate = true;
    }
    if (materials.primaryArmorMat.normalMap !== newNormal) {
      materials.primaryArmorMat.normalMap = newNormal;
      materials.primaryArmorMat.needsUpdate = true;
    }
    if (materials.primaryArmorMat.roughnessMap !== newRoughMap) {
      materials.primaryArmorMat.roughnessMap = newRoughMap;
      materials.primaryArmorMat.needsUpdate = true;
    }
    materials.primaryArmorMat.bumpScale = primaryBump;
    materials.primaryArmorMat.normalScale.set(normStrength, normStrength);
    materials.primaryArmorMat.sheen = isFurPattern ? 0.88 : materials.primaryArmorMat.sheen;
    materials.primaryArmorMat.sheenRoughness = isFurPattern ? 0.42 : 0.55;
    materials.primaryArmorMat.clearcoatRoughness = Math.min(0.92, 0.2 + grainWear * 0.22);
    if (materials.secondaryTrimMat.map !== newAlbedo) {
      materials.secondaryTrimMat.map = newAlbedo;
      materials.secondaryTrimMat.needsUpdate = true;
    }
    if (materials.secondaryTrimMat.bumpMap !== newBump) {
      materials.secondaryTrimMat.bumpMap = newBump;
      materials.secondaryTrimMat.needsUpdate = true;
    }
    if (materials.secondaryTrimMat.normalMap !== newNormal) {
      materials.secondaryTrimMat.normalMap = newNormal;
      materials.secondaryTrimMat.needsUpdate = true;
    }
    if (materials.secondaryTrimMat.roughnessMap !== newRoughMap) {
      materials.secondaryTrimMat.roughnessMap = newRoughMap;
      materials.secondaryTrimMat.needsUpdate = true;
    }
    materials.secondaryTrimMat.bumpScale = secondaryBump;
    materials.secondaryTrimMat.normalScale.set(normStrength * 0.9, normStrength * 0.9);
    materials.secondaryTrimMat.sheen = isFurPattern ? 0.85 : materials.secondaryTrimMat.sheen;
    if (materials.underbodyMat.map !== newAlbedo) {
      materials.underbodyMat.map = newAlbedo;
      materials.underbodyMat.needsUpdate = true;
    }
    if (materials.underbodyMat.bumpMap !== newBump) {
      materials.underbodyMat.bumpMap = newBump;
      materials.underbodyMat.needsUpdate = true;
    }
    if (materials.underbodyMat.normalMap !== newNormal) {
      materials.underbodyMat.normalMap = newNormal;
      materials.underbodyMat.needsUpdate = true;
    }
    if (materials.underbodyMat.roughnessMap !== newRoughMap) {
      materials.underbodyMat.roughnessMap = newRoughMap;
      materials.underbodyMat.needsUpdate = true;
    }
    materials.underbodyMat.bumpScale = underbodyBump;
    materials.underbodyMat.normalScale.set(normStrength * 0.85, normStrength * 0.85);
  }
  function updateEnemyMaterialsInPlace(rig, config, textures, isSoftwareGl, wireframe) {
    var _a;
    const { materials: matCfg } = config;
    const grainWear = (_a = matCfg.grainWearIntensity) != null ? _a : 0.85;
    const wearRoughnessShift = (grainWear - 0.5) * 0.14;
    const {
      primaryArmorMat,
      secondaryTrimMat,
      underbodyMat,
      hairStrandMat,
      emissiveRuneMat,
      crystalCoreMat,
      slashTrailMat
    } = rig.materials;
    primaryArmorMat.color.set(matCfg.primaryColor);
    primaryArmorMat.metalness = Math.max(0.02, matCfg.metalness - Math.max(0, grainWear - 0.8) * 0.12);
    primaryArmorMat.roughness = Math.min(0.95, Math.max(0.08, matCfg.roughness + wearRoughnessShift));
    primaryArmorMat.anisotropy = isSoftwareGl ? 0 : matCfg.anisotropy;
    primaryArmorMat.wireframe = wireframe;
    secondaryTrimMat.color.set(matCfg.secondaryColor);
    secondaryTrimMat.metalness = Math.min(1, matCfg.metalness + 0.12);
    secondaryTrimMat.roughness = Math.min(
      0.94,
      Math.max(0.08, (matCfg.roughness + 0.32) % 0.85 + wearRoughnessShift)
    );
    secondaryTrimMat.wireframe = wireframe;
    underbodyMat.color.set(matCfg.underbodyColor);
    underbodyMat.metalness = Math.max(0.04, matCfg.metalness * 0.22);
    underbodyMat.roughness = Math.min(0.96, Math.max(0.15, matCfg.roughness + 0.38 + wearRoughnessShift));
    underbodyMat.wireframe = wireframe;
    hairStrandMat.color.set(matCfg.primaryColor).lerp(new THREE2.Color(matCfg.secondaryColor), 0.34);
    hairStrandMat.sheenColor.set(matCfg.secondaryColor).lerp(new THREE2.Color("#ffffff"), 0.38);
    hairStrandMat.wireframe = wireframe;
    emissiveRuneMat.color.set(matCfg.emissiveColor);
    emissiveRuneMat.emissive.set(matCfg.emissiveColor);
    emissiveRuneMat.emissiveIntensity = matCfg.emissiveIntensity;
    emissiveRuneMat.wireframe = wireframe;
    crystalCoreMat.color.set(matCfg.emissiveColor).lerp(new THREE2.Color("#ffffff"), 0.35);
    crystalCoreMat.emissive.set(matCfg.emissiveColor);
    crystalCoreMat.emissiveIntensity = matCfg.emissiveIntensity * 0.65;
    crystalCoreMat.wireframe = wireframe;
    slashTrailMat.color.set(matCfg.emissiveColor).lerp(new THREE2.Color("#ffffff"), 0.45);
    slashTrailMat.emissive.set(matCfg.emissiveColor);
    slashTrailMat.emissiveIntensity = matCfg.emissiveIntensity * 1.45;
    slashTrailMat.wireframe = wireframe;
    applySurfaceTexturesToMaterials(rig.materials, config, textures);
    rig.exportableGroup.userData.name = config.name;
    rig.exportableGroup.userData.title = config.title;
    rig.exportableGroup.userData.rpgStats = { ...config.stats };
  }
  function buildProceduralEnemy(config, textures, isSoftwareGl, wireframe) {
    var _a, _b, _c, _d, _e, _f, _g;
    const rootGroup = new THREE2.Group();
    rootGroup.name = `${config.id}_root`;
    const exportableGroup = new THREE2.Group();
    exportableGroup.name = config.id;
    exportableGroup.userData = {
      name: config.name,
      title: config.title,
      raceCategory: config.raceCategory,
      bodyPlan: config.bodyPlan,
      archetype: config.archetype,
      rpgStats: { ...config.stats },
      sockets: ["socket_head", "socket_weapon_r", "socket_shield_l", "socket_core"],
      generator: "AetherForge 3D RPG Studio"
    };
    rootGroup.add(exportableGroup);
    const geometriesToDispose = [];
    const materialsToDispose = [];
    const hairStyle = getEffectiveHairStyle(config);
    const furDensity = getEffectiveFurDensity(config);
    const hairLength = getEffectiveHairLength(config);
    const muscleDef = getEffectiveMuscleDefinition(config);
    const isAnimal = isAnimalEnemy(config);
    const effectiveWeapon = getEffectiveWeapon(config);
    exportableGroup.userData.isAnimal = isAnimal;
    exportableGroup.userData.effectiveWeapon = effectiveWeapon;
    const density = getEffectiveMeshDensity(config);
    const lodMult = density === "low" ? 0.9 : density === "high" ? 1.85 : 1.35;
    const seg = (base, min = 12) => Math.max(min, Math.round(base * lodMult));
    const trackGeo = (g, sculptAmp = 0.014, sculptFreq = 6, aoBottom = 0.26) => {
      sculptAndShadeGeometry(
        g,
        sculptAmp * (0.45 + muscleDef * 0.65),
        sculptFreq,
        aoBottom,
        furDensity * 65e-4
      );
      geometriesToDispose.push(g);
      return g;
    };
    const trackFurLock = (baseR, length, curveBack = 0.09) => {
      const g = createFurLockGeometry(
        baseR,
        length * hairLength,
        curveBack,
        density === "low" ? 5 : 7
      );
      geometriesToDispose.push(g);
      return g;
    };
    const trackMat = (m2) => {
      materialsToDispose.push(m2);
      return m2;
    };
    const rawM = config.morphology;
    const m = {
      heightScale: Number.isFinite(rawM.heightScale) ? rawM.heightScale : 1,
      torsoBulk: Number.isFinite(rawM.torsoBulk) ? rawM.torsoBulk : 1,
      shoulderWidth: Number.isFinite(rawM.shoulderWidth) ? rawM.shoulderWidth : 1,
      hornLength: Number.isFinite(rawM.hornLength) ? rawM.hornLength : 0.8,
      hornCurve: Number.isFinite(rawM.hornCurve) ? rawM.hornCurve : 0.6,
      pauldronSize: Number.isFinite(rawM.pauldronSize) ? rawM.pauldronSize : 1,
      weaponScale: Number.isFinite(rawM.weaponScale) ? rawM.weaponScale : 1,
      dorsalScale: Number.isFinite(rawM.dorsalScale) ? rawM.dorsalScale : 1,
      limbLength: Number.isFinite(rawM.limbLength) ? rawM.limbLength : 1,
      neckLength: Number.isFinite(rawM.neckLength) ? rawM.neckLength : 0.7,
      tailLength: Number.isFinite(rawM.tailLength) ? rawM.tailLength : 0.8,
      snoutLength: Number.isFinite(rawM.snoutLength) ? rawM.snoutLength : 0.8,
      headCount: Number.isFinite(rawM.headCount) ? rawM.headCount : 1,
      auraShardCount: Number.isFinite(rawM.auraShardCount) ? rawM.auraShardCount : 12,
      furDensity,
      hairLength,
      muscleDef
    };
    const { materials: matCfg, bodyPlan } = config;
    const isQuadruped = bodyPlan === "quadruped_beast" || bodyPlan === "dragon_wyvern";
    const isDragon = bodyPlan === "dragon_wyvern";
    const isArachnid = bodyPlan === "arachnid_scorpion";
    const isSerpentine = bodyPlan === "serpentine_naga";
    const isFloating = bodyPlan === "floating_magical";
    const isCentaur = config.archetype === "astral_centaur" || config.archetype === "aurora_ice_centaur" || config.archetype === "flayed_underworld_centaur" || config.archetype === "iron_crown_cataphract_skeleton" || config.archetype === "elite_centaur_steppe_khan" || config.archetype === "wow_centaur_kolkar_marauder" || config.archetype === "wow_mannoroth_pit_lord" || config.archetype === "wow_magnataur_northrend_behemoth" || config.archetype === "archer_species_7_centaur_khan_horsebow";
    const isBeholder = config.archetype === "arcane_beholder" || config.archetype === "kraken_deep_watcher" || config.archetype === "skull_tyrant_overlord" || config.archetype === "wow_cthun_old_god_eye";
    const isUndeadSkeleton = isUndeadArchetype(config);
    const isOrganicCreature = !isUndeadSkeleton && (config.raceCategory === "starter_animals" || config.raceCategory === "beasts" || config.raceCategory === "dragons" || config.raceCategory === "mythological" || isAnimalEnemy(config));
    const primaryArmorMat = trackMat(
      new THREE2.MeshPhysicalMaterial({
        name: "Mat_PrimarySurface",
        color: new THREE2.Color(matCfg.primaryColor),
        vertexColors: true,
        metalness: matCfg.metalness,
        roughness: matCfg.roughness,
        roughnessMap: textures.armorRoughnessMap,
        anisotropy: isSoftwareGl ? 0 : matCfg.anisotropy,
        anisotropyRotation: Math.PI / 4,
        sheen: isOrganicCreature || furDensity > 0.2 ? 0.82 : 0.15,
        sheenRoughness: furDensity > 0.2 ? 0.42 : 0.55,
        sheenColor: new THREE2.Color(matCfg.secondaryColor).lerp(new THREE2.Color("#ffffff"), 0.28),
        clearcoat: isDragon ? 0.38 : furDensity > 0.3 ? 0.04 : 0.12,
        clearcoatRoughness: 0.32,
        wireframe
      })
    );
    const secondaryTrimMat = trackMat(
      new THREE2.MeshPhysicalMaterial({
        name: "Mat_SecondaryScalesOrTrim",
        color: new THREE2.Color(matCfg.secondaryColor),
        vertexColors: true,
        metalness: isOrganicCreature ? Math.min(0.35, matCfg.metalness) : Math.min(1, matCfg.metalness + 0.12),
        roughness: Math.max(0.12, (matCfg.roughness + 0.28) % 0.85),
        sheen: isOrganicCreature || furDensity > 0.2 ? 0.78 : 0.1,
        sheenRoughness: 0.5,
        anisotropy: isSoftwareGl ? 0 : matCfg.anisotropy * 0.8,
        wireframe
      })
    );
    const underbodyMat = trackMat(
      new THREE2.MeshStandardMaterial({
        name: "Mat_UnderbodyHide",
        color: new THREE2.Color(matCfg.underbodyColor),
        vertexColors: true,
        metalness: Math.max(0.04, matCfg.metalness * 0.2),
        roughness: Math.min(0.92, matCfg.roughness + 0.38),
        wireframe
      })
    );
    const hairStrandMat = trackMat(
      new THREE2.MeshPhysicalMaterial({
        name: "Mat_3DHairStrands",
        color: new THREE2.Color(matCfg.primaryColor).lerp(new THREE2.Color(matCfg.secondaryColor), 0.34),
        vertexColors: true,
        metalness: 0.04,
        roughness: 0.48,
        sheen: 0.95,
        sheenRoughness: 0.32,
        sheenColor: new THREE2.Color(matCfg.secondaryColor).lerp(new THREE2.Color("#ffffff"), 0.38),
        anisotropy: isSoftwareGl ? 0 : 0.82,
        anisotropyRotation: Math.PI / 2,
        bumpMap: textures.patterns.wolf_fur.bumpMap,
        bumpScale: 0.024,
        normalMap: textures.patterns.wolf_fur.normalMap,
        normalScale: new THREE2.Vector2(0.85, 0.85),
        side: THREE2.DoubleSide,
        wireframe
      })
    );
    const ivoryFangMat = trackMat(
      new THREE2.MeshStandardMaterial({
        name: "Mat_IvoryFangsAndHorns",
        color: new THREE2.Color("#e8e0cc"),
        vertexColors: true,
        metalness: 0.06,
        roughness: 0.36,
        bumpMap: textures.armorBumpMap,
        bumpScale: 4e-3,
        normalMap: textures.armorNormalMap,
        normalScale: new THREE2.Vector2(0.35, 0.35),
        wireframe
      })
    );
    const bladeAlloyMat = trackMat(
      new THREE2.MeshPhysicalMaterial({
        name: "Mat_WeaponBlade",
        color: new THREE2.Color("#dce5f2"),
        vertexColors: true,
        metalness: 0.94,
        roughness: 0.14,
        map: textures.patterns.damascus_plate.albedoMap,
        bumpMap: textures.patterns.damascus_plate.bumpMap,
        bumpScale: 8e-3,
        normalMap: textures.patterns.damascus_plate.normalMap,
        normalScale: new THREE2.Vector2(0.55, 0.55),
        anisotropy: isSoftwareGl ? 0 : 0.75,
        clearcoat: 0.4,
        wireframe
      })
    );
    const emissiveRuneMat = trackMat(
      new THREE2.MeshStandardMaterial({
        name: "Mat_RunicEmissive",
        color: new THREE2.Color(matCfg.emissiveColor),
        emissive: new THREE2.Color(matCfg.emissiveColor),
        emissiveIntensity: matCfg.emissiveIntensity,
        roughness: 0.15,
        metalness: 0.1,
        wireframe
      })
    );
    const crystalCoreMat = trackMat(
      new THREE2.MeshPhysicalMaterial({
        name: "Mat_ArcaneCrystal",
        color: new THREE2.Color(matCfg.emissiveColor).lerp(new THREE2.Color("#ffffff"), 0.35),
        emissive: new THREE2.Color(matCfg.emissiveColor),
        emissiveIntensity: matCfg.emissiveIntensity * 0.65,
        metalness: 0.1,
        roughness: 0.08,
        transmission: isSoftwareGl ? 0 : matCfg.crystalTransmission,
        transparent: true,
        opacity: isSoftwareGl ? 0.78 : 1,
        ior: 1.75,
        thickness: 1.2,
        clearcoat: 1,
        wireframe
      })
    );
    const slashTrailMat = trackMat(
      new THREE2.MeshStandardMaterial({
        name: "Mat_WeaponSlashTrail",
        color: new THREE2.Color(matCfg.emissiveColor).lerp(new THREE2.Color("#ffffff"), 0.45),
        emissive: new THREE2.Color(matCfg.emissiveColor),
        emissiveIntensity: matCfg.emissiveIntensity * 1.45,
        vertexColors: true,
        roughness: 0.12,
        metalness: 0.08,
        transparent: true,
        opacity: 0.88,
        side: THREE2.DoubleSide,
        depthWrite: false,
        wireframe
      })
    );
    applySurfaceTexturesToMaterials(
      {
        primaryArmorMat,
        secondaryTrimMat,
        underbodyMat,
        hairStrandMat,
        emissiveRuneMat,
        crystalCoreMat,
        slashTrailMat
      },
      config,
      textures
    );
    const explodableParts = [];
    const legHeight = isSerpentine ? 0.55 * m.limbLength : isArachnid ? 0.68 * m.limbLength : isQuadruped ? 0.92 * m.limbLength : 1.05 * m.limbLength;
    const pelvisY = isFloating ? legHeight + 0.38 : legHeight;
    const makeBone = (name) => {
      const bone = new THREE2.Bone();
      bone.name = name;
      return bone;
    };
    const rootBone = makeBone("Root_Bone");
    exportableGroup.add(rootBone);
    const pelvisGroup = makeBone("Pelvis_Chassis");
    pelvisGroup.position.set(0, pelvisY, isQuadruped ? -0.36 : 0);
    rootBone.add(pelvisGroup);
    if (isSerpentine) {
      const coilCurve = new THREE2.CatmullRomCurve3([
        new THREE2.Vector3(0, 0.24, 0),
        new THREE2.Vector3(0.08 * m.torsoBulk, -0.06, 0.08),
        new THREE2.Vector3(0.32 * m.torsoBulk, -legHeight * 0.45, 0.25),
        new THREE2.Vector3(0, -legHeight + 0.14, 0.48),
        new THREE2.Vector3(-0.42 * m.torsoBulk, -legHeight + 0.12, 0.05),
        new THREE2.Vector3(-0.15 * m.torsoBulk, -legHeight + 0.1, -0.55),
        new THREE2.Vector3(0.35 * m.torsoBulk, -legHeight + 0.08, -0.88),
        new THREE2.Vector3(0.12 * m.torsoBulk, -legHeight + 0.05, -1.18)
      ]);
      if (isUndeadSkeleton) {
        const serpDarkMat = trackMat(
          new THREE2.MeshStandardMaterial({
            name: "Mat_SerpSkeletonCord",
            color: new THREE2.Color("#08090d"),
            roughness: 0.92,
            metalness: 0.05,
            wireframe
          })
        );
        const cordGeo = trackGeo(
          new THREE2.TubeGeometry(coilCurve, seg(28, 18), 0.045 * m.torsoBulk, seg(8, 6), false),
          6e-3
        );
        pelvisGroup.add(new THREE2.Mesh(cordGeo, serpDarkMat));
        const serpVertCount = 18;
        for (let sv = 0; sv < serpVertCount; sv++) {
          const u = sv / (serpVertCount - 1);
          const pt = coilCurve.getPoint(u);
          const tang = coilCurve.getTangent(u);
          const vScale = (1 - u * 0.45) * m.torsoBulk;
          const vGeo = trackGeo(
            new THREE2.CylinderGeometry(0.075 * vScale, 0.082 * vScale, 0.08, seg(10, 8)),
            6e-3
          );
          vGeo.rotateX(Math.PI / 2);
          const vMesh = new THREE2.Mesh(vGeo, ivoryFangMat);
          vMesh.position.copy(pt);
          vMesh.lookAt(pt.clone().add(tang));
          pelvisGroup.add(vMesh);
          if (sv < 14) {
            const ribRingGeo = trackGeo(
              new THREE2.TorusGeometry(0.16 * vScale, 0.022 * vScale, 6, 12, Math.PI * 1.45),
              4e-3
            );
            const ribRing = new THREE2.Mesh(ribRingGeo, ivoryFangMat);
            ribRing.position.copy(pt);
            ribRing.lookAt(pt.clone().add(tang));
            pelvisGroup.add(ribRing);
          }
        }
      } else {
        const coilGeo = trackGeo(
          new THREE2.TubeGeometry(coilCurve, seg(32, 20), 0.24 * m.torsoBulk, seg(16, 12), false),
          0.022
        );
        const coilMesh = new THREE2.Mesh(coilGeo, primaryArmorMat);
        coilMesh.castShadow = true;
        coilMesh.receiveShadow = true;
        pelvisGroup.add(coilMesh);
        const waistCollarPts = [
          new THREE2.Vector2(0.24 * m.torsoBulk, -0.08),
          new THREE2.Vector2(0.32 * m.torsoBulk, 0.12),
          new THREE2.Vector2(0.35 * m.torsoBulk, 0.28),
          new THREE2.Vector2(0.29 * m.torsoBulk, 0.42)
        ];
        const waistCollarGeo = trackGeo(new THREE2.LatheGeometry(waistCollarPts, seg(18, 12)), 0.018);
        const waistCollarMesh = new THREE2.Mesh(waistCollarGeo, secondaryTrimMat);
        waistCollarMesh.position.y = 0.02;
        pelvisGroup.add(waistCollarMesh);
        const serpBridgeCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(0.06 * m.torsoBulk, -0.05, 0.06),
          new THREE2.Vector3(0, 0.14, 0.02),
          new THREE2.Vector3(0, 0.36, 0)
        ]);
        const serpBridgeGeo = trackGeo(
          new THREE2.TubeGeometry(serpBridgeCurve, seg(14, 10), 0.27 * m.torsoBulk, seg(16, 12), false),
          0.018
        );
        const serpBridgeMesh = new THREE2.Mesh(serpBridgeGeo, primaryArmorMat);
        pelvisGroup.add(serpBridgeMesh);
      }
    } else if (isQuadruped) {
      if (isUndeadSkeleton) {
        const quadDarkMat = trackMat(
          new THREE2.MeshStandardMaterial({
            name: "Mat_QuadSkeletonSocketVoid",
            color: new THREE2.Color("#08090d"),
            roughness: 0.92,
            metalness: 0.05,
            wireframe
          })
        );
        const quadSpineCoreGeo = trackGeo(
          new THREE2.CylinderGeometry(0.038 * m.torsoBulk, 0.044 * m.torsoBulk, 0.78, seg(10, 8)),
          6e-3
        );
        quadSpineCoreGeo.rotateX(Math.PI / 2);
        const quadSpineCore = new THREE2.Mesh(quadSpineCoreGeo, quadDarkMat);
        quadSpineCore.position.set(0, 0.14, 0.16);
        pelvisGroup.add(quadSpineCore);
        for (let lv = 0; lv < 5; lv++) {
          const lz = -0.18 + lv * 0.16;
          const ly = 0.12 + Math.sin(lv / 4 * Math.PI) * 0.04;
          const centrumGeo = trackGeo(
            new THREE2.CylinderGeometry(0.078 * m.torsoBulk, 0.082 * m.torsoBulk, 0.085, seg(12, 8)),
            8e-3
          );
          centrumGeo.rotateX(Math.PI / 2);
          const centrum = new THREE2.Mesh(centrumGeo, ivoryFangMat);
          centrum.position.set(0, ly, lz);
          pelvisGroup.add(centrum);
          const discGeo = trackGeo(
            new THREE2.CylinderGeometry(0.07 * m.torsoBulk, 0.07 * m.torsoBulk, 0.028, seg(10, 8)),
            2e-3
          );
          discGeo.rotateX(Math.PI / 2);
          const disc = new THREE2.Mesh(discGeo, quadDarkMat);
          disc.position.set(0, ly, lz + 0.055);
          pelvisGroup.add(disc);
          const transGeo = trackGeo(
            new THREE2.CapsuleGeometry(0.022 * m.torsoBulk, 0.24 * m.torsoBulk, 6, 8),
            6e-3
          );
          transGeo.rotateZ(Math.PI / 2);
          const trans = new THREE2.Mesh(transGeo, ivoryFangMat);
          trans.position.set(0, ly, lz);
          pelvisGroup.add(trans);
          const spinousGeo = trackGeo(
            new THREE2.ConeGeometry(0.032 * m.torsoBulk, 0.16 * m.torsoBulk, 6),
            6e-3
          );
          spinousGeo.rotateX(-0.32);
          const spinous = new THREE2.Mesh(spinousGeo, ivoryFangMat);
          spinous.position.set(0, ly + 0.11 * m.torsoBulk, lz);
          pelvisGroup.add(spinous);
        }
        for (const side of [-1, 1]) {
          const iliumCurve = new THREE2.CatmullRomCurve3([
            new THREE2.Vector3(side * 0.07 * m.torsoBulk, 0.16, -0.18),
            new THREE2.Vector3(side * 0.28 * m.torsoBulk, 0.22, -0.04),
            new THREE2.Vector3(side * 0.26 * m.torsoBulk, 0.02, 0.06),
            new THREE2.Vector3(side * 0.12 * m.torsoBulk, -0.08, -0.12)
          ]);
          const iliumGeo = trackGeo(
            new THREE2.TubeGeometry(iliumCurve, seg(14, 10), 0.044 * m.torsoBulk, seg(8, 6), false),
            8e-3
          );
          pelvisGroup.add(new THREE2.Mesh(iliumGeo, ivoryFangMat));
        }
      } else {
        const croupPts = [
          new THREE2.Vector2(0.01, -0.38),
          new THREE2.Vector2(0.26 * m.torsoBulk, -0.28),
          // Rounded rump / tail base
          new THREE2.Vector2(0.37 * m.torsoBulk, -0.06),
          // Muscular hind haunch / pelvis
          new THREE2.Vector2(0.33 * m.torsoBulk, 0.22),
          // Tucked athletic abdominal waist
          new THREE2.Vector2(0.41 * m.torsoBulk, 0.5),
          // Deep overlap into rear ribcage
          new THREE2.Vector2(0.32 * m.torsoBulk, 0.68),
          new THREE2.Vector2(0.01, 0.74)
        ];
        const croupGeo = trackGeo(new THREE2.LatheGeometry(croupPts, seg(20, 14)), 0.02);
        croupGeo.rotateX(Math.PI / 2);
        croupGeo.scale(0.92, 1.04, 1);
        const croupMesh = new THREE2.Mesh(croupGeo, primaryArmorMat);
        croupMesh.position.set(0, 0.04, -0.08);
        croupMesh.castShadow = true;
        pelvisGroup.add(croupMesh);
        const lumbarBridgeCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(0, 0.08, -0.02),
          new THREE2.Vector3(0, 0.09, 0.24),
          new THREE2.Vector3(0, 0.12, 0.52)
        ]);
        const lumbarBridgeGeo = trackGeo(
          new THREE2.TubeGeometry(lumbarBridgeCurve, seg(14, 10), 0.34 * m.torsoBulk, seg(16, 12), false),
          0.02
        );
        lumbarBridgeGeo.scale(0.92, 0.96, 1);
        const lumbarBridgeMesh = new THREE2.Mesh(lumbarBridgeGeo, primaryArmorMat);
        pelvisGroup.add(lumbarBridgeMesh);
        if (muscleDef > 0.15) {
          const mScale = 0.8 + muscleDef * 0.32;
          for (const side of [-1, 1]) {
            const gluteGeo = trackGeo(
              new THREE2.SphereGeometry(0.19 * m.torsoBulk * mScale, seg(12, 8), seg(10, 8)),
              0.022
            );
            gluteGeo.scale(0.86, 1.08, 1.45);
            const gluteMesh = new THREE2.Mesh(gluteGeo, primaryArmorMat);
            gluteMesh.position.set(side * 0.16 * m.torsoBulk, 0.14, -0.14);
            gluteMesh.rotation.y = -side * 0.12;
            pelvisGroup.add(gluteMesh);
            const obliqueFlankGeo = trackGeo(
              new THREE2.SphereGeometry(0.14 * m.torsoBulk * mScale, seg(12, 8), seg(10, 8)),
              0.018
            );
            obliqueFlankGeo.scale(0.75, 0.95, 1.85);
            const obliqueFlankMesh = new THREE2.Mesh(obliqueFlankGeo, primaryArmorMat);
            obliqueFlankMesh.position.set(side * 0.24 * m.torsoBulk, 0.08, 0.22);
            obliqueFlankMesh.rotation.y = side * 0.08;
            pelvisGroup.add(obliqueFlankMesh);
          }
        }
        const bellyRingCount = 5;
        for (let b = 0; b < bellyRingCount; b++) {
          const frac = b / (bellyRingCount - 1);
          const zOff = -0.24 + frac * 0.72;
          const rad = (0.24 + Math.sin(frac * Math.PI) * 0.08) * m.torsoBulk;
          const scuteGeo = trackGeo(new THREE2.SphereGeometry(rad, seg(14, 10), seg(10, 8)));
          scuteGeo.scale(0.84, 0.55, 0.85);
          const scuteMesh = new THREE2.Mesh(scuteGeo, underbodyMat);
          scuteMesh.position.set(0, -0.06 + frac * 0.03, zOff);
          pelvisGroup.add(scuteMesh);
        }
      }
    } else if (isArachnid) {
      if (isUndeadSkeleton) {
        for (let r = 0; r < 6; r++) {
          const rFrac = r / 5;
          const archRad = (0.44 - Math.abs(rFrac - 0.45) * 0.22) * m.torsoBulk;
          const archGeo = trackGeo(
            new THREE2.TorusGeometry(archRad, 0.034 * m.torsoBulk, seg(8, 6), seg(16, 12), Math.PI * 1.4)
          );
          const archMesh = new THREE2.Mesh(archGeo, ivoryFangMat);
          archMesh.position.set(0, 0.12, -0.06 - r * 0.14);
          archMesh.rotation.x = -0.18;
          archMesh.rotation.z = -Math.PI * 0.2;
          pelvisGroup.add(archMesh);
        }
        const spineBarGeo = trackGeo(
          new THREE2.CylinderGeometry(0.055 * m.torsoBulk, 0.045 * m.torsoBulk, 0.92, seg(10, 8))
        );
        spineBarGeo.rotateX(Math.PI / 2);
        const spineBar = new THREE2.Mesh(spineBarGeo, ivoryFangMat);
        spineBar.position.set(0, 0.22 * m.torsoBulk, -0.34);
        pelvisGroup.add(spineBar);
      } else {
        const abdomenGeo = trackGeo(
          new THREE2.SphereGeometry(0.48 * m.torsoBulk, seg(20, 14), seg(14, 10))
        );
        abdomenGeo.scale(1.05, 0.76, 1.48);
        const abdomenMesh = new THREE2.Mesh(abdomenGeo, primaryArmorMat);
        abdomenMesh.position.set(0, 0.1, -0.36);
        abdomenMesh.castShadow = true;
        pelvisGroup.add(abdomenMesh);
        for (let r = 0; r < 3; r++) {
          const archGeo = trackGeo(
            new THREE2.TorusGeometry(
              (0.42 - r * 0.05) * m.torsoBulk,
              0.038,
              seg(10, 8),
              seg(18, 12),
              Math.PI
            )
          );
          const archMesh = new THREE2.Mesh(archGeo, secondaryTrimMat);
          archMesh.position.set(0, 0.12, -0.14 - r * 0.22);
          archMesh.rotation.x = -0.2;
          pelvisGroup.add(archMesh);
        }
        const pedicelCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(0, 0.08, -0.22),
          new THREE2.Vector3(0, 0.07, 0.02),
          new THREE2.Vector3(0, 0.14, 0.18)
        ]);
        const pedicelGeo = trackGeo(
          new THREE2.TubeGeometry(pedicelCurve, seg(12, 8), 0.26 * m.torsoBulk, seg(14, 10), false),
          0.018
        );
        pedicelGeo.scale(1.12, 0.78, 1);
        const pedicelMesh = new THREE2.Mesh(pedicelGeo, underbodyMat);
        pelvisGroup.add(pedicelMesh);
        const cephaloGeo = trackGeo(
          new THREE2.SphereGeometry(0.38 * m.torsoBulk, seg(16, 12), seg(12, 10))
        );
        cephaloGeo.scale(1.15, 0.72, 1.32);
        const cephaloMesh = new THREE2.Mesh(cephaloGeo, secondaryTrimMat);
        cephaloMesh.position.set(0, 0.06, 0.12);
        pelvisGroup.add(cephaloMesh);
      }
    } else if (isUndeadSkeleton) {
      const darkBoneCavityMat = trackMat(
        new THREE2.MeshStandardMaterial({
          name: "Mat_SkullSocketVoid",
          color: new THREE2.Color("#08090d"),
          roughness: 0.92,
          metalness: 0.05,
          wireframe
        })
      );
      const sacrumGeo = trackGeo(
        new THREE2.ConeGeometry(0.145 * m.torsoBulk, 0.28, seg(10, 8)),
        0.012
      );
      sacrumGeo.scale(1.18, 1, 0.58);
      const sacrumMesh = new THREE2.Mesh(sacrumGeo, ivoryFangMat);
      sacrumMesh.position.set(0, 0.02, -0.14 * m.torsoBulk);
      sacrumMesh.rotation.x = Math.PI - 0.18;
      sacrumMesh.castShadow = true;
      pelvisGroup.add(sacrumMesh);
      const spinalCordGeo = trackGeo(
        new THREE2.CylinderGeometry(0.036 * m.torsoBulk, 0.042 * m.torsoBulk, 0.52, seg(10, 8)),
        6e-3
      );
      const spinalCordMesh = new THREE2.Mesh(spinalCordGeo, darkBoneCavityMat);
      spinalCordMesh.position.set(0, 0.24, -0.12 * m.torsoBulk);
      pelvisGroup.add(spinalCordMesh);
      for (let lv = 0; lv < 4; lv++) {
        const ly = 0.08 + lv * 0.115;
        const lz = (-0.125 + lv * 6e-3) * m.torsoBulk;
        const centrumGeo = trackGeo(
          new THREE2.CylinderGeometry(
            0.078 * m.torsoBulk,
            0.082 * m.torsoBulk,
            0.068,
            seg(14, 10)
          ),
          8e-3
        );
        centrumGeo.scale(1.12, 1, 0.92);
        const centrumMesh = new THREE2.Mesh(centrumGeo, ivoryFangMat);
        centrumMesh.position.set(0, ly, lz);
        centrumMesh.castShadow = true;
        pelvisGroup.add(centrumMesh);
        const discGeo = trackGeo(
          new THREE2.CylinderGeometry(
            0.072 * m.torsoBulk,
            0.072 * m.torsoBulk,
            0.026,
            seg(12, 8)
          ),
          2e-3
        );
        const discMesh = new THREE2.Mesh(discGeo, darkBoneCavityMat);
        discMesh.position.set(0, ly + 0.046, lz);
        pelvisGroup.add(discMesh);
        const transGeo = trackGeo(
          new THREE2.CapsuleGeometry(0.022 * m.torsoBulk, 0.16 * m.torsoBulk, 6, 8),
          6e-3
        );
        transGeo.rotateZ(Math.PI / 2);
        const transMesh = new THREE2.Mesh(transGeo, ivoryFangMat);
        transMesh.position.set(0, ly, lz - 0.035 * m.torsoBulk);
        pelvisGroup.add(transMesh);
        const spinousGeo = trackGeo(
          new THREE2.ConeGeometry(0.028 * m.torsoBulk, 0.11 * m.torsoBulk, 6),
          6e-3
        );
        spinousGeo.rotateX(-Math.PI * 0.58);
        const spinousMesh = new THREE2.Mesh(spinousGeo, ivoryFangMat);
        spinousMesh.position.set(0, ly - 0.01, lz - 0.085 * m.torsoBulk);
        pelvisGroup.add(spinousMesh);
      }
      for (const side of [-1, 1]) {
        const iliumCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(side * 0.08 * m.torsoBulk, 0.08, -0.14 * m.torsoBulk),
          new THREE2.Vector3(side * 0.34 * m.torsoBulk, 0.19, -0.02 * m.torsoBulk),
          new THREE2.Vector3(side * 0.36 * m.torsoBulk, 0.06, 0.14 * m.torsoBulk),
          new THREE2.Vector3(side * 0.24 * m.torsoBulk, -0.06, 0.12 * m.torsoBulk),
          new THREE2.Vector3(side * 0.04 * m.torsoBulk, -0.11, 0.19 * m.torsoBulk)
        ]);
        const iliumGeo = trackGeo(
          new THREE2.TubeGeometry(iliumCurve, seg(16, 12), 0.046 * m.torsoBulk, seg(10, 8), false),
          0.01
        );
        const iliumMesh = new THREE2.Mesh(iliumGeo, ivoryFangMat);
        iliumMesh.castShadow = true;
        pelvisGroup.add(iliumMesh);
        const alaGeo = trackGeo(
          new THREE2.SphereGeometry(0.135 * m.torsoBulk, seg(12, 8), seg(10, 8)),
          0.012
        );
        alaGeo.scale(0.88, 0.95, 0.38);
        const alaMesh = new THREE2.Mesh(alaGeo, ivoryFangMat);
        alaMesh.position.set(side * 0.24 * m.torsoBulk, 0.09, 0.02 * m.torsoBulk);
        alaMesh.rotation.y = side * 0.48;
        alaMesh.rotation.x = 0.22;
        pelvisGroup.add(alaMesh);
        const ischiumCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(side * 0.24 * m.torsoBulk, -0.04, 0.04 * m.torsoBulk),
          new THREE2.Vector3(side * 0.21 * m.torsoBulk, -0.17, -0.04 * m.torsoBulk),
          new THREE2.Vector3(side * 0.05 * m.torsoBulk, -0.13, 0.18 * m.torsoBulk)
        ]);
        const ischiumGeo = trackGeo(
          new THREE2.TubeGeometry(ischiumCurve, seg(10, 8), 0.032 * m.torsoBulk, seg(8, 6), false),
          8e-3
        );
        pelvisGroup.add(new THREE2.Mesh(ischiumGeo, ivoryFangMat));
        const acetabulumGeo = trackGeo(
          new THREE2.TorusGeometry(0.072 * m.torsoBulk, 0.024 * m.torsoBulk, seg(8, 6), seg(14, 10)),
          6e-3
        );
        acetabulumGeo.rotateY(side * Math.PI * 0.42);
        const acetabulumMesh = new THREE2.Mesh(acetabulumGeo, ivoryFangMat);
        acetabulumMesh.position.set(side * 0.24 * m.torsoBulk, -0.04, 0.02 * m.torsoBulk);
        pelvisGroup.add(acetabulumMesh);
      }
      const symphysisGeo = trackGeo(
        new THREE2.CylinderGeometry(0.038 * m.torsoBulk, 0.038 * m.torsoBulk, 0.09, seg(10, 8)),
        6e-3
      );
      const symphysisMesh = new THREE2.Mesh(symphysisGeo, ivoryFangMat);
      symphysisMesh.position.set(0, -0.11, 0.19 * m.torsoBulk);
      pelvisGroup.add(symphysisMesh);
      if (config.archetype === "arch_lich" || config.archetype === "bone_crown_lich_king" || config.archetype === "wraith_soul_reaper" || config.archetype === "skeletal_archbishop_pontiff" || config.archetype === "emerald_crown_necromancer_lord" || config.archetype === "blood_crown_reaper_marquis" || config.archetype === "star_crown_astral_lich" || config.archetype === "crowned_catacomb_pharaoh" || config.archetype === "elite_plague_doctor_lich_skeleton" || config.archetype === "elite_caged_rib_jailer_skeleton" || config.archetype === "elite_spiked_wheel_bone_martyr" || config.archetype === "elite_twin_skull_ettin_skeleton" || config.archetype === "elite_mammoth_ossuary_behemoth") {
        const robePts = [
          new THREE2.Vector2(0.27 * m.torsoBulk, 0.06),
          new THREE2.Vector2(0.38 * m.torsoBulk, -0.45),
          new THREE2.Vector2(0.52 * m.torsoBulk, -0.92)
        ];
        const robeGeo = trackGeo(
          new THREE2.LatheGeometry(robePts, seg(16, 12), Math.PI * 0.38, Math.PI * 1.24)
        );
        const robeMesh = new THREE2.Mesh(robeGeo, primaryArmorMat);
        robeMesh.castShadow = true;
        pelvisGroup.add(robeMesh);
      }
    } else {
      const pelvisPts = [
        new THREE2.Vector2(0.01, -0.24),
        new THREE2.Vector2(0.27 * m.torsoBulk, -0.16),
        new THREE2.Vector2(0.38 * m.torsoBulk, 0.02),
        new THREE2.Vector2(0.33 * m.torsoBulk, 0.18),
        new THREE2.Vector2(0.36 * m.torsoBulk, 0.36),
        new THREE2.Vector2(0.32 * m.torsoBulk, 0.48),
        new THREE2.Vector2(0.01, 0.52)
      ];
      const pelvisGeo = trackGeo(new THREE2.LatheGeometry(pelvisPts, seg(18, 12)));
      pelvisGeo.scale(1.12, 1, 0.86);
      const pelvisMesh = new THREE2.Mesh(pelvisGeo, underbodyMat);
      pelvisMesh.castShadow = true;
      pelvisGroup.add(pelvisMesh);
      for (const side of [-1, 1]) {
        const obliqueHipGeo = trackGeo(
          new THREE2.SphereGeometry(0.145 * m.torsoBulk, seg(12, 8), seg(10, 8)),
          0.018
        );
        obliqueHipGeo.scale(0.82, 1.45, 1.12);
        const obliqueHipMesh = new THREE2.Mesh(
          obliqueHipGeo,
          isOrganicCreature ? primaryArmorMat : underbodyMat
        );
        obliqueHipMesh.position.set(side * 0.25 * m.torsoBulk, 0.16, 0.02);
        obliqueHipMesh.rotation.z = -side * 0.18;
        pelvisGroup.add(obliqueHipMesh);
      }
      for (let w = 0; w < 2; w++) {
        const cinctureGeo = trackGeo(
          new THREE2.TorusGeometry((0.31 + w * 0.02) * m.torsoBulk, 0.036, seg(10, 8), seg(18, 12))
        );
        cinctureGeo.rotateX(Math.PI / 2);
        cinctureGeo.scale(1.12, 0.86, 1);
        const cinctureMesh = new THREE2.Mesh(cinctureGeo, secondaryTrimMat);
        cinctureMesh.position.y = 0.08 + w * 0.11;
        pelvisGroup.add(cinctureMesh);
      }
      const beltShape = new THREE2.Shape();
      beltShape.moveTo(-0.24 * m.torsoBulk, 0.12);
      beltShape.lineTo(0.24 * m.torsoBulk, 0.12);
      beltShape.lineTo(0.16 * m.torsoBulk, -0.26);
      beltShape.lineTo(0, -0.36);
      beltShape.lineTo(-0.16 * m.torsoBulk, -0.26);
      beltShape.closePath();
      const beltGeo = trackGeo(
        new THREE2.ExtrudeGeometry(beltShape, {
          depth: 0.07,
          bevelEnabled: true,
          bevelThickness: 0.02,
          bevelSize: 0.02,
          bevelSegments: 2
        })
      );
      const frontTasset = new THREE2.Mesh(beltGeo, secondaryTrimMat);
      frontTasset.position.set(0, 0.02, 0.25 * m.torsoBulk);
      frontTasset.castShadow = true;
      pelvisGroup.add(frontTasset);
      if (config.archetype === "solar_phoenix" || config.archetype === "void_djinn" || config.archetype === "zephyr_storm_elemental" || config.archetype === "tempest_sky_djinn" || config.archetype === "cyclone_air_archon" || config.archetype === "plague_hierophant_mummy" || config.archetype === "banshee_frozen_throne") {
        const robePts = [
          new THREE2.Vector2(0.26 * m.torsoBulk, 0.12),
          new THREE2.Vector2(0.38 * m.torsoBulk, -0.45),
          new THREE2.Vector2(0.54 * m.torsoBulk, -0.95)
        ];
        const robeGeo = trackGeo(new THREE2.LatheGeometry(robePts, seg(20, 14)));
        const robeMesh = new THREE2.Mesh(robeGeo, primaryArmorMat);
        robeMesh.castShadow = true;
        pelvisGroup.add(robeMesh);
      }
    }
    tagExplodablePart(pelvisGroup, new THREE2.Vector3(0, -0.35, -0.25), {
      name: isSerpentine ? "Anillos Serpentinos Esculpidos" : isQuadruped ? "Grupa Muscular, Pelvis y Cintura Abdominal" : isArachnid ? "Abdomen y Cefalot\xF3rax Quitinoso" : isUndeadSkeleton ? "Pelvis \xD3sea, Sacro y Columna Lumbar 3D" : "Pelvis, Abdomen y Fald\xF3n",
      category: "Primary Silhouette",
      vertexCount: 420,
      triangleCount: 360,
      materialSummary: "Geometr\xEDa continua suavizada + musculatura y sombreado AO por v\xE9rtice"
    });
    explodableParts.push(pelvisGroup);
    const buildLeg = (isLeft) => {
      const side = isLeft ? 1 : -1;
      const legGroup = makeBone(isLeft ? "Leg_L" : "Leg_R");
      const zPos = isQuadruped ? -0.44 : 0;
      legGroup.position.set(side * 0.25 * m.torsoBulk, pelvisY, zPos);
      rootBone.add(legGroup);
      const kneeZ = isQuadruped ? 0.08 : 0.04;
      const kneeY = -legHeight * 0.48;
      const kneeGroup = makeBone(isLeft ? "Knee_Hock_L" : "Knee_Hock_R");
      kneeGroup.position.set(0, kneeY, kneeZ);
      legGroup.add(kneeGroup);
      if (isSerpentine) {
        return { legGroup, kneeGroup };
      }
      if (isFloating && isBeholder) {
        const tendrilCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(0, 0.1, 0),
          new THREE2.Vector3(side * 0.12, -0.35, -0.1),
          new THREE2.Vector3(side * 0.05, -0.7, 0.08)
        ]);
        const tendrilGeo = trackGeo(
          new THREE2.TubeGeometry(tendrilCurve, seg(14, 10), 0.052, seg(10, 8), false)
        );
        legGroup.add(new THREE2.Mesh(tendrilGeo, underbodyMat));
      } else if (isArachnid) {
        for (let k = 0; k < 4; k++) {
          const zOff = (k - 1.5) * 0.26;
          const reachX = side * (0.82 + k % 2 * 0.16) * m.limbLength;
          const coxaGeo = trackGeo(
            new THREE2.SphereGeometry(0.1 * m.torsoBulk, seg(10, 8), seg(8, 6))
          );
          const coxaMesh = new THREE2.Mesh(coxaGeo, secondaryTrimMat);
          coxaMesh.position.set(-side * 0.04, 0.04, zOff * 0.52);
          legGroup.add(coxaMesh);
          const curve = new THREE2.CatmullRomCurve3([
            new THREE2.Vector3(-side * 0.04, 0.04, zOff * 0.52),
            new THREE2.Vector3(reachX * 0.55, 0.36, zOff * 0.9),
            new THREE2.Vector3(reachX * 1.02, -legHeight * 0.35, zOff * 1.22),
            new THREE2.Vector3(reachX * 0.92, -legHeight + 0.02, zOff * 1.32)
          ]);
          const spiderLegGeo = trackGeo(
            new THREE2.TubeGeometry(curve, seg(16, 12), 0.058, seg(10, 8), false)
          );
          const spiderMesh = new THREE2.Mesh(spiderLegGeo, primaryArmorMat);
          spiderMesh.castShadow = true;
          legGroup.add(spiderMesh);
          const apexJointGeo = trackGeo(
            new THREE2.SphereGeometry(0.078, seg(10, 8), seg(8, 6))
          );
          const apexJoint = new THREE2.Mesh(apexJointGeo, secondaryTrimMat);
          apexJoint.position.set(reachX * 0.55, 0.36, zOff * 0.9);
          legGroup.add(apexJoint);
        }
      } else if (isUndeadSkeleton) {
        const femoralHeadGeo = trackGeo(
          new THREE2.SphereGeometry(0.068 * m.torsoBulk, seg(12, 8), seg(10, 8)),
          8e-3
        );
        const femoralHeadMesh = new THREE2.Mesh(femoralHeadGeo, ivoryFangMat);
        femoralHeadMesh.position.set(-side * 0.045 * m.torsoBulk, 0.04, 0.01);
        legGroup.add(femoralHeadMesh);
        const trochanterGeo = trackGeo(
          new THREE2.SphereGeometry(0.064 * m.torsoBulk, seg(10, 8), seg(8, 6)),
          0.012
        );
        trochanterGeo.scale(0.95, 1.35, 1.05);
        const trochanterMesh = new THREE2.Mesh(trochanterGeo, ivoryFangMat);
        trochanterMesh.position.set(side * 0.048 * m.torsoBulk, 0.02, -0.01);
        legGroup.add(trochanterMesh);
        const femurCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(-side * 0.035 * m.torsoBulk, 0.04, 0.01),
          new THREE2.Vector3(side * 0.032 * m.torsoBulk, 0, 0.01),
          new THREE2.Vector3(side * 0.012 * m.torsoBulk, kneeY * 0.5, kneeZ * 0.55 + 0.015),
          new THREE2.Vector3(0, kneeY, kneeZ)
        ]);
        const femurShaftGeo = trackGeo(
          new THREE2.TubeGeometry(
            femurCurve,
            seg(14, 10),
            0.054 * m.torsoBulk,
            seg(12, 8),
            false
          ),
          0.01
        );
        const femurShaftMesh = new THREE2.Mesh(femurShaftGeo, ivoryFangMat);
        femurShaftMesh.castShadow = true;
        legGroup.add(femurShaftMesh);
        const condyleGeo = trackGeo(
          new THREE2.CapsuleGeometry(0.058 * m.torsoBulk, 0.075 * m.torsoBulk, seg(8, 6), seg(10, 8)),
          8e-3
        );
        condyleGeo.rotateZ(Math.PI / 2);
        const femoralCondyles = new THREE2.Mesh(condyleGeo, ivoryFangMat);
        femoralCondyles.position.set(0, 0.025, 0);
        kneeGroup.add(femoralCondyles);
        const patellaGeo = trackGeo(
          new THREE2.SphereGeometry(0.054 * m.torsoBulk, seg(10, 8), seg(8, 6)),
          8e-3
        );
        patellaGeo.scale(1.05, 1.22, 0.55);
        const patellaMesh = new THREE2.Mesh(patellaGeo, ivoryFangMat);
        patellaMesh.position.set(0, 0.02, 0.068 * m.torsoBulk);
        kneeGroup.add(patellaMesh);
        const shinLen = legHeight * 0.52;
        const ankleZ = isQuadruped ? -0.05 : 0;
        const footY = -shinLen + 0.05;
        const tibialPlateauGeo = trackGeo(
          new THREE2.CylinderGeometry(
            0.068 * m.torsoBulk,
            0.048 * m.torsoBulk,
            0.065,
            seg(12, 8)
          ),
          8e-3
        );
        const tibialPlateau = new THREE2.Mesh(tibialPlateauGeo, ivoryFangMat);
        tibialPlateau.position.set(-side * 0.014 * m.torsoBulk, -0.03, 8e-3);
        kneeGroup.add(tibialPlateau);
        const tibiaCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(-side * 0.022 * m.torsoBulk, -0.02, 0.015),
          new THREE2.Vector3(-side * 0.026 * m.torsoBulk, -shinLen * 0.48, ankleZ * 0.4 + 0.022),
          new THREE2.Vector3(-side * 0.02 * m.torsoBulk, footY + 0.01, ankleZ + 5e-3)
        ]);
        const tibiaGeo = trackGeo(
          new THREE2.TubeGeometry(
            tibiaCurve,
            seg(12, 8),
            0.044 * m.torsoBulk,
            seg(10, 8),
            false
          ),
          8e-3
        );
        const tibiaMesh = new THREE2.Mesh(tibiaGeo, ivoryFangMat);
        tibiaMesh.castShadow = true;
        kneeGroup.add(tibiaMesh);
        const fibulaCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(side * 0.048 * m.torsoBulk, -0.04, -0.015),
          new THREE2.Vector3(side * 0.052 * m.torsoBulk, -shinLen * 0.5, ankleZ * 0.4 - 0.012),
          new THREE2.Vector3(side * 0.042 * m.torsoBulk, footY + 5e-3, ankleZ - 0.01)
        ]);
        const fibulaGeo = trackGeo(
          new THREE2.TubeGeometry(
            fibulaCurve,
            seg(12, 8),
            0.024 * m.torsoBulk,
            seg(8, 6),
            false
          ),
          6e-3
        );
        const fibulaMesh = new THREE2.Mesh(fibulaGeo, ivoryFangMat);
        fibulaMesh.castShadow = true;
        kneeGroup.add(fibulaMesh);
        const talusGeo = trackGeo(
          new THREE2.CapsuleGeometry(0.046 * m.torsoBulk, 0.062 * m.torsoBulk, 6, 10),
          6e-3
        );
        talusGeo.rotateZ(Math.PI / 2);
        const talusMesh = new THREE2.Mesh(talusGeo, ivoryFangMat);
        talusMesh.position.set(0, footY + 0.01, ankleZ);
        kneeGroup.add(talusMesh);
        const calcaneusGeo = trackGeo(
          new THREE2.SphereGeometry(0.048 * m.torsoBulk, seg(10, 8), seg(8, 6)),
          8e-3
        );
        calcaneusGeo.scale(0.85, 0.78, 1.45);
        const calcaneusMesh = new THREE2.Mesh(calcaneusGeo, ivoryFangMat);
        calcaneusMesh.position.set(0, footY - 0.015, ankleZ - 0.055 * m.torsoBulk);
        kneeGroup.add(calcaneusMesh);
        for (let t = -2; t <= 2; t++) {
          const toeX = t * 0.032 * m.torsoBulk;
          const toeSpread = t * 0.08;
          const metaLen = (0.135 - Math.abs(t) * 0.01) * m.torsoBulk;
          const metatarsalCurve = new THREE2.CatmullRomCurve3([
            new THREE2.Vector3(toeX * 0.65, footY + 5e-3, ankleZ + 0.015),
            new THREE2.Vector3(toeX, footY - 0.022, ankleZ + 0.015 + metaLen)
          ]);
          const metatarsalGeo = trackGeo(
            new THREE2.TubeGeometry(
              metatarsalCurve,
              6,
              0.016 * m.torsoBulk,
              6,
              false
            ),
            3e-3
          );
          kneeGroup.add(new THREE2.Mesh(metatarsalGeo, ivoryFangMat));
          const toePhalanxGeo = trackGeo(
            new THREE2.ConeGeometry(0.017 * m.torsoBulk, 0.095 * m.torsoBulk, 6),
            3e-3
          );
          toePhalanxGeo.rotateX(Math.PI / 2.15);
          const toePhalanx = new THREE2.Mesh(toePhalanxGeo, ivoryFangMat);
          toePhalanx.position.set(
            toeX * 1.08,
            footY - 0.028,
            ankleZ + 0.02 + metaLen + 0.042 * m.torsoBulk
          );
          toePhalanx.rotation.y = toeSpread;
          kneeGroup.add(toePhalanx);
        }
      } else {
        const hipHaunchGeo = trackGeo(
          new THREE2.SphereGeometry(0.245 * m.torsoBulk, seg(16, 12), seg(12, 10)),
          0.022
        );
        hipHaunchGeo.scale(0.96, 1.24, 1.3);
        const hipHaunchMesh = new THREE2.Mesh(
          hipHaunchGeo,
          isQuadruped ? primaryArmorMat : secondaryTrimMat
        );
        hipHaunchMesh.position.set(-side * 0.045, 0.045, isQuadruped ? 0.04 : 0);
        hipHaunchMesh.castShadow = true;
        legGroup.add(hipHaunchMesh);
        const hipBridgeCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(-side * 0.16 * m.torsoBulk, 0.14, isQuadruped ? 0.08 : -0.02),
          new THREE2.Vector3(-side * 0.05 * m.torsoBulk, 0.04, 0.01),
          new THREE2.Vector3(0, kneeY * 0.28, kneeZ * 0.35)
        ]);
        const hipBridgeGeo = trackGeo(
          new THREE2.TubeGeometry(
            hipBridgeCurve,
            seg(12, 8),
            0.148 * m.torsoBulk,
            seg(12, 8),
            false
          ),
          0.018
        );
        const hipBridgeMesh = new THREE2.Mesh(
          hipBridgeGeo,
          isQuadruped || isOrganicCreature ? primaryArmorMat : underbodyMat
        );
        legGroup.add(hipBridgeMesh);
        const thighCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(-side * 0.03, 0.09, 0),
          new THREE2.Vector3(side * 0.01, kneeY * 0.5, kneeZ * 0.65 + 0.03),
          new THREE2.Vector3(0, kneeY - 0.05, kneeZ)
        ]);
        const thighGeo = trackGeo(
          new THREE2.TubeGeometry(
            thighCurve,
            seg(14, 10),
            0.168 * m.torsoBulk,
            seg(14, 10),
            false
          ),
          0.024
        );
        const thighMesh = new THREE2.Mesh(thighGeo, isQuadruped ? primaryArmorMat : underbodyMat);
        thighMesh.castShadow = true;
        legGroup.add(thighMesh);
        if (muscleDef > 0.15) {
          const mScale = 0.78 + muscleDef * 0.34;
          const quadGeo = trackGeo(
            new THREE2.SphereGeometry(0.135 * m.torsoBulk * mScale, seg(12, 8), seg(10, 8)),
            0.025
          );
          quadGeo.scale(0.84, 1.75, 1.08);
          const quadMesh = new THREE2.Mesh(
            quadGeo,
            isQuadruped || isOrganicCreature ? primaryArmorMat : underbodyMat
          );
          quadMesh.position.set(side * 0.045 * m.torsoBulk, kneeY * 0.44, kneeZ * 0.5 + 0.065 * m.torsoBulk);
          quadMesh.rotation.x = 0.14;
          quadMesh.rotation.z = side * 0.08;
          legGroup.add(quadMesh);
          const hamGeo = trackGeo(
            new THREE2.SphereGeometry(0.125 * m.torsoBulk * mScale, seg(12, 8), seg(10, 8)),
            0.022
          );
          hamGeo.scale(0.82, 1.65, 1.12);
          const hamMesh = new THREE2.Mesh(
            hamGeo,
            isQuadruped || isOrganicCreature ? primaryArmorMat : underbodyMat
          );
          hamMesh.position.set(side * 0.02 * m.torsoBulk, kneeY * 0.38, -0.06 * m.torsoBulk);
          hamMesh.rotation.x = -0.15;
          legGroup.add(hamMesh);
        }
        if (furDensity > 0.15 && hairStyle !== "none") {
          const fScale = 0.75 + furDensity * 0.38;
          for (let t = 0; t < 3; t++) {
            const tuftGeo = trackFurLock(0.068 * m.torsoBulk * fScale, (0.24 - t * 0.03) * fScale, 0.09);
            const tuftMesh = new THREE2.Mesh(tuftGeo, hairStrandMat);
            tuftMesh.position.set(
              side * (0.14 - t * 0.02) * m.torsoBulk,
              -0.02 + kneeY * (0.2 + t * 0.25),
              -0.08 * m.torsoBulk
            );
            tuftMesh.rotation.x = -Math.PI * 0.68 - t * 0.08;
            tuftMesh.rotation.z = -side * 0.32;
            legGroup.add(tuftMesh);
          }
        }
        const kneeSphereGeo = trackGeo(
          new THREE2.CapsuleGeometry(0.145 * m.torsoBulk, 0.11 * m.torsoBulk, seg(10, 8), seg(14, 10)),
          0.016
        );
        kneeSphereGeo.scale(1.04, 1.12, 1.14);
        const kneeSphere = new THREE2.Mesh(
          kneeSphereGeo,
          isQuadruped ? primaryArmorMat : secondaryTrimMat
        );
        kneeGroup.add(kneeSphere);
        const patellarCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(0, 0.11, 0.055 * m.torsoBulk),
          new THREE2.Vector3(0, 0, 0.082 * m.torsoBulk),
          new THREE2.Vector3(0, -0.12, 0.048 * m.torsoBulk)
        ]);
        const patellarGeo = trackGeo(
          new THREE2.TubeGeometry(patellarCurve, seg(10, 8), 0.068 * m.torsoBulk, seg(10, 8), false),
          0.012
        );
        const patellarMesh = new THREE2.Mesh(
          patellarGeo,
          isOrganicCreature ? primaryArmorMat : secondaryTrimMat
        );
        kneeGroup.add(patellarMesh);
        if (!isOrganicCreature) {
          const kneeGuardGeo = trackGeo(
            new THREE2.SphereGeometry(0.135 * m.torsoBulk, seg(12, 8), seg(10, 8))
          );
          kneeGuardGeo.scale(0.9, 1.25, 0.85);
          const kneeMesh = new THREE2.Mesh(kneeGuardGeo, secondaryTrimMat);
          kneeMesh.position.set(0, 0.02, 0.07);
          kneeGroup.add(kneeMesh);
        }
        const shinLen = legHeight * 0.52;
        const ankleZ = isQuadruped ? -0.05 : 0;
        const footY = -shinLen + 0.05;
        const shinCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(0, 0.07, 0),
          new THREE2.Vector3(0, -shinLen * 0.48, ankleZ * 0.4 + 0.02),
          new THREE2.Vector3(0, footY - 0.02, ankleZ)
        ]);
        const greaveGeo = trackGeo(
          new THREE2.TubeGeometry(
            shinCurve,
            seg(14, 10),
            0.134 * m.torsoBulk,
            seg(14, 10),
            false
          ),
          0.022
        );
        const greaveMesh = new THREE2.Mesh(greaveGeo, primaryArmorMat);
        greaveMesh.castShadow = true;
        kneeGroup.add(greaveMesh);
        if (muscleDef > 0.15) {
          const mScale = 0.78 + muscleDef * 0.34;
          const calfGeo = trackGeo(
            new THREE2.SphereGeometry(0.112 * m.torsoBulk * mScale, seg(12, 8), seg(10, 8)),
            0.022
          );
          calfGeo.scale(0.88, 1.55, 1.15);
          const calfMesh = new THREE2.Mesh(calfGeo, primaryArmorMat);
          calfMesh.position.set(side * 0.015 * m.torsoBulk, -shinLen * 0.32, -0.055 * m.torsoBulk);
          calfMesh.rotation.x = 0.18;
          kneeGroup.add(calfMesh);
        }
        if (furDensity > 0.15 && hairStyle !== "none") {
          const fScale = 0.72 + furDensity * 0.36;
          for (let t = 0; t < 2; t++) {
            const hockTuftGeo = trackFurLock(0.052 * m.torsoBulk * fScale, 0.2 * fScale, 0.08);
            const hockTuft = new THREE2.Mesh(hockTuftGeo, hairStrandMat);
            hockTuft.position.set(
              side * 0.02 * m.torsoBulk,
              -shinLen * (0.22 + t * 0.28),
              -0.08 * m.torsoBulk
            );
            hockTuft.rotation.x = -Math.PI * 0.65;
            kneeGroup.add(hockTuft);
          }
        }
        const ankleSphereGeo = trackGeo(
          new THREE2.CapsuleGeometry(0.115 * m.torsoBulk, 0.075 * m.torsoBulk, seg(8, 6), seg(12, 8)),
          0.014
        );
        const ankleSphere = new THREE2.Mesh(ankleSphereGeo, primaryArmorMat);
        ankleSphere.position.set(0, footY + 0.015, ankleZ);
        kneeGroup.add(ankleSphere);
        const instepBridgeCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(0, footY + 0.06, ankleZ - 0.01),
          new THREE2.Vector3(0, footY + 0.01, ankleZ + 0.04),
          new THREE2.Vector3(0, footY - 0.01, ankleZ + 0.11)
        ]);
        const instepBridgeGeo = trackGeo(
          new THREE2.TubeGeometry(instepBridgeCurve, seg(10, 8), 0.105 * m.torsoBulk, seg(10, 8), false),
          0.014
        );
        const instepBridgeMesh = new THREE2.Mesh(instepBridgeGeo, primaryArmorMat);
        kneeGroup.add(instepBridgeMesh);
        const pawGeo = trackGeo(
          new THREE2.SphereGeometry(0.155 * m.torsoBulk, seg(14, 10), seg(10, 8))
        );
        pawGeo.scale(0.96, 0.55, 1.45);
        const pawMesh = new THREE2.Mesh(pawGeo, secondaryTrimMat);
        pawMesh.position.set(0, footY - 0.01, ankleZ + 0.08);
        kneeGroup.add(pawMesh);
        for (let c = -1; c <= 1; c++) {
          const toeGeo = trackGeo(
            new THREE2.SphereGeometry(0.058 * m.torsoBulk, seg(10, 8), seg(8, 6))
          );
          toeGeo.scale(0.8, 0.68, 1.45);
          const toeMesh = new THREE2.Mesh(toeGeo, primaryArmorMat);
          toeMesh.position.set(c * 0.065 * m.torsoBulk, footY - 0.02, ankleZ + 0.19);
          kneeGroup.add(toeMesh);
          if (isDragon || isQuadruped || isOrganicCreature) {
            const clawGeo = trackGeo(new THREE2.ConeGeometry(0.032, 0.16, seg(10, 8)));
            clawGeo.rotateX(Math.PI / 2.15);
            const clawMesh = new THREE2.Mesh(clawGeo, ivoryFangMat);
            clawMesh.position.set(c * 0.068 * m.torsoBulk, footY - 0.025, ankleZ + 0.27);
            kneeGroup.add(clawMesh);
          }
        }
      }
      tagExplodablePart(legGroup, new THREE2.Vector3(side * 0.5, -0.45, -0.15), {
        name: isLeft ? "Extremidad Inferior Izquierda" : "Extremidad Inferior Derecha",
        category: "Primary Silhouette",
        vertexCount: 480,
        triangleCount: 420,
        materialSummary: "Cu\xE1driceps, isquiotibiales y gemelo esculpidos + mechones 3D + zarpa"
      });
      explodableParts.push(legGroup);
      return { legGroup, kneeGroup };
    };
    const { legGroup: leftLegGroup, kneeGroup: leftKneeGroup } = buildLeg(true);
    const { legGroup: rightLegGroup, kneeGroup: rightKneeGroup } = buildLeg(false);
    const torsoGroup = makeBone("Torso_Main");
    if (isQuadruped && !isCentaur) {
      torsoGroup.position.set(0, 0.06, 0.38);
    } else if (isCentaur) {
      torsoGroup.position.set(0, 0.22, 0.56);
    } else {
      torsoGroup.position.set(0, 0.15, 0);
    }
    pelvisGroup.add(torsoGroup);
    const torsoHeight = 0.92 * m.heightScale;
    if (isBeholder) {
      const orbBodyGeo = trackGeo(
        new THREE2.SphereGeometry(0.62 * m.torsoBulk, seg(24, 16), seg(18, 12))
      );
      const orbBodyMesh = new THREE2.Mesh(orbBodyGeo, primaryArmorMat);
      orbBodyMesh.position.y = torsoHeight * 0.55;
      orbBodyMesh.castShadow = true;
      torsoGroup.add(orbBodyMesh);
      const browGeo = trackGeo(
        new THREE2.TorusGeometry(0.44 * m.torsoBulk, 0.08, seg(12, 8), seg(24, 16))
      );
      const browMesh = new THREE2.Mesh(browGeo, secondaryTrimMat);
      browMesh.position.set(0, torsoHeight * 0.58, 0.42 * m.torsoBulk);
      torsoGroup.add(browMesh);
    } else if (isQuadruped && !isCentaur) {
      if (!isUndeadSkeleton) {
        const thoraxCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(0, -0.02, -0.24),
          new THREE2.Vector3(0, 0.06 * m.heightScale, 0.08),
          new THREE2.Vector3(0, 0.16 * m.heightScale, 0.36),
          new THREE2.Vector3(0, 0.24 * m.heightScale, 0.54)
        ]);
        const thoraxGeo = trackGeo(
          new THREE2.TubeGeometry(
            thoraxCurve,
            seg(18, 12),
            0.41 * m.torsoBulk,
            seg(18, 12),
            false
          ),
          0.024
        );
        thoraxGeo.scale(0.92 * m.shoulderWidth, 1.06, 1);
        const thoraxMesh = new THREE2.Mesh(thoraxGeo, primaryArmorMat);
        thoraxMesh.castShadow = true;
        torsoGroup.add(thoraxMesh);
        const brisketGeo = trackGeo(
          new THREE2.SphereGeometry(0.39 * m.torsoBulk, seg(18, 12), seg(14, 10)),
          0.022
        );
        brisketGeo.scale(0.94 * m.shoulderWidth, 1.08, 1.15);
        const brisketMesh = new THREE2.Mesh(brisketGeo, primaryArmorMat);
        brisketMesh.position.set(0, 0.16 * m.heightScale, 0.42);
        brisketMesh.castShadow = true;
        torsoGroup.add(brisketMesh);
        if (muscleDef > 0.15) {
          const mScale = 0.78 + muscleDef * 0.34;
          for (const side of [-1, 1]) {
            const pecLobeGeo = trackGeo(
              new THREE2.SphereGeometry(0.21 * m.torsoBulk * mScale, seg(12, 8), seg(10, 8)),
              0.025
            );
            pecLobeGeo.scale(0.88, 1.05, 1.25);
            const pecLobe = new THREE2.Mesh(pecLobeGeo, primaryArmorMat);
            pecLobe.position.set(
              side * 0.145 * m.torsoBulk * m.shoulderWidth,
              0.11 * m.heightScale,
              0.49
            );
            torsoGroup.add(pecLobe);
            const withersGeo = trackGeo(
              new THREE2.SphereGeometry(0.22 * m.torsoBulk * mScale, seg(12, 8), seg(10, 8)),
              0.024
            );
            withersGeo.scale(0.82, 1.18, 1.48);
            const withersMesh = new THREE2.Mesh(withersGeo, primaryArmorMat);
            withersMesh.position.set(
              side * 0.13 * m.torsoBulk * m.shoulderWidth,
              0.32 * m.heightScale,
              0.26
            );
            withersMesh.rotation.x = 0.18;
            torsoGroup.add(withersMesh);
            for (let r = 0; r < 3; r++) {
              const ribMuscleGeo = trackGeo(
                new THREE2.SphereGeometry(0.11 * m.torsoBulk * mScale, seg(10, 8), seg(8, 6)),
                0.018
              );
              ribMuscleGeo.scale(0.58, 1.55, 0.85);
              const ribMuscle = new THREE2.Mesh(ribMuscleGeo, primaryArmorMat);
              ribMuscle.position.set(
                side * 0.34 * m.torsoBulk * m.shoulderWidth,
                (0.06 + r * 0.04) * m.heightScale,
                0.22 - r * 0.15
              );
              ribMuscle.rotation.x = -0.45;
              ribMuscle.rotation.z = -side * 0.22;
              torsoGroup.add(ribMuscle);
            }
          }
        }
        const maneGeo = trackGeo(
          new THREE2.SphereGeometry(0.36 * m.torsoBulk, seg(16, 12), seg(12, 10)),
          0.024
        );
        maneGeo.scale(1.04, 1.05, 1.22);
        const maneMesh = new THREE2.Mesh(maneGeo, secondaryTrimMat);
        maneMesh.position.set(0, 0.22 * m.heightScale, 0.48);
        maneMesh.castShadow = true;
        torsoGroup.add(maneMesh);
      }
      if (!isUndeadSkeleton && furDensity > 0.15 && hairStyle !== "none") {
        const fScale = 0.78 + furDensity * 0.4;
        const maneLockCount = density === "low" ? 10 : 14;
        for (let i = 0; i < maneLockCount; i++) {
          const ang = i / maneLockCount * Math.PI * 2;
          const lockLen = (0.32 + i % 3 * 0.07) * m.torsoBulk * fScale;
          const lockGeo = trackFurLock(0.095 * m.torsoBulk * fScale, lockLen, 0.11);
          const lockMesh = new THREE2.Mesh(lockGeo, hairStrandMat);
          const rx = Math.sin(ang) * 0.31 * m.torsoBulk * m.shoulderWidth;
          const ry = 0.21 * m.heightScale + Math.cos(ang) * 0.26 * m.torsoBulk;
          const rz = 0.42 - Math.cos(ang) * 0.08;
          lockMesh.position.set(rx, ry, rz);
          lockMesh.rotation.z = -Math.sin(ang) * 0.85;
          lockMesh.rotation.x = -Math.PI * 0.58 + Math.cos(ang) * 0.35;
          lockMesh.castShadow = true;
          torsoGroup.add(lockMesh);
        }
      }
      const spineCount = 7;
      for (let s = 0; s < spineCount; s++) {
        const frac = s / (spineCount - 1);
        const zOff = -0.52 + frac * 0.98;
        const yOff = (0.36 + frac * 0.18 * m.heightScale) * m.torsoBulk;
        const ridgeH = (0.16 + Math.sin(frac * Math.PI) * 0.1) * m.dorsalScale;
        const useHair = !isUndeadSkeleton && furDensity > 0.2 && hairStyle !== "none";
        const ridgeGeo = useHair ? trackFurLock(0.068 * m.torsoBulk, ridgeH * (0.85 + furDensity * 0.3), 0.09) : trackGeo(new THREE2.ConeGeometry(0.055 * m.torsoBulk, ridgeH, seg(10, 8)));
        if (!useHair) {
          ridgeGeo.rotateX(-0.38);
        }
        const ridgeMesh = new THREE2.Mesh(
          ridgeGeo,
          isUndeadSkeleton ? ivoryFangMat : useHair ? hairStrandMat : secondaryTrimMat
        );
        ridgeMesh.position.set(0, yOff - (useHair ? 0.06 : 0), zOff);
        if (useHair) {
          ridgeMesh.rotation.x = -0.52;
        }
        torsoGroup.add(ridgeMesh);
      }
      if (isUndeadSkeleton) {
        const qDiscMat = trackMat(
          new THREE2.MeshStandardMaterial({
            name: "Mat_SkullSocketVoid",
            color: new THREE2.Color("#07080c"),
            roughness: 0.94,
            metalness: 0.04,
            wireframe
          })
        );
        for (let v = 0; v < 9; v++) {
          const vFrac = v / 8;
          const vz = -0.32 + vFrac * 0.88;
          const vy = (0.04 + vFrac * 0.22) * m.heightScale + 0.24 * m.torsoBulk;
          const vertGeo = trackGeo(
            new THREE2.CylinderGeometry(
              0.068 * m.torsoBulk,
              0.072 * m.torsoBulk,
              0.078,
              seg(10, 8)
            )
          );
          vertGeo.rotateX(Math.PI * 0.5);
          const vertMesh = new THREE2.Mesh(vertGeo, ivoryFangMat);
          vertMesh.position.set(0, vy, vz);
          torsoGroup.add(vertMesh);
          const discGeo = trackGeo(
            new THREE2.CylinderGeometry(
              0.052 * m.torsoBulk,
              0.052 * m.torsoBulk,
              0.025,
              seg(8, 6)
            )
          );
          discGeo.rotateX(Math.PI * 0.5);
          const discMesh = new THREE2.Mesh(discGeo, qDiscMat);
          discMesh.position.set(0, vy - 8e-3, vz + 0.048);
          torsoGroup.add(discMesh);
        }
        const keelCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(0, -0.18 * m.torsoBulk, -0.12),
          new THREE2.Vector3(0, -0.12 * m.torsoBulk, 0.18),
          new THREE2.Vector3(0, -0.02 * m.torsoBulk, 0.48)
        ]);
        const keelGeo = trackGeo(
          new THREE2.TubeGeometry(keelCurve, seg(10, 8), 0.042 * m.torsoBulk, seg(8, 6), false)
        );
        torsoGroup.add(new THREE2.Mesh(keelGeo, ivoryFangMat));
        for (const side of [-1, 1]) {
          const scapGeo = trackGeo(
            new THREE2.BoxGeometry(0.05 * m.torsoBulk, 0.34 * m.torsoBulk, 0.22 * m.torsoBulk),
            0.01
          );
          const scapMesh = new THREE2.Mesh(scapGeo, ivoryFangMat);
          scapMesh.position.set(
            side * 0.34 * m.torsoBulk * m.shoulderWidth,
            0.18 * m.heightScale,
            0.38
          );
          scapMesh.rotation.z = -side * 0.25;
          scapMesh.rotation.x = 0.28;
          torsoGroup.add(scapMesh);
          for (let r = 0; r < 7; r++) {
            const rFrac = r / 6;
            const rz = -0.22 + rFrac * 0.68;
            const ry = (0.04 + rFrac * 0.18) * m.heightScale;
            const rw = (0.45 - Math.abs(rFrac - 0.45) * 0.1) * m.torsoBulk * m.shoulderWidth;
            const qRibCurve = new THREE2.CatmullRomCurve3([
              new THREE2.Vector3(side * 0.04 * m.torsoBulk, ry + 0.26 * m.torsoBulk, rz),
              new THREE2.Vector3(side * rw, ry + 0.02 * m.torsoBulk, rz + 0.03),
              new THREE2.Vector3(side * 0.06 * m.torsoBulk, ry - 0.22 * m.torsoBulk, rz + 0.06)
            ]);
            const qRibGeo = trackGeo(
              new THREE2.TubeGeometry(qRibCurve, seg(12, 8), 0.036 * m.torsoBulk, seg(8, 6), false),
              8e-3
            );
            torsoGroup.add(new THREE2.Mesh(qRibGeo, ivoryFangMat));
          }
        }
      }
    } else {
      const isSkeletalTorso = isUndeadSkeleton;
      if (isSkeletalTorso) {
        const darkThoracicMat = trackMat(
          new THREE2.MeshStandardMaterial({
            name: "Mat_SkullSocketVoid",
            color: new THREE2.Color("#07080c"),
            roughness: 0.94,
            metalness: 0.04,
            wireframe
          })
        );
        const innerShadowGeo = trackGeo(
          new THREE2.CylinderGeometry(
            0.165 * m.torsoBulk,
            0.115 * m.torsoBulk,
            torsoHeight * 0.52,
            seg(14, 10)
          ),
          8e-3
        );
        innerShadowGeo.scale(1.12, 1, 0.72);
        const innerShadowMesh = new THREE2.Mesh(innerShadowGeo, darkThoracicMat);
        innerShadowMesh.position.set(0, torsoHeight * 0.58, 0.02 * m.torsoBulk);
        torsoGroup.add(innerShadowMesh);
        const dorsalCordCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(0, -0.06, -0.11 * m.torsoBulk),
          new THREE2.Vector3(0, torsoHeight * 0.48, -0.175 * m.torsoBulk),
          new THREE2.Vector3(0, torsoHeight * 0.94, -0.08 * m.torsoBulk)
        ]);
        const dorsalCordGeo = trackGeo(
          new THREE2.TubeGeometry(dorsalCordCurve, seg(14, 10), 0.035 * m.torsoBulk, seg(8, 6), false),
          4e-3
        );
        torsoGroup.add(new THREE2.Mesh(dorsalCordGeo, darkThoracicMat));
        const thoracicCount = 8;
        for (let v = 0; v < thoracicCount; v++) {
          const vFrac = v / (thoracicCount - 1);
          const pt = dorsalCordCurve.getPoint(0.06 + vFrac * 0.88);
          const vScale = (1.05 - vFrac * 0.18) * m.torsoBulk;
          const vBodyGeo = trackGeo(
            new THREE2.CylinderGeometry(0.072 * vScale, 0.076 * vScale, 0.064, seg(12, 8)),
            7e-3
          );
          vBodyGeo.scale(1.12, 1, 0.92);
          const vBodyMesh = new THREE2.Mesh(vBodyGeo, ivoryFangMat);
          vBodyMesh.position.copy(pt);
          vBodyMesh.castShadow = true;
          torsoGroup.add(vBodyMesh);
          const vDiscGeo = trackGeo(
            new THREE2.CylinderGeometry(0.066 * vScale, 0.066 * vScale, 0.022, seg(10, 8)),
            2e-3
          );
          const vDiscMesh = new THREE2.Mesh(vDiscGeo, darkThoracicMat);
          vDiscMesh.position.set(pt.x, pt.y + 0.042, pt.z);
          torsoGroup.add(vDiscMesh);
          const vTransGeo = trackGeo(
            new THREE2.CapsuleGeometry(0.02 * vScale, 0.155 * vScale, 6, 8),
            5e-3
          );
          vTransGeo.rotateZ(Math.PI / 2);
          const vTransMesh = new THREE2.Mesh(vTransGeo, ivoryFangMat);
          vTransMesh.position.set(pt.x, pt.y + 5e-3, pt.z - 0.032 * m.torsoBulk);
          torsoGroup.add(vTransMesh);
          const vSpineGeo = trackGeo(
            new THREE2.ConeGeometry(0.026 * vScale, 0.125 * vScale, 6),
            5e-3
          );
          vSpineGeo.rotateX(-Math.PI * 0.62);
          const vSpineMesh = new THREE2.Mesh(vSpineGeo, ivoryFangMat);
          vSpineMesh.position.set(pt.x, pt.y - 0.015, pt.z - 0.088 * m.torsoBulk);
          vSpineMesh.castShadow = true;
          torsoGroup.add(vSpineMesh);
        }
        const manubriumGeo = trackGeo(
          new THREE2.CylinderGeometry(
            0.082 * m.torsoBulk,
            0.058 * m.torsoBulk,
            0.12,
            6
          ),
          8e-3
        );
        manubriumGeo.scale(1.15, 1, 0.45);
        const manubriumMesh = new THREE2.Mesh(manubriumGeo, ivoryFangMat);
        manubriumMesh.position.set(0, torsoHeight * 0.84, 0.255 * m.torsoBulk);
        manubriumMesh.rotation.x = -0.22;
        torsoGroup.add(manubriumMesh);
        const sternumCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(0, torsoHeight * 0.82, 0.265 * m.torsoBulk),
          new THREE2.Vector3(0, torsoHeight * 0.62, 0.315 * m.torsoBulk),
          new THREE2.Vector3(0, torsoHeight * 0.41, 0.285 * m.torsoBulk)
        ]);
        const sternumGeo = trackGeo(
          new THREE2.TubeGeometry(sternumCurve, seg(12, 8), 0.044 * m.torsoBulk, seg(10, 8), false),
          0.01
        );
        sternumGeo.scale(1.38, 1, 0.58);
        const sternumMesh = new THREE2.Mesh(sternumGeo, ivoryFangMat);
        sternumMesh.castShadow = true;
        torsoGroup.add(sternumMesh);
        const xiphoidGeo = trackGeo(
          new THREE2.ConeGeometry(0.032 * m.torsoBulk, 0.095, 5),
          5e-3
        );
        xiphoidGeo.scale(1.1, 1, 0.5);
        const xiphoidMesh = new THREE2.Mesh(xiphoidGeo, ivoryFangMat);
        xiphoidMesh.position.set(0, torsoHeight * 0.35, 0.275 * m.torsoBulk);
        xiphoidMesh.rotation.x = Math.PI + 0.15;
        torsoGroup.add(xiphoidMesh);
        for (const side of [-1, 1]) {
          const clavicleCurve = new THREE2.CatmullRomCurve3([
            new THREE2.Vector3(side * 0.045 * m.torsoBulk, torsoHeight * 0.86, 0.26 * m.torsoBulk),
            new THREE2.Vector3(
              side * 0.21 * m.torsoBulk * m.shoulderWidth,
              torsoHeight * 0.89,
              0.23 * m.torsoBulk
            ),
            new THREE2.Vector3(
              side * 0.36 * m.torsoBulk * m.shoulderWidth,
              torsoHeight * 0.85,
              0.09 * m.torsoBulk
            ),
            new THREE2.Vector3(
              side * 0.44 * m.torsoBulk * m.shoulderWidth,
              torsoHeight * 0.8,
              0.01 * m.torsoBulk
            )
          ]);
          const clavicleGeo = trackGeo(
            new THREE2.TubeGeometry(
              clavicleCurve,
              seg(14, 10),
              0.032 * m.torsoBulk,
              seg(10, 8),
              false
            ),
            8e-3
          );
          const clavicleMesh = new THREE2.Mesh(clavicleGeo, ivoryFangMat);
          clavicleMesh.castShadow = true;
          torsoGroup.add(clavicleMesh);
          const scapulaGeo = trackGeo(
            new THREE2.ConeGeometry(0.155 * m.torsoBulk, 0.32 * torsoHeight, 5),
            0.01
          );
          scapulaGeo.scale(1.12, 1, 0.28);
          const scapulaMesh = new THREE2.Mesh(scapulaGeo, ivoryFangMat);
          scapulaMesh.position.set(
            side * 0.23 * m.torsoBulk * m.shoulderWidth,
            torsoHeight * 0.68,
            -0.165 * m.torsoBulk
          );
          scapulaMesh.rotation.x = Math.PI - 0.14;
          scapulaMesh.rotation.z = side * 0.24;
          scapulaMesh.rotation.y = -side * 0.28;
          torsoGroup.add(scapulaMesh);
          const ribCount = 7;
          for (let r = 0; r < ribCount; r++) {
            const rFrac = r / (ribCount - 1);
            const ribYBack = torsoHeight * (0.82 - rFrac * 0.56);
            const ribYMid = ribYBack - 0.035 * torsoHeight;
            const ribYFront = ribYBack - 0.065 * torsoHeight;
            const archBell = Math.sin(rFrac * Math.PI * 0.82 + 0.25);
            const ribW = (0.35 + archBell * 0.115) * m.torsoBulk * (0.88 + 0.12 * m.shoulderWidth);
            const ribZBack = (-0.155 - Math.sin(rFrac * Math.PI) * 0.025) * m.torsoBulk;
            const ribZFront = (0.305 - Math.abs(rFrac - 0.35) * 0.06) * m.torsoBulk;
            const isFloatingRib = r >= 5;
            const ribPts = isFloatingRib ? [
              new THREE2.Vector3(side * 0.045 * m.torsoBulk, ribYBack, ribZBack),
              new THREE2.Vector3(side * ribW * 0.78, ribYBack - 0.01, ribZBack * 0.35),
              new THREE2.Vector3(
                side * ribW * (r === 5 ? 0.86 : 0.72),
                ribYMid,
                (r === 5 ? 0.08 : -0.01) * m.torsoBulk
              )
            ] : [
              new THREE2.Vector3(side * 0.045 * m.torsoBulk, ribYBack, ribZBack),
              new THREE2.Vector3(side * ribW * 0.76, ribYBack - 8e-3, ribZBack * 0.32),
              new THREE2.Vector3(side * ribW, ribYMid, 0.04 * m.torsoBulk),
              new THREE2.Vector3(side * ribW * 0.62, ribYFront, ribZFront * 0.78),
              new THREE2.Vector3(
                side * 0.048 * m.torsoBulk,
                Math.max(torsoHeight * 0.38, ribYFront + (r >= 3 ? (r - 2) * 0.028 : 0)),
                ribZFront
              )
            ];
            const ribCurve = new THREE2.CatmullRomCurve3(ribPts);
            const ribRadius = (0.032 - rFrac * 5e-3) * m.torsoBulk;
            const ribGeo = trackGeo(
              new THREE2.TubeGeometry(ribCurve, seg(16, 12), ribRadius, seg(10, 8), false),
              8e-3
            );
            ribGeo.scale(1, 1.18, 0.92);
            const ribMesh = new THREE2.Mesh(ribGeo, ivoryFangMat);
            ribMesh.castShadow = true;
            torsoGroup.add(ribMesh);
          }
        }
      } else {
        const waistBridgePts = [
          new THREE2.Vector2(0.01, -0.26),
          new THREE2.Vector2(0.35 * m.torsoBulk, -0.18),
          new THREE2.Vector2(0.32 * m.torsoBulk, 0),
          new THREE2.Vector2(0.36 * m.torsoBulk, 0.18),
          new THREE2.Vector2(0.01, 0.26)
        ];
        const waistBridgeGeo = trackGeo(new THREE2.LatheGeometry(waistBridgePts, seg(18, 12)), 0.018);
        waistBridgeGeo.scale(1.08, 1, 0.88);
        const waistBridgeMesh = new THREE2.Mesh(waistBridgeGeo, underbodyMat);
        waistBridgeMesh.position.set(0, -0.02, 0);
        torsoGroup.add(waistBridgeMesh);
        const cuirassPts = [
          new THREE2.Vector2(0.01, -0.18),
          new THREE2.Vector2(0.28 * m.torsoBulk, -0.1),
          new THREE2.Vector2(0.34 * m.torsoBulk, 0.08),
          new THREE2.Vector2(0.43 * m.torsoBulk, torsoHeight * 0.42),
          new THREE2.Vector2(0.5 * m.torsoBulk * m.shoulderWidth * 0.85, torsoHeight * 0.78),
          new THREE2.Vector2(0.34 * m.torsoBulk, torsoHeight * 0.96),
          new THREE2.Vector2(0.22 * m.torsoBulk, torsoHeight * 1.04),
          new THREE2.Vector2(0.01, torsoHeight * 1.06)
        ];
        const cuirassGeo = trackGeo(new THREE2.LatheGeometry(cuirassPts, seg(20, 14)), 0.022);
        cuirassGeo.scale(1.12, 1, 0.86);
        const cuirassMesh = new THREE2.Mesh(cuirassGeo, primaryArmorMat);
        cuirassMesh.castShadow = true;
        torsoGroup.add(cuirassMesh);
        if (muscleDef > 0.15) {
          const mScale = 0.78 + muscleDef * 0.34;
          for (const side of [-1, 1]) {
            const pecGeo = trackGeo(
              new THREE2.SphereGeometry(0.185 * m.torsoBulk * mScale, seg(14, 10), seg(10, 8)),
              0.022
            );
            pecGeo.scale(1.18, 0.82, 0.88);
            const pecMesh = new THREE2.Mesh(pecGeo, primaryArmorMat);
            pecMesh.position.set(
              side * 0.155 * m.torsoBulk * m.shoulderWidth,
              torsoHeight * 0.68,
              0.24 * m.torsoBulk
            );
            pecMesh.rotation.z = -side * 0.12;
            pecMesh.castShadow = true;
            torsoGroup.add(pecMesh);
            const latGeo = trackGeo(
              new THREE2.SphereGeometry(0.175 * m.torsoBulk * mScale, seg(12, 8), seg(10, 8)),
              0.022
            );
            latGeo.scale(0.85, 1.65, 1.05);
            const latMesh = new THREE2.Mesh(latGeo, primaryArmorMat);
            latMesh.position.set(
              side * 0.28 * m.torsoBulk * m.shoulderWidth,
              torsoHeight * 0.54,
              -0.06 * m.torsoBulk
            );
            latMesh.rotation.z = -side * 0.24;
            torsoGroup.add(latMesh);
            for (let a = 0; a < 3; a++) {
              const abGeo = trackGeo(
                new THREE2.SphereGeometry(0.088 * m.torsoBulk * mScale, seg(10, 8), seg(8, 6)),
                0.018
              );
              abGeo.scale(1.15, 0.72, 0.78);
              const abMesh = new THREE2.Mesh(
                abGeo,
                isOrganicCreature ? primaryArmorMat : underbodyMat
              );
              abMesh.position.set(
                side * 0.082 * m.torsoBulk,
                torsoHeight * (0.46 - a * 0.13),
                (0.28 - a * 0.015) * m.torsoBulk
              );
              torsoGroup.add(abMesh);
            }
          }
        }
        const isFeralAnimal = config.raceCategory === "starter_animals" || config.raceCategory === "beasts" || furDensity > 0.25;
        if (isFeralAnimal) {
          const maneGeo = trackGeo(
            new THREE2.SphereGeometry(0.37 * m.torsoBulk, seg(16, 12), seg(12, 10)),
            0.025
          );
          maneGeo.scale(1.08, 0.96, 1.22);
          const maneMesh = new THREE2.Mesh(maneGeo, secondaryTrimMat);
          maneMesh.position.set(0, torsoHeight * 0.7, 0.14 * m.torsoBulk);
          maneMesh.castShadow = true;
          torsoGroup.add(maneMesh);
          if (furDensity > 0.15 && hairStyle !== "none") {
            const fScale = 0.75 + furDensity * 0.38;
            const collarLocks = density === "low" ? 8 : 10;
            for (let i = 0; i < collarLocks; i++) {
              const ang = i / collarLocks * Math.PI * 2;
              const lockGeo = trackFurLock(0.088 * m.torsoBulk * fScale, 0.28 * m.torsoBulk * fScale, 0.1);
              const lockMesh = new THREE2.Mesh(lockGeo, hairStrandMat);
              lockMesh.position.set(
                Math.sin(ang) * 0.32 * m.torsoBulk,
                torsoHeight * 0.8 + Math.cos(ang) * 0.06,
                Math.cos(ang) * 0.26 * m.torsoBulk
              );
              lockMesh.rotation.z = -Math.sin(ang) * 0.95;
              lockMesh.rotation.x = Math.cos(ang) * 0.85 - 0.35;
              torsoGroup.add(lockMesh);
            }
          }
        } else {
          const gorgetGeo = trackGeo(
            new THREE2.TorusGeometry(0.26 * m.torsoBulk, 0.065 * m.torsoBulk, seg(10, 8), seg(18, 12))
          );
          gorgetGeo.rotateX(Math.PI / 2 - 0.15);
          const gorgetMesh = new THREE2.Mesh(gorgetGeo, secondaryTrimMat);
          gorgetMesh.position.set(0, torsoHeight * 0.93, 0.03);
          torsoGroup.add(gorgetMesh);
          const chestShape = new THREE2.Shape();
          chestShape.moveTo(-0.28 * m.torsoBulk, torsoHeight * 0.78);
          chestShape.lineTo(0.28 * m.torsoBulk, torsoHeight * 0.78);
          chestShape.lineTo(0.2 * m.torsoBulk, torsoHeight * 0.22);
          chestShape.lineTo(0, torsoHeight * 0.04);
          chestShape.lineTo(-0.2 * m.torsoBulk, torsoHeight * 0.22);
          chestShape.closePath();
          const chestPlateGeo = trackGeo(
            new THREE2.ExtrudeGeometry(chestShape, {
              depth: 0.13 * m.torsoBulk,
              bevelEnabled: true,
              bevelThickness: 0.025,
              bevelSize: 0.02,
              bevelSegments: 2
            })
          );
          const chestPlateMesh = new THREE2.Mesh(chestPlateGeo, secondaryTrimMat);
          chestPlateMesh.position.set(0, 0, 0.26 * m.torsoBulk);
          chestPlateMesh.castShadow = true;
          torsoGroup.add(chestPlateMesh);
        }
      }
    }
    const socketCore = new THREE2.Object3D();
    socketCore.name = "socket_core";
    socketCore.position.set(
      0,
      isQuadruped && !isCentaur ? 0.18 * m.heightScale : torsoHeight * 0.56,
      isQuadruped && !isCentaur ? 0.62 * m.torsoBulk : (isBeholder ? 0.55 : 0.44) * m.torsoBulk
    );
    torsoGroup.add(socketCore);
    const coreGeo = trackGeo(
      new THREE2.OctahedronGeometry((isBeholder ? 0.32 : 0.15) * m.torsoBulk, 2)
    );
    const coreMesh = new THREE2.Mesh(coreGeo, crystalCoreMat);
    coreMesh.name = "Runic_Core_Crystal";
    coreMesh.position.copy(socketCore.position);
    coreMesh.visible = !isOrganicCreature && !isDragon && !isAnimal;
    torsoGroup.add(coreMesh);
    tagExplodablePart(coreMesh, new THREE2.Vector3(0, 0.15, 0.8), {
      name: isBeholder ? "Iris Central del Ojo Tirano" : "N\xFAcleo Cristalino Elemental",
      category: "Accent Detail",
      vertexCount: 128,
      triangleCount: 160,
      materialSummary: "Cristal PBR con transmisi\xF3n \xF3ptica y emisi\xF3n",
      socketName: "socket_core"
    });
    explodableParts.push(coreMesh);
    const neckGroup = makeBone("Neck_Assembly");
    if (isQuadruped && !isCentaur) {
      neckGroup.position.set(0, 0.26 * m.heightScale, 0.48);
    } else {
      neckGroup.position.set(0, torsoHeight * 0.9, 0.04);
    }
    torsoGroup.add(neckGroup);
    const neckLen = Math.max(0.22, 0.56 * m.neckLength);
    const isLongNeck = isDragon || isSerpentine || isQuadruped || m.neckLength > 0.72;
    const headPos = isBeholder ? new THREE2.Vector3(0, -0.1, 0.04) : isQuadruped && !isCentaur ? new THREE2.Vector3(0, neckLen * 0.62, neckLen * 0.52) : isLongNeck ? new THREE2.Vector3(0, neckLen * 0.88, 0.18 * m.neckLength) : new THREE2.Vector3(0, neckLen * 0.48, 0.05);
    if (!isBeholder) {
      const neckCurve = new THREE2.CatmullRomCurve3([
        new THREE2.Vector3(0, -0.16, isQuadruped && !isCentaur ? -0.12 : -0.05),
        new THREE2.Vector3(0, headPos.y * 0.45, headPos.z * 0.45 - 0.01),
        new THREE2.Vector3(0, headPos.y + 0.14, headPos.z - 0.02)
      ]);
      if (isUndeadSkeleton) {
        const darkCervicalMat = trackMat(
          new THREE2.MeshStandardMaterial({
            name: "Mat_SkullSocketVoid",
            color: new THREE2.Color("#07080c"),
            roughness: 0.92,
            metalness: 0.04,
            wireframe
          })
        );
        const cervicalCordGeo = trackGeo(
          new THREE2.TubeGeometry(neckCurve, seg(12, 8), 0.034 * m.torsoBulk, seg(8, 6), false),
          4e-3
        );
        neckGroup.add(new THREE2.Mesh(cervicalCordGeo, darkCervicalMat));
        const cCount = 5;
        for (let cv = 0; cv < cCount; cv++) {
          const cFrac = cv / (cCount - 1);
          const pt = neckCurve.getPoint(0.12 + cFrac * 0.78);
          const cScale = (0.98 - cFrac * 0.12) * m.torsoBulk;
          const cBodyGeo = trackGeo(
            new THREE2.CylinderGeometry(0.068 * cScale, 0.072 * cScale, 0.052, seg(12, 8)),
            6e-3
          );
          const cBodyMesh = new THREE2.Mesh(cBodyGeo, ivoryFangMat);
          cBodyMesh.position.copy(pt);
          cBodyMesh.rotation.x = 0.18;
          cBodyMesh.castShadow = true;
          neckGroup.add(cBodyMesh);
          const cTransGeo = trackGeo(
            new THREE2.CapsuleGeometry(0.018 * cScale, 0.125 * cScale, 5, 8),
            4e-3
          );
          cTransGeo.rotateZ(Math.PI / 2);
          const cTransMesh = new THREE2.Mesh(cTransGeo, ivoryFangMat);
          cTransMesh.position.set(pt.x, pt.y, pt.z - 0.02 * m.torsoBulk);
          neckGroup.add(cTransMesh);
          const cSpineGeo = trackGeo(
            new THREE2.ConeGeometry(0.022 * cScale, 0.095 * cScale, 5),
            4e-3
          );
          cSpineGeo.rotateX(-Math.PI * 0.56);
          const cSpineMesh = new THREE2.Mesh(cSpineGeo, ivoryFangMat);
          cSpineMesh.position.set(pt.x, pt.y - 5e-3, pt.z - 0.068 * m.torsoBulk);
          neckGroup.add(cSpineMesh);
        }
      } else {
        const cervicalFlarePts = [
          new THREE2.Vector2(0.01, -0.22),
          new THREE2.Vector2((isQuadruped ? 0.31 : 0.27) * m.torsoBulk, -0.14),
          new THREE2.Vector2((isQuadruped ? 0.23 : 0.2) * m.torsoBulk, 0.02),
          new THREE2.Vector2((isQuadruped ? 0.18 : 0.16) * m.torsoBulk, 0.14),
          new THREE2.Vector2(0.01, 0.18)
        ];
        const cervicalFlareGeo = trackGeo(new THREE2.LatheGeometry(cervicalFlarePts, seg(16, 12)), 0.018);
        cervicalFlareGeo.scale(1.14, 1, 0.95);
        const cervicalFlareMesh = new THREE2.Mesh(
          cervicalFlareGeo,
          isOrganicCreature || isQuadruped ? primaryArmorMat : underbodyMat
        );
        cervicalFlareMesh.position.set(0, -0.02, isQuadruped && !isCentaur ? -0.04 : 0);
        neckGroup.add(cervicalFlareMesh);
        const neckTubeGeo = trackGeo(
          new THREE2.TubeGeometry(
            neckCurve,
            seg(14, 10),
            (isQuadruped ? 0.185 : 0.165) * m.torsoBulk,
            seg(14, 10),
            false
          ),
          0.022
        );
        const neckMesh = new THREE2.Mesh(neckTubeGeo, primaryArmorMat);
        neckMesh.castShadow = true;
        neckGroup.add(neckMesh);
        if (muscleDef > 0.15) {
          for (const side of [-1, 1]) {
            const scmCurve = new THREE2.CatmullRomCurve3([
              new THREE2.Vector3(side * 0.16 * m.torsoBulk, -0.12, 0.06),
              new THREE2.Vector3(side * 0.12 * m.torsoBulk, headPos.y * 0.48, headPos.z * 0.45 + 0.04),
              new THREE2.Vector3(side * 0.09 * m.torsoBulk, headPos.y + 0.08, headPos.z - 0.02)
            ]);
            const scmGeo = trackGeo(
              new THREE2.TubeGeometry(scmCurve, seg(10, 8), 0.045 * m.torsoBulk, seg(8, 6), false),
              0.012
            );
            const scmMesh = new THREE2.Mesh(
              scmGeo,
              isOrganicCreature || isQuadruped ? primaryArmorMat : underbodyMat
            );
            neckGroup.add(scmMesh);
          }
        }
      }
      if (isDragon || isSerpentine || isQuadruped) {
        const neckSpineCount = 3;
        const useHair = furDensity > 0.2 && hairStyle !== "none";
        for (let ns = 1; ns <= neckSpineCount; ns++) {
          const pt = neckCurve.getPoint(ns / (neckSpineCount + 1));
          const nSpineGeo = useHair ? trackFurLock(0.058 * m.torsoBulk, 0.22 * (0.8 + furDensity * 0.35), 0.08) : trackGeo(new THREE2.ConeGeometry(0.042, 0.14, seg(8, 6)));
          if (!useHair) {
            nSpineGeo.rotateX(-0.55);
          }
          const nSpine = new THREE2.Mesh(
            nSpineGeo,
            isUndeadSkeleton ? ivoryFangMat : useHair ? hairStrandMat : secondaryTrimMat
          );
          nSpine.position.set(0, pt.y + 0.06, pt.z - 0.12 * m.torsoBulk);
          if (useHair) {
            nSpine.rotation.x = -0.65;
          }
          neckGroup.add(nSpine);
        }
      }
    }
    const headGroup = makeBone("Head_Helm_Assembly");
    headGroup.position.copy(headPos);
    neckGroup.add(headGroup);
    if (!isBeholder) {
      const cranialSocketGeo = trackGeo(
        new THREE2.CapsuleGeometry(
          isUndeadSkeleton ? 0.072 : 0.142,
          isUndeadSkeleton ? 0.055 : 0.09,
          seg(10, 8),
          seg(14, 10)
        ),
        0.012
      );
      cranialSocketGeo.scale(1.06, 1, 1.12);
      const cranialSocketMesh = new THREE2.Mesh(
        cranialSocketGeo,
        isUndeadSkeleton ? ivoryFangMat : isOrganicCreature || isQuadruped ? primaryArmorMat : underbodyMat
      );
      cranialSocketMesh.position.set(0, isUndeadSkeleton ? 0.135 : 0.09, isUndeadSkeleton ? -0.055 : 0.01);
      cranialSocketMesh.rotation.x = 0.22;
      headGroup.add(cranialSocketMesh);
    }
    const snoutLen = 0.34 * m.snoutLength;
    const socketHead = new THREE2.Object3D();
    socketHead.name = "socket_head";
    socketHead.position.set(0, 0.2, 0.24 + snoutLen * 0.5);
    headGroup.add(socketHead);
    const jawGroup = makeBone("Articulated_Lower_Jaw");
    jawGroup.position.set(0, 0.09, 0.06);
    headGroup.add(jawGroup);
    const isHumanoidBullHorned = config.archetype === "balrog_archdemon" || config.archetype === "lesser_fire_imp" || config.archetype === "briar_wood_spriggan";
    const isLivingCrownedHumanoid = config.archetype === "vampire_lord" || config.archetype === "gorgon_medusa" || config.archetype === "treant_ancient";
    const isSkeletalSkullFace = isUndeadSkeleton || config.archetype === "flesh_bone_abomination" || config.archetype === "plague_hierophant_mummy" || config.archetype === "necrotic_archdragon" || config.helm === "crowned_skull" && !isLivingCrownedHumanoid;
    if ((config.helm === "draconic_snout" || config.helm === "lupine_maw" || config.helm === "tauren_bull_horns" && !isHumanoidBullHorned) && !isSkeletalSkullFace) {
      const craniumGeo = trackGeo(
        new THREE2.SphereGeometry(0.25, seg(18, 12), seg(14, 10)),
        0.018
      );
      craniumGeo.scale(0.98, 0.88, 1.24);
      const craniumMesh = new THREE2.Mesh(craniumGeo, primaryArmorMat);
      craniumMesh.position.set(0, 0.18, 0.04);
      craniumMesh.castShadow = true;
      headGroup.add(craniumMesh);
      for (const side of [-1, 1]) {
        const browGeo = trackGeo(new THREE2.SphereGeometry(0.09, seg(12, 8), seg(10, 8)));
        browGeo.scale(0.88, 0.58, 1.9);
        const browRidge = new THREE2.Mesh(browGeo, secondaryTrimMat);
        browRidge.position.set(side * 0.13, 0.25, 0.15);
        browRidge.rotation.y = side * 0.2;
        browRidge.rotation.z = -side * 0.16;
        headGroup.add(browRidge);
        if (muscleDef > 0.15) {
          const masseterGeo = trackGeo(new THREE2.SphereGeometry(0.095, seg(10, 8), seg(8, 6)));
          masseterGeo.scale(0.85, 0.95, 1.35);
          const masseterMesh = new THREE2.Mesh(masseterGeo, primaryArmorMat);
          masseterMesh.position.set(side * 0.155, 0.13, 0.06);
          headGroup.add(masseterMesh);
        }
        if (furDensity > 0.15 && hairStyle !== "none") {
          const fScale = 0.75 + furDensity * 0.36;
          for (let c = 0; c < 3; c++) {
            const cheekTuftGeo = trackFurLock(0.055 * fScale, (0.22 - c * 0.03) * fScale, 0.07);
            const cheekTuft = new THREE2.Mesh(cheekTuftGeo, hairStrandMat);
            cheekTuft.position.set(side * 0.18, 0.19 - c * 0.055, 0.03 - c * 0.02);
            cheekTuft.rotation.z = -side * (1.15 - c * 0.12);
            cheekTuft.rotation.x = -0.58;
            headGroup.add(cheekTuft);
          }
        }
      }
      const muzzleLen = snoutLen + 0.26;
      const snoutPts = [
        new THREE2.Vector2(0.01, -0.04),
        new THREE2.Vector2(0.195, 0),
        // Wide base embedded inside cranium
        new THREE2.Vector2(0.155, muzzleLen * 0.45),
        // Mid nasal bridge
        new THREE2.Vector2(0.11, muzzleLen * 0.88),
        // Muzzle tip
        new THREE2.Vector2(0.065, muzzleLen),
        new THREE2.Vector2(0.01, muzzleLen + 0.02)
      ];
      const upperSnoutGeo = trackGeo(new THREE2.LatheGeometry(snoutPts, seg(18, 12)));
      upperSnoutGeo.rotateX(Math.PI / 2);
      upperSnoutGeo.scale(0.96, 0.72, 1);
      const upperSnoutMesh = new THREE2.Mesh(upperSnoutGeo, primaryArmorMat);
      upperSnoutMesh.position.set(0, 0.16, 0.06);
      upperSnoutMesh.castShadow = true;
      headGroup.add(upperSnoutMesh);
      const snoutTipZ = 0.06 + muzzleLen;
      const noseTipGeo = trackGeo(new THREE2.SphereGeometry(0.065, seg(12, 8), seg(10, 8)));
      noseTipGeo.scale(1.12, 0.78, 0.9);
      const noseTipMesh = new THREE2.Mesh(noseTipGeo, underbodyMat);
      noseTipMesh.position.set(0, 0.175, snoutTipZ);
      headGroup.add(noseTipMesh);
      if (config.helm === "tauren_bull_horns" && config.raceCategory !== "starter_animals") {
        const noseRingGeo = trackGeo(
          new THREE2.TorusGeometry(0.082, 0.018, seg(8, 6), seg(14, 10))
        );
        const noseRingMesh = new THREE2.Mesh(noseRingGeo, secondaryTrimMat);
        noseRingMesh.position.set(0, 0.11, snoutTipZ - 0.04);
        noseRingMesh.rotation.x = 0.3;
        headGroup.add(noseRingMesh);
      }
      for (const side of [-1, 1]) {
        const eyeGeo = trackGeo(new THREE2.SphereGeometry(0.046, seg(10, 8), seg(8, 6)));
        eyeGeo.scale(0.7, 0.82, 1.3);
        const eyeMesh = new THREE2.Mesh(eyeGeo, emissiveRuneMat);
        eyeMesh.position.set(side * 0.145, 0.22, 0.17);
        headGroup.add(eyeMesh);
      }
      const jawLen = snoutLen + 0.22;
      const jawPts = [
        new THREE2.Vector2(0.01, -0.04),
        new THREE2.Vector2(0.155, 0),
        // Wide mandibular hinge inside skull
        new THREE2.Vector2(0.125, jawLen * 0.5),
        new THREE2.Vector2(0.085, jawLen * 0.9),
        new THREE2.Vector2(0.01, jawLen + 0.02)
      ];
      const lowerJawGeo = trackGeo(new THREE2.LatheGeometry(jawPts, seg(16, 12)));
      lowerJawGeo.rotateX(Math.PI / 2);
      lowerJawGeo.scale(0.92, 0.54, 1);
      const lowerJawMesh = new THREE2.Mesh(lowerJawGeo, underbodyMat);
      lowerJawMesh.position.set(0, 0, 0);
      jawGroup.add(lowerJawMesh);
      for (const side of [-1, 1]) {
        const isBoar = config.archetype === "rabid_razorback_boar" || config.archetype === "iron_boar_juggernaut" || config.archetype === "phantom_armored_boar";
        const fangGeo = trackGeo(
          new THREE2.ConeGeometry(isBoar ? 0.038 : 0.026, isBoar ? 0.22 : 0.11, seg(10, 8))
        );
        const fangMesh = new THREE2.Mesh(fangGeo, ivoryFangMat);
        fangMesh.position.set(
          side * (isBoar ? 0.095 : 0.068),
          isBoar ? 0.08 : 0.045,
          jawLen * 0.82
        );
        if (isBoar) {
          fangMesh.rotation.x = 0.32;
          fangMesh.rotation.z = -side * 0.26;
        }
        jawGroup.add(fangMesh);
        const upperFangGeo = trackGeo(new THREE2.ConeGeometry(0.028, 0.12, seg(10, 8)));
        upperFangGeo.rotateX(Math.PI);
        const upperFang = new THREE2.Mesh(upperFangGeo, ivoryFangMat);
        upperFang.position.set(side * 0.082, 0.1, 0.06 + muzzleLen * 0.72);
        headGroup.add(upperFang);
      }
    } else if (config.helm === "avian_phoenix_beak") {
      const avianSkullGeo = trackGeo(
        new THREE2.SphereGeometry(0.24, seg(18, 14), seg(14, 10)),
        0.016
      );
      avianSkullGeo.scale(0.96, 0.92, 1.18);
      const avianSkull = new THREE2.Mesh(avianSkullGeo, primaryArmorMat);
      avianSkull.position.set(0, 0.19, 0.04);
      avianSkull.castShadow = true;
      headGroup.add(avianSkull);
      const raptorPupilMat = trackMat(
        new THREE2.MeshStandardMaterial({
          name: "Mat_RaptorPupil",
          color: new THREE2.Color("#090505"),
          roughness: 0.08,
          metalness: 0.2,
          wireframe
        })
      );
      for (const side of [-1, 1]) {
        const browGeo = trackGeo(new THREE2.SphereGeometry(0.085, seg(12, 8), seg(10, 8)), 0.012);
        browGeo.scale(0.85, 0.52, 1.85);
        const browMesh = new THREE2.Mesh(browGeo, primaryArmorMat);
        browMesh.position.set(side * 0.135, 0.255, 0.14);
        browMesh.rotation.y = side * 0.22;
        browMesh.rotation.z = -side * 0.22;
        headGroup.add(browMesh);
        const eyeGeo = trackGeo(new THREE2.SphereGeometry(0.048, seg(12, 8), seg(10, 8)), 4e-3);
        eyeGeo.scale(0.78, 0.92, 1.18);
        const eyeMesh = new THREE2.Mesh(eyeGeo, emissiveRuneMat);
        eyeMesh.position.set(side * 0.135, 0.215, 0.165);
        headGroup.add(eyeMesh);
        const pupilGeo = trackGeo(new THREE2.SphereGeometry(0.022, 8, 6), 0);
        pupilGeo.scale(0.55, 1.15, 0.65);
        const pupilMesh = new THREE2.Mesh(pupilGeo, raptorPupilMat);
        pupilMesh.position.set(side * 0.155, 0.215, 0.198);
        headGroup.add(pupilMesh);
      }
      const beakCurve = new THREE2.CatmullRomCurve3([
        new THREE2.Vector3(0, 0.185, 0.08),
        new THREE2.Vector3(0, 0.185, 0.24 + snoutLen * 0.48),
        new THREE2.Vector3(0, 0.095, 0.35 + snoutLen * 0.85)
      ]);
      const beakGeo = trackGeo(
        new THREE2.TubeGeometry(beakCurve, seg(14, 10), 0.084, seg(12, 8), false),
        0.012
      );
      beakGeo.scale(0.86, 1.05, 1);
      const beakMesh = new THREE2.Mesh(beakGeo, secondaryTrimMat);
      beakMesh.castShadow = true;
      headGroup.add(beakMesh);
      const beakTipGeo = trackGeo(new THREE2.ConeGeometry(0.056, 0.14, seg(10, 8)), 6e-3);
      const beakTip = new THREE2.Mesh(beakTipGeo, ivoryFangMat);
      beakTip.position.set(0, 0.065, 0.36 + snoutLen * 0.86);
      beakTip.rotation.x = Math.PI - 0.32;
      headGroup.add(beakTip);
      const lowerBeakLen = 0.22 + snoutLen * 0.62;
      const lowerBeakCurve = new THREE2.CatmullRomCurve3([
        new THREE2.Vector3(0, 0, 0),
        new THREE2.Vector3(0, -0.01, lowerBeakLen * 0.55),
        new THREE2.Vector3(0, 0.015, lowerBeakLen)
      ]);
      const lowerBeakGeo = trackGeo(
        new THREE2.TubeGeometry(lowerBeakCurve, seg(12, 8), 0.058, seg(10, 8), false),
        0.01
      );
      lowerBeakGeo.scale(0.84, 0.72, 1);
      const lowerBeakMesh = new THREE2.Mesh(lowerBeakGeo, secondaryTrimMat);
      jawGroup.add(lowerBeakMesh);
      for (const side of [-1, 1]) {
        for (let t = 0; t < 3; t++) {
          const tomiaGeo = trackGeo(new THREE2.ConeGeometry(0.016, 0.052, 6), 3e-3);
          const tomiaTooth = new THREE2.Mesh(tomiaGeo, ivoryFangMat);
          tomiaTooth.position.set(side * 0.038, 0.025, 0.06 + t * (lowerBeakLen * 0.25));
          tomiaTooth.rotation.x = 0.25;
          jawGroup.add(tomiaTooth);
        }
      }
    } else if (config.helm === "goblin_feral_face" || config.archetype === "forest_goblin_scavenger") {
      const rabidScleraMat = trackMat(
        new THREE2.MeshStandardMaterial({
          name: "Mat_GoblinRabidSclera",
          color: new THREE2.Color("#fef08a"),
          emissive: new THREE2.Color("#dc2626"),
          emissiveIntensity: 1.9,
          roughness: 0.14,
          metalness: 0.05,
          wireframe
        })
      );
      const rabidIrisMat = trackMat(
        new THREE2.MeshStandardMaterial({
          name: "Mat_GoblinRabidIris",
          color: new THREE2.Color("#ff2a00"),
          emissive: new THREE2.Color("#ff4500"),
          emissiveIntensity: 3.4,
          roughness: 0.1,
          metalness: 0.08,
          wireframe
        })
      );
      const slitPupilMat = trackMat(
        new THREE2.MeshStandardMaterial({
          name: "Mat_GoblinSlitPupil",
          color: new THREE2.Color("#090505"),
          roughness: 0.08,
          metalness: 0.2,
          wireframe
        })
      );
      const craniumGeo = new THREE2.SphereGeometry(0.245, seg(24, 18), seg(20, 14));
      const cPos = craniumGeo.getAttribute("position");
      for (let i = 0; i < cPos.count; i++) {
        let x = cPos.getX(i);
        let y = cPos.getY(i);
        let z = cPos.getZ(i);
        const ax = Math.abs(x);
        if (y > -0.08 && y < 0.06 && z > 0.02 && ax > 0.09) {
          const cheekBoost = Math.exp(-Math.pow((y + 0.01) / 0.06, 2));
          x *= 1 + 0.28 * cheekBoost;
          z += 0.045 * cheekBoost;
        }
        if (y > 0 && y < 0.11 && z > 0.1 && ax > 0.04 && ax < 0.16) {
          z -= 0.042;
        }
        if (y >= 0.07 && y < 0.16 && z > 0.08) {
          const browV = 1 - Math.min(1, ax / 0.18) * 0.35;
          z += 0.058 * browV;
          y -= (1 - Math.min(1, ax / 0.14)) * 0.028;
        }
        if (y < -0.06 && z > 0.04) {
          z += 0.055;
          x *= 1.12;
        }
        cPos.setXYZ(i, x, y, z);
      }
      craniumGeo.scale(1.06, 0.94, 1.14);
      trackGeo(craniumGeo, 0.02, 7.5, 0.28);
      const craniumMesh = new THREE2.Mesh(craniumGeo, primaryArmorMat);
      craniumMesh.position.set(0, 0.19, 0.04);
      craniumMesh.castShadow = true;
      headGroup.add(craniumMesh);
      for (const side of [-1, 1]) {
        const browCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(side * 0.02, 0.235, 0.245),
          new THREE2.Vector3(side * 0.11, 0.268, 0.235),
          new THREE2.Vector3(side * 0.195, 0.255, 0.155)
        ]);
        const browGeo = trackGeo(
          new THREE2.TubeGeometry(browCurve, seg(12, 8), 0.044, seg(10, 8), false),
          0.016
        );
        const browMesh = new THREE2.Mesh(browGeo, primaryArmorMat);
        headGroup.add(browMesh);
        const cheekGeo = trackGeo(new THREE2.SphereGeometry(0.088, seg(12, 8), seg(10, 8)), 0.018);
        cheekGeo.scale(1.18, 0.72, 1.25);
        const cheekMesh = new THREE2.Mesh(cheekGeo, primaryArmorMat);
        cheekMesh.position.set(side * 0.155, 0.145, 0.155);
        cheekMesh.rotation.y = side * 0.28;
        cheekMesh.rotation.z = -side * 0.18;
        headGroup.add(cheekMesh);
        const templeStudGeo = trackGeo(new THREE2.ConeGeometry(0.026, 0.065, 6), 5e-3);
        const templeStud = new THREE2.Mesh(templeStudGeo, secondaryTrimMat);
        templeStud.position.set(side * 0.17, 0.33, -0.02);
        templeStud.rotation.z = -side * 0.45;
        headGroup.add(templeStud);
      }
      const capBandGeo = trackGeo(
        new THREE2.SphereGeometry(0.242, seg(16, 12), seg(12, 8), 0, Math.PI * 2, 0, Math.PI * 0.42),
        0.014
      );
      capBandGeo.scale(1.07, 0.92, 1.12);
      const capBandMesh = new THREE2.Mesh(capBandGeo, secondaryTrimMat);
      capBandMesh.position.set(0, 0.21, 0.01);
      capBandMesh.rotation.x = -0.36;
      headGroup.add(capBandMesh);
      const noseLen = 0.18 + snoutLen * 0.42;
      const noseCurve = new THREE2.CatmullRomCurve3([
        new THREE2.Vector3(0, 0.23, 0.18),
        new THREE2.Vector3(0, 0.205, 0.26 + noseLen * 0.45),
        new THREE2.Vector3(0, 0.155, 0.28 + noseLen * 0.92),
        new THREE2.Vector3(0, 0.12, 0.26 + noseLen * 1.02)
      ]);
      const noseGeo = trackGeo(
        new THREE2.TubeGeometry(noseCurve, seg(14, 10), 0.048, seg(12, 8), false),
        0.016
      );
      noseGeo.scale(0.86, 1.05, 1);
      const noseMesh = new THREE2.Mesh(noseGeo, primaryArmorMat);
      noseMesh.castShadow = true;
      headGroup.add(noseMesh);
      const noseTipGeo = trackGeo(new THREE2.SphereGeometry(0.046, seg(10, 8), seg(8, 6)), 0.014);
      noseTipGeo.scale(0.95, 0.85, 1.25);
      const noseTipMesh = new THREE2.Mesh(noseTipGeo, primaryArmorMat);
      noseTipMesh.position.set(0, 0.132, 0.27 + noseLen * 0.96);
      headGroup.add(noseTipMesh);
      const wartGeo = trackGeo(new THREE2.SphereGeometry(0.022, 8, 6), 8e-3);
      const wartMesh = new THREE2.Mesh(wartGeo, underbodyMat);
      wartMesh.position.set(0.022, 0.2, 0.24 + noseLen * 0.55);
      headGroup.add(wartMesh);
      for (const side of [-1, 1]) {
        const nostrilGeo = trackGeo(new THREE2.SphereGeometry(0.028, 8, 6), 0.01);
        nostrilGeo.scale(1.1, 0.8, 1.2);
        const nostrilMesh = new THREE2.Mesh(nostrilGeo, primaryArmorMat);
        nostrilMesh.position.set(side * 0.042, 0.15, 0.24 + noseLen * 0.72);
        headGroup.add(nostrilMesh);
      }
      for (const side of [-1, 1]) {
        const eyeX = side * 0.105;
        const eyeY = 0.212;
        const eyeZ = 0.215;
        const orbitRimGeo = trackGeo(
          new THREE2.TorusGeometry(0.056, 0.015, seg(8, 6), seg(14, 10)),
          8e-3
        );
        const orbitRim = new THREE2.Mesh(orbitRimGeo, underbodyMat);
        orbitRim.position.set(eyeX, eyeY, eyeZ - 8e-3);
        orbitRim.rotation.y = side * 0.24;
        orbitRim.rotation.z = -side * 0.22;
        headGroup.add(orbitRim);
        const scleraGeo = trackGeo(new THREE2.SphereGeometry(0.052, seg(14, 10), seg(12, 8)), 4e-3);
        scleraGeo.scale(1.05, 0.96, 1.12);
        const scleraMesh = new THREE2.Mesh(scleraGeo, rabidScleraMat);
        scleraMesh.position.set(eyeX, eyeY, eyeZ);
        scleraMesh.rotation.y = side * 0.22;
        headGroup.add(scleraMesh);
        const irisGeo = trackGeo(new THREE2.SphereGeometry(0.035, seg(12, 8), seg(10, 8)), 2e-3);
        irisGeo.scale(1, 0.95, 0.65);
        const irisMesh = new THREE2.Mesh(irisGeo, rabidIrisMat);
        irisMesh.position.set(eyeX + side * 6e-3, eyeY, eyeZ + 0.038);
        irisMesh.rotation.y = side * 0.22;
        headGroup.add(irisMesh);
        const pupilGeo = trackGeo(new THREE2.SphereGeometry(0.02, 10, 8), 0);
        pupilGeo.scale(0.38, 1.25, 0.55);
        const pupilMesh = new THREE2.Mesh(pupilGeo, slitPupilMat);
        pupilMesh.position.set(eyeX + side * 8e-3, eyeY, eyeZ + 0.052);
        pupilMesh.rotation.y = side * 0.22;
        pupilMesh.rotation.z = -side * 0.12;
        headGroup.add(pupilMesh);
      }
      const upperMawGeo = trackGeo(
        new THREE2.CylinderGeometry(0.145, 0.165, 0.075, seg(16, 12), 2),
        0.014
      );
      upperMawGeo.scale(1.15, 1, 0.92);
      const upperMawMesh = new THREE2.Mesh(upperMawGeo, primaryArmorMat);
      upperMawMesh.position.set(0, 0.115, 0.155);
      headGroup.add(upperMawMesh);
      const mouthCavityGeo = trackGeo(new THREE2.SphereGeometry(0.135, seg(12, 8), seg(10, 8)), 8e-3);
      mouthCavityGeo.scale(1.12, 0.65, 0.95);
      const mouthCavityMesh = new THREE2.Mesh(mouthCavityGeo, slitPupilMat);
      mouthCavityMesh.position.set(0, 0.095, 0.155);
      headGroup.add(mouthCavityMesh);
      const upperTeethSpecs = [
        { x: -0.125, r: 0.028, h: 0.115, rotZ: -0.18, rotX: Math.PI - 0.18 },
        // Left huge upper canine
        { x: -0.082, r: 0.022, h: 0.088, rotZ: -0.08, rotX: Math.PI - 0.22 },
        { x: -0.044, r: 0.024, h: 0.096, rotZ: -0.04, rotX: Math.PI - 0.26 },
        { x: 0, r: 0.021, h: 0.085, rotZ: 0.02, rotX: Math.PI - 0.25 },
        { x: 0.044, r: 0.025, h: 0.098, rotZ: 0.05, rotX: Math.PI - 0.26 },
        { x: 0.082, r: 0.022, h: 0.088, rotZ: 0.08, rotX: Math.PI - 0.22 },
        { x: 0.125, r: 0.028, h: 0.115, rotZ: 0.18, rotX: Math.PI - 0.18 }
        // Right huge upper canine
      ];
      for (let t = 0; t < upperTeethSpecs.length; t++) {
        const sp = upperTeethSpecs[t];
        const zCurve = Math.cos(sp.x / 0.145 * (Math.PI * 0.42)) * 0.135;
        const toothGeo = trackGeo(new THREE2.ConeGeometry(sp.r, sp.h, seg(10, 8)), 5e-3);
        const toothMesh = new THREE2.Mesh(toothGeo, ivoryFangMat);
        toothMesh.position.set(sp.x, 0.082, 0.135 + zCurve);
        toothMesh.rotation.x = sp.rotX;
        toothMesh.rotation.z = sp.rotZ;
        headGroup.add(toothMesh);
      }
      const jawLen = 0.24 + snoutLen * 0.22;
      const jawPts = [
        new THREE2.Vector2(0.01, -0.04),
        new THREE2.Vector2(0.168, 0),
        new THREE2.Vector2(0.162, jawLen * 0.55),
        new THREE2.Vector2(0.128, jawLen * 0.92),
        new THREE2.Vector2(0.01, jawLen + 0.03)
      ];
      const lowerJawGeo = trackGeo(new THREE2.LatheGeometry(jawPts, seg(18, 12)), 0.018);
      lowerJawGeo.rotateX(Math.PI / 2);
      lowerJawGeo.scale(1.08, 0.58, 1);
      const lowerJawMesh = new THREE2.Mesh(lowerJawGeo, primaryArmorMat);
      lowerJawMesh.position.set(0, -0.035, 0);
      lowerJawMesh.castShadow = true;
      jawGroup.add(lowerJawMesh);
      const chinGeo = trackGeo(new THREE2.SphereGeometry(0.068, seg(12, 8), seg(10, 8)), 0.015);
      chinGeo.scale(1.15, 0.85, 1.25);
      const chinMesh = new THREE2.Mesh(chinGeo, underbodyMat);
      chinMesh.position.set(0, -0.055, jawLen * 0.92);
      jawGroup.add(chinMesh);
      const lowerTeethSpecs = [
        { x: -0.138, r: 0.034, h: 0.155, rotZ: 0.24, rotX: 0.28 },
        // Left massive outer goblin tusk!
        { x: -0.096, r: 0.026, h: 0.112, rotZ: 0.12, rotX: 0.22 },
        { x: -0.058, r: 0.024, h: 0.098, rotZ: 0.06, rotX: 0.25 },
        { x: -0.02, r: 0.022, h: 0.092, rotZ: 0.02, rotX: 0.28 },
        { x: 0.02, r: 0.022, h: 0.092, rotZ: -0.02, rotX: 0.28 },
        { x: 0.058, r: 0.024, h: 0.098, rotZ: -0.06, rotX: 0.25 },
        { x: 0.096, r: 0.026, h: 0.112, rotZ: -0.12, rotX: 0.22 },
        { x: 0.138, r: 0.034, h: 0.155, rotZ: -0.24, rotX: 0.28 }
        // Right massive outer goblin tusk!
      ];
      for (let t = 0; t < lowerTeethSpecs.length; t++) {
        const sp = lowerTeethSpecs[t];
        const zCurve = Math.cos(sp.x / 0.155 * (Math.PI * 0.42)) * (jawLen * 0.86);
        const fangGeo = trackGeo(new THREE2.ConeGeometry(sp.r, sp.h, seg(10, 8)), 5e-3);
        const fangMesh = new THREE2.Mesh(fangGeo, ivoryFangMat);
        fangMesh.position.set(sp.x, 0.022 + (Math.abs(sp.x) > 0.11 ? 0.022 : 0), 0.025 + zCurve);
        fangMesh.rotation.x = sp.rotX;
        fangMesh.rotation.z = sp.rotZ;
        jawGroup.add(fangMesh);
      }
    } else if (isSkeletalSkullFace) {
      const isBoneWhiteSkull = isUndeadSkeleton || config.materials.preset === "ancient_bone";
      const skullBoneMat = isBoneWhiteSkull ? trackMat(
        new THREE2.MeshStandardMaterial({
          name: "Mat_SculptedCraniumBone",
          color: new THREE2.Color("#dfd7c6").lerp(new THREE2.Color(matCfg.primaryColor), 0.25),
          vertexColors: true,
          roughness: 0.56,
          metalness: 0.12,
          bumpMap: textures.armorBumpMap,
          bumpScale: 0.024,
          wireframe
        })
      ) : primaryArmorMat;
      const darkSocketMat = trackMat(
        new THREE2.MeshStandardMaterial({
          name: "Mat_SkullSocketVoid",
          color: new THREE2.Color("#070506"),
          roughness: 0.92,
          metalness: 0.05,
          wireframe
        })
      );
      const skullRabidEyeMat = trackMat(
        new THREE2.MeshStandardMaterial({
          name: "Mat_SkullRabidSoulEye",
          color: new THREE2.Color("#fef08a").lerp(new THREE2.Color(matCfg.emissiveColor), 0.55),
          emissive: new THREE2.Color(matCfg.emissiveColor),
          emissiveIntensity: 3.6,
          roughness: 0.1,
          metalness: 0.08,
          wireframe
        })
      );
      const toothEnamelMat = trackMat(
        new THREE2.MeshStandardMaterial({
          name: "Mat_ToothEnamel",
          color: new THREE2.Color("#fefcf2"),
          roughness: 0.16,
          metalness: 0.04,
          wireframe
        })
      );
      const skullCraniumGeo = new THREE2.SphereGeometry(0.245, seg(26, 20), seg(22, 16));
      const sPos = skullCraniumGeo.getAttribute("position");
      for (let i = 0; i < sPos.count; i++) {
        let x = sPos.getX(i);
        let y = sPos.getY(i);
        let z = sPos.getZ(i);
        const ax = Math.abs(x);
        if (y > -0.02 && y < 0.13 && ax > 0.13 && z > -0.06 && z < 0.11) {
          x *= 0.87;
        }
        if (y > -0.055 && y < 0.045 && z > 0.03 && ax > 0.085) {
          const zygoFactor = Math.exp(-Math.pow((y + 5e-3) / 0.052, 2));
          x *= 1 + 0.26 * zygoFactor;
          z += 0.044 * zygoFactor;
        }
        if (y <= -0.038 && ax > 0.082 && z > -0.04) {
          x *= 0.72;
          z -= 0.038;
        }
        if (y > -0.01 && y < 0.105 && z > 0.105 && ax > 0.034 && ax < 0.158) {
          z -= 0.064;
        }
        if (y >= 0.075 && y < 0.158 && z > 0.09) {
          const browW = 1 - Math.min(1, ax / 0.18) * 0.32;
          z += 0.054 * browW;
          y -= (1 - Math.min(1, ax / 0.13)) * 0.025;
        }
        if (y < -0.062 && z > -0.05) {
          y = -0.062 + (y + 0.062) * 0.15;
          z *= 0.82;
        }
        sPos.setXYZ(i, x, y, z);
      }
      skullCraniumGeo.scale(0.98, 1.02, 1.12);
      trackGeo(skullCraniumGeo, 0.016, 7.5, 0.28);
      const skullCraniumMesh = new THREE2.Mesh(skullCraniumGeo, skullBoneMat);
      skullCraniumMesh.position.set(0, 0.212, 0.032);
      skullCraniumMesh.castShadow = true;
      headGroup.add(skullCraniumMesh);
      for (const side of [-1, 1]) {
        const eyeX = side * 0.094;
        const eyeY = 0.214;
        const eyeZ = 0.202;
        const orbitVoidGeo = trackGeo(new THREE2.SphereGeometry(0.062, seg(12, 8), seg(10, 8)), 4e-3);
        orbitVoidGeo.scale(1.06, 0.94, 0.78);
        const orbitVoidMesh = new THREE2.Mesh(orbitVoidGeo, darkSocketMat);
        orbitVoidMesh.position.set(eyeX, eyeY, eyeZ - 0.012);
        orbitVoidMesh.rotation.y = side * 0.2;
        headGroup.add(orbitVoidMesh);
        const orbitRimGeo = trackGeo(
          new THREE2.TorusGeometry(0.062, 0.017, seg(10, 8), seg(16, 12)),
          0.012
        );
        const orbitRimMesh = new THREE2.Mesh(orbitRimGeo, skullBoneMat);
        orbitRimMesh.position.set(eyeX, eyeY, eyeZ - 4e-3);
        orbitRimMesh.rotation.y = side * 0.22;
        orbitRimMesh.rotation.z = -side * 0.22;
        headGroup.add(orbitRimMesh);
        const browCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(side * 0.018, 0.238, 0.242),
          new THREE2.Vector3(side * 0.102, 0.272, 0.232),
          new THREE2.Vector3(side * 0.178, 0.252, 0.165)
        ]);
        const browGeo = trackGeo(
          new THREE2.TubeGeometry(browCurve, seg(12, 8), 0.036, seg(10, 8), false),
          0.014
        );
        const browMesh = new THREE2.Mesh(browGeo, skullBoneMat);
        headGroup.add(browMesh);
        const zygoCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(side * 0.065, 0.152, 0.225),
          new THREE2.Vector3(side * 0.165, 0.155, 0.168),
          new THREE2.Vector3(side * 0.192, 0.168, 0.045)
        ]);
        const zygoGeo = trackGeo(
          new THREE2.TubeGeometry(zygoCurve, seg(12, 8), 0.032, seg(10, 8), false),
          0.012
        );
        const zygoMesh = new THREE2.Mesh(zygoGeo, skullBoneMat);
        zygoMesh.castShadow = true;
        headGroup.add(zygoMesh);
        const cheekHollowGeo = trackGeo(new THREE2.SphereGeometry(0.054, 10, 8), 6e-3);
        cheekHollowGeo.scale(0.65, 0.85, 1.15);
        const cheekHollowMesh = new THREE2.Mesh(cheekHollowGeo, darkSocketMat);
        cheekHollowMesh.position.set(side * 0.125, 0.118, 0.135);
        headGroup.add(cheekHollowMesh);
        const soulEyeGeo = trackGeo(new THREE2.SphereGeometry(0.038, seg(12, 8), seg(10, 8)), 2e-3);
        soulEyeGeo.scale(1, 0.92, 0.85);
        const soulEyeMesh = new THREE2.Mesh(soulEyeGeo, skullRabidEyeMat);
        soulEyeMesh.position.set(eyeX, eyeY, eyeZ + 0.012);
        headGroup.add(soulEyeMesh);
        const pupilGeo = trackGeo(new THREE2.SphereGeometry(0.018, 8, 6), 0);
        pupilGeo.scale(0.38, 1.25, 0.55);
        const pupilMesh = new THREE2.Mesh(pupilGeo, darkSocketMat);
        pupilMesh.position.set(eyeX + side * 5e-3, eyeY, eyeZ + 0.036);
        headGroup.add(pupilMesh);
      }
      const nasalBridgeGeo = trackGeo(new THREE2.ConeGeometry(0.034, 0.085, 6), 8e-3);
      const nasalBridgeMesh = new THREE2.Mesh(nasalBridgeGeo, skullBoneMat);
      nasalBridgeMesh.position.set(0, 0.205, 0.242);
      nasalBridgeMesh.rotation.x = 0.38;
      headGroup.add(nasalBridgeMesh);
      const nasalVoidGeo = trackGeo(new THREE2.ConeGeometry(0.044, 0.082, 4), 4e-3);
      nasalVoidGeo.scale(0.95, 1, 0.65);
      const nasalVoidMesh = new THREE2.Mesh(nasalVoidGeo, darkSocketMat);
      nasalVoidMesh.position.set(0, 0.162, 0.238);
      nasalVoidMesh.rotation.y = Math.PI * 0.25;
      headGroup.add(nasalVoidMesh);
      const septumGeo = trackGeo(new THREE2.BoxGeometry(0.01, 0.068, 0.035), 2e-3);
      const septumMesh = new THREE2.Mesh(septumGeo, skullBoneMat);
      septumMesh.position.set(0, 0.158, 0.244);
      headGroup.add(septumMesh);
      const maxillaArchCurve = new THREE2.CatmullRomCurve3([
        new THREE2.Vector3(-0.125, 0.126, 0.115),
        new THREE2.Vector3(-0.085, 0.122, 0.235),
        new THREE2.Vector3(0, 0.12, 0.268),
        new THREE2.Vector3(0.085, 0.122, 0.235),
        new THREE2.Vector3(0.125, 0.126, 0.115)
      ]);
      const upperMaxillaGeo = trackGeo(
        new THREE2.TubeGeometry(maxillaArchCurve, seg(18, 12), 0.026, seg(10, 8), false),
        8e-3
      );
      upperMaxillaGeo.scale(1, 1.15, 1);
      const upperMaxillaMesh = new THREE2.Mesh(upperMaxillaGeo, skullBoneMat);
      headGroup.add(upperMaxillaMesh);
      const skullMouthVoidGeo = trackGeo(
        new THREE2.CylinderGeometry(0.105, 0.108, 0.095, seg(14, 10)),
        4e-3
      );
      skullMouthVoidGeo.scale(1.05, 1, 0.92);
      const skullMouthVoid = new THREE2.Mesh(skullMouthVoidGeo, darkSocketMat);
      skullMouthVoid.position.set(0, 0.072, 0.145);
      headGroup.add(skullMouthVoid);
      const skullUpperTeeth = [
        { x: -0.108, r: 0.017, h: 0.064, isCanine: false, rotZ: -0.12 },
        { x: -0.078, r: 0.021, h: 0.088, isCanine: true, rotZ: -0.06 },
        // Left upper canine fang
        { x: -0.048, r: 0.017, h: 0.068, isCanine: false, rotZ: -0.03 },
        { x: -0.017, r: 0.018, h: 0.072, isCanine: false, rotZ: -0.01 },
        // Left central incisor
        { x: 0.017, r: 0.018, h: 0.072, isCanine: false, rotZ: 0.01 },
        // Right central incisor
        { x: 0.048, r: 0.017, h: 0.068, isCanine: false, rotZ: 0.03 },
        { x: 0.078, r: 0.021, h: 0.088, isCanine: true, rotZ: 0.06 },
        // Right upper canine fang
        { x: 0.108, r: 0.017, h: 0.064, isCanine: false, rotZ: 0.12 }
      ];
      for (let t = 0; t < skullUpperTeeth.length; t++) {
        const sp = skullUpperTeeth[t];
        const zCurve = Math.cos(sp.x / 0.128 * (Math.PI * 0.44)) * 0.132;
        const toothZ = 0.146 + zCurve;
        const rootBulgeGeo = trackGeo(
          new THREE2.CylinderGeometry(sp.r * 0.85, sp.r * 1.05, 0.034, 7),
          3e-3
        );
        const rootBulge = new THREE2.Mesh(rootBulgeGeo, skullBoneMat);
        rootBulge.position.set(sp.x, 0.114, toothZ - 4e-3);
        headGroup.add(rootBulge);
        const toothGeo = sp.isCanine ? trackGeo(new THREE2.ConeGeometry(sp.r, sp.h, seg(10, 8)), 2e-3) : trackGeo(
          new THREE2.CylinderGeometry(sp.r * 0.68, sp.r * 0.94, sp.h, seg(8, 6)),
          2e-3
        );
        toothGeo.scale(1, 1, 0.78);
        const toothMesh = new THREE2.Mesh(toothGeo, toothEnamelMat);
        toothMesh.position.set(sp.x, 0.082 - (sp.isCanine ? 8e-3 : 0), toothZ);
        toothMesh.rotation.x = sp.isCanine ? Math.PI - 0.08 : 0.06;
        toothMesh.rotation.z = sp.rotZ;
        toothMesh.castShadow = true;
        headGroup.add(toothMesh);
      }
      const jawLen = 0.22 + snoutLen * 0.14;
      const jawCurve = new THREE2.CatmullRomCurve3([
        new THREE2.Vector3(-0.142, 0.055, 0),
        new THREE2.Vector3(-0.122, -0.052, jawLen * 0.44),
        new THREE2.Vector3(0, -0.068, jawLen * 0.96),
        new THREE2.Vector3(0.122, -0.052, jawLen * 0.44),
        new THREE2.Vector3(0.142, 0.055, 0)
      ]);
      const mandibleGeo = trackGeo(
        new THREE2.TubeGeometry(jawCurve, seg(20, 14), 0.032, seg(10, 8), false),
        0.01
      );
      mandibleGeo.scale(1, 1.15, 1);
      const mandibleMesh = new THREE2.Mesh(mandibleGeo, skullBoneMat);
      mandibleMesh.castShadow = true;
      jawGroup.add(mandibleMesh);
      const chinBoneGeo = trackGeo(new THREE2.SphereGeometry(0.044, seg(10, 8), seg(8, 6)), 0.01);
      chinBoneGeo.scale(1.15, 0.88, 1.12);
      const chinBoneMesh = new THREE2.Mesh(chinBoneGeo, skullBoneMat);
      chinBoneMesh.position.set(0, -0.078, jawLen * 0.96);
      jawGroup.add(chinBoneMesh);
      const skullLowerTeeth = [
        { x: -0.102, r: 0.016, h: 0.062, isCanine: false, rotZ: 0.1 },
        { x: -0.074, r: 0.02, h: 0.086, isCanine: true, rotZ: 0.06 },
        // Left lower canine fang
        { x: -0.045, r: 0.016, h: 0.064, isCanine: false, rotZ: 0.03 },
        { x: -0.016, r: 0.016, h: 0.066, isCanine: false, rotZ: 0.01 },
        { x: 0.016, r: 0.016, h: 0.066, isCanine: false, rotZ: -0.01 },
        { x: 0.045, r: 0.016, h: 0.064, isCanine: false, rotZ: -0.03 },
        { x: 0.074, r: 0.02, h: 0.086, isCanine: true, rotZ: -0.06 },
        // Right lower canine fang
        { x: 0.102, r: 0.016, h: 0.062, isCanine: false, rotZ: -0.1 }
      ];
      for (let t = 0; t < skullLowerTeeth.length; t++) {
        const sp = skullLowerTeeth[t];
        const zCurve = Math.cos(sp.x / 0.122 * (Math.PI * 0.44)) * (jawLen * 0.88);
        const toothGeo = sp.isCanine ? trackGeo(new THREE2.ConeGeometry(sp.r, sp.h, seg(10, 8)), 2e-3) : trackGeo(
          new THREE2.CylinderGeometry(sp.r * 0.68, sp.r * 0.94, sp.h, seg(8, 6)),
          2e-3
        );
        toothGeo.scale(1, 1, 0.78);
        const toothMesh = new THREE2.Mesh(toothGeo, toothEnamelMat);
        toothMesh.position.set(sp.x, -0.02 + (sp.isCanine ? 0.01 : 0), 0.022 + zCurve);
        toothMesh.rotation.x = 0.08;
        toothMesh.rotation.z = sp.rotZ;
        toothMesh.castShadow = true;
        jawGroup.add(toothMesh);
      }
      const hasRoyalSkullCrown = config.helm === "crowned_skull" && config.archetype !== "ruins_skeleton_pawn" && config.archetype !== "cursed_skeleton_berserker" || config.archetype === "bone_crown_lich_king" || config.archetype === "arch_lich" || config.archetype === "wraith_soul_reaper" || config.archetype === "death_knight_colossus" || config.archetype === "plague_hierophant_mummy" || config.archetype === "ash_bone_naga_siren" || config.archetype === "necrotic_archdragon" || config.archetype === "cursed_diadem_valkyrie_skeleton";
      if (hasRoyalSkullCrown) {
        const crownRingGeo = trackGeo(
          new THREE2.TorusGeometry(0.218, 0.028, seg(10, 8), seg(24, 16)),
          8e-3
        );
        crownRingGeo.rotateX(Math.PI / 2 - 0.16);
        const crownRingMesh = new THREE2.Mesh(crownRingGeo, secondaryTrimMat);
        crownRingMesh.position.set(0, 0.332, 0.038);
        crownRingMesh.castShadow = true;
        headGroup.add(crownRingMesh);
        const upperFiligreeGeo = trackGeo(
          new THREE2.TorusGeometry(0.224, 0.016, seg(8, 6), seg(22, 14)),
          6e-3
        );
        upperFiligreeGeo.rotateX(Math.PI / 2 - 0.16);
        const upperFiligreeMesh = new THREE2.Mesh(upperFiligreeGeo, ivoryFangMat);
        upperFiligreeMesh.position.set(0, 0.365, 0.036);
        headGroup.add(upperFiligreeMesh);
        const spikeCount = 7;
        for (let s = 0; s < spikeCount; s++) {
          const ang = (s / (spikeCount - 1) - 0.5) * Math.PI * 1.12;
          const isCenter = s === 3;
          const isMajor = s === 1 || s === 5;
          const spikeH = isCenter ? 0.24 : isMajor ? 0.185 : 0.135;
          const spikeR = isCenter ? 0.034 : isMajor ? 0.028 : 0.022;
          const spikeGeo = trackGeo(new THREE2.ConeGeometry(spikeR, spikeH, 5), 4e-3);
          const spikeMesh = new THREE2.Mesh(
            spikeGeo,
            s % 2 === 0 ? ivoryFangMat : secondaryTrimMat
          );
          spikeMesh.position.set(
            Math.sin(ang) * 0.215,
            0.358 + spikeH * 0.44,
            0.038 + Math.cos(ang) * 0.215
          );
          spikeMesh.rotation.x = Math.cos(ang) * 0.18;
          spikeMesh.rotation.z = -Math.sin(ang) * 0.22;
          spikeMesh.castShadow = true;
          headGroup.add(spikeMesh);
        }
        const hasImperialArches = config.archetype === "skeleton_emperor_goldcrown" || config.archetype === "ossuary_king_leoric" || config.archetype === "crowned_catacomb_pharaoh" || config.archetype === "skeletal_archbishop_pontiff" || config.archetype === "glacial_crown_revenant_king" || config.archetype === "star_crown_astral_lich" || config.archetype === "abyssal_crown_ossuary_titan" || config.archetype === "bone_crown_lich_king" || config.archetype === "elite_pirate_captain_skeleton" || config.archetype === "elite_bone_scorpion_construct" || config.archetype === "elite_plague_doctor_lich_skeleton" || config.archetype === "elite_caged_rib_jailer_skeleton" || config.archetype === "elite_spiked_wheel_bone_martyr" || config.archetype === "elite_horned_minotaur_skeleton" || config.archetype === "elite_four_armed_bone_reaver" || config.archetype === "elite_twin_skull_ettin_skeleton" || config.archetype === "elite_mammoth_ossuary_behemoth";
        if (hasImperialArches) {
          for (let a = 0; a < 2; a++) {
            const archGeo = trackGeo(
              new THREE2.TorusGeometry(0.21, 0.018, seg(8, 6), seg(18, 12), Math.PI),
              5e-3
            );
            const archMesh = new THREE2.Mesh(archGeo, secondaryTrimMat);
            archMesh.position.set(0, 0.345, 0.035);
            archMesh.rotation.y = a === 0 ? 0 : Math.PI * 0.5;
            headGroup.add(archMesh);
          }
          const apexOrbGeo = trackGeo(new THREE2.OctahedronGeometry(0.052, 1), 0);
          const apexOrb = new THREE2.Mesh(apexOrbGeo, crystalCoreMat);
          apexOrb.position.set(0, 0.585, 0.035);
          headGroup.add(apexOrb);
        }
        if (config.helm === "valkyrie_crest" || config.archetype === "cursed_diadem_valkyrie_skeleton") {
          for (const side of [-1, 1]) {
            for (let w = 0; w < 3; w++) {
              const wingBladeGeo = trackGeo(
                new THREE2.ConeGeometry(0.036 - w * 5e-3, 0.28 - w * 0.04, 4),
                4e-3
              );
              wingBladeGeo.scale(0.38, 1, 1.35);
              const wingBlade = new THREE2.Mesh(
                wingBladeGeo,
                w === 0 ? secondaryTrimMat : ivoryFangMat
              );
              wingBlade.position.set(
                side * (0.215 + w * 0.022),
                0.34 + w * 0.055,
                0.02 - w * 0.06
              );
              wingBlade.rotation.x = -0.72 - w * 0.14;
              wingBlade.rotation.z = -side * (0.35 + w * 0.1);
              headGroup.add(wingBlade);
            }
          }
        }
        const crownGemGeo = trackGeo(new THREE2.OctahedronGeometry(0.046, 1), 0);
        const crownGem = new THREE2.Mesh(crownGemGeo, crystalCoreMat);
        crownGem.position.set(0, 0.345, 0.258);
        headGroup.add(crownGem);
        for (const side of [-1, 1]) {
          const sideGemGeo = trackGeo(new THREE2.OctahedronGeometry(0.028, 0), 0);
          const sideGem = new THREE2.Mesh(sideGemGeo, emissiveRuneMat);
          sideGem.position.set(side * 0.165, 0.345, 0.19);
          headGroup.add(sideGem);
        }
      }
    } else {
      const isVampireOrPaleUndead = config.archetype === "vampire_lord" || config.archetype === "crimson_nosferatu_elder" || config.archetype === "grave_fallen_valkyrie" || config.archetype === "banshee_frozen_throne";
      const isHumanFleshTone = config.archetype === "outlaw_bandit_cutthroat" || config.archetype === "solar_valkyrie" || config.archetype === "valkyrie_of_the_gale" || config.archetype === "drake_berserker" || config.archetype === "abyssal_knight" || config.archetype === "astral_centaur" || config.archetype === "aurora_ice_centaur";
      const isFangedHumanoid = isVampireOrPaleUndead || config.archetype === "samurai_oni" || config.archetype === "balrog_archdemon" || config.archetype === "lesser_fire_imp" || config.archetype === "drake_berserker" || config.archetype === "gorgon_medusa" || config.archetype === "triton_abyss_warden" || config.helm === "arachnid_mandibles" || config.helm === "drake_fang_helm";
      const humanoidFaceMat = isVampireOrPaleUndead ? trackMat(
        new THREE2.MeshStandardMaterial({
          name: "Mat_HumanoidPaleVampireSkin",
          color: new THREE2.Color("#d8d4dc").lerp(new THREE2.Color(matCfg.primaryColor), 0.22),
          vertexColors: true,
          roughness: 0.48,
          metalness: 0.08,
          bumpMap: textures.armorBumpMap,
          bumpScale: 0.018,
          wireframe
        })
      ) : isHumanFleshTone ? trackMat(
        new THREE2.MeshStandardMaterial({
          name: "Mat_HumanoidWarriorSkin",
          color: new THREE2.Color("#c69076").lerp(new THREE2.Color(matCfg.primaryColor), 0.28),
          vertexColors: true,
          roughness: 0.55,
          metalness: 0.08,
          bumpMap: textures.armorBumpMap,
          bumpScale: 0.018,
          wireframe
        })
      ) : primaryArmorMat;
      const rabidScleraMat = trackMat(
        new THREE2.MeshStandardMaterial({
          name: "Mat_HumanoidRabidSclera",
          color: new THREE2.Color("#fef08a"),
          emissive: new THREE2.Color(matCfg.emissiveColor),
          emissiveIntensity: 1.6,
          roughness: 0.14,
          metalness: 0.05,
          wireframe
        })
      );
      const rabidIrisMat = trackMat(
        new THREE2.MeshStandardMaterial({
          name: "Mat_HumanoidRabidIris",
          color: new THREE2.Color(matCfg.emissiveColor),
          emissive: new THREE2.Color(matCfg.emissiveColor),
          emissiveIntensity: 3.4,
          roughness: 0.1,
          metalness: 0.08,
          wireframe
        })
      );
      const darkPupilMat = trackMat(
        new THREE2.MeshStandardMaterial({
          name: "Mat_HumanoidDarkPupil",
          color: new THREE2.Color("#080506"),
          roughness: 0.1,
          metalness: 0.18,
          wireframe
        })
      );
      const craniumGeo = new THREE2.SphereGeometry(0.242, seg(24, 18), seg(20, 14));
      const cPos = craniumGeo.getAttribute("position");
      for (let i = 0; i < cPos.count; i++) {
        let x = cPos.getX(i);
        let y = cPos.getY(i);
        let z = cPos.getZ(i);
        const ax = Math.abs(x);
        if (y > -0.04 && y < 0.12 && ax > 0.15 && z < 0.08) {
          x *= 0.91;
        }
        if (y > -0.07 && y < 0.05 && z > 0.03 && ax > 0.085) {
          const cheekBoost = Math.exp(-Math.pow((y + 0.01) / 0.055, 2));
          x *= 1 + 0.2 * cheekBoost;
          z += 0.038 * cheekBoost;
        }
        if (y > 0 && y < 0.105 && z > 0.105 && ax > 0.038 && ax < 0.155) {
          z -= 0.042;
        }
        if (y >= 0.072 && y < 0.155 && z > 0.085) {
          const browV = 1 - Math.min(1, ax / 0.18) * 0.34;
          z += 0.05 * browV;
          y -= (1 - Math.min(1, ax / 0.13)) * 0.024;
        }
        if (y < -0.055 && ax < 0.12 && z > 0.05) {
          z += 0.045;
        }
        cPos.setXYZ(i, x, y, z);
      }
      craniumGeo.scale(0.98, 1.02, 1.12);
      trackGeo(craniumGeo, 0.018, 7.5, 0.28);
      const craniumMesh = new THREE2.Mesh(craniumGeo, humanoidFaceMat);
      craniumMesh.position.set(0, 0.195, 0.035);
      craniumMesh.castShadow = true;
      headGroup.add(craniumMesh);
      const hasPointedElvenOrDemonEars = isVampireOrPaleUndead || config.archetype === "balrog_archdemon" || config.archetype === "lesser_fire_imp" || config.archetype === "samurai_oni" || config.archetype === "tidal_naiad_queen" || config.archetype === "triton_abyss_warden" || config.archetype === "gorgon_medusa" || config.archetype === "briar_wood_spriggan";
      for (const side of [-1, 1]) {
        const browCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(side * 0.018, 0.236, 0.242),
          new THREE2.Vector3(side * 0.102, 0.266, 0.232),
          new THREE2.Vector3(side * 0.182, 0.252, 0.158)
        ]);
        const browGeo = trackGeo(
          new THREE2.TubeGeometry(browCurve, seg(12, 8), 0.036, seg(10, 8), false),
          0.014
        );
        const browMesh = new THREE2.Mesh(browGeo, humanoidFaceMat);
        headGroup.add(browMesh);
        const cheekGeo = trackGeo(new THREE2.SphereGeometry(0.078, seg(12, 8), seg(10, 8)), 0.016);
        cheekGeo.scale(1.12, 0.74, 1.22);
        const cheekMesh = new THREE2.Mesh(cheekGeo, humanoidFaceMat);
        cheekMesh.position.set(side * 0.142, 0.15, 0.158);
        cheekMesh.rotation.y = side * 0.26;
        cheekMesh.rotation.z = -side * 0.16;
        headGroup.add(cheekMesh);
        const earLen = hasPointedElvenOrDemonEars ? 0.22 : 0.11;
        const earGeo = trackGeo(
          new THREE2.ConeGeometry(0.052, earLen, seg(10, 8)),
          0.012
        );
        earGeo.scale(0.48, 1, 1.25);
        const earMesh = new THREE2.Mesh(earGeo, humanoidFaceMat);
        earMesh.position.set(
          side * (hasPointedElvenOrDemonEars ? 0.235 : 0.205),
          0.195 + (hasPointedElvenOrDemonEars ? 0.025 : 0),
          0.01
        );
        earMesh.rotation.z = -side * (hasPointedElvenOrDemonEars ? 1.05 : 1.35);
        earMesh.rotation.x = -0.25;
        headGroup.add(earMesh);
      }
      const noseBridgeLen = 0.12 + snoutLen * 0.22;
      const noseCurve = new THREE2.CatmullRomCurve3([
        new THREE2.Vector3(0, 0.232, 0.185),
        new THREE2.Vector3(0, 0.195, 0.245 + noseBridgeLen * 0.48),
        new THREE2.Vector3(0, 0.158, 0.262 + noseBridgeLen * 0.85)
      ]);
      const noseGeo = trackGeo(
        new THREE2.TubeGeometry(noseCurve, seg(12, 8), 0.036, seg(10, 8), false),
        0.014
      );
      noseGeo.scale(0.82, 1.04, 1);
      const noseMesh = new THREE2.Mesh(noseGeo, humanoidFaceMat);
      noseMesh.castShadow = true;
      headGroup.add(noseMesh);
      const noseTipGeo = trackGeo(new THREE2.SphereGeometry(0.036, seg(10, 8), seg(8, 6)), 0.012);
      noseTipGeo.scale(0.96, 0.84, 1.16);
      const noseTipMesh = new THREE2.Mesh(noseTipGeo, humanoidFaceMat);
      noseTipMesh.position.set(0, 0.154, 0.265 + noseBridgeLen * 0.86);
      headGroup.add(noseTipMesh);
      for (const side of [-1, 1]) {
        const nostrilAlaGeo = trackGeo(new THREE2.SphereGeometry(0.024, 8, 6), 8e-3);
        nostrilAlaGeo.scale(1.1, 0.78, 1.15);
        const nostrilAla = new THREE2.Mesh(nostrilAlaGeo, humanoidFaceMat);
        nostrilAla.position.set(side * 0.034, 0.148, 0.248 + noseBridgeLen * 0.68);
        headGroup.add(nostrilAla);
      }
      for (const side of [-1, 1]) {
        const eyeX = side * 0.095;
        const eyeY = 0.214;
        const eyeZ = 0.212;
        const orbitRimGeo = trackGeo(
          new THREE2.TorusGeometry(0.048, 0.013, seg(8, 6), seg(14, 10)),
          6e-3
        );
        const orbitRim = new THREE2.Mesh(orbitRimGeo, underbodyMat);
        orbitRim.position.set(eyeX, eyeY, eyeZ - 6e-3);
        orbitRim.rotation.y = side * 0.22;
        orbitRim.rotation.z = -side * 0.2;
        headGroup.add(orbitRim);
        const scleraGeo = trackGeo(new THREE2.SphereGeometry(0.045, seg(14, 10), seg(12, 8)), 4e-3);
        scleraGeo.scale(1.06, 0.92, 1.08);
        const scleraMesh = new THREE2.Mesh(scleraGeo, rabidScleraMat);
        scleraMesh.position.set(eyeX, eyeY, eyeZ);
        scleraMesh.rotation.y = side * 0.2;
        headGroup.add(scleraMesh);
        const irisGeo = trackGeo(new THREE2.SphereGeometry(0.03, seg(12, 8), seg(10, 8)), 2e-3);
        irisGeo.scale(1, 0.94, 0.65);
        const irisMesh = new THREE2.Mesh(irisGeo, rabidIrisMat);
        irisMesh.position.set(eyeX + side * 5e-3, eyeY, eyeZ + 0.032);
        irisMesh.rotation.y = side * 0.2;
        headGroup.add(irisMesh);
        const pupilGeo = trackGeo(new THREE2.SphereGeometry(0.017, 10, 8), 0);
        pupilGeo.scale(isFangedHumanoid ? 0.38 : 0.68, isFangedHumanoid ? 1.22 : 0.95, 0.55);
        const pupilMesh = new THREE2.Mesh(pupilGeo, darkPupilMat);
        pupilMesh.position.set(eyeX + side * 7e-3, eyeY, eyeZ + 0.045);
        pupilMesh.rotation.y = side * 0.2;
        headGroup.add(pupilMesh);
      }
      const upperMawGeo = trackGeo(
        new THREE2.CylinderGeometry(0.132, 0.148, 0.068, seg(16, 12), 2),
        0.012
      );
      upperMawGeo.scale(1.08, 1, 0.92);
      const upperMawMesh = new THREE2.Mesh(upperMawGeo, humanoidFaceMat);
      upperMawMesh.position.set(0, 0.115, 0.152);
      headGroup.add(upperMawMesh);
      const mouthCavityGeo = trackGeo(new THREE2.SphereGeometry(0.125, seg(12, 8), seg(10, 8)), 6e-3);
      mouthCavityGeo.scale(1.08, 0.64, 0.94);
      const mouthCavityMesh = new THREE2.Mesh(mouthCavityGeo, darkPupilMat);
      mouthCavityMesh.position.set(0, 0.094, 0.152);
      headGroup.add(mouthCavityMesh);
      const fangMult = isFangedHumanoid ? 1.32 : 1;
      const upperTeethSpecs = [
        { x: -0.108, r: 0.022 * fangMult, h: 0.095 * fangMult, isFang: true, rotZ: -0.14 },
        // Left upper canine fang
        { x: -0.072, r: 0.018, h: 0.072, isFang: false, rotZ: -0.06 },
        { x: -0.036, r: 0.019, h: 0.076, isFang: false, rotZ: -0.03 },
        { x: 0, r: 0.019, h: 0.076, isFang: false, rotZ: 0 },
        { x: 0.036, r: 0.019, h: 0.076, isFang: false, rotZ: 0.03 },
        { x: 0.072, r: 0.018, h: 0.072, isFang: false, rotZ: 0.06 },
        { x: 0.108, r: 0.022 * fangMult, h: 0.095 * fangMult, isFang: true, rotZ: 0.14 }
        // Right upper canine fang
      ];
      for (let t = 0; t < upperTeethSpecs.length; t++) {
        const sp = upperTeethSpecs[t];
        const zCurve = Math.cos(sp.x / 0.132 * (Math.PI * 0.42)) * 0.128;
        const toothGeo = trackGeo(new THREE2.ConeGeometry(sp.r, sp.h, seg(10, 8)), 4e-3);
        const toothMesh = new THREE2.Mesh(toothGeo, ivoryFangMat);
        toothMesh.position.set(sp.x, 0.082 - (sp.isFang ? 8e-3 : 0), 0.132 + zCurve);
        toothMesh.rotation.x = Math.PI - 0.2;
        toothMesh.rotation.z = sp.rotZ;
        headGroup.add(toothMesh);
      }
      const jawLen = 0.215 + snoutLen * 0.18;
      const jawPts = [
        new THREE2.Vector2(0.01, -0.04),
        new THREE2.Vector2(0.152, 0),
        new THREE2.Vector2(0.144, jawLen * 0.55),
        new THREE2.Vector2(0.112, jawLen * 0.92),
        new THREE2.Vector2(0.01, jawLen + 0.025)
      ];
      const lowerJawGeo = trackGeo(new THREE2.LatheGeometry(jawPts, seg(18, 12)), 0.016);
      lowerJawGeo.rotateX(Math.PI / 2);
      lowerJawGeo.scale(1.02, 0.56, 1);
      const lowerJawMesh = new THREE2.Mesh(lowerJawGeo, humanoidFaceMat);
      lowerJawMesh.position.set(0, -0.032, 0);
      lowerJawMesh.castShadow = true;
      jawGroup.add(lowerJawMesh);
      const chinGeo = trackGeo(new THREE2.SphereGeometry(0.058, seg(12, 8), seg(10, 8)), 0.014);
      chinGeo.scale(1.12, 0.86, 1.2);
      const chinMesh = new THREE2.Mesh(chinGeo, humanoidFaceMat);
      chinMesh.position.set(0, -0.05, jawLen * 0.92);
      jawGroup.add(chinMesh);
      const lowerTeethSpecs = [
        { x: -0.114, r: 0.024 * fangMult, h: 0.11 * fangMult, rotZ: 0.18, rotX: 0.26 },
        // Left lower canine tusk
        { x: -0.078, r: 0.019, h: 0.078, rotZ: 0.09, rotX: 0.22 },
        { x: -0.044, r: 0.018, h: 0.074, rotZ: 0.04, rotX: 0.24 },
        { x: -0.014, r: 0.018, h: 0.074, rotZ: 0.01, rotX: 0.25 },
        { x: 0.014, r: 0.018, h: 0.074, rotZ: -0.01, rotX: 0.25 },
        { x: 0.044, r: 0.018, h: 0.074, rotZ: -0.04, rotX: 0.24 },
        { x: 0.078, r: 0.019, h: 0.078, rotZ: -0.09, rotX: 0.22 },
        { x: 0.114, r: 0.024 * fangMult, h: 0.11 * fangMult, rotZ: -0.18, rotX: 0.26 }
        // Right lower canine tusk
      ];
      for (let t = 0; t < lowerTeethSpecs.length; t++) {
        const sp = lowerTeethSpecs[t];
        const zCurve = Math.cos(sp.x / 0.135 * (Math.PI * 0.42)) * (jawLen * 0.84);
        const fangGeo = trackGeo(new THREE2.ConeGeometry(sp.r, sp.h, seg(10, 8)), 4e-3);
        const fangMesh = new THREE2.Mesh(fangGeo, ivoryFangMat);
        fangMesh.position.set(sp.x, 0.016 + (Math.abs(sp.x) > 0.095 ? 0.015 : 0), 0.022 + zCurve);
        fangMesh.rotation.x = sp.rotX;
        fangMesh.rotation.z = sp.rotZ;
        jawGroup.add(fangMesh);
      }
      if (config.helm === "valkyrie_crest") {
        const tiaraGeo = trackGeo(
          new THREE2.TorusGeometry(0.215, 0.024, seg(10, 8), seg(20, 14), Math.PI * 1.15),
          8e-3
        );
        tiaraGeo.rotateX(Math.PI / 2 - 0.15);
        tiaraGeo.rotateZ(-Math.PI * 0.075);
        const tiaraMesh = new THREE2.Mesh(tiaraGeo, secondaryTrimMat);
        tiaraMesh.position.set(0, 0.305, 0.04);
        headGroup.add(tiaraMesh);
        const foreheadGemGeo = trackGeo(new THREE2.OctahedronGeometry(0.044, 1), 0);
        const foreheadGem = new THREE2.Mesh(foreheadGemGeo, crystalCoreMat);
        foreheadGem.position.set(0, 0.315, 0.255);
        headGroup.add(foreheadGem);
        for (const side of [-1, 1]) {
          for (let w = 0; w < 3; w++) {
            const wingBladeGeo = trackGeo(
              new THREE2.ConeGeometry(0.036 - w * 5e-3, 0.28 - w * 0.04, 4),
              4e-3
            );
            wingBladeGeo.scale(0.38, 1, 1.35);
            const wingBlade = new THREE2.Mesh(
              wingBladeGeo,
              w === 0 ? secondaryTrimMat : bladeAlloyMat
            );
            wingBlade.position.set(
              side * (0.21 + w * 0.02),
              0.32 + w * 0.055,
              0.02 - w * 0.06
            );
            wingBlade.rotation.x = -0.72 - w * 0.14;
            wingBlade.rotation.z = -side * (0.35 + w * 0.1);
            headGroup.add(wingBlade);
          }
        }
      } else if (config.helm === "arachnid_mandibles") {
        const carapaceDomeGeo = trackGeo(
          new THREE2.SphereGeometry(0.248, seg(16, 12), seg(12, 8), 0, Math.PI * 2, 0, Math.PI * 0.44),
          0.014
        );
        carapaceDomeGeo.scale(1.04, 0.95, 1.14);
        const carapaceDome = new THREE2.Mesh(carapaceDomeGeo, secondaryTrimMat);
        carapaceDome.position.set(0, 0.205, 0.025);
        carapaceDome.rotation.x = -0.25;
        headGroup.add(carapaceDome);
        for (const side of [-1, 1]) {
          for (let e = 0; e < 2; e++) {
            const ocellusGeo = trackGeo(new THREE2.SphereGeometry(0.022 - e * 4e-3, 8, 6), 0);
            const ocellusMesh = new THREE2.Mesh(ocellusGeo, rabidIrisMat);
            ocellusMesh.position.set(
              side * (0.065 + e * 0.058),
              0.285 + e * 0.015,
              0.225 - e * 0.025
            );
            headGroup.add(ocellusMesh);
          }
          const pincerCurve = new THREE2.CatmullRomCurve3([
            new THREE2.Vector3(side * 0.155, 0.115, 0.12),
            new THREE2.Vector3(side * 0.205, 0.085, 0.24),
            new THREE2.Vector3(side * 0.095, 0.055, 0.34)
          ]);
          const pincerGeo = trackGeo(
            new THREE2.TubeGeometry(pincerCurve, seg(12, 8), 0.034, seg(10, 8), false),
            0.01
          );
          const pincerMesh = new THREE2.Mesh(pincerGeo, secondaryTrimMat);
          headGroup.add(pincerMesh);
          const pincerTipGeo = trackGeo(new THREE2.ConeGeometry(0.026, 0.1, 6), 4e-3);
          const pincerTip = new THREE2.Mesh(pincerTipGeo, ivoryFangMat);
          pincerTip.position.set(side * 0.075, 0.05, 0.355);
          pincerTip.rotation.z = side * 1.15;
          pincerTip.rotation.x = Math.PI * 0.42;
          headGroup.add(pincerTip);
        }
      } else if (config.helm === "monolith_visor") {
        const monolithCrownGeo = trackGeo(new THREE2.OctahedronGeometry(0.24, 1), 8e-3);
        monolithCrownGeo.scale(1.06, 0.65, 1.08);
        const monolithCrown = new THREE2.Mesh(monolithCrownGeo, secondaryTrimMat);
        monolithCrown.position.set(0, 0.34, 0.02);
        headGroup.add(monolithCrown);
        const runeCoreGeo = trackGeo(new THREE2.OctahedronGeometry(0.048, 1), 0);
        const runeCore = new THREE2.Mesh(runeCoreGeo, crystalCoreMat);
        runeCore.position.set(0, 0.31, 0.25);
        headGroup.add(runeCore);
      } else {
        const openHelmDomeGeo = trackGeo(
          new THREE2.SphereGeometry(0.252, seg(18, 14), seg(12, 10), 0, Math.PI * 2, 0, Math.PI * 0.45),
          0.014
        );
        openHelmDomeGeo.scale(1.04, 1.02, 1.14);
        const openHelmDome = new THREE2.Mesh(openHelmDomeGeo, secondaryTrimMat);
        openHelmDome.position.set(0, 0.21, 0.02);
        openHelmDome.rotation.x = -0.28;
        openHelmDome.castShadow = true;
        headGroup.add(openHelmDome);
        const crestGeo = trackGeo(new THREE2.BoxGeometry(0.042, 0.095, 0.28), 8e-3);
        const crestMesh = new THREE2.Mesh(crestGeo, secondaryTrimMat);
        crestMesh.position.set(0, 0.39, 0.02);
        crestMesh.rotation.x = -0.15;
        headGroup.add(crestMesh);
        for (const side of [-1, 1]) {
          const cheekGuardCurve = new THREE2.CatmullRomCurve3([
            new THREE2.Vector3(side * 0.21, 0.24, 0.04),
            new THREE2.Vector3(side * 0.205, 0.14, 0.09),
            new THREE2.Vector3(side * 0.165, 0.06, 0.15)
          ]);
          const cheekGuardGeo = trackGeo(
            new THREE2.TubeGeometry(cheekGuardCurve, seg(10, 8), 0.028, seg(8, 6), false),
            8e-3
          );
          cheekGuardGeo.scale(0.65, 1, 1.35);
          const cheekGuard = new THREE2.Mesh(cheekGuardGeo, secondaryTrimMat);
          headGroup.add(cheekGuard);
        }
      }
    }
    const skipDefaultHorns = (config.archetype === "ruins_skeleton_pawn" || config.archetype === "outlaw_bandit_cutthroat" || config.helm === "valkyrie_crest") && m.hornLength <= 1.3;
    if (m.hornLength > 0.05 && !isBeholder && !skipDefaultHorns) {
      const isLupineEars = config.helm === "lupine_maw";
      const isGoblinEars = config.helm === "goblin_feral_face" || config.archetype === "forest_goblin_scavenger";
      const isStagAntlers = config.archetype === "furious_antler_stag" || config.archetype === "hailstorm_stag_spirit" || config.archetype === "briar_wood_spriggan" || config.archetype === "treant_ancient";
      for (const side of [-1, 1]) {
        const hLen = 0.44 * m.hornLength;
        const hCurve = m.hornCurve;
        if (isGoblinEars) {
          const earSpan = 0.36 + hLen * 0.45;
          const earCurve = new THREE2.CatmullRomCurve3([
            new THREE2.Vector3(side * 0.19, 0.2, 0.04),
            new THREE2.Vector3(side * (0.28 + earSpan * 0.48), 0.23, -0.03),
            new THREE2.Vector3(side * (0.36 + earSpan * 0.95), 0.27 + hLen * 0.12, -0.12)
          ]);
          const earGeo = trackGeo(
            new THREE2.ConeGeometry(0.078, earSpan, seg(14, 10)),
            0.016
          );
          earGeo.scale(0.52, 1, 1.38);
          const earMesh = new THREE2.Mesh(earGeo, primaryArmorMat);
          const midEar = earCurve.getPoint(0.45);
          earMesh.position.copy(midEar);
          earMesh.rotation.z = -side * 1.18;
          earMesh.rotation.x = -0.28;
          earMesh.castShadow = true;
          headGroup.add(earMesh);
          const innerEarGeo = trackGeo(
            new THREE2.ConeGeometry(0.046, earSpan * 0.82, seg(10, 8)),
            0.01
          );
          innerEarGeo.scale(0.38, 1, 1.15);
          const innerEar = new THREE2.Mesh(innerEarGeo, underbodyMat);
          innerEar.position.set(side * (0.26 + earSpan * 0.36), 0.215, -5e-3);
          innerEar.rotation.z = -side * 1.18;
          innerEar.rotation.x = -0.28;
          headGroup.add(innerEar);
          const earringGeo = trackGeo(new THREE2.TorusGeometry(0.036, 9e-3, 6, 12), 2e-3);
          const earringMesh = new THREE2.Mesh(earringGeo, secondaryTrimMat);
          earringMesh.position.set(side * (0.27 + earSpan * 0.35), 0.165, -0.02);
          earringMesh.rotation.y = side * 0.4;
          headGroup.add(earringMesh);
        } else if (isLupineEars) {
          const earGeo = trackGeo(
            new THREE2.ConeGeometry(0.082, 0.26 + hLen * 0.4, seg(12, 8))
          );
          earGeo.scale(0.65, 1, 1.25);
          const earMesh = new THREE2.Mesh(earGeo, primaryArmorMat);
          earMesh.position.set(side * 0.15, 0.31 + hLen * 0.08, -0.02);
          earMesh.rotation.z = -side * 0.32;
          earMesh.rotation.x = -0.22;
          headGroup.add(earMesh);
        } else {
          const isSweepBack = config.helm === "draconic_snout" || config.helm === "avian_phoenix_beak";
          const socketRingGeo = trackGeo(
            new THREE2.SphereGeometry(0.068, seg(10, 8), seg(8, 6))
          );
          const socketRing = new THREE2.Mesh(socketRingGeo, secondaryTrimMat);
          socketRing.position.set(side * 0.14, 0.26, 0.02);
          headGroup.add(socketRing);
          const hornPath = new THREE2.CatmullRomCurve3([
            new THREE2.Vector3(side * 0.12, 0.24, 0.02),
            new THREE2.Vector3(
              side * (0.32 + hLen * 0.45),
              0.35 + hLen * 0.35,
              isSweepBack ? -0.25 * hCurve : 0.08 * hCurve
            ),
            new THREE2.Vector3(
              side * (0.25 + hLen * 0.55),
              0.5 + hLen * 0.85,
              isSweepBack ? -0.56 * hCurve : 0.32 * hCurve
            )
          ]);
          const hornGeo = trackGeo(
            new THREE2.TubeGeometry(hornPath, seg(14, 10), 0.048, seg(10, 8), false)
          );
          const hornMat = isDragon || config.raceCategory === "mythological" || isStagAntlers ? ivoryFangMat : secondaryTrimMat;
          const hornMesh = new THREE2.Mesh(hornGeo, hornMat);
          headGroup.add(hornMesh);
          if (isStagAntlers) {
            for (let t = 1; t <= 2; t++) {
              const branchGeo = trackGeo(new THREE2.ConeGeometry(0.034, 0.26, seg(10, 8)));
              const branchMesh = new THREE2.Mesh(branchGeo, ivoryFangMat);
              branchMesh.position.set(
                side * (0.26 + t * 0.11),
                0.46 + t * 0.16,
                0.06 + t * 0.07
              );
              branchMesh.rotation.z = -side * 0.42;
              branchMesh.rotation.x = 0.42;
              headGroup.add(branchMesh);
            }
          }
        }
      }
    }
    const extraHeads = [];
    const headCount = Math.max(1, Math.min(3, Math.round(m.headCount || 1)));
    if (headCount > 1 && !isBeholder) {
      const sides = headCount === 2 ? [-1] : [-1, 1];
      for (const side of sides) {
        const sideNeck = neckGroup.clone(true);
        sideNeck.name = side === 1 ? "Neck_Head_Left" : "Neck_Head_Right";
        sideNeck.traverse((c) => {
          if (c.isBone && c !== sideNeck) {
            c.name = `${c.name}_${side === 1 ? "L" : "R"}`;
          }
        });
        sideNeck.position.x = side * 0.22 * m.torsoBulk;
        sideNeck.rotation.z = -side * 0.28;
        sideNeck.rotation.y = side * 0.22;
        sideNeck.scale.setScalar(0.88);
        torsoGroup.add(sideNeck);
        extraHeads.push(sideNeck);
      }
    }
    const createVolumetricBreathPlumeGeo = (throatRadius, tipRadius, length, radialSegs, heightSegs, isFrostPlume, isInnerCore, wavePhaseOffset = 0) => {
      const g = new THREE2.CylinderGeometry(
        tipRadius,
        throatRadius,
        length,
        radialSegs,
        heightSegs,
        true
      );
      g.rotateX(Math.PI / 2);
      g.translate(0, 0, length * 0.5);
      const pos = g.getAttribute("position");
      const col = new Float32Array(pos.count * 3);
      const cTmp = new THREE2.Color();
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        const zFrac = Math.min(1, Math.max(0, z / Math.max(1e-3, length)));
        const ang = Math.atan2(y, x);
        const billow = 1 + Math.sin(zFrac * 10.5 + ang * 3 + wavePhaseOffset) * 0.14 * zFrac + Math.cos(zFrac * 16 - ang * 2 + wavePhaseOffset * 1.7) * 0.08 * zFrac;
        const thermalLift = isFrostPlume ? -0.05 * zFrac * zFrac : 0.09 * zFrac * zFrac;
        pos.setXYZ(i, x * billow, y * billow + thermalLift, z);
        const rootFade = Math.min(1, zFrac / 0.06);
        const tipFade = Math.pow(Math.max(0, 1 - Math.pow(zFrac, 1.45)), 1.35);
        const intensity = rootFade * tipFade;
        if (isFrostPlume) {
          if (isInnerCore || zFrac < 0.25) {
            cTmp.setRGB(0.92, 0.98, 1);
          } else if (zFrac < 0.65) {
            cTmp.setRGB(0.38, 0.82, 1);
          } else {
            cTmp.setRGB(0.08, 0.45, 0.88);
          }
        } else {
          if (isInnerCore) {
            if (zFrac < 0.35) {
              cTmp.setRGB(1, 0.98, 0.86);
            } else {
              cTmp.setRGB(1, 0.68, 0.16);
            }
          } else if (zFrac < 0.22) {
            cTmp.setRGB(1, 0.95, 0.68);
          } else if (zFrac < 0.56) {
            const u = (zFrac - 0.22) / 0.34;
            cTmp.setRGB(1, 0.82 - u * 0.44, 0.22 - u * 0.19);
          } else {
            const u = (zFrac - 0.56) / 0.44;
            cTmp.setRGB(0.95 - u * 0.55, 0.28 * (1 - u), 0.02 * (1 - u));
          }
        }
        col[i * 3] = cTmp.r * intensity;
        col[i * 3 + 1] = cTmp.g * intensity;
        col[i * 3 + 2] = cTmp.b * intensity;
      }
      g.setAttribute("color", new THREE2.BufferAttribute(col, 3));
      g.computeVertexNormals();
      geometriesToDispose.push(g);
      return g;
    };
    const buildMouthOrChargeEffect = () => {
      if (effectiveWeapon === "frost_breath_maw") {
        const frostOuterMat = trackMat(
          new THREE2.MeshBasicMaterial({
            name: "Mat_MouthFrostPlumeOuter",
            map: textures.frostBreathMap,
            vertexColors: true,
            transparent: true,
            opacity: 0.92,
            blending: THREE2.AdditiveBlending,
            side: THREE2.DoubleSide,
            depthWrite: false,
            wireframe
          })
        );
        const frostCoreMat = trackMat(
          new THREE2.MeshBasicMaterial({
            name: "Mat_MouthFrostPlumeCore",
            vertexColors: true,
            transparent: true,
            opacity: 0.95,
            blending: THREE2.AdditiveBlending,
            side: THREE2.DoubleSide,
            depthWrite: false,
            wireframe
          })
        );
        const iceCrystalMat = trackMat(
          new THREE2.MeshPhysicalMaterial({
            name: "Mat_MouthIceCrystals",
            color: new THREE2.Color("#e0f2fe"),
            emissive: new THREE2.Color("#38bdf8"),
            emissiveIntensity: 2.2,
            roughness: 0.08,
            metalness: 0.1,
            clearcoat: 1,
            transparent: true,
            opacity: 0.92,
            wireframe
          })
        );
        const outerPlumeGeo = createVolumetricBreathPlumeGeo(
          0.07,
          0.54,
          2.65,
          seg(18, 12),
          14,
          true,
          false,
          0
        );
        const coneRoot = new THREE2.Mesh(outerPlumeGeo, frostOuterMat);
        const midPlumeGeo = createVolumetricBreathPlumeGeo(
          0.05,
          0.34,
          2.35,
          seg(14, 10),
          12,
          true,
          false,
          2.1
        );
        const midPlumeMesh = new THREE2.Mesh(midPlumeGeo, frostOuterMat);
        midPlumeMesh.name = "Breath_SubLayer_Mid";
        coneRoot.add(midPlumeMesh);
        const corePlumeGeo = createVolumetricBreathPlumeGeo(
          0.035,
          0.16,
          1.85,
          seg(12, 8),
          10,
          true,
          true,
          4.2
        );
        const corePlumeMesh = new THREE2.Mesh(corePlumeGeo, frostCoreMat);
        corePlumeMesh.name = "Breath_SubLayer_Core";
        coneRoot.add(corePlumeMesh);
        for (let i = 0; i < 5; i++) {
          const ang = i / 5 * Math.PI * 2;
          const distZ = 0.45 + i * 0.36;
          const rad = 0.06 + i * 0.035;
          const shardGeo = trackGeo(new THREE2.ConeGeometry(0.048, 0.48, 5), 0);
          shardGeo.rotateX(Math.PI / 2);
          const shardMesh = new THREE2.Mesh(shardGeo, iceCrystalMat);
          shardMesh.position.set(Math.cos(ang) * rad, Math.sin(ang) * rad, distZ);
          shardMesh.rotation.z = ang;
          coneRoot.add(shardMesh);
        }
        return coneRoot;
      } else if (effectiveWeapon === "dragon_breath_maw") {
        const fireOuterMat = trackMat(
          new THREE2.MeshBasicMaterial({
            name: "Mat_MouthVolumetricFireOuter",
            map: textures.fireBreathMap,
            vertexColors: true,
            transparent: true,
            opacity: 0.96,
            blending: THREE2.AdditiveBlending,
            side: THREE2.DoubleSide,
            depthWrite: false,
            wireframe
          })
        );
        const fireCoreMat = trackMat(
          new THREE2.MeshBasicMaterial({
            name: "Mat_MouthVolumetricFireCore",
            map: textures.fireBreathMap,
            vertexColors: true,
            transparent: true,
            opacity: 0.98,
            blending: THREE2.AdditiveBlending,
            side: THREE2.DoubleSide,
            depthWrite: false,
            wireframe
          })
        );
        const outerFireGeo = createVolumetricBreathPlumeGeo(
          0.075,
          0.58,
          2.75,
          seg(20, 14),
          16,
          false,
          false,
          0
        );
        const coneRoot = new THREE2.Mesh(outerFireGeo, fireOuterMat);
        const midFireGeo = createVolumetricBreathPlumeGeo(
          0.055,
          0.38,
          2.4,
          seg(16, 12),
          14,
          false,
          false,
          2.35
        );
        const midFireMesh = new THREE2.Mesh(midFireGeo, fireOuterMat);
        midFireMesh.name = "Breath_SubLayer_Mid";
        coneRoot.add(midFireMesh);
        const innerFireGeo = createVolumetricBreathPlumeGeo(
          0.038,
          0.19,
          1.85,
          seg(12, 10),
          12,
          false,
          true,
          4.7
        );
        const innerFireMesh = new THREE2.Mesh(innerFireGeo, fireCoreMat);
        innerFireMesh.name = "Breath_SubLayer_Core";
        coneRoot.add(innerFireMesh);
        for (let p = 0; p < 2; p++) {
          const ribbonGeo = new THREE2.PlaneGeometry(0.56, 2.45, 4, 12);
          ribbonGeo.rotateX(Math.PI / 2);
          ribbonGeo.rotateZ(p === 0 ? Math.PI * 0.25 : -Math.PI * 0.25);
          ribbonGeo.translate(0, 0, 1.22);
          const rPos = ribbonGeo.getAttribute("position");
          const rCol = new Float32Array(rPos.count * 3);
          for (let i = 0; i < rPos.count; i++) {
            const z = rPos.getZ(i);
            const zFrac = Math.min(1, Math.max(0, z / 2.45));
            const x = rPos.getX(i);
            const y = rPos.getY(i);
            const taper = 0.18 + zFrac * 0.88;
            const wave = Math.sin(zFrac * 11 + p * 2.1) * 0.06 * zFrac;
            rPos.setXYZ(i, x * taper + wave, y * taper + 0.08 * zFrac * zFrac, z);
            const fade = Math.min(1, zFrac / 0.08) * Math.pow(Math.max(0, 1 - Math.pow(zFrac, 1.4)), 1.5);
            rCol[i * 3] = 1 * fade;
            rCol[i * 3 + 1] = Math.max(0.15, 0.88 - zFrac * 0.65) * fade;
            rCol[i * 3 + 2] = Math.max(0, 0.42 - zFrac * 0.4) * fade;
          }
          ribbonGeo.setAttribute("color", new THREE2.BufferAttribute(rCol, 3));
          geometriesToDispose.push(ribbonGeo);
          const ribbonMesh = new THREE2.Mesh(ribbonGeo, fireCoreMat);
          ribbonMesh.name = `Breath_Flame_Ribbon_${p}`;
          coneRoot.add(ribbonMesh);
        }
        return coneRoot;
      } else if (effectiveWeapon === "ram_charge") {
        const ramShockMat = trackMat(
          new THREE2.MeshStandardMaterial({
            name: "Mat_RamChargeShockwave",
            color: new THREE2.Color("#fef08a"),
            emissive: new THREE2.Color("#f59e0b"),
            emissiveIntensity: 2.6,
            roughness: 0.15,
            transparent: true,
            opacity: 0.85,
            side: THREE2.DoubleSide,
            depthWrite: false,
            wireframe
          })
        );
        const shockConeGeo = trackGeo(new THREE2.ConeGeometry(0.56, 1.05, seg(16, 10), 1, true), 0);
        shockConeGeo.rotateX(Math.PI / 2);
        shockConeGeo.translate(0, 0, 0.18);
        const coneRoot = new THREE2.Mesh(shockConeGeo, ramShockMat);
        for (let r = 0; r < 2; r++) {
          const ringGeo = trackGeo(
            new THREE2.TorusGeometry(0.32 + r * 0.18, 0.026, 6, seg(16, 12)),
            0
          );
          const ringMesh = new THREE2.Mesh(ringGeo, ramShockMat);
          ringMesh.position.set(0, 0, 0.32 - r * 0.24);
          coneRoot.add(ringMesh);
        }
        return coneRoot;
      } else {
        const biteShockMat = trackMat(
          new THREE2.MeshStandardMaterial({
            name: "Mat_FeralBiteSnap",
            color: new THREE2.Color("#fca5a5"),
            emissive: new THREE2.Color("#ef4444"),
            emissiveIntensity: 2.8,
            roughness: 0.15,
            transparent: true,
            opacity: 0.9,
            side: THREE2.DoubleSide,
            depthWrite: false,
            wireframe
          })
        );
        const ringGeo = trackGeo(
          new THREE2.TorusGeometry(0.3, 0.034, 6, seg(14, 10), Math.PI * 0.88),
          0
        );
        const upperJawArc = new THREE2.Mesh(ringGeo, biteShockMat);
        upperJawArc.rotation.z = Math.PI * 0.06;
        const lowerJawArc = new THREE2.Mesh(ringGeo, biteShockMat);
        lowerJawArc.rotation.z = Math.PI * 1.06;
        upperJawArc.add(lowerJawArc);
        for (const side of [-1, 0, 1]) {
          const fangSpikeGeo = trackGeo(
            new THREE2.ConeGeometry(side === 0 ? 0.028 : 0.04, side === 0 ? 0.14 : 0.21, 4),
            0
          );
          const upperSpike = new THREE2.Mesh(fangSpikeGeo, biteShockMat);
          upperSpike.position.set(side * 0.11, 0.22, 0.08);
          upperSpike.rotation.x = Math.PI;
          upperJawArc.add(upperSpike);
          const lowerSpike = new THREE2.Mesh(fangSpikeGeo, biteShockMat);
          lowerSpike.position.set(side * 0.1, -0.22, 0.08);
          upperJawArc.add(lowerSpike);
        }
        return upperJawArc;
      }
    };
    const breathConeMesh = buildMouthOrChargeEffect();
    breathConeMesh.name = "Elemental_Breath_Cone";
    breathConeMesh.position.set(0, 0.12, 0.24 + snoutLen);
    breathConeMesh.scale.setScalar(1e-4);
    breathConeMesh.visible = true;
    headGroup.add(breathConeMesh);
    const breathLight = new THREE2.PointLight(
      effectiveWeapon === "frost_breath_maw" ? 3718648 : 16738816,
      0,
      6.5,
      1.6
    );
    breathLight.name = "Mouth_Breath_Dynamic_Light";
    breathLight.position.set(0, 0.14, 0.36 + snoutLen);
    headGroup.add(breathLight);
    tagExplodablePart(headGroup, new THREE2.Vector3(0, 0.85, 0.35), {
      name: headCount > 1 ? `Cabezas M\xFAltiples (${headCount}x Hidra/Cerbero)` : "Cr\xE1neo Org\xE1nico, Hocico y Fauces",
      category: "Primary Silhouette",
      vertexCount: 540 * headCount,
      triangleCount: 480 * headCount,
      materialSummary: "Cr\xE1neo continuo + hocico orientado hacia adelante + fauces articuladas",
      socketName: "socket_head"
    });
    explodableParts.push(headGroup);
    const buildShoulder = (isLeft) => {
      const side = isLeft ? 1 : -1;
      const shoulderGroup = makeBone(isLeft ? "Pauldron_L" : "Pauldron_R");
      if (isQuadruped && !isCentaur) {
        shoulderGroup.position.set(
          side * 0.29 * m.torsoBulk * m.shoulderWidth,
          0.18 * m.heightScale,
          0.38
        );
      } else {
        shoulderGroup.position.set(
          side * 0.44 * m.torsoBulk * m.shoulderWidth,
          torsoHeight * 0.78,
          0
        );
      }
      torsoGroup.add(shoulderGroup);
      if (!isBeholder) {
        if (!isUndeadSkeleton && (isOrganicCreature || m.pauldronSize <= 0.45)) {
          const furShoulderGeo = trackGeo(
            new THREE2.SphereGeometry(0.24 * m.torsoBulk, seg(16, 12), seg(12, 10)),
            0.024
          );
          furShoulderGeo.scale(0.94, 1.18, 1.28);
          const furShoulderMesh = new THREE2.Mesh(furShoulderGeo, primaryArmorMat);
          furShoulderMesh.castShadow = true;
          shoulderGroup.add(furShoulderMesh);
          if (furDensity > 0.15 && hairStyle !== "none") {
            const fScale = 0.75 + furDensity * 0.38;
            for (let f = 0; f < 3; f++) {
              const shTuftGeo = trackFurLock(0.072 * m.torsoBulk * fScale, (0.26 - f * 0.03) * fScale, 0.09);
              const shTuft = new THREE2.Mesh(shTuftGeo, hairStrandMat);
              shTuft.position.set(side * 0.1 * m.torsoBulk, 0.08 - f * 0.06, -0.04 * f);
              shTuft.rotation.z = -side * (0.75 + f * 0.14);
              shTuft.rotation.x = -0.52;
              shoulderGroup.add(shTuft);
            }
          }
        } else {
          const pShape = new THREE2.Shape();
          pShape.moveTo(-side * 0.06, 0.22 * m.pauldronSize);
          pShape.lineTo(side * 0.36 * m.pauldronSize, 0.08 * m.pauldronSize);
          pShape.lineTo(side * 0.42 * m.pauldronSize, -0.2 * m.pauldronSize);
          pShape.lineTo(-side * 0.04, -0.14 * m.pauldronSize);
          pShape.closePath();
          const pauldronGeo = trackGeo(
            new THREE2.ExtrudeGeometry(pShape, {
              depth: 0.34 * m.pauldronSize,
              bevelEnabled: true,
              bevelThickness: 0.025,
              bevelSize: 0.02,
              bevelSegments: 2
            })
          );
          pauldronGeo.center();
          const pauldronMesh = new THREE2.Mesh(pauldronGeo, secondaryTrimMat);
          pauldronMesh.castShadow = true;
          shoulderGroup.add(pauldronMesh);
        }
      }
      tagExplodablePart(shoulderGroup, new THREE2.Vector3(side * 0.75, 0.45, 0), {
        name: isLeft ? "Om\xF3plato / Hombrera Izquierda" : "Om\xF3plato / Hombrera Derecha",
        category: "Secondary Read",
        vertexCount: 310,
        triangleCount: 270,
        materialSummary: "Musculatura escapular continua + mechones de pelaje 3D"
      });
      explodableParts.push(shoulderGroup);
      return shoulderGroup;
    };
    const leftShoulderGroup = buildShoulder(true);
    const rightShoulderGroup = buildShoulder(false);
    const hasGraspingHands = !isAnimal && !isBeholder && !isArachnid && (!isQuadruped || isCentaur) && config.archetype !== "leviathan_abyssal" && config.archetype !== "coral_sea_serpent" && config.archetype !== "horned_field_viper" && config.archetype !== "marsh_leech_worm" && config.archetype !== "putrid_bog_hydra" && config.archetype !== "cryo_hydra_trident" && config.archetype !== "abyssal_hydra";
    const isNaturalUnarmed = !hasGraspingHands || effectiveWeapon === "feral_claws_fangs" || effectiveWeapon === "leap_fang_bite" || effectiveWeapon === "ram_charge" || effectiveWeapon === "dragon_breath_maw" || effectiveWeapon === "frost_breath_maw";
    const hasLeftHandItem = hasGraspingHands && (config.offhand === "tower_shield" || config.offhand === "runic_buckler" || config.offhand === "phylactery_orb" || config.offhand === "dual_blade");
    exportableGroup.userData.hasGraspingHands = hasGraspingHands;
    exportableGroup.userData.isNaturalUnarmed = isNaturalUnarmed;
    const buildArm = (isLeft) => {
      const side = isLeft ? 1 : -1;
      const isGrippingHandle = hasGraspingHands && (isLeft ? hasLeftHandItem : !isNaturalUnarmed);
      const armGroup = makeBone(isLeft ? "Arm_Or_Foreleg_L" : "Arm_Or_Foreleg_R");
      if (isQuadruped && !isCentaur) {
        armGroup.position.set(side * 0.27 * m.torsoBulk * m.shoulderWidth, pelvisY, 0.38);
        rootBone.add(armGroup);
      } else {
        armGroup.position.set(
          side * 0.44 * m.torsoBulk * m.shoulderWidth,
          torsoHeight * 0.75,
          0
        );
        torsoGroup.add(armGroup);
        if (isCentaur) {
          const equineHaunch = new THREE2.Mesh(
            trackGeo(new THREE2.SphereGeometry(0.22 * m.torsoBulk, seg(14, 10), seg(10, 8))),
            isUndeadSkeleton ? ivoryFangMat : primaryArmorMat
          );
          equineHaunch.position.set(side * 0.25 * m.torsoBulk, 0.02, 0.52);
          pelvisGroup.add(equineHaunch);
          const foreLegCurve = new THREE2.CatmullRomCurve3([
            new THREE2.Vector3(side * 0.25 * m.torsoBulk, 0.04, 0.52),
            new THREE2.Vector3(side * 0.26 * m.torsoBulk, -legHeight * 0.48, 0.5),
            new THREE2.Vector3(side * 0.26 * m.torsoBulk, -legHeight + 0.04, 0.54)
          ]);
          const foreLeg = new THREE2.Mesh(
            trackGeo(
              new THREE2.TubeGeometry(
                foreLegCurve,
                seg(14, 10),
                (isUndeadSkeleton ? 0.068 : 0.125) * m.torsoBulk,
                seg(12, 8),
                false
              )
            ),
            isUndeadSkeleton ? ivoryFangMat : primaryArmorMat
          );
          pelvisGroup.add(foreLeg);
        }
      }
      const armLen = isQuadruped && !isCentaur ? legHeight : 0.78 * m.limbLength;
      const elbowY = -armLen * 0.48;
      const elbowZ = isQuadruped && !isCentaur ? -0.05 : -0.02;
      const elbowGroup = makeBone(isLeft ? "Elbow_Joint_L" : "Elbow_Joint_R");
      elbowGroup.position.set(0, elbowY, elbowZ);
      armGroup.add(elbowGroup);
      const forearmLen = armLen * 0.52;
      const handY = -forearmLen + 0.05;
      const handZ = isQuadruped && !isCentaur ? 0.05 : 0.08;
      if (isUndeadSkeleton) {
        const humeralHeadGeo = trackGeo(
          new THREE2.SphereGeometry(0.068 * m.torsoBulk, seg(12, 8), seg(10, 8)),
          8e-3
        );
        const humeralHeadMesh = new THREE2.Mesh(humeralHeadGeo, ivoryFangMat);
        humeralHeadMesh.position.set(-side * 0.04 * m.torsoBulk, 0.04, 0);
        armGroup.add(humeralHeadMesh);
        const tubercleGeo = trackGeo(
          new THREE2.SphereGeometry(0.054 * m.torsoBulk, seg(10, 8), seg(8, 6)),
          8e-3
        );
        const tubercleMesh = new THREE2.Mesh(tubercleGeo, ivoryFangMat);
        tubercleMesh.position.set(side * 0.032 * m.torsoBulk, 0.025, 0.015);
        armGroup.add(tubercleMesh);
        const humerusCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(-side * 0.025 * m.torsoBulk, 0.04, 0),
          new THREE2.Vector3(side * 0.015 * m.torsoBulk, 0, 5e-3),
          new THREE2.Vector3(side * 8e-3 * m.torsoBulk, elbowY * 0.52, elbowZ * 0.5),
          new THREE2.Vector3(0, elbowY, elbowZ)
        ]);
        const humerusGeo = trackGeo(
          new THREE2.TubeGeometry(
            humerusCurve,
            seg(14, 10),
            0.045 * m.torsoBulk,
            seg(10, 8),
            false
          ),
          8e-3
        );
        const humerusMesh = new THREE2.Mesh(humerusGeo, ivoryFangMat);
        humerusMesh.castShadow = true;
        armGroup.add(humerusMesh);
        const epicondyleGeo = trackGeo(
          new THREE2.CapsuleGeometry(0.046 * m.torsoBulk, 0.072 * m.torsoBulk, 6, 10),
          6e-3
        );
        epicondyleGeo.rotateZ(Math.PI / 2);
        const epicondyleMesh = new THREE2.Mesh(epicondyleGeo, ivoryFangMat);
        epicondyleMesh.position.set(0, 0.015, 0);
        elbowGroup.add(epicondyleMesh);
        const olecranonGeo = trackGeo(
          new THREE2.SphereGeometry(0.046 * m.torsoBulk, seg(10, 8), seg(8, 6)),
          8e-3
        );
        olecranonGeo.scale(0.85, 1.25, 1.15);
        const olecranonMesh = new THREE2.Mesh(olecranonGeo, ivoryFangMat);
        olecranonMesh.position.set(-side * 0.018 * m.torsoBulk, 0.01, -0.042 * m.torsoBulk);
        elbowGroup.add(olecranonMesh);
        const radiusCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(side * 0.032 * m.torsoBulk, -0.01, 0.012),
          new THREE2.Vector3(side * 0.038 * m.torsoBulk, -forearmLen * 0.48, handZ * 0.48 + 0.016),
          new THREE2.Vector3(side * 0.028 * m.torsoBulk, handY + 0.02, handZ + 0.012)
        ]);
        const radiusGeo = trackGeo(
          new THREE2.TubeGeometry(
            radiusCurve,
            seg(12, 8),
            0.031 * m.torsoBulk,
            seg(8, 6),
            false
          ),
          6e-3
        );
        const radiusMesh = new THREE2.Mesh(radiusGeo, ivoryFangMat);
        radiusMesh.castShadow = true;
        elbowGroup.add(radiusMesh);
        const ulnaCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(-side * 0.028 * m.torsoBulk, 5e-3, -0.022),
          new THREE2.Vector3(-side * 0.034 * m.torsoBulk, -forearmLen * 0.48, handZ * 0.45 - 0.014),
          new THREE2.Vector3(-side * 0.026 * m.torsoBulk, handY + 0.02, handZ - 8e-3)
        ]);
        const ulnaGeo = trackGeo(
          new THREE2.TubeGeometry(
            ulnaCurve,
            seg(12, 8),
            0.028 * m.torsoBulk,
            seg(8, 6),
            false
          ),
          6e-3
        );
        const ulnaMesh = new THREE2.Mesh(ulnaGeo, ivoryFangMat);
        ulnaMesh.castShadow = true;
        elbowGroup.add(ulnaMesh);
        for (let cr = 0; cr < 2; cr++) {
          const carpalRowGeo = trackGeo(
            new THREE2.CapsuleGeometry(0.024 * m.torsoBulk, 0.064 * m.torsoBulk, 6, 8),
            5e-3
          );
          carpalRowGeo.rotateZ(Math.PI / 2);
          const carpalRowMesh = new THREE2.Mesh(carpalRowGeo, ivoryFangMat);
          carpalRowMesh.position.set(
            0,
            handY + 0.018 - cr * 0.022 * m.torsoBulk,
            handZ + (6e-3 + cr * 0.016) * m.torsoBulk
          );
          elbowGroup.add(carpalRowMesh);
        }
        const fingerOffsets = [-0.042, -0.014, 0.014, 0.042];
        for (let f = 0; f < 4; f++) {
          const fx = fingerOffsets[f] * m.torsoBulk;
          const isMiddle = f === 1 || f === 2;
          const lenMult = isMiddle ? 1.08 : 0.94;
          const wristPt = new THREE2.Vector3(fx * 0.72, handY + 2e-3, handZ + 0.018);
          const knucklePt = new THREE2.Vector3(
            fx,
            handY - 0.024 * m.torsoBulk,
            handZ + (0.068 + (isMiddle ? 6e-3 : 0)) * m.torsoBulk
          );
          const metaCurve = new THREE2.CatmullRomCurve3([wristPt, knucklePt]);
          const metaGeo = trackGeo(
            new THREE2.TubeGeometry(metaCurve, 6, 0.013 * m.torsoBulk, 6, false),
            2e-3
          );
          const metaMesh = new THREE2.Mesh(metaGeo, ivoryFangMat);
          metaMesh.castShadow = true;
          elbowGroup.add(metaMesh);
          const knuckleGeo = trackGeo(
            new THREE2.SphereGeometry(0.016 * m.torsoBulk, 7, 6),
            2e-3
          );
          const knuckleMesh = new THREE2.Mesh(knuckleGeo, ivoryFangMat);
          knuckleMesh.position.copy(knucklePt);
          elbowGroup.add(knuckleMesh);
          if (isGrippingHandle) {
            const pipPt = new THREE2.Vector3(
              fx,
              handY - 0.018 * m.torsoBulk,
              handZ + 0.128 * lenMult * m.torsoBulk
            );
            const dipPt = new THREE2.Vector3(
              fx,
              handY - 0.064 * m.torsoBulk,
              handZ + 0.124 * lenMult * m.torsoBulk
            );
            const tipPt = new THREE2.Vector3(
              fx * 0.92,
              handY - 0.068 * m.torsoBulk,
              handZ + 0.072 * m.torsoBulk
            );
            const phalanxCurve = new THREE2.CatmullRomCurve3([knucklePt, pipPt, dipPt, tipPt]);
            const phalanxGeo = trackGeo(
              new THREE2.TubeGeometry(phalanxCurve, 10, 0.012 * m.torsoBulk, 6, false),
              2e-3
            );
            const phalanxMesh = new THREE2.Mesh(phalanxGeo, ivoryFangMat);
            phalanxMesh.castShadow = true;
            elbowGroup.add(phalanxMesh);
            const pipKnob = new THREE2.Mesh(knuckleGeo, ivoryFangMat);
            pipKnob.position.copy(pipPt);
            elbowGroup.add(pipKnob);
          } else {
            const splayX = fx * 1.32;
            const pipPt = new THREE2.Vector3(
              splayX,
              handY - 0.055 * lenMult * m.torsoBulk,
              handZ + 0.115 * lenMult * m.torsoBulk
            );
            const dipPt = new THREE2.Vector3(
              splayX * 1.08,
              handY - 0.095 * lenMult * m.torsoBulk,
              handZ + 0.145 * lenMult * m.torsoBulk
            );
            const tipPt = new THREE2.Vector3(
              splayX * 1.04,
              handY - 0.132 * lenMult * m.torsoBulk,
              handZ + 0.132 * lenMult * m.torsoBulk
            );
            const phalanxCurve = new THREE2.CatmullRomCurve3([knucklePt, pipPt, dipPt, tipPt]);
            const phalanxGeo = trackGeo(
              new THREE2.TubeGeometry(phalanxCurve, 10, 0.012 * m.torsoBulk, 6, false),
              2e-3
            );
            const phalanxMesh = new THREE2.Mesh(phalanxGeo, ivoryFangMat);
            phalanxMesh.castShadow = true;
            elbowGroup.add(phalanxMesh);
            const pipKnob = new THREE2.Mesh(knuckleGeo, ivoryFangMat);
            pipKnob.position.copy(pipPt);
            elbowGroup.add(pipKnob);
          }
        }
        const thumbSign = side;
        const thumbBase = new THREE2.Vector3(
          thumbSign * 0.042 * m.torsoBulk,
          handY - 2e-3,
          handZ + 0.025 * m.torsoBulk
        );
        const thumbKnuckle = new THREE2.Vector3(
          thumbSign * 0.062 * m.torsoBulk,
          handY - 0.028 * m.torsoBulk,
          handZ + 0.068 * m.torsoBulk
        );
        const thumbTip = isGrippingHandle ? new THREE2.Vector3(
          -thumbSign * 0.012 * m.torsoBulk,
          handY - 0.052 * m.torsoBulk,
          handZ + 0.118 * m.torsoBulk
        ) : new THREE2.Vector3(
          thumbSign * 0.078 * m.torsoBulk,
          handY - 0.075 * m.torsoBulk,
          handZ + 0.112 * m.torsoBulk
        );
        const thumbCurve = new THREE2.CatmullRomCurve3([thumbBase, thumbKnuckle, thumbTip]);
        const thumbGeo = trackGeo(
          new THREE2.TubeGeometry(thumbCurve, 8, 0.013 * m.torsoBulk, 6, false),
          2e-3
        );
        elbowGroup.add(new THREE2.Mesh(thumbGeo, ivoryFangMat));
      } else {
        const deltoidGeo = trackGeo(
          new THREE2.SphereGeometry(0.192 * m.torsoBulk, seg(14, 10), seg(10, 8)),
          0.022
        );
        deltoidGeo.scale(0.98, 1.24, 1.18);
        const deltoidMesh = new THREE2.Mesh(deltoidGeo, primaryArmorMat);
        deltoidMesh.position.set(-side * 0.045, 0.035, 0);
        armGroup.add(deltoidMesh);
        const axillaBridgeCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(-side * 0.16 * m.torsoBulk, 0.09, isQuadruped && !isCentaur ? 0.04 : 0.02),
          new THREE2.Vector3(-side * 0.05 * m.torsoBulk, 0.02, 0.01),
          new THREE2.Vector3(0, elbowY * 0.32, elbowZ * 0.3)
        ]);
        const axillaBridgeGeo = trackGeo(
          new THREE2.TubeGeometry(
            axillaBridgeCurve,
            seg(12, 8),
            0.128 * m.torsoBulk,
            seg(10, 8),
            false
          ),
          0.016
        );
        const axillaBridgeMesh = new THREE2.Mesh(
          axillaBridgeGeo,
          isQuadruped || isOrganicCreature ? primaryArmorMat : underbodyMat
        );
        armGroup.add(axillaBridgeMesh);
        const upperArmCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(-side * 0.03, 0.08, 0),
          new THREE2.Vector3(side * 0.01, elbowY * 0.5, elbowZ * 0.5),
          new THREE2.Vector3(0, elbowY - 0.05, elbowZ)
        ]);
        const upperArmGeo = trackGeo(
          new THREE2.TubeGeometry(
            upperArmCurve,
            seg(14, 10),
            0.138 * m.torsoBulk,
            seg(12, 10),
            false
          ),
          0.024
        );
        const upperArmMesh = new THREE2.Mesh(
          upperArmGeo,
          isQuadruped ? primaryArmorMat : underbodyMat
        );
        upperArmMesh.castShadow = true;
        armGroup.add(upperArmMesh);
        if (muscleDef > 0.15) {
          const mScale = 0.78 + muscleDef * 0.34;
          const bicepGeo = trackGeo(
            new THREE2.SphereGeometry(0.112 * m.torsoBulk * mScale, seg(12, 8), seg(10, 8)),
            0.024
          );
          bicepGeo.scale(0.84, 1.55, 1.08);
          const bicepMesh = new THREE2.Mesh(
            bicepGeo,
            isQuadruped || isOrganicCreature ? primaryArmorMat : underbodyMat
          );
          bicepMesh.position.set(0, elbowY * 0.48, 0.055 * m.torsoBulk);
          bicepMesh.rotation.x = 0.12;
          armGroup.add(bicepMesh);
          const tricepGeo = trackGeo(
            new THREE2.SphereGeometry(0.118 * m.torsoBulk * mScale, seg(12, 8), seg(10, 8)),
            0.024
          );
          tricepGeo.scale(0.86, 1.62, 1.12);
          const tricepMesh = new THREE2.Mesh(
            tricepGeo,
            isQuadruped || isOrganicCreature ? primaryArmorMat : underbodyMat
          );
          tricepMesh.position.set(side * 0.025 * m.torsoBulk, elbowY * 0.38, -0.058 * m.torsoBulk);
          tricepMesh.rotation.x = -0.14;
          armGroup.add(tricepMesh);
        }
        const elbowSphereGeo = trackGeo(
          new THREE2.CapsuleGeometry(0.128 * m.torsoBulk, 0.095 * m.torsoBulk, seg(10, 8), seg(14, 10)),
          0.015
        );
        elbowSphereGeo.scale(1.04, 1.12, 1.14);
        const elbowSphere = new THREE2.Mesh(
          elbowSphereGeo,
          isQuadruped ? primaryArmorMat : secondaryTrimMat
        );
        elbowGroup.add(elbowSphere);
        const elbowBridgeCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(0, 0.09, 0.038 * m.torsoBulk),
          new THREE2.Vector3(0, 0, 0.058 * m.torsoBulk),
          new THREE2.Vector3(0, -0.1, 0.042 * m.torsoBulk)
        ]);
        const elbowBridgeGeo = trackGeo(
          new THREE2.TubeGeometry(elbowBridgeCurve, seg(10, 8), 0.062 * m.torsoBulk, seg(10, 8), false),
          0.012
        );
        const elbowBridgeMesh = new THREE2.Mesh(
          elbowBridgeGeo,
          isOrganicCreature || isQuadruped ? primaryArmorMat : underbodyMat
        );
        elbowGroup.add(elbowBridgeMesh);
        const forearmCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(0, 0.07, 0),
          new THREE2.Vector3(0, -forearmLen * 0.48, handZ * 0.45),
          new THREE2.Vector3(0, handY - 0.02, handZ)
        ]);
        const forearmGeo = trackGeo(
          new THREE2.TubeGeometry(
            forearmCurve,
            seg(14, 10),
            0.12 * m.torsoBulk,
            seg(12, 10),
            false
          ),
          0.022
        );
        const forearmMesh = new THREE2.Mesh(forearmGeo, primaryArmorMat);
        forearmMesh.castShadow = true;
        elbowGroup.add(forearmMesh);
        if (muscleDef > 0.15) {
          const mScale = 0.78 + muscleDef * 0.34;
          const brachioGeo = trackGeo(
            new THREE2.SphereGeometry(0.098 * m.torsoBulk * mScale, seg(10, 8), seg(8, 6)),
            0.022
          );
          brachioGeo.scale(0.88, 1.58, 1.12);
          const brachioMesh = new THREE2.Mesh(brachioGeo, primaryArmorMat);
          brachioMesh.position.set(side * 0.018 * m.torsoBulk, -forearmLen * 0.34, 0.028 * m.torsoBulk);
          elbowGroup.add(brachioMesh);
        }
        if (furDensity > 0.15 && hairStyle !== "none") {
          const fScale = 0.74 + furDensity * 0.36;
          for (let t = 0; t < 3; t++) {
            const elbowTuftGeo = trackFurLock(0.055 * m.torsoBulk * fScale, (0.22 - t * 0.025) * fScale, 0.08);
            const elbowTuft = new THREE2.Mesh(elbowTuftGeo, hairStrandMat);
            elbowTuft.position.set(
              side * 0.02 * m.torsoBulk,
              0.02 - forearmLen * (t * 0.25),
              -0.075 * m.torsoBulk
            );
            elbowTuft.rotation.x = -Math.PI * 0.66;
            elbowTuft.rotation.z = -side * 0.18;
            elbowGroup.add(elbowTuft);
          }
        }
        const wristCuffGeo = trackGeo(
          new THREE2.CapsuleGeometry(0.105 * m.torsoBulk, 0.065 * m.torsoBulk, seg(8, 6), seg(12, 8)),
          0.012
        );
        const wristCuffMesh = new THREE2.Mesh(wristCuffGeo, primaryArmorMat);
        wristCuffMesh.position.set(0, handY + 0.02, handZ + 0.01);
        wristCuffMesh.rotation.x = 0.35;
        elbowGroup.add(wristCuffMesh);
        const handGeo = trackGeo(
          new THREE2.SphereGeometry(0.108 * m.torsoBulk, seg(12, 10), seg(10, 8))
        );
        handGeo.scale(0.95, 0.65, 1.15);
        const handMesh = new THREE2.Mesh(handGeo, secondaryTrimMat);
        handMesh.position.set(0, handY - 0.012, handZ + 0.048);
        elbowGroup.add(handMesh);
        if (hasGraspingHands) {
          const fingerOffsets = [-0.042, -0.014, 0.014, 0.042];
          for (let f = 0; f < 4; f++) {
            const fx = fingerOffsets[f] * m.torsoBulk;
            const knucklePt = new THREE2.Vector3(fx, handY - 0.02 * m.torsoBulk, handZ + 0.068 * m.torsoBulk);
            const fingerCurve = isGrippingHandle ? new THREE2.CatmullRomCurve3([
              knucklePt,
              new THREE2.Vector3(fx, handY - 0.018 * m.torsoBulk, handZ + 0.132 * m.torsoBulk),
              new THREE2.Vector3(fx, handY - 0.066 * m.torsoBulk, handZ + 0.125 * m.torsoBulk),
              new THREE2.Vector3(fx * 0.9, handY - 0.068 * m.torsoBulk, handZ + 0.072 * m.torsoBulk)
            ]) : new THREE2.CatmullRomCurve3([
              knucklePt,
              new THREE2.Vector3(fx * 1.15, handY - 0.055 * m.torsoBulk, handZ + 0.118 * m.torsoBulk),
              new THREE2.Vector3(fx * 1.2, handY - 0.098 * m.torsoBulk, handZ + 0.138 * m.torsoBulk)
            ]);
            const fingerGeo = trackGeo(
              new THREE2.TubeGeometry(fingerCurve, 8, 0.016 * m.torsoBulk, 6, false),
              3e-3
            );
            elbowGroup.add(new THREE2.Mesh(fingerGeo, primaryArmorMat));
          }
          const thumbCurve = new THREE2.CatmullRomCurve3([
            new THREE2.Vector3(side * 0.046 * m.torsoBulk, handY - 5e-3, handZ + 0.032 * m.torsoBulk),
            new THREE2.Vector3(side * 0.065 * m.torsoBulk, handY - 0.03 * m.torsoBulk, handZ + 0.072 * m.torsoBulk),
            isGrippingHandle ? new THREE2.Vector3(-side * 0.01 * m.torsoBulk, handY - 0.052 * m.torsoBulk, handZ + 0.118 * m.torsoBulk) : new THREE2.Vector3(side * 0.078 * m.torsoBulk, handY - 0.072 * m.torsoBulk, handZ + 0.108 * m.torsoBulk)
          ]);
          const thumbGeo = trackGeo(
            new THREE2.TubeGeometry(thumbCurve, 7, 0.017 * m.torsoBulk, 6, false),
            3e-3
          );
          elbowGroup.add(new THREE2.Mesh(thumbGeo, primaryArmorMat));
        } else if (isQuadruped && !isCentaur) {
          for (let c = -1; c <= 1; c++) {
            const frontToeGeo = trackGeo(
              new THREE2.SphereGeometry(0.052 * m.torsoBulk, seg(10, 8), seg(8, 6))
            );
            frontToeGeo.scale(0.8, 0.65, 1.4);
            const frontToe = new THREE2.Mesh(frontToeGeo, primaryArmorMat);
            frontToe.position.set(c * 0.06 * m.torsoBulk, handY - 0.02, handZ + 0.16);
            elbowGroup.add(frontToe);
          }
        }
      }
      const handSocket = new THREE2.Object3D();
      handSocket.name = isLeft ? "socket_shield_l" : "socket_weapon_r";
      handSocket.position.set(0, handY - 0.038 * m.torsoBulk, handZ + 0.096 * m.torsoBulk);
      elbowGroup.add(handSocket);
      tagExplodablePart(armGroup, new THREE2.Vector3(side * 0.65, 0, 0.25), {
        name: isQuadruped ? isLeft ? "Extremidad Frontal Izquierda" : "Extremidad Frontal Derecha" : isUndeadSkeleton ? isLeft ? "H\xFAmero, Radio-C\xFAbito y Mano \xD3sea Izquierda" : "H\xFAmero, Radio-C\xFAbito y Mano \xD3sea Derecha" : isLeft ? "Brazo Articulado Izquierdo" : "Brazo Articulado Derecho",
        category: "Secondary Read",
        vertexCount: 420,
        triangleCount: 370,
        materialSummary: isUndeadSkeleton ? "H\xFAmero, radio y c\xFAbito separados + carpo, 5 metacarpos y falanges con agarre 3D" : "B\xEDceps, tr\xEDceps y braquiorradial esculpidos + mano con agarre 3D",
        socketName: handSocket.name
      });
      explodableParts.push(armGroup);
      return { armGroup, elbowGroup, handSocket };
    };
    const {
      armGroup: leftArmGroup,
      elbowGroup: leftElbowGroup,
      handSocket: socketShieldL
    } = buildArm(true);
    const {
      armGroup: rightArmGroup,
      elbowGroup: rightElbowGroup,
      handSocket: socketWeaponR
    } = buildArm(false);
    const weaponGroup = new THREE2.Group();
    weaponGroup.name = `Weapon_${effectiveWeapon}`;
    weaponGroup.scale.setScalar(m.weaponScale);
    if (effectiveWeapon === "bone_recurved_bow") {
      weaponGroup.rotation.x = Math.PI / 2;
    }
    socketWeaponR.add(weaponGroup);
    const arrowProjectileMesh = new THREE2.Group();
    arrowProjectileMesh.name = "Arrow_Projectile_Mesh";
    arrowProjectileMesh.position.set(0, 0, 0.36);
    arrowProjectileMesh.scale.setScalar(effectiveWeapon === "bone_recurved_bow" ? 1 : 1e-4);
    weaponGroup.add(arrowProjectileMesh);
    if (isNaturalUnarmed) {
      if (!isUndeadSkeleton && config.helm !== "tauren_bull_horns" && !isArachnid && !isBeholder) {
        for (let c = -1; c <= 1; c++) {
          const talonGeo = trackGeo(new THREE2.ConeGeometry(0.028, 0.16, 5), 4e-3);
          talonGeo.rotateX(Math.PI / 2.1);
          const talonR = new THREE2.Mesh(talonGeo, ivoryFangMat);
          talonR.position.set(c * 0.055, -0.02, 0.09);
          weaponGroup.add(talonR);
          const talonL = talonR.clone();
          socketShieldL.add(talonL);
        }
      }
    } else if (effectiveWeapon === "bone_recurved_bow") {
      const bowRiserGeo = trackGeo(
        new THREE2.CylinderGeometry(0.034, 0.034, 0.34, seg(10, 8)),
        6e-3
      );
      const bowRiserMesh = new THREE2.Mesh(bowRiserGeo, secondaryTrimMat);
      weaponGroup.add(bowRiserMesh);
      for (const limbDir of [-1, 1]) {
        const limbCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(0, limbDir * 0.14, 0.02),
          new THREE2.Vector3(0, limbDir * 0.44, 0.18),
          new THREE2.Vector3(0, limbDir * 0.68, 0.04),
          new THREE2.Vector3(0, limbDir * 0.82, -0.16)
        ]);
        const limbGeo = trackGeo(
          new THREE2.TubeGeometry(
            limbCurve,
            seg(14, 10),
            0.032,
            seg(8, 6),
            false
          ),
          6e-3
        );
        const limbMesh = new THREE2.Mesh(
          limbGeo,
          isUndeadSkeleton ? ivoryFangMat : primaryArmorMat
        );
        weaponGroup.add(limbMesh);
        const collarGeo = trackGeo(
          new THREE2.CylinderGeometry(0.042, 0.042, 0.08, 8),
          4e-3
        );
        const collarMesh = new THREE2.Mesh(collarGeo, secondaryTrimMat);
        collarMesh.position.set(0, limbDir * 0.38, 0.14);
        collarMesh.rotation.x = limbDir * 0.35;
        weaponGroup.add(collarMesh);
        const tipSpikeGeo = trackGeo(
          new THREE2.ConeGeometry(0.026, 0.16, 6),
          4e-3
        );
        const tipSpike = new THREE2.Mesh(tipSpikeGeo, emissiveRuneMat);
        tipSpike.position.set(0, limbDir * 0.86, -0.2);
        tipSpike.rotation.x = limbDir > 0 ? -0.45 : Math.PI + 0.45;
        weaponGroup.add(tipSpike);
      }
      const halfStringGeo = trackGeo(
        new THREE2.CylinderGeometry(75e-4, 75e-4, 0.82, 6),
        0
      );
      const upperBowstringPivot = new THREE2.Group();
      upperBowstringPivot.name = "Bowstring_Upper_Pivot";
      upperBowstringPivot.position.set(0, 0.82, -0.16);
      const upperStringMesh = new THREE2.Mesh(halfStringGeo, emissiveRuneMat);
      upperStringMesh.position.set(0, -0.41, 0);
      upperBowstringPivot.add(upperStringMesh);
      weaponGroup.add(upperBowstringPivot);
      const lowerBowstringPivot = new THREE2.Group();
      lowerBowstringPivot.name = "Bowstring_Lower_Pivot";
      lowerBowstringPivot.position.set(0, -0.82, -0.16);
      const lowerStringMesh = new THREE2.Mesh(halfStringGeo, emissiveRuneMat);
      lowerStringMesh.position.set(0, 0.41, 0);
      lowerBowstringPivot.add(lowerStringMesh);
      weaponGroup.add(lowerBowstringPivot);
      weaponGroup.userData.bowstringPivots = {
        upper: upperBowstringPivot,
        lower: lowerBowstringPivot
      };
      const arrowShaftGeo = trackGeo(
        new THREE2.CylinderGeometry(0.015, 0.015, 1.12, 8),
        2e-3
      );
      arrowShaftGeo.rotateX(Math.PI / 2);
      const arrowShaftMesh = new THREE2.Mesh(arrowShaftGeo, ivoryFangMat);
      arrowProjectileMesh.add(arrowShaftMesh);
      const broadheadGeo = trackGeo(
        new THREE2.ConeGeometry(0.052, 0.24, 6),
        3e-3
      );
      broadheadGeo.rotateX(Math.PI / 2);
      broadheadGeo.scale(1.2, 0.65, 1);
      const broadheadMesh = new THREE2.Mesh(broadheadGeo, emissiveRuneMat);
      broadheadMesh.position.set(0, 0, 0.62);
      arrowProjectileMesh.add(broadheadMesh);
      for (let v = 0; v < 3; v++) {
        const vaneGeo = trackGeo(new THREE2.BoxGeometry(8e-3, 0.095, 0.22), 2e-3);
        const vaneMesh = new THREE2.Mesh(vaneGeo, secondaryTrimMat);
        const vAng = v / 3 * Math.PI * 2;
        vaneMesh.position.set(
          Math.sin(vAng) * 0.032,
          Math.cos(vAng) * 0.032,
          -0.44
        );
        vaneMesh.rotation.z = -vAng;
        arrowProjectileMesh.add(vaneMesh);
      }
      const arrowWakeGeo = trackGeo(
        new THREE2.ConeGeometry(0.11, 0.92, 8, 1, true),
        0
      );
      arrowWakeGeo.rotateX(-Math.PI / 2);
      const arrowWakeMesh = new THREE2.Mesh(arrowWakeGeo, slashTrailMat);
      arrowWakeMesh.name = "Arrow_Flight_Wake";
      arrowWakeMesh.position.set(0, 0, 0.12);
      arrowProjectileMesh.add(arrowWakeMesh);
      const quiverGroup = new THREE2.Group();
      quiverGroup.name = "Dorsal_Arrow_Quiver";
      quiverGroup.position.set(
        0.16 * m.torsoBulk * m.shoulderWidth,
        torsoHeight * 0.56,
        -0.23 * m.torsoBulk
      );
      quiverGroup.rotation.set(0.16, 0, -0.34);
      torsoGroup.add(quiverGroup);
      const quiverTubeGeo = trackGeo(
        new THREE2.CylinderGeometry(0.095 * m.torsoBulk, 0.075 * m.torsoBulk, 0.68, seg(12, 8)),
        8e-3
      );
      const quiverTubeMesh = new THREE2.Mesh(quiverTubeGeo, secondaryTrimMat);
      quiverGroup.add(quiverTubeMesh);
      const quiverRimGeo = trackGeo(
        new THREE2.TorusGeometry(0.098 * m.torsoBulk, 0.018 * m.torsoBulk, 6, 12),
        0
      );
      quiverRimGeo.rotateX(Math.PI / 2);
      const quiverRimMesh = new THREE2.Mesh(quiverRimGeo, primaryArmorMat);
      quiverRimMesh.position.y = 0.34;
      quiverGroup.add(quiverRimMesh);
      for (let qa = 0; qa < 6; qa++) {
        const qAng = qa / 6 * Math.PI * 2;
        const qRad = 0.042 * m.torsoBulk;
        const qArrowGeo = trackGeo(
          new THREE2.CylinderGeometry(0.011, 0.011, 0.38, 6),
          0
        );
        const qArrow = new THREE2.Mesh(qArrowGeo, ivoryFangMat);
        qArrow.position.set(
          Math.cos(qAng) * qRad,
          0.44 + qa % 2 * 0.04,
          Math.sin(qAng) * qRad
        );
        qArrow.rotation.z = (qa - 2.5) * 0.04;
        quiverGroup.add(qArrow);
        const qFeatherGeo = trackGeo(
          new THREE2.ConeGeometry(0.028, 0.11, 4),
          0
        );
        const qFeather = new THREE2.Mesh(qFeatherGeo, emissiveRuneMat);
        qFeather.position.set(
          Math.cos(qAng) * qRad,
          0.61 + qa % 2 * 0.04,
          Math.sin(qAng) * qRad
        );
        quiverGroup.add(qFeather);
      }
    } else {
      const shaftLen = effectiveWeapon === "arcane_staff" || effectiveWeapon === "radiant_halberd" ? 1.85 : 1.15;
      const shaftTilt = Math.PI / 2.35;
      const gripOffset = shaftLen * 0.24;
      const shaftGeo = trackGeo(
        new THREE2.CylinderGeometry(0.028, 0.034, shaftLen, seg(10, 6)),
        5e-3
      );
      const shaftMesh = new THREE2.Mesh(shaftGeo, underbodyMat);
      shaftMesh.position.set(
        0,
        Math.cos(shaftTilt) * gripOffset,
        Math.sin(shaftTilt) * gripOffset
      );
      shaftMesh.rotation.x = shaftTilt;
      weaponGroup.add(shaftMesh);
      const gripSleeveGeo = trackGeo(
        new THREE2.CylinderGeometry(0.036, 0.036, 0.24, seg(10, 6)),
        6e-3
      );
      const gripSleeveMesh = new THREE2.Mesh(gripSleeveGeo, secondaryTrimMat);
      gripSleeveMesh.position.set(0, -gripOffset, 0);
      shaftMesh.add(gripSleeveMesh);
      const pommelGeo = trackGeo(
        new THREE2.OctahedronGeometry(0.068, 1),
        6e-3
      );
      const pommelMesh = new THREE2.Mesh(pommelGeo, secondaryTrimMat);
      pommelMesh.position.set(0, -shaftLen * 0.5 - 0.03, 0);
      shaftMesh.add(pommelMesh);
      const guardGeo = trackGeo(new THREE2.SphereGeometry(0.14, 7, 5), 8e-3);
      guardGeo.scale(1.2, 0.35, 0.55);
      const guardMesh = new THREE2.Mesh(guardGeo, secondaryTrimMat);
      guardMesh.position.set(0, shaftLen * 0.45, 0);
      shaftMesh.add(guardMesh);
      if (effectiveWeapon === "runic_greatsword" || effectiveWeapon === "venom_scythe_claws") {
        const bladeShape = new THREE2.Shape();
        bladeShape.moveTo(-0.085, 0);
        bladeShape.lineTo(0.085, 0);
        bladeShape.lineTo(0.055, 1.05);
        bladeShape.lineTo(0, 1.32);
        bladeShape.lineTo(-0.055, 1.05);
        bladeShape.closePath();
        const bladeGeo = trackGeo(
          new THREE2.ExtrudeGeometry(bladeShape, {
            depth: 0.024,
            bevelEnabled: true,
            bevelThickness: 0.01,
            bevelSize: 0.012,
            bevelSegments: 1
          }),
          4e-3
        );
        bladeGeo.center();
        const bladeMesh = new THREE2.Mesh(bladeGeo, bladeAlloyMat);
        bladeMesh.position.set(0, shaftLen * 0.5 + 0.52, 0);
        shaftMesh.add(bladeMesh);
        const runeStripGeo = trackGeo(new THREE2.BoxGeometry(0.03, 0.85, 0.048), 0);
        const runeStripMesh = new THREE2.Mesh(runeStripGeo, emissiveRuneMat);
        runeStripMesh.position.set(0, shaftLen * 0.5 + 0.38, 0);
        shaftMesh.add(runeStripMesh);
      } else if (effectiveWeapon === "obsidian_warhammer") {
        const headGeo = trackGeo(new THREE2.CylinderGeometry(0.22, 0.22, 0.54, 8), 0.018);
        headGeo.rotateZ(Math.PI / 2);
        const hammerHead = new THREE2.Mesh(headGeo, primaryArmorMat);
        hammerHead.position.set(0, shaftLen * 0.5 + 0.14, 0);
        shaftMesh.add(hammerHead);
      } else if (effectiveWeapon === "arcane_staff") {
        const finialGeo = trackGeo(
          new THREE2.TorusGeometry(0.22, 0.035, 6, seg(16, 8)),
          8e-3
        );
        const finialMesh = new THREE2.Mesh(finialGeo, secondaryTrimMat);
        finialMesh.position.set(0, shaftLen * 0.5 + 0.2, 0);
        shaftMesh.add(finialMesh);
        const orbGeo = trackGeo(
          new THREE2.OctahedronGeometry(0.12, density === "low" ? 0 : 1),
          0
        );
        const orbMesh = new THREE2.Mesh(orbGeo, crystalCoreMat);
        orbMesh.position.set(0, shaftLen * 0.5 + 0.2, 0);
        shaftMesh.add(orbMesh);
      } else {
        const axeShape = new THREE2.Shape();
        axeShape.moveTo(0, -0.16);
        axeShape.quadraticCurveTo(0.42, -0.05, 0.48, 0.3);
        axeShape.quadraticCurveTo(0.25, 0.08, 0, 0.24);
        axeShape.closePath();
        const axeGeo = trackGeo(
          new THREE2.ExtrudeGeometry(axeShape, {
            depth: 0.025,
            bevelEnabled: true,
            bevelThickness: 0.012,
            bevelSize: 0.012,
            bevelSegments: 1
          }),
          5e-3
        );
        const axeBladeR = new THREE2.Mesh(axeGeo, bladeAlloyMat);
        axeBladeR.position.set(0.02, shaftLen * 0.45, -0.012);
        shaftMesh.add(axeBladeR);
        const axeBladeL = axeBladeR.clone();
        axeBladeL.scale.x = -1;
        axeBladeL.position.x = -0.02;
        shaftMesh.add(axeBladeL);
      }
    }
    const slashTrailGeo = createWeaponSlashArcGeometry(isNaturalUnarmed, seg(22, 14));
    geometriesToDispose.push(slashTrailGeo);
    const slashTrailMesh = new THREE2.Mesh(slashTrailGeo, slashTrailMat);
    slashTrailMesh.name = "Weapon_Slash_Trail_Arc";
    slashTrailMesh.position.set(0, 0.08, 0.25);
    slashTrailMesh.scale.setScalar(1e-4);
    slashTrailMesh.visible = true;
    slashTrailMesh.frustumCulled = false;
    weaponGroup.add(slashTrailMesh);
    tagExplodablePart(weaponGroup, new THREE2.Vector3(-0.65, 0.15, 0.75), {
      name: isNaturalUnarmed ? `Ataque Natural (${effectiveWeapon})` : `Armamento Principal (${effectiveWeapon})`,
      category: "Weapon & Socket",
      vertexCount: isNaturalUnarmed ? 90 : 310,
      triangleCount: isNaturalUnarmed ? 60 : 250,
      materialSummary: isNaturalUnarmed ? "Sin armas de mano \u2014 Ataque natural por garras, mordisco, embestida o aliento" : "Empu\xF1adura anclada dentro de los dedos de la mano (socket_weapon_r)",
      socketName: "socket_weapon_r"
    });
    explodableParts.push(weaponGroup);
    const offhandGroup = new THREE2.Group();
    offhandGroup.name = `Offhand_${hasGraspingHands ? config.offhand : "none"}`;
    socketShieldL.add(offhandGroup);
    if (hasGraspingHands && (config.offhand === "tower_shield" || config.offhand === "runic_buckler")) {
      const isTower = config.offhand === "tower_shield";
      const shW = isTower ? 0.42 : 0.32;
      const shH = isTower ? 0.88 : 0.42;
      const shieldGripGeo = trackGeo(
        new THREE2.CylinderGeometry(0.026, 0.026, 0.22, 8),
        4e-3
      );
      shieldGripGeo.rotateX(Math.PI / 2);
      const shieldGripMesh = new THREE2.Mesh(shieldGripGeo, secondaryTrimMat);
      offhandGroup.add(shieldGripMesh);
      const shieldShape = new THREE2.Shape();
      shieldShape.moveTo(-shW, shH * 0.5);
      shieldShape.lineTo(shW, shH * 0.5);
      shieldShape.lineTo(shW * 0.85, -shH * 0.25);
      shieldShape.lineTo(0, -shH * 0.6);
      shieldShape.lineTo(-shW * 0.85, -shH * 0.25);
      shieldShape.closePath();
      const shieldGeo = trackGeo(
        new THREE2.ExtrudeGeometry(shieldShape, {
          depth: 0.06,
          bevelEnabled: true,
          bevelThickness: 0.02,
          bevelSize: 0.02,
          bevelSegments: 1
        }),
        8e-3
      );
      const shieldMesh = new THREE2.Mesh(shieldGeo, primaryArmorMat);
      shieldMesh.position.set(0.085, 0.02, 0.02);
      shieldMesh.rotation.y = 0.48;
      offhandGroup.add(shieldMesh);
    } else if (hasGraspingHands && config.offhand === "phylactery_orb") {
      const censerRodGeo = trackGeo(
        new THREE2.CylinderGeometry(0.024, 0.028, 0.34, 8),
        4e-3
      );
      censerRodGeo.rotateX(Math.PI / 2.2);
      const censerRod = new THREE2.Mesh(censerRodGeo, secondaryTrimMat);
      censerRod.position.set(0, 0.04, 0.06);
      offhandGroup.add(censerRod);
      const censerGeo = trackGeo(
        new THREE2.IcosahedronGeometry(0.15, density === "low" ? 0 : 1),
        0
      );
      const censerMesh = new THREE2.Mesh(censerGeo, crystalCoreMat);
      censerMesh.position.set(0, 0.11, 0.22);
      offhandGroup.add(censerMesh);
    } else if (hasGraspingHands && config.offhand === "dual_blade") {
      const daggerTilt = Math.PI / 2.25;
      const daggerHiltGeo = trackGeo(
        new THREE2.CylinderGeometry(0.025, 0.028, 0.28, 8),
        4e-3
      );
      const daggerHilt = new THREE2.Mesh(daggerHiltGeo, secondaryTrimMat);
      daggerHilt.rotation.x = daggerTilt;
      offhandGroup.add(daggerHilt);
      const daggerGuardGeo = trackGeo(new THREE2.BoxGeometry(0.18, 0.032, 0.055), 4e-3);
      const daggerGuard = new THREE2.Mesh(daggerGuardGeo, secondaryTrimMat);
      daggerGuard.position.set(0, 0.12, 0);
      daggerHilt.add(daggerGuard);
      const daggerGeo = trackGeo(new THREE2.ConeGeometry(0.068, 0.72, seg(6, 4)), 5e-3);
      daggerGeo.scale(1, 1, 0.36);
      const daggerMesh = new THREE2.Mesh(daggerGeo, bladeAlloyMat);
      daggerMesh.position.set(0, 0.48, 0);
      daggerHilt.add(daggerMesh);
    }
    const dorsalGroup = makeBone(`Dorsal_${config.dorsal}`);
    dorsalGroup.position.set(0, torsoHeight * 0.68, -0.18 * m.torsoBulk);
    dorsalGroup.scale.setScalar(m.dorsalScale);
    torsoGroup.add(dorsalGroup);
    if (config.dorsal !== "none" && !isBeholder) {
      const dorsalSaddleGeo = trackGeo(
        new THREE2.SphereGeometry(0.165 * m.torsoBulk, seg(12, 8), seg(10, 8)),
        0.016
      );
      dorsalSaddleGeo.scale(1.45, 0.92, 0.95);
      const dorsalSaddleMesh = new THREE2.Mesh(
        dorsalSaddleGeo,
        isUndeadSkeleton ? ivoryFangMat : secondaryTrimMat
      );
      dorsalSaddleMesh.position.set(0, 0.04, 0.05);
      dorsalGroup.add(dorsalSaddleMesh);
    }
    const leftWingGroup = makeBone("Wing_L");
    const rightWingGroup = makeBone("Wing_R");
    dorsalGroup.add(leftWingGroup);
    dorsalGroup.add(rightWingGroup);
    if (config.dorsal === "dragon_membrane_wings") {
      for (const side of [-1, 1]) {
        const targetWing = side === 1 ? leftWingGroup : rightWingGroup;
        const wingRootGeo = trackGeo(new THREE2.SphereGeometry(0.16, seg(10, 8), seg(8, 6)), 0.014);
        wingRootGeo.scale(1.25, 1.05, 1.3);
        const wingRoot = new THREE2.Mesh(wingRootGeo, secondaryTrimMat);
        wingRoot.position.set(side * 0.06, 0.02, 0.06);
        targetWing.add(wingRoot);
        const sparCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(side * 0.04, 0, 0.04),
          new THREE2.Vector3(side * 0.55, 0.48, -0.08),
          new THREE2.Vector3(side * 1.25, 0.62, -0.16),
          new THREE2.Vector3(side * 1.65, 0.15, -0.22)
        ]);
        const sparGeo = trackGeo(
          new THREE2.TubeGeometry(sparCurve, seg(10, 6), 0.044, seg(6, 4), false),
          0.01
        );
        targetWing.add(new THREE2.Mesh(sparGeo, primaryArmorMat));
        const webShape = new THREE2.Shape();
        webShape.moveTo(0, 0);
        webShape.lineTo(side * 0.55, 0.46);
        webShape.lineTo(side * 1.25, 0.6);
        webShape.lineTo(side * 1.62, 0.14);
        webShape.quadraticCurveTo(side * 1.15, -0.15, side * 0.85, -0.45);
        webShape.quadraticCurveTo(side * 0.45, -0.2, 0, -0.35);
        webShape.closePath();
        const webGeo = trackGeo(
          new THREE2.ExtrudeGeometry(webShape, { depth: 0.02, bevelEnabled: false }),
          0.01
        );
        const webMesh = new THREE2.Mesh(webGeo, secondaryTrimMat);
        webMesh.position.z = -0.08;
        targetWing.add(webMesh);
      }
    } else if (config.dorsal === "seraph_wings") {
      for (const side of [-1, 1]) {
        const targetWing = side === 1 ? leftWingGroup : rightWingGroup;
        const wingArchGeo = trackGeo(new THREE2.SphereGeometry(0.12, 6, 5), 0.01);
        wingArchGeo.scale(1.8, 0.8, 0.8);
        const wingArch = new THREE2.Mesh(wingArchGeo, secondaryTrimMat);
        wingArch.position.set(side * 0.15, 0.15, 0);
        targetWing.add(wingArch);
        for (let f = 0; f < 6; f++) {
          const featherGeo = trackGeo(new THREE2.ConeGeometry(0.055, 0.85 - f * 0.09, 5), 8e-3);
          featherGeo.scale(1.2, 1, 0.35);
          const featherMesh = new THREE2.Mesh(
            featherGeo,
            f % 2 === 0 ? secondaryTrimMat : primaryArmorMat
          );
          featherMesh.position.set(side * (0.22 + f * 0.16), 0.22 - f * 0.05, -0.03 * f);
          featherMesh.rotation.z = Math.PI - side * (0.42 + f * 0.15);
          targetWing.add(featherMesh);
        }
      }
    } else if (config.dorsal === "beholder_eye_tentacles") {
      for (let i = 0; i < 8; i++) {
        const ang = i / 8 * Math.PI * 2;
        const rx = Math.cos(ang);
        const rz = Math.sin(ang);
        const stalkCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(rx * 0.18, 0.05, rz * 0.18),
          new THREE2.Vector3(rx * 0.65, 0.45 + i % 2 * 0.18, rz * 0.65),
          new THREE2.Vector3(rx * 0.88, 0.28 + i % 3 * 0.15, rz * 0.88)
        ]);
        const stalkGeo = trackGeo(
          new THREE2.TubeGeometry(stalkCurve, seg(8, 5), 0.04, seg(5, 4), false),
          0.01
        );
        dorsalGroup.add(new THREE2.Mesh(stalkGeo, primaryArmorMat));
        const tipEye = new THREE2.Mesh(
          trackGeo(new THREE2.SphereGeometry(0.068, seg(8, 5), seg(6, 4)), 0),
          emissiveRuneMat
        );
        tipEye.position.set(rx * 0.88, 0.28 + i % 3 * 0.15, rz * 0.88);
        dorsalGroup.add(tipEye);
      }
    } else if (config.dorsal === "tattered_mantle") {
      const capeShape = new THREE2.Shape();
      capeShape.moveTo(-0.42, 0.24);
      capeShape.lineTo(0.42, 0.24);
      capeShape.lineTo(0.58, -1.25);
      capeShape.lineTo(0, -1.32);
      capeShape.lineTo(-0.58, -1.25);
      capeShape.closePath();
      const capeGeo = trackGeo(
        new THREE2.ExtrudeGeometry(capeShape, { depth: 0.03, bevelEnabled: false }),
        0.02,
        8
      );
      const capeMesh = new THREE2.Mesh(capeGeo, underbodyMat);
      capeMesh.rotation.x = 0.14;
      dorsalGroup.add(capeMesh);
    } else if (config.dorsal === "crystal_pylons" || config.dorsal === "bio_chitin_spines") {
      for (let i = -2; i <= 2; i++) {
        if (i === 0) continue;
        const pylonGeo = trackGeo(new THREE2.ConeGeometry(0.08, 0.55, 5), 0.012);
        const pylonMesh = new THREE2.Mesh(
          pylonGeo,
          config.dorsal === "crystal_pylons" ? crystalCoreMat : secondaryTrimMat
        );
        pylonMesh.position.set(i * 0.14, 0.18 + (2 - Math.abs(i)) * 0.1, -0.04);
        pylonMesh.rotation.z = -i * 0.25;
        pylonMesh.rotation.x = -0.35;
        dorsalGroup.add(pylonMesh);
      }
    } else if (config.dorsal === "runic_halo_ring") {
      const haloGeo = trackGeo(new THREE2.TorusGeometry(0.52, 0.035, 6, seg(20, 12)), 0);
      const haloMesh = new THREE2.Mesh(haloGeo, emissiveRuneMat);
      haloMesh.position.set(0, 0.28, -0.04);
      dorsalGroup.add(haloMesh);
    }
    tagExplodablePart(dorsalGroup, new THREE2.Vector3(0, 0.55, -0.85), {
      name: `Alas / Estructura Dorsal (${config.dorsal})`,
      category: "Secondary Read",
      vertexCount: 380,
      triangleCount: 310,
      materialSummary: "Uni\xF3n escapular continua al torso dorsal"
    });
    explodableParts.push(dorsalGroup);
    const tailGroup = makeBone("Articulated_Tail");
    tailGroup.position.set(0, 0.06, isQuadruped || isArachnid ? -0.52 : -0.22 * m.torsoBulk);
    pelvisGroup.add(tailGroup);
    const tailTipBone = makeBone("Tail_Mid_Tip");
    tailTipBone.position.set(0, -0.12, -0.55 * m.tailLength);
    tailGroup.add(tailTipBone);
    if (m.tailLength > 0.08 && !isSerpentine) {
      const tLen = 1.15 * m.tailLength;
      const isScorpion = config.dorsal === "scorpion_stinger_tail" || isArachnid || config.archetype === "manticore_chimera" || config.archetype === "gale_wind_manticore" || config.archetype === "stitched_necromancy_chimera";
      const tailCurve = isScorpion ? new THREE2.CatmullRomCurve3([
        new THREE2.Vector3(0, 0.02, 0.14),
        new THREE2.Vector3(0, 0.45 * tLen, -0.45 * tLen),
        new THREE2.Vector3(0, 1.05 * tLen, -0.25 * tLen),
        new THREE2.Vector3(0, 1.25 * tLen, 0.25 * tLen)
      ]) : new THREE2.CatmullRomCurve3([
        new THREE2.Vector3(0, 0.02, 0.14),
        new THREE2.Vector3(0, -0.14, -0.45 * tLen),
        new THREE2.Vector3(0, -0.2, -0.95 * tLen),
        new THREE2.Vector3(0, -0.06, -1.35 * tLen)
      ]);
      const midPt = tailCurve.getPoint(0.48);
      tailTipBone.position.copy(midPt);
      if (isUndeadSkeleton) {
        const caudalVertCount = 10;
        for (let cv = 0; cv < caudalVertCount; cv++) {
          const u = cv / (caudalVertCount - 1);
          const pt = tailCurve.getPoint(u);
          const tang = tailCurve.getTangent(u);
          const vScale = (1 - u * 0.65) * m.torsoBulk;
          const cBodyGeo = trackGeo(
            new THREE2.CylinderGeometry(0.056 * vScale, 0.064 * vScale, 0.095 * tLen, seg(10, 8)),
            5e-3
          );
          cBodyGeo.rotateX(Math.PI / 2);
          const cBody = new THREE2.Mesh(cBodyGeo, ivoryFangMat);
          const cSpineGeo = trackGeo(
            new THREE2.ConeGeometry(0.024 * vScale, 0.11 * vScale, 5),
            4e-3
          );
          const cSpine = new THREE2.Mesh(cSpineGeo, ivoryFangMat);
          if (u < 0.5) {
            cBody.position.copy(pt);
            cBody.lookAt(pt.clone().add(tang));
            tailGroup.add(cBody);
            cSpine.position.copy(pt).add(new THREE2.Vector3(0, 0.065 * vScale, 0));
            tailGroup.add(cSpine);
          } else {
            const localPt = pt.clone().sub(midPt);
            cBody.position.copy(localPt);
            cBody.lookAt(localPt.clone().add(tang));
            tailTipBone.add(cBody);
            cSpine.position.copy(localPt).add(new THREE2.Vector3(0, 0.065 * vScale, 0));
            tailTipBone.add(cSpine);
          }
        }
        const tipPt = tailCurve.getPoint(1);
        const boneSpurGeo = trackGeo(new THREE2.ConeGeometry(0.085, 0.34, 6), 8e-3);
        boneSpurGeo.rotateX(isScorpion ? Math.PI * 0.65 : -Math.PI / 2);
        const boneSpur = new THREE2.Mesh(boneSpurGeo, ivoryFangMat);
        boneSpur.position.copy(tipPt).sub(midPt);
        tailTipBone.add(boneSpur);
      } else {
        const tailRootGeo = trackGeo(
          new THREE2.SphereGeometry(0.185 * m.torsoBulk, seg(12, 8), seg(10, 8)),
          0.016
        );
        tailRootGeo.scale(1.08, 0.96, 1.55);
        const tailRootMesh = new THREE2.Mesh(tailRootGeo, primaryArmorMat);
        tailRootMesh.position.set(0, 0.02, 0.09);
        tailGroup.add(tailRootMesh);
        const sacralCollarGeo = trackGeo(
          new THREE2.CylinderGeometry(
            0.13 * m.torsoBulk,
            0.22 * m.torsoBulk,
            0.28,
            seg(12, 8),
            2
          ),
          0.014
        );
        sacralCollarGeo.rotateX(Math.PI / 2 - 0.15);
        const sacralCollarMesh = new THREE2.Mesh(sacralCollarGeo, primaryArmorMat);
        sacralCollarMesh.position.set(0, 0.02, 0.08);
        tailGroup.add(sacralCollarMesh);
        const midTailJointGeo = trackGeo(
          new THREE2.SphereGeometry(0.125 * m.torsoBulk, seg(10, 8), seg(8, 6)),
          0.012
        );
        midTailJointGeo.scale(0.95, 0.95, 1.35);
        const midTailJointMesh = new THREE2.Mesh(midTailJointGeo, primaryArmorMat);
        tailTipBone.add(midTailJointMesh);
        const isBushyTail = config.archetype === "furious_keltir" || config.archetype === "rabid_grey_wolf" || config.archetype === "dire_wolf" || furDensity > 0.35;
        const tailGeo = trackGeo(
          new THREE2.TubeGeometry(
            tailCurve,
            seg(14, 8),
            (isBushyTail ? 0.165 : 0.11) * m.torsoBulk,
            seg(7, 4),
            false
          ),
          0.018
        );
        const tailMesh = new THREE2.Mesh(tailGeo, primaryArmorMat);
        tailGroup.add(tailMesh);
        if (furDensity > 0.15 && hairStyle !== "none" && !isScorpion) {
          const fScale = 0.76 + furDensity * 0.38;
          for (let t = 0; t < 5; t++) {
            const u = 0.18 + t * 0.16;
            const pt = tailCurve.getPoint(u);
            const side = t % 2 === 0 ? 1 : -1;
            const plumeGeo = trackFurLock(0.085 * m.torsoBulk * fScale, 0.28 * fScale, 0.09);
            const plumeMesh = new THREE2.Mesh(plumeGeo, hairStrandMat);
            if (u < 0.5) {
              plumeMesh.position.set(side * 0.05 * m.torsoBulk, pt.y, pt.z);
              plumeMesh.rotation.x = -Math.PI * 0.62;
              plumeMesh.rotation.z = -side * 0.32;
              tailGroup.add(plumeMesh);
            } else {
              plumeMesh.position.copy(pt).sub(midPt);
              plumeMesh.position.x += side * 0.05 * m.torsoBulk;
              plumeMesh.rotation.x = -Math.PI * 0.58;
              plumeMesh.rotation.z = -side * 0.28;
              tailTipBone.add(plumeMesh);
            }
          }
        }
        const tipPt = tailCurve.getPoint(1);
        const stingerGeo = trackGeo(
          new THREE2.ConeGeometry(isBushyTail ? 0.18 : 0.13, isBushyTail ? 0.44 : 0.36, 6),
          0.01
        );
        stingerGeo.rotateX(isScorpion ? Math.PI * 0.65 : -Math.PI / 2);
        const stingerMesh = new THREE2.Mesh(
          stingerGeo,
          isScorpion ? emissiveRuneMat : secondaryTrimMat
        );
        stingerMesh.position.copy(tipPt).sub(midPt);
        tailTipBone.add(stingerMesh);
      }
      tagExplodablePart(tailGroup, new THREE2.Vector3(0, -0.1, -0.95), {
        name: isUndeadSkeleton ? "Columna Caudal de V\xE9rtebras \xD3seas 3D" : isScorpion ? "Aguij\xF3n Caudal Articulado" : "Cola Org\xE1nica con Penacho 3D",
        category: "Secondary Read",
        vertexCount: 280,
        triangleCount: 230,
        materialSummary: isUndeadSkeleton ? "V\xE9rtebras caudales individuales + espinas dorsales de marfil" : "Malla continua deformada por 3 huesos + mechones de pelaje caudal"
      });
      explodableParts.push(tailGroup);
    }
    let auraInstancedMesh = null;
    const shardData = [];
    const rawShardCount = Math.max(0, Math.round(m.auraShardCount));
    const shardCount = density === "low" ? Math.min(8, Math.ceil(rawShardCount * 0.5)) : rawShardCount;
    if (shardCount > 0) {
      const shardGeo = trackGeo(new THREE2.OctahedronGeometry(0.055, 0), 0);
      shardGeo.scale(0.7, 1.8, 0.7);
      auraInstancedMesh = new THREE2.InstancedMesh(shardGeo, emissiveRuneMat, shardCount);
      auraInstancedMesh.name = "Aura_Runic_Shards";
      auraInstancedMesh.frustumCulled = false;
      const baseColor = new THREE2.Color(matCfg.emissiveColor);
      for (let i = 0; i < shardCount; i++) {
        const angle = i / shardCount * Math.PI * 2;
        const radius = 0.85 + i % 3 * 0.25;
        const yOffset = 0.35 + i * 7 % 10 * 0.18;
        const speed = 0.6 + i % 5 * 0.18;
        const scale = 0.85 + i * 13 % 30 / 100;
        shardData.push({ angle, radius, yOffset, speed, scale });
        _dummyObj.position.set(Math.cos(angle) * radius, yOffset, Math.sin(angle) * radius);
        _dummyObj.rotation.set(0.2, angle, 0.15);
        _dummyObj.scale.setScalar(scale);
        _dummyObj.updateMatrix();
        auraInstancedMesh.setMatrixAt(i, _dummyObj.matrix);
        _shardColor.copy(baseColor).offsetHSL((i % 5 - 2) * 0.03, 0, (i % 3 - 1) * 0.08);
        auraInstancedMesh.setColorAt(i, _shardColor);
      }
      auraInstancedMesh.instanceMatrix.needsUpdate = true;
      if (auraInstancedMesh.instanceColor) auraInstancedMesh.instanceColor.needsUpdate = true;
      auraInstancedMesh.computeBoundingSphere();
      exportableGroup.add(auraInstancedMesh);
    }
    {
      const arch = config.archetype;
      const hScale = 0.82 + m.torsoBulk * 0.18;
      const lThick = m.torsoBulk;
      if (arch === "elite_woolly_mammoth_calf" || arch === "elite_mammoth_ossuary_behemoth") {
        for (const side of [-1, 1]) {
          const tuskCurve = new THREE2.CatmullRomCurve3([
            new THREE2.Vector3(side * 0.16 * hScale, -0.05 * hScale, 0.24 * hScale),
            new THREE2.Vector3(side * 0.34 * hScale, -0.26 * hScale, 0.62 * hScale),
            new THREE2.Vector3(side * 0.42 * hScale, -0.08 * hScale, 1.05 * hScale),
            new THREE2.Vector3(side * 0.28 * hScale, 0.32 * hScale, 1.28 * hScale)
          ]);
          const tuskGeo = trackGeo(
            new THREE2.TubeGeometry(tuskCurve, seg(16, 12), 0.068 * hScale, seg(10, 8), false)
          );
          headGroup.add(new THREE2.Mesh(tuskGeo, ivoryFangMat));
        }
        if (!isUndeadSkeleton) {
          const trunkCurve = new THREE2.CatmullRomCurve3([
            new THREE2.Vector3(0, 0.04 * hScale, 0.28 * hScale),
            new THREE2.Vector3(0, -0.22 * hScale, 0.56 * hScale),
            new THREE2.Vector3(0, -0.58 * hScale, 0.62 * hScale),
            new THREE2.Vector3(0, -0.78 * hScale, 0.44 * hScale),
            new THREE2.Vector3(0, -0.68 * hScale, 0.28 * hScale)
          ]);
          const trunkGeo = trackGeo(
            new THREE2.TubeGeometry(trunkCurve, seg(18, 12), 0.095 * hScale, seg(12, 8), false),
            0.015
          );
          headGroup.add(new THREE2.Mesh(trunkGeo, primaryArmorMat));
        }
      }
      if (arch === "elite_saber_prowler_leopard" || arch === "elite_sabertooth_skull_stalker") {
        for (const side of [-1, 1]) {
          const saberCurve = new THREE2.CatmullRomCurve3([
            new THREE2.Vector3(side * 0.13 * hScale, -0.02 * hScale, 0.34 * hScale),
            new THREE2.Vector3(side * 0.14 * hScale, -0.24 * hScale, 0.42 * hScale),
            new THREE2.Vector3(side * 0.12 * hScale, -0.46 * hScale, 0.36 * hScale)
          ]);
          const saberGeo = trackGeo(
            new THREE2.TubeGeometry(saberCurve, seg(12, 8), 0.036 * hScale, seg(8, 6), false)
          );
          const saberTipGeo = trackGeo(
            new THREE2.ConeGeometry(0.036 * hScale, 0.14 * hScale, seg(8, 6))
          );
          saberTipGeo.rotateX(Math.PI * 0.92);
          const saberTip = new THREE2.Mesh(saberTipGeo, ivoryFangMat);
          saberTip.position.set(side * 0.12 * hScale, -0.51 * hScale, 0.34 * hScale);
          headGroup.add(new THREE2.Mesh(saberGeo, ivoryFangMat), saberTip);
        }
      }
      if (arch === "elite_quillback_porcupine" || arch === "elite_thorny_devil_moloch") {
        const quillLen = arch === "elite_quillback_porcupine" ? 0.62 : 0.34;
        const quillRad = arch === "elite_quillback_porcupine" ? 0.028 : 0.042;
        for (let q = 0; q < 24; q++) {
          const row = Math.floor(q / 4);
          const col = q % 4 - 1.5;
          const rFrac = row / 5;
          const qGeo = trackGeo(
            new THREE2.ConeGeometry(quillRad * m.torsoBulk, quillLen * m.torsoBulk, seg(8, 6))
          );
          const qMesh = new THREE2.Mesh(qGeo, ivoryFangMat);
          qMesh.position.set(
            col * 0.14 * m.torsoBulk * m.shoulderWidth,
            (0.28 + Math.sin(rFrac * Math.PI) * 0.14) * m.torsoBulk,
            -0.32 + rFrac * 0.78
          );
          qMesh.rotation.x = -0.68 - rFrac * 0.35;
          qMesh.rotation.z = -col * 0.32;
          torsoGroup.add(qMesh);
        }
      }
      if (arch === "elite_ironhorn_rhino_beast") {
        const mainHornCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(0, 0.08 * hScale, 0.36 * hScale),
          new THREE2.Vector3(0, 0.28 * hScale, 0.58 * hScale),
          new THREE2.Vector3(0, 0.56 * hScale, 0.64 * hScale)
        ]);
        const mainHornGeo = trackGeo(
          new THREE2.TubeGeometry(mainHornCurve, seg(12, 8), 0.075 * hScale, seg(10, 8), false)
        );
        const rearHornGeo = trackGeo(
          new THREE2.ConeGeometry(0.065 * hScale, 0.28 * hScale, seg(10, 8))
        );
        const rearHorn = new THREE2.Mesh(rearHornGeo, ivoryFangMat);
        rearHorn.position.set(0, 0.22 * hScale, 0.22 * hScale);
        rearHorn.rotation.x = 0.25;
        headGroup.add(new THREE2.Mesh(mainHornGeo, ivoryFangMat), rearHorn);
      }
      if (arch === "elite_great_antler_moose" || arch === "elite_wendigo_antler_fiend") {
        for (const side of [-1, 1]) {
          const palmGeo = trackGeo(
            new THREE2.BoxGeometry(0.46 * hScale, 0.28 * hScale, 0.06 * hScale),
            0.015
          );
          const palmMesh = new THREE2.Mesh(palmGeo, ivoryFangMat);
          palmMesh.position.set(side * 0.36 * hScale, 0.34 * hScale, -0.04 * hScale);
          palmMesh.rotation.z = -side * 0.38;
          palmMesh.rotation.y = side * 0.24;
          headGroup.add(palmMesh);
          for (let t = 0; t < 4; t++) {
            const tineGeo = trackGeo(
              new THREE2.ConeGeometry(0.032 * hScale, 0.32 * hScale, seg(8, 6))
            );
            const tineMesh = new THREE2.Mesh(tineGeo, ivoryFangMat);
            tineMesh.position.set(
              side * (0.24 + t * 0.1) * hScale,
              (0.52 + t % 2 * 0.08) * hScale,
              (-0.08 + t * 0.05) * hScale
            );
            tineMesh.rotation.z = -side * (0.2 + t * 0.12);
            headGroup.add(tineMesh);
          }
        }
        if (arch === "elite_wendigo_antler_fiend") {
          for (const side of [-1, 1]) {
            for (let r = 0; r < 5; r++) {
              const wRibCurve = new THREE2.CatmullRomCurve3([
                new THREE2.Vector3(side * 0.05, (0.35 + r * 0.14) * torsoHeight, -0.14 * m.torsoBulk),
                new THREE2.Vector3(
                  side * 0.34 * m.torsoBulk,
                  (0.33 + r * 0.14) * torsoHeight,
                  0.08 * m.torsoBulk
                ),
                new THREE2.Vector3(
                  side * 0.1 * m.torsoBulk,
                  (0.29 + r * 0.14) * torsoHeight,
                  0.28 * m.torsoBulk
                )
              ]);
              const wRibGeo = trackGeo(
                new THREE2.TubeGeometry(wRibCurve, seg(10, 8), 0.028 * m.torsoBulk, seg(8, 6), false)
              );
              torsoGroup.add(new THREE2.Mesh(wRibGeo, ivoryFangMat));
            }
          }
        }
      }
      if (arch === "elite_three_tailed_kitsune_fox") {
        for (const side of [-1, 1]) {
          const kTailCurve = new THREE2.CatmullRomCurve3([
            new THREE2.Vector3(side * 0.08, 0.02, -0.05),
            new THREE2.Vector3(side * 0.36, 0.24, -0.45),
            new THREE2.Vector3(side * 0.62, 0.56, -0.88),
            new THREE2.Vector3(side * 0.74, 0.85, -1.12)
          ]);
          const kTailGeo = trackGeo(
            new THREE2.TubeGeometry(kTailCurve, seg(16, 12), 0.14 * m.torsoBulk, seg(12, 8), false),
            0.02
          );
          tailGroup.add(new THREE2.Mesh(kTailGeo, primaryArmorMat));
        }
      }
      if (arch === "elite_frilled_venom_basilisk" || arch === "elite_hooded_king_cobra") {
        const frillGeo = trackGeo(
          new THREE2.CylinderGeometry(
            0.54 * hScale,
            0.18 * hScale,
            0.14 * hScale,
            seg(16, 12),
            1,
            true
          ),
          0.015
        );
        frillGeo.scale(1.25, 1, 0.55);
        const frillMesh = new THREE2.Mesh(frillGeo, secondaryTrimMat);
        frillMesh.position.set(0, 0.12 * hScale, -0.06 * hScale);
        frillMesh.rotation.x = Math.PI * 0.42;
        headGroup.add(frillMesh);
      }
      if (arch === "elite_casqued_chameleon_stalker") {
        const casqueGeo = trackGeo(
          new THREE2.ConeGeometry(0.24 * hScale, 0.52 * hScale, seg(10, 8)),
          0.015
        );
        const casqueMesh = new THREE2.Mesh(casqueGeo, primaryArmorMat);
        casqueMesh.position.set(0, 0.38 * hScale, -0.14 * hScale);
        casqueMesh.rotation.x = -0.48;
        headGroup.add(casqueMesh);
        for (const hOff of [-0.11, 0, 0.11]) {
          const cHornGeo = trackGeo(
            new THREE2.ConeGeometry(0.032 * hScale, 0.36 * hScale, seg(8, 6))
          );
          cHornGeo.rotateX(Math.PI * 0.46);
          const cHorn = new THREE2.Mesh(cHornGeo, ivoryFangMat);
          cHorn.position.set(
            hOff * hScale,
            (hOff === 0 ? 0.04 : 0.12) * hScale,
            0.42 * hScale
          );
          headGroup.add(cHorn);
        }
      }
      if (arch === "elite_snapping_chelonian_tortoise" || arch === "elite_armored_pangolin_roller") {
        const shellGeo = trackGeo(
          new THREE2.SphereGeometry(
            0.56 * m.torsoBulk,
            seg(18, 12),
            seg(12, 8),
            0,
            Math.PI * 2,
            0,
            Math.PI * 0.58
          ),
          0.02
        );
        shellGeo.scale(1.08 * m.shoulderWidth, 0.82, 1.38);
        const shellMesh = new THREE2.Mesh(shellGeo, secondaryTrimMat);
        shellMesh.position.set(0, 0.12 * m.torsoBulk, 0.12);
        torsoGroup.add(shellMesh);
      }
      if (arch === "elite_clubtail_ankylo_drake") {
        const clubGeo = trackGeo(
          new THREE2.SphereGeometry(0.24 * m.torsoBulk, seg(14, 10), seg(12, 8)),
          0.02
        );
        clubGeo.scale(1.35, 0.78, 1.15);
        const clubMesh = new THREE2.Mesh(clubGeo, secondaryTrimMat);
        tailTipBone.add(clubMesh);
        for (const side of [-1, 1]) {
          const cSpikeGeo = trackGeo(
            new THREE2.ConeGeometry(0.07 * m.torsoBulk, 0.26 * m.torsoBulk, seg(8, 6))
          );
          cSpikeGeo.rotateZ(-side * Math.PI * 0.5);
          const cSpike = new THREE2.Mesh(cSpikeGeo, ivoryFangMat);
          cSpike.position.set(side * 0.28 * m.torsoBulk, 0, 0);
          tailTipBone.add(cSpike);
        }
      }
      if (arch === "elite_abyssal_angler_lurker") {
        const lureCurve = new THREE2.CatmullRomCurve3([
          new THREE2.Vector3(0, 0.22 * hScale, 0.12 * hScale),
          new THREE2.Vector3(0, 0.55 * hScale, 0.38 * hScale),
          new THREE2.Vector3(0, 0.42 * hScale, 0.68 * hScale)
        ]);
        const lureGeo = trackGeo(
          new THREE2.TubeGeometry(lureCurve, seg(14, 10), 0.024 * hScale, seg(8, 6), false)
        );
        const escaGeo = trackGeo(
          new THREE2.SphereGeometry(0.095 * hScale, seg(12, 8), seg(10, 8))
        );
        const escaMesh = new THREE2.Mesh(escaGeo, emissiveRuneMat);
        escaMesh.position.set(0, 0.42 * hScale, 0.68 * hScale);
        headGroup.add(new THREE2.Mesh(lureGeo, secondaryTrimMat), escaMesh);
      }
      if (arch === "elite_spitting_salamander_drake") {
        for (const side of [-1, 1]) {
          for (let g = 0; g < 3; g++) {
            const gillGeo = trackGeo(
              new THREE2.ConeGeometry(0.038 * hScale, 0.28 * hScale, seg(8, 6))
            );
            const gillMesh = new THREE2.Mesh(gillGeo, emissiveRuneMat);
            gillMesh.position.set(
              side * 0.26 * hScale,
              (0.04 + g * 0.08) * hScale,
              -0.08 * hScale
            );
            gillMesh.rotation.z = -side * (0.85 + g * 0.18);
            headGroup.add(gillMesh);
          }
        }
      }
      if (arch === "elite_four_armed_bone_reaver") {
        for (const side of [-1, 1]) {
          const subShoulderPos = new THREE2.Vector3(
            side * 0.34 * m.torsoBulk * m.shoulderWidth,
            torsoHeight * 0.48,
            0.02
          );
          const subElbowPos = new THREE2.Vector3(
            side * 0.56 * m.torsoBulk * m.shoulderWidth,
            torsoHeight * 0.28,
            0.14
          );
          const subWristPos = new THREE2.Vector3(
            side * 0.48 * m.torsoBulk * m.shoulderWidth,
            torsoHeight * 0.12,
            0.42
          );
          const humHeadGeo = trackGeo(
            new THREE2.SphereGeometry(0.068 * lThick, seg(10, 8), seg(8, 6)),
            6e-3
          );
          const humHead = new THREE2.Mesh(humHeadGeo, ivoryFangMat);
          humHead.position.copy(subShoulderPos);
          torsoGroup.add(humHead);
          const humCurve = new THREE2.CatmullRomCurve3([subShoulderPos, subElbowPos]);
          const humGeo = trackGeo(
            new THREE2.TubeGeometry(humCurve, seg(10, 8), 0.044 * lThick, seg(8, 6), false),
            5e-3
          );
          torsoGroup.add(new THREE2.Mesh(humGeo, ivoryFangMat));
          const elbowJointGeo = trackGeo(
            new THREE2.SphereGeometry(0.058 * lThick, seg(10, 8), seg(8, 6)),
            5e-3
          );
          elbowJointGeo.scale(1.3, 0.9, 1);
          const elbowJoint = new THREE2.Mesh(elbowJointGeo, ivoryFangMat);
          elbowJoint.position.copy(subElbowPos);
          torsoGroup.add(elbowJoint);
          for (const boneOff of [-1, 1]) {
            const forearmMid = subElbowPos.clone().lerp(subWristPos, 0.5).add(new THREE2.Vector3(side * boneOff * 0.028 * lThick, boneOff * 0.018, 0));
            const radUlnaCurve = new THREE2.CatmullRomCurve3([
              subElbowPos.clone().add(new THREE2.Vector3(side * boneOff * 0.02, 0, 0)),
              forearmMid,
              subWristPos.clone().add(new THREE2.Vector3(side * boneOff * 0.022, 0, 0))
            ]);
            const radUlnaGeo = trackGeo(
              new THREE2.TubeGeometry(radUlnaCurve, seg(10, 8), 0.026 * lThick, seg(8, 6), false),
              4e-3
            );
            torsoGroup.add(new THREE2.Mesh(radUlnaGeo, ivoryFangMat));
          }
          const carpalGeo = trackGeo(
            new THREE2.SphereGeometry(0.048 * lThick, seg(8, 6), seg(8, 6)),
            4e-3
          );
          carpalGeo.scale(1.2, 0.65, 1);
          const carpalMesh = new THREE2.Mesh(carpalGeo, ivoryFangMat);
          carpalMesh.position.copy(subWristPos);
          torsoGroup.add(carpalMesh);
          for (let f = 0; f < 5; f++) {
            const fFrac = (f - 2) * 0.026 * lThick;
            const fStart = subWristPos.clone().add(new THREE2.Vector3(fFrac, -0.01, 0.03));
            const fMid = fStart.clone().add(new THREE2.Vector3(fFrac * 0.6, -0.05, 0.08));
            const fTip = fMid.clone().add(new THREE2.Vector3(0, -0.07, 0.05));
            const fingerCurve = new THREE2.CatmullRomCurve3([fStart, fMid, fTip]);
            const fingerGeo = trackGeo(
              new THREE2.TubeGeometry(fingerCurve, 6, 0.011 * lThick, 6, false),
              2e-3
            );
            torsoGroup.add(new THREE2.Mesh(fingerGeo, ivoryFangMat));
          }
        }
      }
      if (arch === "elite_twin_skull_ettin_skeleton") {
        const subSkullGroup = new THREE2.Group();
        subSkullGroup.position.set(
          -0.28 * m.torsoBulk * m.shoulderWidth,
          torsoHeight + 0.14,
          0.08
        );
        subSkullGroup.rotation.set(0.06, -0.28, 0.16);
        torsoGroup.add(subSkullGroup);
        const subCraniumGeo = trackGeo(
          new THREE2.SphereGeometry(0.18 * hScale, seg(14, 10), seg(12, 8)),
          0.01
        );
        subCraniumGeo.scale(0.92, 1.06, 1.12);
        subSkullGroup.add(new THREE2.Mesh(subCraniumGeo, ivoryFangMat));
        const subJawGeo = trackGeo(
          new THREE2.BoxGeometry(0.18 * hScale, 0.09 * hScale, 0.18 * hScale),
          6e-3
        );
        const subJaw = new THREE2.Mesh(subJawGeo, ivoryFangMat);
        subJaw.position.set(0, -0.14 * hScale, 0.08 * hScale);
        subSkullGroup.add(subJaw);
        for (const sSide of [-1, 1]) {
          const subEyeGeo = trackGeo(new THREE2.SphereGeometry(0.032 * hScale, 8, 6));
          const subEye = new THREE2.Mesh(subEyeGeo, emissiveRuneMat);
          subEye.position.set(sSide * 0.068 * hScale, -0.02 * hScale, 0.16 * hScale);
          subSkullGroup.add(subEye);
        }
        const subCrownGeo = trackGeo(
          new THREE2.CylinderGeometry(0.16 * hScale, 0.15 * hScale, 0.09 * hScale, 12, 1, true),
          4e-3
        );
        const subCrown = new THREE2.Mesh(subCrownGeo, secondaryTrimMat);
        subCrown.position.set(0, 0.16 * hScale, 0.02 * hScale);
        subSkullGroup.add(subCrown);
      }
      if (arch === "elite_caged_rib_jailer_skeleton") {
        for (let b = 0; b < 3; b++) {
          const cageRingGeo = trackGeo(
            new THREE2.TorusGeometry(
              0.42 * m.torsoBulk * m.shoulderWidth,
              0.028 * m.torsoBulk,
              seg(8, 6),
              seg(20, 14)
            )
          );
          const cageRing = new THREE2.Mesh(cageRingGeo, secondaryTrimMat);
          cageRing.position.set(0, (0.35 + b * 0.24) * torsoHeight, 0.04);
          cageRing.rotation.x = Math.PI * 0.5;
          torsoGroup.add(cageRing);
        }
      } else if (arch === "elite_spiked_wheel_bone_martyr") {
        const wheelGeo = trackGeo(
          new THREE2.TorusGeometry(0.68 * m.torsoBulk, 0.055 * m.torsoBulk, seg(10, 8), seg(24, 16))
        );
        const wheelMesh = new THREE2.Mesh(wheelGeo, secondaryTrimMat);
        wheelMesh.position.set(0, torsoHeight * 0.72, -0.22 * m.torsoBulk);
        torsoGroup.add(wheelMesh);
        for (let sp = 0; sp < 8; sp++) {
          const ang = sp / 8 * Math.PI * 2;
          const spokeGeo = trackGeo(
            new THREE2.CylinderGeometry(0.022 * m.torsoBulk, 0.022 * m.torsoBulk, 1.36 * m.torsoBulk, 6)
          );
          const spoke = new THREE2.Mesh(spokeGeo, ivoryFangMat);
          spoke.position.set(0, torsoHeight * 0.72, -0.22 * m.torsoBulk);
          spoke.rotation.z = ang;
          torsoGroup.add(spoke);
        }
      }
      if (arch === "elite_fungal_myconid_colossus") {
        const capGeo = trackGeo(
          new THREE2.ConeGeometry(0.62 * hScale, 0.38 * hScale, seg(18, 12)),
          0.02
        );
        const capMesh = new THREE2.Mesh(capGeo, secondaryTrimMat);
        capMesh.position.set(0, 0.36 * hScale, 0);
        headGroup.add(capMesh);
      }
      if (arch === "wow_murloc_tidehunter") {
        for (const side of [-1, 1]) {
          const bulbEyeGeo = trackGeo(
            new THREE2.SphereGeometry(0.088 * hScale, seg(12, 8), seg(10, 8)),
            5e-3
          );
          const bulbEye = new THREE2.Mesh(bulbEyeGeo, emissiveRuneMat);
          bulbEye.position.set(side * 0.14 * hScale, 0.16 * hScale, 0.16 * hScale);
          headGroup.add(bulbEye);
        }
        for (let f = 0; f < 6; f++) {
          const u = f / 5;
          const finGeo = trackGeo(
            new THREE2.ConeGeometry(0.045 * m.torsoBulk, (0.34 - u * 0.1) * m.dorsalScale, 6),
            6e-3
          );
          const finMesh = new THREE2.Mesh(finGeo, secondaryTrimMat);
          finMesh.position.set(0, (0.88 - u * 0.62) * torsoHeight, -0.22 * m.torsoBulk);
          finMesh.rotation.x = -0.82 - u * 0.25;
          torsoGroup.add(finMesh);
        }
      } else if (arch === "wow_kobold_candle_geomancer") {
        const candleGeo = trackGeo(
          new THREE2.CylinderGeometry(0.065 * hScale, 0.082 * hScale, 0.34 * hScale, seg(12, 8)),
          8e-3
        );
        const candleMesh = new THREE2.Mesh(candleGeo, ivoryFangMat);
        candleMesh.position.set(0, 0.34 * hScale, 0.02 * hScale);
        headGroup.add(candleMesh);
        const flameGeo = trackGeo(
          new THREE2.ConeGeometry(0.068 * hScale, 0.22 * hScale, seg(10, 8)),
          5e-3
        );
        const flameMesh = new THREE2.Mesh(flameGeo, emissiveRuneMat);
        flameMesh.position.set(0, 0.6 * hScale, 0.02 * hScale);
        headGroup.add(flameMesh);
      } else if (arch === "wow_tauren_cairne_chieftain") {
        const totemTrunkGeo = trackGeo(
          new THREE2.CylinderGeometry(
            0.16 * m.torsoBulk,
            0.19 * m.torsoBulk,
            1.45 * m.heightScale,
            seg(14, 10)
          ),
          0.015
        );
        const totemTrunk = new THREE2.Mesh(totemTrunkGeo, secondaryTrimMat);
        totemTrunk.position.set(0, torsoHeight * 0.65, -0.34 * m.torsoBulk);
        torsoGroup.add(totemTrunk);
        const totemCrossGeo = trackGeo(
          new THREE2.BoxGeometry(0.96 * m.shoulderWidth, 0.16 * m.torsoBulk, 0.16 * m.torsoBulk),
          0.01
        );
        const totemCross = new THREE2.Mesh(totemCrossGeo, primaryArmorMat);
        totemCross.position.set(0, torsoHeight * 1.18, -0.34 * m.torsoBulk);
        torsoGroup.add(totemCross);
      } else if (arch === "wow_orc_warsong_blademaster") {
        const poleGeo = trackGeo(
          new THREE2.CylinderGeometry(0.026, 0.032, 1.65 * m.heightScale, 8),
          4e-3
        );
        const poleMesh = new THREE2.Mesh(poleGeo, ivoryFangMat);
        poleMesh.position.set(0, torsoHeight * 0.92, -0.28 * m.torsoBulk);
        torsoGroup.add(poleMesh);
        const bannerGeo = trackGeo(
          new THREE2.BoxGeometry(0.46 * m.dorsalScale, 0.78 * m.heightScale, 0.024),
          8e-3
        );
        const bannerMesh = new THREE2.Mesh(bannerGeo, secondaryTrimMat);
        bannerMesh.position.set(0.24 * m.dorsalScale, torsoHeight * 1.32, -0.28 * m.torsoBulk);
        torsoGroup.add(bannerMesh);
      } else if (arch === "wow_illidan_betrayer_demonhunter") {
        const blindfoldGeo = trackGeo(
          new THREE2.CylinderGeometry(
            0.245 * hScale,
            0.24 * hScale,
            0.11 * hScale,
            seg(16, 12),
            1,
            true
          ),
          4e-3
        );
        const blindfoldMesh = new THREE2.Mesh(blindfoldGeo, emissiveRuneMat);
        blindfoldMesh.position.set(0, 0.04 * hScale, 0.02 * hScale);
        headGroup.add(blindfoldMesh);
        for (const wSide of [-1, 1]) {
          const glaiveArcGeo = trackGeo(
            new THREE2.TorusGeometry(
              0.58 * m.weaponScale,
              0.048 * m.weaponScale,
              seg(8, 6),
              seg(20, 14),
              Math.PI * 1.15
            ),
            6e-3
          );
          glaiveArcGeo.scale(0.55, 1.25, 0.28);
          const glaiveBlade = new THREE2.Mesh(glaiveArcGeo, emissiveRuneMat);
          glaiveBlade.rotation.y = Math.PI * 0.5;
          glaiveBlade.rotation.z = -Math.PI * 0.55;
          if (wSide === 1) {
            weaponGroup.add(glaiveBlade);
          } else {
            offhandGroup.add(glaiveBlade);
          }
        }
      } else if (arch === "wow_arthas_lich_king") {
        for (let sp = -2; sp <= 2; sp++) {
          const isCenter = sp === 0;
          const spireH = (isCenter ? 0.56 : 0.38 - Math.abs(sp) * 0.06) * hScale;
          const spireGeo = trackGeo(
            new THREE2.ConeGeometry(0.042 * hScale, spireH, 6),
            4e-3
          );
          const spireMesh = new THREE2.Mesh(spireGeo, secondaryTrimMat);
          const ang = sp * 0.36;
          spireMesh.position.set(
            Math.sin(ang) * 0.21 * hScale,
            0.26 * hScale + spireH * 0.42,
            Math.cos(ang) * 0.21 * hScale
          );
          headGroup.add(spireMesh);
        }
      } else if (arch === "wow_forsaken_royal_apothecary") {
        for (const side of [-1, 1]) {
          const tankGeo = trackGeo(
            new THREE2.CylinderGeometry(
              0.11 * m.torsoBulk,
              0.11 * m.torsoBulk,
              0.62 * m.heightScale,
              seg(12, 8)
            ),
            6e-3
          );
          const tankMesh = new THREE2.Mesh(tankGeo, emissiveRuneMat);
          tankMesh.position.set(
            side * 0.16 * m.torsoBulk,
            torsoHeight * 0.62,
            -0.24 * m.torsoBulk
          );
          torsoGroup.add(tankMesh);
        }
      } else if (arch === "wow_shivarra_sixblade_priestess" || arch === "wow_lady_vashj_coilfang_matron") {
        for (const side of [-1, 1]) {
          for (let pair = 0; pair < 2; pair++) {
            const yOff = torsoHeight * (0.66 - pair * 0.22);
            const armCurve = new THREE2.CatmullRomCurve3([
              new THREE2.Vector3(side * 0.28 * m.torsoBulk, yOff, 0),
              new THREE2.Vector3(
                side * (0.62 + pair * 0.12) * m.torsoBulk,
                yOff - 0.12,
                0.16
              ),
              new THREE2.Vector3(
                side * (0.78 + pair * 0.14) * m.torsoBulk,
                yOff + 0.08,
                0.42
              )
            ]);
            const extraArmGeo = trackGeo(
              new THREE2.TubeGeometry(armCurve, seg(12, 8), 0.058 * m.torsoBulk, seg(8, 6), false),
              8e-3
            );
            torsoGroup.add(new THREE2.Mesh(extraArmGeo, primaryArmorMat));
            const extraBladeGeo = trackGeo(
              new THREE2.ConeGeometry(0.038 * m.weaponScale, 0.52 * m.weaponScale, 6),
              4e-3
            );
            extraBladeGeo.rotateX(Math.PI * 0.35);
            const extraBlade = new THREE2.Mesh(extraBladeGeo, secondaryTrimMat);
            extraBlade.position.set(
              side * (0.8 + pair * 0.14) * m.torsoBulk,
              yOff + 0.18,
              0.58
            );
            torsoGroup.add(extraBlade);
          }
        }
      } else if (arch === "wow_goblin_steamwheedle_shredder" || arch === "wow_fel_reaver_construct") {
        for (const side of [-1, 1]) {
          const pipeGeo = trackGeo(
            new THREE2.CylinderGeometry(
              0.068 * m.torsoBulk,
              0.055 * m.torsoBulk,
              0.68 * m.heightScale,
              10
            ),
            5e-3
          );
          const pipeMesh = new THREE2.Mesh(pipeGeo, secondaryTrimMat);
          pipeMesh.position.set(
            side * 0.24 * m.torsoBulk,
            torsoHeight * 0.88,
            -0.26 * m.torsoBulk
          );
          pipeMesh.rotation.x = -0.22;
          torsoGroup.add(pipeMesh);
        }
        const sawDiscGeo = trackGeo(
          new THREE2.CylinderGeometry(0.38 * m.weaponScale, 0.38 * m.weaponScale, 0.035, 18),
          6e-3
        );
        sawDiscGeo.rotateZ(Math.PI * 0.5);
        const sawDisc = new THREE2.Mesh(sawDiscGeo, secondaryTrimMat);
        sawDisc.position.set(0, -0.18, 0.32);
        weaponGroup.add(sawDisc);
      } else if (arch === "wow_kodo_ancient_warbeast") {
        for (const side of [-1, 1]) {
          const drumGeo = trackGeo(
            new THREE2.CylinderGeometry(
              0.24 * m.torsoBulk,
              0.22 * m.torsoBulk,
              0.32 * m.torsoBulk,
              seg(14, 10)
            ),
            8e-3
          );
          drumGeo.rotateZ(Math.PI * 0.5);
          const drumMesh = new THREE2.Mesh(drumGeo, secondaryTrimMat);
          drumMesh.position.set(side * 0.42 * m.torsoBulk, 0.24, -0.12);
          pelvisGroup.add(drumMesh);
        }
        const kodoHornGeo = trackGeo(
          new THREE2.ConeGeometry(0.095 * hScale, 0.52 * hScale, seg(10, 8)),
          8e-3
        );
        kodoHornGeo.rotateX(Math.PI * 0.32);
        const kodoHorn = new THREE2.Mesh(kodoHornGeo, ivoryFangMat);
        kodoHorn.position.set(0, 0.14 * hScale, (0.24 + m.snoutLength * 0.24) * hScale);
        headGroup.add(kodoHorn);
      } else if (arch === "wow_faceless_kthir_general") {
        for (let ten = -2; ten <= 2; ten++) {
          const tCurve = new THREE2.CatmullRomCurve3([
            new THREE2.Vector3(ten * 0.055 * hScale, -0.06 * hScale, 0.18 * hScale),
            new THREE2.Vector3(ten * 0.085 * hScale, -0.26 * hScale, 0.28 * hScale),
            new THREE2.Vector3(ten * 0.065 * hScale, -0.46 * hScale, 0.16 * hScale)
          ]);
          const tGeo = trackGeo(
            new THREE2.TubeGeometry(tCurve, 10, 0.028 * hScale, 8, false),
            4e-3
          );
          headGroup.add(new THREE2.Mesh(tGeo, secondaryTrimMat));
        }
      }
    }
    exportableGroup.updateMatrixWorld(true);
    const bones = [];
    const boneToIndex = /* @__PURE__ */ new Map();
    rootBone.traverse((obj) => {
      if (obj.isBone) {
        const b = obj;
        boneToIndex.set(b, bones.length);
        bones.push(b);
      }
    });
    const boneWorldPos = bones.map((b) => {
      b.userData.bindPos = b.position.clone();
      b.userData.bindQuat = b.quaternion.clone();
      b.userData.bindScale = b.scale.clone();
      return new THREE2.Vector3().setFromMatrixPosition(b.matrixWorld);
    });
    const neighborJoints = bones.map(() => []);
    const pelvisIdx = (_a = boneToIndex.get(pelvisGroup)) != null ? _a : 0;
    const torsoIdx = (_b = boneToIndex.get(torsoGroup)) != null ? _b : 0;
    const tailBaseIdx = (_c = boneToIndex.get(tailGroup)) != null ? _c : 0;
    const tailTipIdx = (_d = boneToIndex.get(tailTipBone)) != null ? _d : 0;
    for (let bIdx = 0; bIdx < bones.length; bIdx++) {
      const b = bones[bIdx];
      if (b === rootBone) continue;
      let anatomicalParent = null;
      if (b === leftLegGroup || b === rightLegGroup) {
        anatomicalParent = pelvisGroup;
      } else if (isQuadruped && !isCentaur && (b === leftArmGroup || b === rightArmGroup)) {
        anatomicalParent = torsoGroup;
      } else if (b.parent && b.parent.isBone && b.parent !== rootBone) {
        anatomicalParent = b.parent;
      }
      if (anatomicalParent) {
        const pIdx = boneToIndex.get(anatomicalParent);
        if (pIdx !== void 0 && pIdx !== bIdx) {
          const jPos = boneWorldPos[bIdx];
          const rad = Math.max(0.28, 0.42 * m.torsoBulk);
          neighborJoints[bIdx].push({ boneIdx: pIdx, jointPos: jPos, radius: rad });
          neighborJoints[pIdx].push({ boneIdx: bIdx, jointPos: jPos, radius: rad });
        }
      }
      if (b === leftArmGroup || b === rightArmGroup) {
        const shBone = b === leftArmGroup ? leftShoulderGroup : rightShoulderGroup;
        const shIdx = boneToIndex.get(shBone);
        if (shIdx !== void 0 && shIdx !== bIdx) {
          const jPos = boneWorldPos[bIdx];
          const rad = Math.max(0.26, 0.38 * m.torsoBulk);
          neighborJoints[bIdx].push({ boneIdx: shIdx, jointPos: jPos, radius: rad });
          neighborJoints[shIdx].push({ boneIdx: bIdx, jointPos: jPos, radius: rad });
        }
      }
    }
    const excludedAncestors = /* @__PURE__ */ new Set([
      weaponGroup,
      offhandGroup,
      coreMesh,
      breathConeMesh
    ]);
    const isExcludedMesh = (obj) => {
      let cur = obj;
      while (cur) {
        if (excludedAncestors.has(cur)) return true;
        cur = cur.parent;
      }
      return false;
    };
    const findHomeBone = (obj) => {
      let cur = obj.parent;
      while (cur) {
        if (cur.isBone) return cur;
        cur = cur.parent;
      }
      return pelvisGroup;
    };
    const explodedSourceMeshes = [];
    const matChunksMap = /* @__PURE__ */ new Map();
    const _vPos = new THREE2.Vector3();
    rootBone.traverse((obj) => {
      var _a2;
      const mesh = obj;
      if (!mesh.isMesh || !mesh.geometry || isExcludedMesh(mesh)) return;
      const homeBone = findHomeBone(mesh);
      const homeBoneIdx = (_a2 = boneToIndex.get(homeBone)) != null ? _a2 : pelvisIdx;
      const chunkGeo = mesh.geometry.clone();
      if (!chunkGeo.getAttribute("normal")) {
        chunkGeo.computeVertexNormals();
      }
      chunkGeo.applyMatrix4(mesh.matrixWorld);
      const posAttr = chunkGeo.getAttribute("position");
      const vCount = posAttr.count;
      if (!chunkGeo.getAttribute("uv")) {
        chunkGeo.setAttribute("uv", new THREE2.BufferAttribute(new Float32Array(vCount * 2), 2));
      }
      if (!chunkGeo.getAttribute("color")) {
        const fallbackColors = new Float32Array(vCount * 3);
        fallbackColors.fill(1);
        chunkGeo.setAttribute("color", new THREE2.BufferAttribute(fallbackColors, 3));
      }
      const skinIndices = new Uint16Array(vCount * 4);
      const skinWeights = new Float32Array(vCount * 4);
      const isTailMesh = homeBone === tailGroup || homeBone === tailTipBone;
      const tailRootPos = boneWorldPos[tailBaseIdx];
      const tailSpan = Math.max(0.28, tailRootPos.distanceTo(boneWorldPos[tailTipIdx]) * 1.9);
      const nList = neighborJoints[homeBoneIdx];
      for (let v = 0; v < vCount; v++) {
        _vPos.set(posAttr.getX(v), posAttr.getY(v), posAttr.getZ(v));
        if (isTailMesh) {
          const u = Math.min(1, Math.max(0, _vPos.distanceTo(tailRootPos) / tailSpan));
          const wPelvis = Math.max(0, 0.46 * (1 - u * 3.1));
          const wBase = Math.max(0.08, 1 - Math.abs(u - 0.34) * 1.6);
          const wTip = Math.max(0, (u - 0.2) * 1.4);
          const sum = wPelvis + wBase + wTip;
          skinIndices[v * 4] = tailBaseIdx;
          skinIndices[v * 4 + 1] = tailTipIdx;
          skinIndices[v * 4 + 2] = pelvisIdx;
          skinIndices[v * 4 + 3] = 0;
          skinWeights[v * 4] = wBase / sum;
          skinWeights[v * 4 + 1] = wTip / sum;
          skinWeights[v * 4 + 2] = wPelvis / sum;
          skinWeights[v * 4 + 3] = 0;
        } else {
          const wHome = 0.5;
          let b1 = 0, w1 = 0;
          let b2 = 0, w2 = 0;
          let b3 = 0, w3 = 0;
          for (let k = 0; k < nList.length; k++) {
            const nj = nList[k];
            const dist = _vPos.distanceTo(nj.jointPos);
            const ratio = dist / nj.radius;
            if (ratio < 2.2) {
              const inf = 0.5 * Math.exp(-ratio * ratio * 2.2);
              if (inf > w1) {
                b3 = b2;
                w3 = w2;
                b2 = b1;
                w2 = w1;
                b1 = nj.boneIdx;
                w1 = inf;
              } else if (inf > w2) {
                b3 = b2;
                w3 = w2;
                b2 = nj.boneIdx;
                w2 = inf;
              } else if (inf > w3) {
                b3 = nj.boneIdx;
                w3 = inf;
              }
            }
          }
          if (isSerpentine && homeBone === pelvisGroup && _vPos.z < -0.15) {
            const serpInf = Math.min(0.75, Math.abs(_vPos.z + 0.15) * 0.85);
            b1 = tailBaseIdx;
            w1 = serpInf;
          }
          const totalW = wHome + w1 + w2 + w3;
          skinIndices[v * 4] = homeBoneIdx;
          skinIndices[v * 4 + 1] = b1;
          skinIndices[v * 4 + 2] = b2;
          skinIndices[v * 4 + 3] = b3;
          skinWeights[v * 4] = wHome / totalW;
          skinWeights[v * 4 + 1] = w1 / totalW;
          skinWeights[v * 4 + 2] = w2 / totalW;
          skinWeights[v * 4 + 3] = w3 / totalW;
        }
      }
      chunkGeo.setAttribute("skinIndex", new THREE2.Uint16BufferAttribute(skinIndices, 4));
      chunkGeo.setAttribute("skinWeight", new THREE2.Float32BufferAttribute(skinWeights, 4));
      const mat = mesh.material;
      const list = matChunksMap.get(mat) || [];
      list.push(chunkGeo);
      matChunksMap.set(mat, list);
      mesh.visible = false;
      mesh.userData.isExplodedSourceMesh = true;
      explodedSourceMeshes.push(mesh);
    });
    const mergeSkinnedChunks = (chunks, skipSculptSmoothing = false) => {
      let totalVerts = 0;
      let totalIndices = 0;
      for (let i = 0; i < chunks.length; i++) {
        const c = chunks[i];
        const vCount = c.getAttribute("position").count;
        totalVerts += vCount;
        const idxAttr = c.getIndex();
        totalIndices += idxAttr ? idxAttr.count : vCount;
      }
      const mergedPos = new Float32Array(totalVerts * 3);
      const mergedNorm = new Float32Array(totalVerts * 3);
      const mergedUv = new Float32Array(totalVerts * 2);
      const mergedCol = new Float32Array(totalVerts * 3);
      const mergedSkinIdx = new Uint16Array(totalVerts * 4);
      const mergedSkinW = new Float32Array(totalVerts * 4);
      const mergedIndices = totalVerts > 65535 ? new Uint32Array(totalIndices) : new Uint16Array(totalIndices);
      let vOffset = 0;
      let iOffset = 0;
      for (let i = 0; i < chunks.length; i++) {
        const c = chunks[i];
        const count = c.getAttribute("position").count;
        mergedPos.set(c.getAttribute("position").array, vOffset * 3);
        mergedNorm.set(c.getAttribute("normal").array, vOffset * 3);
        mergedUv.set(c.getAttribute("uv").array, vOffset * 2);
        mergedCol.set(c.getAttribute("color").array, vOffset * 3);
        mergedSkinIdx.set(c.getAttribute("skinIndex").array, vOffset * 4);
        mergedSkinW.set(c.getAttribute("skinWeight").array, vOffset * 4);
        const idxAttr = c.getIndex();
        if (idxAttr) {
          const idxArr = idxAttr.array;
          for (let k = 0; k < idxAttr.count; k++) {
            mergedIndices[iOffset + k] = idxArr[k] + vOffset;
          }
          iOffset += idxAttr.count;
        } else {
          for (let k = 0; k < count; k++) {
            mergedIndices[iOffset + k] = vOffset + k;
          }
          iOffset += count;
        }
        vOffset += count;
        c.dispose();
      }
      const out = new THREE2.BufferGeometry();
      out.setIndex(new THREE2.BufferAttribute(mergedIndices, 1));
      out.setAttribute("position", new THREE2.BufferAttribute(mergedPos, 3));
      out.setAttribute("normal", new THREE2.BufferAttribute(mergedNorm, 3));
      out.setAttribute("uv", new THREE2.BufferAttribute(mergedUv, 2));
      out.setAttribute("color", new THREE2.BufferAttribute(mergedCol, 3));
      out.setAttribute("skinIndex", new THREE2.Uint16BufferAttribute(mergedSkinIdx, 4));
      out.setAttribute("skinWeight", new THREE2.Float32BufferAttribute(mergedSkinW, 4));
      if (!skipSculptSmoothing) {
        applyBlenderStyleSculptSmoothing(out, 2);
      }
      out.computeBoundingBox();
      out.computeBoundingSphere();
      return out;
    };
    function applyBlenderStyleSculptSmoothing(geo, iterations = 2) {
      const posAttr = geo.getAttribute("position");
      const normAttr = geo.getAttribute("normal");
      const idxAttr = geo.getIndex();
      if (!posAttr || !idxAttr || posAttr.count === 0) return;
      const vCount = posAttr.count;
      const posArr = posAttr.array;
      const indices = idxAttr.array;
      const quantScale = 400;
      const clusterMap = /* @__PURE__ */ new Map();
      const vertToCluster = new Int32Array(vCount);
      const clusterVerts = [];
      const clusterPos = [];
      for (let v = 0; v < vCount; v++) {
        const x = posArr[v * 3];
        const y = posArr[v * 3 + 1];
        const z = posArr[v * 3 + 2];
        const key = `${Math.round(x * quantScale)},${Math.round(y * quantScale)},${Math.round(z * quantScale)}`;
        let cIdx = clusterMap.get(key);
        if (cIdx === void 0) {
          cIdx = clusterVerts.length;
          clusterMap.set(key, cIdx);
          clusterVerts.push([v]);
          clusterPos.push(x, y, z);
        } else {
          clusterVerts[cIdx].push(v);
        }
        vertToCluster[v] = cIdx;
      }
      const cCount = clusterVerts.length;
      const neighbors = Array.from({ length: cCount }, () => /* @__PURE__ */ new Set());
      for (let i = 0; i < indices.length; i += 3) {
        const c0 = vertToCluster[indices[i]];
        const c1 = vertToCluster[indices[i + 1]];
        const c2 = vertToCluster[indices[i + 2]];
        if (c0 !== c1) {
          neighbors[c0].add(c1);
          neighbors[c1].add(c0);
        }
        if (c1 !== c2) {
          neighbors[c1].add(c2);
          neighbors[c2].add(c1);
        }
        if (c2 !== c0) {
          neighbors[c2].add(c0);
          neighbors[c0].add(c2);
        }
      }
      const tempPos = new Float32Array(cCount * 3);
      const curPos = new Float32Array(clusterPos);
      const runLaplacianStep = (factor) => {
        tempPos.set(curPos);
        for (let c = 0; c < cCount; c++) {
          const nSet = neighbors[c];
          const deg = nSet.size;
          if (deg < 3) continue;
          let avgX = 0;
          let avgY = 0;
          let avgZ = 0;
          nSet.forEach((nIdx) => {
            avgX += curPos[nIdx * 3];
            avgY += curPos[nIdx * 3 + 1];
            avgZ += curPos[nIdx * 3 + 2];
          });
          avgX /= deg;
          avgY /= deg;
          avgZ /= deg;
          const cx = curPos[c * 3];
          const cy = curPos[c * 3 + 1];
          const cz = curPos[c * 3 + 2];
          const yWeight = cy < 0.035 ? 0.15 : 1;
          tempPos[c * 3] = cx + (avgX - cx) * factor;
          tempPos[c * 3 + 1] = cy + (avgY - cy) * factor * yWeight;
          tempPos[c * 3 + 2] = cz + (avgZ - cz) * factor;
        }
        curPos.set(tempPos);
      };
      for (let iter = 0; iter < iterations; iter++) {
        runLaplacianStep(0.32);
        runLaplacianStep(-0.334);
      }
      for (let c = 0; c < cCount; c++) {
        const cx = curPos[c * 3];
        const cy = curPos[c * 3 + 1];
        const cz = curPos[c * 3 + 2];
        const verts = clusterVerts[c];
        for (let k = 0; k < verts.length; k++) {
          const v = verts[k];
          posArr[v * 3] = cx;
          posArr[v * 3 + 1] = cy;
          posArr[v * 3 + 2] = cz;
        }
      }
      posAttr.needsUpdate = true;
      geo.computeVertexNormals();
      if (normAttr) {
        const normArr = normAttr.array;
        for (let c = 0; c < cCount; c++) {
          const verts = clusterVerts[c];
          if (verts.length <= 1) continue;
          let nx = 0;
          let ny = 0;
          let nz = 0;
          for (let k = 0; k < verts.length; k++) {
            const v = verts[k];
            nx += normArr[v * 3];
            ny += normArr[v * 3 + 1];
            nz += normArr[v * 3 + 2];
          }
          const len = Math.hypot(nx, ny, nz);
          if (len > 1e-6) {
            nx /= len;
            ny /= len;
            nz /= len;
            for (let k = 0; k < verts.length; k++) {
              const v = verts[k];
              normArr[v * 3] = nx;
              normArr[v * 3 + 1] = ny;
              normArr[v * 3 + 2] = nz;
            }
          }
        }
        normAttr.needsUpdate = true;
      }
    }
    function applyBlenderUVScaleDisplacement(geo, textureRelief, torsoBulk) {
      const posAttr = geo.getAttribute("position");
      const normAttr = geo.getAttribute("normal");
      const uvAttr = geo.getAttribute("uv");
      const colAttr = geo.getAttribute("color");
      if (!posAttr || !normAttr || !uvAttr || posAttr.count === 0) return;
      const vCount = posAttr.count;
      const posArr = posAttr.array;
      const normArr = normAttr.array;
      const uvArr = uvAttr.array;
      const colArr = colAttr ? colAttr.array : null;
      const quantScale = 400;
      const clusterMap = /* @__PURE__ */ new Map();
      const clusterVerts = [];
      for (let v = 0; v < vCount; v++) {
        const x = posArr[v * 3];
        const y = posArr[v * 3 + 1];
        const z = posArr[v * 3 + 2];
        const key = `${Math.round(x * quantScale)},${Math.round(y * quantScale)},${Math.round(z * quantScale)}`;
        let cIdx = clusterMap.get(key);
        if (cIdx === void 0) {
          cIdx = clusterVerts.length;
          clusterMap.set(key, cIdx);
          clusterVerts.push([v]);
        } else {
          clusterVerts[cIdx].push(v);
        }
      }
      const dispAmp = 95e-4 * Math.pow(Math.max(0.6, torsoBulk), 0.45) * (0.55 + 0.65 * Math.max(0.3, textureRelief));
      for (let c = 0; c < clusterVerts.length; c++) {
        const verts = clusterVerts[c];
        const v0 = verts[0];
        const cy = posArr[v0 * 3 + 1];
        if (cy < 0.085) continue;
        let avgDisp = 0;
        let avgShade = 0;
        let nx = 0;
        let ny = 0;
        let nz = 0;
        for (let k = 0; k < verts.length; k++) {
          const v = verts[k];
          const uu = uvArr[v * 2];
          const vv = uvArr[v * 2 + 1];
          const sample = evaluateDragonScaleUVField(uu, vv);
          const uFade = Math.min(1, Math.min(uu, 1 - uu) * 14);
          const vFade = Math.min(1, Math.min(vv, 1 - vv) * 10);
          const seamWeight = Math.max(0, uFade * vFade);
          avgDisp += sample.displacement * seamWeight;
          avgShade += 1 + (sample.colorShade - 1) * seamWeight;
          nx += normArr[v * 3];
          ny += normArr[v * 3 + 1];
          nz += normArr[v * 3 + 2];
        }
        avgDisp /= verts.length;
        avgShade /= verts.length;
        const nLen = Math.hypot(nx, ny, nz);
        if (nLen < 1e-6) continue;
        nx /= nLen;
        ny /= nLen;
        nz /= nLen;
        const offset = avgDisp * dispAmp;
        for (let k = 0; k < verts.length; k++) {
          const v = verts[k];
          posArr[v * 3] += nx * offset;
          posArr[v * 3 + 1] += ny * offset;
          posArr[v * 3 + 2] += nz * offset;
          if (colArr) {
            colArr[v * 3] = Math.min(1.35, colArr[v * 3] * avgShade);
            colArr[v * 3 + 1] = Math.min(1.35, colArr[v * 3 + 1] * avgShade);
            colArr[v * 3 + 2] = Math.min(1.35, colArr[v * 3 + 2] * avgShade);
          }
        }
      }
      posAttr.needsUpdate = true;
      if (colAttr) colAttr.needsUpdate = true;
      geo.computeVertexNormals();
      for (let c = 0; c < clusterVerts.length; c++) {
        const verts = clusterVerts[c];
        if (verts.length <= 1) continue;
        let nx = 0, ny = 0, nz = 0;
        for (let k = 0; k < verts.length; k++) {
          const v = verts[k];
          nx += normArr[v * 3];
          ny += normArr[v * 3 + 1];
          nz += normArr[v * 3 + 2];
        }
        const len = Math.hypot(nx, ny, nz);
        if (len > 1e-6) {
          nx /= len;
          ny /= len;
          nz /= len;
          for (let k = 0; k < verts.length; k++) {
            const v = verts[k];
            normArr[v * 3] = nx;
            normArr[v * 3 + 1] = ny;
            normArr[v * 3 + 2] = nz;
          }
        }
      }
      normAttr.needsUpdate = true;
      geo.computeBoundingBox();
      geo.computeBoundingSphere();
    }
    const sharedSkeleton = new THREE2.Skeleton(bones);
    const skinnedMeshGroup = new THREE2.Group();
    skinnedMeshGroup.name = "Unified_SkinnedMesh_Group";
    exportableGroup.add(skinnedMeshGroup);
    const skinnedMeshes = [];
    const resolvePartByPoint = (worldPoint) => {
      var _a2;
      let bestInfo;
      let bestDistSq = Infinity;
      const tmpW = new THREE2.Vector3();
      for (let i = 0; i < explodableParts.length; i++) {
        const p = explodableParts[i];
        const info = (_a2 = p.userData) == null ? void 0 : _a2.partInfo;
        if (!info) continue;
        p.getWorldPosition(tmpW);
        const dSq = tmpW.distanceToSquared(worldPoint);
        if (dSq < bestDistSq) {
          bestDistSq = dSq;
          bestInfo = info;
        }
      }
      return bestInfo;
    };
    const has3DDragonScaleRelief = !isBeholder && !isUndeadSkeleton && (isDragon || isSerpentine || config.raceCategory === "dragons" || getEffectiveTexturePattern(config) === "scales");
    let matIdx = 0;
    let primaryMergedBodyGeo = null;
    let secondaryMergedBodyGeo = null;
    matChunksMap.forEach((chunks, mat) => {
      var _a2;
      if (chunks.length === 0 || mat === hairStrandMat) return;
      const isCrispBoneOrToothMat = mat === ivoryFangMat || mat.name === "Mat_ToothEnamel" || mat.name === "Mat_SculptedCraniumBone" || mat.name === "Mat_SkullSocketVoid";
      const mergedGeo = mergeSkinnedChunks(chunks, isCrispBoneOrToothMat);
      geometriesToDispose.push(mergedGeo);
      if (mat === primaryArmorMat) {
        if (has3DDragonScaleRelief) {
          applyBlenderUVScaleDisplacement(mergedGeo, (_a2 = matCfg.textureRelief) != null ? _a2 : 0.85, m.torsoBulk);
        }
        primaryMergedBodyGeo = mergedGeo;
      }
      if (mat === secondaryTrimMat) secondaryMergedBodyGeo = mergedGeo;
      const sMesh = new THREE2.SkinnedMesh(mergedGeo, mat);
      sMesh.name = `Skinned_Unified_${mat.name || matIdx++}`;
      sMesh.castShadow = true;
      sMesh.receiveShadow = true;
      sMesh.frustumCulled = false;
      sMesh.layers.enable(1);
      sMesh.userData.resolvePartByPoint = resolvePartByPoint;
      sMesh.bind(sharedSkeleton, new THREE2.Matrix4());
      skinnedMeshGroup.add(sMesh);
      skinnedMeshes.push(sMesh);
    });
    if (hairStyle !== "none" && furDensity > 0.05 && !isBeholder) {
      const hairChunks = matChunksMap.get(hairStrandMat) || [];
      const bodyGeosForHair = [];
      if (primaryMergedBodyGeo) bodyGeosForHair.push(primaryMergedBodyGeo);
      if (secondaryMergedBodyGeo) bodyGeosForHair.push(secondaryMergedBodyGeo);
      const allHeadBones = [headGroup];
      for (let eh = 0; eh < extraHeads.length; eh++) {
        extraHeads[eh].traverse((c) => {
          if (c.isBone && c.name.startsWith("Head_Helm_Assembly")) {
            allHeadBones.push(c);
          }
        });
      }
      const strandCoatGeo = buildSkinned3DHairCoatGeometry({
        bodyGeos: bodyGeosForHair,
        hairStyle,
        furDensity,
        hairLength,
        lodMult,
        torsoBulk: m.torsoBulk,
        heightScale: m.heightScale,
        pelvisY,
        headBones: allHeadBones,
        neckIdx: (_e = boneToIndex.get(neckGroup)) != null ? _e : torsoIdx,
        torsoIdx,
        pelvisIdx,
        tailBaseIdx,
        tailTipIdx,
        boneToIndex,
        boneWorldPos
      });
      if (strandCoatGeo) {
        hairChunks.push(strandCoatGeo);
      }
      if (hairChunks.length > 0) {
        const mergedHairGeo = mergeSkinnedChunks(hairChunks, true);
        geometriesToDispose.push(mergedHairGeo);
        const hairSkinnedMesh = new THREE2.SkinnedMesh(mergedHairGeo, hairStrandMat);
        hairSkinnedMesh.name = "Skinned_3D_Hair_Strands_Coat";
        hairSkinnedMesh.castShadow = true;
        hairSkinnedMesh.receiveShadow = true;
        hairSkinnedMesh.frustumCulled = false;
        hairSkinnedMesh.layers.enable(1);
        hairSkinnedMesh.userData.resolvePartByPoint = resolvePartByPoint;
        hairSkinnedMesh.bind(sharedSkeleton, new THREE2.Matrix4());
        skinnedMeshGroup.add(hairSkinnedMesh);
        skinnedMeshes.push(hairSkinnedMesh);
      }
    } else {
      const unusedHairChunks = matChunksMap.get(hairStrandMat);
      if (unusedHairChunks) {
        unusedHairChunks.forEach((c) => c.dispose());
      }
    }
    if (has3DDragonScaleRelief && primaryMergedBodyGeo) {
      const dragonScaleReliefGeo = buildSkinned3DDragonScaleReliefGeometry({
        bodyGeo: primaryMergedBodyGeo,
        lodMult,
        torsoBulk: m.torsoBulk,
        dorsalScale: m.dorsalScale,
        textureRelief: (_f = matCfg.textureRelief) != null ? _f : 0.85,
        isDragon,
        tailBaseIdx,
        tailTipIdx,
        neckIdx: (_g = boneToIndex.get(neckGroup)) != null ? _g : torsoIdx,
        boneWorldPos
      });
      if (dragonScaleReliefGeo) {
        geometriesToDispose.push(dragonScaleReliefGeo);
        const scaleReliefSkinnedMesh = new THREE2.SkinnedMesh(
          dragonScaleReliefGeo,
          primaryArmorMat
        );
        scaleReliefSkinnedMesh.name = "Skinned_3D_Dragon_Scale_Relief";
        scaleReliefSkinnedMesh.castShadow = true;
        scaleReliefSkinnedMesh.receiveShadow = true;
        scaleReliefSkinnedMesh.frustumCulled = false;
        scaleReliefSkinnedMesh.layers.enable(1);
        scaleReliefSkinnedMesh.userData.resolvePartByPoint = resolvePartByPoint;
        scaleReliefSkinnedMesh.bind(sharedSkeleton, new THREE2.Matrix4());
        skinnedMeshGroup.add(scaleReliefSkinnedMesh);
        skinnedMeshes.push(scaleReliefSkinnedMesh);
      }
    }
    const hitboxGroup = new THREE2.Group();
    hitboxGroup.name = "Tactical_Hitboxes_And_Sockets";
    rootGroup.add(hitboxGroup);
    const hitboxWireMat = trackMat(
      new THREE2.MeshBasicMaterial({
        color: 1096065,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
        depthWrite: false
      })
    );
    const headHitboxMat = trackMat(
      new THREE2.MeshBasicMaterial({
        color: 16007006,
        wireframe: true,
        transparent: true,
        opacity: 0.65,
        depthWrite: false
      })
    );
    const torsoColGeo = trackGeo(
      new THREE2.CylinderGeometry(
        config.stats.torsoHitboxRadius,
        config.stats.torsoHitboxRadius,
        config.stats.torsoHitboxHeight,
        12,
        1,
        true
      ),
      0
    );
    const torsoColMesh = new THREE2.Mesh(torsoColGeo, hitboxWireMat);
    torsoColMesh.position.set(0, config.stats.torsoHitboxHeight * 0.5 + 0.25, 0);
    hitboxGroup.add(torsoColMesh);
    const headColGeo = trackGeo(new THREE2.SphereGeometry(config.stats.headHitboxRadius, 10, 8), 0);
    const headColMesh = new THREE2.Mesh(headColGeo, headHitboxMat);
    const headWorldPos = new THREE2.Vector3();
    socketHead.getWorldPosition(headWorldPos);
    headColMesh.position.copy(headWorldPos);
    hitboxGroup.add(headColMesh);
    const rangeRingGeo = trackGeo(
      new THREE2.RingGeometry(
        Math.max(0.5, config.stats.attackRange * 0.35 - 0.04),
        config.stats.attackRange * 0.35,
        36
      ),
      0
    );
    rangeRingGeo.rotateX(-Math.PI / 2);
    const rangeRingMat = trackMat(
      new THREE2.MeshBasicMaterial({
        color: 16096779,
        side: THREE2.DoubleSide,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2
      })
    );
    const rangeRingMesh = new THREE2.Mesh(rangeRingGeo, rangeRingMat);
    rangeRingMesh.position.y = 0.03;
    hitboxGroup.add(rangeRingMesh);
    const PARTICLE_COUNT = isSoftwareGl ? 72 : 160;
    const particleGeo = new THREE2.BufferGeometry();
    geometriesToDispose.push(particleGeo);
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleColors = new Float32Array(PARTICLE_COUNT * 3);
    particleGeo.setAttribute("position", new THREE2.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE2.BufferAttribute(particleColors, 3));
    const smokeMat = trackMat(
      new THREE2.PointsMaterial({
        name: "Mat_Particles_VolcanicSmoke",
        map: textures.particleSmokeMap,
        size: 0.36 * m.heightScale,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.82,
        depthWrite: false,
        vertexColors: true,
        blending: THREE2.NormalBlending
      })
    );
    const sparkMat = trackMat(
      new THREE2.PointsMaterial({
        name: "Mat_Particles_ArcaneSparks",
        map: textures.particleSparkMap,
        size: 0.24 * m.heightScale,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.96,
        depthWrite: false,
        vertexColors: true,
        blending: THREE2.AdditiveBlending
      })
    );
    const auraParticlePoints = new THREE2.Points(particleGeo, sparkMat);
    auraParticlePoints.name = "Procedural_Aura_Particles";
    auraParticlePoints.frustumCulled = false;
    auraParticlePoints.visible = false;
    rootGroup.add(auraParticlePoints);
    const totalAnchors = shardData.length + 4;
    const particlePool = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const lifetime = 0.8 + i % 11 * 0.11;
      particlePool.push({
        age: i / PARTICLE_COUNT * lifetime,
        // Staggered initial ages for continuous steady emission
        lifetime,
        anchorIndex: i % Math.max(1, totalAnchors),
        vx: (i * 73 % 100 - 50) * 5e-3,
        vy: 0.45 + i * 37 % 100 * 6e-3,
        vz: (i * 53 % 100 - 50) * 5e-3,
        seed: i * 1.6180339
      });
    }
    const BREATH_PARTICLE_COUNT = isSoftwareGl ? 96 : 220;
    const breathParticleGeo = new THREE2.BufferGeometry();
    geometriesToDispose.push(breathParticleGeo);
    const breathPositions = new Float32Array(BREATH_PARTICLE_COUNT * 3);
    const breathColors = new Float32Array(BREATH_PARTICLE_COUNT * 3);
    breathParticleGeo.setAttribute("position", new THREE2.BufferAttribute(breathPositions, 3));
    breathParticleGeo.setAttribute("color", new THREE2.BufferAttribute(breathColors, 3));
    const breathFireMat = trackMat(
      new THREE2.PointsMaterial({
        name: "Mat_MouthVolumetricFireParticles",
        map: textures.fireFlameSpriteMap,
        size: 0.48 * m.heightScale,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.96,
        depthWrite: false,
        vertexColors: true,
        blending: THREE2.AdditiveBlending
      })
    );
    const breathFrostMat = trackMat(
      new THREE2.PointsMaterial({
        name: "Mat_MouthVolumetricFrostParticles",
        map: textures.particleSmokeMap,
        size: 0.45 * m.heightScale,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
        vertexColors: true,
        blending: THREE2.AdditiveBlending
      })
    );
    const breathParticlePoints = new THREE2.Points(
      breathParticleGeo,
      effectiveWeapon === "frost_breath_maw" ? breathFrostMat : breathFireMat
    );
    breathParticlePoints.name = "Procedural_Mouth_Breath_Particles";
    breathParticlePoints.frustumCulled = false;
    breathParticlePoints.visible = false;
    rootGroup.add(breathParticlePoints);
    const breathParticlePool = [];
    for (let i = 0; i < BREATH_PARTICLE_COUNT; i++) {
      const lifetime = 0.34 + i % 9 * 0.048;
      breathParticlePool.push({
        age: i / BREATH_PARTICLE_COUNT * lifetime,
        lifetime,
        vx: 0,
        vy: 0,
        vz: 3.8,
        seed: i * 2.39996,
        isSpark: i % 6 === 0
      });
    }
    let totalVertices = 0;
    let totalTriangles = 0;
    exportableGroup.traverse((obj) => {
      const mesh = obj;
      if (mesh.isMesh && mesh.geometry && !mesh.userData.isExplodedSourceMesh) {
        const posAttr = mesh.geometry.getAttribute("position");
        if (posAttr) {
          const instanceMult = mesh.isInstancedMesh ? mesh.count : 1;
          totalVertices += posAttr.count * instanceMult;
          const index = mesh.geometry.getIndex();
          if (index) {
            totalTriangles += index.count / 3 * instanceMult;
          } else {
            totalTriangles += posAttr.count / 3 * instanceMult;
          }
        }
      }
    });
    const builtRig = {
      rootGroup,
      exportableGroup,
      hitboxGroup,
      rootBone,
      skeleton: sharedSkeleton,
      skinnedMeshes,
      skinnedMeshGroup,
      explodedSourceMeshes,
      animations: [],
      materials: {
        primaryArmorMat,
        secondaryTrimMat,
        underbodyMat,
        hairStrandMat,
        emissiveRuneMat,
        crystalCoreMat,
        slashTrailMat
      },
      parts: {
        pelvisGroup,
        torsoGroup,
        neckGroup,
        headGroup,
        jawGroup,
        extraHeads,
        leftShoulderGroup,
        rightShoulderGroup,
        leftArmGroup,
        rightArmGroup,
        leftElbowGroup,
        rightElbowGroup,
        leftLegGroup,
        rightLegGroup,
        leftKneeGroup,
        rightKneeGroup,
        leftWingGroup,
        rightWingGroup,
        tailGroup,
        tailTipBone,
        dorsalGroup,
        weaponGroup,
        offhandGroup,
        coreMesh,
        breathConeMesh,
        slashTrailMesh,
        arrowProjectileMesh,
        auraInstancedMesh
      },
      sockets: {
        head: socketHead,
        weaponR: socketWeaponR,
        shieldL: socketShieldL,
        core: socketCore
      },
      explodableParts,
      shardData,
      auraParticleSystem: {
        points: auraParticlePoints,
        smokeMat,
        sparkMat,
        activeMode: "none",
        pool: particlePool
      },
      mouthBreathSystem: {
        points: breathParticlePoints,
        fireMat: breathFireMat,
        frostMat: breathFrostMat,
        breathLight,
        fireBreathMap: textures.fireBreathMap,
        frostBreathMap: textures.frostBreathMap,
        pool: breathParticlePool
      },
      metrics: {
        totalVertices: Math.round(totalVertices),
        totalTriangles: Math.round(totalTriangles),
        partCount: bones.length,
        boneCount: bones.length,
        clipCount: 6
      },
      dispose: () => {
        geometriesToDispose.forEach((g) => g.dispose());
        materialsToDispose.forEach((mItem) => mItem.dispose());
      }
    };
    builtRig.animations = bakeEnemyAnimationClips(builtRig);
    exportableGroup.animations = builtRig.animations;
    exportableGroup.userData.skeletalRig = {
      unifiedSkinnedMeshes: skinnedMeshes.length,
      boneCount: bones.length,
      embeddedAnimations: builtRig.animations.map((a) => a.name)
    };
    return builtRig;
  }
  function resetRigToBindPose(rig) {
    for (let i = 0; i < rig.skeleton.bones.length; i++) {
      const b = rig.skeleton.bones[i];
      if (b.userData.bindPos) b.position.copy(b.userData.bindPos);
      if (b.userData.bindQuat) b.quaternion.copy(b.userData.bindQuat);
      if (b.userData.bindScale) b.scale.copy(b.userData.bindScale);
    }
    rig.parts.breathConeMesh.visible = true;
    rig.parts.breathConeMesh.scale.setScalar(1e-4);
    rig.parts.slashTrailMesh.visible = true;
    rig.parts.slashTrailMesh.scale.setScalar(1e-4);
    rig.parts.slashTrailMesh.rotation.set(0, 0, 0);
    const isBow = rig.exportableGroup.userData.effectiveWeapon === "bone_recurved_bow";
    rig.parts.arrowProjectileMesh.position.set(0, 0, 0.36);
    rig.parts.arrowProjectileMesh.scale.setScalar(isBow ? 1 : 1e-4);
    const bowPivots = rig.parts.weaponGroup.userData.bowstringPivots;
    if (bowPivots) {
      bowPivots.upper.rotation.set(0, 0, 0);
      bowPivots.upper.scale.set(1, 1, 1);
      bowPivots.lower.rotation.set(0, 0, 0);
      bowPivots.lower.scale.set(1, 1, 1);
    }
    rig.mouthBreathSystem.breathLight.intensity = 0;
    rig.mouthBreathSystem.points.visible = false;
    rig.skinnedMeshGroup.visible = true;
    for (let i = 0; i < rig.explodedSourceMeshes.length; i++) {
      rig.explodedSourceMeshes[i].visible = false;
    }
    rig.exportableGroup.updateMatrixWorld(true);
  }
  function bakeEnemyAnimationClips(rig) {
    const specs = [
      { name: "Idle", state: "idle", duration: 2.73, steps: 24, loopSeamless: true },
      { name: "Walk", state: "walk", duration: 1.18, steps: 24, loopSeamless: true },
      { name: "Attack", state: "attack", duration: 2.513, steps: 26, loopSeamless: true },
      { name: "JumpBite", state: "jump_bite", duration: 1.85, steps: 28, loopSeamless: true },
      { name: "Hit", state: "hit", duration: 0.75, steps: 16, loopSeamless: false },
      { name: "Death", state: "death", duration: 1.5, steps: 22, loopSeamless: false }
    ];
    const bones = rig.skeleton.bones;
    const clips = [];
    for (const spec of specs) {
      resetRigToBindPose(rig);
      if (spec.loopSeamless) {
        for (let w = 0; w < 8; w++) {
          updateEnemyAnimation(rig, spec.state, w / 8 * spec.duration, 0.25, 1, 0);
        }
      }
      const numFrames = spec.steps + 1;
      const times = new Float32Array(numFrames);
      const quatBuffers = bones.map(() => new Float32Array(numFrames * 4));
      const rootBonePosBuffer = new Float32Array(numFrames * 3);
      const pelvisPosBuffer = new Float32Array(numFrames * 3);
      const torsoScaleBuffer = new Float32Array(numFrames * 3);
      const slashScaleBuffer = new Float32Array(numFrames * 3);
      const slashQuatBuffer = new Float32Array(numFrames * 4);
      const breathScaleBuffer = new Float32Array(numFrames * 3);
      const breathQuatBuffer = new Float32Array(numFrames * 4);
      const arrowPosBuffer = new Float32Array(numFrames * 3);
      const arrowScaleBuffer = new Float32Array(numFrames * 3);
      for (let s = 0; s <= spec.steps; s++) {
        const t = s / spec.steps * spec.duration;
        times[s] = Number(t.toFixed(4));
        updateEnemyAnimation(rig, spec.state, t, 0.35, 1, 0);
        for (let bIdx = 0; bIdx < bones.length; bIdx++) {
          const b = bones[bIdx];
          const qBuf = quatBuffers[bIdx];
          if (spec.loopSeamless && s === spec.steps) {
            qBuf[s * 4] = qBuf[0];
            qBuf[s * 4 + 1] = qBuf[1];
            qBuf[s * 4 + 2] = qBuf[2];
            qBuf[s * 4 + 3] = qBuf[3];
          } else {
            qBuf[s * 4] = b.quaternion.x;
            qBuf[s * 4 + 1] = b.quaternion.y;
            qBuf[s * 4 + 2] = b.quaternion.z;
            qBuf[s * 4 + 3] = b.quaternion.w;
          }
        }
        if (spec.loopSeamless && s === spec.steps) {
          rootBonePosBuffer[s * 3] = rootBonePosBuffer[0];
          rootBonePosBuffer[s * 3 + 1] = rootBonePosBuffer[1];
          rootBonePosBuffer[s * 3 + 2] = rootBonePosBuffer[2];
          pelvisPosBuffer[s * 3] = pelvisPosBuffer[0];
          pelvisPosBuffer[s * 3 + 1] = pelvisPosBuffer[1];
          pelvisPosBuffer[s * 3 + 2] = pelvisPosBuffer[2];
          torsoScaleBuffer[s * 3] = torsoScaleBuffer[0];
          torsoScaleBuffer[s * 3 + 1] = torsoScaleBuffer[1];
          torsoScaleBuffer[s * 3 + 2] = torsoScaleBuffer[2];
          slashScaleBuffer[s * 3] = slashScaleBuffer[0];
          slashScaleBuffer[s * 3 + 1] = slashScaleBuffer[1];
          slashScaleBuffer[s * 3 + 2] = slashScaleBuffer[2];
          slashQuatBuffer[s * 4] = slashQuatBuffer[0];
          slashQuatBuffer[s * 4 + 1] = slashQuatBuffer[1];
          slashQuatBuffer[s * 4 + 2] = slashQuatBuffer[2];
          slashQuatBuffer[s * 4 + 3] = slashQuatBuffer[3];
          breathScaleBuffer[s * 3] = breathScaleBuffer[0];
          breathScaleBuffer[s * 3 + 1] = breathScaleBuffer[1];
          breathScaleBuffer[s * 3 + 2] = breathScaleBuffer[2];
          breathQuatBuffer[s * 4] = breathQuatBuffer[0];
          breathQuatBuffer[s * 4 + 1] = breathQuatBuffer[1];
          breathQuatBuffer[s * 4 + 2] = breathQuatBuffer[2];
          breathQuatBuffer[s * 4 + 3] = breathQuatBuffer[3];
          arrowPosBuffer[s * 3] = arrowPosBuffer[0];
          arrowPosBuffer[s * 3 + 1] = arrowPosBuffer[1];
          arrowPosBuffer[s * 3 + 2] = arrowPosBuffer[2];
          arrowScaleBuffer[s * 3] = arrowScaleBuffer[0];
          arrowScaleBuffer[s * 3 + 1] = arrowScaleBuffer[1];
          arrowScaleBuffer[s * 3 + 2] = arrowScaleBuffer[2];
        } else {
          rootBonePosBuffer[s * 3] = rig.rootBone.position.x;
          rootBonePosBuffer[s * 3 + 1] = rig.rootBone.position.y;
          rootBonePosBuffer[s * 3 + 2] = rig.rootBone.position.z;
          pelvisPosBuffer[s * 3] = rig.parts.pelvisGroup.position.x;
          pelvisPosBuffer[s * 3 + 1] = rig.parts.pelvisGroup.position.y;
          pelvisPosBuffer[s * 3 + 2] = rig.parts.pelvisGroup.position.z;
          torsoScaleBuffer[s * 3] = rig.parts.torsoGroup.scale.x;
          torsoScaleBuffer[s * 3 + 1] = rig.parts.torsoGroup.scale.y;
          torsoScaleBuffer[s * 3 + 2] = rig.parts.torsoGroup.scale.z;
          slashScaleBuffer[s * 3] = rig.parts.slashTrailMesh.scale.x;
          slashScaleBuffer[s * 3 + 1] = rig.parts.slashTrailMesh.scale.y;
          slashScaleBuffer[s * 3 + 2] = rig.parts.slashTrailMesh.scale.z;
          slashQuatBuffer[s * 4] = rig.parts.slashTrailMesh.quaternion.x;
          slashQuatBuffer[s * 4 + 1] = rig.parts.slashTrailMesh.quaternion.y;
          slashQuatBuffer[s * 4 + 2] = rig.parts.slashTrailMesh.quaternion.z;
          slashQuatBuffer[s * 4 + 3] = rig.parts.slashTrailMesh.quaternion.w;
          breathScaleBuffer[s * 3] = rig.parts.breathConeMesh.scale.x;
          breathScaleBuffer[s * 3 + 1] = rig.parts.breathConeMesh.scale.y;
          breathScaleBuffer[s * 3 + 2] = rig.parts.breathConeMesh.scale.z;
          breathQuatBuffer[s * 4] = rig.parts.breathConeMesh.quaternion.x;
          breathQuatBuffer[s * 4 + 1] = rig.parts.breathConeMesh.quaternion.y;
          breathQuatBuffer[s * 4 + 2] = rig.parts.breathConeMesh.quaternion.z;
          breathQuatBuffer[s * 4 + 3] = rig.parts.breathConeMesh.quaternion.w;
          arrowPosBuffer[s * 3] = rig.parts.arrowProjectileMesh.position.x;
          arrowPosBuffer[s * 3 + 1] = rig.parts.arrowProjectileMesh.position.y;
          arrowPosBuffer[s * 3 + 2] = rig.parts.arrowProjectileMesh.position.z;
          arrowScaleBuffer[s * 3] = rig.parts.arrowProjectileMesh.scale.x;
          arrowScaleBuffer[s * 3 + 1] = rig.parts.arrowProjectileMesh.scale.y;
          arrowScaleBuffer[s * 3 + 2] = rig.parts.arrowProjectileMesh.scale.z;
        }
      }
      const tracks = [];
      for (let bIdx = 0; bIdx < bones.length; bIdx++) {
        const b = bones[bIdx];
        if (b === rig.rootBone) continue;
        tracks.push(
          new THREE2.QuaternionKeyframeTrack(`${b.name}.quaternion`, times, quatBuffers[bIdx])
        );
      }
      tracks.push(
        new THREE2.VectorKeyframeTrack(
          `${rig.rootBone.name}.position`,
          times,
          rootBonePosBuffer
        )
      );
      tracks.push(
        new THREE2.VectorKeyframeTrack(
          `${rig.parts.pelvisGroup.name}.position`,
          times,
          pelvisPosBuffer
        )
      );
      tracks.push(
        new THREE2.VectorKeyframeTrack(
          `${rig.parts.torsoGroup.name}.scale`,
          times,
          torsoScaleBuffer
        )
      );
      tracks.push(
        new THREE2.VectorKeyframeTrack(
          `${rig.parts.slashTrailMesh.name}.scale`,
          times,
          slashScaleBuffer
        )
      );
      tracks.push(
        new THREE2.QuaternionKeyframeTrack(
          `${rig.parts.slashTrailMesh.name}.quaternion`,
          times,
          slashQuatBuffer
        )
      );
      tracks.push(
        new THREE2.VectorKeyframeTrack(
          `${rig.parts.breathConeMesh.name}.scale`,
          times,
          breathScaleBuffer
        )
      );
      tracks.push(
        new THREE2.QuaternionKeyframeTrack(
          `${rig.parts.breathConeMesh.name}.quaternion`,
          times,
          breathQuatBuffer
        )
      );
      tracks.push(
        new THREE2.VectorKeyframeTrack(
          `${rig.parts.arrowProjectileMesh.name}.position`,
          times,
          arrowPosBuffer
        )
      );
      tracks.push(
        new THREE2.VectorKeyframeTrack(
          `${rig.parts.arrowProjectileMesh.name}.scale`,
          times,
          arrowScaleBuffer
        )
      );
      const clip = new THREE2.AnimationClip(spec.name, spec.duration, tracks);
      clip.optimize();
      clips.push(clip);
    }
    resetRigToBindPose(rig);
    return clips;
  }
  function updateEnemyAnimation(rig, animState, elapsed, delta, speedMultiplier, explodedAmount, auraParticleMode = "none") {
    var _a;
    const t = elapsed * speedMultiplier;
    const {
      pelvisGroup,
      torsoGroup,
      neckGroup,
      headGroup,
      jawGroup,
      extraHeads,
      leftShoulderGroup,
      rightShoulderGroup,
      leftArmGroup,
      rightArmGroup,
      leftElbowGroup,
      rightElbowGroup,
      leftLegGroup,
      rightLegGroup,
      leftKneeGroup,
      rightKneeGroup,
      leftWingGroup,
      rightWingGroup,
      tailGroup,
      tailTipBone,
      dorsalGroup,
      coreMesh,
      breathConeMesh,
      slashTrailMesh,
      arrowProjectileMesh,
      auraInstancedMesh
    } = rig.parts;
    const bodyPlan = rig.exportableGroup.userData.bodyPlan;
    const isFloating = bodyPlan === "floating_magical";
    const isDragon = bodyPlan === "dragon_wyvern";
    const isSerpentine = bodyPlan === "serpentine_naga";
    const isQuadruped = bodyPlan === "quadruped_beast" || bodyPlan === "dragon_wyvern";
    const isAnimal = Boolean(rig.exportableGroup.userData.isAnimal);
    const effectiveWeapon = rig.exportableGroup.userData.effectiveWeapon || "feral_claws_fangs";
    const isBowWeapon = effectiveWeapon === "bone_recurved_bow";
    const isHandheldWeaponMonster = !isAnimal && effectiveWeapon !== "feral_claws_fangs" && effectiveWeapon !== "leap_fang_bite" && effectiveWeapon !== "ram_charge" && effectiveWeapon !== "dragon_breath_maw" && effectiveWeapon !== "frost_breath_maw";
    const elementAffinity = ((_a = rig.exportableGroup.userData.rpgStats) == null ? void 0 : _a.element) || "Salvaje / F\xEDsico";
    const isFireAffinity = effectiveWeapon === "dragon_breath_maw" || elementAffinity === "Fuego Drac\xF3nico" || elementAffinity === "Fuego Solar";
    const isFrostAffinity = effectiveWeapon === "frost_breath_maw" || elementAffinity === "Escarcha";
    if (animState !== "attack" && animState !== "jump_bite") {
      arrowProjectileMesh.position.set(0, 0.02, 0.18);
      arrowProjectileMesh.scale.setScalar(isBowWeapon ? 1 : 1e-4);
    } else if (!isBowWeapon) {
      arrowProjectileMesh.scale.setScalar(1e-4);
    }
    const isExploded = explodedAmount > 0.02;
    if (rig.skinnedMeshGroup.visible === isExploded) {
      rig.skinnedMeshGroup.visible = !isExploded;
      for (let i = 0; i < rig.explodedSourceMeshes.length; i++) {
        rig.explodedSourceMeshes[i].visible = isExploded;
      }
    }
    for (let i = 0; i < rig.explodableParts.length; i++) {
      const part = rig.explodableParts[i];
      if (part === pelvisGroup) continue;
      const basePos = part.userData.basePos;
      const explodeVec = part.userData.explodeVec;
      if (basePos && explodeVec) {
        _targetPos.copy(basePos).addScaledVector(explodeVec, explodedAmount);
        part.position.x = THREE2.MathUtils.damp(part.position.x, _targetPos.x, 8, delta);
        part.position.y = THREE2.MathUtils.damp(part.position.y, _targetPos.y, 8, delta);
        part.position.z = THREE2.MathUtils.damp(part.position.z, _targetPos.z, 8, delta);
      }
    }
    _pelvisAnimOffset.set(0, 0, 0);
    if (isFloating) {
      _pelvisAnimOffset.y = Math.sin(t * 2.3) * 0.12;
    }
    let mouthBreathIntensity = 0;
    let mouthParticleMode = isFrostAffinity ? "frost" : isFireAffinity ? "fire" : "bite_sparks";
    coreMesh.rotation.y = t * 1.4;
    coreMesh.rotation.z = Math.sin(t * 2) * 0.25;
    if (auraInstancedMesh && rig.shardData.length > 0) {
      for (let i = 0; i < rig.shardData.length; i++) {
        const s = rig.shardData[i];
        const curAngle = s.angle + t * s.speed;
        const r = s.radius + explodedAmount * 0.45;
        const y = s.yOffset + Math.sin(t * 2.2 + i) * 0.12;
        _dummyObj.position.set(Math.cos(curAngle) * r, y, Math.sin(curAngle) * r);
        _dummyObj.rotation.set(t * 0.8 + i, curAngle, 0.25);
        _dummyObj.scale.setScalar(s.scale);
        _dummyObj.updateMatrix();
        auraInstancedMesh.setMatrixAt(i, _dummyObj.matrix);
      }
      auraInstancedMesh.instanceMatrix.needsUpdate = true;
    }
    const tailFreq = animState === "walk" ? 5.33 : animState === "jump_bite" ? 6.78 : animState === "attack" ? 5 : 2.3;
    const tailWave = Math.sin(t * tailFreq);
    const tailTipWave = Math.sin(t * tailFreq - 0.95);
    tailGroup.rotation.y = THREE2.MathUtils.damp(tailGroup.rotation.y, tailWave * 0.26, 10, delta);
    tailTipBone.rotation.y = THREE2.MathUtils.damp(tailTipBone.rotation.y, tailTipWave * 0.36, 10, delta);
    tailTipBone.rotation.x = THREE2.MathUtils.damp(
      tailTipBone.rotation.x,
      Math.cos(t * tailFreq - 0.6) * 0.13,
      10,
      delta
    );
    for (let i = 0; i < extraHeads.length; i++) {
      const eh = extraHeads[i];
      const phase = i === 0 ? 1.4 : -1.4;
      eh.rotation.x = Math.sin(t * 2.3 + phase) * 0.12;
    }
    const wingFreq = animState === "jump_bite" ? 6.78 : animState === "attack" ? 5 : 2.3;
    const wingFlap = Math.sin(t * wingFreq);
    const wingFold = Math.cos(t * wingFreq) * 0.16;
    leftWingGroup.rotation.y = THREE2.MathUtils.damp(leftWingGroup.rotation.y, wingFlap * 0.38, 10, delta);
    rightWingGroup.rotation.y = THREE2.MathUtils.damp(rightWingGroup.rotation.y, -wingFlap * 0.38, 10, delta);
    leftWingGroup.rotation.z = THREE2.MathUtils.damp(leftWingGroup.rotation.z, wingFold, 10, delta);
    rightWingGroup.rotation.z = THREE2.MathUtils.damp(rightWingGroup.rotation.z, -wingFold, 10, delta);
    const dampLambda = 12;
    if (animState !== "attack" && animState !== "jump_bite") {
      rig.rootBone.position.x = THREE2.MathUtils.damp(rig.rootBone.position.x, 0, dampLambda, delta);
      rig.rootBone.position.y = THREE2.MathUtils.damp(rig.rootBone.position.y, 0, dampLambda, delta);
      rig.rootBone.position.z = THREE2.MathUtils.damp(rig.rootBone.position.z, 0, dampLambda, delta);
      headGroup.rotation.z = THREE2.MathUtils.damp(headGroup.rotation.z, 0, dampLambda, delta);
    }
    if (animState !== "walk") {
      pelvisGroup.rotation.y = THREE2.MathUtils.damp(pelvisGroup.rotation.y, 0, dampLambda, delta);
      pelvisGroup.rotation.z = THREE2.MathUtils.damp(pelvisGroup.rotation.z, 0, dampLambda, delta);
      torsoGroup.rotation.y = THREE2.MathUtils.damp(torsoGroup.rotation.y, 0, dampLambda, delta);
      torsoGroup.rotation.z = THREE2.MathUtils.damp(torsoGroup.rotation.z, 0, dampLambda, delta);
    }
    if (animState !== "hit" && animState !== "jump_bite" && !(animState === "attack" && isBowWeapon)) {
      rightArmGroup.rotation.z = THREE2.MathUtils.damp(rightArmGroup.rotation.z, 0, dampLambda, delta);
      leftArmGroup.rotation.z = THREE2.MathUtils.damp(leftArmGroup.rotation.z, 0, dampLambda, delta);
      rightArmGroup.rotation.y = THREE2.MathUtils.damp(rightArmGroup.rotation.y, 0, dampLambda, delta);
      leftArmGroup.rotation.y = THREE2.MathUtils.damp(leftArmGroup.rotation.y, 0, dampLambda, delta);
    }
    const setBowstringDraw = (pullBackZ) => {
      const bowPivots = rig.parts.weaponGroup.userData.bowstringPivots;
      if (!bowPivots) return;
      const halfLen = 0.82;
      const stretchedLen = Math.hypot(halfLen, pullBackZ);
      const angle = Math.atan2(pullBackZ, halfLen);
      bowPivots.upper.rotation.x = angle;
      bowPivots.upper.scale.y = stretchedLen / halfLen;
      bowPivots.lower.rotation.x = -angle;
      bowPivots.lower.scale.y = stretchedLen / halfLen;
    };
    if (isBowWeapon && animState !== "attack" && animState !== "jump_bite") {
      setBowstringDraw(0);
      arrowProjectileMesh.position.set(0, 0, 0.36);
      arrowProjectileMesh.scale.setScalar(1);
    }
    const applyPredatoryJumpBite = (cycleDuration) => {
      const u = (t / cycleDuration % 1 + 1) % 1;
      if (isBowWeapon) {
        breathConeMesh.scale.setScalar(1e-4);
        if (u < 0.22) {
          const p = u / 0.22;
          const coil = Math.sin(p * Math.PI * 0.5);
          _pelvisAnimOffset.y = -0.22 * coil;
          _pelvisAnimOffset.z = -0.18 * coil;
          rig.rootBone.position.z = THREE2.MathUtils.damp(rig.rootBone.position.z, -0.14 * coil, 18, delta);
          rig.rootBone.position.y = THREE2.MathUtils.damp(rig.rootBone.position.y, 0, 18, delta);
          pelvisGroup.rotation.x = THREE2.MathUtils.damp(pelvisGroup.rotation.x, 0, 18, delta);
          torsoGroup.rotation.x = THREE2.MathUtils.damp(torsoGroup.rotation.x, 0, 18, delta);
          torsoGroup.rotation.y = THREE2.MathUtils.damp(torsoGroup.rotation.y, -0.22 * coil, 18, delta);
          headGroup.rotation.x = THREE2.MathUtils.damp(headGroup.rotation.x, 0, 18, delta);
          headGroup.rotation.y = THREE2.MathUtils.damp(headGroup.rotation.y, 0.22 * coil, 18, delta);
          leftLegGroup.rotation.x = THREE2.MathUtils.damp(leftLegGroup.rotation.x, -0.56 * coil, 18, delta);
          rightLegGroup.rotation.x = THREE2.MathUtils.damp(rightLegGroup.rotation.x, -0.56 * coil, 18, delta);
          leftKneeGroup.rotation.x = THREE2.MathUtils.damp(leftKneeGroup.rotation.x, 0.25 + 0.65 * coil, 18, delta);
          rightKneeGroup.rotation.x = THREE2.MathUtils.damp(rightKneeGroup.rotation.x, 0.25 + 0.65 * coil, 18, delta);
          rightArmGroup.rotation.x = THREE2.MathUtils.damp(rightArmGroup.rotation.x, -1.52 * coil, 20, delta);
          rightArmGroup.rotation.y = THREE2.MathUtils.damp(rightArmGroup.rotation.y, 0.22 * coil, 20, delta);
          rightArmGroup.rotation.z = THREE2.MathUtils.damp(rightArmGroup.rotation.z, 0, 20, delta);
          rightElbowGroup.rotation.x = THREE2.MathUtils.damp(rightElbowGroup.rotation.x, -0.0508 * coil, 20, delta);
          leftArmGroup.rotation.x = THREE2.MathUtils.damp(leftArmGroup.rotation.x, -1.5 * coil, 20, delta);
          leftArmGroup.rotation.y = THREE2.MathUtils.damp(leftArmGroup.rotation.y, -0.36 * coil, 20, delta);
          leftArmGroup.rotation.z = THREE2.MathUtils.damp(leftArmGroup.rotation.z, 0.06 * coil, 20, delta);
          leftElbowGroup.rotation.x = THREE2.MathUtils.damp(leftElbowGroup.rotation.x, -0.24 * coil, 20, delta);
          slashTrailMesh.scale.setScalar(1e-4);
          setBowstringDraw(0);
          arrowProjectileMesh.position.set(0, 0, 0.36);
          arrowProjectileMesh.scale.setScalar(1);
        } else if (u < 0.52) {
          const airU = (u - 0.22) / 0.3;
          const arcHeight = Math.sin(airU * Math.PI) * 0.72;
          _pelvisAnimOffset.y = arcHeight;
          _pelvisAnimOffset.z = THREE2.MathUtils.lerp(-0.18, 0.12, airU);
          rig.rootBone.position.y = THREE2.MathUtils.damp(rig.rootBone.position.y, arcHeight * 0.35, 22, delta);
          pelvisGroup.rotation.x = THREE2.MathUtils.damp(pelvisGroup.rotation.x, 0, 24, delta);
          torsoGroup.rotation.x = THREE2.MathUtils.damp(torsoGroup.rotation.x, 0, 24, delta);
          torsoGroup.rotation.y = THREE2.MathUtils.damp(torsoGroup.rotation.y, -0.22, 22, delta);
          neckGroup.rotation.x = THREE2.MathUtils.damp(neckGroup.rotation.x, 0, 22, delta);
          headGroup.rotation.x = THREE2.MathUtils.damp(headGroup.rotation.x, 0, 22, delta);
          headGroup.rotation.y = THREE2.MathUtils.damp(headGroup.rotation.y, 0.22, 22, delta);
          rightShoulderGroup.rotation.z = THREE2.MathUtils.damp(rightShoulderGroup.rotation.z, 0, 24, delta);
          rightArmGroup.rotation.x = THREE2.MathUtils.damp(rightArmGroup.rotation.x, -1.52, 26, delta);
          rightArmGroup.rotation.y = THREE2.MathUtils.damp(rightArmGroup.rotation.y, 0.22, 26, delta);
          rightArmGroup.rotation.z = THREE2.MathUtils.damp(rightArmGroup.rotation.z, 0, 26, delta);
          rightElbowGroup.rotation.x = THREE2.MathUtils.damp(rightElbowGroup.rotation.x, -0.0508, 26, delta);
          leftArmGroup.rotation.x = THREE2.MathUtils.damp(
            leftArmGroup.rotation.x,
            THREE2.MathUtils.lerp(-1.5, -1.56, airU),
            24,
            delta
          );
          leftArmGroup.rotation.y = THREE2.MathUtils.damp(
            leftArmGroup.rotation.y,
            THREE2.MathUtils.lerp(-0.36, 0.18, airU),
            24,
            delta
          );
          leftArmGroup.rotation.z = THREE2.MathUtils.damp(
            leftArmGroup.rotation.z,
            THREE2.MathUtils.lerp(0.06, 0.26, airU),
            24,
            delta
          );
          leftElbowGroup.rotation.x = THREE2.MathUtils.damp(
            leftElbowGroup.rotation.x,
            THREE2.MathUtils.lerp(-0.24, -1.96, airU),
            24,
            delta
          );
          leftLegGroup.rotation.x = THREE2.MathUtils.damp(leftLegGroup.rotation.x, -0.48, 20, delta);
          rightLegGroup.rotation.x = THREE2.MathUtils.damp(rightLegGroup.rotation.x, 0.52, 20, delta);
          leftKneeGroup.rotation.x = THREE2.MathUtils.damp(leftKneeGroup.rotation.x, 0.86, 20, delta);
          rightKneeGroup.rotation.x = THREE2.MathUtils.damp(rightKneeGroup.rotation.x, 0.44, 20, delta);
          const pullZ = airU * 0.56;
          setBowstringDraw(pullZ);
          slashTrailMesh.scale.setScalar(1e-4);
          arrowProjectileMesh.position.set(0, 0, 0.36 - pullZ);
          arrowProjectileMesh.scale.setScalar(1.05);
        } else if (u < 0.84) {
          const shotU = (u - 0.52) / 0.32;
          const landAbsorb = Math.sin(shotU * Math.PI);
          _pelvisAnimOffset.y = -0.1 * landAbsorb;
          rig.rootBone.position.y = THREE2.MathUtils.damp(rig.rootBone.position.y, 0, 20, delta);
          pelvisGroup.rotation.x = THREE2.MathUtils.damp(pelvisGroup.rotation.x, 0, 26, delta);
          torsoGroup.rotation.x = THREE2.MathUtils.damp(torsoGroup.rotation.x, 0, 26, delta);
          torsoGroup.rotation.y = THREE2.MathUtils.damp(torsoGroup.rotation.y, -0.22, 24, delta);
          neckGroup.rotation.x = THREE2.MathUtils.damp(neckGroup.rotation.x, 0, 24, delta);
          headGroup.rotation.x = THREE2.MathUtils.damp(headGroup.rotation.x, 0, 24, delta);
          headGroup.rotation.y = THREE2.MathUtils.damp(headGroup.rotation.y, 0.22, 24, delta);
          rightShoulderGroup.rotation.z = THREE2.MathUtils.damp(rightShoulderGroup.rotation.z, 0, 26, delta);
          rightArmGroup.rotation.x = THREE2.MathUtils.damp(rightArmGroup.rotation.x, -1.52, 28, delta);
          rightArmGroup.rotation.y = THREE2.MathUtils.damp(rightArmGroup.rotation.y, 0.22, 28, delta);
          rightArmGroup.rotation.z = THREE2.MathUtils.damp(rightArmGroup.rotation.z, 0, 28, delta);
          rightElbowGroup.rotation.x = THREE2.MathUtils.damp(rightElbowGroup.rotation.x, -0.0508, 28, delta);
          leftArmGroup.rotation.x = THREE2.MathUtils.damp(leftArmGroup.rotation.x, -1.56, 24, delta);
          leftArmGroup.rotation.y = THREE2.MathUtils.damp(leftArmGroup.rotation.y, 0.24, 24, delta);
          leftArmGroup.rotation.z = THREE2.MathUtils.damp(leftArmGroup.rotation.z, 0.28, 24, delta);
          leftElbowGroup.rotation.x = THREE2.MathUtils.damp(leftElbowGroup.rotation.x, -2.02, 24, delta);
          leftLegGroup.rotation.x = THREE2.MathUtils.damp(leftLegGroup.rotation.x, -0.26, 18, delta);
          rightLegGroup.rotation.x = THREE2.MathUtils.damp(rightLegGroup.rotation.x, 0.22, 18, delta);
          leftKneeGroup.rotation.x = THREE2.MathUtils.damp(leftKneeGroup.rotation.x, 0.48, 18, delta);
          rightKneeGroup.rotation.x = THREE2.MathUtils.damp(rightKneeGroup.rotation.x, 0.42, 18, delta);
          const stringSnap = Math.max(0, Math.sin(shotU * Math.PI * 5) * Math.exp(-shotU * 7) * 0.05);
          setBowstringDraw(stringSnap);
          arrowProjectileMesh.position.set(0, 0, 0.36 + shotU * 11.2);
          arrowProjectileMesh.scale.set(1.25, 1.25, 1.65);
          if (shotU < 0.28) {
            const flash = (1 - shotU / 0.28) * 0.95;
            slashTrailMesh.scale.set(0.85, flash, flash);
            slashTrailMesh.rotation.set(0, 0, 0);
          } else {
            slashTrailMesh.scale.setScalar(1e-4);
          }
        } else {
          const recU = (u - 0.84) / 0.16;
          _pelvisAnimOffset.y = 0;
          rig.rootBone.position.z = THREE2.MathUtils.damp(rig.rootBone.position.z, 0, 16, delta);
          rig.rootBone.position.y = THREE2.MathUtils.damp(rig.rootBone.position.y, 0, 16, delta);
          pelvisGroup.rotation.x = THREE2.MathUtils.damp(pelvisGroup.rotation.x, 0, 16, delta);
          torsoGroup.rotation.x = THREE2.MathUtils.damp(torsoGroup.rotation.x, 0, 16, delta);
          torsoGroup.rotation.y = THREE2.MathUtils.damp(torsoGroup.rotation.y, 0, 16, delta);
          rightArmGroup.rotation.x = THREE2.MathUtils.damp(rightArmGroup.rotation.x, -0.35, 16, delta);
          rightArmGroup.rotation.y = THREE2.MathUtils.damp(rightArmGroup.rotation.y, 0, 16, delta);
          leftArmGroup.rotation.x = THREE2.MathUtils.damp(leftArmGroup.rotation.x, -0.35, 16, delta);
          leftArmGroup.rotation.y = THREE2.MathUtils.damp(leftArmGroup.rotation.y, 0, 16, delta);
          slashTrailMesh.scale.setScalar(1e-4);
          setBowstringDraw(0);
          arrowProjectileMesh.position.set(0, 0, 0.36);
          arrowProjectileMesh.scale.setScalar(recU);
        }
        return;
      }
      if (isHandheldWeaponMonster) {
        breathConeMesh.scale.setScalar(1e-4);
        if (u < 0.24) {
          const p = u / 0.24;
          const coil = Math.sin(p * Math.PI * 0.5);
          _pelvisAnimOffset.y = -0.24 * coil;
          _pelvisAnimOffset.z = -0.22 * coil;
          rig.rootBone.position.z = THREE2.MathUtils.damp(rig.rootBone.position.z, -0.16 * coil, 18, delta);
          rig.rootBone.position.y = THREE2.MathUtils.damp(rig.rootBone.position.y, 0, 18, delta);
          pelvisGroup.rotation.x = THREE2.MathUtils.damp(pelvisGroup.rotation.x, 0.2 * coil, 18, delta);
          torsoGroup.rotation.x = THREE2.MathUtils.damp(torsoGroup.rotation.x, 0.26 * coil, 18, delta);
          torsoGroup.rotation.y = THREE2.MathUtils.damp(torsoGroup.rotation.y, -0.38 * coil, 18, delta);
          neckGroup.rotation.x = THREE2.MathUtils.damp(neckGroup.rotation.x, -0.22 * coil, 18, delta);
          headGroup.rotation.x = THREE2.MathUtils.damp(headGroup.rotation.x, -0.18 * coil, 18, delta);
          jawGroup.rotation.x = THREE2.MathUtils.damp(jawGroup.rotation.x, 0.24 * coil, 18, delta);
          leftLegGroup.rotation.x = THREE2.MathUtils.damp(leftLegGroup.rotation.x, -0.62 * coil, 18, delta);
          rightLegGroup.rotation.x = THREE2.MathUtils.damp(rightLegGroup.rotation.x, -0.58 * coil, 18, delta);
          leftKneeGroup.rotation.x = THREE2.MathUtils.damp(leftKneeGroup.rotation.x, 0.26 + 0.68 * coil, 18, delta);
          rightKneeGroup.rotation.x = THREE2.MathUtils.damp(rightKneeGroup.rotation.x, 0.26 + 0.64 * coil, 18, delta);
          rightArmGroup.rotation.x = THREE2.MathUtils.damp(rightArmGroup.rotation.x, -1.55 * coil, 18, delta);
          rightArmGroup.rotation.z = THREE2.MathUtils.damp(rightArmGroup.rotation.z, -0.22 * coil, 18, delta);
          rightElbowGroup.rotation.x = THREE2.MathUtils.damp(rightElbowGroup.rotation.x, -0.68 * coil, 18, delta);
          leftArmGroup.rotation.x = THREE2.MathUtils.damp(leftArmGroup.rotation.x, -0.58 * coil, 18, delta);
          leftArmGroup.rotation.z = THREE2.MathUtils.damp(leftArmGroup.rotation.z, 0.18 * coil, 18, delta);
          leftElbowGroup.rotation.x = THREE2.MathUtils.damp(leftElbowGroup.rotation.x, -0.48 * coil, 18, delta);
          slashTrailMesh.scale.setScalar(1e-4);
        } else if (u < 0.56) {
          const airU = (u - 0.24) / 0.32;
          const arcHeight = Math.sin(airU * Math.PI) * 0.82;
          const forwardDist = THREE2.MathUtils.lerp(-0.2, 0.88, airU);
          _pelvisAnimOffset.y = arcHeight;
          _pelvisAnimOffset.z = forwardDist * 0.45;
          rig.rootBone.position.z = THREE2.MathUtils.damp(rig.rootBone.position.z, forwardDist * 0.55, 22, delta);
          rig.rootBone.position.y = THREE2.MathUtils.damp(rig.rootBone.position.y, arcHeight * 0.32, 22, delta);
          const pitch = THREE2.MathUtils.lerp(-0.28, 0.32, airU);
          pelvisGroup.rotation.x = THREE2.MathUtils.damp(pelvisGroup.rotation.x, pitch * 0.7, 22, delta);
          torsoGroup.rotation.x = THREE2.MathUtils.damp(torsoGroup.rotation.x, pitch, 22, delta);
          torsoGroup.rotation.y = THREE2.MathUtils.damp(
            torsoGroup.rotation.y,
            THREE2.MathUtils.lerp(-0.38, 0.12, airU),
            22,
            delta
          );
          jawGroup.rotation.x = THREE2.MathUtils.damp(jawGroup.rotation.x, 0.68, 22, delta);
          leftLegGroup.rotation.x = THREE2.MathUtils.damp(leftLegGroup.rotation.x, -0.54, 22, delta);
          rightLegGroup.rotation.x = THREE2.MathUtils.damp(rightLegGroup.rotation.x, 0.48, 22, delta);
          leftKneeGroup.rotation.x = THREE2.MathUtils.damp(leftKneeGroup.rotation.x, 0.88, 22, delta);
          rightKneeGroup.rotation.x = THREE2.MathUtils.damp(rightKneeGroup.rotation.x, 0.46, 22, delta);
          const targetWeaponArmX = airU < 0.72 ? THREE2.MathUtils.lerp(-1.65, -2.42, airU / 0.72) : THREE2.MathUtils.lerp(-2.42, -0.45, (airU - 0.72) / 0.28);
          rightArmGroup.rotation.x = THREE2.MathUtils.damp(rightArmGroup.rotation.x, targetWeaponArmX, 24, delta);
          rightArmGroup.rotation.z = THREE2.MathUtils.damp(rightArmGroup.rotation.z, -0.14, 22, delta);
          rightElbowGroup.rotation.x = THREE2.MathUtils.damp(rightElbowGroup.rotation.x, -0.28, 22, delta);
          leftArmGroup.rotation.x = THREE2.MathUtils.damp(leftArmGroup.rotation.x, -1.15, 20, delta);
          leftArmGroup.rotation.z = THREE2.MathUtils.damp(leftArmGroup.rotation.z, 0.28, 20, delta);
          leftElbowGroup.rotation.x = THREE2.MathUtils.damp(leftElbowGroup.rotation.x, -0.35, 20, delta);
          leftWingGroup.rotation.y = THREE2.MathUtils.damp(leftWingGroup.rotation.y, 0.72, 18, delta);
          rightWingGroup.rotation.y = THREE2.MathUtils.damp(rightWingGroup.rotation.y, -0.72, 18, delta);
          if (airU > 0.7) {
            const preSlash = (airU - 0.7) / 0.3;
            slashTrailMesh.scale.set(1.15, preSlash * 1.25, preSlash * 1.35);
            slashTrailMesh.rotation.set(-0.45 + preSlash * 0.85, 0.1, -0.12);
          } else {
            slashTrailMesh.scale.setScalar(1e-4);
          }
        } else if (u < 0.78) {
          const slamU = (u - 0.56) / 0.22;
          const shockAbsorb = Math.sin(slamU * Math.PI);
          _pelvisAnimOffset.y = -0.18 * shockAbsorb;
          _pelvisAnimOffset.z = 0.38 * (1 - slamU * 0.25);
          rig.rootBone.position.z = THREE2.MathUtils.damp(
            rig.rootBone.position.z,
            0.46 * (1 - slamU * 0.25),
            22,
            delta
          );
          rig.rootBone.position.y = THREE2.MathUtils.damp(rig.rootBone.position.y, 0, 22, delta);
          pelvisGroup.rotation.x = THREE2.MathUtils.damp(pelvisGroup.rotation.x, 0.22, 22, delta);
          torsoGroup.rotation.x = THREE2.MathUtils.damp(torsoGroup.rotation.x, 0.36, 22, delta);
          torsoGroup.rotation.y = THREE2.MathUtils.damp(torsoGroup.rotation.y, 0.38, 22, delta);
          headGroup.rotation.x = THREE2.MathUtils.damp(headGroup.rotation.x, 0.16, 22, delta);
          jawGroup.rotation.x = THREE2.MathUtils.damp(jawGroup.rotation.x, 0.45, 22, delta);
          rightArmGroup.rotation.x = THREE2.MathUtils.damp(rightArmGroup.rotation.x, 0.58, 26, delta);
          rightArmGroup.rotation.z = THREE2.MathUtils.damp(rightArmGroup.rotation.z, 0.08, 22, delta);
          rightElbowGroup.rotation.x = THREE2.MathUtils.damp(rightElbowGroup.rotation.x, -0.14, 24, delta);
          leftArmGroup.rotation.x = THREE2.MathUtils.damp(leftArmGroup.rotation.x, -0.35, 22, delta);
          leftArmGroup.rotation.z = THREE2.MathUtils.damp(leftArmGroup.rotation.z, 0.12, 20, delta);
          leftElbowGroup.rotation.x = THREE2.MathUtils.damp(leftElbowGroup.rotation.x, -0.52, 22, delta);
          leftLegGroup.rotation.x = THREE2.MathUtils.damp(leftLegGroup.rotation.x, -0.38, 20, delta);
          rightLegGroup.rotation.x = THREE2.MathUtils.damp(rightLegGroup.rotation.x, 0.34, 20, delta);
          leftKneeGroup.rotation.x = THREE2.MathUtils.damp(leftKneeGroup.rotation.x, 0.62, 20, delta);
          rightKneeGroup.rotation.x = THREE2.MathUtils.damp(rightKneeGroup.rotation.x, 0.48, 20, delta);
          const sMag = Math.max(1e-4, (1 - slamU * 0.48) * 1.55);
          slashTrailMesh.scale.set(1.25, sMag, sMag * 1.32);
          slashTrailMesh.rotation.set(0.45 + slamU * 0.55, 0.14, -0.18);
          mouthBreathIntensity = (1 - slamU * 0.5) * 0.75;
        } else {
          const recU = (u - 0.78) / 0.22;
          const easeBack = 1 - Math.sin(recU * Math.PI * 0.5);
          const hopBackArc = Math.sin(recU * Math.PI) * 0.1;
          _pelvisAnimOffset.y = hopBackArc;
          _pelvisAnimOffset.z = 0.28 * easeBack;
          rig.rootBone.position.z = THREE2.MathUtils.damp(rig.rootBone.position.z, 0.34 * easeBack, 18, delta);
          rig.rootBone.position.y = THREE2.MathUtils.damp(rig.rootBone.position.y, 0, 18, delta);
          pelvisGroup.rotation.x = THREE2.MathUtils.damp(pelvisGroup.rotation.x, 0, 16, delta);
          torsoGroup.rotation.x = THREE2.MathUtils.damp(torsoGroup.rotation.x, 0, 16, delta);
          torsoGroup.rotation.y = THREE2.MathUtils.damp(torsoGroup.rotation.y, 0, 16, delta);
          neckGroup.rotation.x = THREE2.MathUtils.damp(neckGroup.rotation.x, 0, 16, delta);
          headGroup.rotation.x = THREE2.MathUtils.damp(headGroup.rotation.x, 0, 16, delta);
          jawGroup.rotation.x = THREE2.MathUtils.damp(jawGroup.rotation.x, 0.08, 16, delta);
          rightArmGroup.rotation.x = THREE2.MathUtils.damp(rightArmGroup.rotation.x, -0.18, 16, delta);
          leftArmGroup.rotation.x = THREE2.MathUtils.damp(leftArmGroup.rotation.x, -0.18, 16, delta);
          rightArmGroup.rotation.z = THREE2.MathUtils.damp(rightArmGroup.rotation.z, 0, 16, delta);
          leftArmGroup.rotation.z = THREE2.MathUtils.damp(leftArmGroup.rotation.z, 0, 16, delta);
          rightElbowGroup.rotation.x = THREE2.MathUtils.damp(rightElbowGroup.rotation.x, -0.32, 16, delta);
          leftElbowGroup.rotation.x = THREE2.MathUtils.damp(leftElbowGroup.rotation.x, -0.32, 16, delta);
          leftLegGroup.rotation.x = THREE2.MathUtils.damp(leftLegGroup.rotation.x, -0.06, 16, delta);
          rightLegGroup.rotation.x = THREE2.MathUtils.damp(rightLegGroup.rotation.x, 0.06, 16, delta);
          leftKneeGroup.rotation.x = THREE2.MathUtils.damp(leftKneeGroup.rotation.x, 0.12, 16, delta);
          rightKneeGroup.rotation.x = THREE2.MathUtils.damp(rightKneeGroup.rotation.x, 0.12, 16, delta);
          slashTrailMesh.scale.setScalar(1e-4);
        }
        return;
      }
      slashTrailMesh.scale.setScalar(1e-4);
      if (u < 0.24) {
        const p = u / 0.24;
        const coil = Math.sin(p * Math.PI * 0.5);
        _pelvisAnimOffset.y = -0.22 * coil;
        _pelvisAnimOffset.z = -0.2 * coil;
        rig.rootBone.position.z = THREE2.MathUtils.damp(rig.rootBone.position.z, -0.14 * coil, 18, delta);
        rig.rootBone.position.y = THREE2.MathUtils.damp(rig.rootBone.position.y, 0, 18, delta);
        pelvisGroup.rotation.x = THREE2.MathUtils.damp(pelvisGroup.rotation.x, 0.18 * coil, 18, delta);
        torsoGroup.rotation.x = THREE2.MathUtils.damp(torsoGroup.rotation.x, 0.24 * coil, 18, delta);
        neckGroup.rotation.x = THREE2.MathUtils.damp(neckGroup.rotation.x, -0.28 * coil, 18, delta);
        headGroup.rotation.x = THREE2.MathUtils.damp(headGroup.rotation.x, -0.18 * coil, 18, delta);
        headGroup.rotation.z = THREE2.MathUtils.damp(headGroup.rotation.z, 0, 18, delta);
        jawGroup.rotation.x = THREE2.MathUtils.damp(jawGroup.rotation.x, 0.18 * coil, 18, delta);
        leftLegGroup.rotation.x = THREE2.MathUtils.damp(leftLegGroup.rotation.x, -0.58 * coil, 18, delta);
        rightLegGroup.rotation.x = THREE2.MathUtils.damp(rightLegGroup.rotation.x, -0.58 * coil, 18, delta);
        leftKneeGroup.rotation.x = THREE2.MathUtils.damp(leftKneeGroup.rotation.x, 0.24 + 0.62 * coil, 18, delta);
        rightKneeGroup.rotation.x = THREE2.MathUtils.damp(rightKneeGroup.rotation.x, 0.24 + 0.62 * coil, 18, delta);
        leftArmGroup.rotation.x = THREE2.MathUtils.damp(leftArmGroup.rotation.x, 0.44 * coil, 18, delta);
        rightArmGroup.rotation.x = THREE2.MathUtils.damp(rightArmGroup.rotation.x, 0.44 * coil, 18, delta);
        leftElbowGroup.rotation.x = THREE2.MathUtils.damp(leftElbowGroup.rotation.x, -0.26 - 0.48 * coil, 18, delta);
        rightElbowGroup.rotation.x = THREE2.MathUtils.damp(rightElbowGroup.rotation.x, -0.26 - 0.48 * coil, 18, delta);
        tailGroup.rotation.x = THREE2.MathUtils.damp(tailGroup.rotation.x, -0.25 * coil, 16, delta);
        breathConeMesh.scale.setScalar(1e-4);
      } else if (u < 0.56) {
        const airU = (u - 0.24) / 0.32;
        const arcHeight = Math.sin(airU * Math.PI) * 0.64;
        const forwardDist = THREE2.MathUtils.lerp(-0.2, 0.82, airU);
        _pelvisAnimOffset.y = arcHeight;
        _pelvisAnimOffset.z = forwardDist * 0.45;
        rig.rootBone.position.z = THREE2.MathUtils.damp(rig.rootBone.position.z, forwardDist * 0.55, 22, delta);
        rig.rootBone.position.y = THREE2.MathUtils.damp(rig.rootBone.position.y, arcHeight * 0.25, 22, delta);
        const pitch = THREE2.MathUtils.lerp(-0.44, 0.34, airU);
        pelvisGroup.rotation.x = THREE2.MathUtils.damp(pelvisGroup.rotation.x, pitch, 22, delta);
        torsoGroup.rotation.x = THREE2.MathUtils.damp(torsoGroup.rotation.x, pitch * 0.5, 22, delta);
        neckGroup.rotation.x = THREE2.MathUtils.damp(neckGroup.rotation.x, 0.34, 22, delta);
        headGroup.rotation.x = THREE2.MathUtils.damp(headGroup.rotation.x, -0.16 + airU * 0.28, 22, delta);
        jawGroup.rotation.x = THREE2.MathUtils.damp(jawGroup.rotation.x, 0.96, 24, delta);
        leftLegGroup.rotation.x = THREE2.MathUtils.damp(leftLegGroup.rotation.x, 0.74, 22, delta);
        rightLegGroup.rotation.x = THREE2.MathUtils.damp(rightLegGroup.rotation.x, 0.74, 22, delta);
        leftKneeGroup.rotation.x = THREE2.MathUtils.damp(leftKneeGroup.rotation.x, 0.08, 22, delta);
        rightKneeGroup.rotation.x = THREE2.MathUtils.damp(rightKneeGroup.rotation.x, 0.08, 22, delta);
        leftArmGroup.rotation.x = THREE2.MathUtils.damp(leftArmGroup.rotation.x, -1.12, 22, delta);
        rightArmGroup.rotation.x = THREE2.MathUtils.damp(rightArmGroup.rotation.x, -1.12, 22, delta);
        leftArmGroup.rotation.z = THREE2.MathUtils.damp(leftArmGroup.rotation.z, 0.24, 20, delta);
        rightArmGroup.rotation.z = THREE2.MathUtils.damp(rightArmGroup.rotation.z, -0.24, 20, delta);
        leftElbowGroup.rotation.x = THREE2.MathUtils.damp(leftElbowGroup.rotation.x, -0.22, 22, delta);
        rightElbowGroup.rotation.x = THREE2.MathUtils.damp(rightElbowGroup.rotation.x, -0.22, 22, delta);
        leftWingGroup.rotation.y = THREE2.MathUtils.damp(leftWingGroup.rotation.y, 0.68, 18, delta);
        rightWingGroup.rotation.y = THREE2.MathUtils.damp(rightWingGroup.rotation.y, -0.68, 18, delta);
        tailGroup.rotation.x = THREE2.MathUtils.damp(tailGroup.rotation.x, 0.48, 18, delta);
        if (airU > 0.75) {
          const preSnap = (airU - 0.75) / 0.25;
          breathConeMesh.scale.setScalar(Math.max(1e-4, preSnap * 0.65));
          mouthBreathIntensity = preSnap * 0.75;
        } else {
          breathConeMesh.scale.setScalar(1e-4);
        }
      } else if (u < 0.76) {
        const biteU = (u - 0.56) / 0.2;
        const shockAbsorb = Math.sin(biteU * Math.PI);
        _pelvisAnimOffset.y = -0.14 * shockAbsorb;
        _pelvisAnimOffset.z = 0.36 * (1 - biteU * 0.25);
        rig.rootBone.position.z = THREE2.MathUtils.damp(
          rig.rootBone.position.z,
          0.44 * (1 - biteU * 0.25),
          22,
          delta
        );
        rig.rootBone.position.y = THREE2.MathUtils.damp(rig.rootBone.position.y, 0, 22, delta);
        pelvisGroup.rotation.x = THREE2.MathUtils.damp(pelvisGroup.rotation.x, 0.14, 22, delta);
        torsoGroup.rotation.x = THREE2.MathUtils.damp(torsoGroup.rotation.x, 0.18, 22, delta);
        const tearShake = Math.sin(biteU * Math.PI * 4);
        jawGroup.rotation.x = THREE2.MathUtils.damp(jawGroup.rotation.x, 0.02, 32, delta);
        neckGroup.rotation.x = THREE2.MathUtils.damp(neckGroup.rotation.x, 0.38, 22, delta);
        neckGroup.rotation.y = THREE2.MathUtils.damp(neckGroup.rotation.y, tearShake * 0.22, 24, delta);
        headGroup.rotation.x = THREE2.MathUtils.damp(headGroup.rotation.x, 0.18, 22, delta);
        headGroup.rotation.z = THREE2.MathUtils.damp(headGroup.rotation.z, tearShake * 0.34, 26, delta);
        headGroup.rotation.y = THREE2.MathUtils.damp(
          headGroup.rotation.y,
          Math.cos(biteU * Math.PI * 4) * 0.22,
          24,
          delta
        );
        leftArmGroup.rotation.x = THREE2.MathUtils.damp(leftArmGroup.rotation.x, -0.42, 22, delta);
        rightArmGroup.rotation.x = THREE2.MathUtils.damp(rightArmGroup.rotation.x, -0.42, 22, delta);
        leftArmGroup.rotation.z = THREE2.MathUtils.damp(leftArmGroup.rotation.z, 0.06, 20, delta);
        rightArmGroup.rotation.z = THREE2.MathUtils.damp(rightArmGroup.rotation.z, -0.06, 20, delta);
        leftElbowGroup.rotation.x = THREE2.MathUtils.damp(leftElbowGroup.rotation.x, -0.54, 22, delta);
        rightElbowGroup.rotation.x = THREE2.MathUtils.damp(rightElbowGroup.rotation.x, -0.54, 22, delta);
        leftLegGroup.rotation.x = THREE2.MathUtils.damp(leftLegGroup.rotation.x, -0.28, 20, delta);
        rightLegGroup.rotation.x = THREE2.MathUtils.damp(rightLegGroup.rotation.x, -0.28, 20, delta);
        leftKneeGroup.rotation.x = THREE2.MathUtils.damp(leftKneeGroup.rotation.x, 0.56, 20, delta);
        rightKneeGroup.rotation.x = THREE2.MathUtils.damp(rightKneeGroup.rotation.x, 0.56, 20, delta);
        const fxScale = Math.max(1e-4, (1 - biteU * 0.55) * 1.28);
        breathConeMesh.scale.set(
          fxScale,
          fxScale,
          fxScale * (effectiveWeapon === "dragon_breath_maw" || effectiveWeapon === "frost_breath_maw" ? 0.85 : 1.05)
        );
        breathConeMesh.rotation.z = tearShake * 0.25;
        mouthBreathIntensity = 1 - biteU * 0.4;
      } else {
        const recU = (u - 0.76) / 0.24;
        const easeBack = 1 - Math.sin(recU * Math.PI * 0.5);
        const hopBackArc = Math.sin(recU * Math.PI) * 0.12;
        _pelvisAnimOffset.y = hopBackArc;
        _pelvisAnimOffset.z = 0.27 * easeBack;
        rig.rootBone.position.z = THREE2.MathUtils.damp(rig.rootBone.position.z, 0.33 * easeBack, 18, delta);
        rig.rootBone.position.y = THREE2.MathUtils.damp(rig.rootBone.position.y, 0, 18, delta);
        pelvisGroup.rotation.x = THREE2.MathUtils.damp(pelvisGroup.rotation.x, 0, 16, delta);
        torsoGroup.rotation.x = THREE2.MathUtils.damp(torsoGroup.rotation.x, 0, 16, delta);
        neckGroup.rotation.x = THREE2.MathUtils.damp(neckGroup.rotation.x, 0, 16, delta);
        neckGroup.rotation.y = THREE2.MathUtils.damp(neckGroup.rotation.y, 0, 16, delta);
        headGroup.rotation.x = THREE2.MathUtils.damp(headGroup.rotation.x, 0, 16, delta);
        headGroup.rotation.y = THREE2.MathUtils.damp(headGroup.rotation.y, 0, 16, delta);
        headGroup.rotation.z = THREE2.MathUtils.damp(headGroup.rotation.z, 0, 16, delta);
        jawGroup.rotation.x = THREE2.MathUtils.damp(jawGroup.rotation.x, 0.08, 16, delta);
        leftArmGroup.rotation.x = THREE2.MathUtils.damp(leftArmGroup.rotation.x, isQuadruped ? 0.08 : -0.18, 16, delta);
        rightArmGroup.rotation.x = THREE2.MathUtils.damp(rightArmGroup.rotation.x, isQuadruped ? 0.08 : -0.18, 16, delta);
        leftArmGroup.rotation.z = THREE2.MathUtils.damp(leftArmGroup.rotation.z, 0, 16, delta);
        rightArmGroup.rotation.z = THREE2.MathUtils.damp(rightArmGroup.rotation.z, 0, 16, delta);
        leftElbowGroup.rotation.x = THREE2.MathUtils.damp(leftElbowGroup.rotation.x, isQuadruped ? -0.18 : -0.32, 16, delta);
        rightElbowGroup.rotation.x = THREE2.MathUtils.damp(rightElbowGroup.rotation.x, isQuadruped ? -0.18 : -0.32, 16, delta);
        leftLegGroup.rotation.x = THREE2.MathUtils.damp(leftLegGroup.rotation.x, isQuadruped ? -0.12 : -0.06, 16, delta);
        rightLegGroup.rotation.x = THREE2.MathUtils.damp(rightLegGroup.rotation.x, isQuadruped ? -0.12 : 0.06, 16, delta);
        leftKneeGroup.rotation.x = THREE2.MathUtils.damp(leftKneeGroup.rotation.x, isQuadruped ? 0.24 : 0.12, 16, delta);
        rightKneeGroup.rotation.x = THREE2.MathUtils.damp(rightKneeGroup.rotation.x, isQuadruped ? 0.24 : 0.12, 16, delta);
        breathConeMesh.scale.setScalar(1e-4);
      }
    };
    if (animState === "idle") {
      const breath = Math.sin(t * 2.3);
      const weightShift = Math.sin(t * 2.3);
      const alertLook = Math.cos(t * 2.3);
      breathConeMesh.scale.setScalar(1e-4);
      slashTrailMesh.scale.setScalar(1e-4);
      if (!isFloating) {
        _pelvisAnimOffset.x = weightShift * 0.018;
        _pelvisAnimOffset.y = breath * 8e-3;
      }
      const breathScale = 1 + breath * 0.026;
      torsoGroup.scale.set(breathScale, 1 + breath * 0.016, breathScale);
      torsoGroup.rotation.x = THREE2.MathUtils.damp(torsoGroup.rotation.x, breath * 0.025, dampLambda, delta);
      jawGroup.rotation.x = THREE2.MathUtils.damp(jawGroup.rotation.x, 0.06 + Math.max(0, breath * 0.11), dampLambda, delta);
      neckGroup.rotation.y = THREE2.MathUtils.damp(neckGroup.rotation.y, weightShift * 0.12, dampLambda, delta);
      neckGroup.rotation.x = THREE2.MathUtils.damp(neckGroup.rotation.x, breath * 0.035, dampLambda, delta);
      headGroup.rotation.y = THREE2.MathUtils.damp(headGroup.rotation.y, weightShift * 0.11 + alertLook * 0.06, dampLambda, delta);
      headGroup.rotation.x = THREE2.MathUtils.damp(headGroup.rotation.x, -breath * 0.045, dampLambda, delta);
      leftShoulderGroup.rotation.z = THREE2.MathUtils.damp(leftShoulderGroup.rotation.z, breath * 0.045, dampLambda, delta);
      rightShoulderGroup.rotation.z = THREE2.MathUtils.damp(rightShoulderGroup.rotation.z, -breath * 0.045, dampLambda, delta);
      rightArmGroup.rotation.x = THREE2.MathUtils.damp(rightArmGroup.rotation.x, isQuadruped ? 0.08 : -0.18 + breath * 0.05, dampLambda, delta);
      leftArmGroup.rotation.x = THREE2.MathUtils.damp(leftArmGroup.rotation.x, isQuadruped ? 0.08 : -0.22 - breath * 0.04, dampLambda, delta);
      leftElbowGroup.rotation.x = THREE2.MathUtils.damp(leftElbowGroup.rotation.x, isQuadruped ? -0.18 : -0.32 - breath * 0.05, dampLambda, delta);
      rightElbowGroup.rotation.x = THREE2.MathUtils.damp(rightElbowGroup.rotation.x, isQuadruped ? -0.18 : -0.32 + breath * 0.05, dampLambda, delta);
      leftLegGroup.rotation.x = THREE2.MathUtils.damp(leftLegGroup.rotation.x, isQuadruped ? -0.12 : -0.08, dampLambda, delta);
      rightLegGroup.rotation.x = THREE2.MathUtils.damp(rightLegGroup.rotation.x, isQuadruped ? -0.12 : 0.06, dampLambda, delta);
      leftKneeGroup.rotation.x = THREE2.MathUtils.damp(leftKneeGroup.rotation.x, isQuadruped ? 0.24 : 0.14, dampLambda, delta);
      rightKneeGroup.rotation.x = THREE2.MathUtils.damp(rightKneeGroup.rotation.x, isQuadruped ? 0.24 : 0.08, dampLambda, delta);
      pelvisGroup.rotation.x = THREE2.MathUtils.damp(pelvisGroup.rotation.x, 0, dampLambda, delta);
      tailGroup.rotation.x = THREE2.MathUtils.damp(tailGroup.rotation.x, Math.cos(t * 2.3) * 0.08, dampLambda, delta);
    } else if (animState === "walk") {
      breathConeMesh.scale.setScalar(1e-4);
      slashTrailMesh.scale.setScalar(1e-4);
      const phase = t * 5.3247;
      if (isQuadruped) {
        const pHL = phase;
        const pHR = phase + Math.PI;
        const pFL = phase + 1.25;
        const pFR = phase + Math.PI + 1.25;
        const sinHL = Math.sin(pHL);
        const sinHR = Math.sin(pHR);
        const sinFL = Math.sin(pFL);
        const sinFR = Math.sin(pFR);
        _pelvisAnimOffset.y = Math.cos(phase * 2) * 0.015 - 0.012;
        _pelvisAnimOffset.x = Math.cos(phase) * 0.022;
        _pelvisAnimOffset.z = Math.sin(phase * 2) * 0.014;
        pelvisGroup.rotation.x = THREE2.MathUtils.damp(pelvisGroup.rotation.x, Math.sin(phase * 2) * 0.028, dampLambda, delta);
        pelvisGroup.rotation.z = THREE2.MathUtils.damp(pelvisGroup.rotation.z, Math.cos(pHL) * 0.048, dampLambda, delta);
        pelvisGroup.rotation.y = THREE2.MathUtils.damp(pelvisGroup.rotation.y, sinHL * 0.055, dampLambda, delta);
        torsoGroup.rotation.x = THREE2.MathUtils.damp(torsoGroup.rotation.x, 0.04 - Math.sin(phase * 2) * 0.024, dampLambda, delta);
        torsoGroup.rotation.z = THREE2.MathUtils.damp(torsoGroup.rotation.z, -Math.cos(pFL) * 0.042, dampLambda, delta);
        torsoGroup.rotation.y = THREE2.MathUtils.damp(torsoGroup.rotation.y, -sinFL * 0.048, dampLambda, delta);
        leftShoulderGroup.rotation.z = THREE2.MathUtils.damp(leftShoulderGroup.rotation.z, -sinFL * 0.08, dampLambda, delta);
        rightShoulderGroup.rotation.z = THREE2.MathUtils.damp(rightShoulderGroup.rotation.z, sinFR * 0.08, dampLambda, delta);
        neckGroup.rotation.x = THREE2.MathUtils.damp(neckGroup.rotation.x, 0.08 + Math.sin(phase * 2) * 0.032, dampLambda, delta);
        neckGroup.rotation.y = THREE2.MathUtils.damp(neckGroup.rotation.y, sinFL * 0.045, dampLambda, delta);
        headGroup.rotation.x = THREE2.MathUtils.damp(headGroup.rotation.x, -0.05 - Math.sin(phase * 2) * 0.032, dampLambda, delta);
        headGroup.rotation.y = THREE2.MathUtils.damp(headGroup.rotation.y, -sinFL * 0.035, dampLambda, delta);
        jawGroup.rotation.x = THREE2.MathUtils.damp(jawGroup.rotation.x, 0.12 + Math.sin(phase * 2) * 0.03, dampLambda, delta);
        const swingLiftHL = Math.max(0, Math.cos(pHL));
        const swingLiftHR = Math.max(0, Math.cos(pHR));
        leftLegGroup.rotation.x = THREE2.MathUtils.damp(leftLegGroup.rotation.x, -0.08 - sinHL * 0.44, dampLambda, delta);
        rightLegGroup.rotation.x = THREE2.MathUtils.damp(rightLegGroup.rotation.x, -0.08 - sinHR * 0.44, dampLambda, delta);
        leftKneeGroup.rotation.x = THREE2.MathUtils.damp(
          leftKneeGroup.rotation.x,
          0.18 + swingLiftHL * 0.48 + Math.max(0, -sinHL) * 0.08,
          dampLambda,
          delta
        );
        rightKneeGroup.rotation.x = THREE2.MathUtils.damp(
          rightKneeGroup.rotation.x,
          0.18 + swingLiftHR * 0.48 + Math.max(0, -sinHR) * 0.08,
          dampLambda,
          delta
        );
        const swingLiftFL = Math.max(0, Math.cos(pFL));
        const swingLiftFR = Math.max(0, Math.cos(pFR));
        leftArmGroup.rotation.x = THREE2.MathUtils.damp(leftArmGroup.rotation.x, 0.06 - sinFL * 0.42, dampLambda, delta);
        rightArmGroup.rotation.x = THREE2.MathUtils.damp(rightArmGroup.rotation.x, 0.06 - sinFR * 0.42, dampLambda, delta);
        leftElbowGroup.rotation.x = THREE2.MathUtils.damp(
          leftElbowGroup.rotation.x,
          -0.14 - swingLiftFL * 0.46,
          dampLambda,
          delta
        );
        rightElbowGroup.rotation.x = THREE2.MathUtils.damp(
          rightElbowGroup.rotation.x,
          -0.14 - swingLiftFR * 0.46,
          dampLambda,
          delta
        );
      } else if (isSerpentine) {
        const slither = Math.sin(phase);
        _pelvisAnimOffset.x = slither * 0.085;
        _pelvisAnimOffset.y = -0.01;
        pelvisGroup.rotation.y = THREE2.MathUtils.damp(pelvisGroup.rotation.y, Math.cos(phase) * 0.18, dampLambda, delta);
        torsoGroup.rotation.y = THREE2.MathUtils.damp(torsoGroup.rotation.y, -Math.cos(phase) * 0.14, dampLambda, delta);
        torsoGroup.rotation.x = THREE2.MathUtils.damp(torsoGroup.rotation.x, 0.08, dampLambda, delta);
        neckGroup.rotation.y = THREE2.MathUtils.damp(neckGroup.rotation.y, Math.cos(phase - 0.8) * 0.12, dampLambda, delta);
        headGroup.rotation.y = THREE2.MathUtils.damp(headGroup.rotation.y, -Math.cos(phase - 0.8) * 0.1, dampLambda, delta);
        rightArmGroup.rotation.x = THREE2.MathUtils.damp(rightArmGroup.rotation.x, slither * 0.25 - 0.15, dampLambda, delta);
        leftArmGroup.rotation.x = THREE2.MathUtils.damp(leftArmGroup.rotation.x, -slither * 0.25 - 0.15, dampLambda, delta);
      } else {
        const stride = Math.sin(phase);
        const liftL = Math.max(0, Math.cos(phase));
        const liftR = Math.max(0, -Math.cos(phase));
        if (!isFloating) {
          _pelvisAnimOffset.y = -Math.abs(stride) * 0.024 + Math.cos(phase * 2) * 0.012;
          _pelvisAnimOffset.x = -stride * 0.026;
        }
        pelvisGroup.rotation.x = THREE2.MathUtils.damp(pelvisGroup.rotation.x, 0.04, dampLambda, delta);
        pelvisGroup.rotation.z = THREE2.MathUtils.damp(pelvisGroup.rotation.z, stride * 0.052, dampLambda, delta);
        pelvisGroup.rotation.y = THREE2.MathUtils.damp(pelvisGroup.rotation.y, -stride * 0.085, dampLambda, delta);
        torsoGroup.rotation.x = THREE2.MathUtils.damp(torsoGroup.rotation.x, 0.07 + Math.abs(stride) * 0.025, dampLambda, delta);
        torsoGroup.rotation.y = THREE2.MathUtils.damp(torsoGroup.rotation.y, stride * 0.095, dampLambda, delta);
        torsoGroup.rotation.z = THREE2.MathUtils.damp(torsoGroup.rotation.z, -stride * 0.038, dampLambda, delta);
        headGroup.rotation.y = THREE2.MathUtils.damp(headGroup.rotation.y, -stride * 0.06, dampLambda, delta);
        jawGroup.rotation.x = THREE2.MathUtils.damp(jawGroup.rotation.x, 0.12, dampLambda, delta);
        leftLegGroup.rotation.x = THREE2.MathUtils.damp(leftLegGroup.rotation.x, -stride * 0.46, dampLambda, delta);
        rightLegGroup.rotation.x = THREE2.MathUtils.damp(rightLegGroup.rotation.x, stride * 0.46, dampLambda, delta);
        leftKneeGroup.rotation.x = THREE2.MathUtils.damp(
          leftKneeGroup.rotation.x,
          0.1 + liftL * 0.56 + Math.max(0, -stride) * 0.08,
          dampLambda,
          delta
        );
        rightKneeGroup.rotation.x = THREE2.MathUtils.damp(
          rightKneeGroup.rotation.x,
          0.1 + liftR * 0.56 + Math.max(0, stride) * 0.08,
          dampLambda,
          delta
        );
        rightArmGroup.rotation.x = THREE2.MathUtils.damp(rightArmGroup.rotation.x, -stride * 0.42 - 0.12, dampLambda, delta);
        leftArmGroup.rotation.x = THREE2.MathUtils.damp(leftArmGroup.rotation.x, stride * 0.42 - 0.12, dampLambda, delta);
        rightElbowGroup.rotation.x = THREE2.MathUtils.damp(
          rightElbowGroup.rotation.x,
          -0.28 - Math.max(0, stride) * 0.36,
          dampLambda,
          delta
        );
        leftElbowGroup.rotation.x = THREE2.MathUtils.damp(
          leftElbowGroup.rotation.x,
          -0.28 - Math.max(0, -stride) * 0.36,
          dampLambda,
          delta
        );
      }
      dorsalGroup.rotation.x = THREE2.MathUtils.damp(
        dorsalGroup.rotation.x,
        0.12 + Math.abs(Math.sin(phase)) * 0.08,
        dampLambda,
        delta
      );
    } else if (animState === "jump_bite") {
      applyPredatoryJumpBite(1.85);
    } else if (animState === "attack") {
      if (effectiveWeapon === "leap_fang_bite") {
        applyPredatoryJumpBite(2.513);
      } else {
        const cycle = t * 2.5 % (Math.PI * 2);
        const swing = Math.sin(cycle);
        const lunge = Math.max(0, Math.sin(cycle - 0.4));
        const windup = Math.max(0, -swing);
        if (isAnimal || effectiveWeapon === "ram_charge" || effectiveWeapon === "dragon_breath_maw" || effectiveWeapon === "frost_breath_maw") {
          slashTrailMesh.scale.setScalar(1e-4);
          if (effectiveWeapon === "ram_charge") {
            const goreSnap = Math.max(0, Math.sin(cycle - 0.85));
            const chargeZ = -0.26 * windup + 0.76 * lunge;
            _pelvisAnimOffset.y = -0.08 * windup + 0.04 * goreSnap;
            _pelvisAnimOffset.z = chargeZ * 0.35;
            rig.rootBone.position.z = THREE2.MathUtils.damp(rig.rootBone.position.z, chargeZ * 0.65, 18, delta);
            rig.rootBone.position.y = THREE2.MathUtils.damp(rig.rootBone.position.y, 0, 18, delta);
            pelvisGroup.rotation.x = THREE2.MathUtils.damp(
              pelvisGroup.rotation.x,
              0.14 * windup - 0.16 * goreSnap,
              18,
              delta
            );
            torsoGroup.rotation.x = THREE2.MathUtils.damp(
              torsoGroup.rotation.x,
              0.22 * (windup + lunge * 0.5) - 0.24 * goreSnap,
              18,
              delta
            );
            neckGroup.rotation.x = THREE2.MathUtils.damp(
              neckGroup.rotation.x,
              0.44 * (windup + lunge * 0.6) - goreSnap * 0.88,
              18,
              delta
            );
            headGroup.rotation.x = THREE2.MathUtils.damp(
              headGroup.rotation.x,
              0.56 * (windup + lunge * 0.5) - goreSnap * 1.08,
              18,
              delta
            );
            jawGroup.rotation.x = THREE2.MathUtils.damp(jawGroup.rotation.x, 0.12 + goreSnap * 0.48, 16, delta);
            const ramScale = lunge > 0.22 ? Math.max(1e-4, lunge * 1.15) : 1e-4;
            breathConeMesh.scale.set(ramScale, ramScale, ramScale);
            breathConeMesh.rotation.z = t * 4;
            const drivePhase = cycle * 2;
            leftArmGroup.rotation.x = THREE2.MathUtils.damp(
              leftArmGroup.rotation.x,
              0.28 * windup - 0.54 * lunge + Math.sin(drivePhase) * 0.18 * lunge,
              16,
              delta
            );
            rightArmGroup.rotation.x = THREE2.MathUtils.damp(
              rightArmGroup.rotation.x,
              0.28 * windup - 0.54 * lunge - Math.sin(drivePhase) * 0.18 * lunge,
              16,
              delta
            );
            leftElbowGroup.rotation.x = THREE2.MathUtils.damp(leftElbowGroup.rotation.x, -0.28, 14, delta);
            rightElbowGroup.rotation.x = THREE2.MathUtils.damp(rightElbowGroup.rotation.x, -0.28, 14, delta);
            leftLegGroup.rotation.x = THREE2.MathUtils.damp(
              leftLegGroup.rotation.x,
              -0.34 * windup + 0.62 * lunge - Math.sin(drivePhase) * 0.16 * lunge,
              16,
              delta
            );
            rightLegGroup.rotation.x = THREE2.MathUtils.damp(
              rightLegGroup.rotation.x,
              -0.34 * windup + 0.62 * lunge + Math.sin(drivePhase) * 0.16 * lunge,
              16,
              delta
            );
            leftKneeGroup.rotation.x = THREE2.MathUtils.damp(leftKneeGroup.rotation.x, 0.26 + lunge * 0.24, 14, delta);
            rightKneeGroup.rotation.x = THREE2.MathUtils.damp(rightKneeGroup.rotation.x, 0.26 + lunge * 0.24, 14, delta);
            tailGroup.rotation.x = THREE2.MathUtils.damp(tailGroup.rotation.x, lunge * 0.55, 14, delta);
          } else if (effectiveWeapon === "dragon_breath_maw" || effectiveWeapon === "frost_breath_maw") {
            const isFrost = effectiveWeapon === "frost_breath_maw";
            _pelvisAnimOffset.y = -0.05 * lunge;
            _pelvisAnimOffset.z = -0.1 * windup + 0.14 * lunge;
            rig.rootBone.position.z = THREE2.MathUtils.damp(
              rig.rootBone.position.z,
              -0.08 * windup + 0.12 * lunge,
              14,
              delta
            );
            rig.rootBone.position.y = THREE2.MathUtils.damp(rig.rootBone.position.y, 0, 14, delta);
            const inhale = 1 + windup * 0.09 + lunge * 0.045;
            torsoGroup.scale.set(inhale, 1 + lunge * 0.035, inhale);
            torsoGroup.rotation.x = THREE2.MathUtils.damp(
              torsoGroup.rotation.x,
              -0.14 * windup + 0.16 * lunge,
              16,
              delta
            );
            neckGroup.rotation.x = THREE2.MathUtils.damp(
              neckGroup.rotation.x,
              -0.28 * windup + 0.34 * lunge,
              16,
              delta
            );
            headGroup.rotation.x = THREE2.MathUtils.damp(
              headGroup.rotation.x,
              -0.24 * windup - 0.12 * lunge,
              16,
              delta
            );
            const sweepYaw = lunge > 0.08 ? Math.sin(t * 4.2) * 0.22 * lunge : 0;
            neckGroup.rotation.y = THREE2.MathUtils.damp(neckGroup.rotation.y, sweepYaw * 0.45, 14, delta);
            headGroup.rotation.y = THREE2.MathUtils.damp(headGroup.rotation.y, sweepYaw, 14, delta);
            jawGroup.rotation.x = THREE2.MathUtils.damp(jawGroup.rotation.x, 0.1 + lunge * 0.84, 18, delta);
            for (let i = 0; i < extraHeads.length; i++) {
              extraHeads[i].rotation.x = -0.18 * windup + 0.28 * lunge;
            }
            if (lunge > 0.06) {
              const bScale = Math.max(1e-4, lunge * 1.18);
              const flickerX = 1 + Math.sin(t * 31) * 0.09 + Math.cos(t * 47) * 0.05;
              const flickerY = 1 + Math.cos(t * 29) * 0.09 + Math.sin(t * 43) * 0.05;
              const stretchZ = (isFrost ? 1.38 : 1.35) * (0.94 + Math.sin(t * 23) * 0.08);
              breathConeMesh.scale.set(bScale * flickerX, bScale * flickerY, bScale * stretchZ);
              breathConeMesh.rotation.z = Math.sin(t * 14) * 0.16;
              for (let c = 0; c < breathConeMesh.children.length; c++) {
                const child = breathConeMesh.children[c];
                if (child.name === "Breath_SubLayer_Mid") {
                  child.rotation.z = -Math.sin(t * 19 + 1.2) * 0.22;
                } else if (child.name === "Breath_SubLayer_Core") {
                  child.scale.set(
                    0.92 + Math.sin(t * 37) * 0.12,
                    0.92 + Math.cos(t * 41) * 0.12,
                    1
                  );
                }
              }
              mouthBreathIntensity = Math.min(1, lunge * 1.25);
              mouthParticleMode = isFrost ? "frost" : "fire";
            } else {
              breathConeMesh.scale.setScalar(1e-4);
            }
            leftArmGroup.rotation.x = THREE2.MathUtils.damp(leftArmGroup.rotation.x, -0.18 * lunge, 14, delta);
            rightArmGroup.rotation.x = THREE2.MathUtils.damp(rightArmGroup.rotation.x, -0.18 * lunge, 14, delta);
            leftElbowGroup.rotation.x = THREE2.MathUtils.damp(leftElbowGroup.rotation.x, -0.24, 14, delta);
            rightElbowGroup.rotation.x = THREE2.MathUtils.damp(rightElbowGroup.rotation.x, -0.24, 14, delta);
            leftLegGroup.rotation.x = THREE2.MathUtils.damp(leftLegGroup.rotation.x, 0.18 * lunge, 14, delta);
            rightLegGroup.rotation.x = THREE2.MathUtils.damp(rightLegGroup.rotation.x, 0.18 * lunge, 14, delta);
            leftKneeGroup.rotation.x = THREE2.MathUtils.damp(leftKneeGroup.rotation.x, 0.26, 14, delta);
            rightKneeGroup.rotation.x = THREE2.MathUtils.damp(rightKneeGroup.rotation.x, 0.26, 14, delta);
            tailGroup.rotation.x = THREE2.MathUtils.damp(tailGroup.rotation.x, lunge * 0.42, 14, delta);
          } else {
            const jawOpenWave = Math.max(0, Math.sin(cycle + 0.35));
            const biteSnap = Math.max(0, Math.sin(cycle - 0.72));
            const lungeZ = -0.16 * windup + 0.56 * lunge;
            _pelvisAnimOffset.y = -0.09 * windup + 0.04 * lunge;
            _pelvisAnimOffset.z = lungeZ * 0.35;
            rig.rootBone.position.z = THREE2.MathUtils.damp(rig.rootBone.position.z, lungeZ * 0.65, 18, delta);
            rig.rootBone.position.y = THREE2.MathUtils.damp(rig.rootBone.position.y, 0, 18, delta);
            pelvisGroup.rotation.x = THREE2.MathUtils.damp(pelvisGroup.rotation.x, 0.12 * windup - 0.08 * lunge, 18, delta);
            torsoGroup.rotation.x = THREE2.MathUtils.damp(torsoGroup.rotation.x, 0.16 * windup + 0.12 * lunge, 18, delta);
            neckGroup.rotation.x = THREE2.MathUtils.damp(
              neckGroup.rotation.x,
              -0.2 * windup + 0.42 * lunge,
              18,
              delta
            );
            headGroup.rotation.x = THREE2.MathUtils.damp(
              headGroup.rotation.x,
              -0.16 * windup + 0.16 * lunge - biteSnap * 0.28,
              18,
              delta
            );
            headGroup.rotation.z = THREE2.MathUtils.damp(
              headGroup.rotation.z,
              Math.sin(cycle * 2) * 0.26 * lunge,
              18,
              delta
            );
            const targetJaw = Math.max(0.02, jawOpenWave * 0.88 - biteSnap * 0.92);
            jawGroup.rotation.x = THREE2.MathUtils.damp(jawGroup.rotation.x, targetJaw, 22, delta);
            const biteFxScale = biteSnap > 0.12 ? Math.max(1e-4, biteSnap * 1.18) : 1e-4;
            breathConeMesh.scale.set(biteFxScale, biteFxScale, biteFxScale);
            breathConeMesh.rotation.z = 0;
            if (biteSnap > 0.2) {
              mouthBreathIntensity = biteSnap * 0.85;
            }
            leftArmGroup.rotation.x = THREE2.MathUtils.damp(
              leftArmGroup.rotation.x,
              0.22 * windup - 0.46 * lunge,
              16,
              delta
            );
            rightArmGroup.rotation.x = THREE2.MathUtils.damp(
              rightArmGroup.rotation.x,
              0.22 * windup - 0.46 * lunge,
              16,
              delta
            );
            leftElbowGroup.rotation.x = THREE2.MathUtils.damp(leftElbowGroup.rotation.x, -0.28, 14, delta);
            rightElbowGroup.rotation.x = THREE2.MathUtils.damp(rightElbowGroup.rotation.x, -0.28, 14, delta);
            leftLegGroup.rotation.x = THREE2.MathUtils.damp(
              leftLegGroup.rotation.x,
              -0.26 * windup + 0.5 * lunge,
              16,
              delta
            );
            rightLegGroup.rotation.x = THREE2.MathUtils.damp(
              rightLegGroup.rotation.x,
              -0.26 * windup + 0.5 * lunge,
              16,
              delta
            );
            leftKneeGroup.rotation.x = THREE2.MathUtils.damp(leftKneeGroup.rotation.x, 0.24 + lunge * 0.24, 14, delta);
            rightKneeGroup.rotation.x = THREE2.MathUtils.damp(rightKneeGroup.rotation.x, 0.24 + lunge * 0.24, 14, delta);
            tailGroup.rotation.x = THREE2.MathUtils.damp(tailGroup.rotation.x, lunge * 0.54, 14, delta);
          }
        } else if (isBowWeapon) {
          breathConeMesh.scale.setScalar(1e-4);
          const bowU = (t / 1.2565 % 1 + 1) % 1;
          if (bowU < 0.44) {
            const drawP = bowU / 0.44;
            _pelvisAnimOffset.y = -0.03 * drawP;
            _pelvisAnimOffset.z = -0.05 * drawP;
            rig.rootBone.position.z = THREE2.MathUtils.damp(rig.rootBone.position.z, -0.05 * drawP, 18, delta);
            pelvisGroup.rotation.x = THREE2.MathUtils.damp(pelvisGroup.rotation.x, 0, 22, delta);
            torsoGroup.rotation.x = THREE2.MathUtils.damp(torsoGroup.rotation.x, 0, 22, delta);
            torsoGroup.rotation.y = THREE2.MathUtils.damp(torsoGroup.rotation.y, -0.22, 20, delta);
            neckGroup.rotation.x = THREE2.MathUtils.damp(neckGroup.rotation.x, 0, 20, delta);
            headGroup.rotation.x = THREE2.MathUtils.damp(headGroup.rotation.x, 0, 20, delta);
            headGroup.rotation.y = THREE2.MathUtils.damp(headGroup.rotation.y, 0.22, 20, delta);
            jawGroup.rotation.x = THREE2.MathUtils.damp(jawGroup.rotation.x, 0.08 * drawP, 18, delta);
            rightShoulderGroup.rotation.z = THREE2.MathUtils.damp(rightShoulderGroup.rotation.z, 0, 22, delta);
            rightArmGroup.rotation.x = THREE2.MathUtils.damp(rightArmGroup.rotation.x, -1.52, 24, delta);
            rightArmGroup.rotation.y = THREE2.MathUtils.damp(rightArmGroup.rotation.y, 0.22, 24, delta);
            rightArmGroup.rotation.z = THREE2.MathUtils.damp(rightArmGroup.rotation.z, 0, 24, delta);
            rightElbowGroup.rotation.x = THREE2.MathUtils.damp(rightElbowGroup.rotation.x, -0.0508, 24, delta);
            leftArmGroup.rotation.x = THREE2.MathUtils.damp(
              leftArmGroup.rotation.x,
              THREE2.MathUtils.lerp(-1.5, -1.56, drawP),
              22,
              delta
            );
            leftArmGroup.rotation.y = THREE2.MathUtils.damp(
              leftArmGroup.rotation.y,
              THREE2.MathUtils.lerp(-0.36, 0.18, drawP),
              22,
              delta
            );
            leftArmGroup.rotation.z = THREE2.MathUtils.damp(
              leftArmGroup.rotation.z,
              THREE2.MathUtils.lerp(0.06, 0.26, drawP),
              22,
              delta
            );
            leftElbowGroup.rotation.x = THREE2.MathUtils.damp(
              leftElbowGroup.rotation.x,
              THREE2.MathUtils.lerp(-0.24, -1.96, drawP),
              22,
              delta
            );
            leftLegGroup.rotation.x = THREE2.MathUtils.damp(leftLegGroup.rotation.x, -0.16 * drawP, 14, delta);
            rightLegGroup.rotation.x = THREE2.MathUtils.damp(rightLegGroup.rotation.x, 0.18 * drawP, 14, delta);
            const pullZ = drawP * 0.56;
            setBowstringDraw(pullZ);
            slashTrailMesh.scale.setScalar(1e-4);
            arrowProjectileMesh.position.set(0, 0, 0.36 - pullZ);
            arrowProjectileMesh.scale.setScalar(1.05);
          } else if (bowU < 0.86) {
            const flyP = (bowU - 0.44) / 0.42;
            _pelvisAnimOffset.y = -0.02;
            rig.rootBone.position.z = THREE2.MathUtils.damp(rig.rootBone.position.z, -0.06, 16, delta);
            pelvisGroup.rotation.x = THREE2.MathUtils.damp(pelvisGroup.rotation.x, 0, 24, delta);
            torsoGroup.rotation.x = THREE2.MathUtils.damp(torsoGroup.rotation.x, 0, 24, delta);
            torsoGroup.rotation.y = THREE2.MathUtils.damp(torsoGroup.rotation.y, -0.22, 22, delta);
            neckGroup.rotation.x = THREE2.MathUtils.damp(neckGroup.rotation.x, 0, 22, delta);
            headGroup.rotation.x = THREE2.MathUtils.damp(headGroup.rotation.x, 0, 22, delta);
            headGroup.rotation.y = THREE2.MathUtils.damp(headGroup.rotation.y, 0.22, 22, delta);
            jawGroup.rotation.x = THREE2.MathUtils.damp(jawGroup.rotation.x, 0.24 * (1 - flyP), 18, delta);
            rightShoulderGroup.rotation.z = THREE2.MathUtils.damp(rightShoulderGroup.rotation.z, 0, 24, delta);
            rightArmGroup.rotation.x = THREE2.MathUtils.damp(rightArmGroup.rotation.x, -1.52, 26, delta);
            rightArmGroup.rotation.y = THREE2.MathUtils.damp(rightArmGroup.rotation.y, 0.22, 26, delta);
            rightArmGroup.rotation.z = THREE2.MathUtils.damp(rightArmGroup.rotation.z, 0, 26, delta);
            rightElbowGroup.rotation.x = THREE2.MathUtils.damp(rightElbowGroup.rotation.x, -0.0508, 26, delta);
            leftArmGroup.rotation.x = THREE2.MathUtils.damp(leftArmGroup.rotation.x, -1.56, 24, delta);
            leftArmGroup.rotation.y = THREE2.MathUtils.damp(leftArmGroup.rotation.y, 0.24, 24, delta);
            leftArmGroup.rotation.z = THREE2.MathUtils.damp(leftArmGroup.rotation.z, 0.28, 24, delta);
            leftElbowGroup.rotation.x = THREE2.MathUtils.damp(leftElbowGroup.rotation.x, -2.02, 24, delta);
            const stringSnap = Math.max(0, Math.sin(flyP * Math.PI * 5) * Math.exp(-flyP * 7) * 0.05);
            setBowstringDraw(stringSnap);
            arrowProjectileMesh.position.set(0, 0, 0.36 + flyP * 11.4);
            arrowProjectileMesh.scale.set(1.25, 1.25, 1.6);
            if (flyP < 0.24) {
              const flash = (1 - flyP / 0.24) * 0.85;
              slashTrailMesh.scale.set(0.8, flash, flash);
              slashTrailMesh.rotation.set(0, 0, 0);
            } else {
              slashTrailMesh.scale.setScalar(1e-4);
            }
          } else {
            const relP = (bowU - 0.86) / 0.14;
            pelvisGroup.rotation.x = THREE2.MathUtils.damp(pelvisGroup.rotation.x, 0, 18, delta);
            torsoGroup.rotation.x = THREE2.MathUtils.damp(torsoGroup.rotation.x, 0, 18, delta);
            torsoGroup.rotation.y = THREE2.MathUtils.damp(torsoGroup.rotation.y, -0.18, 16, delta);
            rightArmGroup.rotation.x = THREE2.MathUtils.damp(rightArmGroup.rotation.x, -1.42, 18, delta);
            rightArmGroup.rotation.y = THREE2.MathUtils.damp(rightArmGroup.rotation.y, 0.18, 18, delta);
            rightElbowGroup.rotation.x = THREE2.MathUtils.damp(rightElbowGroup.rotation.x, -0.15, 18, delta);
            leftArmGroup.rotation.x = THREE2.MathUtils.damp(
              leftArmGroup.rotation.x,
              THREE2.MathUtils.lerp(-1.72, -1.5, relP),
              20,
              delta
            );
            leftArmGroup.rotation.y = THREE2.MathUtils.damp(
              leftArmGroup.rotation.y,
              THREE2.MathUtils.lerp(0.15, -0.36, relP),
              20,
              delta
            );
            leftArmGroup.rotation.z = THREE2.MathUtils.damp(leftArmGroup.rotation.z, 0.08, 18, delta);
            leftElbowGroup.rotation.x = THREE2.MathUtils.damp(
              leftElbowGroup.rotation.x,
              THREE2.MathUtils.lerp(-1.25, -0.24, relP),
              20,
              delta
            );
            setBowstringDraw(0);
            slashTrailMesh.scale.setScalar(1e-4);
            arrowProjectileMesh.position.set(0, 0, 0.36);
            arrowProjectileMesh.scale.setScalar(relP);
          }
        } else {
          _pelvisAnimOffset.y = -0.06 * lunge;
          _pelvisAnimOffset.z = -0.08 * windup + 0.22 * lunge;
          rig.rootBone.position.z = THREE2.MathUtils.damp(rig.rootBone.position.z, 0.16 * lunge, 14, delta);
          jawGroup.rotation.x = THREE2.MathUtils.damp(jawGroup.rotation.x, lunge * 0.52, 16, delta);
          breathConeMesh.scale.setScalar(1e-4);
          torsoGroup.rotation.y = THREE2.MathUtils.damp(
            torsoGroup.rotation.y,
            -0.28 * windup + 0.36 * lunge,
            16,
            delta
          );
          torsoGroup.rotation.x = THREE2.MathUtils.damp(
            torsoGroup.rotation.x,
            -0.1 * windup + 0.22 * lunge,
            16,
            delta
          );
          const slashPower = Math.max(0, Math.sin(cycle - 0.25));
          if (slashPower > 0.05) {
            const sMag = Math.min(1.35, slashPower * 1.35);
            slashTrailMesh.scale.set(1, sMag, sMag * 1.15);
            slashTrailMesh.rotation.set(-0.35 + slashPower * 1.15, 0.08 * swing, -0.18 * swing);
          } else {
            slashTrailMesh.scale.setScalar(1e-4);
          }
          tailGroup.rotation.x = THREE2.MathUtils.damp(tailGroup.rotation.x, lunge * 0.6, 14, delta);
          rightArmGroup.rotation.x = THREE2.MathUtils.damp(
            rightArmGroup.rotation.x,
            swing > 0 ? -1.45 + lunge * 2.25 : -0.35 - windup * 0.55,
            16,
            delta
          );
          rightElbowGroup.rotation.x = THREE2.MathUtils.damp(
            rightElbowGroup.rotation.x,
            swing > 0 ? -0.65 + lunge * 0.55 : -0.45,
            16,
            delta
          );
          leftArmGroup.rotation.x = THREE2.MathUtils.damp(leftArmGroup.rotation.x, -0.52 + swing * 0.32, 12, delta);
          leftElbowGroup.rotation.x = THREE2.MathUtils.damp(leftElbowGroup.rotation.x, -0.42, 12, delta);
          leftLegGroup.rotation.x = THREE2.MathUtils.damp(leftLegGroup.rotation.x, -lunge * 0.34, 12, delta);
          rightLegGroup.rotation.x = THREE2.MathUtils.damp(rightLegGroup.rotation.x, lunge * 0.34, 12, delta);
          leftKneeGroup.rotation.x = THREE2.MathUtils.damp(leftKneeGroup.rotation.x, 0.24 + lunge * 0.34, 12, delta);
          rightKneeGroup.rotation.x = THREE2.MathUtils.damp(leftKneeGroup.rotation.x, 0.22 + lunge * 0.18, 12, delta);
        }
      }
    } else if (animState === "hit") {
      breathConeMesh.scale.setScalar(1e-4);
      slashTrailMesh.scale.setScalar(1e-4);
      const stagger = Math.sin(t * 10) * 0.18;
      _pelvisAnimOffset.z = -0.14;
      _pelvisAnimOffset.y = -0.08;
      pelvisGroup.rotation.x = THREE2.MathUtils.damp(pelvisGroup.rotation.x, -0.16, 16, delta);
      torsoGroup.rotation.x = THREE2.MathUtils.damp(torsoGroup.rotation.x, -0.24 + stagger * 0.4, 16, delta);
      torsoGroup.rotation.y = THREE2.MathUtils.damp(torsoGroup.rotation.y, stagger * 0.5, 16, delta);
      jawGroup.rotation.x = THREE2.MathUtils.damp(jawGroup.rotation.x, 0.48, 16, delta);
      headGroup.rotation.x = THREE2.MathUtils.damp(headGroup.rotation.x, -0.38 + stagger, 16, delta);
      rightArmGroup.rotation.z = THREE2.MathUtils.damp(rightArmGroup.rotation.z, -0.45, 14, delta);
      leftArmGroup.rotation.z = THREE2.MathUtils.damp(leftArmGroup.rotation.z, 0.45, 14, delta);
      leftLegGroup.rotation.x = THREE2.MathUtils.damp(leftLegGroup.rotation.x, -0.22, 14, delta);
      rightLegGroup.rotation.x = THREE2.MathUtils.damp(rightLegGroup.rotation.x, 0.26, 14, delta);
      leftKneeGroup.rotation.x = THREE2.MathUtils.damp(leftKneeGroup.rotation.x, 0.48, 14, delta);
      rightKneeGroup.rotation.x = THREE2.MathUtils.damp(rightKneeGroup.rotation.x, 0.42, 14, delta);
    } else if (animState === "death") {
      breathConeMesh.scale.setScalar(1e-4);
      slashTrailMesh.scale.setScalar(1e-4);
      _pelvisAnimOffset.y = -0.42;
      _pelvisAnimOffset.z = -0.12;
      pelvisGroup.rotation.x = THREE2.MathUtils.damp(pelvisGroup.rotation.x, 1.02, 5, delta);
      torsoGroup.rotation.x = THREE2.MathUtils.damp(torsoGroup.rotation.x, 0.24, 5, delta);
      headGroup.rotation.x = THREE2.MathUtils.damp(headGroup.rotation.x, 0.42, 5, delta);
      jawGroup.rotation.x = THREE2.MathUtils.damp(jawGroup.rotation.x, 0.35, 5, delta);
      rightArmGroup.rotation.x = THREE2.MathUtils.damp(rightArmGroup.rotation.x, -1.15, 5, delta);
      leftArmGroup.rotation.x = THREE2.MathUtils.damp(leftArmGroup.rotation.x, -1.05, 5, delta);
      leftKneeGroup.rotation.x = THREE2.MathUtils.damp(leftKneeGroup.rotation.x, 0.78, 5, delta);
      rightKneeGroup.rotation.x = THREE2.MathUtils.damp(rightKneeGroup.rotation.x, 0.78, 5, delta);
    }
    if (pelvisGroup.userData.basePos) {
      const bp = pelvisGroup.userData.basePos;
      const ex = pelvisGroup.userData.explodeVec || _zeroVec;
      const tx = bp.x + ex.x * explodedAmount + _pelvisAnimOffset.x;
      const ty = bp.y + ex.y * explodedAmount + _pelvisAnimOffset.y;
      const tz = bp.z + ex.z * explodedAmount + _pelvisAnimOffset.z;
      pelvisGroup.position.x = THREE2.MathUtils.damp(pelvisGroup.position.x, tx, 16, delta);
      pelvisGroup.position.y = THREE2.MathUtils.damp(pelvisGroup.position.y, ty, 16, delta);
      pelvisGroup.position.z = THREE2.MathUtils.damp(pelvisGroup.position.z, tz, 16, delta);
    }
    rig.exportableGroup.updateMatrixWorld(true);
    const mSys = rig.mouthBreathSystem;
    const isBakingClip = delta >= 0.2;
    if (!isBakingClip) {
      mSys.fireBreathMap.offset.y = (mSys.fireBreathMap.offset.y - delta * 3.6) % 1;
      mSys.fireBreathMap.offset.x = Math.sin(t * 5.5) * 0.08;
      mSys.frostBreathMap.offset.y = (mSys.frostBreathMap.offset.y - delta * 3.1) % 1;
      mSys.frostBreathMap.offset.x = Math.cos(t * 4.8) * 0.06;
      if (mouthBreathIntensity > 0.02) {
        if (mouthParticleMode === "frost") {
          mSys.breathLight.color.setHex(3718648);
          mSys.breathLight.intensity = mouthBreathIntensity * (3.2 + Math.sin(t * 34) * 0.7);
        } else if (mouthParticleMode === "fire") {
          mSys.breathLight.color.setHex(16738816);
          mSys.breathLight.intensity = mouthBreathIntensity * (4.2 + Math.sin(t * 39) * 1.15 + Math.cos(t * 61) * 0.75);
        } else {
          mSys.breathLight.color.setHex(15680580);
          mSys.breathLight.intensity = mouthBreathIntensity * 2.4;
        }
      } else {
        mSys.breathLight.intensity = THREE2.MathUtils.damp(
          mSys.breathLight.intensity,
          0,
          18,
          delta
        );
      }
      const bPosAttr = mSys.points.geometry.getAttribute("position");
      const bColAttr = mSys.points.geometry.getAttribute("color");
      const bDt = Math.max(4e-3, Math.min(delta, 0.06)) * Math.max(0.4, speedMultiplier);
      if (mouthBreathIntensity > 0.02 || mSys.points.visible) {
        mSys.points.material = mouthParticleMode === "frost" ? mSys.frostMat : mSys.fireMat;
        breathConeMesh.getWorldPosition(_mouthWorldPos);
        _mouthLocalPos.copy(_mouthWorldPos);
        rig.rootGroup.worldToLocal(_mouthLocalPos);
        headGroup.getWorldQuaternion(_headWorldQuat);
        rig.rootGroup.getWorldQuaternion(_rootWorldQuat);
        _rootWorldQuat.invert();
        _headWorldQuat.premultiply(_rootWorldQuat);
        _mouthForwardDir.set(0, -0.06, 1).applyQuaternion(_headWorldQuat).normalize();
        let activeCount = 0;
        for (let i = 0; i < mSys.pool.length; i++) {
          const p = mSys.pool[i];
          p.age += bDt;
          if (p.age >= p.lifetime) {
            if (mouthBreathIntensity > 0.02) {
              p.age = 0;
              p.lifetime = mouthParticleMode === "bite_sparks" ? 0.22 + i % 6 * 0.035 : 0.34 + i % 9 * 0.048;
              const spreadAngle = t * 13.7 + p.seed * 6.28318;
              const throatR = 0.045 + i % 4 * 0.015;
              const ox = Math.cos(spreadAngle) * throatR;
              const oy = Math.sin(spreadAngle) * throatR;
              bPosAttr.setXYZ(
                i,
                _mouthLocalPos.x + ox,
                _mouthLocalPos.y + oy,
                _mouthLocalPos.z
              );
              const jetSpeed = mouthParticleMode === "bite_sparks" ? 2.2 + i % 5 * 0.45 : (3.8 + i % 7 * 0.36) * (0.75 + mouthBreathIntensity * 0.35);
              const coneSpread = mouthParticleMode === "bite_sparks" ? 1.35 : p.isSpark ? 0.85 : 0.52;
              p.vx = _mouthForwardDir.x * jetSpeed + Math.cos(spreadAngle) * coneSpread;
              p.vy = _mouthForwardDir.y * jetSpeed + Math.sin(spreadAngle) * coneSpread;
              p.vz = _mouthForwardDir.z * jetSpeed + Math.sin(spreadAngle * 1.7) * 0.35;
            } else {
              bColAttr.setXYZ(i, 0, 0, 0);
              continue;
            }
          }
          activeCount++;
          const ratio = Math.min(1, p.age / p.lifetime);
          let px = bPosAttr.getX(i);
          let py = bPosAttr.getY(i);
          let pz = bPosAttr.getZ(i);
          const turbFreq = 11;
          const turbAmp = (0.35 + ratio * 0.85) * (p.isSpark ? 1.4 : 1);
          const curlX = Math.sin(t * turbFreq + p.seed + pz * 3.2) * turbAmp;
          const curlY = Math.cos(t * (turbFreq * 0.9) + p.seed * 1.7 + px * 3.2) * (turbAmp * 0.65) + (mouthParticleMode === "frost" ? -0.25 : 0.72 * ratio);
          const curlZ = Math.cos(t * turbFreq + p.seed * 2.3 + py * 3.2) * (turbAmp * 0.5);
          const drag = 1 - ratio * 0.32;
          px += (p.vx * drag + curlX) * bDt;
          py += (p.vy * drag + curlY) * bDt;
          pz += (p.vz * drag + curlZ) * bDt;
          bPosAttr.setXYZ(i, px, py, pz);
          const fade = Math.pow(Math.max(0, 1 - Math.pow(ratio, 1.35)), 1.25);
          if (mouthParticleMode === "frost") {
            if (ratio < 0.25) {
              _particleColorOut.setRGB(0.95, 0.99, 1);
            } else if (ratio < 0.65) {
              _particleColorOut.setRGB(0.35, 0.82, 1);
            } else {
              _particleColorOut.setRGB(0.08, 0.42, 0.85);
            }
            _particleColorOut.multiplyScalar(fade * 1.15);
          } else if (mouthParticleMode === "bite_sparks") {
            if (ratio < 0.3) {
              _particleColorOut.setRGB(1, 0.92, 0.75);
            } else {
              _particleColorOut.setRGB(0.95, 0.18, 0.12);
            }
            _particleColorOut.multiplyScalar(fade * 1.2);
          } else {
            if (p.isSpark) {
              _particleColorOut.setRGB(1, 0.85 - ratio * 0.45, 0.25 * (1 - ratio));
              _particleColorOut.multiplyScalar(fade * 1.45);
            } else if (ratio < 0.16) {
              const u = ratio / 0.16;
              _particleColorOut.setRGB(1, 1 - u * 0.06, 0.92 - u * 0.38);
              _particleColorOut.multiplyScalar(1.35);
            } else if (ratio < 0.46) {
              const u = (ratio - 0.16) / 0.3;
              _particleColorOut.setRGB(1, 0.94 - u * 0.48, 0.54 - u * 0.48);
              _particleColorOut.multiplyScalar(1.25);
            } else if (ratio < 0.76) {
              const u = (ratio - 0.46) / 0.3;
              _particleColorOut.setRGB(1 - u * 0.22, 0.46 - u * 0.36, 0.06 * (1 - u));
              _particleColorOut.multiplyScalar(fade * 1.15);
            } else {
              const u = (ratio - 0.76) / 0.24;
              _particleColorOut.setRGB(
                (0.78 - u * 0.62) * fade,
                (0.1 - u * 0.08) * fade,
                0.02 * fade
              );
            }
          }
          bColAttr.setXYZ(i, _particleColorOut.r, _particleColorOut.g, _particleColorOut.b);
        }
        mSys.points.visible = activeCount > 0;
        bPosAttr.needsUpdate = true;
        bColAttr.needsUpdate = true;
      }
    }
    const pSys = rig.auraParticleSystem;
    if (auraParticleMode === "none") {
      if (pSys.points.visible) {
        pSys.points.visible = false;
        pSys.activeMode = "none";
      }
      return;
    }
    const posAttr = pSys.points.geometry.getAttribute("position");
    const colAttr = pSys.points.geometry.getAttribute("color");
    const shardCount = rig.shardData.length;
    const socketList = [
      rig.sockets.core,
      rig.sockets.head,
      rig.sockets.weaponR,
      rig.sockets.shieldL
    ];
    const totalAnchors = shardCount + socketList.length;
    const sampleAuraAnchor = (anchorIdx, out) => {
      const safeIdx = (anchorIdx % totalAnchors + totalAnchors) % totalAnchors;
      if (safeIdx < shardCount) {
        const s = rig.shardData[safeIdx];
        const curAngle = s.angle + t * s.speed;
        const r = s.radius + explodedAmount * 0.45;
        const y = s.yOffset + Math.sin(t * 2.2 + safeIdx) * 0.12;
        out.set(Math.cos(curAngle) * r, y, Math.sin(curAngle) * r);
      } else {
        const sock = socketList[safeIdx - shardCount] || rig.sockets.core;
        sock.getWorldPosition(out);
        rig.rootGroup.worldToLocal(out);
      }
    };
    const isVolcanic = auraParticleMode === "volcanic_smoke";
    if (!pSys.points.visible || pSys.activeMode !== auraParticleMode) {
      pSys.points.visible = true;
      pSys.points.material = isVolcanic ? pSys.smokeMat : pSys.sparkMat;
      pSys.activeMode = auraParticleMode;
      for (let i = 0; i < pSys.pool.length; i++) {
        const p = pSys.pool[i];
        p.anchorIndex = i % totalAnchors;
        p.lifetime = isVolcanic ? 1.25 + i % 9 * 0.14 : 0.72 + i % 7 * 0.11;
        p.age = i / pSys.pool.length * p.lifetime;
        sampleAuraAnchor(p.anchorIndex, _anchorLocalPos);
        const frac = p.age / p.lifetime;
        posAttr.setXYZ(
          i,
          _anchorLocalPos.x + Math.sin(p.seed + i) * 0.08,
          _anchorLocalPos.y + frac * (isVolcanic ? 0.65 : 0.42),
          _anchorLocalPos.z + Math.cos(p.seed + i) * 0.08
        );
      }
    }
    if (isVolcanic) {
      _particleBaseColor.set("#ff5511").lerp(rig.materials.emissiveRuneMat.color, 0.35);
      _particleAccentColor.set("#261d1e");
    } else {
      _particleBaseColor.copy(rig.materials.emissiveRuneMat.color);
      _particleAccentColor.set("#ffffff").lerp(_particleBaseColor, 0.25);
    }
    const dt = Math.max(4e-3, Math.min(delta, 0.08)) * Math.max(0.35, speedMultiplier);
    for (let i = 0; i < pSys.pool.length; i++) {
      const p = pSys.pool[i];
      p.age += dt;
      if (p.age >= p.lifetime) {
        p.age = 0;
        p.anchorIndex = (p.anchorIndex + 1 + i % 3) % totalAnchors;
        p.lifetime = isVolcanic ? 1.2 + i * 19 % 10 * 0.13 : 0.68 + i * 23 % 10 * 0.095;
        sampleAuraAnchor(p.anchorIndex, _anchorLocalPos);
        const jitterR = isVolcanic ? 0.09 : 0.055;
        const ang = t * 3.7 + p.seed * 6.283;
        posAttr.setXYZ(
          i,
          _anchorLocalPos.x + Math.cos(ang) * jitterR,
          _anchorLocalPos.y + Math.sin(p.seed * 3.1 + t) * 0.05,
          _anchorLocalPos.z + Math.sin(ang) * jitterR
        );
        if (isVolcanic) {
          p.vx = Math.cos(ang) * 0.16;
          p.vy = 0.52 + i * 31 % 10 * 0.045;
          p.vz = Math.sin(ang) * 0.16;
        } else {
          p.vx = Math.cos(ang) * 0.42;
          p.vy = 0.48 + i * 41 % 10 * 0.065;
          p.vz = Math.sin(ang) * 0.42;
        }
      }
      const lifeRatio = Math.min(1, p.age / p.lifetime);
      let px = posAttr.getX(i);
      let py = posAttr.getY(i);
      let pz = posAttr.getZ(i);
      if (isVolcanic) {
        const curlX = Math.sin(t * 2.4 + p.seed + py * 2.1) * 0.28;
        const curlZ = Math.cos(t * 2.2 + p.seed * 1.3 + py * 2.1) * 0.28;
        px += (p.vx + curlX) * dt;
        py += p.vy * (1 - lifeRatio * 0.25) * dt;
        pz += (p.vz + curlZ) * dt;
        if (lifeRatio < 0.28) {
          const u = lifeRatio / 0.28;
          _particleColorOut.copy(_particleBaseColor).lerp(_particleAccentColor, u * 0.78);
        } else {
          const u = (lifeRatio - 0.28) / 0.72;
          const fade = Math.max(0, 1 - u * 0.88);
          _particleColorOut.copy(_particleAccentColor).multiplyScalar(fade);
        }
      } else {
        const swirlAngle = t * 6.5 + p.seed * 4;
        const swirlX = -Math.sin(swirlAngle) * 0.36;
        const swirlZ = Math.cos(swirlAngle) * 0.36;
        px += (p.vx * (1 - lifeRatio * 0.5) + swirlX) * dt;
        py += (p.vy + Math.sin(t * 9 + p.seed) * 0.22) * dt;
        pz += (p.vz * (1 - lifeRatio * 0.5) + swirlZ) * dt;
        const twinkle = 0.62 + 0.38 * Math.sin(t * 20 + p.seed * 13);
        const fade = Math.sin((1 - lifeRatio) * Math.PI * 0.5) * twinkle;
        if (lifeRatio < 0.32) {
          _particleColorOut.copy(_particleAccentColor).lerp(_particleBaseColor, lifeRatio / 0.32);
        } else {
          _particleColorOut.copy(_particleBaseColor);
        }
        _particleColorOut.multiplyScalar(Math.max(0, fade * 1.25));
      }
      posAttr.setXYZ(i, px, py, pz);
      colAttr.setXYZ(i, _particleColorOut.r, _particleColorOut.g, _particleColorOut.b);
    }
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  }
  return __toCommonJS(entrada_exports);
})();
if (typeof window !== 'undefined') window.EnemyLib = EnemyLib;
