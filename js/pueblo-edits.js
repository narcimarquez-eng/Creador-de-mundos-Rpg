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
    'mover-calle': 'Mover calle'
  };

  function baseKey(cfg) {
    return BASE_FIELDS.map(k => k + '=' + cfg[k]).join(';');
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
      movedStreets: new Map()
    };
    (ops || []).forEach(op => {
      if (op.op === 'quitar-casa') idx.removedHouses.add(op.id);
      else if (op.op === 'mover-casa') idx.movedHouses.set(op.id, { x: op.x, z: op.z });
      else if (op.op === 'añadir-casa') idx.addedHouses.push({ id: op.id, x: op.x, z: op.z });
      else if (op.op === 'quitar-calle') idx.removedStreets.add(op.id);
      else if (op.op === 'mover-calle') idx.movedStreets.set(op.id, { dx: op.dx, dz: op.dz });
    });
    return idx;
  }

  // Id nuevo para una casa añadida: «n1», «n2»… sin repetir los de las operaciones existentes
  function nextAddedId(ops) {
    let max = 0;
    (ops || []).forEach(op => {
      if (op.op === 'añadir-casa') max = Math.max(max, parseInt(op.id.slice(1), 10) || 0);
    });
    return 'n' + (max + 1);
  }

  // Casa más cercana al punto (x, z), dentro de maxDist metros
  function pickHouse(houses, x, z, maxDist) {
    let best = null, bestD = maxDist === undefined ? 4.5 : maxDist;
    houses.forEach(h => {
      const d = Math.hypot(h.x - x, h.z - z);
      if (d <= bestD) { bestD = d; best = h; }
    });
    return best;
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
    BASE_FIELDS, OP_NAMES, baseKey, emptyEdits, activeOps, indexOps, nextAddedId,
    pickHouse, pickStreet, distToSegment, offsetPts, streetLabel, houseLabel
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PuebloEdits = api;
})(typeof window !== 'undefined' ? window : globalThis);
