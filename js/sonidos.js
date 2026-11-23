// Sistema profesional de audio del RPG: masterización con compresor, reverberación estéreo por
// convolución, mezclador de 4 buses (General, Música, SFX, Ambiente), música orquestal adaptativa
// (vía MusicaRPG) y biblioteca completa de efectos multicapa para combate, habilidades, enemigos y mundo.
(function (root) {
  'use strict';

  const clamp = (v, a, b) => Math.max(a, Math.min(b, Number.isFinite(v) ? v : a));
  const variar = (base, pct = 0.06) => base * (1 + (Math.random() * 2 - 1) * pct);

  let ac = null;
  let masterGain = null, compresor = null;
  let musicaBus = null, sfxBus = null, ambienteBus = null;
  let reverbSend = null, reverbNode = null, reverbReturn = null;
  let reverbModo = 'exterior';
  let irExterior = null, irMazmorra = null;

  let ruido = null, ruidoRosa = null, ruidoMarron = null;
  let activo = true, oculto = false;

  // Volúmenes persistentes de los 4 buses principales
  const VOLS = { master: 0.90, musica: 0.62, sfx: 0.78, ambiente: 0.55 };

  // Estado de música adaptativa con histéresis de combate
  let ambBase = 'silencio', ambHora = 'day';
  let enCombate = false, combateJefe = false, combateFase2 = false;
  let finCombateHastaMs = 0, combateSalidaTimer = null;
  let motorMusica = null;

  // Fallback ligero cuando MusicaRPG no se ha cargado (entornos aislados)
  let ambNodosFallback = null, musTimerFallback = null, musPasoFallback = 0;

  const MIN_INTERVALO_S = 0.06;
  const AMBIENTES_FALLBACK = {
    campo:    { tipo: 'lowpass',  freq: 520, q: 0.7, lfoAmp: 160, gain: 0.16 },
    agua:     { tipo: 'bandpass', freq: 820, q: 1.0, lfoAmp: 260, gain: 0.22 },
    pueblo:   { tipo: 'lowpass',  freq: 380, q: 0.7, lfoAmp: 70,  gain: 0.09 },
    mazmorra: { tipo: 'lowpass',  freq: 180, q: 1.6, lfoAmp: 50,  gain: 0.18 },
    batalla:  { tipo: 'lowpass',  freq: 340, q: 0.8, lfoAmp: 80,  gain: 0.06 },
    jefe:     { tipo: 'lowpass',  freq: 260, q: 1.1, lfoAmp: 80,  gain: 0.07 },
    silencio: { tipo: 'lowpass',  freq: 250, q: 0.7, lfoAmp: 0,   gain: 0.0001 }
  };
  const TEMAS_FALLBACK = {
    pueblo:   { notas: [293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33], bajos: [146.83, 196.00, 174.61, 146.83], patron: [0, 2, 4, -1, 5, 4, 2, -1, 1, 3, 4, 2, 0, -1, 4, -1], osc: 'triangle', cutoff: 1450, vol: 0.085, eco: false },
    campo:    { notas: [392.00, 440.00, 493.88, 587.33, 659.25, 783.99], bajos: [196.00, 164.81, 146.83, 196.00], patron: [0, -1, 2, 4, -1, 3, 2, 0, 1, -1, 3, 5, -1, 4, 2, -1], osc: 'triangle', cutoff: 1650, vol: 0.080, eco: false },
    agua:     { notas: [587.33, 659.25, 783.99, 880.00, 987.77, 1174.66], bajos: [196.00, 220.00, 146.83, 196.00], patron: [0, 2, 4, 5, -1, 3, 1, -1, 2, 4, -1, 3, 0, -1, 2, -1], osc: 'sine', cutoff: 2100, vol: 0.070, eco: true },
    mazmorra: { notas: [293.66, 311.13, 349.23, 440.00, 466.16, 587.33], bajos: [73.42, 87.31, 77.78, 73.42], patron: [0, -1, -1, 1, -1, -1, 3, -1, 2, -1, -1, 1, -1, 4, -1, -1], osc: 'sine', cutoff: 1100, vol: 0.090, eco: true },
    batalla:  { notas: [293.66, 349.23, 392.00, 440.00, 523.25, 587.33], bajos: [146.83, 130.81, 116.54, 130.81], patron: [0, 1, 2, 4, 5, 4, 2, 1, 0, 3, 4, 5, 3, 2, 1, 4], osc: 'sawtooth', cutoff: 1500, vol: 0.075, eco: false },
    jefe:     { notas: [329.63, 392.00, 440.00, 493.88, 523.25, 659.25], bajos: [82.41, 98.00, 110.00, 92.50], patron: [0, 2, 3, 5, 4, 3, 2, 0, 1, 3, 4, 5, 3, 4, 2, 3], osc: 'sawtooth', cutoff: 1600, vol: 0.085, eco: true }
  };

  function crearIR(durSeg, decaimiento, preDelayMs, tempAmp) {
    if (!ac) return null;
    const sr = ac.sampleRate || 44100;
    const len = Math.max(64, Math.floor(sr * durSeg));
    const pre = Math.floor(sr * (preDelayMs / 1000));
    const buf = ac.createBuffer(2, len, sr);
    const dL = buf.getChannelData(0);
    let dR = dL;
    try { dR = buf.getChannelData(1); } catch (_) { dR = dL; }
    let prevL = 0, prevR = 0;
    for (let i = 0; i < len; i++) {
      if (i < pre) {
        dL[i] = 0;
        if (dR !== dL) dR[i] = 0;
        continue;
      }
      const p = (i - pre) / Math.max(1, len - pre);
      const env = Math.pow(1 - p, decaimiento);
      // Reflexiones tempranas más nítidas + cola cálida amortiguada
      const early = i < pre + Math.floor(sr * 0.06) ? tempAmp : 1.0;
      const rawL = (Math.random() * 2 - 1) * env * early * 0.45;
      prevL = prevL * 0.35 + rawL * 0.65;
      dL[i] = prevL;
      if (dR !== dL) {
        const rawR = (Math.random() * 2 - 1) * env * early * 0.45;
        prevR = prevR * 0.35 + rawR * 0.65;
        dR[i] = prevR;
      }
    }
    return buf;
  }

  function crearBuffersRuido() {
    const sr = ac.sampleRate || 44100;
    // Ruido blanco 1.2s
    ruido = ac.createBuffer(1, Math.floor(sr * 1.2), sr);
    const dw = ruido.getChannelData(0);
    for (let i = 0; i < dw.length; i++) dw[i] = Math.random() * 2 - 1;

    // Ruido rosa 3.0s (aprox. Paul Kellet)
    ruidoRosa = ac.createBuffer(1, Math.floor(sr * 3.0), sr);
    const dp = ruidoRosa.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0;
    for (let i = 0; i < dp.length; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + w * 0.099046;
      b1 = 0.96300 * b1 + w * 0.2965164;
      b2 = 0.57000 * b2 + w * 1.0526913;
      b3 = 0.1848 * w;
      dp[i] = clamp((b0 + b1 + b2 + b3) * 0.32, -1, 1);
    }

    // Ruido marrón 3.0s
    ruidoMarron = ac.createBuffer(1, Math.floor(sr * 3.0), sr);
    const dm = ruidoMarron.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < dm.length; i++) {
      const w = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * w) / 1.02;
      dm[i] = clamp(lastOut * 3.2, -1, 1);
    }
  }

  function setReverbModo(modo) {
    const clave = modo === 'mazmorra' ? 'mazmorra' : 'exterior';
    if (reverbModo === clave && reverbNode && reverbNode.buffer) return;
    reverbModo = clave;
    if (!ac || !reverbNode) return;
    const ir = clave === 'mazmorra'
      ? (irMazmorra || (irMazmorra = crearIR(2.45, 1.7, 22, 1.35)))
      : (irExterior || (irExterior = crearIR(1.35, 2.8, 12, 1.15)));
    try { reverbNode.buffer = ir; } catch (_) {}
    if (reverbReturn && reverbReturn.gain) {
      const t = ac.currentTime;
      const gTarget = clave === 'mazmorra' ? 0.56 : 0.34;
      reverbReturn.gain.setValueAtTime(gTarget, t);
    }
  }

  function temaEfectivoActual() {
    if (enCombate && ambBase !== 'silencio') return combateJefe ? 'jefe' : 'batalla';
    return ambBase;
  }

  function aplicarAmbiente() {
    if (!ac || !activo || ac.state !== 'running') return;
    const tema = temaEfectivoActual();
    setReverbModo(ambBase === 'mazmorra' ? 'mazmorra' : 'exterior');

    if (motorMusica) {
      motorMusica.setTema(tema, ambHora, { fase2: combateFase2 });
      return;
    }

    // Fallback mínimo sin MusicaRPG
    if (tema === 'silencio') {
      detenerMusicaFallback();
      if (!ambNodosFallback) return;
    }
    const n = asegurarAmbienteFallback();
    if (!n) return;
    const cfg = AMBIENTES_FALLBACK[tema] || AMBIENTES_FALLBACK.silencio;
    const t = ac.currentTime;
    n.filtro.type = cfg.tipo;
    n.filtro.Q.setValueAtTime(cfg.q, t);
    n.filtro.frequency.cancelScheduledValues(t);
    n.filtro.frequency.setValueAtTime(Math.max(40, n.filtro.frequency.value), t);
    n.filtro.frequency.linearRampToValueAtTime(cfg.freq, t + 0.7);
    n.lfoGain.gain.cancelScheduledValues(t);
    n.lfoGain.gain.setValueAtTime(n.lfoGain.gain.value, t);
    n.lfoGain.gain.linearRampToValueAtTime(cfg.lfoAmp, t + 0.7);
    n.g.gain.cancelScheduledValues(t);
    n.g.gain.setValueAtTime(Math.max(0.0001, n.g.gain.value), t);
    n.g.gain.linearRampToValueAtTime(cfg.gain, t + 0.7);
    if (tema !== 'silencio' && !oculto) {
      if (!musTimerFallback) tickMusicaFallback();
      asegurarMusicaFallback();
    }
  }

  // Fallback interno para entornos sin MusicaRPG
  function asegurarAmbienteFallback() {
    if (!ac || !musicaBus || ambNodosFallback) return ambNodosFallback;
    const buf = ruidoRosa || ruido;
    const src = ac.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const filtro = ac.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 400;
    filtro.Q.value = 0.7;
    const g = ac.createGain();
    g.gain.value = 0.0001;
    const lfo = ac.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.18;
    const lfoGain = ac.createGain();
    lfoGain.gain.value = 0;
    lfo.connect(lfoGain);
    lfoGain.connect(filtro.frequency);
    src.connect(filtro);
    filtro.connect(g);
    g.connect(musicaBus);
    src.start();
    lfo.start();
    ambNodosFallback = { src, filtro, g, lfo, lfoGain };
    return ambNodosFallback;
  }

  function notaMusicaFallback(t, freq, dur, vol, tipoOsc, cutoff) {
    if (!ac || !musicaBus) return;
    const o = ac.createOscillator();
    o.type = tipoOsc || 'triangle';
    o.frequency.setValueAtTime(freq, t);
    const f = ac.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(cutoff || 1400, t);
    const g = ac.createGain();
    const atk = Math.min(0.18, dur * 0.18);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f); f.connect(g); g.connect(musicaBus);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function tickMusicaFallback() {
    const temaKey = temaEfectivoActual();
    if (!ac || !activo || oculto || ac.state !== 'running' || temaKey === 'silencio') return;
    const tema = TEMAS_FALLBACK[temaKey];
    if (!tema) return;
    const t = ac.currentTime + 0.03;
    const esNoche = ambHora === 'night' || temaKey === 'mazmorra';
    if (musPasoFallback % 4 === 0) {
      const idxBajo = Math.floor(musPasoFallback / 4) % tema.bajos.length;
      const fBajo = tema.bajos[idxBajo];
      notaMusicaFallback(t, fBajo, 3.1, temaKey === 'mazmorra' ? 0.068 : 0.055, 'sine', 420);
    }
    const idxPat = musPasoFallback % tema.patron.length;
    const grado = tema.patron[idxPat];
    if (grado >= 0) {
      const fNota = tema.notas[grado % tema.notas.length] * (esNoche && temaKey !== 'mazmorra' && temaKey !== 'batalla' && temaKey !== 'jefe' ? 0.5 : 1);
      notaMusicaFallback(t, fNota, 1.15, tema.vol, tema.osc, tema.cutoff);
    }
    musPasoFallback = (musPasoFallback + 1) % 64;
  }

  function detenerMusicaFallback() {
    if (musTimerFallback) {
      clearInterval(musTimerFallback);
      musTimerFallback = null;
    }
  }

  function asegurarMusicaFallback() {
    detenerMusicaFallback();
    const tk = temaEfectivoActual();
    if (!ac || !activo || tk === 'silencio') return;
    const pasoMs = tk === 'jefe' ? 420 : (tk === 'batalla' ? 460 : ((tk === 'mazmorra' || ambHora === 'night') ? 1050 : 850));
    musTimerFallback = setInterval(tickMusicaFallback, pasoMs);
  }

  function contexto() {
    if (!activo) return null;
    if (!ac) {
      const Ctor = root.AudioContext || root.webkitAudioContext;
      if (!Ctor) return null;
      ac = new Ctor();

      masterGain = ac.createGain();
      masterGain.gain.value = VOLS.master;
      masterGain.connect(ac.destination);

      let mezclaEntrada = masterGain;
      if (typeof ac.createDynamicsCompressor === 'function') {
        compresor = ac.createDynamicsCompressor();
        if (compresor.threshold) compresor.threshold.value = -16;
        if (compresor.knee) compresor.knee.value = 18;
        if (compresor.ratio) compresor.ratio.value = 3.5;
        if (compresor.attack) compresor.attack.value = 0.006;
        if (compresor.release) compresor.release.value = 0.18;
        compresor.connect(masterGain);
        mezclaEntrada = compresor;
      }

      musicaBus = ac.createGain();
      musicaBus.gain.value = VOLS.musica;
      musicaBus.connect(mezclaEntrada);

      sfxBus = ac.createGain();
      sfxBus.gain.value = VOLS.sfx;
      sfxBus.connect(mezclaEntrada);

      ambienteBus = ac.createGain();
      ambienteBus.gain.value = VOLS.ambiente;
      ambienteBus.connect(mezclaEntrada);

      if (typeof ac.createConvolver === 'function') {
        reverbSend = ac.createGain();
        reverbSend.gain.value = 1.0;
        reverbNode = ac.createConvolver();
        reverbReturn = ac.createGain();
        reverbReturn.gain.value = 0.34;
        reverbSend.connect(reverbNode);
        reverbNode.connect(reverbReturn);
        reverbReturn.connect(mezclaEntrada);
        irExterior = crearIR(1.35, 2.8, 12, 1.15);
        irMazmorra = crearIR(2.45, 1.7, 22, 1.35);
        try { reverbNode.buffer = ambBase === 'mazmorra' ? irMazmorra : irExterior; } catch (_) {}
      }

      crearBuffersRuido();
      cargarMuestras();

      if (root.MusicaRPG && typeof root.MusicaRPG.crearMotor === 'function') {
        motorMusica = root.MusicaRPG.crearMotor({
          ac, musicaBus, ambienteBus, reverbSend,
          ruidoBlanco: ruido, ruidoRosa, ruidoMarron
        });
      }
    }

    if (ac.state === 'suspended') {
      const p = ac.resume();
      if (p && typeof p.then === 'function') p.then(() => aplicarAmbiente()).catch(() => {});
    } else if (temaEfectivoActual() !== 'silencio') {
      if (motorMusica) {
        if (motorMusica.estado().tema === 'silencio') aplicarAmbiente();
      } else if (!ambNodosFallback || !musTimerFallback) {
        aplicarAmbiente();
      }
    }
    return ac;
  }

  // ------------------- Muestras grabadas (sfx/, Sonniss GDC 2026) -------------------
  // Si la muestra ya está cargada suena ella; si no (sin red, file://, aún cargando), el sonido sintetizado de siempre.
  const MUESTRAS = {
    choque_metal: ['sfx/espadas/choque_metal_01.ogg'],
    choque_corte: [1, 2, 3, 4, 5, 6].map(n => 'sfx/espadas/choque_corte_0' + n + '.ogg'),
    rayo_carga:   ['sfx/rayos/rayo_carga_01.ogg'],
    rayo_cadena:  ['sfx/rayos/rayo_cadena_01.ogg'],
    chispazo:     [1, 2, 3].map(n => 'sfx/rayos/chispazo_0' + n + '.ogg')
  };
  const muestrasBuf = {};
  function cargarMuestras() {
    if (typeof fetch !== 'function' || !ac) return;
    Object.keys(MUESTRAS).forEach(k => MUESTRAS[k].forEach(ruta => {
      if (ruta in muestrasBuf) return;
      muestrasBuf[ruta] = null;
      fetch(ruta)
        .then(r => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
        .then(a => new Promise((ok, mal) => ac.decodeAudioData(a, ok, mal)))
        .then(b => { muestrasBuf[ruta] = b; })
        .catch(() => {});
    }));
  }
  // Reproduce una variante al azar con el tono un poco cambiado. Devuelve { parar(fundido) } o null si no está cargada.
  function muestra(nombre, t, opts) {
    if (!ac) return null;
    const lista = (MUESTRAS[nombre] || []).map(r => muestrasBuf[r]).filter(Boolean);
    if (!lista.length) return null;
    const cfg = Object.assign({ wet: 0.12 }, opts);
    const src = ac.createBufferSource();
    src.buffer = lista[Math.floor(Math.random() * lista.length)];
    src.playbackRate.value = variar(1, cfg.tono !== undefined ? cfg.tono : 0.05);
    const g = ac.createGain();
    g.gain.value = cfg.vol !== undefined ? cfg.vol : 1;
    src.connect(g);
    conectarSalida(g, cfg);
    src.start(t);
    return {
      parar(fundido = 0.1) {
        const tt = Math.max(ac.currentTime, t);
        g.gain.cancelScheduledValues(tt);
        g.gain.setValueAtTime(g.gain.value, tt);
        g.gain.linearRampToValueAtTime(0.0001, tt + fundido);
        try { src.stop(tt + fundido + 0.02); } catch (_) {}
      }
    };
  }
  // Técnicas de rayo: la carga suena desde que empieza la animación y se corta al golpear
  const SKILL_RAYO_MUESTRA = new Set(['tornillo', 'juicio_relampago', 'salto_demoledor']);
  let cargaRayo = null;
  function muestrasSkill(t, id, fase, opts) {
    if (fase === 'inicio') {
      if (SKILL_RAYO_MUESTRA.has(id)) {
        if (cargaRayo) cargaRayo.parar(0.05);
        cargaRayo = muestra('rayo_carga', t, { vol: 0.5, tono: 0.03 });
      }
      if (id === 'contraataque') muestra('choque_metal', t, { vol: 0.8 });
    } else if (fase === 'impacto' && SKILL_RAYO_MUESTRA.has(id)) {
      if (cargaRayo) { cargaRayo.parar(0.12); cargaRayo = null; }
      if (muestra('rayo_cadena', t, opts)) muestra('chispazo', t + 0.08, Object.assign({}, opts, { vol: 0.45 }));
    }
  }

  // ------------------- Auxiliares de síntesis DSP para SFX -------------------
  function conectarSalida(nodo, opts) {
    const cfg = opts || {};
    const bus = cfg.bus || sfxBus;
    const pan = clamp(cfg.pan || 0, -0.88, 0.88);
    let salidaNodo = nodo;
    if (pan !== 0 && typeof ac.createStereoPanner === 'function') {
      const panner = ac.createStereoPanner();
      panner.pan.value = pan;
      nodo.connect(panner);
      salidaNodo = panner;
    }
    salidaNodo.connect(bus);
    const wet = cfg.wet !== undefined ? clamp(cfg.wet, 0, 1) : 0.14;
    if (wet > 0.005 && reverbSend) {
      const wg = ac.createGain();
      wg.gain.value = wet;
      salidaNodo.connect(wg);
      wg.connect(reverbSend);
    }
  }

  // Ruido filtrado con envolvente y barrido de frecuencia
  function rafaga(t, dur, tipo, f0, f1, q, vol, opts) {
    if (!ruido) return;
    const cfg = opts || {};
    const d = Math.max(0.02, dur);
    const buf = cfg.buffer === 'rosa' ? (ruidoRosa || ruido)
      : (cfg.buffer === 'marron' ? (ruidoMarron || ruido) : ruido);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const f = ac.createBiquadFilter();
    f.type = tipo;
    f.Q.value = Math.max(0.2, q || 1);
    f.frequency.setValueAtTime(Math.max(25, f0), t);
    f.frequency.exponentialRampToValueAtTime(Math.max(25, f1), t + d);
    const g = ac.createGain();
    const atk = cfg.atk ? Math.min(d * 0.45, cfg.atk) : 0;
    const v = Math.max(0.0005, vol);
    if (atk > 0.001) {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(v, t + atk);
    } else {
      g.gain.setValueAtTime(v, t);
    }
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    src.connect(f); f.connect(g);
    conectarSalida(g, cfg);
    src.start(t, Math.random() * 0.35);
    src.stop(t + d + 0.03);
  }

  // Barrido veloz de viento filtrado (sube rápido al pico y corta hacia abajo)
  function barridoVelocidad(t, dur, f0, fPico, f1, q, vol, opts) {
    if (!ruido) return;
    const d = Math.max(0.05, dur);
    const src = ac.createBufferSource();
    src.buffer = ruido;
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = Math.max(0.4, q || 1.6);
    f.frequency.setValueAtTime(Math.max(30, f0), t);
    f.frequency.exponentialRampToValueAtTime(Math.max(40, fPico), t + d * 0.48);
    f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + d);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(Math.max(0.0005, vol), t + d * 0.42);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    src.connect(f); f.connect(g);
    conectarSalida(g, opts);
    src.start(t, Math.random() * 0.35);
    src.stop(t + d + 0.03);
  }

  // Tono expresivo con onda configurable, ataque opcional y envío estéreo/reverb
  function tono(t, freq, freqFin, dur, vol, opts) {
    const cfg = opts || {};
    const d = Math.max(0.025, dur);
    const f0 = Math.max(20, freq);
    const f1 = Math.max(20, freqFin);
    const o = ac.createOscillator();
    o.type = cfg.wave || 'sine';
    o.frequency.setValueAtTime(f0, t);
    if (Math.abs(f1 - f0) > 0.5) {
      o.frequency.exponentialRampToValueAtTime(f1, t + d);
    }
    const g = ac.createGain();
    const v = Math.max(0.0005, vol);
    if (cfg.atk && cfg.atk > 0.002) {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(v, t + Math.min(d * 0.45, cfg.atk));
    } else {
      g.gain.setValueAtTime(v, t);
    }
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);

    if (cfg.lp) {
      const lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(Math.max(60, cfg.lp), t);
      o.connect(lp); lp.connect(g);
    } else {
      o.connect(g);
    }
    conectarSalida(g, cfg);
    o.start(t);
    o.stop(t + d + 0.03);
  }

  // ------------------- Núcleo de SFX clásicos y avanzados -------------------
  const SONIDOS = {
    metal(t, opts) {
      if (muestra('choque_corte', t, Object.assign({ vol: 0.85 }, opts))) return;
      const base = variar(1480, 0.14);
      rafaga(t, 0.055, 'bandpass', variar(4300, 0.1), 2400, 2.8, 0.85, opts);
      tono(t, base, base * 0.96, 0.34, 0.20, Object.assign({ wet: 0.22 }, opts));
      tono(t, base * 1.59, base * 1.54, 0.24, 0.11, Object.assign({ wet: 0.22 }, opts));
      tono(t, base * 2.14, base * 2.08, 0.17, 0.06, Object.assign({ wet: 0.22 }, opts));
    },
    sordo(t, opts) {
      rafaga(t, 0.10, 'lowpass', variar(920, 0.1), 180, 1.0, 0.78, Object.assign({ buffer: 'rosa' }, opts));
      tono(t, variar(155, 0.08), 54, 0.14, 0.36, opts);
    },
    flecha(t, opts) {
      tono(t, variar(190, 0.08), 68, 0.11, 0.30, opts);
      rafaga(t, 0.045, 'highpass', 2600, 1750, 1.2, 0.26, opts);
    },
    magia(t, opts) {
      rafaga(t, 0.16, 'bandpass', 1800, 520, 1.6, 0.42, Object.assign({ wet: 0.28 }, opts));
      tono(t, variar(520, 0.1), 180, 0.18, 0.22, Object.assign({ wave: 'triangle', wet: 0.32 }, opts));
    },
    disparo(t, opts) {
      tono(t, variar(165, 0.06), 110, 0.09, 0.18, Object.assign({ wave: 'triangle' }, opts));
      rafaga(t, 0.26, 'bandpass', 850, 2750, 2.1, 0.29, Object.assign({ wet: 0.18 }, opts));
    },
    esquiva(t, perfecta = false) {
      barridoVelocidad(t, 0.20, 520, 2100, 750, 1.7, 0.34, { wet: 0.18 });
      if (perfecta) {
        tono(t + 0.02, 1046.5, 1318.5, 0.18, 0.18, { wave: 'sine', wet: 0.38 });
        tono(t + 0.06, 1567.98, 1760, 0.22, 0.14, { wave: 'sine', wet: 0.42 });
      }
    },
    critico(t, opts) {
      rafaga(t, 0.07, 'highpass', 3100, 5200, 1.5, 0.52, Object.assign({ wet: 0.28 }, opts));
      tono(t, 165, 58, 0.15, 0.32, opts);
      tono(t, 1850, 1480, 0.25, 0.23, Object.assign({ wet: 0.32 }, opts));
      tono(t, 2775, 2220, 0.22, 0.15, Object.assign({ wet: 0.35 }, opts));
    },
    danoHeroe(t, opts) {
      const cfg = opts || {};
      const esJefe = cfg.tipo === 'jefe';
      rafaga(t, esJefe ? 0.16 : 0.11, 'lowpass', esJefe ? 860 : 720, 150, 1.2, esJefe ? 0.68 : 0.56, { buffer: 'rosa', wet: 0.2 });
      tono(t, esJefe ? 105 : 128, 42, esJefe ? 0.22 : 0.15, esJefe ? 0.44 : 0.35);
      // Crujido metálico de armadura
      rafaga(t + 0.015, 0.06, 'bandpass', 2400, 1200, 2.2, 0.24, { wet: 0.18 });
    },
    bloqueo(t) {
      if (muestra('choque_metal', t, { vol: 0.75 })) return;
      rafaga(t, 0.065, 'bandpass', 3200, 1400, 2.6, 0.72, { wet: 0.28 });
      tono(t, 920, 880, 0.36, 0.24, { wave: 'triangle', wet: 0.34 });
      tono(t, 1480, 1420, 0.28, 0.15, { wet: 0.34 });
      tono(t, 180, 70, 0.12, 0.28);
    },
    escudoAbsorbe(t) {
      tono(t, 880, 1320, 0.16, 0.16, { wave: 'sine', wet: 0.36 });
      tono(t + 0.03, 1320, 1760, 0.20, 0.12, { wave: 'sine', wet: 0.40 });
      rafaga(t, 0.12, 'highpass', 3600, 5800, 1.6, 0.24, { wet: 0.30 });
    },
    fuego(t, opts) {
      rafaga(t, 0.34, 'lowpass', 1050, 140, 1.1, 0.56, Object.assign({ buffer: 'rosa', wet: 0.24 }, opts));
      tono(t, 135, 44, 0.28, 0.26, opts);
    },
    hielo(t, opts) {
      rafaga(t, 0.18, 'highpass', 3200, 5600, 1.4, 0.28, Object.assign({ wet: 0.34 }, opts));
      tono(t, 2200, 1950, 0.12, 0.12, Object.assign({ wet: 0.34 }, opts));
      tono(t + 0.04, 2950, 2600, 0.12, 0.11, Object.assign({ wet: 0.34 }, opts));
      tono(t + 0.08, 3700, 3250, 0.13, 0.10, Object.assign({ wet: 0.34 }, opts));
    },
    rayo(t, opts) {
      if (muestra('rayo_cadena', t, opts)) { muestra('chispazo', t + 0.09, Object.assign({}, opts, { vol: 0.5 })); return; }
      rafaga(t, 0.28, 'bandpass', 5400, 420, 1.8, 0.64, Object.assign({ wet: 0.36 }, opts));
      tono(t, 1480, 160, 0.24, 0.24, Object.assign({ wave: 'sawtooth', lp: 2800, wet: 0.32 }, opts));
    },
    habilidad(t, opts) {
      barridoVelocidad(t, 0.28, 320, 2200, 480, 1.8, 0.48, opts);
      tono(t + 0.04, 280, 95, 0.24, 0.26, opts);
    },
    golpeVeloz(t, intensidad = 1, opts) {
      const inten = clamp(Number(intensidad) || 1, 0.45, 1.35);
      barridoVelocidad(t, 0.22, 360, 2900, 620, 2.0, 0.56 * inten, opts);
      rafaga(t + 0.095, 0.06, 'highpass', 4600, 1500, 1.5, 0.50 * inten, opts);
      tono(t + 0.095, 920, 130, 0.08, 0.28 * inten, opts);
      tono(t + 0.10, 210, 52, 0.14, 0.36 * inten, opts);
      tono(t + 0.10, 1680, 1380, 0.16, 0.13 * inten, Object.assign({ wet: 0.22 }, opts));
    },
    pocion(t, tipo) {
      const base = tipo === 'mana' ? 520 : 420;
      tono(t, base, base * 1.8, 0.12, 0.18, { wet: 0.28 });
      tono(t + 0.075, base * 1.35, base * 2.3, 0.14, 0.18, { wet: 0.32 });
      rafaga(t + 0.04, 0.08, 'highpass', 3200, 5200, 2.0, 0.09, { wet: 0.28 });
    },
    subirNivel(t) {
      if (motorMusica && typeof motorMusica.stinger === 'function') {
        motorMusica.stinger('subirNivel');
        return;
      }
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        tono(t + i * 0.09, f, f * 1.005, 0.28, 0.19, { wet: 0.36 });
      });
    },
    mision(t) {
      if (motorMusica && typeof motorMusica.stinger === 'function') {
        motorMusica.stinger('mision');
        return;
      }
      [587.33, 739.99, 880].forEach((f, i) => {
        tono(t + i * 0.10, f, f * 1.003, 0.24, 0.16, { wet: 0.32 });
      });
    },
    avisoJefe(t) {
      tono(t, 190, 110, 0.28, 0.28, { wave: 'sawtooth', lp: 720, wet: 0.35 });
      tono(t, 285, 165, 0.26, 0.15, { wave: 'triangle', wet: 0.35 });
    },
    rugidoJefe(t) {
      rafaga(t, 0.52, 'lowpass', 440, 82, 1.3, 0.58, { buffer: 'marron', wet: 0.42 });
      tono(t, 112, 42, 0.48, 0.36, { wave: 'sawtooth', lp: 360, wet: 0.40 });
    },
    eleccion(t) {
      [440, 554.37, 659.25].forEach((f, i) => {
        tono(t + i * 0.08, f, f * 1.004, 0.34, 0.16, { wet: 0.36 });
      });
    },
    dialogo(t) {
      tono(t, 659.25, 783.99, 0.14, 0.10, { wet: 0.24 });
    },
    monedas(t) {
      tono(t, 2480, 2495, 0.11, 0.12, { wet: 0.26 });
      tono(t + 0.055, 3320, 3340, 0.16, 0.13, { wet: 0.30 });
    },
    botinObjeto(t) {
      [587.33, 880, 1174.66].forEach((f, i) => {
        tono(t + i * 0.06, f, f * 1.004, 0.22, 0.14, { wet: 0.36 });
      });
    },
    equipar(t) {
      rafaga(t, 0.08, 'bandpass', 1800, 800, 1.8, 0.28, { buffer: 'rosa' });
      tono(t + 0.03, 740, 680, 0.15, 0.12, { wave: 'triangle', wet: 0.22 });
    },
    forja(t) {
      // Golpe resonante de martillo sobre yunque + siseo de temple
      tono(t, 1180, 1160, 0.46, 0.22, { wet: 0.40 });
      tono(t, 2380, 2350, 0.34, 0.12, { wet: 0.40 });
      tono(t, 220, 90, 0.12, 0.26);
      rafaga(t + 0.12, 0.24, 'bandpass', 3200, 1200, 1.0, 0.24, { buffer: 'rosa', wet: 0.26 });
    },
    descanso(t) {
      [392.00, 493.88, 587.33].forEach((f, i) => {
        tono(t + i * 0.11, f, f, 0.45, 0.11, { atk: 0.06, wet: 0.40 });
      });
    },
    mazmorraEntrada(t) {
      rafaga(t, 0.55, 'lowpass', 340, 95, 1.4, 0.34, { buffer: 'marron', wet: 0.52 });
      tono(t, 98, 73.42, 0.62, 0.24, { wave: 'triangle', atk: 0.08, wet: 0.55 });
      tono(t + 0.14, 293.66, 293.66, 0.55, 0.10, { atk: 0.06, wet: 0.58 });
    },
    victoriaJefe(t) {
      if (motorMusica && typeof motorMusica.stinger === 'function') {
        motorMusica.stinger('victoriaJefe');
        return;
      }
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tono(t + i * 0.12, f, f, 0.45, 0.18, { wet: 0.42 }));
    },
    muerteHeroe(t) {
      if (motorMusica && typeof motorMusica.stinger === 'function') {
        motorMusica.stinger('derrotaHeroe');
      } else {
        [392, 349.23, 311.13, 261.63].forEach((f, i) => tono(t + i * 0.22, f, f * 0.98, 0.45, 0.16, { wet: 0.42 }));
      }
      tono(t, 120, 44, 0.32, 0.30, { wave: 'triangle', wet: 0.25 });
    },
    venenoTick(t) {
      rafaga(t, 0.12, 'bandpass', 2400, 4200, 3.0, 0.14, { wet: 0.2 });
      tono(t + 0.02, 620, 410, 0.09, 0.08);
    },
    uiClick(t) {
      tono(t, 980, 1220, 0.045, 0.07);
    },
    companeroSkill(t, tipo) {
      if (tipo === 'cura') {
        [523.25, 659.25, 783.99].forEach((f, i) => tono(t + i * 0.06, f, f * 1.01, 0.24, 0.12, { wet: 0.34 }));
      } else if (tipo === 'defensa') {
        tono(t, 440, 587.33, 0.22, 0.13, { wave: 'triangle', wet: 0.30 });
      } else if (tipo === 'debuff') {
        tono(t, 460, 260, 0.22, 0.14, { wave: 'sawtooth', lp: 1100, wet: 0.28 });
      } else {
        tono(t, 330, 660, 0.20, 0.14, { wave: 'triangle', wet: 0.28 });
      }
    }
  };

  // ------------------- Sonido dedicado por cada una de las 32 habilidades -------------------
  function dispararSkillSfx(t, id, fase, opts) {
    const o = Object.assign({}, opts);
    const imp = fase === 'impacto';
    switch (id) {
      case 'attack':
        if (!imp) barridoVelocidad(t, 0.18, 420, 1950, 620, 1.6, 0.36, o);
        else barridoVelocidad(t, 0.14, 700, 2400, 520, 1.8, 0.32, o);
        break;
      case 'corte_cruzado':
        if (!imp) {
          barridoVelocidad(t, 0.20, 480, 2600, 720, 1.9, 0.44, o);
          tono(t + 0.04, 980, 1420, 0.14, 0.11, o);
        } else {
          barridoVelocidad(t, 0.16, 900, 3200, 840, 2.2, 0.42, o);
          tono(t, 1620, 1340, 0.20, 0.16, Object.assign({ wet: 0.28 }, o));
          tono(t + 0.06, 1920, 1680, 0.18, 0.13, Object.assign({ wet: 0.28 }, o));
        }
        break;
      case 'tajo':
        if (!imp) {
          barridoVelocidad(t, 0.26, 360, 2500, 540, 1.8, 0.46, o);
        } else {
          barridoVelocidad(t, 0.18, 680, 2800, 480, 2.0, 0.42, o);
          tono(t + 0.02, 1350, 1080, 0.22, 0.15, Object.assign({ wet: 0.26 }, o));
        }
        break;
      case 'ascendente':
        if (!imp) {
          barridoVelocidad(t, 0.24, 300, 3100, 1100, 2.0, 0.44, o);
          tono(t + 0.03, 420, 960, 0.22, 0.16, Object.assign({ wave: 'triangle', wet: 0.24 }, o));
        } else {
          tono(t, 1480, 1920, 0.20, 0.16, Object.assign({ wet: 0.30 }, o));
        }
        break;
      case 'estocada':
        if (!imp) {
          barridoVelocidad(t, 0.16, 520, 3400, 1200, 2.6, 0.48, o);
        } else {
          rafaga(t, 0.07, 'highpass', 3600, 1400, 1.8, 0.50, o);
          tono(t, 1780, 1120, 0.18, 0.16, Object.assign({ wet: 0.26 }, o));
        }
        break;
      case 'paso_sombrio':
        if (!imp) {
          rafaga(t, 0.24, 'bandpass', 1800, 260, 2.2, 0.46, Object.assign({ buffer: 'rosa', wet: 0.36 }, o));
          tono(t, 380, 95, 0.22, 0.22, Object.assign({ wave: 'triangle', wet: 0.36 }, o));
        } else {
          rafaga(t, 0.09, 'highpass', 3400, 1200, 1.8, 0.52, Object.assign({ wet: 0.32 }, o));
          tono(t, 1650, 740, 0.22, 0.18, Object.assign({ wet: 0.35 }, o));
        }
        break;
      case 'hendidura':
        if (!imp) {
          barridoVelocidad(t, 0.28, 220, 1650, 360, 1.4, 0.50, o);
          tono(t + 0.04, 190, 110, 0.24, 0.24, Object.assign({ wave: 'triangle' }, o));
        } else {
          tono(t, 130, 42, 0.24, 0.40, Object.assign({ wet: 0.26 }, o));
          tono(t, 940, 680, 0.26, 0.16, Object.assign({ wet: 0.30 }, o));
          rafaga(t, 0.14, 'lowpass', 1400, 220, 1.1, 0.58, Object.assign({ buffer: 'rosa' }, o));
        }
        break;
      case 'furia':
        if (!imp) {
          rafaga(t, 0.32, 'bandpass', 480, 1800, 1.5, 0.52, Object.assign({ buffer: 'rosa', wet: 0.28 }, o));
          tono(t, 140, 75, 0.30, 0.30, Object.assign({ wave: 'sawtooth', lp: 580, wet: 0.26 }, o));
        } else {
          SONIDOS.fuego(t, o);
          tono(t, 175, 55, 0.18, 0.34, o);
        }
        break;
      case 'torbellino':
        if (!imp) {
          barridoVelocidad(t, 0.30, 380, 2800, 640, 2.0, 0.46, o);
          barridoVelocidad(t + 0.24, 0.28, 420, 3000, 680, 2.0, 0.42, o);
        } else {
          barridoVelocidad(t, 0.22, 620, 3100, 720, 2.1, 0.44, o);
          tono(t, 1320, 1580, 0.20, 0.14, Object.assign({ wet: 0.30 }, o));
        }
        break;
      case 'tornillo':
        if (!imp) {
          barridoVelocidad(t, 0.34, 420, 3400, 920, 2.4, 0.48, o);
          tono(t, 360, 920, 0.32, 0.18, Object.assign({ wave: 'sawtooth', lp: 1800, wet: 0.32 }, o));
        } else {
          SONIDOS.rayo(t, o);
          tono(t + 0.04, 1560, 1180, 0.24, 0.18, Object.assign({ wet: 0.36 }, o));
        }
        break;
      case 'voltereta':
        if (!imp) {
          barridoVelocidad(t, 0.24, 480, 2400, 720, 1.9, 0.40, o);
        } else {
          tono(t, 175, 58, 0.16, 0.32, o);
          rafaga(t, 0.10, 'lowpass', 1200, 240, 1.2, 0.42, o);
        }
        break;
      case 'sismo':
        if (!imp) {
          barridoVelocidad(t, 0.30, 240, 1200, 320, 1.3, 0.46, o);
          tono(t, 110, 180, 0.26, 0.24, Object.assign({ wave: 'triangle' }, o));
        } else {
          tono(t, 92, 28, 0.40, 0.48, Object.assign({ wet: 0.36 }, o));
          rafaga(t, 0.32, 'lowpass', 640, 90, 1.1, 0.68, Object.assign({ buffer: 'marron', wet: 0.34 }, o));
        }
        break;
      case 'salto_demoledor':
        if (!imp) {
          barridoVelocidad(t, 0.32, 320, 2600, 680, 1.8, 0.48, o);
          tono(t, 220, 480, 0.28, 0.20, Object.assign({ wave: 'triangle', wet: 0.28 }, o));
        } else {
          tono(t, 104, 30, 0.38, 0.46, Object.assign({ wet: 0.34 }, o));
          rafaga(t, 0.26, 'bandpass', 3600, 320, 1.6, 0.56, Object.assign({ wet: 0.36 }, o));
        }
        break;
      case 'sentencia_titan':
        if (!imp) {
          [440, 659.25, 880].forEach((f, idx) => {
            tono(t + idx * 0.05, f, f * 1.02, 0.48, 0.14, Object.assign({ atk: 0.05, wet: 0.48 }, o));
          });
          barridoVelocidad(t + 0.06, 0.36, 300, 2400, 480, 1.6, 0.46, o);
        } else {
          tono(t, 88, 26, 0.52, 0.50, Object.assign({ wet: 0.44 }, o));
          rafaga(t, 0.40, 'lowpass', 1200, 110, 1.2, 0.68, Object.assign({ buffer: 'marron', wet: 0.44 }, o));
          [587.33, 880, 1174.66].forEach(f => tono(t, f, f * 0.99, 0.44, 0.12, Object.assign({ wet: 0.48 }, o)));
        }
        break;
      case 'nova':
        if (!imp) {
          tono(t, 280, 760, 0.36, 0.22, Object.assign({ wave: 'triangle', atk: 0.05, wet: 0.42 }, o));
          rafaga(t, 0.32, 'bandpass', 700, 2800, 1.8, 0.34, Object.assign({ wet: 0.38 }, o));
        } else {
          rafaga(t, 0.38, 'bandpass', 3200, 220, 1.2, 0.64, Object.assign({ buffer: 'rosa', wet: 0.42 }, o));
          tono(t, 160, 38, 0.36, 0.40, Object.assign({ wet: 0.38 }, o));
          tono(t, 1046.5, 523.25, 0.30, 0.16, Object.assign({ wet: 0.45 }, o));
        }
        break;
      case 'contraataque':
      case 'escudo_espiritu':
        if (!imp) {
          SONIDOS.bloqueo(t);
          tono(t + 0.04, 523.25, 783.99, 0.28, 0.14, Object.assign({ wet: 0.36 }, o));
        } else {
          tono(t, 150, 54, 0.18, 0.36, o);
          tono(t, 1240, 980, 0.24, 0.16, Object.assign({ wet: 0.34 }, o));
        }
        break;
      case 'escudo_mana':
        if (!imp) {
          [523.25, 659.25, 783.99].forEach((f, idx) => tono(t + idx * 0.05, f, f * 1.12, 0.28, 0.13, Object.assign({ wet: 0.42 }, o)));
        } else {
          SONIDOS.escudoAbsorbe(t);
        }
        break;
      case 'rafaga':
        if (!imp) {
          barridoVelocidad(t, 0.26, 620, 3600, 980, 2.2, 0.48, Object.assign({ wet: 0.28 }, o));
        } else {
          rafaga(t, 0.20, 'bandpass', 2800, 620, 1.8, 0.46, Object.assign({ wet: 0.30 }, o));
        }
        break;
      case 'hoja_veneno':
        if (!imp) {
          rafaga(t, 0.22, 'highpass', 2600, 4800, 2.4, 0.28, Object.assign({ wet: 0.26 }, o));
          tono(t, 440, 280, 0.18, 0.14, Object.assign({ wave: 'triangle', wet: 0.26 }, o));
        } else {
          SONIDOS.venenoTick(t);
          barridoVelocidad(t, 0.16, 750, 2500, 680, 2.0, 0.36, o);
        }
        break;
      case 'trampa_espinas':
        if (!imp) {
          SONIDOS.disparo(t, o);
        } else {
          rafaga(t, 0.16, 'bandpass', 2200, 640, 2.0, 0.44, Object.assign({ wet: 0.24 }, o));
          tono(t, 280, 95, 0.14, 0.22, o);
        }
        break;
      case 'disparo':
        SONIDOS.disparo(t, o);
        break;
      case 'flecha_perforante':
        if (!imp) {
          tono(t, 210, 140, 0.12, 0.20, Object.assign({ wave: 'triangle' }, o));
          barridoVelocidad(t, 0.26, 950, 4200, 1600, 2.8, 0.42, Object.assign({ wet: 0.28 }, o));
        } else {
          rafaga(t, 0.12, 'highpass', 3800, 1500, 1.8, 0.46, Object.assign({ wet: 0.30 }, o));
          tono(t, 1280, 420, 0.18, 0.18, Object.assign({ wet: 0.30 }, o));
        }
        break;
      case 'lluvia_proyectiles':
        if (!imp) {
          for (let k = 0; k < 3; k++) rafaga(t + k * 0.06, 0.18, 'bandpass', 950, 2900, 2.2, 0.22, o);
        } else {
          for (let k = 0; k < 4; k++) SONIDOS.flecha(t + k * 0.055, o);
        }
        break;
      case 'suspension':
        if (!imp) {
          barridoVelocidad(t, 0.30, 420, 2200, 920, 1.8, 0.36, Object.assign({ wet: 0.32 }, o));
          tono(t, 440, 660, 0.28, 0.14, Object.assign({ wet: 0.35 }, o));
        } else {
          SONIDOS.flecha(t, o);
          tono(t, 980, 320, 0.20, 0.22, Object.assign({ wet: 0.32 }, o));
        }
        break;
      case 'bola_fuego':
        if (!imp) SONIDOS.fuego(t, o);
        else {
          SONIDOS.fuego(t, o);
          tono(t, 115, 36, 0.28, 0.34, Object.assign({ wet: 0.30 }, o));
        }
        break;
      case 'tormenta_fuego':
        if (!imp) {
          rafaga(t, 0.40, 'lowpass', 820, 180, 1.2, 0.50, Object.assign({ buffer: 'rosa', wet: 0.36 }, o));
        } else {
          for (let k = 0; k < 3; k++) {
            SONIDOS.fuego(t + k * 0.09, o);
            tono(t + k * 0.09, 120 - k * 12, 36, 0.26, 0.28, Object.assign({ wet: 0.32 }, o));
          }
        }
        break;
      case 'lanza_hielo':
        if (!imp) SONIDOS.hielo(t, o);
        else {
          SONIDOS.hielo(t, o);
          tono(t, 2637, 1760, 0.20, 0.14, Object.assign({ wet: 0.38 }, o));
        }
        break;
      case 'ventisca_glacial':
        if (!imp) {
          rafaga(t, 0.44, 'bandpass', 2400, 1100, 1.4, 0.42, Object.assign({ buffer: 'rosa', wet: 0.44 }, o));
          SONIDOS.hielo(t, o);
        } else {
          SONIDOS.hielo(t, o);
          SONIDOS.hielo(t + 0.08, o);
        }
        break;
      case 'rayo_arcano':
      case 'juicio_relampago':
        if (!imp) {
          SONIDOS.rayo(t, o);
          if (id === 'juicio_relampago') barridoVelocidad(t, 0.22, 520, 3200, 880, 2.0, 0.42, o);
        } else {
          SONIDOS.rayo(t, o);
          tono(t, 150, 48, 0.22, 0.30, Object.assign({ wet: 0.34 }, o));
        }
        break;
      case 'orbe_arcano':
        if (!imp) {
          tono(t, 520, 880, 0.14, 0.14, Object.assign({ wave: 'sine', wet: 0.32 }, o));
          rafaga(t, 0.12, 'bandpass', 1400, 2600, 2.0, 0.18, Object.assign({ wet: 0.28 }, o));
        } else {
          SONIDOS.magia(t, o);
        }
        break;
      default: {
        const s = String(id || '');
        if (s.startsWith('sw_')) return dispararSkillSfx(t, 'corte_cruzado', fase, o);
        if (s.startsWith('gs_')) return dispararSkillSfx(t, 'hendidura', fase, o);
        if (s.startsWith('dg_')) return dispararSkillSfx(t, 'paso_sombrio', fase, o);
        if (s.startsWith('ax_') || s.startsWith('a2_')) return dispararSkillSfx(t, 'torbellino', fase, o);
        if (s.startsWith('mc_')) return dispararSkillSfx(t, 'sismo', fase, o);
        if (s.startsWith('ln_')) return dispararSkillSfx(t, 'tajo', fase, o);
        if (s.startsWith('bw_')) return dispararSkillSfx(t, 'disparo', fase, o);
        if (s.startsWith('st_')) {
          if (/hielo|escarcha|geli/.test(s)) return dispararSkillSfx(t, 'lanza_hielo', fase, o);
          if (/rayo|relampago|tormenta|arcano/.test(s)) return dispararSkillSfx(t, 'juicio_relampago', fase, o);
          return dispararSkillSfx(t, 'bola_fuego', fase, o);
        }
        SONIDOS.habilidad(t, o);
        break;
      }
    }
  }

  // ------------------- Clasificación y vocalizaciones de enemigos -------------------
  function clasificarEnemigo(info) {
    if (!info) return 'humanoide';
    if (info.boss || (info.rangoElite || 1) >= 8) return 'jefe';
    const txt = ((info.name || '') + ' ' + (info.archetype || '') + ' ' + (info.id || '')).toLowerCase();
    if (/esqueleto|zombi|zombie|lich|momia|banshee|espectro|fantasma|wraith|nosferatu|ossuary|skeleton|undead|necro|reaper|death_knight|mummy|vampiro/.test(txt)) {
      return 'nomuerto';
    }
    if (/lobo|oso|jabali|jabalí|boar|arana|araña|arachnid|halcon|halcón|aguila|águila|serpiente|naga|cerbero|cerberus|dragon|dragón|draco|grifo|pantera|tigre|leon|león|rata|murcielago|murciélago|bestia|beast|wolf|bear|hawk|spider/.test(txt)) {
      return 'bestia';
    }
    if (info.tipoRango === 'mago' || info.raceCategory === 'magical' || /mago|mage|brujo|chaman|chamán|shaman|hechicero|sorcerer|wizard|oracle|siren|archimago|elemental|demon|infernal/.test(txt)) {
      return 'magico';
    }
    return 'humanoide';
  }

  function dispararEnemigoSfx(t, evento, info) {
    const familia = clasificarEnemigo(info);
    const o = { pan: info && typeof info.pan === 'number' ? info.pan : 0, wet: 0.22 };

    if (familia === 'jefe') {
      if (evento === 'aggro' || evento === 'ataque') {
        tono(t, variar(115, 0.08), 54, 0.34, 0.28, Object.assign({ wave: 'sawtooth', lp: 460 }, o));
        rafaga(t, 0.30, 'lowpass', 520, 120, 1.3, 0.42, Object.assign({ buffer: 'marron' }, o));
      } else if (evento === 'golpeado') {
        tono(t, variar(130, 0.1), 72, 0.18, 0.22, Object.assign({ wave: 'sawtooth', lp: 580 }, o));
      } else if (evento === 'muerte') {
        tono(t, 125, 34, 0.65, 0.36, Object.assign({ wave: 'sawtooth', lp: 420, wet: 0.42 }, o));
        rafaga(t, 0.58, 'lowpass', 640, 80, 1.2, 0.48, Object.assign({ buffer: 'marron', wet: 0.42 }, o));
      }
      return;
    }

    if (familia === 'nomuerto') {
      if (evento === 'aggro') {
        rafaga(t, 0.22, 'bandpass', 1800, 920, 3.2, 0.24, o);
        tono(t, 440, 310, 0.24, 0.10, Object.assign({ wave: 'triangle', wet: 0.36 }, o));
      } else if (evento === 'ataque') {
        rafaga(t, 0.14, 'bandpass', 2400, 1100, 2.5, 0.30, o);
        tono(t, variar(240, 0.12), 140, 0.15, 0.16, Object.assign({ wave: 'sawtooth', lp: 920 }, o));
      } else if (evento === 'golpeado') {
        // Chasquido seco de hueso
        rafaga(t, 0.055, 'bandpass', variar(2100, 0.15), 1100, 3.5, 0.38, o);
        tono(t, variar(680, 0.15), 420, 0.06, 0.14, Object.assign({ wave: 'triangle' }, o));
      } else if (evento === 'muerte') {
        for (let k = 0; k < 4; k++) {
          rafaga(t + k * 0.055, 0.05, 'bandpass', variar(1900 - k * 220, 0.15), 850, 3.2, 0.32 - k * 0.04, o);
        }
        tono(t, 360, 110, 0.34, 0.14, Object.assign({ wave: 'triangle', wet: 0.32 }, o));
      }
      return;
    }

    if (familia === 'bestia') {
      if (evento === 'aggro') {
        tono(t, variar(210, 0.12), 145, 0.26, 0.22, Object.assign({ wave: 'sawtooth', lp: 780 }, o));
        rafaga(t, 0.24, 'bandpass', 950, 420, 1.8, 0.28, o);
      } else if (evento === 'ataque') {
        tono(t, variar(280, 0.12), 150, 0.18, 0.22, Object.assign({ wave: 'sawtooth', lp: 920 }, o));
        rafaga(t, 0.14, 'bandpass', 1400, 560, 1.6, 0.32, o);
      } else if (evento === 'golpeado') {
        tono(t, variar(420, 0.14), 210, 0.14, 0.18, Object.assign({ wave: 'triangle' }, o));
      } else if (evento === 'muerte') {
        tono(t, 380, 115, 0.38, 0.22, Object.assign({ wave: 'sawtooth', lp: 840, wet: 0.28 }, o));
        rafaga(t, 0.28, 'lowpass', 720, 160, 1.2, 0.26, o);
      }
      return;
    }

    if (familia === 'magico') {
      if (evento === 'aggro' || evento === 'ataque') {
        tono(t, variar(620, 0.1), 880, 0.20, 0.14, Object.assign({ wave: 'sine', wet: 0.38 }, o));
        rafaga(t, 0.18, 'bandpass', 2200, 1200, 2.4, 0.20, Object.assign({ wet: 0.34 }, o));
      } else if (evento === 'golpeado') {
        tono(t, variar(540, 0.12), 340, 0.13, 0.14, Object.assign({ wave: 'triangle', wet: 0.30 }, o));
      } else if (evento === 'muerte') {
        tono(t, 760, 180, 0.42, 0.18, Object.assign({ wave: 'sine', wet: 0.44 }, o));
        rafaga(t, 0.36, 'highpass', 2400, 5200, 1.6, 0.24, Object.assign({ wet: 0.42 }, o));
      }
      return;
    }

    // Humanoide
    if (evento === 'aggro') {
      tono(t, variar(195, 0.1), 240, 0.18, 0.18, Object.assign({ wave: 'sawtooth', lp: 740 }, o));
    } else if (evento === 'ataque') {
      barridoVelocidad(t, 0.16, 420, 1850, 560, 1.8, 0.28, o);
      tono(t, variar(185, 0.1), 130, 0.14, 0.18, Object.assign({ wave: 'triangle' }, o));
    } else if (evento === 'golpeado') {
      tono(t, variar(210, 0.12), 115, 0.12, 0.20, Object.assign({ wave: 'triangle' }, o));
    } else if (evento === 'muerte') {
      tono(t, 220, 75, 0.34, 0.24, Object.assign({ wave: 'triangle', wet: 0.26 }, o));
      rafaga(t + 0.12, 0.14, 'lowpass', 620, 140, 1.1, 0.28, o);
    }
  }

  // Pasos del héroe según superficie
  function dispararPasoSfx(t, superficie, corriendo) {
    const vol = corriendo ? 0.16 : 0.10;
    const pan = (Math.random() - 0.5) * 0.16;
    if (superficie === 'agua') {
      rafaga(t, 0.11, 'bandpass', variar(1600, 0.14), 680, 1.4, vol * 1.4, { buffer: 'rosa', pan, wet: 0.22 });
      tono(t + 0.01, variar(360, 0.15), 220, 0.07, vol * 0.45, { pan });
    } else if (superficie === 'piedra' || superficie === 'mazmorra') {
      const wet = superficie === 'mazmorra' ? 0.42 : 0.16;
      rafaga(t, 0.045, 'bandpass', variar(1450, 0.14), 620, 2.0, vol * 1.1, { pan, wet });
      tono(t, variar(145, 0.12), 68, 0.06, vol * 1.15, { pan, wet });
    } else {
      // Hierba / pradera
      rafaga(t, 0.07, 'bandpass', variar(1900, 0.15), 820, 1.3, vol * 0.95, { buffer: 'rosa', pan, wet: 0.08 });
      tono(t, variar(110, 0.12), 55, 0.055, vol * 0.75, { pan });
    }
  }

  // ------------------- Throttles independientes por categoría -------------------
  const throttles = Object.create(null);
  function puedeSonar(clave, minIntervaloS) {
    const c = contexto();
    if (!c) return null;
    const ahora = c.currentTime;
    const prev = throttles[clave];
    if (prev !== undefined && ahora - prev < minIntervaloS) return null;
    throttles[clave] = ahora;
    return ahora + 0.005;
  }

  const disparar = fn => {
    const c = contexto();
    if (c) fn(c.currentTime + 0.005);
  };

  const api = {
    disparo(opts) {
      const t = puedeSonar('disparo', 0.06);
      if (t !== null) SONIDOS.disparo(t, opts);
    },
    esquiva(perfecta = false) {
      const t = puedeSonar('esquiva', 0.12);
      if (t !== null) SONIDOS.esquiva(t, perfecta);
    },
    critico(opts) {
      const t = puedeSonar('critico', MIN_INTERVALO_S);
      if (t !== null) SONIDOS.critico(t, opts);
    },
    danoHeroe(opts) {
      const t = puedeSonar('danoHeroe', 0.08);
      if (t !== null) SONIDOS.danoHeroe(t, opts);
    },
    bloqueo() {
      const t = puedeSonar('bloqueo', 0.08);
      if (t !== null) SONIDOS.bloqueo(t);
    },
    escudoAbsorbe() {
      const t = puedeSonar('escudoAbs', 0.08);
      if (t !== null) SONIDOS.escudoAbsorbe(t);
    },
    fuego(opts) { disparar(t => SONIDOS.fuego(t, opts)); },
    hielo(opts) { disparar(t => SONIDOS.hielo(t, opts)); },
    rayo(opts) { disparar(t => SONIDOS.rayo(t, opts)); },
    habilidad(opts) {
      const t = puedeSonar('habilidad', MIN_INTERVALO_S);
      if (t !== null) SONIDOS.habilidad(t, opts);
    },
    golpeVeloz(intensidad = 1, opts) {
      const t = puedeSonar('golpeVeloz', 0.07);
      if (t !== null) SONIDOS.golpeVeloz(t, intensidad, opts);
    },
    skill(skillId, fase = 'inicio', opts) {
      const k = 'skill:' + skillId + ':' + fase;
      const t = puedeSonar(k, 0.055);
      if (t !== null) { muestrasSkill(t, skillId, fase, opts); dispararSkillSfx(t, skillId, fase, opts); }
    },
    enemigo(evento, info) {
      const ev = evento || 'golpeado';
      const minT = ev === 'aggro' ? 2.2 : (ev === 'muerte' ? 0.10 : 0.14);
      const t = puedeSonar('enemigo:' + ev, minT);
      if (t !== null) dispararEnemigoSfx(t, ev, info);
    },
    clasificarEnemigo,
    paso(superficie = 'hierba', corriendo = false) {
      const t = puedeSonar('paso', 0.18);
      if (t !== null) dispararPasoSfx(t, superficie, corriendo);
    },
    pocion(tipo = 'vida') { disparar(t => SONIDOS.pocion(t, tipo)); },
    subirNivel() { disparar(SONIDOS.subirNivel); },
    mision() { disparar(SONIDOS.mision); },
    avisoJefe() { disparar(SONIDOS.avisoJefe); },
    rugidoJefe() { disparar(SONIDOS.rugidoJefe); },
    eleccion() { disparar(SONIDOS.eleccion); },
    dialogo() {
      const t = puedeSonar('dialogo', 0.10);
      if (t !== null) SONIDOS.dialogo(t);
    },
    monedas() {
      const t = puedeSonar('monedas', 0.08);
      if (t !== null) SONIDOS.monedas(t);
    },
    botinObjeto() { disparar(SONIDOS.botinObjeto); },
    equipar() { disparar(SONIDOS.equipar); },
    forja() { disparar(SONIDOS.forja); },
    descanso() { disparar(SONIDOS.descanso); },
    mazmorraEntrada() { disparar(SONIDOS.mazmorraEntrada); },
    zonaNueva(esPueblo = false) {
      const c = contexto();
      if (!c || c.state !== 'running') return;
      if (motorMusica && typeof motorMusica.stinger === 'function') {
        const prev = throttles.zonaNueva;
        if (prev !== undefined && c.currentTime - prev < 1.5) return;
        throttles.zonaNueva = c.currentTime;
        motorMusica.stinger(esPueblo ? 'pueblo' : 'zonaNueva');
      }
    },
    victoriaJefe() { disparar(SONIDOS.victoriaJefe); },
    muerteHeroe() { disparar(SONIDOS.muerteHeroe); },
    venenoTick() {
      const t = puedeSonar('veneno', 0.35);
      if (t !== null) SONIDOS.venenoTick(t);
    },
    uiClick() {
      const t = puedeSonar('uiClick', 0.05);
      if (t !== null) SONIDOS.uiClick(t);
    },
    companeroSkill(tipo) {
      const t = puedeSonar('compSkill', 0.25);
      if (t !== null) SONIDOS.companeroSkill(t, tipo);
    },
    impacto(tipo, opts) {
      const t = puedeSonar('impacto', MIN_INTERVALO_S);
      if (t !== null) (SONIDOS[tipo] || SONIDOS.metal)(t, opts);
    },

    desbloquear() {
      if (!activo) return false;
      const c = contexto();
      if (!c) return false;
      if (c.state === 'running') aplicarAmbiente();
      return c.state === 'running';
    },

    setAmbiente(tipo, hora) {
      const clave = AMBIENTES_FALLBACK[tipo] ? tipo : 'silencio';
      const nuevaHora = hora || ambHora;
      const cambio = ambBase !== clave || ambHora !== nuevaHora;
      ambBase = clave;
      ambHora = nuevaHora;
      if (cambio || !motorMusica) aplicarAmbiente();
    },

    setCombate(enComb, esJefe = false, fase2 = false) {
      const nowMs = Date.now();
      const j = !!esJefe;
      const f2 = !!(j && fase2);

      if (enComb) {
        if (combateSalidaTimer) { clearTimeout(combateSalidaTimer); combateSalidaTimer = null; }
        finCombateHastaMs = nowMs + 4500;
        const cambio = !enCombate || combateJefe !== j || combateFase2 !== f2;
        enCombate = true;
        combateJefe = j;
        combateFase2 = f2;
        if (cambio) aplicarAmbiente();
        return;
      }

      if (!enCombate) return;
      const restante = finCombateHastaMs - nowMs;
      if (restante <= 0) {
        if (combateSalidaTimer) { clearTimeout(combateSalidaTimer); combateSalidaTimer = null; }
        enCombate = false;
        combateJefe = false;
        combateFase2 = false;
        aplicarAmbiente();
      } else if (!combateSalidaTimer) {
        combateSalidaTimer = setTimeout(() => {
          combateSalidaTimer = null;
          if (Date.now() >= finCombateHastaMs && enCombate) {
            enCombate = false;
            combateJefe = false;
            combateFase2 = false;
            aplicarAmbiente();
          }
        }, restante + 40);
      }
    },

    setVolumen(canal, val) {
      if (!Object.prototype.hasOwnProperty.call(VOLS, canal)) return VOLS[canal];
      const v = clamp(Number(val), 0, 1);
      VOLS[canal] = v;
      if (ac) {
        const nodo = canal === 'master' ? masterGain
          : (canal === 'musica' ? musicaBus : (canal === 'sfx' ? sfxBus : ambienteBus));
        if (nodo && nodo.gain) {
          const t = ac.currentTime;
          nodo.gain.cancelScheduledValues(t);
          nodo.gain.setValueAtTime(v, t);
        }
      }
      return v;
    },

    getVolumenes() {
      return { master: VOLS.master, musica: VOLS.musica, sfx: VOLS.sfx, ambiente: VOLS.ambiente };
    },

    setOculto(flag) {
      oculto = !!flag;
      if (motorMusica && typeof motorMusica.setOculto === 'function') motorMusica.setOculto(oculto);
      if (!ac || !activo) return;
      if (oculto) {
        detenerMusicaFallback();
        if (ac.state === 'running' && typeof ac.suspend === 'function') ac.suspend().catch(() => {});
      } else {
        const p = typeof ac.resume === 'function' ? ac.resume() : null;
        if (p && typeof p.then === 'function') p.then(() => aplicarAmbiente()).catch(() => {});
        else aplicarAmbiente();
      }
    },

    estaActivo() { return activo; },
    estado() {
      return {
        activo,
        running: !!(ac && ac.state === 'running'),
        tipo: ambBase,
        temaActual: temaEfectivoActual(),
        hora: ambHora,
        combate: enCombate,
        jefeCombate: combateJefe,
        reverbModo,
        volumenes: { master: VOLS.master, musica: VOLS.musica, sfx: VOLS.sfx, ambiente: VOLS.ambiente }
      };
    },

    activar(v) {
      activo = !!v;
      if (activo) {
        api.desbloquear();
      } else {
        if (combateSalidaTimer) { clearTimeout(combateSalidaTimer); combateSalidaTimer = null; }
        detenerMusicaFallback();
        if (motorMusica && typeof motorMusica.detener === 'function') motorMusica.detener();
        if (ac && typeof ac.suspend === 'function') ac.suspend().catch(() => {});
      }
    }
  };

  root.Sonidos = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
