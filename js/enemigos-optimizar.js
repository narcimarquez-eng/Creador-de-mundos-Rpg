// Reduce las llamadas de dibujo de un enemigo del módulo de enemigos (js/enemigos.js).
// 1) Quita el grupo de hitboxes de depuración: el juego usa las estadísticas, no esas mallas.
// 2) Une las mallas estáticas que son hijas de un mismo grupo y comparten material, horneando su posición.
// Se conservan los grupos animados y las mallas que la animación mueve directamente (núcleo, aliento, aura),
// para que updateEnemyAnimation siga funcionando igual.
(function (root) {
  'use strict';

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
    let o3 = 0, o2 = 0;
    partes.forEach(g => {
      pos.set(g.attributes.position.array, o3);
      nor.set(g.attributes.normal.array, o3);
      uv.set(g.attributes.uv.array, o2);
      o3 += g.attributes.position.count * 3;
      o2 += g.attributes.position.count * 2;
      g.dispose();
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
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

    // Mallas que la animación toca directamente: no se unen
    const animadas = new Set([rig.parts.coreMesh, rig.parts.breathConeMesh, rig.parts.auraInstancedMesh].filter(Boolean));

    // 2) por cada grupo, unir sus mallas estáticas hijas por material y sombras
    const grupos = [];
    rig.rootGroup.traverse(o => { if (o.children && o.children.length) grupos.push(o); });
    let antes = 0, despues = 0;
    grupos.forEach(grupo => {
      const porClave = new Map();
      grupo.children.forEach(h => {
        if (!h.isMesh || h.isInstancedMesh || animadas.has(h) || h.children.length) return;
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

  root.EnemyOpt = { optimizarRig, medirVisibles };
})(typeof window !== 'undefined' ? window : globalThis);
