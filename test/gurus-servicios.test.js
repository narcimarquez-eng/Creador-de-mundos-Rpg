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

test('los 5 gurús usan armaduras auténticas rango SR y los servicios conservan tintes diferenciados sin blancos lavados', () => {
  const fs = require('fs');
  const path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');

  // Extraer bloque ESTILOS_NPC de visor-mundo.html
  const iStart = html.indexOf('const ESTILOS_NPC = {');
  assert.ok(iStart > 0, 'Debe existir ESTILOS_NPC en visor-mundo.html');
  const iEnd = html.indexOf('function personalizarEstiloNpc', iStart);
  assert.ok(iEnd > iStart, 'Debe existir la función personalizarEstiloNpc');

  const code = html.substring(iStart, iEnd) + '\nreturn ESTILOS_NPC;';
  const ESTILOS_NPC = new Function(code)();

  const SETS_SR_ESPERADOS = {
    'guru-1': 'Dinastía Celestial',
    'guru-2': 'Fénix Ígneo Ligero',
    'guru-3': 'Archimago Cósmico',
    'guru-4': 'Soberano de Vacío',
    'guru-5': 'Serafín Ligero de Mithril'
  };

  Object.entries(SETS_SR_ESPERADOS).forEach(([id, setEsperado]) => {
    const estilo = ESTILOS_NPC[id];
    assert.ok(estilo, 'Existe entrada para ' + id);
    assert.strictEqual(estilo.autentica, true, id + ' debe conservar su armadura auténtica');
    assert.strictEqual(estilo.rango, 'SR', id + ' debe ser rango SR');
    assert.strictEqual(estilo.set, setEsperado, id + ' corresponde al set ' + setEsperado);
    assert.strictEqual(estilo.armadura, undefined, id + ' no debe sobreescribirse con color inventado');

    // Verificar también que el GLB real y su versión -cerca tienen texturas PBR reales embebidas
    for (const suf of ['', '-cerca', '-lejos']) {
      const glbPath = path.join(__dirname, '..', 'npc', 'gurus', id + suf + '.glb');
      const buf = fs.readFileSync(glbPath);
      const gltf = JSON.parse(buf.subarray(20, 20 + buf.readUInt32LE(12)).toString('utf8'));
      const texMats = (gltf.materials || []).filter(m => m.pbrMetallicRoughness && m.pbrMetallicRoughness.baseColorTexture).length;
      assert.ok(texMats >= 5, `${id}${suf}.glb debe conservar materiales texturizados auténticos (encontrados: ${texMats})`);
    }
  });

  // Servicios mantienen tintes de rol diferenciados y ninguno blanco lavado
  const COLORES_BLANCOS_LAVADOS = new Set([
    0xffffff, 0xf8fafc, 0xf1f5f9, 0xfffbeb, 0xfdf4ff, 0xe2e8f0, 0xe0f2fe, 0xcbd5e1, 0xf0f9ff
  ]);
  for (const id of ['serv-herrero', 'serv-mercader', 'serv-informante', 'serv-boticaria', 'serv-comandante', 'serv-hereje']) {
    const estilo = ESTILOS_NPC[id];
    assert.ok(estilo && typeof estilo.armadura === 'number' && typeof estilo.tela === 'number', 'Servicio ' + id + ' tiene estilo numérico');
    assert.ok(!COLORES_BLANCOS_LAVADOS.has(estilo.armadura), 'La armadura de ' + id + ' no debe ser blanca');
    assert.ok(!COLORES_BLANCOS_LAVADOS.has(estilo.tela), 'La tela de ' + id + ' no debe ser blanca');
  }

  assert.strictEqual(ESTILOS_NPC['serv-herrero'].armadura, 0x1f2937, 'Herrero usa hierro forjado oscuro');
  assert.strictEqual(ESTILOS_NPC['serv-herrero'].ribete, 0xea580c, 'Herrero tiene reflejos de fragua incandescente');
  assert.strictEqual(ESTILOS_NPC['serv-mercader'].tela, 0x047857, 'Mercader viste sedas verde esmeralda');
});

test('personalizarEstiloNpc preserva intactas las armaduras SR de los gurús y aplica tintes solo a servicios', () => {
  const fs = require('fs');
  const path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');

  const iEstilos = html.indexOf('const ESTILOS_NPC = {');
  const iPers = html.indexOf('function personalizarEstiloNpc(entrada, modelo3D) {', iEstilos);
  const iAseg = html.indexOf('function asegurarVersionCercanaNpc', iPers);

  const code = html.substring(iEstilos, iAseg) + '\nreturn { ESTILOS_NPC, personalizarEstiloNpc };';
  const { personalizarEstiloNpc } = new Function(code)();

  function makeMockMesh(matName, initialHex = 0xabcdef) {
    const mat = {
      name: matName,
      color: {
        hex: initialHex,
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
    makeMockMesh('Material_12', 0xf26776),   // armadura SR auténtica
    makeMockMesh('Material_16', 0x0e7c5a),   // tela SR auténtica
    makeMockMesh('Material_9', 0xc91e3a),    // ribete metálico SR
    makeMockMesh('Material_18', 0x3b2114),   // faldón/capa SR
    makeMockMesh('Material_20', 0xffaa00),   // detalle emisivo/botas
    makeMockMesh('Cabello_14', 0xdde2ea),    // cabello
    makeMockMesh('Material_5', 0x995533)     // piel
  ];

  const mockModel = {
    traverse(cb) { meshes.forEach(cb); }
  };

  // Probar con los 5 gurús: ninguno debe ver sobreescritos sus colores originales del GLB SR
  for (let i = 1; i <= 5; i++) {
    const entradaGuru = { info: { id: 'guru-' + i, nombre: 'Gurú ' + i }, nombreModelo: 'guru-' + i };
    personalizarEstiloNpc(entradaGuru, mockModel);
    assert.strictEqual(meshes[0].material.color.hex, 0xf26776, `guru-${i} no altera armadura SR`);
    assert.strictEqual(meshes[1].material.color.hex, 0x0e7c5a, `guru-${i} no altera tela SR`);
    assert.strictEqual(meshes[2].material.color.hex, 0xc91e3a, `guru-${i} no altera ribete SR`);
    assert.strictEqual(meshes[4].material.color.hex, 0xffaa00, `guru-${i} no altera detalles SR`);
    assert.strictEqual(meshes[5].material.color.hex, 0xdde2ea, `guru-${i} no altera cabello`);
  }

  // Probar con Herrero Brann (serv-herrero): sí recibe su tinte de servicio
  const entradaHerrero = { info: { id: 'serv-herrero', nombre: 'Herrero Brann', servicio: 'herrero' }, nombreModelo: 'guru-4' };
  personalizarEstiloNpc(entradaHerrero, mockModel);

  assert.strictEqual(meshes[0].material.color.hex, 0x1f2937, 'Herrero: Armadura de hierro forjado oscuro');
  assert.strictEqual(meshes[1].material.color.hex, 0x292524, 'Herrero: Mandil de cuero ahumado');
  assert.strictEqual(meshes[2].material.color.hex, 0xea580c, 'Herrero: Reflejos de fragua naranja fuego');
  assert.strictEqual(meshes[4].material.color.hex, 0x0c0a09, 'Herrero: Botas pesadas');
});

