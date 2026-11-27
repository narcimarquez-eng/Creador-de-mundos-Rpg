// Pruebas del Director de cinemáticas 3D actuadas (js/director-escenas-3d.js + integración en visor-mundo.html).
// Ejecutar: node test/director-escenas-3d.test.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const D = require('../js/director-escenas-3d.js');
const Cinemas = require('../js/cinematicas.js');

const raiz = path.join(__dirname, '..');
let n = 0;
function t(nombre, fn) {
  try { fn(); n++; console.log('ok -', nombre); }
  catch (e) { console.error('FAIL -', nombre, e && e.stack ? e.stack : e); process.exit(1); }
}

(async () => {
  let THREE = null;
  try {
    THREE = await import(pathToFileURL(path.join(raiz, 'tools/node_modules/three/build/three.module.js')).href);
  } catch (_) {}

  t('GUIONES_3D cubre prólogo y los 16 capítulos con planos, escenografía y acciones', () => {
    const lista = D.listarGuiones();
    assert.strictEqual(lista.length, 17);
    const ids = ['prologo', ...Array.from({ length: 16 }, (_, i) => 'c' + (i + 1))];
    ids.forEach((id, idx) => {
      const g = D.obtenerGuion(id);
      assert.ok(g, 'Falta guión ' + id);
      assert.strictEqual(g.numero, idx);
      assert.ok(g.duracionSeg >= 10, id + ' duración >= 10s');
      assert.ok(g.npcRol && g.escenografia, id + ' requiere npcRol y escenografia');
      assert.ok(Array.isArray(g.planos) && g.planos.length >= 4, id + ' requiere >= 4 planos');
      assert.ok(Array.isArray(g.accionesHeroe) && g.accionesHeroe.length >= 2, id + ' requiere accionesHeroe');
    });
    assert.strictEqual(D.obtenerGuion(0).id, 'prologo');
    assert.strictEqual(D.obtenerGuion('cap_14').id, 'c14');
    assert.strictEqual(D.obtenerGuion('16').id, 'c16');
    assert.strictEqual(D.obtenerGuion('no_existe'), null);
  });

  t('evaluarPlanoCamara devuelve posiciones finitas y 4 cortes válidos en las 17 escenas', () => {
    const focos = {
      centro: [10, 1.3, 20],
      heroe: [8.7, 1.35, 21.2],
      npc: [11.8, 1.35, 19.4],
      enemigo: [10, 1.25, 18],
      prop: [10, 1.4, 17.4]
    };
    D.listarGuiones().forEach(g => {
      const tipos = new Set();
      for (let tSec = 0; tSec <= g.duracionSeg; tSec += 0.5) {
        const res = D.evaluarPlanoCamara(g, tSec, focos);
        tipos.add(res.tipo);
        res.pos.forEach(v => assert.ok(Number.isFinite(v), `${g.id} pos finita`));
        res.lookAt.forEach(v => assert.ok(Number.isFinite(v), `${g.id} lookAt finito`));
        assert.ok(res.fov >= 30 && res.fov <= 70, `${g.id} fov válido`);
      }
      assert.ok(tipos.size >= 3, `${g.id} debe alternar al menos 3 tipos de plano`);
    });
  });

  if (THREE) {
    t('simulación 3D completa (prologo y c14) mueve actores/cámara y restaura todo al detener()', () => {
      ['prologo', 'c14'].forEach(escenaId => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 1000);
        camera.position.set(100, 15, 200);
        const controls = { target: new THREE.Vector3(100, 2, 190), enabled: true };

        const heroRoot = new THREE.Group();
        heroRoot.position.set(100, 1, 190);
        heroRoot.rotation.set(0, 0.5, 0);
        scene.add(heroRoot);

        const compRoot = new THREE.Group();
        compRoot.position.set(97, 1, 192);
        compRoot.rotation.set(0, 0.2, 0);
        scene.add(compRoot);
        const acompanante = { root: compRoot, x: 97, y: 1, z: 192, rotY: 0.2 };

        const npcRaiz = new THREE.Group();
        npcRaiz.position.set(42, 3, -15);
        npcRaiz.rotation.set(0, -0.4, 0);
        scene.add(npcRaiz);
        const gurus = [{ info: { id: 'herrero', servicio: 'herrero' }, raiz: npcRaiz }, { info: { id: 'guru-4' }, raiz: npcRaiz }];

        const shotsHero = [];
        const sfxCalled = [];
        let horaActual = 'day';
        let musVol = 0.62;
        let ended = null;

        const character = {
          root: heroRoot,
          cameraMode: 'follow',
          mirarHacia(dx, dz) { this.root.rotation.y = Math.atan2(dx, dz); },
          playOneShot(k) { shotsHero.push(k); return 1.4; }
        };

        const ok = D.iniciar(escenaId, {
          THREE,
          scene,
          camera,
          controls,
          character,
          acompanante,
          gurus,
          CinematicasLib: Cinemas,
          Sonidos: {
            getVolumenes: () => ({ musica: musVol }),
            setVolumen: (c, v) => { if (c === 'musica') musVol = v; },
            skill: (id, f) => sfxCalled.push('skill:' + id + ':' + f),
            enemigo: (ev) => sfxCalled.push('enemigo:' + ev),
            esfuerzo: () => sfxCalled.push('esfuerzo')
          },
          getTimeOfDay: () => horaActual,
          setTimeOfDay: h => { horaActual = h; },
          getGroundY: () => 1,
          destelloImpacto: () => sfxCalled.push('destello'),
          ondaDetonacion: () => sfxCalled.push('onda'),
          activarSacudida: () => sfxCalled.push('sacudida'),
          titulo: 'Prueba ' + escenaId,
          texto: 'Primera frase de prueba. Segunda frase de prueba.',
          duracionSeg: 14,
          onTerminar: info => { ended = info; }
        });

        assert.strictEqual(ok, true, escenaId + ' debe iniciar');
        assert.strictEqual(D.estaActiva(), true);
        assert.strictEqual(horaActual, 'night', escenaId + ' debe activar atmósfera nocturna');
        assert.strictEqual(controls.enabled, false);
        assert.ok(scene.children.length > 3, 'debe añadir grupo de escenografía y enemigos');

        const camPoses = new Set();
        for (let step = 0; step < 300 && D.estaActiva(); step++) {
          D.actualizar(0.05, step * 50);
          camPoses.add(camera.position.x.toFixed(1));
        }
        assert.strictEqual(D.estaActiva(), false, escenaId + ' debe auto-terminar tras duracionSeg');
        assert.ok(ended && ended.modo === '3d', 'debe notificar onTerminar modo=3d');
        assert.ok(shotsHero.length >= 1, escenaId + ' debe ejecutar animaciones del héroe');
        assert.ok(sfxCalled.some(x => x.startsWith('enemigo:')), escenaId + ' debe disparar voz de enemigo');
        assert.ok(sfxCalled.includes('esfuerzo'), escenaId + ' debe disparar esfuerzo del héroe');
        assert.ok(camPoses.size >= 8, escenaId + ' debe mover la cámara a través de los planos');

        // Restauración íntegra de posiciones, rotaciones, cámara y ambiente
        assert.strictEqual(scene.children.length, 3, 'escenaGrupo debe eliminarse de scene al terminar');
        assert.ok(Math.abs(heroRoot.position.x - 100) < 1e-6 && Math.abs(heroRoot.position.z - 190) < 1e-6);
        assert.ok(Math.abs(heroRoot.rotation.y - 0.5) < 1e-6);
        assert.ok(Math.abs(compRoot.position.x - 97) < 1e-6 && Math.abs(compRoot.position.z - 192) < 1e-6);
        assert.ok(Math.abs(npcRaiz.position.x - 42) < 1e-6 && Math.abs(npcRaiz.position.z - (-15)) < 1e-6);
        assert.ok(Math.abs(camera.position.x - 100) < 1e-6 && Math.abs(camera.fov - 50) < 1e-6);
        assert.strictEqual(controls.enabled, true);
        assert.strictEqual(horaActual, 'day', 'hora original restaurada');
        assert.ok(Math.abs(musVol - 0.62) < 1e-6, 'volumen de música restaurado');
      });
    });
  } else {
    console.log('  (three no disponible en tools/node_modules: se omiten pruebas 3D completas)');
  }

  t('visor-mundo.html integra js/director-escenas-3d.js, loop 3D y disparo desde reproducirCinematicaCapitulo', () => {
    const html = fs.readFileSync(path.join(raiz, 'visor-mundo.html'), 'utf8');
    [
      'js/director-escenas-3d.js',
      'DirectorEscenas3D.iniciar(',
      'DirectorEscenas3D.actualizar(',
      'DirectorEscenas3D.estaActiva()',
      'onVerLamina2D'
    ].forEach(tok => {
      assert.ok(html.includes(tok), `visor-mundo.html debe incluir ${tok}`);
    });
  });

  console.log(`\n${n} pruebas del Director 3D de cinemáticas superadas.`);
})();
