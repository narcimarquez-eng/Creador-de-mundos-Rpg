# Prueba: visor con Three r186 frente a r128

Rama local `prueba-three` (no subida). Copia del visor en `visor-prueba-three.html`, con el mismo código del juego
y un puente en `js/three-puente.js` que deja `THREE` como global, como en r128. Los archivos originales no cambian.

## Qué se ha comprobado

- **Carga:** sin errores de página. Único 404: `personaje.glb`, que también aparece en r128 (el archivo no está en el
  repositorio). No se han probado las animaciones del personaje.
- **Geometría:** un render completo de la vista general da 1.620.104 triángulos en r186 y 1.620.222 en r128.
  Llamadas de dibujo: 718 en r186 y 710 en r128. La escena es la misma.
- **Aspecto (medido sobre las capturas, zona 3D):**

  | Vista | Luminosidad r128 | Luminosidad r186 | Saturación r128 | Saturación r186 |
  |---|---|---|---|---|
  | General | 0,707 | 0,599 | 0,608 | 0,363 |
  | Juego | 0,534 | 0,365 | 0,396 | 0,221 |
  | Pueblo | 0,513 | 0,464 | 0,500 | 0,415 |

  En r186 todo se ve más oscuro y menos saturado. En la vista de juego la pérdida es la mayor.

## Qué se ha probado para igualarlo

1. **Texturas de color como sRGB.** En r186 las texturas se tratan como lineales si no se declara lo contrario.
   Solo cambia la vista del pueblo (luminosidad 0,464 → 0,418 y saturación 0,415 → 0,430). En la vista general no cambia nada.
2. **Luces × π.** No tiene efecto. El visor escribe las intensidades de las luces en cada fotograma según la atmósfera,
   así que el ajuste se pierde. Para tocar la iluminación hay que cambiar los valores de `ATMOSPHERES`.

Ninguno de los dos ajustes iguala los valores de r128. La causa no está aislada.

## Conclusión

- **Funcionalidad:** r186 es compatible con el visor. Mismo número de triángulos y de llamadas, sin errores.
- **Aspecto:** no es compatible sin ajuste. Hay que retocar `ATMOSPHERES` y las texturas, y comprobarlo en cada estilo y en
  cada hora del día.
- **Rendimiento real:** no medido. La prueba corre en SwiftShader, sin GPU, y no hay medición en móvil.

## Notas

- Las cifras de la sección anterior no son comparables con `docs/RENDIMIENTO.md`: allí el mundo usaba el trazado
  clásico, y el mundo de prueba usa ahora el trazado por manzanas.

## Creador de pueblos con r186 (`creador-prueba-three.html`)

- **Funciona:** mismas estadísticas que r128 (16 casas, 365 colisiones, 187 árboles). Triángulos 1.793.448 frente a
  1.793.720 y 389 llamadas en ambas. Sin errores de página salvo el 404 de `personaje.glb`, que ya existía.
- **Aspecto:** distinto. Con r128 el terreno sale pálido, casi de nieve, y el río celeste. Con r186 el verde es más
  oscuro y saturado, y el agua azul profunda. La luminosidad media baja de 0,74 a 0,41; la saturación se mantiene
  (0,42 frente a 0,42).
- **Cambio de código:** `renderer.outputEncoding = THREE.sRGBEncoding` pasa a
  `renderer.outputColorSpace = THREE.SRGBColorSpace`. En r186 la salida sRGB ya es la opción por defecto.
- **Pendiente:** decidir qué aspecto es el bueno. Los estilos y la paleta de terreno se afinaron mirando r128, así que
  habría que retocarlos para acercarse a esa versión, o aceptar el nuevo aspecto y ajustar desde ahí.

## Enemigos en la versión de prueba (r186)

`visor-prueba-three.html` tiene los mismos enemigos que el visor r128 de la rama principal: modo por niveles o aleatorio,
modelo del editor «Enemigo-rpg», optimización de mallas, efectos de golpe, magia y reacción al daño.

- **Comparación justa** (un render completo, con enemigos construidos y el personaje en la misma posición):
  r128: 1.808.838 triángulos y 534 llamadas. r186: 1.802.676 triángulos y 537 llamadas.
- **Carga:** `js/enemigos.js` se compila con un `footer` que publica `EnemyLib` como global, porque en el visor
  de r186 los scripts son módulos ES.
- **Pendiente:** comparar el aspecto con luminosidad y saturación, como con el pueblo y el creador.
