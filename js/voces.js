// Sistema de reproducción de voces TTS en español (.ogg) para diálogos, crónica y acompañantes.
// Garantiza canal único (sin solapamientos), prioridad modal y desbloqueo tras interacción del usuario.
(function (root) {
  'use strict';

  const PRIORIDAD = { baja: 1, normal: 2, alta: 3 };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, Number.isFinite(v) ? v : a));

  let activo = true;
  let volumen = 0.95;
  let desbloqueado = false;
  let listenersRegistrados = false;

  let catalogoCargado = false;
  let promesaCarga = null;
  const porId = new Map();
  const porTexto = new Map();
  let listaPrefijos = [];

  let audioActual = null;
  let prioridadActual = 0;
  let idActual = null;
  let reproduccionSeq = 0;
  let pendiente = null;

  function normalizarTexto(raw) {
    return String(raw == null ? '' : raw)
      .replace(/<[^>]+>/g, ' ')
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '')
      .replace(/[«»"']/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s+([.,;:!?])/g, '$1')
      .trim()
      .toLowerCase();
  }

  function indexarEntradas(lista, limpiarAntes = true) {
    if (limpiarAntes) {
      porId.clear();
      porTexto.clear();
      listaPrefijos = [];
    }
    if (!Array.isArray(lista)) return;
    for (const item of lista) {
      if (!item || !item.id || !item.archivo_audio) continue;
      porId.set(String(item.id), item);
      const norm = normalizarTexto(item.texto);
      if (norm) {
        if (!porTexto.has(norm)) porTexto.set(norm, item);
        if (norm.length >= 16) {
          listaPrefijos.push({ norm, item });
        }
      }
    }
    // Prefijos más largos primero para resolver diálogos con sufijos de reputación/clase sin ambigüedad
    listaPrefijos.sort((a, b) => b.norm.length - a.norm.length);
    catalogoCargado = true;
  }

  function agregarEntradas(lista) {
    indexarEntradas(lista, false);
    return porId.size;
  }

  function cargarDesdeArray(lista) {
    indexarEntradas(lista, true);
    promesaCarga = Promise.resolve(porId.size);
    return promesaCarga;
  }

  function cargarCatalogo(urls = ['dialogos_voces.json', 'voces_skills.json']) {
    if (catalogoCargado) return Promise.resolve(porId.size);
    if (promesaCarga) return promesaCarga;
    if (typeof fetch !== 'function') {
      promesaCarga = Promise.resolve(0);
      return promesaCarga;
    }
    const listaUrls = Array.isArray(urls) ? urls : [urls];
    promesaCarga = Promise.all(
      listaUrls.map(u => fetch(u).then(r => (r.ok ? r.json() : [])).catch(() => []))
    )
      .then(resultados => {
        indexarEntradas(resultados.flat(), true);
        return porId.size;
      })
      .catch(() => 0);
    return promesaCarga;
  }

  function limpiarAudioActual() {
    if (!audioActual) return;
    const a = audioActual;
    audioActual = null;
    prioridadActual = 0;
    idActual = null;
    a.onended = null;
    a.onerror = null;
    try { a.pause(); } catch (_) {}
    try { a.currentTime = 0; } catch (_) {}
  }

  function detener() {
    reproduccionSeq++;
    pendiente = null;
    limpiarAudioActual();
  }

  function nivelPrioridad(p) {
    return PRIORIDAD[p] || PRIORIDAD.normal;
  }

  function puedeInterrumpir(nuevaPrio) {
    if (audioActual && nuevaPrio < prioridadActual) return false;
    if (!audioActual && pendiente && nuevaPrio < pendiente.prio) return false;
    return true;
  }

  function crearAudio(ruta) {
    if (typeof Audio === 'function') return new Audio(ruta);
    if (root && typeof root.Audio === 'function') return new root.Audio(ruta);
    return null;
  }

  function reproducirEntrada(item, opts = {}, seqEsperada = null) {
    if (!activo || !item || !item.archivo_audio) return false;
    if (seqEsperada !== null && seqEsperada !== reproduccionSeq) return false;

    const prio = nivelPrioridad(opts.prioridad);
    if (!puedeInterrumpir(prio)) return false;

    const seq = ++reproduccionSeq;
    pendiente = null;
    limpiarAudioActual();

    const audio = crearAudio(item.archivo_audio);
    if (!audio) return false;

    const escala = typeof opts.volumenEscala === 'number' ? clamp(opts.volumenEscala, 0.1, 1) : 1;
    audio.volume = clamp(volumen * escala, 0, 1);
    audioActual = audio;
    prioridadActual = prio;
    idActual = item.id;

    const finalizar = () => {
      if (audioActual === audio) {
        audioActual = null;
        prioridadActual = 0;
        idActual = null;
      }
    };
    audio.onended = finalizar;
    audio.onerror = finalizar;

    try {
      const p = audio.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          if (seq === reproduccionSeq) desbloqueado = true;
        }).catch(err => {
          if (seq !== reproduccionSeq) return;
          const esAutoplay = !err || err.name === 'NotAllowedError' || err.name === 'AbortError' || !desbloqueado;
          limpiarAudioActual();
          if (esAutoplay && activo) {
            pendiente = { item, prio, seq, ts: Date.now() };
            registrarDesbloqueoAutomatico();
          }
        });
      } else {
        desbloqueado = true;
      }
    } catch (_) {
      limpiarAudioActual();
      if (activo) {
        pendiente = { item, prio, seq, ts: Date.now() };
        registrarDesbloqueoAutomatico();
      }
      return false;
    }
    return true;
  }

  function buscarPorTexto(texto) {
    const norm = normalizarTexto(texto);
    if (!norm) return null;
    if (porTexto.has(norm)) return porTexto.get(norm);
    for (let i = 0; i < listaPrefijos.length; i++) {
      const p = listaPrefijos[i];
      if (norm.startsWith(p.norm)) return p.item;
    }
    return null;
  }

  function hablar(id, texto, opts = {}) {
    if (!activo) return Promise.resolve(false);
    const prio = nivelPrioridad(opts.prioridad);
    if (!puedeInterrumpir(prio)) return Promise.resolve(false);

    const seq = ++reproduccionSeq;
    const resolver = () => {
      if (!activo || seq !== reproduccionSeq) return false;
      const item = (id && porId.get(String(id))) || (texto ? buscarPorTexto(texto) : null);
      if (!item) return false;
      return reproducirEntrada(item, opts, seq);
    };

    if (catalogoCargado) return Promise.resolve(resolver());
    return cargarCatalogo().then(resolver);
  }

  function hablarPorId(id, opts = {}) {
    return hablar(id, null, opts);
  }

  function hablarTexto(texto, opts = {}) {
    return hablar(opts.id || null, texto, opts);
  }

  function desbloquear() {
    desbloqueado = true;
    quitarListenersDesbloqueo();
    if (!activo || !pendiente) return false;
    // Descartar diálogos ambientales viejos si llevan demasiado tiempo esperando
    const p = pendiente;
    pendiente = null;
    if (p.prio < PRIORIDAD.alta && Date.now() - p.ts > 12000) return false;
    return reproducirEntrada(p.item, { prioridad: p.prio === 3 ? 'alta' : (p.prio === 1 ? 'baja' : 'normal') });
  }

  function quitarListenersDesbloqueo() {
    if (!listenersRegistrados || typeof window === 'undefined' || !window.removeEventListener) return;
    listenersRegistrados = false;
    window.removeEventListener('pointerdown', onPrimerGesto);
    window.removeEventListener('keydown', onPrimerGesto);
    window.removeEventListener('touchstart', onPrimerGesto);
  }

  function onPrimerGesto() {
    desbloquear();
  }

  function registrarDesbloqueoAutomatico() {
    if (listenersRegistrados || desbloqueado || typeof window === 'undefined' || !window.addEventListener) return;
    listenersRegistrados = true;
    window.addEventListener('pointerdown', onPrimerGesto, { passive: true });
    window.addEventListener('keydown', onPrimerGesto, { passive: true });
    window.addEventListener('touchstart', onPrimerGesto, { passive: true });
  }

  function setVolumen(v) {
    volumen = clamp(Number(v), 0, 1);
    if (audioActual) audioActual.volume = volumen;
    return volumen;
  }

  function getVolumen() {
    return volumen;
  }

  function activar(flag) {
    activo = !!flag;
    if (!activo) detener();
    return activo;
  }

  function estaActivo() {
    return activo;
  }

  function estaHablando() {
    return !!audioActual && !audioActual.paused;
  }

  function estado() {
    return {
      activo,
      desbloqueado,
      catalogoCargado,
      totalEntradas: porId.size,
      hablando: estaHablando(),
      idActual,
      volumen,
      tienePendiente: !!pendiente
    };
  }

  const ULTIMATES_SKILL = new Set([
    'sismo', 'nova', 'sentencia_titan', 'st_nova', 'tormenta_fuego', 'ventisca_glacial', 'juicio_relampago'
  ]);
  const COMP_VOZ_GRUPOS = {
    rowan: { buff: 'comp_rowan_buff', ataque: 'comp_rowan_ataque', defensa: 'comp_rowan_defensa' },
    lyra:  { ataque: 'comp_lyra_ataque', debuff: 'comp_lyra_debuff', buff: 'comp_lyra_buff' },
    elian: { cura: 'comp_elian_cura', defensa: 'comp_elian_defensa', ataque: 'comp_elian_ataque' },
    brenda:{ ataque: 'comp_brenda_ataque', buff: 'comp_brenda_buff', defensa: 'comp_brenda_defensa' }
  };

  let ultimoSkillVozMs = 0;
  let ultimoCompVozMs = 0;

  function hablarSkill(skillId, _clase = 'guerrero', opts = {}) {
    if (!activo || !skillId || skillId === 'attack' || skillId === 'disparo') return Promise.resolve(false);
    const esUltimate = ULTIMATES_SKILL.has(skillId);
    const now = Date.now();
    const cooldownMs = esUltimate ? 1200 : 2200;
    if (!opts.sinCooldown && now - ultimoSkillVozMs < cooldownMs) return Promise.resolve(false);
    if (!puedeInterrumpir(PRIORIDAD.baja)) return Promise.resolve(false);

    const elegido = `sk_${skillId}`;
    ultimoSkillVozMs = now;
    return hablar(elegido, null, Object.assign({ prioridad: 'baja', volumenEscala: 0.85 }, opts));
  }

  function hablarCompaneroSkill(arquetipo = 'rowan', tipoSkill = 'ataque', opts = {}) {
    if (!activo || tipoSkill === 'ataque_basico') return Promise.resolve(false);
    const now = Date.now();
    if (!opts.sinCooldown && now - ultimoCompVozMs < 6000) return Promise.resolve(false);
    if (!puedeInterrumpir(PRIORIDAD.baja)) return Promise.resolve(false);

    const mapa = COMP_VOZ_GRUPOS[arquetipo] || COMP_VOZ_GRUPOS.rowan;
    const id = mapa[tipoSkill] || Object.values(mapa)[0];
    if (!id) return Promise.resolve(false);

    ultimoCompVozMs = now;
    return hablar(id, null, Object.assign({ prioridad: 'baja', volumenEscala: 0.80 }, opts));
  }

  function resetCooldownsCombate() {
    ultimoSkillVozMs = 0;
    ultimoCompVozMs = 0;
  }

  registrarDesbloqueoAutomatico();

  const api = {
    cargarCatalogo,
    cargarDesdeArray,
    agregarEntradas,
    hablar,
    hablarPorId,
    hablarTexto,
    hablarSkill,
    hablarCompaneroSkill,
    resetCooldownsCombate,
    detener,
    desbloquear,
    activar,
    estaActivo,
    setVolumen,
    getVolumen,
    estaHablando,
    estado,
    normalizarTexto
  };

  root.Voces = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
