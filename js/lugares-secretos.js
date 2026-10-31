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

    const margen = Math.min(200, W * 0.12);
    const pueblos = world.towns || [];
    const zonas = world.zones || [];

    const numLugares = Math.max(6, Math.min(14, Math.round(W / 280)));
    const lugares = [];

    const tipos = ['fuente', 'cabana', 'altar', 'santuario'];
    const nombresExtra = [
      'de la Bruma', 'del Silencio', 'de las Estrellas', 'del Roble Caído',
      'de los Vientos', 'del Eco Antiguo', 'de la Esperanza', 'del Alba'
    ];

    let intentos = 0;
    while (lugares.length < numLugares && intentos < 250) {
      intentos++;
      const x = margen + rnd() * (W - margen * 2);
      const z = margen + rnd() * (W - margen * 2);

      // Lejos de los pueblos para ser genuinamente secretos (al menos 120m)
      const cercaPueblo = pueblos.some(p => Math.hypot(p.x - x, p.y - z) < 130);
      if (cercaPueblo) continue;

      // Separación entre secretos existentes (al menos 140m)
      const cercaSecreto = lugares.some(s => Math.hypot(s.x - x, s.z - z) < 140);
      if (cercaSecreto) continue;

      const tipoKey = tipos[lugares.length % tipos.length];
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
      // 2. CABAÑA DEL ERMITAÑO
      // Suelo de tablones
      const plataforma = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.4, 5.6), matMaderaOscura);
      plataforma.position.y = 0.2;
      plataforma.castShadow = true; plataforma.receiveShadow = true;
      grupo.add(plataforma);

      // Muros de leña tosca
      const muroP = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.6, 4.8), matMadera);
      muroP.position.y = 1.6;
      muroP.castShadow = true; muroP.receiveShadow = true;
      grupo.add(muroP);

      // Puerta abierta y hueco
      const puerta = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.0, 0.2), matMaderaOscura);
      puerta.position.set(0, 1.3, 2.45);
      grupo.add(puerta);

      // Tejado a dos aguas
      const tejadoGeo = new THREE.ConeGeometry(4.4, 1.8, 4);
      tejadoGeo.rotateY(Math.PI / 4);
      const tejado = new THREE.Mesh(tejadoGeo, matMaderaOscura);
      tejado.position.y = 3.6;
      tejado.scale.set(1.1, 1.0, 0.9);
      tejado.castShadow = true;
      grupo.add(tejado);

      // Porche delantero con 2 postes
      [-2.4, 2.4].forEach(px => {
        const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.4, 8), matMadera);
        poste.position.set(px, 1.4, 3.0);
        poste.castShadow = true;
        grupo.add(poste);
      });
      const aleroPorche = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.2, 1.4), matMaderaOscura);
      aleroPorche.position.set(0, 2.6, 2.7);
      grupo.add(aleroPorche);

      // Chimenea de piedra con humo tenue
      const chimenea = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.8, 0.8), matPiedra);
      chimenea.position.set(2.2, 2.1, -1.6);
      chimenea.castShadow = true;
      grupo.add(chimenea);

      // Hoguera pequeña enfrente
      const fuegoBase = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.15, 6, 12), matPiedra);
      fuegoBase.rotation.x = Math.PI / 2;
      fuegoBase.position.set(-1.8, 0.15, 4.0);
      grupo.add(fuegoBase);
      const llama = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 6), new THREE.MeshStandardMaterial({
        color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 1.8
      }));
      llama.position.set(-1.8, 0.5, 4.0);
      grupo.add(llama);
      const luzFuego = new THREE.PointLight(0xf97316, 1.5, 12, 1.8);
      luzFuego.position.set(-1.8, 0.8, 4.0);
      grupo.add(luzFuego);

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

  const api = {
    TIPOS_SECRETO,
    generarLugaresSecretos,
    construirModeloSecreto
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LugaresSecretosLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
