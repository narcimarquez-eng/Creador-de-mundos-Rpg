// Pruebas de puentes GLB (puente0, puente1, puente3), texturas de calles/piedra en puente principal y dimensionado de ríos.
// Ejecutar: node test/puentes-glb.test.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const THREE_REAL = require('../tools/node_modules/three/build/three.cjs');

let n = 0;
function t(name, fn) {
  const res = fn();
  if (res && typeof res.then === 'function') {
    throw new Error('Use async queue if needed');
  }
  n++;
  console.log('ok -', name);
}

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

function createSpyThree(loadedTextures, loadedGLBs) {
  class SpyTextureLoader {
    load(url, onLoad) {
      loadedTextures.push(url);
      const tex = new THREE_REAL.Texture();
      tex.name = url;
      if (typeof onLoad === 'function') onLoad(tex);
      return tex;
    }
  }
  class SpyGLTFLoader {
    load(url, onLoad) {
      loadedGLBs.push(url);
      const grp = new THREE_REAL.Group();
      grp.name = 'spy:' + url;
      const m = new THREE_REAL.Mesh(new THREE_REAL.BoxGeometry(2, 1, 2), new THREE_REAL.MeshStandardMaterial());
      m.geometry.userData = m.geometry.userData || {};
      grp.add(m);
      if (typeof onLoad === 'function') onLoad({ scene: grp });
    }
  }
  return Object.assign(Object.create(THREE_REAL), {
    TextureLoader: SpyTextureLoader,
    GLTFLoader: SpyGLTFLoader
  });
}

function loadVillageLib(THREE) {
  const code = fs.readFileSync(path.join(__dirname, '../js/village-core.js'), 'utf8');
  const doc = {
    getElementById: () => null,
    createElement: () => ({ width: 256, height: 256, style: {}, getContext: makeCtx, addEventListener: noop })
  };
  const win = { THREE };
  const sandbox = {
    window: win,
    document: doc,
    THREE,
    setTimeout: () => 0,
    clearTimeout: noop,
    Promise,
    console, Math, Float32Array, Uint16Array, Uint32Array, Uint8ClampedArray, Array, Object, Set, Map, JSON, String, Number, Boolean
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(code, sandbox);
  return win.VillageLib;
}

t('activos reales en disco: GLBs puente0/1/3 y texturas piedra t01..t10 y suelo t01..t10', () => {
  const loadedTex = [], loadedGLBs = [];
  const THREE = createSpyThree(loadedTex, loadedGLBs);
  const V = loadVillageLib(THREE);
  const root = path.join(__dirname, '..');

  assert.strictEqual(V.STONE_TEXTURES.length, 10);
  V.STONE_TEXTURES.forEach(entry => {
    assert.ok(fs.existsSync(path.join(root, entry.path)), 'Falta piedra: ' + entry.path);
  });
  V.STREET_TEXTURES.forEach(entry => {
    assert.ok(fs.existsSync(path.join(root, entry.path)), 'Falta suelo: ' + entry.path);
  });
  ['puente0', 'puente1', 'puente3'].forEach(id => {
    const entry = V.BRIDGE_GLBS[id];
    assert.ok(entry, 'Falta puente en catálogo: ' + id);
    const p = path.join(root, entry.path);
    assert.ok(fs.existsSync(p) && fs.statSync(p).size > 100000, 'Falta GLB de puente: ' + p);
  });
});

t('resolveBridgeStyle y riverParamsFor ajustan estilos y anchuras de río', () => {
  const V = loadVillageLib(createSpyThree([], []));

  assert.strictEqual(V.resolveBridgeStyle({ bridgeStyle: 'principal', seed: 9 }), 'principal');
  assert.strictEqual(V.resolveBridgeStyle({ bridgeStyle: 'puente0', seed: 9 }), 'puente0');
  assert.strictEqual(V.resolveBridgeStyle({ bridgeStyle: 'puente1', seed: 9 }), 'puente1');
  assert.strictEqual(V.resolveBridgeStyle({ bridgeStyle: 'puente3', seed: 9 }), 'puente3');
  assert.strictEqual(V.resolveBridgeStyle({ bridgeStyle: 0 }), 'principal');
  assert.strictEqual(V.resolveBridgeStyle({ bridgeStyle: 1 }), 'puente3');
  assert.strictEqual(V.resolveBridgeStyle({ bridgeStyle: 2 }), 'puente1');
  assert.strictEqual(V.resolveBridgeStyle({ bridgeStyle: 3 }), 'puente0');

  const seenAuto = new Set();
  for (let s = 1; s <= 12; s++) seenAuto.add(V.resolveBridgeStyle({ bridgeStyle: 'auto', seed: s }));
  assert.deepStrictEqual([...seenAuto].sort(), ['principal', 'puente0', 'puente1', 'puente3']);

  const rp3 = V.riverParamsFor({ bridgeStyle: 'puente3' });
  const rp1 = V.riverParamsFor({ bridgeStyle: 'puente1' });
  const rp0 = V.riverParamsFor({ bridgeStyle: 'principal' });
  assert.ok(rp3.riverWidth < rp0.riverWidth && rp0.riverWidth < rp1.riverWidth, 'El ancho del río se adapta al puente');
});

t('calcularPuenteGLB garantiza continuidad con las orillas, pendientes y altura de arco de puerta en puente1', () => {
  const V = loadVillageLib(createSpyThree([], []));

  ['puente0', 'puente1', 'puente3'].forEach(id => {
    const pA = { x: 20, z: 0 }, pB = { x: 50, z: 0 };
    const sp = V.calcularPuenteGLB(id, pA, pB, 0.25, 1.35, 7.0, { waterLevel: -0.65 });
    assert.ok(Math.abs(sp.topAt(0) - 0.25) < 1e-6, id + ' topAt(0) debe igualar hA');
    assert.ok(Math.abs(sp.topAt(1) - 1.35) < 1e-6, id + ' topAt(1) debe igualar hB');
    assert.ok(sp.topAt(0.5) >= Math.max(0.25, 1.35), id + ' centro debe coronar por encima de los extremos');
    assert.ok(sp.halfWalkW >= 3.5, id + ' calzada transitable suficiente');
    if (id === 'puente0') assert.ok(sp.rampLen > 1.0 && sp.rampRise >= 0.7, 'puente0 debe generar rampas de acceso');
    if (id === 'puente1') {
      const clearDoorH = 2.0 * sp.scaleY;
      assert.ok(clearDoorH >= 2.75, 'puente1 debe dejar paso libre >= 2.75m en el torreón: ' + clearDoorH);
    }
  });
});

t('puente principal usa texturas reales de calles (suelo/*) y piedra (piedra/*) y no el atlas plano', () => {
  const loadedTex = [], loadedGLBs = [];
  const THREE = createSpyThree(loadedTex, loadedGLBs);
  const V = loadVillageLib(THREE);

  const kit = V.createKit('european');
  const scene = new THREE.Scene();
  const world = kit.createVillage(scene, { skipGround: true });
  world.generate({
    style: 'european',
    terrainType: 'plains',
    relief: 35,
    seed: 101,
    size: 2,
    houseDensity: 60,
    specialCount: 1,
    maxFloors: 2,
    roadWidth: 7.0,
    streetTexture: 't04',
    bridgeStyle: 'principal',
    curve: 4,
    treeDensity: 50,
    hasWalls: false,
    hasRiver: true,
    hasMagic: false,
    hasProps: false,
    hasLamps: true,
    hasFences: false,
    hasGardens: false,
    time: 'day'
  });

  const texNames = [];
  scene.traverse(o => {
    if (o.isMesh && o.material && o.material.map && o.material.map.name) {
      texNames.push(o.material.map.name);
    }
  });
  assert.ok(texNames.includes('assets/texturas/suelo/t04.jpg'), 'Puente principal debe usar textura de calle real');
  assert.ok(texNames.includes('assets/texturas/piedra/t01.jpg'), 'Puente principal debe usar textura de piedra real para estilo european');
  assert.strictEqual(world.bridgeBounds.style, 'principal');

  const bx = world.getRiverX(0);
  assert.strictEqual(world.isWaterHazard(bx, 0, 0.5), false, 'Sobre el tablero del puente principal no hay peligro de agua');
  assert.strictEqual(world.isWaterHazard(bx, 35, 0.5), true, 'En el río fuera del puente sí hay peligro de agua');
  assert.ok(world.getWalkableHeight(bx, 0) > -0.65, 'La cota caminable sobre el puente está sobre el agua');
});

t('puente0, puente1 y puente3 cargan sus GLBs, dimensionan el río y funcionan en calles con manzanas (puentes secundarios)', () => {
  const loadedTex = [], loadedGLBs = [];
  const THREE = createSpyThree(loadedTex, loadedGLBs);
  const V = loadVillageLib(THREE);

  const widths = {};
  ['puente0', 'puente1', 'puente3'].forEach(bridgeStyle => {
    const kit = V.createKit('l2_fantasy');
    const scene = new THREE.Scene();
    const world = kit.createVillage(scene, { skipGround: true });
    world.generate({
      style: 'l2_fantasy',
      terrainType: 'plains',
      relief: 30,
      seed: 42,
      size: 3,
      trazado: 'manzanas',
      houseDensity: 70,
      specialCount: 1,
      maxFloors: 2,
      roadWidth: 7.0,
      streetTexture: 't01',
      bridgeStyle,
      curve: 5,
      treeDensity: 60,
      hasWalls: true,
      hasRiver: true,
      hasMagic: true,
      hasProps: true,
      hasLamps: true,
      hasFences: true,
      hasGardens: true,
      time: 'day'
    });

    widths[bridgeStyle] = world.riverWidth;
    assert.strictEqual(world.bridgeBounds.style, bridgeStyle);
    assert.ok(loadedGLBs.includes(V.BRIDGE_GLBS[bridgeStyle].path), 'Debe solicitar carga de ' + V.BRIDGE_GLBS[bridgeStyle].path);
    const bx = world.getRiverX(0);
    assert.strictEqual(world.isWaterHazard(bx, 0, 0.5), false, bridgeStyle + ': sobre el puente principal no hay agua');
    assert.ok(world.getWalkableHeight(bx, 0) > -0.65, bridgeStyle + ': altura transitable por encima del agua');

    if (bridgeStyle === 'puente1') {
      const towCols = world.colliders.filter(c => c.type === 'box' && Math.abs(c.minX - (bx - world.bridgeBounds.spec.meta.towerHalfX * world.bridgeBounds.spec.scaleX - 0.25)) < 0.1);
      assert.strictEqual(towCols.length, 2, 'puente1 debe generar 2 colisionadores laterales para los muros del torreón dejando libre el centro');
    }

    assert.ok(world.extraBridges.length >= 1, bridgeStyle + ': trazado en manzanas debe crear puentes secundarios GLB');
    world.extraBridges.forEach(eb => {
      assert.ok(eb.bridgeId === 'puente0' || eb.bridgeId === 'puente3', 'Puente secundario debe usar GLB puente0 o puente3');
      assert.strictEqual(world.isWaterHazard(eb.cx, eb.cz, 0.4), false, 'Puente secundario transitable');
    });

    // Verificar que placementOk y treeOk toleran los OBB colliders nuevos
    assert.strictEqual(typeof world.placementOk(30, 30, null), 'boolean');
    assert.strictEqual(typeof world.treeOk(30, 30), 'boolean');
  });

  assert.strictEqual(widths.puente3, 11.5);
  assert.strictEqual(widths.puente0, 14.0);
  assert.strictEqual(widths.puente1, 16.5);
});

t('creador-de-pueblos.html y visor-mundo.html contienen los enlaces de UI, mundo y colisionadores', () => {
  const root = path.join(__dirname, '..');
  const creadorHtml = fs.readFileSync(path.join(root, 'creador-de-pueblos.html'), 'utf8');
  const visorHtml = fs.readFileSync(path.join(root, 'visor-mundo.html'), 'utf8');

  assert.ok(creadorHtml.includes('id="inp-bridge"'), 'creador-de-pueblos.html debe tener selector #inp-bridge');
  assert.ok(creadorHtml.includes('puente0') && creadorHtml.includes('puente1') && creadorHtml.includes('puente3'));
  assert.ok(visorHtml.includes('ground.configurarRio(cfg)'), 'visor-mundo.html debe sincronizar anchura de río en makeTownEntry');
  assert.ok(visorHtml.includes('VillageLib.calcularPuenteGLB') && visorHtml.includes('VillageLib.cargarPuenteGLB'), 'visor-mundo.html debe usar puentes GLB en caminos del mundo');
  assert.ok(visorHtml.includes("c.type === 'obb'"), 'visor-mundo.html toWorldColliders debe transformar colliders OBB');
  assert.ok(visorHtml.includes('rioCercano(p.x, ptZ(p))'), 'visor-mundo.html buildRoads debe leer la coordenada z de curvePath');
});

console.log(`\n${n} tests passed.`);
