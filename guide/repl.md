---
title: REPL 与命令行
description: Gox 交互式 REPL 与命令行速查：gox 运行脚本、gox create 创建工程、gox dev 热更新、gox build 统一构建，以及脚本回显语义。
---

# REPL 与命令行

## 交互式 REPL

不带参数启动就是交互式环境,适合随手试验:

```bash
$ gox
Gox REPL (ES6 subset, no var)
Type :exit to quit, :help for help

> let x = 10
> let y = 20
> x + y
  30
> [1, 2, 3].map(v => v * 2)
  [2, 4, 6]
```

REPL 命令:`:help` 查看帮助、`:clear` 重置环境、`:exit` 退出。

## 命令行速查

| 命令 | 说明 |
| --- | --- |
| `gox` | 无参数 → 进入 REPL |
| `gox <file.js>` | 运行脚本 |
| `gox create <name>` | 创建 GUI 工程(`new` / `init` 同义;非空目录加 `--force`) |
| `gox dev [入口.js]` | 开发热更新:监听 src/ 的 .js 变更,自动重建 VM 重跑入口(0.6.0 起) |
| `gox build <平台>` | 统一构建入口(`android\|ios\|windows\|macos`;自动注入权限并生成图标;读 `gox.json` 配置) |
| `gox version` | 打印版本号 |
| `gox help` | 打印用法 |

::: info 子命令的判定规则
运行时先判断"这个参数像不像脚本路径"(看扩展名与路径分隔符),像就当脚本执行。所以 `gox help.js`、`gox src/create.js` 仍然是**跑脚本**, 不会误当成 `help` / `create` 子命令。
:::

## 运行脚本

脚本执行完毕后会回显**最后一个顶层表达式的值**(`undefined` 除外),并等待所有定时器与异步回调执行完再退出:

```js
// hello.js
let name = "Gox"
console.log(`Hello, ${name}!`)
setTimeout(() => console.log("tick"), 10)
"bye"
```

```text
$ gox hello.js
Hello, Gox!
bye
tick
```

不想要那行回显就在末尾写 `void 0;`;另外**文件最后一条语句是 `import` 时会把模块对象当回显值打出来** —— 所以 `import` 一律放文件顶部。
