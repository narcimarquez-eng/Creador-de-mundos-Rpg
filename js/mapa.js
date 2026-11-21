/*
 * mapa.js — Geometría del mapa del mundo (sin gráficos): límites, escalas, orientación y rejilla.
 * Convención: x crece hacia la derecha y y hacia abajo del mapa; la y del mapa es la z del mundo 3D,
 * y el norte está arriba (z negativa). El frente del personaje es (sin yaw, cos yaw), como en la visor.
 * Expone window.MapaLib (o module.exports en Node para las pruebas).
 */
(function (root) {
  "use strict";

  const MARGEN_MUNDO = 500;   // metros alrededor de cada pueblo que cuentan para los límites
  const PASOS_REJILLA = [100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000];
  const CHUNK_TERRENO = 64;
  const PASOS_ESCALA = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000];

  // Caja que contiene pueblos, zonas, caminos y lugares de interés
  function limites(world) {
    const xs = [], ys = [];
    world.towns.forEach(t => { xs.push(t.x - MARGEN_MUNDO, t.x + MARGEN_MUNDO); ys.push(t.y - MARGEN_MUNDO, t.y + MARGEN_MUNDO); });
    world.zones.forEach(z => { xs.push(z.x - z.radius, z.x + z.radius); ys.push(z.y - z.radius, z.y + z.radius); });
    world.roads.forEach(r => r.points.forEach(p => { xs.push(p.x); ys.push(p.y); }));
    (world.pois || []).forEach(p => { xs.push(p.x); ys.push(p.y); });
    if (!xs.length) return { minX: -1000, maxX: 1000, minY: -1000, maxY: 1000 };
    const min = a => a.reduce((m, v) => Math.min(m, v), Infinity);
    const max = a => a.reduce((m, v) => Math.max(m, v), -Infinity);
    return { minX: min(xs), maxX: max(xs), minY: min(ys), maxY: max(ys) };
  }

  // Escala uniforme que encaja la caja en un lienzo, centrada, con margen en píxeles.
  // Devuelve las funciones de paso de metros a píxeles y la inversa (píxeles a metros).
  function encajar(lim, ancho, alto, margen) {
    const w = lim.maxX - lim.minX, h = lim.maxY - lim.minY;
    const escala = Math.min((ancho - 2 * margen) / w, (alto - 2 * margen) / h);
    const ox = margen + (ancho - 2 * margen - w * escala) / 2;
    const oy = margen + (alto - 2 * margen - h * escala) / 2;
    return {
      escala,
      px: x => ox + (x - lim.minX) * escala,
      py: y => oy + (y - lim.minY) * escala,
      mundo: (px, py) => ({ x: lim.minX + (px - ox) / escala, y: lim.minY + (py - oy) / escala })
    };
  }

  // Vista centrada en un punto: radioM metros desde el centro hasta el borde de un lienzo cuadrado de lado píxeles
  function centrada(cx, cy, radioM, lado) {
    const escala = (lado / 2) / radioM;
    return {
      escala,
      px: x => lado / 2 + (x - cx) * escala,
      py: y => lado / 2 + (y - cy) * escala
    };
  }

  // Vector unitario del frente del personaje en el mapa (x, y). yaw = giro alrededor del eje vertical.
  function frente(yaw) {
    return { dx: Math.sin(yaw), dy: Math.cos(yaw) };
  }

  // Paso de la rejilla: el más pequeño que deja como mucho 10 líneas en la extensión dada
  function pasoRejilla(extension) {
    return PASOS_REJILLA.find(p => extension / p <= 10) || PASOS_REJILLA[PASOS_REJILLA.length - 1];
  }

  // Pueblo más cercano a un punto del mapa, con su distancia en metros
  function puebloCercano(world, x, y) {
    let mejor = null, mejorD = Infinity;
    world.towns.forEach(t => {
      const d = Math.hypot(t.x - x, t.y - y);
      if (d < mejorD) { mejorD = d; mejor = t; }
    });
    return mejor ? { town: mejor, d: mejorD } : null;
  }

  // Cámara estilo Creador de Mundos: calcula { cx, cy, scale } para encajar un recuadro en el lienzo
  function encajarVista(lim, ancho, alto, margen = 36) {
    const w = Math.max(1, lim.maxX - lim.minX);
    const h = Math.max(1, lim.maxY - lim.minY);
    const availW = Math.max(40, ancho - 2 * margen);
    const availH = Math.max(40, alto - 2 * margen);
    const scale = Math.min(1.5, Math.max(0.004, Math.min(availW / w, availH / h)));
    return {
      cx: (lim.minX + lim.maxX) / 2,
      cy: (lim.minY + lim.maxY) / 2,
      scale
    };
  }

  // Transformación bidireccional mundo <-> pantalla equivalente a toScreen/toWorld del Creador de Mundos
  function crearTransformacionVista(view, ancho, alto) {
    const escala = view.scale;
    const hw = ancho / 2, hh = alto / 2;
    const px = x => (x - view.cx) * escala + hw;
    const py = y => (y - view.cy) * escala + hh;
    const toScreen = (x, y) => ({ x: px(x), y: py(y) });
    const toWorld = (sx, sy) => ({ x: (sx - hw) / escala + view.cx, y: (sy - hh) / escala + view.cy });
    return { escala, px, py, toScreen, toWorld, mundo: toWorld };
  }

  // Zoom centrado en un punto de pantalla (sx, sy), manteniendo fijo el punto del mundo bajo el cursor
  function zoomVistaEn(view, ancho, alto, sx, sy, factor, minEsc = 0.004, maxEsc = 4) {
    const t0 = crearTransformacionVista(view, ancho, alto);
    const before = t0.toWorld(sx, sy);
    const scale = Math.min(maxEsc, Math.max(minEsc, view.scale * factor));
    const hw = ancho / 2, hh = alto / 2;
    return {
      cx: before.x - (sx - hw) / scale,
      cy: before.y - (sy - hh) / scale,
      scale
    };
  }

  // Escala gráfica legible en metros / kilómetros para el visor 2D
  function escalaBonita(scale, targetPx = 110) {
    const esc = Math.max(1e-6, scale);
    const target = targetPx / esc;
    const m = PASOS_ESCALA.find(s => s >= target * 0.5) || PASOS_ESCALA[PASOS_ESCALA.length - 1];
    return {
      metros: m,
      px: Math.round(m * esc),
      texto: m >= 1000 ? (m / 1000) + ' km' : m + ' m'
    };
  }

  // Muestrea un chunk de terreno (elevación + bioma + sombreado topográfico) idéntico a renderChunk() de index.html
  function muestrearChunkTerreno(terrain, W, lod, cx, cy, chunkSize = CHUNK_TERRENO) {
    const mpp = Math.pow(2, lod);
    const x0 = cx * chunkSize * mpp;
    const y0 = cy * chunkSize * mpp;
    const N = chunkSize + 1;
    const elev = new Float32Array(N * N);
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        elev[j * N + i] = terrain.elevation(x0 + i * mpp, y0 + j * mpp);
      }
    }
    const data = new Uint8ClampedArray(chunkSize * chunkSize * 4);
    const SEA = W.SEA_LEVEL;
    const slopeK = 1100 / Math.sqrt(mpp + 4);
    for (let j = 0; j < chunkSize; j++) {
      for (let i = 0; i < chunkSize; i++) {
        const e = elev[j * N + i];
        const x = x0 + i * mpp;
        const y = y0 + j * mpp;
        const b = terrain.biomeAt(x, y, e);
        const bioDef = W.BIOMES[b] || W.BIOMES.pradera;
        let r, g, bl;
        if (bioDef.water) {
          const k = Math.min(1, Math.max(0, (SEA - e) / 0.12));
          r = 74 - 50 * k;
          g = 135 - 85 * k;
          bl = 175 - 85 * k;
        } else {
          const col = bioDef.color;
          const slope = ((e - elev[j * N + i + 1]) + (e - elev[(j + 1) * N + i])) / mpp;
          const shade = Math.max(0.62, Math.min(1.35, 1 + slope * slopeK)) * (0.92 + (e - SEA) * 0.35);
          r = col[0] * shade;
          g = col[1] * shade;
          bl = col[2] * shade;
        }
        const o = (j * chunkSize + i) * 4;
        data[o] = r;
        data[o + 1] = g;
        data[o + 2] = bl;
        data[o + 3] = 255;
      }
    }
    return data;
  }

  const api = {
    MARGEN_MUNDO,
    CHUNK_TERRENO,
    limites,
    encajar,
    centrada,
    frente,
    pasoRejilla,
    puebloCercano,
    encajarVista,
    crearTransformacionVista,
    zoomVistaEn,
    escalaBonita,
    muestrearChunkTerreno
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MapaLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
