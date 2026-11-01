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
      glb: opts.glb || 'glb/mazmorras/mazmorra1.glb',
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
  function construirEntradaExterior(THREE, dungeon, getWalkableHeightFn) {
    if (!THREE) return null;
    const entradaGrupo = new THREE.Group();
    entradaGrupo.name = 'EntradaMazmorra_' + dungeon.id;
    entradaGrupo.userData = { dungeonId: dungeon.id, tipo: 'entrada_dungeon', dungeonRef: dungeon };

    const ySuelo = (typeof getWalkableHeightFn === 'function')
      ? getWalkableHeightFn(dungeon.x, dungeon.y)
      : (typeof dungeon.alturaBase === 'number' ? dungeon.alturaBase : 0);

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

    // Albardillas / remates superiores almenados en ambos muros cada 3 metros
    for (let mz = 1.5; mz < LONGITUD_CORREDOR; mz += 3.0) {
      const geoAlmena = new THREE.BoxGeometry(GROSOR_MUROS + 0.2, 0.45, 1.4);
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

    // Pebeteros de fuego crepitante flanqueando el arco de entrada
    [-X_MURO - 1.2, X_MURO + 1.2].forEach(px => {
      const pebetero = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 1.1, 8), matPiedraArco);
      pebetero.position.set(px, 0.55, -0.8);
      entradaGrupo.add(pebetero);

      const llama = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 6), matFuego);
      llama.position.set(px, 1.35, -0.8);
      entradaGrupo.add(llama);

      const luz = new THREE.PointLight(0xf97316, 2.0, 16, 1.8);
      luz.position.set(px, 1.7, -0.8);
      entradaGrupo.add(luz);
    });

    // E) ANTORCHAS EN LOS MUROS CADA 7.5 METROS A LO LARGO DE LOS 30 METROS
    const distAntorchas = [6.0, 13.5, 21.0, 28.0];
    distAntorchas.forEach(zPos => {
      [-X_MURO + 0.55, X_MURO - 0.55].forEach((xPos, sideIdx) => {
        // Brazo de la antorcha
        const brazo = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.6), matPiedraArco);
        brazo.position.set(xPos, 2.8, zPos);
        entradaGrupo.add(brazo);

        // Llama
        const antorchaFuego = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 5), matFuego);
        antorchaFuego.position.set(xPos + (sideIdx === 0 ? 0.25 : -0.25), 3.05, zPos);
        entradaGrupo.add(antorchaFuego);

        // Luz puntual tenue
        const luzAnt = new THREE.PointLight(0xf97316, 1.4, 10, 1.8);
        luzAnt.position.set(xPos + (sideIdx === 0 ? 0.35 : -0.35), 3.2, zPos);
        entradaGrupo.add(luzAnt);
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

    const luzVortice = new THREE.PointLight(0x8b5cf6, 3.2, 14, 1.5);
    luzVortice.position.set(0, 2.5, LONGITUD_CORREDOR - 0.6);
    entradaGrupo.add(luzVortice);

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
   * 2. CARGA Y ADECUACIÓN GRÁFICA DEL MODELO GLB DE LA MAZMORRA
   * -------------------------------------------------------------------------- */
  function cargarModeloMazmorra(THREE, rutaGLB, onLoaded, onError) {
    if (!THREE || typeof THREE.GLTFLoader === 'undefined') {
      if (typeof onError === 'function') onError(new Error('GLTFLoader no disponible'));
      return;
    }
    const loader = new THREE.GLTFLoader();
    loader.load(rutaGLB, gltf => {
      const modelo = gltf.scene;

      // Calcular bounding box para escala real de gran cripta de mazmorra
      const bbox = new THREE.Box3().setFromObject(modelo);
      const size = new THREE.Vector3();
      bbox.getSize(size);

      // Escala 22x recomendada para mazmorra1.glb (62m x 28m x 40m)
      const ESCALA_DUNGEON = 22.0;
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
                m.roughness = Math.min(0.92, Math.max(0.40, m.roughness || 0.7));
                if (typeof m.metalness === 'number') m.metalness = Math.min(0.35, m.metalness);
              }
            });
          }
        }
      });

      if (typeof onLoaded === 'function') onLoaded(modelo);
    }, undefined, err => {
      console.warn('Error cargando GLB de mazmorra:', rutaGLB, err);
      if (typeof onError === 'function') onError(err);
    });
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
        origGetWalkableHeight: (charCtrl && charCtrl.world) ? charCtrl.world.getWalkableHeight : null,
        origIsWaterHazard: (charCtrl && charCtrl.world) ? charCtrl.world.isWaterHazard : null,
        background: scene.background,
        fog: scene.fog,
        terrenoVisible: this.ctx.terrenoGroup ? this.ctx.terrenoGroup.visible : true,
        aguaVisible: this.ctx.aguaMesh ? this.ctx.aguaMesh.visible : true,
        pueblosVisible: this.ctx.pueblosGroup ? this.ctx.pueblosGroup.visible : true,
        cieloVisible: this.ctx.cielo ? this.ctx.cielo.visible : true
      };

      // 2. Ocultar estrictamente el supramundo ("solo gráficamente debe estar la mazmorra")
      if (this.ctx.terrenoGroup) this.ctx.terrenoGroup.visible = false;
      if (this.ctx.aguaMesh) this.ctx.aguaMesh.visible = false;
      if (this.ctx.pueblosGroup) this.ctx.pueblosGroup.visible = false;
      if (this.ctx.cielo) this.ctx.cielo.visible = false;

      // Atmósfera de mazmorra tenebrosa
      scene.background = new THREE.Color(0x050811);
      scene.fog = new THREE.FogExp2(0x050811, 0.016);

      // Crear grupo raíz de la mazmorra
      this.grupoInstancia = new THREE.Group();
      this.grupoInstancia.name = 'InstanciaMazmorra_' + dungeon.id;
      scene.add(this.grupoInstancia);

      // Iluminación interior tenue ambiental
      const luzAmbiente = new THREE.AmbientLight(0x1e293b, 1.4);
      this.grupoInstancia.add(luzAmbiente);

      // Antorchas con luz dorada a lo largo del pasillo estrecho de la mazmorra
      const matLlama = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const geoLlama = new THREE.ConeGeometry(0.18, 0.5, 6);
      [-16.0, -8.0, 0.0, 8.0, 16.0, 24.0].forEach(zAnt => {
        [-1.85, 1.85].forEach(xAnt => {
          const pLuz = new THREE.PointLight(0xf59e0b, 2.4, 15, 1.5);
          pLuz.position.set(xAnt, 3.2, zAnt);
          this.grupoInstancia.add(pLuz);

          const llama = new THREE.Mesh(geoLlama, matLlama);
          llama.position.set(xAnt, 3.1, zAnt);
          this.grupoInstancia.add(llama);
        });
      });

      const luzTrono = new THREE.PointLight(0xa855f7, 3.8, 38, 1.3);
      luzTrono.position.set(0, 6.0, -16.0);
      this.grupoInstancia.add(luzTrono);

      // 3. Cargar el modelo 3D de la mazmorra (mazmorra1.glb)
      cargarModeloMazmorra(THREE, dungeon.glb || 'glb/mazmorras/mazmorra1.glb', modelo => {
        if (this.grupoInstancia) this.grupoInstancia.add(modelo);
      });

      // 4. Posicionar al Héroe y al Acompañante AL INICIO DEL ARCHIVO EN LOS PASILLOS MÁS ESTRECHOS
      // Según la geometría real de mazmorra1.glb a 22x:
      // El pasillo más estrecho (Grupo_2) discurre de z = +26m a z = -25m con vano X = [-2.1m, +2.1m] y suelo y = 1.79m.
      // El inicio del archivo / entrada se sitúa en z = +25.5m mirando hacia -Z (hacia el interior del corredor).
      const SPAWN_X = 0.0;
      const SPAWN_Y = 1.79;
      const SPAWN_Z = 25.5;

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

      // Teletransportar la cámara y el control orbital detrás del héroe en el pasillo estrecho
      if (controls) {
        controls.target.set(SPAWN_X, SPAWN_Y + 1.2, SPAWN_Z - 3.5);
        if (camera) {
          camera.position.set(SPAWN_X, SPAWN_Y + 2.2, SPAWN_Z + 3.8);
          controls.update();
        }
      }

      // Conectar física de suelo plana de la mazmorra a 1.79m de altura
      if (charCtrl && charCtrl.world) {
        charCtrl.world.getWalkableHeight = () => SPAWN_Y;
        charCtrl.world.isWaterHazard = () => false;
      }

      // Posicionar al acompañante inmediatamente detrás del héroe en el pasillo estrecho
      if (this.ctx.acompanante) {
        this.ctx.acompanante.x = 0.0;
        this.ctx.acompanante.z = 27.2;
        this.ctx.acompanante.y = SPAWN_Y;
        if (this.ctx.acompanante.mesh) {
          this.ctx.acompanante.mesh.position.set(0.0, SPAWN_Y, 27.2);
          this.ctx.acompanante.mesh.rotation.set(0, Math.PI, 0);
        }
      }

      // 5. Spawneo de Luchadores de Élite (todos x4 o x8 según configuración) a lo largo del pasillo y nave
      this.elitesInstancia = [];
      const listaElites = dungeon.elites || [];
      const posicionesElites = [
        { x: -0.7, z: 18.5 }, { x: 0.7, z: 18.5 },  // Pareja 1 en el pasillo estrecho
        { x: -0.8, z: 11.5 }, { x: 0.8, z: 11.5 },  // Pareja 2 en el pasillo estrecho
        { x: -2.2, z: 3.0 },  { x: 2.2, z: 3.0 },   // Pareja 3 abriéndose a la antecámara
        { x: -3.5, z: -7.0 }, { x: 3.5, z: -7.0 }   // Pareja 4 frente al salón del trono
      ];

      let posIdx = 0;
      listaElites.forEach(elDef => {
        const cant = elDef.cantidad || 1;
        const mult = (elDef.multiplicador === 8 || elDef.multiplicador === 4) ? elDef.multiplicador : 4;
        for (let c = 0; c < cant; c++) {
          const pt = posicionesElites[posIdx % posicionesElites.length];
          posIdx++;
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
            modelo: elDef.modelo || 'caballero_oscuro',
            hp: 1, maxHp: 1 // Inicializado por combat.js
          };
          if (this.ctx.crearMonstruoCombate) {
            this.ctx.crearMonstruoCombate(eliteObj, this.grupoInstancia);
          }
          this.elitesInstancia.push(eliteObj);
        }
      });

      // 6. Spawneo del Jefe de Mazmorra frente al trono al fondo (z = -15.5m)
      const bDef = dungeon.boss || {};
      this.bossInstancia = {
        id: 'boss-dungeon-' + dungeon.id,
        name: bDef.name || 'Señor del Trono Caído',
        level: bDef.level || (dungeon.level + 2),
        boss: true,
        rangoElite: bDef.rangoElite || 10,
        x: 0,
        z: -15.5,
        y: SPAWN_Y + 0.1,
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
    }

    // Actualización en cada frame dentro de la mazmorra
    actualizarInstancia(dt, hero, callbacks) {
      if (!this.enMazmorra || !this.dungeonActiva) return;
      callbacks = callbacks || {};

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

      // 1. Eliminar grupo de la mazmorra y limpiar esbirros
      if (this.grupoInstancia && scene) {
        scene.remove(this.grupoInstancia);
        this.grupoInstancia = null;
      }
      this.bossInstancia = null;
      this.elitesInstancia = [];

      // 2. Restaurar supramundo exterior
      if (this.estadoPrevio && scene) {
        scene.background = this.estadoPrevio.background;
        scene.fog = this.estadoPrevio.fog;
        if (this.ctx.terrenoGroup) this.ctx.terrenoGroup.visible = this.estadoPrevio.terrenoVisible;
        if (this.ctx.aguaMesh) this.ctx.aguaMesh.visible = this.estadoPrevio.aguaVisible;
        if (this.ctx.pueblosGroup) this.ctx.pueblosGroup.visible = this.estadoPrevio.pueblosVisible;
        if (this.ctx.cielo) this.ctx.cielo.visible = this.estadoPrevio.cieloVisible;
      }

      // 3. Teletransportar al héroe frente al arco exterior penetrable (z = -4m en coords locales)
      const charCtrl = this.ctx.character;
      const camera = this.ctx.camera;
      const controls = this.ctx.controls;

      if (d && hero) {
        const rot = d.rotacion || 0;
        // Frente al arco de entrada mirando hacia afuera (alejándose de la entrada)
        const offsetLocalZ = -4.5;
        const wx = d.x + Math.sin(rot) * offsetLocalZ;
        const wz = d.y + Math.cos(rot) * offsetLocalZ;
        hero.x = wx;
        hero.z = wz;
        if (typeof this.ctx.getWalkableHeight === 'function') {
          hero.y = this.ctx.getWalkableHeight(hero.x, hero.z);
        }

        // Restaurar física del mundo exterior para el personaje
        if (charCtrl && charCtrl.world && this.estadoPrevio) {
          if (this.estadoPrevio.origGetWalkableHeight) {
            charCtrl.world.getWalkableHeight = this.estadoPrevio.origGetWalkableHeight;
          }
          if (this.estadoPrevio.origIsWaterHazard) {
            charCtrl.world.isWaterHazard = this.estadoPrevio.origIsWaterHazard;
          }
        }

        // Teletransportar físicamente la malla 3D del personaje
        if (charCtrl && charCtrl.root) {
          charCtrl.root.position.set(wx, hero.y, wz);
          charCtrl.root.rotation.set(0, rot, 0);
          if (charCtrl.target) charCtrl.target.set(wx, hero.y, wz);
          charCtrl.destino = null;
          charCtrl.sinAvance = 0;
        }

        // Teletransportar cámara y controles al exterior
        if (controls) {
          controls.target.set(wx, hero.y + 1.2, wz);
          if (camera) {
            camera.position.set(wx - Math.sin(rot) * 9.0, hero.y + 4.5, wz - Math.cos(rot) * 9.0);
            controls.update();
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

      // Si fue derrota, restaurar la salud completa del personaje
      if (!victoria && hero) {
        hero.dead = false;
        hero.hp = hero.maxHp || 250;
      }

      this.enMazmorra = false;
      this.dungeonActiva = null;

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
