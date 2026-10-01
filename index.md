---
layout: home
titleTemplate: false
title: Gox — 用 Go 从零实现的 JavaScript 运行时
description: Gox 是用 Go 从零实现的 JavaScript 运行时：自研 lexer / parser / 字节码 VM 完整编译管线，单二进制、零 cgo、零外部依赖，自带软件光栅化 GUI 渲染层，支持 ES6+ 与 JSX，能把脚本打包成独立可执行文件。
hero:
  name: Gox
  text: 用 Go 从零实现的 JavaScript 运行时
  tagline: 自研 lexer → parser → 字节码 VM 整条编译管线。单二进制、零 cgo、零外部依赖，自带软件光栅化 GUI 渲染层 —— 写完的 JS 还能打包成独立可执行文件直接分发。
  actions:
    - theme: brand
      text: 十分钟上手 →
      link: /guide/
    - theme: alt
      text: 组件参考
      link: /components/
    - theme: alt
      text: API 参考
      link: /api/
    - theme: alt
      text: GitHub 源码
      link: https://github.com/14752222/Gox
  image:
    src: /logo.png
    alt: Gox —— 用 Go 从零实现的 JavaScript 运行时
features:
  - icon: ⚙️
    title: 完整编译管线
    details: 自研 lexer / parser / compiler / 字节码 VM，109 个操作码、定长 3 字节指令编码。不是 V8 绑定，也不是 JS 转 Go —— 每一层都可以单独阅读和测试。
    link: /api/
    linkText: 看运行时模型
  - icon: ✨
    title: ES6+ 子集 + JSX
    details: 闭包、class、async/await、解构、模板字符串、可选链、空值合并、ES 模块；JSX 在编译期降级为 h() 调用，还有 Temporal 取代 Date。
    link: /guide/language
    linkText: 语言基础
  - icon: 🖥️
    title: 自研 GUI 渲染层
    details: 纯 Go 软件光栅化，flex 风格布局 + JSX + 信号驱动更新，脏矩形局部重绘；win32 / X11 / cocoa 三平台窗口后端，25 个内置元素。
    link: /components/
    linkText: 组件参考
  - icon: 🔌
    title: 宿主能力模块
    details: Node 风格的 fs（同步 + 异步）、http 客户端与服务端、全局 fetch、path、process —— 全部挂在全局，免 import 直接用。
    link: /api/host
    linkText: 宿主 API
  - icon: 🧭
    title: 路由与屏幕适配
    details: gx/router 提供路由表、:param 匹配、三级守卫、历史栈、懒加载、多窗口作用域；gx/screen 提供显示器枚举与折叠姿态，半折屏自动双栏。
    link: /api/gx
    linkText: 内置模块
  - icon: 📦
    title: 脚手架 + 单文件打包
    details: gox create 一条命令铺出可跑工程；jsbuild 把脚本嵌入生成的 Go 工程编成单文件程序，支持纯 Go 交叉编译，目标机零依赖。
    link: /guide/package
    linkText: 打包指南
---

<div class="home-extra">

## 三十秒跑起来

<div class="terminal">
  <div class="terminal-bar"><i></i><i></i><i></i><span>gox — REPL / 运行脚本 / 创建工程</span></div>
  <div class="terminal-body"><span class="prompt">$</span> npm i -g @goxjs/goxjs<br><span class="prompt">$</span> gox<br>Gox REPL (ES6 subset)<br>Type :exit to quit, :help for help<br>&nbsp;<br><span class="prompt">&gt;</span> let x = 10<br><span class="prompt">&gt;</span> let y = 20<br><span class="prompt">&gt;</span> x + y<br><span class="out">&nbsp;&nbsp;30</span><br><span class="prompt">&gt;</span> [1, 2, 3].map(v =&gt; v * 2)<br><span class="out">&nbsp;&nbsp;[2, 4, 6]</span><br><span class="prompt">&gt;</span> <span class="caret"></span></div>
</div>

也可以不装：`npx goxjs app.js`；或从源码 `go build`。详见[安装与创建工程](/guide/install)。

## 它到底是什么

<div class="position-grid">
  <div class="position-card">
    <h3>是什么</h3>
    <p>一个用 Go 写的、<strong>从词法分析到字节码虚拟机全部自己实现</strong>的 JavaScript 运行时。不是 V8 的绑定，也不是把 JS 翻译成 Go。</p>
  </div>
  <div class="position-card">
    <h3>能做什么</h3>
    <p>跑 ES6+ 脚本、写 CLI 工具、写带窗口的桌面程序、把脚本<strong>打包成单个可执行文件</strong>发给别人，以及拿它学习编译器与虚拟机实现。</p>
  </div>
  <div class="position-card">
    <h3>不做什么</h3>
    <p>不追求替代生产环境的 Node 生态：没有 npm 兼容、没有 <code>require</code>、没有 JIT，也不实现 DOM。当作一门独立的小语言 + 自带 UI 框架来用。</p>
  </div>
</div>

## 编译管线

<p class="section-sub">一条清晰的管线，每一层都可以单独阅读和测试。</p>

<div class="pipeline">
  <div class="pipe-node"><b>.js 源码</b><span>UTF-8 文本</span></div>
  <div class="pipe-arrow">→</div>
  <div class="pipe-node"><b>lexer</b><span>词法分析 → Token 流</span></div>
  <div class="pipe-arrow">→</div>
  <div class="pipe-node"><b>parser</b><span>语法分析 → AST</span></div>
  <div class="pipe-arrow">→</div>
  <div class="pipe-node"><b>compiler</b><span>符号表 + 字节码生成</span></div>
  <div class="pipe-arrow">→</div>
  <div class="pipe-node"><b>vm</b><span>栈式帧执行 + 事件循环</span></div>
</div>

关键设计：无 GC 的显式内存管理（循环引用有专门处理）、单线程 VM + 跨 goroutine 调度（网络回调回投，JS 永远单线程无需加锁）、定长指令编码（解码即取即用）。

## 16 行写一个桌面 GUI 应用

```js
import { createSignal } from "gx/solid";
import { h, render } from "gx/gfx";

const [count, setCount] = createSignal(0);

render(
  <window title="Counter" width={400} height={300}>
    <column gap={8} padding={16}>
      <text font={20}>{() => `count: ${count()}`}</text>
      <button onClick={() => setCount(c => c + 1)}>加一</button>
    </column>
  </window>
);
```

```bash
gox counter.js          # 直接运行，弹出 400x300 窗口
go run ./packager counter.js --gui -o counter.exe   # 打包成独立 GUI 程序
```

属性或文本传**函数**即为响应式绑定：信号更新 → 依赖节点标脏 → 脏矩形合并后只重绘受影响区域。更多见[GUI 桌面应用教程](/guide/gui)。

## 能力总览

<div class="cap-table-wrap">

| 层面 | 内容 | 去哪看 |
| --- | --- | --- |
| 语言 | ES6+ 子集：`let`/`const`、箭头函数、class、`async`/`await`、解构、模板字符串、可选链、ES 模块、JSX | [教程 · 语言基础](/guide/language) |
| 标准库 | Object / Array / String / Map / Set / Proxy / Promise / TypedArray / Temporal … | [API · 标准内建](/api/builtins) |
| 宿主模块（免 import） | `console` / `fs` / `path` / `process` / `http` / `fetch` | [API · 宿主模块](/api/host) |
| 响应式 | GetX 风格 `obs` / `computed`，SolidJS 风格 `gx/solid` 信号 | [教程 · 响应式](/guide/reactive) |
| GUI | 25 个内置元素 + JSX + 脏矩形局部重绘、路由、多窗口 | [组件参考](/components/) |
| 内置模块（需 import） | `gx/solid` · `gx/gfx` · `gx/view` · `gx/router` · `gx/screen` · `gx/dialog` · `gx/storage` · `gx/dev` 与原生能力层六模块 | [API · 内置模块](/api/gx) |
| 工具链 | REPL、`gox create` 脚手架、`gox dev` 热更新、jsbuild 打包、五平台 npm 预编译二进制 | [教程 · 安装](/guide/install) |

</div>

## 版本与现状

当前版本 **v0.9.0**，完整条目见 [GitHub Releases](https://github.com/14752222/Gox/releases)。

| 版本 | 内容 |
| --- | --- |
| 0.9.0 | `table` / `tree` / `list-item` 数据展示组件、`tabs` 选项卡、`tooltip` 悬停提示；设计 token 与主题系统（32 项颜色 token、暗色预设、运行时切换）；`gx/update` v1.1 自动更新（流式下载 / 断点续传 / 进度回调 / pre 通道）；`gox create --ts` TypeScript / TSX 模板；`var` 声明与 class 表达式；运行时错误带源码帧定位 |
| 0.8.0 | Test262 合规率流水线（定时跑 language 套件、徽章自动回写）；`gox vs node` 性能基准 harness；压力与帧预算测试（万级定时器风暴 / 并发 fetch / 489 节点渲染预算）；3 个示例应用（TODO / 仪表盘 / 贪吃蛇）；计算属性名；滚动条可拖拽与横向滚动 |
| 0.7.0 | `gox cert` 一键生成各平台签名证书、`gox build android` 自动接入签名、`gox create` 生成 certs/ 目录；`gox build macos --arch universal`（amd64+arm64 合并）；iOS 相册多选保序与 media.preview 多文件预览 |
| 0.6.0 | macOS 窗口后端 cocoa（桌面 GUI 三平台齐）；`gox dev` 热更新、`gox.json` 项目配置、`gox build` 统一构建入口 |
| 0.5.0 | 原生能力层六个内置模块（gx/device · gx/app · gx/geo · gx/media · gx/permission · gx/viewport） |
| 0.4.0 | 脚手架 `gox create`；路由 `gx/router` 与屏幕 `gx/screen` 成为内置模块 |

::: info 已知缺口
虚拟化长列表、表格、tooltip、图标、富文本等尚未封装；原生能力层里依赖真机的部分（相机 / 定位 / 相册 / 权限）在桌面上诚实报 `unsupported`，需移动宿主实现。逐项见[限制与常见误区](/components/limits)。
:::

</div>
