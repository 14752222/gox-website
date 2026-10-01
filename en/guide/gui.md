---
title: GUI Desktop Apps
description: "Build GUI desktop apps with Gox: declarative UI with JSX + gx/gfx, signal-driven updates via gx/solid, pure-Go software rasterization, 43 built-in elements, routing and multi-window — a counter in 16 lines."
---

# GUI Desktop Apps

The `gx/gfx` module plus JSX syntax gives you declarative UI: the renderer is a pure-Go software rasterizer (no cgo, no dynamic library dependencies), with flex-style layout and dirty-rectangle partial redraws. Here's a counter in 16 lines:

```js
// counter.js
import { createSignal } from "gx/solid"
import { h, render } from "gx/gfx"

const [count, setCount] = createSignal(0)

render(
  <window title="Counter" width={400} height={300}>
    <column gap={8} padding={16}>
      <text font={20}>{() => `count: ${count()}`}</text>
      <button onClick={() => setCount(c => c + 1)}>Add one</button>
    </column>
  </window>
)
```

```bash
gox counter.js          # run directly; a 400x300 window pops up
```

## How it works

- JSX is lowered at compile time into h(tag, props, ...children) calls — no virtual DOM diffing; props and text nodes bind directly to signals; that's why `h` must be imported (every file using JSX needs it)
- Passing a function as a prop or text (e.g. {() => `count: ${count()}`}) creates a reactive binding: a signal update → nodes depending on it are marked dirty → dirty rectangles are merged and only the affected regions are repainted
- Clicking the button → setCount updates the signal → the chain above runs automatically; no manual refresh code
- Input components are controlled: the display only reads `value`, and editing only dispatches onInput / onChange — so remember to write the value back to a signal in the callback; or use the two-way binding directive model={draft} to wire it up in one step

## Built-in elements and props

There are **42** built-in elements scriptable from JS (internal tags constructed on the Go side such as `select-popup` / `menu-item` are not counted), grouped into seven categories by purpose; plus the layout-transparent container tag `<view>` (a Fragment that takes up no box itself, and hosts the `each` / `show` directives). Below is a cheat sheet; full parameters and examples for each element are in the [Component Reference](/en/components/).

| Category | Elements |
| --- | --- |
| Layout containers<br>7 | `<column>`, `<row>`, `<grid>`, `<scroll>`, `<separator>`, `<spacer>`, `<rect>` |
| Form controls<br>9 | `<button>`, `<checkbox>`, `<radio>`, `<switch>`, `<input>`, `<search>`, `<textarea>`, `<select>`, `<slider>` |
| Content display<br>16 | `<text>` (`wrap` / `ellipsis`), `<image>`, `<video>` (tag + host contract; decoding is delegated to the platform video layer), `<progress>`, `<alert>`, `<tag>`, `<badge>`, `<avatar>`, `<empty>`, `<icon>`, `<spinner>`, `<skeleton>`, `<pagination>`, `<table>`, `<tree>`, `<list-item>` |
| Feedback & overlays<br>4 | `<dialog>`, `<drawer>`, `<toast>`, `<tooltip>`, plus the native `alert` / `confirm` / `openFile` / `saveFile` from `gx/dialog` |
| Navigation & menus<br>5 | `<menubar>`, `<menu>`, `<menuitem>` (global `shortcut`), `<tabs>`, `<tab>`, `openContextMenu(x, y, items)` |
| Media & custom drawing<br>1 | `<canvas>` (`onDraw(ctx)` + 7 drawing primitives) |
| Window<br>1 | `<window>` (only as the root element of `render()`; call it multiple times to open multiple windows; the returned handle provides `close` / `isClosed` / `title` / `setTitle` / `resize`) |

Common props:

| Prop | Description |
| --- | --- |
| `width` / `height` / `margin` | Integer pixels; also accepts `"50%"` percentages; if omitted, determined by content |
| `minWidth` / `maxWidth` / `minHeight` / `maxHeight` | Size clamping |
| `gap` / `padding` / `flexGrow` / `flexShrink` / `wrap` | Spacing, padding, main-axis free-space distribution and shrinking, `row` line wrapping |
| `alignItems` / `justifyContent` | Cross-axis / main-axis alignment |
| `background` / `border` / `color` / `font` | Styling; colors support alpha (`#rrggbbaa` / `rgba()`) and linear gradients |
| `radius` / `shadow` / `borderWidth` / `borderStyle` | Corner radius, shadow, border width and solid/dashed style |
| `value` / `checked` / `open` | Controlled-component state, all driven by JS signals |
| `disabled` | Inherited down the ancestor chain; the subtree ignores events and is excluded from focus |
| `zIndex` / `position` / `escapeClipping` | Stacking, absolute positioning, escaping the parent box's clipping |
| `transition` / `opacity` | Transition animations (animatable props: `width`/`height`/`left`/`top`/`opacity`) |

::: info Inheritance rules: both font and color inherit down the ancestor chain
`font` (font size): the element's own `font` wins; if absent, the nearest ancestor's is used; only then the default 16. So a `<button font={13}>` label is measured and drawn at size 13 — no need to repeat it on every child.<br> `color` (text color): CSS-style inheritance as well — self → nearest ancestor → near-black default, so `<button color="#fff">text</button>` works as expected.
:::

Event callbacks: `onClick`, `onMouseMove`, `onWheel`, `onContextMenu`, `onKeyDown` / `onKeyUp`, `onFocus` / `onBlur`, `onInput` / `onChange`, `onClose`, `onDraw`, `onResize` (window-level: attach to the layout root; payload `{width, height}`). Events walk up the ancestor chain and stop at the **first handler found — no bubbling**; note the `onClick` callback receives no arguments.

::: info Controlled semantics
No input component keeps its own state — `value` decides what is displayed, and interaction only dispatches `onInput` / `onChange`. Forget to write the value back to a signal and the input box will "type without effect" or the slider will "snap back". This matches DOM controlled components. The shortcut that skips this step is the two-way binding directive: `<input model={draft} />` — internally it is exactly this `value` + `onInput` pair, wired up by the kernel.
:::

::: warning Platform support
Window backends: Windows (pure syscall win32), Linux (X11; Wayland goes through XWayland), and macOS (cocoa, since 0.6.0, driving AppKit via purego in pure Go). IME and native dialogs are provided on the Windows and macOS backends; other platforms degrade gracefully.
:::

## Built-in modules cheat sheet: what to import

`gx/*` are **built-in modules** (resolved before the filesystem): 16 fine-grained modules in total, plus one aggregate entry `gox` that re-exports them all. App code can grab the common set in a single line, while library code is clearer importing per module — both spellings point to the same implementation.

| To do what | What to import |
| --- | --- |
| Reactive signals, async resources | `import { createSignal, createMemo, createResource } from "gx/solid"` |
| Element trees, windows, frame callbacks, clipboard, animation | `import { h, render, requestAnimationFrame, clipboardWriteText, animate } from "gx/gfx"` |
| Multi-branch conditions | `import { Switch, Match } from "gx/view"` |
| Routing | `import { createRouter, RouterView, RouterLink, useRoute } from "gx/router"` |
| Multi-screen / fold posture | `import { screens, screenOf, usePosture, reportPosture } from "gx/screen"` |
| Native message boxes / file picker | `import { alert, confirm, openFile, saveFile } from "gx/dialog"` |
| Local persistence | `import { setAppName, setStorage, getStorage } from "gx/storage"` |
| Dev-time debug panel | `import { devSnapshot } from "gx/dev"` |
| Device info / battery / network / vibration / brightness | `import { deviceInfo, battery, isOnline, canIUse } from "gx/device"` |
| Foreground/background / back button / share & exit | `import { appState, onBackPress, share, exitApp } from "gx/app"` |
| Location | `import { getLocation, watchLocation } from "gx/geo"` |
| Camera / image & video picker | `import { takePhoto, chooseImage, chooseVideo } from "gx/media"` |
| Permissions | `import { checkPermission, authorize, requestPermissions } from "gx/permission"` |
| Safe areas / soft keyboard / split screen | `import { insets, keyboardHeight, isSplit } from "gx/viewport"` |
| Theme and dark mode | `import { setTheme, toggleDark, current } from "gx/theme"` |
| Desktop auto-update | `import { currentVersion, checkForUpdate, downloadAndInstall } from "gx/update"` |
| Can't be bothered to remember module names | `import { h, render, createSignal, createRouter } from "gox"` (the union of the 16 above) |

::: warning The four most common mix-ups
**①** `alert` / `confirm` / `openFile` / `saveFile` live in **`gx/dialog`**, **not `gx/gfx`** (importing from the latter is now a **compile-time error**).<br> **②** `each` / `show` / `model` are **element-level directives** — written on the element, **no import needed**; `gx/view` only exports `Switch` and `Match`.<br> **③** `gx/screen`'s `useXxx` **returns a getter function** that must be called again: `const r = usePosture(); r()`.<br> **④** The native capability modules' `useBattery()` / `useInsets()` likewise **return getter functions**; action-style APIs (camera / location) **reject** when the capability is missing — check with `canIUse("camera")` first.

For every export, signature, and calling convention, see the [API Reference · Built-in modules gx/*](/en/api/gx).
:::

## Lists and conditions: element-level directives

Loops and visibility are **directives written on the element**, expanded by the `h()` layer — no imports needed; for multi-branch conditions use `gx/view`'s `Switch` / `Match`. `<view>` is the layout-transparent host; with it, "lists gain no extra wrapping box".

```js
import { Switch, Match } from "gx/view";

<view each={rows} key="id">
  {(row, i) => <text>{(i + 1) + ". " + row.title}</text>}
</view>

<view show={open}><input model={draft} /></view>
```

**Props are evaluated once at call time**, so the reactive `each` / `show` must be passed getter functions (`each={() => rows()}`) — the same discipline as `value` on controlled components. **Children are no exception**: ``count: {count()}`` is a snapshot; write ``{() => `count: ${count()}`}`` (this one has no warning). For details, see [Component Reference · Lists and conditions](/en/components/patterns#view).

## Routing: gx/router

No need to roll your own page switching — the built-in module `gx/router` (landed 2026-09-21) provides a route table, `:param` matching, three levels of guards, a history stack, lazy loading, and multi-window scoping:

```js
import { createRouter, RouterView, RouterLink } from "gx/router";

const router = createRouter({
  routes: [
    { path: "/",           name: "home",   component: HomePage },
    { path: "/detail/:id", name: "detail", component: DetailPage },
  ],
  initial: "/",
});

render(
  <window title="app" width={420} height={300}>
    <column gap={8} padding={12}>
      <RouterLink to="/detail/7"><text>Details</text></RouterLink>
      <RouterView />
    </column>
  </window>
);
```

Out of the box you get `Alt+←` / `Alt+→` back/forward, a `*` fallback route, `keepAlive: true` on route records to preserve page state, and automatic two-column layout on half-folded screens. Desktop apps have **no URLs and no history mode** — "history" is just an in-memory stack. For the full manual see the repo's [docs/gui-router.md](https://github.com/14752222/Gox/blob/main/docs/gui-router.md); for small tools with three pages or fewer and no need for guards or a history stack, the "one signal + a page table" pattern in the [patterns manual](https://github.com/14752222/Gox/blob/main/docs/gui-patterns.md) is simpler.

## Screens and fold posture: gx/screen

The companion module `gx/screen` exposes the monitor table and the screen a window is on, plus a fold-posture channel. **Windows / X11 have no posture query API, and the framework does not guess** — it only offers `reportPosture()` for reporting; with nothing reported, posture stays flat. When half-folded, `RouterView` automatically switches to two columns (the left column shows the previous history entry).

## Local persistence: gx/storage

```js
import { setAppName, setStorage, getStorage } from "gx/storage";

setAppName("my-app");                       // decides which subdirectory data lands in; call it first
setStorage("theme", "dark");
const theme = getStorage("theme") ?? "light";   // returns undefined when missing; no default-value parameter
```

For complete examples, see the repo's `testdata/` directory: counter `counter_demo.js`, form `form_demo.js`, menu `menu_demo.js`, canvas `canvas_demo.js`, slider `slider_demo.js`, multi-window `multiwindow_demo.js`, routing `router_demo.js`, and more — **40+** demo scripts in total, each runnable directly with `gox testdata/xxx_demo.js`.
