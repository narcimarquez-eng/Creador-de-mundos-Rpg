// Pruebas del sistema de lugares secretos con arquitectura peculiar. Ejecutar: node test/lugares-secretos.test.js
const assert = require('assert');
const L = require('../js/lugares-secretos.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

function mundoMock() {
  return {
    id: 'mundo-test',
    name: 'Aden-Test',
    size: 2000,
    towns: [
      { id: 't1', name: 'Lorrin', x: 200, y: 200, isStart: true },
      { id: 't2', name: 'Corwyn', x: 800, y: 500 }
    ],
    zones: [
      { id: 'z1', name: 'Prados', type: 'caza', x: 400, y: 400 }
    ]
  };
}

t('tipos de secretos: define fuente, cabaña, altar y santuario con arquitectura distintiva', () => {
  const tipos = Object.keys(L.TIPOS_SECRETO);
  assert.ok(tipos.includes('fuente'));
  assert.ok(tipos.includes('cabana'));
  assert.ok(tipos.includes('altar'));
  assert.ok(tipos.includes('santuario'));

  tipos.forEach(k => {
    const s = L.TIPOS_SECRETO[k];
    assert.ok(s.nombre && s.desc && s.icono && s.radioDeteccion > 10);
  });
});

t('generación determinista: genera lugares secretos distribuidos orgánicamente', () => {
  const w = mundoMock();
  const sec1 = L.generarLugaresSecretos(w);
  const sec2 = L.generarLugaresSecretos(w);

  assert.ok(sec1.length >= 6);
  assert.strictEqual(sec1.length, sec2.length);
  assert.strictEqual(sec1[0].id, sec2[0].id);
  assert.strictEqual(sec1[0].x, sec2[0].x);
  assert.strictEqual(sec1[0].z, sec2[0].z);
});

t('ubicación de secretos: se colocan lejos de las plazas de los pueblos', () => {
  const w = mundoMock();
  const secretos = L.generarLugaresSecretos(w);

  secretos.forEach(s => {
    w.towns.forEach(p => {
      const d = Math.hypot(p.x - s.x, p.y - s.z);
      assert.ok(d >= 120, `Secreto ${s.id} demasiado cerca del pueblo ${p.name}: d=${d}`);
    });
  });
});

t('las 5 cabañas especiales GLB: se generan con aldeanos, misión de 100 monstruos y una junto al mar', () => {
  const w = mundoMock();
  const secretos = L.generarLugaresSecretos(w);
  const cabanas = secretos.filter(s => s.tipo === 'cabana' && s.modeloGLB);

  assert.strictEqual(cabanas.length, 5, 'Debe haber exactamente 5 cabañas especiales GLB');
  const mar = cabanas.filter(c => c.esMar);
  assert.strictEqual(mar.length, 1, 'Exactamente una cabaña debe estar orientada al mar');
  assert.ok(mar[0].nombre.includes('Pescador') || mar[0].icono.includes('🌊'));

  cabanas.forEach(c => {
    assert.ok(c.aldeano && c.aldeano.length > 2, `Cabaña ${c.id} debe tener un aldeano asignado`);
    assert.ok(c.misionCabana, `Cabaña ${c.id} debe tener misionCabana`);
    assert.strictEqual(c.misionCabana.cantidad, 100, 'La misión debe pedir 100 monstruos');
    assert.strictEqual(c.misionCabana.progreso, 0, 'El progreso inicial debe ser 0');
    assert.strictEqual(c.misionCabana.recompensa.pocionesVida, 4, 'Debe recompensar 4 pociones de salud');
    assert.strictEqual(c.misionCabana.recompensa.oroMin, 1, 'Oro min 1');
    assert.strictEqual(c.misionCabana.recompensa.oroMax, 2000, 'Oro max 2000');
    assert.strictEqual(c.misionCabana.recompensa.arenaMin, 10, 'Arena min 10');
    assert.strictEqual(c.misionCabana.recompensa.arenaMax, 50, 'Arena max 50');
    assert.strictEqual(c.misionCabana.recompensa.nivelPiezaMultiplicador, 10, 'Nivel de pieza superior x10');
    assert.ok(c.misionCabana.recompensa.calidadMin >= 0.5 && c.misionCabana.recompensa.calidadMax <= 0.9, 'Calidad 50-90%');
  });
});

t('construcción de cabaña GLB: no incluye cilindro intrusivo y asienta el modelo a ras de suelo', () => {
  let loadedCallback = null;
  const mockScene = {
    isMesh: false,
    scale: { setScalar(s) { this.val = s; } },
    position: { set(x, y, z) { this.x = x; this.y = y; this.z = z; } },
    traverse(cb) {
      cb({ isMesh: true, castShadow: false, receiveShadow: false, material: { roughness: 0.5, metalness: 0.1 } });
    }
  };

  const THREE_MOCK = {
    Group: function() {
      this.children = [];
      this.add = obj => this.children.push(obj);
      this.position = { set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
      this.rotation = { y: 0 };
    },
    BoxGeometry: function() {},
    CylinderGeometry: function() { this.isCylinder = true; },
    TorusGeometry: function() {},
    ConeGeometry: function() {},
    MeshStandardMaterial: function() {},
    MeshBasicMaterial: function() {},
    Mesh: function(geo, mat) {
      this.geo = geo;
      this.mat = mat;
      this.position = { set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
      this.rotation = { x: 0, y: 0, z: 0 };
    },
    PointLight: function() {
      this.position = { set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
    },
    Box3: function() {
      return {
        setFromObject: () => ({
          getSize: v => { v.x = 2.94; v.y = 3.20; v.z = 2.94; },
          min: { x: -1.47, y: -4.10, z: -1.47 },
          max: { x: 1.47, y: 4.80, z: 1.47 }
        })
      };
    },
    Vector3: function() {
      this.x = 0; this.y = 0; this.z = 0;
    },
    GLTFLoader: function() {
      this.load = (url, onLoad) => {
        loadedCallback = onLoad;
      };
    }
  };

  const w = mundoMock();
  const secretos = L.generarLugaresSecretos(w);
  const cabana = secretos.find(s => s.tipo === 'cabana' && s.modeloGLB);
  assert.ok(cabana, 'Debe haber una cabaña GLB');

  const grupo = L.construirModeloSecreto(THREE_MOCK, cabana, () => 0);
  assert.ok(grupo, 'Debe devolver un grupo 3D');

  // Asegurar que NO hay un CylinderGeometry gigante intrusivo cortando la cabaña
  const cilindros = grupo.children.filter(c => c.geo && c.geo.isCylinder);
  assert.strictEqual(cilindros.length, 0, 'No debe haber plataformas cilíndricas intrusivas cortando el edificio');

  // Simular la carga asíncrona del GLB
  assert.ok(loadedCallback, 'El loader debe haber sido llamado');
  loadedCallback({ scene: mockScene });

  // El modelo debe haberse añadido y su Y debe contrarrestar la base (-bbox.min.y) para asentarse sobre el suelo
  assert.ok(mockScene.position.y > 4.0, `La posición Y (${mockScene.position.y}) debe elevar la base sobre el suelo sin sepultarla`);
});

t('aplanado de terreno bajo cabañas: allana cuesta arriba y cuesta abajo con pendientes suaves', () => {
  const cabana = {
    tipo: 'cabana',
    x: 100,
    z: 200,
    alturaBase: 50,
    radioPlano: 16.0,
    radioRebaje: 36.0,
    esMar: false
  };

  // Punto central (d = 0): debe ser exactamente alturaBase (50)
  const hCentro = L.aplicarRebajeCabanas([cabana], 100, 200, 70);
  assert.strictEqual(hCentro, 50, 'El centro de la cabaña debe allanarse a alturaBase');

  // Punto cuesta abajo (terreno natural = 35 < 50): dentro de 16m (d = 10m) debe levantarse a 50
  const hCuestaAbajo10m = L.aplicarRebajeCabanas([cabana], 110, 200, 35);
  assert.strictEqual(hCuestaAbajo10m, 50, 'El terreno cuesta abajo a 10m (<16m) debe nivelarse a alturaBase para que la cabaña no flote');

  // Punto cuesta arriba (terreno natural = 65 > 50): dentro de 16m (d = 10m) debe rebajarse a 50
  const hCuestaArriba10m = L.aplicarRebajeCabanas([cabana], 100, 210, 65);
  assert.strictEqual(hCuestaArriba10m, 50, 'El terreno cuesta arriba a 10m (<16m) debe rebajarse a alturaBase');

  // Punto en la rampa de transición suave (d = 26m, mitad de [16, 36]):
  // t = 0.5, w = 1 - (0.25 * (3 - 1)) = 0.5 -> hMod = 35 + (50 - 35) * 0.5 = 42.5
  const hTransicionAbajo = L.aplicarRebajeCabanas([cabana], 126, 200, 35);
  assert.ok(hTransicionAbajo > 35 && hTransicionAbajo < 50, 'La ladera cuesta abajo debe tener una pendiente suave de transición');
  assert.strictEqual(Math.round(hTransicionAbajo * 10) / 10, 42.5, 'La interpolación suave a 26m debe dar 42.5');

  // Punto fuera de la zona de influencia (d = 40m > 36m): no debe modificarse
  const hFuera = L.aplicarRebajeCabanas([cabana], 140, 200, 35);
  assert.strictEqual(hFuera, 35, 'Fuera de radioRebaje el terreno no se modifica');
});

t('contextoCabana conecta las 5 cabañas fronterizas con la trama y el acto activo', () => {
  assert.strictEqual(L.CABANAS_GLB.length, 5);
  L.CABANAS_GLB.forEach(c => {
    assert.ok(typeof c.trama === 'string' && c.trama.length > 20, `${c.id} debe incluir trama narrativa`);
  });
  const ctxActo1 = L.contextoCabana('cabana-3-pescador', { paso: 2 });
  const ctxActo3 = L.contextoCabana('cabana-3-pescador', { paso: 12 });
  const ctxEpi = L.contextoCabana('cabana-3-pescador', { paso: 16 });
  assert.ok(ctxActo1.trama.includes('jaulas'));
  assert.ok(ctxActo1.estadoActo.includes('Acto I'));
  assert.ok(ctxActo3.estadoActo.includes('Acto III'));
  assert.ok(ctxEpi.estadoActo.includes('Epílogo'));
});

console.log(`\n${n} pruebas de lugares secretos superadas.`);
