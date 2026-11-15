// Pruebas de la mejora gráfica integral (mallas densas + micro-relieve, transición por zonas, PBR húmedo/clearcoat, guijarros 3D y GTAOPass SSAO)
// Ejecutar: node test/mejora-grafica.test.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const THREE = require('../tools/node_modules/three/build/three.cjs');

let n = 0;
function t(name, fn) {
  fn();
  n++;
  console.log('ok -', name);
}

const DungeonGenerator = require('../js/dungeon-generator.js');
const MazmorrasLib = require('../js/mazmorras.js');

t('visor-mundo.html integra GTAOPass (intensity 1.35 via scale), UI #chk-ssao, calidad alto y mallas subdivididas', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');
  assert.ok(html.includes('GTAOPass.js'), 'Debe importar GTAOPass');
  assert.ok(html.includes('scale: 1.35'), 'GTAOPass debe configurarse con scale: 1.35');
  assert.ok(html.includes('id="chk-ssao"'), 'Debe exponer checkbox #chk-ssao en la UI');
  assert.ok(html.includes('setSsao'), 'Debe exponer función setSsao');
  assert.ok(/alto:\s*\{[^}]*ssao:\s*true/.test(html), 'QUALITY.alto debe activar ssao por defecto');
  assert.ok(/bajo:\s*\{[^}]*ssao:\s*false/.test(html), 'QUALITY.bajo no debe forzar ssao por defecto');
  assert.ok(html.includes('vUAncho'), 'Caminos/calzadas deben llevar varying vUAncho para micro-relieve y charcos');
  assert.ok(html.includes('DodecahedronGeometry'), 'Debe dispersar piedras 3D con DodecahedronGeometry en bordes');
  assert.ok(html.includes('splatWithRoad'), 'El terreno debe mezclar grava/humedad en arcenes via splatWithRoad');
});

t('DungeonGenerator: suelos subdivididos con micro-relieve, aZona, PBR húmedo y escombros de esquina', () => {
  const kit = DungeonGenerator.crearKitMateriales(DungeonGenerator.ESTILOS_PIEDRA.cripta_gotica, THREE);
  assert.ok(kit.sueloLosas.isMeshPhysicalMaterial, 'sueloLosas debe usar MeshPhysicalMaterial con Three real');
  assert.strictEqual(kit.sueloLosas.clearcoat, 0.9);
  assert.ok(kit.sueloLosas.bumpScale >= 0.24, 'sueloLosas debe tener bumpScale reforzado (>= 0.24)');
  assert.strictEqual(typeof kit.sueloLosas.onBeforeCompile, 'function', 'sueloLosas debe tener shader PBR de transición por zonas');

  // Sala rectangular
  const rng = new DungeonGenerator.PRNG(42);
  const salaRect = {
    id: 'sala_rect_test', tipo: 'cripta', estilo: 'cripta_gotica',
    w: 16, d: 14, h: 6, x: 0, y: 0, z: 0,
    aperturas: { sur: { w: 4.5, cx: 0 } }
  };
  const caja = DungeonGenerator.construirCajaHabitacion(THREE, kit, salaRect);
  const suelo = caja.children.find(c => c.userData && c.userData.tipo === 'suelo');
  assert.ok(suelo, 'Debe existir malla suelo en sala rectangular');
  const pos = suelo.geometry.getAttribute('position');
  const zona = suelo.geometry.getAttribute('aZona');
  assert.ok(pos.count > 400, `Malla densa esperada (>400 vértices), obtuvo ${pos.count}`);
  assert.ok(zona, 'Suelo de mazmorra debe tener atributo vec3 aZona');

  let minZ = Infinity, maxZ = -Infinity, tieneBordeMusgo = false, tieneCharco = false, tieneCentro = false;
  for (let i = 0; i < pos.count; i++) {
    const lz = pos.getZ(i);
    if (lz < minZ) minZ = lz;
    if (lz > maxZ) maxZ = lz;
    if (zona.getX(i) > 0.6) tieneBordeMusgo = true;
    if (zona.getY(i) > 0.25) tieneCharco = true;
    if (zona.getZ(i) > 0.6) tieneCentro = true;
  }
  assert.ok(minZ < -0.008 && maxZ <= 0.015, `Micro-relieve debe crear hondonadas sin hundir mosaicos (${minZ}..${maxZ})`);
  assert.ok(tieneBordeMusgo && tieneCharco && tieneCentro, 'aZona debe distinguir bordes, hondonadas y centro');

  // Sala redonda (rotonda)
  const salaRedonda = {
    id: 'sala_rot_test', tipo: 'rotonda', estilo: 'cripta_gotica', esRedonda: true,
    w: 14, d: 14, h: 6, x: 30, y: 0, z: 0, aperturas: {}
  };
  const cajaRed = DungeonGenerator.construirCajaHabitacion(THREE, kit, salaRedonda);
  const sueloRed = cajaRed.children.find(c => c.userData && c.userData.tipo === 'suelo');
  assert.ok(sueloRed && sueloRed.geometry.getAttribute('position').count > 400, 'Sala redonda debe tener disco subdividido');
  assert.ok(sueloRed.geometry.getAttribute('aZona'), 'Sala redonda debe tener atributo aZona');

  // Decoración con escombros DodecahedronGeometry en esquinas y bordes
  const dec = DungeonGenerator.decorarHabitacion(THREE, kit, salaRect, kit.estilo, rng, [], { fuentes: [], cofres: [], antorchas: [] }, {});
  const escombros = dec.children.filter(c => c.userData && c.userData.tipo === 'escombro_borde');
  assert.ok(escombros.length >= 6, `Debe dispersar piedras pequeñas en bordes/esquinas (encontradas: ${escombros.length})`);
});

t('DungeonGenerator: resolverMaterialesSala conserva hook PBR al clonar matSuelo con color personalizado', () => {
  const kit = DungeonGenerator.crearKitMateriales(DungeonGenerator.ESTILOS_PIEDRA.cripta_gotica, THREE);
  const res = DungeonGenerator.resolverMaterialesSala(THREE, kit, { cripta_gotica: kit }, {
    id: 's_tint', tipo: 'cripta', estilo: 'cripta_gotica', colorSuelo: '#334155'
  }, {});
  assert.strictEqual(typeof res.matSuelo.onBeforeCompile, 'function', 'onBeforeCompile debe conservarse tras clonar por colorSuelo');
  const mockShader = {
    uniforms: {},
    vertexShader: '#include <common>\n#include <begin_vertex>',
    fragmentShader: '#include <common>\n#include <color_fragment>\n#include <roughnessmap_fragment>\n#include <normal_fragment_maps>\n#include <lights_physical_fragment>'
  };
  res.matSuelo.onBeforeCompile(mockShader);
  assert.ok(mockShader.fragmentShader.includes('charcoMaz'), 'Shader clonado debe incluir lógica de charcos');
  assert.ok(mockShader.fragmentShader.includes('material.clearcoat'), 'Shader clonado debe modular clearcoat');
});

t('MazmorrasLib: corredor exterior de 30m tiene suelo subdividido, aZona y piedras en bordes', () => {
  const ent = MazmorrasLib.construirEntradaExterior(THREE, { id: 'm_test', x: 0, y: 0, estilo: 'cripta_gotica' }, () => 0, { sinLucesPuntuales: true });
  assert.ok(ent, 'Debe construir grupo de entrada exterior');
  const mallas = [];
  ent.traverse(o => { if (o.isMesh) mallas.push(o); });
  const conZona = mallas.filter(m => m.geometry && m.geometry.getAttribute('aZona'));
  assert.ok(conZona.length >= 1, 'El suelo del corredor exterior debe incluir atributo aZona');
  assert.ok(conZona[0].geometry.getAttribute('position').count > 200, 'El suelo del corredor debe estar subdividido');
  const cantos = mallas.filter(m => m.geometry && m.geometry.type === 'DodecahedronGeometry');
  assert.ok(cantos.length >= 6, 'Debe haber pequeñas rocas DodecahedronGeometry en bordes del corredor');
});

t('village-core.js incluye micro-relieve, MeshPhysicalMaterial PBR y guijarros de ribera/perímetro', () => {
  const vm = require('vm');
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
  const stub = {
    THREE,
    window: { THREE },
    document: { getElementById: () => null, createElement: () => ({ width: 256, height: 256, style: {}, getContext: makeCtx, addEventListener: noop }), createElementNS: () => ({ width: 256, height: 256, style: {}, getContext: makeCtx, addEventListener: noop }) },
    Math, Date, console, Set, Map, Array, Object, Number, String, JSON, Boolean, Promise, Float32Array, Int32Array, Uint8Array, Uint16Array, Uint32Array, Uint8ClampedArray,
    setTimeout: () => 0, clearTimeout: noop
  };
  stub.globalThis = stub;
  const prevDoc = global.document;
  global.document = stub.document;
  try {
    vm.runInNewContext(src, stub);
    const V = stub.window.VillageLib;
    assert.ok(V && typeof V.createKit === 'function', 'VillageLib.createKit debe cargarse');
    const kit = V.createKit('european');
    const scene = new THREE.Scene();
    const eng = kit.createVillage(scene, { skipGround: false });
    eng.generate({
      style: 'european', terrainType: 'plains', relief: 40, seed: 1234, size: 1,
      houseDensity: 60, specialCount: 1, maxFloors: 2, roadWidth: 5.5, streetTexture: 't04',
      curve: 4, treeDensity: 30, hasWalls: false, hasRiver: true, hasMagic: false,
      hasProps: false, hasLamps: true, hasFences: false, hasGardens: false, time: 'day'
    });
    assert.ok(eng.terrainMesh, 'El pueblo debe crear terrainMesh');
    assert.ok(eng.terrainMesh.material.isMeshPhysicalMaterial, 'terrainMesh del pueblo debe usar MeshPhysicalMaterial');
    assert.ok(eng.terrainMesh.geometry.getAttribute('aHumedad'), 'terrainGeom debe incluir atributo aHumedad');
    assert.ok(eng.terrainMesh.geometry.getAttribute('position').count >= 128 * 128, 'terrainGeom debe usar malla densa >= 128x128');
    const instPebbles = eng.objects.filter(o => o.isInstancedMesh && o.geometry && o.geometry.type === 'DodecahedronGeometry');
    assert.ok(instPebbles.length >= 1 && instPebbles[0].count >= 40, 'Debe instanciar guijarros 3D DodecahedronGeometry en ribera y perímetro');
  } finally {
    global.document = prevDoc;
  }
});

console.log(`\n${n} pruebas de mejora gráfica superadas`);
