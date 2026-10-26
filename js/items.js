/*
 * items.js — Oro, pociones, botín y tienda (sin gráficos). Ver docs/COMBATE.md, sección «Economía».
 * Expone window.ItemsLib (o module.exports en Node para las pruebas).
 */
(function (root) {
  "use strict";

  const ITEMS = {
    vida: { name: 'Poción de vida', icon: '🧪', price: 15, healFrac: 0.35 },
    mana: { name: 'Poción de maná', icon: '💧', price: 15, manaFrac: 0.35 }
  };
  const STACK_MAX = 20;
  const DROP = { vida: 0.25, mana: 0.10 };      // probabilidad de soltar una poción (monstruo normal)
  const BOSS_DROP = { vida: 2, mana: 1 };        // botín garantizado de un jefe
  const BOSS_GOLD_MULT = 6;

  function newInventory() { return { gold: 0, vida: 0, mana: 0 }; }

  function monsterGold(level, boss) {
    return Math.round((2 + 1.5 * level) * (boss ? BOSS_GOLD_MULT : 1));
  }

  // rnd: función que devuelve un número en [0, 1)
  function rollLoot(level, boss, rnd) {
    const loot = { gold: monsterGold(level, boss), items: {} };
    if (boss) {
      loot.items.vida = BOSS_DROP.vida;
      loot.items.mana = BOSS_DROP.mana;
    } else {
      if (rnd() < DROP.vida) loot.items.vida = 1;
      if (rnd() < DROP.mana) loot.items.mana = 1;
    }
    return loot;
  }

  // Añade el botín al inventario (respetando el máximo de cada pila). Devuelve un texto para mostrar.
  function addLoot(inv, loot) {
    inv.gold += loot.gold;
    const parts = ['+' + loot.gold + ' 🪙'];
    Object.keys(loot.items).forEach(k => {
      const before = inv[k];
      inv[k] = Math.min(STACK_MAX, inv[k] + loot.items[k]);
      const got = inv[k] - before;
      if (got > 0) parts.push('+' + got + ' ' + ITEMS[k].icon);
    });
    return parts.join(' · ');
  }

  // Usa una poción: cura según el máximo del héroe. Devuelve false si no hay o no hace falta.
  function usePotion(hero, inv, kind) {
    if (!inv[kind] || hero.dead) return false;
    if (kind === 'vida') {
      if (hero.hp >= hero.maxHp) return false;
      hero.hp = Math.min(hero.maxHp, hero.hp + ITEMS.vida.healFrac * hero.maxHp);
    } else {
      if (hero.mp >= hero.maxMp) return false;
      hero.mp = Math.min(hero.maxMp, hero.mp + ITEMS.mana.manaFrac * hero.maxMp);
    }
    inv[kind] -= 1;
    return true;
  }

  // Compra una poción en la tienda. Devuelve false si no hay oro suficiente o la pila está llena.
  function buy(inv, kind) {
    const price = ITEMS[kind].price;
    if (inv.gold < price || inv[kind] >= STACK_MAX) return false;
    inv.gold -= price;
    inv[kind] += 1;
    return true;
  }

  // Descanso en el pueblo: recupera vida y maná en `seconds` segundos completos (4 s por defecto).
  function restTick(hero, dt, seconds) {
    const rate = 1 / (seconds || 4);
    hero.hp = Math.min(hero.maxHp, hero.hp + hero.maxHp * rate * dt);
    hero.mp = Math.min(hero.maxMp, hero.mp + hero.maxMp * rate * dt);
    return hero.hp >= hero.maxHp && hero.mp >= hero.maxMp;   // true cuando ya está completo
  }

  const api = { ITEMS, STACK_MAX, newInventory, monsterGold, rollLoot, addLoot, usePotion, buy, restTick };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ItemsLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
