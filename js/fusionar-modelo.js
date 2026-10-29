/*
 * fusionar-modelo.js — Une las piezas de un modelo animado por nodos (sin esqueleto) en una malla por
 * material, para dibujarlo con muchas menos llamadas. Los NPCs de npc/gurus tienen ~87 piezas y 22
 * materiales: pasan de 87 dibujos a 22.
 * Cada pieza queda pegada a su nodo padre, que hace de hueso: la animación sigue moviendo esos nodos y la
 * malla unida (SkinnedMesh) los sigue igual que antes las piezas sueltas.
 * Expone window.FusionLib (o module.exports en Node para las pruebas).
 */
(function (root) {
  "use strict";

  const ATRIBUTOS = new Set(['position', 'normal', 'uv', 'color']);

  // Se puede unir una pieza si nada la toca por separado: sin esqueleto propio, un solo material opaco,
  // visible, sin hijos (al quitarla se perderían), sin morph y solo con posición, normal, uv y color
  function unible(o, excluir) {
    if (!o.isMesh || o.isSkinnedMesh || o.isInstancedMesh || !o.parent || excluir.has(o)) return false;
    if (Array.isArray(o.material) || o.material.transparent || !o.visible || o.children.length) return false;
    const g = o.geometry;
    if (!g.attributes.position || Object.keys(g.morphAttributes || {}).length) return false;
    return Object.keys(g.attributes).every(k => ATRIBUTOS.has(k));
  }

  // modelo: Object3D ya colocado (escala y posición) y con sus matrices al día. Devuelve cuántas mallas
  // quedan unidas. opciones.excluir: piezas que no se tocan (las que una animación cambia por separado).
  function fusionarPorMaterial(THREE, modelo, opciones) {
    const excluir = new Set((opciones && opciones.excluir) || []);
    modelo.updateMatrixWorld(true);
    const grupos = new Map();   // material → piezas
    modelo.traverse(o => {
      if (!unible(o, excluir)) return;
      if (!grupos.has(o.material)) grupos.set(o.material, []);
      grupos.get(o.material).push(o);
    });
    const inv = new THREE.Matrix4().copy(modelo.matrixWorld).invert();
    let quedan = 0;
    grupos.forEach((piezas, material) => {
      if (piezas.length < 2) { quedan += piezas.length; return; }
      const huesos = [];
      const indiceHueso = new Map();
      piezas.forEach(p => { if (!indiceHueso.has(p.parent)) { indiceHueso.set(p.parent, huesos.length); huesos.push(p.parent); } });
      // Atributos comunes: posición y normal siempre; uv y color si alguna pieza los tiene
      const conUv = piezas.some(p => p.geometry.attributes.uv), conColor = piezas.some(p => p.geometry.attributes.color);
      const tamColor = conColor ? Math.max(...piezas.map(p => (p.geometry.attributes.color ? p.geometry.attributes.color.itemSize : 3))) : 0;
      let nV = 0, nI = 0;
      piezas.forEach(p => { const g = p.geometry; nV += g.attributes.position.count; nI += g.index ? g.index.count : g.attributes.position.count; });
      const pos = new Float32Array(nV * 3), nrm = new Float32Array(nV * 3);
      const uv = conUv ? new Float32Array(nV * 2) : null, col = conColor ? new Float32Array(nV * tamColor) : null;
      const sIdx = new Uint16Array(nV * 4), sPes = new Float32Array(nV * 4);
      const idx = nV > 65535 ? new Uint32Array(nI) : new Uint16Array(nI);
      const m = new THREE.Matrix4(), mn = new THREE.Matrix3(), v = new THREE.Vector3();
      let baseV = 0, baseI = 0;
      piezas.forEach(p => {
        const g = p.geometry, P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, C = g.attributes.color;
        m.multiplyMatrices(inv, p.matrixWorld);   // de la pieza al espacio del modelo
        mn.getNormalMatrix(m);
        const h = indiceHueso.get(p.parent);
        for (let i = 0; i < P.count; i++) {
          const k = baseV + i;
          v.fromBufferAttribute(P, i).applyMatrix4(m);
          pos[k * 3] = v.x; pos[k * 3 + 1] = v.y; pos[k * 3 + 2] = v.z;
          if (N) { v.fromBufferAttribute(N, i).applyMatrix3(mn).normalize(); nrm[k * 3] = v.x; nrm[k * 3 + 1] = v.y; nrm[k * 3 + 2] = v.z; }
          if (uv) { uv[k * 2] = U ? U.getX(i) : 0; uv[k * 2 + 1] = U ? U.getY(i) : 0; }
          if (col) for (let c = 0; c < tamColor; c++) col[k * tamColor + c] = C && c < C.itemSize ? C.getComponent(i, c) : 1;
          sIdx[k * 4] = h; sPes[k * 4] = 1;
        }
        if (g.index) for (let i = 0; i < g.index.count; i++) idx[baseI + i] = baseV + g.index.getX(i);
        else for (let i = 0; i < P.count; i++) idx[baseI + i] = baseV + i;
        baseV += P.count;
        baseI += g.index ? g.index.count : P.count;
      });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
      if (uv) geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      if (col) geo.setAttribute('color', new THREE.BufferAttribute(col, tamColor));
      geo.setAttribute('skinIndex', new THREE.BufferAttribute(sIdx, 4));
      geo.setAttribute('skinWeight', new THREE.BufferAttribute(sPes, 4));
      geo.setIndex(new THREE.BufferAttribute(idx, 1));
      const malla = new THREE.SkinnedMesh(geo, material);
      malla.name = 'fusion-' + (material.name || material.uuid.slice(0, 6));
      malla.castShadow = piezas.some(p => p.castShadow);
      malla.receiveShadow = piezas.some(p => p.receiveShadow);
      modelo.add(malla);
      malla.updateMatrixWorld(true);
      // Los nodos padre hacen de huesos: su posición actual es la de reposo
      malla.bind(new THREE.Skeleton(huesos), malla.matrixWorld);
      // Sin dispose: los clones de un mismo modelo comparten la geometría de sus piezas
      piezas.forEach(p => p.parent.remove(p));
      quedan++;
    });
    return quedan;
  }

  // Menos triángulos para la versión lejana de un modelo: cada malla con índices pasa a ~'ratio' de sus
  // triángulos (meshoptimizer: S es MeshoptSimplifier ya listo). Solo cambian los índices: los vértices, la
  // piel y los huesos son los mismos, así que la animación no cambia. La geometría nueva comparte los
  // atributos con la original (no se duplica memoria). Devuelve [triángulos antes, después].
  function simplificarModelo(THREE, S, raiz, opciones) {
    const o = Object.assign({ ratio: 0.4, error: 0.02, minTris: 600 }, opciones);
    let antes = 0, despues = 0;
    raiz.traverse(m => {
      if (!m.isMesh || m.isInstancedMesh || !m.visible || Array.isArray(m.material)) return;
      const g = m.geometry, P = g.attributes.position;
      if (!g.index || !P || P.isInterleavedBufferAttribute || !(P.array instanceof Float32Array) || P.itemSize !== 3) return;
      if (Object.keys(g.morphAttributes || {}).length) return;
      const n = Math.min(g.index.count, g.drawRange.count);
      antes += n / 3;
      if (n / 3 < o.minTris || g.drawRange.start !== 0) { despues += n / 3; return; }
      const indices = g.index.array instanceof Uint32Array ? g.index.array.subarray(0, n) : Uint32Array.from(g.index.array.subarray(0, n));
      const [nuevos] = S.simplify(indices, P.array.subarray(0, P.count * 3), 3, Math.floor(n * o.ratio / 3) * 3, o.error, []);
      if (nuevos.length >= n * 0.9) { despues += n / 3; return; }
      const ng = new THREE.BufferGeometry();
      Object.keys(g.attributes).forEach(k => ng.setAttribute(k, g.attributes[k]));
      ng.setIndex(new THREE.BufferAttribute(nuevos, 1));
      ng.groups = g.groups.slice();
      m.geometry = ng;
      despues += nuevos.length / 3;
    });
    return [Math.round(antes), Math.round(despues)];
  }

  const api = { fusionarPorMaterial, simplificarModelo };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FusionLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
