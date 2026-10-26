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
    "metersPerLevel": 180       // metros de camino por nivel recomendado
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
    { "op": "mover-calle", "id": "anillo:28", "dx": 3, "dz": -2 }
  ]
}
```
- `id` de una casa: `"<z>:<desplazamiento en x>"` de su hueco en la cuadrícula del pueblo. Las casas añadidas usan `n1`, `n2`… y no dependen de la cuadrícula.
- `id` de una calle: `principal`, `este-oeste-izq`, `este-oeste-der`, `anillo:<z>`, `especial-<n>` (acceso a un edificio especial) o `acceso-<id de casa>` (camino de la puerta de una casa).
- `mover-casa` da la posición final en metros (coordenadas del pueblo). `mover-calle` da el desplazamiento total desde su posición generada.
- Las ediciones solo se aplican si `base` coincide con la configuración actual (semilla, tamaño, estilo, relieve, etc.). El giro y las salidas no cuentan. Si la base cambia, las ediciones se conservan pero no se aplican.
- Las calles de salida hacia el mundo no se pueden editar.

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
| `monsters` | `[{ name, level, density, boss }]`. |
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
