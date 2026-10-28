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

  // Material del terreno: un atlas de 10 × 10 texturas reales (tAtlas, de assets/terreno/atlas.jpg), con las
  // clases en orden: hierba (0–14), tierra (15–55), roca (56–70), arena (71–89) y nieve (90–99). Cada celda de
  // ~14 m de cerca (70 m de lejos) elige una textura de su clase según el ruido de la celda, y en el borde se
  // mezcla con la celda vecina. uniforms: { tAtlas, uBase, uCuenta, uBaseNieve, uCuentaNieve, uTexOn }
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
          'uniform sampler2D tAtlas; uniform vec4 uBase; uniform vec4 uCuenta; uniform float uBaseNieve; uniform float uCuentaNieve;',
          'uniform float uTexOn;',
          'varying vec4 vSplat; varying float vSnow; varying vec3 vTWorld;',
          // Textura de una clase en el punto xz: celda de tamaño celdaM, repetición de escala tile, borde mezclado
          'vec3 atlasTex(float base, float cuenta, vec2 xz, float semilla, float tile, float celdaM) {',
          '  vec2 c = xz / celdaM; vec2 celda = floor(c); vec2 f = fract(c);',
          '  vec2 vecino = (f.x < 0.5 ? vec2(-1.0, 0.0) : vec2(1.0, 0.0));',
          '  if (min(f.y, 1.0 - f.y) * celdaM < min(f.x, 1.0 - f.x) * celdaM) vecino = (f.y < 0.5 ? vec2(0.0, -1.0) : vec2(0.0, 1.0));',
          '  float dBorde = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y)) * celdaM;',
          '  vec2 local = fract(xz * tile);',
          '  float i1 = base + floor(fract(sin(dot(celda, vec2(127.1, 311.7)) + semilla) * 43758.5453) * cuenta);',
          '  vec2 uv1 = (vec2(mod(i1, 10.0), floor(i1 / 10.0)) + 0.04 + local * 0.92) / 10.0;',
          '  vec2 ce2 = celda + vecino;',
          '  float i2 = base + floor(fract(sin(dot(ce2, vec2(127.1, 311.7)) + semilla) * 43758.5453) * cuenta);',
          '  vec2 uv2 = (vec2(mod(i2, 10.0), floor(i2 / 10.0)) + 0.04 + local * 0.92) / 10.0;',
          '  float w = 0.5 * (1.0 - smoothstep(0.0, 2.5, dBorde));',
          '  return mix(texture2D(tAtlas, uv1).rgb, texture2D(tAtlas, uv2).rgb, w);',
          '}',
          // Ruido de valor: rompe la repetición con manchas de tono a gran escala
          'float ruidoValor(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); float a = fract(sin(dot(i, vec2(127.1, 311.7))) * 43758.5453); float b = fract(sin(dot(i + vec2(1.0, 0.0), vec2(127.1, 311.7))) * 43758.5453); float c = fract(sin(dot(i + vec2(0.0, 1.0), vec2(127.1, 311.7))) * 43758.5453); float d = fract(sin(dot(i + vec2(1.0, 1.0), vec2(127.1, 311.7))) * 43758.5453); return mix(mix(a, b, f.x), mix(c, d, f.x), f.y); }'
        ].join('\n'))
        .replace('#include <color_fragment>', [
          '#include <color_fragment>',
          // Cerca: textura cada 8 m y celdas de 14 m; lejos (más de 120–600 m): repetición y celdas mayores
          'float dCam = length(vTWorld.xz - cameraPosition.xz);',
          'float tL = smoothstep(120.0, 600.0, dCam);',
          'float tile = mix(1.0 / 8.0, 1.0 / 40.0, tL), celdaM = mix(14.0, 70.0, tL);',
          'vec3 tex = vec3(0.0);',
          'if (vSplat.x > 0.001) tex += atlasTex(uBase.x, uCuenta.x, vTWorld.xz, 1.3, tile, celdaM) * vSplat.x;',
          'if (vSplat.y > 0.001) tex += atlasTex(uBase.y, uCuenta.y, vTWorld.xz, 7.1, tile, celdaM) * vSplat.y;',
          'if (vSplat.z > 0.001) tex += atlasTex(uBase.z, uCuenta.z, vTWorld.xz, 3.9, tile, celdaM) * vSplat.z;',
          'if (vSplat.w > 0.001) tex += atlasTex(uBase.w, uCuenta.w, vTWorld.xz, 5.5, tile, celdaM) * vSplat.w;',
          'if (vSnow > 0.001) tex += atlasTex(uBaseNieve, uCuentaNieve, vTWorld.xz, 9.2, tile, celdaM) * vSnow;',
          'float macro = 0.84 + 0.22 * ruidoValor(vTWorld.xz * 0.0045) + 0.1 * ruidoValor(vTWorld.xz * 0.03);',
          'vec3 tinte = mix(vec3(1.0, 0.97, 0.9), vec3(0.93, 1.02, 0.88), ruidoValor(vTWorld.xz * 0.006 + 17.0));',
          'diffuseColor.rgb *= mix(vec3(1.0), tex * 1.35, uTexOn) * macro * tinte;'
        ].join('\n'));
    };
    return m;
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

  const api = { splatFor, createTerrainMaterial, buildGridGeometry, nodeNormal, smooth };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TerrainLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
