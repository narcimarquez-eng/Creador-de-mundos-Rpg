/*
 * terreno.js — Render del terreno (G1): texturas pintadas por bioma, pendiente y altura,
 * y mallas por trozos con dos niveles de detalle. Requiere THREE (global) salvo splatFor.
 * Expone window.TerrainLib (o module.exports en Node para las pruebas).
 */
(function (root) {
  "use strict";

  const clamp01 = v => Math.max(0, Math.min(1, v));
  const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

  // Pesos de las texturas de un punto: [hierba, tierra, roca, arena] y nieve aparte. Suman 1.
  function splatFor(biome, steep, h) {
    let g = 0, d = 0, r = 0, s = 0, n = 0;
    switch (biome) {
      case 'pradera': g = 1; break;
      case 'bosque': g = 0.9; d = 0.1; break;
      case 'pantano': g = 0.55; d = 0.45; break;
      case 'taiga': g = 0.5; d = 0.5; break;
      case 'tundra': d = 0.5; n = 0.5; break;
      case 'desierto': s = 1; break;
      case 'montana': r = 0.8; d = 0.2; break;
      case 'nieve': n = 1; break;
      case 'costa': s = 1; break;
      default: s = 1; break;                 // agua y océano: arena bajo el agua
    }
    // Pendientes fuertes: roca
    const rock = smooth(0.35, 0.7, steep || 0);
    const k = 1 - rock;
    g *= k; d *= k; s *= k; n *= k;
    r = Math.max(r, rock);
    // Cumbres: nieve
    const snow = Math.max(n, smooth(170, 230, h || 0));
    const rest = 1 - snow;
    const sum = g + d + r + s || 1;
    return { splat: [g / sum * rest, d / sum * rest, r / sum * rest, s / sum * rest], snow };
  }

  // Texturas del atlas (assets/terreno/atlas.jpg, 10 × 10 celdas de 256 px) que usa el suelo: tres parecidas por
  // clase, en orden hierba, tierra, roca, arena y nieve. Antes cada celda de 14 m elegía una al azar entre
  // todas las de su clase (hasta 41 muy distintas) y el suelo parecía un damero.
  const CAPAS = [[5, 6, 3], [32, 34, 36], [56, 57, 67], [89, 24, 52], [90, 92, 99]];

  // Material del terreno. uniforms: { tCapas (DataArrayTexture de 15 capas, CAPAS en orden), uTexOn }.
  // Las tres texturas de cada clase se mezclan con manchas de ruido grandes e irregulares (sin celdas); la
  // textura array repite sin costuras y con mipmaps, así no salen líneas cada vez que se repite.
  function createTerrainMaterial(THREE, uniforms) {
    const m = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    m.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nattribute vec4 aSplat;\nattribute float aSnow;\nvarying vec4 vSplat;\nvarying float vSnow;\nvarying vec3 vTWorld;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvSplat = aSplat;\nvSnow = aSnow;\nvTWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', [
          '#include <common>',
          'uniform highp sampler2DArray tCapas;',
          'uniform float uTexOn;',
          'varying vec4 vSplat; varying float vSnow; varying vec3 vTWorld;',
          // Ruido de valor: manchas suaves
          'float ruidoValor(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); float a = fract(sin(dot(i, vec2(127.1, 311.7))) * 43758.5453); float b = fract(sin(dot(i + vec2(1.0, 0.0), vec2(127.1, 311.7))) * 43758.5453); float c = fract(sin(dot(i + vec2(0.0, 1.0), vec2(127.1, 311.7))) * 43758.5453); float d = fract(sin(dot(i + vec2(1.0, 1.0), vec2(127.1, 311.7))) * 43758.5453); return mix(mix(a, b, f.x), mix(c, d, f.x), f.y); }',
          // Una clase a una escala: la 1.ª textura de fondo, la 2.ª y la 3.ª en manchas de unos 30–60 m con
          // borde irregular. Cada textura va girada y desplazada para que sus repeticiones no coincidan.
          'vec3 claseTex(float base, vec2 xz, float sem, float tile) {',
          '  float n2 = ruidoValor(xz * 0.09 + sem * 5.3);',
          '  float a = smoothstep(0.42, 0.62, ruidoValor(xz * 0.021 + sem * 13.1) * 0.75 + n2 * 0.25);',
          '  float b = smoothstep(0.58, 0.74, ruidoValor(xz * 0.016 + sem * 3.7 + 40.0) * 0.75 + n2 * 0.25);',
          '  vec2 uv = xz * tile;',
          '  vec3 c = vec3(0.0);',
          '  if (a < 0.999) c = texture(tCapas, vec3(uv, base)).rgb * (1.0 - a);',
          '  if (a > 0.001) c += texture(tCapas, vec3(mat2(0.8, -0.6, 0.6, 0.8) * uv * 0.87 + 0.31, base + 1.0)).rgb * a;',
          '  if (b > 0.001) c = mix(c, texture(tCapas, vec3(mat2(0.28, 0.96, -0.96, 0.28) * uv * 1.13 + 0.67, base + 2.0)).rgb, b);',
          '  return c;',
          '}',
          // Cerca, una repetición cada 8 m; lejos (de 120 a 600 m), cada 32 m para que no se vea el patrón
          'vec3 claseLejos(float base, vec2 xz, float sem, float tL) {',
          '  vec3 c = vec3(0.0);',
          '  if (tL < 0.999) c = claseTex(base, xz, sem, 1.0 / 8.0) * (1.0 - tL);',
          '  if (tL > 0.001) c += claseTex(base, xz, sem, 1.0 / 32.0) * tL;',
          '  return c;',
          '}'
        ].join('\n'))
        .replace('#include <color_fragment>', [
          '#include <color_fragment>',
          'float dCam = length(vTWorld.xz - cameraPosition.xz);',
          'float tL = smoothstep(120.0, 600.0, dCam);',
          'vec3 tex = vec3(0.0);',
          'if (uTexOn > 0.5) {',
          '  if (vSplat.x > 0.001) tex += claseLejos(0.0, vTWorld.xz, 1.3, tL) * vSplat.x;',
          '  if (vSplat.y > 0.001) tex += claseLejos(3.0, vTWorld.xz, 7.1, tL) * vSplat.y;',
          '  if (vSplat.z > 0.001) tex += claseLejos(6.0, vTWorld.xz, 3.9, tL) * vSplat.z;',
          '  if (vSplat.w > 0.001) tex += claseLejos(9.0, vTWorld.xz, 5.5, tL) * vSplat.w;',
          '  if (vSnow > 0.001) tex += claseLejos(12.0, vTWorld.xz, 9.2, tL) * vSnow;',
          '}',
          'float macro = 0.84 + 0.22 * ruidoValor(vTWorld.xz * 0.0045) + 0.1 * ruidoValor(vTWorld.xz * 0.03);',
          'vec3 tinte = mix(vec3(1.0, 0.97, 0.9), vec3(0.93, 1.02, 0.88), ruidoValor(vTWorld.xz * 0.006 + 17.0));',
          'diffuseColor.rgb *= mix(vec3(1.0), tex * 1.35, uTexOn) * macro * tinte;'
        ].join('\n'));
    };
    return m;
  }

  // Capas de la textura array a partir de los píxeles RGBA del atlas (lado x lado). Devuelve
  // { datos: Uint8Array de 15 capas de 256 × 256 RGBA, tam, capas }.
  function capasDelAtlas(rgba, lado) {
    const lista = CAPAS.flat(), tam = lado / 10;
    const datos = new Uint8Array(tam * tam * 4 * lista.length);
    lista.forEach((celda, l) => {
      const x0 = (celda % 10) * tam, y0 = Math.floor(celda / 10) * tam;
      for (let y = 0; y < tam; y++) {
        const desde = ((y0 + y) * lado + x0) * 4;
        datos.set(rgba.subarray(desde, desde + tam * 4), (l * tam + y) * tam * 4);
      }
    });
    return { datos, tam, capas: lista.length };
  }

  // Extrae directamente solo las 15 celdas usadas del atlas sin decodificar las otras 85 celdas
  function capasDesdeImagen(img) {
    const lista = CAPAS.flat(), lado = img.width, tam = lado / 10;
    const lienzo = document.createElement('canvas');
    lienzo.width = tam;
    lienzo.height = tam * lista.length;
    const ctx = lienzo.getContext('2d', { willReadFrequently: true });
    lista.forEach((celda, l) => {
      ctx.drawImage(img, (celda % 10) * tam, Math.floor(celda / 10) * tam, tam, tam, 0, l * tam, tam, tam);
    });
    const imgData = ctx.getImageData(0, 0, tam, tam * lista.length);
    return { datos: new Uint8Array(imgData.data.buffer), tam, capas: lista.length };
  }

  // Malla de una rejilla de nodos. grid: { x0, z0, step, n, N, pos, col, splat, snow, nrm }.
  // gi0, gj0: nodo inicial; cellsI, cellsJ: celdas; stride: nodos por celda (1 = detalle completo).
  // skipCell(gi, gj, s): true para no dibujar la celda que empieza en el nodo (gi, gj) y mide s nodos
  // (hueco de un pueblo o zona cubierta por otra malla).
  // skirt: añade faldones que bajan por el borde para tapar grietas entre trozos.
  function buildGridGeometry(THREE, grid, o) {
    const { gi0, gj0, cellsI, cellsJ, stride, skipCell, skirt } = o;
    const N = grid.N, n = grid.n;
    const NI = cellsI + 1, NJ = cellsJ + 1;
    const P = [], C = [], S = [], W = [], Nr = [];
    const vid = new Int32Array(NI * NJ);
    const addVertex = (gi, gj, dy) => {
      const k = gj * N + gi;
      P.push(grid.pos[k * 3], grid.pos[k * 3 + 1] + dy, grid.pos[k * 3 + 2]);
      C.push(grid.col[k * 3], grid.col[k * 3 + 1], grid.col[k * 3 + 2]);
      S.push(grid.splat[k * 4], grid.splat[k * 4 + 1], grid.splat[k * 4 + 2], grid.splat[k * 4 + 3]);
      W.push(grid.snow[k]);
      Nr.push(grid.nrm[k * 3], grid.nrm[k * 3 + 1], grid.nrm[k * 3 + 2]);
      return P.length / 3 - 1;
    };
    for (let j = 0; j < NJ; j++) for (let i = 0; i < NI; i++) {
      const gi = Math.min(n, gi0 + i * stride), gj = Math.min(n, gj0 + j * stride);
      vid[j * NI + i] = addVertex(gi, gj, 0);
    }
    const I = [];
    const drawn = new Uint8Array(cellsI * cellsJ);
    for (let j = 0; j < cellsJ; j++) for (let i = 0; i < cellsI; i++) {
      const gi = gi0 + i * stride, gj = gj0 + j * stride;
      if (skipCell && skipCell(gi, gj, stride)) continue;
      drawn[j * cellsI + i] = 1;
      const a = j * NI + i, b = a + 1, c = a + NI, d = c + 1;
      I.push(vid[a], vid[c], vid[b], vid[b], vid[c], vid[d]);
    }
    // Faldones solo en el borde de todo el mundo. Entre trozos vecinos no se añaden: sus caras
    // verticales se veían como líneas oscuras sobre el terreno. Los trozos comparten sus nodos.
    if (skirt) {
      const DROP = 30;
      const atLeft = gi0 === 0, atBottom = gj0 === 0;
      const atRight = gi0 + cellsI * stride >= n, atTop = gj0 + cellsJ * stride >= n;
      // Faldón entre los nodos (ai, aj) y (bi, bj) de la rejilla local
      const wall = (ai, aj, bi, bj) => {
        const ta = vid[aj * NI + ai], tb = vid[bj * NI + bi];
        const gia = Math.min(n, gi0 + ai * stride), gja = Math.min(n, gj0 + aj * stride);
        const gib = Math.min(n, gi0 + bi * stride), gjb = Math.min(n, gj0 + bj * stride);
        const ba = addVertex(gia, gja, -DROP), bb = addVertex(gib, gjb, -DROP);
        I.push(ta, tb, bb, ta, bb, ba);
      };
      for (let j = 0; j < cellsJ; j++) for (let i = 0; i < cellsI; i++) {
        if (!drawn[j * cellsI + i]) continue;
        if (j === 0 && atBottom) wall(i, j, i + 1, j);
        if (j === cellsJ - 1 && atTop) wall(i, j + 1, i + 1, j + 1);
        if (i === 0 && atLeft) wall(i, j, i, j + 1);
        if (i === cellsI - 1 && atRight) wall(i + 1, j, i + 1, j + 1);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(Nr, 3));
    g.setAttribute('aSplat', new THREE.Float32BufferAttribute(S, 4));
    g.setAttribute('aSnow', new THREE.Float32BufferAttribute(W, 1));
    g.setIndex(I);
    return g;
  }

  // Normal de un nodo a partir de sus vecinos (diferencias centrales) con el paso de la rejilla
  function nodeNormal(heightAt, i, j, n, step) {
    const il = Math.max(0, i - 1), ir = Math.min(n, i + 1), jd = Math.max(0, j - 1), ju = Math.min(n, j + 1);
    const dx = (heightAt(ir, j) - heightAt(il, j)) / ((ir - il) * step || 1);
    const dz = (heightAt(i, ju) - heightAt(i, jd)) / ((ju - jd) * step || 1);
    const l = Math.hypot(-dx, 1, -dz);
    return [-dx / l, 1 / l, -dz / l];
  }

  const api = { splatFor, createTerrainMaterial, capasDelAtlas, capasDesdeImagen, CAPAS, buildGridGeometry, nodeNormal, smooth };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TerrainLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
