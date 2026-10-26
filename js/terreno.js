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

  // Material con las cinco texturas mezcladas en el fragmento. uniforms: { tGrass, tDirt, tRock, tSand, tSnow, uTile, uTexOn }
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
          'uniform sampler2D tGrass; uniform sampler2D tDirt; uniform sampler2D tRock; uniform sampler2D tSand; uniform sampler2D tSnow;',
          'uniform float uTile; uniform float uTexOn;',
          'varying vec4 vSplat; varying float vSnow; varying vec3 vTWorld;',
          'vec3 terrainTex(sampler2D t) { vec2 a = vTWorld.xz * uTile; vec2 b = vTWorld.xz * uTile * 0.31; return mix(texture2D(t, a).rgb, texture2D(t, b).rgb, 0.4); }'
        ].join('\n'))
        .replace('#include <color_fragment>', [
          '#include <color_fragment>',
          'vec3 tex = terrainTex(tGrass) * vSplat.x + terrainTex(tDirt) * vSplat.y + terrainTex(tRock) * vSplat.z + terrainTex(tSand) * vSplat.w + terrainTex(tSnow) * vSnow;',
          'diffuseColor.rgb *= mix(vec3(1.0), tex * 1.35, uTexOn);'
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
