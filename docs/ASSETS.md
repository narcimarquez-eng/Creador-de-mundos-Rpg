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

## Pendiente de añadir

| Fase | Qué | Fuente prevista |
|---|---|---|
| G3 | Árboles, rocas y hierba | Packs gratuitos con licencia libre (por confirmar). |
| G4 | Monstruos y personaje | GLB propio del personaje; modelos de monstruos por confirmar. |
| G2 | Agua y cielo | Sin archivos: se hará con shaders. |
