/*
 * decorado-mundo.js — Decoración temática de Puntos de Interés (POIs), caminos,
 * riberas/costas y atmósfera ambiental ligera (luciérnagas, nieve y pavesas).
 * Expone window.DecoradoMundoLib (o module.exports en Node para pruebas).
 */
(function (root) {
  "use strict";

  function hashNum(a, b) {
    let h = (Math.imul((a | 0) ^ 0x9e3779b9, 2654435761) ^ Math.imul((b | 0) ^ 0x85ebca6b, 2246822519)) >>> 0;
    h ^= h >>> 15;
    h = Math.imul(h, 2246822519) >>> 0;
    return (h >>> 0) / 4294967296;
  }

  function cargarTex(THREE, ruta, repX, repY) {
    if (!THREE || typeof THREE.TextureLoader !== 'function' || typeof document === 'undefined') return null;
    const t = new THREE.TextureLoader().load(ruta);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
    t.repeat.set(repX || 1, repY || 1);
    return t;
  }

  function crearMateriales(THREE) {
    const texMadera = cargarTex(THREE, 'assets/texturas/madera/t02.jpg', 1.4, 1.4);
    const texMaderaOsc = cargarTex(THREE, 'assets/texturas/madera/t06.jpg', 1.5, 1.5);
    const texPiedra = cargarTex(THREE, 'assets/texturas/piedra/t02.jpg', 1.8, 1.8);
    const texMuro = cargarTex(THREE, 'assets/texturas/mmuro/t04.jpg', 1.6, 1.6);
    const texArenisca = cargarTex(THREE, 'assets/texturas/piedra/t07.jpg', 1.6, 1.6);
    const texTela = cargarTex(THREE, 'assets/texturas/alfombras/a1.jpg', 1.5, 1.5);
    const mats = {
      madera: new THREE.MeshStandardMaterial({ color: texMadera ? 0xb88b61 : 0x6b4423, map: texMadera, bumpMap: texMadera, bumpScale: 0.05, roughness: 0.86 }),
      maderaOscura: new THREE.MeshStandardMaterial({ color: texMaderaOsc ? 0x916b4a : 0x3e2411, map: texMaderaOsc, bumpMap: texMaderaOsc, bumpScale: 0.05, roughness: 0.88 }),
      piedra: new THREE.MeshStandardMaterial({ color: texPiedra ? 0xb4bfcc : 0x64748b, map: texPiedra, bumpMap: texPiedra, bumpScale: 0.07, roughness: 0.88, metalness: 0.06 }),
      piedraOscura: new THREE.MeshStandardMaterial({ color: texMuro ? 0x8a97a8 : 0x334155, map: texMuro, bumpMap: texMuro, bumpScale: 0.08, roughness: 0.86, metalness: 0.14 }),
      arenisca: new THREE.MeshStandardMaterial({ color: texArenisca ? 0xe5bc88 : 0xc28e4b, map: texArenisca, bumpMap: texArenisca, bumpScale: 0.07, roughness: 0.84 }),
      hierro: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.42, metalness: 0.82 }),
      lona: new THREE.MeshStandardMaterial({ color: texTela ? 0xf59e0b : 0xd97706, map: texTela, bumpMap: texTela, bumpScale: 0.03, roughness: 0.78 }),
      lonaClara: new THREE.MeshStandardMaterial({ color: texTela ? 0xf5f5f4 : 0xe7e5e4, map: texTela, roughness: 0.80 }),
      estandarte: new THREE.MeshStandardMaterial({ color: texTela ? 0xdc2626 : 0x991b1b, map: texTela, bumpMap: texTela, bumpScale: 0.03, roughness: 0.75 }),
      brasa: new THREE.MeshStandardMaterial({ color: 0xfb923c, emissive: 0xf97316, emissiveIntensity: 2.2, roughness: 0.25 }),
      cristalSolar: new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xf59e0b, emissiveIntensity: 2.4, roughness: 0.15, metalness: 0.4 }),
      cristalHielo: new THREE.MeshStandardMaterial({ color: 0xbae6fd, emissive: 0x38bdf8, emissiveIntensity: 2.6, roughness: 0.12, metalness: 0.5 }),
      cristalMina: new THREE.MeshStandardMaterial({ color: 0x6ee7b7, emissive: 0x10b981, emissiveIntensity: 1.9, roughness: 0.2, metalness: 0.35 }),
      junco: new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.82 }),
      humo: new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 1.0, transparent: true, opacity: 0.36, depthWrite: false })
    };
    if (typeof window !== 'undefined' && window.PbrLib) {
      window.PbrLib.aplicarEnMaterial(THREE, mats.madera, 'madera/t02', { normalScale: 0.85 });
      window.PbrLib.aplicarEnMaterial(THREE, mats.maderaOscura, 'madera/t06', { normalScale: 0.85 });
      window.PbrLib.aplicarEnMaterial(THREE, mats.piedra, 'piedra/t02', { normalScale: 0.9 });
      window.PbrLib.aplicarEnMaterial(THREE, mats.piedraOscura, 'mmuro/t04', { normalScale: 0.95 });
      window.PbrLib.aplicarEnMaterial(THREE, mats.arenisca, 'piedra/t07', { normalScale: 0.9 });
      window.PbrLib.aplicarEnMaterial(THREE, mats.lona, 'alfombras/a1', { normalScale: 0.65 });
      window.PbrLib.aplicarEnMaterial(THREE, mats.estandarte, 'alfombras/a1', { normalScale: 0.65 });
    }
    return mats;
  }

  function agregarColumnaHumo(THREE, matHumo, addRel, animados, cx, cy, cz, faseBase, altura) {
    for (let i = 0; i < 3; i++) {
      const vol = addRel(new THREE.Mesh(new THREE.SphereGeometry(0.24 + i * 0.06, 6, 5), matHumo), cx, cy, cz);
      animados.push({ tipo: 'humo', mesh: vol, baseX: cx, baseY: cy, baseZ: cz, phase: faseBase + i * 0.33, altura: altura || 2.8 });
    }
  }

  function construirDioramaPOI(THREE, poi, mats, altura, animados) {
    const px = Number(poi.x) || 0;
    const pz = poi.y !== undefined ? Number(poi.y) : Number(poi.z) || 0;
    const py = altura(px, pz);
    const tipo = (poi.type || 'ruinas').toLowerCase();
    const grp = new THREE.Group();
    grp.name = 'poi_' + (poi.id || tipo);
    grp.position.set(px, py, pz);
    grp.rotation.y = hashNum(px, pz) * Math.PI * 2;

    const addRel = (mesh, rx, ryOffset, rz) => {
      const hy = altura(px + rx, pz + rz) - py;
      mesh.position.set(rx, hy + ryOffset, rz);
      grp.add(mesh);
      return mesh;
    };

    if (tipo === 'campamento') {
      // Hoguera central con troncos y brasas
      const brasa = addRel(new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 6), mats.brasa), 0, 0.26, 0);
      animados.push({ tipo: 'pulso', mesh: brasa, baseY: brasa.position.y, phase: px });
      agregarColumnaHumo(THREE, mats.humo, addRel, animados, 0, 0.65, 0, px * 0.13, 2.7);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.3;
        const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.35, 6), mats.maderaOscura);
        tronco.rotation.z = Math.PI * 0.44;
        tronco.rotation.y = a;
        addRel(tronco, Math.cos(a) * 0.35, 0.18, Math.sin(a) * 0.35);
      }
      // Dos tiendas de campaña alrededor + cajas + estandarte
      [[-4.2, -2.5, 0.6], [4.0, -3.0, -0.7]].forEach(([tx, tz, rot], idx) => {
        const tienda = new THREE.Mesh(new THREE.ConeGeometry(2.35, 2.9, 6), idx === 0 ? mats.lona : mats.lonaClara);
        tienda.rotation.y = rot;
        tienda.castShadow = tienda.receiveShadow = true;
        addRel(tienda, tx, 1.45, tz);
      });
      const banco = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.36, 0.52), mats.madera);
      banco.rotation.y = 0.25;
      addRel(banco, 0.3, 0.18, 2.7);
      const caja = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.85, 0.95), mats.madera);
      addRel(caja, -2.2, 0.42, 2.2);
      const mastil = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 4.2, 6), mats.maderaOscura);
      addRel(mastil, 2.8, 2.1, 2.0);
      const band = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.72, 0.06), mats.estandarte);
      addRel(band, 3.35, 3.6, 2.0);
    } else if (tipo === 'mina') {
      // Pórtico entibado + raíles + vagoneta + vetas minerales
      [-1.7, 1.7].forEach(ox => {
        const poste = new THREE.Mesh(new THREE.BoxGeometry(0.38, 3.4, 0.38), mats.maderaOscura);
        poste.castShadow = true;
        addRel(poste, ox, 1.7, -1.6);
      });
      const dintel = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.42, 0.48), mats.maderaOscura);
      dintel.castShadow = true;
      addRel(dintel, 0, 3.35, -1.6);
      const boca = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.9, 1.4), mats.piedraOscura);
      addRel(boca, 0, 1.45, -2.3);
      // Raíles cortos y vagoneta
      [-0.55, 0.55].forEach(rx => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.08, 6.2), mats.hierro);
        addRel(rail, rx, 0.06, 1.1);
      });
      const vag = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.85, 1.9), mats.hierro);
      vag.castShadow = true;
      addRel(vag, 0, 0.56, 1.6);
      const carga = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 0), mats.cristalMina);
      addRel(carga, 0, 1.05, 1.6);
      [[-2.8, 0.6, 0.85], [2.9, -0.4, 0.70]].forEach(([cx, cz, sc]) => {
        const veta = new THREE.Mesh(new THREE.OctahedronGeometry(sc, 0), mats.cristalMina);
        addRel(veta, cx, sc * 0.65, cz);
      });
    } else if (tipo === 'ruinas') {
      // Faro / torre semiderruida con columnas partidas
      const torreBase = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.7, 5.2, 10), mats.piedra);
      torreBase.castShadow = torreBase.receiveShadow = true;
      addRel(torreBase, 0, 2.5, 0);
      const torreTop = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 2.1, 2.4, 9), mats.piedraOscura);
      torreTop.rotation.z = 0.08;
      addRel(torreTop, 0.15, 6.1, -0.1);
      [[-4.2, 2.2, 2.6], [4.0, -2.0, 1.9], [-2.5, -4.4, 3.1]].forEach(([cx, cz, ch], i) => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, ch, 8), mats.piedra);
        col.castShadow = true;
        if (i === 1) col.rotation.z = 0.35;
        addRel(col, cx, ch * 0.48, cz);
      });
      const silar = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 1.2), mats.piedraOscura);
      silar.rotation.y = 0.5;
      addRel(silar, 2.8, 0.38, 3.1);
    } else if (tipo === 'santuario' || tipo === 'portal') {
      const esPortal = tipo === 'portal';
      const matC = esPortal ? mats.cristalHielo : mats.cristalSolar;
      const matB = esPortal ? mats.piedraOscura : mats.arenisca;
      const losa = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.7, 0.48, 12), matB);
      losa.receiveShadow = true;
      addRel(losa, 0, 0.22, 0);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + Math.PI * 0.25;
        const ob = new THREE.Mesh(new THREE.BoxGeometry(0.75, 4.2, 0.75), matB);
        ob.rotation.y = -a;
        ob.castShadow = true;
        addRel(ob, Math.cos(a) * 3.3, 2.1, Math.sin(a) * 3.3);
      }
      const anillo = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.16, 8, 24), matC);
      if (!esPortal) anillo.rotation.x = Math.PI * 0.5;
      addRel(anillo, 0, esPortal ? 2.6 : 0.65, 0);
      const gema = new THREE.Mesh(new THREE.OctahedronGeometry(0.92, 0), matC);
      addRel(gema, 0, 2.65, 0);
      animados.push({ tipo: 'cristal', mesh: gema, baseY: gema.position.y, phase: px + pz });
      if (esPortal) animados.push({ tipo: 'giro', mesh: anillo, baseY: anillo.position.y, phase: pz });
    } else {
      // 'jefe': Altar de Aurelio / forja titánica
      const base = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 5.2, 0.65, 8), mats.piedraOscura);
      base.receiveShadow = true;
      addRel(base, 0, 0.30, 0);
      const altar = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.5, 1.6), mats.hierro);
      altar.castShadow = true;
      addRel(altar, 0, 1.05, 0);
      const fuego = new THREE.Mesh(new THREE.OctahedronGeometry(0.85, 0), mats.brasa);
      addRel(fuego, 0, 2.35, 0);
      animados.push({ tipo: 'cristal', mesh: fuego, baseY: fuego.position.y, phase: 0.7 });
      agregarColumnaHumo(THREE, mats.humo, addRel, animados, 0, 2.95, 0, pz * 0.17, 3.2);
      // Cuatro armas / estandartes alrededor del altar
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        const arma = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.8, 0.24), mats.hierro);
        arma.rotation.z = (i % 2 === 0 ? 0.18 : -0.18);
        addRel(arma, Math.cos(a) * 3.4, 1.2, Math.sin(a) * 3.4);
      }
    }

    return grp;
  }

  function generarDecoradoMundo(THREE, opciones) {
    const opts = opciones || {};
    const world = opts.world || {};
    const altura = opts.altura || (() => 0);
    const esAgua = opts.agua || (() => false);
    const biomaAt = opts.bioma || (() => 'pradera');
    const estaLibre = opts.libre || (() => true);

    const grupo = new THREE.Group();
    grupo.name = 'DecoradoMundoTematico';
    const mats = crearMateriales(THREE);
    const animados = [];
    const estructuras = [];

    // 1. Dioramas para todos los POIs del mundo
    (world.pois || []).forEach(poi => {
      const px = Number(poi.x) || 0;
      const pz = poi.y !== undefined ? Number(poi.y) : Number(poi.z) || 0;
      if (esAgua(px, pz)) return;
      const d = construirDioramaPOI(THREE, poi, mats, altura, animados);
      grupo.add(d);
      estructuras.push({ grupo: d, x: px, z: pz, radio: 220 });
    });

    // 2. Postes señalizadores en encrucijadas e inicios de caminos + hito de peligro en zonas élite/jefe
    const postesPos = [];
    (world.roads || []).forEach(r => {
      const pts = r.points;
      if (!pts || pts.length < 6) return;
      [0.18, 0.50, 0.82].forEach(frac => {
        const idx = Math.max(1, Math.min(pts.length - 2, Math.floor((pts.length - 1) * frac)));
        const a = pts[idx - 1], b = pts[idx + 1], p = pts[idx];
        const dx = b.x - a.x, dz = b.y - a.y;
        const len = Math.hypot(dx, dz) || 1;
        const nx = -dz / len, nz = dx / len;
        const sx = p.x + nx * 6.8, sz = p.y + nz * 6.8;
        if (esAgua(sx, sz) || !estaLibre(sx, sz)) return;
        if (postesPos.some(q => Math.hypot(q.x - sx, q.z - sz) < 60)) return;
        postesPos.push({ x: sx, z: sz, ang: Math.atan2(dx, dz) });
      });
    });

    if (postesPos.length > 0 && THREE.InstancedMesh) {
      const mPos = new THREE.Matrix4(), mQuat = new THREE.Quaternion(), mVec = new THREE.Vector3(), mEsc = new THREE.Vector3(1, 1, 1);
      const axisY = new THREE.Vector3(0, 1, 0);
      const iPalo = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.11, 0.14, 3.0, 6), mats.maderaOscura, postesPos.length);
      const iTab = new THREE.InstancedMesh(new THREE.BoxGeometry(1.35, 0.28, 0.10), mats.madera, postesPos.length);
      const iFarol = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.18, 0), mats.brasa, postesPos.length);
      postesPos.forEach((p, idx) => {
        const py = altura(p.x, p.z);
        mQuat.setFromAxisAngle(axisY, p.ang);
        mVec.set(p.x, py + 1.5, p.z); mPos.compose(mVec, mQuat, mEsc); iPalo.setMatrixAt(idx, mPos);
        mVec.set(p.x, py + 2.45, p.z); mPos.compose(mVec, mQuat, mEsc); iTab.setMatrixAt(idx, mPos);
        mVec.set(p.x, py + 3.08, p.z); mPos.compose(mVec, mQuat, mEsc); iFarol.setMatrixAt(idx, mPos);
      });
      iPalo.instanceMatrix.needsUpdate = true;
      iTab.instanceMatrix.needsUpdate = true;
      iFarol.instanceMatrix.needsUpdate = true;
      iPalo.castShadow = iTab.castShadow = true;
      grupo.add(iPalo, iTab, iFarol);
    }

    // 3. Juncos ribereños junto a lagos, costas y zonas pantanosas (instanciado ligero)
    const juncosPos = [];
    const agregarJunco = (jx, jz, r) => {
      if (esAgua(jx, jz) || !estaLibre(jx, jz)) return false;
      const jy = altura(jx, jz);
      juncosPos.push({ x: jx, y: jy, z: jz, s: 0.78 + r * 0.68 });
      return true;
    };

    // 3a. Orillas de lagos y oasis del mundo
    (opts.lagos || []).forEach((l, li) => {
      if (!l || l.tipo === 'arenas') return;
      const rad = l.R || 20;
      for (let k = 0; k < 14; k++) {
        const r = hashNum(l.x + k * 19, l.z + li * 11);
        const ang = (k / 14) * Math.PI * 2 + r * 0.35;
        const jx = l.x + Math.cos(ang) * (rad + 1.2 + r * 2.6);
        const jz = l.z + Math.sin(ang) * (rad + 1.2 + r * 2.6);
        agregarJunco(jx, jz, r);
      }
    });

    // 3b. Costas marinas y juncales pantanosos alrededor de pueblos húmedos/costeros
    (world.towns || []).forEach(t => {
      const bio = (t.biome || biomaAt(t.x, t.y) || '').toLowerCase();
      if (bio !== 'pantano' && bio !== 'pradera' && bio !== 'bosque') return;
      for (let k = 0; k < 44; k++) {
        const r = hashNum(t.x + k * 13, t.y + k * 7);
        const ang = hashNum(t.y + k * 17, t.x + k * 3) * Math.PI * 2;
        const dist = (t.radius || 120) + 28 + r * 260;
        const jx = t.x + Math.cos(ang) * dist;
        const jz = t.y + Math.sin(ang) * dist;
        if (esAgua(jx, jz) || !estaLibre(jx, jz)) continue;
        const jy = altura(jx, jz);
        const enCosta = jy >= -0.5 && jy <= 3.6 && (
          esAgua(jx + 28, jz) || esAgua(jx - 28, jz) || esAgua(jx, jz + 28) || esAgua(jx, jz - 28)
        );
        const enPantano = bio === 'pantano' && dist < (t.radius || 120) + 125 && hashNum(jx, jz) < 0.55;
        if (enCosta || enPantano) {
          juncosPos.push({ x: jx, y: jy, z: jz, s: 0.78 + r * 0.68 });
          if (enPantano) {
            juncosPos.push({ x: jx + 0.55, y: altura(jx + 0.55, jz + 0.35), z: jz + 0.35, s: 0.65 + r * 0.45 });
          }
        }
      }
    });

    if (juncosPos.length > 0 && THREE.InstancedMesh) {
      const mPos = new THREE.Matrix4(), mQuat = new THREE.Quaternion(), mVec = new THREE.Vector3(), mEsc = new THREE.Vector3();
      const iJunco = new THREE.InstancedMesh(new THREE.ConeGeometry(0.11, 1.45, 5), mats.junco, juncosPos.length);
      juncosPos.forEach((j, idx) => {
        mVec.set(j.x, j.y + 0.55 * j.s, j.z);
        mEsc.set(j.s, j.s, j.s);
        mPos.compose(mVec, mQuat, mEsc);
        iJunco.setMatrixAt(idx, mPos);
      });
      iJunco.instanceMatrix.needsUpdate = true;
      grupo.add(iJunco);
    }

    function actualizar(dt, tSec) {
      for (let i = 0; i < animados.length; i++) {
        const a = animados[i];
        if (!a.mesh) continue;
        if (a.tipo === 'cristal') {
          a.mesh.position.y = a.baseY + Math.sin(tSec * 2.1 + a.phase) * 0.24;
          a.mesh.rotation.y = tSec * 0.9 + a.phase;
        } else if (a.tipo === 'giro') {
          a.mesh.rotation.z = tSec * 0.6 + a.phase;
        } else if (a.tipo === 'pulso') {
          const s = 0.92 + Math.sin(tSec * 7.5 + a.phase) * 0.12;
          a.mesh.scale.set(s, s, s);
        } else if (a.tipo === 'humo') {
          const ciclo = ((tSec * 0.28 + a.phase) % 1 + 1) % 1;
          a.mesh.position.y = a.baseY + ciclo * a.altura;
          a.mesh.position.x = a.baseX + Math.sin(tSec * 1.4 + a.phase * 6.28) * (0.14 + ciclo * 0.26);
          a.mesh.position.z = a.baseZ + Math.cos(tSec * 1.1 + a.phase * 6.28) * (0.10 + ciclo * 0.20);
          const s = 0.28 + 1.05 * Math.sin(ciclo * Math.PI);
          a.mesh.scale.set(s, s * 0.85, s);
        }
      }
    }

    return {
      grupo,
      estructuras,
      postes: postesPos.length,
      juncos: juncosPos.length,
      poisCount: estructuras.length,
      actualizar
    };
  }

  const api = {
    generar: generarDecoradoMundo,
    construirDioramaPOI
  };

  if (root) root.DecoradoMundoLib = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
