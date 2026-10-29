// Pruebas de la unión de piezas de un modelo animado por nodos. Ejecutar: node test/fusionar-modelo.test.js
const assert = require('assert');
const THREE = require('../tools/node_modules/three/build/three.cjs');
const F = require('../js/fusionar-modelo.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

// Muñeco: cuerpo con dos piezas del mismo material y un brazo animado con otra pieza de ese material
// y una de otro material
function muneco() {
  const rojo = new THREE.MeshStandardMaterial({ name: 'rojo' }), azul = new THREE.MeshStandardMaterial({ name: 'azul' });
  const modelo = new THREE.Group();
  const cuerpo = new THREE.Group(); cuerpo.name = 'cuerpo'; modelo.add(cuerpo);
  const brazo = new THREE.Group(); brazo.name = 'brazo'; brazo.position.set(1, 2, 0); cuerpo.add(brazo);
  const caja = new THREE.BoxGeometry(1, 1, 1);
  const a = new THREE.Mesh(caja, rojo); a.position.set(0, 1, 0); cuerpo.add(a);
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.5, 6, 4), rojo); b.position.set(0, 3, 0); b.scale.set(2, 1, 1); cuerpo.add(b);
  const c = new THREE.Mesh(caja, rojo); c.position.set(0.5, 0, 0); c.rotation.z = 0.4; brazo.add(c);
  const d = new THREE.Mesh(caja, azul); d.position.set(0, -1, 0); brazo.add(d);
  const clip = new THREE.AnimationClip('idle', 2, [
    new THREE.QuaternionKeyframeTrack('brazo.quaternion', [0, 1, 2], [0, 0, 0, 1, 0, 0, Math.sin(0.6), Math.cos(0.6), 0, 0, 0, 1]),
    new THREE.VectorKeyframeTrack('cuerpo.position', [0, 1, 2], [0, 0, 0, 0, 0.3, 0, 0, 0, 0])
  ]);
  return { modelo, clip };
}
// Vértices en el mundo de todas las mallas de un material (con la deformación de los huesos)
function verticesDe(modelo, nombreMat) {
  modelo.updateMatrixWorld(true);
  const out = [], v = new THREE.Vector3();
  modelo.traverse(o => {
    if (!o.isMesh || o.material.name !== nombreMat) return;
    if (o.isSkinnedMesh) o.skeleton.update();
    for (let i = 0; i < o.geometry.attributes.position.count; i++) {
      if (o.isSkinnedMesh) o.getVertexPosition(i, v); else v.fromBufferAttribute(o.geometry.attributes.position, i);
      v.applyMatrix4(o.matrixWorld);
      out.push(v.x.toFixed(4) + ',' + v.y.toFixed(4) + ',' + v.z.toFixed(4));
    }
  });
  return out.sort();
}

t('una malla por material: 4 piezas (3 rojas y 1 azul) quedan en 2', () => {
  const { modelo } = muneco();
  assert.strictEqual(F.fusionarPorMaterial(THREE, modelo), 2);
  const mallas = []; modelo.traverse(o => { if (o.isMesh) mallas.push(o); });
  assert.strictEqual(mallas.length, 2);
  assert.ok(mallas.find(m => m.material.name === 'rojo').isSkinnedMesh);
  assert.ok(!mallas.find(m => m.material.name === 'azul').isSkinnedMesh, 'la pieza sola no se toca');
});

t('la malla unida se mueve igual que las piezas sueltas durante la animación', () => {
  const ref = muneco(), fus = muneco();
  ref.modelo.position.set(10, 0, -4); ref.modelo.scale.setScalar(1.5);
  fus.modelo.position.copy(ref.modelo.position); fus.modelo.scale.copy(ref.modelo.scale);
  const raiz = new THREE.Group(); raiz.add(fus.modelo); raiz.position.set(0, 2, 0);
  const raizRef = new THREE.Group(); raizRef.add(ref.modelo); raizRef.position.set(0, 2, 0);
  F.fusionarPorMaterial(THREE, fus.modelo);
  const mR = new THREE.AnimationMixer(ref.modelo), mF = new THREE.AnimationMixer(fus.modelo);
  mR.clipAction(ref.clip).play(); mF.clipAction(fus.clip).play();
  [0.3, 0.5, 0.4].forEach(dt => {
    mR.update(dt); mF.update(dt);
    raiz.position.y += 0.7; raizRef.position.y += 0.7;   // el NPC se mueve con el suelo
    raiz.updateMatrixWorld(true); raizRef.updateMatrixWorld(true);
    assert.deepStrictEqual(verticesDe(fus.modelo, 'rojo'), verticesDe(ref.modelo, 'rojo'));
  });
});

t('dos clones que comparten geometría se unen cada uno por su lado', () => {
  const { modelo } = muneco();
  const otro = modelo.clone(true);
  F.fusionarPorMaterial(THREE, modelo);
  F.fusionarPorMaterial(THREE, otro);
  assert.deepStrictEqual(verticesDe(otro, 'rojo'), verticesDe(modelo, 'rojo'));
});

t('el color de vértice que falta en una pieza se rellena con blanco', () => {
  const { modelo } = muneco();
  const conColor = []; modelo.traverse(o => { if (o.isMesh && o.material.name === 'rojo') conColor.push(o); });
  const g = conColor[0].geometry = conColor[0].geometry.clone();
  g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3).fill(0.5), 3));
  F.fusionarPorMaterial(THREE, modelo);
  let malla; modelo.traverse(o => { if (o.isSkinnedMesh) malla = o; });
  const C = malla.geometry.attributes.color.array;
  assert.ok(C.includes(0.5) && C.includes(1));
});

t('no se tocan las piezas ocultas, transparentes, con hijos o excluidas', () => {
  const { modelo } = muneco();
  const rojas = []; modelo.traverse(o => { if (o.isMesh && o.material.name === 'rojo') rojas.push(o); });
  const [a, b, c] = rojas;
  const extra = new THREE.Mesh(a.geometry, a.material); a.parent.add(extra);
  const oculta = new THREE.Mesh(a.geometry, a.material); oculta.visible = false; a.parent.add(oculta);
  const conHijo = new THREE.Mesh(a.geometry, a.material); conHijo.add(new THREE.Object3D()); a.parent.add(conHijo);
  const transp = new THREE.Mesh(a.geometry, a.material.clone()); transp.material.transparent = true; a.parent.add(transp);
  F.fusionarPorMaterial(THREE, modelo, { excluir: [c] });
  const quedan = []; modelo.traverse(o => { if (o.isMesh) quedan.push(o); });
  [oculta, conHijo, transp, c].forEach(o => assert.ok(quedan.includes(o)));
  [a, b, extra].forEach(o => assert.ok(!quedan.includes(o)));
});

console.log(`\n${n} pruebas de la unión de modelos superadas.`);
