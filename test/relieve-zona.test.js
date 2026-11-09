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
