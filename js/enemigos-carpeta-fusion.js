// Monstruos de las carpetas glb/low y glb/medium que no están en el catálogo del editor «Enemigo-rpg».
// tools/generar-indice-enemigos.mjs los escribe en js/enemigos-carpeta.js (window.ENEMY_CARPETA). Aquí se unen a las
// listas que usan las zonas de caza, las mazmorras y el selector de enemigos:
//  - EnemyLib.ARCHETYPE_PRESETS: preset mínimo (nombre, nivel y GLB; sin esqueleto procedural)
//  - ENEMY_GLB_INDEX: rutas de sus GLB low/medium
//  - ENEMY_CATALOG: entrada para los selectores del editor de mundos
// Lo que ya existe no se sobrescribe. Expone window.EnemyCarpetaFusion (o module.exports en Node).
(function (root) {
  'use strict';

  // Clave de enemigo a partir del nombre de archivo: «enemy-highland-lynx-stalker_low.glb» → «highland_lynx_stalker»
  function claveDesdeArchivo(nombre) {
    return String(nombre || '')
      .replace(/\.glb$/i, '')
      .replace(/^enemy[-_](undead[-_])?/i, '')
      .replace(/[-_](low|medium)$/i, '')
      .replace(/[-\s]+/g, '_')
      .toLowerCase();
  }

  // Nombre legible: «enemy_undead_banshee_queen_low.glb» → «Banshee Queen»
  function nombreDesdeArchivo(nombre) {
    const base = claveDesdeArchivo(nombre).replace(/^[a-z]+_\d{2}_/, '');   // «df_01_» de la numeración
    const palabras = base.split('_').filter(Boolean);
    return palabras.length ? palabras.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') : 'Monstruo';
  }

  // Nivel de una ruta de carpeta con rango («glb/low/zonas-iniciales-nv-1-20/…» → 10); 15 si no lo tiene
  function nivelDesdeRuta(ruta) {
    const m = /nv-(\d+)-(\d+)/i.exec(String(ruta || ''));
    return m ? Math.round((Number(m[1]) + Number(m[2])) / 2) : 15;
  }

  // Une los monstruos de carpeta a las listas dadas; devuelve cuántos se añadieron a cada una
  function fusionar({ carpeta, presets, glbIndex, catalogo }) {
    const cuenta = { presets: 0, glbIndex: 0, catalogo: 0 };
    Object.keys(carpeta || {}).forEach(key => {
      const e = carpeta[key];
      if (presets && !presets[key]) {
        presets[key] = {
          id: 'carpeta-' + key,
          name: e.name,
          title: 'Monstruo de carpeta',
          raceCategory: 'carpeta',
          archetype: key,
          stats: { level: e.level, tier: 'Normal' },
          soloGlb: true
        };
        cuenta.presets++;
      }
      if (glbIndex && !glbIndex[key]) {
        glbIndex[key] = Object.assign({}, e.glb);
        cuenta.glbIndex++;
      }
      if (catalogo && !catalogo.some(c => c.key === key)) {
        catalogo.push({
          key, id: 'carpeta-' + key, name: e.name, title: 'Monstruo de carpeta',
          raceCategory: 'carpeta', raceLabel: 'Carpeta de monstruos',
          level: e.level, tier: 'Normal', boss: false
        });
        cuenta.catalogo++;
      }
    });
    return cuenta;
  }

  // Versión para el navegador: usa los globales de la página
  function fusionarEnPagina() {
    const r = root;
    if (!r.ENEMY_CARPETA) return null;
    return fusionar({
      carpeta: r.ENEMY_CARPETA,
      presets: r.EnemyLib && r.EnemyLib.ARCHETYPE_PRESETS,
      glbIndex: r.ENEMY_GLB_INDEX,
      catalogo: r.ENEMY_CATALOG
    });
  }

  const api = { claveDesdeArchivo, nombreDesdeArchivo, nivelDesdeRuta, fusionar, fusionarEnPagina };
  root.EnemyCarpetaFusion = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
