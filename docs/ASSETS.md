# Assets (texturas, modelos y sonidos)

Lista de todo lo que no se ha creado a mano en el proyecto: de dónde sale, con qué licencia y dónde se usa.
Regla: solo packs con licencia libre (CC0 o equivalente). Cada entrada debe tener fuente, licencia y uso.

## Texturas de terreno (G1)

Fuente: **ambientCG** (https://ambientcg.com), licencia **CC0 1.0** (dominio público, sin obligación de atribución).

| Archivo | Pack de ambientCG | Uso en el terreno |
|---|---|---|
| `assets/terreno/hierba.jpg` | Grass001 | Hierba (praderas, bosques). |
| `assets/terreno/tierra.jpg` | Ground037 | Tierra y caminos sin asfaltar (zonas de paso, pantano). |
| `assets/terreno/roca.jpg` | Rock030 | Roca en pendientes y montañas. |
| `assets/terreno/nieve.jpg` | Snow003 | Cumbres y tundra. |
| `assets/terreno/arena.jpg` | Ground054 | Arena (costa y desierto). |

Notas:
- La arena es Ground054 porque los packs de arena (Sand001 a Sand003) no estaban disponibles al descargarlos.
  Si se encuentra un pack de arena mejor, se cambia solo este archivo.
- Se usa solo el mapa de color (`*_Color.jpg`) de la versión 1K de cada pack. Los mapas de normales, rugosidad y
  desplazamiento no se usan todavía.
- Las imágenes se redujeron a 1024 × 1024 px con `LANCZOS` y calidad JPEG 82. El script es
  `scratchpad/extract.py` (no se incluye en el repositorio). Solo extrae el color de cada zip y no ejecuta nada de él.
- **Pendiente:** la decisión de `docs/GRAFICOS.md` pide 2048 px en ordenador. Hoy solo hay 1K; la versión 2K de los
  mismos packs se descargará cuando se haga G7 (calidad y rendimiento).
- Los nombres de los archivos del repositorio están en español para que coincidan con el resto del proyecto. La
  lista de rutas la usa `loadTerrainTextures` en `visor-mundo.html`.

## Árboles (pueblos)

Fuente: **Kenney — Nature Kit 2.1** (https://kenney.nl/assets/nature-kit), licencia **CC0 1.0**. Los cuatro modelos
llegaron en el repositorio `narcimarquez-eng/CochesHuelva` (carpeta `modelos/arboles/`, con su `catalogo.json`).
La licencia completa está en `assets/arboles/LICENCIA-kenney-nature-kit.txt`.

| Especie | Modelo | Altura | Triángulos | Uso |
|---|---|---|---|---|
| `roble` | roble.glb | 9 m | 196 | Árboles de copa redonda, junto a casas y en el bosque. |
| `alamo` | alamo.glb | 11 m | 72 | Árboles de copa estrecha. |
| `pino` | pino.glb | 10,5 m | 230 | Coníferas del bosque. |
| `arbusto` | arbusto.glb | 1,6 m | 104 | Arbustos bajos. |

- Los modelos se incrustan en `js/arboles.js` con `node tools/generar-arboles.js <carpeta> js/arboles.js`
  (no se editan a mano). La textura es una paleta de 16 × 16 px del propio modelo.
- Se tiñen hacia un verde natural (color del material 0,55 / 0,92 / 0,42) para que el follaje no salga azulado.
  La textura original no se modifica.

## Vallas

No hay un modelo de valla con licencia verificada: la búsqueda en Kenney (Fantasy Town Kit) no confirmó que
incluya vallas ni archivos GLB. Por eso las vallas son **procedurales** (un tablero de 4,5 m por tramo),
creadas en el propio código, sin fuente externa.

## Calzadas

No se ha añadido textura nueva de calzada. Las búsquedas no encontraron un adoquín con licencia CC0 y 1K JPG
verificada en ambientCG (la página de búsqueda no lista ese asset). Las calzadas usan el atlas que ya tiene el
pueblo; los tipos calle, calzada y sendero se distinguen por anchura.

## Pendiente de añadir

| Fase | Qué | Fuente prevista |
|---|---|---|
| G3 | Rocas y hierba (los árboles ya están) | Packs gratuitos con licencia libre (por confirmar). |
| G4 | Monstruos y personaje | GLB propio del personaje; modelos de monstruos por confirmar. |
| G2 | Agua y cielo | Sin archivos: se hará con shaders. |
