---
title: "Cross-Cutting Capabilities: Reactive Rendering, each/show Directives, Events, Layering, Animations"
description: "Gox GUI cross-cutting capabilities: gx/solid reactive rendering and function children, each/show element-level directives (keyed reuse), the event and focus model, zIndex/absolute/escapeClipping layering, and transition animations."
---

# Cross-Cutting Capabilities: Reactive Rendering, each/show Directives, Events, Layering, Animations

## Reactive & List Rendering {#reactive}

`Stable`

These APIs from `gx/solid` are the answer to "why does the UI update". For the full exports, signatures, and edge cases see the [API Reference · gx/solid](/en/api/gx).

| API | Signature | Description |
| --- | --- | --- |
| createSignal | (initial) => [get, set] | Creates a signal. Call `get()` to read (which also registers a dependency), `set(v)` or `set(fn)` to write; **no notification when the old and new values are `===` equal** |
| createEffect | (fn) => dispose | Runs `fn` immediately and subscribes to all signals read inside it; **the return value is a dispose function** |
| createMemo | (fn) => getter | Derived computed value, **lazy**: dependency changes only mark it dirty; it recomputes on read |
| createResource | (fetcher) => [data, res] | The async data trio. `data()` gets the current value; `res.state()` is `"pending"` / `"ready"` / `"refreshing"` / `"error"`; `res.error()` gets the error; `res.refetch()` refetches (keeping the old value displayed). **The controls must be destructured as the second element** — nested destructuring like `[data, {refetch}]` is not supported by the engine |
| onMount | (fn) | Runs once after the current generation of the subtree is mounted |
| onCleanup | (fn) | Runs when the current generation of the subtree is replaced / destroyed — use it to stop timers and unbind callbacks |
| untrack | (fn) => value | Runs `fn` **without registering dependencies** and returns the result. The router uses it internally to call page components, avoiding "signals read in the page body becoming dependencies of the router's effect" |
| devStats | () => object | Development-time statistics (signal count / subscription count, etc.), used with the `gx/dev` debug panel |

**Function children** are the unified entry point for list and conditional rendering: the result of evaluation can be an element, an array, a scalar, or `null`/`false` (rendered as nothing).

```js
const [items, setItems] = createSignal(["alpha", "beta"]);
const [tab, setTab] = createSignal(0);

// List rendering: the function returns an array; each element is mounted
<column gap={6}>
  {() => items().map((t) => <text>{t}</text>)}
</column>

// Conditional rendering: the function returns an element or null
{() => (tab() === 0 ? <text>Panel A</text> : <text>Panel B</text>)}

// Static array children are also supported: writing {rows} directly expands them into sibling nodes
<scroll height={120}>{rows}</scroll>
```

::: info Function children rebuild the whole group
When the array or the condition changes, the whole group of children is **rebuilt** (effects in the old subtree are disposed): adding or removing a few rows is fine, but each row's input focus, scroll position, and local signals are lost. For **keyed reuse** (rebuilding only the rows that actually changed) use the [each directive](/en/components/patterns#view); for very long lists you still have to mount only the visible range yourself (no virtualization).
:::

## Lists & Conditionals (element-level directives + gx/view) {#view}

`Stable`

Lists and conditionals are **element-level directives** (written on the element); for multiple branches use `Switch` / `Match` from `gx/view`. In Vue terms this is the `v-for` / `v-show` / `v-if` chain. **As of 2026-09-20**: the `<For>` / `<Show>` components have been removed in favor of the directives below (semantics unchanged: `<view each={x}>` is pixel-for-pixel identical to the old `<For each={x}>`).

```js
import { Switch, Match } from "gx/view";   // each / show are h()-level directives, no import needed

<view each={rows} key="id" fallback={<text>No data</text>}>
  {(row, i) => <row><text>{(i + 1) + ". " + row.title}</text></row>}
</view>

<view show={open} fallback={<text>Hidden</text>}>
  <input width={150} model={draft} />
</view>

<Switch fallback={<text>Unknown state</text>}>
  <Match when={() => phase() === "loading"}><text>Loading…</text></Match>
</Switch>
```

| Directive / API | Signature | Description |
| --- | --- | --- |
| `each` | {each, key?, fallback?, stable?, gap?} + `(item, i) => node` | List loop (**element-level directive**, written on the element). Rows with **the same key + same row reference + same index** are reused as-is (inline inputs, scroll positions, and local signals are kept); only rows that actually changed re-render; `each` also accepts a number (0..n-1); `key="id"` is shorthand for `key={(r) => r.id}` |
| `show` | {show, fallback?} + children | Conditional visibility (**keep-alive**): hiding only removes the subtree from layout flow; it stays mounted and switches back instantly on re-show. Write the condition as `show={open}` (a signal is itself a getter) |
| `view` | — (tag) | **A layout-transparent container** (Fragment): with a single child its size follows the child exactly; with multiple children they stack in the parent's direction, and it takes up no box of its own. It is the "box-less template" for the directives — `<view each={rows}>` matches the old `<For>`; `<row each={rows}>` gives each item its own box |
| Switch / Match | `({fallback?}, ...<Match/>) / ({when}, ...children)` | Multi-branch: picks the first branch in declaration order whose `when` is true; if none match, uses `fallback` (still exported components from `gx/view`) |

::: info Misuse now makes noise instead of failing silently
`each` / `show` expect **getter functions**: writing `each={rows()}` / `show={open()}` only captures a snapshot, and the UI won't re-render when the signals change. Each of these invalid forms (`each` receiving a string/object, a static boolean with the parens forgotten, `key` receiving a number, `stable` receiving a function) now emits one deduplicated warning (stderr + the `gx/dev` buffer).
:::

```js
import { Switch, Match } from "gx/view";   // each / show are element-level directives, no import needed

<view each={() => rows()} key={(r) => r.id} fallback={<text>No data</text>}>
  {(row, i) => <row><text>{(i + 1) + ". " + row.title}</text></row>}
</view>

<view show={() => open()} fallback={<text>Hidden</text>}>
  <input width={150} model={draft} />
</view>

<Switch>
  <Match when={() => phase() === "loading"}><progress value={0.5} /></Match>
  <Match when={() => phase() === "error"}><text>Something went wrong</text></Match>
</Switch>
```

::: info each / when take functions
Props are evaluated at the call site: writing `each={rows()}` only captures a snapshot, and the UI won't re-render when the signal changes; writing `each={() => rows()}` is what "follows the signal". This is the same discipline as the controlled `input`'s `value` having to be a function; passing an array / number literal is a valid **static** list (rendered once).

**The same goes for children — but this one is silent**: ``<text>count: {count()}</text>`` evaluates `count()` before `h()` is even called, so it stays frozen on the first frame; write ``<text>{() => `count: ${count()}`}</text>`` instead. A text child takes a scalar by nature (``<text>hello</text>`` is itself a string child), so at runtime there is no way to tell "static text" from "a snapshot" — this one is on discipline alone.
:::

- Reuse checks include the index: reordering or deleting a middle item shifts the indexes of later rows, and those rows re-render in place (that's how row numbers track position). Add stable when rows don't display their position to take the index out of the check (the cost: the index argument stays frozen at its mount-time value).
- show / Switch are not v-if: hiding only removes the subtree from layout flow and keeps it alive — while hidden, the content still follows the signals, and it comes back exactly as it was. For "built fresh on every show" use function children `{() => cond() ? <X/> : null}`.
- When a row is deleted, its subtree is destroyed (onCleanup runs); keyed "move" animations and virtualized long lists are not implemented.
- The host is a transparent placeholder node: put it in a column for vertical stacking or a row for horizontal stacking; it takes up no box of its own; row wrap does not recognize it for line breaking (use a plain row for wrapping label flows).

## Events & Focus {#events}

`Stable`

Every event finds the first handler along the ancestor chain and stops there — **no bubbling, no capture, no `stopPropagation`**.

| Event | Callback args | Description |
| --- | --- | --- |
| onClick | none | Left button release |
| onMouseMove | `{x, y}` | Mouse moves within the node |
| onWheel | `{deltaY}` | Positive when scrolling down (DOM convention). Consumed first by containers inside `scroll` |
| onContextMenu | `{x, y}` | Right button release; commonly used to call `openContextMenu` |
| onKeyDown / onKeyUp | `{key, ctrl, shift, alt}` | Delivered to the focused node, then walks up the ancestor chain |
| onFocus / onBlur | none | Focus enters / leaves |
| onInput | `{value}` | Edit callback for input-like components (string; slider is a number) |
| onResize | `{width, height}` | **Window-level** event: delivered to the layout root when the window size changes, **not fired on non-root nodes**. Combined with a signal it's the useWindowSize pattern (see below) |

### useWindowSize: adaptive on window resize

```js
// onResize only recognizes the layout root; breakpoints are plain memos in the script, not baked into the kernel
const [win, setWin] = createSignal({ width: 520, height: 360 });
const wide = createMemo(() => win().width >= 480);

<window title="app" width={520} height={360}>
  <column onResize={(e) => setWin({ width: e.width, height: e.height })}>
    {() => (wide() ? <Sidebar /> : <text font={12}>(narrow)</text>)}
  </column>
</window>
```

**Focus model**: clicking any node makes it the keyboard focus, and the focused node gets a 1px blue dashed outline. A `disabled` subtree responds to no events and is skipped in focus switching. Tab-key traversal is not implemented in v1; focus can only be changed by mouse click.

```js
<rect
  width={380} height={110} background="#eef3f8"
  onClick={() => setLast("click")}
  onMouseMove={(e) => setPos(`${e.x}, ${e.y}`)}
  onWheel={(e) => setLast(`wheel deltaY=${e.deltaY}`)}
  onContextMenu={(e) => setLast(`context menu at ${e.x}, ${e.y}`)}
  onKeyDown={(e) => setLast(`keydown ${e.key}`)}
>
  <text>click to focus, then move / scroll / right-click / type</text>
</rect>
```

## Layering & Positioning {#layering}

`Stable` · `Clipping escape`

Controls who paints on top of whom, and lets elements escape the normal flow. Three groups of props, each doing one thing.

| Prop | Type | Description |
| --- | --- | --- |
| zIndex | number | Paint and hit order within the same layer; higher is on top. Uses a stable sort, **does not reorder children** |
| position | string | Setting it to `"absolute"` takes the element out of the normal flow; `left` / `top` then take effect (relative to the parent's content area) |
| left / top | number | Offsets for absolute positioning |
| escapeClipping | boolean | Lets this subtree's painting and hit testing **overflow its parent's box**, and collects it for last-draw at the root level |

::: warning absolute does not lift the parent's clipping
`position="absolute"` only takes the element out of the normal flow; by default it is **still clipped by its parent's box**. To make an overlay overflow its parent's bounds, you must explicitly add `escapeClipping`. Built-in overlay tags (`dialog` / `toast` / the `select` popup / menus) already carry this capability, so you don't need to write it by hand.
:::

```js
{/* Overlay: absolutely positioned at the top-left of the parent's content area */}
<rect position="absolute" left={12} top={8} width={100} height={20} background="#f2c94c" />

{/* Custom overlay: escapeClipping is required to overflow the parent box */}
<column position="absolute" top={30} escapeClipping={true}>
  <text>Floating on top</text>
</column>
```

## Transition Animations {#animation}

`Stable` · `Not an element`

Animation is not a component but a cross-cutting capability that can be attached to **any** node: when a value changes, it smoothly approaches the target with ease-out over the given duration.

| Prop / API | Type | Description |
| --- | --- | --- |
| transition | number or object | `transition={400}` is shorthand (applies to all animatable properties); <code v-pre>transition={{width: 400, opacity: 350}}</code> sets a duration per property |
| opacity | number | 0~1, **grouped**: a semi-transparent parent fades the whole subtree together |
| animate(node, prop, to, ms) | imperative | Animates a property of a node to a target value; returns a cancel function |
| animate(from, to, ms, onUpdate, onDone) | imperative | Never touches element properties; you get the interpolated values yourself (pair with things like `setStatus`) |

The declarative `transition` only recognizes these five numeric properties: `width` / `height` / `left` / `top` / `opacity`.

```js
// Width transition: smoothly expands/contracts over 400ms on toggle
h("rect", {
  height: 18,
  background: "#2f80ed",
  transition: { width: 400 },
  width: () => (wide() ? 300 : 60)
}),

// Grouped fade: a semi-transparent parent fades the whole subtree together
h("row", {
  gap: 6, height: 28,
  transition: { opacity: 350 },
  opacity: () => (visible() ? 1 : 0.15)
},
  h("rect", { width: 24, height: 24, background: "#c0392b" }),
  h("text", { font: 12, width: 80, height: 24 }, "fading")
),

// Imperative: you get the interpolated values; onUpdate is called each frame (~60fps)
h("button", {
  onClick: () => {
    animate(0, 100, 600,
      (v) => setStatus("progress " + Math.round(v) + "%"),
      () => setStatus("done"));
  }
}, "bounce")
```

::: info Three behaviors that are easy to misjudge
**① No transition on first assignment** (same as CSS): an element doesn't "grow from 0" when first mounted; use imperative `animate()` for entrance animations.<br> **② Layout reads the interpolated values during the transition**, so sibling nodes make way — it's not just a visual effect.<br> **③ While an animation is running, the prop the script reads is already the final value**: the prop is the single source of truth; the interpolation only exists in the render layer. To read "the currently displayed value" you have to maintain it in a signal yourself.
:::

- The easing curve is fixed to ease-out and cannot be customized; no keyframes, no transition-delay.
- No color transitions in v1.
- value / padding / gap / margin / flexGrow are deliberately excluded: transitioning the former would fight the script's own controlled write-back, and half-pixel intermediate values of the latter would let text bleed through.
- Zero cost when idle (no active animation means no timer is kept alive).
