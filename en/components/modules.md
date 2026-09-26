---
title: "GUI Module APIs: gx/gfx · Multi-Window · gx/router · gx/screen"
description: "Gox GUI module APIs: gx/gfx render/clipboard/animations, gx/storage persistence, multi-window handles, gx/router routing (guards/history stack/lazy loading), gx/screen displays and fold posture, gx/dev snapshots."
---

# GUI Module APIs: gx/gfx · Multi-Window · gx/router · gx/screen

## gx/gfx Module Functions {#api-gfx}

`Stable`

Besides component tags, `gx/gfx` also exports these functions.

| Export | Signature | Description |
| --- | --- | --- |
| h | (tag, props, ...children) | Creates an element. JSX compiles down to it, so you must import it |
| render | (vnode, config?) | Mounts a window and **returns a window handle**. Three forms, see below |
| requestAnimationFrame | (fn) | A 16ms timer implementation; also keeps the event pump awake (drives cursor blinking) |
| clipboardReadText | () => string | **Synchronous** clipboard read; returns an empty string when nothing is available, never throws |
| clipboardWriteText | (text) => boolean | **Synchronous** clipboard write; returns false on failure |
| animate | See [Transition animations](/en/components/patterns#animation) | Imperative tweening |
| openContextMenu | (x, y, items) | Pops up a context menu |

### The three forms of render

```js
// ① JSX: window config goes on the root element's props (most common)
render(<window title="Counter" width={400} height={300}>...</window>);

// ② Hand-built tree with h(): window config as the second argument
render(h("column", { gap: 10 }, ...), { title: "Slider demo", width: 260, height: 260 });

// ③ Config omitted: defaults to Gox 400x300
render(h("text", null, "hello"));
```

### Clipboard (synchronous API)

```js
import { clipboardReadText, clipboardWriteText } from "gx/gfx";

const ok = clipboardWriteText(text());
const s  = clipboardReadText();        // Empty string if nothing is available
```

Both are **synchronous** — the script and the window share the same OS thread, so calling the native API directly is already the right thread; no `await` needed. When the backend doesn't support it, it degrades silently (write returns false, read returns an empty string) without throwing.

## gx/storage Local Persistence {#api-storage}

`Stable`

Application-level kv storage: values are JSON-serialized to disk in the user config directory and survive the next launch.

| API | Returns | Description |
| --- | --- | --- |
| setAppName(name) | void | Sets the app name (a segment of the data directory); **recommended to call before any storage call** |
| appDataDir() | string | Absolute path of the data directory (`UserConfigDir/Gox/<appName>`) |
| setStorage(key, value) | void | Writes. value must be plain data (object/array/scalar); **a write-through persists to disk immediately** |
| getStorage(key) | value | Reads back. Returns `undefined` if missing, never throws |
| removeStorage(key) / clearStorage() | void | Deletes one key / clears everything |
| getStorageInfo() | {keys, currentSize, limit} | Key list and byte sizes; `limit` is always -1 (no quota in v1) |

```js
import { setAppName, setStorage, getStorage } from "gx/storage";

setAppName("my-app");              // → %APPDATA%/Gox/my-app (Linux: ~/.config/Gox/my-app)
setStorage("theme", "dark");
setStorage("profile", { name: "gox", level: 3 });   // Objects work too; serialized and stored whole
const t = getStorage("theme");     // "dark"; undefined on first run
if (t === undefined) setStorage("theme", "light");
```

- All synchronous APIs, no Promises — local small-file reads and writes don't need async ceremony.
- A single storage.json file is read and written whole; atomic replacement via a temp file + rename. A corrupted file is treated as empty storage with a warning, and the app still starts.
- Storing functions / circular references throws a TypeError at write time (rather than silently storing null that can't be read back).
- The GOX_STORAGE_DIR environment variable can replace the root directory wholesale (test isolation / portable deployment).

## Multi-Window {#multiwindow}

`Stable`

`render()` can be called multiple times; each call opens an independent window and returns a handle for closing and runtime control (title / size).

| Handle method | Description |
| --- | --- |
| close() | Closes the window. Internally posted back to the GUI thread via `Post`, **accepted asynchronously** — by the time it returns, the window may not actually be closed yet |
| isClosed() | Queries whether it's closed |
| title() / setTitle(t) | Reads / changes the window title. It's a **method**, not a property — property values are snapshotted at construction and would forever return the old title. When the backend doesn't support changing titles, only the handle's internal record is updated (`title()` still reads it back), with no error |
| resize(w, h) | Changes the **client area** size (same units as `<window>`'s `width`/`height`). On supporting backends it also triggers `onResize` (useWindowSize breakpoint layouts switch automatically); missing / non-numeric arguments throw `TypeError`, and values ≤ 0 are silently rejected |

```js
const makeCounter = (title) => {
  const [n, setN] = createSignal(0);
  let self = null;

  self = render(
    <window title={`Multi-window ${title}`} width={380} height={340}>
      <column gap={12} padding={16}>
        <text font={22}>{() => `${title} count = ${n()}`}</text>
        <button onClick={() => setN(n() + 1)}>+1</button>
        <button onClick={() => self.setTitle(`${title} count = ${n()}`)}>Rename</button>
        <button onClick={() => self.resize(520, 400)}>Resize 520x400</button>
        <button onClick={() => self.close()}>Close this window</button>
      </column>
    </window>
  );
  return self;
};

const a = makeCounter("A");   // The two windows have independent element trees, focus, and shortcut tables
const b = makeCounter("B");
```

- Closing one window leaves the others fully responsive; the process exits only when all windows are closed.
- Nodes are not shared between windows. To sync state, share the same createSignal (create it at the top level of the script); don't expect props to wire things up automatically.
- Each window is an independent app instance: hover chains, pressed states, keyboard focus, shortcut tables, and overlay state don't interfere with each other.
- After the "most recently mounted window" is closed, APIs with no node context — clipboard / native dialogs and the like — automatically retarget to a surviving window.
- Title / size changes are verified on win32; the X11 backend is implemented but not verified on real hardware. No window position control, no modal child windows.

## gx/router Routing {#router}

The router is a **built-in module** (landed on 2026-09-21, with zero changes to the rendering kernel): the route table, parameter matching, three-level guards, history stack, lazy loading, and multi-window scoping all live in the module, while page switching still uses the kernel's existing "function children + keep-alive branch". For the full manual see [docs/gui-router.md](https://github.com/14752222/Gox/blob/main/docs/gui-router.md).

| View / function | Description |
| --- | --- |
| `createRouter({routes, initial, backKeys, foldable})` | Creates a router. Route record fields: `path` / `name` / `component` / `children` / `meta` / `redirect` / `props` / `beforeEnter` / `keepAlive` / `dualPane` |
| `<RouterView />` | The mount point for the current route; accepts `loading` / `error` branches and `scope` (an explicit scope for two independent navigation stacks in one window) |
| `<RouterLink to="…" />` | Navigation link; `to` takes a path string or `{name, params}` |
| `router.push / replace / back / forward / go` | Navigation, all returning a Promise (`{ok, route}`; `{ok:false, reason}` when blocked by a guard) |
| `useRoute() / useRouter() / useRouteState()` | Inside a page body, gets the current route / router / the state bag attached to the history stack entry |
| `lazy(() => import(…))` | Lazily loads a page module. **Wrapping explicitly is recommended** — without it, the first entry doesn't get component-level guards |

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

- There is no URL and no history mode: desktop apps have no address bar, and "history" is just an in-memory stack; deep-links are parsed from process.argv and passed to initial.
- `to` is always resolved as an absolute path ("./sub" is not supported); regex path constraints / aliases are not implemented — do parameter validation in beforeEnter.
- State preservation comes in two tiers: `keepAlive: true` on a route record preserves the whole subtree (scroll position / focus / drafts), while useRouteState() only stores values. Keep-alive pages stay in memory, so enable it only for pages that truly need it.
- Alt+← / Alt+→ are bound by default; the implementation wraps the root node's own onKeyDown (both layers run; it's not an override), and `backKeys: false` turns it off.
- Multi-screen and folding (companion module gx/screen): Windows / X11 have no posture query API and the framework doesn't guess — it only provides a reportPosture() reporting channel; with nothing reported, the posture is always flat. When half-folded, RouterView automatically switches to two panes (the left pane shows the previous history entry).
- For small utilities with 3 pages or fewer and no need for guards or a history stack, the userland pattern of "one signal + a page table" is simpler — see the userland pattern manual §1.

## gx/screen Displays & Folding {#api-screen}

`Stable` · `Window ownership: provided by the backend`

The monitor list, the screen a window is on, and the posture and hinge of foldable (hinge) devices. The information comes in **two layers**: **geometry and window ownership are reported by the backend** (the semantics of `MonitorFromWindow` differ from "compute area overlap from coordinates", and negative-coordinate secondary displays are error-prone, so the determination stays in the backend); **fold posture is reported by the host via `reportPosture()`** — Windows / X11 have no posture query API, the framework doesn't guess, and with nothing reported the posture is always flat.

| Export | Signature / return | Description |
| --- | --- | --- |
| screens() | Display[] | All monitors; fields below |
| primaryScreen() | Display | The primary monitor |
| screen(id) | Display \| null | Gets a screen by id |
| screenOf(win?) | Display \| null | The monitor the window is on; omitting the argument = the most recently mounted window (`null` when there are no windows) |
| useScreen(win?) / useScreens() | **getter** | The reactive versions. **They return getters — call them again**: `const f = useScreens(); f()` |
| windowInfo(win?) / useWindowInfo(win?) | object / **getter** | Window size and its screen: `{width, height, scale, screenWidth, screenHeight, workWidth, workHeight, screenId, platform}` |
| posture(win?) / usePosture(win?) | string / **getter** | Fold posture: `"flat"` / `"half-open"` / `"folded"` / `"unknown"` |
| hinge(win?) / regions(win?) | object \| null / array | The hinge `{x, y, width, height, orientation}` and segmented panels `[{id, x, y, width, height}]`. **The hinge is device geometry and is not cleared by posture** — folding flat and back doesn't turn the ratio into 0.5 |
| platform() | string | `"win32"` / `"x11"` / `"cocoa"` / `"headless"` |
| reportPosture(opts) | undefined | Host-reported posture. Fields: `{display?, posture?, foldable?, width?, height?, hinge?{x, y, w, h, orientation}, regions?}` |
| resetDisplays() | undefined | Clears reported overrides and falls back to backend enumeration |
| onDisplayChange(fn) | off() | Subscribes to monitor / posture changes; **the return value is the dispose function** (or use `offDisplayChange(fn)`) |

::: warning The two easiest pitfalls
**① `useXxx` returns a getter**, not the value itself — writing `usePosture() === "half-open"` is always `false` (comparing a function to a string). Do `const getPosture = usePosture()` first.<br> **② The hinge is written with `w` / `h` but read back as `width` / `height`** — feeding `hinge()`'s result directly back into `reportPosture` produces a zero-width hinge.
:::

```js
import { usePosture, hinge, screens, reportPosture, screenOf } from "gx/screen";
import { createMemo } from "gx/solid";

// usePosture() first gets the getter; only then does a function prop / function child recompute with the posture
const getPosture = usePosture();
const folded = createMemo(() => getPosture() === "half-open");

<text>{() => `${screens().length} screens`}</text>
<text>{() => `hinge: ${hinge() ? "yes" : "no"}`}</text>
<text show={folded}>Half-folded: two panes</text>

// Host report — desktop has no posture query API; this is the only way to tell the kernel
reportPosture({
  display: screenOf().id,
  posture: "half-open",
  hinge: { x: 980, y: 0, w: 40, h: 1400, orientation: "vertical" },
});
```

- When half-folded, RouterView automatically switches to two panes (the left pane shows the previous history entry); the denominator of the split ratio is the monitor length, not the hinge length.
- Posture can only be reported, never queried; on desktop backends it is always flat. Mobile hosts may need extra mappings based on Android's posture vocabulary.
- Display change notifications depend on the backend: WM_DISPLAYCHANGE / WM_DPICHANGED are currently delivered by the win32 backend.

## gx/dev Development-Time Snapshot {#api-dev}

`Stable` · `Development-time`

`devSnapshot()` fetches the runtime's internal state in one shot for building debug panels: frame statistics, image and glyph cache usage, the current node tree, live effects, and recent warnings (including [unknown tag](/en/components/) warnings and deduplicated warnings for directive misuse).

| Field | Content |
| --- | --- |
| `snap.frame` | `{count, full, partial, fullRatio}` — frame count and full / partial frame ratios |
| `snap.imageCache` | `{size, cap, hits, misses, evicts}` |
| `snap.glyphCache` | `{size, cap, hits, misses, evicts}` (glyph cache) |
| `snap.tree` | `{windows, nodes, depth}` |
| `snap.solid` | `{effects}` — number of live effects; `-1` when gx/solid is not registered |
| `snap.warnings` | `[{at, text}]` — the most recent kernel warnings |

```js
import { devSnapshot } from "gx/dev";

// Pull-based: the panel reads on its own interval; nothing is pushed. Don't use requestAnimationFrame (it competes with rendering for frames)
setInterval(() => {
  const s = devSnapshot();
  console.log("frames:", s.frame.count, "full-frame ratio:", Math.round(s.frame.fullRatio * 100) + "%");
  console.log("glyph cache:", s.glyphCache.size + "/" + s.glyphCache.cap, "nodes:", s.tree.nodes);
  if (s.warnings.length) console.log("latest warning:", s.warnings[s.warnings.length - 1].text);
}, 1000);
```

Three key points: **the field names are the API** (the structure is locked by dedicated test cases, so it's safe to use as a data source), **a single call returns the whole thing as a plain JSON-shaped object**, and **without importing it, it's a zero-cost dead code path**. A working debug panel is in the demo script `testdata/dev_panel_demo.js`.
