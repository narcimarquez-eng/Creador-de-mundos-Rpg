# Sonidos (efectos de combate y magia)

## En el juego

Las grabaciones de `sfx/` las reproduce `js/sonidos.js` (`window.Sonidos`). Pasan por su mezclador (bus de SFX,
reverberación y panorama). Si una grabación no carga (abriendo el HTML con doble clic, sin red), suena el efecto
sintetizado de siempre.

| Momento | Grabación (sustituye o acompaña al sintetizado) |
|---|---|
| Golpe con arma que acierta (`Sonidos.impacto('metal')`) | Choque según el arma + `golpe_cuerpo` (impacto en el cuerpo, 4 variantes) |
| Golpe sin arma (`Sonidos.impacto('sordo')`) | `golpe_cuerpo` |
| Golpe crítico | `golpe_crujiente` encima del sintetizado |
| Cada golpe cuerpo a cuerpo (combo y técnicas de arma) | `tajo_aire`, programado para que el silbido caiga justo en el golpe; agudo con dagas, grave con mazas |
| El escudo bloquea un golpe enemigo (`Sonidos.bloqueo`) | `choque_metal` |
| Parada y contraataque, al empezar | `choque_metal` |
| Tornillo triple, Filo relámpago y Salto demoledor | `rayo_carga` durante la animación; al golpear, `rayo_cadena` + `chispazo` |
| Cualquier `Sonidos.rayo` (rayos de monstruos y estallidos) | `rayo_cadena` + `chispazo` |
| Técnicas de arma con elemento rayo (`sw_lightning`, `ax_thunder`, `mc_storm`…) | `rayo_cadena` + `chispazo` al golpear; carga si tardan ≥ 0,5 s |
| Dagas (`dg_*`) | Cada una con su mezcla: Paso de Sombra (zambullida + tajo seco), Corte Fantasma (desenvaine agudo), Asalto Asesino (puñalada doble), Hélice Venenosa (giro doble + veneno), Ráfaga Sombría (cortes que suben de tono), Zigzag Relámpago (chispazos y descarga) |

El golpe que acierta cambia según el arma (`PERFIL_ARMA` en `js/sonidos.js`): las dagas suenan agudas y secas (tono ×1,34);
las espadas, normales; las hachas, más graves; los mandobles y las mazas usan el choque metálico grave. Cada técnica
tiene además un desplazamiento de tono fijo (±6 %) para que no suenen todas igual.

| Archivo | Origen (Sonniss GDC 2026, recortado, mono, normalizado a −1,5 dB) |
|---|---|
| `sfx/espadas/choque_metal_01.ogg` | Melee Weapons Sound Effects Pack 2 · METAL SWING HIT … Resonant Tail 01 |
| `sfx/espadas/choque_corte_01…06.ogg` | Historical Weapons Vol. 2 (344 Audio) · Sword Slide Cuts, Metallic, Impact CM4 2 (6 tomas) |
| `sfx/rayos/rayo_carga_01.ogg` | Arc (InMotionAudio) · ArcPowerUpDesign04, de 4,6 s al final |
| `sfx/rayos/rayo_cadena_01.ogg` | Arc (InMotionAudio) · ArcDesign15 |
| `sfx/rayos/chispazo_01…03.ogg` | Arc (InMotionAudio) · Buzz27, tres trozos de 0,55 s |
| `sfx/espadas/tajo_aire_01.ogg` | Tower Defense Game (ESM) · Action Deploy Units Sword Slice Special Move Layered Swish 04 |
| `sfx/golpes/golpe_cuerpo_01…04.ogg` | Cinematic Fight Vol. 1 (344 Audio) · 4 x Punch, Body 02 (4 tomas) |
| `sfx/golpes/golpe_crujiente_01.ogg` | Anime Game (ESM) · Combat Punch Impact Light Hit Delay Crunchy Vintage Quick Smack 05 |

Para añadir un efecto: pon los `.ogg` en `sfx/<categoria>/` y añádelos a `MUESTRAS` en `js/sonidos.js`.

Los prompts de los efectos están en `sfx/prompts.json`: choques de espadas, rayos y magias, cada uno ligado a la
animación o al evento del juego que lo usa (ver `docs/COMBATE.md`). Están en inglés porque los generadores responden
mejor así.

## Generar con ElevenLabs

```
ELEVENLABS_API_KEY=tu_clave node tools/generar-sfx.mjs --una        # una variante de cada uno (prueba barata)
ELEVENLABS_API_KEY=tu_clave node tools/generar-sfx.mjs espadas      # solo una categoría: espadas, rayos, magia
ELEVENLABS_API_KEY=tu_clave node tools/generar-sfx.mjs rayo_impacto # solo un efecto
```

Los archivos quedan en `sfx/<categoria>/<id>_01.mp3`, `_02.mp3`… Las variantes sirven para no repetir siempre el
mismo choque: el juego puede elegir una al azar y variar un poco el tono (±5 %).

También se pueden pegar los prompts a mano en la web de ElevenLabs (Sound Effects), con la misma duración e
«influencia» del JSON.

## Consejos para escribir prompts

- Describe **material + acción + cola**: «steel longswords clashing… bright ringing… short tail».
- Pide **dry / close-mic** para efectos de juego: la reverb la pone luego el motor según el lugar.
- Para capas, genera por separado (swing + impacto + chispa) y combínalos en el juego.
- Duraciones cortas (0,6–1,5 s) para golpes; 2–3 s para hechizos grandes.

## Sonniss (gratis, sin API)

El GDC Game Audio Bundle de Sonniss es gratis y se puede usar en juegos, también comerciales. La web tiene protección
anti-bots, así que se descarga a mano desde el navegador: gdc.sonniss.com. Basta con los años que te interesen;
cada uno pesa varios GB.

Después de descomprimirlo:

```
node tools/importar-sonniss.mjs ~/Descargas/Sonniss            # lista candidatos en sfx/sonniss-candidatos.md
node tools/importar-sonniss.mjs ~/Descargas/Sonniss --copiar 3 # además copia los 3 mejores de cada efecto
```

El script busca por el nombre del archivo y por la carpeta: «sword clash», «thunder crack», las categorías UCS
(`WEAPSwrd`, `ELECArc`, `MAGElem`…). Con ffmpeg los pasa a `.ogg` mono, de 4 s como máximo, en
`sfx/<categoria>/sonniss/`. Escucha los candidatos y borra los que no encajen.

Licencia: no se puede redistribuir la librería tal cual. Sube solo los sonidos que use el juego, y mejor si el
repositorio es privado.

## Audo AI

Audo no genera efectos: limpia audio (quita ruido, eco, zumbidos). Sirve para grabaciones propias (foley con metal
de verdad) antes de meterlas en `sfx/`.
