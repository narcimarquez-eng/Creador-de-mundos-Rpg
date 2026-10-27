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

  // Generador determinista (la misma semilla da la misma cabaña en cada carga)
  function rnd(seed) {
    let s = (seed >>> 0) || 1;
    return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
  }

  let texCache = null, matCache = null;
  function texturas(THREE) {
    if (texCache) return texCache;
    const hacer = (w, h, pintar) => {
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      pintar(c.getContext('2d'), w, h);
      const t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      return t;
    };
    texCache = {
      // Tablones: 16 hileras con vetas, juntas y extremos de tabla
      madera: hacer(256, 256, (g, w, h) => {
        const r = rnd(7), filas = 16, al = h / filas;
        for (let i = 0; i < filas; i++) {
          g.fillStyle = `rgb(${130 + r() * 30 | 0},${88 + r() * 18 | 0},${52 + r() * 12 | 0})`;
          g.fillRect(0, i * al, w, al);
          g.strokeStyle = 'rgba(55,35,20,0.55)';
          for (let k = 0; k < 5; k++) {
            const y0 = i * al + r() * al;
            g.beginPath(); g.moveTo(0, y0);
            for (let x = 0; x <= w; x += 32) g.lineTo(x, y0 + Math.sin(x * 0.05 + k) * 1.5);
            g.lineWidth = 1; g.stroke();
          }
          g.fillStyle = 'rgba(35,22,12,0.85)';
          g.fillRect(0, i * al, w, 2);
          if (i % 2 === 0) g.fillRect(r() * w, i * al, 2, al);
        }
      }),
      // Tejas: hileras de tejas redondeadas con bordes oscuros y musgo
      tejas: hacer(256, 256, (g, w, h) => {
        const r = rnd(11), filas = 12, al = h / filas;
        for (let i = 0; i < filas; i++) {
          for (let x = -16 * (i % 2); x < w; x += 32) {
            const t = 0.75 + r() * 0.25;
            g.fillStyle = `rgb(${165 * t | 0},${128 * t | 0},${92 * t | 0})`;
            g.beginPath(); g.roundRect(x + 1, i * al, 30, al + 4, 4); g.fill();
            g.fillStyle = 'rgba(30,28,20,0.7)';
            g.fillRect(x + 1, i * al + al, 30, 2);
            if (r() < 0.25) { g.fillStyle = 'rgba(70,110,50,0.5)'; g.fillRect(x + 4 + r() * 18, i * al + 3, 8, 5); }
          }
        }
      }),
      // Piedra: mampuestos irregulares sobre mortero
      piedra: hacer(256, 256, (g, w, h) => {
        const r = rnd(23);
        g.fillStyle = '#6e6a61'; g.fillRect(0, 0, w, h);
        for (let i = 0; i < 70; i++) {
          const t = 0.8 + r() * 0.25;
          g.fillStyle = `rgb(${150 * t | 0},${146 * t | 0},${136 * t | 0})`;
          g.beginPath(); g.ellipse(r() * w, r() * h, 12 + r() * 16, 8 + r() * 10, r() * 3, 0, Math.PI * 2); g.fill();
        }
      }),
    };
    return texCache;
  }

  // Materiales compartidos por todas las cabañas
  function materiales(THREE) {
    if (matCache) return matCache;
    const T = texturas(THREE);
    matCache = {
      madera: new THREE.MeshLambertMaterial({ map: T.madera, side: THREE.DoubleSide }),
      oscura: new THREE.MeshLambertMaterial({ map: T.madera, color: 0x5a3a22, side: THREE.DoubleSide }),
      troncos: new THREE.MeshLambertMaterial({ map: T.madera, color: 0x8a6444, side: THREE.DoubleSide }),
      puerta: new THREE.MeshLambertMaterial({ map: T.madera, color: 0x3f5a3c, side: THREE.DoubleSide }),
      piedra: new THREE.MeshLambertMaterial({ map: T.piedra, side: THREE.DoubleSide }),
      tejas: new THREE.MeshLambertMaterial({ map: T.tejas, side: THREE.DoubleSide }),
      cristal: new THREE.MeshStandardMaterial({ color: 0xffd08a, emissive: 0xffa040, emissiveIntensity: 0.9, roughness: 0.2 }),
      hierro: new THREE.MeshLambertMaterial({ color: 0x2b2b2b, side: THREE.DoubleSide }),
    };
    return matCache;
  }

  // Proyección plana sobre el eje que no es la normal: los tablones y tejas no se estiran con el tamaño
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
        if (escala) proyectar(THREE, g, escala);
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

  // Variante de una casa a partir de un número (p. ej. un hash de su posición, entre 0 y 1)
  function variante(n) {
    const i = Math.floor(((n % 1) + 1) % 1 * VARIANTES.length);
    return VARIANTES[Math.min(VARIANTES.length - 1, i)];
  }

  root.CasaMaderaLib = { partes, materiales, fundir, variante, VARIANTES };
})(typeof window !== 'undefined' ? window : globalThis);
