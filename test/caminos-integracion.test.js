// Pruebas de integración y enrasado de caminos y calles (en pueblos y en mundo abierto)
// Ejecutar: node --experimental-require-module test/caminos-integracion.test.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const THREE = require('../tools/node_modules/three/build/three.cjs');

let n = 0;
function t(name, fn) {
  fn();
  n++;
  console.log('ok -', name);
}

function withVillageLib(fn) {
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'village-core.js'), 'utf8');
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
  const makeEl = () => ({ width: 256, height: 256, style: {}, getContext: makeCtx, addEventListener: noop, removeEventListener: noop });
  const stub = {
    THREE,
    window: { THREE },
    document: {
      getElementById: () => null,
      createElement: makeEl,
      createElementNS: makeEl
    },
    Math, Date, console, Set, Map, Array, Object, Number, String, JSON, Boolean, Promise,
    Float32Array, Int32Array, Uint8Array, Uint16Array, Uint32Array, Uint8ClampedArray,
    setTimeout: () => 0, clearTimeout: noop
  };
  stub.globalThis = stub;
  const prevDoc = global.document;
  global.document = stub.document;
  try {
    vm.runInNewContext(src, stub);
    return fn(stub.window.VillageLib);
  } finally {
    global.document = prevDoc;
  }
}

t('VillageLib.buildConformingRoadMesh enrasa calles sin muros laterales (segW = 4) y funde bordes', () => withVillageLib(V => {
  const kit = V.createKit('european');
  const scene = new THREE.Scene();
  const eng = kit.createVillage(scene, { skipGround: false, noLights: true });
  eng.generate({
    style: 'european', terrainType: 'hills', relief: 45, seed: 101, size: 1,
    houseDensity: 65, specialCount: 1, maxFloors: 2, roadWidth: 6.0, streetTexture: 't04',
    curve: 5, treeDensity: 30, hasWalls: true, hasRiver: true, hasMagic: false,
    hasProps: true, hasLamps: false, hasFences: false, hasGardens: false, time: 'day',
    exits: [{ angle: 90, gate: 'S', to: 'Sur', roadId: 'r1' }]
  });

  // 1) buildConformingRoadMesh directo sin paredes verticales y con perfil abombado a ras del terreno
  const sampleStreet = eng.buildConformingRoadMesh([{ x: -20, z: 0 }, { x: 20, z: 0 }], 6.0, 0.034, null, { fadeEnd: true });
  assert.strictEqual(sampleStreet.children.length, 1, 'No debe añadir malla secundaria de muros verticales (paredes)');
  const roadGeo = sampleStreet.children[0].geometry;
  assert.ok(roadGeo.getAttribute('aCalleFade'), 'La calle debe incluir atributo aCalleFade');
  const pos = roadGeo.getAttribute('position');
  const uv = roadGeo.getAttribute('uv');
  assert.strictEqual(pos.count % 5, 0, 'Cada sección transversal debe subdividirse en segW=4 (5 vértices)');

  let maxCenterDelta = 0, maxEdgeDelta = 0;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i), vy = pos.getY(i), vz = pos.getZ(i);
    const u = uv.getX(i);
    const d = vy - eng.getTerrainHeight(vx, vz);
    if (Math.abs(u - 0.5) < 0.05) maxCenterDelta = Math.max(maxCenterDelta, d);
    if (u <= 0.01 || u >= 0.99) maxEdgeDelta = Math.max(maxEdgeDelta, d);
  }
  assert.ok(maxCenterDelta > 0.02 && maxCenterDelta <= 0.05, `Corona central esperada <=0.05m (obtuvo ${maxCenterDelta})`);
  assert.ok(maxEdgeDelta >= 0 && maxEdgeDelta <= 0.015, `Bordes laterales deben quedar casi a cota cero <=0.015m (obtuvo ${maxEdgeDelta})`);

  // 2) Material de calle urbana vs tablero de puente opaco
  let streetMeshCount = 0;
  let checkedStreetShader = false;
  let checkedBridgeOpaque = false;
  const mockShader = {
    vertexShader: '#include <common>\n#include <begin_vertex>',
    fragmentShader: '#include <common>\n#include <color_fragment>'
  };
  scene.traverse(obj => {
    if (!obj.isMesh || !obj.geometry) return;
    if (obj.geometry.getAttribute('aCalleFade') && obj.material && obj.material.userData && obj.material.userData.alphaBorde) {
      streetMeshCount++;
      assert.strictEqual(obj.material.polygonOffset, true, 'Calle urbana debe activar polygonOffset');
      assert.strictEqual(obj.material.transparent, true, 'Calle urbana debe activar transparencia en bordes');
      assert.strictEqual(obj.material.depthWrite, false, 'Calle urbana no debe bloquear depthWrite en el borde suave');
      if (!checkedStreetShader && typeof obj.material.onBeforeCompile === 'function') {
        const s = { vertexShader: mockShader.vertexShader, fragmentShader: mockShader.fragmentShader };
        obj.material.onBeforeCompile(s);
        assert.ok(s.fragmentShader.includes('vCalleUv') && s.fragmentShader.includes('edgeAlpha'), 'Shader de calle debe fundir márgenes');
        checkedStreetShader = true;
      }
    }
    if (obj.geometry.type === 'BoxGeometry' && obj.material && obj.material.color && obj.material.userData && !obj.material.userData.alphaBorde && obj.material.bumpScale >= 0.2) {
      assert.strictEqual(obj.material.transparent, false, 'Tablero de puente debe permanecer opaco');
      assert.strictEqual(obj.material.depthWrite, true);
      checkedBridgeOpaque = true;
    }
  });
  assert.ok(streetMeshCount >= 3, 'Debe generar las calles conformadas del pueblo');
  assert.ok(checkedStreetShader, 'Debe inyectar shader de fundido de borde en calles urbanas');
  assert.ok(checkedBridgeOpaque, 'Debe usar variante sólida opaca en tablero de puente');

  // 3) Plaza central enrasada con calles y getWalkableHeight coherente
  const plazaY = eng.getTerrainHeight(0, 0);
  const walkPlaza = eng.getWalkableHeight(0, 0);
  const walkRoad = eng.getWalkableHeight(0, 22);
  assert.ok(walkPlaza > plazaY && walkPlaza <= plazaY + 0.06, `Plaza enrasada esperada (obtuvo delta=${walkPlaza - plazaY})`);
  assert.ok(Math.abs((walkPlaza - plazaY) - (walkRoad - eng.getTerrainHeight(0, 22))) <= 0.03, 'Plaza y calles deben estar al mismo nivel');
}));

t('VillageLib.indiceCalles2D y terrainMesh integran color de grava y aplanado bajo calles', () => withVillageLib(V => {
  assert.strictEqual(typeof V.indiceCalles2D, 'function', 'VillageLib debe exportar indiceCalles2D');

  const idx = V.indiceCalles2D([{ pts: [{ x: 0, z: -30 }, { x: 0, z: 30 }], width: 6.0 }], [], 6.0);
  const hEn = idx.distInfo(1.0, 5.0, 12);
  assert.ok(hEn && Math.abs(hEn.dist - 1.0) < 1e-6 && Math.abs(hEn.halfW - 3.0) < 1e-6);
  assert.strictEqual(idx.distInfo(40, 40, 12), null);

  const kit = V.createKit('trade');
  const scene = new THREE.Scene();
  const eng = kit.createVillage(scene, { skipGround: false, noLights: true });
  eng.generate({
    style: 'trade', terrainType: 'plains', relief: 40, seed: 303, size: 1,
    houseDensity: 60, specialCount: 1, maxFloors: 2, roadWidth: 6.0, streetTexture: 't03',
    curve: 0, treeDensity: 20, hasWalls: false, hasRiver: false, hasMagic: false,
    hasProps: false, hasLamps: false, hasFences: false, hasGardens: false, time: 'day'
  });

  // Verificar que los vértices sobre la calle principal (x=0, z=30) carecen de bultos de micro-relieve y no conservan verde puro de pradera
  const pos = eng.terrainMesh.geometry.getAttribute('position');
  const col = eng.terrainMesh.geometry.getAttribute('color');
  let maxErrAlturaCalle = 0;
  let calleTint = null;
  let cespedTint = null;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    if (Math.abs(x) < 1.8 && Math.abs(z - 30) < 2.2) {
      maxErrAlturaCalle = Math.max(maxErrAlturaCalle, Math.abs(y - eng.getTerrainHeight(x, z)));
      calleTint = [col.getX(i), col.getY(i), col.getZ(i)];
    }
    if (Math.abs(x - 36) < 2.2 && Math.abs(z - 42) < 2.2) {
      cespedTint = [col.getX(i), col.getY(i), col.getZ(i)];
    }
  }
  assert.ok(maxErrAlturaCalle < 0.008, 'El suelo bajo la calle principal debe quedar libre de bultos de micro-relieve');
  assert.ok(calleTint && cespedTint, 'Debe localizar vértices bajo calle y césped alejado');
  assert.notDeepStrictEqual(calleTint.map(v => +v.toFixed(2)), cespedTint.map(v => +v.toFixed(2)), 'El suelo bajo calles debe mezclar color de grava/arcén');
}));

t('visor-mundo.html integra trozoConCamino, alturaMallaFina, offPerfil, aEndFade y createPatch con calles', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');
  assert.ok(html.includes('function trozoConCamino'), 'Debe existir trozoConCamino para usar malla fina bajo todos los caminos');
  assert.ok(html.includes('function alturaMallaFina'), 'Debe muestrear la triangulación fina de la malla del terreno');
  assert.ok(html.includes('offPerfil'), 'MB.ribbon debe enrasar los bordes del camino hacia el terreno');
  assert.ok(html.includes('aEndFade'), 'Debe propagar atributo aEndFade para fundido longitudinal en extremos');
  assert.ok(html.includes('alphaBordeC'), 'Shader de caminos debe fundir márgenes de forma orgánica con ruido');
  assert.ok(html.includes('0.028, alturaCamino'), 'Los caminos del mundo deben quedar enrasados (~0.028 m)');
  assert.ok(html.includes('VillageLib.indiceCalles2D'), 'createPatch debe pintar splatWithRoad también bajo las calles urbanas');
  assert.ok(html.includes('alturaCamino(x, z) : groundH) + 0.030'), 'getWalkableHeight debe coincidir con la nueva cota enrasada');
});

console.log(`\n${n} pruebas de integración de caminos superadas`);
