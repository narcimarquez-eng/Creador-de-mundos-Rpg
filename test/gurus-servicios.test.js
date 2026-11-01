const { test } = require('node:test');
const assert = require('node:assert');

test('los gurús, el herrero y el mercader se instancian correctamente incluso con cabañas secretas previas', () => {
  // Simulación del entorno de visor-mundo
  const GURUS = [
    { id: 'guru-1', nombre: 'Sabia Elara', tema: 'la historia del reino', frase: 'Antes de Aden hubo siete reinos. Sus murallas aún guardan las runas.' },
    { id: 'guru-2', nombre: 'Maestro Oren', tema: 'los caminos', frase: 'Cada camino lleva a una zona de caza. Sigue el de piedra para no perderte.' },
    { id: 'guru-3', nombre: 'Hermana Ysolde', tema: 'las runas', frase: 'Las runas se leen de abajo arriba. Un monstruo marcado con ellas es más débil.', servicio: 'entrenador' },
    { id: 'guru-4', nombre: 'Viejo Tamsin', tema: 'los monstruos', frase: 'Los de nivel 1 a 3 temen al acero. Con tu espada basta: no te preocupes por ellos.' },
    { id: 'guru-5', nombre: 'Erudita Mirel', tema: 'el equipo', frase: 'Una cota malgastada rinde la mitad. Revisa el estado de cada objeto en el 🎒.' }
  ];

  const SERVICIOS = [
    { id: 'serv-herrero', modelo: 'guru-4', nombre: 'Herrero Brann', tema: 'la forja', servicio: 'herrero', frase: 'Traigo el hierro; tú traes oro. Fabrico lo que tu nivel permita.' },
    { id: 'serv-mercader', modelo: 'guru-5', nombre: 'Mercader Tovi', tema: 'el comercio', servicio: 'mercader', frase: 'Compro lo que encuentres y vendo lo que te haga falta. Pulsa H.' }
  ];

  const RADIO_GURUS = 6;
  const RADIO_PUESTOS = 12.2;

  const towns = [
    { t: { id: 'pueblo-1', name: 'Valle Inicial', isStart: true, x: 100, y: 100 } },
    { t: { id: 'pueblo-2', name: 'Refugio Alto', isStart: false, x: 300, y: 300 } }
  ];
  const world = { towns: towns.map(o => o.t) };

  const gurus = [];
  let gurusColocados = false;

  function instanciarNpc(info, modelo, x, z, lookX, lookZ) {
    const entrada = {
      info,
      nombreModelo: modelo,
      x,
      z,
      raiz: { position: { x, y: 0, z }, visible: true }
    };
    gurus.push(entrada);
    return entrada;
  }

  // Paso 1: Iniciar lugares secretos (5 cabañas con aldeano) ANTES de colocar gurús
  for (let c = 1; c <= 5; c++) {
    instanciarNpc({
      id: 'cabana-' + c,
      nombre: 'Aldeano Cabaña ' + c,
      servicio: 'cabana'
    }, 'guru-1', c * 50, c * 50, 0, 0);
  }

  assert.strictEqual(gurus.length, 5, 'Hay 5 aldeanos de cabaña registrados');

  // Paso 2: Ejecutar colocarGurus con la guarda reparada
  function colocarGurus() {
    if (gurusColocados || !world || !towns.length) return;
    const inicio = towns.find(o => o.t.isStart) || towns[0];
    if (!inicio) return;
    gurusColocados = true;
    const todos = GURUS.map((g, i) => ({ info: g, modelo: g.id, r: RADIO_PUESTOS, a: (i / 6) * Math.PI * 2 + 0.4 + Math.PI / 6 }))
      .concat(SERVICIOS.map((sv, i) => ({ info: sv, modelo: sv.modelo, r: RADIO_GURUS, a: Math.PI * (i ? 4 / 3 : 1 / 3) })));
    todos.forEach(item => {
      const x = inicio.t.x + Math.cos(item.a) * item.r, z = inicio.t.y + Math.sin(item.a) * item.r;
      instanciarNpc(item.info, item.modelo, x, z, inicio.t.x, inicio.t.y);
    });

    // En los demás pueblos, colocar también herrero y mercader locales
    towns.forEach(o => {
      if (o === inicio) return;
      SERVICIOS.forEach((sv, i) => {
        const infoLocal = {
          id: sv.id + '-' + o.t.id,
          modelo: sv.modelo,
          nombre: sv.nombre + ' (' + o.t.name + ')',
          tema: sv.tema,
          servicio: sv.servicio,
          frase: sv.frase
        };
        const a = Math.PI * (i ? 4 / 3 : 1 / 3);
        const x = o.t.x + Math.cos(a) * RADIO_GURUS, z = o.t.y + Math.sin(a) * RADIO_GURUS;
        instanciarNpc(infoLocal, sv.modelo, x, z, o.t.x, o.t.y);
      });
    });
  }

  colocarGurus();

  // Verificaciones
  // En pueblo inicial: 5 gurús + 2 servicios = 7 NPCs
  // En pueblo 2: 2 servicios = 2 NPCs
  // Total nuevos = 9 NPCs. Total en gurus = 5 + 9 = 14 NPCs.
  assert.strictEqual(gurus.length, 14, 'Se colocaron los 5 gurús y los servicios de forja y comercio en todos los pueblos');

  // Verificar presencia de los 5 gurús
  const gurusIds = GURUS.map(g => g.id);
  gurusIds.forEach(id => {
    const encontrado = gurus.find(g => g.info && g.info.id === id);
    assert.ok(encontrado, 'El gurú ' + id + ' está presente en la plaza');
  });

  // Verificar Herrero Brann y Mercader Tovi en el pueblo inicial
  const herrero = gurus.find(g => g.info && g.info.id === 'serv-herrero');
  assert.ok(herrero, 'El Herrero Brann está presente');
  assert.strictEqual(herrero.info.servicio, 'herrero');

  const mercader = gurus.find(g => g.info && g.info.id === 'serv-mercader');
  assert.ok(mercader, 'La Mercader Tovi está presente');
  assert.strictEqual(mercader.info.servicio, 'mercader');

  // Verificar servicios en segundo pueblo
  const herreroP2 = gurus.find(g => g.info && g.info.id === 'serv-herrero-pueblo-2');
  assert.ok(herreroP2, 'El Herrero del segundo pueblo está presente');

  const mercaderP2 = gurus.find(g => g.info && g.info.id === 'serv-mercader-pueblo-2');
  assert.ok(mercaderP2, 'La Mercader del segundo pueblo está presente');

  // Verificar servicioCercano()
  function servicioCercano(posHeroe) {
    let mejor = null, mejorD = 4; // DISTANCIA_HABLAR = 4
    gurus.forEach(g => {
      if (!g.info.servicio) return;
      const d = Math.hypot(posHeroe.x - g.raiz.position.x, posHeroe.z - g.raiz.position.z);
      if (d < mejorD) { mejorD = d; mejor = g; }
    });
    return mejor;
  }

  // Jugador situado a 1 metro del Herrero
  const servCercanoHerrero = servicioCercano({ x: herrero.x + 0.5, z: herrero.z + 0.5 });
  assert.ok(servCercanoHerrero, 'Detecta el servicio cercano');
  assert.strictEqual(servCercanoHerrero.info.servicio, 'herrero');
  assert.strictEqual(servCercanoHerrero.info.nombre, 'Herrero Brann');

  // Jugador situado a 1 metro de la Mercader
  const servCercanoMercader = servicioCercano({ x: mercader.x + 0.5, z: mercader.z + 0.5 });
  assert.ok(servCercanoMercader, 'Detecta el servicio cercano');
  assert.strictEqual(servCercanoMercader.info.servicio, 'mercader');
  assert.strictEqual(servCercanoMercader.info.nombre, 'Mercader Tovi');
});

test('los gurús, el herrero y la comerciante tienen armaduras y atuendos diferenciados y ninguno es blanco', () => {
  const fs = require('fs');
  const path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');

  // Extraer bloque ESTILOS_NPC de visor-mundo.html
  const iStart = html.indexOf('const ESTILOS_NPC = {');
  assert.ok(iStart > 0, 'Debe existir ESTILOS_NPC en visor-mundo.html');
  const iEnd = html.indexOf('function personalizarEstiloNpc', iStart);
  assert.ok(iEnd > iStart, 'Debe existir la función personalizarEstiloNpc');

  // Evaluar ESTILOS_NPC
  const code = html.substring(iStart, iEnd) + '\nreturn ESTILOS_NPC;';
  const ESTILOS_NPC = new Function(code)();

  // Conjunto de colores blancos o lavados
  const COLORES_BLANCOS_LAVADOS = new Set([
    0xffffff, 0xf8fafc, 0xf1f5f9, 0xfffbeb, 0xfdf4ff, 0xe2e8f0, 0xe0f2fe, 0xcbd5e1, 0xf0f9ff
  ]);

  const personajes = ['guru-1', 'guru-2', 'guru-3', 'guru-4', 'guru-5', 'serv-herrero', 'serv-mercader'];
  const armadurasVistas = new Set();
  const telasVistas = new Set();

  personajes.forEach(id => {
    const estilo = ESTILOS_NPC[id];
    assert.ok(estilo, 'Existe estilo definido para ' + id);
    assert.ok(typeof estilo.armadura === 'number', 'Armadura tiene color numérico en ' + id);
    assert.ok(typeof estilo.tela === 'number', 'Tela tiene color numérico en ' + id);

    // Ninguno debe ser blanco lavado
    assert.ok(!COLORES_BLANCOS_LAVADOS.has(estilo.armadura), 'La armadura de ' + id + ' no debe ser blanca');
    assert.ok(!COLORES_BLANCOS_LAVADOS.has(estilo.tela), 'La tela de ' + id + ' no debe ser blanca');

    armadurasVistas.add(estilo.armadura);
    telasVistas.add(estilo.tela);
  });

  // Verificar diferenciación: al menos 5 colores de armadura distintos entre los 7 personajes
  assert.ok(armadurasVistas.size >= 5, 'Los gurús y servicios deben tener armaduras claramente diferenciadas entre sí (encontradas: ' + armadurasVistas.size + ')');
  assert.ok(telasVistas.size >= 5, 'Los gurús y servicios deben tener telas y túnicas claramente diferenciadas entre sí (encontradas: ' + telasVistas.size + ')');

  // Verificar roles temáticos específicos
  assert.strictEqual(ESTILOS_NPC['serv-herrero'].armadura, 0x1f2937, 'Herrero usa hierro forjado oscuro');
  assert.strictEqual(ESTILOS_NPC['serv-herrero'].ribete, 0xea580c, 'Herrero tiene reflejos de fragua incandescente');
  assert.strictEqual(ESTILOS_NPC['serv-mercader'].tela, 0x047857, 'Mercader viste sedas verde esmeralda');
  assert.strictEqual(ESTILOS_NPC['guru-1'].tela, 0x1e3a8a, 'Sabia Elara viste azul noche arcano');
  assert.strictEqual(ESTILOS_NPC['guru-2'].tela, 0x14532d, 'Maestro Oren viste verde bosque de explorador');
  assert.strictEqual(ESTILOS_NPC['guru-5'].tela, 0x991b1b, 'Erudita Mirel viste escarlata noble');
});

test('personalizarEstiloNpc asigna colores temáticos a tela, armadura, faldón y botas sin colisión de subcadena', () => {
  const fs = require('fs');
  const path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');

  const iEstilos = html.indexOf('const ESTILOS_NPC = {');
  const iPers = html.indexOf('function personalizarEstiloNpc(entrada, modelo3D) {', iEstilos);
  const iAseg = html.indexOf('function asegurarVersionCercanaNpc', iPers);

  const code = html.substring(iEstilos, iAseg) + '\nreturn { ESTILOS_NPC, personalizarEstiloNpc };';
  const { ESTILOS_NPC, personalizarEstiloNpc } = new Function(code)();

  function makeMockMesh(matName) {
    const mat = {
      name: matName,
      color: {
        hex: 0xffffff,
        setHex(val) { this.hex = val; },
        getHexString() { return this.hex.toString(16).padStart(6, '0'); }
      }
    };
    mat.clone = function() {
      const copy = {
        name: this.name,
        color: {
          hex: this.color.hex,
          setHex(v) { this.hex = v; },
          getHexString() { return this.hex.toString(16).padStart(6, '0'); }
        }
      };
      copy.clone = mat.clone;
      return copy;
    };
    return {
      isMesh: true,
      name: 'fusion-' + matName,
      material: mat
    };
  }

  const meshes = [
    makeMockMesh('Material_12'),   // armadura
    makeMockMesh('Material_16'),   // tela principal
    makeMockMesh('Material_9'),    // ribete metálico
    makeMockMesh('Material_18'),   // faldón/capa
    makeMockMesh('Material_20'),   // botas
    makeMockMesh('Cabello_14'),    // cabello
    makeMockMesh('Material_5')     // piel
  ];

  const mockModel = {
    traverse(cb) { meshes.forEach(cb); }
  };

  // Probar con Sabia Elara (guru-1)
  const entradaElara = { info: { id: 'guru-1', nombre: 'Sabia Elara' }, nombreModelo: 'guru-1' };
  personalizarEstiloNpc(entradaElara, mockModel);

  const mat12 = meshes.find(m => m.material.name === 'Material_12');
  const mat16 = meshes.find(m => m.material.name === 'Material_16');
  const mat9 = meshes.find(m => m.material.name === 'Material_9');
  const mat20 = meshes.find(m => m.material.name === 'Material_20');
  const matCab = meshes.find(m => m.material.name === 'Cabello_14');

  // Armadura: Oro ceremonial (#d4af37)
  assert.strictEqual(mat12.material.color.hex, 0xd4af37, 'Armadura es oro ceremonial');
  // Tela: Azul noche (#1e3a8a) - NO DEBE SER ORO
  assert.strictEqual(mat16.material.color.hex, 0x1e3a8a, 'Tela es azul noche');
  // Ribete: Zafiro arcano (#38bdf8)
  assert.strictEqual(mat9.material.color.hex, 0x38bdf8, 'Ribete es zafiro');
  // Botas: Cuero marino (#1e293b)
  assert.strictEqual(mat20.material.color.hex, 0x1e293b, 'Botas son cuero marino');
  // Cabello: Platino (#94a3b8)
  assert.strictEqual(matCab.material.color.hex, 0x94a3b8, 'Cabello es platino');

  // Probar con Herrero Brann (serv-herrero)
  const entradaHerrero = { info: { id: 'serv-herrero', nombre: 'Herrero Brann', servicio: 'herrero' }, nombreModelo: 'guru-4' };
  personalizarEstiloNpc(entradaHerrero, mockModel);

  assert.strictEqual(mat12.material.color.hex, 0x1f2937, 'Herrero: Armadura de hierro forjado oscuro');
  assert.strictEqual(mat16.material.color.hex, 0x292524, 'Herrero: Mandil de cuero ahumado');
  assert.strictEqual(mat9.material.color.hex, 0xea580c, 'Herrero: Reflejos de fragua naranja fuego');
  assert.strictEqual(mat20.material.color.hex, 0x0c0a09, 'Herrero: Botas pesadas');
});

