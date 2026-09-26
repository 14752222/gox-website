---
title: FAQ
description: "Gox frequently asked questions: why no var, its relationship to Node.js/Bun/Deno, macOS support, and how to debug and contribute."
---

# FAQ

## Why no var?

Gox deliberately implements only an ES6+ subset: `let` / `const` have block scoping with clearer semantics, leaving behind historical baggage such as `var` hoisting. That's exactly what the REPL banner "ES6 subset, no var" refers to.

## How does it relate to Node.js / Bun / Deno?

Different positioning. Gox's value lies in **walking through a complete compilation pipeline from scratch** (lexer → parser → compiler → bytecode VM) and providing a usable language plus host capabilities — good for scripting tools, CLIs, small desktop apps, and for learning how runtimes work. It does not aim to replace the Node ecosystem in production — there is no npm ecosystem compatibility and no JIT.

## Does macOS work?

Both CLI and GUI are available: the prebuilt binaries from `npm i -g @goxjs/goxjs` include darwin-amd64 and darwin-arm64; since 0.6.0 the GUI also has a macOS window backend (cocoa), with windows, IME, and native dialogs all working.

## How do I debug / contribute?

```bash
gox version            # print the current version; first confirm which build you're running
go test ./...          # run all tests
go run ./test/bench    # profiling benchmarks (fib, function calls, object operations)
go run ./packager -h   # packager usage
```

For the common "text looks wrong / renders weird" issues, first align versions with `gox version` before investigating: 0.4.1 fixed a glyph-cache aliasing bug (an entire screen of identical glyphs after repaint), 0.4.2 fixed `<text>` content being drawn twice (ghosting), and 0.4.3 fixed `font` not being inherited. Whenever you see such symptoms, upgrade to the latest version first, then reproduce.

To add standard library APIs or dig into the callback bridge and memory management, read the [JavaScript Runtime API implementation tutorial](https://github.com/14752222/Gox/blob/main/docs/js-runtime-api-tutorial.md).
