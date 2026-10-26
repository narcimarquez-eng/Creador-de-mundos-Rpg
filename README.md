# Creador de Mundos RPG

Herramientas para diseñar el mundo de un futuro juego RPG (estilo Lineage 2).

| Archivo | Qué es |
|---|---|
| `index.html` | **Creador de Mundos**: mapa del mundo con pueblos, caminos, zonas de caza y lugares de interés. |
| `creador-de-pueblos.html` | **Creador de Pueblos 3D**: genera un pueblo completo a partir de una semilla y parámetros. |
| `js/world-core.js` | Núcleo del mundo sin interfaz (terreno, biomas, generación, niveles, guardado). Pensado para reutilizarlo en el juego. |
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
4. **Diseñar un pueblo**: selecciona un pueblo → **🏗 Abrir en el Creador de Pueblos 3D**. Ajusta lo que quieras y pulsa **💾 Guardar y volver**: el diseño (semilla y parámetros) queda guardado en ese pueblo del mundo.
   Los caminos del mundo llegan al pueblo por sus puertas: el pueblo se gira para que sus calles principales apunten a los caminos, y cada camino sale hasta el borde del terreno con un cartel hacia su destino. Abierto sin mundo, puedes probar salidas escribiendo ángulos en «Salidas hacia el mundo».
5. **Guardado**: cada cambio se guarda automáticamente en la sesión actual (almacenamiento del navegador). En **📁 Sesiones** puedes tener varios mundos, duplicarlos, borrarlos y **exportar / importar `.mundo.json`** para copias de seguridad o para pasarlos a otro dispositivo.

Atajos de teclado: `1–6` herramientas, `Supr` borrar selección, `Ctrl+Z` / `Ctrl+Y` deshacer / rehacer, `Esc` cancelar.

## Hacia el juego completo

- Todo es **determinista**: el terreno sale de la semilla del mundo y cada pueblo guarda la configuración exacta del Creador de Pueblos, así que el juego puede reconstruir el mundo idéntico a partir del `.mundo.json`.
- `js/world-core.js` funciona en navegador y en Node, sin dependencias. El juego puede cargarlo y usar `RPGWorld.getTerrain(seed).heightAt(x, y)`, `biomeAt`, `pointInZone`, etc.
- Unidades en metros. El eje `y` del mapa corresponde al eje `z` del mundo 3D.
