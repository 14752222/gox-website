---
title: REPL and CLI
description: "A cheat sheet for the Gox interactive REPL and CLI: gox to run scripts, gox create to scaffold a project, gox dev for hot reload, gox build as the unified build entry point, plus script echo semantics."
---

# REPL and CLI

## Interactive REPL

Starting with no arguments opens the interactive environment, great for quick experiments:

```bash
$ gox
Gox REPL (ES6 subset, no var)
Type :exit to quit, :help for help

> let x = 10
> let y = 20
> x + y
  30
> [1, 2, 3].map(v => v * 2)
  [2, 4, 6]
```

REPL commands: `:help` for help, `:clear` to reset the environment, `:exit` to quit.

## CLI Cheat Sheet

| Command | Description |
| --- | --- |
| `gox` | No arguments → enter the REPL |
| `gox <file.js>` | Run a script |
| `gox create <name>` | Scaffold a GUI project (`new` / `init` are synonyms; add `--force` for a non-empty directory) |
| `gox dev [entry.js]` | Dev hot reload: watches .js changes under src/, rebuilds the VM and re-runs the entry automatically (since 0.6.0) |
| `gox build <platform>` | Unified build entry point (`android\|ios\|windows\|macos`; auto-injects permissions and generates icons; reads `gox.json` config) |
| `gox version` | Print the version number |
| `gox help` | Print usage |

::: info How Subcommands Are Detected
The runtime first checks whether "the argument looks like a script path" (based on file extension and path separators); if it does, it's executed as a script. So `gox help.js` and `gox src/create.js` still **run scripts** — they are not mistaken for the `help` / `create` subcommands.
:::

## Running Scripts

After a script finishes, the runtime echoes **the value of the last top-level expression** (except `undefined`), and waits for all timers and async callbacks to finish before exiting:

```js
// hello.js
let name = "Gox"
console.log(`Hello, ${name}!`)
setTimeout(() => console.log("tick"), 10)
"bye"
```

```text
$ gox hello.js
Hello, Gox!
bye
tick
```

If you don't want that echo line, end the file with `void 0;`. Also note that **when the last statement of a file is an `import`, the module object is printed as the echo value** — so always put `import` statements at the top of the file.
