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

  function preparar(world, opciones) {
    const op = opciones || {};
    const pueblos = new Map(world.towns.map(t => [t.id, t]));
    const mitad = t => (op.mitad ? op.mitad(t.id) : null) || mitadPorDefecto(t);
    const salida = (t, r) => (op.salida ? op.salida(t.id, r.id) || [] : []);
    const esBloqueado = typeof op.esBloqueado === 'function' ? op.esBloqueado : null;
    const altura = typeof op.altura === 'function' ? op.altura : null;
    const pasoSondeo = op.pasoSondeo || 4.5;
    const tieneObstaculos = !!(esBloqueado || altura);

    function segmentoLibre(a, b) {
      if (!tieneObstaculos) return true;
      const dx = b.x - a.x, dy = b.y - a.y;
      const L = Math.hypot(dx, dy);
      if (L < 0.5) return true;
      const pasos = Math.max(2, Math.ceil(L / pasoSondeo));
      const stepLen = L / pasos;
      let hAnt = altura ? altura(a.x, a.y) : 0;
      for (let k = 1; k <= pasos; k++) {
        const t = k / pasos;
        const x = a.x + dx * t, y = a.y + dy * t;
        // Se omiten los 2 últimos metros del punto final por si el destino (plaza o NPC) está junto a una fuente o casa
        const lejosExtremos = (t * L > 1.5) && ((1 - t) * L > 2.2);
        if (esBloqueado && lejosExtremos && esBloqueado(x, y)) return false;
        if (altura) {
          const hAct = altura(x, y);
          const dh = hAct - hAnt;
          if (dh > 0 && (dh / stepLen) > MAX_PENDIENTE_RUTA) return false;
          hAnt = hAct;
        }
      }
      return true;
    }

    // Tramo de cada camino fuera de los pueblos, en el sentido from → to
    const caminos = world.roads.map(r => {
      const a = pueblos.get(r.from), b = pueblos.get(r.to);
      if (!a || !b || !r.points || r.points.length < 2) return null;
      const tramo = r.points.filter(p => cheb(p, a) >= mitad(a) && cheb(p, b) >= mitad(b)).map(p => ({ x: p.x, y: p.y }));
      return { r, a, b, tramo };
    }).filter(Boolean);
    return { pueblos, mitad, salida, caminos, esBloqueado, altura, tieneObstaculos, segmentoLibre };
  }

  function puebloEn(ctx, p) {
    for (const t of ctx.pueblos.values()) if (cheb(p, t) < ctx.mitad(t)) return t;
    return null;
  }

  // Comprueba si un segmento directo entre A y B corta la muralla o recinto cerrado de algún pueblo (Liang-Barsky)
  function cortaPueblo(A, B, ctx) {
    for (const t of ctx.pueblos.values()) {
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
  // Si hay comprobación de obstáculos, prefiere un punto con línea de visión despejada si no exige un rodeo enorme.
  function proyectar(ctx, p) {
    let mejor = null;
    let mejorLibre = null;
    ctx.caminos.forEach(c => {
      const T = c.tramo;
      for (let k = 0; k < T.length - 1; k++) {
        const ax = T[k].x, ay = T[k].y, bx = T[k + 1].x, by = T[k + 1].y;
        const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1;
        const u = Math.max(0, Math.min(1, ((p.x - ax) * dx + (p.y - ay) * dy) / L2));
        const q = { x: ax + u * dx, y: ay + u * dy };
        const d = dist(p, q);
        if (!mejor || d < mejor.d) mejor = { c, k, q, d };
        if (ctx.tieneObstaculos && (!mejorLibre || d < mejorLibre.d) && ctx.segmentoLibre(p, q)) {
          mejorLibre = { c, k, q, d };
        }
      }
      if (T.length === 1) {
        const d = dist(p, T[0]);
        const cand = { c, k: 0, q: { x: T[0].x, y: T[0].y }, d };
        if (!mejor || d < mejor.d) mejor = cand;
        if (ctx.tieneObstaculos && (!mejorLibre || d < mejorLibre.d) && ctx.segmentoLibre(p, cand.q)) {
          mejorLibre = cand;
        }
      }
    });
    if (mejorLibre && mejor && mejorLibre.d <= mejor.d * 2.2 + 120) return mejorLibre;
    return mejor;
  }

  // Rodeo local por rejilla A* para sortear edificios, agua, laderas escarpadas o muros en tramos bloqueados
  function buscarRodeoLocal(ctx, A, B) {
    const L = dist(A, B);
    if (L > 950) return null;
    const step = L <= 140 ? 3.5 : (L <= 400 ? 7.5 : 13.0);
    const pad = Math.max(48, Math.min(180, L * 0.48));
    const minX = Math.min(A.x, B.x) - pad;
    const minY = Math.min(A.y, B.y) - pad;
    const maxX = Math.max(A.x, B.x) + pad;
    const maxY = Math.max(A.y, B.y) + pad;
    const cols = Math.min(86, Math.max(7, Math.ceil((maxX - minX) / step) + 1));
    const rows = Math.min(86, Math.max(7, Math.ceil((maxY - minY) / step) + 1));
    const realStepX = (maxX - minX) / (cols - 1);
    const realStepY = (maxY - minY) / (rows - 1);
    const total = cols * rows;

    const toCell = p => ({
      gx: Math.max(0, Math.min(cols - 1, Math.round((p.x - minX) / realStepX))),
      gy: Math.max(0, Math.min(rows - 1, Math.round((p.y - minY) / realStepY)))
    });
    const toWorld = (gx, gy) => ({ x: minX + gx * realStepX, y: minY + gy * realStepY });

    const s0 = toCell(A), e0 = toCell(B);
    const blocked = new Uint8Array(total);
    const heights = ctx.altura ? new Float32Array(total) : null;
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const idx = gy * cols + gx;
        const w = toWorld(gx, gy);
        if (ctx.esBloqueado && ctx.esBloqueado(w.x, w.y)) blocked[idx] = 1;
        if (heights) heights[idx] = ctx.altura(w.x, w.y);
      }
    }

    const buscarCeldaLibreCercana = c0 => {
      const idx0 = c0.gy * cols + c0.gx;
      if (!blocked[idx0]) return c0;
      let mejor = null, mejorD = Infinity;
      for (let rad = 1; rad <= 5; rad++) {
        for (let dy = -rad; dy <= rad; dy++) {
          for (let dx = -rad; dx <= rad; dx++) {
            const gx = c0.gx + dx, gy = c0.gy + dy;
            if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) continue;
            if (!blocked[gy * cols + gx]) {
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
    blocked[startIdx] = 0;
    blocked[goalIdx] = 0;

    const gScore = new Float32Array(total).fill(Infinity);
    const fScore = new Float32Array(total).fill(Infinity);
    const prev = new Int32Array(total).fill(-1);
    const closed = new Uint8Array(total);
    gScore[startIdx] = 0;
    fScore[startIdx] = Math.hypot((goal.gx - start.gx) * realStepX, (goal.gy - start.gy) * realStepY);

    const open = [startIdx];
    const inOpen = new Uint8Array(total);
    inOpen[startIdx] = 1;

    const dirs = [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];

    let found = false;
    while (open.length > 0) {
      let bestPos = 0;
      for (let i = 1; i < open.length; i++) {
        if (fScore[open[i]] < fScore[open[bestPos]]) bestPos = i;
      }
      const curr = open[bestPos];
      open[bestPos] = open[open.length - 1];
      open.pop();
      inOpen[curr] = 0;

      if (curr === goalIdx) { found = true; break; }
      if (closed[curr]) continue;
      closed[curr] = 1;

      const cx = curr % cols, cy = (curr / cols) | 0;
      for (let d = 0; d < 8; d++) {
        const nx = cx + dirs[d][0], ny = cy + dirs[d][1];
        if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
        const nIdx = ny * cols + nx;
        if (closed[nIdx] || blocked[nIdx]) continue;
        // Evitar cortar esquinas diagonales por celdas bloqueadas
        if (dirs[d][0] !== 0 && dirs[d][1] !== 0) {
          if (blocked[cy * cols + nx] && blocked[ny * cols + cx]) continue;
        }
        const stepDist = Math.hypot(dirs[d][0] * realStepX, dirs[d][1] * realStepY);
        if (heights && nIdx !== goalIdx) {
          const dh = heights[nIdx] - heights[curr];
          if (dh > 0 && (dh / stepDist) > MAX_PENDIENTE_RUTA) continue;
        }
        const tentG = gScore[curr] + stepDist;
        if (tentG < gScore[nIdx]) {
          prev[nIdx] = curr;
          gScore[nIdx] = tentG;
          fScore[nIdx] = tentG + Math.hypot((goal.gx - nx) * realStepX, (goal.gy - ny) * realStepY);
          if (!inOpen[nIdx]) { open.push(nIdx); inOpen[nIdx] = 1; }
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
    raw[raw.length - 1] = { x: B.x, y: B.y };

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
    if (B.plaza && suavizada.length) suavizada[suavizada.length - 1].plaza = true;
    return suavizada;
  }

  function rodearBloqueos(ctx, desde, puntos) {
    if (!ctx.tieneObstaculos || !puntos || !puntos.length) return puntos;
    const out = [];
    let prev = { x: desde.x, y: desde.y };
    for (let i = 0; i < puntos.length; i++) {
      const target = puntos[i];
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
      prev = target;
    }
    return out;
  }

  // Puntos para salir de un pueblo por un camino: la boca de la calle de salida (sobre su eje, para no cortar
  // entre las casas) y la puerta. Al entrar, al revés, hasta la plaza: marcada con plaza: true porque en su
  // centro puede haber una fuente; se da por alcanzada antes de llegar a él.
  function saleDe(ctx, t, c) {
    const s = ctx.salida(t, c.r);
    if (!s.length) return [];
    const d = dist(s[0], t) || 1;
    return [{ x: t.x + (s[0].x - t.x) / d * BOCA_DE_CALLE, y: t.y + (s[0].y - t.y) / d * BOCA_DE_CALLE }].concat(s);
  }
  const entraEn = (ctx, t, c) => ctx.salida(t, c.r).slice().reverse().concat([{ x: t.x, y: t.y, plaza: true }]);
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
  // Los puntos de plaza llevan plaza: true (se pueden dar por alcanzados a unos metros).
  // opciones: { mitad(idPueblo) → m, salida(idPueblo, idCamino) → [borde, fuera] (puntos de la puerta),
  //             esBloqueado(x, y) → bool, altura(x, y) → metros }
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
    const basePuntos = coste.has(nodoFin)
      ? (() => {
          const tramos = [];
          for (let n = nodoFin; n !== nodoIni; n = previo.get(n).de) tramos.unshift(previo.get(n).e.puntos);
          return prefijo.concat(...tramos, [{ x: hasta.x, y: hasta.y }]);
        })()
      : [{ x: hasta.x, y: hasta.y }];

    const puntos = rodearBloqueos(ctx, desde, basePuntos);
    // Quitar puntos pegados al anterior (el último, el destino, se mantiene siempre)
    const out = [];
    puntos.forEach((p, i) => {
      const ultimo = i === puntos.length - 1;
      if (out.length && dist(out[out.length - 1], p) < PEGADOS) { if (ultimo) out[out.length - 1] = p; return; }
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

  const api = { calcularRuta, distanciaRestanteRuta };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RutaLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
