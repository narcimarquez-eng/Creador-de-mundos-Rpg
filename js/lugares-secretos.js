/*
 * lugares-secretos.js — Generador y gestor de lugares secretos del mapa con arquitectura peculiar.
 * Fuentes arcanas luminiscentes, cabañas solitarias en parajes apartados, altares antiguos
 * y monolitos ancestrales. Expone window.LugaresSecretosLib (o module.exports para tests).
 */
(function (root) {
  "use strict";

  // Tipos de arquitectura secreta
  const TIPOS_SECRETO = {
    fuente: {
      id: 'fuente',
      nombre: 'Fuente Arcana',
      icono: '⛲',
      radioDeteccion: 16,
      desc: 'Una fuente de piedra pulida cuyas aguas reflejan una luz azulada inextinguible.',
      recompensa: 'Regeneración mágica y bendición de vitalidad'
    },
    cabana: {
      id: 'cabana',
      nombre: 'Cabaña del Ermitaño',
      icono: '🏚️',
      radioDeteccion: 18,
      desc: 'Una cabaña de vigas toscas oculta entre los árboles, con restos de fuego y viejos pergaminos.',
      recompensa: 'Provisiones del bosque y mapas antiguos'
    },
    altar: {
      id: 'altar',
      nombre: 'Altar Rúnico de los Sabios',
      icono: '⛩️',
      radioDeteccion: 16,
      desc: 'Cuatro pilares de roca ancestral flanquean una losa grabada con runas resplandecientes.',
      recompensa: 'Resonancia rúnica y sabiduría milenaria'
    },
    santuario: {
      id: 'santuario',
      nombre: 'Santuario de Piedra y Luz',
      icono: '🏛️',
      radioDeteccion: 20,
      desc: 'Un círculo ceremonial de monolitos tallados en honor a los siete reinos caídos.',
      recompensa: 'Bendición de los siete reinos'
    }
  };

  // Las 5 Cabañas especiales con modelos GLB dedicados y aldeanos con encargos mayores (100 monstruos)
  const CABANAS_GLB = [
    {
      id: 'cabana-1-clasica',
      archivo: 'glb/cabanas/cabana_1_troncos_clasica.glb',
      nombre: 'Cabaña de Troncos del Bosque',
      aldeano: 'Garek el Trampero',
      frase: 'Las bestias del bosque no dejan de proliferar. Despeja a 100 de ellas y te daré un generoso pago y equipo.',
      esMar: false,
      puebloIdx: 0
    },
    {
      id: 'cabana-2-posada',
      archivo: 'glb/cabanas/cabana_2_posada_dos_plantas.glb',
      nombre: 'Posada Solitaria del Sendero',
      aldeano: 'Borgan el Guardián del Paso',
      frase: 'Los viajeros temen ser devorados por los caminos. Ayúdame abatiendo a 100 de esas criaturas.',
      esMar: false,
      puebloIdx: 0
    },
    {
      id: 'cabana-3-pescador',
      archivo: 'glb/cabanas/cabana_3_pescador_pilotes.glb',
      nombre: 'Cabaña de Pescador de la Costa',
      aldeano: 'Kyle el Pescador de Bajamar',
      frase: 'Las criaturas costeras asaltan las redes y la orilla. Acaba con 100 y compartiré los tesoros de la marea.',
      esMar: true,
      puebloIdx: 0
    },
    {
      id: 'cabana-4-vigia',
      archivo: 'glb/cabanas/cabana_4_torre_de_vigia.glb',
      nombre: 'Torre Vigía de la Avanzada',
      aldeano: 'Varek el Centinela del Alto',
      frase: 'Desde lo alto diviso manadas salvajes cercando el paso norte. Derrota a 100 antes de que avancen.',
      esMar: false,
      puebloIdx: 1
    },
    {
      id: 'cabana-5-redonda',
      archivo: 'glb/cabanas/cabana_5_redonda.glb',
      nombre: 'Cabaña Redonda del Erudito',
      aldeano: 'Olorin el Herbolario Silvano',
      frase: 'Mis cultivos de raíces arcanas son pisoteados por las bestias. Elimina a 100 de ellas para proteger el bosque.',
      esMar: false,
      puebloIdx: 1
    }
  ];

  function hashStr(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
    }
    return h;
  }

  function rngSec(semilla) {
    let s = (semilla >>> 0) || 123456789;
    return function () {
      s = (Math.imul(1664525, s) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  // Genera lugares secretos distribuidos orgánicamente en el mapa lejos de las plazas de los pueblos
  function generarLugaresSecretos(world) {
    if (!world) return [];
    const W = world.size || 2000;
    const semilla = hashStr((world.name || 'Mundo') + '_' + (world.id || 'rpg') + '_' + W);
    const rnd = rngSec(semilla);

    const pueblos = world.towns || [];
    const zonas = world.zones || [];
    const lugares = [];

    const pInicio = pueblos.find(p => p.isStart || p.id === world.startTownId) || pueblos[0] || { x: W * 0.3, y: W * 0.3, id: 't-inicio' };
    const pSegundo = pueblos.filter(p => p.id !== pInicio.id).sort((a, b) => {
      return Math.hypot(a.x - pInicio.x, a.y - pInicio.y) - Math.hypot(b.x - pInicio.x, b.y - pInicio.y);
    })[0] || { x: W * 0.65, y: W * 0.65, id: 't-segundo' };

    // Zonas de monstruos ordenadas por proximidad a los pueblos
    const zonasCombate = zonas.filter(z => (z.type === 'caza' || z.type === 'elite') && z.monsters && z.monsters.length);
    const listaZonas = zonasCombate.length ? zonasCombate : zonas;

    // 1. Generar e incluir las 5 Cabañas GLB especiales cerca de los dos primeros pueblos en zonas de caza
    CABANAS_GLB.forEach((cabDef, idx) => {
      const pRef = (cabDef.puebloIdx === 0) ? pInicio : pSegundo;
      
      let zonaElegida = null;
      if (cabDef.esMar) {
        // Cabaña 3: buscar zona más cercana al mar / costa o borde bajo del mapa
        zonaElegida = listaZonas.slice().sort((a, b) => {
          const distMarA = Math.min(a.x, a.y, Math.abs(W - a.x), Math.abs(W - a.y));
          const distMarB = Math.min(b.x, b.y, Math.abs(W - b.x), Math.abs(W - b.y));
          return distMarA - distMarB;
        })[0] || listaZonas[0];
      } else {
        // Ordenar zonas por cercanía al pueblo de referencia, alternando
        const candidatas = listaZonas.slice().sort((a, b) => {
          return Math.hypot(a.x - pRef.x, a.y - pRef.y) - Math.hypot(b.x - pRef.x, b.y - pRef.y);
        });
        zonaElegida = candidatas[idx % candidatas.length] || candidatas[0] || { x: pRef.x + 160, y: pRef.y + 160, name: 'Bosque Cercano', monsters: [{ name: 'Lobo', level: 2 }] };
      }

      // Posición dentro o en el borde de la zona de caza (a ~140m+ del pueblo)
      const angZona = rnd() * Math.PI * 2;
      const rZona = (zonaElegida.radius ? Math.max(12, zonaElegida.radius * 0.45) : 30) + rnd() * 15;
      let cx = zonaElegida.x + Math.cos(angZona) * rZona;
      let cz = (zonaElegida.y !== undefined ? zonaElegida.y : zonaElegida.z) + Math.sin(angZona) * rZona;

      // Garantizar que no esté encima de la plaza del pueblo
      pueblos.forEach(p => {
        const dP = Math.hypot(cx - p.x, cz - p.y);
        if (dP < 135) {
          const dirP = Math.atan2(cz - p.y, cx - p.x);
          cx = p.x + Math.cos(dirP) * 145;
          cz = p.y + Math.sin(dirP) * 145;
        }
      });

      // Especie de monstruo para la misión de 100
      const monstruosZona = (zonaElegida.monsters && zonaElegida.monsters.length) ? zonaElegida.monsters : [{ name: 'Criatura Salvaje', level: 2 }];
      const mNormal = monstruosZona.find(m => !m.boss) || monstruosZona[0];
      const especieMonstruo = mNormal.name || 'Criatura del Bosque';
      const lvlMonstruo = mNormal.level || 2;

      lugares.push({
        id: cabDef.id,
        tipo: 'cabana',
        nombre: cabDef.nombre,
        aldeano: cabDef.aldeano,
        frase: cabDef.frase,
        modeloGLB: cabDef.archivo,
        esMar: cabDef.esMar,
        x: Math.round(cx * 10) / 10,
        z: Math.round(cz * 10) / 10,
        radio: 20,
        icono: cabDef.esMar ? '🛖🌊' : '🛖',
        desc: cabDef.nombre + ': refugio habitado por ' + cabDef.aldeano + (cabDef.esMar ? ', situado frente al mar.' : ' en plena zona de caza.'),
        recompensa: 'Cacería mayor de 100 monstruos y forja de armaduras superiores',
        rotacion: Math.round(rnd() * 6.28 * 100) / 100,
        misionCabana: {
          id: 'mision-' + cabDef.id,
          cabanaId: cabDef.id,
          cabanaNombre: cabDef.nombre,
          aldeano: cabDef.aldeano,
          frase: cabDef.frase,
          especie: especieMonstruo,
          nivelMonstruo: lvlMonstruo,
          zonaId: zonaElegida.id || ('zona-' + idx),
          zonaNombre: zonaElegida.name || 'Tierras Salvajes',
          cantidad: 100,
          progreso: 0,
          entregada: false,
          recompensa: {
            oroMin: 1, oroMax: 2000,
            arenaMin: 10, arenaMax: 50,
            pocionesVida: 4,
            nivelPiezaMultiplicador: 10,
            calidadMin: 0.50, calidadMax: 0.90
          }
        }
      });
    });

    // 2. Generar lugares secretos restantes (fuentes arcanas, altares y santuarios)
    const margen = Math.min(200, W * 0.12);
    const numLugaresTotal = Math.max(8, Math.min(16, Math.round(W / 260)));
    const tiposResto = ['fuente', 'altar', 'santuario'];
    const nombresExtra = [
      'de la Bruma', 'del Silencio', 'de las Estrellas', 'del Roble Caído',
      'de los Vientos', 'del Eco Antiguo', 'de la Esperanza', 'del Alba'
    ];

    let intentos = 0;
    while (lugares.length < numLugaresTotal && intentos < 250) {
      intentos++;
      const x = margen + rnd() * (W - margen * 2);
      const z = margen + rnd() * (W - margen * 2);

      // Lejos de los pueblos para ser genuinamente secretos (al menos 120m)
      const cercaPueblo = pueblos.some(p => Math.hypot(p.x - x, p.y - z) < 130);
      if (cercaPueblo) continue;

      // Separación entre secretos existentes (al menos 120m)
      const cercaSecreto = lugares.some(s => Math.hypot(s.x - x, s.z - z) < 120);
      if (cercaSecreto) continue;

      const tipoKey = tiposResto[(lugares.length - 5) % tiposResto.length];
      const tipo = TIPOS_SECRETO[tipoKey];
      const extra = nombresExtra[(lugares.length + intentos) % nombresExtra.length];
      const id = 'sec-' + (lugares.length + 1) + '-' + tipoKey;

      lugares.push({
        id,
        tipo: tipoKey,
        nombre: tipo.nombre + ' ' + extra,
        x: Math.round(x * 10) / 10,
        z: Math.round(z * 10) / 10,
        radio: tipo.radioDeteccion,
        icono: tipo.icono,
        desc: tipo.desc,
        recompensa: tipo.recompensa,
        rotacion: Math.round(rnd() * 6.28 * 100) / 100
      });
    }

    return lugares;
  }

  // Geometría 3D procedimental para cada tipo de lugar secreto con Three.js
  function construirModeloSecreto(THREE, lugar, getAlturaFn) {
    const grupo = new THREE.Group();
    grupo.name = 'LugarSecreto_' + lugar.id;
    const ySuelo = getAlturaFn ? getAlturaFn(lugar.x, lugar.z) : 0;
    grupo.position.set(lugar.x, ySuelo, lugar.z);
    grupo.rotation.y = lugar.rotacion || 0;

    const matPiedra = new THREE.MeshStandardMaterial({
      color: 0x475569, roughness: 0.85, metalness: 0.15
    });
    const matPiedraClara = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, roughness: 0.70, metalness: 0.20
    });
    const matMadera = new THREE.MeshStandardMaterial({
      color: 0x5c3a21, roughness: 0.90, metalness: 0.05
    });
    const matMaderaOscura = new THREE.MeshStandardMaterial({
      color: 0x331e11, roughness: 0.92, metalness: 0.02
    });
    const matRuna = new THREE.MeshStandardMaterial({
      color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.8, roughness: 0.1, metalness: 0.5
    });
    const matOro = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, roughness: 0.35, metalness: 0.85
    });
    const matAguaArcana = new THREE.MeshStandardMaterial({
      color: 0x06b6d4, emissive: 0x0891b2, emissiveIntensity: 1.2, roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.85
    });

    if (lugar.tipo === 'fuente') {
      // 1. FUENTE ARCANA
      // Base octogonal escalonada
      const baseGeo = new THREE.CylinderGeometry(4.2, 4.6, 0.45, 8);
      const base = new THREE.Mesh(baseGeo, matPiedra);
      base.position.y = 0.22;
      base.castShadow = true; base.receiveShadow = true;
      grupo.add(base);

      // Taza exterior con borde
      const tazaExt = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.8, 0.85, 16), matPiedra);
      tazaExt.position.y = 0.65;
      tazaExt.castShadow = true; tazaExt.receiveShadow = true;
      grupo.add(tazaExt);

      const borde = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.25, 8, 24), matPiedraClara);
      borde.rotation.x = Math.PI / 2;
      borde.position.y = 1.05;
      grupo.add(borde);

      // Agua mágica luminosa
      const agua = new THREE.Mesh(new THREE.CircleGeometry(3.5, 20), matAguaArcana);
      agua.rotation.x = -Math.PI / 2;
      agua.position.y = 0.92;
      grupo.add(agua);

      // Pedestal central tallado
      const colCentral = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.1, 2.2, 8), matPiedraClara);
      colCentral.position.y = 1.4;
      colCentral.castShadow = true;
      grupo.add(colCentral);

      // Taza superior
      const tazaSup = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.2, 0.45, 12), matPiedra);
      tazaSup.position.y = 2.4;
      grupo.add(tazaSup);

      // Orbe de cristal arcano flotante con luz
      const orbe = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 2), matRuna);
      orbe.position.y = 3.2;
      grupo.add(orbe);

      // Luz puntual tenue
      const luz = new THREE.PointLight(0x38bdf8, 1.8, 18, 1.6);
      luz.position.y = 3.2;
      grupo.add(luz);

    } else if (lugar.tipo === 'cabana') {
      // 2. CABAÑAS: Modelos GLB dedicados a ras de suelo y arquitectura arquitectónica proporcionada
      if (lugar.modeloGLB && typeof THREE.GLTFLoader !== 'undefined') {
        // Carga asíncrona del modelo GLB con dimensionado arquitectónico óptimo y apoyo exacto en el suelo
        const loader = new THREE.GLTFLoader();
        loader.load(lugar.modeloGLB, gltf => {
          const modelo = gltf.scene;
          
          // Cálculo preciso del bounding box original
          const bboxOrig = new THREE.Box3().setFromObject(modelo);
          const sizeOrig = new THREE.Vector3();
          bboxOrig.getSize(sizeOrig);
          const maxHoriz = Math.max(sizeOrig.x, sizeOrig.z, 1);

          // Escala proporcionada al tamaño humano (personaje 1.82m -> cabaña ancho 7.5 - 8.5m)
          const escala = Math.min(3.2, Math.max(1.2, 8.2 / maxHoriz));
          modelo.scale.setScalar(escala);

          // Calcular bounding box ya escalado para apoyar la base a ras de suelo sin enterrar cimientos ni escaleras
          const bboxEscalado = new THREE.Box3().setFromObject(modelo);
          modelo.position.set(0, -bboxEscalado.min.y + 0.04, 0);

          modelo.traverse(o => {
            if (o.isMesh) {
              o.castShadow = true;
              o.receiveShadow = true;
              if (o.material) {
                const mats = Array.isArray(o.material) ? o.material : [o.material];
                mats.forEach(m => {
                  if (m) {
                    m.roughness = Math.min(0.92, Math.max(0.45, m.roughness || 0.7));
                    if (typeof m.metalness === 'number') m.metalness = Math.min(0.25, m.metalness);
                  }
                });
              }
            }
          });
          grupo.add(modelo);

          // Hoguera acogedora ubicada en el frente exterior de la cabaña (sin invadir el interior)
          const profZ = (bboxEscalado.max.z - bboxEscalado.min.z);
          const frenteZ = Math.max(4.4, (profZ / 2) + 2.2);

          const fuegoBase = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.14, 6, 12), matPiedra);
          fuegoBase.rotation.x = Math.PI / 2;
          fuegoBase.position.set(-2.2, 0.08, frenteZ);
          fuegoBase.receiveShadow = true;
          grupo.add(fuegoBase);

          const llama = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.65, 6), new THREE.MeshStandardMaterial({
            color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 1.8
          }));
          llama.position.set(-2.2, 0.40, frenteZ);
          grupo.add(llama);

          const luzFuego = new THREE.PointLight(0xf97316, 1.4, 12, 1.8);
          luzFuego.position.set(-2.2, 0.75, frenteZ);
          grupo.add(luzFuego);

        }, undefined, () => {
          // Si falla o no encuentra el GLB, genera la cabaña procedural como respaldo
          generarCabanaProcedural(grupo, matMadera, matMaderaOscura, matPiedra);
        });
      } else {
        generarCabanaProcedural(grupo, matMadera, matMaderaOscura, matPiedra);
      }
    } else if (lugar.tipo === 'altar') {
      // 3. ALTAR RÚNICO
      // Plataforma cuadrada de piedra
      const losaBase = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.35, 5.2), matPiedra);
      losaBase.position.y = 0.18;
      losaBase.castShadow = true; losaBase.receiveShadow = true;
      grupo.add(losaBase);

      const losaSup = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.3, 3.6), matPiedraClara);
      losaSup.position.y = 0.48;
      grupo.add(losaSup);

      // Mesa de ofrendas central
      const mesa = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 1.2), matPiedra);
      mesa.position.y = 1.05;
      mesa.castShadow = true;
      grupo.add(mesa);

      // Losa rúnica brillante en el centro de la mesa
      const runaPlaca = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.8), matRuna);
      runaPlaca.position.y = 1.52;
      grupo.add(runaPlaca);

      // Cuatro monolitos en las esquinas con runas
      [[-2.0, -2.0], [2.0, -2.0], [-2.0, 2.0], [2.0, 2.0]].forEach(([px, pz]) => {
        const pilar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 2.8, 0.55), matPiedra);
        pilar.position.set(px, 1.55, pz);
        pilar.castShadow = true;
        grupo.add(pilar);

        const runaPilar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.4, 0.58), matRuna);
        runaPilar.position.set(px, 1.6, pz);
        grupo.add(runaPilar);
      });

      const luzAltar = new THREE.PointLight(0x38bdf8, 2.2, 16, 1.4);
      luzAltar.position.y = 2.4;
      grupo.add(luzAltar);

    } else {
      // 4. SANTUARIO DE PIEDRA Y LUZ (Círculo ceremonial de monolitos de estilo Stonehenge)
      const baseCirculo = new THREE.Mesh(new THREE.CylinderGeometry(5.8, 6.2, 0.3, 24), matPiedra);
      baseCirculo.position.y = 0.15;
      baseCirculo.receiveShadow = true;
      grupo.add(baseCirculo);

      // 6 Monolitos en círculo con dintel
      const numPilares = 6;
      for (let i = 0; i < numPilares; i++) {
        const a = (i / numPilares) * Math.PI * 2;
        const px = Math.cos(a) * 4.4, pz = Math.sin(a) * 4.4;
        const col = new THREE.Mesh(new THREE.BoxGeometry(0.7, 3.4, 0.5), matPiedra);
        col.position.set(px, 1.8, pz);
        col.lookAt(0, 1.8, 0);
        col.castShadow = true;
        grupo.add(col);

        // Banda dorada superior
        const dintel = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 0.6), matPiedraClara);
        dintel.position.set(px, 3.65, pz);
        dintel.lookAt(0, 3.65, 0);
        dintel.castShadow = true;
        grupo.add(dintel);
      }

      // Cristales flotantes en el centro
      const gemaCentral = new THREE.Mesh(new THREE.OctahedronGeometry(0.8, 1), matOro);
      gemaCentral.position.y = 2.2;
      grupo.add(gemaCentral);

      const luzSan = new THREE.PointLight(0xf59e0b, 2.4, 22, 1.5);
      luzSan.position.y = 2.5;
      grupo.add(luzSan);
    }

    return grupo;
  }

  function generarCabanaProcedural(grupo, matMadera, matMaderaOscura, matPiedra) {
    const THREE = grupo.constructor.name === 'Group' ? (typeof root !== 'undefined' && root.THREE ? root.THREE : (grupo.parent ? grupo.parent.constructor : null)) : null;
    if (!THREE) return;
    const plataforma = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.4, 5.6), matMaderaOscura);
    plataforma.position.y = 0.2;
    plataforma.castShadow = true; plataforma.receiveShadow = true;
    grupo.add(plataforma);

    const muroP = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.6, 4.8), matMadera);
    muroP.position.y = 1.6;
    muroP.castShadow = true; muroP.receiveShadow = true;
    grupo.add(muroP);

    const puerta = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.0, 0.2), matMaderaOscura);
    puerta.position.set(0, 1.3, 2.45);
    grupo.add(puerta);

    const tejadoGeo = new THREE.ConeGeometry(4.4, 1.8, 4);
    tejadoGeo.rotateY(Math.PI / 4);
    const tejado = new THREE.Mesh(tejadoGeo, matMaderaOscura);
    tejado.position.y = 3.6;
    tejado.scale.set(1.1, 1.0, 0.9);
    tejado.castShadow = true;
    grupo.add(tejado);

    [-2.4, 2.4].forEach(px => {
      const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.4, 8), matMadera);
      poste.position.set(px, 1.4, 3.0);
      poste.castShadow = true;
      grupo.add(poste);
    });
    const aleroPorche = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.2, 1.4), matMaderaOscura);
    aleroPorche.position.set(0, 2.6, 2.7);
    grupo.add(aleroPorche);

    const chimenea = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.8, 0.8), matPiedra);
    chimenea.position.set(2.2, 2.1, -1.6);
    chimenea.castShadow = true;
    grupo.add(chimenea);
  }

  const api = {
    TIPOS_SECRETO,
    CABANAS_GLB,
    generarLugaresSecretos,
    construirModeloSecreto
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LugaresSecretosLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
