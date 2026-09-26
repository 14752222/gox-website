---
title: Reactive Programming
description: "Gox ships two sets of reactive primitives: GetX-style global functions obs/computed/ever/once, and SolidJS-style gx/solid createSignal/createEffect/createMemo."
---

# Reactive Programming

Gox ships two sets of reactive primitives, both as global functions.

## obs: GetX style (Dart GetX semantics)

```js
let count = obs(0)
ever(count, v => console.log("count =", v))   // fires immediately with the current value on subscribe

count.value = 1
count.value = 2
count.value = 2   // value unchanged, no notification
```

```text
count = 0
count = 1
count = 2
```

| API | Description |
| --- | --- |
| `obs(value)` | Creates an observable value; read/write through `.value` |
| `computed(fn)` | A computed value derived from other observables, recalculated automatically when dependencies change |
| `ever(obs, fn)` | Continuous subscription; fires on every change |
| `once(obs, fn)` | Fires exactly once, on the next change |

## signals: SolidJS style (the gx/solid module)

```js
import { createSignal, createEffect, createMemo } from "gx/solid"

const [count, setCount] = createSignal(0)

createEffect(() => console.log("count is", count()))   // runs once immediately
setCount(5)                                            // → count is 5

const doubled = createMemo(() => count() * 2)
setCount(10)
console.log(doubled())                                 // → 20
```

::: info Note
`obs` is a global function you can call directly; `createSignal` and friends need to be imported from `"gx/solid"` — a Gox built-in module (resolved before the filesystem), and the foundation of the GUI reactive updates covered in the next section.
:::
