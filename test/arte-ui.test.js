'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ArteUI = require('../js/arte-ui.js');
const CombatLib = require('../js/combat.js');
const prompts = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'assets', 'arte', 'prompts_arte.json'), 'utf8')
);
const manifestInicial = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'assets', 'arte', 'manifest.json'), 'utf8')
);
const html = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');

const skillIds = Object.keys(CombatLib.SKILLS);

let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log('OK -', name);
}

test('prompts_arte.json contiene exactamente 1 portada, 15 retratos y 23 iconos únicos', () => {
  assert.equal(prompts.portada.length, 1);
  assert.equal(prompts.retratos.length, 15);
  assert.equal(prompts.iconos.length, 23);

  const idsPort = new Set(prompts.portada.map(x => x.id));
  const idsRet = new Set(prompts.retratos.map(x => x.id));
  const idsIco = new Set(prompts.iconos.map(x => x.id));
  assert.equal(idsPort.size, 1);
  assert.equal(idsRet.size, 15);
  assert.equal(idsIco.size, 23);
});

test('manifest.json referencia la portada, 15 retratos y 23 iconos existentes con cabecera WebP válida', () => {
  const rootDir = path.join(__dirname, '..');
  const verificarWebp = (relUrl) => {
    const abs = path.join(rootDir, relUrl);
    assert.ok(fs.existsSync(abs), `Falta archivo WebP en disco: ${relUrl}`);
    const buf = fs.readFileSync(abs);
    assert.ok(buf.length > 32, `Archivo WebP vacío o corrupto: ${relUrl}`);
    assert.equal(buf.subarray(0, 4).toString('ascii'), 'RIFF', `Cabecera RIFF inválida en ${relUrl}`);
    assert.equal(buf.subarray(8, 12).toString('ascii'), 'WEBP', `Cabecera WEBP inválida en ${relUrl}`);
  };

  assert.ok(typeof manifestInicial.portada === 'string' && manifestInicial.portada.length > 0);
  verificarWebp(manifestInicial.portada);

  const retratoKeys = Object.keys(manifestInicial.retratos);
  const iconoKeys = Object.keys(manifestInicial.iconos);
  assert.equal(retratoKeys.length, 15);
  assert.equal(iconoKeys.length, 23);

  for (const k of retratoKeys) verificarWebp(manifestInicial.retratos[k]);
  for (const k of iconoKeys) verificarWebp(manifestInicial.iconos[k]);
});

test('todas las 81 habilidades de CombatLib.SKILLS + utilidades mapean a un icono válido en prompts_arte.json', () => {
  assert.equal(skillIds.length, 81);
  const iconosValidos = new Set(prompts.iconos.map(i => i.id));
  for (const id of skillIds) {
    const ico = ArteUI.resolverIconoId(id);
    assert.ok(ico, `Falta mapeo de icono para skill '${id}'`);
    assert.ok(iconosValidos.has(ico), `Icono '${ico}' de '${id}' no existe en prompts_arte.json`);
  }
  for (const extra of ['esquiva', 'pocion_vida', 'pocion_mana']) {
    const ico = ArteUI.resolverIconoId(extra);
    assert.ok(ico && iconosValidos.has(ico), `Falta icono válido para '${extra}'`);
  }
  // Los 23 iconos deben estar cubiertos al menos una vez (incluyendo variaciones de ataque por arma)
  const usados = new Set([
    ...skillIds.map(id => ArteUI.resolverIconoId(id)),
    ...Object.values(ArteUI.WEAPON_ATTACK_ICON),
    ArteUI.resolverIconoId('esquiva'),
    ArteUI.resolverIconoId('pocion_vida'),
    ArteUI.resolverIconoId('pocion_mana')
  ]);
  for (const icoId of iconosValidos) {
    assert.ok(usados.has(icoId), `Icono sin usar en el mapeo: '${icoId}'`);
  }
});

test('resolverClaveRetrato cubre los 15 personajes principales, sufijos de asentamiento y acentos', () => {
  const retratosValidos = new Set(prompts.retratos.map(r => r.id));
  for (const r of prompts.retratos) {
    assert.equal(ArteUI.resolverClaveRetrato(r.id), r.id);
    assert.equal(ArteUI.resolverClaveRetrato(r.nombre), r.id);
    assert.ok(retratosValidos.has(ArteUI.resolverClaveRetrato(r.nombre)));
  }
  assert.equal(ArteUI.resolverClaveRetrato('serv-herrero-bosque'), 'serv-herrero');
  assert.equal(ArteUI.resolverClaveRetrato('Sabía Elára'), 'guru-1');
  assert.equal(ArteUI.resolverClaveRetrato('serv-entrenador-norte'), 'serv-comandante');
});

test('sin archivos descargados (manifest vacío) devuelve null sin URLs rotas; con manifest devuelve URLs esperadas', () => {
  ArteUI.establecerManifest({ portada: null, retratos: {}, iconos: {} });
  assert.equal(ArteUI.portadaUrl(), null);
  assert.equal(ArteUI.retratoUrl('guru-1'), null);
  assert.equal(ArteUI.iconoUrl('bola_fuego'), null);

  ArteUI.establecerManifest({
    portada: 'assets/arte/portada/portada_valdris.webp',
    retratos: { 'guru-1': 'assets/arte/retratos/guru-1.webp', rowan: 'assets/arte/retratos/rowan.webp' },
    iconos: { fuego_magia: 'assets/arte/iconos/fuego_magia.webp', mandoble: 'assets/arte/iconos/mandoble.webp' }
  });
  assert.equal(ArteUI.portadaUrl(), 'assets/arte/portada/portada_valdris.webp');
  assert.equal(ArteUI.retratoUrl('Sabia Elara'), 'assets/arte/retratos/guru-1.webp');
  assert.equal(ArteUI.retratoUrl('Rowan'), 'assets/arte/retratos/rowan.webp');
  assert.equal(ArteUI.iconoUrl('bola_fuego'), 'assets/arte/iconos/fuego_magia.webp');
  assert.equal(ArteUI.iconoUrl('attack', 'espada2m'), 'assets/arte/iconos/mandoble.webp');
});

test('visor-mundo.html integra js/arte-ui.js, portada, retratos y ganchos HUD', () => {
  assert.ok(html.includes('src="js/arte-ui.js'));
  assert.ok(html.includes('id="portada-art-wrap"'));
  assert.ok(html.includes('id="npc-retrato"'));
  assert.ok(html.includes('id="cap-retrato"'));
  assert.ok(html.includes('window.ArteUI.cargarManifest'));
  assert.ok(html.includes('window.ArteUI.renderIconoEnElemento'));
  assert.ok(html.includes('window.ArteUI.aplicarRetrato'));
});

console.log(`\nTotal tests arte-ui: ${passed} pasados`);
