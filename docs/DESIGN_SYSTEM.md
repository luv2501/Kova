# Kova Design System

> **Brand Name:** Kova  
> **Visual Philosophy:** Precision dark-mode productivity tool inspired by Linear, Raycast, and Cal.com. Crafted, restrained, and functional.

---

## 1. Strict Anti-AI UI Rules

Kova is built for professionals who value speed, density, and clarity. It strictly rejects trendy AI clutter and flashy visual gimmicks.

- **NO Purple / Indigo Gradients:** Never use synthetic purple, violet, or indigo gradients.
- **NO Neon Glows:** No colored ambient glows, drop-glow halos, or fluorescent outlines.
- **NO Heavy Drop Shadows:** Deep fuzzy shadows like `shadow-2xl` are strictly forbidden. Use crisp 1px borders for elevation separation.
- **NO Sparkle Icons (✨):** Never use sparkle or magic wand icons.
- **NO AI Buzzwords:** Never use "AI-powered", "Next-gen", "Magic", or marketing hyperbole. All micro-copy must be crisp, functional, and action-oriented (e.g., `"New meeting"`, `"Enter code"`, `"Copy link"`, `"Mute microphone"`).
- **NO Excessive Glassmorphism:** Surfaces must be opaque and solid with 1px hairline borders.
  - *Exception:* `backdrop-blur-md` is permitted **ONLY** on the floating in-call control dock to subtly separate it from underlying video streams.

---

## 2. Color Palette & Tokens

Kova employs a curated dark-mode palette engineered for low eye strain and maximum legibility.

| Token | Hex / Value | Tailwind / CSS Equivalent | Purpose & Usage |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#0B0D10` | `bg-[#0B0D10]` | The deepest foundation layer; main app body background |
| **Surface / Cards** | `#14171D` | `bg-[#14171D]` | Standard surfaces, video tiles, sidebar panels, modal bodies |
| **Elevated Popovers** | `#1C2028` | `bg-[#1C2028]` | Floating dropdowns, contextual popovers, active modal overlays |
| **Hairline Borders** | `rgba(255, 255, 255, 0.08)` | `border-[rgba(255,255,255,0.08)]` | 1px hairline borders for all structural boundary definition |
| **Primary Text** | `#F3F4F6` | `text-[#F3F4F6]` | High-contrast headings, main content, active labels |
| **Muted Text** | `#8A93A2` | `text-[#8A93A2]` | Secondary metadata, placeholders, keyboard shortcut cues |
| **Primary Accent** | `#2563EB` | `bg-[#2563EB] / text-[#2563EB]` | Crisp cobalt blue; primary action buttons and active focus states |
| **Danger / Mute** | `#EF4444` | `bg-[#EF4444] / text-[#EF4444]` | End call, mute indicators, destructive confirmations |
| **Active Speaker Ring**| `#10B981` | `border-[#10B981]` | Crisp emerald green indicator ring on the active speaker's video tile |

---

## 3. Border Radii Discipline

Curvature is restrained and deliberate. Bubbly, oversized radii (such as `rounded-2xl` or `rounded-3xl`) are forbidden.

| Element | Radius | Class | Rationale |
| :--- | :--- | :--- | :--- |
| **Buttons & Inputs** | `6px` | `rounded-md` | Compact, ergonomic click targets |
| **Cards & Modals** | `10px` | `rounded-[10px]` | Structured containers with subtle softened corners |
| **Video Tiles** | `12px` | `rounded-xl` | Modern frame proportions that preserve screen real estate |
| **Floating In-Call Dock** | `10px` | `rounded-[10px]` | Uniform floating dock radius matching modal standards |

---

## 4. Typography & Spacing

### Font Families
- **Interface Font:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
  - Headings: Tight tracking (`tracking-[-0.015em]`), weights `500` (Medium) or `600` (Semi-bold).
  - Body: Regular `400` or `500`, neutral tracking.
- **Monospace Font:** `JetBrains Mono`, `ui-monospace`, `monospace`
  - Used for meeting codes, room identifiers, duration timers, and participant counts.
  - Mandatory: Always apply `tabular-nums` for stable, non-jittering numeric display.

### Spacing Grid
- Strict **4px base grid** (`4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `48px`, `64px`).
- Dense, intentional component padding (`py-1.5 px-3` for compact buttons, `p-4` or `p-6` for card modules).

---

## 5. Motion & Transitions

- **Duration & Timing:** Snappy `150ms` duration using `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Transitions:** Restricted to subtle color, border-color, and opacity shifts.
- **Prohibited:** Bouncy spring physics, delayed fade-ins, sliding sheet theatrics, or rotating loading gimmicks.

---

## 6. Iconography

- **Library:** `lucide-react`
- **Stroke Width:** Strict, uniform `1.75px` (`strokeWidth={1.75}`).
- **Size Scale:**
  - Standard inline UI: `16px` (`size={16}`)
  - Button actions & dock icons: `18px` (`size={18}`)
  - Major feature or empty-state anchors: `24px` (`size={24}`)
