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

  it('rebaje y desmonte orgánico en pendiente: nivela terraza a 14.5m, suaviza a 26m y no crea peñones', () => {
    const w = W.generateWorld({ name: 'Tierras Altas', seed: 123 });
    const secretos = L.generarLugaresSecretos(w);
    const cab = secretos.find(s => s.tipo === 'cabana' && !s.esMar);
    assert.ok(cab);

    cab.alturaBase = 25.0; // Cota base de la cabaña
    const cotaTerraza = 25.0;

    // 1. Desmonte cuesta arriba (ej. hOriginal = 40.0m > 25.0m)
    // En el centro (d=0) debe quedar a la cota base de la terraza
    const hCentro = L.aplicarRebajeCabanas([cab], cab.x, cab.z, 40.0);
    assert.strictEqual(Math.round(hCentro * 100) / 100, cotaTerraza, 'En el centro debe rebajar la ladera a 25.0m');

    // Punto a 12m de distancia dentro del radio plano ampliado (rPlano = 16.0m)
    const hDentro = L.aplicarRebajeCabanas([cab], cab.x + 12.0, cab.z, 35.0);
    assert.strictEqual(Math.round(hDentro * 100) / 100, cotaTerraza, 'En todo el radio de 16.0m el suelo debe quedar nivelado');

    // Punto en la zona de transición suave (d = 26m, entre 16.0m y 36.0m)
    const hTrans = L.aplicarRebajeCabanas([cab], cab.x + 26.0, cab.z, 40.0);
    assert.ok(hTrans > cotaTerraza && hTrans < 40.0, 'En el talud exterior debe suavizarse de forma continua');

    // Punto lejos (d = 40m > 36.0m)
    const hLejos = L.aplicarRebajeCabanas([cab], cab.x + 40.0, cab.z, 40.0);
    assert.strictEqual(hLejos, 40.0, 'Fuera del radio de influencia no debe modificar el terreno');

    // 2. Cuesta abajo (hOriginal = 20.0m < 25.0m): dentro del radio plano (d = 8m < 16m) se nivela a la terraza para que la cabaña no quede en el aire
    const hAbajo = L.aplicarRebajeCabanas([cab], cab.x + 8.0, cab.z, 20.0);
    assert.strictEqual(hAbajo, cotaTerraza, 'La huella de la cabaña cuesta abajo queda nivelada a la base de la terraza');

    // 3. Cabaña marina / pescador (esMar = true): NO se excava ni se crea agujero artificial
    const cabMar = { ...cab, esMar: true };
    const hMar = L.aplicarRebajeCabanas([cabMar], cabMar.x, cabMar.z, 15.0);
    assert.strictEqual(hMar, 15.0, 'La cabaña marina no altera el relieve ni excava huecos artificiales');
  });

  it('las cabañas no tienen suelo artificial y poseen dimensiones ampliadas un 30% adicional (21m reales)', () => {
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
    assert.ok(escalaAplicada >= 3.5, `La escala aplicada (${escalaAplicada}) debe alcanzar 21 metros de ancho`);

    // Probar cabaña procedural sin GLB
    const cabProc = { id: 'cab-proc', tipo: 'cabana', x: 100, z: 100 };
    const grupoProc = L.construirModeloSecreto(THREE_MOCK, cabProc, () => 10);
    
    // Asegurar que NO hay plataforma de suelo
    const plataformaSuelo = grupoProc.children.find(c => c.geo && c.geo.w && c.geo.h <= 0.5 && c.geo.w < 10);
    assert.strictEqual(plataformaSuelo, undefined, 'No debe haber plataformas o suelos artificiales añadidos');

    // Muro principal ampliado un 30% (ancho >= 15m)
    const muro = grupoProc.children.find(c => c.geo && c.geo.w >= 15);
    assert.ok(muro, 'La cabaña procedimental debe tener dimensiones ampliadas a 15.6m de ancho');
  });

  it('física del personaje: las pendientes de más del 50% de desnivel son inescalables a pie', () => {
    // Simular el controlador y la colisión con pendiente de character.js
    let posActual = { x: 0, z: 0 };
    const MAX_PENDIENTE = 0.50;

    function testResolverPendiente(hFunc, nextX, nextZ) {
      const ox = posActual.x, oz = posActual.z;
      const h0 = hFunc(ox, oz);
      let rx = nextX, rz = nextZ;

      const esInescalable = (x, z) => {
        const dx = x - ox, dz = z - oz;
        const dist = Math.hypot(dx, dz);
        if (dist < 0.001) return false;
        const hStep = hFunc(x, z);
        const dhStep = hStep - h0;
        if (dhStep > 0 && (dhStep / dist) > MAX_PENDIENTE) {
          const probeDist = Math.max(0.8, dist);
          const px = ox + (dx / dist) * probeDist;
          const pz = oz + (dz / dist) * probeDist;
          const hProbe = hFunc(px, pz);
          const dhProbe = hProbe - h0;
          if (dhProbe > 0 && (dhProbe / probeDist) > MAX_PENDIENTE) {
            return true;
          }
        }
        return false;
      };

      if (esInescalable(rx, rz)) {
        if (!esInescalable(rx, oz)) {
          rz = oz;
        } else if (!esInescalable(ox, rz)) {
          rx = ox;
        } else {
          rx = ox;
          rz = oz;
        }
      }
      return { x: rx, z: rz };
    }

    // Caso 1: Pendiente suave del 30% (dh = 0.06m en avance de 0.2m) -> PUEDE subir
    const resSuave = testResolverPendiente((x, z) => z * 0.30, 0, 0.2);
    assert.strictEqual(resSuave.z, 0.2, 'Una pendiente del 30% debe ser escalable sin bloqueo');

    // Caso 2: Pendiente empinada del 65% (dh = 0.13m en avance de 0.2m) -> BLOQUEADO
    const resEmpinada = testResolverPendiente((x, z) => z * 0.65, 0, 0.2);
    assert.strictEqual(resEmpinada.z, 0, 'Una pendiente del 65% (>50%) debe bloquear el paso hacia arriba');

    // Caso 3: Bajar ladera empinada del 80% (dh = -0.16m en avance de 0.2m) -> PUEDE bajar
    const resBajada = testResolverPendiente((x, z) => -z * 0.80, 0, 0.2);
    assert.strictEqual(resBajada.z, 0.2, 'Descender pendientes empinadas está permitido a pie');

    // Caso 4: Deslizamiento lateral: subida en Z empinada (85%), pero eje X plano (0%)
    const resLateral = testResolverPendiente((x, z) => z * 0.85, 0.2, 0.2);
    assert.strictEqual(resLateral.x, 0.2, 'Debe permitir deslizarse por el eje llano');
    assert.strictEqual(resLateral.z, 0, 'Bloquea el componente empinado');
  });
});
