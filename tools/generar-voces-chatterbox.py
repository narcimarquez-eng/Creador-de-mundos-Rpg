#!/usr/bin/env python3
"""
Generador expresivo de voces en español usando Chatterbox Multilingual (Resemble AI)
+ cadena de procesado dramático/combate en ffmpeg -> .ogg ligero para web.

Pensado para ejecutarse en Google Colab con GPU T4 (gratuita) usando voces_skills.json
y/o dialogos_voces.json, con soporte opcional de audios de referencia (5-10 s) para
clonar tono, rabia, susurro o desgarro actoral.

Ejemplos:
    python tools/generar-voces-chatterbox.py --listar-perfiles
    python tools/generar-voces-chatterbox.py --json voces_skills.json --forzar --exaggeration-mult 1.1
    python tools/generar-voces-chatterbox.py --json dialogos_voces.json --solo-personaje herrero_brann --forzar
"""

import argparse
import inspect
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import types
from pathlib import Path

EXTENSIONES_AUDIO = (".wav", ".ogg", ".mp3", ".m4a", ".flac")

# Perfiles actorales por personaje/rol (ajustados para tono serio y oscuro, evitando bucles y sobre-actuación cómica):
# - exaggeration: 0.50 neutro; 0.65-0.82 intenso y serio (el desgarro real viene del audio de referencia)
# - cfg_weight: 0.45-0.55 mantiene fidelidad al timbre de referencia y evita repeticiones en frases cortas
# - estilo_fx: 'combate' | 'dramatico' | 'narrador' | 'dialogo'
# - grupo_ref: respaldo en referencias_voz/ si no existe un clip específico del personaje
PERFILES_EMOCION = {
    # Héroe en combate (voces_skills.json)
    "heroe_guerrero":    {"exaggeration": 0.80, "cfg_weight": 0.50, "estilo_fx": "combate",   "grupo_ref": "combate_hombre"},
    "heroe_mago":        {"exaggeration": 0.74, "cfg_weight": 0.52, "estilo_fx": "combate",   "grupo_ref": "combate_hombre"},
    "heroe_cazador":     {"exaggeration": 0.76, "cfg_weight": 0.52, "estilo_fx": "combate",   "grupo_ref": "combate_hombre"},
    "heroe_picaro":      {"exaggeration": 0.75, "cfg_weight": 0.52, "estilo_fx": "combate",   "grupo_ref": "combate_mujer"},

    # Compañeros
    "rowan":             {"exaggeration": 0.72, "cfg_weight": 0.52, "estilo_fx": "dramatico", "grupo_ref": "combate_hombre"},
    "lyra":              {"exaggeration": 0.75, "cfg_weight": 0.52, "estilo_fx": "combate",   "grupo_ref": "combate_mujer"},
    "elian":             {"exaggeration": 0.68, "cfg_weight": 0.54, "estilo_fx": "dramatico", "grupo_ref": "dramatico_hombre"},
    "brenda":            {"exaggeration": 0.82, "cfg_weight": 0.48, "estilo_fx": "combate",   "grupo_ref": "combate_mujer"},

    # Narrador y personajes principales de la historia
    "narrador":          {"exaggeration": 0.66, "cfg_weight": 0.52, "estilo_fx": "narrador",  "grupo_ref": "narrador"},
    "herrero_brann":     {"exaggeration": 0.80, "cfg_weight": 0.48, "estilo_fx": "dramatico", "grupo_ref": "dramatico_hombre"},
    "sabia_elara":       {"exaggeration": 0.68, "cfg_weight": 0.54, "estilo_fx": "dramatico", "grupo_ref": "dramatico_mujer"},
    "maestro_oren":      {"exaggeration": 0.65, "cfg_weight": 0.54, "estilo_fx": "dramatico", "grupo_ref": "dramatico_hombre"},
    "hermana_ysolde":    {"exaggeration": 0.72, "cfg_weight": 0.52, "estilo_fx": "dramatico", "grupo_ref": "dramatico_mujer"},
    "viejo_tamsin":      {"exaggeration": 0.74, "cfg_weight": 0.48, "estilo_fx": "dramatico", "grupo_ref": "dramatico_hombre"},
    "erudita_mirel":     {"exaggeration": 0.66, "cfg_weight": 0.55, "estilo_fx": "dramatico", "grupo_ref": "dramatico_mujer"},
    "comandante_kaelen": {"exaggeration": 0.78, "cfg_weight": 0.50, "estilo_fx": "dramatico", "grupo_ref": "combate_hombre"},
    "saelen_hereje":     {"exaggeration": 0.78, "cfg_weight": 0.48, "estilo_fx": "dramatico", "grupo_ref": "dramatico_hombre"},
    "madre_cynthia":     {"exaggeration": 0.72, "cfg_weight": 0.52, "estilo_fx": "dramatico", "grupo_ref": "dramatico_mujer"},
    "varek_informante":  {"exaggeration": 0.68, "cfg_weight": 0.54, "estilo_fx": "dialogo",   "grupo_ref": "dramatico_hombre"},
    "mercader_tovi":     {"exaggeration": 0.62, "cfg_weight": 0.56, "estilo_fx": "dialogo",   "grupo_ref": "dramatico_hombre"},

    # Roles genéricos y cabañas
    "guerrero":          {"exaggeration": 0.78, "cfg_weight": 0.50, "estilo_fx": "combate",   "grupo_ref": "combate_hombre"},
    "guardia":           {"exaggeration": 0.74, "cfg_weight": 0.52, "estilo_fx": "dramatico", "grupo_ref": "combate_hombre"},
    "trampero":          {"exaggeration": 0.70, "cfg_weight": 0.52, "estilo_fx": "dramatico", "grupo_ref": "dramatico_hombre"},
    "pescador":          {"exaggeration": 0.65, "cfg_weight": 0.54, "estilo_fx": "dialogo",   "grupo_ref": "dramatico_hombre"},
    "herbolario":        {"exaggeration": 0.64, "cfg_weight": 0.55, "estilo_fx": "dialogo",   "grupo_ref": "dramatico_hombre"},
    "anciano":           {"exaggeration": 0.70, "cfg_weight": 0.50, "estilo_fx": "dramatico", "grupo_ref": "dramatico_hombre"},
    "mercader":          {"exaggeration": 0.60, "cfg_weight": 0.56, "estilo_fx": "dialogo",   "grupo_ref": "dramatico_hombre"},
    "aldeano_hombre":    {"exaggeration": 0.60, "cfg_weight": 0.56, "estilo_fx": "dialogo",   "grupo_ref": "dramatico_hombre"},
    "aldeano_mujer":     {"exaggeration": 0.62, "cfg_weight": 0.56, "estilo_fx": "dialogo",   "grupo_ref": "dramatico_mujer"},
    "default":           {"exaggeration": 0.66, "cfg_weight": 0.54, "estilo_fx": "dialogo",   "grupo_ref": "narrador"},
}


def localizar_ffmpeg() -> str:
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
    raise RuntimeError("No se encontró 'ffmpeg'. Instálalo con apt-get install -y ffmpeg o pip install imageio-ffmpeg")


def ogg_valido(path: Path) -> bool:
    if not path.exists() or path.stat().st_size < 512:
        return False
    try:
        with path.open("rb") as f:
            return f.read(4) == b"OggS"
    except OSError:
        return False


def asegurar_stub_pkuseg() -> None:
    """Evita fallos en Colab si spacy_pkuseg no se compiló (solo usamos language_id='es')."""
    try:
        import spacy_pkuseg  # type: ignore  # noqa: F401
    except ImportError:
        mod = types.ModuleType("spacy_pkuseg")

        class _StubPkuseg:
            def __init__(self, *args, **kwargs):
                pass

            def cut(self, text):
                return list(str(text))

        mod.pkuseg = _StubPkuseg
        sys.modules["spacy_pkuseg"] = mod


def cargar_modelo():
    import torch

    asegurar_stub_pkuseg()
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS  # type: ignore

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Cargando ChatterboxMultilingualTTS en '{device}'...")
    modelo = ChatterboxMultilingualTTS.from_pretrained(device=device)
    return modelo, torch, device


def dividir_texto_largo(texto: str, max_chars: int = 220) -> list[str]:
    """Divide textos largos por frases para evitar recortes en el modelo TTS."""
    limpio = re.sub(r"\s+", " ", texto).strip()
    if len(limpio) <= max_chars:
        return [limpio] if limpio else []
    frases = re.split(r"(?<=[.!?…])\s+", limpio)
    bloques: list[str] = []
    actual = ""
    for fr in frases:
        if not fr:
            continue
        if actual and len(actual) + 1 + len(fr) > max_chars:
            bloques.append(actual)
            actual = fr
        elif len(fr) > max_chars:
            if actual:
                bloques.append(actual)
                actual = ""
            sub = re.split(r"(?<=[,;:])\s+", fr)
            for s in sub:
                if actual and len(actual) + 1 + len(s) > max_chars:
                    bloques.append(actual)
                    actual = s
                else:
                    actual = (actual + " " + s).strip()
        else:
            actual = (actual + " " + fr).strip()
    if actual:
        bloques.append(actual)
    return bloques


def buscar_referencia(personaje: str, grupo_ref: str, dir_refs: Path) -> Path | None:
    if not dir_refs.exists():
        return None
    candidatos = [personaje, grupo_ref]
    if personaje.startswith("heroe_") and "combate_hombre" not in candidatos:
        candidatos.append("combate_hombre")
    candidatos.append("default")
    for nombre in candidatos:
        if not nombre:
            continue
        for ext in EXTENSIONES_AUDIO:
            p = dir_refs / f"{nombre}{ext}"
            if p.exists() and p.is_file() and p.stat().st_size > 1000:
                return p
    return None


def preparar_referencia_wav(ref_path: Path | None, ffmpeg_exe: str, cache_dir: Path, cache: dict[Path, Path]) -> str | None:
    if ref_path is None:
        return None
    if ref_path.suffix.lower() == ".wav":
        return str(ref_path)
    if ref_path in cache:
        return str(cache[ref_path])
    out_wav = cache_dir / f"ref_{ref_path.stem}.wav"
    cmd = [
        ffmpeg_exe, "-y", "-loglevel", "error",
        "-i", str(ref_path),
        "-ac", "1", "-ar", "24000",
        str(out_wav),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f"No se pudo convertir referencia {ref_path}: {proc.stderr.strip()}")
    cache[ref_path] = out_wav
    return str(out_wav)


def resolver_velocidad(estilo_fx: str, vel_arg: float) -> float:
    if vel_arg and vel_arg > 0:
        return max(0.75, min(1.50, float(vel_arg)))
    return 1.12 if estilo_fx == "combate" else 1.0


def filtro_ffmpeg(estilo_fx: str, sin_fx: bool, velocidad: float = 1.0) -> str:
    if sin_fx:
        base = "loudnorm=I=-16:TP=-1.5:LRA=11"
        return f"atempo={velocidad:.3f},{base}" if abs(velocidad - 1.0) >= 0.01 else base

    tempo_prefix = f"atempo={velocidad:.3f}," if abs(velocidad - 1.0) >= 0.01 else ""
    if estilo_fx == "combate":
        # Recorte de silencio inicial para ataque instantáneo + presencia + pegada + leve raspado cálido + eco corto
        return (
            "silenceremove=start_periods=1:start_duration=0:start_threshold=-42dB,"
            "highpass=f=80,"
            "equalizer=f=140:width_type=o:width=1.2:g=2.5,"
            "equalizer=f=2800:width_type=o:width=1.4:g=3.5,"
            "acompressor=threshold=-20dB:ratio=4.5:attack=4:release=70:makeup=2,"
            "asoftclip=type=tanh:param=1.6,"
            "aecho=0.8:0.85:28:0.16,"
            + tempo_prefix
            + "loudnorm=I=-14:TP=-1.5:LRA=9"
        )
    if estilo_fx == "dramatico":
        return (
            "silenceremove=start_periods=1:start_duration=0:start_threshold=-45dB,"
            "highpass=f=75,"
            "equalizer=f=150:width_type=o:width=1.2:g=2.0,"
            "equalizer=f=2400:width_type=o:width=1.4:g=2.0,"
            "acompressor=threshold=-22dB:ratio=3.2:attack=8:release=110:makeup=1.5,"
            "aecho=0.8:0.85:22:0.10,"
            + tempo_prefix
            + "loudnorm=I=-15:TP=-1.5:LRA=10"
        )
    if estilo_fx == "narrador":
        return (
            "highpass=f=70,"
            "equalizer=f=130:width_type=o:width=1.2:g=2.2,"
            "acompressor=threshold=-22dB:ratio=2.8:attack=10:release=120:makeup=1.5,"
            + tempo_prefix
            + "loudnorm=I=-16:TP=-1.5:LRA=11"
        )
    return (
        "highpass=f=80,"
        "acompressor=threshold=-22dB:ratio=2.5:attack=10:release=120,"
        + tempo_prefix
        + "loudnorm=I=-16:TP=-1.5:LRA=11"
    )


def convertir_wav_a_ogg(
    ffmpeg_exe: str, wav_path: Path, ogg_path: Path, estilo_fx: str, sin_fx: bool, velocidad: float = 1.0
) -> None:
    ogg_path.parent.mkdir(parents=True, exist_ok=True)
    af = filtro_ffmpeg(estilo_fx, sin_fx, velocidad)
    cmd = [
        ffmpeg_exe, "-y", "-loglevel", "error",
        "-i", str(wav_path),
        "-ac", "1", "-ar", "24000",
        "-af", af,
        "-c:a", "libvorbis", "-q:a", "4",
        str(ogg_path),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f"ffmpeg falló ({proc.returncode}): {proc.stderr.strip()}")


def imprimir_perfiles() -> None:
    print("Perfiles emocionales disponibles para Chatterbox Multilingual:")
    for pers, cfg in PERFILES_EMOCION.items():
        print(
            f"  - {pers:18s} | exag={cfg['exaggeration']:.2f} | cfg={cfg['cfg_weight']:.2f} "
            f"| fx={cfg['estilo_fx']:9s} | ref_grupo={cfg['grupo_ref']}"
        )


def main() -> int:
    raiz_defecto = Path(__file__).resolve().parent.parent
    parser = argparse.ArgumentParser(
        description="Genera voces expresivas en español (.ogg) con Chatterbox Multilingual"
    )
    parser.add_argument(
        "--json",
        nargs="+",
        default=[str(raiz_defecto / "voces_skills.json")],
        help="Uno o más JSON de diálogos/skills (ej: voces_skills.json dialogos_voces.json)",
    )
    parser.add_argument(
        "--referencias",
        default=str(raiz_defecto / "referencias_voz"),
        help="Carpeta con audios de referencia 5-10s por personaje o grupo (opcional)",
    )
    parser.add_argument("--exaggeration-mult", type=float, default=1.0, help="Multiplicador global de emoción (ej: 1.15)")
    parser.add_argument("--velocidad", type=float, default=0.0, help="Velocidad sin cambiar tono (ej: 1.15; 0 = 1.12x en combate)")
    parser.add_argument("--solo-personaje", default="", help="Filtra por personaje exacto")
    parser.add_argument("--solo-id", nargs="+", default=[], help="Filtra por uno o más IDs exactos")
    parser.add_argument("--limite", type=int, default=0, help="Procesa solo los primeros N elementos")
    parser.add_argument("--forzar", action="store_true", help="Regenera audios aunque ya existan")
    parser.add_argument("--sin-fx", action="store_true", help="Desactiva filtros de pegada/combate en ffmpeg")
    parser.add_argument("--listar-perfiles", action="store_true", help="Muestra la tabla de perfiles y sale")
    args = parser.parse_args()

    if args.listar_perfiles:
        imprimir_perfiles()
        return 0

    entradas: list[tuple[Path, dict]] = []
    for j_arg in args.json:
        jp = Path(j_arg).resolve()
        if not jp.exists():
            print(f"ERROR: No existe el archivo JSON: {jp}", file=sys.stderr)
            return 1
        data = json.loads(jp.read_text(encoding="utf-8"))
        for item in data:
            entradas.append((jp.parent, item))

    if args.solo_personaje:
        entradas = [(r, d) for r, d in entradas if d.get("personaje") == args.solo_personaje]
    if args.solo_id:
        ids_set = set(args.solo_id)
        entradas = [(r, d) for r, d in entradas if d.get("id") in ids_set]
    if args.limite and args.limite > 0:
        entradas = entradas[: args.limite]

    if not entradas:
        print("No hay líneas que procesar con los filtros indicados.")
        return 0

    pendientes = []
    omitidos = 0
    for raiz_item, item in entradas:
        dest = raiz_item / item["archivo_audio"]
        if not args.forzar and ogg_valido(dest):
            omitidos += 1
        else:
            pendientes.append((raiz_item, item, dest))

    if not pendientes:
        print(f"Todos los archivos ({omitidos}) ya existen y son válidos. Usa --forzar para regenerarlos.")
        return 0

    ffmpeg_exe = localizar_ffmpeg()
    modelo, torch, _ = cargar_modelo()
    import torchaudio as ta

    try:
        sig_params = set(inspect.signature(modelo.generate).parameters.keys())
    except Exception:
        sig_params = set()

    dir_refs = Path(args.referencias).resolve()
    generados = 0
    errores = 0
    cache_refs: dict[Path, Path] = {}

    with tempfile.TemporaryDirectory(prefix="chatterbox_voces_") as tmp:
        tmp_dir = Path(tmp)
        pausa = torch.zeros((1, int(modelo.sr * 0.20)), dtype=torch.float32)

        total = len(pendientes)
        for idx, (raiz_item, item, destino) in enumerate(pendientes, start=1):
            eid = item["id"]
            pers = item.get("personaje", "default")
            texto = str(item.get("texto", "")).strip()
            perfil = PERFILES_EMOCION.get(pers, PERFILES_EMOCION["default"])
            exag = max(0.25, min(1.25, perfil["exaggeration"] * float(args.exaggeration_mult)))
            cfg = perfil["cfg_weight"]
            estilo_fx = perfil["estilo_fx"]

            ref_raw = buscar_referencia(pers, perfil["grupo_ref"], dir_refs)
            try:
                ref_wav = preparar_referencia_wav(ref_raw, ffmpeg_exe, tmp_dir, cache_refs)
                bloques = dividir_texto_largo(texto)
                piezas_wav = []
                for b_idx, bloque in enumerate(bloques):
                    gen_kwargs = {
                        "text": bloque,
                        "language_id": "es",
                        "audio_prompt_path": ref_wav,
                        "exaggeration": exag,
                        "cfg_weight": cfg,
                    }
                    if "repetition_penalty" in sig_params:
                        gen_kwargs["repetition_penalty"] = 1.4
                    if "temperature" in sig_params:
                        gen_kwargs["temperature"] = 0.72
                    if "min_p" in sig_params:
                        gen_kwargs["min_p"] = 0.05
                    wav = modelo.generate(**gen_kwargs)
                    if wav.dim() == 1:
                        wav = wav.unsqueeze(0)
                    piezas_wav.append(wav.detach().cpu().float())
                    if b_idx < len(bloques) - 1:
                        piezas_wav.append(pausa)

                wav_final = torch.cat(piezas_wav, dim=1) if len(piezas_wav) > 1 else piezas_wav[0]
                wav_tmp = tmp_dir / f"{eid}.wav"
                ta.save(str(wav_tmp), wav_final, modelo.sr)
                vel = resolver_velocidad(estilo_fx, args.velocidad)
                convertir_wav_a_ogg(ffmpeg_exe, wav_tmp, destino, estilo_fx, args.sin_fx, vel)
                if not ogg_valido(destino):
                    raise RuntimeError(f"OGG generado inválido: {destino}")
                generados += 1
                ref_info = ref_raw.name if ref_raw else "voz-base"
                print(f"[{idx}/{total}] OK {eid} ({pers}, exag={exag:.2f}, vel={vel:.2f}x, ref={ref_info})")
            except Exception as exc:
                errores += 1
                print(f"[{idx}/{total}] ERROR {eid}: {exc}", file=sys.stderr)

    print(f"Finalizado: {generados} generados, {omitidos} omitidos, {errores} errores.")
    return 1 if errores else 0


if __name__ == "__main__":
    sys.exit(main())
