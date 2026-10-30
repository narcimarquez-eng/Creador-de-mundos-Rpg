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
      geo.computeBoundingBox();
      geo.computeBoundingSphere();
      const malla = new THREE.SkinnedMesh(geo, material);
      if (geo.boundingSphere) {
        malla.boundingSphere = geo.boundingSphere.clone();
        malla.boundingSphere.radius *= 1.25;
      }
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

  // Clona un modelo ya unido con fusionarPorMaterial re-enlazando cada SkinnedMesh a los nodos clonados,
  // de modo que todas las copias comparten la misma geometría, materiales y texturas en GPU.
  function clonarModelo(THREE, origen) {
    const deClon = new Map(), aClon = new Map();
    const clon = origen.clone(true);
    (function recorrer(a, b) {
      deClon.set(b, a);
      aClon.set(a, b);
      for (let i = 0; i < a.children.length; i++) recorrer(a.children[i], b.children[i]);
    })(origen, clon);
    clon.traverse(n => {
      if (!n.isSkinnedMesh || !n.skeleton) return;
      const orig = deClon.get(n);
      if (orig.boundingSphere) n.boundingSphere = orig.boundingSphere.clone();
      const huesos = orig.skeleton.bones.map(h => aClon.get(h) || h);
      const inversas = orig.skeleton.boneInverses.map(m => m.clone());
      n.bind(new THREE.Skeleton(huesos, inversas), orig.bindMatrix.clone());
    });
    return clon;
  }

  // Índices simplificados de una malla (sin THREE, sirve también en Node). S: MeshoptSimplifier ya listo.
  // indices: Uint32Array o null (malla sin índices: cada 3 vértices, un triángulo). posiciones: Float32Array
  // (x, y, z). atributos: { array: Float32Array, stride, pesos: [...] } o null. Se simplifica teniendo en cuenta
  // normales, uv y color (los pesos dicen cuánto importa cada uno) y con 'Permissive', que deja juntar vértices
  // partidos por una costura de uv o de normales si el cambio no se nota: es lo que permite bajar mucho más sin
  // perder forma ni sombreado. Devuelve los índices nuevos, o null si no merece la pena (menos de un 10 %).
  function indicesSimplificados(S, indices, posiciones, atributos, o) {
    const nV = posiciones.length / 3;
    const idx = indices || Uint32Array.from({ length: nV - (nV % 3) }, (_, i) => i);
    const n = idx.length;
    const objetivo = Math.max(3, Math.floor(n * o.ratio / 3) * 3);
    // 'Permissive' deja juntar vértices a ambos lados de una costura de uv: la textura se verá con zonas equivocadas
    const flags = (o.permisivo ? ['Permissive'] : []).concat(o.podar ? ['Prune'] : []);
    const [nuevos] = atributos
      ? S.simplifyWithAttributes(idx, posiciones, 3, atributos.array, atributos.stride, atributos.pesos, null, objetivo, o.error, flags)
      : S.simplify(idx, posiciones, 3, objetivo, o.error, flags);
    return nuevos.length >= n * 0.9 ? null : nuevos;
  }

  // Suelda solo los vértices idénticos (misma posición y mismos atributos): no cambia el aspecto, pero deja que el
  // simplificador trabaje sobre una malla con vértices compartidos (las mallas sin índices, como las piezas unidas,
  // no se podían reducir de otra forma). Las costuras de uv siguen separadas, así que la textura no se corre.
  // Devuelve { filas: { atributo: TypedArray con los vértices únicos }, indice: Uint32Array } o null si no se puede.
  // Valor de un componente tal como se ve (sin cuantizar)
  const MAX_CUANTIZADO = { Int8Array: 127, Uint8Array: 255, Int16Array: 32767, Uint16Array: 65535, Int32Array: 2147483647, Uint32Array: 4294967295 };
  function valorDe(A, v, c) {
    const x = A.getComponent(v, c);
    return A.normalized && MAX_CUANTIZADO[A.array.constructor.name] ? Math.max(-1, x / MAX_CUANTIZADO[A.array.constructor.name]) : x;
  }
  function soldarVertices(g, indices) {
    const nombres = Object.keys(g.attributes);
    const P = g.attributes.position, nV = P.count;
    if (!P || P.itemSize !== 3) return null;
    const idx = indices || Uint32Array.from({ length: nV - (nV % 3) }, (_, i) => i);
    const cubos = new Map(), unicos = [], mapa = new Uint32Array(nV);
    const clave = i => { const x = Math.round(valorDe(P, i, 0) * 1e4), y = Math.round(valorDe(P, i, 1) * 1e4), z = Math.round(valorDe(P, i, 2) * 1e4); return x * 73856093 ^ y * 19349663 ^ z * 83492791; };
    const igual = (a, b) => nombres.every(n => { const A = g.attributes[n]; for (let c = 0; c < A.itemSize; c++) if (valorDe(A, a, c) !== valorDe(A, b, c)) return false; return true; });
    for (let i = 0; i < nV; i++) {
      const k = clave(i);
      let lista = cubos.get(k);
      if (!lista) { lista = []; cubos.set(k, lista); }
      let hallado = -1;
      for (const j of lista) if (igual(unicos[j], i)) { hallado = j; break; }
      if (hallado < 0) { lista.push(unicos.length); unicos.push(i); hallado = unicos.length - 1; }
      mapa[i] = hallado;
    }
    // Posición, normal, uv y color como decimales (los GLB del estudio guardan algunos cuantizados, en enteros);
    // la piel (índices de hueso) conserva su tipo
    const decimal = n => n === 'position' || n === 'normal' || n === 'uv' || n === 'color';
    const filas = {};
    nombres.forEach(n => {
      const A = g.attributes[n], k = A.itemSize, out = decimal(n) ? new Float32Array(unicos.length * k) : new A.array.constructor(unicos.length * k);
      unicos.forEach((v, j) => { for (let c = 0; c < k; c++) out[j * k + c] = valorDe(A, v, c); });
      filas[n] = { array: out, itemSize: k, normalized: decimal(n) ? false : A.normalized };
    });
    const indice = Uint32Array.from(idx, v => mapa[v]);
    return { filas, indice, nVertices: unicos.length };
  }

  // Normal (3), uv (2) y color (3) de cada vértice en un solo Float32Array, con sus pesos
  function atributosDeFilas(filas, o) {
    const campos = [];
    if (filas.normal) campos.push([filas.normal, o.pesoNormal]);
    if (filas.uv) campos.push([filas.uv, o.pesoUv]);
    if (filas.color) campos.push([filas.color, o.pesoColor]);
    if (!campos.length) return null;
    const nV = filas.position.array.length / 3;
    const stride = campos.reduce((a, c) => a + c[0].itemSize, 0);
    const array = new Float32Array(nV * stride), pesos = [];
    let base = 0;
    campos.forEach(([A, peso]) => {
      const k = A.itemSize;
      for (let i = 0; i < nV; i++) for (let c = 0; c < k; c++) array[i * stride + base + c] = A.array[i * k + c];
      for (let c = 0; c < k; c++) pesos.push(peso);
      base += k;
    });
    return { array, stride, pesos };
  }

  // Menos triángulos en todas las mallas de un modelo: cada una pasa a ~'ratio' de sus triángulos sin pasar de
  // 'error' (relativo a su tamaño). Solo cambian los índices: los vértices, la piel y los huesos son los mismos,
  // así que la animación no cambia. La geometría nueva comparte los atributos con la original (no se duplica
  // memoria). Vale para mallas con y sin índices. Devuelve [triángulos antes, después].
  // opciones.presupuesto: triángulos totales que puede tener el modelo (fijo, sea cual sea la distancia). Si lo
  // supera, todas las mallas bajan a la misma proporción; si no, no se toca nada.
  function simplificarModelo(THREE, S, raiz, opciones) {
    const o = Object.assign({ ratio: 0.4, error: 0.02, minTris: 600, atributos: true, pesoNormal: 0.5, pesoUv: 0.5, pesoColor: 0.5, podar: false }, opciones);
    if (o.presupuesto) {
      let total = 0;
      raiz.traverse(m => {
        if (!m.isMesh || m.isInstancedMesh || !m.visible || Array.isArray(m.material) || !m.geometry.attributes.position) return;
        total += (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3;
      });
      o.ratio = total > o.presupuesto ? o.presupuesto / total : 1;
      if (o.ratio >= 1) return [Math.round(total), Math.round(total)];
    }
    let antes = 0, despues = 0;
    raiz.traverse(m => {
      if (!m.isMesh || m.isInstancedMesh || !m.visible || Array.isArray(m.material)) return;
      const g = m.geometry, P = g.attributes.position;
      if (!P || P.itemSize !== 3) return;
      if (Object.keys(g.morphAttributes || {}).length) return;
      const total = g.index ? g.index.count : P.count - (P.count % 3);
      const n = Math.min(total, g.drawRange.count);
      antes += n / 3;
      if (n / 3 < o.minTris || g.drawRange.start !== 0 || n < total) { despues += n / 3; return; }
      const indices = g.index ? (g.index.array instanceof Uint32Array ? g.index.array.subarray(0, n) : Uint32Array.from(g.index.array.subarray(0, n))) : null;
      const s = soldarVertices(g, indices);
      if (!s) { despues += n / 3; return; }
      const nuevos = indicesSimplificados(S, s.indice, s.filas.position.array, o.atributos ? atributosDeFilas(s.filas, o) : null, o);
      if (!nuevos) { despues += n / 3; return; }
      const ng = new THREE.BufferGeometry();
      Object.keys(s.filas).forEach(k => {
        const f = s.filas[k];
        ng.setAttribute(k, new THREE.BufferAttribute(f.array, f.itemSize, f.normalized));
      });
      ng.setIndex(new THREE.BufferAttribute(nuevos, 1));
      m.geometry = ng;
      despues += nuevos.length / 3;
    });
    return [Math.round(antes), Math.round(despues)];
  }

  const api = { fusionarPorMaterial, clonarModelo, simplificarModelo, indicesSimplificados };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FusionLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
