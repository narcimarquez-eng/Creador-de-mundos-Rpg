# Assets (texturas, modelos y sonidos)

Lista de todo lo que no se ha creado a mano en el proyecto: de dónde sale, con qué licencia y dónde se usa.
Regla: solo packs con licencia libre (CC0 o equivalente). Cada entrada debe tener fuente, licencia y uso.

## Texturas de terreno (atlas de 100)

`assets/terreno/atlas.jpg`: 100 texturas reales de ambientCG (licencia CC0), a 256 px, en un atlas de 10 × 10 y
con el orden de `assets/terreno/atlas.json`. Clases: hierba (0–14), tierra y arcilla (15–55), roca (56–70),
arena y grava (71–89) y nieve (90–99). El suelo usa solo tres texturas parecidas por clase (`CAPAS` en
`js/terreno.js`; la arena toma alguna arenosa de «tierra»), copiadas a una textura array que repite sin
costuras. Se mezclan con manchas de ruido grandes e irregulares, sin celdas; lejos (más de 120–600 m) la
repetición pasa de 8 a 32 m. Las texturas se bajaron de ambientCG en su versión 1K-JPG y se redujeron a 256 px.


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

## Agua, lagos y oasis

- `assets/agua/waternormals.jpg`: normales del agua copiadas de `public/assets/tex/waternormals.jpg` de New-Rol
  (misma cuenta; el repositorio no declara licencia para sus recursos). Confirmar antes de publicar.
- `js/lagos.js`: lagos en praderas y montañas, oasis y arenas movedizas en el desierto. Son huecos del relieve
  generados en código (sin archivos de terceros); el agua usa el mismo tono y las mismas normales que New-Rol.

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

## Decoración variada del campo

`js/props-variados.js`: 310 variantes procedurales en 12 familias (rocas, lajas, troncos caídos, tocones, ramas,
setas, pilas de piedra, helechos, cactus, palmeras, juncos y restos de madera). Sin archivos de terceros; cada
variante sale de una semilla fija. La colocación depende del bioma.

## Simplificador de mallas (meshoptimizer)

`js/vendor/meshopt_simplifier.js`: módulo de navegador de [meshoptimizer](https://github.com/zeux/meshoptimizer)
1.3 (licencia MIT, `js/vendor/LICENSE-meshoptimizer-MIT.md`). El visor lo usa para la versión lejana de los
monstruos; `tools/simplificar-npcs.mjs` usa el mismo paquete en Node para las versiones lejanas de los NPCs.

## Texturas de casas, suelos y setos (assets/texturas)

50 texturas de 512 × 512 px recortadas de las hojas de referencia y hechas repetibles (mezcla con su
copia desplazada media baldosa): `tejados/`, `madera/` (travesaños de cabaña), `suelo/` (suelo con piedras),
`agua/` y `piedra/` (paredes de casa), cada una de `t01.jpg` a `t10.jpg` con la numeración de la hoja; y en `setos/` 4 paneles de hojas con silueta transparente (`s01.png` a `s04.png`, más las 10 muestras previas `t01.jpg`–`t10.jpg`) para setos orgánicos con recorte alfa (`alphaTest`). Los
nombres de cada una están en `CasasGLBLib.TEXTURAS` (`js/casas-glb.js`). Las de agua T-03 y T-08 y algunas de
madera traían perspectiva en la foto, así que su costura se nota algo más.

## Casas GLB del pueblo (glb/pueblo)

`tools/preparar-casas-glb.mjs` los genera a partir de los originales de `tools/datos/casas-origen/`
(`node tools/preparar-casas-glb.mjs`, con las dependencias de `tools/package.json` instaladas):

- `casa_entramado.glb` y `cabana.glb`, cada una con su `*_lejos.glb` (texturas de 128 px y menos triángulos:
  ~5.000 frente a ~16.000 la cabaña; la casa de entramado ya es ligera).
- `piezas/`: fuente, banco, barril, leñera, tocón con hacha, farol (pilar con farolillo), jardinera, jardinera con
  árbol, valla, muro del patio con su empedrado, y pino; separadas por componentes de la cabaña con patio.
- Materiales con nombre de papel (`tejado`, `madera`, `piedra`, `madera_troncos`…): `js/casas-glb.js` cambia su
  textura por otra de `assets/texturas/` para sacar variantes. El tejado de la casa de entramado está pintado en
  el atlas de la fachada; la herramienta lo separa por inclinación y le añade UV planas (`uv1`) para las tejas.

En el pueblo (`js/village-core.js`, campo `casas` de la configuración): `glb` pone todas las casas con estos
modelos y `variada` (por defecto) mezcla GLB, cabañas de madera y casas de siempre. Cada casa GLB lleva un giro
(±7°) y un tamaño propios, una de 3 variantes de textura por modelo, piezas sueltas a su alrededor (barriles,
leñera, tocón, banco, farol) y cambia a la versión lejana a más de 70 m de la cámara.
