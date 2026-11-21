/*
 * partida.js — Guardado de partidas, separado del mundo (ver docs/FORMATO-PARTIDA.md).
 * Un mundo puede tener varias partidas. Cada una se guarda en el almacenamiento del navegador
 * (localStorage) y se puede exportar como .partida.json.
 * Expone window.PartidaLib (o module.exports en Node para las pruebas).
 */
(function (root) {
  "use strict";

  const FORMAT = 'rpg-partida';
  const VERSION = 1;
  const MAX_PER_WORLD = 5;

  const listKey = worldId => 'rpgMundo.partidas.' + worldId;
  const activeKey = worldId => 'rpgMundo.partidaActiva.' + worldId;

  function newId() { return 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36); }

  // Lee la lista de partidas de un mundo (las que no son válidas se descartan)
  function readList(store, worldId) {
    let raw = null;
    try { raw = store.getItem(listKey(worldId)); } catch (e) { return []; }
    if (!raw) return [];
    let arr;
    try { arr = JSON.parse(raw); } catch (e) { return []; }
    if (!Array.isArray(arr)) return [];
    return arr.filter(p => { try { validate(p); return true; } catch (e) { return false; } });
  }

  function writeList(store, worldId, list) {
    store.setItem(listKey(worldId), JSON.stringify(list));
  }

  function getActiveId(store, worldId) {
    try { return store.getItem(activeKey(worldId)); } catch (e) { return null; }
  }
  function setActiveId(store, worldId, id) {
    if (id) store.setItem(activeKey(worldId), id);
    else store.removeItem(activeKey(worldId));
  }

  function cleanRostro(rostro) {
    if (!rostro || typeof rostro !== 'object') return null;
    const out = {
      id: String(rostro.id || '').slice(0, 64),
      label: String(rostro.label || '').slice(0, 80),
      gender: rostro.gender === 'mujer' ? 'mujer' : 'hombre',
      bloqueado: !!rostro.bloqueado
    };
    if (rostro.url && typeof rostro.url === 'string') out.url = rostro.url.slice(0, 200);
    if (rostro.cara && typeof rostro.cara === 'object') {
      const cara = {};
      Object.keys(rostro.cara).forEach(k => {
        const v = rostro.cara[k];
        if (typeof v === 'number' && isFinite(v)) cara[k] = round2(v);
        else if (typeof v === 'string' && v.length <= 64) cara[k] = v;
      });
      if (Object.keys(cara).length) out.cara = cara;
    }
    if (rostro.colors && typeof rostro.colors === 'object') {
      const colors = {};
      ['skin', 'lips', 'eyes'].forEach(k => {
        if (typeof rostro.colors[k] === 'string' && rostro.colors[k].length <= 24) colors[k] = rostro.colors[k];
      });
      if (Object.keys(colors).length) out.colors = colors;
    }
    return out;
  }

  function cleanPelo(pelo) {
    if (!pelo || typeof pelo !== 'object') return null;
    const out = {};
    ['cutStyle', 'technique', 'root', 'tip', 'high'].forEach(k => {
      if (typeof pelo[k] === 'string' && pelo[k]) out[k] = pelo[k].slice(0, 48);
    });
    ['length', 'curl', 'crossCenter', 'volume', 'bangs', 'density', 'widthScale'].forEach(k => {
      if (typeof pelo[k] === 'number' && isFinite(pelo[k])) out[k] = round2(pelo[k]);
    });
    return Object.keys(out).length ? out : null;
  }

  // Fija el rostro del personaje una vez iniciado; si ya está bloqueado no se vuelve a alterar
  function fijarRostroInmutable(pj, rostro) {
    if (!pj || typeof pj !== 'object') return null;
    if (pj.rostro && pj.rostro.bloqueado) return pj.rostro;
    const clean = cleanRostro(rostro || pj.rostro);
    if (!clean) return null;
    clean.bloqueado = true;
    pj.rostro = clean;
    return clean;
  }

  function cleanAldeanosCustom(list) {
    if (!Array.isArray(list)) return [];
    return list.filter(a => a && typeof a === 'object' && isFinite(a.x) && isFinite(a.z)).slice(0, 60).map(a => {
      const out = {
        id: String(a.id || newId()).slice(0, 48),
        nombre: String(a.nombre || 'Aldeano').slice(0, 50),
        oficio: String(a.oficio || 'campesino').slice(0, 32),
        modelo: String(a.modelo || 'npc/aldeanos/campesino.glb').slice(0, 120),
        zona: String(a.zona || '').slice(0, 60),
        x: round1(a.x),
        z: round1(a.z),
        yaw: round2(Number(a.yaw) || 0)
      };
      if (typeof a.dialogo === 'string' && a.dialogo) out.dialogo = a.dialogo.slice(0, 200);
      if (a.outfit && typeof a.outfit === 'object') out.outfit = a.outfit;
      const r = cleanRostro(a.rostro);
      if (r) out.rostro = r;
      const h = cleanPelo(a.hair || a.pelo);
      if (h) out.hair = h;
      return out;
    });
  }

  // Personaje elegido al crear la partida: proporciones del estudio, inventario de objetos y equipo (uid por ranura)
  function cleanPersonaje(pj) {
    if (!pj || typeof pj !== 'object') return null;
    const fit = {};
    Object.keys(pj.fit || {}).forEach(k => { if (isFinite(pj.fit[k])) fit[k] = pj.fit[k]; });
    const inventario = (pj.inventario || []).filter(o => o && typeof o.uid === 'string' && typeof o.piezaId === 'string').map(o => {
      const obj = { uid: o.uid, piezaId: o.piezaId, ranura: String(o.ranura), idx: Math.floor(o.idx) || 0, nombre: String(o.nombre || ''), nivel: Math.floor(o.nivel) || 1, estado: Math.max(0, Math.min(1, Number(o.estado) || 0)) };
      if (isFinite(o.ataque)) obj.ataque = o.ataque;
      if (isFinite(o.defensa)) obj.defensa = o.defensa;
      if (isFinite(o.bloqueo)) obj.bloqueo = o.bloqueo;
      if (typeof o.grado === 'string' && o.grado) obj.grado = o.grado.slice(0, 8);
      if (typeof o.tipoArmadura === 'string' && o.tipoArmadura) obj.tipoArmadura = o.tipoArmadura.slice(0, 24);
      if (o.armorLook != null) obj.armorLook = o.armorLook;
      if (typeof o.familia === 'string' && o.familia) obj.familia = o.familia.slice(0, 24);
      if (typeof o.claseArma === 'string' && o.claseArma) obj.claseArma = o.claseArma.slice(0, 24);
      if (o.especial && typeof o.especial === 'object') obj.especial = o.especial;
      if (o.esHoja) obj.esHoja = true;
      if (typeof o.paraRanura === 'string') obj.paraRanura = o.paraRanura;
      if (isFinite(o.paraIdx)) obj.paraIdx = o.paraIdx;
      if (typeof o.paraNombre === 'string') obj.paraNombre = o.paraNombre;
      return obj;
    });
    const equipo = {};
    Object.keys(pj.equipo || {}).forEach(k => { if (typeof pj.equipo[k] === 'string') equipo[k] = pj.equipo[k]; });
    const res = {
      nombre: String(pj.nombre || 'Aventurero').slice(0, 40),
      clase: String(pj.clase || 'guerrero'),
      fit, inventario, equipo
    };
    const rostro = cleanRostro(pj.rostro);
    if (rostro) res.rostro = rostro;
    const pelo = cleanPelo(pj.pelo);
    if (pelo) res.pelo = pelo;
    return res;
  }

  // Crea el objeto de partida a partir del estado actual del juego
  function makePartida(o) {
    const out = {
      format: FORMAT,
      version: VERSION,
      id: o.id || newId(),
      name: o.name || 'Partida',
      worldName: o.worldName || '',
      where: o.where || '',
      worldSeed: o.worldSeed >>> 0,
      savedAt: new Date(o.now || Date.now()).toISOString(),
      player: { x: round1(o.player.x), z: round1(o.player.z), yaw: round2(o.player.yaw || 0) },
      hero: { level: o.hero.level, xp: Math.floor(o.hero.xp), hp: round1(o.hero.hp), mp: round1(o.hero.mp) },
      inv: { gold: Math.floor(o.inv.gold), vida: Math.floor(o.inv.vida), mana: Math.floor(o.inv.mana), arena: Math.floor(o.inv.arena) || 0 },
      visited: (o.visited || []).slice(),
      timeOfDay: o.timeOfDay || 'day',
      personaje: cleanPersonaje(o.personaje),
      heroe: o.heroe && typeof o.heroe === 'object' ? o.heroe : null
    };
    const custom = cleanAldeanosCustom(o.aldeanosCustom);
    if (custom.length) out.aldeanosCustom = custom;
    return out;
  }

  function round1(v) { return Math.round(v * 10) / 10; }
  function round2(v) { return Math.round(v * 100) / 100; }

  // Comprueba que el objeto es una partida válida; lanza un error si no lo es
  function validate(p) {
    if (!p || typeof p !== 'object') throw new Error('No es una partida.');
    if (p.format !== FORMAT) throw new Error('Formato desconocido.');
    if (typeof p.version !== 'number' || p.version > VERSION) throw new Error('Versión no soportada: ' + p.version);
    if (typeof p.id !== 'string' || !p.id) throw new Error('Falta el identificador.');
    if (!p.player || !isFinite(p.player.x) || !isFinite(p.player.z)) throw new Error('Posición no válida.');
    if (!p.hero || !(p.hero.level >= 1) || !(p.hero.xp >= 0)) throw new Error('Héroe no válido.');
    if (!p.inv || !(p.inv.gold >= 0)) throw new Error('Inventario no válido.');
    if (!Array.isArray(p.visited)) throw new Error('Pueblos visitados no válidos.');
    return p;
  }

  function parsePartida(text) {
    return validate(JSON.parse(text));
  }

  // Añade o reemplaza una partida (por id). Devuelve la lista nueva o lanza si está llena.
  function upsert(list, partida) {
    validate(partida);
    const i = list.findIndex(p => p.id === partida.id);
    if (i >= 0) { const copy = list.slice(); copy[i] = partida; return copy; }
    if (list.length >= MAX_PER_WORLD) throw new Error('Ya hay ' + MAX_PER_WORLD + ' partidas en este mundo. Borra una para crear otra.');
    return list.concat([partida]);
  }

  function remove(list, id) { return list.filter(p => p.id !== id); }

  // Datos de la partida que se aplican al héroe (sin tocar estados temporales de combate)
  function restoreFields(p) {
    return {
      level: p.hero.level, xp: p.hero.xp, hp: p.hero.hp, mp: p.hero.mp,
      gold: p.inv.gold, vida: p.inv.vida, mana: p.inv.mana, arena: p.inv.arena || 0,
      x: p.player.x, z: p.player.z, yaw: p.player.yaw,
      visited: p.visited.slice(), timeOfDay: p.timeOfDay, personaje: p.personaje || null, heroe: p.heroe || null,
      aldeanosCustom: cleanAldeanosCustom(p.aldeanosCustom)
    };
  }

  const api = {
    FORMAT, VERSION, MAX_PER_WORLD,
    listKey, activeKey, newId,
    readList, writeList, getActiveId, setActiveId,
    cleanRostro, cleanPelo, cleanAldeanosCustom, fijarRostroInmutable, cleanPersonaje,
    makePartida, validate, parsePartida, upsert, remove, restoreFields
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PartidaLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
