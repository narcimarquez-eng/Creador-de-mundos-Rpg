// Pruebas de optimización, clonación de rigs procedurales y animación de combate de enemigos.
// Ejecutar: node --experimental-require-module test/enemigos-optimizar.test.js
const assert = require('assert');
const THREE = require('../tools/node_modules/three/build/three.cjs');
globalThis.THREE = THREE;
globalThis.window = globalThis;

// Lienzo mínimo en memoria para que createProceduralTextureSet funcione en Node sin navegador
globalThis.document = {
  createElement(tag) {
    if (tag !== 'canvas') return {};
    const canvas = {
      width: 64, height: 64,
      getContext() {
        const grad = { addColorStop() {} };
        return {
          fillStyle: '', strokeStyle: '', lineWidth: 1, globalAlpha: 1, globalCompositeOperation: 'source-over',
          fillRect() {}, clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, quadraticCurveTo() {},
          bezierCurveTo() {}, arc() {}, ellipse() {}, closePath() {}, fill() {}, stroke() {}, save() {},
          restore() {}, translate() {}, rotate() {}, scale() {},
          createLinearGradient: () => grad,
          createRadialGradient: () => grad,
          createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }),
          getImageData: (_, __, w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }),
          putImageData() {},
          drawImage() {}
        };
      }
    };
    return canvas;
  }
};

require('../js/enemigos.js');
const EnemyLib = globalThis.EnemyLib;
const EnemyOpt = require('../js/enemigos-optimizar.js');
const EnemyFx = require('../js/enemigos-combate.js');
const FusionLib = require('../js/fusionar-modelo.js');

let n = 0;
function t(nombre, fn) { fn(); n++; console.log('ok -', nombre); }

const texturas = EnemyLib.createProceduralTextureSet(1);

// Elegimos arquetipos variados: cuadrúpedo, dragón con aliento, arquero con cuerda de arco, hidra multicabeza y flotante mágico
const presets = Object.values(EnemyLib.ARCHETYPE_PRESETS);
const muestras = [
  presets.find(p => p.bodyPlan === 'quadruped_beast') || presets[0],
  presets.find(p => p.bodyPlan === 'dragon_wyvern') || presets[1],
  presets.find(p => p.weapon === 'bone_recurved_bow') || presets[2],
  presets.find(p => (p.morphology && p.morphology.headCount > 1)) || presets[3],
  presets.find(p => p.bodyPlan === 'floating_magical') || presets[4],
];

t('optimizarRig limpia hitboxes, mallas explosionadas ocultas y luces dinámicas del grafo', () => {
  const cfg = Object.assign({}, muestras[1], { morphology: Object.assign({}, muestras[1].morphology, { meshDensity: 'low' }) });
  const rig = EnemyLib.buildProceduralEnemy(cfg, texturas, false, false);
  EnemyOpt.optimizarRig(rig);
  assert.strictEqual(rig.explodedSourceMeshes.length, 0, 'no deben quedar mallas explosionadas ocultas');
  let luces = 0;
  rig.rootGroup.traverse(o => { if (o.isLight) luces++; });
  assert.strictEqual(luces, 0, 'no deben quedar PointLights dinámicas dentro del rig');
});

t('clonarRig conserva todos los campos requeridos por updateEnemyAnimation en todos los estados y arquetipos', () => {
  for (const base of muestras) {
    const cfg = Object.assign({}, base, { morphology: Object.assign({}, base.morphology, { meshDensity: 'low' }) });
    const proto = EnemyLib.buildProceduralEnemy(cfg, texturas, false, false);
    EnemyOpt.optimizarRig(proto);
    const animadas = [];
    Object.values(proto.parts || {}).forEach(p => [].concat(p).forEach(o => {
      if (o && o.isMesh) o.traverse(sub => { if (sub.isMesh) animadas.push(sub); });
    }));
    FusionLib.fusionarPorMaterial(THREE, proto.rootGroup, { excluir: animadas });

    const clonA = EnemyOpt.clonarRig(THREE, proto);
    const clonB = EnemyOpt.clonarRig(THREE, proto);
    assert.ok(clonA.skinnedMeshGroup, 'clon debe tener skinnedMeshGroup');
    assert.ok(clonA.rootBone, 'clon debe tener rootBone');
    assert.ok(Array.isArray(clonA.explodedSourceMeshes), 'clon debe tener explodedSourceMeshes');
    assert.ok(Array.isArray(clonA.explodableParts), 'clon debe tener explodableParts');
    assert.ok(Array.isArray(clonA.shardData), 'clon debe tener shardData');
    assert.notStrictEqual(clonA.rootGroup, clonB.rootGroup, 'cada clon tiene su propio rootGroup');
    assert.notStrictEqual(clonA.parts.headGroup, clonB.parts.headGroup, 'cada clon mueve sus propios huesos');

    const fxA = EnemyFx.crear(clonA, cfg);
    const fxB = EnemyFx.crear(clonB, cfg);

    // Todos los estados de animación y efectos de combate deben ejecutarse sin lanzar errores
    for (const estado of ['idle', 'walk', 'attack', 'jump_bite', 'hit', 'death']) {
      EnemyFx.actualizar(fxA, estado, 1.25, 0.016, 1.25);
    }

    // El destello de golpe en clonA no debe teñir de rojo el material de clonB
    EnemyFx.disparar(fxA, 'hit', 2.0, 4);
    EnemyFx.actualizar(fxA, 'hit', 2.05, 0.016, 2.05);
    EnemyFx.actualizar(fxB, 'idle', 2.05, 0.016, 2.05);
    if (fxA.mallasArmadura.length && fxB.mallasArmadura.length) {
      assert.notStrictEqual(fxA.mallasArmadura[0].material, fxB.mallasArmadura[0].material, 'el destello aísla el material de la instancia golpeada');
    }
    // Al terminar el golpe, vuelve al material compartido
    EnemyFx.actualizar(fxA, 'idle', 3.0, 0.016, 3.0);
    if (fxA.mallasArmadura.length && fxB.mallasArmadura.length) {
      assert.strictEqual(fxA.mallasArmadura[0].material, fxB.mallasArmadura[0].material, 'tras el destello vuelve al material compartido');
    }
  }
});

console.log('\n' + n + ' pruebas de enemigos procedurales superadas.');
