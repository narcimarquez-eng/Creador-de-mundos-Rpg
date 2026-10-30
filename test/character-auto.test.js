// Pruebas del controlador del personaje: orientación 360° sin volteo Euler y transición limpia ataque -> carrera sin deslizarse.
const assert = require('assert');
const THREE = require('../tools/node_modules/three/build/three.cjs');
globalThis.THREE = THREE;
globalThis.window = { addEventListener() {} };

const { CharacterController } = require('../js/character.js');

let n = 0;
function t(nombre, fn) { fn(); n++; console.log('ok -', nombre); }

function crearControladorPrueba() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  const controls = { target: new THREE.Vector3() };
  const world = { getWalkableHeight: () => 0, colliders: [] };
  const ch = new CharacterController({ scene, camera, controls, world, glbUrl: null });

  const bone = new THREE.Bone();
  bone.name = 'Hips';
  const model = new THREE.Group();
  model.add(bone);
  const clip = (name, dur) => new THREE.AnimationClip(name, dur, [
    new THREE.VectorKeyframeTrack('Hips.position', [0, dur], [0, 0, 0, 0, 0.1, 0])
  ]);
  ch._instalarGLTF({
    scene: model,
    animations: [
      clip('idle', 2.4),
      clip('walk', 1.1),
      clip('run', 0.68),
      clip('punch', 1.5),
      clip('archery', 3.4)
    ]
  }, 'prueba');
  return ch;
}

t('mirarHacia y frente() apuntan exactamente al objetivo en los 360° (incluido el hemisferio -Z tras slerp)', () => {
  const ch = crearControladorPrueba();
  // Primero forzamos un giro por slerp hacia -Z (donde Euler XYZ ponía rotation.x = π, rotation.z = π)
  ch.destino = { x: -15, z: -30, parar: 1 };
  for (let i = 0; i < 30; i++) ch.update(0.05);

  for (let deg = -180; deg < 180; deg += 10) {
    const rad = deg * Math.PI / 180;
    const dx = Math.sin(rad) * 12, dz = Math.cos(rad) * 12;
    ch.mirarHacia(dx, dz);
    const f = ch.frente();
    const dot = f.x * Math.sin(rad) + f.z * Math.cos(rad);
    assert.ok(dot > 0.99999, `en ${deg}° el frente (${f.x.toFixed(3)}, ${f.z.toFixed(3)}) no coincide con el objetivo`);
    assert.ok(Math.abs(ch.root.rotation.x) < 1e-6 && Math.abs(ch.root.rotation.z) < 1e-6, 'sin inclinación X/Z espuria');
  }
});

t('tras disparar arco o atacar, en cuanto termina el bloqueo y corre hacia otro monstruo pasa a "run" sin deslizarse', () => {
  const ch = crearControladorPrueba();
  ch.root.position.set(0, 0, 0);

  // Caso 1: tiro con arco (clip de 3.4 s, bloqueo de 0.8 s)
  ch.playOneShot('disparo');
  assert.strictEqual(ch.activeState, 'oneshot');
  ch.destino = { x: 25, z: -25, parar: 2 };
  for (let i = 0; i < 15; i++) ch.update(0.05); // 0.75 s: aún bloqueado, no debe haberse movido
  assert.ok(Math.hypot(ch.root.position.x, ch.root.position.z) < 1e-4, 'durante el bloqueo no se desplaza');

  ch.update(0.1); // 0.85 s: termina el bloqueo y da el primer paso
  assert.ok(Math.hypot(ch.root.position.x, ch.root.position.z) > 0.1, 'empieza a avanzar hacia el objetivo');
  assert.strictEqual(ch.activeState, 'run', 'al avanzar cambia inmediatamente a animación de correr (sin deslizarse)');
  assert.strictEqual(ch.currentAction, ch.actions.run);
  assert.ok(ch.actions.run.isRunning());

  // Caso 2: golpe cuerpo a cuerpo (clip de 1.5 s, bloqueo de 0.5 s)
  ch.playOneShot('attack');
  for (let i = 0; i < 11; i++) ch.update(0.05); // 0.55 s: termina el bloqueo
  assert.strictEqual(ch.activeState, 'run', 'tras golpe cuerpo a cuerpo vuelve a correr en cuanto se desplaza');
});

console.log('\n' + n + ' pruebas de movimiento y puntería automática superadas.');
