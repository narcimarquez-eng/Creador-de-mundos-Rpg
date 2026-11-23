/*
 * pbr-lib.js — Cargador progresivo cero-404 para mapas PBR (Normal + Roughness) y skyboxes 360°.
 * Si assets/pbr/manifest.json está vacío o no existen los archivos, conserva la renderización actual sin errores.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PbrLib = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  let _manifest = {
    version: '1.0.0',
    modelos: {},
    terreno: null,
    texturas: {},
    cielos: {}
  };
  let _cargado = false;
  let _cargandoPromesa = null;
  const _listeners = [];
  const _pendientes = [];
  const _texCache = new Map();

  function normalizarId(idORuta) {
    let s = String(idORuta || '').trim().replace(/\\/g, '/');
    const idx = s.indexOf('assets/texturas/');
    if (idx !== -1) s = s.slice(idx + 'assets/texturas/'.length);
    s = s.replace(/^\/+/, '');
    s = s.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    return s;
  }

  function mapasDe(idORuta) {
    const id = normalizarId(idORuta);
    if (!id || !_manifest || !_manifest.texturas) return null;
    return _manifest.texturas[id] || null;
  }

  function terrenoUrls() {
    return (_manifest && _manifest.terreno) || null;
  }

  function cieloUrl(preset) {
    if (!_manifest || !_manifest.cielos) return null;
    return _manifest.cielos[preset] || null;
  }

  function cargarTexturaLineal(THREE, url, rep, anisotropia) {
    if (!THREE || typeof THREE.TextureLoader !== 'function' || !url) return null;
    const rx = (rep && rep[0]) || 1;
    const ry = (rep && rep[1]) || 1;
    const clave = url + '|' + rx + '|' + ry;
    if (_texCache.has(clave)) return _texCache.get(clave);
    const tex = new THREE.TextureLoader().load(url);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    if (tex.repeat && typeof tex.repeat.set === 'function') tex.repeat.set(rx, ry);
    if (THREE.NoColorSpace) tex.colorSpace = THREE.NoColorSpace;
    tex.anisotropy = anisotropia || 8;
    _texCache.set(clave, tex);
    return tex;
  }

  function aplicarEnMaterial(THREE, mat, idORuta, opts) {
    opts = opts || {};
    if (!THREE || !mat) return false;
    const soportaPbr = Boolean(mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial || ('normalMap' in mat));
    if (!soportaPbr) return false;

    if (!_cargado) {
      _pendientes.push({ THREE: THREE, mat: mat, idORuta: idORuta, opts: opts });
      return false;
    }

    const info = mapasDe(idORuta);
    if (!info || !info.n) return false;

    const rep = opts.repetir ||
      (mat.map && mat.map.repeat ? [mat.map.repeat.x || 1, mat.map.repeat.y || 1] : [1, 1]);
    const aniso = opts.anisotropia || (mat.map && mat.map.anisotropy) || 8;
    const nTex = cargarTexturaLineal(THREE, info.n, rep, aniso);
    if (!nTex) return false;

    mat.normalMap = nTex;
    const ns = (opts.normalScale !== undefined) ? opts.normalScale : 0.9;
    if (mat.normalScale && typeof mat.normalScale.set === 'function') {
      mat.normalScale.set(ns, ns);
    } else if (typeof THREE.Vector2 === 'function') {
      mat.normalScale = new THREE.Vector2(ns, ns);
    }

    if (info.r) {
      const rTex = cargarTexturaLineal(THREE, info.r, rep, aniso);
      if (rTex) {
        mat.roughnessMap = rTex;
        mat.roughness = (opts.roughnessMult !== undefined) ? opts.roughnessMult : 1.0;
      }
    }

    if (!opts.conservarBump) {
      mat.bumpMap = null;
    }
    mat.needsUpdate = true;
    return true;
  }

  function vaciarPendientes() {
    while (_pendientes.length > 0) {
      const item = _pendientes.shift();
      try {
        aplicarEnMaterial(item.THREE, item.mat, item.idORuta, item.opts);
      } catch (_) {}
    }
  }

  function establecerManifest(data) {
    if (data && typeof data === 'object') {
      _manifest = {
        version: data.version || '1.0.0',
        modelos: (data.modelos && typeof data.modelos === 'object') ? data.modelos : {},
        terreno: data.terreno || null,
        texturas: (data.texturas && typeof data.texturas === 'object') ? data.texturas : {},
        cielos: (data.cielos && typeof data.cielos === 'object') ? data.cielos : {}
      };
    }
    _cargado = true;
    vaciarPendientes();
    for (let i = 0; i < _listeners.length; i++) {
      try { _listeners[i](_manifest); } catch (_) {}
    }
    return _manifest;
  }

  function cargarManifest(url) {
    if (_cargandoPromesa) return _cargandoPromesa;
    const target = url || 'assets/pbr/manifest.json';
    if (typeof fetch !== 'function') {
      _cargado = true;
      return Promise.resolve(_manifest);
    }
    _cargandoPromesa = fetch(target, { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (json) { return establecerManifest(json || {}); })
      .catch(function () { return establecerManifest({}); });
    return _cargandoPromesa;
  }

  function onListo(fn) {
    if (typeof fn !== 'function') return;
    _listeners.push(fn);
    if (_cargado) {
      try { fn(_manifest); } catch (_) {}
    }
  }

  return {
    normalizarId: normalizarId,
    mapasDe: mapasDe,
    terrenoUrls: terrenoUrls,
    cieloUrl: cieloUrl,
    aplicarEnMaterial: aplicarEnMaterial,
    establecerManifest: establecerManifest,
    cargarManifest: cargarManifest,
    onListo: onListo,
    getManifest: function () { return _manifest; },
    estaCargado: function () { return _cargado; }
  };
});
