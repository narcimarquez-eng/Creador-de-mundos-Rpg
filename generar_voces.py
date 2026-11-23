#!/usr/bin/env python3
"""
Generador de doblaje en español (Edge TTS + ffmpeg -> .ogg ligero para web)
para Creador-de-mundos-Rpg.

Uso local:
    python generar_voces.py
    python generar_voces.py --limite 5
    python generar_voces.py --solo-personaje herrero_brann --forzar
"""

import argparse
import asyncio
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

try:
    import edge_tts
except ImportError:
    print(
        "ERROR: Falta la librería 'edge-tts'. Instálala con:\n"
        "  pip install edge-tts imageio-ffmpeg",
        file=sys.stderr,
    )
    sys.exit(1)

# Perfiles de voz en español de España con tono (pitch) y velocidad (rate) por rol/personaje
PERFILES_VOZ = {
    "narrador":          {"voice": "es-ES-AlvaroNeural", "rate": "-6%",  "pitch": "-4Hz"},
    "herrero_brann":     {"voice": "es-ES-AlvaroNeural", "rate": "-4%",  "pitch": "-10Hz"},
    "sabia_elara":       {"voice": "es-ES-ElviraNeural", "rate": "-6%",  "pitch": "-4Hz"},
    "maestro_oren":      {"voice": "es-ES-AlvaroNeural", "rate": "-8%",  "pitch": "-8Hz"},
    "hermana_ysolde":    {"voice": "es-ES-ElviraNeural", "rate": "-3%",  "pitch": "+2Hz"},
    "viejo_tamsin":      {"voice": "es-ES-AlvaroNeural", "rate": "-12%", "pitch": "-12Hz"},
    "erudita_mirel":     {"voice": "es-ES-XimenaNeural", "rate": "-2%",  "pitch": "+0Hz"},
    "mercader_tovi":     {"voice": "es-ES-AlvaroNeural", "rate": "+6%",  "pitch": "+4Hz"},
    "comandante_kaelen": {"voice": "es-ES-AlvaroNeural", "rate": "+2%",  "pitch": "-8Hz"},
    "varek_informante":  {"voice": "es-ES-AlvaroNeural", "rate": "+4%",  "pitch": "-5Hz"},
    "madre_cynthia":     {"voice": "es-ES-XimenaNeural", "rate": "-5%",  "pitch": "-6Hz"},
    "saelen_hereje":     {"voice": "es-ES-AlvaroNeural", "rate": "-6%",  "pitch": "-12Hz"},
    "rowan":             {"voice": "es-ES-AlvaroNeural", "rate": "+4%",  "pitch": "+3Hz"},
    "lyra":              {"voice": "es-ES-XimenaNeural", "rate": "+6%",  "pitch": "+4Hz"},
    "elian":             {"voice": "es-ES-AlvaroNeural", "rate": "-4%",  "pitch": "+2Hz"},
    "brenda":            {"voice": "es-ES-ElviraNeural", "rate": "+5%",  "pitch": "-4Hz"},
    "heroe_guerrero":    {"voice": "es-ES-AlvaroNeural", "rate": "+8%",  "pitch": "-8Hz"},
    "heroe_mago":        {"voice": "es-ES-AlvaroNeural", "rate": "+2%",  "pitch": "-2Hz"},
    "heroe_cazador":     {"voice": "es-ES-AlvaroNeural", "rate": "+10%", "pitch": "+2Hz"},
    "heroe_picaro":      {"voice": "es-ES-XimenaNeural", "rate": "+12%", "pitch": "+2Hz"},
    "guerrero":          {"voice": "es-ES-AlvaroNeural", "rate": "+3%",  "pitch": "-7Hz"},
    "anciano":           {"voice": "es-ES-AlvaroNeural", "rate": "-12%", "pitch": "-10Hz"},
    "mercader":          {"voice": "es-ES-AlvaroNeural", "rate": "+5%",  "pitch": "+4Hz"},
    "guardia":           {"voice": "es-ES-AlvaroNeural", "rate": "+0%",  "pitch": "-6Hz"},
    "trampero":          {"voice": "es-ES-AlvaroNeural", "rate": "-2%",  "pitch": "-6Hz"},
    "pescador":          {"voice": "es-ES-AlvaroNeural", "rate": "-3%",  "pitch": "-4Hz"},
    "herbolario":        {"voice": "es-ES-AlvaroNeural", "rate": "-7%",  "pitch": "-6Hz"},
    "aldeano_hombre":    {"voice": "es-ES-AlvaroNeural", "rate": "+0%",  "pitch": "+0Hz"},
    "aldeano_mujer":     {"voice": "es-ES-ElviraNeural", "rate": "+0%",  "pitch": "+2Hz"},
    "default":           {"voice": "es-ES-AlvaroNeural", "rate": "+0%",  "pitch": "+0Hz"},
}


def localizar_ffmpeg() -> str:
    """Devuelve la ruta al ejecutable de ffmpeg (PATH o imageio-ffmpeg)."""
    ruta = shutil.which("ffmpeg")
    if ruta:
        return ruta
    try:
        import imageio_ffmpeg  # type: ignore

        exe = imageio_ffmpeg.get_ffmpeg_exe()
        if exe and os.path.exists(exe):
            return exe
    except Exception:
        pass
    raise RuntimeError(
        "No se encontró 'ffmpeg'. Instálalo en el sistema o ejecuta: pip install imageio-ffmpeg"
    )


def ogg_valido(path: Path) -> bool:
    """Comprueba que el archivo .ogg exista, tenga tamaño suficiente y cabecera OggS."""
    if not path.exists() or path.stat().st_size < 512:
        return False
    try:
        with path.open("rb") as f:
            return f.read(4) == b"OggS"
    except OSError:
        return False


async def obtener_voces_disponibles() -> set[str]:
    """Consulta las voces disponibles en Edge TTS para validar alternativas."""
    try:
        voces = await edge_tts.list_voices()
        return {v["ShortName"] for v in voces if "ShortName" in v}
    except Exception:
        return {"es-ES-AlvaroNeural", "es-ES-ElviraNeural"}


def resolver_perfil(personaje: str, voces_disponibles: set[str]) -> dict:
    """Devuelve el perfil de voz con respaldo seguro si falta una voz concreta."""
    perfil = dict(PERFILES_VOZ.get(personaje, PERFILES_VOZ["default"]))
    voz = perfil["voice"]
    if voces_disponibles and voz not in voces_disponibles:
        if "Ximena" in voz or "Elvira" in voz:
            perfil["voice"] = (
                "es-ES-ElviraNeural"
                if "es-ES-ElviraNeural" in voces_disponibles
                else "es-ES-AlvaroNeural"
            )
        else:
            perfil["voice"] = (
                "es-ES-AlvaroNeural"
                if "es-ES-AlvaroNeural" in voces_disponibles
                else next(iter(voces_disponibles), "es-ES-AlvaroNeural")
            )
    return perfil


def convertir_mp3_a_ogg(ffmpeg_exe: str, mp3_path: Path, ogg_path: Path) -> None:
    """Convierte el audio MP3 temporal a OGG Vorbis mono ligero para web."""
    ogg_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        ffmpeg_exe,
        "-y",
        "-loglevel",
        "error",
        "-i",
        str(mp3_path),
        "-ac",
        "1",
        "-ar",
        "24000",
        "-c:a",
        "libvorbis",
        "-q:a",
        "3",
        str(ogg_path),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f"ffmpeg falló ({proc.returncode}): {proc.stderr.strip()}")


async def generar_uno(
    item: dict,
    raiz: Path,
    ffmpeg_exe: str,
    voces_disponibles: set[str],
    sem: asyncio.Semaphore,
    forzar: bool,
    tmp_dir: Path,
) -> tuple[str, str]:
    """Genera un único diálogo .ogg con reintentos ante fallos transitorios de red."""
    entrada_id = item["id"]
    personaje = item.get("personaje", "default")
    texto = item["texto"].strip()
    destino = raiz / item["archivo_audio"]

    if not forzar and ogg_valido(destino):
        return entrada_id, "omitido"

    perfil = resolver_perfil(personaje, voces_disponibles)
    mp3_tmp = tmp_dir / f"{entrada_id}.mp3"

    async with sem:
        ultimo_error = None
        for intento in range(1, 4):
            try:
                comunicador = edge_tts.Communicate(
                    text=texto,
                    voice=perfil["voice"],
                    rate=perfil["rate"],
                    pitch=perfil["pitch"],
                )
                await comunicador.save(str(mp3_tmp))
                await asyncio.to_thread(convertir_mp3_a_ogg, ffmpeg_exe, mp3_tmp, destino)
                if not ogg_valido(destino):
                    raise RuntimeError(f"El archivo generado no es un OGG válido: {destino}")
                return entrada_id, "generado"
            except Exception as exc:
                ultimo_error = exc
                if intento < 3:
                    await asyncio.sleep(1.5 * (2 ** (intento - 1)))
            finally:
                if mp3_tmp.exists():
                    try:
                        mp3_tmp.unlink()
                    except OSError:
                        pass
        raise RuntimeError(f"{entrada_id}: {ultimo_error}")


async def ejecutar(args: argparse.Namespace) -> int:
    json_path = Path(args.json).resolve()
    raiz = json_path.parent
    with json_path.open("r", encoding="utf-8") as f:
        dialogos = json.load(f)

    if args.solo_personaje:
        dialogos = [d for d in dialogos if d.get("personaje") == args.solo_personaje]
    if args.limite and args.limite > 0:
        dialogos = dialogos[: args.limite]

    if not dialogos:
        print("No hay diálogos que procesar con los filtros indicados.")
        return 0

    ffmpeg_exe = localizar_ffmpeg()
    voces_disponibles = await obtener_voces_disponibles()
    print(f"Usando ffmpeg: {ffmpeg_exe}")
    print(f"Procesando {len(dialogos)} diálogos (concurrencia={args.concurrencia})...")

    sem = asyncio.Semaphore(max(1, args.concurrencia))
    generados = 0
    omitidos = 0
    errores = []

    with tempfile.TemporaryDirectory(prefix="voces_tts_") as tmp:
        tmp_dir = Path(tmp)
        tareas = [
            asyncio.create_task(
                generar_uno(item, raiz, ffmpeg_exe, voces_disponibles, sem, args.forzar, tmp_dir)
            )
            for item in dialogos
        ]
        total = len(tareas)
        for idx, coro in enumerate(asyncio.as_completed(tareas), start=1):
            try:
                entrada_id, estado = await coro
                if estado == "generado":
                    generados += 1
                else:
                    omitidos += 1
                if idx % 25 == 0 or idx == total:
                    print(f"[{idx}/{total}] generados={generados}, omitidos={omitidos}, errores={len(errores)}")
            except Exception as exc:
                errores.append(str(exc))
                print(f"ERROR [{idx}/{total}]: {exc}", file=sys.stderr)

    print(f"Finalizado: {generados} generados, {omitidos} ya existentes, {len(errores)} errores.")
    return 1 if errores else 0


def main() -> None:
    parser = argparse.ArgumentParser(description="Genera voces .ogg en español desde dialogos_voces.json")
    parser.add_argument(
        "--json",
        default=str(Path(__file__).resolve().parent / "dialogos_voces.json"),
        help="Ruta a dialogos_voces.json",
    )
    parser.add_argument("--concurrencia", type=int, default=6, help="Peticiones TTS simultáneas")
    parser.add_argument("--forzar", action="store_true", help="Regenera audios aunque ya existan")
    parser.add_argument("--limite", type=int, default=0, help="Procesa solo los primeros N diálogos")
    parser.add_argument("--solo-personaje", default="", help="Filtra por un personaje específico")
    args = parser.parse_args()
    sys.exit(asyncio.run(ejecutar(args)))


if __name__ == "__main__":
    main()
