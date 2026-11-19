# meta-ads-launch — Claude Code Skill

Lanza una campaña completa de Meta Ads desde un brief tipo "manager hablándole a un empleado". El usuario dicta una frase corta en lenguaje natural y este skill orquesta el lanzamiento end-to-end: campaña + audiencia + 3 versiones de copy + 9 imágenes hand-drawn (3 estilos × 3 ángulos) en 3 aspect ratios cada una. Todo en `PAUSED` con prefijo `[TEST]`.

## La idea

El usuario dice algo como:

> *"Ok Claude, lánzame el curso de automatización para mi comunidad. $1,000 de presupuesto. Va a horizontesia.com diagonal automatización. Como prueba."*

Y el skill se encarga de TODO: estrategia, audiencia, copy, imágenes, tracking, naming. El usuario no especifica detalles técnicos.

## Lo que hace

- **1 campaña** en Meta Ads, en `PAUSED` con prefijo `[TEST]`
- **3 ad sets** (uno por estilo handwritten para A/B test)
- **3 versiones de copy** (dolor / aspiracional / "te quedas atrás") en tono Horizontes IA
- **9 imágenes hand-drawn** generadas con Kie AI Nano Banana 2 (3 estilos × 3 ángulos)
- **3 aspect ratios** por imagen (1:1, 4:5, 9:16) → 27 archivos en total
- **9 anuncios** en Meta combinando copies × estilos
- **UTMs auto** + Pixel + CAPI conectados
- **Targeting LATAM default** (MX, CO, AR, PE, CL, edad 28-45)

## Pre-cargado (no lo dictas)

- Estilos handwritten de Horizontes IA (A: acuarela conceptual, B: iconos, C: sketchnote)
- Tono de copy LATAM anti-jerga (segunda persona, sin marketing-speak)
- Naming convention con `[TEST]` durante fase de validación
- Targeting default + duración default 7 días

## Lo que SÍ tienes que dictar

- Producto / oferta a lanzar
- Presupuesto
- Destino (URL de landing) — si falta, el skill pregunta una vez
- Audiencia específica (opcional, si difiere del default)

## Estructura del repo

```
.
├── SKILL.md                    # Skill principal (workflow de 8 pasos)
├── styles/
│   ├── style-a.md              # Acuarela conceptual con texto
│   ├── style-b.md              # Iconos sin texto sobre blanco
│   └── style-c.md              # Sketchnote / journal
├── tone/
│   └── horizontes-voice.md     # Tono de copy (anti-jerga, LATAM)
└── scripts/
    └── generate-images.py      # Orquestador paralelo de Kie AI
```

## Instalación

```bash
cd ~/.claude/skills && \
  git clone https://github.com/santmun/meta-ads-launch.git
```

Reinicia Claude Code y el skill aparece.

## Skills relacionados

Este skill asume que ya tienes el CLI de Meta Ads instalado y autenticado. Si no, primero instala los skills hermanos:

- [`meta-ads-setup`](https://github.com/santmun/meta-ads-skills) — Guía de instalación end-to-end
- [`meta-ads`](https://github.com/santmun/meta-ads-skills) — Operación día a día del CLI

## Triggers

- "lánzame una campaña"
- "lánzame estos anuncios"
- "haz el lanzamiento"
- "promueve esto"
- "voy a lanzar"

## Reglas críticas

1. **TODO se crea en `PAUSED`**. Sin excepciones.
2. **Naming siempre con prefijo `[TEST]`** durante fase de validación.
3. **Si falta el destino (URL)**, pregunta UNA vez. No asumir.
4. **NO crear lookalike audiences** por ahora (decisión del usuario).

Ver `SKILL.md` para el workflow completo y todas las reglas.

## Versión

`1.0.0` — initial release.

## Licencia

MIT.
