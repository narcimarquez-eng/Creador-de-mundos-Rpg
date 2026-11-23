// Efectos de sonido del combate (Web Audio). Archivos en sfx/ (ver docs/SONIDOS.md).
// Cada efecto tiene una o varias variantes: se elige una al azar y se varía un poco el tono para que no canse.
// El navegador no deja sonar nada hasta el primer clic o tecla: el contexto se crea y se reanuda entonces.
(function (root) {
  'use strict';

  const EFECTOS = {
    choque_metal: ['sfx/espadas/choque_metal_01.ogg'],
    choque_corte: [1, 2, 3, 4, 5, 6].map(n => `sfx/espadas/choque_corte_0${n}.ogg`),
    rayo_carga:   ['sfx/rayos/rayo_carga_01.ogg'],
    rayo_cadena:  ['sfx/rayos/rayo_cadena_01.ogg'],
    chispazo:     [1, 2, 3].map(n => `sfx/rayos/chispazo_0${n}.ogg`),
  };

  const CLAVE = 'rpg.sonido.activo';
  let activo = true;
  try { activo = localStorage.getItem(CLAVE) !== '0'; } catch (e) { /* sin almacenamiento: activo */ }

  let ctx = null, salida = null;
  const buffers = {};        // ruta -> AudioBuffer | Promise
  const ultimo = {};         // efecto -> instante del último disparo (evita que se amontonen)

  function contexto() {
    if (ctx) return ctx;
    const AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    salida = ctx.createGain();
    salida.gain.value = 0.8;
    salida.connect(ctx.destination);
    precargar();
    return ctx;
  }

  function cargar(ruta) {
    if (buffers[ruta]) return buffers[ruta];
    buffers[ruta] = fetch(ruta)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(a => ctx.decodeAudioData(a))
      .then(b => (buffers[ruta] = b))
      .catch(err => { console.warn('Sonido no disponible:', ruta, err.message); buffers[ruta] = null; return null; });
    return buffers[ruta];
  }
  function precargar() { Object.values(EFECTOS).flat().forEach(cargar); }

  // Desbloqueo con el primer gesto del jugador
  function desbloquear() {
    const c = contexto();
    if (c && c.state === 'suspended') c.resume();
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => root.addEventListener && root.addEventListener(ev, desbloquear, { passive: true }));

  // Reproduce un efecto. op: { volumen (0–1), tono (variación, 0.05 = ±5 %), retraso (s), minEntre (s) }
  // Devuelve { parar(fundido) } para cortar sonidos largos (la carga del rayo al soltar el golpe).
  function play(nombre, op = {}) {
    const nada = { parar() {} };
    if (!activo) return nada;
    const lista = EFECTOS[nombre];
    const c = contexto();
    if (!lista || !c || c.state !== 'running') return nada;
    const ahora = c.currentTime;
    const minEntre = op.minEntre != null ? op.minEntre : 0.045;
    if (ultimo[nombre] != null && ahora - ultimo[nombre] < minEntre) return nada;
    ultimo[nombre] = ahora;

    const buf = buffers[lista[Math.floor(Math.random() * lista.length)]];
    if (!buf || typeof buf.then === 'function') return nada;   // aún cargando: se omite este golpe
    const src = c.createBufferSource();
    src.buffer = buf;
    const tono = op.tono != null ? op.tono : 0.05;
    src.playbackRate.value = 1 + (Math.random() * 2 - 1) * tono;
    const g = c.createGain();
    g.gain.value = op.volumen != null ? op.volumen : 1;
    src.connect(g).connect(salida);
    const t0 = ahora + (op.retraso || 0);
    src.start(t0);
    return {
      parar(fundido = 0.08) {
        const t = Math.max(c.currentTime, t0);
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.linearRampToValueAtTime(0, t + fundido);
        try { src.stop(t + fundido + 0.02); } catch (e) { /* ya parado */ }
      },
    };
  }

  function alternar() {
    activo = !activo;
    try { localStorage.setItem(CLAVE, activo ? '1' : '0'); } catch (e) { /* nada */ }
    if (activo) desbloquear();
    return activo;
  }

  root.SonidosLib = { play, alternar, activo: () => activo, EFECTOS };
})(typeof window !== 'undefined' ? window : globalThis);
