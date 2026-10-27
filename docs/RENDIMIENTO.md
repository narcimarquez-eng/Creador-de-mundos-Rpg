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

## Detalle por distancia a la cámara (aplicado)

Cada especie tiene una malla de ramas y otra de hojas para el nivel «cerca» y otras dos para «lejos». Cada
árbol va al nivel «cerca» si está a menos de 70 m de la cámara (en planta) y al «lejos» si no. La cámara se mide
al moverse más de 1 m, y el reparto solo cambia los conteos de las mallas, así que el número de llamadas de dibujo
no sube. Antes el nivel se elegía por pueblo.

| Vista | Antes (triángulos, llamadas) | Después |
|---|---|---|
| Juego, calidad alta | 680.000, 236 | 491.000, 232 |
| Juego, calidad baja | 616.000, 221 | 427.000, 217 |
| Vista general, calidad alta | 1.231.000, 431 | 870.000, 419 |
| Pueblo visto a 45 m, calidad alta | 679.000, 171 | 495.000, 167 |
| Pueblo visto a 110 m, calidad alta | 680.000, 204 | 559.000, 204 |

- Comprobado: cada árbol se dibuja una sola vez (cerca + lejos = total de árboles).
- En la captura a 45 m el aspecto es casi igual; los árboles del horizonte se ven con menos hojas, como se pretendía.
- El creador de pueblos no llama a `updateTreeLod`, así que sus árboles siguen en «cerca»: no cambia nada.
- **Pendiente:** no se ha comprobado si al cruzar los 70 m se nota un salto de follaje. Hay que verlo con GPU real.

## Próximos pasos propuestos

1. **Bajar el detalle cercano del roble y el pino** (hojas y segmentos). Objetivo: unos 4.000 triángulos por árbol cercano.
2. **Transición gradual** entre «cerca» y «lejos», si el salto a 70 m se nota.
3. **Medir en un móvil con GPU** antes de fijar los objetivos de FPS y de triángulos.

Medición: scripts en la carpeta de trabajo de la sesión (`perf_visor.js`, `perf_break2.js`, `perf_notrees.js`,
`perf_juego.js`); no forman parte del repositorio.
