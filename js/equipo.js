/*
 * equipo.js — Clases y armaduras por niveles (sin gráficos). Ver docs/EQUIPO.md.
 * Expone window.EquipoLib (o module.exports en Node para las pruebas).
 *
 * Al crear el personaje se generan todas las armaduras de su clase a lo largo del juego.
 * Empieza con la primera (la cota) y las demás se equipan al alcanzar el nivel mínimo.
 */
(function (root) {
  "use strict";

  // Líneas de armadura por clase. Cada tramo (tier) exige un nivel mínimo de héroe.
  const CLASES = {
    guerrero: {
      name: 'Guerrero',
      lineas: {
        ligera: {
          name: 'Ligera',
          tiers: [
            { nombre: 'Cota de malla', nivel: 1, defensa: 4 },
            { nombre: 'Cota de malla reforzada', nivel: 4, defensa: 7 },
            { nombre: 'Cota de malla templada', nivel: 8, defensa: 10 },
            { nombre: 'Cota de malla de adamante', nivel: 12, defensa: 14 }
          ]
        },
        pesada: {
          name: 'Pesada',
          tiers: [
            { nombre: 'Coraza de placas', nivel: 5, defensa: 9 },
            { nombre: 'Armadura de placas', nivel: 9, defensa: 13 },
            { nombre: 'Armadura de placas templada', nivel: 13, defensa: 17 },
            { nombre: 'Armadura de placas de adamante', nivel: 17, defensa: 22 }
          ]
        }
      }
    },
    mago: {
      name: 'Mago',
      lineas: {
        tunica: {
          name: 'Túnica',
          tiers: [
            { nombre: 'Túnica de aprendiz', nivel: 1, defensa: 2 },
            { nombre: 'Túnica de runas', nivel: 4, defensa: 4 },
            { nombre: 'Túnica arcana', nivel: 8, defensa: 6 },
            { nombre: 'Túnica de archimago', nivel: 12, defensa: 9 }
          ]
        }
      }
    }
  };

  // La armadura con la que sale el personaje: el primer tramo de la primera línea
  function lineaInicial(clase) {
    const c = CLASES[clase];
    if (!c) throw new Error('Clase desconocida: ' + clase);
    return Object.keys(c.lineas)[0];
  }

  // Todas las armaduras de una clase, ordenadas por nivel mínimo. Cada una tiene un id estable.
  function generarArmaduras(clase) {
    const c = CLASES[clase];
    if (!c) throw new Error('Clase desconocida: ' + clase);
    const lista = [];
    Object.keys(c.lineas).forEach(linea => {
      c.lineas[linea].tiers.forEach((t, i) => {
        lista.push({
          id: clase + '.' + linea + '.' + (i + 1),
          clase, linea,
          lineaNombre: c.lineas[linea].name,
          tier: i + 1,
          nombre: t.nombre,
          nivelMin: t.nivel,
          defensa: t.defensa
        });
      });
    });
    return lista.sort((a, b) => a.nivelMin - b.nivelMin || a.id.localeCompare(b.id));
  }

  // Personaje nuevo: clase, todas sus armaduras y la cota inicial equipada
  function crearPersonaje(clase) {
    const armaduras = generarArmaduras(clase);
    const inicial = armaduras.find(a => a.linea === lineaInicial(clase) && a.tier === 1);
    return { clase, armaduras, equipada: inicial.id };
  }

  function puedeEquipar(armadura, nivel) {
    return nivel >= armadura.nivelMin;
  }

  // Armaduras que el héroe ya puede equipar con ese nivel
  function disponibles(personaje, nivel) {
    return personaje.armaduras.filter(a => puedeEquipar(a, nivel));
  }

  // Equipa una armadura por id. Lanza un error si no existe o si el nivel no basta.
  function equipar(personaje, id, nivel) {
    const armadura = personaje.armaduras.find(a => a.id === id);
    if (!armadura) throw new Error('Armadura no disponible para esta clase: ' + id);
    if (!puedeEquipar(armadura, nivel)) {
      throw new Error(armadura.nombre + ' requiere nivel ' + armadura.nivelMin);
    }
    personaje.equipada = id;
    return armadura;
  }

  // Mejor armadura que el héroe puede llevar ahora (la de más defensa entre las disponibles)
  function mejorDisponible(personaje, nivel) {
    return disponibles(personaje, nivel).reduce((mejor, a) => (!mejor || a.defensa > mejor.defensa ? a : mejor), null);
  }

  // Asigna el modelo GLB de un tramo: { nombre, url }. Con null quita el modelo.
  function asignarModelo(personaje, id, modelo) {
    const armadura = personaje.armaduras.find(a => a.id === id);
    if (!armadura) throw new Error('Armadura no disponible para esta clase: ' + id);
    armadura.modelo = modelo || null;
    return armadura;
  }

  // Armaduras de la clase que todavía no tienen modelo GLB
  function sinModelo(personaje) {
    return personaje.armaduras.filter(a => !a.modelo);
  }

  const api = { CLASES, lineaInicial, generarArmaduras, crearPersonaje, puedeEquipar, disponibles, equipar, mejorDisponible, asignarModelo, sinModelo };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EquipoLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
