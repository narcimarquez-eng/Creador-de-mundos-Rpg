/*
 * world-core.js — Núcleo del mundo RPG (sin interfaz).
 *
 * Contiene todo lo que el juego final necesitará reutilizar:
 *   - Generador pseudoaleatorio reproducible (mismo que el creador de pueblos).
 *   - Terreno y biomas infinitos y deterministas a partir de la semilla del mundo.
 *   - Modelo de datos del mundo (pueblos, caminos, zonas de caza, puntos de interés).
 *   - Generación de un mundo básico y crecimiento incremental (añadir pueblos).
 *   - Cálculo de niveles recomendados según la distancia al pueblo inicial.
 *   - Serialización / validación de partidas guardadas.
 *
 * Unidades: 1 unidad = 1 metro. El eje Y del mapa 2D equivale al eje Z del mundo 3D.
 * Se expone como objeto global `RPGWorld` (navegador) o module.exports (Node).
 */
(function (root) {
  'use strict';

  const FORMAT = 'rpg-world';
  const VERSION = 1;

  // ---------------------------------------------------------------------------
  // 1. Aleatoriedad reproducible (Mulberry32, idéntico al creador de pueblos)
  // ---------------------------------------------------------------------------
  class PRNG {
    constructor(seed) { this.s = seed >>> 0; }
    next() {
      let t = this.s += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    range(min, max) { return min + this.next() * (max - min); }
    int(min, max) { return Math.floor(this.range(min, max + 1)); }
    pick(arr) { return arr[this.int(0, arr.length - 1)]; }
    chance(p) { return this.next() < p; }
  }

  function hashString(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  // ---------------------------------------------------------------------------
  // 2. Ruido Perlin 2D con semilla + fbm
  // ---------------------------------------------------------------------------
  function makeNoise2D(seed) {
    const rng = new PRNG(seed);
    const perm = new Uint8Array(512);
    const base = [];
    for (let i = 0; i < 256; i++) base.push(i);
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1));
      const tmp = base[i]; base[i] = base[j]; base[j] = tmp;
    }
    for (let i = 0; i < 512; i++) perm[i] = base[i & 255];
    const gx = [1, -1, 1, -1, 1.414, -1.414, 0, 0];
    const gy = [1, 1, -1, -1, 0, 0, 1.414, -1.414];
    const fade = t => t * t * t * (t * (t * 6 - 15) + 10);

    return function noise(x, y) {
      const xf = Math.floor(x), yf = Math.floor(y);
      const X = xf & 255, Y = yf & 255;
      const dx = x - xf, dy = y - yf;
      const g = (h, px, py) => { const k = h & 7; return gx[k] * px + gy[k] * py; };
      const aa = perm[perm[X] + Y], ab = perm[perm[X] + Y + 1];
      const ba = perm[perm[X + 1] + Y], bb = perm[perm[X + 1] + Y + 1];
      const u = fade(dx), v = fade(dy);
      const x1 = lerp(g(aa, dx, dy), g(ba, dx - 1, dy), u);
      const x2 = lerp(g(ab, dx, dy - 1), g(bb, dx - 1, dy - 1), u);
      return lerp(x1, x2, v); // aprox. [-1, 1]
    };
  }

  function fbm(noise, x, y, octaves) {
    let amp = 1, freq = 1, sum = 0, norm = 0;
    for (let i = 0; i < octaves; i++) {
      sum += noise(x * freq, y * freq) * amp;
      norm += amp;
      amp *= 0.5;
      freq *= 2.03;
    }
    return sum / norm;
  }

  // ---------------------------------------------------------------------------
  // 3. Biomas, monstruos y nombres
  // ---------------------------------------------------------------------------
  const SEA_LEVEL = 0.36;

  const BIOMES = {
    oceano:   { name: 'Océano',        color: [30, 58, 95],   water: true },
    agua:     { name: 'Lago / Costa',  color: [47, 95, 138],  water: true },
    costa:    { name: 'Costa',         color: [217, 196, 143] },
    pradera:  { name: 'Pradera',       color: [127, 174, 90] },
    bosque:   { name: 'Bosque',        color: [63, 122, 58] },
    pantano:  { name: 'Pantano',       color: [79, 107, 74] },
    desierto: { name: 'Desierto',      color: [216, 184, 106] },
    tundra:   { name: 'Tundra',        color: [185, 194, 168] },
    taiga:    { name: 'Taiga',         color: [77, 110, 90] },
    montana:  { name: 'Montaña',       color: [138, 129, 112] },
    nieve:    { name: 'Cumbres Nevadas', color: [238, 242, 245] }
  };

  const MONSTERS = {
    costa:    ['Cangrejo gigante', 'Pirata saqueador', 'Naga de las mareas', 'Tortuga acorazada', 'Sirena oscura', 'Gaviota furiosa'],
    pradera:  ['Lobo gris', 'Jabalí salvaje', 'Goblin explorador', 'Bandido de caminos', 'Escarabajo gigante', 'Kobold'],
    bosque:   ['Araña del bosque', 'Treant joven', 'Oso pardo', 'Orco cazador', 'Duende travieso', 'Lobo alfa'],
    pantano:  ['Sapo venenoso', 'Lagarto del cieno', 'Zombi ahogado', 'Bruja del pantano', 'Sanguijuela gigante', 'Hombre lagarto'],
    desierto: ['Escorpión gigante', 'Momia errante', 'Gusano de arena', 'Nómada renegado', 'Basilisco', 'Elemental de arena'],
    tundra:   ['Lobo de las nieves', 'Bárbaro del norte', 'Espectro helado', 'Mamut lanudo', 'Troll de hielo', 'Liebre colmillo'],
    taiga:    ['Oso negro', 'Lince sombrío', 'Cazador furtivo', 'Wendigo', 'Lobo de escarcha', 'Ent de pino'],
    montana:  ['Gárgola', 'Golem de piedra', 'Arpía', 'Troll de las cumbres', 'Grifo salvaje', 'Enano corrupto'],
    nieve:    ['Elemental de hielo', 'Yeti', 'Dragón blanco joven', 'Gigante de escarcha', 'Fantasma de la ventisca', 'Grifo nival']
  };

  const BOSSES = ['Señor', 'Reina', 'Rey', 'Antiguo', 'Devorador', 'Guardián'];

  const ZONE_NOUNS = {
    costa: ['Playa', 'Acantilados', 'Bahía', 'Arrecife'],
    pradera: ['Llanuras', 'Campos', 'Colinas', 'Prados'],
    bosque: ['Bosque', 'Arboleda', 'Espesura', 'Claro'],
    pantano: ['Ciénaga', 'Pantano', 'Marismas', 'Fangal'],
    desierto: ['Dunas', 'Desierto', 'Oasis', 'Cañón'],
    tundra: ['Estepa', 'Tundra', 'Páramo', 'Llanura helada'],
    taiga: ['Pinar', 'Bosque boreal', 'Hondonada', 'Valle'],
    montana: ['Desfiladero', 'Cumbres', 'Paso', 'Riscos'],
    nieve: ['Glaciar', 'Picos', 'Ventisquero', 'Cima']
  };
  const ZONE_SUFFIX = ['de las Sombras', 'del Ocaso', 'de los Lamentos', 'de Plata', 'del Cuervo',
    'de la Bruma', 'de Hierro', 'del Lobo', 'de los Antiguos', 'de Ceniza', 'del Eco', 'de Espinas',
    'del Alba', 'de los Caídos', 'de Sangre', 'del Silencio', 'de las Ánimas', 'del Dragón'];

  const TOWN_A = ['Glu', 'Dio', 'Gi', 'Or', 'Ad', 'Hei', 'Val', 'Mor', 'Thal', 'Kar', 'Bel', 'Lor',
    'Fen', 'Ish', 'Ar', 'Dun', 'Eld', 'Sil', 'Bra', 'Cor', 'Hal', 'Rune', 'Schu', 'Flo', 'Ka', 'Aer'];
  const TOWN_B = ['dio', 'ran', 'en', 'ra', 'heim', 'dor', 'mar', 'wyn', 'gard', 'holm', 'ia', 'oth',
    'ven', 'rin', 'lis', 'dal', 'mir', 'stad', 'ford', 'ton', 'ren', 'tag', 'nia', 'mel'];

  const POI_TYPES = {
    mazmorra:   { name: 'Mazmorra',    icon: '⛫', prefixes: ['Cripta', 'Catacumbas', 'Mazmorra', 'Cueva'] },
    jefe:       { name: 'Guarida de jefe', icon: '☠', prefixes: ['Guarida', 'Trono', 'Nido', 'Altar'] },
    campamento: { name: 'Campamento',  icon: '⛺', prefixes: ['Campamento', 'Refugio', 'Puesto'] },
    santuario:  { name: 'Santuario',   icon: '✦', prefixes: ['Santuario', 'Templo', 'Círculo'] },
    mina:       { name: 'Mina',        icon: '⚒', prefixes: ['Mina', 'Cantera', 'Veta'] },
    ruinas:     { name: 'Ruinas',      icon: '⌂', prefixes: ['Ruinas', 'Fortaleza caída', 'Torre rota'] },
    portal:     { name: 'Portal',      icon: '◎', prefixes: ['Portal', 'Piedra rúnica', 'Círculo de teletransporte'] }
  };

  const ZONE_TYPES = {
    caza:   { name: 'Zona de caza' },
    elite:  { name: 'Zona élite (+5 niv.)' },
    jefe:   { name: 'Territorio de jefe' },
    pvp:    { name: 'Zona PvP' },
    segura: { name: 'Zona segura (sin combate)' }
  };

  // ---------------------------------------------------------------------------
  // 4. Terreno determinista (infinito) a partir de la semilla del mundo
  // ---------------------------------------------------------------------------
  const terrainCache = new Map();

  function getTerrain(seed) {
    if (terrainCache.has(seed)) return terrainCache.get(seed);
    const nE = makeNoise2D(seed ^ 0x9E3779B1);
    const nM = makeNoise2D(seed ^ 0x85EBCA6B);
    const nT = makeNoise2D(seed ^ 0xC2B2AE35);
    const stretch = v => clamp(0.5 + v * 1.6, 0, 1);

    const t = {
      seed,
      // Elevación normalizada 0..1 (SEA_LEVEL = nivel del mar)
      elevation(x, y) {
        const e = fbm(nE, x / 3400, y / 3400, 5);
        return clamp(0.5 + e * 1.15, 0, 1);
      },
      moisture(x, y) { return stretch(fbm(nM, x / 3400 + 31.7, y / 3400 - 12.3, 3)); },
      temperature(x, y, e) {
        const base = stretch(fbm(nT, x / 7000 - 7.1, y / 7000 + 3.9, 2));
        return clamp(base - Math.max(0, e - 0.5) * 0.7, 0, 1);
      },
      biomeAt(x, y, eIn) {
        const e = eIn === undefined ? this.elevation(x, y) : eIn;
        if (e < SEA_LEVEL - 0.06) return 'oceano';
        if (e < SEA_LEVEL) return 'agua';
        if (e < SEA_LEVEL + 0.018) return 'costa';
        if (e > 0.83) return 'nieve';
        if (e > 0.72) return 'montana';
        const m = this.moisture(x, y);
        const temp = this.temperature(x, y, e);
        if (temp < 0.3) return m > 0.5 ? 'taiga' : 'tundra';
        if (temp > 0.64 && m < 0.45) return 'desierto';
        if (m > 0.66 && e < 0.52) return 'pantano';
        if (m > 0.52) return 'bosque';
        return 'pradera';
      },
      // Altura en metros (útil para el juego 3D)
      heightAt(x, y) {
        const e = this.elevation(x, y);
        return (e - SEA_LEVEL) * 420;
      },
      isWater(x, y) { return this.elevation(x, y) < SEA_LEVEL; }
    };
    terrainCache.set(seed, t);
    return t;
  }

  // ---------------------------------------------------------------------------
  // 5. Utilidades del modelo
  // ---------------------------------------------------------------------------
  function newId(world, prefix) {
    world.nextId = (world.nextId || 1);
    return prefix + '_' + (world.nextId++).toString(36);
  }

  function townRadius(size) { return 42 + size * 14 + 30; }

  function findTown(world, id) { return world.towns.find(t => t.id === id) || null; }
  function findRoad(world, id) { return world.roads.find(r => r.id === id) || null; }
  function findZone(world, id) { return world.zones.find(z => z.id === id) || null; }
  function findPoi(world, id) { return world.pois.find(p => p.id === id) || null; }

  function findAny(world, id) {
    return findTown(world, id) || findRoad(world, id) || findZone(world, id) || findPoi(world, id);
  }

  function kindOf(world, id) {
    if (findTown(world, id)) return 'town';
    if (findRoad(world, id)) return 'road';
    if (findZone(world, id)) return 'zone';
    if (findPoi(world, id)) return 'poi';
    return null;
  }

  function uniqueName(world, gen) {
    const used = new Set([...world.towns, ...world.zones, ...world.pois].map(o => o.name));
    for (let i = 0; i < 40; i++) {
      const n = gen();
      if (!used.has(n)) return n;
    }
    return gen() + ' ' + (world.nextId || 1);
  }

  function townName(world, rng) {
    return uniqueName(world, () => rng.pick(TOWN_A) + rng.pick(TOWN_B));
  }

  function zoneName(world, rng, biome) {
    const nouns = ZONE_NOUNS[biome] || ZONE_NOUNS.pradera;
    return uniqueName(world, () => rng.pick(nouns) + ' ' + rng.pick(ZONE_SUFFIX));
  }

  function poiName(world, rng, type) {
    const def = POI_TYPES[type] || POI_TYPES.ruinas;
    return uniqueName(world, () => rng.pick(def.prefixes) + ' ' + rng.pick(ZONE_SUFFIX));
  }

  function landBiome(b) { return BIOMES[b] && !BIOMES[b].water ? b : 'costa'; }

  // Configuración compatible con el Creador de Pueblos (creador-de-pueblos.html)
  const STYLE_BY_BIOME = {
    pradera: ['l2_fantasy', 'european', 'trade'],
    bosque: ['elven', 'l2_fantasy', 'frontier'],
    pantano: ['frontier', 'european'],
    desierto: ['trade', 'frontier'],
    tundra: ['fortified', 'dwarven'],
    taiga: ['frontier', 'fortified'],
    montana: ['dwarven', 'fortified'],
    nieve: ['dwarven', 'fortified'],
    costa: ['trade', 'european', 'l2_fantasy']
  };
  const TERRAIN_BY_BIOME = {
    pradera: ['plains', 'valley'], bosque: ['hills', 'valley'], pantano: ['plains', 'valley'],
    desierto: ['plains', 'highlands'], tundra: ['plains', 'hills'], taiga: ['hills', 'valley'],
    montana: ['highlands', 'hills'], nieve: ['highlands'], costa: ['valley', 'plains']
  };

  function defaultTownCfg(rng, biome, size) {
    const b = landBiome(biome);
    const style = rng.pick(STYLE_BY_BIOME[b] || STYLE_BY_BIOME.pradera);
    return {
      style,
      terrainType: rng.pick(TERRAIN_BY_BIOME[b] || ['valley']),
      relief: rng.int(20, 70),
      seed: rng.int(1, 99999),
      size,
      houseDensity: rng.int(65, 95),
      specialCount: clamp(size * 2 + rng.int(-1, 1), 2, 10),
      maxFloors: rng.int(2, 3),
      roadWidth: 7.0,
      trazado: 'manzanas',
      curve: Math.round(rng.range(2, 9) * 2) / 2,
      treeDensity: b === 'desierto' ? 25 : b === 'bosque' ? 95 : rng.int(55, 85),
      hasWalls: ['dwarven', 'fortified', 'european', 'l2_fantasy', 'trade'].includes(style) && size >= 3,
      hasRiver: rng.chance(0.6),
      hasMagic: true,
      hasProps: true,
      hasLamps: true,
      hasFences: true,
      time: 'day',
      rotation: 0,   // giro del pueblo en el mundo (grados), lo calcula computeTownExits
      exits: []      // salidas hacia los caminos del mundo (ver computeTownExits)
    };
  }

  // ---------------------------------------------------------------------------
  // 6. Geometría de caminos y zonas
  // ---------------------------------------------------------------------------
  function buildRoadPoints(world, road) {
    const a = findTown(world, road.from);
    const b = findTown(world, road.to);
    if (!a || !b) { road.points = []; road.length = 0; return road; }
    const len = dist(a, b) || 1;
    const nx = -(b.y - a.y) / len, ny = (b.x - a.x) / len;
    const cx = (a.x + b.x) / 2 + nx * road.bend * len;
    const cy = (a.y + b.y) / 2 + ny * road.bend * len;
    const segs = Math.max(10, Math.round(len / 35));
    const wig = makeNoise2D(hashString(road.id) ^ world.seed);
    const pts = [];
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const it = 1 - t;
      let x = it * it * a.x + 2 * it * t * cx + t * t * b.x;
      let y = it * it * a.y + 2 * it * t * cy + t * t * b.y;
      const w = wig(t * len / 260, 0.5) * len * 0.045 * Math.sin(Math.PI * t);
      x += nx * w; y += ny * w;
      pts.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
    }
    road.points = pts;
    let L = 0;
    for (let i = 1; i < pts.length; i++) L += dist(pts[i - 1], pts[i]);
    road.length = Math.round(L);
    return road;
  }

  function pointOnPolyline(pts, t) {
    if (!pts.length) return { x: 0, y: 0 };
    let total = 0;
    const seg = [];
    for (let i = 1; i < pts.length; i++) { const d = dist(pts[i - 1], pts[i]); seg.push(d); total += d; }
    let target = clamp(t, 0, 1) * total;
    for (let i = 0; i < seg.length; i++) {
      if (target <= seg[i] || i === seg.length - 1) {
        const k = seg[i] ? target / seg[i] : 0;
        return { x: lerp(pts[i].x, pts[i + 1].x, clamp(k, 0, 1)), y: lerp(pts[i].y, pts[i + 1].y, clamp(k, 0, 1)) };
      }
      target -= seg[i];
    }
    return pts[pts.length - 1];
  }

  function distToPolyline(p, pts) {
    let best = Infinity;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const dx = b.x - a.x, dy = b.y - a.y;
      const l2 = dx * dx + dy * dy || 1;
      const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / l2, 0, 1);
      const d = Math.hypot(p.x - (a.x + dx * t), p.y - (a.y + dy * t));
      if (d < best) best = d;
    }
    return best;
  }

  // Forma irregular de la zona: radio en función del ángulo
  function zoneRadiusAt(zone, angle) {
    const s = zone.shapeSeed || 1;
    const k1 = (s % 7) + 2, k2 = (s % 5) + 3;
    const p1 = (s % 997) / 997 * Math.PI * 2, p2 = (s % 613) / 613 * Math.PI * 2;
    const f = 0.84 + 0.11 * Math.sin(angle * k1 + p1) + 0.06 * Math.sin(angle * k2 + p2);
    return zone.radius * f;
  }

  function zoneOutline(zone, n) {
    n = n || 40;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = zoneRadiusAt(zone, a);
      pts.push({ x: zone.x + Math.cos(a) * r, y: zone.y + Math.sin(a) * r });
    }
    return pts;
  }

  function pointInZone(zone, p) {
    const d = Math.hypot(p.x - zone.x, p.y - zone.y);
    return d <= zoneRadiusAt(zone, Math.atan2(p.y - zone.y, p.x - zone.x));
  }

  function segmentsIntersect(p1, p2, p3, p4) {
    const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
    if (Math.abs(d) < 1e-9) return false;
    const u = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
    const v = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;
    return u > 0.02 && u < 0.98 && v > 0.02 && v < 0.98;
  }

  function roadCrossesOthers(world, a, b) {
    return world.roads.some(r => {
      const ra = findTown(world, r.from), rb = findTown(world, r.to);
      if (!ra || !rb) return false;
      if ([r.from, r.to].includes(a.id) || [r.from, r.to].includes(b.id)) return false;
      return segmentsIntersect(a, b, ra, rb);
    });
  }

  // ---------------------------------------------------------------------------
  // 6b. Salidas de los pueblos: por dónde salen los caminos del mundo
  // ---------------------------------------------------------------------------
  // El Creador de Pueblos genera cada pueblo en coordenadas locales con 4 calles
  // principales que salen por las puertas E (0°), S (90°), W (180°) y N (270°).
  // Aquí elegimos un giro (cfg.rotation) para que esas puertas apunten lo mejor
  // posible a los caminos del mundo; los caminos que no encajan en ninguna puerta
  // se convierten en salidas extra (gate: null).
  // Ángulos en grados, medidos con atan2(dy, dx) (= atan2(dz, dx) en 3D).
  // Un punto local (lx, lz) del pueblo pasa al mundo así (r = rotation):
  //   x = town.x + lx·cos r − lz·sin r ;  y = town.y + lx·sin r + lz·cos r
  const GATES = [
    { gate: 'E', angle: 0 }, { gate: 'S', angle: 90 },
    { gate: 'W', angle: 180 }, { gate: 'N', angle: 270 }
  ];
  const GATE_MAX_DIFF = 35;
  const normDeg = a => ((a % 360) + 360) % 360;
  const angDiff = (a, b) => { const d = Math.abs(normDeg(a) - normDeg(b)); return Math.min(d, 360 - d); };
  const toDeg = r => r * 180 / Math.PI;

  // Mitad del lado del terreno 3D que genera el Creador de Pueblos (m)
  function townTileHalf(size) { return Math.max(240, (42 + size * 14 + 65) * 2) / 2; }

  // Dirección (grados) con la que un camino sale del pueblo, medida en el borde del terreno 3D
  function roadAngleAt(world, town, road) {
    let pts = road.points;
    if (!pts || pts.length < 2) return null;
    if (road.to === town.id) pts = pts.slice().reverse();
    const R = townTileHalf((town.cfg && town.cfg.size) || 3);
    let p = pts[pts.length - 1];
    for (let i = 1; i < pts.length; i++) {
      if (dist(pts[i], town) >= R) { p = pts[i]; break; }
    }
    return normDeg(toDeg(Math.atan2(p.y - town.y, p.x - town.x)));
  }

  function computeTownExits(world, town) {
    if (!town || !town.cfg) return;
    const links = world.roads
      .filter(r => r.from === town.id || r.to === town.id)
      .map(r => {
        const other = findTown(world, r.from === town.id ? r.to : r.from);
        return { roadId: r.id, toId: other ? other.id : null, to: other ? other.name : '?', world: roadAngleAt(world, town, r) };
      })
      .filter(l => l.world !== null);
    const cur = normDeg(town.cfg.rotation || 0);
    if (!links.length) { town.cfg.rotation = Math.round(cur); town.cfg.exits = []; return; }

    let best = null;
    for (let r = 0; r < 360; r++) {
      const pairs = [];
      links.forEach((l, i) => GATES.forEach(g => pairs.push({ i, g: g.gate, d: angDiff(l.world - r, g.angle) })));
      pairs.sort((a, b) => a.d - b.d);
      const usedL = new Set(), usedG = new Set(), assign = {};
      let cost = 0;
      for (const p of pairs) {
        if (usedL.has(p.i) || usedG.has(p.g) || p.d > GATE_MAX_DIFF) continue;
        usedL.add(p.i); usedG.add(p.g); assign[p.i] = p.g; cost += p.d;
      }
      cost += (links.length - usedL.size) * 60 + angDiff(r, cur) * 0.01;
      if (!best || cost < best.cost) best = { cost, r, assign };
    }
    town.cfg.rotation = best.r;
    town.cfg.exits = links.map((l, i) => ({
      angle: normDeg(Math.round(normDeg(l.world - best.r) * 10) / 10),
      gate: best.assign[i] || null,
      to: l.to,
      toId: l.toId,
      roadId: l.roadId
    })).sort((a, b) => a.angle - b.angle);
  }

  function updateTownExits(world, ids) {
    ids.forEach(id => computeTownExits(world, findTown(world, id)));
  }

  function updateAllExits(world) {
    world.towns.forEach(t => computeTownExits(world, t));
  }

  // Punto de salida en el mundo (borde del terreno del pueblo) para una salida dada
  function exitWorldPoint(town, exit) {
    const R = townTileHalf(town.cfg.size);
    const a = (exit.angle + (town.cfg.rotation || 0)) * Math.PI / 180;
    return { x: town.x + Math.cos(a) * R, y: town.y + Math.sin(a) * R };
  }

  // ---------------------------------------------------------------------------
  // 7. Creación de entidades
  // ---------------------------------------------------------------------------
  function rngFor(world) {
    world.rngState = (world.rngState >>> 0) || (world.seed >>> 0) || 1;
    const rng = new PRNG(world.rngState);
    return {
      rng,
      commit() { world.rngState = (Math.floor(rng.next() * 4294967295) >>> 0) || 1; }
    };
  }

  function createTown(world, x, y, opts) {
    opts = opts || {};
    const { rng, commit } = rngFor(world);
    const terrain = getTerrain(world.seed);
    const biome = landBiome(terrain.biomeAt(x, y));
    const size = opts.size || (world.towns.length === 0 ? 4 : rng.chance(0.25) ? 4 : rng.int(2, 3));
    const town = {
      id: newId(world, 't'),
      name: opts.name || townName(world, rng),
      x: Math.round(x), y: Math.round(y),
      biome,
      level: opts.level || 1,
      isStart: world.towns.length === 0,
      services: ['posada', 'tienda', 'herrero'].concat(size >= 3 ? ['gremio', 'almacén'] : []).concat(size >= 4 ? ['teletransporte', 'subastas'] : []),
      cfg: defaultTownCfg(rng, biome, size),
      notes: ''
    };
    town.radius = townRadius(size);
    world.towns.push(town);
    if (town.isStart) world.startTownId = town.id;
    commit();
    return town;
  }

  function createRoad(world, fromId, toId, opts) {
    opts = opts || {};
    if (fromId === toId) return null;
    const existing = world.roads.find(r => (r.from === fromId && r.to === toId) || (r.from === toId && r.to === fromId));
    if (existing) return existing;
    const { rng, commit } = rngFor(world);
    const road = {
      id: newId(world, 'r'),
      from: fromId, to: toId,
      bend: opts.bend !== undefined ? opts.bend : Math.round(rng.range(-0.18, 0.18) * 100) / 100,
      kind: opts.kind || 'camino',
      points: [], length: 0
    };
    commit();
    buildRoadPoints(world, road);
    world.roads.push(road);
    updateTownExits(world, [fromId, toId]);
    return road;
  }

  function rollMonsters(rng, biome, levelMin, levelMax, type) {
    const pool = MONSTERS[landBiome(biome)] || MONSTERS.pradera;
    const count = type === 'segura' ? 0 : rng.int(3, 5);
    const picks = pool.slice().sort(() => rng.next() - 0.5).slice(0, count);
    const out = picks.map((name, i) => ({
      name,
      level: Math.round(lerp(levelMin, levelMax, count > 1 ? i / (count - 1) : 0.5)),
      density: rng.pick(['baja', 'media', 'alta']),
      boss: false
    }));
    if (type === 'jefe' && pool.length) {
      out.push({ name: rng.pick(pool) + ' ' + rng.pick(BOSSES), level: levelMax + 3, density: 'única', boss: true });
    }
    return out;
  }

  function createZone(world, x, y, opts) {
    opts = opts || {};
    const { rng, commit } = rngFor(world);
    const terrain = getTerrain(world.seed);
    const biome = landBiome(opts.biome || terrain.biomeAt(x, y));
    const type = opts.type || 'caza';
    const lvl = opts.levelMin || 1;
    const zone = {
      id: newId(world, 'z'),
      name: opts.name || zoneName(world, rng, biome),
      type,
      x: Math.round(x), y: Math.round(y),
      radius: Math.round(opts.radius || rng.range(160, 280)),
      shapeSeed: rng.int(1, 999999),
      biome,
      levelMin: lvl,
      levelMax: opts.levelMax || lvl + 3,
      roadId: opts.roadId || null,
      roadT: opts.roadT !== undefined ? opts.roadT : null,
      anchored: !!opts.roadId,
      monsters: [],
      respawnSec: 60,
      notes: ''
    };
    zone.monsters = rollMonsters(rng, biome, zone.levelMin, zone.levelMax, type);
    world.zones.push(zone);
    commit();
    return zone;
  }

  function createPoi(world, x, y, type, opts) {
    opts = opts || {};
    const { rng, commit } = rngFor(world);
    const zone = world.zones.find(z => pointInZone(z, { x, y }));
    const poi = {
      id: newId(world, 'p'),
      type: POI_TYPES[type] ? type : 'ruinas',
      name: opts.name || poiName(world, rng, type),
      x: Math.round(x), y: Math.round(y),
      level: zone ? zone.levelMax : 1,
      zoneId: zone ? zone.id : null,
      dx: zone ? Math.round(x - zone.x) : 0,
      dy: zone ? Math.round(y - zone.y) : 0,
      notes: ''
    };
    world.pois.push(poi);
    commit();
    return poi;
  }

  // Coloca zonas de caza a lo largo de un camino (las zonas conectan pueblos)
  function populateRoad(world, road, zonesPerRoad) {
    const n = zonesPerRoad === undefined ? world.settings.zonesPerRoad : zonesPerRoad;
    if (!n || road.length < 500) return [];
    const { rng, commit } = rngFor(world);
    commit();
    const count = road.length > 1600 && n >= 2 ? 2 : 1;
    const made = [];
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : (i === 0 ? 0.33 : 0.67);
      const p = pointOnPolyline(road.points, t);
      const r = clamp(road.length * (count === 1 ? 0.24 : 0.17), 140, 380);
      const type = rng.chance(0.12) ? 'elite' : rng.chance(0.08) ? 'jefe' : 'caza';
      const z = createZone(world, p.x, p.y, { roadId: road.id, roadT: t, radius: r, type });
      made.push(z);
      if (rng.chance(world.settings.poiChance)) {
        const ang = rng.range(0, Math.PI * 2);
        const rr = r * rng.range(0.3, 0.6);
        const ptype = type === 'jefe' ? 'jefe' : rng.pick(['mazmorra', 'campamento', 'ruinas', 'mina', 'santuario']);
        createPoi(world, z.x + Math.cos(ang) * rr, z.y + Math.sin(ang) * rr, ptype);
      }
    }
    return made;
  }

  // ---------------------------------------------------------------------------
  // 8. Edición: mover / eliminar manteniendo coherencia
  // ---------------------------------------------------------------------------
  function syncZonePois(world, zone) {
    world.pois.forEach(p => {
      if (p.zoneId === zone.id) { p.x = Math.round(zone.x + p.dx); p.y = Math.round(zone.y + p.dy); }
    });
  }

  function refreshRoad(world, road) {
    buildRoadPoints(world, road);
    updateTownExits(world, [road.from, road.to]);
    world.zones.forEach(z => {
      if (z.anchored && z.roadId === road.id && z.roadT !== null) {
        const p = pointOnPolyline(road.points, z.roadT);
        z.x = Math.round(p.x); z.y = Math.round(p.y);
        syncZonePois(world, z);
      }
    });
  }

  function moveEntity(world, id, x, y) {
    const kind = kindOf(world, id);
    const ent = findAny(world, id);
    if (!ent || kind === 'road') return;
    ent.x = Math.round(x); ent.y = Math.round(y);
    if (kind === 'town') {
      world.roads.filter(r => r.from === id || r.to === id).forEach(r => refreshRoad(world, r));
    } else if (kind === 'zone') {
      ent.anchored = false;
      syncZonePois(world, ent);
    } else if (kind === 'poi') {
      const zone = world.zones.find(z => pointInZone(z, ent));
      ent.zoneId = zone ? zone.id : null;
      ent.dx = zone ? ent.x - zone.x : 0;
      ent.dy = zone ? ent.y - zone.y : 0;
    }
  }

  function removeEntity(world, id) {
    const kind = kindOf(world, id);
    if (kind === 'town') {
      world.roads.filter(r => r.from === id || r.to === id).forEach(r => removeEntity(world, r.id));
      world.towns = world.towns.filter(t => t.id !== id);
      if (world.startTownId === id) {
        world.startTownId = world.towns[0] ? world.towns[0].id : null;
        world.towns.forEach(t => { t.isStart = t.id === world.startTownId; });
      }
    } else if (kind === 'road') {
      const road = findRoad(world, id);
      world.roads = world.roads.filter(r => r.id !== id);
      updateTownExits(world, [road.from, road.to]);
      world.zones.forEach(z => { if (z.roadId === id) { z.roadId = null; z.anchored = false; z.roadT = null; } });
    } else if (kind === 'zone') {
      world.zones = world.zones.filter(z => z.id !== id);
      world.pois.forEach(p => { if (p.zoneId === id) p.zoneId = null; });
    } else if (kind === 'poi') {
      world.pois = world.pois.filter(p => p.id !== id);
    }
    return kind;
  }

  function setStartTown(world, id) {
    if (!findTown(world, id)) return;
    world.startTownId = id;
    world.towns.forEach(t => { t.isStart = t.id === id; });
  }

  // ---------------------------------------------------------------------------
  // 9. Niveles: crecen con la distancia (por caminos) al pueblo inicial
  // ---------------------------------------------------------------------------
  function townDistances(world) {
    const d = new Map();
    world.towns.forEach(t => d.set(t.id, Infinity));
    const start = findTown(world, world.startTownId) || world.towns[0];
    if (!start) return d;
    d.set(start.id, 0);
    const open = new Set(world.towns.map(t => t.id));
    while (open.size) {
      let cur = null, best = Infinity;
      open.forEach(id => { if (d.get(id) < best) { best = d.get(id); cur = id; } });
      if (cur === null) break;
      open.delete(cur);
      world.roads.forEach(r => {
        if (r.from !== cur && r.to !== cur) return;
        const other = r.from === cur ? r.to : r.from;
        const nd = best + (r.length || 0);
        if (nd < d.get(other)) d.set(other, nd);
      });
    }
    // Pueblos aislados: distancia en línea recta * 1.3
    world.towns.forEach(t => { if (!isFinite(d.get(t.id))) d.set(t.id, dist(t, start) * 1.3); });
    return d;
  }

  function levelForDistance(world, d) {
    return Math.max(1, Math.min(99, 1 + Math.round(d / world.settings.metersPerLevel)));
  }

  function levelZoneFrom(world, z, d) {
    let best = Infinity;
    world.towns.forEach(t => { best = Math.min(best, d.get(t.id) + dist(t, z)); });
    const base = levelForDistance(world, isFinite(best) ? best : 0);
    const bonus = z.type === 'elite' ? 5 : z.type === 'jefe' ? 3 : 0;
    z.levelMin = Math.max(1, base - 1 + bonus);
    z.levelMax = z.levelMin + 4;
  }

  function syncPoiLevels(world, z) {
    world.pois.forEach(p => { if (p.zoneId === z.id) p.level = z.levelMax + (p.type === 'jefe' ? 3 : 0); });
  }

  function recomputeLevels(world) {
    const d = townDistances(world);
    world.towns.forEach(t => { t.level = levelForDistance(world, d.get(t.id)); });
    const rngBox = rngFor(world);
    world.zones.forEach(z => {
      levelZoneFrom(world, z, d);
      z.monsters = rollMonsters(rngBox.rng, z.biome, z.levelMin, z.levelMax, z.type);
      syncPoiLevels(world, z);
    });
    rngBox.commit();
  }

  // Calcula el nivel de una sola zona (p. ej. creada a mano) y regenera sus monstruos
  function autoLevelZone(world, zone) {
    levelZoneFrom(world, zone, townDistances(world));
    rerollZoneMonsters(world, zone);
    syncPoiLevels(world, zone);
  }

  function autoLevelTown(world, town) {
    town.level = levelForDistance(world, townDistances(world).get(town.id));
  }

  function rerollZoneMonsters(world, zone) {
    const { rng, commit } = rngFor(world);
    zone.monsters = rollMonsters(rng, zone.biome, zone.levelMin, zone.levelMax, zone.type);
    commit();
  }

  // ---------------------------------------------------------------------------
  // 10. Crecimiento del mundo: añadir pueblos en la frontera
  // ---------------------------------------------------------------------------
  function isGoodTownSpot(world, p, minDist) {
    const terrain = getTerrain(world.seed);
    const e = terrain.elevation(p.x, p.y);
    if (e < SEA_LEVEL + 0.02 || e > 0.76) return false;
    return world.towns.every(t => dist(t, p) >= minDist);
  }

  function findFrontierSpot(world, rng) {
    const spacing = world.settings.spacing;
    if (!world.towns.length) {
      for (let r = 0; r < 20000; r += 150) {
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * Math.PI * 2;
          const p = { x: Math.cos(a) * r, y: Math.sin(a) * r };
          if (isGoodTownSpot(world, p, 0)) return p;
          if (r === 0) break;
        }
      }
      return { x: 0, y: 0 };
    }
    const cx = world.towns.reduce((s, t) => s + t.x, 0) / world.towns.length;
    const cy = world.towns.reduce((s, t) => s + t.y, 0) / world.towns.length;
    for (let attempt = 0; attempt < 220; attempt++) {
      // Preferimos pueblos alejados del centro para crecer hacia fuera
      const sorted = world.towns.slice().sort((a, b) => Math.hypot(b.x - cx, b.y - cy) - Math.hypot(a.x - cx, a.y - cy));
      const base = sorted[Math.floor(Math.pow(rng.next(), 2) * sorted.length)];
      const out = Math.atan2(base.y - cy, base.x - cx);
      const ang = world.towns.length === 1 ? rng.range(0, Math.PI * 2) : out + rng.range(-1.4, 1.4);
      const grow = attempt > 150 ? 1.6 : 1;
      const d = spacing * rng.range(0.85, 1.25) * grow;
      const p = { x: base.x + Math.cos(ang) * d, y: base.y + Math.sin(ang) * d };
      if (isGoodTownSpot(world, p, spacing * 0.72)) return p;
    }
    return null;
  }

  // Conecta un pueblo con sus vecinos más cercanos sin cruzar otros caminos
  function autoConnect(world, town, maxLinks) {
    const others = world.towns.filter(t => t.id !== town.id).sort((a, b) => dist(a, town) - dist(b, town));
    const made = [];
    const { rng, commit } = rngFor(world);
    commit();
    for (const o of others) {
      if (made.length >= (maxLinks || 2)) break;
      const d = dist(o, town);
      if (made.length > 0 && (d > world.settings.spacing * 1.6 || !rng.chance(0.55 + world.settings.extraLinks * 0.4))) break;
      if (roadCrossesOthers(world, town, o)) continue;
      const road = createRoad(world, town.id, o.id);
      made.push(road);
    }
    if (!made.length && others.length) made.push(createRoad(world, town.id, others[0].id));
    return made;
  }

  function addTown(world, pos, opts) {
    opts = opts || {};
    const { rng, commit } = rngFor(world);
    const p = pos || findFrontierSpot(world, rng);
    commit();
    if (!p) return null;
    const town = createTown(world, p.x, p.y, opts);
    const roads = opts.connect === false ? [] : autoConnect(world, town, 2);
    if (opts.populate !== false) roads.forEach(r => populateRoad(world, r));
    recomputeLevelsSoft(world, town, roads);
    return town;
  }

  // Ajusta niveles sólo de lo nuevo, sin tocar lo que el usuario ya editó
  function recomputeLevelsSoft(world, town, roads) {
    const d = townDistances(world);
    town.level = levelForDistance(world, d.get(town.id));
    const roadIds = new Set(roads.map(r => r.id));
    const { rng, commit } = rngFor(world);
    world.zones.filter(z => roadIds.has(z.roadId)).forEach(z => {
      levelZoneFrom(world, z, d);
      z.monsters = rollMonsters(rng, z.biome, z.levelMin, z.levelMax, z.type);
      syncPoiLevels(world, z);
    });
    commit();
  }

  // ---------------------------------------------------------------------------
  // 11. Generación de un mundo básico completo
  // ---------------------------------------------------------------------------
  const DEFAULT_SETTINGS = {
    townCount: 6,
    spacing: 1200,        // distancia típica entre pueblos (m)
    extraLinks: 0.35,     // 0..1 probabilidad de caminos extra (bucles)
    zonesPerRoad: 2,      // 0, 1 o 2 zonas de caza por camino
    poiChance: 0.45,      // probabilidad de punto de interés por zona
    metersPerLevel: 180   // metros de camino por cada nivel recomendado
  };

  function emptyWorld(name, seed, settings) {
    const now = new Date().toISOString();
    return {
      format: FORMAT,
      version: VERSION,
      name: name || 'Nuevo mundo',
      seed: (seed >>> 0) || 1,
      rngState: (seed >>> 0) || 1,
      nextId: 1,
      created: now,
      updated: now,
      settings: Object.assign({}, DEFAULT_SETTINGS, settings || {}),
      startTownId: null,
      towns: [],
      roads: [],
      zones: [],
      pois: []
    };
  }

  function generateWorld(params) {
    params = params || {};
    const seed = (params.seed >>> 0) || (Math.floor(Math.random() * 999999) + 1);
    const world = emptyWorld(params.name, seed, params.settings);
    const S = world.settings;

    // 1) Pueblos: crecimiento orgánico desde el pueblo inicial
    for (let i = 0; i < S.townCount; i++) {
      const { rng, commit } = rngFor(world);
      const p = findFrontierSpot(world, rng);
      commit();
      if (!p) break;
      createTown(world, p.x, p.y, i === 0 ? { size: 4 } : {});
    }

    // 2) Caminos: grafo de vecindad relativa (conexo y sin cruces) + bucles opcionales
    const T = world.towns;
    const candidates = [];
    for (let i = 0; i < T.length; i++) {
      for (let j = i + 1; j < T.length; j++) {
        const dij = dist(T[i], T[j]);
        let rngEdge = true, gabriel = true;
        const mx = (T[i].x + T[j].x) / 2, my = (T[i].y + T[j].y) / 2;
        for (let k = 0; k < T.length; k++) {
          if (k === i || k === j) continue;
          if (Math.max(dist(T[i], T[k]), dist(T[j], T[k])) < dij) rngEdge = false;
          if (Math.hypot(T[k].x - mx, T[k].y - my) < dij / 2) gabriel = false;
        }
        if (rngEdge || gabriel) candidates.push({ a: T[i], b: T[j], d: dij, primary: rngEdge });
      }
    }
    candidates.sort((x, y) => x.d - y.d);
    candidates.filter(c => c.primary).forEach(c => createRoad(world, c.a.id, c.b.id));
    const { rng, commit } = rngFor(world);
    candidates.filter(c => !c.primary).forEach(c => {
      if (rng.chance(S.extraLinks) && !roadCrossesOthers(world, c.a, c.b)) createRoad(world, c.a.id, c.b.id);
    });
    commit();

    // 3) Zonas de caza entre pueblos y puntos de interés
    world.roads.forEach(r => populateRoad(world, r));

    // 4) Niveles
    recomputeLevels(world);
    return world;
  }

  // ---------------------------------------------------------------------------
  // 12. Guardado / carga
  // ---------------------------------------------------------------------------
  function serialize(world) {
    world.updated = new Date().toISOString();
    return JSON.stringify(world);
  }

  function validate(obj) {
    if (!obj || typeof obj !== 'object') throw new Error('El archivo no contiene un mundo válido.');
    if (obj.format !== FORMAT) throw new Error('Formato desconocido (se esperaba "' + FORMAT + '").');
    if (typeof obj.version !== 'number' || obj.version > VERSION) {
      throw new Error('Versión de mundo no soportada: ' + obj.version);
    }
    ['towns', 'roads', 'zones', 'pois'].forEach(k => { if (!Array.isArray(obj[k])) obj[k] = []; });
    obj.settings = Object.assign({}, DEFAULT_SETTINGS, obj.settings || {});
    obj.seed = (obj.seed >>> 0) || 1;
    obj.nextId = obj.nextId || 1;
    obj.towns.forEach(t => { t.radius = townRadius((t.cfg && t.cfg.size) || 3); });
    obj.roads.forEach(r => { if (!r.points || !r.points.length) buildRoadPoints(obj, r); });
    updateAllExits(obj);
    return obj;
  }

  function deserialize(text) {
    return validate(JSON.parse(text));
  }

  function stats(world) {
    const levels = world.towns.map(t => t.level).concat(world.zones.map(z => z.levelMax));
    return {
      towns: world.towns.length,
      roads: world.roads.length,
      zones: world.zones.length,
      pois: world.pois.length,
      roadKm: Math.round(world.roads.reduce((s, r) => s + (r.length || 0), 0) / 100) / 10,
      maxLevel: levels.length ? Math.max.apply(null, levels) : 0
    };
  }

  const api = {
    FORMAT, VERSION, SEA_LEVEL, BIOMES, MONSTERS, POI_TYPES, ZONE_TYPES, DEFAULT_SETTINGS,
    PRNG, hashString, makeNoise2D, fbm, getTerrain,
    emptyWorld, generateWorld, addTown, autoConnect, populateRoad,
    createTown, createRoad, createZone, createPoi,
    moveEntity, removeEntity, refreshRoad, setStartTown,
    computeTownExits, updateAllExits, exitWorldPoint, townTileHalf,
    recomputeLevels, recomputeLevelsSoft, autoLevelZone, autoLevelTown, rerollZoneMonsters, townRadius, defaultTownCfg,
    findTown, findRoad, findZone, findPoi, findAny, kindOf,
    zoneOutline, zoneRadiusAt, pointInZone, distToPolyline, pointOnPolyline,
    serialize, deserialize, validate, stats
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RPGWorld = api;
})(typeof window !== 'undefined' ? window : globalThis);
