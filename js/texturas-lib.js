/*
 * texturas-lib.js — Biblioteca de texturas compartida por el visor y los creadores (pueblos, mazmorras, laberintos).
 * Expone window.TexturasLib.
 *
 * Las 50 texturas están en assets/texturas/<grupo>/tNN.jpg (512 px, repetibles) con su miniatura de 96 px en
 * assets/texturas/miniaturas/<grupo>-tNN.jpg. Una textura se nombra 'grupo/tNN' (p. ej. 'suelo/t08').
 *
 *   TexturasLib.textura(THREE, 'suelo/t08', { repetir: [2, 2] })   textura de THREE (en caché; carga sola)
 *   TexturasLib.imagen('piedra/t01')                                Promise<HTMLImageElement>
 *   TexturasLib.atlasConBandas(lienzoBase, { 0: 'tejados/t01' }, 4)  Promise<canvas>: pinta fotos en bandas horizontales
 *   TexturasLib.selector(contenedor, { etiqueta, grupos, valor, alCambiar })   botón con miniatura + rejilla emergente
 */
(function (root) {
  'use strict';

  const BASE = 'assets/texturas/';

  const CATALOGO = {
    tejados: { nombre: 'Tejados', t01: 'Teja árabe roja', t02: 'Pizarra', t03: 'Tablillas de madera', t04: 'Teja con musgo', t05: 'Chapa ondulada',
      t06: 'Tejas de asfalto', t07: 'Paja', t08: 'Teja plana', t09: 'Escamas de barro', t10: 'Losas con liquen' },
    madera: { nombre: 'Madera', t01: 'Tablón con nudos', t02: 'Troncos (testas)', t03: 'Tablón gris', t04: 'Tablón con musgo', t05: 'Viga oscura',
      t06: 'Pino', t07: 'Tablón claro', t08: 'Tronco con corteza', t09: 'Tablón tallado', t10: 'Tablón quemado' },
    suelo: { nombre: 'Suelo', t01: 'Cantos rodados', t02: 'Adoquín', t03: 'Tierra con grava', t04: 'Rocas y musgo', t05: 'Adoquín con hierba',
      t06: 'Cantos grandes', t07: 'Tierra con piedras', t08: 'Senda empedrada', t09: 'Lajas', t10: 'Rocas sueltas' },
    piedra: { nombre: 'Piedra', t01: 'Mampostería', t02: 'Sillar claro', t03: 'Pizarra apilada', t04: 'Arenisca', t05: 'Cantos',
      t06: 'Sillar oscuro', t07: 'Encalado', t08: 'Granito', t09: 'Travertino', t10: 'Piedra y ladrillo' },
    agua: { nombre: 'Agua', t01: 'Piscina', t02: 'Mar profundo', t03: 'Agua sobre cantos', t04: 'Oleaje', t05: 'Lluvia',
      t06: 'Charca con algas', t07: 'Rápidos', t08: 'Orilla de arena', t09: 'Hielo', t10: 'Agua oscura' }
  };
  const GRUPOS = Object.keys(CATALOGO);

  const valida = id => {
    if (typeof id !== 'string') return false;
    const [g, t] = id.split('/');
    return /^t\d\d$/.test(t || '') && !!(CATALOGO[g] && CATALOGO[g][t]);
  };
  const ruta = id => BASE + id + '.jpg';
  const miniatura = id => BASE + 'miniaturas/' + id.replace('/', '-') + '.jpg';
  const nombre = id => valida(id) ? CATALOGO[id.split('/')[0]][id.split('/')[1]] : '';
  const lista = grupo => Object.keys(CATALOGO[grupo] || {}).filter(k => k !== 'nombre').map(t => grupo + '/' + t);

  // Texturas de THREE en caché por (id, repetición). TextureLoader rellena la imagen al llegar y la sube sola.
  const cacheTex = new Map();
  function textura(THREE, id, opts = {}) {
    if (!THREE || !valida(id)) return null;
    const rep = opts.repetir || [1, 1];
    const clave = id + '|' + rep[0] + '|' + rep[1] + '|' + (opts.flipY === false ? 0 : 1);
    if (cacheTex.has(clave)) return cacheTex.get(clave);
    const t = new THREE.TextureLoader().load(ruta(id));
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rep[0], rep[1]);
    if (opts.flipY === false) t.flipY = false;
    if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = opts.anisotropia || 8;
    cacheTex.set(clave, t);
    return t;
  }

  const cacheImg = new Map();
  function imagen(id) {
    if (!valida(id)) return Promise.reject(new Error('Textura desconocida: ' + id));
    if (!cacheImg.has(id)) {
      cacheImg.set(id, new Promise((ok, mal) => {
        const im = new Image();
        im.onload = () => ok(im);
        im.onerror = () => { cacheImg.delete(id); mal(new Error('No se pudo cargar ' + id)); };
        im.src = ruta(id);
      }));
    }
    return cacheImg.get(id);
  }

  /**
   * Copia del lienzo base con algunas bandas horizontales sustituidas por fotos repetidas a lo ancho.
   * bandas: { índice: id } con índice 0 arriba; nBandas: cuántas bandas iguales tiene el atlas.
   */
  async function atlasConBandas(base, bandas, nBandas) {
    const w = base.width, h = base.height, alto = h / nBandas;
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    ctx.drawImage(base, 0, 0);
    for (const [i, id] of Object.entries(bandas)) {
      if (!valida(id)) continue;
      const im = await imagen(id);
      for (let x = 0; x < w; x += alto) ctx.drawImage(im, x, i * alto, alto, alto);
    }
    return cv;
  }

  // ------------------------------------------------------------------------------------------------------------
  // Selector: botón con la miniatura actual; al pulsarlo se abre una rejilla con las texturas de los grupos.
  // Pensado para el dedo: miniaturas de 64 px, rejilla que se adapta al ancho y se cierra al tocar fuera.
  // ------------------------------------------------------------------------------------------------------------
  let estiloPuesto = false;
  function ponerEstilo() {
    if (estiloPuesto || typeof document === 'undefined') return;
    estiloPuesto = true;
    const css = document.createElement('style');
    css.textContent = `
      .tx-sel { display:flex; align-items:center; gap:8px; margin:4px 0; font:12px system-ui,sans-serif; color:#e2e8f0; }
      .tx-sel > span { flex:1; min-width:0; }
      .tx-sel button { display:flex; align-items:center; gap:6px; min-height:36px; padding:3px 8px 3px 3px; border-radius:7px;
        border:1px solid #475569; background:#0f172a; color:#e2e8f0; cursor:pointer; font:11px system-ui,sans-serif; max-width:62%; }
      .tx-sel button i { width:30px; height:30px; border-radius:5px; flex:none; background:#1e293b center/cover; border:1px solid #334155; }
      .tx-sel button b { font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .tx-modal { position:fixed; inset:0; z-index:9999; background:rgba(2,6,23,.72); display:flex; align-items:center; justify-content:center;
        padding:12px; padding-bottom:max(12px, env(safe-area-inset-bottom)); }
      .tx-caja { width:min(560px, 100%); max-height:min(80vh, 640px); display:flex; flex-direction:column; background:#0f172a;
        border:1px solid #334155; border-radius:12px; box-shadow:0 20px 50px rgba(0,0,0,.6); overflow:hidden; font:13px system-ui,sans-serif; color:#e2e8f0; }
      .tx-cab { display:flex; align-items:center; gap:8px; padding:10px 12px; border-bottom:1px solid #1e293b; }
      .tx-cab b { flex:1; }
      /* Cada página tiene sus propios estilos de botón: aquí se anulan para que el selector se vea igual en todas */
      .tx-modal button, .tx-sel button { width:auto !important; flex:none !important; margin:0 !important; text-transform:none !important; letter-spacing:normal !important; }
      .tx-rej button { width:100% !important; }
      .tx-cab button, .tx-pest button { min-height:34px; padding:4px 10px; border-radius:7px; border:1px solid #334155; background:#1e293b; color:#e2e8f0; cursor:pointer; }
      .tx-pest { display:flex; gap:6px; padding:8px 12px; overflow-x:auto; border-bottom:1px solid #1e293b; }
      .tx-pest button.on { background:#2563eb; border-color:#60a5fa; }
      .tx-rej { display:grid; grid-template-columns:repeat(auto-fill, minmax(76px, 1fr)); gap:8px; padding:12px; overflow-y:auto; }
      .tx-rej button { display:flex; flex-direction:column; align-items:center; gap:4px; padding:4px; border-radius:8px; border:2px solid transparent;
        background:#111c33; color:#cbd5e1; cursor:pointer; font:10px system-ui,sans-serif; }
      .tx-rej button.on { border-color:#facc15; }
      .tx-rej button i { width:64px; height:64px; border-radius:6px; background:#1e293b center/cover; }
      .tx-rej button.def i { display:flex; align-items:center; justify-content:center; font-style:normal; font-size:22px; }`;
    document.head.appendChild(css);
  }

  function abrirRejilla({ titulo, grupos, valor, conDefecto = true, alElegir }) {
    ponerEstilo();
    const modal = document.createElement('div');
    modal.className = 'tx-modal';
    let grupo = valida(valor) && grupos.includes(valor.split('/')[0]) ? valor.split('/')[0] : grupos[0];
    const pintar = () => {
      modal.innerHTML = `<div class="tx-caja" role="dialog" aria-label="${titulo}">
        <div class="tx-cab"><b>${titulo}</b><button data-cerrar>✕</button></div>
        ${grupos.length > 1 ? `<div class="tx-pest">${grupos.map(g => `<button data-grupo="${g}" class="${g === grupo ? 'on' : ''}">${CATALOGO[g].nombre}</button>`).join('')}</div>` : ''}
        <div class="tx-rej">
          ${conDefecto ? `<button data-id="" class="def ${!valor ? 'on' : ''}"><i>↺</i>Por defecto</button>` : ''}
          ${lista(grupo).map(id => `<button data-id="${id}" class="${id === valor ? 'on' : ''}" title="${nombre(id)}"><i style="background-image:url('${miniatura(id)}')"></i>${id.split('/')[1].replace('t', 'T-')} ${nombre(id)}</button>`).join('')}
        </div></div>`;
    };
    pintar();
    modal.addEventListener('click', e => {
      if (e.target === modal || e.target.closest('[data-cerrar]')) { modal.remove(); return; }
      const g = e.target.closest('[data-grupo]');
      if (g) { grupo = g.dataset.grupo; pintar(); return; }
      const b = e.target.closest('[data-id]');
      if (b) { modal.remove(); alElegir(b.dataset.id || null); }
    });
    document.body.appendChild(modal);
  }

  function selector(contenedor, { etiqueta, grupos = GRUPOS, valor = null, alCambiar = () => {} }) {
    ponerEstilo();
    const fila = document.createElement('div');
    fila.className = 'tx-sel';
    fila.innerHTML = `<span>${etiqueta}</span><button type="button"><i></i><b></b></button>`;
    const boton = fila.querySelector('button');
    let actual = valida(valor) ? valor : null;
    const mostrar = () => {
      fila.querySelector('i').style.backgroundImage = actual ? `url('${miniatura(actual)}')` : '';
      fila.querySelector('b').textContent = actual ? nombre(actual) : 'Por defecto';
      boton.title = actual ? actual : 'Textura del estilo';
    };
    mostrar();
    boton.addEventListener('click', () => abrirRejilla({
      titulo: etiqueta, grupos, valor: actual,
      alElegir: id => { actual = id; mostrar(); alCambiar(id); }
    }));
    if (contenedor) contenedor.appendChild(fila);
    return { elemento: fila, fijar: v => { actual = valida(v) ? v : null; mostrar(); }, valor: () => actual };
  }

  const TexturasLib = { BASE, CATALOGO, GRUPOS, valida, ruta, miniatura, nombre, lista, textura, imagen, atlasConBandas, selector, abrirRejilla };
  if (typeof module !== 'undefined' && module.exports) module.exports = TexturasLib;
  if (root) root.TexturasLib = TexturasLib;
})(typeof window !== 'undefined' ? window : globalThis);
