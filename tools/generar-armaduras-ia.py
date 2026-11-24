#!/usr/bin/env python3
"""
Generador de miniaturas de armaduras, piezas individuales y armas/escudos
con Lykon/dreamshaper-xl-v2-turbo en Google Colab (GPU T4) o CUDA local.

Modos (--modo):
  - muestra:       16 imágenes de prueba (3 sets + 10 piezas + 3 armas) para comparar estilos (~1 min)
  - sets_54:       los 54 conjuntos completos de armadura (~3.5 min)
  - sets_y_armas:  54 conjuntos + 100 armas y escudos (~9 min)
  - todo:          54 conjuntos + 270 piezas individuales + 100 armas/escudos (~25 min)

Omite automáticamente las imágenes que ya existen (salvo con --force) y
reconstruye assets/armaduras/manifest.json con todo lo generado hasta el momento.
"""
import argparse
import json
import sys
import time
from pathlib import Path


def cargar_pipeline(model_id: str, device: str):
    import torch
    from diffusers import AutoPipelineForText2Image, DPMSolverMultistepScheduler

    dtype = torch.float16 if device.startswith("cuda") else torch.float32
    print(f"Cargando {model_id} en '{device}' ({dtype})...")
    kwargs = {"torch_dtype": dtype, "use_safetensors": True}
    if device.startswith("cuda"):
        kwargs["variant"] = "fp16"

    pipe = AutoPipelineForText2Image.from_pretrained(model_id, **kwargs)
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
    pipe = pipe.to(device)
    try:
        pipe.enable_attention_slicing()
    except Exception:
        pass
    return pipe


def seleccionar_entradas(data: dict, modo: str):
    if modo == "muestra":
        secciones = ["sets", "piezas", "armas"]
        solo_muestra = True
    elif modo == "sets_54":
        secciones = ["sets"]
        solo_muestra = False
    elif modo == "sets_y_armas":
        secciones = ["sets", "armas"]
        solo_muestra = False
    elif modo == "todo":
        secciones = ["sets", "piezas", "armas"]
        solo_muestra = False
    else:
        raise ValueError(f"Modo desconocido: {modo}")

    elegidas = []
    for sec in secciones:
        for item in data.get(sec, []):
            if solo_muestra and not item.get("muestra"):
                continue
            elegidas.append((sec, item))
    return elegidas


def reconstruir_manifest(data: dict, out_dir: Path, model_id: str) -> dict:
    manifest = {
        "version": "1.0.0",
        "modelo": model_id,
        "sets": {},
        "piezas": {},
        "armas": {},
    }
    for sec in ("sets", "piezas", "armas"):
        for item in data.get(sec, []):
            rel = item["archivo"].replace("\\", "/")
            if (out_dir / rel).exists():
                manifest[sec][item["id"]] = f"assets/armaduras/{rel}"

    m_path = out_dir / "manifest.json"
    m_path.parent.mkdir(parents=True, exist_ok=True)
    with m_path.open("w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
        f.write("\n")
    return manifest


def main():
    parser = argparse.ArgumentParser(description="Genera miniaturas WebP de armaduras, piezas y armas.")
    parser.add_argument("--prompts", default="assets/armaduras/prompts_armaduras.json")
    parser.add_argument("--out", default="assets/armaduras")
    parser.add_argument("--modo", default="muestra", choices=["muestra", "sets_54", "sets_y_armas", "todo"])
    parser.add_argument("--model", default="Lykon/dreamshaper-xl-v2-turbo")
    parser.add_argument("--steps", type=int, default=6)
    parser.add_argument("--guidance", type=float, default=2.0)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    prompts_path = Path(args.prompts)
    out_dir = Path(args.out)
    if not prompts_path.exists():
        print(f"ERROR: No existe {prompts_path}", file=sys.stderr)
        sys.exit(1)

    with prompts_path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    estilo_base = data.get("estilo_base", "")
    neg_base = data.get("negative_prompt", "")
    seleccion = seleccionar_entradas(data, args.modo)

    pendientes = []
    for sec, item in seleccion:
        dst = out_dir / item["archivo"]
        if args.force or not dst.exists():
            pendientes.append((sec, item, dst))

    print(f"Modo '{args.modo}': {len(seleccion)} seleccionadas | {len(pendientes)} pendientes de generar")

    if pendientes:
        import torch
        from PIL import Image

        device = "cuda" if torch.cuda.is_available() else "cpu"
        pipe = cargar_pipeline(args.model, device)

        for i, (sec, item, dst) in enumerate(pendientes, 1):
            dst.parent.mkdir(parents=True, exist_ok=True)
            prompt = f"{item['prompt']}, {estilo_base}".strip(", ")
            gw = int(item.get("gen_width", 768))
            gh = int(item.get("gen_height", 768))
            tw = int(item.get("width", 128))
            th = int(item.get("height", 128))
            seed = int(item.get("seed", 8000 + i))
            gen = torch.Generator(device=device).manual_seed(seed)

            t0 = time.time()
            img = pipe(
                prompt=prompt,
                negative_prompt=neg_base,
                num_inference_steps=args.steps,
                guidance_scale=args.guidance,
                width=gw,
                height=gh,
                generator=gen,
            ).images[0]
            if img.size != (tw, th):
                img = img.resize((tw, th), Image.Resampling.LANCZOS)
            img.save(dst, format="WEBP", quality=88, method=6)
            print(f"[{i}/{len(pendientes)}] OK {sec}/{item['id']} ({tw}x{th}, {time.time() - t0:.1f}s)")

    m = reconstruir_manifest(data, out_dir, args.model)
    print(
        f"Manifest armaduras actualizado: sets={len(m['sets'])}, "
        f"piezas={len(m['piezas'])}, armas={len(m['armas'])}"
    )


if __name__ == "__main__":
    main()
