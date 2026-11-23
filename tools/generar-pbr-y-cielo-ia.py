#!/usr/bin/env python3
"""
Generador combinado de:
  - Opción 2 (pbr): Mapas Normal + Roughness (PBR) con Depth-Anything-V2-Small-hf
    para terreno (15 capas del atlas) y todas las texturas de pueblos/mazmorras/props.
  - Opción 3 (cielos): 3 skyboxes equirectangulares 360° sin costura horizontal
    (día, atardecer, noche) con Lykon/dreamshaper-xl-v2-turbo en GPU T4.

Uso:
  python tools/generar-pbr-y-cielo-ia.py --src /content/fuente_tex --out /content/pbr_out
"""
import argparse
import gc
import json
import sys
import time
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image

TERRENO_CAPAS = [5, 6, 3, 32, 34, 36, 70, 59, 62, 89, 24, 52, 90, 92, 99]
GRUPOS_TEX = [
    "piedra", "madera", "tejados", "suelo",
    "mpared", "msuelo", "mmuro", "mlosa",
    "alfombras", "murales"
]

ROUGHNESS_RANGOS = {
    "piedra": (0.58, 0.94),
    "mpared": (0.58, 0.94),
    "mmuro": (0.58, 0.94),
    "suelo": (0.52, 0.92),
    "msuelo": (0.52, 0.92),
    "mlosa": (0.52, 0.92),
    "madera": (0.62, 0.92),
    "tejados": (0.50, 0.88),
    "alfombras": (0.65, 0.94),
    "murales": (0.65, 0.94),
    "terreno": (0.60, 0.95),
}

CIELOS_DEF = [
    {
        "preset": "day",
        "archivo": "cielos/dia.webp",
        "seed": 7101,
        "suelo_rgb": (75, 99, 78),
        "prompt": (
            "360 equirectangular panorama fantasy medieval daytime sky, "
            "sweeping painterly cumulus clouds in crisp cerulean zenith fading to soft sunlit horizon mist, "
            "Lineage 2 concept art skybox, no ground objects, no text"
        ),
    },
    {
        "preset": "golden",
        "archivo": "cielos/atardecer.webp",
        "seed": 7102,
        "suelo_rgb": (42, 34, 59),
        "prompt": (
            "360 equirectangular panorama epic fantasy medieval golden hour sunset sky, "
            "luminous amber and coral clouds, violet twilight zenith, warm horizon glow, "
            "Lineage 2 concept art skybox, no ground objects, no text"
        ),
    },
    {
        "preset": "night",
        "archivo": "cielos/noche.webp",
        "seed": 7103,
        "suelo_rgb": (5, 10, 24),
        "prompt": (
            "360 equirectangular panorama dark medieval fantasy night sky, "
            "deep midnight indigo zenith, subtle starry nebula band and wispy silver moonlit clouds near horizon, "
            "Lineage 2 concept art skybox, no ground objects, no text"
        ),
    },
]

SKY_NEGATIVE = (
    "buildings, trees, mountains, ground, characters, people, text, watermark, "
    "signature, frame, border, blurry, seam, visible edge"
)


def suavizado_caja_wrap(arr: np.ndarray, radio: int = 3) -> np.ndarray:
    """Desenfoque rápido por media móvil con borde envolvente (sin costuras)."""
    k = 2 * radio + 1
    out = arr.astype(np.float32)
    acc_x = np.zeros_like(out)
    for dx in range(-radio, radio + 1):
        acc_x += np.roll(out, dx, axis=1)
    acc_x /= k
    acc_y = np.zeros_like(out)
    for dy in range(-radio, radio + 1):
        acc_y += np.roll(acc_x, dy, axis=0)
    return acc_y / k


def calcular_normal_y_roughness(
    pil_img: Image.Image,
    model,
    processor,
    device: str,
    grupo: str,
    strength: float = 2.6,
):
    """Calcula Normal RGB y Roughness L sin costuras combinando Depth Anything V2 + micro-relieve."""
    rgb = np.asarray(pil_img.convert("RGB"), dtype=np.uint8)
    h, w, _ = rgb.shape
    pad_y = max(16, int(round(h * 0.25)))
    pad_x = max(16, int(round(w * 0.25)))
    padded = np.pad(rgb, ((pad_y, pad_y), (pad_x, pad_x), (0, 0)), mode="wrap")
    padded_pil = Image.fromarray(padded)

    inputs = processor(images=padded_pil, return_tensors="pt")
    inputs = {k: v.to(device) for k, v in inputs.items()}
    with torch.no_grad():
        outputs = model(**inputs)
        pred = outputs.predicted_depth
        pred_up = F.interpolate(
            pred.unsqueeze(1),
            size=(padded.shape[0], padded.shape[1]),
            mode="bicubic",
            align_corners=False,
        ).squeeze(0).squeeze(0)

    depth_crop = pred_up[pad_y:pad_y + h, pad_x:pad_x + w].float().cpu().numpy()
    d_min, d_max = float(depth_crop.min()), float(depth_crop.max())
    if d_max - d_min > 1e-6:
        depth_norm = (depth_crop - d_min) / (d_max - d_min)
    else:
        depth_norm = np.full((h, w), 0.5, dtype=np.float32)

    rf = rgb.astype(np.float32) / 255.0
    gray = 0.299 * rf[:, :, 0] + 0.587 * rf[:, :, 1] + 0.114 * rf[:, :, 2]
    low = suavizado_caja_wrap(gray, radio=4)
    high = gray - low
    h_std = float(high.std())
    if h_std > 1e-5:
        micro_norm = np.clip(0.5 + (high / (4.5 * h_std)), 0.0, 1.0)
    else:
        micro_norm = np.full((h, w), 0.5, dtype=np.float32)

    height = np.clip(0.68 * depth_norm + 0.32 * micro_norm, 0.0, 1.0)

    # Sobel con np.roll (borde envolvente para continuidad perfecta al repetir UV)
    h_tl = np.roll(np.roll(height, 1, axis=0), 1, axis=1)
    h_t = np.roll(height, 1, axis=0)
    h_tr = np.roll(np.roll(height, 1, axis=0), -1, axis=1)
    h_l = np.roll(height, 1, axis=1)
    h_r = np.roll(height, -1, axis=1)
    h_bl = np.roll(np.roll(height, -1, axis=0), 1, axis=1)
    h_b = np.roll(height, -1, axis=0)
    h_br = np.roll(np.roll(height, -1, axis=0), -1, axis=1)

    dx = (h_tr + 2.0 * h_r + h_br) - (h_tl + 2.0 * h_l + h_bl)
    dy = (h_bl + 2.0 * h_b + h_br) - (h_tl + 2.0 * h_t + h_tr)

    nx = -dx * strength
    ny = dy * strength
    nz = np.ones_like(height, dtype=np.float32)
    inv_len = 1.0 / np.sqrt(nx * nx + ny * ny + nz * nz + 1e-8)
    n_rgb = np.stack([
        np.clip((nx * inv_len * 0.5 + 0.5) * 255.0, 0, 255),
        np.clip((ny * inv_len * 0.5 + 0.5) * 255.0, 0, 255),
        np.clip((nz * inv_len * 0.5 + 0.5) * 255.0, 0, 255),
    ], axis=-1).astype(np.uint8)
    normal_img = Image.fromarray(n_rgb, mode="RGB")

    r_min, r_max = ROUGHNESS_RANGOS.get(grupo, (0.55, 0.92))
    # Grietas/bajos -> más áspero; zonas elevadas/desgastadas -> algo menos áspero
    rough_val = r_max - (r_max - r_min) * height
    rough_u8 = np.clip(rough_val * 255.0, 0, 255).astype(np.uint8)
    rough_img = Image.fromarray(rough_u8, mode="L")
    return normal_img, rough_img


def generar_pbr(src_dir: Path, out_dir: Path, force: bool = False):
    from transformers import AutoImageProcessor, AutoModelForDepthEstimation

    atlas_src = src_dir / "terreno" / "atlas.jpg"
    terreno_norm_dst = out_dir / "terreno" / "terreno_normal.webp"
    terreno_rough_dst = out_dir / "terreno" / "terreno_rough.webp"

    pend_terreno = force or (not terreno_norm_dst.exists()) or (not terreno_rough_dst.exists())

    tex_tareas = []
    for grupo in GRUPOS_TEX:
        g_dir = src_dir / "texturas" / grupo
        if not g_dir.exists():
            continue
        for img_path in sorted(g_dir.glob("*.jpg")):
            dst_n = out_dir / grupo / f"{img_path.stem}_n.webp"
            dst_r = out_dir / grupo / f"{img_path.stem}_r.webp"
            if force or (not dst_n.exists()) or (not dst_r.exists()):
                tex_tareas.append((grupo, img_path, dst_n, dst_r))

    if not pend_terreno and not tex_tareas:
        print("PBR: todos los mapas ya existen (--force para regenerar).")
        return

    device = "cuda" if torch.cuda.is_available() else "cpu"
    model_id = "depth-anything/Depth-Anything-V2-Small-hf"
    print(f"Cargando {model_id} en '{device}'...")
    processor = AutoImageProcessor.from_pretrained(model_id)
    model = AutoModelForDepthEstimation.from_pretrained(model_id).to(device).eval()

    if pend_terreno and atlas_src.exists():
        t0 = time.time()
        atlas_img = Image.open(atlas_src).convert("RGB")
        tam = atlas_img.width // 10
        cols, rows = 5, 3
        hoja_n = Image.new("RGB", (tam * cols, tam * rows))
        hoja_r = Image.new("L", (tam * cols, tam * rows))
        for idx, celda in enumerate(TERRENO_CAPAS):
            cx, cy = (celda % 10) * tam, (celda // 10) * tam
            tile = atlas_img.crop((cx, cy, cx + tam, cy + tam))
            n_img, r_img = calcular_normal_y_roughness(tile, model, processor, device, "terreno", strength=2.4)
            dx, dy = (idx % cols) * tam, (idx // cols) * tam
            hoja_n.paste(n_img, (dx, dy))
            hoja_r.paste(r_img, (dx, dy))
        terreno_norm_dst.parent.mkdir(parents=True, exist_ok=True)
        hoja_n.save(terreno_norm_dst, format="WEBP", quality=88, method=6)
        hoja_r.save(terreno_rough_dst, format="WEBP", quality=84, method=6)
        print(f"OK terreno PBR (15 capas {cols}x{rows}, {tam}px) en {time.time() - t0:.1f}s")
    elif pend_terreno:
        print(f"AVISO: No encontrado {atlas_src}; se omite terreno.", file=sys.stderr)

    for idx, (grupo, img_path, dst_n, dst_r) in enumerate(tex_tareas, 1):
        t0 = time.time()
        im = Image.open(img_path).convert("RGB")
        if im.width > 512 or im.height > 512:
            im = im.resize((min(512, im.width), min(512, im.height)), Image.Resampling.LANCZOS)
        n_img, r_img = calcular_normal_y_roughness(im, model, processor, device, grupo, strength=2.6)
        dst_n.parent.mkdir(parents=True, exist_ok=True)
        n_img.save(dst_n, format="WEBP", quality=86, method=6)
        rw, rh = min(256, r_img.width), min(256, r_img.height)
        if r_img.size != (rw, rh):
            r_img = r_img.resize((rw, rh), Image.Resampling.BILINEAR)
        r_img.save(dst_r, format="WEBP", quality=82, method=6)
        print(f"[{idx}/{len(tex_tareas)}] OK {grupo}/{img_path.stem} ({time.time() - t0:.2f}s)")

    del model, processor
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()


def parchear_conv2d_horizontal(root_module: nn.Module) -> int:
    """Aplica padding circular horizontal y constante vertical a cada Conv2d para cielos 360° sin costura."""
    parcheadas = 0
    for mod in root_module.modules():
        if isinstance(mod, nn.Conv2d):
            pad = mod.padding
            if isinstance(pad, str):
                continue
            py, px = pad if isinstance(pad, tuple) else (int(pad), int(pad))
            if px == 0 and py == 0:
                continue

            def make_forward(conv_mod, pad_x, pad_y):
                def _conv_forward_asym(input_tensor, weight, bias):
                    x = input_tensor
                    if pad_x > 0:
                        x = F.pad(x, (pad_x, pad_x, 0, 0), mode="circular")
                    if pad_y > 0:
                        x = F.pad(x, (0, 0, pad_y, pad_y), mode="constant", value=0.0)
                    return F.conv2d(
                        x, weight, bias,
                        conv_mod.stride, (0, 0), conv_mod.dilation, conv_mod.groups
                    )
                return _conv_forward_asym

            mod._conv_forward = make_forward(mod, px, py)
            parcheadas += 1
    return parcheadas


def mezclar_hemisferio_inferior(img: Image.Image, suelo_rgb: tuple[int, int, int]) -> Image.Image:
    """Fundido suave del hemisferio inferior (nadir) hacia el color del suelo para reflejos PMREM realistas."""
    arr = np.asarray(img.convert("RGB"), dtype=np.float32)
    h, w, _ = arr.shape
    y = np.linspace(0.0, 1.0, h, dtype=np.float32)[:, None, None]
    # Transición entre y=0.50 (horizonte) y y=0.64 (suelo sólido)
    t = np.clip((y - 0.50) / 0.14, 0.0, 1.0)
    t = t * t * (3.0 - 2.0 * t)
    ground = np.array(suelo_rgb, dtype=np.float32).reshape(1, 1, 3)
    out = arr * (1.0 - t) + ground * t
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), mode="RGB")


def generar_cielos(out_dir: Path, steps: int = 8, guidance: float = 2.2, force: bool = False):
    pendientes = [c for c in CIELOS_DEF if force or not (out_dir / c["archivo"]).exists()]
    if not pendientes:
        print("Cielos: los 3 skyboxes ya existen (--force para regenerar).")
        return

    from diffusers import AutoPipelineForText2Image, DPMSolverMultistepScheduler

    device = "cuda" if torch.cuda.is_available() else "cpu"
    dtype = torch.float16 if device.startswith("cuda") else torch.float32
    model_id = "Lykon/dreamshaper-xl-v2-turbo"
    print(f"Cargando {model_id} para cielos 360° en '{device}'...")
    kwargs = {"torch_dtype": dtype, "use_safetensors": True}
    if device.startswith("cuda"):
        kwargs["variant"] = "fp16"

    pipe = AutoPipelineForText2Image.from_pretrained(model_id, **kwargs)
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
    n_unet = parchear_conv2d_horizontal(pipe.unet)
    n_vae = parchear_conv2d_horizontal(pipe.vae)
    print(f"Padding circular horizontal activado (UNet={n_unet}, VAE={n_vae} capas Conv2d).")
    pipe = pipe.to(device)
    try:
        pipe.enable_attention_slicing()
    except Exception:
        pass

    for idx, c in enumerate(pendientes, 1):
        dst = out_dir / c["archivo"]
        dst.parent.mkdir(parents=True, exist_ok=True)
        gen = torch.Generator(device=device).manual_seed(c["seed"])
        t0 = time.time()
        res = pipe(
            prompt=c["prompt"],
            negative_prompt=SKY_NEGATIVE,
            num_inference_steps=steps,
            guidance_scale=guidance,
            width=1536,
            height=768,
            generator=gen,
        )
        img = res.images[0].resize((2048, 1024), Image.Resampling.LANCZOS)
        img = mezclar_hemisferio_inferior(img, c["suelo_rgb"])
        img.save(dst, format="WEBP", quality=90, method=6)
        print(f"[{idx}/{len(pendientes)}] OK cielo/{c['preset']} -> {dst} (2048x1024, {time.time() - t0:.1f}s)")

    del pipe
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()


def reconstruir_manifest(out_dir: Path) -> dict:
    manifest = {
        "version": "1.0.0",
        "modelos": {
            "pbr": "depth-anything/Depth-Anything-V2-Small-hf",
            "cielo": "Lykon/dreamshaper-xl-v2-turbo",
        },
        "terreno": None,
        "texturas": {},
        "cielos": {},
    }

    t_n = out_dir / "terreno" / "terreno_normal.webp"
    t_r = out_dir / "terreno" / "terreno_rough.webp"
    if t_n.exists() and t_r.exists():
        manifest["terreno"] = {
            "normal": "assets/pbr/terreno/terreno_normal.webp",
            "roughness": "assets/pbr/terreno/terreno_rough.webp",
            "cols": 5,
            "rows": 3,
            "capas": TERRENO_CAPAS,
        }

    for grupo in GRUPOS_TEX:
        g_dir = out_dir / grupo
        if not g_dir.exists():
            continue
        for n_path in sorted(g_dir.glob("*_n.webp")):
            stem = n_path.stem[:-2]
            r_path = g_dir / f"{stem}_r.webp"
            entry = {"n": f"assets/pbr/{grupo}/{n_path.name}"}
            if r_path.exists():
                entry["r"] = f"assets/pbr/{grupo}/{r_path.name}"
            manifest["texturas"][f"{grupo}/{stem}"] = entry

    for c in CIELOS_DEF:
        c_path = out_dir / c["archivo"]
        if c_path.exists():
            manifest["cielos"][c["preset"]] = f"assets/pbr/{c['archivo']}"

    m_path = out_dir / "manifest.json"
    m_path.parent.mkdir(parents=True, exist_ok=True)
    with m_path.open("w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
        f.write("\n")
    return manifest


def main():
    parser = argparse.ArgumentParser(description="Genera mapas PBR (Opción 2) y skyboxes 360° (Opción 3).")
    parser.add_argument("--src", default="assets", help="Carpeta con terreno/atlas.jpg y texturas/<grupo>/*.jpg")
    parser.add_argument("--out", default="assets/pbr", help="Carpeta de salida WebP y manifest.json")
    parser.add_argument("--only", default="pbr,cielos", help="Fases separadas por coma: pbr,cielos")
    parser.add_argument("--sky-steps", type=int, default=8)
    parser.add_argument("--sky-guidance", type=float, default=2.2)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    src_dir = Path(args.src)
    out_dir = Path(args.out)
    fases = {x.strip().lower() for x in args.only.split(",") if x.strip()}

    if "pbr" in fases:
        if not src_dir.exists():
            print(f"ERROR: No existe --src {src_dir}", file=sys.stderr)
            sys.exit(1)
        generar_pbr(src_dir, out_dir, force=args.force)

    if "cielos" in fases:
        generar_cielos(out_dir, steps=args.sky_steps, guidance=args.sky_guidance, force=args.force)

    m = reconstruir_manifest(out_dir)
    print(
        f"Manifest PBR/Cielos actualizado: terreno={'OK' if m['terreno'] else 'no'}, "
        f"texturas={len(m['texturas'])}, cielos={len(m['cielos'])}"
    )


if __name__ == "__main__":
    main()
