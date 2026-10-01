---
title: "API Reference: Runtime and Global Scope"
description: "Gox runtime and global scope: single-threaded VM execution model, four ways to run code, the module system and builtin module namespaces, globalThis behavior, plus a global environment cheat sheet."
---

# API Reference: Runtime and Global Scope

## Runtime and Global Scope {#runtime}

Gox is a **single-threaded** bytecode virtual machine. A script goes from lexing all the way to stack-frame execution and **never** migrates between threads — network callbacks captured on Go goroutines are rescheduled back onto this single script thread. Your JS code is always single-threaded; no locks needed.

### Four Ways to Run Code

| Mode | Command | Notes |
| --- | --- | --- |
| REPL | `gox` | Interactive; `:help` / `:clear` / `:exit` |
| Run a script | `gox app.js` | Echoes the value of the last top-level expression, then waits for all timers and async callbacks to finish before exiting |
| Create a project | `gox create my-app` | Scaffolding: lays out a ready-to-run GUI project (`new` / `init` are synonyms; requires 0.4.0+) |
| Pack into a single file | `go run ./packager app.js -o app.exe` | Bundles the runtime and the script into a standalone executable |

`goxjs` and `gox` are two command names for the same binary; a source build produces `gox` / `gox.exe`. Subcommand detection is "does this argument look like a script path" (based on extension and path separators), so `gox help.js` still **runs the script** rather than the `help` subcommand.

### What's in the Global Scope

Host capabilities (`fs` / `path` / `process` / `http` / `fetch` / `console`) and standard builtin objects are **all attached directly to the global scope** — **no import needed**. Only the `gx/*` family (UI and platform capabilities) requires explicit imports:

```js
// Host capabilities: use directly, no import
let cfg = fs.readFileSync("app.json", "utf-8");
console.log(process.platform, path.join("a", "b"));

// UI capabilities: must import (builtin modules take precedence over filesystem resolution)
import { createSignal } from "gx/solid";
import { h, render } from "gx/gfx";
```

### Module System

`import` / `export` are static; relative paths resolve against the **current file**. Default exports, namespace imports, and dynamic `import()` are all supported. Names starting with `gx/` and `gox` are reserved builtin module namespaces: they only consult the builtin module table, and an unknown name raises an error listing the available modules — a typo won't turn into a file-read error, and a same-named file can never shadow a builtin module.

```js
import sq, { PI } from "./math_utils.js";       // default + named exports
import * as math from "./math_utils.js";        // namespace import
import { PI as P, area as squareArea } from "./math_utils.js"; // aliased imports
import { h, render, createSignal } from "gox";  // aggregate entry: union of all gx/* exports
import("./math_utils.js").then(m => m.PI);      // dynamic import
```

::: tip Import alias `as`
`import { PI as P } from "…"` is supported (the name before `as` is the **module's export name**, the name after is the **local binding**). For builtin modules the compiler checks the name *before* `as` against the export table — a missing name fails at compile time with the list of available exports.
:::

### globalThis

`globalThis` points to the global object itself. You can read and write custom properties on it, and access builtins via static property names:

```js
let n = 0;              // visible in global scope, but not globalThis.n
globalThis.n = 0;       // explicitly attached to the global object
console.log(globalThis.Math === Math);   // true
```

::: warning globalThis does not support dynamic key access and is not enumerable
`globalThis.Uint8Array` (dot syntax) works, but `globalThis["Uint8Array"]` or `globalThis[k]` (bracket / variable keys) **returns `undefined`**; `Object.keys(globalThis)` is always an empty array. `"fs" in globalThis`, however, is `true`. So "reflectively probing which APIs exist on the global" doesn't work in Gox — just write the name with dot syntax.
:::

::: info The last line of a script is echoed
When running a script from the command line, the runtime prints **the value of the last top-level expression** (unless it's `undefined`). To suppress it, end with `void 0;` — that's how the multi-window demo scripts wrap up. Also, **if the last statement is an `import`, the module object is printed as the echo value**, so put imports at the top of the file.
:::

## Global Cheat Sheet {#cheatsheet}

One table covering the whole global environment. Capabilities marked Windows-only degrade safely on other platforms.

| Category | Members |
| --- | --- |
| Fundamentals | `Object` `Array` `String` `Number` `Boolean` `Function` `Symbol` `BigInt` `globalThis` |
| Collections | `Map` `Set` `WeakMap` `WeakSet` `WeakRef` `FinalizationRegistry` `Iterator` |
| Numbers / Math | `Math` `parseInt` `parseFloat` `isNaN` `isFinite` `NaN` `Infinity` |
| Text / Data | `JSON` `RegExp` |
| Async | `Promise`, plus `async` / `await` syntax |
| Binary | `ArrayBuffer` `DataView`, the full TypedArray family (`Uint8Array` etc.) |
| Metaprogramming | `Proxy` `Reflect` `eval` |
| Errors | `Error` `TypeError` `RangeError` `ReferenceError` `SyntaxError` `AggregateError` |
| Date & time | `Temporal` (**no `Date`**) |
| Timers | `setTimeout` `setInterval` `clearTimeout` `clearInterval` `requestIdleCallback` `cancelIdleCallback` `delay`, plus the strict timer family |
| Host (no import) | `console` `fs` `path` `process` `http` `fetch` |
| Reactive (global functions) | `obs` `computed` `ever` `once` |
| Builtin modules (import required) | `gx/solid` `gx/gfx` `gx/view` `gx/router` `gx/screen` `gx/dialog` `gx/storage` `gx/dev` `gx/device` `gx/app` `gx/geo` `gx/media` `gx/permission` `gx/viewport`, plus the aggregate entry `gox` |
| CLI subcommands | `create` / `new` / `init` (scaffolding), `version`, `help` |
| Keyword literals | `undefined` `NaN` `Infinity` |
