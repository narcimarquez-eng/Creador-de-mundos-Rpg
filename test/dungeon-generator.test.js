const test = require('node:test');
const assert = require('node:assert');

// Mock Three.js mínimo para pruebas unitarias sin WebGL
function MockObj3D() {
  this.children = [];
  this.position = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
  this.rotation = { x: 0, y: 0, z: 0 };
  this.scale = { x: 1, y: 1, z: 1, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
  this.add = function (c) { this.children.push(c); };
}
function MockMesh(geo, mat) {
  MockObj3D.call(this);
  this.geometry = geo;
  this.material = mat;
}
function MockLight(color, intensity) {
  MockObj3D.call(this);
  this.color = color;
  this.intensity = intensity;
}

const mockTHREE = {
  Group: MockObj3D,
  Mesh: MockMesh,
  PointLight: MockLight,
  AmbientLight: MockLight,
  BoxGeometry: function () {},
  PlaneGeometry: function () {},
  CylinderGeometry: function () {},
  ConeGeometry: function () {},
  SphereGeometry: function () {},
  TorusGeometry: function () {},
  CircleGeometry: function () {},
  MeshStandardMaterial: function (opts) { Object.assign(this, opts); },
  MeshBasicMaterial: function (opts) { Object.assign(this, opts); },
  CanvasTexture: function () { this.wrapS = 1000; this.wrapT = 1000; },
  RepeatWrapping: 1000,
  SRGBColorSpace: 'srgb'
};

const DungeonGenerator = require('../js/dungeon-generator.js');

test('DungeonGenerator: catálogo de tipos de piedra y temáticas', () => {
  const estilos = DungeonGenerator.ESTILOS_PIEDRA;
  assert.ok(estilos.cripta_gotica, 'Debe incluir Cripta Gótica');
  assert.ok(estilos.ruinas_musgosas, 'Debe incluir Ruinas Musgosas');
  assert.ok(estilos.catacumbas_caliza, 'Debe incluir Catacumbas de Caliza');
  assert.ok(estilos.fortaleza_basalto, 'Debe incluir Fortaleza de Basalto');

  // Cada estilo debe tener colores y parámetros definidos
  Object.values(estilos).forEach(est => {
    assert.ok(est.id && est.nombre);
    assert.ok(est.colorBase && est.colorSecundario && est.colorMortero && est.colorLosa);
    assert.ok(typeof est.densidadMusgo === 'number');
    assert.ok(typeof est.densidadHierba === 'number');
  });
});

test('DungeonGenerator: PRNG reproducible basado en semilla', () => {
  const prng1 = new DungeonGenerator.PRNG(42);
  const prng2 = new DungeonGenerator.PRNG(42);

  const seq1 = [prng1.next(), prng1.range(5, 10), prng1.int(1, 100)];
  const seq2 = [prng2.next(), prng2.range(5, 10), prng2.int(1, 100)];

  assert.deepStrictEqual(seq1, seq2, 'La misma semilla debe producir exactamente la misma secuencia');
});

test('DungeonGenerator: props individuales (antorchas, fuentes, cofres, jarrones, sarcófagos, hongos)', () => {
  const estilo = DungeonGenerator.ESTILOS_PIEDRA.ruinas_musgosas;
  const kit = DungeonGenerator.crearKitMateriales(estilo, mockTHREE);
  const rng = new DungeonGenerator.PRNG(999);

  // 1. Antorcha con luz dinámica y flicker
  const antorcha = DungeonGenerator.crearAntorcha(mockTHREE, kit, 0xf59e0b, 2.5);
  assert.strictEqual(antorcha.userData.tipo, 'antorcha');
  assert.ok(antorcha.userData.luz, 'Debe tener PointLight');
  assert.strictEqual(typeof antorcha.userData.flicker, 'function');
  antorcha.userData.flicker(1.5);

  // 2. Fuente con pileta de piedra y agua
  const fuente = DungeonGenerator.crearFuente(mockTHREE, kit, 2.5, 1.2);
  assert.strictEqual(fuente.userData.tipo, 'fuente');
  assert.ok(fuente.userData.agua);
  assert.strictEqual(typeof fuente.userData.update, 'function');
  fuente.userData.update(2.0);

  // 3. Cofre del tesoro
  const cofreCerrado = DungeonGenerator.crearCofre(mockTHREE, kit, false);
  assert.strictEqual(cofreCerrado.userData.tipo, 'cofre');
  assert.strictEqual(cofreCerrado.userData.abierto, false);

  const cofreAbierto = DungeonGenerator.crearCofre(mockTHREE, kit, true);
  assert.strictEqual(cofreAbierto.userData.abierto, true);

  // 4. Jarrones (entero y roto)
  const jarron = DungeonGenerator.crearJarron(mockTHREE, kit, 1.0, false);
  assert.strictEqual(jarron.userData.tipo, 'jarron');
  assert.strictEqual(jarron.userData.roto, false);

  const jarronRoto = DungeonGenerator.crearJarron(mockTHREE, kit, 1.0, true);
  assert.strictEqual(jarronRoto.userData.roto, true);

  // 5. Sarcófago y Columnas
  const sarcofago = DungeonGenerator.crearSarcofago(mockTHREE, kit);
  assert.strictEqual(sarcofago.userData.tipo, 'sarcofago');

  const columna = DungeonGenerator.crearColumna(mockTHREE, kit, 5.0, 0.6);
  assert.strictEqual(columna.userData.tipo, 'columna');

  // 6. Hongos luminosos y mancha de vegetación
  const hongos = DungeonGenerator.crearHongosLuminosos(mockTHREE, kit, rng);
  assert.strictEqual(hongos.userData.tipo, 'hongos');
  assert.ok(hongos.userData.luzHongo);

  const veg = DungeonGenerator.crearManchaVegetacion(mockTHREE, kit, rng, 1.5);
  assert.ok(veg.children.length >= 3, 'Debe contener la mancha y briznas');
});

test('DungeonGenerator: generarMazmorra completa procedural', () => {
  const res = DungeonGenerator.generarMazmorra(mockTHREE, {
    seed: 555,
    estilo: 'cripta_gotica'
  });

  assert.ok(res.group, 'Debe devolver grupo Three.js');
  assert.ok(Array.isArray(res.salas) && res.salas.length >= 5, 'Debe generar red de salas y pasillos');
  assert.ok(res.props.antorchas.length >= 4, 'Debe tener antorchas a lo largo de la mazmorra');
  assert.ok(res.props.cofres.length >= 1, 'Debe tener cofres en la cámara del tesoro');
  assert.ok(res.props.fuentes.length >= 1, 'Debe tener fuente ornamental');

  // Spawn points configurados para el juego
  assert.ok(res.spawns.hero, 'Debe tener spawn del héroe');
  assert.strictEqual(res.spawns.hero.z, 46.0, 'Spawn del héroe en el vestíbulo de entrada');
  assert.ok(res.spawns.boss, 'Debe tener spawn del Jefe');
  assert.strictEqual(res.spawns.boss.z, -58.0, 'Spawn del Jefe en el trono');
  assert.ok(Array.isArray(res.spawns.elites) && res.spawns.elites.length >= 4, 'Debe tener esbirros élites');

  // Animación / loop
  assert.strictEqual(typeof res.update, 'function');
  res.update(0.016, 1.0);
});

test('DungeonGenerator: catálogo de estancias y nuevos props especializados', () => {
  const tipos = DungeonGenerator.TIPOS_ESTANCIA;
  assert.ok(tipos, 'Debe exportar TIPOS_ESTANCIA');
  assert.ok(tipos.entrada && tipos.fuente && tipos.tesoro && tipos.cripta_columnas);
  assert.ok(tipos.armeria && tipos.biblioteca && tipos.prision && tipos.laboratorio && tipos.jardin_subterraneo);
  assert.ok(tipos.sala_jefe);

  const estilo = DungeonGenerator.ESTILOS_PIEDRA.cripta_gotica;
  const kit = DungeonGenerator.crearKitMateriales(estilo, mockTHREE);
  const rng = new DungeonGenerator.PRNG(777);

  // Armería
  const arm = DungeonGenerator.crearArmeriaProps(mockTHREE, kit, rng);
  assert.strictEqual(arm.userData.tipo, 'armeria');

  // Biblioteca
  const bib = DungeonGenerator.crearBibliotecaProps(mockTHREE, kit, rng);
  assert.strictEqual(bib.userData.tipo, 'biblioteca');

  // Prisión
  const pris = DungeonGenerator.crearPrisionProps(mockTHREE, kit, rng, 5.0);
  assert.strictEqual(pris.userData.tipo, 'prision');

  // Laboratorio
  const lab = DungeonGenerator.crearLaboratorioProps(mockTHREE, kit, rng);
  assert.strictEqual(lab.userData.tipo, 'laboratorio');
});

test('DungeonGenerator: incremento de radio y escalado de superficie', () => {
  const resPequena = DungeonGenerator.generarMazmorra(mockTHREE, {
    radio: 50,
    numeroSalas: 5,
    seed: 123
  });
  const resGrande = DungeonGenerator.generarMazmorra(mockTHREE, {
    radio: 150,
    numeroSalas: 10,
    seed: 123
  });

  assert.ok(resGrande.areaTotal > resPequena.areaTotal, 'Radio mayor debe generar mayor superficie total');
  const spanPequena = Math.abs(resPequena.spawns.hero.z - resPequena.spawns.boss.z);
  const spanGrande = Math.abs(resGrande.spawns.hero.z - resGrande.spawns.boss.z);
  assert.ok(spanGrande > spanPequena, 'La distancia entre la entrada y el jefe debe aumentar con el radio');
});

test('DungeonGenerator: varianza y tamaño medio de salas', () => {
  const resMedio12 = DungeonGenerator.generarMazmorra(mockTHREE, {
    tamanoMedio: 12,
    varianzaTamano: 0.0,
    seed: 321
  });
  const resMedio28 = DungeonGenerator.generarMazmorra(mockTHREE, {
    tamanoMedio: 28,
    varianzaTamano: 0.0,
    seed: 321
  });

  assert.ok(resMedio28.areaTotal > resMedio12.areaTotal * 2, 'Salas de 28m deben tener mucha mayor superficie que de 12m');

  const resConVarianza = DungeonGenerator.generarMazmorra(mockTHREE, {
    tamanoMedio: 20,
    varianzaTamano: 0.8,
    seed: 888
  });
  const anchos = resConVarianza.salas.map(s => s.w);
  const minAncho = Math.min(...anchos);
  const maxAncho = Math.max(...anchos);
  assert.ok(maxAncho > minAncho, 'La varianza alta debe generar tamaños diversos entre salas');
});

test('DungeonGenerator: creación de nuevas estancias personalizadas manuales', () => {
  const salasCustom = [
    {
      id: 'sala_custom_alquimia',
      tipo: 'laboratorio',
      nombre: 'Cámara Prohibida del Nigromante',
      x: 25, y: 0, z: -10,
      w: 18, d: 18, h: 6.0
    },
    {
      id: 'sala_custom_prision',
      tipo: 'prision',
      nombre: 'Calabozo de los Traidores',
      x: -25, y: 0, z: -10,
      w: 16, d: 14, h: 5.0
    }
  ];

  const res = DungeonGenerator.generarMazmorra(mockTHREE, {
    seed: 999,
    salasPersonalizadas: salasCustom
  });

  const encontradaLab = res.salas.find(s => s.id === 'sala_custom_alquimia');
  assert.ok(encontradaLab, 'Debe incluir la estancia personalizada de laboratorio');
  assert.strictEqual(encontradaLab.nombre, 'Cámara Prohibida del Nigromante');

  const encontradaPris = res.salas.find(s => s.id === 'sala_custom_prision');
  assert.ok(encontradaPris, 'Debe incluir la estancia personalizada de prisión');
  assert.strictEqual(encontradaPris.w, 16);
});
