---
title: 内置对象速览
description: Gox 全局内置的现代 JS 对象速览：Object/Array/String/Map/Set/Proxy/Promise/TypedArray/Temporal 等，无需 import 直接使用。
---

# 内置对象速览

全局环境内置了现代 JS 的常用对象,无需 import:

| 类别 | 对象 |
| --- | --- |
| 基础 | `Object` `Array` `String` `Number` `Boolean` `Symbol` `BigInt` `Math` `JSON` `RegExp` |
| 集合 | `Map` `Set` `WeakMap` `WeakSet` |
| 元编程 | `Proxy` `Reflect` `Iterator` |
| 异步 | `Promise` |
| 二进制 | `ArrayBuffer` `DataView` 与 TypedArray 家族 |
| 弱引用 | `WeakRef` `FinalizationRegistry` |
| 错误 | 完整错误类型族(`TypeError` / `RangeError` / `SyntaxError` / `ReferenceError` …) |
| 日期时间 | `Temporal` —— 取代 `Date` 的现代日期时间 API |

```js
console.log([1, 2, 3].filter(v => v > 1).reduce((a, b) => a + b))  // → 5
console.log(Math.hypot(3, 4))                                       // → 5
console.log(JSON.stringify({ ok: true }, null, 2))

let m = new Map([["a", 1]])
m.set("b", 2)
console.log([...m.keys()])                                          // → [a, b]
```

完整清单(含每个对象的可用方法)见 [API 参考 §3](/api/builtins)。
