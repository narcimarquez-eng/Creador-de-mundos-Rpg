// Sonidos y música ambiente procedural del visor generados con Web Audio (sin archivos externos).
// Incluye desbloqueo automático ante el primer gesto del usuario y mezcla separada SFX / Música.
(function (root) {
  'use strict';
  let ac = null, masterGain = null, salida = null, musicaBus = null, ruido = null, ultimo = 0, activo = true;
  let ambTipo = 'silencio', ambHora = 'day', ambNodos = null;
  let musTimer = null, musPaso = 0, oculto = false;
  const MIN_INTERVALO_S = 0.06;   // en ataques de área no suenan decenas de impactos a la vez

  const AMBIENTES = {
    campo:    { tipo: 'lowpass',  freq: 520, q: 0.7, lfoAmp: 160, gain: 0.16 },
    agua:     { tipo: 'bandpass', freq: 820, q: 1.0, lfoAmp: 260, gain: 0.22 },
    pueblo:   { tipo: 'lowpass',  freq: 380, q: 0.7, lfoAmp: 70,  gain: 0.09 },
    mazmorra: { tipo: 'lowpass',  freq: 180, q: 1.6, lfoAmp: 50,  gain: 0.18 },
    silencio: { tipo: 'lowpass',  freq: 250, q: 0.7, lfoAmp: 0,   gain: 0.0001 }
  };

  // Escalas y timbres por zona para el secuenciador musical procedural
  const TEMAS = {
    pueblo: {
      notas: [293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33],
      bajos: [146.83, 196.00, 174.61, 146.83],
      patron: [0, 2, 4, -1, 5, 4, 2, -1, 1, 3, 4, 2, 0, -1, 4, -1],
      osc: 'triangle', cutoff: 1450, vol: 0.085, eco: false
    },
    campo: {
      notas: [392.00, 440.00, 493.88, 587.33, 659.25, 783.99],
      bajos: [196.00, 164.81, 146.83, 196.00],
      patron: [0, -1, 2, 4, -1, 3, 2, 0, 1, -1, 3, 5, -1, 4, 2, -1],
      osc: 'triangle', cutoff: 1650, vol: 0.080, eco: false
    },
    agua: {
      notas: [587.33, 659.25, 783.99, 880.00, 987.77, 1174.66],
      bajos: [196.00, 220.00, 146.83, 196.00],
      patron: [0, 2, 4, 5, -1, 3, 1, -1, 2, 4, -1, 3, 0, -1, 2, -1],
      osc: 'sine', cutoff: 2100, vol: 0.070, eco: true
    },
    mazmorra: {
      notas: [293.66, 311.13, 349.23, 440.00, 466.16, 587.33],
      bajos: [73.42, 87.31, 77.78, 73.42],
      patron: [0, -1, -1, 1, -1, -1, 3, -1, 2, -1, -1, 1, -1, 4, -1, -1],
      osc: 'sine', cutoff: 1100, vol: 0.090, eco: true
    }
  };

  function asegurarAmbiente() {
    if (!ac || !musicaBus || ambNodos) return ambNodos;
    const len = Math.floor(ac.sampleRate * 2.0);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + w * 0.099046;
      b1 = 0.96300 * b1 + w * 0.2965164;
      b2 = 0.57000 * b2 + w * 1.0526913;
      d[i] = Math.max(-1, Math.min(1, (b0 + b1 + b2 + w * 0.1848) * 0.42));
    }
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
    ambNodos = { src, filtro, g, lfo, lfoGain };
    return ambNodos;
  }

  function notaMusica(t, freq, dur, vol, tipoOsc, cutoff) {
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
    o.connect(f);
    f.connect(g);
    g.connect(musicaBus);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function tickMusica() {
    if (!ac || !activo || oculto || ac.state !== 'running' || ambTipo === 'silencio') return;
    const tema = TEMAS[ambTipo];
    if (!tema) return;
    const t = ac.currentTime + 0.03;
    const esNoche = ambHora === 'night' || ambTipo === 'mazmorra';
    if (musPaso % 4 === 0) {
      const idxBajo = Math.floor(musPaso / 4) % tema.bajos.length;
      const fBajo = tema.bajos[idxBajo];
      notaMusica(t, fBajo, 3.1, ambTipo === 'mazmorra' ? 0.068 : 0.055, 'sine', 420);
      if (ambTipo !== 'mazmorra') {
        notaMusica(t + 0.04, fBajo * 1.5, 2.7, 0.032, 'sine', 640);
      }
    }
    const idxPat = musPaso % tema.patron.length;
    const grado = tema.patron[idxPat];
    if (grado >= 0 && (!esNoche || musPaso % 2 === 0 || idxPat === 3 || idxPat === 13)) {
      const fNota = tema.notas[grado % tema.notas.length] * (esNoche && ambTipo !== 'mazmorra' ? 0.5 : 1);
      const cut = esNoche ? Math.round(tema.cutoff * 0.78) : tema.cutoff;
      notaMusica(t, fNota, esNoche ? 1.55 : 1.15, tema.vol, tema.osc, cut);
      if (tema.eco) {
        notaMusica(t + 0.32, fNota * (ambTipo === 'agua' ? 1.5 : 1.0), 1.05, tema.vol * 0.38, 'sine', cut * 0.85);
      }
    }
    musPaso = (musPaso + 1) % 64;
  }

  function detenerMusica() {
    if (musTimer) {
      clearInterval(musTimer);
      musTimer = null;
    }
  }

  function asegurarMusica() {
    detenerMusica();
    if (!ac || !activo || ambTipo === 'silencio') return;
    const pasoMs = (ambTipo === 'mazmorra' || ambHora === 'night') ? 1050 : 850;
    musTimer = setInterval(tickMusica, pasoMs);
  }

  function aplicarAmbiente() {
    if (!ac || !activo || ac.state !== 'running') return;
    if (ambTipo === 'silencio') {
      detenerMusica();
      if (!ambNodos) return;
    }
    const n = asegurarAmbiente();
    if (!n) return;
    const cfg = AMBIENTES[ambTipo] || AMBIENTES.silencio;
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
    if (ambTipo !== 'silencio' && !oculto) {
      if (!musTimer) tickMusica();
      asegurarMusica();
    }
  }

  function contexto() {
    if (!activo) return null;
    if (!ac) {
      const Ctor = root.AudioContext || root.webkitAudioContext;
      if (!Ctor) return null;
      ac = new Ctor();
      masterGain = ac.createGain();
      masterGain.gain.value = 0.88;
      masterGain.connect(ac.destination);
      salida = ac.createGain();
      salida.gain.value = 0.55;
      salida.connect(masterGain);
      musicaBus = ac.createGain();
      musicaBus.gain.value = 0.50;
      musicaBus.connect(masterGain);
      ruido = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.4), ac.sampleRate);
      const d = ruido.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ac.state === 'suspended') {
      const p = ac.resume();
      if (p && typeof p.then === 'function') p.then(() => aplicarAmbiente()).catch(() => {});
    } else if (ambTipo !== 'silencio' && (!ambNodos || !musTimer)) {
      aplicarAmbiente();
    }
    return ac;
  }

  // Ruido filtrado con envolvente y barrido de frecuencia
  function rafaga(t, dur, tipo, f0, f1, q, vol) {
    const src = ac.createBufferSource();
    src.buffer = ruido;
    const f = ac.createBiquadFilter();
    f.type = tipo;
    f.Q.value = q;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(salida);
    src.start(t, Math.random() * 0.2);
    src.stop(t + dur + 0.02);
  }

  // Tono senoidal que baja de frecuencia y se apaga
  function tono(t, freq, freqFin, dur, vol) {
    const o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freqFin, t + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(salida);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  const SONIDOS = {
    // Metal contra metal: chasquido agudo y tres parciales que suenan un instante
    metal(t) {
      const base = 1400 + Math.random() * 500;
      rafaga(t, 0.05, 'bandpass', 4200, 2600, 3, 0.9);
      tono(t, base, base * 0.98, 0.35, 0.22);
      tono(t, base * 1.59, base * 1.55, 0.25, 0.12);
      tono(t, base * 2.14, base * 2.1, 0.18, 0.06);
    },
    // Golpe sordo, sin arma: grave y corto
    sordo(t) {
      rafaga(t, 0.09, 'lowpass', 900, 200, 1, 0.8);
      tono(t, 150, 60, 0.12, 0.35);
    },
    // Impacto de flecha: golpe seco con un poco de aire
    flecha(t) {
      tono(t, 180, 70, 0.12, 0.3);
      rafaga(t, 0.04, 'highpass', 2500, 1800, 1, 0.25);
    },
    // Disparo de flecha: silbido que sube
    disparo(t) {
      rafaga(t, 0.28, 'bandpass', 800, 2600, 2, 0.28);
    },
    // Esquiva rápida: ráfaga ascendente de viento
    esquiva(t) {
      rafaga(t, 0.18, 'bandpass', 600, 1900, 1.8, 0.32);
    },
    // Golpe crítico: doble parcial metálico brillante
    critico(t) {
      rafaga(t, 0.06, 'highpass', 3000, 4800, 1.4, 0.5);
      tono(t, 1850, 1480, 0.24, 0.24);
      tono(t, 2775, 2220, 0.20, 0.16);
    },
    // Daño recibido por el héroe: impacto grave seco
    danoHeroe(t) {
      rafaga(t, 0.10, 'lowpass', 720, 180, 1.2, 0.55);
      tono(t, 120, 48, 0.14, 0.34);
    },
    // Llamarada / bola o lluvia de fuego
    fuego(t) {
      rafaga(t, 0.34, 'lowpass', 950, 140, 1.1, 0.55);
      tono(t, 130, 45, 0.28, 0.26);
    },
    // Cristales y escarcha
    hielo(t) {
      rafaga(t, 0.16, 'highpass', 3200, 5200, 1.4, 0.25);
      tono(t, 2200, 1950, 0.11, 0.12);
      tono(t + 0.04, 2950, 2600, 0.11, 0.11);
      tono(t + 0.08, 3700, 3250, 0.12, 0.10);
    },
    // Descarga eléctrica / rayo arcano
    rayo(t) {
      rafaga(t, 0.28, 'bandpass', 5200, 420, 1.8, 0.65);
      tono(t, 1400, 180, 0.22, 0.22);
    },
    // Técnica pesada de arma
    habilidad(t) {
      rafaga(t, 0.24, 'bandpass', 1200, 360, 1.4, 0.50);
      tono(t, 240, 90, 0.22, 0.28);
    },
    // Poción: dos burbujas ascendentes
    pocion(t) {
      tono(t, 420, 760, 0.11, 0.18);
      tono(t + 0.07, 580, 980, 0.12, 0.18);
    },
    // Subida de nivel: arpegio cálido de 4 notas
    subirNivel(t) {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        tono(t + i * 0.09, f, f * 1.005, 0.24, 0.18);
      });
    },
    // Encargo o hito cumplido
    mision(t) {
      [587.33, 739.99, 880].forEach((f, i) => {
        tono(t + i * 0.10, f, f * 1.003, 0.22, 0.16);
      });
    },
    // Advertencia de ataque telegrafiado
    avisoJefe(t) {
      tono(t, 190, 110, 0.26, 0.26);
      tono(t, 285, 165, 0.24, 0.14);
    },
    // Impacto / cambio a fase 2 de jefe
    rugidoJefe(t) {
      rafaga(t, 0.48, 'lowpass', 420, 90, 1.3, 0.52);
      tono(t, 110, 46, 0.45, 0.34);
    },
    // Decisión narrativa importante sellada
    eleccion(t) {
      [440, 554.37, 659.25].forEach((f, i) => {
        tono(t + i * 0.08, f, f * 1.004, 0.32, 0.16);
      });
    },
    // Toque suave de pergamino/campanilla en diálogos y subtítulos
    dialogo(t) {
      tono(t, 659.25, 783.99, 0.14, 0.10);
    }
  };

  let ultimoCrit = 0, ultimoSkill = 0;
  const disparar = fn => {
    const c = contexto();
    if (c) fn(c.currentTime + 0.005);
  };
  const api = {
    disparo() { disparar(SONIDOS.disparo); },
    esquiva() { disparar(SONIDOS.esquiva); },
    critico() {
      const c = contexto();
      if (!c) return;
      const ahora = c.currentTime;
      if (ahora - ultimoCrit < MIN_INTERVALO_S) return;
      ultimoCrit = ahora;
      SONIDOS.critico(ahora + 0.005);
    },
    danoHeroe() { disparar(SONIDOS.danoHeroe); },
    fuego() { disparar(SONIDOS.fuego); },
    hielo() { disparar(SONIDOS.hielo); },
    rayo() { disparar(SONIDOS.rayo); },
    habilidad() {
      const c = contexto();
      if (!c) return;
      const ahora = c.currentTime;
      if (ahora - ultimoSkill < MIN_INTERVALO_S) return;
      ultimoSkill = ahora;
      SONIDOS.habilidad(ahora + 0.005);
    },
    pocion() { disparar(SONIDOS.pocion); },
    subirNivel() { disparar(SONIDOS.subirNivel); },
    mision() { disparar(SONIDOS.mision); },
    avisoJefe() { disparar(SONIDOS.avisoJefe); },
    rugidoJefe() { disparar(SONIDOS.rugidoJefe); },
    eleccion() { disparar(SONIDOS.eleccion); },
    dialogo() { disparar(SONIDOS.dialogo); },
    desbloquear() {
      if (!activo) return false;
      const c = contexto();
      if (!c) return false;
      if (c.state === 'running') aplicarAmbiente();
      return c.state === 'running';
    },
    setAmbiente(tipo, hora) {
      const clave = AMBIENTES[tipo] ? tipo : 'silencio';
      const nuevaHora = hora || ambHora;
      if (ambTipo === clave && ambHora === nuevaHora && ambNodos && musTimer) return;
      const cambio = ambTipo !== clave || ambHora !== nuevaHora;
      ambTipo = clave;
      ambHora = nuevaHora;
      if (cambio || !ambNodos || !musTimer) aplicarAmbiente();
    },
    setOculto(flag) {
      oculto = !!flag;
      if (!ac || !activo) return;
      if (oculto) {
        detenerMusica();
        if (ac.state === 'running' && typeof ac.suspend === 'function') ac.suspend().catch(() => {});
      } else {
        const p = typeof ac.resume === 'function' ? ac.resume() : null;
        if (p && typeof p.then === 'function') p.then(() => aplicarAmbiente()).catch(() => {});
        else aplicarAmbiente();
      }
    },
    estaActivo() { return activo; },
    estado() { return { activo, running: !!(ac && ac.state === 'running'), tipo: ambTipo, hora: ambHora }; },
    // tipo: 'metal' | 'sordo' | 'flecha'
    impacto(tipo) {
      const c = contexto();
      if (!c) return;
      const ahora = c.currentTime;
      if (ahora - ultimo < MIN_INTERVALO_S) return;
      ultimo = ahora;
      (SONIDOS[tipo] || SONIDOS.metal)(ahora + 0.005);
    },
    activar(v) {
      activo = !!v;
      if (activo) {
        api.desbloquear();
      } else {
        detenerMusica();
        if (ac && typeof ac.suspend === 'function') ac.suspend().catch(() => {});
      }
    }
  };
  root.Sonidos = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
