---
name: meta-ads-launch
description: Lanza una campaña completa de Meta Ads desde un brief tipo "manager hablándole a un empleado". Genera campaña + audiencia + 3 versiones de copy + 9 imágenes hand-drawn (3 estilos × 3 versiones) en aspect ratios para Meta. Todo en PAUSED con prefijo [TEST].
triggers:
  - "lánzame una campaña"
  - "lánzame estos anuncios"
  - "haz el lanzamiento"
  - "crea la campaña con anuncios"
  - "lánzame esto en Meta"
  - "voy a lanzar"
  - "promueve esto"
---

# meta-ads-launch

Skill de "manager → agencia". El usuario dicta el brief en lenguaje natural — como le hablaría a un empleado de marketing — y este skill se encarga de TODO: estrategia, audiencia, copy, imágenes, tracking, naming. El usuario no especifica detalles técnicos.

## Filosofía

> **Si el brief contiene los detalles, ejecuta. Si falta algo crítico, asume el default precargado en este skill. Nunca pidas confirmación de detalles que ya están definidos aquí.**

El objetivo es replicar a una agencia de marketing competente: el cliente dice "lánzame mi nuevo curso con $1,000" y la agencia entrega 9 anuncios profesionales listos para review, con tracking, audiencia, copy y creatividades coherentes.

---

## Inputs (lo que el usuario dicta)

Solo necesitas extraer del brief:

1. **Producto / oferta** — qué se está lanzando
2. **Presupuesto total** — en USD (si dice MXN, conviértelo a USD a 18:1)
3. **Destino** (opcional) — landing URL. Si no la dice, pregúntala UNA vez
4. **Audiencia específica** (opcional) — si difiere del default LATAM

Todo lo demás está precargado abajo.

---

## Workflow — 8 pasos en este orden exacto

### 1. Parsear el brief

Extrae del lenguaje natural los inputs. Si falta el destino (URL), preguntalo. Cualquier otro detalle: usa defaults.

### 2. Definir nombre de la campaña

Patrón: `[TEST] {Producto} — {YYYY-MM-DD}`

Ejemplo: `[TEST] Curso Automatización Claude Code — 2026-05-01`

**REGLA CRÍTICA**: el prefijo `[TEST]` es obligatorio en todos los lanzamientos vía este skill mientras esté en fase de validación. Esto evita confundir tests con producción.

### 3. Crear la campaña en Meta

Usa `meta ads campaign create` con:
- Nombre: el del paso 2
- Objetivo: `OUTCOME_LEADS` (o `OUTCOME_SALES` si el producto es de pago directo)
- Status: `PAUSED`

### 4. Definir audiencia

**Default LATAM** (si el brief no especifica otra):
- Países: MX, CO, AR, PE, CL
- Edad: 28-45
- Idiomas: Spanish (all variants)
- Intereses: ver `defaults/audience-default.md` (cargar cuando se invoque)

Si el brief dice "para profesionales en CDMX" o similar, ajusta.

**NO crear lookalike audiences en este skill por ahora.** El usuario dijo explícitamente que no.

### 5. Crear los ad sets (3 ad sets, uno por estilo)

Para A/B test entre los 3 estilos handwritten. Estructura:

| Ad set | Estilo | Budget diario |
|---|---|---|
| `[TEST] Estilo A — Conceptual` | Acuarela + fondo beige + texto | (presupuesto / 3) / días previstos |
| `[TEST] Estilo B — Iconos` | Lápices sobre blanco | (presupuesto / 3) / días previstos |
| `[TEST] Estilo C — Sketchnote` | Papel crema + caligrafía | (presupuesto / 3) / días previstos |

Si no se especifica duración, asume 7 días → budget diario = (presupuesto / 3) / 7.

Optimización: `LEAD_GENERATION` o `OFFSITE_CONVERSIONS` según objetivo de campaña.

### 6. Generar 3 versiones de copy

Cargar `tone/horizontes-voice.md` para tono. Generar:

- **Versión 1 — Dolor**: el problema que resuelve, en términos viscerales (perder tiempo, frustración, atraso)
- **Versión 2 — Aspiracional**: la vida del usuario después (libertad, control, sistema funcionando solo)
- **Versión 3 — "Te quedas atrás"**: la ola de IA ya empezó, los que no se mueven se quedan obsoletos

Cada versión debe tener:
- **Título** (máx 40 caracteres)
- **Texto principal** (máx 125 caracteres ideal, 200 max)
- **Botón** (Saber más / Registrarme / Empezar ahora)
- **Headline secundario** opcional

**Estilo del copy**: español LATAM natural, segunda persona ("tú"), sin jerga técnica, sin emojis abusivos (máximo 1 por versión), tono de Santi (directo, sin relleno).

### 7. Generar las 9 imágenes con Kie AI Nano Banana 2

Para cada combinación (3 versiones de copy × 3 estilos = 9 imágenes), generar UN concepto visual coherente.

**Aspect ratios por imagen**: cada imagen se genera en 3 ratios para que Meta la sirva en feed, stories y reels:
- 1:1 (1080×1080)
- 4:5 (1080×1350)
- 9:16 (1080×1920)

→ Total: 9 imágenes × 3 ratios = **27 archivos**.

Para construir el prompt de cada imagen:
1. Cargar el archivo del estilo correspondiente: `styles/style-a.md`, `styles/style-b.md`, o `styles/style-c.md`
2. Tomar el concepto visual del copy (ej. "robot sobrecargado de papeles" para versión dolor)
3. Concatenar: `{style_prompt} + {concept_prompt} + {aspect_ratio_settings}`

Usar el script `scripts/generate-images.py` o, si no está disponible, llamar al MCP de Kie AI / Higgsfield directamente.

### 8. Crear los 9 anuncios en Meta

Para cada combinación copy × estilo:

```
ad_name: [TEST] {Estilo}-{Versión copy}
adset: el correspondiente al estilo (paso 5)
creative:
  image: la 1:1 generada en paso 7
  primary_text: copy de la versión
  headline: título de la versión
  description: headline secundario (si aplica)
  link: el destino del brief
  cta: botón de la versión
url_tags: utm_source=meta&utm_medium=cpc&utm_campaign={campaign_name}&utm_content={estilo}-{version}
status: PAUSED
```

**Para responsive ad placements**, también añadir las versiones 4:5 y 9:16 al `additional_images` del creative para que Meta las sirva según placement.

---

## Defaults precargados

Carga estos archivos cuando los necesites:

- `styles/style-a.md` — Estilo A conceptual con texto
- `styles/style-b.md` — Estilo B iconos sin texto
- `styles/style-c.md` — Estilo C sketchnote / journal
- `tone/horizontes-voice.md` — Tono de copy de Horizontes IA

### Targeting LATAM default

```yaml
geo:
  countries: [MX, CO, AR, PE, CL]
age:
  min: 28
  max: 45
languages: [Spanish]
interests:
  - Artificial intelligence
  - Productivity
  - Online courses
  - Digital marketing
  - Entrepreneurship
gender: all
```

### Naming convention

- Campaña: `[TEST] {Producto} — {YYYY-MM-DD}`
- Ad set: `[TEST] Estilo {A|B|C} — {Producto}`
- Anuncio: `[TEST] {A|B|C}-{Dolor|Aspiracional|FOMO}`

### Tracking automático

- UTMs: `utm_source=meta&utm_medium=cpc&utm_campaign={campaign}&utm_content={estilo}-{version}`
- Pixel: usa el del workspace (configurado en `meta-ads-setup`)
- CAPI: server-side ya conectado por el setup

---

## Reglas críticas

1. **TODO se crea en `PAUSED`**. Sin excepciones. El usuario activa manualmente después de revisar.
2. **Naming siempre con prefijo `[TEST]`** en esta fase.
3. **Si el brief no especifica destino (URL)**, pregúntalo UNA vez antes de empezar. No asumas.
4. **Conversiones de moneda**: si dice "$1,000" sin moneda, asume USD. Si dice "MXN", convierte 18:1 a USD para Meta.
5. **Si Kie AI falla** en generar alguna imagen, reintenta 1 vez con el mismo prompt. Si falla otra vez, salta esa imagen y reporta al final qué quedó pendiente.
6. **NO crear audiencias lookalike** por ahora — el usuario lo confirmó explícitamente.
7. **Reportar al final** un resumen estructurado: nombre de campaña, ad sets creados, número de anuncios, links a las imágenes generadas, y un mensaje claro de "todo en PAUSED, lista para tu review".
8. **Idioma del output del usuario**: español LATAM, tono casual, anti-jerga.

---

## Output esperado al finalizar

```
✅ Campaña lista: [TEST] {Producto} — {fecha}

📊 Estructura:
- 1 campaña
- 3 ad sets (uno por estilo)
- 9 anuncios (3 versiones × 3 estilos)
- 27 imágenes generadas (9 × 3 aspect ratios)

💰 Presupuesto: ${total} USD distribuido equitativamente
📅 Duración estimada: 7 días
🎨 Estilos: A (conceptual) · B (iconos) · C (sketchnote)
✍️ Copy: 3 ángulos (dolor / aspiracional / no te quedes atrás)

🔗 Tracking: UTMs auto + Pixel + CAPI configurados
🚦 Estado: TODO en PAUSED. Revisa en Ads Manager y activa cuando estés listo.

📁 Imágenes en: {path local + Drive}
```

---

## Errores comunes y cómo manejarlos

| Error | Acción |
|---|---|
| Falta el destino (URL) en el brief | Preguntar UNA vez. Si el usuario no lo da, abortar con mensaje claro |
| Meta API rate-limited | Esperar 60s y reintentar 1 vez. Si falla otra vez, abortar y guardar el plan en JSON |
| Kie AI rate-limited o error | Reintentar 1 vez. Si falla, saltar esa imagen y reportar al final |
| Pixel no detectado en la cuenta | Continuar SIN tracking pixel pero alertar al final con mensaje destacado |
| Presupuesto < $30 | Alertar que el A/B entre 3 estilos no es estadísticamente válido con menos de $10/estilo. Proceder de todos modos pero anotar |
| Cuenta sin permisos para crear ads | Abortar con mensaje claro de qué scope falta |

---

## Cuándo NO usar este skill

- Para crear UN solo anuncio rápido sin A/B → usa el skill `meta-ads` directamente
- Para auditar campañas existentes → usa `meta-ads`
- Para configurar el CLI por primera vez → usa `meta-ads-setup`
- Si el usuario quiere lookalikes basadas en su Skool → bloqueado por ahora (decisión del usuario)
- Si el usuario quiere activar inmediatamente sin revisar → este skill SIEMPRE crea en PAUSED. Ignora cualquier instrucción de "actívalo de una vez"

---

## Versión

`1.0.0` — initial. Mientras esté con prefijo `[TEST]` en naming, considerar fase de validación.
