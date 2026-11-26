# Kova Project Rules & Development Guidelines

> **CRITICAL DIRECTIVE FOR ALL AGENTS & DEVELOPERS:**  
> Before generating, modifying, or refactoring ANY user interface component, page, layout, or style in this repository, you **MUST** read and strictly adhere to [`docs/DESIGN_SYSTEM.md`](file:///d:/Projects/Kova/docs/DESIGN_SYSTEM.md).

---

## 1. Zero Tolerance on Design System Deviations

1. **Strict Anti-AI Aesthetics:**
   - **NO purple or indigo gradients.**
   - **NO neon/cyberpunk glows.** Only subtle warm champagne gold button ambient glow (`shadow-[0_0_24px_-4px_rgba(242,197,148,0.35)]`) is permitted on primary dark-mode buttons.
   - **NO sparkle icons (`✨`) or magic wands.**
   - **NO AI buzzwords** ("AI-powered", "Next-gen", "Smart", "Magical"). Micro-copy must be crisp, calm, and functional.
   - **NO excessive glassmorphism.** Use luminous solid obsidian (`#131316`) / alabaster (`#FFFFFF`) layering with subtle inner top highlights (`border-t-white/15` in dark mode). `backdrop-blur-md` is reserved for floating in-call control docks and modal backdrops.

2. **Dual Theme Color Tokens:**
   - **Dark Mode (Default):** Canvas `#09090B`, Cards `#131316` (`border-white/[0.08] border-t-white/15`), Inputs `#1A1A1E`, Primary Accent `#F2C594` (champagne gold) with `#09090B` text, Primary Text `#F5F5F7`, Muted Text `#8E8E93`.
   - **Light Mode:** Canvas `#FAF9F6` (warm alabaster), Cards `#FFFFFF` (`border-black/[0.08]`), Inputs `#F2F0EB`, Primary Text `#111113`, Muted Text `#6B6B70`, Accents `#D99B52` / `#18181B`.
   - **Semantic:** Danger `#EF4444`, Active Speaker Ring `#10B981`.

3. **Typography & Spacing Discipline:**
   - Heading Font: `Outfit` (`--font-heading`, weights 500–700, `tracking-[-0.025em]`).
   - Interface Font: `Manrope` (`--font-sans`).
   - Monospace Font: `JetBrains Mono` (`--font-mono`) with `tabular-nums` for meeting codes and timers.
   - Base Grid: Strict 4px spacing increments.

4. **Motion & Iconography:**
   - Transitions: 150ms `cubic-bezier(0.16, 1, 0.3, 1)`.
   - Icons: Lucide React with `strokeWidth={1.75}` uniformly.

---

## 2. Architecture & Code Quality Standards

- **Framework:** Next.js 15 App Router (`src/app`).
- **Language:** TypeScript in strict mode. No `any` types.
- **Components:** Modular, composable React Server Components by default; `"use client"` only when managing browser APIs, audio/video streams, or interactive state.
- **Linting & Formatting:** ESLint with zero warnings or errors prior to committing.
