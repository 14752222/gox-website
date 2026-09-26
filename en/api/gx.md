---
title: "Builtin Modules gx/*: Complete Exports and Calling Conventions"
description: "Complete Gox builtin module reference: gx/solid reactivity, gx/gfx UI, gx/view, gx/router, gx/screen, gx/dialog, gx/storage, gx/dev and the native capability layer gx/device/gx/app/gx/geo/gx/media/gx/permission/gx/viewport — every export with its signature."
---

# Builtin Modules gx/*: Complete Exports and Calling Conventions

## Builtin Modules gx/* {#modules}

There are **9 builtin modules** in total: **8 focused modules** (divided by responsibility) plus **1 aggregate entry `gox`** (the union of the 8). They require an `import` and **take precedence over filesystem resolution** — `gx/` and `gox` are reserved namespaces; a typo raises an "unknown module" error listing the available modules rather than degrading into "read some same-named file".

Each module below comes with the **complete export list + signatures + return values + calling conventions**. Every entry has been checked against the `RegisterBuiltinModule` registry and enumerated against the real runtime (`Object.keys(import * as ns)`).

### Module Map and Import Paths {#m-map}

| Module | Exports | What it does | Platform |
| --- | --- | --- | --- |
| `gox` | 139 | Aggregate entry: the **union** of the 14 modules below | — |
| `gx/solid` | 8 | Reactive primitives (signals / effects / derived values / async resources / lifecycle) | All platforms |
| `gx/gfx` | 7 | Element tree construction, window mounting, frame callbacks, tween animations, clipboard, context menu | Requires a window backend |
| `gx/view` | 2 | Multi-branch conditionals (`Switch` / `Match`) | All platforms |
| `gx/router` | 7 | Routing: route table / param matching / guards / history stack / lazy loading / multi-window scopes | All platforms |
| `gx/screen` | 17 | Display enumeration, window geometry, fold posture and hinge | Enumeration needs a backend; posture is reported |
| `gx/dialog` | 3 | Native system dialogs | Native on Windows only |
| `gx/storage` | 7 | App-level key-value persistence | All platforms |
| `gx/dev` | 1 | Development-time read-only snapshot (frames / caches / tree / warnings) | All platforms |
| `gx/device` | 24 | Device info, battery, network, vibration, screen brightness & keep-awake, opening system settings | Some require a host |
| `gx/app` | 14 | Foreground/background state, memory warnings, back button, sharing, exit, screen orientation | Requires a host |
| `gx/geo` | 10 | Location (one-shot / continuous watch), distance between two points | Requires a host; desktop reports unavailable |
| `gx/media` | 8 | Take photos, pick images / videos, save images, preview | Requires a host; desktop reports unsupported |
| `gx/permission` | 10 | Permission queries / requests / open app settings | Requires a host |
| `gx/viewport` | 21 | Safe areas, soft keyboard, split-screen & multi-window forms, width classes | Reported by the host |

#### Which Import Path to Choose

```js
// App code: one line gets the commonly used batch
import { h, render, createSignal, createRouter, RouterView } from "gox";

// Library code / when you want to express dependencies precisely: use the focused modules
import { h, render } from "gx/gfx";
import { createSignal } from "gx/solid";
```

- `gox` is not a new module, just the union — each name has exactly one implementation (from the focused module it belongs to). Mixing the two styles doesn't create duplicate copies or conflicts (export names are unique across modules).
- The point of the focused modules is readability and layering: at a glance you can tell whether a file depends on UI, reactivity, or storage.
- In headless hosts (builds without the GUI backend linked), things like gx/gfx don't exist; the `gox` union degrades automatically to whatever the host actually provides, without erroring.

### What's Not in gx/* (Where People Look First in Vain) {#m-not-here}

| What you're looking for | Where it actually lives | How to use it |
| --- | --- | --- |
| `model` / `each` / `show` | **Element-level directives** at the `h()` layer | Written on elements, e.g. `<input model={draft} />`, `<view each={rows}>`. **Not imported, and not in any export table** |
| `obs` / `computed` / `ever` / `once` | **Global functions** (GetX style) | Call directly; see [§8](/en/api/gx#reactive-globals) |
| `fs` / `path` / `process` / `http` / `fetch` / `console` | **Global host modules** | Call directly; see [§6](/en/api/host) |
| `alert` / `confirm` / `openFile` | **`gx/dialog`** | `import { alert } from "gx/dialog"`. **Note: they are not in `gx/gfx`** — grabbing them from `gx/gfx` yields `undefined` |
| `createSignal` family | `gx/solid` | See [gx/solid](/en/api/gx#m-solid) |
| `<window>` / `<column>` and other elements | JSX intrinsic tags, parsed by `gx/gfx`'s `h` | See the [component reference](/en/components/) |

::: warning The three most commonly misremembered facts
**①** `alert` / `confirm` / `openFile` live only in `gx/dialog`; `gx/gfx.alert` is `undefined`.<br> **②** `gx/view` **exports only `Switch` and `Match`** — lists and visibility are the element-level directives `each` / `show`, not in this module.<br> **③** `useXxx` on `gx/screen` **returns a getter function that must be called again**: `const r = usePosture(); r()`. See the gx/screen section below.
:::

### gx/solid — Reactive Primitives {#m-solid}

```js
import {
  createSignal, createEffect, createMemo, createResource,
  onMount, onCleanup, untrack, devStats,
} from "gx/solid";
```

| Export | Signature / Returns | Description |
| --- | --- | --- |
| createSignal | (initial) => [get, set] | Creates a signal. `get()` reads the value **and registers a dependency**; `set(v)` or `set(prev => v)` writes it. If the old and new values are `===` equal, subscribers are not notified |
| createEffect | (fn) => dispose | **Runs `fn` immediately once**; getters read during that run become dependencies. Re-runs when dependencies change, **re-collecting dependencies each round** (dependencies no longer referenced in the previous round are unsubscribed). The return value is a dispose function |
| createMemo | (fn) => getter | Lazy derived value: a dependency change only marks it dirty; **the recomputation happens on the next read**. Reads of the memo downstream are also recorded as dependencies |
| createResource | (fetcher) => [data, res] | Async resource. See the dedicated table below |
| onMount | (fn) => void | Runs once after the current generation of the subtree mounts |
| onCleanup | (fn) => void | Runs when the current subtree is replaced / destroyed — use it to clear timers and unbind callbacks |
| untrack | (fn) => value | Executes `fn` **without registering dependencies** and returns its result. The router uses it internally to call page components, avoiding "signals read inside a page body becoming dependencies of the router's effect". **Arguments must be captured via closure**: use the getter obtained from the zero-arg call; forwarding wrappers should not pass their own parameters along again |
| devStats | () => object | Development-time stats (signal count / subscription count etc.); also appears in `devSnapshot().solid` |

**The createResource contract** (deliberately different from Solid in a few places, as a public-API commitment):

| Member | Value |
| --- | --- |
| `data()` | `undefined` (never succeeded / pending) \| success value \| the previous value (during refreshing / error) |
| `res.state()` | `"pending"` \| `"ready"` \| `"refreshing"` \| `"error"` |
| `res.error()` | Has a value only in the error state; `undefined` otherwise |
| `res.refetch()` | Refetch (keeps the old value on display, i.e. refreshing) |

- Controls must be written as the second element: const [data, res] = createResource(f). The engine doesn't support object patterns nested in array destructuring, so don't copy Solid's const [data, { refetch }] = ….
- In the error state, `data()` does not throw: it returns the previous value (or undefined if it never succeeded); read the error only from res.error(). This is because v1 has no ErrorBoundary — a thrown error would bubble into arbitrary effects.
- state() / error() are not hung on the data function (in this engine function values carry no properties); both live on res.
- When the fetcher returns a non-Promise (a sync value), it's treated as immediately available; there is no automatic refetch via a source signal — if you need linkage, wire it up manually with createEffect.
- Continuity is guaranteed: each fetch increments a token, and responses with mismatched tokens are dropped (latest-wins), so rapid refetch clicks can't let an old response overwrite newer state.

```js
import { createSignal, createEffect, createMemo, createResource } from "gx/solid";

const [count, setCount] = createSignal(0);
const dispose = createEffect(() => console.log("count is", count()));  // runs once immediately
setCount(5);                       // → count is 5
setCount(v => v + 1);              // the setter also accepts an updater function
dispose();                         // dispose this effect

const doubled = createMemo(() => count() * 2);
setCount(10);
console.log(doubled());            // 20 (lazy: computed on read)

const [user, res] = createResource(async function () {
  const r = await fetch("https://example.com/me");
  return await r.json();
});
// res.state(): "pending" → "ready"
// after a failure data() still returns the previous value; read the error from res.error()
```

::: info Reading a signal and its memo in the same effect ⇒ runs once per round
Such an effect subscribes to the same change through two paths (directly to the signal + via the memo's cell); the engine deduplicates with a "single notification pass": mark the memos on the chain dirty first, then run the effect. Before 2026-09-24 it ran twice per round, with the symptom that "count-based assertions were doubled"; now it runs once, and the memo value read is guaranteed to be fresh.
:::

### gx/gfx — UI and Windows {#m-gfx}

```js
import {
  h, render, requestAnimationFrame,
  clipboardReadText, clipboardWriteText,
  animate, openContextMenu,
} from "gx/gfx";
```

| Export | Signature / Returns | Description |
| --- | --- | --- |
| h | (tag, props, ...children) => node | Creates an element. JSX compiles down to this, so **files using JSX must import it** (even if never called explicitly) |
| render | (vnode, config?) => window handle | Mounts the element tree and opens a window. **Calling it multiple times = multiple windows**. Three forms, see below |
| requestAnimationFrame | (fn) => id | Schedules the callback onto the event loop at ~60fps frame intervals (internally a 16ms timer). Also used to keep the event pump awake (driving caret blinking) |
| clipboardReadText | () => string | **Synchronous** clipboard read; returns an empty string when unreadable, no exception |
| clipboardWriteText | (text) => boolean | **Synchronous** clipboard write; returns false on failure |
| animate | Two forms, returns a cancel function | `animate(node, prop, to, ms)` animates a property of a node to a target value; `animate(from, to, ms, onUpdate, onDone)` gives you the interpolated values yourself. **Declarative transitions go through the `transition` prop, not this function** |
| openContextMenu | (x, y, items) => void | Pops up a context menu in place. This is a **data-driven API, not the `contextMenu` prop** (one JSX element can only have one host) |

#### The Three Forms of render

```js
// ① JSX: window config written on the root element's props (most common)
render(<window title="Counter" width={400} height={300}>...</window>);

// ② Tree built with h(): window config as the second argument
render(h("column", { gap: 10 }, ...), { title: "Slider demo", width: 260, height: 260 });

// ③ No config: defaults to Gox 400x300
render(h("text", null, "hello"));
```

The returned **window handle** provides `close()` / `isClosed()` / `title()` / `setTitle(t)` / `resize(w, h)`; see the [component reference · multi-window](/en/components/modules#multiwindow).

#### The Clipboard Is a Synchronous API

```js
const ok = clipboardWriteText(text());
const s  = clipboardReadText();        // empty string when unreadable
```

The script and windows live on the **same OS thread**, so calling the native API directly is already the correct thread — no `await` needed. When the backend doesn't support it, degradation is silent (write returns `false`, read returns an empty string).

::: warning Native dialogs are not in this module
`alert` / `confirm` / `openFile` are exported by **`gx/dialog`**. Grabbing them from `gx/gfx` yields `undefined`.
:::

### gx/view — Multi-Branch {#m-view}

```js
import { Switch, Match } from "gx/view";
```

| Export | Signature | Description |
| --- | --- | --- |
| Switch | `({fallback?}, ...<Match/>)` | Takes the first branch in declaration order whose `when` is truthy; if none match, uses `fallback` |
| Match | ({when}, ...children) | A single branch; `when` must be a **function**. **Only meaningful inside a Switch** — mounted anywhere else it renders as a line of `[view Match]` text (misuse is visible, not silent) |

::: info Why this module has only two exports
Lists (`each`) and visibility (`show`) are **element-level directives** — written on elements and expanded by `h()`, no import needed. Only "multi-branch" has no corresponding element semantics, so it stayed a component. Usage: see the [component reference · lists and conditionals](/en/components/patterns#view).
:::

### gx/router — Routing {#m-router}

```js
import { createRouter, RouterView, RouterLink, lazy, useRoute, useRouter, useRouteState } from "gx/router";
```

| Export | Description |
| --- | --- |
| `createRouter({routes, initial, backKeys, foldable})` | Creates a router. Route record fields: `path` / `name` / `component` / `children` / `meta` / `redirect` / `props` / `beforeEnter` / `keepAlive` / `dualPane` |
| `<RouterView />` | Mount point for the current route; accepts `loading` / `error` branches and `scope` (an explicit scope, for two independent navigations in one window) |
| `<RouterLink to="…" />` | Navigation link; `to` accepts a path string or `{name, params}` (always resolved as **absolute paths**) |
| `router.push / replace / back / forward / go` | Navigation, all returning a Promise (`{ok, route}`; when blocked by a guard, `{ok:false, reason}`) |
| `useRoute() / useRouter() / useRouteState()` | Inside a page body, get the current route / router / the state bag attached to the history-stack entry |
| `lazy(() => import(…))` | Lazy-load a page module. **Wrapping explicitly is recommended** — without it, component-level guards are missed on first entry |

```js
import { createRouter, RouterView, RouterLink } from "gx/router";

const router = createRouter({
  routes: [
    { path: "/",           name: "home",   component: HomePage },
    { path: "/list",       name: "list",   component: ListPage, keepAlive: true },
    { path: "/detail/:id", name: "detail", component: DetailPage },
    { path: "*",           name: "nf",     component: NotFound },
  ],
  initial: "/",
});

render(
  <window title="app" width={480} height={360}>
    <column gap={8} padding={12}>
      <RouterLink to="/list"><text font={13}>List</text></RouterLink>
      <RouterView />
    </column>
  </window>
);
```

- There is no URL and no history mode: desktop apps have no address bar; "history" is a stack in memory. For deep links, parse process.argv and pass the result to initial.
- No regex path constraints / alias; do parameter validation in beforeEnter.
- State preservation has two tiers: keepAlive: true on a route record preserves the entire subtree (scroll position / focus / drafts), while useRouteState() only stores values. Kept-alive pages stay in memory — only enable it for pages that truly need it.
- Alt+← / Alt+→ are bound by default; the implementation wraps the root node's own onKeyDown (both layers run), and backKeys: false turns it off.
- Multi-window is a **scope**: a window's automatic scope is `win:N`; `<RouterView scope="x">` uses a named scope, in which case the handle can't be matched to it — use `router.sync([wa, "x"])`.
- Full manual: docs/gui-router.md (all createRouter options and the guard table).

### gx/screen — Screens and Fold Posture {#m-screen}

```js
import {
  screens, primaryScreen, screen, screenOf,
  useScreen, useScreens, windowInfo, useWindowInfo,
  posture, usePosture, hinge, regions, platform,
  reportPosture, resetDisplays, onDisplayChange, offDisplayChange,
} from "gx/screen";
```

::: warning Calling convention: useXxx returns a getter function, which must be called again
Things like `screens()` / `posture()` are **direct reads**; while `useScreen()` / `useScreens()` / `usePosture()` / `useWindowInfo()` **return a getter function**, and only calling that getter registers the dependency:

```js
const getPosture = usePosture();      // ← you get a getter
<text>{() => getPosture()}</text>      // when the posture changes, this text updates
```

Design rationale: the display table is a large structure, so making it a whole-table signal isn't worth it; hence the "version number + getter" combination — the getter re-reads the current state and subscribes to the version number on every call, isomorphic to `useRoute()`.
:::

| Export | Signature / Returns | Description |
| --- | --- | --- |
| screens | () => Display[] | All displays |
| primaryScreen | () => Display | The primary display |
| screen | (id) => Display \| null | Get a display by id; returns `null` if not found |
| screenOf | (win?) => Display \| null | The display **the window is on**. Omitting `win` = the most recently mounted window; returns `null` when there is no window |
| useScreen | (win?) => **getter** | The reactive version of `screenOf` |
| useScreens | () => **getter** | The reactive version of `screens()` |
| windowInfo | (win?) => object | Direct read of window size / scale / owning screen; fields below |
| useWindowInfo | (win?) => **getter** | Same, reactive |
| posture | (win?) => string | Fold posture: `"flat"` / `"half-open"` / `"folded"` / `"unknown"` |
| usePosture | (win?) => **getter** | Same, reactive |
| hinge | (win?) => object \| null | Hinge rectangle `{x, y, width, height, orientation}`; `null` when there is no hinge |
| regions | (win?) => array | Fold-segmented panels `[{id, x, y, width, height}]` |
| platform | () => string | Window backend name: `"win32"` / `"x11"` / `"cocoa"` / `"headless"` |
| reportPosture | (opts) => undefined | **Host / simulator reporting** of posture. Takes an opts object and returns `undefined` — a separate path from `posture()` |
| resetDisplays | () => undefined | Clears reported overrides, falling back to backend enumeration |
| onDisplayChange | (fn) => off() | Subscribes to display / posture changes; **the return value is the unsubscribe function** (repeatable), or use `offDisplayChange(fn)` |
| offDisplayChange | (fn) => undefined | Unsubscribe by callback function |

#### Display Object Fields

| Field | Description |
| --- | --- |
| id / name | Display identifier (e.g. `\\.\DISPLAY1`; a reported custom screen uses the name given at report time, e.g. `"fold-0"`) |
| x / y / width / height | Geometry of the whole screen (virtual-desktop coordinates; secondary screens can be negative) |
| workX / workY / workWidth / workHeight | Work area (taskbar excluded) |
| scale | Per-display DPI scaling |
| primary | Whether it's the primary display |
| foldable | Whether it's a foldable device |
| posture | Fold posture string |
| hinge | Hinge rectangle or `null` |
| regions | Array of segmented panels |

#### windowInfo() Fields

```js
// {width, height, scale, screenWidth, screenHeight, workWidth, workHeight, screenId, platform}
const info = windowInfo();
console.log(info.width, info.screenWidth, info.screenId, info.platform);
```

#### reportPosture(opts) Fields

| Field | Description |
| --- | --- |
| display | Target display id. **If omitted, applies to the screen the current window is on** (falling back to the first one) |
| posture | `"flat"` / `"half-open"` / `"folded"`. Case- and whitespace-insensitive; `halfopen` / `half_open` are also accepted; **unrecognized strings are normalized to `"unknown"`** rather than erroring |
| foldable | Whether it's a foldable device. Auto-set to `true` if omitted but a non-`flat` posture was reported |
| width / height | Screen dimensions (for reporting custom screens; omit for existing screens to keep their values) |
| hinge | `{x, y, w, h, orientation}` — **note these are `w` / `h` here** |
| regions | `[{id, x, y, width, height}]` |

::: warning Writes use w/h, reads give width/height
`reportPosture`'s `hinge` reads `w` / `h`, while `hinge()` outputs `width` / `height`. Feeding a read-out object straight back yields a 0-width hinge — the easiest naming inconsistency to trip over.
:::

- Desktop backends have no posture-query API (Windows lacks WinRT ⇒ unreachable with zero cgo), and the framework doesn't guess posture: it only provides the reporting channel; with no reports, posture stays flat.
- The hinge is not cleared when the posture changes: the hinge is device geometry, not a property of the posture. It stays when returning to flat, otherwise the split ratio after "fold and unfold again" would become 0.5. Whether to split is decided by the posture; the hinge only decides "how to split".
- When reporting a screen not in the table: if it's the first report and backend enumeration is empty ⇒ the whole table is replaced (the host defines the display environment); if there have been prior reports or the backend can enumerate ⇒ a display is appended.
- The denominator of the split ratio is the display length, not the hinge length.
- When half-folded, `<RouterView>` automatically becomes two columns (the previous history entry in the left column); see gx/router.

```js
import { reportPosture, resetDisplays, screenOf, posture, hinge, usePosture } from "gx/screen";
import { createMemo } from "gx/solid";

// Host reporting: first ask "which screen is the window on", then report that screen's posture
const wa = render(<window title="A">...</window>);
reportPosture({
  display: screenOf(wa).id,
  foldable: true,
  width: 2000,
  posture: "half-open",
  hinge: { x: 980, y: 0, w: 40, h: 1400, orientation: "vertical" },   // ← w / h
});

console.log(posture(wa));        // "half-open"
console.log(hinge(wa));          // { x:980, y:0, width:40, height:1400, orientation:"vertical" }

// Reactive: useXxx() first gives you a getter, then put it in a function prop / function child
const getPosture = usePosture(wa);
const folded = createMemo(() => getPosture() === "half-open");

resetDisplays();                 // undo the report, back to backend enumeration
```

### gx/dialog — Native System Dialogs {#m-dialog}

```js
import { alert, confirm, openFile } from "gx/dialog";
```

| Export | Returns | Description |
| --- | --- | --- |
| alert(msg, title?) | `Promise<void>` | System message box, with a single "OK" |
| confirm(msg, title?) | `Promise<boolean>` | OK / Cancel, returns the user's choice |
| openFile({title, filter}) | `Promise<string \| null>` | System "open file" dialog; **cancel returns null, no exception** |

`filter` is an array of `{name, pattern}`, with multiple wildcards in a pattern separated by `;`.

```js
import { confirm, openFile } from "gx/dialog";

// Both handler styles work: async function () {} and async () => {}
h("button", {
  onClick: async function () {
    const yes = await confirm("Proceed with the operation?", "Please confirm");
    log("confirm -> " + (yes ? "yes" : "no"));
  }
}, "Confirm");

h("button", {
  onClick: async function () {
    const p = await openFile({
      title: "Pick a file",
      filter: [
        { name: "Text files", pattern: "*.txt;*.md" },
        { name: "All files", pattern: "*.*" }
      ]
    });
    log(p === null ? "cancelled" : "picked " + p);
  }
}, "Open file");
```

- Only these three APIs: no custom buttons, no multi-select, no directory picking.
- The UI still repaints while modal (the OS pumps messages for us), but no JS callbacks are dispatched.
- Non-Windows backends degrade: content is printed to stderr and returns immediately — confirm yields true, openFile yields null (treated as cancelled).
- This module doesn't depend on the element tree, only on "whether there is a current window", which is why it was split out of gx/gfx.

### gx/storage — Local Persistence {#m-storage}

```js
import {
  setAppName, appDataDir, setStorage, getStorage,
  removeStorage, clearStorage, getStorageInfo,
} from "gx/storage";
```

| Export | Returns | Description |
| --- | --- | --- |
| setAppName(name) | void | Sets the app name (a segment of the data directory); **recommended to call before any storage call** |
| appDataDir() | string | Absolute path of the data directory (`UserConfigDir/Gox/<appName>`) |
| setStorage(key, value) | void | Write. value must be plain data (object / array / scalar); **writes go through to disk immediately** |
| getStorage(key) | value | Read back. **Returns `undefined` when missing, and there is no "default value parameter"** — write `?? fallback` yourself for a default |
| removeStorage(key) | void | Delete a key |
| clearStorage() | void | Clear everything |
| getStorageInfo() | {keys, currentSize, limit} | Key list and byte counts; `limit` is always -1 (no quota in v1) |

```js
import { setAppName, setStorage, getStorage, getStorageInfo } from "gx/storage";

setAppName("my-app");              // → %APPDATA%/Gox/my-app (Linux: ~/.config/Gox/my-app)
setStorage("theme", "dark");
setStorage("profile", { name: "gox", level: 3 });   // objects work too, serialized and stored whole

const t = getStorage("theme");         // "dark"; undefined on first run
const theme = t ?? "light";            // ← defaults are your job; getStorage has no second parameter
console.log(getStorageInfo());         // { keys, currentSize, limit }
```

- All synchronous APIs, no Promises — local small-file reads and writes don't need async ceremony.
- A single storage.json file is read and written whole, atomically replaced via a temp file + rename; a corrupted file is treated as empty storage with a warning logged, and the app still starts.
- Storing functions / circular references throws TypeError at write time (rather than silently storing null that can't be read back).
- The GOX_STORAGE_DIR environment variable can replace the root directory wholesale (test isolation / portable deployments).

### gx/dev — Development-Time Snapshot {#m-dev}

```js
import { devSnapshot } from "gx/dev";
const snap = devSnapshot();
```

| Field | Contents |
| --- | --- |
| `snap.frame` | `{count, full, partial, fullRatio}` — frame counts and full / partial frame ratios |
| `snap.imageCache` | `{size, cap, hits, misses, evicts}` |
| `snap.glyphCache` | `{size, cap, hits, misses, evicts}` |
| `snap.tree` | `{windows, nodes, depth}` |
| `snap.solid` | `{effects}` — number of live effects; `-1` when gx/solid isn't registered |
| `snap.warnings` | `[{at, text}]` — recent kernel warnings (including deduplicated warnings for unknown tags and directive misuse) |

- Pull-based: no pushing; a panel polls it itself with setInterval (1s in the example). Don't use `requestAnimationFrame` — it would compete with real rendering for frames.
- One call returns the whole JSON-shaped plain object, built inline on the calling thread (the script thread is the GUI thread).
- Field names are the API; the structure is locked by dedicated test cases, so it's safe to use as a data source.
- Zero cost in production: without an import, this code path doesn't exist (the module is built lazily).
- A runnable debug panel: see the demo script testdata/dev_panel_demo.js.

```js
import { devSnapshot } from "gx/dev";

setInterval(() => {
  const s = devSnapshot();
  console.log(
    "frames:", s.frame.count,
    "full-frame ratio:", Math.round(s.frame.fullRatio * 100) + "%",
    "glyph cache:", s.glyphCache.size + "/" + s.glyphCache.cap,
    "nodes:", s.tree.nodes,
    "effects:", s.solid.effects,
  );
  if (s.warnings.length) console.log("latest warning:", s.warnings[s.warnings.length - 1].text);
}, 1000);
```

### Native Capability Layer — gx/device · gx/app · gx/geo · gx/media · gx/permission · gx/viewport {#m-native}

The six modules (87 exports in total) share **one host contract** — not six mechanisms. There are only three call shapes: **pull** (synchronous reads with return values), **action** (`await`, rejecting on failure), and **report** (host-initiated notification, with `useXxx()` refreshing reactively).

```js
import { deviceInfo, battery, isOnline, canIUse } from "gx/device";
import { getLocation, watchLocation } from "gx/geo";
import { takePhoto } from "gx/media";

console.log(deviceInfo().platform, battery().level, isOnline());   // pull / report

if (canIUse("camera")) {                     // check up front; don't rely on catch
  const photo = await takePhoto({ count: 1 });
}

const stop = watchLocation((loc) => console.log(loc.latitude, loc.longitude));
try {
  await getLocation({ highAccuracy: true });
} catch (e) {
  if (e.errCode === "permission-denied") console.warn(e.message);
}
```

#### No Soft Degradation for Missing Capabilities — Eight Unified Error Codes

| Error code | Meaning |
| --- | --- |
| `unsupported` | The host doesn't implement this capability — `canIUse()` will be `false`; check up front instead of relying on catch |
| `permission-denied` | The user or system denied the permission (you can prompt the user to enable it in settings) |
| `cancelled` | The user actively cancelled in the system UI — **this is not a failure** |
| `timeout` / `busy` / `unavailable` | The host didn't fill in the value / the previous one hasn't finished / the device is currently unavailable (location in airplane mode, no camera hardware) |
| `platform-error` | The native side errored; details are in `errMsg` (don't parse it, only display it) |
| `invalid-arg` | Invalid argument (e.g. a negative `count`) |

- Error objects carry both errCode+errMsg (for logic) and name+message (for printing); they're plain objects (readable as .message when treated as an Error).
- Pull-object names follow the `<capability>.<action>` pattern (e.g. `camera.takePhoto`); the capability ID is the segment before the first dot — it's also what `canIUse` checks against.

#### gx/device — Device Info and System State (24 exports)

```js
import {
  deviceInfo, useDeviceInfo, deviceId,
  battery, useBattery, isCharging, onBatteryChange, offBatteryChange,
  network, useNetwork, isOnline, onNetworkChange, offNetworkChange,
  vibrate, vibrateShort, vibrateLong,
  keepScreenOn, getBrightness, setBrightness, openSystemSettings,
  canIUse, capabilities, reportBattery, reportNetwork,
} from "gx/device";
```

| Export | Description |
| --- | --- |
| deviceInfo() / useDeviceInfo() / deviceId() | Platform / OS / model / device ID / locale / screen etc.; fields the host doesn't override fall back to local defaults |
| battery() / useBattery() / isCharging() | Battery level and charging state. **Report-based** — with no reporter it's an explicit default like `{supported: false}`, not an error |
| network() / useNetwork() / isOnline() | Connection type and online state; also report-based |
| vibrate(ms?) / vibrateShort() / vibrateLong() | Vibration; soft-degraded on desktop (no error) |
| keepScreenOn(on) / getBrightness() / setBrightness(v) | Screen keep-awake toggle, brightness read/write |
| openSystemSettings(kind) | Opens a system settings page; `kind` vocabulary has 11 entries (including `privacy`), 10 of which have URI mappings on desktop |
| canIUse(cap) / capabilities() | Capability checks and inventory. The check order is "host declared it → a matching builtin module exists → a matching native registration exists", so it can lie when declaration and implementation disagree |
| onBatteryChange / onNetworkChange(fn) | Subscribe to changes, returns an unsubscribe function; `offXxx(fn)` also works |
| reportBattery(o) / reportNetwork(o) | **Reporting ports** (host / simulator / tests): on desktop, with no real device, reactive refresh is driven through these |

#### gx/app — App Lifecycle (14 exports)

```js
import {
  appState, useAppState, onAppStateChange, offAppStateChange,
  onMemoryWarning, offMemoryWarning, onBackPress, offBackPress,
  share, exitApp, setOrientation,
  reportAppState, reportMemoryWarning, reportBackPress,
} from "gx/app";
```

- appState() / useAppState(): "active" / "background" / "inactive" (vocabulary normalized).
- onBackPress(fn): the back button. A truthy callback return = handled, and the host decides whether to close the UI accordingly.
- share(opts) / exitApp() / setOrientation(o): sharing, exit, screen orientation (desktop hosts don't implement the last one).
- The three reportXxx are reporting ports; the priority between "script returns a truthy value" and "host reports proactively" for onBackPress is locked by a dedicated test case.

#### gx/geo — Location (10 exports)

```js
import {
  getLocation, watchLocation, clearWatch, clearAllWatches,
  lastLocation, useLastLocation, hasLocation,
  distanceBetween, locationPlatform, reportLocation,
} from "gx/geo";
```

- getLocation(opts) for a one-shot fix; watchLocation(fn) watches continuously and returns a stop function (a host-process-level session; clearAllWatches() clears everything at once).
- lastLocation() / hasLocation() read the most recent fix; distanceBetween(a, b) uses haversine and returns meters.
- On desktop, "no location" is an honest absence: getLocation() reports unavailable rather than fabricating a coordinate.

#### gx/media — Camera and Photo Library (8 exports)

```js
import {
  takePhoto, chooseImage, chooseOneImage, chooseVideo,
  saveImage, previewImage, mediaInfo, humanSize,
} from "gx/media";
```

- takePhoto({count}) / chooseImage({count}) return arrays for multiple items; chooseOneImage() wants just one (returns a single object).
- User cancellation goes through the cancelled error code (not null), which is why it differs from gx/dialog.openFile's cancellation semantics.
- mediaInfo() lists the capabilities available on the current platform; humanSize(bytes) is a pure function (byte count → human-readable string).

#### gx/permission — Permissions (10 exports)

```js
import {
  checkPermission, authorize, requestPermissions, openAppSettings,
  getSetting, permissionState, permissionKinds,
  onPermissionChange, offPermissionChange, reportPermission,
} from "gx/permission";
```

- checkPermission(kind) queries state, authorize(kind) requests one, requestPermissions(kinds) batch-requests, openAppSettings() jumps to the app settings page.
- permissionKinds() gives the platform vocabulary (the permission types the host can report).
- onPermissionChange(fn) subscribes to state changes (triggered when the user returns after enabling something in settings).

#### gx/viewport — Safe Areas / Keyboard / Split-Screen (21 exports)

```js
import {
  viewport, useViewport, insets, useInsets,
  keyboardHeight, useKeyboardHeight, keyboardVisible,
  contentArea, safeAreaStyle,
  widthClass, isCompactWidth, isTabletLayout,
  multiWindow, useMultiWindow, isSplit, splitInfo,
  onViewportChange, offViewportChange, reportViewport, resetViewport,
  viewportModes,
} from "gx/viewport";
```

- Division of labor with `gx/screen`: the latter answers "what is this device like" (displays / posture / hinge), the former answers "how is my window arranged" (safe areas / keyboard / split-screen).
- insets() / keyboardHeight() / splitInfo() all rely on host reports; desktop can't get these values (defaults: all 0 / not split).
- useInsets() / useViewport() likewise return getter functions, which must be called again.
- safeAreaStyle(v, withKeyboard?) directly gives the four-edge values usable for padding; with the second argument true, keyboard height is included in the bottom inset.

#### Behavior on Desktop (Don't Treat It as a Mobile Platform)

- What can genuinely be provided is: battery, network, brightness, screen keep-awake, opening system settings, vibration (soft-degraded).
- What can't is stated plainly: camera / location / photo library / permissions reject with unsupported or unavailable; no fake data is returned.
- When a mobile platform is integrated, it only needs to implement the same host contract (adding a capability = one method name in the kernel + one branch in the host); no kernel changes needed. Semantics and usage: see the GUI development guide §9.6.

### Common Module-Layer Pitfalls Cheat Sheet {#m-pitfalls}

| Symptom | Cause and fix |
| --- | --- |
| Used JSX but the window doesn't start, reporting `h is not defined` | **Fixed in the framework (2026-09-22)**: JSX still compiles down to `h(...)` calls, but when the file has no `h`, the compiler auto-inserts `import { h } from "gx/gfx"`. Writing `import { h, render } from "gx/gfx"` explicitly is still recommended and still takes precedence; your own `h` definition/import won't be overridden. On older engines, just add that line manually |
| `alert is not a function` / getting `undefined` | You grabbed it from `gx/gfx` — `alert` / `confirm` / `openFile` live in **`gx/dialog`** (or use the `gox` aggregate directly). Named imports used to silently yield `undefined` for missing names; **now importing a nonexistent name from a builtin module is a compile-time error**, and it points out which module it's in / whether it's a typo |
| `usePosture()` doesn't give you a string | By design: all `useXxx()` return **getter functions** (signal semantics; put them in a function prop / function child to be reactive), then call again: `const r = usePosture(); r()`. If you only want "the value right now", use `posture(win)` (returns a string). Don't compare it directly as a string — it's always false and silent |
| `each` / `show` can't be imported from `gx/view` | By design: they are **element-level directives** (written as JSX props, expanded in `h()`), **not in any module's export table**; `gx/view` exports only `Switch` / `Match`. Mis-importing is now a compile-time error |
| `const [data, {refetch}] = createResource(f)` doesn't work | **Fixed in the framework (2026-09-22)**: nested destructuring (an object inside array destructuring) used to be a parser bug; now it just works. The equivalent `const [data, res] = createResource(f)` + `res.refetch()` still works |
| Fold two-column mode doesn't kick in | By design: Windows / X11 have no posture-query API, **with no report ⇒ posture is always `flat`** ⇒ no split. Call `reportPosture` on the host side; first troubleshooting step: use `posture(win)` to confirm you're reading `"half-open"`. Three-step diagnosis: see the GUI router manual §9.2 |
| Hinge width reads as 0 | **Fixed in the framework (2026-09-22)**: `hinge()` / `regions()` output uses `width/height`, while `reportPosture` historically only read `w/h` ⇒ silently read as 0 on write-back (affecting only the split ratio, nothing reported). Now **both spellings are accepted** (short names first), and `reportPosture({ hinge: hinge() })` works directly |

::: tip The four items marked "fixed in the framework"
JSX's implicit factory, missing-name imports, nested destructuring, and the hinge key names — all four were fixed in the kernel (parser / compiler / `gx/screen`). With a new engine you no longer need the workarounds in the "fix" column; where other docs or manuals still say "you must import `h` yourself" or "nested destructuring isn't supported", this table is authoritative.
:::

## Reactive Global APIs {#reactive-globals}

Beyond the `gx/solid` signal system, a set of Dart GetX-style reactive primitives is provided globally — **no import needed**.

| API | Signature | Description |
| --- | --- | --- |
| obs | (value) => obsValue | Creates an observable; reads and writes go through `.value` |
| computed | (fn) => obsValue | A computed value derived from other observables; recomputed automatically when dependencies change |
| ever | (obs, fn) | Continuous subscription, a callback on every change; **fires immediately with the current value upon subscribing** |
| once | (obs, fn) | Fires once, only on the next change |

```js
let count = obs(0);
ever(count, v => console.log("count =", v));   // prints count = 0 first

count.value = 1;
count.value = 2;
count.value = 2;    // unchanged value, no notification
```

```text
count = 0
count = 1
count = 2
```

::: tip Choosing Between the Two Reactive Systems
For UI, use `gx/solid`'s `createSignal` — it plugs directly into the render layer's dependency tracking ([component reference · reactivity](/en/components/patterns#reactive)). The `obs` family better suits scripts that are pure data flows, or porting Dart / GetX code while keeping the same style.
:::
