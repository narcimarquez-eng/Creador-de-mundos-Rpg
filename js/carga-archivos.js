// =============================================================================
// carga-archivos.js - Gestor de archivos en carga y cargados con indicador de peso en Megabytes
// y panel desplegable interactivo (desplegado por defecto, minimizable y restaurable)
// =============================================================================

(function (global) {
  'use strict';

  // 1. Diccionario precalculado de tamaños de archivos del proyecto (en bytes)
  const TABLA_PESOS_LOCALES = {
  "assets/agua/waternormals.jpg": 248813,
  "waternormals.jpg": 248813,
  "assets/arboles/tex/corteza_abedul.jpg": 15513,
  "corteza_abedul.jpg": 15513,
  "assets/arboles/tex/corteza_pino.jpg": 16565,
  "corteza_pino.jpg": 16565,
  "assets/arboles/tex/corteza_roble.jpg": 18692,
  "corteza_roble.jpg": 18692,
  "assets/arboles/tex/hoja_alamo.png": 15290,
  "hoja_alamo.png": 15290,
  "assets/arboles/tex/hoja_pino.png": 22959,
  "hoja_pino.png": 22959,
  "assets/arboles/tex/hoja_roble.png": 20259,
  "hoja_roble.png": 20259,
  "assets/terreno/atlas.jpg": 1613125,
  "atlas.jpg": 1613125,
  "assets/terreno/atlas.json": 1688,
  "atlas.json": 1688,
  "assets/vegetacion/arbusto.glb": 9632,
  "arbusto.glb": 9632,
  "estudio-armaduras/catalogo.json": 28685,
  "catalogo.json": 28685,
  "glb/cabanas/cabana_1_troncos_clasica.glb": 3469232,
  "cabana_1_troncos_clasica.glb": 3469232,
  "glb/cabanas/cabana_2_posada_dos_plantas.glb": 4710108,
  "cabana_2_posada_dos_plantas.glb": 4710108,
  "glb/cabanas/cabana_3_pescador_pilotes.glb": 2938948,
  "cabana_3_pescador_pilotes.glb": 2938948,
  "glb/cabanas/cabana_4_torre_de_vigia.glb": 3395484,
  "cabana_4_torre_de_vigia.glb": 3395484,
  "glb/cabanas/cabana_5_redonda.glb": 3070168,
  "cabana_5_redonda.glb": 3070168,
  "glb/cabana_1_troncos_clasica.glb": 3469232,
  "glb/cabana_2_posada_dos_plantas.glb": 4710108,
  "glb/cabana_3_pescador_pilotes.glb": 2938948,
  "glb/cabana_4_torre_de_vigia.glb": 3395484,
  "glb/cabana_5_redonda.glb": 3070168,
  "glb/mazmorras/mazmorra1.glb": 18504700,
  "mazmorra1.glb": 18504700,
  "npc/aldeanos/aldeano.glb": 4073784,
  "aldeano.glb": 4073784,
  "npc/gurus/guru-1-cerca.glb": 913388,
  "guru-1-cerca.glb": 913388,
  "npc/gurus/guru-1-lejos.glb": 557504,
  "guru-1-lejos.glb": 557504,
  "npc/gurus/guru-1.glb": 6149864,
  "guru-1.glb": 6149864,
  "npc/gurus/guru-2-cerca.glb": 1025940,
  "guru-2-cerca.glb": 1025940,
  "npc/gurus/guru-2-lejos.glb": 508948,
  "guru-2-lejos.glb": 508948,
  "npc/gurus/guru-2.glb": 5527208,
  "guru-2.glb": 5527208,
  "npc/gurus/guru-3-cerca.glb": 1131844,
  "guru-3-cerca.glb": 1131844,
  "npc/gurus/guru-3-lejos.glb": 588304,
  "guru-3-lejos.glb": 588304,
  "npc/gurus/guru-3.glb": 7950068,
  "guru-3.glb": 7950068,
  "npc/gurus/guru-4-cerca.glb": 936000,
  "guru-4-cerca.glb": 936000,
  "npc/gurus/guru-4-lejos.glb": 518328,
  "guru-4-lejos.glb": 518328,
  "npc/gurus/guru-4.glb": 6321420,
  "guru-4.glb": 6321420,
  "npc/gurus/guru-5-cerca.glb": 843132,
  "guru-5-cerca.glb": 843132,
  "npc/gurus/guru-5-lejos.glb": 500792,
  "guru-5-lejos.glb": 500792,
  "npc/gurus/guru-5.glb": 5801328,
  "guru-5.glb": 5801328,
  "tools/package-lock.json": 40759,
  "package-lock.json": 40759,
  "tools/package.json": 464,
  "package.json": 464,
  "tools/vendor/ez-tree/package.json": 18,
  "tools/vendor/ez-tree/presets/ash_large.json": 1474,
  "ash_large.json": 1474,
  "tools/vendor/ez-tree/presets/ash_medium.json": 1411,
  "ash_medium.json": 1411,
  "tools/vendor/ez-tree/presets/ash_small.json": 1413,
  "ash_small.json": 1413,
  "tools/vendor/ez-tree/presets/aspen_large.json": 1526,
  "aspen_large.json": 1526,
  "tools/vendor/ez-tree/presets/aspen_medium.json": 1406,
  "aspen_medium.json": 1406,
  "tools/vendor/ez-tree/presets/aspen_small.json": 1495,
  "aspen_small.json": 1495,
  "tools/vendor/ez-tree/presets/bush_1.json": 1497,
  "bush_1.json": 1497,
  "tools/vendor/ez-tree/presets/bush_2.json": 1601,
  "bush_2.json": 1601,
  "tools/vendor/ez-tree/presets/bush_3.json": 1673,
  "bush_3.json": 1673,
  "tools/vendor/ez-tree/presets/oak_large.json": 1420,
  "oak_large.json": 1420,
  "tools/vendor/ez-tree/presets/oak_medium.json": 1418,
  "oak_medium.json": 1418,
  "tools/vendor/ez-tree/presets/oak_small.json": 1419,
  "oak_small.json": 1419,
  "tools/vendor/ez-tree/presets/pine_large.json": 1541,
  "pine_large.json": 1541,
  "tools/vendor/ez-tree/presets/pine_medium.json": 1405,
  "pine_medium.json": 1405,
  "tools/vendor/ez-tree/presets/pine_small.json": 1394,
  "pine_small.json": 1394,
  "tools/vendor/ez-tree/presets/trellis.json": 1697,
  "trellis.json": 1697
};

  // 2. Formateador de peso en Megabytes
  function formatearMB(bytes) {
    if (typeof bytes !== 'number' || isNaN(bytes) || bytes <= 0) return '0.00 MB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 10) return mb.toFixed(1) + ' MB';
    if (mb >= 0.01) return mb.toFixed(2) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
  }

  // 3. Extracción de nombre limpio y carpeta temática
  function parsearRuta(url) {
    if (!url || typeof url !== 'string') return { nombre: 'desconocido', ruta: '', carpeta: 'otro', tipo: 'desconocido' };
    const limpia = url.split('?')[0].split('#')[0];
    const partes = limpia.replace(/\\/g, '/').split('/');
    const nombre = partes.pop() || limpia;
    const ruta = partes.join('/');
    
    let carpeta = 'otro';
    const low = limpia.toLowerCase();
    if (low.includes('mazmorra')) carpeta = 'mazmorra';
    else if (low.includes('cabana') || low.includes('cabaña')) carpeta = 'cabaña';
    else if (low.includes('guru') || low.includes('npc') || low.includes('aldeano')) carpeta = 'npc';
    else if (low.includes('terreno') || low.includes('atlas')) carpeta = 'terreno';
    else if (low.includes('agua')) carpeta = 'agua';
    else if (low.includes('vegetacion') || low.includes('arbol')) carpeta = 'vegetación';
    else if (low.includes('enemigo') || low.includes('monster')) carpeta = 'monstruos';

    let tipo = 'archivo';
    if (low.endsWith('.glb') || low.endsWith('.gltf')) tipo = '3D / GLB';
    else if (low.endsWith('.jpg') || low.endsWith('.jpeg') || low.endsWith('.png') || low.endsWith('.webp')) tipo = 'Textura';
    else if (low.endsWith('.json')) tipo = 'Datos JSON';
    else if (low.endsWith('.js')) tipo = 'Script';
    else if (low.endsWith('.mp3') || low.endsWith('.ogg') || low.endsWith('.wav')) tipo = 'Audio';

    return { nombre, ruta, carpeta, tipo };
  }

  // 4. Búsqueda de tamaño en bytes
  function buscarTamanoBytes(url, nombre) {
    if (!url) return 0;
    const limpia = url.split('?')[0].split('#')[0].replace(/\\/g, '/');
    
    // Probar coincidencias en la tabla local
    if (TABLA_PESOS_LOCALES[limpia]) return TABLA_PESOS_LOCALES[limpia];
    if (nombre && TABLA_PESOS_LOCALES[nombre]) return TABLA_PESOS_LOCALES[nombre];

    // Buscar si alguna clave de la tabla coincide con el final de la URL
    for (const key in TABLA_PESOS_LOCALES) {
      if (limpia.endsWith(key) || key.endsWith(nombre)) {
        return TABLA_PESOS_LOCALES[key];
      }
    }

    // Intentar buscar en performance timing de la ventana del navegador
    if (typeof performance !== 'undefined' && typeof performance.getEntriesByName === 'function') {
      try {
        const perf = performance.getEntriesByName(url);
        if (perf && perf.length) {
          const e = perf[perf.length - 1];
          const sz = e.encodedBodySize || e.decodedBodySize || e.transferSize;
          if (sz && sz > 0) return sz;
        }
      } catch (err) {}
    }

    return 0;
  }

  // 5. Clase principal del Gestor de Carga
  class GestorCargaArchivos {
    constructor() {
      this.archivos = new Map(); // url -> Objeto Archivo
      this.abierto = true;       // Desplegado por defecto
      this.visible = true;
      this.domMontado = false;
      this.listeners = new Set();
      this.ultimaActualizacion = 0;
      this.totalMBHistorico = 0;
    }

    // Registrar inicio de carga de un archivo
    registrarInicio(url) {
      if (!url || typeof url !== 'string' || url.startsWith('blob:') || url.startsWith('data:')) return null;
      const parsed = parsearRuta(url);
      const id = parsed.nombre;
      let rec = this.archivos.get(id);

      if (!rec) {
        const bytes = buscarTamanoBytes(url, parsed.nombre);
        rec = {
          id,
          url,
          nombre: parsed.nombre,
          ruta: parsed.ruta,
          carpeta: parsed.carpeta,
          tipo: parsed.tipo,
          bytes: bytes,
          cargadoBytes: 0,
          estado: 'cargando', // 'cargando' | 'cargado' | 'error'
          t0: (typeof performance !== 'undefined') ? performance.now() : Date.now(),
          tFin: null
        };
        this.archivos.set(id, rec);
      } else {
        rec.estado = 'cargando';
        if (rec.bytes <= 0) rec.bytes = buscarTamanoBytes(url, parsed.nombre);
      }

      this.solicitarActualizacion();
      return rec;
    }

    // Registrar finalización con éxito o error
    registrarFin(url, ok = true, error = null) {
      if (!url) return;
      const parsed = parsearRuta(url);
      const id = parsed.nombre;
      let rec = this.archivos.get(id);

      if (!rec) {
        rec = this.registrarInicio(url);
      }

      if (rec) {
        rec.estado = ok ? 'cargado' : 'error';
        rec.error = error;
        rec.tFin = (typeof performance !== 'undefined') ? performance.now() : Date.now();

        // Si no teníamos el tamaño en bytes, intentar recuperarlo de performance timing
        if (rec.bytes <= 0) {
          rec.bytes = buscarTamanoBytes(url, parsed.nombre);
        }
        if (ok && rec.bytes > 0) {
          rec.cargadoBytes = rec.bytes;
        }
      }

      this.solicitarActualizacion();
      return rec;
    }

    // Registrar progreso en tiempo real si el cargador emite bytes
    registrarProgreso(url, cargadoBytes, totalBytes) {
      if (!url) return;
      const parsed = parsearRuta(url);
      const id = parsed.nombre;
      let rec = this.archivos.get(id);
      if (!rec) rec = this.registrarInicio(url);

      if (rec) {
        if (totalBytes && totalBytes > 0) rec.bytes = totalBytes;
        if (cargadoBytes && cargadoBytes > 0) rec.cargadoBytes = cargadoBytes;
        this.solicitarActualizacion();
      }
    }

    // Aislamiento estricto de memoria al entrar a la mazmorra:
    // elimina de la lista de descargas activas y en memoria cualquier archivo del supramundo exterior
    aislarMazmorra(urlDungeon) {
      const dungeonUrl = (urlDungeon || 'mazmorra').toLowerCase();
      for (const [id, rec] of this.archivos.entries()) {
        const u = (rec.url || id || '').toLowerCase();
        if (u.startsWith('blob:') || u.startsWith('data:') || (!u.includes('mazmorra') && !u.includes(dungeonUrl))) {
          this.archivos.delete(id);
        }
      }
      this.solicitarActualizacion();
    }

    // Calcular resumen de totales y porcentajes
    obtenerResumen() {
      const ahora = (typeof performance !== 'undefined') ? performance.now() : Date.now();
      for (const [id, a] of this.archivos.entries()) {
        if (a.estado === 'cargando' && a.t0 && (ahora - a.t0 > 12000)) {
          a.estado = 'cargado';
          a.cargadoBytes = a.bytes || 1024;
        }
      }
      const lista = Array.from(this.archivos.values());
      const enCarga = lista.filter(a => a.estado === 'cargando');
      const cargados = lista.filter(a => a.estado === 'cargado');
      const errores = lista.filter(a => a.estado === 'error');

      let pesoTotalBytes = 0;
      let pesoCargadoBytes = 0;

      lista.forEach(a => {
        const b = a.bytes || 0;
        pesoTotalBytes += b;
        if (a.estado === 'cargado') {
          pesoCargadoBytes += b;
        } else if (a.estado === 'cargando') {
          pesoCargadoBytes += Math.min(b, a.cargadoBytes || 0);
        }
      });

      const pesoTotalMB = pesoTotalBytes / (1024 * 1024);
      const pesoCargadoMB = pesoCargadoBytes / (1024 * 1024);
      const pct = pesoTotalBytes > 0 ? Math.min(100, Math.round((pesoCargadoBytes / pesoTotalBytes) * 100)) : 100;

      return {
        total: lista.length,
        enCargaCount: enCarga.length,
        cargadosCount: cargados.length,
        erroresCount: errores.length,
        enCarga,
        cargados,
        errores,
        pesoTotalBytes,
        pesoCargadoBytes,
        pesoTotalMB,
        pesoCargadoMB,
        pct,
        todoListo: enCarga.length === 0 && lista.length > 0
      };
    }

    // Solicitar actualización visual throttleada
    solicitarActualizacion() {
      if (typeof window === 'undefined') return;
      if (this._reqId) return;
      this._reqId = requestAnimationFrame(() => {
        this._reqId = null;
        this.actualizarDOM();
      });
    }

    // Conectar a Three.js DefaultLoadingManager
    conectarManager(manager) {
      if (!manager) return;
      const g = manager;
      const origStart = g.itemStart ? g.itemStart.bind(g) : null;
      const origEnd = g.itemEnd ? g.itemEnd.bind(g) : null;
      const origError = g.itemError ? g.itemError.bind(g) : null;

      g.itemStart = url => {
        if (!url || typeof url !== 'string' || url.startsWith('blob:') || url.startsWith('data:')) return;
        this.registrarInicio(url);
        if (origStart) origStart(url);
      };

      g.itemEnd = url => {
        this.registrarFin(url, true);
        if (origEnd) origEnd(url);
      };

      g.itemError = url => {
        this.registrarFin(url, false, 'Error de carga');
        if (origError) origError(url);
      };
    }

    // Conectar al API fetch para capturar descargas
    conectarFetch() {
      if (typeof window === 'undefined' || !window.fetch) return;
      const origFetch = window.fetch;
      const self = this;

      window.fetch = async function (...args) {
        const input = args[0];
        const url = (typeof input === 'string') ? input : (input && input.url ? input.url : '');
        
        // Solo registrar archivos de assets (GLB, texturas, audios, json del mundo)
        const esAsset = /\.(glb|gltf|jpg|png|webp|mp3|ogg|json)/i.test(url);
        if (esAsset) {
          self.registrarInicio(url);
        }

        try {
          const resp = await origFetch.apply(this, args);
          if (esAsset) {
            const cl = resp.headers ? resp.headers.get('content-length') : null;
            if (cl) {
              const bytes = parseInt(cl, 10);
              if (bytes > 0) {
                const rec = self.archivos.get(parsearRuta(url).nombre);
                if (rec) rec.bytes = bytes;
              }
            }
            self.registrarFin(url, resp.ok);
          }
          return resp;
        } catch (err) {
          if (esAsset) self.registrarFin(url, false, err.message);
          throw err;
        }
      };
    }

    // Escanear recursos ya cargados por el navegador
    escanearRecursosPrevios() {
      if (typeof performance === 'undefined' || typeof performance.getEntriesByType !== 'function') return;
      try {
        const entries = performance.getEntriesByType('resource');
        entries.forEach(e => {
          if (/\.(glb|gltf|jpg|png|webp|mp3|ogg)/i.test(e.name)) {
            const parsed = parsearRuta(e.name);
            if (!this.archivos.has(parsed.nombre)) {
              const rec = this.registrarInicio(e.name);
              const sz = e.encodedBodySize || e.decodedBodySize || e.transferSize;
              if (sz > 0) rec.bytes = sz;
              this.registrarFin(e.name, true);
            }
          }
        });
      } catch (err) {}
    }

    // Inyectar o enlazar el panel en el contenedor DOM
    montar(contenedorId = 'carga') {
      if (typeof document === 'undefined') return;
      const contenedor = document.getElementById(contenedorId);
      if (!contenedor) return;

      this.contenedor = contenedor;
      contenedor.innerHTML = `
        <details id="carga-desplegable" open>
          <summary class="c-tit">
            <div class="c-tit-izq">
              <span id="carga-icono-estado" class="c-icono-spin">⏳</span>
              <span id="carga-tit-texto">Cargando recursos</span>
              <span id="carga-badge-mb" class="c-badge-mb">0.00 MB</span>
            </div>
            <div class="c-tit-der">
              <b id="carga-pct">0 %</b>
              <button id="carga-btn-cerrar" type="button" title="Cerrar / Ocultar panel" class="c-btn-cerrar">×</button>
            </div>
          </summary>
          
          <div class="c-barra"><i id="carga-barra" style="width:0%"></i></div>
          <div id="carga-det" class="c-subinfo">Iniciando motor gráfico...</div>

          <div class="c-stats-row">
            <span id="c-stat-encarga" class="c-stat-tag tag-encarga">⏳ 0 en carga</span>
            <span id="c-stat-cargados" class="c-stat-tag tag-ok">✓ 0 cargados</span>
            <span id="c-stat-peso" class="c-stat-tag tag-peso">📦 0.00 MB</span>
          </div>

          <div id="carga-lista-archivos" class="c-lista-scroll" tabindex="0" role="region" aria-label="Lista de archivos en carga y cargados">
            <!-- Items de archivos dinámicos -->
          </div>

          <div class="c-pie-acciones">
            <span id="carga-pie-info">Total en memoria: <b id="carga-pie-peso">0.00 MB</b></span>
            <button id="carga-btn-toggle" type="button" class="c-btn-accion" title="Plegar o desplegar la lista">Plegar ▲</button>
          </div>
        </details>
      `;

      // Botón flotante para restaurar/reabrir cuando el usuario cierre el panel
      let pillReabrir = document.getElementById('carga-pill-reabrir');
      if (!pillReabrir) {
        pillReabrir = document.createElement('button');
        pillReabrir.id = 'carga-pill-reabrir';
        pillReabrir.type = 'button';
        pillReabrir.className = 'c-pill-reabrir';
        pillReabrir.innerHTML = '📦 Recursos: <b id="carga-pill-mb">0.00 MB</b> <span class="c-pill-hint">[Ver archivos]</span>';
        pillReabrir.title = 'Mostrar lista de archivos cargados y peso en megas';
        pillReabrir.style.display = 'none';
        if (contenedor.parentNode) {
          contenedor.parentNode.insertBefore(pillReabrir, contenedor.nextSibling);
        } else {
          document.body.appendChild(pillReabrir);
        }
      }
      this.pillReabrir = pillReabrir;

      // Eventos interactivos del desplegable
      const details = document.getElementById('carga-desplegable');
      const btnToggle = document.getElementById('carga-btn-toggle');
      const btnCerrar = document.getElementById('carga-btn-cerrar');

      if (details) {
        details.addEventListener('toggle', () => {
          this.abierto = details.open;
          if (btnToggle) {
            btnToggle.textContent = details.open ? 'Plegar ▲' : 'Desplegar ▼';
          }
        });
      }

      if (btnToggle && details) {
        btnToggle.addEventListener('click', e => {
          e.preventDefault();
          e.stopPropagation();
          details.open = !details.open;
        });
      }

      if (btnCerrar) {
        btnCerrar.addEventListener('click', e => {
          e.preventDefault();
          e.stopPropagation();
          this.cerrar();
        });
      }

      if (pillReabrir) {
        pillReabrir.addEventListener('click', () => {
          this.abrir();
        });
      }

      this.domMontado = true;
      this.actualizarDOM();
    }

    // Cerrar / minimizar el panel y mostrar el pill restaurador
    cerrar() {
      this.visible = false;
      if (this.contenedor) {
        this.contenedor.classList.remove('show');
        this.contenedor.style.display = 'none';
      }
      if (this.pillReabrir) {
        this.pillReabrir.style.display = 'flex';
      }
    }

    // Poner / abrir el panel desplegable
    abrir() {
      this.visible = true;
      if (typeof document !== 'undefined') {
        if (this.contenedor) {
          this.contenedor.style.display = 'block';
          this.contenedor.classList.add('show');
        }
        if (this.pillReabrir) {
          this.pillReabrir.style.display = 'none';
        }
        const details = document.getElementById('carga-desplegable');
        if (details) details.open = true;
        this.actualizarDOM();
      }
    }

    // Actualizar todo el árbol DOM con los archivos y sus pesos en Megas
    actualizarDOM() {
      if (!this.domMontado || typeof document === 'undefined') return;
      const resumen = this.obtenerResumen();

      // Mostrar contenedor si está visible
      if (this.visible && this.contenedor) {
        this.contenedor.classList.add('show');
        this.contenedor.style.display = 'block';
      }

      const iconoEl = document.getElementById('carga-icono-estado');
      const titTextoEl = document.getElementById('carga-tit-texto');
      const badgeMbEl = document.getElementById('carga-badge-mb');
      const pctEl = document.getElementById('carga-pct');
      const barraEl = document.getElementById('carga-barra');
      const detEl = document.getElementById('carga-det');
      const statEnCargaEl = document.getElementById('c-stat-encarga');
      const statCargadosEl = document.getElementById('c-stat-cargados');
      const statPesoEl = document.getElementById('c-stat-peso');
      const listaEl = document.getElementById('carga-lista-archivos');
      const piePesoEl = document.getElementById('carga-pie-peso');
      const pillMbEl = document.getElementById('carga-pill-mb');

      const pesoCargadoTexto = formatearMB(resumen.pesoCargadoBytes);
      const pesoTotalTexto = formatearMB(resumen.pesoTotalBytes);

      if (badgeMbEl) badgeMbEl.textContent = pesoCargadoTexto;
      if (pctEl) pctEl.textContent = resumen.pct + ' %';
      if (barraEl) barraEl.style.width = resumen.pct + '%';
      if (piePesoEl) piePesoEl.textContent = pesoCargadoTexto + ' (de ' + pesoTotalTexto + ')';
      if (pillMbEl) pillMbEl.textContent = pesoCargadoTexto;

      if (resumen.todoListo) {
        if (iconoEl) {
          iconoEl.textContent = '✓';
          iconoEl.className = 'c-icono-ok';
        }
        if (titTextoEl) titTextoEl.textContent = 'Archivos cargados';
        if (detEl) detEl.textContent = resumen.cargadosCount + ' archivos listos en memoria (' + pesoCargadoTexto + ')';
        if (barraEl) barraEl.style.background = '#22c55e';
      } else {
        if (iconoEl) {
          iconoEl.textContent = '⏳';
          iconoEl.className = 'c-icono-spin';
        }
        if (titTextoEl) titTextoEl.textContent = 'Cargando recursos';
        if (detEl) detEl.textContent = resumen.enCargaCount + ' en descarga · ' + resumen.cargadosCount + ' cargados';
        if (barraEl) barraEl.style.background = 'var(--accent, #38bdf8)';
      }

      if (statEnCargaEl) statEnCargaEl.textContent = '⏳ ' + resumen.enCargaCount + ' en carga';
      if (statCargadosEl) statCargadosEl.textContent = '✓ ' + resumen.cargadosCount + ' cargados';
      if (statPesoEl) statPesoEl.textContent = '📦 ' + pesoCargadoTexto;

      // Renderizar listado de archivos
      if (listaEl) {
        const archivosOrdenados = [
          ...resumen.enCarga,
          ...resumen.cargados.slice().reverse(),
          ...resumen.errores
        ];

        if (archivosOrdenados.length === 0) {
          listaEl.innerHTML = '<div class="c-item-vacio">Esperando inicio de descargas...</div>';
        } else {
          let html = '';
          archivosOrdenados.forEach(a => {
            const esCargando = a.estado === 'cargando';
            const esError = a.estado === 'error';
            const pesoMB = formatearMB(a.bytes);
            const icono = esCargando ? '⏳' : (esError ? '⚠' : '✓');
            const claseItem = esCargando ? 'item-cargando' : (esError ? 'item-error' : 'item-cargado');
            const claseTag = esCargando ? 'tag-encarga' : (esError ? 'tag-error' : 'tag-ok');
            const textoTag = esCargando ? 'En carga' : (esError ? 'Fallo' : 'Cargado');

            html += `
              <div class="c-fila-archivo ${claseItem}" title="${a.url}">
                <div class="c-col-nombre">
                  <span class="c-item-icono">${icono}</span>
                  <b class="c-item-name">${a.nombre}</b>
                  <span class="c-item-cat">[${a.carpeta}]</span>
                </div>
                <div class="c-col-peso">
                  <span class="c-item-mb">${pesoMB}</span>
                  <span class="c-item-tag ${claseTag}">${textoTag}</span>
                </div>
              </div>
            `;
          });
          listaEl.innerHTML = html;
        }
      }
    }
  }

  // Instancia única singleton y exportación
  const instancia = new GestorCargaArchivos();
  global.GestorCargaArchivos = instancia;
  global.formatearMB = formatearMB;
  global.TABLA_PESOS_LOCALES = TABLA_PESOS_LOCALES;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GestorCargaArchivos, instancia, formatearMB, parsearRuta, buscarTamanoBytes, TABLA_PESOS_LOCALES };
  }

})(typeof window !== 'undefined' ? window : globalThis);
