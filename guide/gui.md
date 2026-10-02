---
title: GUI 桌面应用
description: 用 Gox 写 GUI 桌面应用：JSX + gx/gfx 声明式 UI、gx/solid 信号驱动、纯 Go 软件光栅化、44 个内置元素、路由与多窗口，16 行代码起一个计数器。
---

# GUI 桌面应用

`gx/gfx` 模块 + JSX 语法提供声明式 UI:渲染器是纯 Go 软件光栅化(无 cgo、无动态库依赖),flex 风格布局,脏矩形局部重绘。一个 16 行的计数器:

```js
// counter.js
import { createSignal } from "gx/solid"
import { h, render } from "gx/gfx"

const [count, setCount] = createSignal(0)

render(
  <window title="Counter" width={400} height={300}>
    <column gap={8} padding={16}>
      <text font={20}>{() => `count: ${count()}`}</text>
      <button onClick={() => setCount(c => c + 1)}>加一</button>
    </column>
  </window>
)
```

```bash
gox counter.js          # 直接运行,弹出 400x300 窗口
```

## 它是怎么工作的

- JSX 在编译期降级为 h(tag, props, ...children) 调用 —— 没有虚拟 DOM diff,属性和文本节点直接与信号关联;h 因此必须 import(用了 JSX 的每个文件都要有它)
- 属性或文本传函数(如 {() => `count: ${count()}`})即为响应式绑定:信号更新 → 依赖该信号的节点标脏 → 脏矩形合并后只重绘受影响区域
- 点击按钮 → setCount 更新信号 → 上述链路自动完成,无需手写刷新
- 输入类组件是受控的:显示只看 value,编辑只派发 onInput / onChange,所以别忘在回调里把值写回 signal;或者直接用双向绑定指令 model={draft},读写一次接好

## 内置元素与属性

共 **44 个**脚本可写的内置元素(`select-popup` / `menu-item` 等由 Go 侧构造的内部标签不计), 按用途分七类;另有布局透明的容器标签 `<view>`(Fragment,自己不占盒子,是 `each` / `show` 指令的宿主)。下面是速查表,每个元素的完整参数与示例见 [组件参考](/components/)。

| 类别 | 元素 |
| --- | --- |
| 布局容器<br>7 个 | `<column>`、`<row>`、`<grid>`、`<scroll>`、`<separator>`、`<spacer>`、`<rect>` |
| 表单控件<br>10 个 | `<button>`、`<checkbox>`、`<radio>`、`<switch>`、`<input>`、`<search>`、`<textarea>`、`<select>`、`<rating>`、`<slider>` |
| 内容展示<br>16 个 | `<text>`(`wrap` / `ellipsis`)、`<image>`、`<video>`(标签 + 宿主契约,解码交给平台视频层)、`<progress>`、`<alert>`、`<tag>`、`<badge>`、`<avatar>`、`<empty>`、`<icon>`、`<spinner>`、`<skeleton>`、`<pagination>`、`<table>`、`<tree>`、`<list-item>` |
| 反馈与弹层<br>4 个 | `<dialog>`、`<drawer>`、`<toast>`、`<tooltip>`,以及 `gx/dialog` 的原生 `alert` / `confirm` / `openFile` / `saveFile` |
| 导航与菜单<br>5 个 | `<menubar>`、`<menu>`、`<menuitem>`(全局 `shortcut`)、`<tabs>`、`<tab>`、`openContextMenu(x, y, items)` |
| 媒体与自绘<br>1 个 | `<canvas>`(`onDraw(ctx)` + 7 个绘制原语) |
| 窗口<br>1 个 | `<window>`(仅作 `render()` 的根元素,可多次调用开多窗口;返回的句柄提供 `close` / `isClosed` / `title` / `setTitle` / `resize`) |

常用属性:

| 属性 | 说明 |
| --- | --- |
| `width` / `height` / `margin` | 整数像素,也接受 `"50%"` 百分比;不写则由内容决定 |
| `minWidth` / `maxWidth` / `minHeight` / `maxHeight` | 尺寸钳位 |
| `gap` / `padding` / `flexGrow` / `flexShrink` / `wrap` | 间距、内边距、主轴富余分配与收缩、`row` 折行 |
| `alignItems` / `justifyContent` | 交叉轴 / 主轴对齐 |
| `background` / `border` / `color` / `font` | 样式;颜色支持 alpha(`#rrggbbaa` / `rgba()`)与线性渐变 |
| `radius` / `shadow` / `borderWidth` / `borderStyle` | 圆角、阴影、边框宽度与虚实线 |
| `value` / `checked` / `open` | 受控组件的状态,全部由 JS 的 signal 驱动 |
| `disabled` | 沿祖先链继承;子树不响应事件也不参与焦点 |
| `zIndex` / `position` / `escapeClipping` | 层叠、绝对定位、逃逸父盒裁剪 |
| `transition` / `opacity` | 过渡动画(可动属性:`width`/`height`/`left`/`top`/`opacity`) |

::: info 继承规则:font 与 color 都沿祖先链继承
`font`(字号):元素自己的 `font` 优先,没有就取最近祖先的,再没有才是默认 16。 所以 `<button font={13}>` 的标签会按 13 号测量并绘制,不用在每个子元素上重复写。<br> `color`(文字色):同为 CSS 式继承 —— 自身 → 最近祖先 → 缺省近黑, 因此 `<button color="#fff">文字</button>` 这类写法是生效的。
:::

事件回调:`onClick`、`onMouseMove`、`onWheel`、 `onContextMenu`、`onKeyDown` / `onKeyUp`、 `onFocus` / `onBlur`、`onInput` / `onChange`、 `onClose`、`onDraw`、`onResize`(窗口级:挂布局根,载荷 `{width, height}`)。 事件沿祖先链"找第一个处理器"即停,**不冒泡**;其中 `onClick` 回调没有参数。

::: info 受控语义
所有输入类组件都不存自己的状态 —— `value` 决定显示什么,操作只派发 `onInput` / `onChange`。忘记把值写回 signal,输入框就会"打字没反应"、 滑块会"弹回原位"。这与 DOM 受控组件一致。省掉这一步的写法是双向绑定指令: `<input model={draft} />` —— 它内部就是这个 `value` + `onInput` 对,由内核接好。
:::

::: warning 平台支持
窗口后端:Windows(纯 syscall win32)、Linux(X11,Wayland 下走 XWayland)与 macOS(cocoa,0.6.0 起,purego 纯 Go 驱动 AppKit)。 输入法(IME)与原生对话框在 Windows 与 macOS 后端提供,其余平台会安全降级。
:::

## 内置模块速查:该 import 什么

`gx/*` 是**内置模块**(优先于文件系统解析),一共 16 个细分模块, 外加一个把它们合起来的聚合入口 `gox`。应用代码可以一行拿常用的那批, 库代码按细分模块导入更清楚 —— 两种写法指向的是同一份实现。

| 要做什么 | import 什么 |
| --- | --- |
| 响应式信号、异步资源 | `import { createSignal, createMemo, createResource } from "gx/solid"` |
| 建元素树、开窗口、帧回调、剪贴板、动画 | `import { h, render, requestAnimationFrame, clipboardWriteText, animate } from "gx/gfx"` |
| 多分支条件 | `import { Switch, Match } from "gx/view"` |
| 路由 | `import { createRouter, RouterView, RouterLink, useRoute } from "gx/router"` |
| 多屏 / 折叠姿态 | `import { screens, screenOf, usePosture, reportPosture } from "gx/screen"` |
| 原生消息框 / 选文件 | `import { alert, confirm, openFile, saveFile } from "gx/dialog"` |
| 本地持久化 | `import { setAppName, setStorage, getStorage } from "gx/storage"` |
| 开发期调试面板 | `import { devSnapshot } from "gx/dev"` |
| 设备信息 / 电量 / 网络 / 震动 / 亮度 | `import { deviceInfo, battery, isOnline, canIUse } from "gx/device"` |
| 前后台 / 返回键 / 分享退出 | `import { appState, onBackPress, share, exitApp } from "gx/app"` |
| 定位 | `import { getLocation, watchLocation } from "gx/geo"` |
| 拍照 / 选图 / 选视频 | `import { takePhoto, chooseImage, chooseVideo } from "gx/media"` |
| 权限 | `import { checkPermission, authorize, requestPermissions } from "gx/permission"` |
| 安全区 / 软键盘 / 分屏 | `import { insets, keyboardHeight, isSplit } from "gx/viewport"` |
| 主题与暗色模式 | `import { setTheme, toggleDark, current } from "gx/theme"` |
| 桌面自动更新 | `import { currentVersion, checkForUpdate, downloadAndInstall } from "gx/update"` |
| 懒得记模块名 | `import { h, render, createSignal, createRouter } from "gox"`(上面 16 个的并集) |

::: warning 四个最容易记错的地方
**①** `alert` / `confirm` / `openFile` / `saveFile` 在 **`gx/dialog`**, **不在 `gx/gfx`**(从后者导入现在是**编译期报错**)。<br> **②** `each` / `show` / `model` 是**元素级指令**,写在元素上、**不需要 import**; `gx/view` 只导出 `Switch` 与 `Match`。<br> **③** `gx/screen` 的 `useXxx` **返回取值函数**,要再调一次:`const r = usePosture(); r()`。<br> **④** 原生能力模块的 `useBattery()` / `useInsets()` 同样**返回取值函数**;动作型 API(拍照 / 定位)缺能力时**会 reject**,先用 `canIUse("camera")` 判断。

逐个导出、签名与调用约定见 [API 参考 · 内置模块 gx/*](/api/gx)。
:::

## 列表与条件:元素级指令

循环与显隐是**写在元素上的指令**,由 `h()` 层展开,不需要 import; 多分支用 `gx/view` 的 `Switch` / `Match`。 `<view>` 是布局透明的宿主,用它才能"列表不凭空多一层盒子"。

```js
import { Switch, Match } from "gx/view";

<view each={rows} key="id">
  {(row, i) => <text>{(i + 1) + ". " + row.title}</text>}
</view>

<view show={open}><input model={draft} /></view>
```

**属性在调用当场求值一次**,所以响应式的 `each` / `show` 要传取值函数(`each={() => rows()}`),这与受控组件的 `value` 必须传函数是同一条纪律; **子节点同理** —— ``count: {count()}`` 是一张快照, 要写 ``{() => `count: ${count()}`}``(这条没有警告)。详见 [组件参考 · 列表与条件](/components/patterns#view)。**三元 / 短路会吃掉订阅**: 订阅型读数(`useXxx()` 一族)写在首帧没走到的分支里就没建立订阅, effect 一个依赖都没有、永不重跑且无警告 —— 先无条件取一次订阅型读数再分支: `const r = useReservedRegions()(); if (!hasFold()) return "未检测到折痕"; …`; 哪些读数带订阅见 [组件参考 · 列表与条件](/components/patterns#view)。

## 路由:用 gx/router

页面切换不用自己拼 —— 内置模块 `gx/router`(2026-09-21 落地)提供路由表、 `:param` 匹配、三级守卫、历史栈、懒加载与多窗口作用域:

```js
import { createRouter, RouterView, RouterLink } from "gx/router";

const router = createRouter({
  routes: [
    { path: "/",           name: "home",   component: HomePage },
    { path: "/detail/:id", name: "detail", component: DetailPage },
  ],
  initial: "/",
});

render(
  <window title="app" width={420} height={300}>
    <column gap={8} padding={12}>
      <RouterLink to="/detail/7"><text>详情</text></RouterLink>
      <RouterView />
    </column>
  </window>
);
```

开箱就有 `Alt+←` / `Alt+→` 后退前进、`*` 兜底、 路由记录 `keepAlive: true` 保页面状态,以及半折屏下自动双栏。 桌面应用**没有 URL,也没有 history 模式** —— "历史"是内存里的一个栈。 完整手册见仓库 [docs/gui-router.md](https://github.com/14752222/Gox/blob/main/docs/gui-router.md); 三页以内、不要守卫与历史栈的小工具,用[模式手册](https://github.com/14752222/Gox/blob/main/docs/gui-patterns.md)里 "一个 signal + 页面表"的写法更省事。

## 屏幕与折叠姿态:gx/screen

配套模块 `gx/screen` 给出显示器表与窗口所在屏,并提供折叠姿态通道。 **Windows / X11 没有姿态查询 API,框架不猜姿态** —— 只提供 `reportPosture()` 上报; 没人上报就恒为平展。半折时 `RouterView` 会自动变成双栏(左栏放历史的上一条)。

## 本地持久化:gx/storage

```js
import { setAppName, setStorage, getStorage } from "gx/storage";

setAppName("my-app");                       // 决定数据落在哪个子目录,建议最先调
setStorage("theme", "dark");
const theme = getStorage("theme") ?? "light";   // 不存在返回 undefined,没有默认值参数
```

完整示例见仓库 `testdata/` 目录:计数器 `counter_demo.js`、 表单 `form_demo.js`、菜单 `menu_demo.js`、 画布 `canvas_demo.js`、滑动条 `slider_demo.js`、 多窗口 `multiwindow_demo.js`、路由 `router_demo.js` 等 **40 余个**演示脚本,每个都可直接 `gox testdata/xxx_demo.js` 运行。
