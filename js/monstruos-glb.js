// Monstruos en GLB de la carpeta glb/monstruos/: todo GLB que se ponga ahí aparece en el índice (glb/monstruos/indice.json,
// generado con tools/indexar-monstruos.mjs) y se puede elegir para las zonas de caza y las mazmorras.
//  - entrada del índice: { id, nombre, archivo, clips, altura }
//  - en las zonas, un monstruo con `modeloGlb: id` usa ese GLB; en las mazmorras, la opción 'glb:<id>'.
// Expone window.MonstruosGlb (o module.exports en Node para las pruebas).
(function (root) {
  'use strict';

  const CARPETA = 'glb/monstruos/';
  const ARCHIVO_INDICE = 'indice.json';
  const PREFIJO_MAZMORRA = 'glb:';

  // «enemy_undead_banshee_queen_low.glb» → «Banshee Queen»
  function nombreDesdeArchivo(archivo) {
    const base = String(archivo || '').replace(/\.glb$/i, '')
      .replace(/^enemy[-_](undead[-_])?/i, '')
      .replace(/[-_]low$/i, '');
    const palabras = base.split(/[-_\s]+/).filter(Boolean);
    if (!palabras.length) return 'Monstruo';
    return palabras.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  }

  // Id estable del monstruo: el nombre del archivo sin extensión
  function idDesdeArchivo(archivo) {
    return String(archivo || '').replace(/\.glb$/i, '');
  }

  // Entrada del índice a partir de lo que se lee de un GLB (clips y altura)
  function entradaDeMonstruo(archivo, datos) {
    const d = datos || {};
    return {
      id: idDesdeArchivo(archivo),
      nombre: nombreDesdeArchivo(archivo),
      archivo,
      clips: Array.isArray(d.clips) ? d.clips.slice() : [],
      altura: typeof d.altura === 'number' ? d.altura : null
    };
  }

  // Ruta del GLB de una entrada, relativa a la raíz del juego
  function rutaMonstruo(entrada) {
    return entrada ? CARPETA + encodeURIComponent(entrada.archivo) : null;
  }

  function buscarMonstruo(indice, id) {
    return (indice || []).find(e => e.id === id) || null;
  }

  // Opciones para un selector: [{ value, label }]; el valor de mazmorra lleva el prefijo 'glb:'
  function opcionesMonstruos(indice, { mazmorra = false } = {}) {
    return (indice || []).map(e => ({
      value: mazmorra ? PREFIJO_MAZMORRA + e.id : e.id,
      label: e.nombre
    }));
  }

  // Id de monstruo a partir del valor de un selector de mazmorra ('glb:<id>' → '<id>'); null si no es un GLB
  function idDesdeValorMazmorra(valor) {
    const s = String(valor || '');
    return s.startsWith(PREFIJO_MAZMORRA) ? s.slice(PREFIJO_MAZMORRA.length) : null;
  }

  // Elige un monstruo al azar con rnd() en [0,1); null si el índice está vacío
  function elegirMonstruo(indice, rnd = Math.random) {
    if (!indice || !indice.length) return null;
    const i = Math.min(indice.length - 1, Math.floor(rnd() * indice.length));
    return indice[i];
  }

  // Reparte los monstruos de una lista de zonas: cada monstruo de zona sin modelo recibe uno del índice
  function asignarModelos(monstruos, indice, rnd = Math.random) {
    return (monstruos || []).map(m => (m.modeloGlb || !indice || !indice.length) ? m : Object.assign({}, m, { modeloGlb: elegirMonstruo(indice, rnd).id }));
  }

  const api = {
    CARPETA, ARCHIVO_INDICE, PREFIJO_MAZMORRA,
    nombreDesdeArchivo, idDesdeArchivo, entradaDeMonstruo, rutaMonstruo, buscarMonstruo,
    opcionesMonstruos, idDesdeValorMazmorra, elegirMonstruo, asignarModelos
  };
  root.MonstruosGlb = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
