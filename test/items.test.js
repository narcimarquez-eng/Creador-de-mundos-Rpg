// Pruebas de oro, pociones, botín, tienda y descanso. Ejecutar: node test/items.test.js
const assert = require('assert');
const I = require('../js/items.js');
const C = require('../js/combat.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

t('monstruo normal: oro siempre, pociones según probabilidad', () => {
  const none = I.rollLoot(1, false, () => 0.99);
  assert.strictEqual(none.items.vida, undefined);
  assert.strictEqual(none.items.mana, undefined);
  assert.ok(none.gold > 0);
  const vida = I.rollLoot(1, false, () => 0.0);
  assert.strictEqual(vida.items.vida, 1);
  assert.strictEqual(vida.items.mana, 1);
});

t('jefe: botín garantizado y más oro', () => {
  const b = I.rollLoot(4, true, () => 0.99);
  assert.strictEqual(b.items.vida, 2);
  assert.strictEqual(b.items.mana, 1);
  assert.ok(b.gold >= I.monsterGold(4, false) * 5);
});

t('botín: suma oro y pociones, sin pasar del máximo de la pila', () => {
  const inv = I.newInventory();
  I.addLoot(inv, { gold: 10, items: { vida: 1 } });
  assert.strictEqual(inv.gold, 10);
  assert.strictEqual(inv.vida, 1);
  inv.vida = I.STACK_MAX;
  I.addLoot(inv, { gold: 0, items: { vida: 5 } });
  assert.strictEqual(inv.vida, I.STACK_MAX);
});

t('tienda: compra con oro y rechaza si no alcanza', () => {
  const inv = I.newInventory();
  inv.gold = 14;
  assert.strictEqual(I.buy(inv, 'vida'), false);
  inv.gold = 30;
  assert.strictEqual(I.buy(inv, 'vida'), true);
  assert.strictEqual(inv.gold, 15);
  assert.strictEqual(inv.vida, 1);
});

t('tienda: no compra si la pila está llena', () => {
  const inv = I.newInventory();
  inv.gold = 1000;
  inv.mana = I.STACK_MAX;
  assert.strictEqual(I.buy(inv, 'mana'), false);
  assert.strictEqual(inv.gold, 1000);
});

t('poción de vida: cura el 35 % del máximo sin pasarse', () => {
  const h = C.newHero();
  h.hp = 50;
  const inv = { gold: 0, vida: 1, mana: 0 };
  assert.ok(I.usePotion(h, inv, 'vida'));
  assert.ok(Math.abs(h.hp - (50 + 0.35 * h.maxHp)) < 1e-9);
  assert.strictEqual(inv.vida, 0);
  h.hp = h.maxHp - 1; inv.vida = 1;
  I.usePotion(h, inv, 'vida');
  assert.strictEqual(h.hp, h.maxHp);
});

t('poción: no se gasta si no hace falta o no hay ninguna', () => {
  const h = C.newHero();
  const inv = { gold: 0, vida: 1, mana: 0 };
  assert.strictEqual(I.usePotion(h, inv, 'vida'), false);   // vida llena
  assert.strictEqual(inv.vida, 1);
  h.mp = 0;
  assert.strictEqual(I.usePotion(h, inv, 'mana'), false);   // sin pociones de maná
  inv.mana = 1;
  assert.strictEqual(I.usePotion(h, inv, 'mana'), true);
  assert.ok(h.mp > 0);
});

t('descanso: recupera vida y maná completos en unos 4 s', () => {
  const h = C.newHero();
  h.hp = 0.5 * h.maxHp; h.mp = 0;
  let done = false, t = 0;
  while (!done && t < 10) { done = I.restTick(h, 0.1, 4); t += 0.1; }
  assert.ok(done);
  assert.ok(t >= 3.9 && t <= 4.2, 'tiempo: ' + t);
  assert.strictEqual(h.hp, h.maxHp);
  assert.strictEqual(h.mp, h.maxMp);
});

console.log(`\n${n} pruebas correctas`);
