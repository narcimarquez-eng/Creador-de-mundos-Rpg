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
    chispazo:     [1, 2, 3].map(n => 'sfx/rayos/chispazo_0' + n + '.ogg'),
    tajo_aire:    ['sfx/espadas/tajo_aire_01.ogg'],
    golpe_cuerpo: [1, 2, 3, 4].map(n => 'sfx/golpes/golpe_cuerpo_0' + n + '.ogg'),
    golpe_crujiente: ['sfx/golpes/golpe_crujiente_01.ogg'],
    esfuerzo_mujer: ['sfx/voces/esfuerzo_mujer_01.wav'],
    esfuerzo_hombre_ligero: ['sfx/voces/esfuerzo_hombre_01.wav'],
    esfuerzo_hombre_fuerte: ['sfx/voces/esfuerzo_hombre_02.wav'],
    esfuerzo_hombre: ['sfx/voces/esfuerzo_hombre_01.wav', 'sfx/voces/esfuerzo_hombre_02.wav'],
    bicho_grunido: ['sfx/enemigos/bicho_grunido_01.wav'],
    bicho_rugido: ['sfx/enemigos/bicho_rugido_01.wav']
  };
  const muestrasBuf = {};
  let manifestConsultado = false;
  function precargarListaMuestras() {
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
  function cargarMuestras() {
    if (typeof fetch !== 'function' || !ac) return;
    if (!manifestConsultado) {
      manifestConsultado = true;
      fetch('sfx/manifest.json')
        .then(r => (r.ok ? r.json() : null))
        .then(man => {
          if (man && typeof man === 'object') {
            Object.keys(man).forEach(k => {
              if (!Array.isArray(man[k])) return;
              const prev = Array.isArray(MUESTRAS[k]) ? MUESTRAS[k] : [];
              const combinados = prev.slice();
              man[k].forEach(ruta => { if (typeof ruta === 'string' && !combinados.includes(ruta)) combinados.push(ruta); });
              if (combinados.length) MUESTRAS[k] = combinados;
            });
          }
        })
        .catch(() => {})
        .finally(() => precargarListaMuestras());
      return;
    }
    precargarListaMuestras();
  }
  // Reproduce una variante al azar con el tono un poco cambiado. Devuelve { parar(fundido) } o null si no está cargada.
  function muestra(nombre, t, opts) {
    if (!ac) return null;
    const lista = (MUESTRAS[nombre] || []).map(r => muestrasBuf[r]).filter(Boolean);
    if (!lista.length) return null;
    const cfg = Object.assign({ wet: 0.12 }, opts);
    const src = ac.createBufferSource();
    src.buffer = lista[Math.floor(Math.random() * lista.length)];
    if (src.playbackRate) {
      src.playbackRate.value = variar(cfg.velocidad || 1, cfg.tono !== undefined ? cfg.tono : 0.05);
    }
    const g = ac.createGain();
    const gainVal = cfg.vol !== undefined ? cfg.vol : 1;
    g.gain.value = gainVal;
    src.connect(g);
    conectarSalida(g, cfg);
    if (cfg.offset && cfg.offset > 0) src.start(t, cfg.offset);
    else src.start(t);
    if (cfg.durMax && cfg.durMax > 0) {
      const dur = Math.max(0.03, cfg.durMax);
      const fade = Math.min(dur * 0.4, 0.06);
      const fadeStart = t + Math.max(0.005, dur - fade);
      if (g.gain.setValueAtTime && g.gain.linearRampToValueAtTime) {
        g.gain.setValueAtTime(gainVal, fadeStart);
        g.gain.linearRampToValueAtTime(0.0001, t + dur);
      }
      try { src.stop(t + dur + 0.02); } catch (_) {}
    }
    return {
      parar(fundido = 0.1) {
        const tt = Math.max(ac.currentTime, t);
        if (g.gain.cancelScheduledValues) g.gain.cancelScheduledValues(tt);
        if (g.gain.setValueAtTime) g.gain.setValueAtTime(g.gain.value, tt);
        if (g.gain.linearRampToValueAtTime) g.gain.linearRampToValueAtTime(0.0001, tt + fundido);
        try { src.stop(tt + fundido + 0.02); } catch (_) {}
      }
    };
  }
  // El golpe que acierta suena distinto según el arma: las dagas, agudas y secas; mandobles y mazas, graves y metálicos.
  // Cada habilidad tiene además un pequeño desplazamiento de tono fijo para que no suenen todas iguales.
  const PERFIL_ARMA = {
    dagas:     { muestra: 'choque_corte', velocidad: 1.34, vol: 0.62 },
    espadas:   { muestra: 'choque_corte', velocidad: 1.0,  vol: 0.85 },
    lanzas:    { muestra: 'choque_corte', velocidad: 1.12, vol: 0.75 },
    hachas:    { muestra: 'choque_corte', velocidad: 0.86, vol: 0.9 },
    mandobles: { muestra: 'choque_metal', velocidad: 0.9,  vol: 0.8 },
    hachas_2m: { muestra: 'choque_metal', velocidad: 0.80, vol: 0.88 },
    mazas:     { muestra: 'choque_metal', velocidad: 0.74, vol: 0.85 }
  };
  function datosSkill(id) {
    const L = root.CombatLib;
    return (L && L.SKILLS && id && L.SKILLS[id]) || null;
  }
  function tonoDeSkill(id) {
    let h = 0;
    const s = String(id || '');
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return 0.94 + (h % 13) / 100;   // 0,94 … 1,06
  }
  function perfilGolpe(opts) {
    const o = opts || {};
    const sk = datosSkill(o.skill);
    const clase = (sk && sk.armaClase) || o.clase || 'espadas';
    const p = PERFIL_ARMA[clase] || PERFIL_ARMA.espadas;
    return { muestra: p.muestra, velocidad: p.velocidad * (o.skill && o.skill !== 'attack' ? tonoDeSkill(o.skill) : 1), vol: p.vol };
  }

  // Técnicas de rayo (también las de arma con elemento rayo): descarga al golpear; las lentas, carga mientras se preparan
  const SKILL_RAYO_MUESTRA = new Set(['tornillo', 'juicio_relampago', 'salto_demoledor']);
  const esSkillRayo = id => SKILL_RAYO_MUESTRA.has(id) || !!(datosSkill(id) && datosSkill(id).elemento === 'rayo' && datosSkill(id).armaClase);
  let cargaRayo = null;
  let rafagaSombra = null;
  // Tajo al aire: se programa para que su punto fuerte (~0,12 s) caiga en cada golpe de la animación.
  // Solo técnicas cuerpo a cuerpo (no arcos, bastones ni hechizos); el tono, según el arma.
  function tajosAire(t, id, opts) {
    const o = opts || {};
    const sk = datosSkill(id);
    if (id !== 'attack' && (!sk || sk.arma !== 'cuerpo' || sk.unico)) return;
    if (sk && (sk.armaClase === 'arcos' || sk.armaClase === 'bastones')) return;
    const clase = (sk && sk.armaClase) || o.clase || 'espadas';
    if (clase === 'arcos' || clase === 'bastones') return;
    const p = PERFIL_ARMA[clase] || PERFIL_ARMA.espadas;
    const imp = sk && sk.impacto !== undefined ? (Array.isArray(sk.impacto) ? sk.impacto : [sk.impacto]) : [0];
    imp.forEach(x => muestra('tajo_aire', t + Math.max(0, (x || 0) - 0.12),
      { velocidad: p.velocidad * (clase === 'dagas' ? 1.08 : 1), vol: clase === 'dagas' ? 0.45 : 0.6, pan: o.pan }));
  }
  function muestrasSkill(t, id, fase, opts) {
    if (PERFILES_SFX_ESTUDIO[id] || id === 'attack' || id === 'normal_combo' || id === 'normal_slash' || id === 'normal_heavy' || id === 'disparo' || id === 'orbe_arcano') return;
    if (fase === 'inicio') tajosAire(t, id, opts);
    if (String(id).startsWith('dg_')) return;   // las dagas tienen su propia mezcla en dispararSkillSfx
    if (fase === 'inicio') {
      const sk = datosSkill(id);
      const primerGolpe = sk ? (Array.isArray(sk.impacto) ? sk.impacto[0] : sk.impacto) : 1;
      if (esSkillRayo(id) && (primerGolpe || 0) >= 0.5) {
        if (cargaRayo) cargaRayo.parar(0.05);
        cargaRayo = muestra('rayo_carga', t, { vol: 0.5, tono: 0.03 });
      }
      if (id === 'contraataque') muestra('choque_metal', t, { vol: 0.8 });
    } else if (fase === 'impacto' && esSkillRayo(id)) {
      if (cargaRayo) { cargaRayo.parar(0.12); cargaRayo = null; }
      if (muestra('rayo_cadena', t, opts)) muestra('chispazo', t + 0.08, Object.assign({}, opts, { vol: 0.45 }));
    }
  }

  // ------------------- Motor SKILL_SFX completo de Armaduras-glb v86 -------------------
  const AXE_WEAPON_CLASSES = new Set(['hachas', 'hachas_2m']);
  const BLADED_WEAPON_CLASSES = new Set(['espadas', 'mandobles', 'dagas', 'lanzas']);
  let estudioClashPanSide = 1;
  let estudioPrismNoteIdx = 0;

  function makeNoise(startT, dur, filterType, fStart, fEnd, qVal, gainPeak, atk = 0.01, wet = 0.16, pan = 0) {
    if (!ac || (!ruido && !ruidoRosa)) return;
    const d = Math.max(0.02, dur);
    const pink = typeof filterType === 'object' ? Boolean(filterType.pink) : false;
    const fType = typeof filterType === 'object' ? filterType.type : filterType;
    const src = ac.createBufferSource();
    src.buffer = pink ? (ruidoRosa || ruido) : (ruido || ruidoRosa);
    src.loop = true;
    const flt = ac.createBiquadFilter();
    flt.type = fType;
    flt.Q.value = Math.max(0.2, qVal || 1);
    const f0 = Math.max(30, fStart);
    const f1 = Math.max(30, fEnd);
    flt.frequency.setValueAtTime(f0, startT);
    if (f1 !== f0) flt.frequency.exponentialRampToValueAtTime(f1, startT + d);
    const g = ac.createGain();
    const peak = Math.max(0.0002, gainPeak);
    g.gain.setValueAtTime(0.0001, startT);
    g.gain.linearRampToValueAtTime(peak, startT + Math.min(atk, d * 0.45));
    g.gain.exponentialRampToValueAtTime(0.0001, startT + d);
    src.connect(flt);
    flt.connect(g);
    conectarSalida(g, { wet, pan });
    src.start(startT, Math.random() * 0.6);
    src.stop(startT + d + 0.04);
  }

  function makeTone(type, startT, dur, fStart, fEnd, gainPeak, atk = 0.008, wet = 0.22, detune = 0, pan = 0) {
    if (!ac) return;
    const d = Math.max(0.025, dur);
    const osc = ac.createOscillator();
    osc.type = type || 'sine';
    if (osc.detune && detune) {
      if (typeof osc.detune.setValueAtTime === 'function') osc.detune.setValueAtTime(detune, startT);
      else osc.detune.value = detune;
    }
    const f0 = Math.max(24, fStart);
    const f1 = Math.max(24, fEnd);
    osc.frequency.setValueAtTime(f0, startT);
    if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(f1, startT + d);
    const g = ac.createGain();
    const peak = Math.max(0.0002, gainPeak);
    g.gain.setValueAtTime(0.0001, startT);
    g.gain.linearRampToValueAtTime(peak, startT + Math.min(atk, d * 0.45));
    g.gain.exponentialRampToValueAtTime(0.0001, startT + d);
    osc.connect(g);
    conectarSalida(g, { wet, pan });
    osc.start(startT);
    osc.stop(startT + d + 0.04);
  }

  function makeFilteredTone(type, startT, dur, fStart, fEnd, cutStart, cutEnd, qVal, gainPeak, atk = 0.01, wet = 0.18, detune = 0, pan = 0) {
    if (!ac) return;
    const d = Math.max(0.025, dur);
    const osc = ac.createOscillator();
    osc.type = type || 'sawtooth';
    if (osc.detune && detune) {
      if (typeof osc.detune.setValueAtTime === 'function') osc.detune.setValueAtTime(detune, startT);
      else osc.detune.value = detune;
    }
    const f0 = Math.max(24, fStart);
    const f1 = Math.max(24, fEnd);
    osc.frequency.setValueAtTime(f0, startT);
    if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(f1, startT + d);
    const flt = ac.createBiquadFilter();
    flt.type = 'lowpass';
    flt.Q.value = Math.max(0.2, qVal || 1);
    const c0 = Math.max(60, cutStart);
    const c1 = Math.max(60, cutEnd);
    flt.frequency.setValueAtTime(c0, startT);
    if (c1 !== c0) flt.frequency.exponentialRampToValueAtTime(c1, startT + d);
    const g = ac.createGain();
    const peak = Math.max(0.0002, gainPeak);
    g.gain.setValueAtTime(0.0001, startT);
    g.gain.linearRampToValueAtTime(peak, startT + Math.min(atk, d * 0.45));
    g.gain.exponentialRampToValueAtTime(0.0001, startT + d);
    osc.connect(flt);
    flt.connect(g);
    conectarSalida(g, { wet, pan });
    osc.start(startT);
    osc.stop(startT + d + 0.04);
  }

  function makeSteelFM(startT, dur, fCar, modRatio, modDepth, hpFreq, gainPeak, wet = 0.14, pan = 0) {
    if (!ac) return;
    const d = Math.max(0.03, dur);
    const car = ac.createOscillator();
    car.type = 'triangle';
    const fc = Math.max(400, fCar);
    car.frequency.setValueAtTime(fc, startT);
    car.frequency.exponentialRampToValueAtTime(Math.max(360, fc * 0.94), startT + d);
    const mod = ac.createOscillator();
    mod.type = 'sine';
    mod.frequency.setValueAtTime(Math.max(500, fc * modRatio), startT);
    const modGain = ac.createGain();
    modGain.gain.setValueAtTime(Math.max(10, modDepth), startT);
    modGain.gain.exponentialRampToValueAtTime(0.01, startT + Math.min(d * 0.42, 0.055));
    const hp = ac.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(Math.max(1200, hpFreq), startT);
    hp.Q.value = 0.9;
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(Math.max(1500, fc * 1.15), startT);
    bp.Q.value = 1.6;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, startT);
    g.gain.linearRampToValueAtTime(Math.max(0.0002, gainPeak), startT + 0.0018);
    g.gain.exponentialRampToValueAtTime(0.0001, startT + d);
    mod.connect(modGain);
    modGain.connect(car.frequency);
    car.connect(hp);
    hp.connect(bp);
    bp.connect(g);
    conectarSalida(g, { wet, pan });
    car.start(startT);
    mod.start(startT);
    car.stop(startT + d + 0.03);
    mod.stop(startT + d + 0.03);
  }

  function addElementalAccent(el, t, intensity = 1.0, isImpact = false, pan = 0) {
    const amp = Math.min(1.4, Math.max(0.25, intensity));
    if (el === 'lightning') {
      const snaps = isImpact ? 4 : 2;
      for (let i = 0; i < snaps; i++) {
        const dt = i * (isImpact ? 0.028 : 0.022) + Math.random() * 0.014;
        makeNoise(t + dt, 0.048 + Math.random() * 0.030, 'bandpass', 2600 + Math.random() * 2400, 950, 3.0, 0.15 * amp, 0.002, 0.18, pan + (Math.random() - 0.5) * 0.45);
      }
      makeFilteredTone('sawtooth', t, isImpact ? 0.22 : 0.12, 195 + Math.random() * 65, 58, 950, 220, 1.4, 0.10 * amp, 0.004, 0.16, 0, pan);
      if (isImpact) makeNoise(t + 0.02, 0.62, { type: 'lowpass', pink: true }, 460, 85, 1.0, 0.30 * amp, 0.014, 0.34, pan);
    } else if (el === 'fire') {
      makeNoise(t, isImpact ? 0.54 : 0.25, { type: 'bandpass', pink: true }, isImpact ? 640 : 900, 145, 1.2, 0.28 * amp, 0.016, 0.24, pan);
      makeNoise(t + 0.015, isImpact ? 0.24 : 0.12, 'bandpass', 2800, 1100, 1.4, 0.09 * amp, 0.008, 0.16, pan);
      if (isImpact) makeTone('sine', t, 0.34, 125, 34, 0.26 * amp, 0.005, 0.20, 0, pan);
    } else if (el === 'frost') {
      const shards = isImpact ? 4 : 2;
      for (let i = 0; i < shards; i++) {
        const dt = i * 0.022 + Math.random() * 0.012;
        makeNoise(t + dt, 0.045 + Math.random() * 0.025, 'highpass', 3600 + Math.random() * 1800, 2200, 1.2, 0.13 * amp, 0.002, 0.22, pan + (Math.random() - 0.5) * 0.5);
      }
      makeNoise(t, isImpact ? 0.32 : 0.18, 'bandpass', 3100, 1150, 2.8, 0.14 * amp, 0.012, 0.24, pan);
      if (isImpact) makeNoise(t, 0.26, { type: 'bandpass', pink: true }, 720, 180, 1.5, 0.22 * amp, 0.004, 0.20, pan);
    } else if (el === 'arcane') {
      makeFilteredTone('sawtooth', t, isImpact ? 0.42 : 0.24, 155, 230, 620, 1500, 2.2, 0.11 * amp, 0.025, 0.30, -9, pan);
      makeFilteredTone('sawtooth', t + 0.01, isImpact ? 0.40 : 0.22, 232, 175, 820, 320, 2.0, 0.08 * amp, 0.025, 0.30, 11, pan);
      makeNoise(t, isImpact ? 0.34 : 0.18, 'bandpass', 900, 2700, 3.6, 0.13 * amp, 0.018, 0.28, pan);
    } else if (el === 'void') {
      makeFilteredTone('sawtooth', t, isImpact ? 0.48 : 0.24, 128, 38, 480, 110, 2.0, 0.15 * amp, 0.015, 0.28, -16, pan);
      makeFilteredTone('sawtooth', t, isImpact ? 0.44 : 0.22, 192, 54, 620, 140, 1.8, 0.09 * amp, 0.018, 0.28, 18, pan);
      makeNoise(t, isImpact ? 0.40 : 0.20, { type: 'bandpass', pink: true }, 460, 115, 2.8, 0.20 * amp, 0.02, 0.28, pan);
    } else if (el === 'holy') {
      makeFilteredTone('sawtooth', t, isImpact ? 0.50 : 0.26, 196, 220, 520, 1350, 1.3, 0.085 * amp, 0.055, 0.34, -8, pan);
      makeFilteredTone('sawtooth', t, isImpact ? 0.50 : 0.26, 294, 330, 680, 1500, 1.3, 0.065 * amp, 0.060, 0.34, 9, pan);
      makeNoise(t, isImpact ? 0.38 : 0.20, 'bandpass', 1400, 3600, 2.0, 0.13 * amp, 0.025, 0.32, pan);
      if (isImpact) makeTone('sine', t, 0.36, 130, 40, 0.22 * amp, 0.008, 0.22, 0, pan);
    } else if (el === 'prism') {
      const bands = isImpact ? [950, 1750, 2900, 4200] : [1350, 2650];
      bands.forEach((bf, idx) => {
        makeNoise(t + idx * 0.024, isImpact ? 0.24 : 0.15, 'bandpass', bf, bf * 0.55, 3.8, 0.11 * amp, 0.012, 0.28, pan + (idx % 2 === 0 ? -0.35 : 0.35));
      });
      makeFilteredTone('sawtooth', t, isImpact ? 0.38 : 0.22, 165, 255, 580, 1650, 2.2, 0.085 * amp, 0.030, 0.30, -10, pan);
      makeFilteredTone('sawtooth', t + 0.015, isImpact ? 0.36 : 0.20, 248, 310, 740, 1850, 2.0, 0.065 * amp, 0.032, 0.30, 12, pan);
    }
  }

  function playChargeSwell(t, weaponClass, element = 'lightning', isMagic = false, pan = 0) {
    const isBow = weaponClass === 'arcos';
    const isAxe = AXE_WEAPON_CLASSES.has(weaponClass);
    const isHeavyWeight = isAxe || weaponClass === 'mazas';
    const dur = isMagic ? 0.62 : (isBow ? 0.46 : (isHeavyWeight ? 0.56 : 0.52));
    const fLow = isMagic
      ? (element === 'void' ? 88 : (element === 'fire' ? 104 : 114))
      : (weaponClass === 'hachas_2m' || weaponClass === 'mazas' ? 66 : (weaponClass === 'hachas' || weaponClass === 'mandobles' ? 74 : 92));
    const fHigh = isMagic ? fLow * 2.85 : (isHeavyWeight ? fLow * 2.15 : fLow * 2.95);
    const cutTop1 = isMagic ? 2200 : (isHeavyWeight ? 1080 : 1850);
    const cutTop2 = isMagic ? 2650 : (isHeavyWeight ? 1320 : 2300);
    makeFilteredTone('sawtooth', t, dur, fLow, fHigh, isHeavyWeight ? 180 : 260, cutTop1, 2.2, isHeavyWeight ? 0.19 : 0.175, dur * 0.64, 0.28, -9, pan);
    makeFilteredTone('sawtooth', t + 0.02, dur * 0.96, fLow * 1.498, fHigh * 1.5, isHeavyWeight ? 240 : 360, cutTop2, 2.0, isHeavyWeight ? 0.13 : 0.125, dur * 0.68, 0.28, 10, pan);
    makeNoise(t, dur, 'bandpass', isHeavyWeight ? 260 : 420, isMagic ? 3600 : (isHeavyWeight ? 1550 : 3250), 2.2, isHeavyWeight ? 0.19 : 0.27, dur * 0.68, 0.26, pan);
    makeNoise(t, dur, { type: 'bandpass', pink: true }, isHeavyWeight ? 135 : 175, isHeavyWeight ? 680 : 1080, 1.5, isHeavyWeight ? 0.30 : 0.25, dur * 0.64, 0.24, pan);
    makeTone('sine', t, dur, isHeavyWeight ? 40 : 46, isMagic ? 152 : (isHeavyWeight ? 108 : 138), isHeavyWeight ? 0.30 : 0.23, dur * 0.72, 0.22, 0, pan);
    if (isAxe) makeNoise(t + dur * 0.34, dur * 0.62, { type: 'lowpass', pink: true }, 520, 115, 1.1, 0.24, 0.06, 0.22, pan);
    else addElementalAccent(element, t + dur * 0.36, 0.92, false, pan);
  }

  function playOrbIgnite(t, weaponClass, element = 'lightning', pan = 0) {
    const isStaff = weaponClass === 'bastones';
    makeNoise(t, isStaff ? 0.22 : 0.15, 'bandpass', 480, 2900, 3.0, isStaff ? 0.15 : 0.12, 0.06, 0.28, pan);
    makeFilteredTone('sawtooth', t + 0.02, isStaff ? 0.26 : 0.18, 130, 245, 420, 1380, 2.2, isStaff ? 0.11 : 0.085, 0.02, 0.26, -7, pan);
    makeTone('sine', t + 0.03, 0.16, 140, 62, 0.11, 0.008, 0.16, 0, pan);
    addElementalAccent(element, t + 0.02, isStaff ? 0.85 : 0.62, false, pan);
  }

  const VEL_SWING_CLASE = {
    dagas: 1.24, espadas: 1.02, lanzas: 1.12, hachas: 0.86,
    mandobles: 0.80, hachas_2m: 0.74, mazas: 0.76
  };
  const VEL_CHOC_CLASE = {
    dagas: 1.32, espadas: 1.0, lanzas: 1.12, hachas: 0.86,
    mandobles: 0.88, hachas_2m: 0.80, mazas: 0.76
  };

  function playWeaponSwing(t, weaponClass, element = 'lightning', speedNorm = 1.0, isPierce = false, panIn = null) {
    const sp = clamp(speedNorm || 1.0, 0.65, 1.45);
    const pan = typeof panIn === 'number' ? panIn : (Math.random() - 0.5) * 0.36;
    if (VEL_SWING_CLASE[weaponClass]) {
      const mSwing = muestra('tajo_aire', t, {
        velocidad: clamp(VEL_SWING_CLASE[weaponClass] * sp * (isPierce ? 1.08 : 1), 0.68, 1.48),
        vol: weaponClass === 'dagas' ? 0.55 : (weaponClass === 'mandobles' || weaponClass === 'hachas_2m' ? 0.78 : 0.72),
        pan,
        wet: 0.15
      });
      if (mSwing) {
        if (element && element !== 'physical') addElementalAccent(element, t + 0.012, 0.56 * sp, false, pan);
        return;
      }
    }
    if (weaponClass === 'dagas') {
      makeNoise(t, 0.12, 'bandpass', 4100 * sp, 1350, 2.2, 0.28 * sp, 0.004, 0.14, pan);
      makeNoise(t, 0.10, { type: 'bandpass', pink: true }, 1500 * sp, 480, 1.4, 0.16 * sp, 0.005, 0.12, pan);
    } else if (weaponClass === 'hachas_2m') {
      makeNoise(t, 0.36, { type: 'lowpass', pink: true }, 580 * sp, 135, 1.15, 0.50 * sp, 0.014, 0.20, pan);
      makeNoise(t + 0.008, 0.28, { type: 'bandpass', pink: true }, 760 * sp, 220, 1.35, 0.38 * sp, 0.012, 0.16, pan);
      makeTone('sine', t, 0.28, 124 * sp, 40, 0.34, 0.006, 0.16, 0, pan);
      makeFilteredTone('sawtooth', t, 0.22, 102 * sp, 42, 340, 110, 1.3, 0.19, 0.008, 0.14, 0, pan);
    } else if (weaponClass === 'hachas') {
      makeNoise(t, 0.25, { type: 'lowpass', pink: true }, 720 * sp, 165, 1.2, 0.46 * sp, 0.010, 0.16, pan);
      makeNoise(t + 0.005, 0.19, { type: 'bandpass', pink: true }, 960 * sp, 260, 1.45, 0.34 * sp, 0.008, 0.14, pan);
      makeNoise(t + 0.004, 0.075, 'bandpass', 1240 * sp, 420, 1.5, 0.14 * sp, 0.003, 0.12, pan);
      makeTone('sine', t, 0.20, 142 * sp, 48, 0.30, 0.005, 0.14, 0, pan);
    } else if (weaponClass === 'mandobles') {
      makeNoise(t, 0.34, { type: 'bandpass', pink: true }, 640 * sp, 135, 1.3, 0.40 * sp, 0.022, 0.20, pan);
      makeNoise(t + 0.015, 0.22, 'bandpass', 1650 * sp, 420, 1.8, 0.20 * sp, 0.012, 0.16, pan);
      makeTone('sine', t, 0.24, 145 * sp, 44, 0.20, 0.010, 0.16, 0, pan);
    } else if (weaponClass === 'lanzas') {
      if (isPierce) {
        makeNoise(t, 0.19, 'bandpass', 3400 * sp, 860, 2.8, 0.30 * sp, 0.005, 0.18, pan);
        makeFilteredTone('sawtooth', t, 0.15, 420 * sp, 120, 1400, 320, 1.6, 0.11, 0.005, 0.16, 0, pan);
      } else {
        makeNoise(t, 0.26, { type: 'bandpass', pink: true }, 1050 * sp, 240, 1.7, 0.32 * sp, 0.016, 0.18, pan);
        makeNoise(t, 0.20, 'bandpass', 2400 * sp, 720, 2.2, 0.18 * sp, 0.009, 0.16, pan);
      }
    } else if (weaponClass === 'mazas') {
      makeNoise(t, 0.30, { type: 'lowpass', pink: true }, 560 * sp, 115, 1.1, 0.40 * sp, 0.018, 0.16, pan);
      makeTone('sine', t, 0.22, 135, 42, 0.22, 0.008, 0.15, 0, pan);
    } else if (weaponClass === 'bastones') {
      makeNoise(t, 0.22, 'bandpass', 720, 2400, 2.8, 0.18 * sp, 0.016, 0.32, pan);
      makeFilteredTone('sawtooth', t, 0.24, 145, 225, 480, 1250, 2.0, 0.085, 0.02, 0.30, -8, pan);
    } else if (weaponClass === 'none' || weaponClass === 'unarmed') {
      makeNoise(t, 0.16, { type: 'bandpass', pink: true }, 1200 * sp, 290, 1.4, 0.28 * sp, 0.007, 0.12, pan);
      makeTone('sine', t, 0.12, 165, 52, 0.18, 0.005, 0.10, 0, pan);
    } else {
      const fHi = isPierce ? 3100 : 2300;
      makeNoise(t, 0.20, 'bandpass', fHi * sp, 540, 1.9, 0.28 * sp, 0.008, 0.16, pan);
      makeNoise(t, 0.20, { type: 'bandpass', pink: true }, 920 * sp, 230, 1.4, 0.24 * sp, 0.010, 0.14, pan);
      makeNoise(t + 0.005, 0.07, 'highpass', 3600, 2400, 1.1, 0.08 * sp, 0.003, 0.14, pan);
    }
    if (element && element !== 'physical') {
      if (AXE_WEAPON_CLASSES.has(weaponClass)) makeNoise(t + 0.014, 0.24, { type: 'lowpass', pink: true }, 420, 95, 1.1, 0.22 * sp, 0.008, 0.20, pan);
      else addElementalAccent(element, t + 0.012, 0.56 * sp, false, pan);
    }
  }

  function playDashStep(t, element = 'void', pan = 0) {
    makeNoise(t, 0.16, 'bandpass', 900, 3400, 2.2, 0.22, 0.006, 0.20, pan);
    makeNoise(t, 0.14, { type: 'lowpass', pink: true }, 720, 160, 1.1, 0.16, 0.005, 0.14, pan);
    if (element && element !== 'physical') addElementalAccent(element, t, 0.55, false, pan);
  }

  function playEnergyWaveCast(t, kind, weaponClass, element = 'lightning', pan = 0) {
    const isStaff = weaponClass === 'bastones';
    if (isStaff) {
      makeNoise(t, 0.36, { type: 'bandpass', pink: true }, 1500, 240, 1.5, 0.30, 0.008, 0.34, pan);
      makeNoise(t, 0.28, 'bandpass', 2800, 620, 2.0, 0.22, 0.006, 0.32, pan);
      makeFilteredTone('sawtooth', t, 0.34, 240, 74, 1200, 240, 1.8, 0.14, 0.006, 0.30, -9, pan);
      makeTone('sine', t, 0.26, 155, 44, 0.24, 0.004, 0.22, 0, pan);
    } else if (kind === 'thrust') {
      makeFilteredTone('sawtooth', t, 0.26, 360, 92, 1800, 280, 2.0, 0.14, 0.004, 0.26, 0, pan);
      makeNoise(t, 0.26, 'bandpass', 3800, 760, 2.4, 0.30, 0.005, 0.24, pan);
      makeTone('sine', t, 0.22, 160, 48, 0.22, 0.004, 0.18, 0, pan);
    } else {
      const pitchM = kind === 'vertical' ? 0.85 : 1.05;
      makeNoise(t, 0.34, 'bandpass', 3200 * pitchM, 460, 2.0, 0.32, 0.006, 0.28, pan);
      makeNoise(t, 0.32, { type: 'bandpass', pink: true }, 980 * pitchM, 190, 1.5, 0.26, 0.008, 0.24, pan);
      makeFilteredTone('sawtooth', t, 0.28, 280 * pitchM, 78, 1350, 240, 1.8, 0.13, 0.005, 0.26, 8, pan);
      makeTone('sine', t, 0.26, 142, 42, 0.22, 0.005, 0.20, 0, pan);
    }
    addElementalAccent(element, t + 0.01, 1.05, true, pan);
  }

  function playHeavyImpact(t, weaponClass, element = 'lightning', isSlam = false, pan = 0) {
    const isAxe = AXE_WEAPON_CLASSES.has(weaponClass);
    const is2HAxe = weaponClass === 'hachas_2m';
    const heavy = (isSlam || weaponClass === 'mandobles' || is2HAxe || weaponClass === 'mazas') ? 1.28 : (isAxe ? 1.15 : 1.0);
    makeTone('sine', t, 0.48 * heavy, isAxe ? (is2HAxe ? 102 : 116) : 128, isAxe ? 25 : 28, (isAxe ? 0.46 : 0.38) * Math.min(1.22, heavy), 0.003, 0.20, 0, pan);
    makeFilteredTone('sawtooth', t, 0.24, isAxe ? 128 : 160, isAxe ? 34 : 42, isAxe ? 320 : 420, isAxe ? 78 : 95, 1.4, isAxe ? 0.24 : 0.18, 0.003, 0.18, 0, pan);
    makeNoise(t, 0.48 * heavy, { type: 'lowpass', pink: true }, isAxe ? 820 : 1250, isAxe ? 90 : 110, 1.1, (isAxe ? 0.44 : 0.38) * Math.min(1.22, heavy), 0.003, 0.24, pan);
    if (isAxe || weaponClass === 'mazas') {
      makeNoise(t, 0.20, { type: 'bandpass', pink: true }, is2HAxe ? 480 : 580, 125, 1.8, 0.36, 0.0025, 0.16, pan);
      makeNoise(t, 0.055, 'bandpass', 1120, 320, 1.4, 0.15, 0.0018, 0.14, pan);
      makeTone('sine', t, 0.28, is2HAxe ? 88 : 100, 28, 0.30, 0.0025, 0.14, 0, pan);
    } else {
      makeNoise(t, 0.13, 'bandpass', 2400, 680, 1.4, 0.18, 0.002, 0.18, pan);
    }
    if (isAxe) makeNoise(t + 0.018, 0.52, { type: 'lowpass', pink: true }, 380, 75, 1.0, 0.30 * Math.min(1.2, heavy), 0.012, 0.28, pan);
    else if (element && element !== 'physical') addElementalAccent(element, t + 0.012, 1.15 * Math.min(1.2, heavy), true, pan);
  }

  function playAxeCleave(tBase, weaponClass = 'hachas_2m', isHeavy = false, delaySec = 0, panIn = null) {
    const t = tBase + Math.max(0, delaySec || 0);
    const is2H = weaponClass === 'hachas_2m';
    const w = is2H ? 1.24 : 1.0;
    const hMul = isHeavy ? 1.18 : 1.0;
    estudioClashPanSide = -estudioClashPanSide;
    const pan = typeof panIn === 'number' ? panIn : estudioClashPanSide * (0.10 + Math.random() * 0.16);
    const jitter = 0.94 + Math.random() * 0.12;
    makeTone('sine', t, (is2H ? 0.34 : 0.25) * hMul, (is2H ? 122 : 140) * jitter, is2H ? 34 : 40, 0.48 * hMul, 0.002, 0.18, 0, pan);
    makeFilteredTone('sawtooth', t, 0.21 * w, (is2H ? 128 : 148) * jitter, is2H ? 40 : 48, is2H ? 380 : 460, 110, 1.35, 0.28 * hMul, 0.002, 0.16, 0, pan);
    makeNoise(t, (is2H ? 0.32 : 0.23) * hMul, { type: 'lowpass', pink: true }, (is2H ? 740 : 880) * jitter, is2H ? 130 : 155, 1.15, 0.50 * hMul, 0.002, 0.20, pan);
    makeNoise(t, 0.16 * w, { type: 'bandpass', pink: true }, (is2H ? 540 : 660) * jitter, 190, 1.75, 0.40 * hMul, 0.002, 0.16, pan);
    makeNoise(t + 0.002, 0.095, { type: 'bandpass', pink: true }, (is2H ? 840 : 980) * jitter, 310, 2.0, 0.26 * hMul, 0.0016, 0.14, -pan * 0.5);
    makeNoise(t, 0.038, 'bandpass', (is2H ? 1060 : 1220) * jitter, 390, 1.35, 0.18 * hMul, 0.0012, 0.10, pan);
    if (isHeavy || is2H) makeNoise(t + 0.022, 0.30, { type: 'lowpass', pink: true }, 420, 95, 1.0, 0.28 * hMul, 0.008, 0.22, pan * 0.4);
  }

  function playPhysicalHit(t, weaponClass = 'espadas', kind = 'slash', isHeavy = false, panIn = null) {
    const h = isHeavy ? 1.24 : 1.0;
    estudioClashPanSide = -estudioClashPanSide;
    const pan = typeof panIn === 'number' ? panIn : estudioClashPanSide * (0.12 + Math.random() * 0.18);
    if (VEL_SWING_CLASE[weaponClass]) {
      const velSwing = clamp(VEL_SWING_CLASE[weaponClass] * (isHeavy ? 0.90 : 1.05) * (kind === 'pierce' ? 1.08 : 1), 0.68, 1.48);
      const mSwing = muestra('tajo_aire', t, {
        velocidad: velSwing,
        vol: isHeavy ? 0.80 : 0.64,
        pan,
        wet: 0.14
      });
      if (mSwing) {
        if (AXE_WEAPON_CLASSES.has(weaponClass) || weaponClass === 'mazas') {
          muestra('golpe_cuerpo', t + 0.02, { velocidad: isHeavy ? 0.82 : 0.92, vol: isHeavy ? 0.64 : 0.48, pan, wet: 0.14 });
        } else if (isHeavy && BLADED_WEAPON_CLASSES.has(weaponClass)) {
          const sampleKey = weaponClass === 'mandobles' ? 'choque_metal' : 'choque_corte';
          muestra(sampleKey, t + 0.015, {
            velocidad: VEL_CHOC_CLASE[weaponClass] || 1.0,
            vol: 0.44,
            pan,
            wet: 0.16
          });
        }
        return;
      }
    }
    const jit = 0.94 + Math.random() * 0.12;
    if (weaponClass === 'hachas_2m' || weaponClass === 'hachas') {
      const is2H = weaponClass === 'hachas_2m';
      makeNoise(t, (is2H ? 0.28 : 0.21) * h, { type: 'lowpass', pink: true }, (is2H ? 620 : 760) * jit, is2H ? 140 : 170, 1.15, 0.46 * h, 0.010, 0.16, pan);
      makeNoise(t + 0.008, 0.16 * h, { type: 'bandpass', pink: true }, (is2H ? 540 : 680) * jit, 210, 1.5, 0.36 * h, 0.006, 0.14, pan);
      playAxeCleave(t, weaponClass, isHeavy || is2H, 0.028, pan);
    } else if (weaponClass === 'mandobles') {
      makeNoise(t, 0.30 * h, { type: 'bandpass', pink: true }, 680 * jit, 170, 1.35, 0.42 * h, 0.014, 0.18, pan);
      makeNoise(t + 0.012, 0.18 * h, 'bandpass', 1750 * jit, 480, 1.8, 0.24 * h, 0.008, 0.14, pan);
      makeTone('sine', t + 0.018, 0.22 * h, 148 * jit, 44, 0.28 * h, 0.004, 0.14, 0, pan);
      if (isHeavy) makeNoise(t + 0.026, 0.24, { type: 'lowpass', pink: true }, 820, 120, 1.1, 0.36, 0.003, 0.18, pan);
    } else if (weaponClass === 'dagas') {
      makeNoise(t, 0.11 * h, 'bandpass', (kind === 'pierce' ? 4400 : 3800) * jit, 1200, 2.2, 0.30 * h, 0.003, 0.12, pan);
      makeNoise(t + 0.006, 0.09 * h, { type: 'bandpass', pink: true }, 1400 * jit, 420, 1.5, 0.20 * h, 0.003, 0.10, pan);
      makeTone('sine', t + 0.012, 0.08, 175 * jit, 64, 0.15 * h, 0.002, 0.08, 0, pan);
    } else if (weaponClass === 'mazas') {
      makeNoise(t, 0.26 * h, { type: 'lowpass', pink: true }, 580 * jit, 130, 1.1, 0.44 * h, 0.012, 0.14, pan);
      makeTone('sine', t + 0.020, 0.28 * h, 132 * jit, 34, 0.42 * h, 0.003, 0.16, 0, pan);
      makeNoise(t + 0.022, 0.20 * h, { type: 'bandpass', pink: true }, 520 * jit, 150, 1.7, 0.36 * h, 0.002, 0.14, pan);
      makeFilteredTone('sawtooth', t + 0.020, 0.14 * h, 125 * jit, 42, 340, 90, 1.3, 0.20 * h, 0.003, 0.12, 0, pan);
    } else if (weaponClass === 'lanzas') {
      if (kind === 'pierce') {
        makeNoise(t, 0.17 * h, 'bandpass', 3200 * jit, 820, 2.5, 0.32 * h, 0.004, 0.14, pan);
        makeNoise(t + 0.014, 0.14 * h, { type: 'bandpass', pink: true }, 920 * jit, 260, 1.5, 0.26 * h, 0.004, 0.12, pan);
        makeTone('sine', t + 0.018, 0.14 * h, 155 * jit, 52, 0.22 * h, 0.003, 0.10, 0, pan);
      } else {
        makeNoise(t, 0.24 * h, { type: 'bandpass', pink: true }, 1020 * jit, 240, 1.6, 0.34 * h, 0.012, 0.16, pan);
        makeNoise(t + 0.01, 0.16 * h, 'bandpass', 2200 * jit, 640, 2.0, 0.20 * h, 0.006, 0.14, pan);
      }
    } else if (weaponClass === 'bastones') {
      makeNoise(t, 0.20 * h, { type: 'bandpass', pink: true }, 780 * jit, 220, 1.5, 0.32 * h, 0.008, 0.14, pan);
      makeTone('sine', t + 0.018, 0.16 * h, 170 * jit, 58, 0.26 * h, 0.003, 0.12, 0, pan);
      makeNoise(t + 0.018, 0.10 * h, { type: 'bandpass', pink: true }, 640 * jit, 280, 2.4, 0.24 * h, 0.002, 0.10, pan);
    } else if (weaponClass === 'arcos') {
      makeFilteredTone('sawtooth', t, 0.17 * h, 178 * jit, 76, 620, 180, 1.5, 0.22 * h, 0.002, 0.14, 0, pan);
      makeTone('sine', t, 0.18 * h, 118 * jit, 58, 0.22 * h, 0.003, 0.12, 0, pan);
      makeNoise(t, 0.16 * h, 'bandpass', 3900 * jit, 1050, 2.2, 0.28 * h, 0.003, 0.16, pan);
    } else if (weaponClass === 'none' || weaponClass === 'unarmed') {
      makeNoise(t, 0.15 * h, { type: 'bandpass', pink: true }, 1180 * jit, 280, 1.4, 0.32 * h, 0.005, 0.10, pan);
      makeTone('sine', t + 0.015, 0.16 * h, 152 * jit, 44, 0.34 * h, 0.002, 0.12, 0, pan);
      makeNoise(t + 0.015, 0.11 * h, { type: 'lowpass', pink: true }, 620 * jit, 140, 1.1, 0.28 * h, 0.002, 0.10, pan);
    } else {
      const fHi = kind === 'pierce' ? 3000 : 2350;
      makeNoise(t, 0.18 * h, 'bandpass', fHi * jit, 560, 1.9, 0.30 * h, 0.006, 0.14, pan);
      makeNoise(t, 0.19 * h, { type: 'bandpass', pink: true }, 940 * jit, 240, 1.4, 0.28 * h, 0.008, 0.14, pan);
      makeTone('sine', t + 0.016, 0.14 * h, 158 * jit, 50, 0.22 * h, 0.003, 0.10, 0, pan);
      if (isHeavy) {
        makeNoise(t + 0.020, 0.09, 'bandpass', 2600 * jit, 920, 2.4, 0.18, 0.002, 0.12, pan);
        makeNoise(t + 0.020, 0.16, { type: 'lowpass', pink: true }, 760, 140, 1.1, 0.30, 0.003, 0.14, pan);
      }
    }
  }

  function playSwordClash(tBase, weaponClass = 'espadas', element = 'lightning', style = 'clash', delaySec = 0, panIn = null) {
    const t = tBase + Math.max(0, delaySec || 0);
    const mass = weaponClass === 'dagas' ? 0.74 : ((weaponClass === 'mandobles' || weaponClass === 'hachas_2m') ? 1.28 : ((weaponClass === 'hachas' || weaponClass === 'lanzas') ? 1.08 : 1.0));
    const pitchScale = (1 / Math.pow(mass, 0.42)) * (0.91 + Math.random() * 0.18);
    estudioClashPanSide = -estudioClashPanSide;
    const pan = typeof panIn === 'number' ? panIn : estudioClashPanSide * (0.16 + Math.random() * 0.24);
    const isFlurry = style === 'flurry_clash';

    let samplePlayed = false;
    if (style === 'draw_scrape') {
      const m1 = muestra('tajo_aire', t, { velocidad: clamp(1.18 * pitchScale, 0.7, 1.5), vol: 0.56, pan, wet: 0.16 });
      const m2 = muestra('choque_metal', t + 0.02, { velocidad: clamp(1.32 * pitchScale, 0.75, 1.6), vol: 0.32, durMax: 0.34, pan, wet: 0.18 });
      samplePlayed = !!(m1 || m2);
    } else {
      const sampleKey = (weaponClass === 'mandobles' || weaponClass === 'hachas_2m' || weaponClass === 'mazas') ? 'choque_metal' : 'choque_corte';
      const vel = VEL_CHOC_CLASE[weaponClass] || 1.0;
      samplePlayed = !!muestra(sampleKey, t, {
        velocidad: vel * (isFlurry ? 1.12 : 1.0),
        vol: isFlurry ? 0.64 : 0.84,
        pan,
        wet: 0.18
      });
    }
    if (samplePlayed) {
      if (element && element !== 'physical') addElementalAccent(element, t + 0.012, isFlurry ? 0.34 : 0.46, false, pan);
      return;
    }

    // Respaldo sintetizado suave (sin chasquido metálico estridente) cuando las muestras aún no están cargadas
    if (style === 'draw_scrape') {
      makeNoise(t, 0.14, { type: 'bandpass', pink: true }, 1650 * pitchScale, 780 * pitchScale, 2.4, 0.16, 0.008, 0.14, pan);
      makeNoise(t + 0.012, 0.16, 'bandpass', 2200 * pitchScale, 1250 * pitchScale, 3.2, 0.11, 0.012, 0.16, -pan * 0.5);
      return;
    }
    const gainMul = isFlurry ? 0.78 : 0.94;
    const tailDur = (isFlurry ? 0.14 : 0.21) * Math.min(1.22, Math.max(0.82, mass));
    makeNoise(t, 0.06, { type: 'bandpass', pink: true }, 1150 * pitchScale, 360 * pitchScale, 1.6, 0.28 * gainMul, 0.002, 0.12, pan);
    makeNoise(t + 0.004, tailDur * 0.75, 'bandpass', 2250 * pitchScale, 920 * pitchScale, 3.2, 0.18 * gainMul, 0.004, 0.15, -pan * 0.6);
    makeTone('sine', t, 0.12, 165 * pitchScale, 58, 0.22 * gainMul, 0.003, 0.12, 0, pan);
    makeFilteredTone('triangle', t, tailDur * 0.65, 920 * pitchScale, 680 * pitchScale, 2100, 1100, 1.8, 0.11 * gainMul, 0.003, 0.16, 0, pan);
    if (element && element !== 'physical') addElementalAccent(element, t + 0.012, isFlurry ? 0.34 : 0.46, false, pan);
  }

  function playEnergyBeam(t, element = 'holy', pan = 0) {
    const dur = 1.05;
    makeTone('sine', t, 0.34, 175, 42, 0.34, 0.005, 0.24, 0, pan);
    makeNoise(t, 0.22, 'bandpass', 3400, 820, 1.6, 0.26, 0.006, 0.28, pan);
    makeFilteredTone('sawtooth', t + 0.02, dur, 92, 128, 650, 1600, 2.0, 0.18, 0.06, 0.30, -10, pan);
    makeFilteredTone('sawtooth', t + 0.02, dur, 184, 256, 950, 2100, 1.8, 0.12, 0.08, 0.32, 12, pan);
    makeNoise(t + 0.02, dur, { type: 'bandpass', pink: true }, 680, 1750, 2.0, 0.26, 0.08, 0.34, pan);
    addElementalAccent(element, t + 0.04, 1.15, true, pan);
  }

  function playSupernova(t, element = 'prism', pan = 0) {
    makeNoise(t, 0.11, 'bandpass', 2600, 280, 2.2, 0.20, 0.01, 0.22, pan);
    const boomT = t + 0.09;
    makeTone('sine', boomT, 0.88, 132, 24, 0.44, 0.004, 0.30, 0, pan);
    makeNoise(boomT, 0.96, { type: 'lowpass', pink: true }, 1800, 95, 1.0, 0.42, 0.006, 0.38, pan);
    makeNoise(boomT, 0.58, 'bandpass', 3200, 380, 1.4, 0.24, 0.008, 0.36, pan);
    addElementalAccent(element, boomT + 0.02, 1.30, true, pan);
  }

  function playArcaneVortex(t, element = 'arcane', pan = 0) {
    makeNoise(t, 0.64, 'bandpass', 460, 2800, 3.4, 0.20, 0.10, 0.36, pan);
    makeNoise(t, 0.64, { type: 'bandpass', pink: true }, 240, 780, 2.0, 0.18, 0.12, 0.30, pan);
    makeFilteredTone('sawtooth', t, 0.65, 125, 210, 420, 1450, 2.4, 0.12, 0.08, 0.34, -10, pan);
    makeFilteredTone('sawtooth', t + 0.04, 0.60, 188, 280, 560, 1650, 2.2, 0.09, 0.10, 0.34, 12, pan);
    addElementalAccent(element, t + 0.06, 0.95, false, pan);
  }

  function playBowDraw(t, element = 'lightning', fast = false, pan = 0) {
    const dur = fast ? 0.34 : 0.68;
    makeNoise(t, dur, { type: 'bandpass', pink: true }, 300, 760, 3.4, 0.16, 0.08, 0.14, pan);
    makeFilteredTone('sawtooth', t, dur, 92, 175, 280, 620, 1.8, 0.065, 0.12, 0.14, 0, pan);
    if (element && element !== 'physical') {
      makeNoise(t + dur * 0.25, dur * 0.72, 'bandpass', 1500, 3400, 3.2, 0.085, 0.12, 0.22, pan);
      addElementalAccent(element, t + dur * 0.45, 0.55, false, pan);
    }
  }

  function playSimpleFireball(t, isHeavy = false, pan = 0) {
    const h = isHeavy ? 1.22 : 1.0;
    const jit = 0.94 + Math.random() * 0.12;
    makeNoise(t, 0.28 * h, { type: 'bandpass', pink: true }, 520 * jit, 185, 1.35, 0.36 * h, 0.012, 0.18, pan);
    makeNoise(t + 0.010, 0.18 * h, 'bandpass', 1350 * jit, 420, 1.6, 0.18 * h, 0.008, 0.14, pan);
    makeTone('sine', t, 0.16 * h, 148 * jit, 62, 0.20 * h, 0.006, 0.12, 0, pan);
  }

  function playBowStringCrackle(t, element = 'lightning', charge = 0.7, pan = 0) {
    const amp = Math.min(1.0, Math.max(0.25, charge * 0.75));
    if (element === 'fire') {
      makeNoise(t, 0.11, { type: 'bandpass', pink: true }, 780, 300, 2.0, 0.10 * amp, 0.01, 0.18, pan);
    } else if (element === 'frost') {
      makeNoise(t, 0.055, 'highpass', 4200, 2600, 1.4, 0.09 * amp, 0.002, 0.20, pan);
    } else if (element === 'prism') {
      const bf = 1200 + ((estudioPrismNoteIdx++) % 6) * 480;
      makeNoise(t, 0.085, 'bandpass', bf, bf * 0.65, 4.2, 0.085 * amp, 0.004, 0.24, pan + (Math.random() - 0.5) * 0.4);
    } else {
      makeNoise(t, 0.055, 'bandpass', 2600 + Math.random() * 2200, 1100, 3.6, 0.105 * amp, 0.002, 0.20, pan + (Math.random() - 0.5) * 0.35);
      makeFilteredTone('sawtooth', t, 0.05, 185 + Math.random() * 90, 95, 760, 260, 1.4, 0.045 * amp, 0.002, 0.16, 0, pan);
    }
  }

  function playBowRelease(t, mode, element = 'lightning', isVolley = false, pan = 0) {
    makeFilteredTone('sawtooth', t, 0.20, 185, 78, 680, 180, 1.6, 0.20, 0.002, 0.16, 0, pan);
    makeTone('sine', t, 0.22, 120, 62, 0.20, 0.003, 0.16, 0, pan);
    makeNoise(t, 0.19, 'bandpass', 4200, 1100, 2.2, 0.28, 0.003, 0.20, pan);
    if (isVolley) {
      makeFilteredTone('sawtooth', t + 0.036, 0.16, 215, 90, 740, 210, 1.6, 0.15, 0.002, 0.18, 0, pan);
      makeNoise(t + 0.036, 0.16, 'bandpass', 3800, 1250, 2.2, 0.22, 0.003, 0.20, pan);
    }
    if (mode === 'bow_prism_rain') addElementalAccent('prism', t, 1.15, true, pan);
    else if (mode === 'bow_barrage') addElementalAccent('fire', t, 1.15, true, pan);
    else if (mode === 'bow_frost_shot') addElementalAccent('frost', t, 1.15, true, pan);
    else addElementalAccent(element || 'lightning', t, 1.05, true, pan);
  }

  function playPrismRainSkyCue(tBase, pan = 0) {
    const t = tBase + 0.06;
    makeNoise(t, 0.42, 'bandpass', 650, 4400, 2.8, 0.18, 0.06, 0.34, pan);
    makeFilteredTone('sawtooth', t, 0.40, 145, 290, 480, 1900, 2.2, 0.10, 0.08, 0.32, -8, pan);
    makeFilteredTone('sawtooth', t + 0.03, 0.38, 218, 360, 620, 2200, 2.0, 0.075, 0.08, 0.32, 10, pan);
  }

  function playPrismRainImpact(t, panIn = null) {
    const pan = typeof panIn === 'number' ? clamp(panIn + (Math.random() - 0.5) * 0.5, -0.85, 0.85) : (Math.random() - 0.5) * 0.85;
    const band = 1400 + ((estudioPrismNoteIdx++) % 6) * 420;
    makeNoise(t, 0.085, { type: 'lowpass', pink: true }, 680, 130, 1.0, 0.20, 0.002, 0.16, pan);
    makeTone('sine', t, 0.075, 135, 44, 0.16, 0.002, 0.12, 0, pan);
    makeNoise(t, 0.065, 'bandpass', band, band * 0.5, 3.2, 0.13, 0.002, 0.22, pan);
  }

  // Perfiles completos de las 49 skills abiertas de Armaduras-glb v86
  const PERFILES_SFX_ESTUDIO = {
    // Espadas (1M)
    sw_iaido:     { clase: 'espadas',   anim: 'blink_iaido',         el: 'lightning', dash: true, orb: true },
    sw_solar:     { clase: 'espadas',   anim: 'sword_heavy_cleave',  el: 'fire',      drawScrape: true, slam: true },
    sw_blitz:     { clase: 'espadas',   anim: 'sword_blitz_rush',    el: 'lightning', fastBlade: true, dash: true, wave: 'thrust' },
    sw_cross:     { clase: 'espadas',   anim: 'sword_double_cross',  el: 'arcane',    fastBlade: true, drawScrape: true, wave: 'cross1' },
    sw_lightning: { clase: 'espadas',   anim: 'sword_crescent_draw', el: 'lightning', rangedWave: true, drawScrape: true, wave: 'crescent' },
    sw_celestial: { clase: 'espadas',   anim: 'sword_sky_breaker',   el: 'holy',      rangedWave: true, beam: true, slam: true, wave: 'vertical' },
    // Mandobles (2M)
    gs_sweep:     { clase: 'mandobles', anim: 'polearm_wide_sweep',  el: 'lightning', slam: true },
    gs_titan:     { clase: 'mandobles', anim: 'greataxe_titan_arc',  el: 'fire',      slam: true },
    gs_cross:     { clase: 'mandobles', anim: 'sword_double_cross',  el: 'fire',      fastBlade: true, drawScrape: true, wave: 'cross1' },
    gs_colossus:  { clase: 'mandobles', anim: 'colossus_cleave',     el: 'fire',      slam: true },
    gs_crescent:  { clase: 'mandobles', anim: 'sword_crescent_draw', el: 'lightning', rangedWave: true, drawScrape: true, wave: 'crescent' },
    gs_skybreak:  { clase: 'mandobles', anim: 'sword_sky_breaker',   el: 'holy',      rangedWave: true, beam: true, slam: true, wave: 'vertical' },
    // Dagas
    dg_dash:      { clase: 'dagas',     anim: 'dagger_shadow_dash',  el: 'void',      fastBlade: true, dash: true },
    dg_blink:     { clase: 'dagas',     anim: 'blink_iaido',         el: 'void',      fastBlade: true, orb: true },
    dg_rush:      { clase: 'dagas',     anim: 'dagger_backstab_rush',el: 'void',      fastBlade: true, dash: true },
    dg_venom:     { clase: 'dagas',     anim: 'dragon_helix',        el: 'void',      fastBlade: true, slam: true },
    dg_shadow:    { clase: 'dagas',     anim: 'phantom_flurry',      el: 'void',      fastBlade: true, flurry: true },
    dg_zigzag:    { clase: 'dagas',     anim: 'dagger_zigzag_blitz', el: 'lightning', fastBlade: true, dash: true },
    // Hachas (1M)
    ax_thunder:   { clase: 'hachas',    anim: 'attack',              el: 'lightning', slam: false },
    ax_inferno:   { clase: 'hachas',    anim: 'spin_slash',          el: 'fire',      slam: true },
    ax_berserk:   { clase: 'hachas',    anim: 'aerial_plunge',       el: 'fire',      dash: true, slam: true },
    ax_reap:      { clase: 'hachas',    anim: 'vortex_reaper',       el: 'lightning', slam: true },
    ax_nordic:    { clase: 'hachas',    anim: 'celestial_judgment',  el: 'lightning', beam: true, slam: true, wave: 'vertical' },
    // Hachas (2M)
    a2_sweep:     { clase: 'hachas_2m', anim: 'polearm_wide_sweep',  el: 'void',      slam: true },
    a2_titan:     { clase: 'hachas_2m', anim: 'greataxe_titan_arc',  el: 'fire',      slam: true },
    a2_colossus:  { clase: 'hachas_2m', anim: 'colossus_cleave',     el: 'fire',      slam: true },
    a2_vortex:    { clase: 'hachas_2m', anim: 'vortex_reaper',       el: 'void',      slam: true },
    a2_demolish:  { clase: 'hachas_2m', anim: 'earthshaker_combo',   el: 'prism',     slam: true },
    // Mazas y Martillos
    mc_storm:     { clase: 'mazas',     anim: 'overhead_cleave',     el: 'lightning', slam: true },
    mc_crush:     { clase: 'mazas',     anim: 'colossus_cleave',     el: 'lightning', slam: true },
    mc_seismic:   { clase: 'mazas',     anim: 'earthshaker_combo',   el: 'fire',      slam: true },
    mc_titan:     { clase: 'mazas',     anim: 'ultimate_slam',       el: 'holy',      slam: true },
    mc_judgment:  { clase: 'mazas',     anim: 'celestial_judgment',  el: 'holy',      beam: true, slam: true, wave: 'vertical' },
    // Lanzas (2M)
    ln_sweep:     { clase: 'lanzas',    anim: 'polearm_wide_sweep',  el: 'fire',      slam: true },
    ln_skewer:    { clase: 'lanzas',    anim: 'lance_extended_skewer', el: 'lightning', pierce: true, wave: 'thrust' },
    ln_phalanx:   { clase: 'lanzas',    anim: 'colossus_cleave',     el: 'frost',     slam: true },
    ln_valkyrie:  { clase: 'lanzas',    anim: 'lance_impale_vault',  el: 'lightning', dash: true, pierce: true, slam: true },
    ln_dragon:    { clase: 'lanzas',    anim: 'dragon_helix',        el: 'lightning', fastBlade: true, pierce: true, slam: true },
    // Arcos (2M)
    bw_bolt:      { clase: 'arcos',     anim: 'archery',             el: 'lightning', bowMode: 'archery' },
    bw_double:    { clase: 'arcos',     anim: 'bow_double_shot',     el: 'lightning', bowMode: 'bow_double_shot', volley: true },
    bw_frost:     { clase: 'arcos',     anim: 'bow_frost_shot',      el: 'frost',     bowMode: 'bow_frost_shot' },
    bw_aerial:    { clase: 'arcos',     anim: 'aerial_shot',         el: 'arcane',    bowMode: 'aerial_shot' },
    bw_barrage:   { clase: 'arcos',     anim: 'bow_barrage',         el: 'fire',      bowMode: 'bow_barrage', volley: true },
    bw_prism:     { clase: 'arcos',     anim: 'bow_prism_rain',      el: 'prism',     bowMode: 'bow_prism_rain', prismRain: true },
    // Bastones (Mago)
    st_tempest:   { clase: 'bastones',  anim: 'arcane_tempest',      el: 'arcane',    magic: true, arcane: true, wave: 'crescent' },
    st_meteor:    { clase: 'bastones',  anim: 'meteor_barrage',      el: 'fire',      magic: true, orb: true, wave: 'thrust' },
    st_judgment:  { clase: 'bastones',  anim: 'celestial_judgment',  el: 'holy',      magic: true, beam: true, slam: true, wave: 'vertical' },
    st_solar:     { clase: 'bastones',  anim: 'ultimate_beam',       el: 'holy',      magic: true, beam: true, orb: true },
    st_nova:      { clase: 'bastones',  anim: 'ultimate_nova',       el: 'prism',     magic: true, nova: true, slam: true }
  };

  const ultEstudioEv = Object.create(null);
  function marcarEventoEstudio(clave, t) {
    ultEstudioEv[clave] = t;
  }
  function eventoEstudioReciente(clave, t, ventana = 0.16) {
    const prev = ultEstudioEv[clave];
    return prev !== undefined && Math.abs(t - prev) < ventana;
  }

  function dispararPerfilEstudio(t, p, fase, opts) {
    const pan = (opts && typeof opts.pan === 'number') ? opts.pan : 0;
    const imp = fase === 'impacto';
    if (p.clase === 'arcos') {
      if (!imp) {
        playBowDraw(t, p.el, p.anim === 'bow_double_shot' || p.anim === 'aerial_shot', pan);
        playChargeSwell(t + 0.02, 'arcos', p.el, false, pan);
        if (p.prismRain && !eventoEstudioReciente('prism_sky', t, 0.25)) playPrismRainSkyCue(t + 0.25, pan);
      } else {
        if (!eventoEstudioReciente('bow_release', t, 0.16)) playBowRelease(t, p.bowMode || p.anim, p.el, Boolean(p.volley), pan);
        if (p.prismRain && !eventoEstudioReciente('prism_impact', t, 0.16)) {
          for (let k = 0; k < 4; k++) playPrismRainImpact(t + 0.08 + k * 0.065, pan);
        }
      }
      return;
    }

    if (!imp) {
      playChargeSwell(t, p.clase, p.el, Boolean(p.magic), pan);
      if (p.orb) playOrbIgnite(t + 0.14, p.clase, p.el, pan);
      if (p.dash) playDashStep(t + 0.05, p.el, pan);
      if (p.drawScrape) playSwordClash(t, p.clase, p.el, 'draw_scrape', 0.04, pan);
      if (p.arcane) playArcaneVortex(t + 0.08, p.el, pan);
      if (p.flurry) playWeaponSwing(t + 0.10, p.clase, p.el, 1.15, false, pan);
    } else {
      playWeaponSwing(t, p.clase, p.el, p.fastBlade ? 1.24 : 1.08, Boolean(p.pierce), pan);
      if (AXE_WEAPON_CLASSES.has(p.clase)) {
        playAxeCleave(t, p.clase, Boolean(p.slam || p.clase === 'hachas_2m'), 0.02, pan);
      } else if (BLADED_WEAPON_CLASSES.has(p.clase) && !p.rangedWave) {
        playSwordClash(t, p.clase, p.el, p.fastBlade ? 'flurry_clash' : 'clash', 0.02, pan);
        if (p.flurry) playSwordClash(t, p.clase, p.el, 'flurry_clash', 0.11, -pan);
      }
      if (p.slam && !eventoEstudioReciente('heavy_impact', t, 0.16)) {
        playHeavyImpact(t + 0.015, p.clase, p.el, p.anim === 'ultimate_slam' || p.anim === 'earthshaker_combo', pan);
      }
      if (p.wave && !eventoEstudioReciente('energy_wave', t, 0.16)) playEnergyWaveCast(t + 0.01, p.wave, p.clase, p.el, pan);
      if (p.beam && !eventoEstudioReciente('beam', t, 0.25)) playEnergyBeam(t + 0.02, p.el, pan);
      if (p.nova && !eventoEstudioReciente('nova', t, 0.25)) playSupernova(t + 0.01, p.el, pan);
    }
  }

  function dispararGolpeNormalSfx(t, id, fase, opts) {
    const o = opts || {};
    const pan = typeof o.pan === 'number' ? o.pan : 0;
    const clase = o.clase || (id === 'disparo' ? 'arcos' : (id === 'orbe_arcano' ? 'bastones' : 'espadas'));
    const hitIdx = typeof o.hitIndex === 'number' ? o.hitIndex : 0;
    const heavy = Boolean(o.heavy || id === 'normal_heavy' || hitIdx === 2);
    const kind = o.hitKind || (clase === 'dagas' && hitIdx === 2 ? 'pierce' : (clase === 'lanzas' && (hitIdx === 0 || hitIdx === 2) ? 'pierce' : 'slash'));
    const imp = fase === 'impacto';

    if (clase === 'arcos') {
      if (!imp) playBowDraw(t, 'physical', true, pan);
      else playPhysicalHit(t, 'arcos', 'pierce', heavy, pan);
      return;
    }
    if (clase === 'bastones' && id === 'orbe_arcano') {
      if (!imp) {
        makeNoise(t, 0.12, 'bandpass', 620, 1450, 2.2, 0.14, 0.01, 0.16, pan);
      } else {
        playSimpleFireball(t, heavy, pan);
      }
      return;
    }
    if (!imp) {
      playWeaponSwing(t, clase, 'physical', heavy ? 0.92 : 1.06, kind === 'pierce', pan);
    } else {
      playPhysicalHit(t, clase, kind, heavy, pan);
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
      const pg = perfilGolpe(opts);
      if (muestra(pg.muestra, t, Object.assign({}, opts, { velocidad: pg.velocidad, vol: pg.vol }))) {
        muestra('golpe_cuerpo', t, Object.assign({}, opts, { vol: pg.muestra === 'choque_metal' ? 0.7 : 0.5, velocidad: pg.velocidad > 1.2 ? 1.15 : 1 }));
        return;
      }
      const base = variar(1480, 0.14);
      rafaga(t, 0.055, 'bandpass', variar(4300, 0.1), 2400, 2.8, 0.85, opts);
      tono(t, base, base * 0.96, 0.34, 0.20, Object.assign({ wet: 0.22 }, opts));
      tono(t, base * 1.59, base * 1.54, 0.24, 0.11, Object.assign({ wet: 0.22 }, opts));
      tono(t, base * 2.14, base * 2.08, 0.17, 0.06, Object.assign({ wet: 0.22 }, opts));
    },
    sordo(t, opts) {
      if (muestra('golpe_cuerpo', t, Object.assign({ vol: 0.85 }, opts))) return;
      rafaga(t, 0.10, 'lowpass', variar(920, 0.1), 180, 1.0, 0.78, Object.assign({ buffer: 'rosa' }, opts));
      tono(t, variar(155, 0.08), 54, 0.14, 0.36, opts);
    },
    flecha(t, opts) {
      if (muestra('flecha_impacto', t, opts)) return;
      tono(t, variar(190, 0.08), 68, 0.11, 0.30, opts);
      rafaga(t, 0.045, 'highpass', 2600, 1750, 1.2, 0.26, opts);
    },
    magia(t, opts) {
      if (muestra('baculo_proyectil', t, opts)) return;
      rafaga(t, 0.16, 'bandpass', 1800, 520, 1.6, 0.42, Object.assign({ wet: 0.28 }, opts));
      tono(t, variar(520, 0.1), 180, 0.18, 0.22, Object.assign({ wave: 'triangle', wet: 0.32 }, opts));
    },
    disparo(t, opts) {
      if (muestra('arco_disparo', t, opts)) return;
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
      muestra('golpe_crujiente', t, Object.assign({}, opts, { vol: 0.6 }));
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
      if (muestra('escudo_magico', t, { vol: 0.7 })) return;
      tono(t, 880, 1320, 0.16, 0.16, { wave: 'sine', wet: 0.36 });
      tono(t + 0.03, 1320, 1760, 0.20, 0.12, { wave: 'sine', wet: 0.40 });
      rafaga(t, 0.12, 'highpass', 3600, 5800, 1.6, 0.24, { wet: 0.30 });
    },
    fuego(t, opts) {
      if (muestra('fuego_bola', t, opts)) return;
      rafaga(t, 0.34, 'lowpass', 1050, 140, 1.1, 0.56, Object.assign({ buffer: 'rosa', wet: 0.24 }, opts));
      tono(t, 135, 44, 0.28, 0.26, opts);
    },
    hielo(t, opts) {
      if (muestra('hielo_lanza', t, opts)) return;
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
      if (muestra('veneno_burbuja', t, { vol: 0.55 })) return;
      rafaga(t, 0.12, 'bandpass', 2400, 4200, 3.0, 0.14, { wet: 0.2 });
      tono(t + 0.02, 620, 410, 0.09, 0.08);
    },
    uiClick(t) {
      tono(t, 980, 1220, 0.045, 0.07);
    },
    companeroSkill(t, tipo) {
      if (tipo === 'cura') {
        if (muestra('curacion', t, { vol: 0.65 })) return;
        [523.25, 659.25, 783.99].forEach((f, i) => tono(t + i * 0.06, f, f * 1.01, 0.24, 0.12, { wet: 0.34 }));
      } else if (tipo === 'defensa') {
        if (muestra('escudo_magico', t, { vol: 0.55 })) return;
        tono(t, 440, 587.33, 0.22, 0.13, { wave: 'triangle', wet: 0.30 });
      } else if (tipo === 'debuff') {
        tono(t, 460, 260, 0.22, 0.14, { wave: 'sawtooth', lp: 1100, wet: 0.28 });
      } else {
        tono(t, 330, 660, 0.20, 0.14, { wave: 'triangle', wet: 0.28 });
      }
    }
  };

  // ------------------- Sonido dedicado por cada habilidad (Armaduras-glb v86 + clásicas) -------------------
  function dispararSkillSfx(t, id, fase, opts) {
    const o = Object.assign({}, opts);
    if (id === 'attack' || id === 'normal_combo' || id === 'normal_slash' || id === 'normal_heavy' || id === 'disparo' || id === 'orbe_arcano') {
      dispararGolpeNormalSfx(t, id, fase, o);
      return;
    }
    if (PERFILES_SFX_ESTUDIO[id]) {
      dispararPerfilEstudio(t, PERFILES_SFX_ESTUDIO[id], fase, o);
      return;
    }
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
          if (muestra('sombra_paso', t, o)) break;
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
          if (muestra('torbellino_viento', t, o)) break;
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
          if (muestra('impacto_sismico', t, o)) break;
          tono(t, 92, 28, 0.40, 0.48, Object.assign({ wet: 0.36 }, o));
          rafaga(t, 0.32, 'lowpass', 640, 90, 1.1, 0.68, Object.assign({ buffer: 'marron', wet: 0.34 }, o));
        }
        break;
      case 'salto_demoledor':
        if (!imp) {
          barridoVelocidad(t, 0.32, 320, 2600, 680, 1.8, 0.48, o);
          tono(t, 220, 480, 0.28, 0.20, Object.assign({ wave: 'triangle', wet: 0.28 }, o));
        } else {
          if (muestra('impacto_sismico', t, Object.assign({}, o, { velocidad: 1.08 }))) break;
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
          if (muestra('impacto_sismico', t, Object.assign({}, o, { velocidad: 0.92 }))) break;
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
          if (muestra('nova_explosion', t, o)) break;
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
          if (muestra('escudo_magico', t, o)) break;
          [523.25, 659.25, 783.99].forEach((f, idx) => tono(t + idx * 0.05, f, f * 1.12, 0.28, 0.13, Object.assign({ wet: 0.42 }, o)));
        } else {
          SONIDOS.escudoAbsorbe(t);
        }
        break;
      case 'rafaga':
        if (!imp) {
          if (muestra('torbellino_viento', t, Object.assign({}, o, { velocidad: 1.12 }))) break;
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
          if (muestra('lluvia_flechas', t, o)) break;
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
          if (muestra('fuego_explosion', t, o)) break;
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
          if (muestra('hielo_ventisca', t, o)) break;
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
          if (muestra('baculo_proyectil', t, o)) break;
          tono(t, 520, 880, 0.14, 0.14, Object.assign({ wave: 'sine', wet: 0.32 }, o));
          rafaga(t, 0.12, 'bandpass', 1400, 2600, 2.0, 0.18, Object.assign({ wet: 0.28 }, o));
        } else {
          SONIDOS.magia(t, o);
        }
        break;
      // Dagas: cada técnica con su firma (antes todas usaban la de «paso_sombrio»)
      case 'dg_dash':        // Paso de Sombra: zambullida en la sombra y tajo seco al salir
        if (!imp) {
          dispararSkillSfx(t, 'paso_sombrio', fase, o);
          barridoVelocidad(t + 0.12, 0.18, 300, 2600, 700, 2.0, 0.40, o);
        } else {
          muestra('choque_corte', t, Object.assign({}, o, { velocidad: 1.45, vol: 0.55 }));
          rafaga(t, 0.07, 'highpass', 4200, 2000, 1.8, 0.40, Object.assign({ wet: 0.30 }, o));
        }
        break;
      case 'dg_blink':       // Corte Fantasma: silencio tenso, desenvaine agudo y un único corte limpio
        if (!imp) {
          tono(t, 2400, 2650, 0.30, 0.07, Object.assign({ wave: 'sine', atk: 0.12, wet: 0.40 }, o));
        } else {
          if (!muestra('choque_metal', t, Object.assign({}, o, { velocidad: 1.6, vol: 0.5, wet: 0.35 }))) SONIDOS.metal(t, o);
          tono(t + 0.01, 3200, 2100, 0.30, 0.09, Object.assign({ wet: 0.45 }, o));
        }
        break;
      case 'dg_rush':        // Asalto Asesino: carrera que acelera y puñalada doble
        if (!imp) {
          barridoVelocidad(t, 0.42, 200, 1800, 900, 1.6, 0.42, o);
          tono(t, 140, 260, 0.40, 0.16, Object.assign({ wave: 'triangle', lp: 900 }, o));
        } else {
          muestra('choque_corte', t, Object.assign({}, o, { velocidad: 1.3, vol: 0.6 }));
          muestra('choque_corte', t + 0.075, Object.assign({}, o, { velocidad: 1.5, vol: 0.5 }));
          SONIDOS.critico(t + 0.08, o);
        }
        break;
      case 'dg_venom':       // Hélice Venenosa: giro doble silbante y veneno que burbujea
        if (!imp) {
          barridoVelocidad(t, 0.20, 500, 2200, 700, 2.0, 0.34, o);
          barridoVelocidad(t + 0.20, 0.22, 600, 2600, 800, 2.0, 0.38, o);
        } else {
          dispararSkillSfx(t, 'hoja_veneno', fase, o);
          muestra('choque_corte', t, Object.assign({}, o, { velocidad: 1.2, vol: 0.45 }));
          SONIDOS.venenoTick(t + 0.18);
        }
        break;
      case 'dg_shadow': {    // Ráfaga Sombría: tres pares de cortes que suben de tono
        if (!imp) {
          rafaga(t, 0.30, 'bandpass', 900, 2400, 2.0, 0.30, Object.assign({ buffer: 'rosa', wet: 0.34 }, o));
        } else {
          const ahora = t;
          rafagaSombra = (rafagaSombra && ahora - rafagaSombra.t < 1.6) ? { n: rafagaSombra.n + 1, t: ahora } : { n: 0, t: ahora };
          const v = 1.2 + 0.14 * Math.min(rafagaSombra.n, 2);
          muestra('choque_corte', t, Object.assign({}, o, { velocidad: v, vol: 0.5 }));
          muestra('choque_corte', t + 0.11, Object.assign({}, o, { velocidad: v + 0.07, vol: 0.45 }));
          barridoVelocidad(t, 0.10, 900, 3200, 1200, 2.2, 0.30, o);
        }
        break;
      }
      case 'dg_zigzag':      // Zigzag Relámpago: chispazos en cada quiebro y descarga al golpear
        if (!imp) {
          if (!muestra('chispazo', t, Object.assign({}, o, { vol: 0.4 }))) SONIDOS.rayo(t, o);
          barridoVelocidad(t, 0.16, 600, 3000, 900, 2.0, 0.34, o);
        } else {
          if (!muestra('rayo_cadena', t, Object.assign({}, o, { vol: 0.75, velocidad: 1.15 }))) SONIDOS.rayo(t, o);
          muestra('chispazo', t + 0.06, Object.assign({}, o, { vol: 0.4 }));
          muestra('choque_corte', t, Object.assign({}, o, { velocidad: 1.4, vol: 0.45 }));
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
      if (evento === 'aggro') {
        const m = muestra('bicho_rugido', t, { velocidad: 0.72, vol: 0.92, wet: 0.34, pan: o.pan });
        tono(t, variar(96, 0.08), 42, 0.32, m ? 0.20 : 0.28, Object.assign({ wave: 'sawtooth', lp: 460 }, o));
        if (!m) rafaga(t, 0.30, 'lowpass', 520, 120, 1.3, 0.42, Object.assign({ buffer: 'marron' }, o));
      } else if (evento === 'ataque') {
        const clave = Math.random() < 0.5 ? 'bicho_grunido' : 'bicho_rugido';
        const m = muestra(clave, t, { velocidad: 0.78, vol: 0.85, durMax: 0.95, wet: 0.28, pan: o.pan });
        if (!m) {
          tono(t, variar(115, 0.08), 54, 0.34, 0.28, Object.assign({ wave: 'sawtooth', lp: 460 }, o));
          rafaga(t, 0.30, 'lowpass', 520, 120, 1.3, 0.42, Object.assign({ buffer: 'marron' }, o));
        }
      } else if (evento === 'golpeado') {
        const m = muestra('bicho_grunido', t, { velocidad: 0.88, vol: 0.58, durMax: 0.38, wet: 0.22, pan: o.pan });
        if (!m) tono(t, variar(130, 0.1), 72, 0.18, 0.22, Object.assign({ wave: 'sawtooth', lp: 580 }, o));
      } else if (evento === 'muerte') {
        const m = muestra('bicho_rugido', t, { velocidad: 0.58, vol: 0.96, wet: 0.44, pan: o.pan });
        tono(t, 125, 34, 0.65, m ? 0.22 : 0.36, Object.assign({ wave: 'sawtooth', lp: 420, wet: 0.42 }, o));
        if (!m) rafaga(t, 0.58, 'lowpass', 640, 80, 1.2, 0.48, Object.assign({ buffer: 'marron', wet: 0.42 }, o));
      }
      return;
    }

    if (familia === 'nomuerto') {
      if (evento === 'aggro') {
        muestra('bicho_grunido', t, { velocidad: 0.84, vol: 0.64, durMax: 1.0, wet: 0.38, pan: o.pan });
        rafaga(t, 0.22, 'bandpass', 1800, 920, 3.2, 0.22, o);
        tono(t, 440, 310, 0.24, 0.10, Object.assign({ wave: 'triangle', wet: 0.36 }, o));
      } else if (evento === 'ataque') {
        const m = muestra('bicho_rugido', t, { velocidad: 1.16, vol: 0.62, durMax: 0.72, wet: 0.34, pan: o.pan });
        if (!m) {
          rafaga(t, 0.14, 'bandpass', 2400, 1100, 2.5, 0.30, o);
          tono(t, variar(240, 0.12), 140, 0.15, 0.16, Object.assign({ wave: 'sawtooth', lp: 920 }, o));
        }
      } else if (evento === 'golpeado') {
        // Chasquido seco de hueso + gruñido breve
        muestra('bicho_grunido', t, { velocidad: 1.32, vol: 0.30, durMax: 0.24, wet: 0.26, pan: o.pan });
        rafaga(t, 0.055, 'bandpass', variar(2100, 0.15), 1100, 3.5, 0.38, o);
        tono(t, variar(680, 0.15), 420, 0.06, 0.14, Object.assign({ wave: 'triangle' }, o));
      } else if (evento === 'muerte') {
        muestra('bicho_grunido', t, { velocidad: 0.68, vol: 0.66, wet: 0.38, pan: o.pan });
        for (let k = 0; k < 4; k++) {
          rafaga(t + k * 0.055, 0.05, 'bandpass', variar(1900 - k * 220, 0.15), 850, 3.2, 0.32 - k * 0.04, o);
        }
        tono(t, 360, 110, 0.34, 0.14, Object.assign({ wave: 'triangle', wet: 0.32 }, o));
      }
      return;
    }

    if (familia === 'bestia') {
      if (evento === 'aggro') {
        const m = muestra('bicho_grunido', t, { velocidad: 1.04, vol: 0.82, durMax: 1.15, wet: 0.20, pan: o.pan });
        if (!m) {
          tono(t, variar(210, 0.12), 145, 0.26, 0.22, Object.assign({ wave: 'sawtooth', lp: 780 }, o));
          rafaga(t, 0.24, 'bandpass', 950, 420, 1.8, 0.28, o);
        }
      } else if (evento === 'ataque') {
        const clave = Math.random() < 0.65 ? 'bicho_grunido' : 'bicho_rugido';
        const m = muestra(clave, t, { velocidad: 1.12, vol: 0.78, durMax: 0.78, wet: 0.18, pan: o.pan });
        if (!m) {
          tono(t, variar(280, 0.12), 150, 0.18, 0.22, Object.assign({ wave: 'sawtooth', lp: 920 }, o));
          rafaga(t, 0.14, 'bandpass', 1400, 560, 1.6, 0.32, o);
        }
      } else if (evento === 'golpeado') {
        const m = muestra('bicho_grunido', t, { velocidad: 1.24, vol: 0.55, durMax: 0.34, wet: 0.18, pan: o.pan });
        if (!m) tono(t, variar(420, 0.14), 210, 0.14, 0.18, Object.assign({ wave: 'triangle' }, o));
      } else if (evento === 'muerte') {
        const m = muestra('bicho_rugido', t, { velocidad: 0.86, vol: 0.84, wet: 0.28, pan: o.pan });
        if (!m) {
          tono(t, 380, 115, 0.38, 0.22, Object.assign({ wave: 'sawtooth', lp: 840, wet: 0.28 }, o));
          rafaga(t, 0.28, 'lowpass', 720, 160, 1.2, 0.26, o);
        }
      }
      return;
    }

    if (familia === 'magico') {
      if (evento === 'aggro' || evento === 'ataque') {
        muestra('bicho_rugido', t, { velocidad: 1.26, vol: 0.44, durMax: 0.65, wet: 0.44, pan: o.pan });
        tono(t, variar(620, 0.1), 880, 0.20, 0.14, Object.assign({ wave: 'sine', wet: 0.38 }, o));
        rafaga(t, 0.18, 'bandpass', 2200, 1200, 2.4, 0.20, Object.assign({ wet: 0.34 }, o));
      } else if (evento === 'golpeado') {
        tono(t, variar(540, 0.12), 340, 0.13, 0.14, Object.assign({ wave: 'triangle', wet: 0.30 }, o));
      } else if (evento === 'muerte') {
        muestra('bicho_rugido', t, { velocidad: 0.78, vol: 0.50, wet: 0.46, pan: o.pan });
        tono(t, 760, 180, 0.42, 0.18, Object.assign({ wave: 'sine', wet: 0.44 }, o));
        rafaga(t, 0.36, 'highpass', 2400, 5200, 1.6, 0.24, Object.assign({ wet: 0.42 }, o));
      }
      return;
    }

    // Humanoide
    if (evento === 'aggro') {
      const m = muestra('esfuerzo_hombre_ligero', t, { velocidad: 0.84, vol: 0.56, wet: 0.20, pan: o.pan });
      if (!m) tono(t, variar(195, 0.1), 240, 0.18, 0.18, Object.assign({ wave: 'sawtooth', lp: 740 }, o));
    } else if (evento === 'ataque') {
      const m = muestra('esfuerzo_hombre_ligero', t, { velocidad: 0.88, vol: 0.52, wet: 0.18, pan: o.pan });
      barridoVelocidad(t, 0.16, 420, 1850, 560, 1.8, 0.24, o);
      if (!m) tono(t, variar(185, 0.1), 130, 0.14, 0.18, Object.assign({ wave: 'triangle' }, o));
    } else if (evento === 'golpeado') {
      const m = muestra('bicho_grunido', t, { velocidad: 1.35, vol: 0.28, durMax: 0.22, wet: 0.16, pan: o.pan });
      if (!m) tono(t, variar(210, 0.12), 115, 0.12, 0.20, Object.assign({ wave: 'triangle' }, o));
    } else if (evento === 'muerte') {
      const m = muestra('bicho_grunido', t, { velocidad: 0.78, vol: 0.46, durMax: 0.65, wet: 0.26, pan: o.pan });
      if (!m) {
        tono(t, 220, 75, 0.34, 0.24, Object.assign({ wave: 'triangle', wet: 0.26 }, o));
        rafaga(t + 0.12, 0.14, 'lowpass', 620, 140, 1.1, 0.28, o);
      }
    }
  }

  // Sonidos vocales de esfuerzo del héroe según género ('mujer' | 'hombre') e intensidad
  function dispararEsfuerzoSfx(t, genero = 'hombre', opts = {}) {
    const o = opts || {};
    const pan = typeof o.pan === 'number' ? o.pan : 0;
    const esMujer = genero === 'mujer';
    const intenso = !!o.intenso;
    let played = null;
    if (esMujer) {
      played = muestra('esfuerzo_mujer', t, {
        vol: intenso ? 0.88 : 0.74,
        velocidad: intenso ? 0.95 : 1.03,
        tono: 0.04,
        pan,
        wet: 0.14
      });
    } else {
      const clave = intenso ? 'esfuerzo_hombre_fuerte' : 'esfuerzo_hombre_ligero';
      played = muestra(clave, t, {
        vol: intenso ? 0.86 : 0.76,
        velocidad: 1.0,
        tono: 0.04,
        pan,
        wet: intenso ? 0.15 : 0.14
      });
    }
    if (played) return;
    // Respaldo vocal breve si las muestras aún no han terminado de cargarse
    const dur = esMujer ? 0.16 : (intenso ? 0.24 : 0.15);
    const f0 = esMujer ? (intenso ? 440 : 410) : (intenso ? 245 : 195);
    const f1 = esMujer ? 260 : (intenso ? 145 : 118);
    rafaga(t, dur, 'bandpass', esMujer ? 1600 : 1050, esMujer ? 920 : 620, 2.6, intenso ? 0.22 : 0.17, { buffer: 'rosa', atk: 0.015, pan, wet: 0.14 });
    tono(t, variar(f0, 0.06), f1, dur, intenso ? 0.18 : 0.14, { wave: 'triangle', atk: 0.012, lp: esMujer ? 1800 : 1200, pan, wet: 0.14 });
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
      const hitSub = opts && opts.hitIndex !== undefined ? (':' + opts.hitIndex) : '';
      const k = 'skill:' + skillId + ':' + fase + hitSub;
      const t = puedeSonar(k, 0.04);
      if (t !== null) { muestrasSkill(t, skillId, fase, opts); dispararSkillSfx(t, skillId, fase, opts); }
    },
    eventoEstudio(evento, opts) {
      const o = opts || {};
      const minT = evento === 'prism_impact' ? 0.048 : (evento === 'bow_crackle' ? 0.12 : 0.04);
      const t = puedeSonar('estudio:' + evento, minT);
      if (t === null) return;
      const pan = typeof o.pan === 'number' ? o.pan : 0;
      const clase = o.clase || 'espadas';
      const el = o.element || 'lightning';
      marcarEventoEstudio(evento, t);
      switch (evento) {
        case 'bow_draw':      playBowDraw(t, el, Boolean(o.fast), pan); break;
        case 'bow_crackle':   playBowStringCrackle(t, el, o.charge || 0.7, pan); break;
        case 'bow_release':   playBowRelease(t, o.mode || 'archery', el, Boolean(o.isVolley), pan); break;
        case 'energy_wave':   playEnergyWaveCast(t, o.kind || 'crescent', clase, el, pan); break;
        case 'fireball':      playSimpleFireball(t, Boolean(o.heavy), pan); break;
        case 'prism_sky':     playPrismRainSkyCue(t, pan); break;
        case 'prism_impact':  playPrismRainImpact(t, pan); break;
        case 'meteor_impact': playHeavyImpact(t, 'bastones', 'fire', true, pan); break;
        case 'beam':          playEnergyBeam(t, el, pan); break;
        case 'nova':          playSupernova(t, el, pan); break;
        case 'heavy_impact':  playHeavyImpact(t, clase, el, Boolean(o.isSlam), pan); break;
        case 'orb_ignite':    playOrbIgnite(t, clase, el, pan); break;
        case 'dash':          playDashStep(t, el, pan); break;
        case 'physical_hit':  playPhysicalHit(t, clase, o.kind || 'slash', Boolean(o.heavy), pan); break;
        case 'sword_clash':   playSwordClash(t, clase, el, o.style || 'clash', 0, pan); break;
        case 'axe_cleave':    playAxeCleave(t, clase, Boolean(o.heavy), 0, pan); break;
        default: break;
      }
    },
    PERFILES_SFX_ESTUDIO,
    enemigo(evento, info) {
      const ev = evento || 'golpeado';
      const minT = ev === 'aggro' ? 2.2 : (ev === 'muerte' ? 0.10 : 0.14);
      const t = puedeSonar('enemigo:' + ev, minT);
      if (t !== null) dispararEnemigoSfx(t, ev, info);
    },
    esfuerzo(genero = 'hombre', opts = {}) {
      const o = opts || {};
      if (typeof o.probabilidad === 'number' && Math.random() > o.probabilidad) return false;
      const t = puedeSonar('esfuerzo', o.sinCooldown ? 0 : 0.80);
      if (t === null) return false;
      dispararEsfuerzoSfx(t, genero === 'mujer' ? 'mujer' : 'hombre', o);
      return true;
    },
    MUESTRAS,
    registrarMuestra(ruta, buf) { if (ruta && buf) muestrasBuf[ruta] = buf; },
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
