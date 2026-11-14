// Pruebas del mundo oficial «Valdris · Tierras del Sol Quebrado» y su historia. Ejecutar: node test/mundo-oficial.test.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');

global.ENEMY_GLB_INDEX = {};
require('../js/enemigos-glb-indice.js');
const ENEMY_GLB = global.ENEMY_GLB_INDEX;

const W = require('../js/world-core.js');
global.WorldCore = W;
const Relieve = require('../js/relieve-zona.js');
const Secretos = require('../js/lugares-secretos.js');
global.LugaresSecretosLib = Secretos;
const H = require('../js/historia.js');
const MundoOficial = require('../js/mundo-campana.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

t('mundos/valdris.mundo.json y js/mundo-campana.js coinciden y pasan RPGWorld.validate', () => {
  const rawJson = fs.readFileSync(path.join(__dirname, '..', 'mundos', 'valdris.mundo.json'), 'utf8');
  const desdeJson = W.deserialize(rawJson);
  const clon = MundoOficial.clonar();
  W.validate(clon);

  assert.strictEqual(desdeJson.name, 'Valdris · Tierras del Sol Quebrado');
  assert.strictEqual(desdeJson.campaignId, 'valdris-sol-quebrado-v1');
  assert.strictEqual(clon.campaignId, desdeJson.campaignId);
  assert.strictEqual(clon.towns.length, 7);
  assert.strictEqual(clon.roads.length, 8);
  assert.strictEqual(clon.zones.length, 12);
  assert.strictEqual(clon.dungeons.length, 3);
  assert.strictEqual(clon.pois.length, 7);
  assert.ok(Array.isArray(clon.secretPlaces) && clon.secretPlaces.length >= 8);
});

t('todos los pueblos, caminos, zonas, mazmorras y POIs de Valdris están en tierra firme', () => {
  const w = MundoOficial.clonar();
  const T = W.getTerrain(w.seed);

  for (const town of w.towns) {
    assert.ok(!T.isWater(town.x, town.y), `Pueblo ${town.name} en agua`);
  }
  for (const road of w.roads) {
    for (const pt of road.points) {
      assert.ok(!T.isWater(pt.x, pt.y), `Camino ${road.id} cruza agua en (${Math.round(pt.x)}, ${Math.round(pt.y)})`);
    }
  }
  for (const z of w.zones) {
    assert.ok(!T.isWater(z.x, z.y), `Zona ${z.name} en agua`);
  }
  for (const d of w.dungeons) {
    assert.ok(!T.isWater(d.x, d.y), `Mazmorra ${d.name} en agua`);
  }
  for (const p of w.pois) {
    assert.ok(!T.isWater(p.x, p.y), `POI ${p.name} en agua`);
  }
});

t('todas las zonas de Valdris usan claves reales de ENEMY_GLB_INDEX y tienen 3 laberintos válidos', () => {
  const w = MundoOficial.clonar();
  const T = W.getTerrain(w.seed);
  const laberintos = [];

  for (const z of w.zones) {
    assert.ok(z.monsters.length >= 4, `${z.name} necesita al menos 4 tipos de monstruo`);
    for (const m of z.monsters) {
      assert.ok(m.enemigo && ENEMY_GLB[m.enemigo], `Enemigo inexistente en índice GLB: ${m.enemigo} (${z.name})`);
    }
    if (z.relieve && z.relieve.activo) {
      const rec = Relieve.obtenerRecinto(z, (x, zz) => T.heightAt(x, zz));
      assert.strictEqual(rec.problema, null, `Laberinto inválido en ${z.name}: ${rec.problema}`);
      laberintos.push(z);
    }
  }
  assert.strictEqual(laberintos.length, 3);
  const zonaJefe = w.zones.find(z => z.type === 'jefe');
  assert.ok(zonaJefe && zonaJefe.monsters.some(m => m.boss && m.name.includes('Aurelio')));
});

t('la crónica oficial de Valdris resuelve 16 capítulos de principio a fin sin marcas vacías', () => {
  const w = MundoOficial.clonar();
  assert.ok(w.historia && w.historia.titulo.includes('Valdris'));
  assert.strictEqual(w.historia.tituloFinal, 'Libertadores de Valdris');

  const p = H.nuevaPrincipal();
  let caps = 0;
  while (!H.terminada(p, w)) {
    const o = H.asegurarObjetivo(p, w);
    assert.ok(o && !/[{}]/.test(o.encargo + o.texto));
    for (let i = 0; i < o.cantidad; i++) {
      if (o.tipo === 'matar') H.registrar(p, { tipo: 'matar', zona: o.zona });
      else if (o.tipo === 'jefe') H.registrar(p, { tipo: 'jefe', zona: o.zona });
      else if (o.tipo === 'visitar') H.registrar(p, { tipo: 'visitar', pueblo: o.pueblo });
      else if (o.tipo === 'hablar') H.registrar(p, { tipo: 'hablar', npc: o.npc });
      else if (o.tipo === 'secreto') H.registrar(p, { tipo: 'secreto', id: o.secretoId, tipoSecreto: o.secretoTipo });
      else H.registrar(p, { tipo: 'forjar' });
    }
    const r = H.completar(p, w);
    assert.ok(!/[{}]/.test(r.texto));
    caps++;
  }
  assert.strictEqual(caps, 16);
  assert.strictEqual(H.actoActual(p, w).terminado, true);
});

t('index.html y visor-mundo.html cargan Valdris y exponen controles de historia', () => {
  const idxHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const visHtml = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');

  assert.ok(idxHtml.includes('js/mundo-campana.js'));
  assert.ok(idxHtml.includes('generarHistoriaParaMundo'));
  assert.ok(idxHtml.includes('btn-official-world'));
  assert.ok(idxHtml.includes('gen-story'));

  assert.ok(visHtml.includes('js/mundo-campana.js'));
  assert.ok(visHtml.includes('cargarMundoOficialYEntrar'));
  assert.ok(visHtml.includes('btn-portada-oficial'));
  assert.ok(visHtml.includes('HistoriaLib.prologoDe'));
});

t('Valdris v2 tiene pueblos con alta densidad de casas y estilos arquitectónicos variados', () => {
  const w = MundoOficial.clonar();
  assert.ok((w.campaignVersion || 1) >= 2, 'campaignVersion debe ser >= 2');
  const estilos = new Set();
  const tiposCasas = new Set();
  const texturasCalle = new Set();
  for (const town of w.towns) {
    assert.ok(town.cfg && town.cfg.houseDensity >= 75, `${town.name} tiene houseDensity baja: ${town.cfg && town.cfg.houseDensity}`);
    estilos.add(town.cfg.style);
    if (town.cfg.casas) tiposCasas.add(town.cfg.casas);
    if (town.cfg.streetTexture) texturasCalle.add(town.cfg.streetTexture);
  }
  assert.strictEqual(estilos.size, 7, 'Los 7 pueblos de Valdris deben tener estilos distintos: ' + [...estilos].join(', '));
  assert.ok(tiposCasas.size >= 5, 'Se esperan al menos 5 estilos de casas distintos en Valdris: ' + [...tiposCasas].join(', '));
  assert.ok(texturasCalle.size >= 6, 'Se esperan al menos 6 texturas de calle distintas en Valdris: ' + [...texturasCalle].join(', '));
});

t('VillageLib.ARCHITECTURAL_STYLES tiene wallTints y los 7 pueblos de Valdris generan sin errores', () => {
  const vm = require('vm');
  const noop = () => {};
  let nextUuid = 1;
  class Vec3 {
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
    copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
    add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
    sub(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; }
    subVectors(a, b) { this.x = a.x - b.x; this.y = a.y - b.y; this.z = a.z - b.z; return this; }
    crossVectors(a, b) { this.x = a.y * b.z - a.z * b.y; this.y = a.z * b.x - a.x * b.z; this.z = a.x * b.y - a.y * b.x; return this; }
    multiplyScalar(s) { this.x *= s; this.y *= s; this.z *= s; return this; }
    normalize() { const l = Math.hypot(this.x, this.y, this.z) || 1; this.x /= l; this.y /= l; this.z /= l; return this; }
    length() { return Math.hypot(this.x, this.y, this.z); }
    distanceTo(v) { return Math.hypot(this.x - v.x, this.y - v.y, this.z - v.z); }
    fromBufferAttribute(a, i) { this.x = a.getX(i); this.y = a.getY(i); this.z = a.getZ(i); return this; }
    applyMatrix3() { return this; }
    applyMatrix4() { return this; }
    applyQuaternion() { return this; }
    applyAxisAngle(axis, angle) {
      const c = Math.cos(angle), s = Math.sin(angle), x = this.x, z = this.z;
      if (axis && axis.y) { this.x = x * c + z * s; this.z = -x * s + z * c; }
      return this;
    }
    clone() { return new Vec3(this.x, this.y, this.z); }
  }
  class Euler { constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; } set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; } copy(e) { this.x = e.x; this.y = e.y; this.z = e.z; return this; } }
  class Quat { constructor(x = 0, y = 0, z = 0, w = 1) { this.x = x; this.y = y; this.z = z; this.w = w; } set(x, y, z, w) { this.x = x; this.y = y; this.z = z; this.w = w; return this; } identity() { this.x = 0; this.y = 0; this.z = 0; this.w = 1; return this; } setFromAxisAngle() { return this; } setFromEuler() { return this; } setFromRotationMatrix() { return this; } setFromUnitVectors() { return this; } multiply() { return this; } normalize() { return this; } copy() { return this; } }
  class Matrix3 { getNormalMatrix() { return this; } }
  class Matrix4 { makeTranslation() { return this; } makeRotationX() { return this; } makeRotationY() { return this; } makeRotationZ() { return this; } makeScale() { return this; } makeBasis() { return this; } multiply() { return this; } compose() { return this; } copy() { return this; } identity() { return this; } invert() { return this; } }
  class Color { constructor() { this.r = 1; this.g = 1; this.b = 1; } set() { return this; } setHex() { return this; } setRGB(r, g, b) { this.r = r; this.g = g; this.b = b; return this; } setHSL() { return this; } copy() { return this; } getHex() { return 0xffffff; } clone() { return new Color(); } multiplyScalar() { return this; } }
  class Sphere { constructor(c = new Vec3(), r = 1) { this.center = c; this.radius = r; } clone() { return new Sphere(this.center.clone(), this.radius); } }
  class BufAttr {
    constructor(arr, itemSize) { this.array = arr || new Float32Array(0); this.itemSize = itemSize || 3; this.count = Math.floor(this.array.length / this.itemSize); }
    getX(i) { return this.array[i * this.itemSize] || 0; }
    getY(i) { return this.array[i * this.itemSize + 1] || 0; }
    getZ(i) { return this.array[i * this.itemSize + 2] || 0; }
    setX(i, v) { this.array[i * this.itemSize] = v; return this; }
    setY(i, v) { this.array[i * this.itemSize + 1] = v; return this; }
    setZ(i, v) { this.array[i * this.itemSize + 2] = v; return this; }
    setXYZ(i, x, y, z) { const o = i * this.itemSize; this.array[o] = x; this.array[o + 1] = y; this.array[o + 2] = z; return this; }
    setXY(i, x, y) { const o = i * this.itemSize; this.array[o] = x; this.array[o + 1] = y; return this; }
    clone() { return new BufAttr(new Float32Array(this.array), this.itemSize); }
    applyMatrix4() { return this; }
  }
  class BufferGeometry {
    constructor() { this.attributes = { position: new BufAttr(new Float32Array(24 * 3), 3), normal: new BufAttr(new Float32Array(24 * 3), 3), uv: new BufAttr(new Float32Array(24 * 2), 2) }; this.index = new BufAttr(new Uint16Array(36), 1); this.boundingBox = null; this.boundingSphere = new Sphere(); }
    setAttribute(k, v) { this.attributes[k] = v; return this; }
    getAttribute(k) { return this.attributes[k]; }
    setIndex(idx) { this.index = Array.isArray(idx) ? new BufAttr(new Uint16Array(idx), 1) : idx; return this; }
    getIndex() { return this.index; }
    toNonIndexed() { return new BufferGeometry(); }
    translate() { return this; } rotateX() { return this; } rotateY() { return this; } rotateZ() { return this; } scale() { return this; } applyMatrix4() { return this; } computeVertexNormals() { return this; }
    computeBoundingBox() { this.boundingBox = { min: new Vec3(-1, -1, -1), max: new Vec3(1, 1, 1) }; return this; }
    computeBoundingSphere() { this.boundingSphere = new Sphere(); return this; }
    clone() { return new BufferGeometry(); } dispose() {}
  }
  class Obj3D {
    constructor() { this.position = new Vec3(); this.rotation = new Euler(); this.scale = new Vec3(1, 1, 1); this.quaternion = new Quat(); this.children = []; this.userData = {}; this.visible = true; this.matrix = new Matrix4(); this.matrixWorld = new Matrix4(); this.color = new Color(); this.parent = null; }
    add(...args) { for (const a of args) { if (a) { a.parent = this; this.children.push(a); } } return this; }
    remove(a) { const i = this.children.indexOf(a); if (i >= 0) { a.parent = null; this.children.splice(i, 1); } return this; }
    traverse(fn) { fn(this); for (const c of [...this.children]) if (c && c.traverse) c.traverse(fn); }
    updateMatrix() {} updateMatrixWorld() {} lookAt() {} clone() { return new Obj3D(); }
  }
  class InstancedMesh extends Obj3D {
    constructor(geo, mat, count) { super(); this.geometry = geo; this.material = mat; this.count = count || 0; this.instanceMatrix = { setUsage: noop, needsUpdate: false }; this.instanceColor = { setUsage: noop, needsUpdate: false }; }
    setMatrixAt() {} setColorAt() {}
  }
  class Mat { constructor() { this.uuid = 'mat-' + (nextUuid++); this.color = new Color(); this.emissive = new Color(); this.opacity = 1; this.emissiveIntensity = 1; } clone() { return new Mat(); } dispose() {} }
  class Tex { constructor() { this.repeat = new Vec3(1, 1, 1); } dispose() {} }
  const MOCK_THREE = {
    Vector3: Vec3, Vector2: class { constructor(x = 0, y = 0) { this.x = x; this.y = y; } },
    Euler, Quaternion: Quat, Matrix3, Matrix4, Color, Sphere, BufferGeometry,
    BoxGeometry: BufferGeometry, CylinderGeometry: BufferGeometry, ConeGeometry: BufferGeometry,
    SphereGeometry: BufferGeometry, PlaneGeometry: BufferGeometry, CircleGeometry: BufferGeometry,
    RingGeometry: BufferGeometry, TorusGeometry: BufferGeometry, DodecahedronGeometry: BufferGeometry,
    OctahedronGeometry: BufferGeometry, IcosahedronGeometry: BufferGeometry, ExtrudeGeometry: BufferGeometry,
    LatheGeometry: BufferGeometry, TubeGeometry: BufferGeometry,
    Shape: class { moveTo() {} lineTo() {} quadraticCurveTo() {} bezierCurveTo() {} absarc() {} closePath() {} },
    CatmullRomCurve3: class { constructor(pts) { this.pts = pts || []; } getPoints(n = 10) { return Array.from({ length: n + 1 }, () => new Vec3()); } },
    Float32BufferAttribute: BufAttr, BufferAttribute: BufAttr,
    Group: Obj3D, Object3D: Obj3D, Sprite: Obj3D, Mesh: class extends Obj3D { constructor(g, m) { super(); this.geometry = g; this.material = m; } },
    InstancedMesh,
    PointLight: class extends Obj3D { constructor(c, i) { super(); this.color = new Color(c); this.intensity = i || 0; } },
    DirectionalLight: class extends Obj3D { constructor() { super(); this.shadow = { mapSize: { set: noop }, camera: {} }; } },
    AmbientLight: Obj3D, HemisphereLight: Obj3D,
    MeshStandardMaterial: Mat, MeshBasicMaterial: Mat, MeshLambertMaterial: Mat, MeshPhysicalMaterial: Mat, SpriteMaterial: Mat,
    CanvasTexture: Tex, DataTexture: Tex, Texture: Tex,
    TextureLoader: class { load() { return new Tex(); } },
    DoubleSide: 2, FrontSide: 0, BackSide: 1, RepeatWrapping: 1000, ClampToEdgeWrapping: 1001, SRGBColorSpace: 'srgb',
    StaticDrawUsage: 35044, AdditiveBlending: 2, NormalBlending: 1,
    Box3: class { setFromObject() { return this; } getSize(v) { return v || new Vec3(); } getCenter(v) { return v || new Vec3(); } },
    Raycaster: class { set() {} intersectObjects() { return []; } },
    MathUtils: { clamp: (v, a, b) => Math.max(a, Math.min(b, v)), lerp: (a, b, t) => a + (b - a) * t }
  };
  const makeCtx = () => ({
    fillStyle: '', strokeStyle: '', lineWidth: 1, globalAlpha: 1, font: '', textAlign: '', textBaseline: '',
    fillRect: noop, strokeRect: noop, clearRect: noop, beginPath: noop, closePath: noop,
    moveTo: noop, lineTo: noop, quadraticCurveTo: noop, bezierCurveTo: noop, arc: noop, ellipse: noop, rect: noop, fill: noop, stroke: noop,
    save: noop, restore: noop, translate: noop, rotate: noop, scale: noop, setTransform: noop,
    createLinearGradient: () => ({ addColorStop: noop }), createRadialGradient: () => ({ addColorStop: noop }),
    getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
    putImageData: noop, fillText: noop, strokeText: noop, drawImage: noop, measureText: () => ({ width: 40 })
  });
  const sandbox = {
    THREE: MOCK_THREE,
    document: { getElementById: () => null, createElement: () => ({ width: 256, height: 256, style: {}, getContext: makeCtx, addEventListener: noop }) },
    setTimeout: () => 0, clearTimeout: noop,
    console, Math, Float32Array, Uint16Array, Uint32Array, Uint8ClampedArray, Array, Object, Set, Map, JSON, String, Number, Boolean
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'village-core.js'), 'utf8'), sandbox, { filename: 'js/village-core.js' });

  const styles = sandbox.VillageLib.ARCHITECTURAL_STYLES;
  for (const [key, style] of Object.entries(styles)) {
    assert.ok(Array.isArray(style.wallTints) && style.wallTints.length > 0, `Estilo ${key} sin wallTints`);
    assert.ok(Array.isArray(style.treeColors) && style.treeColors.length > 0, `Estilo ${key} sin treeColors`);
    assert.ok(Array.isArray(style.stonePalette) && style.stonePalette.length > 0, `Estilo ${key} sin stonePalette`);
    assert.ok(typeof style.roofHex === 'string' && style.stuccoHex && style.stoneHex, `Estilo ${key} incompleto`);
  }

  const w = MundoOficial.clonar();
  for (const town of w.towns) {
    const kit = sandbox.VillageLib.createKit(town.cfg.style || 'l2_fantasy');
    const grp = new MOCK_THREE.Group();
    const village = kit.createVillage(grp, { skipGround: true, noLights: true });
    village.generate(town.cfg);
    assert.ok(village.colliders.length > 50, `${town.name} generó muy pocos colliders: ${village.colliders.length}`);
    assert.ok(village.plazaLight && village.plazaLight.position, `${town.name} no creó plazaLight`);
  }
});

console.log(`\n${n} pruebas del mundo oficial superadas.`);

