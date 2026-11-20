// Motor musical orquestal adaptativo y generador de paisajes sonoros en Web Audio.
// Compone y ejecuta en tiempo real bandas sonoras dinámicas por zona y combate (pueblo, campo,
// agua, batalla, jefe y mazmorra) más fanfarrias (stingers) y micro-eventos ambientales.
(function (root) {
  'use strict';

  const hz = midi => 440 * Math.pow(2, (midi - 69) / 12);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, Number.isFinite(v) ? v : a));

  // Progresiones y arreglos orquestales completos de 32 pasos (secciones A y B)
  // Cada paso equivale a una corchea (30 / bpm segundos). -1 = silencio.
  const TEMAS = {
    pueblo: {
      nombre: 'Hogar y Posada',
      bpmDia: 96,
      bpmNoche: 76,
      acordes: [
        [50, 57, 62, 66], [49, 57, 61, 64], [47, 54, 59, 62], [42, 49, 57, 61],
        [43, 50, 55, 59], [42, 50, 54, 57], [40, 47, 55, 62], [45, 52, 57, 61]
      ],
      bajo: [
        50, -1, -1, 57,  49, -1, -1, 52,  47, -1, -1, 54,  42, -1, 49, -1,
        43, -1, -1, 50,  42, -1, 50, -1,  40, -1, 47, -1,  45, -1, 52, -1
      ],
      arp: [
        62, 66, 69, 74,  61, 64, 69, 73,  59, 62, 66, 71,  61, 66, 69, 73,
        62, 67, 71, 74,  62, 66, 69, 74,  59, 64, 67, 71,  61, 64, 69, 73
      ],
      melodia: [
        74, -1, 78, 76,  74, -1, 73, -1,  71, 74, 78, -1,  76, -1, 73, -1,
        79, -1, 78, 74,  76, -1, 74, -1,  71, -1, 73, 74,  76, -1, -1, -1
      ],
      contra: [
        -1, -1, -1, 69,  -1, -1, 69, -1,  -1, -1, 74, -1,  -1, -1, 69, -1,
        -1, -1, 74, -1,  -1, -1, 69, -1,  -1, 67, -1, 71,  69, -1, -1, -1
      ],
      perc: [
        1, 0, 2, 0,  1, 0, 2, 2,  1, 0, 2, 0,  1, 0, 2, 0,
        1, 0, 2, 0,  1, 0, 2, 2,  1, 0, 2, 0,  1, 2, 1, 0
      ]
    },
    campo: {
      nombre: 'Llanuras del Reino',
      bpmDia: 104,
      bpmNoche: 84,
      acordes: [
        [43, 55, 59, 62], [42, 54, 57, 62], [40, 52, 55, 59], [47, 54, 59, 66],
        [48, 55, 60, 64], [47, 55, 59, 62], [45, 52, 57, 60], [50, 57, 62, 66]
      ],
      bajo: [
        43, -1, 50, -1,  42, -1, 50, -1,  40, -1, 47, -1,  47, -1, 54, -1,
        48, -1, 55, -1,  47, -1, 55, -1,  45, -1, 52, -1,  50, -1, 45, 50
      ],
      arp: [
        62, 67, 71, 74,  62, 66, 69, 74,  59, 64, 67, 71,  62, 66, 71, 74,
        64, 67, 72, 76,  62, 67, 71, 74,  60, 64, 69, 72,  62, 66, 69, 74
      ],
      melodia: [
        71, -1, 74, -1,  78, -1, 79, 78,  76, -1, 74, 71,  74, -1, -1, -1,
        79, -1, 81, 79,  78, -1, 74, -1,  72, 74, 76, 79,  78, -1, -1, -1
      ],
      contra: [
        67, -1, -1, -1,  69, -1, -1, -1,  67, -1, 71, -1,  66, -1, -1, -1,
        72, -1, -1, -1,  71, -1, 67, -1,  69, -1, 72, -1,  74, -1, 69, -1
      ],
      perc: [
        1, 0, 2, 0,  1, 0, 2, 0,  1, 0, 2, 0,  1, 0, 2, 2,
        1, 0, 2, 0,  1, 0, 2, 0,  1, 0, 2, 0,  1, 2, 1, 2
      ]
    },
    agua: {
      nombre: 'Riachuelos de Cristal',
      bpmDia: 88,
      bpmNoche: 78,
      acordes: [
        [45, 57, 61, 64], [44, 56, 59, 64], [42, 54, 57, 61], [49, 56, 61, 64],
        [50, 57, 62, 66], [49, 57, 61, 64], [47, 54, 59, 62], [40, 52, 59, 64]
      ],
      bajo: [
        45, -1, -1, 52,  44, -1, -1, 52,  42, -1, -1, 49,  49, -1, -1, -1,
        50, -1, -1, 57,  49, -1, -1, 57,  47, -1, 54, -1,  40, -1, 47, -1
      ],
      arp: [
        69, 73, 76, 81,  68, 71, 76, 80,  66, 69, 73, 78,  68, 73, 76, 80,
        69, 74, 78, 81,  69, 73, 76, 81,  66, 71, 74, 78,  68, 71, 76, 80
      ],
      melodia: [
        76, -1, 81, 80,  76, -1, 73, -1,  74, 76, 78, -1,  76, -1, -1, -1,
        83, -1, 81, 78,  80, -1, 76, -1,  74, -1, 73, 71,  76, -1, -1, -1
      ],
      contra: [
        -1, -1, 73, -1,  -1, -1, 71, -1,  -1, -1, 69, -1,  73, -1, -1, -1,
        -1, -1, 74, -1,  -1, -1, 73, -1,  -1, -1, 71, -1,  68, -1, -1, -1
      ],
      perc: [0]
    },
    batalla: {
      nombre: 'Acero y Coraje',
      bpmDia: 136,
      bpmNoche: 136,
      acordes: [
        [38, 50, 57, 62], [36, 48, 55, 60], [34, 46, 53, 58], [36, 48, 55, 60],
        [43, 55, 58, 62], [41, 53, 57, 62], [34, 46, 53, 58], [45, 52, 57, 61]
      ],
      bajo: [
        38, 38, 50, 38,  36, 36, 48, 36,  34, 34, 46, 34,  36, 36, 48, 52,
        43, 43, 55, 43,  41, 41, 53, 41,  34, 34, 46, 34,  45, 45, 52, 45
      ],
      ostinato: [
        50, 57, 62, 57,  48, 55, 60, 55,  46, 53, 58, 53,  48, 55, 60, 55,
        55, 58, 62, 58,  53, 57, 62, 57,  46, 53, 58, 53,  52, 57, 61, 57
      ],
      melodia: [
        69, -1, 70, 69,  67, -1, 65, -1,  62, -1, 65, 69,  67, -1, -1, -1,
        74, -1, 72, 70,  69, -1, 65, -1,  67, 69, 70, 74,  73, -1, -1, -1
      ],
      contra: [
        62, -1, 65, -1,  60, -1, 64, -1,  58, -1, 62, -1,  60, -1, 64, -1,
        67, -1, 70, -1,  65, -1, 69, -1,  62, -1, 65, -1,  64, -1, 69, -1
      ],
      // 1=timbal fuerte, 2=caja, 3=timbal suave, 4=timbal+platillo
      perc: [
        4, 3, 2, 3,  1, 3, 2, 2,  1, 3, 2, 3,  1, 2, 2, 3,
        4, 3, 2, 3,  1, 3, 2, 2,  1, 2, 2, 3,  1, 2, 1, 2
      ]
    },
    jefe: {
      nombre: 'Señor de las Cenizas',
      bpmDia: 148,
      bpmNoche: 148,
      bpmFase2: 158,
      acordes: [
        [40, 52, 55, 59], [36, 48, 55, 60], [38, 50, 54, 57], [35, 47, 54, 59],
        [40, 52, 55, 59], [45, 52, 57, 60], [36, 48, 55, 60], [35, 47, 54, 59]
      ],
      bajo: [
        40, 40, 40, 52,  36, 36, 36, 48,  38, 38, 38, 50,  35, 35, 47, 54,
        40, 40, 40, 52,  45, 45, 45, 57,  36, 36, 48, 36,  35, 35, 47, 59
      ],
      ostinato: [
        52, 59, 64, 59,  48, 55, 60, 55,  50, 57, 62, 57,  47, 54, 59, 54,
        52, 59, 64, 59,  57, 60, 64, 60,  48, 55, 60, 55,  47, 54, 59, 63
      ],
      melodia: [
        64, -1, 67, -1,  72, 71, 67, -1,  66, -1, 69, -1,  71, -1, 66, -1,
        76, -1, 75, 76,  72, -1, 69, -1,  71, 72, 74, 72,  71, -1, -1, -1
      ],
      contra: [
        59, -1, -1, 64,  60, -1, -1, 67,  62, -1, -1, 66,  59, -1, 63, -1,
        64, -1, -1, 71,  69, -1, -1, 64,  67, -1, 64, -1,  63, -1, 66, -1
      ],
      perc: [
        4, 2, 1, 2,  1, 3, 2, 2,  1, 2, 1, 2,  1, 2, 2, 2,
        4, 2, 1, 2,  1, 3, 2, 2,  1, 2, 1, 2,  4, 2, 2, 2
      ]
    },
    mazmorra: {
      nombre: 'Ecos del Abismo',
      bpmDia: 76,
      bpmNoche: 76,
      acordes: [
        [38, 50, 53, 57], [39, 51, 55, 58], [38, 50, 53, 57], [36, 48, 55, 60],
        [34, 46, 53, 58], [43, 50, 55, 58], [39, 51, 55, 58], [33, 45, 52, 57]
      ],
      bajo: [
        38, -1, -1, -1,  39, -1, -1, -1,  38, -1, -1, -1,  36, -1, -1, -1,
        34, -1, -1, -1,  43, -1, -1, -1,  39, -1, -1, -1,  33, -1, -1, -1
      ],
      arp: [
        62, -1, 69, -1,  63, -1, 70, -1,  62, -1, 65, -1,  60, -1, 67, -1,
        58, -1, 65, -1,  67, -1, 70, -1,  63, -1, 70, -1,  61, -1, 69, -1
      ],
      melodia: [
        65, -1, -1, 64,  63, -1, -1, -1,  62, -1, 65, -1,  67, -1, -1, -1,
        70, -1, -1, 69,  67, -1, 65, -1,  63, -1, -1, 62,  61, -1, -1, -1
      ],
      contra: [
        -1, -1, 74, -1,  -1, -1, 75, -1,  -1, -1, 74, -1,  -1, -1, 72, -1,
        -1, -1, -1, -1,  -1, -1, 74, -1,  -1, -1, -1, -1,  -1, -1, 73, -1
      ],
      perc: [
        1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 3, 0,
        1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0,  3, 0, 0, 0
      ]
    }
  };

  const AMBIENTES = {
    campo:    { tipo: 'lowpass',  freq: 560, q: 0.7, lfoAmp: 190, gain: 0.14 },
    agua:     { tipo: 'bandpass', freq: 880, q: 1.0, lfoAmp: 280, gain: 0.21 },
    pueblo:   { tipo: 'lowpass',  freq: 390, q: 0.7, lfoAmp: 80,  gain: 0.085 },
    mazmorra: { tipo: 'lowpass',  freq: 185, q: 1.7, lfoAmp: 55,  gain: 0.17 },
    batalla:  { tipo: 'lowpass',  freq: 320, q: 0.8, lfoAmp: 90,  gain: 0.055 },
    jefe:     { tipo: 'lowpass',  freq: 240, q: 1.2, lfoAmp: 85,  gain: 0.070 },
    silencio: { tipo: 'lowpass',  freq: 220, q: 0.7, lfoAmp: 0,   gain: 0.0001 }
  };

  function crearMotor(deps) {
    const ac = deps && deps.ac;
    const musicaBus = deps && deps.musicaBus;
    const ambienteBus = deps && deps.ambienteBus;
    const reverbSend = deps && deps.reverbSend;
    const ruidoBlanco = deps && deps.ruidoBlanco;
    const ruidoRosa = (deps && deps.ruidoRosa) || ruidoBlanco;
    const ruidoMarron = (deps && deps.ruidoMarron) || ruidoRosa || ruidoBlanco;

    if (!ac || !musicaBus || !ambienteBus) return null;

    // Sub-buses: pistaGain (crossfade entre canciones) -> duckGain (atenuación en fanfarrias) -> musicaBus
    const pistaGain = ac.createGain();
    pistaGain.gain.value = 1.0;
    const duckGain = ac.createGain();
    duckGain.gain.value = 1.0;
    pistaGain.connect(duckGain);
    duckGain.connect(musicaBus);

    const envGain = ac.createGain();
    envGain.gain.value = 1.0;
    envGain.connect(ambienteBus);

    // Síntesis aditiva con PeriodicWave para timbres orgánicos (con fallback limpio)
    const waves = {};
    if (typeof ac.createPeriodicWave === 'function') {
      const hazWave = harmonics => {
        try {
          const real = new Float32Array(harmonics.length);
          const imag = new Float32Array(harmonics.length);
          for (let i = 1; i < harmonics.length; i++) imag[i] = harmonics[i];
          return ac.createPeriodicWave(real, imag);
        } catch (_) {
          return null;
        }
      };
      waves.flauta = hazWave([0, 1.0, 0.28, 0.08, 0.025]);
      waves.laud = hazWave([0, 1.0, 0.65, 0.42, 0.25, 0.14, 0.08, 0.035]);
      waves.cuerdas = hazWave([0, 1.0, 0.56, 0.44, 0.30, 0.21, 0.14, 0.09, 0.05]);
      waves.trompa = hazWave([0, 1.0, 0.82, 0.58, 0.38, 0.24, 0.14, 0.07]);
      waves.coro = hazWave([0, 1.0, 0.42, 0.64, 0.20, 0.28, 0.11]);
      waves.celesta = hazWave([0, 1.0, 0.10, 0.38, 0.04, 0.12]);
    }

    function ponerOnda(osc, wave, fallbackType) {
      if (wave && typeof osc.setPeriodicWave === 'function') {
        try { osc.setPeriodicWave(wave); return; } catch (_) {}
      }
      osc.type = fallbackType || 'triangle';
    }

    function conectar(nodo, bus, pan = 0, wet = 0) {
      let salidaNodo = nodo;
      const p = clamp(pan, -0.9, 0.9);
      if (p !== 0 && typeof ac.createStereoPanner === 'function') {
        const panner = ac.createStereoPanner();
        panner.pan.value = p;
        nodo.connect(panner);
        salidaNodo = panner;
      }
      salidaNodo.connect(bus);
      if (wet > 0.005 && reverbSend) {
        const wg = ac.createGain();
        wg.gain.value = clamp(wet, 0, 1);
        salidaNodo.connect(wg);
        wg.connect(reverbSend);
      }
    }

    // ------------------- Instrumentos orquestales -------------------
    function laud(t, freq, dur, vol, pan = -0.15) {
      const f = Math.max(40, freq), d = Math.max(0.08, dur), v = Math.max(0.001, vol);
      const o = ac.createOscillator();
      ponerOnda(o, waves.laud, 'triangle');
      o.frequency.setValueAtTime(f, t);

      const lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.Q.value = 1.1;
      lp.frequency.setValueAtTime(Math.min(5400, f * 6.5), t);
      lp.frequency.exponentialRampToValueAtTime(Math.max(360, f * 1.8), t + Math.min(d, 0.42));

      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(v, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);

      o.connect(lp); lp.connect(g);
      conectar(g, pistaGain, pan, 0.28);
      o.start(t);
      o.stop(t + d + 0.04);
    }

    function flauta(t, freq, dur, vol, pan = 0.14) {
      const f = Math.max(60, freq), d = Math.max(0.12, dur), v = Math.max(0.001, vol);
      const o = ac.createOscillator();
      ponerOnda(o, waves.flauta, 'sine');
      o.frequency.setValueAtTime(f, t);

      // Vibrato orgánico suavizado
      const lfo = ac.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 5.2;
      const lfoG = ac.createGain();
      lfoG.gain.setValueAtTime(0.0001, t);
      lfoG.gain.linearRampToValueAtTime(f * 0.0085, t + Math.min(0.28, d * 0.45));
      lfo.connect(lfoG);
      lfoG.connect(o.frequency);

      const lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(Math.min(4800, f * 3.8), t);

      const g = ac.createGain();
      const atk = Math.min(0.085, d * 0.22);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(v, t + atk);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);

      o.connect(lp); lp.connect(g);
      conectar(g, pistaGain, pan, 0.36);
      o.start(t); lfo.start(t);
      o.stop(t + d + 0.05); lfo.stop(t + d + 0.05);

      // Soplo de aire inicial ("chiff")
      if (ruidoRosa) {
        const aire = ac.createBufferSource();
        aire.buffer = ruidoRosa;
        const bp = ac.createBiquadFilter();
        bp.type = 'bandpass';
        bp.Q.value = 2.8;
        bp.frequency.setValueAtTime(Math.min(4200, f * 2.1), t);
        const ag = ac.createGain();
        ag.gain.setValueAtTime(0.0001, t);
        ag.gain.linearRampToValueAtTime(v * 0.28, t + 0.015);
        ag.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);
        aire.connect(bp); bp.connect(ag);
        conectar(ag, pistaGain, pan, 0.25);
        aire.start(t, Math.random() * 0.5);
        aire.stop(t + 0.07);
      }
    }

    function cuerdas(t, freqs, dur, vol, pan = 0) {
      const lista = Array.isArray(freqs) ? freqs : [freqs];
      const d = Math.max(0.25, dur);
      const porVoz = Math.max(0.001, vol / Math.max(1, lista.length * 1.4));
      const lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.Q.value = 0.8;
      lp.frequency.setValueAtTime(900, t);
      lp.frequency.linearRampToValueAtTime(1950, t + Math.min(0.45, d * 0.4));
      lp.frequency.linearRampToValueAtTime(1250, t + d);

      const g = ac.createGain();
      const atk = Math.min(0.26, d * 0.32);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(porVoz, t + atk);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);

      lp.connect(g);
      conectar(g, pistaGain, pan, 0.34);

      lista.forEach((fRaw, idx) => {
        const f = Math.max(35, fRaw);
        [-5, 5].forEach(cents => {
          const o = ac.createOscillator();
          ponerOnda(o, waves.cuerdas, 'sawtooth');
          o.frequency.setValueAtTime(f * (cents < 0 ? 0.9971 : 1.0029), t);
          o.connect(lp);
          o.start(t);
          o.stop(t + d + 0.05);
        });
      });
    }

    function cuerdasStaccato(t, freq, dur, vol, pan = -0.1) {
      const f = Math.max(40, freq), d = Math.max(0.08, Math.min(0.24, dur)), v = Math.max(0.001, vol);
      const o = ac.createOscillator();
      ponerOnda(o, waves.cuerdas, 'sawtooth');
      o.frequency.setValueAtTime(f, t);

      const lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.Q.value = 1.4;
      lp.frequency.setValueAtTime(380, t);
      lp.frequency.linearRampToValueAtTime(Math.min(2800, f * 5.2), t + 0.025);
      lp.frequency.exponentialRampToValueAtTime(620, t + d);

      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(v, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);

      o.connect(lp); lp.connect(g);
      conectar(g, pistaGain, pan, 0.22);
      o.start(t);
      o.stop(t + d + 0.03);
    }

    function trompa(t, freq, dur, vol, pan = 0.08) {
      const f = Math.max(40, freq), d = Math.max(0.14, dur), v = Math.max(0.001, vol);
      const o1 = ac.createOscillator();
      ponerOnda(o1, waves.trompa, 'sawtooth');
      o1.frequency.setValueAtTime(f, t);
      const o2 = ac.createOscillator();
      ponerOnda(o2, waves.trompa, 'triangle');
      o2.frequency.setValueAtTime(f * 1.003, t);

      const lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.Q.value = 1.2;
      lp.frequency.setValueAtTime(320, t);
      lp.frequency.linearRampToValueAtTime(Math.min(2500, Math.max(950, f * 4.2)), t + Math.min(0.12, d * 0.28));
      lp.frequency.exponentialRampToValueAtTime(Math.max(580, f * 2.1), t + d);

      const g = ac.createGain();
      const atk = Math.min(0.09, d * 0.22);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(v, t + atk);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);

      o1.connect(lp); o2.connect(lp); lp.connect(g);
      conectar(g, pistaGain, pan, 0.38);
      o1.start(t); o2.start(t);
      o1.stop(t + d + 0.05); o2.stop(t + d + 0.05);
    }

    function coro(t, freqs, dur, vol) {
      const lista = Array.isArray(freqs) ? freqs : [freqs];
      const d = Math.max(0.4, dur);
      const porVoz = Math.max(0.001, vol / Math.max(1, lista.length * 1.2));

      const f1 = ac.createBiquadFilter();
      f1.type = 'bandpass'; f1.frequency.value = 580; f1.Q.value = 2.4;
      const f2 = ac.createBiquadFilter();
      f2.type = 'bandpass'; f2.frequency.value = 1120; f2.Q.value = 2.6;

      const g = ac.createGain();
      const atk = Math.min(0.42, d * 0.35);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(porVoz, t + atk);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);

      f1.connect(g); f2.connect(g);
      conectar(g, pistaGain, 0, 0.48);

      lista.forEach(fRaw => {
        const f = Math.max(40, fRaw);
        const o = ac.createOscillator();
        ponerOnda(o, waves.coro, 'triangle');
        o.frequency.setValueAtTime(f, t);
        o.connect(f1); o.connect(f2);
        o.start(t);
        o.stop(t + d + 0.06);
      });
    }

    function celesta(t, freq, dur, vol, pan = 0.22) {
      const f = Math.max(120, freq), d = Math.max(0.15, dur), v = Math.max(0.001, vol);
      const o = ac.createOscillator();
      ponerOnda(o, waves.celesta, 'sine');
      o.frequency.setValueAtTime(f, t);

      const o2 = ac.createOscillator();
      o2.type = 'sine';
      o2.frequency.setValueAtTime(f * 2.002, t);

      const g1 = ac.createGain();
      g1.gain.setValueAtTime(0.0001, t);
      g1.gain.linearRampToValueAtTime(v, t + 0.005);
      g1.gain.exponentialRampToValueAtTime(0.0001, t + d);

      const g2 = ac.createGain();
      g2.gain.setValueAtTime(0.0001, t);
      g2.gain.linearRampToValueAtTime(v * 0.28, t + 0.004);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + d * 0.55);

      o.connect(g1); o2.connect(g2);
      conectar(g1, pistaGain, pan, 0.45);
      conectar(g2, pistaGain, pan, 0.45);
      o.start(t); o2.start(t);
      o.stop(t + d + 0.04); o2.stop(t + d * 0.6 + 0.03);
    }

    function timbal(t, freq, vol) {
      const f = Math.max(40, freq), v = Math.max(0.001, vol);
      const o = ac.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(f * 1.65, t);
      o.frequency.exponentialRampToValueAtTime(Math.max(32, f * 0.88), t + 0.34);

      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(v, t + 0.007);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
      o.connect(g);
      conectar(g, pistaGain, -0.08, 0.26);
      o.start(t); o.stop(t + 0.45);

      if (ruidoMarron) {
        const maza = ac.createBufferSource();
        maza.buffer = ruidoMarron;
        const lp = ac.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 480;
        const mg = ac.createGain();
        mg.gain.setValueAtTime(v * 0.55, t);
        mg.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);
        maza.connect(lp); lp.connect(mg);
        conectar(mg, pistaGain, -0.08, 0.16);
        maza.start(t, Math.random() * 0.5);
        maza.stop(t + 0.07);
      }
    }

    function caja(t, vol) {
      const v = Math.max(0.001, vol);
      const o = ac.createOscillator();
      o.type = 'triangle';
      o.frequency.setValueAtTime(200, t);
      o.frequency.exponentialRampToValueAtTime(125, t + 0.08);
      const og = ac.createGain();
      og.gain.setValueAtTime(v * 0.52, t);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      o.connect(og);
      conectar(og, pistaGain, 0.1, 0.20);
      o.start(t); o.stop(t + 0.11);

      if (ruidoBlanco) {
        const s = ac.createBufferSource();
        s.buffer = ruidoBlanco;
        const hp = ac.createBiquadFilter();
        hp.type = 'highpass'; hp.frequency.value = 1850;
        const sg = ac.createGain();
        sg.gain.setValueAtTime(v * 0.55, t);
        sg.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
        s.connect(hp); hp.connect(sg);
        conectar(sg, pistaGain, 0.1, 0.24);
        s.start(t, Math.random() * 0.4);
        s.stop(t + 0.15);
      }
    }

    function pandero(t, vol, acento) {
      const v = Math.max(0.001, vol);
      const o = ac.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(135, t);
      o.frequency.exponentialRampToValueAtTime(86, t + 0.10);
      const og = ac.createGain();
      og.gain.setValueAtTime(v * (acento ? 0.8 : 0.45), t);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
      o.connect(og);
      conectar(og, pistaGain, 0.20, 0.14);
      o.start(t); o.stop(t + 0.13);

      if (ruidoBlanco) {
        const s = ac.createBufferSource();
        s.buffer = ruidoBlanco;
        const hp = ac.createBiquadFilter();
        hp.type = 'highpass'; hp.frequency.value = 4600;
        const sg = ac.createGain();
        sg.gain.setValueAtTime(v * (acento ? 0.34 : 0.18), t);
        sg.gain.exponentialRampToValueAtTime(0.0001, t + (acento ? 0.085 : 0.045));
        s.connect(hp); hp.connect(sg);
        conectar(sg, pistaGain, 0.24, 0.18);
        s.start(t, Math.random() * 0.4);
        s.stop(t + 0.11);
      }
    }

    function platillo(t, dur, vol) {
      if (!ruidoBlanco) return;
      const d = Math.max(0.25, dur), v = Math.max(0.001, vol);
      const s = ac.createBufferSource();
      s.buffer = ruidoBlanco;
      const bp1 = ac.createBiquadFilter();
      bp1.type = 'bandpass'; bp1.frequency.value = 2900; bp1.Q.value = 0.8;
      const bp2 = ac.createBiquadFilter();
      bp2.type = 'bandpass'; bp2.frequency.value = 6400; bp2.Q.value = 1.0;

      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(v, t + 0.014);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);

      s.connect(bp1); s.connect(bp2);
      bp1.connect(g); bp2.connect(g);
      conectar(g, pistaGain, -0.22, 0.42);
      s.start(t, Math.random() * 0.3);
      s.stop(t + d + 0.04);
    }

    // ------------------- Paisajes sonoros ambientales -------------------
    let ambTipo = 'silencio';
    let ambHora = 'day';
    let ambNodos = null;

    function asegurarAmbienteContinuo() {
      if (ambNodos) return ambNodos;
      const buf = ruidoRosa || ruidoBlanco;
      if (!buf) return null;
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
      lfo.frequency.value = 0.17;
      const lfoG = ac.createGain();
      lfoG.gain.value = 0;

      lfo.connect(lfoG);
      lfoG.connect(filtro.frequency);
      src.connect(filtro);
      filtro.connect(g);
      g.connect(envGain);

      src.start();
      lfo.start();
      ambNodos = { src, filtro, g, lfo, lfoG };
      return ambNodos;
    }

    function aplicarAmbienteContinuo() {
      if (ac.state !== 'running') return;
      if (ambTipo === 'silencio' && !ambNodos) return;
      const n = asegurarAmbienteContinuo();
      if (!n) return;
      const cfg = AMBIENTES[ambTipo] || AMBIENTES.silencio;
      const t = ac.currentTime;
      n.filtro.type = cfg.tipo;
      n.filtro.Q.setValueAtTime(cfg.q, t);
      n.filtro.frequency.cancelScheduledValues(t);
      n.filtro.frequency.setValueAtTime(Math.max(40, n.filtro.frequency.value), t);
      n.filtro.frequency.linearRampToValueAtTime(cfg.freq, t + 0.8);

      n.lfoG.gain.cancelScheduledValues(t);
      n.lfoG.gain.setValueAtTime(n.lfoG.gain.value, t);
      n.lfoG.gain.linearRampToValueAtTime(cfg.lfoAmp, t + 0.8);

      n.g.gain.cancelScheduledValues(t);
      n.g.gain.setValueAtTime(Math.max(0.0001, n.g.gain.value), t);
      n.g.gain.linearRampToValueAtTime(cfg.gain, t + 0.8);
    }

    // Micro-eventos ambientales naturales (pájaros, grillos, gotas cavernosas, destellos de río)
    function microEventoAmbiental(t) {
      if (ambTipo === 'silencio' || ambTipo === 'batalla' || ambTipo === 'jefe') return;
      const esNoche = ambHora === 'night';
      const rnd = Math.random();

      if ((ambTipo === 'campo' || ambTipo === 'pueblo') && !esNoche && rnd < 0.085) {
        // Trino suave de ave diurna
        const pan = (Math.random() - 0.5) * 1.4;
        const base = 2400 + Math.random() * 1400;
        const notas = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < notas; i++) {
          const dt = t + i * 0.085;
          const o = ac.createOscillator();
          o.type = 'sine';
          o.frequency.setValueAtTime(base + i * 180, dt);
          o.frequency.exponentialRampToValueAtTime(base * 1.18 + i * 150, dt + 0.06);
          const g = ac.createGain();
          g.gain.setValueAtTime(0.0001, dt);
          g.gain.linearRampToValueAtTime(0.022, dt + 0.012);
          g.gain.exponentialRampToValueAtTime(0.0001, dt + 0.068);
          o.connect(g);
          conectar(g, envGain, pan, 0.25);
          o.start(dt); o.stop(dt + 0.085);
        }
      } else if ((ambTipo === 'campo' || ambTipo === 'pueblo') && esNoche && rnd < 0.11) {
        // Grillo nocturno suave
        const pan = (Math.random() - 0.5) * 1.5;
        const f = 3850 + Math.random() * 450;
        for (let i = 0; i < 3; i++) {
          const dt = t + i * 0.055;
          const o = ac.createOscillator();
          o.type = 'sine';
          o.frequency.setValueAtTime(f, dt);
          const g = ac.createGain();
          g.gain.setValueAtTime(0.0001, dt);
          g.gain.linearRampToValueAtTime(0.014, dt + 0.008);
          g.gain.exponentialRampToValueAtTime(0.0001, dt + 0.036);
          o.connect(g);
          conectar(g, envGain, pan, 0.2);
          o.start(dt); o.stop(dt + 0.045);
        }
      } else if (ambTipo === 'mazmorra' && rnd < 0.10) {
        // Gota de agua con resonancia cavernosa
        const pan = (Math.random() - 0.5) * 1.3;
        const f = 580 + Math.random() * 420;
        const o = ac.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(f, t);
        o.frequency.exponentialRampToValueAtTime(f * 1.68, t + 0.075);
        const g = ac.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.042, t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.095);
        o.connect(g);
        conectar(g, envGain, pan, 0.65);
        o.start(t); o.stop(t + 0.11);
      } else if (ambTipo === 'agua' && rnd < 0.13) {
        // Destello breve de burbuja / corriente
        const pan = (Math.random() - 0.5) * 1.4;
        const f = 920 + Math.random() * 540;
        const o = ac.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(f, t);
        o.frequency.exponentialRampToValueAtTime(f * 1.38, t + 0.06);
        const g = ac.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.024, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.075);
        o.connect(g);
        conectar(g, envGain, pan, 0.35);
        o.start(t); o.stop(t + 0.09);
      }
    }

    // ------------------- Secuenciador lookahead adaptativo -------------------
    let temaActual = 'silencio';
    let horaActual = 'day';
    let fase2Actual = false;
    let musTimer = null;
    let pasoIdx = 0;
    let proximoPasoT = 0;
    let oculto = false;

    function programarPaso(t, idx) {
      const tema = TEMAS[temaActual];
      if (!tema) return;
      const esNoche = horaActual === 'night' || horaActual === 'golden';
      const bpm = (temaActual === 'jefe' && fase2Actual && tema.bpmFase2)
        ? tema.bpmFase2
        : (esNoche ? tema.bpmNoche : tema.bpmDia);
      const stepDur = 30 / (bpm || 100);
      const i = idx % 32;
      const barIdx = Math.floor(i / 4) % tema.acordes.length;

      // 1. Acordes (pad cada 4 pasos)
      if (i % 4 === 0) {
        const acordeHz = tema.acordes[barIdx].map(hz);
        if (temaActual === 'mazmorra') {
          coro(t, acordeHz, stepDur * 4.2, 0.105);
        } else if (temaActual === 'jefe') {
          coro(t, acordeHz, stepDur * 4.0, fase2Actual ? 0.115 : 0.09);
        } else if (temaActual === 'batalla') {
          cuerdas(t, acordeHz.slice(0, 3), stepDur * 3.8, 0.075, -0.05);
        } else {
          cuerdas(t, acordeHz, stepDur * 4.1, esNoche ? 0.085 : 0.095, 0);
        }
      }

      // 2. Bajo orquestal
      if (tema.bajo) {
        const mBajo = tema.bajo[i];
        if (mBajo > 0) {
          if (temaActual === 'batalla' || temaActual === 'jefe') {
            cuerdasStaccato(t, hz(mBajo), stepDur * 0.85, 0.115, -0.08);
          } else {
            laud(t, hz(mBajo), stepDur * 2.2, 0.075, -0.10);
          }
        }
      }

      // 3. Arpegio / ostinato rítmico
      if (tema.ostinato) {
        const mOst = tema.ostinato[i];
        if (mOst > 0) {
          cuerdasStaccato(t, hz(mOst), stepDur * 0.78, fase2Actual ? 0.092 : 0.078, i % 2 === 0 ? -0.18 : 0.18);
        }
      } else if (tema.arp) {
        const mArp = tema.arp[i];
        if (mArp > 0) {
          const pan = (i % 2 === 0 ? -0.22 : 0.22);
          if (temaActual === 'agua' || temaActual === 'mazmorra' || (temaActual === 'pueblo' && esNoche)) {
            celesta(t, hz(mArp), stepDur * 1.65, temaActual === 'mazmorra' ? 0.048 : 0.062, pan);
          } else {
            laud(t, hz(mArp), stepDur * 1.45, esNoche ? 0.052 : 0.064, pan);
          }
        }
      }

      // 4. Melodía principal (canta más suave o alterna de timbre de noche)
      if (tema.melodia) {
        const mMel = tema.melodia[i];
        if (mMel > 0) {
          let durM = stepDur * 1.1;
          for (let k = 1; k <= 3 && tema.melodia[(i + k) % 32] === -1; k++) durM += stepDur * 0.9;
          if (temaActual === 'batalla') {
            trompa(t, hz(mMel), durM, 0.105, 0.10);
          } else if (temaActual === 'jefe') {
            trompa(t, hz(mMel), durM, fase2Actual ? 0.125 : 0.105, 0.08);
            if (fase2Actual && i % 2 === 0) celesta(t, hz(mMel + 12), stepDur * 1.4, 0.045, -0.15);
          } else if (temaActual === 'campo' && !esNoche && i < 16) {
            trompa(t, hz(mMel), durM, 0.085, 0.12);
          } else if (temaActual === 'agua' || (temaActual === 'pueblo' && esNoche)) {
            celesta(t, hz(mMel), durM * 1.15, 0.072, 0.15);
          } else {
            flauta(t, hz(mMel), durM, esNoche ? 0.062 : 0.082, 0.14);
          }
        }
      }

      // 5. Contramelodía
      if (tema.contra) {
        const mCon = tema.contra[i];
        if (mCon > 0) {
          if (temaActual === 'mazmorra' || temaActual === 'agua') {
            flauta(t, hz(mCon), stepDur * 1.8, 0.046, -0.22);
          } else if (temaActual === 'batalla' || temaActual === 'jefe') {
            cuerdasStaccato(t, hz(mCon + 12), stepDur * 0.9, 0.052, 0.24);
          } else {
            celesta(t, hz(mCon), stepDur * 1.5, 0.042, -0.24);
          }
        }
      }

      // 6. Percusión orquestal o folclórica
      if (tema.perc && !(temaActual === 'pueblo' && esNoche) && !(temaActual === 'campo' && horaActual === 'night')) {
        const pCode = tema.perc[i % tema.perc.length] || 0;
        if (pCode === 1) timbal(t, temaActual === 'mazmorra' ? 58 : 74, temaActual === 'jefe' ? 0.14 : 0.105);
        else if (pCode === 2) {
          if (temaActual === 'pueblo' || temaActual === 'campo') pandero(t, 0.065, i % 4 === 2);
          else caja(t, temaActual === 'jefe' ? 0.11 : 0.085);
        } else if (pCode === 3) {
          timbal(t, 82, fase2Actual ? 0.075 : 0.055);
        } else if (pCode === 4) {
          timbal(t, 68, 0.15);
          platillo(t, 1.4, temaActual === 'jefe' ? 0.068 : 0.05);
        }
      }
    }

    function tick() {
      if (oculto || ac.state !== 'running') return;
      const ahora = ac.currentTime;
      microEventoAmbiental(ahora + 0.02);
      if (temaActual === 'silencio' || !TEMAS[temaActual]) return;

      const tema = TEMAS[temaActual];
      const esNoche = horaActual === 'night' || horaActual === 'golden';
      const bpm = (temaActual === 'jefe' && fase2Actual && tema.bpmFase2)
        ? tema.bpmFase2
        : (esNoche ? tema.bpmNoche : tema.bpmDia);
      const stepDur = 30 / (bpm || 100);

      if (proximoPasoT < ahora - 0.12) proximoPasoT = ahora + 0.03;
      let seguridad = 0;
      while (proximoPasoT < ahora + 0.16 && seguridad < 6) {
        programarPaso(proximoPasoT, pasoIdx);
        pasoIdx = (pasoIdx + 1) % 32;
        proximoPasoT += stepDur;
        seguridad++;
      }
    }

    function asegurarTimer() {
      if (musTimer) return;
      musTimer = setInterval(tick, 70);
    }

    function detener() {
      if (musTimer) {
        clearInterval(musTimer);
        musTimer = null;
      }
    }

    function setTema(tema, hora, opts) {
      const nueva = TEMAS[tema] ? tema : 'silencio';
      const nuevaHora = hora || horaActual || 'day';
      const nuevaFase2 = !!(opts && opts.fase2);
      const inmediato = !!(opts && opts.inmediato);

      const cambioAmb = ambTipo !== nueva || ambHora !== nuevaHora;
      const cambioTema = temaActual !== nueva || horaActual !== nuevaHora || fase2Actual !== nuevaFase2;

      ambTipo = nueva;
      ambHora = nuevaHora;
      if (cambioAmb) aplicarAmbienteContinuo();

      if (cambioTema) {
        const esUrgente = nueva === 'batalla' || nueva === 'jefe';
        const fade = inmediato ? 0.04 : (esUrgente ? 0.25 : 0.55);
        const t = ac.currentTime;
        pistaGain.gain.cancelScheduledValues(t);
        pistaGain.gain.setValueAtTime(Math.max(0.001, pistaGain.gain.value), t);
        if (nueva === 'silencio') {
          pistaGain.gain.linearRampToValueAtTime(0.0001, t + fade);
        } else {
          pistaGain.gain.linearRampToValueAtTime(0.14, t + fade * 0.45);
          pistaGain.gain.linearRampToValueAtTime(1.0, t + fade);
        }
        temaActual = nueva;
        horaActual = nuevaHora;
        fase2Actual = nuevaFase2;
        pasoIdx = 0;
        proximoPasoT = t + fade * 0.45;
      }

      if (!oculto && ac.state === 'running') {
        aplicarAmbienteContinuo();
        if (temaActual !== 'silencio') {
          asegurarTimer();
          tick();
        }
      }
    }

    function duck(factor = 0.35, durSeg = 2.0) {
      const t = ac.currentTime;
      const f = clamp(factor, 0.1, 1.0);
      const d = Math.max(0.25, durSeg);
      duckGain.gain.cancelScheduledValues(t);
      duckGain.gain.setValueAtTime(Math.max(0.001, duckGain.gain.value), t);
      duckGain.gain.linearRampToValueAtTime(f, t + 0.08);
      duckGain.gain.setValueAtTime(f, t + Math.max(0.15, d * 0.55));
      duckGain.gain.linearRampToValueAtTime(1.0, t + d);
    }

    function stinger(tipo) {
      if (ac.state !== 'running') return;
      const t = ac.currentTime + 0.02;
      if (tipo === 'subirNivel') {
        duck(0.38, 1.8);
        [60, 64, 67, 72].forEach((m, i) => celesta(t + i * 0.085, hz(m), 0.7, 0.15, -0.15 + i * 0.1));
        trompa(t + 0.24, hz(72), 0.85, 0.14, 0.05);
        platillo(t + 0.24, 1.1, 0.045);
      } else if (tipo === 'mision') {
        duck(0.45, 1.5);
        [62, 66, 69, 74].forEach((m, i) => laud(t + i * 0.09, hz(m), 0.65, 0.13, -0.12 + i * 0.08));
        flauta(t + 0.18, hz(74), 0.72, 0.11, 0.12);
      } else if (tipo === 'victoriaJefe') {
        duck(0.22, 3.0);
        const fan = [[64, 0], [67, 0.13], [71, 0.26], [76, 0.40], [74, 0.75], [76, 0.92]];
        fan.forEach(([m, dt]) => {
          trompa(t + dt, hz(m), dt >= 0.9 ? 1.45 : 0.26, 0.16, 0.06);
          laud(t + dt, hz(m + 12), 0.6, 0.09, -0.15);
        });
        cuerdas(t + 0.40, [52, 59, 64, 68].map(hz), 2.1, 0.14, 0);
        timbal(t + 0.40, 82, 0.22);
        timbal(t + 0.92, 68, 0.24);
        platillo(t + 0.92, 1.9, 0.09);
      } else if (tipo === 'derrotaHeroe') {
        duck(0.18, 3.2);
        const lam = [[64, 0], [62, 0.36], [60, 0.72], [57, 1.10]];
        lam.forEach(([m, dt]) => {
          cuerdas(t + dt, [hz(m), hz(m - 12)], dt > 1.0 ? 1.8 : 0.42, 0.12, 0);
        });
        coro(t + 0.72, [45, 52, 57, 60].map(hz), 2.1, 0.13);
        timbal(t + 1.10, 55, 0.16);
      } else if (tipo === 'zonaNueva') {
        duck(0.68, 1.3);
        flauta(t, hz(69), 0.55, 0.075, 0.15);
        celesta(t + 0.11, hz(76), 0.7, 0.075, -0.15);
        laud(t + 0.22, hz(81), 0.85, 0.065, 0.18);
      } else if (tipo === 'pueblo') {
        duck(0.72, 1.2);
        laud(t, hz(62), 0.55, 0.075, -0.15);
        laud(t + 0.10, hz(69), 0.65, 0.075, 0.15);
        flauta(t + 0.18, hz(74), 0.7, 0.075, 0.05);
      }
    }

    function setOculto(flag) {
      oculto = !!flag;
      if (oculto) {
        detener();
      } else if (ac.state === 'running') {
        aplicarAmbienteContinuo();
        if (temaActual !== 'silencio') {
          asegurarTimer();
          tick();
        }
      }
    }

    return {
      setTema,
      duck,
      stinger,
      detener,
      setOculto,
      tick,
      estado: () => ({ tema: temaActual, hora: horaActual, fase2: fase2Actual, oculto })
    };
  }

  const api = { TEMAS, crearMotor };
  root.MusicaRPG = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
