---
title: FAQ
description: "Gox frequently asked questions: the language subset and var support, its relationship to Node.js/Bun/Deno, macOS support, and how to debug and contribute."
---

# FAQ

## Is `var` supported?

Yes. Since 0.8.0 `var` coexists with `let` / `const`: `var` follows the traditional semantics — **function scope**, redeclaration allowed, and hoisting to the top of the function (yielding `undefined` rather than a TDZ error). Day-to-day code should still prefer `let` / `const` (block scoping, clearer semantics); `var` is kept so that existing ES5-style code runs directly.

You can try it in the REPL:

```
> var x = 1
> function f() { var x = 2; return x }
> f()
  2
> x
  1
```

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
