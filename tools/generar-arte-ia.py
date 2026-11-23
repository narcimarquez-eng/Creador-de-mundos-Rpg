#!/usr/bin/env python3
"""
Generador de arte pintado (portada, retratos e iconos RPG) usando
Lykon/dreamshaper-xl-v2-turbo en Google Colab (GPU T4) o local con CUDA.

Uso:
  python tools/generar-arte-ia.py --prompts assets/arte/prompts_arte.json --out assets/arte
  python tools/generar-arte-ia.py --only portada,retratos --force
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
    load_kwargs = {"torch_dtype": dtype, "use_safetensors": True}
    if device.startswith("cuda"):
        load_kwargs["variant"] = "fp16"

    pipe = AutoPipelineForText2Image.from_pretrained(model_id, **load_kwargs)
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
    pipe = pipe.to(device)
    try:
        pipe.enable_attention_slicing()
    except Exception:
        pass
    return pipe


def iterar_entradas(data: dict, secciones: list[str]):
    for seccion in secciones:
        for item in data.get(seccion, []):
            yield seccion, item


def main():
    parser = argparse.ArgumentParser(description="Genera el pack de arte pintado WebP.")
    parser.add_argument("--prompts", default="assets/arte/prompts_arte.json")
    parser.add_argument("--out", default="assets/arte")
    parser.add_argument("--model", default="Lykon/dreamshaper-xl-v2-turbo")
    parser.add_argument("--steps", type=int, default=6)
    parser.add_argument("--guidance", type=float, default=2.0)
    parser.add_argument("--only", default="portada,retratos,iconos",
                        help="Secciones separadas por coma: portada,retratos,iconos")
    parser.add_argument("--force", action="store_true", help="Regenerar aunque ya exista el .webp")
    args = parser.parse_args()

    prompts_path = Path(args.prompts)
    out_dir = Path(args.out)
    if not prompts_path.exists():
        print(f"ERROR: No existe {prompts_path}", file=sys.stderr)
        sys.exit(1)

    with prompts_path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    secciones = [s.strip() for s in args.only.split(",") if s.strip()]
    estilo_base = data.get("estilo_base", "")
    neg_base = data.get("negative_prompt", "")

    pendientes = []
    todos = list(iterar_entradas(data, secciones))
    for seccion, item in todos:
        destino = out_dir / item["archivo"]
        if args.force or not destino.exists():
            pendientes.append((seccion, item, destino))

    print(f"Entradas totales seleccionadas: {len(todos)} | Pendientes de generar: {len(pendientes)}")

    if pendientes:
        import torch
        from PIL import Image

        device = "cuda" if torch.cuda.is_available() else "cpu"
        pipe = cargar_pipeline(args.model, device)

        for idx, (seccion, item, destino) in enumerate(pendientes, 1):
            destino.parent.mkdir(parents=True, exist_ok=True)
            prompt = f"{item['prompt']}, {estilo_base}".strip(", ")
            gen_w = int(item.get("gen_width", item.get("width", 768)))
            gen_h = int(item.get("gen_height", item.get("height", 768)))
            tgt_w = int(item.get("width", gen_w))
            tgt_h = int(item.get("height", gen_h))
            seed = int(item.get("seed", 4200 + idx))
            gen = torch.Generator(device=device).manual_seed(seed)

            t0 = time.time()
            result = pipe(
                prompt=prompt,
                negative_prompt=neg_base,
                num_inference_steps=args.steps,
                guidance_scale=args.guidance,
                width=gen_w,
                height=gen_h,
                generator=gen,
            )
            img = result.images[0]
            if img.size != (tgt_w, tgt_h):
                img = img.resize((tgt_w, tgt_h), Image.Resampling.LANCZOS)
            img.save(destino, format="WEBP", quality=88, method=6)
            dt = time.time() - t0
            print(f"[{idx}/{len(pendientes)}] OK {seccion}/{item['id']} -> {destino} ({tgt_w}x{tgt_h}, {dt:.1f}s)")

    # Reconstruir manifest.json con los archivos realmente presentes en out_dir
    manifest = {
        "version": "1.0.0",
        "modelo": args.model,
        "portada": None,
        "retratos": {},
        "iconos": {},
    }
    for seccion, item in iterar_entradas(data, ["portada", "retratos", "iconos"]):
        rel = item["archivo"].replace("\\", "/")
        if (out_dir / rel).exists():
            url = f"assets/arte/{rel}"
            if seccion == "portada":
                manifest["portada"] = url
            else:
                manifest[seccion][item["id"]] = url

    manifest_path = out_dir / "manifest.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    with manifest_path.open("w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(
        f"Manifest actualizado en {manifest_path}: "
        f"portada={'OK' if manifest['portada'] else 'pendiente'}, "
        f"retratos={len(manifest['retratos'])}, "
        f"iconos={len(manifest['iconos'])}"
    )


if __name__ == "__main__":
    main()
