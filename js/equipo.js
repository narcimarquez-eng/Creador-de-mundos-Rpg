/*
 * equipo.js — Piezas de armadura, equipo del personaje y su progreso (sin gráficos). Ver docs/EQUIPO.md.
 * Expone window.EquipoLib (o module.exports en Node para las pruebas).
 *
 * El catálogo (piezas/catalogo.json) vive en el repositorio armaduras-glb y lista cada pieza con su
 * nivel mínimo y su .glb. El personaje sale con las piezas iniciales del catálogo. El resto se consigue
 * con los monstruos (sueltan piezas de su nivel) o fabricándolas en el herrero con oro.
 */
(function (root) {
  "use strict";

  const RANURAS = ['underlayer', 'helmet', 'shoulders', 'torso', 'gloves', 'belt', 'tassets', 'cuisses', 'knees', 'boots', 'weapon'];
  const DROP_NORMAL = 0.04;     // probabilidad de que un monstruo normal suelte una pieza de su nivel
  const RANGO_DROP = 5;         // niveles por debajo del monstruo que puede soltar
  const FORJA_ORO = 12;         // oro por nivel de la pieza al fabricarla en el herrero

  // Lista plana de piezas de una clase, ordenadas por nivel. Cada una lleva su ranura y su id estable.
  function piezasDeClase(catalogo, clase) {
    const ranuras = catalogo.clases[clase];
    if (!ranuras) throw new Error('Clase sin piezas o desconocida: ' + clase);
    const lista = [];
    ranuras.forEach(r => {
      (catalogo.ranuras[r] || []).forEach(p => lista.push(Object.assign({ ranura: r, id: r + '.' + p.idx }, p)));
    });
    return lista.sort((a, b) => a.nivel - b.nivel || a.id.localeCompare(b.id));
  }

  // Personaje nuevo: clase, nombre, equipo inicial (idx por ranura) y piezas que posee
  function crearPersonaje(catalogo, clase, nombre) {
    const todas = piezasDeClase(catalogo, clase);
    const equipo = {};
    RANURAS.forEach(r => { equipo[r] = 0; });            // 0 = «Sin …» en cada ranura
    const posee = [];
    Object.keys(catalogo.inicial).forEach(r => {
      const idx = catalogo.inicial[r];
      if (todas.some(p => p.ranura === r && p.idx === idx)) {
        equipo[r] = idx;
        posee.push(r + '.' + idx);
      }
    });
    return { clase, nombre: nombre || 'Aventurero', equipo, posee };
  }

  function poseePieza(personaje, pieza) {
    return personaje.posee.includes(pieza.id);
  }

  function puedeEquipar(pieza, nivelHeroe) {
    return nivelHeroe >= pieza.nivel;
  }

  // Equipa una pieza que ya posee y cuyo nivel cumple. Lanza un error si no.
  function equipar(personaje, catalogo, id, nivelHeroe) {
    const pieza = piezasDeClase(catalogo, personaje.clase).find(p => p.id === id);
    if (!pieza) throw new Error('Pieza no disponible para esta clase: ' + id);
    if (!poseePieza(personaje, pieza)) throw new Error('Aún no tienes ' + pieza.nombre);
    if (!puedeEquipar(pieza, nivelHeroe)) throw new Error(pieza.nombre + ' requiere nivel ' + pieza.nivel);
    personaje.equipo[pieza.ranura] = pieza.idx;
    return pieza;
  }

  // Monstruo derrotado: suelta una pieza de su nivel que el personaje aún no tiene (o nada).
  // rnd: función que devuelve un número en [0, 1)
  function piezaDeMonstruo(personaje, catalogo, nivelMonstruo, jefe, rnd) {
    if (!jefe && rnd() >= DROP_NORMAL) return null;
    const candidatas = piezasDeClase(catalogo, personaje.clase).filter(p =>
      !poseePieza(personaje, p) && p.nivel <= nivelMonstruo && p.nivel >= nivelMonstruo - RANGO_DROP);
    if (!candidatas.length) return null;
    const elegida = candidatas[Math.floor(rnd() * candidatas.length)];
    personaje.posee.push(elegida.id);
    return elegida;
  }

  // Herrero: fabrica una pieza no poseída de nivel ≤ nivel del héroe. Devuelve el oro que cuesta, o lanza.
  function fabricar(personaje, catalogo, id, nivelHeroe, oro) {
    const pieza = piezasDeClase(catalogo, personaje.clase).find(p => p.id === id);
    if (!pieza) throw new Error('Pieza no disponible para esta clase: ' + id);
    if (poseePieza(personaje, pieza)) throw new Error('Ya tienes ' + pieza.nombre);
    if (!puedeEquipar(pieza, nivelHeroe)) throw new Error(pieza.nombre + ' requiere nivel ' + pieza.nivel);
    const coste = FORJA_ORO * pieza.nivel;
    if (oro < coste) throw new Error('Faltan ' + (coste - oro) + ' de oro');
    personaje.posee.push(pieza.id);
    return coste;
  }

  const api = { RANURAS, DROP_NORMAL, FORJA_ORO, piezasDeClase, crearPersonaje, poseePieza, puedeEquipar, equipar, piezaDeMonstruo, fabricar };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EquipoLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
