// Pruebas de paisaje estilo Zelda: riachuelos cristalinos, doble anillo LOD de praderas,
// sombras de nubes, perspectiva aérea, brisa/polen y opciones de rendimiento.
// Ejecutar: node --experimental-require-module test/zelda-paisaje.test.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const THREE = require('../tools/node_modules/three/build/three.cjs');

const RiachuelosLib = require('../js/riachuelos.js');
const PraderaAtlasLib = require('../js/pradera-atlas.js');
const TerrainLib = require('../js/terreno.js');
const RPGWorld = require('../js/world-core.js');

let n = 0;
function t(name, fn) {
  fn();
  n++;
  console.log('ok -', name);
}

function makeFakeDoc() {
  const noop = () => {};
  const makeCtx = () => ({
    fillStyle: '', strokeStyle: '', lineWidth: 1, lineCap: 'round',
    save: noop, restore: noop, translate: noop, rotate: noop, scale: noop,
    rect: noop, clip: noop, clearRect: noop, beginPath: noop, closePath: noop,
    moveTo: noop, lineTo: noop, quadraticCurveTo: noop, ellipse: noop, arc: noop, fill: noop, stroke: noop,
    createLinearGradient: () => ({ addColorStop: noop }),
    getImageData: (x, y, w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }),
    putImageData: noop
  });
  return {
    createElement: () => ({ width: 512, height: 512, getContext: makeCtx })
  };
}

t('RiachuelosLib planifica riachuelos serpenteantes sobre terreno real, excava lecho vadeable y crea 2 mallas', () => {
  const terr = RPGWorld.getTerrain(4242);
  const t0 = Date.now();
  const res = RiachuelosLib.planearRiachuelos({
    seed: 4242,
    bounds: { minX: -1200, maxX: 1200, minZ: -1200, maxZ: 1200 },
    alturaBase: (x, z) => (terr.elevation(x, z) - RPGWorld.SEA_LEVEL) * 95,
    bioma: (x, z) => terr.biomeAt(x, z, terr.elevation(x, z)),
    libre: (x, z) => Math.hypot(x, z) > 120,
    maxRiachuelos: 8
  });
  const ms = Date.now() - t0;
  assert.ok(ms < 150, `planearRiachuelos debe ser rápido (<150 ms, tardó ${ms} ms)`);
  assert.ok(res.riachuelos.length >= 2, `debe generar riachuelos en terreno real (${res.riachuelos.length})`);
  assert.ok(res.indice && res.indice.totalSegs >= res.riachuelos.length * 10);

  // Lecho somero vadeable, altura de agua monótona y splat con suma = 1
  const r0 = res.riachuelos[0];
  for (let i = 1; i < r0.pts.length; i++) {
    assert.ok(r0.pts[i].y <= r0.pts[i - 1].y + 1e-6, 'el agua del riachuelo debe fluir cuesta abajo');
  }
  const mid = r0.pts[Math.floor(r0.pts.length / 2)];
  const hAntes = 20;
  const hCentro = RiachuelosLib.aplicarAltura(res.indice, mid.x, mid.z, hAntes);
  const hFuera = RiachuelosLib.aplicarAltura(res.indice, mid.x + 25, mid.z + 25, hAntes);
  assert.ok(hCentro < mid.y && hCentro >= mid.y - r0.prof - 0.05, `lecho cóncavo somero esperado (${hCentro} vs water=${mid.y}, prof=${r0.prof})`);
  assert.strictEqual(hFuera, hAntes, 'fuera de la ribera la altura no debe alterarse');

  const spBed = RiachuelosLib.aplicarSplat(res.indice, mid.x, mid.z, { splat: [1, 0, 0, 0], snow: 0 });
  assert.ok(Math.abs(spBed.splat.reduce((a, b) => a + b, 0) - 1) < 1e-6);
  assert.ok(spBed.splat[3] > 0.4 && spBed.splat[0] < 0.2, 'el cauce debe mezclar arena/grava húmeda');

  // Construcción de mallas: exactamente 1 malla de agua (canal B=1) y 1 InstancedMesh de cantos rodados
  const matAgua = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true });
  const mallas = RiachuelosLib.construirMallas(THREE, res, matAgua);
  assert.ok(mallas.aguaMesh && mallas.aguaMesh.isMesh, 'debe construir malla única de agua');
  const colAttr = mallas.aguaMesh.geometry.getAttribute('color');
  assert.strictEqual(colAttr.getZ(0), 1, 'el agua de riachuelo debe marcar canal B=1 para tono cristalino');
  assert.ok(mallas.piedrasMesh && mallas.piedrasMesh.isInstancedMesh && mallas.piedrasMesh.count > 0, 'debe instanciar cantos rodados de ribera');
});

t('PraderaAtlasLib soporta doble anillo LOD, sombras de nubes, flores de ribera y brisa Zelda', () => {
  const prevDoc = global.document;
  global.document = makeFakeDoc();
  try {
    // 1) Orilla de riachuelo favorece flores y cobertura densa
    let floresOrilla = 0;
    for (let i = 0; i < 120; i++) {
      const r1 = ((i * 73) % 997) / 997;
      const r2 = ((i * 191) % 991) / 991;
      const r3 = ((i * 41) % 811) / 811;
      const r4 = ((i * 127) % 787) / 787;
      const inst = PraderaAtlasLib.elegirInstanciaPradera(i * 7, -i * 5, 'pradera', 0.1, 77, r1, r2, r3, r4, 1, { enOrillaRiachuelo: true });
      if (inst && inst.atlas === 'flores') floresOrilla++;
    }
    assert.ok(floresOrilla >= 20, 'la ribera de riachuelos debe brotar más flores (' + floresOrilla + ')');

    // 2) Anillo cercano + anillo lejano comparten texturas (cero canvas nuevos) y 4 triángulos en LOD lejano
    const terrainU = {
      uTime: { value: 1.5 },
      uHeroXZ: { value: new THREE.Vector2(0, 0) },
      uNubesSombra: { value: 1.0 },
      uEstiloZelda: { value: 1.0 }
    };
    const cerca = PraderaAtlasLib.crearCapasPradera(THREE, 120, terrainU, null);
    const lejos = PraderaAtlasLib.crearCapasPraderaLejana(THREE, 160, terrainU, null, cerca);

    for (const tipo of PraderaAtlasLib.ATLAS_TIPOS) {
      assert.strictEqual(lejos[tipo].material.map, cerca[tipo].material.map, tipo + ' lejano debe compartir textura sin duplicar canvas');
      assert.strictEqual(lejos[tipo].geometry.index.count / 3, 4, tipo + ' lejano debe usar solo 4 triángulos');
      const mockShader = {
        uniforms: {},
        vertexShader: '#include <common>\n#include <uv_vertex>\n#include <begin_vertex>',
        fragmentShader: '#include <common>\n#include <color_fragment>\n#include <normal_fragment_begin>'
      };
      lejos[tipo].material.onBeforeCompile(mockShader);
      assert.ok(mockShader.vertexShader.includes('vNubeSombra'));
      assert.ok(mockShader.fragmentShader.includes('uEstiloZelda'));
    }
    lejos.actualizarRadios(68);
    assert.strictEqual(lejos.hierba.material.userData.fadeUniforms.uFadeEnd.value, 68);

    // 3) Brisa y polen flotante
    const brisa = PraderaAtlasLib.crearSistemaBrisaZelda(THREE, terrainU);
    assert.ok(brisa.grupo && brisa.rachasMesh.isInstancedMesh && brisa.motasMesh.isInstancedMesh);
    brisa.actualizar(0.016, 4.2, 10, 5, -12, true);
    assert.strictEqual(brisa.grupo.visible, true);
    brisa.actualizar(0.016, 4.3, 10, 5, -12, false);
    assert.strictEqual(brisa.grupo.visible, false);
  } finally {
    global.document = prevDoc;
  }
});

t('TerrainLib inyecta sombras de nubes, gradación pastel/Hyrule y perspectiva aérea Zelda', () => {
  const mat = TerrainLib.createTerrainMaterial(THREE, {
    tCapas: { value: null },
    tHierbas: { value: null },
    uHierbaMix: { value: 0.42 },
    uTime: { value: 3.0 },
    uNubesSombra: { value: 1.0 },
    uEstiloZelda: { value: 1.0 },
    uAtmoHorizonte: { value: new THREE.Color('#a9e5f8') }
  }, { triplanar: true });
  const mockShader = {
    uniforms: {},
    vertexShader: '#include <common>\n#include <begin_vertex>\n#include <project_vertex>',
    fragmentShader: '#include <common>\n#include <color_fragment>\n#include <roughnessmap_fragment>\n#include <normal_fragment_maps>\n#include <lights_physical_fragment>'
  };
  mat.onBeforeCompile(mockShader);
  assert.ok(mockShader.fragmentShader.includes('uniform float uNubesSombra;'));
  assert.ok(mockShader.fragmentShader.includes('uniform float uEstiloZelda;'));
  assert.ok(mockShader.fragmentShader.includes('uniform vec3 uAtmoHorizonte;'));
  assert.ok(mockShader.fragmentShader.includes('cloudSh'));
  assert.ok(mockShader.fragmentShader.includes('aerial'));
});

t('visor-mundo.html integra riachuelos, doble anillo de pradera, brisa y controles de rendimiento', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');
  ['js/riachuelos.js', 'id="chk-zelda"', 'id="sel-campos"', 'id="chk-riachuelos"', 'id="chk-brisa"',
    'trozoConRiachuelo', 'crearCapasPraderaLejana', 'crearSistemaBrisaZelda', 'ATMO_ZELDA', 'aguaCristalina']
    .forEach(token => assert.ok(html.includes(token), 'Falta integración en visor-mundo.html: ' + token));
});

console.log(`\n${n} pruebas de paisaje estilo Zelda superadas`);
