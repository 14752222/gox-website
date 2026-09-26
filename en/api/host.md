---
title: "Host Modules: fs / path / process / http / fetch"
description: "Gox host module APIs: global console/fs (sync + async dual modes)/path/process/http (createServer server)/fetch, Node-style, no import needed."
---

# Host Modules: fs / path / process / http / fetch

## Host Modules {#host}

All of these are global objects — **no import needed** — styled after Node.js. Every `fs` method comes in **both sync and async** flavors.

### console {#h-console}

| Method | Description |
| --- | --- |
| console.log | Standard output |
| console.info | Info (same output as log) |
| console.warn | Warnings, written to stderr |
| console.error | Errors, written to stderr |

### fs — File System {#h-fs}

Every `xxxSync` has a corresponding async version. The async versions support both **error-first callbacks** (Node semantics) and **await**.

| Sync | Async | Description |
| --- | --- | --- |
| readFileSync | readFile | Read text (UTF-8 by default; pass `"base64"` to get base64) |
| readBytesSync | — | Read raw bytes, returns a byte array |
| writeFileSync | writeFile | Write (overwrite) |
| appendFileSync | appendFile | Append |
| existsSync | — | Whether a path exists |
| statSync | stat | File info: `size` / `isFile()` / `isDirectory()` |
| readdirSync | readdir | List directory entries |
| mkdirSync | mkdir | Create a directory; supports `{ recursive: true }` |
| unlinkSync | unlink | Delete a file |
| rmdirSync | — | Remove an empty directory |
| rmSync | — | Recursive removal |
| renameSync | — | Rename / move |
| copyFileSync | — | Copy a file |

```js
// Sync
fs.writeFileSync("hello.txt", "hello gox");
console.log(fs.readFileSync("hello.txt", "utf-8"));   // hello gox
let st = fs.statSync("hello.txt");
console.log(st.size, st.isFile());

// Async · error-first callback
fs.readFile("hello.txt", "utf-8", (err, data) => {
  if (err) throw err;
  console.log(data);
});

// Async · await (Promise-based)
const text = await fs.readFile("hello.txt", "utf-8");
```

::: info Path base
Relative paths in `fs` resolve against the **process working directory**, not "the directory the script lives in" (scripts may come from stdin / a string / a packed binary — there is no "script directory" concept).
:::

### path — Path Handling {#h-path}

| Member | Description |
| --- | --- |
| join(...parts) | Join paths, handling separators automatically |
| resolve(...parts) | Resolve to an absolute path |
| dirname(p) | Parent directory |
| basename(p) | File name |
| extname(p) | Extension |
| isAbsolute(p) | Whether the path is absolute |
| sep | Path separator (property, not a function) |
| delimiter | Path list separator (property, not a function) |

```js
let cfgPath = path.join(process.cwd(), "app.json");
console.log(path.extname("archive.tar.gz"));   // .gz
console.log(path.dirname("/a/b/c.txt"));       // /a/b
```

### process — Process Info {#h-process}

| Member | Type | Description |
| --- | --- | --- |
| argv | property | Command-line argument array, e.g. `[gox, app.js, ...]` |
| env | property | Snapshot object of environment variables |
| platform | property | `windows` / `linux` / `darwin` |
| pid | property | Process ID |
| cwd() | function | Current working directory |
| chdir(p) | function | Change working directory |
| exit(code) | function | Exit the process |

```js
console.log(process.platform, process.pid);
console.log(process.argv);              // [gox, app.js, ...]
console.log(process.env.HOME ?? process.env.USERPROFILE);
```

### http — Client and Server {#h-http}

| Member | Description |
| --- | --- |
| http.createServer(handler) | Create an HTTP server, returns a server object |
| http.get(url, cb?) | Issue a GET request |
| http.request(opts, cb?) | Issue a request with any method |

**Server object**:

| Member | Description |
| --- | --- |
| listen(port, cb?) | Listen on a port; `0` means a random port, with the actual port written to `server.port` |
| close() | Shut the server down |
| listening | Whether it is currently listening |
| port | The actual port being listened on |

**Request object `req`**: `method` / `url` / `path` / `query` (parsed query parameters) / `headers` / `body` / `getHeader(name)`

**Response object `res`**: `statusCode` / `writeHead(status, headers)` / `setHeader` / `getHeader` / `removeHeader` / `write(chunk)` / `end(body)`

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

# verify from another terminal
$ curl "http://127.0.0.1:8080/json?name=zed"
{"msg":"hi zed","method":"GET"}
```

Inside a handler you can `await` or delay `end` with `setTimeout`; the server suspends the task and keeps the event loop alive until the response completes. Network callbacks run on goroutines and are scheduled back onto the single script thread — no locking needed.

### fetch — Global HTTP Client {#h-fetch}

| Usage | Description |
| --- | --- |
| fetch(url, options?) | Returns a `Promise<Response>`; `options` supports `method` / `body` / `headers` |

**Response object**: `url` / `status` / `statusText` / `ok` (true for 2xx) / `headers` / `body`, plus the two read methods `text()` and `json()`.

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
