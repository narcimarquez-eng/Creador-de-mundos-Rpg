// Sonidos del visor generados con Web Audio (sin archivos): disparo de flecha, impacto de flecha, golpe metálico
// con arma y golpe sordo sin arma. El contexto se crea al primer sonido; el navegador lo reanuda con la primera pulsación.
(function (root) {
  'use strict';
  let ac = null, salida = null, ruido = null, ultimo = 0, activo = true;
  const MIN_INTERVALO_S = 0.06;   // en ataques de área no suenan decenas de impactos a la vez

  function contexto() {
    if (!activo) return null;
    if (!ac) {
      const Ctor = root.AudioContext || root.webkitAudioContext;
      if (!Ctor) return null;
      ac = new Ctor();
      salida = ac.createGain();
      salida.gain.value = 0.35;
      salida.connect(ac.destination);
      ruido = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.4), ac.sampleRate);
      const d = ruido.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ac.state === 'suspended') ac.resume();
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
    }
  };

  const api = {
    disparo() {
      const c = contexto();
      if (c) SONIDOS.disparo(c.currentTime + 0.005);
    },
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
      if (ac) (activo ? ac.resume() : ac.suspend());
    }
  };
  root.Sonidos = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
