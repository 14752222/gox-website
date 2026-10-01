---
title: 语言基础与边界
description: Gox 的 ES6+ 语言子集：let/const/var 声明、箭头函数、闭包、class、解构、模板字符串、可选链，以及 import as、Date、encodeURI 等语言边界。
---

# 语言基础与边界

Gox 实现 ES6+ 语言子集。声明变量用 `let` / `const`(推荐),`var` 也支持 —— 0.8.0 起两者并存:`var` 按传统语义工作(**函数作用域**、允许重复声明、声明提升到函数顶部),见[常见问题](/guide/faq)。

```js
// 变量与常量
let x = 10
const PI = 3.14

// 箭头函数、闭包
const add = (a, b) => a + b
const counter = () => { let n = 0; return () => ++n }
let next = counter()

// class
class Point {
  constructor(x, y) { this.x = x; this.y = y }
  norm() { return Math.hypot(this.x, this.y) }
}
console.log(new Point(3, 4).norm())        // → 5

// 解构、剩余参数、默认参数、展开
let [a, b, ...rest] = [1, 2, 3, 4]
function greet(name = "world", ...tags) { return `hi ${name} ${tags}` }
let merged = [...[1, 2], ...[3, 4]]        // [1, 2, 3, 4]
let { host, port } = { host: "127.0.0.1", port: 8080 }

// 模板字符串、for...of(绑定可解构)、try/catch
for (const v of [1, 2, 3]) console.log(`v = ${v}`)
for (const [k, v] of [["a", 1]]) console.log(`k = ${k}, v = ${v}`)   // → k = a, v = 1
try {
  throw new Error("boom")
} catch (e) {
  console.log(e.message)                   // → boom
}

// 可选链与空值合并
let cfg = { db: { host: "localhost" } }
let host2 = cfg?.db?.host ?? "127.0.0.1"
```

## 语言边界(写之前先知道,省半小时排查)

| 写法 | Gox 的行为 |
| --- | --- |
| `var` | 支持(0.8.0 起),函数作用域 + 声明提升。日常仍推荐 `let` / `const` |
| `import { x as y }` | 支持。`x` 是模块导出的名字,`y` 是本文件绑定的名字;`import { x }` 与 `import { x as x }` 等价 |
| `Date` / `Intl` | 没有。用 `Temporal` |
| `encodeURI` / `btoa` 等 | 没有。需要时自己用 `String` 方法拼 |

::: info 注意
JSX 语法(`<text>...</text>`)也是语言子集的一部分,编译期会被降级为 `h(tag, props, ...children)` 调用,详见 [GUI 桌面应用](/guide/gui) 一节。
:::
