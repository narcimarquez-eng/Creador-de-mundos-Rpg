const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const W = require('../js/world-core.js');

test('world-core: createDungeon inicializa soporte procedural completo (estilo, seed, props, jefe x10)', () => {
  const world = W.emptyWorld();
  const d = W.createDungeon(world, 100, 200, {
    name: 'Cripta del Trono Oscuro',
    tipoGeneracion: 'procedural',
    estilo: 'cripta_gotica',
    seed: 54321
  });

  assert.equal(d.name, 'Cripta del Trono Oscuro');
  assert.equal(d.tipoGeneracion, 'procedural');
  assert.equal(d.estilo, 'cripta_gotica');
  assert.equal(d.seed, 54321);
  assert.equal(d.props.fuentes, true);
  assert.equal(d.props.antorchas, true);
  assert.equal(d.props.cofres, true);
  assert.equal(d.props.jarrones, true);
  assert.equal(d.props.musgo, true);
  assert.equal(d.props.sarcofagos, true);
  assert.equal(d.boss.rangoElite, 10);
  assert.ok(d.elites.length >= 2);
});

test('creador-de-mazmorras.html: existe, contiene Three.js, panel lateral UI, controles procedurales y enlace a mundo', () => {
  const htmlPath = path.join(__dirname, '..', 'creador-de-mazmorras.html');
  assert.ok(fs.existsSync(htmlPath), 'creador-de-mazmorras.html debe existir');

  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.ok(html.includes('id="ui-panel"'), 'Debe incluir panel lateral #ui-panel');
  assert.ok(html.includes('id="cfg-estilo"'), 'Debe incluir selector de estilo de piedra');
  assert.ok(html.includes('id="cfg-seed"'), 'Debe incluir input de semilla procedural');
  assert.ok(html.includes('id="prop-fuentes"'), 'Debe incluir toggle de fuentes');
  assert.ok(html.includes('id="prop-antorchas"'), 'Debe incluir toggle de antorchas');
  assert.ok(html.includes('id="prop-cofres"'), 'Debe incluir toggle de cofres');
  assert.ok(html.includes('id="boss-name"'), 'Debe incluir configuración del Jefe');
  assert.ok(html.includes('id="btn-save-world"'), 'Debe incluir botón para guardar y volver al mundo');
  assert.ok(html.includes('js/dungeon-generator.js'), 'Debe importar el generador procedural de mazmorras');
  assert.ok(html.includes('rpgMundo.retornoMazmorra'), 'Debe sincronizar mediante retorno de almacenamiento');

  // Nuevos controles de variedad, dimensiones y creación de estancias
  assert.ok(html.includes('id="cfg-radio"'), 'Debe incluir slider para radio de la mazmorra');
  assert.ok(html.includes('id="cfg-tamano-medio"'), 'Debe incluir slider para tamaño medio de las salas');
  assert.ok(html.includes('id="cfg-varianza"'), 'Debe incluir slider de varianza / aleatoriedad de tamaño');
  assert.ok(html.includes('id="cfg-num-salas"'), 'Debe incluir selector de número de salas');
  assert.ok(html.includes('id="cfg-ramificacion"'), 'Debe incluir selector de ramificación');
  assert.ok(html.includes('id="cfg-altura"'), 'Debe incluir control de altura de techos');
  assert.ok(html.includes('id="cfg-ancho-pasillo"'), 'Debe incluir control de anchura de pasillos');
  assert.ok(html.includes('id="new-sala-tipo"'), 'Debe incluir selector de tipo de estancia');
  assert.ok(html.includes('id="btn-insertar-sala"'), 'Debe incluir botón para insertar nueva estancia manual');
  assert.ok(html.includes('id="salas-list"'), 'Debe incluir lista de gestión de estancias');
});

test('index.html: cuenta con menú de diseño de mazmorra, herramienta dungeon con opciones procedurales y retorno', () => {
  const indexPath = path.join(__dirname, '..', 'index.html');
  const indexHtml = fs.readFileSync(indexPath, 'utf8');

  assert.ok(indexHtml.includes('data-tool="dungeon"'), 'Debe contener botón de herramienta de mazmorra');
  assert.ok(indexHtml.includes('data-act="open-dungeon"'), 'Debe contener botón para abrir el Creador de Mazmorras 3D');
  assert.ok(indexHtml.includes('openDungeonEditor'), 'Debe implementar openDungeonEditor');
  assert.ok(indexHtml.includes('consumeDungeonReturn'), 'Debe implementar consumeDungeonReturn');
  assert.ok(indexHtml.includes('to-destilo'), 'Debe ofrecer selección rápida de estilo arquitectónico de piedra');
  assert.ok(indexHtml.includes('data-dprop='), 'Debe ofrecer toggles de props en el panel de selección de mazmorra');
});

test('lugares-secretos.js: elimina las mallas de terreno del archivo GLB de cabañas y asienta zócalo de absorción de pendiente', () => {
  const libPath = path.join(__dirname, '..', 'js', 'lugares-secretos.js');
  const code = fs.readFileSync(libPath, 'utf8');

  assert.ok(code.includes('suelo') && code.includes('hierba') && code.includes('camino'), 'Debe detectar y eliminar suelo, hierba y camino del GLB');
  assert.ok(code.includes('altoZocalo'), 'Debe generar zócalo de piedra rústica para absorción de pendientes');
  assert.ok(code.includes('escala = 27.5') || code.includes('escala = (21.0 * 1.30)') || code.includes('27.5'), 'Debe aumentar la presencia arquitectónica (+30% escala)');
});
