// Pruebas del relieve del mundo (acantilados, cañones, mesetas…). Ejecutar: node test/relieve-mundo.test.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const W = require('../js/world-core.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

const cargar = relieve => {
  const w = W.deserialize(fs.readFileSync(path.join(__dirname, '..', 'mundos', 'valdris.mundo.json'), 'utf8'));
  w.settings.relieve = relieve;
  return w;
};

t('sin relieve el terreno es el de siempre', () => {
  const A = W.getTerrain(4242), B = W.getTerrain(4242, 'ninguno');
  assert.strictEqual(A, B);
  const w = cargar('ninguno');
  assert.strictEqual(W.terrenoMundo(w), W.getTerrain(w.seed));
  const vieja = W.deserialize(JSON.stringify(Object.assign({}, cargar('ninguno'), { settings: {} })));
  assert.strictEqual(vieja.settings.relieve, 'ninguno', 'un mundo antiguo sin el campo no cambia');
});

t('con relieve hay cañones hondos y paredes casi verticales', () => {
  const T = W.getTerrain(4242, 'normal'), B = W.getTerrain(4242);
  let hondo = 0, alto = 0, pared = 0;
  for (let y = -3000; y < 3000; y += 20) for (let x = -3000; x < 3000; x += 20) {
    const d = T.heightAt(x, y) - B.heightAt(x, y);
    if (d < -40) hondo++;
    if (d > 40) alto++;
    if (Math.abs(T.heightAt(x + 1.5, y) - T.heightAt(x - 1.5, y)) / 3 > 2) pared++;
  }
  assert.ok(hondo > 50, 'cañones: ' + hondo);
  assert.ok(alto > 50, 'mesetas y crestas: ' + alto);
  assert.ok(pared > 50, 'paredes de más de 63°: ' + pared);
});

t('los biomas no cambian y ninguna tierra pasa a ser agua', () => {
  const T = W.getTerrain(4242, 'abrupto'), B = W.getTerrain(4242);
  for (let y = -3000; y < 3000; y += 37) for (let x = -3000; x < 3000; x += 37) {
    assert.strictEqual(T.biomeAt(x, y), B.biomeAt(x, y));
    assert.strictEqual(T.biomeAt(x, y, T.elevation(x, y)), B.biomeAt(x, y));
    if (B.heightAt(x, y) > 0) assert.ok(T.heightAt(x, y) > 0, 'tierra hundida bajo el mar en ' + x + ',' + y);
  }
});

t('pueblos, caminos y zonas quedan como sin relieve', () => {
  ['suave', 'normal', 'abrupto'].forEach(niv => {
    const w = cargar(niv);
    const T = W.terrenoMundo(w), B = W.getTerrain(w.seed);
    w.roads.forEach(r => r.points.forEach(p => {
      for (const o of [-20, 0, 20]) assert.ok(Math.abs(T.heightAt(p.x + o, p.y) - B.heightAt(p.x + o, p.y)) < 1e-6, 'camino ' + r.id);
    }));
    w.towns.forEach(tn => {
      const half = W.townTileHalf(tn.cfg.size) * 1.5;
      for (let a = 0; a < 6.28; a += 0.4) for (let r = 0; r < half; r += 25) {
        const x = tn.x + r * Math.cos(a), y = tn.y + r * Math.sin(a);
        assert.ok(Math.abs(T.heightAt(x, y) - B.heightAt(x, y)) < 1e-6, 'pueblo ' + tn.name);
      }
    });
    w.zones.forEach(z => assert.ok(Math.abs(T.heightAt(z.x, z.y) - B.heightAt(z.x, z.y)) < 1e-6, 'zona ' + z.name));
  });
});

t('el terreno del mundo se rehace solo cuando cambia algo que protege', () => {
  const w = cargar('normal');
  const a = W.terrenoMundo(w);
  assert.strictEqual(W.terrenoMundo(w), a);
  W.moveEntity(w, w.towns[1].id, w.towns[1].x + 300, w.towns[1].y);
  const b = W.terrenoMundo(w);
  assert.notStrictEqual(b, a);
  w.settings.relieve = 'abrupto';
  assert.notStrictEqual(W.terrenoMundo(w), b);
});

t('es determinista: misma semilla, mismo relieve', () => {
  const A = W.getTerrain(98765, 'normal');
  const v = A.heightAt(1234.5, -876.25);
  W.getTerrain(98765, 'abrupto');
  assert.strictEqual(W.getTerrain(98765, 'normal').heightAt(1234.5, -876.25), v);
});

console.log(`\n${n} pruebas correctas`);
