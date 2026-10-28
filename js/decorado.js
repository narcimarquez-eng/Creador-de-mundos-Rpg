// Decoración del campo entre pueblos: rocas, arbustos, casas en ruinas y vallas de varios tipos.
// Todo son mallas instanciadas (pocas llamadas de dibujo), colocadas con el generador de la semilla del
// mundo. Se usa desde el visor; no depende de la interfaz. Requiere THREE como global.
(function (root) {
  'use strict';

  // Densidad de rocas por bioma (probabilidad por intento); las pendientes añaden más
  const ROCA_BIOMA = { montana: 0.7, nieve: 0.5, tundra: 0.45, desierto: 0.4, taiga: 0.25, bosque: 0.2, pradera: 0.18, costa: 0.3, pantano: 0.06 };
  // Matorrales pequeños (probabilidad por intento)
  const MATORRAL_BIOMA = { pradera: 0.75, bosque: 0.55, taiga: 0.35, costa: 0.3, tundra: 0.15, desierto: 0.08 };
  const MATORRAL_COLOR = [0x4d7a3a, 0x5b8a44, 0x3f6b33, 0x6f8c4a, 0x8a8a4a];
  const ROCA_COLOR = [0x8a8580, 0x9a948c, 0x7b766f, 0xa39d93, 0x6f6a64];
  // Desde esta distancia (m) a una celda de matorrales se dibuja su silueta en vez de las hojas
  const LOD_ARBUSTOS_M = 260;
  // Árboles del campo: probabilidad por intento según el bioma (como TREE_BIOME de los bosques del visor)
  const ARBOL_BIOMA = { bosque: 0.6, taiga: 0.5, pantano: 0.3, pradera: 0.1, montana: 0.08, tundra: 0.04, nieve: 0.02 };
  // Pinos por bioma; el resto usa el 55 % de pinos de los pueblos
  const PINO_BIOMA = { taiga: 0.9, tundra: 0.8, montana: 0.7 };
  const ARBOL_COLOR = { pino: [0x1b4332, 0x2b4a3a, 0x3b5b48], hoja: [0x2d6a4f, 0x40916c, 0x588157, 0x52b788] };
  const ARBOL_ESCALA = 0.8;   // TREE_SCALE de los pueblos (roble, álamo y pino)
  // Distancias (m) a la cámara: hasta la primera, hojas completas; hasta la segunda, hojas reducidas; más allá, silueta
  const LOD_ARBOL_M = [70, 300];

  function generar(THREE, o) {
    const rng = o.rng, L = o.limites;
    const grupo = new THREE.Group();
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), col = new THREE.Color();
    const euler = new THREE.Euler();
    const ponerInstancia = (mesh, i, x, y, z, sx, sy, sz, ry, color) => {
      p.set(x, y, z); s.set(sx, sy, sz); q.setFromEuler(euler.set(0, ry, 0));
      m4.compose(p, q, s); mesh.setMatrixAt(i, m4);
      if (color !== undefined) { col.setHex(color); mesh.setColorAt(i, col); }
    };
    const material = (extra) => new THREE.MeshLambertMaterial(Object.assign({ color: '#ffffff' }, extra));
    const pendiente = (x, z) => {
      const e = 4;
      return Math.hypot(o.altura(x + e, z) - o.altura(x - e, z), o.altura(x, z + e) - o.altura(x, z - e)) / (2 * e);
    };

    // Silueta de un arbusto o árbol: elipsoide de 80 triángulos con la caja de sus partes (origen en el suelo)
    function siluetaDe(partes) {
      const caja = new THREE.Box3();
      partes.forEach(parte => { parte.geo.computeBoundingBox(); caja.union(parte.geo.boundingBox); });
      const mx = (caja.max.x - caja.min.x) / 2, my = (caja.max.y - caja.min.y) / 2, mz = (caja.max.z - caja.min.z) / 2;
      const geo = new THREE.IcosahedronGeometry(1, 1);
      geo.scale(mx, my, mz);
      geo.translate((caja.max.x + caja.min.x) / 2, caja.min.y + my, (caja.max.z + caja.min.z) / 2);
      return geo;
    }

    // ---------------------------------------------------------------- Rocas
    // Icosaedro con relieve irregular (fijo para todas las rocas) y escala por instancia
    const rocaGeo = new THREE.IcosahedronGeometry(1, 1);
    const pos = rocaGeo.attributes.position;
    const jitter = new Map();
    for (let i = 0; i < pos.count; i++) {
      const key = pos.getX(i).toFixed(3) + ',' + pos.getY(i).toFixed(3) + ',' + pos.getZ(i).toFixed(3);
      if (!jitter.has(key)) jitter.set(key, 0.78 + 0.44 * rng.next());
      const f = jitter.get(key);
      pos.setXYZ(i, pos.getX(i) * f, pos.getY(i) * f, pos.getZ(i) * f);
    }
    rocaGeo.computeVertexNormals();
    const cantRocas = Math.min(6000, Math.round((L.maxX - L.minX) * (L.maxZ - L.minZ) / 1200));
    const rocas = [];
    for (let k = 0; k < cantRocas * 2 && rocas.length < cantRocas; k++) {
      const x = L.minX + rng.next() * (L.maxX - L.minX), z = L.minZ + rng.next() * (L.maxZ - L.minZ);
      if (o.agua(x, z) || !o.libre(x, z)) continue;
      const b = o.bioma(x, z);
      const prob = (ROCA_BIOMA[b] || 0) + Math.min(0.6, pendiente(x, z) * 1.2);
      if (!rng.chance(Math.min(0.9, prob))) continue;
      rocas.push({ x, z, v: Math.floor(rng.next() * 3), color: ROCA_COLOR[Math.floor(rng.next() * ROCA_COLOR.length)], tam: 0.5 + Math.pow(rng.next(), 2) * 2.6, ry: rng.next() * 6.28 });
    }
    if (rocas.length) {
      // Con New-Rol: tres formas de canto (cantos rodados de su generador); si no, el icosaedro de arriba
      const formas = o.props ? [1, 2, 3].map(s => o.props.rocaGeo(s, 3)) : [rocaGeo];
      formas.forEach((geo, j) => {
        const lista = rocas.filter(r => formas.length === 1 || r.v === j);
        if (!lista.length) return;
        const malla = new THREE.InstancedMesh(geo, o.props ? new THREE.MeshStandardMaterial({ roughness: 0.92 }) : material({ flatShading: true }), lista.length);
        lista.forEach((r, i) => {
          ponerInstancia(malla, i, r.x, o.altura(r.x, r.z) - 0.15 * r.tam, r.z, r.tam, r.tam * (0.55 + 0.3 * rng.next()), r.tam * (0.8 + 0.3 * rng.next()), r.ry, r.color);
        });
        malla.instanceMatrix.needsUpdate = true;
        malla.instanceColor.needsUpdate = true;
        grupo.add(malla);
      });
    }

    // ---------------------------------------------------------------- Matorrales
    // Arbustos realistas de New-Rol (ez-tree, Bush 1); si no están, el de Kenney o un poliedro de respaldo
    const opciones = [];
    const arbolArbusto = o.props ? o.props.arbolPartes('arbusto', 'lejos') : null;
    if (arbolArbusto) opciones.push({ partes: arbolArbusto, base: 0, alto: 1.3, tinta: false });
    else if (o.arbusto) opciones.push({ partes: [{ geo: o.arbusto.geometry, mat: o.arbusto.material }], base: 0, alto: 1, tinta: true });
    if (!opciones.length) opciones.push({ partes: [{ geo: new THREE.IcosahedronGeometry(1, 0), mat: material({ flatShading: true }) }], base: 0.2, alto: 0.7, tinta: true });
    const matorrales = [];
    const cantMatorrales = Math.min(6000, Math.round((L.maxX - L.minX) * (L.maxZ - L.minZ) / 450));
    for (let k = 0; k < cantMatorrales * 3 && matorrales.length < cantMatorrales; k++) {
      const x = L.minX + rng.next() * (L.maxX - L.minX), z = L.minZ + rng.next() * (L.maxZ - L.minZ);
      if (o.agua(x, z) || !o.libre(x, z)) continue;
      const b = o.bioma(x, z);
      if (!rng.chance((MATORRAL_BIOMA[b] || 0) * (1 - Math.min(0.8, pendiente(x, z) * 2)))) continue;
      matorrales.push({ x, z, o: Math.floor(rng.next() * opciones.length), color: MATORRAL_COLOR[Math.floor(rng.next() * MATORRAL_COLOR.length)], tam: 0.8 + rng.next() * 1.4, ry: rng.next() * 6.28 });
    }
    // Cada celda tiene su malla cercana (ez-tree) y una silueta lejana; el visor alterna entre ellas
    const lodCeldas = [];
    opciones.forEach((op, j) => {
      const lista = matorrales.filter(m => m.o === j);
      if (!lista.length) return;
      // Una malla instanciada por celda de 400 m: el motor descarta las celdas que no se ven
      const celdas = new Map();
      lista.forEach(m => {
        const k = Math.floor(m.x / 400) + ',' + Math.floor(m.z / 400);
        if (!celdas.has(k)) celdas.set(k, []);
        celdas.get(k).push(m);
      });
      // Silueta lejana: 80 triángulos en vez de las hojas de ez-tree (unos 1.400)
      const silueta = siluetaDe(op.partes);
      const siluetaMat = material({ flatShading: true });
      celdas.forEach(gl => {
        const cercanas = [];
        op.partes.forEach(parte => {
          const malla = new THREE.InstancedMesh(parte.geo, parte.mat, gl.length);
          gl.forEach((m, i) => ponerInstancia(malla, i, m.x, o.altura(m.x, m.z) + op.base * m.tam, m.z, m.tam, m.tam * op.alto, m.tam, m.ry, op.tinta ? m.color : undefined));
          malla.instanceMatrix.needsUpdate = true;
          if (malla.instanceColor) malla.instanceColor.needsUpdate = true;
          grupo.add(malla);
          cercanas.push(malla);
        });
        const lejana = new THREE.InstancedMesh(silueta, siluetaMat, gl.length);
        gl.forEach((m, i) => ponerInstancia(lejana, i, m.x, o.altura(m.x, m.z) + op.base * m.tam, m.z, m.tam, m.tam * op.alto, m.tam, m.ry, m.color));
        lejana.instanceMatrix.needsUpdate = true;
        lejana.instanceColor.needsUpdate = true;
        lejana.visible = false;
        grupo.add(lejana);
        // Límites reales de los arbustos de la celda, para medir la distancia a la cámara
        const r = { x0: Infinity, x1: -Infinity, z0: Infinity, z1: -Infinity, cercanas, lejana };
        gl.forEach(m => { r.x0 = Math.min(r.x0, m.x); r.x1 = Math.max(r.x1, m.x); r.z0 = Math.min(r.z0, m.z); r.z1 = Math.max(r.z1, m.z); });
        lodCeldas.push(r);
      });
    });

    // ---------------------------------------------------------------- Casas en ruinas
    // Restos de muros de piedra de altura irregular, con cascotes alrededor
    const muroGeo = new THREE.BoxGeometry(1, 1, 1);
    muroGeo.translate(0, 0.5, 0);
    const ruinas = [];
    const celdaR = 320;
    for (let x = L.minX; x < L.maxX; x += celdaR) for (let z = L.minZ; z < L.maxZ; z += celdaR) {
      if (!rng.chance(0.35)) continue;
      const cx = x + rng.next() * celdaR, cz = z + rng.next() * celdaR;
      if (o.agua(cx, cz) || !o.libre(cx, cz) || !o.libre(cx + 12, cz) || !o.libre(cx, cz + 12) || pendiente(cx, cz) > 0.5) continue;
      const muros = [];
      const n = 2 + Math.floor(rng.next() * 3);
      for (let i = 0; i < n; i++) {
        const dx = (rng.next() - 0.5) * 16, dz = (rng.next() - 0.5) * 16;
        muros.push({ x: cx + dx, z: cz + dz, ancho: 3 + rng.next() * 5, alto: 0.7 + rng.next() * 2.8, grueso: 0.5 + rng.next() * 0.4, ry: rng.next() * 6.28 });
      }
      ruinas.push({ cx, cz, muros });
    }
    if (ruinas.length) {
      const total = ruinas.reduce((a, r) => a + r.muros.length, 0);
      const malla = new THREE.InstancedMesh(muroGeo, material(), total);
      let i = 0;
      ruinas.forEach(r => r.muros.forEach(w => {
        ponerInstancia(malla, i++, w.x, o.altura(w.x, w.z), w.z, w.ancho, w.alto, w.grueso, w.ry, 0x9c9488 + (Math.floor(rng.next() * 3) * 0x080808));
      }));
      malla.instanceMatrix.needsUpdate = true;
      malla.instanceColor.needsUpdate = true;
      grupo.add(malla);
      // Cascotes: rocas pequeñas junto a los muros
      const cascotes = [];
      ruinas.forEach(r => { for (let k = 0; k < 6; k++) cascotes.push({ x: r.cx + (rng.next() - 0.5) * 22, z: r.cz + (rng.next() - 0.5) * 22, tam: 0.3 + rng.next() * 0.7, ry: rng.next() * 6.28 }); });
      const cm = new THREE.InstancedMesh(rocaGeo, material({ flatShading: true }), cascotes.length);
      cascotes.forEach((c, j) => ponerInstancia(cm, j, c.x, o.altura(c.x, c.z) - 0.1, c.z, c.tam, c.tam * 0.6, c.tam, c.ry, 0x8d8680));
      cm.instanceMatrix.needsUpdate = true;
      cm.instanceColor.needsUpdate = true;
      grupo.add(cm);
    }

    // ---------------------------------------------------------------- Cabañas de madera en ruinas
    // Cuatro tipos (derrumbada, muros, quemada y hundida) repartidos al azar; requiere js/casa-madera.js
    const C = root.CasaMaderaLib;
    if (C) {
      const celda = 520, cabanas = [];
      for (let x = L.minX; x < L.maxX; x += celda) for (let z = L.minZ; z < L.maxZ; z += celda) {
        if (!rng.chance(0.4)) continue;
        const cx = x + rng.next() * celda, cz = z + rng.next() * celda;
        if (o.agua(cx, cz) || !o.libre(cx, cz) || pendiente(cx, cz) > 0.35) continue;
        cabanas.push({
          x: cx, z: cz, ry: rng.next() * 6.28,
          tipo: C.TIPOS_RUINA[Math.floor(rng.next() * C.TIPOS_RUINA.length)],
          ancho: 5 + rng.next() * 3, fondo: 4.5 + rng.next() * 2.5, semilla: Math.floor(rng.next() * 1e6) + 1
        });
      }
      const piezas = {};
      cabanas.forEach(c => {
        const hc = o.altura(c.x, c.z), cs = Math.cos(c.ry), sn = Math.sin(c.ry);
        // El zócalo baja hasta la esquina más baja, así que no queda en el aire en una ladera
        let yEsq = hc;
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
          const lx = sx * c.ancho / 2, lz = sz * c.fondo / 2;
          yEsq = Math.min(yEsq, o.altura(c.x + lx * cs + lz * sn, c.z - lx * sn + lz * cs));
        });
        const partes = C.partesRuina(THREE, { tipo: c.tipo, ancho: c.ancho, fondo: c.fondo, semilla: c.semilla, hundir: Math.max(0, hc - yEsq + 0.2) });
        const M = new THREE.Matrix4().compose(new THREE.Vector3(c.x, hc, c.z),
          new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), c.ry), new THREE.Vector3(1, 1, 1));
        Object.keys(partes).forEach(k => { (piezas[k] = piezas[k] || []).push(partes[k].clone().applyMatrix4(M)); });
      });
      const mats = C.materiales(THREE);
      Object.keys(piezas).forEach(k => {
        const malla = new THREE.Mesh(C.fundir(THREE, piezas[k]), mats[k]);
        malla.castShadow = true; malla.receiveShadow = true;
        grupo.add(malla);
      });
    }

    // ---------------------------------------------------------------- Vallas
    // Líneas paralelas a los caminos, a unos metros de ellos. Tres tipos: de madera, de piedra y rotas.
    const tramo = 4;
    const postes = [], travesanos = [], muretes = [], setos = [];
    o.caminos.forEach(pts => {
      if (!pts || pts.length < 2) return;
      let acum = 0;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        for (acum += len; acum > 110; acum -= 110) {
          if (!rng.chance(0.8)) continue;
          const t = 1 - (acum - 110) / len;
          const px = a.x + (b.x - a.x) * t, pz = a.y + (b.y - a.y) * t;
          const tx = (b.x - a.x) / len, tz = (b.y - a.y) / len;
          const lado = rng.chance(0.5) ? 1 : -1, d = 12 + rng.next() * 6;
          const ox = px - tz * lado * d, oz = pz + tx * lado * d;
          const largo = 40 + rng.next() * 50, tipo = rng.next();
          const ry = Math.atan2(-tz, tx);   // gira el eje X de la malla hacia la dirección del camino
          for (let s = 0; s < largo; s += tramo) {
            const cx = ox + tx * (s + tramo / 2), cz = oz + tz * (s + tramo / 2);
            if (!o.libre(cx, cz) || o.agua(cx, cz)) continue;
            const px0 = ox + tx * s, pz0 = oz + tz * s;
            if (tipo < 0.35) {                                // madera: postes y dos travesaños, con algún hueco
              if (rng.chance(0.08)) continue;
              postes.push({ x: px0, z: pz0, y: o.altura(px0, pz0), ry });
              travesanos.push({ x: cx, z: cz, y: o.altura(cx, cz), ry });
            } else if (tipo < 0.7) {                          // muro bajo de piedra, o seto si hay New-Rol
              if (o.props && o.props.arbolPartes('seto', 'lejos') && rng.chance(0.5)) setos.push({ x: cx, z: cz, y: o.altura(cx, cz), ry });
              else muretes.push({ x: cx, z: cz, y: o.altura(cx, cz), ry });
            } else {                                          // valla rota: madera con muchos huecos
              if (!rng.chance(0.4)) continue;
              postes.push({ x: px0, z: pz0, y: o.altura(px0, pz0), ry });
              travesanos.push({ x: cx, z: cz, y: o.altura(cx, cz), ry });
            }
          }
        }
      }
    });
    if (postes.length) {
      const pGeo = new THREE.BoxGeometry(0.16, 1.5, 0.16); pGeo.translate(0, 0.75, 0);
      const pm = new THREE.InstancedMesh(pGeo, material(), postes.length);
      postes.forEach((c, j) => ponerInstancia(pm, j, c.x, c.y, c.z, 1, 1, 1, c.ry, 0x6b4a2b));
      pm.instanceMatrix.needsUpdate = true; pm.instanceColor.needsUpdate = true;
      grupo.add(pm);
      const tGeo = new THREE.BoxGeometry(tramo, 0.09, 0.09);
      const tm = new THREE.InstancedMesh(tGeo, material(), travesanos.length * 2);
      travesanos.forEach((c, j) => {
        ponerInstancia(tm, j * 2, c.x, c.y + 0.55, c.z, 1, 1, 1, c.ry, 0x7a5a36);
        ponerInstancia(tm, j * 2 + 1, c.x, c.y + 1.1, c.z, 1, 1, 1, c.ry, 0x7a5a36);
      });
      tm.instanceMatrix.needsUpdate = true; tm.instanceColor.needsUpdate = true;
      grupo.add(tm);
    }
    if (setos.length) {
      // Setos de New-Rol (ez-tree, Bush 3) sobre las lindes de los campos
      o.props.arbolPartes('seto', 'lejos').forEach(parte => {
        const malla = new THREE.InstancedMesh(parte.geo, parte.mat, setos.length);
        setos.forEach((c, j) => ponerInstancia(malla, j, c.x, c.y, c.z, 1, 1, 1, c.ry, undefined));
        malla.instanceMatrix.needsUpdate = true;
        grupo.add(malla);
      });
    }
    if (muretes.length) {
      const mGeo = new THREE.BoxGeometry(tramo, 0.9, 0.5); mGeo.translate(0, 0.45, 0);
      const mm = new THREE.InstancedMesh(mGeo, material(), muretes.length);
      muretes.forEach((c, j) => ponerInstancia(mm, j, c.x, c.y, c.z, 1, 1, 1, c.ry, 0xa29a8c));
      mm.instanceMatrix.needsUpdate = true; mm.instanceColor.needsUpdate = true;
      grupo.add(mm);
    }
    // ---------------------------------------------------------------- Árboles
    // Los mismos árboles de ez-tree que en los pueblos (roble, álamo y pino; los arbustos van aparte).
    // Celdas de 600 m (pocas mallas, el motor descarta las que no se ven); dentro de cada celda, cada árbol
    // cambia de detalle según su distancia a la cámara (repartirArboles). Se activan con «Bosques».
    const bosque = new THREE.Group();
    grupo.add(bosque);
    grupo.userData.arboles = bosque;
    const campo = {};
    const arbolCampo = (esp) => {
      if (campo[esp] === undefined) {
        const cerca = o.props.arbolPartes(esp, 'cerca'), lejos = o.props.arbolPartes(esp, 'lejos');
        campo[esp] = cerca && lejos ? { cerca, lejos, silueta: siluetaDe(lejos), siluetaMat: material({ flatShading: true }) } : null;
      }
      return campo[esp];
    };
    const arbolesLod = [];
    if (o.props) {
      const porCelda = new Map();
      const intentos = Math.round((L.maxX - L.minX) * (L.maxZ - L.minZ) / 1000);
      for (let k = 0; k < intentos; k++) {
        const x = L.minX + rng.next() * (L.maxX - L.minX), z = L.minZ + rng.next() * (L.maxZ - L.minZ);
        if (o.agua(x, z) || !o.libre(x, z)) continue;
        const b = o.bioma(x, z);
        if (!rng.chance((ARBOL_BIOMA[b] || 0) * (1 - Math.min(0.8, pendiente(x, z) * 2)))) continue;
        const pino = rng.chance(PINO_BIOMA[b] || 0.55);
        const esp = pino ? 'pino' : (rng.chance(0.59) ? 'roble' : 'alamo');
        if (!arbolCampo(esp)) continue;
        const paleta = ARBOL_COLOR[pino ? 'pino' : 'hoja'];
        const sc = ARBOL_ESCALA * (0.9 + rng.next() * 0.55);
        const color = paleta[Math.floor(rng.next() * paleta.length)];
        const m = new THREE.Matrix4().compose(p.set(x, o.altura(x, z) - 0.15, z), q.setFromEuler(euler.set(0, rng.next() * 6.28, 0)), s.set(sc, sc, sc));
        const clave = Math.floor(x / 600) + ',' + Math.floor(z / 600) + ',' + esp;
        if (!porCelda.has(clave)) porCelda.set(clave, { esp, arboles: [] });
        porCelda.get(clave).arboles.push({ x, z, m, color: new THREE.Color(color) });
      }
      porCelda.forEach(({ esp, arboles }) => {
        const A = arbolCampo(esp), n = arboles.length;
        const mallas = { cerca: A.cerca.map(parte => new THREE.InstancedMesh(parte.geo, parte.mat, n)), lejos: A.lejos.map(parte => new THREE.InstancedMesh(parte.geo, parte.mat, n)), silueta: new THREE.InstancedMesh(A.silueta, A.siluetaMat, n) };
        [...mallas.cerca, ...mallas.lejos, mallas.silueta].forEach(mm => { mm.count = 0; mm.visible = false; bosque.add(mm); });
        const c = { arboles, mallas };
        repartirArboles(c, Infinity, Infinity);   // sin cámara todo va en silueta hasta la primera actualización
        arbolesLod.push(c);
      });
    }
    // Reparte los árboles de una celda entre sus niveles de detalle según la distancia a la cámara
    function repartirArboles(c, cx, cz) {
      const R1 = LOD_ARBOL_M[0] * LOD_ARBOL_M[0], R2 = LOD_ARBOL_M[1] * LOD_ARBOL_M[1];
      const n = { cerca: 0, lejos: 0, silueta: 0 };
      c.arboles.forEach(a => {
        const d2 = (a.x - cx) * (a.x - cx) + (a.z - cz) * (a.z - cz);
        const nivel = d2 < R1 ? 'cerca' : d2 < R2 ? 'lejos' : 'silueta';
        const i = n[nivel]++;
        if (nivel === 'silueta') { c.mallas.silueta.setMatrixAt(i, a.m); c.mallas.silueta.setColorAt(i, a.color); }
        else { const [ramas, hojas] = c.mallas[nivel]; ramas.setMatrixAt(i, a.m); hojas.setMatrixAt(i, a.m); hojas.setColorAt(i, a.color); }
      });
      const fijar = (mm, k) => {
        mm.count = k; mm.visible = k > 0; mm.boundingSphere = null;
        mm.instanceMatrix.needsUpdate = true;
        if (mm.instanceColor) mm.instanceColor.needsUpdate = true;
      };
      ['cerca', 'lejos'].forEach(nv => c.mallas[nv].forEach(mm => fijar(mm, n[nv])));
      fijar(c.mallas.silueta, n.silueta);
    }

    // Llamado desde el visor con la posición de la cámara: cambia el detalle de matorrales y de árboles
    let camArboles = null;   // dónde se repartieron los árboles por última vez
    grupo.userData.actualizar = (x, z) => {
      lodCeldas.forEach(c => {
        const dx = Math.max(c.x0 - x, 0, x - c.x1), dz = Math.max(c.z0 - z, 0, z - c.z1);
        const cerca = Math.hypot(dx, dz) < LOD_ARBUSTOS_M;
        c.cercanas.forEach(malla => { malla.visible = cerca; });
        c.lejana.visible = !cerca;
      });
      // Los árboles solo se vuelven a repartir si la cámara se ha movido más de 4 m
      if (!camArboles || (x - camArboles.x) * (x - camArboles.x) + (z - camArboles.z) * (z - camArboles.z) > 16) {
        camArboles = { x, z };
        arbolesLod.forEach(c => repartirArboles(c, x, z));
      }
    };
    return grupo;
  }

  const api = { generar };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DecoradoLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
