// Pruebas de integración de ríos, riachuelos y perfil de pueblos en el mundo.
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const noop = () => {};
const makeCtx = () => ({
  fillStyle: '', strokeStyle: '', lineWidth: 1, globalAlpha: 1, font: '', textAlign: '', textBaseline: '',
  fillRect: noop, strokeRect: noop, clearRect: noop, beginPath: noop, closePath: noop,
  moveTo: noop, lineTo: noop, quadraticCurveTo: noop, bezierCurveTo: noop, arc: noop, ellipse: noop, rect: noop, fill: noop, stroke: noop,
  save: noop, restore: noop, translate: noop, rotate: noop, scale: noop, setTransform: noop,
  createLinearGradient: () => ({ addColorStop: noop }), createRadialGradient: () => ({ addColorStop: noop }),
  getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
  putImageData: noop, fillText: noop, strokeText: noop, drawImage: noop, measureText: () => ({ width: 40 })
});
global.window = global;
global.document = {
  getElementById: () => null,
  createElement: () => ({ width: 256, height: 256, style: {}, getContext: makeCtx, addEventListener: noop, removeEventListener: noop }),
  createElementNS: (_, tag) => global.document.createElement(tag)
};
global.THREE = require('../tools/node_modules/three/build/three.cjs');
const W = require('../js/world-core.js');
const R = require('../js/riachuelos.js');
require('../js/village-core.js');
const VillageLib = global.window.VillageLib;

const ROOT = path.join(__dirname, '..');
const valdris = JSON.parse(fs.readFileSync(path.join(ROOT, 'mundos', 'valdris.mundo.json'), 'utf8'));

let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log('ok -', name);
}

function getHWorldNoRiver(w, T) {
  return (wx, wz) => {
    const hM = (T.elevation(wx, wz) - W.SEA_LEVEL) * 420;
    for (let i = 0; i < w.towns.length; i++) {
      const tw = w.towns[i];
      const cfg = tw.cfg || {};
      const half = W.townTileHalf(cfg.size || 3);
      const rot = (cfg.rotation || 0) * Math.PI / 180;
      const cr = Math.cos(rot), sr = Math.sin(rot);
      const dx = wx - tw.x, dz = wz - tw.y;
      const lx = dx * cr + dz * sr, lz = -dx * sr + dz * cr;
      if (Math.max(Math.abs(lx), Math.abs(lz)) <= half) {
        const h0 = (T.elevation(tw.x, tw.y) - W.SEA_LEVEL) * 420;
        return h0 + W.townSurfaceRel(T, tw, lx, lz);
      }
    }
    return hM;
  };
}

test('ríos principales: nunca flotan sobre el terreno ni reentran al pueblo, y descienden de forma monótona', () => {
  const worlds = [
    { name: 'Valdris', w: JSON.parse(JSON.stringify(valdris)) },
    { name: 'seed42', w: W.generateWorld({ seed: 42 }) },
    { name: 'seed123', w: W.generateWorld({ seed: 123 }) },
    { name: 'seed999', w: W.generateWorld({ seed: 999 }) },
    { name: 'seed2026', w: W.generateWorld({ seed: 2026 }) }
  ];

  for (const { name, w } of worlds) {
    W.calcularRios(w);
    const T = W.getTerrain(w.seed);
    const hAt = getHWorldNoRiver(w, T);

    for (const t of w.towns) {
      const cfg = t.cfg || {};
      if (!cfg.hasRiver) continue;
      assert.ok(cfg.rio && Array.isArray(cfg.rio.pts) && cfg.rio.pts.length >= 2, `${name}/${t.name}: falta cfg.rio.pts`);
      const pts = cfg.rio.pts;
      const rot = (cfg.rotation || 0) * Math.PI / 180;
      const cr = Math.cos(rot), sr = Math.sin(rot);
      const h0 = (T.elevation(t.x, t.y) - W.SEA_LEVEL) * 420;
      const half = W.townTileHalf(cfg.size || 3);
      const toW = p => ({ x: t.x + p.x * cr - p.z * sr, z: t.y + p.x * sr + p.z * cr, y: h0 + p.l });

      // 1. Monotonía no-creciente
      for (let i = 1; i < pts.length; i++) {
        assert.ok(pts[i].l <= pts[i - 1].l + 1e-6, `${name}/${t.name} pt ${i}: agua sube (${pts[i - 1].l} -> ${pts[i].l})`);
      }

      // 2. Ningún punto posterior a idxOut reentra en el cuadrado del pueblo
      if (typeof cfg.rio.idxOut === 'number') {
        for (let i = cfg.rio.idxOut + 1; i < pts.length; i++) {
          const dCheb = Math.max(Math.abs(pts[i].x), Math.abs(pts[i].z));
          assert.ok(dCheb >= half - 1.5, `${name}/${t.name} pt ${i}: río reentra en pueblo (dCheb=${dCheb}, half=${half})`);
        }
      }

      // 3. Ningún punto ni punto medio de segmento flota sobre el terreno (centro ni ambas riberas)
      const wPts = pts.map(toW);
      const accL = [0];
      for (let i = 1; i < wPts.length; i++) {
        accL.push(accL[i - 1] + Math.hypot(wPts[i].x - wPts[i - 1].x, wPts[i].z - wPts[i - 1].z));
      }
      const totL = accL[accL.length - 1] || 1;
      for (let i = 0; i < pts.length; i++) {
        const a = wPts[Math.max(0, i - 1)], b = wPts[Math.min(pts.length - 1, i + 1)];
        const tx = b.x - a.x, tz = b.z - a.z, len = Math.hypot(tx, tz) || 1;
        const nx = -tz / len, nz = tx / len;
        const wCheck = (i >= cfg.rio.idxIn && i <= cfg.rio.idxOut) ? 12.5 : Math.max(12.5, 13.5 * (1 + 0.5 * accL[i] / totL));
        for (const s of [-1, -0.5, 0, 0.5, 1]) {
          const hx = wPts[i].x + nx * s * wCheck;
          const hz = wPts[i].z + nz * s * wCheck;
          const hGround = hAt(hx, hz);
          if (hGround > 1.0) {
            assert.ok(wPts[i].y <= hGround - 0.35, `${name}/${t.name} pt ${i} (s=${s}): agua (${wPts[i].y.toFixed(2)}) flota sobre suelo (${hGround.toFixed(2)})`);
          }
        }
        if (i < pts.length - 1) {
          const p0 = wPts[i], p1 = wPts[i + 1];
          const mx = (p0.x + p1.x) * 0.5, mz = (p0.z + p1.z) * 0.5, my = (p0.y + p1.y) * 0.5;
          const sx = p1.x - p0.x, sz = p1.z - p0.z, sl = Math.hypot(sx, sz) || 1;
          const mnx = -sz / sl, mnz = sx / sl;
          const wMid = (i >= cfg.rio.idxIn && i < cfg.rio.idxOut) ? 12.5 : Math.max(12.5, 13.5 * (1 + 0.5 * 0.5 * (accL[i] + accL[i + 1]) / totL));
          for (const s of [-1, -0.5, 0, 0.5, 1]) {
            const hMid = hAt(mx + mnx * s * wMid, mz + mnz * s * wMid);
            if (hMid > 1.0) {
              assert.ok(my <= hMid - 0.25, `${name}/${t.name} seg ${i} mid (s=${s}): agua (${my.toFixed(2)}) flota sobre suelo (${hMid.toFixed(2)})`);
            }
          }
        }
      }
    }
  }
});

test('riachuelos: nunca flotan en laderas transversales ni en tramos medios', () => {
  const worlds = [
    { name: 'Valdris', w: valdris },
    { name: 'seed42', w: W.generateWorld({ seed: 42 }) },
    { name: 'seed123', w: W.generateWorld({ seed: 123 }) }
  ];
  for (const { name, w } of worlds) {
    const T = W.getTerrain(w.seed);
    const hBase = (x, z) => (T.elevation(x, z) - W.SEA_LEVEL) * 420;
    const xs = w.towns.flatMap(t => [t.x - 500, t.x + 500]);
    const zs = w.towns.flatMap(t => [t.y - 500, t.y + 500]);
    const bounds = { minX: Math.min(...xs) - 600, maxX: Math.max(...xs) + 600, minZ: Math.min(...zs) - 600, maxZ: Math.max(...zs) + 600 };
    const res = R.planearRiachuelos({
      seed: w.seed, bounds, alturaBase: hBase,
      bioma: (x, z) => T.biomeAt(x, z, T.elevation(x, z))
    });
    for (const r of res.riachuelos) {
      for (let i = 0; i < r.pts.length; i++) {
        if (i > 0) assert.ok(r.pts[i].y <= r.pts[i - 1].y + 1e-6, `${name}/${r.id} pt ${i}: riachuelo sube`);
        const a = r.pts[Math.max(0, i - 1)], b = r.pts[Math.min(r.pts.length - 1, i + 1)];
        const tx = b.x - a.x, tz = b.z - a.z, len = Math.hypot(tx, tz) || 1;
        const nx = -tz / len, nz = tx / len;
        const m = r.pts[i].halfW + 0.65;
        for (const s of [-1, 0, 1]) {
          const hg = hBase(r.pts[i].x + nx * s * m, r.pts[i].z + nz * s * m);
          assert.ok(r.pts[i].y <= hg - 0.15, `${name}/${r.id} pt ${i} (s=${s}): agua (${r.pts[i].y.toFixed(2)}) > suelo (${hg.toFixed(2)})`);
        }
        if (i < r.pts.length - 1) {
          const p0 = r.pts[i], p1 = r.pts[i + 1];
          const mx = (p0.x + p1.x) * 0.5, mz = (p0.z + p1.z) * 0.5, my = (p0.y + p1.y) * 0.5;
          const sx = p1.x - p0.x, sz = p1.z - p0.z, sl = Math.hypot(sx, sz) || 1;
          const mMid = Math.max(p0.halfW, p1.halfW) + 0.65;
          for (const s of [-1, 0, 1]) {
            const hMid = hBase(mx - (sz / sl) * s * mMid, mz + (sx / sl) * s * mMid);
            assert.ok(my <= hMid - 0.10, `${name}/${r.id} seg ${i} mid (s=${s}): agua (${my.toFixed(2)}) > suelo (${hMid.toFixed(2)})`);
          }
        }
      }
    }
  }
});

test('pueblos: siguen el perfil del mundo con plaza plana y 0 m de salto/socavón en todo el perímetro', () => {
  const worlds = [valdris, W.generateWorld({ seed: 42 }), W.generateWorld({ seed: 123 })];
  for (const w of worlds) {
    const T = W.getTerrain(w.seed);
    for (const t of w.towns) {
      const cfg = t.cfg || {};
      const half = W.townTileHalf(cfg.size || 3);
      const rot = (cfg.rotation || 0) * Math.PI / 180;
      const cr = Math.cos(rot), sr = Math.sin(rot);
      const h0 = (T.elevation(t.x, t.y) - W.SEA_LEVEL) * 420;

      // Plaza central plana (r <= 16 m)
      for (const [lx, lz] of [[0, 0], [10, 0], [0, -10], [-11, 11], [15.5, 0]]) {
        assert.strictEqual(W.townSurfaceRel(T, t, lx, lz), 0, `${t.name}: plaza no plana en (${lx},${lz})`);
      }

      // Perímetro exacto sin escalón ni socavón
      for (let s = -half; s <= half; s += 8) {
        for (const [lx, lz] of [[s, half], [s, -half], [half, s], [-half, s]]) {
          const wx = t.x + lx * cr - lz * sr, wz = t.y + lx * sr + lz * cr;
          const hMundo = (T.elevation(wx, wz) - W.SEA_LEVEL) * 420;
          const hTown = h0 + W.townSurfaceRel(T, t, lx, lz);
          assert.ok(Math.abs(hTown - hMundo) < 1e-6, `${t.name} borde (${lx},${lz}): salto de ${(hTown - hMundo).toFixed(4)} m`);
        }
      }
    }
  }
});

test('VillageLib: sigue terrainBase + riverLevelFn cuando se inyectan y mantiene modo standalone intacto', () => {
  const w = JSON.parse(JSON.stringify(valdris));
  W.calcularRios(w);
  const T = W.getTerrain(w.seed);

  // Modo standalone (creador-de-pueblos): sin terrainBase ni riverLevelFn
  const kitStandalone = VillageLib.createKit('l2_fantasy');
  const vStand = kitStandalone.createVillage(new THREE.Group(), { skipGround: true, noLights: true });
  vStand.generate(Object.assign({}, w.towns[0].cfg, { style: 'l2_fantasy' }));
  assert.strictEqual(vStand.getRiverLevel(0), -0.65);
  assert.strictEqual(vStand.getRiverLevel(80), -0.65);
  vStand.destroy();

  // Modo mundo (visor-mundo): con terrainBase y riverLevelFn en todos los pueblos de Valdris
  for (const t of w.towns) {
    const style = (t.cfg && t.cfg.style) || 'l2_fantasy';
    const kit = VillageLib.createKit(style);
    const half = W.townTileHalf((t.cfg && t.cfg.size) || 3);
    const pts = (t.cfg && t.cfg.rio && t.cfg.rio.pts) || [];
    const lim = half + 2;
    const dentro = pts.filter(p => Math.abs(p.z) <= lim && Math.abs(p.x) <= lim).slice().sort((a, b) => a.z - b.z);
    const riverLevelFn = dentro.length >= 2 ? (lz => {
      if (lz <= dentro[0].z) return dentro[0].l;
      const last = dentro[dentro.length - 1];
      if (lz >= last.z) return last.l;
      let lo = 0, hi = dentro.length - 1;
      while (lo + 1 < hi) { const mid = (lo + hi) >> 1; if (dentro[mid].z <= lz) lo = mid; else hi = mid; }
      const a = dentro[lo], b = dentro[hi];
      return a.l + (b.l - a.l) * ((lz - a.z) / ((b.z - a.z) || 1));
    }) : (() => -0.65);

    const v = kit.createVillage(new THREE.Group(), {
      skipGround: true, noLights: true,
      terrainBase: (lx, lz) => W.townBaseHeightRel(T, t, lx, lz),
      riverLevelFn
    });
    v.generate(Object.assign({}, t.cfg, { style }));
    assert.strictEqual(v.getTerrainHeight(0, 0), 0);
    if (t.cfg && t.cfg.hasRiver) {
      assert.ok(v.waterMesh, `${t.name}: falta waterMesh`);
      const wPos = v.waterMesh.geometry.attributes.position;
      let diffMax = 0;
      for (let i = 0; i < wPos.count; i++) {
        diffMax = Math.max(diffMax, Math.abs(wPos.getY(i) - v.getRiverLevel(wPos.getZ(i))));
      }
      assert.ok(diffMax < 1e-4, `${t.name}: waterMesh no sigue getRiverLevel (diff=${diffMax})`);
    }
    v.destroy();
  }
});

console.log(`\n${passed} pruebas de ríos y pueblos superadas.`);
