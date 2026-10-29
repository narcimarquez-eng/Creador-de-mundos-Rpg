/*
 * paletas.js — Colores de los monstruos que elige el juego (sin gráficos).
 * Los arquetipos de nivel bajo del editor de enemigos son casi todos de pelaje marrón: el juego conserva su
 * forma pero toma la paleta de la zona, según su bioma, de los materiales del editor (MATERIAL_PRESETS de
 * js/enemigos.js), y cada monstruo varía un poco de tono. Todo es determinista: el mismo monstruo, el mismo color.
 * Expone window.PaletasLib (o module.exports en Node para las pruebas).
 */
(function (root) {
  "use strict";

  // Materiales del editor que encajan con cada bioma. El pelaje marrón (feral_fur_hide), solo en bosque y taiga.
  const POR_BIOMA = {
    pradera: ['anisotropic_gold', 'dragon_crimson_scales', 'arcane_crystal', 'corroded_bronze'],
    bosque: ['feral_fur_hide', 'corroded_bronze', 'arcane_crystal', 'dragon_crimson_scales'],
    pantano: ['corroded_bronze', 'abyssal_obsidian', 'arcane_crystal'],
    desierto: ['anisotropic_gold', 'ancient_bone', 'dragon_crimson_scales'],
    costa: ['arcane_crystal', 'anisotropic_gold', 'blued_steel'],
    tundra: ['blued_steel', 'arcane_crystal', 'ancient_bone'],
    taiga: ['blued_steel', 'feral_fur_hide', 'abyssal_obsidian'],
    montana: ['blued_steel', 'abyssal_obsidian', 'dragon_crimson_scales', 'corroded_bronze'],
    nieve: ['arcane_crystal', 'blued_steel', 'ancient_bone']
  };
  const TODAS = ['dragon_crimson_scales', 'feral_fur_hide', 'blued_steel', 'anisotropic_gold', 'abyssal_obsidian',
    'ancient_bone', 'arcane_crystal', 'corroded_bronze'];

  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }
  // Número entre 0 y 1 a partir de una semilla y un índice
  const azar = (semilla, i) => (hash(semilla + ':' + i) % 10000) / 10000;

  // Material del editor para una zona (por su bioma; si no lo hay en la lista, cualquiera)
  function paletaDeZona(zona) {
    const lista = POR_BIOMA[zona.biome] || TODAS;
    return lista[hash(String(zona.id)) % lista.length];
  }

  function hexAHsl(hex) {
    const n = parseInt(String(hex).replace('#', ''), 16);
    const r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l };
    const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return { h: h * 60, s, l };
  }
  function hslAHex({ h, s, l }) {
    const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const f = n => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
    return '#' + [f(0), f(8), f(4)].map(v => v.toString(16).padStart(2, '0')).join('');
  }
  // Gira el tono dh grados y multiplica saturación y luminosidad (con tope en 1)
  function variarColor(hex, dh, ms, ml) {
    const c = hexAHsl(hex);
    return hslAHex({ h: (c.h + dh + 360) % 360, s: Math.min(1, c.s * ms), l: Math.min(0.92, c.l * ml) });
  }

  // Material de un monstruo: la paleta de su zona con un poco de variación propia (±20° de tono, más saturado)
  function materialDeMonstruo(presets, zona, semilla) {
    const clave = paletaDeZona(zona);
    const base = presets[clave];
    const dh = (azar(semilla, 1) - 0.5) * 40;
    const ms = 1.1 + azar(semilla, 2) * 0.25;
    const ml = 1 + azar(semilla, 3) * 0.2;
    return Object.assign({}, base, {
      preset: clave,
      primaryColor: variarColor(base.primaryColor, dh, ms, ml),
      secondaryColor: variarColor(base.secondaryColor, dh, ms, ml),
      underbodyColor: variarColor(base.underbodyColor, dh, ms, 1),
      emissiveColor: variarColor(base.emissiveColor, dh, 1, 1)
    });
  }

  const api = { POR_BIOMA, TODAS, paletaDeZona, materialDeMonstruo, variarColor, hexAHsl };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PaletasLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
