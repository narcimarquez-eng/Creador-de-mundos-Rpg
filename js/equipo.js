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
  const DROP_NORMAL = 0.12;     // probabilidad de que un monstruo normal suelte algo
  const RANGO_DROP = 2;         // el monstruo suelta piezas de su nivel o de 2 niveles por debajo
  const NIVEL_SOLO_COTAS = 5;   // hasta este nivel de monstruo solo caen cotas
  const FORJA_ORO = 12;         // oro por nivel de la pieza al fabricarla en el herrero
  const COMPRA_ORO = 30;        // oro por nivel de la pieza que vende el mercader (calidad estándar)
  const ESTADO_MERCADO = 0.75;  // estado de lo que vende el mercader
  const VENTA_ORO = 4;          // oro por nivel de un objeto vendido (según su estado)
  const HOJA_NIVEL = 8;         // desde este nivel de monstruo puede caer una hoja de armadura superior
  const HOJA_NORMAL = 0.04;     // probabilidad de hoja en un monstruo normal (el jefe la suelta casi siempre)
  const PIEZA_SUPERIOR = 10;    // las hojas son de piezas de este nivel o superior
  const ARENA_FORJA = 2;        // arena por nivel de la pieza al forjarla con su hoja
  const CAPACIDAD = 50;         // huecos del inventario (los equipados también ocupan hueco)

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
    if (o.tipo === 'hoja') throw new Error('Una hoja se forja en el herrero, no se equipa');
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
    // Las de los N ataques más bajos: con varias armas del mismo ataque (una por familia: espada, arco…) entran todas
    const ataques = [...new Set(armas.map(ataqueBase))].slice(0, 1 + Math.floor(nivelMonstruo / 3));
    return armas.filter(p => ataques.includes(ataqueBase(p)));
  }

  // Piezas que puede soltar un monstruo de ese nivel (lo mismo que usa soltarPieza y el panel del visor)
  function candidatasDrop(catalogo, clase, nivelMonstruo) {
    const piezas = piezasDeClase(catalogo, clase);
    if (nivelMonstruo <= NIVEL_SOLO_COTAS) {
      const cotas = piezas.filter(p => !esArma(p.ranura) && esCota(p));
      const banda = cotas.filter(p => p.nivel <= nivelMonstruo && p.nivel >= nivelMonstruo - RANGO_DROP);
      return banda.length ? banda : cotas.filter(p => p.nivel <= nivelMonstruo);
    }
    const armaduras = piezas.filter(p => !esArma(p.ranura) && p.nivel <= nivelMonstruo && p.nivel >= nivelMonstruo - RANGO_DROP);
    return armaduras.concat(armasDeDrop(catalogo, clase, nivelMonstruo));
  }

  // Monstruo derrotado: a veces suelta un objeto nuevo (una instancia, aunque su nombre ya lo tengas).
  // rnd: función que devuelve un número en [0, 1)
  function soltarPieza(personaje, catalogo, nivelMonstruo, jefe, rnd) {
    if (!jefe && rnd() >= DROP_NORMAL) return null;
    const candidatas = candidatasDrop(catalogo, personaje.clase, nivelMonstruo);
    if (!candidatas.length || llena(personaje)) return null;   // sin hueco no cabe nada
    const pieza = candidatas[Math.floor(rnd() * candidatas.length)];
    return guardar(personaje, instancia(pieza, rnd()));
  }

  function llena(personaje) {
    return personaje.inventario.length >= CAPACIDAD;
  }

  function huecosLibres(personaje) {
    return Math.max(0, CAPACIDAD - personaje.inventario.length);
  }

  // Añade una instancia al inventario, si hay hueco
  function guardar(personaje, obj) {
    if (llena(personaje)) throw new Error('Inventario lleno (' + CAPACIDAD + ' huecos)');
    personaje.inventario.push(obj);
    return obj;
  }

  // Monstruo derrotado: arena (material de forja). Devuelve cuánta suelta.
  function soltarArena(nivelMonstruo, jefe, rnd) {
    if (!jefe && rnd() >= 0.2) return 0;
    return 1 + Math.floor(nivelMonstruo / 5);
  }

  // Monstruo derrotado: a veces una hoja de una armadura o arma superior (nivel ≥ PIEZA_SUPERIOR).
  // La hoja ocupa hueco y se forja en el herrero con arena.
  function soltarHoja(personaje, catalogo, nivelMonstruo, jefe, rnd) {
    if (nivelMonstruo < HOJA_NIVEL) return null;
    if (!jefe && rnd() >= HOJA_NORMAL) return null;
    const superiores = candidatasDrop(catalogo, personaje.clase, nivelMonstruo).filter(p => p.nivel >= PIEZA_SUPERIOR);
    if (!superiores.length || llena(personaje)) return null;
    const pieza = superiores[Math.floor(rnd() * superiores.length)];
    contador += 1;
    const hoja = {
      uid: 'h' + contador.toString(36) + Math.floor(Math.random() * 1296).toString(36),
      tipo: 'hoja', piezaId: pieza.id, ranura: pieza.ranura, idx: pieza.idx,
      nombre: 'Hoja de ' + pieza.nombre, nivel: pieza.nivel
    };
    personaje.inventario.push(hoja);
    return hoja;
  }

  // Herrero: forja la pieza de una hoja con arena. Consume la hoja. Devuelve la arena que cuesta.
  function forjarConHoja(personaje, catalogo, hojaUid, nivelHeroe, arena) {
    const hoja = objeto(personaje, hojaUid);
    if (!hoja || hoja.tipo !== 'hoja') throw new Error('No tienes esa hoja');
    if (nivelHeroe < hoja.nivel) throw new Error(hoja.nombre + ' requiere nivel ' + hoja.nivel);
    const coste = ARENA_FORJA * hoja.nivel;
    if (arena < coste) throw new Error('Faltan ' + (coste - arena) + ' de arena');
    const pieza = piezasDeClase(catalogo, personaje.clase).find(p => p.id === hoja.piezaId);
    if (!pieza) throw new Error('La pieza de la hoja ya no existe');
    personaje.inventario = personaje.inventario.filter(o => o.uid !== hojaUid);
    personaje.inventario.push(instancia(pieza, 1));
    return coste;
  }

  // Herrero: fabrica una pieza de nivel ≤ nivel del héroe con estado perfecto. Devuelve el oro que cuesta.
  function fabricar(personaje, catalogo, id, nivelHeroe, oro) {
    const pieza = piezasDeClase(catalogo, personaje.clase).find(p => p.id === id);
    if (!pieza) throw new Error('Pieza no disponible para esta clase: ' + id);
    if (nivelHeroe < pieza.nivel) throw new Error(pieza.nombre + ' requiere nivel ' + pieza.nivel);
    const coste = FORJA_ORO * pieza.nivel;
    if (oro < coste) throw new Error('Faltan ' + (coste - oro) + ' de oro');
    guardar(personaje, instancia(pieza, 1));
    return coste;
  }

  // Mercader: piezas que vende a su nivel (cualquiera de la clase con nivel ≤ nivel del héroe)
  function piezasDeTienda(catalogo, clase, nivelHeroe) {
    return piezasDeClase(catalogo, clase).filter(p => p.nivel <= nivelHeroe);
  }

  // Compra una pieza al mercader con calidad estándar. Devuelve el oro que cuesta.
  function comprar(personaje, catalogo, id, nivelHeroe, oro) {
    const pieza = piezasDeClase(catalogo, personaje.clase).find(p => p.id === id);
    if (!pieza) throw new Error('El mercader no tiene ' + id);
    if (nivelHeroe < pieza.nivel) throw new Error(pieza.nombre + ' requiere nivel ' + pieza.nivel);
    const coste = COMPRA_ORO * pieza.nivel;
    if (oro < coste) throw new Error('Faltan ' + (coste - oro) + ' de oro');
    guardar(personaje, instancia(pieza, ESTADO_MERCADO));
    return coste;
  }

  // Oro que da vender un objeto: depende de su nivel y su estado. No se puede vender lo equipado.
  function precioVenta(personaje, obj) {
    return Math.max(1, Math.round(VENTA_ORO * obj.nivel * factorEstado(obj.estado)));
  }

  // Quita un objeto del inventario (no equipado). Devuelve el objeto.
  function tirar(personaje, uid) {
    const obj = objeto(personaje, uid);
    if (!obj) throw new Error('No tienes ese objeto');
    if (Object.values(personaje.equipo).includes(uid)) throw new Error('Desequipa ' + obj.nombre + ' antes');
    personaje.inventario = personaje.inventario.filter(o => o.uid !== uid);
    return obj;
  }

  // Vende un objeto no equipado. Devuelve el oro que se recibe.
  function vender(personaje, uid) {
    const obj = objeto(personaje, uid);
    const oro = obj ? precioVenta(personaje, obj) : 0;
    tirar(personaje, uid);
    return oro;
  }

  const api = {
    RANURAS, DROP_NORMAL, FORJA_ORO, COMPRA_ORO, NIVEL_SOLO_COTAS, CAPACIDAD,
    piezasDeClase, instancia, crearPersonaje, objeto, equipoPorIdx, equipar,
    armasDeDrop, candidatasDrop, soltarPieza, fabricar, esCota,
    soltarArena, soltarHoja, forjarConHoja, HOJA_NIVEL, ARENA_FORJA,
    llena, huecosLibres, piezasDeTienda, comprar, precioVenta, tirar, vender
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EquipoLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
