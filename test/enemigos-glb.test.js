// Pruebas de los modelos GLB de enemigos (js/enemigos-glb.js): índice, rutas, clips, carga y fallback.
// Ejecutar: node test/enemigos-glb.test.js
const assert = require('assert');

// Índice de prueba: un enemigo con las dos versiones y otro solo con low
globalThis.ENEMY_GLB_INDEX = {
  frost_wyrm: { medium: 'glb/medium/dragones/frost_wyrm_medium.glb', low: 'glb/low/dragones/enemy_frost_wyrm_vorthrax_low.glb' },
  elder_dragon: { low: 'glb/low/dragones/enemy_elder_dragon_ignis_low.glb' }
};
const EnemyGlb = require('../js/enemigos-glb.js');

let pasadas = 0;
async function prueba(nombre, fn) {
  try {
    await fn();
    pasadas++;
    console.log('ok -', nombre);
  } catch (err) {
    console.error('FALLO -', nombre);
    throw err;
  }
}

// THREE mínimo: lo que usa crearReproductor y actualizar
function threeFalso() {
  class AccionFalsa {
    constructor(clip) { this.clip = clip; this.loop = 'repeat'; this.clamp = false; this.reproduciendo = false; this.reinicios = 0; }
    setLoop(modo) { this.loop = modo; return this; }
    reset() { this.reinicios++; return this; }
    play() { this.reproduciendo = true; return this; }
    crossFadeTo(otra, duracion) { this.fundidoA = { otra, duracion }; this.reproduciendo = false; return this; }
  }
  class MezcladorFalso {
    constructor(raiz) { this.raiz = raiz; this.acciones = new Map(); this.actualizado = 0; this.parado = false; }
    clipAction(clip) { if (!this.acciones.has(clip)) this.acciones.set(clip, new AccionFalsa(clip)); return this.acciones.get(clip); }
    update(dt) { this.actualizado += dt; }
    stopAllAction() { this.parado = true; }
  }
  return { AnimationMixer: MezcladorFalso, LoopOnce: 'once', LoopRepeat: 'repeat' };
}

(async () => {
  await prueba('la ruta sale del índice: medium para cerca, low para lejos', () => {
    assert.strictEqual(EnemyGlb.rutaModeloEnemigo('frost_wyrm', 'cerca'), 'glb/medium/dragones/frost_wyrm_medium.glb');
    assert.strictEqual(EnemyGlb.rutaModeloEnemigo('frost_wyrm', 'lejos'), 'glb/low/dragones/enemy_frost_wyrm_vorthrax_low.glb');
  });

  await prueba('sin versión medium en el índice, cerca cae al procedural (null)', () => {
    assert.strictEqual(EnemyGlb.rutaModeloEnemigo('elder_dragon', 'cerca'), null);
    assert.strictEqual(EnemyGlb.rutaModeloEnemigo('elder_dragon', 'lejos'), 'glb/low/dragones/enemy_elder_dragon_ignis_low.glb');
  });

  await prueba('arquetipos no indexados, sin arquetipo o con tipo desconocido dan null', () => {
    assert.strictEqual(EnemyGlb.rutaModeloEnemigo('dragon_inventado', 'cerca'), null);
    assert.strictEqual(EnemyGlb.rutaModeloEnemigo('', 'cerca'), null);
    assert.strictEqual(EnemyGlb.rutaModeloEnemigo(undefined, 'lejos'), null);
    assert.strictEqual(EnemyGlb.rutaModeloEnemigo('frost_wyrm', 'otra'), null);
    assert.strictEqual(EnemyGlb.rutaModeloEnemigo('constructor', 'cerca'), null, 'no cuenta propiedades heredadas');
  });

  await prueba('pedir sin índice para el arquetipo devuelve null (fallback procedural)', () => {
    EnemyGlb._vaciarCache();
    assert.strictEqual(EnemyGlb.pedir('dragon_inventado', 'cerca'), null);
  });

  await prueba('buscarClip empareja los clips del editor con cada estado', () => {
    const clips = [{ name: 'Idle' }, { name: 'Walk' }, { name: 'Attack' }, { name: 'JumpBite' }, { name: 'Hit' }, { name: 'Death' }];
    assert.strictEqual(EnemyGlb.buscarClip(clips, 'idle').name, 'Idle');
    assert.strictEqual(EnemyGlb.buscarClip(clips, 'walk').name, 'Walk');
    assert.strictEqual(EnemyGlb.buscarClip(clips, 'attack').name, 'Attack');
    assert.strictEqual(EnemyGlb.buscarClip(clips, 'hit').name, 'Hit');
    assert.strictEqual(EnemyGlb.buscarClip(clips, 'death').name, 'Death');
    assert.strictEqual(EnemyGlb.buscarClip([{ name: 'Idle' }], 'death'), null);
    assert.strictEqual(EnemyGlb.buscarClip(undefined, 'idle'), null);
  });

  await prueba('sin GLTFPool el enemigo indexado queda en "falta" (fallback procedural)', () => {
    EnemyGlb._vaciarCache();
    const savedPool = globalThis.GLTFPool;
    delete globalThis.GLTFPool;
    const e = EnemyGlb.pedir('frost_wyrm', 'cerca');
    assert.strictEqual(e.estado, 'falta');
    globalThis.GLTFPool = savedPool;
  });

  await prueba('pedir carga una vez por ruta, pasa a "listo" y expone escena y clips', async () => {
    EnemyGlb._vaciarCache();
    let llamadas = 0;
    const escena = { nombre: 'escena-medium' };
    const clips = [{ name: 'Idle' }];
    globalThis.GLTFPool = {
      cargar(loader, ruta) {
        llamadas++;
        assert.strictEqual(ruta, 'glb/medium/dragones/frost_wyrm_medium.glb');
        return Promise.resolve({ scene: escena, animations: clips });
      }
    };
    const primera = EnemyGlb.pedir('frost_wyrm', 'cerca');
    assert.strictEqual(primera.estado, 'cargando');
    const segunda = EnemyGlb.pedir('frost_wyrm', 'cerca');
    assert.strictEqual(segunda, primera, 'la misma entrada en llamadas sucesivas');
    await new Promise(r => setTimeout(r, 0));
    assert.strictEqual(primera.estado, 'listo');
    assert.strictEqual(primera.escena, escena);
    assert.deepStrictEqual(primera.clips, clips);
    assert.strictEqual(llamadas, 1, 'una sola descarga');
  });

  await prueba('si el archivo no existe, pedir termina en "falta" y no reintenta', async () => {
    EnemyGlb._vaciarCache();
    let llamadas = 0;
    globalThis.GLTFPool = {
      cargar() { llamadas++; return Promise.reject(new Error('404')); }
    };
    const e = EnemyGlb.pedir('elder_dragon', 'lejos');
    await new Promise(r => setTimeout(r, 0));
    assert.strictEqual(e.estado, 'falta');
    EnemyGlb.pedir('elder_dragon', 'lejos');
    assert.strictEqual(llamadas, 1);
  });

  await prueba('crearReproductor sin clips devuelve null (modelo estático)', () => {
    const THREE = threeFalso();
    assert.strictEqual(EnemyGlb.crearReproductor(THREE, {}, []), null);
    assert.strictEqual(EnemyGlb.crearReproductor(THREE, {}, undefined), null);
  });

  await prueba('actualizar cambia de clip con fundido, usa reposo si falta andar o atacar, y avanza el mixer', () => {
    const THREE = threeFalso();
    const clips = [{ name: 'Idle' }, { name: 'Walk' }, { name: 'Hit' }];
    const rep = EnemyGlb.crearReproductor(THREE, {}, clips);
    assert.ok(rep.acciones.idle && rep.acciones.walk && rep.acciones.hit);
    assert.strictEqual(rep.acciones.hit.loop, 'once', 'el golpe se reproduce una vez');
    assert.strictEqual(rep.acciones.hit.clampWhenFinished, true);
    EnemyGlb.actualizar(rep, 'idle', 0.1);
    assert.strictEqual(rep.actual, rep.acciones.idle);
    EnemyGlb.actualizar(rep, 'walk', 0.1);
    assert.strictEqual(rep.actual, rep.acciones.walk);
    assert.ok(rep.acciones.idle.fundidoA && rep.acciones.idle.fundidoA.otra === rep.acciones.walk, 'fundido de idle a walk');
    // Sin clip de ataque: se queda en reposo
    EnemyGlb.actualizar(rep, 'attack', 0.1);
    assert.strictEqual(rep.actual, rep.acciones.idle);
    // Sin clip de muerte: se mantiene la pose actual
    EnemyGlb.actualizar(rep, 'death', 0.1);
    assert.strictEqual(rep.actual, rep.acciones.idle);
    assert.ok(rep.mixer.actualizado > 0.3);
    EnemyGlb.detener(rep);
    assert.strictEqual(rep.mixer.parado, true);
  });

  console.log(`\n${pasadas} pruebas de enemigos GLB pasadas`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
