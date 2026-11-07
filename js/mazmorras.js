/*
 * mazmorras.js — Sistema integral de Mazmorras Ancestrales para el juego y el Creador de Mundos.
 *
 * Características:
 *  1. Creador de mundos: creación, edición de Jefe y esbirros élites (x4 u x8) y serialización.
 *  2. Supramundo exterior: Arco de piedra penetrable + corredor de exactamente 30 metros
 *     entre altos muros ciclópeos con antorchas + portal arcano de carga.
 *  3. Instancia interior: ocultación gráfica del supramundo, carga del modelo GLB (mazmorra1.glb)
 *     a escala monumental (22x), atmósfera tenebrosa de cripta, acompañante,
 *     luchadores de élite (todos x4 o x8) y Jefe de Mazmorra en el trono con barra HUD superior.
 *  4. Fin de mazmorra: victoria por muerte del Jefe (botín y salida) o derrota por muerte del personaje
 *     (reaparición exterior frente al arco).
 */
(function (root) {
  "use strict";

  const LISTA_GLB_DISPONIBLES = [
    { id: 'glb/mazmorras/mazmorra1.glb', nombre: 'Trono Ancestral y Cripta de Reyes (mazmorra1.glb)' }
  ];

  // Configuración de élite admitida estrictamente según requisitos: x4 o x8 de vida
  const MULTIPLICADORES_ELITE = [4, 8];

  // Helper para crear la estructura de una mazmorra lista para el mundo
  function generarMazmorraPorDefecto(world, x, y, opts) {
    opts = opts || {};
    const nro = (world && world.dungeons ? world.dungeons.length : 0) + 1;
    const lvl = typeof opts.level === 'number' ? opts.level : 15;
    return {
      id: opts.id || ('dungeon-' + Date.now().toString(36) + '-' + nro),
      name: opts.name || ('Mazmorra Ancestral ' + nro),
      x: Math.round(x || 0),
      y: Math.round(y || 0),
      tipoGeneracion: opts.tipoGeneracion || 'procedural',
      procedural: opts.procedural !== undefined ? opts.procedural : true,
      glb: opts.glb || 'glb/mazmorras/mazmorra1.glb',
      estilo: opts.estilo || 'cripta_gotica',
      seed: opts.seed || (Math.abs(Math.round(x || 0)) * 1000 + Math.abs(Math.round(y || 0))) || 48291,
      radio: opts.radio || 75,
      tamanoMedio: opts.tamanoMedio || 20,
      varianzaTamano: opts.varianzaTamano !== undefined ? opts.varianzaTamano : 0.4,
      numeroSalas: opts.numeroSalas || 7,
      ramificacion: opts.ramificacion !== undefined ? opts.ramificacion : 0.6,
      alturaTechos: opts.alturaTechos || 6.0,
      anchoPasillos: opts.anchoPasillos || 8.0,
      props: opts.props || {
        fuentes: true,
        antorchas: true,
        cofres: true,
        jarrones: true,
        musgo: true,
        sarcofagos: true,
        hongos: true
      },
      salasPersonalizadas: opts.salasPersonalizadas || [],
      level: lvl,
      rotacion: typeof opts.rotacion === 'number' ? opts.rotacion : 0,
      boss: {
        name: opts.boss && opts.boss.name ? opts.boss.name : 'Señor del Trono Caído',
        level: opts.boss && opts.boss.level ? opts.boss.level : (lvl + 2),
        rangoElite: opts.boss && opts.boss.rangoElite ? opts.boss.rangoElite : 10,
        recompensaOro: opts.boss && typeof opts.boss.recompensaOro === 'number' ? opts.boss.recompensaOro : 3000,
        recompensaArena: opts.boss && typeof opts.boss.recompensaArena === 'number' ? opts.boss.recompensaArena : 60,
        recompensaEquipo: opts.boss && opts.boss.recompensaEquipo ? opts.boss.recompensaEquipo : 'Yelmo del Soberano Caído'
      },
      elites: (opts.elites && opts.elites.length) ? opts.elites : [
        {
          name: 'Guardián del Trono',
          level: lvl,
          multiplicador: 8, // Élite x8
          cantidad: 4,
          modelo: 'caballero_oscuro'
        },
        {
          name: 'Centinela de Piedra',
          level: Math.max(1, lvl - 1),
          multiplicador: 4, // Élite x4
          cantidad: 6,
          modelo: 'golem_ancestral'
        }
      ],
      completada: false
    };
  }

  /* --------------------------------------------------------------------------
   * 1. CONSTRUCCIÓN DE LA ENTRADA EXTERIOR 3D (Arco penetrable + 30m pasillo)
   * -------------------------------------------------------------------------- */
  function construirEntradaExterior(THREE, dungeon, getWalkableHeightFn, opciones) {
    if (!THREE) return null;
    const sinLuces = !!(opciones && opciones.sinLucesPuntuales);
    const entradaGrupo = new THREE.Group();
    entradaGrupo.name = 'EntradaMazmorra_' + dungeon.id;

    const ySuelo = (typeof getWalkableHeightFn === 'function')
      ? getWalkableHeightFn(dungeon.x, dungeon.y)
      : (typeof dungeon.alturaBase === 'number' ? dungeon.alturaBase : 0);

    entradaGrupo.userData = {
      dungeonId: dungeon.id,
      tipo: 'entrada_dungeon',
      dungeonRef: dungeon,
      x: dungeon.x,
      y: ySuelo,
      z: dungeon.y,
      rotacion: dungeon.rotacion || 0,
      radioSombra: 34
    };

    entradaGrupo.position.set(dungeon.x, ySuelo, dungeon.y);
    entradaGrupo.rotation.y = dungeon.rotacion || 0;

    // Materiales de piedra ciclópea oscura rústica y runas
    const matPiedraMuro = new THREE.MeshStandardMaterial({
      color: 0x272e39,
      roughness: 0.88,
      metalness: 0.12
    });
    const matPiedraArco = new THREE.MeshStandardMaterial({
      color: 0x3f4856,
      roughness: 0.80,
      metalness: 0.18
    });
    const matSueloLosas = new THREE.MeshStandardMaterial({
      color: 0x1e242c,
      roughness: 0.94,
      metalness: 0.08
    });
    const matRunaPortal = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      emissive: 0x6d28d9,
      emissiveIntensity: 2.8,
      roughness: 0.1,
      metalness: 0.4
    });
    const matVortice = new THREE.MeshBasicMaterial({
      color: 0x4c1d95,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide
    });
    const matFuego = new THREE.MeshBasicMaterial({ color: 0xf97316 });

    // Dimensiones del corredor exterior entre muros
    const LONGITUD_CORREDOR = 30.0; // Exactamente 30 metros entre muros de piedra
    const ANCHO_PASO = 4.4;         // Vano libre penetrable para el personaje
    const ALTO_MUROS = 5.2;         // Altura de los muros laterales
    const GROSOR_MUROS = 1.0;       // Grosor de los bloques
    const X_MURO = (ANCHO_PASO / 2) + (GROSOR_MUROS / 2); // Distancia del eje al centro de cada muro

    // A) SUELO EMPEDRADO A LO LARGO DE LOS 30 METROS
    const geoSuelo = new THREE.BoxGeometry(ANCHO_PASO + 0.4, 0.18, LONGITUD_CORREDOR);
    const sueloPasillo = new THREE.Mesh(geoSuelo, matSueloLosas);
    sueloPasillo.position.set(0, 0.09, LONGITUD_CORREDOR / 2);
    sueloPasillo.receiveShadow = true;
    entradaGrupo.add(sueloPasillo);

    // B) MURO LATERAL IZQUIERDO (30 metros de piedra)
    const geoMuro = new THREE.BoxGeometry(GROSOR_MUROS, ALTO_MUROS, LONGITUD_CORREDOR);
    const muroIzq = new THREE.Mesh(geoMuro, matPiedraMuro);
    muroIzq.position.set(-X_MURO, ALTO_MUROS / 2, LONGITUD_CORREDOR / 2);
    muroIzq.castShadow = true;
    muroIzq.receiveShadow = true;
    entradaGrupo.add(muroIzq);

    // C) MURO LATERAL DERECHO (30 metros de piedra)
    const muroDer = new THREE.Mesh(geoMuro, matPiedraMuro);
    muroDer.position.set(X_MURO, ALTO_MUROS / 2, LONGITUD_CORREDOR / 2);
    muroDer.castShadow = true;
    muroDer.receiveShadow = true;
    entradaGrupo.add(muroDer);

    // Albardillas / remates superiores almenados en ambos muros cada 3 metros (geometría compartida)
    const geoAlmena = new THREE.BoxGeometry(GROSOR_MUROS + 0.2, 0.45, 1.4);
    for (let mz = 1.5; mz < LONGITUD_CORREDOR; mz += 3.0) {
      const almI = new THREE.Mesh(geoAlmena, matPiedraArco);
      almI.position.set(-X_MURO, ALTO_MUROS + 0.22, mz);
      entradaGrupo.add(almI);

      const almD = new THREE.Mesh(geoAlmena, matPiedraArco);
      almD.position.set(X_MURO, ALTO_MUROS + 0.22, mz);
      entradaGrupo.add(almD);
    }

    // D) ARCO PENETRABLE DE ENTRADA (en z = 0, cota inicial)
    // El personaje pasa a través del vano de 4.4m de ancho y 5.2m de altura
    // Pilar Izquierdo del Arco
    const geoPilar = new THREE.BoxGeometry(GROSOR_MUROS * 1.5, ALTO_MUROS + 0.8, GROSOR_MUROS * 1.5);
    const pilarIzq = new THREE.Mesh(geoPilar, matPiedraArco);
    pilarIzq.position.set(-X_MURO, (ALTO_MUROS + 0.8) / 2, 0);
    pilarIzq.castShadow = true;
    pilarIzq.receiveShadow = true;
    entradaGrupo.add(pilarIzq);

    // Pilar Derecho del Arco
    const pilarDer = new THREE.Mesh(geoPilar, matPiedraArco);
    pilarDer.position.set(X_MURO, (ALTO_MUROS + 0.8) / 2, 0);
    pilarDer.castShadow = true;
    pilarDer.receiveShadow = true;
    entradaGrupo.add(pilarDer);

    // Dintel / Bóveda del Arco superior penetrable (a 5.4m de altura)
    const geoDintel = new THREE.BoxGeometry(ANCHO_PASO + GROSOR_MUROS * 2.8, 1.2, GROSOR_MUROS * 1.6);
    const dintelArco = new THREE.Mesh(geoDintel, matPiedraArco);
    dintelArco.position.set(0, ALTO_MUROS + 0.8, 0);
    dintelArco.castShadow = true;
    entradaGrupo.add(dintelArco);

    // Clave rúnica resplandeciente en el centro del arco
    const geoClave = new THREE.OctahedronGeometry(0.7, 1);
    const claveRuna = new THREE.Mesh(geoClave, matRunaPortal);
    claveRuna.position.set(0, ALTO_MUROS + 0.8, -0.6);
    entradaGrupo.add(claveRuna);

    // Pebeteros de fuego crepitante flanqueando el arco de entrada (geometrías compartidas)
    const geoPebetero = new THREE.CylinderGeometry(0.45, 0.35, 1.1, 8);
    const geoLlamaPeb = new THREE.ConeGeometry(0.35, 0.7, 6);
    [-X_MURO - 1.2, X_MURO + 1.2].forEach(px => {
      const pebetero = new THREE.Mesh(geoPebetero, matPiedraArco);
      pebetero.position.set(px, 0.55, -0.8);
      entradaGrupo.add(pebetero);

      const llama = new THREE.Mesh(geoLlamaPeb, matFuego);
      llama.position.set(px, 1.35, -0.8);
      entradaGrupo.add(llama);

      if (!sinLuces) {
        const luz = new THREE.PointLight(0xf97316, 2.0, 16, 1.8);
        luz.position.set(px, 1.7, -0.8);
        entradaGrupo.add(luz);
      }
    });

    // E) ANTORCHAS EN LOS MUROS CADA 7.5 METROS A LO LARGO DE LOS 30 METROS (geometrías compartidas)
    const distAntorchas = [6.0, 13.5, 21.0, 28.0];
    const geoBrazoAnt = new THREE.BoxGeometry(0.12, 0.12, 0.6);
    const geoFuegoAnt = new THREE.ConeGeometry(0.18, 0.45, 5);
    distAntorchas.forEach(zPos => {
      [-X_MURO + 0.55, X_MURO - 0.55].forEach((xPos, sideIdx) => {
        // Brazo de la antorcha
        const brazo = new THREE.Mesh(geoBrazoAnt, matPiedraArco);
        brazo.position.set(xPos, 2.8, zPos);
        entradaGrupo.add(brazo);

        // Llama
        const antorchaFuego = new THREE.Mesh(geoFuegoAnt, matFuego);
        antorchaFuego.position.set(xPos + (sideIdx === 0 ? 0.25 : -0.25), 3.05, zPos);
        entradaGrupo.add(antorchaFuego);

        // Luz puntual tenue
        if (!sinLuces) {
          const luzAnt = new THREE.PointLight(0xf97316, 1.4, 10, 1.8);
          luzAnt.position.set(xPos + (sideIdx === 0 ? 0.35 : -0.35), 3.2, zPos);
          entradaGrupo.add(luzAnt);
        }
      });
    });

    // F) PORTAL DE CARGA DE LA MAZMORRA (en z = 30 metros exactos)
    // Marco final
    const marcoFinalIzq = new THREE.Mesh(geoPilar, matPiedraArco);
    marcoFinalIzq.position.set(-X_MURO, (ALTO_MUROS + 0.8) / 2, LONGITUD_CORREDOR);
    entradaGrupo.add(marcoFinalIzq);

    const marcoFinalDer = new THREE.Mesh(geoPilar, matPiedraArco);
    marcoFinalDer.position.set(X_MURO, (ALTO_MUROS + 0.8) / 2, LONGITUD_CORREDOR);
    entradaGrupo.add(marcoFinalDer);

    const dintelFinal = new THREE.Mesh(geoDintel, matPiedraArco);
    dintelFinal.position.set(0, ALTO_MUROS + 0.8, LONGITUD_CORREDOR);
    entradaGrupo.add(dintelFinal);

    // Vórtice arcano de niebla y portal de carga en z = 30m
    const geoVortice = new THREE.PlaneGeometry(ANCHO_PASO, ALTO_MUROS + 0.2);
    const vortice = new THREE.Mesh(geoVortice, matVortice);
    vortice.position.set(0, (ALTO_MUROS + 0.2) / 2, LONGITUD_CORREDOR - 0.05);
    entradaGrupo.add(vortice);

    entradaGrupo.userData.luzLocal = { x: 0, y: 2.5, z: 12.0, color: 0xf97316, intensity: 2.2, distance: 32 };
    entradaGrupo.userData.luzPortalLocal = { x: 0, y: 2.5, z: LONGITUD_CORREDOR - 0.6, color: 0x8b5cf6, intensity: 3.0, distance: 18 };
    if (!sinLuces) {
      const luzVortice = new THREE.PointLight(0x8b5cf6, 3.2, 14, 1.5);
      luzVortice.position.set(0, 2.5, LONGITUD_CORREDOR - 0.6);
      entradaGrupo.add(luzVortice);
    }

    // Información para colisiones y carga del portal
    entradaGrupo.userData.corredor = {
      longitud: LONGITUD_CORREDOR,
      ancho: ANCHO_PASO,
      puntoPortalZ: LONGITUD_CORREDOR,
      puntoArcoZ: 0
    };

    return entradaGrupo;
  }

  /* --------------------------------------------------------------------------
   * 2. CARGA Y ADECUACIÓN GRÁFICA DEL MODELO GLB DE LA MAZMORRA (CON CACHÉ Y CLONE)
   * -------------------------------------------------------------------------- */
  const _glbMazmorraCache = new Map();

  function cargarModeloMazmorra(THREE, rutaGLB, onLoaded, onError) {
    if (_glbMazmorraCache.has(rutaGLB)) {
      const gltfBase = _glbMazmorraCache.get(rutaGLB);
      const sk = (typeof SkeletonUtils !== 'undefined' && SkeletonUtils.clone) ? SkeletonUtils : (typeof window !== 'undefined' && window.SkeletonUtils);
      const modeloClon = sk && sk.clone ? sk.clone(gltfBase.scene) : gltfBase.scene.clone(true);
      if (typeof onLoaded === 'function') onLoaded(modeloClon);
      return;
    }

    function procesarGLTF(gltf) {
      _glbMazmorraCache.set(rutaGLB, gltf);
      const modelo = gltf.scene;

      // Calcular bounding box para escala real de gran cripta de mazmorra
      const bbox = new THREE.Box3().setFromObject(modelo);
      const size = new THREE.Vector3();
      bbox.getSize(size);

      // Escala 36x para mazmorra1.glb: >2000m² de interior transitable (101.5m largo x 45.5m ancho x 4.2m alto)
      const ESCALA_DUNGEON = 36.0;
      modelo.scale.setScalar(ESCALA_DUNGEON);

      // Alinear el suelo de la alfombra real sobre y = 0
      const bboxEsc = new THREE.Box3().setFromObject(modelo);
      modelo.position.set(0, -bboxEsc.min.y, 0);

      // Optimización de materiales para cripta oscura y sombras
      modelo.traverse(o => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
          if (o.material) {
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            mats.forEach(m => {
              if (m) {
                m.side = THREE.DoubleSide;
                m.roughness = Math.min(0.92, Math.max(0.40, m.roughness || 0.7));
                if (typeof m.metalness === 'number') m.metalness = Math.min(0.35, m.metalness);
              }
            });
          }
        }
      });

      if (typeof onLoaded === 'function') onLoaded(modelo);
    }

    const LoaderClass = (THREE && THREE.GLTFLoader) || (typeof window !== 'undefined' && window.GLTFLoader);
    if (LoaderClass) {
      const loader = new LoaderClass();
      loader.load(rutaGLB, procesarGLTF, undefined, err => {
        console.warn('Error cargando GLB de mazmorra:', rutaGLB, err);
        if (typeof onError === 'function') onError(err);
      });
      return;
    }

    try {
      const dynamicImport = new Function('specifier', 'return import(specifier);');
      dynamicImport('three/addons/loaders/GLTFLoader.js').then(mod => {
        const GLTFLoader = (mod && mod.GLTFLoader) || mod;
        if (GLTFLoader) {
          const loader = new GLTFLoader();
          _ejecutarCarga(loader);
        } else if (typeof onError === 'function') {
          onError(new Error('GLTFLoader no exportado'));
        }
      }).catch(err => {
        if (typeof window !== 'undefined') console.warn('GLTFLoader no disponible tras importación dinámica:', err);
        if (typeof onError === 'function') onError(err);
      });
      return;
    } catch (e) {
      if (typeof onError === 'function') onError(new Error('GLTFLoader no disponible'));
    }
  }

  /* --------------------------------------------------------------------------
   * 3. GESTIÓN DE LA INSTANCIA DE MAZMORRA (Entrada, combate, fin y retorno)
   * -------------------------------------------------------------------------- */
  class GestorMazmorras {
    constructor(ctx) {
      this.ctx = ctx || {}; // Contiene scene, hero, acompanante, visorWorld, HUD, etc.
      this.dungeonActiva = null;
      this.enMazmorra = false;
      this.estadoPrevio = null;
      this.grupoInstancia = null;
      this.bossInstancia = null;
      this.elitesInstancia = [];
      this.luzMazmorra = null;
    }

    // Comprueba si el héroe está al final del corredor exterior (a 30m del arco)
    comprobarEntradaExterior(dungeons, heroX, heroZ) {
      if (this.enMazmorra || !dungeons || !dungeons.length) return null;
      for (let i = 0; i < dungeons.length; i++) {
        const d = dungeons[i];
        const rot = d.rotacion || 0;
        // Transformar posición del héroe a coordenadas locales de la entrada
        const dx = heroX - d.x;
        const dz = heroZ - d.y;
        const cosR = Math.cos(rot);
        const sinR = Math.sin(rot);
        const lx = dx * cosR - dz * sinR;
        const lz = dx * sinR + dz * cosR;

        // Comprobar si el héroe está cerca del portal (z entre 25.5m y 34m y |x| < 3.2m)
        if (lz >= 25.5 && lz <= 34.0 && Math.abs(lx) <= 3.2) {
          const dist = Math.hypot(lx, lz - 30.0);
          return {
            dungeon: d,
            distanciaAlPortal: dist,
            cruzandoPortal: dist <= 2.4 || lz >= 28.5
          };
        }
      }
      return null;
    }

    // Inicia la instancia interior de la mazmorra
    iniciarInstancia(dungeon, callbacks) {
      if (this.enMazmorra || !dungeon) return;
      const THREE = this.ctx.THREE || (typeof window !== 'undefined' ? window.THREE : null);
      const scene = this.ctx.scene;
      const hero = this.ctx.hero;
      const charCtrl = this.ctx.character;
      const camera = this.ctx.camera;
      const controls = this.ctx.controls;
      if (!THREE || !scene || !hero) return;

      this.enMazmorra = true;
      this.dungeonActiva = dungeon;
      callbacks = callbacks || {};

      // 1. Guardar estado del supramundo exterior
      this.estadoPrevio = {
        heroPos: { x: hero.x, y: hero.y, z: hero.z },
        charPos: charCtrl && charCtrl.root ? charCtrl.root.position.clone() : null,
        charRot: charCtrl && charCtrl.root ? charCtrl.root.rotation.clone() : null,
        camPos: camera ? camera.position.clone() : null,
        ctrlTarget: controls ? controls.target.clone() : null,
        controlsMinDistance: controls ? controls.minDistance : 1.0,
        controlsMaxDistance: controls ? controls.maxDistance : 500,
        charOffsetCamara: (charCtrl && charCtrl.offsetCamara && typeof charCtrl.offsetCamara.clone === 'function') ? charCtrl.offsetCamara.clone() : (charCtrl && charCtrl.offsetCamara ? Object.assign({}, charCtrl.offsetCamara) : null),
        origGetWalkableHeight: (charCtrl && charCtrl.world) ? charCtrl.world.getWalkableHeight : null,
        origIsWaterHazard: (charCtrl && charCtrl.world) ? charCtrl.world.isWaterHazard : null,
        origGetColliders: (charCtrl && charCtrl.world) ? charCtrl.world.getColliders : null,
        background: scene.background,
        fog: scene.fog,
        terrenoVisible: this.ctx.terrenoGroup ? this.ctx.terrenoGroup.visible : true,
        aguaVisible: this.ctx.aguaMesh ? this.ctx.aguaMesh.visible : true,
        pueblosVisible: this.ctx.pueblosGroup ? this.ctx.pueblosGroup.visible : true,
        cieloVisible: this.ctx.cielo ? this.ctx.cielo.visible : true
      };

      // 2. Ocultar estrictamente el supramundo ("solo gráficamente debe estar la mazmorra")
      scene.visible = true;
      if (this.ctx.farMesh) this.ctx.farMesh.visible = false;
      if (this.ctx.nearChunks) {
        if (typeof this.ctx.nearChunks.forEach === 'function') {
          this.ctx.nearChunks.forEach(c => {
            const m = (c && c.mesh) ? c.mesh : c;
            if (m && typeof m.visible === 'boolean') m.visible = false;
          });
        } else if (typeof this.ctx.nearChunks === 'object') {
          Object.values(this.ctx.nearChunks).forEach(c => {
            const m = (c && c.mesh) ? c.mesh : c;
            if (m && typeof m.visible === 'boolean') m.visible = false;
          });
        }
      }
      if (this.ctx.lagos) {
        if (typeof this.ctx.lagos.forEach === 'function') {
          this.ctx.lagos.forEach(l => { const m = (l && l.mesh) ? l.mesh : l; if (m && typeof m.visible === 'boolean') m.visible = false; });
        } else if (typeof this.ctx.lagos === 'object') {
          Object.values(this.ctx.lagos).forEach(l => { const m = (l && l.mesh) ? l.mesh : l; if (m && typeof m.visible === 'boolean') m.visible = false; });
        }
      }
      if (this.ctx.waterMesh) this.ctx.waterMesh.visible = false;
      if (this.ctx.decorGroup) this.ctx.decorGroup.visible = false;
      if (Array.isArray(this.ctx.ladrillos)) this.ctx.ladrillos.forEach(t => { if (t && t.malla) t.malla.visible = false; });
      if (Array.isArray(this.ctx.towns)) this.ctx.towns.forEach(t => { if (t && t.group) t.group.visible = false; });
      if (this.ctx.terrenoGroup && this.ctx.terrenoGroup !== scene) this.ctx.terrenoGroup.visible = false;
      if (this.ctx.aguaMesh && this.ctx.aguaMesh !== scene) this.ctx.aguaMesh.visible = false;
      if (this.ctx.pueblosGroup && this.ctx.pueblosGroup !== scene) this.ctx.pueblosGroup.visible = false;
      if (this.ctx.cielo) this.ctx.cielo.visible = false;

      // Atmósfera de mazmorra tenebrosa (visibilidad cinematográfica)
      scene.background = new THREE.Color(0x060913);
      scene.fog = new THREE.FogExp2(0x060913, 0.005);

      // Aislar memoria y detener descargas/streaming del supramundo exterior
      if (typeof this.ctx.aislarParaMazmorra === 'function') {
        this.ctx.aislarParaMazmorra(dungeon);
      }

      // Crear grupo raíz de la mazmorra
      this.grupoInstancia = new THREE.Group();
      this.grupoInstancia.name = 'InstanciaMazmorra_' + dungeon.id;
      scene.add(this.grupoInstancia);

      const Gen = (typeof DungeonGenerator !== 'undefined') ? DungeonGenerator : (typeof window !== 'undefined' ? window.DungeonGenerator : null);
      const esProcedural = !!Gen && dungeon.tipoGeneracion !== 'glb';

      // Iluminación interior clara y atmosférica (ligera en GPU: sin luces redundantes en modo procedural)
      if (!esProcedural) {
        const luzAmbiente = new THREE.AmbientLight(0xffffff, 1.5);
        this.grupoInstancia.add(luzAmbiente);
      }

      if (typeof THREE.HemisphereLight === 'function') {
        const hemiMazmorra = new THREE.HemisphereLight(0xe2e8f0, 0x1e293b, esProcedural ? 0.95 : 1.0);
        hemiMazmorra.position.set(0, 30.0, 0);
        this.grupoInstancia.add(hemiMazmorra);
      }

      // Antorchas fijas y luz direccional solo para el modelo GLB clásico; las mazmorras procedurales usan pool de 4 luces optimizado
      if (!esProcedural) {
        const luzDirPasillo = new THREE.DirectionalLight(0xffeedd, 1.5);
        luzDirPasillo.position.set(0, 24.0, 42.0);
        luzDirPasillo.target.position.set(0, 1.0, 16.0);
        this.grupoInstancia.add(luzDirPasillo);
        this.grupoInstancia.add(luzDirPasillo.target);

        const matLlama = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const geoLlama = new THREE.ConeGeometry(0.24, 0.65, 6);
        [-28.0, -16.0, -4.0, 8.0, 20.0, 32.0].forEach(zAnt => {
          [-3.1, 3.1].forEach(xAnt => {
            const pLuz = new THREE.PointLight(0xf59e0b, 1.6, 20, 1.4);
            pLuz.position.set(xAnt, 4.8, zAnt);
            this.grupoInstancia.add(pLuz);

            const llama = new THREE.Mesh(geoLlama, matLlama);
            llama.position.set(xAnt, 4.7, zAnt);
            this.grupoInstancia.add(llama);
          });
        });

        const luzTrono = new THREE.PointLight(0xa855f7, 4.5, 48, 1.2);
        luzTrono.position.set(0, 8.0, -36.0);
        this.grupoInstancia.add(luzTrono);
      }

      // 3. Cargar el modelo 3D de la mazmorra (Procedural estilo creador de pueblos o GLB)
      let proc = null;
      let SPAWN_X = 0.0;
      let SPAWN_Y = 0.0;
      let SPAWN_Z = 46.0;
      const cfgMonstruosProc = this.ctx.usarModelosCombateExternos ? { habilitados: false } : undefined;

      if (esProcedural && Gen) {
        proc = Gen.generarMazmorra(THREE, {
          seed: dungeon.seed || (Math.abs(dungeon.x || 0) * 1000 + Math.abs(dungeon.y || 0)) || 48291,
          estilo: dungeon.estilo || 'cripta_gotica',
          id: dungeon.id,
          radio: dungeon.radio || 75,
          tamanoMedio: dungeon.tamanoMedio || 20,
          varianzaTamano: dungeon.varianzaTamano !== undefined ? dungeon.varianzaTamano : 0.4,
          numeroSalas: dungeon.numeroSalas || 7,
          ramificacion: dungeon.ramificacion !== undefined ? dungeon.ramificacion : 0.6,
          alturaTechos: dungeon.alturaTechos || 6.0,
          anchoPasillos: dungeon.anchoPasillos || 8.0,
          salas: (Array.isArray(dungeon.salas) && dungeon.salas.length > 0) ? dungeon.salas : undefined,
          salasPersonalizadas: dungeon.salasPersonalizadas || [],
          props: dungeon.props,
          modoJuegoRapido: true,
          usarPoolLuces: true,
          sinSombrasMallas: true,
          monstruos: cfgMonstruosProc
        });
        this.instanciaProcedural = proc;
        if (this.grupoInstancia) this.grupoInstancia.add(proc.group);

        if (proc.spawns && proc.spawns.hero) {
          SPAWN_X = proc.spawns.hero.x || 0.0;
          SPAWN_Y = proc.spawns.hero.y || 0.0;
          SPAWN_Z = proc.spawns.hero.z || 46.0;
        }
      } else {
        SPAWN_X = 0.0;
        SPAWN_Y = 2.92;
        SPAWN_Z = 37.6;
        cargarModeloMazmorra(THREE, dungeon.glb || 'glb/mazmorras/mazmorra1.glb', modelo => {
          if (this.grupoInstancia) this.grupoInstancia.add(modelo);
        }, err => {
          if (typeof window !== 'undefined') console.warn('Fallback a DungeonGenerator procedural tras error en GLB:', err);
          if (Gen) {
            const fallbackProc = Gen.generarMazmorra(THREE, {
              seed: dungeon.seed || 48291,
              estilo: dungeon.estilo || 'cripta_gotica',
              id: dungeon.id,
              radio: dungeon.radio || 75,
              tamanoMedio: dungeon.tamanoMedio || 20,
              varianzaTamano: dungeon.varianzaTamano !== undefined ? dungeon.varianzaTamano : 0.4,
              numeroSalas: dungeon.numeroSalas || 7,
              ramificacion: dungeon.ramificacion !== undefined ? dungeon.ramificacion : 0.6,
              alturaTechos: dungeon.alturaTechos || 6.0,
              anchoPasillos: dungeon.anchoPasillos || 8.0,
              salasPersonalizadas: dungeon.salasPersonalizadas || [],
              props: dungeon.props,
              modoJuegoRapido: true,
              usarPoolLuces: true,
              sinSombrasMallas: true,
              monstruos: cfgMonstruosProc
            });
            this.instanciaProcedural = fallbackProc;
            if (this.grupoInstancia) this.grupoInstancia.add(fallbackProc.group);
          }
        });
      }

      // 4. Posicionar al Héroe y al Acompañante AL INICIO DEL ARCHIVO EN LOS PASILLOS MÁS ESTRECHOS
      // Dimensiones >2000m² habitables:
      // Orientado hacia el interior (-Z, rotY = PI) con visión desahogada en tercera persona.
      hero.x = SPAWN_X;
      hero.y = SPAWN_Y;
      hero.z = SPAWN_Z;

      // Teletransportar físicamente la malla 3D del personaje
      if (charCtrl && charCtrl.root) {
        charCtrl.root.position.set(SPAWN_X, SPAWN_Y, SPAWN_Z);
        charCtrl.root.rotation.set(0, Math.PI, 0); // Mirando hacia el pasillo interior (-Z)
        if (charCtrl.target) charCtrl.target.set(SPAWN_X, SPAWN_Y, SPAWN_Z);
        charCtrl.destino = null;
        charCtrl.sinAvance = 0;
      }

      // Teletransportar la cámara con encuadre interior cercano e inmersivo (siempre dentro de la mazmorra)
      const CAM_OFFSET_Y = 2.4;
      const CAM_OFFSET_Z = 5.2;
      if (controls) {
        controls.target.set(SPAWN_X, SPAWN_Y + 1.2, SPAWN_Z);
        controls.minDistance = 2.0;
        controls.maxDistance = 14.0;
        if (camera) {
          camera.position.set(SPAWN_X, SPAWN_Y + CAM_OFFSET_Y, SPAWN_Z + CAM_OFFSET_Z);
          controls.update();
        }
      }
      if (charCtrl) {
        charCtrl.offsetCamara = (THREE && THREE.Vector3) ? new THREE.Vector3(0, CAM_OFFSET_Y, CAM_OFFSET_Z) : { x: 0, y: CAM_OFFSET_Y, z: CAM_OFFSET_Z };
        if (camera && typeof camera.position.clone === 'function') charCtrl.camaraFinal = camera.position.clone();
        charCtrl.modoCamaraAnterior = 'follow';
      }

      // Conectar física de suelo plana de la mazmorra y colisionadores de muros/props
      if (charCtrl && charCtrl.world) {
        charCtrl.world.getWalkableHeight = () => SPAWN_Y;
        charCtrl.world.isWaterHazard = () => false;
        const colisionadoresMazmorra = (proc && proc.colliders) || [];
        charCtrl.world.getColliders = (x, z) => {
          if (proc && typeof proc.getColliders === 'function') return proc.getColliders(x, z, 28);
          return colisionadoresMazmorra;
        };
        charCtrl.world.colliders = colisionadoresMazmorra;
      }

      // Posicionar al acompañante inmediatamente detrás del héroe en el pasillo
      if (this.ctx.acompanante) {
        this.ctx.acompanante.x = SPAWN_X - 1.2;
        this.ctx.acompanante.z = SPAWN_Z + 2.0;
        this.ctx.acompanante.y = SPAWN_Y;
        if (this.ctx.acompanante.mesh) {
          this.ctx.acompanante.mesh.position.set(SPAWN_X - 1.2, SPAWN_Y, SPAWN_Z + 2.0);
          this.ctx.acompanante.mesh.rotation.set(0, Math.PI, 0);
        }
      }

      // 5. Spawneo de Luchadores de Élite escalonados a lo largo del gran corredor (progresión por salas)
      // Se sitúan escalonados cada 12m-16m para que se activen progresivamente al avanzar y no todos juntos
      this.elitesInstancia = [];
      const listaElites = dungeon.elites || [];
      const posicionesElites = (proc && proc.spawns && proc.spawns.elites && proc.spawns.elites.length)
        ? proc.spawns.elites.map(e => ({ x: e.x, z: e.z }))
        : [
            { x: -1.4, z: 24.0 }, { x: 1.4, z: 24.0 },   // Pareja 1: Primer encuentro a 13.6m del inicio
            { x: -1.6, z: 12.0 }, { x: 1.6, z: 12.0 },   // Pareja 2: Segundo encuentro a 25.6m
            { x: -2.2, z: 0.0 },  { x: 2.2, z: 0.0 },    // Pareja 3: Cruce central de columnas
            { x: -3.0, z: -12.0 }, { x: 3.0, z: -12.0 }, // Pareja 4: Gran galería norte
            { x: -3.6, z: -24.0 }, { x: 3.6, z: -24.0 }  // Pareja 5: Guardia de honor ante el trono
          ];

      let posIdx = 0;
      listaElites.forEach(elDef => {
        const cant = elDef.cantidad || 1;
        const mult = (elDef.multiplicador === 8 || elDef.multiplicador === 4) ? elDef.multiplicador : 4;
        for (let c = 0; c < cant; c++) {
          const pt = posicionesElites[posIdx % posicionesElites.length];
          posIdx++;
          const procMesh = (proc && proc.monstruos) ? (proc.monstruos.find(m => m.userData && m.userData.idMonstruo === ('guard_elite_' + posIdx)) || proc.monstruos[posIdx % proc.monstruos.length]) : null;
          const eliteObj = {
            id: 'elite-dungeon-' + posIdx,
            name: elDef.name || 'Luchador Élite de Mazmorra',
            level: elDef.level || dungeon.level,
            multiplicador: mult,
            rangoElite: mult,
            boss: false,
            x: pt.x,
            z: pt.z,
            y: SPAWN_Y,
            esMazmorraProcedural: esProcedural,
            meshProcedural: procMesh,
            modelo: elDef.modelo || ['caballero_oscuro', 'golem_ancestral', 'brujo_arcano', 'ogro_acorazado', 'asesino_sombras'][posIdx % 5],
            hp: 1, maxHp: 1 // Inicializado por combat.js
          };
          if (this.ctx.crearMonstruoCombate) {
            this.ctx.crearMonstruoCombate(eliteObj, this.grupoInstancia);
          }
          this.elitesInstancia.push(eliteObj);
        }
      });

      // 6. Spawneo del Jefe de Mazmorra frente al trono al fondo
      const bDef = dungeon.boss || {};
      const bossX = (proc && proc.spawns && proc.spawns.boss) ? proc.spawns.boss.x : 0.0;
      const bossZ = (proc && proc.spawns && proc.spawns.boss) ? proc.spawns.boss.z : -38.0;
      const bossY = (proc && proc.spawns && proc.spawns.boss) ? (SPAWN_Y + (proc.spawns.boss.y || 0.6)) : (SPAWN_Y + 0.1);
      const procBossMesh = (proc && proc.monstruos) ? proc.monstruos.find(m => m.userData && m.userData.idMonstruo === 'boss_principal') : null;

      this.bossInstancia = {
        id: 'boss-dungeon-' + dungeon.id,
        name: bDef.name || 'Señor del Trono Caído',
        level: bDef.level || (dungeon.level + 2),
        boss: true,
        rangoElite: bDef.rangoElite || 10,
        x: bossX,
        z: bossZ,
        y: bossY,
        esMazmorraProcedural: esProcedural,
        meshProcedural: procBossMesh,
        recompensas: {
          oro: bDef.recompensaOro || 3000,
          arena: bDef.recompensaArena || 60,
          equipo: bDef.recompensaEquipo || 'Armadura del Soberano Caído'
        },
        hp: 1, maxHp: 1
      };
      if (this.ctx.crearMonstruoCombate) {
        this.ctx.crearMonstruoCombate(this.bossInstancia, this.grupoInstancia, true);
      }

      // 7. Mostrar HUD del Jefe
      if (typeof callbacks.onIniciarHUD === 'function') {
        callbacks.onIniciarHUD(this.bossInstancia, dungeon);
      }

      // 8. Culling inicial de estancias comunicadas y pool de luces
      if (this.instanciaProcedural && typeof this.instanciaProcedural.actualizarVisibilidadEstancias === 'function') {
        const proc = this.instanciaProcedural;
        const salaInicio = proc.encontrarSalaEnPosicion ? proc.encontrarSalaEnPosicion(SPAWN_X, SPAWN_Z) : null;
        const idInicio = salaInicio ? salaInicio.id : null;
        this._ultimaSalaHeroeId = idInicio;
        this.estanciasVisibles = proc.obtenerEstanciasComunicadas ? proc.obtenerEstanciasComunicadas(idInicio, 2) : null;
        if (this.estanciasVisibles) {
          proc.actualizarVisibilidadEstancias(this.estanciasVisibles);
        }
        if (typeof proc.actualizarPoolLuces === 'function') {
          proc.actualizarPoolLuces(SPAWN_X, SPAWN_Z, this.estanciasVisibles);
          this._luzPoolX = SPAWN_X;
          this._luzPoolZ = SPAWN_Z;
        }
      }
    }

    // Actualización de oclusión de cámara: si una pared o techo se interpone entre la cámara y el personaje, desaparece
    actualizarOclusionCamara() {
      if (!this.enMazmorra || !this.instanciaProcedural) return;
      const camera = this.ctx.camera;
      const hero = this.ctx.hero;
      const proc = this.instanciaProcedural;
      if (!camera || !hero || typeof proc.actualizarOclusionCamara !== 'function') return;

      const charCtrl = this.ctx.character;
      const charPos = (charCtrl && charCtrl.root) ? charCtrl.root.position : hero;
      const camPos = camera.position;
      if (camPos && charPos && this._oclCache && this._oclCache.est === this.estanciasVisibles) {
        const dCam = (camPos.x - this._oclCache.cx) ** 2 + (camPos.y - this._oclCache.cy) ** 2 + (camPos.z - this._oclCache.cz) ** 2;
        const hx = typeof charPos.x === 'number' ? charPos.x : 0;
        const hy = typeof charPos.y === 'number' ? charPos.y : 0;
        const hz = typeof charPos.z === 'number' ? charPos.z : 0;
        const dHero = (hx - this._oclCache.hx) ** 2 + (hy - this._oclCache.hy) ** 2 + (hz - this._oclCache.hz) ** 2;
        if (dCam < 0.0004 && dHero < 0.0004) return;
      }
      if (camPos && charPos) {
        this._oclCache = {
          cx: camPos.x || 0, cy: camPos.y || 0, cz: camPos.z || 0,
          hx: charPos.x || 0, hy: charPos.y || 0, hz: charPos.z || 0,
          est: this.estanciasVisibles
        };
      }
      proc.actualizarOclusionCamara(camera.position, charPos, this.estanciasVisibles);
    }

    // Actualización en cada frame dentro de la mazmorra
    actualizarInstancia(dt, hero, callbacks) {
      if (!this.enMazmorra || !this.dungeonActiva) return;
      callbacks = callbacks || {};

      if (this.instanciaProcedural && typeof this.instanciaProcedural.update === 'function') {
        this.instanciaProcedural.update(dt, (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000);
      }

      // Culling de estancias comunicadas y desaparición de paredes ante la cámara
      if (this.instanciaProcedural && hero) {
        const proc = this.instanciaProcedural;
        const charCtrl = this.ctx.character;
        const charPos = (charCtrl && charCtrl.root) ? charCtrl.root.position : hero;
        const hx = (charPos && typeof charPos.x === 'number') ? charPos.x : ((typeof hero.x === 'number') ? hero.x : 0);
        const hz = (charPos && typeof charPos.z === 'number') ? charPos.z : ((typeof hero.z === 'number') ? hero.z : 0);
        const hy = (charPos && typeof charPos.y === 'number') ? charPos.y : ((typeof hero.y === 'number') ? hero.y : 0);
        hero.x = hx; hero.y = hy; hero.z = hz;

        const salaActual = proc.encontrarSalaEnPosicion ? proc.encontrarSalaEnPosicion(hx, hz) : null;
        const idActual = salaActual ? salaActual.id : null;

        let cambioEstancia = false;
        if (idActual !== this._ultimaSalaHeroeId || !this.estanciasVisibles) {
          this._ultimaSalaHeroeId = idActual;
          cambioEstancia = true;
          this.estanciasVisibles = proc.obtenerEstanciasComunicadas ? proc.obtenerEstanciasComunicadas(idActual, 2) : null;
          if (typeof proc.actualizarVisibilidadEstancias === 'function' && this.estanciasVisibles) {
            proc.actualizarVisibilidadEstancias(this.estanciasVisibles);
          }
        }

        if (typeof proc.actualizarPoolLuces === 'function') {
          const dxPool = hx - (this._luzPoolX !== undefined ? this._luzPoolX : -9999);
          const dzPool = hz - (this._luzPoolZ !== undefined ? this._luzPoolZ : -9999);
          if (cambioEstancia || (dxPool * dxPool + dzPool * dzPool) > 0.36) {
            proc.actualizarPoolLuces(hx, hz, this.estanciasVisibles);
            this._luzPoolX = hx;
            this._luzPoolZ = hz;
          }
        }

        const obtenerSalaEntidad = ent => {
          if (ent.combatRef) {
            ent.x = ent.combatRef.x;
            ent.z = ent.combatRef.z;
          }
          if (ent._salaCacheX === ent.x && ent._salaCacheZ === ent.z && ent._salaCacheInit) {
            return ent._salaCache;
          }
          ent._salaCacheX = ent.x;
          ent._salaCacheZ = ent.z;
          ent._salaCacheInit = true;
          ent._salaCache = proc.encontrarSalaEnPosicion ? proc.encontrarSalaEnPosicion(ent.x, ent.z) : null;
          return ent._salaCache;
        };

        // Visibilidad dinámica de monstruos según pertenencia a estancias comunicadas
        if (this.estanciasVisibles && Array.isArray(this.elitesInstancia)) {
          for (let i = 0; i < this.elitesInstancia.length; i++) {
            const el = this.elitesInstancia[i];
            const sEl = obtenerSalaEntidad(el);
            const vis = sEl ? this.estanciasVisibles.has(sEl.id) : true;
            el._enEstanciaVisible = vis;
            if (el.mesh) el.mesh.visible = vis;
            if (el.group) el.group.visible = vis;
            if (el.bar) el.bar.visible = vis;
            if (el.barraHp) el.barraHp.visible = vis;
            if (el.combatRef && !vis) {
              if (el.combatRef.group) el.combatRef.group.visible = false;
              if (el.combatRef.bar) el.combatRef.bar.visible = false;
            }
          }
        }
        if (this.estanciasVisibles && this.bossInstancia) {
          const sBoss = obtenerSalaEntidad(this.bossInstancia);
          const visBoss = sBoss ? this.estanciasVisibles.has(sBoss.id) : true;
          this.bossInstancia._enEstanciaVisible = visBoss;
          if (this.bossInstancia.mesh) this.bossInstancia.mesh.visible = visBoss;
          if (this.bossInstancia.group) this.bossInstancia.group.visible = visBoss;
          if (this.bossInstancia.bar) this.bossInstancia.bar.visible = visBoss;
          if (this.bossInstancia.barraHp) this.bossInstancia.barraHp.visible = visBoss;
          if (this.bossInstancia.combatRef && !visBoss) {
            if (this.bossInstancia.combatRef.group) this.bossInstancia.combatRef.group.visible = false;
            if (this.bossInstancia.combatRef.bar) this.bossInstancia.combatRef.bar.visible = false;
          }
        }

        // Desaparición de paredes que se interponen entre la cámara y el personaje
        if (!callbacks.omitirOclusionCamara) {
          this.actualizarOclusionCamara();
        }
      }

      // 1. Condición de fin: Victoria por muerte del Jefe de Mazmorra
      if (this.bossInstancia && this.bossInstancia.hp <= 0) {
        this.dungeonActiva.completada = true;
        const b = this.bossInstancia;
        this.bossInstancia = null; // Evitar disparos repetidos
        if (typeof callbacks.onVictoria === 'function') {
          callbacks.onVictoria({
            dungeon: this.dungeonActiva,
            boss: b,
            recompensas: b.recompensas
          });
        }
        return;
      }

      // 2. Condición de fin: Derrota por muerte del personaje
      if (hero && (hero.hp <= 0 || hero.dead)) {
        if (typeof callbacks.onDerrota === 'function') {
          callbacks.onDerrota({
            dungeon: this.dungeonActiva,
            boss: this.bossInstancia
          });
        }
      }
    }

    // Sale de la mazmorra y devuelve al héroe al supramundo exterior frente al arco
    salirInstancia(victoria, callbacks) {
      if (!this.enMazmorra) return;
      const scene = this.ctx.scene;
      const hero = this.ctx.hero;
      const d = this.dungeonActiva;

      // 1. Limpiar esbirros de combate y eliminar/liberar geometrías de la mazmorra
      if (typeof this.ctx.limpiarMonstruosMazmorra === 'function') {
        this.ctx.limpiarMonstruosMazmorra();
      }
      if (this.grupoInstancia && scene) {
        scene.remove(this.grupoInstancia);
        const liberarGeometrias = (nodo) => {
          if (!nodo) return;
          if (nodo.geometry && typeof nodo.geometry.dispose === 'function') {
            nodo.geometry.dispose();
          }
          if (Array.isArray(nodo.children)) {
            for (let i = 0; i < nodo.children.length; i++) liberarGeometrias(nodo.children[i]);
          }
        };
        liberarGeometrias(this.grupoInstancia);
        this.grupoInstancia = null;
      }
      this.instanciaProcedural = null;
      this._ultimaSalaHeroeId = null;
      this._luzPoolX = undefined;
      this._luzPoolZ = undefined;
      this.estanciasVisibles = null;
      this._oclCache = null;
      this.bossInstancia = null;
      this.elitesInstancia = [];

      // 2. Restaurar física del mundo exterior y teletransportar al héroe frente a la puerta exterior de la mazmorra
      const charCtrl = this.ctx.character;
      const camera = this.ctx.camera;
      const controls = this.ctx.controls;

      if (charCtrl && charCtrl.world && this.estadoPrevio) {
        if (this.estadoPrevio.origGetWalkableHeight) {
          charCtrl.world.getWalkableHeight = this.estadoPrevio.origGetWalkableHeight;
        }
        if (this.estadoPrevio.origIsWaterHazard) {
          charCtrl.world.isWaterHazard = this.estadoPrevio.origIsWaterHazard;
        }
        if (this.estadoPrevio.origGetColliders) {
          charCtrl.world.getColliders = this.estadoPrevio.origGetColliders;
        }
      }

      if (d && hero) {
        const rot = d.rotacion || 0;
        // Frente a la puerta/arco exterior de la mazmorra (z = -4.5m en coords locales)
        const offsetLocalZ = -4.5;
        const wx = d.x + Math.sin(rot) * offsetLocalZ;
        const wz = d.y + Math.cos(rot) * offsetLocalZ;
        hero.x = wx;
        hero.z = wz;
        if (typeof this.ctx.getWalkableHeight === 'function') {
          hero.y = this.ctx.getWalkableHeight(hero.x, hero.z);
        }

        // Teletransportar físicamente la malla 3D del personaje y desbloquear controles
        if (charCtrl && charCtrl.root) {
          charCtrl.root.position.set(wx, hero.y, wz);
          charCtrl.root.rotation.set(0, rot, 0);
          if (typeof charCtrl.mirarAngulo === 'function') {
            charCtrl.mirarAngulo(rot);
          }
          if (charCtrl.target) charCtrl.target.set(wx, hero.y, wz);
          charCtrl.destino = null;
          charCtrl.sinAvance = 0;
          charCtrl.lockUntil = 0;
        }

        if (charCtrl && this.estadoPrevio && this.estadoPrevio.charOffsetCamara) {
          charCtrl.offsetCamara = this.estadoPrevio.charOffsetCamara;
        }

        // Teletransportar cámara y controles al exterior frente a la puerta y restaurar límites de zoom
        if (controls) {
          controls.target.set(wx, hero.y + 1.2, wz);
          if (this.estadoPrevio) {
            controls.minDistance = this.estadoPrevio.controlsMinDistance !== undefined ? this.estadoPrevio.controlsMinDistance : 1.0;
            controls.maxDistance = this.estadoPrevio.controlsMaxDistance !== undefined ? this.estadoPrevio.controlsMaxDistance : 500;
          }
          if (camera) {
            camera.position.set(wx - Math.sin(rot) * 9.0, hero.y + 4.5, wz - Math.cos(rot) * 9.0);
            controls.update();
            if (charCtrl && typeof camera.position.clone === 'function') {
              charCtrl.camaraFinal = camera.position.clone();
            }
          }
        }

        if (this.ctx.acompanante) {
          this.ctx.acompanante.x = hero.x + 1.6;
          this.ctx.acompanante.z = hero.z - 1.2;
          if (typeof this.ctx.getWalkableHeight === 'function') {
            this.ctx.acompanante.y = this.ctx.getWalkableHeight(this.ctx.acompanante.x, this.ctx.acompanante.z);
          }
          if (this.ctx.acompanante.mesh) {
            this.ctx.acompanante.mesh.position.set(this.ctx.acompanante.x, this.ctx.acompanante.y, this.ctx.acompanante.z);
            this.ctx.acompanante.mesh.rotation.set(0, rot, 0);
          }
        }
      }

      // 3. Restaurar supramundo exterior (ya con el héroe y cámara situados ante la puerta exterior)
      if (scene) scene.visible = true;
      if (typeof this.ctx.restaurarDeMazmorra === 'function') {
        this.ctx.restaurarDeMazmorra();
      }
      if (this.estadoPrevio && scene) {
        scene.background = this.estadoPrevio.background;
        scene.fog = this.estadoPrevio.fog;
        if (this.ctx.farMesh) this.ctx.farMesh.visible = true;
        if (this.ctx.nearChunks) {
          if (typeof this.ctx.nearChunks.forEach === 'function') {
            this.ctx.nearChunks.forEach(c => {
              const m = (c && c.mesh) ? c.mesh : c;
              if (m && typeof m.visible === 'boolean') m.visible = true;
            });
          } else if (typeof this.ctx.nearChunks === 'object') {
            Object.values(this.ctx.nearChunks).forEach(c => {
              const m = (c && c.mesh) ? c.mesh : c;
              if (m && typeof m.visible === 'boolean') m.visible = true;
            });
          }
        }
        if (this.ctx.lagos) {
          if (typeof this.ctx.lagos.forEach === 'function') {
            this.ctx.lagos.forEach(l => { const m = (l && l.mesh) ? l.mesh : l; if (m && typeof m.visible === 'boolean') m.visible = true; });
          } else if (typeof this.ctx.lagos === 'object') {
            Object.values(this.ctx.lagos).forEach(l => { const m = (l && l.mesh) ? l.mesh : l; if (m && typeof m.visible === 'boolean') m.visible = true; });
          }
        }
        if (this.ctx.waterMesh) this.ctx.waterMesh.visible = true;
        if (this.ctx.decorGroup) this.ctx.decorGroup.visible = true;
        if (Array.isArray(this.ctx.ladrillos)) this.ctx.ladrillos.forEach(t => { if (t && t.malla) t.malla.visible = true; });
        if (Array.isArray(this.ctx.towns)) this.ctx.towns.forEach(t => { if (t && t.group) t.group.visible = true; });
        if (this.ctx.terrenoGroup && this.ctx.terrenoGroup !== scene) this.ctx.terrenoGroup.visible = this.estadoPrevio.terrenoVisible;
        if (this.ctx.aguaMesh && this.ctx.aguaMesh !== scene) this.ctx.aguaMesh.visible = this.estadoPrevio.aguaVisible;
        if (this.ctx.pueblosGroup && this.ctx.pueblosGroup !== scene) this.ctx.pueblosGroup.visible = this.estadoPrevio.pueblosVisible;
        if (this.ctx.cielo) this.ctx.cielo.visible = this.estadoPrevio.cieloVisible;
      }

      // Si fue derrota, restaurar la salud completa del personaje y del acompañante
      if (!victoria && hero) {
        hero.dead = false;
        hero.deadUntil = 0;
        hero.hp = hero.maxHp || 250;
        if (typeof hero.maxMp === 'number') hero.mp = hero.maxMp;
        if (this.ctx.acompanante && this.ctx.acompanante.debilitado) {
          this.ctx.acompanante.debilitado = false;
          this.ctx.acompanante.hp = this.ctx.acompanante.maxHp || 180;
        }
      }

      this.enMazmorra = false;
      this.dungeonActiva = null;
      this.instanciaProcedural = null;

      if (callbacks && typeof callbacks.onSalirHUD === 'function') {
        callbacks.onSalirHUD();
      }
    }
  }

  const api = {
    LISTA_GLB_DISPONIBLES,
    MULTIPLICADORES_ELITE,
    generarMazmorraPorDefecto,
    construirEntradaExterior,
    cargarModeloMazmorra,
    GestorMazmorras
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MazmorrasLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
