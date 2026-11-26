# Kova Design System

> **Brand Name:** Kova  
> **Visual Philosophy:** Luminous Architectural Luxury — Warm Obsidian & Champagne Gold in Dark Mode, Warm Alabaster & Rich Charcoal/Amber-Gold in Light Mode. Inspired by precision architectural studios, Linear, and Raycast.

---

## 1. Strict Anti-AI UI Rules

Kova rejects generic AI templates, synthetic gradients, and bloated marketing copy.

- **NO Purple / Indigo Gradients:** Never use synthetic purple, violet, or indigo gradients.
- **NO Cyberpunk / Neon Glows:** No harsh fluorescent halos or multicolored glows. Only subtle, warm champagne ambient button luminance (`shadow-[0_0_24px_-4px_rgba(242,197,148,0.35)]`) is used on primary actions.
- **NO Sparkle Icons (✨):** Never use sparkle or magic wand icons.
- **NO AI Buzzwords:** Never use "AI-powered", "Next-gen", "Magic", or marketing hype. Micro-copy must be concise, calm, and functional (e.g., `"Start a meeting"`, `"Enter code"`, `"Meet with clarity."`).
- **Restrained Surfaces:** Rely on solid obsidian/alabaster layering, 1px hairline borders, and subtle top-edge light reflections (`border-t-white/15` in dark mode). `backdrop-blur-md` is reserved for floating overlays/docks.

---

## 2. Dual Theme Color Palette

### Dark Mode (Default — Luminous Obsidian)
| Token | Hex / Value | Purpose & Usage |
| :--- | :--- | :--- |
| **Canvas Background** | `#09090B` | Deep obsidian foundation |
| **Elevated Cards** | `#131316` | Elevated card surfaces with `border border-white/[0.08] border-t-white/15` |
| **Input & Secondary Surface** | `#1A1A1E` | Inputs, icon badges, secondary buttons |
| **Hairline Borders** | `rgba(255, 255, 255, 0.08)` | 1px structural borders |
| **Primary Text** | `#F5F5F7` | Crisp alabaster headings & copy |
| **Muted Text** | `#8E8E93` | Subtitles, timestamps, placeholders |
| **Primary Accent** | `#F2C594` | Luminous champagne gold (`#09090B` dark text, `shadow-[0_0_24px_-4px_rgba(242,197,148,0.35)]`) |

### Light Mode (Crisp Architectural Alabaster)
| Token | Hex / Value | Purpose & Usage |
| :--- | :--- | :--- |
| **Canvas Background** | `#FAF9F6` | Warm architectural alabaster |
| **Elevated Cards** | `#FFFFFF` | Crisp white cards with `border border-black/[0.08]` |
| **Input & Secondary Surface** | `#F2F0EB` | Subtle warm neutral inputs & secondary pills |
| **Hairline Borders** | `rgba(0, 0, 0, 0.08)` | 1px subtle structural borders |
| **Primary Text** | `#111113` | Deep charcoal headings & copy |
| **Muted Text** | `#6B6B70` | Secondary metadata & placeholders |
| **Primary Accent** | `#D99B52` / `#18181B` | High-contrast `#18181B` charcoal or rich `#D99B52` amber-gold accents |

### Semantic Tokens (Both Themes)
- **Danger / Mute:** `#EF4444`
- **Active Speaker Ring:** `#10B981`

---

## 3. Typography & Spacing

- **Heading Font:** `Outfit` (`--font-heading`, weights `500`, `600`, `700`) with tight tracking (`tracking-[-0.025em]`).
- **Interface Font:** `Manrope` (`--font-sans`) for ultra-clean UI body copy, labels, and controls.
- **Monospace Font:** `JetBrains Mono` (`--font-mono`) with `tabular-nums` for meeting codes and timers.
- **Base Grid:** Strict **4px base grid**.

---

## 4. Radii, Motion & Iconography

- **Login / Feature Cards:** `rounded-3xl` (`24px`) or `rounded-2xl` (`16px`)
- **Inputs & Buttons:** `rounded-xl` (`12px`) or `rounded-md` (`6px`)
- **Video Tiles:** `rounded-xl` (`12px`)
- **Motion:** Snappy `150ms` duration using `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Iconography:** `lucide-react` with uniform `1.75px` stroke width (`strokeWidth={1.75}`).
- **Brand Mark:** Custom architectural serif SVG wordmark (`<KovaLogo />`) featuring a curved-leg `K`, high-contrast Didone `O`, sharp `V`, and crossbar-less `A` rendered in `#F2C594` (dark mode) and `#111113` (light mode), paired with a compact `K` monogram (`<KovaLogoMark />`) and signature quote (`GREAT COMMUNICATION BEGINS WITH CONNECTION`).
