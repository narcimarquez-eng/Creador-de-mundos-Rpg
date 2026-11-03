const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Puestos de mercado GLB: existencia de los 4 modelos de puesto y peso ligero', () => {
  const dirPuestos = path.join(__dirname, '..', 'glb', 'puestos');
  assert.ok(fs.existsSync(dirPuestos), 'La carpeta glb/puestos debe existir');

  const modelosEsperados = [
    'puesto_armas.glb',
    'puesto_frutas.glb',
    'puesto_libros.glb',
    'puesto_pescado.glb'
  ];

  modelosEsperados.forEach(f => {
    const fullPath = path.join(dirPuestos, f);
    assert.ok(fs.existsSync(fullPath), `El modelo ${f} debe existir`);
    const size = fs.statSync(fullPath).size;
    assert.ok(size > 10000 && size < 500000, `El modelo ${f} debe ser ligero (optimizado para web, entre 10KB y 500KB). Tamaño actual: ${size} bytes`);
  });
});

test('VillageCore: eliminación de puestos antiguos y uso de puestos GLB con ciclo de vida completo', () => {
  const villageCorePath = path.join(__dirname, '..', 'js', 'village-core.js');
  const code = fs.readFileSync(villageCorePath, 'utf8');

  // 1. Verificación de que no se use this.group (que no existe)
  assert.ok(!code.includes('this.group.add(puestosGrupo)'), 'No debe intentar llamar this.group.add');
  assert.ok(code.includes('this.scene.add(puestosGrupo)'), 'Debe agregar puestosGrupo a this.scene');
  assert.ok(code.includes('this.objects.push(puestosGrupo)'), 'Debe registrar puestosGrupo en this.objects para su limpieza en destroy()/clear()');

  // 2. Verificación de que los puestos GLB oculten los puestos antiguos
  assert.ok(code.includes('if (iStall) iStall.visible = false'), 'Al agregarse los puestos GLB se deben ocultar los puestos antiguos');

  // 3. Verificación de datos incrustados Base64 para compatibilidad offline y file:///
  const puestosDatosPath = path.join(__dirname, '..', 'js', 'puestos-datos.js');
  assert.ok(fs.existsSync(puestosDatosPath), 'Debe existir js/puestos-datos.js con los modelos incrustados');
  const datosCode = fs.readFileSync(puestosDatosPath, 'utf8');
  assert.ok(datosCode.includes('puesto_armas') && datosCode.includes('puesto_frutas'), 'puestos-datos.js debe contener los modelos');

  // 3. Verificación de caché global y preloader
  assert.ok(code.includes('preloadPuestosGLB'), 'Debe existir la función preloadPuestosGLB');
  assert.ok(code.includes('cachePuestosGLB'), 'Debe existir la caché global de modelos GLB');
  assert.ok(code.includes('preloadPuestos: preloadPuestosGLB'), 'Debe exportarse preloadPuestos en VillageLib');

  // 4. Verificación de ajuste de altura para que descansen sobre el suelo
  assert.ok(code.includes('yOffset = (bbox.min.y < 0) ? (-bbox.min.y * escala) : 0') || code.includes('-bbox.min.y * escala') || code.includes('-scaledBbox.min.y'), 'Debe compensar la altura base para que el mostrador no se entierre');

  // 5. Verificación de colisionador (ajustado para puestos escalados un 20%)
  assert.ok(code.includes("this.colliders.push({ type: 'circle', x: s.x, z: s.z, r: 1.74 })") || code.includes("this.colliders.push({ type: 'circle', x: s.x, z: s.z, r: 1.45 })"), 'Debe registrar colisionadores circulares en los puestos');

  // 6. Verificación de escala aumentada en un 20% (2.70m de altura objetivo)
  assert.ok(code.includes('2.70 / sz.y') || code.includes('escala = 2.70'), 'Debe tener la escala aumentada un 20% (2.70m)');

  // 7. Verificación de cota de altura de plaza elevada para evitar hundimiento de botas
  assert.ok(code.includes('plazaTop = plazaY + 0.34') || code.includes('plazaTop'), 'Debe elevar la cota transitable en la plaza para que no se entierren las botas');
});

test('VisorMundo y CreadorPueblos: precarga de puestos y tolerancia a fallos en carga de pueblo', () => {
  const visorPath = path.join(__dirname, '..', 'visor-mundo.html');
  const visorCode = fs.readFileSync(visorPath, 'utf8');

  assert.ok(visorCode.includes('preloadPuestos'), 'VisorMundo debe solicitar precarga de puestos');
  assert.ok(visorCode.includes('catch (errTown)'), 'loadTown debe tener captura de errores defensiva para no entrar en bucle infinito');

  const creadorPath = path.join(__dirname, '..', 'creador-de-pueblos.html');
  const creadorCode = fs.readFileSync(creadorPath, 'utf8');
  assert.ok(creadorCode.includes('preloadPuestos'), 'Creador de pueblos debe precargar puestos');
});
