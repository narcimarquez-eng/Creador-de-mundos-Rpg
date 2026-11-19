// Pruebas de la ruta a pie por los caminos. Ejecutar: node test/ruta.test.js
const assert = require('assert');
const R = require('../js/ruta.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

// Camino recto de a a b con un punto cada 50 m
function recta(a, b) {
  const L = Math.hypot(b.x - a.x, b.y - a.y), pasos = Math.round(L / 50), pts = [];
  for (let i = 0; i <= pasos; i++) pts.push({ x: a.x + (b.x - a.x) * i / pasos, y: a.y + (b.y - a.y) * i / pasos });
  return pts;
}
// Mundo: A —— B
//              |
//              C        D (sin caminos)
const A = { id: 'A', name: 'A', x: 0, y: 0 }, B = { id: 'B', name: 'B', x: 1000, y: 0 };
const C = { id: 'C', name: 'C', x: 1000, y: 1000 }, D = { id: 'D', name: 'D', x: 5000, y: 5000 };
const MUNDO = {
  towns: [A, B, C, D],
  roads: [{ id: 'ab', from: 'A', to: 'B', points: recta(A, B) }, { id: 'bc', from: 'B', to: 'C', points: recta(B, C) }]
};
// Puerta de cada pueblo: el borde del terreno (100 m) en la dirección del camino y 12 m más allá
const OPC = {
  mitad: () => 100,
  salida: (idPueblo, idCamino) => {
    const t = MUNDO.towns.find(x => x.id === idPueblo), r = MUNDO.roads.find(x => x.id === idCamino);
    const otro = MUNDO.towns.find(x => x.id === (r.from === idPueblo ? r.to : r.from));
    const L = Math.hypot(otro.x - t.x, otro.y - t.y), ux = (otro.x - t.x) / L, uy = (otro.y - t.y) / L;
    return [{ x: t.x + ux * 100, y: t.y + uy * 100 }, { x: t.x + ux * 112, y: t.y + uy * 112 }];
  }
};
const dentro = (p, c) => Math.max(Math.abs(p.x - c.x), Math.abs(p.y - c.y)) < 100;
const cerca = (p, q) => Math.hypot(p.x - q.x, p.y - q.y) < 1e-6;

t('del pueblo a una zona del camino: sale por la puerta y sigue el camino hasta la zona', () => {
  const ruta = R.calcularRuta(MUNDO, { x: 5, y: 5 }, { x: 500, y: 40 }, OPC);
  assert.ok(cerca(ruta[0], { x: 12, y: 0 }), JSON.stringify(ruta[0]));    // primero, la boca de la calle de salida
  assert.ok(cerca(ruta[1], { x: 100, y: 0 }), JSON.stringify(ruta[1]));   // luego, la puerta
  assert.ok(cerca(ruta[ruta.length - 1], { x: 500, y: 40 }));
  assert.ok(ruta.slice(0, -1).every(p => p.y === 0 && p.x <= 500), JSON.stringify(ruta));
  for (let i = 1; i < ruta.length - 1; i++) assert.ok(ruta[i].x >= ruta[i - 1].x);   // siempre hacia delante
});

t('a otro pueblo pasando por uno intermedio: entra por su puerta, cruza su plaza y sale por la otra', () => {
  const ruta = R.calcularRuta(MUNDO, { x: 0, y: 0 }, { x: 1000, y: 1000 }, OPC);
  const iPlazaB = ruta.findIndex(p => cerca(p, B));
  assert.ok(iPlazaB > 0, 'pasa por la plaza de B');
  assert.ok(cerca(ruta[iPlazaB - 1], { x: 900, y: 0 }), 'entra en B por su puerta');
  assert.ok(ruta[iPlazaB].plaza, 'la plaza va marcada');
  assert.ok(cerca(ruta[iPlazaB + 1], { x: 1000, y: 12 }), 'sale por la calle de salida hacia C');
  assert.ok(cerca(ruta[iPlazaB + 2], { x: 1000, y: 100 }), 'y por su puerta');
  assert.ok(cerca(ruta[ruta.length - 1], C));
  // Fuera de las puertas, nunca atraviesa el terreno de un pueblo salvo por la plaza
  ruta.forEach(p => { if (dentro(p, B) && !cerca(p, B)) assert.ok([{ x: 900, y: 0 }, { x: 1000, y: 12 }, { x: 1000, y: 100 }].some(q => cerca(p, q)), JSON.stringify(p)); });
});

t('desde mitad de un camino hacia atrás: no pasa por ningún pueblo', () => {
  const ruta = R.calcularRuta(MUNDO, { x: 600, y: 5 }, { x: 300, y: 0 }, OPC);
  assert.ok(ruta.every(p => !dentro(p, A) && !dentro(p, B)));
  for (let i = 1; i < ruta.length; i++) assert.ok(ruta[i].x <= ruta[i - 1].x, JSON.stringify(ruta));
});

t('desde fuera de un camino: primero se acerca a él y luego llega a la plaza de destino', () => {
  const ruta = R.calcularRuta(MUNDO, { x: 1060, y: 600 }, { x: 0, y: 0 }, OPC);
  assert.ok(Math.abs(ruta[0].x - 1000) < 1e-6 && Math.abs(ruta[0].y - 600) < 1e-6, JSON.stringify(ruta[0]));   // al camino B–C
  assert.ok(ruta.some(p => cerca(p, B)), 'pasa por B');
  assert.ok(cerca(ruta[ruta.length - 1], A));
});

t('dentro del mismo pueblo: directo al destino', () => {
  assert.deepStrictEqual(R.calcularRuta(MUNDO, { x: 5, y: 5 }, { x: 20, y: -10 }, OPC), [{ x: 20, y: -10 }]);
});

t('lejos de la plaza dentro de un pueblo: primero va a la plaza y luego a la puerta', () => {
  const ruta = R.calcularRuta(MUNDO, { x: -60, y: 50 }, { x: 500, y: 0 }, OPC);
  assert.ok(cerca(ruta[0], A) && cerca(ruta[1], { x: 12, y: 0 }) && cerca(ruta[2], { x: 100, y: 0 }), JSON.stringify(ruta.slice(0, 3)));
});

t('sin camino que llegue: en línea recta al destino', () => {
  assert.deepStrictEqual(R.calcularRuta(MUNDO, { x: 0, y: 0 }, { x: 5000, y: 5000 }, OPC), [{ x: 5000, y: 5000 }]);
});

t('elige el camino más corto cuando hay varios', () => {
  const conAtajo = { towns: MUNDO.towns, roads: MUNDO.roads.concat([{ id: 'ac', from: 'A', to: 'C', points: recta(A, C) }]) };
  const op = Object.assign({}, OPC, { salida: () => [] });
  const ruta = R.calcularRuta(conAtajo, { x: 0, y: 0 }, { x: 1000, y: 1000 }, op);
  assert.ok(!ruta.some(p => cerca(p, B)), 'no da la vuelta por B');
  assert.ok(ruta.every(p => Math.abs(p.x - p.y) < 1e-6), 'va por la diagonal');
});

t('los puntos no quedan pegados (a menos de 3 m)', () => {
  const ruta = R.calcularRuta(MUNDO, { x: 0, y: 0 }, { x: 1000, y: 1000 }, OPC);
  for (let i = 1; i < ruta.length; i++) assert.ok(Math.hypot(ruta[i].x - ruta[i - 1].x, ruta[i].y - ruta[i - 1].y) >= 3);
});

t('entre dos puntos en campo abierto: calcula la ruta directa más corta sin desvíos absurdos a carreteras lejanas', () => {
  // Dos puntos separados 50m en el campo (a 150m de la carretera A-B)
  const ruta = R.calcularRuta(MUNDO, { x: 300, y: 150 }, { x: 350, y: 160 }, OPC);
  assert.strictEqual(ruta.length, 1);
  assert.ok(cerca(ruta[0], { x: 350, y: 160 }));
});

t('si una línea directa entre puntos atravesara un pueblo con murallas: rodea por caminos oficiales', () => {
  // Desde x: -150, y: 0 (oeste de A) hasta x: 300, y: 0 (este de A): el pueblo A (mitad 100m) está en medio
  const ruta = R.calcularRuta(MUNDO, { x: -150, y: 0 }, { x: 300, y: 0 }, OPC);
  // No puede ir en línea directa de un solo salto porque cortaría el pueblo A
  assert.ok(ruta.length > 1);
});

t('distanciaRestanteRuta: calcula correctamente la suma de metros que quedan para llegar al destino', () => {
  const puntos = [{ x: 100, y: 0 }, { x: 250, y: 0 }, { x: 250, y: 100 }];
  // Desde (0, 0) hasta puntos[0] (distancia 100) + de puntos[0] a puntos[1] (150) + de puntos[1] a puntos[2] (100) = 350m
  const dTotal = R.distanciaRestanteRuta({ x: 0, y: 0 }, puntos, 0);
  assert.strictEqual(dTotal, 350);

  // Estando ya en el punto 1 y avanzando hacia el punto 2
  const dRest = R.distanciaRestanteRuta({ x: 250, y: 30 }, puntos, 2);
  assert.strictEqual(dRest, 70); // 100 - 30 = 70m
});

t('en campo abierto con lago o colisión en medio: rodea la zona bloqueada en lugar de ir en línea recta', () => {
  const esBloqueado = (x, y) => Math.hypot(x - 450, y - 200) < 40;
  const origen = { x: 350, y: 200 };
  const dest = { x: 550, y: 200 };
  const ruta = R.calcularRuta(MUNDO, origen, dest, Object.assign({}, OPC, { esBloqueado }));
  assert.ok(ruta.length > 1, 'Debe generar puntos de rodeo alrededor del obstáculo');
  let prev = origen;
  for (const p of ruta) {
    for (let s = 1; s <= 12; s++) {
      const mx = prev.x + (p.x - prev.x) * (s / 12);
      const my = prev.y + (p.y - prev.y) * (s / 12);
      assert.ok(!esBloqueado(mx, my), `El tramo cruzó la zona bloqueada en (${mx.toFixed(1)}, ${my.toFixed(1)})`);
    }
    prev = p;
  }
});

t('dentro de un pueblo con edificios o fuente en medio: evita atravesar las colisiones', () => {
  const esBloqueado = (x, y) => x > -15 && x < 15 && y > -15 && y < 15;
  const origen = { x: -40, y: 0 };
  const dest = { x: 40, y: 0 };
  const ruta = R.calcularRuta(MUNDO, origen, dest, Object.assign({}, OPC, { esBloqueado }));
  assert.ok(ruta.length > 1, 'Debe rodear el bloque central dentro del pueblo');
  let prev = origen;
  for (const p of ruta) {
    for (let s = 1; s <= 10; s++) {
      const mx = prev.x + (p.x - prev.x) * (s / 10);
      const my = prev.y + (p.y - prev.y) * (s / 10);
      assert.ok(!esBloqueado(mx, my), `La ruta atravesó edificio en (${mx.toFixed(1)}, ${my.toFixed(1)})`);
    }
    prev = p;
  }
});

t('con acantilado (>50% de pendiente) en línea recta: elige rodear o usar la red de caminos', () => {
  const altura = (x, y) => (Math.hypot(x - 500, y - 300) < 55 ? 80 : 0);
  const origen = { x: 350, y: 300 };
  const dest = { x: 650, y: 300 };
  const ruta = R.calcularRuta(MUNDO, origen, dest, Object.assign({}, OPC, { altura }));
  assert.ok(ruta.length > 1, 'Debe rodear la montaña escarpada');
  assert.ok(ruta.every(p => altura(p.x, p.y) === 0), 'Ningún punto de paso debe subir a la cima escarpada');
});

t('CharacterController.caminarADestino esquiva preventivamente un colisionador frontal sin quedar atascado', () => {
  const prevWin = global.window;
  const prevThree = global.THREE;
  global.window = { addEventListener: () => {} };
  class Vec3 {
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
    clone() { return new Vec3(this.x, this.y, this.z); }
    distanceTo(v) { return Math.hypot(this.x - v.x, this.y - v.y, this.z - v.z); }
  }
  class Quat {
    constructor() { this.x = 0; this.y = 0; this.z = 0; this.w = 1; }
    setFromAxisAngle(axis, angle) {
      const s = Math.sin(angle / 2);
      this.x = axis.x * s; this.y = axis.y * s; this.z = axis.z * s; this.w = Math.cos(angle / 2);
      return this;
    }
    slerp() { return this; }
  }
  class Group {
    constructor() { this.position = new Vec3(); this.rotation = { order: 'XYZ', y: 0 }; this.quaternion = new Quat(); this.scale = new Vec3(1, 1, 1); this.children = []; }
    add(...a) { this.children.push(...a); }
    remove() {}
    traverse() {}
  }
  class Mat { constructor() { this.opacity = 1; this.transparent = false; } }
  class Geo { translate() {} }
  global.THREE = { Vector3: Vec3, Quaternion: Quat, Group, Mesh: Group, BoxGeometry: Geo, MeshStandardMaterial: Mat };
  try {
    const CharLib = require('../js/character.js');
    const col = { type: 'circle', x: 0, z: 10, r: 3.0 };
    const worldStub = {
      getWalkableHeight: () => 0,
      getColliders: () => [col],
      isWaterHazard: () => false
    };
    const ctrl = new CharLib.CharacterController({
      scene: new Group(), camera: { position: new Vec3(0, 5, -10) }, controls: { target: new Vec3() }, world: worldStub, glbUrl: null
    });
    ctrl.root.position.set(0, 0, 0);
    ctrl.destino = { x: 0, z: 22, parar: 0.6 };
    for (let i = 0; i < 90; i++) {
      ctrl.caminarADestino(0.05, false);
      const dObst = Math.hypot(ctrl.root.position.x - col.x, ctrl.root.position.z - col.z);
      assert.ok(dObst >= col.r + ctrl.radius - 0.05, `Entró en el colisionador: dist=${dObst.toFixed(2)}`);
      if (Math.hypot(ctrl.root.position.x - 0, ctrl.root.position.z - 22) <= 0.7) break;
    }
    assert.ok(!ctrl.atascado, 'No debe atascarse al rodear el obstáculo');
    assert.ok(Math.hypot(ctrl.root.position.x, ctrl.root.position.z - 22) <= 0.8, 'Debe alcanzar el destino rodeando el colisionador');
  } finally {
    global.window = prevWin;
    global.THREE = prevThree;
  }
});

t('detecta muros finos (2.4 m) tanto en segmentoLibre como en calcularRuta', () => {
  const esBloqueado = (x, y) => Math.abs(x) <= 1.2 && Math.abs(y) <= 30;
  assert.strictEqual(R.segmentoLibre({ x: -20, y: 0 }, { x: 20, y: 0 }, { esBloqueado }), false);
  const ruta = R.calcularRuta(MUNDO, { x: -20, y: 0 }, { x: 20, y: 0 }, Object.assign({}, OPC, { esBloqueado }));
  assert.ok(ruta.length > 1, 'Debe rodear el muro fino de 2.4 m');
  let prev = { x: -20, y: 0 };
  for (const p of ruta) {
    assert.ok(R.segmentoLibre(prev, p, { esBloqueado }), `El tramo (${prev.x.toFixed(1)},${prev.y.toFixed(1)})->(${p.x.toFixed(1)},${p.y.toFixed(1)}) cruza el muro fino`);
    prev = p;
  }
});

t('buscarRodeoLocal no corta esquinas diagonales entre bloques tocándose en vértice', () => {
  const esBloqueado = (x, y) =>
    (x >= 0 && x <= 14 && y >= 0 && y <= 14) ||
    (x >= -14 && x <= 0 && y >= -14 && y <= 0);
  const origen = { x: -10, y: 10 };
  const dest = { x: 10, y: -10 };
  const ruta = R.calcularRuta(MUNDO, origen, dest, Object.assign({}, OPC, { esBloqueado }));
  assert.ok(ruta.length >= 2, 'Debe rodear por fuera de los bloques sin atravesar la unión diagonal');
  let prev = origen;
  for (const p of ruta) {
    for (let s = 1; s <= 24; s++) {
      const mx = prev.x + (p.x - prev.x) * (s / 24);
      const my = prev.y + (p.y - prev.y) * (s / 24);
      assert.ok(!esBloqueado(mx, my), `Cortó esquina diagonal en (${mx.toFixed(2)}, ${my.toFixed(2)})`);
    }
    prev = p;
  }
});

t('pueblo amurallado con salida a 34° de la puerta cardinal: sale por la puerta real sin chocar con la muralla', () => {
  const R_WALL = 98;
  const angExt = 124 * Math.PI / 180; // 34° al oeste respecto al Sur (90°)
  const end = { x: Math.cos(angExt) * 120, y: Math.sin(angExt) * 120 };
  const outer = { x: Math.cos(angExt) * 132, y: Math.sin(angExt) * 132 };
  const wallBlocked = (x, y) => {
    const r = Math.hypot(x, y);
    if (r >= R_WALL - 2.2 && r <= R_WALL + 2.2) {
      if (y > 0 && Math.abs(x) < 4.4) return false;
      return true;
    }
    return false;
  };
  const mundoRotado = {
    towns: [A, B],
    roads: [{ id: 'ab', from: 'A', to: 'B', points: [{ x: 0, y: 0 }, end, outer, { x: Math.cos(angExt) * 400, y: Math.sin(angExt) * 400 }, B] }]
  };
  const opcMuralla = {
    mitad: () => 120,
    radioMuro: () => R_WALL + 4,
    esBloqueado: wallBlocked,
    salida: (idPueblo) => {
      if (idPueblo !== 'A') return [];
      return [
        { x: 0, y: 18 },
        { x: 0, y: 55 },
        { x: 0, y: 92, puerta: true },
        { x: 0, y: 98, puerta: true },
        { x: 0, y: 104, puerta: true },
        end,
        outer
      ];
    }
  };
  const destino = { x: Math.cos(angExt) * 320, y: Math.sin(angExt) * 320 };
  const ruta = R.calcularRuta(mundoRotado, { x: 0, y: 8 }, destino, opcMuralla);
  const idxPuerta = ruta.findIndex(p => p.puerta && Math.hypot(p.x - 0, p.y - 98) < 4);
  assert.ok(idxPuerta >= 0, 'La ruta debe cruzar exactamente por la puerta Sur marcada con puerta:true');
  let prev = { x: 0, y: 8 };
  for (const p of ruta) {
    assert.ok(R.segmentoLibre(prev, p, { esBloqueado: wallBlocked }), `Atravesó la muralla en (${prev.x.toFixed(1)},${prev.y.toFixed(1)})->(${p.x.toFixed(1)},${p.y.toFixed(1)})`);
    prev = p;
  }
});

t('héroe fuera de la muralla pero dentro de tileHalf (R+4 < r < tileHalf): no retrocede atravesando el muro', () => {
  const R_WALL = 98;
  const wallBlocked = (x, y) => {
    const r = Math.hypot(x, y);
    return r >= R_WALL - 2.2 && r <= R_WALL + 2.2 && !(Math.abs(y) < 4.4 && x > 0);
  };
  const desdeFuera = { x: 108, y: 12 };
  const dest = { x: 450, y: 0 };
  const opcMuralla = Object.assign({}, OPC, {
    mitad: () => 120,
    radioMuro: () => R_WALL + 4,
    esBloqueado: wallBlocked
  });
  const ruta = R.calcularRuta(MUNDO, desdeFuera, dest, opcMuralla);
  assert.ok(ruta.every(p => Math.hypot(p.x, p.y) > R_WALL), 'No debe volver hacia la plaza dentro de la muralla');
});

t('héroe ya encaminado por la calle interior de salida: sigue hacia la puerta sin volver a la plaza', () => {
  const opcMulti = {
    mitad: () => 120,
    radioMuro: () => 102,
    salida: (id) => {
      if (id !== 'A') return [{ x: 900, y: 0 }, { x: 888, y: 0 }];
      return [
        { x: 18, y: 0 },
        { x: 40, y: 0 },
        { x: 65, y: 0 },
        { x: 92, y: 0, puerta: true },
        { x: 98, y: 0, puerta: true },
        { x: 104, y: 0, puerta: true },
        { x: 120, y: 0 },
        { x: 132, y: 0 }
      ];
    }
  };
  const ruta = R.calcularRuta(MUNDO, { x: 60, y: 4 }, { x: 500, y: 0 }, opcMulti);
  assert.ok(!ruta.some(p => p.plaza), 'No debe retroceder a la plaza si ya está junto a la calle de salida');
  assert.ok(ruta.every(p => p.x >= 58), 'Debe avanzar hacia la puerta Este y el destino');
});

t('plaza con fuente central bloqueada (r = 4.65): rodea la fuente sin atravesarla', () => {
  const esBloqueado = (x, y) => Math.hypot(x, y) < 4.65;
  const opcFuente = {
    mitad: () => 120,
    radioMuro: () => 102,
    esBloqueado,
    salida: (id) => id === 'A'
      ? [{ x: 18, y: 0 }, { x: 50, y: 0 }, { x: 92, y: 0, puerta: true }, { x: 98, y: 0, puerta: true }, { x: 104, y: 0, puerta: true }, { x: 120, y: 0 }, { x: 132, y: 0 }]
      : [{ x: 900, y: 0 }, { x: 888, y: 0 }]
  };
  const origen = { x: -50, y: 0 };
  const ruta = R.calcularRuta(MUNDO, origen, { x: 500, y: 0 }, opcFuente);
  let prev = origen;
  for (const p of ruta) {
    assert.ok(!esBloqueado(p.x, p.y), `Punto sobre la fuente en (${p.x.toFixed(1)},${p.y.toFixed(1)})`);
    assert.ok(R.segmentoLibre(prev, p, { esBloqueado }), 'Un tramo atravesó la fuente central de la plaza');
    prev = p;
  }
});

t('integración Valdris + VillageLib: los 5 pueblos amurallados salen por sus puertas sin chocar con muros ni atascarse', () => {
  const prevWin = global.window;
  const prevThree = global.THREE;
  global.window = global;
  class Vec3 {
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
    clone() { return new Vec3(this.x, this.y, this.z); }
    distanceTo(v) { return Math.hypot(this.x - v.x, this.y - v.y, this.z - v.z); }
  }
  class Quat {
    constructor() { this.x = 0; this.y = 0; this.z = 0; this.w = 1; }
    setFromAxisAngle(axis, angle) {
      const s = Math.sin(angle / 2);
      this.x = axis.x * s; this.y = axis.y * s; this.z = axis.z * s; this.w = Math.cos(angle / 2);
      return this;
    }
    slerp() { return this; }
  }
  class Group {
    constructor() { this.position = new Vec3(); this.rotation = { order: 'XYZ', y: 0 }; this.quaternion = new Quat(); this.scale = new Vec3(1, 1, 1); this.children = []; }
    add(...a) { this.children.push(...a); }
    remove() {}
    traverse() {}
  }
  class Mat { constructor() { this.opacity = 1; this.transparent = false; } }
  class Geo { translate() {} }
  global.THREE = {
    Vector3: Vec3, Quaternion: Quat, Group, Mesh: Group,
    BoxGeometry: Geo, MeshStandardMaterial: Mat, Matrix4: class {}, Color: class {}
  };
  global.window.addEventListener = () => {};
  try {
    require('../js/village-core.js');
    const CharLib = require('../js/character.js');
    const valdris = require('../mundos/valdris.mundo.json');
    const DEG = Math.PI / 180;
    const CARD_ANG = { E: 0, S: Math.PI / 2, W: Math.PI, N: Math.PI * 1.5 };
    const halfTown = t => Math.max(240, (42 + ((t.cfg && t.cfg.size) || 3) * 14 + 65) * 2) / 2;
    const wallR = t => 42 + ((t.cfg && t.cfg.size) || 3) * 14;

    const buildTownCols = (t) => {
      const rot = ((t.cfg && t.cfg.rotation) || 0) * DEG;
      const cr = Math.cos(rot), sr = Math.sin(rot);
      const W2 = (lx, lz) => ({ x: t.x + lx * cr - lz * sr, z: t.y + lx * sr + lz * cr });
      const cols = [];
      const f = W2(0, 0);
      cols.push({ type: 'circle', x: f.x, z: f.z, r: 3.8 });
      if (t.cfg && t.cfg.hasProps) {
        for (let i = 0; i < 6; i++) {
          const ang = (i / 6) * Math.PI * 2 + 0.4;
          const sp = W2(Math.cos(ang) * 12.2, Math.sin(ang) * 12.2);
          cols.push({ type: 'circle', x: sp.x, z: sp.z, r: 1.74 });
        }
      }
      const Rw = wallR(t);
      const claimed = new Set();
      const gateAngles = [];
      (t.cfg.exits || []).forEach(ex => {
        const a = ((Number(ex.angle) || 0) % 360 + 360) % 360 * DEG;
        let mk = null, bestDiff = 0.68;
        ['E', 'S', 'W', 'N'].forEach(key => {
          if (claimed.has(key)) return;
          let d = Math.abs(a - CARD_ANG[key]);
          if (d > Math.PI) d = Math.PI * 2 - d;
          if (d < bestDiff) { bestDiff = d; mk = key; }
        });
        const ga = mk ? CARD_ANG[mk] : a;
        if (mk) claimed.add(mk);
        gateAngles.push(ga);
        const halfClear = Math.max(4.4, (t.cfg.roadWidth || 7) * 0.92 * 0.56);
        const gx = Math.cos(ga) * Rw, gz = Math.sin(ga) * Rw;
        const pxVec = -Math.sin(ga), pzVec = Math.cos(ga);
        [-1, 1].forEach(sd => {
          const pw = W2(gx + pxVec * (halfClear + 1.2) * sd, gz + pzVec * (halfClear + 1.2) * sd);
          cols.push({ type: 'circle', x: pw.x, z: pw.z, r: 1.5, wall: true });
        });
      });
      const halfOpen = Math.max(4.4, (t.cfg.roadWidth || 7) * 0.92 * 0.56) / Rw;
      for (let a = 0; a < Math.PI * 2; a += 2.0 / Rw) {
        const nearGate = gateAngles.some(ga => {
          let d = Math.abs(a - ga);
          if (d > Math.PI) d = Math.PI * 2 - d;
          return d < halfOpen;
        });
        if (nearGate) continue;
        const wp = W2(Math.cos(a) * Rw, Math.sin(a) * Rw);
        cols.push({ type: 'circle', x: wp.x, z: wp.z, r: 1.3, wall: true });
      }
      return cols;
    };

    const walled = valdris.towns.filter(t => t.cfg && t.cfg.hasWalls);
    assert.strictEqual(walled.length, 5, 'Valdris tiene 5 pueblos amurallados');
    const townColsMap = new Map(valdris.towns.map(t => [t.id, buildTownCols(t)]));

    const getColliders = (x, z) => {
      const out = [];
      for (const t of valdris.towns) {
        if (Math.hypot(x - t.x, z - t.y) > halfTown(t) * 1.5) continue;
        const cs = townColsMap.get(t.id);
        for (let i = 0; i < cs.length; i++) out.push(cs[i]);
      }
      return out;
    };
    const esBloqueado = (x, z) => {
      const cols = getColliders(x, z);
      for (let i = 0; i < cols.length; i++) {
        const c = cols[i];
        if (Math.hypot(x - c.x, z - c.z) < c.r + 0.85) return true;
      }
      return false;
    };
    const opcionesValdris = {
      mitad: id => halfTown(valdris.towns.find(t => t.id === id)),
      radioMuro: id => wallR(valdris.towns.find(t => t.id === id)) + 4,
      salida: (idPueblo, idCamino) => {
        const t = valdris.towns.find(x => x.id === idPueblo);
        const rot = ((t.cfg && t.cfg.rotation) || 0) * DEG;
        const cr = Math.cos(rot), sr = Math.sin(rot);
        const pts = global.window.VillageLib.computeExitRouteLocal(t.cfg, idCamino);
        return pts.map(p => {
          const w = { x: t.x + p.x * cr - p.z * sr, y: t.y + p.x * sr + p.z * cr };
          if (p.puerta) w.puerta = true;
          return w;
        });
      },
      esBloqueado,
      pasoSondeo: 1.2
    };

    // Calentamiento previo de JIT antes de medir latencia real en estado estacionario
    if (walled.length && valdris.zones.length) {
      const tw = walled[0], zw = valdris.zones[0];
      R.calcularRuta(valdris, { x: tw.x, y: tw.y + 7 }, { x: zw.x, y: zw.y }, opcionesValdris);
    }

    walled.forEach(t => {
      const rot = ((t.cfg && t.cfg.rotation) || 0) * DEG;
      const cr = Math.cos(rot), sr = Math.sin(rot);
      const z = valdris.zones.slice().sort((a, b) => Math.hypot(a.x - t.x, a.y - t.y) - Math.hypot(b.x - t.x, b.y - t.y))[0];
      const desde = { x: t.x - 10 * cr, y: t.y - 10 * sr };
      const t0 = Date.now();
      const ruta = R.calcularRuta(valdris, desde, { x: z.x, y: z.y }, opcionesValdris);
      const elapsed = Date.now() - t0;
      assert.ok(elapsed < 50, `${t.name} -> ${z.name} demasiado lento: ${elapsed} ms`);
      assert.ok(ruta.some(p => p.puerta), `${t.name} debe marcar puntos de puerta en la ruta`);

      const ctrl = new CharLib.CharacterController({
        scene: new Group(), camera: { position: new Vec3(0, 5, -10) }, controls: { target: new Vec3() },
        world: { getWalkableHeight: () => 0, getColliders, isWaterHazard: () => false }, glbUrl: null
      });
      ctrl.root.position.set(desde.x, 0, desde.y);
      const cols = townColsMap.get(t.id);
      let idx = 0, exited = false;
      for (let step = 0; step < 600; step++) {
        const px = ctrl.root.position.x, pz = ctrl.root.position.z;
        if (Math.hypot(px - t.x, pz - t.y) > wallR(t) + 18) { exited = true; break; }
        let w = ruta[idx];
        const ultimo = idx === ruta.length - 1;
        const d = Math.hypot(w.x - px, w.y - pz);
        const radioPaso = w.plaza ? (esBloqueado(w.x, w.y) ? 8.5 : 4.5) : (w.puerta ? 2.2 : 3.2);
        let avanzar = !ultimo && d <= radioPaso;
        if (!avanzar && !ultimo) {
          const sig = ruta[idx + 1];
          const dotSig = (sig.x - w.x) * (px - w.x) + (sig.y - w.y) * (pz - w.y);
          if (dotSig > 0) {
            const masCercaSig = Math.hypot(sig.x - px, sig.y - pz) < Math.hypot(sig.x - w.x, sig.y - w.y);
            const segOk = R.segmentoLibre({ x: px, y: pz }, sig, opcionesValdris);
            if (w.puerta ? (d <= 6 && masCercaSig && segOk) : (d <= 12 && (esBloqueado(w.x, w.y) || masCercaSig) && segOk)) avanzar = true;
          }
        }
        if (avanzar) { idx++; w = ruta[idx]; }
        ctrl.destino = { x: w.x, z: w.y, parar: idx === ruta.length - 1 ? 6 : 0.5 };
        ctrl.caminarADestino(0.05, false);
        assert.ok(!ctrl.atascado, `${t.name} se atascó en paso ${step}`);
        for (const c of cols) {
          if (c.wall) {
            assert.ok(Math.hypot(ctrl.root.position.x - c.x, ctrl.root.position.z - c.z) >= c.r + ctrl.radius - 0.02, `${t.name} rozó muralla/pilar`);
          }
        }
      }
      assert.ok(exited, `${t.name} no salió fuera de la muralla`);
    });
  } finally {
    global.window = prevWin;
    global.THREE = prevThree;
  }
});

console.log(`\n${n} pruebas de la ruta superadas.`);
