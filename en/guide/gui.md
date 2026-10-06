---
title: GUI Desktop Apps
description: "Build GUI desktop apps with Gox: declarative UI with JSX + gx/gfx, signal-driven updates via gx/solid, pure-Go software rasterization, 44 built-in elements, routing and multi-window — a counter in 16 lines."
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
| Form controls<br>10 | `<button>`, `<checkbox>`, `<radio>`, `<switch>`, `<input>`, `<search>`, `<textarea>`, `<select>`, `<rating>`, `<slider>` |
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

**Props are evaluated once at call time**, so the reactive `each` / `show` must be passed getter functions (`each={() => rows()}`) — the same discipline as `value` on controlled components. **Children are no exception**: ``count: {count()}`` is a snapshot; write ``{() => `count: ${count()}`}`` (this one has no warning). For details, see [Component Reference · Lists and conditions](/en/components/patterns#view). **Ternaries / short-circuits eat subscriptions**: a subscription-type reading (the `useXxx()` family) inside a branch the first frame doesn't take is never called, so no subscription is established — the effect ends up with zero dependencies, never re-runs, and emits no warning. Take the subscription reading unconditionally first, then branch: `const r = useReservedRegions()(); if (!hasFold()) return "no fold";`. Which readings subscribe is listed in [Component Reference · Lists and conditions](/en/components/patterns#view).

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

## Running on phones: Android / iOS / HarmonyOS

Beyond the desktop, the same JSX + `gx/gfx` code also runs on phones — the rendering core (node / layout / raster / font) is untouched; only the **host shell** differs. Windows uses win32, macOS uses cocoa, and on mobile each platform's shell project drives the same `libgox`. **All UI logic still lives in JS** — the shell only handles "present the frame + input + report system state".

### Platform status

| Platform | Shell | What scripts get | Verified to |
| --- | --- | --- | --- |
| **Android** | Kotlin (`SurfaceView` + `Choreographer`) | present / touch / soft-keyboard IME / safe area / fold posture; native modules `gx/device` `gx/app` `gx/geo` `gx/media` `gx/permission` are largely complete | **Verified on an emulator** (x86_64 / API 34): rendering, touch, IME, safe area, foldable |
| **iOS** | Swift (`UIView` + `CADisplayLink`) | present / touch / IME / safe area / fold posture (`reservedRegions`, iOS 27.1+); native modules mostly complete — only `exitApp` is out (iOS forbids self-termination) | Shell project and build scripts (including TestFlight packaging) are **in place**; **device / simulator verification pending** |
| **HarmonyOS** | ArkTS (`PixelMap` + `onTouch`) | present / touch / safe area / fold reporting | Cross-compile + contract tests + HAP build **pass**; **not yet run on a device**; soft keyboard not wired, the six native modules are still stubs (only safe area and fold reporting work) |

::: warning v1 boundaries (not bugs — just not done)
Single buffering — the Go-side write and the host copy may overlap by one frame (tearing)｜multi-touch not recognized: a second finger down voids the whole gesture｜**density is reported, not converted** — `font={20}` is 20 physical pixels, which looks small on high-density screens; convert with `pixelRatio` from `gx/device`｜the soft keyboard uses **commit-on-result**, so pinyin composing states are not reported per keystroke (per-keystroke is P1).
:::

### Prerequisites

Mobile packaging **needs the Gox source repo** (the shell projects and cross-compile scripts live there; set `GOX_REPO` or run from inside the repo), plus the platform toolchain:

| Platform | Needs |
| --- | --- |
| Android | Android SDK (platform 35 + build-tools), NDK r25+, JDK 17, Gradle 8.7+ |
| iOS | macOS + Xcode |
| HarmonyOS | DevEco Studio + HarmonyOS SDK (Native, apiVersion 26) |

### Building for Android

Android is the most direct of the three — four steps:

```bash
# 1) Cross-compile libgox.so (the script self-checks the ELF target, catching "built fine, linked for the wrong target")
bash scripts/build-android.sh                 # arm64-v8a (device)
bash scripts/build-android.sh --abi x86_64    # emulator (runs natively on x86 hosts, far faster than arm64 translation)

# 2) Copy into the shell project (jniLibs/ is not in version control — re-copy after every rebuild)
mkdir -p app/android/app/src/main/jniLibs/arm64-v8a app/android/app/src/main/jniLibs/x86_64
cp dist/android/arm64-v8a/libgox.so app/android/app/src/main/jniLibs/arm64-v8a/
cp dist/android/x86_64/libgox.so   app/android/app/src/main/jniLibs/x86_64/

# 3) Build the APK
cd app/android && gradle assembleDebug

# 4) Install and watch the log
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb logcat -s Gox:I
```

The UI script is `app/android/app/src/main/assets/app.js` in the shell project. **Why the log filter is the `Gox` tag**: Android redirects stdout / stderr to `/dev/null` before forking the app process, so anything native code writes to fd 2 is invisible on a real device — every "skipped, failed" branch on the Go side therefore goes through the `Gox` tag. A "black screen with no logs" is undebuggable; this is the line that prevents it.

### Building for iOS: one command

iOS has a single entry point that runs `sync` (permission injection) → `icon` (AppIconSet) → cross-compile `libgox.a` → xcodebuild to assemble `dist/<name>.app`:

```bash
gox build ios my-app                        # simulator target by default, unsigned (installable via simctl)
gox build ios my-app --device               # device (needs a signing cert; prints setup guidance when absent)
gox build ios my-app --entry src/main.js    # entry script (defaults to src/main.js)
DEVELOPMENT_TEAM=<TeamID> bash scripts/build-ios.sh --archive   # device Release + .ipa (for TestFlight)
```

The iOS shell **supports a single-file entry only**: that script may import built-in `gx/*` modules, but not relative-path files (the shell evaluates one file, with no module base). In return, `--entry` merges the entry into the `.app` automatically — one step easier than Android, where you currently replace `assets/app.js` by hand.

### Building for HarmonyOS: two steps (no `gox build` target yet)

```bash
# 1) Cross-compile (there is no GOOS=openharmony — the script uses GOOS=linux + OHOS clang + a musl sysroot)
bash scripts/build-harmony.sh --abi arm64     # device; use --abi x86_64 for the emulator
cp dist/harmony/arm64/libgox.so app/harmony/entry/libs/arm64-v8a/

# 2) Build the HAP (command-line recipe, no wrapper needed)
export DEVECO_HOME="<DevEco Studio install dir>"   # contains sdk/ and tools/
export DEVECO_SDK_HOME="$DEVECO_HOME/sdk"
node "$DEVECO_HOME/tools/ohpm/bin/pm-cli.js" install --all
node "$DEVECO_HOME/tools/hvigor/bin/hvigorw.js" --mode module \
     -p module=entry@default -p product=default -p buildMode=debug assembleHap --no-daemon
```

The UI script is `app/harmony/entry/src/main/resources/rawfile/app.js`. The `.so` goes into `entry/libs/<abi>/`, using the **Android-style ABI name** `arm64-v8a` (not the LLVM triple `aarch64-linux-ohos`) — getting this wrong builds green and fails to load at runtime.

::: info The scaffold generates Android / iOS skeletons only
A project created by `gox create` ships an `android/` (manifest + gradle) and an `ios/` (Info.plist + icons) skeleton, but **no HarmonyOS skeleton**. For HarmonyOS, refer to the shell project `app/harmony/` in the repo.
:::

### Three things mobile UI must consume

Only three things differ from the desktop, and all of them are **reactive consumption that degrades automatically on the desktop** (insets are always 0 there, so the same code becomes plain padding):

| Concern | Use | Notes |
| --- | --- | --- |
| Safe area (notch / gesture bar / punch-hole) | `import { useInsets } from "gx/viewport"` | Edge-anchored components add padding reactively (a top bar reads `top`, a TabBar reads `bottom`, a side rail reads `left` / `right`); never hardcode the numbers |
| Soft-keyboard avoidance | `useKeyboardHeight()` | Keyboard height travels on its **own channel**; when an input is focused, raise or shrink the content area, and let bottom-anchored components yield — never float them over the keyboard |
| Breakpoints | `widthClass()` / `isCompactWidth()` | Three width tiers at 600 / 840dp (`compact` / `medium` / `expanded`), two height tiers at 480dp; a phone in portrait is single-column, a tablet can go two-column |

For foldables, add one more: `import { hasFold, useReservedRegions, layoutMode } from "gx/viewport"`. When half-folded (book mode) `RouterView` switches to two columns automatically (the left column shows the previous history entry), and nothing is drawn on the crease band. Note that `hasFold()` / `layoutMode()` are **plain reads (no subscription)** whereas the subscribing family is `useReservedRegions()` / `useLayoutMode()` / `useInsets()` — putting a plain read inside a ternary **short-circuits** the subscribing call, leaving that effect with zero dependencies that never re-runs again, **with no warning at all**. The fix is to **take a subscribing read unconditionally first, then branch**.

For the mobile interaction spec (48dp touch targets, press states, bottom-anchored overlays at the compact breakpoint, keeping a focused input visible, etc.) see [docs/mobile-adaptation.md](https://github.com/14752222/Gox/blob/main/docs/mobile-adaptation.md); for shell build details, the JNI / NAPI contracts, and first-frame checklists see [app/NATIVE-HOST.md](https://github.com/14752222/Gox/blob/main/app/NATIVE-HOST.md).
