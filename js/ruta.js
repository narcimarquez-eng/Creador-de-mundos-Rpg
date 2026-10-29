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

  function preparar(world, opciones) {
    const op = opciones || {};
    const pueblos = new Map(world.towns.map(t => [t.id, t]));
    const mitad = t => (op.mitad ? op.mitad(t.id) : null) || mitadPorDefecto(t);
    const salida = (t, r) => (op.salida ? op.salida(t.id, r.id) || [] : []);
    // Tramo de cada camino fuera de los pueblos, en el sentido from → to
    const caminos = world.roads.map(r => {
      const a = pueblos.get(r.from), b = pueblos.get(r.to);
      if (!a || !b || !r.points || r.points.length < 2) return null;
      const tramo = r.points.filter(p => cheb(p, a) >= mitad(a) && cheb(p, b) >= mitad(b)).map(p => ({ x: p.x, y: p.y }));
      return { r, a, b, tramo };
    }).filter(Boolean);
    return { pueblos, mitad, salida, caminos };
  }

  function puebloEn(ctx, p) {
    for (const t of ctx.pueblos.values()) if (cheb(p, t) < ctx.mitad(t)) return t;
    return null;
  }

  // Punto del tramo más cercano a p: camino, segmento k y el punto proyectado
  function proyectar(ctx, p) {
    let mejor = null;
    ctx.caminos.forEach(c => {
      const T = c.tramo;
      for (let k = 0; k < T.length - 1; k++) {
        const ax = T[k].x, ay = T[k].y, bx = T[k + 1].x, by = T[k + 1].y;
        const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1;
        const u = Math.max(0, Math.min(1, ((p.x - ax) * dx + (p.y - ay) * dy) / L2));
        const q = { x: ax + u * dx, y: ay + u * dy };
        const d = dist(p, q);
        if (!mejor || d < mejor.d) mejor = { c, k, q, d };
      }
      if (T.length === 1 && (!mejor || dist(p, T[0]) < mejor.d)) mejor = { c, k: 0, q: { x: T[0].x, y: T[0].y }, d: dist(p, T[0]) };
    });
    return mejor;
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
  // opciones: { mitad(idPueblo) → m, salida(idPueblo, idCamino) → [borde, fuera] (puntos de la puerta) }
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
    if (tIni && tFin && tIni.id === tFin.id) return [{ x: hasta.x, y: hasta.y }];
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
    if (!coste.has(nodoFin)) return [{ x: hasta.x, y: hasta.y }];   // sin camino: en línea recta

    const tramos = [];
    for (let n = nodoFin; n !== nodoIni; n = previo.get(n).de) tramos.unshift(previo.get(n).e.puntos);
    const puntos = prefijo.concat(...tramos, [{ x: hasta.x, y: hasta.y }]);
    // Quitar puntos pegados al anterior (el último, el destino, se mantiene siempre)
    const out = [];
    puntos.forEach((p, i) => {
      const ultimo = i === puntos.length - 1;
      if (out.length && dist(out[out.length - 1], p) < PEGADOS) { if (ultimo) out[out.length - 1] = p; return; }
      out.push(p);
    });
    return out;
  }

  const api = { calcularRuta };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RutaLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
