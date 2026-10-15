# Khan Academy Kids Reverse-Engineered Mechanics Catalog

Decompiled and reconstructed from **Khan Academy Kids** (`org.khankids.android` / DuckDuckMoose C++ & Dex framework).

---

## 1. DuckDuckMoose Letter & Number Tracing Engine
- **Extracted Source Reference**: `apk-analysis/tracing_summary.json`, `apk-analysis/ddm_methods.txt`, `DDMTracingActivity`
- **Reconstructed Component**: [`engine/components/PathTracingGame.js`](file:///C:/Users/Stoian/.gemini/antigravity/scratch/magic-words-ro/engine/components/PathTracingGame.js), [`engine/tracing/index.js`](file:///C:/Users/Stoian/.gemini/antigravity/scratch/magic-words-ro/engine/tracing/index.js)
- **Mechanic Overview**:
  - Each character (e.g. uppercase 'A', 'M', 'R', digits '1'..'9') is broken into discrete ordered strokes.
  - Each stroke contains a sequence of 2D waypoints `[{ x, y }, ...]`, a start arrow indicating the drawing vector, and a hit radius ($R \approx 35\text{--}40\text{dp}$).
  - As the child drags their finger, distance to the current active waypoint is computed:
    $$d = \sqrt{(x_{\text{touch}} - x_{\text{wp}})^2 + (y_{\text{touch}} - y_{\text{wp}})^2}$$
  - If $d \le R$, the waypoint is validated, sparkling stars emit along the curve, and the guide arrow advances.
  - Lifting the finger before completing a stroke triggers a spring reset with gentle encouraging audio cues.
  - Completing all strokes triggers phonetic pronunciation ("A de la Arici!", "M de la Măr!") and celebration fanfare.

---

## 2. Synchronized Storybook Audio Reader (`.tmk` Engine)
- **Extracted Source Reference**: `.tmk` timestamp pairs (e.g. `10BlocksMake1Rod.tmk`, `CoolBeans.tmk`)
- **Reconstructed Component**: [`engine/components/InteractiveStorybookReader.js`](file:///C:/Users/Stoian/.gemini/antigravity/scratch/magic-words-ro/engine/components/InteractiveStorybookReader.js)
- **Mechanic Overview**:
  - Khan Kids uses Time Marker (`.tmk`) binary/JSON files that align high-resolution audio timestamps (in milliseconds) directly to word bounding boxes on the illustrated page.
  - As the narrator speaks, the word currently being pronounced is illuminated with a warm golden highlight pill (karaoke effect).
  - Tapping individual words directly plays back that specific phonetic token.
  - Interactive page props (clouds, animals, flowers) trigger animated tickle responses when tapped.

---

## 3. Character Living Rooms & Decorator Hub
- **Extracted Source Reference**: Character plists (`OlloRoom.plist`, `SandyRoom.plist`, `KodiRoom.plist`, `PeckRoom.plist`, `ReyaRoom.plist`)
- **Reconstructed Components**:
  - [`engine/components/MascotDecoratorRoom.js`](file:///C:/Users/Stoian/.gemini/antigravity/scratch/magic-words-ro/engine/components/MascotDecoratorRoom.js)
  - [`engine/components/OlloBathBubbleRoom.js`](file:///C:/Users/Stoian/.gemini/antigravity/scratch/magic-words-ro/engine/components/OlloBathBubbleRoom.js)
  - [`engine/components/GiftBoxUnboxer.js`](file:///C:/Users/Stoian/.gemini/antigravity/scratch/magic-words-ro/engine/components/GiftBoxUnboxer.js)
- **Mechanic Overview**:
  - Mascots possess living rooms that unlock interactive activities (e.g. Ollo's bubble bath, Sandy's musical drum kit, Kodi's reading nook).
  - Completing learning activities awards mystery gift boxes that the child physically taps to unbox collectible hats, costumes, and interactive room toys.

---

## 4. Daily Learning Quest ("Excursia Zilei")
- **Reconstructed Component**: [`engine/components/ExcursiaZileiQuest.js`](file:///C:/Users/Stoian/.gemini/antigravity/scratch/magic-words-ro/engine/components/ExcursiaZileiQuest.js)
- **Mechanic Overview**:
  - A structured 3-part daily journey:
    1. Early Phonics / Letter recognition
    2. Logic & Math counting
    3. Illustrated Storybook reading
  - Maintains daily engagement streaks with visual milestone badges and celebration fanfare.
