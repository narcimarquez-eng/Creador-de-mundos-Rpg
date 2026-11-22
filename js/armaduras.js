/*
 * armaduras.js — Sistema completo de armaduras por clase (pesada, ligera, mago),
 * nivel, grado (D..SR), diseño visual del estudio 3D y habilidades propias de cada conjunto.
 * Expone window.ArmadurasLib (o module.exports en Node para las pruebas).
 */
(function (root) {
  "use strict";

  const GRADOS_ORDEN = ['D', 'C', 'B', 'A', 'S', 'SR'];

  const GRADOS_INFO = {
    D:  { id: 'D',  nombre: 'Grado D',  rangoNivel: 'Nv 1–7',   nivelMin: 1,  mult: 1.00, color: '#94a3b8', bg: '#334155', borde: '#64748b' },
    C:  { id: 'C',  nombre: 'Grado C',  rangoNivel: 'Nv 8–14',  nivelMin: 8,  mult: 1.15, color: '#34d399', bg: '#166534', borde: '#4ade80' },
    B:  { id: 'B',  nombre: 'Grado B',  rangoNivel: 'Nv 15–22', nivelMin: 15, mult: 1.35, color: '#38bdf8', bg: '#1d4ed8', borde: '#60a5fa' },
    A:  { id: 'A',  nombre: 'Grado A',  rangoNivel: 'Nv 23–30', nivelMin: 23, mult: 1.60, color: '#c084fc', bg: '#6b21a8', borde: '#a855f7' },
    S:  { id: 'S',  nombre: 'Grado S',  rangoNivel: 'Nv 31–39', nivelMin: 31, mult: 1.90, color: '#fbbf24', bg: '#92400e', borde: '#f59e0b' },
    SR: { id: 'SR', nombre: 'Grado SR', rangoNivel: 'Nv 40–50', nivelMin: 40, mult: 2.30, color: '#fb7185', bg: '#9f1239', borde: '#fde047' }
  };

  const RANURAS_SET = ['helmet', 'torso', 'gloves', 'pants', 'boots'];

  const NOMBRES_RANURA_SET = {
    helmet: 'Casco',
    torso: 'Peto',
    gloves: 'Guantes',
    pants: 'Pantalones',
    boots: 'Botas'
  };

  const NOMBRES_RANURA_CLASE = {
    pesada: { helmet: 'Yelmo', torso: 'Coraza', gloves: 'Guanteletes', pants: 'Grebas y Escarcelas', boots: 'Escarpes' },
    ligera: { helmet: 'Capucha / Visera', torso: 'Jubón / Peto Ligero', gloves: 'Brazales', pants: 'Calzas Reforzadas', boots: 'Botas de Caza' },
    mago:   { helmet: 'Diadema / Tiara', torso: 'Túnica Arcana', gloves: 'Mangas / Guantes', pants: 'Faldón de Túnica', boots: 'Calzado Ritual' }
  };

  const PESO_RANURA_SET = {
    torso: 0.30,
    pants: 0.24,
    helmet: 0.16,
    boots: 0.16,
    gloves: 0.14
  };

  const SUBPIEZAS_POR_PANTS = {
    1:  { belt: 1,  tassets: 1,  cuisses: 1,  knees: 1  },
    2:  { belt: 2,  tassets: 5,  cuisses: 5,  knees: 5  },
    3:  { belt: 3,  tassets: 3,  cuisses: 7,  knees: 4  },
    4:  { belt: 4,  tassets: 2,  cuisses: 2,  knees: 3  },
    5:  { belt: 5,  tassets: 3,  cuisses: 3,  knees: 4  },
    6:  { belt: 6,  tassets: 6,  cuisses: 6,  knees: 6  },
    7:  { belt: 7,  tassets: 8,  cuisses: 7,  knees: 7  },
    8:  { belt: 8,  tassets: 9,  cuisses: 8,  knees: 8  },
    9:  { belt: 9,  tassets: 10, cuisses: 9,  knees: 9  },
    10: { belt: 10, tassets: 11, cuisses: 10, knees: 10 },
    11: { belt: 11, tassets: 12, cuisses: 11, knees: 11 },
    12: { belt: 12, tassets: 13, cuisses: 12, knees: 12 },
    13: { belt: 14, tassets: 4,  cuisses: 4,  knees: 5  },
    14: { belt: 16, tassets: 14, cuisses: 13, knees: 3  },
    15: { belt: 15, tassets: 0,  cuisses: 0,  knees: 0  }
  };

  const ORIGENES_INFO = {
    clasico:    { id: 'clasico',    nombre: 'Clásico / Lineage II', color: '#38bdf8' },
    forja:      { id: 'forja',      nombre: 'Forja Original',       color: '#fbbf24' },
    vanguardia: { id: 'vanguardia', nombre: 'Vanguardia',           color: '#22d3ee' },
    gotico:     { id: 'gotico',     nombre: 'Gótico Oscuro',        color: '#f87171' },
    mediobrazo: { id: 'mediobrazo', nombre: 'Medio Brazo',          color: '#c084fc' },
    l2c:        { id: 'l2c',        nombre: 'Crónicas de Aden',     color: '#f59e0b' }
  };

  const CLASES_ARMADURA = {
    pesada: {
      id: 'pesada',
      nombre: 'Armadura Pesada',
      icono: '🛡️',
      color: '#f59e0b',
      profesiones: ['guerrero'],
      defMult: 1.35,
      rasgos: ['+35 % Defensa base', '+Vida máxima por nivel', '+Reducción de daño físico', '+Reflejo de espinas en grados altos'],
      resumen: 'Forjada en placas articuladas, malla remachada y acero acanalado. Maximiza la supervivencia en vanguardia, la vida máxima y la mitigación directa.',
      silueta: 'Hombreras amplias, peto rígido con plastrón y escarcelas largas; admite escudo con armas de 1 mano.'
    },
    ligera: {
      id: 'ligera',
      nombre: 'Armadura Ligera',
      icono: '🏹',
      color: '#10b981',
      profesiones: ['cazador', 'picaro'],
      defMult: 1.00,
      rasgos: ['Defensa equilibrada', '+Probabilidad de crítico', '+Velocidad de movimiento y ataque', '-Enfriamiento de esquiva'],
      resumen: 'Cuero endurecido, brigantinas ceñidas y arneses cruzados con refuerzos selectivos. Prioriza movilidad, letalidad crítica y cadencia de golpes.',
      silueta: 'Hombreras compactas, peto ceñido con tirantes en X o paralelos y musleras despejadas para zancadas largas.'
    },
    mago: {
      id: 'mago',
      nombre: 'Armadura de Mago',
      icono: '🔮',
      color: '#a855f7',
      profesiones: ['mago'],
      defMult: 0.72,
      rasgos: ['Defensa física ligera', '+Maná máximo por nivel', '+Poder Mágico elemental', '+Regeneración de maná y Escudo arcano'],
      resumen: 'Túnicas largas de terciopelo, brocado astral y filigrana rúnica. Canaliza el éter para potenciar hechizos, reservar gran maná y sostener barreras.',
      silueta: 'Túnica talar fluida, cuello alzado o halo dorsal, protecciones ligeras en antebrazos y cinturón con bandolera.'
    }
  };

  // Especificación compacta de los 54 conjuntos (3 por clase × 6 grados D..SR)
  // Cada entrada se enlaza con su índice exacto de ARMOR_LOOKS en estudio-armaduras/index.html.
  const RAW_SETS = [
    // ==================== GRADO D (Nv 1, 4, 6) ====================
    {
      id: 'pesada_D_1', armorLook: 0, rank: 'D', cls: 'pesada', nivel: 1, origin: 'clasico',
      name: 'Soldado de Cuero Curtido & Hierro', tex: 'leather_cuirass',
      paleta: { primary: '#78350f', secondary: '#d97706', cloth: '#451a03', glow: '#fbbf24' },
      gear: { underlayer: 3, helmet: 1, torso: 1, gloves: 1, pants: 3, boots: 3 },
      diseno: 'Peto solar con sobrebarriga, cuero curtido marrón roble y placas de hierro remachadas para primera línea.',
      habs: [
        { req: 1, id: 'p_d1_1', nombre: 'Temple del Recluta', desc: '+14 vida máxima y +1 % reducción de daño.', efecto: { vida: 14, reduccion: 0.01 } },
        { req: 3, id: 'p_d1_3', nombre: 'Guardia de Hierro', desc: '+12 % defensa de armadura y +2 % bloqueo.', efecto: { defensaPct: 0.12, bloqueo: 0.02 } },
        { req: 5, id: 'p_d1_5', nombre: 'Muralla Inicial', desc: '+30 vida máxima y +3 % reducción de daño.', efecto: { vida: 30, reduccion: 0.03 } }
      ]
    },
    {
      id: 'pesada_D_2', armorLook: 1, rank: 'D', cls: 'pesada', nivel: 4, origin: 'clasico',
      name: 'Guardia de Brigantina & Costura Simple', tex: 'studded_brigandine',
      paleta: { primary: '#292524', secondary: '#d97706', cloth: '#1c1917', glow: '#f59e0b' },
      gear: { underlayer: 1, helmet: 1, torso: 6, gloves: 1, pants: 5, boots: 3 },
      diseno: 'Brigantina oscura de láminas internas cosidas con tachuelas de latón y refuerzos en brazos y piernas.',
      habs: [
        { req: 1, id: 'p_d2_1', nombre: 'Placas Cosidas', desc: '+18 vida máxima.', efecto: { vida: 18 } },
        { req: 3, id: 'p_d2_3', nombre: 'Firmeza de Patrulla', desc: '+3 % bloqueo y +3 % reflejo de espinas.', efecto: { bloqueo: 0.03, reflejo: 0.03 } },
        { req: 5, id: 'p_d2_5', nombre: 'Coraza del Centinela', desc: '+36 vida máxima y +14 % defensa.', efecto: { vida: 36, defensaPct: 0.14 } }
      ]
    },
    {
      id: 'pesada_D_3', armorLook: 33, rank: 'D', cls: 'pesada', nivel: 6, origin: 'forja',
      sig: 'ashen_oak',
      name: 'FO Centinela de Ceniza & Roble', tex: 'forge_d_ashen_oak',
      paleta: { primary: '#3d4147', secondary: '#b08949', cloth: '#4a3520', glow: '#d97706' },
      gear: { underlayer: 3, helmet: 1, torso: 1, gloves: 2, pants: 5, boots: 3 },
      diseno: 'Yugo de hierro forjado y roble con broche clavicular en tono gris ceniza y herrajes bronceados.',
      habs: [
        { req: 1, id: 'p_d3_1', nombre: 'Corteza de Roble', desc: '+22 vida máxima y +1.5 % reducción de daño.', efecto: { vida: 22, reduccion: 0.015 } },
        { req: 3, id: 'p_d3_3', nombre: 'Yugo Inamovible', desc: '+4 % reflejo de daño y +12 % defensa.', efecto: { reflejo: 0.04, defensaPct: 0.12 } },
        { req: 5, id: 'p_d3_5', nombre: 'Bastión de Ceniza', desc: '+45 vida máxima, +3 % reducción y +3 % bloqueo.', efecto: { vida: 45, reduccion: 0.03, bloqueo: 0.03 } }
      ]
    },
    {
      id: 'ligera_D_1', armorLook: 2, rank: 'D', cls: 'ligera', nivel: 1, origin: 'clasico',
      strapStyle: 'parallel_buckled',
      name: 'Explorador de Cuero Endurecido', tex: 'leather_cuirass',
      paleta: { primary: '#78350f', secondary: '#d97706', cloth: '#451a03', glow: '#fbbf24' },
      gear: { underlayer: 3, helmet: 3, torso: 2, gloves: 1, pants: 3, boots: 5 },
      diseno: 'Coraza ceñida con cresta en V, tirantes paralelos con hebillas y botas élficas de marcha ligera.',
      habs: [
        { req: 1, id: 'l_d1_1', nombre: 'Zancada Ligera', desc: '+3 % velocidad de movimiento.', efecto: { velocidad: 0.03 } },
        { req: 3, id: 'l_d1_3', nombre: 'Ojo de Rastreador', desc: '+3 % probabilidad de crítico y +3 % vel. ataque.', efecto: { critico: 0.03, velocidadAtaque: 0.03 } },
        { req: 5, id: 'l_d1_5', nombre: 'Instinto de Sendero', desc: '+4 % crítico, +5 % velocidad y -6 % recarga de esquiva.', efecto: { critico: 0.04, velocidad: 0.05, dodgeCdRed: 0.06 } }
      ]
    },
    {
      id: 'ligera_D_2', armorLook: 3, rank: 'D', cls: 'ligera', nivel: 4, origin: 'clasico',
      strapStyle: 'crossed_x',
      name: 'Escudero de Gambesón & Tirantes', tex: 'padded_gambeson',
      paleta: { primary: '#1e3a8a', secondary: '#eab308', cloth: '#172554', glow: '#60a5fa' },
      gear: { underlayer: 1, helmet: 3, torso: 6, gloves: 1, pants: 3, boots: 1 },
      diseno: 'Gambesón acolchado azul real en rombos con correajes cruzados en X y ribetes dorados.',
      habs: [
        { req: 1, id: 'l_d2_1', nombre: 'Paso Ágil', desc: '+2 % velocidad de ataque y +1.5 % crítico.', efecto: { velocidadAtaque: 0.02, critico: 0.015 } },
        { req: 3, id: 'l_d2_3', nombre: 'Arnés Cruzado', desc: '+4 % daño extra y -5 % recarga de esquiva.', efecto: { danio: 0.04, dodgeCdRed: 0.05 } },
        { req: 5, id: 'l_d2_5', nombre: 'Maniobra de Escudero', desc: '+5 % crítico, +6 % velocidad de ataque y +4 % velocidad.', efecto: { critico: 0.05, velocidadAtaque: 0.06, velocidad: 0.04 } }
      ]
    },
    {
      id: 'ligera_D_3', armorLook: 34, rank: 'D', cls: 'ligera', nivel: 6, origin: 'forja',
      sig: 'white_thorn', strapStyle: 'crossed_x',
      name: 'FO Rastreador de Espino Blanco', tex: 'forge_d_white_thorn',
      paleta: { primary: '#425245', secondary: '#cdc8ba', cloth: '#4a3122', glow: '#a7f3d0' },
      gear: { underlayer: 3, helmet: 3, torso: 2, gloves: 1, pants: 3, boots: 5 },
      diseno: 'Hombrera asimétrica de espinas blancas y bandolera de cuchillos sobre cuero verde musgo.',
      habs: [
        { req: 1, id: 'l_d3_1', nombre: 'Espina Oculta', desc: '+2.5 % crítico.', efecto: { critico: 0.025 } },
        { req: 3, id: 'l_d3_3', nombre: 'Senda del Espino', desc: '+5 % velocidad de movimiento y +6 % daño.', efecto: { velocidad: 0.05, danio: 0.06 } },
        { req: 5, id: 'l_d3_5', nombre: 'Emboscada Silvestre', desc: '+5 % crítico, +6 % vel. ataque y -8 % recarga de esquiva.', efecto: { critico: 0.05, velocidadAtaque: 0.06, dodgeCdRed: 0.08 } }
      ]
    },
    {
      id: 'mago_D_1', armorLook: 4, rank: 'D', cls: 'mago', nivel: 1, origin: 'clasico',
      name: 'Aprendiz de Túnica y Cuero', tex: 'ranger_forest_suede',
      paleta: { primary: '#14532d', secondary: '#a16207', cloth: '#3f2e21', glow: '#4ade80' },
      gear: { underlayer: 14, helmet: 3, torso: 21, gloves: 1, pants: 3, boots: 5 },
      diseno: 'Abrigo abierto asimétrico con manto de cuervo, bandolera de cuero y túnica verde bosque.',
      habs: [
        { req: 1, id: 'm_d1_1', nombre: 'Reserva de Aprendiz', desc: '+18 maná máximo.', efecto: { mana: 18 } },
        { req: 3, id: 'm_d1_3', nombre: 'Pulso Arcano', desc: '+4 Poder Mágico y +10 % regen de maná.', efecto: { poderMagico: 4, mpRegenBonus: 0.10 } },
        { req: 5, id: 'm_d1_5', nombre: 'Despertar Elemental', desc: '+30 maná máximo, +6 Poder Mágico y +4 % crítico mágico.', efecto: { mana: 30, poderMagico: 6, critico: 0.04 } }
      ]
    },
    {
      id: 'mago_D_2', armorLook: 102, rank: 'D', cls: 'mago', nivel: 4, origin: 'clasico',
      name: 'Erudito de Lino Azul & Latón', tex: 'padded_gambeson',
      paleta: { primary: '#1e3a8a', secondary: '#eab308', cloth: '#172554', glow: '#60a5fa' },
      gear: { underlayer: 1, helmet: 3, torso: 21, gloves: 1, pants: 3, boots: 5 },
      diseno: 'Túnica de erudito en lino azul cobalto acolchado con ribetes de latón y faldón ligero.',
      habs: [
        { req: 1, id: 'm_d2_1', nombre: 'Flujo de Tinta', desc: '+22 maná máximo y +6 % regen de maná.', efecto: { mana: 22, mpRegenBonus: 0.06 } },
        { req: 3, id: 'm_d2_3', nombre: 'Lectura Rápida', desc: '+5 Poder Mágico y +4 % velocidad de ataque.', efecto: { poderMagico: 5, velocidadAtaque: 0.04 } },
        { req: 5, id: 'm_d2_5', nombre: 'Sello del Estudio', desc: '+35 maná máximo, +8 Poder Mágico y +5 % escudo arcano.', efecto: { mana: 35, poderMagico: 8, escudoBonusPct: 0.05 } }
      ]
    },
    {
      id: 'mago_D_3', armorLook: 35, rank: 'D', cls: 'mago', nivel: 6, origin: 'forja',
      sig: 'mist_herbalist',
      name: 'FO Herbolario de la Bruma', tex: 'forge_d_mist_herbalist',
      paleta: { primary: '#2c3a52', secondary: '#bf7246', cloth: '#22382f', glow: '#5eead4' },
      gear: { underlayer: 14, helmet: 3, torso: 6, gloves: 1, pants: 3, boots: 5 },
      diseno: 'Bandolera de viales alquímicos brillantes e incensario portátil sobre túnica pizarra y cobre.',
      habs: [
        { req: 1, id: 'm_d3_1', nombre: 'Esencia de Bruma', desc: '+25 maná máximo y +3 Poder Mágico.', efecto: { mana: 25, poderMagico: 3 } },
        { req: 3, id: 'm_d3_3', nombre: 'Alquimia Fluida', desc: '+14 % regeneración de maná y +3 % velocidad.', efecto: { mpRegenBonus: 0.14, velocidad: 0.03 } },
        { req: 5, id: 'm_d3_5', nombre: 'Velo Alquímico', desc: '+42 maná, +9 Poder Mágico y +6 % escudo arcano.', efecto: { mana: 42, poderMagico: 9, escudoBonusPct: 0.06 } }
      ]
    },

    // ==================== GRADO C (Nv 8, 11, 13) ====================
    {
      id: 'pesada_C_1', armorLook: 5, rank: 'C', cls: 'pesada', nivel: 8, origin: 'clasico',
      name: 'Veterano de Cuero Tachonado & Malla', tex: 'studded_brigandine',
      paleta: { primary: '#292524', secondary: '#d97706', cloth: '#1c1917', glow: '#f59e0b' },
      gear: { underlayer: 6, helmet: 6, torso: 7, gloves: 2, pants: 5, boots: 3 },
      diseno: 'Cota de malla remachada bajo coraza triskele grabada con tachuelas de latón y yelmo nasal alado.',
      habs: [
        { req: 1, id: 'p_c1_1', nombre: 'Malla Remachada', desc: '+28 vida máxima y +1.5 % reducción.', efecto: { vida: 28, reduccion: 0.015 } },
        { req: 3, id: 'p_c1_3', nombre: 'Empuje de Veterano', desc: '+15 % defensa y +4 % bloqueo.', efecto: { defensaPct: 0.15, bloqueo: 0.04 } },
        { req: 5, id: 'p_c1_5', nombre: 'Vanguardia Endurecida', desc: '+55 vida máxima, +4 % reducción y +5 % daño.', efecto: { vida: 55, reduccion: 0.04, danio: 0.05 } }
      ]
    },
    {
      id: 'pesada_C_2', armorLook: 6, rank: 'C', cls: 'pesada', nivel: 11, origin: 'clasico',
      name: 'Lancero de Cuir Bouilli Grabado', tex: 'leather_cuirass',
      paleta: { primary: '#78350f', secondary: '#d97706', cloth: '#451a03', glow: '#fbbf24' },
      gear: { underlayer: 3, helmet: 6, torso: 9, gloves: 2, pants: 5, boots: 3 },
      diseno: 'Brigantina de acero y cuero hervido grabado con motivos geométricos y guanteletes góticos.',
      habs: [
        { req: 1, id: 'p_c2_1', nombre: 'Postura de Pica', desc: '+32 vida máxima y +2 % bloqueo.', efecto: { vida: 32, bloqueo: 0.02 } },
        { req: 3, id: 'p_c2_3', nombre: 'Frente Compacto', desc: '+4 % reflejo y +16 % defensa.', efecto: { reflejo: 0.04, defensaPct: 0.16 } },
        { req: 5, id: 'p_c2_5', nombre: 'Carga de Falange', desc: '+65 vida máxima, +4 % reducción y +6 % daño.', efecto: { vida: 65, reduccion: 0.04, danio: 0.06 } }
      ]
    },
    {
      id: 'pesada_C_3', armorLook: 36, rank: 'C', cls: 'pesada', nivel: 13, origin: 'forja',
      sig: 'bronze_griffin',
      name: 'FO Vanguardia del Grifo de Bronce', tex: 'forge_c_bronze_griffin',
      paleta: { primary: '#8f6538', secondary: '#d9b066', cloth: '#164652', glow: '#fbbf24' },
      gear: { underlayer: 6, helmet: 2, torso: 9, gloves: 2, pants: 2, boots: 3 },
      diseno: 'Crestas corintias de grifo en hombros y gorjal en V sobre bronce pulido y paño verde petróleo.',
      habs: [
        { req: 1, id: 'p_c3_1', nombre: 'Corazón de Grifo', desc: '+36 vida máxima y +2 % reducción.', efecto: { vida: 36, reduccion: 0.02 } },
        { req: 3, id: 'p_c3_3', nombre: 'Gorjal Corintio', desc: '+5 % bloqueo y +18 % defensa.', efecto: { bloqueo: 0.05, defensaPct: 0.18 } },
        { req: 5, id: 'p_c3_5', nombre: 'Ímpetu del Grifo', desc: '+75 vida máxima, +4 % reducción y +7 % reflejo.', efecto: { vida: 75, reduccion: 0.04, reflejo: 0.07 } }
      ]
    },
    {
      id: 'ligera_C_1', armorLook: 7, rank: 'C', cls: 'ligera', nivel: 8, origin: 'clasico',
      strapStyle: 'parallel_buckled',
      name: 'Veloz de Ante Verde & Tirantes', tex: 'ranger_forest_suede',
      paleta: { primary: '#14532d', secondary: '#a16207', cloth: '#3f2e21', glow: '#4ade80' },
      gear: { underlayer: 3, helmet: 3, torso: 4, gloves: 7, pants: 4, boots: 6 },
      diseno: 'Ante silvano verde con filigrana de caza, tirantes de cuero con hebillas y botas reforzadas.',
      habs: [
        { req: 1, id: 'l_c1_1', nombre: 'Paso del Bosque', desc: '+4 % velocidad de movimiento.', efecto: { velocidad: 0.04 } },
        { req: 3, id: 'l_c1_3', nombre: 'Cadencia Silvana', desc: '+5 % vel. ataque y +4 % crítico.', efecto: { velocidadAtaque: 0.05, critico: 0.04 } },
        { req: 5, id: 'l_c1_5', nombre: 'Viento entre Ramas', desc: '+6 % crítico, +6 % velocidad y -9 % recarga de esquiva.', efecto: { critico: 0.06, velocidad: 0.06, dodgeCdRed: 0.09 } }
      ]
    },
    {
      id: 'ligera_C_2', armorLook: 8, rank: 'C', cls: 'ligera', nivel: 11, origin: 'clasico',
      strapStyle: 'crossed_x',
      name: 'Cazador de Cuero Laminado', tex: 'assassin_shadow_leather',
      paleta: { primary: '#18181b', secondary: '#991b1b', cloth: '#09090b', glow: '#ef4444' },
      gear: { underlayer: 5, helmet: 10, torso: 9, gloves: 7, pants: 7, boots: 6 },
      diseno: 'Cuero sombrío laminado en ébano y carmesí con capucha profunda, garras de cuervo y arnés en X.',
      habs: [
        { req: 1, id: 'l_c2_1', nombre: 'Filo Acechante', desc: '+3.5 % crítico.', efecto: { critico: 0.035 } },
        { req: 3, id: 'l_c2_3', nombre: 'Lámina Carmesí', desc: '+7 % daño extra y +4 % vel. ataque.', efecto: { danio: 0.07, velocidadAtaque: 0.04 } },
        { req: 5, id: 'l_c2_5', nombre: 'Caza Implacable', desc: '+7 % crítico, +20 % daño de veneno y -10 % CD esquiva.', efecto: { critico: 0.07, venenoMult: 0.20, dodgeCdRed: 0.10 } }
      ]
    },
    {
      id: 'ligera_C_3', armorLook: 37, rank: 'C', cls: 'ligera', nivel: 13, origin: 'forja',
      sig: 'dune_falcon', strapStyle: 'parallel_buckled',
      name: 'FO Halcón de las Dunas', tex: 'forge_c_dune_falcon',
      paleta: { primary: '#9c6c31', secondary: '#ddb354', cloth: '#dfd4be', glow: '#2dd4bf' },
      gear: { underlayer: 5, helmet: 3, torso: 4, gloves: 7, pants: 4, boots: 6 },
      diseno: 'Abanico solar asimétrico de latón y gemas turquesa sobre cuero ocre y lino claro del desierto.',
      habs: [
        { req: 1, id: 'l_c3_1', nombre: 'Ala del Desierto', desc: '+4 % velocidad y +2.5 % crítico.', efecto: { velocidad: 0.04, critico: 0.025 } },
        { req: 3, id: 'l_c3_3', nombre: 'Picado del Halcón', desc: '+7 % vel. ataque y +6 % daño.', efecto: { velocidadAtaque: 0.07, danio: 0.06 } },
        { req: 5, id: 'l_c3_5', nombre: 'Espejismo Turquesa', desc: '+8 % crítico, +6 % velocidad y -11 % recarga de esquiva.', efecto: { critico: 0.08, velocidad: 0.06, dodgeCdRed: 0.11 } }
      ]
    },
    {
      id: 'mago_C_1', armorLook: 9, rank: 'C', cls: 'mago', nivel: 8, origin: 'clasico',
      name: 'Acólito de Túnica Grabada & Correas', tex: 'padded_gambeson',
      paleta: { primary: '#1e3a8a', secondary: '#eab308', cloth: '#172554', glow: '#60a5fa' },
      gear: { underlayer: 1, helmet: 3, torso: 6, gloves: 1, pants: 2, boots: 14 },
      diseno: 'Peto de laurel en relieve con túnica grabada en azul real, correas finas y botas altas dobladas.',
      habs: [
        { req: 1, id: 'm_c1_1', nombre: 'Cáliz de Acólito', desc: '+32 maná máximo y +5 Poder Mágico.', efecto: { mana: 32, poderMagico: 5 } },
        { req: 3, id: 'm_c1_3', nombre: 'Canto Grabado', desc: '+16 % regen de maná y +6 % daño mágico.', efecto: { mpRegenBonus: 0.16, danio: 0.06 } },
        { req: 5, id: 'm_c1_5', nombre: 'Manto del Altar', desc: '+55 maná, +11 Poder Mágico y +7 % escudo arcano.', efecto: { mana: 55, poderMagico: 11, escudoBonusPct: 0.07 } }
      ]
    },
    {
      id: 'mago_C_2', armorLook: 103, rank: 'C', cls: 'mago', nivel: 11, origin: 'clasico',
      name: 'Hechicero de Terciopelo Púrpura & Oro', tex: 'royal_brocade_velvet',
      paleta: { primary: '#581c87', secondary: '#facc15', cloth: '#3b0764', glow: '#e879f9' },
      gear: { underlayer: 15, helmet: 3, torso: 6, gloves: 1, pants: 2, boots: 14 },
      diseno: 'Terciopelo heráldico púrpura bordado en hilo de oro con brocado imperial y tiara esmeralda.',
      habs: [
        { req: 1, id: 'm_c2_1', nombre: 'Terciopelo Rúnico', desc: '+36 maná máximo y +6 Poder Mágico.', efecto: { mana: 36, poderMagico: 6 } },
        { req: 3, id: 'm_c2_3', nombre: 'Brocado Ígneo', desc: '+14 % daño con fuego y +5 % crítico.', efecto: { fuegoMult: 0.14, critico: 0.05 } },
        { req: 5, id: 'm_c2_5', nombre: 'Corona de Hechicería', desc: '+65 maná, +13 Poder Mágico y +20 % regen de maná.', efecto: { mana: 65, poderMagico: 13, mpRegenBonus: 0.20 } }
      ]
    },
    {
      id: 'mago_C_3', armorLook: 38, rank: 'C', cls: 'mago', nivel: 13, origin: 'forja',
      sig: 'amber_scribe',
      name: 'FO Escriba de Tinta & Ámbar', tex: 'forge_c_amber_scribe',
      paleta: { primary: '#3f1e44', secondary: '#d8a648', cloth: '#1f1226', glow: '#fbbf24' },
      gear: { underlayer: 15, helmet: 3, torso: 6, gloves: 1, pants: 2, boots: 14 },
      diseno: 'Tubos de pergamino sellados en espalda y reloj de arena de ámbar sobre paño ciruela y oro viejo.',
      habs: [
        { req: 1, id: 'm_c3_1', nombre: 'Tinta Áurea', desc: '+40 maná máximo y +7 Poder Mágico.', efecto: { mana: 40, poderMagico: 7 } },
        { req: 3, id: 'm_c3_3', nombre: 'Reloj de Arena Arcano', desc: '+18 % regen de maná y +14 % daño con hielo.', efecto: { mpRegenBonus: 0.18, hieloMult: 0.14 } },
        { req: 5, id: 'm_c3_5', nombre: 'Archivo Vivo', desc: '+72 maná, +15 Poder Mágico y +8 % escudo arcano.', efecto: { mana: 72, poderMagico: 15, escudoBonusPct: 0.08 } }
      ]
    },

    // ==================== GRADO B (Nv 15, 18, 21) ====================
    {
      id: 'pesada_B_1', armorLook: 10, rank: 'B', cls: 'pesada', nivel: 15, origin: 'clasico',
      name: 'L2 Blue Wolf Heavy (Acero Azulado & Plata)', tex: 'tallum_heavy_l2',
      paleta: { primary: '#475c74', secondary: '#dbe5f2', cloth: '#152032', glow: '#38bdf8' },
      gear: { underlayer: 6, helmet: 2, torso: 5, gloves: 3, pants: 4, boots: 2 },
      diseno: 'Placas acanaladas de acero azulado y plata con corazón alado, cenefas de borde y escarcelas largas.',
      habs: [
        { req: 1, id: 'p_b1_1', nombre: 'Templanza del Lobo', desc: '+48 vida máxima y +2.5 % reducción.', efecto: { vida: 48, reduccion: 0.025 } },
        { req: 3, id: 'p_b1_3', nombre: 'Aullido de Acero', desc: '+18 % defensa y +6 % velocidad de ataque.', efecto: { defensaPct: 0.18, velocidadAtaque: 0.06 } },
        { req: 5, id: 'p_b1_5', nombre: 'Furia del Lobo Azul', desc: '+95 vida máxima, +5 % reducción y +9 % daño.', efecto: { vida: 95, reduccion: 0.05, danio: 0.09 } }
      ]
    },
    {
      id: 'pesada_B_2', armorLook: 11, rank: 'B', cls: 'pesada', nivel: 18, origin: 'clasico',
      name: 'L2 Doom Heavy (Placas Góticas Oscuras)', tex: 'nightmare_obsidian_blood',
      paleta: { primary: '#1d1e24', secondary: '#8b1d28', cloth: '#110b10', glow: '#ef4444' },
      gear: { underlayer: 13, helmet: 4, torso: 3, gloves: 2, pants: 4, boots: 2 },
      diseno: 'Coraza gótica abisal escalonada en acero negro y sangre oscura con guanteletes con púas.',
      habs: [
        { req: 1, id: 'p_b2_1', nombre: 'Hierro Sombrío', desc: '+55 vida máxima y +4 % reflejo.', efecto: { vida: 55, reflejo: 0.04 } },
        { req: 3, id: 'p_b2_3', nombre: 'Bastión del Destino', desc: '+6 % bloqueo y +20 % defensa.', efecto: { bloqueo: 0.06, defensaPct: 0.20 } },
        { req: 5, id: 'p_b2_5', nombre: 'Condena Inquebrantable', desc: '+110 vida máxima, +6 % reducción y +4 % robo de vida.', efecto: { vida: 110, reduccion: 0.06, robo: 0.04 } }
      ]
    },
    {
      id: 'pesada_B_3', armorLook: 39, rank: 'B', cls: 'pesada', nivel: 21, origin: 'forja',
      sig: 'sunken_cathedral',
      name: 'FO Caballero de la Catedral Sumergida', tex: 'forge_b_sunken_cathedral',
      paleta: { primary: '#2c4c57', secondary: '#d2dfec', cloth: '#12242c', glow: '#38bdf8' },
      gear: { underlayer: 6, helmet: 2, torso: 12, gloves: 3, pants: 6, boots: 2 },
      diseno: 'Arbotantes góticos en hombros y rosetón central con perla marina en acero verdiazul y plata.',
      habs: [
        { req: 1, id: 'p_b3_1', nombre: 'Eco Abismal', desc: '+62 vida máxima y +3 % reducción.', efecto: { vida: 62, reduccion: 0.03 } },
        { req: 3, id: 'p_b3_3', nombre: 'Arbotante Sagrado', desc: '+7 % bloqueo y +22 % defensa.', efecto: { bloqueo: 0.07, defensaPct: 0.22 } },
        { req: 5, id: 'p_b3_5', nombre: 'Rosetón de la Marea', desc: '+125 vida máxima, +6 % reducción y +8 % reflejo.', efecto: { vida: 125, reduccion: 0.06, reflejo: 0.08 } }
      ]
    },
    {
      id: 'ligera_B_1', armorLook: 12, rank: 'B', cls: 'ligera', nivel: 15, origin: 'clasico',
      strapStyle: 'crossed_x',
      name: 'L2 Blue Wolf Light (Cuero & Placas Ligeras)', tex: 'majestic_l2',
      paleta: { primary: '#dfd6c7', secondary: '#c5973e', cloth: '#1c2848', glow: '#60a5fa' },
      gear: { underlayer: 5, helmet: 3, torso: 14, gloves: 3, pants: 4, boots: 7 },
      diseno: 'Coraza Valquiria de cuello alto en marfil y oro con aletas de paletilla, tirantes en X y botas altas.',
      habs: [
        { req: 1, id: 'l_b1_1', nombre: 'Reflejo Plateado', desc: '+4 % crítico y +4 % velocidad.', efecto: { critico: 0.04, velocidad: 0.04 } },
        { req: 3, id: 'l_b1_3', nombre: 'Danza del Lobo', desc: '+9 % velocidad de ataque y +8 % daño.', efecto: { velocidadAtaque: 0.09, danio: 0.08 } },
        { req: 5, id: 'l_b1_5', nombre: 'Asalto Relámpago', desc: '+9 % crítico, +7 % velocidad y -12 % recarga de esquiva.', efecto: { critico: 0.09, velocidad: 0.07, dodgeCdRed: 0.12 } }
      ]
    },
    {
      id: 'ligera_B_2', armorLook: 13, rank: 'B', cls: 'ligera', nivel: 18, origin: 'clasico',
      strapStyle: 'parallel_buckled',
      name: 'L2 Doom Light (Brigantina Sombría)', tex: 'assassin_shadow_leather',
      paleta: { primary: '#18181b', secondary: '#991b1b', cloth: '#09090b', glow: '#ef4444' },
      gear: { underlayer: 12, helmet: 3, torso: 14, gloves: 3, pants: 4, boots: 7 },
      diseno: 'Brigantina negra y carmesí con cota lamelar oriental, hebillas paralelas y botas rúnicas remachadas.',
      habs: [
        { req: 1, id: 'l_b2_1', nombre: 'Sombra Letal', desc: '+5 % crítico.', efecto: { critico: 0.05 } },
        { req: 3, id: 'l_b2_3', nombre: 'Pulso de Asesino', desc: '+10 % daño y +3 % robo de vida.', efecto: { danio: 0.10, robo: 0.03 } },
        { req: 5, id: 'l_b2_5', nombre: 'Pacto de la Noche', desc: '+10 % crítico, +25 % daño de veneno y +8 % vel. ataque.', efecto: { critico: 0.10, venenoMult: 0.25, velocidadAtaque: 0.08 } }
      ]
    },
    {
      id: 'ligera_B_3', armorLook: 40, rank: 'B', cls: 'ligera', nivel: 21, origin: 'forja',
      sig: 'iron_rose', strapStyle: 'crossed_x',
      name: 'FO Danzante de la Rosa de Hierro', tex: 'forge_b_iron_rose',
      paleta: { primary: '#262830', secondary: '#d88c7c', cloth: '#541124', glow: '#fb7185' },
      gear: { underlayer: 12, helmet: 3, torso: 14, gloves: 3, pants: 4, boots: 7 },
      diseno: 'Enredaderas espinosas de oro rosa y rosas forjadas 3D sobre cuero antracita y terciopelo burdeos.',
      habs: [
        { req: 1, id: 'l_b3_1', nombre: 'Espina de Oro Rosa', desc: '+5 % crítico y +5 % velocidad.', efecto: { critico: 0.05, velocidad: 0.05 } },
        { req: 3, id: 'l_b3_3', nombre: 'Vals Cortante', desc: '+11 % vel. ataque y +4 % reflejo.', efecto: { velocidadAtaque: 0.11, reflejo: 0.04 } },
        { req: 5, id: 'l_b3_5', nombre: 'Floración Mortal', desc: '+11 % crítico, +12 % daño y -14 % recarga de esquiva.', efecto: { critico: 0.11, danio: 0.12, dodgeCdRed: 0.14 } }
      ]
    },
    {
      id: 'mago_B_1', armorLook: 14, rank: 'B', cls: 'mago', nivel: 15, origin: 'clasico',
      name: 'L2 Avadon Robe (Túnica Arcana Real)', tex: 'arcane_crystal_amethyst',
      paleta: { primary: '#6b21a8', secondary: '#f0abfc', cloth: '#3b0764', glow: '#e879f9' },
      gear: { underlayer: 15, helmet: 5, torso: 4, gloves: 3, pants: 6, boots: 9 },
      diseno: 'Túnica arcana de amatista y filigrana lila con halo de rayos, terciopelo bordado y botas lamelares.',
      habs: [
        { req: 1, id: 'm_b1_1', nombre: 'Fuente de Avadon', desc: '+55 maná máximo y +9 Poder Mágico.', efecto: { mana: 55, poderMagico: 9 } },
        { req: 3, id: 'm_b1_3', nombre: 'Amatista Resonante', desc: '+22 % regen de maná y +6 % crítico.', efecto: { mpRegenBonus: 0.22, critico: 0.06 } },
        { req: 5, id: 'm_b1_5', nombre: 'Égida de Avadon', desc: '+95 maná, +18 Poder Mágico y +10 % escudo arcano.', efecto: { mana: 95, poderMagico: 18, escudoBonusPct: 0.10 } }
      ]
    },
    {
      id: 'mago_B_2', armorLook: 104, rank: 'B', cls: 'mago', nivel: 18, origin: 'clasico',
      name: 'L2 Blue Wolf Robe (Túnica Estelar de Cobalto)', tex: 'celestial_astral_constellation',
      paleta: { primary: '#0f172a', secondary: '#facc15', cloth: '#1e1b4b', glow: '#fde047' },
      gear: { underlayer: 15, helmet: 5, torso: 4, gloves: 3, pants: 6, boots: 9 },
      diseno: 'Túnica cobalto estelar con constelaciones doradas, corona de rayos y ribetes astrales.',
      habs: [
        { req: 1, id: 'm_b2_1', nombre: 'Manto Estelar', desc: '+60 maná máximo y +10 Poder Mágico.', efecto: { mana: 60, poderMagico: 10 } },
        { req: 3, id: 'm_b2_3', nombre: 'Caudal Astral', desc: '+25 % regen de maná y +10 % daño.', efecto: { mpRegenBonus: 0.25, danio: 0.10 } },
        { req: 5, id: 'm_b2_5', nombre: 'Orbe del Lobo Azul', desc: '+110 maná, +20 Poder Mágico y +18 % daño con hielo.', efecto: { mana: 110, poderMagico: 20, hieloMult: 0.18 } }
      ]
    },
    {
      id: 'mago_B_3', armorLook: 41, rank: 'B', cls: 'mago', nivel: 21, origin: 'forja',
      sig: 'stained_glass',
      name: 'FO Tejedor de Vitral Lunar', tex: 'forge_b_stained_glass',
      paleta: { primary: '#1b2654', secondary: '#c8d6ec', cloth: '#291547', glow: '#67e8f9' },
      gear: { underlayer: 15, helmet: 5, torso: 4, gloves: 3, pants: 6, boots: 9 },
      diseno: 'Halo catedralicio de vitral lunar tras nuca y hombros en azul noche, plata helada y violeta.',
      habs: [
        { req: 1, id: 'm_b3_1', nombre: 'Prisma Lunar', desc: '+68 maná máximo y +11 Poder Mágico.', efecto: { mana: 68, poderMagico: 11 } },
        { req: 3, id: 'm_b3_3', nombre: 'Refracción Glacial', desc: '+20 % daño con hielo y +24 % regen de maná.', efecto: { hieloMult: 0.20, mpRegenBonus: 0.24 } },
        { req: 5, id: 'm_b3_5', nombre: 'Halo de Vitral', desc: '+120 maná, +23 Poder Mágico y +12 % escudo arcano.', efecto: { mana: 120, poderMagico: 23, escudoBonusPct: 0.12 } }
      ]
    },

    // ==================== GRADO A (Nv 23, 26, 29) ====================
    {
      id: 'pesada_A_1', armorLook: 15, rank: 'A', cls: 'pesada', nivel: 23, origin: 'clasico',
      name: 'L2 Dark Crystal Heavy (Índigo & Cristal Cian)', tex: 'dark_crystal_l2',
      paleta: { primary: '#1e2742', secondary: '#d4a24c', cloth: '#13182b', glow: '#38bdf8' },
      gear: { underlayer: 16, helmet: 9, torso: 12, gloves: 6, pants: 8, boots: 13 },
      diseno: 'Placas índigo medianoche con biseles de oro bruñido, cristales cian luminosos y espaldar laminado.',
      habs: [
        { req: 1, id: 'p_a1_1', nombre: 'Núcleo de Cristal', desc: '+78 vida máxima y +3.5 % reducción.', efecto: { vida: 78, reduccion: 0.035 } },
        { req: 3, id: 'p_a1_3', nombre: 'Prisma Defensivo', desc: '+8 % bloqueo y +24 % defensa.', efecto: { bloqueo: 0.08, defensaPct: 0.24 } },
        { req: 5, id: 'p_a1_5', nombre: 'Baluarte Cristalino', desc: '+155 vida máxima, +7 % reducción y +8 % reflejo.', efecto: { vida: 155, reduccion: 0.07, reflejo: 0.08 } }
      ]
    },
    {
      id: 'pesada_A_2', armorLook: 42, rank: 'A', cls: 'pesada', nivel: 26, origin: 'forja',
      sig: 'frost_clockwork',
      name: 'FO Soberano de Escarcha & Relojería', tex: 'forge_a_frost_clockwork',
      paleta: { primary: '#c5d8ec', secondary: '#e6c982', cloth: '#15253d', glow: '#38bdf8' },
      gear: { underlayer: 16, helmet: 8, torso: 12, gloves: 6, pants: 8, boots: 4 },
      diseno: 'Engranajes dorados cinéticos girando en la espalda con placas de acero glacial y cristales cian.',
      habs: [
        { req: 1, id: 'p_a2_1', nombre: 'Piñón Glacial', desc: '+85 vida máxima y +25 % defensa.', efecto: { vida: 85, defensaPct: 0.25 } },
        { req: 3, id: 'p_a2_3', nombre: 'Pulso de Relojería', desc: '+10 % vel. ataque y +25 % daño a ralentizados.', efecto: { velocidadAtaque: 0.10, multSlowBonus: 0.25 } },
        { req: 5, id: 'p_a2_5', nombre: 'Soberanía Eterna', desc: '+170 vida máxima, +8 % reducción y +12 % daño.', efecto: { vida: 170, reduccion: 0.08, danio: 0.12 } }
      ]
    },
    {
      id: 'pesada_A_3', armorLook: 51, rank: 'A', cls: 'pesada', nivel: 29, origin: 'vanguardia',
      sig: 'vanguard_heavy_magma',
      name: 'VR Coloso de Basalto & Magma Flotante', tex: 'forge_v_magma_monolith',
      paleta: { primary: '#1c191c', secondary: '#ff6a1a', cloth: '#2b100c', glow: '#ff5500' },
      gear: { underlayer: 11, helmet: 8, torso: 13, gloves: 6, pants: 8, boots: 8 },
      diseno: '6 monolitos de basalto flotantes, jaula costal abierta y núcleo incandescente de magma vivo.',
      habs: [
        { req: 1, id: 'p_a3_1', nombre: 'Piel Basáltica', desc: '+95 vida máxima y +6 % reflejo.', efecto: { vida: 95, reflejo: 0.06 } },
        { req: 3, id: 'p_a3_3', nombre: 'Fragua Costal', desc: '+22 % daño con fuego y +25 % defensa.', efecto: { fuegoMult: 0.22, defensaPct: 0.25 } },
        { req: 5, id: 'p_a3_5', nombre: 'Manto Magmático', desc: '+190 vida máxima, +8 % reducción y +10 % reflejo.', efecto: { vida: 190, reduccion: 0.08, reflejo: 0.10 } }
      ]
    },
    {
      id: 'ligera_A_1', armorLook: 18, rank: 'A', cls: 'ligera', nivel: 23, origin: 'clasico',
      strapStyle: 'crossed_x',
      name: 'L2 Majestic Light (Marfil, Oro & Zafiro)', tex: 'majestic_l2',
      paleta: { primary: '#dfd6c7', secondary: '#c5973e', cloth: '#1c2848', glow: '#60a5fa' },
      gear: { underlayer: 7, helmet: 7, torso: 16, gloves: 6, pants: 9, boots: 4 },
      diseno: 'Cuero blanco marfil y zafiro con ribetes de oro, cota élfica de mithril y alas dorsales en X.',
      habs: [
        { req: 1, id: 'l_a1_1', nombre: 'Gracia Majestic', desc: '+6 % crítico y +5 % velocidad.', efecto: { critico: 0.06, velocidad: 0.05 } },
        { req: 3, id: 'l_a1_3', nombre: 'Arco de Zafiro', desc: '+12 % daño y +11 % velocidad de ataque.', efecto: { danio: 0.12, velocidadAtaque: 0.11 } },
        { req: 5, id: 'l_a1_5', nombre: 'Maestría Real', desc: '+12 % crítico, +9 % velocidad y -15 % recarga de esquiva.', efecto: { critico: 0.12, velocidad: 0.09, dodgeCdRed: 0.15 } }
      ]
    },
    {
      id: 'ligera_A_2', armorLook: 43, rank: 'A', cls: 'ligera', nivel: 26, origin: 'forja',
      sig: 'obsidian_jade', strapStyle: 'crossed_x',
      name: 'FO Espectro de Obsidiana & Jade', tex: 'forge_a_obsidian_jade',
      paleta: { primary: '#15191e', secondary: '#dfb24e', cloth: '#09382c', glow: '#10b981' },
      gear: { underlayer: 12, helmet: 7, torso: 16, gloves: 6, pants: 9, boots: 4 },
      diseno: '3 cuchillas de jade flotantes en abanico dorsal y cuello kintsugi dorado sobre obsidiana.',
      habs: [
        { req: 1, id: 'l_a2_1', nombre: 'Filo Kintsugi', desc: '+6.5 % crítico.', efecto: { critico: 0.065 } },
        { req: 3, id: 'l_a2_3', nombre: 'Abanico de Jade', desc: '+14 % velocidad de ataque y +30 % daño de veneno.', efecto: { velocidadAtaque: 0.14, venenoMult: 0.30 } },
        { req: 5, id: 'l_a2_5', nombre: 'Paso Espectral', desc: '+13 % crítico, +15 % daño y -16 % recarga de esquiva.', efecto: { critico: 0.13, danio: 0.15, dodgeCdRed: 0.16 } }
      ]
    },
    {
      id: 'ligera_A_3', armorLook: 63, rank: 'A', cls: 'ligera', nivel: 29, origin: 'gotico',
      sig: 'gothic_light_inquisitor', strapStyle: 'crossed_x',
      name: 'GT Cazador de Brujas', tex: 'forge_g_witchhunter',
      paleta: { primary: '#17151a', secondary: '#9c8356', cloth: '#291214', glow: '#92400e' },
      gear: { underlayer: 12, helmet: 7, torso: 14, gloves: 6, pants: 9, boots: 13 },
      diseno: 'Cuello alto rígido de cuero con hebillas, hombro de 4 cuchillas metálicas y bandolera de estacas.',
      habs: [
        { req: 1, id: 'l_a3_1', nombre: 'Acecho Inquisitorial', desc: '+7 % crítico y +4 % robo de vida.', efecto: { critico: 0.07, robo: 0.04 } },
        { req: 3, id: 'l_a3_3', nombre: 'Estaca Certera', desc: '+15 % daño y +12 % vel. ataque.', efecto: { danio: 0.15, velocidadAtaque: 0.12 } },
        { req: 5, id: 'l_a3_5', nombre: 'Sentencia Nocturna', desc: '+14 % crítico, +10 % velocidad y -18 % recarga de esquiva.', efecto: { critico: 0.14, velocidad: 0.10, dodgeCdRed: 0.18 } }
      ]
    },
    {
      id: 'mago_A_1', armorLook: 20, rank: 'A', cls: 'mago', nivel: 23, origin: 'clasico',
      name: 'L2 Dark Crystal Robe (Archimago Índigo)', tex: 'dark_crystal_l2',
      paleta: { primary: '#1e2742', secondary: '#d4a24c', cloth: '#13182b', glow: '#38bdf8' },
      gear: { underlayer: 16, helmet: 9, torso: 20, gloves: 6, pants: 8, boots: 13 },
      diseno: 'Túnica Dark Crystal en índigo y oro bruñido con diadema de crestón cian y guanteletes rúnicos.',
      habs: [
        { req: 1, id: 'm_a1_1', nombre: 'Cristal de Maná', desc: '+85 maná máximo y +14 Poder Mágico.', efecto: { mana: 85, poderMagico: 14 } },
        { req: 3, id: 'm_a1_3', nombre: 'Canalización Rápida', desc: '+30 % regen de maná y +12 % vel. ataque.', efecto: { mpRegenBonus: 0.30, velocidadAtaque: 0.12 } },
        { req: 5, id: 'm_a1_5', nombre: 'Dominio Dark Crystal', desc: '+150 maná, +28 Poder Mágico y +14 % escudo arcano.', efecto: { mana: 150, poderMagico: 28, escudoBonusPct: 0.14 } }
      ]
    },
    {
      id: 'mago_A_2', armorLook: 44, rank: 'A', cls: 'mago', nivel: 26, origin: 'forja',
      sig: 'mercury_eclipse',
      name: 'FO Oráculo del Eclipse de Mercurio', tex: 'forge_a_mercury_eclipse',
      paleta: { primary: '#d8e0eb', secondary: '#e8cb7a', cloth: '#11131a', glow: '#e0f2fe' },
      gear: { underlayer: 16, helmet: 9, torso: 20, gloves: 6, pants: 8, boots: 13 },
      diseno: 'Anillos de eclipse contrarrotatorios y 6 orbes de mercurio líquido flotando en torno al manto plata.',
      habs: [
        { req: 1, id: 'm_a2_1', nombre: 'Orbes de Azogue', desc: '+95 maná máximo y +16 Poder Mágico.', efecto: { mana: 95, poderMagico: 16 } },
        { req: 3, id: 'm_a2_3', nombre: 'Eclipse Contrarrotatorio', desc: '+8 % crítico y +22 % daño con hielo.', efecto: { critico: 0.08, hieloMult: 0.22 } },
        { req: 5, id: 'm_a2_5', nombre: 'Conjura del Eclipse', desc: '+165 maná, +32 Poder Mágico y +32 % regen de maná.', efecto: { mana: 165, poderMagico: 32, mpRegenBonus: 0.32 } }
      ]
    },
    {
      id: 'mago_A_3', armorLook: 57, rank: 'A', cls: 'mago', nivel: 29, origin: 'vanguardia',
      sig: 'vanguard_mage_tesla',
      name: 'VR Tejedor de Bobinas de Tesla Arcanas', tex: 'forge_v_tesla_arcane',
      paleta: { primary: '#16253b', secondary: '#d97b43', cloth: '#0e1726', glow: '#38bdf8' },
      gear: { underlayer: 16, helmet: 9, torso: 20, gloves: 6, pants: 8, boots: 13 },
      diseno: 'Dos bobinas de Tesla dorsales en cobre arcano con arcos eléctricos 3D y condensador pectoral.',
      habs: [
        { req: 1, id: 'm_a3_1', nombre: 'Condensador Etéreo', desc: '+105 maná máximo y +18 Poder Mágico.', efecto: { mana: 105, poderMagico: 18 } },
        { req: 3, id: 'm_a3_3', nombre: 'Descarga Voltaica', desc: '+14 % daño mágico y +9 % crítico.', efecto: { danio: 0.14, critico: 0.09 } },
        { req: 5, id: 'm_a3_5', nombre: 'Sobrecarga Tesla', desc: '+180 maná, +36 Poder Mágico y +16 % escudo arcano.', efecto: { mana: 180, poderMagico: 36, escudoBonusPct: 0.16 } }
      ]
    },

    // ==================== GRADO S (Nv 31, 35, 38) ====================
    {
      id: 'pesada_S_1', armorLook: 21, rank: 'S', cls: 'pesada', nivel: 31, origin: 'clasico',
      cape: 'raven_imperial_gold',
      name: 'L2 Imperial Crusader Heavy (Marfil, Oro & Carmesí)', tex: 'imperial_crusader_crimson',
      paleta: { primary: '#e9eef6', secondary: '#d9a441', cloth: '#6d1020', glow: '#fbbf24' },
      gear: { underlayer: 7, helmet: 11, torso: 10, gloves: 4, pants: 10, boots: 11 },
      diseno: 'Peto alto de Arconte en marfil y oro imperial con aletas estridentes, capa real y guanteletes alados.',
      habs: [
        { req: 1, id: 'p_s1_1', nombre: 'Estandarte Imperial', desc: '+115 vida máxima y +4 % reducción.', efecto: { vida: 115, reduccion: 0.04 } },
        { req: 3, id: 'p_s1_3', nombre: 'Égida del Cruzado', desc: '+10 % bloqueo y +28 % defensa.', efecto: { bloqueo: 0.10, defensaPct: 0.28 } },
        { req: 5, id: 'p_s1_5', nombre: 'Gloria de Aden', desc: '+220 vida máxima, +9 % reducción y +15 % daño.', efecto: { vida: 220, reduccion: 0.09, danio: 0.15 } }
      ]
    },
    {
      id: 'pesada_S_2', armorLook: 45, rank: 'S', cls: 'pesada', nivel: 35, origin: 'forja',
      sig: 'alabaster_phoenix', cape: 'raven_phoenix_crimson',
      name: 'FO Paladín del Fénix de Alabastro', tex: 'forge_s_alabaster_phoenix',
      paleta: { primary: '#f2ede2', secondary: '#eba934', cloth: '#7d121d', glow: '#fb923c' },
      gear: { underlayer: 18, helmet: 11, torso: 15, gloves: 4, pants: 10, boots: 11 },
      diseno: '6 alas esculpidas de alabastro y oro con halo solar y capa de plumas carmesí de fénix.',
      habs: [
        { req: 1, id: 'p_s2_1', nombre: 'Pluma de Alabastro', desc: '+125 vida máxima y +5 % reflejo.', efecto: { vida: 125, reflejo: 0.05 } },
        { req: 3, id: 'p_s2_3', nombre: 'Aura del Fénix', desc: '+25 % daño con fuego y +10 % bloqueo.', efecto: { fuegoMult: 0.25, bloqueo: 0.10 } },
        { req: 5, id: 'p_s2_5', nombre: 'Renacer Solar', desc: '+245 vida máxima, +9 % reducción y +5 % robo de vida.', efecto: { vida: 245, reduccion: 0.09, robo: 0.05 } }
      ]
    },
    {
      id: 'pesada_S_3', armorLook: 60, rank: 'S', cls: 'pesada', nivel: 38, origin: 'gotico',
      sig: 'gothic_heavy_catedral',
      name: 'GT Catedral del Verdugo', tex: 'forge_g_cathedral_iron',
      paleta: { primary: '#1b1d22', secondary: '#8b93a0', cloth: '#191112', glow: '#991b1b' },
      gear: { underlayer: 18, helmet: 11, torso: 22, gloves: 8, pants: 10, boots: 15 },
      diseno: 'Torres ojivales en hombros, gorjal-fortaleza de púas y arbotantes de acero forjado con cuero remachado.',
      habs: [
        { req: 1, id: 'p_s3_1', nombre: 'Torre Ojival', desc: '+135 vida máxima y +7 % reflejo.', efecto: { vida: 135, reflejo: 0.07 } },
        { req: 3, id: 'p_s3_3', nombre: 'Púas de Catedral', desc: '+30 % defensa y +14 % daño.', efecto: { defensaPct: 0.30, danio: 0.14 } },
        { req: 5, id: 'p_s3_5', nombre: 'Juicio del Verdugo', desc: '+265 vida máxima, +10 % reducción y +12 % reflejo.', efecto: { vida: 265, reduccion: 0.10, reflejo: 0.12 } }
      ]
    },
    {
      id: 'ligera_S_1', armorLook: 22, rank: 'S', cls: 'ligera', nivel: 31, origin: 'clasico',
      cape: 'raven_phoenix_crimson', strapStyle: 'crossed_x',
      name: 'L2 Draconic Leather (Obsidiana & Runas de Fuego)', tex: 'draconic_crimson_gold',
      paleta: { primary: '#231f22', secondary: '#c98838', cloth: '#541214', glow: '#fb923c' },
      gear: { underlayer: 8, helmet: 4, torso: 11, gloves: 5, pants: 11, boots: 10 },
      diseno: 'Coraza de escamas de dragón en obsidiana, bronce y runas incandescentes con corona cornuda y capa.',
      habs: [
        { req: 1, id: 'l_s1_1', nombre: 'Sangre Dracónica', desc: '+8 % crítico y +6 % velocidad.', efecto: { critico: 0.08, velocidad: 0.06 } },
        { req: 3, id: 'l_s1_3', nombre: 'Aliento en Hojas', desc: '+16 % daño y +14 % velocidad de ataque.', efecto: { danio: 0.16, velocidadAtaque: 0.14 } },
        { req: 5, id: 'l_s1_5', nombre: 'Frenesí Dracónico', desc: '+15 % crítico, +12 % velocidad y -18 % recarga de esquiva.', efecto: { critico: 0.15, velocidad: 0.12, dodgeCdRed: 0.18 } }
      ]
    },
    {
      id: 'ligera_S_2', armorLook: 46, rank: 'S', cls: 'ligera', nivel: 35, origin: 'forja',
      sig: 'abyssal_leviathan', cape: 'raven_void_runic', strapStyle: 'parallel_buckled',
      name: 'FO Cazador de Leviatán Abisal', tex: 'forge_s_abyssal_leviathan',
      paleta: { primary: '#133e4b', secondary: '#d8e6f2', cloth: '#0d182b', glow: '#22d3ee' },
      gear: { underlayer: 19, helmet: 12, torso: 23, gloves: 9, pants: 13, boots: 10 },
      diseno: 'Aletas dorsales bioluminiscentes y colmillo de leviatán sobre escamas abisales turquesa y plata.',
      habs: [
        { req: 1, id: 'l_s2_1', nombre: 'Branquia Abisal', desc: '+8.5 % crítico y +7 % velocidad.', efecto: { critico: 0.085, velocidad: 0.07 } },
        { req: 3, id: 'l_s2_3', nombre: 'Arpón Bioluminiscente', desc: '+28 % daño a ralentizados y +15 % vel. ataque.', efecto: { multSlowBonus: 0.28, velocidadAtaque: 0.15 } },
        { req: 5, id: 'l_s2_5', nombre: 'Depredador de Fosa', desc: '+16 % crítico, +35 % veneno y -20 % recarga de esquiva.', efecto: { critico: 0.16, venenoMult: 0.35, dodgeCdRed: 0.20 } }
      ]
    },
    {
      id: 'ligera_S_3', armorLook: 80, rank: 'S', cls: 'ligera', nivel: 38, origin: 'mediobrazo',
      sig: 'mb_valkyrie', halfArm: 'valkyrie_scales', strapStyle: 'crossed_x',
      name: 'MB Valquiria de Escamas Aladas', tex: 'forge_mb_valkyrie_silver',
      paleta: { primary: '#d8dee8', secondary: '#d89b72', cloth: '#1f2b48', glow: '#38bdf8' },
      gear: { underlayer: 7, helmet: 12, torso: 23, gloves: 9, pants: 11, boots: 10 },
      diseno: 'Cascada de 12 escamas-pluma biseladas a medio brazo con brazalete abierto, oro rosa y zafiro.',
      habs: [
        { req: 1, id: 'l_s3_1', nombre: 'Pluma de Valquiria', desc: '+9 % crítico y +7 % velocidad.', efecto: { critico: 0.09, velocidad: 0.07 } },
        { req: 3, id: 'l_s3_3', nombre: 'Vuelo Rasante', desc: '+18 % daño y +16 % velocidad de ataque.', efecto: { danio: 0.18, velocidadAtaque: 0.16 } },
        { req: 5, id: 'l_s3_5', nombre: 'Éxtasis de Batalla', desc: '+17 % crítico, +12 % velocidad y -22 % recarga de esquiva.', efecto: { critico: 0.17, velocidad: 0.12, dodgeCdRed: 0.22 } }
      ]
    },
    {
      id: 'mago_S_1', armorLook: 23, rank: 'S', cls: 'mago', nivel: 31, origin: 'clasico',
      cape: 'raven_crimson_sovereign',
      name: 'L2 Major Arcana Robe (Terciopelo Carmesí & Oro)', tex: 'major_arcana_l2',
      paleta: { primary: '#590d1e', secondary: '#e4b24c', cloth: '#1f0814', glow: '#f43f5e' },
      gear: { underlayer: 20, helmet: 13, torso: 19, gloves: 10, pants: 12, boots: 12 },
      diseno: 'Túnica talar de terciopelo carmesí y filigrana de oro con capa soberana y escarpes celestiales.',
      habs: [
        { req: 1, id: 'm_s1_1', nombre: 'Sello Arcano Mayor', desc: '+125 maná máximo y +22 Poder Mágico.', efecto: { mana: 125, poderMagico: 22 } },
        { req: 3, id: 'm_s1_3', nombre: 'Llama Imperial', desc: '+28 % daño con fuego y +35 % regen de maná.', efecto: { fuegoMult: 0.28, mpRegenBonus: 0.35 } },
        { req: 5, id: 'm_s1_5', nombre: 'Apoteosis Arcana', desc: '+215 maná, +44 Poder Mágico y +18 % escudo arcano.', efecto: { mana: 215, poderMagico: 44, escudoBonusPct: 0.18 } }
      ]
    },
    {
      id: 'mago_S_2', armorLook: 47, rank: 'S', cls: 'mago', nivel: 35, origin: 'forja',
      sig: 'constellation_emperor', cape: 'raven_astral_cosmos',
      name: 'FO Soberano de las Constelaciones', tex: 'forge_s_constellation_emperor',
      paleta: { primary: '#111838', secondary: '#eac463', cloth: '#1d1445', glow: '#60a5fa' },
      gear: { underlayer: 20, helmet: 13, torso: 19, gloves: 10, pants: 12, boots: 12 },
      diseno: 'Esfera armilar giratoria de 3 anillos y estrellas flotantes sobre azul cosmos y oro astral.',
      habs: [
        { req: 1, id: 'm_s2_1', nombre: 'Órbita Estelar', desc: '+140 maná máximo y +24 Poder Mágico.', efecto: { mana: 140, poderMagico: 24 } },
        { req: 3, id: 'm_s2_3', nombre: 'Alineación Celestial', desc: '+11 % crítico mágico y +38 % regen de maná.', efecto: { critico: 0.11, mpRegenBonus: 0.38 } },
        { req: 5, id: 'm_s2_5', nombre: 'Trono del Firmamento', desc: '+235 maná, +48 Poder Mágico y +28 % daño con hielo.', efecto: { mana: 235, poderMagico: 48, hieloMult: 0.28 } }
      ]
    },
    {
      id: 'mago_S_3', armorLook: 58, rank: 'S', cls: 'mago', nivel: 38, origin: 'vanguardia',
      sig: 'vanguard_mage_ophanim', cape: 'raven_imperial_gold',
      name: 'VR Oráculo de los Ojos de Serafín (Ophanim)', tex: 'forge_v_ophanim_eyes',
      paleta: { primary: '#f4efe4', secondary: '#eab308', cloth: '#251a3b', glow: '#38bdf8' },
      gear: { underlayer: 20, helmet: 13, torso: 19, gloves: 10, pants: 12, boots: 12 },
      diseno: 'Ruedas bíblicas Ophanim giratorias con 12 ojos 3D y Ojo Omnisciente en marfil sacro y oro.',
      habs: [
        { req: 1, id: 'm_s3_1', nombre: 'Vigilia Ophanim', desc: '+155 maná máximo y +26 Poder Mágico.', efecto: { mana: 155, poderMagico: 26 } },
        { req: 3, id: 'm_s3_3', nombre: 'Mirada Omnisciente', desc: '+18 % daño mágico y +12 % crítico.', efecto: { danio: 0.18, critico: 0.12 } },
        { req: 5, id: 'm_s3_5', nombre: 'Coro de Serafines', desc: '+260 maná, +52 Poder Mágico y +20 % escudo arcano.', efecto: { mana: 260, poderMagico: 52, escudoBonusPct: 0.20 } }
      ]
    },

    // ==================== GRADO SR (Nv 40, 44, 48) ====================
    {
      id: 'pesada_SR_1', armorLook: 29, rank: 'SR', cls: 'pesada', nivel: 40, origin: 'clasico',
      cape: 'raven_crimson_sovereign',
      name: 'L2 Elegia Heavy (Obsidiana Imperial & Oro Fundido)', tex: 'elegia_l2',
      paleta: { primary: '#1b181f', secondary: '#eab308', cloth: '#4a0b15', glow: '#ff3b5c' },
      gear: { underlayer: 18, helmet: 11, torso: 18, gloves: 8, pants: 14, boots: 15 },
      diseno: 'Escudos dorsales anchos en obsidiana imperial, filigrana de oro fundido, rubíes y grebas dracónicas.',
      habs: [
        { req: 1, id: 'p_sr1_1', nombre: 'Sangre Elegia', desc: '+160 vida máxima y +5 % reducción.', efecto: { vida: 160, reduccion: 0.05 } },
        { req: 3, id: 'p_sr1_3', nombre: 'Soberanía Imperial', desc: '+12 % bloqueo, +34 % defensa y +16 % daño.', efecto: { bloqueo: 0.12, defensaPct: 0.34, danio: 0.16 } },
        { req: 5, id: 'p_sr1_5', nombre: 'Legado Inmortal', desc: '+320 vida máxima, +12 % reducción y +6 % robo de vida.', efecto: { vida: 320, reduccion: 0.12, robo: 0.06 } }
      ]
    },
    {
      id: 'pesada_SR_2', armorLook: 48, rank: 'SR', cls: 'pesada', nivel: 44, origin: 'forja',
      sig: 'black_sun_archon', cape: 'raven_imperial_gold',
      name: 'FO Arconte del Marfil & Sol Negro', tex: 'forge_sr_black_sun_archon',
      paleta: { primary: '#eeeae0', secondary: '#eab308', cloth: '#0e0c12', glow: '#ff5a1f' },
      gear: { underlayer: 18, helmet: 11, torso: 18, gloves: 8, pants: 14, boots: 15 },
      diseno: 'Corona de Sol Negro eclipsado y 8 alas-hoja catedralicias en marfil radiante y oro solar.',
      habs: [
        { req: 1, id: 'p_sr2_1', nombre: 'Resplandor del Eclipse', desc: '+175 vida máxima y +8 % reflejo.', efecto: { vida: 175, reflejo: 0.08 } },
        { req: 3, id: 'p_sr2_3', nombre: 'Ocho Alas Catedralicias', desc: '+36 % defensa y +32 % daño con fuego.', efecto: { defensaPct: 0.36, fuegoMult: 0.32 } },
        { req: 5, id: 'p_sr2_5', nombre: 'Arconte del Sol Negro', desc: '+350 vida máxima, +12 % reducción y +14 % reflejo.', efecto: { vida: 350, reduccion: 0.12, reflejo: 0.14 } }
      ]
    },
    {
      id: 'pesada_SR_3', armorLook: 93, rank: 'SR', cls: 'pesada', nivel: 48, origin: 'l2c',
      sig: 'l2c_heavy_crusader', halfArm: 'l2c_crusader_majestic', monolithBoot: 'mono_bastion',
      name: 'L2 Cruzado de Aden', tex: 'forge_l2c_crusader_gold',
      paleta: { primary: '#c9d1dc', secondary: '#e2b857', cloth: '#5e1620', glow: '#f43f5e' },
      gear: { underlayer: 16, helmet: 11, torso: 18, gloves: 8, pants: 14, boots: 15 },
      diseno: 'Hombrera barroca grande con guarda-cuello alado, 3 láminas en deltoides y bota alta de bastión.',
      habs: [
        { req: 1, id: 'p_sr3_1', nombre: 'Juramento de Aden', desc: '+190 vida máxima y +6 % reducción.', efecto: { vida: 190, reduccion: 0.06 } },
        { req: 3, id: 'p_sr3_3', nombre: 'Bastión del Trono', desc: '+14 % bloqueo y +38 % defensa.', efecto: { bloqueo: 0.14, defensaPct: 0.38 } },
        { req: 5, id: 'p_sr3_5', nombre: 'Campeón Supremo', desc: '+380 vida máxima, +14 % reducción y +20 % daño.', efecto: { vida: 380, reduccion: 0.14, danio: 0.20 } }
      ]
    },
    {
      id: 'ligera_SR_1', armorLook: 30, rank: 'SR', cls: 'ligera', nivel: 40, origin: 'clasico',
      cape: 'raven_astral_cosmos', strapStyle: 'parallel_buckled',
      name: 'L2 Vorpal Light (Platino Glacial & Amatista)', tex: 'vorpal_l2',
      paleta: { primary: '#cbd5e6', secondary: '#6b4c9a', cloth: '#1b1533', glow: '#c084fc' },
      gear: { underlayer: 7, helmet: 12, torso: 17, gloves: 9, pants: 14, boots: 16 },
      diseno: 'Coraza ceñida de 6 alas espinales y quilla saliente en platino glacial, amatista y capa astral.',
      habs: [
        { req: 1, id: 'l_sr1_1', nombre: 'Filo Vorpal', desc: '+10 % crítico y +8 % velocidad.', efecto: { critico: 0.10, velocidad: 0.08 } },
        { req: 3, id: 'l_sr1_3', nombre: 'Tormenta Glacial', desc: '+20 % daño y +18 % velocidad de ataque.', efecto: { danio: 0.20, velocidadAtaque: 0.18 } },
        { req: 5, id: 'l_sr1_5', nombre: 'Supremacía Vorpal', desc: '+19 % crítico, +14 % velocidad y -24 % recarga de esquiva.', efecto: { critico: 0.19, velocidad: 0.14, dodgeCdRed: 0.24 } }
      ]
    },
    {
      id: 'ligera_SR_2', armorLook: 49, rank: 'SR', cls: 'ligera', nivel: 44, origin: 'forja',
      sig: 'ethereal_blades', cape: 'raven_mithril_sylvan', strapStyle: 'crossed_x',
      name: 'FO Soberano de Espadas Etéreas', tex: 'forge_sr_ethereal_blades',
      paleta: { primary: '#d0e0f2', secondary: '#f0f8ff', cloth: '#1d293e', glow: '#38bdf8' },
      gear: { underlayer: 7, helmet: 12, torso: 17, gloves: 9, pants: 14, boots: 16 },
      diseno: '6 espadas de cristal prismático levitando en abanico dorsal sobre acero azulado y mithril.',
      habs: [
        { req: 1, id: 'l_sr2_1', nombre: 'Danza Prismática', desc: '+11 % crítico y +8 % vel. ataque.', efecto: { critico: 0.11, velocidadAtaque: 0.08 } },
        { req: 3, id: 'l_sr2_3', nombre: 'Seis Hojas Etéreas', desc: '+22 % daño y +5 % robo de vida.', efecto: { danio: 0.22, robo: 0.05 } },
        { req: 5, id: 'l_sr2_5', nombre: 'Soberano de Cristal', desc: '+20 % crítico, +15 % velocidad y -25 % recarga de esquiva.', efecto: { critico: 0.20, velocidad: 0.15, dodgeCdRed: 0.25 } }
      ]
    },
    {
      id: 'ligera_SR_3', armorLook: 96, rank: 'SR', cls: 'ligera', nivel: 48, origin: 'l2c',
      sig: 'l2c_light_draconic', halfArm: 'l2c_draconic_scale', monolithBoot: 'mono_escuadra', strapStyle: 'crossed_x',
      name: 'L2 Escama Dracónica', tex: 'forge_l2c_draconic_crimson',
      paleta: { primary: '#5a181c', secondary: '#d49a4c', cloth: '#241414', glow: '#f97316' },
      gear: { underlayer: 12, helmet: 12, torso: 17, gloves: 9, pants: 14, boots: 16 },
      diseno: 'Escamas de dragón 3D superpuestas sobre deltoides, cresta dorsal escarlata y atado cruzado en X.',
      habs: [
        { req: 1, id: 'l_sr3_1', nombre: 'Garra de Dragón', desc: '+12 % crítico y +9 % velocidad.', efecto: { critico: 0.12, velocidad: 0.09 } },
        { req: 3, id: 'l_sr3_3', nombre: 'Escama Escarlata', desc: '+24 % daño y +45 % daño de veneno.', efecto: { danio: 0.24, venenoMult: 0.45 } },
        { req: 5, id: 'l_sr3_5', nombre: 'Cazador de Dragones', desc: '+22 % crítico, +20 % vel. ataque y -26 % recarga de esquiva.', efecto: { critico: 0.22, velocidadAtaque: 0.20, dodgeCdRed: 0.26 } }
      ]
    },
    {
      id: 'mago_SR_1', armorLook: 32, rank: 'SR', cls: 'mago', nivel: 40, origin: 'clasico',
      cape: 'raven_astral_cosmos',
      name: 'L2 Vesper / Dynasty Robe (Archimago S84)', tex: 'dynasty_celestial_rose',
      paleta: { primary: '#f8fafc', secondary: '#f43f5e', cloth: '#064e3b', glow: '#f43f5e' },
      gear: { underlayer: 15, helmet: 13, torso: 24, gloves: 10, pants: 15, boots: 17 },
      diseno: 'Vestimenta real de terciopelo, seda nácar y oro rosa con diadema de eclipse y mangas catedralicias.',
      habs: [
        { req: 1, id: 'm_sr1_1', nombre: 'Corona S84', desc: '+175 maná máximo y +30 Poder Mágico.', efecto: { mana: 175, poderMagico: 30 } },
        { req: 3, id: 'm_sr1_3', nombre: 'Flujo Dinástico', desc: '+45 % regen de maná y +14 % crítico.', efecto: { mpRegenBonus: 0.45, critico: 0.14 } },
        { req: 5, id: 'm_sr1_5', nombre: 'Majestad Vesper', desc: '+290 maná, +60 Poder Mágico y +24 % escudo arcano.', efecto: { mana: 290, poderMagico: 60, escudoBonusPct: 0.24 } }
      ]
    },
    {
      id: 'mago_SR_2', armorLook: 50, rank: 'SR', cls: 'mago', nivel: 44, origin: 'forja',
      sig: 'obsidian_lotus', cape: 'raven_astral_cosmos',
      name: 'FO Serafín del Loto de Obsidiana', tex: 'forge_sr_obsidian_lotus',
      paleta: { primary: '#181320', secondary: '#f2bb3a', cloth: '#391458', glow: '#c084fc' },
      gear: { underlayer: 20, helmet: 13, torso: 24, gloves: 10, pants: 15, boots: 17 },
      diseno: 'Mandorla de Loto de Obsidiana de 10 pétalos y anillos rúnicos giratorios sobre brocado amatista.',
      habs: [
        { req: 1, id: 'm_sr2_1', nombre: 'Pétalo de Obsidiana', desc: '+190 maná máximo y +34 Poder Mágico.', efecto: { mana: 190, poderMagico: 34 } },
        { req: 3, id: 'm_sr2_3', nombre: 'Mandorla Rúnica', desc: '+32 % daño hielo/fuego y +48 % regen maná.', efecto: { fuegoMult: 0.32, hieloMult: 0.32, mpRegenBonus: 0.48 } },
        { req: 5, id: 'm_sr2_5', nombre: 'Loto Seráfico', desc: '+320 maná, +68 Poder Mágico y +26 % escudo arcano.', efecto: { mana: 320, poderMagico: 68, escudoBonusPct: 0.26 } }
      ]
    },
    {
      id: 'mago_SR_3', armorLook: 99, rank: 'SR', cls: 'mago', nivel: 48, origin: 'l2c',
      sig: 'l2c_mage_arcana', halfArm: 'l2c_arcana_seraph', monolithBoot: 'mono_portal',
      name: 'L2 Arcana Mayor', tex: 'forge_l2c_arcana_royal',
      paleta: { primary: '#4b1628', secondary: '#e8c05e', cloth: '#230d19', glow: '#fbbf24' },
      gear: { underlayer: 20, helmet: 13, torso: 24, gloves: 10, pants: 15, boots: 17 },
      diseno: 'Manto amplio de damasco burdeos y oro con volutas barrocas en deltoides, borla real y grebas de portal.',
      habs: [
        { req: 1, id: 'm_sr3_1', nombre: 'Voluta Suprema', desc: '+210 maná máximo y +38 Poder Mágico.', efecto: { mana: 210, poderMagico: 38 } },
        { req: 3, id: 'm_sr3_3', nombre: 'Damasco Arcano', desc: '+24 % daño mágico y +52 % regen de maná.', efecto: { danio: 0.24, mpRegenBonus: 0.52 } },
        { req: 5, id: 'm_sr3_5', nombre: 'Archimago de Aden', desc: '+350 maná, +75 Poder Mágico y +28 % escudo arcano.', efecto: { mana: 350, poderMagico: 75, escudoBonusPct: 0.28 } }
      ]
    }
  ];

  const SETS_ARMADURA = RAW_SETS.map(s => {
    const gInfo = GRADOS_INFO[s.rank] || GRADOS_INFO.D;
    const cInfo = CLASES_ARMADURA[s.cls] || CLASES_ARMADURA.pesada;
    const pantsIdx = s.gear.pants || 1;
    const subpiezas = SUBPIEZAS_POR_PANTS[pantsIdx] ? Object.assign({}, SUBPIEZAS_POR_PANTS[pantsIdx]) : null;
    if (s.cls === 'ligera' && subpiezas) subpiezas.cuisses = 0;
    if (s.cls === 'mago' && subpiezas) { subpiezas.tassets = 0; subpiezas.cuisses = 0; subpiezas.knees = 0; }
    return {
      id: s.id,
      armorLook: s.armorLook,
      grado: s.rank,
      gradoNombre: gInfo.nombre,
      claseArmadura: s.cls,
      claseNombre: cInfo.nombre,
      nivel: s.nivel,
      origin: s.origin || 'clasico',
      origenNombre: (ORIGENES_INFO[s.origin] && ORIGENES_INFO[s.origin].nombre) || 'Clásico',
      nombre: s.name,
      tex: s.tex,
      paleta: Object.assign({}, s.paleta),
      sig: s.sig || null,
      cape: s.cape || null,
      halfArm: s.halfArm || null,
      monolithBoot: s.monolithBoot || null,
      strapStyle: s.strapStyle || null,
      diseno: s.diseno,
      piezasMesh: Object.assign({}, s.gear, { subpiezas }),
      habilidades: s.habs.map(h => ({
        id: h.id,
        piezasReq: h.req,
        tipo: h.req === 1 ? 'Pasiva de Armadura' : (h.req === 3 ? 'Conjunto (3 pzas)' : 'Suprema (5 pzas)'),
        nombre: h.nombre,
        desc: h.desc,
        efecto: Object.assign({}, h.efecto)
      }))
    };
  });

  const SETS_BY_ID = Object.create(null);
  const SETS_BY_LOOK = Object.create(null);
  SETS_ARMADURA.forEach(s => {
    SETS_BY_ID[s.id] = s;
    if (SETS_BY_LOOK[s.armorLook] == null) SETS_BY_LOOK[s.armorLook] = s;
  });

  function setPorId(id) {
    return (id && SETS_BY_ID[id]) || null;
  }

  function setPorLook(armorLook) {
    return (armorLook != null && SETS_BY_LOOK[armorLook]) || null;
  }

  function setsPorClase(cls) {
    return SETS_ARMADURA.filter(s => s.claseArmadura === cls);
  }

  function setsPorGrado(grado) {
    return SETS_ARMADURA.filter(s => s.grado === grado);
  }

  function setsPorClaseYGrado(cls, grado) {
    return SETS_ARMADURA.filter(s => s.claseArmadura === cls && s.grado === grado);
  }

  function filtrarSets(filtros = {}) {
    const cls = filtros.claseArmadura && filtros.claseArmadura !== 'todas' ? filtros.claseArmadura : null;
    const g = filtros.grado && filtros.grado !== 'todos' ? filtros.grado : null;
    const q = filtros.texto ? String(filtros.texto).trim().toLowerCase() : '';
    return SETS_ARMADURA.filter(s => {
      if (cls && s.claseArmadura !== cls) return false;
      if (g && s.grado !== g) return false;
      if (q) {
        const hay = (s.nombre + ' ' + s.diseno + ' ' + s.origenNombre + ' ' + s.habilidades.map(h => h.nombre + ' ' + h.desc).join(' ')).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  // Calcula la defensa y los atributos propios de la clase de armadura y nivel/grado de una pieza
  function statsDePieza(pieza, estado = 1) {
    if (!pieza) return { defensa: 0, stats: {} };
    const nivel = Math.max(1, Number(pieza.nivel) || 1);
    const est = Math.max(0, Math.min(1, estado == null ? 1 : Number(estado)));
    const fEst = 0.5 + 0.5 * est;
    const grado = (pieza.grado && GRADOS_INFO[pieza.grado])
      ? pieza.grado
      : (nivel >= 40 ? 'SR' : nivel >= 31 ? 'S' : nivel >= 23 ? 'A' : nivel >= 15 ? 'B' : nivel >= 8 ? 'C' : 'D');
    const gMult = GRADOS_INFO[grado].mult;

    let tipo = Array.isArray(pieza.tipoArmadura) ? pieza.tipoArmadura[0] : pieza.tipoArmadura;
    if (!tipo && pieza.setId && SETS_BY_ID[pieza.setId]) tipo = SETS_BY_ID[pieza.setId].claseArmadura;
    if (!tipo || !CLASES_ARMADURA[tipo]) tipo = 'pesada';

    const defMult = CLASES_ARMADURA[tipo].defMult;
    const baseDef = (1 + 0.5 * nivel) * gMult * defMult;
    const defensa = Math.round(baseDef * fEst * 10) / 10;

    const peso = PESO_RANURA_SET[pieza.ranura] || 0.18;
    const factorNivel = (0.6 + nivel * 0.08) * gMult * fEst * peso * 5;
    const stats = {};

    if (tipo === 'pesada') {
      stats.vida = Math.max(2, Math.round((4 + 1.4 * nivel) * gMult * fEst * peso * 2.2));
      stats.reduccion = Math.round(Math.min(0.03, (0.002 + 0.0003 * nivel) * gMult * fEst * peso * 4.2) * 10000) / 10000;
      if (nivel >= 15) {
        stats.reflejo = Math.round(Math.min(0.025, 0.002 * gMult * fEst * peso * 4.0) * 10000) / 10000;
      }
    } else if (tipo === 'ligera') {
      stats.critico = Math.round(Math.min(0.035, (0.003 + 0.0004 * nivel) * gMult * fEst * peso * 4.2) * 10000) / 10000;
      stats.velocidad = Math.round(Math.min(0.035, (0.003 + 0.00035 * nivel) * gMult * fEst * peso * 4.0) * 10000) / 10000;
      stats.velocidadAtaque = Math.round(Math.min(0.04, (0.003 + 0.00045 * nivel) * gMult * fEst * peso * 4.0) * 10000) / 10000;
      if (nivel >= 12) {
        stats.dodgeCdRed = Math.round(Math.min(0.035, 0.0035 * gMult * fEst * peso * 4.0) * 10000) / 10000;
      }
    } else if (tipo === 'mago') {
      stats.mana = Math.max(3, Math.round((5 + 1.6 * nivel) * gMult * fEst * peso * 2.4));
      stats.poderMagico = Math.round((0.6 + 0.28 * nivel) * gMult * fEst * peso * 4.2 * 10) / 10;
      stats.mpRegenBonus = Math.round(Math.min(0.10, (0.006 + 0.0008 * nivel) * gMult * fEst * peso * 4.0) * 1000) / 1000;
      if (nivel >= 15) {
        stats.escudoBonusPct = Math.round(Math.min(0.04, 0.004 * factorNivel) * 10000) / 10000;
      }
    }

    return { defensa, stats, claseArmadura: tipo, grado };
  }

  function piezasDeSet(setId) {
    const s = setPorId(setId);
    if (!s) return [];
    const nomSlots = NOMBRES_RANURA_CLASE[s.claseArmadura] || NOMBRES_RANURA_SET;
    const corto = s.nombre.replace(/\s*\([^)]*\)/g, '').trim();
    return RANURAS_SET.map(r => {
      const id = (r === 'torso' && s.id === 'pesada_D_1') ? 'torso.1'
        : (r === 'torso' && s.id === 'ligera_D_1') ? 'torso.2'
        : (r === 'torso' && s.id === 'mago_D_1') ? 'torso.21'
        : `set.${s.id}.${r}`;
      const idx = (r === 'torso' && s.id === 'pesada_D_1') ? 1
        : (r === 'torso' && s.id === 'ligera_D_1') ? 2
        : (r === 'torso' && s.id === 'mago_D_1') ? 21
        : (s.piezasMesh[r] || 1);
      const pieza = {
        id,
        ranura: r,
        idx,
        nombre: `${nomSlots[r] || NOMBRES_RANURA_SET[r]} · ${corto}`,
        nivel: s.nivel,
        grado: s.grado,
        tipoArmadura: s.claseArmadura,
        armorLook: s.armorLook,
        setId: s.id,
        setNombre: s.nombre,
        archivo: null
      };
      if (r === 'pants' && s.piezasMesh.subpiezas) {
        pieza.subpiezas = Object.assign({}, s.piezasMesh.subpiezas);
      }
      return pieza;
    });
  }

  function statsCompletosSet(setId, estado = 1) {
    const s = setPorId(setId);
    if (!s) return null;
    const piezas = piezasDeSet(setId);
    let defensaTotal = 0;
    const sumaPiezas = {};
    piezas.forEach(p => {
      const st = statsDePieza(p, estado);
      defensaTotal += st.defensa;
      Object.keys(st.stats).forEach(k => {
        sumaPiezas[k] = (sumaPiezas[k] || 0) + st.stats[k];
      });
    });
    const bonosHab = {};
    s.habilidades.forEach(h => {
      Object.keys(h.efecto).forEach(k => {
        bonosHab[k] = (bonosHab[k] || 0) + h.efecto[k];
      });
    });
    const defConHab = Math.round(defensaTotal * (1 + (bonosHab.defensaPct || 0)) * 10) / 10;
    return {
      set: s,
      defensaPiezas: Math.round(defensaTotal * 10) / 10,
      defensaTotal: defConHab,
      statsPiezas: sumaPiezas,
      bonosHabilidades: bonosHab
    };
  }

  function bonosDeConjuntos(equipados) {
    const conteo = Object.create(null);
    const lista = Array.isArray(equipados) ? equipados : [];
    const ranurasVistas = Object.create(null);
    lista.forEach(obj => {
      if (!obj || obj.ranura === 'weapon' || obj.ranura === 'shield') return;
      if (!RANURAS_SET.includes(obj.ranura)) return;
      let sid = obj.setId;
      if (!sid && obj.armorLook != null && SETS_BY_LOOK[obj.armorLook]) {
        sid = SETS_BY_LOOK[obj.armorLook].id;
      }
      if (!sid || !SETS_BY_ID[sid]) return;
      if (!ranurasVistas[sid]) ranurasVistas[sid] = new Set();
      if (ranurasVistas[sid].has(obj.ranura)) return;
      ranurasVistas[sid].add(obj.ranura);
      conteo[sid] = (conteo[sid] || 0) + 1;
    });

    const totales = {
      vida: 0, mana: 0, poderMagico: 0, defensaPct: 0, reduccion: 0, bloqueo: 0, reflejo: 0,
      critico: 0, danio: 0, velocidad: 0, velocidadAtaque: 0, robo: 0,
      mpRegenBonus: 0, dodgeCdRed: 0, escudoBonusPct: 0,
      fuegoMult: 0, hieloMult: 0, venenoMult: 0, multSlowBonus: 0
    };
    const sets = [];
    const habilidadesActivas = [];

    Object.keys(conteo).forEach(sid => {
      const s = SETS_BY_ID[sid];
      const n = conteo[sid];
      const activas = s.habilidades.filter(h => n >= h.piezasReq);
      const pendientes = s.habilidades.filter(h => n < h.piezasReq);
      activas.forEach(h => {
        habilidadesActivas.push(Object.assign({ setId: sid, setNombre: s.nombre }, h));
        Object.keys(h.efecto).forEach(k => {
          if (Object.prototype.hasOwnProperty.call(totales, k)) {
            totales[k] += Number(h.efecto[k]) || 0;
          }
        });
      });
      sets.push({ set: s, equipadas: n, total: 5, habilidadesActivas: activas, habilidadesPendientes: pendientes });
    });

    sets.sort((a, b) => b.equipadas - a.equipadas || b.set.nivel - a.set.nivel);
    totales.mpRegenMult = 1 + totales.mpRegenBonus;
    totales.dodgeCdMult = Math.max(0.5, 1 - totales.dodgeCdRed);

    return { sets, totales, habilidadesActivas };
  }

  function efectoTexto(efecto) {
    if (!efecto || typeof efecto !== 'object') return '';
    const pct = v => Math.round(v * 100) + ' %';
    const num1 = v => Math.round(v * 10) / 10;
    const frases = {
      vida: v => '+' + Math.round(v) + ' vida máxima',
      mana: v => '+' + Math.round(v) + ' maná máximo',
      poderMagico: v => '+' + num1(v) + ' Poder Mágico',
      defensa: v => '+' + pct(v) + ' de defensa',
      defensaPct: v => '+' + pct(v) + ' de defensa',
      reduccion: v => '+' + pct(v) + ' reducción de daño',
      bloqueo: v => '+' + pct(v) + ' bloqueo',
      reflejo: v => 'devuelve ' + pct(v) + ' del daño',
      critico: v => '+' + pct(v) + ' crítico',
      danio: v => '+' + pct(v) + ' de daño',
      velocidad: v => '+' + pct(v) + ' velocidad',
      velocidadAtaque: v => '+' + pct(v) + ' vel. ataque',
      robo: v => 'roba ' + pct(v) + ' como vida',
      mpRegenBonus: v => '+' + pct(v) + ' regen de maná',
      dodgeCdRed: v => '-' + pct(v) + ' recarga de esquiva',
      escudoBonusPct: v => '+' + pct(v) + ' escudo arcano',
      fuegoMult: v => '+' + pct(v) + ' daño de fuego',
      hieloMult: v => '+' + pct(v) + ' daño de hielo',
      venenoMult: v => '+' + pct(v) + ' daño de veneno',
      multSlowBonus: v => '+' + pct(v) + ' daño a ralentizados'
    };
    return Object.keys(efecto)
      .filter(k => frases[k] && efecto[k])
      .map(k => frases[k](efecto[k]))
      .join(', ');
  }

  // Ilustración SVG diferenciada por silueta de armadura (pesada, ligera, mago) y paleta PBR real del set
  function disenoSvgHtml(set, opts = {}) {
    if (!set) return '';
    const size = opts.size || 78;
    const p = set.paleta || {};
    const prim = p.primary || '#64748b';
    const sec = p.secondary || '#f59e0b';
    const cloth = p.cloth || '#1e293b';
    const glow = p.glow || sec;
    const gInfo = GRADOS_INFO[set.grado] || GRADOS_INFO.D;
    const uid = String(set.id || 'arm').replace(/[^a-zA-Z0-9_-]/g, '');

    let adornos = '';
    if (set.cape && set.cape !== 'none') {
      adornos += `<path d="M22 25 L14 86 L50 82 L86 86 L78 25 Z" fill="${cloth}" opacity="0.72" stroke="${sec}" stroke-width="1"/>`;
    }
    if (set.sig && /ophanim|constellation|eclipse|stained_glass|obsidian_lotus|alabaster_phoenix|ethereal_blades/.test(set.sig)) {
      adornos += `<circle cx="50" cy="24" r="19" fill="none" stroke="${glow}" stroke-width="1.3" stroke-dasharray="3,2.5" opacity="0.85"/>`;
      adornos += `<circle cx="50" cy="24" r="14" fill="none" stroke="${sec}" stroke-width="0.9" opacity="0.75"/>`;
    }

    let cuerpo = '';
    if (set.claseArmadura === 'pesada') {
      cuerpo = `
        <!-- Yelmo de placas -->
        <path d="M40 12 C40 6, 60 6, 60 12 L61 23 C57 27, 43 27, 39 23 Z" fill="${prim}" stroke="${sec}" stroke-width="1.5"/>
        <path d="M43 16 L57 16 L55 19 L45 19 Z" fill="#090d16"/>
        <path d="M48 7 L50 3 L52 7" fill="${sec}"/>
        <!-- Hombreras pesadas -->
        <path d="M18 32 C18 22, 34 22, 37 29 L35 42 C25 43, 18 39, 18 32 Z" fill="${prim}" stroke="${sec}" stroke-width="1.5"/>
        <path d="M82 32 C82 22, 66 22, 63 29 L65 42 C75 43, 82 39, 82 32 Z" fill="${prim}" stroke="${sec}" stroke-width="1.5"/>
        <path d="M21 31 Q28 27 35 31" fill="none" stroke="${glow}" stroke-width="1.2"/>
        <path d="M65 31 Q72 27 79 31" fill="none" stroke="${glow}" stroke-width="1.2"/>
        <!-- Peto y escarcelas -->
        <path d="M35 28 L65 28 L62 56 L38 56 Z" fill="${prim}" stroke="${sec}" stroke-width="1.5"/>
        <path d="M41 34 L50 42 L59 34" fill="none" stroke="${sec}" stroke-width="1.4"/>
        <circle cx="50" cy="39" r="2.6" fill="${glow}"/>
        <rect x="36" y="55" width="28" height="6" rx="1.5" fill="${cloth}" stroke="${sec}" stroke-width="1.2"/>
        <path d="M36 61 L48 61 L46 82 L33 78 Z" fill="${prim}" stroke="${sec}" stroke-width="1.3"/>
        <path d="M52 61 L64 61 L67 78 L54 82 Z" fill="${prim}" stroke="${sec}" stroke-width="1.3"/>
        <path d="M36 81 L46 81 L45 92 L35 92 Z" fill="${prim}" stroke="${sec}" stroke-width="1.2"/>
        <path d="M54 81 L64 81 L65 92 L55 92 Z" fill="${prim}" stroke="${sec}" stroke-width="1.2"/>
      `;
    } else if (set.claseArmadura === 'ligera') {
      cuerpo = `
        <!-- Visera / Capucha ágil -->
        <path d="M41 13 C41 7, 59 7, 59 13 L59 22 C54 26, 46 26, 41 22 Z" fill="${cloth}" stroke="${sec}" stroke-width="1.4"/>
        <path d="M42 15 L50 11 L58 15" fill="none" stroke="${glow}" stroke-width="1.3"/>
        <!-- Hombreras compactas asimétricas -->
        <path d="M24 31 C24 25, 36 25, 38 30 L36 38 C29 39, 24 36, 24 31 Z" fill="${prim}" stroke="${sec}" stroke-width="1.3"/>
        <path d="M76 31 C76 25, 64 25, 62 30 L64 38 C71 39, 76 36, 76 31 Z" fill="${prim}" stroke="${sec}" stroke-width="1.3"/>
        <!-- Peto ceñido + tirantes en X -->
        <path d="M37 28 L63 28 L59 55 L41 55 Z" fill="${prim}" stroke="${sec}" stroke-width="1.4"/>
        <line x1="39" y1="29" x2="60" y2="53" stroke="${sec}" stroke-width="1.8"/>
        <line x1="61" y1="29" x2="40" y2="53" stroke="${sec}" stroke-width="1.8"/>
        <circle cx="50" cy="41" r="2.3" fill="${glow}"/>
        <!-- Cinturón y musleras despejadas -->
        <rect x="39" y="54" width="22" height="5" rx="1.5" fill="${cloth}" stroke="${sec}" stroke-width="1.2"/>
        <path d="M39 59 L47 59 L45 79 L36 76 Z" fill="${prim}" stroke="${sec}" stroke-width="1.2"/>
        <path d="M53 59 L61 59 L64 76 L55 79 Z" fill="${prim}" stroke="${sec}" stroke-width="1.2"/>
        <path d="M37 80 L45 80 L44 92 L36 92 Z" fill="${cloth}" stroke="${sec}" stroke-width="1.2"/>
        <path d="M55 80 L63 80 L64 92 L56 92 Z" fill="${cloth}" stroke="${sec}" stroke-width="1.2"/>
      `;
    } else {
      cuerpo = `
        <!-- Tiara / Diadema arcana -->
        <path d="M40 16 L45 8 L50 13 L55 8 L60 16 L57 22 L43 22 Z" fill="${sec}" stroke="${glow}" stroke-width="1.1"/>
        <circle cx="50" cy="14" r="2.2" fill="${glow}"/>
        <!-- Hombros ligeros + cuello alzado -->
        <path d="M32 25 L41 28 L41 34 L27 35 Z" fill="${sec}" opacity="0.9"/>
        <path d="M68 25 L59 28 L59 34 L73 35 Z" fill="${sec}" opacity="0.9"/>
        <!-- Túnica talar larga y estola -->
        <path d="M37 28 L63 28 L66 56 L72 90 L28 90 L34 56 Z" fill="${prim}" stroke="${sec}" stroke-width="1.5"/>
        <path d="M45 29 L55 29 L57 88 L43 88 Z" fill="${cloth}" opacity="0.92"/>
        <path d="M45 29 L45 88 M55 29 L55 88" stroke="${sec}" stroke-width="1.1"/>
        <rect x="35" y="53" width="30" height="4.5" rx="1.5" fill="${sec}"/>
        <circle cx="50" cy="41" r="3" fill="${glow}"/>
        <circle cx="50" cy="55" r="2.2" fill="${glow}"/>
      `;
    }

    return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true" style="display:block;flex:none;border-radius:10px;background:radial-gradient(circle at 50% 35%, ${glow}33, #090d16 74%);border:1.5px solid ${gInfo.borde};box-shadow:0 0 12px ${glow}26">
      <defs>
        <linearGradient id="g-${uid}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${prim}" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="${cloth}" stop-opacity="0.65"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="96" height="96" rx="8" fill="url(#g-${uid})" opacity="0.45"/>
      ${adornos}
      ${cuerpo}
      <text x="90" y="15" text-anchor="end" font-family="system-ui,sans-serif" font-size="10" font-weight="800" fill="${gInfo.color}">${set.grado}</text>
    </svg>`;
  }

  const api = {
    GRADOS_ORDEN,
    GRADOS_INFO,
    RANURAS_SET,
    NOMBRES_RANURA_SET,
    NOMBRES_RANURA_CLASE,
    PESO_RANURA_SET,
    SUBPIEZAS_POR_PANTS,
    ORIGENES_INFO,
    CLASES_ARMADURA,
    SETS_ARMADURA,
    setPorId,
    setPorLook,
    setsPorClase,
    setsPorGrado,
    setsPorClaseYGrado,
    filtrarSets,
    statsDePieza,
    piezasDeSet,
    statsCompletosSet,
    bonosDeConjuntos,
    efectoTexto,
    disenoSvgHtml
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ArmadurasLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
