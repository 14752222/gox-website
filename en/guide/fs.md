---
title: "Files and System: fs / path / process"
description: "Gox host modules fs/path/process: Node-style file I/O (sync + async), path handling, and process info — available globally without import."
---

# Files and System: fs / path / process

`fs`, `path`, and `process` are global objects styled after Node.js — **no import needed**. Every fs API comes in both a synchronous (`xxxSync`) and a callback-based async flavor:

```js
// Synchronous style
fs.writeFileSync("hello.txt", "hello gox")
console.log(fs.readFileSync("hello.txt", "utf-8"))    // → hello gox
fs.appendFileSync("hello.txt", "!")
console.log(fs.existsSync("hello.txt"))               // → true

let st = fs.statSync("hello.txt")
console.log(st.size, st.isFile(), st.isDirectory())   // 10 true false

for (const f of fs.readdirSync(".")) console.log(f)
fs.mkdirSync("logs", { recursive: true })

// Callback-based async (error-first, Node semantics)
fs.readFile("hello.txt", "utf-8", (err, data) => {
  if (err) throw err
  console.log(data)
})

// Promise-based await also works
const text = await fs.readFile("hello.txt", "utf-8")
```

| Module | Common APIs |
| --- | --- |
| `fs` | `readFileSync/readFile`, `writeFileSync/writeFile`, `appendFileSync`, `readBytesSync` (returns a byte array), `existsSync`, `statSync/stat`, `readdirSync/readdir`, `mkdirSync/mkdir`, `renameSync`, `copyFileSync`, `rmSync`, `unlinkSync/unlink`, `rmdirSync` |
| `path` | `join`, `basename`, `dirname`, `extname`, `resolve`, `isAbsolute`, `sep`, `delimiter` |
| `process` | `argv` (command-line arguments), `env` (environment variables), `cwd()`, `chdir()`, `exit(code)`, `platform` (windows/linux/darwin), `pid` |

```js
let cfgPath = path.join(process.cwd(), "app.json")
console.log(path.extname("archive.tar.gz"))     // → .gz
console.log(process.platform, process.pid)
console.log(process.argv)                       // [gox, app.js, ...]
```

::: info Two easy-to-miss details
**Encoding parameter**: `fs.readFileSync(path)` returns a UTF-8 string by default; pass `'base64'` to get base64 encoding; use `fs.readBytesSync(path)` for raw bytes.<br> **Path base**: relative paths in `fs` are resolved against the **process working directory**, not "the script's directory". A script may come from stdin / a string / a packed artifact and has no "containing directory" concept at all.
:::
