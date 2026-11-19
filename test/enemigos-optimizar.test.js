// Pruebas de optimización, clonación de rigs procedurales y animación de combate de enemigos.
// Ejecutar: node --experimental-require-module test/enemigos-optimizar.test.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
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

t('sanearModeloEnemigo elimina PointLights, anula anisotropía/transmisión/sheen/clearcoat y recorta emisivos en GLB', () => {
  const grp = new THREE.Group();
  const head = new THREE.Group();
  grp.add(head);
  const luz = new THREE.PointLight(0xff4400, 3.5, 6.5, 1.6);
  head.add(luz);

  const geo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
  const matPelo = new THREE.MeshPhysicalMaterial({
    name: 'Mat_3DHairStrands',
    color: 0x334155,
    anisotropy: 0.82,
    transmission: 0.6,
    thickness: 1.2,
    sheen: 0.95,
    clearcoat: 1.0,
    roughness: 0.08
  });
  const matIris = new THREE.MeshStandardMaterial({
    name: 'Mat_PredatorIris',
    color: 0xffffff,
    emissive: 0xff2200,
    emissiveIntensity: 3.6,
    roughness: 0.08
  });
  const matSlash = new THREE.MeshStandardMaterial({
    name: 'Mat_WeaponSlashTrail',
    color: 0x22c55e,
    emissive: 0x22c55e,
    emissiveIntensity: 4.93,
    roughness: 0.12
  });
  const matSparks = new THREE.MeshStandardMaterial({
    name: 'Mat_GLB_ArcaneSparks',
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 2.2,
    roughness: 0.15
  });

  grp.add(new THREE.Mesh(geo, matPelo));
  grp.add(new THREE.Mesh(geo, matIris));
  grp.add(new THREE.Mesh(geo, matSlash));
  grp.add(new THREE.Mesh(geo, matSparks));

  const res = EnemyOpt.sanearModeloEnemigo(grp);
  assert.strictEqual(res.lucesQuitadas, 1, 'debe retirar la luz dinámica embebida');
  let lucesRestantes = 0;
  grp.traverse(o => { if (o.isLight) lucesRestantes++; });
  assert.strictEqual(lucesRestantes, 0, 'no debe quedar ninguna luz en la jerarquía del GLB');

  assert.strictEqual(matPelo.anisotropy, 0, 'anisotropy debe quedar a 0');
  assert.strictEqual(matPelo.transmission, 0, 'transmission debe quedar a 0');
  assert.strictEqual(matPelo.thickness, 0, 'thickness debe quedar a 0');
  assert.strictEqual(matPelo.sheen, 0, 'sheen debe quedar a 0');
  assert.strictEqual(matPelo.clearcoat, 0, 'clearcoat debe quedar a 0');
  assert.ok(matPelo.roughness >= 0.22, 'roughness debe subir al menos a 0.22');

  assert.ok(matIris.emissiveIntensity <= 1.25, `Mat_PredatorIris debe quedar <= 1.25 (fue ${matIris.emissiveIntensity})`);
  assert.ok(matSlash.emissiveIntensity <= 1.05, `Mat_WeaponSlashTrail debe quedar <= 1.05 (fue ${matSlash.emissiveIntensity})`);
  assert.ok(matSparks.emissiveIntensity <= 1.05, `Mat_GLB_ArcaneSparks debe quedar <= 1.05 (fue ${matSparks.emissiveIntensity})`);
});

t('optimizarRig sanea automáticamente materiales procedurales con crystalTransmission y emisivos altos', () => {
  const arquetipoPesado = presets.find(p => p.materials && p.materials.crystalTransmission > 0 && p.materials.emissiveIntensity >= 3.0) || muestras[4];
  const cfg = Object.assign({}, arquetipoPesado, { morphology: Object.assign({}, arquetipoPesado.morphology, { meshDensity: 'low' }) });
  const rig = EnemyLib.buildProceduralEnemy(cfg, texturas, false, false);
  EnemyOpt.optimizarRig(rig);

  const revisarMat = mat => {
    if (!mat) return;
    assert.ok(!mat.transmission || mat.transmission === 0, `${mat.name} no debe mantener transmission > 0`);
    assert.ok(!mat.anisotropy || mat.anisotropy === 0, `${mat.name} no debe mantener anisotropy > 0`);
    assert.ok(!mat.sheen || mat.sheen === 0, `${mat.name} no debe mantener sheen > 0`);
    assert.ok(!mat.clearcoat || mat.clearcoat === 0, `${mat.name} no debe mantener clearcoat > 0`);
    if (typeof mat.roughness === 'number') {
      assert.ok(mat.roughness >= 0.22, `${mat.name} roughness >= 0.22 (fue ${mat.roughness})`);
    }
    if (typeof mat.emissiveIntensity === 'number') {
      assert.ok(mat.emissiveIntensity <= 1.25, `${mat.name} emissiveIntensity <= 1.25 (fue ${mat.emissiveIntensity})`);
    }
  };
  rig.rootGroup.traverse(o => {
    if (o.material) [].concat(o.material).forEach(revisarMat);
  });
  Object.values(rig.materials || {}).forEach(revisarMat);
});

t('EnemyFx no acumula emissiveIntensity exponencialmente al clonar o actualizar varios clones en magia', () => {
  const baseMagico = presets.find(p => p.bodyPlan === 'floating_magical') || muestras[4];
  const cfg = Object.assign({}, baseMagico, { morphology: Object.assign({}, baseMagico.morphology, { meshDensity: 'low' }) });
  const proto = EnemyLib.buildProceduralEnemy(cfg, texturas, false, false);
  EnemyOpt.optimizarRig(proto);

  const clonA = EnemyOpt.clonarRig(THREE, proto);
  const clonB = EnemyOpt.clonarRig(THREE, proto);
  assert.ok(clonA.parts.coreMesh && clonA.parts.coreMesh.material, 'el arquetipo debe tener coreMesh con material');

  const fxA = EnemyFx.crear(clonA, cfg);
  EnemyFx.disparar(fxA, 'magia', 1.0, 5);
  EnemyFx.actualizar(fxA, 'attack', 1.35, 0.016, 1.35);
  const emDuranteCasteo = fxA.nucleo.emissiveIntensity;
  assert.ok(emDuranteCasteo <= 1.85, `emissive durante magia debe quedar acotado <= 1.85 (fue ${emDuranteCasteo})`);

  // Mientras clonA está lanzando magia, se instancia clonB compartiendo el material
  const fxB = EnemyFx.crear(clonB, cfg);
  assert.ok(fxB.nucleoIntensidad <= 1.25, `la intensidad base en clonB no debe heredar el pico de magia (fue ${fxB.nucleoIntensidad})`);

  EnemyFx.disparar(fxB, 'magia', 1.36, 5);
  EnemyFx.actualizar(fxB, 'attack', 1.70, 0.016, 1.70);
  assert.ok(fxB.nucleo.emissiveIntensity <= 1.85, `el segundo clon tampoco debe superar 1.85 (fue ${fxB.nucleo.emissiveIntensity})`);

  // Al terminar ambos, debe restaurar su baseline <= 1.25
  EnemyFx.actualizar(fxA, 'idle', 3.0, 0.016, 3.0);
  EnemyFx.actualizar(fxB, 'idle', 3.0, 0.016, 3.0);
  assert.ok(fxA.nucleo.emissiveIntensity <= 1.25, `tras finalizar magia, emissive vuelve a <= 1.25 (fue ${fxA.nucleo.emissiveIntensity})`);
});

t('visor-mundo.html integra saneamiento de GLB, detalle en GLB, tope moderado en marcarResplandor y blindaje de UnrealBloomPass', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');
  assert.ok(html.includes('EnemyOpt.sanearModeloEnemigo(entrada.escena)'), 'prototipoGlb debe llamar sanearModeloEnemigo');
  assert.ok(/instanciarVersionGlb[\s\S]*?detalle:\s*rig\.detalle/.test(html), 'instanciarVersionGlb debe conectar rig.detalle al filtro de pelo/escamas');
  assert.ok(html.includes('function blindarFiltroBloom'), 'debe definir blindarFiltroBloom para UnrealBloomPass');
  assert.ok(html.includes('uMaxBloomLum'), 'blindarFiltroBloom debe limitar la luminancia máxima antes del blur');
  assert.ok(html.includes('texel.r >= 0.0 && texel.r <= 65000.0'), 'blindarFiltroBloom debe filtrar NaN/Inf/negativos en RGBA');
  assert.ok(html.includes('Math.min(2.0, Math.max(mat.emissiveIntensity || 1.0, 1.55))'), 'marcarResplandor debe moderar emissiveIntensity');
  assert.ok(html.includes('Math.min(2.2, Math.max(1.35, 1.28 / lum))'), 'marcarResplandor debe moderar el multiplicador de color');
});

console.log('\n' + n + ' pruebas de enemigos procedurales superadas.');
