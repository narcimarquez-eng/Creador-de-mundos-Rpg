// Pruebas de texturas reales de tejados y maderas en casas originales, cabañas de madera y ruinas.
// Ejecutar: node test/casas-texturas.test.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const THREE_REAL = require('../tools/node_modules/three/build/three.cjs');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

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

function createSpyThree(loadedPaths) {
  class SpyTextureLoader {
    load(url, onLoad) {
      loadedPaths.push(url);
      const tex = new THREE_REAL.Texture();
      tex.name = url;
      if (typeof onLoad === 'function') onLoad(tex);
      return tex;
    }
  }
  return Object.assign(Object.create(THREE_REAL), {
    TextureLoader: SpyTextureLoader
  });
}

function loadCasaMadera(THREE, loadedPaths) {
  const code = fs.readFileSync(path.join(__dirname, '../js/casa-madera.js'), 'utf8');
  const doc = {
    createElement: () => ({ width: 256, height: 256, style: {}, getContext: makeCtx, addEventListener: noop })
  };
  const win = { THREE };
  const mod = { exports: {} };
  vm.runInNewContext(code, {
    window: win,
    document: doc,
    THREE,
    module: mod,
    exports: mod.exports,
    console, Math, Float32Array, Uint16Array, Uint32Array, Uint8ClampedArray, Array, Object, Set, Map, JSON, String, Number, Boolean
  });
  return win.CasaMaderaLib || mod.exports;
}

function loadVillageLib(THREE, casaMaderaLib) {
  const code = fs.readFileSync(path.join(__dirname, '../js/village-core.js'), 'utf8');
  const doc = {
    getElementById: () => null,
    createElement: () => ({ width: 256, height: 256, style: {}, getContext: makeCtx, addEventListener: noop })
  };
  const win = { THREE, CasaMaderaLib: casaMaderaLib };
  const sandbox = {
    window: win,
    document: doc,
    THREE,
    CasaMaderaLib: casaMaderaLib,
    setTimeout: () => 0,
    clearTimeout: noop,
    console, Math, Float32Array, Uint16Array, Uint32Array, Uint8ClampedArray, Array, Object, Set, Map, JSON, String, Number, Boolean
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(code, sandbox);
  return win.VillageLib;
}

t('catálogos de madera y tejados apuntan a JPG reales existentes en disco', () => {
  const loaded = [];
  const THREE = createSpyThree(loaded);
  const CM = loadCasaMadera(THREE, loaded);
  const root = path.join(__dirname, '..');

  assert.ok(Array.isArray(CM.MADERAS_TODAS) && CM.MADERAS_TODAS.length === 10);
  assert.ok(Array.isArray(CM.TEJADOS_TODAS) && CM.TEJADOS_TODAS.length === 10);
  CM.MADERAS_TODAS.forEach(id => {
    const p = path.join(root, 'assets/texturas/madera', id + '.jpg');
    assert.ok(fs.existsSync(p), 'Falta textura de madera: ' + p);
  });
  CM.TEJADOS_TODAS.forEach(id => {
    const p = path.join(root, 'assets/texturas/tejados', id + '.jpg');
    assert.ok(fs.existsSync(p), 'Falta textura de tejado: ' + p);
  });
});

t('CasaMaderaLib.varianteTextura y materiales usan texturas reales variadas y orientan bien los faldones', () => {
  const loaded = [];
  const THREE = createSpyThree(loaded);
  const CM = loadCasaMadera(THREE, loaded);

  const v1 = CM.varianteTextura(10, 20);
  const v2 = CM.varianteTextura(83, 149);
  const vistas = new Set();
  for (let i = 0; i < 20; i++) {
    const v = CM.varianteTextura(i * 17.3, i * 31.7);
    assert.ok(CM.MADERAS.includes(v.madera));
    assert.ok(CM.TEJADOS.includes(v.teja));
    assert.ok(CM.MADERAS_OSCURAS.includes(v.oscura));
    assert.ok(CM.MADERAS_PUERTA.includes(v.puerta));
    assert.ok(CM.MADERAS_TRONCOS.includes(v.troncos));
    vistas.add(v.madera + '|' + v.teja);
  }
  assert.ok(vistas.size >= 8, 'Se esperaba variedad de madera/teja entre cabañas: ' + vistas.size);

  const m1 = CM.materiales(THREE, v1);
  const m2 = CM.materiales(THREE, v2);
  assert.strictEqual(m1.madera.map.name, `assets/texturas/madera/${v1.madera}.jpg`);
  assert.strictEqual(m1.tejas.map.name, `assets/texturas/tejados/${v1.teja}.jpg`);
  assert.strictEqual(m1.puerta.map.name, `assets/texturas/madera/${v1.puerta}.jpg`);
  assert.strictEqual(m1.troncos.map.name, `assets/texturas/madera/${v1.troncos}.jpg`);
  assert.strictEqual(m2.madera.map.name, `assets/texturas/madera/${v2.madera}.jpg`);
  assert.ok(m1.madera.map.colorSpace === THREE.SRGBColorSpace);

  // Comprobar orientación de tejas sobre la geometría real del tejado de una cabaña
  const p = CM.partes(THREE, { ancho: 6.0, fondo: 7.0, altura: 3.4, pisos: 1 });
  const tejasGeo = p.tejas;
  const uv = tejasGeo.attributes.uv;
  const pos = tejasGeo.attributes.position;
  const nrm = tejasGeo.attributes.normal;
  let uAlongZ = 0, totalSloped = 0;
  for (let i = 0; i + 2 < pos.count; i += 3) {
    const ny = Math.abs(nrm.getY(i));
    const nx = Math.abs(nrm.getX(i));
    if (ny > 0.3 && nx > 0.2) {
      totalSloped++;
      const dz = Math.abs(pos.getZ(i + 1) - pos.getZ(i)) + Math.abs(pos.getZ(i + 2) - pos.getZ(i));
      const du = Math.abs(uv.getX(i + 1) - uv.getX(i)) + Math.abs(uv.getX(i + 2) - uv.getX(i));
      if (dz > 0.5 && du > 0.1) uAlongZ++;
    }
  }
  assert.ok(totalSloped > 0 && uAlongZ > 0, 'U debe recorrer la longitud Z de la cumbrera en los faldones');
});

t('VillageLib usa texturas reales en tejados de casas originales con sus colores de estilo', () => {
  const loaded = [];
  const THREE = createSpyThree(loaded);
  const CM = loadCasaMadera(THREE, loaded);
  const V = loadVillageLib(THREE, CM);
  const root = path.join(__dirname, '..');

  assert.ok(Array.isArray(V.ROOF_TEXTURES) && V.ROOF_TEXTURES.length === 10);
  V.ROOF_TEXTURES.forEach(entry => {
    assert.ok(fs.existsSync(path.join(root, entry.path)), 'Falta tejado: ' + entry.path);
  });
  Object.keys(V.ARCHITECTURAL_STYLES).forEach(sk => {
    const vars = V.STYLE_ROOF_VARIANTS[sk];
    assert.ok(Array.isArray(vars) && vars.length >= 4, 'Faltan variantes de tejado para ' + sk);
  });

  // Probar estilo azul de fantasía (l2_fantasy) con modo casas: 'original'
  const kitL2 = V.createKit('l2_fantasy');
  const sceneL2 = new THREE.Scene();
  const vL2 = kitL2.createVillage(sceneL2, { skipGround: true, noLights: true });
  vL2.generate({
    seed: 42, style: 'l2_fantasy', size: 3, houseDensity: 85, specialCount: 4,
    maxFloors: 2, roadWidth: 6, curve: 1, treeDensity: 25, hasWalls: true, relief: 10, casas: 'original'
  });

  const instanced = [];
  const staticRoofMeshes = [];
  sceneL2.traverse(o => {
    if (o.isInstancedMesh) instanced.push(o);
    else if (o.isMesh && o.material && o.material.map && String(o.material.map.name).startsWith('assets/texturas/tejados/')) {
      staticRoofMeshes.push(o);
    }
  });
  const roofInstanced = instanced.filter(m => m.material && m.material.map && String(m.material.map.name).startsWith('assets/texturas/tejados/'));
  assert.ok(roofInstanced.length >= 2, 'Las casas originales deben usar varias texturas reales de tejado: ' + roofInstanced.length);
  assert.ok(staticRoofMeshes.length >= 1, 'Los edificios especiales y torres deben compactarse con textura real de tejado');

  // Verificar que los tejados tintados conservan el azul característico del estilo l2_fantasy
  let hasBlueTint = false;
  const col = new THREE.Color();
  roofInstanced.forEach(m => {
    assert.strictEqual(typeof m.material.onBeforeCompile, 'function', 'El material de tejado debe tener shader de tinte');
    for (let i = 0; i < m.count; i++) {
      m.getColorAt(i, col);
      if (col.b > col.r + 0.1) hasBlueTint = true;
    }
  });
  assert.ok(hasBlueTint, 'El estilo l2_fantasy debe mantener tintes azules en tejados originales');

  // Probar modo madera: debe cargar múltiples texturas reales de madera y de tejados
  loaded.length = 0;
  const kitMad = V.createKit('european');
  const sceneMad = new THREE.Scene();
  const vMad = kitMad.createVillage(sceneMad, { skipGround: true, noLights: true });
  vMad.generate({
    seed: 99, style: 'european', size: 3, houseDensity: 85, specialCount: 2,
    maxFloors: 2, roadWidth: 6, curve: 1, treeDensity: 20, hasWalls: false, relief: 10, casas: 'madera'
  });
  const madLoaded = new Set(loaded.filter(p => p.startsWith('assets/texturas/madera/')));
  const tejLoaded = new Set(loaded.filter(p => p.startsWith('assets/texturas/tejados/')));
  assert.ok(madLoaded.size >= 4, 'Modo madera debe usar varias texturas reales de madera: ' + [...madLoaded]);
  assert.ok(tejLoaded.size >= 3, 'Modo madera debe usar varias texturas reales de tejado: ' + [...tejLoaded]);

  kitL2.dispose();
  kitMad.dispose();
});

console.log(`\n${n} pruebas de texturas de casas superadas.`);
