---
title: 全局限制、常见误区与平台差异
description: Gox GUI 的全局限制与常见误区速查：unknown tag、受控不回写、光标不闪等现象的原因与解法，未实现组件的替代做法与 Windows/Linux/macOS 平台差异表。
---

# 全局限制、常见误区与平台差异

### 语法层面的坑

| 现象 | 原因与解法 |
| --- | --- |
| 标签渲染成空白并打印 `unknown tag` | 标签名拼错或用了未实现的组件。已实现的标签见本页各节标题 |

### 行为层面的坑

| 现象 | 原因与解法 |
| --- | --- |
| 输入框打字没反应 / 滑块拖不动 | 受控组件没回写。在 `onInput` / `onChange` 里把值写回 signal |
| 输入框光标不闪 | 事件泵睡着了。挂一个空转 `requestAnimationFrame` 循环 |
| 点按钮没反应(无 VM 嵌入场景) | 纯 Go 嵌入时脚本闭包需要 VM 回调桥,测试要跑完整事件循环而不是裸调泵 |
| 折行文本高度不对 / 压住兄弟节点 | 折行需要宽度约束:写显式 `width`,或用父容器 stretch 给宽 |
| 带背景色的容器里子元素全叠在左上角 | 那不是 `column`/`row`,通用盒子不布局子元素 |
| 滚出视口的行看不见却"好像还能点" | 不会发生 —— `scroll` 的绘制与命中共用同一个视口,这是刻意设计 |
| 动画期间尺寸抽搐 | 读属性应该走渲染层的插值;若布局读到了 prop 的终值又回落固有尺寸就会抖。正常使用不会遇到 |
| 悬停不动时 tooltip 迟迟不弹 | `tooltip` 的延迟由事件泵唤醒,泵有 JS 定时器或窗口事件时正常;完全没有唤醒源时最迟会在下一次事件到达时弹出 |

### 未实现的组件(可用现有能力模拟)

| 想要 | 现状 / 替代做法 |
| --- | --- |
| list / table / tree | 列表渲染 + `scroll` 已够用;表格与树要自己拼 `row` |
| 虚拟化长列表 | 用 [each 指令](/components/patterns#view) 可做 keyed 复用,但"只挂可见区间"的窗口化仍未做 |
| icon / 富文本 / spinner / 视频 | 未实现 |

### 平台差异一览

| 能力 | Windows | Linux (X11) | macOS |
| --- | --- | --- | --- |
| 窗口与渲染 | ✅ | ✅(需实机验证) | ✅(cocoa,0.6.0 起) |
| 输入法 IME | ✅ | ❌ | ✅ |
| 剪贴板 | ✅ | ❌ 降级(读空串 / 写 false) | ✅(NSPasteboard) |
| 原生对话框 | ✅ | ❌ 降级(confirm 取 true、openFile 取 null) | ✅(alert / confirm / openFile / saveFile) |
| 字体 | ✅ 静态候选 | ✅ 惰性扫描字体目录,CJK 优先 | ✅ 扫描系统字体目录(darwin 选型已适配) |
| 原生能力(电量 / 网络 / 亮度 / 设置页) | ✅ 走 win32 宿主 | — | — |
| 原生能力(相机 / 定位 / 相册 / 权限) | ❌ 明说缺(报 unsupported) | — | — |

::: tip 完整演示脚本(共 42 个,都在仓库 testdata/ 下)
命令行里 `gox testdata/<名字>.js` 即可运行,例如 `gox testdata/menu_demo.js`。

- 元素:button_demo.js、form_demo.js、input_demo.js、textarea_demo.js、multiline_demo.js、select_demo.js、tabs_demo.js、slider_demo.js、progress_demo.js、scroll_demo.js、image_demo.js、canvas_demo.js、dialog_demo.js、dialog_native_demo.js、menu_demo.js
- 列表与条件:view_demo.js、view_demo2.js、list_demo.js、condrender_demo.js、resource_demo.js
- 布局与样式:grid_demo.js、elastic_layout_demo.js、model_demo.js、jsx_demo.js
- 交互与动画:events_demo.js、focus_demo.js、hover_demo.js、transition_demo.js、resize_demo.js、clipboard_demo.js、ime_demo.js
- 模块能力:router_demo.js(+ 懒加载模块 router_page_detail.js)、router_window_demo.js、routing_demo.js、multiwindow_demo.js、storage_demo.js、dev_panel_demo.js、native_demo.js、counter_demo.js、rx_demo.js、kit_demo.js、gui_demo.js

另有 `routing_demo.js` 是不依赖 `gx/router` 的"用户态路由"写法(一个 signal + 页面表),适合三页以内的小工具对照着看。
:::
