/*
 * ruta.js — Ruta a pie por los caminos del mundo (sin gráficos). Lleva al personaje lejos sin atravesar
 * murallas ni agua: sale del pueblo por la puerta de su camino, sigue el trazado fuera de los pueblos y entra
 * en el siguiente por su puerta, pasando por la plaza. Busca el camino más corto (Dijkstra sobre pueblos y
 * caminos); el inicio y el destino pueden estar dentro de un pueblo o en mitad de un camino (una zona de caza).
 * Coordenadas del mapa: x e y (la y es la z del mundo 3D).
 * Expone window.RutaLib (o module.exports en Node para las pruebas).
 */
(function (root) {
  "use strict";

  const PEGADOS = 3;          // puntos a menos de 3 m del anterior se quitan
  const LEJOS_DE_PLAZA = 18;  // dentro de un pueblo, si estás más lejos de la plaza, primero se va a ella
  const BOCA_DE_CALLE = 12;   // al salir, primero a 12 m de la plaza sobre el eje de la calle de salida

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const cheb = (p, c) => Math.max(Math.abs(p.x - c.x), Math.abs(p.y - c.y));
  const longitud = pts => { let L = 0; for (let i = 1; i < pts.length; i++) L += dist(pts[i - 1], pts[i]); return L; };

  // Medio lado del terreno de un pueblo (como townTileHalf de world-core)
  function mitadPorDefecto(t) {
    const size = (t.cfg && t.cfg.size) || 3;
    return Math.max(240, (42 + size * 14 + 65) * 2) / 2;
  }

  const MAX_PENDIENTE_RUTA = 0.48; // algo inferior al 50 % físico del personaje para evitar roces en laderas

  function crearSegmentoLibre(esBloqueado, altura, pasoSondeo) {
    const tieneObstaculos = !!(esBloqueado || altura);
    const paso = pasoSondeo || 1.2;
    return function segmentoLibre(a, b) {
      if (!tieneObstaculos) return true;
      const dx = b.x - a.x, dy = b.y - a.y;
      const L = Math.hypot(dx, dy);
      if (L < 0.5) return true;
      const pasos = Math.max(2, Math.ceil(L / paso));
      const stepLen = L / pasos;
      const skipStart = (esBloqueado && esBloqueado(a.x, a.y)) ? 1.5 : 0.35;
      const skipEnd = (b && b.plaza) ? 5.2 : ((esBloqueado && esBloqueado(b.x, b.y)) ? 2.2 : 0.35);
      let hAnt = altura ? altura(a.x, a.y) : 0;
      for (let k = 1; k <= pasos; k++) {
        const t = k / pasos;
        const x = a.x + dx * t, y = a.y + dy * t;
        // Se omiten tolerancias pequeñas en los extremos por si el inicio/destino está pegado a un muro o fuente
        const lejosExtremos = (t * L > skipStart) && ((1 - t) * L > skipEnd);
        if (esBloqueado && lejosExtremos && esBloqueado(x, y)) return false;
        if (altura) {
          const hAct = altura(x, y);
          const dh = hAct - hAnt;
          if (dh > 0 && (dh / stepLen) > MAX_PENDIENTE_RUTA) return false;
          hAnt = hAct;
        }
      }
      return true;
    };
  }

  function segmentoLibre(a, b, opciones) {
    const op = opciones || {};
    return crearSegmentoLibre(
      typeof op.esBloqueado === 'function' ? op.esBloqueado : null,
      typeof op.altura === 'function' ? op.altura : null,
      op.pasoSondeo || 1.2
    )(a, b);
  }

  function preparar(world, opciones) {
    const op = opciones || {};
    const pueblos = new Map(world.towns.map(t => [t.id, t]));
    const mitad = t => (op.mitad ? op.mitad(t.id) : null) || mitadPorDefecto(t);
    const tieneRadioMuro = typeof op.radioMuro === 'function';
    const radioMuro = t => (tieneRadioMuro ? op.radioMuro(t.id) : null) || mitad(t);
    const salida = (t, r) => (op.salida ? op.salida(t.id, r.id) || [] : []);
    const esBloqueado = typeof op.esBloqueado === 'function' ? op.esBloqueado : null;
    const altura = typeof op.altura === 'function' ? op.altura : null;
    const pasoSondeo = op.pasoSondeo || 1.2;
    const tieneObstaculos = !!(esBloqueado || altura);
    const segLibre = crearSegmentoLibre(esBloqueado, altura, pasoSondeo);

    // Tramo de cada camino fuera de los pueblos, en el sentido from → to
    const caminos = world.roads.map(r => {
      const a = pueblos.get(r.from), b = pueblos.get(r.to);
      if (!a || !b || !r.points || r.points.length < 2) return null;
      const tramo = r.points.filter(p => cheb(p, a) >= mitad(a) && cheb(p, b) >= mitad(b)).map(p => ({ x: p.x, y: p.y }));
      return { r, a, b, tramo };
    }).filter(Boolean);
    return { pueblos, mitad, tieneRadioMuro, radioMuro, salida, caminos, esBloqueado, altura, tieneObstaculos, segmentoLibre: segLibre };
  }

  function puebloEn(ctx, p) {
    for (const t of ctx.pueblos.values()) {
      if (ctx.tieneRadioMuro ? dist(p, t) < ctx.radioMuro(t) : cheb(p, t) < ctx.mitad(t)) return t;
    }
    return null;
  }

  // Comprueba si un segmento directo entre A y B corta la muralla o recinto cerrado de algún pueblo
  function cortaPueblo(A, B, ctx) {
    for (const t of ctx.pueblos.values()) {
      if (ctx.tieneRadioMuro) {
        const rM = ctx.radioMuro(t);
        if (Math.max(A.x, B.x) < t.x - rM || Math.min(A.x, B.x) > t.x + rM ||
            Math.max(A.y, B.y) < t.y - rM || Math.min(A.y, B.y) > t.y + rM) {
          continue;
        }
        const dx = B.x - A.x, dy = B.y - A.y;
        const L2 = dx * dx + dy * dy;
        if (L2 < 1e-9) {
          if (dist(A, t) <= rM) return true;
          continue;
        }
        const u = Math.max(0, Math.min(1, ((t.x - A.x) * dx + (t.y - A.y) * dy) / L2));
        if (Math.hypot(A.x + u * dx - t.x, A.y + u * dy - t.y) <= rM) return true;
        continue;
      }
      const m = ctx.mitad(t);
      const minX = t.x - m, maxX = t.x + m;
      const minY = t.y - m, maxY = t.y + m;
      if (Math.max(A.x, B.x) < minX || Math.min(A.x, B.x) > maxX ||
          Math.max(A.y, B.y) < minY || Math.min(A.y, B.y) > maxY) {
        continue;
      }
      const dx = B.x - A.x, dy = B.y - A.y;
      let t0 = 0, t1 = 1;
      const p = [-dx, dx, -dy, dy];
      const q = [A.x - minX, maxX - A.x, A.y - minY, maxY - A.y];
      let corta = true;
      for (let i = 0; i < 4; i++) {
        if (p[i] === 0) {
          if (q[i] < 0) { corta = false; break; }
        } else {
          const r = q[i] / p[i];
          if (p[i] < 0) {
            if (r > t1) { corta = false; break; }
            if (r > t0) t0 = r;
          } else {
            if (r < t0) { corta = false; break; }
            if (r < t1) t1 = r;
          }
        }
      }
      if (corta && t0 <= t1) return true;
    }
    return false;
  }

  // Punto del tramo más cercano a p: camino, segmento k y el punto proyectado.
  // Si hay comprobación de obstáculos, prefiere el más cercano con línea de visión despejada en banda d <= mejor.d * 2.2 + 120.
  function proyectar(ctx, p) {
    let mejor = null;
    const cands = ctx.tieneObstaculos ? [] : null;
    ctx.caminos.forEach(c => {
      const T = c.tramo;
      for (let k = 0; k < T.length - 1; k++) {
        const ax = T[k].x, ay = T[k].y, bx = T[k + 1].x, by = T[k + 1].y;
        const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1;
        const u = Math.max(0, Math.min(1, ((p.x - ax) * dx + (p.y - ay) * dy) / L2));
        const q = { x: ax + u * dx, y: ay + u * dy };
        const d = dist(p, q);
        const cand = { c, k, q, d };
        if (!mejor || d < mejor.d) mejor = cand;
        if (cands) cands.push(cand);
      }
      if (T.length === 1) {
        const d = dist(p, T[0]);
        const cand = { c, k: 0, q: { x: T[0].x, y: T[0].y }, d };
        if (!mejor || d < mejor.d) mejor = cand;
        if (cands) cands.push(cand);
      }
    });
    if (!ctx.tieneObstaculos || !mejor || !cands) return mejor;
    const limD = mejor.d * 2.2 + 120;
    const cercanos = cands.filter(x => x.d <= limD);
    cercanos.sort((a, b) => a.d - b.d);
    for (let i = 0; i < cercanos.length; i++) {
      if (ctx.segmentoLibre(p, cercanos[i].q)) return cercanos[i];
    }
    return mejor;
  }

  // Rodeo local por rejilla A* con evaluación perezosa de celdas para sortear edificios, agua, laderas escarpadas o muros
  function buscarRodeoLocal(ctx, A, B) {
    const L = dist(A, B);
    if (L > 950) return null;
    const step = L <= 160 ? 1.8 : (L <= 420 ? 4.5 : 9.0);
    const pad = Math.max(36, Math.min(160, L * 0.45));
    const minX = Math.min(A.x, B.x) - pad;
    const minY = Math.min(A.y, B.y) - pad;
    const maxX = Math.max(A.x, B.x) + pad;
    const maxY = Math.max(A.y, B.y) + pad;
    const maxDim = 112;
    const cols = Math.min(maxDim, Math.max(7, Math.ceil((maxX - minX) / step) + 1));
    const rows = Math.min(maxDim, Math.max(7, Math.ceil((maxY - minY) / step) + 1));
    const realStepX = (maxX - minX) / (cols - 1);
    const realStepY = (maxY - minY) / (rows - 1);
    const total = cols * rows;

    const toCell = p => ({
      gx: Math.max(0, Math.min(cols - 1, Math.round((p.x - minX) / realStepX))),
      gy: Math.max(0, Math.min(rows - 1, Math.round((p.y - minY) / realStepY)))
    });
    const toWorld = (gx, gy) => ({ x: minX + gx * realStepX, y: minY + gy * realStepY });

    const s0 = toCell(A), e0 = toCell(B);
    // 0 = sin evaluar, 1 = libre, 2 = bloqueado
    const blocked = new Uint8Array(total);
    const heights = ctx.altura ? new Float32Array(total).fill(NaN) : null;
    const isBlocked = (gx, gy) => {
      const idx = gy * cols + gx;
      const v = blocked[idx];
      if (v !== 0) return v === 2;
      const b = ctx.esBloqueado && ctx.esBloqueado(minX + gx * realStepX, minY + gy * realStepY);
      blocked[idx] = b ? 2 : 1;
      return !!b;
    };
    const getHeight = (gx, gy) => {
      const idx = gy * cols + gx;
      let h = heights[idx];
      if (h !== h) {
        h = ctx.altura(minX + gx * realStepX, minY + gy * realStepY);
        heights[idx] = h;
      }
      return h;
    };

    const buscarCeldaLibreCercana = c0 => {
      if (!isBlocked(c0.gx, c0.gy)) return c0;
      let mejor = null, mejorD = Infinity;
      for (let rad = 1; rad <= 6; rad++) {
        for (let dy = -rad; dy <= rad; dy++) {
          for (let dx = -rad; dx <= rad; dx++) {
            const gx = c0.gx + dx, gy = c0.gy + dy;
            if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) continue;
            if (!isBlocked(gx, gy)) {
              const d = dx * dx + dy * dy;
              if (d < mejorD) { mejorD = d; mejor = { gx, gy }; }
            }
          }
        }
        if (mejor) return mejor;
      }
      return c0;
    };

    const start = buscarCeldaLibreCercana(s0);
    const goal = buscarCeldaLibreCercana(e0);
    const startIdx = start.gy * cols + start.gx;
    const goalIdx = goal.gy * cols + goal.gx;
    blocked[startIdx] = 1;
    blocked[goalIdx] = 1;

    const gScore = new Float32Array(total).fill(Infinity);
    const fScore = new Float32Array(total).fill(Infinity);
    const prev = new Int32Array(total).fill(-1);
    const closed = new Uint8Array(total);
    gScore[startIdx] = 0;
    fScore[startIdx] = Math.hypot((goal.gx - start.gx) * realStepX, (goal.gy - start.gy) * realStepY);

    const heap = [startIdx];
    const heapPush = idx => {
      heap.push(idx);
      let i = heap.length - 1;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (fScore[heap[p]] <= fScore[heap[i]]) break;
        const tmp = heap[p]; heap[p] = heap[i]; heap[i] = tmp;
        i = p;
      }
    };
    const heapPop = () => {
      const top = heap[0];
      const last = heap.pop();
      if (heap.length > 0) {
        heap[0] = last;
        let i = 0;
        const n = heap.length;
        while (true) {
          let best = i;
          const l = (i << 1) + 1, r = l + 1;
          if (l < n && fScore[heap[l]] < fScore[heap[best]]) best = l;
          if (r < n && fScore[heap[r]] < fScore[heap[best]]) best = r;
          if (best === i) break;
          const tmp = heap[i]; heap[i] = heap[best]; heap[best] = tmp;
          i = best;
        }
      }
      return top;
    };

    const dirs = [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];
    const checkMid = !!(ctx.esBloqueado && (realStepX > 2.2 || realStepY > 2.2));

    let found = false;
    while (heap.length > 0) {
      const curr = heapPop();
      if (curr === goalIdx) { found = true; break; }
      if (closed[curr]) continue;
      closed[curr] = 1;

      const cx = curr % cols, cy = (curr / cols) | 0;
      const hCurr = heights ? getHeight(cx, cy) : 0;
      for (let d = 0; d < 8; d++) {
        const nx = cx + dirs[d][0], ny = cy + dirs[d][1];
        if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
        const nIdx = ny * cols + nx;
        if (closed[nIdx] || isBlocked(nx, ny)) continue;
        // Evitar cortar esquinas diagonales por celdas bloqueadas
        if (dirs[d][0] !== 0 && dirs[d][1] !== 0) {
          if (isBlocked(nx, cy) || isBlocked(cx, ny)) continue;
        }
        // Guardia de punto medio para que muros finos no se cuelen en rejillas gruesas
        if (checkMid && nIdx !== goalIdx) {
          const mx = minX + ((cx + nx) * 0.5) * realStepX;
          const my = minY + ((cy + ny) * 0.5) * realStepY;
          if (ctx.esBloqueado(mx, my)) continue;
        }
        const stepDist = Math.hypot(dirs[d][0] * realStepX, dirs[d][1] * realStepY);
        if (heights && nIdx !== goalIdx) {
          const dh = getHeight(nx, ny) - hCurr;
          if (dh > 0 && (dh / stepDist) > MAX_PENDIENTE_RUTA) continue;
        }
        const tentG = gScore[curr] + stepDist;
        if (tentG < gScore[nIdx]) {
          prev[nIdx] = curr;
          gScore[nIdx] = tentG;
          fScore[nIdx] = tentG + Math.hypot((goal.gx - nx) * realStepX, (goal.gy - ny) * realStepY);
          heapPush(nIdx);
        }
      }
    }

    if (!found) return null;

    const raw = [];
    for (let c = goalIdx; c !== -1 && c !== startIdx; c = prev[c]) {
      const gx = c % cols, gy = (c / cols) | 0;
      raw.unshift(toWorld(gx, gy));
    }
    if (!raw.length) return null;
    const destinoPlazaBloqueada = !!(B.plaza && ctx.esBloqueado && ctx.esBloqueado(B.x, B.y));
    if (!destinoPlazaBloqueada) {
      raw[raw.length - 1] = { x: B.x, y: B.y };
    }
    if (B.plaza) raw[raw.length - 1].plaza = true;
    if (B.puerta) raw[raw.length - 1].puerta = true;

    // Suavizado por línea de visión para eliminar escalones de rejilla innecesarios
    const suavizada = [];
    let anchor = { x: A.x, y: A.y };
    let idx = 0;
    while (idx < raw.length) {
      let far = idx;
      for (let j = raw.length - 1; j > idx; j--) {
        if (ctx.segmentoLibre(anchor, raw[j])) { far = j; break; }
      }
      suavizada.push(raw[far]);
      anchor = raw[far];
      idx = far + 1;
    }
    if (suavizada.length) {
      if (B.plaza) suavizada[suavizada.length - 1].plaza = true;
      if (B.puerta) suavizada[suavizada.length - 1].puerta = true;
    }
    return suavizada;
  }

  // Si el punto central de plaza está ocupado por una fuente o monumento, elige un punto libre del anillo de plaza
  function puntoLibrePlaza(ctx, plaza, desdePt, haciaPt) {
    if (!plaza || !plaza.plaza || !ctx.esBloqueado || !ctx.esBloqueado(plaza.x, plaza.y)) {
      return plaza;
    }
    if (haciaPt) {
      let mejorAmbos = null, mejorAmbosD = Infinity;
      let mejorLibre = null, mejorLibreD = Infinity;
      for (let k = 0; k < 8; k++) {
        const ang = (k / 8) * Math.PI * 2;
        const c = { x: plaza.x + Math.cos(ang) * 7.2, y: plaza.y + Math.sin(ang) * 7.2, plaza: true };
        if (ctx.esBloqueado(c.x, c.y)) continue;
        const d = dist(desdePt, c) + dist(c, haciaPt);
        if (ctx.segmentoLibre(desdePt, c) && ctx.segmentoLibre(c, haciaPt)) {
          if (d < mejorAmbosD) { mejorAmbosD = d; mejorAmbos = c; }
        } else if (d < mejorLibreD) {
          mejorLibreD = d; mejorLibre = c;
        }
      }
      return mejorAmbos || mejorLibre || plaza;
    }
    const baseAng = Math.atan2(desdePt.y - plaza.y, desdePt.x - plaza.x);
    const offs = [0, 0.52, -0.52, 1.05, -1.05, 1.57, -1.57, Math.PI];
    for (let i = 0; i < offs.length; i++) {
      const ang = baseAng + offs[i];
      const c = { x: plaza.x + Math.cos(ang) * 5.6, y: plaza.y + Math.sin(ang) * 5.6, plaza: true };
      if (!ctx.esBloqueado(c.x, c.y)) return c;
    }
    return plaza;
  }

  function rodearBloqueos(ctx, desde, puntos) {
    if (!ctx.tieneObstaculos || !puntos || !puntos.length) return puntos;
    const out = [];
    let prev = { x: desde.x, y: desde.y };
    for (let i = 0; i < puntos.length; i++) {
      let target = puntos[i];
      const next = i + 1 < puntos.length ? puntos[i + 1] : null;
      if (target.plaza) {
        const nextSig = (next && dist(target, next) < 5) ? null : next;
        target = puntoLibrePlaza(ctx, target, prev, nextSig);
      }
      if (dist(prev, target) > 2.5 && !ctx.segmentoLibre(prev, target)) {
        const rodeo = buscarRodeoLocal(ctx, prev, target);
        if (rodeo && rodeo.length) {
          for (let k = 0; k < rodeo.length; k++) out.push(rodeo[k]);
        } else {
          out.push(target);
        }
      } else {
        out.push(target);
      }
      prev = out.length ? out[out.length - 1] : target;
    }
    return out;
  }

  // Puntos para salir de un pueblo por un camino: si opciones.salida ya entrega el trazado interior
  // completo (desde el borde de la plaza pasando por la puerta), se usa tal cual; si devuelve el formato
  // clásico de 2 puntos exteriores, antepone BOCA_DE_CALLE sobre el eje hasta el primer punto.
  function saleDe(ctx, t, c) {
    const s = ctx.salida(t, c.r);
    if (!s.length) return [];
    if (s.length >= 2 && dist(s[0], t) < ctx.mitad(t) * 0.65) {
      return s.map(p => Object.assign({}, p));
    }
    const d = dist(s[0], t) || 1;
    return [{ x: t.x + (s[0].x - t.x) / d * BOCA_DE_CALLE, y: t.y + (s[0].y - t.y) / d * BOCA_DE_CALLE }]
      .concat(s.map(p => Object.assign({}, p)));
  }
  const entraEn = (ctx, t, c) => ctx.salida(t, c.r).slice().reverse().map(p => Object.assign({}, p)).concat([{ x: t.x, y: t.y, plaza: true }]);
  // Tramo recorrido en el sentido de un pueblo del camino al otro
  const tramoDesde = (c, t) => (t.id === c.a.id ? c.tramo : c.tramo.slice().reverse());

  // Quita del tramo los puntos que quedan entre la puerta y la plaza (más cerca de ella que el punto de fuera
  // de la puerta), como hace la visor al dibujar los caminos: así no se sale por la puerta para volver atrás.
  function recortar(ctx, tramo, c, tIni, tFin) {
    let i = 0, j = tramo.length;
    const sIni = tIni ? ctx.salida(tIni, c.r) : [], sFin = tFin ? ctx.salida(tFin, c.r) : [];
    if (sIni.length) { const lim = dist(sIni[sIni.length - 1], tIni); while (i < j && dist(tramo[i], tIni) <= lim) i++; }
    if (sFin.length) { const lim = dist(sFin[sFin.length - 1], tFin); while (j > i && dist(tramo[j - 1], tFin) <= lim) j--; }
    return tramo.slice(i, j);
  }

  // Ruta de 'desde' a 'hasta' ({x, y}). Devuelve la lista de puntos a seguir; el último es 'hasta'.
  // Los puntos de plaza llevan plaza: true y los de puertas llevan puerta: true.
  // opciones: { mitad(idPueblo) → m, radioMuro(idPueblo) → m, salida(idPueblo, idCamino) → puntos,
  //             esBloqueado(x, y) → bool, altura(x, y) → metros, pasoSondeo → metros }
  function calcularRuta(world, desde, hasta, opciones) {
    const ctx = preparar(world, opciones);
    const aristas = new Map();   // nodo → [{ a, coste, puntos }]
    const pos = new Map();
    const anadir = (de, a, puntos) => {
      if (!aristas.has(de)) aristas.set(de, []);
      aristas.get(de).push({ a, coste: longitud([pos.get(de)].concat(puntos)), puntos });
    };
    ctx.pueblos.forEach(t => pos.set(t.id, { x: t.x, y: t.y }));
    pos.set('S', { x: desde.x, y: desde.y });
    pos.set('T', { x: hasta.x, y: hasta.y });

    // Caminos completos entre pueblos (en los dos sentidos)
    ctx.caminos.forEach(c => {
      anadir(c.a.id, c.b.id, saleDe(ctx, c.a, c).concat(recortar(ctx, tramoDesde(c, c.a), c, c.a, c.b), entraEn(ctx, c.b, c)));
      anadir(c.b.id, c.a.id, saleDe(ctx, c.b, c).concat(recortar(ctx, tramoDesde(c, c.b), c, c.b, c.a), entraEn(ctx, c.a, c)));
    });

    // Inicio: dentro de un pueblo (empieza en él) o en mitad de un camino
    const tIni = puebloEn(ctx, desde), tFin = puebloEn(ctx, hasta);
    if (tIni && tFin && tIni.id === tFin.id) {
      return rodearBloqueos(ctx, desde, [{ x: hasta.x, y: hasta.y }]);
    }
    let prefijo = [];
    let nodoIni = 'S';
    const pS = tIni ? null : proyectar(ctx, desde);
    if (tIni) {
      nodoIni = tIni.id;
      if (dist(desde, tIni) > LEJOS_DE_PLAZA) prefijo = [{ x: tIni.x, y: tIni.y, plaza: true }];
    } else if (pS) {
      const c = pS.c, T = c.tramo;
      anadir('S', c.a.id, [pS.q].concat(recortar(ctx, T.slice(0, pS.k + 1).reverse(), c, null, c.a), entraEn(ctx, c.a, c)));
      anadir('S', c.b.id, [pS.q].concat(recortar(ctx, T.slice(pS.k + 1), c, null, c.b), entraEn(ctx, c.b, c)));
    }

    // Destino: dentro de un pueblo (se llega a su plaza) o en mitad de un camino
    let nodoFin = 'T';
    const pT = tFin ? null : proyectar(ctx, hasta);
    if (tFin) nodoFin = tFin.id;
    else if (pT) {
      const c = pT.c, T = c.tramo;
      anadir(c.a.id, 'T', saleDe(ctx, c.a, c).concat(recortar(ctx, T.slice(0, pT.k + 1), c, c.a, null), [pT.q]));
      anadir(c.b.id, 'T', saleDe(ctx, c.b, c).concat(recortar(ctx, T.slice(pT.k + 1).reverse(), c, c.b, null), [pT.q]));
      // Mismo camino al principio y al final: se va directo por él
      if (pS && pS.c === c) {
        const tramo = pS.k < pT.k ? T.slice(pS.k + 1, pT.k + 1) : pS.k > pT.k ? T.slice(pT.k + 1, pS.k + 1).reverse() : [];
        anadir('S', 'T', [pS.q].concat(tramo, [pT.q]));
      }
    }

    // Si ambos puntos están fuera de pueblos, la línea recta no corta ningún pueblo y no atraviesa zonas de colisión/agua/acantilados,
    // se conecta directamente S con T para garantizar el camino más corto sin rodeos innecesarios
    if (!tIni && !tFin && !cortaPueblo(desde, hasta, ctx) && ctx.segmentoLibre(desde, hasta)) {
      anadir('S', 'T', [{ x: hasta.x, y: hasta.y }]);
    }

    // Dijkstra (pocos nodos: una búsqueda lineal del mínimo basta)
    const coste = new Map([[nodoIni, 0]]), previo = new Map(), hechos = new Set();
    for (;;) {
      let u = null;
      coste.forEach((v, k) => { if (!hechos.has(k) && (u === null || v < coste.get(u))) u = k; });
      if (u === null || u === nodoFin) break;
      hechos.add(u);
      (aristas.get(u) || []).forEach(e => {
        const nuevo = coste.get(u) + e.coste;
        if (!coste.has(e.a) || nuevo < coste.get(e.a)) { coste.set(e.a, nuevo); previo.set(e.a, { de: u, e }); }
      });
    }

    let basePuntos;
    if (coste.has(nodoFin)) {
      const tramos = [];
      for (let n = nodoFin; n !== nodoIni; n = previo.get(n).de) tramos.unshift(previo.get(n).e.puntos);
      // Si el personaje ya está encaminado en una calle de salida multipunto (con paso directo a un punto
      // de su trazado interior/puerta), avanza desde allí sin retroceder primero a la plaza.
      if (tIni && tramos.length) {
        const firstEdge = tramos[0];
        const limMulti = ctx.mitad(tIni) * 0.65;
        if (firstEdge.length >= 4 && dist(firstEdge[0], tIni) < limMulti && dist(firstEdge[1], tIni) < limMulti) {
          const limExit = (ctx.tieneRadioMuro ? ctx.radioMuro(tIni) : ctx.mitad(tIni)) + 6;
          let endIdx = 0;
          while (endIdx + 1 < firstEdge.length) {
            const dNext = dist(firstEdge[endIdx + 1], tIni);
            const dCurr = dist(firstEdge[endIdx], tIni);
            if (dNext > limExit || dNext < dCurr - 1) break;
            endIdx++;
          }
          const tail = new Array(endIdx + 1);
          tail[endIdx] = 0;
          for (let k = endIdx - 1; k >= 0; k--) tail[k] = tail[k + 1] + dist(firstEdge[k], firstEdge[k + 1]);
          const viaPlaza = (prefijo.length ? dist(desde, tIni) + dist(tIni, firstEdge[0]) : dist(desde, firstEdge[0])) + tail[0];
          let bestK = -1;
          let bestCost = viaPlaza - 4;
          for (let k = 0; k <= endIdx; k++) {
            const cand = dist(desde, firstEdge[k]) + tail[k];
            if (cand < bestCost && ctx.segmentoLibre(desde, firstEdge[k])) {
              bestCost = cand;
              bestK = k;
            }
          }
          if (bestK !== -1) {
            prefijo = [];
            tramos[0] = firstEdge.slice(bestK);
          }
        }
      }
      basePuntos = prefijo.concat(...tramos, [{ x: hasta.x, y: hasta.y }]);
    } else {
      basePuntos = [{ x: hasta.x, y: hasta.y }];
    }

    const puntos = rodearBloqueos(ctx, desde, basePuntos);
    // Quitar puntos pegados al anterior (conservando el destino final y las marcas de puerta)
    const out = [];
    puntos.forEach((p, i) => {
      const ultimo = i === puntos.length - 1;
      if (out.length && dist(out[out.length - 1], p) < PEGADOS) {
        if (ultimo) {
          out[out.length - 1] = p;
        } else if (p.puerta && !out[out.length - 1].puerta) {
          out[out.length - 1] = p;
        } else if (p.puerta) {
          out[out.length - 1].puerta = true;
        }
        return;
      }
      out.push(p);
    });
    return out;
  }

  // Calcula la distancia restante en metros a lo largo de los puntos de una ruta
  function distanciaRestanteRuta(posActual, puntosRuta, indicePuntoActual) {
    if (!puntosRuta || !puntosRuta.length) return 0;
    const idx = Math.max(0, Math.min(puntosRuta.length - 1, indicePuntoActual || 0));
    let d = 0;
    if (posActual) {
      d += dist(posActual, puntosRuta[idx]);
    }
    for (let k = idx; k < puntosRuta.length - 1; k++) {
      d += dist(puntosRuta[k], puntosRuta[k + 1]);
    }
    return Math.round(d);
  }

  const api = { calcularRuta, distanciaRestanteRuta, segmentoLibre };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RutaLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
