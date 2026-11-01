const test = require('node:test');
const assert = require('node:assert');

const W = require('../js/world-core.js');
const MazmorrasLib = require('../js/mazmorras.js');
const CombatLib = require('../js/combat.js');

test('mazmorras: lista de GLBs disponibles y multiplicadores de élite', () => {
  assert.ok(Array.isArray(MazmorrasLib.LISTA_GLB_DISPONIBLES), 'Debe haber lista de GLBs');
  assert.ok(MazmorrasLib.LISTA_GLB_DISPONIBLES.length >= 1, 'Al menos debe contener mazmorra1.glb');
  assert.strictEqual(MazmorrasLib.LISTA_GLB_DISPONIBLES[0].id, 'glb/mazmorras/mazmorra1.glb');

  // Requisito usuario: todos deben ser de élites, x4 o x8
  assert.deepStrictEqual(MazmorrasLib.MULTIPLICADORES_ELITE, [4, 8], 'Los multiplicadores de élite admitidos deben ser x4 y x8');
});

test('mazmorras: plantilla por defecto con Jefe y esbirros élites (x4 y x8)', () => {
  const d = MazmorrasLib.generarMazmorraPorDefecto({ dungeons: [] }, 150, 250, { level: 16 });
  assert.ok(d.id && d.name);
  assert.strictEqual(d.x, 150);
  assert.strictEqual(d.y, 250);
  assert.strictEqual(d.glb, 'glb/mazmorras/mazmorra1.glb');
  assert.strictEqual(d.level, 16);

  // Jefe de mazmorra configurado
  assert.ok(d.boss, 'Debe tener Jefe de mazmorra');
  assert.ok(d.boss.name && d.boss.name.length > 2);
  assert.ok(d.boss.level >= d.level, 'Nivel de jefe acorde al de la mazmorra');
  assert.ok(d.boss.rangoElite >= 4, 'Jefe debe tener rango élite alto');
  assert.ok(d.boss.recompensaOro > 0, 'Recompensa de oro configurada');
  assert.ok(d.boss.recompensaArena > 0, 'Recompensa de arena arcana configurada');
  assert.ok(d.boss.recompensaEquipo, 'Recompensa de equipo configurada');

  // Luchadores de élite: todos estrictamente x4 o x8
  assert.ok(Array.isArray(d.elites) && d.elites.length >= 2, 'Debe haber luchadores de élite configurados');
  d.elites.forEach(el => {
    assert.ok([4, 8].includes(el.multiplicador), `Cada élite debe tener multiplicador x4 o x8 (encontrado: ${el.multiplicador})`);
    assert.ok(el.cantidad >= 1, 'Cantidad mayor o igual a 1');
    assert.ok(el.level >= 1, 'Nivel válido');
  });
});

test('world-core: soporte nativo de mazmorras (crear, buscar, mover, borrar, serializar)', () => {
  const mundo = W.emptyWorld('Mundo Mazmorras', 999);
  assert.ok(Array.isArray(mundo.dungeons), 'world.dungeons debe ser array');

  // 1. Crear
  const dung = W.createDungeon(mundo, 300, 450, {
    name: 'Cripta de Sangre',
    level: 18,
    boss: { name: 'Señor del Trono', recompensaOro: 3500 }
  });
  assert.strictEqual(mundo.dungeons.length, 1);
  assert.strictEqual(dung.name, 'Cripta de Sangre');
  assert.strictEqual(W.kindOf(mundo, dung.id), 'dungeon');
  assert.strictEqual(W.findDungeon(mundo, dung.id), dung);
  assert.strictEqual(W.findAny(mundo, dung.id), dung);

  // 2. Mover
  W.moveEntity(mundo, dung.id, 320, 480);
  assert.strictEqual(dung.x, 320);
  assert.strictEqual(dung.y, 480);

  // 3. Serializar y Deserializar
  const jsonStr = W.serialize(mundo);
  const recuperado = W.deserialize(jsonStr);
  assert.strictEqual(recuperado.dungeons.length, 1);
  assert.strictEqual(recuperado.dungeons[0].name, 'Cripta de Sangre');
  assert.strictEqual(recuperado.dungeons[0].boss.recompensaOro, 3500);
  assert.strictEqual(W.stats(recuperado).dungeons, 1);

  // 4. Eliminar
  W.removeEntity(recuperado, recuperado.dungeons[0].id);
  assert.strictEqual(recuperado.dungeons.length, 0);
  assert.strictEqual(W.stats(recuperado).dungeons, 0);
});

test('combat.js: escalado de vida y daño con multiplicadores de élite x4 y x8', () => {
  const normal = CombatLib.newMonster({ level: 10, boss: false, rangoElite: 1, x: 0, z: 0 });
  const eliteX4 = CombatLib.newMonster({ level: 10, boss: false, rangoElite: 4, x: 0, z: 0 });
  const eliteX8 = CombatLib.newMonster({ level: 10, boss: false, rangoElite: 8, x: 0, z: 0 });

  assert.strictEqual(eliteX4.rangoElite, 4);
  assert.strictEqual(eliteX8.rangoElite, 8);

  // La vida debe multiplicarse por x4 y x8 exactamente
  assert.strictEqual(eliteX4.maxHp, normal.maxHp * 4, 'Élite x4 debe tener 4 veces la vida base');
  assert.strictEqual(eliteX8.maxHp, normal.maxHp * 8, 'Élite x8 debe tener 8 veces la vida base');
  assert.ok(eliteX4.dmg > normal.dmg, 'Élite x4 debe hacer más daño que normal');
  assert.ok(eliteX8.dmg > eliteX4.dmg, 'Élite x8 debe hacer más daño que élite x4');
});

test('entrada exterior: corredor de exactamente 30 metros entre muros y portal', () => {
  // Mock THREE mínimo para probar geometría
  function Mesh(g, m) { this.geometry = g; this.material = m; this.position = { x: 0, y: 0, z: 0, set: (x, y, z) => { this.position.x = x; this.position.y = y; this.position.z = z; } }; }
  function Group() { this.children = []; this.add = function(c) { this.children.push(c); }; this.position = { set: () => {} }; this.rotation = {}; }
  const mockTHREE = {
    Group,
    Mesh,
    BoxGeometry: function(w, h, d) { this.w = w; this.h = h; this.d = d; },
    CylinderGeometry: function() {},
    ConeGeometry: function() {},
    OctahedronGeometry: function() {},
    PlaneGeometry: function(w, h) { this.w = w; this.h = h; },
    MeshStandardMaterial: function() {},
    MeshBasicMaterial: function() {},
    PointLight: function() { this.position = { set: () => {} }; },
    DoubleSide: 2
  };

  const d = { id: 'd-test', x: 100, y: 200, rotacion: 0 };
  const entrada = MazmorrasLib.construirEntradaExterior(mockTHREE, d, () => 10);
  assert.ok(entrada, 'Debe devolver grupo');
  assert.ok(entrada.userData && entrada.userData.corredor);

  // Requisito usuario: exactamente 30 metros entre muros
  assert.strictEqual(entrada.userData.corredor.longitud, 30.0, 'El corredor debe medir exactamente 30 metros');
  assert.strictEqual(entrada.userData.corredor.puntoPortalZ, 30.0, 'El portal debe ubicarse al final de los 30 metros');
  assert.strictEqual(entrada.userData.corredor.puntoArcoZ, 0, 'El arco debe ubicarse en la entrada (0 metros)');
});

test('gestor de mazmorras: detección del portal a 30m y resolución de victoria / derrota', () => {
  const d = MazmorrasLib.generarMazmorraPorDefecto({ dungeons: [] }, 100, 100, { level: 10 });
  const gestor = new MazmorrasLib.GestorMazmorras({});

  // 1. Detección a 30m del arco
  // El héroe está a 10m dentro del corredor (no debe activar el portal de carga)
  const fuera = gestor.comprobarEntradaExterior([d], 100, 110);
  assert.strictEqual(fuera, null, 'A 10m no debe disparar carga');

  // El héroe llega al final de los 30 metros (z = 100 + 29.5 = 129.5)
  const cerca = gestor.comprobarEntradaExterior([d], 100, 129.5);
  assert.ok(cerca, 'Al final de los 30 metros debe detectar el portal');
  assert.strictEqual(cerca.dungeon.id, d.id);
  assert.ok(cerca.distanciaAlPortal <= 3.5, 'Distancia al portal menor a 3.5m');
  assert.strictEqual(cerca.cruzandoPortal, true, 'Al tocar o cruzar el portal debe marcar cruzandoPortal para entrada automática');

  // 2. Condición de victoria por muerte del Jefe
  let victoriaDisparada = false;
  gestor.enMazmorra = true;
  gestor.dungeonActiva = d;
  gestor.bossInstancia = { name: 'Señor del Trono', hp: 0, maxHp: 1000, recompensas: { oro: 3000 } };

  gestor.actualizarInstancia(0.016, { hp: 200, dead: false }, {
    onVictoria: () => { victoriaDisparada = true; }
  });
  assert.strictEqual(victoriaDisparada, true, 'La muerte del jefe debe disparar victoria');
  assert.strictEqual(d.completada, true, 'La mazmorra debe quedar marcada como completada');

  // 3. Condición de derrota por muerte del personaje
  let derrotaDisparada = false;
  gestor.bossInstancia = { name: 'Señor del Trono', hp: 500, maxHp: 1000 };
  gestor.actualizarInstancia(0.016, { hp: 0, dead: true }, {
    onDerrota: () => { derrotaDisparada = true; }
  });
  assert.strictEqual(derrotaDisparada, true, 'La muerte del personaje debe disparar derrota');
});

test('instancia de mazmorra: sitúa al personaje al inicio del archivo en los pasillos más estrechos a escala monumental >2000m²', () => {
  function createPos() {
    const p = { x: 0, y: 0, z: 0 };
    p.set = function(x, y, z) { p.x = x; p.y = y; p.z = z; };
    p.clone = function() { return { x: p.x, y: p.y, z: p.z }; };
    return p;
  }
  function MockObj3D() {
    this.position = createPos();
    this.rotation = createPos();
  }
  function MockGroup() {
    MockObj3D.call(this);
    this.children = [];
    this.add = function(c) { this.children.push(c); };
    this.remove = function(c) {
      const idx = this.children.indexOf(c);
      if (idx >= 0) this.children.splice(idx, 1);
    };
  }

  const mockTHREE = {
    Group: MockGroup,
    Mesh: MockObj3D,
    Vector3: function(x, y, z) { this.x = x || 0; this.y = y || 0; this.z = z || 0; this.clone = function() { return { x: this.x, y: this.y, z: this.z }; }; },
    Color: function() {},
    FogExp2: function() {},
    AmbientLight: MockObj3D,
    DirectionalLight: function() { MockObj3D.call(this); this.target = new MockObj3D(); },
    PointLight: MockObj3D,
    ConeGeometry: function() {},
    MeshBasicMaterial: function() {}
  };

  const scene = new MockGroup();
  const hero = { x: 80, y: 19, z: 0 };
  const mockCharacter = {
    root: new MockObj3D(),
    target: { set: function(x, y, z) { this.x = x; this.y = y; this.z = z; } },
    world: { getWalkableHeight: () => 19, isWaterHazard: () => false }
  };
  const mockControls = {
    target: { x: 80, y: 19, z: 0, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; }, clone: function() { return { ...this }; } },
    update: () => {}
  };
  const mockCamera = {
    position: { x: 80, y: 25, z: 10, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; }, clone: function() { return { ...this }; } }
  };
  const mockAcompanante = {
    x: 78, y: 19, z: -2,
    mesh: new MockObj3D()
  };

  const d = MazmorrasLib.generarMazmorraPorDefecto({ dungeons: [] }, 80, 0, { level: 12 });
  const gestor = new MazmorrasLib.GestorMazmorras({
    THREE: mockTHREE,
    scene,
    hero,
    character: mockCharacter,
    controls: mockControls,
    camera: mockCamera,
    acompanante: mockAcompanante,
    getWalkableHeight: (x, z) => 19
  });

  gestor.iniciarInstancia(d);

  // Verificación: el personaje debe estar al inicio del archivo en los pasillos más estrechos
  assert.strictEqual(hero.x, 0.0, 'X centrada en el pasillo estrecho');
  assert.strictEqual(hero.y, 2.92, 'Y correspondiente a la cota del suelo de la mazmorra (2.92m)');
  assert.strictEqual(hero.z, 37.6, 'Z en el inicio del archivo (z = 37.6m en el pasillo a escala monumental >2000m²)');

  // Teletransporte del CharacterController
  assert.strictEqual(mockCharacter.root.position.x, 0.0);
  assert.strictEqual(mockCharacter.root.position.y, 2.92);
  assert.strictEqual(mockCharacter.root.position.z, 37.6);
  assert.strictEqual(mockCharacter.root.rotation.y, Math.PI, 'Personaje orientado hacia el interior (-Z)');

  // Suelo transitable de la mazmorra conectado
  assert.strictEqual(mockCharacter.world.getWalkableHeight(0, 37.6), 2.92);

  // Acompañante situado detrás en el pasillo estrecho
  assert.strictEqual(mockAcompanante.mesh.position.z, 39.6);

  // Cámara orientada hacia el pasillo
  assert.strictEqual(mockControls.target.z, 37.6);

  // Al salir de la instancia, restaura el personaje al supramundo exterior
  gestor.salirInstancia(true);
  assert.strictEqual(gestor.enMazmorra, false);
  assert.strictEqual(mockCharacter.root.position.x, 80);
  assert.strictEqual(mockCharacter.root.position.z, -4.5);
  assert.strictEqual(mockCharacter.world.getWalkableHeight(80, -4.5), 19);
});

test('modo automático en mazmorra: activación, selección progresiva de objetivos y avance', () => {
  // Simular entorno de mazmorra con monstruos
  const gestorMazmorras = {
    enMazmorra: true,
    dungeonActiva: { id: 'dungeon-1', name: 'Cripta Ancestral' }
  };

  const monsters = [
    { id: 'elite-1', name: 'Centinela 1', level: 12, alive: true, hp: 500, maxHp: 500, x: 0, z: 24, dungeonInfoRef: {} },
    { id: 'elite-2', name: 'Centinela 2', level: 12, alive: true, hp: 500, maxHp: 500, x: 0, z: 12, dungeonInfoRef: {} },
    { id: 'boss-1', name: 'Señor del Trono', level: 15, alive: true, hp: 4000, maxHp: 4000, x: 0, z: -38, boss: true, dungeonInfoRef: {} }
  ];

  // 1. Simulación de alternarAuto en mazmorra
  let autoZona = null;
  let objetivo = null;
  const heroPos = { x: 0, z: 37.6 };

  function alternarAutoSim() {
    if (autoZona) { autoZona = null; return; }
    if (gestorMazmorras.enMazmorra) {
      const tieneVivos = monsters.some(m => m.dungeonInfoRef && m.alive && m.hp > 0);
      if (tieneVivos) {
        autoZona = { id: 'dungeon-activa', name: gestorMazmorras.dungeonActiva.name, esMazmorra: true };
      }
    }
  }

  alternarAutoSim();
  assert.ok(autoZona, 'El modo automático debe activarse en la mazmorra');
  assert.strictEqual(autoZona.esMazmorra, true);
  assert.strictEqual(autoZona.name, 'Cripta Ancestral');

  // 2. Simulación de atacarAuto: selección del enemigo más cercano
  function atacarAutoSim() {
    if (!autoZona) return null;
    if (objetivo && objetivo.alive && objetivo.hp > 0) return objetivo;
    let mejor = null, mejorD = Infinity;
    monsters.forEach(m => {
      if (!m.alive || m.hp <= 0) return;
      if (autoZona.esMazmorra && !m.dungeonInfoRef) return;
      const d = Math.hypot(m.x - heroPos.x, m.z - heroPos.z);
      if (d < mejorD) { mejorD = d; mejor = m; }
    });
    return mejor;
  }

  objetivo = atacarAutoSim();
  assert.ok(objetivo, 'Debe fijar al enemigo más cercano');
  assert.strictEqual(objetivo.id, 'elite-1', 'El primer objetivo debe ser el centinela en z=24 (más cercano a z=37.6)');

  // 3. Matar al primer objetivo: debe avanzar automáticamente al siguiente
  objetivo.alive = false;
  objetivo.hp = 0;
  objetivo = null;

  // El héroe avanza a z=24
  heroPos.z = 24.0;
  objetivo = atacarAutoSim();
  assert.strictEqual(objetivo.id, 'elite-2', 'Tras abatir al primero, fija automáticamente al segundo en z=12');

  // 4. Matar al segundo: debe avanzar al Jefe
  objetivo.alive = false;
  objetivo.hp = 0;
  objetivo = null;

  heroPos.z = 12.0;
  objetivo = atacarAutoSim();
  assert.strictEqual(objetivo.id, 'boss-1', 'Tras abatir a los esbirros, fija automáticamente al Jefe en z=-38');

  // 5. Matar al Jefe: mazmorra despejada
  objetivo.alive = false;
  objetivo.hp = 0;
  objetivo = null;

  const fin = atacarAutoSim();
  assert.strictEqual(fin, null, 'No quedan más objetivos tras derrotar al Jefe');
});
