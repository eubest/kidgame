# LogicLike Reverse-Engineered Mechanics Catalog

Decompiled and reconstructed from **LogicLike** (`com.logicappkids` / `Web.bundle`).

---

## 1. `count-and-select` (Numără și Selectează)
- **Source Files**: `CountAndSelect.ts`, `Ball.ts`, `Character.ts`, `PurposeNumber.ts`
- **Reconstructed Component**: [`engine/components/CountAndSelectGame.js`](file:///C:/Users/Stoian/.gemini/antigravity/scratch/magic-words-ro/engine/components/CountAndSelectGame.js)
- **Mechanic Overview**:
  - A container holds $N$ colorful bouncy spheres with physics (gravity, collision restitution, velocity damping).
  - The child is tasked with counting the items ("Câte bile verzi vezi în cutie?").
  - Tapping each ball triggers an elastic squash & stretch bounce, Romanian voice counting ("Unu!", "Doi!", "Trei!"), and highlights the ball.
  - Three large choice cards are displayed at the bottom. Tapping the correct count triggers high-frequency confetti, celebratory mascot animation, and star rewards.
- **Mobile Responsive Considerations**:
  - On phones in landscape mode ($\text{height} < 500\text{dp}$), the ball size is clamped to $75\text{dp}$, and the playfield is wrapped in a scrollable container with `flexGrow: 1` to ensure answer choice cards are never clipped at the screen bottom.

---

## 2. `find-the-number` (Prinde Numărul / Fructele Căzătoare)
- **Source Files**: `FindTheNumber.ts`, `Animal.ts`, `FallenObject.ts`, `Observer.ts`
- **Reconstructed Component**: [`engine/components/FindTheNumberFallGame.js`](file:///C:/Users/Stoian/.gemini/antigravity/scratch/magic-words-ro/engine/components/FindTheNumberFallGame.js)
- **Mechanic Overview**:
  - The mascot (Ollo the Dhole) sits on a grassy field with an animated thought bubble displaying the target number.
  - Numbered apples, oranges, and strawberries fall from tree branches with gravity acceleration ($y_{t+1} = y_t + v_y, v_y += g$).
  - The child taps the fruit matching the thought bubble.
  - When correctly tapped: the fruit floats directly into Ollo's mouth, Ollo opens his mouth wide and chews with crunchy SFX, and the score meter increments.
  - Tapping a wrong number triggers a gentle wobble shake and "Mai încearcă!" voice prompt without penalties.

---

## 3. `count-in-order` (Broasca Săltăreață / Stepping Stones)
- **Source Files**: `CountInOrder.ts`, `Animal.ts`, `SequenceObject.ts`, `DashLine.ts`, `Finger.ts`, `Trophy.ts`
- **Configs**: `config/frog/config.json`, `config/rabbit/config.json`, `config/bee/config.json`, `config/squirrel/config.json`
- **Reconstructed Component**: [`engine/components/SteppingStonesPathGame.js`](file:///C:/Users/Stoian/.gemini/antigravity/scratch/magic-words-ro/engine/components/SteppingStonesPathGame.js)
- **Mechanic Overview**:
  - Lily pads or stepping stones numbered 1 through $N$ (or in sequence, e.g. even numbers: 2, 4, 6, 8, 10) float on water.
  - A friendly mascot hops in sequence from stone to stone along a parabolic trajectory.
  - Completed segments are connected by a glowing golden trail (`DashLine`).
  - An idle timeout (5000ms) brings in a bouncing helper hand to guide younger preschool children.
  - Reaching the final stone awards the golden trophy with celebratory fanfare.

---

## 4. `one-line` (Trasează dintr-o Mișcare / Eulerian Path Puzzles)
- **Source Files**: `OneLine.ts`, `Point.ts`, `game.ts`
- **Reconstructed Component**: [`engine/components/OneLinePuzzleGame.js`](file:///C:/Users/Stoian/.gemini/antigravity/scratch/magic-words-ro/engine/components/OneLinePuzzleGame.js)
- **Mechanic Overview**:
  - Vector graph puzzles where the child must traverse every edge of a geometric shape (e.g. envelope, house with roof, star) in a continuous gesture without lifting the finger or crossing the same edge twice.
  - Decompiled algorithm maps SVG paths into discrete nodes (`Point.ts`) spaced by stroke width, tracks incident nodes, and validates Eulerian trails.
  - On mobile, dynamically scales the node bounding box to fit chalkboard dimensions with responsive margin clamping.

---

## 5. `balance-scale` (Balanța Logică / Deductive Reasoning)
- **Source Files**: LogicLike early logic level patterns
- **Reconstructed Component**: [`engine/components/LogicBalanceScaleGame.js`](file:///C:/Users/Stoian/.gemini/antigravity/scratch/magic-words-ro/engine/components/LogicBalanceScaleGame.js)
- **Mechanic Overview**:
  - A two-pan beam balance scale that tilts according to total mass on left vs right pan ($\Delta\theta \propto \sum m_{\text{left}} - \sum m_{\text{right}}$).
  - Children deduce relative weights of friendly objects (e.g. 1 watermelon = 3 apples, 1 pumpkin = 2 watermelons).
