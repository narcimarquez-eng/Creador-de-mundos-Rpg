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

  // --- 7. GENERADOR PRINCIPAL PROCEDURAL ---

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
    const antorchas = [];
    const cofres = [];
    const fuentes = [];

    // --- DISEÑO DE PLANTA DE LA MAZMORRA (ROOM & CORRIDOR PROGRESSION) ---
    // Estructura lineal y ramificada garantizada con progresión clara:
    // Sala 1: Entrada / Vestíbulo inicial (Spawn Héroe)
    // Pasillo 1 (con antorchas y primer encuentro de esbirros)
    // Sala 2: Santuario / Fuente Arcana (con agua y vegetación)
    // Pasillo 2 (con bifurcación hacia Armería / Tesoro lateral)
    // Sala 3 (Lateral): Cámara del Tesoro (cofres, jarrones, oro)
    // Sala 4: Gran Sala de Columnas y Cripta (sarcófagos y élites x8)
    // Pasillo 3 (Gran Galería procesional hacia el trono)
    // Sala 5: Sala del Trono del Jefe de Mazmorra (Altar del Boss)

    const salas = [
      {
        id: 'room_entrada',
        tipo: 'entrada',
        nombre: 'Vestíbulo de Entrada',
        x: 0, y: 0, z: 42,
        w: 12, d: 14, h: 4.8,
        abiertoNorte: true
      },
      {
        id: 'corridor_1',
        tipo: 'pasillo',
        nombre: 'Corredor de los Guardias',
        x: 0, y: 0, z: 27,
        w: 6.8, d: 16, h: 4.2,
        abiertoSur: true, abiertoNorte: true
      },
      {
        id: 'room_fuente',
        tipo: 'fuente',
        nombre: 'Santuario de la Fuente',
        x: 0, y: 0, z: 11,
        w: 18, d: 16, h: 5.6,
        abiertoSur: true, abiertoNorte: true, abiertoEste: true
      },
      {
        id: 'room_tesoro',
        tipo: 'tesoro',
        nombre: 'Cámara Secreta del Tesoro',
        x: 17, y: 0, z: 11,
        w: 12, d: 12, h: 4.4,
        abiertoOeste: true
      },
      {
        id: 'corridor_2',
        tipo: 'pasillo',
        nombre: 'Galería de Arcos',
        x: 0, y: 0, z: -5,
        w: 7.2, d: 16, h: 4.5,
        abiertoSur: true, abiertoNorte: true
      },
      {
        id: 'room_columnas',
        tipo: 'cripta_columnas',
        nombre: 'Gran Cripta de Columnas',
        x: 0, y: 0, z: -23,
        w: 22, d: 20, h: 6.2,
        abiertoSur: true, abiertoNorte: true
      },
      {
        id: 'corridor_3',
        tipo: 'pasillo',
        nombre: 'Pasaje del Trono',
        x: 0, y: 0, z: -38,
        w: 7.2, d: 10, h: 4.5,
        abiertoSur: true, abiertoNorte: true
      },
      {
        id: 'room_boss',
        tipo: 'sala_jefe',
        nombre: 'Cámara del Trono del Caído',
        x: 0, y: 0, z: -55,
        w: 24, d: 24, h: 7.5,
        abiertoSur: true
      }
    ];

    // Construir geometría estructural de cada sala
    salas.forEach(s => {
      const meshSala = construirCajaHabitacion(THREE_REF, kit, s, config);
      dungeonGroup.add(meshSala);
    });

    // --- DECORACIÓN Y PROPS POR TIPO DE SALA ---

    // 1. Entrada: antorchas gemelas a los lados del portal
    const aEntradaL = crearAntorcha(THREE_REF, kit, estilo.luzAntorchas);
    aEntradaL.position.set(-2.8, 2.2, 47.0);
    aEntradaL.rotation.y = Math.PI / 2;
    dungeonGroup.add(aEntradaL);
    animables.push(aEntradaL);
    antorchas.push(aEntradaL);

    const aEntradaR = crearAntorcha(THREE_REF, kit, estilo.luzAntorchas);
    aEntradaR.position.set(2.8, 2.2, 47.0);
    aEntradaR.rotation.y = -Math.PI / 2;
    dungeonGroup.add(aEntradaR);
    animables.push(aEntradaR);
    antorchas.push(aEntradaR);

    // 2. Corredores: antorchas rítmicas a lo largo de los muros
    [32, 22, -1, -9, -35, -41].forEach(zPos => {
      const aL = crearAntorcha(THREE_REF, kit, estilo.luzAntorchas);
      aL.position.set(-3.2, 2.2, zPos);
      aL.rotation.y = Math.PI / 2;
      dungeonGroup.add(aL);
      animables.push(aL);
      antorchas.push(aL);

      const aR = crearAntorcha(THREE_REF, kit, estilo.luzAntorchas);
      aR.position.set(3.2, 2.2, zPos);
      aR.rotation.y = -Math.PI / 2;
      dungeonGroup.add(aR);
      animables.push(aR);
      antorchas.push(aR);
    });

    // 3. Santuario: Fuente central ornamental con agua y vegetación
    const fuente = crearFuente(THREE_REF, kit, 2.8, 1.4);
    fuente.position.set(0, 0, 11);
    dungeonGroup.add(fuente);
    animables.push(fuente);
    fuentes.push(fuente);

    // Manchas de musgo y yerbas en las esquinas de la sala de la fuente
    [-6, 6].forEach(vx => {
      [-5, 5].forEach(vz => {
        const veg = crearManchaVegetacion(THREE_REF, kit, rng, rng.range(1.1, 1.8));
        veg.position.set(vx, 0, 11 + vz);
        dungeonGroup.add(veg);
      });
    });

    // Hongos luminiscentes cerca del agua
    const hongos1 = crearHongosLuminosos(THREE_REF, kit, rng);
    hongos1.position.set(-2.2, 0, 8.5);
    dungeonGroup.add(hongos1);

    const hongos2 = crearHongosLuminosos(THREE_REF, kit, rng);
    hongos2.position.set(2.4, 0, 13.2);
    dungeonGroup.add(hongos2);

    // 4. Cámara del Tesoro: Cofres con oro, jarrones y botín
    const cofrePrincipal = crearCofre(THREE_REF, kit, false);
    cofrePrincipal.position.set(17, 0, 15);
    cofrePrincipal.rotation.y = Math.PI;
    dungeonGroup.add(cofrePrincipal);
    cofres.push(cofrePrincipal);

    const cofreSecundario = crearCofre(THREE_REF, kit, rng.chance(0.4));
    cofreSecundario.position.set(21, 0, 11);
    cofreSecundario.rotation.y = -Math.PI / 2;
    dungeonGroup.add(cofreSecundario);
    cofres.push(cofreSecundario);

    // Jarrones en la sala del tesoro
    [-1, 1].forEach(side => {
      const jarron = crearJarron(THREE_REF, kit, rng.range(0.85, 1.2), rng.chance(0.2));
      jarron.position.set(17 + side * 1.8, 0, 14.8);
      dungeonGroup.add(jarron);
    });

    // 5. Gran Cripta de Columnas: 4 columnas monumentales y sarcófagos
    [-5.5, 5.5].forEach(cx => {
      [-4.5, 4.5].forEach(cz => {
        const col = crearColumna(THREE_REF, kit, 6.2, 0.55);
        col.position.set(cx, 0, -23 + cz);
        dungeonGroup.add(col);
      });
    });

    // Sarcófagos gemelos a los costados
    const sarc1 = crearSarcofago(THREE_REF, kit);
    sarc1.position.set(-8.2, 0, -23);
    sarc1.rotation.y = Math.PI / 2;
    dungeonGroup.add(sarc1);

    const sarc2 = crearSarcofago(THREE_REF, kit);
    sarc2.position.set(8.2, 0, -23);
    sarc2.rotation.y = -Math.PI / 2;
    dungeonGroup.add(sarc2);

    // 6. Sala del Trono del Jefe: Estrado elevado, Trono y Braseros Púrpuras/Carmesí
    const estrado = new THREE_REF.Mesh(new THREE_REF.BoxGeometry(10, 0.6, 8), kit.piedraMuro);
    estrado.position.set(0, 0.3, -61);
    dungeonGroup.add(estrado);

    // Trono monumental de piedra
    const tronoBase = new THREE_REF.Mesh(new THREE_REF.BoxGeometry(2.4, 0.9, 1.8), kit.sueloLosas);
    tronoBase.position.set(0, 0.6 + 0.45, -62);
    dungeonGroup.add(tronoBase);

    const tronoRespaldo = new THREE_REF.Mesh(new THREE_REF.BoxGeometry(2.2, 3.2, 0.4), kit.piedraMuro);
    tronoRespaldo.position.set(0, 0.6 + 1.6, -62.8);
    dungeonGroup.add(tronoRespaldo);

    // Braseros mágicos ante el trono
    [-3.2, 3.2].forEach(bx => {
      const brasero = new THREE_REF.Mesh(new THREE_REF.CylinderGeometry(0.65, 0.35, 1.2, 8), kit.hierro);
      brasero.position.set(bx, 0.6, -58.5);
      dungeonGroup.add(brasero);

      const llamaBoss = new THREE_REF.Mesh(new THREE_REF.ConeGeometry(0.35, 0.8, 6), new THREE_REF.MeshBasicMaterial({ color: estilo.luzJefe }));
      llamaBoss.position.set(bx, 1.45, -58.5);
      dungeonGroup.add(llamaBoss);

      const luzBoss = new THREE_REF.PointLight(estilo.luzJefe, 3.6, 26, 1.4);
      luzBoss.position.set(bx, 1.8, -58.5);
      dungeonGroup.add(luzBoss);

      animables.push({
        flicker: (t) => {
          luzBoss.intensity = 3.6 * (0.85 + Math.sin(t * 8.0 + bx) * 0.12);
        }
      });
    });

    // Luz ambiental cenital suave
    const luzAmbiente = new THREE_REF.AmbientLight(0xffffff, 1.4);
    dungeonGroup.add(luzAmbiente);

    // Spawn points recomendados y estructurados
    const spawns = {
      hero: { x: 0.0, y: 0.0, z: 46.0, rotY: Math.PI },
      acompanante: { x: -1.2, y: 0.0, z: 48.0, rotY: Math.PI },
      elites: [
        { x: -1.4, z: 27.0, multiplicador: 4, name: 'Centinela de la Cripta' },
        { x: 1.4, z: 27.0, multiplicador: 4, name: 'Centinela de la Cripta' },
        { x: -1.8, z: -5.0, multiplicador: 4, name: 'Guardián del Santuario' },
        { x: 1.8, z: -5.0, multiplicador: 4, name: 'Guardián del Santuario' },
        { x: -2.8, z: -23.0, multiplicador: 8, name: 'Campeón Esqueleto Élite' },
        { x: 2.8, z: -23.0, multiplicador: 8, name: 'Campeón Esqueleto Élite' }
      ],
      boss: {
        x: 0.0,
        y: 0.6,
        z: -58.0,
        name: 'Señor del Trono Caído',
        rangoElite: 10
      }
    };

    return {
      group: dungeonGroup,
      salas,
      estilo,
      kit,
      props: { antorchas, cofres, fuentes, animables },
      spawns,
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
    generarMazmorra
  };
}));
