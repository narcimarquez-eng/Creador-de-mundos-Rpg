/*
 * character.js — Personaje y cámara compartidos por el Creador de Pueblos y el Visor del mundo.
 *
 * El "mundo" que recibe el personaje debe ofrecer:
 *   getWalkableHeight(x, z)  → altura del suelo donde se puede estar de pie
 *   getColliders(x, z)       → (opcional) colisionadores cercanos a (x, z) en coordenadas del mundo
 *   colliders                → (si no hay getColliders) lista fija de colisionadores
 *   isWaterHazard(x, z, r)   → (opcional) true si la posición es agua
 *
 * Colisionadores (en coordenadas del mundo):
 *   { type: 'circle', x, z, r }
 *   { type: 'box', minX, maxX, minZ, maxZ }                       rectángulo alineado con los ejes
 *   { type: 'obb', cx, cz, ux, uz, hu, hv }                       rectángulo girado: (ux, uz) es el eje u unitario,
 *                                                                 (-uz, ux) el eje v; hu y hv son semilongitudes
 *
 * Requiere THREE (global). Expone window.CharacterLib.
 */
(function (global) {
  "use strict";

  const WALK_SPEED = 6.5;
  const RUN_SPEED = 12.0;

  // Palabras clave para reconocer las animaciones del GLB (en inglés o español, sin distinguir mayúsculas)
  const CLIP_KEYWORDS = {
    idle: ['idle', 'stand', 'wait', 'guardia', 'reposo'],
    walk: ['walk', 'andar', 'caminar', 'marcha', 'move'],
    run: ['run', 'sprint', 'correr', 'carrera', 'fast'],
    attack: ['combo', 'ataque', 'attack', 'punch'],
    sismo: ['slam', 'sismo', 'sísmico'],
    // Técnicas de arma y de arco (nombres del cuerpo que exporta el estudio de armaduras)
    tajo: ['spin_slash', 'tajo giratorio'],
    estocada: ['thrust_lunge', 'estocada'],
    ascendente: ['rising_slash', 'tajo ascendente'],
    hendidura: ['overhead_cleave', 'hendidura'],
    contraataque: ['guard_counter', 'contraataque'],
    torbellino: ['whirlwind', 'torbellino'],
    voltereta: ['backflip', 'voltereta'],
    tornillo: ['triple_corkscrew', 'tornillo'],
    disparo: ['archery', 'tiro con arco'],
    suspension: ['aerial_shot', 'suspensión'],
    nova: ['nova', 'explos', 'blast'],
    jump: ['salto', 'acrobat', 'jump'],
    victory: ['victoria', 'victory', 'postura de victoria', 'win']
  };
  // Duración de cada acción de un solo uso (segundos) y tiempo en que bloquea el movimiento
  // (los bloqueos de las habilidades son los mismos que en js/combat.js; las pruebas lo comprueban)
  const ONE_SHOT = {
    attack: { lock: 0.5 },
    sismo: { lock: 1.2 },
    nova: { lock: 1.0 },
    tajo: { lock: 1.0 },
    estocada: { lock: 0.8 },
    ascendente: { lock: 0.9 },
    hendidura: { lock: 1.0 },
    contraataque: { lock: 1.2 },
    torbellino: { lock: 1.6 },
    voltereta: { lock: 1.2 },
    tornillo: { lock: 1.8 },
    disparo: { lock: 0.8 },
    suspension: { lock: 2.0 },
    jump: { lock: 0.0 },
    victory: { lock: 0.0 }
  };
  // Gestos del avatar de respaldo (sin GLB): vueltas sobre sí mismo, salto y tiro con arco
  const GESTO = {
    tajo: { vueltas: 1 }, torbellino: { vueltas: 2 }, tornillo: { vueltas: 3, salto: 1.2 },
    voltereta: { salto: 1.2 }, suspension: { salto: 1.4, arco: true }, disparo: { arco: true }
  };

  // Índice de la primera animación cuyo nombre contiene alguna palabra clave; -1 si no hay
  function findClipIndex(names, keywords) {
    return names.findIndex(n => keywords.some(k => n.toLowerCase().includes(k)));
  }

  function getColliders(world, x, z) {
    return typeof world.getColliders === 'function' ? world.getColliders(x, z) : (world.colliders || []);
  }

  // Empuja el punto (rx, rz) fuera de un rectángulo girado
  function pushOutOfOBB(c, rx, rz, r) {
    const dx = rx - c.cx, dz = rz - c.cz;
    const u = dx * c.ux + dz * c.uz;
    const v = -dx * c.uz + dz * c.ux;
    const cu = Math.max(-c.hu, Math.min(u, c.hu));
    const cv = Math.max(-c.hv, Math.min(v, c.hv));
    const du = u - cu, dv = v - cv;
    const d2 = du * du + dv * dv;
    if (d2 >= r * r) return null;
    if (d2 < 0.0001) return null; // dentro: lo gestiona el llamador
    const d = Math.sqrt(d2);
    const ov = (r - d) / d;
    const pu = du * ov, pv = dv * ov;
    return { x: rx + pu * c.ux - pv * c.uz, z: rz + pu * c.uz + pv * c.ux };
  }

  class CharacterController {
    /**
     * opts: {
     *   scene, camera, controls, world,
     *   joystick: { zone, knob }   (opcional, joystick táctil),
     *   status: HTMLElement        (opcional, texto de estado del GLB),
     *   glbUrl: './personaje.glb'  (opcional)
     * }
     */
    constructor(opts) {
      this.scene = opts.scene;
      this.camera = opts.camera;
      this.controls = opts.controls;
      this.world = opts.world;
      this.status = opts.status || null;

      this.root = new THREE.Group();
      this.root.position.set(0, 0.5, 10);
      this.scene.add(this.root);

      this.model = null;
      this.mixer = null;
      this.actions = { idle: null, walk: null, run: null };
      this.currentAction = null;
      this.activeState = 'idle';
      this.isFallbackAvatar = false;
      this.fallbackLimbs = {};

      this.radius = 0.5;
      this.walkSpeed = WALK_SPEED;
      this.runSpeed = RUN_SPEED;
      this.keys = { forward: false, backward: false, left: false, right: false, shift: false };
      this.joyVec = { x: 0, y: 0 };
      this.cameraMode = 'free';
      this.oneShots = {};
      this.oneShotUntil = 0;     // tiempo (segundos de reloj) en que termina la acción de un solo uso
      this.lockUntil = 0;        // mientras dure, el personaje no se mueve
      this.alCargarModelo = null; // función(modelo) que se llama al cargar un GLB (p. ej. para retocar sus materiales)
      this.destino = null;       // { x, z, parar }: camina solo hasta ese punto (p. ej. hacia un monstruo)
      this.cancelado = false;    // true cuando el jugador mueve al personaje y se cancela el destino
      this.tiempo = 0;           // reloj propio del personaje (segundos acumulados)
      this.fallbackAct = null;   // { kind, start, duration } para el avatar de respaldo

      this.initInput();
      if (opts.joystick && opts.joystick.zone && opts.joystick.knob) {
        this.initTouchJoystick(opts.joystick.zone, opts.joystick.knob);
      }
      this.buildFallbackAvatar();
      this.loadGLB(opts.glbUrl || './personaje.glb');
    }

    setStatus(text, color) {
      if (!this.status) return;
      this.status.style.color = color;
      this.status.textContent = text;
    }

    initInput() {
      window.addEventListener('keydown', (e) => this.onKey(e.code, true));
      window.addEventListener('keyup', (e) => this.onKey(e.code, false));
    }

    onKey(code, pressed) {
      if (code === 'KeyW' || code === 'ArrowUp') this.keys.forward = pressed;
      if (code === 'KeyS' || code === 'ArrowDown') this.keys.backward = pressed;
      if (code === 'KeyA' || code === 'ArrowLeft') this.keys.left = pressed;
      if (code === 'KeyD' || code === 'ArrowRight') this.keys.right = pressed;
      if (code === 'ShiftLeft' || code === 'ShiftRight') this.keys.shift = pressed;
    }

    initTouchJoystick(zone, knob) {
      let active = false;
      const maxR = 36;

      const handleMove = (clientX, clientY) => {
        const rect = zone.getBoundingClientRect();
        const cx = rect.left + rect.width * 0.5;
        const cy = rect.top + rect.height * 0.5;
        let dx = clientX - cx;
        let dy = clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist > maxR) {
          dx = (dx / dist) * maxR;
          dy = (dy / dist) * maxR;
        }
        knob.style.transform = `translate(${dx}px, ${dy}px)`;
        this.joyVec.x = dx / maxR;
        this.joyVec.y = dy / maxR;
      };

      const resetJoy = () => {
        active = false;
        knob.style.transform = 'translate(0px, 0px)';
        this.joyVec.x = 0;
        this.joyVec.y = 0;
      };

      zone.addEventListener('pointerdown', (e) => {
        active = true;
        zone.setPointerCapture(e.pointerId);
        handleMove(e.clientX, e.clientY);
      });
      zone.addEventListener('pointermove', (e) => {
        if (active) handleMove(e.clientX, e.clientY);
      });
      zone.addEventListener('pointerup', resetJoy);
      zone.addEventListener('pointercancel', resetJoy);
    }

    clearCurrentModel() {
      if (this.model) {
        this.root.remove(this.model);
        this.model.traverse(child => {
          if (child.isMesh && child.geometry) child.geometry.dispose();
        });
        this.model = null;
      }
      if (this.mixer) {
        this.mixer.stopAllAction();
        this.mixer = null;
      }
      this.actions = { idle: null, walk: null, run: null };
      this.currentAction = null;
    }

    buildFallbackAvatar() {
      this.clearCurrentModel();
      this.isFallbackAvatar = true;

      const group = new THREE.Group();
      const matArmor = new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.35, metalness: 0.6 });
      const matSkin = new THREE.MeshStandardMaterial({ color: '#fcd34d', roughness: 0.6 });
      const matDark = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.8 });

      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.72, 0.32), matArmor);
      torso.position.y = 1.1; torso.castShadow = true;
      group.add(torso);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), matSkin);
      head.position.y = 1.72; head.castShadow = true;
      group.add(head);

      const legGeo = new THREE.BoxGeometry(0.22, 0.7, 0.24);
      legGeo.translate(0, -0.35, 0);
      const leftLeg = new THREE.Mesh(legGeo, matDark);
      leftLeg.position.set(-0.15, 0.72, 0); leftLeg.castShadow = true;
      const rightLeg = new THREE.Mesh(legGeo, matDark);
      rightLeg.position.set(0.15, 0.72, 0); rightLeg.castShadow = true;

      const armGeo = new THREE.BoxGeometry(0.18, 0.62, 0.2);
      armGeo.translate(0, -0.28, 0);
      const leftArm = new THREE.Mesh(armGeo, matArmor);
      leftArm.position.set(-0.38, 1.4, 0); leftArm.castShadow = true;
      const rightArm = new THREE.Mesh(armGeo, matArmor);
      rightArm.position.set(0.38, 1.4, 0); rightArm.castShadow = true;

      group.add(leftLeg, rightLeg, leftArm, rightArm);
      this.fallbackLimbs = { leftLeg, rightLeg, leftArm, rightArm };
      this.model = group;
      this.root.add(group);
    }

    loadGLB(url, labelName = url) {
      this.setStatus(`Cargando ${labelName}...`, '#38bdf8');

      const loader = new THREE.GLTFLoader();
      loader.load(
        url,
        (gltf) => {
          this.clearCurrentModel();
          this.isFallbackAvatar = false;
          this.model = gltf.scene;

          const box = new THREE.Box3().setFromObject(this.model);
          const size = new THREE.Vector3();
          box.getSize(size);
          if (size.y > 0.01) {
            this.model.scale.setScalar(1.85 / size.y);
          }
          const scaledBox = new THREE.Box3().setFromObject(this.model);
          this.model.position.y = -scaledBox.min.y;

          this.model.traverse(child => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          this.root.add(this.model);
          if (this.alCargarModelo) this.alCargarModelo(this.model);

          const clips = gltf.animations || [];
          if (clips.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.model);
            const names = clips.map(c => c.name);
            const pick = (kind, fallbackIdx) => {
              const i = findClipIndex(names, CLIP_KEYWORDS[kind]);
              return clips[i >= 0 ? i : fallbackIdx];
            };
            this.actions.idle = this.mixer.clipAction(pick('idle', 0));
            this.actions.walk = this.mixer.clipAction(pick('walk', Math.min(1, clips.length - 1)));
            this.actions.run = this.mixer.clipAction(pick('run', Math.min(2, clips.length - 1)));
            // Acciones de un solo uso: si el GLB no las trae, se usa la animación de respaldo
            this.oneShots = {};
            Object.keys(ONE_SHOT).forEach(kind => {
              const i = findClipIndex(names, CLIP_KEYWORDS[kind]);
              if (i >= 0) {
                const action = this.mixer.clipAction(clips[i]);
                action.setLoop(THREE.LoopOnce, 1);
                action.clampWhenFinished = true;
                this.oneShots[kind] = { action, duration: clips[i].duration };
              }
            });

            this.currentAction = this.actions.idle;
            this.currentAction.play();
            this.setStatus(`GLB activo (${clips.length} clips cargados)`, '#4ade80');
          } else {
            this.setStatus('GLB cargado (sin animaciones internas).', '#facc15');
          }
        },
        undefined,
        () => {
          if (!this.model) this.buildFallbackAvatar();
          this.setStatus('Avatar integrado activo. Usa "Archivo .GLB" para elegir tu personaje.glb.', '#fb923c');
        }
      );
    }

    // Gestos de respaldo para el avatar sin animaciones
    applyFallbackAct(elapsedTime) {
      const f = this.fallbackAct, L = this.fallbackLimbs;
      const t = Math.min(1, (elapsedTime - f.start) / f.duration);
      const swing = Math.sin(t * Math.PI);
      L.leftLeg.rotation.x = 0; L.rightLeg.rotation.x = 0;
      L.leftArm.rotation.x = 0; L.rightArm.rotation.x = 0;
      this.model.rotation.y = 0; this.model.position.y = 0;
      if (f.kind === 'attack') L.rightArm.rotation.x = -2.2 * swing;
      if (f.kind === 'sismo') {   // salta con los brazos arriba y cae golpeando el suelo
        const subida = t < 0.45 ? t / 0.45 : 1;
        this.model.position.y = t < 0.45 ? 0.9 * Math.sin(subida * Math.PI * 0.85) : 0;
        L.leftArm.rotation.x = L.rightArm.rotation.x = t < 0.45 ? -2.6 * subida : -2.6 + 3.2 * Math.min(1, (t - 0.45) / 0.15);
      }
      if (f.kind === 'nova') { const s = 1 + 0.25 * swing; this.model.scale.set(s, s, s); } else if (this.model.scale.x !== 1) this.model.scale.set(1, 1, 1);
      if (f.kind === 'jump') this.model.position.y = 1.2 * swing;
      const gesto = GESTO[f.kind];
      if (gesto || (ONE_SHOT[f.kind] && !['attack', 'sismo', 'nova', 'jump', 'victory'].includes(f.kind))) {
        const g = gesto || {};
        if (g.vueltas) this.model.rotation.y = t * Math.PI * 2 * g.vueltas;
        if (g.salto) this.model.position.y = g.salto * swing;
        if (g.arco) { L.leftArm.rotation.x = -1.5; L.rightArm.rotation.x = -1.5 * (1 - swing); }
        else L.rightArm.rotation.x = -2.2 * swing;
      }
      if (f.kind === 'victory') { L.leftArm.rotation.x = -2.6; L.rightArm.rotation.x = -2.6; }
    }

    switchAnimation(nextState) {
      if (this.activeState === nextState) return;
      this.activeState = nextState;
      if (!this.mixer) return;
      const nextAction = this.actions[nextState];
      if (nextAction && nextAction !== this.currentAction) {
        nextAction.reset().fadeIn(0.2).play();
        if (this.currentAction) this.currentAction.fadeOut(0.2);
        this.currentAction = nextAction;
      }
    }

    // Camina hacia this.destino hasta quedar a `parar` metros. Lo esquiva todo como el movimiento manual.
    caminarADestino(dt, enAccion) {
      const d = this.destino;
      const dx = d.x - this.root.position.x, dz = d.z - this.root.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist <= d.parar) {
        if (!enAccion) this.switchAnimation('idle');
        return;
      }
      const ux = dx / dist, uz = dz / dist;
      const paso = Math.min(dist - d.parar, this.runSpeed * dt);   // hacia un objetivo se corre
      const antes = this.root.position.clone();
      const resolved = this.resolveCollisions(this.root.position.x + ux * paso, this.root.position.z + uz * paso);
      this.root.position.x = resolved.x;
      this.root.position.z = resolved.z;
      // Sin avanzar durante 2 s (un muro en medio): se rinde el destino
      if (antes.distanceTo(this.root.position) < 0.02) this.sinAvance = (this.sinAvance || 0) + dt;
      else this.sinAvance = 0;
      if (this.sinAvance > 2) { this.destino = null; this.sinAvance = 0; this.atascado = true; }
      this.root.position.y = this.world.getWalkableHeight(resolved.x, resolved.z);
      const objetivoGiro = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(ux, uz));
      this.root.quaternion.slerp(objetivoGiro, Math.min(1, dt * 12));
      if (!enAccion) this.switchAnimation('run');
    }

    resolveCollisions(nextX, nextZ) {
      let rx = nextX, rz = nextZ;
      const r = this.radius;

      // Agua: si el paso lleva al agua, se desliza por el borde (primero en X, luego en Z)
      if (this.world.isWaterHazard) {
        const water = (x, z) => this.world.isWaterHazard(x, z, r);
        const ox = this.root.position.x, oz = this.root.position.z;
        if (water(rx, rz)) {
          if (!water(rx, oz)) rz = oz;
          else if (!water(ox, rz)) rx = ox;
          else { rx = ox; rz = oz; }
        }
      }

      const cols = getColliders(this.world, rx, rz);
      for (let i = 0; i < cols.length; i++) {
        const c = cols[i];
        if (c.type === 'circle') {
          const dx = rx - c.x, dz = rz - c.z;
          const minDist = r + c.r;
          const distSq = dx * dx + dz * dz;
          if (distSq < minDist * minDist && distSq > 0.0001) {
            const dist = Math.sqrt(distSq);
            const push = (minDist - dist) / dist;
            rx += dx * push;
            rz += dz * push;
          }
        } else if (c.type === 'box') {
          const closestX = Math.max(c.minX, Math.min(rx, c.maxX));
          const closestZ = Math.max(c.minZ, Math.min(rz, c.maxZ));
          const dx = rx - closestX, dz = rz - closestZ;
          const distSq = dx * dx + dz * dz;
          if (distSq < r * r) {
            const dist = Math.sqrt(distSq);
            if (dist > 0.0001) {
              const overlap = r - dist;
              rx += (dx / dist) * overlap;
              rz += (dz / dist) * overlap;
            } else {
              rx = this.root.position.x;
              rz = this.root.position.z;
            }
          }
        } else if (c.type === 'obb') {
          const p = pushOutOfOBB(c, rx, rz, r);
          if (p) { rx = p.x; rz = p.z; }
        }
      }
      return { x: rx, z: rz };
    }

    // Coloca al personaje en (x, z) y, si la cámara sigue al personaje, la desplaza con él
    // Devuelve false si el punto no es caminable (agua)
    teleport(x, z) {
      if (this.world.isWaterHazard && this.world.isWaterHazard(x, z, this.radius)) return false;
      const dx = x - this.root.position.x, dz = z - this.root.position.z;
      this.root.position.x = x;
      this.root.position.z = z;
      if (this.cameraMode === 'follow') {
        this.camera.position.x += dx;
        this.camera.position.z += dz;
        this.controls.target.x += dx;
        this.controls.target.z += dz;
      }
      this.root.position.y = this.world.getWalkableHeight(x, z);
      return true;
    }

    // Reproduce una acción de un solo uso (ataque, impacto sísmico, nova, salto, victoria).
    // Si el GLB no la trae, el avatar de respaldo hace un gesto sencillo.
    // El tiempo lo lleva el propio personaje (suma de dt): no depende del reloj que pase quien llama
    playOneShot(kind) {
      const info = ONE_SHOT[kind];
      if (!info) return 0;
      const shot = this.oneShots[kind];
      const duration = shot ? shot.duration : (kind === 'victory' ? 3 : 0.6);
      if (info.lock > 0) this.lockUntil = this.tiempo + info.lock;
      this.oneShotUntil = this.tiempo + duration;
      if (shot && this.mixer) {
        shot.action.reset().fadeIn(0.1).play();
        if (this.currentAction && this.currentAction !== shot.action) this.currentAction.fadeOut(0.1);
        this.currentAction = shot.action;
        this.activeState = 'oneshot';
      } else {
        this.fallbackAct = { kind, start: this.tiempo, duration };
      }
      return duration;
    }

    update(dt) {
      this.tiempo += dt;
      // Al terminar una acción de un solo uso se vuelve a idle, andar o correr
      if (this.activeState === 'oneshot' && this.tiempo >= this.oneShotUntil) this.activeState = 'none';
      if (this.fallbackAct && this.tiempo - this.fallbackAct.start >= this.fallbackAct.duration) this.fallbackAct = null;
      const locked = this.tiempo < this.lockUntil;
      // Mientras dura una acción de un solo uso (combo, impacto sísmico, nova) no se cambia la animación
      const enAccion = this.activeState === 'oneshot' && this.tiempo < this.oneShotUntil;

      const kbX = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0);
      const kbZ = (this.keys.backward ? 1 : 0) - (this.keys.forward ? 1 : 0);

      const moveX = kbX !== 0 ? kbX : this.joyVec.x;
      const moveZ = kbZ !== 0 ? kbZ : this.joyVec.y;
      const mag = Math.hypot(moveX, moveZ);
      // El jugador toma el control: se cancela el destino automático
      if (mag > 0.08 && this.destino) { this.destino = null; this.cancelado = true; }

      if (mag > 0.08 && !locked) {
        const isRunning = this.keys.shift || mag > 0.85;
        if (!enAccion) this.switchAnimation(isRunning ? 'run' : 'walk');
        const speed = (isRunning ? this.runSpeed : this.walkSpeed) * Math.min(1.0, mag);

        const camForward = new THREE.Vector3();
        this.camera.getWorldDirection(camForward);
        camForward.y = 0;
        camForward.normalize();

        const camRight = new THREE.Vector3().crossVectors(camForward, new THREE.Vector3(0, 1, 0)).normalize();
        const moveDir = new THREE.Vector3()
          .addScaledVector(camForward, -moveZ)
          .addScaledVector(camRight, moveX)
          .normalize();

        const targetAngle = Math.atan2(moveDir.x, moveDir.z);
        const targetQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetAngle);
        this.root.quaternion.slerp(targetQuat, Math.min(1, dt * 12));

        const candidateX = this.root.position.x + moveDir.x * speed * dt;
        const candidateZ = this.root.position.z + moveDir.z * speed * dt;
        const resolved = this.resolveCollisions(candidateX, candidateZ);

        const deltaX = resolved.x - this.root.position.x;
        const deltaZ = resolved.z - this.root.position.z;
        this.root.position.x = resolved.x;
        this.root.position.z = resolved.z;

        const groundY = this.world.getWalkableHeight(resolved.x, resolved.z);
        const deltaY = groundY - this.root.position.y;
        this.root.position.y = groundY;

        if (this.cameraMode === 'follow') {
          this.camera.position.x += deltaX;
          this.camera.position.y += deltaY;
          this.camera.position.z += deltaZ;
        }
      } else if (this.destino && !locked) {
        this.caminarADestino(dt, enAccion);
      } else {
        if (!enAccion && (!this.fallbackAct || this.fallbackAct.kind !== 'sismo')) this.switchAnimation('idle');
        this.root.position.y = this.world.getWalkableHeight(this.root.position.x, this.root.position.z);
      }

      if (this.cameraMode === 'follow') {
        this.controls.target.set(this.root.position.x, this.root.position.y + 1.4, this.root.position.z);
      }

      if (this.mixer) {
        this.mixer.update(dt);
      } else if (this.isFallbackAvatar && this.fallbackLimbs.leftLeg) {
        if (this.fallbackAct) {
          this.applyFallbackAct(this.tiempo);
          return;
        }
        const freq = this.activeState === 'run' ? 14 : (this.activeState === 'walk' ? 8 : 0);
        const amp = this.activeState === 'run' ? 0.65 : (this.activeState === 'walk' ? 0.4 : 0);
        const angle = freq > 0 ? Math.sin(this.tiempo * freq) * amp : 0;
        this.fallbackLimbs.leftLeg.rotation.x = angle;
        this.fallbackLimbs.rightLeg.rotation.x = -angle;
        this.fallbackLimbs.leftArm.rotation.x = -angle * 0.8;
        this.fallbackLimbs.rightArm.rotation.x = angle * 0.8;
      }
    }
  }

  /*
   * Evita que la cámara atraviese el suelo o un muro cuando orbita o sigue al personaje.
   * Se llama después de controls.update().
   */
  function clampCameraToWorld(camera, target, world) {
    const cam = camera.position;
    const steps = 24;
    let last = null;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = target.x + (cam.x - target.x) * t;
      const y = target.y + (cam.y - target.y) * t;
      const z = target.z + (cam.z - target.z) * t;
      if (y < world.getWalkableHeight(x, z) + 0.8) {
        if (last) cam.copy(last); else cam.set(target.x, target.y + 0.8, target.z);
        return;
      }
      last = { x, y, z };
    }

    // Colisionadores: si la cámara queda dentro de un muro o una casa, se acerca al objetivo
    const inside = (x, z) => getColliders(world, x, z).some(c => {
      if (c.type === 'circle') return Math.hypot(x - c.x, z - c.z) < c.r + 0.4;
      if (c.type === 'box') return x > c.minX - 0.4 && x < c.maxX + 0.4 && z > c.minZ - 0.4 && z < c.maxZ + 0.4;
      const dx = x - c.cx, dz = z - c.cz;
      return Math.abs(dx * c.ux + dz * c.uz) < c.hu + 0.4 && Math.abs(-dx * c.uz + dz * c.ux) < c.hv + 0.4;
    });
    if (inside(cam.x, cam.z)) {
      const dir = new THREE.Vector3().subVectors(target, cam);
      const len = dir.length();
      dir.normalize();
      for (let d = 1; d <= Math.min(len, 60); d += 0.5) {
        const p = cam.clone().addScaledVector(dir, d);
        if (!inside(p.x, p.z)) { cam.copy(p); return; }
      }
    }
  }

  const api = { CharacterController, clampCameraToWorld, findClipIndex, CLIP_KEYWORDS, ONE_SHOT, WALK_SPEED, RUN_SPEED };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.CharacterLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
