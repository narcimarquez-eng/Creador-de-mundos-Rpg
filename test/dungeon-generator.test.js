const test = require('node:test');
const assert = require('node:assert');

// Mock Three.js mínimo para pruebas unitarias sin WebGL
function MockObj3D() {
  this.children = [];
  this.userData = {};
  this.position = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
  this.rotation = { x: 0, y: 0, z: 0 };
  this.scale = { x: 1, y: 1, z: 1, set(x, y, z) { this.x = x; this.y = y; this.z = z; }, setScalar(s) { this.x = s; this.y = s; this.z = s; } };
  this.add = function (c) { this.children.push(c); };
}
function MockMesh(geo, mat) {
  MockObj3D.call(this);
  this.geometry = geo;
  this.material = mat;
}
function MockLight(color, intensity, distance, decay) {
  MockObj3D.call(this);
  this.color = color;
  this.intensity = intensity;
  this.distance = distance;
  this.decay = decay;
}

const mockTHREE = {
  Group: MockObj3D,
  Mesh: MockMesh,
  PointLight: MockLight,
  AmbientLight: MockLight,
  BoxGeometry: function (...args) { this.args = args; },
  PlaneGeometry: function (...args) { this.args = args; },
  CylinderGeometry: function (...args) { this.args = args; },
  ConeGeometry: function (...args) { this.args = args; },
  SphereGeometry: function (...args) { this.args = args; },
  TorusGeometry: function (...args) { this.args = args; },
  CircleGeometry: function (...args) { this.args = args; },
  OctahedronGeometry: function (...args) { this.args = args; },
  MeshStandardMaterial: function (opts) {
    this.color = { hex: '#ffffff', set(v) { this.hex = v; } };
    Object.assign(this, opts);
    this.clone = function () {
      const c = new mockTHREE.MeshStandardMaterial(this);
      return c;
    };
  },
  MeshBasicMaterial: function (opts) {
    this.color = { hex: '#ffffff', set(v) { this.hex = v; } };
    Object.assign(this, opts);
    this.clone = function () {
      const c = new mockTHREE.MeshBasicMaterial(this);
      return c;
    };
  },
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

test('DungeonGenerator: paredes herméticas con hombros y dinteles sin huecos al vacío', () => {
  const kit = DungeonGenerator.crearKitMateriales(DungeonGenerator.ESTILOS_PIEDRA.cripta_gotica, mockTHREE);
  
  // Estancia ancha (24m) con apertura norte estrecha (6.8m)
  const sala = {
    id: 'sala_ancha_test',
    w: 24, d: 20, h: 5.0,
    x: 0, y: 0, z: 0,
    abiertoNorte: true,
    aperturas: {
      norte: { w: 6.8, cx: 0, puertaH: 3.8 }
    }
  };

  const meshGroup = DungeonGenerator.construirCajaHabitacion(mockTHREE, kit, sala, { anchoPasillos: 6.8 });
  assert.ok(meshGroup, 'Debe construir la malla de la habitación');

  const hombrosIzq = meshGroup.children.filter(c => c.userData && c.userData.lado === 'norte_oeste');
  const hombrosDer = meshGroup.children.filter(c => c.userData && c.userData.lado === 'norte_este');
  const dintel = meshGroup.children.filter(c => c.userData && c.userData.lado === 'norte' && c.userData.tipo === 'dintel');

  assert.strictEqual(hombrosIzq.length, 1, 'Debe generar el muro de hombro izquierdo que sella el hueco lateral');
  assert.strictEqual(hombrosDer.length, 1, 'Debe generar el muro de hombro derecho que sella el hueco lateral');
  assert.strictEqual(dintel.length, 1, 'Debe generar el dintel superior para cerrar el muro sobre la apertura');

  // El hombro izquierdo debe cubrir desde -12 hasta -3.4 (ancho = 8.6m)
  const geomIzq = hombrosIzq[0].geometry;
  assert.ok(geomIzq.args[0] > 8.0, 'El hombro izquierdo debe cubrir la diferencia de anchura');
});

test('DungeonGenerator: catálogo de props decorativos e inserción individual en estancia', () => {
  assert.ok(DungeonGenerator.CATALOGO_PROPS_DECORATIVOS, 'Debe existir el catálogo de props decorativos');
  assert.ok(DungeonGenerator.CATALOGO_PROPS_DECORATIVOS.armero, 'Debe incluir armero');
  assert.ok(DungeonGenerator.CATALOGO_PROPS_DECORATIVOS.caldero, 'Debe incluir caldero de pociones');
  assert.ok(DungeonGenerator.CATALOGO_PROPS_DECORATIVOS.celda, 'Debe incluir celda');

  const kit = DungeonGenerator.crearKitMateriales(DungeonGenerator.ESTILOS_PIEDRA.cripta_gotica, mockTHREE);
  const animables = [];
  const props = { antorchas: [], cofres: [], fuentes: [], animables };

  const propArmero = DungeonGenerator.crearObjetoDecorativo(mockTHREE, kit, 'armero', DungeonGenerator.ESTILOS_PIEDRA.cripta_gotica, new DungeonGenerator.PRNG(123), animables, props);
  assert.ok(propArmero, 'Debe instanciar el prop de armero');

  const propCaldero = DungeonGenerator.crearObjetoDecorativo(mockTHREE, kit, 'caldero', DungeonGenerator.ESTILOS_PIEDRA.cripta_gotica, new DungeonGenerator.PRNG(123), animables, props);
  assert.ok(propCaldero, 'Debe instanciar el prop de caldero de pociones');

  // Estancia con props decorativos personalizados
  const salaConProps = {
    id: 'sala_alquimista',
    tipo: 'laboratorio',
    w: 16, d: 16, h: 5.0,
    x: 10, y: 0, z: -10,
    propsPersonalizados: [
      { id: 'prop_1', tipo: 'caldero', x: 2, y: 0, z: 2 },
      { id: 'prop_2', tipo: 'armero', x: -4, y: 0, z: -4 },
      { id: 'prop_3', tipo: 'hongos', x: 0, y: 0, z: 3 }
    ]
  };

  const decMesh = DungeonGenerator.decorarHabitacion(mockTHREE, kit, salaConProps, DungeonGenerator.ESTILOS_PIEDRA.cripta_gotica, new DungeonGenerator.PRNG(123), animables, props);
  assert.ok(decMesh, 'Debe decorar la habitación');

  const propsInstanciados = decMesh.children.filter(c => c.userData && c.userData.idProp);
  assert.strictEqual(propsInstanciados.length, 3, 'Debe haber instanciado los 3 props personalizados definidos');
});

test('DungeonGenerator: personalización individual de textura de piedra y color de pared por sala', () => {
  const salas = [
    {
      id: 'sala_normal',
      tipo: 'entrada',
      w: 14, d: 14, h: 5,
      x: 0, y: 0, z: 30
    },
    {
      id: 'sala_basalto_custom',
      tipo: 'armeria',
      w: 18, d: 18, h: 5.5,
      x: 0, y: 0, z: 0,
      estilo: 'fortaleza_basalto',
      colorPared: '#3d1c1c'
    }
  ];

  const res = DungeonGenerator.generarMazmorra(mockTHREE, {
    estilo: 'cripta_gotica',
    salas: salas
  });

  assert.strictEqual(res.salas.length, 2, 'Debe generar exactamente las 2 salas pasadas en config');
  assert.strictEqual(res.salas[1].estilo, 'fortaleza_basalto', 'Debe conservar el estilo individual de la sala');
  assert.strictEqual(res.salas[1].colorPared, '#3d1c1c', 'Debe conservar el color de pared individual');
});


test('DungeonGenerator: catálogo completo de al menos 20 estilos arquitectónicos de piedra', () => {
  const estilos = DungeonGenerator.ESTILOS_PIEDRA;
  const claves = Object.keys(estilos);
  assert.ok(claves.length >= 20, `Debe haber al menos 20 estilos (actual: ${claves.length})`);

  // Comprobar estilos representativos clave solicitados
  const estilosEsperados = [
    'cripta_gotica', 'ruinas_musgosas', 'catacumbas_caliza', 'fortaleza_basalto',
    'marmol_imperial', 'caverna_obsidiana', 'ladrillo_medieval', 'minas_amatista',
    'santuario_jade', 'bastion_hierro', 'cripta_glaciar', 'arenisca_desierto',
    'huesos_calcinados', 'alquimia_azufre', 'cloacas_pizarra', 'cripta_sangrienta',
    'lapislazuli_oro', 'ruinas_celestiales', 'forja_magma', 'vacio_umbrio',
    'madera_petrificada', 'coral_abisal'
  ];

  estilosEsperados.forEach(eId => {
    assert.ok(estilos[eId], `Debe incluir el estilo ${eId}`);
    assert.ok(estilos[eId].nombre, `El estilo ${eId} debe tener nombre`);
    assert.ok(estilos[eId].colorBase, `El estilo ${eId} debe tener colorBase`);
    assert.ok(estilos[eId].colorLosa, `El estilo ${eId} debe tener colorLosa`);
  });
});

test('DungeonGenerator: resolución individual desacoplada de pared, suelo, techo y fuente', () => {
  const kitBase = DungeonGenerator.crearKitMateriales(DungeonGenerator.ESTILOS_PIEDRA.cripta_gotica, mockTHREE);
  const kitsPorEstilo = {
    marmol_imperial: DungeonGenerator.crearKitMateriales(DungeonGenerator.ESTILOS_PIEDRA.marmol_imperial, mockTHREE),
    forja_magma: DungeonGenerator.crearKitMateriales(DungeonGenerator.ESTILOS_PIEDRA.forja_magma, mockTHREE),
    cripta_glaciar: DungeonGenerator.crearKitMateriales(DungeonGenerator.ESTILOS_PIEDRA.cripta_glaciar, mockTHREE),
    santuario_jade: DungeonGenerator.crearKitMateriales(DungeonGenerator.ESTILOS_PIEDRA.santuario_jade, mockTHREE)
  };

  const salaHibrida = {
    id: 'sala_mix',
    tipo: 'fuente',
    w: 20, d: 20, h: 5.5,
    x: 0, y: 0, z: 0,
    estiloPared: 'marmol_imperial',
    colorPared: '#ffffff',
    estiloSuelo: 'forja_magma',
    colorSuelo: '#ff4500',
    estiloTecho: 'cripta_glaciar',
    colorTecho: '#38bdf8',
    estiloFuente: 'santuario_jade',
    colorAgua: '#10b981'
  };

  const matResueltos = DungeonGenerator.resolverMaterialesSala(mockTHREE, kitBase, kitsPorEstilo, salaHibrida);
  assert.ok(matResueltos.matPared, 'Debe devolver material de pared');
  assert.ok(matResueltos.matSuelo, 'Debe devolver material de suelo');
  assert.ok(matResueltos.matTecho, 'Debe devolver material de techo');
  assert.strictEqual(matResueltos.colorAgua, '#10b981', 'Debe conservar color de agua personalizado');

  // Construir habitación híbrida y verificar aplicación
  const group = DungeonGenerator.construirCajaHabitacion(mockTHREE, kitBase, salaHibrida, {}, kitsPorEstilo);
  assert.ok(group, 'Debe construir la habitación híbrida');
});

test('DungeonGenerator: configuración de botín y simulación de apertura de cofres', () => {
  assert.ok(DungeonGenerator.DEFAULT_LOOT_CONFIG, 'Debe existir DEFAULT_LOOT_CONFIG');
  assert.strictEqual(typeof DungeonGenerator.simularAperturaCofre, 'function', 'Debe existir función simularAperturaCofre');

  // Simulación 1: Cofre 100% éxito con recompensas fijas
  const loot100 = {
    probabilidadExito: 1.0,
    oroMin: 100, oroMax: 100,
    arenaMin: 10, arenaMax: 10,
    items: [
      { id: 'espada_test', nombre: 'Espada de Fuego', tipo: 'armas', probabilidad: 1.0 }
    ]
  };
  const tirada1 = DungeonGenerator.simularAperturaCofre(loot100);
  assert.strictEqual(tirada1.exito, true, 'Debe abrirse con éxito');
  assert.strictEqual(tirada1.oro, 100, 'Debe otorgar exactamente 100 oro');
  assert.strictEqual(tirada1.arena, 10, 'Debe otorgar exactamente 10 arena');
  assert.strictEqual(tirada1.items.length, 1, 'Debe otorgar el ítem garantizado');
  assert.strictEqual(tirada1.items[0].nombre, 'Espada de Fuego');

  // Simulación 2: Cofre 0% éxito (cerradura trabada)
  const loot0 = {
    probabilidadExito: 0.0,
    oroMin: 50, oroMax: 100,
    items: []
  };
  const tirada2 = DungeonGenerator.simularAperturaCofre(loot0);
  assert.strictEqual(tirada2.exito, false, 'No debe abrirse si probabilidad es 0');
  assert.strictEqual(tirada2.oro, 0);
  assert.strictEqual(tirada2.items.length, 0);
});

test('DungeonGenerator: posicionamiento, rotación Y, escala y lootConfig de props', () => {
  const kit = DungeonGenerator.crearKitMateriales(DungeonGenerator.ESTILOS_PIEDRA.cripta_gotica, mockTHREE);
  const animables = [];
  const props = { antorchas: [], cofres: [], fuentes: [], animables };

  const cofreCustomLoot = {
    probabilidadExito: 0.95,
    oroMin: 300, oroMax: 800,
    items: [{ id: 'reliquia_1', nombre: 'Grial Antiguo', tipo: 'reliquias', probabilidad: 0.8 }]
  };

  const salaConCofreMapeado = {
    id: 'sala_tesoro_map',
    tipo: 'tesoro',
    w: 16, d: 16, h: 5.0,
    x: 0, y: 0, z: 0,
    propsPersonalizados: [
      {
        id: 'cofre_custom_1',
        tipo: 'cofre',
        x: 3.5, y: 0, z: -2.5,
        rotY: Math.PI / 4,
        escala: 1.5,
        lootConfig: cofreCustomLoot
      }
    ]
  };

  const decMesh = DungeonGenerator.decorarHabitacion(mockTHREE, kit, salaConCofreMapeado, DungeonGenerator.ESTILOS_PIEDRA.cripta_gotica, new DungeonGenerator.PRNG(456), animables, props);
  const meshCofre = decMesh.children.find(c => c.userData && c.userData.idProp === 'cofre_custom_1');

  assert.ok(meshCofre, 'Debe instanciar el cofre decorativo');
  assert.strictEqual(meshCofre.position.x, 3.5, 'Debe situarse en X 3.5');
  assert.strictEqual(meshCofre.position.z, -2.5, 'Debe situarse en Z -2.5');
  assert.strictEqual(meshCofre.scale.x, 1.5, 'Debe escalar en X a 1.5');
  assert.strictEqual(meshCofre.userData.lootConfig.oroMin, 300, 'Debe conservar lootConfig');
});

test('DungeonGenerator: generador de thumbnails visuales y propagación de propId en submallas', () => {
  assert.strictEqual(typeof DungeonGenerator.generarDataURLThumbnail, 'function', 'Debe exportar generarDataURLThumbnail');

  // En entorno headless/Node devuelve string vacío de forma segura
  const thumb = DungeonGenerator.generarDataURLThumbnail('cripta_gotica', 'pared', 64);
  assert.strictEqual(typeof thumb, 'string', 'Debe retornar string');

  // Comprobar propagación de propId
  const kit = DungeonGenerator.crearKitMateriales(DungeonGenerator.ESTILOS_PIEDRA.cripta_gotica, mockTHREE);
  const animables = [];
  const props = { antorchas: [], cofres: [], fuentes: [], animables };

  const salaTest = {
    id: 'sala_test_ray',
    tipo: 'armeria',
    w: 16, d: 16, h: 5.0,
    x: 0, y: 0, z: 0,
    propsPersonalizados: [
      { id: 'antorcha_wall_1', tipo: 'antorcha', x: 0, y: 2.4, z: -7.8, rotY: 0 }
    ]
  };

  const decMesh = DungeonGenerator.decorarHabitacion(mockTHREE, kit, salaTest, DungeonGenerator.ESTILOS_PIEDRA.cripta_gotica, new DungeonGenerator.PRNG(789), animables, props);
  const antorchaMesh = decMesh.children.find(c => c.userData && c.userData.idProp === 'antorcha_wall_1');

  assert.ok(antorchaMesh, 'Debe existir la antorcha instanciada');
  assert.strictEqual(antorchaMesh.position.y, 2.4, 'La antorcha debe estar a altura Y = 2.4m');
  assert.strictEqual(antorchaMesh.userData.propId, 'antorcha_wall_1', 'Debe tener propId en userData');
});

test('DungeonGenerator: texturas independientes puras y kit desacoplado (pared, suelo, zocalo, techo, madera, hierro)', () => {
  assert.strictEqual(typeof DungeonGenerator.crearTexturaPared, 'function', 'Exporta crearTexturaPared');
  assert.strictEqual(typeof DungeonGenerator.crearTexturaSuelo, 'function', 'Exporta crearTexturaSuelo');
  assert.strictEqual(typeof DungeonGenerator.crearTexturaZocalo, 'function', 'Exporta crearTexturaZocalo');
  assert.strictEqual(typeof DungeonGenerator.crearTexturaTecho, 'function', 'Exporta crearTexturaTecho');
  assert.strictEqual(typeof DungeonGenerator.crearTexturaMadera, 'function', 'Exporta crearTexturaMadera');
  assert.strictEqual(typeof DungeonGenerator.crearTexturaHierro, 'function', 'Exporta crearTexturaHierro');

  const estilo = DungeonGenerator.ESTILOS_PIEDRA.cripta_gotica;
  const kit = DungeonGenerator.crearKitMateriales(estilo, mockTHREE);

  assert.ok(kit.piedraMuro, 'Kit contiene material piedraMuro');
  assert.ok(kit.sueloLosas, 'Kit contiene material sueloLosas');
  assert.ok(kit.zocalo, 'Kit contiene material zocalo');
  assert.ok(kit.techo, 'Kit contiene material techo');
  assert.ok(kit.madera, 'Kit contiene material madera');
  assert.ok(kit.hierro, 'Kit contiene material hierro');

  // En una caja de habitación, deben instanciarse suelos, paredes y zócalos
  const sala = { id: 's_texturas', tipo: 'normal', w: 12, d: 12, h: 5.0, x: 0, z: 0 };
  const caja = DungeonGenerator.construirCajaHabitacion(mockTHREE, kit, sala);
  const suelos = caja.children.filter(c => c.userData && c.userData.tipo === 'suelo');
  const muros = caja.children.filter(c => c.userData && c.userData.tipo === 'muro');
  const zocalos = caja.children.filter(c => c.userData && c.userData.tipo === 'zocalo');

  assert.strictEqual(suelos.length, 1, 'Debe haber 1 suelo');
  assert.strictEqual(muros.length, 4, 'Debe haber 4 muros superiores');
  assert.strictEqual(zocalos.length, 4, 'Debe haber 4 zócalos perimetrales inferiores');
});

test('DungeonGenerator: menú y modelos de antorchas en 5 formas diferentes', () => {
  const kit = DungeonGenerator.crearKitMateriales(DungeonGenerator.ESTILOS_PIEDRA.cripta_gotica, mockTHREE);
  const formas = ['antorcha_hierro', 'candelabro_aplique', 'farol_jaula', 'brasero_calavera', 'cristal_arcano'];

  formas.forEach(forma => {
    const a = DungeonGenerator.crearAntorcha(mockTHREE, kit, 0x38bdf8, 3.0, { forma });
    assert.ok(a, `Debe crear antorcha con forma ${forma}`);
    assert.strictEqual(a.userData.tipo, 'antorcha');
    assert.strictEqual(a.userData.forma, forma);
    assert.ok(a.userData.luz, 'Debe tener PointLight');
    assert.strictEqual(a.userData.baseIntensity, 3.0);
    assert.strictEqual(typeof a.userData.flicker, 'function', 'Debe contar con función de animación / flicker');

    // Comprobar que flicker oscila sin lanzar errores
    a.userData.flicker(1.5);
  });
});

test('DungeonGenerator: distribución automática paramétrica de antorchas en paredes perimetrales', () => {
  const kit = DungeonGenerator.crearKitMateriales(DungeonGenerator.ESTILOS_PIEDRA.cripta_gotica, mockTHREE);
  const animables = [];
  const props = { antorchas: [], cofres: [], fuentes: [], animables };

  const salaGrande = {
    id: 'sala_gran_salon',
    tipo: 'armeria',
    w: 24, d: 24, h: 5.2,
    x: 0, y: 0, z: 0
  };

  const configAuto = {
    antorchasAutomaticas: true,
    distanciaAntorchas: 6.0,
    formaAntorcha: 'farol_jaula',
    colorLuzAntorcha: 0x10b981,
    intensidadAntorchas: 2.8
  };

  const decMesh = DungeonGenerator.decorarHabitacion(mockTHREE, kit, salaGrande, DungeonGenerator.ESTILOS_PIEDRA.cripta_gotica, new DungeonGenerator.PRNG(555), animables, props, configAuto);
  assert.ok(decMesh, 'Debe decorar la sala');

  // Con distancia 6m en sala de 24x24, debe generar múltiples antorchas automáticas
  const antorchasAuto = props.antorchas.filter(a => a.userData && a.userData.esAuto);
  assert.ok(antorchasAuto.length >= 8, 'Debe generar al menos 8 antorchas automáticas en las 4 paredes');
  assert.strictEqual(antorchasAuto[0].userData.forma, 'farol_jaula', 'Debe aplicar la forma seleccionada en el menú');
});

test('DungeonGenerator: catálogo de arquetipos y creación de monstruos procedurales', () => {
  assert.ok(DungeonGenerator.ARQUETIPOS_MONSTRUOS, 'Debe existir ARQUETIPOS_MONSTRUOS');
  assert.ok(DungeonGenerator.ARQUETIPOS_MONSTRUOS.jefe_caballero_titan, 'Debe existir caballero titánico');
  assert.ok(DungeonGenerator.ARQUETIPOS_MONSTRUOS.jefe_nigromante_arcano, 'Debe existir nigromante espectral');
  assert.ok(DungeonGenerator.ARQUETIPOS_MONSTRUOS.jefe_golem_magma, 'Debe existir gólem de magma');
  assert.ok(DungeonGenerator.ARQUETIPOS_MONSTRUOS.elite_centinela_esqueleto, 'Debe existir centinela esqueleto');
  assert.ok(DungeonGenerator.ARQUETIPOS_MONSTRUOS.elite_espectro_sombra, 'Debe existir espectro');
  assert.ok(DungeonGenerator.ARQUETIPOS_MONSTRUOS.elite_gargola_canteria, 'Debe existir gárgola');

  const mBoss = DungeonGenerator.crearMonstruoProcedural(mockTHREE, 'jefe_caballero_titan', {
    esJefe: true,
    nombre: 'Titán de las Sombras',
    nivel: 20,
    rangoElite: 10
  });

  assert.ok(mBoss, 'Debe crear la instancia del monstruo');
  assert.strictEqual(mBoss.userData.esMonstruo, true, 'userData.esMonstruo debe ser true');
  assert.strictEqual(mBoss.userData.esJefe, true, 'userData.esJefe debe ser true');
  assert.strictEqual(mBoss.userData.nombre, 'Titán de las Sombras', 'Nombre debe coincidir');
  assert.strictEqual(typeof mBoss.userData.animar, 'function', 'Debe tener función animar');

  const mGuard = DungeonGenerator.crearMonstruoProcedural(mockTHREE, 'elite_espectro_sombra', {
    esJefe: false,
    nombre: 'Aparición Maldita'
  });
  assert.ok(mGuard, 'Debe crear guardián espectral');
  assert.strictEqual(mGuard.userData.esJefe, false, 'No debe ser jefe');
});

test('DungeonGenerator: generación de monstruos y optimización de sombras en generarMazmorra', () => {
  // 1. Por defecto: sombras puntuales desactivadas para rendimiento 60 FPS
  const instRendimiento = DungeonGenerator.generarMazmorra(mockTHREE, {
    seed: 55443,
    radio: 50,
    monstruos: { habilitados: true, jefe: { tipo: 'jefe_golem_magma' }, guardianes: { tipo: 'mixto' } }
  });

  assert.ok(instRendimiento.monstruos, 'Debe retornar array de monstruos');
  assert.ok(instRendimiento.monstruos.length >= 3, `Debe generar al menos Jefe + 2 guardianes (generó ${instRendimiento.monstruos.length})`);
  
  const jefe = instRendimiento.monstruos.find(m => m.userData.esJefe);
  assert.ok(jefe, 'Debe haber un jefe generado');
  assert.strictEqual(jefe.userData.arquetipo, 'jefe_golem_magma', 'Arquetipo del jefe debe ser jefe_golem_magma');

  // Verificar que antorchas por defecto no tienen castShadow = true (optimización GPU)
  const antorchaSinSombra = DungeonGenerator.crearAntorcha(mockTHREE, instRendimiento.kit, 0xf59e0b, 2.0, {});
  assert.strictEqual(!!(antorchaSinSombra.userData.luz && antorchaSinSombra.userData.luz.castShadow), false, 'Por defecto la luz puntual de antorcha no debe proyectar sombra cubemap');

  // 2. Con sombrasPuntuales: true explícito
  const antorchaConSombra = DungeonGenerator.crearAntorcha(mockTHREE, instRendimiento.kit, 0xf59e0b, 2.0, { sombrasPuntuales: true });
  assert.strictEqual(antorchaConSombra.userData.luz.castShadow, true, 'Con sombrasPuntuales: true la luz puntual debe proyectar sombra');
});

test('DungeonGenerator: iluminación de bóveda garantizada por estancia y antorchas expansivas', () => {
  const kit = DungeonGenerator.crearKitMateriales(DungeonGenerator.ESTILOS_PIEDRA.cripta_gotica, mockTHREE);
  const animables = [];
  const props = { antorchas: [], cofres: [], fuentes: [], animables };

  const salaTest = {
    id: 'sala_cripta_luminosa',
    tipo: 'cripta',
    w: 20, d: 20, h: 5.2,
    x: 0, y: 0, z: 0
  };

  // Toda sala debe generar su luz cenital de bóveda para evitar zonas negras
  const decMesh = DungeonGenerator.decorarHabitacion(mockTHREE, kit, salaTest, DungeonGenerator.ESTILOS_PIEDRA.cripta_gotica, new DungeonGenerator.PRNG(999), animables, props, {});
  const luzBoveda = decMesh.children.find(c => c.name === 'luz_sala_sala_cripta_luminosa');
  assert.ok(luzBoveda, 'Toda estancia debe incorporar luz cenital de bóveda');
  assert.ok(luzBoveda.distance >= 40, `Radio de luz cenital debe cubrir la cámara (distancia ${luzBoveda.distance})`);
  assert.ok(luzBoveda.decay <= 1.2, `Decaimiento debe ser suave para evitar cortes negros (decay ${luzBoveda.decay})`);

  // Las antorchas deben tener radio expansivo y decay suave
  const antorcha = DungeonGenerator.crearAntorcha(mockTHREE, kit, 0xf59e0b, 3.4, {});
  assert.ok(antorcha.userData.luz.distance >= 35, 'Antorchas deben tener alcance extendido');
  assert.ok(antorcha.userData.luz.decay <= 1.2, 'Antorchas deben tener caída suave');
});

test('DungeonGenerator: entrada monumental y sistema de colisiones herméticas', () => {
  const d = DungeonGenerator.generarMazmorra(mockTHREE, {
    seed: 54321,
    estilo: 'cripta_gotica',
    tamanoMedio: 20
  });

  // 1. Entrada monumental de dimensiones amplias
  const salaEntrada = d.salas.find(s => s.tipo === 'entrada');
  assert.ok(salaEntrada, 'Debe haber una sala de entrada');
  assert.ok(salaEntrada.w >= 24, `Ancho de entrada debe ser majestuoso (w = ${salaEntrada.w})`);
  assert.ok(salaEntrada.d >= 22, `Profundidad de entrada debe ser majestuosa (d = ${salaEntrada.d})`);
  assert.ok(salaEntrada.h >= 6.0, `Altura de entrada monumental (h = ${salaEntrada.h})`);

  // 2. Sistema de colisionadores registrados
  assert.ok(Array.isArray(d.colliders), 'd.colliders debe ser una lista de colisionadores');
  assert.ok(d.colliders.length > 0, `Deben existir colisionadores para muros y props (encontrados: ${d.colliders.length})`);
  const cajasMuro = d.colliders.filter(c => c.type === 'box');
  assert.ok(cajasMuro.length >= 4, 'Deben registrarse cajas colisionadoras tipo box para los muros');
  assert.ok(cajasMuro.every(c => typeof c.minX === 'number' && typeof c.maxX === 'number' && typeof c.minZ === 'number' && typeof c.maxZ === 'number'), 'Los colisionadores box deben definir sus límites AABB');

  // 3. Método getColliders(x, z, radius)
  assert.strictEqual(typeof d.getColliders, 'function', 'Debe exponer getColliders para character.js');
  const cercanos = d.getColliders(0, 0, 30);
  assert.ok(Array.isArray(cercanos), 'getColliders debe retornar un array');
  assert.ok(cercanos.length <= d.colliders.length, 'getColliders debe filtrar colisionadores por proximidad');

  // 4. userData.colliders en el grupo raíz
  assert.strictEqual(d.group.userData.colliders, d.colliders, 'group.userData.colliders debe enlazar a colliders');
});

test('DungeonGenerator: generación automática de pasillos laterales al colocar o ramificar estancias a la derecha o izquierda', () => {
  // Caso de la imagen del usuario: Vestíbulo en (0, 0) y Armería a la derecha en (22, 0)
  const salaPrincipal = {
    id: 'room_vestibulo',
    tipo: 'entrada',
    nombre: 'Vestíbulo de Entrada',
    x: 0, y: 0, z: 0,
    w: 26, d: 24, h: 6.5
  };

  const salaDerecha = {
    id: 'room_armeria_derecha',
    tipo: 'armeria',
    nombre: 'Armería de la Guardia',
    x: 22, y: 0, z: 0,
    w: 16, d: 16, h: 5.2
  };

  const res = DungeonGenerator.generarMazmorra(mockTHREE, {
    estilo: 'cripta_gotica',
    salas: [salaPrincipal, salaDerecha]
  });

  // 1. Debe haber insertado automáticamente el pasillo lateral conector
  assert.strictEqual(res.salas.length, 3, 'Debe haber 3 estancias: principal, derecha y el pasillo lateral automático');

  const pasilloAuto = res.salas.find(s => s.tipo === 'pasillo' && s.esConectorAutomatico);
  assert.ok(pasilloAuto, 'Debe existir un pasillo conector automático');
  assert.ok(pasilloAuto.id.includes('room_vestibulo') && pasilloAuto.id.includes('room_armeria_derecha'), 'El pasillo debe vincular ambas salas');

  // 2. Comprobar dimensiones del pasillo (borde Este de vestíbulo = 13, borde Oeste de armería = 14 => gapX = 1)
  assert.ok(pasilloAuto.w >= 1.0, `El ancho del pasillo debe cubrir el gap de 1.0m (actual: ${pasilloAuto.w})`);
  assert.strictEqual(pasilloAuto.z, 0, 'El pasillo debe estar alineado en Z con el centro de solapamiento');
  assert.strictEqual(pasilloAuto.abiertoOeste, true, 'El pasillo debe tener abierto su extremo Oeste');
  assert.strictEqual(pasilloAuto.abiertoEste, true, 'El pasillo debe tener abierto su extremo Este');

  // 3. Comprobar aperturas herméticas en las salas conectadas
  assert.strictEqual(salaPrincipal.abiertoEste, true, 'La sala principal debe tener abierto su muro Este');
  assert.ok(salaPrincipal.aperturas && salaPrincipal.aperturas.este, 'Debe tener calculada la apertura Este');
  assert.strictEqual(salaDerecha.abiertoOeste, true, 'La sala derecha debe tener abierto su muro Oeste');
  assert.ok(salaDerecha.aperturas && salaDerecha.aperturas.oeste, 'Debe tener calculada la apertura Oeste');

  // 4. Probar adición de una sala a la izquierda (X = -24, Z = 0)
  const salaIzquierda = {
    id: 'room_laboratorio_izq',
    tipo: 'laboratorio',
    nombre: 'Laboratorio del Oeste',
    x: -24, y: 0, z: 0,
    w: 14, d: 16, h: 5.2
  };

  const res2 = DungeonGenerator.generarMazmorra(mockTHREE, {
    estilo: 'cripta_gotica',
    salas: [salaPrincipal, salaDerecha, salaIzquierda]
  });

  // Deben existir 5 salas: 3 estancias + 2 pasillos laterales (uno a la izquierda y otro a la derecha)
  assert.strictEqual(res2.salas.length, 5, 'Debe conectar tanto a la izquierda como a la derecha (3 estancias + 2 pasillos laterales)');
  const pasillosLaterales = res2.salas.filter(s => s.tipo === 'pasillo' && s.esConectorAutomatico);
  assert.strictEqual(pasillosLaterales.length, 2, 'Deben existir exactamente 2 pasillos conectores laterales');

  // 5. Verificar que al mover la sala derecha de X=22 a X=30 no se duplican pasillos
  salaDerecha.x = 30;
  const res3 = DungeonGenerator.generarMazmorra(mockTHREE, {
    estilo: 'cripta_gotica',
    salas: res2.salas // Pasamos la lista actual con pasillos previos para probar recálculo limpio
  });
  const pasillosActualizados = res3.salas.filter(s => s.tipo === 'pasillo' && s.esConectorAutomatico);
  assert.strictEqual(pasillosActualizados.length, 2, 'No deben acumularse pasillos duplicados al desplazar una estancia');
  const nuevoPasilloDer = res3.salas.find(s => s.id.includes('room_armeria_derecha'));
  assert.ok(nuevoPasilloDer.w >= 8.8, `El nuevo pasillo debe expandirse para cubrir la nueva distancia (w = ${nuevoPasilloDer.w})`);
});
