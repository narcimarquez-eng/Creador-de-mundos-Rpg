// Pruebas del motor de VFX de combate importado del Estudio de Armaduras.
// Ejecutar: node test/combat-vfx-estudio.test.js
const assert = require('assert');
const path = require('path');
const V = require('../js/combat-vfx-estudio.js');
const C = require('../js/combat.js');

const { pathToFileURL } = require('url');
let THREE = null;

let n = 0;
function t(name, fn) {
  try { fn(); n++; console.log('  ✓ ' + name); }
  catch (e) { console.error('  ✗ ' + name + '\n    ' + (e && e.stack || e)); process.exit(1); }
}

t('todas las habilidades de arma tienen perfil VFX del Estudio con su arma correcta', () => {
  let total = 0;
  for (const [clase, ids] of Object.entries(C.WEAPON_SKILLS_BY_CLASS)) {
    for (const id of ids) {
      const p = V.SKILL_VFX_PROFILES[id];
      assert.ok(p, 'falta perfil VFX para ' + id);
      assert.strictEqual(p.armaClase, clase, id + ' debe pertenecer a ' + clase);
      assert.ok(V.BODY_ENERGY_PRESETS[p.element], id + ' elemento válido');
      assert.ok(Array.isArray(p.colors) && p.colors.length >= 2);
      total++;
    }
  }
  assert.ok(total >= 49, 'se esperaban >= 49 habilidades de arma, hay ' + total);
  for (const id of ['attack', 'disparo', 'orbe_arcano']) assert.ok(V.SKILL_VFX_PROFILES[id], 'perfil básico ' + id);
});

t('ondas, rayos, haces y ataques a distancia del Estudio presentes', () => {
  const P = V.SKILL_VFX_PROFILES;
  const kinds = id => (P[id].wave || []).map(w => w.kind);
  assert.ok(kinds('sw_lightning').includes('crescent'));
  assert.ok(kinds('gs_crescent').includes('crescent'));
  assert.ok(kinds('sw_celestial').includes('vertical') && P.sw_celestial.skyPillar);
  assert.ok(kinds('gs_skybreak').includes('vertical') && P.gs_skybreak.skyPillar);
  assert.ok(kinds('sw_cross').includes('cross1') && kinds('sw_cross').includes('cross2'));
  assert.ok(P.st_solar.beam);
  assert.ok(P.st_judgment.beam && P.st_judgment.skyPillar);
  assert.strictEqual(P.st_meteor.meteors.length, 3);
  assert.ok(P.st_meteor.wave.length >= 3);
  const bowModes = Object.values(P).filter(p => p.armaClase === 'arcos').map(p => p.bowMode);
  for (const m of ['bolt', 'double', 'frost', 'aerial', 'barrage', 'prism']) assert.ok(bowModes.includes(m), 'falta arco ' + m);
});

(async () => {
try {
  THREE = await import(pathToFileURL(path.join(__dirname, '..', 'tools', 'node_modules', 'three', 'build', 'three.module.js')).href);
} catch (e) { THREE = null; }
if (THREE) {
  function crearEscena() {
    const scene = new THREE.Scene();
    const heroRoot = new THREE.Group();
    const model = new THREE.Group();
    heroRoot.add(model);
    const hand = new THREE.Object3D(); hand.name = 'Hand_R'; model.add(hand);
    const huesos = {
      Ankle_L: [-0.12, 0.08, 0], Knee_L: [-0.12, 0.5, 0], Thigh_L: [-0.12, 0.92, 0], Pelvis: [0, 0.98, 0],
      Torso: [0, 1.3, 0], Neck: [0, 1.58, 0], Head: [0, 1.72, 0],
      Shoulder_L: [-0.22, 1.5, 0], Elbow_L: [-0.32, 1.22, 0], Wrist_L: [-0.36, 0.98, 0],
      Shoulder_R: [0.22, 1.5, 0], Elbow_R: [0.32, 1.22, 0], Wrist_R: [0.36, 0.98, 0],
      Thigh_R: [0.12, 0.92, 0], Knee_R: [0.12, 0.5, 0], Ankle_R: [0.12, 0.08, 0]
    };
    for (const [nm, p] of Object.entries(huesos)) { const b = new THREE.Bone(); b.name = nm; b.position.set(p[0], p[1], p[2]); model.add(b); }
    const base = new THREE.Object3D(); base.name = 'WeaponBase'; base.position.set(0.3, 1.1, 0.2); hand.add(base);
    const tip = new THREE.Object3D(); tip.name = 'WeaponTip'; tip.position.set(0.3, 1.9, 0.6); hand.add(tip);
    for (const nm of ['BowTop', 'BowBot', 'BowNock']) { const o = new THREE.Object3D(); o.name = nm; model.add(o); }
    scene.add(heroRoot);
    heroRoot.updateMatrixWorld(true);
    const camera = new THREE.PerspectiveCamera(50, 1.6, 0.1, 500);
    camera.position.set(0, 3, -8); camera.lookAt(0, 1, 0); camera.updateMatrixWorld(true);
    const mgr = new V.Manager(scene, THREE);
    mgr.bindHeroModel(model, heroRoot);
    return { scene, heroRoot, model, camera, mgr };
  }
  function simular(mgr, camera, id, segs, lock) {
    const target = new THREE.Vector3(0, 1, 12);
    assert.strictEqual(mgr.startSkill(id, { lock, range: 14 }, { targetPos: target, duration: lock, getGroundY: () => 0 }), true);
    const estados = [];
    const dt = 1 / 30;
    for (let i = 0; i * dt < segs; i++) {
      mgr.update(dt, camera, { name: id, elapsed: i * dt, duration: lock, hasNative: true });
      estados.push(mgr.getDebugState());
    }
    return estados;
  }

  t('Manager: marcadores de arma/arco enlazados', () => {
    const { mgr } = crearEscena();
    const d = mgr.getDebugState();
    assert.strictEqual(d.hasWeaponMarkers, true);
    assert.strictEqual(d.hasBowMarkers, true);
    assert.strictEqual(mgr.hasProfile('sw_lightning'), true);
    assert.strictEqual(mgr.hasProfile('no_existe'), false);
  });

  t('Manager: sw_lightning lanza rayos corporales y onda creciente voladora', () => {
    const { mgr, camera } = crearEscena();
    const e = simular(mgr, camera, 'sw_lightning', 1.3, 1.45);
    assert.ok(e.some(s => s.bodyBoltsVisible), 'rayos corporales visibles');
    assert.ok(e.some(s => s.activeWaves > 0), 'onda 3D activa');
  });

  t('Manager: bw_prism dispara flecha y lluvia prismática', () => {
    const { mgr, camera } = crearEscena();
    const e = simular(mgr, camera, 'bw_prism', 2.4, 1.6);
    assert.ok(e.some(s => s.activeArrows > 0 || s.activeRainWaves > 0), 'flechas/lluvia activas');
  });

  t('Manager: st_solar y st_meteor muestran cañón solar y meteoros', () => {
    const { mgr, camera } = crearEscena();
    const e = simular(mgr, camera, 'st_solar', 1.6, 1.6);
    assert.ok(e.some(s => s.beamVisible), 'haz solar visible');
    const e2 = simular(mgr, camera, 'st_meteor', 1.8, 1.7);
    assert.ok(e2.some(s => s.activeMeteors > 0), 'meteoros activos');
  });

  t('Manager: las 52 habilidades se simulan sin errores y se apagan al terminar', () => {
    const { mgr, camera } = crearEscena();
    for (const id of Object.keys(V.SKILL_VFX_PROFILES)) {
      simular(mgr, camera, id, 1.6, 1.2);
      for (let i = 0; i < 120; i++) mgr.update(1 / 30, camera, null);
      const d = mgr.getDebugState();
      assert.strictEqual(d.activeSkill, null, id + ' debe terminar');
      assert.strictEqual(d.beamVisible, false, id + ' haz apagado');
    }
  });

  t('Manager: combos normales de 3 golpes (arma, disparo, orbe_arcano) y setSfxHandler emiten VFX/SFX', () => {
    const { mgr, camera } = crearEscena();
    const eventos = [];
    mgr.setSfxHandler((ev, info) => eventos.push({ ev, info }));
    const target = new THREE.Vector3(0, 1, 10);

    // Melee 3-hit normal combo across weapon classes
    ['espadas', 'mandobles', 'dagas', 'lanzas'].forEach(cls => {
      assert.strictEqual(mgr.startSkill('attack', { lock: 1.5, range: 4 }, { armaClase: cls, targetPos: target, duration: 1.5, getGroundY: () => 0 }), true);
      let vioArma = false;
      for (let i = 0; i < 48; i++) {
        mgr.update(1 / 30, camera, { name: 'attack', elapsed: i / 30, duration: 1.5, hasNative: true });
        if (mgr.getDebugState().activeSkill === 'attack') vioArma = true;
      }
      assert.ok(vioArma, cls + ' combo normal debe activar perfil attack');
      for (let i = 0; i < 30; i++) mgr.update(1 / 30, camera, null);
    });

    // Arco 3 disparos físicos + eventos bow_release
    const evAntesDisparo = eventos.length;
    assert.strictEqual(mgr.startSkill('disparo', { lock: 2.0, range: 16 }, { armaClase: 'arcos', targetPos: target, duration: 2.0, getGroundY: () => 0 }), true);
    let flechasMax = 0;
    for (let i = 0; i < 66; i++) {
      mgr.update(1 / 30, camera, { name: 'disparo', elapsed: i / 30, duration: 2.0, hasNative: true });
      flechasMax = Math.max(flechasMax, mgr.getDebugState().activeArrows);
    }
    assert.ok(flechasMax >= 1, 'disparo debe lanzar flechas físicas del arco');
    const relDisparo = eventos.slice(evAntesDisparo).filter(e => e.ev === 'bow_release');
    assert.ok(relDisparo.length >= 2, 'disparo debe disparar eventos bow_release por flecha (' + relDisparo.length + ')');
    for (let i = 0; i < 45; i++) mgr.update(1 / 30, camera, null);

    // Báculo 3 bolas de fuego + eventos fireball
    const evAntesOrbe = eventos.length;
    assert.strictEqual(mgr.startSkill('orbe_arcano', { lock: 1.8, range: 14 }, { armaClase: 'bastones', targetPos: target, duration: 1.8, getGroundY: () => 0 }), true);
    let wavesMax = 0;
    for (let i = 0; i < 60; i++) {
      mgr.update(1 / 30, camera, { name: 'orbe_arcano', elapsed: i / 30, duration: 1.8, hasNative: true });
      wavesMax = Math.max(wavesMax, mgr.getDebugState().activeWaves);
    }
    assert.ok(wavesMax >= 1, 'orbe_arcano debe lanzar bolas de fuego 3D');
    const fbEvs = eventos.slice(evAntesOrbe).filter(e => e.ev === 'fireball');
    assert.strictEqual(fbEvs.length, 3, 'orbe_arcano debe emitir 3 eventos fireball');

    // sw_lightning wave SFX
    const evAntesWave = eventos.length;
    simular(mgr, camera, 'sw_lightning', 1.3, 1.4);
    assert.ok(eventos.slice(evAntesWave).some(e => e.ev === 'energy_wave'), 'sw_lightning debe emitir evento energy_wave');
  });
} else {
  console.log('  (three no disponible en tools/node_modules: se omiten pruebas del Manager)');
}

console.log(`\n${n} pruebas de VFX del Estudio superadas.`);
})();
