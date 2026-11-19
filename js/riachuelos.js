/*
 * riachuelos.js — Planificación y renderizado ligero de riachuelos cristalinos vadeables
 * a través de praderas, bosques y valles abiertos (2 draw calls totales).
 * Expone `window.RiachuelosLib` en navegador o `module.exports` en Node.
 */
(function (root) {
  'use strict';

  const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);

  function smooth(a, b, x) {
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

  const VACIO_INDICE = {
    totalSegs: 0,
    cerca: () => null,
    enCaja: () => false
  };

  function construirIndice(riachuelos, celda = 64) {
    if (!riachuelos || !riachuelos.length) return VACIO_INDICE;
    const mapa = new Map();
    let totalSegs = 0;

    for (let rIdx = 0; rIdx < riachuelos.length; rIdx++) {
      const r = riachuelos[rIdx];
      const pts = r.pts;
      if (!pts || pts.length < 2) continue;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1];
        const dx = b.x - a.x, dz = b.z - a.z;
        const len2 = dx * dx + dz * dz;
        if (len2 < 1e-4) continue;
        const pad = Math.max(a.bankW, b.bankW) + 2;
        const seg = {
          ax: a.x, az: a.z, ya: a.y,
          dx, dz, dy: b.y - a.y, len2,
          wa: a.halfW, dw: b.halfW - a.halfW,
          ba: a.bankW, db: b.bankW - a.bankW,
          ta: a.t, dt: b.t - a.t,
          prof: r.prof,
          rIdx
        };
        totalSegs++;
        const cx0 = Math.floor((Math.min(a.x, b.x) - pad) / celda);
        const cx1 = Math.floor((Math.max(a.x, b.x) + pad) / celda);
        const cz0 = Math.floor((Math.min(a.z, b.z) - pad) / celda);
        const cz1 = Math.floor((Math.max(a.z, b.z) + pad) / celda);
        for (let cx = cx0; cx <= cx1; cx++) {
          for (let cz = cz0; cz <= cz1; cz++) {
            const k = (cx << 16) ^ (cz & 0xffff);
            let arr = mapa.get(k);
            if (!arr) { arr = []; mapa.set(k, arr); }
            arr.push(seg);
          }
        }
      }
    }

    if (!totalSegs) return VACIO_INDICE;

    return {
      totalSegs,
      cerca(x, z) {
        const cx = Math.floor(x / celda), cz = Math.floor(z / celda);
        const arr = mapa.get((cx << 16) ^ (cz & 0xffff));
        if (!arr || !arr.length) return null;
        let mejor = null;
        for (let i = 0; i < arr.length; i++) {
          const s = arr[i];
          const u = clamp01(((x - s.ax) * s.dx + (z - s.az) * s.dz) / s.len2);
          const px = s.ax + s.dx * u, pz = s.az + s.dz * u;
          const d = Math.hypot(x - px, z - pz);
          const bankW = s.ba + s.db * u;
          if (d >= bankW) continue;
          if (!mejor || d < mejor.d) {
            mejor = {
              d,
              halfW: s.wa + s.dw * u,
              bankW,
              nivel: s.ya + s.dy * u,
              prof: s.prof,
              t: s.ta + s.dt * u,
              r: s.rIdx
            };
          }
        }
        return mejor;
      },
      enCaja(x0, z0, x1, z1) {
        const cx0 = Math.floor(x0 / celda), cx1 = Math.floor(x1 / celda);
        const cz0 = Math.floor(z0 / celda), cz1 = Math.floor(z1 / celda);
        for (let cx = cx0; cx <= cx1; cx++) {
          for (let cz = cz0; cz <= cz1; cz++) {
            const arr = mapa.get((cx << 16) ^ (cz & 0xffff));
            if (arr && arr.length) return true;
          }
        }
        return false;
      }
    };
  }

  // Planifica riachuelos cristalinos serpenteantes desde laderas verdes hacia valles bajos
  function planearRiachuelos(opts = {}) {
    const bounds = opts.bounds || { minX: -900, maxX: 900, minZ: -900, maxZ: 900 };
    const alturaBase = opts.alturaBase;
    const bioma = opts.bioma || (() => 'pradera');
    const libre = opts.libre || (() => true);
    const rioDist = opts.rioDist || (() => Infinity);
    const lagoDist = opts.lagoDist || (() => Infinity);
    const maxRiachuelos = Math.max(0, opts.maxRiachuelos != null ? opts.maxRiachuelos : 10);

    if (typeof alturaBase !== 'function' || maxRiachuelos <= 0) {
      return { riachuelos: [], indice: VACIO_INDICE };
    }

    const rng = makeRng(((opts.seed || 1) ^ 0x51a9c3) >>> 0);
    const spanX = Math.max(200, bounds.maxX - bounds.minX);
    const spanZ = Math.max(200, bounds.maxZ - bounds.minZ);
    const padX = Math.min(180, spanX * 0.12);
    const padZ = Math.min(180, spanZ * 0.12);
    const intentos = Math.min(2600, opts.intentos || 1400);

    const biomasAdmitidos = b => b === 'pradera' || b === 'bosque' || b === 'taiga';
    const PASO = 11.0;
    const MIN_TRAMOS = 14;
    const MAX_TRAMOS = 40;
    const riachuelos = [];

    const cercaDeOtro = (x, z, minD) => {
      const d2 = minD * minD;
      for (let i = 0; i < riachuelos.length; i++) {
        const pts = riachuelos[i].pts;
        for (let j = 0; j < pts.length; j += 2) {
          const dx = pts[j].x - x, dz = pts[j].z - z;
          if (dx * dx + dz * dz < d2) return true;
        }
      }
      return false;
    };

    for (let k = 0; k < intentos && riachuelos.length < maxRiachuelos; k++) {
      const sx = bounds.minX + padX + rng() * Math.max(40, spanX - padX * 2);
      const sz = bounds.minZ + padZ + rng() * Math.max(40, spanZ - padZ * 2);
      const b0 = bioma(sx, sz);
      if (!biomasAdmitidos(b0)) continue;
      const hStart = alturaBase(sx, sz);
      if (hStart < 2.8 || hStart > 58) continue;
      if (!libre(sx, sz, 18) || rioDist(sx, sz) < 42 || lagoDist(sx, sz) < 34) continue;
      if (cercaDeOtro(sx, sz, 85)) continue;

      // Buscar dirección inicial cuesta abajo
      let bestAng = rng() * Math.PI * 2;
      let bestH = hStart;
      for (let a = 0; a < 16; a++) {
        const ang = (a / 16) * Math.PI * 2;
        const qx = sx + Math.cos(ang) * PASO, qz = sz + Math.sin(ang) * PASO;
        const hq = alturaBase(qx, qz);
        if (hq < bestH) { bestH = hq; bestAng = ang; }
      }
      if (bestH >= hStart - 0.12) continue; // necesita pendiente inicial real

      const crudo = [{ x: sx, z: sz, y: hStart }];
      let cx = sx, cz = sz, curH = hStart, angPrev = bestAng;
      const faseM = rng() * Math.PI * 2;
      const ampM = 0.24 + rng() * 0.20;
      const freqM = 0.34 + rng() * 0.18;

      for (let step = 1; step <= MAX_TRAMOS; step++) {
        let mejorX = null, mejorZ = null, mejorScore = Infinity, mejorH = curH;
        for (let a = 0; a < 16; a++) {
          const ang = (a / 16) * Math.PI * 2;
          const nx = cx + Math.cos(ang) * PASO;
          const nz = cz + Math.sin(ang) * PASO;
          const nh = alturaBase(nx, nz);
          if (nh > curH + 0.35) continue;
          const diffAng = Math.atan2(Math.sin(ang - angPrev), Math.cos(ang - angPrev));
          if (Math.abs(diffAng) > 1.75) continue; // sin giros cerrados artificiales
          const targetBias = Math.sin(step * freqM + faseM) * ampM;
          const score = nh + Math.abs(diffAng - targetBias) * 0.95;
          if (score < mejorScore) {
            mejorScore = score;
            mejorX = nx;
            mejorZ = nz;
            mejorH = nh;
          }
        }
        if (mejorX === null) break;
        if (mejorH < 0.6) {
          crudo.push({ x: mejorX, z: mejorZ, y: Math.max(0.25, mejorH) });
          break;
        }
        if (!libre(mejorX, mejorZ, 12) || rioDist(mejorX, mejorZ) < 28 || lagoDist(mejorX, mejorZ) < 18) break;
        if (cercaDeOtro(mejorX, mejorZ, 44)) break;

        angPrev = Math.atan2(mejorZ - cz, mejorX - cx);
        cx = mejorX; cz = mejorZ; curH = mejorH;
        crudo.push({ x: cx, z: cz, y: curH });

        // Desnivel acumulado ya natural hacia valle: finalizar de forma orgánica
        if (step >= 26 && hStart - curH > 6.5 && mejorH > curH - 0.08) break;
      }

      if (crudo.length - 1 < MIN_TRAMOS) continue;

      // Suavizado espacial (mantiene manantial y desembocadura) y cota de agua monótona no-creciente
      const mitadBase = 1.9 + rng() * 0.7;
      const prof = 0.58 + rng() * 0.24;
      const pts = [];
      let minY = crudo[0].y - 0.14;
      for (let i = 0; i < crudo.length; i++) {
        const pPrev = crudo[Math.max(0, i - 1)];
        const pCur = crudo[i];
        const pNext = crudo[Math.min(crudo.length - 1, i + 1)];
        const sxm = i === 0 || i === crudo.length - 1 ? pCur.x : (pPrev.x * 0.22 + pCur.x * 0.56 + pNext.x * 0.22);
        const szm = i === 0 || i === crudo.length - 1 ? pCur.z : (pPrev.z * 0.22 + pCur.z * 0.56 + pNext.z * 0.22);
        const hTer = alturaBase(sxm, szm);
        minY = Math.min(minY, hTer - 0.14);
        const t = i / (crudo.length - 1);
        const halfW = mitadBase * (0.85 + 0.45 * t);
        pts.push({
          x: sxm,
          z: szm,
          y: minY,
          halfW,
          bankW: halfW + 3.8,
          t
        });
      }

      riachuelos.push({
        id: 'riachuelo_' + riachuelos.length,
        prof,
        semilla: (Math.floor(rng() * 1e6) + 1) >>> 0,
        pts
      });
    }

    const indice = construirIndice(riachuelos, 64);
    return { riachuelos, indice };
  }

  // Excava un lecho cóncavo vadeable (sin pared abrupta) con desvanecido limpio en extremos
  function aplicarAltura(indice, x, z, h) {
    if (!indice || !indice.totalSegs) return h;
    const hit = indice.cerca(x, z);
    if (!hit || hit.d >= hit.bankW) return h;

    const fade = smooth(0, 0.08, hit.t) * smooth(0, 0.10, 1 - hit.t);
    if (fade <= 0.001) return h;

    let perfil;
    if (hit.d <= hit.halfW) {
      const fr = hit.d / Math.max(0.25, hit.halfW);
      perfil = hit.nivel - hit.prof * (1 - 0.68 * fr * fr);
    } else {
      const u = smooth(hit.halfW, hit.bankW, hit.d);
      const orilla = hit.nivel + 0.16;
      perfil = orilla + (h - orilla) * u;
    }
    const target = Math.min(h, perfil);
    return h + (target - h) * fade;
  }

  // Mezcla grava y arena fluvial en lecho y orilla del riachuelo manteniendo suma = 1
  function aplicarSplat(indice, x, z, w) {
    if (!indice || !indice.totalSegs || !w || !Array.isArray(w.splat)) return w;
    const hit = indice.cerca(x, z);
    if (!hit || hit.d >= hit.bankW) return w;

    const fade = smooth(0, 0.08, hit.t) * smooth(0, 0.10, 1 - hit.t);
    if (fade <= 0.001) return w;

    if (hit.d <= hit.halfW) {
      const bed = [0, 0.15, 0.30, 0.55];
      const sp = w.splat.map((v, i) => v + (bed[i] - v) * fade);
      const s = sp[0] + sp[1] + sp[2] + sp[3] || 1;
      return { splat: [sp[0] / s, sp[1] / s, sp[2] / s, sp[3] / s], snow: (w.snow || 0) * (1 - fade) };
    }

    const u = smooth(hit.halfW, hit.bankW, hit.d);
    const bank = (1 - u) * 0.72 * fade;
    const sp = [
      w.splat[0] * (1 - bank * 0.65),
      w.splat[1] + bank * 0.45,
      w.splat[2] + bank * 0.25,
      w.splat[3] + bank * 0.30
    ];
    const s = sp[0] + sp[1] + sp[2] + sp[3] || 1;
    return { splat: [sp[0] / s, sp[1] / s, sp[2] / s, sp[3] / s], snow: (w.snow || 0) * (1 - bank * 0.5) };
  }

  // Construye 1 malla única de agua para todos los riachuelos y 1 InstancedMesh de cantos rodados de ribera
  function construirMallas(THREE, datos, matAgua) {
    const grupo = new THREE.Group();
    grupo.name = 'RiachuelosMundo';
    const lista = datos && datos.riachuelos ? datos.riachuelos : [];
    if (!lista.length || !THREE) return { grupo, aguaMesh: null, piedrasMesh: null };

    const P = [], C = [], U = [], I = [];
    const maxPiedras = 360;
    const piedras = [];

    for (let rIdx = 0; rIdx < lista.length; rIdx++) {
      const r = lista[rIdx];
      const pts = r.pts;
      if (!pts || pts.length < 2) continue;

      const rng = makeRng(r.semilla || (rIdx + 17));
      const baseV = P.length / 3;
      let accL = 0;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const prev = pts[Math.max(0, i - 1)];
        const next = pts[Math.min(pts.length - 1, i + 1)];
        if (i > 0) accL += Math.hypot(p.x - prev.x, p.z - prev.z);

        let tx = next.x - prev.x, tz = next.z - prev.z;
        const len = Math.hypot(tx, tz) || 1;
        tx /= len; tz /= len;
        const nx = -tz, nz = tx;
        const m = p.halfW + 0.65;
        const f = smooth(0, 0.08, p.t) * smooth(0, 0.10, 1 - p.t);
        const y = p.y;

        // 3 vértices transversales: izquierda (espuma), centro (agua cristalina), derecha (espuma)
        P.push(
          p.x + nx * m, y, p.z + nz * m,
          p.x, y, p.z,
          p.x - nx * m, y, p.z - nz * m
        );
        // Canal R = espuma orilla, G = opacidad extremo, B = 1.0 (marca de riachuelo cristalino)
        C.push(
          1, f * 0.92, 1,
          0, f * 0.92, 1,
          1, f * 0.92, 1
        );
        const vCoord = accL / 10;
        U.push(0, vCoord, 0.5, vCoord, 1, vCoord);

        if (i > 0 && i < pts.length - 1 && piedras.length < maxPiedras) {
          [-1, 1].forEach(side => {
            if (piedras.length >= maxPiedras || rng() > 0.72) return;
            const offD = p.halfW + 0.15 + rng() * 1.45;
            const px = p.x + nx * side * offD + (rng() - 0.5) * 1.4;
            const pz = p.z + nz * side * offD + (rng() - 0.5) * 1.4;
            const py = p.y - 0.02 + rng() * 0.14;
            const sc = 0.65 + rng() * 1.05;
            piedras.push({ x: px, y: py, z: pz, sx: sc * (0.9 + rng() * 0.5), sy: sc * 0.55, sz: sc * (0.85 + rng() * 0.45), rot: rng() * Math.PI * 2 });
          });
        }
      }

      for (let i = 0; i < pts.length - 1; i++) {
        const a = baseV + i * 3;
        const b = baseV + (i + 1) * 3;
        I.push(
          a, a + 1, b + 1, a, b + 1, b,
          a + 1, a + 2, b + 2, a + 1, b + 2, b + 1
        );
      }
    }

    let aguaMesh = null;
    if (I.length > 0) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
      geo.setIndex(I);
      geo.computeVertexNormals();
      aguaMesh = new THREE.Mesh(geo, matAgua);
      aguaMesh.name = 'RiachuelosAgua';
      aguaMesh.receiveShadow = false;
      aguaMesh.castShadow = false;
      aguaMesh.userData.sinSombra = true;
      grupo.add(aguaMesh);
    }

    let piedrasMesh = null;
    if (piedras.length > 0) {
      const geoP = new THREE.DodecahedronGeometry(0.32, 0);
      const matP = new THREE.MeshLambertMaterial({ color: 0xffffff });
      piedrasMesh = new THREE.InstancedMesh(geoP, matP, piedras.length);
      piedrasMesh.name = 'RiachuelosPiedras';
      piedrasMesh.receiveShadow = true;
      piedrasMesh.castShadow = false;
      piedrasMesh.userData.sinSombra = true;

      const m4 = new THREE.Matrix4(), pos = new THREE.Vector3(), quat = new THREE.Quaternion(), sc = new THREE.Vector3(), yAxis = new THREE.Vector3(0, 1, 0), col = new THREE.Color();
      piedras.forEach((pd, idx) => {
        quat.setFromAxisAngle(yAxis, pd.rot);
        sc.set(pd.sx, pd.sy, pd.sz);
        m4.compose(pos.set(pd.x, pd.y, pd.z), quat, sc);
        piedrasMesh.setMatrixAt(idx, m4);
        const lum = 0.56 + (idx % 5) * 0.055;
        col.setRGB(lum * 0.96, lum * 0.98, lum * 1.03);
        piedrasMesh.setColorAt(idx, col);
      });
      piedrasMesh.instanceMatrix.needsUpdate = true;
      if (piedrasMesh.instanceColor) piedrasMesh.instanceColor.needsUpdate = true;
      grupo.add(piedrasMesh);
    }

    return { grupo, aguaMesh, piedrasMesh };
  }

  const api = {
    construirIndice,
    planearRiachuelos,
    aplicarAltura,
    aplicarSplat,
    construirMallas
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RiachuelosLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
