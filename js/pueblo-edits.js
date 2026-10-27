// Ediciones manuales de un pueblo: mover o borrar casas y calles internas, y añadir casas.
// Las ediciones son una lista de operaciones en cfg.edits = { base, ops }. «base» identifica la
// distribución del pueblo a la que pertenecen (semilla, tamaño, etc.): si cambia, no se aplican.
// Sin ediciones el pueblo sale igual que antes. Las calles de salida hacia el mundo no se editan.
(function (root) {
  'use strict';

  // Campos que cambian dónde cae cada casa o calle. El giro y las salidas no entran: no mueven el pueblo.
  const BASE_FIELDS = ['style', 'terrainType', 'relief', 'seed', 'size', 'houseDensity', 'specialCount',
    'maxFloors', 'roadWidth', 'curve', 'treeDensity', 'hasWalls', 'hasRiver', 'hasMagic', 'hasProps',
    'hasLamps', 'hasFences'];

  // Operaciones: quitar-casa / mover-casa / añadir-casa usan «id» de casa;
  // quitar-calle / mover-calle usan «id» de calle. Las calles de mover guardan el desplazamiento total.
  const OP_NAMES = {
    'quitar-casa': 'Quitar casa',
    'mover-casa': 'Mover casa',
    'añadir-casa': 'Añadir casa',
    'quitar-calle': 'Quitar calle',
    'mover-calle': 'Mover calle',
    'añadir-calle': 'Dibujar calle',
    'mover-nodo-calle': 'Mover punto de calle',
    'añadir-nodo-calle': 'Añadir punto a calle',
    'quitar-nodo-calle': 'Quitar punto de calle',
    'cambiar-tipo-calle': 'Cambiar tipo de calle',
    'quitar-muro': 'Quitar tramo de muralla',
    'puerta-muro': 'Puerta en la muralla',
    'añadir-farola': 'Poner farola',
    'quitar-farola': 'Quitar farola',
    'quitar-arbol': 'Quitar árbol',
    'añadir-arbol': 'Poner árbol',
    'quitar-valla': 'Quitar tramo de valla',
    'añadir-valla': 'Poner valla',
    'quitar-roca': 'Quitar roca',
    'añadir-roca': 'Poner roca',
    'quitar-seto': 'Quitar seto',
    'añadir-seto': 'Poner seto'
  };

  // Especies de árbol que se pueden poner a mano (modelos de js/arboles.js)
  const TREE_SPECIES = { roble: 'Roble', alamo: 'Álamo', pino: 'Pino', arbusto: 'Arbusto' };

  // Tipos de calle que se pueden dibujar y su anchura (m). «calle» usa la anchura del pueblo.
  const STREET_KINDS = { calle: 'Calle', calzada: 'Calzada', sendero: 'Sendero' };
  function widthFor(kind, roadWidth) {
    if (kind === 'calzada') return 8.5;
    if (kind === 'sendero') return 3.4;
    return roadWidth;
  }

  // El trazado se añade solo si no es el clásico: así las ediciones de los pueblos ya guardados siguen valiendo
  function baseKey(cfg) {
    const trazado = cfg.trazado && cfg.trazado !== 'clasico' ? ';trazado=' + cfg.trazado : '';
    return BASE_FIELDS.map(k => k + '=' + cfg[k]).join(';') + trazado;
  }

  function emptyEdits(cfg) {
    return { base: baseKey(cfg), ops: [] };
  }

  // Ediciones que se aplican a este cfg (null si no hay o son de otra base)
  function activeOps(cfg) {
    const e = cfg && cfg.edits;
    if (!e || !Array.isArray(e.ops) || e.base !== baseKey(cfg)) return null;
    return e.ops;
  }

  // Índice por tipo, leyendo las operaciones en orden (la última gana)
  function indexOps(ops) {
    const idx = {
      removedHouses: new Set(),
      movedHouses: new Map(),
      addedHouses: [],
      removedStreets: new Set(),
      movedStreets: new Map(),
      addedStreets: new Map(),   // id -> { kind, pts: puntos de control }
      removedWalls: new Set(),
      gates: new Set(),
      addedLamps: [],
      removedLamps: new Set(),
      removedTrees: new Set(),
      addedTrees: [],
      removedFences: new Set(),
      addedFences: [],
      removedRocks: new Set(),
      addedRocks: [],
      removedHedges: new Set(),
      addedHedges: []
    };
    (ops || []).forEach(op => {
      if (op.op === 'quitar-casa') idx.removedHouses.add(op.id);
      else if (op.op === 'mover-casa') idx.movedHouses.set(op.id, { x: op.x, z: op.z });
      else if (op.op === 'añadir-casa') idx.addedHouses.push({ id: op.id, x: op.x, z: op.z });
      else if (op.op === 'quitar-calle') idx.removedStreets.add(op.id);
      else if (op.op === 'mover-calle') idx.movedStreets.set(op.id, { dx: op.dx, dz: op.dz });
      else if (op.op === 'añadir-calle') idx.addedStreets.set(op.id, { kind: op.kind || 'calle', pts: op.pts.map(p => ({ x: p.x, z: p.z })) });
      else if (op.op === 'cambiar-tipo-calle') { const s = idx.addedStreets.get(op.id); if (s) s.kind = op.kind; }
      else if (op.op === 'mover-nodo-calle') {
        const s = idx.addedStreets.get(op.id);
        if (s && op.i >= 0 && op.i < s.pts.length) s.pts[op.i] = { x: op.x, z: op.z };
      }
      else if (op.op === 'añadir-nodo-calle') {
        const s = idx.addedStreets.get(op.id);
        if (s && op.i >= 0 && op.i <= s.pts.length) s.pts.splice(op.i, 0, { x: op.x, z: op.z });
      }
      else if (op.op === 'quitar-nodo-calle') {
        const s = idx.addedStreets.get(op.id);
        if (s && s.pts.length > 2 && op.i >= 0 && op.i < s.pts.length) s.pts.splice(op.i, 1);
      }
      else if (op.op === 'quitar-muro') idx.removedWalls.add(op.id);
      else if (op.op === 'puerta-muro') idx.gates.add(op.id);
      else if (op.op === 'añadir-farola') idx.addedLamps.push({ id: op.id, x: op.x, z: op.z });
      else if (op.op === 'quitar-farola') idx.removedLamps.add(op.id);
      else if (op.op === 'quitar-arbol') idx.removedTrees.add(op.id);
      else if (op.op === 'añadir-arbol') idx.addedTrees.push({ id: op.id, x: op.x, z: op.z, especie: op.especie || 'roble' });
      else if (op.op === 'quitar-valla') idx.removedFences.add(op.id);
      else if (op.op === 'añadir-valla') idx.addedFences.push({ id: op.id, x1: op.x1, z1: op.z1, x2: op.x2, z2: op.z2 });
      else if (op.op === 'quitar-roca') idx.removedRocks.add(op.id);
      else if (op.op === 'añadir-roca') idx.addedRocks.push({ id: op.id, x: op.x, z: op.z, escala: op.escala || 1 });
      else if (op.op === 'quitar-seto') idx.removedHedges.add(op.id);
      else if (op.op === 'añadir-seto') idx.addedHedges.push({ id: op.id, x: op.x, z: op.z, rot: op.rot || 0 });
    });
    return idx;
  }

  // Id nuevo para una operación de un tipo: prefijo + número mayor de los existentes («n1», «u2», «g3»…)
  function nextId(ops, opName, prefix) {
    let max = 0;
    (ops || []).forEach(op => {
      if (op.op === opName && op.id.charAt(0) === prefix) max = Math.max(max, parseInt(op.id.slice(1), 10) || 0);
    });
    return prefix + (max + 1);
  }

  // Id nuevo para una casa añadida: «n1», «n2»… sin repetir los de las operaciones existentes
  function nextAddedId(ops) {
    return nextId(ops, 'añadir-casa', 'n');
  }

  // Puntos de control suavizados (Catmull-Rom) muestreados cada «step» metros. La curva pasa por los puntos.
  function curvePts(ctrl, step) {
    const out = [];
    for (let i = 0; i < ctrl.length - 1; i++) {
      const p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(ctrl.length - 1, i + 2)];
      const n = Math.max(1, Math.ceil(Math.hypot(p2.x - p1.x, p2.z - p1.z) / step));
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, d) => 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (3 * b - a - 3 * c + d) * t3);
        out.push({ x: f(p0.x, p1.x, p2.x, p3.x), z: f(p0.z, p1.z, p2.z, p3.z) });
      }
    }
    const last = ctrl[ctrl.length - 1];
    out.push({ x: last.x, z: last.z });
    return out;
  }

  // Punto de una polilínea más cercano a (x, z): índice del segmento, posición y distancia
  function nearestOnPolyline(pts, x, z) {
    let best = null;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const vx = b.x - a.x, vz = b.z - a.z;
      const len2 = vx * vx + vz * vz;
      let t = len2 ? ((x - a.x) * vx + (z - a.z) * vz) / len2 : 0;
      t = Math.max(0, Math.min(1, t));
      const px = a.x + vx * t, pz = a.z + vz * t;
      const d = Math.hypot(x - px, z - pz);
      if (!best || d < best.d) best = { seg: i, x: px, z: pz, d: d };
    }
    return best;
  }

  // Índice del punto de control más cercano a (x, z), dentro de maxDist; -1 si no hay ninguno
  function pickNode(ctrl, x, z, maxDist) {
    const m = maxDist === undefined ? 2.5 : maxDist;
    let best = -1, bestD = m;
    ctrl.forEach((p, i) => {
      const d = Math.hypot(p.x - x, p.z - z);
      if (d <= bestD) { bestD = d; best = i; }
    });
    return best;
  }

  // Elemento más cercano al punto (x, z) dentro de maxDist metros (posición en o.x, o.z)
  function pickNearest(list, x, z, maxDist) {
    let best = null, bestD = maxDist;
    list.forEach(o => {
      const d = Math.hypot(o.x - x, o.z - z);
      if (d <= bestD) { bestD = d; best = o; }
    });
    return best;
  }

  // Casa más cercana al punto (x, z), dentro de maxDist metros
  function pickHouse(houses, x, z, maxDist) {
    return pickNearest(houses, x, z, maxDist === undefined ? 4.5 : maxDist);
  }

  function distToSegment(px, pz, ax, az, bx, bz) {
    const vx = bx - ax, vz = bz - az;
    const len2 = vx * vx + vz * vz;
    let t = len2 ? ((px - ax) * vx + (pz - az) * vz) / len2 : 0;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (ax + vx * t), pz - (az + vz * t));
  }

  // Calle cuyo eje está más cerca del punto, si el punto cae sobre ella (mitad de la anchura + margen)
  function pickStreet(streets, x, z, margin) {
    const m = margin === undefined ? 1.0 : margin;
    let best = null, bestD = Infinity;
    streets.forEach(s => {
      for (let i = 0; i < s.pts.length - 1; i++) {
        const a = s.pts[i], b = s.pts[i + 1];
        const d = distToSegment(x, z, a.x, a.z, b.x, b.z);
        if (d < bestD) { bestD = d; best = s; }
      }
    });
    if (!best) return null;
    const limit = best.width * 0.5 + m;
    return bestD <= limit ? best : null;
  }

  // Desplaza una polilínea (calle) por (dx, dz)
  function offsetPts(pts, dx, dz) {
    if (!dx && !dz) return pts;
    return pts.map(p => ({ x: p.x + dx, z: p.z + dz }));
  }

  function streetLabel(id) {
    if (id.charAt(0) === 'u' && /^u\d+$/.test(id)) return 'Calle dibujada';
    if (id === 'principal') return 'Calle principal';
    if (id === 'este-oeste-izq') return 'Calle este-oeste (oeste)';
    if (id === 'este-oeste-der') return 'Calle este-oeste (este)';
    if (id.indexOf('anillo:') === 0) return 'Calle de anillo';
    if (id.indexOf('especial-') === 0) return 'Acceso a edificio especial';
    if (id.indexOf('acceso-') === 0) return 'Acceso a casa';
    return 'Calle';
  }

  function houseLabel(id) {
    return id.charAt(0) === 'n' && /^n\d+$/.test(id) ? 'Casa nueva' : 'Casa';
  }

  const api = {
    BASE_FIELDS, OP_NAMES, STREET_KINDS, baseKey, emptyEdits, activeOps, indexOps, nextId, nextAddedId,
    widthFor, curvePts, nearestOnPolyline, pickNode, pickNearest, TREE_SPECIES,
    pickHouse, pickStreet, distToSegment, offsetPts, streetLabel, houseLabel
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PuebloEdits = api;
})(typeof window !== 'undefined' ? window : globalThis);
