// Modelos GLB de los enemigos, exportados desde el editor «Enemigo-rpg» y guardados en glb/low y glb/medium.
// El índice (js/enemigos-glb-indice.js, generado por tools/generar-indice-enemigos.mjs) dice qué archivo es de cada enemigo.
//  - medium → versión «cerca» (monstruos a menos de 10 m); si no hay medium, cerca usa el low. low → versión «lejos».
//  - Si el enemigo no está en el índice, o falta el archivo de una versión, la genera el módulo procedural (js/enemigos.js).
//  - El GLB trae sus clips de animación (Idle, Walk, Attack, Hit, Death…); aquí se reproducen con un AnimationMixer.
// Expone window.EnemyGlb (o module.exports en Node para las pruebas). Carga los archivos con GLTFPool del visor.
(function (root) {
  'use strict';

  // Versiones que se prueban por tipo, en orden: de cerca usa el medium y, si no está subido, el low
  const VERSIONES_POR_TIPO = { cerca: ['medium', 'low'], lejos: ['low'] };
  const ESTADOS_ANIMACION = ['idle', 'walk', 'run', 'attack', 'hit', 'death'];
  const UNA_VEZ = { hit: true, death: true };     // estos clips se reproducen una vez y se quedan en el último fotograma
  const FUNDIDO_S = 0.2;

  // Palabras que suelen tener los clips del editor, por estado del visor (se comparan en minúsculas)
  const PALABRAS_CLIP = {
    idle: ['idle', 'stand', 'reposo'],
    run: ['run', 'sprint', 'correr', 'carrera', 'fast'],
    walk: ['walk', 'andar', 'caminar'],
    attack: ['attack', 'jumpbite', 'bite', 'strike', 'ataque', 'shoot', 'cast', 'shot', 'arrow'],
    hit: ['hit', 'hurt', 'golpe'],
    death: ['death', 'die', 'muerte']
  };

  // Ruta del GLB de un arquetipo para una versión ('cerca' | 'lejos'), según el índice; null si no está indexado
  function rutaModeloEnemigo(arquetipo, tipo) {
    const versiones = VERSIONES_POR_TIPO[tipo];
    const indice = root.ENEMY_GLB_INDEX || {};
    if (!arquetipo || !versiones || !Object.prototype.hasOwnProperty.call(indice, arquetipo)) return null;
    const entrada = indice[arquetipo] || {};
    for (const version of versiones) if (entrada[version]) return entrada[version];
    return null;
  }

  // Clip del GLB que corresponde a un estado del visor; null si el modelo no lo trae
  function buscarClip(clips, estado) {
    for (const palabra of PALABRAS_CLIP[estado] || []) {
      const clip = (clips || []).find(c => (c.name || '').toLowerCase().includes(palabra));
      if (clip) return clip;
    }
    // Si busca 'run' y el GLB no trae clip exclusivo de correr, recurre a 'walk'
    if (estado === 'run') {
      for (const palabra of PALABRAS_CLIP.walk) {
        const clip = (clips || []).find(c => (c.name || '').toLowerCase().includes(palabra));
        if (clip) return clip;
      }
    }
    return null;
  }

  // Carga única por ruta. Estados: 'cargando' → 'listo' (escena y clips) o 'falta' (no se pudo leer: fallback procedural)
  const entradas = new Map();
  function pedir(arquetipo, tipo) {
    const ruta = rutaModeloEnemigo(arquetipo, tipo);
    if (!ruta) return null;
    let entrada = entradas.get(ruta);
    if (entrada) return entrada;
    entrada = { ruta, estado: 'cargando', escena: null, clips: [] };
    entradas.set(ruta, entrada);
    const pool = root.GLTFPool;
    if (!pool || typeof pool.cargar !== 'function') { entrada.estado = 'falta'; return entrada; }
    pool.cargar(null, ruta).then(
      r => { entrada.escena = r.scene; entrada.clips = r.animations || []; entrada.estado = 'listo'; },
      () => { entrada.estado = 'falta'; }
    );
    return entrada;
  }

  // Reproductor de animación de un clon: un AnimationMixer sobre su raíz con los clips que existan. null si no hay clips.
  function crearReproductor(THREE, raiz, clips) {
    if (!clips || !clips.length) return null;
    const mixer = new THREE.AnimationMixer(raiz);
    const acciones = {};
    ESTADOS_ANIMACION.forEach(estado => {
      const clip = buscarClip(clips, estado);
      if (!clip) return;
      const accion = mixer.clipAction(clip);
      if (UNA_VEZ[estado]) { accion.setLoop(THREE.LoopOnce, 1); accion.clampWhenFinished = true; }
      acciones[estado] = accion;
    });
    return { mixer, acciones, actual: null };
  }

  // Pasa al clip del estado (con fundido) y avanza la animación dt segundos.
  // Sin clip para un estado de paso (andar o atacar) se usa el reposo; para golpe o muerte, se mantiene la pose.
  function actualizar(rep, estado, dt) {
    if (!rep) return;
    const accion = rep.acciones[estado] ||
      (estado === 'run' ? (rep.acciones.walk || rep.acciones.idle) :
      (estado === 'walk' || estado === 'attack') ? rep.acciones.idle : null);
    if (accion && accion !== rep.actual) {
      accion.reset().play();
      if (rep.actual) rep.actual.crossFadeTo(accion, FUNDIDO_S, false);
      rep.actual = accion;
    }
    rep.mixer.update(dt);
  }

  function detener(rep) {
    if (rep && rep.mixer) rep.mixer.stopAllAction();
  }

  // Deja un reproductor como recién creado, para reutilizar su clon: sin clip activo y con la pose de reposo
  function reiniciar(rep) {
    if (!rep || !rep.mixer) return;
    rep.mixer.stopAllAction();
    rep.actual = null;
  }

  // Solo para las pruebas: olvida los GLB ya pedidos
  function _vaciarCache() { entradas.clear(); }

  const api = { rutaModeloEnemigo, buscarClip, pedir, crearReproductor, actualizar, detener, reiniciar, _vaciarCache };
  root.EnemyGlb = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
