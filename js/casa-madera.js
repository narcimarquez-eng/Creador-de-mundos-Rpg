// Casa de madera procedural (cabaña de oficio con chimenea, leña, barril y muela).
// Todo se genera en código: texturas en canvas, mallas y colores. Sin archivos de terceros.
// Cada material de la casa se fusiona en una sola malla, así que son pocas llamadas de dibujo.
// Requiere THREE y el importmap de «three/addons/» (BufferGeometryUtils).
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Generador determinista (misma casa en cada carga)
function rnd(seed) {
  let s = seed >>> 0 || 1;
  return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
}

let texCache = null;
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

// Reúne las mallas por material y las fusiona al final
function obra(THREE) {
  const grupos = {};
  return {
    add(clave, geom, escala, m4) {
      let g = geom.index ? geom.toNonIndexed() : geom;
      if (!g.attributes.normal) g.computeVertexNormals();
      if (escala) proyectar(THREE, g, escala);
      else if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      if (m4) g.applyMatrix4(m4);
      (grupos[clave] = grupos[clave] || []).push(g);
      return this;
    },
    fusionar() {
      const salida = {};
      Object.keys(grupos).forEach(k => {
        const lista = grupos[k].map(g => { g.deleteAttribute('color'); return g; });
        salida[k] = mergeGeometries(lista, false);
      });
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

// Crea una casa de madera. Opciones: ancho, fondo (en metros), muro (altura de la pared), pendiente, semilla,
// colorMadera (tono de la madera) y ventanas (true/false).
export function crearCasaMadera(THREE, opts = {}) {
  const ancho = opts.ancho ?? 6, fondo = opts.fondo ?? 5, muro = opts.muro ?? 2.6, subida = opts.subida ?? 2.2;
  const ov = 0.5, base = 0.6, r = rnd(opts.semilla ?? 3);
  const W = ancho / 2 + ov, Z = fondo / 2 + ov;
  const alero = base + muro, cumbre = alero + subida;
  const o = obra(THREE);
  const I = new THREE.Matrix4();

  // Zócalo de piedra y paredes de tablón
  o.add('piedra', new THREE.BoxGeometry(ancho + 0.3, base, fondo + 0.3), 1.6, I.clone().setPosition(0, base / 2, 0));
  o.add('madera', new THREE.BoxGeometry(ancho, muro, fondo), 2.5, I.clone().setPosition(0, base + muro / 2, 0));

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

  // Vigas de roble en esquinas y a media altura
  const oscura = 'oscura';
  [-1, 1].forEach(sx => [-1, 1].forEach(sz => {
    o.add(oscura, caja(THREE, 0.24, muro + 0.1, 0.24, sx * ancho / 2, base + muro / 2, sz * fondo / 2 + sz * 0.04), 2.5);
  }));
  [-1, 1].forEach(sz => {
    o.add(oscura, caja(THREE, ancho + 0.12, 0.18, 0.18, 0, base + muro, sz * (fondo / 2 + 0.06)), 2.5);
    o.add(oscura, caja(THREE, ancho + 0.12, 0.14, 0.14, 0, base + 1.3, sz * (fondo / 2 + 0.05)), 2.5);
  });

  // Tejado a dos aguas (cumbrera a lo largo de Z) con tejas
  [-1, 1].forEach(s => {
    const g = new THREE.BufferGeometry();
    const xa = s * W, xc = 0;
    const v = [[xa, alero, -Z], [xc, cumbre, -Z], [xc, cumbre, Z], [xa, alero, -Z], [xc, cumbre, Z], [xa, alero, Z]];
    g.setAttribute('position', new THREE.Float32BufferAttribute(v.flat(), 3));
    o.add('tejas', g, 1.2);
  });
  o.add(oscura, caja(THREE, 0.2, 0.2, fondo + 2 * ov + 0.2, 0, cumbre + 0.02, 0), 2.5);

  // Chimenea de piedra con tapa
  const xCh = ancho * 0.28, zCh = -fondo * 0.2, yCh = cumbre + 0.3;
  o.add('piedra', caja(THREE, 0.8, 2.4, 0.8, xCh, yCh + 0.9, zCh), 1.6);
  o.add(oscura, caja(THREE, 1.0, 0.16, 1.0, xCh, yCh + 2.12, zCh), 2.5);

  // Puerta con marco, ventanas con vidrio cálido y postigos
  const zF = fondo / 2 + 0.06;
  o.add('puerta', caja(THREE, 0.9, 2.0, 0.08, 0.7, base + 1.0, zF), 2.5);
  o.add(oscura, caja(THREE, 1.0, 0.08, 0.1, 0.7, base + 2.04, zF), 2.5);
  if (opts.ventanas !== false) {
    [-1.7, 2.2].forEach(x => {
      o.add('cristal', caja(THREE, 0.7, 0.6, 0.04, x, base + 1.7, zF + 0.01), null);
      o.add(oscura, caja(THREE, 0.9, 0.08, 0.1, x, base + 2.0, zF), 2.5);
      o.add('puerta', caja(THREE, 0.2, 0.7, 0.06, x - 0.5, base + 1.7, zF), 2.5);
      o.add('puerta', caja(THREE, 0.2, 0.7, 0.06, x + 0.5, base + 1.7, zF), 2.5);
    });
  }

  // Cobertizo lateral con leña apilada
  const xC = -ancho / 2 - 1.2;
  o.add(oscura, caja(THREE, 0.14, 2.0, 0.14, xC, base + 1.0, fondo * 0.3), 2.5);
  o.add(oscura, caja(THREE, 0.14, 2.0, 0.14, xC, base + 1.0, -fondo * 0.3), 2.5);
  const techo = new THREE.BufferGeometry();
  techo.setAttribute('position', new THREE.Float32BufferAttribute([
    -ancho / 2, base + 2.2, fondo / 2 + 0.2, -ancho / 2, base + 2.2, -fondo / 2 - 0.2, xC - 0.2, base + 2.0, -fondo / 2 - 0.2,
    -ancho / 2, base + 2.2, fondo / 2 + 0.2, xC - 0.2, base + 2.0, -fondo / 2 - 0.2, xC - 0.2, base + 2.0, fondo / 2 + 0.2
  ], 3));
  o.add('tejas', techo, 1.2);
  // Leña en pila: tres hileras en altura, la de arriba más corta
  for (let k = 0; k < 3; k++) for (let j = 0; j < 3 - k; j++) {
    const tronco = new THREE.CylinderGeometry(0.2, 0.2, 1.6, 8);
    tronco.rotateZ(Math.PI / 2);
    const z = fondo * 0.1 + (j - (2 - k) / 2) * 0.42;
    o.add('troncos', tronco, 2.5, I.clone().setPosition(xC + 0.6, base + 0.2 + k * 0.36, z));
  }

  // Barril junto a la puerta, con aros de hierro
  const bx = ancho / 2 + 0.7, bz = fondo / 2 - 0.6;
  o.add('troncos', new THREE.CylinderGeometry(0.34, 0.3, 0.9, 10), 2.5, I.clone().setPosition(bx, base + 0.45, bz));
  [0.2, 0.7].forEach(h => o.add('hierro', new THREE.CylinderGeometry(0.36, 0.36, 0.05, 10), null, I.clone().setPosition(bx, base + h, bz)));

  // Muela de afilar apoyada en el muro
  const mx = ancho / 2 + 1.5, mz = -fondo * 0.35;
  o.add('piedra', new THREE.CylinderGeometry(0.5, 0.5, 0.2, 14), 1.6, I.clone().makeRotationX(Math.PI / 2).setPosition(mx, base + 0.6, mz));
  o.add(oscura, caja(THREE, 0.2, 0.9, 0.2, mx - 0.6, base + 0.35, mz), 2.5);

  const m = o.fusionar();
  const materiales = materialesCasa(THREE, opts);
  const grupo = new THREE.Group();
  let tris = 0;
  Object.keys(m).forEach(k => {
    const malla = new THREE.Mesh(m[k], materiales[k]);
    malla.castShadow = true; malla.receiveShadow = true;
    grupo.add(malla);
    tris += m[k].attributes.position.count / 3;
  });
  grupo.userData = { triangulos: Math.round(tris), llamadas: Object.keys(m).length };
  return grupo;
}

function materialesCasa(THREE, opts) {
  const T = texturas(THREE);
  const tono = opts.colorMadera ?? 0xffffff;
  return {
    madera: new THREE.MeshLambertMaterial({ map: T.madera, color: tono, side: THREE.DoubleSide }),
    oscura: new THREE.MeshLambertMaterial({ map: T.madera, color: 0x5a3a22, side: THREE.DoubleSide }),
    troncos: new THREE.MeshLambertMaterial({ map: T.madera, color: 0x8a6444, side: THREE.DoubleSide }),
    puerta: new THREE.MeshLambertMaterial({ map: T.madera, color: 0x3f5a3c, side: THREE.DoubleSide }),
    piedra: new THREE.MeshLambertMaterial({ map: T.piedra, side: THREE.DoubleSide }),
    tejas: new THREE.MeshLambertMaterial({ map: T.tejas, side: THREE.DoubleSide }),
    cristal: new THREE.MeshStandardMaterial({ color: 0xffd08a, emissive: 0xffa040, emissiveIntensity: 0.9, roughness: 0.2 }),
    hierro: new THREE.MeshLambertMaterial({ color: 0x2b2b2b, side: THREE.DoubleSide }),
  };
}
