---
title: 常见问题 FAQ
description: Gox 常见问题：语言子集与 var 支持情况、与 Node.js/Bun/Deno 的关系、macOS 支持情况、如何调试与参与开发。
---

# 常见问题 FAQ

## 支持 var 吗?

支持。0.8.0 起 `var` 与 `let` / `const` 并存:`var` 按传统语义工作 —— **函数作用域**、重复声明允许、声明提升到函数顶部(`undefined` 而非 TDZ)。日常写代码仍推荐 `let` / `const`(块级作用域、语义更清晰),`var` 的保留是为了让已有的 ES5 风格代码能直接跑起来。

在 REPL 里可以直接试:

```
> var x = 1
> function f() { var x = 2; return x }
> f()
  2
> x
  1
```

## 和 Node.js / Bun / Deno 是什么关系?

定位不同。Gox 的价值在于**从零走通完整编译管线**(lexer → parser → compiler → 字节码 VM)并提供可用的语言与宿主能力,适合写脚本工具、CLI、小型桌面程序,以及学习运行时原理。它不追求替代生产环境的 Node 生态 —— 没有 npm 生态兼容,也没有 JIT。

## macOS 能用吗?

CLI 与 GUI 都可用:`npm i -g @goxjs/goxjs` 的预编译二进制包含 darwin-amd64 与 darwin-arm64;0.6.0 起 GUI 也有 macOS 窗口后端(cocoa),窗口、IME 与原生对话框都可用。

## 怎么调试 / 参与开发?

```bash
gox version            # 打印当前版本,先确认自己跑的是哪一个构建
go test ./...          # 运行全部测试
go run ./test/bench    # 性能剖析基准(fib、函数调用、对象操作)
go run ./packager -h   # 打包器用法
```

常见的"字不对/显示怪"类问题,先用 `gox version` 对齐版本再排查: 0.4.1 修的是字形缓存别名(重绘后整屏汉字同形),0.4.2 修的是 `<text>` 内容画两遍(重影), 0.4.3 修的是 `font` 不继承。遇到现象先升级到最新版再复现。

想新增标准库 API 或深入理解回调桥与内存管理,阅读 [JavaScript Runtime API 实现教程](https://github.com/14752222/Gox/blob/main/docs/js-runtime-api-tutorial.md)。
