// Pruebas del controlador del personaje: orientación 360° sin volteo Euler y transición limpia ataque -> carrera sin deslizarse.
const assert = require('assert');
const THREE = require('../tools/node_modules/three/build/three.cjs');
globalThis.THREE = THREE;
globalThis.window = { addEventListener() {} };

const { CharacterController, SKILL_MOTION, ONE_SHOT } = require('../js/character.js');

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

  // Caso 1: tiro con arco (clip de 3.4 s, bloqueo según ONE_SHOT.disparo.lock)
  ch.playOneShot('disparo');
  assert.strictEqual(ch.activeState, 'oneshot');
  ch.destino = { x: 25, z: -25, parar: 2 };
  const pasosLockDisparo = Math.floor((ONE_SHOT.disparo.lock - 0.02) / 0.05);
  for (let i = 0; i < pasosLockDisparo; i++) ch.update(0.05); // aún bloqueado, no debe haberse movido
  assert.ok(Math.hypot(ch.root.position.x, ch.root.position.z) < 1e-4, 'durante el bloqueo no se desplaza');

  ch.update(0.1); // termina el bloqueo y da el primer paso
  assert.ok(Math.hypot(ch.root.position.x, ch.root.position.z) > 0.1, 'empieza a avanzar hacia el objetivo');
  assert.strictEqual(ch.activeState, 'run', 'al avanzar cambia inmediatamente a animación de correr (sin deslizarse)');
  assert.strictEqual(ch.currentAction, ch.actions.run);
  assert.ok(ch.actions.run.isRunning());

  // Caso 2: golpe cuerpo a cuerpo (clip de 1.5 s, bloqueo según ONE_SHOT.attack.lock)
  ch.playOneShot('attack');
  const pasosLockAttack = Math.ceil((ONE_SHOT.attack.lock + 0.05) / 0.05);
  for (let i = 0; i < pasosLockAttack; i++) ch.update(0.05); // termina el bloqueo
  assert.strictEqual(ch.activeState, 'run', 'tras golpe cuerpo a cuerpo vuelve a correr en cuanto se desplaza');
});

t('startDodge cancela el bloqueo, avanza en su dirección, respeta muros y termina tras duration', () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  const controls = { target: new THREE.Vector3() };
  const world = {
    getWalkableHeight: () => 0,
    colliders: [{ type: 'box', minX: 3.5, maxX: 5.5, minZ: -4, maxZ: 4 }]
  };
  const ch = new CharacterController({ scene, camera, controls, world, glbUrl: null });
  ch.root.position.set(0, 0, 0);
  ch.lockUntil = 5.0;

  ch.startDodge({ dirX: 1, dirZ: 0, duration: 0.34, speed: 22.0 });
  assert.strictEqual(ch.lockUntil, 0, 'startDodge debe limpiar lockUntil');
  assert.strictEqual(ch.isDodging(), true);
  assert.ok(ch.frente().x > 0.99, 'el personaje debe orientarse hacia la dirección de esquiva');

  for (let i = 0; i < 8; i++) ch.update(0.05); // 0.40 s > 0.34 s
  assert.strictEqual(ch.isDodging(), false, 'al finalizar duration debe salir de estado dodge');
  assert.ok(ch.root.position.x > 1.5, 'debe haberse desplazado hacia el muro');
  assert.ok(ch.root.position.x <= 3.5 - ch.radius + 0.05, 'la esquiva no debe atravesar el muro (x=' + ch.root.position.x.toFixed(2) + ')');
});

t('evasión suave sin oscilación alrededor de un muro frontal', () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  const controls = { target: new THREE.Vector3() };
  const wall = { type: 'box', minX: -5, maxX: 5, minZ: 5, maxZ: 7 };
  const world = { getWalkableHeight: () => 0, colliders: [wall] };
  const ch = new CharacterController({ scene, camera, controls, world, glbUrl: null });
  ch.root.position.set(0, 0, 0);
  ch.destino = { x: 0, z: 18, parar: 0.6 };

  let lastDx = 0, flips = 0;
  for (let i = 0; i < 100; i++) {
    const px = ch.root.position.x;
    ch.caminarADestino(0.05, false);
    const dx = ch.root.position.x - px;
    if (Math.abs(dx) > 0.05) {
      if (lastDx !== 0 && Math.sign(dx) !== Math.sign(lastDx)) flips++;
      lastDx = dx;
    }
    if (Math.hypot(ch.root.position.x, ch.root.position.z - 18) <= 0.7) break;
  }
  assert.ok(!ch.atascado, 'no debe atascarse al rodear un muro de 10 m');
  assert.ok(Math.hypot(ch.root.position.x, ch.root.position.z - 18) <= 0.8, 'debe alcanzar el destino detrás del muro');
  assert.ok(flips <= 2, 'no debe oscilar repetidamente contra el muro (flips=' + flips + ')');
});

t('detecta atasco por falta de progreso neto al deslizarse lateralmente por un muro largo', () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  const controls = { target: new THREE.Vector3() };
  const longWall = { type: 'box', minX: -120, maxX: 120, minZ: 5, maxZ: 7 };
  const world = { getWalkableHeight: () => 0, colliders: [longWall] };
  const ch = new CharacterController({ scene, camera, controls, world, glbUrl: null });
  ch.root.position.set(0, 0, 0);
  ch.destino = { x: 0, z: 22, parar: 0.5 };

  let stuckAt = -1;
  for (let i = 0; i < 60; i++) { // 3.0 s máx
    if (ch.destino) ch.caminarADestino(0.05, false);
    if (ch.atascado) { stuckAt = (i + 1) * 0.05; break; }
  }
  assert.strictEqual(ch.atascado, true, 'debe marcar atascado al deslizarse sin acercarse al destino');
  assert.ok(stuckAt > 0 && stuckAt < 3.0, 'debe detectar el atasco antes de 3 s (t=' + stuckAt.toFixed(2) + 's)');
});

function crearControladorConMallaGLB(extraClips = []) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  const controls = { target: new THREE.Vector3() };
  const world = { getWalkableHeight: () => 0, colliders: [] };
  const ch = new CharacterController({ scene, camera, controls, world, glbUrl: null });

  const bone = new THREE.Bone();
  bone.name = 'Hips';
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.0, 0.4), new THREE.MeshStandardMaterial());
  const model = new THREE.Group();
  model.add(bone, body);
  const clip = (name, dur) => new THREE.AnimationClip(name, dur, [
    new THREE.VectorKeyframeTrack('Hips.position', [0, dur], [0, 0, 0, 0, 0.1, 0])
  ]);
  ch._instalarGLTF({
    scene: model,
    animations: [
      clip('idle', 2.4),
      clip('walk', 1.1),
      clip('run', 0.68),
      clip('punch', 1.5)
    ].concat(extraClips.map(n => clip(n, 2.5)))
  }, 'guerrero');
  return ch;
}

t('SKILL_MOTION cubre todas las habilidades activas del guerrero', () => {
  const guerreroSkills = [
    'sismo', 'nova', 'tajo', 'ascendente', 'hendidura', 'contraataque',
    'torbellino', 'corte_cruzado', 'furia', 'escudo_espiritu', 'salto_demoledor', 'sentencia_titan'
  ];
  guerreroSkills.forEach(id => {
    assert.ok(SKILL_MOTION && SKILL_MOTION[id], 'falta SKILL_MOTION para ' + id);
    assert.ok(SKILL_MOTION[id].dur > 0, 'duración positiva para ' + id);
  });
});

t('con clip nativo del Estudio la skill usa su animación horneada sin desplazar el modelo de forma procedimental', () => {
  const ch = crearControladorConMallaGLB(['whirlwind', 'overhead_cleave', 'ultimate_slam', 'ultimate_nova']);
  ch.playOneShot('salto_demoledor');
  assert.ok(ch.oneShots.salto_demoledor && !ch.oneShots.salto_demoledor.fallbackClip, 'usa clip nativo');
  let maxDy = 0;
  for (let i = 0; i < 40; i++) { ch.update(0.03); maxDy = Math.max(maxDy, Math.abs(ch.model.position.y - ch._baseModelY)); }
  assert.ok(maxDy < 1e-6, 'sin doble movimiento procedimental sobre el clip nativo: ' + maxDy);
});

t('skills del guerrero ejecutan animación especial procedimental sobre model, respetan frente() y restauran pose base', () => {
  const ch = crearControladorConMallaGLB([]); // sin clips nativos: animación procedimental de respaldo
  ch.mirarHacia(1, 0);
  const frenteIni = ch.frente();

  const probarSkill = (id, validarPicos) => {
    ch.playOneShot(id);
    const dur = SKILL_MOTION[id].dur;
    const stats = { maxDy: -Infinity, minDy: Infinity, maxDz: -Infinity, minDz: Infinity, maxAbsRy: 0, maxAbsRz: 0, maxRx: -Infinity, minRx: Infinity };
    const steps = Math.ceil((dur + 0.15) / 0.03);
    for (let i = 0; i < steps; i++) {
      ch.update(0.03);
      const dy = ch.model.position.y - ch._baseModelY;
      stats.maxDy = Math.max(stats.maxDy, dy);
      stats.minDy = Math.min(stats.minDy, dy);
      stats.maxDz = Math.max(stats.maxDz, ch.model.position.z);
      stats.minDz = Math.min(stats.minDz, ch.model.position.z);
      stats.maxAbsRy = Math.max(stats.maxAbsRy, Math.abs(ch.model.rotation.y));
      stats.maxAbsRz = Math.max(stats.maxAbsRz, Math.abs(ch.model.rotation.z));
      stats.maxRx = Math.max(stats.maxRx, ch.model.rotation.x);
      stats.minRx = Math.min(stats.minRx, ch.model.rotation.x);
      // Orientación de root intacta
      const f = ch.frente();
      assert.ok(Math.hypot(f.x - frenteIni.x, f.z - frenteIni.z) < 1e-6, `frente() alterado durante ${id}`);
    }
    const shot = ch.oneShots[id];
    if (shot && !shot.fallbackClip) {
      // Con clip nativo (p.ej. 'punch' del GLB) la animación horneada manda: sin desplazamiento procedimental
      assert.ok(Math.abs(stats.maxDy) < 1e-6 && Math.abs(stats.maxDz) < 1e-6, `${id}: clip nativo sin movimiento procedimental`);
    } else {
      validarPicos(stats);
    }
    // Pose exactamente restaurada al terminar
    assert.ok(Math.abs(ch.model.position.x) < 1e-6 && Math.abs(ch.model.position.z) < 1e-6, `${id}: x/z restaurados`);
    assert.ok(Math.abs(ch.model.position.y - ch._baseModelY) < 1e-6, `${id}: y base restaurado`);
    assert.ok(Math.abs(ch.model.rotation.x) < 1e-6 && Math.abs(ch.model.rotation.y) < 1e-6 && Math.abs(ch.model.rotation.z) < 1e-6, `${id}: rotación restaurada`);
    assert.ok(Math.abs(ch.model.scale.y - ch._baseModelScale) < 1e-6, `${id}: escala base restaurada`);
  };

  probarSkill('salto_demoledor', s => assert.ok(s.maxDy > 1.8, 'salto_demoledor sube > 1.8m: ' + s.maxDy.toFixed(2)));
  probarSkill('torbellino', s => assert.ok(s.maxAbsRy > Math.PI * 2, 'torbellino gira > 360°: ' + s.maxAbsRy.toFixed(2)));
  probarSkill('furia', s => assert.ok(s.maxDz > 0.6, 'furia arremete hacia delante > 0.6m: ' + s.maxDz.toFixed(2)));
  probarSkill('corte_cruzado', s => {
    assert.ok(s.maxDz > 0.6, 'corte_cruzado avanza: ' + s.maxDz.toFixed(2));
    assert.ok(s.maxAbsRz > 0.2, 'corte_cruzado inclina en diagonal: ' + s.maxAbsRz.toFixed(2));
  });
  probarSkill('hendidura', s => {
    assert.ok(s.maxDy > 1.0 && s.maxRx > 0.3, 'hendidura salta y parte hacia delante');
  });
  probarSkill('sentencia_titan', s => assert.ok(s.maxDy > 2.0, 'sentencia_titan asciende > 2.0m: ' + s.maxDy.toFixed(2)));

  // Verificar limpieza inmediata al cortar con _cortarOneShot(true) o startDodge()
  ch.playOneShot('salto_demoledor');
  for (let i = 0; i < 12; i++) ch.update(0.03);
  assert.ok(Math.abs(ch.model.position.y - ch._baseModelY) > 0.5, 'en mitad del salto está elevado');
  ch._cortarOneShot(true);
  assert.strictEqual(ch._skillAnim, null, '_cortarOneShot(true) limpia _skillAnim');
  assert.ok(Math.abs(ch.model.position.y - ch._baseModelY) < 1e-6, 'restaura pose tras _cortarOneShot(true)');

  ch.playOneShot('torbellino');
  for (let i = 0; i < 10; i++) ch.update(0.03);
  assert.ok(Math.abs(ch.model.rotation.y) > 0.2, 'en mitad del torbellino está rotando');
  ch.startDodge({ dirX: 0, dirZ: 1 });
  assert.strictEqual(ch._skillAnim, null, 'startDodge limpia _skillAnim');
  assert.ok(Math.abs(ch.model.rotation.y) < 1e-6, 'startDodge restaura rotación base de model');
});

t('cuando al GLB le falta el clip específico de una skill, recurre al clip attack sin congelarse en idle y aplica animación especial', () => {
  const ch = crearControladorConMallaGLB([]); // sin ultimate_slam ni whirlwind en el GLB
  assert.ok(ch.oneShots.salto_demoledor, 'salto_demoledor hereda fallback de attack');
  assert.strictEqual(ch.oneShots.salto_demoledor.fallbackClip, true);
  assert.strictEqual(ch.oneShots.salto_demoledor.action, ch.oneShots.attack.action);

  ch.playOneShot('salto_demoledor');
  assert.strictEqual(ch.activeState, 'oneshot', 'no se queda congelado en idle');
  assert.strictEqual(ch.currentAction, ch.oneShots.attack.action);
  let maxDy = 0;
  for (let i = 0; i < 45; i++) {
    ch.update(0.03);
    maxDy = Math.max(maxDy, ch.model.position.y - ch._baseModelY);
  }
  assert.ok(maxDy > 1.8, 'mantiene gran salto procedimental incluso sin clip dedicado (' + maxDy.toFixed(2) + 'm)');
});

t('playOneShot("attack") y habilidades mantienen velocidad legible sin acelerar en exceso', () => {
  const ch = crearControladorConMallaGLB(['spin_slash']);
  const durAtk = ch.playOneShot('attack');
  const tsAtk = ch.oneShots.attack.action.getEffectiveTimeScale();
  assert.ok(tsAtk <= 0.95 + 1e-6, `attack no debe superar 0.95x (fue ${tsAtk})`);
  assert.ok(durAtk >= 1.1, `duración visible de attack >= 1.1s (fue ${durAtk})`);

  const durCorte = ch.playOneShot('corte_cruzado');
  const tsCorte = ch.oneShots.corte_cruzado.action.getEffectiveTimeScale();
  assert.ok(tsCorte <= 0.82 + 1e-6, `corte_cruzado no debe superar 0.82x (fue ${tsCorte})`);
  assert.ok(durCorte >= 1.4, `duración visible de corte_cruzado >= 1.4s (fue ${durCorte})`);
});

console.log('\n' + n + ' pruebas de movimiento y puntería automática superadas.');
