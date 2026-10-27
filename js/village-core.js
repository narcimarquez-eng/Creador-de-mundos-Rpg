(function () {
  "use strict";

    // --- 1. GENERADOR PSEUDOALEATORIO REPRODUCIBLE (MULBERRY32) ---
    class PRNG {
      constructor(seed) { this.s = seed >>> 0; }
      next() {
        let t = this.s += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      }
      range(min, max) { return min + this.next() * (max - min); }
      int(min, max) { return Math.floor(this.range(min, max + 1)); }
      pick(arr) { return arr[this.int(0, arr.length - 1)]; }
    }

    // Ediciones manuales (js/pueblo-edits.js): índice de las operaciones guardadas en cfg.edits
    function indexEdits(cfg) {
      const EDITS = typeof PuebloEdits !== 'undefined' ? PuebloEdits : null;
      if (!EDITS) return noEdits();
      return EDITS.indexOps(EDITS.activeOps(cfg));
    }
    function noEdits() {
      return {
        removedHouses: new Set(), movedHouses: new Map(), addedHouses: [],
        removedStreets: new Set(), movedStreets: new Map(), addedStreets: new Map(),
        removedWalls: new Set(), gates: new Set(), addedLamps: [], removedLamps: new Set(),
        removedTrees: new Set(), addedTrees: [], removedFences: new Set(), addedFences: [],
        removedRocks: new Set(), addedRocks: [], removedHedges: new Set(), addedHedges: []
      };
    }

    // Hash de texto estable (para dar a cada casa añadida su propio azar)
    function hashStr(s) {
      let h = 2166136261;
      for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
      return h >>> 0;
    }

    // Árboles realistas (js/arboles.js, horneados con ez-tree): geometría y materiales por especie y nivel,
    // compartidos entre generaciones. Un nivel «cerca» (más hojas) junto al pueblo y «lejos» en el bosque.
    const TREE_SCALE = { roble: 0.8, alamo: 0.8, pino: 0.8, arbusto: 1.0 };
    const treeGeo = {};
    const treeMat = {};
    function texturaDe(nombre) {
      const url = typeof TreeLib !== 'undefined' ? TreeLib.textura(nombre) : null;
      if (!url) return null;
      if (!treeMat['tex:' + nombre]) {
        const img = new Image();
        const tex = new THREE.Texture(img);
        tex.magFilter = THREE.NearestFilter;
        img.onload = () => { tex.needsUpdate = true; };
        img.src = url;
        treeMat['tex:' + nombre] = tex;
      }
      return treeMat['tex:' + nombre];
    }
    // { ramas: { geo, mat }, hojas: { geo, mat } } para una especie y un nivel; null si no existe
    function treeAsset(especie, nivel) {
      const key = especie + ':' + nivel;
      if (treeGeo[key]) return treeGeo[key];
      const d = typeof TreeLib !== 'undefined' ? TreeLib.datos(especie, nivel) : null;
      if (!d) return null;
      const geoDe = (p) => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(p.pos, 3));
        g.setAttribute('normal', new THREE.BufferAttribute(p.nrm, 3));
        g.setAttribute('uv', new THREE.BufferAttribute(p.uv, 2));
        g.setIndex(new THREE.BufferAttribute(p.idx, 1));
        return g;
      };
      const matKey = (parte) => especie + ':' + parte;
      if (!treeMat[matKey('ramas')]) {
        treeMat[matKey('ramas')] = new THREE.MeshLambertMaterial({ map: texturaDe(TreeLib.corteza(especie)), side: THREE.DoubleSide });
      }
      if (!treeMat[matKey('hojas')]) {
        // Hojas recortadas por su canal alfa; el tinte de la especie se aplica al material
        treeMat[matKey('hojas')] = new THREE.MeshLambertMaterial({ map: texturaDe(TreeLib.hoja(especie)), color: new THREE.Color(TreeLib.tinta(especie)), alphaTest: 0.5, side: THREE.DoubleSide });
      }
      return (treeGeo[key] = {
        ramas: { geo: geoDe(d.ramas), mat: treeMat[matKey('ramas')] },
        hojas: { geo: geoDe(d.hojas), mat: treeMat[matKey('hojas')] }
      });
    }
    // Detalle de los árboles por distancia a la cámara: dentro de TREE_LOD_M se ven con el nivel «cerca»
    const TREE_LOD_M = 70;
    const treeLodInv = new THREE.Matrix4(), treeLodCam = new THREE.Vector3();
    // Reparte los árboles de un grupo entre «cerca» y «lejos». Sin cámara (cz null) todos van en «cerca»
    function repartirArboles(grupo, cx, cz) {
      const R2 = TREE_LOD_M * TREE_LOD_M;
      let nc = 0, nl = 0;
      grupo.arboles.forEach(a => {
        const cerca = cz === null || (a.x - cx) * (a.x - cx) + (a.z - cz) * (a.z - cz) < R2;
        const parte = cerca ? grupo.cerca : grupo.lejos;
        const k = cerca ? nc++ : nl++;
        parte.ramas.setMatrixAt(k, a.m);
        parte.hojas.setMatrixAt(k, a.m);
        parte.hojas.setColorAt(k, a.color);
      });
      [[grupo.cerca, nc], [grupo.lejos, nl]].forEach(([parte, n]) => {
        [parte.ramas, parte.hojas].forEach(m => { m.count = n; m.visible = n > 0; m.instanceMatrix.needsUpdate = true; });
        parte.hojas.instanceColor.needsUpdate = true;
      });
    }

    // Roca: icosaedro con relieve irregular y aplastado, para que parezca piedra (una sola geometría compartida)
    let rockGeoCache = null;
    function rockGeometry() {
      if (rockGeoCache) return rockGeoCache;
      const g = new THREE.IcosahedronGeometry(1, 1);
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        const n = 0.82 + 0.18 * Math.sin(x * 3.1 + z * 1.7) * Math.cos(y * 2.3 + x * 0.9) + 0.06 * Math.sin(y * 7.3 + z * 5.1);
        p.setXYZ(i, x * n, y * n * 0.75, z * n);
      }
      g.translate(0, 0.15, 0);
      g.computeVertexNormals();
      return (rockGeoCache = g);
    }

    // Especie de un árbol de fábrica: pino para las coníferas; el resto, según su posición (siempre la misma)
    function especieFor(isPine, x, z) {
      if (isPine) return 'pino';
      const h = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;
      return h < 0.5 ? 'roble' : (h < 0.85 ? 'alamo' : 'arbusto');
    }

    // --- 2. CATÁLOGO DE ESTILOS ARQUITECTÓNICOS (LINEAGE 2) ---
    const ARCHITECTURAL_STYLES = {
      l2_fantasy: {
        name: 'Fantasía Lineage 2',
        roofHex: '#1d4ed8',
        roofAltHex: '#1e40af',
        wallTints: [0xffffff, 0xfef3c7, 0xf1f5f9, 0xe0f2fe],
        stoneHex: '#64748b',
        woodHex: '#3e1a04',
        roadHex: '#475569',
        curbHex: '#cbd5e1',
        grass1: '#2d6a4f',
        grass2: '#40916c',
        treeColors: [0x2d6a4f, 0x40916c, 0x1b4332, 0x52b788],
        magicHex: 0x38bdf8,
        defaultWalls: true
      },
      european: {
        name: 'Pueblo Medieval Europeo',
        roofHex: '#9a3412',
        roofAltHex: '#7c2d12',
        wallTints: [0xfef3c7, 0xffedd5, 0xfde68a, 0xf8fafc],
        stoneHex: '#57534e',
        woodHex: '#3b1704',
        roadHex: '#57534e',
        curbHex: '#a8a29e',
        grass1: '#3a5a40',
        grass2: '#344e41',
        treeColors: [0x3a5a40, 0x588157, 0x344e41, 0xa3b18a],
        magicHex: 0xf59e0b,
        defaultWalls: true
      },
      frontier: {
        name: 'Asentamiento Rural de Frontera',
        roofHex: '#a16207',
        roofAltHex: '#713f12',
        wallTints: [0xfde68a, 0xfef08a, 0xd6d3d1, 0xe7e5e4],
        stoneHex: '#78716c',
        woodHex: '#5c2808',
        roadHex: '#785a3c',
        curbHex: '#a88b67',
        grass1: '#4d7c0f',
        grass2: '#3f6212',
        treeColors: [0x3f6212, 0x4d7c0f, 0x65a30d, 0x365314],
        magicHex: 0xfbbf24,
        defaultWalls: false
      },
      elven: {
        name: 'Pueblo Élfico Sagrado',
        roofHex: '#0d9488',
        roofAltHex: '#0284c7',
        wallTints: [0xffffff, 0xf0fdfa, 0xe0f2fe, 0xccfbf1],
        stoneHex: '#cbd5e1',
        woodHex: '#78350f',
        roadHex: '#94a3b8',
        curbHex: '#f1f5f9',
        grass1: '#10b981',
        grass2: '#059669',
        treeColors: [0x10b981, 0x34d399, 0x2dd4bf, 0xf472b6, 0x6ee7b7],
        magicHex: 0x2dd4bf,
        defaultWalls: false
      },
      dwarven: {
        name: 'Aldea Enana de Piedra',
        roofHex: '#334155',
        roofAltHex: '#b45309',
        wallTints: [0x94a3b8, 0xcbd5e1, 0xd6d3d1, 0xe2e8f0],
        stoneHex: '#334155',
        woodHex: '#290e02',
        roadHex: '#1e293b',
        curbHex: '#64748b',
        grass1: '#475569',
        grass2: '#334155',
        treeColors: [0x1e3a2f, 0x334155, 0x3f6212],
        magicHex: 0xf97316,
        defaultWalls: true
      },
      fortified: {
        name: 'Bastión Fortificado',
        roofHex: '#1e293b',
        roofAltHex: '#7f1d1d',
        wallTints: [0xe2e8f0, 0xcbd5e1, 0xf1f5f9],
        stoneHex: '#475569',
        woodHex: '#27120a',
        roadHex: '#334155',
        curbHex: '#94a3b8',
        grass1: '#344e41',
        grass2: '#2b3d34',
        treeColors: [0x2b3d34, 0x3a5a40, 0x1b4332],
        magicHex: 0xef4444,
        defaultWalls: true
      },
      trade: {
        name: 'Ciudad Comercial Fantástica',
        roofHex: '#b91c1c',
        roofAltHex: '#1d4ed8',
        wallTints: [0xffffff, 0xffedd5, 0xfef3c7, 0xe0e7ff],
        stoneHex: '#64748b',
        woodHex: '#451a03',
        roadHex: '#475569',
        curbHex: '#e2e8f0',
        grass1: '#2d6a4f',
        grass2: '#3a5a40',
        treeColors: [0x2d6a4f, 0x40916c, 0xd97706, 0x15803d],
        magicHex: 0xa855f7,
        defaultWalls: true
      }
    };

    // --- 3. GENERACIÓN DE TEXTURAS PBR 2048x2048 CON BUMP MAP PROFUNDO ---
    function createAtlasAndRoadTextures(styleObj) {
      const size = 2048;
      const dCanvas = document.createElement('canvas');
      const bCanvas = document.createElement('canvas');
      dCanvas.width = dCanvas.height = size;
      bCanvas.width = bCanvas.height = size;

      const dCtx = dCanvas.getContext('2d');
      const bCtx = bCanvas.getContext('2d');

      // --- BANDA 1 (Y: 0 - 512): TEJA ESCAMADA CURVA DE ALTA RESOLUCIÓN ---
      dCtx.fillStyle = styleObj.roofHex;
      dCtx.fillRect(0, 0, size, 512);
      bCtx.fillStyle = '#404040';
      bCtx.fillRect(0, 0, size, 512);

      const tileRows = 12;
      const tileCols = 48;
      const rH = 512 / tileRows;
      const cW = size / tileCols;

      for (let r = 0; r < tileRows; r++) {
        const y = r * rH;
        const shift = (r % 2) * (cW * 0.5);
        for (let c = -1; c <= tileCols; c++) {
          const x = c * cW + shift;
          const gD = dCtx.createLinearGradient(x, y, x + cW, y + rH);
          gD.addColorStop(0.0, styleObj.roofAltHex);
          gD.addColorStop(0.45, styleObj.roofHex);
          gD.addColorStop(0.85, '#0f172a');
          dCtx.fillStyle = gD;
          dCtx.fillRect(x + 2, y + 2, cW - 3, rH - 3);

          // Sombra inferior de solape de cada hilada de teja
          dCtx.fillStyle = 'rgba(0,0,0,0.45)';
          dCtx.fillRect(x, y + rH - 5, cW, 5);

          // Bump Map: lomo convexo blanco y canal cóncavo negro
          const gB = bCtx.createLinearGradient(x, y, x + cW, y);
          gB.addColorStop(0.0, '#101010');
          gB.addColorStop(0.5, '#ffffff');
          gB.addColorStop(1.0, '#101010');
          bCtx.fillStyle = gB;
          bCtx.fillRect(x + 2, y + 2, cW - 3, rH - 5);
        }
      }

      // --- BANDA 2 (Y: 512 - 1024): ESTUCO MEDIEVAL + ENTRAMADO DE VIGAS ---
      dCtx.fillStyle = '#f8fafc';
      dCtx.fillRect(0, 512, size, 512);
      bCtx.fillStyle = '#909090';
      bCtx.fillRect(0, 512, size, 512);

      for (let i = 0; i < 24000; i++) {
        const rx = Math.random() * size;
        const ry = 512 + Math.random() * 512;
        dCtx.fillStyle = i % 2 === 0 ? 'rgba(100,116,139,0.22)' : 'rgba(255,255,255,0.4)';
        dCtx.fillRect(rx, ry, 4, 4);
        bCtx.fillStyle = i % 2 === 0 ? '#707070' : '#b5b5b5';
        bCtx.fillRect(rx, ry, 3, 3);
      }

      // Vigas horizontales, verticales y tornapuntas diagonales (Timber Framing)
      dCtx.fillStyle = styleObj.woodHex;
      bCtx.fillStyle = '#e5e5e5';
      const drawBeam = (x, y, w, h) => {
        dCtx.fillStyle = styleObj.woodHex;
        dCtx.fillRect(x, y, w, h);
        dCtx.strokeStyle = '#090502';
        dCtx.lineWidth = 4;
        dCtx.strokeRect(x, y, w, h);
        bCtx.fillStyle = '#e0e0e0';
        bCtx.fillRect(x, y, w, h);
      };

      drawBeam(0, 512, size, 26);
      drawBeam(0, 1024 - 26, size, 26);
      drawBeam(0, 755, size, 20);
      for (let x = 0; x < size; x += 256) {
        drawBeam(x, 512, 26, 512);
        // Riostras diagonales en estilo europeo/fantasía
        dCtx.strokeStyle = styleObj.woodHex;
        dCtx.lineWidth = 20;
        dCtx.beginPath();
        dCtx.moveTo(x + 26, 1024 - 26);
        dCtx.lineTo(x + 128, 775);
        dCtx.lineTo(x + 256, 1024 - 26);
        dCtx.stroke();

        bCtx.strokeStyle = '#d8d8d8';
        bCtx.lineWidth = 20;
        bCtx.beginPath();
        bCtx.moveTo(x + 26, 1024 - 26);
        bCtx.lineTo(x + 128, 775);
        bCtx.lineTo(x + 256, 1024 - 26);
        bCtx.stroke();
      }

      // --- BANDA 3 (Y: 1024 - 1536): SILLERÍA DE PIEDRA BISELADA CON JUNTA PROFUNDA ---
      // Fondo de mortero oscuro y hundido
      dCtx.fillStyle = '#1e293b';
      dCtx.fillRect(0, 1024, size, 512);
      bCtx.fillStyle = '#050505';
      bCtx.fillRect(0, 1024, size, 512);

      const stRows = 8;
      const stH = 512 / stRows;
      const stonePalette = [styleObj.stoneHex, '#64748b', '#475569', '#94a3b8', '#57534e'];

      for (let r = 0; r < stRows; r++) {
        const y = 1024 + r * stH;
        let xCursor = (r % 2 === 0) ? 0 : -70;
        while (xCursor < size) {
          const blockW = 110 + ((r * 37 + xCursor) % 65);
          const pad = 5; // Junta de mortero
          const bx = xCursor + pad;
          const by = y + pad;
          const bw = blockW - pad * 2;
          const bh = stH - pad * 2;

          // Color individual por sillar de piedra
          dCtx.fillStyle = stonePalette[Math.abs(r * 13 + xCursor) % stonePalette.length];
          dCtx.fillRect(bx, by, bw, bh);

          // Bisel iluminado superior/izquierdo del sillar
          dCtx.fillStyle = 'rgba(255,255,255,0.22)';
          dCtx.fillRect(bx, by, bw, 6);
          dCtx.fillRect(bx, by, 6, bh);

          // Sombra de bisel inferior/derecho
          dCtx.fillStyle = 'rgba(0,0,0,0.45)';
          dCtx.fillRect(bx, by + bh - 6, bw, 6);
          dCtx.fillRect(bx + bw - 6, by, 6, bh);

          // Rugosidad interna de la roca
          for (let k = 0; k < 25; k++) {
            dCtx.fillStyle = k % 2 === 0 ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.12)';
            dCtx.fillRect(bx + Math.random() * bw, by + Math.random() * bh, 5, 5);
          }

          // Bump Map: Sillar elevado (blanco/gris claro) y bisel progresivo
          bCtx.fillStyle = '#b0b0b0';
          bCtx.fillRect(bx, by, bw, bh);
          bCtx.fillStyle = '#ffffff';
          bCtx.fillRect(bx + 8, by + 8, bw - 16, bh - 16);

          xCursor += blockW;
        }
      }

      // --- BANDA 4 (Y: 1536 - 2048): TABLAZÓN DE ROBLE + HERRAJES Y REMACHES ---
      dCtx.fillStyle = '#1c0a02';
      dCtx.fillRect(0, 1536, size, 512);
      bCtx.fillStyle = '#101010';
      bCtx.fillRect(0, 1536, size, 512);

      const plankW = 64;
      for (let x = 0; x < size; x += plankW) {
        const gPlank = dCtx.createLinearGradient(x, 1536, x + plankW, 1536);
        gPlank.addColorStop(0.0, '#290e02');
        gPlank.addColorStop(0.2, styleObj.woodHex);
        gPlank.addColorStop(0.8, styleObj.woodHex);
        gPlank.addColorStop(1.0, '#180801');
        dCtx.fillStyle = gPlank;
        dCtx.fillRect(x + 3, 1536, plankW - 6, 512);

        // Vetas de madera
        dCtx.fillStyle = 'rgba(0,0,0,0.22)';
        for (let v = 0; v < 12; v++) {
          dCtx.fillRect(x + 8 + (v * 4), 1536 + ((x + v * 43) % 300), 2, 180);
        }

        // Bump de tablón y remaches metálicos
        bCtx.fillStyle = '#cccccc';
        bCtx.fillRect(x + 4, 1536, plankW - 8, 512);

        // Bandas de forja y clavos
        [1640, 1940].forEach(strapY => {
          dCtx.fillStyle = '#1e293b';
          dCtx.fillRect(x, strapY, plankW, 28);
          dCtx.fillStyle = '#94a3b8';
          dCtx.beginPath();
          dCtx.arc(x + plankW * 0.5, strapY + 14, 6, 0, Math.PI * 2);
          dCtx.fill();

          bCtx.fillStyle = '#ffffff';
          bCtx.fillRect(x, strapY, plankW, 28);
        });
      }

      const atlasTex = new THREE.CanvasTexture(dCanvas);
      atlasTex.wrapS = atlasTex.wrapT = THREE.RepeatWrapping;
      atlasTex.anisotropy = 4;

      const bumpTex = new THREE.CanvasTexture(bCanvas);
      bumpTex.wrapS = bumpTex.wrapT = THREE.RepeatWrapping;
      bumpTex.anisotropy = 4;

      // --- TEXTURA DE CALZADA EMPEDRADA + BUMP MAP ---
      const roadCanvas = document.createElement('canvas');
      const roadBumpCanvas = document.createElement('canvas');
      roadCanvas.width = roadCanvas.height = 512;
      roadBumpCanvas.width = roadBumpCanvas.height = 512;
      const rCtx = roadCanvas.getContext('2d');
      const rbCtx = roadBumpCanvas.getContext('2d');

      rCtx.fillStyle = '#1e293b';
      rCtx.fillRect(0, 0, 512, 512);
      rbCtx.fillStyle = '#101010';
      rbCtx.fillRect(0, 0, 512, 512);

      for (let y = 0; y < 512; y += 20) {
        const shift = (y % 40 === 0) ? 0 : 14;
        for (let x = 32 - shift; x < 480; x += 28) {
          rCtx.fillStyle = ((x + y) % 3 === 0) ? styleObj.roadHex : '#64748b';
          rCtx.fillRect(x + 2, y + 2, 24, 16);
          rCtx.fillStyle = 'rgba(255,255,255,0.18)';
          rCtx.fillRect(x + 2, y + 2, 24, 3);

          rbCtx.fillStyle = '#e5e5e5';
          rbCtx.fillRect(x + 3, y + 3, 22, 14);
        }
      }
      // Grandes losas de bordillo en los márgenes
      rCtx.fillStyle = styleObj.curbHex;
      rCtx.fillRect(0, 0, 32, 512);
      rCtx.fillRect(480, 0, 32, 512);
      rbCtx.fillStyle = '#ffffff';
      rbCtx.fillRect(0, 0, 32, 512);
      rbCtx.fillRect(480, 0, 32, 512);
      for (let y = 0; y < 512; y += 64) {
        rCtx.fillStyle = '#0f172a';
        rCtx.fillRect(0, y, 32, 4);
        rCtx.fillRect(480, y, 32, 4);
        rbCtx.fillStyle = '#000000';
        rbCtx.fillRect(0, y, 32, 4);
        rbCtx.fillRect(480, y, 32, 4);
      }

      const roadTex = new THREE.CanvasTexture(roadCanvas);
      roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping;
      roadTex.anisotropy = 4;

      const roadBumpTex = new THREE.CanvasTexture(roadBumpCanvas);
      roadBumpTex.wrapS = roadBumpTex.wrapT = THREE.RepeatWrapping;

      return { atlasTex, bumpTex, roadTex, roadBumpTex };
    }

    // Textura de Cristal Emplomado Medieval (Romboidal) para Ventanas
    function createLeadedWindowTexture() {
      const c = document.createElement('canvas');
      c.width = c.height = 256;
      const ctx = c.getContext('2d');

      const grad = ctx.createLinearGradient(0, 0, 256, 256);
      grad.addColorStop(0.0, '#0c4a6e');
      grad.addColorStop(0.5, '#0284c7');
      grad.addColorStop(1.0, '#082f49');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);

      // Emplomado en rombos
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      const step = 32;
      for (let i = -256; i <= 512; i += step) {
        ctx.beginPath();
        ctx.moveTo(i, 0); ctx.lineTo(i + 256, 256);
        ctx.moveTo(i, 256); ctx.lineTo(i + 256, 0);
        ctx.stroke();
      }
      // Reflejo diagonal especular
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.beginPath();
      ctx.moveTo(0, 40); ctx.lineTo(140, 0); ctx.lineTo(220, 0); ctx.lineTo(0, 180);
      ctx.fill();

      return new THREE.CanvasTexture(c);
    }

    function createGlowTexture() {
      const glowCanvas = document.createElement('canvas');
      glowCanvas.width = glowCanvas.height = 256;
      const gCtx = glowCanvas.getContext('2d');
      const rad = gCtx.createRadialGradient(128, 128, 2, 128, 128, 128);
      rad.addColorStop(0.0, 'rgba(254, 240, 138, 0.9)');
      rad.addColorStop(0.45, 'rgba(245, 158, 11, 0.4)');
      rad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
      gCtx.fillStyle = rad;
      gCtx.fillRect(0, 0, 256, 256);
      return new THREE.CanvasTexture(glowCanvas);
    }

    // --- 4. ESCENA, CÁMARA Y RENDERIZADOR ---
  function setStat(id, value) {
    if (typeof document === 'undefined') return;
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  const ATMOSPHERES = {
    day:    { glow: 0.5, window: 0.15, pool: 0.0,  plaza: 1.2, forge: 2.0 },
    golden: { glow: 3.2, window: 1.4,  pool: 0.85, plaza: 2.5, forge: 3.0 },
    night:  { glow: 5.0, window: 2.5,  pool: 1.0,  plaza: 3.8, forge: 4.0 }
  };

  // Un "kit" reúne texturas y materiales de UN estilo. Cada pueblo de ese estilo se crea con el kit.
  function createKit(styleKey) {
    const styleObj = (styleKey && ARCHITECTURAL_STYLES[styleKey]) || ARCHITECTURAL_STYLES.l2_fantasy;
    const kitState = { instances: new Set(), levels: { plaza: 1.2, forge: 2.0 } };

    const glowTex = createGlowTexture();
    const leadedGlassTex = createLeadedWindowTexture();

    const matAtlas = new THREE.MeshStandardMaterial({
      roughness: 0.78,
      metalness: 0.12,
      bumpScale: 0.085
    });
    // Doble cara: las mallas de calle se generan con el orden de vértices invertido
    // y, sin esto, solo se verían desde abajo.
    const matRoad = new THREE.MeshStandardMaterial({
      roughness: 0.85,
      metalness: 0.08,
      bumpScale: 0.06,
      side: THREE.DoubleSide
    });
    const matCurb = new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.85 });
    const matWater = new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.12, metalness: 0.65, transparent: true, opacity: 0.86 });
    const matFoliage = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.78, metalness: 0.05 });
    const matTrunk = new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.9 });
    const matIron = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.38, metalness: 0.88 });
    const matGlassGlow = new THREE.MeshStandardMaterial({ color: '#fef08a', emissive: '#f59e0b', emissiveIntensity: 3.0, roughness: 0.15 });
    const matMagicCrystal = new THREE.MeshStandardMaterial({ color: '#e0f2fe', emissive: '#38bdf8', emissiveIntensity: 2.5, roughness: 0.1, metalness: 0.5 });
    const matWindowGlass = new THREE.MeshStandardMaterial({
      map: leadedGlassTex,
      bumpMap: leadedGlassTex,
      bumpScale: 0.02,
      emissive: '#0284c7',
      emissiveIntensity: 0.35,
      roughness: 0.12,
      metalness: 0.75
    });
    const matLightPool = new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const matRock = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9, metalness: 0.05 });
    const matCloth = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.7 });

    // --- 5. COMBINADOR DE GEOMETRÍAS Y CONSTRUCTORES ARQUITECTÓNICOS HD ---
    function mapUVBand(geom, vMin, vMax) {
      const uv = geom.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        uv.setY(i, vMin + uv.getY(i) * (vMax - vMin));
      }
      uv.needsUpdate = true;
    }

    // Fusiona un array de BufferGeometries en una sola malla optimizada sin requerir librerías externas
    function mergeGeometriesList(geoms) {
      let totalVerts = 0;
      let totalIndices = 0;
      geoms.forEach(g => {
        totalVerts += g.attributes.position.count;
        totalIndices += g.index ? g.index.count : g.attributes.position.count;
      });

      const posArr = new Float32Array(totalVerts * 3);
      const normArr = new Float32Array(totalVerts * 3);
      const uvArr = new Float32Array(totalVerts * 2);
      const idxArr = new Uint32Array(totalIndices);

      let vOffset = 0;
      let iOffset = 0;

      geoms.forEach(g => {
        const pos = g.attributes.position;
        const norm = g.attributes.normal;
        const uv = g.attributes.uv;
        const count = pos.count;

        posArr.set(pos.array, vOffset * 3);
        if (norm) normArr.set(norm.array, vOffset * 3);
        if (uv) uvArr.set(uv.array, vOffset * 2);

        if (g.index) {
          const indices = g.index.array;
          for (let i = 0; i < indices.length; i++) {
            idxArr[iOffset + i] = indices[i] + vOffset;
          }
          iOffset += indices.length;
        } else {
          for (let i = 0; i < count; i++) {
            idxArr[iOffset + i] = vOffset + i;
          }
          iOffset += count;
        }
        vOffset += count;
        g.dispose();
      });

      const merged = new THREE.BufferGeometry();
      merged.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
      merged.setAttribute('normal', new THREE.BufferAttribute(normArr, 3));
      merged.setAttribute('uv', new THREE.BufferAttribute(uvArr, 2));
      merged.setIndex(new THREE.BufferAttribute(idxArr, 1));
      return merged;
    }

    // 5.1 Muro con Sillería de Esquina en Relieve (Quoins) y Viga Maestra Superior
    function createDetailedWallGeometry(W, H, D) {
      const parts = [];

      // Cuerpo central de estuco y entramado
      const core = new THREE.BoxGeometry(W, H, D);
      mapUVBand(core, 0.50, 0.75);
      parts.push(core);

      // Faja de piedra divisoria de forjado (Cornisa entre plantas)
      const ledge = new THREE.BoxGeometry(W + 0.24, 0.22, D + 0.24);
      ledge.translate(0, H * 0.5 - 0.11, 0);
      mapUVBand(ledge, 0.25, 0.50);
      parts.push(ledge);

      // Sillares de esquina dentados (Quoins) alternando largo y corto en las 4 esquinas
      const qLevels = 5;
      const qH = (H - 0.24) / qLevels;
      const corners = [
        { sx: -1, sz: -1 },
        { sx:  1, sz: -1 },
        { sx: -1, sz:  1 },
        { sx:  1, sz:  1 }
      ];

      for (let i = 0; i < qLevels; i++) {
        const y = -H * 0.5 + qH * 0.5 + i * qH;
        const even = i % 2 === 0;
        const qw = even ? 0.55 : 0.36;
        const qd = even ? 0.36 : 0.55;

        corners.forEach(c => {
          const quoin = new THREE.BoxGeometry(qw, qH - 0.03, qd);
          quoin.translate(
            c.sx * (W * 0.5 - qw * 0.5 + 0.08),
            y,
            c.sz * (D * 0.5 - qd * 0.5 + 0.08)
          );
          mapUVBand(quoin, 0.25, 0.50); // Banda Piedra
          parts.push(quoin);
        });
      }

      return mergeGeometriesList(parts);
    }

    // 5.2 Ventana Compuesta HD: Repisa de piedra, dintel, marco profundo, parteluz en cruz y contraventanas
    function createDetailedWindowFrameGeometry() {
      const parts = [];
      const w = 1.25, h = 1.48;

      // 1. Repisa / Vierteaguas de piedra tallada inferior con ménsulas
      const sill = new THREE.BoxGeometry(w + 0.42, 0.16, 0.44);
      sill.translate(0, -h * 0.5 - 0.06, 0.08);
      mapUVBand(sill, 0.25, 0.50);
      parts.push(sill);

      [-0.52, 0.52].forEach(cx => {
        const corbel = new THREE.BoxGeometry(0.16, 0.18, 0.32);
        corbel.translate(cx, -h * 0.5 - 0.20, 0.04);
        mapUVBand(corbel, 0.25, 0.50);
        parts.push(corbel);
      });

      // 2. Dintel superior de piedra con clave central resaltada
      const lintel = new THREE.BoxGeometry(w + 0.36, 0.22, 0.38);
      lintel.translate(0, h * 0.5 + 0.08, 0.05);
      mapUVBand(lintel, 0.25, 0.50);
      parts.push(lintel);

      const keystone = new THREE.BoxGeometry(0.28, 0.30, 0.44);
      keystone.translate(0, h * 0.5 + 0.10, 0.07);
      mapUVBand(keystone, 0.25, 0.50);
      parts.push(keystone);

      // 3. Marco perimetral y parteluz en cruz (Mullions de madera)
      const jambL = new THREE.BoxGeometry(0.12, h, 0.32); jambL.translate(-w * 0.5, 0, 0.02); mapUVBand(jambL, 0.0, 0.25);
      const jambR = new THREE.BoxGeometry(0.12, h, 0.32); jambR.translate( w * 0.5, 0, 0.02); mapUVBand(jambR, 0.0, 0.25);
      const mullV = new THREE.BoxGeometry(0.08, h, 0.28); mullV.translate(0, 0, 0.04); mapUVBand(mullV, 0.0, 0.25);
      const mullH = new THREE.BoxGeometry(w, 0.08, 0.28); mullH.translate(0, 0.12, 0.04); mapUVBand(mullH, 0.0, 0.25);
      parts.push(jambL, jambR, mullV, mullH);

      // 4. Contraventanas de madera abiertas a ambos lados
      [-1, 1].forEach(side => {
        const shutter = new THREE.BoxGeometry(0.42, h - 0.06, 0.08);
        shutter.rotateY(side * -0.28);
        shutter.translate(side * (w * 0.5 + 0.26), 0, 0.12);
        mapUVBand(shutter, 0.0, 0.25);
        parts.push(shutter);
      });

      return mergeGeometriesList(parts);
    }

    // 5.3 Puerta Medieval Compuesta HD: Escalones de piedra, jambas de sillería, dintel, tablones y herrajes
    function createDetailedDoorGeometry() {
      const parts = [];
      const w = 1.45, h = 2.28;

      // 1. Escalinata de piedra de entrada (2 peldaños)
      const step1 = new THREE.BoxGeometry(w + 0.9, 0.20, 0.85);
      step1.translate(0, -h * 0.5 + 0.10, 0.32);
      mapUVBand(step1, 0.25, 0.50);
      const step2 = new THREE.BoxGeometry(w + 0.6, 0.20, 0.52);
      step2.translate(0, -h * 0.5 + 0.28, 0.18);
      mapUVBand(step2, 0.25, 0.50);
      parts.push(step1, step2);

      // 2. Jambas de bloques de piedra y gran dintel superior
      [-1, 1].forEach(side => {
        for (let b = 0; b < 4; b++) {
          const bw = (b % 2 === 0) ? 0.34 : 0.26;
          const block = new THREE.BoxGeometry(bw, h / 4 - 0.02, 0.42);
          block.translate(side * (w * 0.5 + 0.12), -h * 0.375 + b * (h / 4), 0.04);
          mapUVBand(block, 0.25, 0.50);
          parts.push(block);
        }
      });

      const archLintel = new THREE.BoxGeometry(w + 0.68, 0.34, 0.48);
      archLintel.translate(0, h * 0.5 + 0.14, 0.06);
      mapUVBand(archLintel, 0.25, 0.50);
      const archKey = new THREE.BoxGeometry(0.36, 0.44, 0.54);
      archKey.translate(0, h * 0.5 + 0.18, 0.08);
      mapUVBand(archKey, 0.25, 0.50);
      parts.push(archLintel, archKey);

      // 3. Hoja de madera maciza con travesaños
      const leaf = new THREE.BoxGeometry(w, h, 0.24);
      mapUVBand(leaf, 0.0, 0.25);
      parts.push(leaf);

      [-0.55, 0.55].forEach(by => {
        const brace = new THREE.BoxGeometry(w - 0.1, 0.14, 0.30);
        brace.translate(0, by, 0.02);
        mapUVBand(brace, 0.0, 0.25);
        parts.push(brace);
      });

      return mergeGeometriesList(parts);
    }

    // 5.4 Cubierta a dos aguas con cabrios de madera vistos bajo el alero (Rafter tails)
    function createRoofGeometry(width, depth, ridgeH, overX, overZ, thick) {
      const parts = [];
      const hw = width * 0.5, slope = ridgeH / hw, drop = slope * overX, totD = depth + overZ * 2.0;

      const shape = new THREE.Shape();
      shape.moveTo(0, ridgeH + thick);
      shape.lineTo(-hw - overX, -drop + thick);
      shape.lineTo(-hw - overX, -drop);
      shape.lineTo(-hw, 0.0);
      shape.lineTo(0, ridgeH);
      shape.lineTo(hw, 0.0);
      shape.lineTo(hw + overX, -drop);
      shape.lineTo(hw + overX, -drop + thick);
      shape.closePath();

      const roofShell = new THREE.ExtrudeGeometry(shape, { steps: 1, depth: totD, bevelEnabled: false });
      roofShell.translate(0, 0, -totD * 0.5);
      mapUVBand(roofShell, 0.75, 1.00);
      roofShell.computeVertexNormals();
      parts.push(roofShell);

      // Cabrios/Canecillos de madera bajo los aleros laterales y cumbrera
      const ridgeBeam = new THREE.BoxGeometry(0.28, 0.28, totD + 0.3);
      ridgeBeam.translate(0, ridgeH + thick, 0);
      mapUVBand(ridgeBeam, 0.0, 0.25);
      parts.push(ridgeBeam);

      for (let z = -totD * 0.45; z <= totD * 0.45; z += 1.25) {
        [-1, 1].forEach(side => {
          const rafter = new THREE.BoxGeometry(0.45, 0.16, 0.16);
          rafter.translate(side * (hw + overX * 0.55), -drop * 0.65, z);
          mapUVBand(rafter, 0.0, 0.25);
          parts.push(rafter);
        });
      }

      return mergeGeometriesList(parts);
    }

    // 5.5 Chimenea con corona escalonada de piedra y tiro cerámico
    function createDetailedChimneyGeometry() {
      const parts = [];
      const shaft = new THREE.BoxGeometry(0.92, 2.3, 0.92);
      mapUVBand(shaft, 0.25, 0.50);
      parts.push(shaft);

      const crown = new THREE.BoxGeometry(1.16, 0.24, 1.16);
      crown.translate(0, 1.18, 0);
      mapUVBand(crown, 0.25, 0.50);
      parts.push(crown);

      const pot = new THREE.CylinderGeometry(0.22, 0.26, 0.45, 8);
      pot.translate(0, 1.48, 0);
      mapUVBand(pot, 0.75, 1.00);
      parts.push(pot);

      return mergeGeometriesList(parts);
    }

    function createGableGeometry(width, ridgeH, thick) {
      const hw = width * 0.5;
      const shape = new THREE.Shape();
      shape.moveTo(-hw, 0.0); shape.lineTo(hw, 0.0); shape.lineTo(0, ridgeH); shape.closePath();
      const geom = new THREE.ExtrudeGeometry(shape, { steps: 1, depth: thick, bevelEnabled: false });
      geom.translate(0, 0, -thick * 0.5);
      mapUVBand(geom, 0.50, 0.75);
      geom.computeVertexNormals();
      return geom;
    }

    function makeInstanced(geom, mat, maxCount) {
      const safeCount = Math.max(1, maxCount);
      const mesh = new THREE.InstancedMesh(geom, mat, safeCount);
      mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;

      const zeroMat = new THREE.Matrix4().makeScale(0, 0, 0);
      const white = new THREE.Color(0xffffff);
      for (let i = 0; i < safeCount; i++) {
        mesh.setMatrixAt(i, zeroMat);
        mesh.setColorAt(i, white);
      }
      return mesh;
    }

    // --- 6. MOTOR GENERADOR DE PUEBLOS LINEAGE 2 ---
    class LineageVillageWorld {
      constructor(scene, opts) {
        this.scene = scene;
        this.objects = [];
        this.colliders = [];
        this.animatedCrystals = [];
        this.waterMesh = null;
        this.cfg = null;
        this.riverWidth = 14.0;
        this.bridgeBounds = null; this.bridgeTopAt = null;
        this.sampleHousePos = new THREE.Vector3(-13, 2, 13);
        this.exitPaths = [];
        this.extraBridges = [];
        this.opts = opts || {};
        this.plazaLight = new THREE.PointLight('#38bdf8', kitState.levels.plaza, 55, 1.5);
        this.forgeLight = new THREE.PointLight('#f97316', kitState.levels.forge, 35, 1.5);
        kitState.instances.add(this);
      }

      // Reparte los árboles entre «cerca» y «lejos» según la distancia a la cámara (solo si el visor lo pide).
      // Se recalcula al moverse la cámara más de 1 m.
      updateTreeLod(camera) {
        if (!this.treeLod) return;
        treeLodInv.copy(this.scene.matrixWorld).invert();
        treeLodCam.setFromMatrixPosition(camera.matrixWorld).applyMatrix4(treeLodInv);
        if (this.treeLodPos && this.treeLodPos.distanceToSquared(treeLodCam) < 1) return;
        this.treeLodPos = (this.treeLodPos || new THREE.Vector3()).copy(treeLodCam);
        this.treeLod.forEach(g => repartirArboles(g, treeLodCam.x, treeLodCam.z));
      }

      update(elapsed) {
        if (this.waterMesh) {
          this.waterMesh.position.y = Math.sin(elapsed * 2.2) * 0.06;
        }
        for (let i = 0; i < this.animatedCrystals.length; i++) {
          const item = this.animatedCrystals[i];
          item.mesh.rotation.y = elapsed * 1.4 + item.phase;
          item.mesh.position.y = item.baseY + Math.sin(elapsed * 2.5 + item.phase) * 0.35;
        }
      }

      destroy() {
        this.clear();
        kitState.instances.delete(this);
      }

      clear() {
        this.extraBridges = [];
        if (this.scene) {
          this.scene.remove(this.plazaLight);
          this.scene.remove(this.forgeLight);
        }
        this.objects.forEach(obj => {
          this.scene.remove(obj);
          if (obj.geometry) obj.geometry.dispose();
        });
        this.objects = [];
        this.colliders = [];
        this.animatedCrystals = [];
        this.waterMesh = null;
        this.bridgeBounds = null; this.bridgeTopAt = null;
        this.exitPaths = [];
      }

      getMainRoadX(z) {
        if (!this.cfg) return 0;
        if (this.cfg.trazado === 'manzanas') {
          const g = this.manzanaGeo;
          return g ? g.A * Math.sin(Math.PI * z / g.p) : 0;
        }
        const plazaDamp = Math.min(1.0, Math.abs(z) / 22.0);
        return Math.sin(z * 0.035) * this.cfg.curve * plazaDamp;
      }

      getRiverX(z) {
        if (!this.cfg) return 38;
        const baseOffset = 34 + (this.cfg.size - 2) * 8;
        return baseOffset + Math.sin(z * 0.04) * this.cfg.curve;
      }

      getTerrainHeight(x, z) {
        if (!this.cfg) return 0;
        const reliefScale = (this.cfg.relief / 100) * 6.5;
        const rDist = Math.hypot(x, z);
        const plazaFlatten = Math.min(1.0, Math.max(0.0, (rDist - 16.0) / 18.0));

        let h = 0;
        // Con terrainBase (el visor) el suelo es el del mundo, con la plaza central plana
        if (this.terrainBase) {
          h = plazaFlatten * this.terrainBase(x, z);
        } else if (this.cfg.terrainType === 'plains') {
          h = (Math.sin(x * 0.025) * Math.cos(z * 0.025)) * reliefScale * 0.35 * plazaFlatten;
        } else if (this.cfg.terrainType === 'hills') {
          h = (Math.sin(x * 0.032) * Math.cos(z * 0.028) + Math.sin((x + z) * 0.018) * 0.7) * reliefScale * plazaFlatten;
        } else if (this.cfg.terrainType === 'highlands') {
          const rim = Math.max(0, (rDist - 65) * 0.12);
          h = ((Math.sin(x * 0.03) * Math.cos(z * 0.03)) * reliefScale * 0.6 + rim) * plazaFlatten;
        } else {
          const valleyRise = Math.max(0, (rDist - 45) * 0.075) * (this.cfg.relief / 60);
          h = (Math.sin(x * 0.028) * Math.cos(z * 0.028) * reliefScale * 0.55 + valleyRise) * plazaFlatten;
        }

        if (this.cfg.hasRiver) {
          const rx = this.getRiverX(z);
          const distRiver = Math.abs(x - rx);
          const bankSpan = this.riverWidth * 0.85;
          if (distRiver < bankSpan) {
            const t = distRiver / bankSpan;
            const riverBed = -2.6 * Math.cos(t * Math.PI * 0.5);
            h = h * t + riverBed * (1.0 - t);
          }
        }
        return h;
      }

      getWalkableHeight(x, z) {
        if (this.cfg && this.cfg.hasRiver && this.bridgeBounds) {
          const b = this.bridgeBounds;
          if (x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ && this.bridgeTopAt) {
            return this.bridgeTopAt((x - b.minX) / (b.maxX - b.minX)) + 0.18;
          }
        }
        for (const br of this.extraBridges) {
          const dx = x - br.cx, dz = z - br.cz;
          const u = dx * br.ux + dz * br.uz;
          const v = -dx * br.uz + dz * br.ux;
          if (Math.abs(v) > br.hv) continue;
          const au = Math.abs(u);
          const s01 = Math.min(1, Math.max(0, (u + br.hu) / (2 * br.hu)));
          if (au <= br.hu) return br.topAt(s01) + 0.18;
          if (au <= br.hu + 3.0) {
            const borde = br.topAt(u > 0 ? 1 : 0) + 0.18;
            const ground = this.getTerrainHeight(x, z) + 0.18;
            const t = (au - br.hu) / 3.0;
            return borde + (ground - borde) * t;
          }
        }
        return this.getTerrainHeight(x, z) + 0.18;
      }

      isWaterHazard(x, z, radius) {
        for (const br of this.extraBridges) {
          const dx = x - br.cx, dz = z - br.cz;
          const u = dx * br.ux + dz * br.uz;
          const v = -dx * br.uz + dz * br.ux;
          if (Math.abs(u) <= br.hu && Math.abs(v) <= br.hv - radius) return false;
        }
        if (!this.cfg || !this.cfg.hasRiver) return false;
        if (this.bridgeBounds) {
          const b = this.bridgeBounds;
          if (x >= b.minX && x <= b.maxX && z >= b.minZ + radius && z <= b.maxZ - radius) {
            return false;
          }
        }
        const rx = this.getRiverX(z);
        return Math.abs(x - rx) < (this.riverWidth * 0.5 + radius);
      }

      // Calzada con grosor: la superficie usa la piedra de los puentes y los bordes bajan por debajo del terreno,
      // así no queda como una lámina sobre el suelo. Sigue el terreno (subdividido cada 1 m) con su altura real.
      buildConformingRoadMesh(puntos, width, yOffset = 0.16) {
        const points = [];
        for (let i = 0; i < puntos.length; i++) {
          if (i > 0) {
            const a = puntos[i - 1], b = puntos[i];
            const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.z - a.z)));
            for (let k = 1; k < n; k++) points.push({ x: a.x + (b.x - a.x) * k / n, z: a.z + (b.z - a.z) * k / n });
          }
          points.push(puntos[i]);
        }
        const segs = points.length - 1;
        const positions = new Float32Array((segs + 1) * 2 * 3);
        const uvs = new Float32Array((segs + 1) * 2 * 2);
        const indices = [];
        const bordes = [];

        let accLen = 0;
        for (let i = 0; i <= segs; i++) {
          const p = points[i];
          const pPrev = points[Math.max(0, i - 1)];
          const pNext = points[Math.min(segs, i + 1)];

          if (i > 0) {
            accLen += Math.hypot(p.x - pPrev.x, p.z - pPrev.z);
          }

          const tx = pNext.x - pPrev.x;
          const tz = pNext.z - pPrev.z;
          const len = Math.hypot(tx, tz) || 1;
          const nx = -tz / len;
          const nz = tx / len;

          const lx = p.x + nx * (width * 0.5);
          const lz = p.z + nz * (width * 0.5);
          const rx = p.x - nx * (width * 0.5);
          const rz = p.z - nz * (width * 0.5);

          const ly = this.getTerrainHeight(lx, lz) + yOffset;
          const ry = this.getTerrainHeight(rx, rz) + yOffset;

          const vIdx = i * 2;
          positions[vIdx * 3] = lx;
          positions[vIdx * 3 + 1] = ly;
          positions[vIdx * 3 + 2] = lz;

          positions[(vIdx + 1) * 3] = rx;
          positions[(vIdx + 1) * 3 + 1] = ry;
          positions[(vIdx + 1) * 3 + 2] = rz;

          // Piedra de sillería como en los puentes: 0..1 a lo ancho y un bloque cada 5 m a lo largo
          const v = 0.25 + 0.25 * ((accLen * 0.2) % 1);
          uvs[vIdx * 2] = 0;
          uvs[vIdx * 2 + 1] = v;
          uvs[(vIdx + 1) * 2] = 1;
          uvs[(vIdx + 1) * 2 + 1] = v;

          if (i < segs) {
            const a = i * 2, b = i * 2 + 1, c = (i + 1) * 2, d = (i + 1) * 2 + 1;
            // Orden antihorario visto desde arriba: la cara de arriba es la que se ve y tiene la normal correcta
            indices.push(a, c, b, b, c, d);
          }

          const bajo = (x, z, y) => Math.min(y, this.getTerrainHeight(x, z)) - 0.9;
          bordes.push({
            l: [lx, ly, lz], r: [rx, ry, rz],
            lb: [lx, bajo(lx, lz, ly), lz], rb: [rx, bajo(rx, rz, ry), rz], v
          });
        }

        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        geom.setIndex(indices);
        geom.computeVertexNormals();

        const grupo = new THREE.Group();
        const superficie = new THREE.Mesh(geom, matAtlas);
        superficie.receiveShadow = true;
        grupo.add(superficie);

        // Paredes de los dos bordes: caras en los dos sentidos para que se vean desde cualquier lado
        const wPos = [], wUv = [], wIdx = [];
        const cara = (p, q, pb, qb, vp, vq) => {
          const base = wPos.length / 3;
          wPos.push(...p, ...q, ...qb, ...pb);
          wUv.push(0, vp, 1, vq, 1, vq, 0, vp);
          wIdx.push(base, base + 1, base + 2, base, base + 2, base + 3, base, base + 2, base + 1, base, base + 3, base + 2);
        };
        for (let i = 0; i < segs; i++) {
          const A = bordes[i], B = bordes[i + 1];
          cara(A.l, B.l, A.lb, B.lb, A.v, B.v);
          cara(A.r, B.r, A.rb, B.rb, A.v, B.v);
        }
        const wGeom = new THREE.BufferGeometry();
        wGeom.setAttribute('position', new THREE.Float32BufferAttribute(wPos, 3));
        wGeom.setAttribute('uv', new THREE.Float32BufferAttribute(wUv, 2));
        wGeom.setIndex(wIdx);
        wGeom.computeVertexNormals();
        const paredes = new THREE.Mesh(wGeom, matAtlas);
        paredes.receiveShadow = true;
        grupo.add(paredes);
        return grupo;
      }

      buildSpecialBuilding(type, x, z, rotY, group) {
        const y0 = this.getTerrainHeight(x, z);
        const bGroup = new THREE.Group();
        bGroup.position.set(x, y0, z);
        bGroup.rotation.y = rotY;

        const foundG = new THREE.BoxGeometry(10.5, 3.2, 11.5);
        mapUVBand(foundG, 0.25, 0.50);
        const foundM = new THREE.Mesh(foundG, matAtlas);
        foundM.position.y = -1.1;
        foundM.castShadow = foundM.receiveShadow = true;
        bGroup.add(foundM);

        if (type === 'temple') {
          const naveG = createDetailedWallGeometry(9.2, 7.2, 12.5);
          const naveM = new THREE.Mesh(naveG, matAtlas);
          naveM.position.y = 3.6; naveM.castShadow = naveM.receiveShadow = true;
          bGroup.add(naveM);

          const roofM = new THREE.Mesh(createRoofGeometry(9.2, 12.5, 3.4, 0.6, 0.6, 0.25), matAtlas);
          roofM.position.y = 7.2; roofM.castShadow = true;
          bGroup.add(roofM);

          [-3.2, -1.1, 1.1, 3.2].forEach(cx => {
            const colG = new THREE.CylinderGeometry(0.38, 0.46, 5.5, 12);
            mapUVBand(colG, 0.25, 0.50);
            const colM = new THREE.Mesh(colG, matAtlas);
            colM.position.set(cx, 2.75, 6.8); colM.castShadow = true;
            bGroup.add(colM);
          });

          const towG = new THREE.BoxGeometry(4.0, 15.5, 4.0);
          mapUVBand(towG, 0.25, 0.50);
          const towM = new THREE.Mesh(towG, matAtlas);
          towM.position.set(0, 7.75, -4.5); towM.castShadow = true;
          bGroup.add(towM);

          const spireG = new THREE.ConeGeometry(3.0, 5.5, 4);
          spireG.rotateY(Math.PI / 4); mapUVBand(spireG, 0.75, 1.00);
          const spireM = new THREE.Mesh(spireG, matAtlas);
          spireM.position.set(0, 18.25, -4.5); spireM.castShadow = true;
          bGroup.add(spireM);

          this.colliders.push({ type: 'box', minX: x - 5.5, maxX: x + 5.5, minZ: z - 6.8, maxZ: z + 7.2 });

        } else if (type === 'blacksmith') {
          const bodyG = createDetailedWallGeometry(6.5, 4.2, 7.5);
          const bodyM = new THREE.Mesh(bodyG, matAtlas);
          bodyM.position.set(-1.2, 2.1, 0); bodyM.castShadow = bodyM.receiveShadow = true;
          bGroup.add(bodyM);

          const roofM = new THREE.Mesh(createRoofGeometry(6.5, 7.5, 2.1, 0.5, 0.5, 0.2), matAtlas);
          roofM.position.set(-1.2, 4.2, 0); roofM.castShadow = true;
          bGroup.add(roofM);

          const furnaceG = new THREE.BoxGeometry(2.8, 7.5, 2.8);
          mapUVBand(furnaceG, 0.25, 0.50);
          const furnaceM = new THREE.Mesh(furnaceG, matAtlas);
          furnaceM.position.set(2.8, 3.75, -1.5); furnaceM.castShadow = true;
          bGroup.add(furnaceM);

          const coalsM = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 1.6), matGlassGlow);
          coalsM.position.set(2.8, 1.0, 0.2);
          bGroup.add(coalsM);

          const anvilM = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.75, 0.5), matIron);
          anvilM.position.set(2.5, 0.4, 2.2); anvilM.castShadow = true;
          bGroup.add(anvilM);

          const worldForgePos = new THREE.Vector3(2.8, 2.5, 0.2).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY).add(new THREE.Vector3(x, y0, z));
          this.forgeLight.position.copy(worldForgePos);

          this.colliders.push({ type: 'box', minX: x - 4.8, maxX: x + 4.8, minZ: z - 4.5, maxZ: z + 4.5 });

        } else if (type === 'tavern') {
          const mainG = createDetailedWallGeometry(8.5, 6.0, 8.0);
          const mainM = new THREE.Mesh(mainG, matAtlas);
          mainM.position.y = 3.0; mainM.castShadow = mainM.receiveShadow = true;
          bGroup.add(mainM);

          const roofM = new THREE.Mesh(createRoofGeometry(8.5, 8.0, 2.5, 0.6, 0.6, 0.22), matAtlas);
          roofM.position.y = 6.0; roofM.castShadow = true;
          bGroup.add(roofM);

          const porchG = new THREE.BoxGeometry(8.2, 0.25, 2.6);
          mapUVBand(porchG, 0.0, 0.25);
          const porchM = new THREE.Mesh(porchG, matAtlas);
          porchM.position.set(0, 2.8, 5.0); porchM.castShadow = true;
          bGroup.add(porchM);

          const signM = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.12), matGlassGlow);
          signM.position.set(3.2, 3.8, 5.2);
          bGroup.add(signM);

          this.colliders.push({ type: 'box', minX: x - 4.8, maxX: x + 4.8, minZ: z - 4.5, maxZ: z + 5.2 });

        } else {
          const guildG = new THREE.CylinderGeometry(4.2, 4.6, 9.5, 8);
          mapUVBand(guildG, 0.25, 0.50);
          const guildM = new THREE.Mesh(guildG, matAtlas);
          guildM.position.y = 4.75; guildM.castShadow = guildM.receiveShadow = true;
          bGroup.add(guildM);

          const domeG = new THREE.ConeGeometry(4.8, 4.2, 8);
          mapUVBand(domeG, 0.75, 1.00);
          const domeM = new THREE.Mesh(domeG, matAtlas);
          domeM.position.y = 11.6; domeM.castShadow = true;
          bGroup.add(domeM);

          const orbM = new THREE.Mesh(new THREE.OctahedronGeometry(0.9, 0), matMagicCrystal);
          orbM.position.y = 14.8;
          bGroup.add(orbM);
          this.animatedCrystals.push({ mesh: orbM, baseY: 14.8, phase: x + z });

          this.colliders.push({ type: 'circle', x: x, z: z, r: 4.6 });
        }

        group.add(bGroup);
      }

      // --- SALIDAS HACIA LOS CAMINOS DEL MUNDO ---
      // cfg.exits = [{ angle (grados, atan2(z, x) en coordenadas locales del pueblo), gate, to }]
      // Cada salida es una calle recta que sale de la plaza central, atraviesa la muralla por
      // un hueco a su mismo ángulo y continúa hasta el borde del terreno. Así el camino del
      // mundo entra en el pueblo por el hueco que le corresponde.
      buildExitPaths(cfg, townRadius, worldSize) {
        const exits = Array.isArray(cfg.exits) ? cfg.exits : [];
        const half = worldSize / 2 - 1.5;
        const PLAZA_R = 16.0;
        const step = 3.5;
        return exits.map(ex => {
          const a = ((Number(ex.angle) || 0) % 360 + 360) % 360 * Math.PI / 180;
          const ca = Math.cos(a), sa = Math.sin(a);
          const t = half / Math.max(Math.abs(ca), Math.abs(sa));
          const start = { x: ca * PLAZA_R, z: sa * PLAZA_R };
          const end = { x: ca * t, z: sa * t };
          const n = Math.max(1, Math.ceil(Math.hypot(end.x - start.x, end.z - start.z) / step));
          const points = [];
          for (let i = 0; i <= n; i++) {
            points.push({ x: start.x + (end.x - start.x) * i / n, z: start.z + (end.z - start.z) * i / n });
          }
          return { exit: ex, angle: a, gate: ex.gate || null, points, end };
        });
      }

      // Parte cada salida en tramos de calle y añade puentes donde cruza el río.
      buildExitRoadPieces(cfg, paths, roadsGroup, matAtlas) {
        if (!paths.length) return [];
        const pieces = [];
        paths.forEach(path => {
          this.splitAtRiver(cfg, path.points, cfg.roadWidth, roadsGroup, matAtlas).forEach(pc => pieces.push(pc));
        });
        return pieces;
      }

      // Tablero de piedra entre A y B. Se parte en tramos que siguen la pendiente y, con arco, forman una joroba
      // suave: los extremos quedan a la altura de las orillas. Devuelve la altura de la superficie en s (0 a 1).
      construirTablero(grupo, A, B, o) {
        const dx = B.x - A.x, dz = B.z - A.z, L = Math.hypot(dx, dz) || 1;
        const ux = dx / L, uz = dz / L;
        const Zv = new THREE.Vector3(-uz, 0, ux);           // horizontal, a lo ancho del tablero
        const ox = (o.lateral || 0) * Zv.x, oz = (o.lateral || 0) * Zv.z;
        const topAt = s => o.hA + (o.hB - o.hA) * s + o.arco * Math.sin(Math.PI * s) + (o.arriba || 0);
        for (let k = 0; k < o.tramos; k++) {
          const s0 = k / o.tramos, s1 = (k + 1) / o.tramos;
          const p0 = { x: A.x + dx * s0 + ox, z: A.z + dz * s0 + oz, y: topAt(s0) };
          const p1 = { x: A.x + dx * s1 + ox, z: A.z + dz * s1 + oz, y: topAt(s1) };
          const X = new THREE.Vector3(p1.x - p0.x, p1.y - p0.y, p1.z - p0.z);
          const len = X.length();
          X.normalize();
          const Y = new THREE.Vector3().crossVectors(Zv, X).normalize();
          const geo = new THREE.BoxGeometry(len + 0.05, o.grosor, o.ancho);
          mapUVBand(geo, 0.25, 0.50);
          const m = new THREE.Mesh(geo, o.mat);
          m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Zv));
          // La cara de arriba del bloque queda en la mitad del tramo
          m.position.set(
            (p0.x + p1.x) / 2 - Y.x * o.grosor / 2,
            (p0.y + p1.y) / 2 - Y.y * o.grosor / 2,
            (p0.z + p1.z) / 2 - Y.z * o.grosor / 2
          );
          m.castShadow = m.receiveShadow = true;
          grupo.add(m);
        }
        return topAt;
      }

      // Corta un camino donde cruza el río y pone un puente pequeño en cada cruce.
      // El cruce por el puente principal ya tiene tablero, así que solo se corta el camino.
      splitAtRiver(cfg, pts, width, roadsGroup, matAtlas) {
        const pieces = [];
        if (!cfg.hasRiver) {
          pieces.push(pts);
          return pieces;
        }
        const band = this.riverWidth * 0.65;
        const inBand = q => Math.abs(q.x - this.getRiverX(q.z)) < band;
        const onMainBridge = q => Math.abs(q.z) < cfg.roadWidth * 0.55 + 1.5;

        const inside = pts.map(inBand);
        let cur = [];
        for (let i = 0; i < pts.length; i++) {
          if (!inside[i]) { cur.push(pts[i]); continue; }
          if (cur.length > 1) pieces.push(cur);
          cur = [];
          // Inicio de un cruce: buscar su final
          if (i > 0 && !inside[i - 1]) {
            let j = i;
            while (j + 1 < pts.length && inside[j + 1]) j++;
            const a = pts[i - 1], b = pts[j + 1];
            if (!b) break;           // el cruce llega al final del terreno: no se puede cerrar
            const mid = pts[Math.floor((i + j) / 2)];
            if (!onMainBridge(mid)) {
              // Puente pequeño de piedra alineado con la calle
              const dx = b.x - a.x, dz = b.z - a.z, L = Math.hypot(dx, dz) || 1;
              // Tablero de piedra sobre el río, 1,45 m por encima de la orilla más alta (con su joroba)
              const topAt = this.construirTablero(roadsGroup, a, b, {
                ancho: width + 1.2, hA: this.getTerrainHeight(a.x, a.z) + 1.45, hB: this.getTerrainHeight(b.x, b.z) + 1.45,
                arco: 0.35, grosor: 1.1, tramos: 4, mat: matAtlas
              });
              this.extraBridges.push({
                cx: (a.x + b.x) / 2, cz: (a.z + b.z) / 2,
                ux: dx / L, uz: dz / L,
                hu: L / 2, hv: (width + 1.2) / 2,
                topAt
              });
            }
          }
        }
        if (cur.length > 1) pieces.push(cur);
        return pieces;
      }

      addExitSigns(group, paths) {
        const matWood = new THREE.MeshStandardMaterial({ color: '#5c3a1e', roughness: 0.85 });
        paths.forEach(p => {
          // Cartel junto al camino, poco después de salir de la muralla
          let idx = p.points.findIndex(q => Math.hypot(q.x, q.z) > this.townRadius + 34);
          if (idx < 1) idx = Math.min(p.points.length - 1, 2);
          const q = p.points[idx], q0 = p.points[idx - 1] || q;
          const dx = q.x - q0.x, dz = q.z - q0.z, len = Math.hypot(dx, dz) || 1;
          const side = this.cfg.roadWidth * 0.5 + 1.6;
          const sx = q.x - dz / len * side, sz = q.z + dx / len * side;
          const sy = this.getTerrainHeight(sx, sz);

          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 3.2, 8), matWood);
          post.position.set(sx, sy + 1.6, sz);
          post.castShadow = true;
          group.add(post);
          const board = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 0.12), matWood);
          board.position.set(sx, sy + 2.7, sz);
          board.rotation.y = -Math.atan2(dz, dx);
          board.castShadow = true;
          group.add(board);

          const name = (p.exit.to || 'Camino').slice(0, 22);
          const c = document.createElement('canvas');
          c.width = 512; c.height = 112;
          const g = c.getContext('2d');
          g.fillStyle = 'rgba(41, 24, 10, 0.88)';
          g.fillRect(0, 0, 512, 112);
          g.strokeStyle = '#fbbf24'; g.lineWidth = 6; g.strokeRect(3, 3, 506, 106);
          g.fillStyle = '#fef3c7'; g.font = 'bold 50px sans-serif';
          g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillText('➜ ' + name, 256, 58);
          const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
          sprite.position.set(sx, sy + 4.4, sz);
          sprite.scale.set(6.4, 1.4, 1);
          group.add(sprite);
          this.colliders.push({ type: 'circle', x: sx, z: sz, r: 0.4 });
        });
      }

      // ¿Cabe un árbol puesto a mano en (x, z)? Lejos de casas, edificios, muros y calles.
      treeOk(x, z) {
        const blocked = this.colliders.some(c => {
          if (c.type === 'circle') return Math.hypot(x - c.x, z - c.z) < c.r + 1.2;
          return x > c.minX - 1.2 && x < c.maxX + 1.2 && z > c.minZ - 1.2 && z < c.maxZ + 1.2;
        });
        if (blocked) return false;
        return !(this.editables.streets || []).some(st => {
          const half = st.width * 0.5 + 1.0;
          for (let i = 0; i < st.pts.length - 1; i++) {
            const a = st.pts[i], b = st.pts[i + 1];
            const vx = b.x - a.x, vz = b.z - a.z, len2 = vx * vx + vz * vz;
            const t = len2 ? Math.max(0, Math.min(1, ((x - a.x) * vx + (z - a.z) * vz) / len2)) : 0;
            if (Math.hypot(x - (a.x + vx * t), z - (a.z + vz * t)) < half) return true;
          }
          return false;
        });
      }

      // Malla de manzanas. La cuadrícula es recta en (u, v) y se lleva al mundo con W, que la ondula con una
      // senoide de periodo 2 pasos. La onda se anula en los cruces y en el perímetro, así que el anillo sigue cerrado.
      geometriaManzanas(cfg, townRadius) {
        const R = townRadius - 22;
        const m = Math.max(1, Math.round(R / 42));
        const p = R / m;
        const A = Math.min(cfg.curve * 0.7, p * 0.2);
        const k = Math.PI / p;
        const W = (u, v) => ({ x: u + A * Math.sin(k * v), z: v + A * Math.sin(k * u) });
        // Normal unitaria hacia fuera de la calle: eje 'u' (calle a lo largo de v) o eje 'v' (calle a lo largo de u)
        const normal = (u, v, eje, sgn) => {
          const e = 0.25, a = W(u, v);
          const tg = eje === 'u' ? W(u, v + e) : W(u + e, v);
          const cr = eje === 'u' ? W(u + e, v) : W(u, v + e);
          const tx = tg.x - a.x, tz = tg.z - a.z;
          let nx = -tz, nz = tx;
          if (nx * (cr.x - a.x) + nz * (cr.z - a.z) < 0) { nx = -nx; nz = -nz; }
          const len = Math.hypot(nx, nz) || 1;
          return { x: sgn * nx / len, z: sgn * nz / len };
        };
        // Punto a 'd' pasos hacia dentro de una manzana, sobre el lado 'lado' en el parámetro c
        const punto = (lado, c, d) => {
          const u = lado.eje === 'u' ? lado.f : c, v = lado.eje === 'u' ? c : lado.f;
          const base = W(u, v), n = normal(u, v, lado.eje, lado.sgn);
          return { x: base.x - n.x * d, z: base.z - n.z * d };
        };
        return { R, m, p, A, W, normal, punto };
      }

      // Manzanas con parcelas. Cada casa tiene su solar con verja, una entrada hacia la calle y la puerta mirando
      // a la calle. Solo los solares con casa llevan verja y solo algunas casas la llevan. Un solar sin casa queda
      // como jardín con un árbol. Los solares que no caben (río, muralla interior, edificios especiales) se saltan.
      parcelarManzanas(cfg, townRadius, ctx) {
        const { rng, edit, styleObj, houses, trees, fences, addStreet, especieFor } = ctx;
        const g = this.manzanaGeo;
        const H = cfg.roadWidth * 0.5 + 1.0;   // del centro de la calle al borde de la manzana (en u y v)
        const FRENTE = 12.5, FONDO = 15, PUERTA = 2.6, TRAMO = 4.5;
        const CASA_FONDO = 5.5;                // distancia desde el frente del solar al centro de la casa
        const FRACCION_VALLADAS = 0.6;         // parte de las casas con verja

        // Trozos de hasta TRAMO a lo largo de una polilínea
        const tramosDe = pts => {
          const acc = [0];
          for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z));
          const L = acc[acc.length - 1];
          const n = Math.max(1, Math.ceil(L / TRAMO));
          const en = s => {
            let i = 1;
            while (i < acc.length - 1 && acc[i] < s) i++;
            const t = (s - acc[i - 1]) / ((acc[i] - acc[i - 1]) || 1);
            return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t, z: pts[i - 1].z + (pts[i].z - pts[i - 1].z) * t };
          };
          const out = [];
          for (let q = 0; q < n; q++) out.push({ a: en(q * L / n), b: en((q + 1) * L / n) });
          return out;
        };
        const vallar = (id, pts) => {
          tramosDe(pts).forEach((t, q) => {
            const fid = id + ':' + q;
            if (edit.removedFences.has(fid)) return;
            const x = (t.a.x + t.b.x) / 2, z = (t.a.z + t.b.z) / 2;
            // La valla baja hasta el punto más bajo bajo sus extremos y la parte alta queda a 1 m del centro
            const yTop = this.getTerrainHeight(x, z) + 1.0;
            const yBase = Math.min(this.getTerrainHeight(t.a.x, t.a.z), this.getTerrainHeight(t.b.x, t.b.z), yTop - 1.0) - 0.1;
            fences.push({ id: fid, x, y: yBase, z, rot: Math.atan2(-(t.b.z - t.a.z), t.b.x - t.a.x), len: Math.hypot(t.b.x - t.a.x, t.b.z - t.a.z), alto: yTop - yBase });
          });
        };
        // Muestrea fn(t) entre t0 y t1 cada 2 m
        const muestra = (fn, t0, t1) => {
          const n = Math.max(2, Math.ceil(Math.abs(t1 - t0) / 2));
          return Array.from({ length: n + 1 }, (_, i) => fn(t0 + (t1 - t0) * i / n));
        };

        for (let i = 0; i < 2 * g.m; i++) {
          for (let j = 0; j < 2 * g.m; j++) {
            const u0 = -g.R + i * g.p, u1 = u0 + g.p;
            const v0 = -g.R + j * g.p, v1 = v0 + g.p;
            const lados = [
              { id: 'n', eje: 'u', f: u1 - H, sgn: 1, ca: v0 + H, cb: v1 - H },
              { id: 's', eje: 'u', f: u0 + H, sgn: -1, ca: v0 + H, cb: v1 - H },
              { id: 'e', eje: 'v', f: v1 - H, sgn: 1, ca: u0 + H + FONDO, cb: u1 - H - FONDO },
              { id: 'w', eje: 'v', f: v0 + H, sgn: -1, ca: u0 + H + FONDO, cb: u1 - H - FONDO }
            ];
            lados.forEach(lado => {
              const L = lado.cb - lado.ca;
              const n = Math.floor(L / FRENTE);
              for (let k = 0; k < n; k++) {
                const w = L / n;
                const c0 = lado.ca + k * w, c1 = c0 + w, cm = (c0 + c1) / 2;
                const key = i + '.' + j + lado.id + k;
                const P = (c, d) => g.punto(lado, c, d);

                // Todos los azares se consumen igual, esté o no el solar ocupado
                const tiene = rng.next() * 100 <= cfg.houseDensity;
                const floors = rng.int(1, cfg.maxFloors);
                const tint = rng.pick(styleObj.wallTints);
                const chimney = rng.next() > 0.35;
                const balcony = floors >= 2 && rng.next() > 0.3;
                const wScale = rng.range(0.92, 1.15);
                const dScale = rng.range(0.92, 1.15);
                const conVALLA = rng.next() < FRACCION_VALLADAS;
                const conArbol = rng.next() * 100 <= cfg.treeDensity;
                const tScale = rng.range(0.9, 1.45);
                const tPine = rng.next() > 0.45;
                const tColor = rng.pick(styleObj.treeColors);

                const casa = P(cm, CASA_FONDO);
                if (!this.placementOk(casa.x, casa.z, null)) continue;
                const removed = edit.removedHouses.has(key);
                const moved = edit.movedHouses.get(key);
                const tieneCasa = tiene && !removed;

                if (tieneCasa && cfg.hasFences && conVALLA) {
                  vallar(key + 'f1', muestra(c => P(c, 0), c0, cm - PUERTA / 2));
                  vallar(key + 'f2', muestra(c => P(c, 0), cm + PUERTA / 2, c1));
                  vallar(key + 'r', muestra(d => P(c1, d), 0, FONDO));
                  if (k === 0) vallar(key + 'l', muestra(d => P(c0, d), 0, FONDO));
                  vallar(key + 'b', muestra(c => P(c, FONDO), c1, c0));
                }

                if (tieneCasa) {
                  const px = moved ? moved.x : casa.x, pz = moved ? moved.z : casa.z;
                  const hy = this.getTerrainHeight(px, pz);
                  const n = g.normal(lado.eje === 'u' ? lado.f : cm, lado.eje === 'u' ? cm : lado.f, lado.eje, lado.sgn);
                  houses.push({
                    id: key, x: px, y: hy, z: pz, rot: Math.atan2(n.x, n.z),
                    wScale, dScale, floors, tint, chimney, balcony
                  });
                  if (houses.length === 1) this.sampleHousePos.set(px, hy, pz);
                  this.colliders.push({ type: 'circle', house: true, id: key, x: px, z: pz, r: 4.5 });
                  const frente = P(cm, CASA_FONDO - 3.9);
                  addStreet('acceso-' + key, [frente, P(cm, -H)], 2.2, 0.13);
                } else if (!tiene && conArbol) {
                  const t = P(cm, FONDO - 3.5);
                  if (!edit.removedTrees.has('v' + key)) {
                    trees.push({ id: 'v' + key, x: t.x, y: this.getTerrainHeight(t.x, t.z), z: t.z, scale: tScale, isPine: tPine, color: tColor, especie: especieFor(tPine, t.x, t.z) });
                    this.colliders.push({ type: 'circle', x: t.x, z: t.z, r: 0.65 });
                  }
                }
              }
            });
          }
        }
      }

      // ¿Cabe una casa con su centro en (x, z)? Usa las mismas reglas que la generación.
      // ignoreId: la casa que se está moviendo no cuenta contra sí misma.
      placementOk(x, z, ignoreId) {
        const cfg = this.cfg;
        const r = Math.hypot(x, z);
        if (r > this.townRadius - 9 || r < 23) return false;
        if (cfg.hasRiver && Math.abs(x - this.getRiverX(z)) < this.riverWidth * 1.05) return false;
        if (this.onExitCorridor(x, z, cfg.roadWidth * 0.5 + 5)) return false;
        return !this.colliders.some(c => {
          if (c.wall || (c.house && c.id === ignoreId)) return false;
          if (c.type === 'circle') return Math.hypot(x - c.x, z - c.z) < c.r + 6.5;
          return x > c.minX - 5 && x < c.maxX + 5 && z > c.minZ - 5 && z < c.maxZ + 5;
        });
      }

      onExitCorridor(x, z, r) {
        return (this.exitPaths || []).length > 0 && this.distToExitPaths(x, z) < r;
      }

      distToExitPaths(x, z) {
        let best = Infinity;
        (this.exitPaths || []).forEach(p => {
          for (let i = 1; i < p.points.length; i++) {
            const a = p.points[i - 1], b = p.points[i];
            const dx = b.x - a.x, dz = b.z - a.z;
            const l2 = dx * dx + dz * dz || 1;
            const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / l2));
            best = Math.min(best, Math.hypot(x - (a.x + dx * t), z - (a.z + dz * t)));
          }
        });
        return best;
      }

      generate(cfg) {
        this.clear();
        this.scene.add(this.plazaLight);
        this.scene.add(this.forgeLight);
        this.cfg = cfg;
        const edit = indexEdits(cfg);
        this.editables = { houses: [], streets: [], walls: [], lamps: [] };
        this.terrainMesh = null;
        const rng = new PRNG(cfg.seed);
        const styleObj = ARCHITECTURAL_STYLES[cfg.style] || ARCHITECTURAL_STYLES.l2_fantasy;

        if (cfg.style !== styleKey) throw new Error('El kit es de estilo ' + styleKey + ', no de ' + cfg.style);
        this.plazaLight.color.setHex(styleObj.magicHex);

        const townRadius = 42 + cfg.size * 14;
        const manzanas = cfg.trazado === 'manzanas';
        const WORLD_SIZE = Math.max(240, (townRadius + 65) * 2);
        const RIVER_WIDTH = this.riverWidth;

        if (!this.opts.skipGround) {
        // 1. TERRENO 3D CONTINUO
        const terrainGeom = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 120, 120);
        terrainGeom.rotateX(-Math.PI / 2);
        const tPos = terrainGeom.attributes.position;
        const tCols = new Float32Array(tPos.count * 3);

        const colG1 = new THREE.Color(styleObj.grass1);
        const colG2 = new THREE.Color(styleObj.grass2);
        const colSand = new THREE.Color('#9c8665');
        const colPlaza = new THREE.Color(styleObj.curbHex);
        const tmpCol = new THREE.Color();

        for (let i = 0; i < tPos.count; i++) {
          const vx = tPos.getX(i), vz = tPos.getZ(i);
          const vy = this.getTerrainHeight(vx, vz);
          tPos.setY(i, vy);

          const distCenter = Math.hypot(vx, vz);
          if (cfg.hasRiver && Math.abs(vx - this.getRiverX(vz)) < RIVER_WIDTH * 0.72) {
            tmpCol.copy(colSand);
          } else if (distCenter < 15.5) {
            tmpCol.copy(colPlaza);
          } else {
            const n = (Math.sin(vx * 0.09) + Math.cos(vz * 0.09)) * 0.5 + 0.5;
            tmpCol.lerpColors(colG1, colG2, n);
          }
          tCols[i * 3] = tmpCol.r;
          tCols[i * 3 + 1] = tmpCol.g;
          tCols[i * 3 + 2] = tmpCol.b;
        }
        terrainGeom.setAttribute('color', new THREE.BufferAttribute(tCols, 3));
        terrainGeom.computeVertexNormals();

        const terrainMesh = new THREE.Mesh(terrainGeom, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92 }));
        terrainMesh.receiveShadow = true;
        this.scene.add(terrainMesh);
        this.objects.push(terrainMesh);
        this.terrainMesh = terrainMesh;

        }

        // 2. RÍO Y PUENTE DE PIEDRA
        const lampsList = [];
        if (cfg.hasRiver) {
          const waterGeom = new THREE.PlaneGeometry(RIVER_WIDTH + 6, WORLD_SIZE, 24, 90);
          waterGeom.rotateX(-Math.PI / 2);
          const wPos = waterGeom.attributes.position;
          for (let i = 0; i < wPos.count; i++) {
            const lz = wPos.getZ(i);
            wPos.setX(i, wPos.getX(i) + this.getRiverX(lz));
            wPos.setY(i, -0.65);
          }
          waterGeom.computeVertexNormals();
          this.waterMesh = new THREE.Mesh(waterGeom, matWater);
          this.scene.add(this.waterMesh);
          this.objects.push(this.waterMesh);

          const bx = this.getRiverX(0);
          const by = Math.max(0, this.getTerrainHeight(bx - RIVER_WIDTH, 0));
          const bSpan = RIVER_WIDTH + 8.0;
          this.bridgeBounds = {
            centerX: bx,
            baseY: by,
            halfSpan: bSpan * 0.5 + 3.5,
            minX: bx - (bSpan * 0.5 + 3.5),
            maxX: bx + (bSpan * 0.5 + 3.5),
            minZ: -cfg.roadWidth * 0.55,
            maxZ: cfg.roadWidth * 0.55
          };

          const bridgeGroup = new THREE.Group();
          // Tablero que une las dos orillas por la calle principal: sigue la altura del terreno en cada extremo
          const halfS = bSpan * 0.5 + 3.5;
          const pA = { x: bx - halfS, z: 0 }, pB = { x: bx + halfS, z: 0 };
          const hA = this.getTerrainHeight(pA.x, pA.z) + 0.16, hB = this.getTerrainHeight(pB.x, pB.z) + 0.16;
          const topAt = this.construirTablero(bridgeGroup, pA, pB, {
            ancho: cfg.roadWidth + 1.2, hA, hB, arco: 1.2, grosor: 1.1, tramos: 12, mat: matAtlas
          });
          // Barandillas: mismo tablero, desplazadas a cada lado y levantadas sobre la superficie
          [-cfg.roadWidth * 0.55, cfg.roadWidth * 0.55].forEach(pz => {
            this.construirTablero(bridgeGroup, pA, pB, {
              ancho: 0.65, hA, hB, arco: 1.2, grosor: 1.2, tramos: 12, mat: matAtlas, lateral: pz, arriba: 1.15
            });
            this.colliders.push({ type: 'box', minX: this.bridgeBounds.minX, maxX: this.bridgeBounds.maxX, minZ: pz - 0.45, maxZ: pz + 0.45 });
          });
          this.bridgeTopAt = topAt;

          this.scene.add(bridgeGroup);
          this.objects.push(bridgeGroup);

          if (cfg.hasLamps) {
            const alturaFarola = x => topAt((x - pA.x) / (pB.x - pA.x)) + 2.6;
            lampsList.push(
              { x: bx - bSpan * 0.45, y: alturaFarola(bx - bSpan * 0.45), z: -cfg.roadWidth * 0.55, rot: 0 },
              { x: bx + bSpan * 0.45, y: alturaFarola(bx + bSpan * 0.45), z: -cfg.roadWidth * 0.55, rot: 0 },
              { x: bx - bSpan * 0.45, y: alturaFarola(bx - bSpan * 0.45), z:  cfg.roadWidth * 0.55, rot: Math.PI },
              { x: bx + bSpan * 0.45, y: alturaFarola(bx + bSpan * 0.45), z:  cfg.roadWidth * 0.55, rot: Math.PI }
            );
          }
        }

        // 3. SISTEMA DE CALLES CONECTADAS
        const roadsGroup = new THREE.Group();
        const roadExtent = townRadius + 28;

        // Calle interna: se puede borrar o desplazar con las ediciones. Las salidas hacia el mundo no pasan por aquí.
        const pushRoad = (id, pts, width, yOffset, extra) => {
          this.editables.streets.push(Object.assign({ id: id, pts: pts, width: width }, extra || {}));
          const mesh = this.buildConformingRoadMesh(pts, width, yOffset);
          roadsGroup.add(mesh);
          return mesh;
        };
        const addStreet = (id, pts, width, yOffset) => {
          if (edit.removedStreets.has(id)) return null;
          const off = edit.movedStreets.get(id);
          const final = off ? pts.map(p => ({ x: p.x + off.dx, z: p.z + off.dz })) : pts;
          return pushRoad(id, final, width, yOffset);
        };

        const ringZOffsets = [-28, 28];
        if (cfg.size >= 4) ringZOffsets.push(-52, 52);

        if (manzanas) {
          // Cuadrícula de calles en coordenadas (u, v) llevada al mundo con una onda suave (ver geometriaManzanas)
          const g = this.manzanaGeo = this.geometriaManzanas(cfg, townRadius);
          const anchoCalle = cfg.roadWidth * 0.9;
          const addCorte = (id, pts, width) => {
            if (edit.removedStreets.has(id)) return;
            const off = edit.movedStreets.get(id);
            const final = off ? pts.map(q => ({ x: q.x + off.dx, z: q.z + off.dz })) : pts;
            this.splitAtRiver(cfg, final, width, roadsGroup, matAtlas).forEach(pc => {
              if (pc.length > 1) pushRoad(id, pc, width, 0.15);
            });
          };
          const n = Math.ceil(2 * g.R / 3.5);
          for (let k = -g.m; k <= g.m; k++) {
            const c = k * g.p;
            const norte = [], este = [];
            for (let i = 0; i <= n; i++) {
              const t = -g.R + 2 * g.R * i / n;
              norte.push(g.W(c, t));
              este.push(g.W(t, c));
            }
            addCorte('calle-n' + k, norte, anchoCalle);
            addCorte('calle-e' + k, este, anchoCalle);
          }
        } else {
          const mainRoadPts = [];
          for (let z = -roadExtent; z <= roadExtent; z += 3.5) {
            mainRoadPts.push({ x: this.getMainRoadX(z), z: z });
          }
          addStreet('principal', mainRoadPts, cfg.roadWidth, 0.16);

          const eastWestPtsLeft = [];
          const bridgeStopX = cfg.hasRiver ? (this.getRiverX(0) - RIVER_WIDTH * 0.65) : roadExtent;
          for (let x = -roadExtent; x <= bridgeStopX; x += 3.5) {
            eastWestPtsLeft.push({ x: x, z: Math.sin(x * 0.04) * (cfg.curve * 0.35) * Math.min(1, Math.abs(x) / 20) });
          }
          addStreet('este-oeste-izq', eastWestPtsLeft, cfg.roadWidth * 0.9, 0.15);

          if (cfg.hasRiver) {
            const eastWestPtsRight = [];
            const bridgeResumeX = this.getRiverX(0) + RIVER_WIDTH * 0.65;
            for (let x = bridgeResumeX; x <= roadExtent; x += 3.5) {
              eastWestPtsRight.push({ x: x, z: 0 });
            }
            if (eastWestPtsRight.length > 1) {
              addStreet('este-oeste-der', eastWestPtsRight, cfg.roadWidth * 0.9, 0.15);
            }
          }

          ringZOffsets.forEach(rz => {
            const secPts = [];
            const maxSecX = cfg.hasRiver ? Math.min(townRadius - 8, this.getRiverX(rz) - RIVER_WIDTH * 0.85) : (townRadius - 8);
            for (let x = -(townRadius - 8); x <= maxSecX; x += 4.0) {
              const curveZ = rz + Math.cos(x * 0.06) * (cfg.curve * 0.3);
              secPts.push({ x: x, z: curveZ });
            }
            if (secPts.length > 1) {
              addStreet('anillo:' + rz, secPts, cfg.roadWidth * 0.72, 0.14);
            }
          });

        }

        // 3b. SALIDAS HACIA LOS CAMINOS DEL MUNDO (cfg.exits)
        this.townRadius = townRadius;
        this.exitPaths = this.buildExitPaths(cfg, townRadius, WORLD_SIZE);
        const exitPieces = this.buildExitRoadPieces(cfg, this.exitPaths, roadsGroup, matAtlas);
        exitPieces.forEach(pts => {
          roadsGroup.add(this.buildConformingRoadMesh(pts, cfg.roadWidth * 0.85, 0.17));
        });
        if (this.exitPaths.length) this.addExitSigns(roadsGroup, this.exitPaths);

        // 4. GRAN PLAZA CENTRAL CON MONUMENTO / GATEKEEPER
        const plazaY = this.getTerrainHeight(0, 0);
        const plazaDiscG = new THREE.CylinderGeometry(15.5, 16.2, 0.32, 32);
        mapUVBand(plazaDiscG, 0.25, 0.50);
        const plazaDiscM = new THREE.Mesh(plazaDiscG, matAtlas);
        plazaDiscM.position.set(0, plazaY + 0.16, 0);
        plazaDiscM.receiveShadow = true;
        roadsGroup.add(plazaDiscM);

        const monumentGroup = new THREE.Group();
        monumentGroup.position.set(0, plazaY + 0.3, 0);

        const basinG = new THREE.CylinderGeometry(3.4, 3.8, 0.85, 16);
        mapUVBand(basinG, 0.25, 0.50);
        const basinM = new THREE.Mesh(basinG, matAtlas);
        basinM.position.y = 0.42; basinM.castShadow = true;
        monumentGroup.add(basinM);

        const waterDisk = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.1, 0.7, 16), matWater);
        waterDisk.position.y = 0.48;
        monumentGroup.add(waterDisk);

        const pedestalG = new THREE.CylinderGeometry(0.7, 1.1, 3.2, 8);
        mapUVBand(pedestalG, 0.25, 0.50);
        const pedestalM = new THREE.Mesh(pedestalG, matAtlas);
        pedestalM.position.y = 1.6; pedestalM.castShadow = true;
        monumentGroup.add(pedestalM);

        if (cfg.hasMagic) {
          const crystalG = new THREE.OctahedronGeometry(1.35, 0);
          const crystalM = new THREE.Mesh(crystalG, matMagicCrystal);
          crystalM.position.y = 4.5;
          monumentGroup.add(crystalM);
          this.animatedCrystals.push({ mesh: crystalM, baseY: 4.5, phase: 0 });
        }
        this.plazaLight.position.set(0, plazaY + 6.0, 0);
        this.colliders.push({ type: 'circle', x: 0, z: 0, r: 3.8 });
        roadsGroup.add(monumentGroup);

        // 5. MURALLAS FORTIFICADAS CON ALMENAS Y TORRES
        if (cfg.hasWalls) {
          const wallGroup = new THREE.Group();
          const wallSegs = 36;
          for (let i = 0; i < wallSegs; i++) {
            const a1 = (i / wallSegs) * Math.PI * 2;
            const a2 = ((i + 1) / wallSegs) * Math.PI * 2;
            const mx = Math.cos((a1 + a2) * 0.5) * townRadius;
            const mz = Math.sin((a1 + a2) * 0.5) * townRadius;

            const nearNorthSouthGate = Math.abs(mx - this.getMainRoadX(mz)) < (cfg.roadWidth * 0.85) && Math.abs(Math.abs(mz) - townRadius) < 12;
            const nearEastWestGate = Math.abs(mz) < (cfg.roadWidth * 0.85) && Math.abs(Math.abs(mx) - townRadius) < 12;
            const inRiver = cfg.hasRiver && Math.abs(mx - this.getRiverX(mz)) < RIVER_WIDTH * 0.85;

            // Hueco en la muralla donde sale una calle de salida (mismo ángulo)
            const segHalfArc = (Math.PI * 2 / wallSegs) * 0.5 * townRadius;
            const midAng = (a1 + a2) * 0.5;
            const atExit = this.exitPaths.some(p => {
              let d = Math.abs(midAng - p.angle) % (Math.PI * 2);
              if (d > Math.PI) d = Math.PI * 2 - d;
              return d * townRadius < segHalfArc + 1.5;
            });

            if (nearNorthSouthGate || nearEastWestGate || inRiver || atExit) continue;
            // Tramo quitado a mano: no se dibuja ni su torre ni sus colisionadores
            if (edit.removedWalls.has(i)) continue;

            const wy = this.getTerrainHeight(mx, mz);
            const segLen = (2 * Math.PI * townRadius) / wallSegs + 0.6;
            const wallRot = -((a1 + a2) * 0.5) + Math.PI / 2;
            this.editables.walls.push({ id: i, x: mx, z: mz });

            // Puerta con arco: dos pilares a 3,2 m del centro y un dintel encima; el paso queda libre
            if (edit.gates.has(i)) {
              const tx = Math.sin((a1 + a2) * 0.5), tz = -Math.cos((a1 + a2) * 0.5);
              [-1, 1].forEach(sd => {
                const pG = new THREE.BoxGeometry(1.6, 8.5, 2.6);
                mapUVBand(pG, 0.25, 0.50);
                const pM = new THREE.Mesh(pG, matAtlas);
                pM.position.set(mx + tx * 3.2 * sd, wy + 4.25, mz + tz * 3.2 * sd);
                pM.rotation.y = wallRot;
                pM.castShadow = pM.receiveShadow = true;
                wallGroup.add(pM);
                this.colliders.push({ type: 'circle', x: mx + tx * 3.2 * sd, z: mz + tz * 3.2 * sd, r: 1.3 });
              });
              const lG = new THREE.BoxGeometry(8.0, 1.6, 2.6);
              mapUVBand(lG, 0.25, 0.50);
              const lM = new THREE.Mesh(lG, matAtlas);
              lM.position.set(mx, wy + 7.6, mz);
              lM.rotation.y = wallRot;
              lM.castShadow = true;
              wallGroup.add(lM);
              continue;
            }

            // El tramo baja hasta el punto más bajo del terreno bajo sus dos extremos (en una ladera no queda en el aire)
            const dirX = Math.sin((a1 + a2) * 0.5), dirZ = -Math.cos((a1 + a2) * 0.5);
            const yExt = Math.min(
              this.getTerrainHeight(mx + dirX * segLen / 2, mz + dirZ * segLen / 2),
              this.getTerrainHeight(mx - dirX * segLen / 2, mz - dirZ * segLen / 2),
              wy
            );
            const wTop = wy + 6.95, wBase = yExt - 0.6;
            const wG = new THREE.BoxGeometry(segLen, wTop - wBase, 2.4);
            mapUVBand(wG, 0.25, 0.50);
            const wM = new THREE.Mesh(wG, matAtlas);
            wM.position.set(mx, (wTop + wBase) / 2, mz);
            wM.rotation.y = wallRot;
            wM.castShadow = wM.receiveShadow = true;
            wallGroup.add(wM);

            if (i % 3 === 0) {
              const tG = new THREE.CylinderGeometry(2.7, 3.1, 11.5, 12);
              mapUVBand(tG, 0.25, 0.50);
              const tM = new THREE.Mesh(tG, matAtlas);
              tM.position.set(mx, wy + 5.2, mz);
              tM.castShadow = tM.receiveShadow = true;
              wallGroup.add(tM);

              const tRoofG = new THREE.ConeGeometry(3.3, 3.6, 12);
              mapUVBand(tRoofG, 0.75, 1.00);
              const tRoofM = new THREE.Mesh(tRoofG, matAtlas);
              tRoofM.position.set(mx, wy + 12.5, mz);
              tRoofM.castShadow = true;
              wallGroup.add(tRoofM);

              this.colliders.push({ type: 'circle', x: mx, z: mz, r: 3.1 });
            }
            // Colisionadores a lo largo del tramo para que no se pueda cruzar entre ellos
            for (let k = 0; k <= 7; k++) {
              const t = (k / 7 - 0.5) * segLen;
              const ang = (a1 + a2) * 0.5;
              this.colliders.push({ type: 'circle', x: mx + Math.sin(ang) * t, z: mz - Math.cos(ang) * t, r: 1.3, wall: true });
            }
          }
          this.scene.add(wallGroup);
          this.objects.push(wallGroup);
        }

        // 6. EDIFICIOS ESPECIALES
        const specialsGroup = new THREE.Group();
        const specialTypes = ['temple', 'blacksmith', 'tavern', 'guild'];
        const specialSpots = [
          { x: -19, z: -14, rot: Math.PI * 0.25 },
          { x:  19, z: -14, rot: -Math.PI * 0.25 },
          { x: -19, z:  14, rot: Math.PI * 0.75 },
          { x:  19, z:  14, rot: -Math.PI * 0.75 },
          { x: -24, z: -34, rot: Math.PI * 0.5 },
          { x:  22, z:  34, rot: -Math.PI * 0.5 },
          { x: -34, z:   8, rot: 0 },
          { x: -34, z:  -8, rot: Math.PI },
          { x:   0, z: -42, rot: 0 },
          { x:   0, z:  42, rot: Math.PI }
        ];

        let builtSpecials = 0;
        for (let i = 0; i < Math.min(cfg.specialCount, specialSpots.length); i++) {
          const sp = specialSpots[i];
          if (cfg.hasRiver && Math.abs(sp.x - this.getRiverX(sp.z)) < RIVER_WIDTH * 1.1) continue;
          if (this.onExitCorridor(sp.x, sp.z, 9)) continue;
          const bType = specialTypes[i % specialTypes.length];
          this.buildSpecialBuilding(bType, sp.x, sp.z, sp.rot, specialsGroup);
          builtSpecials++;

          const roadTargetX = Math.abs(sp.z) < 18 ? 0 : this.getMainRoadX(sp.z);
          const spurPts = [
            { x: sp.x, z: sp.z },
            { x: (sp.x + roadTargetX) * 0.5, z: sp.z * 0.7 },
            { x: roadTargetX, z: sp.z * 0.5 }
          ];
          addStreet('especial-' + i, spurPts, 3.4, 0.14);
        }
        this.scene.add(specialsGroup);
        this.objects.push(specialsGroup);

        // 7. VIVIENDAS CON ACCESOS Y ELEMENTOS DECORATIVOS
        const houses = [];
        const trees = [];
        const hedges = [];
        const fences = [];
        const rocks = [];
        const stalls = [];
        const barrels = [];

        if (cfg.hasProps) {
          for (let i = 0; i < 6; i++) {
            const ang = (i / 6) * Math.PI * 2 + 0.4;
            const sx = Math.cos(ang) * 12.2;
            const sz = Math.sin(ang) * 12.2;
            const sy = this.getTerrainHeight(sx, sz);
            stalls.push({ x: sx, y: sy, z: sz, rot: -ang + Math.PI / 2, color: i % 2 === 0 ? 0xdc2626 : 0x0284c7 });
            barrels.push({ x: sx + 1.6, y: sy, z: sz + 0.8 });
          }
        }

        if (manzanas) {
          this.parcelarManzanas(cfg, townRadius, { rng, edit, styleObj, houses, trees, fences, addStreet, especieFor });
        } else {
          const zLines = [];
          for (let z = -(townRadius - 12); z <= (townRadius - 12); z += 13.0) {
            if (Math.abs(z) < 8) continue;
            if (ringZOffsets.some(rz => Math.abs(z - rz) < 6.5)) continue;
            zLines.push(z);
          }

          zLines.forEach(lz => {
            const roadCenterX = this.getMainRoadX(lz);
            const xOffsets = [-32, -13, 13, 32];
            if (cfg.size >= 4) xOffsets.push(-48, 48);

            xOffsets.forEach(xOff => {
              const hx = roadCenterX + xOff + rng.range(-0.8, 0.8);
              const hz = lz + rng.range(-0.8, 0.8);

              if (Math.hypot(hx, hz) > townRadius - 9) return;
              if (Math.hypot(hx, hz) < 23) return;
              if (cfg.hasRiver && Math.abs(hx - this.getRiverX(hz)) < RIVER_WIDTH * 1.05) return;

              const hitsSpecial = this.colliders.some(c => {
                if (c.wall) return false;
                if (c.type === 'circle') return Math.hypot(hx - c.x, hz - c.z) < c.r + 6.5;
                return hx > c.minX - 5 && hx < c.maxX + 5 && hz > c.minZ - 5 && hz < c.maxZ + 5;
              });
              if (hitsSpecial) return;
              if (this.onExitCorridor(hx, hz, cfg.roadWidth * 0.5 + 5)) return;

              if (rng.next() * 100 <= cfg.houseDensity) {
                const floors = rng.int(1, cfg.maxFloors);
                const lookTowardRoad = xOff < 0 ? Math.PI * 0.5 : -Math.PI * 0.5;
                const hRot = lookTowardRoad + rng.range(-0.08, 0.08);
                // Ediciones: la casa puede estar borrada o movida. El azar se consume igual en ambos casos,
                // así el resto del pueblo no cambia.
                const slot = lz + ':' + xOff;
                const removed = edit.removedHouses.has(slot);
                const moved = edit.movedHouses.get(slot);
                const px = moved ? moved.x : hx, pz = moved ? moved.z : hz;
                const hy = this.getTerrainHeight(px, pz);

                const house = {
                  id: slot,
                  x: px, y: hy, z: pz,
                  rot: hRot,
                  wScale: rng.range(0.92, 1.15),
                  dScale: rng.range(0.92, 1.15),
                  floors: floors,
                  tint: rng.pick(styleObj.wallTints),
                  chimney: rng.next() > 0.35,
                  balcony: floors >= 2 && rng.next() > 0.3
                };

                const doorDirX = Math.sin(hRot);
                const doorDirZ = Math.cos(hRot);
                if (!removed) {
                  houses.push(house);

                  if (houses.length === 1) {
                    this.sampleHousePos.set(px, hy, pz);
                  }

                  this.colliders.push({
                    type: 'box', house: true, id: slot,
                    minX: px - 3.6, maxX: px + 3.6,
                    minZ: pz - 3.9, maxZ: pz + 3.9
                  });

                  const pathPts = [
                    { x: px + doorDirX * 3.5, z: pz + doorDirZ * 3.5 },
                    { x: px + doorDirX * 7.2, z: pz + doorDirZ * 7.2 }
                  ];
                  addStreet('acceso-' + slot, pathPts, 2.2, 0.13);
                }

                if (cfg.hasProps && rng.next() > 0.45 && !removed) {
                  barrels.push({ x: px + doorDirX * 3.8 + 1.5, y: this.getTerrainHeight(px + doorDirX * 3.8 + 1.5, pz), z: pz });
                }

                if (cfg.hasFences && !removed) {
                  [['a', -5.2], ['b', 5.2]].forEach(([k, off]) => {
                    if (!edit.removedFences.has(slot + k)) fences.push({ id: slot + k, x: px, y: hy, z: pz + off, rot: hRot });
                  });
                }
              } else if (rng.next() * 100 <= cfg.treeDensity) {
                // El azar se consume igual aunque el árbol esté quitado, para no mover el resto del pueblo
                const tScale = rng.range(0.9, 1.45);
                const tPine = rng.next() > 0.45;
                const tColor = rng.pick(styleObj.treeColors);
                const tid = 'v' + lz + ':' + xOff;
                if (!edit.removedTrees.has(tid)) {
                  trees.push({ id: tid, x: hx, y: this.getTerrainHeight(hx, hz), z: hz, scale: tScale, isPine: tPine, color: tColor, especie: especieFor(tPine, hx, hz) });
                  this.colliders.push({ type: 'circle', x: hx, z: hz, r: 0.65 });
                }
              }

              if (cfg.hasFences && rng.next() * 100 <= cfg.treeDensity * 0.7) {
                const hedgeX = hx + (xOff < 0 ? 4.5 : -4.5);
                const hid = 'h' + lz + ':' + xOff;
                if (!edit.removedHedges.has(hid)) hedges.push({ id: hid, x: hedgeX, y: this.getTerrainHeight(hedgeX, hz + 4.2), z: hz + 4.2, rot: 0 });
              }
            });
          });
        }

        this.scene.add(roadsGroup);
        this.objects.push(roadsGroup);

        // 7b. CASAS AÑADIDAS A MANO: solo si cabe según las mismas reglas que las del pueblo
        edit.addedHouses.forEach(ad => {
          if (edit.removedHouses.has(ad.id)) return;
          const mv = edit.movedHouses.get(ad.id);
          const px = mv ? mv.x : ad.x, pz = mv ? mv.z : ad.z;
          if (!this.placementOk(px, pz, ad.id)) return;

          const ar = new PRNG((cfg.seed ^ hashStr(ad.id)) >>> 0);
          const floors = ar.int(1, cfg.maxFloors);
          const hRot = (px < this.getMainRoadX(pz) ? Math.PI * 0.5 : -Math.PI * 0.5) + ar.range(-0.08, 0.08);
          const hy = this.getTerrainHeight(px, pz);
          houses.push({
            id: ad.id,
            x: px, y: hy, z: pz,
            rot: hRot,
            wScale: ar.range(0.92, 1.15),
            dScale: ar.range(0.92, 1.15),
            floors: floors,
            tint: ar.pick(styleObj.wallTints),
            chimney: ar.next() > 0.35,
            balcony: floors >= 2 && ar.next() > 0.3
          });
          this.colliders.push({
            type: 'box', house: true, id: ad.id,
            minX: px - 3.6, maxX: px + 3.6,
            minZ: pz - 3.9, maxZ: pz + 3.9
          });

          const doorDirX = Math.sin(hRot);
          const doorDirZ = Math.cos(hRot);
          addStreet('acceso-' + ad.id, [
            { x: px + doorDirX * 3.5, z: pz + doorDirZ * 3.5 },
            { x: px + doorDirX * 7.2, z: pz + doorDirZ * 7.2 }
          ], 2.2, 0.13);
          if (cfg.hasFences) {
            [['a', -5.2], ['b', 5.2]].forEach(([k, off]) => {
              if (!edit.removedFences.has(ad.id + k)) fences.push({ id: ad.id + k, x: px, y: hy, z: pz + off, rot: hRot });
            });
          }
        });
        this.editables.houses = houses.map(h => ({ id: h.id, x: h.x, z: h.z }));

        // 7c. CALLES DIBUJADAS A MANO: la forma sale de sus puntos de control (curva suave).
        // Donde cruzan el río se corta el camino y se pone un puente, como en las salidas.
        edit.addedStreets.forEach((us, id) => {
          if (edit.removedStreets.has(id) || us.pts.length < 2) return;
          const off = edit.movedStreets.get(id);
          const ctrl = us.pts.map(p => (off ? { x: p.x + off.dx, z: p.z + off.dz } : { x: p.x, z: p.z }));
          const width = PuebloEdits.widthFor(us.kind, cfg.roadWidth);
          const pts = PuebloEdits.curvePts(ctrl, 3.5);
          this.splitAtRiver(cfg, pts, width, roadsGroup, matAtlas).forEach(pc => {
            if (pc.length > 1) pushRoad(id, pc, width, 0.15, { user: true, kind: us.kind, ctrl: ctrl });
          });
        });

        if (cfg.hasLamps) {
          for (let lz = -(townRadius - 6); lz <= (townRadius - 6); lz += 14) {
            const rx = this.getMainRoadX(lz);
            const lx1 = rx - (cfg.roadWidth * 0.5 + 0.9);
            const lx2 = rx + (cfg.roadWidth * 0.5 + 0.9);
            lampsList.push(
              { x: lx1, y: this.getTerrainHeight(lx1, lz), z: lz, rot: Math.PI * 0.5 },
              { x: lx2, y: this.getTerrainHeight(lx2, lz), z: lz, rot: -Math.PI * 0.5 }
            );
          }
        }

        const forestTotal = Math.floor(130 * (cfg.treeDensity / 100));
        for (let i = 0; i < forestTotal; i++) {
          const ang = rng.range(0, Math.PI * 2);
          const dist = rng.range(townRadius + 5, WORLD_SIZE * 0.45);
          const tx = Math.cos(ang) * dist;
          const tz = Math.sin(ang) * dist;

          if (Math.abs(tx - this.getMainRoadX(tz)) < cfg.roadWidth) continue;
          if (Math.abs(tz) < cfg.roadWidth) continue;
          if (cfg.hasRiver && Math.abs(tx - this.getRiverX(tz)) < RIVER_WIDTH * 0.9) continue;

          // El azar se consume igual aunque el árbol esté quitado
          const fScale = rng.range(1.0, 1.8);
          const fPine = rng.next() > 0.35;
          const fColor = rng.pick(styleObj.treeColors);
          const fid = 'b' + i;
          if (!edit.removedTrees.has(fid)) {
            trees.push({ id: fid, x: tx, y: this.getTerrainHeight(tx, tz), z: tz, scale: fScale, isPine: fPine, color: fColor, especie: especieFor(fPine, tx, tz) });
            this.colliders.push({ type: 'circle', x: tx, z: tz, r: 0.7 });
          }

          if (i % 3 === 0) {
            const rx = tx + rng.range(-4, 4), rz = tz + rng.range(-4, 4);
            const rScale = rng.range(0.7, 1.8);
            const rColor = rng.pick([0x64748b, 0x475569, 0x94a3b8]);
            const rid = 'r' + i;
            if (!edit.removedRocks.has(rid)) rocks.push({ id: rid, x: rx, y: this.getTerrainHeight(rx, rz), z: rz, scale: rScale, color: rColor });
          }
        }

        if (cfg.hasRiver) {
          for (let rz = -WORLD_SIZE * 0.44; rz <= WORLD_SIZE * 0.44; rz += 5.0) {
            if (Math.abs(rz) < 8) continue;
            const rx = this.getRiverX(rz);
            [-1, 1].forEach(s => {
              if (rng.next() > 0.35) {
                const rockX = rx + s * (RIVER_WIDTH * 0.52 + rng.range(-0.5, 1.2));
                rocks.push({
                  x: rockX, y: this.getTerrainHeight(rockX, rz), z: rz,
                  scale: rng.range(0.6, 1.4),
                  color: rng.pick([0x64748b, 0x475569, 0x94a3b8])
                });
              }
            });
          }
        }

        // Despejar árboles y rocas que caen sobre las salidas (sin alterar el resto del pueblo)
        if (this.exitPaths.length) {
          const clearR = cfg.roadWidth * 0.45 + 2.0;
          const onExit = (x, z) => this.distToExitPaths(x, z) < clearR;
          for (let i = trees.length - 1; i >= 0; i--) if (onExit(trees[i].x, trees[i].z)) trees.splice(i, 1);
          for (let i = fences.length - 1; i >= 0; i--) if (onExit(fences[i].x, fences[i].z)) fences.splice(i, 1);
          for (let i = hedges.length - 1; i >= 0; i--) if (onExit(hedges[i].x, hedges[i].z)) hedges.splice(i, 1);
          for (let i = barrels.length - 1; i >= 0; i--) if (onExit(barrels[i].x, barrels[i].z)) barrels.splice(i, 1);
          for (let i = rocks.length - 1; i >= 0; i--) if (onExit(rocks[i].x, rocks[i].z)) rocks.splice(i, 1);
          this.colliders = this.colliders.filter(c => !(c.type === 'circle' && c.r <= 0.7 && onExit(c.x, c.z)));
        }

        // 8. INSTANCED MESHES CON GEOMETRÍAS COMPUESTAS DE ALTA DEFINICIÓN
        const HW = 6.2, HD = 7.4, FH = 2.8, PH = 2.4, RH = 1.95;

        const plinthG = new THREE.BoxGeometry(HW + 0.42, PH, HD + 0.42); mapUVBand(plinthG, 0.25, 0.50);
        const wallG = createDetailedWallGeometry(HW, FH, HD);
        const roofG = createRoofGeometry(HW, HD, RH, 0.58, 0.58, 0.22);
        const gableG = createGableGeometry(HW, RH, 0.28);

        // Separamos el cristal emplomado (iWinGlass) del marco compuesto con repisa, dintel y contraventanas (iWinFrame)
        const winGlassG = new THREE.BoxGeometry(1.18, 1.42, 0.18);
        const winFrameG = createDetailedWindowFrameGeometry();
        const doorG = createDetailedDoorGeometry();
        const chimG = createDetailedChimneyGeometry();
        const balcG = new THREE.BoxGeometry(2.6, 0.95, 0.95);

        let totFloors = 0, totWins = 0, totChims = 0, totBalcs = 0;
        houses.forEach(h => {
          totFloors += h.floors;
          totWins += h.floors * 4;
          if (h.chimney) totChims++;
          if (h.balcony) totBalcs++;
        });

        const iPlinth = makeInstanced(plinthG, matAtlas, houses.length);
        const iWall = makeInstanced(wallG, matAtlas, totFloors);
        const iRoof = makeInstanced(roofG, matAtlas, houses.length);
        const iGable = makeInstanced(gableG, matAtlas, houses.length * 2);
        const iWinGlass = makeInstanced(winGlassG, matWindowGlass, totWins);
        const iWinFrame = makeInstanced(winFrameG, matAtlas, totWins);
        const iDoor = makeInstanced(doorG, matAtlas, houses.length);
        const iChim = makeInstanced(chimG, matAtlas, totChims);
        const iBalc = makeInstanced(balcG, matIron, totBalcs);

        const dMat = new THREE.Matrix4(), dPos = new THREE.Vector3(), dQuat = new THREE.Quaternion(), dScale = new THREE.Vector3(1, 1, 1);
        const cWhite = new THREE.Color(0xffffff), cTint = new THREE.Color();
        let pIdx = 0, wIdx = 0, rIdx = 0, gIdx = 0, winIdx = 0, dIdx = 0, cIdx = 0, bIdx = 0;

        houses.forEach(h => {
          cTint.setHex(h.tint);
          const hQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), h.rot);
          const hBase = new THREE.Vector3(h.x, h.y, h.z);
          const qId = new THREE.Quaternion();
          const qBack = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);

          const place = (mesh, idx, lx, ly, lz, lq, col = cWhite, sx = h.wScale, sy = 1, sz = h.dScale) => {
            dPos.set(lx * sx, ly, lz * sz).applyQuaternion(hQuat).add(hBase);
            dQuat.copy(hQuat).multiply(lq);
            dScale.set(sx, sy, sz);
            dMat.compose(dPos, dQuat, dScale);
            mesh.setMatrixAt(idx, dMat);
            mesh.setColorAt(idx, col);
          };

          // El zócalo baja hasta la esquina más baja del terreno (en una ladera no queda en el aire)
          const cosR = Math.cos(h.rot), sinR = Math.sin(h.rot);
          let yEsq = h.y;
          [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
            const lx = sx * HW * h.wScale, lz = sz * HD * h.dScale;
            yEsq = Math.min(yEsq, this.getTerrainHeight(h.x + lx * cosR + lz * sinR, h.z - lx * sinR + lz * cosR));
          });
          const zBase = Math.min(-1.8, yEsq - h.y - 0.3), zTop = 0.6;
          place(iPlinth, pIdx++, 0, (zBase + zTop) / 2, 0, qId, cWhite, h.wScale, (zTop - zBase) / PH, h.dScale);

          const baseFloorY = 0.6;
          for (let f = 0; f < h.floors; f++) {
            const fy = baseFloorY + FH * 0.5 + f * FH;
            place(iWall, wIdx++, 0, fy, 0, qId, cTint);

            if (f === 0) {
              place(iDoor, dIdx++, 0, baseFloorY + 1.14, HD * 0.5 + 0.06, qId, cWhite, 1, 1, 1);
            } else if (f === 1 && h.balcony) {
              place(iBalc, bIdx++, 0, fy - 0.7, HD * 0.5 + 0.45, qId, cWhite, 1, 1, 1);
            }

            [-1.78, 1.78].forEach(wx => {
              // Delantera
              place(iWinGlass, winIdx, wx, fy + 0.08, HD * 0.5 + 0.04, qId, cWhite, 1, 1, 1);
              place(iWinFrame, winIdx, wx, fy + 0.08, HD * 0.5 + 0.04, qId, cWhite, 1, 1, 1);
              winIdx++;
              // Trasera
              place(iWinGlass, winIdx, wx, fy + 0.08, -HD * 0.5 - 0.04, qBack, cWhite, 1, 1, 1);
              place(iWinFrame, winIdx, wx, fy + 0.08, -HD * 0.5 - 0.04, qBack, cWhite, 1, 1, 1);
              winIdx++;
            });
          }

          const topY = baseFloorY + h.floors * FH;
          place(iGable, gIdx++, 0, topY, HD * 0.5 - 0.14, qId, cTint);
          place(iGable, gIdx++, 0, topY, -HD * 0.5 + 0.14, qBack, cTint);
          place(iRoof, rIdx++, 0, topY, 0, qId, cWhite);
          if (h.chimney) place(iChim, cIdx++, 1.6, topY + 1.15, 1.3, qId, cWhite, 1, 1, 1);
        });

        const stallRoofG = new THREE.ConeGeometry(2.2, 1.2, 4); stallRoofG.rotateY(Math.PI / 4);
        const barrelG = new THREE.CylinderGeometry(0.38, 0.42, 0.95, 8); mapUVBand(barrelG, 0.0, 0.25); barrelG.translate(0, 0.48, 0);
        const iStall = makeInstanced(stallRoofG, matCloth, stalls.length);
        const iBarrel = makeInstanced(barrelG, matAtlas, barrels.length);

        stalls.forEach((s, idx) => {
          dPos.set(s.x, s.y + 2.4, s.z);
          dQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), s.rot);
          dScale.set(1, 1, 1);
          dMat.compose(dPos, dQuat, dScale);
          iStall.setMatrixAt(idx, dMat);
          iStall.setColorAt(idx, new THREE.Color(s.color));
        });

        barrels.forEach((b, idx) => {
          dPos.set(b.x, b.y, b.z);
          dQuat.identity();
          dScale.set(1, 1, 1);
          dMat.compose(dPos, dQuat, dScale);
          iBarrel.setMatrixAt(idx, dMat);
        });

        const postG = new THREE.CylinderGeometry(0.09, 0.16, 4.0, 8); postG.translate(0, 2.0, 0);
        const armG = new THREE.BoxGeometry(0.1, 0.1, 0.85); armG.translate(0, 3.95, 0.42);
        const lanternG = new THREE.CylinderGeometry(0.22, 0.14, 0.45, 6); lanternG.translate(0, 3.75, 0.8);
        const poolG = new THREE.PlaneGeometry(7.5, 7.5); poolG.rotateX(-Math.PI / 2);

        // Farolas: las de fábrica se numeran por orden (f0, f1…). Las quitadas no se dibujan; las nuevas se suman.
        lampsList.forEach((l, idx) => { l.id = 'f' + idx; });
        const lampsAll = lampsList
          .filter(l => !edit.removedLamps.has(l.id))
          .concat(edit.addedLamps.map(l => ({ id: l.id, x: l.x, y: this.getTerrainHeight(l.x, l.z), z: l.z, rot: 0 })));
        this.editables.lamps = lampsAll.map(l => ({ id: l.id, x: l.x, z: l.z }));

        const iLampPost = makeInstanced(postG, matIron, lampsAll.length);
        const iLampArm = makeInstanced(armG, matIron, lampsAll.length);
        const iLantern = makeInstanced(lanternG, matGlassGlow, lampsAll.length);
        const iLightPool = makeInstanced(poolG, matLightPool, lampsAll.length);

        lampsAll.forEach((l, idx) => {
          dPos.set(l.x, l.y, l.z);
          dQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), l.rot);
          dScale.set(1, 1, 1);
          dMat.compose(dPos, dQuat, dScale);
          iLampPost.setMatrixAt(idx, dMat);
          iLampArm.setMatrixAt(idx, dMat);
          iLantern.setMatrixAt(idx, dMat);

          const poolOffset = new THREE.Vector3(0, 0, 0.8).applyQuaternion(dQuat);
          dPos.set(l.x + poolOffset.x, l.y + 0.22, l.z + poolOffset.z);
          dMat.compose(dPos, new THREE.Quaternion(), dScale);
          iLightPool.setMatrixAt(idx, dMat);
        });

        // Árboles y vallas puestos a mano (las salidas no los despejan)
        edit.addedTrees.forEach(at => {
          if (edit.removedTrees.has(at.id)) return;
          const isPine = at.especie === 'pino';
          trees.push({ id: at.id, x: at.x, y: this.getTerrainHeight(at.x, at.z), z: at.z, scale: 1.2, isPine: isPine, color: styleObj.treeColors[0], especie: isPine ? 'pino' : (at.especie || 'roble') });
          this.colliders.push({ type: 'circle', x: at.x, z: at.z, r: 0.7 });
        });
        // Una valla puesta a mano se parte en tramos de unos 4,5 m entre sus dos puntos
        edit.addedFences.forEach(af => {
          const dx = af.x2 - af.x1, dz = af.z2 - af.z1, L = Math.hypot(dx, dz);
          if (L < 1) return;
          const n = Math.max(1, Math.round(L / 4.5)), len = L / n;
          const rot = Math.atan2(-dz, dx);
          for (let k = 0; k < n; k++) {
            const t = (k + 0.5) / n;
            const px = af.x1 + dx * t, pz = af.z1 + dz * t;
            const id = af.id + '.' + k;
            if (edit.removedFences.has(id)) continue;
            fences.push({ id: id, x: px, y: this.getTerrainHeight(px, pz), z: pz, rot: rot, len: len });
          }
        });
        edit.addedRocks.forEach(ar => {
          if (edit.removedRocks.has(ar.id)) return;
          rocks.push({ id: ar.id, x: ar.x, y: this.getTerrainHeight(ar.x, ar.z), z: ar.z, scale: ar.escala || 1, color: 0x64748b });
        });
        edit.addedHedges.forEach(ah => {
          if (edit.removedHedges.has(ah.id)) return;
          hedges.push({ id: ah.id, x: ah.x, y: this.getTerrainHeight(ah.x, ah.z), z: ah.z, rot: ah.rot || 0 });
        });
        this.editables.rocks = rocks.map(r => ({ id: r.id, x: r.x, z: r.z }));
        this.editables.hedges = hedges.map(h => ({ id: h.id, x: h.x, z: h.z }));
        this.editables.trees = trees.map(t => ({ id: t.id, x: t.x, z: t.z }));
        this.editables.fences = fences.map(f => ({ id: f.id, x: f.x, z: f.z }));

        const hedgeG = new THREE.BoxGeometry(2.6, 0.95, 0.95); hedgeG.translate(0, 0.48, 0);
        const fenceG = new THREE.BoxGeometry(4.5, 1.0, 0.16); mapUVBand(fenceG, 0.0, 0.25); fenceG.translate(0, 0.5, 0);
        const rockG = rockGeometry();

        // Por especie, una malla de ramas y otra de hojas para el nivel «cerca» y otras dos para «lejos».
        // updateTreeLod reparte los árboles entre ambos según la distancia a la cámara.
        const porEspecie = {};
        trees.forEach((t, idx) => { (porEspecie[t.especie] = porEspecie[t.especie] || []).push({ t, idx }); });
        this.treeLod = [];
        Object.keys(porEspecie).forEach(esp => {
          const assetCerca = treeAsset(esp, 'cerca'), assetLejos = treeAsset(esp, 'lejos');
          if (!assetCerca || !assetLejos) return;
          const n = porEspecie[esp].length;
          const parte = asset => ({
            ramas: makeInstanced(asset.ramas.geo, asset.ramas.mat, n),
            hojas: makeInstanced(asset.hojas.geo, asset.hojas.mat, n)
          });
          const grupo = { cerca: parte(assetCerca), lejos: parte(assetLejos), arboles: [] };
          porEspecie[esp].forEach(({ t, idx }) => {
            const sc = t.scale * (TREE_SCALE[t.especie] || 1);
            dPos.set(t.x, t.y - 0.15, t.z);
            dQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), idx * 1.7);
            dScale.set(sc, sc, sc);
            grupo.arboles.push({ x: t.x, z: t.z, m: new THREE.Matrix4().compose(dPos, dQuat, dScale), color: new THREE.Color(t.color) });
          });
          repartirArboles(grupo, 0, null);
          this.treeLod.push(grupo);
        });
        const iHedge = makeInstanced(hedgeG, matFoliage, hedges.length);
        const iFence = makeInstanced(fenceG, matAtlas, fences.length);
        const iRock = makeInstanced(rockG, matRock, rocks.length);

        const cVeg = new THREE.Color();
        dScale.set(1, 1, 1);
        hedges.forEach((h, idx) => {
          dPos.set(h.x, h.y, h.z);
          dQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), h.rot);
          dMat.compose(dPos, dQuat, dScale);
          iHedge.setMatrixAt(idx, dMat);
          cVeg.setHex(idx % 2 === 0 ? styleObj.treeColors[0] : styleObj.treeColors[1 % styleObj.treeColors.length]);
          iHedge.setColorAt(idx, cVeg);
        });

        fences.forEach((f, idx) => {
          dPos.set(f.x, f.y, f.z);
          dQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), f.rot);
          dScale.set(f.len ? f.len / 4.5 : 1, f.alto || 1, 1);
          dMat.compose(dPos, dQuat, dScale);
          iFence.setMatrixAt(idx, dMat);
        });
        dScale.set(1, 1, 1);

        rocks.forEach((r, idx) => {
          dPos.set(r.x, r.y, r.z);
          dQuat.setFromAxisAngle(new THREE.Vector3(1, 1, 0).normalize(), idx);
          dScale.set(r.scale * 1.2, r.scale * 0.75, r.scale);
          dMat.compose(dPos, dQuat, dScale);
          iRock.setMatrixAt(idx, dMat);
          cVeg.setHex(r.color);
          iRock.setColorAt(idx, cVeg);
        });

        const allInstanced = [
          iPlinth, iWall, iRoof, iGable, iWinGlass, iWinFrame, iDoor, iChim, iBalc,
          iStall, iBarrel,
          iLampPost, iLampArm, iLantern, iLightPool,
          ...this.treeLod.reduce((acc, g) => acc.concat([g.cerca.ramas, g.cerca.hojas, g.lejos.ramas, g.lejos.hojas]), []), iHedge, iFence, iRock
        ];

        allInstanced.forEach(m => {
          m.instanceMatrix.needsUpdate = true;
          if (m.instanceColor) m.instanceColor.needsUpdate = true;
          this.scene.add(m);
          this.objects.push(m);
        });

        setStat('st-houses', houses.length);
        setStat('st-specials', builtSpecials);
        setStat('st-trees', trees.length + hedges.length + rocks.length);
        setStat('st-cols', this.colliders.length);
      }
    }


    // Texturas y colores del estilo (solo si el kit tiene estilo)
    if (styleKey && ARCHITECTURAL_STYLES[styleKey]) {
      const tx = createAtlasAndRoadTextures(styleObj);
      matAtlas.map = tx.atlasTex;
      matAtlas.bumpMap = tx.bumpTex;
      matAtlas.needsUpdate = true;
      matRoad.map = tx.roadTex;
      matRoad.bumpMap = tx.roadBumpTex;
      matRoad.needsUpdate = true;
      matCurb.color.set(styleObj.curbHex);
      matMagicCrystal.emissive.setHex(styleObj.magicHex);
    }

    return {
      styleKey: styleKey || null,
      styleObj,
      createVillage(scene, opts) { return new LineageVillageWorld(scene, opts || {}); },
      applyAtmosphere(preset) {
        this.setLevels(ATMOSPHERES[preset] || ATMOSPHERES.day);
      },
      // Niveles de luz de las farolas y el brillo de cristales y ventanas (admite valores intermedios)
      setLevels(a) {
        matGlassGlow.emissiveIntensity = a.glow;
        matWindowGlass.emissiveIntensity = a.window;
        matLightPool.opacity = a.pool;
        kitState.levels = { plaza: a.plaza, forge: a.forge };
        kitState.instances.forEach(v => { v.plazaLight.intensity = a.plaza; v.forgeLight.intensity = a.forge; });
      },
      instanceCount() { return kitState.instances.size; },
      dispose() {
        [matAtlas.map, matAtlas.bumpMap, matRoad.map, matRoad.bumpMap, glowTex, leadedGlassTex].forEach(t => { if (t) t.dispose(); });
      }
    };
  }

  window.VillageLib = { PRNG, ARCHITECTURAL_STYLES, ATMOSPHERES, createKit };
})();
