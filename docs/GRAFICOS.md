# Apartado gráfico

## Estado actual (honesto)

| Parte | Cómo se ve hoy | Qué falta |
|---|---|---|
| Pueblos completos | Texturas procedurales de piedra, madera y tejados, sombreado y ventanas emplomadas (Creador de Pueblos) | Es lo más avanzado; solo está en la zona cercana. |
| Pueblos lejanos | Volúmenes simples de color | Estilo distinto al de los pueblos completos. |
| Terreno | Color plano por bioma, sin textura ni detalle | Texturas de hierba, tierra, roca, arena y nieve; detalle a corta distancia. |
| Agua | Plano azul transparente | Movimiento, espuma en la orilla, color según profundidad. |
| Cielo | Color liso | Cielo con degradado, sol visible y nubes. |
| Sombras | Ninguna en el visor (sí en el creador) | Sombras del sol siguiendo la hora del día. |
| Árboles | Conos y cilindros | Modelos de árbol, hierba y rocas con variedad. |
| Personaje | Avatar de respaldo o tu GLB | Tu GLB con sus animaciones; sombra y efectos de golpe. |
| Monstruos | Conos de color | Modelos propios con animaciones (andar, atacar, morir). |
| Efectos | Ninguno | Impactos, estela de la patada, anillo de la nova, daño flotante. |
| Interfaz | Paneles de color plano | Iconos y tipografía propios; barras de vida con estilo. |

Lo que sí funciona bien: la coherencia de la hora del día (día, atardecer, noche), los pueblos completos y la
transición entre ellos y el mundo.

## Principios

1. **Un solo estilo.** Hoy conviven pueblos con texturas y terreno plano. Hay que elegir un lenguaje visual y
   aplicarlo a todo.
2. **Rendimiento primero.** El mundo es grande: el terreno y la vegetación deben cargarse por trozos (chunks)
   con detalle según la distancia. Así también se controla la memoria de las texturas en móvil.
3. **Un modelo por función.** Lo que se ve debe coincidir con lo que pisa el personaje (ya resuelto para el suelo).

## Fases propuestas

**G1. Terreno con textura y sombras.** Texturas por bioma (mezcla según altura y pendiente), sombras del sol en
el visor y terreno por trozos con detalle según la distancia. Es la base visual de todo lo demás.

**G2. Agua y cielo.** Agua animada con espuma en la orilla, cielo con degradado, sol y nubes, y la niebla
ajustada a la hora del día.

**G3. Vegetación y rocas.** Modelos de árbol y rocas con variedad de tamaño y color, hierba en pequeñas
cantidades y movimiento suave con el viento.

**G4. Personajes y monstruos.** Modelos de monstruos con animaciones básicas (andar, atacar, morir), la sombra
del personaje y las barras de vida con estilo.

**G5. Efectos de combate.** Impactos, estela de la patada, anillo de la nova, números de daño que flotan.

**G6. Interfaz.** Iconos, tipografía y marcos coherentes con el estilo elegido; minimapa a juego.

**G7. Calidad y rendimiento.** Tres niveles de calidad (bajo, medio, alto) detectados según el dispositivo, y
medidas de memoria y de tiempo reales en un ordenador y en un móvil.

## Decisiones que necesito

1. **Estilo visual:** ¿estilizado (como ahora, colores vivos y formas simples), realista o pintado
   (más parecido a Lineage 2)?
2. **De dónde salen los modelos y texturas:** packs gratuitos con licencia libre, compra de packs, o generación
   con IA. En esta sesión hay herramientas de generación de modelos 3D y de sprites, pero necesitan
   autorización de tu cuenta para usarse.
3. **Dispositivo principal:** ¿sobre todo ordenador, o también móvil? Cambia cuánto detalle se puede permitir.
