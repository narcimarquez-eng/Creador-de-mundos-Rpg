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

Las calzadas del mundo (`kind: calzada`) son procedurales: losas irregulares sombreadas en el material del visor
(celdas Voronoi en el shader, sin imagen), con juntas oscuras y bordillos a los dos lados. Las fotos de referencia de
calzadas romanas no se usan como textura porque su licencia no está verificada. Las calles de los pueblos siguen con el
atlas del pueblo; los tipos calle, calzada y sendero se distinguen por su anchura.

## Arbustos (matorrales del campo)

Fuente: **Kenney Nature Kit** (kenney.nl), licencia **CC0 1.0**. El modelo viene del repositorio de la misma cuenta
`CochesHuelva` (`modelos/arboles/arbusto.glb`). Está en `assets/vegetacion/arbusto.glb`, con 104 triángulos y una
textura, y su licencia en `assets/vegetacion/LICENCIA-kenney-nature-kit.txt`. El visor lo escala a 1,6 m de alto y
lo coloca en `js/decorado.js` como matorral (instanciado). Si no carga, se usan matorrales de código.

## Props realistas de New-Rol (rocas, arbustos y setos)

Fuente: `js/props-newrol.js`, portado del modo realista de `New-Rol` (de la misma cuenta). Son geometrías generadas
por código, sin archivos de terceros:
- `rocaGeo`: canto suelto del modo realista (`boulderGeoReal` de New-Rol), con ruido fbm.
- `arbolPartes('arbusto')` y `arbolPartes('seto')`: arbustos y setos de ez-tree (Bush 1 y Bush 3 de New-Rol),
  horneados en `js/arboles.js` con `tools/hornear-arboles.mjs`, con corteza y hojas recortadas.

Se usan en `js/decorado.js`: las rocas con material PBR, los matorrales con el arbusto de ez-tree y los setos en las
lindes de los campos. El repositorio New-Rol no declara licencia de su código propio; como es de la misma cuenta, se
usa tal cual, pero conviene confirmarlo antes de publicar el juego.

Los modelos del arbusto de Kenney (CC0, `assets/vegetacion/arbusto.glb`) quedan como respaldo si no se carga TreeLib.

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
muerte, que dura un segundo antes de desaparecer. El daño del enemigo llega cuando el golpe o el proyectil alcanzan al héroe (proyectil: al final de su recorrido, hasta la posición del héroe), no al empezar el gesto. El enemigo mágico se elige por raza (`magical`) o arma (`arcane_staff`,
`dragon_breath_maw`); el resto usa golpe.

## Motor 3D

Three.js r186.1 (ES modules, con `importmap` desde jsDelivr). Los scripts del juego esperan `THREE` como global:
`js/three-puente.js` lo deja preparado. Las herramientas de horneado (`tools/`) usan la misma versión.

## Pendiente de añadir

| Fase | Qué | Fuente prevista |
|---|---|---|
| G3 | Hierba y arbustos de hoja | Packs gratuitos con licencia libre (por confirmar). |
| G4 | Monstruos y personaje | GLB propio del personaje; modelos de monstruos por confirmar. |
| G2 | Agua y cielo | Sin archivos: se hará con shaders. |
