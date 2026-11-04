---
title: GUI 调试工具
description: 用 Gox DevTools 调试 GUI 应用：交互式元素树、节点 props 检查、console 留存过滤、跨状态保持的 REPL、性能快照——基于 gx/dev 只读数据面的 Inspector 面板。
---

# GUI 调试工具（Gox DevTools）

`apps/devtools/` 是 GUI 开发期的**交互式 Inspector 面板**，基于 `gx/dev` 只读数据面（`devSnapshot` / `devTree` / `devNode` / `devProps` / `devLogs` / `devEval`），对齐 Chrome DevTools 的核心工作流。

## 启动

```bash
GOX_DEV=1 gox apps/devtools/src/main.js        # Linux / macOS
set GOX_DEV=1 && gox.exe apps/devtools/src/main.js   # Windows
```

`GOX_DEV=1` 建议常开：内核诊断警告（比如 JSX 子节点写了 `{sig}` 而非 `{sig()}` 这类「界面静默错误」）会进 `devSnapshot().warnings` 与 console 留存，面板直接可见。生产构建行为逐字不变。

## 面板能力

| 区 | 能力 |
| --- | --- |
| **元素树** | 原生 `<tree>` 组件：箭头展开/收起、点击选中节点、多窗口下拉切换；有界（深度 8 / 800 节点），截断有提示 |
| **节点详情** | 选中后按稳定寻址串 `path`（如 `"0/2/1"`）回查 `devNode` / `devProps`，显示布局盒（x/y/w/h）、`role`、`focusable` 与完整 props |
| **控制台** | `devLogs` 留存按级别过滤（all / log / info / warn / error），最近 100 条 |
| **REPL** | `devEval` **跨调用保持状态**：`let a = 1` 回车，再 `a + 1` 回车得 2；历史 100 条，结果/错误分色 |
| **性能摘要** | `devSnapshot` 一行：帧计数、整帧占比、img / glyph 缓存命中率、节点统计、`gx/solid` effects 数、内核警告数 |

刷新是 500ms 拉取式轮询（`setInterval`），可暂停 + 手动刷新。面板是**观察者**，不参与帧预算——刻意不用 `requestAnimationFrame`。

## 调试自己的应用

面板就是普通脚本。把它挂进你自己窗口的一侧即可并排观察：

```js
import { App } from "apps/devtools/src/app.js";   // 一个普通 column 组件

render(
  <window title="你的应用" width={1280} height={800}>
    <row>
      {/* 你的应用界面 */}
      <App />
    </row>
  </window>
);
```

REPL 能否读到**你应用的变量**取决于宿主接线：进事件循环前调用过 `gfx.SetDevEnv(vm.Globals())` 时，`devEval` 就在真实 app 环境里求值；没接线时是独立沙盒（能跑，但看不到 app 变量）。见仓库 `docs/devtools.md`「接线点」。

## 只读边界（当前限制）

- `gx/dev` 是**只读**数据面：面板不能改 props、没有屏幕高亮叠加层。选中节点后看布局盒坐标自行对位。
- console 留存是内核 500 条环形缓冲，面板只能过滤，不能清空。
- 树数据有界（深度 8 / 800 节点）；大型界面超限节点带 `…` 标记。
