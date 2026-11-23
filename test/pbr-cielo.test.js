'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PbrLib = require('../js/pbr-lib.js');
const TerrainLib = require('../js/terreno.js');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'visor-mundo.html'), 'utf8');
const nb = JSON.parse(fs.readFileSync(path.join(root, 'generar_pbr_y_cielo_colab.ipynb'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets', 'pbr', 'manifest.json'), 'utf8'));

(async function main() {
  const THREE = await import('../tools/node_modules/three/build/three.module.js');
  let passed = 0;
  function t(nombre, fn) {
    fn();
    passed++;
    console.log('ok -', nombre);
  }

t('assets/pbr/manifest.json referencia terreno, 81 texturas PBR y 3 cielos 360° con cabeceras WebP válidas', () => {
  assert.equal(manifest.version, '1.0.0');
  assert.ok(manifest.modelos && manifest.modelos.pbr && manifest.modelos.cielo);

  const verificarWebp = (relUrl) => {
    const abs = path.join(root, relUrl);
    assert.ok(fs.existsSync(abs), `Falta WebP en disco: ${relUrl}`);
    const buf = fs.readFileSync(abs);
    assert.ok(buf.length > 32, `WebP vacío o corrupto: ${relUrl}`);
    assert.equal(buf.subarray(0, 4).toString('ascii'), 'RIFF', `Cabecera RIFF inválida en ${relUrl}`);
    assert.equal(buf.subarray(8, 12).toString('ascii'), 'WEBP', `Cabecera WEBP inválida en ${relUrl}`);
  };

  assert.ok(manifest.terreno && manifest.terreno.normal && manifest.terreno.roughness, 'Falta sección terreno PBR');
  verificarWebp(manifest.terreno.normal);
  verificarWebp(manifest.terreno.roughness);

  const texKeys = Object.keys(manifest.texturas || {});
  assert.equal(texKeys.length, 81, `Esperadas 81 texturas PBR, encontradas ${texKeys.length}`);
  for (const k of texKeys) {
    const item = manifest.texturas[k];
    assert.ok(item && item.n && item.r, `Faltan mapas n/r para ${k}`);
    verificarWebp(item.n);
    verificarWebp(item.r);
  }

  for (const preset of ['day', 'golden', 'night']) {
    assert.ok(manifest.cielos && manifest.cielos[preset], `Falta skybox ${preset}`);
    verificarWebp(manifest.cielos[preset]);
  }
});

t('PbrLib normaliza rutas, encola materiales antes de cargar manifest y aplica normalMap + roughnessMap al cargar', () => {
  assert.equal(PbrLib.normalizarId('assets/texturas/piedra/t01.jpg'), 'piedra/t01');
  assert.equal(PbrLib.normalizarId('mmuro/t04.webp'), 'mmuro/t04');

  // Mock mínimo de TextureLoader sobre THREE para verificar aplicación sin red
  const loadedUrls = [];
  const fakeTHREE = Object.assign({}, THREE, {
    TextureLoader: class {
      load(url) {
        loadedUrls.push(url);
        const tex = new THREE.Texture();
        tex.userData = { url };
        return tex;
      }
    }
  });

  const mat = new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.05 });
  mat.bumpMap = new THREE.Texture();
  mat.map = new THREE.Texture();
  mat.map.repeat.set(3, 2);

  // Antes de cargar manifest: debe devolver false y encolar sin tocar bumpMap
  const antes = PbrLib.aplicarEnMaterial(fakeTHREE, mat, 'piedra/t01', { normalScale: 0.92 });
  assert.equal(antes, false);
  assert.ok(mat.bumpMap, 'bumpMap original debe conservarse mientras no haya manifest');

  // Cargar manifest simulado -> vacía pendientes y notifica listeners
  let notificado = false;
  PbrLib.onListo(() => { notificado = true; });
  PbrLib.establecerManifest({
    terreno: {
      normal: 'assets/pbr/terreno/terreno_normal.webp',
      roughness: 'assets/pbr/terreno/terreno_rough.webp',
      cols: 5,
      rows: 3
    },
    texturas: {
      'piedra/t01': { n: 'assets/pbr/piedra/t01_n.webp', r: 'assets/pbr/piedra/t01_r.webp' }
    },
    cielos: {
      day: 'assets/pbr/cielos/dia.webp',
      golden: 'assets/pbr/cielos/atardecer.webp',
      night: 'assets/pbr/cielos/noche.webp'
    }
  });

  assert.ok(notificado, 'onListo debe dispararse tras establecerManifest');
  assert.ok(mat.normalMap, 'normalMap debe aplicarse tras vaciar pendientes');
  assert.ok(mat.roughnessMap, 'roughnessMap debe aplicarse tras vaciar pendientes');
  assert.equal(mat.bumpMap, null, 'bumpMap de albedo debe reemplazarse cuando llega el normalMap real');
  assert.equal(mat.roughness, 1.0);
  assert.ok(Math.abs(mat.normalScale.x - 0.92) < 1e-6);
  assert.equal(mat.normalMap.repeat.x, 3);
  assert.equal(mat.normalMap.repeat.y, 2);
  assert.ok(loadedUrls.includes('assets/pbr/piedra/t01_n.webp'));
  assert.ok(loadedUrls.includes('assets/pbr/piedra/t01_r.webp'));
  assert.equal(PbrLib.cieloUrl('golden'), 'assets/pbr/cielos/atardecer.webp');
  assert.equal(PbrLib.terrenoUrls().cols, 5);
});

t('TerrainLib.createTerrainMaterial soporta tCapasNR/uPbrTexOn y conserva compatibilidad sin ellos', () => {
  const matSin = TerrainLib.createTerrainMaterial(THREE, {});
  const shSin = {
    uniforms: {},
    vertexShader: '#include <common>\n#include <begin_vertex>\n#include <project_vertex>',
    fragmentShader: '#include <common>\n#include <color_fragment>\n#include <roughnessmap_fragment>\n#include <normal_fragment_maps>\n#include <lights_physical_fragment>'
  };
  matSin.onBeforeCompile(shSin);
  assert.ok(!shSin.fragmentShader.includes('tCapasNR'), 'sin tCapasNR no debe exigir sampler PBR extra');

  const matCon = TerrainLib.createTerrainMaterial(THREE, {
    tCapasNR: { value: null },
    uPbrTexOn: { value: 0 }
  });
  const shCon = {
    uniforms: {},
    vertexShader: '#include <common>\n#include <begin_vertex>\n#include <project_vertex>',
    fragmentShader: '#include <common>\n#include <color_fragment>\n#include <roughnessmap_fragment>\n#include <normal_fragment_maps>\n#include <lights_physical_fragment>'
  };
  matCon.onBeforeCompile(shCon);
  assert.ok(shCon.fragmentShader.includes('uniform highp sampler2DArray tCapasNR;'));
  assert.ok(shCon.fragmentShader.includes('pbrNrm'));
  assert.ok(shCon.fragmentShader.includes('pbrRough'));
  assert.equal(typeof TerrainLib.capasNormalesDesdeImagenes, 'function');
});

t('dungeon-generator, village-core y decorado-mundo llaman a PbrLib.aplicarEnMaterial', () => {
  for (const rel of ['js/dungeon-generator.js', 'js/village-core.js', 'js/decorado-mundo.js']) {
    const src = fs.readFileSync(path.join(root, rel), 'utf8');
    assert.ok(src.includes('PbrLib.aplicarEnMaterial'), `Falta enganche PbrLib.aplicarEnMaterial en ${rel}`);
  }
});

t('visor-mundo.html integra js/pbr-lib.js, terreno PBR, cielos 360° y reflejos PMREM equirectangulares', () => {
  assert.ok(html.includes('src="js/pbr-lib.js'));
  assert.ok(html.includes('tCapasNR'));
  assert.ok(html.includes('uPbrTexOn'));
  assert.ok(html.includes('tSkyDay'));
  assert.ok(html.includes('tSkyGolden'));
  assert.ok(html.includes('tSkyNight'));
  assert.ok(html.includes('uSkyTexOn'));
  assert.ok(html.includes('uGolden'));
  assert.ok(html.includes('cargarCielosPbr'));
  assert.ok(html.includes('fromEquirectangular'));
});

t('generar_pbr_y_cielo_colab.ipynb es válido con 4 celdas de código y referencias correctas', () => {
  const codeCells = nb.cells.filter(c => c.cell_type === 'code');
  assert.equal(codeCells.length, 4);
  const fullSrc = codeCells.map(c => c.source.join('')).join('\n');
  assert.ok(fullSrc.includes('generar-pbr-y-cielo-ia.py'));
  assert.ok(fullSrc.includes('texturas_fuente_pbr.zip'));
  assert.ok(fullSrc.includes('"pillow<13"'));
});

  console.log(`\nTotal tests pbr-cielo: ${passed} pasados`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
