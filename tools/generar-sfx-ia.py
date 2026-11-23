#!/usr/bin/env python3
"""
Generador gratuito de efectos de sonido (SFX) por IA (AudioLDM2 + ffmpeg -> .ogg)
pensado para ejecutarse en Google Colab con GPU T4 (o en local con PyTorch/CUDA).

Lee sfx/prompts.json, genera los archivos .ogg que faltan en sfx/<categoria>/<id>_01.ogg...
y actualiza automáticamente sfx/manifest.json para que js/sonidos.js los cargue sin editar código.

Uso en Colab o local:
    python tools/generar-sfx-ia.py --categoria magia
    python tools/generar-sfx-ia.py --categoria arcos
    python tools/generar-sfx-ia.py --solo fuego_bola --variantes 2
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

BASE_SONISS_MANIFEST = {
    "choque_metal": ["sfx/espadas/choque_metal_01.ogg"],
    "choque_corte": [f"sfx/espadas/choque_corte_0{i}.ogg" for i in range(1, 7)],
    "rayo_carga": ["sfx/rayos/rayo_carga_01.ogg"],
    "rayo_cadena": ["sfx/rayos/rayo_cadena_01.ogg"],
    "chispazo": [f"sfx/rayos/chispazo_0{i}.ogg" for i in range(1, 4)],
    "tajo_aire": ["sfx/espadas/tajo_aire_01.ogg"],
    "golpe_cuerpo": [f"sfx/golpes/golpe_cuerpo_0{i}.ogg" for i in range(1, 5)],
    "golpe_crujiente": ["sfx/golpes/golpe_crujiente_01.ogg"],
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
    raise RuntimeError("No se encontró 'ffmpeg'. Instálalo con apt-get install -y ffmpeg")


def ogg_valido(path: Path) -> bool:
    if not path.exists() or path.stat().st_size < 512:
        return False
    try:
        with path.open("rb") as f:
            return f.read(4) == b"OggS"
    except OSError:
        return False


def convertir_wav_a_ogg(ffmpeg_exe: str, wav_path: Path, ogg_path: Path, duracion: float) -> None:
    ogg_path.parent.mkdir(parents=True, exist_ok=True)
    fade_st = max(0.2, float(duracion) - 0.18)
    filtro = f"loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=out:st={fade_st:.2f}:d=0.18"
    cmd = [
        ffmpeg_exe,
        "-y",
        "-loglevel",
        "error",
        "-i",
        str(wav_path),
        "-t",
        f"{float(duracion):.2f}",
        "-ac",
        "1",
        "-ar",
        "44100",
        "-af",
        filtro,
        "-c:a",
        "libvorbis",
        "-q:a",
        "5",
        str(ogg_path),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f"ffmpeg falló ({proc.returncode}): {proc.stderr.strip()}")


def actualizar_manifest(raiz: Path, prompts: list[dict]) -> Path:
    manifest: dict[str, list[str]] = {}
    for clave, rutas in BASE_SONISS_MANIFEST.items():
        existentes = [r for r in rutas if ogg_valido(raiz / r)]
        if existentes:
            manifest[clave] = existentes

    for item in prompts:
        clave = item.get("clave_muestra")
        cat = item.get("categoria")
        sid = item.get("id")
        if not clave or not cat or not sid:
            continue
        carpeta = raiz / "sfx" / cat
        if not carpeta.exists():
            continue
        encontrados = sorted(
            f"sfx/{cat}/{p.name}"
            for p in carpeta.glob(f"{sid}_*.ogg")
            if ogg_valido(p)
        )
        if encontrados:
            previos = manifest.setdefault(clave, [])
            for rel in encontrados:
                if rel not in previos:
                    previos.append(rel)

    manifest_path = raiz / "sfx" / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return manifest_path


def cargar_pipeline(modelo_id: str):
    import torch
    from diffusers import AudioLDM2Pipeline

    device = "cuda" if torch.cuda.is_available() else "cpu"
    dtype = torch.float16 if device == "cuda" else torch.float32
    print(f"Cargando {modelo_id} en {device} ({dtype})...")
    try:
        pipe = AudioLDM2Pipeline.from_pretrained(modelo_id, dtype=dtype)
    except TypeError:
        pipe = AudioLDM2Pipeline.from_pretrained(modelo_id, torch_dtype=dtype)

    # Parche de compatibilidad para transformers >= 5.0 donde GPT2Model no hereda GenerationMixin
    lm = getattr(pipe, "language_model", None)
    if lm is not None and not hasattr(lm, "_update_model_kwargs_for_generation"):
        import functools

        if getattr(lm, "config", None) is not None:
            lm.config.output_hidden_states = True

        orig_forward = lm.forward

        @functools.wraps(orig_forward)
        def _compat_forward(*f_args, **f_kwargs):
            f_kwargs["output_hidden_states"] = True
            f_kwargs["return_dict"] = True
            f_kwargs.pop("past_key_values", None)
            f_kwargs["use_cache"] = False
            out = orig_forward(*f_args, **f_kwargs)
            if getattr(out, "hidden_states", None) is None and getattr(out, "last_hidden_state", None) is not None:
                out.hidden_states = (out.last_hidden_state,)
            return out

        def _update_model_kwargs_for_generation(outputs, model_kwargs, **kwargs):
            nuevos = dict(model_kwargs)
            nuevos["past_key_values"] = None
            nuevos["use_cache"] = False
            mask = nuevos.get("attention_mask")
            if mask is not None:
                nuevos["attention_mask"] = torch.cat([mask, mask.new_ones((mask.shape[0], 1))], dim=-1)
            return nuevos

        lm.forward = _compat_forward
        lm._update_model_kwargs_for_generation = _update_model_kwargs_for_generation

    pipe = pipe.to(device)
    return pipe, device, torch


def main() -> int:
    parser = argparse.ArgumentParser(description="Genera SFX de habilidades en .ogg usando AudioLDM2")
    parser.add_argument("--prompts", default=str(Path(__file__).resolve().parent.parent / "sfx" / "prompts.json"))
    parser.add_argument("--modelo", default="cvssp/audioldm2")
    parser.add_argument("--categoria", default="", help="Filtra por categoría (magia, arcos, espadas, rayos)")
    parser.add_argument("--solo", default="", help="Filtra por un id concreto de prompts.json")
    parser.add_argument("--variantes", type=int, default=2, help="Variantes máximas a generar por efecto")
    parser.add_argument("--pasos", type=int, default=60, help="Pasos de inferencia de AudioLDM2")
    parser.add_argument("--forzar", action="store_true", help="Regenera .ogg aunque ya existan")
    parser.add_argument("--solo-manifest", action="store_true", help="Solo reconstruye sfx/manifest.json sin generar audio")
    args = parser.parse_args()

    prompts_path = Path(args.prompts).resolve()
    raiz = prompts_path.parent.parent
    data = json.loads(prompts_path.read_text(encoding="utf-8"))
    sonidos = data.get("sonidos", [])

    if args.solo_manifest:
        mpath = actualizar_manifest(raiz, sonidos)
        print(f"Manifest actualizado: {mpath}")
        return 0

    seleccion = sonidos
    if args.categoria:
        seleccion = [s for s in seleccion if s.get("categoria") == args.categoria]
    if args.solo:
        seleccion = [s for s in seleccion if s.get("id") == args.solo]
    if not args.solo and not args.categoria:
        # Por defecto prioriza magia y arcos + skills clave que tienen clave_muestra y no existen aún
        seleccion = [s for s in seleccion if s.get("clave_muestra")]

    pendientes = []
    for s in seleccion:
        n_var = max(1, min(args.variantes, int(s.get("variantes", 2))))
        for v in range(1, n_var + 1):
            destino = raiz / "sfx" / s["categoria"] / f"{s['id']}_{v:02d}.ogg"
            if args.forzar or not ogg_valido(destino):
                pendientes.append((s, v, destino))

    if not pendientes:
        mpath = actualizar_manifest(raiz, sonidos)
        print(f"Todos los SFX seleccionados ya existen. Manifest al día: {mpath}")
        return 0

    ffmpeg_exe = localizar_ffmpeg()
    pipe, device, torch = cargar_pipeline(args.modelo)
    import numpy as np
    from scipy.io.wavfile import write as wav_write

    negative_prompt = "music, speech, singing, voice, muffled, low quality, distortion, clipping"
    with tempfile.TemporaryDirectory(prefix="sfx_ia_") as tmp:
        tmp_dir = Path(tmp)
        for idx, (item, v, destino) in enumerate(pendientes, start=1):
            dur = max(0.8, min(5.0, float(item.get("duration", 1.8))))
            seed = 1000 + idx * 37 + v
            gen = torch.Generator(device=device).manual_seed(seed)
            print(f"[{idx}/{len(pendientes)}] Generando {destino.relative_to(raiz)} ({dur:.1f}s)...")
            audio = pipe(
                prompt=item["text"],
                negative_prompt=negative_prompt,
                num_inference_steps=args.pasos,
                audio_length_in_s=dur,
                generator=gen,
            ).audios[0]
            pico = float(np.max(np.abs(audio))) or 1.0
            pcm = np.clip(audio / pico * 0.92, -1.0, 1.0)
            wav_tmp = tmp_dir / f"{item['id']}_{v:02d}.wav"
            wav_write(str(wav_tmp), 16000, (pcm * 32767).astype(np.int16))
            convertir_wav_a_ogg(ffmpeg_exe, wav_tmp, destino, dur)

    mpath = actualizar_manifest(raiz, sonidos)
    print(f"Generación completa. Manifest actualizado en {mpath}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
