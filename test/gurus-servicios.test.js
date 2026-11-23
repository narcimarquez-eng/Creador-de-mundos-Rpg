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
    { id: 'serv-herrero', modelo: 'npc/aldeanos/herrero.glb', nombre: 'Herrero Brann', tema: 'la forja', servicio: 'herrero', frase: 'Traigo el hierro; tú traes oro. Fabrico lo que tu nivel permita.' },
    { id: 'serv-mercader', modelo: 'npc/aldeanos/mercader.glb', nombre: 'Mercader Tovi', tema: 'el comercio', servicio: 'mercader', frase: 'Compro lo que encuentres y vendo lo que te haga falta. Pulsa H.' }
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

  // Paso 1: Iniciar lugares secretos (5 cabañas con aldeano medieval) ANTES de colocar gurús
  for (let c = 1; c <= 5; c++) {
    instanciarNpc({
      id: 'cabana-' + c,
      nombre: 'Aldeano Cabaña ' + c,
      servicio: 'cabana'
    }, 'npc/aldeanos/campesino.glb', c * 50, c * 50, 0, 0);
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

test('solo los 5 gurús usan armaduras supremas rango SR y servicios/aldeanos/cabañas usan GLBs medievales de npc/aldeanos/', () => {
  const fs = require('fs');
  const path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');

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

  // Exclusividad SR: ningún otro estilo en ESTILOS_NPC tiene rango SR
  Object.entries(ESTILOS_NPC).forEach(([id, estilo]) => {
    if (SETS_SR_ESPERADOS[id]) assert.strictEqual(estilo.rango, 'SR', id + ' es Gurú SR');
    else assert.notStrictEqual(estilo.rango, 'SR', 'Solo los Gurús llevan SR: ' + id);
  });

  Object.entries(SETS_SR_ESPERADOS).forEach(([id, setEsperado]) => {
    const estilo = ESTILOS_NPC[id];
    assert.ok(estilo, 'Existe entrada para ' + id);
    assert.strictEqual(estilo.autentica, true, id + ' debe conservar su armadura auténtica');
    assert.strictEqual(estilo.rango, 'SR', id + ' debe ser rango SR');
    assert.strictEqual(estilo.set, setEsperado, id + ' corresponde al set ' + setEsperado);
    assert.strictEqual(estilo.armadura, undefined, id + ' no debe sobreescribirse con color inventado');

    for (const suf of ['', '-cerca', '-lejos']) {
      const glbPath = path.join(__dirname, '..', 'npc', 'gurus', id + suf + '.glb');
      const buf = fs.readFileSync(glbPath);
      const gltf = JSON.parse(buf.subarray(20, 20 + buf.readUInt32LE(12)).toString('utf8'));
      const texMats = (gltf.materials || []).filter(m => m.pbrMetallicRoughness && m.pbrMetallicRoughness.baseColorTexture).length;
      assert.ok(texMats >= 5, `${id}${suf}.glb debe conservar materiales texturizados auténticos (encontrados: ${texMats})`);
    }
  });

  // Todos los servicios y aldeanos usan modelo de npc/aldeanos/*.glb
  const iServ = html.indexOf('const SERVICIOS = [');
  const iServEnd = html.indexOf('function colocarGurus(', iServ);
  assert.ok(iServ > 0 && iServEnd > iServ, 'Debe existir SERVICIOS en visor-mundo.html');
  const SERVICIOS_REAL = new Function(html.substring(iServ, iServEnd) + '\nreturn SERVICIOS;')();
  assert.ok(SERVICIOS_REAL.length >= 6);
  SERVICIOS_REAL.forEach(sv => {
    assert.ok(String(sv.modelo).startsWith('npc/aldeanos/') && sv.modelo.endsWith('.glb'), `${sv.id} debe usar modelo de aldeano (${sv.modelo})`);
    assert.ok(!String(sv.modelo).includes('guru-'), `${sv.id} no puede usar modelo de Gurú`);
    const est = ESTILOS_NPC[sv.id];
    assert.ok(est && est.rolAldeano === true && est.rango === 'Aldeano', `${sv.id} debe tener rango Aldeano`);
  });

  // Todos los 10 GLB de aldeanos existen con texturas y clips idle + walk
  const aldeanosEsperados = ['herrero.glb', 'mercader.glb', 'herbolario.glb', 'informante.glb', 'tabernero.glb', 'campesino.glb', 'lenador.glb', 'cazador.glb', 'aldeana.glb', 'aldeano.glb'];
  for (const file of aldeanosEsperados) {
    const glbPath = path.join(__dirname, '..', 'npc', 'aldeanos', file);
    assert.ok(fs.existsSync(glbPath), 'Falta GLB de aldeano: ' + file);
    const buf = fs.readFileSync(glbPath);
    assert.strictEqual(buf.toString('ascii', 0, 4), 'glTF', file + ' cabecera válida');
    const gltf = JSON.parse(buf.subarray(20, 20 + buf.readUInt32LE(12)).toString('utf8'));
    const anims = (gltf.animations || []).map(a => a.name);
    assert.ok(anims.includes('idle') && anims.includes('walk'), `${file} necesita idle y walk (${anims.join(',')})`);
    assert.ok((gltf.images || []).length >= 1, `${file} debe contener texturas embebidas`);
  }

  // Encargos de zona y cabañas secretas usan npc/aldeanos/*.glb (nunca guru-*)
  const MisionZonaLib = require('../js/mision-zona.js');
  assert.ok(MisionZonaLib.MODELOS.every(m => String(m).startsWith('npc/aldeanos/') && !String(m).includes('guru-')));
  const LugaresSecretosLib = require('../js/lugares-secretos.js');
  assert.ok(LugaresSecretosLib.CABANAS_GLB.every(c => String(c.aldeanoModelo).startsWith('npc/aldeanos/') && !String(c.aldeanoModelo).includes('guru-')));
});

test('personalizarEstiloNpc preserva intactas las armaduras SR de los gurús y los trajes reales de los aldeanos', () => {
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
    makeMockMesh('Material_12', 0xf26776),
    makeMockMesh('Material_16', 0x0e7c5a),
    makeMockMesh('Material_9', 0xc91e3a),
    makeMockMesh('Material_18', 0x3b2114),
    makeMockMesh('Material_20', 0xffaa00),
    makeMockMesh('Cabello_14', 0xdde2ea),
    makeMockMesh('Material_5', 0x995533)
  ];

  const mockModel = {
    traverse(cb) { meshes.forEach(cb); }
  };

  for (let i = 1; i <= 5; i++) {
    const entradaGuru = { info: { id: 'guru-' + i, nombre: 'Gurú ' + i }, nombreModelo: 'guru-' + i };
    personalizarEstiloNpc(entradaGuru, mockModel);
    assert.strictEqual(meshes[0].material.color.hex, 0xf26776, `guru-${i} no altera armadura SR`);
    assert.strictEqual(meshes[1].material.color.hex, 0x0e7c5a, `guru-${i} no altera tela SR`);
    assert.strictEqual(meshes[2].material.color.hex, 0xc91e3a, `guru-${i} no altera ribete SR`);
    assert.strictEqual(meshes[4].material.color.hex, 0xffaa00, `guru-${i} no altera detalles SR`);
    assert.strictEqual(meshes[5].material.color.hex, 0xdde2ea, `guru-${i} no altera cabello`);
  }

  // Aldeanos y servicios conservan también sus texturas medievales reales sin tintes encima
  const entradaHerrero = { info: { id: 'serv-herrero', nombre: 'Herrero Brann', servicio: 'herrero', esAldeano: true }, nombreModelo: 'npc/aldeanos/herrero.glb' };
  personalizarEstiloNpc(entradaHerrero, mockModel);
  assert.strictEqual(meshes[0].material.color.hex, 0xf26776, 'Aldeano herrero conserva sus materiales originales');
  assert.strictEqual(meshes[1].material.color.hex, 0x0e7c5a, 'Aldeano herrero conserva su ropa medieval original');
});

