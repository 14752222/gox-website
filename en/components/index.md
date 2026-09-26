---
title: "Component Reference: Overview and Conventions"
description: "Overview of the Gox GUI component reference: a category map of the 25 built-in elements, plus five shared conventions — imports, reactive bindings, controlled semantics, styling, and unknown-tag warnings."
---

# Component Reference: Overview and Conventions

## Read This First: Five Shared Conventions {#concepts}

Each component below only describes its own specifics, but these five rules hold for **all** components. Understand them first and the tables ahead will read much more easily.

### ① Imports

JSX needs `h` in scope, so every GUI script imports it from `gx/gfx`; reactive signals come from `gx/solid`:

```js
import { createSignal } from "gx/solid";
import { h, render } from "gx/gfx";
```

JSX tags are lowered at compile time into `h(tag, props, ...children)` calls, so `h` is a **required import** — even if you never call it explicitly. You can also build trees by hand with `h()`, which is fully equivalent to JSX.

### ② Reactivity: Passing a Function Means Binding

Any prop or text child that is passed a **function** gets wrapped in an effect: when a signal read inside the function body changes, the value is re-evaluated and that region is marked dirty.

```js
<text>静态文本</text>                      // Plain text is evaluated once and never updates (no braces needed)
<text>{"静态文本"}</text>                 // Braces hold an ordinary expression, also evaluated once (equivalent to the line above)
<text>{() => `count: ${count()}`}</text>   // Function → reactive binding

<rect width={200} />                      // 固定宽
<rect width={() => count() * 20} />       // 宽度跟随 count
```

::: info Dependencies Come From What the Function Body Reads
No read, no subscription. If you hide `count()` inside a branch like `if (ctx.width > 0)` that may not execute at runtime, the subscription is missed — manifesting as "the data changed but the UI didn't".
:::

### ③ Controlled Components: Display Follows Props Only; Editing Only Dispatches Events

All input components (`input` / `textarea` / `select` / `slider` / `checkbox` / `radio` / `switch` / `progress` / `dialog`) **hold no state of their own**. What they display is decided entirely by props; user interaction only dispatches callbacks.

```js
// Recommended (since 2026-09-20): one directive wires up both read and write
<input model={name} />                       // input / textarea / slider / select read and write value
<checkbox model={agree} />                   // checkbox / switch read and write checked (writes are inverted)
<radio model={plan} value="pro" />           // radio: writes the value attribute into model when selected
<input model={[() => user().name, (v) => setUser({ ...user(), name: v })]} />   // custom source

// Handwritten equivalent: write the value back to the signal in onInput, or the display won't change
<input value={() => name()} onInput={(e) => setName(e.value)} />

// Wrong: no write-back → typing does nothing (display always comes from the value prop)
<input value={() => name()} onInput={(e) => console.log(e.value)} />
```

A slider that doesn't write back "snaps back to place" and appears un-draggable; an input that doesn't write back appears "dead to typing". This matches the semantics of DOM controlled components. `model` accepts a **signal** (the getter from `createSignal`, which carries `.set` itself) or a **`[get, set]` pair**; it can coexist with the element's own callbacks like `onInput` (the write-back runs first, then both run). A wrong binding (e.g. `model={name()}`) logs a deduplicated warning rather than failing silently.

### ④ Sizing, Colors, and Decoration

Sizes are **integer pixels** by default, but **percentage strings** are also accepted (e.g. `width="50%"`, resolved against the parent's content area), and can be clamped with `minWidth` / `maxWidth` and friends. Colors support named colors and `#rgb` / `#rgba` / `#rrggbb` / `#rrggbbaa` / `rgb()` / `rgba()`, where alpha can be `0~255` or `0~1`.

| Property | Applies To | Description |
| --- | --- | --- |
| `width` / `height` / `margin` | All elements | Numbers are integer pixels; `"50%"` percentages are also accepted. When omitted, `intrinsicSize` computes it from content |
| `minWidth` / `maxWidth` / `minHeight` / `maxHeight` | All elements | Size clamps, applied after all assignments (stretch / grow / shrink / percentages) settle |
| `padding` | Containers | One value for all four sides; cannot be set per-side |
| `gap` | column / row / grid | Spacing between children; in grid it is both the row and column gap |
| `background` | All elements | Fill color on containers; on component tags it means "accent color" (selection fill, progress foreground, switch track). **Linear gradients are supported**: `"linear-gradient(to right, #a, #b)"` |
| `border` / `borderWidth` / `borderStyle` | All elements | Stroke color + width (default 1) + style (`solid` / `dashed`) |
| `radius` | All elements | Corner radius, automatically clamped to half the shorter side (large enough means pill shape) |
| `shadow` | All elements | <code v-pre>{{x, y, blur, color}}</code>; all four fields optional; blur clamped to 0~24, color defaults to 25% black |
| `color` | All elements | Text color. CSS-style inheritance: **self → nearest ancestor → near-black default**, so `<button color="#fff">text</button>` works |
| `font` | All elements | Font size in pixels. Also inherited along the ancestor chain: **self → nearest ancestor → 16** (values below 8 are ignored) |
| `disabled` | All elements | Inherited along the ancestor chain; the subtree neither responds to events nor participates in focus cycling, and is uniformly desaturated |

```js
<!-- Card: rounded corners + gradient background + shadow + 2px dashed border -->
<column
  gap={8} padding={14}
  radius={12}
  background="linear-gradient(to bottom, #ffffff, #eef2f8)"
  shadow={{ x: 0, y: 4, blur: 12, color: "#00000033" }}
  border="#c9d4e2" borderWidth={2} borderStyle="dashed"
>
  <text>card</text>
</column>
```

::: info Where Decorations Apply
Rounded corners / gradients / shadows / border width apply to the **generic box branch** (`rect`, `column`, `row`, `grid`, etc.) and `button`. The **internal coloring** of components like `input` / `select` / `scroll` ignores these properties. Additionally, the gradient face does not participate in the button's hover brightening (brightening is only defined for solid faces); solid fills with `radius=0` and 1px solid borders take a zero-overhead fast path — performance is identical to no decoration at all.
:::

### ⑤ Unknown Tags Warn

`h()` validates tag names against a whitelist; tags outside the set print a warning **once** to stderr and render as a plain box:

```text
gfx: unknown tag "foo" (rendered as a plain box; see docs/gui-guide.md)
```

This is intentional — unregistered components used to silently render as blank space, the hardest bug to track down. Seeing this warning means the tag name is misspelled or the component isn't implemented yet.

::: warning Generic Boxes Don't Lay Out Children
Tags other than `column` / `row` (including unknown tags and `rect`) stack **all children in the top-left corner** even when sized. For grouping containers, just use `<column>` or `<row>`.
:::
