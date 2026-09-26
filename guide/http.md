---
title: 网络请求与 HTTP 服务
description: Gox 网络能力：全局 fetch 客户端、http.createServer 起服务、req/res 对象、随机端口与并发模型（goroutine 回投单线程 VM）。
---

# 网络请求与 HTTP 服务

## fetch:全局 HTTP 客户端

```js
const r = await fetch("https://httpbin.org/get?name=zed")
console.log(r.status, r.ok)             // 200 true
console.log(await r.text())

// POST 请求
const r2 = await fetch("https://httpbin.org/post", {
  method: "POST",
  body: JSON.stringify({ hello: "gox" }),
  headers: { "Content-Type": "application/json" }
})
const data = await r2.json()
```

`Response` 只读 `text()` / `json()` 两个方法,没有 `blob()` / `arrayBuffer()` / `stream()`。

## http.createServer:HTTP 服务端

`http` 同样是全局对象,支持 `get` / `request` 客户端方法与 `createServer` 服务端:

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

# 另开一个终端验证
$ curl "http://127.0.0.1:8080/json?name=zed"
{"msg":"hi zed","method":"GET"}
```

- 请求对象 req:method、url、path、query(解析后的查询参数)、headers、body
- 响应对象 res:writeHead(status, headers)、setHeader/removeHeader/getHeader、write、end(body)、statusCode
- server.listen(0, cb) 传 0 表示随机端口,实际端口写入 server.port;server.close() 关闭
- 处理函数里可以 await 或用 setTimeout 延迟 end,服务器会挂起任务保活事件循环直到响应完成

::: tip 并发模型
网络回调跑在 Go 的 goroutine 上,捕获后被调度回 VM 单线程执行 —— 你的 JS 代码永远单线程,无需加锁。
:::
