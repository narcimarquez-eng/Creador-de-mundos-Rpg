// Reduce las llamadas de dibujo de un enemigo del módulo de enemigos (js/enemigos.js).
// 1) Quita el grupo de hitboxes de depuración: el juego usa las estadísticas, no esas mallas.
// 2) Une las mallas estáticas que son hijas de un mismo grupo y comparten material, horneando su posición.
// Se conservan los grupos animados, las mallas que la animación mueve directamente (núcleo, aliento, aura) y las
// mallas con piel (SkinnedMesh, que deforman los huesos), para que updateEnemyAnimation siga funcionando igual.
(function (root) {
  'use strict';

  const FX_EMISIVO_RE = /ArcaneSparks|SlashTrail|BiteSnap|RamCharge|Breath|Spark|Trail/i;

  // Sanea luces dinámicas embebidas y propiedades PBR pesadas/inestables (anisotropía sin tangentes,
  // transmisión en doble pasada, sheen/clearcoat y emisivos HDR altos) en rigs o GLB de enemigos.
  function sanearModeloEnemigo(raiz, opts = {}) {
    const {
      maxEmisivo = 0.75,
      maxEmisivoFx = 0.55,
      minRoughness = 0.30,
      maxColorBasic = 1.1,
      quitarLuces = true,
      materialesExtra = null
    } = opts || {};

    if (!raiz && !materialesExtra) {
      return { lucesQuitadas: 0, materialesSaneados: 0, anisotropiasQuitadas: 0, transmisionesQuitadas: 0, emisivosRecortados: 0 };
    }

    const luces = [];
    const mats = new Set();
    if (raiz && typeof raiz.traverse === 'function') {
      raiz.traverse(o => {
        if (!o) return;
        if (quitarLuces && o.isLight) luces.push(o);
        if ((o.isMesh || o.isPoints || o.isSprite) && o.material) {
          if (Array.isArray(o.material)) o.material.forEach(m => { if (m) mats.add(m); });
          else mats.add(o.material);
        }
      });
      luces.forEach(l => { if (l.parent) l.parent.remove(l); });
    }
    if (materialesExtra) {
      for (const m of materialesExtra) {
        if (m) mats.add(m);
      }
    }

    let anisotropiasQuitadas = 0, transmisionesQuitadas = 0, emisivosRecortados = 0;
    mats.forEach(mat => {
      let recompilar = false;
      if (mat.anisotropy) {
        mat.anisotropy = 0;
        recompilar = true;
        anisotropiasQuitadas++;
      }
      if (mat.anisotropyMap) {
        mat.anisotropyMap = null;
        recompilar = true;
      }
      if (mat.transmission && mat.transmission > 0) {
        mat.transmission = 0;
        if (typeof mat.thickness === 'number') mat.thickness = 0;
        mat.transparent = true;
        mat.opacity = Math.min(typeof mat.opacity === 'number' ? mat.opacity : 1, 0.82);
        recompilar = true;
        transmisionesQuitadas++;
      }
      if (mat.sheen && mat.sheen > 0) {
        mat.sheen = 0;
        recompilar = true;
      }
      if (mat.clearcoat && mat.clearcoat > 0) {
        mat.clearcoat = 0;
        recompilar = true;
      }
      if (mat.iridescence && mat.iridescence > 0) {
        mat.iridescence = 0;
        recompilar = true;
      }
      if (typeof mat.roughness === 'number' && mat.roughness < minRoughness) {
        mat.roughness = minRoughness;
      }
      if (typeof mat.emissiveIntensity === 'number') {
        const esFx = FX_EMISIVO_RE.test(mat.name || '');
        const lim = esFx ? maxEmisivoFx : maxEmisivo;
        if (!Number.isFinite(mat.emissiveIntensity) || mat.emissiveIntensity > lim) {
          mat.emissiveIntensity = lim;
          emisivosRecortados++;
        }
        mat.userData = mat.userData || {};
        mat.userData._baseEmissiveIntensity = mat.emissiveIntensity;
        if (esFx && mat.transparent && typeof mat.opacity === 'number' && mat.opacity > 0.55) {
          mat.opacity = 0.55;
        }
      }
      if ((mat.isMeshBasicMaterial || mat.isPointsMaterial) && mat.color) {
        const maxC = Math.max(mat.color.r, mat.color.g, mat.color.b);
        if (!Number.isFinite(maxC)) {
          mat.color.setRGB(1, 1, 1);
        } else if (maxC > maxColorBasic) {
          mat.color.multiplyScalar(maxColorBasic / maxC);
        }
      }
      if (mat.isPointsMaterial && typeof THREE !== 'undefined' && mat.blending === THREE.AdditiveBlending && typeof mat.opacity === 'number' && mat.opacity > 0.72) {
        mat.opacity = 0.72;
      }
      if (recompilar) mat.needsUpdate = true;
    });

    return {
      lucesQuitadas: luces.length,
      materialesSaneados: mats.size,
      anisotropiasQuitadas,
      transmisionesQuitadas,
      emisivosRecortados
    };
  }

  // Une varias mallas en una sola (sin índices: triángulos tal cual) con sus transformaciones horneadas
  function unirMallas(mallas) {
    const partes = mallas.map(m => {
      m.updateMatrix();
      let g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
      if (!g.attributes.normal) g.computeVertexNormals();
      if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      g.applyMatrix4(m.matrix);
      return g;
    });
    const total = partes.reduce((a, g) => a + g.attributes.position.count, 0);
    const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), uv = new Float32Array(total * 2);
    // Color por vértice: si alguna parte lo tiene, se conserva (las que no lo tienen van en blanco). Sin él, los
    // materiales con colores por vértice se verían negros o pardos.
    const conColor = partes.some(g => g.attributes.color);
    const col = conColor ? new Float32Array(total * 3) : null;
    let o3 = 0, o2 = 0;
    partes.forEach(g => {
      pos.set(g.attributes.position.array, o3);
      nor.set(g.attributes.normal.array, o3);
      uv.set(g.attributes.uv.array, o2);
      if (col) {
        const C = g.attributes.color, n = g.attributes.position.count;
        for (let i = 0; i < n; i++) for (let c = 0; c < 3; c++) col[o3 + i * 3 + c] = C ? C.getComponent(i, c) : 1;
      }
      o3 += g.attributes.position.count * 3;
      o2 += g.attributes.position.count * 2;
      g.dispose();
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    if (col) geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const base = mallas[0];
    const merged = new THREE.Mesh(geo, base.material);
    merged.castShadow = base.castShadow;
    merged.receiveShadow = base.receiveShadow;
    merged.name = 'merged_' + mallas.length;
    return merged;
  }

  function optimizarRig(rig) {
    // 1) hitboxes de depuración fuera
    if (rig.hitboxGroup && rig.hitboxGroup.parent) rig.hitboxGroup.parent.remove(rig.hitboxGroup);

    // 2) quitar las mallas fuente ocultas que solo usa la vista explosionada del editor de enemigos (~200 nodos menos por instancia)
    if (Array.isArray(rig.explodedSourceMeshes) && rig.explodedSourceMeshes.length) {
      rig.explodedSourceMeshes.forEach(m => { if (m && m.parent) m.parent.remove(m); });
      rig.explodedSourceMeshes.length = 0;
    }
    if (Array.isArray(rig.explodableParts)) rig.explodableParts.length = 0;

    // 3) quitar la luz puntual dinámica del aliento del grafo de escena para no recompilar los shaders PBR del mundo
    const luzAliento = rig.mouthBreathSystem && rig.mouthBreathSystem.breathLight;
    if (luzAliento && luzAliento.parent) luzAliento.parent.remove(luzAliento);

    // 4) limpiar metadatos de inspección del editor en userData para que clone(true) sea instantáneo
    rig.rootGroup.traverse(o => {
      if (!o.userData) return;
      delete o.userData.partInfo;
      delete o.userData.resolvePartByPoint;
    });

    // Mallas que la animación toca directamente (y sus sub-mallas): no se unen
    const animadas = new Set();
    [rig.parts.coreMesh, rig.parts.breathConeMesh, rig.parts.slashTrailMesh, rig.parts.arrowProjectileMesh, rig.parts.auraInstancedMesh]
      .filter(Boolean)
      .forEach(raiz => raiz.traverse(sub => animadas.add(sub)));

    // 5) por cada grupo, unir sus mallas estáticas hijas por material y sombras
    const grupos = [];
    rig.rootGroup.traverse(o => { if (o.children && o.children.length) grupos.push(o); });
    let antes = 0, despues = 0;
    grupos.forEach(grupo => {
      const porClave = new Map();
      grupo.children.forEach(h => {
        if (!h.isMesh || h.isInstancedMesh || h.isSkinnedMesh || animadas.has(h) || h.children.length) return;
        const clave = h.material.uuid + '|' + h.castShadow + '|' + h.receiveShadow;
        if (!porClave.has(clave)) porClave.set(clave, []);
        porClave.get(clave).push(h);
      });
      porClave.forEach(lista => {
        antes += lista.length;
        if (lista.length < 2) { despues += lista.length; return; }
        const merged = unirMallas(lista);
        lista.forEach(h => grupo.remove(h));
        grupo.add(merged);
        despues += 1;
      });
    });
    sanearModeloEnemigo(rig.rootGroup, { materialesExtra: rig.materials ? Object.values(rig.materials) : null });
    return { mallasAntes: antes, mallasDespues: despues };
  }

  // Cuenta lo que se dibuja de verdad: mallas visibles con todos sus padres visibles, y triángulos
  function medirVisibles(rig) {
    let mallas = 0, tris = 0;
    rig.rootGroup.traverse(o => {
      if (!o.isMesh) return;
      let v = o, visible = true;
      while (v) { if (!v.visible) { visible = false; break; } v = v.parent; }
      if (!visible) return;
      mallas++;
      const g = o.geometry;
      tris += (g.index ? g.index.count : g.attributes.position.count) / 3 * (o.isInstancedMesh ? o.count : 1);
    });
    return { mallas, tris: Math.round(tris) };
  }

  // Clona un rig procedural ya optimizado y fusionado para que varias instancias compartan
  // la misma geometría, texturas y materiales en GPU sin duplicar memoria ni compilar nuevos shaders,
  // conservando todos los campos que necesita EnemyLib.updateEnemyAnimation.
  function clonarRig(THREE, protoRig) {
    const origRoot = protoRig.rootGroup;
    const origWeapon = protoRig.parts && protoRig.parts.weaponGroup;
    const origBow = origWeapon && origWeapon.userData && origWeapon.userData.bowstringPivots;
    // Evita que Object3D.copy haga JSON.stringify sobre nodos THREE.Group dentro de userData
    if (origBow) delete origWeapon.userData.bowstringPivots;

    let clonRoot;
    try {
      clonRoot = origRoot.clone(true);
    } finally {
      if (origBow) origWeapon.userData.bowstringPivots = origBow;
    }

    const deClon = new Map(), aClon = new Map();
    (function recorrer(a, b) {
      if (!a || !b) return;
      deClon.set(b, a);
      aClon.set(a, b);
      for (let i = 0; i < a.children.length; i++) recorrer(a.children[i], b.children[i]);
    })(origRoot, clonRoot);

    const esqueletosClonados = new Map();
    function mapearEsqueleto(origSkel) {
      if (!origSkel) return null;
      if (esqueletosClonados.has(origSkel)) return esqueletosClonados.get(origSkel);
      const huesos = origSkel.bones.map(h => aClon.get(h) || h);
      const inversas = origSkel.boneInverses.map(m => m.clone());
      const sk = new THREE.Skeleton(huesos, inversas);
      esqueletosClonados.set(origSkel, sk);
      return sk;
    }

    clonRoot.traverse(n => {
      if (n.isSkinnedMesh && n.skeleton) {
        const orig = deClon.get(n);
        if (orig && orig.boundingSphere) n.boundingSphere = orig.boundingSphere.clone();
        if (orig && orig.skeleton) {
          n.bind(mapearEsqueleto(orig.skeleton), orig.bindMatrix.clone());
        }
      }
    });

    const exportableGroup = aClon.get(protoRig.exportableGroup) || clonRoot.children[0] || clonRoot;
    const parts = {};
    if (protoRig.parts) {
      for (const [k, v] of Object.entries(protoRig.parts)) {
        if (!v) { parts[k] = v; continue; }
        if (Array.isArray(v)) parts[k] = v.map(item => aClon.get(item) || item);
        else parts[k] = aClon.get(v) || v;
      }
    }
    if (origBow && parts.weaponGroup) {
      parts.weaponGroup.userData.bowstringPivots = {
        upper: aClon.get(origBow.upper) || origBow.upper,
        lower: aClon.get(origBow.lower) || origBow.lower
      };
    }

    const sockets = {};
    if (protoRig.sockets) {
      for (const [k, v] of Object.entries(protoRig.sockets)) {
        sockets[k] = aClon.get(v) || v;
      }
    }

    const origAura = protoRig.auraParticleSystem;
    const clonAuraPts = origAura && origAura.points ? aClon.get(origAura.points) : null;
    if (clonAuraPts && origAura.points.geometry) clonAuraPts.geometry = origAura.points.geometry.clone();
    const auraParticleSystem = origAura ? {
      points: clonAuraPts || { visible: false },
      smokeMat: origAura.smokeMat,
      sparkMat: origAura.sparkMat,
      activeMode: 'none',
      pool: (origAura.pool || []).map(p => Object.assign({}, p))
    } : { points: { visible: false }, activeMode: 'none', pool: [] };

    const origAliento = protoRig.mouthBreathSystem;
    const clonAlientoPts = origAliento && origAliento.points ? aClon.get(origAliento.points) : null;
    if (clonAlientoPts && origAliento.points.geometry) clonAlientoPts.geometry = origAliento.points.geometry.clone();
    const mouthBreathSystem = origAliento ? {
      points: clonAlientoPts || { visible: false },
      fireMat: origAliento.fireMat,
      frostMat: origAliento.frostMat,
      breathLight: { color: new THREE.Color(), intensity: 0 },
      fireBreathMap: origAliento.fireBreathMap,
      frostBreathMap: origAliento.frostBreathMap,
      pool: (origAliento.pool || []).map(p => Object.assign({}, p))
    } : null;

    const skinnedMeshGroup = aClon.get(protoRig.skinnedMeshGroup) || new THREE.Group();
    const skinnedMeshes = (protoRig.skinnedMeshes || []).map(m => aClon.get(m)).filter(Boolean);
    const rootBone = aClon.get(protoRig.rootBone) || parts.pelvisGroup || clonRoot;
    const skeleton = protoRig.skeleton ? mapearEsqueleto(protoRig.skeleton) : null;
    const explodedSourceMeshes = (protoRig.explodedSourceMeshes || []).map(m => aClon.get(m)).filter(Boolean);
    const explodableParts = (protoRig.explodableParts || []).map(p => aClon.get(p)).filter(Boolean);

    return {
      rootGroup: clonRoot,
      exportableGroup,
      hitboxGroup: null,
      rootBone,
      skeleton,
      skinnedMeshes,
      skinnedMeshGroup,
      explodedSourceMeshes,
      explodableParts,
      shardData: protoRig.shardData || [],
      animations: protoRig.animations || [],
      materials: protoRig.materials,
      parts,
      sockets,
      auraParticleSystem,
      mouthBreathSystem,
      metrics: protoRig.metrics
    };
  }

  const api = { optimizarRig, medirVisibles, clonarRig, sanearModeloEnemigo };
  root.EnemyOpt = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
