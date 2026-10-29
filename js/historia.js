/*
 * historia.js — Crónica del pueblo inicial: capítulos que se desbloquean al subir de nivel.
 * Los cuentan los cinco sabios de la plaza. Expone window.HistoriaLib (o module.exports en Node).
 */
(function (root) {
  "use strict";

  const CAPITULOS = [
    { nivel: 2, sabio: 'Sabia Elara', titulo: 'Los siete reinos', texto: 'Antes de Aden hubo siete reinos. Cuando cayeron, sus piedras quedaron en los caminos y en nuestras murallas.' },
    { nivel: 3, sabio: 'Maestro Oren', titulo: 'El camino de piedra', texto: 'El camino de piedra une los pueblos desde antes que existieran los mapas. Quien lo sigue no se pierde, aunque cambie el tiempo.' },
    { nivel: 4, sabio: 'Hermana Ysolde', titulo: 'Las runas de la muralla', texto: 'Las runas de la muralla se leen de abajo arriba. Hay una frase oculta en la piedra del pozo que aún nadie ha descifrado.' },
    { nivel: 5, sabio: 'Viejo Tamsin', titulo: 'Los que no temen al acero', texto: 'En los bosques de la zona viven criaturas que el acero vence sin esfuerzo. Son el primer examen de cualquier guerrero.' },
    { nivel: 6, sabio: 'Erudita Mirel', titulo: 'El valor de una cota', texto: 'Una cota malgastada rinde la mitad. Quien conoce el estado de su equipo sabe cuándo luchar y cuándo reparar.' },
    { nivel: 8, sabio: 'Sabia Elara', titulo: 'La arena del herrero', texto: 'Dicen que la arena de las dunas templa el acero de las armaduras superiores. Pero solo quien tenga la hoja de la pieza puede forjarla.' },
    { nivel: 10, sabio: 'Maestro Oren', titulo: 'Los caminos del norte', texto: 'Más allá de las zonas de caza hay caminos que no figuran en ningún mapa. Algunos conducen a los jefes que guardan las rutas.' },
    { nivel: 12, sabio: 'Hermana Ysolde', titulo: 'El sello de la nova', texto: 'La nova de la energía no es un truco de guerrero: es un sello que las runas antiguas dejaron a quien lo merezca.' },
    { nivel: 15, sabio: 'Viejo Tamsin', titulo: 'Los jefes del bosque', texto: 'Cada territorio de jefe tiene su guardián. Ninguno cae a la primera, y todos dejan algo que vale la pena recordar.' },
    { nivel: 20, sabio: 'Erudita Mirel', titulo: 'El héroe de la plaza', texto: 'Cuando alguien sube hasta aquí, la plaza le recuerda. Los puestos siguen abiertos, las runas siguen en la muralla, y el camino de piedra lleva a casa.' }
  ];

  // Capítulos desbloqueados con un nivel de héroe
  function capitulosHasta(nivel) {
    return CAPITULOS.filter(c => nivel >= c.nivel);
  }

  // Capítulos que se desbloquean al pasar de nivelAntes a nivelAhora
  function nuevosCapitulos(nivelAntes, nivelAhora) {
    return CAPITULOS.filter(c => c.nivel > nivelAntes && c.nivel <= nivelAhora);
  }

  const api = { CAPITULOS, capitulosHasta, nuevosCapitulos };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HistoriaLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
