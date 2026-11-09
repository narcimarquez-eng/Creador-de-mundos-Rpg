/*
 * relieve-zona.js — Sistema de relieve especial y culminaciones para zonas de caza.
 * Permite modelar zonas con caminos rocosos, desfiladeros, laberintos y recovecos
 * que guían al jugador hasta una culminación (oasis, jefe especial, objeto de misión o santuario).
 * Compatible con Node.js (tests) y navegador (window.RelieveZonaLib).
 */
(function (root) {
  'use strict';

  const clamp01 = v => Math.max(0, Math.min(1, v));
  const smooth = (a, b, x) => {
    if (a >= b) return x >= b ? 1 : 0;
    const t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  };

  const TIPOS = {
    desfiladero: {
      id: 'desfiladero',
      nombre: 'Desfiladero (Cañón)',
      icono: '⛰️',
      desc: 'Paredes escarpadas de roca con cañones sinuosos que descienden hacia el centro.'
    },
    laberinto: {
      id: 'laberinto',
      nombre: 'Laberinto de Rocas',
      icono: '🌀',
      desc: 'Corredores rocosos intrincados con múltiples recovecos y bifurcaciones.'
    },
    crater: {
      id: 'crater',
      nombre: 'Cráter Hundido',
      icono: '🌋',
      desc: 'Caldera hundida con terrazas y rampas circulares en espiral hacia el fondo.'
    },
    meseta: {
      id: 'meseta',
      nombre: 'Meseta Escalonada',
      icono: '🗻',
      desc: 'Elevación escalonada con rampas rocosas que ascienden a la cumbre.'
    },
    barranco: {
      id: 'barranco',
      nombre: 'Barranco con Recovecos',
      icono: '⚡',
      desc: 'Profunda hendidura con recodos, ensenadas y contrafuertes de piedra.'
    }
  };

  const CULMINACIONES = {
    oasis: {
      id: 'oasis',
      nombre: 'Oasis Escondido',
      icono: '🌴',
      badge: '🌴',
      desc: 'Manantial de aguas cristalinas rodeado de palmeras, vegetación y remanso.'
    },
    jefe: {
      id: 'jefe',
      nombre: 'Arena de Jefe Especial',
      icono: '💀',
      badge: '💀',
      desc: 'Plataforma ceremonial con pebeteros ardiendo y un jefe supremo aguardando.'
    },
    objeto_mision: {
      id: 'objeto_mision',
      nombre: 'Objeto de Misión (Reliquia)',
      icono: '🔮',
      badge: '🔮',
      desc: 'Pedestal ancestral de piedra con una reliquia mística flotante interactuable.'
    },
    santuario: {
      id: 'santuario',
      nombre: 'Santuario Rúnico',
      icono: '🏛️',
      badge: '🏛️',
      desc: 'Círculo de monolitos rúnicos antiguos que bendice y restaura al héroe.'
    },
    ninguno: {
      id: 'ninguno',
      nombre: 'Ninguno (Mirador)',
      icono: '🏔️',
      badge: '🏔️',
      desc: 'Explanada rocosa abierta con vistas panorámicas.'
    }
  };

  function relievePorDefecto(tipo, culminacion) {
    return {
      activo: true,
      tipo: tipo || 'desfiladero',
      culminacion: culminacion || 'oasis',
      profundidad: 18,
      recovecos: 3,
      anchoCamino: 10,
      aspereza: 0.7
    };
  }

  function zonaTieneRelieve(z) {
    return !!(z && z.relieve && z.relieve.activo);
  }

  /**
   * Evalúa la geometría del relieve para una zona y punto (x, z).
   * Retorna información sobre si está dentro, distancia al centro, factor de camino (0=pared, 1=camino),
   * si está en la explanada central (clearing) y el delta de altura sobre el terreno base.
   */
  function evaluarPunto(z, x, zWorld) {
    if (!zonaTieneRelieve(z)) return null;

    const dx = x - z.x;
    const dz = zWorld - z.y;
    const dist = Math.hypot(dx, dz);
    const R = z.radius || 120;
    const margenExterior = 12;

    if (dist > R + margenExterior) return null;

    const r = z.relieve || {};
    const tipo = r.tipo || 'desfiladero';
    const profundidad = typeof r.profundidad === 'number' ? r.profundidad : 18;
    const numRecovecos = Math.max(1, Math.min(6, r.recovecos || 3));
    const anchoCamino = Math.max(5, Math.min(25, r.anchoCamino || 10));
    const aspereza = typeof r.aspereza === 'number' ? r.aspereza : 0.7;

    // Radio de la explanada/arena central donde se ubica la culminación
    const rc = Math.max(14, Math.min(26, R * 0.16));

    // Mezcla suave en el borde exterior de la zona
    const wEdge = 1 - smooth(R - 12, R + margenExterior, dist);
    if (wEdge <= 0) return null;

    // Ángulo polar respecto al centro de la zona
    const ang = Math.atan2(dz, dx);

    // Si está dentro de la explanada central
    if (dist <= rc) {
      const tClearing = dist / rc;
      let deltaHClearing = 0;
      if (tipo === 'crater') {
        deltaHClearing = -profundidad * 0.55;
      } else if (tipo === 'meseta') {
        deltaHClearing = profundidad * 0.55;
      } else if (tipo === 'barranco') {
        deltaHClearing = -profundidad * 0.35;
      } else {
        deltaHClearing = -profundidad * 0.12;
      }

      return {
        inside: true,
        dist,
        rc,
        R,
        wEdge,
        esClearing: true,
        factorCamino: 1.0,
        factorPared: 0.0,
        deltaH: deltaHClearing * wEdge,
        tipo,
        culminacion: r.culminacion || 'oasis',
        relieve: r,
        zona: z
      };
    }

    // Fuera de la explanada: red de caminos, desfiladeros y recovecos
    // 1. Espiral principal de entrada que conecta la periferia con el centro
    const espiral = Math.sin(ang * numRecovecos + (dist - rc) * 0.08);

    // 2. Canales secundarios y recovecos ramificados
    const ramas = Math.cos(ang * (numRecovecos + 1.2) - (dist - rc) * 0.11 + 1.1);

    // 3. Modulación de aspereza rocosa
    const ruido = (Math.sin(x * 0.22 + zWorld * 0.17) + Math.cos(x * 0.13 - zWorld * 0.27)) * 0.5 * aspereza;

    // Función de distancia al centro de un corredor
    const dCorredor1 = Math.abs(espiral);
    const dCorredor2 = Math.abs(ramas);
    const dPaso = Math.min(dCorredor1, dCorredor2 * 1.25) + ruido * 0.12;

    // Ancho relativo del camino
    const umbralCamino = Math.min(0.65, 0.22 + (anchoCamino / R) * 1.8);
    const factorCamino = 1 - smooth(umbralCamino * 0.6, umbralCamino * 1.4, dPaso);
    const factorPared = 1 - factorCamino;

    let deltaH = 0;
    if (tipo === 'desfiladero') {
      // Las paredes rocosas ascienden verticalmente a los lados, el camino se mantiene transitable
      deltaH = factorPared * profundidad + (ruido * 2.2 * factorPared);
    } else if (tipo === 'laberinto') {
      // Paredes de roca escarpada con recovecos que suben y bajan
      const escalon = Math.sin(dist * 0.18) * 0.3;
      deltaH = factorPared * (profundidad * 0.85 + escalon * 3) + ruido * 1.8 * factorPared;
    } else if (tipo === 'crater') {
      // Caldera hundida con paredes perimetrales altas y fondo descendente
      const profBase = ((dist - rc) / (R - rc)) * profundidad * 0.6 - profundidad * 0.55;
      deltaH = profBase + factorPared * (profundidad * 0.7) + ruido * 2.0;
    } else if (tipo === 'meseta') {
      // Meseta elevada con camino en rampa escalonada
      const elevBase = (1 - (dist - rc) / (R - rc)) * profundidad * 0.55;
      deltaH = elevBase - factorPared * (profundidad * 0.4) + ruido * 2.0;
    } else if (tipo === 'barranco') {
      // El suelo del camino se hunde en una grieta rocosa, las paredes laterales se mantienen altas
      deltaH = -factorCamino * profundidad * 0.45 + factorPared * (profundidad * 0.55) + ruido * 2.5;
    }

    return {
      inside: true,
      dist,
      rc,
      R,
      wEdge,
      esClearing: false,
      factorCamino,
      factorPared,
      deltaH: deltaH * wEdge,
      tipo,
      culminacion: r.culminacion || 'oasis',
      relieve: r,
      zona: z
    };
  }

  /**
   * Modifica la altura del terreno hBase sumando el relieve especial de las zonas activas.
   */
  function aplicarRelieve(zonas, x, zWorld, hBase) {
    if (!zonas || !zonas.length) return hBase;
    let h = hBase;
    for (let i = 0; i < zonas.length; i++) {
      const z = zonas[i];
      if (!zonaTieneRelieve(z)) continue;
      const ev = evaluarPunto(z, x, zWorld);
      if (ev) {
        h += ev.deltaH;
      }
    }
    return h;
  }

  /**
   * Obtiene la zona con relieve activo que contenga (x, zWorld), si existe.
   */
  function obtenerRelieveZona(zonas, x, zWorld) {
    if (!zonas || !zonas.length) return null;
    for (let i = 0; i < zonas.length; i++) {
      const z = zonas[i];
      if (!zonaTieneRelieve(z)) continue;
      const ev = evaluarPunto(z, x, zWorld);
      if (ev) return ev;
    }
    return null;
  }

  /**
   * Determina si un punto es camino transitable dentro de la zona (1 = camino plano, 0 = riscos/pared).
   */
  function esCamino(z, x, zWorld) {
    const ev = evaluarPunto(z, x, zWorld);
    return ev ? ev.factorCamino : 1.0;
  }

  /**
   * Calcula los pesos de splatting [hierba, tierra, roca, arena] y nieve para zonas con relieve.
   * Evita texturas lisas en estas zonas: caminos de grava/tierra batida y paredes de roca rugosa.
   */
  function splatZona(ev, x, zWorld, steep, h, splatBase) {
    if (!ev) return splatBase;
    const { factorCamino, esClearing, culminacion, wEdge } = ev;

    let g = 0, d = 0, r = 0, s = 0, n = 0;

    if (esClearing) {
      // Explanada central según la culminación
      if (culminacion === 'oasis') {
        s = 0.55; g = 0.25; d = 0.20; // arena de orilla y vegetación fresca
      } else if (culminacion === 'jefe') {
        r = 0.65; d = 0.35; // roca oscura quemada y arena de batalla
      } else if (culminacion === 'objeto_mision') {
        r = 0.60; d = 0.30; g = 0.10; // losas antiguas desgastadas
      } else if (culminacion === 'santuario') {
        r = 0.70; d = 0.20; g = 0.10; // círculos sagrados de piedra
      } else {
        r = 0.50; d = 0.40; g = 0.10;
      }
    } else {
      // En los caminos y recovecos:
      if (factorCamino > 0.45) {
        // Suelo del camino transitable: grava, tierra prensada y roca triturada
        d = 0.55; r = 0.35; s = 0.10;
      } else {
        // Paredes del desfiladero/laberinto: roca escarpada dominante
        r = 0.92; d = 0.08;
      }
    }

    // Pendientes abruptas siempre acentúan roca
    const rockSteep = smooth(0.3, 0.65, steep || 0);
    r = Math.max(r, rockSteep);
    const k = 1 - rockSteep;
    g *= k; d *= k; s *= k;

    // Normalizar
    const sum = g + d + r + s || 1;
    const splatCalculado = [g / sum, d / sum, r / sum, s / sum];

    // Mezcla suave con el splat base según wEdge
    if (splatBase && splatBase.splat) {
      const bSpl = splatBase.splat;
      const w = wEdge;
      const invW = 1 - w;
      return {
        splat: [
          splatCalculado[0] * w + bSpl[0] * invW,
          splatCalculado[1] * w + bSpl[1] * invW,
          splatCalculado[2] * w + bSpl[2] * invW,
          splatCalculado[3] * w + bSpl[3] * invW
        ],
        snow: (splatBase.snow || 0) * invW
      };
    }

    return { splat: splatCalculado, snow: 0 };
  }

  /**
   * Construye el grupo 3D de la culminación (pedestal místico, monolitos del santuario, pebeteros de arena, etc.).
   */
  function crearDecoradoCulminacion(THREE, zona, Hgen) {
    if (!zonaTieneRelieve(zona)) return null;
    const r = zona.relieve || {};
    const culm = r.culminacion || 'oasis';
    if (culm === 'ninguno') return null;

    const zx = zona.x;
    const zz = zona.y;
    const yh = Hgen ? Hgen(zx, zz) : 0;
    const grupo = new THREE.Group();
    grupo.position.set(zx, yh, zz);
    grupo.userData.culminacionTipo = culm;
    grupo.userData.zonaId = zona.id;
    grupo.userData.zonaNombre = zona.name;

    // Materiales comunes
    const matRoca = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.85,
      metalness: 0.1
    });
    const matRocaOscura = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
      metalness: 0.15
    });
    const matOro = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.35,
      metalness: 0.8
    });

    if (culm === 'objeto_mision') {
      // 🔮 Pedestal ancestral tallado con reliquia mística flotante interactuable
      const baseGeo = new THREE.CylinderGeometry(2.4, 2.8, 0.7, 8);
      const baseMesh = new THREE.Mesh(baseGeo, matRocaOscura);
      baseMesh.position.y = 0.35;
      baseMesh.receiveShadow = true;
      baseMesh.castShadow = true;
      grupo.add(baseMesh);

      const fusteGeo = new THREE.CylinderGeometry(1.5, 1.8, 1.4, 8);
      const fusteMesh = new THREE.Mesh(fusteGeo, matRoca);
      fusteMesh.position.y = 1.4;
      fusteMesh.receiveShadow = true;
      fusteMesh.castShadow = true;
      grupo.add(fusteMesh);

      const capitelGeo = new THREE.CylinderGeometry(2.1, 1.4, 0.5, 8);
      const capitelMesh = new THREE.Mesh(capitelGeo, matRocaOscura);
      capitelMesh.position.y = 2.35;
      capitelMesh.receiveShadow = true;
      grupo.add(capitelMesh);

      // Reliquia flotante
      const reliquiaGeo = new THREE.OctahedronGeometry(0.85, 0);
      const matReliquia = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.85,
        roughness: 0.15,
        metalness: 0.6
      });
      const reliquiaMesh = new THREE.Mesh(reliquiaGeo, matReliquia);
      reliquiaMesh.position.y = 3.6;
      reliquiaMesh.castShadow = true;
      grupo.add(reliquiaMesh);
      grupo.userData.reliquiaMesh = reliquiaMesh;

      // Luz mística de la reliquia
      const luz = new THREE.PointLight(0x38bdf8, 1.8, 22);
      luz.position.set(0, 3.8, 0);
      grupo.add(luz);

      // 4 monolitos protectores alrededor del pedestal
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2 + 0.35;
        const radPilar = 5.5;
        const pilarGeo = new THREE.BoxGeometry(0.8, 3.6, 0.8);
        const pilar = new THREE.Mesh(pilarGeo, matRocaOscura);
        pilar.position.set(Math.cos(ang) * radPilar, 1.8, Math.sin(ang) * radPilar);
        pilar.rotation.y = ang;
        pilar.castShadow = true;
        pilar.receiveShadow = true;
        grupo.add(pilar);
      }
    } else if (culm === 'santuario') {
      // 🏛️ Círculo de monolitos rúnicos sagrados
      const numPilares = 7;
      const radCirculo = 8.5;
      for (let i = 0; i < numPilares; i++) {
        const ang = (i * 2 * Math.PI) / numPilares;
        const alt = 4.2 + (i % 2) * 1.2;
        const pilarGeo = new THREE.BoxGeometry(1.2, alt, 0.9);
        const pilar = new THREE.Mesh(pilarGeo, matRoca);
        pilar.position.set(Math.cos(ang) * radCirculo, alt / 2, Math.sin(ang) * radCirculo);
        pilar.rotation.y = -ang + Math.PI / 2;
        pilar.castShadow = true;
        pilar.receiveShadow = true;
        grupo.add(pilar);
      }

      // Altar central
      const altarGeo = new THREE.BoxGeometry(3.0, 1.1, 2.0);
      const altar = new THREE.Mesh(altarGeo, matRocaOscura);
      altar.position.y = 0.55;
      altar.castShadow = true;
      altar.receiveShadow = true;
      grupo.add(altar);

      // Cáliz o gema sagrada en el centro
      const gemaGeo = new THREE.DodecahedronGeometry(0.65, 0);
      const matGema = new THREE.MeshStandardMaterial({
        color: 0x4ade80,
        emissive: 0x22c55e,
        emissiveIntensity: 0.9,
        roughness: 0.2
      });
      const gema = new THREE.Mesh(gemaGeo, matGema);
      gema.position.y = 1.6;
      grupo.add(gema);
      grupo.userData.reliquiaMesh = gema;

      const luzSantuario = new THREE.PointLight(0x4ade80, 2.0, 26);
      luzSantuario.position.set(0, 2.5, 0);
      grupo.add(luzSantuario);
    } else if (culm === 'jefe') {
      // 💀 Arena ceremonial de jefe con pebeteros encendidos
      const circuloGeo = new THREE.CylinderGeometry(11, 11.5, 0.4, 24);
      const circuloMesh = new THREE.Mesh(circuloGeo, matRocaOscura);
      circuloMesh.position.y = 0.2;
      circuloMesh.receiveShadow = true;
      grupo.add(circuloMesh);

      // Borde de la arena
      const anilloGeo = new THREE.TorusGeometry(10.8, 0.4, 8, 24);
      anilloGeo.rotateX(Math.PI / 2);
      const anilloMesh = new THREE.Mesh(anilloGeo, matOro);
      anilloMesh.position.y = 0.45;
      grupo.add(anilloMesh);

      // 4 Pebeteros con fuego
      const matFuego = new THREE.MeshBasicMaterial({ color: 0xf97316 });
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2 + Math.PI / 4;
        const radPeb = 9.2;
        const pebColGeo = new THREE.CylinderGeometry(0.6, 0.8, 2.4, 8);
        const pebCol = new THREE.Mesh(pebColGeo, matRoca);
        pebCol.position.set(Math.cos(ang) * radPeb, 1.2, Math.sin(ang) * radPeb);
        pebCol.castShadow = true;
        grupo.add(pebCol);

        const fuegoGeo = new THREE.ConeGeometry(0.55, 1.2, 7);
        const fuegoMesh = new THREE.Mesh(fuegoGeo, matFuego);
        fuegoMesh.position.set(Math.cos(ang) * radPeb, 2.7, Math.sin(ang) * radPeb);
        grupo.add(fuegoMesh);

        const luzFuego = new THREE.PointLight(0xf97316, 1.4, 18);
        luzFuego.position.set(Math.cos(ang) * radPeb, 3.0, Math.sin(ang) * radPeb);
        grupo.add(luzFuego);
      }
    } else if (culm === 'oasis') {
      // 🌴 Palmeras exuberantes alrededor del estanque del oasis
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

        // Tronco curvado
        const altTronco = 7.0 + (i % 3) * 1.5;
        const troncoGeo = new THREE.CylinderGeometry(0.35, 0.65, altTronco, 7);
        const tronco = new THREE.Mesh(troncoGeo, matTronco);
        tronco.position.y = altTronco / 2;
        tronco.rotation.z = (Math.random() - 0.5) * 0.22;
        tronco.castShadow = true;
        palmera.add(tronco);

        // Copa de palmeras
        const numHojas = 8;
        for (let h = 0; h < numHojas; h++) {
          const hang = (h * 2 * Math.PI) / numHojas;
          const hojaGeo = new THREE.ConeGeometry(0.9, 3.8, 4);
          const hoja = new THREE.Mesh(hojaGeo, matPalma);
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
    TIPOS,
    CULMINACIONES,
    relievePorDefecto,
    zonaTieneRelieve,
    evaluarPunto,
    aplicarRelieve,
    obtenerRelieveZona,
    esCamino,
    splatZona,
    crearDecoradoCulminacion
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = RelieveZonaLib;
  }
  if (root) {
    root.RelieveZonaLib = RelieveZonaLib;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
