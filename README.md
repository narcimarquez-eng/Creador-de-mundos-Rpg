# Creador de Mundos RPG

Herramientas para diseñar el mundo de un futuro juego RPG (estilo Lineage 2).

| Archivo | Qué es |
|---|---|
| `index.html` | **Creador de Mundos**: mapa del mundo con pueblos, caminos, zonas de caza y lugares de interés. |
| `creador-de-pueblos.html` | **Creador de Pueblos 3D**: genera un pueblo completo a partir de una semilla y parámetros. |
| `js/arboles.js` | Modelos de árboles (roble, álamo, pino, arbusto) incrustados. Dos niveles de detalle. Se regenera con `node tools/hornear-arboles.mjs js/arboles.js` (requiere `npm install` en `tools/`). Pruebas en `test/arboles.test.js`. |
| `js/pueblo-edits.js` | Ediciones a mano de un pueblo (mover o borrar casas y calles internas, añadir casas). Pruebas en `test/pueblo-edits.test.js`. |
| `visor-mundo.html` | **Visor 3D del mundo**: recorre el mundo entero con el personaje (WASD / joystick), pueblos, caminos, zonas de caza y bosques. Se abre con el botón «🗺 3D» del editor o cargando un `.mundo.json`. |
| `js/character.js` | Personaje, joystick, cámara y animaciones (incluidas las de un solo uso) compartidas por el Creador de Pueblos y el visor. |
| `js/items.js` | Oro, pociones, botín, tienda y descanso. Pruebas en `test/items.test.js`. |
| `js/equipo.js` | Clases (guerrero, mago) y armaduras por niveles: al crear el personaje se generan todas las de su clase; cada tramo exige un nivel mínimo. Pruebas en `test/equipo.test.js`. El botón 🧙 Personaje del creador crea el personaje y pide los .glb exportados desde el estudio [armaduras-glb](https://github.com/narcimarquez-eng/armaduras-glb) (`public/assets/aistudio/`). La copia del juego, `estudio-armaduras/index.html`, viene de la rama `ccr-1806ff1d-a2tcyz` de ese repositorio (ataques especiales, tiro con arco, escudo aparte) más el puente con la visor. Los magos no tienen modelo todavía. |
| `js/combat.js` | Reglas del combate (daño, XP, muerte, IA de los monstruos). Pruebas en `test/combat.test.js`. |
| `js/heroe.js` | Estadísticas del héroe (arma, armadura y escudo con sus especiales), habilidades pasivas y activas y puntos. Pruebas en `test/heroe.test.js`. Reglas en `docs/COMBATE.md`. |
| `js/historia.js` | Misión principal: la crónica del pueblo contada capítulo a capítulo; uno activo cada vez, con su progreso desde 0. Pruebas en `test/historia.test.js`. |
| `js/ruta.js` | Ruta a pie por los caminos (puertas de los pueblos, trazado, plazas) para ir hasta donde se cumple la misión. Pruebas en `test/ruta.test.js`. |
| `js/fusionar-modelo.js` | Une las piezas rígidas de un modelo animado en una malla por material, con sus nodos como huesos: los NPCs pasan de ~87 dibujos a ~22 y los monstruos de ~50 a ~16, con la misma animación. Pruebas en `test/fusionar-modelo.test.js`. |
| `tools/simplificar-npcs.mjs` | Genera `npc/gurus/guru-N-lejos.glb`, la versión lejana de cada NPC (~13 % de los triángulos, mismos nodos y animaciones). El visor la muestra a más de 35 m de la cámara; a más de 150 m el NPC no se dibuja. Se ejecuta con `node tools/simplificar-npcs.mjs` tras cambiar un modelo. |
| `js/mapa.js` | Geometría del mapa del mundo (límites, escalas, orientación de la flecha y rejilla) para el minimapa y el mapa del mundo de la visor. Pruebas en `test/mapa.test.js`. |
| `js/mision-zona.js` | Encargos de zona: cada zona de combate tiene un NPC en el pueblo más cercano que le encarga una misión (matar, derrotar al jefe o visitar la zona). Independientes de la crónica. Pruebas en `test/mision-zona.test.js`. |
| `js/enemigos.js` | Generación de enemigos del editor [«Enemigo-rpg»](https://github.com/narcimarquez-eng/Enemigo-rpg) (compilada con `tools/hornear-enemigos.mjs` desde `tools/enemigos-src/`, copia de su `src/`): 257 arquetipos con esqueleto, 96 de ellos de nivel 1 a 21. Personajes, NPC y monstruos tienen en la visor un entorno de reflejos, como en el estudio y el editor, para que sus metales no salgan pardos. El visor la usa para los monstruos: modo por niveles o aleatorio. Cada monstruo tiene versión de cerca (densidad media) y de lejos (baja, ~la mitad de triángulos) a partir de 70 m; se ven hasta 300 m, se animan cada fotograma y hacen sombra hasta 80 m, se animan a un cuarto de ritmo hasta 200 m y más lejos se quedan quietos. Se construye como mucho un modelo por fotograma. |
| `enemigos-editor/` | Editor de enemigos «Enemigo-rpg» ya compilado (sin servidor). Se abre desde el botón «🐉 Enemigos» del Creador de Mundos y del Creador de Pueblos; al enviar un enemigo se añade a «Propios del mundo». Se construye con `tools/construir-editor-enemigos.sh`. |
| `js/enemigos-optimizar.js` | Une las mallas estáticas de cada enemigo y quita sus hitboxes de depuración, para dibujar menos. |
| `js/enemigos-combate.js` | Efectos de combate de los enemigos: golpe, magia con proyectil, reacción al golpe. Se superponen a la animación base. |
| `js/village-core.js` | Generador de pueblos compartido por el Creador de Pueblos y el visor (muros, casas, calles, colisiones). Trazado por manzanas con parcelas (por defecto) o clásico. |
| `js/world-core.js` | Núcleo del mundo sin interfaz (terreno, biomas, generación, niveles, guardado). Pensado para reutilizarlo en el juego. |
| `js/partida.js` | Guardado de partidas (varias por mundo, exportar e importar). Pruebas en `test/partida.test.js`. |
| `docs/FORMATO-PARTIDA.md` | Descripción del archivo `.partida.json`. |
| `docs/FORMATO-MUNDO.md` | Descripción del archivo `.mundo.json` que se guarda/exporta. |

## Cómo usarlo

Abre `index.html` en el navegador (doble clic, o mejor servido con GitHub Pages / `npx serve`).

1. Al abrir por primera vez se genera un mundo de ejemplo. **📁 Sesiones → ✨ Nuevo mundo** genera otro con tus parámetros (semilla, nº de pueblos, distancia, caminos extra, zonas por camino, progresión de nivel).
2. **Herramientas** (barra izquierda):
   - ✋ **Mover**: toca para seleccionar y editar en el panel; arrastra para mover (en móvil: primero toca, luego arrastra). Arrastrar en vacío mueve el mapa; rueda o pellizco = zoom.
   - 🏘 **Pueblo**: toca el mapa para fundar un pueblo (se conecta con caminos y crea zonas de caza si lo dejas activado).
   - ⚔ **Zona**: crea una zona de caza / élite / jefe / PvP / segura.
   - 🛤 **Camino**: toca un pueblo y luego otro para unirlos.
   - ✦ **Lugar**: mazmorras, guaridas de jefe, campamentos, santuarios, minas, ruinas, portales.
   - 🗑 **Borrar**: toca lo que quieras eliminar (↶ deshace).
   - ➕ **Expandir**: añade un pueblo nuevo en la frontera del mundo y lo conecta.
3. **Niveles**: el pueblo inicial ⭐ es nivel 1; cuanto más lejos (por camino), más nivel tienen pueblos y zonas. Las zonas están **sobre los caminos entre pueblos**: son el trayecto y el lugar de caza.
4. **Diseñar un pueblo**: selecciona un pueblo → **🏗 Abrir en el Creador de Pueblos 3D**. Ajusta lo que quieras y pulsa **💾 Guardar y volver**: el diseño (semilla y parámetros) queda guardado en ese pueblo del mundo. En el Creador de Pueblos, **✏️ Activar edición** muestra una paleta (Ver, Mover, Borrar, Casa, Calle, Punto, Farola, Muro, Puerta, Árbol, Valla, Roca, Seto; Ctrl+Z deshace): puedes mover o quitar casas y calles internas, dibujar calles nuevas con la forma que decidas (los puentes se ponen solos donde cruzan el río), poner y quitar farolas, quitar tramos de muralla y abrir puertas con arco, y poner, quitar o trazar árboles (con especie), vallas, rocas y setos. Las calles de salida hacia el mundo no se tocan.
   Los caminos del mundo llegan al pueblo por huecos en la muralla: el pueblo se gira para que sus calles apunten a los caminos, y cada camino sale de la plaza en línea recta hasta el borde del terreno, con un cartel hacia su destino. Abierto sin mundo, puedes probar salidas escribiendo ángulos en «Salidas hacia el mundo».
5. **Guardado**: cada cambio se guarda automáticamente en la sesión actual (almacenamiento del navegador). En **📁 Sesiones** puedes tener varios mundos, duplicarlos, borrarlos y **exportar / importar `.mundo.json`** para copias de seguridad o para pasarlos a otro dispositivo.

Atajos de teclado: `1–6` herramientas, `Supr` borrar selección, `Ctrl+Z` / `Ctrl+Y` deshacer / rehacer, `Esc` cancelar.

## Visor 3D

Desde el editor, **🗺 3D** (o **🗺 Ver en 3D** en la pestaña Mundo) abre el mundo en `visor-mundo.html`:

- **Mover:** WASD o flechas (Shift corre; andar 6,5 m/s, correr 12 m/s, igual que en el Creador de Pueblos). En móvil, el joystick de la derecha. **F** activa la cámara que sigue al personaje: mantiene la distancia y el giro que le das con el ratón (rueda y arrastre), también cuando el personaje anda solo; si un muro o el suelo estorban, se acerca un momento y luego vuelve a tu distancia.
- **Ataque automático:** 🤖 (**K**) dentro de una zona de caza: va siempre a por el monstruo más cercano de esa zona y, al matarlo, al siguiente; usa las habilidades de la barra que estén listas y bebe una poción de vida por debajo del 35 %. Moverte, caer o volver a pulsarlo lo para.
- **Cámaras:** 🌍 General (ver el mundo), ⛲ Plaza y 🏠 Fachada (del pueblo más cercano, con el mismo encuadre que el creador), 🧍 Seguir.
- **Ver:** arrastrar para girar, rueda o pellizco para acercar. **G** o 🌍 General vuelve a ver todo el mundo.
- **Lugares:** toca un pueblo, zona o punto del terreno para ver su información. «Ir aquí» lleva al personaje.
- La lista de la izquierda salta a cada pueblo.

- **Modo juego:** al entrar en un pueblo la cámara pasa a tercera persona. 🗺 Mapa (**M**) vuelve a ver el mundo.
- **Hora:** ☀ / 🌇 / 🌙 (**T**) cambia entre día, atardecer y noche, con transición suave.
- **Anuncios:** al entrar en un pueblo o una zona aparece su nombre, nivel y tipo.
- **Historia:** arriba aparece el capítulo activo de la misión principal. **Púlsalo** y el personaje va andando por los caminos hasta donde se cumple; muévete para pararlo. Al cumplirlo, el sabio cuenta su parte de la crónica y encarga el siguiente (ver `docs/COMBATE.md`).
- **Minimapa** (abajo a la derecha): la flecha marca hacia dónde miras, los anillos marcan 100 y 200 m y abajo aparecen tus coordenadas (x e y en metros, la y es la z del 3D). Muestra caminos, zonas, pueblos y monstruos. **Púlsalo** para ver el mapa del mundo completo: pueblos, caminos, zonas y lugares, con la rejilla en metros; al pasar el ratón (o tocar) se leen las coordenadas y el pueblo más cercano.
- **Combate:** Espacio (combo de ataque; con un arco, tiro con arco), cuatro huecos de habilidad **Q E Z V** (impacto sísmico, nova y las técnicas de arma o de arco que se aprenden con el nivel; se cambian en el panel 🧬) y **X** (salto acrobático). Las reglas, los controles y los números están en `docs/COMBATE.md`. Vida, maná, XP y tu oro aparecen abajo. Los monstruos sueltan oro y pociones. En los pueblos puedes **descansar** (R) para recuperarte y comprar pociones en la **tienda** (B). Las pociones se usan con **1** y **2**. Si caes, reapareces en el pueblo más cercano.
- **Partidas:** 💾 en la barra superior. La partida se guarda sola cada 20 s, al entrar en un pueblo y al cerrar la página. Puedes tener hasta 5 partidas por mundo, cargar, borrar, exportar e importar. Los pueblos que visitas aparecen con ✓.

Los pueblos se cargan completos, igual que en el Creador de Pueblos, cuando te acercas (a unos 650 m), y se vuelven a simplificar al alejarte. Hay como máximo 6 pueblos completos a la vez. Los muros y casas bloquean al personaje, y el agua también: si el paso lleva al mar, el personaje se desliza por la orilla. Los puentes pequeños de las salidas se pueden cruzar. El visor todavía no recorre los caminos automáticamente.

## Hacia el juego completo

- Todo es **determinista**: el terreno sale de la semilla del mundo y cada pueblo guarda la configuración exacta del Creador de Pueblos, así que el juego puede reconstruir el mundo idéntico a partir del `.mundo.json`.
- `js/world-core.js` funciona en navegador y en Node, sin dependencias. El juego puede cargarlo y usar `RPGWorld.getTerrain(seed).heightAt(x, y)`, `biomeAt`, `pointInZone`, etc.
- Unidades en metros. El eje `y` del mapa corresponde al eje `z` del mundo 3D.
