/*
 * heroe.js — Estadísticas del héroe, habilidades (pasivas y activas), misiones y puntos (sin gráficos).
 * Expone window.HeroeLib (o module.exports en Node para las pruebas).
 *
 * Los puntos llegan de las misiones y de la lucha (cada PUNTOS_KILLS monstruos). Se gastan en el
 * entrenador de habilidades. Las activas (patada y nova) se desbloquean con una misión.
 */
(function (root) {
  "use strict";

  const PUNTOS_KILLS = 20;   // cada 20 monstruos derrotados, 1 punto de lucha

  // Habilidades: pasivas (cada punto suma) y activas (se mejoran hasta el máximo)
  const HABILIDADES = {
    vitalidad: { tipo: 'pasiva', nombre: 'Vitalidad', desc: '+10 vida máxima por punto', max: 10 },
    fuerza: { tipo: 'pasiva', nombre: 'Fuerza', desc: '+1 de ataque por punto', max: 10 },
    destreza: { tipo: 'pasiva', nombre: 'Destreza', desc: '+1 % de crítico por punto', max: 10 },
    entereza: { tipo: 'pasiva', nombre: 'Entereza', desc: '+1 % de reducción de daño por punto', max: 10 },
    intelecto: { tipo: 'pasiva', nombre: 'Intelecto', desc: '+8 maná máximo por punto', max: 10 },
    patada: { tipo: 'activa', nombre: 'Patada giratoria (Q)', desc: '+25 % de daño por nivel', max: 3, mision: 'viajero' },
    nova: { tipo: 'activa', nombre: 'Explosión nova (E)', desc: '+25 % de daño por nivel', max: 3, mision: 'jefe1' }
  };

  // Misiones: progreso por tipo de evento; al completarse dan puntos y, si procede, desbloquean una habilidad
  const MISIONES = [
    { id: 'cazador1', titulo: 'Primeros pasos', texto: 'Derrota a 5 monstruos.', tipo: 'matar', cantidad: 5, recompensa: { puntos: 2 } },
    { id: 'cazador2', titulo: 'Cazador del bosque', texto: 'Derrota a 25 monstruos.', tipo: 'matar', cantidad: 25, recompensa: { puntos: 3 } },
    { id: 'viajero', titulo: 'Camino de piedra', texto: 'Visita 3 pueblos. Desbloquea la patada giratoria.', tipo: 'visitar', cantidad: 3, recompensa: { puntos: 2, desbloquea: 'patada' } },
    { id: 'jefe1', titulo: 'El guardián del bosque', texto: 'Derrota a un jefe. Desbloquea la explosión nova.', tipo: 'jefe', cantidad: 1, recompensa: { puntos: 4, desbloquea: 'nova' } },
    { id: 'forja', titulo: 'Forja de hojas', texto: 'Forja una pieza superior con su hoja.', tipo: 'forjar', cantidad: 1, recompensa: { puntos: 3 } }
  ];

  // Habilidades especiales de los objetos (según el tipo de pieza). Se eligen por piezaId y nivel.
  const ESPECIALES = {
    arma: [
      { id: 'filo', nombre: 'Filo sangrante', efecto: { critico: 0.05 } },
      { id: 'pesado', nombre: 'Golpe pesado', efecto: { danio: 0.10 } },
      { id: 'veloz', nombre: 'Ataque veloz', efecto: { velocidadAtaque: 0.10 } },
      { id: 'vampirica', nombre: 'Vampírica', efecto: { robo: 0.03 } }
    ],
    armadura: [
      { id: 'acero', nombre: 'Piel de acero', efecto: { defensa: 0.10 } },
      { id: 'vigia', nombre: 'Vigía', efecto: { vida: 15 } },
      { id: 'ligera', nombre: 'Ligera', efecto: { velocidad: 0.05 } },
      { id: 'espinas', nombre: 'Espinas', efecto: { reflejo: 0.05 } }
    ],
    escudo: [
      { id: 'bloqueo', nombre: 'Bloqueo firme', efecto: { bloqueo: 0.05 } },
      { id: 'solar', nombre: 'Escudo solar', efecto: { vida: 10 } }
    ]
  };

  function hash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }

  // Tipo de objeto: un arma con «Escudo» en el nombre es un escudo; el resto de armas son armas
  function tipoDe(obj) {
    if (obj.ranura === 'weapon') return /Escudo/i.test(obj.nombre) ? 'escudo' : 'arma';
    return 'armadura';
  }

  // Número de habilidades especiales según el nivel del objeto
  function cantidadEspeciales(nivel) {
    return nivel >= 30 ? 3 : nivel >= 15 ? 2 : nivel >= 5 ? 1 : 0;
  }

  // Especiales de un objeto: deterministas (no hace falta guardarlas)
  function especialesDe(obj) {
    const lista = ESPECIALES[tipoDe(obj)];
    const n = Math.min(cantidadEspeciales(obj.nivel), lista.length);
    const h = hash(obj.piezaId || obj.nombre);
    const out = [];
    for (let i = 0; i < n; i++) out.push(lista[(h + i) % lista.length]);
    return out;
  }

  // Estado de un héroe nuevo
  function nuevoHeroe() {
    return { puntos: 0, kills: 0, gastados: {}, progreso: {}, hechas: {}, desbloqueadas: {} };
  }

  // Sanea el estado guardado en una partida (campos desconocidos o dañados se descartan)
  function limpiarHeroe(h) {
    const base = nuevoHeroe();
    if (!h || typeof h !== 'object') return base;
    const num = x => (isFinite(x) && x >= 0 ? Math.floor(x) : 0);
    base.puntos = num(h.puntos);
    base.kills = num(h.kills);
    Object.keys(h.gastados || {}).forEach(k => { if (HABILIDADES[k]) base.gastados[k] = Math.min(HABILIDADES[k].max, num(h.gastados[k])); });
    Object.keys(h.progreso || {}).forEach(k => { if (MISIONES.some(m => m.id === k)) base.progreso[k] = num(h.progreso[k]); });
    Object.keys(h.hechas || {}).forEach(k => { if (MISIONES.some(m => m.id === k)) base.hechas[k] = true; });
    Object.keys(h.desbloqueadas || {}).forEach(k => { if (HABILIDADES[k]) base.desbloqueadas[k] = true; });
    return base;
  }

  // Concede puntos y desbloqueos de una misión completada
  function completar(h, m) {
    h.hechas[m.id] = true;
    h.puntos += m.recompensa.puntos || 0;
    if (m.recompensa.desbloquea) h.desbloqueadas[m.recompensa.desbloquea] = true;
    return m;
  }

  // Un evento de juego: suma progreso a las misiones de ese tipo y devuelve las recién completadas.
  // valor: cuántas unidades (por defecto 1). Para «visitar», valor es el total de pueblos visitados.
  function registrarEvento(h, tipo, valor = 1) {
    const hechas = [];
    MISIONES.forEach(m => {
      if (m.tipo !== tipo || h.hechas[m.id]) return;
      if (tipo === 'visitar') h.progreso[m.id] = Math.max(h.progreso[m.id] || 0, valor);
      else h.progreso[m.id] = (h.progreso[m.id] || 0) + valor;
      if (h.progreso[m.id] >= m.cantidad) hechas.push(completar(h, m));
    });
    return hechas;
  }

  // Monstruo derrotado: cuenta para «matar», «jefe» y los puntos de lucha
  function registrarMuerte(h, esJefe) {
    h.kills += 1;
    const hechas = registrarEvento(h, 'matar', 1);
    if (h.kills % PUNTOS_KILLS === 0) h.puntos += 1;
    if (esJefe) hechas.push(...registrarEvento(h, 'jefe', 1));
    return hechas;
  }

  // Gasta un punto en una habilidad. Las activas necesitan su misión y ganan nivel.
  function mejorar(h, id) {
    const hab = HABILIDADES[id];
    if (!hab) throw new Error('Habilidad desconocida: ' + id);
    if (hab.tipo === 'activa' && !h.desbloqueadas[id]) throw new Error('Se desbloquea con una misión');
    const nivel = h.gastados[id] || 0;
    if (nivel >= hab.max) throw new Error(hab.nombre + ' ya está al máximo');
    if (h.puntos < 1) throw new Error('No tienes puntos de habilidad');
    h.puntos -= 1;
    h.gastados[id] = nivel + 1;
    return h.gastados[id];
  }

  // Estadísticas del héroe a partir de su nivel y de su equipo (lista de objetos equipados)
  function estadisticas(h, nivelHeroe, equipados) {
    const pas = k => (h.gastados[k] || 0);
    const s = {
      vida: 100 + 12 * (nivelHeroe - 1) + 10 * pas('vitalidad'),
      maná: 50 + 6 * (nivelHeroe - 1) + 8 * pas('intelecto'),
      ataque: pas('fuerza'),
      critico: 0.05 + 0.01 * pas('destreza'),
      defensa: 0,
      reduccion: 0,
      bloqueo: 0,
      danio: 0,
      robo: 0,
      reflejo: 0,
      velocidad: 0,
      velocidadAtaque: 0,
      patada: 1 + 0.25 * (h.gastados.patada || 0),
      nova: 1 + 0.25 * (h.gastados.nova || 0)
    };
    let defensaArmadura = 0, ataqueArma = 0;
    equipados.forEach(obj => {
      if (obj.defensa) defensaArmadura += obj.defensa;
      if (obj.ataque) ataqueArma += obj.ataque;
      if (tipoDe(obj) === 'escudo') s.bloqueo += 0.15 * (obj.estado || 1);
      especialesDe(obj).forEach(e => {
        Object.keys(e.efecto).forEach(k => {
          if (k === 'critico') s.critico += e.efecto[k];
          else if (k === 'danio') s.danio += e.efecto[k];
          else if (k === 'velocidadAtaque') s.velocidadAtaque += e.efecto[k];
          else if (k === 'robo') s.robo += e.efecto[k];
          else if (k === 'reflejo') s.reflejo += e.efecto[k];
          else if (k === 'velocidad') s.velocidad += e.efecto[k];
          else if (k === 'vida') s.vida += e.efecto[k];
          else if (k === 'bloqueo') s.bloqueo += e.efecto[k];
          else if (k === 'defensa') defensaArmadura *= 1 + e.efecto[k];
        });
      });
    });
    s.ataque += ataqueArma;
    s.defensa = Math.round(defensaArmadura * 10) / 10;
    s.reduccion = Math.min(0.7, defensaArmadura / (defensaArmadura + 60) + 0.01 * pas('entereza'));
    s.bloqueo = Math.min(0.6, s.bloqueo);
    s.critico = Math.min(0.75, s.critico);
    return s;
  }

  // Texto de las estadísticas y especiales de un objeto, para el panel
  function ficha(obj) {
    const lineas = [];
    if (obj.ataque) lineas.push('Ataque ' + obj.ataque);
    if (obj.defensa) lineas.push('Defensa ' + obj.defensa);
    if (tipoDe(obj) === 'escudo') lineas.push('Bloqueo ' + Math.round(15 * (obj.estado || 1)) + ' %');
    const especiales = especialesDe(obj).map(e => e.nombre);
    return { tipo: tipoDe(obj), lineas, especiales };
  }

  const api = { HABILIDADES, MISIONES, ESPECIALES, PUNTOS_KILLS, nuevoHeroe, limpiarHeroe, registrarEvento, registrarMuerte,
    mejorar, estadisticas, ficha, especialesDe, tipoDe, cantidadEspeciales };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HeroeLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
