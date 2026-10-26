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

  // Crea el objeto de partida a partir del estado actual del juego
  function makePartida(o) {
    return {
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
      inv: { gold: Math.floor(o.inv.gold), vida: Math.floor(o.inv.vida), mana: Math.floor(o.inv.mana) },
      visited: (o.visited || []).slice(),
      timeOfDay: o.timeOfDay || 'day'
    };
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
      gold: p.inv.gold, vida: p.inv.vida, mana: p.inv.mana,
      x: p.player.x, z: p.player.z, yaw: p.player.yaw,
      visited: p.visited.slice(), timeOfDay: p.timeOfDay
    };
  }

  const api = {
    FORMAT, VERSION, MAX_PER_WORLD,
    listKey, activeKey, newId,
    readList, writeList, getActiveId, setActiveId,
    makePartida, validate, parsePartida, upsert, remove, restoreFields
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PartidaLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
