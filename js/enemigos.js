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
  var WEAPON_HAND = {
    dragon_breath_maw: "natural",
    feral_claws_fangs: "natural",
    espada_corta: "una",
    espada_ancha: "una",
    cimitarra: "una",
    daga: "una",
    estoque: "una",
    hacha_de_mano: "una",
    hacha_de_guerra: "una",
    maza: "una",
    martillo_ligero: "una",
    hoz: "una",
    latigo_espinas: "una",
    porra: "una",
    mangual: "una",
    garra_quitina: "una",
    runic_greatsword: "dos",
    obsidian_warhammer: "dos",
    arcane_staff: "dos",
    twin_reaver_axes: "dos",
    radiant_halberd: "dos",
    venom_scythe_claws: "dos",
    lanza: "dos",
    maza_pesada: "dos",
    hacha_de_dos_manos: "dos"
  };
  function escudoValido(weapon, offhand) {
    return WEAPON_HAND[weapon] === "una" ? offhand : "none";
  }
  function getEffectiveMeshDensity(config) {
    var _a;
    return (_a = config.morphology.meshDensity) != null ? _a : "medium";
  }
  function getEffectiveTexturePattern(config) {
    if (config.materials.texturePattern) {
      return config.materials.texturePattern;
    }
    if (config.raceCategory === "dragons" || config.bodyPlan === "dragon_wyvern" || config.bodyPlan === "serpentine_naga" || config.materials.preset === "dragon_crimson_scales") {
      return "scales";
    }
    if (config.raceCategory === "starter_animals" || config.raceCategory === "beasts" || config.bodyPlan === "quadruped_beast" || config.bodyPlan === "arachnid_scorpion" || config.materials.preset === "feral_fur_hide") {
      return "chitin_fur";
    }
    if (config.raceCategory === "magical" || config.materials.preset === "abyssal_obsidian" || config.materials.preset === "arcane_crystal") {
      return "runic_obsidian";
    }
    return "damascus_plate";
  }
  var RACE_CATEGORY_LABELS = {
    starter_animals: "Animales Nv.1-12 Lineage (10)",
    beasts: "Bestias \xC9lite (6)",
    dragons: "Dragones (5)",
    mythological: "Mitol\xF3gicos (6)",
    magical: "M\xE1gicos y Demonios (7)",
    humanoids: "Campeones (6)"
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
      crystalTransmission: 0.8
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
      crystalTransmission: 0.4
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
      crystalTransmission: 0.75
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
      crystalTransmission: 0.9
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
      crystalTransmission: 0.85
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
      crystalTransmission: 0.6
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
      crystalTransmission: 0.95
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
      crystalTransmission: 0.5
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
      weapon: "dragon_breath_maw",
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
      offhand: "none",
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
      offhand: "none",
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
      weapon: "feral_claws_fangs",
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
      weapon: "feral_claws_fangs",
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
      weapon: "venom_scythe_claws",
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
      weapon: "venom_scythe_claws",
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
      weapon: "feral_claws_fangs",
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
      weapon: "feral_claws_fangs",
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
      offhand: "none",
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
      offhand: "none",
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
      offhand: "none",
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
      offhand: "none",
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
      offhand: "none",
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
      offhand: "none",
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
      offhand: "none",
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
      offhand: "none",
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
      offhand: "none",
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
      offhand: "none",
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
      offhand: "none",
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
      offhand: "none",
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
      weapon: "feral_claws_fangs",
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
      weapon: "feral_claws_fangs",
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
      weapon: "feral_claws_fangs",
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
      weapon: "feral_claws_fangs",
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
      weapon: "venom_scythe_claws",
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
    }
  };
  function calculateThreatScore(stats) {
    const tierMult = stats.tier === "Raid Boss" ? 2.2 : stats.tier === "Mini-Boss" ? 1.6 : stats.tier === "Elite" ? 1.25 : 1;
    const ehp = stats.hp * (1 + stats.defense / 600);
    const edps = stats.attack * (1 + stats.critChance / 100 * 0.75) * (stats.speed / 100);
    return Math.round((ehp * 0.08 + edps * 1.4) * tierMult / 10);
  }

  // tools/enemigos-src/three/enemyBuilder.ts
  var THREE = globalThis.THREE;
  var _targetPos = new THREE.Vector3();
  var _dummyObj = new THREE.Object3D();
  var _shardColor = new THREE.Color();
  var ARMAS_NUEVAS = {
    espada_corta: { asta: 0.9, cabeza: "hoja", largo: 0.62, ancho: 0.1 },
    espada_ancha: { asta: 0.95, cabeza: "hoja", largo: 0.9, ancho: 0.16 },
    cimitarra: { asta: 0.9, cabeza: "curva", largo: 0.8, ancho: 0.13 },
    daga: { asta: 0.5, cabeza: "hoja", largo: 0.35, ancho: 0.07 },
    estoque: { asta: 0.95, cabeza: "hoja", largo: 1, ancho: 0.05 },
    hacha_de_mano: { asta: 0.6, cabeza: "hacha", largo: 0.34, ancho: 0.3 },
    hacha_de_guerra: { asta: 1, cabeza: "hacha", largo: 0.48, ancho: 0.42 },
    maza: { asta: 0.8, cabeza: "esfera", largo: 0.24, ancho: 0.24 },
    martillo_ligero: { asta: 0.8, cabeza: "martillo", largo: 0.36, ancho: 0.22 },
    hoz: { asta: 0.6, cabeza: "curva", largo: 0.46, ancho: 0.1 },
    latigo_espinas: { asta: 0.5, cabeza: "latigo", largo: 1.6, ancho: 0.05 },
    porra: { asta: 0.7, cabeza: "porra", largo: 0.3, ancho: 0.16 },
    mangual: { asta: 0.9, cabeza: "cadena", largo: 0.5, ancho: 0.2 },
    garra_quitina: { asta: 0.5, cabeza: "garras", largo: 0.4, ancho: 0.24 },
    lanza: { asta: 2.1, cabeza: "punta", largo: 0.42, ancho: 0.12 },
    maza_pesada: { asta: 1.5, cabeza: "martillo", largo: 0.5, ancho: 0.4 },
    hacha_de_dos_manos: { asta: 1.6, cabeza: "hacha", largo: 0.5, ancho: 0.5, doble: true }
  };
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
    var _a;
    const patternId = getEffectiveTexturePattern(config);
    const relief = (_a = config.materials.textureRelief) != null ? _a : 0.75;
    const surf = patternId !== "none" ? textures.patterns[patternId] : null;
    const newAlbedo = surf ? surf.albedoMap : null;
    const newBump = surf ? surf.bumpMap : textures.armorBumpMap;
    if (materials.primaryArmorMat.map !== newAlbedo) {
      materials.primaryArmorMat.map = newAlbedo;
      materials.primaryArmorMat.needsUpdate = true;
    }
    materials.primaryArmorMat.bumpMap = newBump;
    materials.primaryArmorMat.bumpScale = 0.032 * relief;
    if (materials.secondaryTrimMat.map !== newAlbedo) {
      materials.secondaryTrimMat.map = newAlbedo;
      materials.secondaryTrimMat.needsUpdate = true;
    }
    materials.secondaryTrimMat.bumpMap = newBump;
    materials.secondaryTrimMat.bumpScale = 0.022 * relief;
    if (materials.underbodyMat.map !== newAlbedo) {
      materials.underbodyMat.map = newAlbedo;
      materials.underbodyMat.needsUpdate = true;
    }
    materials.underbodyMat.bumpMap = newBump;
    materials.underbodyMat.bumpScale = 0.028 * relief;
  }
  function updateEnemyMaterialsInPlace(rig, config, textures, isSoftwareGl, wireframe) {
    const { materials: matCfg } = config;
    const {
      primaryArmorMat,
      secondaryTrimMat,
      underbodyMat,
      emissiveRuneMat,
      crystalCoreMat
    } = rig.materials;
    primaryArmorMat.color.set(matCfg.primaryColor);
    primaryArmorMat.metalness = matCfg.metalness;
    primaryArmorMat.roughness = matCfg.roughness;
    primaryArmorMat.anisotropy = isSoftwareGl ? 0 : matCfg.anisotropy;
    primaryArmorMat.wireframe = wireframe;
    secondaryTrimMat.color.set(matCfg.secondaryColor);
    secondaryTrimMat.metalness = Math.min(1, matCfg.metalness + 0.12);
    secondaryTrimMat.roughness = Math.max(0.08, (matCfg.roughness + 0.32) % 0.85);
    secondaryTrimMat.wireframe = wireframe;
    underbodyMat.color.set(matCfg.underbodyColor);
    underbodyMat.metalness = Math.max(0.04, matCfg.metalness * 0.22);
    underbodyMat.roughness = Math.min(0.92, matCfg.roughness + 0.42);
    underbodyMat.wireframe = wireframe;
    emissiveRuneMat.color.set(matCfg.emissiveColor);
    emissiveRuneMat.emissive.set(matCfg.emissiveColor);
    emissiveRuneMat.emissiveIntensity = matCfg.emissiveIntensity;
    emissiveRuneMat.wireframe = wireframe;
    crystalCoreMat.color.set(matCfg.emissiveColor).lerp(new THREE.Color("#ffffff"), 0.35);
    crystalCoreMat.emissive.set(matCfg.emissiveColor);
    crystalCoreMat.emissiveIntensity = matCfg.emissiveIntensity * 0.65;
    crystalCoreMat.wireframe = wireframe;
    applySurfaceTexturesToMaterials(rig.materials, config, textures);
    rig.exportableGroup.userData.name = config.name;
    rig.exportableGroup.userData.title = config.title;
    rig.exportableGroup.userData.rpgStats = { ...config.stats };
  }
  function buildProceduralEnemy(config, textures, isSoftwareGl, wireframe) {
    const rootGroup = new THREE.Group();
    rootGroup.name = `${config.id}_root`;
    const exportableGroup = new THREE.Group();
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
    const trackGeo = (g) => {
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
      auraShardCount: Number.isFinite(rawM.auraShardCount) ? rawM.auraShardCount : 12
    };
    const density = getEffectiveMeshDensity(config);
    const lodMult = density === "low" ? 0.55 : density === "high" ? 1.55 : 1;
    const seg = (base, min = 4) => Math.max(min, Math.round(base * lodMult));
    const { materials: matCfg, bodyPlan } = config;
    const isQuadruped = bodyPlan === "quadruped_beast" || bodyPlan === "dragon_wyvern";
    const isDragon = bodyPlan === "dragon_wyvern";
    const isArachnid = bodyPlan === "arachnid_scorpion";
    const isSerpentine = bodyPlan === "serpentine_naga";
    const isFloating = bodyPlan === "floating_magical";
    const isCentaur = config.archetype === "astral_centaur";
    const isBeholder = config.archetype === "arcane_beholder";
    const primaryArmorMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        name: "Mat_PrimarySurface",
        color: new THREE.Color(matCfg.primaryColor),
        metalness: matCfg.metalness,
        roughness: matCfg.roughness,
        roughnessMap: textures.armorRoughnessMap,
        anisotropy: isSoftwareGl ? 0 : matCfg.anisotropy,
        anisotropyRotation: Math.PI / 4,
        clearcoat: isDragon ? 0.42 : 0.2,
        clearcoatRoughness: 0.26,
        wireframe
      })
    );
    const secondaryTrimMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        name: "Mat_SecondaryScalesOrTrim",
        color: new THREE.Color(matCfg.secondaryColor),
        metalness: Math.min(1, matCfg.metalness + 0.12),
        roughness: Math.max(0.08, (matCfg.roughness + 0.32) % 0.85),
        anisotropy: isSoftwareGl ? 0 : matCfg.anisotropy * 0.8,
        wireframe
      })
    );
    const underbodyMat = trackMat(
      new THREE.MeshStandardMaterial({
        name: "Mat_UnderbodyHide",
        color: new THREE.Color(matCfg.underbodyColor),
        metalness: Math.max(0.04, matCfg.metalness * 0.22),
        roughness: Math.min(0.92, matCfg.roughness + 0.42),
        wireframe
      })
    );
    const ivoryFangMat = trackMat(
      new THREE.MeshStandardMaterial({
        name: "Mat_IvoryFangsAndHorns",
        color: new THREE.Color("#e8e1ce"),
        metalness: 0.08,
        roughness: 0.38,
        bumpMap: textures.armorBumpMap,
        bumpScale: 8e-3,
        wireframe
      })
    );
    const bladeAlloyMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        name: "Mat_WeaponBlade",
        color: new THREE.Color("#dce5f2"),
        metalness: 0.94,
        roughness: 0.14,
        map: textures.patterns.damascus_plate.albedoMap,
        bumpMap: textures.patterns.damascus_plate.bumpMap,
        bumpScale: 0.015,
        anisotropy: isSoftwareGl ? 0 : 0.75,
        clearcoat: 0.4,
        wireframe
      })
    );
    const emissiveRuneMat = trackMat(
      new THREE.MeshStandardMaterial({
        name: "Mat_RunicEmissive",
        color: new THREE.Color(matCfg.emissiveColor),
        emissive: new THREE.Color(matCfg.emissiveColor),
        emissiveIntensity: matCfg.emissiveIntensity,
        roughness: 0.15,
        metalness: 0.1,
        wireframe
      })
    );
    const crystalCoreMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        name: "Mat_ArcaneCrystal",
        color: new THREE.Color(matCfg.emissiveColor).lerp(new THREE.Color("#ffffff"), 0.35),
        emissive: new THREE.Color(matCfg.emissiveColor),
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
    applySurfaceTexturesToMaterials(
      {
        primaryArmorMat,
        secondaryTrimMat,
        underbodyMat,
        emissiveRuneMat,
        crystalCoreMat
      },
      config,
      textures
    );
    const explodableParts = [];
    const legHeight = isSerpentine ? 0.55 * m.limbLength : isArachnid ? 0.68 * m.limbLength : isQuadruped ? 0.92 * m.limbLength : 1.05 * m.limbLength;
    const pelvisY = isFloating ? legHeight + 0.38 : legHeight;
    const pelvisGroup = new THREE.Group();
    pelvisGroup.name = "Pelvis_Chassis";
    pelvisGroup.position.set(0, pelvisY, isQuadruped ? -0.35 : 0);
    exportableGroup.add(pelvisGroup);
    if (isSerpentine) {
      const coilCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.22, 0),
        new THREE.Vector3(0.08 * m.torsoBulk, -0.08, 0.08),
        new THREE.Vector3(0.32 * m.torsoBulk, -legHeight * 0.45, 0.25),
        new THREE.Vector3(0, -legHeight + 0.14, 0.48),
        new THREE.Vector3(-0.42 * m.torsoBulk, -legHeight + 0.12, 0.05),
        new THREE.Vector3(-0.15 * m.torsoBulk, -legHeight + 0.1, -0.55),
        new THREE.Vector3(0.35 * m.torsoBulk, -legHeight + 0.08, -0.88),
        new THREE.Vector3(0.12 * m.torsoBulk, -legHeight + 0.05, -1.18)
      ]);
      const coilGeo = trackGeo(
        new THREE.TubeGeometry(coilCurve, seg(22, 12), 0.23 * m.torsoBulk, seg(10, 6), false)
      );
      const coilMesh = new THREE.Mesh(coilGeo, primaryArmorMat);
      coilMesh.castShadow = true;
      coilMesh.receiveShadow = true;
      pelvisGroup.add(coilMesh);
      const waistCollarPts = [
        new THREE.Vector2(0.24 * m.torsoBulk, 0),
        new THREE.Vector2(0.31 * m.torsoBulk, 0.14),
        new THREE.Vector2(0.28 * m.torsoBulk, 0.28)
      ];
      const waistCollarGeo = trackGeo(new THREE.LatheGeometry(waistCollarPts, seg(10, 6)));
      const waistCollarMesh = new THREE.Mesh(waistCollarGeo, secondaryTrimMat);
      waistCollarMesh.position.y = 0.04;
      pelvisGroup.add(waistCollarMesh);
    } else if (isQuadruped) {
      const barrelPts = [
        new THREE.Vector2(0.01, -0.68),
        new THREE.Vector2(0.28 * m.torsoBulk, -0.55),
        new THREE.Vector2(0.42 * m.torsoBulk, -0.15),
        new THREE.Vector2(0.49 * m.torsoBulk, 0.38),
        new THREE.Vector2(0.41 * m.torsoBulk, 0.78),
        new THREE.Vector2(0.01, 0.92)
      ];
      const barrelGeo = trackGeo(new THREE.LatheGeometry(barrelPts, seg(12, 6)));
      barrelGeo.rotateX(Math.PI / 2);
      const barrelMesh = new THREE.Mesh(barrelGeo, primaryArmorMat);
      barrelMesh.position.set(0, 0.14, 0.22);
      barrelMesh.castShadow = true;
      pelvisGroup.add(barrelMesh);
      const bellyRingCount = seg(6, 4);
      for (let b = 0; b < bellyRingCount; b++) {
        const frac = b / Math.max(1, bellyRingCount - 1);
        const zOff = -0.35 + frac * 1.05;
        const rad = (0.31 + Math.sin(frac * Math.PI) * 0.12) * m.torsoBulk;
        const scuteGeo = trackGeo(new THREE.SphereGeometry(rad, seg(8, 5), seg(6, 4)));
        scuteGeo.scale(0.88, 0.55, 0.55);
        const scuteMesh = new THREE.Mesh(scuteGeo, secondaryTrimMat);
        scuteMesh.position.set(0, -0.04, zOff);
        pelvisGroup.add(scuteMesh);
      }
      const spineCount = seg(7, 4);
      for (let s = 0; s < spineCount; s++) {
        const frac = s / Math.max(1, spineCount - 1);
        const zOff = -0.42 + frac * 1.05;
        const ridgeGeo = trackGeo(new THREE.ConeGeometry(0.055 * m.torsoBulk, 0.18, 4));
        ridgeGeo.rotateX(-0.35);
        const ridgeMesh = new THREE.Mesh(ridgeGeo, secondaryTrimMat);
        ridgeMesh.position.set(0, 0.52 * m.torsoBulk, zOff);
        pelvisGroup.add(ridgeMesh);
      }
    } else if (isArachnid) {
      const abdomenGeo = trackGeo(new THREE.SphereGeometry(0.48 * m.torsoBulk, seg(12, 6), seg(10, 5)));
      abdomenGeo.scale(1.05, 0.74, 1.48);
      const abdomenMesh = new THREE.Mesh(abdomenGeo, primaryArmorMat);
      abdomenMesh.position.set(0, 0.1, -0.38);
      abdomenMesh.castShadow = true;
      pelvisGroup.add(abdomenMesh);
      for (let r = 0; r < 3; r++) {
        const archGeo = trackGeo(
          new THREE.TorusGeometry((0.42 - r * 0.05) * m.torsoBulk, 0.035, 5, seg(10, 6), Math.PI)
        );
        const archMesh = new THREE.Mesh(archGeo, secondaryTrimMat);
        archMesh.position.set(0, 0.12, -0.15 - r * 0.24);
        archMesh.rotation.x = -0.2;
        pelvisGroup.add(archMesh);
      }
      const cephaloGeo = trackGeo(new THREE.SphereGeometry(0.36 * m.torsoBulk, seg(10, 6), seg(8, 5)));
      cephaloGeo.scale(1.15, 0.65, 1.25);
      const cephaloMesh = new THREE.Mesh(cephaloGeo, secondaryTrimMat);
      cephaloMesh.position.set(0, 0.06, 0.12);
      pelvisGroup.add(cephaloMesh);
    } else {
      const pelvisPts = [
        new THREE.Vector2(0.24 * m.torsoBulk, -0.18),
        new THREE.Vector2(0.36 * m.torsoBulk, 0),
        new THREE.Vector2(0.31 * m.torsoBulk, 0.18),
        new THREE.Vector2(0.34 * m.torsoBulk, 0.34)
      ];
      const pelvisGeo = trackGeo(new THREE.LatheGeometry(pelvisPts, seg(10, 6)));
      pelvisGeo.scale(1.12, 1, 0.85);
      const pelvisMesh = new THREE.Mesh(pelvisGeo, underbodyMat);
      pelvisMesh.castShadow = true;
      pelvisGroup.add(pelvisMesh);
      for (let w = 0; w < 2; w++) {
        const cinctureGeo = trackGeo(
          new THREE.TorusGeometry((0.31 + w * 0.02) * m.torsoBulk, 0.036, 5, seg(12, 6))
        );
        cinctureGeo.rotateX(Math.PI / 2);
        cinctureGeo.scale(1.12, 0.85, 1);
        const cinctureMesh = new THREE.Mesh(cinctureGeo, secondaryTrimMat);
        cinctureMesh.position.y = 0.08 + w * 0.11;
        pelvisGroup.add(cinctureMesh);
      }
      const beltShape = new THREE.Shape();
      beltShape.moveTo(-0.26 * m.torsoBulk, 0.12);
      beltShape.lineTo(0.26 * m.torsoBulk, 0.12);
      beltShape.lineTo(0.18 * m.torsoBulk, -0.26);
      beltShape.lineTo(0, -0.36);
      beltShape.lineTo(-0.18 * m.torsoBulk, -0.26);
      beltShape.closePath();
      const beltGeo = trackGeo(
        new THREE.ExtrudeGeometry(beltShape, {
          depth: 0.08,
          bevelEnabled: true,
          bevelThickness: 0.02,
          bevelSize: 0.02,
          bevelSegments: 1
        })
      );
      const frontTasset = new THREE.Mesh(beltGeo, secondaryTrimMat);
      frontTasset.position.set(0, 0.02, 0.25 * m.torsoBulk);
      frontTasset.castShadow = true;
      pelvisGroup.add(frontTasset);
      for (const side of [-1, 1]) {
        const sideTassetGeo = trackGeo(
          new THREE.BoxGeometry(0.1 * m.torsoBulk, 0.28, 0.28 * m.torsoBulk)
        );
        const sideTasset = new THREE.Mesh(sideTassetGeo, secondaryTrimMat);
        sideTasset.position.set(side * 0.34 * m.torsoBulk, -0.06, 0);
        sideTasset.rotation.z = side * 0.22;
        pelvisGroup.add(sideTasset);
      }
      if (config.archetype === "arch_lich" || config.archetype === "solar_phoenix" || config.archetype === "void_djinn") {
        const robePts = [
          new THREE.Vector2(0.26 * m.torsoBulk, 0.08),
          new THREE.Vector2(0.38 * m.torsoBulk, -0.45),
          new THREE.Vector2(0.54 * m.torsoBulk, -0.95)
        ];
        const robeGeo = trackGeo(new THREE.LatheGeometry(robePts, seg(12, 6)));
        const robeMesh = new THREE.Mesh(robeGeo, primaryArmorMat);
        robeMesh.castShadow = true;
        pelvisGroup.add(robeMesh);
      }
    }
    tagExplodablePart(pelvisGroup, new THREE.Vector3(0, -0.35, -0.25), {
      name: isSerpentine ? "Anillos Serpentinos Inferiores" : isQuadruped ? "Chasis Corporal y Placas Ventrales" : isArachnid ? "Abdomen y Cefalot\xF3rax Quitinoso" : "Pelvis, Abdomen y Fald\xF3n Acorazado",
      category: "Primary Silhouette",
      vertexCount: 280,
      triangleCount: 220,
      materialSummary: "Estructura continua con textura procedural"
    });
    explodableParts.push(pelvisGroup);
    const buildLeg = (isLeft) => {
      const side = isLeft ? 1 : -1;
      const legGroup = new THREE.Group();
      legGroup.name = isLeft ? "Leg_L" : "Leg_R";
      const zPos = isQuadruped ? -0.48 : 0;
      legGroup.position.set(side * 0.28 * m.torsoBulk, pelvisY, zPos);
      exportableGroup.add(legGroup);
      if (isSerpentine) {
        return legGroup;
      }
      if (isFloating && isBeholder) {
        const tendrilCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0.08, 0),
          new THREE.Vector3(side * 0.12, -0.35, -0.1),
          new THREE.Vector3(side * 0.05, -0.7, 0.08)
        ]);
        const tendrilGeo = trackGeo(
          new THREE.TubeGeometry(tendrilCurve, seg(8, 5), 0.048, seg(6, 4), false)
        );
        legGroup.add(new THREE.Mesh(tendrilGeo, underbodyMat));
      } else if (isArachnid) {
        for (let k = 0; k < 4; k++) {
          const zOff = (k - 1.5) * 0.28;
          const reachX = side * (0.82 + k % 2 * 0.16) * m.limbLength;
          const coxaGeo = trackGeo(new THREE.SphereGeometry(0.085 * m.torsoBulk, seg(6, 4), seg(5, 4)));
          const coxaMesh = new THREE.Mesh(coxaGeo, secondaryTrimMat);
          coxaMesh.position.set(0, 0.04, zOff * 0.52);
          legGroup.add(coxaMesh);
          const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0.04, zOff * 0.52),
            new THREE.Vector3(reachX * 0.55, 0.36, zOff * 0.9),
            new THREE.Vector3(reachX * 1.05, -legHeight * 0.35, zOff * 1.25),
            new THREE.Vector3(reachX * 0.92, -legHeight + 0.02, zOff * 1.35)
          ]);
          const spiderLegGeo = trackGeo(
            new THREE.TubeGeometry(curve, seg(10, 6), 0.056, seg(6, 4), false)
          );
          const spiderMesh = new THREE.Mesh(spiderLegGeo, primaryArmorMat);
          spiderMesh.castShadow = true;
          legGroup.add(spiderMesh);
          const apexJointGeo = trackGeo(new THREE.SphereGeometry(0.072, seg(6, 4), seg(5, 4)));
          const apexJoint = new THREE.Mesh(apexJointGeo, secondaryTrimMat);
          apexJoint.position.set(reachX * 0.55, 0.36, zOff * 0.9);
          legGroup.add(apexJoint);
        }
      } else {
        const hipHaunchGeo = trackGeo(
          new THREE.SphereGeometry(0.21 * m.torsoBulk, seg(8, 5), seg(6, 4))
        );
        hipHaunchGeo.scale(0.95, 1.18, 1.15);
        const hipHaunchMesh = new THREE.Mesh(
          hipHaunchGeo,
          isQuadruped ? primaryArmorMat : secondaryTrimMat
        );
        hipHaunchMesh.position.set(-side * 0.04, 0.02, isQuadruped ? 0.05 : 0);
        legGroup.add(hipHaunchMesh);
        const thighPts = [
          new THREE.Vector2(0.13 * m.torsoBulk, 0),
          new THREE.Vector2(0.19 * m.torsoBulk, legHeight * 0.28),
          new THREE.Vector2(0.17 * m.torsoBulk, legHeight * 0.52)
        ];
        const thighGeo = trackGeo(new THREE.LatheGeometry(thighPts, seg(8, 5)));
        const thighMesh = new THREE.Mesh(thighGeo, isQuadruped ? primaryArmorMat : underbodyMat);
        thighMesh.position.set(0, -legHeight * 0.48, isQuadruped ? -0.05 : 0);
        thighMesh.rotation.x = isQuadruped ? 0.22 : 0;
        thighMesh.castShadow = true;
        legGroup.add(thighMesh);
        const kneeSphereGeo = trackGeo(
          new THREE.SphereGeometry(0.135 * m.torsoBulk, seg(8, 5), seg(6, 4))
        );
        const kneeSphere = new THREE.Mesh(kneeSphereGeo, underbodyMat);
        kneeSphere.position.set(0, -legHeight * 0.48, 0.02);
        legGroup.add(kneeSphere);
        const kneeGuardGeo = trackGeo(new THREE.OctahedronGeometry(0.14 * m.torsoBulk, 0));
        kneeGuardGeo.scale(1, 1.25, 0.85);
        const kneeMesh = new THREE.Mesh(kneeGuardGeo, secondaryTrimMat);
        kneeMesh.position.set(0, -legHeight * 0.48, 0.11);
        legGroup.add(kneeMesh);
        const greavePts = [
          new THREE.Vector2(0.11 * m.torsoBulk, 0),
          new THREE.Vector2(0.165 * m.torsoBulk, legHeight * 0.26),
          new THREE.Vector2(0.135 * m.torsoBulk, legHeight * 0.5)
        ];
        const greaveGeo = trackGeo(new THREE.LatheGeometry(greavePts, seg(8, 5)));
        const greaveMesh = new THREE.Mesh(greaveGeo, primaryArmorMat);
        greaveMesh.position.y = -legHeight * 0.94;
        greaveMesh.castShadow = true;
        legGroup.add(greaveMesh);
        const ankleGeo = trackGeo(
          new THREE.SphereGeometry(0.115 * m.torsoBulk, seg(6, 4), seg(5, 4))
        );
        const ankleMesh = new THREE.Mesh(ankleGeo, secondaryTrimMat);
        ankleMesh.position.set(0, -legHeight + 0.11, 0.02);
        legGroup.add(ankleMesh);
        const footGeo = trackGeo(new THREE.BoxGeometry(0.24 * m.torsoBulk, 0.14, 0.38));
        const footMesh = new THREE.Mesh(footGeo, secondaryTrimMat);
        footMesh.position.set(0, -legHeight + 0.07, 0.08);
        legGroup.add(footMesh);
        if (isDragon || isQuadruped || config.archetype === "labyrinth_minotaur") {
          for (let c = -1; c <= 1; c++) {
            const clawGeo = trackGeo(new THREE.ConeGeometry(0.034, 0.19, 4));
            clawGeo.rotateX(Math.PI / 2);
            const clawMesh = new THREE.Mesh(clawGeo, ivoryFangMat);
            clawMesh.position.set(c * 0.07, -legHeight + 0.05, 0.3);
            legGroup.add(clawMesh);
          }
        }
      }
      tagExplodablePart(legGroup, new THREE.Vector3(side * 0.5, -0.45, -0.15), {
        name: isLeft ? "Extremidad Inferior Izquierda" : "Extremidad Inferior Derecha",
        category: "Primary Silhouette",
        vertexCount: 310,
        triangleCount: 250,
        materialSummary: "Cadera, muslo, rodillera, greba y garra continua en Y=0"
      });
      explodableParts.push(legGroup);
      return legGroup;
    };
    const leftLegGroup = buildLeg(true);
    const rightLegGroup = buildLeg(false);
    const torsoGroup = new THREE.Group();
    torsoGroup.name = "Torso_Main";
    if (isDragon) {
      torsoGroup.position.set(0, 0.22, 0.44);
      torsoGroup.rotation.x = 0.36;
    } else if (isQuadruped && !isCentaur) {
      torsoGroup.position.set(0, 0.16, 0.46);
      torsoGroup.rotation.x = 0.48;
    } else if (isCentaur) {
      torsoGroup.position.set(0, 0.24, 0.54);
    } else {
      torsoGroup.position.set(0, 0.15, 0);
    }
    pelvisGroup.add(torsoGroup);
    const torsoHeight = 0.92 * m.heightScale;
    if (isBeholder) {
      const orbBodyGeo = trackGeo(
        new THREE.IcosahedronGeometry(0.62 * m.torsoBulk, density === "low" ? 1 : 2)
      );
      const orbBodyMesh = new THREE.Mesh(orbBodyGeo, primaryArmorMat);
      orbBodyMesh.position.y = torsoHeight * 0.55;
      orbBodyMesh.castShadow = true;
      torsoGroup.add(orbBodyMesh);
      const browGeo = trackGeo(new THREE.TorusGeometry(0.44 * m.torsoBulk, 0.08, 6, seg(18, 10)));
      const browMesh = new THREE.Mesh(browGeo, secondaryTrimMat);
      browMesh.position.set(0, torsoHeight * 0.58, 0.42 * m.torsoBulk);
      torsoGroup.add(browMesh);
    } else {
      const cuirassPts = [
        new THREE.Vector2(0.22 * m.torsoBulk, -0.08),
        new THREE.Vector2(0.32 * m.torsoBulk, 0.05),
        new THREE.Vector2(0.42 * m.torsoBulk, torsoHeight * 0.38),
        new THREE.Vector2(0.52 * m.torsoBulk * m.shoulderWidth * 0.85, torsoHeight * 0.78),
        new THREE.Vector2(0.34 * m.torsoBulk, torsoHeight * 0.96),
        new THREE.Vector2(0.22 * m.torsoBulk, torsoHeight * 1.04)
      ];
      const cuirassGeo = trackGeo(new THREE.LatheGeometry(cuirassPts, seg(12, 6)));
      cuirassGeo.scale(1.15, 1, 0.84);
      const cuirassMesh = new THREE.Mesh(cuirassGeo, primaryArmorMat);
      cuirassMesh.castShadow = true;
      torsoGroup.add(cuirassMesh);
      const isFeralAnimal = config.raceCategory === "starter_animals";
      if (isFeralAnimal) {
        const maneGeo = trackGeo(
          new THREE.SphereGeometry(0.36 * m.torsoBulk, seg(10, 6), seg(8, 5))
        );
        maneGeo.scale(1.12, 0.95, 1.18);
        const maneMesh = new THREE.Mesh(maneGeo, secondaryTrimMat);
        maneMesh.position.set(0, torsoHeight * 0.72, 0.14 * m.torsoBulk);
        maneMesh.castShadow = true;
        torsoGroup.add(maneMesh);
      } else {
        const gorgetGeo = trackGeo(
          new THREE.TorusGeometry(0.26 * m.torsoBulk, 0.065 * m.torsoBulk, 6, seg(12, 6))
        );
        gorgetGeo.rotateX(Math.PI / 2 - 0.15);
        const gorgetMesh = new THREE.Mesh(gorgetGeo, secondaryTrimMat);
        gorgetMesh.position.set(0, torsoHeight * 0.93, 0.03);
        torsoGroup.add(gorgetMesh);
        const chestShape = new THREE.Shape();
        chestShape.moveTo(-0.28 * m.torsoBulk, torsoHeight * 0.78);
        chestShape.lineTo(0.28 * m.torsoBulk, torsoHeight * 0.78);
        chestShape.lineTo(0.2 * m.torsoBulk, torsoHeight * 0.22);
        chestShape.lineTo(0, torsoHeight * 0.04);
        chestShape.lineTo(-0.2 * m.torsoBulk, torsoHeight * 0.22);
        chestShape.closePath();
        const chestPlateGeo = trackGeo(
          new THREE.ExtrudeGeometry(chestShape, {
            depth: 0.13 * m.torsoBulk,
            bevelEnabled: true,
            bevelThickness: 0.025,
            bevelSize: 0.02,
            bevelSegments: 1
          })
        );
        const chestPlateMesh = new THREE.Mesh(chestPlateGeo, secondaryTrimMat);
        chestPlateMesh.position.set(0, 0, 0.26 * m.torsoBulk);
        chestPlateMesh.castShadow = true;
        torsoGroup.add(chestPlateMesh);
      }
    }
    const socketCore = new THREE.Object3D();
    socketCore.name = "socket_core";
    socketCore.position.set(0, torsoHeight * 0.56, (isBeholder ? 0.55 : 0.44) * m.torsoBulk);
    torsoGroup.add(socketCore);
    const coreGeo = trackGeo(
      new THREE.OctahedronGeometry(
        (isBeholder ? 0.32 : 0.15) * m.torsoBulk,
        density === "low" ? 0 : 1
      )
    );
    const coreMesh = new THREE.Mesh(coreGeo, crystalCoreMat);
    coreMesh.name = "Runic_Core_Crystal";
    coreMesh.position.copy(socketCore.position);
    coreMesh.visible = config.raceCategory !== "starter_animals";
    torsoGroup.add(coreMesh);
    tagExplodablePart(coreMesh, new THREE.Vector3(0, 0.15, 0.8), {
      name: isBeholder ? "Iris Central del Ojo Tirano" : "N\xFAcleo Cristalino Elemental",
      category: "Accent Detail",
      vertexCount: 128,
      triangleCount: 160,
      materialSummary: "Cristal PBR con transmisi\xF3n \xF3ptica y emisi\xF3n",
      socketName: "socket_core"
    });
    explodableParts.push(coreMesh);
    const neckGroup = new THREE.Group();
    neckGroup.name = "Neck_Assembly";
    neckGroup.position.set(0, torsoHeight * 0.9, 0.05);
    if (isDragon) {
      neckGroup.rotation.x = -0.34;
    } else if (isQuadruped && !isCentaur) {
      neckGroup.rotation.x = -0.4;
    }
    torsoGroup.add(neckGroup);
    const neckLen = Math.max(0.18, 0.58 * m.neckLength);
    if (isDragon || isSerpentine || m.neckLength > 0.82) {
      const neckCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.08, -0.02),
        new THREE.Vector3(0, neckLen * 0.42, 0.13 * m.neckLength),
        new THREE.Vector3(0, neckLen * 0.82, 0.05 * m.neckLength),
        new THREE.Vector3(0, neckLen * 1.02, 0.17 * m.neckLength)
      ]);
      const neckTubeGeo = trackGeo(
        new THREE.TubeGeometry(neckCurve, seg(10, 6), 0.165 * m.torsoBulk, seg(8, 5), false)
      );
      const neckMesh = new THREE.Mesh(neckTubeGeo, primaryArmorMat);
      neckMesh.castShadow = true;
      neckGroup.add(neckMesh);
      const neckSpineCount = seg(4, 3);
      for (let ns = 1; ns <= neckSpineCount; ns++) {
        const pt = neckCurve.getPoint(ns / (neckSpineCount + 1));
        const nSpineGeo = trackGeo(new THREE.ConeGeometry(0.04, 0.14, 4));
        nSpineGeo.rotateX(-0.6);
        const nSpine = new THREE.Mesh(nSpineGeo, secondaryTrimMat);
        nSpine.position.set(0, pt.y, pt.z - 0.14 * m.torsoBulk);
        neckGroup.add(nSpine);
      }
    } else if (!isBeholder) {
      const shortNeckGeo = trackGeo(
        new THREE.CylinderGeometry(
          0.15 * m.torsoBulk,
          0.21 * m.torsoBulk,
          neckLen * 0.68,
          seg(8, 5)
        )
      );
      const shortNeckMesh = new THREE.Mesh(shortNeckGeo, underbodyMat);
      shortNeckMesh.position.y = neckLen * 0.22;
      neckGroup.add(shortNeckMesh);
    }
    const headGroup = new THREE.Group();
    headGroup.name = "Head_Helm_Assembly";
    const isLongNeck = isDragon || isSerpentine || m.neckLength > 0.82;
    headGroup.position.set(
      0,
      isBeholder ? -0.1 : isLongNeck ? neckLen * 0.96 : neckLen * 0.42,
      isLongNeck ? 0.16 * m.neckLength : 0.04
    );
    neckGroup.add(headGroup);
    const socketHead = new THREE.Object3D();
    socketHead.name = "socket_head";
    socketHead.position.set(0, 0.2, 0.28 * m.snoutLength);
    headGroup.add(socketHead);
    const jawGroup = new THREE.Group();
    jawGroup.name = "Articulated_Lower_Jaw";
    jawGroup.position.set(0, 0.08, 0.08);
    headGroup.add(jawGroup);
    const snoutLen = 0.36 * m.snoutLength;
    if (config.helm === "draconic_snout" || config.helm === "lupine_maw" || config.helm === "tauren_bull_horns") {
      const craniumGeo = trackGeo(new THREE.SphereGeometry(0.24, seg(10, 6), seg(8, 5)));
      craniumGeo.scale(0.95, 0.82, 1.18);
      const craniumMesh = new THREE.Mesh(craniumGeo, primaryArmorMat);
      craniumMesh.position.set(0, 0.19, 0.02);
      craniumMesh.castShadow = true;
      headGroup.add(craniumMesh);
      for (const side of [-1, 1]) {
        const browRidgeGeo = trackGeo(new THREE.BoxGeometry(0.09, 0.08, 0.32));
        const browRidge = new THREE.Mesh(browRidgeGeo, secondaryTrimMat);
        browRidge.position.set(side * 0.14, 0.27, 0.12);
        browRidge.rotation.y = side * 0.18;
        headGroup.add(browRidge);
      }
      const upperSnoutGeo = trackGeo(
        new THREE.CylinderGeometry(0.09, 0.2, snoutLen + 0.32, seg(8, 5))
      );
      upperSnoutGeo.rotateX(Math.PI / 2);
      upperSnoutGeo.scale(1, 0.72, 1);
      const upperSnoutMesh = new THREE.Mesh(upperSnoutGeo, primaryArmorMat);
      upperSnoutMesh.position.set(0, 0.17, 0.18 + snoutLen * 0.45);
      headGroup.add(upperSnoutMesh);
      if (config.helm === "tauren_bull_horns") {
        const noseRingGeo = trackGeo(new THREE.TorusGeometry(0.085, 0.018, 5, seg(10, 6)));
        const noseRingMesh = new THREE.Mesh(noseRingGeo, secondaryTrimMat);
        noseRingMesh.position.set(0, 0.1, 0.36 + snoutLen * 0.62);
        noseRingMesh.rotation.x = 0.3;
        headGroup.add(noseRingMesh);
      }
      for (const side of [-1, 1]) {
        const eyeGeo = trackGeo(new THREE.SphereGeometry(0.044, 6, 6));
        eyeGeo.scale(0.6, 0.8, 1.4);
        const eyeMesh = new THREE.Mesh(eyeGeo, emissiveRuneMat);
        eyeMesh.position.set(side * 0.15, 0.24, 0.16);
        headGroup.add(eyeMesh);
      }
      const lowerJawGeo = trackGeo(
        new THREE.CylinderGeometry(0.07, 0.16, snoutLen + 0.28, seg(6, 4))
      );
      lowerJawGeo.rotateX(Math.PI / 2);
      lowerJawGeo.scale(1, 0.5, 1);
      const lowerJawMesh = new THREE.Mesh(lowerJawGeo, secondaryTrimMat);
      lowerJawMesh.position.set(0, 0.01, (snoutLen + 0.22) * 0.5);
      jawGroup.add(lowerJawMesh);
      for (const side of [-1, 1]) {
        const isBoar = config.archetype === "rabid_razorback_boar" || config.archetype === "iron_boar_juggernaut";
        const fangGeo = trackGeo(
          new THREE.ConeGeometry(isBoar ? 0.038 : 0.028, isBoar ? 0.22 : 0.12, 4)
        );
        const fangMesh = new THREE.Mesh(fangGeo, ivoryFangMat);
        fangMesh.position.set(
          side * (isBoar ? 0.11 : 0.08),
          isBoar ? 0.11 : 0.06,
          snoutLen + 0.16
        );
        if (isBoar) {
          fangMesh.rotation.x = 0.35;
          fangMesh.rotation.z = -side * 0.28;
        }
        jawGroup.add(fangMesh);
      }
    } else if (config.helm === "avian_phoenix_beak") {
      const avianSkullGeo = trackGeo(new THREE.SphereGeometry(0.23, seg(10, 6), seg(8, 5)));
      avianSkullGeo.scale(0.95, 0.9, 1.15);
      const avianSkull = new THREE.Mesh(avianSkullGeo, primaryArmorMat);
      avianSkull.position.y = 0.2;
      headGroup.add(avianSkull);
      const beakGeo = trackGeo(new THREE.ConeGeometry(0.13, snoutLen + 0.34, seg(6, 4)));
      beakGeo.rotateX(Math.PI / 2.1);
      const beakMesh = new THREE.Mesh(beakGeo, secondaryTrimMat);
      beakMesh.position.set(0, 0.18, 0.26);
      headGroup.add(beakMesh);
    } else {
      const craniumGeo = trackGeo(
        config.helm === "monolith_visor" ? new THREE.OctahedronGeometry(0.26, density === "low" ? 0 : 1) : new THREE.SphereGeometry(0.23, seg(10, 6), seg(8, 5))
      );
      if (config.helm !== "monolith_visor") {
        craniumGeo.scale(0.92, 1.12, 1.05);
      }
      const craniumMesh = new THREE.Mesh(craniumGeo, primaryArmorMat);
      craniumMesh.position.y = 0.2;
      headGroup.add(craniumMesh);
      const faceplateGeo = trackGeo(new THREE.CylinderGeometry(0.18, 0.15, 0.28, seg(6, 5)));
      const faceplateMesh = new THREE.Mesh(faceplateGeo, secondaryTrimMat);
      faceplateMesh.position.set(0, 0.15, 0.06);
      headGroup.add(faceplateMesh);
      const visorGeo = trackGeo(new THREE.BoxGeometry(0.24, 0.045, 0.08));
      const visorMesh = new THREE.Mesh(visorGeo, emissiveRuneMat);
      visorMesh.position.set(0, 0.2, 0.18);
      headGroup.add(visorMesh);
    }
    if (m.hornLength > 0.05 && !isBeholder) {
      const isLupineEars = config.helm === "lupine_maw";
      const isStagAntlers = config.archetype === "furious_antler_stag";
      for (const side of [-1, 1]) {
        const hLen = 0.44 * m.hornLength;
        const hCurve = m.hornCurve;
        if (isLupineEars) {
          const earGeo = trackGeo(new THREE.ConeGeometry(0.075, 0.22 + hLen * 0.45, 4));
          earGeo.scale(0.65, 1, 1.25);
          const earMesh = new THREE.Mesh(earGeo, primaryArmorMat);
          earMesh.position.set(side * 0.16, 0.34 + hLen * 0.12, -0.04);
          earMesh.rotation.z = -side * 0.32;
          earMesh.rotation.x = -0.28;
          headGroup.add(earMesh);
        } else {
          const isSweepBack = config.helm === "draconic_snout" || config.helm === "avian_phoenix_beak";
          const socketRingGeo = trackGeo(new THREE.SphereGeometry(0.062, 6, 5));
          const socketRing = new THREE.Mesh(socketRingGeo, secondaryTrimMat);
          socketRing.position.set(side * 0.15, 0.27, 0.02);
          headGroup.add(socketRing);
          const hornPath = new THREE.CatmullRomCurve3([
            new THREE.Vector3(side * 0.15, 0.27, 0.02),
            new THREE.Vector3(
              side * (0.34 + hLen * 0.45),
              0.36 + hLen * 0.35,
              isSweepBack ? -0.25 * hCurve : 0.08 * hCurve
            ),
            new THREE.Vector3(
              side * (0.26 + hLen * 0.55),
              0.52 + hLen * 0.85,
              isSweepBack ? -0.58 * hCurve : 0.34 * hCurve
            )
          ]);
          const hornGeo = trackGeo(
            new THREE.TubeGeometry(hornPath, seg(8, 5), 0.045, seg(6, 4), false)
          );
          const hornMat = isDragon || config.raceCategory === "mythological" || isStagAntlers ? ivoryFangMat : secondaryTrimMat;
          const hornMesh = new THREE.Mesh(hornGeo, hornMat);
          headGroup.add(hornMesh);
          if (isStagAntlers) {
            for (let t = 1; t <= 2; t++) {
              const branchGeo = trackGeo(new THREE.ConeGeometry(0.032, 0.26, 4));
              const branchMesh = new THREE.Mesh(branchGeo, ivoryFangMat);
              branchMesh.position.set(
                side * (0.28 + t * 0.12),
                0.48 + t * 0.18,
                0.08 + t * 0.08
              );
              branchMesh.rotation.z = -side * 0.45;
              branchMesh.rotation.x = 0.45;
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
        sideNeck.position.x = side * 0.26 * m.torsoBulk;
        sideNeck.rotation.z = -side * 0.34;
        sideNeck.rotation.y = side * 0.25;
        sideNeck.scale.setScalar(0.88);
        torsoGroup.add(sideNeck);
        extraHeads.push(sideNeck);
      }
    }
    const breathGeo = trackGeo(new THREE.ConeGeometry(0.42, 2.2, seg(10, 6), 1, true));
    breathGeo.rotateX(-Math.PI / 2);
    breathGeo.translate(0, 0, 1.15);
    const breathMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(matCfg.emissiveColor),
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
        depthWrite: false,
        wireframe: true
      })
    );
    const breathConeMesh = new THREE.Mesh(breathGeo, breathMat);
    breathConeMesh.position.set(0, 0.14, 0.28 + snoutLen);
    breathConeMesh.scale.setScalar(1e-3);
    breathConeMesh.visible = false;
    headGroup.add(breathConeMesh);
    tagExplodablePart(headGroup, new THREE.Vector3(0, 0.85, 0.35), {
      name: headCount > 1 ? `Cabezas M\xFAltiples (${headCount}x Hidra/Cerbero)` : "Cr\xE1neo, Fauces y Cornamenta Continua",
      category: "Primary Silhouette",
      vertexCount: 420 * headCount,
      triangleCount: 360 * headCount,
      materialSummary: "Cr\xE1neo esculpido + p\xF3mulos + mand\xEDbula m\xF3vil + cuernos",
      socketName: "socket_head"
    });
    explodableParts.push(headGroup);
    const buildShoulder = (isLeft) => {
      const side = isLeft ? 1 : -1;
      const shoulderGroup = new THREE.Group();
      shoulderGroup.name = isLeft ? "Pauldron_L" : "Pauldron_R";
      shoulderGroup.position.set(
        side * 0.46 * m.torsoBulk * m.shoulderWidth,
        torsoHeight * 0.78,
        0
      );
      torsoGroup.add(shoulderGroup);
      if (!isBeholder) {
        if (config.raceCategory === "starter_animals" || m.pauldronSize <= 0.42) {
          const furShoulderGeo = trackGeo(
            new THREE.SphereGeometry(0.2 * m.torsoBulk, seg(8, 5), seg(6, 4))
          );
          furShoulderGeo.scale(0.95, 1.15, 1.25);
          const furShoulderMesh = new THREE.Mesh(furShoulderGeo, primaryArmorMat);
          furShoulderMesh.castShadow = true;
          shoulderGroup.add(furShoulderMesh);
        } else {
          const pShape = new THREE.Shape();
          pShape.moveTo(-side * 0.06, 0.22 * m.pauldronSize);
          pShape.lineTo(side * 0.36 * m.pauldronSize, 0.08 * m.pauldronSize);
          pShape.lineTo(side * 0.42 * m.pauldronSize, -0.2 * m.pauldronSize);
          pShape.lineTo(-side * 0.04, -0.14 * m.pauldronSize);
          pShape.closePath();
          const pauldronGeo = trackGeo(
            new THREE.ExtrudeGeometry(pShape, {
              depth: 0.34 * m.pauldronSize,
              bevelEnabled: true,
              bevelThickness: 0.025,
              bevelSize: 0.02,
              bevelSegments: 1
            })
          );
          pauldronGeo.center();
          const pauldronMesh = new THREE.Mesh(pauldronGeo, secondaryTrimMat);
          pauldronMesh.castShadow = true;
          shoulderGroup.add(pauldronMesh);
        }
      }
      tagExplodablePart(shoulderGroup, new THREE.Vector3(side * 0.75, 0.45, 0), {
        name: isLeft ? "Hombrera / Escama Escapular Izq." : "Hombrera / Escama Escapular Der.",
        category: "Secondary Read",
        vertexCount: 220,
        triangleCount: 180,
        materialSummary: "Placa escapular superpuesta al deltoides"
      });
      explodableParts.push(shoulderGroup);
      return shoulderGroup;
    };
    const leftShoulderGroup = buildShoulder(true);
    const rightShoulderGroup = buildShoulder(false);
    const buildArm = (isLeft) => {
      const side = isLeft ? 1 : -1;
      const armGroup = new THREE.Group();
      armGroup.name = isLeft ? "Arm_Or_Foreleg_L" : "Arm_Or_Foreleg_R";
      if (isQuadruped && !isCentaur) {
        armGroup.position.set(side * 0.32 * m.torsoBulk, pelvisY, 0.42);
        exportableGroup.add(armGroup);
      } else {
        armGroup.position.set(
          side * 0.46 * m.torsoBulk * m.shoulderWidth,
          torsoHeight * 0.74,
          0
        );
        torsoGroup.add(armGroup);
        if (isCentaur) {
          const equineHaunch = new THREE.Mesh(
            trackGeo(new THREE.SphereGeometry(0.18 * m.torsoBulk, seg(8, 5), seg(6, 4))),
            primaryArmorMat
          );
          equineHaunch.position.set(side * 0.26 * m.torsoBulk, pelvisY * 0.95, 0.42);
          exportableGroup.add(equineHaunch);
          const foreLeg = new THREE.Mesh(
            trackGeo(
              new THREE.CylinderGeometry(0.14 * m.torsoBulk, 0.1 * m.torsoBulk, legHeight, seg(8, 5))
            ),
            primaryArmorMat
          );
          foreLeg.position.set(side * 0.28 * m.torsoBulk, pelvisY * 0.5, 0.42);
          exportableGroup.add(foreLeg);
        }
      }
      const armLen = isQuadruped && !isCentaur ? legHeight : 0.78 * m.limbLength;
      const deltoidGeo = trackGeo(
        new THREE.SphereGeometry(0.155 * m.torsoBulk, seg(8, 5), seg(6, 4))
      );
      deltoidGeo.scale(0.95, 1.15, 1.05);
      const deltoidMesh = new THREE.Mesh(deltoidGeo, primaryArmorMat);
      deltoidMesh.position.set(-side * 0.04, 0, 0);
      armGroup.add(deltoidMesh);
      const upperArmGeo = trackGeo(
        new THREE.CylinderGeometry(0.135, 0.11, armLen * 0.52, seg(8, 5))
      );
      const upperArmMesh = new THREE.Mesh(
        upperArmGeo,
        isQuadruped ? primaryArmorMat : underbodyMat
      );
      upperArmMesh.position.y = -armLen * 0.24;
      armGroup.add(upperArmMesh);
      const elbowSphereGeo = trackGeo(new THREE.SphereGeometry(0.115, seg(7, 5), seg(5, 4)));
      const elbowSphere = new THREE.Mesh(elbowSphereGeo, secondaryTrimMat);
      elbowSphere.position.set(0, -armLen * 0.48, 0);
      armGroup.add(elbowSphere);
      const forearmGeo = trackGeo(
        new THREE.CylinderGeometry(0.135, 0.105, armLen * 0.54, seg(8, 5))
      );
      const forearmMesh = new THREE.Mesh(forearmGeo, primaryArmorMat);
      forearmMesh.position.set(0, -armLen * 0.72, isQuadruped ? 0.02 : 0.05);
      forearmMesh.rotation.x = isQuadruped ? 0 : -0.22;
      armGroup.add(forearmMesh);
      const handGeo = trackGeo(new THREE.BoxGeometry(0.18, 0.16, 0.25));
      const handMesh = new THREE.Mesh(handGeo, secondaryTrimMat);
      handMesh.position.set(0, -armLen * 0.94, 0.1);
      armGroup.add(handMesh);
      const handSocket = new THREE.Object3D();
      handSocket.name = isLeft ? "socket_shield_l" : "socket_weapon_r";
      handSocket.position.set(0, -armLen * 0.94, 0.16);
      armGroup.add(handSocket);
      tagExplodablePart(armGroup, new THREE.Vector3(side * 0.65, 0, 0.25), {
        name: isQuadruped ? isLeft ? "Extremidad Frontal Izquierda" : "Extremidad Frontal Derecha" : isLeft ? "Brazo Articulado Izquierdo" : "Brazo Articulado Derecho",
        category: "Secondary Read",
        vertexCount: 260,
        triangleCount: 210,
        materialSummary: "Deltoides, b\xEDceps, codera, brazal y guantelete continuos",
        socketName: handSocket.name
      });
      explodableParts.push(armGroup);
      return { armGroup, handSocket };
    };
    const { armGroup: leftArmGroup, handSocket: socketShieldL } = buildArm(true);
    const { armGroup: rightArmGroup, handSocket: socketWeaponR } = buildArm(false);
    const montarCabezaNueva = (e, eje, astil) => {
      const base = astil * 0.5;
      const L = e.largo, A = e.ancho;
      const pieza = (geo, mat, x, y, z) => {
        const malla = new THREE.Mesh(trackGeo(geo), mat);
        malla.position.set(x, y, z);
        eje.add(malla);
        return malla;
      };
      const extruida = (sh) => new THREE.ExtrudeGeometry(sh, { depth: 0.022, bevelEnabled: true, bevelThickness: 8e-3, bevelSize: 8e-3, bevelSegments: 1 });
      switch (e.cabeza) {
        case "hoja":
        case "curva": {
          const sh = new THREE.Shape();
          sh.moveTo(-A / 2, 0);
          if (e.cabeza === "curva") {
            sh.quadraticCurveTo(-A * 0.2, L * 0.6, 0, L);
            sh.quadraticCurveTo(A * 0.9, L * 0.45, A / 2, 0);
          } else {
            sh.lineTo(-A / 2, L * 0.88);
            sh.lineTo(0, L);
            sh.lineTo(A / 2, L * 0.88);
            sh.lineTo(A / 2, 0);
          }
          sh.closePath();
          pieza(extruida(sh), bladeAlloyMat, 0, base, 0);
          break;
        }
        case "hacha": {
          const sh = new THREE.Shape();
          sh.moveTo(0, 0);
          sh.quadraticCurveTo(A, L * 0.1, A, L * 0.6);
          sh.quadraticCurveTo(A * 0.5, L * 0.66, 0, L * 0.92);
          sh.closePath();
          const geo = extruida(sh);
          pieza(geo, bladeAlloyMat, 0.02, base, -0.012);
          if (e.doble) pieza(geo, bladeAlloyMat, -0.02, base, -0.012).scale.x = -1;
          break;
        }
        case "esfera":
          pieza(new THREE.SphereGeometry(A / 2, 10, 8), primaryArmorMat, 0, base + A * 0.3, 0);
          break;
        case "martillo":
          pieza(new THREE.BoxGeometry(A, L, A * 0.7), primaryArmorMat, 0, base + L / 2, 0);
          break;
        case "porra": {
          pieza(new THREE.CylinderGeometry(A * 0.35, A * 0.5, L, 8), primaryArmorMat, 0, base + L / 2, 0);
          for (let k = 0; k < 4; k++) {
            const a = k * Math.PI / 2;
            pieza(new THREE.ConeGeometry(0.03, 0.08, 4), bladeAlloyMat, Math.cos(a) * A * 0.45, base + L * 0.5, Math.sin(a) * A * 0.45);
          }
          break;
        }
        case "latigo": {
          pieza(new THREE.CylinderGeometry(0.018, 0.012, L, 5), underbodyMat, 0, base + L / 2, 0);
          for (let k = 1; k <= 6; k++) {
            pieza(new THREE.ConeGeometry(0.02, 0.07, 4), bladeAlloyMat, 0, base + L * k / 7, 0.02);
          }
          break;
        }
        case "cadena": {
          pieza(new THREE.TorusGeometry(0.03, 0.01, 4, 8), secondaryTrimMat, 0, base + 0.05, 0);
          pieza(new THREE.CylinderGeometry(0.01, 0.01, L * 0.5, 4), underbodyMat, 0, base + L * 0.25, 0);
          pieza(new THREE.SphereGeometry(A / 2, 10, 8), primaryArmorMat, 0, base + L * 0.5, 0);
          break;
        }
        case "punta":
          pieza(new THREE.ConeGeometry(A / 2, L, 6), bladeAlloyMat, 0, base + L / 2, 0);
          break;
        case "garras":
          for (let k = -1; k <= 1; k++) {
            pieza(new THREE.ConeGeometry(A * 0.12, L, 5), bladeAlloyMat, k * A * 0.3, base + L / 2, 0).rotation.z = -k * 0.25;
          }
          break;
      }
    };
    const weaponGroup = new THREE.Group();
    weaponGroup.name = `Weapon_${config.weapon}`;
    weaponGroup.scale.setScalar(m.weaponScale);
    socketWeaponR.add(weaponGroup);
    if (config.weapon === "feral_claws_fangs" || config.weapon === "dragon_breath_maw") {
      for (let c = -1; c <= 1; c++) {
        const talonGeo = trackGeo(new THREE.ConeGeometry(0.036, 0.28, 5));
        talonGeo.rotateX(Math.PI / 2.2);
        const talonR = new THREE.Mesh(talonGeo, ivoryFangMat);
        talonR.position.set(c * 0.065, -0.02, 0.14);
        weaponGroup.add(talonR);
        const talonL = talonR.clone();
        socketShieldL.add(talonL);
      }
    } else {
      const nueva = ARMAS_NUEVAS[config.weapon];
      const shaftLen = nueva ? nueva.asta : config.weapon === "arcane_staff" || config.weapon === "radiant_halberd" ? 1.85 : 1.15;
      const shaftGeo = trackGeo(new THREE.CylinderGeometry(0.032, 0.038, shaftLen, seg(8, 5)));
      const shaftMesh = new THREE.Mesh(shaftGeo, underbodyMat);
      shaftMesh.position.set(0, 0.25, 0.25);
      shaftMesh.rotation.x = Math.PI / 2.4;
      weaponGroup.add(shaftMesh);
      const guardGeo = trackGeo(new THREE.BoxGeometry(0.28, 0.06, 0.09));
      const guardMesh = new THREE.Mesh(guardGeo, secondaryTrimMat);
      guardMesh.position.set(0, shaftLen * 0.45, 0);
      shaftMesh.add(guardMesh);
      if (config.weapon === "runic_greatsword" || config.weapon === "venom_scythe_claws") {
        const bladeShape = new THREE.Shape();
        bladeShape.moveTo(-0.085, 0);
        bladeShape.lineTo(0.085, 0);
        bladeShape.lineTo(0.055, 1.05);
        bladeShape.lineTo(0, 1.32);
        bladeShape.lineTo(-0.055, 1.05);
        bladeShape.closePath();
        const bladeGeo = trackGeo(
          new THREE.ExtrudeGeometry(bladeShape, {
            depth: 0.024,
            bevelEnabled: true,
            bevelThickness: 0.01,
            bevelSize: 0.012,
            bevelSegments: 1
          })
        );
        bladeGeo.center();
        const bladeMesh = new THREE.Mesh(bladeGeo, bladeAlloyMat);
        bladeMesh.position.set(0, shaftLen * 0.5 + 0.52, 0);
        shaftMesh.add(bladeMesh);
        const runeStripGeo = trackGeo(new THREE.BoxGeometry(0.03, 0.85, 0.048));
        const runeStripMesh = new THREE.Mesh(runeStripGeo, emissiveRuneMat);
        runeStripMesh.position.set(0, shaftLen * 0.5 + 0.38, 0);
        shaftMesh.add(runeStripMesh);
      } else if (config.weapon === "obsidian_warhammer") {
        const headGeo = trackGeo(new THREE.BoxGeometry(0.56, 0.34, 0.34));
        const hammerHead = new THREE.Mesh(headGeo, primaryArmorMat);
        hammerHead.position.set(0, shaftLen * 0.5 + 0.14, 0);
        shaftMesh.add(hammerHead);
      } else if (config.weapon === "arcane_staff") {
        const finialGeo = trackGeo(new THREE.TorusGeometry(0.22, 0.035, 6, seg(16, 8)));
        const finialMesh = new THREE.Mesh(finialGeo, secondaryTrimMat);
        finialMesh.position.set(0, shaftLen * 0.5 + 0.2, 0);
        shaftMesh.add(finialMesh);
        const orbGeo = trackGeo(new THREE.OctahedronGeometry(0.12, density === "low" ? 0 : 1));
        const orbMesh = new THREE.Mesh(orbGeo, crystalCoreMat);
        orbMesh.position.set(0, shaftLen * 0.5 + 0.2, 0);
        shaftMesh.add(orbMesh);
      } else if (nueva) {
        montarCabezaNueva(nueva, shaftMesh, shaftLen);
      } else {
        const axeShape = new THREE.Shape();
        axeShape.moveTo(0, -0.16);
        axeShape.quadraticCurveTo(0.42, -0.05, 0.48, 0.3);
        axeShape.quadraticCurveTo(0.25, 0.08, 0, 0.24);
        axeShape.closePath();
        const axeGeo = trackGeo(
          new THREE.ExtrudeGeometry(axeShape, {
            depth: 0.025,
            bevelEnabled: true,
            bevelThickness: 0.012,
            bevelSize: 0.012,
            bevelSegments: 1
          })
        );
        const axeBladeR = new THREE.Mesh(axeGeo, bladeAlloyMat);
        axeBladeR.position.set(0.02, shaftLen * 0.45, -0.012);
        shaftMesh.add(axeBladeR);
        const axeBladeL = axeBladeR.clone();
        axeBladeL.scale.x = -1;
        axeBladeL.position.x = -0.02;
        shaftMesh.add(axeBladeL);
      }
    }
    tagExplodablePart(weaponGroup, new THREE.Vector3(-0.65, 0.15, 0.75), {
      name: `Armamento Principal (${config.weapon})`,
      category: "Weapon & Socket",
      vertexCount: 310,
      triangleCount: 250,
      materialSummary: "Anclado a socket_weapon_r con textura Damasco",
      socketName: "socket_weapon_r"
    });
    explodableParts.push(weaponGroup);
    const escudo = escudoValido(config.weapon, config.offhand);
    const offhandGroup = new THREE.Group();
    offhandGroup.name = `Offhand_${escudo}`;
    socketShieldL.add(offhandGroup);
    if (escudo === "tower_shield" || escudo === "runic_buckler") {
      const isTower = escudo === "tower_shield";
      const shW = isTower ? 0.42 : 0.32;
      const shH = isTower ? 0.88 : 0.42;
      const shieldShape = new THREE.Shape();
      shieldShape.moveTo(-shW, shH * 0.5);
      shieldShape.lineTo(shW, shH * 0.5);
      shieldShape.lineTo(shW * 0.85, -shH * 0.25);
      shieldShape.lineTo(0, -shH * 0.6);
      shieldShape.lineTo(-shW * 0.85, -shH * 0.25);
      shieldShape.closePath();
      const shieldGeo = trackGeo(
        new THREE.ExtrudeGeometry(shieldShape, {
          depth: 0.06,
          bevelEnabled: true,
          bevelThickness: 0.02,
          bevelSize: 0.02,
          bevelSegments: 1
        })
      );
      const shieldMesh = new THREE.Mesh(shieldGeo, primaryArmorMat);
      shieldMesh.position.set(0.16, 0, 0.12);
      shieldMesh.rotation.y = 0.45;
      offhandGroup.add(shieldMesh);
    } else if (escudo === "phylactery_orb") {
      const censerGeo = trackGeo(
        new THREE.IcosahedronGeometry(0.16, density === "low" ? 0 : 1)
      );
      const censerMesh = new THREE.Mesh(censerGeo, crystalCoreMat);
      censerMesh.position.set(0.1, 0.08, 0.24);
      offhandGroup.add(censerMesh);
    } else if (escudo === "dual_blade") {
      const daggerGeo = trackGeo(new THREE.ConeGeometry(0.08, 0.85, seg(6, 4)));
      const daggerMesh = new THREE.Mesh(daggerGeo, bladeAlloyMat);
      daggerMesh.position.set(0, 0.1, 0.42);
      daggerMesh.rotation.x = Math.PI / 2;
      offhandGroup.add(daggerMesh);
    }
    const dorsalGroup = new THREE.Group();
    dorsalGroup.name = `Dorsal_${config.dorsal}`;
    dorsalGroup.position.set(0, torsoHeight * 0.68, -0.18 * m.torsoBulk);
    dorsalGroup.scale.setScalar(m.dorsalScale);
    torsoGroup.add(dorsalGroup);
    const leftWingGroup = new THREE.Group();
    leftWingGroup.name = "Wing_L";
    const rightWingGroup = new THREE.Group();
    rightWingGroup.name = "Wing_R";
    dorsalGroup.add(leftWingGroup);
    dorsalGroup.add(rightWingGroup);
    if (config.dorsal === "dragon_membrane_wings") {
      for (const side of [-1, 1]) {
        const targetWing = side === 1 ? leftWingGroup : rightWingGroup;
        const wingRootGeo = trackGeo(new THREE.SphereGeometry(0.13, seg(6, 4), seg(5, 4)));
        const wingRoot = new THREE.Mesh(wingRootGeo, secondaryTrimMat);
        wingRoot.position.set(side * 0.08, 0.02, 0.04);
        targetWing.add(wingRoot);
        const sparCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(side * 0.04, 0, 0.04),
          new THREE.Vector3(side * 0.55, 0.48, -0.08),
          new THREE.Vector3(side * 1.25, 0.62, -0.16),
          new THREE.Vector3(side * 1.65, 0.15, -0.22)
        ]);
        const sparGeo = trackGeo(
          new THREE.TubeGeometry(sparCurve, seg(10, 6), 0.044, seg(6, 4), false)
        );
        targetWing.add(new THREE.Mesh(sparGeo, primaryArmorMat));
        const webShape = new THREE.Shape();
        webShape.moveTo(0, 0);
        webShape.lineTo(side * 0.55, 0.46);
        webShape.lineTo(side * 1.25, 0.6);
        webShape.lineTo(side * 1.62, 0.14);
        webShape.quadraticCurveTo(side * 1.15, -0.15, side * 0.85, -0.45);
        webShape.quadraticCurveTo(side * 0.45, -0.2, 0, -0.35);
        webShape.closePath();
        const webGeo = trackGeo(
          new THREE.ExtrudeGeometry(webShape, { depth: 0.02, bevelEnabled: false })
        );
        const webMesh = new THREE.Mesh(webGeo, secondaryTrimMat);
        webMesh.position.z = -0.08;
        targetWing.add(webMesh);
      }
    } else if (config.dorsal === "seraph_wings") {
      for (const side of [-1, 1]) {
        const targetWing = side === 1 ? leftWingGroup : rightWingGroup;
        const wingArchGeo = trackGeo(new THREE.SphereGeometry(0.12, 6, 5));
        wingArchGeo.scale(1.8, 0.8, 0.8);
        const wingArch = new THREE.Mesh(wingArchGeo, secondaryTrimMat);
        wingArch.position.set(side * 0.15, 0.15, 0);
        targetWing.add(wingArch);
        for (let f = 0; f < 6; f++) {
          const featherGeo = trackGeo(new THREE.BoxGeometry(0.09, 0.85 - f * 0.1, 0.03));
          const featherMesh = new THREE.Mesh(
            featherGeo,
            f % 2 === 0 ? secondaryTrimMat : emissiveRuneMat
          );
          featherMesh.position.set(side * (0.22 + f * 0.16), 0.22 - f * 0.05, -0.03 * f);
          featherMesh.rotation.z = -side * (0.42 + f * 0.15);
          targetWing.add(featherMesh);
        }
      }
    } else if (config.dorsal === "beholder_eye_tentacles") {
      for (let i = 0; i < 8; i++) {
        const ang = i / 8 * Math.PI * 2;
        const rx = Math.cos(ang);
        const rz = Math.sin(ang);
        const stalkCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(rx * 0.18, 0.05, rz * 0.18),
          new THREE.Vector3(rx * 0.65, 0.45 + i % 2 * 0.18, rz * 0.65),
          new THREE.Vector3(rx * 0.88, 0.28 + i % 3 * 0.15, rz * 0.88)
        ]);
        const stalkGeo = trackGeo(
          new THREE.TubeGeometry(stalkCurve, seg(8, 5), 0.04, seg(5, 4), false)
        );
        dorsalGroup.add(new THREE.Mesh(stalkGeo, primaryArmorMat));
        const tipEye = new THREE.Mesh(
          trackGeo(new THREE.SphereGeometry(0.068, seg(8, 5), seg(6, 4))),
          emissiveRuneMat
        );
        tipEye.position.set(rx * 0.88, 0.28 + i % 3 * 0.15, rz * 0.88);
        dorsalGroup.add(tipEye);
      }
    } else if (config.dorsal === "tattered_mantle") {
      const capeShape = new THREE.Shape();
      capeShape.moveTo(-0.42, 0.24);
      capeShape.lineTo(0.42, 0.24);
      capeShape.lineTo(0.58, -1.25);
      capeShape.lineTo(0, -1.32);
      capeShape.lineTo(-0.58, -1.25);
      capeShape.closePath();
      const capeGeo = trackGeo(
        new THREE.ExtrudeGeometry(capeShape, { depth: 0.03, bevelEnabled: false })
      );
      const capeMesh = new THREE.Mesh(capeGeo, underbodyMat);
      capeMesh.rotation.x = 0.14;
      dorsalGroup.add(capeMesh);
    } else if (config.dorsal === "crystal_pylons" || config.dorsal === "bio_chitin_spines") {
      for (let i = -2; i <= 2; i++) {
        if (i === 0) continue;
        const pylonGeo = trackGeo(new THREE.OctahedronGeometry(0.11, 0));
        pylonGeo.scale(0.8, 3.4, 0.8);
        const pylonMesh = new THREE.Mesh(
          pylonGeo,
          config.dorsal === "crystal_pylons" ? crystalCoreMat : secondaryTrimMat
        );
        pylonMesh.position.set(i * 0.16, 0.22 + (2 - Math.abs(i)) * 0.12, -0.04);
        pylonMesh.rotation.z = -i * 0.25;
        pylonMesh.rotation.x = -0.22;
        dorsalGroup.add(pylonMesh);
      }
    } else if (config.dorsal === "runic_halo_ring") {
      const haloGeo = trackGeo(new THREE.TorusGeometry(0.52, 0.035, 6, seg(20, 12)));
      const haloMesh = new THREE.Mesh(haloGeo, emissiveRuneMat);
      haloMesh.position.set(0, 0.28, -0.04);
      dorsalGroup.add(haloMesh);
    }
    tagExplodablePart(dorsalGroup, new THREE.Vector3(0, 0.55, -0.85), {
      name: `Alas / Estructura Dorsal (${config.dorsal})`,
      category: "Secondary Read",
      vertexCount: 380,
      triangleCount: 310,
      materialSummary: "Uni\xF3n escapular continua al torso dorsal"
    });
    explodableParts.push(dorsalGroup);
    const tailGroup = new THREE.Group();
    tailGroup.name = "Articulated_Tail";
    tailGroup.position.set(0, 0.06, isQuadruped || isArachnid ? -0.52 : -0.22 * m.torsoBulk);
    pelvisGroup.add(tailGroup);
    if (m.tailLength > 0.08 && !isSerpentine) {
      const tLen = 1.15 * m.tailLength;
      const isScorpion = config.dorsal === "scorpion_stinger_tail" || isArachnid || config.archetype === "manticore_chimera";
      const tailRootGeo = trackGeo(
        new THREE.SphereGeometry(0.15 * m.torsoBulk, seg(8, 5), seg(6, 4))
      );
      tailRootGeo.scale(1, 0.9, 1.35);
      const tailRootMesh = new THREE.Mesh(tailRootGeo, primaryArmorMat);
      tailRootMesh.position.set(0, 0, 0.06);
      tailGroup.add(tailRootMesh);
      const tailCurve = isScorpion ? new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0.08),
        new THREE.Vector3(0, 0.45 * tLen, -0.45 * tLen),
        new THREE.Vector3(0, 1.05 * tLen, -0.25 * tLen),
        new THREE.Vector3(0, 1.25 * tLen, 0.25 * tLen)
      ]) : new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0.08),
        new THREE.Vector3(0, -0.16, -0.45 * tLen),
        new THREE.Vector3(0, -0.22, -0.95 * tLen),
        new THREE.Vector3(0, -0.1, -1.35 * tLen)
      ]);
      const isBushyTail = config.archetype === "furious_keltir" || config.archetype === "rabid_grey_wolf" || config.archetype === "dire_wolf";
      const tailGeo = trackGeo(
        new THREE.TubeGeometry(
          tailCurve,
          seg(12, 7),
          (isBushyTail ? 0.165 : 0.11) * m.torsoBulk,
          seg(7, 4),
          false
        )
      );
      const tailMesh = new THREE.Mesh(tailGeo, primaryArmorMat);
      tailGroup.add(tailMesh);
      const tipPt = tailCurve.getPoint(1);
      const stingerGeo = trackGeo(
        new THREE.ConeGeometry(isBushyTail ? 0.18 : 0.13, isBushyTail ? 0.44 : 0.36, 6)
      );
      stingerGeo.rotateX(isScorpion ? Math.PI * 0.65 : -Math.PI / 2);
      const stingerMesh = new THREE.Mesh(
        stingerGeo,
        isScorpion ? emissiveRuneMat : secondaryTrimMat
      );
      stingerMesh.position.copy(tipPt);
      tailGroup.add(stingerMesh);
      tagExplodablePart(tailGroup, new THREE.Vector3(0, -0.1, -0.95), {
        name: isScorpion ? "Aguij\xF3n Caudal Articulado" : "Cola Drac\xF3nica / Bestial Continua",
        category: "Secondary Read",
        vertexCount: 220,
        triangleCount: 180,
        materialSummary: "Base caudal fusionada a la pelvis + aguij\xF3n/maza"
      });
      explodableParts.push(tailGroup);
    }
    let auraInstancedMesh = null;
    const shardData = [];
    const rawShardCount = Math.max(0, Math.round(m.auraShardCount));
    const shardCount = density === "low" ? Math.min(8, Math.ceil(rawShardCount * 0.5)) : rawShardCount;
    if (shardCount > 0) {
      const shardGeo = trackGeo(new THREE.OctahedronGeometry(0.055, 0));
      shardGeo.scale(0.7, 1.8, 0.7);
      auraInstancedMesh = new THREE.InstancedMesh(shardGeo, emissiveRuneMat, shardCount);
      auraInstancedMesh.name = "Aura_Runic_Shards";
      auraInstancedMesh.frustumCulled = false;
      const baseColor = new THREE.Color(matCfg.emissiveColor);
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
    const hitboxGroup = new THREE.Group();
    hitboxGroup.name = "Tactical_Hitboxes_And_Sockets";
    rootGroup.add(hitboxGroup);
    const hitboxWireMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 1096065,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
        depthWrite: false
      })
    );
    const headHitboxMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 16007006,
        wireframe: true,
        transparent: true,
        opacity: 0.65,
        depthWrite: false
      })
    );
    const torsoColGeo = trackGeo(
      new THREE.CylinderGeometry(
        config.stats.torsoHitboxRadius,
        config.stats.torsoHitboxRadius,
        config.stats.torsoHitboxHeight,
        12,
        1,
        true
      )
    );
    const torsoColMesh = new THREE.Mesh(torsoColGeo, hitboxWireMat);
    torsoColMesh.position.set(0, config.stats.torsoHitboxHeight * 0.5 + 0.25, 0);
    hitboxGroup.add(torsoColMesh);
    const headColGeo = trackGeo(new THREE.SphereGeometry(config.stats.headHitboxRadius, 10, 8));
    const headColMesh = new THREE.Mesh(headColGeo, headHitboxMat);
    const headWorldPos = new THREE.Vector3();
    socketHead.getWorldPosition(headWorldPos);
    headColMesh.position.copy(headWorldPos);
    hitboxGroup.add(headColMesh);
    const rangeRingGeo = trackGeo(
      new THREE.RingGeometry(
        Math.max(0.5, config.stats.attackRange * 0.35 - 0.04),
        config.stats.attackRange * 0.35,
        36
      )
    );
    rangeRingGeo.rotateX(-Math.PI / 2);
    const rangeRingMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 16096779,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2
      })
    );
    const rangeRingMesh = new THREE.Mesh(rangeRingGeo, rangeRingMat);
    rangeRingMesh.position.y = 0.03;
    hitboxGroup.add(rangeRingMesh);
    const addSocketGizmo = (socket) => {
      const axes = new THREE.AxesHelper(0.28);
      socket.add(axes);
    };
    addSocketGizmo(socketHead);
    addSocketGizmo(socketWeaponR);
    addSocketGizmo(socketShieldL);
    addSocketGizmo(socketCore);
    let totalVertices = 0;
    let totalTriangles = 0;
    let partCount = 0;
    exportableGroup.traverse((obj) => {
      const mesh = obj;
      if (mesh.isMesh && mesh.geometry) {
        partCount++;
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
    return {
      rootGroup,
      exportableGroup,
      hitboxGroup,
      materials: {
        primaryArmorMat,
        secondaryTrimMat,
        underbodyMat,
        emissiveRuneMat,
        crystalCoreMat
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
        leftLegGroup,
        rightLegGroup,
        leftWingGroup,
        rightWingGroup,
        tailGroup,
        dorsalGroup,
        weaponGroup,
        offhandGroup,
        coreMesh,
        breathConeMesh,
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
      metrics: {
        totalVertices: Math.round(totalVertices),
        totalTriangles: Math.round(totalTriangles),
        partCount
      },
      dispose: () => {
        geometriesToDispose.forEach((g) => g.dispose());
        materialsToDispose.forEach((mItem) => mItem.dispose());
      }
    };
  }
  function alturaBasePelvis(pelvis) {
    if (pelvis.userData.alturaBase === void 0) pelvis.userData.alturaBase = pelvis.position.y;
    return pelvis.userData.alturaBase;
  }
  function updateEnemyAnimation(rig, animState, elapsed, delta, speedMultiplier, explodedAmount) {
    const t = elapsed * speedMultiplier;
    const {
      pelvisGroup,
      neckGroup,
      headGroup,
      jawGroup,
      extraHeads,
      leftShoulderGroup,
      rightShoulderGroup,
      leftArmGroup,
      rightArmGroup,
      leftLegGroup,
      rightLegGroup,
      leftWingGroup,
      rightWingGroup,
      tailGroup,
      dorsalGroup,
      coreMesh,
      breathConeMesh,
      auraInstancedMesh
    } = rig.parts;
    const bodyPlan = rig.exportableGroup.userData.bodyPlan;
    const isFloating = bodyPlan === "floating_magical";
    const isDragon = bodyPlan === "dragon_wyvern";
    for (let i = 0; i < rig.explodableParts.length; i++) {
      const part = rig.explodableParts[i];
      const basePos = part.userData.basePos;
      const explodeVec = part.userData.explodeVec;
      if (basePos && explodeVec) {
        _targetPos.copy(basePos).addScaledVector(explodeVec, explodedAmount);
        part.position.x = THREE.MathUtils.damp(part.position.x, _targetPos.x, 8, delta);
        part.position.y = THREE.MathUtils.damp(part.position.y, _targetPos.y, 8, delta);
        part.position.z = THREE.MathUtils.damp(part.position.z, _targetPos.z, 8, delta);
      }
    }
    if (isFloating && pelvisGroup.userData.basePos) {
      pelvisGroup.position.y = pelvisGroup.userData.basePos.y + Math.sin(t * 2.4) * 0.14;
    }
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
    const tailWave = Math.sin(t * 3);
    tailGroup.rotation.y = THREE.MathUtils.damp(tailGroup.rotation.y, tailWave * 0.26, 8, delta);
    for (let i = 0; i < extraHeads.length; i++) {
      const eh = extraHeads[i];
      const phase = i === 0 ? 1.4 : -1.4;
      eh.rotation.x = Math.sin(t * 2.4 + phase) * 0.12;
    }
    const wingFlap = Math.sin(t * (animState === "attack" ? 6.5 : 3.2));
    leftWingGroup.rotation.y = THREE.MathUtils.damp(leftWingGroup.rotation.y, wingFlap * 0.42, 10, delta);
    rightWingGroup.rotation.y = THREE.MathUtils.damp(rightWingGroup.rotation.y, -wingFlap * 0.42, 10, delta);
    const dampLambda = 10;
    if (animState === "idle") {
      const breath = Math.sin(t * 2.2);
      breathConeMesh.visible = false;
      jawGroup.rotation.x = THREE.MathUtils.damp(jawGroup.rotation.x, Math.max(0, breath * 0.12), dampLambda, delta);
      neckGroup.rotation.y = THREE.MathUtils.damp(neckGroup.rotation.y, Math.sin(t * 1.1) * 0.14, dampLambda, delta);
      headGroup.rotation.y = THREE.MathUtils.damp(headGroup.rotation.y, Math.sin(t * 1.1) * 0.12, dampLambda, delta);
      headGroup.rotation.x = THREE.MathUtils.damp(headGroup.rotation.x, -breath * 0.04, dampLambda, delta);
      leftShoulderGroup.rotation.z = THREE.MathUtils.damp(leftShoulderGroup.rotation.z, breath * 0.05, dampLambda, delta);
      rightShoulderGroup.rotation.z = THREE.MathUtils.damp(rightShoulderGroup.rotation.z, -breath * 0.05, dampLambda, delta);
      rightArmGroup.rotation.x = THREE.MathUtils.damp(rightArmGroup.rotation.x, -0.15 + breath * 0.06, dampLambda, delta);
      leftArmGroup.rotation.x = THREE.MathUtils.damp(leftArmGroup.rotation.x, -0.18 - breath * 0.05, dampLambda, delta);
      leftLegGroup.rotation.x = THREE.MathUtils.damp(leftLegGroup.rotation.x, 0, dampLambda, delta);
      rightLegGroup.rotation.x = THREE.MathUtils.damp(rightLegGroup.rotation.x, 0, dampLambda, delta);
      pelvisGroup.rotation.x = THREE.MathUtils.damp(pelvisGroup.rotation.x, 0, dampLambda, delta);
      tailGroup.rotation.x = THREE.MathUtils.damp(tailGroup.rotation.x, 0, dampLambda, delta);
    } else if (animState === "walk") {
      breathConeMesh.visible = false;
      const stride = Math.sin(t * 5.6);
      const bounce = Math.abs(Math.cos(t * 5.6)) * 0.06;
      pelvisGroup.position.y = alturaBasePelvis(pelvisGroup) + bounce;
      headGroup.rotation.y = THREE.MathUtils.damp(headGroup.rotation.y, stride * 0.1, dampLambda, delta);
      jawGroup.rotation.x = THREE.MathUtils.damp(jawGroup.rotation.x, 0.15, dampLambda, delta);
      leftLegGroup.rotation.x = THREE.MathUtils.damp(leftLegGroup.rotation.x, stride * 0.55, dampLambda, delta);
      rightLegGroup.rotation.x = THREE.MathUtils.damp(rightLegGroup.rotation.x, -stride * 0.55, dampLambda, delta);
      rightArmGroup.rotation.x = THREE.MathUtils.damp(rightArmGroup.rotation.x, stride * 0.48 - 0.15, dampLambda, delta);
      leftArmGroup.rotation.x = THREE.MathUtils.damp(leftArmGroup.rotation.x, -stride * 0.48 - 0.15, dampLambda, delta);
      dorsalGroup.rotation.x = THREE.MathUtils.damp(dorsalGroup.rotation.x, 0.14 + Math.abs(stride) * 0.1, dampLambda, delta);
    } else if (animState === "attack") {
      const cycle = t * 2.5 % (Math.PI * 2);
      const swing = Math.sin(cycle);
      const lunge = Math.max(0, Math.sin(cycle - 0.4));
      jawGroup.rotation.x = THREE.MathUtils.damp(jawGroup.rotation.x, lunge * 0.65, 16, delta);
      if (isDragon || isFloating || bodyPlan === "serpentine_naga") {
        breathConeMesh.visible = lunge > 0.15;
        const bScale = Math.max(0.01, lunge * 1.15);
        breathConeMesh.scale.set(bScale, bScale, bScale * 1.3);
        breathConeMesh.rotation.z = t * 6;
      } else {
        breathConeMesh.visible = false;
      }
      tailGroup.rotation.x = THREE.MathUtils.damp(tailGroup.rotation.x, lunge * 0.65, 14, delta);
      rightArmGroup.rotation.x = THREE.MathUtils.damp(
        rightArmGroup.rotation.x,
        swing > 0 ? -1.55 + lunge * 2.35 : -0.35,
        16,
        delta
      );
      leftArmGroup.rotation.x = THREE.MathUtils.damp(leftArmGroup.rotation.x, -0.65 + swing * 0.35, 12, delta);
      leftLegGroup.rotation.x = THREE.MathUtils.damp(leftLegGroup.rotation.x, -lunge * 0.32, 12, delta);
      rightLegGroup.rotation.x = THREE.MathUtils.damp(rightLegGroup.rotation.x, lunge * 0.32, 12, delta);
    } else if (animState === "hit") {
      breathConeMesh.visible = false;
      const stagger = Math.sin(t * 9) * 0.25;
      jawGroup.rotation.x = THREE.MathUtils.damp(jawGroup.rotation.x, 0.45, 16, delta);
      headGroup.rotation.x = THREE.MathUtils.damp(headGroup.rotation.x, -0.38 + stagger, 16, delta);
      rightArmGroup.rotation.z = THREE.MathUtils.damp(rightArmGroup.rotation.z, -0.5, 14, delta);
      leftArmGroup.rotation.z = THREE.MathUtils.damp(leftArmGroup.rotation.z, 0.5, 14, delta);
    } else if (animState === "death") {
      breathConeMesh.visible = false;
      pelvisGroup.rotation.x = THREE.MathUtils.damp(pelvisGroup.rotation.x, 1.05, 5, delta);
      headGroup.rotation.x = THREE.MathUtils.damp(headGroup.rotation.x, 0.45, 5, delta);
      rightArmGroup.rotation.x = THREE.MathUtils.damp(rightArmGroup.rotation.x, -1.15, 5, delta);
      leftArmGroup.rotation.x = THREE.MathUtils.damp(leftArmGroup.rotation.x, -1.05, 5, delta);
    }
    if (animState !== "walk" && !isFloating) {
      pelvisGroup.position.y = THREE.MathUtils.damp(pelvisGroup.position.y, alturaBasePelvis(pelvisGroup), dampLambda, delta);
    }
  }

  // tools/enemigos-src/three/proceduralTextures.ts
  var THREE2 = globalThis.THREE;
  function configureTileableTexture(canvas, maxAnisotropy, isColor, repeatX = 3, repeatY = 3) {
    const tex = new THREE2.CanvasTexture(canvas);
    tex.colorSpace = isColor ? THREE2.SRGBColorSpace : THREE2.NoColorSpace;
    tex.wrapS = THREE2.RepeatWrapping;
    tex.wrapT = THREE2.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.anisotropy = maxAnisotropy;
    return tex;
  }
  function createScalesPattern(maxAnisotropy) {
    const size = 256;
    const albCanvas = document.createElement("canvas");
    albCanvas.width = size;
    albCanvas.height = size;
    const aCtx = albCanvas.getContext("2d");
    const bumpCanvas = document.createElement("canvas");
    bumpCanvas.width = size;
    bumpCanvas.height = size;
    const bCtx = bumpCanvas.getContext("2d");
    aCtx.fillStyle = "#525252";
    aCtx.fillRect(0, 0, size, size);
    bCtx.fillStyle = "#262626";
    bCtx.fillRect(0, 0, size, size);
    const rows = 8;
    const cols = 8;
    const cellW = size / cols;
    const cellH = size / rows;
    for (let r = -1; r <= rows; r++) {
      for (let c = -1; c <= cols; c++) {
        const offsetX = r % 2 * (cellW * 0.5);
        const cx = c * cellW + offsetX + cellW * 0.5;
        const cy = r * cellH + cellH * 0.5;
        const rad = cellW * 0.58;
        const aGrad = aCtx.createRadialGradient(cx, cy - rad * 0.25, rad * 0.1, cx, cy, rad);
        aGrad.addColorStop(0, "#ffffff");
        aGrad.addColorStop(0.68, "#d4d4d4");
        aGrad.addColorStop(0.92, "#686868");
        aGrad.addColorStop(1, "#2a2a2a");
        aCtx.fillStyle = aGrad;
        aCtx.beginPath();
        aCtx.arc(cx, cy, rad, 0, Math.PI * 2);
        aCtx.fill();
        aCtx.strokeStyle = "rgba(255,255,255,0.45)";
        aCtx.lineWidth = 2;
        aCtx.beginPath();
        aCtx.moveTo(cx, cy - rad * 0.45);
        aCtx.lineTo(cx, cy + rad * 0.45);
        aCtx.stroke();
        const bGrad = bCtx.createRadialGradient(cx, cy - rad * 0.2, rad * 0.08, cx, cy, rad);
        bGrad.addColorStop(0, "#ffffff");
        bGrad.addColorStop(0.75, "#a8a8a8");
        bGrad.addColorStop(1, "#181818");
        bCtx.fillStyle = bGrad;
        bCtx.beginPath();
        bCtx.arc(cx, cy, rad, 0, Math.PI * 2);
        bCtx.fill();
      }
    }
    return {
      albedoMap: configureTileableTexture(albCanvas, maxAnisotropy, true, 3, 3),
      bumpMap: configureTileableTexture(bumpCanvas, maxAnisotropy, false, 3, 3)
    };
  }
  function createChitinFurPattern(maxAnisotropy) {
    const size = 256;
    const albCanvas = document.createElement("canvas");
    albCanvas.width = size;
    albCanvas.height = size;
    const aCtx = albCanvas.getContext("2d");
    const bumpCanvas = document.createElement("canvas");
    bumpCanvas.width = size;
    bumpCanvas.height = size;
    const bCtx = bumpCanvas.getContext("2d");
    aCtx.fillStyle = "#b8b8b8";
    aCtx.fillRect(0, 0, size, size);
    bCtx.fillStyle = "#707070";
    bCtx.fillRect(0, 0, size, size);
    for (let i = 0; i < 650; i++) {
      const x = i * 53 % size;
      const y = i * 97 % size;
      const len = 14 + i % 18;
      const dx = (i % 7 - 3) * 1.4;
      const isLight = i % 2 === 0;
      aCtx.strokeStyle = isLight ? "rgba(255,255,255,0.55)" : "rgba(55,55,55,0.55)";
      aCtx.lineWidth = 1.6;
      aCtx.beginPath();
      aCtx.moveTo(x, y);
      aCtx.lineTo(x + dx, y + len);
      aCtx.stroke();
      bCtx.strokeStyle = isLight ? "#e8e8e8" : "#303030";
      bCtx.lineWidth = 1.8;
      bCtx.beginPath();
      bCtx.moveTo(x, y);
      bCtx.lineTo(x + dx, y + len);
      bCtx.stroke();
    }
    return {
      albedoMap: configureTileableTexture(albCanvas, maxAnisotropy, true, 3, 3),
      bumpMap: configureTileableTexture(bumpCanvas, maxAnisotropy, false, 3, 3)
    };
  }
  function createDamascusPlatePattern(maxAnisotropy) {
    const size = 256;
    const albCanvas = document.createElement("canvas");
    albCanvas.width = size;
    albCanvas.height = size;
    const aCtx = albCanvas.getContext("2d");
    const bumpCanvas = document.createElement("canvas");
    bumpCanvas.width = size;
    bumpCanvas.height = size;
    const bCtx = bumpCanvas.getContext("2d");
    aCtx.fillStyle = "#cccccc";
    aCtx.fillRect(0, 0, size, size);
    bCtx.fillStyle = "#808080";
    bCtx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 6) {
      aCtx.strokeStyle = y % 12 === 0 ? "rgba(255,255,255,0.42)" : "rgba(70,70,70,0.38)";
      aCtx.lineWidth = 2;
      aCtx.beginPath();
      for (let x = 0; x <= size; x += 8) {
        const wy = y + Math.sin(x / size * Math.PI * 4) * 5;
        if (x === 0) aCtx.moveTo(x, wy);
        else aCtx.lineTo(x, wy);
      }
      aCtx.stroke();
    }
    aCtx.strokeStyle = "#404040";
    aCtx.lineWidth = 2.5;
    bCtx.strokeStyle = "#282828";
    bCtx.lineWidth = 3;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const px = c * 128 + 6;
        const py = r * 128 + 6;
        aCtx.strokeRect(px, py, 116, 116);
        bCtx.strokeRect(px, py, 116, 116);
        for (const [rx, ry] of [
          [px + 10, py + 10],
          [px + 106, py + 10],
          [px + 10, py + 106],
          [px + 106, py + 106]
        ]) {
          aCtx.fillStyle = "#ffffff";
          aCtx.beginPath();
          aCtx.arc(rx, ry, 3.2, 0, Math.PI * 2);
          aCtx.fill();
          bCtx.fillStyle = "#ffffff";
          bCtx.beginPath();
          bCtx.arc(rx, ry, 3.5, 0, Math.PI * 2);
          bCtx.fill();
        }
      }
    }
    return {
      albedoMap: configureTileableTexture(albCanvas, maxAnisotropy, true, 2, 2),
      bumpMap: configureTileableTexture(bumpCanvas, maxAnisotropy, false, 2, 2)
    };
  }
  function createRunicObsidianPattern(maxAnisotropy) {
    const size = 256;
    const albCanvas = document.createElement("canvas");
    albCanvas.width = size;
    albCanvas.height = size;
    const aCtx = albCanvas.getContext("2d");
    const bumpCanvas = document.createElement("canvas");
    bumpCanvas.width = size;
    bumpCanvas.height = size;
    const bCtx = bumpCanvas.getContext("2d");
    aCtx.fillStyle = "#b5b5b5";
    aCtx.fillRect(0, 0, size, size);
    bCtx.fillStyle = "#888888";
    bCtx.fillRect(0, 0, size, size);
    for (let i = 0; i < 60; i++) {
      const x = i * 67 % size;
      const y = i * 103 % size;
      const w = 24 + i % 28;
      const h = 20 + i * 3 % 28;
      const shade = 145 + i % 95;
      aCtx.fillStyle = `rgb(${shade},${shade},${shade})`;
      aCtx.fillRect(x, y, w, h);
      aCtx.strokeStyle = "#383838";
      aCtx.lineWidth = 2;
      aCtx.strokeRect(x, y, w, h);
      bCtx.fillStyle = `rgb(${shade},${shade},${shade})`;
      bCtx.fillRect(x, y, w, h);
      bCtx.strokeStyle = "#181818";
      bCtx.lineWidth = 2.5;
      bCtx.strokeRect(x, y, w, h);
    }
    return {
      albedoMap: configureTileableTexture(albCanvas, maxAnisotropy, true, 2, 2),
      bumpMap: configureTileableTexture(bumpCanvas, maxAnisotropy, false, 2, 2)
    };
  }
  function createProceduralTextureSet(maxAnisotropy) {
    const scales = createScalesPattern(maxAnisotropy);
    const chitin_fur = createChitinFurPattern(maxAnisotropy);
    const damascus_plate = createDamascusPlatePattern(maxAnisotropy);
    const runic_obsidian = createRunicObsidianPattern(maxAnisotropy);
    const roughCanvas = document.createElement("canvas");
    roughCanvas.width = 128;
    roughCanvas.height = 128;
    const rCtx = roughCanvas.getContext("2d");
    rCtx.fillStyle = "#999999";
    rCtx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 120; i++) {
      const x = i * 37 % 128;
      const y = i * 67 % 128;
      const v = 115 + i % 85;
      rCtx.fillStyle = `rgba(${v},${v},${v},0.32)`;
      rCtx.fillRect(x, y, 8 + i % 12, 8 + i % 12);
    }
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
    const pedestalRunesMap = new THREE2.CanvasTexture(pedCanvas);
    pedestalRunesMap.colorSpace = THREE2.SRGBColorSpace;
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
    const contactShadowMap = new THREE2.CanvasTexture(shadowCanvas);
    contactShadowMap.colorSpace = THREE2.SRGBColorSpace;
    return {
      patterns: {
        scales,
        chitin_fur,
        damascus_plate,
        runic_obsidian
      },
      armorBumpMap: damascus_plate.bumpMap,
      armorRoughnessMap,
      pedestalRunesMap,
      contactShadowMap,
      dispose: () => {
        for (const p of Object.values({ scales, chitin_fur, damascus_plate, runic_obsidian })) {
          p.albedoMap.dispose();
          p.bumpMap.dispose();
        }
        armorRoughnessMap.dispose();
        pedestalRunesMap.dispose();
        contactShadowMap.dispose();
      }
    };
  }
  return __toCommonJS(entrada_exports);
})();
