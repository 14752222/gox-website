---
layout: home
titleTemplate: false
title: Gox — A JavaScript Runtime Built from Scratch in Go
description: "Gox is a JavaScript runtime implemented from scratch in Go: a complete pipeline with its own lexer / parser / bytecode VM, a single binary with zero cgo and zero external dependencies, a built-in software-rasterized GUI rendering layer, support for ES6+ and JSX, and the ability to bundle scripts into standalone executables."
hero:
  name: Gox
  text: A JavaScript Runtime Built from Scratch in Go
  tagline: A complete lexer → parser → bytecode VM pipeline built from the ground up. Single binary, zero cgo, zero external dependencies, with a built-in software-rasterized GUI rendering layer — and your finished JS can be packaged into a standalone executable for direct distribution.
  actions:
    - theme: brand
      text: Get Started in 10 Minutes →
      link: /en/guide/
    - theme: alt
      text: Component Reference
      link: /en/components/
    - theme: alt
      text: API Reference
      link: /en/api/
    - theme: alt
      text: GitHub Source
      link: https://github.com/14752222/Gox
  image:
    src: /logo.png
    alt: Gox — a JavaScript runtime built from scratch in Go
features:
  - icon: ⚙️
    title: Complete Compilation Pipeline
    details: In-house lexer / parser / compiler / bytecode VM with 109 opcodes and fixed 3-byte instruction encoding. Not a V8 binding, not JS-to-Go — every layer can be read and tested on its own.
    link: /en/api/
    linkText: See the runtime model
  - icon: ✨
    title: ES6+ Subset + JSX
    details: Closures, class, async/await, destructuring, template literals, optional chaining, nullish coalescing, ES modules; JSX is lowered to h() calls at compile time, with Temporal replacing Date.
    link: /en/guide/language
    linkText: Language basics
  - icon: 🖥️
    title: In-House GUI Rendering Layer
    details: Pure Go software rasterization, flex-style layout + JSX + signal-driven updates, dirty-rectangle partial redraw; window backends for win32 / X11 / cocoa across three platforms, with 44 built-in elements.
    link: /en/components/
    linkText: Component reference
  - icon: 🔌
    title: Host Capability Modules
    details: Node-style fs (sync + async), http client and server, global fetch, path, process — all attached to the global scope, usable without import.
    link: /en/api/host
    linkText: Host APIs
  - icon: 🧭
    title: Routing and Screen Adaptation
    details: gx/router provides route tables, :param matching, three-level guards, history stack, lazy loading, and multi-window scoping; gx/screen provides display enumeration and fold posture, with automatic dual-pane on half-folded screens.
    link: /en/api/gx
    linkText: Built-in modules
  - icon: 📦
    title: Scaffolding + Single-File Packaging
    details: gox create sets up a runnable project in one command; jsbuild embeds your script into a generated Go project compiled into a single-file program, with pure-Go cross-compilation and zero dependencies on the target machine.
    link: /en/guide/package
    linkText: Packaging guide
---

<div class="home-extra">

## Up and Running in 30 Seconds

<div class="terminal">
  <div class="terminal-bar"><i></i><i></i><i></i><span>gox — REPL / run scripts / create projects</span></div>
  <div class="terminal-body"><span class="prompt">$</span> npm i -g @goxjs/goxjs<br><span class="prompt">$</span> gox<br>Gox REPL (ES6 subset)<br>Type :exit to quit, :help for help<br>&nbsp;<br><span class="prompt">&gt;</span> let x = 10<br><span class="prompt">&gt;</span> let y = 20<br><span class="prompt">&gt;</span> x + y<br><span class="out">&nbsp;&nbsp;30</span><br><span class="prompt">&gt;</span> [1, 2, 3].map(v =&gt; v * 2)<br><span class="out">&nbsp;&nbsp;[2, 4, 6]</span><br><span class="prompt">&gt;</span> <span class="caret"></span></div>
</div>

You can also skip the install: `npx goxjs app.js`; or build from source with `go build`. See [Installation and Creating a Project](/en/guide/install) for details.

## What It Actually Is

<div class="position-grid">
  <div class="position-card">
    <h3>What it is</h3>
    <p>A JavaScript runtime written in Go with <strong>everything implemented from scratch, from lexical analysis to the bytecode virtual machine</strong>. Not a binding for V8, and not JS translated into Go.</p>
  </div>
  <div class="position-card">
    <h3>What you can do with it</h3>
    <p>Run ES6+ scripts, write CLI tools, build desktop apps with windows, <strong>package scripts into a single executable</strong> to share with others, and use it to learn how compilers and VMs are built.</p>
  </div>
  <div class="position-card">
    <h3>What it is not</h3>
    <p>It does not aim to replace the Node ecosystem in production: no npm compatibility, no <code>require</code>, no JIT, and no DOM. Treat it as an independent small language with a built-in UI framework.</p>
  </div>
</div>

## The Compilation Pipeline

<p class="section-sub">One clear pipeline, where every layer can be read and tested on its own.</p>

<div class="pipeline">
  <div class="pipe-node"><b>.js source</b><span>UTF-8 text</span></div>
  <div class="pipe-arrow">→</div>
  <div class="pipe-node"><b>lexer</b><span>Tokenization → token stream</span></div>
  <div class="pipe-arrow">→</div>
  <div class="pipe-node"><b>parser</b><span>Parsing → AST</span></div>
  <div class="pipe-arrow">→</div>
  <div class="pipe-node"><b>compiler</b><span>Symbol table + bytecode generation</span></div>
  <div class="pipe-arrow">→</div>
  <div class="pipe-node"><b>vm</b><span>Stack-frame execution + event loop</span></div>
</div>

Key design decisions: GC-free explicit memory management (with dedicated handling for circular references), a single-threaded VM with cross-goroutine scheduling (network callbacks are re-posted, so JS is always single-threaded and lock-free), and fixed-length instruction encoding (decoding is a simple fetch).

## A Desktop GUI App in 16 Lines

```js
import { createSignal } from "gx/solid";
import { h, render } from "gx/gfx";

const [count, setCount] = createSignal(0);

render(
  <window title="Counter" width={400} height={300}>
    <column gap={8} padding={16}>
      <text font={20}>{() => `count: ${count()}`}</text>
      <button onClick={() => setCount(c => c + 1)}>加一</button>
    </column>
  </window>
);
```

```bash
gox counter.js          # Run directly — opens a 400x300 window
go run ./packager counter.js --gui -o counter.exe   # Package into a standalone GUI app
```

Passing a **function** as a prop or text makes it a reactive binding: signal update → dependent nodes marked dirty → dirty rectangles merged so only affected regions are redrawn. See the [GUI desktop app tutorial](/en/guide/gui) for more.

## Capability Overview

<div class="cap-table-wrap">

| Area | What's covered | Where to look |
| --- | --- | --- |
| Language | ES6+ subset: `let`/`const`, arrow functions, class, `async`/`await`, destructuring, template literals, optional chaining, ES modules, JSX | [Tutorial · Language Basics](/en/guide/language) |
| Standard library | Object / Array / String / Map / Set / Proxy / Promise / TypedArray / Temporal … | [API · Standard Built-ins](/en/api/builtins) |
| Host modules (no import) | `console` / `fs` / `path` / `process` / `http` / `fetch` | [API · Host Modules](/en/api/host) |
| Reactivity | GetX-style `obs` / `computed`, SolidJS-style `gx/solid` signals | [Tutorial · Reactivity](/en/guide/reactive) |
| GUI | 44 built-in elements + JSX + dirty-rectangle partial redraw, routing, multi-window | [Component Reference](/en/components/) |
| Platforms | Desktop Windows / Linux / macOS (win32 / X11 / cocoa) and mobile Android / iOS / HarmonyOS — platform shell projects driving the same rendering core, with one JS UI across all of them | [Tutorial · GUI Apps](/en/guide/gui) |
| Built-in modules (import required) | `gx/solid` · `gx/gfx` · `gx/view` · `gx/router` · `gx/screen` · `gx/dialog` · `gx/storage` · `gx/dev` plus the six native-capability modules | [API · Built-in Modules](/en/api/gx) |
| Toolchain | REPL, `gox create` scaffolding, `gox dev` hot reload, jsbuild packaging, prebuilt npm binaries for five platforms | [Tutorial · Installation](/en/guide/install) |

</div>

## Versions and Current Status

Current version **v0.7.0**; see [GitHub Releases](https://github.com/14752222/Gox/releases) for the full changelog.

| Version | Highlights |
| --- | --- |
| 0.7.0 | `gox cert` to generate signing certificates for all platforms in one step, `gox build android` auto-wires signing, `gox create` generates a certs/ directory; `gox build macos --arch universal` (merged amd64+arm64); ordered multi-select photo picking on iOS and multi-file preview in media.preview |
| 0.6.0 | macOS window backend cocoa (desktop GUI now covers all three platforms); `gox dev` hot reload, `gox.json` project config, unified `gox build` entry point |
| 0.5.0 | Six built-in native-capability modules (gx/device · gx/app · gx/geo · gx/media · gx/permission · gx/viewport) |
| 0.4.0 | `gox create` scaffolding; routing `gx/router` and screen `gx/screen` become built-in modules |

::: info Known Gaps
Rich text (inline mixed styling) is not yet wrapped (virtualized long lists landed as [`<scroll vlist>`](/en/components/layout#scroll)) — the table / tree / tooltip / icon / spinner / tabs data-display and feedback widgets all landed in 0.9.0; parts of the native-capability layer that depend on real devices (camera / location / photo library / permissions) honestly report `unsupported` on desktop; on mobile they are provided by the platform shell projects (Android verified on emulator, iOS pending, HarmonyOS still stubbed). See [Limitations and Common Pitfalls](/en/components/limits) for the itemized list.
:::

</div>
