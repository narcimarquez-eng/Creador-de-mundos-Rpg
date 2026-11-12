/*
 * casas-glb.js — Casas GLB del pueblo con variantes y versión lejana. Expone window.CasasGLBLib.
 *
 * Modelos (glb/pueblo/, los genera tools/preparar-casas-glb.mjs):
 *   casa_entramado   casa de entramado con fachada pintada; se cambian el tejado y la piedra
 *   cabana           cabaña de troncos; se cambian el tejado, la madera y el zócalo de piedra
 * Cada uno tiene su *_lejos.glb (≈ 10–30 % de los triángulos y texturas de 128 px).
 *
 * Para que un pueblo no parezca copiado y pegado:
 *   - cada casa lleva un giro (±7°) y un tamaño (±8 %, algo distinto en ancho y fondo) propios;
 *   - variantes de textura: la misma casa con otro tejado, otra madera u otra piedra de assets/texturas/
 *     (3 casas × 3 tejados = 9 casas distintas). Las casas de la misma variante se dibujan juntas (InstancedMesh),
 *     así un pueblo entero cuesta pocas llamadas de dibujo;
 *   - versión lejana: actualizar(posiciónCámara) pasa cada casa a su versión de pocos triángulos según la distancia.
 * Piezas sueltas (fuente, banco, barril, leñera, farol…): construirPiezas() las coloca por calles y plazas.
 *
 * Requiere THREE (global) y que la página tenga el importmap de three (para cargar GLTFLoader).
 */
(function (root) {
  'use strict';

  const BASE = 'glb/pueblo/';

  // Catálogo de texturas (assets/texturas/<grupo>/tNN.jpg) con el número de la hoja de referencia
  const TEXTURAS = {
    tejados: { t01: 'Teja árabe roja', t02: 'Pizarra', t03: 'Tablillas de madera', t04: 'Teja con musgo', t05: 'Chapa ondulada',
      t06: 'Tejas de asfalto', t07: 'Paja', t08: 'Teja plana', t09: 'Escamas de barro', t10: 'Losas de piedra con liquen' },
    madera: { t01: 'Tablón con nudos', t02: 'Troncos (testas)', t03: 'Tablón gris', t04: 'Tablón con musgo', t05: 'Viga oscura',
      t06: 'Pino', t07: 'Tablón claro', t08: 'Tronco con corteza', t09: 'Tablón tallado', t10: 'Tablón quemado' },
    suelo: { t01: 'Cantos rodados', t02: 'Adoquín', t03: 'Tierra con grava', t04: 'Rocas y musgo', t05: 'Adoquín con hierba',
      t06: 'Cantos grandes', t07: 'Tierra con piedras', t08: 'Senda empedrada', t09: 'Lajas', t10: 'Rocas sueltas' },
    agua: { t01: 'Piscina', t02: 'Mar profundo', t03: 'Agua sobre cantos', t04: 'Oleaje', t05: 'Lluvia', t06: 'Charca con algas',
      t07: 'Rápidos', t08: 'Orilla de arena', t09: 'Hielo', t10: 'Agua oscura' },
    piedra: { t01: 'Mampostería', t02: 'Sillar claro', t03: 'Pizarra apilada', t04: 'Arenisca', t05: 'Cantos', t06: 'Sillar oscuro',
      t07: 'Encalado', t08: 'Granito', t09: 'Travertino', t10: 'Piedra y ladrillo' }
  };

  // Qué materiales de cada modelo se pueden cambiar y por qué texturas (las que encajan con su forma)
  const MODELOS = {
    casa_entramado: {
      huella: [7.4, 8.0],
      cambiables: {
        // El tejado original está pintado en el atlas; las variantes usan sus UV planas (uv1, una teja cada 2,5 m)
        tejado: { grupo: 'tejados', opciones: ['t02', 't03', 't06', 't07', 't10', 't01', 't09'], repetir: 1, canal: 1 },
        madera: { grupo: 'madera', opciones: ['t05', 't10', 't03', 't01'], repetir: 1, tinte: [0.62, 0.58, 0.54] },
        piedra: { grupo: 'piedra', opciones: ['t01', 't06', 't08', 't03', 't10'], repetir: 1 }
      }
    },
    cabana: {
      huella: [8.7, 8.1],
      cambiables: {
        tejado: { grupo: 'tejados', opciones: ['t03', 't07', 't02', 't08', 't06', 't01'], repetir: 1 },
        tejado_musgo: { igualA: 'tejado', tinte: [0.75, 0.85, 0.65] },
        madera_troncos: { grupo: 'madera', opciones: ['t07', 't03', 't01', 't06', 't05', 't10'], repetir: 1 },
        madera_tablas: { igualA: 'madera_troncos' },
        piedra: { grupo: 'piedra', opciones: ['t01', 't05', 't06', 't03', 't08'], repetir: 1 }
      }
    }
  };

  const PIEZAS = ['fuente', 'banco', 'barril', 'lenera', 'tocon', 'farol', 'jardinera', 'jardinera_arbol', 'valla', 'muro_patio', 'pino'];

  // Azar estable por posición
  function hash01(a, b) {
    let h = Math.imul(Math.round(a * 13) | 0, 374761393) ^ Math.imul(Math.round(b * 17) | 0, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  function rng(seed) {
    let s = (seed >>> 0) || 1;
    return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
  }

  let cargador = null;
  async function gltf(url) {
    if (!cargador) {
      const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
      cargador = new GLTFLoader();
    }
    return cargador.loadAsync(url);
  }

  // Prototipo: lista de { geometria, material, nombre } en coordenadas del modelo (todas las mallas aplanadas)
  function aplanar(THREE, escena, rehacerNormales) {
    const out = [];
    escena.updateMatrixWorld(true);
    escena.traverse(o => {
      if (!o.isMesh) return;
      const g = o.geometry.clone();
      g.applyMatrix4(o.matrixWorld);
      if (rehacerNormales || !g.attributes.normal) {
        g.computeVertexNormals();
        if (o.material) o.material.flatShading = false;
      }
      g.userData.casasGLB = true;   // compartida entre pueblos: el pueblo no la libera al reconstruirse
      g.computeBoundingSphere();
      out.push({ geometria: g, material: o.material, nombre: (o.material && o.material.name) || '' });
    });
    return out;
  }

  const protos = {};
  let promesaCarga = null;
  function cargar(THREE, base = BASE) {
    if (promesaCarga) return promesaCarga;
    promesaCarga = Promise.all(Object.keys(MODELOS).map(async clave => {
      const [cerca, lejos] = await Promise.all([gltf(base + clave + '.glb'), gltf(base + clave + '_lejos.glb')]);
      protos[clave] = { cerca: aplanar(THREE, cerca.scene, false), lejos: aplanar(THREE, lejos.scene, true) };
    })).then(() => protos).catch(err => { promesaCarga = null; throw err; });
    return promesaCarga;
  }

  const texCache = new Map();
  const pendientes = new Map();   // foto aún cargando → texturas que la comparten y deben subirse al llegar
  function textura(THREE, grupo, id) {
    const clave = grupo + '/' + id;
    if (!texCache.has(clave)) {
      pendientes.set(clave, []);
      const t = new THREE.TextureLoader().load('assets/texturas/' + clave + '.jpg', () => {
        (pendientes.get(clave) || []).forEach(d => { d.needsUpdate = true; });
        pendientes.delete(clave);
      });
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.flipY = false;   // mismo sentido de UV que las texturas de glTF
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      texCache.set(clave, t);
    }
    return texCache.get(clave);
  }

  // Material de una variante: copia del original con la textura cambiada (misma transformación de UV)
  const matCache = new Map();
  function materialVariante(THREE, mat, cambio, claveVar) {
    if (!cambio) return mat;
    const clave = mat.uuid + '|' + claveVar;
    if (matCache.has(clave)) return matCache.get(clave);
    const m = mat.clone();
    const base = textura(THREE, cambio.grupo, cambio.id);
    // Sin clone(): clonar marca la textura para subir antes de que llegue la foto
    const t = new THREE.Texture();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    if (cambio.canal) {
      t.channel = cambio.canal;            // UV propias para la textura nueva (p. ej. el tejado pintado del atlas)
      t.repeat.set(cambio.repetir || 1, cambio.repetir || 1);
    } else if (mat.map) {
      t.offset.copy(mat.map.offset); t.repeat.copy(mat.map.repeat).multiplyScalar(cambio.repetir || 1);
      t.rotation = mat.map.rotation; t.center.copy(mat.map.center);
    }
    t.source = base.source;   // comparte la foto: se sube a la GPU cuando termina de cargar
    const clave2 = cambio.grupo + '/' + cambio.id;
    if (pendientes.has(clave2)) pendientes.get(clave2).push(t); else t.needsUpdate = true;
    m.map = t;
    // Las fotos ya traen su color: sin el oscurecido que llevaba la textura original
    const ti = cambio.tinte || [1, 1, 1];
    m.color.setRGB(ti[0], ti[1], ti[2]);
    matCache.set(clave, m);
    return m;
  }

  // Variantes de un modelo: combinaciones de texturas elegidas con una semilla (la primera es la original)
  function variantes(clave, cuantas, semilla) {
    const def = MODELOS[clave], r = rng(semilla + clave.length * 977);
    const lista = [{ id: 'original', cambios: {} }];
    for (let v = 1; v < cuantas; v++) {
      const cambios = {};
      Object.entries(def.cambiables).forEach(([papel, c]) => {
        if (c.igualA) return;
        cambios[papel] = { grupo: c.grupo, id: c.opciones[Math.floor(r() * c.opciones.length)], repetir: c.repetir, canal: c.canal, tinte: c.tinte };
      });
      Object.entries(def.cambiables).forEach(([papel, c]) => {
        if (c.igualA && cambios[c.igualA]) cambios[papel] = Object.assign({}, cambios[c.igualA], { canal: c.canal }, c.tinte ? { tinte: c.tinte } : {});
      });
      lista.push({ id: Object.values(cambios).map(c => c.grupo[0] + c.id).join('-'), cambios });
    }
    return lista;
  }

  /**
   * Construye las casas. casas: [{ x, y, z, rot, modelo?, semilla? }] (coordenadas del grupo donde se añade).
   * opts: { ancho, fondo } huella del solar (la casa se escala para caber), variantes (por modelo, 3 por defecto),
   *       semilla, distanciaLejos (m, 70 por defecto), modelos (lista de modelos a repartir).
   * Devuelve { grupo, actualizar(posCamaraLocal), casas } — llamar a actualizar para el cambio cerca/lejos.
   */
  function construir(THREE, casas, opts = {}) {
    const grupo = new THREE.Group();
    grupo.name = 'CasasGLB';
    const nVar = Math.max(1, opts.variantes || 3);
    const modelos = (opts.modelos || Object.keys(MODELOS)).filter(m => protos[m]);
    const dLejos = opts.distanciaLejos || 70;
    const lotes = [];   // { proto, mallasCerca, mallasLejos, casas: [{ matriz, x, z, lejos }] }
    const porLote = new Map();
    const colocadas = casas.map(c => {
      const h = hash01(c.x, c.z), h2 = hash01(c.z + 3.1, c.x - 7.7), h3 = hash01(c.x * 0.7 + 11, c.z * 1.3);
      const modelo = c.modelo && protos[c.modelo] ? c.modelo : modelos[Math.floor(h * modelos.length) % modelos.length];
      const variante = Math.floor(h2 * nVar);
      // Tamaño para caber en el solar, con un poco de azar propio en cada eje
      const [hw, hd] = MODELOS[modelo].huella;
      const base = Math.min((opts.ancho || hw) / hw, (opts.fondo || hd) / hd);
      const sx = base * (0.93 + 0.15 * h3), sz = base * (0.93 + 0.15 * hash01(c.z * 1.7, c.x + 5)), sy = (sx + sz) / 2;
      const giro = (c.rot || 0) + (h - 0.5) * 2 * (7 * Math.PI / 180);
      const m = new THREE.Matrix4().compose(new THREE.Vector3(c.x, c.y, c.z),
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), giro), new THREE.Vector3(sx, sy, sz));
      const clave = modelo + '#' + variante;
      if (!porLote.has(clave)) {
        const vars = variantes(modelo, nVar, opts.semilla || 1);
        porLote.set(clave, { modelo, variante: vars[variante % vars.length], casas: [] });
      }
      const info = { matriz: m, x: c.x, z: c.z, lejos: false, modelo, variante };
      porLote.get(clave).casas.push(info);
      return info;
    });

    porLote.forEach(lote => {
      const crear = (lista, sombra) => lista.map(p => {
        const cambio = lote.variante.cambios[p.nombre];
        const mat = materialVariante(THREE, p.material, cambio, lote.variante.id);
        const im = new THREE.InstancedMesh(p.geometria, mat, lote.casas.length);
        im.castShadow = sombra; im.receiveShadow = true;
        im.count = 0;
        grupo.add(im);
        return im;
      });
      lote.cerca = crear(protos[lote.modelo].cerca, true);
      lote.lejos = crear(protos[lote.modelo].lejos, false);
      lotes.push(lote);
    });

    // Reparte las casas de cada lote entre la versión de cerca y la de lejos
    function repartir() {
      lotes.forEach(lote => {
        let nc = 0, nl = 0;
        lote.casas.forEach(c => {
          if (c.lejos) { lote.lejos.forEach(im => im.setMatrixAt(nl, c.matriz)); nl++; }
          else { lote.cerca.forEach(im => im.setMatrixAt(nc, c.matriz)); nc++; }
        });
        const fijar = (lista, n) => lista.forEach(im => {
          im.count = n; im.visible = n > 0;
          im.instanceMatrix.needsUpdate = true;
          if (n > 0) im.computeBoundingSphere();
        });
        fijar(lote.cerca, nc); fijar(lote.lejos, nl);
      });
    }
    repartir();

    // posCam en coordenadas del grupo; con 10 m de margen para que no parpadee en el límite
    function actualizar(posCam) {
      if (!posCam) return;
      let cambio = false;
      colocadas.forEach(c => {
        const d = Math.hypot(c.x - posCam.x, c.z - posCam.z);
        const lejos = c.lejos ? d > dLejos - 10 : d > dLejos + 10;
        if (lejos !== c.lejos) { c.lejos = lejos; cambio = true; }
      });
      if (cambio) repartir();
    }

    return { grupo, actualizar, casas: colocadas, lotes };
  }

  // Piezas sueltas: cada una se carga una vez y se instancia. piezas: [{ nombre, x, y, z, rot, escala }]
  const protosPieza = {};
  async function cargarPieza(THREE, nombre, base = BASE) {
    if (!protosPieza[nombre]) protosPieza[nombre] = gltf(base + 'piezas/' + nombre + '.glb').then(g => aplanar(THREE, g.scene, false));
    return protosPieza[nombre];
  }
  async function construirPiezas(THREE, piezas, base = BASE) {
    const grupo = new THREE.Group();
    grupo.name = 'PiezasGLB';
    const porNombre = new Map();
    piezas.forEach(p => { if (!porNombre.has(p.nombre)) porNombre.set(p.nombre, []); porNombre.get(p.nombre).push(p); });
    await Promise.all([...porNombre.entries()].map(async ([nombre, lista]) => {
      const proto = await cargarPieza(THREE, nombre, base);
      proto.forEach(pr => {
        const im = new THREE.InstancedMesh(pr.geometria, pr.material, lista.length);
        lista.forEach((p, i) => {
          const s = p.escala || 1;
          im.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(p.x, p.y, p.z),
            new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), p.rot || 0), new THREE.Vector3(s, s, s)));
        });
        im.castShadow = true; im.receiveShadow = true;
        im.computeBoundingSphere();
        grupo.add(im);
      });
    }));
    return grupo;
  }

  const CasasGLBLib = { BASE, TEXTURAS, MODELOS, PIEZAS, cargar, construir, cargarPieza, construirPiezas, variantes, textura, hash01 };
  if (typeof module !== 'undefined' && module.exports) module.exports = CasasGLBLib;
  if (root) root.CasasGLBLib = CasasGLBLib;
})(typeof window !== 'undefined' ? window : globalThis);
