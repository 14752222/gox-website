---
title: Tutorials
description: "Gox tutorials: installation and the gox create scaffold, REPL and CLI, ES6+ language basics and boundaries, ES modules, async, fs/http/fetch host APIs, reactive programming, GUI desktop apps, routing, and packaging into standalone executables. All examples are verified by actually running them."
---

# Tutorials

From installation to packaging a script into a standalone executable takes about ten minutes. Every example has been verified by actually running it.

All three entry points install **the same binary**: npm install (with prebuilt binaries for 5 platforms bundled, no Go environment needed), the `gox create` scaffold, or building from source with `go build`. There are two command names, `gox` and `goxjs` (aliases of each other); a source build produces `Gox`.

::: tip Quick Navigation
Just want to get it running → [Installation and Creating a Project](/en/guide/install); want to build UIs → [GUI Desktop Apps](/en/guide/gui); want to embed it in a Go program or learn how the runtime works → [API Reference](/en/api/).
:::

## Contents

| # | Section | What's covered |
| --- | --- | --- |
| 1 | [Installation and Creating a Project](/en/guide/install) | npm install, the `gox create` scaffold, building from source |
| 2 | [REPL and CLI](/en/guide/repl) | Interactive environment, command cheat sheet, script echo semantics |
| 3 | [Language Basics and Boundaries](/en/guide/language) | ES6+ subset, what's not supported (import as / Date) |
| 4 | [ES Modules](/en/guide/modules) | import/export, dynamic import(), no CommonJS |
| 5 | [Async and the Event Loop](/en/guide/async) | async/await, timer family, exit semantics |
| 6 | [Built-in Objects at a Glance](/en/guide/builtins) | Global objects like Object/Array/Map/Set/Promise/Temporal |
| 7 | [Files and System](/en/guide/fs) | `fs` / `path` / `process`, both sync and async |
| 8 | [HTTP Requests and Servers](/en/guide/http) | Global `fetch`, serving with `http.createServer` |
| 9 | [Reactive Programming](/en/guide/reactive) | GetX-style `obs` and SolidJS-style `createSignal` |
| 10 | [GUI Desktop Apps](/en/guide/gui) | JSX + gx/gfx + gx/solid, built-in elements, routing, built-in module cheat sheet |
| 11 | [Packaging Standalone Executables](/en/guide/package) | The jsbuild packager, cross-compilation, single-file distribution |
| 12 | [FAQ](/en/guide/faq) | Relationship with Node, macOS support, debugging tips |

Next stop: [Component Reference](/en/components/) — full props and examples for all 41 built-in GUI elements.
