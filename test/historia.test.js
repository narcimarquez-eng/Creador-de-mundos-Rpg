// Pruebas de la crónica del pueblo. Ejecutar: node test/historia.test.js
const assert = require('assert');
const H = require('../js/historia.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

t('nivel 1: ningún capítulo aún', () => {
  assert.strictEqual(H.capitulosHasta(1).length, 0);
});

t('los capítulos se desbloquean por nivel, en orden', () => {
  const niveles = H.capitulosHasta(20).map(c => c.nivel);
  assert.deepStrictEqual(niveles, [...niveles].sort((a, b) => a - b));
  assert.strictEqual(H.capitulosHasta(5).length, 4);
});

t('subir de nivel: solo los capítulos nuevos del salto', () => {
  const nuevos = H.nuevosCapitulos(1, 3).map(c => c.nivel);
  assert.deepStrictEqual(nuevos, [2, 3]);
  assert.deepStrictEqual(H.nuevosCapitulos(3, 3), []);
  assert.deepStrictEqual(H.nuevosCapitulos(7, 8).map(c => c.nivel), [8]);
});

t('cada capítulo tiene sabio, título y texto', () => {
  H.CAPITULOS.forEach(c => {
    assert.ok(c.sabio && c.titulo && c.texto, 'capítulo incompleto en nivel ' + c.nivel);
  });
});

console.log(`\n${n} pruebas de la crónica superadas.`);
