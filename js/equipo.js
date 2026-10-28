/*
 * equipo.js — Objetos del personaje (cotas y armas), su estado y los drops (sin gráficos).
 * Ver docs/EQUIPO.md. Expone window.EquipoLib (o module.exports en Node para las pruebas).
 *
 * El catálogo (piezas/catalogo.json, de armaduras-glb) define los modelos y el nivel de cada pieza.
 * Un objeto del juego es una instancia de una pieza: tiene estado (de perfecto a malo) y sus propias
 * estadísticas. Así puede haber varias cotas con el mismo nombre y distinta calidad.
 */
(function (root) {
  "use strict";

  const RANURAS = ['underlayer', 'helmet', 'shoulders', 'torso', 'gloves', 'belt', 'tassets', 'cuisses', 'knees', 'boots', 'weapon'];
  const DROP_NORMAL = 0.05;     // probabilidad de que un monstruo normal suelte algo
  const RANGO_DROP = 5;         // niveles por debajo del monstruo que puede soltar una pieza
  const NIVEL_SOLO_COTAS = 5;   // hasta este nivel de monstruo solo caen cotas
  const FORJA_ORO = 12;         // oro por nivel de la pieza al fabricarla en el herrero

  const esArma = ranura => ranura === 'weapon';
  const esCota = pieza => /cota/i.test(pieza.nombre);

  // Estadísticas base de una pieza según su nivel
  function ataqueBase(pieza) { return 2 + 1.5 * pieza.nivel; }
  function defensaBase(pieza) { return 1 + 0.5 * pieza.nivel; }

  // Estado de 0 (malo) a 1 (perfecto). Un objeto malo rinde la mitad que uno perfecto.
  function factorEstado(estado) { return 0.5 + 0.5 * estado; }

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

  let contador = 0;
  // Instancia de una pieza: un objeto concreto con estado y estadísticas
  function instancia(pieza, estado) {
    contador += 1;
    const f = factorEstado(estado);
    const obj = {
      uid: 'o' + contador.toString(36) + Math.floor(Math.random() * 1296).toString(36),
      piezaId: pieza.id, ranura: pieza.ranura, idx: pieza.idx,
      nombre: pieza.nombre, nivel: pieza.nivel, estado
    };
    if (esArma(pieza.ranura)) obj.ataque = Math.round(ataqueBase(pieza) * f * 10) / 10;
    else obj.defensa = Math.round(defensaBase(pieza) * f * 10) / 10;
    return obj;
  }

  // Personaje nuevo: clase, nombre, inventario con la cota inicial y el arma básica (la de menor ataque de nivel 1)
  function crearPersonaje(catalogo, clase, nombre) {
    const todas = piezasDeClase(catalogo, clase);
    const inventario = [];
    const equipo = {};
    Object.keys(catalogo.inicial).forEach(r => {
      const pieza = todas.find(p => p.ranura === r && p.idx === catalogo.inicial[r]);
      if (!pieza) return;
      const obj = instancia(pieza, 1);
      inventario.push(obj);
      equipo[r] = obj.uid;
    });
    const basica = todas.filter(p => esArma(p.ranura) && p.nivel === 1).sort((a, b) => ataqueBase(a) - ataqueBase(b))[0];
    if (basica && !equipo.weapon) {
      const arma = instancia(basica, 1);
      inventario.push(arma);
      equipo.weapon = arma.uid;
    }
    return { clase, nombre: nombre || 'Aventurero', inventario, equipo };
  }

  function objeto(personaje, uid) {
    return personaje.inventario.find(o => o.uid === uid) || null;
  }

  // Índice de piezas equipadas por ranura (lo que usa el estudio para generar el cuerpo)
  function equipoPorIdx(personaje) {
    const out = {};
    RANURAS.forEach(r => { out[r] = 0; });
    Object.keys(personaje.equipo).forEach(r => {
      const o = objeto(personaje, personaje.equipo[r]);
      if (o) out[r] = o.idx;
    });
    return out;
  }

  // Equipa un objeto del inventario. Lanza un error si no lo tiene o si el nivel no basta.
  function equipar(personaje, uid, nivelHeroe) {
    const o = objeto(personaje, uid);
    if (!o) throw new Error('No tienes ese objeto');
    if (nivelHeroe < o.nivel) throw new Error(o.nombre + ' requiere nivel ' + o.nivel);
    personaje.equipo[o.ranura] = o.uid;
    return o;
  }

  // Armas que pueden caer de un monstruo de ese nivel: las de menor ataque primero.
  // Al principio solo caen las peores; el abanico se abre con el nivel del monstruo.
  function armasDeDrop(catalogo, clase, nivelMonstruo) {
    const armas = piezasDeClase(catalogo, clase)
      .filter(p => esArma(p.ranura) && p.nivel <= nivelMonstruo && p.nivel >= nivelMonstruo - RANGO_DROP)
      .sort((a, b) => ataqueBase(a) - ataqueBase(b));
    if (!armas.length) {
      // Ninguna en el rango: la más débil que ya esté disponible
      const todas = piezasDeClase(catalogo, clase).filter(p => esArma(p.ranura) && p.nivel <= nivelMonstruo);
      return todas.sort((a, b) => ataqueBase(a) - ataqueBase(b)).slice(0, 1);
    }
    return armas.slice(0, 1 + Math.floor(nivelMonstruo / 3));
  }

  // Monstruo derrotado: a veces suelta un objeto nuevo (una instancia, aunque su nombre ya lo tengas).
  // Hasta el nivel NIVEL_SOLO_COTAS solo caen cotas; después, armaduras y armas de su nivel.
  // rnd: función que devuelve un número en [0, 1)
  function soltarPieza(personaje, catalogo, nivelMonstruo, jefe, rnd) {
    if (!jefe && rnd() >= DROP_NORMAL) return null;
    let candidatas;
    if (nivelMonstruo <= NIVEL_SOLO_COTAS) {
      candidatas = piezasDeClase(catalogo, personaje.clase)
        .filter(p => !esArma(p.ranura) && esCota(p) && p.nivel <= nivelMonstruo);
    } else {
      candidatas = piezasDeClase(catalogo, personaje.clase)
        .filter(p => !esArma(p.ranura) && p.nivel <= nivelMonstruo && p.nivel >= nivelMonstruo - RANGO_DROP);
      candidatas = candidatas.concat(armasDeDrop(catalogo, personaje.clase, nivelMonstruo));
    }
    if (!candidatas.length) return null;
    const pieza = candidatas[Math.floor(rnd() * candidatas.length)];
    const obj = instancia(pieza, rnd());
    personaje.inventario.push(obj);
    return obj;
  }

  // Herrero: fabrica una pieza de nivel ≤ nivel del héroe con estado perfecto. Devuelve el oro que cuesta.
  function fabricar(personaje, catalogo, id, nivelHeroe, oro) {
    const pieza = piezasDeClase(catalogo, personaje.clase).find(p => p.id === id);
    if (!pieza) throw new Error('Pieza no disponible para esta clase: ' + id);
    if (nivelHeroe < pieza.nivel) throw new Error(pieza.nombre + ' requiere nivel ' + pieza.nivel);
    const coste = FORJA_ORO * pieza.nivel;
    if (oro < coste) throw new Error('Faltan ' + (coste - oro) + ' de oro');
    const obj = instancia(pieza, 1);
    personaje.inventario.push(obj);
    return coste;
  }

  const api = {
    RANURAS, DROP_NORMAL, FORJA_ORO, NIVEL_SOLO_COTAS,
    piezasDeClase, instancia, crearPersonaje, objeto, equipoPorIdx, equipar,
    armasDeDrop, soltarPieza, fabricar, esCota
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EquipoLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
