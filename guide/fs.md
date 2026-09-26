---
title: 文件与系统：fs / path / process
description: Gox 宿主模块 fs/path/process：Node 风格文件读写（同步 + 异步两套）、路径处理与进程信息，全局可用无需 import。
---

# 文件与系统：fs / path / process

`fs`、`path`、`process` 是全局对象,风格与 Node.js 对齐,**无需 import**。每个 fs API 都有同步(`xxxSync`)与回调式异步两套:

```js
// 同步风格
fs.writeFileSync("hello.txt", "hello gox")
console.log(fs.readFileSync("hello.txt", "utf-8"))    // → hello gox
fs.appendFileSync("hello.txt", "!")
console.log(fs.existsSync("hello.txt"))               // → true

let st = fs.statSync("hello.txt")
console.log(st.size, st.isFile(), st.isDirectory())   // 10 true false

for (const f of fs.readdirSync(".")) console.log(f)
fs.mkdirSync("logs", { recursive: true })

// 回调式异步(错误优先,Node 语义)
fs.readFile("hello.txt", "utf-8", (err, data) => {
  if (err) throw err
  console.log(data)
})

// 也支持 Promise 化的 await 用法
const text = await fs.readFile("hello.txt", "utf-8")
```

| 模块 | 常用 API |
| --- | --- |
| `fs` | `readFileSync/readFile`、`writeFileSync/writeFile`、`appendFileSync`、`readBytesSync`(返回字节数组)、`existsSync`、`statSync/stat`、`readdirSync/readdir`、`mkdirSync/mkdir`、`renameSync`、`copyFileSync`、`rmSync`、`unlinkSync/unlink`、`rmdirSync` |
| `path` | `join`、`basename`、`dirname`、`extname`、`resolve`、`isAbsolute`、`sep`、`delimiter` |
| `process` | `argv`(命令行参数)、`env`(环境变量)、`cwd()`、`chdir()`、`exit(code)`、`platform`(windows/linux/darwin)、`pid` |

```js
let cfgPath = path.join(process.cwd(), "app.json")
console.log(path.extname("archive.tar.gz"))     // → .gz
console.log(process.platform, process.pid)
console.log(process.argv)                       // [gox, app.js, ...]
```

::: info 两个容易踩的口径
**编码参数**:`fs.readFileSync(path)` 默认按 UTF-8 返回字符串;传 `'base64'` 则返回 base64 编码;需要原始字节时用 `fs.readBytesSync(path)`。<br> **路径基准**:`fs` 的相对路径按**进程工作目录**解析,不是"脚本所在目录"。脚本可能来自 stdin / 字符串 / 打包产物,根本没有"所在目录"这个概念。
:::
