/*
 * cinematicas.js — Reproductor híbrido de cinemáticas de historia para Valdris RPG.
 *
 * Soporta vídeo real (.webm / .mp4 si videoDisponible = true) con respaldo automático
 * a láminas ilustradas 16:9 animadas (Ken Burns multipaso + partículas ambientales),
 * subtítulos sincronizados, locución vía Voces y atenuación de música vía Sonidos.
 * Expone window.CinematicasLib (o module.exports en Node para las pruebas).
 */
(function (root) {
  'use strict';

  const clamp = (v, a, b) => Math.max(a, Math.min(b, Number.isFinite(v) ? v : a));
  const smoothstep = (t) => {
    const u = clamp(t, 0, 1);
    return u * u * (3 - 2 * u);
  };

  function crearPlanosDefecto(tipo) {
    if (tipo === 'zoomIn') {
      return [
        { x0: -2.0, y0: 0.9, s0: 1.04, x1: 1.8, y1: -0.6, s1: 1.13, peso: 0.5 },
        { x0: 1.8, y0: -0.6, s0: 1.13, x1: 0.0, y1: 0.1, s1: 1.06, peso: 0.5 }
      ];
    }
    return [
      { x0: 2.2, y0: -0.9, s0: 1.04, x1: -1.8, y1: 0.7, s1: 1.13, peso: 0.52 },
      { x0: -1.8, y0: 0.7, s0: 1.13, x1: 0.0, y1: 0.0, s1: 1.06, peso: 0.48 }
    ];
  }

  function defEscena(id, num, acto, titulo, atmosfera, acento, dur, camara3d, tipoPlano) {
    const numPad = String(num).padStart(2, '0');
    return {
      id,
      numero: num,
      acto,
      titulo,
      imagen: `assets/cinematicas/${id}.webp`,
      video: `assets/cinematicas/videos/${id}.webm`,
      videoMp4: `assets/cinematicas/videos/${id}.mp4`,
      videoDisponible: false,
      videoConAudio: false,
      vozId: id === 'prologo' ? 'prologo_01' : `cap_${numPad}_encargo`,
      atmosfera,
      acento,
      duracionSeg: dur,
      camara3d,
      planos: crearPlanosDefecto(tipoPlano)
    };
  }

  const ESCENAS_LISTA = [
    defEscena('prologo', 0, 'Prólogo · La Emboscada', 'La Emboscada en la Fragua de Brann', 'brasas', '#f97316', 15, 'forja', 'zoomIn'),
    defEscena('c1', 1, 'Acto I · Emboscada y Forja Clandestina', 'Pieles de caza y los pantalones reforzados', 'brasas', '#fbbf24', 13, 'heroica', 'zoomIn'),
    defEscena('c2', 2, 'Acto I · Emboscada y Forja Clandestina', 'El camino agreste y las botas de marcha', 'lluvia', '#f87171', 12, 'panoramica', 'pan'),
    defEscena('c3', 3, 'Acto I · Emboscada y Forja Clandestina', 'Garras de bestia y el aldeano leal', 'niebla', '#94a3b8', 12, 'heroica', 'zoomIn'),
    defEscena('c4', 4, 'Acto I · Emboscada y Forja Clandestina', 'Planchas de caparazón y el peto de acero', 'brasas', '#fb923c', 12, 'titan', 'pan'),
    defEscena('c5', 5, 'Acto I · Emboscada y Forja Clandestina', 'Astas de hueso y el yelmo protector', 'niebla', '#60a5fa', 12, 'panoramica', 'zoomIn'),
    defEscena('c6', 6, 'Acto II · Reliquias y Poder Antiguo', 'La fuente arcana y el templado del conjunto', 'arcano', '#38bdf8', 12, 'ritual', 'pan'),
    defEscena('c7', 7, 'Acto II · Reliquias y Poder Antiguo', 'Mineral salvaje y la forja del arma', 'brasas', '#f97316', 12, 'forja', 'zoomIn'),
    defEscena('c8', 8, 'Acto II · Reliquias y Poder Antiguo', 'El sello de la nova', 'rayo', '#facc15', 12, 'heroica', 'zoomIn'),
    defEscena('c9', 9, 'Acto II · Reliquias y Poder Antiguo', 'La cabaña en la espesura', 'niebla', '#f59e0b', 12, 'panoramica', 'pan'),
    defEscena('c10', 10, 'Acto II · Reliquias y Poder Antiguo', 'Caza en la espesura', 'lluvia', '#fb7185', 12, 'heroica', 'zoomIn'),
    defEscena('c11', 11, 'Acto III · Ruptura del Monopolio y Asalto al Titán', 'El altar de las estrellas y el despertar del comercio', 'arcano', '#60a5fa', 13, 'ritual', 'pan'),
    defEscena('c12', 12, 'Acto III · Ruptura del Monopolio y Asalto al Titán', 'Resonancia ancestral', 'rayo', '#c084fc', 12, 'panoramica', 'zoomIn'),
    defEscena('c13', 13, 'Acto III · Ruptura del Monopolio y Asalto al Titán', 'El santuario de la luz', 'arcano', '#fde047', 13, 'ritual', 'zoomIn'),
    defEscena('c14', 14, 'Acto III · Ruptura del Monopolio y Asalto al Titán', 'Los jefes del bosque y el titán', 'brasas', '#ef4444', 14, 'titan', 'pan'),
    defEscena('c15', 15, 'Acto IV · Purificación y Liberación de Aden', 'El juramento en la fuente', 'arcano', '#fcd34d', 13, 'ritual', 'zoomIn'),
    defEscena('c16', 16, 'Acto IV · Purificación y Liberación de Aden', 'El héroe de la plaza', 'celebracion', '#fde047', 14, 'plaza', 'pan')
  ];

  const ESCENAS_BASE = Object.create(null);
  ESCENAS_LISTA.forEach(e => { ESCENAS_BASE[e.id] = e; });

  let escenasActivas = Object.assign(Object.create(null), ESCENAS_BASE);
  let promesaManifest = null;

  function normalizarClave(clave) {
    if (clave === 0 || clave === '0') return 'prologo';
    if (typeof clave === 'number' && Number.isFinite(clave)) return 'c' + Math.round(clave);
    const s = String(clave == null ? '' : clave).trim().toLowerCase();
    if (!s || s === 'prologo' || s === 'prólogo') return 'prologo';
    if (/^\d+$/.test(s)) return s === '0' ? 'prologo' : 'c' + parseInt(s, 10);
    if (/^cap_?0*(\d+)$/.test(s)) return 'c' + parseInt(RegExp.$1, 10);
    return s;
  }

  function obtenerEscena(clave) {
    const id = normalizarClave(clave);
    const e = escenasActivas[id] || ESCENAS_BASE[id] || null;
    return e ? JSON.parse(JSON.stringify(e)) : null;
  }

  function listarEscenas() {
    return ESCENAS_LISTA.map(e => obtenerEscena(e.id));
  }

  function cargarManifest(url = 'assets/cinematicas/manifest.json') {
    if (promesaManifest) return promesaManifest;
    if (typeof fetch !== 'function') {
      promesaManifest = Promise.resolve(escenasActivas);
      return promesaManifest;
    }
    promesaManifest = fetch(url)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data && data.escenas && typeof data.escenas === 'object') {
          Object.keys(data.escenas).forEach(k => {
            const base = ESCENAS_BASE[k] || {};
            escenasActivas[k] = Object.assign({}, base, data.escenas[k]);
          });
        }
        return escenasActivas;
      })
      .catch(() => escenasActivas);
    return promesaManifest;
  }

  // Divide una narración larga en subtítulos legibles proporcionales a su longitud
  function dividirSubtitulos(texto, durTotalSeg = 12) {
    const limpio = String(texto == null ? '' : texto).replace(/\s+/g, ' ').trim();
    const dur = Math.max(3, Number.isFinite(durTotalSeg) ? durTotalSeg : 12);
    if (!limpio) return [];

    const frasesBrutas = limpio.split(/(?<=[.!?;»])\s+/).map(s => s.trim()).filter(Boolean);
    const bloques = [];
    for (const f of frasesBrutas) {
      if (f.length <= 115) {
        bloques.push(f);
        continue;
      }
      // Dividir frases largas por comas o espacios sin cortar palabras
      const partes = f.split(/(?<=,|:)\s+/);
      let actual = '';
      for (const p of partes) {
        if (!actual) {
          actual = p;
        } else if (actual.length + 1 + p.length <= 115) {
          actual += ' ' + p;
        } else {
          bloques.push(actual);
          actual = p;
        }
      }
      if (actual) {
        if (actual.length > 130) {
          const palabras = actual.split(' ');
          let linea = '';
          for (const w of palabras) {
            if (!linea) linea = w;
            else if (linea.length + 1 + w.length <= 105) linea += ' ' + w;
            else { bloques.push(linea); linea = w; }
          }
          if (linea) bloques.push(linea);
        } else {
          bloques.push(actual);
        }
      }
    }
    if (!bloques.length) bloques.push(limpio);

    const pesos = bloques.map(b => Math.max(10, b.length));
    const totalPeso = pesos.reduce((a, b) => a + b, 0);
    let tAcc = 0;
    return bloques.map((b, i) => {
      const share = pesos[i] / totalPeso;
      const tInicio = tAcc;
      const tFin = i === bloques.length - 1 ? dur : tAcc + dur * share;
      tAcc = tFin;
      return { texto: b, tInicio, tFin };
    });
  }

  function seleccionarFuenteMedia(escena, opts = {}) {
    if (!escena) return { tipo: 'imagen', src: '' };
    const o = opts || {};
    if (o.videoUrl && typeof o.videoUrl === 'string') {
      return { tipo: 'video', src: o.videoUrl, srcMp4: o.videoMp4 || null };
    }
    if (escena.videoDisponible && (escena.video || escena.videoMp4)) {
      return {
        tipo: 'video',
        src: escena.video || escena.videoMp4,
        srcMp4: escena.videoMp4 || null
      };
    }
    return { tipo: 'imagen', src: escena.imagen || '' };
  }

  // -------------------- Reproductor visual DOM + Canvas --------------------
  let sesionActiva = null;

  function asegurarEstilos() {
    if (typeof document === 'undefined' || document.getElementById('cinematicas-css')) return;
    const style = document.createElement('style');
    style.id = 'cinematicas-css';
    style.textContent = `
      #cinematica-overlay {
        position: fixed; inset: 0; z-index: 9500;
        background: #02040a;
        display: none; flex-direction: column; justify-content: space-between;
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        color: #f8fafc; user-select: none; overflow: hidden;
        opacity: 0; transition: opacity 0.42s ease;
      }
      #cinematica-overlay.show { display: flex; opacity: 1; }
      .cine-letterbox {
        height: 8vh; min-height: 44px; max-height: 88px;
        background: linear-gradient(180deg, #02040a 70%, rgba(2,4,10,0.92));
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 24px; z-index: 4; box-sizing: border-box;
      }
      .cine-letterbox.bot {
        background: linear-gradient(0deg, #02040a 72%, rgba(2,4,10,0.92));
        flex-direction: column; justify-content: center; gap: 8px; padding: 6px 24px 10px;
      }
      .cine-stage {
        position: relative; flex: 1; width: 100%; max-width: 177.78vh;
        margin: 0 auto; overflow: hidden;
        border-top: 1px solid rgba(250, 204, 21, 0.25);
        border-bottom: 1px solid rgba(250, 204, 21, 0.25);
        background: #070b14;
      }
      .cine-media {
        position: absolute; inset: 0; width: 100%; height: 100%;
        object-fit: cover; will-change: transform, opacity;
        transform-origin: center center; transition: opacity 0.45s ease;
      }
      .cine-vignette {
        position: absolute; inset: 0; pointer-events: none; z-index: 2;
        background:
          radial-gradient(ellipse at center, rgba(0,0,0,0) 48%, rgba(2,4,10,0.72) 100%),
          linear-gradient(180deg, rgba(2,4,10,0.52) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 68%, rgba(2,4,10,0.84) 100%);
      }
      .cine-particles {
        position: absolute; inset: 0; width: 100%; height: 100%;
        pointer-events: none; z-index: 2;
      }
      .cine-title-card {
        position: absolute; left: 5%; top: 50%; transform: translateY(-50%);
        max-width: 720px; z-index: 3; pointer-events: none;
        transition: all 0.9s cubic-bezier(0.22, 1, 0.36, 1);
        text-shadow: 0 3px 16px rgba(0,0,0,0.95);
      }
      .cine-title-card.tucked {
        top: 6%; left: 3%; transform: translateY(0) scale(0.76); transform-origin: top left; opacity: 0.92;
      }
      .cine-acto {
        font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase;
        color: #fde047; font-weight: 700; margin-bottom: 6px;
      }
      .cine-titulo {
        font-family: Georgia, 'Times New Roman', serif;
        font-size: clamp(22px, 3.2vw, 38px); line-height: 1.15;
        color: #fffbeb; font-weight: 700; margin: 0;
      }
      .cine-subs {
        position: absolute; left: 50%; bottom: 4.5%; transform: translateX(-50%);
        width: min(860px, 90%); padding: 10px 18px; border-radius: 8px;
        background: rgba(2, 6, 16, 0.76); backdrop-filter: blur(4px);
        border: 1px solid rgba(250, 204, 21, 0.22);
        text-align: center; font-size: clamp(14px, 1.45vw, 18px); line-height: 1.48;
        color: #f8fafc; text-shadow: 0 1px 4px #000; z-index: 3;
        box-sizing: border-box;
      }
      .cine-prog-wrap {
        width: min(980px, 92%); height: 3px; background: rgba(255,255,255,0.14);
        border-radius: 3px; overflow: hidden;
      }
      .cine-prog-bar {
        height: 100%; width: 0%;
        background: linear-gradient(90deg, #f59e0b, #fde047);
      }
      .cine-controls {
        width: min(980px, 92%); display: flex; justify-content: space-between; align-items: center; gap: 10px;
      }
      .cine-controls-btns { display: flex; gap: 8px; flex-wrap: wrap; }
      .cine-btn {
        background: rgba(15, 23, 42, 0.85); color: #e2e8f0;
        border: 1px solid rgba(148, 163, 184, 0.35); border-radius: 6px;
        padding: 5px 12px; font-size: 12.5px; cursor: pointer;
        transition: background 0.15s, border-color 0.15s;
      }
      .cine-btn:hover { background: rgba(30, 41, 59, 0.95); border-color: #fde047; color: #fff; }
      .cine-btn.primary {
        background: linear-gradient(135deg, #92400e, #b45309);
        border-color: #facc15; color: #fef9c3; font-weight: 600;
      }
    `;
    document.head.appendChild(style);
  }

  function crearParticulas(atmos, w, h, acento) {
    const count = atmos === 'lluvia' ? 75 : (atmos === 'celebracion' ? 50 : 38);
    const lista = [];
    for (let i = 0; i < count; i++) {
      lista.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: atmos === 'niebla' ? 36 + Math.random() * 65 : (1.2 + Math.random() * 2.8),
        vx: atmos === 'lluvia' ? -45 : (atmos === 'niebla' ? 12 + Math.random() * 14 : (Math.random() - 0.5) * 26),
        vy: atmos === 'brasas' || atmos === 'arcano' ? -(18 + Math.random() * 38)
          : (atmos === 'lluvia' ? 320 + Math.random() * 180
          : (atmos === 'celebracion' ? 22 + Math.random() * 32 : (Math.random() - 0.5) * 10)),
        a: 0.22 + Math.random() * 0.58,
        fase: Math.random() * Math.PI * 2,
        color: acento || '#fde047'
      });
    }
    return { lista, rayoTimer: 1.8 + Math.random() * 2.5, rayoFlash: 0 };
  }

  function actualizarYRenderizarParticulas(ctx, w, h, atmos, st, dt) {
    ctx.clearRect(0, 0, w, h);
    if (atmos === 'rayo') {
      st.rayoTimer -= dt;
      if (st.rayoTimer <= 0) {
        st.rayoTimer = 2.4 + Math.random() * 3.4;
        st.rayoFlash = 0.28;
      }
      if (st.rayoFlash > 0) {
        ctx.fillStyle = `rgba(224, 231, 255, ${st.rayoFlash.toFixed(3)})`;
        ctx.fillRect(0, 0, w, h);
        st.rayoFlash = Math.max(0, st.rayoFlash - dt * 0.9);
      }
    }
    for (const p of st.lista) {
      p.fase += dt * 2.1;
      p.x += (p.vx + (atmos === 'brasas' || atmos === 'arcano' ? Math.sin(p.fase) * 14 : 0)) * dt;
      p.y += p.vy * dt;
      if (p.y < -80) { p.y = h + 40; p.x = Math.random() * w; }
      if (p.y > h + 80) { p.y = -40; p.x = Math.random() * w; }
      if (p.x < -80) p.x = w + 60;
      if (p.x > w + 80) p.x = -60;

      ctx.save();
      if (atmos === 'lluvia') {
        ctx.strokeStyle = `rgba(186, 230, 253, ${(p.a * 0.45).toFixed(2)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 4, p.y + 18);
        ctx.stroke();
      } else if (atmos === 'niebla') {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(203, 213, 225, ${(p.a * 0.14).toFixed(3)})`);
        g.addColorStop(1, 'rgba(203, 213, 225, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.globalAlpha = clamp(p.a * (0.65 + 0.35 * Math.sin(p.fase)), 0.1, 0.95);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function evaluarKenBurns(planos, u) {
    if (!Array.isArray(planos) || !planos.length) {
      return `scale(${(1.04 + 0.08 * u).toFixed(4)}) translate(0%, 0%)`;
    }
    const totalPeso = planos.reduce((a, p) => a + (p.peso || 1), 0) || 1;
    let acc = 0;
    for (let i = 0; i < planos.length; i++) {
      const pl = planos[i];
      const frac = (pl.peso || 1) / totalPeso;
      const fin = i === planos.length - 1 ? 1 : acc + frac;
      if (u <= fin || i === planos.length - 1) {
        const local = smoothstep((u - acc) / Math.max(1e-4, fin - acc));
        const x = (pl.x0 || 0) + ((pl.x1 || 0) - (pl.x0 || 0)) * local;
        const y = (pl.y0 || 0) + ((pl.y1 || 0) - (pl.y0 || 0)) * local;
        const s = (pl.s0 || 1.04) + ((pl.s1 || 1.12) - (pl.s0 || 1.04)) * local;
        return `translate(${x.toFixed(3)}%, ${y.toFixed(3)}%) scale(${s.toFixed(4)})`;
      }
      acc = fin;
    }
    return 'scale(1.08)';
  }

  function cerrar(saltada = false) {
    if (!sesionActiva) return;
    const s = sesionActiva;
    sesionActiva = null;
    if (s.rafId && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(s.rafId);
    if (typeof window !== 'undefined' && s.onKey) window.removeEventListener('keydown', s.onKey, true);

    if (s.overlay) {
      s.overlay.classList.remove('show');
      s.overlay.style.display = 'none';
    }
    if (s.videoEl) {
      try { s.videoEl.pause(); s.videoEl.removeAttribute('src'); } catch (_) {}
    }
    if (root.Voces && typeof root.Voces.detener === 'function') {
      root.Voces.detener();
    }
    if (s.origMusVol !== null && root.Sonidos && typeof root.Sonidos.setVolumen === 'function') {
      root.Sonidos.setVolumen('musica', s.origMusVol);
    }
    if (typeof s.onTerminar === 'function') {
      s.onTerminar({ id: s.escena.id, numero: s.escena.numero, saltada: !!saltada, camara3d: s.escena.camara3d });
    }
  }

  function pausar(forzarEstado) {
    if (!sesionActiva) return false;
    const s = sesionActiva;
    s.pausado = typeof forzarEstado === 'boolean' ? forzarEstado : !s.pausado;
    if (s.btnPausa) s.btnPausa.textContent = s.pausado ? '▶ Reanudar' : '⏸ Pausar';
    if (s.videoEl && !s.videoFallbackUsado) {
      try { if (s.pausado) s.videoEl.pause(); else s.videoEl.play().catch(() => {}); } catch (_) {}
    }
    return s.pausado;
  }

  function estaActiva() {
    return !!sesionActiva;
  }

  function reproducir(clave, opts = {}) {
    const escena = obtenerEscena(clave);
    if (!escena) return false;
    if (typeof document === 'undefined') {
      if (typeof opts.onTerminar === 'function') opts.onTerminar({ id: escena.id, numero: escena.numero, saltada: false, camara3d: escena.camara3d });
      return true;
    }

    if (sesionActiva) cerrar(true);
    asegurarEstilos();

    let overlay = document.getElementById('cinematica-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'cinematica-overlay';
      overlay.innerHTML = `
        <div class="cine-letterbox top">
          <span id="cine-badge" style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#cbd5e1"></span>
          <span id="cine-estado" style="font-size:11.5px;color:#94a3b8">Crónica de Valdris</span>
        </div>
        <div class="cine-stage">
          <img id="cine-img" class="cine-media" alt="" />
          <video id="cine-video" class="cine-media" playsinline style="display:none"></video>
          <canvas id="cine-particles" class="cine-particles"></canvas>
          <div class="cine-vignette"></div>
          <div id="cine-title-card" class="cine-title-card">
            <div id="cine-acto" class="cine-acto"></div>
            <h2 id="cine-titulo" class="cine-titulo"></h2>
          </div>
          <div id="cine-subs" class="cine-subs" style="display:none"></div>
        </div>
        <div class="cine-letterbox bot">
          <div class="cine-prog-wrap"><div id="cine-prog-bar" class="cine-prog-bar"></div></div>
          <div class="cine-controls">
            <span id="cine-tiempo" style="font-size:11.5px;color:#94a3b8">0:00</span>
            <div class="cine-controls-btns">
              <button type="button" id="cine-btn-pausa" class="cine-btn">⏸ Pausar</button>
              <button type="button" id="cine-btn-voz" class="cine-btn">🔊 Voz</button>
              <button type="button" id="cine-btn-saltar" class="cine-btn primary">⏭ Saltar (ESC)</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    const titulo = opts.titulo || escena.titulo;
    const acto = opts.acto || escena.acto;
    const texto = opts.texto || '';
    const durSeg = Math.max(5, Number(opts.duracionSeg || escena.duracionSeg || 12));
    const cues = dividirSubtitulos(texto, durSeg);
    const fuente = seleccionarFuenteMedia(escena, opts);

    const badgeEl = document.getElementById('cine-badge');
    const actoEl = document.getElementById('cine-acto');
    const titEl = document.getElementById('cine-titulo');
    const titleCardEl = document.getElementById('cine-title-card');
    const subsEl = document.getElementById('cine-subs');
    const imgEl = document.getElementById('cine-img');
    const videoEl = document.getElementById('cine-video');
    const canvasEl = document.getElementById('cine-particles');
    const progBarEl = document.getElementById('cine-prog-bar');
    const tiempoEl = document.getElementById('cine-tiempo');
    const btnPausa = document.getElementById('cine-btn-pausa');
    const btnVoz = document.getElementById('cine-btn-voz');
    const btnSaltar = document.getElementById('cine-btn-saltar');

    if (badgeEl) badgeEl.textContent = escena.numero === 0 ? 'Prólogo' : `Capítulo ${escena.numero}`;
    if (actoEl) actoEl.textContent = acto;
    if (titEl) titEl.textContent = titulo;
    if (titleCardEl) titleCardEl.classList.remove('tucked');
    if (subsEl) { subsEl.style.display = cues.length ? '' : 'none'; subsEl.textContent = cues.length ? cues[0].texto : ''; }

    imgEl.src = escena.imagen;
    imgEl.style.display = '';
    imgEl.style.transform = evaluarKenBurns(escena.planos, 0);
    videoEl.style.display = 'none';

    let origMusVol = null;
    if (root.Sonidos && typeof root.Sonidos.getVolumenes === 'function' && typeof root.Sonidos.setVolumen === 'function') {
      const vols = root.Sonidos.getVolumenes();
      if (vols && typeof vols.musica === 'number') {
        origMusVol = vols.musica;
        root.Sonidos.setVolumen('musica', Math.max(0.08, origMusVol * 0.42));
      }
    }

    const sesion = {
      escena,
      overlay,
      videoEl,
      btnPausa,
      origMusVol,
      onTerminar: opts.onTerminar,
      pausado: false,
      silenciado: false,
      videoFallbackUsado: fuente.tipo !== 'video',
      elapsed: 0,
      vozId: opts.vozId || escena.vozId,
      vozEmpezo: false,
      vozTerminoAt: null,
      rafId: null,
      onKey: null
    };
    sesionActiva = sesion;

    if (fuente.tipo === 'video') {
      videoEl.src = fuente.src;
      videoEl.muted = !!escena.videoConAudio ? false : true;
      videoEl.style.display = '';
      imgEl.style.display = 'none';
      videoEl.onerror = () => {
        if (sesionActiva !== sesion) return;
        sesion.videoFallbackUsado = true;
        videoEl.style.display = 'none';
        imgEl.style.display = '';
      };
      videoEl.play().catch(() => {
        if (videoEl.onerror) videoEl.onerror();
      });
    }

    const lanzarVoz = () => {
      if (sesion.silenciado || (fuente.tipo === 'video' && escena.videoConAudio)) return;
      if (root.Voces && typeof root.Voces.hablar === 'function') {
        root.Voces.hablar(sesion.vozId, texto || null, { prioridad: 'alta' }).then(ok => {
          if (ok && sesionActiva === sesion) sesion.vozEmpezo = true;
        }).catch(() => {});
      }
    };
    lanzarVoz();

    btnPausa.textContent = '⏸ Pausar';
    btnPausa.onclick = () => pausar();
    btnVoz.textContent = '🔊 Voz';
    btnVoz.onclick = () => {
      sesion.silenciado = !sesion.silenciado;
      btnVoz.textContent = sesion.silenciado ? '🔇 Silencio' : '🔊 Voz';
      if (sesion.silenciado) {
        if (root.Voces && typeof root.Voces.detener === 'function') root.Voces.detener();
      } else {
        lanzarVoz();
      }
    };
    btnSaltar.onclick = () => cerrar(true);

    sesion.onKey = (e) => {
      if (!sesionActiva) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        cerrar(true);
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        e.stopPropagation();
        pausar();
      }
    };
    if (typeof window !== 'undefined') window.addEventListener('keydown', sesion.onKey, true);

    overlay.style.display = 'flex';
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => overlay.classList.add('show'));
    } else {
      overlay.classList.add('show');
    }

    const ctx = canvasEl && canvasEl.getContext ? canvasEl.getContext('2d') : null;
    if (canvasEl) {
      canvasEl.width = canvasEl.clientWidth || 1280;
      canvasEl.height = canvasEl.clientHeight || 720;
    }
    const partState = ctx ? crearParticulas(escena.atmosfera, canvasEl.width, canvasEl.height, escena.acento) : null;

    let prevMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const tick = (nowMs) => {
      if (sesionActiva !== sesion) return;
      const dt = Math.min(0.1, Math.max(0.001, (nowMs - prevMs) / 1000));
      prevMs = nowMs;

      if (!sesion.pausado) {
        sesion.elapsed += dt;
        const t = sesion.elapsed;
        const u = clamp(t / durSeg, 0, 1);

        if (titleCardEl && t >= 3.2 && !titleCardEl.classList.contains('tucked')) {
          titleCardEl.classList.add('tucked');
        }
        if (sesion.videoFallbackUsado) {
          imgEl.style.transform = evaluarKenBurns(escena.planos, u);
        }
        if (subsEl && cues.length) {
          const cue = cues.find(c => t >= c.tInicio && t <= c.tFin) || cues[cues.length - 1];
          if (subsEl.textContent !== cue.texto) subsEl.textContent = cue.texto;
        }
        if (progBarEl) progBarEl.style.width = `${(u * 100).toFixed(2)}%`;
        if (tiempoEl) {
          const sAct = Math.floor(t), sTot = Math.ceil(durSeg);
          const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
          tiempoEl.textContent = `${fmt(sAct)} / ${fmt(sTot)}`;
        }
        if (ctx && partState) {
          actualizarYRenderizarParticulas(ctx, canvasEl.width, canvasEl.height, escena.atmosfera, partState, dt);
        }

        const hablando = !!(root.Voces && typeof root.Voces.estaHablando === 'function' && root.Voces.estaHablando());
        if (hablando) {
          sesion.vozEmpezo = true;
          sesion.vozTerminoAt = null;
        } else if (sesion.vozEmpezo && sesion.vozTerminoAt === null) {
          sesion.vozTerminoAt = t;
        }

        const finPorTiempo = t >= durSeg && !hablando;
        const finPorVoz = sesion.vozTerminoAt !== null && (t - sesion.vozTerminoAt) >= 1.1 && t >= Math.min(durSeg * 0.7, 7);
        if (finPorTiempo || finPorVoz) {
          cerrar(false);
          return;
        }
      }
      if (typeof requestAnimationFrame === 'function') {
        sesion.rafId = requestAnimationFrame(tick);
      }
    };
    if (typeof requestAnimationFrame === 'function') {
      sesion.rafId = requestAnimationFrame(tick);
    }
    return true;
  }

  const api = {
    ESCENAS_BASE,
    cargarManifest,
    obtenerEscena,
    listarEscenas,
    dividirSubtitulos,
    seleccionarFuenteMedia,
    reproducir,
    cerrar,
    pausar,
    estaActiva
  };

  root.CinematicasLib = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
