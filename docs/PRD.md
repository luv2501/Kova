# Product Requirements Document (PRD) — Kova

**Product Name:** Kova  
**Document Version:** 1.0.0  
**Status:** Approved  
**Target Release:** Q1 2027  

---

## 1. Executive Summary & Vision

**Kova** is a high-precision, dark-mode video conferencing and meeting productivity tool designed for engineering leaders, remote product teams, and high-velocity builders. Inspired by the restraint, speed, and tactile satisfaction of tools like **Linear**, **Raycast**, and **Cal.com**, Kova strips away the bloat, intrusive AI gimmicks, and laggy animations that plague legacy conferencing software.

### Core Philosophy
1. **Zero Distraction:** Unapologetically focused on crystal-clear audio, low-latency video, and immediate responsiveness.
2. **Speed & Keyboard First:** Every core action (mute, camera toggle, screen share, invite copy) is executable in under 100ms via muscle-memory hotkeys.
3. **Restrained Craft:** Dark canvas surfaces, hairline 1px borders, crisp typography, and intentional visual hierarchy over decorative noise.

---

## 2. Target Audience & Personas

- **Software Engineers & Architects:** Conduct pairing sessions, incident response war rooms, and pull request walkthroughs without tab freezes or CPU throttling.
- **Product Designers:** Share high-resolution screens and interactive prototypes with accurate color rendering and zero compression artifacts.
- **Technical Founders & Engineering Managers:** Run structured, punctual daily standups and design syncs without waiting for software updates or navigating bloated interfaces.

---

## 3. Core Feature Specifications

### 3.1 Pre-Call Lobby ("Green Room")
- **Audio & Video Previews:** Immediate, local WebRTC feed testing for camera and microphone before room entry.
- **Device Selectors:** Compact dropdowns for Camera, Microphone, and Audio Output.
- **Audio Level Monitor:** Subtle, responsive decibel indicator confirming input activity.
- **Display Name & Join State:** Instant entry with persisted profile name or one-click join.

### 3.2 In-Call Meeting Experience
- **Adaptive Video Grid:**
  - Dynamic layouts (1x1, 1x2, 2x2, 3x3) optimized for screen space.
  - Video tiles styled with `12px` rounded corners (`rounded-xl`), background `#14171D`, and hairline `rgba(255,255,255,0.08)` borders.
  - Active speaker detection indicated by an emerald green outline ring (`#10B981`, `2px solid`).
- **Floating In-Call Control Dock:**
  - Anchored at bottom center with `10px` border radius (`rounded-[10px]`).
  - Subtle `backdrop-blur-md` surface over underlying video streams with `rgba(255,255,255,0.08)` border.
  - Controls:
    - Microphone Toggle (`Cmd/Ctrl + D`) with mute state indicator.
    - Camera Toggle (`Cmd/Ctrl + E`) with video off fallback avatar.
    - Screen Share (`Cmd/Ctrl + Shift + S`) with window/tab selection.
    - Chat Drawer Toggle (`Cmd/Ctrl + Shift + C`).
    - Participant List Toggle.
    - End Call Button (`#EF4444` danger state).
- **Meeting Header & HUD:**
  - Room Title & Meeting Code displayed in `JetBrains Mono` (`tabular-nums`).
  - Call Duration Timer in `JetBrains Mono` (`tabular-nums`).
  - One-click "Copy link" action with instantaneous toast confirmation.

### 3.3 Collaboration & Utilities
- **In-Call Chat & Code Drawer:**
  - Slide-out side drawer matching `#14171D` surface with 1px hairline border.
  - Monospace code snippet sharing with syntax readability.
  - Link previews without intrusive popups.
- **Participant Roster:**
  - Real-time status indicators (Muted, Hand Raised, Screen Sharing).
  - Host moderation privileges (Mute All, Remove Participant).

### 3.4 Post-Call Experience
- **Summary & Reconnect Screen:**
  - Call duration summary and participant count.
  - "Rejoin meeting" and "Return home" quick actions.

---

## 4. Technical Architecture

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | Server components, streaming UI, lightweight client bundles |
| **Language** | TypeScript 5 | Strict typing, zero `any` policy |
| **Styling** | Tailwind CSS v4 | Strict tokenized utilities adhering to `DESIGN_SYSTEM.md` |
| **Icons** | Lucide React | Uniform `strokeWidth={1.75}` |
| **Typography** | Inter + JetBrains Mono | Loaded via `next/font` for optimal zero-layout-shift rendering |
| **State Management** | React Hooks / Zustand | Ephemeral call state, audio/video device management |
| **Media Transport** | WebRTC / SFU | Low-latency audio/video streaming with adaptive bitrate |

---

## 5. Non-Functional Requirements & Performance SLAs

- **First Contentful Paint (FCP):** < 1.0s on standard broadband.
- **Interaction to Next Paint (INP):** < 50ms for in-call dock clicks and hotkeys.
- **Cumulative Layout Shift (CLS):** 0.00 across all grid rebalances.
- **Accessibility:** Full WCAG 2.1 AA compliance, complete keyboard navigability, semantic ARIA attributes for screen readers.
- **Security:** End-to-end encrypted signaling, ephemeral room identifiers, zero permanent audio/video storage.
