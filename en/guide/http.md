---
title: Network Requests and HTTP Servers
description: "Gox networking: a global fetch client, http.createServer for servers, req/res objects, random ports, and the concurrency model (goroutines dispatched back to a single-threaded VM)."
---

# Network Requests and HTTP Servers

## fetch: a global HTTP client

```js
const r = await fetch("https://httpbin.org/get?name=zed")
console.log(r.status, r.ok)             // 200 true
console.log(await r.text())

// POST request
const r2 = await fetch("https://httpbin.org/post", {
  method: "POST",
  body: JSON.stringify({ hello: "gox" }),
  headers: { "Content-Type": "application/json" }
})
const data = await r2.json()
```

`Response` only exposes the read methods `text()` / `json()` — there is no `blob()` / `arrayBuffer()` / `stream()`.

## http.createServer: the HTTP server side

`http` is also a global object, offering the client methods `get` / `request` plus `createServer` for servers:

```js
// server.js
const server = http.createServer(function (req, res) {
  if (req.path === "/json") {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ msg: "hi " + req.query.name, method: req.method }))
  } else {
    res.end("hello world")
  }
})

server.listen(8080, function () {
  console.log("listening on http://127.0.0.1:8080")
})
```

```bash
$ gox server.js
listening on http://127.0.0.1:8080

# verify in another terminal
$ curl "http://127.0.0.1:8080/json?name=zed"
{"msg":"hi zed","method":"GET"}
```

- The request object req: method, url, path, query (parsed query parameters), headers, body
- The response object res: writeHead(status, headers), setHeader/removeHeader/getHeader, write, end(body), statusCode
- server.listen(0, cb) — passing 0 means a random port; the actual port is written to server.port; server.close() shuts it down
- Inside the handler you can await or use setTimeout to delay end; the server keeps the task alive on the event loop until the response completes

::: tip Concurrency model
Network callbacks run on Go goroutines, then get scheduled back to the VM for single-threaded execution — your JS code is always single-threaded; no locking needed.
:::
