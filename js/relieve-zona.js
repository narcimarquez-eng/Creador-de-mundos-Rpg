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
      seed: 12345 + Math.floor(Math.random() * 80000)
    };
  }

  function zonaTieneLaberinto(z) {
    return !!(z && z.relieve && z.relieve.activo);
  }

  /**
   * Genera la cuadrícula del laberinto (0 = camino, 1 = muro, 2 = exterior fuera del círculo).
   * Usa algoritmo DFS con backtracking determinista para garantizar pasillos continuos,
   * recovecos y acceso garantizado desde la entrada perimetral hasta la explanada central.
   */
  function generarLaberinto(tamGrid, seed) {
    const N = Math.max(9, Math.min(21, tamGrid % 2 === 0 ? tamGrid + 1 : tamGrid));
    const grid = Array.from({ length: N }, () => Array(N).fill(1));
    const mid = (N - 1) / 2;
    const radCells = mid - 0.4;

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

    // 4. Conexión de la explanada central con los corredores del laberinto
    grid[m - 1][m] = 0;
    grid[m + 1][m] = 0;
    grid[m][m - 1] = 0;
    grid[m][m + 1] = 0;

    // 5. Entrada del laberinto al sur (perímetro)
    let entradaY = N - 1;
    while (entradaY > m + 1 && (grid[entradaY][m] === 2 || grid[entradaY][m] === 1)) {
      grid[entradaY][m] = 0;
      if (grid[entradaY - 1] && grid[entradaY - 1][m] === 0) break;
      entradaY--;
    }
    const entrada = { gx: m, gy: N - 1 };

    // 6. Verificación de camino continuo mediante BFS
    const visitados = Array.from({ length: N }, () => Array(N).fill(false));
    const queue = [[m, N - 1]];
    visitados[N - 1][m] = true;
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

    // Si por alguna razón el DFS no abrió la entrada al centro, forzar apertura directa
    if (!llegaAlCentro) {
      for (let y = N - 1; y >= m; y--) grid[y][m] = 0;
    }

    return { N, grid, entrada, centro: { gx: m, gy: m } };
  }

  /**
   * Obtiene o genera la estructura completa del laberinto para una zona,
   * incluyendo coordenadas del mundo, colisionadores de muros y datos de meta.
   */
  function obtenerDatosLaberinto(zona) {
    if (!zonaTieneLaberinto(zona)) return null;

    const r = zona.relieve || {};
    const tamGrid = r.tamGrid || (r.complejidad === 'simple' ? 9 : r.complejidad === 'complejo' ? 15 : 11);
    const seed = typeof r.seed === 'number' ? r.seed : 12345;
    const alturaMuro = typeof r.alturaMuro === 'number' ? r.alturaMuro : typeof r.profundidad === 'number' ? r.profundidad : 14;
    const estilo = r.estilo || r.tipo || 'roca_canion';
    const culminacion = r.culminacion || 'oasis';

    const cacheKey = `${zona.id}_${zona.x}_${zona.y}_${zona.radius}_${tamGrid}_${seed}_${alturaMuro}_${estilo}_${culminacion}`;
    if (zona._cacheLaberinto && zona._cacheLaberintoKey === cacheKey) {
      return zona._cacheLaberinto;
    }

    const { N, grid, entrada, centro } = generarLaberinto(tamGrid, seed);
    const zx = zona.x;
    const zz = zona.y;
    const R = zona.radius || 100;
    const cellSize = (2 * R) / N;
    const halfN = (N - 1) / 2;

    // Convertidor de celda (gx, gy) a mundo (wx, wz)
    const celdaAMundo = (gx, gy) => ({
      wx: zx + (gx - halfN) * cellSize,
      wz: zz + (gy - halfN) * cellSize
    });

    // Cajas de colisión para los muros
    const colliders = [];
    const muros = [];
    for (let gy = 0; gy < N; gy++) {
      for (let gx = 0; gx < N; gx++) {
        if (grid[gy][gx] === 1) {
          const { wx, wz } = celdaAMundo(gx, gy);
          const half = cellSize * 0.49;
          const box = {
            type: 'box',
            minX: wx - half,
            maxX: wx + half,
            minZ: wz - half,
            maxZ: wz + half,
            gx,
            gy,
            wx,
            wz
          };
          colliders.push(box);
          muros.push({ gx, gy, wx, wz, half });
        }
      }
    }

    const posEntrada = celdaAMundo(entrada.gx, entrada.gy);
    const posCentro = celdaAMundo(centro.gx, centro.gy);

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
      colliders,
      muros,
      entrada: { gx: entrada.gx, gy: entrada.gy, wx: posEntrada.wx, wz: posEntrada.wz },
      centro: { gx: centro.gx, gy: centro.gy, wx: posCentro.wx, wz: posCentro.wz, radio: cellSize * 1.5 },
      celdaAMundo,
      obtenerColisionadores: (x, z) => {
        // Índice espacial en O(1) comprobando celdas contiguas en 3x3
        const gx = Math.round((x - zx) / cellSize + halfN);
        const gy = Math.round((z - zz) / cellSize + halfN);
        const out = [];
        for (let dy = -1; dy <= 1; dy++) {
          const ny = gy + dy;
          if (ny < 0 || ny >= N) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const nx = gx + dx;
            if (nx < 0 || nx >= N) continue;
            if (grid[ny][nx] === 1) {
              const { wx, wz } = celdaAMundo(nx, ny);
              const half = cellSize * 0.49;
              out.push({
                type: 'box',
                minX: wx - half,
                maxX: wx + half,
                minZ: wz - half,
                maxZ: wz + half
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
    const gx = Math.round((x - lab.zx) / lab.cellSize + lab.halfN);
    const gy = Math.round((z - lab.zz) / lab.cellSize + lab.halfN);
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
      const R = zona.radius || 100;
      const dx = x - zona.x, dz = z - zona.y;
      const d = Math.hypot(dx, dz);
      if (d > R + 6) continue;

      const lab = obtenerDatosLaberinto(zona);
      if (!lab) continue;

      const { N, grid, cellSize, halfN, zx, zz, alturaMuro, culminacion } = lab;
      const u = (x - zx) / cellSize + halfN;
      const v = (z - zz) / cellSize + halfN;
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

      // En la entrada sur: rampa suave que conecta el terreno exterior con el fondo del desfiladero
      const dEntrada = Math.hypot(x - lab.entrada.wx, z - lab.entrada.wz);
      if (dEntrada < lab.cellSize * 1.3 && d >= R - 8) {
        const tE = smooth(R - 8, R + 2, d);
        dh = dh * (1 - tE);
      }

      // En el borde exterior de la zona: mezcla suave hacia el terreno base natural
      const blendBorde = 1 - smooth(R - 6, R + 2, d);
      h = h + dh * blendBorde;
    }
    return h;
  }

  /**
   * Modifica texturas (splatting): caminos de grava/tierra, paredes de roca y explanada temática.
   */
  function splatZona(lab, x, z, steep, h, splatBase) {
    if (!lab) return splatBase;
    const gx = Math.round((x - lab.zx) / lab.cellSize + lab.halfN);
    const gy = Math.round((z - lab.zz) / lab.cellSize + lab.halfN);
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
      // 🌴 Palmeras exuberantes en el oasis
      const matTronco = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.9 });
      const matPalma = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6, side: THREE.DoubleSide });
      const numPalmeras = 6;
      const radOasis = 12.5;
      for (let i = 0; i < numPalmeras; i++) {
        const ang = (i * 2 * Math.PI) / numPalmeras + (i % 2) * 0.4;
        const px = Math.cos(ang) * radOasis;
        const pz = Math.sin(ang) * radOasis;
        const palmera = new THREE.Group();
        palmera.position.set(px, 0, pz);

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

  const RelieveZonaLib = {
    ESTILOS,
    CULMINACIONES,
    configPorDefecto,
    zonaTieneLaberinto,
    zonaTieneRelieve: zonaTieneLaberinto,
    generarLaberinto,
    obtenerDatosLaberinto,
    obtenerLaberintoEnPunto,
    obtenerRelieveZona: obtenerLaberintoEnPunto,
    aplicarRelieveTerreno,
    esCamino,
    splatZona,
    dibujarLaberinto2D,
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
