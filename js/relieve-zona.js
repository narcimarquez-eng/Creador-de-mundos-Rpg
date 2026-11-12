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

    // Orientación de la entrada única y vectores del estrechamiento de 100m
    const entradaPrincipal = labEntradas[0] || { dir: 'sur', wx: zx, wz: zz + R };
    let thetaEnt = Math.PI / 2; // Por defecto 'sur' (+Z)
    if (entradaPrincipal.dir === 'norte') thetaEnt = -Math.PI / 2;
    else if (entradaPrincipal.dir === 'este') thetaEnt = 0;
    else if (entradaPrincipal.dir === 'oeste') thetaEnt = Math.PI;
    thetaEnt += rotRad;

    const P_perim = {
      wx: zx + R * Math.cos(thetaEnt),
      wz: zz + R * Math.sin(thetaEnt)
    };
    const P_ext = {
      wx: zx + (R + 100) * Math.cos(thetaEnt),
      wz: zz + (R + 100) * Math.sin(thetaEnt)
    };
    const u_in = {
      x: -Math.cos(thetaEnt),
      y: -Math.sin(thetaEnt)
    };
    const v_lat = {
      x: -Math.sin(thetaEnt),
      y: Math.cos(thetaEnt)
    };

    labDatos.theta_ent = thetaEnt;
    labDatos.P_perim = P_perim;
    labDatos.P_ext = P_ext;
    labDatos.u_in = u_in;
    labDatos.v_lat = v_lat;

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
    const fueraGrid = (gx < 0 || gx >= lab.N || gy < 0 || gy >= lab.N);
    const valorCelda = fueraGrid ? 2 : lab.grid[gy][gx];
    if (fueraGrid || valorCelda === 2) {
      if (lab.P_ext && lab.u_in && lab.v_lat) {
        const prog = calcularProgresoCorredor(lab, x, z);
        if (prog.enCorredor) {
          return {
            splat: [0.04, 0.88, 0.08, 0],
            snow: 0
          };
        }
      }
      return splatBase;
    }

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
   * Calcula el progreso del personaje a lo largo del estrechamiento de 100 metros.
   * s = 0m en la entrada exterior del desfiladero, s = 50m a la mitad exacta, s = 100m al entrar al laberinto.
   */
  function calcularProgresoCorredor(lab, px, pz) {
    if (!lab || !lab.P_ext || !lab.u_in || !lab.v_lat) {
      return { s: -999, w: 999, enCorredor: false, enInterior: false, mitadCruzada: false };
    }
    const dx = px - lab.P_ext.wx;
    const dz = pz - lab.P_ext.wz;
    const s = dx * lab.u_in.x + dz * lab.u_in.y;
    const w = dx * lab.v_lat.x + dz * lab.v_lat.y;
    const dCentro = Math.hypot(px - lab.zx, pz - lab.zz);
    const R = lab.R || 120;
    const enCorredor = (s >= -10 && s <= 110 && Math.abs(w) <= 9.0);
    const enInterior = (dCentro <= R + 3);
    return {
      s,
      w,
      enCorredor,
      enInterior,
      mitadCruzada: s >= 50
    };
  }

  /**
   * Muro perimetral circular continuo que cerca todo el laberinto excepto en la entrada única de 12m.
   * Compuesto por bloques de diferentes tonos y colores armónicos según el estilo.
   */
  function crearMuroPerimetralCircular(THREE, zx, zz, baseH, R, thetaEnt, estilo, colorPared, N_seg = 64) {
    if (!THREE) return null;
    const grupo = new THREE.Group();
    grupo.name = 'MuroPerimetralCircular';
    const colliders = [];

    const hMuro = 14;
    const grosorMuro = 4.2;
    const dPhi = (2 * Math.PI) / N_seg;
    const arcLen = (2 * Math.PI * R / N_seg) * 1.05;
    const openingAngle = Math.max(0.12, 7.5 / R);

    // Paleta de variaciones armónicas de tonos para "muros de diferente colores"
    const baseColor = new THREE.Color(colorPared || '#78716c');
    const hsl = { h: 0, s: 0, l: 0 };
    baseColor.getHSL(hsl);
    const mats = [];
    const numTones = 6;
    for (let t = 0; t < numTones; t++) {
      const col = new THREE.Color().setHSL(
        (hsl.h + (t * 0.05) - 0.12 + 1) % 1,
        Math.min(1, Math.max(0.15, hsl.s + (t % 2 === 0 ? 0.12 : -0.08))),
        Math.min(0.85, Math.max(0.2, hsl.l + (t * 0.06 - 0.15)))
      );
      mats.push(new THREE.MeshStandardMaterial({
        color: col,
        roughness: 0.82,
        metalness: 0.12
      }));
    }

    const boxGeo = new THREE.BoxGeometry(arcLen, hMuro, grosorMuro);

    for (let i = 0; i < N_seg; i++) {
      const phi = i * dPhi;
      const dAng = Math.abs(Math.atan2(Math.sin(phi - thetaEnt), Math.cos(phi - thetaEnt)));
      if (dAng < openingAngle) {
        continue; // Apertura transitable de 12m donde conecta el estrechamiento de 100m
      }

      const bx = zx + R * Math.cos(phi);
      const bz = zz + R * Math.sin(phi);
      const by = baseH + hMuro / 2;

      const mat = mats[i % mats.length];
      const mesh = new THREE.Mesh(boxGeo, mat);
      mesh.position.set(bx, by, bz);
      mesh.rotation.y = -(phi - Math.PI / 2);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      grupo.add(mesh);

      // Colisionador OBB
      colliders.push({
        type: 'obb',
        cx: bx,
        cz: bz,
        ux: -Math.sin(phi),
        uz: Math.cos(phi),
        hu: arcLen / 2,
        hv: grosorMuro / 2
      });
    }

    return { grupo, colliders };
  }

  /**
   * Crea el estrechamiento de 100 metros en coordenadas del mundo desde P_ext hasta P_perim.
   * Sin ningún bloqueador, 100% transitable de un extremo al otro.
   */
  function crearEstrechamiento100mMundo(THREE, P_ext, P_perim, baseH, thetaEnt, estilo, colorPared, colorSuelo) {
    if (!THREE) return null;
    const grupo = new THREE.Group();
    grupo.name = 'Estrechamiento100mMundo';

    const est = ESTILOS[estilo] || ESTILOS.roca_canion;
    const colP = colorPared || est.hex || '#78716c';
    const colS = colorSuelo || '#57534e';

    const hMuro = 14;
    const anchoPaso = 12; // 12 metros de paso libre
    const grosorMuro = 4;
    const largo = Math.hypot(P_perim.wx - P_ext.wx, P_perim.wz - P_ext.wz) || 100;

    const u_in = {
      x: (P_perim.wx - P_ext.wx) / largo,
      y: (P_perim.wz - P_ext.wz) / largo
    };
    const v_lat = {
      x: -u_in.y,
      y: u_in.x
    };

    const cx = (P_ext.wx + P_perim.wx) / 2;
    const cz = (P_ext.wz + P_perim.wz) / 2;
    const ang = Math.atan2(u_in.x, u_in.y);

    // 1. Suelo del desfiladero (100m, ancho 12m)
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
    suelo.position.set(cx, baseH + 0.03, cz);
    suelo.rotation.y = -ang + Math.PI;
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

    const offWall = anchoPaso / 2 + grosorMuro / 2;
    const lx = cx - offWall * v_lat.x;
    const lz = cz - offWall * v_lat.y;
    const rx = cx + offWall * v_lat.x;
    const rz = cz + offWall * v_lat.y;

    const muroIzq = new THREE.Mesh(geoMuro, matMuro);
    muroIzq.position.set(lx, baseH + hMuro / 2, lz);
    muroIzq.rotation.y = -ang + Math.PI;
    muroIzq.castShadow = true;
    muroIzq.receiveShadow = true;
    grupo.add(muroIzq);

    const muroDer = new THREE.Mesh(geoMuro, matMuro);
    muroDer.position.set(rx, baseH + hMuro / 2, rz);
    muroDer.rotation.y = -ang + Math.PI;
    muroDer.castShadow = true;
    muroDer.receiveShadow = true;
    grupo.add(muroDer);

    // 3. Antorchas a lo largo del estrechamiento cada 20m
    const matSop = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const matFuego = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const geoSop = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 6);
    const geoLlam = new THREE.ConeGeometry(0.2, 0.5, 6);

    [-35, -15, 15, 35].forEach(tOff => {
      const ax = cx + tOff * u_in.x;
      const az = cz + tOff * u_in.y;

      // Antorcha izquierda
      const antI = new THREE.Group();
      antI.position.set(ax - (anchoPaso / 2 - 0.25) * v_lat.x, baseH + 4.2, az - (anchoPaso / 2 - 0.25) * v_lat.y);
      antI.rotation.y = -ang + Math.PI;
      antI.add(new THREE.Mesh(geoSop, matSop));
      const flI = new THREE.Mesh(geoLlam, matFuego);
      flI.position.set(0.3, 0.35, 0);
      antI.add(flI);
      const ltI = new THREE.PointLight(0xf59e0b, 1.4, 22, 1.4);
      ltI.position.set(0.3, 0.4, 0);
      antI.add(ltI);
      grupo.add(antI);

      // Antorcha derecha
      const antD = new THREE.Group();
      antD.position.set(ax + (anchoPaso / 2 - 0.25) * v_lat.x, baseH + 4.2, az + (anchoPaso / 2 - 0.25) * v_lat.y);
      antD.rotation.y = -ang;
      antD.add(new THREE.Mesh(geoSop, matSop));
      const flD = new THREE.Mesh(geoLlam, matFuego);
      flD.position.set(0.3, 0.35, 0);
      antD.add(flD);
      const ltD = new THREE.PointLight(0xf59e0b, 1.4, 22, 1.4);
      ltD.position.set(0.3, 0.4, 0);
      antD.add(ltD);
      grupo.add(antD);
    });

    // 4. Arco monumental exterior en P_ext (abierto y transitable, sin vortex bloqueador)
    const archGroup = new THREE.Group();
    archGroup.position.set(P_ext.wx, baseH, P_ext.wz);
    archGroup.rotation.y = -ang + Math.PI;

    const matPilar = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const colPilar = new THREE.CylinderGeometry(0.9, 1.1, 9, 8);
    const p1 = new THREE.Mesh(colPilar, matPilar);
    p1.position.set(-anchoPaso / 2 + 0.6, 4.5, 0);
    p1.castShadow = true;
    const p2 = new THREE.Mesh(colPilar, matPilar);
    p2.position.set(anchoPaso / 2 - 0.6, 4.5, 0);
    p2.castShadow = true;

    const dintel = new THREE.Mesh(new THREE.BoxGeometry(anchoPaso + 2, 1.5, 2.2), matPilar);
    dintel.position.set(0, 9.2, 0);
    dintel.castShadow = true;

    const gema = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    gema.position.set(0, 8.5, 0);

    const luzPortal = new THREE.PointLight(0x10b981, 2.5, 24);
    luzPortal.position.set(0, 5, 0);

    archGroup.add(p1, p2, dintel, gema, luzPortal);
    grupo.add(archGroup);

    return {
      grupo,
      colliders: [
        { type: 'obb', cx: lx, cz: lz, ux: u_in.x, uz: u_in.y, hu: largo / 2, hv: grosorMuro / 2 },
        { type: 'obb', cx: rx, cz: rz, ux: u_in.x, uz: u_in.y, hu: largo / 2, hv: grosorMuro / 2 }
      ],
      largo,
      anchoPaso
    };
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

    // 4. Portal Archway al inicio (z = -100) - abierto sin vortex bloqueador
    const portalGroup = new THREE.Group();
    portalGroup.position.set(0, 0, -100);

    const matPilar = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const matGema = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const colPilar = new THREE.CylinderGeometry(0.9, 1.1, 9, 8);
    const p1 = new THREE.Mesh(colPilar, matPilar);
    p1.position.set(-anchoPaso / 2 + 0.6, 4.5, 0);
    p1.castShadow = true;
    const p2 = new THREE.Mesh(colPilar, matPilar);
    p2.position.set(anchoPaso / 2 - 0.6, 4.5, 0);
    p2.castShadow = true;

    const dintel = new THREE.Mesh(new THREE.BoxGeometry(anchoPaso + 2, 1.5, 2.2), matPilar);
    dintel.position.set(0, 9.2, 0);
    dintel.castShadow = true;

    const gema = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), matGema);
    gema.position.set(0, 8.5, 0);

    const luzPortal = new THREE.PointLight(0x10b981, 2.5, 24);
    luzPortal.position.set(0, 5, 0);

    portalGroup.add(p1, p2, dintel, gema, luzPortal);
    grupo.add(portalGroup);

    return {
      grupo,
      colliders: [
        { type: 'box', minX: -(anchoPaso / 2 + grosorMuro), maxX: -anchoPaso / 2, minZ: -largo, maxZ: 0 },
        { type: 'box', minX: anchoPaso / 2, maxX: anchoPaso / 2 + grosorMuro, minZ: -largo, maxZ: 0 }
      ],
      largo,
      anchoPaso
    };
  }

  /**
   * Construye la instancia interior independiente del laberinto en coordenadas de mundo
   * (terraza plana a baseH, estrechamiento de 100m, muro perimetral circular de diferente colores,
   * muros 3D del laberinto, culminación, colisionadores y posiciones de monstruos).
   */
  function crearInstanciaLaberinto(THREE, zona, Hgen) {
    if (!THREE || !zona) return null;
    const lab = obtenerDatosLaberinto(zona);
    if (!lab) return null;

    const grupo = new THREE.Group();
    grupo.name = 'InstanciaLaberinto_' + zona.id;

    const estilo = lab.estilo || 'roca_canion';
    const est = ESTILOS[estilo] || ESTILOS.roca_canion;
    const colP = lab.wallColor || est.hex || '#78716c';
    const colS = lab.groundColor || '#57534e';
    const { zx, zz, R, N, grid, cellSize, alturaMuro, centro, P_perim, P_ext, theta_ent } = lab;
    const baseH = Hgen ? Hgen(zx, zz) : 0;
    const colliders = [];

    // 1. Suelo del laberinto (círculo de radio R nivelado horizontalmente a baseH)
    const geoSuelo = new THREE.CircleGeometry(R + 4, 64);
    geoSuelo.rotateX(-Math.PI / 2);
    const texSuelo = createProceduralFloorTexture(THREE, estilo, colS);
    const matSuelo = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colS),
      roughness: 0.85,
      metalness: 0.05,
      map: texSuelo || undefined
    });
    const sueloLab = new THREE.Mesh(geoSuelo, matSuelo);
    sueloLab.position.set(zx, baseH + 0.02, zz);
    sueloLab.receiveShadow = true;
    grupo.add(sueloLab);

    // 2. Estrechamiento de 100 metros en coordenadas de mundo
    const estr = crearEstrechamiento100mMundo(THREE, P_ext, P_perim, baseH, theta_ent, estilo, colP, colS);
    if (estr) {
      grupo.add(estr.grupo);
      colliders.push(...estr.colliders);
    }

    // 3. Muro perimetral circular de diferente colores con apertura exclusiva en la entrada
    const perim = crearMuroPerimetralCircular(THREE, zx, zz, baseH, R, theta_ent, estilo, colP);
    if (perim) {
      grupo.add(perim.grupo);
      colliders.push(...perim.colliders);
    }

    // 4. Muros 3D interiores del laberinto (InstancedMesh en coordenadas de mundo)
    const { muros } = lab;
    if (muros && muros.length > 0) {
      const hMuro3D = Math.max(3.5, alturaMuro || 14);
      const boxG = new THREE.BoxGeometry(cellSize * 0.98, hMuro3D, cellSize * 0.98);
      const texMuro = createProceduralWallTexture(THREE, estilo, colP);
      const matMuro = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colP),
        roughness: 0.8,
        metalness: 0.1,
        map: texMuro || undefined
      });
      const wallsMesh = new THREE.InstancedMesh(boxG, matMuro, muros.length);
      wallsMesh.castShadow = true;
      wallsMesh.receiveShadow = true;
      const dummyMat = new THREE.Matrix4();
      const dummyPos = new THREE.Vector3();
      const dummyQuat = new THREE.Quaternion();
      const dummyScale = new THREE.Vector3(1, 1, 1);
      if (lab.rotRad) {
        dummyQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -lab.rotRad);
      }

      muros.forEach((m, idx) => {
        dummyPos.set(m.wx, baseH + hMuro3D / 2, m.wz);
        dummyMat.compose(dummyPos, dummyQuat, dummyScale);
        wallsMesh.setMatrixAt(idx, dummyMat);
      });
      wallsMesh.instanceMatrix.needsUpdate = true;
      grupo.add(wallsMesh);

      // Colisionadores de los muros interiores
      colliders.push(...lab.colliders);
    }

    // 5. Culminación en el centro
    const decCulm = crearDecoradoCulminacion(THREE, zona, () => baseH);
    if (decCulm) {
      decCulm.position.set(centro.wx, baseH, centro.wz);
      grupo.add(decCulm);
    }

    // 6. Lista de posiciones de monstruos en coordenadas reales de mundo
    const spawnsMonstruos = (lab.monstruosPorCelda || []).map(cm => Object.assign({}, cm, {
      x: cm.wx,
      y: baseH,
      z: cm.wz
    }));

    return {
      grupo,
      colliders,
      spawnsMonstruos,
      spawnHeroe: { x: P_ext.wx + lab.u_in.x * 6, y: baseH, z: P_ext.wz + lab.u_in.y * 6 },
      baseH,
      zx,
      zz,
      R,
      P_ext,
      P_perim,
      u_in: lab.u_in,
      v_lat: lab.v_lat,
      theta_ent,
      calcularProgreso: (px, pz) => calcularProgresoCorredor(lab, px, pz),
      lab
    };
  }

  /**
   * Construye la representación exterior del laberinto en el mundo abierto:
   * pasillo de 100m con antorchas, muro perimetral circular de diferente colores,
   * muros interiores sobre la terraza del terreno y culminación central.
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
    const colS = lab.groundColor || '#57534e';
    const { zx, zz, R, P_perim, P_ext, theta_ent, muros, centro, cellSize, alturaMuro } = lab;
    const baseH = Hgen ? Hgen(zx, zz) : 0;

    // 1. Estrechamiento de 100m exterior
    const estr = crearEstrechamiento100mMundo(THREE, P_ext, P_perim, baseH, theta_ent, estilo, colP, colS);
    if (estr) grupo.add(estr.grupo);

    // 2. Muro perimetral circular exterior de diferente colores
    const perim = crearMuroPerimetralCircular(THREE, zx, zz, baseH, R, theta_ent, estilo, colP);
    if (perim) grupo.add(perim.grupo);

    // 3. Muros interiores visibles desde la vista general / exterior sobre la terraza
    if (muros && muros.length > 0) {
      const hMuro3D = Math.max(3.5, alturaMuro || 14);
      const boxG = new THREE.BoxGeometry(cellSize * 0.98, hMuro3D, cellSize * 0.98);
      const texMuro = createProceduralWallTexture(THREE, estilo, colP);
      const matMuro = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colP),
        roughness: 0.8,
        metalness: 0.1,
        map: texMuro || undefined
      });
      const wallsMesh = new THREE.InstancedMesh(boxG, matMuro, muros.length);
      wallsMesh.castShadow = true;
      wallsMesh.receiveShadow = true;

      const dummyMat = new THREE.Matrix4();
      const dummyPos = new THREE.Vector3();
      const dummyQuat = new THREE.Quaternion();
      const dummyScale = new THREE.Vector3(1, 1, 1);
      if (lab.rotRad) {
        dummyQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -lab.rotRad);
      }

      muros.forEach((m, idx) => {
        dummyPos.set(m.wx, baseH + hMuro3D / 2, m.wz);
        dummyMat.compose(dummyPos, dummyQuat, dummyScale);
        wallsMesh.setMatrixAt(idx, dummyMat);
      });
      wallsMesh.instanceMatrix.needsUpdate = true;
      grupo.add(wallsMesh);
    }

    // 4. Culminación central
    const decCulm = crearDecoradoCulminacion(THREE, zona, () => baseH);
    if (decCulm) {
      decCulm.position.set(centro.wx, baseH, centro.wz);
      grupo.add(decCulm);
    }

    return grupo;
  }

  /* ===========================================================================
   * RECINTO: zona aislada con UNA sola entrada (anillo de roca + pasillo ancho)
   * ---------------------------------------------------------------------------
   * El laberinto queda encerrado por un anillo de roca esculpido en el propio
   * terreno del mundo (mismo material, misma luz). Se entra por un único pasillo
   * ancho en zigzag que sale del mundo exterior:
   *
   *   mundo ─ Q4 ══boca══ Q3 ══tramo A══ Q2
   *                                       ║ tramo B (pasillo compartido: sus dos
   *                                       ║ extremos giran 90°, desde su mitad no
   *                                       ║ se ve ni el exterior ni el interior)
   *            anillo ══tramo C══════════ Q1
   *   laberinto Q0 (celda de entrada)
   *
   * El terreno del mundo (Hgen) y la malla detallada del interior usan la MISMA
   * función de altura (alturaRecinto), así que donde se juntan coinciden. El
   * cambio exterior ↔ interior se hace en la mitad del tramo B, donde nada de lo
   * que cambia es visible: el jugador no nota que entra ni que sale.
   * =========================================================================== */
  const RECINTO_DEFECTO = {
    anchoPasillo: 18,     // paso libre del pasillo (m)
    alturaAnillo: 30,     // altura del anillo y de las crestas sobre el suelo (m)
    anchoAnillo: 30,      // grosor de la cumbre del anillo (m)
    faldonAnillo: 46,     // ladera exterior del anillo hasta el terreno natural (m)
    grosorCresta: 18,     // cumbre de las crestas que flanquean el pasillo (m)
    faldonCresta: 34,     // ladera exterior de las crestas (m)
    margenSuelo: 4,       // suelo llano entre el laberinto y el pie del anillo (m)
    tramoA: 38,           // tramo exterior (radial) del pasillo
    tramoB: 64,           // tramo compartido (tangencial) del pasillo
    tramoC: 16,           // tramo que cruza el anillo hasta el laberinto (fuera del anillo)
    boca: 26,             // abertura donde las crestas nacen del terreno exterior
    histeresis: 3         // metros a cada lado de la mitad del tramo B para cambiar de estado
  };

  // Ruido de valor determinista (0..1), suave, sin dependencias
  function hash2(ix, iz) {
    let h = (ix * 374761393 + iz * 668265263) | 0;
    h = (h ^ (h >>> 13)) * 1274126177 | 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  function ruidoValor(x, z) {
    const ix = Math.floor(x), iz = Math.floor(z);
    let fx = x - ix, fz = z - iz;
    fx = fx * fx * (3 - 2 * fx);
    fz = fz * fz * (3 - 2 * fz);
    const a = hash2(ix, iz), b = hash2(ix + 1, iz), c = hash2(ix, iz + 1), d = hash2(ix + 1, iz + 1);
    return (a + (b - a) * fx) + ((c + (d - c) * fx) - (a + (b - a) * fx)) * fz;
  }
  function ruidoFbm(x, z) {
    return ruidoValor(x, z) * 0.62 + ruidoValor(x * 2.13 + 17.1, z * 2.13 - 5.3) * 0.38;
  }

  /**
   * Geometría del recinto de una zona con laberinto. alturaBase(x, z) es la altura del
   * terreno del mundo SIN el recinto (para la cota del suelo y de la boca del pasillo).
   * Se guarda en la caché del laberinto: si cambia la configuración, se rehace.
   */
  function obtenerRecinto(zona, alturaBase) {
    const lab = obtenerDatosLaberinto(zona);
    if (!lab) return null;
    const r = zona.relieve || {};
    const claveCfg = JSON.stringify(r.recinto || {});
    if (lab._recinto && lab._recinto._clave === claveCfg && (!alturaBase || lab._recinto._alturaBase === alturaBase)) return lab._recinto;

    const cfg = Object.assign({}, RECINTO_DEFECTO, (r.recinto && typeof r.recinto === 'object') ? r.recinto : {});
    const { zx, zz, R } = lab;
    const hB = typeof alturaBase === 'function' ? alturaBase : null;
    // Cota del suelo del recinto: nunca bajo el agua (el personaje no pisa por debajo de 0,2 m)
    const baseH = Math.max(1.5, hB ? hB(zx, zz) : 0);

    const th = lab.theta_ent;
    const uo = { x: Math.cos(th), z: Math.sin(th) };   // hacia fuera por la entrada
    const vl = { x: -Math.sin(th), z: Math.cos(th) };   // lateral
    const ladoFijo = (r.recinto && (r.recinto.lado === -1 || r.recinto.lado === 1)) ? r.recinto.lado : 0;
    let lado = ladoFijo || ((lab.seed & 1) ? 1 : -1);

    const Rint = R + cfg.margenSuelo;           // fin del suelo del laberinto
    const RtopIn = Rint + 7;                    // cara interior del anillo ya en cumbre
    const Rout = Rint + cfg.anchoAnillo;        // fin de la cumbre
    const Rfin = Rout + cfg.faldonAnillo;       // terreno natural de nuevo
    const Rcorte = Rint + 12;                   // frontera mundo ↔ malla interior (en la cumbre)

    const Q0 = { x: lab.entrada.wx, z: lab.entrada.wz };
    const Q1 = { x: zx + uo.x * (Rout + cfg.tramoC), z: zz + uo.z * (Rout + cfg.tramoC) };
    // El zigzag gira hacia el lado cuya boca queda en tierra firme y con la rampa más suave
    const bocaDe = l => {
      const q2 = { x: Q1.x + vl.x * l * cfg.tramoB, z: Q1.z + vl.z * l * cfg.tramoB };
      const q4 = { x: q2.x + uo.x * (cfg.tramoA + cfg.boca), z: q2.z + uo.z * (cfg.tramoA + cfg.boca) };
      return { q2, q4 };
    };
    if (!ladoFijo && hB) {
      const nota = l => {
        const { q2, q4 } = bocaDe(l);
        let peor = Infinity;
        for (let t = 0; t <= 1.0001; t += 0.125) peor = Math.min(peor, hB(q2.x + (q4.x - q2.x) * t, q2.z + (q4.z - q2.z) * t));
        const hl = hB(q4.x + uo.x * 8, q4.z + uo.z * 8);
        return (Math.min(peor, hl) < 1.2 ? 1000 : 0) + Math.abs(hB(q4.x, q4.z) - baseH);
      };
      if (nota(-lado) < nota(lado)) lado = -lado;
    }
    const { q2: Q2, q4: Q4 } = bocaDe(lado);
    const Q3 = { x: Q2.x + uo.x * cfg.tramoA, z: Q2.z + uo.z * cfg.tramoA };

    // Polilínea del eje del pasillo desde el mundo (s = 0) hasta el laberinto
    const pts = [Q4, Q3, Q2, Q1, Q0];
    const segs = [];
    let sAcc = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const dx = b.x - a.x, dz = b.z - a.z;
      const len = Math.hypot(dx, dz) || 1;
      segs.push({ ax: a.x, az: a.z, dx, dz, len, len2: len * len, s0: sAcc });
      sAcc += len;
    }
    const sQ3 = segs[1].s0, sQ2 = segs[2].s0, sQ1 = segs[3].s0;
    const sMitadB = (sQ2 + sQ1) / 2;
    const hBoca = hB ? hB(Q4.x, Q4.z) : baseH;

    // Radio que encierra todo lo que el recinto modifica
    const extCresta = cfg.anchoPasillo / 2 + cfg.grosorCresta + cfg.faldonCresta;
    let rMax = Rfin;
    pts.forEach(p => { rMax = Math.max(rMax, Math.hypot(p.x - zx, p.z - zz) + extCresta); });

    const rec = {
      zona, lab, cfg, zx, zz, R, baseH, lado,
      Rint, RtopIn, Rout, Rfin, Rcorte, rMax, rMax2: rMax * rMax,
      Q0, Q1, Q2, Q3, Q4, puntos: pts, segs, largo: sAcc,
      sQ3, sQ2, sQ1, sMitadB, hBoca,
      u_out: uo, u_in: { x: -uo.x, z: -uo.z }, v_lat: vl,
      // Punto seguro de llegada (fuera, delante de la boca, mirando al pasillo)
      llegada: { x: Q4.x + uo.x * 8, z: Q4.z + uo.z * 8, mirar: Math.atan2(-uo.x, -uo.z) },
      _alturaBase: alturaBase,
      _clave: claveCfg
    };
    rec.problema = validarRecinto(rec, hB);
    lab._recinto = rec;
    return rec;
  }

  /**
   * ¿Se puede usar este recinto en este terreno? Devuelve null si sí, o el motivo si no:
   * boca o pasillo bajo el agua, o rampa de entrada demasiado empinada (> 45 %).
   */
  function validarRecinto(rec, alturaBase) {
    if (!alturaBase) return null;
    const ll = alturaBase(rec.llegada.x, rec.llegada.z);
    if (ll < 1.2) return 'la boca del pasillo da al agua';
    for (let s = -8; s <= rec.sQ1; s += 4) {
      const g = rec.segs.find(sg => s <= sg.s0 + sg.len) || rec.segs[0];
      const t = (s - g.s0) / g.len;
      const x = g.ax + g.dx * t, z = g.az + g.dz * t;
      if (alturaRecinto(rec, x, z, alturaBase(x, z)) < 0.9) return 'el pasillo queda bajo el agua';
    }
    if (Math.abs(rec.hBoca - rec.baseH) / Math.max(1, rec.sQ2) > 0.45) return 'la rampa de entrada sería demasiado empinada';
    return null;
  }

  /** Punto más cercano del eje del pasillo: distancia lateral dC y avance s (m desde la boca). */
  function ejePasillo(rec, x, z) {
    let mejorD2 = Infinity, mejorS = 0;
    const segs = rec.segs;
    for (let i = 0; i < segs.length; i++) {
      const g = segs[i];
      let t = ((x - g.ax) * g.dx + (z - g.az) * g.dz) / g.len2;
      if (i === 0) t = Math.min(1, t);          // antes de la boca: s negativo (fuera del pasillo)
      else t = Math.max(0, Math.min(1, t));
      if (i === segs.length - 1) t = Math.min(1, t);
      const px = g.ax + g.dx * t, pz = g.az + g.dz * t;
      const d2 = (x - px) * (x - px) + (z - pz) * (z - pz);
      if (d2 < mejorD2) { mejorD2 = d2; mejorS = g.s0 + t * g.len; }
    }
    return { dC: Math.sqrt(mejorD2), s: mejorS };
  }

  /** Altura del laberinto (suelo + muros orgánicos) en (x, z); fuera de la rejilla es roca. */
  function alturaMurosLaberinto(rec, x, z, n) {
    const lab = rec.lab;
    const { N, grid, cellSize, halfN, cosR, sinR, alturaMuro, centro } = lab;
    const dx = x - lab.zx, dz = z - lab.zz;
    // Bamboleo suave de las paredes para que no parezcan una cuadrícula
    const wob = 1.4;
    const ox = (ruidoValor(x * 0.09 + 3.1, z * 0.09) - 0.5) * 2 * wob;
    const oz = (ruidoValor(x * 0.09, z * 0.09 - 7.7) - 0.5) * 2 * wob;
    const lx = (dx + ox) * cosR + (dz + oz) * sinR;
    const lz = -(dx + ox) * sinR + (dz + oz) * cosR;
    const u = lx / cellSize + halfN, v = lz / cellSize + halfN;
    const i = Math.floor(u), j = Math.floor(v);
    const fx = u - i, fy = v - j;
    const W = (gx, gy) => (gx < 0 || gx >= N || gy < 0 || gy >= N || grid[gy][gx] !== 0) ? 1 : 0;
    const w = (1 - fx) * (1 - fy) * W(i, j) + fx * (1 - fy) * W(i + 1, j) + (1 - fx) * fy * W(i, j + 1) + fx * fy * W(i + 1, j + 1);
    let s = smooth(0.34, 0.6, w);
    // Explanada de culminación siempre despejada
    const dCen = Math.hypot(x - centro.wx, z - centro.wz);
    if (dCen < centro.radio) s *= smooth(centro.radio * 0.55, centro.radio, dCen);
    const altM = Math.max(8, typeof alturaMuro === 'number' ? alturaMuro : 14);
    return rec.baseH + s * altM * (0.82 + 0.36 * n);
  }

  /**
   * Altura del terreno con el recinto aplicado. hW es la altura del mundo sin recinto.
   * La usan el terreno del mundo y la malla detallada del interior (misma forma).
   */
  function alturaRecinto(rec, x, z, hW) {
    if (!rec) return hW;
    const dx = x - rec.zx, dz = z - rec.zz;
    const d2 = dx * dx + dz * dz;
    if (d2 > rec.rMax2) return hW;
    const d = Math.sqrt(d2);
    const cfg = rec.cfg;
    const n = ruidoFbm(x * 0.03, z * 0.03);
    const eje = ejePasillo(rec, x, z);

    // 1. Macizo: anillo alrededor del laberinto y crestas a ambos lados del pasillo
    // Perfil de acantilado: el 80 % de la altura cae en ~10 m (no se puede trepar) y el resto es un
    // talud bajo que se funde con el terreno natural
    let m = 0;
    if (d > rec.Rint) {
      const acant = 1 - smooth(rec.Rout, rec.Rout + 10, d);
      const talud = 1 - smooth(rec.Rout, rec.Rfin, d);
      m = smooth(rec.Rint, rec.RtopIn, d) * (0.8 * acant + 0.2 * talud);
    }
    const mitad = cfg.anchoPasillo / 2 + cfg.grosorCresta;
    if (eje.dC < mitad + cfg.faldonCresta && eje.s > 0) {
      const acantC = 1 - smooth(mitad, mitad + 9, eje.dC);
      const taludC = 1 - smooth(mitad, mitad + cfg.faldonCresta, eje.dC);
      const mc = (0.8 * acantC + 0.2 * taludC) * smooth(0, 7, eje.s);
      if (mc > m) m = mc;
    }
    // Pedestal: junto al laberinto el terreno se nivela a la cota de la zona
    const hP = d < rec.Rfin ? rec.baseH + (hW - rec.baseH) * smooth(rec.RtopIn, rec.Rfin, d) : hW;
    const cima = Math.max(rec.baseH, hW) + cfg.alturaAnillo * (0.78 + 0.44 * n);
    let h = hP + (cima - hP) * m;

    // 2. Laberinto dentro del anillo (fuera de la rejilla es roca que se funde con el anillo)
    if (d < rec.RtopIn) {
      const hm = alturaMurosLaberinto(rec, x, z, n);
      h = d < rec.Rint ? hm : Math.max(h, hm);
    }

    // 3. Pasillo: se talla con paredes casi verticales y suelo que baja en rampa hasta la cota del laberinto
    if (eje.s > -12) {
      // Dentro del anillo el pasillo se estrecha al ancho de una celda para no abrir atajos en el laberinto
      const anchoMitad = cfg.anchoPasillo / 2;
      const mitadCelda = Math.min(anchoMitad, rec.lab.cellSize * 0.4);
      const kAncho = smooth(rec.R - rec.lab.cellSize * 0.5, rec.Rint + 6, d);
      const borde = mitadCelda + (anchoMitad - mitadCelda) * kAncho + (ruidoValor(x * 0.11, z * 0.11) - 0.5) * 2.2 * kAncho;
      let corte = 1 - smooth(borde, borde + 3.2, eje.dC);
      if (corte > 0) {
        corte *= smooth(-12, 0, eje.s);
        const rampa = rec.hBoca + (rec.baseH - rec.hBoca) * smooth(0, rec.sQ2, Math.max(0, eje.s));
        const suelo = hW + (rampa - hW) * smooth(0, 10, eje.s);
        h = h + (suelo - h) * corte;
      }
    }
    return h;
  }

  /** Mezcla de texturas del recinto: pasillo de tierra y grava, sendas del laberinto, roca en paredes. */
  function splatRecinto(rec, x, z, steep, h, base) {
    if (!rec) return base;
    const dx = x - rec.zx, dz = z - rec.zz;
    if (dx * dx + dz * dz > rec.rMax2) return base;
    const relH = h - rec.baseH;
    const eje = ejePasillo(rec, x, z);
    const n = ruidoValor(x * 0.07, z * 0.07);
    if (eje.s > 0 && eje.dC < rec.cfg.anchoPasillo / 2 + 1 && steep < 0.35) {
      const k = smooth(0, 14, eje.s);
      const pas = [0.10 + 0.12 * n, 0.70 - 0.1 * n, 0.20, 0];
      return { splat: base.splat.map((v, i) => v * (1 - k) + pas[i] * k), snow: base.snow * (1 - k) };
    }
    const d = Math.sqrt(dx * dx + dz * dz);
    if (d < rec.Rint) {
      if (steep > 0.45 || relH > 1.6) return { splat: [0.03, 0.05, 0.92, 0], snow: base.snow * 0.3 };
      const c = rec.lab.centro;
      if (Math.hypot(x - c.wx, z - c.wz) < c.radio * 0.8) {
        const cu = rec.lab.culminacion;
        if (cu === 'oasis') return { splat: [0.62, 0.1, 0.03, 0.25], snow: 0 };
        if (cu === 'jefe') return { splat: [0, 0.25, 0.75, 0], snow: 0 };
        return { splat: [0.08, 0.32, 0.6, 0], snow: 0 };
      }
      // Senda: tierra pisada en el centro y hierba hacia el pie de los muros
      const g = 0.18 + 0.5 * smooth(0.15, 1.4, relH) * (0.6 + 0.4 * n);
      return { splat: [g, 1 - g - 0.08, 0.08, 0], snow: base.snow * 0.5 };
    }
    return base;
  }

  /**
   * ¿Impide el recinto subir de (ox, oz) a (x, z)? Bloquea pisar laderas de más de 45° de gradiente
   * real (no solo en la dirección del paso), así nadie trepa las paredes en diagonal ni sale por arriba.
   * alturaEn(x, z) es la altura que pisa el personaje.
   */
  function bloqueaSubidaRecinto(rec, ox, oz, x, z, alturaEn, gradMax = 0.9) {
    if (!rec) return false;
    const dx = x - rec.zx, dz = z - rec.zz;
    if (dx * dx + dz * dz > rec.rMax2) return false;
    const e = 0.6;
    const gx = (alturaEn(x + e, z) - alturaEn(x - e, z)) / (2 * e);
    const gz = (alturaEn(x, z + e) - alturaEn(x, z - e)) / (2 * e);
    return Math.hypot(gx, gz) > gradMax;
  }

  /** Celda transitable más cercana de la rejilla del laberinto a (x, z), o null. */
  function celdaLibreCercana(lab, x, z) {
    const c = lab.mundoACelda(x, z);
    let mejor = null, md = Infinity;
    for (let r = 0; r <= 2 && !mejor; r++) {
      for (let gy = c.gy - r; gy <= c.gy + r; gy++) {
        for (let gx = c.gx - r; gx <= c.gx + r; gx++) {
          if (gx < 0 || gy < 0 || gx >= lab.N || gy >= lab.N || lab.grid[gy][gx] !== 0) continue;
          const p = lab.celdaAMundo(gx, gy);
          const d = Math.hypot(p.wx - x, p.wz - z);
          if (d < md) { md = d; mejor = { gx, gy }; }
        }
      }
    }
    return mejor;
  }

  /** Centros de celda (en mundo) del camino más corto entre dos celdas libres del laberinto. */
  function caminoCeldas(lab, a, b) {
    if (!a || !b) return [];
    const N = lab.N, prev = new Int32Array(N * N).fill(-1);
    const ini = a.gy * N + a.gx, fin = b.gy * N + b.gx;
    prev[ini] = ini;
    const cola = [ini];
    for (let qi = 0; qi < cola.length; qi++) {
      const k = cola[qi];
      if (k === fin) break;
      const gx = k % N, gy = (k / N) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = gx + dx, ny = gy + dy;
        if (nx < 0 || ny < 0 || nx >= N || ny >= N || lab.grid[ny][nx] !== 0) continue;
        const nk = ny * N + nx;
        if (prev[nk] !== -1) continue;
        prev[nk] = k;
        cola.push(nk);
      }
    }
    if (prev[fin] === -1) return [];
    const out = [];
    for (let k = fin; ; k = prev[k]) {
      const p = lab.celdaAMundo(k % N, (k / N) | 0);
      out.unshift({ x: p.wx, y: p.wz });
      if (k === ini) break;
    }
    return out;
  }

  /**
   * Puntos para ir desde fuera del recinto hasta (hasta.x, hasta.y) dentro de él: boca → pasillo → laberinto.
   * Y al revés con salir = true: desde dentro hasta la llegada exterior.
   */
  function rutaRecinto(rec, punto, salir = false) {
    if (!rec) return [];
    const lab = rec.lab;
    const pasillo = rec.puntos.map(p => ({ x: p.x, y: p.z }));   // Q4 … Q0
    const eje = ejePasillo(rec, punto.x, punto.y);
    const enPasillo = eje.dC < rec.cfg.anchoPasillo / 2 + 2 && Math.hypot(punto.x - rec.zx, punto.y - rec.zz) > rec.Rint;
    let tramoPasillo = pasillo, celdas = [];
    if (enPasillo) {
      // Solo la parte del pasillo que queda entre el punto y la salida (o el laberinto)
      const sPts = rec.segs.map(g => g.s0).concat([rec.largo]);
      tramoPasillo = pasillo.filter((p, i) => salir ? sPts[i] < eje.s : sPts[i] > eje.s);
      if (!salir) tramoPasillo = [];
    } else {
      const ent = celdaLibreCercana(lab, lab.entrada.wx, lab.entrada.wz);
      celdas = caminoCeldas(lab, ent, celdaLibreCercana(lab, punto.x, punto.y));
    }
    const llegada = { x: rec.llegada.x, y: rec.llegada.z };
    if (salir) return celdas.slice().reverse().concat(tramoPasillo.slice().reverse(), [llegada]);
    return [llegada].concat(tramoPasillo, celdas, [{ x: punto.x, y: punto.y }]);
  }

  /**
   * Inserta un rodeo alrededor del macizo en los tramos de una ruta (puntos {x, y}) que lo cruzarían.
   * Los tramos que empiezan o terminan dentro del recinto (los de rutaRecinto) se respetan.
   */
  function rodearRecinto(rec, puntos) {
    if (!rec || !puntos || puntos.length < 2) return puntos;
    const radio = rec.rMax + 8;
    const out = [puntos[0]];
    for (let i = 1; i < puntos.length; i++) {
      const a = puntos[i - 1], b = puntos[i];
      const dentroA = puntoEnRecinto(rec, a.x, a.y, 2), dentroB = puntoEnRecinto(rec, b.x, b.y, 2);
      let cruza = false;
      if (!dentroA && !dentroB) {
        const L = Math.hypot(b.x - a.x, b.y - a.y);
        for (let t = 4; t < L; t += 4) {
          if (puntoEnRecinto(rec, a.x + (b.x - a.x) * t / L, a.y + (b.y - a.y) * t / L, 3)) { cruza = true; break; }
        }
      }
      if (cruza) {
        let a0 = Math.atan2(a.y - rec.zz, a.x - rec.zx), a1 = Math.atan2(b.y - rec.zz, b.x - rec.zx);
        let da = Math.atan2(Math.sin(a1 - a0), Math.cos(a1 - a0));
        const pasos = Math.max(1, Math.ceil(Math.abs(da) / (Math.PI / 12)));
        for (let k = 0; k <= pasos; k++) {
          const ang = a0 + da * k / pasos;
          out.push({ x: rec.zx + Math.cos(ang) * radio, y: rec.zz + Math.sin(ang) * radio });
        }
      }
      out.push(b);
    }
    return out;
  }

  /** ¿Se pisan las huellas (anillo, pasillo y crestas) de dos recintos? */
  function recintosSeSolapan(a, b, margen = 20) {
    if (!a || !b) return false;
    if (Math.hypot(a.zx - b.zx, a.zz - b.zz) > a.rMax + b.rMax + margen) return false;
    if (Math.hypot(a.zx - b.zx, a.zz - b.zz) < a.Rfin + b.Rfin + margen) return true;
    const ancho = rc => rc.cfg.anchoPasillo / 2 + rc.cfg.grosorCresta + rc.cfg.faldonCresta;
    const tocaPasillo = (p, q) => {
      for (let s = 0; s <= p.sQ1; s += 8) {
        const g = p.segs.find(sg => s <= sg.s0 + sg.len) || p.segs[0];
        const t = (s - g.s0) / g.len;
        if (puntoEnRecinto(q, g.ax + g.dx * t, g.az + g.dz * t, ancho(p) + margen)) return true;
      }
      return false;
    };
    return tocaPasillo(a, b) || tocaPasillo(b, a);
  }

  /** ¿Está el punto dentro de lo que ocupa el recinto (laberinto, anillo o pasillo con sus crestas)? */
  function puntoEnRecinto(rec, x, z, margen = 0) {
    if (!rec) return false;
    const d = Math.hypot(x - rec.zx, z - rec.zz);
    if (d > rec.rMax + margen) return false;
    if (d < rec.Rfin + margen) return true;
    const eje = ejePasillo(rec, x, z);
    return eje.s > -margen && eje.dC < rec.cfg.anchoPasillo / 2 + rec.cfg.grosorCresta + rec.cfg.faldonCresta + margen;
  }

  /**
   * Estado del jugador respecto al recinto:
   *  - 'interior'  si ha pasado la mitad del tramo B (o está dentro del anillo),
   *  - 'exterior'  si está antes de la mitad del tramo B (o fuera del recinto),
   *  - 'mitad'     en la franja de histéresis (se mantiene el estado actual).
   */
  function ladoDelRecinto(rec, x, z) {
    if (!rec) return 'exterior';
    const d = Math.hypot(x - rec.zx, z - rec.zz);
    if (d > rec.rMax) return 'exterior';
    const eje = ejePasillo(rec, x, z);
    const enPasillo = eje.dC < rec.cfg.anchoPasillo / 2 + 4 && eje.s > -5;
    // Fuera del pasillo solo cuenta como interior lo que queda dentro del anillo (la falda exterior es mundo)
    if (!enPasillo) return d < rec.Rcorte ? 'interior' : 'exterior';
    const hist = rec.cfg.histeresis;
    if (eje.s > rec.sMitadB + hist) return 'interior';
    if (eje.s < rec.sMitadB - hist) return 'exterior';
    return 'mitad';
  }

  /**
   * Malla detallada del interior del recinto (laberinto y cara interior del anillo) con el
   * material del terreno. opts:
   *   material      material de terreno (con recorte 'fuera' a Rcorte)
   *   alturaBase    (x, z) → altura del mundo sin recinto
   *   splatBase     (x, z, steep, h) → { splat, snow } del mundo en ese punto
   *   colorBase     (x, z) → [r, g, b] tinte del bioma (0..1)
   *   paso          resolución de la malla (m), 1.25 por defecto
   * Devuelve { malla, alturas: { x0, z0, paso, n, alt }, alturaEn(x, z) }.
   */
  function crearMallaInteriorRecinto(THREE, rec, opts = {}) {
    if (!THREE || !rec) return null;
    const paso = opts.paso || 1.25;
    const Rc = rec.Rcorte;
    const n = Math.ceil((2 * Rc + 2 * paso) / paso);
    const NN = n + 1;
    const x0 = rec.zx - Rc - paso, z0 = rec.zz - Rc - paso;
    const alt = new Float32Array(NN * NN);
    const est = ESTILOS[rec.lab.estilo] || ESTILOS.roca_canion;
    const tinteMuro = estiloTinte(rec.lab.estilo);

    for (let j = 0; j < NN; j++) {
      for (let i = 0; i < NN; i++) {
        const x = x0 + i * paso, z = z0 + j * paso;
        const d = Math.hypot(x - rec.zx, z - rec.zz);
        const hW = (d > rec.RtopIn - 1 && opts.alturaBase) ? opts.alturaBase(x, z) : rec.baseH;
        let h = alturaRecinto(rec, x, z, hW);
        // Detalle fino solo en el interior: grietas y bultos en la roca, el suelo casi liso
        const fade = 1 - smooth(Rc - 7, Rc - 1.5, d);
        if (fade > 0) {
          const roca = Math.max(0, Math.min(1, (h - rec.baseH - 0.5) / 4));
          const det = (ruidoValor(x * 0.42, z * 0.42) - 0.5) * 1.3 + (ruidoValor(x * 1.3 + 9, z * 1.3) - 0.5) * 0.45;
          h += fade * (roca * det + (1 - roca) * (ruidoValor(x * 0.8, z * 0.8) - 0.5) * 0.07);
        }
        alt[j * NN + i] = h;
      }
    }
    const A = (i, j) => alt[Math.max(0, Math.min(NN - 1, j)) * NN + Math.max(0, Math.min(NN - 1, i))];

    const pos = new Float32Array(NN * NN * 3), nrm = new Float32Array(NN * NN * 3), col = new Float32Array(NN * NN * 3);
    const splat = new Float32Array(NN * NN * 4), snow = new Float32Array(NN * NN);
    for (let j = 0; j < NN; j++) {
      for (let i = 0; i < NN; i++) {
        const k = j * NN + i, x = x0 + i * paso, z = z0 + j * paso, h = alt[k];
        const gx = (A(i + 1, j) - A(i - 1, j)) / (2 * paso), gz = (A(i, j + 1) - A(i, j - 1)) / (2 * paso);
        const l = Math.hypot(gx, 1, gz);
        const ny = 1 / l;
        pos[k * 3] = x; pos[k * 3 + 1] = h; pos[k * 3 + 2] = z;
        nrm[k * 3] = -gx / l; nrm[k * 3 + 1] = ny; nrm[k * 3 + 2] = -gz / l;
        const steep = 1 - ny;
        const base = opts.splatBase ? opts.splatBase(x, z, steep, h) : { splat: [0.3, 0.3, steep > 0.4 ? 1 : 0.4, 0], snow: 0 };
        const w = splatRecinto(rec, x, z, steep, h, base);
        splat.set(w.splat, k * 4);
        snow[k] = w.snow || 0;
        const cb = opts.colorBase ? opts.colorBase(x, z) : [1, 1, 1];
        // Tinte del estilo en la roca del interior (se apaga hacia la frontera con el mundo)
        const d = Math.hypot(x - rec.zx, z - rec.zz);
        const kt = (1 - smooth(rec.Rint, rec.Rcorte - 2, d)) * Math.max(0, Math.min(1, (h - rec.baseH - 0.6) / 3));
        col[k * 3] = cb[0] * (1 + (tinteMuro[0] - 1) * kt);
        col[k * 3 + 1] = cb[1] * (1 + (tinteMuro[1] - 1) * kt);
        col[k * 3 + 2] = cb[2] * (1 + (tinteMuro[2] - 1) * kt);
      }
    }
    const idx = [];
    const Rc2 = (Rc + paso * 1.5) * (Rc + paso * 1.5);
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const cx = x0 + (i + 0.5) * paso - rec.zx, cz = z0 + (j + 0.5) * paso - rec.zz;
        if (cx * cx + cz * cz > Rc2) continue;
        const a = j * NN + i, b = a + 1, c = a + NN, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geom.setAttribute('aSplat', new THREE.BufferAttribute(splat, 4));
    geom.setAttribute('aSnow', new THREE.BufferAttribute(snow, 1));
    geom.setIndex(idx);
    geom.computeBoundingSphere();
    const malla = new THREE.Mesh(geom, opts.material || new THREE.MeshLambertMaterial({ vertexColors: true }));
    malla.name = 'SueloInteriorRecinto';
    malla.receiveShadow = true;
    malla.castShadow = true;
    malla.userData.estilo = est.id;

    const alturaEn = (x, z) => {
      const fx = (x - x0) / paso, fz = (z - z0) / paso;
      const i = Math.max(0, Math.min(n - 1, Math.floor(fx))), j = Math.max(0, Math.min(n - 1, Math.floor(fz)));
      const u = Math.max(0, Math.min(1, fx - i)), v = Math.max(0, Math.min(1, fz - j));
      const ya = A(i, j), yb = A(i + 1, j), yc = A(i, j + 1), yd = A(i + 1, j + 1);
      if (u + v <= 1) return ya + (yb - ya) * u + (yc - ya) * v;
      return yd + (yb - yd) * (1 - v) + (yc - yd) * (1 - u);
    };
    return { malla, alturas: { x0, z0, paso, n, alt }, alturaEn };
  }

  // Tinte multiplicativo de la roca del interior según el estilo del laberinto
  function estiloTinte(estilo) {
    switch (estilo) {
      case 'arenisca_desierto': return [1.18, 1.0, 0.78];
      case 'obsidiana_volcanica': return [0.55, 0.5, 0.62];
      case 'hielo_glacial': return [0.88, 1.0, 1.18];
      case 'laberinto_setos': return [0.82, 1.0, 0.8];
      case 'mamposteria_castillo': return [0.95, 0.95, 0.98];
      case 'piedra_ruinas': return [0.9, 0.93, 1.0];
      default: return [1.04, 0.98, 0.92];
    }
  }

  /**
   * Bloques de roca sueltos al pie de los muros del laberinto (geometría fusionada, coordenadas de mundo).
   * Lleva los atributos del terreno (aSplat = roca) para pintarse con el mismo material que las paredes.
   */
  function crearRocasRecinto(THREE, rec, alturaEn, opts = {}) {
    if (!THREE || !rec) return null;
    const lab = rec.lab;
    const base = new THREE.IcosahedronGeometry(1, 1);
    const bp = base.attributes.position.array;
    const P = [], Nn = [], C = [], S = [], Wn = [], I = [];
    let semilla = (lab.seed ^ 0x51a7) >>> 0;
    const rnd = () => { semilla = (semilla * 1664525 + 1013904223) >>> 0; return semilla / 4294967296; };
    const tinte = estiloTinte(lab.estilo);
    const cant = Math.min(opts.max || 260, Math.round(lab.celdasCamino.length * 1.6));
    const idxBase = base.index ? base.index.array : null;
    for (let k = 0; k < cant; k++) {
      const cel = lab.celdasCamino[Math.floor(rnd() * lab.celdasCamino.length)];
      if (!cel) continue;
      // Al pie de un muro vecino de la celda
      const ang = rnd() * Math.PI * 2;
      const off = lab.cellSize * (0.32 + rnd() * 0.12);
      const x = cel.wx + Math.cos(ang) * off, z = cel.wz + Math.sin(ang) * off;
      const hS = alturaEn(x, z);
      if (hS - rec.baseH > 1.2) continue;           // encima de un muro: no
      if (Math.hypot(x - lab.centro.wx, z - lab.centro.wz) < lab.centro.radio * 0.6) continue;
      const eje = ejePasillo(rec, x, z);
      if (eje.dC < rec.cfg.anchoPasillo / 2 - 3) continue;   // no taponar el pasillo
      const sx = 0.6 + rnd() * 1.6, sy = sx * (0.55 + rnd() * 0.4), sz = sx * (0.7 + rnd() * 0.6);
      const ry = rnd() * Math.PI * 2, cy = Math.cos(ry), sy2 = Math.sin(ry);
      const v0 = P.length / 3;
      for (let j = 0; j < bp.length; j += 3) {
        let px = bp[j], py = bp[j + 1], pz = bp[j + 2];
        const jit = 0.82 + 0.36 * hash2(Math.round((px + 3) * 97 + k * 13), Math.round((pz + 3) * 89 + py * 31));
        px *= sx * jit; py *= sy * jit; pz *= sz * jit;
        const wx = px * cy + pz * sy2, wz = -px * sy2 + pz * cy;
        P.push(x + wx, hS + py - sy * 0.25, z + wz);
        const ln = Math.hypot(bp[j], bp[j + 1], bp[j + 2]) || 1;
        const nx = bp[j] / ln, nz = bp[j + 2] / ln;
        Nn.push(nx * cy + nz * sy2, bp[j + 1] / ln, -nx * sy2 + nz * cy);
        C.push(0.78 * tinte[0], 0.78 * tinte[1], 0.78 * tinte[2]);
        S.push(0.02, 0.08, 0.9, 0);
        Wn.push(0);
      }
      if (idxBase) for (let j = 0; j < idxBase.length; j++) I.push(v0 + idxBase[j]);
      else for (let j = 0; j < bp.length / 3; j++) I.push(v0 + j);
    }
    base.dispose();
    if (!P.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(Nn, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
    g.setAttribute('aSplat', new THREE.Float32BufferAttribute(S, 4));
    g.setAttribute('aSnow', new THREE.Float32BufferAttribute(Wn, 1));
    g.setIndex(I);
    g.computeBoundingSphere();
    const m = new THREE.Mesh(g, opts.material || new THREE.MeshLambertMaterial({ vertexColors: true }));
    m.name = 'RocasRecinto';
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
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
    crearEstrechamiento100mMundo,
    crearMuroPerimetralCircular,
    calcularProgresoCorredor,
    crearInstanciaLaberinto,
    crearEntradaExterior100m,
    RECINTO_DEFECTO,
    obtenerRecinto,
    validarRecinto,
    recintosSeSolapan,
    ejePasillo,
    alturaRecinto,
    splatRecinto,
    puntoEnRecinto,
    ladoDelRecinto,
    bloqueaSubidaRecinto,
    rutaRecinto,
    rodearRecinto,
    caminoCeldas,
    celdaLibreCercana,
    crearMallaInteriorRecinto,
    crearRocasRecinto,
    estiloTinte,
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
