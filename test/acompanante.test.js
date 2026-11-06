// Pruebas del sistema de acompañante aldeano. Ejecutar: node test/acompanante.test.js
const assert = require('assert');
const A = require('../js/acompanante.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

t('creación de acompañante: aldeano Rowan con equipamiento de cuero y botas', () => {
  const c = A.crearAcompanante();
  assert.strictEqual(c.nombre, 'Rowan');
  assert.strictEqual(c.rol, 'Aldeano Explorador');
  assert.ok(c.equipo.underlayer.includes('Cuero'));
  assert.ok(c.equipo.belt.includes('Cinturón'));
  assert.ok(c.equipo.boots.includes('Botas'));
  assert.strictEqual(c.equipo.helmet, null); // Cabeza descubierta
  assert.ok(c.hp > 0);
  assert.ok(c.dano > 0);
});

t('frases contextuales: ofrece diálogos para fuentes, cabañas, altares, santuarios y combate', () => {
  const fFuente = A.elegirFrase('secreto_fuente');
  const fCabana = A.elegirFrase('secreto_cabana');
  const fAltar = A.elegirFrase('secreto_altar');
  const fCombate = A.elegirFrase('combate_inicio');

  assert.ok(typeof fFuente === 'string' && fFuente.length > 5);
  assert.ok(typeof fCabana === 'string' && fCabana.length > 5);
  assert.ok(typeof fAltar === 'string' && fAltar.length > 5);
  assert.ok(typeof fCombate === 'string' && fCombate.length > 5);
});

t('formación y seguimiento: sigue al héroe sin estorbar', () => {
  const c = A.crearAcompanante({ activo: true, x: 0, z: 0 });
  const fakeMesh = {
    position: { set(x, y, z) { this.x = x; this.y = y; this.z = z; } },
    rotation: { y: 0 }
  };
  c.mesh = fakeMesh;

  const heroePos = { x: 10, y: 0, z: 10 };
  const heroeRot = 0;

  // Actualizar varios pasos de tiempo
  for (let step = 0; step < 10; step++) {
    A.actualizarAcompanante(c, 0.2, heroePos, heroeRot, [], null, () => 0, null);
  }

  // Comprobar que se ha desplazado hacia el héroe
  const dFinal = Math.hypot(heroePos.x - c.x, heroePos.z - c.z);
  assert.ok(dFinal < 4.0, `La distancia al héroe (${dFinal}) debería estar en formación cercana`);
  assert.ok(c.x > 5 && c.z > 5, 'El acompañante avanzó coordinadamente');
});

t('combate activo: ataca al monstruo hostil cercano infligiendo daño', () => {
  const c = A.crearAcompanante({ activo: true, x: 10, z: 10 });
  const fakeMesh = {
    position: { set() {} },
    rotation: { y: 0 }
  };
  c.mesh = fakeMesh;

  const monstruo = {
    x: 11,
    z: 11,
    hp: 50,
    maxHp: 50,
    muerto: false,
    zoneId: 'z1'
  };

  const heroePos = { x: 10, y: 0, z: 9 };
  let eventoRegistrado = null;

  A.actualizarAcompanante(c, 0.1, heroePos, 0, [monstruo], monstruo, () => 0, ev => {
    eventoRegistrado = ev;
  });

  assert.ok(monstruo.hp < 50, 'El acompañante infligió daño a la bestia');
  assert.strictEqual(c.estado, 'attack');
});

t('detección de lugares secretos: comenta y marca el secreto al entrar en su radio', () => {
  const c = A.crearAcompanante({ activo: true });
  const secretos = [
    { id: 'sec-1', tipo: 'fuente', nombre: 'Fuente Arcana de las Nieves', x: 100, z: 100, radio: 16, descubierto: false }
  ];

  let descubierto = null;
  // Fuera de radio
  A.comprobarLugaresSecretos(c, secretos, { x: 50, z: 50 }, s => { descubierto = s; });
  assert.strictEqual(descubierto, null);

  // Dentro del radio
  A.comprobarLugaresSecretos(c, secretos, { x: 105, z: 102 }, s => { descubierto = s; });
  assert.notStrictEqual(descubierto, null);
  assert.strictEqual(descubierto.id, 'sec-1');
  assert.strictEqual(secretos[0].descubierto, true);
  assert.ok(c.fraseActual.length > 0);
});

t('modelo GLB del estudio de armaduras: instalación y control de AnimationMixer', () => {
  const c = A.crearAcompanante({ activo: true, x: 5, z: 5 });

  // Mock de Three.js y objeto GLTF
  const fakeThree = {
    Group: function() {
      this.children = [];
      this.position = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; }, copy(p) { Object.assign(this, p); } };
      this.rotation = { y: 0, copy(r) { Object.assign(this, r); } };
      this.add = function(c) { this.children.push(c); };
      this.remove = function(c) {
        const i = this.children.indexOf(c);
        if (i !== -1) this.children.splice(i, 1);
      };
    },
    Box3: function() {
      this.min = { x: -0.5, y: 0, z: -0.5 };
      this.max = { x: 0.5, y: 1.8, z: 0.5 };
      this.setFromObject = function() { return this; };
      this.getSize = function(target) { target.set(1, 1.8, 1); return target; };
    },
    Vector3: function(x = 0, y = 0, z = 0) {
      this.x = x; this.y = y; this.z = z;
      this.set = function(nx, ny, nz) { this.x = nx; this.y = ny; this.z = nz; return this; };
    },
    RingGeometry: function() {
      this.rotateX = function() {};
    },
    MeshBasicMaterial: function() {},
    Mesh: function(geo, mat) {
      this.position = { y: 0 };
    },
    AnimationMixer: function(root) {
      this.updateCalls = 0;
      this.update = function(dt) { this.updateCalls += dt; };
      this.clipAction = function(clip) {
        return {
          clip,
          running: false,
          reset() {},
          enabled: true,
          setLoop() {},
          crossFadeFrom() {},
          play() { this.running = true; },
          isRunning() { return this.running; }
        };
      };
    }
  };

  const fakeGLTF = {
    scene: {
      scale: { setScalar(s) { this.s = s; } },
      position: { y: 0 },
      traverse(fn) { fn({ isMesh: true, material: {} }); }
    },
    animations: [
      { name: 'idle', duration: 2.0 },
      { name: 'walk', duration: 1.0 },
      { name: 'run', duration: 0.8 },
      { name: 'overhead_cleave', duration: 0.9 }
    ]
  };

  A.instalarModeloGLBAcompanante(c, fakeGLTF, fakeThree);
  assert.ok(c.mixer, 'El mixer de animación debe estar configurado');
  assert.ok(c.actions.idle, 'La acción idle debe estar registrada');
  assert.strictEqual(c.nombreAnimActual, 'idle');

  // Actualizar en modo ataque con un monstruo en rango
  const monstruo = { x: 5.5, z: 5.5, hp: 40, muerto: false };
  A.actualizarAcompanante(c, 0.1, { x: 5, y: 0, z: 5 }, 0, [monstruo], monstruo, () => 0, null);
  assert.strictEqual(c.nombreAnimActual, 'overhead_cleave');
  assert.ok(c.mixer.updateCalls > 0, 'El mixer debe haberse actualizado con dt');
});

t('combate: daño vía aplicarDanoMonstruoFn y remate que marca alive=false y muerto=true', () => {
  const c = A.crearAcompanante({ activo: true, x: 0, z: 0, dano: 25 });
  c.mesh = { position: { set() {} }, rotation: { y: 0 } };

  const m = {
    x: 0.5,
    z: 0.5,
    hp: 15, // Poca vida para que el golpe lo remate
    maxHp: 50,
    alive: true,
    muerto: false,
    zoneId: 'zona-bosque'
  };

  let danoRecibido = 0;
  let eventoRegistrado = null;
  const aplicarDanoFn = (mon, dmg) => {
    danoRecibido = dmg;
    mon.hp = Math.max(0, mon.hp - dmg);
    if (mon.hp <= 0) {
      mon.alive = false;
      mon.muerto = true;
    }
  };

  A.actualizarAcompanante(c, 0.1, { x: 0, y: 0, z: 0 }, 0, [m], m, () => 0, ev => { eventoRegistrado = ev; }, aplicarDanoFn);

  assert.ok(danoRecibido > 0, 'aplicarDanoFn debe haber sido llamado');
  assert.strictEqual(m.hp, 0, 'La vida del monstruo debe haber llegado a 0');
  assert.strictEqual(m.alive, false, 'El monstruo debe quedar muerto (alive=false)');
  assert.strictEqual(m.muerto, true, 'El monstruo debe quedar muerto (muerto=true)');
  assert.strictEqual(A.esMonstruoCombatible(m), false, 'El monstruo muerto ya no debe ser combatible');
});

t('combate: daño vía m.recibirDano y remate sin estancar la vida', () => {
  const c = A.crearAcompanante({ activo: true, x: 0, z: 0, dano: 30 });
  c.mesh = { position: { set() {} }, rotation: { y: 0 } };

  let golpesRecibidos = 0;
  const m = {
    x: 1.0,
    z: 1.0,
    hp: 20,
    maxHp: 60,
    alive: true,
    muerto: false,
    recibirDano: function(dmg) {
      golpesRecibidos++;
      this.hp = Math.max(0, this.hp - dmg);
      if (this.hp <= 0) {
        this.alive = false;
        this.muerto = true;
      }
    }
  };

  A.actualizarAcompanante(c, 0.1, { x: 0, y: 0, z: 0 }, 0, [m], m, () => 0, null);

  assert.ok(golpesRecibidos > 0, 'm.recibirDano debió ser invocado');
  assert.strictEqual(m.hp, 0, 'La vida del monstruo debe quedar en 0');
  assert.strictEqual(m.alive, false, 'El monstruo no debe quedar en un estado inmortal');
});

t('inventario del acompañante: capacidad máxima de 20 slots y almacenamiento de pociones', () => {
  const c = A.crearAcompanante();
  assert.strictEqual(c.inventario.length, 0);
  assert.strictEqual(A.MAX_SLOTS_INVENTARIO, 20);

  // Añadir pociones hasta llenar los 20 slots
  const dadas = A.darPocionesVidaAcompanante(c, 25);
  assert.strictEqual(dadas, 20, 'No debe permitir agregar más de 20 objetos');
  assert.strictEqual(c.inventario.length, 20);
  assert.strictEqual(c.pocionesVida, 20);

  // Intentar agregar uno más debe lanzar error
  assert.throws(() => A.agregarObjetoAcompanante(c, { uid: 'extra', tipo: 'botin' }), /lleno/);

  // Remover un objeto
  const obj = A.removerObjetoAcompanante(c, c.inventario[0].uid);
  assert.ok(obj && obj.tipo === 'pocion_vida');
  assert.strictEqual(c.inventario.length, 19);
  assert.strictEqual(c.pocionesVida, 19);
});

t('auto-toma de pociones: consume poción automáticamente al bajar de 50% HP', () => {
  const c = A.crearAcompanante({ hp: 180, maxHp: 180, activo: true });
  c.mesh = { position: { set() {} }, rotation: { y: 0 } };
  A.darPocionesVidaAcompanante(c, 3);
  assert.strictEqual(c.pocionesVida, 3);

  // Daño severo que baja la vida a menos de 50% (ej. 70 / 180)
  c.hp = 70;
  assert.ok(c.hp < c.maxHp * 0.50);

  // En la actualización debe consumirse automáticamente una poción
  A.actualizarAcompanante(c, 0.1, { x: 0, y: 0, z: 0 }, 0, [], null, () => 0, null);

  assert.ok(c.hp > 70, 'La salud debió incrementarse tras tomar la poción');
  assert.strictEqual(c.pocionesVida, 2, 'Debió descontarse 1 poción del inventario');
  assert.ok(c.fraseActual.includes('poción de salud'));
});

t('supervivencia: mitigación de daño y estado debilitado al llegar a 0 HP', () => {
  const c = A.crearAcompanante({ hp: 100, maxHp: 180, defensa: 14, activo: true });
  assert.strictEqual(c.inconsciente, false);

  // Recibir daño
  const recibido = A.recibirDanoAcompanante(c, 30);
  assert.ok(recibido > 0 && recibido < 30, 'La defensa debe mitigar parte del daño');
  assert.strictEqual(c.hp, 100 - recibido);

  // Daño letal
  A.recibirDanoAcompanante(c, 500);
  assert.strictEqual(c.hp, 0);
  assert.strictEqual(c.inconsciente, true);
  assert.strictEqual(c.estado, 'debilitado');

  // Revivir
  A.revivirAcompanante(c, 0.50);
  assert.strictEqual(c.inconsciente, false);
  assert.strictEqual(c.hp, 90);
});

t('skills complementarias de apoyo: cura y dopes en combate', () => {
  const c = A.crearAcompanante({ hp: 60, maxHp: 180, activo: true });
  c.mesh = { position: { set() {} }, rotation: { y: 0 } };
  const m = { x: 1, z: 1, hp: 50, maxHp: 50, alive: true, muerto: false };

  let skillLanzada = null;
  const alLanzar = sk => { skillLanzada = sk; };

  // Ejecutar update con héroe y Rowan con vida baja en combate
  A.actualizarAcompanante(c, 0.1, { x: 0, y: 0, z: 0 }, 0, [m], m, () => 0, null, null, { hp: 30, maxHp: 100 }, alLanzar);

  assert.ok(skillLanzada !== null, 'Debe haber disparado una skill de apoyo');
  assert.ok(c.buffs.ataqueTimer > 0 || c.skills.cura.timer > 0, 'Alguna skill debe haber entrado en cooldown');
});

t('equipamiento de piezas en Rowan: aumenta daño, defensa y vida máxima', () => {
  const c = A.crearAcompanante({ dano: 24, defensa: 14, maxHp: 180 });
  const armaSuperior = { ranura: 'weapon', nombre: 'Mandoble del León', ataque: 22 };
  const petoSuperior = { ranura: 'torso', nombre: 'Peto de Placas Solar', defensa: 25 };

  A.equiparPiezaAcompanante(c, armaSuperior);
  assert.strictEqual(c.equipo.weapon, 'Mandoble del León');
  assert.ok(c.dano > 24, 'El daño de ataque debe haber aumentado');

  A.equiparPiezaAcompanante(c, petoSuperior);
  assert.strictEqual(c.equipo.torso, 'Peto de Placas Solar');
  assert.ok(c.defensa > 14, 'La defensa debe haber aumentado');
  assert.ok(c.maxHp > 180, 'La vida máxima debe haber aumentado');
});

t('los 4 compañeros de camino: arquetipos, roles y habilidades diferenciadas', () => {
  assert.ok(A.COMPANEROS.rowan, 'Rowan especialista en dopes de ataque');
  assert.ok(A.COMPANEROS.lyra, 'Lyra especialista en daño masivo rápido con dagas');
  assert.ok(A.COMPANEROS.elian, 'Elian mago de apoyo, curas y contra no-muertos');
  assert.ok(A.COMPANEROS.brenda, 'Brenda tanque y furia berserker');

  const lyra = A.crearAcompanante({ arquetipo: 'lyra' });
  assert.strictEqual(lyra.nombre, 'Lyra de las Sombras');
  assert.ok(lyra.dano > 30, 'Lyra tiene un daño base elevado con dagas');
  assert.strictEqual(lyra.skillsEquipadas.length, 3, 'Equipa 3 habilidades iniciales');

  const elian = A.crearAcompanante({ arquetipo: 'elian' });
  assert.strictEqual(elian.nombre, 'Elian el Teúrgo');
  assert.ok(elian.skillsCatalogo.some(s => s.id === 'purificacion'));

  const brenda = A.crearAcompanante({ arquetipo: 'brenda' });
  assert.strictEqual(brenda.nombre, 'Brenda la Berserker');
  assert.ok(brenda.hp > 200, 'Brenda posee alta resistencia y salud como tanque');
});

t('cambio de arquetipo de compañero: preserva inventario y cambia rol', () => {
  const c = A.crearAcompanante({ arquetipo: 'rowan' });
  A.agregarObjetoAcompanante(c, { uid: 'poc-1', tipo: 'pocion_vida', cantidad: 5 });
  assert.strictEqual(c.inventario.length, 1);

  const cambiado = A.cambiarArquetipo(c, 'brenda');
  assert.strictEqual(cambiado, true);
  assert.strictEqual(c.arquetipo, 'brenda');
  assert.strictEqual(c.nombre, 'Brenda la Berserker');
  assert.strictEqual(c.inventario.length, 1, 'El inventario de 20 ranuras se conserva íntegro');
  assert.strictEqual(c.skillsEquipadas.length, 3);
});

t('progresión de habilidades: subir de nivel con puntos de maestría y equipar 3 dopes', () => {
  const c = A.crearAcompanante({ arquetipo: 'rowan', puntosCompanero: 2 });
  const sk = c.skillsCatalogo.find(s => s.id === 'grito');
  assert.strictEqual(sk.nivel, 1);
  const potInicial = sk.potencia;

  // Subir de nivel
  const subio = A.subirNivelSkill(c, 'grito');
  assert.strictEqual(subio, true);
  assert.strictEqual(sk.nivel, 2);
  assert.ok(sk.potencia > potInicial, 'La potencia del dope de ataque aumentó');
  assert.strictEqual(c.puntosCompanero, 1);

  // Equipar una habilidad en la ranura 1
  A.equiparSkill(c, 1, 'partesuelos');
  assert.strictEqual(c.skillsEquipadas[1], 'partesuelos');
});

t('dopes activos en pantalla: registro y descuento en tiempo real para el HUD', () => {
  const c = A.crearAcompanante({ arquetipo: 'rowan', activo: true });
  c.mesh = { position: { set() {} }, rotation: { y: 0 } };

  // Aplicar dope activo
  A.aplicarDopeActivo(c, {
    id: 'grito',
    nombre: 'Grito de Aliento',
    icono: '⚔️',
    desc: '+25% Ataque',
    duracion: 10
  });

  assert.strictEqual(c.buffsActivos.length, 1);
  assert.strictEqual(c.buffsActivos[0].nombre, 'Grito de Aliento');
  assert.strictEqual(c.buffsActivos[0].timer, 10);

  // Tick de 3 segundos
  A.actualizarAcompanante(c, 3.0, { x: 0, y: 0, z: 0 }, 0, [], null, () => 0, null);
  assert.strictEqual(c.buffsActivos.length, 1);
  assert.strictEqual(Math.round(c.buffsActivos[0].timer), 7, 'El temporizador debe descontar el tiempo transcurrido');

  // Tick que agote el dope
  A.actualizarAcompanante(c, 8.0, { x: 0, y: 0, z: 0 }, 0, [], null, () => 0, null);
  assert.strictEqual(c.buffsActivos.length, 0, 'Al expirar el tiempo, el dope desaparece del HUD');
});

t('balance de habilidades: el tiempo de espera es estrictamente mayor que la duración del efecto (cd > duracion)', () => {
  const arquetipos = ['rowan', 'lyra', 'elian', 'brenda'];

  arquetipos.forEach(arqKey => {
    const c = A.crearAcompanante({ arquetipo: arqKey, puntosCompanero: 20 });
    const skills = c.skillsCatalogo;

    skills.forEach(sk => {
      if (sk.duracion) {
        // 1. Verificación en nivel 1
        assert.ok(
          sk.cd > sk.duracion,
          `[Nivel 1] ${c.nombre} - ${sk.nombre}: Cooldown (${sk.cd}s) debe ser mayor que la duración (${sk.duracion}s)`
        );
        const ratioInicial = sk.cd / sk.duracion;
        assert.ok(
          ratioInicial >= 1.6,
          `[Nivel 1] ${c.nombre} - ${sk.nombre}: Ratio CD/Duración (${ratioInicial.toFixed(2)}) debe ser al menos 1.6x`
        );

        // 2. Verificación en subida continua de nivel (niveles 2 a 5)
        for (let nivelEsperado = 2; nivelEsperado <= (sk.maxNivel || 5); nivelEsperado++) {
          const subio = A.subirNivelSkill(c, sk.id);
          assert.strictEqual(subio, true, `Debe poder subir de nivel la skill ${sk.id}`);
          assert.strictEqual(sk.nivel, nivelEsperado);

          assert.ok(
            sk.cd > sk.duracion,
            `[Nivel ${nivelEsperado}] ${c.nombre} - ${sk.nombre}: Cooldown (${sk.cd}s) debe superar a la duración (${sk.duracion}s)`
          );
          assert.ok(
            sk.cd >= sk.duracion + 6,
            `[Nivel ${nivelEsperado}] ${c.nombre} - ${sk.nombre}: Tiempo de espera neto (${(sk.cd - sk.duracion).toFixed(1)}s) debe ser al menos 6s`
          );
        }
      }
    });
  });
});

t('orientación y consejos de guía: cálculo de rumbo y avisos de monstruos endurecidos', () => {
  const c = A.crearAcompanante({ arquetipo: 'rowan' });
  const heroePos = { x: 0, z: 0 };
  const destNorte = { x: 0, z: -150, nombre: 'Prados Salvajes' };
  const destEste = { x: 200, z: 0, nombre: 'Cabaña del Bosque' };

  const rNorte = A.calcularDireccionYDistancia(heroePos, destNorte);
  assert.strictEqual(rNorte.dir, 'Norte');
  assert.strictEqual(rNorte.dist, 150);

  const rEste = A.calcularDireccionYDistancia(heroePos, destEste);
  assert.strictEqual(rEste.dir, 'Este');
  assert.strictEqual(rEste.dist, 200);

  const consejo = A.darConsejoGuia(c, destNorte, heroePos, { hp: 100, maxHp: 100 });
  assert.ok(consejo.includes('Prados Salvajes'));
  assert.ok(consejo.includes('Norte'));
  assert.ok(consejo.includes('150'));

  // Cuando está cerca del objetivo
  const consejoCerca = A.darConsejoGuia(c, { x: 5, z: 5, nombre: 'Prados' }, heroePos, { hp: 100, maxHp: 100 });
  assert.ok(consejoCerca.includes('¡Ya estamos en Prados!'));

  // Advertencia de salud baja
  const consejoHerido = A.darConsejoGuia(c, destNorte, heroePos, { hp: 25, maxHp: 100 });
  assert.ok(consejoHerido.includes('tu salud está algo baja'));
});

console.log(`\n${n} pruebas del acompañante aldeano superadas.`);
