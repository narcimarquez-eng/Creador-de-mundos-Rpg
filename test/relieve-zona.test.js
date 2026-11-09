const test = require('node:test');
const assert = require('node:assert');
const RelieveZonaLib = require('../js/relieve-zona.js');

test('RelieveZonaLib - Estructura de tipos y culminaciones', () => {
  assert.ok(RelieveZonaLib.TIPOS.desfiladero, 'Debe existir tipo desfiladero');
  assert.ok(RelieveZonaLib.TIPOS.laberinto, 'Debe existir tipo laberinto');
  assert.ok(RelieveZonaLib.TIPOS.crater, 'Debe existir tipo crater');
  assert.ok(RelieveZonaLib.TIPOS.meseta, 'Debe existir tipo meseta');
  assert.ok(RelieveZonaLib.TIPOS.barranco, 'Debe existir tipo barranco');

  assert.ok(RelieveZonaLib.CULMINACIONES.oasis, 'Debe existir culminación oasis');
  assert.ok(RelieveZonaLib.CULMINACIONES.jefe, 'Debe existir culminación jefe');
  assert.ok(RelieveZonaLib.CULMINACIONES.objeto_mision, 'Debe existir culminación objeto_mision');
  assert.ok(RelieveZonaLib.CULMINACIONES.santuario, 'Debe existir culminación santuario');
  assert.ok(RelieveZonaLib.CULMINACIONES.ninguno, 'Debe existir culminación ninguno');
});

test('RelieveZonaLib - Evaluación de punto y caminos', () => {
  const zona = {
    id: 'z1',
    name: 'Garganta del Eco',
    x: 100,
    y: 100,
    radius: 120,
    relieve: RelieveZonaLib.relievePorDefecto('desfiladero', 'oasis')
  };

  assert.strictEqual(RelieveZonaLib.zonaTieneRelieve(zona), true);

  // Punto muy lejano (fuera del radio)
  const fuera = RelieveZonaLib.evaluarPunto(zona, 500, 500);
  assert.strictEqual(fuera, null, 'Punto lejano no debe evaluarse');

  // Punto en el centro exacto (explanada central)
  const centro = RelieveZonaLib.evaluarPunto(zona, 100, 100);
  assert.ok(centro, 'Debe evaluar el centro');
  assert.strictEqual(centro.esClearing, true, 'El centro debe ser explanada/clearing');
  assert.strictEqual(centro.factorCamino, 1.0, 'El centro debe tener factorCamino 1.0');

  // Punto en el anillo de caminos
  const puntoCamino = RelieveZonaLib.evaluarPunto(zona, 150, 100);
  assert.ok(puntoCamino, 'Punto interior debe evaluarse');
  assert.strictEqual(puntoCamino.esClearing, false);
  assert.ok(puntoCamino.factorCamino >= 0 && puntoCamino.factorCamino <= 1);
});

test('RelieveZonaLib - Aplicar relieve modifica altura hBase suavemente', () => {
  const zonas = [
    {
      id: 'z1',
      name: 'Cañón Espinado',
      x: 0,
      y: 0,
      radius: 100,
      relieve: {
        activo: true,
        tipo: 'desfiladero',
        culminacion: 'jefe',
        profundidad: 20,
        recovecos: 3,
        anchoCamino: 10
      }
    }
  ];

  const hBase = 15.0;
  // Fuera de la zona
  const hFuera = RelieveZonaLib.aplicarRelieve(zonas, 300, 300, hBase);
  assert.strictEqual(hFuera, hBase, 'Fuera de la zona la altura no cambia');

  // Dentro de la zona
  const hDentro = RelieveZonaLib.aplicarRelieve(zonas, 40, 40, hBase);
  assert.notStrictEqual(hDentro, hBase, 'Dentro de la zona la altura debe ser modificada');
});

test('RelieveZonaLib - Splat de textura para caminos y riscos', () => {
  const zona = {
    id: 'z1',
    x: 0,
    y: 0,
    radius: 80,
    relieve: RelieveZonaLib.relievePorDefecto('laberinto', 'objeto_mision')
  };

  const evCamino = {
    factorCamino: 0.9,
    esClearing: false,
    culminacion: 'objeto_mision',
    wEdge: 1.0
  };

  const splatCamino = RelieveZonaLib.splatZona(evCamino, 20, 20, 0.1, 10, { splat: [1, 0, 0, 0], snow: 0 });
  // En camino debe predominar tierra/grava y roca moderada, sin ser hierba suave pura
  assert.ok(splatCamino.splat[1] > 0.3, 'Debe haber peso sustancial de tierra/grava');

  const evPared = {
    factorCamino: 0.0,
    esClearing: false,
    culminacion: 'objeto_mision',
    wEdge: 1.0
  };
  const splatPared = RelieveZonaLib.splatZona(evPared, 25, 25, 0.5, 25, { splat: [1, 0, 0, 0], snow: 0 });
  assert.ok(splatPared.splat[2] > 0.8, 'En paredes de roca debe predominar roca');
});
