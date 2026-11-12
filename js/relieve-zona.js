/*
 * relieve-zona.js — Sistema de Laberinto de Zona para Zonas de Caza.
 * Genera un laberinto real navegable dentro de la zona con muros sólidos, pasillos,
 * bifurcaciones, recovecos (callejones sin salida) y un punto final de culminación
 * (oasis escondido, jefe supremo, objeto de misión / reliquia, santuario o tesoro).
 * Compatible con Node.js (pruebas) y navegador (window.RelieveZonaLib).
 */
(function (root) {
  'use strict';

  const clamp01 = v => Math.max(0, Math.min(1, v));
  const smooth = (a, b, x) => {
    if (a >= b) return x >= b ? 1 : 0;
    const t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  };

  const ESTILOS = {
    roca_canion: {
      id: 'roca_canion',
      nombre: 'Cañón de Roca (Desfiladeros)',
      colorPared: [0.35, 0.32, 0.28],
      colorTop: [0.46, 0.43, 0.39],
      hex: '#78716c',
      desc: 'Altas paredes de roca natural escarpada formando estrechos desfiladeros.'
    },
    piedra_ruinas: {
      id: 'piedra_ruinas',
      nombre: 'Muros de Piedra Ancestral',
      colorPared: [0.28, 0.30, 0.34],
      colorTop: [0.40, 0.42, 0.46],
      hex: '#64748b',
      desc: 'Muros de sillería de piedra antigua con ruinas y bloques desgastados.'
    },
    laberinto_setos: {
      id: 'laberinto_setos',
      nombre: 'Setos Oscuros y Riscos',
      colorPared: [0.16, 0.26, 0.15],
      colorTop: [0.24, 0.36, 0.22],
      hex: '#15803d',
      desc: 'Muros densos de vegetación salvaje entrelazados con formaciones rocosas.'
    },
    arenisca_desierto: {
      id: 'arenisca_desierto',
      nombre: 'Arenisca & Cañón Dorado',
      colorPared: [0.55, 0.42, 0.26],
      colorTop: [0.65, 0.52, 0.35],
      hex: '#d97706',
      desc: 'Bloques de arenisca erosionada y desfiladeros de tonos cálidos desérticos.'
    },
    obsidiana_volcanica: {
      id: 'obsidiana_volcanica',
      nombre: 'Catacumbas de Obsidiana',
      colorPared: [0.15, 0.12, 0.22],
      colorTop: [0.28, 0.20, 0.38],
      hex: '#581c87',
      desc: 'Roca volcánica negra y obsidiana con reflejos oscuros y ceniza.'
    },
    hielo_glacial: {
      id: 'hielo_glacial',
      nombre: 'Hielo Glacial & Fisuras',
      colorPared: [0.25, 0.45, 0.60],
      colorTop: [0.65, 0.82, 0.95],
      hex: '#38bdf8',
      desc: 'Paredes de hielo compacto y escarcha cristalina entre grietas glaciares.'
    },
    mamposteria_castillo: {
      id: 'mamposteria_castillo',
      nombre: 'Mampostería y Bastiones',
      colorPared: [0.38, 0.36, 0.35],
      colorTop: [0.52, 0.50, 0.48],
      hex: '#71717a',
      desc: 'Muros de fortaleza medieval con sillares de piedra labrada y almenas.'
    }
  };

  const CULMINACIONES = {
    oasis: {
      id: 'oasis',
      nombre: 'Oasis Escondido',
      icono: '🌴',
      badge: '🌴',
      desc: 'Manantial de aguas cristalinas rodeado de palmeras y remanso en el centro.'
    },
    jefe: {
      id: 'jefe',
      nombre: 'Arena de Jefe Especial',
      icono: '💀',
      badge: '💀',
      desc: 'Plataforma ceremonial con pebeteros de fuego y un jefe supremo aguardando.'
    },
    objeto_mision: {
      id: 'objeto_mision',
      nombre: 'Objeto de Misión (Reliquia)',
      icono: '🔮',
      badge: '🔮',
      desc: 'Pedestal ancestral con una reliquia mística flotante interactuable [E].'
    },
    santuario: {
      id: 'santuario',
      nombre: 'Santuario Rúnico',
      icono: '🏛️',
      badge: '🏛️',
      desc: 'Círculo de monolitos rúnicos que bendice y restaura completamente al héroe [E].'
    },
    tesoro: {
      id: 'tesoro',
      nombre: 'Cofre del Tesoro Legendario',
      icono: '💎',
      badge: '💎',
      desc: 'Cofre dorado sellado con botín legendario, gemas y gran tesoro [E].'
    }
  };

  /**
   * Paleta predeterminada de patrones de monstruos con colores para sectores y celdas
   */
  const PATRONES_MONSTRUOS_DEFECTO = {
    p1: { id: 'p1', color: '#22c55e', name: 'Guerrero Esqueleto', clase: 'guerrero', levelMin: 8, levelMax: 12, count: 1, icono: '⚔️' },
    p2: { id: 'p2', color: '#3b82f6', name: 'Mago de Hielo', clase: 'mago', levelMin: 12, levelMax: 16, count: 1, icono: '🔮' },
    p3: { id: 'p3', color: '#ef4444', name: 'Arquero Orco', clase: 'arquero', levelMin: 14, levelMax: 18, count: 1, icono: '🏹' },
    p4: { id: 'p4', color: '#a855f7', name: 'Señor Oscuro Élite', clase: 'elite', levelMin: 22, levelMax: 26, count: 1, icono: '👑' },
    p5: { id: 'p5', color: '#f97316', name: 'Berserker Salvaje', clase: 'guerrero', levelMin: 18, levelMax: 22, count: 2, icono: '🪓' },
    p6: { id: 'p6', color: '#eab308', name: 'Enjambre de Alimañas', clase: 'rapido', levelMin: 6, levelMax: 9, count: 3, icono: '🦂' }
  };

  function configPorDefecto(estilo, culminacion) {
    return {
      activo: true,
      estilo: estilo || 'roca_canion',
      culminacion: culminacion || 'oasis',
      complejidad: 'medio',
      tamGrid: 11,
      alturaMuro: 14,
      profundidadHendidura: 3.5,
      anchoPasillo: 10,
      seed: 12345 + Math.floor(Math.random() * 80000),
      patronesMonstruos: { ...PATRONES_MONSTRUOS_DEFECTO },
      celdasMonstruos: {}
    };
  }

  function zonaTieneLaberinto(z) {
    return !!(z && z.relieve && (z.relieve.activo !== false));
  }

  /**
   * Genera la cuadrícula del laberinto (0 = camino, 1 = muro, 2 = exterior fuera del círculo).
   * Usa algoritmo DFS con backtracking determinista para garantizar pasillos continuos,
   * recovecos y acceso garantizado desde la entrada perimetral hasta la explanada central.
   */
  function generarLaberinto(tamGrid, seed, opciones = {}) {
    const N = Math.max(7, Math.min(31, tamGrid % 2 === 0 ? tamGrid + 1 : tamGrid));
    const grid = Array.from({ length: N }, () => Array(N).fill(1));
    const mid = (N - 1) / 2;
    const radCells = mid - 0.4;
    const bucleChance = typeof opciones.bucleChance === 'number' ? opciones.bucleChance : 0;
    const murosManuales = opciones.murosManuales || null;

    // Soporte para múltiples entradas o entrada individual
    let listaDirs = [];
    if (Array.isArray(opciones.entradas) && opciones.entradas.length) {
      listaDirs = [...opciones.entradas];
    } else if (opciones.entradaDir) {
      listaDirs = [opciones.entradaDir];
    } else {
      listaDirs = ['sur'];
    }

    let s = (seed || 12345) >>> 0;
    function rnd() {
      s = (s * 1664525 + 1013904223) >>> 0;
      return (s >>> 0) / 4294967296;
    }

    // 1. Celdas exteriores a la circunferencia de la zona
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (Math.hypot(x - mid, y - mid) > radCells + 0.3) {
          grid[y][x] = 2; // Fuera de la zona
        }
      }
    }

    // 2. Explanada / sala central (cámara de culminación)
    const m = Math.round(mid);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        grid[m + dy][m + dx] = 0;
      }
    }

    // 3. Talla del laberinto por backtracking (DFS)
    const stack = [];
    const DIRS = [
      [0, -2],
      [0, 2],
      [-2, 0],
      [2, 0]
    ];

    const startX = m;
    const startY = m - 2 >= 1 ? m - 2 : 1;
    grid[startY][startX] = 0;
    stack.push([startX, startY]);

    while (stack.length > 0) {
      const [cx, cy] = stack[stack.length - 1];
      const neighbors = [];
      for (const [dx, dy] of DIRS) {
        const nx = cx + dx,
          ny = cy + dy;
        if (nx >= 1 && nx < N - 1 && ny >= 1 && ny < N - 1) {
          const dCenter = Math.hypot(nx - mid, ny - mid);
          const inCenter = Math.abs(nx - mid) <= 1.1 && Math.abs(ny - mid) <= 1.1;
          if (!inCenter && dCenter < radCells && grid[ny][nx] === 1) {
            neighbors.push([nx, ny, dx, dy]);
          }
        }
      }
      if (neighbors.length > 0) {
        const idx = Math.floor(rnd() * neighbors.length);
        const [nx, ny, dx, dy] = neighbors[idx];
        grid[cy + dy / 2][cx + dx / 2] = 0;
        grid[ny][nx] = 0;
        stack.push([nx, ny]);
      } else {
        stack.pop();
      }
    }

    // 3b. Bucles y atajos tácticos opcionales
    if (bucleChance > 0) {
      for (let y = 1; y < N - 1; y++) {
        for (let x = 1; x < N - 1; x++) {
          if (grid[y][x] === 1 && Math.hypot(x - mid, y - mid) < radCells - 0.5) {
            const hConn = (grid[y][x - 1] === 0 && grid[y][x + 1] === 0);
            const vConn = (grid[y - 1] && grid[y - 1][x] === 0 && grid[y + 1] && grid[y + 1][x] === 0);
            if ((hConn || vConn) && rnd() < bucleChance) {
              grid[y][x] = 0;
            }
          }
        }
      }
    }

    // 4. Conexión de la explanada central con los corredores del laberinto
    grid[m - 1][m] = 0;
    grid[m + 1][m] = 0;
    grid[m][m - 1] = 0;
    grid[m][m + 1] = 0;

    // 5. Entradas del laberinto según direcciones configuradas
    const entradas = [];
    listaDirs.forEach(dir => {
      let ent = null;
      if (dir === 'norte') {
        let ey = 0;
        while (ey < m - 1 && (grid[ey][m] === 2 || grid[ey][m] === 1)) {
          grid[ey][m] = 0;
          if (grid[ey + 1] && grid[ey + 1][m] === 0) break;
          ey++;
        }
        ent = { dir: 'norte', gx: m, gy: 0 };
      } else if (dir === 'este') {
        let ex = N - 1;
        while (ex > m + 1 && (grid[m][ex] === 2 || grid[m][ex] === 1)) {
          grid[m][ex] = 0;
          if (grid[m][ex - 1] === 0) break;
          ex--;
        }
        ent = { dir: 'este', gx: N - 1, gy: m };
      } else if (dir === 'oeste') {
        let ex = 0;
        while (ex < m - 1 && (grid[m][ex] === 2 || grid[m][ex] === 1)) {
          grid[m][ex] = 0;
          if (grid[m][ex + 1] === 0) break;
          ex++;
        }
        ent = { dir: 'oeste', gx: 0, gy: m };
      } else {
        // 'sur' por defecto
        let ey = N - 1;
        while (ey > m + 1 && (grid[ey][m] === 2 || grid[ey][m] === 1)) {
          grid[ey][m] = 0;
          if (grid[ey - 1] && grid[ey - 1][m] === 0) break;
          ey--;
        }
        ent = { dir: 'sur', gx: m, gy: N - 1 };
      }
      if (ent) entradas.push(ent);
    });

    if (entradas.length === 0) {
      entradas.push({ dir: 'sur', gx: m, gy: N - 1 });
    }
    const entradaPrincipal = entradas[0];

    // 6. Aplicar modificaciones manuales si existen (desde el editor interactivo)
    if (murosManuales && typeof murosManuales === 'object') {
      Object.keys(murosManuales).forEach(k => {
        const parts = k.split('_');
        if (parts.length === 2) {
          const gx = parseInt(parts[0], 10);
          const gy = parseInt(parts[1], 10);
          if (gx >= 0 && gx < N && gy >= 0 && gy < N && grid[gy][gx] !== 2) {
            grid[gy][gx] = murosManuales[k] ? 1 : 0;
          }
        }
      });
      // Asegurar explanada central siempre abierta
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          grid[m + dy][m + dx] = 0;
        }
      }
      entradas.forEach(ent => {
        grid[ent.gy][ent.gx] = 0;
      });
    }

    // 7. Verificación de camino continuo desde cada entrada hasta el centro mediante BFS
    entradas.forEach(ent => {
      const visitados = Array.from({ length: N }, () => Array(N).fill(false));
      const queue = [[ent.gx, ent.gy]];
      visitados[ent.gy][ent.gx] = true;
      let llegaAlCentro = false;
      const D1 = [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0]
      ];
      while (queue.length > 0) {
        const [qx, qy] = queue.shift();
        if (Math.abs(qx - m) <= 1 && Math.abs(qy - m) <= 1) {
          llegaAlCentro = true;
          break;
        }
        for (const [dx, dy] of D1) {
          const nx = qx + dx,
            ny = qy + dy;
          if (nx >= 0 && nx < N && ny >= 0 && ny < N && !visitados[ny][nx] && grid[ny][nx] === 0) {
            visitados[ny][nx] = true;
            queue.push([nx, ny]);
          }
        }
      }

      // Si no llega al centro, forzar apertura directa desde esa entrada
      if (!llegaAlCentro) {
        if (ent.dir === 'sur') {
          for (let y = N - 1; y >= m; y--) grid[y][m] = 0;
        } else if (ent.dir === 'norte') {
          for (let y = 0; y <= m; y++) grid[y][m] = 0;
        } else if (ent.dir === 'este') {
          for (let x = N - 1; x >= m; x--) grid[m][x] = 0;
        } else {
          for (let x = 0; x <= m; x++) grid[m][x] = 0;
        }
      }
    });

    return { N, grid, entradas, entrada: entradaPrincipal, centro: { gx: m, gy: m } };
  }

  /**
   * Obtiene o genera la estructura completa del laberinto para una zona,
   * incluyendo coordenadas del mundo, colisionadores de muros y datos de meta.
   */
  function obtenerDatosLaberinto(zona) {
    if (!zonaTieneLaberinto(zona)) return null;

    const r = zona.relieve || {};
    // Radio del laberinto: usa el radio específico del laberinto o se sincroniza con el radio total de la zona
    const R = (r && typeof r.radio === 'number' && r.radio > 0)
      ? r.radio
      : Math.max(60, zona.radius || 100);

    // Ajuste adaptativo de celdas para mantener pasillos en escala de aventura humana (~12 a 16 metros)
    const celdaDeseada = 14;
    const nAuto = Math.max(9, Math.min(27, Math.round((2 * R) / celdaDeseada) | 1));
    const tamGrid = r.tamGrid || (r.complejidad === 'simple' ? 9 : r.complejidad === 'complejo' ? 17 : nAuto);
    const seed = typeof r.seed === 'number' ? r.seed : 12345;
    const alturaMuro = typeof r.alturaMuro === 'number' ? r.alturaMuro : typeof r.profundidad === 'number' ? r.profundidad : 14;
    const estilo = r.estilo || r.tipo || 'roca_canion';
    const culminacion = r.culminacion || 'oasis';
    const bucleChance = typeof r.bucleChance === 'number' ? r.bucleChance : 0.08;
    const rotacion = typeof r.rotacion === 'number' ? r.rotacion : 0;
    const entradasCfg = Array.isArray(r.entradas) && r.entradas.length ? r.entradas : (r.entradaDir ? [r.entradaDir] : ['sur']);
    const entradaDir = entradasCfg[0] || 'sur';
    const manualesKey = r.murosManuales ? JSON.stringify(r.murosManuales) : '';
    const monKey = r.celdasMonstruos ? JSON.stringify(r.celdasMonstruos) : '';
    const patKey = r.patronesMonstruos ? JSON.stringify(r.patronesMonstruos) : '';

    const cacheKey = `${zona.id}_${zona.x}_${zona.y}_${R}_${tamGrid}_${seed}_${alturaMuro}_${estilo}_${culminacion}_${bucleChance}_${rotacion}_${entradasCfg.join(',')}_${manualesKey}_${monKey}_${patKey}`;
    if (zona._cacheLaberinto && zona._cacheLaberintoKey === cacheKey) {
      return zona._cacheLaberinto;
    }

    const { N, grid, entradas, entrada, centro } = generarLaberinto(tamGrid, seed, {
      bucleChance,
      entradas: entradasCfg,
      entradaDir,
      murosManuales: r.murosManuales
    });
    const zx = zona.x;
    const zz = (zona.y !== undefined ? zona.y : zona.z) || 0;
    const cellSize = (2 * R) / N;
    const halfN = (N - 1) / 2;

    const rotRad = (rotacion * Math.PI) / 180;
    const cosR = Math.cos(rotRad);
    const sinR = Math.sin(rotRad);

    // Convertidor de celda (gx, gy) a mundo (wx, wz) considerando rotación
    const celdaAMundo = (gx, gy) => {
      const lx = (gx - halfN) * cellSize;
      const lz = (gy - halfN) * cellSize;
      const rx = lx * cosR - lz * sinR;
      const rz = lx * sinR + lz * cosR;
      return {
        wx: zx + rx,
        wz: zz + rz
      };
    };

    // Convertidor inverso de mundo (wx, wz) a celda (gx, gy)
    const mundoACelda = (wx, wz) => {
      const dx = wx - zx;
      const dz = wz - zz;
      const lx = dx * cosR + dz * sinR;
      const lz = -dx * sinR + dz * cosR;
      return {
        gx: Math.round(lx / cellSize + halfN),
        gy: Math.round(lz / cellSize + halfN),
        lx,
        lz
      };
    };

    const celdasMonstruos = (r && r.celdasMonstruos && typeof r.celdasMonstruos === 'object') ? { ...r.celdasMonstruos } : {};
    let patronesMonstruos = (r && r.patronesMonstruos && typeof r.patronesMonstruos === 'object' && Object.keys(r.patronesMonstruos).length > 0)
      ? { ...r.patronesMonstruos }
      : null;

    // Si no hay patrones personalizados, sincronizar con los monstruos reales configurados en la zona
    if (!patronesMonstruos) {
      if (Array.isArray(zona.monsters) && zona.monsters.length > 0) {
        patronesMonstruos = {};
        const paletaColores = ['#22c55e', '#3b82f6', '#ef4444', '#a855f7', '#f97316', '#eab308', '#06b6d4', '#ec4899'];
        zona.monsters.forEach((zm, zIdx) => {
          const pId = 'p' + (zIdx + 1);
          const zmName = zm.name || ('Monstruo ' + (zIdx + 1));
          const zmLower = zmName.toLowerCase();
          let clase = 'guerrero';
          if (zm.boss || zm.clase === 'elite' || zm.clase === 'jefe') clase = 'elite';
          else if (zm.clase === 'mago' || zmLower.includes('mago') || zmLower.includes('arcano') || zmLower.includes('hechicero')) clase = 'mago';
          else if (zm.clase === 'arquero' || zmLower.includes('arquero') || zmLower.includes('cazador') || zmLower.includes('tirador')) clase = 'arquero';
          else if (zm.clase === 'rapido' || zmLower.includes('lobo') || zmLower.includes('araña') || zmLower.includes('alimaña')) clase = 'rapido';
          const icono = clase === 'arquero' ? '🏹' : clase === 'mago' ? '🔮' : clase === 'elite' ? '👑' : clase === 'rapido' ? '🦂' : '⚔️';
          const lvl = zm.level || zm.levelMin || 10;
          const lvlMax = zm.levelMax || (zm.boss ? lvl : (lvl + 2));
          const cnt = Math.max(1, Math.min(4, zm.count || (zm.density === 'alta' ? 3 : zm.density === 'media' ? 2 : 1)));
          patronesMonstruos[pId] = {
            id: pId,
            name: zmName,
            color: zm.color || paletaColores[zIdx % paletaColores.length],
            clase: clase,
            levelMin: lvl,
            levelMax: lvlMax,
            level: lvl,
            count: cnt,
            icono: icono
          };
        });
      } else {
        patronesMonstruos = { ...PATRONES_MONSTRUOS_DEFECTO };
      }
    }

    // Auto-distribuir patrullas de monstruos por los pasillos transitables si no hay celdas pintadas
    if (Object.keys(celdasMonstruos).length === 0) {
      const pasillos = [];
      const midC = (N - 1) / 2;
      for (let gy = 1; gy < N - 1; gy++) {
        for (let gx = 1; gx < N - 1; gx++) {
          if (grid[gy][gx] === 0 && Math.hypot(gx - midC, gy - midC) > 1.8) {
            pasillos.push({ gx, gy });
          }
        }
      }
      const patIds = Object.keys(patronesMonstruos);
      if (pasillos.length > 0 && patIds.length > 0) {
        const numADistribuir = Math.min(pasillos.length, Math.max(8, Math.floor(pasillos.length * 0.48)));
        const salto = Math.max(1, Math.floor(pasillos.length / numADistribuir));
        for (let i = 0; i < numADistribuir; i++) {
          const idxP = (i * salto) % pasillos.length;
          const cel = pasillos[idxP];
          const pId = patIds[i % patIds.length];
          celdasMonstruos[`${cel.gx}_${cel.gy}`] = pId;
        }
      }
    }

    // Asegurar que las celdas asignadas a monstruos queden abiertas como camino transitable ANTES de crear colisionadores
    Object.keys(celdasMonstruos).forEach(key => {
      const parts = key.split('_');
      if (parts.length === 2) {
        const gx = parseInt(parts[0], 10), gy = parseInt(parts[1], 10);
        if (gx >= 0 && gx < N && gy >= 0 && gy < N && grid[gy][gx] !== 2) {
          grid[gy][gx] = 0;
        }
      }
    });

    // Cajas de colisión para los muros y listado de celdas de pasillo/camino
    const colliders = [];
    const muros = [];
    const celdasCamino = [];
    const halfBase = cellSize * 0.49;
    const rotBoxHalf = halfBase * (Math.abs(cosR) + Math.abs(sinR));

    for (let gy = 0; gy < N; gy++) {
      for (let gx = 0; gx < N; gx++) {
        const { wx, wz } = celdaAMundo(gx, gy);
        if (grid[gy][gx] === 1) {
          const box = {
            type: 'box',
            minX: wx - rotBoxHalf,
            maxX: wx + rotBoxHalf,
            minZ: wz - rotBoxHalf,
            maxZ: wz + rotBoxHalf,
            gx,
            gy,
            wx,
            wz,
            half: halfBase
          };
          colliders.push(box);
          muros.push({ gx, gy, wx, wz, half: halfBase });
        } else if (grid[gy][gx] === 0) {
          celdasCamino.push({ gx, gy, wx, wz });
        }
      }
    }

    const posEntrada = celdaAMundo(entrada.gx, entrada.gy);
    const posCentro = celdaAMundo(centro.gx, centro.gy);

    // Lista de monstruos asignados por celda
    const monstruosPorCelda = [];
    Object.keys(celdasMonstruos).forEach(key => {
      const patId = celdasMonstruos[key];
      let pat = patronesMonstruos ? (patronesMonstruos[patId] || patronesMonstruos[String(patId).toLowerCase()] || patronesMonstruos[String(patId).toUpperCase()]) : null;
      if (!pat && patronesMonstruos) {
        const pKeys = Object.keys(patronesMonstruos);
        if (pKeys.length) pat = patronesMonstruos[pKeys[0]];
      }
      if (!pat) pat = (PATRONES_MONSTRUOS_DEFECTO && PATRONES_MONSTRUOS_DEFECTO.p1) || { name: 'Monstruo', clase: 'guerrero', levelMin: 10, color: '#22c55e', count: 1 };
      const parts = key.split('_');
      if (parts.length !== 2) return;
      const gx = parseInt(parts[0], 10);
      const gy = parseInt(parts[1], 10);
      if (gx < 0 || gx >= N || gy < 0 || gy >= N) return;
      const { wx, wz } = celdaAMundo(gx, gy);
      const count = Math.max(1, pat.count || 1);
      const lvlMin = pat.levelMin || (pat.level ? pat.level : 10);
      const lvlMax = pat.levelMax || lvlMin;

      for (let ci = 0; ci < count; ci++) {
        let offX = 0;
        let offZ = 0;
        if (count === 2) {
          offX = (ci === 0 ? -1.4 : 1.4);
          offZ = 0;
        } else if (count === 3) {
          if (ci === 0) { offX = 0; offZ = -1.4; }
          else if (ci === 1) { offX = -1.3; offZ = 1.1; }
          else { offX = 1.3; offZ = 1.1; }
        } else if (count === 4) {
          offX = (ci % 2 === 0 ? -1.3 : 1.3);
          offZ = (ci < 2 ? -1.3 : 1.3);
        } else if (count > 4) {
          if (ci === 0) {
            offX = 0;
            offZ = 0;
          } else {
            const radForm = Math.min(2.2, cellSize * 0.28);
            const ang = ((ci - 1) * 2 * Math.PI) / (count - 1);
            offX = Math.cos(ang) * radForm;
            offZ = Math.sin(ang) * radForm;
          }
        }

        const lvl = (count > 1) ? Math.round(lvlMin + (lvlMax - lvlMin) * (ci / (count - 1))) : Math.round((lvlMin + lvlMax) / 2);
        monstruosPorCelda.push({
          key,
          gx,
          gy,
          wx: wx + offX,
          wz: wz + offZ,
          offX,
          offZ,
          index: ci,
          totalInCell: count,
          patId,
          color: pat.color || '#22c55e',
          name: pat.name || 'Monstruo',
          clase: pat.clase || 'guerrero',
          levelMin: lvlMin,
          levelMax: lvlMax,
          level: lvl,
          nivel: lvl,
          count: 1,
          icono: pat.icono || (pat.clase === 'arquero' ? '🏹' : pat.clase === 'mago' ? '🔮' : pat.clase === 'elite' ? '👑' : '⚔️')
        });
      }
    });

    const labEntradas = entradas.map(ent => {
      const p = celdaAMundo(ent.gx, ent.gy);
      return { dir: ent.dir, gx: ent.gx, gy: ent.gy, wx: p.wx, wz: p.wz };
    });

    const labDatos = {
      zonaId: zona.id,
      zonaNombre: zona.name,
      zx,
      zz,
      R,
      N,
      grid,
      cellSize,
      halfN,
      alturaMuro,
      estilo,
      culminacion,
      seed,
      rotacion,
      rotRad,
      cosR,
      sinR,
      colliders,
      muros,
      celdasCamino,
      patronesMonstruos,
      celdasMonstruos,
      monstruosPorCelda,
      entradas: labEntradas,
      entrada: labEntradas[0] || { gx: entrada.gx, gy: entrada.gy, wx: posEntrada.wx, wz: posEntrada.wz },
      centro: { gx: centro.gx, gy: centro.gy, wx: posCentro.wx, wz: posCentro.wz, radio: cellSize * 1.5 },
      celdaAMundo,
      mundoACelda,
      obtenerColisionadores: (x, z) => {
        // Consulta O(1) rotada
        const { gx, gy } = mundoACelda(x, z);
        const out = [];
        for (let dy = -1; dy <= 1; dy++) {
          const ny = gy + dy;
          if (ny < 0 || ny >= N) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const nx = gx + dx;
            if (nx < 0 || nx >= N) continue;
            if (grid[ny][nx] === 1) {
              const { wx, wz } = celdaAMundo(nx, ny);
              out.push({
                type: 'box',
                minX: wx - rotBoxHalf,
                maxX: wx + rotBoxHalf,
                minZ: wz - rotBoxHalf,
                maxZ: wz + rotBoxHalf
              });
            }
          }
        }
        return out;
      }
    };

    zona._cacheLaberinto = labDatos;
    zona._cacheLaberintoKey = cacheKey;
    return labDatos;
  }

  /**
   * Consulta si una coordenada en el mundo está en un camino transitable del laberinto.
   */
  function esCamino(zona, x, z) {
    const lab = obtenerDatosLaberinto(zona);
    if (!lab) return true;
    const d = Math.hypot(x - lab.zx, z - lab.zz);
    if (d > lab.R) return true;
    const { gx, gy } = lab.mundoACelda ? lab.mundoACelda(x, z) : {
      gx: Math.round((x - lab.zx) / lab.cellSize + lab.halfN),
      gy: Math.round((z - lab.zz) / lab.cellSize + lab.halfN)
    };
    if (gx < 0 || gx >= lab.N || gy < 0 || gy >= lab.N) return true;
    return lab.grid[gy][gx] === 0;
  }

  /**
   * Obtiene la zona con laberinto activo en (x, z).
   */
  function obtenerLaberintoEnPunto(zonas, x, z) {
    if (!zonas || !zonas.length) return null;
    for (let i = 0; i < zonas.length; i++) {
      const zObj = zonas[i];
      if (!zonaTieneLaberinto(zObj)) continue;
      const d = Math.hypot(x - zObj.x, z - zObj.y);
      if (d <= (zObj.radius || 100) + 5) {
        return obtenerDatosLaberinto(zObj);
      }
    }
    return null;
  }

  /**
   * Modifica la altura del terreno base (Hgen) esculpiendo el laberinto directamente
   * sobre el relieve: hendiduras en pasillos (-2.0m) y desfiladeros con paredes de roca
   * elevadas (+alturaMuro) cuyas pendientes superan el 50% de desnivel, haciéndolas inescalables
   * a pie por la física del personaje. Esto guía de forma natural al jugador por el camino.
   */
  function aplicarRelieveTerreno(zonas, x, z, hBase) {
    if (!zonas || !zonas.length) return hBase;
    let h = hBase;
    for (let zi = 0; zi < zonas.length; zi++) {
      const zona = zonas[zi];
      if (!zona || !zona.relieve || !zona.relieve.activo) continue;
      const lab = obtenerDatosLaberinto(zona);
      if (!lab) continue;

      const R = lab.R;
      const dx = x - zona.x, dz = z - zona.y;
      const d = Math.hypot(dx, dz);
      if (d > R + 6) continue;

      const { N, grid, cellSize, halfN, zx, zz, alturaMuro, culminacion, cosR, sinR } = lab;
      const lx = (cosR !== undefined) ? (dx * cosR + dz * sinR) : dx;
      const lz = (sinR !== undefined) ? (-dx * sinR + dz * cosR) : dz;
      const u = lx / cellSize + halfN;
      const v = lz / cellSize + halfN;
      const i = Math.floor(u);
      const j = Math.floor(v);
      const fx = Math.max(0, Math.min(1, u - i));
      const fy = Math.max(0, Math.min(1, v - j));

      const getW = (gx, gy) => {
        if (gx < 0 || gx >= N || gy < 0 || gy >= N) return 0;
        return grid[gy][gx] === 1 ? 1 : 0;
      };

      const w00 = getW(i, j);
      const w10 = getW(i + 1, j);
      const w01 = getW(i, j + 1);
      const w11 = getW(i + 1, j + 1);
      const w = (1 - fx) * (1 - fy) * w00 + fx * (1 - fy) * w10 + (1 - fx) * fy * w01 + fx * fy * w11;

      // S-curve más empinada: mantiene el suelo del desfiladero plano y ancho (w < 0.35)
      // y eleva las paredes abruptamente (>400% pendiente) creando acantilados verticales que encierran el sitio
      const s = smooth(0.35, 0.58, w);

      // Hendidura en pasillos (-3.5m) y elevación de altas crestas de roca (+alturaMuro)
      const profHendidura = typeof zona.relieve.profundidadHendidura === 'number'
        ? zona.relieve.profundidadHendidura
        : (typeof zona.relieve.profundidad === 'number' ? zona.relieve.profundidad : 3.5);
      const altMuroEfectiva = typeof alturaMuro === 'number' && alturaMuro > 0 ? Math.max(10, alturaMuro) : 14;
      let dh = -profHendidura * (1 - s) + altMuroEfectiva * s;

      // En el centro de culminación: explanada allanada a nivel transitable del cañón
      const dCentro = Math.hypot(x - lab.centro.wx, z - lab.centro.wz);
      if (dCentro < lab.centro.radio) {
        const tC = smooth(lab.centro.radio * 0.4, lab.centro.radio, dCentro);
        const dhCentro = culminacion === 'oasis' ? -(profHendidura + 1.5) : -profHendidura;
        dh = dhCentro * (1 - tC) + dh * tC;
      }

      // Evitar que la excavación perfore el nivel del mar si la zona está en cota baja sobre tierra
      if (hBase + dh < 1.2) {
        dh = Math.max(dh, 1.2 - hBase);
      }

      // En las entradas configuradas: rampa suave que conecta el terreno exterior con el fondo del desfiladero
      const listaEntradas = lab.entradas && lab.entradas.length ? lab.entradas : [lab.entrada];
      for (let ei = 0; ei < listaEntradas.length; ei++) {
        const entObj = listaEntradas[ei];
        if (!entObj) continue;
        const dEntrada = Math.hypot(x - entObj.wx, z - entObj.wz);
        if (dEntrada < lab.cellSize * 1.3 && d >= R - 8) {
          const tE = smooth(R - 8, R + 2, d);
          dh = dh * (1 - tE);
          break;
        }
      }

      // En el borde exterior de la zona: mezcla suave hacia el terreno base natural
      const blendBorde = 1 - smooth(R - 6, R + 2, d);
      h = h + dh * blendBorde;
      if (hBase >= 0.5 && h < 0.5) {
        h = 0.5;
      }
    }
    return h;
  }

  /**
   * Modifica texturas (splatting): caminos de grava/tierra, paredes de roca y explanada temática.
   */
  function splatZona(lab, x, z, steep, h, splatBase) {
    if (!lab) return splatBase;
    const { gx, gy } = lab.mundoACelda ? lab.mundoACelda(x, z) : {
      gx: Math.round((x - lab.zx) / lab.cellSize + lab.halfN),
      gy: Math.round((z - lab.zz) / lab.cellSize + lab.halfN)
    };
    if (gx < 0 || gx >= lab.N || gy < 0 || gy >= lab.N) return splatBase;
    const valorCelda = lab.grid[gy][gx];
    if (valorCelda === 2) return splatBase;

    const dCentro = Math.hypot(x - lab.centro.wx, z - lab.centro.wz);
    const esCentro = dCentro <= lab.centro.radio;

    let g = 0,
      d = 0,
      r = 0,
      s = 0;

    if (esCentro) {
      if (lab.culminacion === 'oasis') {
        s = 0.70;
        g = 0.20;
        d = 0.10; // Arena de orilla y vegetación fresca
      } else if (lab.culminacion === 'jefe') {
        r = 0.85;
        d = 0.15; // Roca oscura de arena de combate
      } else if (lab.culminacion === 'objeto_mision' || lab.culminacion === 'santuario') {
        r = 0.75;
        d = 0.20;
        g = 0.05; // Losas ceremoniales
      } else {
        d = 0.55;
        r = 0.40;
        s = 0.05;
      }
    } else if (valorCelda === 0) {
      // Suelo del camino en el desfiladero: tierra batida, grava y sendero contrastado
      d = 0.88;
      r = 0.08;
      g = 0.04;
    } else {
      // Muros y acantilados del desfiladero: roca pura dominante
      r = 0.98;
      d = 0.02;
    }

    const sum = g + d + r + s || 1;
    return {
      splat: [g / sum, d / sum, r / sum, s / sum],
      snow: 0
    };
  }

  /**
   * Dibuja el laberinto directamente sobre el lienzo 2D en index.html.
   * Permite ver visualmente cada muro, pasillo, la entrada al sur y la culminación al centro.
   */
  function dibujarLaberinto2D(ctx, zona, toScreen, viewScale, selected) {
    const lab = obtenerDatosLaberinto(zona);
    if (!lab) return;

    const { N, grid, cellSize, zx, zz, R, culminacion } = lab;
    const est = ESTILOS[lab.estilo] || ESTILOS.roca_canion;
    const culmInfo = CULMINACIONES[culminacion] || CULMINACIONES.oasis;

    ctx.save();

    // Dibujar celdas de muro y pasillos
    for (let gy = 0; gy < N; gy++) {
      for (let gx = 0; gx < N; gx++) {
        const val = grid[gy][gx];
        if (val === 2) continue; // Fuera de la zona

        const wx = zx + (gx - (N - 1) / 2) * cellSize;
        const wz = zz + (gy - (N - 1) / 2) * cellSize;
        const sTopLeft = toScreen(wx - cellSize / 2, wz - cellSize / 2);
        const sBottomRight = toScreen(wx + cellSize / 2, wz + cellSize / 2);
        const wPx = Math.abs(sBottomRight.x - sTopLeft.x);
        const hPx = Math.abs(sBottomRight.y - sTopLeft.y);

        if (val === 1) {
          // Muro sólido
          ctx.fillStyle = est.hex;
          ctx.fillRect(sTopLeft.x, sTopLeft.y, wPx + 0.5, hPx + 0.5);
          ctx.strokeStyle = 'rgba(15,23,42,0.6)';
          ctx.lineWidth = 1;
          ctx.strokeRect(sTopLeft.x, sTopLeft.y, wPx + 0.5, hPx + 0.5);
        } else if (val === 0) {
          // Pasillo transitable
          ctx.fillStyle = 'rgba(217, 119, 6, 0.25)';
          ctx.fillRect(sTopLeft.x, sTopLeft.y, wPx + 0.5, hPx + 0.5);
        }
      }
    }

    // Explanada central
    const sCentro = toScreen(lab.centro.wx, lab.centro.wz);
    const rCentroPx = Math.max(12, lab.centro.radio * viewScale);
    ctx.beginPath();
    ctx.arc(sCentro.x, sCentro.y, rCentroPx, 0, Math.PI * 2);
    ctx.fillStyle =
      culminacion === 'oasis'
        ? 'rgba(56,189,248,0.5)'
        : culminacion === 'jefe'
          ? 'rgba(239,68,68,0.5)'
          : culminacion === 'objeto_mision'
            ? 'rgba(168,85,247,0.5)'
            : 'rgba(34,197,94,0.5)';
    ctx.fill();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Icono de culminación en el centro
    const tamIcono = Math.max(14, Math.min(26, Math.round(18 * viewScale)));
    ctx.font = `${tamIcono}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(culmInfo.icono, sCentro.x, sCentro.y);

    // Indicador de Entrada en el perímetro
    const sEntrada = toScreen(lab.entrada.wx, lab.entrada.wz);
    ctx.fillStyle = '#22c55e';
    ctx.font = `bold ${Math.max(10, Math.min(16, Math.round(13 * viewScale)))}px sans-serif`;
    ctx.fillText('🚪 ENTRADA', sEntrada.x, sEntrada.y + 12);

    ctx.restore();
  }

  /**
   * Generador de texturas procedurales para los muros de laberintos según el estilo arquitectónico.
   */
  function createProceduralWallTexture(THREE, estilo, colorBase) {
    if (typeof document === 'undefined') return null;
    const cv = document.createElement('canvas');
    cv.width = 512; cv.height = 512;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = colorBase || '#78716c';
    ctx.fillRect(0, 0, 512, 512);

    if (estilo === 'laberinto_setos' || estilo === 'setos') {
      ctx.fillStyle = '#14532d';
      ctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 3500; i++) {
        const lx = Math.random() * 512, ly = Math.random() * 512;
        const lr = 3 + Math.random() * 7;
        ctx.beginPath();
        ctx.arc(lx, ly, lr, 0, Math.PI * 2);
        ctx.fillStyle = (Math.random() < 0.35) ? '#15803d' : (Math.random() < 0.7 ? '#22c55e' : '#166534');
        ctx.globalAlpha = 0.65;
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    } else if (estilo === 'piedra_ruinas' || estilo === 'mamposteria_castillo' || estilo === 'cripta_catacumbas') {
      const filas = 8;
      const hFila = 512 / filas;
      ctx.fillStyle = colorBase || '#475569';
      ctx.fillRect(0, 0, 512, 512);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#1e293b';
      for (let f = 0; f <= filas; f++) {
        ctx.beginPath();
        ctx.moveTo(0, f * hFila);
        ctx.lineTo(512, f * hFila);
        ctx.stroke();
        const offset = (f % 2) * 32;
        for (let vx = offset; vx <= 512; vx += 64) {
          ctx.beginPath();
          ctx.moveTo(vx, f * hFila);
          ctx.lineTo(vx, (f + 1) * hFila);
          ctx.stroke();
        }
      }
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      for (let i = 0; i < 2000; i++) ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      for (let i = 0; i < 2000; i++) ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    } else if (estilo === 'hielo_glacial') {
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(0.5, '#7dd3fc');
      grad.addColorStop(1, '#0284c7');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 25; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * 512, Math.random() * 512);
        ctx.lineTo(Math.random() * 512, Math.random() * 512);
        ctx.stroke();
      }
    } else if (estilo === 'obsidiana_volcanica' || estilo === 'volcan_magma') {
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 8;
      for (let i = 0; i < 14; i++) {
        ctx.beginPath();
        const startX = Math.random() * 512, startY = Math.random() * 512;
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + (Math.random() - 0.5) * 120, startY + (Math.random() - 0.5) * 120);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, colorBase || '#847f7a');
      grad.addColorStop(0.25, '#57534e');
      grad.addColorStop(0.5, colorBase || '#847f7a');
      grad.addColorStop(0.75, '#44403c');
      grad.addColorStop(1, colorBase || '#847f7a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 2;
      for (let y = 16; y < 512; y += 24 + Math.random() * 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(128, y + 4, 384, y - 4, 512, y);
        ctx.stroke();
      }
    }

    if (!THREE || !THREE.CanvasTexture) return null;
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = (THREE.RepeatWrapping || 1000);
    tex.repeat.set(2, 2);
    return tex;
  }

  function createProceduralFloorTexture(THREE, estilo, colorBase) {
    if (typeof document === 'undefined') return null;
    const cv = document.createElement('canvas');
    cv.width = 512; cv.height = 512;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = colorBase || '#57534e';
    ctx.fillRect(0, 0, 512, 512);

    if (estilo === 'laberinto_setos' || estilo === 'setos') {
      ctx.fillStyle = '#1e3a1e';
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = 'rgba(74, 222, 128, 0.25)';
      for (let i = 0; i < 4000; i++) ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 4);
    } else if (estilo === 'piedra_ruinas' || estilo === 'cripta_catacumbas') {
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 3;
      for (let y = 0; y <= 512; y += 48) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
        const off = (y / 48 % 2) * 24;
        for (let x = off; x <= 512; x += 48) {
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 48); ctx.stroke();
        }
      }
    } else if (estilo === 'hielo_glacial') {
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      for (let i = 0; i < 2000; i++) ctx.fillRect(Math.random() * 512, Math.random() * 512, 3, 3);
    } else if (estilo === 'obsidiana_volcanica') {
      ctx.fillStyle = '#0f0714';
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = 'rgba(249, 115, 22, 0.2)';
      for (let i = 0; i < 800; i++) ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      for (let i = 0; i < 3000; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (!THREE || !THREE.CanvasTexture) return null;
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = (THREE.RepeatWrapping || 1000);
    tex.repeat.set(4, 4);
    return tex;
  }

  function crearArcoEntrada(THREE, ent) {
    if (!THREE) return null;
    const g = new THREE.Group();
    const matPillar = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const matLight = new THREE.MeshBasicMaterial({ color: 0x22c55e });

    const colG = new THREE.CylinderGeometry(0.5, 0.6, 5.5, 8);
    const p1 = new THREE.Mesh(colG, matPillar);
    p1.position.set(-3.5, 2.75, 0);
    p1.castShadow = true;
    g.add(p1);

    const p2 = new THREE.Mesh(colG, matPillar);
    p2.position.set(3.5, 2.75, 0);
    p2.castShadow = true;
    g.add(p2);

    const archG = new THREE.BoxGeometry(8, 0.8, 1.2);
    const arch = new THREE.Mesh(archG, matPillar);
    arch.position.set(0, 5.7, 0);
    arch.castShadow = true;
    g.add(arch);

    const gemG = new THREE.OctahedronGeometry(0.35);
    const g1 = new THREE.Mesh(gemG, matLight);
    g1.position.set(-3.5, 5.2, 0);
    g.add(g1);
    const g2 = new THREE.Mesh(gemG, matLight);
    g2.position.set(3.5, 5.2, 0);
    g.add(g2);

    return g;
  }

  /**
   * Construye los muros volumétricos 3D texturizados del laberinto en una sola InstancedMesh de alto rendimiento.
   */
  function crearMallaMurosLaberinto(THREE, zona, Hgen) {
    const lab = obtenerDatosLaberinto(zona);
    if (!lab || !THREE) return null;
    const muros = lab.muros || [];
    if (!muros.length) return null;

    const grupo = new THREE.Group();
    grupo.name = 'Laberinto_Muros_' + (zona.id || 'z');
    grupo.userData.zonaId = zona.id;

    const r = zona.relieve || {};
    const alturaMuro = typeof r.alturaMuro === 'number' ? r.alturaMuro : 14;
    const hMuro3D = Math.max(3.5, alturaMuro * 0.95);
    const cellSize = lab.cellSize;
    const boxG = new THREE.BoxGeometry(cellSize * 0.98, hMuro3D, cellSize * 0.98);

    const estilo = r.estilo || 'roca_canion';
    const wallColor = r.wallColor || (ESTILOS[estilo] && ESTILOS[estilo].hex) || '#847f7a';
    const texWall = createProceduralWallTexture(THREE, estilo, wallColor);

    const matWall = new THREE.MeshStandardMaterial({
      map: texWall,
      color: new THREE.Color(wallColor),
      roughness: 0.78,
      metalness: 0.12
    });

    const instancedMesh = new THREE.InstancedMesh(boxG, matWall, muros.length);
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;

    const dummyMatrix = new THREE.Matrix4();
    const dummyPos = new THREE.Vector3();
    const dummyQuat = new THREE.Quaternion();
    const dummyScale = new THREE.Vector3(1, 1, 1);
    const rotRad = lab.rotRad || 0;
    if (rotRad !== 0) {
      dummyQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -rotRad);
    }

    const prof = typeof r.profundidad === 'number' ? r.profundidad : 3.5;
    muros.forEach((m, idx) => {
      const wy = (Hgen ? Hgen(m.wx, m.wz) : 0) + hMuro3D / 2 - prof * 0.2;
      dummyPos.set(m.wx, wy, m.wz);
      dummyMatrix.compose(dummyPos, dummyQuat, dummyScale);
      instancedMesh.setMatrixAt(idx, dummyMatrix);
    });
    instancedMesh.instanceMatrix.needsUpdate = true;
    grupo.add(instancedMesh);

    // Arcos de bienvenida en las entradas configuradas
    const listaEntradas = lab.entradas || [lab.entrada];
    listaEntradas.forEach(ent => {
      if (!ent) return;
      const ey = Hgen ? Hgen(ent.wx, ent.wz) : 0;
      const arch = crearArcoEntrada(THREE, ent);
      if (arch) {
        arch.position.set(ent.wx, ey, ent.wz);
        arch.lookAt(lab.zx, ey, lab.zz);
        grupo.add(arch);
      }
    });

    return grupo;
  }

  /**
   * Construye los muros 3D del laberinto usando el constructor MB (MeshBuilder).
   */
  function crearMallaLaberinto(THREE, MBClass, zona, Hgen) {
    const lab = obtenerDatosLaberinto(zona);
    if (!lab || !MBClass) return null;

    const mb = new MBClass();
    const est = ESTILOS[lab.estilo] || ESTILOS.roca_canion;
    const colPared = est.colorPared;
    const colTop = est.colorTop;
    const { N, grid, cellSize, zx, zz, alturaMuro } = lab;

    for (let gy = 0; gy < N; gy++) {
      for (let gx = 0; gx < N; gx++) {
        if (grid[gy][gx] === 1) {
          const wx = zx + (gx - (N - 1) / 2) * cellSize;
          const wz = zz + (gy - (N - 1) / 2) * cellSize;
          const ySuelo = Hgen ? Hgen(wx, wz) : 0;
          // Construir bloque de muro
          mb.box(
            wx,
            ySuelo + alturaMuro / 2,
            wz,
            1,
            0,
            cellSize * 0.98,
            alturaMuro,
            cellSize * 0.98,
            colPared,
            colTop
          );
        }
      }
    }

    const geom = mb.geom ? mb.geom() : null;
    if (!geom) return null;

    const mat = new THREE.MeshStandardMaterial({
      roughness: 0.88,
      metalness: 0.1,
      vertexColors: true
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.esLaberintoMuro = true;
    mesh.userData.zonaId = zona.id;
    return mesh;
  }

  /**
   * Construye los elementos 3D del punto de destino / culminación (centro del laberinto).
   */
  function crearDecoradoCulminacion(THREE, zona, Hgen) {
    const lab = obtenerDatosLaberinto(zona);
    if (!lab) return null;

    const culm = lab.culminacion;
    const zx = lab.centro.wx;
    const zz = lab.centro.wz;
    const yh = Hgen ? Hgen(zx, zz) : 0;

    const grupo = new THREE.Group();
    grupo.position.set(zx, yh, zz);
    grupo.userData.culminacionTipo = culm;
    grupo.userData.zonaId = zona.id;
    grupo.userData.zonaNombre = zona.name;

    const matRocaOscura = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9, metalness: 0.15 });
    const matRoca = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85, metalness: 0.1 });
    const matOro = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.8 });

    if (culm === 'objeto_mision') {
      // 🔮 Pedestal con reliquia interactuable
      const baseGeo = new THREE.CylinderGeometry(2.4, 2.8, 0.7, 8);
      const baseMesh = new THREE.Mesh(baseGeo, matRocaOscura);
      baseMesh.position.y = 0.35;
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      grupo.add(baseMesh);

      const fusteGeo = new THREE.CylinderGeometry(1.5, 1.8, 1.4, 8);
      const fusteMesh = new THREE.Mesh(fusteGeo, matRoca);
      fusteMesh.position.y = 1.4;
      fusteMesh.castShadow = true;
      fusteMesh.receiveShadow = true;
      grupo.add(fusteMesh);

      const reliquiaGeo = new THREE.OctahedronGeometry(0.9, 0);
      const matReliquia = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.9,
        roughness: 0.15,
        metalness: 0.6
      });
      const reliquiaMesh = new THREE.Mesh(reliquiaGeo, matReliquia);
      reliquiaMesh.position.y = 3.6;
      reliquiaMesh.castShadow = true;
      grupo.add(reliquiaMesh);
      grupo.userData.reliquiaMesh = reliquiaMesh;

      const luz = new THREE.PointLight(0x38bdf8, 2.0, 24);
      luz.position.set(0, 3.8, 0);
      grupo.add(luz);
    } else if (culm === 'santuario') {
      // 🏛️ Círculo de monolitos rúnicos
      const numPilares = 7;
      const radCirculo = 8.5;
      for (let i = 0; i < numPilares; i++) {
        const ang = (i * 2 * Math.PI) / numPilares;
        const alt = 4.5 + (i % 2) * 1.2;
        const pilar = new THREE.Mesh(new THREE.BoxGeometry(1.2, alt, 0.9), matRoca);
        pilar.position.set(Math.cos(ang) * radCirculo, alt / 2, Math.sin(ang) * radCirculo);
        pilar.rotation.y = -ang + Math.PI / 2;
        pilar.castShadow = true;
        pilar.receiveShadow = true;
        grupo.add(pilar);
      }

      const altar = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.1, 2.0), matRocaOscura);
      altar.position.y = 0.55;
      altar.castShadow = true;
      grupo.add(altar);

      const gema = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.65, 0),
        new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x22c55e, emissiveIntensity: 0.9 })
      );
      gema.position.y = 1.6;
      grupo.add(gema);
      grupo.userData.reliquiaMesh = gema;

      const luz = new THREE.PointLight(0x4ade80, 2.0, 26);
      luz.position.set(0, 2.5, 0);
      grupo.add(luz);
    } else if (culm === 'jefe') {
      // 💀 Arena de Jefe con pebeteros de fuego
      const arenaMesh = new THREE.Mesh(new THREE.CylinderGeometry(11, 11.5, 0.4, 24), matRocaOscura);
      arenaMesh.position.y = 0.2;
      arenaMesh.receiveShadow = true;
      grupo.add(arenaMesh);

      const matFuego = new THREE.MeshBasicMaterial({ color: 0xf97316 });
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2 + Math.PI / 4;
        const radPeb = 9.2;
        const pebCol = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 2.4, 8), matRoca);
        pebCol.position.set(Math.cos(ang) * radPeb, 1.2, Math.sin(ang) * radPeb);
        pebCol.castShadow = true;
        grupo.add(pebCol);

        const fuegoMesh = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.2, 7), matFuego);
        fuegoMesh.position.set(Math.cos(ang) * radPeb, 2.7, Math.sin(ang) * radPeb);
        grupo.add(fuegoMesh);

        const luz = new THREE.PointLight(0xf97316, 1.5, 20);
        luz.position.set(Math.cos(ang) * radPeb, 3.0, Math.sin(ang) * radPeb);
        grupo.add(luz);
      }
    } else if (culm === 'tesoro') {
      // 💎 Cofre del Tesoro Legendario
      const cofreBase = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 1.2), matOro);
      cofreBase.position.y = 0.55;
      cofreBase.castShadow = true;
      grupo.add(cofreBase);

      const tapaCofre = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 1.8, 12, 1, false, 0, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.4 })
      );
      tapaCofre.position.set(0, 1.1, 0);
      tapaCofre.rotation.z = Math.PI / 2;
      grupo.add(tapaCofre);
      grupo.userData.reliquiaMesh = cofreBase;

      const luz = new THREE.PointLight(0xf59e0b, 2.2, 22);
      luz.position.set(0, 2.0, 0);
      grupo.add(luz);
    } else if (culm === 'oasis') {
      // 🌴 Manantial de agua turquesa cristalina en el lecho del oasis
      const radAgua = 9.5;
      const aguaGeo = new THREE.CircleGeometry(radAgua, 32);
      aguaGeo.rotateX(-Math.PI / 2);
      const matAguaOasis = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.1,
        metalness: 0.35,
        transparent: true,
        opacity: 0.85
      });
      const aguaMesh = new THREE.Mesh(aguaGeo, matAguaOasis);
      aguaMesh.position.y = 0.08;
      aguaMesh.receiveShadow = true;
      grupo.add(aguaMesh);

      // Palmeras exuberantes alrededor del manantial
      const matTronco = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.9 });
      const matPalma = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6, side: THREE.DoubleSide });
      const numPalmeras = 6;
      const radOasis = 12.5;
      for (let i = 0; i < numPalmeras; i++) {
        const ang = (i * 2 * Math.PI) / numPalmeras + (i % 2) * 0.4;
        const px = Math.cos(ang) * radOasis;
        const pz = Math.sin(ang) * radOasis;
        const altPalmera = (typeof Hgen === 'function') ? (Hgen(zx + px, zz + pz) - yh) : 0;
        const palmera = new THREE.Group();
        palmera.position.set(px, altPalmera, pz);

        const altTronco = 7.0 + (i % 3) * 1.5;
        const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.65, altTronco, 7), matTronco);
        tronco.position.y = altTronco / 2;
        tronco.rotation.z = (Math.random() - 0.5) * 0.22;
        tronco.castShadow = true;
        palmera.add(tronco);

        const numHojas = 8;
        for (let h = 0; h < numHojas; h++) {
          const hang = (h * 2 * Math.PI) / numHojas;
          const hoja = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3.8, 4), matPalma);
          hoja.position.set(Math.cos(hang) * 1.6, altTronco + 0.2, Math.sin(hang) * 1.6);
          hoja.rotation.x = Math.PI / 2.6;
          hoja.rotation.y = hang;
          hoja.castShadow = true;
          palmera.add(hoja);
        }
        grupo.add(palmera);
      }
    }

    return grupo;
  }

  /**
   * Crea el estrechamiento compartido de 100 metros de desfiladero (común en exterior e interior).
   */
  function crearEstrechamiento100m(THREE, estilo, colorPared, colorSuelo) {
    if (!THREE) return null;
    const grupo = new THREE.Group();
    grupo.name = 'Estrechamiento100m';

    const est = ESTILOS[estilo] || ESTILOS.roca_canion;
    const colP = colorPared || est.hex || '#78716c';
    const colS = colorSuelo || '#57534e';

    const hMuro = 14;
    const largo = 100;
    const anchoPaso = 12; // 12 metros de paso libre
    const grosorMuro = 4;

    // 1. Suelo del desfiladero (100m de longitud, de z = -100 a z = 0)
    const geoSuelo = new THREE.PlaneGeometry(anchoPaso + 2, largo);
    geoSuelo.rotateX(-Math.PI / 2);
    const texSuelo = createProceduralFloorTexture(THREE, estilo, colS);
    const matSuelo = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colS),
      roughness: 0.85,
      metalness: 0.05,
      map: texSuelo || undefined
    });
    const suelo = new THREE.Mesh(geoSuelo, matSuelo);
    suelo.position.set(0, 0.02, -largo / 2);
    suelo.receiveShadow = true;
    grupo.add(suelo);

    // 2. Muros laterales (14m de alto x 100m de largo)
    const geoMuro = new THREE.BoxGeometry(grosorMuro, hMuro, largo);
    const texMuro = createProceduralWallTexture(THREE, estilo, colP);
    const matMuro = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colP),
      roughness: 0.8,
      metalness: 0.1,
      map: texMuro || undefined
    });

    const muroIzq = new THREE.Mesh(geoMuro, matMuro);
    muroIzq.position.set(-(anchoPaso / 2 + grosorMuro / 2), hMuro / 2, -largo / 2);
    muroIzq.castShadow = true;
    muroIzq.receiveShadow = true;
    grupo.add(muroIzq);

    const muroDer = new THREE.Mesh(geoMuro, matMuro);
    muroDer.position.set(anchoPaso / 2 + grosorMuro / 2, hMuro / 2, -largo / 2);
    muroDer.castShadow = true;
    muroDer.receiveShadow = true;
    grupo.add(muroDer);

    // 3. Antorchas a lo largo del estrechamiento cada 20m (-80, -60, -40, -20)
    const matSoporte = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const matFuego = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const geoSoporte = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 6);
    geoSoporte.rotateZ(Math.PI / 4);
    const geoLlama = new THREE.ConeGeometry(0.2, 0.5, 6);

    [-80, -60, -40, -20].forEach(zPos => {
      // Izquierda
      const antI = new THREE.Group();
      antI.position.set(-(anchoPaso / 2 - 0.25), 4.2, zPos);
      const sI = new THREE.Mesh(geoSoporte, matSoporte);
      const fI = new THREE.Mesh(geoLlama, matFuego);
      fI.position.set(0.3, 0.35, 0);
      antI.add(sI, fI);
      const lI = new THREE.PointLight(0xf59e0b, 1.4, 20, 1.4);
      lI.position.set(0.3, 0.4, 0);
      antI.add(lI);
      grupo.add(antI);

      // Derecha
      const antD = new THREE.Group();
      antD.position.set(anchoPaso / 2 - 0.25, 4.2, zPos);
      antD.rotation.y = Math.PI;
      const sD = new THREE.Mesh(geoSoporte, matSoporte);
      const fD = new THREE.Mesh(geoLlama, matFuego);
      fD.position.set(0.3, 0.35, 0);
      antD.add(sD, fD);
      const lD = new THREE.PointLight(0xf59e0b, 1.4, 20, 1.4);
      lD.position.set(0.3, 0.4, 0);
      antD.add(lD);
      grupo.add(antD);
    });

    // 4. Portal Archway al inicio (z = -100)
    const portalGroup = new THREE.Group();
    portalGroup.position.set(0, 0, -100);

    const matPilar = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const matGema = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const colPilar = new THREE.CylinderGeometry(0.9, 1.1, 9, 8);
    const p1 = new THREE.Mesh(colPilar, matPilar);
    p1.position.set(-anchoPaso / 2 + 0.6, 4.5, 0);
    p1.castShadow = true;
    const p2 = p1.clone();
    p2.position.x = anchoPaso / 2 - 0.6;

    const dintel = new THREE.Mesh(new THREE.BoxGeometry(anchoPaso + 2, 1.5, 2.2), matPilar);
    dintel.position.set(0, 9.2, 0);
    dintel.castShadow = true;

    const gema = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), matGema);
    gema.position.set(0, 8.5, 0);

    const luzPortal = new THREE.PointLight(0x10b981, 2.5, 24);
    luzPortal.position.set(0, 5, 0);

    const vortice = new THREE.Mesh(
      new THREE.PlaneGeometry(anchoPaso - 2, 8),
      new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
    );
    vortice.position.set(0, 4.2, 0);

    portalGroup.add(p1, p2, dintel, gema, luzPortal, vortice);
    grupo.add(portalGroup);

    return {
      grupo,
      colliders: [
        { type: 'box', minX: -(anchoPaso / 2 + grosorMuro), maxX: -anchoPaso / 2, minZ: -largo, maxZ: 0 },
        { type: 'box', minX: anchoPaso / 2, maxX: anchoPaso / 2 + grosorMuro, minZ: -largo, maxZ: 0 },
        { type: 'box', minX: -(anchoPaso / 2 + 6), maxX: anchoPaso / 2 + 6, minZ: -largo - 6, maxZ: -largo }
      ],
      largo,
      anchoPaso
    };
  }

  /**
   * Construye la instancia interior independiente del laberinto (plano horizontal a y=0,
   * estrechamiento de 100m, muros 3D, culminación, colisionadores y posiciones de monstruos).
   */
  function crearInstanciaLaberinto(THREE, zona) {
    if (!THREE || !zona) return null;
    const lab = obtenerDatosLaberinto(zona);
    if (!lab) return null;

    const grupo = new THREE.Group();
    grupo.name = 'InstanciaLaberinto_' + zona.id;

    const estilo = lab.estilo || 'roca_canion';
    const est = ESTILOS[estilo] || ESTILOS.roca_canion;
    const colP = lab.wallColor || est.hex || '#78716c';
    const colS = lab.groundColor || '#57534e';
    const { N, grid, cellSize, alturaMuro, centro, entrada } = lab;
    const colliders = [];

    // 1. Estrechamiento de 100 metros común en la entrada (z de -100 a 0)
    const estrechamiento = crearEstrechamiento100m(THREE, estilo, colP, colS);
    if (estrechamiento) {
      grupo.add(estrechamiento.grupo);
      colliders.push(...estrechamiento.colliders);
    }

    // 2. Suelo del laberinto (plano horizontal a y=0, desde z=0 hacia delante)
    const tamTotal = Math.max(2 * (lab.R || 100) + 40, N * cellSize + 40);
    const halfN = (N - 1) / 2;
    const offsetZ = -entrada.gy * cellSize;

    const geoSuelo = new THREE.PlaneGeometry(tamTotal, tamTotal);
    geoSuelo.rotateX(-Math.PI / 2);
    const texSuelo = createProceduralFloorTexture(THREE, estilo, colS);
    const matSuelo = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colS),
      roughness: 0.85,
      metalness: 0.05,
      map: texSuelo || undefined
    });
    const sueloLab = new THREE.Mesh(geoSuelo, matSuelo);
    sueloLab.position.set(0, 0, halfN * cellSize + offsetZ);
    sueloLab.receiveShadow = true;
    grupo.add(sueloLab);

    // 3. Muros 3D del laberinto (InstancedMesh en y = 0)
    const murosLocales = [];
    for (let gy = 0; gy < N; gy++) {
      for (let gx = 0; gx < N; gx++) {
        if (grid[gy][gx] === 1) {
          const lx = (gx - halfN) * cellSize;
          const lz = (gy - entrada.gy) * cellSize;
          murosLocales.push({ gx, gy, lx, lz });
          const halfB = cellSize * 0.49;
          colliders.push({
            type: 'box',
            minX: lx - halfB,
            maxX: lx + halfB,
            minZ: lz - halfB,
            maxZ: lz + halfB
          });
        }
      }
    }

    if (murosLocales.length > 0) {
      const hMuro3D = Math.max(3.5, alturaMuro || 14);
      const boxG = new THREE.BoxGeometry(cellSize * 0.98, hMuro3D, cellSize * 0.98);
      const texMuro = createProceduralWallTexture(THREE, estilo, colP);
      const matMuro = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colP),
        roughness: 0.8,
        metalness: 0.1,
        map: texMuro || undefined
      });
      const wallsMesh = new THREE.InstancedMesh(boxG, matMuro, murosLocales.length);
      wallsMesh.castShadow = true;
      wallsMesh.receiveShadow = true;
      const dummyMat = new THREE.Matrix4();
      const dummyPos = new THREE.Vector3();
      const dummyQuat = new THREE.Quaternion();
      const dummyScale = new THREE.Vector3(1, 1, 1);

      murosLocales.forEach((m, idx) => {
        dummyPos.set(m.lx, hMuro3D / 2, m.lz);
        dummyMat.compose(dummyPos, dummyQuat, dummyScale);
        wallsMesh.setMatrixAt(idx, dummyMat);
      });
      wallsMesh.instanceMatrix.needsUpdate = true;
      grupo.add(wallsMesh);
    }

    // 4. Culminación en la cámara central
    const culmX = (centro.gx - halfN) * cellSize;
    const culmZ = (centro.gy - entrada.gy) * cellSize;
    const dummyZonaLocal = Object.assign({}, zona, {
      x: culmX,
      y: culmZ,
      _localCulm: true
    });
    const decCulm = crearDecoradoCulminacion(THREE, dummyZonaLocal, () => 0);
    if (decCulm) {
      decCulm.position.set(culmX, 0, culmZ);
      grupo.add(decCulm);
    }

    // 5. Muros perimetrales para delimitar el mapa interior
    const perimHalf = (N * cellSize) / 2 + cellSize;
    const perimMinZ = offsetZ - cellSize;
    const perimMaxZ = offsetZ + N * cellSize + cellSize;
    colliders.push(
      { type: 'box', minX: -perimHalf - 10, maxX: -perimHalf, minZ: perimMinZ, maxZ: perimMaxZ },
      { type: 'box', minX: perimHalf, maxX: perimHalf + 10, minZ: perimMinZ, maxZ: perimMaxZ },
      { type: 'box', minX: -perimHalf, maxX: perimHalf, minZ: perimMaxZ, maxZ: perimMaxZ + 10 }
    );

    // 6. Lista de posiciones locales de monstruos dentro de la instancia
    const spawnsMonstruos = [];
    const listaMon = lab.monstruosPorCelda || [];
    listaMon.forEach(cm => {
      const lx = (cm.gx - halfN) * cellSize + (cm.offX || 0);
      const lz = (cm.gy - entrada.gy) * cellSize + (cm.offZ || 0);
      spawnsMonstruos.push(Object.assign({}, cm, {
        x: lx,
        y: 0,
        z: lz
      }));
    });

    return {
      grupo,
      colliders,
      spawnsMonstruos,
      spawnHeroe: { x: 0, y: 0, z: -92 }, // Al inicio del estrechamiento de 100m mirando al laberinto
      portalSalida: { x: 0, y: 0, z: -100 },
      lab
    };
  }

  /**
   * Construye la entrada exterior con el estrechamiento de 100 metros en el mundo abierto.
   */
  function crearEntradaExterior100m(THREE, zona, Hgen) {
    if (!THREE || !zona) return null;
    const lab = obtenerDatosLaberinto(zona);
    if (!lab) return null;

    const grupo = new THREE.Group();
    grupo.name = 'EntradaExteriorLaberinto_' + zona.id;

    const estilo = lab.estilo || 'roca_canion';
    const est = ESTILOS[estilo] || ESTILOS.roca_canion;
    const colP = lab.wallColor || est.hex || '#78716c';

    // Orientación: ángulo hacia el centro del laberinto desde la entrada
    const ent = (lab.entradas && lab.entradas[0]) || lab.entrada || { wx: zona.x, wz: zona.y };
    const dx = zona.x - ent.wx;
    const dz = (zona.y !== undefined ? zona.y : zona.z) - ent.wz;
    const ang = Math.atan2(dx, dz); // Rumbo de avance por el estrechamiento hacia el portal

    const ey = Hgen ? Hgen(ent.wx, ent.wz) : 0;
    grupo.position.set(ent.wx, ey, ent.wz);
    grupo.rotation.y = ang;

    // Estrechamiento de 100m exterior (de z = -100 a z = 0, donde z = 0 es el portal)
    const largo = 100;
    const anchoPaso = 12;
    const grosorMuro = 4;
    const hMuro = 14;

    // Muros laterales del estrechamiento exterior
    const geoMuro = new THREE.BoxGeometry(grosorMuro, hMuro, largo);
    const texMuro = createProceduralWallTexture(THREE, estilo, colP);
    const matMuro = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colP),
      roughness: 0.85,
      metalness: 0.1,
      map: texMuro || undefined
    });

    const mIzq = new THREE.Mesh(geoMuro, matMuro);
    mIzq.position.set(-(anchoPaso / 2 + grosorMuro / 2), hMuro / 2, -largo / 2);
    mIzq.castShadow = true;
    mIzq.receiveShadow = true;
    grupo.add(mIzq);

    const mDer = new THREE.Mesh(geoMuro, matMuro);
    mDer.position.set(anchoPaso / 2 + grosorMuro / 2, hMuro / 2, -largo / 2);
    mDer.castShadow = true;
    mDer.receiveShadow = true;
    grupo.add(mDer);

    // Faroles cada 25m
    const matSop = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const matFuego = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const geoSop = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 6);
    const geoLlam = new THREE.ConeGeometry(0.2, 0.5, 6);

    [-75, -50, -25].forEach(zPos => {
      [-anchoPaso / 2 + 0.3, anchoPaso / 2 - 0.3].forEach((xPos, idx) => {
        const farol = new THREE.Group();
        farol.position.set(xPos, 4.2, zPos);
        if (idx === 1) farol.rotation.y = Math.PI;
        farol.add(new THREE.Mesh(geoSop, matSop));
        const fl = new THREE.Mesh(geoLlam, matFuego);
        fl.position.set(0.3, 0.35, 0);
        farol.add(fl);
        const lt = new THREE.PointLight(0xf59e0b, 1.2, 18, 1.4);
        lt.position.set(0.3, 0.4, 0);
        farol.add(lt);
        grupo.add(farol);
      });
    });

    // Portal Archway al final del estrechamiento (z = 0)
    const portalGroup = new THREE.Group();
    portalGroup.position.set(0, 0, 0);

    const matPilar = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const colPilar = new THREE.CylinderGeometry(0.9, 1.1, 9, 8);
    const p1 = new THREE.Mesh(colPilar, matPilar);
    p1.position.set(-anchoPaso / 2 + 0.6, 4.5, 0);
    p1.castShadow = true;
    const p2 = p1.clone();
    p2.position.x = anchoPaso / 2 - 0.6;

    const dintel = new THREE.Mesh(new THREE.BoxGeometry(anchoPaso + 2, 1.5, 2.2), matPilar);
    dintel.position.set(0, 9.2, 0);
    dintel.castShadow = true;

    const gema = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    gema.position.set(0, 8.5, 0);

    const luzPortal = new THREE.PointLight(0x10b981, 2.8, 26);
    luzPortal.position.set(0, 5, 0);

    // Haz de luz vertical visible desde lejos en el mapa
    const hazGeo = new THREE.CylinderGeometry(0.35, 0.7, 45, 10);
    hazGeo.translate(0, 22.5, 0);
    const hazMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const haz = new THREE.Mesh(hazGeo, hazMat);
    portalGroup.add(haz);

    // Vórtice de entrada
    const vortice = new THREE.Mesh(
      new THREE.PlaneGeometry(anchoPaso - 2, 8),
      new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
    );
    vortice.position.set(0, 4.2, 0);

    portalGroup.add(p1, p2, dintel, gema, luzPortal, vortice);
    grupo.add(portalGroup);

    // Rango de niveles para la etiqueta
    let lvlMin = 999, lvlMax = 1;
    (zona.monsters || []).forEach(m => {
      const mn = m.level || m.levelMin || 10;
      const mx = m.levelMax || mn;
      if (mn < lvlMin) lvlMin = mn;
      if (mx > lvlMax) lvlMax = mx;
    });
    if (lvlMin > lvlMax) { lvlMin = 10; lvlMax = 15; }

    return {
      grupo,
      portalWx: ent.wx,
      portalWz: ent.wz,
      portalWy: ey,
      zona,
      lvlMin,
      lvlMax,
      ang
    };
  }

  function obtenerMonstruosPorCelda(zona) {
    const lab = obtenerDatosLaberinto(zona);
    return lab ? lab.monstruosPorCelda : [];
  }

  const RelieveZonaLib = {
    ESTILOS,
    CULMINACIONES,
    PATRONES_MONSTRUOS_DEFECTO,
    configPorDefecto,
    zonaTieneLaberinto,
    zonaTieneRelieve: zonaTieneLaberinto,
    generarLaberinto,
    obtenerDatosLaberinto,
    obtenerMonstruosPorCelda,
    obtenerLaberintoEnPunto,
    obtenerRelieveZona: obtenerLaberintoEnPunto,
    aplicarRelieveTerreno,
    esCamino,
    splatZona,
    dibujarLaberinto2D,
    createProceduralWallTexture,
    createProceduralFloorTexture,
    crearArcoEntrada,
    crearEstrechamiento100m,
    crearInstanciaLaberinto,
    crearEntradaExterior100m,
    crearMallaMurosLaberinto,
    crearMallaLaberinto,
    crearDecoradoCulminacion
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = RelieveZonaLib;
  }
  if (root) {
    root.RelieveZonaLib = RelieveZonaLib;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
