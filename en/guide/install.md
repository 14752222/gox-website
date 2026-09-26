---
title: Installation and Creating a Project
description: "Three ways to install the Gox JavaScript runtime: npm i -g @goxjs/goxjs (prebuilt binaries for 5 platforms included), gox create to scaffold a GUI project in one command, or building from source with go build."
---

# Installation and Creating a Project

Three entry points — pick one based on your goal. All three install **the same binary**. There are two command names, `goxjs` and `gox` (aliases of each other, identical usage); a source build produces `Gox` (`Gox.exe` on Windows).

## Option 1: The `gox create` Scaffold (Easiest for GUI Apps)

The equivalent of `npm create vite` on the frontend: one command lays out a ready-to-run GUI project with the directory structure already in place, so you can just keep adding features. **Requires version 0.4.0 or later**.

```bash
npm i -g @goxjs/goxjs
gox create my-app      # new / init are aliases of the same subcommand
cd my-app
npm install            # only to get the goxjs command; the runtime itself has zero dependencies
npm run dev            # = goxjs src/main.js
```

Generated output (the default, pinned by tests):

```text
.
├── package.json          # metadata + two scripts (dev / start)
├── README.md             # template docs and a list of common pitfalls
├── .gitignore
└── src/
    ├── main.js           # entry point: creates the window + mounts the root component
    ├── app.js            # root component: tabs + panel composition
    ├── store.js          # app state: signals created at module scope, shared across components
    ├── theme.js          # design tokens: colors / spacing / font sizes
    └── components/
        ├── counter.js    # local state + a controlled slider
        ├── todo-list.js  # list (each directive + keyed reuse) + input binding
        └── status-bar.js # derived values + Switch / Match multi-state
```

Generation is **refused by default if the directory is not empty**; pass `--force` to proceed. `--force` only overwrites files with the same names and **does not** clean up other files.

## Option 2: Install the Runtime via npm

The [`@goxjs/goxjs`](https://www.npmjs.com/package/@goxjs/goxjs) package ships prebuilt binaries for Windows / Linux / macOS × x64 / arm64 (5 platforms in total, excluding windows-arm64) — no Go environment needed:

```bash
npm i -g @goxjs/goxjs   # installs two commands: gox and goxjs
gox                 # enter the REPL
gox app.js          # run a script
npx goxjs app.js    # or run it without a global install
```

## Option 3: Build from Source

Requires Go 1.26+:

```bash
git clone https://github.com/14752222/Gox.git
cd Gox
go build           # produces Gox.exe on Windows, Gox on Unix-like systems
./Gox app.js       # then use ./Gox in place of gox in the tutorials
```

::: tip Note
The tutorials consistently use `gox` in command examples. If you built from source, substitute `./Gox` (`Gox.exe` on Windows) yourself — the usage is identical.
:::
