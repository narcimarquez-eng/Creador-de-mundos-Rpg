const { describe, it } = require('node:test');
const assert = require('assert');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const W = require(path.join(ROOT, 'js/world-core.js'));
const L = require(path.join(ROOT, 'js/lugares-secretos.js'));

describe('Cabañas secretas y misiones de 100 monstruos', () => {
  it('las 5 cabañas se generan cerca de los dos primeros pueblos (a menos de 300m)', () => {
    const w = W.generateWorld({ name: 'Tierras de Prueba', seed: 55 });
    const p1 = w.towns[0];
    const p2 = w.towns[1];
    const secretos = L.generarLugaresSecretos(w);
    const cabanas = secretos.filter(s => s.tipo === 'cabana');

    assert.strictEqual(cabanas.length, 5, 'Debe haber exactamente 5 cabañas GLB');

    cabanas.forEach(c => {
      const d1 = Math.hypot(c.x - p1.x, c.z - p1.y);
      const d2 = Math.hypot(c.x - p2.x, c.z - p2.y);
      const minD = Math.min(d1, d2);
      assert.ok(minD >= 135, `La cabaña ${c.id} debe estar a más de 135m de la plaza (d=${minD.toFixed(1)}m)`);
      assert.ok(minD <= 280, `La cabaña ${c.id} debe estar cerca de los primeros pueblos (d=${minD.toFixed(1)}m <= 280m)`);
    });
  });

  it('cada cabaña posee su misión de 100 monstruos y contabiliza el progreso correctamente', () => {
    const w = W.generateWorld({ name: 'Tierras de Caza', seed: 77 });
    const secretos = L.generarLugaresSecretos(w);
    const cab = secretos.find(s => s.tipo === 'cabana');

    assert.ok(cab, 'Debe existir cabaña');
    assert.ok(cab.misionCabana, 'Debe tener misionCabana');
    assert.strictEqual(cab.misionCabana.cantidad, 100);
    assert.strictEqual(cab.misionCabana.objetivoCantidad, 100);
    assert.strictEqual(cab.misionCabana.progreso, 0);

    // Simular derrota de monstruos con la lógica idéntica de visor-mundo.html
    const m = {
      name: cab.misionCabana.especie || 'Lobo Salvaje',
      level: 3,
      x: cab.x + 20,
      z: cab.z + 20,
      zone: { id: cab.misionCabana.zonaId }
    };

    function registrarBaja(s, monstruo) {
      if (!s.misionCabana || s.misionCabana.entregada || s.misionCabana.cumplida) return false;
      const mObj = s.misionCabana;
      const cantMax = mObj.cantidad || mObj.objetivoCantidad || 100;
      const esp = (mObj.especie || mObj.objetivoEspecie || '').toLowerCase();
      const mNom = (monstruo.name || '').toLowerCase();
      const zId = monstruo.zone && monstruo.zone.id;
      const dist = Math.hypot(monstruo.x - s.x, monstruo.z - s.z);

      const coincideEsp = !esp || mNom.includes(esp) || esp.includes(mNom) || esp.split(' ').some(p => p.length > 3 && mNom.includes(p));
      const coincideZona = (mObj.zonaId && zId && mObj.zonaId === zId) || (s.zonaAsignada && zId && s.zonaAsignada === zId);
      const coincideCerca = dist < 350;

      if ((coincideEsp || coincideZona || coincideCerca) && mObj.progreso < cantMax) {
        mObj.progreso++;
        if (mObj.progreso >= cantMax) mObj.completada = true;
        return true;
      }
      return false;
    }

    // Abatir 25 monstruos
    for (let i = 0; i < 25; i++) {
      const contado = registrarBaja(cab, m);
      assert.strictEqual(contado, true);
    }
    assert.strictEqual(cab.misionCabana.progreso, 25, 'Debe contabilizar 25 monstruos derrotados');
    assert.strictEqual(cab.misionCabana.completada, false);

    // Abatir hasta completar los 100
    for (let i = 25; i < 100; i++) {
      registrarBaja(cab, m);
    }
    assert.strictEqual(cab.misionCabana.progreso, 100, 'Debe alcanzar exactamente 100 monstruos');
    assert.strictEqual(cab.misionCabana.completada, true, 'Debe marcarse completada al llegar a 100');

    // Comprobar que no sobrepasa 100
    const extra = registrarBaja(cab, m);
    assert.strictEqual(extra, false);
    assert.strictEqual(cab.misionCabana.progreso, 100);
  });

  it('rebaje y aplanado en pendiente: deja un suelo plano en un radio de 8.5m y suaviza hacia el exterior', () => {
    const w = W.generateWorld({ name: 'Tierras Altas', seed: 123 });
    const secretos = L.generarLugaresSecretos(w);
    const cab = secretos.find(s => s.tipo === 'cabana');
    assert.ok(cab);

    cab.alturaBase = 25.0; // Cota plana de la cabaña

    // Punto en el centro (d=0) sobre una pendiente empinada original (ej. hOriginal = 40.0)
    const hCentro = L.aplicarRebajeCabanas([cab], cab.x, cab.z, 40.0);
    assert.strictEqual(Math.round(hCentro * 100) / 100, 25.0, 'En el centro debe rebajar la pendiente exactamente a cota 25m');

    // Punto a 5m de distancia dentro del radio plano (rPlano = 8.5m)
    const hDentro = L.aplicarRebajeCabanas([cab], cab.x + 5.0, cab.z, 35.0);
    assert.strictEqual(Math.round(hDentro * 100) / 100, 25.0, 'En todo el radio de 8.5m el suelo debe quedar plano y nivelado');

    // Punto en la zona de transición suave (d = 11.5m, entre 8.5m y 14.5m)
    const hTrans = L.aplicarRebajeCabanas([cab], cab.x + 11.5, cab.z, 40.0);
    assert.ok(hTrans > 25.0 && hTrans < 40.0, 'En el talud exterior debe suavizarse de forma continua');

    // Punto lejos (d = 25m > 14.5m)
    const hLejos = L.aplicarRebajeCabanas([cab], cab.x + 25.0, cab.z, 40.0);
    assert.strictEqual(hLejos, 40.0, 'Fuera del radio de influencia no debe modificar el terreno');
  });

  it('las cabañas no tienen suelo artificial y poseen dimensiones ampliadas para ser bien visibles', () => {
    let loadedCallback = null;
    let escalaAplicada = null;
    const mockScene = {
      isMesh: false,
      scale: { setScalar(s) { escalaAplicada = s; this.val = s; } },
      position: { set(x, y, z) { this.x = x; this.y = y; this.z = z; } },
      traverse(cb) {
        cb({ isMesh: true, castShadow: false, receiveShadow: false, material: { roughness: 0.5 } });
      }
    };

    const THREE_MOCK = {
      Group: function() {
        this.children = [];
        this.add = obj => this.children.push(obj);
        this.position = { set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
        this.rotation = { y: 0 };
      },
      BoxGeometry: function(w, h, d) { this.w = w; this.h = h; this.d = d; },
      CylinderGeometry: function() {},
      TorusGeometry: function() {},
      ConeGeometry: function() { this.rotateY = function() {}; },
      MeshStandardMaterial: function() {},
      Mesh: function(geo, mat) {
        this.geo = geo;
        this.mat = mat;
        this.position = { set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
        this.scale = { set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
        this.rotation = { x: 0, y: 0, z: 0 };
      },
      PointLight: function() {
        this.position = { set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
      },
      Box3: function() {
        return {
          setFromObject: () => ({
            getSize: v => { v.x = 3.0; v.y = 3.2; v.z = 3.0; },
            min: { x: -1.5, y: -4.0, z: -1.5 },
            max: { x: 1.5, y: 4.8, z: 1.5 }
          })
        };
      },
      Vector3: function() { this.x = 0; this.y = 0; this.z = 0; },
      GLTFLoader: function() {
        this.load = (url, onLoad) => { loadedCallback = onLoad; };
      }
    };

    const cabMock = { id: 'cab-test', tipo: 'cabana', modeloGLB: 'glb/cabana.glb', x: 100, z: 100 };
    const grupo = L.construirModeloSecreto(THREE_MOCK, cabMock, () => 10);
    assert.ok(grupo);

    // Cargar modelo
    loadedCallback({ scene: mockScene });
    assert.ok(escalaAplicada >= 2.4, `La escala aplicada (${escalaAplicada}) debe ser amplia para verse bien`);

    // Probar cabaña procedural sin GLB
    const cabProc = { id: 'cab-proc', tipo: 'cabana', x: 100, z: 100 };
    const grupoProc = L.construirModeloSecreto(THREE_MOCK, cabProc, () => 10);
    
    // Asegurar que NO hay plataforma de suelo
    const plataformaSuelo = grupoProc.children.find(c => c.geo && c.geo.w && c.geo.h <= 0.5 && c.geo.w < 10);
    assert.strictEqual(plataformaSuelo, undefined, 'No debe haber plataformas o suelos artificiales añadidos');

    // Muro principal ampliado
    const muro = grupoProc.children.find(c => c.geo && c.geo.w >= 10);
    assert.ok(muro, 'La cabaña procedimental debe tener dimensiones amplias (ancho >= 10m)');
  });
});
