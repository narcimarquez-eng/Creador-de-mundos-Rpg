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

Fuente: **ez-tree** (MIT, Daniel Greenheck), usado en el proyecto New-Rol
(https://github.com/narcimarquez-eng/New-Rol). Los árboles se generan con sus presets y se hornean en
`js/arboles.js` con `tools/hornear-arboles.mjs`. Texturas de corteza y hojas CC0 (Poly Haven y TextureCan, vía New-Rol),
reducidas con `tools/reducir-texturas-arboles.py`. Licencias en `assets/arboles/LICENCIA.md`.

| Especie | Preset de ez-tree | Altura | Textura de corteza | Hojas |
|---|---|---|---|---|
| `roble` | Oak Medium | 9,5 m | roble | roble |
| `alamo` | Aspen Medium | 10,5 m | abedul | álamo |
| `pino` | Pine Medium | 11 m | pino | pino |
| `arbusto` | Bush 1 | 2 m | roble | roble |

- Dos niveles de detalle: «cerca» (junto al pueblo, con más hojas) y «lejos» (el bosque, con menos ramas y hojas).
  El nivel depende de la distancia al pueblo (25 m más allá de su borde).
- Coste medido (ramas + hojas): el nivel cercano tiene entre 3.700 (álamo) y 10.700 (roble) triángulos por árbol,
  y el lejano entre 1.400 (arbusto) y 4.500 (pino). Sigue siendo alto para móviles con muchos árboles;
  se ajustará en G7 (calidad y rendimiento).
- El follaje se tiñe hacia un verde natural (color del material 0,55 / 0,92 / 0,42).

## Vallas

No hay un modelo de valla con licencia verificada, así que las vallas son **procedurales** (un tablero de 4,5 m por tramo).

## Calzadas

No se ha añadido textura nueva de calzada: no se encontró un adoquín CC0 verificado en ambientCG. Las calzadas usan el
atlas del pueblo; los tipos calle, calzada y sendero se distinguen por su anchura.

## Rocas y setos

Las rocas son icosaedros con relieve irregular generados por código, sin textura externa. Los setos son cajas procedurales.

## Enemigos (generación procedural)

Fuente: el editor «Enemigo-rpg» de la misma cuenta (https://github.com/narcimarquez-eng/enemigo-rpg). Se copian
`enemyBuilder.ts`, `proceduralTextures.ts` y `types/enemy.ts` a `tools/enemigos-src/` y se compilan a
`js/enemigos.js` con `node tools/hornear-enemigos.mjs`. El repositorio no declara licencia; antes de publicar el
juego conviene confirmar el uso del código con su autor. Los modelos no son archivos: se construyen en el navegador,
y las animaciones se calculan cada fotograma.

Coste medido en Three r128 (40 arquetipos, mallas visibles). Sin optimizar: 73 mallas y 3.685 triángulos de media.
Con `js/enemigos-optimizar.js`: 35 mallas (−52 %). Con calidad baja además: 1.871 triángulos (−49 %). El visor quita
las hitboxes de depuración (líneas verdes y rojas), que antes se veían encima de cada enemigo.

Efectos de combate (`js/enemigos-combate.js`), encima de la animación base: golpe con el brazo y el torso; magia
con los dos brazos alzados, el núcleo brillando y un proyectil; reacción al golpe con destello rojo y empujón; y la
muerte, que dura un segundo antes de desaparecer. El enemigo mágico se elige por raza (`magical`) o arma (`arcane_staff`,
`dragon_breath_maw`); el resto usa golpe.

## Pendiente de añadir

| Fase | Qué | Fuente prevista |
|---|---|---|
| G3 | Hierba y arbustos de hoja | Packs gratuitos con licencia libre (por confirmar). |
| G4 | Monstruos y personaje | GLB propio del personaje; modelos de monstruos por confirmar. |
| G2 | Agua y cielo | Sin archivos: se hará con shaders. |
