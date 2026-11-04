---
title: GUI Debugging Tools
description: Debug GUI apps with Gox DevTools — interactive element tree, node props inspection, console filtering, a stateful REPL and perf snapshots, built on the read-only gx/dev data plane.
---

# GUI Debugging Tools (Gox DevTools)

`apps/devtools/` is an **interactive Inspector panel** for GUI development, built on the read-only `gx/dev` data plane (`devSnapshot` / `devTree` / `devNode` / `devProps` / `devLogs` / `devEval`) — the core DevTools workflow you know from browsers.

## Launch

```bash
GOX_DEV=1 gox apps/devtools/src/main.js
```

Keep `GOX_DEV=1` on: kernel diagnostics (e.g. writing `{sig}` instead of `{sig()}` in JSX children — an error that fails *silently*) surface in `devSnapshot().warnings` and the console retention buffer. Production builds behave identically.

## Panels

| Panel | Capability |
| --- | --- |
| **Element tree** | Native `<tree>` component: expand/collapse, click to select, multi-window switcher; bounded (depth 8 / 800 nodes) with truncation markers |
| **Node detail** | Selected node queried by stable `path` (e.g. `"0/2/1"`) via `devNode` / `devProps`: layout box (x/y/w/h), `role`, `focusable`, full props |
| **Console** | `devLogs` retention filtered by level (all / log / info / warn / error), latest 100 |
| **REPL** | `devEval` **keeps state across calls**: `let a = 1` then `a + 1` → `2`; 100-entry history, colorized results/errors |
| **Perf summary** | One line from `devSnapshot`: frame counts, full-frame ratio, img / glyph cache hit rates, node stats, `gx/solid` effects, kernel warnings |

Refresh is a 500ms pull-based poll (`setInterval`), pausable with manual refresh. The panel is an **observer** and never participates in the frame budget — `requestAnimationFrame` is deliberately not used.

## Debugging your own app

The panel is just a regular script component. Mount it beside your own UI:

```js
import { App } from "apps/devtools/src/app.js";   // a plain column component

render(
  <window title="Your app" width={1280} height={800}>
    <row>
      {/* your app UI */}
      <App />
    </row>
  </window>
);
```

Whether the REPL can see **your app's variables** depends on host wiring: if the host called `gfx.SetDevEnv(vm.Globals())` before entering the event loop, `devEval` runs in the real app environment; otherwise it falls back to an isolated sandbox. See `docs/devtools.md` in the repo.

## Read-only boundaries (current limits)

- `gx/dev` is a **read-only** data plane: the panel cannot mutate props and there is no on-screen highlight overlay yet — use the layout box coordinates to locate nodes.
- Console retention is a fixed 500-entry kernel ring buffer; the panel can filter but not clear it.
- Tree data is bounded (depth 8 / 800 nodes); oversized subtrees are marked with `…`.
