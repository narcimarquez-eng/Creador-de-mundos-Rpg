(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ArteUI = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Mapeo completo de las 81 habilidades de CombatLib.SKILLS + utilidades a los 23 iconos pintados
  const SKILL_ICON_MAP = {
    // Básicas
    attack: 'espada_tajo',
    disparo: 'arco_flecha',
    esquiva: 'esquiva_sombra',
    pocion_vida: 'pocion_vida',
    pocion_mana: 'pocion_mana',

    // Núcleo del héroe (30)
    sismo: 'maza_sismo',
    nova: 'meteoro_cataclismo',
    tajo: 'espada_tajo',
    estocada: 'espada_tajo',
    ascendente: 'espada_luz',
    hendidura: 'mandoble',
    contraataque: 'furia_berserker',
    torbellino: 'torbellino_acero',
    voltereta: 'lanza_valquiria',
    tornillo: 'lanza_valquiria',
    corte_cruzado: 'espada_tajo',
    rafaga: 'lluvia_flechas',
    furia: 'furia_berserker',
    escudo_espiritu: 'escudo_arcano',
    salto_demoledor: 'maza_sismo',
    lluvia_proyectiles: 'lluvia_flechas',
    juicio_relampago: 'relampago_divino',
    sentencia_titan: 'maza_sismo',
    suspension: 'rayo_arcano',
    bola_fuego: 'fuego_magia',
    lanza_hielo: 'hielo_escarcha',
    ventisca_glacial: 'hielo_escarcha',
    tormenta_fuego: 'fuego_magia',
    rayo_arcano: 'rayo_arcano',
    orbe_arcano: 'meteoro_cataclismo',
    flecha_perforante: 'arco_flecha',
    trampa_espinas: 'trampa_espinas',
    escudo_mana: 'escudo_arcano',
    paso_sombrio: 'daga_sombra',
    hoja_veneno: 'hoja_veneno',

    // Espada 1M (6)
    sw_iaido: 'espada_tajo',
    sw_solar: 'golpe_solar',
    sw_blitz: 'espada_luz',
    sw_cross: 'espada_tajo',
    sw_lightning: 'espada_luz',
    sw_celestial: 'golpe_solar',

    // Mandoble 2M (6)
    gs_sweep: 'mandoble',
    gs_titan: 'mandoble',
    gs_cross: 'mandoble',
    gs_colossus: 'mandoble',
    gs_crescent: 'golpe_solar',
    gs_skybreak: 'relampago_divino',

    // Dagas (6)
    dg_dash: 'daga_sombra',
    dg_blink: 'daga_sombra',
    dg_rush: 'daga_sombra',
    dg_venom: 'hoja_veneno',
    dg_shadow: 'daga_sombra',
    dg_zigzag: 'daga_sombra',

    // Hacha 1M (5)
    ax_thunder: 'relampago_divino',
    ax_inferno: 'fuego_magia',
    ax_berserk: 'furia_berserker',
    ax_reap: 'hacha_guerra',
    ax_nordic: 'hacha_guerra',

    // Hacha 2M (5)
    a2_sweep: 'hacha_guerra',
    a2_titan: 'hacha_guerra',
    a2_colossus: 'hacha_guerra',
    a2_vortex: 'torbellino_acero',
    a2_demolish: 'maza_sismo',

    // Maza / Martillo (5)
    mc_storm: 'relampago_divino',
    mc_crush: 'maza_sismo',
    mc_seismic: 'maza_sismo',
    mc_titan: 'maza_sismo',
    mc_judgment: 'relampago_divino',

    // Lanza / Alabarda (5)
    ln_sweep: 'lanza_valquiria',
    ln_skewer: 'lanza_valquiria',
    ln_phalanx: 'escudo_arcano',
    ln_valkyrie: 'lanza_valquiria',
    ln_dragon: 'fuego_magia',

    // Arco (6)
    bw_bolt: 'arco_flecha',
    bw_double: 'arco_flecha',
    bw_frost: 'hielo_escarcha',
    bw_aerial: 'arco_flecha',
    bw_barrage: 'lluvia_flechas',
    bw_prism: 'lluvia_flechas',

    // Báculo (5)
    st_tempest: 'rayo_arcano',
    st_meteor: 'meteoro_cataclismo',
    st_judgment: 'relampago_divino',
    st_solar: 'golpe_solar',
    st_nova: 'meteoro_cataclismo'
  };

  const WEAPON_ATTACK_ICON = {
    espada: 'espada_tajo',
    espada2m: 'mandoble',
    mandoble: 'mandoble',
    daga: 'daga_sombra',
    hacha: 'hacha_guerra',
    hacha2m: 'hacha_guerra',
    maza: 'maza_sismo',
    lanza: 'lanza_valquiria',
    arco: 'arco_flecha',
    baculo: 'rayo_arcano'
  };

  const RETRATO_ALIASES = {
    'guru-1': 'guru-1',
    'sabia elara': 'guru-1',
    'elara': 'guru-1',
    'narrador': 'guru-1',
    'cronica': 'guru-1',
    'guru-2': 'guru-2',
    'maestro oren': 'guru-2',
    'oren': 'guru-2',
    'guru-3': 'guru-3',
    'hermana ysolde': 'guru-3',
    'ysolde': 'guru-3',
    'guru-4': 'guru-4',
    'viejo tamsin': 'guru-4',
    'tamsin': 'guru-4',
    'cabana': 'guru-4',
    'aldeano': 'guru-4',
    'guru-5': 'guru-5',
    'erudita mirel': 'guru-5',
    'mirel': 'guru-5',
    'serv-herrero': 'serv-herrero',
    'herrero': 'serv-herrero',
    'forja': 'serv-herrero',
    'serv-mercader': 'serv-mercader',
    'mercader': 'serv-mercader',
    'buhonero': 'serv-mercader',
    'serv-comandante': 'serv-comandante',
    'comandante': 'serv-comandante',
    'serv-entrenador': 'serv-comandante',
    'entrenador': 'serv-comandante',
    'serv-informante': 'serv-informante',
    'informante': 'serv-informante',
    'serv-boticaria': 'serv-boticaria',
    'boticaria': 'serv-boticaria',
    'alquimista': 'serv-boticaria',
    'serv-hereje': 'serv-hereje',
    'hereje': 'serv-hereje',
    'rowan': 'rowan',
    'lyra': 'lyra',
    'elian': 'elian',
    'brenda': 'brenda'
  };

  let _manifest = {
    version: '1.0.0',
    modelo: 'Lykon/dreamshaper-xl-v2-turbo',
    portada: null,
    retratos: {},
    iconos: {}
  };
  let _cargado = false;
  let _cargandoPromesa = null;
  const _listeners = [];

  function normalizarClave(raw) {
    return String(raw || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function resolverClaveRetrato(idONombre) {
    const norm = normalizarClave(idONombre);
    if (!norm) return null;
    if (RETRATO_ALIASES[norm]) return RETRATO_ALIASES[norm];
    // Prefijos con sufijo de asentamiento, ej: serv-herrero-1 -> serv-herrero
    const prefijos = [
      'guru-1', 'guru-2', 'guru-3', 'guru-4', 'guru-5',
      'serv-herrero', 'serv-mercader', 'serv-comandante',
      'serv-entrenador', 'serv-informante', 'serv-boticaria', 'serv-hereje'
    ];
    for (let i = 0; i < prefijos.length; i++) {
      if (norm.indexOf(prefijos[i]) === 0) {
        return RETRATO_ALIASES[prefijos[i]] || prefijos[i];
      }
    }
    // Búsqueda por subcadena en nombres compuestos ("Comandante de la Guardia", etc.)
    const palabras = Object.keys(RETRATO_ALIASES);
    for (let i = 0; i < palabras.length; i++) {
      const k = palabras[i];
      if (k.length >= 4 && norm.indexOf(k) !== -1) {
        return RETRATO_ALIASES[k];
      }
    }
    return null;
  }

  function resolverIconoId(skillId, claseArma) {
    if (skillId === 'attack' && claseArma && WEAPON_ATTACK_ICON[claseArma]) {
      return WEAPON_ATTACK_ICON[claseArma];
    }
    return SKILL_ICON_MAP[skillId] || null;
  }

  function iconoUrl(skillId, claseArma) {
    const iconId = resolverIconoId(skillId, claseArma);
    if (!iconId || !_manifest || !_manifest.iconos) return null;
    return _manifest.iconos[iconId] || null;
  }

  function retratoUrl(idONombre) {
    const key = resolverClaveRetrato(idONombre);
    if (!key || !_manifest || !_manifest.retratos) return null;
    return _manifest.retratos[key] || null;
  }

  function portadaUrl() {
    return (_manifest && _manifest.portada) || null;
  }

  function establecerManifest(data) {
    if (data && typeof data === 'object') {
      _manifest = {
        version: data.version || '1.0.0',
        modelo: data.modelo || '',
        portada: data.portada || null,
        retratos: (data.retratos && typeof data.retratos === 'object') ? data.retratos : {},
        iconos: (data.iconos && typeof data.iconos === 'object') ? data.iconos : {}
      };
    }
    _cargado = true;
    for (let i = 0; i < _listeners.length; i++) {
      try { _listeners[i](_manifest); } catch (_) {}
    }
    if (typeof document !== 'undefined') {
      aplicarArteInicialDOM();
    }
    return _manifest;
  }

  function cargarManifest(url) {
    if (_cargandoPromesa) return _cargandoPromesa;
    const target = url || 'assets/arte/manifest.json';
    if (typeof fetch !== 'function') {
      _cargado = true;
      return Promise.resolve(_manifest);
    }
    _cargandoPromesa = fetch(target, { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) return null;
        return r.json();
      })
      .then(function (json) {
        return establecerManifest(json || {});
      })
      .catch(function () {
        _cargado = true;
        return _manifest;
      });
    return _cargandoPromesa;
  }

  function onListo(fn) {
    if (typeof fn !== 'function') return;
    _listeners.push(fn);
    if (_cargado) {
      try { fn(_manifest); } catch (_) {}
    }
  }

  function renderIconoEnElemento(el, skillId, fallbackEmoji, claseArma) {
    if (!el) return false;
    const url = iconoUrl(skillId, claseArma);
    const cacheKey = url ? ('img:' + url) : ('txt:' + (fallbackEmoji || ''));
    if (el.dataset && el.dataset.artKey === cacheKey) {
      return Boolean(url);
    }
    if (el.dataset) el.dataset.artKey = cacheKey;

    if (url) {
      el.textContent = '';
      const img = document.createElement('img');
      img.className = 'art-skill-img';
      img.src = url;
      img.alt = '';
      img.draggable = false;
      img.onerror = function () {
        if (el.dataset) el.dataset.artKey = 'err:' + (fallbackEmoji || '');
        el.textContent = fallbackEmoji || '';
      };
      el.appendChild(img);
      return true;
    }

    el.textContent = fallbackEmoji || '';
    return false;
  }

  function aplicarRetrato(el, idONombre, fallbackEmoji) {
    if (!el) return false;
    const url = retratoUrl(idONombre);
    if (!url) {
      if (fallbackEmoji) {
        el.textContent = fallbackEmoji;
        el.classList.remove('tiene-arte');
      } else {
        el.innerHTML = '';
        el.classList.remove('tiene-arte');
      }
      return false;
    }
    const cur = el.querySelector('img');
    if (cur && cur.getAttribute('src') === url) {
      el.classList.add('tiene-arte');
      return true;
    }
    el.textContent = '';
    const img = document.createElement('img');
    img.className = 'art-retrato-img';
    img.src = url;
    img.alt = String(idONombre || '');
    img.draggable = false;
    img.onerror = function () {
      el.classList.remove('tiene-arte');
      el.textContent = fallbackEmoji || '';
    };
    el.appendChild(img);
    el.classList.add('tiene-arte');
    return true;
  }

  function aplicarPortada(wrapEl) {
    if (!wrapEl) return false;
    const url = portadaUrl();
    if (!url) {
      wrapEl.classList.remove('show');
      return false;
    }
    let img = wrapEl.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      img.alt = 'Reino de Valdris';
      img.draggable = false;
      img.onerror = function () {
        wrapEl.classList.remove('show');
      };
      wrapEl.appendChild(img);
    }
    if (img.getAttribute('src') !== url) img.src = url;
    wrapEl.classList.add('show');
    return true;
  }

  function aplicarPrologoCompaneros() {
    if (typeof document === 'undefined') return;
    const cards = document.querySelectorAll('#prologo-companeros .comp-card[data-arquetipo]');
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const arq = card.getAttribute('data-arquetipo');
      const av = card.querySelector('.comp-av-ico');
      if (av && arq) {
        aplicarRetrato(av, arq, av.dataset.emoji || av.textContent || '🛡️');
      }
    }
  }

  function aplicarArteInicialDOM() {
    if (typeof document === 'undefined') return;
    const portWrap = document.getElementById('portada-art-wrap');
    if (portWrap) aplicarPortada(portWrap);
    aplicarPrologoCompaneros();

    const btnJumpIco = document.querySelector('#sk-jump .ico');
    if (btnJumpIco) renderIconoEnElemento(btnJumpIco, 'esquiva', '💨');
    const btnVidaIco = document.querySelector('#sk-vida .ico');
    if (btnVidaIco) renderIconoEnElemento(btnVidaIco, 'pocion_vida', '🧪');
    const btnManaIco = document.querySelector('#sk-mana .ico');
    if (btnManaIco) renderIconoEnElemento(btnManaIco, 'pocion_mana', '💧');
  }

  // ==================== Miniaturas de Armaduras, Piezas y Armas ====================
  const SLOT_TAG = { helmet: 'C', torso: 'P', gloves: 'G', pants: 'L', boots: 'B' };
  const ARM_SLOTS_5 = { helmet: true, torso: true, gloves: true, pants: true, boots: true };

  let _armManifest = {
    version: '1.0.0',
    modelo: 'Lykon/dreamshaper-xl-v2-turbo',
    sets: {},
    piezas: {},
    armas: {}
  };
  let _armCargado = false;
  let _armCargandoPromesa = null;
  const _armListeners = [];

  function escHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function armaduraSetUrl(setId) {
    if (!setId || !_armManifest || !_armManifest.sets) return null;
    return _armManifest.sets[setId] || null;
  }

  function armaduraPiezaUrl(setId, ranura) {
    if (!setId || !ranura || !_armManifest || !_armManifest.piezas) return null;
    return _armManifest.piezas[setId + '_' + ranura] || null;
  }

  function armaUrl(ranura, idx) {
    if (!ranura || idx == null || !_armManifest || !_armManifest.armas) return null;
    return _armManifest.armas[ranura + '_' + idx] || null;
  }

  function resolverSetIdDeObjeto(obj) {
    if (!obj) return null;
    if (obj.setId) return String(obj.setId);
    if (typeof ArmadurasLib !== 'undefined' && obj.armorLook != null && typeof ArmadurasLib.setPorLook === 'function') {
      const s = ArmadurasLib.setPorLook(obj.armorLook);
      if (s && s.id) return s.id;
    }
    return null;
  }

  function iconoEquipoHtml(obj, size) {
    if (!obj) return null;
    const sz = size || 28;
    const ranura = obj.ranura || '';
    const esHoja = obj.tipo === 'hoja' || /^hoja/i.test(obj.nombre || '');

    if (ranura === 'weapon' || ranura === 'shield') {
      const uArma = armaUrl(ranura, obj.idx);
      if (!uArma) return null;
      return '<span class="art-item-wrap" style="width:' + sz + 'px;height:' + sz + 'px">'
        + '<img class="art-item-img" src="' + escHtml(uArma) + '" alt="" width="' + sz + '" height="' + sz + '" loading="lazy" draggable="false">'
        + '</span>';
    }

    if (ARM_SLOTS_5[ranura]) {
      const setId = resolverSetIdDeObjeto(obj);
      if (!setId) return null;
      const uPieza = armaduraPiezaUrl(setId, ranura);
      if (uPieza) {
        return '<span class="art-item-wrap" style="width:' + sz + 'px;height:' + sz + 'px">'
          + '<img class="art-item-img" src="' + escHtml(uPieza) + '" alt="" width="' + sz + '" height="' + sz + '" loading="lazy" draggable="false">'
          + (esHoja ? '<i class="art-slot-tag hoja">📜</i>' : '')
          + '</span>';
      }
      const uSet = armaduraSetUrl(setId);
      if (uSet) {
        const tag = esHoja ? '📜' : (SLOT_TAG[ranura] || '');
        const tagCls = esHoja ? 'art-slot-tag hoja' : 'art-slot-tag';
        return '<span class="art-item-wrap" style="width:' + sz + 'px;height:' + sz + 'px">'
          + '<img class="art-item-img" src="' + escHtml(uSet) + '" alt="" width="' + sz + '" height="' + sz + '" loading="lazy" draggable="false">'
          + (tag ? '<i class="' + tagCls + '">' + tag + '</i>' : '')
          + '</span>';
      }
    }
    return null;
  }

  function tarjetaArmaduraImgHtml(setObj, size) {
    if (!setObj || !setObj.id) return null;
    const url = armaduraSetUrl(setObj.id);
    if (!url) return null;
    const sz = size || 76;
    const gInfo = (typeof ArmadurasLib !== 'undefined' && ArmadurasLib.GRADOS_INFO && ArmadurasLib.GRADOS_INFO[setObj.grado])
      ? ArmadurasLib.GRADOS_INFO[setObj.grado]
      : { borde: '#64748b', color: '#e2e8f0' };
    return '<div class="arm-set-thumb" style="width:' + sz + 'px;height:' + sz + 'px;border-color:' + escHtml(gInfo.borde) + '">'
      + '<img src="' + escHtml(url) + '" alt="' + escHtml(setObj.nombre || '') + '" loading="lazy" draggable="false">'
      + '<span class="arm-set-grado" style="color:' + escHtml(gInfo.color) + '">' + escHtml(setObj.grado || '') + '</span>'
      + '</div>';
  }

  function establecerManifestArmaduras(data) {
    if (data && typeof data === 'object') {
      _armManifest = {
        version: data.version || '1.0.0',
        modelo: data.modelo || '',
        sets: (data.sets && typeof data.sets === 'object') ? data.sets : {},
        piezas: (data.piezas && typeof data.piezas === 'object') ? data.piezas : {},
        armas: (data.armas && typeof data.armas === 'object') ? data.armas : {}
      };
    }
    _armCargado = true;
    for (let i = 0; i < _armListeners.length; i++) {
      try { _armListeners[i](_armManifest); } catch (_) {}
    }
    return _armManifest;
  }

  function cargarManifestArmaduras(url) {
    if (_armCargandoPromesa) return _armCargandoPromesa;
    const target = url || 'assets/armaduras/manifest.json';
    if (typeof fetch !== 'function') {
      _armCargado = true;
      return Promise.resolve(_armManifest);
    }
    _armCargandoPromesa = fetch(target, { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (json) { return establecerManifestArmaduras(json || {}); })
      .catch(function () {
        _armCargado = true;
        return _armManifest;
      });
    return _armCargandoPromesa;
  }

  function onArmadurasListo(fn) {
    if (typeof fn !== 'function') return;
    _armListeners.push(fn);
    if (_armCargado) {
      try { fn(_armManifest); } catch (_) {}
    }
  }

  return {
    SKILL_ICON_MAP: SKILL_ICON_MAP,
    WEAPON_ATTACK_ICON: WEAPON_ATTACK_ICON,
    RETRATO_ALIASES: RETRATO_ALIASES,
    SLOT_TAG: SLOT_TAG,
    resolverClaveRetrato: resolverClaveRetrato,
    resolverIconoId: resolverIconoId,
    iconoUrl: iconoUrl,
    retratoUrl: retratoUrl,
    portadaUrl: portadaUrl,
    establecerManifest: establecerManifest,
    cargarManifest: cargarManifest,
    onListo: onListo,
    renderIconoEnElemento: renderIconoEnElemento,
    aplicarRetrato: aplicarRetrato,
    aplicarPortada: aplicarPortada,
    aplicarPrologoCompaneros: aplicarPrologoCompaneros,
    aplicarArteInicialDOM: aplicarArteInicialDOM,
    getManifest: function () { return _manifest; },
    resolverSetIdDeObjeto: resolverSetIdDeObjeto,
    armaduraSetUrl: armaduraSetUrl,
    armaduraPiezaUrl: armaduraPiezaUrl,
    armaUrl: armaUrl,
    iconoEquipoHtml: iconoEquipoHtml,
    tarjetaArmaduraImgHtml: tarjetaArmaduraImgHtml,
    establecerManifestArmaduras: establecerManifestArmaduras,
    cargarManifestArmaduras: cargarManifestArmaduras,
    onArmadurasListo: onArmadurasListo,
    getManifestArmaduras: function () { return _armManifest; }
  };
});
