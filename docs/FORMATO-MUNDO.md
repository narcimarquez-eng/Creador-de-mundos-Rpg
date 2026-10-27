# Formato `.mundo.json` (versión 1)

Archivo JSON que guarda un mundo completo. Lo produce el Creador de Mundos (exportar o almacenamiento del navegador) y lo leerá el juego.
Unidades en **metros**; `x, y` del mapa = `x, z` en 3D.

```jsonc
{
  "format": "rpg-world",        // siempre "rpg-world"
  "version": 1,                 // versión del formato
  "name": "Reino de Aden",
  "seed": 482913,               // semilla del terreno y biomas (no cambia)
  "rngState": 123456789,        // estado interno del azar para seguir generando de forma reproducible
  "nextId": 42,                 // contador para nuevos ids
  "created": "2026-10-26T18:00:00.000Z",
  "updated": "2026-10-26T18:30:00.000Z",
  "settings": {
    "townCount": 6,             // pueblos al generar
    "spacing": 1200,            // distancia típica entre pueblos
    "extraLinks": 0.35,         // probabilidad de caminos extra (0–1)
    "zonesPerRoad": 2,          // 0, 1 o 2
    "poiChance": 0.45,          // probabilidad de lugar de interés por zona (0–1)
    "metersPerLevel": 180,      // metros de camino por nivel recomendado
    "enemyMode": "niveles"      // enemigo de los monstruos sin elegir: "niveles" o "aleatorio"
  },
  "startTownId": "t_1",         // pueblo inicial (nivel 1)
  "towns": [ /* Pueblo */ ],
  "roads": [ /* Camino */ ],
  "zones": [ /* Zona */ ],
  "pois":  [ /* Lugar */ ]
}
```

## Pueblo
| Campo | Descripción |
|---|---|
| `id`, `name` | Identificador y nombre. |
| `x`, `y`, `radius` | Centro y radio aproximado del pueblo. |
| `biome` | Bioma donde está. |
| `level` | Nivel recomendado. |
| `isStart` | `true` si es el pueblo inicial. |
| `services` | Lista de servicios (`posada`, `tienda`, `herrero`, `gremio`…). |
| `cfg` | **Configuración exacta del Creador de Pueblos** (`style`, `terrainType`, `relief`, `seed`, `size`, `houseDensity`, `specialCount`, `maxFloors`, `roadWidth`, `curve`, `treeDensity`, `hasWalls`, `hasRiver`, `hasMagic`, `hasProps`, `hasLamps`, `hasFences`, `time`). Con ella el juego regenera el pueblo 3D idéntico. `edits` (ediciones a mano, ver abajo). |
| `notes` | Texto libre (historia, NPCs…). |

### Salidas del pueblo (`cfg.rotation` y `cfg.exits`)
El Creador de Pueblos genera cada pueblo en coordenadas **locales** con 4 calles principales que salen por las puertas
`E` (0°), `S` (90°), `W` (180°) y `N` (270°). Ángulos en grados con `atan2(z, x)`.

- `cfg.rotation`: giro del pueblo en el mundo, elegido para que sus puertas apunten a los caminos.
- `cfg.exits`: `[{ angle, gate, to, toId, roadId }]`, una por camino del mundo:
  - `angle`: dirección local por la que sale el camino, medida en el borde del terreno del pueblo.
  - `gate`: puerta por la que sale (`E`/`S`/`W`/`N`), o `null` si es una salida extra.
  - `to` / `toId` / `roadId`: pueblo destino y camino del mundo.

El mundo las recalcula solo al crear, mover o borrar caminos y pueblos.

En el Creador de Pueblos cada salida es una calle recta desde la plaza central hasta el borde del terreno. La
muralla tiene un hueco en el mismo ángulo (`angle`), así que el camino entra por esa puerta. Si la calle cruza el
río fuera del puente principal, se añade un puente pequeño. Cada salida lleva un cartel con su destino. El campo
`gate` ya no determina la geometría; se conserva por compatibilidad.

Para colocar el pueblo en el mundo (r = `rotation` en radianes), un punto local `(lx, lz)` pasa a:
```
x = town.x + lx·cos r − lz·sin r
y = town.y + lx·sin r + lz·cos r
```
El terreno del pueblo es un cuadrado de lado `max(240, (42 + 14·size + 65)·2)` m centrado en el pueblo.
`RPGWorld.exitWorldPoint(town, exit)` da el punto del mundo donde la salida enlaza con su camino.

### Ediciones del pueblo (`cfg.edits`)
Opcional. Son cambios hechos a mano en el Creador de Pueblos sobre la distribución generada:
```jsonc
"edits": {
  "base": "style=l2_fantasy;terrainType=valley;...;hasFences=true",  // distribución a la que pertenecen
  "ops": [
    { "op": "quitar-casa", "id": "-28:-32" },
    { "op": "mover-casa", "id": "28:13", "x": 40, "z": 50 },
    { "op": "añadir-casa", "id": "n1", "x": 60, "z": -70 },
    { "op": "quitar-calle", "id": "especial-2" },
    { "op": "mover-calle", "id": "anillo:28", "dx": 3, "dz": -2 },
    { "op": "añadir-calle", "id": "u1", "kind": "calle", "pts": [{ "x": -80, "z": 60 }, { "x": 80, "z": 60 }] },
    { "op": "mover-nodo-calle", "id": "u1", "i": 1, "x": 0, "z": 70 },
    { "op": "añadir-nodo-calle", "id": "u1", "i": 1, "x": 0, "z": 40 },
    { "op": "quitar-nodo-calle", "id": "u1", "i": 0 },
    { "op": "cambiar-tipo-calle", "id": "u1", "kind": "calzada" },
    { "op": "quitar-muro", "id": 5 },
    { "op": "puerta-muro", "id": 10 },
    { "op": "añadir-farola", "id": "g1", "x": 30, "z": -30 },
    { "op": "quitar-farola", "id": "f2" },
    { "op": "quitar-arbol", "id": "b3" },
    { "op": "añadir-arbol", "id": "a1", "x": 58, "z": 15, "especie": "pino" },
    { "op": "quitar-valla", "id": "-28:-32a" },
    { "op": "añadir-valla", "id": "c1", "x1": -60, "z1": -70, "x2": -40, "z2": -70 },
    { "op": "quitar-roca", "id": "r0" },
    { "op": "añadir-roca", "id": "p1", "x": 12, "z": -40, "escala": 1.2 },
    { "op": "quitar-seto", "id": "h-72:-13" },
    { "op": "añadir-seto", "id": "s1", "x": 20, "z": 35, "rot": 0.5 }
  ]
}
```
- `id` de una casa: `"<z>:<desplazamiento en x>"` de su hueco en la cuadrícula del pueblo. Las casas añadidas usan `n1`, `n2`… y no dependen de la cuadrícula.
- `id` de una calle: `principal`, `este-oeste-izq`, `este-oeste-der`, `anillo:<z>`, `especial-<n>` (acceso a un edificio especial), `acceso-<id de casa>` (camino de la puerta de una casa) o `u<n>` (calle dibujada).
- `mover-casa` da la posición final en metros (coordenadas del pueblo). `mover-calle` da el desplazamiento total desde su posición generada; también se aplica a las calles dibujadas.
- Calle dibujada (`u<n>`): `pts` son puntos de control. La calle pasa por ellos con una curva suave, muestreada cada 3,5 m. `kind` es `calle`, `calzada` (8,5 m) o `sendero` (3,4 m); `calle` usa la anchura del pueblo. Donde cruza el río se corta el camino y se pone un puente automático.
- `id` de un muro: número del tramo, de 0 a 35. `quitar-muro` quita el tramo con su torre; `puerta-muro` lo cambia por dos pilares con un dintel encima, dejando paso libre.
- `id` de una farola: `f<n>` para las de fábrica (n = orden en la generación) y `g<n>` para las nuevas.
- Las ediciones solo se aplican si `base` coincide con la configuración actual (semilla, tamaño, estilo, relieve, etc.). El giro y las salidas no cuentan. Si la base cambia, las ediciones se conservan pero no se aplican.
- Las calles de salida hacia el mundo no se pueden editar.
- `trazado` del pueblo: `manzanas` (por defecto en los mundos nuevos) o `clasico` (el trazado anterior, que es el que
  tienen los pueblos guardados sin este campo). Con `manzanas` los ids cambian: las calles son `calle-n<k>` (línea
  norte–sur) y `calle-e<k>` (este–oeste), y cada casa es `<i>.<j><lado><k>`, donde `lado` es `n`, `s`, `e` u `w`
  (la fachada da a la calle). Las vallas son `<casa>f1:<q>` y `<casa>f2:<q>` (frente, con la puerta en medio),
  `<casa>r:<q>`, `<casa>l:<q>` (solo el primer solar de cada fila) y `<casa>b:<q>` (fondo). Solo tienen verja
  las casas que la llevan (unas 6 de cada 10) y nunca los solares sin casa. Las calles y las vallas siguen una
  onda suave cuya amplitud depende de la sinuosidad del pueblo. Un solar sin casa tiene un
  árbol `v<casa>` en el jardín. `mover-casa` mueve solo la casa, no su solar.
- `id` de un árbol: `v<z>:<desplazamiento>` si está junto a una casa, `b<n>` si está en el bosque (n = orden en la
  generación), o `a<n>` si se puso a mano. `especie` es `roble`, `alamo`, `pino` o `arbusto`.
- `id` de una valla: `<hueco de casa>a` o `…b` para las de una casa (ver arriba), y `c<n>.<k>` para los tramos de una
  valla puesta a mano (`c<n>`, dividida en tramos de unos 4,5 m). `añadir-valla` da los dos extremos en metros.
- `id` de una roca: `r<n>` para las de fábrica (n = orden en la generación) y `p<n>` para las puestas a mano.
  `escala` es opcional (1 por defecto).
- `id` de un seto: `h<…>` para los de fábrica (junto a una casa, como `h-72:-13`) y `s<n>` para los puestos a mano.
  `rot` es el giro en radianes (0 por defecto). `añadir-seto` da la posición del centro en metros.

## Camino
| Campo | Descripción |
|---|---|
| `id`, `from`, `to` | Une dos pueblos (ids). |
| `kind` | `camino`, `calzada` o `sendero`. |
| `bend` | Curvatura (-0.45 a 0.45). |
| `points` | Polilínea `[{x, y}, …]` ya calculada. |
| `length` | Longitud en metros. |

## Zona
| Campo | Descripción |
|---|---|
| `id`, `name` | |
| `type` | `caza`, `elite`, `jefe`, `pvp` o `segura`. |
| `x`, `y`, `radius`, `shapeSeed` | Centro, radio y forma irregular (ver `RPGWorld.zoneOutline` / `pointInZone`). |
| `biome` | Bioma (decide los monstruos). |
| `levelMin`, `levelMax` | Rango de nivel. |
| `roadId`, `roadT`, `anchored` | Camino en el que está, posición (0–1) y si sigue al camino al moverlo. |
| `monsters` | `[{ name, level, density, boss, enemigo }]`. `density`: `baja` (1 monstruo), `media` (2), `alta` (3) o `única` (jefe). `enemigo`: clave de un arquetipo del editor (`elder_dragon`, …) o `null` para elegirlo según `settings.enemyMode`. |
| `respawnSec` | Segundos de reaparición. |
| `notes` | Texto libre. |

## Lugar de interés
| Campo | Descripción |
|---|---|
| `id`, `name`, `x`, `y` | |
| `type` | `mazmorra`, `jefe`, `campamento`, `santuario`, `mina`, `ruinas`, `portal`. |
| `level` | Nivel recomendado. |
| `zoneId`, `dx`, `dy` | Zona que lo contiene y posición relativa (se mueve con ella). |
| `notes` | Texto libre. |

## Terreno
No se guarda: se calcula a partir de `seed` con `RPGWorld.getTerrain(seed)`:
`elevation(x, y)` (0–1, mar < 0.36), `heightAt(x, y)` (metros), `biomeAt(x, y)`, `isWater(x, y)`.
Biomas: `oceano`, `agua`, `costa`, `pradera`, `bosque`, `pantano`, `desierto`, `tundra`, `taiga`, `montana`, `nieve`.

Si cambia el formato en el futuro se subirá `version` y `RPGWorld.validate` migrará los archivos antiguos.
