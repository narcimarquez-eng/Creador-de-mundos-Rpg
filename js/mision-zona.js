/*
 * mision-zona.js — Encargos de zona: cada zona de combate tiene un NPC en el pueblo más cercano que le encarga
 * una misión. Son independientes de la historia (la crónica) y se derivan de los datos de la zona, así que una
 * zona nueva tiene su encargo sin tocar el mundo guardado. Sin gráficos.
 * Expone window.MisionZonaLib (o module.exports en Node para las pruebas).
 */
(function (root) {
  "use strict";

  // Personajes de los encargos: nombre, oficio y el modelo de npc/gurus/ que usan
  const PERSONAJES = [
    { nombre: 'Doña Hilde', tema: 'remendona de botas, la que cose hasta las piedras' },
    { nombre: 'Tomasa Pico', tema: 'pastora de gansos con mal genio' },
    { nombre: 'Ferran el Cojo', tema: 'cazador jubilado que aún cuenta las huellas' },
    { nombre: 'Mara la Tuerta', tema: 'vendedora de rumores en la plaza' },
    { nombre: 'Abuelo Ruvo', tema: 'criador de gallinas muy valientes' },
    { nombre: 'Brisa Tamborilera', tema: 'músico ambulante que conoce todos los caminos' },
    { nombre: 'Teo Remiendos', tema: 'aprendiz de tintorero con las manos teñidas' },
    { nombre: 'Sol Ardida', tema: 'molinera que oye los trigales de noche' },
    { nombre: 'Peregrino Ilan', tema: 'viajero que perdió los zapatos en el bosque' },
    { nombre: 'Nina Latón', tema: 'cocinera del mesón, dueña de los chismes' },
    { nombre: 'Bruno el Cuervo', tema: 'guardia de la empalizada con muy buena vista' },
    { nombre: 'Clemencia Dedal', tema: 'costurera de capas para los aventureros' }
  ];
  const MODELOS = ['guru-1', 'guru-2', 'guru-3', 'guru-4', 'guru-5'];

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

  // Encargo completo de una zona. Es determinista: la misma zona siempre tiene el mismo personaje y texto.
  function misionDeZona(zona, pueblo) {
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
        modelo: MODELOS[(h >>> 8) % MODELOS.length],
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

  // Un encargo por zona, cada uno con el pueblo más cercano. pueblos: lista de {id, name, x, y}
  function encargosDeMundo(zonas, pueblos) {
    if (!pueblos || !pueblos.length) return [];
    return (zonas || []).map(z => misionDeZona(z, puebloMasCercano(z, pueblos)));
  }

  const api = { PERSONAJES, MODELOS, ENCARGOS, misionDeZona, encargosDeMundo, puebloMasCercano, objetivoDe };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MisionZonaLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
