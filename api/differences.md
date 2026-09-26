---
title: 与 Node.js / 浏览器的差异及缺失 API 一览
description: Gox 与 Node.js/浏览器的差异清单：没有 var/Date/Intl/DOM/npm 生态，缺失 API 一览表（Date、encodeURI、structuredClone、require 等），迁移排查用。
---

# 与 Node.js / 浏览器的差异及缺失 API 一览

## 与 Node / 浏览器差异 {#diff}

Gox 是**从零实现**的独立运行时,不是 Node 或浏览器的子集实现。以下差异是刻意的设计取舍。

### 语言层

| 项目 | Gox 的行为 |
| --- | --- |
| `var` | **不支持**。只用 `let` / `const` |
| `import { x as y }` | **不生效**(且不报错):`y` 静默为 `undefined`。命名空间导入 `import * as ns` 与默认导出正常 |
| `Date` | **没有**。用 `Temporal` |
| `Intl` | **没有**。数字与日期格式化要自己写 |
| `encodeURI` / `decodeURI` | **没有**。需要时自己用 `String` 方法拼 |
| `btoa` / `atob` | **没有**。二进制走 `ArrayBuffer` / TypedArray 或 `fs.readBytesSync` |

### 与 Node.js 相比

| 项目 | 说明 |
| --- | --- |
| npm 生态 | 不兼容。没有 `require`、没有 `node_modules` 解析、没有 C++ 原生插件 |
| 模块系统 | 只有 ES 模块(`import` / `export`),没有 CommonJS |
| 宿主模块范围 | 只有 `fs` / `path` / `process` / `http` / `fetch`。没有 `stream` / `child_process` / `os` / `crypto` / `net` |
| `process` | 只有 `argv` / `env` / `platform` / `pid` / `cwd` / `chdir` / `exit` |
| 事件循环 | 单线程 VM + Go goroutine 捕获回调后回投,语义接近但不暴露 `process.nextTick` / `setImmediate` |

### 与浏览器相比

| 项目 | 说明 |
| --- | --- |
| DOM | **没有** `document` / `window` / CSS。界面走自研的 `gx/gfx` 元素树 |
| Web API | 没有 `localStorage` / `XMLHttpRequest` / `WebSocket` / `Worker` / `Canvas2D` / `WebGL` |
| 持久化 | 用 `gx/storage`(写入系统应用数据目录)代替 `localStorage` |
| 网络 | `fetch` API 形似但只实现 `text()` / `json()` 两个读取方法 |
| 绘图 | `<canvas>` 提供 7 个绘制原语(矩形 / 圆 / 线 / 文本),没有路径、变换、渐变纹理 |
| `requestAnimationFrame` | 由 `gx/gfx` 提供(16ms 定时器实现),不是全局函数 |

### 平台能力差异

| 能力 | Windows | Linux (X11) | macOS |
| --- | --- | --- | --- |
| CLI 脚本 | ✅ | ✅ | ✅ |
| GUI 窗口 | ✅ | ✅(需实机验证) | ✅(cocoa,0.6.0 起) |
| 输入法 IME | ✅ | ❌ | ✅ |
| 剪贴板 | ✅ | ❌ 降级(读空串 / 写 false) | ✅(NSPasteboard) |
| 原生对话框 | ✅ | ❌ 降级(`confirm` 取 true、`openFile` 取 null) | ✅(alert / confirm / openFile / saveFile) |
| 显示器枚举 / 窗口归属 | ✅ | 未实机验证 | ✅ |
| 折叠姿态 | 靠 `reportPosture` 上报 | 靠上报 | 靠上报(macOS 无折痕硬件) |

## 缺失 API 一览 {#cheatsheet-miss}

便于从别的运行时迁移时快速排查 —— 下列名字在 Gox 里**不存在**,调用会得到 `ReferenceError`。

| 类别 | 不存在的成员 |
| --- | --- |
| 日期时间 | `Date`、`Intl` |
| 编码 | `encodeURI`、`decodeURI`、`encodeURIComponent`、`decodeURIComponent`、`btoa`、`atob`、`TextEncoder`、`TextDecoder` |
| 结构化数据 | `structuredClone`、`FormData`、`URL`、`URLSearchParams`、`Blob`、`File` |
| 网络 | `XMLHttpRequest`、`WebSocket`、`EventSource`、`Request`、`Response`(构造函数) |
| 并发 | `Worker`、`SharedArrayBuffer`、`Atomics` |
| 宿主对象 | `document`、`window`、`navigator`、`localStorage`、`sessionStorage`、`location` |
| Node 特有 | `require`、`module`、`exports`、`__dirname`、`Buffer`、`process.nextTick`、`setImmediate`、`queueMicrotask` |
| Node 模块 | `stream`、`child_process`、`os`、`crypto`、`net`、`events`、`util`、`url`、`querystring` |
| 响应式(需 import) | `batch`、`createContext`、`useContext`、`createStore`(`untrack` 有,已在 `gx/solid` 里) |
| 内置模块 | `gx/machine`、`gx/kit`(状态机仍是用户态模式;`gx/device` / `gx/app` / `gx/geo` / `gx/media` / `gx/permission` / `gx/viewport` 六个原生能力模块已于 2026-09-21 落地,`gx/router` 与 `gx/screen` 同批落地,均不再是缺口) |
| 模块里没有的 | `gx/gfx.alert`、`gx/gfx.confirm`、`gx/gfx.openFile`、`gx/view.each`、`gx/view.show`(前者去 `gx/dialog`,后者是元素级指令) |

::: tip 想确认某个 API 到底有没有
最直接的办法是在 REPL 里问一句:`typeof someName` —— 得到 `"undefined"` 就是没有。 想列一个模块的全部导出,用命名空间导入 + `Object.keys`: `import * as s from "gx/solid"; Object.keys(s)`。 完整的实现级说明见 [JavaScript Runtime API 实现教程](https://github.com/14752222/Gox/blob/main/docs/js-runtime-api-tutorial.md)。
:::
