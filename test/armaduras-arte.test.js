'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ArmadurasLib = require('../js/armaduras.js');
globalThis.ArmadurasLib = ArmadurasLib;
const ArteUI = require('../js/arte-ui.js');

const root = path.join(__dirname, '..');
const prompts = JSON.parse(
  fs.readFileSync(path.join(root, 'assets', 'armaduras', 'prompts_armaduras.json'), 'utf8')
);
const manifestInicial = JSON.parse(
  fs.readFileSync(path.join(root, 'assets', 'armaduras', 'manifest.json'), 'utf8')
);
const nb = JSON.parse(
  fs.readFileSync(path.join(root, 'generar_armaduras_colab.ipynb'), 'utf8')
);
const html = fs.readFileSync(path.join(root, 'visor-mundo.html'), 'utf8');

let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log('ok -', name);
}

test('prompts_armaduras.json contiene 54 sets, 270 piezas, 100 armas/escudos y 16 muestras', () => {
  assert.equal(prompts.sets.length, 54);
  assert.equal(prompts.piezas.length, 270);
  assert.equal(prompts.armas.length, 100);
  const todas = [...prompts.sets, ...prompts.piezas, ...prompts.armas];
  const muestras = todas.filter(x => x.muestra);
  assert.equal(muestras.length, 16);
});

test('assets/armaduras/manifest.json es válido y cero-404 en estado inicial', () => {
  assert.equal(manifestInicial.version, '1.0.0');
  assert.equal(typeof manifestInicial.sets, 'object');
  assert.equal(typeof manifestInicial.piezas, 'object');
  assert.equal(typeof manifestInicial.armas, 'object');
});

test('ArteUI.iconoEquipoHtml prioriza pieza exacta, cae a set con insignia de ranura y resuelve armas', () => {
  ArteUI.establecerManifestArmaduras({ sets: {}, piezas: {}, armas: {} });
  assert.equal(ArteUI.iconoEquipoHtml({ ranura: 'torso', setId: 'pesada_D_1' }, 28), null);
  assert.equal(ArteUI.tarjetaArmaduraImgHtml(ArmadurasLib.setPorId('pesada_D_1'), 76), null);

  ArteUI.establecerManifestArmaduras({
    sets: {
      pesada_D_1: 'assets/armaduras/sets/pesada_D_1.webp',
      ligera_B_1: 'assets/armaduras/sets/ligera_B_1.webp'
    },
    piezas: {
      pesada_D_1_helmet: 'assets/armaduras/piezas/pesada_D_1_helmet.webp'
    },
    armas: {
      weapon_1: 'assets/armaduras/armas/weapon_1.webp',
      shield_1: 'assets/armaduras/armas/shield_1.webp'
    }
  });

  // Pieza individual disponible -> prioridad sobre set
  const hPieza = ArteUI.iconoEquipoHtml({ ranura: 'helmet', setId: 'pesada_D_1' }, 30);
  assert.ok(hPieza && hPieza.includes('assets/armaduras/piezas/pesada_D_1_helmet.webp'));
  assert.ok(!hPieza.includes('>C<'));

  // Sin pieza individual, con set -> miniatura de set + etiqueta de ranura ('P' para torso, 'B' para boots)
  const hSet = ArteUI.iconoEquipoHtml({ ranura: 'torso', armorLook: 0 }, 28);
  assert.ok(hSet && hSet.includes('assets/armaduras/sets/pesada_D_1.webp'));
  assert.ok(hSet.includes('>P<'));

  const hHoja = ArteUI.iconoEquipoHtml({ ranura: 'boots', setId: 'ligera_B_1', tipo: 'hoja' }, 28);
  assert.ok(hHoja && hHoja.includes('assets/armaduras/sets/ligera_B_1.webp'));
  assert.ok(hHoja.includes('📜'));

  // Armas y escudos
  const hArma = ArteUI.iconoEquipoHtml({ ranura: 'weapon', idx: 1 }, 28);
  const hEscudo = ArteUI.iconoEquipoHtml({ ranura: 'shield', idx: 1 }, 28);
  assert.ok(hArma && hArma.includes('assets/armaduras/armas/weapon_1.webp'));
  assert.ok(hEscudo && hEscudo.includes('assets/armaduras/armas/shield_1.webp'));

  // Tarjeta del catálogo de armaduras
  const hCard = ArteUI.tarjetaArmaduraImgHtml(ArmadurasLib.setPorId('pesada_D_1'), 76);
  assert.ok(hCard && hCard.includes('assets/armaduras/sets/pesada_D_1.webp') && hCard.includes('arm-set-thumb'));
});

test('visor-mundo.html integra cargarManifestArmaduras, iconoEquipoHtml y tarjetaArmaduraImgHtml', () => {
  assert.ok(html.includes('cargarManifestArmaduras'));
  assert.ok(html.includes('iconoEquipoHtml'));
  assert.ok(html.includes('tarjetaArmaduraImgHtml'));
  assert.ok(html.includes('onArmadurasListo'));
});

test('visor-mundo.html integra retrato 3D de baja resolución y visor ampliado #obj-visor', () => {
  assert.ok(html.includes('capturarMiniaturaPersonaje3D'));
  assert.ok(html.includes('solicitarMiniaturaPersonaje3D'));
  assert.ok(html.includes('abrirVisorObjeto'));
  assert.ok(html.includes('id="obj-visor"'));
});

test('generar_armaduras_colab.ipynb es válido con 4 celdas de código y MODO=muestra por defecto', () => {
  const codeCells = nb.cells.filter(c => c.cell_type === 'code');
  assert.equal(codeCells.length, 4);
  const fullSrc = codeCells.map(c => c.source.join('')).join('\n');
  assert.ok(fullSrc.includes('generar-armaduras-ia.py'));
  assert.ok(fullSrc.includes('prompts_armaduras.json'));
  assert.ok(fullSrc.includes("MODO = 'muestra'"));
});

console.log(`\nTotal tests armaduras-arte: ${passed} pasados`);
