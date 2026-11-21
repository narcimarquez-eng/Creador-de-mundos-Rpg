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

  const RANURAS = ['underlayer', 'helmet', 'shoulders', 'torso', 'gloves', 'belt', 'tassets', 'cuisses', 'knees', 'boots', 'weapon', 'shield'];
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

  const GRADOS = {
    D:  { id: 'D',  nombre: 'Grado D',  nivelMin: 1,  mult: 1.00, color: '#94a3b8' },
    C:  { id: 'C',  nombre: 'Grado C',  nivelMin: 8,  mult: 1.15, color: '#34d399' },
    B:  { id: 'B',  nombre: 'Grado B',  nivelMin: 15, mult: 1.35, color: '#38bdf8' },
    A:  { id: 'A',  nombre: 'Grado A',  nivelMin: 23, mult: 1.60, color: '#a78bfa' },
    S:  { id: 'S',  nombre: 'Grado S',  nivelMin: 31, mult: 1.90, color: '#fbbf24' },
    SR: { id: 'SR', nombre: 'Grado SR', nivelMin: 40, mult: 2.30, color: '#fb7185' }
  };

  function gradoDeNivel(nivel) {
    const n = Number(nivel) || 1;
    if (n >= 40) return 'SR';
    if (n >= 31) return 'S';
    if (n >= 23) return 'A';
    if (n >= 15) return 'B';
    if (n >= 8) return 'C';
    return 'D';
  }

  function gradoDePieza(pieza) {
    if (!pieza) return 'D';
    if (pieza.grado && GRADOS[pieza.grado]) return pieza.grado;
    return gradoDeNivel(pieza.nivel);
  }

  function multGrado(pieza) {
    return (pieza && pieza.grado && GRADOS[pieza.grado]) ? GRADOS[pieza.grado].mult : 1.0;
  }

  const esArma = ranura => ranura === 'weapon';
  const esCota = pieza => /cota/i.test(pieza.nombre);

  function claseArmaDePieza(pieza, catalogo = null) {
    if (!pieza || !esArma(pieza.ranura)) return null;
    if (pieza.claseArma) return pieza.claseArma;
    if (catalogo && catalogo.ranuras && Array.isArray(catalogo.ranuras.weapon)) {
      const raw = catalogo.ranuras.weapon.find(w => w.idx === pieza.idx);
      if (raw && raw.claseArma) return raw.claseArma;
      const famRaw = raw && raw.familia;
      const fam = String(pieza.familia || famRaw || '').toLowerCase();
      if (fam === 'arco') return 'arcos';
      if (fam === 'baculo' || fam === 'cetro') return 'bastones';
      if (fam === 'daga') return 'dagas';
      if (fam === 'lanza') return 'lanzas';
      if (fam === 'maza') return 'mazas';
      if (fam === 'mandoble') return 'mandobles';
      if (fam === 'hacha') return /\(2M\)|torre|hoz|guadaña|verdugo|doble/i.test(pieza.nombre || '') ? 'hachas_2m' : 'hachas';
      if (fam === 'espada' || fam === 'legado') return /mandoble|montante|claymore/i.test(pieza.nombre || '') ? 'mandobles' : 'espadas';
    }
    const nom = String(pieza.nombre || '');
    if (/\barco\b/i.test(nom)) return 'arcos';
    if (/b[aá]culo|cetro|vara|bast[oó]n/i.test(nom)) return 'bastones';
    if (/daga|kris|cuchillo|misericordia|punz[oó]n/i.test(nom)) return 'dagas';
    if (/lanza|alabarda|pica|tridente|glaive|partesana|bisarma/i.test(nom)) return 'lanzas';
    if (/maza|martillo|mangual|macuahuitl|porra/i.test(nom)) return 'mazas';
    if (/hacha|labrys|tomahawk|hoz|guadaña/i.test(nom)) return /\(2M\)|torre|hoz|guadaña|verdugo|doble/i.test(nom) ? 'hachas_2m' : 'hachas';
    if (/mandoble|montante|claymore/i.test(nom)) return 'mandobles';
    return 'espadas';
  }

  // Estadísticas base de una pieza según su nivel y grado (D..SR)
  function ataqueBase(pieza) { return Math.round((2 + 1.5 * pieza.nivel) * multGrado(pieza) * 10) / 10; }
  function defensaBase(pieza) { return Math.round((1 + 0.5 * pieza.nivel) * multGrado(pieza) * 10) / 10; }

  // Estado de 0 (malo) a 1 (perfecto). Un objeto malo rinde la mitad que uno perfecto.
  function factorEstado(estado) { return 0.5 + 0.5 * estado; }

  function perfilDeClase(catalogo, clase) {
    return (catalogo && catalogo.perfilesClase && catalogo.perfilesClase[clase]) || null;
  }

  function tipoArmaduraDeClase(catalogo, clase) {
    const perfil = perfilDeClase(catalogo, clase);
    if (perfil && perfil.tipoArmadura) return perfil.tipoArmadura;
    if (clase === 'mago') return 'mago';
    if (clase === 'cazador' || clase === 'picaro') return 'ligera';
    return 'pesada';
  }

  function tieneTipoArmadura(pieza, tipoClase) {
    if (!pieza || !pieza.tipoArmadura) return false;
    return Array.isArray(pieza.tipoArmadura)
      ? pieza.tipoArmadura.includes(tipoClase)
      : pieza.tipoArmadura === tipoClase;
  }

  function esPiezaCompatible(pieza, clase, catalogo) {
    if (!pieza || !clase) return true;
    if (Array.isArray(pieza.clases) && !pieza.clases.includes(clase)) return false;
    const tipoClase = tipoArmaduraDeClase(catalogo, clase);
    if (pieza.tipoArmadura && !tieneTipoArmadura(pieza, tipoClase)) return false;
    const perfil = perfilDeClase(catalogo, clase);
    if (pieza.ranura === 'weapon' && perfil) {
      if (Array.isArray(perfil.clasesArma) && pieza.claseArma) {
        return perfil.clasesArma.includes(pieza.claseArma);
      }
      if (Array.isArray(perfil.familiasArma) && pieza.familia) {
        return perfil.familiasArma.includes(pieza.familia);
      }
    }
    if (perfil && pieza.ranura && !esArma(pieza.ranura)) {
      const enActuales = Array.isArray(perfil.ranuras) && perfil.ranuras.includes(pieza.ranura);
      if (!enActuales) {
        const enFuturas = Array.isArray(perfil.ranurasFuturas) && perfil.ranurasFuturas.includes(pieza.ranura);
        if (!enFuturas) return false;
        return Boolean((Array.isArray(pieza.clases) && pieza.clases.includes(clase)) || tieneTipoArmadura(pieza, tipoClase));
      }
    }
    return true;
  }

  // Lista plana de piezas de una clase, ordenadas por nivel. Cada una lleva su ranura y su id estable.
  // Soporta ranurasFuturas y prioriza armaduras dedicadas por tipoArmadura cuando se añadan al catálogo.
  function piezasDeClase(catalogo, clase) {
    const perfil = perfilDeClase(catalogo, clase);
    const ranuras = (perfil && perfil.ranuras) || (catalogo && catalogo.clases && catalogo.clases[clase]);
    if (!ranuras) throw new Error('Clase sin piezas o desconocida: ' + clase);
    const tipoClase = tipoArmaduraDeClase(catalogo, clase);
    const lista = [];
    const vistas = new Set();
    ranuras.forEach(r => {
      vistas.add(r);
      const compatibles = ((catalogo.ranuras && catalogo.ranuras[r]) || [])
        .map(p => Object.assign({ ranura: r, id: r + '.' + p.idx }, p))
        .filter(p => esPiezaCompatible(p, clase, catalogo));
      if (!esArma(r)) {
        const dedicadas = compatibles.filter(p => tieneTipoArmadura(p, tipoClase));
        (dedicadas.length ? dedicadas : compatibles).forEach(p => lista.push(p));
      } else {
        compatibles.forEach(p => lista.push(p));
      }
    });
    if (perfil && Array.isArray(perfil.ranurasFuturas)) {
      perfil.ranurasFuturas.forEach(r => {
        if (vistas.has(r)) return;
        ((catalogo.ranuras && catalogo.ranuras[r]) || [])
          .map(p => Object.assign({ ranura: r, id: r + '.' + p.idx }, p))
          .filter(p => (p.tipoArmadura || Array.isArray(p.clases)) && esPiezaCompatible(p, clase, catalogo))
          .forEach(p => lista.push(p));
      });
    }
    return lista.sort((a, b) => a.nivel - b.nivel || a.id.localeCompare(b.id));
  }

  let contador = 0;
  // Instancia de una pieza: un objeto concreto con estado, estadísticas y grado (D..SR)
  function instancia(pieza, estado) {
    contador += 1;
    const f = factorEstado(estado);
    const obj = {
      uid: 'o' + contador.toString(36) + Math.floor(Math.random() * 1296).toString(36),
      piezaId: pieza.id, ranura: pieza.ranura, idx: pieza.idx,
      nombre: pieza.nombre, nivel: pieza.nivel, estado
    };
    if (pieza.grado && GRADOS[pieza.grado]) obj.grado = pieza.grado;
    if (pieza.tipoArmadura) obj.tipoArmadura = pieza.tipoArmadura;
    if (pieza.armorLook != null) obj.armorLook = pieza.armorLook;
    if (pieza.familia) obj.familia = pieza.familia;
    if (pieza.claseArma) obj.claseArma = pieza.claseArma;
    if (esArma(pieza.ranura)) obj.ataque = Math.round(ataqueBase(pieza) * f * 10) / 10;
    else obj.defensa = Math.round(defensaBase(pieza) * f * 10) / 10;
    return obj;
  }

  // Personaje nuevo: clase, nombre, inventario con la cota inicial y el arma básica (la de la familia inicial o menor ataque nv 1)
  function crearPersonaje(catalogo, clase, nombre) {
    const perfil = perfilDeClase(catalogo, clase);
    const todas = piezasDeClase(catalogo, clase);
    const inventario = [];
    const equipo = {};
    const iniciales = (perfil && perfil.inicial) || catalogo.inicial || {};
    Object.keys(iniciales).forEach(r => {
      const pieza = todas.find(p => p.ranura === r && p.idx === iniciales[r])
        || ((catalogo.ranuras && catalogo.ranuras[r]) || [])
          .map(p => Object.assign({ ranura: r, id: r + '.' + p.idx }, p))
          .find(p => p.idx === iniciales[r] && esPiezaCompatible(p, clase, catalogo));
      if (!pieza) return;
      const obj = instancia(pieza, 1);
      inventario.push(obj);
      equipo[r] = obj.uid;
    });
    const armasNv1 = todas.filter(p => esArma(p.ranura) && p.nivel === 1);
    const preferidas = perfil && perfil.armaInicialFamilia
      ? armasNv1.filter(p => p.familia === perfil.armaInicialFamilia)
      : [];
    const candidatasArma = preferidas.length ? preferidas : armasNv1;
    const basica = candidatasArma.sort((a, b) => ataqueBase(a) - ataqueBase(b))[0];
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

  // Equipa un objeto del inventario. Lanza un error si no lo tiene, si el nivel no basta o si no es compatible con la clase.
  function equipar(personaje, uid, nivelHeroe, catalogo = null) {
    const o = objeto(personaje, uid);
    if (!o) throw new Error('No tienes ese objeto');
    if (o.tipo === 'hoja') throw new Error('Una hoja se forja en el herrero, no se equipa');
    if (nivelHeroe < o.nivel) throw new Error(o.nombre + ' requiere nivel ' + o.nivel);
    if (catalogo && personaje.clase) {
      const raw = ((catalogo.ranuras && catalogo.ranuras[o.ranura]) || []).find(p => p.idx === o.idx);
      const pieza = raw ? Object.assign({ ranura: o.ranura, id: o.ranura + '.' + raw.idx }, raw) : { ranura: o.ranura, idx: o.idx, nombre: o.nombre, nivel: o.nivel };
      if (!esPiezaCompatible(pieza, personaje.clase, catalogo)) {
        throw new Error(o.nombre + ' no es compatible con tu profesión');
      }
    }
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
      if (cotas.length) {
        const banda = cotas.filter(p => p.nivel <= nivelMonstruo && p.nivel >= nivelMonstruo - RANGO_DROP);
        return banda.length ? banda : cotas.filter(p => p.nivel <= nivelMonstruo);
      }
      const armadurasNv = piezas.filter(p => !esArma(p.ranura) && p.nivel <= nivelMonstruo);
      const bandaArm = armadurasNv.filter(p => p.nivel >= nivelMonstruo - RANGO_DROP);
      return bandaArm.length ? bandaArm : armadurasNv;
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

  // Herrero: forja una pieza básica de entrada (Grado D / nivel 1-2) para una ranura específica y la guarda en inventario.
  function forjarPiezaBasica(personaje, catalogo, ranura, rnd = Math.random) {
    const piezas = piezasDeClase(catalogo, personaje.clase);
    let candidatas = piezas.filter(p => p.ranura === ranura && (p.grado === 'D' || p.nivel <= 2) && p.nivel <= 7);
    if (!candidatas.length) {
      candidatas = piezas.filter(p => p.ranura === ranura && p.nivel <= 2);
    }
    if (!candidatas.length) {
      candidatas = piezas.filter(p => p.ranura === ranura);
    }
    if (!candidatas.length && !perfilDeClase(catalogo, personaje.clase)) {
      candidatas = ((catalogo.ranuras && catalogo.ranuras[ranura]) || []).filter(p => p.nivel <= 2).map(p => Object.assign({ ranura, id: ranura + '.' + p.idx }, p));
    }
    if (!candidatas.length) {
      candidatas = piezas.filter(p => !esArma(p.ranura) && (p.grado === 'D' || p.nivel <= 2));
    }
    if (!candidatas.length) {
      candidatas = piezas.filter(p => !esArma(p.ranura));
    }
    if (!candidatas.length) return null;
    const pieza = candidatas[Math.floor(rnd() * candidatas.length)];
    const calidad = Math.round((0.85 + rnd() * 0.15) * 100) / 100;
    const obj = instancia(pieza, calidad);
    guardar(personaje, obj);
    return obj;
  }

  // Asegura un arma (y desequipar piezas incompatibles) al cambiar o inicializar profesión
  function asegurarArmaDeClase(personaje, catalogo, clase, nivelHeroe = 1) {
    if (!personaje || !catalogo) return null;
    personaje.clase = clase;
    Object.keys(personaje.equipo || {}).forEach(r => {
      const uid = personaje.equipo[r];
      const obj = objeto(personaje, uid);
      if (!obj) { delete personaje.equipo[r]; return; }
      const raw = ((catalogo.ranuras && catalogo.ranuras[obj.ranura]) || []).find(p => p.idx === obj.idx);
      const pieza = raw ? Object.assign({ ranura: obj.ranura, id: obj.ranura + '.' + raw.idx }, raw) : obj;
      if (!esPiezaCompatible(pieza, clase, catalogo)) delete personaje.equipo[r];
    });
    if (personaje.equipo.weapon) {
      const actual = objeto(personaje, personaje.equipo.weapon);
      if (actual) return actual;
    }
    const compatiblesInv = personaje.inventario.filter(o => {
      if (!o || o.tipo === 'hoja' || !esArma(o.ranura) || o.nivel > nivelHeroe) return false;
      const raw = ((catalogo.ranuras && catalogo.ranuras.weapon) || []).find(p => p.idx === o.idx);
      const pieza = raw ? Object.assign({ ranura: 'weapon', id: 'weapon.' + raw.idx }, raw) : o;
      return esPiezaCompatible(pieza, clase, catalogo);
    }).sort((a, b) => b.nivel - a.nivel || (b.ataque || 0) - (a.ataque || 0));
    if (compatiblesInv.length) {
      personaje.equipo.weapon = compatiblesInv[0].uid;
      return compatiblesInv[0];
    }
    const perfil = perfilDeClase(catalogo, clase);
    const todasArmas = piezasDeClase(catalogo, clase).filter(p => esArma(p.ranura) && p.nivel <= Math.max(1, nivelHeroe));
    if (!todasArmas.length) return null;
    let elegida = null;
    if (nivelHeroe <= 4 && perfil && perfil.armaInicialFamilia) {
      elegida = todasArmas.filter(p => p.familia === perfil.armaInicialFamilia).sort((a, b) => a.nivel - b.nivel || ataqueBase(a) - ataqueBase(b))[0] || null;
    }
    if (!elegida) {
      elegida = todasArmas.slice().sort((a, b) => b.nivel - a.nivel || ataqueBase(b) - ataqueBase(a))[0];
    }
    const arma = instancia(elegida, 0.85);
    if (!llena(personaje)) {
      personaje.inventario.push(arma);
    } else {
      const libreIdx = personaje.inventario.findIndex(o => !Object.values(personaje.equipo).includes(o.uid));
      if (libreIdx >= 0) personaje.inventario.splice(libreIdx, 1, arma);
      else personaje.inventario.push(arma);
    }
    personaje.equipo.weapon = arma.uid;
    return arma;
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
  function fabricar(personaje, catalogo, id, nivelHeroe, oro, descuento = 0) {
    const pieza = piezasDeClase(catalogo, personaje.clase).find(p => p.id === id);
    if (!pieza) throw new Error('Pieza no disponible para esta clase: ' + id);
    if (nivelHeroe < pieza.nivel) throw new Error(pieza.nombre + ' requiere nivel ' + pieza.nivel);
    const desc = Math.max(0, Math.min(0.5, Number(descuento) || 0));
    const coste = Math.max(1, Math.round(FORJA_ORO * pieza.nivel * (1 - desc)));
    if (oro < coste) throw new Error('Faltan ' + (coste - oro) + ' de oro');
    guardar(personaje, instancia(pieza, 1));
    return coste;
  }

  // Mercader: piezas que vende a su nivel (cualquiera de la clase con nivel ≤ nivel del héroe)
  function piezasDeTienda(catalogo, clase, nivelHeroe) {
    return piezasDeClase(catalogo, clase).filter(p => p.nivel <= nivelHeroe);
  }

  // Compra una pieza al mercader con calidad estándar. Devuelve el oro que cuesta.
  function comprar(personaje, catalogo, id, nivelHeroe, oro, descuento = 0) {
    const pieza = piezasDeClase(catalogo, personaje.clase).find(p => p.id === id);
    if (!pieza) throw new Error('El mercader no tiene ' + id);
    if (nivelHeroe < pieza.nivel) throw new Error(pieza.nombre + ' requiere nivel ' + pieza.nivel);
    const desc = Math.max(0, Math.min(0.5, Number(descuento) || 0));
    const coste = Math.max(1, Math.round(COMPRA_ORO * pieza.nivel * (1 - desc)));
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
    RANURAS, GRADOS, DROP_NORMAL, FORJA_ORO, COMPRA_ORO, NIVEL_SOLO_COTAS, CAPACIDAD,
    gradoDeNivel, gradoDePieza, claseArmaDePieza,
    perfilDeClase, tipoArmaduraDeClase, esPiezaCompatible, asegurarArmaDeClase,
    piezasDeClase, instancia, crearPersonaje, objeto, equipoPorIdx, equipar,
    armasDeDrop, candidatasDrop, soltarPieza, fabricar, esCota, forjarPiezaBasica,
    soltarArena, soltarHoja, forjarConHoja, HOJA_NIVEL, ARENA_FORJA,
    llena, huecosLibres, piezasDeTienda, comprar, precioVenta, tirar, vender
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EquipoLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
