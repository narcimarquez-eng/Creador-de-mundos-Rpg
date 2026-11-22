/*
 * combat-vfx-estudio.js — Motor de efectos visuales de combate del Estudio de Armaduras.
 * Reproduce en visor-mundo.html los rayos corporales (28), cintas helicoidales (3),
 * partículas elementales (140), rayos espirales en el arma (12) + funda + esfera en la punta,
 * doble estela de hoja, ondas 3D voladoras a distancia, haces solares / juicio celestial,
 * meteoros astrales y VFX completos de arco (cuerda eléctrica, salvas y Lluvia Prisma de 32 flechas).
 * Expone window.StudioCombatVFX (y module.exports en Node).
 */
(function (root) {
  "use strict";

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (e0, e1, x) => {
    const t = clamp((x - e0) / Math.max(1e-5, e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  };

  function hashN(n) {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return x - Math.floor(x);
  }

  const BODY_ENERGY_PRESETS = {
    lightning: { label: 'Rayos',   colors: ['#38bdf8', '#fde047', '#ffffff'], boltJitter: 0.135, boltSpeed: 28, particleMode: 'spark', ribbonTwist: 4.6, lightInt: 2.2, prism: false },
    fire:      { label: 'Fuego',   colors: ['#ef4444', '#f97316', '#fde047'], boltJitter: 0.095, boltSpeed: 18, particleMode: 'fire',  ribbonTwist: 3.4, lightInt: 2.4, prism: false },
    arcane:    { label: 'Arcano',  colors: ['#a855f7', '#38bdf8', '#f472b6'], boltJitter: 0.120, boltSpeed: 24, particleMode: 'orbit', ribbonTwist: 5.2, lightInt: 2.2, prism: false },
    frost:     { label: 'Hielo',   colors: ['#7dd3fc', '#e0f2fe', '#818cf8'], boltJitter: 0.105, boltSpeed: 22, particleMode: 'frost', ribbonTwist: 3.9, lightInt: 2.0, prism: false },
    void:      { label: 'Abisal',  colors: ['#9333ea', '#10b981', '#f43f5e'], boltJitter: 0.130, boltSpeed: 26, particleMode: 'void',  ribbonTwist: 5.0, lightInt: 2.2, prism: false },
    holy:      { label: 'Sagrado', colors: ['#fbbf24', '#fef08a', '#38bdf8'], boltJitter: 0.110, boltSpeed: 23, particleMode: 'holy',  ribbonTwist: 4.2, lightInt: 2.5, prism: false },
    prism:     { label: 'Prisma',  colors: ['#38bdf8', '#f43f5e', '#fde047'], boltJitter: 0.145, boltSpeed: 30, particleMode: 'prism', ribbonTwist: 5.8, lightInt: 2.6, prism: true }
  };

  // Curvas VFX maestras derivadas de evaluateGameAnimation + WEAPON_CLASS_SKILLS del Estudio
  const ANIM_VFX_DEFS = {
    attack:              { mode: 'shock_trail',   trail: [0.14, 0.78], shock: [0.76, 0.90] },
    spin_slash:          { mode: 'shock_trail',   trail: [0.08, 0.71], shock: [0.69, 0.85] },
    whirlwind:           { mode: 'shock_trail',   trail: [0.12, 0.84], shock: [0.82, 0.96] },
    overhead_cleave:     { mode: 'shock_trail',   trail: [0.24, 0.55], shock: [0.54, 0.78] },
    thrust_lunge:        { mode: 'pierce_trail',  pierce: [0.20, 0.74], trail: [0.74, 0.86], wave: [{ kind: 'thrust', u: 0.34, scale: 1.05 }] },
    rising_slash:        { mode: 'spark_shock',   spark: [0.05, 0.20], trail: [0.20, 0.72], shock: [0.72, 0.88] },
    guard_counter:       { mode: 'spark_pierce',  spark: [0.12, 0.30], trail: [0.30, 0.62], pierce: [0.62, 0.82] },
    aerial_plunge:       { mode: 'shock_trail',   trail: [0.14, 0.60], shock: [0.58, 0.86] },
    phantom_flurry:      { mode: 'shock_trail',   trail: [0.04, 0.82], shock: [0.80, 0.94] },
    dragon_helix:        { mode: 'pierce_shock',  pierce: [0.15, 0.64], trail: [0.58, 0.76], shock: [0.72, 0.86] },
    earthshaker_combo:   { mode: 'shock_trail',   trail: [0.08, 0.76], shock: [0.74, 0.92] },
    arcane_tempest:      { mode: 'arcane_wave',   arcane: [0.20, 0.86], wave: [{ kind: 'crescent', u: 0.48, scale: 1.28, speed: 24 }] },
    blink_iaido:         { mode: 'trail_spark',   trail: [0.20, 0.64], spark: [0.64, 0.82] },
    sword_crescent_draw: { mode: 'crescent_wave', spark: [0.20, 0.44], trail: [0.44, 0.76], wave: [{ kind: 'crescent', u: 0.46, scale: 1.30, speed: 24 }] },
    sword_sky_breaker:   { mode: 'sky_breaker',   arcane: [0.20, 0.46], trail: [0.46, 0.60], shock: [0.59, 0.82], wave: [{ kind: 'vertical', u: 0.50, scale: 1.36, speed: 25 }], skyPillar: 0.58 },
    sword_double_cross:  { mode: 'double_cross',  spark: [0.16, 0.34], trail: [0.34, 0.82], wave: [{ kind: 'cross1', u: 0.38, scale: 1.18, speed: 22 }, { kind: 'cross2', u: 0.60, scale: 1.24, speed: 22 }] },
    sword_blitz_rush:    { mode: 'pierce_trail',  trail: [0.16, 0.54], pierce: [0.54, 0.76], wave: [{ kind: 'thrust', u: 0.42, scale: 1.15 }] },
    sword_heavy_cleave:  { mode: 'trail_spark',   spark: [0.18, 0.35], trail: [0.35, 0.74], shock: [0.72, 0.88] },
    dagger_shadow_dash:  { mode: 'pierce_trail',  pierce: [0.18, 0.42], trail: [0.40, 0.72], spark: [0.70, 0.84] },
    dagger_zigzag_blitz: { mode: 'trail_spark',   trail: [0.14, 0.76], spark: [0.76, 0.88] },
    dagger_backstab_rush:{ mode: 'pierce_trail',  pierce: [0.30, 0.55], trail: [0.52, 0.74] },
    polearm_wide_sweep:  { mode: 'trail_only',    trail: [0.22, 0.86], shock: [0.74, 0.90] },
    lance_extended_skewer:{ mode: 'pierce_trail', pierce: [0.24, 0.60], trail: [0.56, 0.84], wave: [{ kind: 'thrust', u: 0.38, scale: 1.24 }] },
    greataxe_titan_arc:  { mode: 'shock_trail',   trail: [0.24, 0.62], shock: [0.60, 0.84] },
    colossus_cleave:     { mode: 'shock_trail',   trail: [0.20, 0.74], shock: [0.72, 0.92] },
    lance_impale_vault:  { mode: 'pierce_shock',  trail: [0.12, 0.40], pierce: [0.40, 0.63], shock: [0.63, 0.86] },
    meteor_barrage:      { mode: 'meteor',        arcane: [0.18, 0.78], wave: [{ kind: 'thrust', u: 0.36, scale: 1.05, speed: 26 }, { kind: 'thrust', u: 0.52, scale: 1.14, speed: 27 }, { kind: 'crescent', u: 0.68, scale: 1.28, speed: 24 }], meteors: [0.36, 0.52, 0.68] },
    vortex_reaper:       { mode: 'shock_trail',   trail: [0.10, 0.74], shock: [0.72, 0.90] },
    celestial_judgment:  { mode: 'judgment',      arcane: [0.18, 0.54], beam: [0.52, 0.88], shock: [0.58, 0.86], wave: [{ kind: 'vertical', u: 0.54, scale: 1.30, speed: 25 }], skyPillar: 0.54 },
    ultimate_beam:       { mode: 'beam',          arcane: [0.12, 0.38], beam: [0.38, 0.88] },
    ultimate_nova:       { mode: 'nova',          nova: [0.36, 0.86], shock: [0.42, 0.84] },
    ultimate_slam:       { mode: 'shock_trail',   trail: [0.16, 0.52], shock: [0.52, 0.86] },
    archery:             { mode: 'bow',           bowMode: 'bolt',    releaseU: 0.52 },
    bow_double_shot:     { mode: 'bow',           bowMode: 'double',  releaseU: 0.36, releaseU2: 0.70 },
    bow_frost_shot:      { mode: 'bow',           bowMode: 'frost',   releaseU: 0.68 },
    aerial_shot:         { mode: 'bow',           bowMode: 'aerial',  releaseU: 0.52 },
    bow_barrage:         { mode: 'bow',           bowMode: 'barrage', releaseU: 0.66 },
    bow_prism_rain:      { mode: 'bow',           bowMode: 'prism',   releaseU: 0.52 },
    orbe_arcano:         { mode: 'staff_orb',     arcane: [0.10, 0.60], wave: [{ kind: 'thrust', u: 0.36, scale: 0.92, speed: 28 }] }
  };

  function makeProfile(armaClase, anim, element, colors, intensity = 1.30, extra = null) {
    const def = ANIM_VFX_DEFS[anim] || ANIM_VFX_DEFS.attack;
    return Object.assign({
      armaClase,
      anim,
      element,
      colors,
      intensity,
      mode: def.mode,
      trail: def.trail || null,
      shock: def.shock || null,
      pierce: def.pierce || null,
      spark: def.spark || null,
      arcane: def.arcane || null,
      beam: def.beam || null,
      nova: def.nova || null,
      wave: def.wave || null,
      meteors: def.meteors || null,
      skyPillar: def.skyPillar || null,
      bowMode: def.bowMode || null,
      releaseU: def.releaseU != null ? def.releaseU : null,
      releaseU2: def.releaseU2 != null ? def.releaseU2 : null
    }, extra || {});
  }

  // Perfil completo para las 49 skills de arma + ataques básicos
  const SKILL_VFX_PROFILES = {
    attack:       makeProfile(null, 'attack', 'lightning', ['#fbbf24', '#fef08a', '#ffffff'], 0.82),
    disparo:      makeProfile('arcos', 'archery', 'lightning', ['#38bdf8', '#fde047', '#ffffff'], 0.95),
    orbe_arcano:  makeProfile('bastones', 'orbe_arcano', 'arcane', ['#a855f7', '#38bdf8', '#f3e8ff'], 1.02),
    // Espadas (1M)
    sw_iaido:     makeProfile('espadas', 'blink_iaido',         'lightning', ['#38bdf8', '#818cf8', '#ffffff'], 1.30),
    sw_solar:     makeProfile('espadas', 'sword_heavy_cleave',  'fire',      ['#f97316', '#fde047', '#ef4444'], 1.34),
    sw_blitz:     makeProfile('espadas', 'sword_blitz_rush',    'lightning', ['#22d3ee', '#38bdf8', '#ffffff'], 1.30),
    sw_cross:     makeProfile('espadas', 'sword_double_cross',  'arcane',    ['#38bdf8', '#c084fc', '#fde047'], 1.34),
    sw_lightning: makeProfile('espadas', 'sword_crescent_draw', 'lightning', ['#38bdf8', '#fde047', '#ffffff'], 1.34),
    sw_celestial: makeProfile('espadas', 'sword_sky_breaker',   'holy',      ['#fde047', '#38bdf8', '#ffffff'], 1.38),
    // Mandobles (2M)
    gs_sweep:     makeProfile('mandobles', 'polearm_wide_sweep', 'lightning', ['#38bdf8', '#fde047', '#ffffff'], 1.34, { vfxScale: 1.25 }),
    gs_titan:     makeProfile('mandobles', 'greataxe_titan_arc', 'fire',      ['#f97316', '#ef4444', '#fde047'], 1.36, { vfxScale: 1.28 }),
    gs_cross:     makeProfile('mandobles', 'sword_double_cross', 'fire',      ['#dc2626', '#f97316', '#fef08a'], 1.34, { vfxScale: 1.25 }),
    gs_colossus:  makeProfile('mandobles', 'colossus_cleave',    'fire',      ['#ea580c', '#dc2626', '#fef08a'], 1.36, { vfxScale: 1.30 }),
    gs_crescent:  makeProfile('mandobles', 'sword_crescent_draw','lightning', ['#f43f5e', '#38bdf8', '#ffffff'], 1.36, { vfxScale: 1.32 }),
    gs_skybreak:  makeProfile('mandobles', 'sword_sky_breaker',  'holy',      ['#fde047', '#38bdf8', '#ffffff'], 1.38, { vfxScale: 1.36 }),
    // Dagas
    dg_dash:      makeProfile('dagas', 'dagger_shadow_dash',   'void',      ['#a855f7', '#22d3ee', '#ffffff'], 1.30, { vfxScale: 0.85 }),
    dg_blink:     makeProfile('dagas', 'blink_iaido',          'void',      ['#22c55e', '#38bdf8', '#ffffff'], 1.28, { vfxScale: 0.85 }),
    dg_rush:      makeProfile('dagas', 'dagger_backstab_rush', 'void',      ['#f43f5e', '#a855f7', '#fde047'], 1.32, { vfxScale: 0.85 }),
    dg_venom:     makeProfile('dagas', 'dragon_helix',         'void',      ['#10b981', '#a855f7', '#bef264'], 1.30, { vfxScale: 0.90 }),
    dg_shadow:    makeProfile('dagas', 'phantom_flurry',       'void',      ['#a855f7', '#22d3ee', '#4ade80'], 1.26, { vfxScale: 0.85 }),
    dg_zigzag:    makeProfile('dagas', 'dagger_zigzag_blitz',  'lightning', ['#06b6d4', '#e879f9', '#ffffff'], 1.34, { vfxScale: 0.90 }),
    // Hachas (1M)
    ax_thunder:   makeProfile('hachas', 'attack',             'lightning', ['#38bdf8', '#f59e0b', '#ffffff'], 1.24),
    ax_inferno:   makeProfile('hachas', 'spin_slash',         'fire',      ['#ea580c', '#facc15', '#dc2626'], 1.26),
    ax_berserk:   makeProfile('hachas', 'aerial_plunge',      'fire',      ['#e11d48', '#fb923c', '#fde047'], 1.32),
    ax_reap:      makeProfile('hachas', 'vortex_reaper',      'lightning', ['#ef4444', '#fde047', '#ffffff'], 1.32),
    ax_nordic:    makeProfile('hachas', 'celestial_judgment', 'lightning', ['#60a5fa', '#38bdf8', '#fde047'], 1.38),
    // Hachas (2M)
    a2_sweep:     makeProfile('hachas_2m', 'polearm_wide_sweep', 'void',  ['#c084fc', '#22d3ee', '#f43f5e'], 1.34, { vfxScale: 1.28 }),
    a2_titan:     makeProfile('hachas_2m', 'greataxe_titan_arc', 'fire',  ['#ea580c', '#ef4444', '#fde047'], 1.36, { vfxScale: 1.30 }),
    a2_colossus:  makeProfile('hachas_2m', 'colossus_cleave',    'fire',  ['#f97316', '#dc2626', '#fef08a'], 1.34, { vfxScale: 1.30 }),
    a2_vortex:    makeProfile('hachas_2m', 'vortex_reaper',      'void',  ['#9333ea', '#f43f5e', '#38bdf8'], 1.34, { vfxScale: 1.32 }),
    a2_demolish:  makeProfile('hachas_2m', 'earthshaker_combo',  'prism', ['#f43f5e', '#a855f7', '#facc15'], 1.38, { vfxScale: 1.35 }),
    // Mazas y Martillos
    mc_storm:     makeProfile('mazas', 'overhead_cleave',    'lightning', ['#60a5fa', '#e0f2fe', '#facc15'], 1.28),
    mc_crush:     makeProfile('mazas', 'colossus_cleave',    'lightning', ['#fbbf24', '#38bdf8', '#ffffff'], 1.32),
    mc_seismic:   makeProfile('mazas', 'earthshaker_combo',  'fire',      ['#f59e0b', '#ea580c', '#fef08a'], 1.32),
    mc_titan:     makeProfile('mazas', 'ultimate_slam',      'holy',      ['#fde047', '#fb923c', '#38bdf8'], 1.38),
    mc_judgment:  makeProfile('mazas', 'celestial_judgment', 'holy',      ['#38bdf8', '#fde047', '#ffffff'], 1.40),
    // Lanzas (2M)
    ln_sweep:     makeProfile('lanzas', 'polearm_wide_sweep',    'fire',      ['#38bdf8', '#f97316', '#fef08a'], 1.34, { vfxScale: 1.30 }),
    ln_skewer:    makeProfile('lanzas', 'lance_extended_skewer', 'lightning', ['#22d3ee', '#38bdf8', '#ffffff'], 1.34, { vfxScale: 1.30 }),
    ln_phalanx:   makeProfile('lanzas', 'colossus_cleave',       'frost',     ['#7dd3fc', '#e0f2fe', '#818cf8'], 1.32, { vfxScale: 1.30 }),
    ln_valkyrie:  makeProfile('lanzas', 'lance_impale_vault',    'lightning', ['#38bdf8', '#fde047', '#ffffff'], 1.34, { vfxScale: 1.30 }),
    ln_dragon:    makeProfile('lanzas', 'dragon_helix',          'lightning', ['#22d3ee', '#3b82f6', '#ffffff'], 1.32, { vfxScale: 1.30 }),
    // Arcos (2M)
    bw_bolt:      makeProfile('arcos', 'archery',         'lightning', ['#38bdf8', '#fde047', '#ffffff'], 1.30),
    bw_double:    makeProfile('arcos', 'bow_double_shot', 'lightning', ['#22d3ee', '#34d399', '#fef08a'], 1.32),
    bw_frost:     makeProfile('arcos', 'bow_frost_shot',  'frost',     ['#7dd3fc', '#e0f2fe', '#818cf8'], 1.32),
    bw_aerial:    makeProfile('arcos', 'aerial_shot',     'arcane',    ['#10b981', '#22d3ee', '#fde047'], 1.30),
    bw_barrage:   makeProfile('arcos', 'bow_barrage',     'fire',      ['#f97316', '#fde047', '#ef4444'], 1.38),
    bw_prism:     makeProfile('arcos', 'bow_prism_rain',  'prism',     ['#f472b6', '#38bdf8', '#fde047'], 1.44),
    // Bastones (Mago)
    st_tempest:   makeProfile('bastones', 'arcane_tempest',     'arcane', ['#a855f7', '#38bdf8', '#f472b6'], 1.34, { vfxScale: 1.24 }),
    st_meteor:    makeProfile('bastones', 'meteor_barrage',     'fire',   ['#f97316', '#c084fc', '#fde047'], 1.36, { vfxScale: 1.24 }),
    st_judgment:  makeProfile('bastones', 'celestial_judgment', 'holy',   ['#fde047', '#c084fc', '#ffffff'], 1.38, { vfxScale: 1.26 }),
    st_solar:     makeProfile('bastones', 'ultimate_beam',      'holy',   ['#fbbf24', '#f43f5e', '#ffffff'], 1.40, { vfxScale: 1.28 }),
    st_nova:      makeProfile('bastones', 'ultimate_nova',      'prism',  ['#c084fc', '#38bdf8', '#fde047'], 1.42, { vfxScale: 1.32 })
  };

  // Circuitos óseos del cuerpo (20) y canalización hacia el arma (8) — idénticos al Estudio
  const BODY_BONE_KEYS = [
    'Ankle_L', 'Knee_L', 'Thigh_L', 'Pelvis', 'Torso', 'Neck', 'Head',
    'Shoulder_L', 'Elbow_L', 'Wrist_L', 'Shoulder_R', 'Elbow_R', 'Wrist_R',
    'Thigh_R', 'Knee_R', 'Ankle_R'
  ];
  const BODY_CIRCUITS = [
    ['Ankle_L', 'Knee_L', 'Thigh_L', 'Pelvis', 'Torso', 'Shoulder_R', 'Elbow_R', 'Wrist_R'],
    ['Ankle_R', 'Knee_R', 'Thigh_R', 'Pelvis', 'Torso', 'Shoulder_L', 'Elbow_L', 'Wrist_L'],
    ['Pelvis', 'Torso', 'Neck', 'Head'],
    ['Wrist_L', 'Elbow_L', 'Shoulder_L', 'Torso', 'Shoulder_R', 'Elbow_R', 'Wrist_R'],
    ['Ankle_L', 'Knee_L', 'Pelvis', 'Knee_R', 'Ankle_R'],
    ['Shoulder_L', 'Torso', 'Pelvis', 'Thigh_R', 'Knee_R', 'Ankle_R'],
    ['Shoulder_R', 'Torso', 'Pelvis', 'Thigh_L', 'Knee_L', 'Ankle_L'],
    ['Head', 'Neck', 'Shoulder_R', 'Elbow_R', 'Wrist_R'],
    ['Head', 'Neck', 'Shoulder_L', 'Elbow_L', 'Wrist_L'],
    ['Shoulder_L', 'Neck', 'Shoulder_R', 'Torso', 'Pelvis'],
    ['Thigh_L', 'Pelvis', 'Torso', 'Shoulder_L', 'Elbow_L'],
    ['Thigh_R', 'Pelvis', 'Torso', 'Shoulder_R', 'Elbow_R'],
    ['Knee_L', 'Thigh_L', 'Torso', 'Neck', 'Head'],
    ['Knee_R', 'Thigh_R', 'Torso', 'Neck', 'Head'],
    ['Wrist_L', 'Shoulder_L', 'Head', 'Shoulder_R', 'Wrist_R'],
    ['Ankle_L', 'Thigh_L', 'Shoulder_L', 'Torso', 'Pelvis'],
    ['Ankle_R', 'Thigh_R', 'Shoulder_R', 'Torso', 'Pelvis'],
    ['Pelvis', 'Shoulder_L', 'Elbow_L', 'Wrist_L'],
    ['Pelvis', 'Shoulder_R', 'Elbow_R', 'Wrist_R'],
    ['Thigh_L', 'Torso', 'Shoulder_R', 'Wrist_R', '_WBASE']
  ];
  const WEAPON_SURGE_CIRCUITS = [
    ['Pelvis', 'Torso', 'Shoulder_R', 'Elbow_R', 'Wrist_R', '_WBASE', '_WMID', '_WTIP'],
    ['Torso', 'Shoulder_R', 'Elbow_R', 'Wrist_R', '_WBASE', '_WTIP'],
    ['Shoulder_L', 'Torso', 'Shoulder_R', 'Elbow_R', 'Wrist_R', '_WMID', '_WTIP'],
    ['Head', 'Neck', 'Shoulder_R', 'Elbow_R', 'Wrist_R', '_WBASE', '_WTIP'],
    ['Ankle_R', 'Knee_R', 'Pelvis', 'Torso', 'Shoulder_R', 'Wrist_R', '_WMID', '_WTIP'],
    ['Shoulder_R', 'Elbow_R', 'Wrist_R', '_WBASE', '_WMID', '_WTIP'],
    ['Elbow_R', 'Wrist_R', '_WBASE', '_WMID', '_WTIP'],
    ['Wrist_R', '_WBASE', '_WMID', '_WTIP'],
    ['Torso', 'Shoulder_L', 'Elbow_L', 'Wrist_L', '_WBASE', '_WMID', '_WTIP']
  ];

  const BODY_BOLT_COUNT = 28;
  const BODY_BOLT_SEGS = 9;
  const BODY_RIBBON_COUNT = 3;
  const BODY_RIBBON_SEGS = 22;
  const BODY_PARTICLE_COUNT = 140;
  const SWORD_BOLT_COUNT = 12;
  const SWORD_BOLT_SEGS = 9;
  const SWORD_STREAM_COUNT = 8;
  const BOW_BOLT_COUNT = 10;
  const BOW_BOLT_SEGS = 8;
  const TRAIL_MAX = 28;
  const SPARK_COUNT = 48;
  const BOW_RIPPLE_POOL = 16;

  function makeGlowTexture() {
    if (typeof document === 'undefined') return null;
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 1, 32, 32, 30);
    g.addColorStop(0.0, 'rgba(255,255,255,1)');
    g.addColorStop(0.32, 'rgba(255,245,210,0.85)');
    g.addColorStop(0.7, 'rgba(255,200,120,0.28)');
    g.addColorStop(1.0, 'rgba(255,180,80,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return c;
  }

  function buildQuadMesh(THREE, maxQuads, opacity = 0.94) {
    const pos = new Float32Array(maxQuads * 4 * 3);
    const col = new Float32Array(maxQuads * 4 * 3);
    const idx = new Uint16Array(maxQuads * 6);
    for (let q = 0; q < maxQuads; q++) {
      const v0 = q * 4, i0 = q * 6;
      idx[i0] = v0; idx[i0 + 1] = v0 + 1; idx[i0 + 2] = v0 + 2;
      idx[i0 + 3] = v0; idx[i0 + 4] = v0 + 2; idx[i0 + 5] = v0 + 3;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      vertexColors: true, transparent: true, opacity, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    mesh.frustumCulled = false;
    mesh.visible = false;
    return mesh;
  }

  function writeQuad(posAttr, colAttr, cursor, p0, p1, halfW, cr, cg, cb, camPos, tmpC, dir, camDir, side) {
    dir.subVectors(p1, p0);
    if (dir.lengthSq() < 1e-8) dir.set(0, 1, 0);
    tmpC.addVectors(p0, p1).multiplyScalar(0.5);
    camDir.subVectors(camPos, tmpC);
    if (camDir.lengthSq() < 1e-6) camDir.set(0, 0, 1);
    side.crossVectors(dir, camDir);
    if (side.lengthSq() < 1e-8) side.set(1, 0, 0);
    else side.normalize();
    side.multiplyScalar(halfW);

    const v = cursor * 4;
    posAttr.setXYZ(v,     p0.x - side.x, p0.y - side.y, p0.z - side.z);
    posAttr.setXYZ(v + 1, p0.x + side.x, p0.y + side.y, p0.z + side.z);
    posAttr.setXYZ(v + 2, p1.x + side.x, p1.y + side.y, p1.z + side.z);
    posAttr.setXYZ(v + 3, p1.x - side.x, p1.y - side.y, p1.z - side.z);
    colAttr.setXYZ(v,     cr, cg, cb);
    colAttr.setXYZ(v + 1, cr, cg, cb);
    colAttr.setXYZ(v + 2, cr, cg, cb);
    colAttr.setXYZ(v + 3, cr, cg, cb);
    return cursor + 1;
  }

  class Manager {
    constructor(scene, THREE) {
      this.scene = scene;
      this.THREE = THREE;
      this.group = new THREE.Group();
      this.group.name = 'StudioCombatVFX';
      this.group.userData.isVFX = true;
      this.scene.add(this.group);

      this.heroModel = null;
      this.heroRoot = null;
      this.bones = {};
      this.markers = {};
      this.active = null;
      this.energyTime = 0;
      this.seed = 1;
      this.seedTimer = 0;
      this.history = [];
      this.waves = [];
      this.arrows = [];
      this.trails = [];
      this.meteors = [];
      this.rainWaves = [];
      this.barrageFollow = null;

      this._vA = new THREE.Vector3();
      this._vB = new THREE.Vector3();
      this._vC = new THREE.Vector3();
      this._vD = new THREE.Vector3();
      this._vE = new THREE.Vector3();
      this._dir = new THREE.Vector3();
      this._side = new THREE.Vector3();
      this._camDir = new THREE.Vector3();
      this._perp1 = new THREE.Vector3();
      this._perp2 = new THREE.Vector3();
      this._up = new THREE.Vector3(0, 1, 0);
      this._fwd = new THREE.Vector3(0, 0, 1);
      this._quat = new THREE.Quaternion();
      this._colA = new THREE.Color();
      this._colB = new THREE.Color();
      this._colC = new THREE.Color();
      this._colW = new THREE.Color();
      this._hot = new THREE.Color(0xffffff);
      this._bonePos = {};
      BODY_BONE_KEYS.forEach(k => { this._bonePos[k] = new THREE.Vector3(); });
      this._boltPts = Array.from({ length: Math.max(BODY_BOLT_SEGS, BOW_BOLT_SEGS) + 1 }, () => new THREE.Vector3());

      this._initPools();
    }

    _initPools() {
      const THREE = this.THREE;
      const g = this.group;
      const canvas = makeGlowTexture();
      const glowTex = canvas ? new THREE.CanvasTexture(canvas) : null;
      if (glowTex && THREE.SRGBColorSpace) glowTex.colorSpace = THREE.SRGBColorSpace;
      this.glowTex = glowTex;

      // 1. Rayos corporales (28) + rayos del arma (12) + rayos en cuerda de arco (10)
      this.bodyBolts = buildQuadMesh(THREE, BODY_BOLT_COUNT * BODY_BOLT_SEGS * 2, 0.92);
      this.bladeBolts = buildQuadMesh(THREE, SWORD_BOLT_COUNT * SWORD_BOLT_SEGS * 2, 0.95);
      this.bowBolts = buildQuadMesh(THREE, BOW_BOLT_COUNT * BOW_BOLT_SEGS * 2, 0.95);
      g.add(this.bodyBolts, this.bladeBolts, this.bowBolts);

      // 2. 3 Cintas helicoidales envolviendo al héroe
      const ribVerts = (BODY_RIBBON_SEGS + 1) * 2;
      const rPos = new Float32Array(BODY_RIBBON_COUNT * ribVerts * 3);
      const rCol = new Float32Array(BODY_RIBBON_COUNT * ribVerts * 3);
      const rIdx = [];
      for (let r = 0; r < BODY_RIBBON_COUNT; r++) {
        const bv = r * ribVerts;
        for (let s = 0; s < BODY_RIBBON_SEGS; s++) {
          const q = bv + s * 2;
          rIdx.push(q, q + 1, q + 3, q, q + 3, q + 2);
        }
      }
      const rGeo = new THREE.BufferGeometry();
      rGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3));
      rGeo.setAttribute('color', new THREE.BufferAttribute(rCol, 3));
      rGeo.setIndex(rIdx);
      this.energyRibbons = new THREE.Mesh(rGeo, new THREE.MeshBasicMaterial({
        vertexColors: true, transparent: true, opacity: 0.62, side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending, depthWrite: false
      }));
      this.energyRibbons.frustumCulled = false;
      this.energyRibbons.visible = false;
      g.add(this.energyRibbons);

      // 3. 140 Partículas corporales elementales
      const bpGeo = new THREE.BufferGeometry();
      bpGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(BODY_PARTICLE_COUNT * 3), 3));
      bpGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(BODY_PARTICLE_COUNT * 3), 3));
      this.bodyParticles = new THREE.Points(bpGeo, new THREE.PointsMaterial({
        size: 0.16, map: glowTex, vertexColors: true,
        transparent: true, opacity: 0.88, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
      }));
      this.bodyParticles.frustumCulled = false;
      this.bodyParticles.visible = false;
      g.add(this.bodyParticles);
      this.bodyParticleData = Array.from({ length: BODY_PARTICLE_COUNT }, () => ({
        x: 0, y: -99, z: 0, vx: 0, vy: 0, vz: 0, life: 0, maxLife: 0.5, r: 1, g: 0.8, b: 0.4, phase: Math.random() * 6.28, kind: 'spark'
      }));

      // 4. Doble estela de hoja
      const makeTrail = (op) => {
        const tg = new THREE.BufferGeometry();
        tg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TRAIL_MAX * 2 * 3), 3));
        tg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(TRAIL_MAX * 2 * 3), 3));
        const m = new THREE.Mesh(tg, new THREE.MeshBasicMaterial({
          vertexColors: true, transparent: true, opacity: op, side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending, depthWrite: false
        }));
        m.frustumCulled = false;
        m.visible = false;
        return m;
      };
      this.trail = makeTrail(0.68);
      this.trailCore = makeTrail(0.88);
      g.add(this.trail, this.trailCore);

      // 5. Funda de plasma del arma + Esfera de carga + 8 filamentos en punta (arma o flecha)
      this.bladeSheath = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.044, 1.0, 12, 1, true),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      this.bladeSheath.visible = false;
      g.add(this.bladeSheath);

      this.chargeGroup = new THREE.Group();
      this.chargeGroup.visible = false;
      this.chargeCore = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 14, 10),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.90, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      this.chargeHalo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTex, color: 0x38bdf8, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false
      }));
      this.chargeHalo.scale.set(0.45, 0.45, 1);
      const chRingGeo = new THREE.RingGeometry(0.085, 0.115, 28);
      this.chargeRingA = new THREE.Mesh(chRingGeo, new THREE.MeshBasicMaterial({
        color: 0x38bdf8, transparent: true, opacity: 0.82, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
      }));
      this.chargeRingB = new THREE.Mesh(chRingGeo, new THREE.MeshBasicMaterial({
        color: 0xfde047, transparent: true, opacity: 0.76, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
      }));
      this.chargeGroup.add(this.chargeCore, this.chargeHalo, this.chargeRingA, this.chargeRingB);
      g.add(this.chargeGroup);

      const stGeo = new THREE.BufferGeometry();
      stGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SWORD_STREAM_COUNT * 2 * 3), 3));
      stGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(SWORD_STREAM_COUNT * 2 * 3), 3));
      this.chargeStreams = new THREE.LineSegments(stGeo, new THREE.LineBasicMaterial({
        vertexColors: true, transparent: true, opacity: 0.88, blending: THREE.AdditiveBlending, depthWrite: false
      }));
      this.chargeStreams.frustumCulled = false;
      this.chargeStreams.visible = false;
      g.add(this.chargeStreams);

      // 6. Ondas suelo, anillos supersónicos, cúpula Nova, Cañón Beam, Pilar Celestial y Halo Arcano
      const makeRing = (ir, or) => {
        const m = new THREE.Mesh(
          new THREE.RingGeometry(ir, or, 48),
          new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
        );
        m.rotation.x = -Math.PI / 2;
        m.visible = false;
        g.add(m);
        return m;
      };
      this.auraFloorRing = makeRing(0.48, 0.58);
      this.auraFloorRing2 = makeRing(0.72, 0.78);
      this.ring = makeRing(0.30, 0.48);
      this.ring2 = makeRing(0.42, 0.52);
      this.prismZoneRing = makeRing(2.15, 2.40);
      this.prismZoneInner = makeRing(1.05, 1.18);

      this.groundGlow = new THREE.Mesh(
        new THREE.CircleGeometry(0.85, 36),
        new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
      );
      this.groundGlow.rotation.x = -Math.PI / 2;
      this.groundGlow.visible = false;
      g.add(this.groundGlow);

      this.pierceRings = [];
      const prGeo = new THREE.RingGeometry(0.11, 0.16, 28);
      for (let i = 0; i < 3; i++) {
        const pr = new THREE.Mesh(prGeo, new THREE.MeshBasicMaterial({
          transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
        }));
        pr.visible = false;
        g.add(pr);
        this.pierceRings.push(pr);
      }

      this.flash = new THREE.Mesh(
        new THREE.SphereGeometry(0.10, 12, 10),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      this.flash.visible = false;
      g.add(this.flash);

      this.novaDome = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 24, 18),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      this.novaDome.visible = false;
      g.add(this.novaDome);

      this.beamMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.28, 1.0, 20, 1, true),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      this.beamMesh.visible = false;
      this.beamCoreMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.11, 1.0, 16, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      this.beamCoreMesh.visible = false;
      g.add(this.beamMesh, this.beamCoreMesh);

      this.skyPillarMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 1.15, 14.0, 24, 1, true),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      this.skyPillarMesh.visible = false;
      this.skyPillarCore = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.40, 14.0, 16, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      this.skyPillarCore.visible = false;
      g.add(this.skyPillarMesh, this.skyPillarCore);

      this.arcaneHalo = new THREE.Mesh(
        new THREE.RingGeometry(0.68, 0.78, 44),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      this.arcaneHalo.visible = false;
      g.add(this.arcaneHalo);

      // 7. 48 Chispas 3D con gravedad
      const spGeo = new THREE.BufferGeometry();
      spGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SPARK_COUNT * 3), 3));
      spGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(SPARK_COUNT * 3), 3));
      this.sparks = new THREE.Points(spGeo, new THREE.PointsMaterial({
        size: 0.14, map: glowTex, vertexColors: true,
        transparent: true, opacity: 0.90, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
      }));
      this.sparks.frustumCulled = false;
      this.sparks.visible = false;
      g.add(this.sparks);
      this.sparkData = Array.from({ length: SPARK_COUNT }, () => ({ x: 0, y: -99, z: 0, vx: 0, vy: 0, vz: 0, life: 0, maxLife: 0.5, r: 1, g: 0.8, b: 0.4 }));

      // 8. Pool de ondas en el suelo para Lluvia Prisma
      const ripGeo = new THREE.RingGeometry(0.11, 0.21, 20);
      this.ripples = [];
      for (let i = 0; i < BOW_RIPPLE_POOL; i++) {
        const rm = new THREE.Mesh(ripGeo, new THREE.MeshBasicMaterial({
          color: 0x38bdf8, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
        }));
        rm.rotation.x = -Math.PI / 2;
        rm.visible = false;
        g.add(rm);
        this.ripples.push({ mesh: rm, life: 0, maxLife: 0.50 });
      }
      this.rippleCursor = 0;

      // Geometrías compartidas para ondas 3D voladoras y flechas luminosas
      this.crescentOuterGeo = new THREE.TorusGeometry(0.88, 0.082, 10, 28, Math.PI * 0.92);
      this.crescentOuterGeo.rotateY(Math.PI / 2);
      this.crescentOuterGeo.rotateX(Math.PI * 0.04);
      this.crescentCoreGeo = new THREE.TorusGeometry(0.90, 0.032, 8, 28, Math.PI * 0.86);
      this.crescentCoreGeo.rotateY(Math.PI / 2);
      this.crescentCoreGeo.rotateX(Math.PI * 0.07);
      this.thrustOuterGeo = new THREE.ConeGeometry(0.18, 1.45, 14, 1, true);
      this.thrustOuterGeo.rotateX(Math.PI / 2);
      this.thrustCoreGeo = new THREE.ConeGeometry(0.075, 1.32, 12, 1, true);
      this.thrustCoreGeo.rotateX(Math.PI / 2);

      this.arrowShaftGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.82, 8);
      this.arrowShaftGeo.rotateX(Math.PI / 2);
      this.arrowAuraGeo = new THREE.ConeGeometry(0.055, 0.52, 10, 1, true);
      this.arrowAuraGeo.rotateX(Math.PI / 2);
      this.arrowAuraGeo.translate(0, 0, 0.30);
      this.arrowTipGeo = new THREE.SphereGeometry(0.036, 10, 8);
      this.arrowTipGeo.translate(0, 0, 0.42);
      this.arrowTrailGeo = new THREE.SphereGeometry(0.042, 6, 6);

      // Dos luces puntuales fijas (siempre en escena con intensity=0 cuando inactivas -> cero recompilación PBR)
      this.energyLight = new THREE.PointLight(0x38bdf8, 0, 5.5, 1.8);
      this.energyLight.castShadow = false;
      this.bladeLight = new THREE.PointLight(0xfde047, 0, 4.8, 1.8);
      this.bladeLight.castShadow = false;
      g.add(this.energyLight, this.bladeLight);
    }

    hasProfile(skillId) {
      return Boolean(skillId && SKILL_VFX_PROFILES[skillId]);
    }

    bindHeroModel(model, heroRoot) {
      this.heroModel = model || null;
      this.heroRoot = heroRoot || (model && model.parent) || null;
      this.bones = {};
      this.markers = {};
      this.history.length = 0;
      if (!model || typeof model.traverse !== 'function') return;

      const aliases = {
        Thigh_L: ['Thigh_L', 'Hip_L', 'LeftUpLeg'],
        Thigh_R: ['Thigh_R', 'Hip_R', 'RightUpLeg']
      };
      model.traverse(obj => {
        const n = obj.name || '';
        if (!n) return;
        if (BODY_BONE_KEYS.includes(n) && !this.bones[n]) this.bones[n] = obj;
        Object.keys(aliases).forEach(k => {
          if (!this.bones[k] && aliases[k].includes(n)) this.bones[k] = obj;
        });
        if ((n === 'WeaponBase' || n === 'WeaponTip' || n === 'BowTop' || n === 'BowBot' || n === 'BowNock') && !this.markers[n]) {
          this.markers[n] = obj;
        }
      });
    }

    startSkill(skillId, sk, opts = {}) {
      const prof = SKILL_VFX_PROFILES[skillId];
      if (!prof) return false;
      const preset = BODY_ENERGY_PRESETS[prof.element] || BODY_ENERGY_PRESETS.lightning;
      const duration = Math.max(0.55, opts.duration || (sk && sk.lock) || 1.45);
      const heroRoot = opts.heroRoot || this.heroRoot;
      const heroPos = heroRoot ? heroRoot.position.clone() : new this.THREE.Vector3();
      const range = (sk && sk.range) || 10;

      let targetPos = opts.targetPos ? opts.targetPos.clone() : null;
      if (!targetPos && heroRoot) {
        const fwd = new this.THREE.Vector3(0, 0, 1).applyQuaternion(heroRoot.quaternion).setY(0).normalize();
        targetPos = heroPos.clone().addScaledVector(fwd, Math.min(range, 16));
      }

      this.active = {
        skillId,
        prof,
        preset,
        colors: (sk && Array.isArray(sk.colores) && sk.colores.length >= 2) ? sk.colores : prof.colors,
        intensity: prof.intensity || 1.25,
        vfxScale: prof.vfxScale || 1.0,
        range,
        elapsed: 0,
        duration,
        prevU: 0,
        target: opts.target || null,
        targetPos: targetPos || heroPos.clone().add(new this.THREE.Vector3(0, 1.0, 6)),
        getGroundY: typeof opts.getGroundY === 'function' ? opts.getGroundY : ((x, z) => heroPos.y),
        sparkCD: 0,
        firedWaves: new Set(),
        firedMeteors: new Set(),
        firedPillar: false,
        firedBow1: false,
        firedBow2: false
      };
      this.history.length = 0;
      return true;
    }

    _getColor(outCol, active, u, idx) {
      if (active.preset.prism) {
        outCol.setHSL((u * 0.85 + this.energyTime * 0.55 + idx * 0.13) % 1.0, 0.94, 0.56);
        return outCol;
      }
      this._colA.set(active.colors[0] || '#38bdf8');
      this._colB.set(active.colors[1] || active.colors[0] || '#fde047');
      this._colC.set(active.colors[2] || '#ffffff');
      const m = (u + Math.sin(this.energyTime * 3.5 + idx * 1.3) * 0.18 + 1.0) % 1.0;
      if (m < 0.5) outCol.copy(this._colA).lerp(this._colB, m * 2.0);
      else outCol.copy(this._colB).lerp(this._colC, (m - 0.5) * 2.0);
      return outCol;
    }

    _computeHeroFrame() {
      const root = this.heroRoot;
      if (!root) return null;
      root.updateMatrixWorld(true);
      const cx = root.position.x;
      const floorY = root.position.y + 0.015;
      const cz = root.position.z;
      let validBones = 0;
      for (let i = 0; i < BODY_BONE_KEYS.length; i++) {
        const key = BODY_BONE_KEYS[i];
        const b = this.bones[key];
        if (b) {
          this._bonePos[key].setFromMatrixPosition(b.matrixWorld);
          validBones++;
        } else {
          this._bonePos[key].set(cx, -99, cz);
        }
      }
      const fwd = this._fwd.set(0, 0, 1).applyQuaternion(root.quaternion).setY(0).normalize();
      if (fwd.lengthSq() < 1e-4) fwd.set(0, 0, 1);

      let span = null;
      if (this.markers.WeaponBase && this.markers.WeaponTip) {
        const base = new this.THREE.Vector3().setFromMatrixPosition(this.markers.WeaponBase.matrixWorld);
        const tip = new this.THREE.Vector3().setFromMatrixPosition(this.markers.WeaponTip.matrixWorld);
        const mid = base.clone().lerp(tip, 0.50);
        const core = base.clone().lerp(tip, 0.86);
        span = { base, mid, core, tip };
      } else if (this.bones.Wrist_R) {
        const base = this._bonePos.Wrist_R.clone();
        const dir = new this.THREE.Vector3(0, 1, 0).transformDirection(this.bones.Wrist_R.matrixWorld).normalize();
        const tip = base.clone().addScaledVector(dir, 0.85);
        span = { base, mid: base.clone().lerp(tip, 0.5), core: base.clone().lerp(tip, 0.86), tip };
      } else {
        const base = new this.THREE.Vector3(cx, floorY + 1.05, cz).addScaledVector(fwd, 0.35);
        const tip = base.clone().addScaledVector(fwd, 0.85).add(new this.THREE.Vector3(0, 0.35, 0));
        span = { base, mid: base.clone().lerp(tip, 0.5), core: base.clone().lerp(tip, 0.86), tip };
      }

      let bow = null;
      if (this.markers.BowTop && this.markers.BowBot && this.markers.BowNock) {
        bow = {
          tUp: new this.THREE.Vector3().setFromMatrixPosition(this.markers.BowTop.matrixWorld),
          tLo: new this.THREE.Vector3().setFromMatrixPosition(this.markers.BowBot.matrixWorld),
          nock: new this.THREE.Vector3().setFromMatrixPosition(this.markers.BowNock.matrixWorld)
        };
        bow.tip = bow.nock.clone().addScaledVector(fwd, 0.62);
      } else if (this.bones.Wrist_L && this.bones.Wrist_R) {
        const c = this._bonePos.Wrist_L.clone();
        bow = {
          tUp: c.clone().add(new this.THREE.Vector3(0, 0.56, 0)),
          tLo: c.clone().add(new this.THREE.Vector3(0, -0.56, 0)),
          nock: this._bonePos.Wrist_R.y > -50 ? this._bonePos.Wrist_R.clone() : c.clone().addScaledVector(fwd, -0.35),
          tip: c.clone().addScaledVector(fwd, 0.35)
        };
      }

      return { cx, floorY, cz, fwd, validBones, span, bow };
    }

    _sampleCircuit(out, circuit, u, span, cx, floorY, cz) {
      const len = circuit.length;
      const fIdx = clamp(u * (len - 1), 0, len - 1.0001);
      const i0 = Math.floor(fIdx);
      const i1 = Math.min(len - 1, i0 + 1);
      const frac = fIdx - i0;
      const resolve = (key, tgt) => {
        if (key === '_WTIP' && span) return tgt.copy(span.tip);
        if (key === '_WMID' && span) return tgt.copy(span.mid);
        if (key === '_WBASE' && span) return tgt.copy(span.base);
        const bp = this._bonePos[key];
        if (bp && bp.y > -50) return tgt.copy(bp);
        return tgt.set(cx, floorY + 1.05, cz);
      };
      resolve(circuit[i0], this._vD);
      resolve(circuit[i1], this._vE);
      return out.copy(this._vD).lerp(this._vE, frac);
    }

    spawnSparks(origin, count, speed, colorHex, upwardBias = 1.6) {
      this._colC.set(colorHex || '#fbbf24');
      let spawned = 0;
      for (let i = 0; i < SPARK_COUNT && spawned < count; i++) {
        const s = this.sparkData[i];
        if (s.life > 0.04) continue;
        const a = Math.random() * Math.PI * 2;
        const elev = (Math.random() - 0.15) * 1.4;
        const sp = speed * (0.45 + Math.random() * 0.85);
        s.x = origin.x + (Math.random() - 0.5) * 0.12;
        s.y = origin.y + (Math.random() - 0.5) * 0.12;
        s.z = origin.z + (Math.random() - 0.5) * 0.12;
        s.vx = Math.cos(a) * sp;
        s.vy = Math.abs(Math.sin(elev)) * sp * 0.75 + upwardBias * (0.4 + Math.random() * 0.7);
        s.vz = Math.sin(a) * sp;
        s.maxLife = 0.28 + Math.random() * 0.34;
        s.life = s.maxLife;
        const hot = Math.random() * 0.4;
        s.r = Math.min(1, this._colC.r + hot);
        s.g = Math.min(1, this._colC.g + hot);
        s.b = Math.min(1, this._colC.b + hot * 0.8);
        spawned++;
      }
    }

    spawnImpact(pos, skillId) {
      if (!pos) return;
      const prof = SKILL_VFX_PROFILES[skillId] || SKILL_VFX_PROFILES.attack;
      const c1 = (prof.colors && prof.colors[0]) || '#38bdf8';
      const c2 = (prof.colors && prof.colors[1]) || '#fde047';
      this.spawnSparks(pos, 14, 4.4, c1, 2.0);
      this.spawnSparks(pos, 10, 3.6, c2, 2.4);
      const r = this.ripples[this.rippleCursor];
      this.rippleCursor = (this.rippleCursor + 1) % this.ripples.length;
      r.life = r.maxLife;
      r.mesh.position.set(pos.x, pos.y + 0.04, pos.z);
      r.mesh.scale.setScalar(0.55);
      r.mesh.material.color.set(c1);
      r.mesh.material.opacity = 0.85;
      r.mesh.visible = true;
    }

    _spawnEnergyWave(kind, origin, targetPos, fwdFallback, active, scale, speed) {
      const THREE = this.THREE;
      const wg = new THREE.Group();
      const isThrust = (kind === 'thrust');
      const c1 = active.colors[0] || '#38bdf8';
      const c2 = active.colors[1] || '#fde047';
      const outerMat = new THREE.MeshBasicMaterial({
        color: c1, transparent: true, opacity: 0.85,
        side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
      });
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.90,
        side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
      });
      wg.add(new THREE.Mesh(isThrust ? this.thrustOuterGeo : this.crescentOuterGeo, outerMat));
      wg.add(new THREE.Mesh(isThrust ? this.thrustCoreGeo : this.crescentCoreGeo, coreMat));
      wg.position.copy(origin);

      const dir = targetPos.clone().sub(origin);
      dir.y = clamp(dir.y, -2.5, 2.5);
      if (dir.lengthSq() < 1e-4) dir.copy(fwdFallback);
      else dir.normalize();

      wg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
      if (kind === 'crescent') wg.rotateZ(Math.PI / 2);
      else if (kind === 'cross1') wg.rotateZ(0.76);
      else if (kind === 'cross2') wg.rotateZ(-0.76);
      wg.scale.setScalar(scale);
      this.group.add(wg);

      const spd = speed || (isThrust ? 29 : 23);
      const maxRange = clamp(active.range + 2.5, 8, 26);
      const life = maxRange / spd;
      this.waves.push({
        group: wg,
        mats: [outerMat, coreMat],
        vel: dir.multiplyScalar(spd),
        life,
        maxLife: life,
        baseScale: scale,
        colorHex: c1,
        secHex: c2,
        sparkCD: 0
      });
      this.spawnSparks(origin, 12, 4.2, c1, 1.4);
      this.spawnSparks(origin, 8, 3.2, c2, 1.8);
    }

    _spawnArrow(origin, dir, opts = {}) {
      const THREE = this.THREE;
      const g = new THREE.Group();
      const tint = opts.tintHex || '#38bdf8';
      const shaftMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
      const auraMat = new THREE.MeshBasicMaterial({
        color: tint, transparent: true, opacity: 0.78,
        side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
      });
      const tipMat = new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.90,
        blending: THREE.AdditiveBlending, depthWrite: false
      });
      const shaft = new THREE.Mesh(this.arrowShaftGeo, shaftMat);
      const aura = new THREE.Mesh(this.arrowAuraGeo, auraMat);
      const tip = new THREE.Mesh(this.arrowTipGeo, tipMat);
      const s = opts.auraScale || 1.25;
      aura.scale.setScalar(s);
      tip.scale.setScalar(s);
      g.add(shaft, aura, tip);

      const d = dir.clone().normalize();
      g.position.copy(origin);
      g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), d);
      this.group.add(g);

      const spd = opts.speed || 35;
      this.arrows.push({
        group: g,
        mats: [shaftMat, auraMat, tipMat],
        vel: d.multiplyScalar(spd).addScaledVector(this._up, opts.upBoost || 0),
        gravity: opts.gravity != null ? opts.gravity : 4.5,
        trailColor: opts.trailColor || tint,
        trailScale: opts.trailScale || 1.2,
        prismCycle: !!opts.prismCycle,
        stickOnGround: !!opts.stickOnGround,
        stuckTimer: 0,
        age: 0,
        maxAge: opts.maxAge || 1.6,
        trailT: 0,
        getGroundY: opts.getGroundY || null,
        floorY: opts.floorY != null ? opts.floorY : 0,
        targetDistSq: opts.targetDistSq || null,
        originPos: origin.clone()
      });
    }

    _spawnMeteor(targetPos, active, delayIdx) {
      const THREE = this.THREE;
      const spreadA = delayIdx * 2.1;
      const offR = delayIdx === 0 ? 0 : 1.35;
      const land = new THREE.Vector3(
        targetPos.x + Math.cos(spreadA) * offR,
        active.getGroundY(targetPos.x + Math.cos(spreadA) * offR, targetPos.z + Math.sin(spreadA) * offR),
        targetPos.z + Math.sin(spreadA) * offR
      );
      const start = land.clone().add(new THREE.Vector3(-2.5 + delayIdx * 1.4, 10.5, -2.0));
      const mg = new THREE.Group();
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      const shellMat = new THREE.MeshBasicMaterial({
        color: active.colors[0] || '#f97316', transparent: true, opacity: 0.72,
        blending: THREE.AdditiveBlending, depthWrite: false
      });
      mg.add(new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), coreMat));
      mg.add(new THREE.Mesh(new THREE.SphereGeometry(0.48, 10, 8), shellMat));
      mg.position.copy(start);
      this.group.add(mg);
      this.meteors.push({
        group: mg,
        mats: [coreMat, shellMat],
        start,
        land,
        t: 0,
        dur: 0.42,
        colorHex: active.colors[0] || '#f97316',
        secHex: active.colors[1] || '#fde047'
      });
    }

    _spawnArrowTrail(pos, colorHex, scale) {
      const mat = new this.THREE.MeshBasicMaterial({
        color: colorHex, transparent: true, opacity: 0.85,
        blending: this.THREE.AdditiveBlending, depthWrite: false
      });
      const mesh = new this.THREE.Mesh(this.arrowTrailGeo, mat);
      mesh.position.copy(pos);
      mesh.scale.setScalar(scale);
      this.group.add(mesh);
      this.trails.push({ mesh, life: 0.36, maxLife: 0.36, baseScale: scale });
      if (this.trails.length > 200) {
        const old = this.trails.shift();
        this.group.remove(old.mesh);
        old.mesh.material.dispose();
      }
    }

    _triggerSkillEvents(active, prevU, curU, frame) {
      const p = active.prof;
      const bowMode = p.bowMode;
      const aimTarget = (active.target && active.target.alive)
        ? new this.THREE.Vector3(active.target.x, (active.target.group ? active.target.group.position.y : frame.floorY) + 1.05, active.target.z)
        : active.targetPos.clone().setY(active.getGroundY(active.targetPos.x, active.targetPos.z) + 1.05);

      // 1. Ondas 3D voladoras (sw_lightning, sw_celestial, sw_cross, st_tempest, st_meteor, ln_skewer...)
      if (Array.isArray(p.wave)) {
        for (let i = 0; i < p.wave.length; i++) {
          const w = p.wave[i];
          if (!active.firedWaves.has(i) && prevU <= w.u && curU >= w.u) {
            active.firedWaves.add(i);
            const origin = frame.span.mid.clone().lerp(frame.span.tip, 0.70);
            this._spawnEnergyWave(w.kind, origin, aimTarget, frame.fwd, active, (w.scale || 1.1) * active.vfxScale, w.speed);
          }
        }
      }

      // 2. Meteoros astrales descendentes desde el cielo sobre el objetivo
      if (Array.isArray(p.meteors)) {
        for (let i = 0; i < p.meteors.length; i++) {
          if (!active.firedMeteors.has(i) && prevU <= p.meteors[i] && curU >= p.meteors[i]) {
            active.firedMeteors.add(i);
            this._spawnMeteor(aimTarget, active, i);
          }
        }
      }

      // 3. Eventos de habilidades de arco
      if (bowMode) {
        const bowOrigin = (frame.bow ? frame.bow.tip : frame.span.tip).clone();
        const shootDir = aimTarget.clone().sub(bowOrigin).normalize();
        const targetDistSq = bowOrigin.distanceToSquared(aimTarget);
        const relU = p.releaseU != null ? p.releaseU : 0.52;

        if (!active.firedBow1 && curU >= relU) {
          active.firedBow1 = true;
          this.spawnImpact(bowOrigin, active.skillId);
          if (bowMode === 'prism') {
            // Disparo hacia el cielo + oleada de 32 flechas arcoíris sobre aimTarget
            const skyDir = frame.fwd.clone().multiplyScalar(0.50).add(new this.THREE.Vector3(0, 0.88, 0)).normalize();
            this._spawnArrow(bowOrigin, skyDir, { tintHex: '#f472b6', speed: 30, gravity: 5.0, prismCycle: true, auraScale: 1.5, trailScale: 1.4, maxAge: 1.1 });
            this.rainWaves.push({
              delay: 0.28,
              elapsed: 0,
              duration: 1.15,
              spawned: 0,
              total: 32,
              targetX: aimTarget.x,
              targetZ: aimTarget.z,
              fwdX: frame.fwd.x,
              fwdZ: frame.fwd.z,
              getGroundY: active.getGroundY
            });
          } else if (bowMode === 'barrage') {
            const right = new this.THREE.Vector3().crossVectors(shootDir, this._up).normalize();
            [-0.10, 0, 0.10].forEach((off, idx) => {
              const d = shootDir.clone().addScaledVector(right, off).normalize();
              this._spawnArrow(bowOrigin, d, {
                tintHex: active.colors[idx % active.colors.length],
                speed: 34, gravity: 2.2, auraScale: 1.38, trailScale: 1.35, targetDistSq: targetDistSq * 1.1,
                getGroundY: active.getGroundY
              });
            });
            this.barrageFollow = { t: 0.14, origin: bowOrigin.clone(), dir: shootDir.clone(), colors: active.colors, targetDistSq, getGroundY: active.getGroundY };
          } else if (bowMode === 'double') {
            this._spawnArrow(bowOrigin, shootDir, { tintHex: active.colors[0], speed: 36, gravity: 1.6, auraScale: 1.25, targetDistSq, getGroundY: active.getGroundY });
          } else if (bowMode === 'frost') {
            this._spawnArrow(bowOrigin, shootDir, { tintHex: active.colors[0], speed: 42, gravity: 1.2, auraScale: 1.42, trailScale: 1.4, targetDistSq, getGroundY: active.getGroundY });
          } else {
            this._spawnArrow(bowOrigin, shootDir, { tintHex: active.colors[0], speed: 36, gravity: 1.6, auraScale: 1.28, targetDistSq, getGroundY: active.getGroundY });
          }
        }
        if (bowMode === 'double' && p.releaseU2 != null && !active.firedBow2 && curU >= p.releaseU2) {
          active.firedBow2 = true;
          this._spawnArrow(bowOrigin, shootDir, { tintHex: active.colors[1], speed: 37, gravity: 1.4, auraScale: 1.35, targetDistSq, getGroundY: active.getGroundY });
          const twinOrigin = bowOrigin.clone().add(new this.THREE.Vector3(0, 0.09, 0));
          this._spawnArrow(twinOrigin, shootDir, { tintHex: active.colors[0], speed: 36, gravity: 1.4, auraScale: 1.25, targetDistSq, getGroundY: active.getGroundY });
        }
      }
    }

    update(delta, camera, oneShotState) {
      const dt = Math.min(0.05, Math.max(0.001, delta || 0.016));
      this.energyTime += dt;
      const t = this.energyTime;
      const camPos = (camera && camera.position) ? camera.position : this._up;
      const frame = this._computeHeroFrame();

      const active = this.active;
      if (active) {
        active.elapsed += dt;
        const prevU = active.prevU;
        let u = clamp(active.elapsed / active.duration, 0, 1);
        if (oneShotState && oneShotState.active && oneShotState.kind === active.skillId && oneShotState.duration > 0) {
          u = clamp(oneShotState.u, u, 1);
        }
        if (frame) this._triggerSkillEvents(active, prevU, u, frame);
        active.prevU = u;
        if (active.elapsed >= active.duration) this.active = null;
      }

      // Actualizar proyectiles / ondas / lluvia incluso si la skill del héroe ya terminó
      this._updateWaves(dt);
      this._updateMeteors(dt);
      this._updateBowVFX(dt, active, frame, camPos, t);
      this._updateSparks(dt, frame ? frame.floorY : 0);

      if (!active || !frame) {
        this._fadeIdleVisuals(dt);
        return;
      }

      const u = clamp(active.elapsed / active.duration, 0, 1);
      const p = active.prof;
      const isBow = (p.mode === 'bow');
      const isPeak = (p.shock && u >= p.shock[0] && u <= p.shock[1]) ||
        (p.beam && u >= p.beam[0] && u <= p.beam[1]) ||
        (p.nova && u >= p.nova[0] && u <= p.nova[1]);
      const inRange = (r) => Boolean(r && u >= r[0] && u <= r[1]);
      const bladeCharge = u < 0.24 ? lerp(0.18, 0.72, u / 0.24)
        : u < 0.48 ? lerp(0.72, 1.15, (u - 0.24) / 0.24)
        : u < 0.85 ? (isPeak ? 1.25 : 0.95)
        : 1.25 * (1 - (u - 0.85) / 0.15);
      const drainK = isBow ? 0 : (u < 0.25 ? 0.12 : (u < 0.45 ? lerp(0.12, 0.55, (u - 0.25) / 0.20) : (u < 0.85 ? 0.92 : 0.25)));
      const bodyFade = Math.max(0.32, 1.18 - drainK * 0.82);

      // Semilla eléctrica ~26 Hz
      this.seedTimer += dt * (active.preset.boltSpeed || 26);
      if (this.seedTimer >= 1) {
        this.seed = (this.seed + Math.floor(this.seedTimer)) % 9973;
        this.seedTimer %= 1;
      }

      // A. 28 RAYOS VOLUMÉTRICOS CORPORALES + CONDUCTOS AL ARMA
      if (frame.validBones > 0) {
        const bPos = this.bodyBolts.geometry.attributes.position;
        const bCol = this.bodyBolts.geometry.attributes.color;
        let qCur = 0;
        const activeConduits = (!isBow && (drainK > 0.10 || bladeCharge > 0.20)) ? Math.min(12, Math.max(2, Math.round(drainK * 10 + 2))) : 0;

        for (let bi = 0; bi < BODY_BOLT_COUNT; bi++) {
          const isBranch = bi >= 20;
          const isConduit = (!isBranch && bi >= (20 - activeConduits));
          const circuit = isConduit ? WEAPON_SURGE_CIRCUITS[(bi + this.seed) % WEAPON_SURGE_CIRCUITS.length] : BODY_CIRCUITS[bi];
          const jitter = (active.preset.boltJitter || 0.12) * (isBranch ? 1.25 : 1.0) * (0.8 + 0.3 * active.intensity);

          for (let s = 0; s <= BODY_BOLT_SEGS; s++) {
            const frac = s / BODY_BOLT_SEGS;
            const pt = this._boltPts[s];
            if (!isBranch) {
              this._sampleCircuit(pt, circuit, frac, frame.span, frame.cx, frame.floorY, frame.cz);
            } else {
              const bKey = BODY_BONE_KEYS[(bi * 3 + this.seed) % BODY_BONE_KEYS.length];
              const org = this._bonePos[bKey];
              const ox = org && org.y > -50 ? org.x : frame.cx;
              const oy = org && org.y > -50 ? org.y : frame.floorY + 1.1;
              const oz = org && org.y > -50 ? org.z : frame.cz;
              const ang = hashN(bi * 17 + this.seed * 3) * Math.PI * 2;
              const reach = (0.28 + hashN(bi * 29 + this.seed) * 0.44) * active.intensity;
              pt.set(ox + Math.cos(ang) * reach * frac, oy + (hashN(bi * 43 + this.seed) - 0.3) * 0.55 * frac, oz + Math.sin(ang) * reach * frac);
            }
            const env = Math.sin(frac * Math.PI);
            if (env > 0.01) {
              const amp = jitter * (0.45 + 0.55 * env);
              pt.x += (hashN(this.seed * 37.3 + bi * 19.1 + s * 7.7) - 0.5) * 2 * amp;
              pt.y += (hashN(this.seed * 53.9 + bi * 31.7 + s * 13.3) - 0.5) * 1.7 * amp;
              pt.z += (hashN(this.seed * 71.1 + bi * 11.3 + s * 5.9) - 0.5) * 2 * amp;
            }
          }
          for (let s = 0; s < BODY_BOLT_SEGS; s++) {
            const frac = (s + 0.5) / BODY_BOLT_SEGS;
            const surge = 0.55 + 0.45 * Math.sin(frac * 7.5 - t * 22 + bi * 1.4);
            const segScale = isConduit ? (0.75 + 0.65 * drainK) : bodyFade;
            const outerW = (isBranch ? 0.017 : 0.023) * (0.7 + 0.4 * surge) * active.intensity * 0.82;
            const coreW = outerW * 0.38;
            this._getColor(this._colW, active, frac, bi);
            const br = (0.72 + 0.35 * surge) * segScale;
            qCur = writeQuad(bPos, bCol, qCur, this._boltPts[s], this._boltPts[s + 1], outerW, this._colW.r * br, this._colW.g * br, this._colW.b * br, camPos, this._vC, this._dir, this._camDir, this._side);
            qCur = writeQuad(bPos, bCol, qCur, this._boltPts[s], this._boltPts[s + 1], coreW, Math.min(1, br), Math.min(1, br * 0.98), Math.min(1, br), camPos, this._vC, this._dir, this._camDir, this._side);
          }
        }
        this.bodyBolts.geometry.setDrawRange(0, qCur * 6);
        bPos.needsUpdate = true;
        bCol.needsUpdate = true;
        this.bodyBolts.visible = true;
      }

      // B. 3 CINTAS HELICOIDALES + 140 PARTÍCULAS ELEMENTALES + AURA SUELO
      const rPos = this.energyRibbons.geometry.attributes.position;
      const rCol = this.energyRibbons.geometry.attributes.color;
      const ribVerts = (BODY_RIBBON_SEGS + 1) * 2;
      const headY = (this._bonePos.Head && this._bonePos.Head.y > -50) ? this._bonePos.Head.y + 0.25 : frame.floorY + 1.9;
      const torsoX = (this._bonePos.Torso && this._bonePos.Torso.y > -50) ? this._bonePos.Torso.x : frame.cx;
      const torsoZ = (this._bonePos.Torso && this._bonePos.Torso.y > -50) ? this._bonePos.Torso.z : frame.cz;
      for (let r = 0; r < BODY_RIBBON_COUNT; r++) {
        const bv = r * ribVerts;
        const phase0 = (r / BODY_RIBBON_COUNT) * Math.PI * 2;
        const sign = r % 2 === 0 ? 1 : -1;
        for (let s = 0; s <= BODY_RIBBON_SEGS; s++) {
          const frac = s / BODY_RIBBON_SEGS;
          const y = lerp(frame.floorY + 0.05, headY, frac);
          const env = Math.sin(frac * Math.PI);
          const ang = phase0 + sign * (frac * active.preset.ribbonTwist + t * (2.8 + r * 0.5));
          const rad = (0.30 + 0.24 * env) * (0.85 + 0.18 * active.intensity);
          const rx = torsoX + Math.cos(ang) * rad;
          const rz = torsoZ + Math.sin(ang) * rad;
          const stripH = (0.042 + 0.036 * env) * active.intensity;
          const v = bv + s * 2;
          rPos.setXYZ(v, rx, y - stripH, rz);
          rPos.setXYZ(v + 1, rx + Math.cos(ang) * 0.024, y + stripH, rz + Math.sin(ang) * 0.024);
          this._getColor(this._colW, active, frac, r + 4);
          const a = env * (0.5 + 0.5 * Math.sin(frac * 8 - t * 9 + r)) * 0.78 * bodyFade;
          rCol.setXYZ(v, this._colW.r * a * 0.45, this._colW.g * a * 0.45, this._colW.b * a * 0.45);
          rCol.setXYZ(v + 1, Math.min(1, this._colW.r + 0.2) * a, Math.min(1, this._colW.g + 0.2) * a, Math.min(1, this._colW.b + 0.2) * a);
        }
      }
      rPos.needsUpdate = true;
      rCol.needsUpdate = true;
      this.energyRibbons.visible = true;

      this._updateBodyParticles(dt, active, frame, torsoX, torsoZ, t);

      this._getColor(this._colW, active, 0.25, 0);
      this.auraFloorRing.position.set(torsoX, frame.floorY, torsoZ);
      this.auraFloorRing.rotation.z = t * 1.8;
      this.auraFloorRing.scale.setScalar(0.95 + Math.sin(t * 6) * 0.1);
      this.auraFloorRing.material.color.copy(this._colW);
      this.auraFloorRing.material.opacity = 0.45 * bodyFade;
      this.auraFloorRing.visible = true;

      this._getColor(this._colW, active, 0.75, 2);
      this.auraFloorRing2.position.set(torsoX, frame.floorY + 0.005, torsoZ);
      this.auraFloorRing2.rotation.z = -t * 2.4;
      this.auraFloorRing2.scale.setScalar(1.0 + Math.cos(t * 7) * 0.12);
      this.auraFloorRing2.material.color.copy(this._colW);
      this.auraFloorRing2.material.opacity = 0.34 * bodyFade;
      this.auraFloorRing2.visible = true;

      this.energyLight.position.set(torsoX, frame.floorY + 1.25, torsoZ);
      this.energyLight.color.copy(this._colW);
      this.energyLight.intensity = (active.preset.lightInt || 2.2) * (0.78 + 0.22 * Math.sin(t * 18));

      // C. ARMA: 12 RAYOS EN ESPIRAL + FUNDA DE PLASMA + ESFERA EN LA PUNTA + DOBLE ESTELA
      if (!isBow && frame.span) {
        this._updateWeaponVFX(dt, active, frame, bladeCharge, drainK, inRange(p.trail) || inRange(p.pierce) || inRange(p.arcane), camPos, t);
      } else {
        this.bladeBolts.visible = false;
        this.bladeSheath.visible = false;
        this.trail.visible = false;
        this.trailCore.visible = false;
      }

      // D. ONDAS DE SUELO, ANILLOS PIERCE, NOVA, CAÑÓN SOLAR, PILAR CELESTIAL Y HALO ARCANO
      this._updateAreaAndBeamVFX(dt, u, active, frame, t);
    }

    _updateBodyParticles(dt, active, frame, torsoX, torsoZ, t) {
      const pMode = active.preset.particleMode || 'spark';
      let spawned = 0;
      const emit = Math.min(8, Math.round(5 * active.intensity));
      for (let i = 0; i < BODY_PARTICLE_COUNT && spawned < emit; i++) {
        const pt = this.bodyParticleData[i];
        if (pt.life > 0.02) continue;
        const bKey = BODY_BONE_KEYS[Math.floor(Math.random() * BODY_BONE_KEYS.length)];
        const bp = this._bonePos[bKey];
        pt.x = ((bp && bp.y > -50) ? bp.x : torsoX) + (Math.random() - 0.5) * 0.18;
        pt.y = ((bp && bp.y > -50) ? bp.y : frame.floorY + 1.1) + (Math.random() - 0.5) * 0.18;
        pt.z = ((bp && bp.y > -50) ? bp.z : torsoZ) + (Math.random() - 0.5) * 0.18;
        pt.kind = pMode;
        const a = Math.random() * Math.PI * 2;
        pt.vx = Math.cos(a) * (0.45 + Math.random() * 0.9);
        pt.vz = Math.sin(a) * (0.45 + Math.random() * 0.9);
        pt.vy = pMode === 'frost' ? (-0.2 + Math.random() * 0.6) : (0.9 + Math.random() * 1.4);
        pt.maxLife = 0.24 + Math.random() * 0.30;
        pt.life = pt.maxLife;
        this._getColor(this._colW, active, Math.random(), i);
        pt.r = this._colW.r; pt.g = this._colW.g; pt.b = this._colW.b;
        spawned++;
      }
      const pos = this.bodyParticles.geometry.attributes.position;
      const col = this.bodyParticles.geometry.attributes.color;
      let count = 0;
      for (let i = 0; i < BODY_PARTICLE_COUNT; i++) {
        const pt = this.bodyParticleData[i];
        if (pt.life > 0) {
          pt.life -= dt;
          if (pt.kind === 'spark') pt.vy -= 3.8 * dt;
          else if (pt.kind === 'fire') pt.vy += 1.2 * dt;
          pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.z += pt.vz * dt;
          const k = Math.max(0, pt.life / pt.maxLife);
          pos.setXYZ(i, pt.x, pt.y, pt.z);
          col.setXYZ(i, pt.r * k, pt.g * k, pt.b * k);
          count++;
        } else {
          pos.setXYZ(i, 0, -99, 0); col.setXYZ(i, 0, 0, 0);
        }
      }
      if (count > 0) { pos.needsUpdate = true; col.needsUpdate = true; this.bodyParticles.visible = true; }
      else this.bodyParticles.visible = false;
    }

    _updateWeaponVFX(dt, active, frame, charge, drainK, wantsTrail, camPos, t) {
      const span = frame.span;
      this._getColor(this._colA, active, 0.1, 0);
      this._getColor(this._colB, active, 0.7, 1);

      // 12 rayos en espiral por el arma
      this._dir.subVectors(span.tip, span.base);
      const bladeLen = Math.max(0.22, this._dir.length());
      this._dir.divideScalar(bladeLen);
      this._perp1.crossVectors(this._dir, Math.abs(this._dir.y) > 0.92 ? this._vA.set(1, 0, 0) : this._up).normalize();
      this._perp2.crossVectors(this._dir, this._perp1).normalize();

      const bPos = this.bladeBolts.geometry.attributes.position;
      const bCol = this.bladeBolts.geometry.attributes.color;
      let qCur = 0;
      const reach = clamp(0.32 + charge * 0.78, 0.35, 1.0);
      const lenScale = clamp(bladeLen / 0.90, 0.55, 1.35);

      for (let bi = 0; bi < SWORD_BOLT_COUNT; bi++) {
        const isSpiral = bi < 8;
        if (isSpiral) {
          const turns = (bi % 2 === 0 ? 1.9 : -2.3);
          const ph0 = bi * 0.785 + t * (bi % 2 === 0 ? 10 : -11.5);
          const rad0 = (0.022 + 0.032 * charge) * lenScale;
          for (let s = 0; s <= SWORD_BOLT_SEGS; s++) {
            const f = (s / SWORD_BOLT_SEGS) * reach;
            const pt = this._boltPts[s];
            pt.copy(span.base).lerp(span.tip, f);
            const env = Math.sin((s / SWORD_BOLT_SEGS) * Math.PI);
            const ang = ph0 + f * Math.PI * 2 * turns;
            pt.addScaledVector(this._perp1, Math.cos(ang) * rad0 * (0.35 + 0.65 * env));
            pt.addScaledVector(this._perp2, Math.sin(ang) * rad0 * (0.35 + 0.65 * env));
          }
        } else {
          const bKey = ['Shoulder_R', 'Elbow_R', 'Wrist_R', 'Wrist_R'][bi - 8];
          const org = this._bonePos[bKey] && this._bonePos[bKey].y > -50 ? this._bonePos[bKey] : span.base;
          this._vA.copy(span.base).lerp(span.tip, bi % 2 === 0 ? reach : reach * 0.55);
          for (let s = 0; s <= SWORD_BOLT_SEGS; s++) {
            const f = s / SWORD_BOLT_SEGS;
            const pt = this._boltPts[s];
            pt.copy(org).lerp(this._vA, f);
            const env = Math.sin(f * Math.PI);
            pt.x += (hashN(this.seed * 43.3 + bi * 17.9 + s * 9.1) - 0.5) * 0.12 * env;
            pt.y += (hashN(this.seed * 61.7 + bi * 23.3 + s * 13.7) - 0.5) * 0.12 * env;
            pt.z += (hashN(this.seed * 29.9 + bi * 31.1 + s * 5.3) - 0.5) * 0.12 * env;
          }
        }
        const outerW = 0.013 * (0.6 + 0.65 * Math.min(1.2, charge)) * lenScale;
        const coreW = outerW * 0.38;
        for (let s = 0; s < SWORD_BOLT_SEGS; s++) {
          const f = (s + 0.5) / SWORD_BOLT_SEGS;
          this._getColor(this._colW, active, f, bi);
          const br = 0.72 + 0.45 * drainK;
          qCur = writeQuad(bPos, bCol, qCur, this._boltPts[s], this._boltPts[s + 1], outerW, this._colW.r * br, this._colW.g * br, this._colW.b * br, camPos, this._vC, this._dir, this._camDir, this._side);
          qCur = writeQuad(bPos, bCol, qCur, this._boltPts[s], this._boltPts[s + 1], coreW, Math.min(1, br), Math.min(1, br * 0.98), Math.min(1, br), camPos, this._vC, this._dir, this._camDir, this._side);
        }
      }
      this.bladeBolts.geometry.setDrawRange(0, qCur * 6);
      bPos.needsUpdate = true; bCol.needsUpdate = true;
      this.bladeBolts.visible = true;

      // Funda de plasma
      this.bladeSheath.position.copy(span.base).lerp(span.tip, reach * 0.5);
      this.bladeSheath.quaternion.setFromUnitVectors(this._up, this._dir);
      const pulse = 1.0 + 0.14 * Math.sin(t * 28);
      const sw = (0.55 + charge * 0.7) * lenScale * pulse;
      this.bladeSheath.scale.set(sw, bladeLen * reach * 0.95, sw);
      this.bladeSheath.material.color.copy(this._colA).lerp(this._colB, 0.35);
      this.bladeSheath.material.opacity = Math.min(0.55, charge * 0.45);
      this.bladeSheath.visible = true;

      // Esfera de energía + 8 filamentos en span.tip
      this._updateTipChargeSphere(span.tip, charge, active, lenScale, pulse, t);
      this.bladeLight.position.copy(span.tip);
      this.bladeLight.color.copy(this._colA);
      this.bladeLight.intensity = charge * 2.8 * pulse;

      // Doble estela del filo
      if (wantsTrail) {
        if (this.history.length > 0 && this.history[this.history.length - 1].tip.distanceToSquared(span.tip) > 2.2) {
          this.history.length = 0;
        }
        this.history.push(span);
        active.sparkCD -= dt;
        if (this.history.length >= 2 && active.sparkCD <= 0) {
          this.spawnSparks(span.tip, 2, 2.2, Math.random() < 0.5 ? active.colors[0] : active.colors[1], 0.9);
          active.sparkCD = 0.032;
        }
      } else if (this.history.length) {
        this.history.shift();
      }
      while (this.history.length > TRAIL_MAX) this.history.shift();

      if (this.history.length >= 2) {
        const pos = this.trail.geometry.attributes.position;
        const col = this.trail.geometry.attributes.color;
        const cPos = this.trailCore.geometry.attributes.position;
        const cCol = this.trailCore.geometry.attributes.color;
        const idx = [];
        for (let i = 0; i < this.history.length; i++) {
          const f = i / (this.history.length - 1);
          const a = Math.pow(f, 1.45);
          this._getColor(this._colW, active, f, 2);
          pos.setXYZ(i * 2, this.history[i].mid.x, this.history[i].mid.y, this.history[i].mid.z);
          pos.setXYZ(i * 2 + 1, this.history[i].tip.x, this.history[i].tip.y, this.history[i].tip.z);
          col.setXYZ(i * 2, this._colW.r * a * 0.25, this._colW.g * a * 0.25, this._colW.b * a * 0.25);
          col.setXYZ(i * 2 + 1, this._colW.r * a, this._colW.g * a, this._colW.b * a);
          cPos.setXYZ(i * 2, this.history[i].core.x, this.history[i].core.y, this.history[i].core.z);
          cPos.setXYZ(i * 2 + 1, this.history[i].tip.x, this.history[i].tip.y, this.history[i].tip.z);
          const ca = Math.pow(f, 1.9);
          cCol.setXYZ(i * 2, (this._colW.r * 0.5 + 0.5) * ca, (this._colW.g * 0.5 + 0.5) * ca, (this._colW.b * 0.5 + 0.5) * ca);
          cCol.setXYZ(i * 2 + 1, ca, 0.98 * ca, 0.92 * ca);
          if (i < this.history.length - 1) {
            const q = i * 2;
            idx.push(q, q + 1, q + 3, q, q + 3, q + 2);
          }
        }
        this.trail.geometry.setIndex(idx); this.trail.geometry.setDrawRange(0, idx.length);
        pos.needsUpdate = true; col.needsUpdate = true; this.trail.visible = true;
        this.trailCore.geometry.setIndex(idx); this.trailCore.geometry.setDrawRange(0, idx.length);
        cPos.needsUpdate = true; cCol.needsUpdate = true; this.trailCore.visible = true;
      } else {
        this.trail.visible = false;
        this.trailCore.visible = false;
      }
    }

    _updateTipChargeSphere(tipPos, sAmp, active, scale, pulse, t) {
      if (sAmp <= 0.08) {
        this.chargeGroup.visible = false;
        this.chargeStreams.visible = false;
        return;
      }
      this._getColor(this._colA, active, 0.15, 0);
      this._getColor(this._colB, active, 0.75, 1);
      this.chargeGroup.position.copy(tipPos);
      this.chargeCore.scale.setScalar((0.35 + sAmp * 0.85) * scale * pulse);
      this.chargeCore.material.opacity = Math.min(0.92, sAmp);
      this.chargeHalo.scale.setScalar((0.22 + sAmp * 0.48) * scale * pulse);
      this.chargeHalo.material.color.copy(this._colA);
      this.chargeHalo.material.opacity = Math.min(0.88, sAmp * 0.9);
      this.chargeRingA.scale.setScalar((0.38 + sAmp * 0.88) * scale);
      this.chargeRingA.rotation.set(t * 7.2, t * 4.5, 0);
      this.chargeRingA.material.color.copy(this._colA);
      this.chargeRingA.material.opacity = Math.min(0.84, sAmp * 0.8);
      this.chargeRingB.scale.setScalar((0.32 + sAmp * 0.74) * scale);
      this.chargeRingB.rotation.set(-t * 5.8, 0, t * 8.1);
      this.chargeRingB.material.color.copy(this._colB);
      this.chargeRingB.material.opacity = Math.min(0.80, sAmp * 0.75);
      this.chargeGroup.visible = true;

      const sPos = this.chargeStreams.geometry.attributes.position;
      const sCol = this.chargeStreams.geometry.attributes.color;
      for (let k = 0; k < SWORD_STREAM_COUNT; k++) {
        const ph = (t * 3.8 + k / SWORD_STREAM_COUNT) % 1.0;
        const rOut = (1.0 - ph) * (0.16 + sAmp * 0.26) * scale;
        const rIn = Math.max(0.012, rOut - 0.12 * scale * sAmp);
        const theta = k * 2.39996 + t * 2.6;
        const elev = Math.sin(k * 1.9 + t * 2.1) * 0.78;
        const ce = Math.cos(elev);
        const dx = Math.cos(theta) * ce, dy = Math.sin(elev), dz = Math.sin(theta) * ce;
        sPos.setXYZ(k * 2, tipPos.x + dx * rOut, tipPos.y + dy * rOut, tipPos.z + dz * rOut);
        sPos.setXYZ(k * 2 + 1, tipPos.x + dx * rIn, tipPos.y + dy * rIn, tipPos.z + dz * rIn);
        this._getColor(this._colW, active, k / SWORD_STREAM_COUNT, k);
        const aIn = Math.sin(ph * Math.PI) * Math.min(1.0, sAmp);
        sCol.setXYZ(k * 2, this._colW.r * aIn * 0.35, this._colW.g * aIn * 0.35, this._colW.b * aIn * 0.35);
        sCol.setXYZ(k * 2 + 1, Math.min(1, this._colW.r + 0.3) * aIn, Math.min(1, this._colW.g + 0.3) * aIn, Math.min(1, this._colW.b + 0.3) * aIn);
      }
      sPos.needsUpdate = true; sCol.needsUpdate = true;
      this.chargeStreams.visible = true;
    }

    _updateAreaAndBeamVFX(dt, u, active, frame, t) {
      const p = active.prof;
      this._getColor(this._colW, active, 0.2, 0);
      const aimPos = (active.target && active.target.alive)
        ? new this.THREE.Vector3(active.target.x, (active.target.group ? active.target.group.position.y : frame.floorY) + 1.05, active.target.z)
        : active.targetPos.clone().setY(active.getGroundY(active.targetPos.x, active.targetPos.z) + 1.05);

      // Shockwaves en el suelo
      if (p.shock && u >= p.shock[0] && u <= p.shock[1]) {
        const k = clamp((u - p.shock[0]) / Math.max(0.05, p.shock[1] - p.shock[0]), 0, 1);
        const ix = lerp(frame.cx, frame.span.tip.x, 0.55);
        const iz = lerp(frame.cz, frame.span.tip.z, 0.55);
        const fy = active.getGroundY(ix, iz) + 0.03;
        this.ring.position.set(ix, fy, iz);
        this.ring.scale.setScalar((0.4 + Math.pow(k, 0.72) * 4.2) * active.vfxScale);
        this.ring.material.color.copy(this._colW);
        this.ring.material.opacity = (1 - k) * 0.85;
        this.ring.visible = true;

        this.ring2.position.set(ix, fy + 0.02, iz);
        this.ring2.scale.setScalar((0.3 + Math.pow(k, 0.85) * 5.6) * active.vfxScale);
        this.ring2.material.color.set(active.colors[1] || '#fde047');
        this.ring2.material.opacity = (1 - k) * 0.62;
        this.ring2.visible = true;

        this.groundGlow.position.set(ix, fy + 0.01, iz);
        this.groundGlow.scale.setScalar((0.7 + k * 2.5) * active.vfxScale);
        this.groundGlow.material.color.copy(this._colW);
        this.groundGlow.material.opacity = (1 - k) * 0.64;
        this.groundGlow.visible = true;
      } else {
        if (this.ring.visible) this.ring.visible = false;
        if (this.ring2.visible) this.ring2.visible = false;
        if (this.groundGlow.visible) this.groundGlow.visible = false;
      }

      // Pierce anillos supersónicos
      if (p.pierce && u >= p.pierce[0] && u <= p.pierce[1]) {
        this._dir.subVectors(frame.span.tip, frame.span.base).normalize();
        if (this._dir.lengthSq() < 1e-6) this._dir.copy(frame.fwd);
        this._quat.setFromUnitVectors(this._fwd, this._dir);
        for (let i = 0; i < this.pierceRings.length; i++) {
          const pr = this.pierceRings[i];
          const phase = (u * 3.5 + i * 0.33) % 1.0;
          pr.position.copy(frame.span.tip).addScaledVector(this._dir, -0.3 + phase * 0.65);
          pr.quaternion.copy(this._quat);
          pr.scale.setScalar((0.6 + phase * 2.2) * active.vfxScale);
          pr.material.color.set(active.colors[i % active.colors.length] || '#38bdf8');
          pr.material.opacity = Math.sin(phase * Math.PI) * 0.78;
          pr.visible = true;
        }
      } else {
        this.pierceRings.forEach(pr => {
          if (pr.visible) { pr.material.opacity *= 0.78; if (pr.material.opacity < 0.02) pr.visible = false; }
        });
      }

      // Cúpula Supernova (st_nova)
      if (p.nova && u >= p.nova[0] && u <= p.nova[1]) {
        const nk = (u - p.nova[0]) / Math.max(0.05, p.nova[1] - p.nova[0]);
        this.novaDome.position.set(frame.cx, frame.floorY + 1.05, frame.cz);
        this.novaDome.scale.setScalar(0.35 + Math.pow(nk, 0.58) * Math.max(4.5, active.range * 0.85));
        this.novaDome.material.color.copy(this._colW);
        this.novaDome.material.opacity = Math.sin(nk * Math.PI) * 0.32;
        this.novaDome.visible = true;
      } else if (this.novaDome.visible) {
        this.novaDome.visible = false;
      }

      // Cañón Solar (haz continuo desde la punta del báculo hasta aimPos!)
      if (p.mode === 'beam' && p.beam && u >= p.beam[0] && u <= p.beam[1]) {
        const bk = Math.sin(((u - p.beam[0]) / Math.max(0.05, p.beam[1] - p.beam[0])) * Math.PI);
        const beamStart = frame.span.tip.clone();
        const beamVec = aimPos.clone().sub(beamStart);
        const len = clamp(beamVec.length(), 4, active.range || 24);
        const bDir = beamVec.lengthSq() > 1e-4 ? beamVec.normalize() : frame.fwd.clone();
        const mid = beamStart.clone().addScaledVector(bDir, len * 0.5);
        const qBeam = new this.THREE.Quaternion().setFromUnitVectors(this._up, bDir);
        const girth = (0.85 + bk * 1.15) * (1 + 0.1 * Math.sin(t * 28));
        this.beamMesh.position.copy(mid); this.beamMesh.quaternion.copy(qBeam);
        this.beamMesh.scale.set(girth, len, girth);
        this.beamMesh.material.color.copy(this._colW); this.beamMesh.material.opacity = bk * 0.68;
        this.beamMesh.visible = true;
        this.beamCoreMesh.position.copy(mid); this.beamCoreMesh.quaternion.copy(qBeam);
        this.beamCoreMesh.scale.set(girth * 0.85, len, girth * 0.85);
        this.beamCoreMesh.material.opacity = bk * 0.85;
        this.beamCoreMesh.visible = true;
        if (Math.random() < dt * 28) this.spawnSparks(aimPos, 3, 4.2, active.colors[1] || '#fde047', 1.8);
      } else if (this.beamMesh.visible || this.beamCoreMesh.visible) {
        this.beamMesh.visible = false;
        this.beamCoreMesh.visible = false;
      }

      // Juicio Celestial / Espada Celestial (Pilar sagrado descendiendo sobre el objetivo!)
      if ((p.skyPillar || p.mode === 'judgment') && u >= 0.48 && u <= 0.90) {
        const pk = Math.sin(((u - 0.48) / 0.42) * Math.PI);
        const groundY = active.getGroundY(aimPos.x, aimPos.z);
        this.skyPillarMesh.position.set(aimPos.x, groundY + 7.0, aimPos.z);
        this.skyPillarMesh.scale.set(0.65 + pk * 0.85, 1.0, 0.65 + pk * 0.85);
        this.skyPillarMesh.material.color.set(active.colors[0] || '#fde047');
        this.skyPillarMesh.material.opacity = pk * 0.62;
        this.skyPillarMesh.visible = true;
        this.skyPillarCore.position.set(aimPos.x, groundY + 7.0, aimPos.z);
        this.skyPillarCore.scale.set(0.6 + pk * 0.7, 1.0, 0.6 + pk * 0.7);
        this.skyPillarCore.material.opacity = pk * 0.82;
        this.skyPillarCore.visible = true;
        if (!active.firedPillar) {
          active.firedPillar = true;
          this.spawnImpact(new this.THREE.Vector3(aimPos.x, groundY, aimPos.z), active.skillId);
        }
      } else if (this.skyPillarMesh.visible || this.skyPillarCore.visible) {
        this.skyPillarMesh.visible = false;
        this.skyPillarCore.visible = false;
      }

      // Halo Arcano rotatorio alrededor del personaje
      if (p.arcane && u >= p.arcane[0] && u <= p.arcane[1]) {
        const ak = Math.sin(clamp((u - p.arcane[0]) / Math.max(0.05, p.arcane[1] - p.arcane[0]), 0, 1) * Math.PI);
        this.arcaneHalo.position.set(frame.cx, frame.floorY + 1.15 + Math.sin(u * Math.PI) * 0.3, frame.cz);
        this.arcaneHalo.rotation.set(Math.PI * 0.42, u * Math.PI * 3, u * Math.PI * 2);
        this.arcaneHalo.scale.setScalar(0.90 + ak * 0.80);
        this.arcaneHalo.material.color.copy(this._colW);
        this.arcaneHalo.material.opacity = ak * 0.64;
        this.arcaneHalo.visible = true;
      } else if (this.arcaneHalo.visible) {
        this.arcaneHalo.visible = false;
      }
    }

    _updateBowVFX(dt, active, frame, camPos, t) {
      // 1. Segunda mini-descarga de Descarga de Meteoros
      if (this.barrageFollow) {
        this.barrageFollow.t -= dt;
        if (this.barrageFollow.t <= 0) {
          const bf = this.barrageFollow;
          this.barrageFollow = null;
          const right = new this.THREE.Vector3().crossVectors(bf.dir, this._up).normalize();
          [-0.045, 0.045].forEach((ang, idx) => {
            const d = bf.dir.clone().addScaledVector(right, ang).normalize();
            this._spawnArrow(bf.origin, d, {
              tintHex: bf.colors[idx % bf.colors.length] || '#f97316',
              speed: 36, gravity: 2.0, auraScale: 1.38, trailScale: 1.35, targetDistSq: bf.targetDistSq,
              getGroundY: bf.getGroundY
            });
          });
        }
      }

      // 2. Lluvia Prisma (32 flechas cayendo del cielo sobre la zona objetivo)
      let zoneAlpha = 0, zoneX = 0, zoneY = 0, zoneZ = 0;
      for (let i = this.rainWaves.length - 1; i >= 0; i--) {
        const rw = this.rainWaves[i];
        if (rw.delay > 0) {
          rw.delay -= dt;
          zoneAlpha = Math.max(zoneAlpha, 0.45);
          zoneX = rw.targetX; zoneZ = rw.targetZ; zoneY = rw.getGroundY(zoneX, zoneZ);
          continue;
        }
        rw.elapsed += dt;
        const frac = Math.min(1, rw.elapsed / rw.duration);
        const want = Math.min(rw.total, Math.floor(frac * rw.total) + 1);
        while (rw.spawned < want) {
          const idx = rw.spawned++;
          const ang = hashN(idx * 17.3 + rw.targetX * 3.1) * Math.PI * 2;
          const rad = Math.sqrt(hashN(idx * 29.7 + rw.targetZ * 5.3)) * 2.4;
          const landX = rw.targetX + Math.cos(ang) * rad;
          const landZ = rw.targetZ + Math.sin(ang) * rad;
          const landY = rw.getGroundY(landX, landZ);
          const skyH = 9.0 + hashN(idx * 43.1) * 3.0;
          const spawnPos = new this.THREE.Vector3(landX - rw.fwdX * 1.4, landY + skyH, landZ - rw.fwdZ * 1.4);
          const fallDir = new this.THREE.Vector3(rw.fwdX * 1.4, -skyH, rw.fwdZ * 1.4).normalize();
          this._colW.setHSL((idx / rw.total + rw.elapsed * 0.4) % 1.0, 0.96, 0.58);
          const hex = '#' + this._colW.getHexString();
          this._spawnArrow(spawnPos, fallDir, {
            tintHex: hex, trailColor: hex, speed: 24 + hashN(idx * 11.9) * 6,
            auraScale: 1.35, trailScale: 1.1, gravity: 14.0, stickOnGround: true, floorY: landY
          });
        }
        zoneAlpha = Math.max(zoneAlpha, Math.sin(Math.min(1, rw.elapsed / (rw.duration + 0.55)) * Math.PI) * 0.80);
        zoneX = rw.targetX; zoneZ = rw.targetZ; zoneY = rw.getGroundY(zoneX, zoneZ);
        if (rw.elapsed >= rw.duration + 0.55) this.rainWaves.splice(i, 1);
      }

      if (zoneAlpha > 0.02) {
        this.prismZoneRing.position.set(zoneX, zoneY + 0.04, zoneZ);
        this.prismZoneRing.rotation.z = t * 1.8;
        this._colW.setHSL((t * 0.65) % 1.0, 0.95, 0.58);
        this.prismZoneRing.material.color.copy(this._colW);
        this.prismZoneRing.material.opacity = zoneAlpha * 0.72;
        this.prismZoneRing.visible = true;
        this.prismZoneInner.position.set(zoneX, zoneY + 0.045, zoneZ);
        this.prismZoneInner.rotation.z = -t * 2.6;
        this._colW.setHSL((t * 0.65 + 0.38) % 1.0, 0.95, 0.60);
        this.prismZoneInner.material.color.copy(this._colW);
        this.prismZoneInner.material.opacity = zoneAlpha * 0.62;
        this.prismZoneInner.visible = true;
      } else {
        this.prismZoneRing.visible = false;
        this.prismZoneInner.visible = false;
      }

      // 3. Relámpagos en la cuerda + esfera en punta de flecha mientras se tensa el arco
      const isBowCharging = Boolean(active && active.prof.mode === 'bow' && frame && frame.bow && (active.elapsed / active.duration) < (active.prof.releaseU || 0.6));
      if (isBowCharging) {
        const bow = frame.bow;
        const u = clamp(active.elapsed / active.duration, 0, 1);
        const charge = clamp(u / Math.max(0.2, active.prof.releaseU || 0.52), 0.15, 1.15);
        const bPos = this.bowBolts.geometry.attributes.position;
        const bCol = this.bowBolts.geometry.attributes.color;
        let qCur = 0;
        for (let bi = 0; bi < BOW_BOLT_COUNT; bi++) {
          const sW = bi < 4 ? bow.tUp : (bi < 8 ? bow.nock : (bi === 8 ? bow.tUp : bow.tLo));
          const eW = bi < 4 ? bow.nock : (bi < 8 ? bow.tLo : bow.tip);
          for (let s = 0; s <= BOW_BOLT_SEGS; s++) {
            const f = s / BOW_BOLT_SEGS;
            const pt = this._boltPts[s].copy(sW).lerp(eW, f);
            const env = Math.sin(f * Math.PI);
            const amp = 0.055 * charge * env;
            pt.x += (hashN(this.seed * 41.7 + bi * 23.1 + s * 9.3) - 0.5) * 2 * amp;
            pt.y += (hashN(this.seed * 67.3 + bi * 13.7 + s * 17.1) - 0.5) * 2 * amp;
            pt.z += (hashN(this.seed * 29.1 + bi * 37.9 + s * 5.7) - 0.5) * 2 * amp;
          }
          const ow = 0.014 * (0.6 + 0.5 * charge);
          for (let s = 0; s < BOW_BOLT_SEGS; s++) {
            this._getColor(this._colW, active, (s + 0.5) / BOW_BOLT_SEGS, bi);
            qCur = writeQuad(bPos, bCol, qCur, this._boltPts[s], this._boltPts[s + 1], ow, this._colW.r, this._colW.g, this._colW.b, camPos, this._vC, this._dir, this._camDir, this._side);
            qCur = writeQuad(bPos, bCol, qCur, this._boltPts[s], this._boltPts[s + 1], ow * 0.36, 1, 0.98, 1, camPos, this._vC, this._dir, this._camDir, this._side);
          }
        }
        this.bowBolts.geometry.setDrawRange(0, qCur * 6);
        bPos.needsUpdate = true; bCol.needsUpdate = true;
        this.bowBolts.visible = true;
        this._updateTipChargeSphere(bow.tip, charge, active, 0.85, 1.0 + 0.14 * Math.sin(t * 28), t);
      } else {
        this.bowBolts.visible = false;
        if (active && active.prof.mode === 'bow') {
          this.chargeGroup.visible = false;
          this.chargeStreams.visible = false;
        }
      }

      // 4. Flechas en vuelo + estelas + impactos
      for (let i = this.arrows.length - 1; i >= 0; i--) {
        const f = this.arrows[i];
        if (f.stuckTimer > 0) {
          f.stuckTimer -= dt;
          if (f.stuckTimer <= 0) {
            this.group.remove(f.group);
            f.mats.forEach(m => m.dispose());
            this.arrows.splice(i, 1);
          }
          continue;
        }
        f.vel.y -= f.gravity * dt;
        f.group.position.addScaledVector(f.vel, dt);
        if (f.vel.lengthSq() > 1e-4) {
          this._dir.copy(f.vel).normalize();
          f.group.quaternion.setFromUnitVectors(this._fwd, this._dir);
        }
        f.age += dt;
        f.trailT -= dt;
        if (f.trailT <= 0) {
          f.trailT = 0.018;
          let tc = f.trailColor;
          if (f.prismCycle) { this._colW.setHSL((f.age * 2.2) % 1.0, 0.96, 0.60); tc = this._colW.getHex(); }
          this._spawnArrowTrail(f.group.position, tc, f.trailScale);
        }
        const gY = f.getGroundY ? f.getGroundY(f.group.position.x, f.group.position.z) : f.floorY;
        const hitTarget = f.targetDistSq && f.group.position.distanceToSquared(f.originPos) >= f.targetDistSq;
        const hitFloor = f.group.position.y <= gY + 0.08 && f.vel.y < 0;
        if (hitFloor || hitTarget || f.age >= f.maxAge) {
          if (f.stickOnGround && hitFloor) {
            f.group.position.y = gY + 0.08;
            f.stuckTimer = 0.85;
            this.spawnImpact(new this.THREE.Vector3(f.group.position.x, gY, f.group.position.z), 'bw_prism');
            continue;
          }
          if (hitTarget || hitFloor) this.spawnSparks(f.group.position, 8, 3.0, f.trailColor, 1.4);
          this.group.remove(f.group);
          f.mats.forEach(m => m.dispose());
          this.arrows.splice(i, 1);
        }
      }

      for (let i = this.trails.length - 1; i >= 0; i--) {
        const tr = this.trails[i];
        tr.life -= dt;
        if (tr.life <= 0) { this.group.remove(tr.mesh); tr.mesh.material.dispose(); this.trails.splice(i, 1); continue; }
        const k = tr.life / tr.maxLife;
        tr.mesh.scale.setScalar((0.35 + 0.65 * k) * tr.baseScale);
        tr.mesh.material.opacity = 0.85 * k;
      }

      for (let i = 0; i < this.ripples.length; i++) {
        const r = this.ripples[i];
        if (r.life > 0) {
          r.life -= dt;
          if (r.life <= 0) r.mesh.visible = false;
          else {
            const k = 1 - r.life / r.maxLife;
            r.mesh.scale.setScalar(0.45 + Math.pow(k, 0.7) * 3.2);
            r.mesh.material.opacity = (1 - k) * 0.82;
          }
        }
      }
    }

    _updateWaves(dt) {
      for (let i = this.waves.length - 1; i >= 0; i--) {
        const w = this.waves[i];
        w.life -= dt;
        if (w.life <= 0) {
          this.spawnSparks(w.group.position, 10, 3.6, w.colorHex, 1.5);
          this.group.remove(w.group);
          w.mats.forEach(m => m.dispose());
          this.waves.splice(i, 1);
          continue;
        }
        w.group.position.addScaledVector(w.vel, dt);
        const k = 1 - (w.life / w.maxLife);
        w.group.scale.setScalar(w.baseScale * (0.82 + k * 0.95));
        const fade = Math.sin(Math.min(1, 1 - k) * Math.PI * 0.5);
        w.mats[0].opacity = fade * 0.82;
        w.mats[1].opacity = fade * 0.88;
        w.sparkCD -= dt;
        if (w.sparkCD <= 0) {
          w.sparkCD = 0.032;
          this.spawnSparks(w.group.position, 2, 2.2, Math.random() < 0.5 ? w.colorHex : w.secHex, 0.7);
        }
      }
    }

    _updateMeteors(dt) {
      for (let i = this.meteors.length - 1; i >= 0; i--) {
        const m = this.meteors[i];
        m.t += dt;
        const k = clamp(m.t / m.dur, 0, 1);
        m.group.position.lerpVectors(m.start, m.land, k * k);
        if (Math.random() < dt * 32) this.spawnSparks(m.group.position, 2, 2.0, m.colorHex, 0.8);
        if (k >= 1) {
          this.spawnSparks(m.land, 16, 4.8, m.colorHex, 2.4);
          this.spawnSparks(m.land, 10, 3.8, m.secHex, 2.8);
          this.group.remove(m.group);
          m.mats.forEach(mt => mt.dispose());
          this.meteors.splice(i, 1);
        }
      }
    }

    _updateSparks(dt, floorY) {
      let activeSparks = 0;
      const pos = this.sparks.geometry.attributes.position;
      const col = this.sparks.geometry.attributes.color;
      for (let i = 0; i < SPARK_COUNT; i++) {
        const s = this.sparkData[i];
        if (s.life > 0) {
          s.life -= dt;
          s.vy -= 7.8 * dt;
          s.vx *= (1 - 1.6 * dt);
          s.vz *= (1 - 1.6 * dt);
          s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt;
          if (s.y < floorY) { s.y = floorY; s.vy = Math.abs(s.vy) * 0.35; }
          const f = Math.max(0, s.life / s.maxLife);
          pos.setXYZ(i, s.x, s.y, s.z);
          col.setXYZ(i, s.r * f, s.g * f, s.b * f);
          activeSparks++;
        } else {
          pos.setXYZ(i, 0, -99, 0);
          col.setXYZ(i, 0, 0, 0);
        }
      }
      if (activeSparks > 0) { pos.needsUpdate = true; col.needsUpdate = true; this.sparks.visible = true; }
      else this.sparks.visible = false;
    }

    _fadeIdleVisuals(dt) {
      this.bodyBolts.visible = false;
      this.bladeBolts.visible = false;
      this.bowBolts.visible = false;
      this.energyRibbons.visible = false;
      this.bodyParticles.visible = false;
      this.bladeSheath.visible = false;
      this.chargeGroup.visible = false;
      this.chargeStreams.visible = false;
      this.trail.visible = false;
      this.trailCore.visible = false;
      this.history.length = 0;
      this.energyLight.intensity = 0;
      this.bladeLight.intensity = 0;
      const fadeList = [
        this.auraFloorRing, this.auraFloorRing2, this.ring, this.ring2,
        this.groundGlow, this.novaDome, this.beamMesh, this.beamCoreMesh,
        this.skyPillarMesh, this.skyPillarCore, this.arcaneHalo, ...this.pierceRings
      ];
      fadeList.forEach(m => {
        if (m && m.visible) {
          m.material.opacity *= Math.pow(0.08, dt * 3.0);
          if (m.material.opacity < 0.02) { m.material.opacity = 0; m.visible = false; }
        }
      });
    }

    getDebugState() {
      return {
        activeSkill: this.active ? this.active.skillId : null,
        bodyBoltsVisible: !!this.bodyBolts.visible,
        bladeBoltsVisible: !!this.bladeBolts.visible,
        bowBoltsVisible: !!this.bowBolts.visible,
        activeWaves: this.waves.length,
        activeArrows: this.arrows.length,
        activeMeteors: this.meteors.length,
        activeRainWaves: this.rainWaves.length,
        beamVisible: !!this.beamMesh.visible,
        skyPillarVisible: !!this.skyPillarMesh.visible,
        hasWeaponMarkers: !!(this.markers.WeaponBase && this.markers.WeaponTip),
        hasBowMarkers: !!(this.markers.BowTop && this.markers.BowBot && this.markers.BowNock),
        boneCount: Object.keys(this.bones).length
      };
    }
  }

  const api = { BODY_ENERGY_PRESETS, SKILL_VFX_PROFILES, BODY_CIRCUITS, WEAPON_SURGE_CIRCUITS, Manager };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.StudioCombatVFX = api;
})(typeof window !== 'undefined' ? window : globalThis);
