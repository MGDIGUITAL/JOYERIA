#!/usr/bin/env python3
"""
generate-images.py — Wrapper para generar las 9 imágenes (3 estilos × 3 versiones de copy)
en 3 aspect ratios cada una usando Kie AI Nano Banana 2.

Uso desde Claude:
  python3 generate-images.py --plan plan.json

plan.json estructura:
{
  "campaign": "[TEST] Curso Automatización — 2026-05-01",
  "output_dir": "/tmp/meta-launch/2026-05-01/images/",
  "ads": [
    {
      "style": "A",  // A | B | C
      "angle": "dolor",  // dolor | aspiracional | fomo
      "concept": "robot enterrado en papeles",
      "text_label": "Demasiado",  // solo Estilo A o C (cursive_title)
      "ratios": ["1:1", "4:5", "9:16"]
    },
    ...
  ]
}

NOTA: Este script asume que el MCP de Kie AI / Higgsfield está disponible
en el entorno de Claude Code. Si no, usar el endpoint REST directo
con KIE_API_KEY en el environment.
"""

import json
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

KIE_API_KEY = os.environ.get("KIE_API_KEY", "")
KIE_ENDPOINT = "https://api.kie.ai/v1/nano-banana-2/generate"


# ───────────────────────────────────────────────────────────────────
# Style prompt builders
# ───────────────────────────────────────────────────────────────────

def style_a_prompt(concept: str, text_label: str, ratio: str) -> str:
    return (
        f"A hand-drawn watercolor and colored pencil illustration on a beige paper "
        f"background with subtle brick texture. The illustration depicts {concept}. "
        f"Style: organic, imperfect, charming. Watercolor washes in muted earth tones "
        f"with accents of pastel coral, dusty teal, and soft yellow. Colored pencil "
        f"outlines visible. Hand-written Spanish text \"{text_label}\" in casual "
        f"hand-lettered script, integrated naturally into the composition. "
        f"No avatars, no human faces. Anthropomorphic characters allowed. "
        f"Aspect ratio: {_ratio_human(ratio)}."
    )


def style_b_prompt(concept: str, ratio: str) -> str:
    return (
        f"A clean colored-pencil illustration on a pure white background. "
        f"The illustration depicts {concept}. Style: minimalist, hand-drawn, "
        f"slightly imperfect. Colored pencil strokes visible, with light watercolor "
        f"wash accents in muted pastels. No text, no labels, no avatars. "
        f"Single clear visual concept with breathing room. "
        f"Aspect ratio: {_ratio_human(ratio)}."
    )


def style_c_prompt(concept: str, cursive_title: str, ratio: str) -> str:
    return (
        f"A sketchnote-style illustration on cream-colored paper (#FAF4E8). "
        f"Bullet journal aesthetic. Features: {concept}. Title in cursive "
        f"calligraphy reading \"{cursive_title}\" in Spanish. Includes hand-drawn "
        f"rounded boxes, arrows, bullet points, decorative flourishes. Black ink "
        f"for outlines and lettering. Watercolor accents in pastel pinks, butter "
        f"yellow, soft sage green, dusty teal. No human faces. "
        f"Aspect ratio: {_ratio_human(ratio)}."
    )


def _ratio_human(ratio: str) -> str:
    return {
        "1:1": "1:1 square",
        "4:5": "4:5 portrait",
        "9:16": "9:16 vertical story",
    }.get(ratio, ratio)


def _ratio_size(ratio: str) -> tuple[int, int]:
    return {
        "1:1": (1080, 1080),
        "4:5": (1080, 1350),
        "9:16": (1080, 1920),
    }.get(ratio, (1080, 1080))


# ───────────────────────────────────────────────────────────────────
# Generation
# ───────────────────────────────────────────────────────────────────

def build_prompt(ad: dict, ratio: str) -> str:
    style = ad["style"]
    concept = ad["concept"]
    if style == "A":
        return style_a_prompt(concept, ad.get("text_label", ""), ratio)
    if style == "B":
        return style_b_prompt(concept, ratio)
    if style == "C":
        return style_c_prompt(concept, ad.get("text_label", ""), ratio)
    raise ValueError(f"Unknown style: {style}")


def generate_one(ad: dict, ratio: str, output_dir: Path) -> dict:
    """Stub. Reemplazar con call real al MCP de Kie AI o REST."""
    prompt = build_prompt(ad, ratio)
    width, height = _ratio_size(ratio)
    filename = f"{ad['style']}-{ad['angle']}-{ratio.replace(':', 'x')}.png"
    output_path = output_dir / filename

    # En implementación real:
    # response = call_kie_ai(prompt, width, height)
    # response.save(output_path)

    print(f"[stub] Would generate {filename}")
    print(f"  prompt: {prompt[:100]}...")

    return {
        "ad_id": f"{ad['style']}-{ad['angle']}",
        "ratio": ratio,
        "path": str(output_path),
        "prompt": prompt,
    }


def main():
    if len(sys.argv) < 3 or sys.argv[1] != "--plan":
        print("Uso: generate-images.py --plan plan.json")
        sys.exit(1)

    plan_path = Path(sys.argv[2])
    plan = json.loads(plan_path.read_text())

    output_dir = Path(plan["output_dir"])
    output_dir.mkdir(parents=True, exist_ok=True)

    tasks = []
    for ad in plan["ads"]:
        for ratio in ad["ratios"]:
            tasks.append((ad, ratio))

    results = []
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(generate_one, ad, r, output_dir): (ad, r) for ad, r in tasks}
        for fut in as_completed(futures):
            try:
                results.append(fut.result())
            except Exception as e:
                ad, r = futures[fut]
                print(f"[error] {ad['style']}-{ad['angle']} {r}: {e}", file=sys.stderr)

    manifest = output_dir / "manifest.json"
    manifest.write_text(json.dumps(results, indent=2, ensure_ascii=False))

    print(f"\n✅ Done. {len(results)}/{len(tasks)} images. Manifest: {manifest}")


if __name__ == "__main__":
    main()
