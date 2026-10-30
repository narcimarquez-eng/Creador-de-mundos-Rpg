// Pruebas de variedades de monstruos por zona (4–8) y densidades (baja, media, alta, muy alta).
const assert = require('assert');
const W = require('../js/world-core.js');

let n = 0;
function t(nombre, fn) { fn(); n++; console.log('ok -', nombre); }

t('existen exactamente las 4 densidades con cantidades aumentadas en media, alta y muy alta', () => {
  assert.deepStrictEqual(Object.keys(W.MONSTER_DENSITIES), ['baja', 'media', 'alta', 'muy alta']);
  assert.strictEqual(W.monsterCount({ density: 'baja', boss: false }), 1);
  assert.strictEqual(W.monsterCount({ density: 'media', boss: false }), 4);
  assert.strictEqual(W.monsterCount({ density: 'alta', boss: false }), 8);
  assert.strictEqual(W.monsterCount({ density: 'muy alta', boss: false }), 12);
  assert.strictEqual(W.monsterCount({ density: 'muy alta', boss: true }), 1, 'el jefe siempre es único');
  assert.strictEqual(W.monsterCount({ density: 'única', boss: false }), 1, 'compatibilidad con mundos antiguos');
});

t('las zonas creadas por defecto tienen siempre entre 4 y 8 variedades sin repetir especie', () => {
  const vistas = new Set();
  for (let seed = 1; seed <= 8; seed++) {
    const world = W.generateWorld({ name: 'Prueba ' + seed, seed: seed * 137 });
    for (const z of world.zones) {
      if (z.type === 'segura') {
        assert.strictEqual(z.monsters.length, 0);
        continue;
      }
      assert.ok(z.monsters.length >= 4 && z.monsters.length <= 8,
        `zona ${z.name} (${z.type}, r=${z.radius}) tuvo ${z.monsters.length} variedades`);
      const normales = z.monsters.filter(m => !m.boss);
      const unicos = new Set(normales.map(m => m.name));
      assert.strictEqual(unicos.size, normales.length, 'las variedades normales de una misma zona no deben repetirse');
      for (const m of normales) {
        assert.ok(Object.prototype.hasOwnProperty.call(W.MONSTER_DENSITIES, m.density), `densidad desconocida: ${m.density}`);
        vistas.add(m.density);
      }
    }
  }
  assert.strictEqual(vistas.size, 4, 'el generador por defecto reparte las 4 densidades');
});

t('radios extremos (60 m a 900 m) y zonas de jefe se mantienen entre 4 y 8 variedades', () => {
  const w = W.emptyWorld('Bordes', 42);
  for (const r of [60, 140, 220, 400, 900]) {
    for (const type of ['caza', 'elite', 'jefe', 'pvp']) {
      const z = W.createZone(w, 0, 0, { type, radius: r, biome: 'bosque', levelMin: 5, levelMax: 9 });
      assert.ok(z.monsters.length >= 4 && z.monsters.length <= 8,
        `tipo=${type} r=${r} produjo ${z.monsters.length}`);
    }
  }
});

t('migrarMonstruosSiAntiguo actualiza mundos antiguos por defecto pero respeta los editados por el usuario', () => {
  const antiguo = W.generateWorld({ name: 'Antiguo', seed: 99 });
  antiguo.monstruosVersion = 2;
  antiguo.zones[0].monsters = Array.from({ length: 18 }, (_, i) => ({ name: 'Lobo ' + i, level: 2, density: 'baja', boss: false }));
  assert.strictEqual(W.migrarMonstruosSiAntiguo(antiguo), true);
  assert.strictEqual(antiguo.monstruosVersion, 3);
  assert.ok(antiguo.zones[0].monsters.length >= 4 && antiguo.zones[0].monsters.length <= 8);

  const editado = W.generateWorld({ name: 'Editado', seed: 100 });
  editado.monstruosVersion = 2;
  editado.zones[0].monsters = [{ name: 'Mi Dragón', level: 10, density: 'alta', boss: false, enemigo: 'ignisaurio' }];
  W.migrarMonstruosSiAntiguo(editado);
  assert.strictEqual(editado.zones[0].monsters.length, 1);
  assert.strictEqual(editado.zones[0].monsters[0].name, 'Mi Dragón');
});

console.log('\n' + n + ' pruebas de zonas y densidades superadas.');
