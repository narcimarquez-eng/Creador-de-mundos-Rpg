# Planificación

Estado actual: el **Creador de Mundos** (`index.html`) genera el mundo, el **Creador de Pueblos**
(`creador-de-pueblos.html`) diseña pueblos, y el **Visor 3D** (`visor-mundo.html`) recorre el mundo y carga
pueblos completos según la distancia. Todo está en la rama `ccr-883c6e56-fjnw1y`.

Objetivo a medio plazo: que el visor se parezca a un juego (navegación, personaje, ambiente, zonas que se
sienten), manteniendo la navegación del Creador de Pueblos como base.

## Fase 1 — Navegación como en el Creador de Pueblos (**hecha**)

Estado: completada. El controlador del personaje está en `js/character.js` y lo usan los dos. El visor tiene
joystick analógico, velocidades 6,5 / 12 m/s, cámaras General / Plaza / Fachada / Seguir, colisión de cámara y el
personaje GLB (o el avatar de respaldo).

Hoy el visor y el creador no se controlan igual. Diferencias concretas:

| | Creador de Pueblos | Visor |
|---|---|---|
| Velocidad andando / corriendo | 6,5 / 12 m/s | 14 / 34 m/s (demasiado rápido para un pueblo) |
| Joystick táctil | Analógico | Botonera de flechas |
| Cámara | Vista general, plaza, detalle de fachada, seguir (offset 6 m arriba, 12 m atrás) | Vista general, seguir |
| Límites de zoom | 2 a 280 m | 25 a 9000 m |
| Personaje | `personaje.glb` con animaciones (fallback si no hay) | Cápsula de colores |

Tareas:
1. **Unificar controles**: mover el `CharacterController` del creador a `js/character.js` y usarlo en los dos
   sitios. Un solo código de movimiento, cámara y joystick.
2. **Velocidades**: ajustar el visor a 6,5 / 12 m/s.
3. **Joystick analógico** en móvil (sustituye la botonera) y mantener WASD/flechas en escritorio.
4. **Cámaras predefinidas** en el visor: vista general, plaza del pueblo cercano, detalle de fachada y seguir.
5. **Personaje GLB** con animaciones idle / andar / correr, cargado desde la misma ruta que el creador.
6. **Colisión de cámara**: que la cámara no atraviese muros ni terreno cuando sigue al personaje.

## Fase 2 — Aspecto de juego (**hecha**)

Hecho: modo juego al entrar en un pueblo, día / atardecer / noche con transición, anuncios de pueblo y zona,
minimapa, monstruos visibles con caza y reaparición (sin combate todavía) y aparición gradual de los pueblos
completos. Limitaciones: el pueblo completo crece desde el suelo en vez de desvanecerse, porque sus materiales
se comparten; el minimapa no gira.


1. **Modo juego y modo mapa**: al entrar en un pueblo, cámara en tercera persona por defecto; el mapa queda
   como vista secundaria (tecla M o botón).
2. **Ambiente**: día, atardecer y noche como en el creador (`applyAtmosphere`), con transición suave.
3. **Anuncios de zona**: al entrar en un pueblo o zona aparece su nombre, nivel y tipo (segura, élite, PvP).
4. **Minimapa** en un canvas pequeño, con pueblo, zona y caminos.
5. **Pop-in suave**: los pueblos se cargan con fundido en lugar de aparecer de golpe.
6. **Monstruos visibles** en las zonas de caza (formas simples con color por nivel) y reaparición con
   `respawnSec`.

## Fase 3 — Mundo jugable (puntos 1 y 2 **hechos**)

Hecho: el personaje no entra en el agua (se desliza por la orilla) y los puentes de las salidas son caminables con rampa.

1. **Límites del terreno**: hoy el personaje puede caminar bajo el mar (no hay comprobación con el nivel del
   agua). Hay que bloquear el agua, o usar la altura del agua como suelo mínimo.
2. **Puentes del río fuera del puente principal**: son visuales. Hay que hacerlos caminables (ahora el
   personaje los cruza hundiéndose en el cauce).
3. **Movimiento por caminos**: clic en el mapa o en el suelo para ir a un punto, con búsqueda de ruta
   (A*) que prefiera los caminos del mundo.
4. **Viajes entre pueblos**: al seguir un camino se cruzan zonas de caza y se pueden producir encuentros.

## Combate (primera versión, ver docs/COMBATE.md)

Hecho: ataque, patada giratoria, nova y salto con las animaciones del GLB; vida, maná, XP y niveles; monstruos con
vida y barra que persiguen y atacan; muerte y reaparición en el pueblo; jefes con postura de victoria. Pendiente:
curación, recompensas, nadar y decidir el respawn definitivo.

## Fase 4 — Partida (**hecha**)

Hecho: partidas separadas del mundo (hasta 5 por mundo), con posición, nivel, XP, vida, maná, oro, pociones, pueblos
visitados y hora. Autoguardado, exportar e importar (`docs/FORMATO-PARTIDA.md`). Pendiente: guardar la partida
en el archivo del mundo del editor, no solo en el navegador.

1. **Archivo de partida separado del mundo**: el `.mundo.json` describe el mundo y el `.partida.json` guarda
   al personaje (posición, nivel, pueblo visitado). Así un mismo mundo puede tener varias partidas.
2. **Sesiones** que guarden mundo y partida juntos en el navegador.

## Fase 5 — Rendimiento y escala

1. **Texturas por estilo**: cada estilo genera texturas de 2048 px. Con varios estilos a la vez, la memoria de
   la tarjeta gráfica puede ser excesiva en móvil. Medir y reducir (1024 px en móvil) o compartir atlas.
2. **Terreno por trozos** con LOD, en lugar de una sola malla de hasta 420×420 celdas.
3. **Generación fuera del hilo principal** (Web Worker) para el terreno y para los pueblos.
4. **Medir de verdad**: las pruebas se han hecho en un navegador sin GPU (SwiftShader). Hay que medir tiempos
   de carga, FPS y memoria en un ordenador y en un móvil reales.

## Fase 6 — Calidad y mantenimiento

1. **Pruebas automáticas** del núcleo (`world-core.js` y `village-core.js`) en Node, con casos fijos de semilla.
2. **Capturas de regresión** del Creador de Pueblos con una semilla fija (ya se han usado a mano).
3. **Eliminar duplicados**: la altura del visor (`H`) repite la lógica del terreno del núcleo.
4. **Limpieza menor**: los pueblos solo para el suelo crean luces que no se usan.
5. **Documentar** el formato de partida cuando exista (Fase 4).

## Riesgos abiertos

- No se ha probado en GPU real ni en móvil.
- El formato de `.mundo.json` cambiará cuando se añada la partida; `RPGWorld.validate` ya migra versiones.
- Los caminos del mundo y los pueblos están generados con reglas simples de Creador de Mundos; todavía no hay
  comprobación de que un pueblo no quede dentro del agua o sobre otro pueblo en todos los casos.

## Próximo paso propuesto

Fase 1, en este orden: velocidades → personaje y controles compartidos → joystick → cámaras → colisión de
cámara. Después, Fase 3 puntos 1 y 2 (mar y puentes), que son bugs visibles.
