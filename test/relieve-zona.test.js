const test = require('node:test');
const assert = require('node:assert');
const RelieveZonaLib = require('../js/relieve-zona.js');

test('RelieveZonaLib - Estructura de estilos y culminaciones de laberinto', () => {
  assert.ok(RelieveZonaLib.ESTILOS.roca_canion, 'Debe existir estilo roca_canion');
  assert.ok(RelieveZonaLib.ESTILOS.piedra_ruinas, 'Debe existir estilo piedra_ruinas');
  assert.ok(RelieveZonaLib.ESTILOS.laberinto_setos, 'Debe existir estilo laberinto_setos');

  assert.ok(RelieveZonaLib.CULMINACIONES.oasis, 'Debe existir culminación oasis');
  assert.ok(RelieveZonaLib.CULMINACIONES.jefe, 'Debe existir culminación jefe');
  assert.ok(RelieveZonaLib.CULMINACIONES.objeto_mision, 'Debe existir culminación objeto_mision');
  assert.ok(RelieveZonaLib.CULMINACIONES.santuario, 'Debe existir culminación santuario');
  assert.ok(RelieveZonaLib.CULMINACIONES.tesoro, 'Debe existir culminación tesoro');
});

test('RelieveZonaLib - Generación de laberinto con entrada y acceso garantizado a la meta central', () => {
  const lab = RelieveZonaLib.generarLaberinto(13, 9999);
  assert.strictEqual(lab.N, 13);
  assert.ok(lab.entrada, 'Debe tener punto de entrada');
  assert.strictEqual(lab.grid[lab.entrada.gy][lab.entrada.gx], 0, 'La entrada debe ser un camino transitable');

  // El centro (cámara de culminación) debe estar despejado
  const m = Math.floor(13 / 2);
  assert.strictEqual(lab.grid[m][m], 0, 'El centro debe ser transitable');
  assert.strictEqual(lab.grid[m - 1][m], 0, 'El acceso norte al centro debe ser transitable');
  assert.strictEqual(lab.grid[m + 1][m], 0, 'El acceso sur al centro debe ser transitable');

  // Debe haber muros sólidos (1)
  let countMuros = 0;
  for (let y = 0; y < 13; y++) {
    for (let x = 0; x < 13; x++) {
      if (lab.grid[y][x] === 1) countMuros++;
    }
  }
  assert.ok(countMuros > 20, 'Debe haber muros de laberinto estructurados');
});

test('RelieveZonaLib - Datos de laberinto y colisionadores espaciales O(1)', () => {
  const zona = {
    id: 'z_caza',
    name: 'Desfiladero de los Condenados',
    x: 200,
    y: 300,
    radius: 100,
    relieve: RelieveZonaLib.configPorDefecto('roca_canion', 'oasis')
  };

  const datos = RelieveZonaLib.obtenerDatosLaberinto(zona);
  assert.ok(datos);
  assert.strictEqual(datos.zonaId, 'z_caza');
  assert.ok(datos.colliders.length > 0, 'Debe generar cajas de colisión para los muros');
  assert.ok(Array.isArray(datos.celdasCamino) && datos.celdasCamino.length > 0, 'Debe registrar celdasCamino para spawnear monstruos en pasillos');
  assert.strictEqual(RelieveZonaLib.esCamino(zona, datos.entrada.wx, datos.entrada.wz), true, 'La entrada debe ser reconocida como camino');

  // Consulta de colisionadores en (200, 300) centro de la zona
  const cols = datos.obtenerColisionadores(200, 300);
  assert.ok(Array.isArray(cols), 'Debe retornar array de colisionadores');
});

test('RelieveZonaLib - Splatting de textura para pasillos y muros del laberinto', () => {
  const zona = {
    id: 'z1',
    x: 0,
    y: 0,
    radius: 80,
    relieve: RelieveZonaLib.configPorDefecto('roca_canion', 'objeto_mision')
  };
  const lab = RelieveZonaLib.obtenerDatosLaberinto(zona);

  // En el centro (cámara de reliquia ceremonial)
  const splatCentro = RelieveZonaLib.splatZona(lab, 0, 0, 0, 10, { splat: [1, 0, 0, 0] });
  assert.ok(splatCentro.splat[2] >= 0.5, 'En la cámara ceremonial debe predominar roca/losas');

  // En la entrada (pasillo)
  const splatPasillo = RelieveZonaLib.splatZona(lab, lab.entrada.wx, lab.entrada.wz, 0, 10, { splat: [1, 0, 0, 0] });
  assert.ok(splatPasillo.splat[1] >= 0.4, 'En los pasillos debe haber grava y tierra batida');
});

test('RelieveZonaLib - Esculpido de relieve de laberinto en terreno natural (aplicarRelieveTerreno)', () => {
  const zona = {
    id: 'z_canyon',
    name: 'Garganta de Piedra',
    x: 500,
    y: 500,
    radius: 90,
    relieve: RelieveZonaLib.configPorDefecto('roca_canion', 'oasis')
  };
  zona.relieve.alturaMuro = 11;
  const lab = RelieveZonaLib.obtenerDatosLaberinto(zona);

  // 1. Fuera de la zona: la altura base no se modifica
  const hFuera = RelieveZonaLib.aplicarRelieveTerreno([zona], 500, 500 + 130, 25.0);
  assert.strictEqual(hFuera, 25.0, 'Fuera de la zona el terreno natural no debe alterarse');

  // 2. En la entrada perimetral: el suelo conecta de forma suave con el terreno exterior
  const hEntrada = RelieveZonaLib.aplicarRelieveTerreno([zona], lab.entrada.wx, lab.entrada.wz, 25.0);
  assert.ok(hEntrada <= 25.0, 'La entrada al cañón debe ser transitable y ligeramente hundida');

  // 3. En la culminación central: el suelo es accesible
  const hCentro = RelieveZonaLib.aplicarRelieveTerreno([zona], lab.centro.wx, lab.centro.wz, 25.0);
  assert.ok(hCentro < 25.0 && hCentro >= 18.0, 'El oasis central debe ser una hondonada plana accesible');
});

test('RelieveZonaLib - Desnivel inescalable (>50% pendiente) en paredes de acantilado', () => {
  const zona = {
    id: 'z_canyon',
    x: 500,
    y: 500,
    radius: 90,
    relieve: RelieveZonaLib.configPorDefecto('roca_canion', 'oasis')
  };
  zona.relieve.alturaMuro = 12;
  const lab = RelieveZonaLib.obtenerDatosLaberinto(zona);

  // Buscar una celda de pasillo contigua a una de muro
  let ptPasillo = null, ptMuro = null;
  const { N, grid, cellSize, halfN, zx, zz } = lab;
  for (let gy = 1; gy < N - 1; gy++) {
    for (let gx = 1; gx < N - 1; gx++) {
      if (grid[gy][gx] === 0 && grid[gy][gx + 1] === 1) {
        ptPasillo = { x: zx + (gx - halfN) * cellSize, z: zz + (gy - halfN) * cellSize };
        ptMuro = { x: zx + (gx + 1 - halfN) * cellSize, z: zz + (gy - halfN) * cellSize };
        break;
      }
    }
    if (ptPasillo) break;
  }

  assert.ok(ptPasillo && ptMuro, 'Debe encontrarse una transición entre pasillo y muro');

  // Calcular desnivel y pendiente a lo largo de la transición
  const h0 = RelieveZonaLib.aplicarRelieveTerreno([zona], ptPasillo.x, ptPasillo.z, 20.0);
  const h1 = RelieveZonaLib.aplicarRelieveTerreno([zona], ptMuro.x, ptMuro.z, 20.0);
  const dist = Math.hypot(ptMuro.x - ptPasillo.x, ptMuro.z - ptPasillo.z);
  const pendiente = (h1 - h0) / dist;

  assert.ok(h1 > h0, 'El muro/cresta debe estar más alto que el pasillo');
  assert.ok(pendiente > 0.50, `La pendiente (${pendiente.toFixed(2)}) debe ser > 0.50 para que el personaje no pueda escalarla según su física`);
});

test('RelieveZonaLib - Escalado adaptativo con aumento de radio de la zona', () => {
  const zonaPequena = { id: 'z-peq', x: 0, y: 0, radius: 90, relieve: { activo: true } };
  const labPeq = RelieveZonaLib.obtenerDatosLaberinto(zonaPequena);
  assert.strictEqual(labPeq.R, 90, 'El radio del laberinto debe coincidir con el radio de la zona');
  assert.ok(labPeq.cellSize >= 10 && labPeq.cellSize <= 18, 'La celda debe mantener escala humana de pasillos (~12-16m)');

  const zonaGrande = { id: 'z-gra', x: 0, y: 0, radius: 280, relieve: { activo: true } };
  const labGra = RelieveZonaLib.obtenerDatosLaberinto(zonaGrande);
  assert.strictEqual(labGra.R, 280, 'Al aumentar el radio de la zona, el laberinto debe abarcar los 280m sin quedar limitado a 120m');
  assert.ok(labGra.N >= 17, 'El número de celdas debe aumentar adaptativamente para no crear pasillos sobredimensionados');
  assert.ok(labGra.cellSize >= 12 && labGra.cellSize <= 24, 'La celda mantiene escala caminable');
});

test('RelieveZonaLib - Soporte para bucles, entrada configurable y celdas manuales', () => {
  const { N, grid, entrada } = RelieveZonaLib.generarLaberinto(13, 9999, {
    bucleChance: 0.35,
    entradaDir: 'norte',
    murosManuales: { '2_2': 1, '4_4': 0 }
  });
  assert.strictEqual(entrada.gy, 0, 'La entrada al norte debe situarse en gy=0');
  assert.strictEqual(grid[2][2], 1, 'La celda 2_2 debe respetar la modificación manual de muro');
  assert.strictEqual(grid[4][4], 0, 'La celda 4_4 debe respetar la modificación manual de pasillo');
});

test('RelieveZonaLib - Soporte para múltiples entradas simultáneas', () => {
  const { N, grid, entradas } = RelieveZonaLib.generarLaberinto(13, 8888, {
    entradas: ['sur', 'norte', 'este', 'oeste']
  });
  assert.strictEqual(entradas.length, 4, 'Debe registrar las 4 entradas');
  entradas.forEach(ent => {
    assert.strictEqual(grid[ent.gy][ent.gx], 0, `La entrada ${ent.dir} debe ser transitable (0)`);
  });
});

test('RelieveZonaLib - Rotación arbitraria del laberinto y alineación de coordenadas', () => {
  const zona = {
    id: 'z-rot',
    x: 100,
    y: 100,
    radius: 120,
    relieve: {
      activo: true,
      rotacion: 90,
      entradas: ['sur']
    }
  };
  const lab = RelieveZonaLib.obtenerDatosLaberinto(zona);
  assert.strictEqual(lab.rotacion, 90, 'Debe registrar rotación de 90 grados');
  assert.ok(lab.entradas.length >= 1, 'Debe contener las entradas');
  assert.ok(typeof lab.mundoACelda === 'function', 'Debe proveer transformación inversa mundoACelda');

  // Comprobar que en la entrada rotada es camino transitable
  const ent = lab.entradas[0];
  assert.strictEqual(RelieveZonaLib.esCamino(zona, ent.wx, ent.wz), true, 'La entrada rotada debe ser transitable');
});

test('WorldCore - Generación de caminos entre pueblos y laberintos de caza', () => {
  const W = require('../js/world-core.js');
  const world = W.emptyWorld(42);
  const town = W.createTown(world, 0, 0, { name: 'Pueblo Test' });
  const zone = W.createZone(world, 300, 400, {
    name: 'Laberinto Olvidado',
    radius: 100,
    relieve: { activo: true, rotacion: 45, entradas: ['sur', 'norte'] }
  });

  const road = W.createRoad(world, town.id, zone.id);
  assert.ok(road, 'Debe crear el camino entre pueblo y laberinto');
  assert.strictEqual(road.from, town.id);
  assert.strictEqual(road.to, zone.id);
  assert.ok(road.points.length >= 2, 'Debe generar polilínea de puntos');

  const startPt = road.points[0];
  const endPt = road.points[road.points.length - 1];
  assert.ok(Math.hypot(startPt.x - town.x, startPt.y - town.y) < 5, 'El inicio del camino debe comenzar en el pueblo');
  // El fin del camino debe llegar al laberinto (a una de sus entradas)
  const distLab = Math.hypot(endPt.x - zone.x, endPt.y - zone.y);
  assert.ok(distLab < 150, 'El camino debe llegar a la zona del laberinto');
});

test('RelieveZonaLib - Patrones de monstruos por color con clases, niveles y obtención por celda', () => {
  const zona = {
    id: 'z-patrones',
    x: 150,
    y: 250,
    radius: 120,
    relieve: {
      activo: true,
      N: 13,
      patronesMonstruos: {
        p_arq: { id: 'p_arq', color: '#ef4444', name: 'Arquero del Abismo', clase: 'arquero', levelMin: 12, levelMax: 16, count: 2, icono: '🏹' },
        p_mag: { id: 'p_mag', color: '#8b5cf6', name: 'Nigromante Oscuro', clase: 'mago', levelMin: 15, levelMax: 20, count: 1, icono: '🔮' }
      },
      celdasMonstruos: {
        '2_3': 'p_arq',
        '2_4': 'p_arq',
        '3_3': 'p_mag'
      }
    }
  };

  const lista = RelieveZonaLib.obtenerMonstruosPorCelda(zona);
  assert.ok(Array.isArray(lista), 'Debe retornar un array de monstruos');
  // 2 celdas con p_arq (count 2 = 4) + 1 celda con p_mag (count 1 = 1) = 5 monstruos
  assert.strictEqual(lista.length, 5, 'Debe generar exactamente la cantidad de monstruos configurada por celda');

  const arq = lista.find(m => m.clase === 'arquero');
  assert.ok(arq, 'Debe haber monstruos de clase arquero');
  assert.strictEqual(arq.name, 'Arquero del Abismo');
  assert.strictEqual(arq.color, '#ef4444');
  assert.ok(arq.level >= 12 && arq.level <= 16, 'Nivel debe estar dentro del rango configurado');

  const mag = lista.find(m => m.clase === 'mago');
  assert.ok(mag, 'Debe haber monstruos de clase mago');
  assert.strictEqual(mag.name, 'Nigromante Oscuro');
  assert.strictEqual(mag.color, '#8b5cf6');
  assert.ok(mag.level >= 15 && mag.level <= 20, 'Nivel debe estar dentro del rango configurado');
});

test('RelieveZonaLib - Protección contra perforación bajo el nivel del mar', () => {
  const zona = {
    id: 'z-mar',
    x: 0,
    y: 0,
    radius: 100,
    relieve: {
      activo: true,
      profundidad: 8.0
    }
  };

  // Terreno en cota baja costera (0.4m sobre el nivel del mar)
  const hResultado = RelieveZonaLib.aplicarRelieveTerreno([zona], 0, 0, 0.4);
  assert.ok(hResultado >= 1.2, `La cota resultante (${hResultado}) nunca debe excavar bajo el nivel del mar (<1.2)`);
});

test('RelieveZonaLib - Múltiples monstruos por casilla (hasta 8) con formación táctica sin colisión', () => {
  const zona = {
    id: 'z-horda',
    x: 100,
    y: 200,
    radius: 120,
    relieve: {
      activo: true,
      tamGrid: 11,
      patronesMonstruos: {
        horda_elite: {
          id: 'horda_elite',
          name: 'Horda de Goblins',
          color: '#f97316',
          clase: 'rapido',
          levelMin: 14,
          levelMax: 20,
          count: 8
        }
      },
      celdasMonstruos: {
        '5_3': 'horda_elite'
      }
    }
  };

  const lista = RelieveZonaLib.obtenerMonstruosPorCelda(zona);
  assert.strictEqual(lista.length, 8, 'Debe generar exactamente 8 monstruos en la casilla');

  // Verificar que ninguno tiene coordenadas idénticas (formación táctica sin superposición)
  const posiciones = new Set();
  lista.forEach((m, idx) => {
    assert.strictEqual(m.totalInCell, 8);
    assert.strictEqual(m.index, idx);
    assert.ok(m.level >= 14 && m.level <= 20, `Nivel ${m.level} debe estar en el rango [14, 20]`);
    const keyPos = `${m.wx.toFixed(2)}_${m.wz.toFixed(2)}`;
    assert.ok(!posiciones.has(keyPos), `El monstruo ${idx} no debe solaparse exactamente con otro en ${keyPos}`);
    posiciones.add(keyPos);
  });
});

test('RelieveZonaLib - Las casillas de monstruos quedan libres de colisionadores de muros y transitables', () => {
  const zona = {
    id: 'z-muros-libres',
    x: 450,
    y: 700,
    radius: 120,
    relieve: {
      activo: true,
      tamGrid: 11,
      patronesMonstruos: {
        p_arquero: {
          id: 'p_arquero',
          name: 'Arquero Elfico',
          color: '#3b82f6',
          clase: 'arquero',
          levelMin: 12,
          count: 2
        }
      },
      celdasMonstruos: {
        '2_2': 'p_arquero',
        '8_8': 'p_arquero'
      }
    }
  };

  const lab = RelieveZonaLib.obtenerDatosLaberinto(zona);
  assert.ok(lab, 'Debe generar datos de laberinto');

  // Comprobar que las celdas asignadas tienen grid = 0
  assert.strictEqual(lab.grid[2][2], 0, 'La celda 2,2 debe ser camino (0)');
  assert.strictEqual(lab.grid[8][8], 0, 'La celda 8,8 debe ser camino (0)');

  // Ningún muro/collider debe generarse en gx=2,gy=2 ni en gx=8,gy=8
  const colliderEn22 = lab.colliders.find(c => c.gx === 2 && c.gy === 2);
  const colliderEn88 = lab.colliders.find(c => c.gx === 8 && c.gy === 8);
  assert.strictEqual(colliderEn22, undefined, 'No debe haber collider de muro en la celda de monstruos 2,2');
  assert.strictEqual(colliderEn88, undefined, 'No debe haber collider de muro en la celda de monstruos 8,8');

  // Las coordenadas de los monstruos deben coincidir con la zona y estar distribuidas
  const mons = RelieveZonaLib.obtenerMonstruosPorCelda(zona);
  assert.strictEqual(mons.length, 4, 'Deben ser 4 monstruos (2 casillas × 2)');
  mons.forEach(m => {
    // Debe estar dentro del radio de la zona respecto a su centro (450, 700)
    const distCentro = Math.hypot(m.wx - 450, m.wz - 700);
    assert.ok(distCentro < 120, `El monstruo debe estar dentro del radio de la zona, dist: ${distCentro}`);
    // No debe estar cerca de (0, 0)
    const distOrigen = Math.hypot(m.wx, m.wz);
    assert.ok(distOrigen > 100, `El monstruo no debe estar acumulado en el origen (0,0), dist: ${distOrigen}`);
  });
});

test('RelieveZonaLib - Vectores de entrada única y cálculo de progreso en estrechamiento 100m', () => {
  const zona = {
    id: 'z_corredor',
    x: 300,
    y: 400,
    radius: 120,
    relieve: {
      activo: true,
      radio: 120,
      entradas: ['sur']
    }
  };

  const lab = RelieveZonaLib.obtenerDatosLaberinto(zona);
  assert.ok(lab, 'Debe generar datos de laberinto');
  assert.ok(lab.P_perim, 'Debe calcular P_perim');
  assert.ok(lab.P_ext, 'Debe calcular P_ext');
  assert.ok(lab.u_in, 'Debe calcular u_in');
  assert.ok(lab.v_lat, 'Debe calcular v_lat');

  // La distancia entre P_ext y P_perim debe ser exactamente 100m
  const distLargo = Math.hypot(lab.P_perim.wx - lab.P_ext.wx, lab.P_perim.wz - lab.P_ext.wz);
  assert.ok(Math.abs(distLargo - 100) < 0.5, `La longitud del estrechamiento debe ser 100m, obtenido: ${distLargo}`);

  // Progreso en P_ext debe ser s = 0m
  const pExt = RelieveZonaLib.calcularProgresoCorredor(lab, lab.P_ext.wx, lab.P_ext.wz);
  assert.ok(Math.abs(pExt.s) < 0.1, `Progreso en la entrada exterior debe ser s=0, obtenido: ${pExt.s}`);
  assert.strictEqual(pExt.mitadCruzada, false, 'En s=0 no debe haber cruzado la mitad');

  // Progreso a la mitad del corredor (50m)
  const midX = (lab.P_ext.wx + lab.P_perim.wx) / 2;
  const midZ = (lab.P_ext.wz + lab.P_perim.wz) / 2;
  const pMid = RelieveZonaLib.calcularProgresoCorredor(lab, midX, midZ);
  assert.ok(Math.abs(pMid.s - 50) < 0.1, `Progreso a la mitad debe ser s=50, obtenido: ${pMid.s}`);
  assert.strictEqual(pMid.mitadCruzada, true, 'En s=50 debe haber cruzado la mitad');
  assert.strictEqual(pMid.enCorredor, true, 'Debe estar dentro del corredor');

  // Progreso en P_perim (100m)
  const pPerim = RelieveZonaLib.calcularProgresoCorredor(lab, lab.P_perim.wx, lab.P_perim.wz);
  assert.ok(Math.abs(pPerim.s - 100) < 0.1, `Progreso en el perímetro debe ser s=100, obtenido: ${pPerim.s}`);
});

test('RelieveZonaLib - Estrechamiento 100m sin collider bloqueador transversal en la entrada', () => {
  // Simulador ligero de THREE
  const mockThree = {
    Group: function() { this.children = []; this.add = function(...args) { this.children.push(...args); }; this.position = { set: () => {} }; this.rotation = { y: 0 }; },
    Mesh: function() { this.position = { set: () => {} }; this.rotation = { y: 0 }; },
    PlaneGeometry: function() { this.rotateX = () => this; },
    BoxGeometry: function() {},
    CylinderGeometry: function() { this.rotateZ = () => this; },
    ConeGeometry: function() {},
    OctahedronGeometry: function() {},
    MeshStandardMaterial: function() {},
    MeshBasicMaterial: function() {},
    PointLight: function() { this.position = { set: () => {} }; },
    Color: function() { this.setHSL = () => this; this.getHSL = (o) => { o.h = 0; o.s = 0; o.l = 0.5; }; }
  };

  const estr = RelieveZonaLib.crearEstrechamiento100m(mockThree, 'roca_canion', '#78716c', '#57534e');
  assert.ok(estr, 'Debe crear estrechamiento');
  assert.strictEqual(estr.largo, 100, 'Largo debe ser 100m');
  assert.strictEqual(estr.anchoPaso, 12, 'Ancho de paso libre debe ser 12m');

  // Verificar que NO existe ningún collider transversal en z = -100 bloqueando la entrada
  const blockerZ100 = estr.colliders.find(c => c.minZ <= -99 && c.maxZ >= -100 && c.minX < 0 && c.maxX > 0);
  assert.strictEqual(blockerZ100, undefined, 'No debe existir collider transversal en z=-100 bloqueando el acceso al pasillo');

  // Los colisionadores deben ser únicamente para los muros laterales izquierdo y derecho
  assert.strictEqual(estr.colliders.length, 2, 'Solo debe haber 2 colisionadores (muro lateral izquierdo y derecho)');
});

test('RelieveZonaLib - Muro perimetral circular de diferente colores con apertura de entrada única', () => {
  const mockThree = {
    Group: function() { this.children = []; this.add = function(...args) { this.children.push(...args); }; this.position = { set: () => {} }; this.rotation = { y: 0 }; },
    Mesh: function() { this.position = { set: () => {} }; this.rotation = { y: 0 }; },
    BoxGeometry: function() {},
    MeshStandardMaterial: function() {},
    Color: function(c) {
      this.c = c;
      this.clone = function() { return new mockThree.Color(this.c); };
      this.getHSL = function(o) { o.h = 0.5; o.s = 0.5; o.l = 0.5; };
      this.setHSL = function(h, s, l) { return this; };
    }
  };

  const R = 120;
  const thetaEnt = Math.PI / 2; // Sur
  const perim = RelieveZonaLib.crearMuroPerimetralCircular(mockThree, 100, 200, 15, R, thetaEnt, 'roca_canion', '#78716c', 64);
  assert.ok(perim, 'Debe crear muro perimetral circular');
  assert.ok(perim.grupo, 'Debe tener grupo THREE');
  assert.ok(perim.colliders.length > 0, 'Debe generar colisionadores para el perímetro');

  // El anillo debe dejar una brecha abierta en la entrada (thetaEnt)
  assert.ok(perim.colliders.length < 64, 'Debe omitir segmentos en la entrada para dejar el paso libre');
});

