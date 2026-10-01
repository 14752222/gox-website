---
title: Differences from Node.js / Browsers, and Missing APIs
description: "A list of differences between Gox and Node.js/browsers: no Date/Intl/DOM/npm ecosystem, a missing-API cheat sheet (Date, encodeURI, structuredClone, require, etc.) for migration troubleshooting."
---

# Differences from Node.js / Browsers, and Missing APIs

## Differences from Node / Browsers {#diff}

Gox is an independent runtime **implemented from scratch**, not a subset of Node or the browser. The differences below are deliberate design trade-offs.

### Language Level

| Item | Gox behavior |
| --- | --- |
| `var` | **Supported** (since 0.8.0): function scope plus hoisting. Day-to-day code should still prefer `let` / `const` |
| `import { x as y }` | **Supported**. `x` is the module’s export name, `y` is the local binding. Namespace imports (`import * as ns`) and default exports work as usual |
| `Date` | **None**. Use `Temporal` |
| `Intl` | **None**. Number and date formatting you write yourself |
| `encodeURI` / `decodeURI` | **None**. Assemble one yourself with `String` methods when needed |
| `btoa` / `atob` | **None**. Use `ArrayBuffer` / TypedArray or `fs.readBytesSync` for binary |

### Compared with Node.js

| Item | Description |
| --- | --- |
| npm ecosystem | Not compatible. No `require`, no `node_modules` resolution, no native C++ addons |
| Module system | ES modules only (`import` / `export`); no CommonJS |
| Host module surface | Only `fs` / `path` / `process` / `http` / `fetch`. No `stream` / `child_process` / `os` / `crypto` / `net` |
| `process` | Only `argv` / `env` / `platform` / `pid` / `cwd` / `chdir` / `exit` |
| Event loop | Single-threaded VM with callbacks captured on Go goroutines and re-posted back; semantics are close, but `process.nextTick` / `setImmediate` are not exposed |

### Compared with Browsers

| Item | Description |
| --- | --- |
| DOM | **No** `document` / `window` / CSS. UIs use the homegrown `gx/gfx` element tree |
| Web APIs | No `localStorage` / `XMLHttpRequest` / `WebSocket` / `Worker` / `Canvas2D` / `WebGL` |
| Persistence | Use `gx/storage` (writes to the system app-data directory) instead of `localStorage` |
| Networking | The `fetch` API looks familiar but only implements the two read methods `text()` / `json()` |
| Drawing | `<canvas>` offers 7 drawing primitives (rects / circles / lines / text); no paths, transforms, or gradient textures |
| `requestAnimationFrame` | Provided by `gx/gfx` (implemented as a 16ms timer), not a global function |

### Platform Capability Differences

| Capability | Windows | Linux (X11) | macOS |
| --- | --- | --- | --- |
| CLI scripts | ✅ | ✅ | ✅ |
| GUI windows | ✅ | ✅ (needs on-device verification) | ✅ (cocoa, since 0.6.0) |
| IME input | ✅ | ❌ | ✅ |
| Clipboard | ✅ | ❌ degraded (reads empty string / writes false) | ✅ (NSPasteboard) |
| Native dialogs | ✅ | ❌ degraded (`confirm` returns true, `openFile` returns null) | ✅ (alert / confirm / openFile / saveFile) |
| Display enumeration / window-to-screen mapping | ✅ | Not verified on device | ✅ |
| Fold posture | Reported via `reportPosture` | Reported | Reported (no foldable hardware on macOS) |

## Missing APIs Cheat Sheet {#cheatsheet-miss}

Handy for quick checks when migrating from another runtime — the names below **do not exist** in Gox; calling them yields a `ReferenceError`.

| Category | Missing members |
| --- | --- |
| Date & time | `Date`, `Intl` |
| Encoding | `encodeURI`, `decodeURI`, `encodeURIComponent`, `decodeURIComponent`, `btoa`, `atob`, `TextEncoder`, `TextDecoder` |
| Structured data | `structuredClone`, `FormData`, `URL`, `URLSearchParams`, `Blob`, `File` |
| Networking | `XMLHttpRequest`, `WebSocket`, `EventSource`, `Request`, `Response` (constructors) |
| Concurrency | `Worker`, `SharedArrayBuffer`, `Atomics` |
| Host objects | `document`, `window`, `navigator`, `localStorage`, `sessionStorage`, `location` |
| Node-specific | `require`, `module`, `exports`, `__dirname`, `Buffer`, `process.nextTick`, `setImmediate`, `queueMicrotask` |
| Node modules | `stream`, `child_process`, `os`, `crypto`, `net`, `events`, `util`, `url`, `querystring` |
| Reactive (import required) | `batch`, `createContext`, `useContext`, `createStore` (`untrack` exists — it's in `gx/solid`) |
| Builtin modules | `gx/machine`, `gx/kit` (the state machine is still a userland pattern; the six native-capability modules `gx/device` / `gx/app` / `gx/geo` / `gx/media` / `gx/permission` / `gx/viewport` landed on 2026-09-21, and `gx/router` / `gx/screen` landed in the same batch — none of these are gaps anymore) |
| Missing from modules | `gx/gfx.alert`, `gx/gfx.confirm`, `gx/gfx.openFile`, `gx/gfx.saveFile`, `gx/view.each`, `gx/view.show` (the former live in `gx/dialog`, the latter are element-level directives) |

::: tip Want to check whether an API actually exists?
The most direct way is to ask the REPL: `typeof someName` — `"undefined"` means no. To list all exports of a module, use a namespace import + `Object.keys`: `import * as s from "gx/solid"; Object.keys(s)`. For full implementation-level details, see the [JavaScript Runtime API implementation tutorial](https://github.com/14752222/Gox/blob/main/docs/js-runtime-api-tutorial.md).
:::
