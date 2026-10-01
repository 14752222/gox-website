---
title: API 参考：运行时与全局作用域
description: Gox 运行时与全局作用域：单线程 VM 执行模型、四种执行方式、模块系统与内置模块命名空间、globalThis 的行为，以及全局环境速查表。
---

# API 参考：运行时与全局作用域

## 运行时与全局作用域 {#runtime}

Gox 是**单线程**的字节码虚拟机。一个脚本从词法分析一路走到栈式帧执行,期间 **不会**在多线程之间迁移 —— 网络回调在 Go 的 goroutine 上被捕获后,会被重新调度回 这条唯一的脚本线程上执行。所以你的 JS 代码永远单线程,不需要锁。

### 四种执行方式

| 方式 | 命令 | 说明 |
| --- | --- | --- |
| REPL | `gox` | 交互式,`:help` / `:clear` / `:exit` |
| 运行脚本 | `gox app.js` | 执行完最后一个顶层表达式后回显其值,并等待所有定时器与异步回调跑完才退出 |
| 创建工程 | `gox create my-app` | 脚手架:铺出一个开箱即跑的 GUI 工程(`new` / `init` 同义,需 0.4.0+) |
| 打包成单文件 | `go run ./packager app.js -o app.exe` | 把运行时与脚本一起编成独立可执行文件 |

`goxjs` 与 `gox` 是同一个二进制的两个命令名;从源码构建出来的叫 `gox` / `gox.exe`。子命令的判定规则是"这个参数像不像脚本路径" (看扩展名与路径分隔符),所以 `gox help.js` 仍然是**跑脚本**而不是 `help`。

### 全局作用域里有什么

宿主能力(`fs` / `path` / `process` / `http` / `fetch` / `console`)与标准内建对象 **全部直接挂在全局**,**不需要 import**。只有 `gx/*` 系列(界面与平台能力)需要显式导入:

```js
// 宿主能力:直接用,无需 import
let cfg = fs.readFileSync("app.json", "utf-8");
console.log(process.platform, path.join("a", "b"));

// 界面能力:必须 import(内置模块优先于文件系统解析)
import { createSignal } from "gx/solid";
import { h, render } from "gx/gfx";
```

### 模块系统

`import` / `export` 是静态的,相对路径以 **当前文件**为基准解析;也支持默认导出、命名空间导入与动态 `import()`。 `gx/` 开头的名字与 `gox` 是保留的内置模块命名空间: 只查内置模块表,查不到直接报错并列出可用模块 —— 拼写错误不会变成文件读取错误, 内置模块也不会被同名文件覆盖。

```js
import sq, { PI } from "./math_utils.js";       // 默认 + 命名导出
import * as math from "./math_utils.js";        // 命名空间导入
import { PI as P, area as squareArea } from "./math_utils.js"; // 别名导入
import { h, render, createSignal } from "gox";  // 聚合入口: gx/* 全部导出的并集
import("./math_utils.js").then(m => m.PI);      // 动态加载
```

::: tip 导入别名 as
`import { PI as P } from "…"` 支持(`as` 前是**模块导出的名字**, `as` 后是**本文件绑定的名字**)。从内置模块导入时, 编译期按 `as` 前的名字核对导出表 —— 名字不存在会当场报错并列出可用导出。
:::

### globalThis

`globalThis` 指向全局对象本身,读写自定义属性、以及用静态属性名访问内置对象都可以:

```js
let n = 0;              // 全局作用域可见,但不是 globalThis.n
globalThis.n = 0;       // 显式挂到全局对象上
console.log(globalThis.Math === Math);   // true
```

::: warning globalThis 不支持动态键访问,也不可枚举
`globalThis.Uint8Array`(点语法)能拿到值,但 `globalThis["Uint8Array"]` 或 `globalThis[k]`(方括号 / 变量键)**返回 `undefined`**; `Object.keys(globalThis)` 永远是空数组。 `"fs" in globalThis` 则为 `true`。 所以"反射式探测全局有哪些 API"这种写法在 Gox 里行不通 —— 直接用点语法写名字即可。
:::

::: info 脚本最后一行会被回显
命令行运行脚本时,运行时会打印**最后一个顶层表达式的值**(`undefined` 除外)。 不想让它打印就在末尾写 `void 0;` —— 多窗口演示脚本就是靠这个收尾的。 另外**最后一条语句是 `import` 时会把模块对象当回显值打出来**,所以 import 一律放文件顶部。
:::

## 全局速查表 {#cheatsheet}

一张表看全全局环境。带 仅 Windows 标记的能力在其它平台会安全降级。

| 类别 | 成员 |
| --- | --- |
| 基础 | `Object` `Array` `String` `Number` `Boolean` `Function` `Symbol` `BigInt` `globalThis` |
| 集合 | `Map` `Set` `WeakMap` `WeakSet` `WeakRef` `FinalizationRegistry` `Iterator` |
| 数值 / 数学 | `Math` `parseInt` `parseFloat` `isNaN` `isFinite` `NaN` `Infinity` |
| 文本 / 数据 | `JSON` `RegExp` |
| 异步 | `Promise`,以及 `async` / `await` 语法 |
| 二进制 | `ArrayBuffer` `DataView`,TypedArray 全家族(`Uint8Array` 等) |
| 元编程 | `Proxy` `Reflect` `eval` |
| 错误 | `Error` `TypeError` `RangeError` `ReferenceError` `SyntaxError` `AggregateError` |
| 日期时间 | `Temporal`(**没有 `Date`**) |
| 定时器 | `setTimeout` `setInterval` `clearTimeout` `clearInterval` `requestIdleCallback` `cancelIdleCallback` `delay`,严格定时器四件套 |
| 宿主(无需 import) | `console` `fs` `path` `process` `http` `fetch` |
| 响应式(全局函数) | `obs` `computed` `ever` `once` |
| 内置模块(需 import) | `gx/solid` `gx/gfx` `gx/view` `gx/router` `gx/screen` `gx/dialog` `gx/storage` `gx/dev` `gx/device` `gx/app` `gx/geo` `gx/media` `gx/permission` `gx/viewport`,以及聚合入口 `gox` |
| 命令行子命令 | `create` / `new` / `init`(脚手架)、`version`、`help` |
| 关键字字面量 | `undefined` `NaN` `Infinity` |
