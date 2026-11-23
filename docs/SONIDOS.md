# Sonidos (efectos de combate y magia)

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
