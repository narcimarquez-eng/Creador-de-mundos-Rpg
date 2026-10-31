/*
 * acompanante.js — Sistema de acompañante aldeano para el Visor del Mundo.
 *
 * El aldeano Rowan es un explorador novato vestido con ropas básicas de cuero,
 * cinturón de hebilla y botas de viaje (diseño acorde al catálogo del Estudio de Armaduras).
 * Sigue al héroe en formación táctica sin estorbar, asiste activamente en combate contra
 * las bestias del mapa, comenta al descubrir lugares secretos y reacciona al mundo.
 *
 * Expone window.AcompananteLib (o module.exports para tests en Node).
 */
(function (root) {
  "use strict";

  // Configuración de equipamiento básico de cuero del aldeano (equivalente al Estudio de Armaduras)
  const EQUIPO_ALDEANO = {
    nombre: 'Rowan',
    rol: 'Aldeano Explorador',
    underlayer: 'Cuero Oscuro Articulado',
    torso: 'Jubón de Cuero Curtido con Refuerzos',
    belt: 'Cinturón de Brigantina con Hebilla de Bronce',
    boots: 'Botas de Cuero de Viaje con Puntera Reforzada',
    gloves: 'Guanteletes Ligeros de Cuero',
    weapon: 'Espada Corta de Acero y Madera',
    helmet: null // Rostro descubierto de aldeano
  };

  // Frases contextuales del aldeano Rowan
  const FRASES = {
    secreto_fuente: [
      '¡Mira allí! ¡El agua de esa fuente brilla con luz propia!',
      '¡Increíble! Una fuente arcana perdida en la espesura. Dicen que sus aguas curan el cansancio.',
      'Las leyendas de los ancianos eran ciertas... ¡La fuente sigue manando energía pura!'
    ],
    secreto_cabana: [
      '¡Una cabaña oculta entre la maleza! ¿Quién habrá vivido aquí tan lejos de las murallas?',
      'Huele a leña vieja y pergaminos... Alguien se refugió en esta cabaña hace mucho tiempo.',
      '¡Cuidado al entrar! Este refugio de ermitaño podría guardar provisiones o trampas.'
    ],
    secreto_altar: [
      '¡Siento una vibración en el suelo! Es un altar rúnico de los primeros reyes.',
      'Las runas de esos monolitos coinciden con las de la muralla de la aldea...',
      '¡Qué arquitectura tan imponente! Los sabios darían cualquier cosa por ver este altar.'
    ],
    secreto_santuario: [
      '¡Por todos los cielos! ¡El santuario de los siete reinos! Jamás vi nada tan majestuoso.',
      'Los pilares de luz siguen activos después de tantos siglos... ¡Qué hallazgo tan colosal!',
      '¡Lo hemos logrado! La historia del pueblo se escribió bajo estos mismos arcos de piedra.'
    ],
    combate_inicio: [
      '¡Cuidado, bestias al frente! ¡Te cubro la espalda!',
      '¡Por la aldea! ¡No dejaré que te rodeen!',
      '¡Saca el acero, que vienen con hambre!'
    ],
    combate_victoria: [
      '¡Bien peleado! Una bestia menos que amenace los caminos.',
      '¡Qué golpe! Vas dominando el combate a la perfección.',
      'Despejado por ahora... Recuperemos el aliento y sigamos.'
    ],
    ambiente: [
      'El camino es largo, pero a tu lado me siento como un verdadero héroe.',
      'Mis botas de cuero están llenas de barro, pero vale la pena cada paso.',
      '¿Hacia qué rincón del mapa nos dirigiremos ahora?'
    ]
  };

  function elegirFrase(categoria) {
    const lista = FRASES[categoria] || FRASES.ambiente;
    return lista[Math.floor(Math.random() * lista.length)];
  }

  const MAX_SLOTS_INVENTARIO = 20;

  // Estado lógico del acompañante
  function crearAcompanante(config = {}) {
    return {
      id: 'rowan-aldeano',
      nombre: config.nombre || EQUIPO_ALDEANO.nombre,
      rol: EQUIPO_ALDEANO.rol,
      equipo: Object.assign({}, EQUIPO_ALDEANO, config.equipo || {}),
      desbloqueado: !!config.desbloqueado,
      activo: !!config.activo,
      nivel: config.nivel || 1,
      hp: config.hp || 180,
      maxHp: config.maxHp || 180,
      defensa: config.defensa || 14,
      dano: config.dano || 24,
      inconsciente: false,
      // Inventario propio de 20 ranuras para equipamiento y pociones automáticas
      inventario: Array.isArray(config.inventario) ? config.inventario.slice(0, MAX_SLOTS_INVENTARIO) : [],
      pocionesVida: typeof config.pocionesVida === 'number' ? config.pocionesVida : 0,
      // Habilidades complementarias de apoyo (dopes y curas)
      skills: {
        cura: { id: 'cura', nombre: 'Rocío Sanador', desc: 'Restaura 30% de salud al héroe y a Rowan cuando la vida baja del 45%', cooldown: 22, timer: 0 },
        ataque: { id: 'ataque', nombre: 'Grito de Aliento', desc: 'Aumenta el daño de ataque un 25% para el héroe y Rowan durante 12s en combate', cooldown: 30, timer: 0 },
        defensa: { id: 'defensa', nombre: 'Baluarte de Cuero', desc: 'Reduce el daño recibido un 20% durante 10s ante impactos graves', cooldown: 35, timer: 0 }
      },
      buffs: {
        ataqueTimer: 0,
        defensaTimer: 0
      },
      rangoAtaque: 2.2,
      cooldownAtaque: 1.25,
      tiempoSiguienteAtaque: 0,
      x: config.x || 0,
      y: config.y || 0,
      z: config.z || 0,
      rotacion: 0,
      velocidadActual: 0,
      estado: 'idle', // 'idle' | 'walk' | 'run' | 'attack' | 'debilitado'
      tiempoEstado: 0,
      fraseActual: null,
      tiempoFrase: 0,
      ultimoComentarioMs: 0,
      distanciaFormacion: 2.8,
      anguloFormacion: 2.4, // Radianes detrás y al lado del héroe
      mesh: null,
      limbs: null,
      bocadilloDom: null
    };
  }

  // Daño recibido por el acompañante con mitigación por armadura y buff de defensa
  function recibirDanoAcompanante(acompanante, danoBruto) {
    if (!acompanante || !acompanante.activo || acompanante.inconsciente) return 0;
    
    // Mitigación por defensa base
    let defTotal = acompanante.defensa || 0;
    let factor = 1 - (defTotal / (defTotal + 80));
    let dmg = Math.max(1, Math.round(danoBruto * factor));

    // Mitigación adicional si tiene activo el Baluarte de Cuero (-20%)
    if (acompanante.buffs && acompanante.buffs.defensaTimer > 0) {
      dmg = Math.max(1, Math.round(dmg * 0.80));
    }

    acompanante.hp = Math.max(0, acompanante.hp - dmg);

    if (acompanante.hp <= 0) {
      acompanante.inconsciente = true;
      acompanante.estado = 'debilitado';
      decirFrase(acompanante, '¡He caído! Protégeme... necesito recuperarme.', 5.0);
    } else if (acompanante.hp < acompanante.maxHp * 0.40) {
      const ahora = Date.now();
      if (ahora - (acompanante._avisoVidaBaja || 0) > 8000) {
        acompanante._avisoVidaBaja = ahora;
        decirFrase(acompanante, '¡Me hieren de gravedad! ¡Cuidado con sus garras!', 3.5);
      }
    }

    return dmg;
  }

  // Revivir o restaurar al acompañante tras descansar o curar
  function revivirAcompanante(acompanante, porcentaje = 0.50) {
    if (!acompanante) return;
    acompanante.inconsciente = false;
    acompanante.hp = Math.max(Math.round(acompanante.maxHp * porcentaje), acompanante.hp);
    if (acompanante.estado === 'debilitado') acompanante.estado = 'idle';
  }

  // Añade un objeto al inventario del acompañante (hasta 20 slots)
  function agregarObjetoAcompanante(acompanante, obj) {
    if (!acompanante) return false;
    acompanante.inventario = acompanante.inventario || [];
    if (acompanante.inventario.length >= MAX_SLOTS_INVENTARIO) {
      throw new Error('El inventario de Rowan está lleno (máximo 20 objetos)');
    }
    acompanante.inventario.push(obj);
    if (obj.tipo === 'pocion_vida') {
      acompanante.pocionesVida = (acompanante.pocionesVida || 0) + 1;
    }
    return true;
  }

  // Retira un objeto del inventario del acompañante por su uid
  function removerObjetoAcompanante(acompanante, uid) {
    if (!acompanante || !acompanante.inventario) return null;
    const idx = acompanante.inventario.findIndex(o => o.uid === uid);
    if (idx === -1) return null;
    const [removido] = acompanante.inventario.splice(idx, 1);
    if (removido.tipo === 'pocion_vida') {
      acompanante.pocionesVida = Math.max(0, (acompanante.pocionesVida || 0) - 1);
    }
    return removido;
  }

  // Da pociones de vida al inventario del acompañante
  function darPocionesVidaAcompanante(acompanante, cantidad = 1) {
    if (!acompanante) return 0;
    let dadas = 0;
    for (let i = 0; i < cantidad; i++) {
      if (acompanante.inventario.length >= MAX_SLOTS_INVENTARIO) break;
      const pocion = {
        uid: 'pocion-vida-acomp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        tipo: 'pocion_vida',
        nombre: 'Poción de Salud',
        cura: 0.35,
        icono: '🧪'
      };
      acompanante.inventario.push(pocion);
      acompanante.pocionesVida = (acompanante.pocionesVida || 0) + 1;
      dadas++;
    }
    return dadas;
  }

  // Auto-consumo de poción de vida por el propio acompañante si baja de 50% HP
  function tomarPocionAutomaticaAcompanante(acompanante) {
    if (!acompanante || acompanante.inconsciente) return false;
    if (acompanante.hp >= acompanante.maxHp * 0.50) return false;

    // Buscar una poción en su inventario
    const idxPocion = (acompanante.inventario || []).findIndex(o => o.tipo === 'pocion_vida');
    if (idxPocion === -1 && (!acompanante.pocionesVida || acompanante.pocionesVida <= 0)) return false;

    if (idxPocion !== -1) {
      acompanante.inventario.splice(idxPocion, 1);
    }
    acompanante.pocionesVida = Math.max(0, (acompanante.pocionesVida || 1) - 1);

    const cura = Math.round(acompanante.maxHp * 0.35);
    acompanante.hp = Math.min(acompanante.maxHp, acompanante.hp + cura);
    decirFrase(acompanante, '¡He tomado una poción de salud! (+' + cura + ' HP)', 3.5);
    return cura;
  }

  // Equipar una pieza de armadura o arma en el acompañante
  function equiparPiezaAcompanante(acompanante, obj) {
    if (!acompanante || !obj || !obj.ranura) return false;
    acompanante.equipo = acompanante.equipo || {};
    acompanante.equipo[obj.ranura] = obj.nombre || obj.uid;

    // Bonificaciones de stats según la pieza
    if (obj.ranura === 'weapon') {
      acompanante.dano = Math.max(24, Math.round(18 + (obj.ataque || 10)));
    } else {
      acompanante.defensa = Math.max(14, Math.round(10 + (obj.defensa || 8)));
      acompanante.maxHp = Math.max(180, Math.round(160 + (obj.defensa || 6) * 4));
      acompanante.hp = Math.min(acompanante.hp, acompanante.maxHp);
    }
    return true;
  }

  // Construcción del modelo 3D del aldeano en Three.js con materiales y vestimenta de cuero
  function construirModeloAcompanante(THREE) {
    const grupo = new THREE.Group();
    grupo.name = 'Acompanante_Rowan';

    // Paleta de materiales: cuero curtido, cuero oscuro, bronce, piel, lino y acero
    const matCuero = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Marrón cuero cálido
      roughness: 0.78,
      metalness: 0.08
    });
    const matCueroOscuro = new THREE.MeshStandardMaterial({
      color: 0x3b1d11, // Cuero oscuro para botas y correas
      roughness: 0.85,
      metalness: 0.05
    });
    const matLino = new THREE.MeshStandardMaterial({
      color: 0xd6c7a1, // Camisa de lino rústico
      roughness: 0.9,
      metalness: 0.0
    });
    const matPantalon = new THREE.MeshStandardMaterial({
      color: 0x334155, // Tela resistente pizarra azulada
      roughness: 0.82,
      metalness: 0.02
    });
    const matPiel = new THREE.MeshStandardMaterial({
      color: 0xfbd0a6, // Tono de piel natural
      roughness: 0.65,
      metalness: 0.0
    });
    const matCabello = new THREE.MeshStandardMaterial({
      color: 0x451a03, // Pelo castaño oscuro
      roughness: 0.9,
      metalness: 0.02
    });
    const matHebilla = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Latón / bronce dorado
      roughness: 0.35,
      metalness: 0.75
    });
    const matAcero = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Acero de espada
      roughness: 0.25,
      metalness: 0.85
    });

    // 1. Torso y Jubón de Cuero
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.68, 0.28), matCuero);
    torso.position.y = 1.08;
    torso.castShadow = true;
    torso.receiveShadow = true;
    grupo.add(torso);

    // Cuello de la camisa de lino que asoma sobre el jubón
    const cuelloLino = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.22), matLino);
    cuelloLino.position.set(0, 1.42, 0);
    grupo.add(cuelloLino);

    // 2. Cinturón de Cuero con Hebilla de Bronce
    const cinturon = new THREE.Mesh(new THREE.BoxGeometry(0.53, 0.11, 0.30), matCueroOscuro);
    cinturon.position.y = 0.78;
    cinturon.castShadow = true;
    grupo.add(cinturon);

    const hebilla = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, 0.32), matHebilla);
    hebilla.position.set(0, 0.78, 0.01);
    grupo.add(hebilla);

    // Pequeño saquito / bolsa de provisiones de cuero al costado del cinturón
    const bolsita = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.12), matCuero);
    bolsita.position.set(0.28, 0.75, 0.05);
    grupo.add(bolsita);

    // 3. Cabeza y Cabello de Aldeano
    const cabeza = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.38, 0.36), matPiel);
    cabeza.position.y = 1.66;
    cabeza.castShadow = true;
    grupo.add(cabeza);

    const cabello = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.18, 0.38), matCabello);
    cabello.position.set(0, 1.82, -0.02);
    grupo.add(cabello);

    const flequillo = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.10, 0.10), matCabello);
    flequillo.position.set(0, 1.76, 0.16);
    grupo.add(flequillo);

    // 4. Piernas y Botas de Cuero
    // Pierna Izquierda
    const piernaIzqGrupo = new THREE.Group();
    piernaIzqGrupo.position.set(-0.14, 0.74, 0);
    const pantalonIzq = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.44, 0.20), matPantalon);
    pantalonIzq.position.y = -0.22;
    pantalonIzq.castShadow = true;
    piernaIzqGrupo.add(pantalonIzq);
    const botaIzq = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.34, 0.24), matCueroOscuro);
    botaIzq.position.set(0, -0.56, 0.02);
    botaIzq.castShadow = true;
    piernaIzqGrupo.add(botaIzq);
    grupo.add(piernaIzqGrupo);

    // Pierna Derecha
    const piernaDerGrupo = new THREE.Group();
    piernaDerGrupo.position.set(0.14, 0.74, 0);
    const pantalonDer = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.44, 0.20), matPantalon);
    pantalonDer.position.y = -0.22;
    pantalonDer.castShadow = true;
    piernaDerGrupo.add(pantalonDer);
    const botaDer = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.34, 0.24), matCueroOscuro);
    botaDer.position.set(0, -0.56, 0.02);
    botaDer.castShadow = true;
    piernaDerGrupo.add(botaDer);
    grupo.add(piernaDerGrupo);

    // 5. Brazos y Espada Corta
    // Brazo Izquierdo
    const brazoIzqGrupo = new THREE.Group();
    brazoIzqGrupo.position.set(-0.35, 1.34, 0);
    const mangaIzq = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.38, 0.18), matLino);
    mangaIzq.position.y = -0.19;
    brazoIzqGrupo.add(mangaIzq);
    const antebrazoIzq = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.28, 0.16), matCuero);
    antebrazoIzq.position.y = -0.48;
    antebrazoIzq.castShadow = true;
    brazoIzqGrupo.add(antebrazoIzq);
    grupo.add(brazoIzqGrupo);

    // Brazo Derecho (Mano de combate con espada corta)
    const brazoDerGrupo = new THREE.Group();
    brazoDerGrupo.position.set(0.35, 1.34, 0);
    const mangaDer = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.38, 0.18), matLino);
    mangaDer.position.y = -0.19;
    brazoDerGrupo.add(mangaDer);
    const antebrazoDer = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.28, 0.16), matCuero);
    antebrazoDer.position.y = -0.48;
    antebrazoDer.castShadow = true;
    brazoDerGrupo.add(antebrazoDer);

    // Espada corta de aldeano
    const espadaGrupo = new THREE.Group();
    espadaGrupo.position.set(0, -0.62, 0.12);
    const hoja = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.65, 0.02), matAcero);
    hoja.position.y = 0.30;
    hoja.castShadow = true;
    espadaGrupo.add(hoja);
    const guarda = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.04, 0.06), matHebilla);
    guarda.position.y = 0.0;
    espadaGrupo.add(guarda);
    const empunadura = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.05), matCueroOscuro);
    empunadura.position.y = -0.09;
    espadaGrupo.add(empunadura);
    brazoDerGrupo.add(espadaGrupo);

    grupo.add(brazoDerGrupo);

    // Marcador sutil de aliado (halo tenue verde a sus pies)
    const haloGeo = new THREE.RingGeometry(0.4, 0.55, 24);
    haloGeo.rotateX(-Math.PI / 2);
    const matHalo = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    const halo = new THREE.Mesh(haloGeo, matHalo);
    halo.position.y = 0.04;
    grupo.add(halo);

    return {
      root: grupo,
      torso,
      cabeza,
      limbs: {
        piernaIzq: piernaIzqGrupo,
        piernaDer: piernaDerGrupo,
        brazoIzq: brazoIzqGrupo,
        brazoDer: brazoDerGrupo,
        espada: espadaGrupo
      }
    };
  }

  // Actualización de animaciones de los miembros (paso de marcha / carrera / golpe de espada)
  function animarMiembros(limbs, estado, tiempo, velocidad) {
    if (!limbs) return;
    const cadencia = estado === 'run' ? 12.0 : (estado === 'walk' ? 7.5 : 2.5);
    const f = tiempo * cadencia;

    if (estado === 'attack') {
      // Golpe dinámico de espada con el brazo derecho
      const tGolpe = Math.min(1, (tiempo % 0.6) / 0.6);
      const arco = Math.sin(tGolpe * Math.PI);
      limbs.brazoDer.rotation.x = -1.2 + arco * 2.2;
      limbs.brazoDer.rotation.z = -0.3 + arco * 0.5;
      limbs.brazoIzq.rotation.x = 0.4;
      limbs.piernaIzq.rotation.x = -0.2;
      limbs.piernaDer.rotation.x = 0.2;
    } else if (estado === 'walk' || estado === 'run') {
      const amplitud = estado === 'run' ? 0.85 : 0.48;
      const osc = Math.sin(f) * amplitud;
      limbs.piernaIzq.rotation.x = osc;
      limbs.piernaDer.rotation.x = -osc;
      limbs.brazoIzq.rotation.x = -osc * 0.9;
      limbs.brazoDer.rotation.x = osc * 0.9;
      limbs.brazoDer.rotation.z = 0;
    } else {
      // Reposo (respiración suave)
      const respiro = Math.sin(f * 0.8) * 0.04;
      limbs.brazoIzq.rotation.x = 0.1 + respiro;
      limbs.brazoDer.rotation.x = 0.1 - respiro;
      limbs.brazoDer.rotation.z = 0;
      limbs.piernaIzq.rotation.x = 0;
      limbs.piernaDer.rotation.x = 0;
    }
  }

  // Reproducción de animaciones esqueléticas para el modelo GLB del Estudio de Armaduras
  function reproducirAnimacionGLB(acompanante, nombreAnim, fadeDuration = 0.22) {
    if (!acompanante || !acompanante.mixer || !acompanante.actions) return;

    let clipName = nombreAnim;
    if (nombreAnim === 'attack') {
      const ataques = ['overhead_cleave', 'thrust_lunge', 'spin_slash'];
      clipName = ataques.find(n => acompanante.actions[n]) || 'punch';
    }

    if (!acompanante.actions[clipName]) {
      clipName = 'idle';
    }

    const proxima = acompanante.actions[clipName];
    if (!proxima) return;

    if (acompanante.nombreAnimActual === clipName && proxima.isRunning()) {
      return;
    }

    const anterior = acompanante.accionActual;
    proxima.reset();
    proxima.enabled = true;

    if (nombreAnim === 'attack') {
      proxima.setLoop(1, 1);
      proxima.clampWhenFinished = false;
    } else {
      proxima.setLoop(1000);
    }

    if (anterior && anterior !== proxima) {
      proxima.crossFadeFrom(anterior, Math.min(fadeDuration, 0.25), true);
    }
    proxima.play();
    acompanante.accionActual = proxima;
    acompanante.nombreAnimActual = clipName;
  }

  // Integración del modelo humanoide GLB generado con el Estudio de Armaduras
  function instalarModeloGLBAcompanante(acompanante, gltf, THREE) {
    if (!acompanante || !gltf || !gltf.scene) return null;
    const root = gltf.scene;

    // Normalizar escala anatómica a 1.82m
    const bbox = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    if (size.y > 0.01) {
      const escala = 1.82 / size.y;
      root.scale.setScalar(escala);
    }
    bbox.setFromObject(root);
    root.position.y = -bbox.min.y;

    const contenedor = new THREE.Group();
    contenedor.name = 'Acompanante_Rowan_GLB';
    contenedor.add(root);

    // Ajustar materiales y sombras
    root.traverse(o => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (o.material) {
          if (Array.isArray(o.material)) {
            o.material.forEach(m => { if (m) m.roughness = Math.max(0.35, m.roughness || 0.6); });
          } else {
            o.material.roughness = Math.max(0.35, o.material.roughness || 0.6);
          }
        }
      }
    });

    // Marcador sutil de aliado (halo tenue verde a sus pies)
    const haloGeo = new THREE.RingGeometry(0.4, 0.55, 24);
    haloGeo.rotateX(-Math.PI / 2);
    const matHalo = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    const halo = new THREE.Mesh(haloGeo, matHalo);
    halo.position.y = 0.04;
    contenedor.add(halo);

    // AnimationMixer y mapeo de animaciones disponibles
    let mixer = null;
    const actions = {};
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(root);
      gltf.animations.forEach(clip => {
        actions[clip.name] = mixer.clipAction(clip);
      });
    }

    // Reemplazo limpio en la escena
    if (acompanante.mesh) {
      contenedor.position.copy(acompanante.mesh.position);
      contenedor.rotation.copy(acompanante.mesh.rotation);
      if (acompanante.mesh.parent) {
        const parent = acompanante.mesh.parent;
        parent.remove(acompanante.mesh);
        parent.add(contenedor);
      }
    }

    acompanante.mesh = contenedor;
    acompanante.limbs = null;
    acompanante.mixer = mixer;
    acompanante.actions = actions;
    acompanante.accionActual = null;
    acompanante.nombreAnimActual = null;

    reproducirAnimacionGLB(acompanante, 'idle', 0.1);
    return contenedor;
  }

  // Validador estricto de monstruos vivos y combatibles
  function esMonstruoCombatible(m) {
    if (!m) return false;
    if (m.alive === false || m.muerto) return false;
    if (typeof m.hp === 'number' && m.hp <= 0) return false;
    if (m.muriendo && typeof performance !== 'undefined' && performance.now() < m.muriendo) return false;
    return true;
  }

  // Actualización de la IA del acompañante en cada frame
  function actualizarAcompanante(acompanante, dt, heroePos, heroeRot, monstruos, heroeObjetivo, getAlturaFn, registrarEventoFn, aplicarDanoMonstruoFn, heroeInfo, alLanzarSkillFn) {
    if (!acompanante || !acompanante.activo || !acompanante.mesh) return;

    acompanante.tiempoEstado += dt;
    acompanante.tiempoSiguienteAtaque = Math.max(0, acompanante.tiempoSiguienteAtaque - dt);

    // Actualización de timers de buffs y habilidades de apoyo
    if (acompanante.buffs) {
      acompanante.buffs.ataqueTimer = Math.max(0, (acompanante.buffs.ataqueTimer || 0) - dt);
      acompanante.buffs.defensaTimer = Math.max(0, (acompanante.buffs.defensaTimer || 0) - dt);
    }
    if (acompanante.skills) {
      if (acompanante.skills.cura) acompanante.skills.cura.timer = Math.max(0, acompanante.skills.cura.timer - dt);
      if (acompanante.skills.ataque) acompanante.skills.ataque.timer = Math.max(0, acompanante.skills.ataque.timer - dt);
      if (acompanante.skills.defensa) acompanante.skills.defensa.timer = Math.max(0, acompanante.skills.defensa.timer - dt);
    }

    // Si ha caído inconsciente, no ataca ni se desplaza hasta ser curado
    if (acompanante.inconsciente) {
      acompanante.estado = 'debilitado';
      acompanante.velocidadActual = 0;
      const ySuelo = getAlturaFn ? getAlturaFn(acompanante.x, acompanante.z) : 0;
      acompanante.y = ySuelo;
      acompanante.mesh.position.set(acompanante.x, ySuelo, acompanante.z);
      if (acompanante.mixer) acompanante.mixer.update(dt);
      return;
    }

    // Auto-toma de poción de vida automática si la salud cae por debajo del 50%
    if (acompanante.hp < acompanante.maxHp * 0.50) {
      tomarPocionAutomaticaAcompanante(acompanante);
    }

    // 1. Determinar si hay un monstruo hostil al alcance o el objetivo actual del héroe
    let objetivoCombate = null;
    let distObjetivoMin = Infinity;

    if (esMonstruoCombatible(heroeObjetivo)) {
      const dHeroe = Math.hypot(heroeObjetivo.x - heroePos.x, heroeObjetivo.z - heroePos.z);
      if (dHeroe < 14) {
        objetivoCombate = heroeObjetivo;
        distObjetivoMin = Math.hypot(heroeObjetivo.x - acompanante.x, heroeObjetivo.z - acompanante.z);
      }
    }

    if (!objetivoCombate && monstruos && monstruos.length) {
      monstruos.forEach(m => {
        if (!esMonstruoCombatible(m)) return;
        const d = Math.hypot(m.x - heroePos.x, m.z - heroePos.z);
        if (d < 10) {
          const dComp = Math.hypot(m.x - acompanante.x, m.z - acompanante.z);
          if (dComp < distObjetivoMin) {
            distObjetivoMin = dComp;
            objetivoCombate = m;
          }
        }
      });
    }

    // Gestión y activación de Skills Complementarias de Apoyo (Dopes y Curas)
    if (acompanante.skills) {
      const heroeHpActual = (heroeInfo && typeof heroeInfo.hp === 'number') ? heroeInfo.hp : 100;
      const heroeHpMax = (heroeInfo && typeof heroeInfo.maxHp === 'number') ? heroeInfo.maxHp : 100;
      const heroeBajo = (heroeHpActual / heroeHpMax) < 0.45;
      const rowanBajo = (acompanante.hp / acompanante.maxHp) < 0.45;

      // 1. Skill de Cura: Rocío Sanador
      if (acompanante.skills.cura && acompanante.skills.cura.timer <= 0 && (heroeBajo || rowanBajo)) {
        acompanante.skills.cura.timer = acompanante.skills.cura.cooldown;
        const curaRowan = Math.round(acompanante.maxHp * 0.30);
        acompanante.hp = Math.min(acompanante.maxHp, acompanante.hp + curaRowan);
        decirFrase(acompanante, '🌿 ¡Rocío Sanador! ¡Ánimo, resistiremos juntos!', 4.0);
        if (typeof alLanzarSkillFn === 'function') {
          alLanzarSkillFn({ tipo: 'cura', nombre: 'Rocío Sanador', valor: 0.30, curaRowan });
        }
      }

      // 2. Skill de Dope de Ataque: Grito de Aliento (en combate)
      if (objetivoCombate && acompanante.skills.ataque && acompanante.skills.ataque.timer <= 0) {
        acompanante.skills.ataque.timer = acompanante.skills.ataque.cooldown;
        acompanante.buffs.ataqueTimer = 12;
        decirFrase(acompanante, '⚔️ ¡Por la gloria de Aden! ¡Aplastémoslos a todos! (+25% daño)', 4.0);
        if (typeof alLanzarSkillFn === 'function') {
          alLanzarSkillFn({ tipo: 'buff_ataque', nombre: 'Grito de Aliento', duracion: 12, valor: 0.25 });
        }
      }

      // 3. Skill de Dope de Defensa: Baluarte de Cuero (al luchar o sufrir daño)
      if (objetivoCombate && acompanante.skills.defensa && acompanante.skills.defensa.timer <= 0 && (rowanBajo || (distObjetivoMin < 3.5))) {
        acompanante.skills.defensa.timer = acompanante.skills.defensa.cooldown;
        acompanante.buffs.defensaTimer = 10;
        decirFrase(acompanante, '🛡️ ¡Formación cerrada! ¡Escudos arriba! (-20% daño)', 4.0);
        if (typeof alLanzarSkillFn === 'function') {
          alLanzarSkillFn({ tipo: 'buff_defensa', nombre: 'Baluarte de Cuero', duracion: 10, valor: 0.20 });
        }
      }
    }

    // 2. Destino de movimiento: combate o formación táctica
    let destX = heroePos.x;
    let destZ = heroePos.z;
    let distanciaFreno = 1.0;

    if (objetivoCombate) {
      // Acercarse al monstruo para atacar
      destX = objetivoCombate.x;
      destZ = objetivoCombate.z;
      distanciaFreno = acompanante.rangoAtaque;
    } else {
      // Posición de formación: a un lado y detrás del héroe
      const ang = heroeRot + acompanante.anguloFormacion;
      destX = heroePos.x + Math.sin(ang) * acompanante.distanciaFormacion;
      destZ = heroePos.z + Math.cos(ang) * acompanante.distanciaFormacion;
      distanciaFreno = 0.8;
    }

    const dx = destX - acompanante.x;
    const dz = destZ - acompanante.z;
    const distDestino = Math.hypot(dx, dz);

    // Resituado de emergencia si queda demasiado lejos por viaje rápido o desync (> 60m)
    if (distDestino > 60) {
      acompanante.x = heroePos.x - Math.sin(heroeRot) * 2;
      acompanante.z = heroePos.z - Math.cos(heroeRot) * 2;
    }

    // 3. Comportamiento y velocidad
    let estadoNuevo = 'idle';
    let velocidad = 0;

    if (objetivoCombate && distDestino <= acompanante.rangoAtaque + 0.3) {
      // En rango de ataque: golpear al monstruo
      estadoNuevo = 'attack';
      acompanante.rotacion = Math.atan2(dx, dz);

      if (acompanante.tiempoSiguienteAtaque <= 0) {
        acompanante.tiempoSiguienteAtaque = acompanante.cooldownAtaque;
        const multAtaque = (acompanante.buffs && acompanante.buffs.ataqueTimer > 0) ? 1.25 : 1.0;
        const golpeDano = Math.round(acompanante.dano * multAtaque * (0.85 + Math.random() * 0.3));

        if (typeof aplicarDanoMonstruoFn === 'function') {
          aplicarDanoMonstruoFn(objetivoCombate, golpeDano);
        } else if (typeof objetivoCombate.recibirDano === 'function') {
          objetivoCombate.recibirDano(golpeDano, 'companero');
        } else if (typeof objetivoCombate.damageMonster === 'function') {
          objetivoCombate.damageMonster(golpeDano);
        } else if (typeof objetivoCombate.hp === 'number') {
          objetivoCombate.hp = Math.max(0, objetivoCombate.hp - golpeDano);
          if (objetivoCombate.hp <= 0) {
            objetivoCombate.alive = false;
            objetivoCombate.muerto = true;
            if (typeof objetivoCombate.kill === 'function') objetivoCombate.kill();
            if (registrarEventoFn) {
              const zId = objetivoCombate.zoneId || (objetivoCombate.zone && objetivoCombate.zone.id);
              registrarEventoFn({ tipo: objetivoCombate.boss ? 'jefe' : 'matar', zona: zId });
            }
          }
        }

        // Si el monstruo ha muerto con este golpe, celebrar victoria
        if (!esMonstruoCombatible(objetivoCombate)) {
          const ahora = typeof performance !== 'undefined' ? performance.now() : Date.now();
          if (ahora - acompanante.ultimoComentarioMs > 6000) {
            acompanante.ultimoComentarioMs = ahora;
            decirFrase(acompanante, elegirFrase('combate_victoria'), 4.0);
          }
          objetivoCombate = null;
        }
      }
    } else if (distDestino > distanciaFreno) {
      // Desplazarse hacia el objetivo
      if (distDestino > 4.5 || (objetivoCombate && distDestino > 2.8)) {
        estadoNuevo = 'run';
        velocidad = 10.5;
      } else {
        estadoNuevo = 'walk';
        velocidad = 5.8;
      }

      const paso = Math.min(distDestino, velocidad * dt);
      const dirX = dx / distDestino;
      const dirZ = dz / distDestino;

      acompanante.x += dirX * paso;
      acompanante.z += dirZ * paso;

      // Rotación suave hacia el vector de movimiento
      const angDeseado = Math.atan2(dirX, dirZ);
      let diffAng = angDeseado - acompanante.rotacion;
      while (diffAng < -Math.PI) diffAng += Math.PI * 2;
      while (diffAng > Math.PI) diffAng -= Math.PI * 2;
      acompanante.rotacion += diffAng * Math.min(1, dt * 10);
    } else {
      // Reposo: mirar suavemente hacia donde mira el héroe o hacia el frente
      estadoNuevo = 'idle';
      let diffAng = heroeRot - acompanante.rotacion;
      while (diffAng < -Math.PI) diffAng += Math.PI * 2;
      while (diffAng > Math.PI) diffAng -= Math.PI * 2;
      acompanante.rotacion += diffAng * Math.min(1, dt * 3.5);
    }

    if (estadoNuevo !== acompanante.estado) {
      acompanante.estado = estadoNuevo;
      acompanante.tiempoEstado = 0;
    }

    // 4. Actualizar malla 3D y altura del terreno
    const ySuelo = getAlturaFn ? getAlturaFn(acompanante.x, acompanante.z) : 0;
    acompanante.y = ySuelo;
    acompanante.mesh.position.set(acompanante.x, ySuelo, acompanante.z);
    acompanante.mesh.rotation.y = acompanante.rotacion;

    if (acompanante.mixer) {
      acompanante.mixer.update(dt);
      reproducirAnimacionGLB(acompanante, acompanante.estado, 0.2);
    } else if (acompanante.limbs) {
      animarMiembros(acompanante.limbs, acompanante.estado, acompanante.tiempoEstado, velocidad);
    }

    // 5. Gestión del tiempo del bocadillo de diálogo flotante
    if (acompanante.tiempoFrase > 0) {
      acompanante.tiempoFrase -= dt;
      if (acompanante.tiempoFrase <= 0 && acompanante.bocadilloDom) {
        acompanante.bocadilloDom.style.opacity = '0';
      }
    }
  }

  // Muestra un mensaje flotante del aldeano sobre su cabeza en la interfaz
  function decirFrase(acompanante, texto, duracionSeg = 4.5) {
    if (!acompanante) return;
    acompanante.fraseActual = texto;
    acompanante.tiempoFrase = duracionSeg;
    acompanante.ultimoComentarioMs = Date.now();

    if (acompanante.bocadilloDom) {
      acompanante.bocadilloDom.textContent = texto;
      acompanante.bocadilloDom.style.opacity = '1';
    }
  }

  // Comprueba si el héroe o el acompañante se han acercado a un lugar secreto
  function comprobarLugaresSecretos(acompanante, lugaresSecretos, posHeroe, alDescubrirFn) {
    if (!lugaresSecretos || !lugaresSecretos.length) return null;
    const ahora = Date.now();

    for (let i = 0; i < lugaresSecretos.length; i++) {
      const sec = lugaresSecretos[i];
      const d = Math.hypot(sec.x - posHeroe.x, sec.z - posHeroe.z);
      if (d <= (sec.radio || 18)) {
        if (!sec.descubierto) {
          sec.descubierto = true;
          if (acompanante && acompanante.activo && ahora - acompanante.ultimoComentarioMs > 4000) {
            const cat = 'secreto_' + (sec.tipo || 'fuente');
            decirFrase(acompanante, elegirFrase(cat), 5.5);
          }
          if (alDescubrirFn) alDescubrirFn(sec);
          return sec;
        }
      }
    }
    return null;
  }

  const api = {
    EQUIPO_ALDEANO,
    FRASES,
    MAX_SLOTS_INVENTARIO,
    elegirFrase,
    crearAcompanante,
    construirModeloAcompanante,
    instalarModeloGLBAcompanante,
    reproducirAnimacionGLB,
    animarMiembros,
    actualizarAcompanante,
    esMonstruoCombatible,
    decirFrase,
    comprobarLugaresSecretos,
    recibirDanoAcompanante,
    revivirAcompanante,
    agregarObjetoAcompanante,
    removerObjetoAcompanante,
    darPocionesVidaAcompanante,
    tomarPocionAutomaticaAcompanante,
    equiparPiezaAcompanante
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AcompananteLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
