/*
 * casa-madera.js — Cabañas de madera procedurales (estilo oficio): texturas en canvas, mallas y colores
 * generados en código, sin archivos de terceros. Expone window.CasaMaderaLib. Requiere THREE (global o pasado).
 *
 * Variantes:
 *   cabana   cabaña de tablón con chimenea, cobertizo con leña, barril y muela
 *   rota     como la cabaña, con tablones rotos y sueltos en la fachada delantera y trasera
 *   piedra   zócalo de piedra alto, tablón encima
 *   taller   más ancha, puerta grande, dos ventanas por lado y cobertizo grande
 *   choza    pequeña, sin chimenea ni cobertizo
 */
(function (root) {
  'use strict';

  const VARIANTES = ['cabana', 'rota', 'piedra', 'taller', 'choza'];
  const MADERAS = ['t01', 't03', 't04', 't05', 't06', 't07', 't08', 't09', 't10'];
  const MADERAS_TRONCOS = ['t02', 't08'];
  const MADERAS_OSCURAS = ['t05', 't08', 't10'];
  const MADERAS_PUERTA = ['t01', 't05', 't06', 't09'];
  const MADERAS_TODAS = ['t01', 't02', 't03', 't04', 't05', 't06', 't07', 't08', 't09', 't10'];
  const TEJADOS = ['t01', 't02', 't03', 't04', 't06', 't07', 't08', 't09', 't10'];
  const TEJADOS_TODAS = ['t01', 't02', 't03', 't04', 't05', 't06', 't07', 't08', 't09', 't10'];

  // Generador determinista (la misma semilla da la misma cabaña en cada carga)
  function rnd(seed) {
    let s = (seed >>> 0) || 1;
    return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
  }

  let texCache = null, matCache = null;
  const fotoCache = new Map();
  const matVarCache = new Map();

  function cargarFoto(THREE, ruta) {
    if (!ruta) return null;
    if (fotoCache.has(ruta)) return fotoCache.get(ruta);
    if (typeof document === 'undefined' || !THREE || !THREE.TextureLoader) return null;
    const t = new THREE.TextureLoader().load(ruta, tex => { tex.needsUpdate = true; });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    fotoCache.set(ruta, t);
    return t;
  }

  function texturas(THREE) {
    if (texCache) return texCache;
    if (typeof document === 'undefined') {
      texCache = {};
      return texCache;
    }
    const hacerPar = (w, h, pintar) => {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const b = document.createElement('canvas'); b.width = w; b.height = h;
      pintar(c.getContext('2d'), b.getContext('2d'), w, h);
      const t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      const tb = new THREE.CanvasTexture(b);
      tb.wrapS = tb.wrapT = THREE.RepeatWrapping;
      tb.anisotropy = 8;
      return { map: t, bump: tb };
    };

    // 1. Tablones de roble envejecido (512x512): respaldo cuando no hay TextureLoader
    const maderaPar = hacerPar(512, 512, (g, bg, w, h) => {
      const r = rnd(7), filas = 16, al = h / filas;
      bg.fillStyle = '#a8a8a8'; bg.fillRect(0, 0, w, h);
      for (let i = 0; i < filas; i++) {
        const y0 = i * al;
        const br = 128 + ((r() * 34) | 0), bgc = 86 + ((r() * 22) | 0), bb = 50 + ((r() * 14) | 0);
        g.fillStyle = `rgb(${br},${bgc},${bb})`;
        g.fillRect(0, y0, w, al);
        bg.fillStyle = `rgb(${155 + ((r() * 30) | 0)},${155 + ((r() * 30) | 0)},${155 + ((r() * 30) | 0)})`;
        bg.fillRect(0, y0 + 2, w, al - 3);
        g.fillStyle = 'rgba(235,198,148,0.22)';
        g.fillRect(0, y0 + 2, w, 2);
        for (let k = 0; k < 9; k++) {
          const yv = y0 + 3 + r() * (al - 6);
          const osc = r() < 0.65;
          g.strokeStyle = osc ? 'rgba(52,32,16,0.46)' : 'rgba(195,148,96,0.24)';
          g.lineWidth = 0.9 + r() * 1.1;
          g.beginPath(); g.moveTo(0, yv);
          bg.strokeStyle = osc ? 'rgba(95,95,95,0.45)' : 'rgba(205,205,205,0.35)';
          bg.lineWidth = 1;
          bg.beginPath(); bg.moveTo(0, yv);
          const fase = r() * 6.28;
          for (let x = 16; x <= w; x += 16) {
            const yy = yv + Math.sin(x * 0.032 + fase) * 1.8;
            g.lineTo(x, yy); bg.lineTo(x, yy);
          }
          g.stroke(); bg.stroke();
        }
        g.fillStyle = 'rgba(28,16,8,0.88)';
        g.fillRect(0, y0, w, 3);
        bg.fillStyle = '#222222';
        bg.fillRect(0, y0, w, 3);
      }
    });

    // 2. Tejas / tejamanil rústico (512x512): respaldo cuando no hay TextureLoader
    const tejasPar = hacerPar(512, 512, (g, bg, w, h) => {
      const r = rnd(11), filas = 14, al = h / filas, anchoT = 32;
      g.fillStyle = '#3b2b1e'; g.fillRect(0, 0, w, h);
      bg.fillStyle = '#303030'; bg.fillRect(0, 0, w, h);
      for (let i = 0; i < filas; i++) {
        const y0 = i * al;
        const off = (i % 2) * (anchoT / 2);
        for (let x = -off; x < w; x += anchoT) {
          const t = 0.72 + r() * 0.32;
          const cr = Math.min(245, Math.max(60, (168 * t) | 0));
          const cg = Math.min(230, Math.max(48, (126 * t) | 0));
          const cb = Math.min(210, Math.max(36, (88 * t) | 0));
          g.fillStyle = `rgb(${cr},${cg},${cb})`;
          g.fillRect(x + 1, y0, anchoT - 2, al - 2);
          g.fillStyle = 'rgba(22,18,12,0.78)';
          g.fillRect(x, y0 + al - 3, anchoT, 3);
          bg.fillStyle = '#bcbcbc';
          bg.fillRect(x + 2, y0, anchoT - 4, al - 2);
        }
      }
    });

    // 3. Mampostería concertada de piedra (512x512): sillares rústicos poligonales/rectangulares sin elipses
    const piedraPar = hacerPar(512, 512, (g, bg, w, h) => {
      const r = rnd(23);
      g.fillStyle = '#4c4943'; g.fillRect(0, 0, w, h);
      bg.fillStyle = '#202020'; bg.fillRect(0, 0, w, h);
      const hileras = 9;
      let y = 0;
      for (let f = 0; f < hileras; f++) {
        const altoH = f === hileras - 1 ? (h - y) : Math.round((h / hileras) * (0.82 + r() * 0.36));
        const y1 = Math.min(h, y + altoH);
        let x = -((f % 2) * 34);
        while (x < w) {
          const anchoB = Math.round(52 + r() * 56);
          const x0 = Math.max(0, x + 3), x1 = Math.min(w, x + anchoB - 3);
          const y0 = y + 3, yb = y1 - 3;
          if (x1 - x0 > 10 && yb - y0 > 10) {
            const t = 0.78 + r() * 0.30;
            const cal = (r() - 0.5) * 16;
            const cr = Math.min(220, (148 * t + cal) | 0);
            const cg = Math.min(215, (143 * t + cal * 0.5) | 0);
            const cb = Math.min(205, (132 * t) | 0);
            const ch = 4; // chaflán poligonal de esquina
            g.fillStyle = `rgb(${cr},${cg},${cb})`;
            g.beginPath();
            g.moveTo(x0 + ch, y0); g.lineTo(x1 - ch, y0); g.lineTo(x1, y0 + ch);
            g.lineTo(x1, yb - ch); g.lineTo(x1 - ch, yb); g.lineTo(x0 + ch, yb);
            g.lineTo(x0, yb - ch); g.lineTo(x0, y0 + ch); g.closePath(); g.fill();

            // Margen cincelado y cara almohadillada interior
            g.strokeStyle = 'rgba(232,226,214,0.28)'; g.lineWidth = 1.5;
            g.strokeRect(x0 + 3, y0 + 3, Math.max(2, x1 - x0 - 6), Math.max(2, yb - y0 - 6));

            // Veta mineral angular
            if (r() < 0.45) {
              g.strokeStyle = 'rgba(70,66,58,0.35)'; g.lineWidth = 1.1;
              g.beginPath();
              g.moveTo(x0 + 6, y0 + (yb - y0) * r());
              g.lineTo((x0 + x1) * 0.5, y0 + (yb - y0) * r());
              g.lineTo(x1 - 6, y0 + (yb - y0) * r());
              g.stroke();
            }

            // Mapa de relieve escalonado
            bg.fillStyle = '#a8a8a8';
            bg.fillRect(x0 + 1, y0 + 1, x1 - x0 - 2, yb - y0 - 2);
            bg.fillStyle = '#dedede';
            bg.fillRect(x0 + 6, y0 + 6, Math.max(2, x1 - x0 - 12), Math.max(2, yb - y0 - 12));
          }
          x += anchoB;
        }
        y = y1;
      }
    });

    texCache = {
      madera: maderaPar.map, maderaBump: maderaPar.bump,
      tejas: tejasPar.map, tejasBump: tejasPar.bump,
      piedra: piedraPar.map, piedraBump: piedraPar.bump,
    };
    return texCache;
  }

  function normTexId(id, pool, def) {
    if (typeof id !== 'string') return def;
    const clean = id.includes('/') ? id.split('/')[1] : id;
    return pool.includes(clean) ? clean : def;
  }

  // Selector determinista de maderas y tejado para una cabaña a partir de hashes [0..1)
  function varianteTextura(h1, h2) {
    const f1 = ((h1 % 1) + 1) % 1;
    const f2 = ((h2 % 1) + 1) % 1;
    const f3 = (((h1 * 3.17 + h2 * 7.31) % 1) + 1) % 1;
    return {
      madera: MADERAS[Math.floor(f1 * MADERAS.length) % MADERAS.length],
      teja: TEJADOS[Math.floor(f2 * TEJADOS.length) % TEJADOS.length],
      oscura: MADERAS_OSCURAS[Math.floor(f3 * MADERAS_OSCURAS.length) % MADERAS_OSCURAS.length],
      puerta: MADERAS_PUERTA[Math.floor(((f1 + f2) % 1) * MADERAS_PUERTA.length) % MADERAS_PUERTA.length],
      troncos: MADERAS_TRONCOS[Math.floor(f3 * MADERAS_TRONCOS.length) % MADERAS_TRONCOS.length]
    };
  }

  // Materiales compartidos por todas las cabañas (admite variante { madera, teja, oscura, puerta, troncos })
  function materiales(THREE, opts) {
    const o = opts || {};
    const mId = normTexId(o.madera, MADERAS_TODAS, 't01');
    const tId = normTexId(o.teja, TEJADOS_TODAS, 't03');
    const oscId = normTexId(o.oscura, MADERAS_TODAS, 't05');
    const ptaId = normTexId(o.puerta, MADERAS_TODAS, 't06');
    const trId = normTexId(o.troncos, MADERAS_TODAS, 't02');
    const esDefecto = !opts;
    if (esDefecto && matCache) return matCache;

    const clave = `${mId}|${tId}|${oscId}|${ptaId}|${trId}`;
    if (matVarCache.has(clave)) return matVarCache.get(clave);

    const T = texturas(THREE);
    const baseComun = matCache || (matCache = {
      piedra: new THREE.MeshLambertMaterial({ map: T.piedra || null, bumpMap: T.piedraBump || null, bumpScale: 0.22, side: THREE.DoubleSide }),
      cristal: new THREE.MeshStandardMaterial({ color: 0xffd08a, emissive: 0xffa040, emissiveIntensity: 0.9, roughness: 0.2 }),
      hierro: new THREE.MeshLambertMaterial({ color: 0x2b2b2b, side: THREE.DoubleSide }),
      carbon: (() => {
        const fCarb = cargarFoto(THREE, 'assets/texturas/madera/t10.jpg');
        return new THREE.MeshLambertMaterial({ map: fCarb || T.madera || null, bumpMap: fCarb || T.maderaBump || null, bumpScale: 0.14, color: fCarb ? 0xb5aba4 : 0x4a3d36, side: THREE.DoubleSide });
      })()
    });

    const fMadera = cargarFoto(THREE, `assets/texturas/madera/${mId}.jpg`);
    const fOscura = cargarFoto(THREE, `assets/texturas/madera/${oscId}.jpg`);
    const fPuerta = cargarFoto(THREE, `assets/texturas/madera/${ptaId}.jpg`);
    const fTroncos = cargarFoto(THREE, `assets/texturas/madera/${trId}.jpg`);
    const fTejas = cargarFoto(THREE, `assets/texturas/tejados/${tId}.jpg`);

    const set = {
      madera: new THREE.MeshLambertMaterial({
        map: fMadera || T.madera || null,
        bumpMap: fMadera || T.maderaBump || null,
        bumpScale: 0.11,
        color: fMadera ? 0xf7f2ec : 0xffffff,
        side: THREE.DoubleSide
      }),
      oscura: new THREE.MeshLambertMaterial({
        map: fOscura || T.madera || null,
        bumpMap: fOscura || T.maderaBump || null,
        bumpScale: 0.11,
        color: fOscura ? 0xb3a192 : 0x5a3a22,
        side: THREE.DoubleSide
      }),
      troncos: new THREE.MeshLambertMaterial({
        map: fTroncos || T.madera || null,
        bumpMap: fTroncos || T.maderaBump || null,
        bumpScale: 0.13,
        color: fTroncos ? 0xf2e8dc : 0x8a6444,
        side: THREE.DoubleSide
      }),
      puerta: new THREE.MeshLambertMaterial({
        map: fPuerta || T.madera || null,
        bumpMap: fPuerta || T.maderaBump || null,
        bumpScale: 0.10,
        color: fPuerta ? 0xd9cdb8 : 0x3f5a3c,
        side: THREE.DoubleSide
      }),
      piedra: baseComun.piedra,
      tejas: new THREE.MeshLambertMaterial({
        map: fTejas || T.tejas || null,
        bumpMap: fTejas || T.tejasBump || null,
        bumpScale: 0.14,
        color: 0xffffff,
        side: THREE.DoubleSide
      }),
      cristal: baseComun.cristal,
      hierro: baseComun.hierro,
      carbon: baseComun.carbon,
      texturasUsadas: { madera: mId, teja: tId, oscura: oscId, puerta: ptaId, troncos: trId }
    };

    if (esDefecto) {
      Object.assign(matCache, set);
      matVarCache.set(clave, matCache);
      return matCache;
    }
    matVarCache.set(clave, set);
    return set;
  }

  // Proyección plana sobre el eje que no es la normal: los tablones no se estiran con el tamaño
  function proyectar(THREE, g, escala) {
    const p = g.attributes.position, n = g.attributes.normal;
    const uv = new Float32Array(p.count * 2);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
      let a, b;
      if (ax >= ay && ax >= az) { a = z; b = y; }
      else if (ay >= az) { a = x; b = z; }
      else { a = x; b = y; }
      uv[i * 2] = a / escala; uv[i * 2 + 1] = b / escala;
    }
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    return g;
  }

  // Proyección de tejados: U recorre la cumbrera/alero en horizontal y V sube hacia la cumbrera
  function proyectarTejas(THREE, g, escala) {
    const p = g.attributes.position, n = g.attributes.normal;
    const uv = new Float32Array(p.count * 2);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      let nx = n.getX(i), ny = n.getY(i), nz = n.getZ(i);
      if (ny < 0) { nx = -nx; ny = -ny; nz = -nz; }
      const hLen = Math.hypot(nx, nz);
      if (hLen > 0.05 && ny > 0.05) {
        const tx = -nz / hLen, tz = nx / hLen;
        const ux = -nx * ny / hLen, uy = hLen, uz = -nz * ny / hLen;
        uv[i * 2] = (x * tx + z * tz) / escala;
        uv[i * 2 + 1] = (x * ux + y * uy + z * uz) / escala;
      } else {
        const ax = Math.abs(nx), az = Math.abs(nz);
        if (ax >= ny && ax >= az) { uv[i * 2] = z / escala; uv[i * 2 + 1] = y / escala; }
        else if (ny >= az) { uv[i * 2] = x / escala; uv[i * 2 + 1] = z / escala; }
        else { uv[i * 2] = x / escala; uv[i * 2 + 1] = y / escala; }
      }
    }
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    return g;
  }

  // Une geometrías sin índice (posición, normal y uv) en una sola
  function fundir(THREE, lista) {
    const n = lista.reduce((a, g) => a + g.attributes.position.count, 0);
    const P = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2);
    let o = 0;
    lista.forEach(g => {
      const p = g.attributes.position, nn = g.attributes.normal, uv = g.attributes.uv;
      for (let i = 0; i < p.count; i++, o++) {
        P[o * 3] = p.getX(i); P[o * 3 + 1] = p.getY(i); P[o * 3 + 2] = p.getZ(i);
        N[o * 3] = nn.getX(i); N[o * 3 + 1] = nn.getY(i); N[o * 3 + 2] = nn.getZ(i);
        U[o * 2] = uv.getX(i); U[o * 2 + 1] = uv.getY(i);
      }
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(P, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(N, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(U, 2));
    return geo;
  }

  // Reúne las piezas de una cabaña por material
  function obra(THREE) {
    const grupos = {};
    return {
      add(clave, geom, escala, m4) {
        const g = geom.index ? geom.toNonIndexed() : geom;
        if (!g.attributes.normal) g.computeVertexNormals();
        if (escala) {
          if (clave === 'tejas') proyectarTejas(THREE, g, Math.max(2.1, escala));
          else proyectar(THREE, g, escala);
        }
        else if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
        if (m4) g.applyMatrix4(m4);
        (grupos[clave] = grupos[clave] || []).push(g);
        return this;
      },
      resultado() {
        const salida = {};
        Object.keys(grupos).forEach(k => { salida[k] = fundir(THREE, grupos[k]); });
        return salida;
      }
    };
  }

  // Caja con su posición y giro (en radianes, alrededor del eje Y)
  function caja(THREE, ancho, alto, fondo, x, y, z, ry = 0) {
    const g = new THREE.BoxGeometry(ancho, alto, fondo);
    g.applyMatrix4(new THREE.Matrix4().makeRotationY(ry).setPosition(x, y, z));
    return g;
  }

  // Tablones verticales de una fachada; en la variante rota, algunos faltan o están inclinados
  function fachada(THREE, o, r, L, z, base, muro) {
    const grueso = 0.22, paso = 0.24;
    for (let x = -L / 2; x <= L / 2 - grueso; x += paso) {
      if (r() < 0.2) continue;                     // tablón roto: falta entero
      const alto = muro * (1 - r() * 0.3);         // remate irregular
      const incl = r() < 0.2 ? (r() - 0.5) * 0.2 : 0;
      o.add('madera', caja(THREE, grueso, alto, 0.12, x + grueso / 2, base + alto / 2, z, incl), 2.5);
    }
  }

  // Crea las piezas de una cabaña (sin materiales): devuelve { clave: BufferGeometry } en metros
  function partes(THREE, opts = {}) {
    const v = VARIANTES.includes(opts.variante) ? opts.variante : 'cabana';
    const r = rnd(opts.semilla ?? 3);
    const perfil = v === 'choza' ? { ancho: 5, fondo: 4.5, muro: 2.4, subida: 1.9 }
      : v === 'taller' ? { ancho: 9, fondo: 6.5, muro: 3.0, subida: 2.6 }
      : { ancho: 7, fondo: 5.5, muro: 2.7, subida: 2.3 };
    const ancho = opts.ancho ?? perfil.ancho, fondo = opts.fondo ?? perfil.fondo;
    const muro = opts.muro ?? perfil.muro, subida = opts.subida ?? perfil.subida;
    const hundir = Math.max(0, opts.hundir ?? 0);       // cuánto baja el zócalo bajo el suelo (en laderas)
    const base = v === 'piedra' ? 1.5 : 0.6;
    const ov = 0.5, W = ancho / 2 + ov, Z = fondo / 2 + ov;
    const alero = base + muro, cumbre = alero + subida;
    const o = obra(THREE);
    const I = new THREE.Matrix4();
    const tieneChimenea = v !== 'choza' && r() < 0.8;
    const tieneCobertizo = (v === 'cabana' || v === 'rota' || v === 'taller') && r() < 0.85;
    const tieneBarril = v !== 'choza' || r() < 0.4;
    const tieneMuela = (v === 'cabana' || v === 'taller') && r() < 0.5;
    const rota = v === 'rota';

    // Zócalo de piedra (baja hasta el suelo en laderas)
    o.add('piedra', new THREE.BoxGeometry(ancho + 0.3, base + hundir, fondo + 0.3), 1.6, I.clone().setPosition(0, (base - hundir) / 2, 0));

    // Paredes de tablón. En la variante rota, las fachadas delantera y trasera son de tablones sueltos
    if (rota) {
      fachada(THREE, o, r, ancho, fondo / 2, base, muro);
      fachada(THREE, o, r, ancho, -fondo / 2, base, muro);
      // Tablón suelto apoyado contra la pared lateral
      o.add('madera', caja(THREE, 0.22, muro * 0.8, 0.1, ancho / 2 + 0.25, base + muro * 0.4, fondo * 0.25, 0.25), 2.5);
    } else {
      o.add('madera', new THREE.BoxGeometry(ancho, muro, fondo), 2.5, I.clone().setPosition(0, base + muro / 2, 0));
    }

    // Frontones de tablón (triángulos en los extremos del tejado)
    [-1, 1].forEach(s => {
      const f = new THREE.BufferGeometry();
      const z = s * fondo / 2 + s * 0.001;
      const pts = s > 0
        ? [[-ancho / 2, alero, z], [ancho / 2, alero, z], [0, cumbre, z]]
        : [[ancho / 2, alero, z], [-ancho / 2, alero, z], [0, cumbre, z]];
      f.setAttribute('position', new THREE.Float32BufferAttribute(pts.flat(), 3));
      o.add('madera', f, 2.5);
    });

    // Vigas oscuras en las esquinas y a media altura
    [-1, 1].forEach(sx => [-1, 1].forEach(sz => {
      o.add('oscura', caja(THREE, 0.24, muro + 0.1, 0.24, sx * ancho / 2, base + muro / 2, sz * fondo / 2 + sz * 0.04), 2.5);
    }));
    [-1, 1].forEach(sz => {
      o.add('oscura', caja(THREE, ancho + 0.12, 0.18, 0.18, 0, base + muro, sz * (fondo / 2 + 0.06)), 2.5);
      o.add('oscura', caja(THREE, ancho + 0.12, 0.14, 0.14, 0, base + 1.2, sz * (fondo / 2 + 0.05)), 2.5);
    });

    // Tejado a dos aguas (cumbrera a lo largo de Z) con tejas
    [-1, 1].forEach(s => {
      const g = new THREE.BufferGeometry();
      const xa = s * W, xc = 0;
      const vv = [[xa, alero, -Z], [xc, cumbre, -Z], [xc, cumbre, Z], [xa, alero, -Z], [xc, cumbre, Z], [xa, alero, Z]];
      g.setAttribute('position', new THREE.Float32BufferAttribute(vv.flat(), 3));
      o.add('tejas', g, 1.2);
    });
    o.add('oscura', caja(THREE, 0.2, 0.2, fondo + 2 * ov + 0.2, 0, cumbre + 0.02, 0), 2.5);

    // Chimenea de piedra con tapa
    if (tieneChimenea) {
      // La altura del faldón en esa x: la chimenea arranca un poco por debajo para quedar encajada
      const xCh = ancho * 0.28, zCh = -fondo * 0.2;
      const yFald = alero + subida * (1 - Math.abs(xCh) / W);
      const yIni = yFald - 0.8, yTop = yFald + 1.6;
      o.add('piedra', caja(THREE, 0.8, yTop - yIni, 0.8, xCh, (yIni + yTop) / 2, zCh), 1.6);
      o.add('oscura', caja(THREE, 1.0, 0.16, 1.0, xCh, yTop + 0.08, zCh), 2.5);
    }

    // Puerta con marco y ventanas con vidrio cálido
    const zF = fondo / 2 + 0.06;
    const puertaAncho = v === 'taller' ? 1.3 : 0.9, puertaAlto = v === 'taller' ? 2.3 : 2.0;
    o.add('puerta', caja(THREE, puertaAncho, puertaAlto, 0.08, ancho * 0.1, base + puertaAlto / 2, zF), 2.5);
    o.add('oscura', caja(THREE, puertaAncho + 0.1, 0.08, 0.1, ancho * 0.1, base + puertaAlto + 0.04, zF), 2.5);
    const xV = v === 'taller' ? [-ancho * 0.33, ancho * 0.22, ancho * 0.3] : [-ancho * 0.25, ancho * 0.3];
    xV.forEach(x => {
      o.add('cristal', caja(THREE, 0.7, 0.6, 0.04, x, base + 1.7, zF + 0.01), null);
      o.add('oscura', caja(THREE, 0.9, 0.08, 0.1, x, base + 2.0, zF), 2.5);
      o.add('puerta', caja(THREE, 0.2, 0.7, 0.06, x - 0.5, base + 1.7, zF), 2.5);
      o.add('puerta', caja(THREE, 0.2, 0.7, 0.06, x + 0.5, base + 1.7, zF), 2.5);
    });
    if (r() < 0.5) {
      const x = -ancho * 0.25;
      o.add('cristal', caja(THREE, 0.7, 0.6, 0.04, x, base + 1.7, -zF - 0.01), null);
      o.add('oscura', caja(THREE, 0.9, 0.08, 0.1, x, base + 2.0, -zF), 2.5);
    }

    // Cobertizo lateral con leña apilada
    const xC = -ancho / 2 - 1.2;
    if (tieneCobertizo) {
      const alt = v === 'taller' ? 2.4 : 2.0;
      o.add('oscura', caja(THREE, 0.14, alt, 0.14, xC, base + alt / 2, fondo * 0.3), 2.5);
      o.add('oscura', caja(THREE, 0.14, alt, 0.14, xC, base + alt / 2, -fondo * 0.3), 2.5);
      const techo = new THREE.BufferGeometry();
      techo.setAttribute('position', new THREE.Float32BufferAttribute([
        -ancho / 2, base + 2.2, fondo / 2 + 0.2, -ancho / 2, base + 2.2, -fondo / 2 - 0.2, xC - 0.2, base + alt, -fondo / 2 - 0.2,
        -ancho / 2, base + 2.2, fondo / 2 + 0.2, xC - 0.2, base + alt, -fondo / 2 - 0.2, xC - 0.2, base + alt, fondo / 2 + 0.2
      ], 3));
      o.add('tejas', techo, 1.2);
      for (let k = 0; k < 3; k++) for (let j = 0; j < 3 - k; j++) {
        const tronco = new THREE.CylinderGeometry(0.2, 0.2, 1.6, 8);
        tronco.rotateZ(Math.PI / 2);
        const z = fondo * 0.1 + (j - (2 - k) / 2) * 0.42;
        o.add('troncos', tronco, 2.5, I.clone().setPosition(xC + 0.6, base + 0.2 + k * 0.36, z));
      }
    }

    // Barril con aros de hierro junto a la puerta
    if (tieneBarril) {
      const bx = ancho / 2 + 0.7, bz = fondo / 2 - 0.6;
      o.add('troncos', new THREE.CylinderGeometry(0.34, 0.3, 0.9, 10), 2.5, I.clone().setPosition(bx, base + 0.45, bz));
      [0.2, 0.7].forEach(h => o.add('hierro', new THREE.CylinderGeometry(0.36, 0.36, 0.05, 10), null, I.clone().setPosition(bx, base + h, bz)));
    }

    // Muela de afilar apoyada en el muro
    if (tieneMuela) {
      const mx = ancho / 2 + 1.5, mz = -fondo * 0.35;
      o.add('piedra', new THREE.CylinderGeometry(0.5, 0.5, 0.2, 14), 1.6, I.clone().makeRotationX(Math.PI / 2).setPosition(mx, base + 0.6, mz));
      o.add('oscura', caja(THREE, 0.2, 0.9, 0.2, mx - 0.6, base + 0.35, mz), 2.5);
    }

    return o.resultado();
  }


  // Ruinas: derrumbada (tejado caído al lado), muros (solo quedan las paredes), quemada (negra, sin tejado)
  // y hundida (tejado combado). Usan las mismas piezas que las cabañas, rotas.
  const TIPOS_RUINA = ['derrumbada', 'muros', 'quemada', 'hundida'];
  function partesRuina(THREE, opts = {}) {
    const tipo = TIPOS_RUINA.includes(opts.tipo) ? opts.tipo : 'derrumbada';
    const r = rnd(opts.semilla ?? 5);
    const ancho = opts.ancho ?? 7, fondo = opts.fondo ?? 5.5;
    const hundir = Math.max(0, opts.hundir ?? 0);
    const base = 0.4;
    const alto = tipo === 'muros' ? 1.2 + r() * 0.8 : 0.6 + r() * 1.6;   // altura de las paredes que quedan
    const quemada = tipo === 'quemada';
    const o = obra(THREE);
    const I = new THREE.Matrix4();
    const alzar = (g, dx, dy, dz, rz, ry) => {
      g.applyMatrix4(new THREE.Matrix4().makeRotationZ(rz).premultiply(new THREE.Matrix4().makeRotationY(ry)).setPosition(dx, dy, dz));
      return g;
    };

    // Zócalo de piedra, medio hundido
    o.add('piedra', new THREE.BoxGeometry(ancho + 0.3, base + hundir, fondo + 0.3), 1.6, I.clone().setPosition(0, (base - hundir) / 2, 0));

    // Paredes rotas: fachadas con tablones que faltan, y un lateral con hueco
    fachada(THREE, o, r, ancho, fondo / 2, base, alto);
    fachada(THREE, o, r, ancho, -fondo / 2, base, alto);
    const frac = 0.4 + r() * 0.6;
    o.add('madera', caja(THREE, 0.22, alto * (0.7 + r() * 0.3), fondo * frac, ancho / 2, base + alto * 0.35, -fondo / 2 + fondo * frac / 2), 2.5);
    if (r() < 0.5) o.add('madera', caja(THREE, 0.22, alto * 0.5, fondo * 0.3, -ancho / 2, base + alto * 0.25, fondo * 0.3), 2.5);

    // Chimenea caída o en pie: un tocón de piedra
    o.add('piedra', caja(THREE, 0.8, 0.6 + r() * 1.2, 0.8, ancho * 0.3, base + 0.6, -fondo * 0.25), 1.6);

    // Tejado según el tipo
    if (tipo === 'derrumbada') {
      // Una vertiente tirada en el suelo al lado de la casa
      const lona = new THREE.BoxGeometry(3.6, 0.12, fondo + 0.8);
      o.add('tejas', alzar(lona, -ancho / 2 - 1.8, base + 0.12, 0, 0.45, 0), 1.2);
      // La otra, rota, apoyada en el muro
      const media = new THREE.BoxGeometry(ancho / 2 + 0.6, 0.12, fondo + 0.4);
      o.add('tejas', alzar(media, ancho / 4, base + alto + 0.2, 0, -0.5, 0), 1.2);
    } else if (tipo === 'hundida') {
      // Tejado combado: las dos vertientes bajan hacia el centro
      const hc = alto + 0.6;
      [-1, 1].forEach(sx => {
        const g = new THREE.BufferGeometry();
        const x0 = sx * (ancho / 2 + 0.5), z0 = -fondo / 2 - 0.4, z1 = fondo / 2 + 0.4;
        const v = [[x0, base + alto, z0], [0, hc, z0], [0, hc, z1], [x0, base + alto, z0], [0, hc, z1], [x0, base + alto, z1]];
        g.setAttribute('position', new THREE.Float32BufferAttribute(v.flat(), 3));
        o.add('tejas', g, 1.2);
      });
      o.add('oscura', caja(THREE, 0.2, 0.2, fondo, 0, hc, 0), 2.5);
    } else if (tipo === 'quemada') {
      // Solo quedan vigas carbonizadas, inclinadas
      [-1, 1].forEach(sx => {
        o.add('carbon', alzar(new THREE.BoxGeometry(0.2, 0.2, fondo + 0.6), sx * ancho * 0.3, base + alto + 0.3, 0, sx * 0.3, 0), 2.5);
      });
    }

    // Cascotes alrededor
    const n = 4 + Math.floor(r() * 5);
    for (let k = 0; k < n; k++) {
      const tam = 0.2 + r() * 0.5;
      o.add('piedra', new THREE.BoxGeometry(tam, tam * 0.6, tam), 1.6, I.clone().setPosition((r() - 0.5) * (ancho + 3), base + tam * 0.3, (r() - 0.5) * (fondo + 3)));
    }
    if (tipo !== 'muros' && r() < 0.6) {
      o.add('madera', caja(THREE, 1.4, 0.2, 0.25, (r() - 0.5) * ancho, base + 0.12, fondo * 0.6), 2.5);
    }

    const res = o.resultado();
    if (quemada && res.madera) {
      // Madera quemada: los tablones pasan al material carbonizado
      res.carbon = res.carbon ? fundir(THREE, [res.carbon, res.madera]) : res.madera;
      delete res.madera;
    }
    return res;
  }

  // Variante de una casa a partir de un número (p. ej. un hash de su posición, entre 0 y 1)
  function variante(n) {
    const i = Math.floor(((n % 1) + 1) % 1 * VARIANTES.length);
    return VARIANTES[Math.min(VARIANTES.length - 1, i)];
  }

  const api = {
    partes, partesRuina, materiales, fundir, variante, varianteTextura,
    VARIANTES, TIPOS_RUINA,
    MADERAS, MADERAS_TODAS, MADERAS_TRONCOS, MADERAS_OSCURAS, MADERAS_PUERTA,
    TEJADOS, TEJADOS_TODAS
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.CasaMaderaLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
