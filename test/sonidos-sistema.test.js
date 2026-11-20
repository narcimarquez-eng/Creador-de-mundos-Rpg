// Pruebas integrales del sistema profesional de audio (MusicaRPG + Sonidos + integración en visor-mundo.html).
// Ejecutar: node test/sonidos-sistema.test.js
const assert = require('assert');
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const C = require('../js/combat.js');

let n = 0;
function t(nombre, fn) { fn(); n++; console.log('ok -', nombre); }

function crearEntornoAudio({ full = true } = {}) {
  let fakeNowMs = 10000;
  let intervalId = 0, timeoutId = 0;
  const intervals = new Map();
  const timeouts = new Map();

  const stats = {
    gains: 0,
    filters: 0,
    oscillators: 0,
    sources: 0,
    compressors: 0,
    convolvers: 0,
    panners: 0,
    periodicWaves: 0,
    stops: 0,
    invalidParams: []
  };

  function makeParam(initial = 0) {
    const p = {
      value: initial,
      setValueAtTime(v) {
        if (!Number.isFinite(v)) stats.invalidParams.push('setValueAtTime:' + v);
        p.value = v;
      },
      linearRampToValueAtTime(v) {
        if (!Number.isFinite(v)) stats.invalidParams.push('linearRamp:' + v);
        p.value = v;
      },
      exponentialRampToValueAtTime(v) {
        if (!Number.isFinite(v) || v <= 0) stats.invalidParams.push('expRamp:' + v);
        p.value = v;
      },
      cancelScheduledValues() {}
    };
    return p;
  }

  let instanciaAc = null;
  class FakeAudioContext {
    constructor() {
      instanciaAc = this;
      this.sampleRate = 22050;
      this.currentTime = 0.5;
      this.state = 'suspended';
      this.destination = {};
    }
    createGain() { stats.gains++; return { gain: makeParam(1), connect() {} }; }
    createBiquadFilter() { stats.filters++; return { type: 'lowpass', frequency: makeParam(400), Q: makeParam(0.7), connect() {} }; }
    createBuffer(ch, len) {
      const channels = Array.from({ length: ch }, () => new Float32Array(len));
      return { numberOfChannels: ch, length: len, getChannelData: idx => channels[idx] };
    }
    createBufferSource() {
      stats.sources++;
      return { buffer: null, loop: false, connect() {}, start() {}, stop() { stats.stops++; } };
    }
    createOscillator() {
      stats.oscillators++;
      return { type: 'sine', frequency: makeParam(440), connect() {}, setPeriodicWave() {}, start() {}, stop() { stats.stops++; } };
    }
    resume() { this.state = 'running'; return { then(cb) { if (cb) cb(); return this; }, catch() { return this; } }; }
    suspend() { this.state = 'suspended'; return { then(cb) { if (cb) cb(); return this; }, catch() { return this; } }; }
  }

  if (full) {
    FakeAudioContext.prototype.createDynamicsCompressor = function () {
      stats.compressors++;
      return { threshold: makeParam(-16), knee: makeParam(18), ratio: makeParam(3.5), attack: makeParam(0.006), release: makeParam(0.18), connect() {} };
    };
    FakeAudioContext.prototype.createConvolver = function () {
      stats.convolvers++;
      return { buffer: null, normalize: true, connect() {} };
    };
    FakeAudioContext.prototype.createStereoPanner = function () {
      stats.panners++;
      return { pan: makeParam(0), connect() {} };
    };
    FakeAudioContext.prototype.createPeriodicWave = function () {
      stats.periodicWaves++;
      return { _wave: true };
    };
  }

  const sb = {
    AudioContext: FakeAudioContext,
    Math,
    Float32Array,
    Array,
    Number,
    Object,
    Promise,
    Date: { now: () => fakeNowMs },
    setInterval: (fn) => { const id = ++intervalId; intervals.set(id, fn); return id; },
    clearInterval: (id) => { intervals.delete(id); },
    setTimeout: (fn) => { const id = ++timeoutId; timeouts.set(id, fn); return id; },
    clearTimeout: (id) => { timeouts.delete(id); }
  };
  sb.window = sb;
  sb.globalThis = sb;

  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'js/musica-rpg.js'), 'utf8'), sb);
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'js/sonidos.js'), 'utf8'), sb);

  return {
    sb,
    stats,
    get ac() { return instanciaAc; },
    avanzarTiempo(s) {
      if (instanciaAc) instanciaAc.currentTime += s;
      fakeNowMs += Math.round(s * 1000);
    },
    ejecutarIntervalos() { intervals.forEach(fn => fn()); },
    ejecutarTimeouts() {
      const lista = Array.from(timeouts.entries());
      timeouts.clear();
      lista.forEach(([, fn]) => fn());
    },
    limpiar() { sb.Sonidos.activar(false); }
  };
}

t('MusicaRPG y Sonidos crean compresor, convolver estéreo, 4 buses de volumen y reverb exterior/mazmorra', () => {
  const env = crearEntornoAudio({ full: true });
  const S = env.sb.Sonidos;

  assert.deepStrictEqual(Object.assign({}, S.getVolumenes()), { master: 0.90, musica: 0.62, sfx: 0.78, ambiente: 0.55 });
  S.setAmbiente('campo', 'day');
  assert.strictEqual(S.desbloquear(), true);
  assert.strictEqual(env.stats.compressors, 1, 'debe crear 1 compresor maestro');
  assert.strictEqual(env.stats.convolvers, 1, 'debe crear 1 convolver estéreo');
  assert.ok(env.stats.periodicWaves >= 6, 'debe sintetizar al menos 6 formas de onda instrumentales');
  assert.strictEqual(S.estado().reverbModo, 'exterior');

  S.setVolumen('musica', 0.4);
  S.setVolumen('sfx', 1.5); // debe clampear a 1
  S.setVolumen('ambiente', -0.2); // debe clampear a 0
  assert.deepStrictEqual(Object.assign({}, S.getVolumenes()), { master: 0.90, musica: 0.4, sfx: 1, ambiente: 0 });

  S.setAmbiente('mazmorra', 'night');
  assert.strictEqual(S.estado().reverbModo, 'mazmorra');
  assert.strictEqual(S.estado().temaActual, 'mazmorra');
  assert.strictEqual(env.stats.invalidParams.length, 0, 'sin AudioParams inválidos');
  env.limpiar();
});

t('los 6 temas musicales arrancan y programan notas; setCombate cambia a batalla/jefe y regresa tras histéresis', () => {
  const env = crearEntornoAudio({ full: true });
  const S = env.sb.Sonidos;

  S.setAmbiente('pueblo', 'day');
  S.desbloquear();

  const temas = [
    ['pueblo', 'day'],
    ['pueblo', 'night'],
    ['campo', 'day'],
    ['agua', 'day'],
    ['mazmorra', 'night']
  ];
  temas.forEach(([tipo, hora]) => {
    const oscAntes = env.stats.oscillators;
    S.setAmbiente(tipo, hora);
    for (let i = 0; i < 4; i++) {
      env.avanzarTiempo(0.25);
      env.ejecutarIntervalos();
    }
    assert.ok(env.stats.oscillators > oscAntes, `el tema ${tipo} (${hora}) debe programar notas`);
  });

  // Música adaptativa de combate normal -> jefe fase 2 -> salida tras histéresis
  S.setAmbiente('campo', 'day');
  S.setCombate(true, false, false);
  assert.strictEqual(S.estado().temaActual, 'batalla');
  const oscBat = env.stats.oscillators;
  env.avanzarTiempo(0.3); env.ejecutarIntervalos();
  assert.ok(env.stats.oscillators > oscBat, 'tema batalla debe sonar');

  S.setCombate(true, true, true);
  assert.strictEqual(S.estado().temaActual, 'jefe');
  const oscJefe = env.stats.oscillators;
  env.avanzarTiempo(0.3); env.ejecutarIntervalos();
  assert.ok(env.stats.oscillators > oscJefe, 'tema jefe fase 2 debe sonar');

  // Salir de combate justo después no corta al instante (histéresis de 4500ms)
  S.setCombate(false);
  assert.strictEqual(S.estado().temaActual, 'jefe', 'debe mantener música de combate durante histéresis');

  env.avanzarTiempo(4.6);
  env.ejecutarTimeouts();
  assert.strictEqual(S.estado().temaActual, 'campo', 'tras la histéresis regresa al tema de zona');
  assert.strictEqual(env.stats.invalidParams.length, 0);
  env.limpiar();
});

t('todas las 32 habilidades de CombatLib.SKILLS generan audio distinto en inicio e impacto', () => {
  const env = crearEntornoAudio({ full: true });
  const S = env.sb.Sonidos;
  S.desbloquear();

  const skillIds = Object.keys(C.SKILLS);
  assert.strictEqual(skillIds.length, 32, 'deben comprobarse las 32 habilidades');

  skillIds.forEach(id => {
    env.avanzarTiempo(0.2);
    const antesIni = env.stats.oscillators + env.stats.sources;
    S.skill(id, 'inicio', { pan: -0.35 });
    const trasIni = env.stats.oscillators + env.stats.sources;
    assert.ok(trasIni > antesIni, `${id} fase inicio debe emitir sonido`);

    env.avanzarTiempo(0.2);
    const antesImp = env.stats.oscillators + env.stats.sources;
    S.skill(id, 'impacto', { pan: 0.35 });
    const trasImp = env.stats.oscillators + env.stats.sources;
    assert.ok(trasImp > antesImp, `${id} fase impacto debe emitir sonido`);
  });

  assert.ok(env.stats.panners > 0, 'debe usar pan estéreo en las habilidades');
  assert.strictEqual(env.stats.invalidParams.length, 0);
  env.limpiar();
});

t('clasificarEnemigo y Sonidos.enemigo cubren las 5 familias y sus 4 eventos', () => {
  const env = crearEntornoAudio({ full: true });
  const S = env.sb.Sonidos;
  S.desbloquear();

  const muestras = [
    ['jefe', { name: 'Señor Osario', boss: true }],
    ['nomuerto', { name: 'Esqueleto Guerrero' }],
    ['bestia', { name: 'Lobo Garra Roja' }],
    ['magico', { name: 'Archimago Sombrío', tipoRango: 'mago' }],
    ['humanoide', { name: 'Saqueador de Caminos' }]
  ];

  muestras.forEach(([esperada, info]) => {
    assert.strictEqual(S.clasificarEnemigo(info), esperada);
    ['aggro', 'ataque', 'golpeado', 'muerte'].forEach(ev => {
      env.avanzarTiempo(2.5);
      const antes = env.stats.oscillators + env.stats.sources;
      S.enemigo(ev, Object.assign({ pan: 0.2 }, info));
      const despues = env.stats.oscillators + env.stats.sources;
      assert.ok(despues > antes, `${esperada}:${ev} debe emitir sonido`);
    });
  });

  assert.strictEqual(env.stats.invalidParams.length, 0);
  env.limpiar();
});

t('SFX de defensa, pasos, foley, mundo y compatibilidad en modo degradado sin nodos opcionales', () => {
  [true, false].forEach(full => {
    const env = crearEntornoAudio({ full });
    const S = env.sb.Sonidos;
    S.setAmbiente('campo', 'day');
    S.desbloquear();

    const llamadas = [
      () => S.impacto('metal', { pan: -0.2 }),
      () => S.impacto('sordo'),
      () => S.impacto('flecha'),
      () => S.impacto('magia'),
      () => S.golpeVeloz(1.1),
      () => S.critico({ pan: 0.3 }),
      () => S.danoHeroe({ tipo: 'jefe', bloqueado: false }),
      () => S.bloqueo(),
      () => S.escudoAbsorbe(),
      () => S.esquiva(true),
      () => S.paso('hierba', false),
      () => S.paso('piedra', true),
      () => S.paso('agua', true),
      () => S.paso('mazmorra', false),
      () => S.monedas(),
      () => S.botinObjeto(),
      () => S.equipar(),
      () => S.forja(),
      () => S.pocion('vida'),
      () => S.pocion('mana'),
      () => S.descanso(),
      () => S.mazmorraEntrada(),
      () => S.zonaNueva(false),
      () => S.zonaNueva(true),
      () => S.companeroSkill('cura'),
      () => S.companeroSkill('defensa'),
      () => S.companeroSkill('debuff'),
      () => S.companeroSkill('ataque'),
      () => S.venenoTick(),
      () => S.uiClick(),
      () => S.subirNivel(),
      () => S.mision(),
      () => S.victoriaJefe(),
      () => S.muerteHeroe()
    ];

    llamadas.forEach((fn, idx) => {
      env.avanzarTiempo(1.8);
      const antes = env.stats.oscillators + env.stats.sources;
      fn();
      const despues = env.stats.oscillators + env.stats.sources;
      assert.ok(despues > antes, `llamada #${idx} (full=${full}) debe crear nodos de audio`);
    });

    assert.strictEqual(env.stats.invalidParams.length, 0);
    env.limpiar();
  });
});

t('visor-mundo.html integra MusicaRPG, mezclador de 4 canales y enganches completos de SFX', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');
  [
    'js/musica-rpg.js', 'id="audio-mixer"',
    'vol-master', 'vol-musica', 'vol-sfx', 'vol-ambiente', 'rpgMundo.audioCfg',
    'Sonidos.skill', 'Sonidos.enemigo', 'Sonidos.setCombate', 'Sonidos.paso',
    'Sonidos.forja', 'Sonidos.bloqueo', 'Sonidos.escudoAbsorbe',
    'Sonidos.muerteHeroe', 'Sonidos.victoriaJefe', 'Sonidos.monedas',
    'Sonidos.botinObjeto', 'Sonidos.equipar', 'Sonidos.descanso',
    'Sonidos.mazmorraEntrada', 'Sonidos.zonaNueva', 'Sonidos.companeroSkill',
    'Sonidos.venenoTick'
  ].forEach(tok => {
    assert.ok(html.includes(tok), `visor-mundo.html debe incluir ${tok}`);
  });
});

console.log(`\n${n} pruebas del sistema de sonido profesional superadas.`);
