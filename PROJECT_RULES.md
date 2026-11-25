# Kova Project Rules & Development Guidelines

> **CRITICAL DIRECTIVE FOR ALL AGENTS & DEVELOPERS:**  
> Before generating, modifying, or refactoring ANY user interface component, page, layout, or style in this repository, you **MUST** read and strictly adhere to [`docs/DESIGN_SYSTEM.md`](file:///d:/Projects/Kova/docs/DESIGN_SYSTEM.md).

---

## 1. Zero Tolerance on Design System Deviations

1. **Strict Anti-AI Aesthetics:**
   - **NO purple or indigo gradients.**
   - **NO neon glows, bloom effects, or blurry color halos.**
   - **NO heavy drop shadows** (`shadow-2xl` is strictly forbidden; rely on 1px hairline borders for depth).
   - **NO sparkle icons (`✨`) or magic wands.**
   - **NO AI buzzwords** ("AI-powered", "Next-gen", "Smart", "Magical"). Micro-copy must be clean and functional (`"New meeting"`, `"Enter code"`, `"Mute microphone"`).
   - **NO excessive glassmorphism.** Surfaces must be solid and opaque (`#14171D`, `#1C2028`). `backdrop-blur-md` is permitted **ONLY** on the floating in-call control dock.

2. **Mandatory Color Tokens:**
   - Canvas Background: `#0B0D10`
   - Surface / Cards: `#14171D`
   - Elevated Popovers: `#1C2028`
   - Hairline Borders: `rgba(255, 255, 255, 0.08)` (1px solid)
   - Primary Text: `#F3F4F6`
   - Muted Text: `#8A93A2`
   - Primary Accent: `#2563EB` (crisp cobalt)
   - Danger / Mute: `#EF4444`
   - Active Speaker Ring: `#10B981`

3. **Strict Border Radii Scale:**
   - Buttons & Inputs: `6px` (`rounded-md`)
   - Cards & Modals: `10px` (`rounded-[10px]`)
   - Video Tiles: `12px` (`rounded-xl`)
   - Floating Control Dock: `10px` (`rounded-[10px]`)
   - **NEVER** use bubbly `rounded-2xl`, `rounded-3xl`, or `rounded-full` (except for circular avatars or icon badges).

4. **Typography & Spacing Discipline:**
   - Interface Font: `Inter` with tight heading tracking (`tracking-[-0.015em]`).
   - Monospace Font: `JetBrains Mono` with `tabular-nums` for all meeting codes, timers, and metrics.
   - Base Grid: Strict 4px spacing increments (`p-1`, `p-2`, `p-3`, `p-4`, `p-6`, etc.).

5. **Motion & Iconography:**
   - Transitions: 150ms `cubic-bezier(0.16, 1, 0.3, 1)`.
   - Icons: Lucide React with `strokeWidth={1.75}` uniformly.

---

## 2. Architecture & Code Quality Standards

- **Framework:** Next.js 15 App Router (`src/app`).
- **Language:** TypeScript in strict mode. No `any` types.
- **Components:** Modular, composable React Server Components by default; `"use client"` only when managing browser APIs, audio/video streams, or interactive state.
- **Linting & Formatting:** ESLint with zero warnings or errors prior to committing.

---

## 3. Pre-Flight Checklist Before Delivering UI

Before presenting any UI code:
- [ ] Checked against `docs/DESIGN_SYSTEM.md`
- [ ] Hex values match exact brand color tokens
- [ ] Border radius matches exact discipline (`6px`, `10px`, `12px`)
- [ ] No sparkles, no purple gradients, no heavy drop shadows
- [ ] Micro-copy is professional, dry, and functional
- [ ] Lucide icons have `strokeWidth={1.75}`
- [ ] Numerical elements use `JetBrains Mono` + `tabular-nums`
