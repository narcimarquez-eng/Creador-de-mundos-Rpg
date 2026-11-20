/*
 * character.js — Personaje y cámara compartidos por el Creador de Pueblos y el Visor del mundo.
 *
 * El "mundo" que recibe el personaje debe ofrecer:
 *   getWalkableHeight(x, z)  → altura del suelo donde se puede estar de pie
 *   getColliders(x, z)       → (opcional) colisionadores cercanos a (x, z) en coordenadas del mundo
 *   colliders                → (si no hay getColliders) lista fija de colisionadores
 *   isWaterHazard(x, z, r)   → (opcional) true si la posición es agua
 *
 * Colisionadores (en coordenadas del mundo):
 *   { type: 'circle', x, z, r }
 *   { type: 'box', minX, maxX, minZ, maxZ }                       rectángulo alineado con los ejes
 *   { type: 'obb', cx, cz, ux, uz, hu, hv }                       rectángulo girado: (ux, uz) es el eje u unitario,
 *                                                                 (-uz, ux) el eje v; hu y hv son semilongitudes
 *
 * Requiere THREE (global). Expone window.CharacterLib.
 */
(function (global) {
  "use strict";

  const WALK_SPEED = 6.5;
  const RUN_SPEED = 12.0;

  // Palabras clave para reconocer las animaciones del GLB (en inglés o español, sin distinguir mayúsculas)
  const CLIP_KEYWORDS = {
    idle: ['idle', 'stand', 'wait', 'guardia', 'reposo'],
    walk: ['walk', 'andar', 'caminar', 'marcha', 'move'],
    run: ['run', 'sprint', 'correr', 'carrera', 'fast'],
    attack: ['combo', 'ataque', 'attack', 'punch'],
    sismo: ['slam', 'sismo', 'sísmico'],
    // Técnicas de arma y de arco (nombres del cuerpo que exporta el estudio de armaduras)
    tajo: ['spin_slash', 'tajo giratorio'],
    estocada: ['thrust_lunge', 'estocada'],
    ascendente: ['rising_slash', 'tajo ascendente'],
    hendidura: ['overhead_cleave', 'hendidura'],
    contraataque: ['guard_counter', 'contraataque'],
    torbellino: ['whirlwind', 'torbellino'],
    voltereta: ['backflip', 'voltereta'],
    tornillo: ['triple_corkscrew', 'tornillo'],
    disparo: ['archery', 'tiro con arco'],
    suspension: ['aerial_shot', 'suspensión'],
    // Nuevas habilidades activas mapeadas a las animaciones de combate
    corte_cruzado: ['spin_slash', 'punch', 'corte'],
    rafaga: ['rising_slash', 'kick', 'rafaga'],
    furia: ['overhead_cleave', 'furia'],
    escudo_espiritu: ['guard_counter', 'escudo'],
    salto_demoledor: ['ultimate_slam', 'slam', 'salto_demoledor'],
    lluvia_proyectiles: ['aerial_shot', 'archery', 'lluvia'],
    juicio_relampago: ['triple_corkscrew', 'juicio'],
    sentencia_titan: ['ultimate_nova', 'sentencia'],
    bola_fuego: ['ultimate_beam', 'punch'],
    lanza_hielo: ['ultimate_beam', 'kick'],
    ventisca_glacial: ['ultimate_nova', 'blast'],
    tormenta_fuego: ['ultimate_slam', 'nova'],
    rayo_arcano: ['ultimate_nova', 'ultimate_beam'],
    orbe_arcano: ['ultimate_beam', 'punch', 'attack'],
    flecha_perforante: ['archery', 'aerial_shot', 'disparo'],
    trampa_espinas: ['aerial_shot', 'archery', 'slam'],
    escudo_mana: ['guard_counter', 'ultimate_nova', 'escudo'],
    paso_sombrio: ['thrust_lunge', 'spin_slash', 'dodge'],
    hoja_veneno: ['spin_slash', 'thrust_lunge', 'punch'],
    nova: ['nova', 'explos', 'blast'],
    jump: ['salto', 'acrobat', 'jump'],
    dodge: ['dodge', 'esquiv', 'roll', 'rodar', 'dash', 'salto', 'acrobat', 'jump'],
    victory: ['victoria', 'victory', 'postura de victoria', 'win']
  };
  // Duración de cada acción de un solo uso (segundos) y tiempo en que bloquea el movimiento
  // (los bloqueos de las habilidades son los mismos que en js/combat.js; las pruebas lo comprueban)
  const ONE_SHOT = {
    attack: { lock: 1.00 },
    sismo: { lock: 1.80 },
    nova: { lock: 1.65 },
    tajo: { lock: 1.60 },
    estocada: { lock: 1.40 },
    ascendente: { lock: 1.50 },
    hendidura: { lock: 1.65 },
    contraataque: { lock: 1.50 },
    torbellino: { lock: 2.00 },
    voltereta: { lock: 1.50 },
    tornillo: { lock: 2.20 },
    disparo: { lock: 1.25 },
    suspension: { lock: 2.30 },
    corte_cruzado: { lock: 1.50 },
    rafaga: { lock: 1.40 },
    furia: { lock: 1.55 },
    escudo_espiritu: { lock: 1.50 },
    salto_demoledor: { lock: 1.90 },
    lluvia_proyectiles: { lock: 1.85 },
    juicio_relampago: { lock: 1.75 },
    sentencia_titan: { lock: 2.00 },
    bola_fuego: { lock: 1.20 },
    lanza_hielo: { lock: 1.20 },
    ventisca_glacial: { lock: 1.50 },
    tormenta_fuego: { lock: 1.55 },
    rayo_arcano: { lock: 1.45 },
    orbe_arcano: { lock: 1.00 },
    flecha_perforante: { lock: 1.40 },
    trampa_espinas: { lock: 1.25 },
    escudo_mana: { lock: 1.20 },
    paso_sombrio: { lock: 1.20 },
    hoja_veneno: { lock: 1.30 },
    jump: { lock: 0.0 },
    dodge: { lock: 0.0 },
    victory: { lock: 0.0 }
  };
  // Gestos del avatar de respaldo (sin GLB): vueltas sobre sí mismo, salto, tiro con arco y conjuros elementales
  const GESTO = {
    tajo: { vueltas: 1 }, torbellino: { vueltas: 2 }, tornillo: { vueltas: 3, salto: 1.2 },
    voltereta: { salto: 1.2 }, suspension: { salto: 1.4, arco: true }, disparo: { arco: true },
    corte_cruzado: { vueltas: 1 }, rafaga: { conjuro: true }, furia: { vueltas: 1 },
    escudo_espiritu: { salto: 0.45 }, salto_demoledor: { salto: 1.6 },
    juicio_relampago: { vueltas: 2, salto: 0.8 }, sentencia_titan: { salto: 1.8, conjuro: true },
    bola_fuego: { conjuro: true }, lanza_hielo: { conjuro: true },
    ventisca_glacial: { salto: 0.5, conjuro: true }, tormenta_fuego: { salto: 0.7, conjuro: true }, rayo_arcano: { salto: 0.6, conjuro: true },
    orbe_arcano: { conjuro: true }, flecha_perforante: { arco: true }, trampa_espinas: { arco: true },
    escudo_mana: { salto: 0.35, conjuro: true }, paso_sombrio: { vueltas: 1 }, hoja_veneno: { vueltas: 1 }
  };

  // Animación corporal especial procedimental por habilidad (complementa e independiza del clip del estudio)
  const SKILL_MOTION = {
    corte_cruzado:   { dur: 1.50, tipo: 'corte_cruzado' },
    tajo:            { dur: 1.60, tipo: 'giro', vueltas: 1, salto: 0.65, inclinacion: 0.24 },
    torbellino:      { dur: 2.00, tipo: 'giro', vueltas: 2.5, salto: 0.55, inclinacion: 0.28 },
    furia:           { dur: 1.55, tipo: 'furia' },
    ascendente:      { dur: 1.50, tipo: 'ascendente' },
    hendidura:       { dur: 1.65, tipo: 'hendidura' },
    contraataque:    { dur: 1.50, tipo: 'contraataque' },
    escudo_espiritu: { dur: 1.50, tipo: 'bastion' },
    sismo:           { dur: 1.80, tipo: 'salto_golpe', altura: 1.75, tPico: 0.45, tImpacto: 0.79, avance: 0.45 },
    salto_demoledor: { dur: 1.90, tipo: 'salto_golpe', altura: 2.45, tPico: 0.42, tImpacto: 0.69, avance: 0.95, giroAire: 1 },
    sentencia_titan: { dur: 2.00, tipo: 'titan' },
    nova:            { dur: 1.65, tipo: 'nova' },
    estocada:        { dur: 1.40, tipo: 'estocada' },
    paso_sombrio:    { dur: 1.20, tipo: 'estocada' },
    hoja_veneno:     { dur: 1.30, tipo: 'corte_cruzado' },
    voltereta:       { dur: 1.50, tipo: 'salto_golpe', altura: 1.50, tPico: 0.45, tImpacto: 0.83, avance: 0.75, giroAire: 1 },
    tornillo:        { dur: 2.20, tipo: 'giro', vueltas: 2, salto: 1.15, inclinacion: 0.22 },
    juicio_relampago:{ dur: 1.75, tipo: 'giro', vueltas: 2, salto: 1.15, inclinacion: 0.22 },
    rafaga:          { dur: 1.40, tipo: 'furia' },
    bola_fuego:      { dur: 1.20, tipo: 'conjuro' },
    lanza_hielo:     { dur: 1.20, tipo: 'conjuro' },
    orbe_arcano:     { dur: 1.00, tipo: 'conjuro' },
    ventisca_glacial:{ dur: 1.50, tipo: 'conjuro' },
    tormenta_fuego:  { dur: 1.55, tipo: 'conjuro' },
    rayo_arcano:     { dur: 1.45, tipo: 'conjuro' },
    escudo_mana:     { dur: 1.20, tipo: 'conjuro' }
  };

  function _smooth01(a, b, x) {
    const u = Math.max(0, Math.min(1, (x - a) / Math.max(1e-5, b - a)));
    return u * u * (3 - 2 * u);
  }

  function _evaluarMovimientoHabilidad(cfg, t) {
    const out = { dy: 0, dz: 0, rx: 0, ry: 0, rz: 0, sx: 1, sy: 1, sz: 1 };
    const endFade = t > 0.86 ? 1 - _smooth01(0.86, 1.0, t) : 1;
    const pi = Math.PI;
    switch (cfg.tipo) {
      case 'corte_cruzado': {
        if (t < 0.48) {
          const u = t / 0.48;
          const s = Math.sin(u * pi);
          out.dy = 0.26 * s;
          out.dz = 0.88 * Math.sin(Math.min(1, u * 1.15) * pi * 0.5) * (1 - _smooth01(0.36, 0.48, t) * 0.45);
          out.rz = -0.32 * s;
          out.ry = 0.58 * s;
          out.rx = 0.22 * s;
        } else {
          const u = (t - 0.48) / 0.52;
          const s = Math.sin(u * pi);
          out.dy = 0.48 * s;
          out.dz = (0.48 + 0.58 * Math.sin(Math.min(1, u * 1.1) * pi)) * endFade;
          out.rz = 0.34 * s;
          out.ry = -0.78 * s;
          out.rx = 0.26 * s;
          const sq = t > 0.82 ? Math.sin(((t - 0.82) / 0.18) * pi) : 0;
          out.sy = 1 - 0.08 * sq;
          out.sx = out.sz = 1 + 0.05 * sq;
        }
        break;
      }
      case 'giro': {
        const vueltasTot = Math.ceil(cfg.vueltas || 1);
        const uGiro = _smooth01(0.06, 0.96, t);
        out.ry = vueltasTot * pi * 2 * uGiro;
        if (t < 0.10) {
          out.dy = -0.14 * (t / 0.10);
        } else {
          const uAir = (t - 0.10) / 0.84;
          if (uAir <= 1) out.dy = (cfg.salto || 0.6) * Math.sin(uAir * pi);
        }
        out.rx = (cfg.inclinacion || 0.22) * Math.sin(t * pi);
        out.sx = out.sz = 1 + 0.06 * Math.sin(t * pi);
        break;
      }
      case 'furia': {
        if (t < 0.42) {
          const u = t / 0.42;
          out.dy = -0.18 * u;
          out.dz = -0.32 * u;
          out.rx = -0.34 * u;
          out.rz = Math.sin(t * 75) * 0.14 * u;
        } else if (t < 0.72) {
          const u = (t - 0.42) / 0.30;
          const s = Math.sin(u * pi);
          out.dz = -0.32 + 1.48 * _smooth01(0, 0.75, u);
          out.dy = 0.45 * s;
          out.rx = -0.34 + 0.82 * _smooth01(0, 0.7, u);
          out.rz = 0.28 * s;
          out.ry = -0.45 * s;
          out.sx = out.sz = 1 + 0.10 * s;
          out.sy = 1 + 0.07 * s;
        } else {
          const k = 1 - _smooth01(0.72, 1.0, t);
          out.dz = 1.16 * k;
          out.rx = 0.48 * k;
          const sq = Math.sin(((t - 0.72) / 0.28) * pi);
          out.sy = 1 - 0.08 * sq;
          out.sx = out.sz = 1 + 0.05 * sq;
        }
        break;
      }
      case 'ascendente': {
        if (t < 0.28) {
          const u = _smooth01(0, 0.28, t);
          out.dy = -0.18 * u;
          out.rx = 0.28 * u;
        } else {
          const u = (t - 0.28) / 0.72;
          const arc = Math.sin(u * pi);
          out.dy = 1.28 * arc;
          out.dz = 0.56 * arc;
          out.rx = -0.38 * arc;
          out.ry = 0.62 * arc;
        }
        break;
      }
      case 'hendidura': {
        if (t < 0.48) {
          const u = t / 0.48;
          out.dy = 1.26 * Math.sin(u * pi * 0.5);
          out.dz = -0.16 * Math.sin(u * pi * 0.5);
          out.rx = -0.42 * _smooth01(0, 0.85, u);
        } else if (t < 0.72) {
          const u = (t - 0.48) / 0.24;
          out.dy = 1.26 * (1 - u * u);
          out.dz = -0.16 + 0.92 * _smooth01(0, 1, u);
          out.rx = -0.42 + 0.90 * _smooth01(0, 1, u);
        } else {
          const u = (t - 0.72) / 0.28;
          const sq = Math.sin(u * pi);
          out.dz = 0.76 * (1 - _smooth01(0, 1, u));
          out.rx = 0.48 * (1 - _smooth01(0, 1, u));
          out.sy = 1 - 0.14 * sq;
          out.sx = out.sz = 1 + 0.09 * sq;
        }
        break;
      }
      case 'contraataque': {
        if (t < 0.68) {
          const u = _smooth01(0, 0.22, t);
          const settle = 1 - _smooth01(0.58, 0.68, t) * 0.2;
          out.dy = -0.14 * u * settle;
          out.dz = -0.24 * u;
          out.ry = -0.58 * u;
          out.rz = 0.16 * u;
        } else if (t < 0.92) {
          const u = (t - 0.68) / 0.24;
          const s = Math.sin(u * pi);
          out.dz = -0.24 + 1.36 * _smooth01(0, 0.78, u);
          out.dy = 0.38 * s;
          out.ry = -0.58 + 1.24 * _smooth01(0, 0.85, u);
          out.rx = 0.34 * s;
        } else {
          const k = 1 - _smooth01(0.92, 1.0, t);
          out.dz = 1.12 * k;
          out.ry = 0.66 * k;
        }
        break;
      }
      case 'bastion': {
        const up = Math.sin(Math.min(1, t / 0.62) * pi);
        out.dy = 0.56 * Math.max(0, up);
        out.dz = 0.72 * Math.sin(_smooth01(0.12, 0.88, t) * pi);
        out.rx = 0.25 * Math.sin(_smooth01(0.18, 0.82, t) * pi);
        if (t > 0.55) {
          const sq = Math.sin(_smooth01(0.55, 0.90, t) * pi);
          out.sy = 1 - 0.11 * sq;
          out.sx = out.sz = 1 + 0.07 * sq;
        }
        break;
      }
      case 'salto_golpe': {
        const tImp = cfg.tImpacto || 0.74;
        const tPico = cfg.tPico || 0.44;
        const alt = cfg.altura || 1.8;
        const av = cfg.avance || 0.6;
        if (t < 0.10) {
          out.dy = -0.18 * (t / 0.10);
          out.sy = 1 - 0.08 * (t / 0.10);
        } else if (t < tImp) {
          const u = (t - 0.10) / Math.max(0.05, tImp - 0.10);
          const pNorm = Math.max(0.15, Math.min(0.85, (tPico - 0.10) / Math.max(0.05, tImp - 0.10)));
          const exp = Math.log(0.5) / Math.log(pNorm);
          out.dy = alt * Math.sin(Math.pow(u, exp) * pi);
          out.dz = av * Math.sin(u * pi * 0.5);
          if (cfg.giroAire) out.rx = pi * 2 * cfg.giroAire * _smooth01(0.02, 0.98, u);
          else out.rx = -0.24 * Math.sin(u * pi);
        } else {
          const u = (t - tImp) / Math.max(0.05, 1 - tImp);
          const sq = Math.sin(u * pi);
          out.dz = av * (1 - _smooth01(0, 1, u));
          out.sy = 1 - 0.20 * sq;
          out.sx = out.sz = 1 + 0.14 * sq;
          out.rx = 0.30 * (1 - _smooth01(0, 1, u));
        }
        break;
      }
      case 'titan': {
        if (t < 0.10) {
          out.dy = -0.22 * (t / 0.10);
          out.sy = 1 - 0.10 * (t / 0.10);
        } else if (t < 0.60) {
          const u = _smooth01(0.10, 0.56, t);
          out.dy = 2.65 * u;
          out.ry = pi * 2 * _smooth01(0.10, 0.74, t);
          out.rx = -0.22 * u;
          const sc = 1 + 0.10 * u;
          out.sx = out.sy = out.sz = sc;
        } else if (t < 0.75) {
          const u = (t - 0.60) / 0.15;
          const fall = u * u;
          out.dy = 2.65 * (1 - fall);
          out.dz = 0.88 * u;
          out.ry = pi * 2 * _smooth01(0.10, 0.74, t);
          out.rx = -0.22 + 0.68 * u;
          const sc = 1.10 - 0.10 * fall;
          out.sx = out.sy = out.sz = sc;
        } else {
          const u = (t - 0.75) / 0.25;
          const sq = Math.sin(u * pi);
          out.dz = 0.88 * (1 - _smooth01(0, 1, u));
          out.rx = 0.46 * (1 - _smooth01(0, 1, u));
          out.sy = 1 - 0.22 * sq;
          out.sx = out.sz = 1 + 0.18 * sq;
        }
        break;
      }
      case 'nova': {
        const s = Math.sin(t * pi);
        out.dy = 1.05 * s;
        out.ry = pi * 2 * _smooth01(0.08, 0.92, t);
        const sc = 1 + 0.14 * s;
        out.sx = out.sy = out.sz = sc;
        break;
      }
      case 'estocada': {
        if (t < 0.25) {
          const u = t / 0.25;
          out.dz = -0.22 * u;
          out.dy = -0.10 * u;
        } else if (t < 0.62) {
          const u = (t - 0.25) / 0.37;
          out.dz = -0.22 + 1.55 * _smooth01(0, 0.82, u);
          out.dy = 0.24 * Math.sin(u * pi);
          out.rx = 0.34 * Math.sin(u * pi * 0.85);
        } else {
          const k = 1 - _smooth01(0.62, 1.0, t);
          out.dz = 1.33 * k;
          out.rx = 0.28 * k;
        }
        break;
      }
      case 'conjuro':
      default: {
        const s = Math.sin(t * pi);
        out.dy = 0.36 * s;
        out.dz = 0.34 * s;
        out.rx = 0.18 * s;
        const sc = 1 + 0.06 * s;
        out.sx = out.sy = out.sz = sc;
        break;
      }
    }
    return out;
  }

  // Índice de la primera animación cuyo nombre contiene alguna palabra clave; -1 si no hay
  function findClipIndex(names, keywords) {
    return names.findIndex(n => keywords.some(k => n.toLowerCase().includes(k)));
  }

  function getColliders(world, x, z) {
    return typeof world.getColliders === 'function' ? world.getColliders(x, z) : (world.colliders || []);
  }

  // Empuja el punto (rx, rz) fuera de un rectángulo girado
  function pushOutOfOBB(c, rx, rz, r) {
    const dx = rx - c.cx, dz = rz - c.cz;
    const u = dx * c.ux + dz * c.uz;
    const v = -dx * c.uz + dz * c.ux;
    const cu = Math.max(-c.hu, Math.min(u, c.hu));
    const cv = Math.max(-c.hv, Math.min(v, c.hv));
    const du = u - cu, dv = v - cv;
    const d2 = du * du + dv * dv;
    if (d2 >= r * r) return null;
    if (d2 < 0.0001) return null; // dentro: lo gestiona el llamador
    const d = Math.sqrt(d2);
    const ov = (r - d) / d;
    const pu = du * ov, pv = dv * ov;
    return { x: rx + pu * c.ux - pv * c.uz, z: rz + pu * c.uz + pv * c.ux };
  }

  class CharacterController {
    /**
     * opts: {
     *   scene, camera, controls, world,
     *   joystick: { zone, knob }   (opcional, joystick táctil),
     *   status: HTMLElement        (opcional, texto de estado del GLB),
     *   glbUrl: './personaje.glb'  (opcional)
     * }
     */
    constructor(opts) {
      this.scene = opts.scene;
      this.camera = opts.camera;
      this.controls = opts.controls;
      this.world = opts.world;
      this.status = opts.status || null;

      this.root = new THREE.Group();
      this.root.rotation.order = 'YXZ';   // evita inversión Euler (π, π - y, π) al girar más de ±90° en Y
      this.root.position.set(0, 0.5, 10);
      this.scene.add(this.root);

      this.model = null;
      this.mixer = null;
      this.actions = { idle: null, walk: null, run: null };
      this.currentAction = null;
      this.activeState = 'idle';
      this.isFallbackAvatar = false;
      this.fallbackLimbs = {};

      this.radius = 0.5;
      this.walkSpeed = WALK_SPEED;
      this.runSpeed = RUN_SPEED;
      this.keys = { forward: false, backward: false, left: false, right: false, shift: false };
      this.joyVec = { x: 0, y: 0 };
      this.cameraMode = 'free';
      // Modo seguir: la cámara guarda su desfase respecto al personaje (lo que el usuario ha girado y alejado con
      // el ratón) y va con él cada fotograma. Quien dibuja llama a encuadrar(recortar) tras controls.update().
      this.offsetCamara = null;      // desfase deseado (antes de apartarla de muros y suelo)
      this.camaraFinal = null;       // dónde quedó la cámara al final del fotograma anterior
      this.modoCamaraAnterior = 'free';
      this.oneShots = {};
      this.oneShotKind = null;
      this.oneShotUntil = 0;     // tiempo (segundos de reloj) en que termina la acción de un solo uso
      this.lockUntil = 0;        // mientras dure, el personaje no se mueve
      this.alCargarModelo = null; // función(modelo) que se llama al cargar un GLB (p. ej. para retocar sus materiales)
      this.destino = null;       // { x, z, parar }: camina solo hasta ese punto (p. ej. hacia un monstruo)
      this.cancelado = false;    // true cuando el jugador mueve al personaje y se cancela el destino
      this.tiempo = 0;           // reloj propio del personaje (segundos acumulados)
      this.fallbackAct = null;   // { kind, start, duration } para el avatar de respaldo
      this.dodgeState = null;    // { dirX, dirZ, elapsed, duration, speed } durante una esquiva activa
      this._baseModelY = 0;
      this._baseModelScale = 1;
      this._skillAnim = null;
      this._limpiarAutoEstado();

      this.initInput();
      if (opts.joystick && opts.joystick.zone && opts.joystick.knob) {
        this.initTouchJoystick(opts.joystick.zone, opts.joystick.knob);
      }
      this.buildFallbackAvatar();
      if (opts.glbUrl !== null) this.loadGLB(opts.glbUrl || './personaje.glb');
    }

    setStatus(text, color) {
      if (!this.status) return;
      this.status.style.color = color;
      this.status.textContent = text;
    }

    initInput() {
      window.addEventListener('keydown', (e) => this.onKey(e.code, true));
      window.addEventListener('keyup', (e) => this.onKey(e.code, false));
    }

    onKey(code, pressed) {
      if (code === 'KeyW' || code === 'ArrowUp') this.keys.forward = pressed;
      if (code === 'KeyS' || code === 'ArrowDown') this.keys.backward = pressed;
      if (code === 'KeyA' || code === 'ArrowLeft') this.keys.left = pressed;
      if (code === 'KeyD' || code === 'ArrowRight') this.keys.right = pressed;
      if (code === 'ShiftLeft' || code === 'ShiftRight') this.keys.shift = pressed;
    }

    initTouchJoystick(zone, knob) {
      let active = false;
      const maxR = 36;

      const handleMove = (clientX, clientY) => {
        const rect = zone.getBoundingClientRect();
        const cx = rect.left + rect.width * 0.5;
        const cy = rect.top + rect.height * 0.5;
        let dx = clientX - cx;
        let dy = clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist > maxR) {
          dx = (dx / dist) * maxR;
          dy = (dy / dist) * maxR;
        }
        knob.style.transform = `translate(${dx}px, ${dy}px)`;
        this.joyVec.x = dx / maxR;
        this.joyVec.y = dy / maxR;
      };

      const resetJoy = () => {
        active = false;
        knob.style.transform = 'translate(0px, 0px)';
        this.joyVec.x = 0;
        this.joyVec.y = 0;
      };

      zone.addEventListener('pointerdown', (e) => {
        active = true;
        zone.setPointerCapture(e.pointerId);
        handleMove(e.clientX, e.clientY);
      });
      zone.addEventListener('pointermove', (e) => {
        if (active) handleMove(e.clientX, e.clientY);
      });
      zone.addEventListener('pointerup', resetJoy);
      zone.addEventListener('pointercancel', resetJoy);
    }

    clearCurrentModel() {
      if (this.model) {
        this.root.remove(this.model);
        this.model.traverse(child => {
          if (child.isMesh && child.geometry) child.geometry.dispose();
        });
        this.model = null;
      }
      if (this.mixer) {
        this.mixer.stopAllAction();
        this.mixer = null;
      }
      this.actions = { idle: null, walk: null, run: null };
      this.currentAction = null;
    }

    buildFallbackAvatar() {
      this.clearCurrentModel();
      this.isFallbackAvatar = true;

      const group = new THREE.Group();
      const matArmor = new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.35, metalness: 0.6 });
      const matSkin = new THREE.MeshStandardMaterial({ color: '#fcd34d', roughness: 0.6 });
      const matDark = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.8 });

      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.64, 0.26), matArmor);
      torso.position.y = 1.1; torso.castShadow = true;
      group.add(torso);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.32), matSkin);
      head.position.y = 1.72; head.castShadow = true;
      group.add(head);

      const legGeo = new THREE.BoxGeometry(0.18, 0.65, 0.20);
      legGeo.translate(0, -0.35, 0);
      const leftLeg = new THREE.Mesh(legGeo, matDark);
      leftLeg.position.set(-0.15, 0.72, 0); leftLeg.castShadow = true;
      const rightLeg = new THREE.Mesh(legGeo, matDark);
      rightLeg.position.set(0.15, 0.72, 0); rightLeg.castShadow = true;

      const armGeo = new THREE.BoxGeometry(0.18, 0.62, 0.2);
      armGeo.translate(0, -0.28, 0);
      const leftArm = new THREE.Mesh(armGeo, matArmor);
      leftArm.position.set(-0.38, 1.4, 0); leftArm.castShadow = true;
      const rightArm = new THREE.Mesh(armGeo, matArmor);
      rightArm.position.set(0.38, 1.4, 0); rightArm.castShadow = true;

      group.add(leftLeg, rightLeg, leftArm, rightArm);
      this.fallbackLimbs = { leftLeg, rightLeg, leftArm, rightArm };
      this.model = group;
      this._baseModelY = 0;
      this._baseModelScale = 1;
      this._skillAnim = null;
      this.root.add(group);
    }

    _instalarGLTF(gltf, labelName) {
      this.clearCurrentModel();
      this.isFallbackAvatar = false;
      this.model = gltf.scene;

      const box = new THREE.Box3().setFromObject(this.model);
      const size = new THREE.Vector3();
      box.getSize(size);
      if (size.y > 0.01) {
        this.model.scale.setScalar(1.85 / size.y);
      }
      const scaledBox = new THREE.Box3().setFromObject(this.model);
      this.model.position.y = -scaledBox.min.y;
      this._baseModelScale = this.model.scale.x || 1;
      this._baseModelY = this.model.position.y || 0;
      this._skillAnim = null;

      this.model.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      this.root.add(this.model);
      if (this.alCargarModelo) this.alCargarModelo(this.model);

      const clips = gltf.animations || [];
      if (clips.length > 0) {
        this.mixer = new THREE.AnimationMixer(this.model);
        const names = clips.map(c => c.name);
        const pick = (kind, fallbackIdx) => {
          const i = findClipIndex(names, CLIP_KEYWORDS[kind]);
          return clips[i >= 0 ? i : fallbackIdx];
        };
        this.actions.idle = this.mixer.clipAction(pick('idle', 0));
        this.actions.walk = this.mixer.clipAction(pick('walk', Math.min(1, clips.length - 1)));
        this.actions.run = this.mixer.clipAction(pick('run', Math.min(2, clips.length - 1)));
        // Acciones de un solo uso: si el GLB no trae clip específico, usa attack para no congelarse en idle
        this.oneShots = {};
        Object.keys(ONE_SHOT).forEach(kind => {
          const i = findClipIndex(names, CLIP_KEYWORDS[kind]);
          if (i >= 0) {
            const action = this.mixer.clipAction(clips[i]);
            action.setLoop(THREE.LoopOnce, 1);
            action.clampWhenFinished = true;
            this.oneShots[kind] = { action, duration: clips[i].duration };
          }
        });
        const fallbackAttack = this.oneShots.attack;
        if (fallbackAttack) {
          Object.keys(ONE_SHOT).forEach(kind => {
            if (!this.oneShots[kind] && kind !== 'victory' && kind !== 'jump' && kind !== 'dodge') {
              this.oneShots[kind] = {
                action: fallbackAttack.action,
                duration: fallbackAttack.duration,
                fallbackClip: true
              };
            }
          });
        }

        this.currentAction = this.actions.idle;
        this.currentAction.play();
        this.setStatus(`GLB activo (${clips.length} clips cargados)`, '#4ade80');
      } else {
        this.setStatus('GLB cargado (sin animaciones internas).', '#facc15');
      }
    }

    loadGLBBuffer(buffer, labelName = 'personaje') {
      this.setStatus(`Cargando ${labelName}...`, '#38bdf8');
      const loader = new THREE.GLTFLoader();
      loader.parse(
        buffer,
        '',
        (gltf) => this._instalarGLTF(gltf, labelName),
        () => {
          if (!this.model) this.buildFallbackAvatar();
          this.setStatus('Avatar integrado activo. Usa "Archivo .GLB" para elegir tu personaje.glb.', '#fb923c');
        }
      );
    }

    loadGLB(url, labelName = url) {
      this.setStatus(`Cargando ${labelName}...`, '#38bdf8');

      const loader = new THREE.GLTFLoader();
      loader.load(
        url,
        (gltf) => this._instalarGLTF(gltf, labelName),
        undefined,
        () => {
          if (!this.model) this.buildFallbackAvatar();
          this.setStatus('Avatar integrado activo. Usa "Archivo .GLB" para elegir tu personaje.glb.', '#fb923c');
        }
      );
    }

    // Gestos de respaldo para el avatar sin animaciones
    applyFallbackAct(elapsedTime) {
      const f = this.fallbackAct, L = this.fallbackLimbs;
      const t = Math.min(1, (elapsedTime - f.start) / f.duration);
      const swing = Math.sin(t * Math.PI);
      L.leftLeg.rotation.x = 0; L.rightLeg.rotation.x = 0;
      L.leftArm.rotation.x = 0; L.rightArm.rotation.x = 0;
      this.model.rotation.y = 0; this.model.position.y = 0;
      if (f.kind === 'attack') L.rightArm.rotation.x = -2.2 * swing;
      if (f.kind === 'sismo') {   // salta con los brazos arriba y cae golpeando el suelo
        const subida = t < 0.45 ? t / 0.45 : 1;
        this.model.position.y = t < 0.45 ? 0.9 * Math.sin(subida * Math.PI * 0.85) : 0;
        L.leftArm.rotation.x = L.rightArm.rotation.x = t < 0.45 ? -2.6 * subida : -2.6 + 3.2 * Math.min(1, (t - 0.45) / 0.15);
      }
      if (f.kind === 'nova') { const s = 1 + 0.25 * swing; this.model.scale.set(s, s, s); } else if (this.model.scale.x !== 1) this.model.scale.set(1, 1, 1);
      if (f.kind === 'jump') this.model.position.y = 1.2 * swing;
      if (f.kind === 'dodge') {
        this.model.position.y = 0.55 * swing;
        L.leftLeg.rotation.x = 0.65 * swing;
        L.rightLeg.rotation.x = -0.55 * swing;
        L.leftArm.rotation.x = -0.8 * swing;
        L.rightArm.rotation.x = -0.8 * swing;
      }
      const gesto = GESTO[f.kind];
      if (gesto || (ONE_SHOT[f.kind] && !['attack', 'sismo', 'nova', 'jump', 'dodge', 'victory'].includes(f.kind))) {
        const g = gesto || {};
        if (g.vueltas) this.model.rotation.y = t * Math.PI * 2 * g.vueltas;
        if (g.salto) this.model.position.y = g.salto * swing;
        if (g.arco) { L.leftArm.rotation.x = -1.5; L.rightArm.rotation.x = -1.5 * (1 - swing); }
        else if (g.conjuro) { L.leftArm.rotation.x = -2.1 * swing; L.rightArm.rotation.x = -2.1 * swing; }
        else L.rightArm.rotation.x = -2.2 * swing;
      }
      if (f.kind === 'victory') { L.leftArm.rotation.x = -2.6; L.rightArm.rotation.x = -2.6; }
    }

    // Vector frontal unitario real en el plano XZ directamente desde el cuaternión (inmune a volteos Euler)
    frente() {
      const q = this.root.quaternion;
      const fx = 2 * (q.x * q.z + q.w * q.y);
      const fz = 1 - 2 * (q.x * q.x + q.y * q.y);
      const len = Math.hypot(fx, fz) || 1;
      return { x: fx / len, z: fz / len };
    }

    anguloY() {
      const f = this.frente();
      return Math.atan2(f.x, f.z);
    }

    mirarAngulo(yaw) {
      this.root.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    }

    mirarHacia(dx, dz) {
      if (dx * dx + dz * dz > 1e-8) this.mirarAngulo(Math.atan2(dx, dz));
    }

    tieneEntradaManual() {
      const kbX = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0);
      const kbZ = (this.keys.backward ? 1 : 0) - (this.keys.forward ? 1 : 0);
      const moveX = kbX !== 0 ? kbX : this.joyVec.x;
      const moveZ = kbZ !== 0 ? kbZ : this.joyVec.y;
      return Math.hypot(moveX, moveZ) > 0.08;
    }

    _resetModelPose() {
      if (!this.model) return;
      const baseY = this._baseModelY || 0;
      const baseScale = this._baseModelScale || 1;
      if (this.model.position && typeof this.model.position.set === 'function') {
        this.model.position.set(0, baseY, 0);
      } else if (this.model.position) {
        this.model.position.x = 0;
        this.model.position.y = baseY;
        this.model.position.z = 0;
      }
      if (this.model.rotation) {
        this.model.rotation.x = 0;
        this.model.rotation.y = 0;
        this.model.rotation.z = 0;
      }
      if (this.model.scale && typeof this.model.scale.set === 'function') {
        this.model.scale.set(baseScale, baseScale, baseScale);
      } else if (this.model.scale) {
        this.model.scale.x = baseScale;
        this.model.scale.y = baseScale;
        this.model.scale.z = baseScale;
      }
    }

    _aplicarAnimacionHabilidad() {
      if (!this._skillAnim || !this.model) return;
      const elapsed = this.tiempo - this._skillAnim.start;
      if (elapsed >= this._skillAnim.duration) {
        this._skillAnim = null;
        this._resetModelPose();
        return;
      }
      const t = Math.max(0, Math.min(1, elapsed / Math.max(1e-5, this._skillAnim.duration)));
      const m = _evaluarMovimientoHabilidad(this._skillAnim.cfg, t);
      const baseY = this._baseModelY || 0;
      const baseScale = this._baseModelScale || 1;
      if (this.model.position && typeof this.model.position.set === 'function') {
        this.model.position.set(0, baseY + m.dy, m.dz);
      }
      if (this.model.rotation) {
        this.model.rotation.x = m.rx;
        this.model.rotation.y = m.ry;
        this.model.rotation.z = m.rz;
      }
      if (this.model.scale && typeof this.model.scale.set === 'function') {
        this.model.scale.set(baseScale * m.sx, baseScale * m.sy, baseScale * m.sz);
      }
    }

    _cortarOneShot(forzar = false) {
      if (this.activeState === 'oneshot' && (forzar || (this.oneShotKind !== 'jump' && this.oneShotKind !== 'dodge'))) {
        if (this.currentAction) this.currentAction.fadeOut(0.12);
        this.activeState = 'none';
        this.oneShotKind = null;
        this.oneShotUntil = 0;
      }
      if (this.fallbackAct && (forzar || (this.fallbackAct.kind !== 'jump' && this.fallbackAct.kind !== 'dodge'))) {
        this.fallbackAct = null;
        this._resetModelPose();
      }
      if (this._skillAnim && (forzar || (this._skillAnim.kind !== 'jump' && this._skillAnim.kind !== 'dodge'))) {
        this._skillAnim = null;
        this._resetModelPose();
      }
    }

    getMoveInputDir() {
      const kbX = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0);
      const kbZ = (this.keys.backward ? 1 : 0) - (this.keys.forward ? 1 : 0);
      const moveX = kbX !== 0 ? kbX : this.joyVec.x;
      const moveZ = kbZ !== 0 ? kbZ : this.joyVec.y;
      const mag = Math.hypot(moveX, moveZ);
      if (mag <= 0.08) return null;
      if (!this.camera) return { x: moveX / mag, z: moveZ / mag, mag };

      const camForward = new THREE.Vector3();
      this.camera.getWorldDirection(camForward);
      camForward.y = 0;
      if (camForward.lengthSq() < 1e-6) camForward.set(0, 0, -1);
      else camForward.normalize();

      const camRight = new THREE.Vector3().crossVectors(camForward, new THREE.Vector3(0, 1, 0)).normalize();
      const moveDir = new THREE.Vector3()
        .addScaledVector(camForward, -moveZ)
        .addScaledVector(camRight, moveX);
      if (moveDir.lengthSq() < 1e-6) return null;
      moveDir.normalize();
      return { x: moveDir.x, z: moveDir.z, mag };
    }

    isDodging() {
      return !!(this.dodgeState && this.dodgeState.elapsed < this.dodgeState.duration);
    }

    startDodge(opts = {}) {
      let dir = null;
      if (typeof opts.dirX === 'number' && typeof opts.dirZ === 'number') {
        const len = Math.hypot(opts.dirX, opts.dirZ);
        if (len > 1e-6) dir = { x: opts.dirX / len, z: opts.dirZ / len };
      }
      if (!dir) dir = this.getMoveInputDir() || this.frente();

      this.lockUntil = 0;
      this.destino = null;
      this._cortarOneShot(true);
      this.mirarHacia(dir.x, dir.z);

      this.dodgeState = {
        dirX: dir.x,
        dirZ: dir.z,
        elapsed: 0,
        duration: opts.duration || 0.34,
        speed: opts.speed || 22.0
      };
      this.playOneShot('dodge');
      return { dirX: dir.x, dirZ: dir.z };
    }

    switchAnimation(nextState) {
      if (this.activeState === nextState) return;
      this.activeState = nextState;
      if (!this.mixer) return;
      const nextAction = this.actions[nextState];
      if (!nextAction) return;
      nextAction.enabled = true;
      nextAction.setEffectiveTimeScale(1);
      nextAction.setEffectiveWeight(1);
      if (nextAction !== this.currentAction) {
        nextAction.reset().fadeIn(0.15).play();
        if (this.currentAction) this.currentAction.fadeOut(0.15);
        this.currentAction = nextAction;
      } else if (!nextAction.isRunning()) {
        nextAction.reset().play();
      }
    }

    // Comprueba si (px, pz) cae en agua, pendiente inescalable desde (ox, oz) o colisionador cercano
    _puntoBloqueado(ox, oz, h0, px, pz, margenExtra) {
      const r = this.radius + (margenExtra || 0.25);
      if (this.world.isWaterHazard && this.world.isWaterHazard(px, pz, r)) return true;
      if (typeof this.world.getWalkableHeight === 'function') {
        const dHor = Math.hypot(px - ox, pz - oz);
        if (dHor > 0.05) {
          const hP = this.world.getWalkableHeight(px, pz);
          if ((hP - h0) / dHor > 0.49) return true;
          if (hP - h0 > 0.01 && typeof this.world.bloqueaSubida === 'function' && this.world.bloqueaSubida(ox, oz, px, pz)) return true;
        }
      }
      const cols = getColliders(this.world, px, pz);
      for (let i = 0; i < cols.length; i++) {
        const c = cols[i];
        if (c.type === 'circle') {
          const dx = px - c.x, dz = pz - c.z, md = r + c.r;
          if (dx * dx + dz * dz < md * md) return true;
        } else if (c.type === 'box') {
          if (px > c.minX - r && px < c.maxX + r && pz > c.minZ - r && pz < c.maxZ + r) return true;
        } else if (c.type === 'obb') {
          const dx = px - c.cx, dz = pz - c.cz;
          const u = dx * c.ux + dz * c.uz, v = -dx * c.uz + dz * c.ux;
          if (Math.abs(u) < c.hu + r && Math.abs(v) < c.hv + r) return true;
        }
      }
      return false;
    }

    _limpiarAutoEstado() {
      this._steerDir = 0;
      this._steerHold = 0;
      this._progKey = '';
      this._progBestDist = Infinity;
      this._progTimer = 0;
      this.sinAvance = 0;
    }

    _esRumboLibre(ox, oz, h0, dirX, dirZ, alcance, margenExtra) {
      const m = typeof margenExtra === 'number' ? margenExtra : 0.24;
      const d1 = Math.min(0.9, alcance * 0.36);
      if (this._puntoBloqueado(ox, oz, h0, ox + dirX * d1, oz + dirZ * d1, m)) return false;
      if (alcance > 1.0) {
        const d2 = alcance * 0.68;
        if (this._puntoBloqueado(ox, oz, h0, ox + dirX * d2, oz + dirZ * d2, m)) return false;
        if (this._puntoBloqueado(ox, oz, h0, ox + dirX * alcance, oz + dirZ * alcance, m + 0.04)) return false;
      }
      return true;
    }

    // Camina hacia this.destino hasta quedar a `parar` metros, rodeando obstáculos preventivamente
    caminarADestino(dt, enAccion) {
      const d = this.destino;
      const ox = this.root.position.x, oz = this.root.position.z;
      const dx = d.x - ox, dz = d.z - oz;
      const dist = Math.hypot(dx, dz);
      if (dist <= d.parar) {
        this._limpiarAutoEstado();
        if (!enAccion) this.switchAnimation('idle');
        return;
      }
      // En cuanto empieza a desplazarse tras el bloqueo del golpe, corta la cola del ataque para correr de verdad
      this._cortarOneShot();
      let ux = dx / dist, uz = dz / dist;
      const paso = Math.min(dist - d.parar, this.runSpeed * dt);   // hacia un objetivo se corre

      const destKey = Math.round(d.x * 2) + ',' + Math.round(d.z * 2);
      if (destKey !== this._progKey) {
        this._progKey = destKey;
        this._progBestDist = dist;
        this._progTimer = 0;
      }

      // Evasión anticipada con histéresis: evita rebotar al muro al instante de esquivarlo
      const alcanceSondeo = Math.min(3.0, Math.max(1.1, dist - d.parar));
      const h0 = typeof this.world.getWalkableHeight === 'function' ? this.world.getWalkableHeight(ox, oz) : 0;
      if (!this._esRumboLibre(ox, oz, h0, ux, uz, alcanceSondeo, 0.24)) {
        const angs = [0.35, 0.70, 1.05, 1.40, 1.57, 1.85, 2.15];
        let elegido = null;
        // Si ya hay un sentido de giro elegido, agota todos los ángulos de ese lado antes de cambiar de lado
        if (this._steerDir) {
          for (let i = 0; i < angs.length && !elegido; i++) {
            const ang = angs[i] * this._steerDir;
            const ca = Math.cos(ang), sa = Math.sin(ang);
            const sx = ux * ca - uz * sa, sz = ux * sa + uz * ca;
            if (this._esRumboLibre(ox, oz, h0, sx, sz, alcanceSondeo, 0.24)) {
              elegido = { x: sx, z: sz, signo: this._steerDir };
            }
          }
        }
        if (!elegido) {
          const orden = this._steerDir ? [-this._steerDir] : [1, -1];
          for (let i = 0; i < angs.length && !elegido; i++) {
            for (let s = 0; s < orden.length; s++) {
              const ang = angs[i] * orden[s];
              const ca = Math.cos(ang), sa = Math.sin(ang);
              const sx = ux * ca - uz * sa, sz = ux * sa + uz * ca;
              if (this._esRumboLibre(ox, oz, h0, sx, sz, alcanceSondeo, 0.24)) {
                elegido = { x: sx, z: sz, signo: orden[s] };
                break;
              }
            }
          }
        }
        if (elegido) {
          ux = elegido.x; uz = elegido.z;
          this._steerDir = elegido.signo;
          this._steerHold = 0.28;
        }
      } else if (this._steerHold > 0 && this._steerDir) {
        this._steerHold = Math.max(0, this._steerHold - dt);
        if (this._esRumboLibre(ox, oz, h0, ux, uz, alcanceSondeo, 0.42)) {
          this._steerHold = 0;
          this._steerDir = 0;
        } else {
          const ang = 0.35 * this._steerDir;
          const ca = Math.cos(ang), sa = Math.sin(ang);
          const sx = ux * ca - uz * sa, sz = ux * sa + uz * ca;
          if (this._esRumboLibre(ox, oz, h0, sx, sz, alcanceSondeo, 0.22)) {
            ux = sx; uz = sz;
          }
        }
      } else {
        this._steerDir = 0;
      }

      const antesX = ox, antesZ = oz;
      const resolved = this.resolveCollisions(ox + ux * paso, oz + uz * paso);
      this.root.position.x = resolved.x;
      this.root.position.z = resolved.z;
      const avanzado = Math.hypot(resolved.x - antesX, resolved.z - antesZ);
      const newDist = Math.hypot(d.x - resolved.x, d.z - resolved.z);
      if (newDist < this._progBestDist - 0.35) {
        this._progBestDist = newDist;
        this._progTimer = 0;
      } else {
        this._progTimer += dt;
      }
      // Parada en seco (> 1.3 s) o roce/oscilación sin acercarse de verdad al punto (> 2.3 s): marca atascado
      if (avanzado < Math.max(0.012, paso * 0.14)) this.sinAvance = (this.sinAvance || 0) + dt;
      else this.sinAvance = 0;
      if (this.sinAvance > 1.3 || this._progTimer > 2.3) {
        this.destino = null;
        this._limpiarAutoEstado();
        this.atascado = true;
      }
      this.root.position.y = this.world.getWalkableHeight(resolved.x, resolved.z);
      const objetivoGiro = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(ux, uz));
      this.root.quaternion.slerp(objetivoGiro, Math.min(1, dt * 14));
      if (this.activeState !== 'oneshot') this.switchAnimation('run');
    }

    resolveCollisions(nextX, nextZ) {
      let rx = nextX, rz = nextZ;
      const r = this.radius;

      // Agua: si el paso lleva al agua, se desliza por el borde (primero en X, luego en Z)
      if (this.world.isWaterHazard) {
        const water = (x, z) => this.world.isWaterHazard(x, z, r);
        const ox = this.root.position.x, oz = this.root.position.z;
        if (water(rx, rz)) {
          if (!water(rx, oz)) rz = oz;
          else if (!water(ox, rz)) rx = ox;
          else { rx = ox; rz = oz; }
        }
      }

      // Pendiente máxima escalable: 50% (desnivel / distancia horizontal > 0.50).
      // Impide escalar montañas o laderas de más del 50% de inclinación a pie.
      if (typeof this.world.getWalkableHeight === 'function') {
        const ox = this.root.position.x, oz = this.root.position.z;
        const h0 = this.world.getWalkableHeight(ox, oz);
        const MAX_PENDIENTE = 0.50; // 50% de desnivel

        const esInescalable = (x, z) => {
          const dx = x - ox, dz = z - oz;
          const dist = Math.hypot(dx, dz);
          if (dist < 0.001) return false;
          const hStep = this.world.getWalkableHeight(x, z);
          const dhStep = hStep - h0;
          if (dhStep > 0 && (dhStep / dist) > MAX_PENDIENTE) {
            // Sondeo a 0.8m para asegurar pendiente continua y no un bordillo de menos de 25cm
            const probeDist = Math.max(0.8, dist);
            const px = ox + (dx / dist) * probeDist;
            const pz = oz + (dz / dist) * probeDist;
            const hProbe = this.world.getWalkableHeight(px, pz);
            const dhProbe = hProbe - h0;
            if (dhProbe > 0 && (dhProbe / probeDist) > MAX_PENDIENTE) {
              return true;
            }
          }
          // Bloqueo extra del mundo (p. ej. recintos de laberinto): impide trepar paredes en diagonal
          if (dhStep > 0.01 && typeof this.world.bloqueaSubida === 'function' && this.world.bloqueaSubida(ox, oz, x, z)) {
            return true;
          }
          return false;
        };

        if (esInescalable(rx, rz)) {
          if (!esInescalable(rx, oz)) {
            rz = oz;
          } else if (!esInescalable(ox, rz)) {
            rx = ox;
          } else {
            rx = ox;
            rz = oz;
          }
        }
      }

      const cols = getColliders(this.world, rx, rz);
      for (let i = 0; i < cols.length; i++) {
        const c = cols[i];
        if (c.type === 'circle') {
          const dx = rx - c.x, dz = rz - c.z;
          const minDist = r + c.r;
          const distSq = dx * dx + dz * dz;
          if (distSq < minDist * minDist && distSq > 0.0001) {
            const dist = Math.sqrt(distSq);
            const push = (minDist - dist) / dist;
            rx += dx * push;
            rz += dz * push;
          }
        } else if (c.type === 'box') {
          const closestX = Math.max(c.minX, Math.min(rx, c.maxX));
          const closestZ = Math.max(c.minZ, Math.min(rz, c.maxZ));
          const dx = rx - closestX, dz = rz - closestZ;
          const distSq = dx * dx + dz * dz;
          if (distSq < r * r) {
            const dist = Math.sqrt(distSq);
            if (dist > 0.0001) {
              const overlap = r - dist;
              rx += (dx / dist) * overlap;
              rz += (dz / dist) * overlap;
            } else {
              rx = this.root.position.x;
              rz = this.root.position.z;
            }
          }
        } else if (c.type === 'obb') {
          const p = pushOutOfOBB(c, rx, rz, r);
          if (p) { rx = p.x; rz = p.z; }
        }
      }
      return { x: rx, z: rz };
    }

    // Coloca al personaje en (x, z) y, si la cámara sigue al personaje, la desplaza con él
    // Devuelve false si el punto no es caminable (agua)
    teleport(x, z) {
      if (this.world.isWaterHazard && this.world.isWaterHazard(x, z, this.radius)) return false;
      this.root.position.x = x;
      this.root.position.z = z;
      this.root.position.y = this.world.getWalkableHeight(x, z);
      this._limpiarAutoEstado();
      this._skillAnim = null;
      this._resetModelPose();
      if (this.cameraMode === 'follow') this.colocarCamara();
      return true;
    }

    // Cámara en modo seguir: el objetivo va al personaje y la cámara le acompaña con su desfase.
    // - Al entrar en el modo: el desfase que haya entre la cámara y el personaje.
    // - Si nadie la ha tocado desde el fotograma anterior: el desfase deseado (sin el recorte por muros y suelo).
    // - Si el ratón la ha movido entretanto (OrbitControls gira y acerca dentro del propio evento): lo que dejó.
    colocarCamara() {
      const t = this.controls.target, cam = this.camera.position, p = this.root.position;
      const nuevo = new THREE.Vector3(p.x, p.y + 1.4, p.z);
      let desfase;
      if (this.modoCamaraAnterior !== 'follow' || !this.offsetCamara) desfase = cam.clone().sub(nuevo);
      else if (this.camaraFinal && cam.distanceToSquared(this.camaraFinal) < 1e-6) desfase = this.offsetCamara.clone();
      else desfase = cam.clone().sub(t);
      t.copy(nuevo);
      cam.copy(nuevo).add(desfase);
    }

    // Final del fotograma, tras controls.update(): guarda el desfase que ha dejado el ratón, aparta la cámara de
    // muros y suelo con recortar() y anota dónde quedó. El recorte no se acumula: al dejar de estorbar, la cámara
    // vuelve a la distancia que elegiste.
    encuadrar(recortar) {
      if (this.cameraMode === 'follow') this.offsetCamara = this.camera.position.clone().sub(this.controls.target);
      if (recortar) recortar();
      this.camaraFinal = this.camera.position.clone();
    }

    // Reproduce una acción de un solo uso (ataque, impacto sísmico, nova, salto, victoria).
    // Si el GLB no la trae, el avatar de respaldo hace un gesto sencillo.
    // El tiempo lo lleva el propio personaje (suma de dt): no depende del reloj que pase quien llama
    playOneShot(kind) {
      const info = ONE_SHOT[kind];
      if (!info) return 0;
      const shot = this.oneShots[kind];
      const rawDuration = shot ? shot.duration : (kind === 'victory' ? 3 : 0.6);
      // Mantiene velocidades naturales y legibles para ataques y técnicas
      let escala = 1;
      if (shot && kind === 'disparo') {
        if (rawDuration > 2.2) escala = Math.min(1.25, rawDuration / 1.75);
        else escala = Math.min(0.95, Math.max(0.65, rawDuration / 1.65));
      } else if (shot && kind === 'attack') {
        escala = Math.min(0.95, Math.max(0.62, rawDuration / 1.30));
      } else if (shot && info.lock > 0) {
        const targetDur = Math.max(info.lock * 1.08, 1.55);
        escala = Math.min(0.82, Math.max(0.55, rawDuration / targetDur));
      }
      const duration = rawDuration / escala;
      if (info.lock > 0) this.lockUntil = this.tiempo + info.lock;
      this.oneShotKind = kind;
      this.oneShotUntil = this.tiempo + duration;
      const motionCfg = SKILL_MOTION[kind];
      if (motionCfg) {
        if (this._skillAnim) this._resetModelPose();
        this._skillAnim = { kind, cfg: motionCfg, start: this.tiempo, duration: motionCfg.dur };
      }
      if (shot && this.mixer) {
        shot.action.enabled = true;
        shot.action.setEffectiveTimeScale(escala);
        shot.action.setEffectiveWeight(1);
        shot.action.reset().fadeIn(0.14).play();
        if (this.currentAction && this.currentAction !== shot.action) this.currentAction.fadeOut(0.14);
        this.currentAction = shot.action;
        this.activeState = 'oneshot';
      } else {
        this.fallbackAct = { kind, start: this.tiempo, duration };
      }
      return duration;
    }

    update(dt) {
      this.tiempo += dt;
      // Al terminar una acción de un solo uso se vuelve a idle, andar o correr
      if (this.activeState === 'oneshot' && this.tiempo >= this.oneShotUntil) {
        this.activeState = 'none';
        this.oneShotKind = null;
      }
      if (this.fallbackAct && this.tiempo - this.fallbackAct.start >= this.fallbackAct.duration) this.fallbackAct = null;
      const locked = this.tiempo < this.lockUntil;
      // Mientras dura una acción de un solo uso no se cambia a idle
      const enAccion = this.activeState === 'oneshot' && this.tiempo < this.oneShotUntil;

      if (this.dodgeState) {
        this.dodgeState.elapsed += dt;
        const p = Math.min(1, this.dodgeState.elapsed / this.dodgeState.duration);
        const mult = 1.30 - 0.85 * p;
        const dist = this.dodgeState.speed * mult * dt;
        const steps = Math.max(1, Math.ceil(dist / 0.4));
        const stepDist = dist / steps;
        for (let s = 0; s < steps; s++) {
          const cx = this.root.position.x + this.dodgeState.dirX * stepDist;
          const cz = this.root.position.z + this.dodgeState.dirZ * stepDist;
          const resolved = this.resolveCollisions(cx, cz);
          this.root.position.x = resolved.x;
          this.root.position.z = resolved.z;
        }
        this.root.position.y = this.world.getWalkableHeight(this.root.position.x, this.root.position.z);
        if (this.dodgeState.elapsed >= this.dodgeState.duration) {
          this.dodgeState = null;
        }
      } else {
        const inputDir = this.getMoveInputDir();
        const mag = inputDir ? inputDir.mag : 0;
        // El jugador toma el control: se cancela el destino automático
        if (inputDir && this.destino) { this.destino = null; this.cancelado = true; this._limpiarAutoEstado(); }

        if (inputDir && !locked) {
          this._cortarOneShot();
          const isRunning = this.keys.shift || mag > 0.85;
          if (this.activeState !== 'oneshot') this.switchAnimation(isRunning ? 'run' : 'walk');
          const speed = (isRunning ? this.runSpeed : this.walkSpeed) * Math.min(1.0, mag);

          const targetAngle = Math.atan2(inputDir.x, inputDir.z);
          const targetQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetAngle);
          this.root.quaternion.slerp(targetQuat, Math.min(1, dt * 12));

          const candidateX = this.root.position.x + inputDir.x * speed * dt;
          const candidateZ = this.root.position.z + inputDir.z * speed * dt;
          const resolved = this.resolveCollisions(candidateX, candidateZ);

          this.root.position.x = resolved.x;
          this.root.position.z = resolved.z;

          this.root.position.y = this.world.getWalkableHeight(resolved.x, resolved.z);
        } else if (this.destino && !locked) {
          this.caminarADestino(dt, enAccion);
        } else {
          if (!enAccion && (!this.fallbackAct || this.fallbackAct.kind !== 'sismo')) this.switchAnimation('idle');
          this.root.position.y = this.world.getWalkableHeight(this.root.position.x, this.root.position.z);
        }
      }

      if (this.cameraMode === 'follow') this.colocarCamara();
      this.modoCamaraAnterior = this.cameraMode;

      // Desvanecimiento suave del avatar si la cámara está demasiado cerca (< 2.6m) para que NUNCA tape la pantalla
      if (this.camera && this.model) {
        const dCam = this.camera.position.distanceTo(this.root.position);
        const opacidad = dCam < 1.1 ? 0.0 : (dCam < 2.6 ? Math.max(0.08, (dCam - 1.1) / 1.5) : 1.0);
        this.model.traverse(child => {
          if (child.isMesh && child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach(m => {
              if (opacidad < 0.98) {
                m.transparent = true;
                m.opacity = opacidad;
                child.visible = opacidad > 0.05;
              } else {
                m.transparent = false;
                m.opacity = 1.0;
                child.visible = true;
              }
            });
          }
        });
      }

      if (this.mixer) {
        this.mixer.update(dt);
        this._aplicarAnimacionHabilidad();
      } else if (this.isFallbackAvatar && this.fallbackLimbs.leftLeg) {
        if (this.fallbackAct) {
          this.applyFallbackAct(this.tiempo);
          if (this._skillAnim) this._aplicarAnimacionHabilidad();
          return;
        }
        const freq = this.activeState === 'run' ? 14 : (this.activeState === 'walk' ? 8 : 0);
        const amp = this.activeState === 'run' ? 0.65 : (this.activeState === 'walk' ? 0.4 : 0);
        const angle = freq > 0 ? Math.sin(this.tiempo * freq) * amp : 0;
        this.fallbackLimbs.leftLeg.rotation.x = angle;
        this.fallbackLimbs.rightLeg.rotation.x = -angle;
        this.fallbackLimbs.leftArm.rotation.x = -angle * 0.8;
        this.fallbackLimbs.rightArm.rotation.x = angle * 0.8;
        if (this._skillAnim) this._aplicarAnimacionHabilidad();
      } else if (this._skillAnim) {
        this._aplicarAnimacionHabilidad();
      }
    }
  }

  /*
   * Evita que la cámara atraviese el suelo o un muro cuando orbita o sigue al personaje.
   * Se llama después de controls.update().
   */
  function clampCameraToWorld(camera, target, world) {
    const cam = camera.position;
    const steps = 24;
    let last = null;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = target.x + (cam.x - target.x) * t;
      const y = target.y + (cam.y - target.y) * t;
      const z = target.z + (cam.z - target.z) * t;
      if (y < world.getWalkableHeight(x, z) + 1.2) {
        if (last) cam.copy(last); else cam.set(target.x, target.y + 1.2, target.z);
        return;
      }
      last = { x, y, z };
    }

    const camFloor = world.getWalkableHeight(cam.x, cam.z);
    if (cam.y < camFloor + 1.2) cam.y = camFloor + 1.2;

    // Colisionadores: si la cámara queda dentro de un muro o una casa, se acerca al objetivo
    const inside = (x, z) => getColliders(world, x, z).some(c => {
      if (c.type === 'circle') return Math.hypot(x - c.x, z - c.z) < c.r + 0.4;
      if (c.type === 'box') return x > c.minX - 0.4 && x < c.maxX + 0.4 && z > c.minZ - 0.4 && z < c.maxZ + 0.4;
      const dx = x - c.cx, dz = z - c.cz;
      return Math.abs(dx * c.ux + dz * c.uz) < c.hu + 0.4 && Math.abs(-dx * c.uz + dz * c.ux) < c.hv + 0.4;
    });
    if (inside(cam.x, cam.z)) {
      const dir = new THREE.Vector3().subVectors(target, cam);
      const len = dir.length();
      dir.normalize();
      for (let d = 1; d <= Math.min(len, 60); d += 0.5) {
        const p = cam.clone().addScaledVector(dir, d);
        if (!inside(p.x, p.z)) { cam.copy(p); return; }
      }
    }
  }

  let _texSombraContacto = null, _geoSombraContacto = null;
  function crearSombraContacto(THREE, radio = 1.25, opacidad = 0.36) {
    if (!THREE || !THREE.PlaneGeometry || !THREE.MeshBasicMaterial || !THREE.Mesh) return null;
    if (!_texSombraContacto && typeof document !== 'undefined' && THREE.CanvasTexture) {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
      g.addColorStop(0, 'rgba(6, 10, 18, 0.85)');
      g.addColorStop(0.55, 'rgba(6, 10, 18, 0.42)');
      g.addColorStop(1, 'rgba(6, 10, 18, 0.0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
      _texSombraContacto = new THREE.CanvasTexture(c);
    }
    if (!_texSombraContacto) return null;
    if (!_geoSombraContacto) {
      _geoSombraContacto = new THREE.PlaneGeometry(1, 1);
      _geoSombraContacto.rotateX(-Math.PI / 2);
    }
    const mat = new THREE.MeshBasicMaterial({
      map: _texSombraContacto,
      transparent: true,
      opacity: opacidad,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -2
    });
    const m = new THREE.Mesh(_geoSombraContacto, mat);
    m.name = 'SombraContacto';
    m.position.y = 0.04;
    m.scale.set(radio, 1, radio);
    m.renderOrder = 1;
    m.castShadow = false;
    m.receiveShadow = false;
    return m;
  }

  const api = { CharacterController, clampCameraToWorld, crearSombraContacto, findClipIndex, CLIP_KEYWORDS, ONE_SHOT, SKILL_MOTION, WALK_SPEED, RUN_SPEED };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.CharacterLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
