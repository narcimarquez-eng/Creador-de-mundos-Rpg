# Combate

Primera versión del combate. Las reglas están en `js/combat.js` (sin gráficos, con pruebas en
`test/combat.test.js`). El visor las usa en tiempo real. Los números son valores de partida para ajustar.

## Controles

| Tecla | Móvil | Acción | Coste | Enfriamiento |
|---|---|---|---|---|
| **Espacio** | ⚔ / 🏹 | Combo de ataque (cono frontal de 3 m); con un arco, tiro con arco (24 m, a un solo blanco) | — | 0,7 s / 1,2 s |
| **Q E Z V** | huecos | La habilidad que lleve cada hueco de la barra (al empezar: impacto sísmico, nova, tajo giratorio y estocada) | según la habilidad | según la habilidad |
| **X** | 🦘 | Salto acrobático (solo animación) | — | — |

Los huecos se cambian en el panel 🧬 (P): cada habilidad tiene botones Q, E, Z y V; si ya estaba en otro hueco, se
intercambian. Cada habilidad bloquea el movimiento mientras dura su animación y golpea en su momento (al caer, al
cerrar el giro, al soltar la flecha), no al pulsar.

### Habilidades activas

Cada una usa su animación del cuerpo que exporta el estudio de armaduras. Daño: el del héroe por el multiplicador,
y +25 % por cada punto gastado en el entrenador (hasta 3).

| Habilidad | Animación | Área | Daño | Maná | Recarga | Se consigue |
|---|---|---|---|---|---|---|
| Impacto sísmico 🪨 | `ultimate_slam` | alrededor, 4,5 m | ×2 | 18 | 5 s | capítulo 4 de la historia |
| Explosión nova 💥 | `ultimate_nova` | alrededor, 7 m | ×2,5 | 30 | 12 s | capítulo 8 de la historia |
| Tajo giratorio 🌀 | `spin_slash` | alrededor, 3,5 m | ×1,8 | 12 | 5 s | nivel 3 |
| Estocada a fondo 🗡 | `thrust_lunge` | delante (estrecho), 5 m | ×2,2 | 10 | 4 s | nivel 5 |
| Tajo ascendente ⤴ | `rising_slash` | delante, 3,2 m | ×2 | 12 | 5 s | nivel 7 |
| Hendidura vertical 🪓 | `overhead_cleave` | delante, 3,5 m | ×2,6 | 16 | 7 s | nivel 9 |
| Parada y contraataque 🛡 | `guard_counter` | delante, 3 m | ×2,8 | 15 | 9 s | nivel 11 |
| Torbellino 🌪 | `whirlwind` | alrededor, 4 m, dos golpes | ×1,4 cada uno | 24 | 9 s | nivel 13 |
| Voltereta mortal 🤸 | `backflip` | alrededor, 3 m | ×1,6 | 14 | 8 s | nivel 15 |
| Tornillo triple 🌩 | `triple_corkscrew` | alrededor, 4,5 m | ×3,4 | 35 | 15 s | nivel 18 |
| Tiro con arco 🏹 | `archery` | delante, 24 m, un blanco | ×1,2 | — | 1,2 s | con un arco (Espacio) |
| Flecha en suspensión 🎯 | `aerial_shot` | delante, 26 m, un blanco | ×2,6 | 20 | 8 s | nivel 6, con un arco |

Las técnicas de espada, hacha, maza, daga, lanza o báculo no se usan con un arco, y las de arco solo con un arco: el
botón lo marca con ✖. El tiro con arco solo va en el .GLB si el cuerpo se exporta con un arco equipado; en el
catálogo, como cada familia de armas, hay arcos del nivel 1 al 40.

## Animaciones del personaje

Las acciones se buscan por el nombre de la animación del GLB (inglés o español, sin distinguir mayúsculas):

| Acción | Palabras clave | Ejemplo en tu lista |
|---|---|---|
| Idle | idle, guardia | Guardia (Idle) |
| Andar | walk, marcha | Marcha (Walk) |
| Correr | run, carrera | Carrera (Run) |
| Ataque | combo, ataque, punch | Combo de Ataque · `punch` |
| Impacto sísmico | slam, sismo, sísmico | Impacto Sísmico · `ultimate_slam` |
| Técnicas y arco | spin_slash, whirlwind, overhead_cleave, thrust_lunge, rising_slash, guard_counter, triple_corkscrew, backflip, archery, aerial_shot | (nombres del estudio) |
| Nova | nova, explos | Explosión Nova |
| Salto | salto, acrobat | Salto Acrobático |
| Victoria | victoria | Postura de Victoria |

«Pose Estática (Bind Pose)» no se usa. Si el GLB no trae una acción, el avatar de respaldo hace un gesto sencillo.

## Héroe

- **Vida:** 100 + 12 por nivel. Sin regeneración durante 6 s después de recibir un golpe; después, 2 por segundo.
- **Maná:** 50 + 6 por nivel, regenera 2 por segundo.
- **Daño base:** 8 + 3 por nivel (ataque). Impacto sísmico ×2, nova ×2,5.
- **Experiencia:** cada nivel necesita 100 × nivel de XP. Al subir de nivel se restaura la vida y el maná.
- **Muerte:** se pierde el 5 % del XP actual. Se reaparece a los 4 s en el pueblo más cercano, con vida y maná completos.

### Estadísticas del héroe (tecla P)

Las estadísticas salen del nivel, de las habilidades pasivas y del equipo (arma, armadura y escudo, cada uno con sus
especiales). Reglas en `js/heroe.js`; el panel 🧬 las muestra todas, aunque valgan 0.

- **Arma:** su ataque se suma al daño. Los especiales son: filo (crítico), golpe pesado (daño), ataque veloz
  (velocidad de ataque), vampírica (robo de vida). Un arma con «Escudo» en el nombre cuenta como escudo.
- **Armadura:** defensa (reduce el daño, con la fórmula defensa / (defensa + 60)). Especiales: piel de acero
  (+defensa), vigía (+vida), ligera (+velocidad de movimiento), espinas (devuelve parte del daño recibido).
- **Escudo:** bloqueo (un golpe bloqueado hace la mitad de daño). Especiales: bloqueo firme, escudo solar (+vida).
- **Especiales:** aparecen según el nivel de la pieza (1 desde nivel 5, 2 desde 15, 3 desde 30) y son fijos.
- **Crítico:** 5 % + 1 % por punto de destreza (máximo 75 %), daño ×1,5.

**Puntos de habilidad:** de 1 a 5 por cada capítulo de la historia (según el capítulo), los de los encargos de
jefe y 1 por cada 20 monstruos derrotados. Se gastan con el entrenador **Hermana Ysolde** (tecla H cerca de ella):

- Pasivas (hasta 10 puntos cada una): vitalidad, fuerza, destreza, entereza, intelecto.
- Activas: impacto sísmico (Q, capítulo 4) y nova (E, capítulo 8). Las desbloquea la historia y suben hasta 3 niveles
  (+25 % de daño por nivel).

### Historia (misión principal)

La crónica del pueblo inicial se vive capítulo a capítulo (`js/historia.js`). Cada capítulo lo encarga un sabio de
la plaza y solo hay uno activo: su progreso empieza en 0 al activarse, y lo que se haga antes no cuenta. Al
cumplirlo, el sabio cuenta su parte de la historia, da la recompensa y encarga el siguiente.

| # | Capítulo | Sabio | Qué pide | Recompensa |
|---|---|---|---|---|
| 1 | Los siete reinos | Elara | Hablar con ella | 1 punto |
| 2 | El camino de piedra | Oren | Llegar al pueblo vecino | 2 puntos |
| 3 | Las runas de la muralla | Ysolde | 4 criaturas en una zona de nivel 2 | 2 puntos |
| 4 | Los que no temen al acero | Tamsin | 8 criaturas en una zona de nivel 4 | 2 puntos y el impacto sísmico |
| 5 | El valor de una cota | Mirel | Encargar una pieza al herrero | 2 puntos |
| 6 | La arena del herrero | Elara | 10 criaturas en una zona de nivel 6 | 2 puntos |
| 7 | Los caminos del norte | Oren | Llegar al pueblo más al norte | 3 puntos |
| 8 | El sello de la nova | Ysolde | 12 criaturas en una zona de nivel 10 | 3 puntos y la nova |
| 9 | Los jefes del bosque | Tamsin | Derrotar al jefe de un territorio de jefe | 4 puntos |
| 10 | El héroe de la plaza | Mirel | Volver a hablar con ella | 5 puntos |

- **El lugar** se elige con los datos del mundo: la zona de caza o élite de nivel más parecido (a igualdad, la más
  cercana al pueblo inicial), el territorio de jefe, el pueblo vecino o el que está más al norte. Solo cuentan los
  monstruos de esa zona. Si el mundo no tiene lo que pide (sin más pueblos, sin territorio de jefe), el capítulo se
  adapta: hablar con su sabio o luchar en la zona más difícil.
- **Ir andando:** arriba se ve la misión activa. Al pulsarla (o «🧭 Llévame»), el personaje va andando por los
  caminos hasta donde se cumple (`js/ruta.js`): sale del pueblo por la puerta de su camino, sigue el trazado y
  atraviesa los pueblos por su plaza. Moverse con las teclas o el joystick la para. Si algo lo bloquea, rodea por
  un lado; tras tres intentos, se para y lo avisa.
- **Hablar** cuenta al pulsar «💬 Hablar» en el sabio o al llegar a él con la misión, no solo por pasar cerca.
- La crónica (tecla C) muestra los capítulos contados, el actual y los que faltan. Las partidas antiguas empiezan
  en el capítulo 1.

### Encargos de zona

Cada zona de combate tiene un NPC en el pueblo más cercano que le encarga una misión (`js/mision-zona.js`).
Son independientes de la crónica y se derivan de los datos de la zona, así que una zona nueva tiene su encargo
sin cambiar el mundo guardado.

- **Tipo de encargo según la zona:** caza, élite y pvp piden matar monstruos (entre 3 y 10, según el tamaño);
  el territorio de jefe pide derrotar al jefe; la zona segura pide entrar en ella.
- **Cómo se cumple:** se acepta hablando con el NPC (H cerca o pulsar el NPC). El progreso sube con cada
  monstruo de la zona (o al entrar, en la zona segura). Al completarlo, se entrega en el mismo NPC para cobrar.
- **Premio:** oro según el nivel de la zona, pociones y, en los encargos de jefe, 1 punto de habilidad.

## Monstruos

- **Vida:** 20 + 8 por nivel. **Daño:** 3 + 1,5 por nivel. **XP:** 10 por nivel.
- **Jefes** (los monstruos de «Guarida de jefe»): vida ×5, daño ×1,6, XP ×5. Cuando cae, se activa la postura de victoria.
- **Diferencia de nivel:** +10 % de daño por cada nivel por encima del rival, entre ×0,5 y ×2.
- **Vista:** los monstruos te persiguen si estás a menos de 14 m (16 m los jefes). Atacan cada 1,5 s desde 2,2 m.
- **Vuelta a casa:** si se alejan más del radio de su zona + 25 m, o entran en un pueblo, vuelven a su zona y se
  recuperan poco a poco.
- **Reaparición:** tras morir, el monstruo vuelve a su zona cuando pasa el tiempo `respawnSec` de la zona.

## Lo que sale de las pruebas de equilibrio

Un héroe de nivel 1 vence sin problemas a monstruos de nivel 1–4 (pierde entre 9 y 47 de vida). A partir de nivel 6
pierde casi siempre. Así las zonas de nivel alto piden subir antes de entrar. Los jefes de nivel 4–5 se pueden
vencer con un héroe de su nivel, pero cuesta mucha vida: falta una forma de curarse (poción, pueblo) para
que los jefes sean una prueba y no un castigo.

## Economía (decidido)

- **Oro:** cada monstruo da `2 + 1,5 × nivel` oro. Los jefes dan ×6.
- **Pociones:** de vida y de maná. Un monstruo normal suelta una de vida con un 25 % y una de maná con un 10 %.
  Un jefe suelta siempre 2 de vida y 1 de maná. Cada pila llega como máximo a 20.
- **Uso:** poción de vida cura el 35 % de la vida máxima; poción de maná recupera el 35 % del maná máximo.
  Teclas **1** y **2**, o los botones 🧪 y 💧.
- **Tienda (B o 🛒, solo en los pueblos):** cada poción cuesta 15 oro.
- **Descanso (R o 💤, solo en los pueblos):** recupera vida y maná completos en 4 s. No se puede empezar si
  te han golpeado hace menos de 6 s. Se corta si te mueves, te golpean o sales del pueblo.
- **Muerte:** se pierde el 5 % del XP, pero se conservan el oro y las pociones.
- **Reaparición:** en el pueblo más cercano (decidido).

## Pendiente

1. **Nadar:** hoy el agua bloquea al personaje. Para nadar hace falta una animación de natación (no está en la
   lista), una velocidad menor y una regla para cuando se pierde el aire.
2. **PvP:** hoy los monstruos no entran en los pueblos y no hay jugadores. ¿Quieres zonas PvP con otros jugadores?

## Dónde está cada cosa

- `js/combat.js`: reglas (daño, XP, muerte, IA del monstruo, área de las habilidades).
- `js/character.js`: animaciones de un solo uso y reconocimiento de nombres del GLB.
- `visor-mundo.html`: héroe, monstruos, barras de vida, HUD y reaparición.
- `js/items.js`: oro, pociones, botín, tienda y descanso.
- `test/combat.test.js` y `test/items.test.js`: pruebas de las reglas. Se ejecutan con `node test/combat.test.js` y `node test/items.test.js`.
