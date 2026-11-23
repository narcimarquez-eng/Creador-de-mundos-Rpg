const fs = require('fs');
const path = require('path');

// Probar sintaxis y ejecución de dungeon-generator.js
try {
  const DG = require('./Creador-de-mundos-Rpg/js/dungeon-generator.js');
  console.log('DungeonGenerator cargado correctamente');
  console.log('Estilos disponibles:', Object.keys(DG.ESTILOS_PIEDRA).length);
} catch (e) {
  console.error('Error cargando DungeonGenerator:', e);
}
