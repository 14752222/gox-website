---
title: 响应式编程
description: Gox 内置两套响应式原语：GetX 风格的 obs/computed/ever/once 全局函数，与 SolidJS 风格的 gx/solid createSignal/createEffect/createMemo。
---

# 响应式编程

Gox 内置两套响应式原语,均为全局函数。

## obs:GetX 风格(Dart GetX 语义)

```js
let count = obs(0)
ever(count, v => console.log("count =", v))   // 订阅时立即以当前值回调一次

count.value = 1
count.value = 2
count.value = 2   // 值未变化,不触发通知
```

```text
count = 0
count = 1
count = 2
```

| API | 说明 |
| --- | --- |
| `obs(value)` | 创建可观察值,读写走 `.value` |
| `computed(fn)` | 由其他 obs 派生的计算值,依赖变化时自动重算 |
| `ever(obs, fn)` | 持续订阅,每次变化都回调 |
| `once(obs, fn)` | 只在下一次变化时回调一次 |

## signals:SolidJS 风格(gx/solid 模块)

```js
import { createSignal, createEffect, createMemo } from "gx/solid"

const [count, setCount] = createSignal(0)

createEffect(() => console.log("count is", count()))   // 立即执行一次
setCount(5)                                            // → count is 5

const doubled = createMemo(() => count() * 2)
setCount(10)
console.log(doubled())                                 // → 20
```

::: info 注意
`obs` 是全局函数可直接用;`createSignal` 等需要从 `"gx/solid"` 导入 —— 这是 Gox 内置模块(优先于文件系统解析),也是下一节 GUI 响应式更新的基石。
:::
