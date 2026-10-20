---
title: Foldable-Screen Adaptation
description: "Gox foldable-screen guide: posture and hinge readouts (posture / hinge / regions), layout suggestions (layoutMode), hinge avoidance (avoidReserved), Tabletop split layouts and cross-display dragging — plus the four rules that run through the whole page. Includes a runnable four-scenario example."
---

# Foldable-Screen Adaptation

What makes a foldable special isn't a *bigger* screen — it's that the screen is
**cut in two by a hinge, and the user can physically only look at one half at a time**.

The framework provides only **signals** (posture / hinge / reserved regions) and a single
**combined decision entry point**. **The layout is the app's call** — the conclusion shared
by the platform guidance (Huawei: "listening to fold state to drive responsive layout is not
recommended") and the kernel's existing stance.

::: tip Remember these four rules first
1. **Trust width, not posture** — posture lags by a frame
2. **Take subscription readouts unconditionally, then branch** — otherwise the UI looks "dead"
3. **Hinge coordinates are display coordinates** (device pixels); equal to window coordinates only when fullscreen
4. **No report means permanently flat** — the framework provides a channel, it doesn't guess; the real host reports it
:::

## 1. The core readouts

```js
import { reservedRegions, hasFold, layoutMode } from "gx/viewport";
import { posture, hinge, regions, splitRatio, hingeOrientation } from "gx/screen";

const r = reservedRegions();   // pure readout (no subscription): { division:[…], occlusion:[…], all:[…] }
const m = layoutMode();        // same: { posture, widthClass, foldAware, suggested }
```

| Readout | Returns | Notes |
| --- | --- | --- |
| `posture(win?)` | string | `"flat"` / `"half-open"` / `"folded"`; **permanently `"flat"` if nobody reports** |
| `hinge(win?)` | object \| null | Hinge rect `{x, y, width, height, orientation}`; `null` when there is no fold |
| `hingeOrientation(win?)` | string | `"vertical"` (left-right fold, vertical hinge) / `"horizontal"` (top-bottom fold) |
| `regions(win?)` | array | The regions the hinge cuts the display into |
| `splitRatio(win?)` | number | Hinge split ratio, clamped to `[0.2, 0.8]`; degrades to `0.5` with no fold |
| `reservedRegions(win?)` | `{division, occlusion, all}` | All three keys always exist (empty arrays when empty), so `.division.length` is always safe |
| `hasFold(win?)` | bool | **Structural** signal: permanently `true` on a foldable device, does not flip-flop with fold/unfold |
| `layoutMode(win?)` | `{posture, widthClass, foldAware, suggested}` | `suggested` ∈ `"single"` / `"dual"` / `"tablet"` — **a suggestion only, the framework never touches your layout** |
| `widthClass(win?)` | string | `"compact"` (<600dp) / `"medium"` (600–840dp) / `"expanded"` (>840dp) |

### Subscribing vs. pure readouts

Both are correct — **using one in the wrong place is what's wrong**.

- **Subscribing** (calling it reads a revision signal = establishes a subscription; when the
  environment changes, any effect that read it re-runs)
  - **Two-stage** (outer call binds the window and returns a getter; only the inner call
    subscribes and reads): `usePosture()()` / `useWindowInfo()()` /
    `useReservedRegions()()` / `useLayoutMode()()`
  - **One-stage** (calling subscribes): `useViewport()` / `useBreakpoint()` / `useInsets()`
- **Pure readout** (reads the current snapshot each time, **no subscription**): everything in
  the table above, plus `viewport()` / `insets()` / `contentArea()`

```js
const getP = usePosture();          // outer: binds the window, returns a getter
// … you must call getP() with another pair of parens; one pair short gives you the
// function object itself, and every property on it is undefined
```

::: warning The two-stage parenthesis trap
`usePosture` returns a **function**. `usePosture().posture` is `undefined`.
You need `usePosture()()` for the value. Missing a pair doesn't error — it just hands you a function object.
:::

## 2. Rule ①: trust width, not posture

This is **the easiest one to trip over, with the most hidden consequences**.

On top-bottom foldables (e.g. the Pocket line) the **unfolded width can still be < 600dp**.
Deriving "it should be wide now" from `posture === "flat"` is guaranteed to break. Worse, in
the platform's ordering `windowSizeChange` fires **before** `foldStatusChange(unfolded)` —
so posture-driven layout **lags by a frame**.

```js
// ✅ Correct: the column count depends only on width
import { widthClass, useBreakpoint } from "gx/viewport";

function panes(width) {
  return width >= 600 ? 2 : 1;
}
```

Drag that same window narrower than 600 and it flips from two columns to one — not a single
line of code changes.

`hasFold()` is the one exception: it is a **structural** signal (permanently `true` on a
foldable), so it doesn't flip-flop with fold/unfold and is safe as a "should this app take the
foldable path" switch (otherwise the column count would jump with posture). But it does **not**
mean the device is currently unfolded.

## 3. Rule ②: take subscription readouts unconditionally, then branch

**Putting a subscribing readout inside one arm of a ternary or short-circuit is a silent trap**:

```js
// ❌ Wrong: the arm that isn't taken on the first frame never subscribes
const label = hasFold() ? postureText(usePosture()()) : "flat";
```

If `hasFold()` is `false` on the first frame, `usePosture()()` never runs ⇒ the subscription
is **never established**, the effect has zero dependencies, **never re-runs, and warns
nothing**. The UI just looks "dead" — folding it changes nothing.

```js
// ✅ Correct: take it once unconditionally, then branch
const getP = usePosture();
const p = getP();                       // subscription established unconditionally
const label = hasFold() ? postureText(p) : "flat";
```

The same holds for **element children** — since 0.14.0 an interpolation `{expr}`
is wrapped into a function child at parse time, but bare identifiers `{sig}` are
not wrapped and handwritten `h()` has no such wrapping either, so those still
evaluate once and freeze (with `GOX_DEV=1`, gfx warns about this class of trap).

## 4. Rule ③: hinge coordinates are display coordinates

The coordinates returned by `hinge()` / `reservedRegions()` are **display coordinates
(device pixels)**.

- **Fullscreen**: the display and window origins coincide, so you can use them as window
  coordinates directly;
- **Split / free-floating windows**: they are **not** equivalent — subtract the window's
  origin on that display (`windowInfo().x` / `.y`).

```js
const win = useWindowInfo();
const hg = hinge(win());          // display coordinates
const localX = hg.x - win().x;    // convert to window-relative coordinates
```

In the cross-display drag scenario (window moving between two physical displays),
`screenOf()` / `windowInfo().screenId` change and the hinge readouts change with them —
two faces of the same mechanism.

## 5. Hinge avoidance: avoidReserved (opt-in)

Kernel elements **do not avoid** reserved regions by default — historical behaviour is
preserved so old UIs don't mysteriously shift. To avoid, declare it explicitly:

```jsx
<row avoidReserved="division">      {/* hinge only */}
  …
</row>
```

Values: `"division"` (hinge only) / `"occlusion"` (occlusion only) / `"all"` or `true` (both).

::: danger avoidReserved does not apply to `<scroll>`
Shrinking the usable area inside a scrolling container fights the scrollbar semantics
(the kernel logs a one-time warning and **ignores** it).

To avoid inside a scroll region, add your own container carrying `avoidReserved` **outside**
the scroll area (a toolbar or button-group `row` / `column`).
:::

## 6. Tabletop: top-bottom split

`hingeOrientation() === "horizontal"` means a horizontal fold — the screen is split into a top
and a bottom half. The canonical Tabletop (laptop-mode) pattern is **top half as the display,
bottom half as the control surface**.

```js
import { layoutMode } from "gx/viewport";
import { hingeOrientation, usePosture } from "gx/screen";

const m = layoutMode();
// when suggested === "tablet", use a top-bottom split layout
if (m.suggested === "tablet") { /* top content + bottom controls */ }
```

Distinguish horizontal from vertical folds with `hingeOrientation()`, **never by guessing from
width** — a 900×1440 horizontal fold is narrower than a 1440×900 vertical fold, but the two
have completely different semantics.

`suggested` is only a suggestion. The framework **never touches your layout** — deliberately
so.

## 7. Cross-display dragging

The `display` changes you read when a window moves between two physical displays:

```js
import { screenOf, useWindowInfo } from "gx/screen";

const win = useWindowInfo();
const s = screenOf();                              // the display the window is on
// s: { id, width, height, scale, foldable, … }
```

Drag the window to another display (or call `moveTo`) and both `screenOf()` and
`windowInfo().screenId` change. Convert hinge coordinates per rule ③ above.

## 8. Rule ④: reporting is the host's job

**No report means posture is permanently `flat`.** Windows / X11 expose no posture query API
(no WinRT equivalent, no matching X11 extension).

That isn't a bug — it's the "**provide a channel, don't guess**" stance. On real devices the
platform shell reports it:

| Platform | Reporter |
| --- | --- |
| Android | `DisplayManager` (`gfx/mobile.ReportDisplayFold`) |
| iOS | `UITraitCollection` |
| HarmonyOS | ArkUI fold-state callbacks |

The script-side code is identical across all three. Desktop dev tools, simulators and
automated tests can call `reportPosture(opts)` the same way (which is how the example in this
tutorial demonstrates it).

```js
import { reportPosture } from "gx/screen";

reportPosture({
  foldable: true,          // required on the first report
  width: 900,              // required on the first report
  height: 1440,            // required on the first report
  posture: "half-open",
  hinge: { x: 0, y: 700, w: 900, h: 40, orientation: "horizontal" },
});
```

::: warning The first report must carry width / height / foldable
Otherwise "the display the window is on" can't be resolved and every posture read afterwards
is **empty** — this is the easiest one to trip over.
:::

Call `resetDisplays()` on exit to hand the display table back to the backend; in tests that's
`gfx.ResetDisplaysForTest()` (skipping it leaves the next test case reading a fake display a
previous case injected).

## 9. The runnable four-scenario example

`apps/foldable-demo` in the repo turns the four rules above into four side-by-side scenarios:

| Scenario | What it demonstrates |
| --- | --- |
| **S1 Adaptive columns** | Column count depends only on width; dragging the window narrower flips two columns to one |
| **S2 Hinge avoidance** | `avoidReserved="division"` makes content step around the hinge band |
| **S3 Tabletop** | Horizontal fold → top-bottom split, top content / bottom controls |
| **S4 Cross-display drag** | How `screenOf()` / `screenId` change when the window moves displays |

```bash
gox apps/foldable-demo/src/main.js
```

The app plays host itself: clicking a form button = reporting a posture to the kernel, and the
script-side readouts follow.

## 10. Troubleshooting checklist

| Symptom | Most likely cause |
| --- | --- |
| Folded but still single-column | The posture is **never reported** ⇒ permanently flat. Start by confirming `posture(win)` really reads `"half-open"` |
| Folding doesn't update, rotating does | **Only one of the two signals is subscribed** — `useReservedRegions()()` subscribes to both the window environment and the display table |
| UI looks "dead", folding does nothing | A subscribing readout sits inside one arm of a ternary/short-circuit, so the first frame never reached it ⇒ the subscription was never established |
| Content collides with the hinge band | `avoidReserved` is missing, or it's on a `<scroll>` (where it's ignored) |
| `hinge()` width reads 0 and the hinge seems lost after a round-trip | Early `reportPosture` only accepted `w`/`h`; both spellings are accepted now (short form wins), so `reportPosture({ hinge: hinge() })` round-trips directly |
| Column count jumps with fold state | Deriving the column count from `posture()` instead of `widthClass()` / `hasFold()` |

---

Next stop: [Component Reference](/en/components/) for full element props, or back to
[GUI Desktop Apps](/en/guide/gui) for the reactive and layout fundamentals.
