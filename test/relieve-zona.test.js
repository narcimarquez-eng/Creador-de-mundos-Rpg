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
