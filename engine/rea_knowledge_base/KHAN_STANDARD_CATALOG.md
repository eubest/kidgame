# Khan Academy Standard Reverse-Engineered Mechanics Catalog

Decompiled and reconstructed from **Khan Academy Standard** (`org.khanacademy.android` / Perseus Architecture).

---

## 1. Scratchpad Canvas Overlay Engine
- **Extracted Source Reference**: `khan_standard_base.apk` Perseus scratchpad modules
- **Reconstructed Component**:
  - [`engine/components/ScratchpadOverlay.js`](file:///C:/Users/Stoian/.gemini/antigravity/scratch/magic-words-ro/engine/components/ScratchpadOverlay.js)
  - [`engine/components/PedagogicalScratchpad.js`](file:///C:/Users/Stoian/.gemini/antigravity/scratch/magic-words-ro/engine/components/PedagogicalScratchpad.js)
- **Mechanic Overview**:
  - In Khan Academy, any exercise screen can be toggled into "Scratchpad" mode, dropping a transparent drawing layer directly over the problem text and math widgets.
  - Allows learners to write out mental calculations, cross out options, circle key numbers, or sketch geometry diagrams.
  - Features:
    - Zero-lag SVG path accumulation (`PanResponder`)
    - Color picker (Graphite, Cyan, Emerald, Amber, Crimson)
    - Stroke width adjustment (Thin, Medium, Thick)
    - Quick Eraser and "Șterge Tot" (Clear All) actions
    - Minimize / restore drawer floating button with state preservation.

---

## 2. Multi-Tier Hint Progression System
- **Mechanic Overview**:
  - Rather than immediately revealing answers, exercises guide children through progressive scaffolding:
    1. **Nudge Hint**: Clarifies the goal ("Privește cu atenție cele două grupuri...").
    2. **Strategy Hint**: Suggests a concrete approach ("Încearcă să numeri întâi obiectele albastre...").
    3. **Solution Walkthrough**: Shows the exact step-by-step breakdown.
  - Each hint revealed is logged to provide teachers and parents with learning analytics without frustrating the child.
