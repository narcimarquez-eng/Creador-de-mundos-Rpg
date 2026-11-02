/**
 * dungeon-generator.js
 * Generador procedural de mazmorras 3D para Creador de Mundos RPG.
 * Estilo arquitectónico modular similar al creador de pueblos (village-core.js).
 * 
 * Incluye:
 *  - Generador pseudoaleatorio reproducible (PRNG Mulberry32)
 *  - Distintos tipos de piedra y temáticas (Gótica oscura, Caliza antigua, Ruinas musgosas, Basalto volcánico)
 *  - Atlas procedural de texturas PBR (mortero, sillares, losas, musgo, madera, hierro)
 *  - Generación de salas (Vestíbulo, Gran Salón de Columnas, Santuario de la Fuente, Cripta funeraria,
 *    Cámara del Tesoro, Salón del Trono del Jefe) y pasillos con arcos y refuerzos
 *  - Elementos y props:
 *      * Fuentes ornamentales con pileta de piedra y agua
 *      * Manchas de musgo, maleza y yerbas subterráneas
 *      * Hongos bioluminiscentes con resplandor
 *      * Antorchas de pared y braseros de forja con luz dinámica
 *      * Jarrones y vasijas de cerámica
 *      * Cofres del tesoro con herrajes de hierro y cerraduras
 *      * Sarcófagos y lápidas talladas
 *      * Columnas, pilares y arquerías
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['three'], factory);
  } else if (typeof module === 'object' && module.exports) {
    let threeRef = null;
    try { threeRef = require('three'); } catch (e) { threeRef = (typeof global !== 'undefined' ? global.THREE : null); }
    module.exports = factory(threeRef);
  } else {
    root.DungeonGenerator = factory(root.THREE);
  }
}(typeof self !== 'undefined' ? self : this, function (THREE) {
  'use strict';

  // --- 1. PRNG REPRODUCIBLE (MULBERRY32) ---
  function resolveThree(explicitRef) {
    if (explicitRef && (explicitRef.Mesh || explicitRef.Group || explicitRef.Vector3)) return explicitRef;
    if (typeof THREE !== 'undefined' && THREE && THREE.Mesh) return THREE;
    if (typeof window !== 'undefined' && window.THREE && window.THREE.Mesh) return window.THREE;
    if (typeof global !== 'undefined' && global.THREE && global.THREE.Mesh) return global.THREE;
    if (typeof self !== 'undefined' && self.THREE && self.THREE.Mesh) return self.THREE;
    return null;
  }

  class PRNG {
    constructor(seed = 12345) {
      this.s = (typeof seed === 'number' ? seed : this._hash(String(seed))) >>> 0;
    }
    _hash(str) {
      let h = 2166136261;
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return h >>> 0;
    }
    next() {
      let t = this.s += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    range(min, max) { return min + this.next() * (max - min); }
    int(min, max) { return Math.floor(this.range(min, max + 1)); }
    pick(arr) { return arr[this.int(0, arr.length - 1)]; }
    chance(prob) { return this.next() < prob; }
  }

  // --- 2. TEMAS Y TIPOS DE PIEDRA ---
  const ESTILOS_PIEDRA = {
    cripta_gotica: {
      id: 'cripta_gotica',
      nombre: 'Cripta Gótica Oscura',
      colorBase: '#1e293b',
      colorSecundario: '#0f172a',
      colorMortero: '#090d16',
      colorLosa: '#334155',
      colorMusgo: '#15803d',
      colorAgua: 0x0ea5e9,
      luzAntorchas: 0xf59e0b,
      luzJefe: 0xa855f7,
      densidadMusgo: 0.35,
      densidadHierba: 0.25,
      rugosidad: 0.85
    },
    ruinas_musgosas: {
      id: 'ruinas_musgosas',
      nombre: 'Ruinas de Granito y Musgo',
      colorBase: '#334155',
      colorSecundario: '#1e293b',
      colorMortero: '#14532d',
      colorLosa: '#475569',
      colorMusgo: '#22c55e',
      colorAgua: 0x10b981,
      luzAntorchas: 0xfbbf24,
      luzJefe: 0x22c55e,
      densidadMusgo: 0.85,
      densidadHierba: 0.65,
      rugosidad: 0.90
    },
    catacumbas_caliza: {
      id: 'catacumbas_caliza',
      nombre: 'Catacumbas de Caliza Antigua',
      colorBase: '#78716c',
      colorSecundario: '#57534e',
      colorMortero: '#292524',
      colorLosa: '#a8a29e',
      colorMusgo: '#4d7c0f',
      colorAgua: 0x38bdf8,
      luzAntorchas: 0xf97316,
      luzJefe: 0xef4444,
      densidadMusgo: 0.20,
      densidadHierba: 0.15,
      rugosidad: 0.80
    },
    fortaleza_basalto: {
      id: 'fortaleza_basalto',
      nombre: 'Fortaleza de Basalto y Obsidiana',
      colorBase: '#09090b',
      colorSecundario: '#18181b',
      colorMortero: '#27272a',
      colorLosa: '#1c1917',
      colorMusgo: '#b91c1c', // Líquenes volcánicos rojizos
      colorAgua: 0x6366f1,
      luzAntorchas: 0xff4400,
      luzJefe: 0xdc2626,
      densidadMusgo: 0.10,
      densidadHierba: 0.05,
      rugosidad: 0.60
    }
  };

  // --- 2.1 CATÁLOGO DE TIPOS DE ESTANCIA ---
  const TIPOS_ESTANCIA = {
    entrada: { id: 'entrada', nombre: 'Vestíbulo de Entrada', icono: '🚪', desc: 'Pórtico monumental y acceso a la mazmorra', w: 12, d: 14, h: 4.8 },
    fuente: { id: 'fuente', nombre: 'Santuario de la Fuente', icono: '⛲', desc: 'Pileta central, agua arcana y flora fúngica', w: 18, d: 16, h: 5.6 },
    tesoro: { id: 'tesoro', nombre: 'Cámara del Tesoro', icono: '🪙', desc: 'Cofres dorados con botín, gemas y vasijas antiguas', w: 14, d: 14, h: 4.6 },
    cripta_columnas: { id: 'cripta_columnas', nombre: 'Gran Cripta de Columnas', icono: '🏛️', desc: 'Columnatas monumentales y sarcófagos de piedra labrada', w: 22, d: 20, h: 6.2 },
    armeria: { id: 'armeria', nombre: 'Armería de la Guardia', icono: '⚔️', desc: 'Percheros de armas, escudos de hierro y barriles', w: 16, d: 14, h: 4.8 },
    biblioteca: { id: 'biblioteca', nombre: 'Biblioteca Arcana', icono: '📜', desc: 'Atriles de piedra, grimorios y monolitos con orbe flotante', w: 16, d: 16, h: 5.4 },
    prision: { id: 'prision', nombre: 'Mazmorra de Celdas', icono: '⛓️', desc: 'Celdas con rejas de hierro, cadenas y bancos rústicos', w: 15, d: 15, h: 4.8 },
    laboratorio: { id: 'laboratorio', nombre: 'Laboratorio de Alquimia', icono: '⚗️', desc: 'Caldero con poción resplandeciente, mesa y redomas', w: 16, d: 15, h: 5.0 },
    jardin_subterraneo: { id: 'jardin_subterraneo', nombre: 'Jardín Fúngico de Esporas', icono: '🍄', desc: 'Densa maleza, musgo y colonias de hongos bioluminiscentes', w: 18, d: 18, h: 5.8 },
    sala_jefe: { id: 'sala_jefe', nombre: 'Cámara del Trono del Jefe', icono: '👑', desc: 'Estrado elevado, trono de piedra y braseros mágicos', w: 24, d: 24, h: 7.5 }
  };

  // --- 3. GENERADOR DE TEXTURAS ATLAS PROCEDURALES PBR ---
  const _atlasCache = new Map();

  function crearAtlasMazmorra(estilo, ThreeLib) {
    const key = estilo.id;
    if (_atlasCache.has(key)) return _atlasCache.get(key);

    if (typeof document === 'undefined') {
      // Entorno headless / Node.js
      return { diffuse: null, bump: null };
    }

    const size = 1024;
    const canvasD = document.createElement('canvas');
    const canvasB = document.createElement('canvas');
    canvasD.width = canvasD.height = size;
    canvasB.width = canvasB.height = size;

    const ctxD = canvasD.getContext('2d');
    const ctxB = canvasB.getContext('2d');

    // === CUADRANTE 1: SILLARES DE PIEDRA (Y: 0 - 512, X: 0 - 512) ===
    ctxD.fillStyle = estilo.colorMortero;
    ctxD.fillRect(0, 0, 512, 512);
    ctxB.fillStyle = '#111111';
    ctxB.fillRect(0, 0, 512, 512);

    const filasPiedra = 8;
    const altoFila = 512 / filasPiedra;
    for (let f = 0; f < filasPiedra; f++) {
      const y = f * altoFila;
      const cols = f % 2 === 0 ? 4 : 5;
      const anchoCol = 512 / cols;
      const shift = (f % 2) * (anchoCol * 0.5);

      for (let c = -1; c <= cols; c++) {
        const x = c * anchoCol + shift;
        const pad = 4;
        const gradD = ctxD.createLinearGradient(x, y, x + anchoCol, y + altoFila);
        gradD.addColorStop(0.0, estilo.colorBase);
        gradD.addColorStop(0.7, estilo.colorSecundario);
        gradD.addColorStop(1.0, estilo.colorBase);
        ctxD.fillStyle = gradD;
        ctxD.fillRect(x + pad, y + pad, anchoCol - pad * 2, altoFila - pad * 2);

        // Bump map biselado
        const gradB = ctxB.createRadialGradient(x + anchoCol / 2, y + altoFila / 2, 4, x + anchoCol / 2, y + altoFila / 2, anchoCol / 2);
        gradB.addColorStop(0.0, '#ffffff');
        gradB.addColorStop(0.85, '#aaaaaa');
        gradB.addColorStop(1.0, '#1a1a1a');
        ctxB.fillStyle = gradB;
        ctxB.fillRect(x + pad, y + pad, anchoCol - pad * 2, altoFila - pad * 2);

        // Grietas orgánicas
        if ((f + c) % 3 === 0) {
          ctxD.strokeStyle = 'rgba(0,0,0,0.4)';
          ctxD.lineWidth = 1.5;
          ctxD.beginPath();
          ctxD.moveTo(x + pad + 10, y + pad + 8);
          ctxD.lineTo(x + pad + 24, y + pad + 18);
          ctxD.lineTo(x + pad + 18, y + altoFila - pad - 6);
          ctxD.stroke();
        }
      }
    }

    // === CUADRANTE 2: LOSAS GRANDES DE SUELO (X: 512 - 1024, Y: 0 - 512) ===
    ctxD.fillStyle = '#0f172a';
    ctxD.fillRect(512, 0, 512, 512);
    ctxB.fillStyle = '#0a0a0a';
    ctxB.fillRect(512, 0, 512, 512);

    const losasX = 4;
    const losasY = 4;
    const pasoLosa = 512 / losasX;
    for (let ly = 0; ly < losasY; ly++) {
      for (let lx = 0; lx < losasX; lx++) {
        const px = 512 + lx * pasoLosa;
        const py = ly * pasoLosa;
        const pad = 5;

        const gradLosa = ctxD.createLinearGradient(px, py, px + pasoLosa, py + pasoLosa);
        gradLosa.addColorStop(0.0, estilo.colorLosa);
        gradLosa.addColorStop(0.5, estilo.colorBase);
        gradLosa.addColorStop(1.0, estilo.colorSecundario);
        ctxD.fillStyle = gradLosa;
        ctxD.fillRect(px + pad, py + pad, pasoLosa - pad * 2, pasoLosa - pad * 2);

        // Bump losa
        ctxB.fillStyle = '#d4d4d4';
        ctxB.fillRect(px + pad, py + pad, pasoLosa - pad * 2, pasoLosa - pad * 2);
        ctxB.strokeStyle = '#222222';
        ctxB.lineWidth = 4;
        ctxB.strokeRect(px + pad, py + pad, pasoLosa - pad * 2, pasoLosa - pad * 2);

        // Manchas de musgo en esquinas
        if (estilo.densidadMusgo > 0.2 && (lx + ly) % 2 === 0) {
          ctxD.fillStyle = estilo.colorMusgo;
          ctxD.beginPath();
          ctxD.arc(px + pad + 12, py + pad + 12, 14, 0, Math.PI * 2);
          ctxD.fill();
        }
      }
    }

    // === CUADRANTE 3: MADERA Y TABLONES PARA COFRES / PUERTAS (X: 0 - 512, Y: 512 - 1024) ===
    ctxD.fillStyle = '#451a03';
    ctxD.fillRect(0, 512, 512, 512);
    ctxB.fillStyle = '#555555';
    ctxB.fillRect(0, 512, 512, 512);

    const vigas = 6;
    const altoViga = 512 / vigas;
    for (let v = 0; v < vigas; v++) {
      const vy = 512 + v * altoViga;
      ctxD.fillStyle = v % 2 === 0 ? '#78350f' : '#92400e';
      ctxD.fillRect(2, vy + 2, 508, altoViga - 4);

      // Vetas de madera
      ctxD.fillStyle = 'rgba(0,0,0,0.18)';
      for (let s = 6; s < 500; s += 22) {
        ctxD.fillRect(s, vy + 2, 2, altoViga - 4);
      }
    }

    // === CUADRANTE 4: HIERRO REMACHADO Y HERRAJES (X: 512 - 1024, Y: 512 - 1024) ===
    ctxD.fillStyle = '#27272a';
    ctxD.fillRect(512, 512, 512, 512);
    ctxB.fillStyle = '#888888';
    ctxB.fillRect(512, 512, 512, 512);

    // Bandas de hierro con remaches circulares
    ctxD.fillStyle = '#3f3f46';
    ctxD.fillRect(512, 512 + 64, 512, 96);
    ctxD.fillRect(512, 512 + 320, 512, 96);

    ctxD.fillStyle = '#d4d4d8';
    for (let rx = 512 + 32; rx < 1024; rx += 64) {
      ctxD.beginPath();
      ctxD.arc(rx, 512 + 112, 8, 0, Math.PI * 2);
      ctxD.arc(rx, 512 + 368, 8, 0, Math.PI * 2);
      ctxD.fill();

      ctxB.fillStyle = '#ffffff';
      ctxB.beginPath();
      ctxB.arc(rx, 512 + 112, 8, 0, Math.PI * 2);
      ctxB.arc(rx, 512 + 368, 8, 0, Math.PI * 2);
      ctxB.fill();
    }

    const texD = new ThreeLib.CanvasTexture(canvasD);
    texD.wrapS = texD.wrapT = ThreeLib.RepeatWrapping;
    texD.colorSpace = ThreeLib.SRGBColorSpace;

    const texB = new ThreeLib.CanvasTexture(canvasB);
    texB.wrapS = texB.wrapT = ThreeLib.RepeatWrapping;

    const result = { diffuse: texD, bump: texB };
    _atlasCache.set(key, result);
    return result;
  }

  // --- 4. CREADOR DE KITS DE MATERIALES PROCEDURALES ---
  function crearKitMateriales(estilo, ThreeLib) {
    const atlas = crearAtlasMazmorra(estilo, ThreeLib);

    const matPiedraMuro = new ThreeLib.MeshStandardMaterial({
      color: estilo.colorBase,
      roughness: estilo.rugosidad,
      metalness: 0.1,
      map: atlas.diffuse,
      bumpMap: atlas.bump,
      bumpScale: 0.08
    });

    const matSueloLosas = new ThreeLib.MeshStandardMaterial({
      color: estilo.colorLosa,
      roughness: 0.75,
      metalness: 0.05,
      map: atlas.diffuse,
      bumpMap: atlas.bump,
      bumpScale: 0.06
    });

    const matMadera = new ThreeLib.MeshStandardMaterial({
      color: 0x854d0e,
      roughness: 0.7,
      metalness: 0.05,
      map: atlas.diffuse
    });

    const matHierro = new ThreeLib.MeshStandardMaterial({
      color: 0x3f3f46,
      roughness: 0.45,
      metalness: 0.85
    });

    const matOro = new ThreeLib.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.3,
      metalness: 0.95
    });

    const matAgua = new ThreeLib.MeshStandardMaterial({
      color: estilo.colorAgua,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.82
    });

    const matLlama = new ThreeLib.MeshBasicMaterial({
      color: estilo.luzAntorchas
    });

    const matMusgo = new ThreeLib.MeshStandardMaterial({
      color: estilo.colorMusgo,
      roughness: 0.95,
      metalness: 0.0
    });

    const matHongo = new ThreeLib.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.3
    });

    return {
      estilo,
      atlas,
      piedraMuro: matPiedraMuro,
      sueloLosas: matSueloLosas,
      madera: matMadera,
      hierro: matHierro,
      oro: matOro,
      agua: matAgua,
      llama: matLlama,
      musgo: matMusgo,
      hongo: matHongo
    };
  }

  // --- 5. FABRICA DE PROPS PROCEDURALES ---

  // A) Antorcha con soporte de hierro forjado
  function crearAntorcha(ThreeLib, kit, luzHex, intensidad = 2.4) {
    const g = new ThreeLib.Group();

    // Soporte de pared (hierro)
    const basePared = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(0.12, 0.4, 0.1), kit.hierro);
    basePared.position.set(0, 0, 0.05);
    g.add(basePared);

    const brazo = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(0.08, 0.08, 0.32), kit.hierro);
    brazo.position.set(0, 0.05, 0.2);
    g.add(brazo);

    const cazoleta = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.12, 0.06, 0.18, 8), kit.hierro);
    cazoleta.position.set(0, 0.14, 0.34);
    g.add(cazoleta);

    // Llama (cono estilizado)
    const llama = new ThreeLib.Mesh(new ThreeLib.ConeGeometry(0.09, 0.26, 6), kit.llama);
    llama.position.set(0, 0.3, 0.34);
    g.add(llama);

    // Luz dinámica
    const luz = new ThreeLib.PointLight(luzHex || kit.estilo.luzAntorchas, intensidad, 18, 1.6);
    luz.position.set(0, 0.35, 0.36);
    g.add(luz);

    g.userData = {
      tipo: 'antorcha',
      luz,
      llama,
      baseIntensity: intensidad,
      flicker: (t) => {
        luz.intensity = intensidad * (0.88 + Math.sin(t * 12.0) * 0.08 + Math.cos(t * 27.0) * 0.04);
        llama.scale.set(
          1 + Math.sin(t * 15.0) * 0.1,
          1 + Math.cos(t * 18.0) * 0.15,
          1 + Math.sin(t * 15.0) * 0.1
        );
      }
    };

    return g;
  }

  // B) Fuente ornamental de piedra con pileta de agua
  function crearFuente(ThreeLib, kit, radio = 2.8, altura = 1.4) {
    const g = new ThreeLib.Group();

    // Pileta octogonal exterior
    const basePiedra = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(radio, radio * 1.05, altura * 0.7, 8), kit.piedraMuro);
    basePiedra.position.y = altura * 0.35;
    g.add(basePiedra);

    // Reborde de la pileta
    const borde = new ThreeLib.Mesh(new ThreeLib.TorusGeometry(radio * 0.95, 0.22, 6, 8), kit.piedraMuro);
    borde.rotation.x = Math.PI / 2;
    borde.position.y = altura * 0.7;
    g.add(borde);

    // Agua
    const agua = new ThreeLib.Mesh(new ThreeLib.CircleGeometry(radio * 0.88, 16), kit.agua);
    agua.rotation.x = -Math.PI / 2;
    agua.position.y = altura * 0.62;
    g.add(agua);

    // Pedestal central y cuenco superior
    const pilar = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.45, 0.55, altura * 1.3, 8), kit.piedraMuro);
    pilar.position.y = altura * 0.65;
    g.add(pilar);

    const cuenco = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.95, 0.3, 0.45, 8), kit.piedraMuro);
    cuenco.position.y = altura * 1.35;
    g.add(cuenco);

    // Chorro de agua central
    const chorro = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.08, 0.16, 0.6, 6), kit.agua);
    chorro.position.y = altura * 1.7;
    g.add(chorro);

    // Luz ambiental mística
    const luzFuente = new ThreeLib.PointLight(kit.estilo.colorAgua, 1.8, 14, 1.4);
    luzFuente.position.set(0, altura + 0.5, 0);
    g.add(luzFuente);

    g.userData = {
      tipo: 'fuente',
      agua,
      chorro,
      luzFuente,
      update: (t) => {
        chorro.rotation.y = t * 1.5;
        agua.position.y = (altura * 0.62) + Math.sin(t * 3.0) * 0.02;
      }
    };

    return g;
  }

  // C) Cofre del tesoro con herrajes de hierro y cerradura dorada
  function crearCofre(ThreeLib, kit, abierto = false) {
    const g = new ThreeLib.Group();
    const w = 1.1, h = 0.65, d = 0.75;

    // Cuerpo principal de madera
    const cuerpo = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(w, h * 0.65, d), kit.madera);
    cuerpo.position.y = (h * 0.65) / 2;
    g.add(cuerpo);

    // Herrajes de hierro
    const herraje1 = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(w * 1.02, h * 0.66, 0.08), kit.hierro);
    herraje1.position.set(0, (h * 0.65) / 2, d * 0.25);
    g.add(herraje1);

    const herraje2 = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(w * 1.02, h * 0.66, 0.08), kit.hierro);
    herraje2.position.set(0, (h * 0.65) / 2, -d * 0.25);
    g.add(herraje2);

    // Tapa abovedada
    const tapaGroup = new ThreeLib.Group();
    tapaGroup.position.set(0, h * 0.65, -d / 2); // Eje de bisagra trasero

    const tapa = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(d / 2, d / 2, w, 12, 1, false, 0, Math.PI), kit.madera);
    tapa.rotation.z = Math.PI / 2;
    tapa.rotation.x = Math.PI / 2;
    tapa.position.set(0, 0, d / 2);
    tapaGroup.add(tapa);

    if (abierto) {
      tapaGroup.rotation.x = -Math.PI * 0.55;
    }
    g.add(tapaGroup);

    // Cerradura de oro
    const cerradura = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(0.18, 0.22, 0.08), kit.oro);
    cerradura.position.set(0, (h * 0.65) * 0.75, d / 2 + 0.04);
    g.add(cerradura);

    // Halo dorado si está cerrado (tesoro dentro)
    if (!abierto) {
      const halo = new ThreeLib.PointLight(0xf59e0b, 1.2, 5, 2);
      halo.position.set(0, h + 0.2, 0);
      g.add(halo);
    }

    g.userData = { tipo: 'cofre', abierto, tapaGroup };
    return g;
  }

  // D) Jarrones y vasijas de cerámica
  function crearJarron(ThreeLib, kit, escala = 1.0, roto = false) {
    const g = new ThreeLib.Group();

    // Material terracota / cerámica antigua
    const matCeramica = new ThreeLib.MeshStandardMaterial({
      color: 0x9a3412,
      roughness: 0.85,
      metalness: 0.05
    });

    if (roto) {
      // Pedazos de vasija rota
      const p1 = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(0.35 * escala, 0.12 * escala, 0.35 * escala), matCeramica);
      p1.position.set(0.1, 0.06 * escala, 0);
      g.add(p1);
      const p2 = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(0.25 * escala, 0.08 * escala, 0.2 * escala), matCeramica);
      p2.position.set(-0.2, 0.04 * escala, 0.15);
      p2.rotation.y = 0.5;
      g.add(p2);
    } else {
      // Cuerpo abombado
      const cuerpo = new ThreeLib.Mesh(new ThreeLib.SphereGeometry(0.42 * escala, 10, 8), matCeramica);
      cuerpo.scale.set(1, 1.3, 1);
      cuerpo.position.y = 0.5 * escala;
      g.add(cuerpo);

      // Cuello y boca
      const cuello = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.2 * escala, 0.28 * escala, 0.35 * escala, 8), matCeramica);
      cuello.position.y = 0.9 * escala;
      g.add(cuello);

      const borde = new ThreeLib.Mesh(new ThreeLib.TorusGeometry(0.22 * escala, 0.06 * escala, 4, 8), matCeramica);
      borde.rotation.x = Math.PI / 2;
      borde.position.y = 1.06 * escala;
      g.add(borde);
    }

    g.userData = { tipo: 'jarron', roto };
    return g;
  }

  // E) Sarcófago de piedra labrada
  function crearSarcofago(ThreeLib, kit) {
    const g = new ThreeLib.Group();
    const l = 2.4, w = 1.1, h = 0.85;

    // Caja inferior
    const caja = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(w, h * 0.7, l), kit.piedraMuro);
    caja.position.y = (h * 0.7) / 2;
    g.add(caja);

    // Tapa con relieve
    const tapa = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(w * 1.06, 0.22, l * 1.04), kit.sueloLosas);
    tapa.position.y = (h * 0.7) + 0.11;
    g.add(tapa);

    // Efigie / cruz en relieve
    const relieve = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(w * 0.5, 0.08, l * 0.7), kit.piedraMuro);
    relieve.position.y = (h * 0.7) + 0.24;
    g.add(relieve);

    g.userData = { tipo: 'sarcofago' };
    return g;
  }

  // F) Columna monumental con capitel y basa
  function crearColumna(ThreeLib, kit, altura = 4.2, radio = 0.5) {
    const g = new ThreeLib.Group();

    // Basa cuadrada
    const basa = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(radio * 2.5, 0.45, radio * 2.5), kit.piedraMuro);
    basa.position.y = 0.225;
    g.add(basa);

    // Fuste estriado octogonal
    const fuste = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(radio * 0.9, radio, altura - 0.9, 8), kit.piedraMuro);
    fuste.position.y = 0.45 + (altura - 0.9) / 2;
    g.add(fuste);

    // Capitel superior
    const capitel = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(radio * 2.6, 0.45, radio * 2.6), kit.piedraMuro);
    capitel.position.y = altura - 0.225;
    g.add(capitel);

    g.userData = { tipo: 'columna' };
    return g;
  }

  // G) Vegetación subterránea: musgo y yerbas entre losas
  function crearManchaVegetacion(ThreeLib, kit, rng, radio = 1.2) {
    const g = new ThreeLib.Group();

    // Capa de musgo pegada al suelo
    const geoMusgo = new ThreeLib.CircleGeometry(radio, 7);
    const mallaMusgo = new ThreeLib.Mesh(geoMusgo, kit.musgo);
    mallaMusgo.rotation.x = -Math.PI / 2;
    mallaMusgo.position.y = 0.015;
    g.add(mallaMusgo);

    // Briznas de yerbas (planos cruzados)
    const cantHierba = rng.int(3, 7);
    const geoHierba = new ThreeLib.PlaneGeometry(0.35, 0.45);
    for (let i = 0; i < cantHierba; i++) {
      const hMesh = new ThreeLib.Mesh(geoHierba, kit.musgo);
      const ang = rng.range(0, Math.PI * 2);
      const dist = rng.range(0.1, radio * 0.7);
      hMesh.position.set(Math.cos(ang) * dist, 0.22, Math.sin(ang) * dist);
      hMesh.rotation.y = rng.range(0, Math.PI);
      g.add(hMesh);
    }

    return g;
  }

  // H) Hongos bioluminiscentes
  function crearHongosLuminosos(ThreeLib, kit, rng) {
    const g = new ThreeLib.Group();
    const cant = rng.int(2, 5);

    for (let i = 0; i < cant; i++) {
      const hScale = rng.range(0.6, 1.2);
      const ox = rng.range(-0.4, 0.4);
      const oz = rng.range(-0.4, 0.4);

      // Pie
      const pie = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.04 * hScale, 0.06 * hScale, 0.35 * hScale, 5), kit.hongo);
      pie.position.set(ox, 0.17 * hScale, oz);
      g.add(pie);

      // Sombrero brillante
      const sombrero = new ThreeLib.Mesh(new ThreeLib.ConeGeometry(0.18 * hScale, 0.16 * hScale, 6), kit.hongo);
      sombrero.position.set(ox, 0.35 * hScale, oz);
      g.add(sombrero);
    }

    // Luz bioluminiscente sutil
    const luzHongo = new ThreeLib.PointLight(0x38bdf8, 0.9, 4.5, 2.0);
    luzHongo.position.set(0, 0.4, 0);
    g.add(luzHongo);

    g.userData = { tipo: 'hongos', luzHongo };
    return g;
  }

  // I) Armería: soportes de armas, percheros y barriles
  function crearArmeriaProps(ThreeLib, kit, rng) {
    const g = new ThreeLib.Group();

    // Perchero de madera y hierro para armas
    const baseArmero = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(2.4, 0.25, 0.8), kit.madera);
    baseArmero.position.y = 0.125;
    g.add(baseArmero);

    const posteL = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(0.14, 1.8, 0.14), kit.madera);
    posteL.position.set(-1.0, 1.0, 0);
    g.add(posteL);

    const posteR = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(0.14, 1.8, 0.14), kit.madera);
    posteR.position.set(1.0, 1.0, 0);
    g.add(posteR);

    const barra = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(2.2, 0.12, 0.12), kit.hierro);
    barra.position.set(0, 1.7, 0);
    g.add(barra);

    // Lanzas y alabardas apoyadas
    [-0.6, -0.2, 0.2, 0.6].forEach((xOff, i) => {
      const lanza = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.03, 0.04, 2.1, 6), kit.hierro);
      lanza.position.set(xOff, 1.05, 0.05);
      lanza.rotation.z = (i % 2 === 0 ? 0.08 : -0.08);
      g.add(lanza);
    });

    // Barril de suministros
    const barril = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.45, 0.42, 1.1, 10), kit.madera);
    barril.position.set(1.8, 0.55, 0.2);
    g.add(barril);

    [-0.35, 0.35].forEach(yRing => {
      const aro = new ThreeLib.Mesh(new ThreeLib.TorusGeometry(0.46, 0.04, 4, 10), kit.hierro);
      aro.rotation.x = Math.PI / 2;
      aro.position.set(1.8, 0.55 + yRing, 0.2);
      g.add(aro);
    });

    g.userData = { tipo: 'armeria' };
    return g;
  }

  // J) Biblioteca arcana: atril de lectura, grimorio y monolito con orbe
  function crearBibliotecaProps(ThreeLib, kit, rng) {
    const g = new ThreeLib.Group();

    // Atril de lectura monumental
    const baseAtril = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(0.8, 0.9, 0.7), kit.piedraMuro);
    baseAtril.position.y = 0.45;
    g.add(baseAtril);

    const tablaAtril = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(1.0, 0.1, 0.8), kit.madera);
    tablaAtril.position.set(0, 0.95, 0);
    tablaAtril.rotation.x = -0.35;
    g.add(tablaAtril);

    const libro = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(0.7, 0.08, 0.5), kit.hierro);
    libro.position.set(0, 1.02, -0.04);
    libro.rotation.x = -0.35;
    g.add(libro);

    // Monolito rúnico con orbe arcano flotante
    const monolito = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.35, 0.55, 1.6, 6), kit.sueloLosas);
    monolito.position.set(0, 0.8, 2.5);
    g.add(monolito);

    const orbe = new ThreeLib.Mesh(new ThreeLib.SphereGeometry(0.32, 12, 12), new ThreeLib.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.4,
      roughness: 0.2
    }));
    orbe.position.set(0, 1.95, 2.5);
    g.add(orbe);

    const luzOrbe = new ThreeLib.PointLight(0x38bdf8, 2.4, 18, 1.5);
    luzOrbe.position.set(0, 2.0, 2.5);
    g.add(luzOrbe);

    g.userData = {
      tipo: 'biblioteca',
      update: (t) => {
        orbe.position.y = 1.95 + Math.sin(t * 2.2) * 0.08;
        luzOrbe.intensity = 2.4 * (0.9 + Math.sin(t * 3.5) * 0.1);
      }
    };
    return g;
  }

  // K) Prisión / Mazmorra de celdas: rejas de hierro y banco
  function crearPrisionProps(ThreeLib, kit, rng, H = 4.8) {
    const g = new ThreeLib.Group();

    // Rejas de celda verticales
    const cantBarrotes = 8;
    const anchoReja = 3.6;
    for (let i = 0; i <= cantBarrotes; i++) {
      const x = -anchoReja / 2 + (i / cantBarrotes) * anchoReja;
      const barrote = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.04, 0.04, H * 0.85, 6), kit.hierro);
      barrote.position.set(x, (H * 0.85) / 2, 0);
      g.add(barrote);
    }

    [H * 0.2, H * 0.5, H * 0.8].forEach(y => {
      const trav = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(anchoReja + 0.2, 0.08, 0.08), kit.hierro);
      trav.position.set(0, y, 0);
      g.add(trav);
    });

    // Banco de madera
    const banco = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(2.0, 0.45, 0.6), kit.madera);
    banco.position.set(0, 0.225, -1.4);
    g.add(banco);

    // Argolla en muro
    const argolla = new ThreeLib.Mesh(new ThreeLib.TorusGeometry(0.12, 0.03, 4, 8), kit.hierro);
    argolla.position.set(-1.0, 1.2, -2.0);
    g.add(argolla);

    g.userData = { tipo: 'prision' };
    return g;
  }

  // L) Laboratorio de alquimia: caldero burbujeante y mesa de pociones
  function crearLaboratorioProps(ThreeLib, kit, rng) {
    const g = new ThreeLib.Group();

    // Caldero de hierro
    const caldero = new ThreeLib.Mesh(new ThreeLib.SphereGeometry(0.85, 12, 10), kit.hierro);
    caldero.scale.set(1, 0.75, 1);
    caldero.position.y = 0.8;
    g.add(caldero);

    const boca = new ThreeLib.Mesh(new ThreeLib.TorusGeometry(0.72, 0.09, 6, 12), kit.hierro);
    boca.rotation.x = Math.PI / 2;
    boca.position.y = 1.15;
    g.add(boca);

    // Líquido mágico verde
    const liquido = new ThreeLib.Mesh(new ThreeLib.CircleGeometry(0.68, 12), new ThreeLib.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 1.6,
      roughness: 0.1
    }));
    liquido.rotation.x = -Math.PI / 2;
    liquido.position.y = 1.14;
    g.add(liquido);

    const luzCaldero = new ThreeLib.PointLight(0x10b981, 2.5, 16, 1.4);
    luzCaldero.position.set(0, 1.4, 0);
    g.add(luzCaldero);

    // Patas del caldero
    for (let i = 0; i < 3; i++) {
      const ang = (i * Math.PI * 2) / 3;
      const pata = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.06, 0.08, 0.65, 6), kit.hierro);
      pata.position.set(Math.cos(ang) * 0.65, 0.32, Math.sin(ang) * 0.65);
      pata.rotation.z = Math.cos(ang) * 0.25;
      pata.rotation.x = -Math.sin(ang) * 0.25;
      g.add(pata);
    }

    // Mesa de viales
    const mesa = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(1.6, 0.85, 0.8), kit.madera);
    mesa.position.set(2.4, 0.425, 0);
    g.add(mesa);

    [0xef4444, 0x8b5cf6, 0x06b6d4].forEach((col, i) => {
      const vial = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.08, 0.12, 0.32, 6), new ThreeLib.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 1.2
      }));
      vial.position.set(2.0 + i * 0.4, 0.85 + 0.16, 0);
      g.add(vial);
    });

    g.userData = {
      tipo: 'laboratorio',
      update: (t) => {
        luzCaldero.intensity = 2.5 * (0.85 + Math.sin(t * 5.0) * 0.15);
      }
    };
    return g;
  }

  // --- 6. ARQUITECTURA DE SALAS Y CORREDORES ---

  function construirCajaHabitacion(ThreeLib, kit, sala, opciones = {}) {
    const g = new ThreeLib.Group();
    g.position.set(sala.x, sala.y || 0, sala.z);

    const W = sala.w, H = sala.h, D = sala.d;

    // Suelo
    const sueloGeo = new ThreeLib.PlaneGeometry(W, D);
    const suelo = new ThreeLib.Mesh(sueloGeo, kit.sueloLosas);
    suelo.rotation.x = -Math.PI / 2;
    suelo.receiveShadow = true;
    g.add(suelo);

    // Techo: si se especifica sinTecho (o techo: false), se omite para vista cenital e isométrica de editor
    if (opciones.techo !== false && !opciones.sinTecho) {
      const techoGeo = new ThreeLib.PlaneGeometry(W, D);
      const techo = new ThreeLib.Mesh(techoGeo, kit.piedraMuro);
      techo.rotation.x = Math.PI / 2;
      techo.position.y = H;
      techo.name = 'techo_' + sala.id;
      g.add(techo);
    }

    // Muros (Norte, Sur, Este, Oeste con aperturas para puertas si corresponde)
    const grosorMuro = 0.6;

    // Muro Oeste (-X)
    if (!sala.abiertoOeste) {
      const muroO = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(grosorMuro, H, D), kit.piedraMuro);
      muroO.position.set(-W / 2 + grosorMuro / 2, H / 2, 0);
      g.add(muroO);
    }

    // Muro Este (+X)
    if (!sala.abiertoEste) {
      const muroE = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(grosorMuro, H, D), kit.piedraMuro);
      muroE.position.set(W / 2 - grosorMuro / 2, H / 2, 0);
      g.add(muroE);
    }

    // Muro Norte (-Z)
    if (!sala.abiertoNorte) {
      const muroN = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(W, H, grosorMuro), kit.piedraMuro);
      muroN.position.set(0, H / 2, -D / 2 + grosorMuro / 2);
      g.add(muroN);
    }

    // Muro Sur (+Z)
    if (!sala.abiertoSur) {
      const muroS = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(W, H, grosorMuro), kit.piedraMuro);
      muroS.position.set(0, H / 2, D / 2 - grosorMuro / 2);
      g.add(muroS);
    }

    return g;
  }

  // --- 7. DECORACIÓN MODULAR DE HABITACIONES Y CORREDORES ---

  function decorarHabitacion(ThreeLib, kit, sala, estilo, rng, animables, props, config = {}) {
    const g = new ThreeLib.Group();
    g.position.set(sala.x, sala.y || 0, sala.z);

    const cfgProps = config.props || {};
    const W = sala.w;
    const D = sala.d;
    const H = sala.h;

    switch (sala.tipo) {
      case 'entrada': {
        if (cfgProps.antorchas !== false) {
          const aL = crearAntorcha(ThreeLib, kit, estilo.luzAntorchas);
          aL.position.set(-2.8, 2.2, D / 2 - 0.4);
          aL.rotation.y = Math.PI / 2;
          g.add(aL);
          animables.push(aL);
          props.antorchas.push(aL);

          const aR = crearAntorcha(ThreeLib, kit, estilo.luzAntorchas);
          aR.position.set(2.8, 2.2, D / 2 - 0.4);
          aR.rotation.y = -Math.PI / 2;
          g.add(aR);
          animables.push(aR);
          props.antorchas.push(aR);
        }
        break;
      }

      case 'fuente': {
        if (cfgProps.fuentes !== false) {
          const radioF = Math.max(1.8, Math.min(3.6, W * 0.18));
          const fuente = crearFuente(ThreeLib, kit, radioF, 1.4);
          fuente.position.set(0, 0, 0);
          g.add(fuente);
          animables.push(fuente);
          props.fuentes.push(fuente);
        }
        if (cfgProps.musgo !== false) {
          [-W * 0.32, W * 0.32].forEach(vx => {
            [-D * 0.32, D * 0.32].forEach(vz => {
              const veg = crearManchaVegetacion(ThreeLib, kit, rng, rng.range(1.2, 2.0));
              veg.position.set(vx, 0, vz);
              g.add(veg);
            });
          });
        }
        if (cfgProps.hongos !== false) {
          const h1 = crearHongosLuminosos(ThreeLib, kit, rng);
          h1.position.set(-2.2, 0, -1.8);
          g.add(h1);
          const h2 = crearHongosLuminosos(ThreeLib, kit, rng);
          h2.position.set(2.2, 0, 1.8);
          g.add(h2);
        }
        break;
      }

      case 'tesoro': {
        if (cfgProps.cofres !== false) {
          const c1 = crearCofre(ThreeLib, kit, false);
          c1.position.set(0, 0, 0);
          g.add(c1);
          props.cofres.push(c1);

          if (W >= 11) {
            const c2 = crearCofre(ThreeLib, kit, rng.chance(0.5));
            c2.position.set(W * 0.28, 0, -D * 0.18);
            c2.rotation.y = -Math.PI / 4;
            g.add(c2);
            props.cofres.push(c2);
          }
        }
        if (cfgProps.jarrones !== false) {
          [-W * 0.28, W * 0.28].forEach(jx => {
            const jarron = crearJarron(ThreeLib, kit, rng.range(0.9, 1.25), rng.chance(0.25));
            jarron.position.set(jx, 0, D * 0.22);
            g.add(jarron);
          });
        }
        break;
      }

      case 'cripta_columnas': {
        const spanX = Math.max(3.5, W * 0.28);
        const spanZ = Math.max(3.5, D * 0.28);
        [-spanX, spanX].forEach(cx => {
          [-spanZ, spanZ].forEach(cz => {
            const col = crearColumna(ThreeLib, kit, H, Math.min(0.65, W * 0.035));
            col.position.set(cx, 0, cz);
            g.add(col);
          });
        });
        if (cfgProps.sarcofagos !== false) {
          const sarc1 = crearSarcofago(ThreeLib, kit);
          sarc1.position.set(-W * 0.36, 0, 0);
          sarc1.rotation.y = Math.PI / 2;
          g.add(sarc1);

          const sarc2 = crearSarcofago(ThreeLib, kit);
          sarc2.position.set(W * 0.36, 0, 0);
          sarc2.rotation.y = -Math.PI / 2;
          g.add(sarc2);
        }
        break;
      }

      case 'armeria': {
        const arm = crearArmeriaProps(ThreeLib, kit, rng);
        arm.position.set(0, 0, -D * 0.22);
        g.add(arm);

        if (cfgProps.cofres !== false) {
          const cofreArmas = crearCofre(ThreeLib, kit, false);
          cofreArmas.position.set(-W * 0.28, 0, D * 0.2);
          g.add(cofreArmas);
          props.cofres.push(cofreArmas);
        }
        break;
      }

      case 'biblioteca': {
        const bib = crearBibliotecaProps(ThreeLib, kit, rng);
        bib.position.set(0, 0, 0);
        g.add(bib);
        animables.push(bib);
        break;
      }

      case 'prision': {
        const pris = crearPrisionProps(ThreeLib, kit, rng, H);
        pris.position.set(0, 0, 0);
        g.add(pris);
        break;
      }

      case 'laboratorio': {
        const lab = crearLaboratorioProps(ThreeLib, kit, rng);
        lab.position.set(0, 0, 0);
        g.add(lab);
        animables.push(lab);
        break;
      }

      case 'jardin_subterraneo': {
        [-W * 0.25, 0, W * 0.25].forEach((vx, idx) => {
          [-D * 0.25, D * 0.25].forEach((vz, idz) => {
            const veg = crearManchaVegetacion(ThreeLib, kit, rng, rng.range(1.3, 2.2));
            veg.position.set(vx + (idz % 2 ? 0.6 : -0.6), 0, vz);
            g.add(veg);
          });
        });
        if (cfgProps.hongos !== false) {
          [-W * 0.22, W * 0.22].forEach(hx => {
            const h = crearHongosLuminosos(ThreeLib, kit, rng);
            h.position.set(hx, 0, 0);
            g.add(h);
          });
        }
        break;
      }

      case 'sala_jefe': {
        const estradoW = Math.min(W * 0.55, 12);
        const estradoD = Math.min(D * 0.45, 9);
        const estrado = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(estradoW, 0.6, estradoD), kit.piedraMuro);
        estrado.position.set(0, 0.3, -D * 0.15);
        g.add(estrado);

        const tronoBase = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(2.4, 0.9, 1.8), kit.sueloLosas);
        tronoBase.position.set(0, 0.6 + 0.45, -D * 0.15 - 1.0);
        g.add(tronoBase);

        const tronoRespaldo = new ThreeLib.Mesh(new ThreeLib.BoxGeometry(2.2, 3.2, 0.4), kit.piedraMuro);
        tronoRespaldo.position.set(0, 0.6 + 1.6, -D * 0.15 - 1.8);
        g.add(tronoRespaldo);

        const bxOff = Math.min(estradoW * 0.35, 3.4);
        [-bxOff, bxOff].forEach(bx => {
          const brasero = new ThreeLib.Mesh(new ThreeLib.CylinderGeometry(0.65, 0.35, 1.2, 8), kit.hierro);
          brasero.position.set(bx, 0.6, -D * 0.15 + 1.8);
          g.add(brasero);

          const llamaBoss = new ThreeLib.Mesh(new ThreeLib.ConeGeometry(0.35, 0.8, 6), new ThreeLib.MeshBasicMaterial({ color: estilo.luzJefe }));
          llamaBoss.position.set(bx, 1.45, -D * 0.15 + 1.8);
          g.add(llamaBoss);

          const luzBoss = new ThreeLib.PointLight(estilo.luzJefe, 3.6, 26, 1.4);
          luzBoss.position.set(bx, 1.8, -D * 0.15 + 1.8);
          g.add(luzBoss);

          animables.push({
            flicker: (t) => {
              luzBoss.intensity = 3.6 * (0.85 + Math.sin(t * 8.0 + bx) * 0.12);
            }
          });
        });
        break;
      }

      case 'pasillo': {
        if (cfgProps.antorchas !== false && D >= 8) {
          const cantPares = Math.max(1, Math.floor(D / 10));
          for (let p = 0; p < cantPares; p++) {
            const zRel = -D / 2 + (p + 0.5) * (D / cantPares);
            const aL = crearAntorcha(ThreeLib, kit, estilo.luzAntorchas);
            aL.position.set(-W / 2 + 0.25, 2.2, zRel);
            aL.rotation.y = Math.PI / 2;
            g.add(aL);
            animables.push(aL);
            props.antorchas.push(aL);

            const aR = crearAntorcha(ThreeLib, kit, estilo.luzAntorchas);
            aR.position.set(W / 2 - 0.25, 2.2, zRel);
            aR.rotation.y = -Math.PI / 2;
            g.add(aR);
            animables.push(aR);
            props.antorchas.push(aR);
          }
        }
        break;
      }
    }

    return g;
  }

  // --- 8. PLANIFICADOR DE PLANTA PROCEDURAL Y ESTANCIAS ---

  function generarPlanEstancias(config, rng) {
    const radio = typeof config.radio === 'number' ? Math.max(35, config.radio) : (typeof config.radioMazmorra === 'number' ? Math.max(35, config.radioMazmorra) : 60);
    const tamanoMedio = typeof config.tamanoMedio === 'number' ? Math.max(8, config.tamanoMedio) : (typeof config.tamanoSalasMedio === 'number' ? Math.max(8, config.tamanoSalasMedio) : 16);
    const varianzaTamano = typeof config.varianzaTamano === 'number' ? Math.min(1.0, Math.max(0, config.varianzaTamano)) : (typeof config.varianzaTamanoSalas === 'number' ? Math.min(1.0, Math.max(0, config.varianzaTamanoSalas)) : 0.35);
    const numeroSalas = typeof config.numeroSalas === 'number' ? Math.max(4, Math.min(25, config.numeroSalas)) : 6;
    const ramificacion = typeof config.ramificacion === 'number' ? Math.min(1.0, Math.max(0, config.ramificacion)) : 0.5;
    const anchoPasillos = typeof config.anchoPasillos === 'number' ? Math.max(3.5, config.anchoPasillos) : 6.8;
    const alturaTechos = typeof config.alturaTechos === 'number' ? Math.max(3.5, config.alturaTechos) : 5.2;

    const salasPersonalizadas = Array.isArray(config.salasPersonalizadas) ? config.salasPersonalizadas : (Array.isArray(config.estanciasAdicionales) ? config.estanciasAdicionales : []);

    const esDefault = (radio === 60 && numeroSalas === 6 && tamanoMedio === 16 && varianzaTamano === 0.35 && salasPersonalizadas.length === 0 && (!config.customLayout));

    if (esDefault) {
      return [
        { id: 'room_entrada', tipo: 'entrada', nombre: 'Vestíbulo de Entrada', x: 0, y: 0, z: 42, w: 12, d: 14, h: 4.8, abiertoNorte: true },
        { id: 'corridor_1', tipo: 'pasillo', nombre: 'Corredor de los Guardias', x: 0, y: 0, z: 27, w: 6.8, d: 16, h: 4.2, abiertoSur: true, abiertoNorte: true },
        { id: 'room_fuente', tipo: 'fuente', nombre: 'Santuario de la Fuente', x: 0, y: 0, z: 11, w: 18, d: 16, h: 5.6, abiertoSur: true, abiertoNorte: true, abiertoEste: true },
        { id: 'room_tesoro', tipo: 'tesoro', nombre: 'Cámara Secreta del Tesoro', x: 17, y: 0, z: 11, w: 12, d: 12, h: 4.4, abiertoOeste: true },
        { id: 'corridor_2', tipo: 'pasillo', nombre: 'Galería de Arcos', x: 0, y: 0, z: -5, w: 7.2, d: 16, h: 4.5, abiertoSur: true, abiertoNorte: true },
        { id: 'room_columnas', tipo: 'cripta_columnas', nombre: 'Gran Cripta de Columnas', x: 0, y: 0, z: -23, w: 22, d: 20, h: 6.2, abiertoSur: true, abiertoNorte: true },
        { id: 'corridor_3', tipo: 'pasillo', nombre: 'Pasaje del Trono', x: 0, y: 0, z: -38, w: 7.2, d: 10, h: 4.5, abiertoSur: true, abiertoNorte: true },
        { id: 'room_boss', tipo: 'sala_jefe', nombre: 'Cámara del Trono del Caído', x: 0, y: 0, z: -55, w: 24, d: 24, h: 7.5, abiertoSur: true }
      ];
    }

    // --- GENERACIÓN DINÁMICA DE LA RED DE ESTANCIAS ---
    const salas = [];
    const poolTiposIntermedios = ['fuente', 'cripta_columnas', 'armeria', 'biblioteca', 'prision', 'laboratorio', 'jardin_subterraneo'];
    const poolTiposLaterales = ['tesoro', 'armeria', 'biblioteca', 'prision', 'laboratorio', 'jardin_subterraneo'];

    const zEntrada = Math.round(radio - (tamanoMedio * 0.7));
    const zBoss = Math.round(-radio + (tamanoMedio * 0.7));
    const spanZ = zEntrada - zBoss;

    const cantIntermedias = Math.max(2, numeroSalas - 2);
    const pasoZ = spanZ / (cantIntermedias + 1);

    // 1. Vestíbulo de entrada
    const varEntrada = 1 + (rng.range(-1, 1) * varianzaTamano * 0.5);
    const entradaW = Math.round(Math.max(10, tamanoMedio * 0.85 * varEntrada));
    const entradaD = Math.round(Math.max(10, tamanoMedio * 0.95 * varEntrada));
    const roomEntrada = {
      id: 'room_entrada',
      tipo: 'entrada',
      nombre: 'Vestíbulo de Entrada',
      x: 0, y: 0, z: zEntrada,
      w: entradaW, d: entradaD, h: Math.round(alturaTechos * 0.95),
      abiertoNorte: true
    };
    salas.push(roomEntrada);

    let zAnterior = zEntrada;
    let dAnterior = entradaD;

    // 2. Cámaras intermedias a lo largo de la columna vertebral
    let tiposDisponibles = [...poolTiposIntermedios];
    let branchCounter = 0;

    for (let i = 1; i <= cantIntermedias; i++) {
      const zCamara = Math.round(zEntrada - i * pasoZ);

      // Conector / pasillo intermedio
      const gap = (zAnterior - dAnterior / 2) - (zCamara + (tamanoMedio / 2));
      const distCorredor = Math.max(8, gap);
      const zCorredor = Math.round((zAnterior - dAnterior / 2 + zCamara + tamanoMedio / 2) / 2);
      const varPasillo = 1 + (rng.range(-0.5, 0.5) * varianzaTamano * 0.3);
      const wPasillo = Math.round(anchoPasillos * varPasillo);

      salas.push({
        id: `corridor_${i}`,
        tipo: 'pasillo',
        nombre: `Galería del Sector ${i}`,
        x: 0, y: 0, z: zCorredor,
        w: wPasillo, d: distCorredor, h: Math.round(alturaTechos * 0.85),
        abiertoSur: true, abiertoNorte: true
      });

      // Dimensiones con varianza aleatoria
      const factorVarW = 1 + (rng.range(-1, 1) * varianzaTamano);
      const factorVarD = 1 + (rng.range(-1, 1) * varianzaTamano);
      const wCamara = Math.round(Math.max(10, tamanoMedio * factorVarW));
      const dCamara = Math.round(Math.max(10, tamanoMedio * factorVarD));
      const hCamara = Math.round(Math.max(4.2, alturaTechos * (1 + rng.range(-0.3, 0.3) * varianzaTamano)));

      if (tiposDisponibles.length === 0) tiposDisponibles = [...poolTiposIntermedios];
      const tipoIdx = rng.int(0, tiposDisponibles.length - 1);
      const tipoCamara = tiposDisponibles.splice(tipoIdx, 1)[0];
      const tipoDef = TIPOS_ESTANCIA[tipoCamara] || { nombre: 'Cripta Subterránea' };

      const camaraObj = {
        id: `room_${tipoCamara}_${i}`,
        tipo: tipoCamara,
        nombre: `${tipoDef.nombre} (${i})`,
        x: 0, y: 0, z: zCamara,
        w: wCamara, d: dCamara, h: hCamara,
        abiertoSur: true, abiertoNorte: true
      };

      // 3. Ramificaciones laterales (alas Este / Oeste)
      if (rng.chance(ramificacion)) {
        branchCounter++;
        const ladoEste = (branchCounter % 2 === 1);
        if (ladoEste) camaraObj.abiertoEste = true; else camaraObj.abiertoOeste = true;

        const tipoLateral = poolTiposLaterales[rng.int(0, poolTiposLaterales.length - 1)];
        const latDef = TIPOS_ESTANCIA[tipoLateral] || { nombre: 'Cámara Lateral' };
        const latW = Math.round(Math.max(9, tamanoMedio * 0.85 * (1 + rng.range(-1, 1) * varianzaTamano)));
        const latD = Math.round(Math.max(9, tamanoMedio * 0.85 * (1 + rng.range(-1, 1) * varianzaTamano)));
        const distSep = (wCamara / 2 + latW / 2 + 5.0);
        const latX = Math.round(ladoEste ? distSep : -distSep);

        salas.push({
          id: `room_lateral_${branchCounter}`,
          tipo: tipoLateral,
          nombre: `${latDef.nombre} Lateral`,
          x: latX, y: 0, z: zCamara,
          w: latW, d: latD, h: Math.round(hCamara * 0.9),
          abiertoEste: !ladoEste,
          abiertoOeste: ladoEste
        });
      }

      salas.push(camaraObj);
      zAnterior = zCamara;
      dAnterior = dCamara;
    }

    // 4. Último pasillo procesional hacia la sala del jefe
    const distCorredorFinal = Math.max(8, (zAnterior - dAnterior / 2) - (zBoss + tamanoMedio * 0.6));
    const zCorredorFinal = Math.round((zAnterior - dAnterior / 2 + zBoss + tamanoMedio * 0.6) / 2);
    salas.push({
      id: 'corridor_final',
      tipo: 'pasillo',
      nombre: 'Avenida Procesional del Caído',
      x: 0, y: 0, z: zCorredorFinal,
      w: Math.round(anchoPasillos * 1.15), d: distCorredorFinal, h: Math.round(alturaTechos * 0.9),
      abiertoSur: true, abiertoNorte: true
    });

    // 5. Salón del trono del Jefe
    const varBoss = 1 + (rng.range(-0.5, 0.5) * varianzaTamano * 0.4);
    const bossW = Math.round(Math.max(18, tamanoMedio * 1.45 * varBoss));
    const bossD = Math.round(Math.max(18, tamanoMedio * 1.45 * varBoss));
    const bossH = Math.round(alturaTechos * 1.35);

    const roomBoss = {
      id: 'room_boss',
      tipo: 'sala_jefe',
      nombre: 'Cámara del Trono del Caído',
      x: 0, y: 0, z: zBoss,
      w: bossW, d: bossD, h: bossH,
      abiertoSur: true
    };
    salas.push(roomBoss);

    // 6. Añadir cualquier estancia manual personalizada añadida por el usuario
    salasPersonalizadas.forEach((custom, cIdx) => {
      const defT = TIPOS_ESTANCIA[custom.tipo] || { nombre: 'Estancia Personalizada', icono: '🏛️' };
      salas.push({
        id: custom.id || `custom_room_${cIdx + 1}`,
        tipo: custom.tipo || 'cripta_columnas',
        nombre: custom.nombre || `${defT.nombre} ${cIdx + 1}`,
        x: typeof custom.x === 'number' ? custom.x : 0,
        y: typeof custom.y === 'number' ? custom.y : 0,
        z: typeof custom.z === 'number' ? custom.z : 0,
        w: typeof custom.w === 'number' ? custom.w : tamanoMedio,
        d: typeof custom.d === 'number' ? custom.d : tamanoMedio,
        h: typeof custom.h === 'number' ? custom.h : alturaTechos,
        abiertoSur: custom.abiertoSur !== false,
        abiertoNorte: custom.abiertoNorte !== false,
        abiertoEste: !!custom.abiertoEste,
        abiertoOeste: !!custom.abiertoOeste,
        esPersonalizada: true
      });
    });

    return salas;
  }

  // --- 9. GENERADOR PRINCIPAL PROCEDURAL ---

  function generarMazmorra(arg1, arg2) {
    let ThreeLib = null;
    let config = {};

    if (arg1 && (arg1.Mesh || arg1.Group || arg1.Vector3)) {
      ThreeLib = arg1;
      config = arg2 || {};
    } else if (arg1 && typeof arg1 === 'object') {
      config = arg1;
      ThreeLib = resolveThree(arg2);
    } else {
      ThreeLib = resolveThree(arg1);
      config = arg2 || {};
    }

    if (!ThreeLib) {
      ThreeLib = resolveThree();
    }
    if (!ThreeLib) {
      throw new Error('DungeonGenerator: Three.js no está disponible.');
    }

    const THREE_REF = ThreeLib;

    const rng = new PRNG(config.seed || 108);
    const estiloKey = config.estilo || rng.pick(Object.keys(ESTILOS_PIEDRA));
    const estilo = ESTILOS_PIEDRA[estiloKey] || ESTILOS_PIEDRA.cripta_gotica;
    const kit = crearKitMateriales(estilo, THREE_REF);

    const dungeonGroup = new THREE_REF.Group();
    dungeonGroup.name = 'DungeonProcedural_' + (config.id || 'seed_' + rng.s);

    const animables = [];
    const props = {
      antorchas: [],
      cofres: [],
      fuentes: [],
      animables
    };

    // 1. Obtener el plan de salas y pasillos (dinámico o por defecto)
    const salas = generarPlanEstancias(config, rng);

    // 2. Construir geometría estructural y decorar cada sala
    salas.forEach(s => {
      const meshSala = construirCajaHabitacion(THREE_REF, kit, s, config);
      dungeonGroup.add(meshSala);

      const decMesh = decorarHabitacion(THREE_REF, kit, s, estilo, rng, animables, props, config);
      dungeonGroup.add(decMesh);
    });

    // 3. Luz ambiental cenital
    const luzAmbiente = new THREE_REF.AmbientLight(0xffffff, 1.4);
    dungeonGroup.add(luzAmbiente);

    // 4. Calcular Puntos de Aparición (Spawns)
    const roomEntrada = salas.find(s => s.tipo === 'entrada') || salas[0];
    const radioVal = typeof config.radio === 'number' ? config.radio : 60;
    const esDefault = (radioVal === 60 && (!config.numeroSalas || config.numeroSalas === 6) && (!config.customLayout) && (!config.salasPersonalizadas || config.salasPersonalizadas.length === 0));

    const heroZ = esDefault ? 46.0 : (roomEntrada.z + roomEntrada.d / 2 - 1.2);
    const spawns = {
      hero: { x: roomEntrada.x, y: 0.0, z: heroZ, rotY: Math.PI },
      acompanante: { x: roomEntrada.x - 1.2, y: 0.0, z: heroZ + 2.0, rotY: Math.PI },
      elites: [],
      boss: null
    };

    const roomBoss = salas.find(s => s.tipo === 'sala_jefe') || salas[salas.length - 1];
    const bossZ = esDefault ? -58.0 : (roomBoss.z - roomBoss.d * 0.15);
    spawns.boss = {
      x: roomBoss.x,
      y: 0.6,
      z: bossZ,
      name: config.boss && config.boss.name ? config.boss.name : 'Señor del Trono Caído',
      rangoElite: config.boss && config.boss.rangoElite ? config.boss.rangoElite : 10
    };

    if (esDefault) {
      spawns.elites = [
        { x: -1.4, z: 27.0, multiplicador: 4, name: 'Centinela de la Cripta' },
        { x: 1.4, z: 27.0, multiplicador: 4, name: 'Centinela de la Cripta' },
        { x: -1.8, z: -5.0, multiplicador: 4, name: 'Guardián del Santuario' },
        { x: 1.8, z: -5.0, multiplicador: 4, name: 'Guardián del Santuario' },
        { x: -2.8, z: -23.0, multiplicador: 8, name: 'Campeón Esqueleto Élite' },
        { x: 2.8, z: -23.0, multiplicador: 8, name: 'Campeón Esqueleto Élite' }
      ];
    } else {
      const salasIntermedias = salas.filter(s => s.tipo !== 'entrada' && s.tipo !== 'sala_jefe');
      salasIntermedias.forEach((s, idx) => {
        const mult = (idx % 2 === 0) ? 4 : 8;
        const offX = Math.min(s.w * 0.22, 2.4);
        spawns.elites.push({
          x: Math.round(s.x - offX),
          z: Math.round(s.z),
          multiplicador: mult,
          name: `Guardián de ${s.nombre}`
        });
        spawns.elites.push({
          x: Math.round(s.x + offX),
          z: Math.round(s.z),
          multiplicador: mult,
          name: `Guardián de ${s.nombre}`
        });
      });
    }

    const areaTotal = Math.round(salas.reduce((acc, s) => acc + (s.w * s.d), 0));

    return {
      group: dungeonGroup,
      salas,
      estilo,
      kit,
      props,
      spawns,
      areaTotal,
      update: (dt, nowSec) => {
        const t = nowSec || (performance.now() / 1000);
        for (let i = 0; i < animables.length; i++) {
          const item = animables[i];
          if (item.userData && item.userData.flicker) {
            item.userData.flicker(t);
          } else if (item.userData && item.userData.update) {
            item.userData.update(t);
          } else if (typeof item.flicker === 'function') {
            item.flicker(t);
          }
        }
      }
    };
  }

  return {
    TIPOS_ESTANCIA,
    ESTILOS_PIEDRA,
    PRNG,
    crearAtlasMazmorra,
    crearKitMateriales,
    crearAntorcha,
    crearFuente,
    crearCofre,
    crearJarron,
    crearSarcofago,
    crearColumna,
    crearManchaVegetacion,
    crearHongosLuminosos,
    crearArmeriaProps,
    crearBibliotecaProps,
    crearPrisionProps,
    crearLaboratorioProps,
    construirCajaHabitacion,
    decorarHabitacion,
    generarPlanEstancias,
    generarMazmorra
  };
}));
