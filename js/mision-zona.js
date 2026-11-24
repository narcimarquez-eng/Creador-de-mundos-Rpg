/*
 * mision-zona.js — Encargos de zona: cada zona de combate tiene un NPC en el pueblo más cercano que le encarga
 * una misión. Son independientes de la historia (la crónica) y se derivan de los datos de la zona, así que una
 * zona nueva tiene su encargo sin tocar el mundo guardado. Sin gráficos.
 * Expone window.MisionZonaLib (o module.exports en Node para las pruebas).
 */
(function (root) {
  "use strict";

  // Personajes de los encargos: nombre, oficio y modelo de aldeano medieval (npc/aldeanos/)
  const PERSONAJES = [
    { nombre: 'Doña Hilde', tema: 'remendona de botas, la que cose hasta las piedras', modelo: 'npc/aldeanos/aldeana.glb' },
    { nombre: 'Tomasa Pico', tema: 'pastora de gansos con mal genio', modelo: 'npc/aldeanos/aldeana.glb' },
    { nombre: 'Ferran el Cojo', tema: 'cazador jubilado que aún cuenta las huellas', modelo: 'npc/aldeanos/cazador.glb' },
    { nombre: 'Mara la Tuerta', tema: 'vendedora de rumores en la plaza', modelo: 'npc/aldeanos/informante.glb' },
    { nombre: 'Abuelo Ruvo', tema: 'criador de gallinas muy valientes', modelo: 'npc/aldeanos/campesino.glb' },
    { nombre: 'Brisa Tamborilera', tema: 'músico ambulante que conoce todos los caminos', modelo: 'npc/aldeanos/tabernero.glb' },
    { nombre: 'Teo Remiendos', tema: 'aprendiz de tintorero con las manos teñidas', modelo: 'npc/aldeanos/mercader.glb' },
    { nombre: 'Sol Ardida', tema: 'molinera que oye los trigales de noche', modelo: 'npc/aldeanos/herbolario.glb' },
    { nombre: 'Peregrino Ilan', tema: 'viajero que perdió los zapatos en el bosque', modelo: 'npc/aldeanos/campesino.glb' },
    { nombre: 'Nina Latón', tema: 'cocinera del mesón, dueña de los chismes', modelo: 'npc/aldeanos/aldeana.glb' },
    { nombre: 'Bruno el Cuervo', tema: 'guardia de la empalizada con muy buena vista', modelo: 'npc/aldeanos/lenador.glb' },
    { nombre: 'Clemencia Dedal', tema: 'costurera de capas para los aventureros', modelo: 'npc/aldeanos/herbolario.glb' }
  ];
  const MODELOS = [
    'npc/aldeanos/aldeana.glb',
    'npc/aldeanos/campesino.glb',
    'npc/aldeanos/cazador.glb',
    'npc/aldeanos/mercader.glb',
    'npc/aldeanos/tabernero.glb',
    'npc/aldeanos/herbolario.glb',
    'npc/aldeanos/lenador.glb',
    'npc/aldeanos/informante.glb'
  ];

  // Encargos por tipo de zona. {zona} y {n} se sustituyen por el nombre de la zona y la cantidad.
  const ENCARGOS = {
    caza: [
      { titulo: 'Los bichos del granero', frase: 'Desde que se mudaron a {zona}, ni las gallinas duermen. Mata {n} y te invito a sidra.', gracias: 'Así se hace. Las gallinas ya te deben una.' },
      { titulo: 'Ovejas con mala idea', frase: 'Las ovejas de {zona} aprendieron a empujar las vallas. Enséñales modales: con {n} basta.', gracias: 'Hoy hay cordero para todos, y tú primero.' },
      { titulo: 'Cuentas del ganadero', frase: 'Me deben {n} cabezas de ganado y todas andan por {zona}. Recupéralas a golpes, que es como se cobra aquí.', gracias: 'Cuentas claras y amistad larga. Toma tu paga.' },
      { titulo: 'Silencio en el camino', frase: 'Los viajeros ya no pasan por {zona} sin escolta. Haz que vuelva a ser un paseo: {n} enemigos menos.', gracias: 'Mañana sale la primera carreta sin miedo.' }
    ],
    elite: [
      { titulo: 'Lo grande se esconde', frase: 'Los de {zona} son más fuertes que los demás... y lo saben. Vence a {n} y el pueblo te deberá una.', gracias: 'Esos capitanes ya no mandan en nadie.' },
      { titulo: 'Demasiado bravos', frase: 'En {zona} hay de los que se creen caballeros. Demuéstrales que no lo son: derrota a {n}.', gracias: 'Nadie volverá a llamarlos caballeros.' }
    ],
    jefe: [
      { titulo: 'Cuentas con el jefe', frase: 'El jefe de {zona} se comió el carro del molino entero, con mula y todo. Tumbarlo sería el favor del año.', gracias: 'Haremos una estatua de pan en tu honor.' },
      { titulo: 'La corona de mimbre', frase: 'Un monstruo con corona de mimbre manda en {zona}. Derrótalo y la plaza volverá a bailar.', gracias: 'Hasta los niños han dejado de tener miedo.' }
    ],
    pvp: [
      { titulo: 'Pulso en el barro', frase: 'En {zona} los jóvenes se retan a puñetazos con bestias. Gana {n} combates y te doy algo de oro.', gracias: 'Eres el primero que vuelve con la nariz entera.' }
    ],
    segura: [
      { titulo: 'Un rato de paz', frase: 'Ve hasta {zona}, respira hondo y vuelve a contármelo. No hace falta nada más.', gracias: 'Qué bien. Hasta yo quiero ir ahora.' },
      { titulo: 'El lugar más tranquilo', frase: 'Quiero saber si {zona} sigue en calma. Camina por ella y cuéntamelo.', gracias: 'Pues sí, sigue en calma. Gracias por comprobarlo.' }
    ]
  };

  // Texto del objetivo de cada tipo
  const OBJETIVOS = {
    matar: n => 'Derrota a ' + n + ' monstruos en {zona}.',
    jefe: () => 'Derrota al jefe de {zona}.',
    visitar: () => 'Entra en {zona}.'
  };

  function hash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sustituir = (texto, zona, n) => texto.replace(/\{zona\}/g, zona).replace(/\{n\}/g, String(n));

  // Pueblo más cercano a una zona (por distancia entre centros). pueblos: lista de {id, name, x, y}
  function puebloMasCercano(zona, pueblos) {
    let mejor = null, mejorD = Infinity;
    pueblos.forEach(p => {
      const d = Math.hypot(p.x - zona.x, p.y - zona.y);
      if (d < mejorD) { mejorD = d; mejor = p; }
    });
    return mejor;
  }

  // Objetivo del encargo según el tipo de zona. Cantidad proporcional al tamaño de la zona, entre 3 y 10.
  function objetivoDe(zona) {
    const tam = Math.round(Math.PI * zona.radius * zona.radius / 12000);   // misma escala que los monstruos de la zona
    if (zona.type === 'segura') return { tipo: 'visitar', cantidad: 1 };
    if (zona.type === 'jefe') return { tipo: 'jefe', cantidad: 1 };
    if (zona.type === 'elite') return { tipo: 'matar', cantidad: clamp(Math.round(zona.radius / 80), 3, 6) };
    if (zona.type === 'pvp') return { tipo: 'matar', cantidad: clamp(Math.round(tam / 2), 3, 6) };
    return { tipo: 'matar', cantidad: clamp(Math.round(tam / 2), 3, 10) };
  }

  // Encargos propios y temáticos para cada una de las 12 zonas de caza de Valdris
  const VALDRIS_ENCARGOS = {
    z_1: {
      puebloId: 't_1', zoneName: 'Prados del Yunque Roto',
      nombre: 'Hilda la Curtidora', tema: 'curtidora de la muralla oriental de Albaferro', modelo: 'npc/aldeanos/aldeana.glb',
      titulo: 'Pieles manchadas de hierro',
      frase: 'Las manadas de {zona} merodean hasta los huertos de Albaferro con placas clavadas en el lomo. Abate {n} para despejar las granjas.',
      gracias: 'Albaferro vuelve a dormir tranquila esta noche. Toma tu paga y nuestras mejores bendiciones.'
    },
    z_2: {
      puebloId: 't_2', zoneName: 'Acantilados de la Marea Roja',
      nombre: 'Maestre Garrik', tema: 'capataz de muelle sin barcos en Puerto Brisal', modelo: 'npc/aldeanos/tabernero.glb',
      titulo: 'Limpieza en la Marea Roja',
      frase: 'Los vigías corruptos y carroñeros de {zona} asaltan cada carreta que baja hacia Puerto Brisal. Despeja {n} amenazas de los acantilados.',
      gracias: 'Por fin pueden salir los pescadores sin mirar atrás. Aquí tienes tu recompensa.'
    },
    z_3: {
      puebloId: 't_3', zoneName: 'Claro de la Savia Oscura',
      nombre: 'Elowen Guardabosques', tema: 'rastreadora de los robles antiguos de Robledal Sombrío', modelo: 'npc/aldeanos/cazador.glb',
      titulo: 'Savia envenenada en el claro',
      frase: 'La savia gris ha enloquecido a las fieras de {zona}. Abate a {n} criaturas antes de que crucen hacia Robledal Sombrío.',
      gracias: 'El bosque agradece cada bestia que apartas del claro. Acepta este oro y suministros.'
    },
    z_4: {
      puebloId: 't_3', zoneName: 'Laberinto del Seto Maldito',
      nombre: 'Capataz Thorne', tema: 'leñador veterano atrapado junto al lindero sur', modelo: 'npc/aldeanos/lenador.glb',
      titulo: 'Patrulla tras los setos',
      frase: 'Dentro de {zona} se ocultan esbirros oscuros y bestias de quitina que vigilan remesas ilegales. Derrota a {n} dentro del laberinto.',
      gracias: 'Has quebrado su vigilancia entre los setos. Todo Robledal Sombrío te debe una.'
    },
    z_5: {
      puebloId: 't_4', zoneName: 'Marismas del Silencio',
      nombre: 'Boticaria Morwen', tema: 'destiladora de Limoquieto que vigila la pureza del cieno', modelo: 'npc/aldeanos/herbolario.glb',
      titulo: 'Plaga de las marismas',
      frase: 'Los vertidos de las fraguas han multiplicado las alimañas de {zona}. Reduce {n} monstruos del pantano para que Limoquieto respire.',
      gracias: 'Las aguas bajas se calman por fin. Lleva estas monedas y mi bálsamo.'
    },
    z_6: {
      puebloId: 't_1', zoneName: 'Desfiladero del Óxido',
      nombre: 'Contrabandista Rurik', tema: 'arriero de rutas libres hacia Ámbar de Dunas', modelo: 'npc/aldeanos/mercader.glb',
      titulo: 'Escolta en el Desfiladero',
      frase: 'En {zona} los constructos y jabalíes blindados cierran el puente oriental. Tumba a {n} guardianes para reabrir la ruta de caravanas.',
      gracias: 'La ruta hacia el desierto vuelve a quedar despejada. Oro bien ganado.'
    },
    z_7: {
      puebloId: 't_5', zoneName: 'Cañón del Pacto de Arena',
      nombre: 'Adivina Sahira', tema: 'cronista de las dunas en Ámbar de Dunas', modelo: 'npc/aldeanos/informante.glb',
      titulo: 'Centinelas de la arenisca',
      frase: 'Las tormentas desenterraron guardianes antiguos en {zona}. Derrota a {n} en el cañón antes de que sepulten a los viajeros.',
      gracias: 'Las dunas guardan tu nombre con respeto. Toma esta recompensa.'
    },
    z_8: {
      puebloId: 't_6', zoneName: 'Costa de las Brumas Boreales',
      nombre: 'Teniente Jorvik', tema: 'explorador boreal de Atalaya de Escarcha', modelo: 'npc/aldeanos/lenador.glb',
      titulo: 'Romper el cerco de la taiga',
      frase: 'Las patrullas de {zona} cortan nuestros envíos desde el sur. Abate a {n} enemigos para asegurar la costa boreal.',
      gracias: 'Con el flanco limpio, Atalaya de Escarcha resiste un día más.'
    },
    z_9: {
      puebloId: 't_6', zoneName: 'Estribaciones del Ventisquero',
      nombre: 'Vigía Freya', tema: 'centinela de las nieves altas', modelo: 'npc/aldeanos/cazador.glb',
      titulo: 'Bestias del ventisquero',
      frase: 'Los elementales de {zona} escoltan convoyes hacia el cráter. Vence a {n} bestias de élite en la ventisca.',
      gracias: 'Ni la helada pudo frenar tu acero. Recibe el agradecimiento de la atalaya.'
    },
    z_10: {
      puebloId: 't_5', zoneName: 'Garganta de Obsidiana',
      nombre: 'Maestro Dain', tema: 'exminero fugado de las galerías volcánicas', modelo: 'npc/aldeanos/campesino.glb',
      titulo: 'Ecos en la obsidiana',
      frase: 'Quienes cruzan {zona} no regresan por culpa de los colosos de piedra negra. Destruye a {n} guardianes en la garganta.',
      gracias: 'Has abierto una brecha en la roca viva. Toma este pago.'
    },
    z_11: {
      puebloId: 't_7', zoneName: 'Paso del Dragón Blanco',
      nombre: 'Cazador Ulric', tema: 'rastreador de guivernos en los riscos del norte', modelo: 'npc/aldeanos/cazador.glb',
      titulo: 'Alas sobre el paso blanco',
      frase: 'Guivernos y fieras glaciares cazan en {zona} a todo explorador que sube hacia Trono de Ceniza. Abate {n} presas.',
      gracias: 'El paso alpino vuelve a ser transitable. Buen acero, camarada.'
    },
    z_12: {
      puebloId: 't_7', zoneName: 'Cráter del Sol Quebrado',
      nombre: 'Heroldo Darion', tema: 'superviviente del asedio en el Cráter del Sol Quebrado', modelo: 'npc/aldeanos/informante.glb',
      titulo: 'El fin del Titán del Eclipse',
      frase: 'El señor supremo de {zona} alimenta toda la maquinaria del Cónclave. Derrota al jefe del cráter y libera Valdris para siempre.',
      gracias: '¡La pesadilla de Valdris ha caído! Las campanas cantarán tu hazaña.'
    }
  };

  function definicionValdrisDe(zona) {
    if (!zona || zona._genericoTest) return null;
    const def = VALDRIS_ENCARGOS[zona.id];
    return (def && def.zoneName === zona.name) ? def : null;
  }

  // Encargo completo de una zona. Es determinista: la misma zona siempre tiene el mismo personaje y texto.
  function misionDeZona(zona, pueblo) {
    const valdrisDef = definicionValdrisDe(zona);
    if (valdrisDef && pueblo) {
      const objetivo = objetivoDe(zona);
      const nivel = zona.levelMin || 1;
      return {
        zona: zona.id,
        zonaNombre: zona.name,
        pueblo: pueblo ? pueblo.id : null,
        puebloNombre: pueblo ? pueblo.name : '',
        npc: {
          id: 'enc-' + zona.id,
          nombre: valdrisDef.nombre,
          tema: valdrisDef.tema,
          modelo: valdrisDef.modelo,
          frase: sustituir(valdrisDef.frase, zona.name, objetivo.cantidad)
        },
        titulo: valdrisDef.titulo,
        texto: sustituir(OBJETIVOS[objetivo.tipo](objetivo.cantidad), zona.name, objetivo.cantidad),
        gracias: valdrisDef.gracias,
        objetivo,
        recompensa: {
          oro: 25 * nivel,
          vida: nivel >= 5 ? 2 : 1,
          mana: nivel >= 3 ? 1 : 0,
          puntos: objetivo.tipo === 'jefe' ? 1 : 0
        }
      };
    }
    const h = hash(String(zona.id));
    const tipo = ENCARGOS[zona.type] ? zona.type : 'caza';
    const plantillas = ENCARGOS[tipo];
    const plantilla = plantillas[h % plantillas.length];
    const persona = PERSONAJES[(h >>> 4) % PERSONAJES.length];
    const objetivo = objetivoDe(zona);
    const nivel = zona.levelMin || 1;
    return {
      zona: zona.id,
      zonaNombre: zona.name,
      pueblo: pueblo ? pueblo.id : null,
      puebloNombre: pueblo ? pueblo.name : '',
      npc: {
        id: 'enc-' + zona.id,
        nombre: persona.nombre,
        tema: persona.tema,
        modelo: persona.modelo || MODELOS[(h >>> 8) % MODELOS.length],
        frase: sustituir(plantilla.frase, zona.name, objetivo.cantidad)
      },
      titulo: plantilla.titulo,
      texto: sustituir(OBJETIVOS[objetivo.tipo](objetivo.cantidad), zona.name, objetivo.cantidad),
      gracias: plantilla.gracias,
      objetivo,
      recompensa: {
        oro: 20 * nivel,
        vida: nivel >= 5 ? 2 : 1,
        mana: nivel >= 3 ? 1 : 0,
        puntos: objetivo.tipo === 'jefe' ? 1 : 0
      }
    };
  }

  // Un encargo por zona, cada uno con su comarca en Valdris o el pueblo más cercano. pueblos: lista de {id, name, x, y}
  function encargosDeMundo(zonas, pueblos) {
    if (!pueblos || !pueblos.length) return [];
    const porId = new Map(pueblos.map(p => [p.id, p]));
    return (zonas || []).map(z => {
      const def = definicionValdrisDe(z);
      const pueblo = (def && def.puebloId && porId.get(def.puebloId)) || puebloMasCercano(z, pueblos);
      return misionDeZona(z, pueblo);
    });
  }

  // Contexto narrativo de cada encargo vecinal dentro de la crisis del reino
  function contextoNarrativoZona(mision, pasoHistoria, world) {
    const paso = typeof pasoHistoria === 'number' ? pasoHistoria : 0;
    const lugar = (mision && mision.puebloNombre) || 'la aldea';
    if (paso >= 16) {
      return `Epílogo · Reconstrucción libre de ${lugar}: tras caer los Sabios conspiradores, los vecinos limpian los últimos focos salvajes de la región.`;
    }
    if (paso >= 11) {
      return `Acto III–IV · Rutas en disputa: con el monopolio roto y la guardia de Kaelen de lado del pueblo, cada encargo consolida los suministros de ${lugar}.`;
    }
    return `Acto I–II · Impacto de la plaga: la falta de escoltas del cónclave deja a los aldeanos de ${lugar} indefensos frente a las bestias alteradas.`;
  }

  const api = { PERSONAJES, MODELOS, ENCARGOS, misionDeZona, encargosDeMundo, puebloMasCercano, objetivoDe, contextoNarrativoZona };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MisionZonaLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
