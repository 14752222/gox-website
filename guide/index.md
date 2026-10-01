---
title: 使用教程
description: Gox 使用教程：安装与 gox create 脚手架、REPL 与命令行、ES6+ 语言基础与边界、ES 模块、异步、fs/http/fetch 宿主 API、响应式编程、GUI 桌面应用、路由与打包独立可执行文件。全部示例实际运行验证过。
---

# 使用教程

从安装到把脚本打包成独立可执行文件，大约需要十分钟。所有示例都实际运行验证过。

三种进入方式装出来的都是**同一个二进制**：npm 安装（内置 5 平台预编译二进制，无需 Go 环境）、脚手架 `gox create`、从源码 `go build`。命令名有 `gox` 与 `goxjs` 两个（互为别名），从源码构建则叫 `Gox`。

::: tip 快速导航
只想跑起来 → [安装与创建工程](/guide/install)；想写界面 → [GUI 桌面应用](/guide/gui)；想嵌入 Go 程序或学运行时原理 → [API 参考](/api/)。
:::

## 目录

| # | 小节 | 内容 |
| --- | --- | --- |
| 1 | [安装与创建工程](/guide/install) | npm 安装、`gox create` 脚手架、从源码构建 |
| 2 | [REPL 与命令行](/guide/repl) | 交互式环境、命令速查、脚本回显语义 |
| 3 | [语言基础与边界](/guide/language) | ES6+ 子集、写法边界（import as / Date 等） |
| 4 | [ES 模块](/guide/modules) | import/export、动态 import()、没有 CommonJS |
| 5 | [异步与事件循环](/guide/async) | async/await、定时器家族、退出语义 |
| 6 | [内置对象速览](/guide/builtins) | Object/Array/Map/Set/Promise/Temporal 等全局对象 |
| 7 | [文件与系统](/guide/fs) | `fs` / `path` / `process`，同步 + 异步两套 |
| 8 | [网络请求与 HTTP 服务](/guide/http) | 全局 `fetch`、`http.createServer` 起服务 |
| 9 | [响应式编程](/guide/reactive) | GetX 风格 `obs` 与 SolidJS 风格 `createSignal` |
| 10 | [GUI 桌面应用](/guide/gui) | JSX + gx/gfx + gx/solid、内置元素、路由、内置模块速查 |
| 11 | [打包独立可执行文件](/guide/package) | jsbuild 打包器、交叉编译、单文件分发 |
| 12 | [常见问题 FAQ](/guide/faq) | 与 Node 的关系、macOS 支持、调试方法 |

下一站：[组件参考](/components/) —— 43 个内置 GUI 元素的完整参数与示例。
