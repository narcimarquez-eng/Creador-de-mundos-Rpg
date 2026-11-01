const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const {
  GestorCargaArchivos,
  formatearMB,
  parsearRuta,
  buscarTamanoBytes,
  TABLA_PESOS_LOCALES
} = require('../js/carga-archivos.js');

test('formatearMB: convierte bytes a cadenas legibles en megas', () => {
  assert.strictEqual(formatearMB(0), '0.00 MB');
  assert.strictEqual(formatearMB(null), '0.00 MB');
  assert.strictEqual(formatearMB(18504700), '17.6 MB'); // 17.65 MB redondeado
  assert.strictEqual(formatearMB(3469232), '3.31 MB');
  assert.strictEqual(formatearMB(1613125), '1.54 MB');
  assert.strictEqual(formatearMB(124312), '0.12 MB');
  assert.strictEqual(formatearMB(512), '1 KB');
});

test('parsearRuta: clasifica correctamente nombre, carpeta y tipo de asset', () => {
  const p1 = parsearRuta('glb/mazmorras/mazmorra1.glb?v=123');
  assert.strictEqual(p1.nombre, 'mazmorra1.glb');
  assert.strictEqual(p1.carpeta, 'mazmorra');
  assert.strictEqual(p1.tipo, '3D / GLB');

  const p2 = parsearRuta('glb/cabanas/cabana_1_troncos_clasica.glb');
  assert.strictEqual(p2.nombre, 'cabana_1_troncos_clasica.glb');
  assert.strictEqual(p2.carpeta, 'cabaña');
  assert.strictEqual(p2.tipo, '3D / GLB');

  const p3 = parsearRuta('assets/terreno/atlas.jpg');
  assert.strictEqual(p3.nombre, 'atlas.jpg');
  assert.strictEqual(p3.carpeta, 'terreno');
  assert.strictEqual(p3.tipo, 'Textura');

  const p4 = parsearRuta('npc/gurus/guru-1.glb');
  assert.strictEqual(p4.nombre, 'guru-1.glb');
  assert.strictEqual(p4.carpeta, 'npc');
  assert.strictEqual(p4.tipo, '3D / GLB');
});

test('TABLA_PESOS_LOCALES: contiene los assets clave del juego con tamaños válidos', () => {
  assert(TABLA_PESOS_LOCALES['glb/mazmorras/mazmorra1.glb'] > 15000000);
  assert(TABLA_PESOS_LOCALES['mazmorra1.glb'] > 15000000);
  assert(TABLA_PESOS_LOCALES['glb/cabanas/cabana_1_troncos_clasica.glb'] > 3000000);
  assert(TABLA_PESOS_LOCALES['assets/terreno/atlas.jpg'] > 1000000);
});

test('GestorCargaArchivos: estado inicial desplegado por defecto (abierto: true)', () => {
  const gestor = new GestorCargaArchivos();
  assert.strictEqual(gestor.abierto, true, 'El desplegable debe iniciar desplegado por defecto');
  assert.strictEqual(gestor.visible, true, 'Debe iniciar visible');
  assert.strictEqual(gestor.archivos.size, 0);
});

test('GestorCargaArchivos: registrarInicio y registrarFin con cálculo de MB y totales', () => {
  const gestor = new GestorCargaArchivos();

  // Registrar inicio de 2 archivos
  const r1 = gestor.registrarInicio('glb/mazmorras/mazmorra1.glb');
  assert.strictEqual(r1.estado, 'cargando');
  assert(r1.bytes > 18000000, 'Debe detectar el tamaño de 18.5 MB');

  const r2 = gestor.registrarInicio('glb/cabanas/cabana_1_troncos_clasica.glb');
  assert.strictEqual(r2.estado, 'cargando');
  assert(r2.bytes > 3400000, 'Debe detectar el tamaño de 3.3 MB');

  let res = gestor.obtenerResumen();
  assert.strictEqual(res.total, 2);
  assert.strictEqual(res.enCargaCount, 2);
  assert.strictEqual(res.cargadosCount, 0);
  assert(res.pesoTotalMB > 20, 'El peso total combinado debe superar los 20 MB');
  assert.strictEqual(res.pesoCargadoMB, 0);
  assert.strictEqual(res.pct, 0);

  // Completar el primer archivo
  gestor.registrarFin('glb/cabanas/cabana_1_troncos_clasica.glb', true);
  res = gestor.obtenerResumen();
  assert.strictEqual(res.enCargaCount, 1);
  assert.strictEqual(res.cargadosCount, 1);
  assert(res.pesoCargadoMB > 3.0, 'El peso cargado debe reflejar los 3.3 MB');
  assert(res.pct > 10, 'El porcentaje debe incrementarse');

  // Completar el segundo archivo
  gestor.registrarFin('glb/mazmorras/mazmorra1.glb', true);
  res = gestor.obtenerResumen();
  assert.strictEqual(res.enCargaCount, 0);
  assert.strictEqual(res.cargadosCount, 2);
  assert.strictEqual(res.pct, 100);
  assert.strictEqual(res.todoListo, true);
});

test('GestorCargaArchivos: integración con Three.js LoadingManager mock', () => {
  const gestor = new GestorCargaArchivos();
  const mockManager = {
    itemStart: () => {},
    itemEnd: () => {},
    itemError: () => {}
  };

  gestor.conectarManager(mockManager);

  // Simular evento itemStart emitido por Three.js
  mockManager.itemStart('assets/terreno/atlas.jpg');
  assert.strictEqual(gestor.archivos.size, 1);
  const item = gestor.archivos.get('atlas.jpg');
  assert(item !== undefined);
  assert.strictEqual(item.estado, 'cargando');
  assert(item.bytes > 1500000);

  // Simular itemEnd
  mockManager.itemEnd('assets/terreno/atlas.jpg');
  assert.strictEqual(item.estado, 'cargado');
  const res = gestor.obtenerResumen();
  assert.strictEqual(res.todoListo, true);
  assert(res.pesoCargadoMB > 1.5);
});

test('GestorCargaArchivos: cerrar y abrir alternan visibilidad correctamente', () => {
  const gestor = new GestorCargaArchivos();
  gestor.cerrar();
  assert.strictEqual(gestor.visible, false);
  gestor.abrir();
  assert.strictEqual(gestor.visible, true);
});
