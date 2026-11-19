/*
 * pradera-atlas.js — Tres atlas botánicos procedurales (hierba, trigo bajo y flores de pradera),
 * distribución coherente en parches y capas InstancedMesh animadas con viento para el visor 3D.
 * Formato UMD: expone `window.PraderaAtlasLib` en navegador o `module.exports` en Node.
 */
(function (root) {
  'use strict';

  const ATLAS_TIPOS = ['hierba', 'trigo', 'flores'];

  const ATLAS_META = {
    hierba: {
      id: 'hierba',
      nombre: 'Hierba de Pradera',
      cols: 2,
      rows: 2,
      tam: 512,
      anchoBase: 0.94,
      altoBase: 0.50,
      swayAmp: 0.090,
      swayFreq: 2.10,
      celdas: ['mata_frondosa', 'gramineas_finas', 'trebol_campo', 'hierba_rustica']
    },
    trigo: {
      id: 'trigo',
      nombre: 'Campos de Trigo Bajo',
      cols: 2,
      rows: 2,
      tam: 512,
      anchoBase: 1.06,
      altoBase: 0.66,
      swayAmp: 0.135,
      swayFreq: 1.95,
      celdas: ['trigo_dorado', 'trigo_claro_viento', 'trigo_en_sazon', 'trigo_con_amapola']
    },
    flores: {
      id: 'flores',
      nombre: 'Pradera con Flores',
      cols: 2,
      rows: 2,
      tam: 512,
      anchoBase: 0.96,
      altoBase: 0.56,
      swayAmp: 0.095,
      swayFreq: 2.25,
      celdas: ['margaritas_oro', 'amapolas_rojas', 'lavanda_campanillas', 'prado_silvestre']
    }
  };

  const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);

  function smoothstep(a, b, x) {
    const t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  }

  function makeRng(seed) {
    let s = (seed >>> 0) || 1;
    return () => {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Desplazamiento determinista en [-40, 40] por semilla del mundo; compartido con GLSL via uPraderaSeed
  function semillaOffset(seed) {
    let h = ((seed | 0) ^ 0x9e3779b9) >>> 0;
    h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
    const h2 = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
    const ox = ((h & 65535) / 65535) * 80 - 40;
    const oz = ((h2 & 65535) / 65535) * 80 - 40;
    return [ox, oz];
  }

  // Réplica exacta de ruidoValor(vec2) en js/terreno.js para que cercanía 3D y terreno lejano coincidan
  function hash2(ix, iz) {
    const s = Math.sin(ix * 127.1 + iz * 311.7) * 43758.5453;
    return s - Math.floor(s);
  }

  function ruidoValor(px, pz) {
    const ix = Math.floor(px);
    const iz = Math.floor(pz);
    const fx = px - ix;
    const fz = pz - iz;
    const ux = fx * fx * (3 - 2 * fx);
    const uz = fz * fz * (3 - 2 * fz);
    const a = hash2(ix, iz);
    const b = hash2(ix + 1, iz);
    const c = hash2(ix, iz + 1);
    const d = hash2(ix + 1, iz + 1);
    const ab = a + (b - a) * ux;
    const cd = c + (d - c) * ux;
    return ab + (cd - ab) * uz;
  }

  // Clasifica un punto de pradera en parche coherente de 'trigo', 'flores' o 'hierba'
  function zonaPraderaEn(x, z, seed, opts = {}) {
    const bio = opts.bio || 'pradera';
    const pendiente = opts.pendiente || 0;
    if (bio !== 'pradera') {
      return { tipo: 'hierba', wTrigo: 0, wFlores: 0, paletaFlor: 0, surco: 0.5 };
    }
    const [ox, oz] = semillaOffset(seed);

    const pTx = x * 0.0092 + ox;
    const pTz = z * 0.0092 + oz;
    const nT = ruidoValor(pTx, pTz) * 0.72 + ruidoValor(pTx * 2.13 + 7.3, pTz * 2.13 + 4.1) * 0.28;
    const fPlanoT = 1 - smoothstep(0.55, 0.95, pendiente);
    const wTrigo = smoothstep(0.55, 0.70, nT) * fPlanoT;

    const pFx = x * 0.0118 + ox * 1.37 + 31.7;
    const pFz = z * 0.0118 + oz * 1.37 - 19.4;
    const nF = ruidoValor(pFx, pFz) * 0.70 + ruidoValor(pFx * 2.27 + 3.9, pFz * 2.27 + 11.2) * 0.30;
    const fPlanoF = 1 - smoothstep(1.10, 1.55, pendiente);
    const wFlores = smoothstep(0.54, 0.69, nF) * (1 - wTrigo * 0.92) * fPlanoF;

    const nPal = ruidoValor(x * 0.018 + ox * 0.61 - 14.2, z * 0.018 + oz * 0.61 + 27.5);
    const paletaFlor = nPal < 0.34 ? 0 : nPal < 0.67 ? 1 : 2;
    const surco = 0.5 + 0.5 * Math.sin((x * 0.82 + z * 0.57) * 2.6 + ruidoValor(x * 0.08, z * 0.08) * 1.4);

    const tipo = wTrigo >= 0.45 ? 'trigo' : wFlores >= 0.42 ? 'flores' : 'hierba';
    return { tipo, wTrigo, wFlores, paletaFlor, surco };
  }

  function probBaseBioma(bio) {
    switch (bio) {
      case 'pradera': return 0.86;
      case 'bosque': return 0.74;
      case 'pantano': return 0.58;
      case 'taiga': return 0.46;
      case 'tundra': return 0.24;
      case 'costa': return 0.14;
      default: return 0;
    }
  }

  // Convierte índice lógico [0..3] a coordenadas de celda (col, row) teniendo en cuenta flipY=true
  function celdaUV(cellIndex) {
    const idx = cellIndex & 3;
    return {
      col: idx & 1,
      row: idx < 2 ? 1 : 0
    };
  }

  // Decide atlas, celda, escala, rotación y color de una mata en coordenadas del mundo
  function elegirInstanciaPradera(x, z, bio, dh, seed, r1, r2, r3, r4, escalaDens = 1, opts = {}) {
    if (escalaDens <= 0) return null;
    const probBase = probBaseBioma(bio);
    if (probBase <= 0) return null;

    const enOrilla = !!(opts && opts.enOrillaRiachuelo);
    const zona = zonaPraderaEn(x, z, seed, { bio, pendiente: dh });
    const wFloresEf = enOrilla && bio === 'pradera' ? Math.max(zona.wFlores, 0.58) : zona.wFlores;
    let prob = probBase;
    if (bio === 'pradera') {
      prob = Math.max(prob, 0.86 + zona.wTrigo * 0.11 + wFloresEf * 0.08);
    } else if (enOrilla && bio === 'bosque') {
      prob = Math.max(prob, 0.90);
    }
    if (r3 > prob * escalaDens) return null;

    const rMix = (r1 * 0.37 + r2 * 0.29 + r4 * 0.53) % 1;
    const rSub = (r2 * 0.61 + r4 * 0.39) % 1;
    const lum = 0.88 + r3 * 0.22;

    let atlas = 'hierba';
    let cellIndex = 0;
    let sx = 0.84 + r4 * 0.42;
    let sz = sx;
    let sy = 0.78 + r2 * 0.40;
    let rotY = r1 * 6.2831853;
    let color;

    if (bio === 'pradera' && zona.wTrigo > 0.08 && !enOrilla && rMix < zona.wTrigo * 0.96) {
      atlas = 'trigo';
      cellIndex = rSub < 0.40 ? 0 : rSub < 0.68 ? 1 : rSub < 0.92 ? 2 : 3;
      sx = 0.86 + r4 * 0.34;
      sz = sx;
      sy = 0.80 + r2 * 0.32;
      rotY = 0.52 + (r1 - 0.5) * 1.15;
      const tone = 0.93 + zona.surco * 0.09 + (r3 - 0.5) * 0.08;
      color = [
        clamp01(tone * 1.03),
        clamp01(tone * 0.98),
        clamp01(tone * 0.90)
      ];
    } else if (
      (bio === 'pradera' && ((wFloresEf > 0.08 && rMix < wFloresEf * 0.74) || rMix > 0.945)) ||
      (bio === 'bosque' && rMix > (enOrilla ? 0.68 : 0.96))
    ) {
      atlas = 'flores';
      if (bio === 'bosque') {
        cellIndex = rSub < 0.55 ? 0 : 2;
      } else if (zona.paletaFlor === 0) {
        cellIndex = rSub < 0.58 ? 0 : rSub < 0.88 ? 3 : 1;
      } else if (zona.paletaFlor === 1) {
        cellIndex = rSub < 0.56 ? 1 : rSub < 0.86 ? 3 : 0;
      } else {
        cellIndex = rSub < 0.58 ? 2 : rSub < 0.88 ? 0 : 3;
      }
      sx = 0.82 + r4 * 0.36;
      sz = sx;
      sy = 0.78 + r2 * 0.36;
      const neut = 0.93 + r3 * 0.14;
      color = [clamp01(neut * 1.02), clamp01(neut * 1.02), clamp01(neut)];
    } else {
      atlas = 'hierba';
      if (bio === 'bosque' || bio === 'pantano') {
        cellIndex = rSub < 0.42 ? 0 : rSub < 0.76 ? 2 : 3;
      } else if (bio === 'tundra' || bio === 'costa') {
        cellIndex = rSub < 0.50 ? 1 : 3;
      } else {
        cellIndex = rSub < 0.34 ? 0 : rSub < 0.62 ? 1 : rSub < 0.84 ? 2 : 3;
      }
      if (bio === 'taiga' || bio === 'pantano') {
        color = [lum * 0.76, lum * 0.90, lum * 0.76];
      } else if (bio === 'tundra' || bio === 'costa') {
        color = [lum * 1.06, lum * 0.96, lum * 0.70];
      } else if (bio === 'bosque') {
        color = [lum * 0.84, lum * 0.97, lum * 0.78];
      } else {
        color = [lum * 0.94, lum * 1.04, lum * 0.86];
      }
    }

    const { col, row } = celdaUV(cellIndex);
    return { atlas, cellIndex, col, row, sx, sy, sz, rotY, color };
  }

  // Dilata RGB desde píxeles con alfa hacia píxeles transparentes adyacentes para evitar bordes negros en mipmaps
  function dilatarBordesAlpha(ctx, w, h, pasadas = 6) {
    if (!ctx || typeof ctx.getImageData !== 'function' || typeof ctx.putImageData !== 'function') return false;
    const img = ctx.getImageData(0, 0, w, h);
    const src0 = img && img.data;
    if (!src0 || src0.length !== w * h * 4) return false;

    const total = w * h * 4;
    let src = new Uint8ClampedArray(src0);
    let dst = new Uint8ClampedArray(total);
    let hayOpacos = false;
    for (let i = 3; i < total; i += 4) {
      if (src[i] > 24) { hayOpacos = true; break; }
    }
    if (!hayOpacos) return false;

    const alphaMask = new Uint8Array(w * h);
    for (let p = 0, i = 3; p < w * h; p++, i += 4) {
      alphaMask[p] = src[i] > 24 ? 1 : 0;
    }

    const dx = [-1, 1, 0, 0, -1, 1, -1, 1];
    const dy = [0, 0, -1, 1, -1, -1, 1, 1];

    for (let pass = 0; pass < pasadas; pass++) {
      dst.set(src);
      let cambio = false;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const p = y * w + x;
          if (alphaMask[p]) continue;
          const idx = p * 4;
          if (src[idx + 3] > 24) continue;
          let sr = 0, sg = 0, sb = 0, cnt = 0;
          for (let k = 0; k < 8; k++) {
            const nx = x + dx[k];
            const ny = y + dy[k];
            if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
            const np = ny * w + nx;
            if (alphaMask[np] !== 1) continue;
            const nIdx = np * 4;
            sr += src[nIdx];
            sg += src[nIdx + 1];
            sb += src[nIdx + 2];
            cnt++;
          }
          if (cnt > 0) {
            dst[idx] = (sr / cnt) | 0;
            dst[idx + 1] = (sg / cnt) | 0;
            dst[idx + 2] = (sb / cnt) | 0;
            dst[idx + 3] = 0;
            alphaMask[p] = 2;
            cambio = true;
          }
        }
      }
      for (let p = 0; p < w * h; p++) {
        if (alphaMask[p] === 2) alphaMask[p] = 1;
      }
      const tmp = src;
      src = dst;
      dst = tmp;
      if (!cambio) break;
    }

    // Preservar el canal alfa original en toda la imagen; solo copiar RGB dilatado donde alfa era 0
    for (let i = 0; i < total; i += 4) {
      if (src0[i + 3] === 0) {
        src0[i] = src[i];
        src0[i + 1] = src[i + 1];
        src0[i + 2] = src[i + 2];
      }
    }
    ctx.putImageData(img, 0, 0);
    return true;
  }

  // Primitivas compartidas de dibujo botánico sobre Canvas 2D
  function trazarHojaCurva(ctx, bx, by, tx, ty, cx, cy, anchoBase, colBase, colPunta) {
    const grad = ctx.createLinearGradient(bx, by, tx, ty);
    grad.addColorStop(0, colBase);
    grad.addColorStop(1, colPunta);
    const nx = -(ty - by);
    const ny = tx - bx;
    const len = Math.hypot(nx, ny) || 1;
    const px = (nx / len) * (anchoBase * 0.5);
    const py = (ny / len) * (anchoBase * 0.5);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(bx - px, by - py);
    ctx.quadraticCurveTo(cx - px * 0.45, cy - py * 0.45, tx, ty);
    ctx.quadraticCurveTo(cx + px * 0.45, cy + py * 0.45, bx + px, by + py);
    ctx.closePath();
    ctx.fill();
  }

  function trazarTalloFino(ctx, bx, by, cx, cy, tx, ty, grosor, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = grosor;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(cx, cy, tx, ty);
    ctx.stroke();
  }

  function dibujarEspigaTrigo(ctx, x0, y0, ang, largo, ancho, tonos, conBarbas, rng) {
    ctx.save();
    ctx.translate(x0, y0);
    ctx.rotate(ang);

    const granos = 8;
    for (let i = 0; i < granos; i++) {
      const t = i / (granos - 1);
      const gy = -largo * t;
      const rW = ancho * (0.44 - Math.abs(t - 0.42) * 0.24);
      const rH = (largo / granos) * 0.92;
      const lado = i % 2 === 0 ? -1 : 1;

      if (conBarbas) {
        ctx.strokeStyle = tonos.barba;
        ctx.lineWidth = 1.35;
        ctx.beginPath();
        ctx.moveTo(lado * rW * 0.55, gy - rH * 0.2);
        ctx.lineTo(lado * (rW * 1.45 + rng() * 3), gy - rH * 1.9 - rng() * 6);
        ctx.stroke();
      }

      ctx.fillStyle = tonos.sombra;
      ctx.beginPath();
      ctx.ellipse(lado * rW * 0.48, gy, rW * 0.56, rH * 0.68, lado * 0.34, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = i % 2 === 0 ? tonos.granoA : tonos.granoB;
      ctx.beginPath();
      ctx.ellipse(lado * rW * 0.42 - 1, gy - 1, rW * 0.45, rH * 0.55, lado * 0.34, 0, Math.PI * 2);
      ctx.fill();
    }

    // Grano apical y barbas superiores
    ctx.fillStyle = tonos.granoB;
    ctx.beginPath();
    ctx.ellipse(0, -largo - 4, ancho * 0.19, (largo / granos) * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();
    if (conBarbas) {
      ctx.strokeStyle = tonos.barba;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(0, -largo - 6);
      ctx.lineTo((rng() - 0.5) * 6, -largo - 22 - rng() * 6);
      ctx.stroke();
    }
    ctx.restore();
  }

  function dibujarMargarita(ctx, cx, cy, radio, petColor, centroColor) {
    ctx.save();
    ctx.translate(cx, cy);
    const petalos = 9;
    ctx.fillStyle = petColor;
    for (let i = 0; i < petalos; i++) {
      const a = (i / petalos) * Math.PI * 2;
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.ellipse(0, -radio * 0.64, radio * 0.24, radio * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.arc(0, 0, radio * 0.34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = centroColor;
    ctx.beginPath();
    ctx.arc(-radio * 0.04, -radio * 0.04, radio * 0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function dibujarAmapola(ctx, cx, cy, radio, petOscuro, petVivo) {
    ctx.save();
    ctx.translate(cx, cy);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.35;
      ctx.fillStyle = i % 2 === 0 ? petOscuro : petVivo;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * radio * 0.42, Math.sin(a) * radio * 0.42, radio * 0.58, radio * 0.48, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#1f1618';
    ctx.beginPath();
    ctx.arc(0, 0, radio * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#facc15';
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * radio * 0.32, Math.sin(a) * radio * 0.32, Math.max(1.2, radio * 0.08), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function dibujarEspigaLavanda(ctx, cx, cy, alto, cOscuro, cClaro) {
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const y = cy - t * alto;
      const r = 4.2 + (1 - Math.abs(t - 0.4) * 0.8) * 3.4;
      ctx.fillStyle = i % 2 === 0 ? cOscuro : cClaro;
      ctx.beginPath();
      ctx.ellipse(cx - 2.6, y, r * 0.55, r * 0.82, -0.32, 0, Math.PI * 2);
      ctx.ellipse(cx + 2.6, y - 1.5, r * 0.55, r * 0.82, 0.32, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function pintarCeldaHierba(ctx, x0, y0, s, idx, rng) {
    const base = y0 + s - 2;
    const midX = x0 + s * 0.5;
    const paletas = [
      { b: '#2b5822', m: '#4f8f32', p: '#91c94c', sp: '#b4dd6e' },
      { b: '#3c6224', m: '#699937', p: '#b7cf58', sp: '#ded276' },
      { b: '#265224', m: '#44822e', p: '#7fc24b', sp: '#f4f1d0' },
      { b: '#787e62', m: '#a6ad8a', p: '#d7dcc2', sp: '#ecefdc' }
    ];
    const pal = paletas[idx];
    const nHojas = idx === 1 ? 18 : 22;

    for (let i = 0; i < nHojas; i++) {
      const t = (i + 0.5) / nHojas;
      const bx = x0 + s * (0.14 + t * 0.72 + (rng() - 0.5) * 0.05);
      const lean = (t - 0.5) * s * 0.34 + (rng() - 0.5) * s * 0.14;
      const alto = s * (idx === 1 ? 0.56 + rng() * 0.30 : 0.42 + (1 - Math.abs(t - 0.5)) * 0.28 + rng() * 0.18);
      const tx = Math.max(x0 + 10, Math.min(x0 + s - 10, bx + lean));
      const ty = Math.max(y0 + 12, base - alto);
      const cx = bx + lean * 0.36;
      const cy = base - alto * 0.58;
      const ancho = idx === 1 ? 6 + rng() * 3.5 : 8 + rng() * 5;
      const colB = i % 3 === 0 ? pal.b : pal.m;
      const colP = i % 2 === 0 ? pal.p : pal.sp;
      trazarHojaCurva(ctx, bx, base, tx, ty, cx, cy, ancho, colB, colP);
    }

    if (idx === 1 || idx === 3) {
      // Espiguillas finas de gramínea
      for (let k = 0; k < 4; k++) {
        const bx = x0 + s * (0.24 + k * 0.17 + (rng() - 0.5) * 0.04);
        const tx = bx + (k - 1.5) * 14 + (rng() - 0.5) * 10;
        const ty = y0 + 18 + rng() * 26;
        trazarTalloFino(ctx, bx, base, (bx + tx) * 0.5, base - s * 0.46, tx, ty, 3.0, pal.m);
        ctx.fillStyle = pal.sp;
        for (let g = 0; g < 4; g++) {
          ctx.beginPath();
          ctx.ellipse(tx + (g % 2 ? 3 : -3), ty + g * 6, 3.2, 5.4, (g % 2 ? 0.25 : -0.25), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (idx === 2) {
      // Hojas de trébol de campo y pequeños brotes crema
      for (let k = 0; k < 5; k++) {
        const cx = x0 + s * (0.22 + k * 0.14 + (rng() - 0.5) * 0.05);
        const cy = base - s * (0.26 + rng() * 0.24);
        trazarTalloFino(ctx, cx + (midX - cx) * 0.25, base, cx, cy + 28, cx, cy, 3.4, pal.b);
        for (let j = 0; j < 3; j++) {
          const a = (j / 3) * Math.PI * 2 - 0.4 + rng() * 0.3;
          ctx.fillStyle = j === 1 ? '#87cc52' : '#5aa83c';
          ctx.beginPath();
          ctx.ellipse(cx + Math.cos(a) * 8, cy + Math.sin(a) * 8, 8.2, 6.2, a, 0, Math.PI * 2);
          ctx.fill();
        }
        if (k % 2 === 0) {
          ctx.fillStyle = pal.sp;
          ctx.beginPath();
          ctx.arc(cx + 4, cy - 16, 6.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  function pintarCeldaTrigo(ctx, x0, y0, s, idx, rng) {
    const base = y0 + s - 2;
    const tonosPorCelda = [
      { tallo: '#9b7422', hoja: '#c59c34', hojaTip: '#ebd06c', granoA: '#eab308', granoB: '#fde047', sombra: '#9a6814', barba: '#fef08a' },
      { tallo: '#b38b34', hoja: '#d6b456', hojaTip: '#f4df89', granoA: '#f5ca45', granoB: '#fef08a', sombra: '#a87d22', barba: '#fef9c3' },
      { tallo: '#6f8129', hoja: '#95a93c', hojaTip: '#d8cb58', granoA: '#d4be38', granoB: '#ebe06a', sombra: '#7d7f22', barba: '#ece792' },
      { tallo: '#9b7422', hoja: '#c49b36', hojaTip: '#ebd06c', granoA: '#eab308', granoB: '#fde047', sombra: '#9a6814', barba: '#fef08a' }
    ];
    const tonos = tonosPorCelda[idx];

    // Base frondosa de hojas bajas de rastrojo/trigo
    for (let i = 0; i < 12; i++) {
      const bx = x0 + s * (0.14 + (i / 11) * 0.72);
      const alto = s * (0.28 + rng() * 0.24);
      const lean = (i / 11 - 0.5) * s * 0.28 + (rng() - 0.5) * 14;
      trazarHojaCurva(ctx, bx, base, bx + lean, base - alto, bx + lean * 0.35, base - alto * 0.65, 6.5, tonos.tallo, tonos.hojaTip);
    }

    // Tallos arqueados con espigas pesadas y barbas doradas
    const espigas = idx === 1 ? 8 : 9;
    for (let i = 0; i < espigas; i++) {
      const f = i / (espigas - 1);
      const bx = x0 + s * (0.20 + f * 0.60 + (rng() - 0.5) * 0.04);
      const curvar = idx === 1 ? 18 + (f - 0.35) * 26 : (f - 0.5) * 44 + (rng() - 0.5) * 18;
      const ex = Math.max(x0 + 24, Math.min(x0 + s - 24, bx + curvar));
      const ey = y0 + s * (0.22 + rng() * 0.18 + Math.abs(f - 0.5) * 0.14);
      const cx = bx + curvar * 0.38;
      const cy = (base + ey) * 0.5;
      trazarTalloFino(ctx, bx, base, cx, cy, ex, ey, 3.8, tonos.tallo);

      // Hoja bandera lateral en el tallo
      const hy = base - (base - ey) * 0.48;
      const hx = bx + curvar * 0.26;
      const lado = curvar >= 0 ? 1 : -1;
      trazarHojaCurva(ctx, hx, hy, hx + lado * 26, hy - 14, hx + lado * 14, hy - 18, 5.2, tonos.hoja, tonos.hojaTip);

      const ang = Math.atan2(ex - cx, cy - ey) + lado * (0.18 + rng() * 0.18);
      dibujarEspigaTrigo(ctx, ex, ey, ang, s * (0.19 + rng() * 0.06), 19, tonos, true, rng);
    }

    // Celda 3 añade amapolas silvestres entre las espigas doradas
    if (idx === 3) {
      const amapolas = [
        { bx: x0 + s * 0.34, fx: x0 + s * 0.28, fy: y0 + s * 0.44, r: 15 },
        { bx: x0 + s * 0.68, fx: x0 + s * 0.72, fy: y0 + s * 0.38, r: 17 }
      ];
      amapolas.forEach(a => {
        trazarTalloFino(ctx, a.bx, base, a.bx, base - s * 0.30, a.fx, a.fy, 3.6, '#4d7c27');
        dibujarAmapola(ctx, a.fx, a.fy, a.r, '#b91c1c', '#ef4444');
      });
    }
  }

  function pintarCeldaFlores(ctx, x0, y0, s, idx, rng) {
    const base = y0 + s - 2;
    // Follaje base denso para dar cuerpo cercano y evitar transparencia hueca
    for (let i = 0; i < 16; i++) {
      const t = i / 15;
      const bx = x0 + s * (0.16 + t * 0.68);
      const alto = s * (0.28 + rng() * 0.24);
      const lean = (t - 0.5) * s * 0.28 + (rng() - 0.5) * 14;
      trazarHojaCurva(ctx, bx, base, bx + lean, base - alto, bx + lean * 0.4, base - alto * 0.65, 7.2, '#285622', '#5ea136');
    }

    if (idx === 0) {
      // Margaritas blancas y botones de oro
      const lista = [
        { x: 0.24, y: 0.38, r: 17, tipo: 'margarita' },
        { x: 0.42, y: 0.22, r: 20, tipo: 'margarita' },
        { x: 0.62, y: 0.26, r: 18, tipo: 'margarita' },
        { x: 0.78, y: 0.42, r: 15, tipo: 'margarita' },
        { x: 0.34, y: 0.54, r: 12, tipo: 'oro' },
        { x: 0.53, y: 0.46, r: 13, tipo: 'oro' },
        { x: 0.70, y: 0.56, r: 12, tipo: 'oro' }
      ];
      lista.forEach(f => {
        const fx = x0 + s * f.x;
        const fy = y0 + s * f.y;
        const bx = x0 + s * (0.5 + (f.x - 0.5) * 0.55);
        trazarTalloFino(ctx, bx, base, (bx + fx) * 0.5, (base + fy) * 0.5, fx, fy, 4.0, '#3a7228');
        if (f.tipo === 'margarita') dibujarMargarita(ctx, fx, fy, f.r, '#f8fafc', '#facc15');
        else dibujarMargarita(ctx, fx, fy, f.r, '#fde047', '#d97706');
      });
    } else if (idx === 1) {
      // Amapolas rojas con centro negro y detalles amarillos
      const lista = [
        { x: 0.25, y: 0.36, r: 19 },
        { x: 0.45, y: 0.20, r: 22 },
        { x: 0.66, y: 0.28, r: 20 },
        { x: 0.78, y: 0.45, r: 16 },
        { x: 0.38, y: 0.50, r: 15 },
        { x: 0.56, y: 0.48, r: 15 }
      ];
      lista.forEach((f, k) => {
        const fx = x0 + s * f.x;
        const fy = y0 + s * f.y;
        const bx = x0 + s * (0.5 + (f.x - 0.5) * 0.52);
        trazarTalloFino(ctx, bx, base, (bx + fx) * 0.5, (base + fy) * 0.5, fx, fy, 4.0, '#3f7629');
        if (k === 4) dibujarMargarita(ctx, fx, fy, 13, '#fef08a', '#ea580c');
        else dibujarAmapola(ctx, fx, fy, f.r, '#b91c1c', '#ef4444');
      });
    } else if (idx === 2) {
      // Lavanda violeta y campanillas azul-cielo
      for (let i = 0; i < 6; i++) {
        const t = i / 5;
        const fx = x0 + s * (0.21 + t * 0.58 + (rng() - 0.5) * 0.04);
        const fy = y0 + s * (0.34 + Math.abs(t - 0.5) * 0.22);
        const bx = x0 + s * (0.5 + (t - 0.5) * 0.38);
        trazarTalloFino(ctx, bx, base, (bx + fx) * 0.5, (base + fy) * 0.5, fx, fy, 3.8, '#3f6f3b');
        if (i % 2 === 0) dibujarEspigaLavanda(ctx, fx, fy, s * 0.22, '#6d28d9', '#a78bfa');
        else dibujarEspigaLavanda(ctx, fx, fy, s * 0.19, '#1d4ed8', '#60a5fa');
      }
      // Brotes inferiores blancos para contraste
      dibujarMargarita(ctx, x0 + s * 0.33, y0 + s * 0.55, 11, '#e0f2fe', '#facc15');
      dibujarMargarita(ctx, x0 + s * 0.67, y0 + s * 0.53, 12, '#ede9fe', '#facc15');
    } else {
      // Ramillete silvestre variado (margaritas, amapolas, campanillas, botones de oro)
      const mix = [
        { x: 0.23, y: 0.36, kind: 'azul', r: 15 },
        { x: 0.41, y: 0.21, kind: 'amapola', r: 19 },
        { x: 0.61, y: 0.25, kind: 'margarita', r: 18 },
        { x: 0.78, y: 0.40, kind: 'oro', r: 15 },
        { x: 0.34, y: 0.52, kind: 'oro', r: 13 },
        { x: 0.52, y: 0.45, kind: 'violeta', r: 16 },
        { x: 0.70, y: 0.55, kind: 'rosa', r: 14 }
      ];
      mix.forEach(f => {
        const fx = x0 + s * f.x;
        const fy = y0 + s * f.y;
        const bx = x0 + s * (0.5 + (f.x - 0.5) * 0.55);
        trazarTalloFino(ctx, bx, base, (bx + fx) * 0.5, (base + fy) * 0.5, fx, fy, 4.0, '#3a7228');
        if (f.kind === 'amapola') dibujarAmapola(ctx, fx, fy, f.r, '#be123c', '#f43f5e');
        else if (f.kind === 'margarita') dibujarMargarita(ctx, fx, fy, f.r, '#f8fafc', '#f59e0b');
        else if (f.kind === 'oro') dibujarMargarita(ctx, fx, fy, f.r, '#facc15', '#b45309');
        else if (f.kind === 'rosa') dibujarMargarita(ctx, fx, fy, f.r, '#f9a8d4', '#fde047');
        else if (f.kind === 'azul') dibujarEspigaLavanda(ctx, fx, fy + 14, s * 0.16, '#2563eb', '#93c5fd');
        else dibujarEspigaLavanda(ctx, fx, fy + 14, s * 0.17, '#7c3aed', '#c4b5fd');
      });
    }
  }

  // Genera un lienzo HTML5 Canvas 2×2 (4 celdas botánicas) para el tipo indicado
  function crearAtlasCanvas(tipo, tam = 512) {
    if (typeof document === 'undefined' || typeof document.createElement !== 'function') return null;
    const canvas = document.createElement('canvas');
    canvas.width = tam;
    canvas.height = tam;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return canvas;
    if (typeof ctx.clearRect === 'function') ctx.clearRect(0, 0, tam, tam);

    const cell = Math.floor(tam / 2);
    const seedBase = tipo === 'trigo' ? 4019 : tipo === 'flores' ? 7919 : 1307;

    for (let idx = 0; idx < 4; idx++) {
      const gx = idx & 1;
      const gy = idx < 2 ? 0 : 1;
      const x0 = gx * cell;
      const y0 = gy * cell;
      const rng = makeRng(seedBase + idx * 977);
      if (ctx.save) {
        ctx.save();
        if (typeof ctx.beginPath === 'function' && typeof ctx.rect === 'function' && typeof ctx.clip === 'function') {
          ctx.beginPath();
          ctx.rect(x0 + 2, y0 + 2, cell - 4, cell - 4);
          ctx.clip();
        }
      }
      if (tipo === 'trigo') pintarCeldaTrigo(ctx, x0, y0, cell, idx, rng);
      else if (tipo === 'flores') pintarCeldaFlores(ctx, x0, y0, cell, idx, rng);
      else pintarCeldaHierba(ctx, x0, y0, cell, idx, rng);
      if (ctx.restore) ctx.restore();
    }

    dilatarBordesAlpha(ctx, tam, tam, 6);
    return canvas;
  }

  // Geometría en estrella de 3 planos cruzados con 2 tramos verticales para flexión orgánica al viento
  function crearGeometriaMataAtlas(THREE, ancho, alto, maxInstancias = 1800) {
    const P = [], N = [], U = [], C = [], I = [];
    const rBase = ancho * 0.44;
    const rMid = ancho * 0.49;
    const rTop = ancho * 0.55;
    const yMid = alto * 0.50;

    for (let p = 0; p < 3; p++) {
      const ang = (p * Math.PI) / 3;
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);
      const baseV = p * 6;
      const pushVert = (rad, y, u, v, cr, cg, cb) => {
        const vx = ca * rad;
        const vz = sa * rad;
        const nx = vx * 0.24;
        const ny = 0.97;
        const nz = vz * 0.24;
        const nl = Math.hypot(nx, ny, nz) || 1;
        P.push(vx, y, vz);
        N.push(nx / nl, ny / nl, nz / nl);
        U.push(u, v);
        C.push(cr, cg, cb);
      };

      pushVert(-rBase, 0, 0, 0, 0.66, 0.68, 0.62);
      pushVert(rBase, 0, 1, 0, 0.66, 0.68, 0.62);
      pushVert(-rMid, yMid, 0, 0.5, 0.94, 0.95, 0.92);
      pushVert(rMid, yMid, 1, 0.5, 0.94, 0.95, 0.92);
      pushVert(-rTop, alto, 0, 1, 1.07, 1.07, 1.05);
      pushVert(rTop, alto, 1, 1, 1.07, 1.07, 1.05);

      I.push(
        baseV + 0, baseV + 1, baseV + 2,
        baseV + 1, baseV + 3, baseV + 2,
        baseV + 2, baseV + 3, baseV + 4,
        baseV + 3, baseV + 5, baseV + 4
      );
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
    geo.setIndex(I);
    geo.setAttribute('aCell', new THREE.InstancedBufferAttribute(new Float32Array(maxInstancias * 2), 2));
    geo.computeBoundingSphere();
    return geo;
  }

  // Geometría ultraligera para el anillo lejano (2 planos cruzados × 1 tramo vertical = 4 triángulos)
  function crearGeometriaMataLejana(THREE, ancho, alto, maxInstancias = 1600) {
    const P = [], N = [], U = [], C = [], I = [];
    const rBase = ancho * 0.48;
    const rTop = ancho * 0.56;

    for (let p = 0; p < 2; p++) {
      const ang = (p * Math.PI) / 2 + Math.PI / 4;
      const ca = Math.cos(ang), sa = Math.sin(ang);
      const baseV = p * 4;
      const pushVert = (rad, y, u, v, cr, cg, cb) => {
        P.push(ca * rad, y, sa * rad);
        N.push(0, 1, 0);
        U.push(u, v);
        C.push(cr, cg, cb);
      };
      pushVert(-rBase, 0, 0, 0, 0.72, 0.75, 0.68);
      pushVert(rBase, 0, 1, 0, 0.72, 0.75, 0.68);
      pushVert(-rTop, alto, 0, 1, 1.06, 1.06, 1.04);
      pushVert(rTop, alto, 1, 1, 1.06, 1.06, 1.04);
      I.push(baseV + 0, baseV + 1, baseV + 2, baseV + 1, baseV + 3, baseV + 2);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
    geo.setIndex(I);
    geo.setAttribute('aCell', new THREE.InstancedBufferAttribute(new Float32Array(maxInstancias * 2), 2));
    geo.computeBoundingSphere();
    return geo;
  }

  function crearTexturaAtlas(THREE, tipo, renderer, tam = 512) {
    const canvas = crearAtlasCanvas(tipo, tam);
    let tex;
    if (canvas && typeof THREE.CanvasTexture === 'function') {
      tex = new THREE.CanvasTexture(canvas);
    } else {
      const fallback = new Uint8Array([255, 255, 255, 255]);
      tex = new THREE.DataTexture(fallback, 1, 1, THREE.RGBAFormat);
    }
    if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    const maxAniso = renderer && renderer.capabilities && typeof renderer.capabilities.getMaxAnisotropy === 'function'
      ? renderer.capabilities.getMaxAnisotropy()
      : 1;
    tex.anisotropy = Math.max(1, Math.min(4, maxAniso));
    tex.needsUpdate = true;
    return tex;
  }

  function crearCapaPradera(THREE, tipo, maxInstancias, terrainU = {}, renderer = null, opts = {}) {
    const meta = ATLAS_META[tipo] || ATLAS_META.hierba;
    const esLejana = !!(opts && opts.esLejana);
    const tex = (opts && opts.texCompartida) ? opts.texCompartida : crearTexturaAtlas(THREE, meta.id, renderer, meta.tam);
    const geo = esLejana
      ? crearGeometriaMataLejana(THREE, meta.anchoBase * 1.85, meta.altoBase * 1.15, maxInstancias)
      : crearGeometriaMataAtlas(THREE, meta.anchoBase, meta.altoBase, maxInstancias);
    const mat = new THREE.MeshLambertMaterial({
      map: tex,
      vertexColors: true,
      side: THREE.DoubleSide,
      alphaTest: esLejana ? 0.30 : 0.34
    });

    const altoUniform = esLejana ? meta.altoBase * 1.15 : meta.altoBase;
    const swayUniform = esLejana ? meta.swayAmp * 1.15 : meta.swayAmp;
    const uFadeInStart = { value: opts.fadeInStart != null ? opts.fadeInStart : -2.0 };
    const uFadeInEnd = { value: opts.fadeInEnd != null ? opts.fadeInEnd : -1.0 };
    const uFadeStart = { value: opts.fadeStart != null ? opts.fadeStart : (esLejana ? 72.0 : 25.5) };
    const uFadeEnd = { value: opts.fadeEnd != null ? opts.fadeEnd : (esLejana ? 92.0 : 36.0) };
    const uNubesSombra = terrainU.uNubesSombra || { value: 0 };
    const uEstiloZelda = terrainU.uEstiloZelda || { value: 0 };

    mat.userData = Object.assign(mat.userData || {}, {
      fadeUniforms: { uFadeInStart, uFadeInEnd, uFadeStart, uFadeEnd }
    });
    mat.customProgramCacheKey = () => 'pradera-atlas-v2-' + meta.id + (esLejana ? '-far' : '-near');
    mat.onBeforeCompile = shader => {
      shader.uniforms.uTime = terrainU.uTime || { value: 0 };
      shader.uniforms.uHeroXZ = terrainU.uHeroXZ || { value: new THREE.Vector2(0, 0) };
      shader.uniforms.uSwayAmp = { value: swayUniform };
      shader.uniforms.uSwayFreq = { value: meta.swayFreq };
      shader.uniforms.uAltoBase = { value: altoUniform };
      shader.uniforms.uFadeInStart = uFadeInStart;
      shader.uniforms.uFadeInEnd = uFadeInEnd;
      shader.uniforms.uFadeStart = uFadeStart;
      shader.uniforms.uFadeEnd = uFadeEnd;
      shader.uniforms.uNubesSombra = uNubesSombra;
      shader.uniforms.uEstiloZelda = uEstiloZelda;

      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', [
          '#include <common>',
          'uniform float uTime;',
          'uniform vec2 uHeroXZ;',
          'uniform float uSwayAmp;',
          'uniform float uSwayFreq;',
          'uniform float uAltoBase;',
          'uniform float uFadeInStart;',
          'uniform float uFadeInEnd;',
          'uniform float uFadeStart;',
          'uniform float uFadeEnd;',
          'uniform float uNubesSombra;',
          'attribute vec2 aCell;',
          'varying float vNubeSombra;',
          'float praderaRuido(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); float a = fract(sin(dot(i, vec2(127.1, 311.7))) * 43758.5453); float b = fract(sin(dot(i + vec2(1.0, 0.0), vec2(127.1, 311.7))) * 43758.5453); float c = fract(sin(dot(i + vec2(0.0, 1.0), vec2(127.1, 311.7))) * 43758.5453); float d = fract(sin(dot(i + vec2(1.0, 1.0), vec2(127.1, 311.7))) * 43758.5453); return mix(mix(a, b, f.x), mix(c, d, f.x), f.y); }'
        ].join('\n'))
        .replace('#include <uv_vertex>', [
          '#include <uv_vertex>',
          '#ifdef USE_MAP',
          '\tvMapUv = aCell * 0.5 + vec2(0.008) + vMapUv * 0.484;',
          '#endif'
        ].join('\n'))
        .replace('#include <begin_vertex>', [
          '#include <begin_vertex>',
          'vec4 wPosG = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);',
          'float dHeroG = length(wPosG.xz - uHeroXZ);',
          'float inF = smoothstep(uFadeInStart, uFadeInEnd, dHeroG);',
          'float edgeF = inF * (1.0 - smoothstep(uFadeStart, uFadeEnd, dHeroG));',
          'transformed.y *= edgeF;',
          'float pN1 = praderaRuido(wPosG.xz * 0.0036 + vec2(uTime * 0.016, uTime * 0.009));',
          'float pN2 = praderaRuido(wPosG.xz * 0.0085 - vec2(uTime * 0.011, -uTime * 0.007));',
          'vNubeSombra = smoothstep(0.46, 0.78, pN1 * 0.72 + pN2 * 0.28) * uNubesSombra;',
          'float hFlex = clamp(position.y / max(0.05, uAltoBase), 0.0, 1.0);',
          'float bend = hFlex * hFlex * edgeF;',
          'float ola = sin(uTime * uSwayFreq - wPosG.x * 0.24 - wPosG.z * 0.19);',
          'float rafaga = cos(uTime * (uSwayFreq * 1.47) + wPosG.x * 0.61 - wPosG.z * 0.47) * 0.35;',
          'vec2 worldShift = vec2(0.84, 0.54) * ((ola + rafaga) * uSwayAmp * bend);',
          esLejana ? '' : [
            'vec2 toG = wPosG.xz - uHeroXZ;',
            'float pushH = (1.0 - smoothstep(0.20, 1.15, dHeroG)) * 0.22 * bend;',
            'worldShift += (toG / max(dHeroG, 0.001)) * pushH;'
          ].join('\n'),
          'vec2 c0 = instanceMatrix[0].xz;',
          'vec2 c2 = instanceMatrix[2].xz;',
          'float detXZ = c0.x * c2.y - c2.x * c0.y;',
          'if (abs(detXZ) > 0.0001) {',
          '\ttransformed.x += (worldShift.x * c2.y - worldShift.y * c2.x) / detXZ;',
          '\ttransformed.z += (c0.x * worldShift.y - c0.y * worldShift.x) / detXZ;',
          '}'
        ].filter(Boolean).join('\n'));

      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', [
          '#include <common>',
          'uniform float uEstiloZelda;',
          'varying float vNubeSombra;'
        ].join('\n'))
        .replace('#include <color_fragment>', [
          '#include <color_fragment>',
          'diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.74, 0.80, 0.90), clamp(vNubeSombra, 0.0, 0.85));',
          'if (uEstiloZelda > 0.01) {',
          '\tfloat lZ = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));',
          '\tdiffuseColor.rgb = mix(diffuseColor.rgb, clamp(vec3(lZ) + (diffuseColor.rgb - vec3(lZ)) * 1.24, 0.0, 1.25) * vec3(1.03, 1.05, 0.94), uEstiloZelda * 0.72);',
          '}'
        ].join('\n'))
        .replace('#include <normal_fragment_begin>', [
          'float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;',
          'vec3 normal = normalize( vNormal );',
          'vec3 nonPerturbedNormal = normal;'
        ].join('\n'));
    };

    const mesh = new THREE.InstancedMesh(geo, mat, maxInstancias);
    // Pre-inicializar instanceColor evita recompilar shaders al usar setColorAt más tarde
    if (typeof mesh.setColorAt === 'function' && typeof THREE.Color === 'function') {
      mesh.setColorAt(0, new THREE.Color(1, 1, 1));
    }
    mesh.name = (esLejana ? 'PraderaAtlasLejos_' : 'PraderaAtlas_') + meta.id;
    mesh.frustumCulled = false;
    mesh.receiveShadow = !esLejana;
    mesh.castShadow = false;
    mesh.userData = Object.assign(mesh.userData || {}, {
      sinSombra: true,
      atlasTipo: meta.id,
      atlasTex: tex,
      esLejana
    });
    mesh.count = 0;
    mesh.visible = false;
    return mesh;
  }

  function crearCapasPradera(THREE, maxInstancias = 1800, terrainU = {}, renderer = null) {
    return {
      hierba: crearCapaPradera(THREE, 'hierba', maxInstancias, terrainU, renderer),
      trigo: crearCapaPradera(THREE, 'trigo', maxInstancias, terrainU, renderer),
      flores: crearCapaPradera(THREE, 'flores', maxInstancias, terrainU, renderer)
    };
  }

  // Anillo lejano (25..R m): reutiliza las 3 texturas sin crear nuevos lienzos ni duplicar GPU VRAM
  function crearCapasPraderaLejana(THREE, maxInstancias = 1600, terrainU = {}, renderer = null, capasCerca = {}) {
    const mk = tipo => crearCapaPradera(THREE, tipo, maxInstancias, terrainU, renderer, {
      esLejana: true,
      texCompartida: capasCerca[tipo] && capasCerca[tipo].userData && capasCerca[tipo].userData.atlasTex,
      fadeInStart: 24.5,
      fadeInEnd: 34.0,
      fadeStart: 72.0,
      fadeEnd: 92.0
    });
    const res = {
      hierba: mk('hierba'),
      trigo: mk('trigo'),
      flores: mk('flores'),
      actualizarRadios(rLejos = 92.0) {
        const end = Math.max(40.0, rLejos);
        const start = Math.max(32.0, end - Math.min(20.0, end * 0.22));
        for (const tipo of ATLAS_TIPOS) {
          const fu = res[tipo] && res[tipo].material && res[tipo].material.userData && res[tipo].material.userData.fadeUniforms;
          if (fu) {
            fu.uFadeStart.value = start;
            fu.uFadeEnd.value = end;
          }
        }
      }
    };
    return res;
  }

  // Ráfagas de viento estilizadas y motas de polen flotantes alrededor del héroe (2 draw calls ligeros)
  function crearSistemaBrisaZelda(THREE, terrainU = {}) {
    const grupo = new THREE.Group();
    grupo.name = 'BrisaZelda';
    grupo.visible = false;

    const N_RACHAS = 14;
    const N_MOTAS = 48;

    const rachaGeo = new THREE.PlaneGeometry(3.4, 0.085, 6, 1);
    const rPos = rachaGeo.attributes.position;
    for (let i = 0; i < rPos.count; i++) {
      const rx = rPos.getX(i);
      const t = (rx + 1.7) / 3.4;
      rPos.setZ(i, Math.sin(t * Math.PI) * 0.24);
      rPos.setY(i, rPos.getY(i) * Math.sin(Math.max(0.05, t * Math.PI)) + Math.sin(t * Math.PI * 2) * 0.05);
    }
    rachaGeo.computeVertexNormals();
    const rachaMat = new THREE.MeshBasicMaterial({
      color: 0xf8fafc,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const rachasMesh = new THREE.InstancedMesh(rachaGeo, rachaMat, N_RACHAS);
    rachasMesh.name = 'BrisaRachas';
    rachasMesh.frustumCulled = false;
    rachasMesh.userData.sinSombra = true;

    const motaGeo = new THREE.PlaneGeometry(0.11, 0.11);
    const motaMat = new THREE.MeshBasicMaterial({
      color: 0xfef3c7,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const motasMesh = new THREE.InstancedMesh(motaGeo, motaMat, N_MOTAS);
    motasMesh.name = 'BrisaMotas';
    motasMesh.frustumCulled = false;
    motasMesh.userData.sinSombra = true;

    grupo.add(rachasMesh);
    grupo.add(motasMesh);

    const rng = makeRng(80861);
    const rachaDatos = Array.from({ length: N_RACHAS }, () => ({
      ox: (rng() - 0.5) * 44,
      oy: 0.9 + rng() * 3.2,
      oz: (rng() - 0.5) * 44,
      vel: 4.5 + rng() * 3.5,
      fase: rng(),
      escala: 0.75 + rng() * 0.65
    }));
    const motaDatos = Array.from({ length: N_MOTAS }, () => ({
      ox: (rng() - 0.5) * 34,
      oy: 0.5 + rng() * 4.0,
      oz: (rng() - 0.5) * 34,
      vel: 0.9 + rng() * 1.4,
      fase: rng() * Math.PI * 2,
      escala: 0.7 + rng() * 0.85
    }));

    const m4 = new THREE.Matrix4(), pos = new THREE.Vector3(), quat = new THREE.Quaternion(), sc = new THREE.Vector3(), euler = new THREE.Euler();
    const wrap = (v, r) => { const d = r * 2; return ((((v + r) % d) + d) % d) - r; };

    return {
      grupo,
      rachasMesh,
      motasMesh,
      actualizar(dt, nowSec, hx, hy, hz, activo) {
        if (!activo) {
          grupo.visible = false;
          return;
        }
        grupo.visible = true;
        const wxDir = 0.84, wzDir = 0.54;
        const yaw = -Math.atan2(wzDir, wxDir);

        for (let i = 0; i < N_RACHAS; i++) {
          const r = rachaDatos[i];
          const prog = (r.fase + nowSec * 0.19) % 1;
          const pulse = Math.sin(prog * Math.PI);
          const avance = (prog - 0.5) * 26 * (r.vel / 6.0);
          const x = hx + wrap(r.ox + avance * wxDir, 24);
          const z = hz + wrap(r.oz + avance * wzDir, 24);
          const y = hy + r.oy + Math.sin(nowSec * 1.8 + r.fase * 9.0) * 0.25;
          euler.set(0.32, yaw + Math.sin(nowSec * 0.9 + i) * 0.12, 0);
          quat.setFromEuler(euler);
          const sx = r.escala * (0.4 + 0.85 * pulse);
          const sy = Math.max(0.05, r.escala * pulse);
          sc.set(sx, sy, 1);
          m4.compose(pos.set(x, y, z), quat, sc);
          rachasMesh.setMatrixAt(i, m4);
        }
        rachasMesh.instanceMatrix.needsUpdate = true;

        for (let i = 0; i < N_MOTAS; i++) {
          const m = motaDatos[i];
          const drift = nowSec * m.vel;
          const x = hx + wrap(m.ox + drift * wxDir + Math.sin(nowSec * 0.8 + m.fase) * 1.4, 18);
          const z = hz + wrap(m.oz + drift * wzDir + Math.cos(nowSec * 0.7 + m.fase) * 1.4, 18);
          const y = hy + m.oy + Math.sin(nowSec * 1.6 + m.fase) * 0.45;
          euler.set(nowSec * 0.8 + m.fase, nowSec * 1.2 + i, 0);
          quat.setFromEuler(euler);
          const s = m.escala * (0.75 + 0.25 * Math.sin(nowSec * 2.5 + m.fase));
          sc.set(s, s, s);
          m4.compose(pos.set(x, y, z), quat, sc);
          motasMesh.setMatrixAt(i, m4);
        }
        motasMesh.instanceMatrix.needsUpdate = true;
      }
    };
  }

  const api = {
    ATLAS_TIPOS,
    ATLAS_META,
    smoothstep,
    semillaOffset,
    ruidoValor,
    zonaPraderaEn,
    celdaUV,
    elegirInstanciaPradera,
    dilatarBordesAlpha,
    crearAtlasCanvas,
    crearGeometriaMataAtlas,
    crearGeometriaMataLejana,
    crearTexturaAtlas,
    crearCapaPradera,
    crearCapasPradera,
    crearCapasPraderaLejana,
    crearSistemaBrisaZelda
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PraderaAtlasLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
