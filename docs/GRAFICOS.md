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

## Decisiones tomadas

1. **Estilo:** pintado, cercano a Lineage 2. Texturas con detalle, paleta cálida y sombras suaves.
2. **Assets:** packs gratuitos con licencia libre (CC0 o equivalente). Se anota la fuente y la licencia de cada
   pack en `docs/ASSETS.md` (pendiente de crear al empezar G1).
3. **Dispositivos:** ordenador y móvil. Consecuencias:
   - Presupuesto por dispositivo: máximo de triángulos por fotograma, memoria de texturas y número de luces.
   - Texturas de 1024 px en móvil y 2048 px en ordenador (mismo contenido, distinta resolución).
   - Niveles de calidad (bajo, medio, alto) elegidos automáticamente al arrancar y ajustables a mano.
   - Sombras solo en medio y alto; en bajo, sombras falsas bajo cada personaje.

## Fases con las decisiones aplicadas

**G1. Terreno pintado.** Texturas de hierba, tierra, roca, arena y nieve mezcladas según altura, pendiente y
bioma. Terreno por trozos de 300 m con detalle según la distancia (el mismo tamaño que el suelo de cada pueblo,
para que las costuras coincidan). Sombras del sol en medio y alto.

Estado: **hecho, con dos pendientes.**
- Hecho: texturas de ambientCG (CC0, ver `docs/ASSETS.md`), mezcla por altura, pendiente y bioma en el shader,
  trozos de 15 × 15 celdas de 20 m (300 m) con faldón, anillo lejano con paso según la calidad, agujeros bajo los
  pueblos cargados y alturas tomadas del mismo triángulo que se dibuja (`meshHeight`), así que el personaje no se
  hunde. Calidades bajo / medio / alto (radio 1000 / 1400 / 1800 m; sombras no / 1024 / 2048; píxeles 1 / 1,5 / 2).
  Pruebas en `test/terreno.test.js`.
- Pendiente: las texturas son de 1K (la decisión pide 2K en ordenador, ver `docs/ASSETS.md`); la costura entre
  trozos y el anillo lejano se revisan a ojo en la siguiente pasada.
- Medido en móvil (modo bajo): unos 32 trozos cercanos y sin sombras. La carga de triángulos en móvil viene sobre
  todo de la geometría instanciada de los pueblos completos (faroles, toldos, muros). Eso va en G7.

**G2. Agua y cielo pintados.** Agua con ondas suaves, espuma en la orilla y color según la profundidad. Cielo
con degradado cálido, sol y nubes. La niebla cambia con la hora del día.

**G3. Vegetación pintada.** Árboles y rocas de packs gratuitos, con variedad de forma y color, y hierba en
pequeñas cantidades. El viento se aplica en el shader, sin animar cada hoja.

**G4. Personajes y monstruos.** Tu GLB del personaje y modelos de monstruos de packs gratuitos con animaciones
básicas. Sombra bajo cada personaje también en bajo.

**G5. Efectos de combate.** Impactos, estela de la patada, anillo de la nova y números de daño.

**G6. Interfaz pintada.** Iconos y marcos a juego; tipografía legible en pantallas pequeñas.

**G7. Calidad y móvil.** Medir en un móvil real: fotogramas por segundo, memoria y temperatura. Ajustar los
presets antes de añadir más detalle.

## Primer paso propuesto

G1 en tres partes: (a) elegir y descargar el pack de terreno, con su licencia; (b) pintar el terreno por
bioma con texturas; (c) partir el terreno en trozos con dos niveles de detalle. Antes de añadir nada más se
mide el rendimiento en un móvil real, porque el resultado depende de eso.
