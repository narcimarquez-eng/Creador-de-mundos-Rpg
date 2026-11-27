// Pruebas del sistema híbrido de cinemáticas de historia (manifest, láminas WebP, js/cinematicas.js e integración).
// Ejecutar: node test/cinematicas.test.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const C = require('../js/cinematicas.js');

const raiz = path.join(__dirname, '..');
let n = 0;
function t(nombre, fn) { fn(); n++; console.log('ok -', nombre); }

t('assets/cinematicas/manifest.json contiene prólogo y los 16 capítulos con estructura válida', () => {
  const manPath = path.join(raiz, 'assets/cinematicas/manifest.json');
  assert.ok(fs.existsSync(manPath), 'Falta assets/cinematicas/manifest.json');
  const man = JSON.parse(fs.readFileSync(manPath, 'utf8'));
  assert.strictEqual(man.version, 1);
  assert.ok(man.escenas && typeof man.escenas === 'object');

  const idsEsperados = ['prologo', ...Array.from({ length: 16 }, (_, i) => 'c' + (i + 1))];
  idsEsperados.forEach((id, idx) => {
    const e = man.escenas[id];
    assert.ok(e, `Falta escena ${id} en manifest.json`);
    assert.strictEqual(e.id, id);
    assert.strictEqual(e.numero, idx);
    assert.ok(e.acto && e.titulo && e.imagen && e.video && e.vozId);
    assert.ok(Array.isArray(e.planos) && e.planos.length >= 2, `${id} requiere al menos 2 planos Ken Burns`);
    assert.ok(e.duracionSeg >= 10, `${id} duración mínima 10 s`);
  });
});

t('todas las 17 láminas .webp existen, tienen cabecera RIFF/WEBP válida y tamaño optimizado', () => {
  const man = JSON.parse(fs.readFileSync(path.join(raiz, 'assets/cinematicas/manifest.json'), 'utf8'));
  for (const [id, e] of Object.entries(man.escenas)) {
    const imgPath = path.join(raiz, e.imagen);
    assert.ok(fs.existsSync(imgPath), `Falta imagen ${e.imagen} para ${id}`);
    const buf = fs.readFileSync(imgPath);
    assert.ok(buf.length >= 10000 && buf.length <= 350000, `Tamaño fuera de rango (${buf.length} B) en ${e.imagen}`);
    assert.strictEqual(buf.slice(0, 4).toString('ascii'), 'RIFF', `Cabecera RIFF inválida en ${e.imagen}`);
    assert.strictEqual(buf.slice(8, 12).toString('ascii'), 'WEBP', `Cabecera WEBP inválida en ${e.imagen}`);
  }
});

t('cada vozId de las 17 escenas existe en dialogos_voces.json con su archivo .ogg', () => {
  const man = JSON.parse(fs.readFileSync(path.join(raiz, 'assets/cinematicas/manifest.json'), 'utf8'));
  const voces = JSON.parse(fs.readFileSync(path.join(raiz, 'dialogos_voces.json'), 'utf8'));
  const porId = new Map(voces.map(v => [v.id, v]));
  for (const [id, e] of Object.entries(man.escenas)) {
    const v = porId.get(e.vozId);
    assert.ok(v, `vozId ${e.vozId} de ${id} no existe en dialogos_voces.json`);
    assert.ok(fs.existsSync(path.join(raiz, v.archivo_audio)), `Falta .ogg ${v.archivo_audio} para ${e.vozId}`);
  }
});

t('CinematicasLib: obtenerEscena, dividirSubtitulos y seleccionarFuenteMedia funcionan en modo híbrido', () => {
  assert.strictEqual(C.listarEscenas().length, 17);
  assert.strictEqual(C.obtenerEscena(0).id, 'prologo');
  assert.strictEqual(C.obtenerEscena('prologo').numero, 0);
  assert.strictEqual(C.obtenerEscena(1).id, 'c1');
  assert.strictEqual(C.obtenerEscena('16').id, 'c16');
  assert.strictEqual(C.obtenerEscena('cap_04').id, 'c4');
  assert.strictEqual(C.obtenerEscena('no_existe'), null);

  const cues = C.dividirSubtitulos(
    'El Herrero Brann tose sangre sobre el yunque. «¡Nos han tendido una trampa!» Id a los prados y abatidle antes de que cierren las puertas.',
    12
  );
  assert.strictEqual(cues.length, 3);
  assert.strictEqual(cues[0].tInicio, 0);
  assert.strictEqual(cues[cues.length - 1].tFin, 12);
  for (let i = 1; i < cues.length; i++) {
    assert.ok(cues[i].tInicio >= cues[i - 1].tFin - 1e-6);
  }

  const esc = C.obtenerEscena('c1');
  const fImg = C.seleccionarFuenteMedia(esc);
  assert.strictEqual(fImg.tipo, 'imagen');
  assert.strictEqual(fImg.src, 'assets/cinematicas/c1.webp');

  const fVidManifest = C.seleccionarFuenteMedia(Object.assign({}, esc, { videoDisponible: true }));
  assert.strictEqual(fVidManifest.tipo, 'video');
  assert.strictEqual(fVidManifest.src, 'assets/cinematicas/videos/c1.webm');

  const fVidOverride = C.seleccionarFuenteMedia(esc, { videoUrl: 'custom/intro.mp4' });
  assert.strictEqual(fVidOverride.tipo, 'video');
  assert.strictEqual(fVidOverride.src, 'custom/intro.mp4');
});

t('visor-mundo.html integra js/cinematicas.js, cámara 3D y botones de reproducción/repetición', () => {
  const html = fs.readFileSync(path.join(raiz, 'visor-mundo.html'), 'utf8');
  [
    'js/cinematicas.js',
    "CinematicasLib.cargarManifest('assets/cinematicas/manifest.json')",
    'function reproducirCinematicaCapitulo(',
    'function iniciarCamaraCinematica3D(',
    'id="cap-cinematica"',
    'id="prologo-ver-cinematica"',
    'data-accion="cinematica"',
    'id="cine3d-top"',
    'id="cine3d-bot"'
  ].forEach(tok => {
    assert.ok(html.includes(tok), `visor-mundo.html debe incluir ${tok}`);
  });
});

console.log(`\n${n} pruebas del sistema híbrido de cinemáticas superadas.`);
