---
title: ES 模块
description: Gox 的 ES 模块：import/export、默认导出、命名空间导入与动态 import()；没有 CommonJS、没有 node_modules 与 npm 包解析。
---

# ES 模块

脚本通过 `import` / `export` 组织,相对路径以当前文件为基准解析。`lib.js`:

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

也支持默认导出、命名空间导入与动态 `import()`:

```js
import sq, { PI } from "./math_utils.js"     // 默认导出 + 命名导出
import * as math from "./math_utils.js"      // 命名空间

import("./math_utils.js").then(m => console.log(m.PI))   // 动态加载
```

| 限制 | 说明 |
| --- | --- |
| 只有 ES 模块 | 没有 CommonJS:`require` / `module.exports` / `__dirname` 都不存在 |
| 无 npm 解析 | 没有 `node_modules` 查找、没有裸包名,只有相对路径与 `gx/*` / `gox` 内置模块 |
| 无导入别名 | `import { x as y }` 不支持(见[语言边界](/guide/language)) |
