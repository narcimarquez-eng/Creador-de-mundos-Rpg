/*
 * heroe.js — Estadísticas del héroe, habilidades (pasivas y activas), puntos y estado guardado (sin gráficos).
 * Expone window.HeroeLib (o module.exports en Node para las pruebas).
 *
 * Los puntos llegan de la historia (capítulos de js/historia.js), de los encargos de zona y de la lucha
 * (cada PUNTOS_KILLS monstruos). Se gastan en el entrenador. Las activas: el impacto sísmico y la nova las desbloquea la historia;
 * las técnicas de arma y de arco, el nivel del héroe. Cuatro huecos (Q, E, Z, V) eligen cuáles se usan.
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
    sismo: { tipo: 'activa', nombre: 'Impacto sísmico', desc: '+25 % de daño por nivel', max: 3, capitulo: 4 },
    nova: { tipo: 'activa', nombre: 'Explosión nova', desc: '+25 % de daño por nivel', max: 3, capitulo: 8 },
    // Técnicas: se pueden usar desde su nivel; los puntos las mejoran. arma: 'cuerpo' (no arco) o 'arco'
    tajo: { tipo: 'activa', nombre: 'Tajo giratorio', desc: '+25 % de daño por nivel', max: 3, nivel: 3, arma: 'cuerpo' },
    estocada: { tipo: 'activa', nombre: 'Estocada a fondo', desc: '+25 % de daño por nivel', max: 3, nivel: 5, arma: 'cuerpo' },
    suspension: { tipo: 'activa', nombre: 'Flecha en suspensión', desc: '+25 % de daño por nivel', max: 3, nivel: 6, arma: 'arco' },
    ascendente: { tipo: 'activa', nombre: 'Tajo ascendente', desc: '+25 % de daño por nivel', max: 3, nivel: 7, arma: 'cuerpo' },
    hendidura: { tipo: 'activa', nombre: 'Hendidura vertical', desc: '+25 % de daño por nivel', max: 3, nivel: 9, arma: 'cuerpo' },
    contraataque: { tipo: 'activa', nombre: 'Parada y contraataque', desc: '+25 % de daño por nivel', max: 3, nivel: 11, arma: 'cuerpo' },
    torbellino: { tipo: 'activa', nombre: 'Torbellino', desc: '+25 % de daño por nivel', max: 3, nivel: 13, arma: 'cuerpo' },
    voltereta: { tipo: 'activa', nombre: 'Voltereta mortal', desc: '+25 % de daño por nivel', max: 3, nivel: 15, arma: 'cuerpo' },
    tornillo: { tipo: 'activa', nombre: 'Tornillo triple', desc: '+25 % de daño por nivel', max: 3, nivel: 18, arma: 'cuerpo' }
  };

  // Huecos de la barra de habilidades y lo que llevan al empezar
  const TECLAS = ['q', 'e', 'z', 'v'];
  const BARRA_INICIAL = { q: 'sismo', e: 'nova', z: 'tajo', v: 'estocada' };

  // Habilidades con otro nombre en partidas antiguas: la patada giratoria es ahora el impacto sísmico
  const RENOMBRADAS = { patada: 'sismo' };

  // Tipos de objetivo de la historia (ver js/historia.js)
  const TIPOS_HISTORIA = ['matar', 'jefe', 'visitar', 'hablar', 'forjar'];

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

  // ¿Es un arco? (las técnicas de arco lo necesitan; con él no se usan las de cuerpo a cuerpo)
  function esArco(obj) {
    return !!obj && obj.ranura === 'weapon' && /\bArco\b/.test(obj.nombre);
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
    return { puntos: 0, kills: 0, gastados: {}, desbloqueadas: {}, zonas: {}, barra: Object.assign({}, BARRA_INICIAL),
      principal: { paso: 0, progreso: 0, objetivo: null } };
  }

  // Sanea el estado guardado en una partida (campos desconocidos o dañados se descartan)
  function limpiarHeroe(h) {
    const base = nuevoHeroe();
    if (!h || typeof h !== 'object') return base;
    const num = x => (isFinite(x) && x >= 0 ? Math.floor(x) : 0);
    base.puntos = num(h.puntos);
    base.kills = num(h.kills);
    Object.keys(h.gastados || {}).forEach(k => {
      const id = RENOMBRADAS[k] || k;
      if (HABILIDADES[id]) base.gastados[id] = Math.min(HABILIDADES[id].max, Math.max(base.gastados[id] || 0, num(h.gastados[k])));
    });
    Object.keys(h.desbloqueadas || {}).forEach(k => { const id = RENOMBRADAS[k] || k; if (HABILIDADES[id]) base.desbloqueadas[id] = true; });
    // Barra: solo habilidades activas, cada una en un hueco como mucho (partidas sin barra: la inicial)
    if (h.barra && typeof h.barra === 'object') {
      const usadas = new Set();
      TECLAS.forEach(t => {
        const id = RENOMBRADAS[h.barra[t]] || h.barra[t];
        base.barra[t] = HABILIDADES[id] && HABILIDADES[id].tipo === 'activa' && !usadas.has(id) ? id : null;
        if (base.barra[t]) usadas.add(base.barra[t]);
      });
    }
    Object.keys(h.zonas || {}).forEach(k => {
      const z = h.zonas[k];
      if (!z || !TIPOS_ZONA.includes(z.tipo)) return;
      const cantidad = Math.max(1, num(z.cantidad));
      base.zonas[k] = { tipo: z.tipo, cantidad, progreso: Math.min(cantidad, num(z.progreso)),
        lista: !!z.lista, entregada: !!z.entregada };
    });
    // Historia: paso actual, su progreso y el objetivo ya elegido. Las partidas antiguas empiezan en el capítulo 1.
    const pr = h.principal;
    if (pr && typeof pr === 'object') {
      base.principal.paso = num(pr.paso);
      base.principal.objetivo = limpiarObjetivo(pr.objetivo);
      base.principal.progreso = base.principal.objetivo ? Math.min(base.principal.objetivo.cantidad, num(pr.progreso)) : 0;
    }
    return base;
  }

  function limpiarObjetivo(o) {
    if (!o || typeof o !== 'object' || !TIPOS_HISTORIA.includes(o.tipo)) return null;
    const texto = v => (typeof v === 'string' ? v : '');
    const out = { tipo: o.tipo, cantidad: Math.max(1, isFinite(o.cantidad) ? Math.floor(o.cantidad) : 1), nombre: texto(o.nombre), texto: texto(o.texto), encargo: texto(o.encargo) };
    ['zona', 'pueblo', 'npc'].forEach(k => { if (typeof o[k] === 'string' && o[k]) out[k] = o[k]; });
    return out;
  }

  // Encargos de zona (ver js/mision-zona.js). Cada uno cuenta lo que pide su tipo: matar (cualquier monstruo de la
  // zona, también el jefe), jefe (solo el jefe) o visitar (entrar en la zona).
  const TIPOS_ZONA = ['matar', 'jefe', 'visitar'];

  // Acepta un encargo de zona. objetivo: {tipo, cantidad}
  function aceptarZona(h, zonaId, objetivo) {
    if (!TIPOS_ZONA.includes(objetivo.tipo)) throw new Error('Tipo de encargo desconocido');
    if (h.zonas[zonaId]) throw new Error('Ya tienes este encargo');
    h.zonas[zonaId] = { tipo: objetivo.tipo, cantidad: Math.max(1, objetivo.cantidad), progreso: 0, lista: false, entregada: false };
    return h.zonas[zonaId];
  }

  // Un evento en una zona: evento es 'matar' (monstruo normal), 'jefe' o 'visitar'.
  // Devuelve true solo si este evento completa el encargo.
  function registrarZona(h, zonaId, evento) {
    const z = h.zonas[zonaId];
    if (!z || z.lista) return false;
    const cuenta = z.tipo === 'visitar' ? evento === 'visitar'
      : z.tipo === 'jefe' ? evento === 'jefe'
      : evento === 'matar' || evento === 'jefe';
    if (!cuenta) return false;
    z.progreso = Math.min(z.cantidad, z.progreso + 1);
    if (z.progreso < z.cantidad) return false;
    z.lista = true;
    return true;
  }

  // Entrega un encargo completado en su pueblo. Los premios (oro, pociones) los da la visor; aquí, los puntos.
  function entregarZona(h, zonaId, puntos) {
    const z = h.zonas[zonaId];
    if (!z || !z.lista || z.entregada) throw new Error('Este encargo no se puede entregar');
    z.entregada = true;
    h.puntos += puntos || 0;
    return z;
  }

  // Recompensa de un capítulo de la historia: puntos y, si procede, una habilidad activa
  function recompensar(h, r) {
    h.puntos += (r && r.puntos) || 0;
    if (r && r.desbloquea && HABILIDADES[r.desbloquea]) h.desbloqueadas[r.desbloquea] = true;
  }

  // Monstruo derrotado: cuenta para los puntos de lucha. Devuelve true si gana un punto.
  function registrarMuerte(h) {
    h.kills += 1;
    if (h.kills % PUNTOS_KILLS !== 0) return false;
    h.puntos += 1;
    return true;
  }

  // ¿Se puede usar ya? Las de la historia, al cumplir su capítulo; las técnicas, desde su nivel
  function disponible(h, id, nivelHeroe) {
    const hab = HABILIDADES[id];
    if (!hab) return false;
    if (hab.tipo !== 'activa') return true;
    if (hab.capitulo) return !!h.desbloqueadas[id];
    return nivelHeroe >= (hab.nivel || 1);
  }

  // Por qué no se puede usar aún (texto para la interfaz)
  function requisito(id) {
    const hab = HABILIDADES[id];
    if (!hab || hab.tipo !== 'activa') return '';
    return hab.capitulo ? 'se desbloquea con la historia (capítulo ' + hab.capitulo + ')' : 'se aprende en el nivel ' + hab.nivel;
  }

  // Pone una habilidad activa en un hueco de la barra. Si ya estaba en otro, se intercambian.
  function asignar(h, tecla, id) {
    if (!TECLAS.includes(tecla)) throw new Error('Hueco desconocido: ' + tecla);
    if (id !== null && (!HABILIDADES[id] || HABILIDADES[id].tipo !== 'activa')) throw new Error('Esa habilidad no va en la barra');
    const otra = TECLAS.find(t => t !== tecla && h.barra[t] === id);
    if (otra) h.barra[otra] = h.barra[tecla];
    h.barra[tecla] = id;
    return h.barra;
  }

  // Gasta un punto en una habilidad. nivelHeroe: para las técnicas, que piden un nivel.
  function mejorar(h, id, nivelHeroe = Infinity) {
    const hab = HABILIDADES[id];
    if (!hab) throw new Error('Habilidad desconocida: ' + id);
    if (!disponible(h, id, nivelHeroe)) { const r = requisito(id); throw new Error(r.charAt(0).toUpperCase() + r.slice(1)); }
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
      mult: {}   // daño de cada habilidad activa: +25 % por punto
    };
    Object.keys(HABILIDADES).forEach(id => { if (HABILIDADES[id].tipo === 'activa') s.mult[id] = 1 + 0.25 * (h.gastados[id] || 0); });
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

  // Texto de un efecto de habilidad especial («+10 % de daño», «vida máxima +15», ...)
  function efectoTexto(efecto) {
    const pct = v => Math.round(v * 100) + ' %';
    const frases = {
      critico: v => '+' + pct(v) + ' de crítico',
      danio: v => '+' + pct(v) + ' de daño',
      velocidadAtaque: v => '+' + pct(v) + ' de velocidad de ataque',
      robo: v => 'roba ' + pct(v) + ' del daño como vida',
      reflejo: v => 'devuelve ' + pct(v) + ' del daño recibido',
      velocidad: v => '+' + pct(v) + ' de velocidad',
      vida: v => 'vida máxima +' + v,
      bloqueo: v => '+' + pct(v) + ' de bloqueo',
      defensa: v => '+' + pct(v) + ' de defensa'
    };
    return Object.keys(efecto).map(k => frases[k](efecto[k])).join(', ');
  }

  // Texto de las estadísticas y especiales de un objeto, para el panel
  function ficha(obj) {
    const lineas = [];
    if (obj.ataque) lineas.push('Ataque ' + obj.ataque);
    if (obj.defensa) lineas.push('Defensa ' + obj.defensa);
    if (tipoDe(obj) === 'escudo') lineas.push('Bloqueo ' + Math.round(15 * (obj.estado || 1)) + ' %');
    const especiales = especialesDe(obj).map(e => ({ nombre: e.nombre, texto: efectoTexto(e.efecto) }));
    return { tipo: tipoDe(obj), lineas, especiales };
  }

  const api = { HABILIDADES, ESPECIALES, PUNTOS_KILLS, TECLAS, BARRA_INICIAL, nuevoHeroe, limpiarHeroe, recompensar, registrarMuerte,
    disponible, requisito, asignar, esArco,
    aceptarZona, registrarZona, entregarZona,
    mejorar, estadisticas, ficha, especialesDe, tipoDe, cantidadEspeciales, efectoTexto };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HeroeLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
