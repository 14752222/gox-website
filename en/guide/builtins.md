---
title: Built-in Objects at a Glance
description: "A quick tour of the modern JS objects built into Gox: Object/Array/String/Map/Set/Proxy/Promise/TypedArray/Temporal and more, available globally without import."
---

# Built-in Objects at a Glance

The global environment ships with the commonly used objects of modern JS — no import needed:

| Category | Objects |
| --- | --- |
| Fundamentals | `Object` `Array` `String` `Number` `Boolean` `Symbol` `BigInt` `Math` `JSON` `RegExp` |
| Collections | `Map` `Set` `WeakMap` `WeakSet` |
| Metaprogramming | `Proxy` `Reflect` `Iterator` |
| Async | `Promise` |
| Binary | `ArrayBuffer` `DataView` and the TypedArray family |
| Weak references | `WeakRef` `FinalizationRegistry` |
| Errors | The full error type family (`TypeError` / `RangeError` / `SyntaxError` / `ReferenceError` …) |
| Date & time | `Temporal` — the modern date/time API that replaces `Date` |

```js
console.log([1, 2, 3].filter(v => v > 1).reduce((a, b) => a + b))  // → 5
console.log(Math.hypot(3, 4))                                       // → 5
console.log(JSON.stringify({ ok: true }, null, 2))

let m = new Map([["a", 1]])
m.set("b", 2)
console.log([...m.keys()])                                          // → [a, b]
```

For the complete list (including the methods available on each object), see the [API Reference §3](/en/api/builtins).
