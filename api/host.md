---
title: 宿主模块：fs / path / process / http / fetch
description: Gox 宿主模块 API：全局 console/fs（同步+异步双态）/path/process/http（createServer 服务端）/fetch，Node 风格无需 import。
---

# 宿主模块：fs / path / process / http / fetch

## 宿主模块 {#host}

全部是全局对象,**无需 import**,风格与 Node.js 对齐。 `fs` 的每个方法都提供**同步**与**异步**两态。

### console {#h-console}

| 方法 | 说明 |
| --- | --- |
| console.log | 标准输出 |
| console.info | 信息(输出同 log) |
| console.warn | 警告,写入 stderr |
| console.error | 错误,写入 stderr |

### fs — 文件系统 {#h-fs}

每个 `xxxSync` 都有对应的异步版本。异步版本同时支持 **错误优先回调**(Node 语义)与 **await** 两种写法。

| 同步 | 异步 | 说明 |
| --- | --- | --- |
| readFileSync | readFile | 读文本(默认 UTF-8;传 `"base64"` 返回 base64) |
| readBytesSync | — | 读原始字节,返回字节数组 |
| writeFileSync | writeFile | 写入(覆盖) |
| appendFileSync | appendFile | 追加 |
| existsSync | — | 路径是否存在 |
| statSync | stat | 文件信息:`size` / `isFile()` / `isDirectory()` |
| readdirSync | readdir | 列出目录项 |
| mkdirSync | mkdir | 创建目录,支持 `{ recursive: true }` |
| unlinkSync | unlink | 删除文件 |
| rmdirSync | — | 删除空目录 |
| rmSync | — | 递归删除 |
| renameSync | — | 重命名 / 移动 |
| copyFileSync | — | 复制文件 |

```js
// 同步
fs.writeFileSync("hello.txt", "hello gox");
console.log(fs.readFileSync("hello.txt", "utf-8"));   // hello gox
let st = fs.statSync("hello.txt");
console.log(st.size, st.isFile());

// 异步 · 错误优先回调
fs.readFile("hello.txt", "utf-8", (err, data) => {
  if (err) throw err;
  console.log(data);
});

// 异步 · await(Promise 化)
const text = await fs.readFile("hello.txt", "utf-8");
```

::: info 路径基准
`fs` 的相对路径按**进程工作目录**解析,不是"脚本所在目录" (脚本可能来自 stdin / 字符串 / 打包产物,没有所在目录这个概念)。
:::

### path — 路径处理 {#h-path}

| 成员 | 说明 |
| --- | --- |
| join(...parts) | 拼接路径,自动处理分隔符 |
| resolve(...parts) | 解析成绝对路径 |
| dirname(p) | 取上级目录 |
| basename(p) | 取文件名 |
| extname(p) | 取扩展名 |
| isAbsolute(p) | 是否为绝对路径 |
| sep | 路径分隔符(属性,非函数) |
| delimiter | 路径列表分隔符(属性,非函数) |

```js
let cfgPath = path.join(process.cwd(), "app.json");
console.log(path.extname("archive.tar.gz"));   // .gz
console.log(path.dirname("/a/b/c.txt"));       // /a/b
```

### process — 进程信息 {#h-process}

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| argv | 属性 | 命令行参数数组,如 `[gox, app.js, ...]` |
| env | 属性 | 环境变量快照对象 |
| platform | 属性 | `windows` / `linux` / `darwin` |
| pid | 属性 | 进程 ID |
| cwd() | 函数 | 当前工作目录 |
| chdir(p) | 函数 | 切换工作目录 |
| exit(code) | 函数 | 退出进程 |

```js
console.log(process.platform, process.pid);
console.log(process.argv);              // [gox, app.js, ...]
console.log(process.env.HOME ?? process.env.USERPROFILE);
```

### http — 客户端与服务端 {#h-http}

| 成员 | 说明 |
| --- | --- |
| http.createServer(handler) | 创建 HTTP 服务,返回 server 对象 |
| http.get(url, cb?) | 发起 GET 请求 |
| http.request(opts, cb?) | 发起任意方法请求 |

**server 对象**:

| 成员 | 说明 |
| --- | --- |
| listen(port, cb?) | 监听端口;传 `0` 表示随机端口,实际端口写入 `server.port` |
| close() | 关闭服务 |
| listening | 是否正在监听 |
| port | 实际监听的端口 |

**请求对象 `req`**:`method` / `url` / `path` / `query`(已解析的查询参数) / `headers` / `body` / `getHeader(name)`

**响应对象 `res`**:`statusCode` / `writeHead(status, headers)` / `setHeader` / `getHeader` / `removeHeader` / `write(chunk)` / `end(body)`

```js
// server.js
const server = http.createServer(function (req, res) {
  if (req.path === "/json") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ msg: "hi " + req.query.name, method: req.method }));
  } else {
    res.end("hello world");
  }
});

server.listen(8080, function () {
  console.log("listening on http://127.0.0.1:8080");
});
```

```bash
$ gox server.js
listening on http://127.0.0.1:8080

# 另开终端验证
$ curl "http://127.0.0.1:8080/json?name=zed"
{"msg":"hi zed","method":"GET"}
```

处理函数里可以 `await` 或用 `setTimeout` 延迟 `end`,服务器会挂起任务保活事件循环直到响应完成。 网络回调跑在 goroutine 上,被调度回脚本单线程执行 —— 无需加锁。

### fetch — 全局 HTTP 客户端 {#h-fetch}

| 用法 | 说明 |
| --- | --- |
| fetch(url, options?) | 返回 `Promise<Response>`;`options` 支持 `method` / `body` / `headers` |

**Response 对象**:`url` / `status` / `statusText` / `ok`(2xx 为 true) / `headers` / `body`,以及 `text()` 与 `json()` 两个读取方法。

```js
const r = await fetch("https://httpbin.org/get?name=zed");
console.log(r.status, r.ok);          // 200 true
console.log(await r.text());

// POST
const r2 = await fetch("https://httpbin.org/post", {
  method: "POST",
  body: JSON.stringify({ hello: "gox" }),
  headers: { "Content-Type": "application/json" }
});
const data = await r2.json();
```
