# Formato `.partida.json` (versión 1)

La partida guarda al personaje y su progreso. Es independiente del mundo: un mismo `.mundo.json` puede tener
varias partidas (hasta 5 por mundo en el navegador).

```jsonc
{
  "format": "rpg-partida",
  "version": 1,
  "id": "p1k2x3",                 // identificador único
  "name": "Partida 1",
  "worldName": "Reino de Aden",
  "worldSeed": 482913,            // la partida solo se importa en el mundo con esta semilla
  "where": "cerca de Lorheim",    // texto para mostrar en la lista
  "savedAt": "2026-10-26T18:30:00.000Z",
  "player": { "x": 1204.3, "z": -562.1, "yaw": 1.57 },   // posición y dirección en metros
  "hero": { "level": 4, "xp": 120, "hp": 88.5, "mp": 40 },
  "inv": { "gold": 230, "vida": 3, "mana": 1 },
  "visited": ["t_1", "t_4"],      // ids de los pueblos visitados (✓ en la lista)
  "timeOfDay": "night"            // day | golden | night
}
```

## Qué no se guarda
- Estados temporales del combate (enfriamientos, bloqueos, descanso en curso).
- Los monstruos: al cargar, todos están en su zona. Los muertos vuelven a aparecer.

## Dónde se guarda
- En el navegador (`localStorage`), por mundo: `rpgMundo.partidas.<id del mundo>` (la lista) y
  `rpgMundo.partidaActiva.<id del mundo>` (la que se guarda sola).
- Se guarda automáticamente cada 20 s, al entrar en un pueblo nuevo y al cerrar la página.
- Exportar e importar: 💾 Partidas → ⬇ Exportar / ⬆ Importar. Una partida de otro mundo (otra semilla) no se importa.

## Validación
`PartidaLib.validate` rechaza archivos que no sean `rpg-partida`, versiones futuras, o con posición, héroe o
inventario no válidos. Las partidas que no pasan la validación se descartan al leerlas.
