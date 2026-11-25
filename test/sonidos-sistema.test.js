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
    playedBuffers: [],
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
      const src = {
        buffer: null,
        loop: false,
        playbackRate: makeParam(1),
        connect() {},
        start() { if (src.buffer) stats.playedBuffers.push(src.buffer); },
        stop() { stats.stops++; }
      };
      return src;
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

t('todas las habilidades de CombatLib.SKILLS (incluidas las 49 skills por arma) generan audio distinto en inicio e impacto', () => {
  const env = crearEntornoAudio({ full: true });
  const S = env.sb.Sonidos;
  S.desbloquear();

  const skillIds = Object.keys(C.SKILLS);
  assert.ok(skillIds.length >= 81, 'deben comprobarse al menos las 81 habilidades');

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
    'Sonidos.venenoTick', 'Sonidos.eventoEstudio', 'impactosNormalCombo', 'setSfxHandler',
    'Sonidos.esfuerzo', 'generoDelHeroe'
  ].forEach(tok => {
    assert.ok(html.includes(tok), `visor-mundo.html debe incluir ${tok}`);
  });
});

t('PERFILES_SFX_ESTUDIO, combos normales de 3 golpes por clase y eventoEstudio generan audio válido', () => {
  const env = crearEntornoAudio({ full: true });
  const S = env.sb.Sonidos;
  S.desbloquear();

  assert.ok(S.PERFILES_SFX_ESTUDIO, 'debe exponerse PERFILES_SFX_ESTUDIO');
  const clases = Object.keys(C.WEAPON_SKILLS_BY_CLASS);
  clases.forEach(cls => {
    C.WEAPON_SKILLS_BY_CLASS[cls].forEach(id => {
      assert.ok(S.PERFILES_SFX_ESTUDIO[id], `PERFILES_SFX_ESTUDIO debe incluir ${id}`);
    });
  });

  ['espadas', 'mandobles', 'dagas', 'hachas', 'hachas_2m', 'mazas', 'lanzas', 'arcos', 'bastones', 'unarmed'].forEach(cls => {
    const skId = cls === 'arcos' ? 'disparo' : (cls === 'bastones' ? 'orbe_arcano' : 'attack');
    env.avanzarTiempo(0.25);
    const a0 = env.stats.oscillators + env.stats.sources;
    S.skill(skId, 'inicio', { clase: cls, pan: 0 });
    assert.ok(env.stats.oscillators + env.stats.sources > a0, `${cls}:${skId} inicio debe sonar`);
    [0, 1, 2].forEach(idx => {
      env.avanzarTiempo(0.35);
      const before = env.stats.oscillators + env.stats.sources;
      S.skill(skId, 'impacto', { clase: cls, hitIndex: idx, heavy: idx === 2, hitKind: idx === 2 ? 'heavy' : 'normal', pan: 0.15 });
      assert.ok(env.stats.oscillators + env.stats.sources > before, `${cls}:${skId} golpe #${idx} debe sonar`);
    });
  });

  ['energy_wave', 'fireball', 'bow_draw', 'bow_release', 'prism_sky', 'prism_impact', 'meteor_impact', 'beam', 'nova', 'heavy_impact'].forEach(ev => {
    env.avanzarTiempo(0.4);
    const before = env.stats.oscillators + env.stats.sources;
    S.eventoEstudio(ev, { clase: ev.startsWith('bow') ? 'arcos' : 'espadas', pan: -0.2 });
    assert.ok(env.stats.oscillators + env.stats.sources > before, `eventoEstudio(${ev}) debe emitir audio`);
  });

  assert.strictEqual(env.stats.invalidParams.length, 0);
  env.limpiar();
});

t('esfuerzo (hombre/mujer), voces de bichos y muestras reales de espadas reemplazan chasquidos', () => {
  const wavEsperados = [
    'sfx/voces/esfuerzo_mujer_01.wav',
    'sfx/voces/esfuerzo_hombre_01.wav',
    'sfx/voces/esfuerzo_hombre_02.wav',
    'sfx/enemigos/bicho_grunido_01.wav',
    'sfx/enemigos/bicho_rugido_01.wav'
  ];
  wavEsperados.forEach(rel => {
    const p = path.join(__dirname, '..', rel);
    assert.ok(fs.existsSync(p), `Falta WAV ${rel}`);
    const b = fs.readFileSync(p);
    assert.ok(b.length > 10000, `WAV vacío o demasiado corto: ${rel}`);
    assert.strictEqual(b.slice(0, 4).toString('ascii'), 'RIFF');
    assert.strictEqual(b.slice(8, 12).toString('ascii'), 'WAVE');
  });

  // 1. Esfuerzo en modo fallback (sin buffers decodificados)
  const envFb = crearEntornoAudio({ full: true });
  const SFb = envFb.sb.Sonidos;
  SFb.desbloquear();
  ['mujer', 'hombre'].forEach(gen => {
    envFb.avanzarTiempo(1.0);
    const antes = envFb.stats.oscillators + envFb.stats.sources;
    assert.strictEqual(SFb.esfuerzo(gen, { intenso: true }), true);
    assert.ok(envFb.stats.oscillators + envFb.stats.sources > antes, `esfuerzo(${gen}) fallback debe sonar`);
  });
  assert.strictEqual(envFb.stats.invalidParams.length, 0);
  envFb.limpiar();

  // 2. Con muestras reales registradas: espadas usan OGG grabados (sin makeSteelFM), bichos y esfuerzos usan WAV
  const env = crearEntornoAudio({ full: true });
  const S = env.sb.Sonidos;
  S.desbloquear();
  Object.keys(S.MUESTRAS).forEach(clave => {
    S.MUESTRAS[clave].forEach(ruta => {
      S.registrarMuestra(ruta, { _ruta: ruta, duration: 0.6 });
    });
  });

  env.stats.playedBuffers.length = 0;
  env.avanzarTiempo(0.5);
  const oscAntesAttack = env.stats.oscillators;
  S.skill('attack', 'inicio', { clase: 'espadas' });
  assert.strictEqual(env.stats.oscillators, oscAntesAttack, 'attack de espada con muestras cargadas no dispara osciladores sintéticos');
  env.avanzarTiempo(0.3);
  const oscAntesClash = env.stats.oscillators;
  S.eventoEstudio('sword_clash', { clase: 'espadas', element: 'physical' });
  assert.strictEqual(env.stats.oscillators, oscAntesClash, 'choque físico de espada con muestras cargadas no dispara osciladores metálicos');
  env.avanzarTiempo(0.3);
  S.skill('sw_cross', 'impacto', { clase: 'espadas' });
  const rutasEsp = env.stats.playedBuffers.map(b => b && b._ruta).filter(Boolean);
  assert.ok(rutasEsp.some(r => r.includes('sfx/espadas/tajo_aire')), 'attack inicio debe reproducir tajo_aire real');
  assert.ok(rutasEsp.some(r => r.includes('sfx/espadas/choque_corte')), 'sw_cross/sword_clash debe reproducir choque_corte real');

  env.stats.playedBuffers.length = 0;
  env.avanzarTiempo(2.5);
  S.enemigo('aggro', { name: 'Lobo Alfa' });
  env.avanzarTiempo(0.5);
  S.enemigo('muerte', { name: 'Señor Osario', boss: true });
  const rutasBichos = env.stats.playedBuffers.map(b => b && b._ruta).filter(Boolean);
  assert.ok(rutasBichos.includes('sfx/enemigos/bicho_grunido_01.wav'), 'bestia aggro debe reproducir gruñido');
  assert.ok(rutasBichos.includes('sfx/enemigos/bicho_rugido_01.wav'), 'jefe muerte debe reproducir rugido');

  env.stats.playedBuffers.length = 0;
  env.avanzarTiempo(1.2);
  S.esfuerzo('mujer', { sinCooldown: true });
  env.avanzarTiempo(1.0);
  S.esfuerzo('hombre', { intenso: false, sinCooldown: true });
  env.avanzarTiempo(1.0);
  S.esfuerzo('hombre', { intenso: true, sinCooldown: true });
  const rutasVoz = env.stats.playedBuffers.map(b => b && b._ruta).filter(Boolean);
  assert.ok(rutasVoz.includes('sfx/voces/esfuerzo_mujer_01.wav'));
  assert.ok(rutasVoz.includes('sfx/voces/esfuerzo_hombre_01.wav'));
  assert.ok(rutasVoz.includes('sfx/voces/esfuerzo_hombre_02.wav'));

  assert.strictEqual(env.stats.invalidParams.length, 0);
  env.limpiar();
});

console.log(`\n${n} pruebas del sistema de sonido profesional superadas.`);
