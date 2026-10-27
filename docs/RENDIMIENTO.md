# Rendimiento: medición del visor (fase 5)

Medido con `renderer.info` del visor del mundo (`visor-mundo.html`) en Chromium con SwiftShader (sin GPU), mundo de
prueba con semilla 42 y 8 pueblos. Los **triángulos y las llamadas de dibujo son exactos**. Los **tiempos por
fotograma no son fiables**: SwiftShader dibuja por CPU, así que solo sirven para comparar entre sí (1,2 a 2,3 s por
fotograma en todas las pruebas). Para FPS reales hace falta un ordenador y un móvil con GPU.

## Resultados

| Vista | Calidad | Triángulos | Llamadas de dibujo | Malla de árboles (aprox.) |
|---|---|---|---|---|
| Juego (cámara por defecto) | bajo | 616.000 | 221 | — |
| Juego (cámara por defecto) | alto | 680.000 | 236 | 456.000 (67 %) |
| Vista general | bajo | 1.138.000 | 349 | — |
| Vista general | medio | 1.214.000 | 385 | — |
| Vista general | alto | 1.231.000 | 431 | ≈ 916.000 (74 %) |

- Sin los árboles, la vista de juego baja a **223.000** triángulos (222 llamadas).
- Los árboles se dibujan como 14 mallas instanciadas en la vista de juego y 28 en la vista general. Cada malla
  dibuja **todas** sus instancias, aunque estén fuera de la pantalla: Three.js no descarta instancias sueltas.
- Las calidades «bajo», «medio» y «alto» casi no cambian el número de triángulos: el coste está en los árboles
  cercanos, que el ajuste de calidad no toca.
- Texturas: 29 en total (compartidas entre pueblos). No se ha medido la memoria de la tarjeta gráfica.

## Costes por árbol

Medidos con `tools/hornear-arboles.mjs` (ramas + hojas):

| Especie | Cerca | Lejos |
|---|---|---|
| roble | 10.704 | 1.656 |
| álamo | 3.688 | 1.930 |
| pino | 8.952 | 4.460 |
| arbusto | 7.404 | 1.420 |

## Conclusiones

1. **Los árboles cercanos son el mayor coste.** Son ~70 % de los triángulos en ambas vistas.
2. **El descarte por pantalla no ayuda.** Cada pueblo es una malla instanciada que se dibuja entera, así que los
   árboles de un pueblo fuera de la vista cuestan igual.
3. **La calidad no baja el coste de los árboles.** El nivel «bajo» solo reduce el terreno lejano.

## Prueba: sectores de árboles con descarte por pantalla (descartada)

Se probó dividir los árboles de cada pueblo en sectores (48 m y 120 m), cada uno con su propia esfera, y ocultar los
que quedan fuera del campo de visión de la cámara. Three.js r128 no descarta instancias sueltas: usa la esfera de la
geometría de una sola instancia. Por eso hizo falta un descarte propio.

| Prueba | Triángulos (juego) | Llamadas (juego) |
|---|---|---|
| Base (sin sectores) | 680.000 | 236 |
| Sectores de 48 m | 678.000 | 320 |
| Sectores de 120 m | 678.000 | 288 |

No funciona: la cámara de juego ve casi todo el pueblo (33 de 34 sectores visibles con 120 m), y cada sector añade
una llamada de dibujo. Los sectores se agrupan también por especie y nivel, así que hay muy pocos árboles por sector.
Se revirtió.

## Próximos pasos propuestos

1. **Detalle por distancia a la cámara, no por pueblo.** El nivel «lejos» de un roble tiene 1.656 triángulos frente a
   10.704 del «cerca». Cambiar de nivel según la distancia a la cámara debería reducir el coste de juego sin cambiar
   el aspecto cerca del jugador. Hay que decidir cómo se hace el cambio (dos mallas por sector o por árbol).
2. **Bajar el detalle cercano del roble y el pino** (hojas y segmentos). Objetivo: unos 4.000 triángulos por árbol cercano.
3. **Medir en un móvil con GPU** antes de fijar los objetivos de FPS y de triángulos.

Medición: scripts en la carpeta de trabajo de la sesión (`perf_visor.js`, `perf_break2.js`, `perf_notrees.js`,
`perf_juego.js`); no forman parte del repositorio.
