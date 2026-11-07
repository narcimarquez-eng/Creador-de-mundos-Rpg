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
    let terrain = null;
    if (world && world.seed !== undefined) {
      if (typeof root !== 'undefined' && root.WorldCore && root.WorldCore.getTerrain) {
        terrain = root.WorldCore.getTerrain(world.seed);
      } else if (typeof require !== 'undefined') {
        try { const WC = require('./world-core.js'); terrain = WC.getTerrain(world.seed); } catch (e) {}
      }
    }

    // Asegurar que los ríos del mundo estén calculados para ubicar correctamente la cabaña marina
    if (world && world.towns) {
      if (typeof root !== 'undefined' && root.WorldCore && root.WorldCore.calcularRios) {
        try { root.WorldCore.calcularRios(world); } catch (e) {}
      } else if (typeof require !== 'undefined') {
        try { const WC = require('./world-core.js'); WC.calcularRios(world); } catch (e) {}
      }
    }

    CABANAS_GLB.forEach((cabDef, idx) => {
      const pRef = (cabDef.puebloIdx === 0) ? pInicio : pSegundo;

      // Zonas de combate cercanas al pueblo de referencia
      const zonasCercanas = listaZonas.slice().sort((a, b) => {
        const da = Math.hypot(a.x - pRef.x, (a.y !== undefined ? a.y : a.z) - pRef.y);
        const db = Math.hypot(b.x - pRef.x, (b.y !== undefined ? b.y : b.z) - pRef.y);
        return da - db;
      });

      let zonaElegida = null;
      if (cabDef.esMar) {
        // Cabaña 3: orientada hacia el agua/mar o ribera más próxima al primer pueblo
        zonaElegida = zonasCercanas.slice(0, 4).sort((a, b) => {
          const nomA = (a.name || '').toLowerCase();
          const nomB = (b.name || '').toLowerCase();
          const esAguaA = nomA.includes('costa') || nomA.includes('mar') || nomA.includes('bahía') || nomA.includes('río') || nomA.includes('lago');
          const esAguaB = nomB.includes('costa') || nomB.includes('mar') || nomB.includes('bahía') || nomB.includes('río') || nomB.includes('lago');
          return (esAguaB ? 1 : 0) - (esAguaA ? 1 : 0);
        })[0] || zonasCercanas[0];
      } else {
        const subIdx = (cabDef.puebloIdx === 0) ? idx : (idx - 3);
        zonaElegida = zonasCercanas[subIdx % Math.min(3, zonasCercanas.length)] || zonasCercanas[0];
      }

      // Búsqueda preferente de una zona llana para la cabaña (menor pendiente/desnivel)
      let mejorCand = null;
      let menorDesnivel = Infinity;

      if (cabDef.esMar) {
        // Cabaña 3 (pescador): situar en ríos existentes o mar/costa natural sin crear huecos artificiales
        const waterCands = [];
        pueblos.forEach(p => {
          if (p.cfg && p.cfg.rio && Array.isArray(p.cfg.rio.pts)) {
            const rot = (p.cfg.rotation || 0) * Math.PI / 180, cr = Math.cos(rot), sr = Math.sin(rot);
            p.cfg.rio.pts.forEach(pt => {
              const wx = p.x + pt.x * cr - pt.z * sr;
              const wz = p.y + pt.x * sr + pt.z * cr;
              const dP = Math.hypot(wx - p.x, wz - p.y);
              const dRef = Math.hypot(wx - pRef.x, wz - pRef.y);
              if (dP >= 142 && dP <= 350) {
                waterCands.push({ x: wx, z: wz, score: dRef });
              }
            });
          }
        });
        if (terrain && typeof terrain.elevation === 'function') {
          const SEA_L = (world && typeof world.SEA_LEVEL === 'number') ? world.SEA_LEVEL : 0.36;
          for (let cI = 0; cI < 36; cI++) {
            const ang = (cI / 36) * Math.PI * 2;
            for (let rD = 142; rD <= 350; rD += 35) {
              const cx = pRef.x + Math.cos(ang) * rD;
              const cz = pRef.y + Math.sin(ang) * rD;
              const e = terrain.elevation(cx, cz);
              if (e <= SEA_L + 0.012) {
                const cercaP = pueblos.some(p => Math.hypot(cx - p.x, cz - p.y) < 140);
                if (!cercaP) waterCands.push({ x: cx, z: cz, score: Math.abs(e - SEA_L) * 120 + rD * 0.15 });
              }
            }
          }
        }
        if (waterCands.length > 0) {
          waterCands.sort((a, b) => a.score - b.score);
          mejorCand = { x: waterCands[0].x, z: waterCands[0].z };
        }
      }

      if (!mejorCand) {
        const numCandidatos = 20;
        for (let cI = 0; cI < numCandidatos; cI++) {
          const angVar = (idx * 1.25) + (cI / numCandidatos) * Math.PI * 2;
          const dCand = 150 + ((cI * 9 + Math.floor(rnd() * 25)) % 55);
          let candX = pRef.x + Math.cos(angVar) * dCand;
          let candZ = pRef.y + Math.sin(angVar) * dCand;

          // Comprobar distancia a pueblos (mínimo 135m y máximo 270m)
          const cercaPueblo = pueblos.some(p => Math.hypot(candX - p.x, candZ - p.y) < 135);
          if (cercaPueblo) continue;

          // Separación con otras cabañas ya ubicadas (mínimo 45m)
          const cercaOtra = lugares.some(l => Math.hypot(candX - l.x, candZ - l.z) < 45);
          if (cercaOtra) continue;

          let desnivel = 0;
          if (terrain && typeof terrain.elevation === 'function') {
            const eCenter = terrain.elevation(candX, candZ);
            if (eCenter < 0.28) continue;

            // Medir desnivel en radio de 10m
            const eN = terrain.elevation(candX, candZ - 10);
            const eS = terrain.elevation(candX, candZ + 10);
            const eE = terrain.elevation(candX + 10, candZ);
            const eO = terrain.elevation(candX - 10, candZ);
            desnivel = (Math.max(eCenter, eN, eS, eE, eO) - Math.min(eCenter, eN, eS, eE, eO)) * 420;
          }

          // Si hay zona de combate asignada, orientación suave
          if (zonaElegida) {
            const zy = (zonaElegida.y !== undefined ? zonaElegida.y : zonaElegida.z);
            const dZona = Math.hypot(candX - zonaElegida.x, candZ - zy);
            desnivel += (dZona * 0.03);
          }

          if (desnivel < menorDesnivel) {
            menorDesnivel = desnivel;
            mejorCand = { x: candX, z: candZ };
          }
        }
      }

      // Si no encontró candidato por restricciones extremas, usar posición base periférica
      let cx = mejorCand ? mejorCand.x : (pRef.x + Math.cos(idx * 1.28 + rnd() * 0.35) * (150 + rnd() * 55));
      let cz = mejorCand ? mejorCand.z : (pRef.y + Math.sin(idx * 1.28 + rnd() * 0.35) * (150 + rnd() * 55));

      // Garantizar que no esté dentro de la plaza ni invada muros (distancia mínima de 136m)
      pueblos.forEach(p => {
        const dP = Math.hypot(cx - p.x, cz - p.y);
        if (dP < 136) {
          const dirP = Math.atan2(cz - p.y, cx - p.x);
          cx = p.x + Math.cos(dirP) * 145;
          cz = p.y + Math.sin(dirP) * 145;
        }
      });

      // Especie de monstruo para la misión de 100
      const monstruosZona = (zonaElegida && zonaElegida.monsters && zonaElegida.monsters.length) ? zonaElegida.monsters : [{ name: 'Criatura Salvaje', level: 2 }];
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
        zonaAsignada: zonaElegida ? zonaElegida.id : null,
        x: Math.round(cx * 10) / 10,
        z: Math.round(cz * 10) / 10,
        radio: 28,
        radioPlano: 14.5,
        radioRebaje: 26.0,
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
          objetivoEspecie: especieMonstruo, // Alias compatible
          nivelMonstruo: lvlMonstruo,
          zonaId: zonaElegida ? zonaElegida.id : ('zona-' + idx),
          zonaNombre: zonaElegida ? (zonaElegida.name || 'Tierras de Caza') : 'Tierras Salvajes',
          cantidad: 100,
          objetivoCantidad: 100, // Alias compatible
          progreso: 0,
          entregada: false,
          cumplida: false, // Alias compatible
          completada: false,
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

  const _cabanaGlbCache = new Map();

  function clonarModeloCabanaLimpio(THREE, escenaLimpia) {
    const clon = (escenaLimpia && typeof escenaLimpia.clone === 'function') ? escenaLimpia.clone(true) : escenaLimpia;
    if (clon && typeof clon.traverse === 'function') {
      clon.traverse(o => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
    }
    return clon;
  }

  // Geometría 3D procedimental para cada tipo de lugar secreto con Three.js
  function construirModeloSecreto(THREE, lugar, getAlturaFn, opciones) {
    const sinLuces = !!(opciones && opciones.sinLucesPuntuales);
    const grupo = new THREE.Group();
    grupo.name = 'LugarSecreto_' + lugar.id;
    const ySuelo = getAlturaFn ? getAlturaFn(lugar.x, lugar.z) : 0;
    grupo.position.set(lugar.x, ySuelo, lugar.z);
    grupo.rotation.y = lugar.rotacion || 0;
    grupo.userData = {
      lugarId: lugar.id,
      tipo: lugar.tipo,
      x: lugar.x,
      y: ySuelo,
      z: lugar.z,
      rotacion: lugar.rotacion || 0,
      radioSombra: lugar.tipo === 'cabana' ? 30 : 12,
      lugarRef: lugar
    };

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

      // Luz puntual tenue (o metadato para luz compartida del supramundo sin recompilar shaders)
      grupo.userData.luzLocal = { x: 0, y: 3.2, z: 0, color: 0x38bdf8, intensity: 1.8, distance: 18 };
      if (!sinLuces) {
        const luz = new THREE.PointLight(0x38bdf8, 1.8, 18, 1.6);
        luz.position.y = 3.2;
        grupo.add(luz);
      }

    } else if (lugar.tipo === 'cabana') {
      // 2. CABAÑAS: Modelos GLB dedicados a ras de suelo y arquitectura arquitectónica proporcionada
      if (lugar.modeloGLB && typeof THREE.GLTFLoader !== 'undefined') {
        const montarCabanaLimpia = (entradaCache, usarClon) => {
          const modelo = usarClon ? clonarModeloCabanaLimpio(THREE, entradaCache.escena) : entradaCache.escena;
          const anchoX = entradaCache.anchoX;
          const profZ = entradaCache.profZ;
          grupo.add(modelo);

          if (!lugar.esMar) {
            // 4. Zócalo de piedra rústica robusto para asentar la cabaña y absorber desniveles en pendiente
            const altoZocalo = 6.0;
            const zocalo = new THREE.Mesh(
              new THREE.BoxGeometry(anchoX * 1.06, altoZocalo, profZ * 1.06),
              matPiedra
            );
            // Sobresale 0.20m en la cota superior y se entierra 5.8m en el terreno
            zocalo.position.set(0, -altoZocalo / 2 + 0.20, 0);
            zocalo.castShadow = true;
            zocalo.receiveShadow = true;
            grupo.add(zocalo);

            // Escalón de acceso al frente de la cabaña
            const frenteZ = (profZ / 2) + 0.8;
            const escalonEntrada = new THREE.Mesh(
              new THREE.BoxGeometry(5.6, 0.30, 2.0),
              matPiedraClara
            );
            escalonEntrada.position.set(0, 0.10, frenteZ);
            escalonEntrada.castShadow = true;
            escalonEntrada.receiveShadow = true;
            grupo.add(escalonEntrada);

            // Hoguera acogedora exterior en la explanada de la terraza
            const hogueraZ = frenteZ + 3.8;
            const fuegoBase = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.20, 6, 12), matPiedra);
            fuegoBase.rotation.x = Math.PI / 2;
            fuegoBase.position.set(-4.8, 0.08, hogueraZ);
            fuegoBase.receiveShadow = true;
            grupo.add(fuegoBase);

            const llama = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.1, 6), new THREE.MeshStandardMaterial({
              color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 2.2
            }));
            llama.position.set(-4.8, 0.65, hogueraZ);
            grupo.add(llama);

            grupo.userData.luzLocal = { x: -4.8, y: 1.2, z: hogueraZ, color: 0xf97316, intensity: 2.2, distance: 22 };
            if (!sinLuces) {
              const luzFuego = new THREE.PointLight(0xf97316, 2.2, 22, 1.8);
              luzFuego.position.set(-4.8, 1.2, hogueraZ);
              grupo.add(luzFuego);
            }
          } else {
            // Cabaña marina / lacustre en el agua sobre pilotes de madera hacia el fondo del río o mar
            const altoPilotes = 4.5;
            const geoPilote = new THREE.CylinderGeometry(0.25, 0.30, altoPilotes, 8);
            const esquinas = [
              [-anchoX * 0.45, -profZ * 0.45],
              [anchoX * 0.45, -profZ * 0.45],
              [-anchoX * 0.45, profZ * 0.45],
              [anchoX * 0.45, profZ * 0.45],
              [0, profZ * 0.45 + 2.0]
            ];
            esquinas.forEach(([px, pz]) => {
              const p = new THREE.Mesh(geoPilote, matMaderaOscura);
              p.position.set(px, -altoPilotes / 2 + 0.15, pz);
              p.castShadow = true;
              grupo.add(p);
            });
          }
        };

        if (_cabanaGlbCache.has(lugar.modeloGLB)) {
          montarCabanaLimpia(_cabanaGlbCache.get(lugar.modeloGLB), true);
        } else {
          // Carga asíncrona del modelo GLB con dimensionado arquitectónico óptimo y apoyo exacto en el suelo
          const loader = new THREE.GLTFLoader();
          loader.load(lugar.modeloGLB, gltf => {
            const modelo = gltf.scene;

            // 1. Eliminar cualquier terreno, suelo plano exterior, camino, agua o árboles incluidos dentro del archivo GLB
            const nodosTerreno = [];
            modelo.traverse(o => {
              const nm = (o.name || '').toLowerCase();
              const esMuroOTecho = nm.includes('muro') || nm.includes('techo') || nm.includes('fronton') ||
                                   nm.includes('cristal') || nm.includes('marco') || nm.includes('puerta') ||
                                   nm.includes('cumbrera') || nm.includes('porche') || nm.includes('chimenea') ||
                                   nm.includes('mesa') || nm.includes('silla') || nm.includes('cama') ||
                                   nm.includes('cofre') || nm.includes('barril') || nm.includes('farol') ||
                                   nm.includes('poste') || nm.includes('escalon') || nm.includes('hogar') ||
                                   nm.includes('fuego') || nm.includes('dintel') || nm.includes('entramado') ||
                                   nm.includes('tejado') || nm.includes('colchon') || nm.includes('almohada') ||
                                   nm.includes('manta') || nm.includes('cajon') || nm.includes('barca') ||
                                   nm.includes('asiento') || nm.includes('muelle') || nm.includes('pilote');

              if (!esMuroOTecho) {
                if (nm.includes('hierba') || nm.includes('camino') || nm.includes('suelo') ||
                    nm.includes('agua') || nm.includes('grass') || nm.includes('ground') ||
                    nm.includes('terrain') || nm.includes('water') || nm.includes('arbol') ||
                    nm.includes('tree') || nm.includes('tronco') || nm.includes('copa') ||
                    nm.includes('plane') || nm.includes('floor')) {
                  if (nm !== 'suelopb' && nm !== 'suelopa' && nm !== 'torresuelo') {
                    nodosTerreno.push(o);
                  }
                }
              }
            });

            // Detectar además mallas que sean planos horizontales de suelo exterior sin nombre
            modelo.traverse(o => {
              if (o.isMesh && o.geometry && !nodosTerreno.includes(o)) {
                if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
                const bb = o.geometry.boundingBox;
                if (bb) {
                  const dy = bb.max.y - bb.min.y;
                  const dx = bb.max.x - bb.min.x;
                  const dz = bb.max.z - bb.min.z;
                  if (dy < 0.45 && (dx > 8.0 || dz > 8.0)) {
                    const nm = (o.name || '').toLowerCase();
                    if (nm !== 'suelopb' && nm !== 'suelopa' && nm !== 'torresuelo') {
                      nodosTerreno.push(o);
                    }
                  }
                }
              }
            });

            nodosTerreno.forEach(o => {
              if (o.parent) o.parent.remove(o);
              o.visible = false;
              if (o.geometry) {
                try { o.geometry.dispose(); } catch (e) {}
              }
            });

            // 2. Calcular el bounding box de la estructura real del edificio limpio
            const bboxEdificio = new THREE.Box3().setFromObject(modelo);
            const sizeEdificio = new THREE.Vector3();
            bboxEdificio.getSize(sizeEdificio);
            const maxHoriz = Math.max(sizeEdificio.x, sizeEdificio.z, 0.1);

            // Escala real proporcionada para un ancho de 27.5 metros reales (+30% adicional para gran presencia)
            const escala = 27.5 / maxHoriz;
            modelo.scale.setScalar(escala);

            // 3. Centrar el edificio y apoyar la base sobre la solera de piedra
            const bboxEscalado = new THREE.Box3().setFromObject(modelo);
            const anchoX = Math.max(19.0, bboxEscalado.max.x - bboxEscalado.min.x);
            const profZ = Math.max(16.0, bboxEscalado.max.z - bboxEscalado.min.z);
            const centroX = (bboxEscalado.max.x + bboxEscalado.min.x) / 2;
            const centroZ = (bboxEscalado.max.z + bboxEscalado.min.z) / 2;

            modelo.position.set(-centroX, -bboxEscalado.min.y + 0.20, -centroZ);

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

            const entradaCache = { escena: modelo, anchoX, profZ };
            if (modelo && typeof modelo.clone === 'function') {
              _cabanaGlbCache.set(lugar.modeloGLB, { escena: modelo.clone(true), anchoX, profZ });
            }
            montarCabanaLimpia(entradaCache, false);
          }, undefined, () => {
            // Si falla o no encuentra el GLB, genera la cabaña procedural como respaldo
            generarCabanaProcedural(THREE, grupo, matMadera, matMaderaOscura, matPiedra);
          });
        }
      } else {
        generarCabanaProcedural(THREE, grupo, matMadera, matMaderaOscura, matPiedra);
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

      // Cuatro monolitos en las esquinas con runas (geometrías compartidas)
      const geoPilarAltar = new THREE.BoxGeometry(0.55, 2.8, 0.55);
      const geoRunaPilar = new THREE.BoxGeometry(0.3, 1.4, 0.58);
      [[-2.0, -2.0], [2.0, -2.0], [-2.0, 2.0], [2.0, 2.0]].forEach(([px, pz]) => {
        const pilar = new THREE.Mesh(geoPilarAltar, matPiedra);
        pilar.position.set(px, 1.55, pz);
        pilar.castShadow = true;
        grupo.add(pilar);

        const runaPilar = new THREE.Mesh(geoRunaPilar, matRuna);
        runaPilar.position.set(px, 1.6, pz);
        grupo.add(runaPilar);
      });

      grupo.userData.luzLocal = { x: 0, y: 2.4, z: 0, color: 0x38bdf8, intensity: 2.2, distance: 16 };
      if (!sinLuces) {
        const luzAltar = new THREE.PointLight(0x38bdf8, 2.2, 16, 1.4);
        luzAltar.position.y = 2.4;
        grupo.add(luzAltar);
      }

    } else {
      // 4. SANTUARIO DE PIEDRA Y LUZ (Círculo ceremonial de monolitos de estilo Stonehenge)
      const baseCirculo = new THREE.Mesh(new THREE.CylinderGeometry(5.8, 6.2, 0.3, 24), matPiedra);
      baseCirculo.position.y = 0.15;
      baseCirculo.receiveShadow = true;
      grupo.add(baseCirculo);

      // 6 Monolitos en círculo con dintel (geometrías compartidas)
      const numPilares = 6;
      const geoColSan = new THREE.BoxGeometry(0.7, 3.4, 0.5);
      const geoDintelSan = new THREE.BoxGeometry(1.6, 0.35, 0.6);
      for (let i = 0; i < numPilares; i++) {
        const a = (i / numPilares) * Math.PI * 2;
        const px = Math.cos(a) * 4.4, pz = Math.sin(a) * 4.4;
        const col = new THREE.Mesh(geoColSan, matPiedra);
        col.position.set(px, 1.8, pz);
        col.lookAt(0, 1.8, 0);
        col.castShadow = true;
        grupo.add(col);

        // Banda dorada superior
        const dintel = new THREE.Mesh(geoDintelSan, matPiedraClara);
        dintel.position.set(px, 3.65, pz);
        dintel.lookAt(0, 3.65, 0);
        dintel.castShadow = true;
        grupo.add(dintel);
      }

      // Cristales flotantes en el centro
      const gemaCentral = new THREE.Mesh(new THREE.OctahedronGeometry(0.8, 1), matOro);
      gemaCentral.position.y = 2.2;
      grupo.add(gemaCentral);

      grupo.userData.luzLocal = { x: 0, y: 2.5, z: 0, color: 0xf59e0b, intensity: 2.4, distance: 22 };
      if (!sinLuces) {
        const luzSan = new THREE.PointLight(0xf59e0b, 2.4, 22, 1.5);
        luzSan.position.y = 2.5;
        grupo.add(luzSan);
      }
    }

    return grupo;
  }

  function generarCabanaProcedural(THREE, grupo, matMadera, matMaderaOscura, matPiedra) {
    if (!THREE) {
      THREE = grupo && grupo.constructor && grupo.constructor.name === 'Group' ? (typeof root !== 'undefined' && root.THREE ? root.THREE : null) : null;
    }
    if (!THREE) return;
    // SIN SUELO ARTIFICIAL: La cabaña descansa directamente sobre el terreno nivelado

    // Muros amplios de madera rústica (+30%: 15.6m ancho x 7.0m alto x 12.8m profundidad)
    const ancho = 15.6, alto = 7.0, prof = 12.8;
    const muroP = new THREE.Mesh(new THREE.BoxGeometry(ancho, alto, prof), matMadera);
    muroP.position.y = alto / 2;
    muroP.castShadow = true; muroP.receiveShadow = true;
    grupo.add(muroP);

    // Puerta robusta de madera
    const puerta = new THREE.Mesh(new THREE.BoxGeometry(2.6, 4.4, 0.3), matMaderaOscura);
    puerta.position.set(0, 2.2, (prof / 2) + 0.1);
    grupo.add(puerta);

    // Tejado a dos aguas piramidal
    const tejadoGeo = new THREE.ConeGeometry(ancho * 0.72, 4.8, 4);
    if (tejadoGeo.rotateY) tejadoGeo.rotateY(Math.PI / 4);
    const tejado = new THREE.Mesh(tejadoGeo, matMaderaOscura);
    tejado.position.y = alto + 2.4;
    if (tejado.scale && tejado.scale.set) tejado.scale.set(1.15, 1.0, 0.95);
    tejado.castShadow = true;
    grupo.add(tejado);

    // Postes del porche
    [-6.2, 6.2].forEach(px => {
      const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 6.5, 8), matMadera);
      poste.position.set(px, 3.25, (prof / 2) + 1.8);
      poste.castShadow = true;
      grupo.add(poste);
    });
    const aleroPorche = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.40, 3.6), matMaderaOscura);
    aleroPorche.position.set(0, 6.5, (prof / 2) + 1.2);
    grupo.add(aleroPorche);

    // Zócalo de piedra rústica para absorción de desniveles
    const zocaloProc = new THREE.Mesh(new THREE.BoxGeometry(ancho * 1.05, 3.6, prof * 1.05), matPiedra);
    zocaloProc.position.set(0, -1.65, 0);
    zocaloProc.castShadow = true; zocaloProc.receiveShadow = true;
    grupo.add(zocaloProc);

    // Chimenea de piedra
    const chimenea = new THREE.Mesh(new THREE.BoxGeometry(2.0, 9.8, 2.0), matPiedra);
    chimenea.position.set(6.0, 5.2, -3.6);
    chimenea.castShadow = true;
    grupo.add(chimenea);
  }

  // Hondonada y aplanado topográfico para cabañas en pendiente
  function aplicarRebajeCabanas(lugares, x, z, hActual, getElevationFn) {
    if (!lugares || !lugares.length) return hActual;
    let hMod = hActual;
    for (let i = 0; i < lugares.length; i++) {
      const s = lugares[i];
      if (s.tipo !== 'cabana') continue;
      // La cabaña en el agua / marina se sitúa en masa de agua natural y no excava el relieve
      if (s.esMar) continue;

      const d = Math.hypot(x - s.x, z - s.z);
      const rPlano = s.radioPlano || 14.5;
      const rTotal = s.radioRebaje || 26.0;
      if (d >= rTotal) continue;

      let hBase = s.alturaBase;
      if (typeof hBase !== 'number') {
        hBase = (typeof getElevationFn === 'function') ? getElevationFn(s.x, s.z) : (typeof s.y === 'number' ? s.y : hActual);
      }
      const hHondonada = hBase;

      // Desmonte en ladera: solo se rebaja el terreno que queda POR ENCIMA de la explanada (hActual > hHondonada).
      // Si el terreno ya es inferior (ladera abajo), no se levanta, evitando el efecto de "peñón" o promontorio abrupto.
      if (hActual > hHondonada) {
        const t = Math.max(0, Math.min(1, (d - rPlano) / (rTotal - rPlano)));
        const w = 1 - (t * t * (3 - 2 * t));
        if (w > 0) {
          hMod = hMod + (hHondonada - hMod) * w;
        }
      }
    }
    return hMod;
  }

  const api = {
    TIPOS_SECRETO,
    CABANAS_GLB,
    generarLugaresSecretos,
    construirModeloSecreto,
    aplicarRebajeCabanas
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LugaresSecretosLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
