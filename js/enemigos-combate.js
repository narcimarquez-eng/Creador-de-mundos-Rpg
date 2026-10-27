// Efectos de combate para los enemigos del módulo de enemigos (js/enemigos.js):
//  - golpe cuerpo a cuerpo: el brazo con el arma y el torso se giran con fuerza;
//  - magia: los dos brazos se alzan, el núcleo brilla y sale un proyectil;
//  - reacción al golpe: destello rojo y empujón de cabeza y torso.
// Se superponen a updateEnemyAnimation: el movimiento base no cambia. Cada fotograma se quita el desplazamiento
// anterior antes de llamar a la animación base, para que sus amortiguaciones no se acumulen.
(function (root) {
  'use strict';

  const DURACION = { golpe: 0.5, magia: 0.9, hit: 0.3 };

  // Qué gesto usa cada enemigo al atacar
  function tipoAtaque(config) {
    if (config.raceCategory === 'magical' || config.weapon === 'arcane_staff' || config.weapon === 'dragon_breath_maw') return 'magia';
    return 'golpe';
  }

  function crear(rig, config) {
    const color = new THREE.Color(config.materials.emissiveColor || '#7dd3fc');
    const bola = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 8), new THREE.MeshBasicMaterial({ color }));
    bola.visible = false;
    rig.rootGroup.add(bola);
    const armadura = rig.materials.primaryArmorMat;
    const nucleo = rig.parts.coreMesh && rig.parts.coreMesh.material;
    return {
      rig, bola, accion: null, inicio: 0, offsets: new Map(), destello: false,
      armaduraEmisivo: armadura ? { color: armadura.emissive.clone(), intensidad: armadura.emissiveIntensity } : null,
      nucleoIntensidad: nucleo && nucleo.emissiveIntensity !== undefined ? nucleo.emissiveIntensity : null,
      nucleo,
      origen: new THREE.Vector3(),
    };
  }

  // Empieza un efecto. ahora: segundos, con el mismo reloj que actualizar()
  function disparar(fx, accion, ahora) {
    if (!fx) return;
    fx.accion = accion;
    fx.inicio = ahora;
  }

  function sumar(fx, g, x, y, z) {
    g.rotation.x += x; g.rotation.y += y; g.rotation.z += z;
    let o = fx.offsets.get(g);
    if (!o) { o = { x: 0, y: 0, z: 0 }; fx.offsets.set(g, o); }
    o.x += x; o.y += y; o.z += z;
  }

  function actualizar(fx, estado, t, dt, ahora) {
    if (!fx) return;
    const rig = fx.rig, p = rig.parts;
    // 1) quitar el desplazamiento del fotograma anterior
    fx.offsets.forEach((o, g) => { g.rotation.x -= o.x; g.rotation.y -= o.y; g.rotation.z -= o.z; });
    fx.offsets.clear();
    // 2) movimiento base
    EnemyLib.updateEnemyAnimation(rig, estado, t, dt, 1, 0);

    // 3) efecto activo
    if (fx.accion && ahora - fx.inicio >= DURACION[fx.accion]) fx.accion = null;
    const a = fx.accion;
    const q = a ? (ahora - fx.inicio) / DURACION[a] : 0;

    if (a === 'golpe') {
      const sw = Math.sin(Math.PI * q);
      sumar(fx, p.rightArmGroup, -2.0 * sw, 0, 0);
      sumar(fx, p.torsoGroup, 0, 0.35 * sw, 0);
    }

    const magia = a === 'magia' ? Math.min(1, q / 0.35, (1 - q) / 0.25) : 0;
    if (a === 'magia') {
      sumar(fx, p.rightArmGroup, -1.9 * magia, 0, 0);
      sumar(fx, p.leftArmGroup, -1.9 * magia, 0, 0);
      sumar(fx, p.headGroup, -0.15 * magia, 0, 0);
    }
    if (fx.nucleo && fx.nucleoIntensidad !== null) fx.nucleo.emissiveIntensity = fx.nucleoIntensidad * (1 + 2 * magia);

    // Proyectil: sale de la mano y avanza hacia delante (eje +z del enemigo, que mira al héroe al perseguir)
    if (a === 'magia' && q > 0.35 && q < 0.9) {
      rig.rootGroup.updateMatrixWorld(true);
      fx.origen.setFromMatrixPosition(rig.sockets.weaponR.matrixWorld);
      rig.rootGroup.worldToLocal(fx.origen);
      const avance = (q - 0.35) / 0.55;
      fx.bola.visible = true;
      fx.bola.position.set(fx.origen.x, fx.origen.y, fx.origen.z + avance * 7);
      fx.bola.scale.setScalar(1 + 0.3 * Math.sin(q * 20));
    } else {
      fx.bola.visible = false;
    }

    // Destello y empujón al recibir un golpe
    if (a === 'hit') {
      const f = 1 - q;
      sumar(fx, p.torsoGroup, -0.25 * f, 0, 0);
      sumar(fx, p.headGroup, -0.3 * f, 0, 0);
      if (fx.armaduraEmisivo) {
        const m = rig.materials.primaryArmorMat;
        m.emissive.setHex(0xff2a2a);
        m.emissiveIntensity = 0.9 * f;
        fx.destello = true;
      }
    } else if (fx.destello && fx.armaduraEmisivo) {
      const m = rig.materials.primaryArmorMat;
      m.emissive.copy(fx.armaduraEmisivo.color);
      m.emissiveIntensity = fx.armaduraEmisivo.intensidad;
      fx.destello = false;
    }
  }

  root.EnemyFx = { crear, disparar, actualizar, tipoAtaque };
})(typeof window !== 'undefined' ? window : globalThis);
