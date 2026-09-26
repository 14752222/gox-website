---
title: ES Modules
description: "ES modules in Gox: import/export, default exports, namespace imports, and dynamic import(); no CommonJS, no node_modules, no npm package resolution."
---

# ES Modules

Scripts are organized with `import` / `export`, and relative paths are resolved against the current file. `lib.js`:

```js
export const PI = 3.14
export function double(x) { return x * 2 }
```

`main.js`:

```js
import { PI, double } from "./lib.js"

setTimeout(() => console.log("tick"), 10)
console.log(double(PI))
```

```text
$ gox main.js
6.28
tick
```

Default exports, namespace imports, and dynamic `import()` are also supported:

```js
import sq, { PI } from "./math_utils.js"     // default export + named exports
import * as math from "./math_utils.js"      // namespace

import("./math_utils.js").then(m => console.log(m.PI))   // dynamic loading
```

| Limitation | Description |
| --- | --- |
| ES modules only | No CommonJS: `require` / `module.exports` / `__dirname` do not exist |
| No npm resolution | No `node_modules` lookup, no bare package names — only relative paths and `gx/*` / `gox` built-in modules |
| No import aliases | `import { x as y }` is not supported (see [Language Boundaries](/en/guide/language)) |
