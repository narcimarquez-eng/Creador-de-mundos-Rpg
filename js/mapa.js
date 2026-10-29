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

  const api = { MARGEN_MUNDO, limites, encajar, centrada, frente, pasoRejilla, puebloCercano };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MapaLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
