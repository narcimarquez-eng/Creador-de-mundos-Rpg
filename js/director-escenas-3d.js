/*
 * director-escenas-3d.js — Director de cinemáticas 3D actuadas en tiempo real dentro de Three.js.
 *
 * Coloca al héroe real (con su armadura, arma y rostro), al compañero, al Herrero Brann / Sabio
 * y a criaturas 3D articuladas en una puesta en escena con múltiples cortes de cámara,
 * animaciones de combate, VFX, audio, voz en español, subtítulos y grabación opcional a .webm.
 * Expone window.DirectorEscenas3D (o module.exports en Node para las pruebas).
 */
(function (root) {
  'use strict';

  const clamp = (v, a, b) => Math.max(a, Math.min(b, Number.isFinite(v) ? v : a));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (t) => {
    const u = clamp(t, 0, 1);
    return u * u * (3 - 2 * u);
  };

  function planosEstandar(dur, focoAccion = 'enemigo') {
    const d = Math.max(10, dur || 12);
    const t1 = +(d * 0.24).toFixed(2);
    const t2 = +(d * 0.56).toFixed(2);
    const t3 = +(d * 0.80).toFixed(2);
    return [
      { t0: 0,  t1, tipo: 'establecimiento', foco: 'centro', offset0: [-8.5, 4.4, 9.2], offset1: [-5.8, 3.2, 7.0], fov0: 46, fov1: 44 },
      { t0: t1, t1: t2, tipo: 'npc',         foco: 'npc',    offset0: [2.8, 2.1, 4.2],  offset1: [1.6, 1.9, 3.3],  fov0: 40, fov1: 38 },
      { t0: t2, t1: t3, tipo: 'accion',      foco: focoAccion, offset0: [-4.6, 2.2, 4.8], offset1: [3.8, 2.4, 4.6], fov0: 48, fov1: 45 },
      { t0: t3, t1: d,  tipo: 'heroico',     foco: 'heroe',  offset0: [3.6, 2.0, 5.2],  offset1: [-2.4, 2.6, 6.2], fov0: 42, fov1: 45 }
    ];
  }

  function g(id, num, cfg) {
    const dur = cfg.duracionSeg || 12;
    return Object.assign({
      id,
      numero: num,
      duracionSeg: dur,
      hora: cfg.hora || null,
      npcRol: cfg.npcRol || 'guru-1',
      escenografia: cfg.escenografia || 'pradera',
      acentoHex: cfg.acentoHex || 0xfacc15,
      enemigos: cfg.enemigos || [],
      accionesHeroe: cfg.accionesHeroe || [
        { t: 0.4, tipo: 'mirar_npc' },
        { t: +(dur * 0.48).toFixed(2), tipo: 'mirar_enemigo' },
        { t: +(dur * 0.54).toFixed(2), tipo: 'atacar' }
      ],
      accionesCompanero: cfg.accionesCompanero || [
        { t: 0.6, tipo: 'acercar' },
        { t: +(dur * 0.56).toFixed(2), tipo: 'atacar' },
        { t: +(dur * 0.82).toFixed(2), tipo: 'celebrar' }
      ],
      eventosVfx: cfg.eventosVfx || [],
      planos: cfg.planos || planosEstandar(dur, (cfg.enemigos && cfg.enemigos.length) ? 'enemigo' : 'prop')
    }, cfg.overrides || {});
  }

  const GUIONES_LISTA = [
    g('prologo', 0, {
      duracionSeg: 15,
      hora: 'night',
      npcRol: 'herrero',
      escenografia: 'forja',
      acentoHex: 0xf97316,
      enemigos: [
        { arquetipo: 'lobo', glbKey: 'phantom_armored_boar', nombre: 'Aberración de Hierro', escala: 1.15, posInicio: [-6.5, -7.2], posObjetivo: [-1.4, -1.5], tEntrada: 3.4, tCaida: 9.8 },
        { arquetipo: 'esqueleto', glbKey: 'ashen_crown_executioner_skeleton', nombre: 'Acechador Blindado', escala: 1.12, posInicio: [5.8, -7.8], posObjetivo: [1.5, -1.8], tEntrada: 3.9, tCaida: 10.6 }
      ],
      accionesHeroe: [
        { t: 0.2, tipo: 'mirar_npc' },
        { t: 3.6, tipo: 'mirar_enemigo' },
        { t: 6.2, tipo: 'caminar', dx: -0.4, dz: -0.6 },
        { t: 7.4, tipo: 'atacar' },
        { t: 10.9, tipo: 'mirar_npc' }
      ],
      accionesCompanero: [
        { t: 0.4, tipo: 'cubrir' },
        { t: 4.2, tipo: 'cargar' },
        { t: 7.8, tipo: 'atacar' },
        { t: 11.4, tipo: 'acercar' }
      ],
      eventosVfx: [
        { t: 1.0, tipo: 'chispas_forja', color: 0xf97316 },
        { t: 3.6, tipo: 'ruido_enemigo', evento: 'aggro', info: { name: 'Bestia de Hierro', boss: true } },
        { t: 7.5, tipo: 'esfuerzo', intenso: true },
        { t: 8.2, tipo: 'destello', color: 0xf97316, radio: 1.6 },
        { t: 9.8, tipo: 'sacudida', int: 0.24, dur: 0.22 },
        { t: 11.6, tipo: 'destello', color: 0xfacc15, radio: 1.1 }
      ]
    }),
    g('c1', 1, {
      duracionSeg: 13,
      npcRol: 'herrero',
      escenografia: 'forja',
      acentoHex: 0xfbbf24,
      enemigos: [
        { arquetipo: 'lobo', glbKey: 'dire_wolf', nombre: 'Bestia Alterada', escala: 1.15, posInicio: [-5.5, -6.5], posObjetivo: [-0.8, -2.0], tEntrada: 3.8, tCaida: 9.8 }
      ],
      accionesHeroe: [
        { t: 0.2, tipo: 'mirar_npc' },
        { t: 4.0, tipo: 'mirar_enemigo' },
        { t: 7.0, tipo: 'atacar' }
      ],
      eventosVfx: [
        { t: 4.1, tipo: 'ruido_enemigo', evento: 'aggro', info: { name: 'Lobo Blindado' } },
        { t: 7.2, tipo: 'esfuerzo', intenso: false },
        { t: 8.6, tipo: 'destello', color: 0xfbbf24, radio: 1.3 }
      ]
    }),
    g('c2', 2, {
      duracionSeg: 12,
      npcRol: 'guru-2',
      escenografia: 'acantilado',
      acentoHex: 0xf87171,
      enemigos: [
        { arquetipo: 'saqueador', glbKey: 'outlaw_bandit_cutthroat', nombre: 'Centinela del Cónclave', escala: 1.10, posInicio: [5.5, -6.8], posObjetivo: [0.6, -2.1], tEntrada: 3.6, tCaida: 9.2 }
      ],
      eventosVfx: [
        { t: 3.9, tipo: 'ruido_enemigo', evento: 'aggro', info: { name: 'Saqueador' } },
        { t: 6.7, tipo: 'esfuerzo', intenso: false },
        { t: 8.0, tipo: 'destello', color: 0xf87171, radio: 1.2 }
      ]
    }),
    g('c3', 3, {
      duracionSeg: 12,
      hora: 'night',
      npcRol: 'guru-3',
      escenografia: 'bosque',
      acentoHex: 0x94a3b8,
      enemigos: [
        { arquetipo: 'jabali', glbKey: 'df_14_iron_spined_boar_beast', nombre: 'Aberración de Savia', escala: 1.15, posInicio: [-5.4, -6.0], posObjetivo: [-1.1, -1.8], tEntrada: 3.2, tCaida: 8.8 },
        { arquetipo: 'lobo', glbKey: 'dire_wolf', nombre: 'Rastreador Gris', escala: 1.05, posInicio: [5.4, -6.0], posObjetivo: [1.3, -1.9], tEntrada: 3.7, tCaida: 9.4 }
      ],
      eventosVfx: [
        { t: 3.5, tipo: 'ruido_enemigo', evento: 'aggro', info: { name: 'Bestia del Claro' } },
        { t: 6.6, tipo: 'esfuerzo', intenso: true },
        { t: 8.4, tipo: 'onda', color: 0x94a3b8, radio: 4.5 }
      ]
    }),
    g('c4', 4, {
      duracionSeg: 13,
      npcRol: 'guru-4',
      escenografia: 'laberinto',
      acentoHex: 0xfb923c,
      enemigos: [
        { arquetipo: 'minotauro', glbKey: 'obsidian_golem', nombre: 'Autómata Acorazado', escala: 1.45, boss: true, posInicio: [0, -7.8], posObjetivo: [0, -2.5], tEntrada: 3.2, tCaida: 10.2 }
      ],
      accionesHeroe: [
        { t: 0.2, tipo: 'mirar_npc' },
        { t: 3.6, tipo: 'mirar_enemigo' },
        { t: 7.4, tipo: 'skill', skill: 'sismo' }
      ],
      eventosVfx: [
        { t: 3.5, tipo: 'ruido_enemigo', evento: 'aggro', info: { name: 'Autómata', boss: true } },
        { t: 7.5, tipo: 'esfuerzo', intenso: true },
        { t: 8.5, tipo: 'onda', color: 0xf97316, radio: 6.5 },
        { t: 8.6, tipo: 'sacudida', int: 0.28, dur: 0.28 }
      ]
    }),
    g('c5', 5, {
      duracionSeg: 12,
      hora: 'night',
      npcRol: 'guru-5',
      escenografia: 'marisma',
      acentoHex: 0x60a5fa,
      enemigos: [
        { arquetipo: 'espectro', glbKey: 'wraith_soul_reaper', nombre: 'Susurro del Óxido', escala: 1.20, posInicio: [-4.2, -7.2], posObjetivo: [0.0, -2.2], tEntrada: 3.5, tCaida: 9.2 }
      ],
      eventosVfx: [
        { t: 3.8, tipo: 'ruido_enemigo', evento: 'aggro', info: { name: 'Espectro' } },
        { t: 6.8, tipo: 'esfuerzo', intenso: true },
        { t: 8.2, tipo: 'destello', color: 0x60a5fa, radio: 1.8 }
      ]
    }),
    g('c6', 6, {
      duracionSeg: 12,
      npcRol: 'guru-1',
      escenografia: 'fuente',
      acentoHex: 0x38bdf8,
      enemigos: [],
      accionesHeroe: [
        { t: 0.2, tipo: 'mirar_npc' },
        { t: 4.5, tipo: 'caminar', dx: 0.0, dz: -1.4 },
        { t: 7.5, tipo: 'celebrar' }
      ],
      eventosVfx: [
        { t: 5.5, tipo: 'pilar_luz', color: 0x38bdf8 },
        { t: 7.6, tipo: 'onda', color: 0x38bdf8, radio: 5.2 },
        { t: 7.7, tipo: 'destello', color: 0xfde047, radio: 1.8 }
      ]
    }),
    g('c7', 7, {
      duracionSeg: 12,
      npcRol: 'guru-2',
      escenografia: 'canon',
      acentoHex: 0xf97316,
      enemigos: [
        { arquetipo: 'caballero', glbKey: 'abyssal_knight', nombre: 'Vanguardia del Óxido', escala: 1.20, posInicio: [4.8, -6.8], posObjetivo: [0.3, -2.1], tEntrada: 3.3, tCaida: 9.1 }
      ],
      eventosVfx: [
        { t: 1.4, tipo: 'chispas_forja', color: 0xf97316 },
        { t: 3.6, tipo: 'ruido_enemigo', evento: 'aggro', info: { name: 'Caballero' } },
        { t: 6.7, tipo: 'esfuerzo', intenso: true },
        { t: 8.1, tipo: 'destello', color: 0xfbbf24, radio: 1.7 }
      ]
    }),
    g('c8', 8, {
      duracionSeg: 12,
      npcRol: 'guru-3',
      escenografia: 'nova',
      acentoHex: 0xfacc15,
      enemigos: [
        { arquetipo: 'saqueador', glbKey: 'wow_defias_pillager_bandit', nombre: 'Inquisidor Blindado', escala: 1.12, posInicio: [-4.6, -6.2], posObjetivo: [-1.2, -2.0], tEntrada: 3.0, tCaida: 8.8 },
        { arquetipo: 'esqueleto', glbKey: 'cursed_skeleton_berserker', nombre: 'Guardia Rúnico', escala: 1.12, posInicio: [4.6, -6.2], posObjetivo: [1.2, -2.0], tEntrada: 3.3, tCaida: 8.9 }
      ],
      accionesHeroe: [
        { t: 0.2, tipo: 'mirar_npc' },
        { t: 3.8, tipo: 'mirar_enemigo' },
        { t: 7.2, tipo: 'skill', skill: 'nova' }
      ],
      eventosVfx: [
        { t: 3.4, tipo: 'ruido_enemigo', evento: 'aggro', info: { name: 'Guardia' } },
        { t: 7.3, tipo: 'esfuerzo', intenso: true },
        { t: 8.2, tipo: 'onda', color: 0xfacc15, radio: 8.0 },
        { t: 8.3, tipo: 'sacudida', int: 0.30, dur: 0.26 }
      ]
    }),
    g('c9', 9, {
      duracionSeg: 12,
      hora: 'night',
      npcRol: 'guru-4',
      escenografia: 'cabana',
      acentoHex: 0xf59e0b,
      enemigos: [
        { arquetipo: 'saqueador', glbKey: 'outlaw_bandit_cutthroat', nombre: 'Inquisidor Nocturno', escala: 1.12, posInicio: [-6.0, -7.2], posObjetivo: [-0.8, -2.4], tEntrada: 4.2, tCaida: 9.5 }
      ],
      eventosVfx: [
        { t: 4.4, tipo: 'ruido_enemigo', evento: 'aggro', info: { name: 'Inquisidor' } },
        { t: 7.0, tipo: 'esfuerzo', intenso: false },
        { t: 8.4, tipo: 'destello', color: 0xf59e0b, radio: 1.4 }
      ]
    }),
    g('c10', 10, {
      duracionSeg: 12,
      npcRol: 'guru-1',
      escenografia: 'acantilado',
      acentoHex: 0xfb7185,
      enemigos: [
        { arquetipo: 'jabali', glbKey: 'iron_boar_juggernaut', nombre: 'Bestia de Choque', escala: 1.22, posInicio: [-4.8, -7.0], posObjetivo: [-1.0, -2.0], tEntrada: 3.0, tCaida: 9.0 },
        { arquetipo: 'jabali', glbKey: 'elite_ironhorn_rhino_beast', nombre: 'Acorazado del Paso', escala: 1.20, posInicio: [4.8, -7.0], posObjetivo: [1.1, -2.1], tEntrada: 3.4, tCaida: 9.4 }
      ],
      eventosVfx: [
        { t: 3.2, tipo: 'ruido_enemigo', evento: 'aggro', info: { name: 'Bestia' } },
        { t: 6.7, tipo: 'esfuerzo', intenso: true },
        { t: 8.3, tipo: 'onda', color: 0xfb7185, radio: 5.0 }
      ]
    }),
    g('c11', 11, {
      duracionSeg: 13,
      hora: 'night',
      npcRol: 'guru-2',
      escenografia: 'altar',
      acentoHex: 0x60a5fa,
      enemigos: [],
      accionesHeroe: [
        { t: 0.2, tipo: 'mirar_npc' },
        { t: 5.2, tipo: 'caminar', dx: 0.0, dz: -1.6 },
        { t: 8.2, tipo: 'celebrar' }
      ],
      eventosVfx: [
        { t: 6.8, tipo: 'pilar_luz', color: 0x60a5fa },
        { t: 7.2, tipo: 'onda', color: 0x93c5fd, radio: 7.2 },
        { t: 7.4, tipo: 'sacudida', int: 0.20, dur: 0.22 }
      ]
    }),
    g('c12', 12, {
      duracionSeg: 12,
      hora: 'night',
      npcRol: 'guru-3',
      escenografia: 'cupula',
      acentoHex: 0xc084fc,
      enemigos: [
        { arquetipo: 'caballero', glbKey: 'death_knight_colossus', nombre: 'Guardián de Resonancia', escala: 1.32, boss: true, posInicio: [0, -6.8], posObjetivo: [0, -2.4], tEntrada: 3.0, tCaida: 9.3 }
      ],
      eventosVfx: [
        { t: 3.3, tipo: 'ruido_enemigo', evento: 'aggro', info: { name: 'Guardián', boss: true } },
        { t: 6.8, tipo: 'esfuerzo', intenso: true },
        { t: 8.2, tipo: 'onda', color: 0xc084fc, radio: 6.8 },
        { t: 8.3, tipo: 'destello', color: 0xe879f9, radio: 2.2 }
      ]
    }),
    g('c13', 13, {
      duracionSeg: 13,
      npcRol: 'guru-1',
      escenografia: 'santuario',
      acentoHex: 0xfde047,
      enemigos: [],
      accionesHeroe: [
        { t: 0.2, tipo: 'mirar_npc' },
        { t: 5.0, tipo: 'caminar', dx: 0.0, dz: -1.5 },
        { t: 9.0, tipo: 'celebrar' }
      ],
      eventosVfx: [
        { t: 6.2, tipo: 'pilar_luz', color: 0xfde047 },
        { t: 8.0, tipo: 'onda', color: 0xfef08a, radio: 6.5 }
      ]
    }),
    g('c14', 14, {
      duracionSeg: 14,
      hora: 'night',
      npcRol: 'guru-4',
      escenografia: 'titan',
      acentoHex: 0xef4444,
      enemigos: [
        { arquetipo: 'titan', glbKey: 'abyssal_crown_ossuary_titan', nombre: 'Titán del Sol Quebrado', escala: 1.85, boss: true, posInicio: [0, -9.2], posObjetivo: [0, -3.4], tEntrada: 2.8, tCaida: 11.0 }
      ],
      accionesHeroe: [
        { t: 0.2, tipo: 'mirar_npc' },
        { t: 3.2, tipo: 'mirar_enemigo' },
        { t: 7.4, tipo: 'caminar', dx: 0, dz: -1.1 },
        { t: 8.4, tipo: 'atacar' },
        { t: 11.4, tipo: 'celebrar' }
      ],
      accionesCompanero: [
        { t: 0.4, tipo: 'cubrir' },
        { t: 6.6, tipo: 'cargar' },
        { t: 8.0, tipo: 'atacar' },
        { t: 11.5, tipo: 'celebrar' }
      ],
      eventosVfx: [
        { t: 3.0, tipo: 'ruido_enemigo', evento: 'aggro', info: { name: 'Titán Coloso', boss: true } },
        { t: 3.1, tipo: 'sacudida', int: 0.30, dur: 0.25 },
        { t: 8.5, tipo: 'esfuerzo', intenso: true },
        { t: 9.6, tipo: 'onda', color: 0xef4444, radio: 7.8 },
        { t: 10.9, tipo: 'ruido_enemigo', evento: 'muerte', info: { name: 'Titán Coloso', boss: true } },
        { t: 11.0, tipo: 'sacudida', int: 0.38, dur: 0.35 }
      ]
    }),
    g('c15', 15, {
      duracionSeg: 13,
      hora: 'day',
      npcRol: 'guru-3',
      escenografia: 'fuente_pura',
      acentoHex: 0xfcd34d,
      enemigos: [],
      accionesHeroe: [
        { t: 0.2, tipo: 'mirar_npc' },
        { t: 5.5, tipo: 'caminar', dx: 0.0, dz: -1.3 },
        { t: 9.2, tipo: 'celebrar' }
      ],
      eventosVfx: [
        { t: 6.4, tipo: 'pilar_luz', color: 0xfef08a },
        { t: 7.6, tipo: 'onda', color: 0x38bdf8, radio: 5.8 }
      ]
    }),
    g('c16', 16, {
      duracionSeg: 14,
      hora: 'day',
      npcRol: 'guru-5',
      escenografia: 'plaza',
      acentoHex: 0xfde047,
      enemigos: [],
      accionesHeroe: [
        { t: 0.2, tipo: 'mirar_npc' },
        { t: 5.0, tipo: 'caminar', dx: 0.0, dz: -1.2 },
        { t: 8.6, tipo: 'celebrar' }
      ],
      accionesCompanero: [
        { t: 0.5, tipo: 'acercar' },
        { t: 8.8, tipo: 'celebrar' }
      ],
      eventosVfx: [
        { t: 7.0, tipo: 'pilar_luz', color: 0xfde047 },
        { t: 8.8, tipo: 'onda', color: 0xfacc15, radio: 6.5 },
        { t: 9.2, tipo: 'destello', color: 0xfde047, radio: 2.0 }
      ]
    })
  ];

  const GUIONES_3D = Object.create(null);
  GUIONES_LISTA.forEach(item => { GUIONES_3D[item.id] = item; });

  function normalizarClave(clave) {
    if (clave === 0 || clave === '0') return 'prologo';
    if (typeof clave === 'number' && Number.isFinite(clave)) return 'c' + Math.round(clave);
    const s = String(clave == null ? '' : clave).trim().toLowerCase();
    if (!s || s === 'prologo' || s === 'prólogo') return 'prologo';
    if (/^\d+$/.test(s)) return s === '0' ? 'prologo' : 'c' + parseInt(s, 10);
    if (/^cap_?0*(\d+)$/.test(s)) return 'c' + parseInt(RegExp.$1, 10);
    return s;
  }

  function obtenerGuion(clave) {
    const id = normalizarClave(clave);
    const gObj = GUIONES_3D[id] || null;
    return gObj ? JSON.parse(JSON.stringify(gObj)) : null;
  }

  function listarGuiones() {
    return GUIONES_LISTA.map(item => obtenerGuion(item.id));
  }

  function leerPunto(p, def) {
    if (!p) return def;
    if (Array.isArray(p)) return [p[0] || 0, p[1] || 0, p[2] || 0];
    return [p.x || 0, p.y || 0, p.z || 0];
  }

  function evaluarPlanoCamara(guion, t, focos = {}) {
    const planos = (guion && Array.isArray(guion.planos) && guion.planos.length) ? guion.planos : planosEstandar(12);
    let plano = planos[planos.length - 1];
    for (let i = 0; i < planos.length; i++) {
      if (t <= planos[i].t1 || i === planos.length - 1) {
        plano = planos[i];
        break;
      }
    }
    const u = smoothstep((t - plano.t0) / Math.max(0.01, plano.t1 - plano.t0));
    const focoPt = leerPunto(focos[plano.foco] || focos.centro, [0, 1.3, 0]);
    const o0 = plano.offset0 || [0, 3, 7];
    const o1 = plano.offset1 || o0;
    const px = focoPt[0] + lerp(o0[0], o1[0], u);
    const py = focoPt[1] + lerp(o0[1], o1[1], u);
    const pz = focoPt[2] + lerp(o0[2], o1[2], u);
    const fov = lerp(plano.fov0 || 45, plano.fov1 || 45, u);
    return {
      tipo: plano.tipo || 'establecimiento',
      pos: [px, py, pz],
      lookAt: [focoPt[0], focoPt[1], focoPt[2]],
      fov
    };
  }

  // ------------------ Utilerías 3D para escenografía y actores ------------------
  // Silueta espectral de último recurso (sin cubos) si fallan tanto EnemyGlb como EnemyLib
  function construirActorEnemigoRespaldo(THREE, def) {
    const gMesh = new THREE.Group();
    const esc = def.escala || 1.2;
    const matManto = new THREE.MeshStandardMaterial({
      color: def.boss ? 0x1c1917 : 0x0f172a,
      roughness: 0.72,
      metalness: 0.25,
      transparent: true,
      opacity: 0.92
    });
    const matAura = new THREE.MeshBasicMaterial({
      color: def.boss ? 0xf97316 : 0xef4444,
      transparent: true,
      opacity: 0.48
    });
    const matOjo = new THREE.MeshBasicMaterial({ color: def.boss ? 0xfb923c : 0xf87171 });

    const manto = new THREE.Mesh(new THREE.ConeGeometry(0.62 * esc, 2.05 * esc, 16), matManto);
    manto.position.y = 1.02 * esc;
    gMesh.add(manto);

    const capucha = new THREE.Mesh(new THREE.SphereGeometry(0.32 * esc, 14, 12), matManto);
    capucha.position.set(0, 2.04 * esc, 0.04 * esc);
    gMesh.add(capucha);

    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.55 * esc, 0.045 * esc, 8, 24), matAura);
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 0.06;
    gMesh.add(halo);

    [-0.10, 0.10].forEach(ox => {
      const ojo = new THREE.Mesh(new THREE.SphereGeometry(0.05 * esc, 8, 8), matOjo);
      ojo.position.set(ox * esc, 2.06 * esc, 0.29 * esc);
      gMesh.add(ojo);
    });
    return gMesh;
  }

  function construirEscenografia(THREE, guion, getGroundY, ax, az) {
    const grupo = new THREE.Group();
    const gy = (dx, dz) => getGroundY(ax + dx, az + dz);
    const acento = guion.acentoHex || 0xfacc15;
    const tipo = guion.escenografia;

    const animables = { anillos: [], cristales: [], luces: [], chispas: null };

    // Luz dramática de escena sobre el escenario
    const luzPpal = new THREE.PointLight(acento, 3.2, 22, 1.5);
    luzPpal.position.set(ax, gy(0, -1.8) + 2.6, az - 1.8);
    grupo.add(luzPpal);
    animables.luces.push({ luz: luzPpal, base: 3.2, amp: 0.7 });

    const propX = ax;
    const propZ = az - 2.6;
    const propY = gy(0, -2.6);

    if (tipo === 'forja' || tipo === 'canon') {
      const yunqueBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.72, 0.55, 10),
        new THREE.MeshStandardMaterial({ color: 0x44403c, roughness: 0.85 })
      );
      yunqueBase.position.set(propX + 1.8, gy(1.8, -1.2) + 0.27, az - 1.2);
      grupo.add(yunqueBase);
      const yunqueTop = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.32, 0.44),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.35 })
      );
      yunqueTop.position.set(propX + 1.8, gy(1.8, -1.2) + 0.68, az - 1.2);
      grupo.add(yunqueTop);

      const brasero = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.45, 0.35, 12),
        new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 1.8 })
      );
      brasero.position.set(propX - 1.7, gy(-1.7, -1.5) + 0.2, az - 1.5);
      grupo.add(brasero);
    } else if (tipo === 'fuente' || tipo === 'fuente_pura' || tipo === 'nova' || tipo === 'altar' || tipo === 'cupula' || tipo === 'santuario') {
      const anillo = new THREE.Mesh(
        new THREE.TorusGeometry(2.1, 0.12, 10, 40),
        new THREE.MeshBasicMaterial({ color: acento, transparent: true, opacity: 0.85 })
      );
      anillo.rotation.x = Math.PI / 2;
      anillo.position.set(propX, propY + 0.14, propZ);
      grupo.add(anillo);
      animables.anillos.push(anillo);

      const aguaDisco = new THREE.Mesh(
        new THREE.CircleGeometry(2.0, 28),
        new THREE.MeshBasicMaterial({ color: acento, transparent: true, opacity: 0.28, side: THREE.DoubleSide })
      );
      aguaDisco.rotation.x = -Math.PI / 2;
      aguaDisco.position.set(propX, propY + 0.08, propZ);
      grupo.add(aguaDisco);

      if (tipo === 'altar' || tipo === 'santuario') {
        for (let k = 0; k < 4; k++) {
          const ang = (k / 4) * Math.PI * 2 + 0.4;
          const px = propX + Math.cos(ang) * 2.5;
          const pz = propZ + Math.sin(ang) * 2.5;
          const py = getGroundY(px, pz);
          const pilar = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, 2.8, 0.45),
            new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8, emissive: acento, emissiveIntensity: 0.25 })
          );
          pilar.position.set(px, py + 1.4, pz);
          grupo.add(pilar);
        }
        const cristal = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.55, 0),
          new THREE.MeshStandardMaterial({ color: acento, emissive: acento, emissiveIntensity: 1.5, roughness: 0.2 })
        );
        cristal.position.set(propX, propY + 2.2, propZ);
        grupo.add(cristal);
        animables.cristales.push({ mesh: cristal, baseY: propY + 2.2 });
      }
      if (tipo === 'cupula') {
        const cup = new THREE.Mesh(
          new THREE.SphereGeometry(3.2, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
          new THREE.MeshBasicMaterial({ color: acento, transparent: true, opacity: 0.18, wireframe: true })
        );
        cup.position.set(propX, propY, propZ);
        grupo.add(cup);
        animables.anillos.push(cup);
      }
    } else if (tipo === 'titan') {
      const grieta = new THREE.Mesh(
        new THREE.RingGeometry(1.4, 3.3, 24),
        new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.52, side: THREE.DoubleSide })
      );
      grieta.rotation.x = -Math.PI / 2;
      grieta.position.set(propX, propY + 0.09, propZ - 0.8);
      grupo.add(grieta);
      animables.anillos.push(grieta);
    } else {
      // Antorchas ceremoniales / marcadores de ambiente
      [-2.3, 2.3].forEach(ox => {
        const py = gy(ox, -2.0);
        const poste = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.11, 1.8, 8),
          new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 })
        );
        poste.position.set(ax + ox, py + 0.9, az - 2.0);
        grupo.add(poste);
        const llama = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 8, 8),
          new THREE.MeshBasicMaterial({ color: acento })
        );
        llama.position.set(ax + ox, py + 1.9, az - 2.0);
        grupo.add(llama);
      });
    }

    // Partículas 3D flotantes (brasas/motas arcanas)
    const count = 48;
    const posArr = new Float32Array(count * 3);
    const velY = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      posArr[i * 3] = ax + (Math.random() - 0.5) * 9.5;
      posArr[i * 3 + 1] = propY + Math.random() * 4.2;
      posArr[i * 3 + 2] = az + (Math.random() - 0.5) * 9.5;
      velY[i] = 0.45 + Math.random() * 1.1;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const pMat = new THREE.PointsMaterial({
      color: acento,
      size: 0.16,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const pts = new THREE.Points(pGeo, pMat);
    grupo.add(pts);
    animables.chispas = { pts, posArr, velY, baseY: propY, ax, az };

    return { grupo, animables, focoProp: [propX, propY + 1.4, propZ] };
  }

  function actualizarEscenografia(animables, t, dt) {
    if (!animables) return;
    for (const a of animables.anillos) a.rotation.z += dt * 0.8;
    for (const c of animables.cristales) {
      c.mesh.rotation.y += dt * 1.3;
      c.mesh.position.y = c.baseY + Math.sin(t * 2.2) * 0.25;
    }
    for (const l of animables.luces) {
      l.luz.intensity = l.base + Math.sin(t * 7.5) * l.amp * 0.5;
    }
    if (animables.chispas) {
      const ch = animables.chispas;
      const attr = ch.pts.geometry.getAttribute('position');
      for (let i = 0; i < ch.velY.length; i++) {
        ch.posArr[i * 3 + 1] += ch.velY[i] * dt;
        ch.posArr[i * 3] += Math.sin(t * 2.0 + i) * 0.25 * dt;
        if (ch.posArr[i * 3 + 1] > ch.baseY + 4.8) {
          ch.posArr[i * 3 + 1] = ch.baseY + 0.15;
        }
      }
      if (attr) attr.needsUpdate = true;
    }
  }

  function disponerNodo(o) {
    if (!o) return;
    if (o.userData && o.userData.__compartidoGlb) return;
    if (o.geometry && typeof o.geometry.dispose === 'function') o.geometry.dispose();
    if (o.material) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach(m => { if (m && typeof m.dispose === 'function') m.dispose(); });
    }
    if (Array.isArray(o.children)) {
      for (const h of o.children) disponerNodo(h);
    }
  }

  function disponerGrupo(_THREE, grupo) {
    if (!grupo) return;
    if (grupo.parent) grupo.parent.remove(grupo);
    disponerNodo(grupo);
  }

  function precargarEscena(clave, ctx = {}) {
    const guion = obtenerGuion(clave);
    if (!guion || !Array.isArray(guion.enemigos)) return 0;
    let pedidos = 0;
    for (const def of guion.enemigos) {
      if (typeof ctx.precargarEnemigoGlb === 'function') {
        try { ctx.precargarEnemigoGlb(def); pedidos++; } catch (_) {}
      } else if (ctx.EnemyGlb && typeof ctx.EnemyGlb.pedir === 'function' && def && def.glbKey) {
        try { ctx.EnemyGlb.pedir(def.glbKey, 'cerca'); pedidos++; } catch (_) {}
      }
    }
    return pedidos;
  }

  function resolverModeloEnemigo(sObj, ea, permitirRespaldo) {
    if (!sObj || !ea || ea.esGlb) return;
    const ctx = sObj.ctx;
    const THREE = ctx.THREE;

    if (!ea.glbFallido && typeof ctx.instanciarEnemigoGlb === 'function') {
      let res = null;
      try { res = ctx.instanciarEnemigoGlb(ea.def); } catch (_) { res = null; }
      if (res && res.rootGroup) {
        if (ea.modelo && ea.modelo.parent === ea.mesh) {
          ea.mesh.remove(ea.modelo);
          disponerNodo(ea.modelo);
        }
        res.rootGroup.userData = Object.assign({}, res.rootGroup.userData, { __compartidoGlb: true });
        ea.mesh.add(res.rootGroup);
        ea.modelo = res.rootGroup;
        ea.glbRep = res.glbRep || null;
        ea.esGlb = true;
        return;
      }
      if (res && res.falta) {
        ea.glbFallido = true;
      }
    } else if (typeof ctx.instanciarEnemigoGlb !== 'function') {
      ea.glbFallido = true;
    }

    if (!ea.modelo && (ea.glbFallido || permitirRespaldo)) {
      let fallback = null;
      if (typeof ctx.crearEnemigoActor === 'function') {
        try { fallback = ctx.crearEnemigoActor(ea.def); } catch (_) { fallback = null; }
      }
      if (!fallback) fallback = construirActorEnemigoRespaldo(THREE, ea.def);
      ea.mesh.add(fallback);
      ea.modelo = fallback;
    }
  }

  // ------------------ HUD HTML transparente sobre Canvas 3D ------------------
  function asegurarHud() {
    if (typeof document === 'undefined') return null;
    if (!document.getElementById('director3d-css')) {
      const st = document.createElement('style');
      st.id = 'director3d-css';
      st.textContent = `
        #director3d-hud {
          position: fixed; inset: 0; z-index: 9400; display: none;
          flex-direction: column; justify-content: space-between;
          pointer-events: none; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          color: #f8fafc; user-select: none;
        }
        #director3d-hud.show { display: flex; }
        .d3d-bar {
          height: 8.5vh; min-height: 44px; max-height: 86px;
          background: linear-gradient(180deg, rgba(2,4,10,0.96) 55%, rgba(2,4,10,0.72));
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px; pointer-events: auto; box-sizing: border-box;
        }
        .d3d-bar.bot {
          background: linear-gradient(0deg, rgba(2,4,10,0.96) 60%, rgba(2,4,10,0.75));
          flex-direction: column; justify-content: center; gap: 7px; padding: 6px 24px 10px;
        }
        .d3d-stage {
          position: relative; flex: 1; pointer-events: none;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0) 58%, rgba(2,4,10,0.55) 100%);
        }
        .d3d-title {
          position: absolute; left: 4.5%; top: 14%; max-width: 680px;
          transition: all 0.9s cubic-bezier(0.22, 1, 0.36, 1);
          text-shadow: 0 3px 16px rgba(0,0,0,0.95);
        }
        .d3d-title.tucked { top: 4%; left: 3%; transform: scale(0.76); transform-origin: top left; opacity: 0.92; }
        .d3d-acto { font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #fde047; font-weight: 700; margin-bottom: 5px; }
        .d3d-tit { font-family: Georgia, 'Times New Roman', serif; font-size: clamp(20px, 2.9vw, 34px); margin: 0; color: #fffbeb; }
        .d3d-subs {
          position: absolute; left: 50%; bottom: 3.8%; transform: translateX(-50%);
          width: min(860px, 90%); padding: 10px 18px; border-radius: 8px;
          background: rgba(2, 6, 16, 0.78); backdrop-filter: blur(4px);
          border: 1px solid rgba(250, 204, 21, 0.24); text-align: center;
          font-size: clamp(14px, 1.4vw, 17.5px); line-height: 1.45;
          text-shadow: 0 1px 4px #000; box-sizing: border-box;
        }
        .d3d-prog { width: min(980px, 92%); height: 3px; background: rgba(255,255,255,0.14); border-radius: 3px; overflow: hidden; }
        .d3d-prog > div { height: 100%; width: 0%; background: linear-gradient(90deg, #f59e0b, #fde047); }
        .d3d-ctrl { width: min(980px, 92%); display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
        .d3d-btns { display: flex; gap: 7px; flex-wrap: wrap; }
        .d3d-btn {
          background: rgba(15,23,42,0.88); color: #e2e8f0; border: 1px solid rgba(148,163,184,0.35);
          border-radius: 6px; padding: 5px 11px; font-size: 12px; cursor: pointer;
        }
        .d3d-btn:hover { border-color: #fde047; color: #fff; }
        .d3d-btn.rec { border-color: #ef4444; color: #fecaca; background: rgba(127,29,29,0.75); }
        .d3d-btn.prim { background: linear-gradient(135deg, #92400e, #b45309); border-color: #facc15; color: #fef9c3; font-weight: 600; }
      `;
      document.head.appendChild(st);
    }
    let hud = document.getElementById('director3d-hud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'director3d-hud';
      hud.innerHTML = `
        <div class="d3d-bar top">
          <span id="d3d-badge" style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#fde047;font-weight:700"></span>
          <span style="font-size:11.5px;color:#cbd5e1">🎬 Escena 3D en vivo</span>
        </div>
        <div class="d3d-stage">
          <div id="d3d-title-card" class="d3d-title">
            <div id="d3d-acto" class="d3d-acto"></div>
            <h2 id="d3d-titulo" class="d3d-tit"></h2>
          </div>
          <div id="d3d-subs" class="d3d-subs" style="display:none"></div>
        </div>
        <div class="d3d-bar bot">
          <div class="d3d-prog"><div id="d3d-prog-bar"></div></div>
          <div class="d3d-ctrl">
            <span id="d3d-tiempo" style="font-size:11.5px;color:#94a3b8">0:00</span>
            <div class="d3d-btns">
              <button type="button" id="d3d-pausa" class="d3d-btn">⏸ Pausar</button>
              <button type="button" id="d3d-voz" class="d3d-btn">🔊 Voz</button>
              <button type="button" id="d3d-grabar" class="d3d-btn" style="display:none">🎥 Grabar WebM</button>
              <button type="button" id="d3d-lamina" class="d3d-btn" style="display:none">🖼️ Lámina 2D</button>
              <button type="button" id="d3d-saltar" class="d3d-btn prim">⏭ Saltar (ESC)</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(hud);
    }
    return hud;
  }

  function soportaGrabacionWebM(canvas) {
    return !!(
      canvas &&
      typeof canvas.captureStream === 'function' &&
      typeof MediaRecorder !== 'undefined'
    );
  }

  // ------------------ Motor de ejecución de la escena 3D ------------------
  let sesion = null;

  function buscarNpcEscena(ctx, rol) {
    const lista = (ctx && Array.isArray(ctx.gurus)) ? ctx.gurus : [];
    if (!lista.length) return null;
    if (rol === 'herrero') {
      const h = lista.find(g => g && g.info && (g.info.servicio === 'herrero' || g.info.id === 'herrero' || String(g.info.id || '').includes('herrero')));
      if (h) return h;
    }
    const exacto = lista.find(g => g && g.info && (g.info.id === rol || String(g.info.id || '').startsWith(rol)));
    if (exacto) return exacto;
    return lista[0];
  }

  function snapshotTransform(obj) {
    if (!obj || !obj.position || !obj.rotation) return null;
    return {
      pos: [obj.position.x, obj.position.y, obj.position.z],
      rot: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
      vis: obj.visible !== undefined ? obj.visible : true
    };
  }

  function restaurarTransform(obj, snap) {
    if (!obj || !snap || !obj.position || !obj.rotation) return;
    obj.position.set(snap.pos[0], snap.pos[1], snap.pos[2]);
    obj.rotation.set(snap.rot[0], snap.rot[1], snap.rot[2]);
    if (obj.visible !== undefined) obj.visible = snap.vis;
  }

  function iniciar(clave, ctx = {}) {
    const guion = obtenerGuion(clave);
    if (!guion || !ctx || !ctx.THREE || !ctx.scene || !ctx.camera) return false;
    if (sesion) detener(true, { sinCallback: true });

    const THREE = ctx.THREE;
    const getGroundY = typeof ctx.getGroundY === 'function' ? ctx.getGroundY : (() => 0);

    // Posición base del escenario: en torno al héroe real en mundo abierto
    const heroRoot = ctx.character && ctx.character.root ? ctx.character.root : null;
    const ax = heroRoot ? heroRoot.position.x : 0;
    const az = heroRoot ? heroRoot.position.z : 0;
    const ay = getGroundY(ax, az);

    const npcEntrada = buscarNpcEscena(ctx, guion.npcRol);
    if (npcEntrada && typeof ctx.asegurarVersionCercanaNpc === 'function') {
      try { ctx.asegurarVersionCercanaNpc(npcEntrada); } catch (_) {}
    }

    const compObj = ctx.acompanante && ctx.acompanante.root ? ctx.acompanante : null;

    // Guardar estado original exacto de todos los actores, cámara y ambiente
    const snaps = {
      hero: snapshotTransform(heroRoot),
      heroMode: ctx.character ? ctx.character.cameraMode : 'follow',
      comp: compObj ? {
        tr: snapshotTransform(compObj.root),
        x: compObj.x, y: compObj.y, z: compObj.z, rotY: compObj.rotY
      } : null,
      npc: npcEntrada && npcEntrada.raiz ? snapshotTransform(npcEntrada.raiz) : null,
      camPos: [ctx.camera.position.x, ctx.camera.position.y, ctx.camera.position.z],
      camFov: ctx.camera.fov || 50,
      ctrlTarget: ctx.controls && ctx.controls.target ? [ctx.controls.target.x, ctx.controls.target.y, ctx.controls.target.z] : null,
      ctrlEnabled: ctx.controls ? ctx.controls.enabled : true,
      hora: typeof ctx.getTimeOfDay === 'function' ? ctx.getTimeOfDay() : null,
      musVol: null
    };

    if (ctx.Sonidos && typeof ctx.Sonidos.getVolumenes === 'function' && typeof ctx.Sonidos.setVolumen === 'function') {
      const v = ctx.Sonidos.getVolumenes();
      if (v && typeof v.musica === 'number') {
        snaps.musVol = v.musica;
        ctx.Sonidos.setVolumen('musica', Math.max(0.08, v.musica * 0.42));
      }
    }
    if (guion.hora && typeof ctx.setTimeOfDay === 'function') {
      try { ctx.setTimeOfDay(guion.hora); } catch (_) {}
    }
    if (ctx.controls) ctx.controls.enabled = false;
    if (ctx.character) ctx.character.cameraMode = 'cutscene';

    // Colocar actores en el escenario
    const heroPos0 = [ax - 1.3, getGroundY(ax - 1.3, az + 1.2), az + 1.2];
    const npcPos0 = [ax + 1.8, getGroundY(ax + 1.8, az - 0.6), az - 0.6];
    const compPos0 = [ax - 2.9, getGroundY(ax - 2.9, az + 1.6), az + 1.6];

    if (heroRoot) {
      heroRoot.position.set(heroPos0[0], heroPos0[1], heroPos0[2]);
      heroRoot.visible = true;
      if (ctx.character.mirarHacia) ctx.character.mirarHacia(npcPos0[0] - heroPos0[0], npcPos0[2] - heroPos0[2]);
    }
    if (npcEntrada && npcEntrada.raiz) {
      npcEntrada.raiz.visible = true;
      npcEntrada.raiz.position.set(npcPos0[0], npcPos0[1], npcPos0[2]);
      npcEntrada.raiz.lookAt(heroPos0[0], npcPos0[1], heroPos0[2]);
    }
    if (compObj && compObj.root) {
      compObj.root.visible = true;
      compObj.root.position.set(compPos0[0], compPos0[1], compPos0[2]);
      compObj.root.lookAt(npcPos0[0], compPos0[1], npcPos0[2]);
    }

    // Construir escenografía 3D y enemigos temporales dentro de escenaGrupo
    const esce = construirEscenografia(THREE, guion, getGroundY, ax, az);
    const escenaGrupo = esce.grupo;
    const enemigosActores = [];
    for (const def of guion.enemigos) {
      if (typeof ctx.precargarEnemigoGlb === 'function') {
        try { ctx.precargarEnemigoGlb(def); } catch (_) {}
      } else if (ctx.EnemyGlb && typeof ctx.EnemyGlb.pedir === 'function' && def && def.glbKey) {
        try { ctx.EnemyGlb.pedir(def.glbKey, 'cerca'); } catch (_) {}
      }
      const mesh = new THREE.Group();
      const sx = ax + (def.posInicio ? def.posInicio[0] : 0);
      const sz = az + (def.posInicio ? def.posInicio[1] : -7);
      const tx = ax + (def.posObjetivo ? def.posObjetivo[0] : 0);
      const tz = az + (def.posObjetivo ? def.posObjetivo[1] : -2);
      const sy = getGroundY(sx, sz);
      mesh.position.set(sx, sy, sz);
      mesh.visible = false;
      escenaGrupo.add(mesh);
      const ea = {
        def,
        mesh,
        modelo: null,
        glbRep: null,
        esGlb: false,
        glbFallido: false,
        sx, sz, tx, tz,
        x: sx, y: sy, z: sz,
        caido: false
      };
      enemigosActores.push(ea);
    }
    ctx.scene.add(escenaGrupo);

    // Subtítulos y voz
    const durSeg = Math.max(8, Number(ctx.duracionSeg || guion.duracionSeg || 12));
    const texto = ctx.texto || '';
    const cues = (ctx.CinematicasLib && typeof ctx.CinematicasLib.dividirSubtitulos === 'function')
      ? ctx.CinematicasLib.dividirSubtitulos(texto, durSeg)
      : (texto ? [{ texto, tInicio: 0, tFin: durSeg }] : []);

    const hud = asegurarHud();
    if (hud) {
      const bEl = document.getElementById('d3d-badge');
      const aEl = document.getElementById('d3d-acto');
      const tEl = document.getElementById('d3d-titulo');
      const tcEl = document.getElementById('d3d-title-card');
      const sEl = document.getElementById('d3d-subs');
      const pEl = document.getElementById('d3d-prog-bar');
      const recBtn = document.getElementById('d3d-grabar');
      const lamBtn = document.getElementById('d3d-lamina');
      if (bEl) bEl.textContent = guion.numero === 0 ? 'Prólogo' : `Capítulo ${guion.numero}`;
      if (aEl) aEl.textContent = ctx.acto || (guion.numero === 0 ? 'Prólogo · La Emboscada' : 'Crónica de Valdris');
      if (tEl) tEl.textContent = ctx.titulo || guion.id;
      if (tcEl) tcEl.classList.remove('tucked');
      if (sEl) { sEl.style.display = cues.length ? '' : 'none'; sEl.textContent = cues.length ? cues[0].texto : ''; }
      if (pEl) pEl.style.width = '0%';
      if (recBtn) recBtn.style.display = (ctx.renderer && soportaGrabacionWebM(ctx.renderer.domElement)) ? '' : 'none';
      if (lamBtn) lamBtn.style.display = typeof ctx.onVerLamina2D === 'function' ? '' : 'none';
      hud.classList.add('show');
    }

    const sObj = {
      id: guion.id,
      numero: guion.numero,
      guion,
      ctx,
      snaps,
      heroRoot,
      npcEntrada,
      compObj,
      escenaGrupo,
      esce,
      enemigosActores,
      heroPos: heroPos0.slice(),
      npcPos: npcPos0.slice(),
      compPos: compPos0.slice(),
      ax, ay, az,
      durSeg,
      elapsed: 0,
      pausado: false,
      silenciado: false,
      cues,
      vozId: ctx.vozId || (guion.id === 'prologo' ? 'prologo_01' : `cap_${String(guion.numero).padStart(2, '0')}_encargo`),
      vozEmpezo: false,
      vozTerminoAt: null,
      doneHeroe: new Set(),
      doneComp: new Set(),
      doneFx: new Set(),
      recorder: null,
      recChunks: [],
      onKey: null
    };
    sesion = sObj;

    for (const ea of sObj.enemigosActores) {
      resolverModeloEnemigo(sObj, ea, false);
    }

    const lanzarVoz = () => {
      if (sObj.silenciado || !ctx.Voces || typeof ctx.Voces.hablar !== 'function') return;
      ctx.Voces.hablar(sObj.vozId, texto || null, { prioridad: 'alta' }).then(ok => {
        if (ok && sesion === sObj) sObj.vozEmpezo = true;
      }).catch(() => {});
    };
    lanzarVoz();

    if (hud) {
      const btnPausa = document.getElementById('d3d-pausa');
      const btnVoz = document.getElementById('d3d-voz');
      const btnGrabar = document.getElementById('d3d-grabar');
      const btnLamina = document.getElementById('d3d-lamina');
      const btnSaltar = document.getElementById('d3d-saltar');

      if (btnPausa) { btnPausa.textContent = '⏸ Pausar'; btnPausa.onclick = () => pausar(); }
      if (btnVoz) {
        btnVoz.textContent = '🔊 Voz';
        btnVoz.onclick = () => {
          sObj.silenciado = !sObj.silenciado;
          btnVoz.textContent = sObj.silenciado ? '🔇 Silencio' : '🔊 Voz';
          if (sObj.silenciado && ctx.Voces && ctx.Voces.detener) ctx.Voces.detener();
          else lanzarVoz();
        };
      }
      if (btnGrabar) {
        btnGrabar.classList.remove('rec');
        btnGrabar.textContent = '🎥 Grabar WebM';
        btnGrabar.onclick = () => alternarGrabacion(sObj, btnGrabar);
      }
      if (btnLamina) {
        btnLamina.onclick = () => {
          const ver2D = ctx.onVerLamina2D;
          detener(true, { sinCallback: true });
          if (typeof ver2D === 'function') ver2D();
        };
      }
      if (btnSaltar) btnSaltar.onclick = () => detener(true);
    }

    sObj.onKey = (e) => {
      if (sesion !== sObj) return;
      if (e.key === 'Escape') {
        e.preventDefault(); e.stopPropagation();
        detener(true);
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault(); e.stopPropagation();
        pausar();
      }
    };
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('keydown', sObj.onKey, true);
    }

    // Posicionar cámara en el plano inicial inmediatamente
    actualizar(0.016, typeof performance !== 'undefined' ? performance.now() : Date.now());
    return true;
  }

  function alternarGrabacion(sObj, btn) {
    if (!sObj || !sObj.ctx || !sObj.ctx.renderer) return;
    if (sObj.recorder && sObj.recorder.state === 'recording') {
      try { sObj.recorder.stop(); } catch (_) {}
      return;
    }
    const canvas = sObj.ctx.renderer.domElement;
    if (!soportaGrabacionWebM(canvas)) return;
    try {
      const stream = canvas.captureStream(30);
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
      const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 3500000 });
      sObj.recChunks = [];
      rec.ondataavailable = ev => { if (ev.data && ev.data.size > 0) sObj.recChunks.push(ev.data); };
      rec.onstop = () => {
        if (btn) { btn.classList.remove('rec'); btn.textContent = '🎥 Grabar WebM'; }
        if (!sObj.recChunks.length || typeof document === 'undefined' || typeof URL === 'undefined') return;
        const blob = new Blob(sObj.recChunks, { type: 'video/webm' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `valdris-${sObj.id}.webm`;
        a.click();
        setTimeout(() => { try { URL.revokeObjectURL(a.href); } catch (_) {} }, 4000);
      };
      rec.start(250);
      sObj.recorder = rec;
      if (btn) { btn.classList.add('rec'); btn.textContent = '⏹ Detener WebM'; }
    } catch (_) {}
  }

  function ejecutarAccionHeroe(sObj, ac) {
    const ctx = sObj.ctx;
    const ch = ctx.character;
    if (!ch || !sObj.heroRoot) return;
    const ene = sObj.enemigosActores[0];
    if (ac.tipo === 'mirar_npc') {
      ch.mirarHacia && ch.mirarHacia(sObj.npcPos[0] - sObj.heroPos[0], sObj.npcPos[2] - sObj.heroPos[2]);
    } else if (ac.tipo === 'mirar_enemigo' && ene) {
      ch.mirarHacia && ch.mirarHacia(ene.x - sObj.heroPos[0], ene.z - sObj.heroPos[2]);
    } else if (ac.tipo === 'caminar') {
      const getGroundY = typeof ctx.getGroundY === 'function' ? ctx.getGroundY : (() => 0);
      const nx = sObj.heroPos[0] + (ac.dx || 0);
      const nz = sObj.heroPos[2] + (ac.dz || 0);
      sObj.heroPos[0] = nx; sObj.heroPos[2] = nz;
      sObj.heroPos[1] = getGroundY(nx, nz);
      sObj.heroRoot.position.set(nx, sObj.heroPos[1], nz);
    } else if (ac.tipo === 'atacar' || ac.tipo === 'skill') {
      if (ene && ch.mirarHacia) ch.mirarHacia(ene.x - sObj.heroPos[0], ene.z - sObj.heroPos[2]);
      const clase = ctx.claseArma || 'espadas';
      const skId = ac.skill || (clase === 'arcos' ? 'disparo' : (clase === 'bastones' ? 'orbe_arcano' : 'attack'));
      const durAnim = ch.playOneShot ? ch.playOneShot(skId, sObj.elapsed, { armaClase: clase }) : 1.5;
      if (ctx.studioVfx && ctx.studioVfx.hasProfile && ctx.studioVfx.hasProfile(skId)) {
        const skObj = (ctx.CombatLib && ctx.CombatLib.SKILLS && ctx.CombatLib.SKILLS[skId]) || { lock: durAnim || 1.5, range: 6 };
        const tgt = ene ? new ctx.THREE.Vector3(ene.x, ene.y + 1.0, ene.z) : new ctx.THREE.Vector3(sObj.ax, sObj.ay + 1.0, sObj.az - 3);
        ctx.studioVfx.startSkill(skId, skObj, { duration: durAnim || 1.5, armaClase: clase, targetPos: tgt, heroRoot: sObj.heroRoot });
      }
      if (ctx.Sonidos && typeof ctx.Sonidos.skill === 'function') {
        ctx.Sonidos.skill(skId, 'inicio', { clase, duracion: durAnim || 1.5 });
      }
    } else if (ac.tipo === 'celebrar') {
      if (ch.playOneShot) ch.playOneShot('victory', sObj.elapsed);
      if (ch.mirarHacia) ch.mirarHacia(0, 1);
    }
  }

  function ejecutarAccionCompanero(sObj, ac) {
    const ctx = sObj.ctx;
    const comp = sObj.compObj;
    if (!comp || !comp.root) return;
    const getGroundY = typeof ctx.getGroundY === 'function' ? ctx.getGroundY : (() => 0);
    const ene = sObj.enemigosActores[sObj.enemigosActores.length > 1 ? 1 : 0];
    if (ac.tipo === 'acercar' || ac.tipo === 'cubrir') {
      const tx = sObj.heroPos[0] - 1.6, tz = sObj.heroPos[2] + 0.5;
      sObj.compPos = [tx, getGroundY(tx, tz), tz];
      comp.root.position.set(sObj.compPos[0], sObj.compPos[1], sObj.compPos[2]);
      if (ene) comp.root.lookAt(ene.x, sObj.compPos[1], ene.z);
    } else if (ac.tipo === 'cargar' && ene) {
      const tx = lerp(sObj.compPos[0], ene.x - 1.1, 0.55);
      const tz = lerp(sObj.compPos[2], ene.z + 1.1, 0.55);
      sObj.compPos = [tx, getGroundY(tx, tz), tz];
      comp.root.position.set(sObj.compPos[0], sObj.compPos[1], sObj.compPos[2]);
      comp.root.lookAt(ene.x, sObj.compPos[1], ene.z);
    } else if (ac.tipo === 'atacar') {
      if (ene) comp.root.lookAt(ene.x, sObj.compPos[1], ene.z);
      if (ctx.AcompananteLib && typeof ctx.AcompananteLib.reproducirAnimacionGLB === 'function') {
        try { ctx.AcompananteLib.reproducirAnimacionGLB(comp, 'attack', 0.15); } catch (_) {}
      }
    } else if (ac.tipo === 'celebrar') {
      if (ctx.AcompananteLib && typeof ctx.AcompananteLib.reproducirAnimacionGLB === 'function') {
        try { ctx.AcompananteLib.reproducirAnimacionGLB(comp, 'idle', 0.2); } catch (_) {}
      }
    }
  }

  function ejecutarEventoVfx(sObj, ev) {
    const ctx = sObj.ctx;
    const ene = sObj.enemigosActores[0];
    const pVec = ene
      ? new ctx.THREE.Vector3(ene.x, ene.y + 1.1, ene.z)
      : new ctx.THREE.Vector3(sObj.ax, sObj.ay + 1.2, sObj.az - 2.0);
    if (ev.tipo === 'ruido_enemigo' && ctx.Sonidos && typeof ctx.Sonidos.enemigo === 'function') {
      ctx.Sonidos.enemigo(ev.evento || 'aggro', ev.info || { name: 'Bestia' });
    } else if (ev.tipo === 'esfuerzo' && ctx.Sonidos && typeof ctx.Sonidos.esfuerzo === 'function') {
      ctx.Sonidos.esfuerzo(ctx.generoHeroe || 'hombre', { intenso: !!ev.intenso, sinCooldown: true });
    } else if (ev.tipo === 'destello' && typeof ctx.destelloImpacto === 'function') {
      ctx.destelloImpacto(pVec, ev.color || 0xfacc15, ev.radio || 1.4);
    } else if (ev.tipo === 'onda' && typeof ctx.ondaDetonacion === 'function') {
      ctx.ondaDetonacion(pVec.x, sObj.ay, pVec.z, ev.radio || 5.0, ev.color || 0xfacc15);
    } else if (ev.tipo === 'sacudida' && typeof ctx.activarSacudida === 'function') {
      ctx.activarSacudida(ev.int || 0.22, ev.dur || 0.2);
    } else if (ev.tipo === 'pilar_luz') {
      const pilar = new ctx.THREE.Mesh(
        new ctx.THREE.CylinderGeometry(0.45, 1.35, 16, 18, 1, true),
        new ctx.THREE.MeshBasicMaterial({ color: ev.color || 0x38bdf8, transparent: true, opacity: 0.45, side: ctx.THREE.DoubleSide, blending: ctx.THREE.AdditiveBlending, depthWrite: false })
      );
      pilar.position.set(sObj.esce.focoProp[0], sObj.esce.focoProp[1] + 6.5, sObj.esce.focoProp[2]);
      sObj.escenaGrupo.add(pilar);
    }
  }

  function actualizar(dt, _nowMs) {
    if (!sesion) return false;
    const sObj = sesion;
    const ctx = sObj.ctx;
    const delta = Math.min(0.08, Math.max(0.001, dt || 0.016));

    if (!sObj.pausado) {
      sObj.elapsed += delta;
    }
    const t = sObj.elapsed;
    const getGroundY = typeof ctx.getGroundY === 'function' ? ctx.getGroundY : (() => 0);

    // Actualizar acciones cronometradas del héroe, compañero y VFX
    if (!sObj.pausado) {
      sObj.guion.accionesHeroe.forEach((ac, i) => {
        if (!sObj.doneHeroe.has(i) && t >= ac.t) {
          sObj.doneHeroe.add(i);
          ejecutarAccionHeroe(sObj, ac);
        }
      });
      sObj.guion.accionesCompanero.forEach((ac, i) => {
        if (!sObj.doneComp.has(i) && t >= ac.t) {
          sObj.doneComp.add(i);
          ejecutarAccionCompanero(sObj, ac);
        }
      });
      sObj.guion.eventosVfx.forEach((ev, i) => {
        if (!sObj.doneFx.has(i) && t >= ev.t) {
          sObj.doneFx.add(i);
          ejecutarEventoVfx(sObj, ev);
        }
      });
    }

    // Mover y animar enemigos temporales (GLB reales con clips esqueletales)
    const dtAnim = sObj.pausado ? 0 : delta;
    for (const ea of sObj.enemigosActores) {
      const def = ea.def;
      if (!ea.esGlb && !ea.glbFallido) {
        resolverModeloEnemigo(sObj, ea, t >= def.tEntrada + 1.0);
      } else if (!ea.modelo) {
        resolverModeloEnemigo(sObj, ea, true);
      }
      if (t < def.tEntrada) {
        ea.mesh.visible = false;
        continue;
      }
      if (!ea.modelo && t >= def.tEntrada + 1.0) {
        resolverModeloEnemigo(sObj, ea, true);
      }
      ea.mesh.visible = !!ea.modelo;
      if (t < def.tCaida) {
        const uWalk = smoothstep((t - def.tEntrada) / Math.max(0.5, def.tCaida - def.tEntrada - 1.6));
        ea.x = lerp(ea.sx, ea.tx, uWalk);
        ea.z = lerp(ea.sz, ea.tz, uWalk);
        ea.y = getGroundY(ea.x, ea.z);
        const bob = !ea.esGlb && uWalk < 0.98 ? Math.abs(Math.sin(t * 10)) * 0.14 : 0;
        ea.mesh.position.set(ea.x, ea.y + bob, ea.z);
        ea.mesh.lookAt(sObj.heroPos[0], ea.y, sObj.heroPos[2]);
        if (ea.glbRep && ctx.EnemyGlb && typeof ctx.EnemyGlb.actualizar === 'function') {
          const estado = uWalk < 0.96 ? 'run' : (t >= def.tCaida - 0.55 ? 'hit' : 'attack');
          ctx.EnemyGlb.actualizar(ea.glbRep, estado, dtAnim);
        }
      } else {
        const tieneClipMuerte = !!(ea.glbRep && ea.glbRep.acciones && ea.glbRep.acciones.death);
        if (ea.glbRep && ctx.EnemyGlb && typeof ctx.EnemyGlb.actualizar === 'function') {
          ctx.EnemyGlb.actualizar(ea.glbRep, 'death', dtAnim);
        }
        if (!tieneClipMuerte) {
          const uFall = smoothstep((t - def.tCaida) / 0.55);
          ea.mesh.rotation.x = -uFall * (Math.PI * 0.48);
          ea.mesh.position.y = ea.y + 0.12 * (1 - uFall);
        }
      }
    }

    // Herrero Brann cae de rodillas herido en el prólogo tras el ataque
    if (sObj.id === 'prologo' && sObj.npcEntrada && sObj.npcEntrada.raiz && t >= 8.5) {
      const uBrann = smoothstep((t - 8.5) / 0.7);
      sObj.npcEntrada.raiz.position.y = sObj.npcPos[1] - 0.38 * uBrann;
      sObj.npcEntrada.raiz.rotation.x = 0.24 * uBrann;
    }

    actualizarEscenografia(sObj.esce.animables, t, sObj.pausado ? 0 : delta);

    // Evaluar plano actual de cámara y aplicar a Three.js
    const ene0 = sObj.enemigosActores[0];
    const focos = {
      centro: [sObj.ax, sObj.ay + 1.3, sObj.az - 0.8],
      heroe: [sObj.heroPos[0], sObj.heroPos[1] + 1.35, sObj.heroPos[2]],
      npc: [sObj.npcPos[0], sObj.npcPos[1] + 1.35, sObj.npcPos[2]],
      enemigo: ene0 ? [ene0.x, ene0.y + 1.25, ene0.z] : [sObj.ax, sObj.ay + 1.3, sObj.az - 2.2],
      prop: sObj.esce.focoProp
    };
    const camState = evaluarPlanoCamara(sObj.guion, t, focos);
    ctx.camera.position.set(camState.pos[0], camState.pos[1], camState.pos[2]);
    if (ctx.camera.fov !== camState.fov && typeof ctx.camera.updateProjectionMatrix === 'function') {
      ctx.camera.fov = camState.fov;
      ctx.camera.updateProjectionMatrix();
    }
    if (ctx.controls && ctx.controls.target) {
      ctx.controls.target.set(camState.lookAt[0], camState.lookAt[1], camState.lookAt[2]);
    }
    if (typeof ctx.camera.lookAt === 'function') {
      ctx.camera.lookAt(camState.lookAt[0], camState.lookAt[1], camState.lookAt[2]);
    }

    // Actualizar HUD
    if (typeof document !== 'undefined') {
      const tcEl = document.getElementById('d3d-title-card');
      const sEl = document.getElementById('d3d-subs');
      const pEl = document.getElementById('d3d-prog-bar');
      const tEl = document.getElementById('d3d-tiempo');
      if (tcEl && t >= 3.2 && !tcEl.classList.contains('tucked')) tcEl.classList.add('tucked');
      const uTot = clamp(t / sObj.durSeg, 0, 1);
      if (pEl) pEl.style.width = `${(uTot * 100).toFixed(2)}%`;
      if (tEl) {
        const sAct = Math.floor(t), sTot = Math.ceil(sObj.durSeg);
        const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
        tEl.textContent = `${fmt(sAct)} / ${fmt(sTot)}`;
      }
      if (sEl && sObj.cues.length) {
        const cue = sObj.cues.find(c => t >= c.tInicio && t <= c.tFin) || sObj.cues[sObj.cues.length - 1];
        if (sEl.textContent !== cue.texto) sEl.textContent = cue.texto;
      }
    }

    const hablando = !!(ctx.Voces && typeof ctx.Voces.estaHablando === 'function' && ctx.Voces.estaHablando());
    if (hablando) {
      sObj.vozEmpezo = true;
      sObj.vozTerminoAt = null;
    } else if (sObj.vozEmpezo && sObj.vozTerminoAt === null) {
      sObj.vozTerminoAt = t;
    }
    const finTiempo = t >= sObj.durSeg && !hablando;
    const finVoz = sObj.vozTerminoAt !== null && (t - sObj.vozTerminoAt) >= 1.1 && t >= Math.min(sObj.durSeg * 0.72, 7.5);
    if (finTiempo || finVoz) {
      detener(false);
    }
    return true;
  }

  function detener(saltada = false, opts = {}) {
    if (!sesion) return false;
    const sObj = sesion;
    sesion = null;

    if (typeof window !== 'undefined' && window.removeEventListener && sObj.onKey) {
      window.removeEventListener('keydown', sObj.onKey, true);
    }
    if (sObj.recorder && sObj.recorder.state === 'recording') {
      try { sObj.recorder.stop(); } catch (_) {}
    }

    if (typeof document !== 'undefined') {
      const hud = document.getElementById('director3d-hud');
      if (hud) hud.classList.remove('show');
    }

    const ctx = sObj.ctx;
    if (ctx.Voces && typeof ctx.Voces.detener === 'function') ctx.Voces.detener();

    // Restaurar todos los transformadores y estado de la partida
    restaurarTransform(sObj.heroRoot, sObj.snaps.hero);
    if (ctx.character) ctx.character.cameraMode = sObj.snaps.heroMode || 'follow';
    if (sObj.compObj && sObj.snaps.comp) {
      restaurarTransform(sObj.compObj.root, sObj.snaps.comp.tr);
      sObj.compObj.x = sObj.snaps.comp.x;
      sObj.compObj.y = sObj.snaps.comp.y;
      sObj.compObj.z = sObj.snaps.comp.z;
      sObj.compObj.rotY = sObj.snaps.comp.rotY;
    }
    if (sObj.npcEntrada && sObj.npcEntrada.raiz) {
      restaurarTransform(sObj.npcEntrada.raiz, sObj.snaps.npc);
    }
    if (ctx.camera) {
      ctx.camera.position.set(sObj.snaps.camPos[0], sObj.snaps.camPos[1], sObj.snaps.camPos[2]);
      ctx.camera.fov = sObj.snaps.camFov;
      if (typeof ctx.camera.updateProjectionMatrix === 'function') ctx.camera.updateProjectionMatrix();
    }
    if (ctx.controls) {
      if (ctx.controls.target && sObj.snaps.ctrlTarget) {
        ctx.controls.target.set(sObj.snaps.ctrlTarget[0], sObj.snaps.ctrlTarget[1], sObj.snaps.ctrlTarget[2]);
      }
      ctx.controls.enabled = sObj.snaps.ctrlEnabled;
    }
    if (sObj.snaps.hora && typeof ctx.setTimeOfDay === 'function') {
      try { ctx.setTimeOfDay(sObj.snaps.hora); } catch (_) {}
    }
    if (sObj.snaps.musVol !== null && ctx.Sonidos && typeof ctx.Sonidos.setVolumen === 'function') {
      ctx.Sonidos.setVolumen('musica', sObj.snaps.musVol);
    }

    for (const ea of sObj.enemigosActores) {
      if (ea.glbRep && ctx.EnemyGlb && typeof ctx.EnemyGlb.detener === 'function') {
        try { ctx.EnemyGlb.detener(ea.glbRep); } catch (_) {}
      }
      // Desacoplar clones GLB compartidos antes de disponer para no liberar mallas/materiales cacheados del mundo
      if (ea.esGlb && ea.modelo && ea.modelo.parent) {
        ea.modelo.parent.remove(ea.modelo);
      }
    }

    disponerGrupo(ctx.THREE, sObj.escenaGrupo);

    if (!opts.sinCallback && typeof ctx.onTerminar === 'function') {
      ctx.onTerminar({ id: sObj.id, numero: sObj.numero, saltada: !!saltada, modo: '3d' });
    }
    return true;
  }

  function pausar(forzarEstado) {
    if (!sesion) return false;
    sesion.pausado = typeof forzarEstado === 'boolean' ? forzarEstado : !sesion.pausado;
    if (typeof document !== 'undefined') {
      const btn = document.getElementById('d3d-pausa');
      if (btn) btn.textContent = sesion.pausado ? '▶ Reanudar' : '⏸ Pausar';
    }
    return sesion.pausado;
  }

  function estaActiva() {
    return !!sesion;
  }

  const api = {
    GUIONES_3D,
    obtenerGuion,
    listarGuiones,
    evaluarPlanoCamara,
    soportaGrabacionWebM,
    precargarEscena,
    iniciar,
    actualizar,
    detener,
    pausar,
    estaActiva
  };

  root.DirectorEscenas3D = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
