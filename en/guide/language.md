---
title: Language Basics and Boundaries
description: "The ES6+ language subset of Gox: let/const/var, arrow functions, closures, class, destructuring, template literals, optional chaining, plus language boundaries like import as, Date, and encodeURI."
---

# Language Basics and Boundaries

Gox implements an ES6+ language subset. Declare variables with `let` / `const` — **`var` is not supported** (a deliberate design trade-off, see the [FAQ](/en/guide/faq)).

```js
// Variables and constants
let x = 10
const PI = 3.14

// Arrow functions, closures
const add = (a, b) => a + b
const counter = () => { let n = 0; return () => ++n }
let next = counter()

// class
class Point {
  constructor(x, y) { this.x = x; this.y = y }
  norm() { return Math.hypot(this.x, this.y) }
}
console.log(new Point(3, 4).norm())        // → 5

// Destructuring, rest parameters, default parameters, spread
let [a, b, ...rest] = [1, 2, 3, 4]
function greet(name = "world", ...tags) { return `hi ${name} ${tags}` }
let merged = [...[1, 2], ...[3, 4]]        // [1, 2, 3, 4]
let { host, port } = { host: "127.0.0.1", port: 8080 }

// Template literals, for...of (bindings can be destructured), try/catch
for (const v of [1, 2, 3]) console.log(`v = ${v}`)
for (const [k, v] of [["a", 1]]) console.log(`k = ${k}, v = ${v}`)   // → k = a, v = 1
try {
  throw new Error("boom")
} catch (e) {
  console.log(e.message)                   // → boom
}

// Optional chaining and nullish coalescing
let cfg = { db: { host: "localhost" } }
let host2 = cfg?.db?.host ?? "127.0.0.1"
```

## Language Boundaries (Know These Before You Write, Save Half an Hour of Debugging)

| Syntax | Gox's behavior |
| --- | --- |
| `var` | Not supported. Use `let` / `const` |
| `import { x as y }` | Not supported. The alias is treated as an extra named import and `y` is **silently `undefined`**. To rename, write `import { x } from "…"` and assign it to a new variable yourself |
| `Date` / `Intl` | Not available. Use `Temporal` |
| `encodeURI` / `btoa` etc. | Not available. Build what you need with `String` methods yourself |

::: info Note
JSX syntax (`<text>...</text>`) is also part of the language subset; it is lowered to `h(tag, props, ...children)` calls at compile time. See the [GUI Desktop Apps](/en/guide/gui) section for details.
:::
