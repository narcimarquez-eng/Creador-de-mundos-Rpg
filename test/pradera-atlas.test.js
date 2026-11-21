// Pruebas de los 3 atlas de pradera (hierba, trigo bajo y flores), su distribución y shaders.
// Ejecutar: node --experimental-require-module test/pradera-atlas.test.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const THREE = require('../tools/node_modules/three/build/three.cjs');

const PraderaAtlasLib = require('../js/pradera-atlas.js');
const TerrainLib = require('../js/terreno.js');

let n = 0;
function t(name, fn) {
  fn();
  n++;
  console.log('ok -', name);
}

function makeFakeCanvasFactory() {
  return () => {
    let W = 512, H = 512;
    let buf = new Uint8ClampedArray(W * H * 4);
    const noop = () => {};
    let tx = 0, ty = 0;
    const pts = [];
    const pintarPixel = (x, y, r, g, b, a) => {
      const px = Math.round(x), py = Math.round(y);
      if (px < 0 || px >= W || py < 0 || py >= H) return;
      const k = (py * W + px) * 4;
      buf[k] = r; buf[k + 1] = g; buf[k + 2] = b; buf[k + 3] = a;
    };
    const stampBatch = () => {
      for (let i = 0; i < pts.length; i++) {
        pintarPixel(pts[i][0] + tx, pts[i][1] + ty, 210, 175, 58, 255);
      }
      pts.length = 0;
    };
    const ctx = {
      fillStyle: '#d4a338',
      strokeStyle: '#a37b22',
      lineWidth: 2,
      lineCap: 'round',
      save: noop,
      restore: noop,
      translate: (dx, dy) => { tx += dx; ty += dy; },
      rotate: noop,
      scale: noop,
      rect: (x, y, w, h) => { pts.push([x + w * 0.5, y + h * 0.5]); },
      clip: noop,
      clearRect: (x, y, w, h) => {
        if (w === W && h === H) buf = new Uint8ClampedArray(W * H * 4);
      },
      beginPath: () => { pts.length = 0; },
      closePath: noop,
      moveTo: (x, y) => { pts.push([x, y]); },
      lineTo: (x, y) => { pts.push([x, y]); },
      quadraticCurveTo: (cx, cy, x, y) => { pts.push([cx, cy], [x, y]); },
      ellipse: (x, y) => { pts.push([x, y]); },
      arc: (x, y) => { pts.push([x, y]); },
      fill: stampBatch,
      stroke: stampBatch,
      createLinearGradient: () => ({ addColorStop: noop }),
      getImageData: (x, y, w, h) => {
        if (w !== W || h !== H) buf = new Uint8ClampedArray(w * h * 4);
        return { width: w, height: h, data: buf };
      },
      putImageData: img => {
        if (img && img.data) buf = img.data;
      }
    };
    return {
      get width() { return W; },
      set width(v) { W = v; buf = new Uint8ClampedArray(W * H * 4); },
      get height() { return H; },
      set height(v) { H = v; buf = new Uint8ClampedArray(W * H * 4); },
      getContext: () => ctx
    };
  };
}

t('define exactamente 3 atlas independientes (hierba, trigo, flores) de 2x2 celdas', () => {
  assert.deepStrictEqual(PraderaAtlasLib.ATLAS_TIPOS, ['hierba', 'trigo', 'flores']);
  for (const tipo of PraderaAtlasLib.ATLAS_TIPOS) {
    const meta = PraderaAtlasLib.ATLAS_META[tipo];
    assert.ok(meta, 'falta meta para ' + tipo);
    assert.strictEqual(meta.cols, 2);
    assert.strictEqual(meta.rows, 2);
    assert.strictEqual(meta.tam, 512);
    assert.strictEqual(meta.celdas.length, 4);
  }
  assert.ok(PraderaAtlasLib.ATLAS_META.trigo.altoBase <= 0.72, 'el trigo debe ser bajo para no tapar la vista');
});

t('zonaPraderaEn crea parches coherentes de trigo, flores y hierba solo en pradera', () => {
  const cuentas = { hierba: 0, trigo: 0, flores: 0 };
  const paletasFlores = new Set();
  for (let gx = -24; gx < 24; gx++) {
    for (let gz = -24; gz < 24; gz++) {
      const z = PraderaAtlasLib.zonaPraderaEn(gx * 24, gz * 24, 4242, { bio: 'pradera', pendiente: 0.1 });
      cuentas[z.tipo]++;
      if (z.tipo === 'flores') paletasFlores.add(z.paletaFlor);
    }
  }
  assert.ok(cuentas.trigo > 120, 'debe generar zonas amplias de trigo (' + cuentas.trigo + ')');
  assert.ok(cuentas.flores > 120, 'debe generar zonas amplias de flores (' + cuentas.flores + ')');
  assert.ok(cuentas.hierba > 400, 'la hierba verde debe seguir siendo dominante (' + cuentas.hierba + ')');
  assert.ok(paletasFlores.size >= 3, 'debe alternar las 3 paletas florales en distintas praderas');

  // Coherencia espacial: si un punto es núcleo de trigo, a 2 m sigue siendo trigo
  let centroTrigo = null;
  for (let x = -500; x <= 500 && !centroTrigo; x += 15) {
    for (let z = -500; z <= 500 && !centroTrigo; z += 15) {
      const p = PraderaAtlasLib.zonaPraderaEn(x, z, 4242, { bio: 'pradera', pendiente: 0.05 });
      if (p.wTrigo > 0.85) centroTrigo = [x, z];
    }
  }
  assert.ok(centroTrigo, 'debe existir núcleo de trigo');
  const vecino = PraderaAtlasLib.zonaPraderaEn(centroTrigo[0] + 2, centroTrigo[1] + 1.5, 4242, { bio: 'pradera', pendiente: 0.05 });
  assert.strictEqual(vecino.tipo, 'trigo', 'los campos de trigo deben ser continuos');

  // Pendiente fuerte y otros biomas excluyen trigo y flores de cultivo
  const empinado = PraderaAtlasLib.zonaPraderaEn(centroTrigo[0], centroTrigo[1], 4242, { bio: 'pradera', pendiente: 1.4 });
  assert.strictEqual(empinado.wTrigo, 0);
  for (const bio of ['bosque', 'desierto', 'nieve', 'montana', 'taiga']) {
    const o = PraderaAtlasLib.zonaPraderaEn(centroTrigo[0], centroTrigo[1], 4242, { bio, pendiente: 0 });
    assert.strictEqual(o.tipo, 'hierba');
    assert.strictEqual(o.wTrigo, 0);
    assert.strictEqual(o.wFlores, 0);
  }
});

t('elegirInstanciaPradera reparte los 3 atlas, UVs válidas y altura contenida de trigo bajo', () => {
  assert.strictEqual(PraderaAtlasLib.elegirInstanciaPradera(0, 0, 'pradera', 0, 1, 0.2, 0.3, 0.4, 0.5, 0), null);
  assert.strictEqual(PraderaAtlasLib.elegirInstanciaPradera(0, 0, 'desierto', 0, 1, 0.2, 0.3, 0.1, 0.5, 1), null);

  const counts = { hierba: 0, trigo: 0, flores: 0 };
  const cellsByAtlas = { hierba: new Set(), trigo: new Set(), flores: new Set() };
  for (let i = 0; i < 1200; i++) {
    const x = ((i * 37) % 900) - 450;
    const z = (Math.floor(i / 25) * 19) - 450;
    const r1 = ((i * 73) % 997) / 997;
    const r2 = ((i * 191) % 991) / 991;
    const r3 = ((i * 41) % 811) / 811;
    const r4 = ((i * 127) % 787) / 787;
    const inst = PraderaAtlasLib.elegirInstanciaPradera(x, z, 'pradera', 0.12, 99, r1, r2, r3, r4, 1);
    if (!inst) continue;
    counts[inst.atlas]++;
    cellsByAtlas[inst.atlas].add(`${inst.col},${inst.row}`);
    assert.ok(inst.col === 0 || inst.col === 1);
    assert.ok(inst.row === 0 || inst.row === 1);
    if (inst.atlas === 'trigo') {
      const hReal = PraderaAtlasLib.ATLAS_META.trigo.altoBase * inst.sy;
      assert.ok(hReal >= 0.45 && hReal <= 0.80, 'trigo bajo esperado (0.45..0.80 m), obtuvo ' + hReal);
    }
  }
  assert.ok(counts.hierba > 100 && counts.trigo > 50 && counts.flores > 50, 'debe instanciar los 3 atlas: ' + JSON.stringify(counts));
  assert.strictEqual(cellsByAtlas.hierba.size, 4, 'hierba debe usar las 4 celdas del atlas');
  assert.strictEqual(cellsByAtlas.trigo.size, 4, 'trigo debe usar las 4 celdas del atlas');
  assert.strictEqual(cellsByAtlas.flores.size, 4, 'flores debe usar las 4 celdas del atlas');
});

t('crearAtlasCanvas y dilatarBordesAlpha generan los 3 atlas sin halos oscuros y en tiempo ágil', () => {
  const prevDoc = global.document;
  global.document = { createElement: makeFakeCanvasFactory() };
  try {
    // Prueba unitaria directa de dilatación alpha (preserva a=0 y propaga RGB del píxel vecino opaco)
    const cTest = global.document.createElement('canvas');
    cTest.width = 8;
    cTest.height = 8;
    const ctx = cTest.getContext('2d');
    const img = ctx.getImageData(0, 0, 8, 8);
    const p = (4 * 8 + 4) * 4;
    img.data[p] = 240; img.data[p + 1] = 190; img.data[p + 2] = 40; img.data[p + 3] = 255;
    const okDil = PraderaAtlasLib.dilatarBordesAlpha(ctx, 8, 8, 2);
    assert.strictEqual(okDil, true);
    const vecino = (4 * 8 + 5) * 4;
    assert.strictEqual(img.data[vecino + 3], 0, 'el canal alfa transparente no debe alterarse');
    assert.ok(img.data[vecino] > 200 && img.data[vecino + 1] > 150, 'el vecino transparente debe recibir RGB dilatado');

    // Medición completa de los 3 atlas de 512x512
    const t0 = Date.now();
    for (const tipo of PraderaAtlasLib.ATLAS_TIPOS) {
      const c = PraderaAtlasLib.crearAtlasCanvas(tipo, 512);
      assert.strictEqual(c.width, 512);
      assert.strictEqual(c.height, 512);
    }
    const ms = Date.now() - t0;
    assert.ok(ms < 1500, `generar los 3 atlas debe ser rápido (<1500 ms, tardó ${ms} ms)`);
  } finally {
    global.document = prevDoc;
  }
});

t('crearCapasPradera construye 3 InstancedMesh independientes con shaders y aCell para Three.js', () => {
  const prevDoc = global.document;
  global.document = { createElement: makeFakeCanvasFactory() };
  try {
    const terrainU = {
      uTime: { value: 0 },
      uHeroXZ: { value: new THREE.Vector2(0, 0) }
    };
    const capas = PraderaAtlasLib.crearCapasPradera(THREE, 200, terrainU, null);
    assert.ok(capas.hierba.isInstancedMesh && capas.trigo.isInstancedMesh && capas.flores.isInstancedMesh);
    assert.notStrictEqual(capas.hierba.material.map, capas.trigo.material.map);
    assert.notStrictEqual(capas.trigo.material.map, capas.flores.material.map);

    for (const tipo of ['hierba', 'trigo', 'flores']) {
      const m = capas[tipo];
      assert.ok(m.geometry.getAttribute('aCell'), tipo + ' debe tener atributo instanciado aCell');
      assert.ok(m.instanceColor, tipo + ' debe pre-inicializar instanceColor');
      assert.strictEqual(m.material.alphaTest, 0.34);

      const mockShader = {
        uniforms: {},
        vertexShader: '#include <common>\n#include <uv_vertex>\n#include <begin_vertex>',
        fragmentShader: '#include <normal_fragment_begin>'
      };
      m.material.onBeforeCompile(mockShader);
      assert.ok(mockShader.vertexShader.includes('attribute vec2 aCell;'));
      assert.ok(mockShader.vertexShader.includes('vMapUv = aCell * 0.5'));
      assert.ok(mockShader.vertexShader.includes('uniform vec2 uHeroXZ;'));
      assert.ok(mockShader.fragmentShader.includes('vec3 nonPerturbedNormal = normal;'));
      assert.ok(!mockShader.fragmentShader.includes('normal *= faceDirection;'));
    }
  } finally {
    global.document = prevDoc;
  }
});

t('TerrainLib sincroniza uPraderaSeed en el sombreado lejano cuando lleva tHierbas', () => {
  const mat = TerrainLib.createTerrainMaterial(THREE, {
    tCapas: { value: null },
    tHierbas: { value: null },
    uHierbaMix: { value: 0.42 },
    uPraderaSeed: { value: new THREE.Vector2(3, -5) }
  }, { triplanar: true });
  const mockShader = {
    uniforms: {},
    vertexShader: '#include <common>\n#include <begin_vertex>\n#include <project_vertex>',
    fragmentShader: '#include <common>\n#include <color_fragment>\n#include <roughnessmap_fragment>\n#include <normal_fragment_maps>\n#include <lights_physical_fragment>'
  };
  mat.onBeforeCompile(mockShader);
  assert.ok(mockShader.fragmentShader.includes('uniform vec2 uPraderaSeed;'));
  assert.ok(mockShader.fragmentShader.includes('praderaPlana'));
  assert.ok(mockShader.fragmentShader.includes('wTrigo'));
  assert.ok(mockShader.fragmentShader.includes('wFlores'));
});

t('visor-mundo.html integra js/pradera-atlas.js, los 3 InstancedMesh y uPraderaSeed', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');
  assert.ok(html.includes('js/pradera-atlas.js'), 'visor-mundo debe cargar js/pradera-atlas.js');
  assert.ok(html.includes('uPraderaSeed'), 'visor-mundo debe pasar uPraderaSeed al terreno');
  assert.ok(html.includes('PraderaAtlasLib.crearCapasPradera'), 'initHierbaCampo debe inicializar los 3 atlas');
  assert.ok(html.includes('trigoCampoMesh') && html.includes('floresCampoMesh'), 'debe gestionar mallas de trigo y flores');
  assert.ok(
    html.includes('[hierbaCampoMesh, trigoCampoMesh, floresCampoMesh].forEach') || html.includes('_capasCampoTodas().forEach'),
    'clearWorldObjects debe limpiar las capas de pradera'
  );
});

t('vegetación alta (hierba 1 m, bambú alargado y muy tupido) y hierba en caminos', () => {
  assert.deepStrictEqual(PraderaAtlasLib.ATLAS_ALTOS_TIPOS, ['hierbaAlta', 'bambu']);
  assert.strictEqual(PraderaAtlasLib.ATLAS_ALTOS_META.hierbaAlta.altoBase, 1.0);
  const bambuMeta = PraderaAtlasLib.ATLAS_ALTOS_META.bambu;
  assert.ok(bambuMeta.altoBase >= 2.2, 'bambú debe superar 2.2 m de altura');
  assert.ok(bambuMeta.altoBase / bambuMeta.anchoBase >= 2.2, 'bambú debe tener proporción alargada');

  const geoBambu = PraderaAtlasLib.crearGeometriaBambuTupido(THREE, bambuMeta.anchoBase, bambuMeta.altoBase, 64);
  assert.ok(geoBambu.index.count / 3 >= 24, 'bambú tupido debe usar >= 24 triángulos en 4 planos cruzados');
  assert.ok(geoBambu.getAttribute('aCell'), 'geometría de bambú debe incluir aCell');

  const prevDoc = global.document;
  global.document = { createElement: makeFakeCanvasFactory() };
  try {
    ['hierbaAlta', 'bambu'].forEach(tipo => {
      const c = PraderaAtlasLib.crearAtlasCanvas(tipo, 512);
      assert.strictEqual(c.width, 512);
      assert.strictEqual(c.height, 512);
    });

    const terrainU = { uTime: { value: 0 }, uHeroXZ: { value: new THREE.Vector2(0, 0) } };
    const capasCerca = PraderaAtlasLib.crearCapasPradera(THREE, 80, terrainU, null);
    const altas = PraderaAtlasLib.crearCapasVegetacionAlta(THREE, 90, 70, terrainU, null);
    assert.ok(altas.hierbaAlta.isInstancedMesh && altas.bambu.isInstancedMesh);
    altas.actualizarRadios(24, 30);
    assert.strictEqual(altas.hierbaAlta.material.userData.fadeUniforms.uFadeEnd.value, 24);
    assert.strictEqual(altas.bambu.material.userData.fadeUniforms.uFadeEnd.value, 30);

    const cam = PraderaAtlasLib.crearCapaHierbaCamino(THREE, 80, terrainU, null, capasCerca);
    assert.ok(cam.camino.isInstancedMesh);
    assert.strictEqual(cam.camino.material.map, capasCerca.hierba.material.map, 'hierba de caminos debe compartir textura');
    PraderaAtlasLib.actualizarFadeCapa(cam.camino, 12, 18);
    assert.strictEqual(cam.camino.material.userData.fadeUniforms.uFadeStart.value, 12);
    assert.strictEqual(cam.camino.material.userData.fadeUniforms.uFadeEnd.value, 18);
  } finally {
    global.document = prevDoc;
  }

  // Distribución de hierba de ~1 m y bambú alto en muestras de pradera/bosque
  let cntAlta = 0, cntBambu = 0;
  for (let i = 0; i < 1800; i++) {
    const x = ((i * 29) % 700) - 350;
    const z = (Math.floor(i / 28) * 14) - 350;
    const r1 = ((i * 73) % 997) / 997;
    const r2 = ((i * 191) % 991) / 991;
    const r3 = ((i * 37) % 811) / 811;
    const r4 = ((i * 127) % 787) / 787;
    const bio = (i % 2 === 0) ? 'pradera' : 'bosque';
    const inst = PraderaAtlasLib.elegirInstanciaAlta(x, z, bio, 0.15, 313, r1, r2, r3 * 0.65, r4, 1);
    if (!inst) continue;
    if (inst.atlas === 'hierbaAlta') {
      const h = PraderaAtlasLib.ATLAS_ALTOS_META.hierbaAlta.altoBase * inst.sy;
      assert.ok(h >= 0.85 && h <= 1.20, 'hierba alta esperada en torno a 1 m, obtuvo ' + h);
      cntAlta++;
    } else if (inst.atlas === 'bambu') {
      const h = PraderaAtlasLib.ATLAS_ALTOS_META.bambu.altoBase * inst.sy;
      assert.ok(h >= 2.0, 'bambú alargado esperado >= 2.0 m, obtuvo ' + h);
      cntBambu++;
    }
  }
  assert.ok(cntAlta > 40 && cntBambu > 30, `debe instanciar hierbaAlta (${cntAlta}) y bambu (${cntBambu})`);

  // Distribución en caminos: brota en bordes y junta central, nunca sobre rodadas ni lejos
  let cntBorde = 0, cntJunta = 0;
  for (let i = 0; i < 400; i++) {
    const r1 = ((i * 61) % 997) / 997;
    const r2 = ((i * 131) % 991) / 991;
    const r3 = ((i * 23) % 811) / 811 * 0.45;
    const r4 = ((i * 107) % 787) / 787;
    assert.strictEqual(PraderaAtlasLib.elegirInstanciaCamino(i * 3, i * 2, 'pradera', 1.4, 3.0, 7, r1, r2, r3, r4, 1), null, 'las rodadas deben quedar libres');
    assert.strictEqual(PraderaAtlasLib.elegirInstanciaCamino(i * 3, i * 2, 'pradera', 5.0, 3.0, 7, r1, r2, r3, r4, 1), null, 'lejos del camino no brota hierba de camino');
    if (PraderaAtlasLib.elegirInstanciaCamino(i * 3, i * 2, 'pradera', 2.8, 3.0, 7, r1, r2, r3, r4, 1)) cntBorde++;
    if (PraderaAtlasLib.elegirInstanciaCamino(i * 3, i * 2, 'pradera', 0.25, 3.0, 7, r1, r2, r3, r4, 1)) cntJunta++;
  }
  assert.ok(cntBorde > 50 && cntJunta > 20, `debe instanciar hierba en bordes (${cntBorde}) y junta (${cntJunta}) de caminos`);
});

t('visor-mundo.html integra hierbaAlta, bambú, hierba en caminos y distancias por calidad decrecientes', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');
  ['hierbaAltaMesh', 'bambuMesh', 'hierbaCaminoMesh', 'crearCapasVegetacionAlta', 'crearCapaHierbaCamino', '_poblarVegetacionAltaYCamino']
    .forEach(tok => assert.ok(html.includes(tok), 'Falta integración en visor-mundo.html: ' + tok));

  const niveles = ['alto', 'medio', 'bajo', 'muybajo'];
  const qCfg = {};
  niveles.forEach(nv => {
    const m = html.match(new RegExp('\\b' + nv + ':\\s*\\{([\\s\\S]*?)\\n\\s*\\},?'));
    assert.ok(m, 'falta bloque QUALITY.' + nv);
    qCfg[nv] = {};
    ['hierbaDistCerca', 'hierbaDistLejos', 'hierbaAltaDist', 'bambuDist', 'hierbaCaminoDist'].forEach(k => {
      const km = m[1].match(new RegExp(k + ':\\s*(\\d+(?:\\.\\d+)?)'));
      assert.ok(km, `falta ${k} en QUALITY.${nv}`);
      qCfg[nv][k] = Number(km[1]);
    });
  });

  ['hierbaDistCerca', 'hierbaDistLejos', 'hierbaAltaDist', 'bambuDist', 'hierbaCaminoDist'].forEach(k => {
    assert.ok(
      qCfg.alto[k] > qCfg.medio[k] && qCfg.medio[k] > qCfg.bajo[k] && qCfg.bajo[k] > qCfg.muybajo[k],
      `${k} debe disminuir estrictamente de alto -> medio -> bajo -> muybajo (${niveles.map(nv => qCfg[nv][k]).join(' > ')})`
    );
  });
});

console.log(`\n${n} pruebas de atlas de pradera superadas`);
