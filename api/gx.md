---
title: 内置模块 gx/*：完整导出与调用约定
description: Gox 内置模块完整参考：gx/solid 响应式、gx/gfx 界面、gx/view、gx/router 路由、gx/screen 屏幕、gx/dialog、gx/storage、gx/theme、gx/update、gx/dev 与原生能力层 gx/device/gx/app/gx/geo/gx/media/gx/permission/gx/viewport，逐个导出带签名。
---

# 内置模块 gx/*：完整导出与调用约定

## 内置模块 gx/* {#modules}

内置模块一共 **17 个**:**16 个细分模块**(按职责划分)加 **1 个聚合入口 `gox`**(16 个的并集)。 它们需要 `import`,并且**优先于文件系统解析** —— `gx/` 与 `gox` 是保留命名空间,拼错会直接报"未知模块"并列出可用模块, 不会退化成"读某个同名文件"。

下面每个模块都给出**完整导出清单 + 签名 + 返回值 + 调用约定**。 全部条目都对着 `RegisterBuiltinModule` 的注册表核过, 并用真实运行时枚举了一遍(`Object.keys(import * as ns)`)。

### 模块地图与导入路径 {#m-map}

| 模块 | 导出数 | 管什么 | 平台 |
| --- | --- | --- | --- |
| `gox` | 146 | 聚合入口:下列 16 个模块导出的**并集** | — |
| `gx/solid` | 8 | 响应式原语(信号 / 副作用 / 派生值 / 异步资源 / 生命周期) | 全平台 |
| `gx/gfx` | 7 | 元素树构造、窗口挂载、帧回调、补间动画、剪贴板、右键菜单 | 需要窗口后端 |
| `gx/view` | 2 | 多分支条件(`Switch` / `Match`) | 全平台 |
| `gx/router` | 7 | 路由:路由表 / 参数匹配 / 守卫 / 历史栈 / 懒加载 / 多窗口作用域 | 全平台 |
| `gx/screen` | 17 | 显示器枚举、窗口几何、折叠姿态与折痕 | 枚举需后端;姿态靠上报 |
| `gx/dialog` | 3 | 原生系统对话框 | Windows / macOS 原生;Linux 降级 |
| `gx/storage` | 7 | 应用级键值持久化 | 全平台 |
| `gx/dev` | 1 | 开发期只读快照(帧 / 缓存 / 树 / 警告) | 全平台 |
| `gx/theme` | 3 | 主题切换与暗色模式(`setTheme` / `toggleDark` / `current`) | 全平台 |
| `gx/update` | 4 | 桌面自动更新(`currentVersion` / `checkForUpdate` / `downloadAndInstall` / `cleanupBackup`) | 桌面 |
| `gx/device` | 24 | 设备信息、电量、网络、震动、屏幕亮度与常亮、打开系统设置页 | 部分需宿主 |
| `gx/app` | 14 | 前后台状态、内存告警、返回键、分享、退出、屏幕方向 | 需宿主 |
| `gx/geo` | 10 | 定位(取一次 / 持续监听)、两点距离 | 需宿主;桌面报 unavailable |
| `gx/media` | 8 | 拍照、选图 / 选视频、保存图片、预览 | 需宿主;桌面报 unsupported |
| `gx/permission` | 10 | 权限查询 / 申请 / 打开应用设置页 | 需宿主 |
| `gx/viewport` | 21 | 安全区、软键盘、分屏与多窗口形态、宽度档 | 靠宿主上报 |

#### 选哪条导入路径

```js
// 应用代码:一行拿到常用的那批
import { h, render, createSignal, createRouter, RouterView } from "gox";

// 库代码 / 想精确表达依赖:用细分模块
import { h, render } from "gx/gfx";
import { createSignal } from "gx/solid";
```

- `gox` 不是一个新模块,只是并集 —— 每个名字的实现唯一(来自它所属的细分模块), 混用两种写法不会产生两个副本,也不会冲突(导出名跨模块无重名)。
- 拆出细分模块的意义是可读性与分层:一眼看出这个文件依赖界面、响应式还是存储。
- 无头宿主(没链接 GUI 后端的构建)里 gx/gfx 之类不存在, gox 的并集会自动退化成宿主实际提供的那部分,不会因此报错。

### 不在 gx/* 里的东西(最容易找错的地方) {#m-not-here}

| 你想找的 | 实际在哪 | 怎么用 |
| --- | --- | --- |
| `model` / `each` / `show` | `h()` 层的**元素级指令** | 写在元素上,如 `<input model={draft} />`、`<view each={rows}>`。**不 import,也不在任何导出表里** |
| `obs` / `computed` / `ever` / `once` | **全局函数**(GetX 风格) | 直接调用,见 [§8](/api/gx#reactive-globals) |
| `fs` / `path` / `process` / `http` / `fetch` / `console` | **全局宿主模块** | 直接调用,见 [§6](/api/host) |
| `alert` / `confirm` / `openFile` | **`gx/dialog`** | `import { alert } from "gx/dialog"`。**注意:它们不在 `gx/gfx` 里** —— 从 `gx/gfx` 取会得到 `undefined` |
| `createSignal` 家族 | `gx/solid` | 见 [gx/solid](/api/gx#m-solid) |
| `<window>` / `<column>` 等元素 | JSX 内置标签,由 `gx/gfx` 的 `h` 解析 | 见[组件参考](/components/) |

::: warning 三个最容易记错的点
**①** `alert` / `confirm` / `openFile` 只在 `gx/dialog`; `gx/gfx.alert` 是 `undefined`。<br> **②** `gx/view` **只导出 `Switch` 与 `Match`** —— 列表与显隐是元素级指令 `each` / `show`,不在这个模块里。<br> **③** `gx/screen` 的 `useXxx` **返回一个取值函数,要再调一次**:`const r = usePosture(); r()`。 详见下面 gx/screen 一节。
:::

### gx/solid — 响应式原语 {#m-solid}

```js
import {
  createSignal, createEffect, createMemo, createResource,
  onMount, onCleanup, untrack, devStats,
} from "gx/solid";
```

| 导出 | 签名 / 返回 | 说明 |
| --- | --- | --- |
| createSignal | (initial) => [get, set] | 创建信号。`get()` 读值**并登记依赖**;`set(v)` 或 `set(prev => v)` 写值。新旧值 `===` 相同则不通知订阅者 |
| createEffect | (fn) => dispose | **立即执行一次** `fn`,执行期间读到的 getter 成为依赖;依赖变化时重跑,**每轮重新收集依赖**(上轮不再被引用的依赖退订)。返回值是注销函数 |
| createMemo | (fn) => getter | 惰性派生值:依赖变化只标脏,**下次读取时才重算**。下游读 memo 同样会被记为依赖 |
| createResource | (fetcher) => [data, res] | 异步资源。见下方专表 |
| onMount | (fn) => void | 本代子树挂载后执行一次 |
| onCleanup | (fn) => void | 本代子树被替换 / 销毁时执行 —— 用来收定时器、解绑回调 |
| untrack | (fn) => value | 在**不登记依赖**的前提下执行 `fn` 并返回其结果。路由内部就靠它调页面组件,避免"页面体里读的信号变成路由 effect 的依赖"。**参数必须靠闭包捕获**:取值函数用零参调用拿到的那个,转发包装层不要把自己的形参再传一遍 |
| devStats | () => object | 开发期统计(信号数 / 订阅数等);也出现在 `devSnapshot().solid` 里 |

**createResource 的契约**(与 Solid 有几处刻意不同,属公共 API 承诺):

| 成员 | 取值 |
| --- | --- |
| `data()` | `undefined`(从未成功过 / pending) \| 成功值 \| 上一次的值(refreshing / error 期间) |
| `res.state()` | `"pending"` \| `"ready"` \| `"refreshing"` \| `"error"` |
| `res.error()` | 仅 error 态有值,其余为 `undefined` |
| `res.refetch()` | 重取(保留旧值显示,即 refreshing) |

- controls 必须写成第二个元素:const [data, res] = createResource(f)。 引擎不支持数组解构里嵌对象模式,所以不要照抄 Solid 的 const [data, { refetch }] = …。
- error 态下 `data()` 不抛异常:返回上一次的值(从未成功过则 undefined),错误只从 res.error() 读。 这样做是因为 v1 没有 ErrorBoundary,抛出去会冒泡进任意 effect。
- state() / error() 不挂在 data 函数上 (本引擎函数值不带属性),都在 res 上。
- fetcher 返回非 Promise(同步值)时按"立即可用"处理;不做 source signal 自动重取,需要联动就用 createEffect 手动串。
- 连续性有保证:每次取数递增 token,回来的响应 token 不符直接丢弃(latest-wins),快速连点 refetch 不会让旧响应盖掉新状态。

```js
import { createSignal, createEffect, createMemo, createResource } from "gx/solid";

const [count, setCount] = createSignal(0);
const dispose = createEffect(() => console.log("count is", count()));  // 立即跑一次
setCount(5);                       // → count is 5
setCount(v => v + 1);              // setter 也接受更新函数
dispose();                         // 注销这个 effect

const doubled = createMemo(() => count() * 2);
setCount(10);
console.log(doubled());            // 20(惰性:读的时候才算)

const [user, res] = createResource(async function () {
  const r = await fetch("https://example.com/me");
  return await r.json();
});
// res.state(): "pending" → "ready"
// 失败后 data() 仍是上一次的值,错误读 res.error()
```

::: info 同一个 effect 里既读 signal 又读它的 memo ⇒ 每轮只跑一次
该 effect 同时经两条路订阅了同一次变更(直接订阅 signal + 经 memo 的 cell),引擎按"一趟通知" 去重:先把链上 memo 标脏,再跑 effect。2026-09-24 之前的版本每轮会跑两次,症状是"计数类断言 多了一倍";现在只跑一次,且读到的 memo 值必然已是新的。
:::

### gx/gfx — 界面与窗口 {#m-gfx}

```js
import {
  h, render, requestAnimationFrame,
  clipboardReadText, clipboardWriteText,
  animate, openContextMenu,
} from "gx/gfx";
```

| 导出 | 签名 / 返回 | 说明 |
| --- | --- | --- |
| h | (tag, props, ...children) => node | 创建元素。JSX 编译后就是它,所以**用了 JSX 的文件必须 import**(哪怕一次都没显式调用) |
| render | (vnode, config?) => 窗口句柄 | 挂载元素树并开窗口。**可多次调用 = 多窗口**。三种形态见下 |
| requestAnimationFrame | (fn) => id | 以 ~60fps 帧间隔把回调挂到事件循环(内部就是 16ms 定时器)。也用来让事件泵保持醒着(驱动光标闪烁) |
| clipboardReadText | () => string | **同步**读剪贴板;读不到返回空串,不抛异常 |
| clipboardWriteText | (text) => boolean | **同步**写剪贴板;失败返回 false |
| animate | 两种形态,返回 cancel 函数 | `animate(node, prop, to, ms)` 让某节点的某属性动到目标值;`animate(from, to, ms, onUpdate, onDone)` 自己拿插值。**声明式过渡走 `transition` prop,不经这个函数** |
| openContextMenu | (x, y, items) => void | 就地弹出右键菜单。这是**数据式 API,不是 `contextMenu` prop**(同一个 JSX 元素只能有一个宿主) |

#### render 的三种形态

```js
// ① JSX:窗口配置写在根元素属性上(最常用)
render(<window title="Counter" width={400} height={300}>...</window>);

// ② h() 手拼树:窗口配置作为第二个参数
render(h("column", { gap: 10 }, ...), { title: "Slider demo", width: 260, height: 260 });

// ③ 省略配置:用缺省 Gox 400x300
render(h("text", null, "hello"));
```

返回的**窗口句柄**提供 `close()` / `isClosed()` / `title()` / `setTitle(t)` / `resize(w, h)`, 详见[组件参考 · 多窗口](/components/modules#multiwindow)。

#### 剪贴板是同步 API

```js
const ok = clipboardWriteText(text());
const s  = clipboardReadText();        // 读不到是空串
```

脚本与窗口在**同一个 OS 线程**,直接调原生 API 就是正确的线程,不需要 `await`。后端不支持时静默降级(写返回 `false`、读返回空串)。

::: warning 原生对话框不在这个模块里
`alert` / `confirm` / `openFile` 由 **`gx/dialog`** 导出。 从 `gx/gfx` 取会得到 `undefined`。
:::

### gx/view — 多分支 {#m-view}

```js
import { Switch, Match } from "gx/view";
```

| 导出 | 签名 | 说明 |
| --- | --- | --- |
| Switch | `({fallback?}, ...<Match/>)` | 取声明序里第一个 `when` 为真的分支;都不真用 `fallback` |
| Match | ({when}, ...children) | 单个分支;`when` 要传**函数**。**只在 Switch 里有意义** —— 挂到别处会渲染成一行 `[view Match]` 文本(误用可见,不静默) |

::: info 这个模块为什么只有两个导出
列表(`each`)与显隐(`show`)是**元素级指令** —— 写在元素上、由 `h()` 展开,不需要 import。只有"多分支"没有对应的元素语义, 所以留成了组件。用法见[组件参考 · 列表与条件](/components/patterns#view)。
:::

### gx/router — 路由 {#m-router}

```js
import { createRouter, RouterView, RouterLink, lazy, useRoute, useRouter, useRouteState } from "gx/router";
```

| 导出 | 说明 |
| --- | --- |
| `createRouter({routes, initial, backKeys, foldable})` | 建路由器。路由记录字段:`path` / `name` / `component` / `children` / `meta` / `redirect` / `props` / `beforeEnter` / `keepAlive` / `dualPane` |
| `<RouterView />` | 当前路由的挂载点;可传 `loading` / `error` 分支与 `scope`(显式作用域,一个窗口里放两套独立导航) |
| `<RouterLink to="…" />` | 导航链接;`to` 收路径串或 `{name, params}`(一律按**绝对路径**解析) |
| `router.push / replace / back / forward / go` | 导航,均返回 Promise(`{ok, route}`,被守卫拦下是 `{ok:false, reason}`) |
| `useRoute() / useRouter() / useRouteState()` | 页面体内取当前路由 / 路由器 / 挂在历史栈项上的状态袋 |
| `lazy(() => import(…))` | 懒加载页面模块。**推荐显式包一层** —— 不包的话首次进入拿不到组件级守卫 |

```js
import { createRouter, RouterView, RouterLink } from "gx/router";

const router = createRouter({
  routes: [
    { path: "/",           name: "home",   component: HomePage },
    { path: "/list",       name: "list",   component: ListPage, keepAlive: true },
    { path: "/detail/:id", name: "detail", component: DetailPage },
    { path: "*",           name: "nf",     component: NotFound },
  ],
  initial: "/",
});

render(
  <window title="app" width={480} height={360}>
    <column gap={8} padding={12}>
      <RouterLink to="/list"><text font={13}>列表</text></RouterLink>
      <RouterView />
    </column>
  </window>
);
```

- 没有 URL,也没有 history 模式:桌面应用没有地址栏,"历史"是内存里的一个栈;deep-link 用 process.argv 解析后传给 initial。
- 正则路径约束 / alias 不做,参数校验写在 beforeEnter 里。
- 状态保留两档:路由记录 keepAlive: true 保住整棵子树(滚动位置 / 焦点 / 草稿),useRouteState() 只存值。保活页常驻内存,只给真正需要的页开。
- 默认绑定 Alt+← / Alt+→;实现是包装根节点脚本自己的 onKeyDown(两层都跑),backKeys: false 可关。
- 多窗口是**作用域**:窗口自动作用域是 `win:N`;`<RouterView scope="x">` 用具名作用域,此时句柄指认不到它,要用 `router.sync([wa, "x"])`。
- 完整手册:docs/gui-router.md(含 createRouter 全部选项与守卫表)。

### gx/screen — 屏幕与折叠姿态 {#m-screen}

```js
import {
  screens, primaryScreen, screen, screenOf,
  useScreen, useScreens, windowInfo, useWindowInfo,
  posture, usePosture, hinge, regions, platform,
  reportPosture, resetDisplays, onDisplayChange, offDisplayChange,
} from "gx/screen";
```

::: warning 调用约定:useXxx 返回的是取值函数,要再调一次
`screens()` / `posture()` 这类是**直接读数**; 而 `useScreen()` / `useScreens()` / `usePosture()` / `useWindowInfo()` **返回一个取值函数**,并且只有调用那个取值函数才会登记依赖:

```js
const getPosture = usePosture();      // ← 拿到取值函数
<text>{() => getPosture()}</text>      // 姿态一变,这行文本跟着变
```

设计动机:显示器表结构较大,做成整表 signal 不划算,于是用"版本号 + 取值函数"的组合 —— 取值函数每次调用都重读当前状态并订阅版本号,与 `useRoute()` 同构。
:::

| 导出 | 签名 / 返回 | 说明 |
| --- | --- | --- |
| screens | () => Display[] | 全部显示器 |
| primaryScreen | () => Display | 主显示器 |
| screen | (id) => Display \| null | 按 id 取一块屏;找不到返回 `null` |
| screenOf | (win?) => Display \| null | **窗口所在**的显示器。`win` 省略 = 最近挂载的窗口;没有窗口时返回 `null` |
| useScreen | (win?) => **getter** | `screenOf` 的响应式版 |
| useScreens | () => **getter** | `screens()` 的响应式版 |
| windowInfo | (win?) => object | 窗口尺寸 / 缩放 / 所属屏的直接读数,字段见下 |
| useWindowInfo | (win?) => **getter** | 同上,响应式 |
| posture | (win?) => string | 折叠姿态:`"flat"` / `"half-open"` / `"folded"` / `"unknown"` |
| usePosture | (win?) => **getter** | 同上,响应式 |
| hinge | (win?) => object \| null | 折痕矩形 `{x, y, width, height, orientation}`;没有折痕时 `null` |
| regions | (win?) => array | 折叠分段面板 `[{id, x, y, width, height}]` |
| platform | () => string | 窗口后端名:`"win32"` / `"x11"` / `"cocoa"` / `"headless"` |
| reportPosture | (opts) => undefined | **宿主 / 模拟器上报**姿态。收 opts 对象、返回 `undefined` —— 与 `posture()` 是两条不同的路 |
| resetDisplays | () => undefined | 清掉上报覆盖,回退到后端枚举结果 |
| onDisplayChange | (fn) => off() | 订阅显示器 / 姿态变化;**返回值就是注销函数**(可重复调用),也可以用 `offDisplayChange(fn)` |
| offDisplayChange | (fn) => undefined | 按回调函数注销 |

#### Display 对象的字段

| 字段 | 说明 |
| --- | --- |
| id / name | 显示器标识(如 `\\.\DISPLAY1`;上报的自定义屏就是上报时给的名字,如 `"fold-0"`) |
| x / y / width / height | 整块屏的几何(虚拟桌面坐标,副屏可能是负数) |
| workX / workY / workWidth / workHeight | 工作区(扣掉任务栏) |
| scale | 每屏 DPI 缩放 |
| primary | 是否主屏 |
| foldable | 是否折叠设备 |
| posture | 折叠姿态字符串 |
| hinge | 折痕矩形或 `null` |
| regions | 分段面板数组 |

#### windowInfo() 的字段

```js
// {width, height, scale, screenWidth, screenHeight, workWidth, workHeight, screenId, platform}
const info = windowInfo();
console.log(info.width, info.screenWidth, info.screenId, info.platform);
```

#### reportPosture(opts) 的字段

| 字段 | 说明 |
| --- | --- |
| display | 目标显示器 id。**省略则作用于当前窗口所在的那块屏**(再退化为第一块) |
| posture | `"flat"` / `"half-open"` / `"folded"`。 大小写与空格不敏感,`halfopen` / `half_open` 也认; **不认识的字符串会被归一成 `"unknown"`** 而不是报错 |
| foldable | 是否折叠设备。不传但报了非 `flat` 姿态时自动置 `true` |
| width / height | 屏尺寸(上报自定义屏时用;已存在的屏不传则保持原值) |
| hinge | `{x, y, w, h, orientation}` —— **注意这里是 `w` / `h`** |
| regions | `[{id, x, y, width, height}]` |

::: warning 写入用 w/h,读出是 width/height
`reportPosture` 的 `hinge` 读 `w` / `h`,而 `hinge()` 读出来的是 `width` / `height`。 把读出的对象直接喂回去会得到一块 0 宽的折痕 —— 这是最容易踩的一处命名不一致。
:::

- 桌面后端没有姿态查询 API(Windows 无 WinRT ⇒ 零 cgo 不可达),框架不猜姿态: 只提供上报通道,没人上报就恒为平展。
- 折痕不随姿态清除:折痕是设备几何,不是姿态的属性。回到 flat 时折痕留着, 否则"折回去再折回来"分栏比例会变成 0.5。是否分栏由姿态决定,折痕只决定"怎么分"。
- 上报一块表里没有的屏时:第一次上报且后端枚举为空 ⇒ 换掉整张表(宿主的显示环境由它定义); 已经有过上报或后端能枚举 ⇒ 追加一块。
- 分割比例的分母是显示器长度,不是折痕长度。
- 半折时 `<RouterView>` 自动变双栏(左栏放历史的上一条),见 gx/router。

```js
import { reportPosture, resetDisplays, screenOf, posture, hinge, usePosture } from "gx/screen";
import { createMemo } from "gx/solid";

// 宿主上报:先问"窗口在哪块屏",再报那块屏的姿态
const wa = render(<window title="A">...</window>);
reportPosture({
  display: screenOf(wa).id,
  foldable: true,
  width: 2000,
  posture: "half-open",
  hinge: { x: 980, y: 0, w: 40, h: 1400, orientation: "vertical" },   // ← w / h
});

console.log(posture(wa));        // "half-open"
console.log(hinge(wa));          // { x:980, y:0, width:40, height:1400, orientation:"vertical" }

// 响应式:useXxx() 先拿到取值函数,再放进函数 prop / 函数子节点
const getPosture = usePosture(wa);
const folded = createMemo(() => getPosture() === "half-open");

resetDisplays();                 // 撤销上报,回到后端枚举
```

### gx/dialog — 原生系统对话框 {#m-dialog}

```js
import { alert, confirm, openFile } from "gx/dialog";
```

| 导出 | 返回 | 说明 |
| --- | --- | --- |
| alert(msg, title?) | `Promise<void>` | 系统消息框,只有一个"确定" |
| confirm(msg, title?) | `Promise<boolean>` | 确定 / 取消,返回用户选择 |
| openFile({title, filter}) | `Promise<string \| null>` | 系统"打开文件"对话框;**取消返回 null,不抛异常** |

`filter` 是 `{name, pattern}` 数组, pattern 里多个通配符用 `;` 分隔。

```js
import { confirm, openFile } from "gx/dialog";

// 事件处理器的两种写法都可以: async function () {} 与 async () => {}
h("button", {
  onClick: async function () {
    const yes = await confirm("Proceed with the operation?", "Please confirm");
    log("confirm -> " + (yes ? "yes" : "no"));
  }
}, "Confirm");

h("button", {
  onClick: async function () {
    const p = await openFile({
      title: "Pick a file",
      filter: [
        { name: "Text files", pattern: "*.txt;*.md" },
        { name: "All files", pattern: "*.*" }
      ]
    });
    log(p === null ? "cancelled" : "picked " + p);
  }
}, "Open file");
```

- 只有这三个 API:无自定义按钮、无多选、无选目录。
- 模态期间界面仍会重绘(系统替我们泵消息),但不派发任何 JS 回调。
- 非 Windows 后端会降级:内容打到 stderr 并立即返回 —— confirm 取 true、openFile 取 null(视作已取消)。
- 这个模块不依赖元素树,只依赖"当前有没有窗口",所以从 gx/gfx 拆了出来。

### gx/storage — 本地持久化 {#m-storage}

```js
import {
  setAppName, appDataDir, setStorage, getStorage,
  removeStorage, clearStorage, getStorageInfo,
} from "gx/storage";
```

| 导出 | 返回 | 说明 |
| --- | --- | --- |
| setAppName(name) | void | 指定应用名(数据目录的一段);**推荐在任何 storage 调用前先调** |
| appDataDir() | string | 数据目录绝对路径(`UserConfigDir/Gox/<appName>`) |
| setStorage(key, value) | void | 写入。value 只能是纯数据(对象 / 数组 / 标量);**写穿透立即落盘** |
| getStorage(key) | value | 读回。**不存在返回 `undefined`,并且没有"默认值参数"** —— 要默认值自己写 `?? fallback` |
| removeStorage(key) | void | 删一个键 |
| clearStorage() | void | 清空 |
| getStorageInfo() | {keys, currentSize, limit} | 键列表与字节数;`limit` 恒 -1(v1 不做配额) |

```js
import { setAppName, setStorage, getStorage, getStorageInfo } from "gx/storage";

setAppName("my-app");              // → %APPDATA%/Gox/my-app (Linux: ~/.config/Gox/my-app)
setStorage("theme", "dark");
setStorage("profile", { name: "gox", level: 3 });   // 对象也行,序列化后整存整取

const t = getStorage("theme");         // "dark";首次运行为 undefined
const theme = t ?? "light";            // ← 默认值要自己兜,getStorage 没有第二参数
console.log(getStorageInfo());         // { keys, currentSize, limit }
```

- 全部同步 API,无 Promise —— 本地小文件读写,不需要异步仪式。
- 单文件 storage.json 整读整写,临时文件 + rename 原子替换;文件损坏按空存储处理并打告警,应用照常起。
- 存函数 / 循环引用会在写入时抛 TypeError(而不是静默存成 null 读不回来)。
- GOX_STORAGE_DIR 环境变量可整体替换根目录(测试隔离 / 便携部署)。

### gx/dev — 开发期快照 {#m-dev}

```js
import { devSnapshot } from "gx/dev";
const snap = devSnapshot();
```

| 字段 | 内容 |
| --- | --- |
| `snap.frame` | `{count, full, partial, fullRatio}` —— 帧数与整帧 / 局部占比 |
| `snap.imageCache` | `{size, cap, hits, misses, evicts}` |
| `snap.glyphCache` | `{size, cap, hits, misses, evicts}` |
| `snap.tree` | `{windows, nodes, depth}` |
| `snap.solid` | `{effects}` —— 存活 effect 数;gx/solid 未注册时为 `-1` |
| `snap.warnings` | `[{at, text}]` —— 最近若干条内核警告(含未知标签与指令误用的去重警告) |

- 拉取式:不推送,面板自己用 setInterval 拉(示例 1s)。 别用 `requestAnimationFrame` —— 会和真实渲染抢帧。
- 一次调用返回整棵 JSON 形状的纯对象,构建在调用线程内联完成(脚本线程就是 GUI 线程)。
- 字段名是 API,结构有专门用例锁住,可以放心当数据源用。
- 生产零成本:不 import 就没有这条代码路径(模块惰性构建)。
- 可运行的调试面板见演示脚本 testdata/dev_panel_demo.js。

```js
import { devSnapshot } from "gx/dev";

setInterval(() => {
  const s = devSnapshot();
  console.log(
    "frames:", s.frame.count,
    "整帧率:", Math.round(s.frame.fullRatio * 100) + "%",
    "字形缓存:", s.glyphCache.size + "/" + s.glyphCache.cap,
    "节点:", s.tree.nodes,
    "effect:", s.solid.effects,
  );
  if (s.warnings.length) console.log("最近警告:", s.warnings[s.warnings.length - 1].text);
}, 1000);
```

### 原生能力层 — gx/device · gx/app · gx/geo · gx/media · gx/permission · gx/viewport {#m-native}

六个模块(共 87 个导出)共用**同一个宿主契约**，不是六套机制。调用形态只有三种： **拉取型**(同步读返回值)、**动作型**(`await`，失败 reject)、 **上报型**(宿主主动告知，`useXxx()` 响应式刷新)。

```js
import { deviceInfo, battery, isOnline, canIUse } from "gx/device";
import { getLocation, watchLocation } from "gx/geo";
import { takePhoto } from "gx/media";

console.log(deviceInfo().platform, battery().level, isOnline());   // 拉取型 / 上报型

if (canIUse("camera")) {                     // 事前判断，不要靠 catch 兜底
  const photo = await takePhoto({ count: 1 });
}

const stop = watchLocation((loc) => console.log(loc.latitude, loc.longitude));
try {
  await getLocation({ highAccuracy: true });
} catch (e) {
  if (e.errCode === "permission-denied") console.warn(e.message);
}
```

#### 缺能力时不软降级 —— 八个统一错误码

| 错误码 | 含义 |
| --- | --- |
| `unsupported` | 宿主没实现这个能力—— `canIUse()` 会是 `false`，应该事前判断而不是靠 catch 兜底 |
| `permission-denied` | 用户或系统拒了权限(可提示去设置页开) |
| `cancelled` | 用户在系统 UI 里主动取消 —— **它不是失败** |
| `timeout` / `busy` / `unavailable` | 宿主没回填 / 上一次还没结束 / 设备当前不可用(飞行模式下定位、没有相机硬件) |
| `platform-error` | 原生侧报错，细节在 `errMsg` 里(不要解析，只用于显示) |
| `invalid-arg` | 参数不合法(比如 `count` 为负) |

- 异常对象同时带 errCode+errMsg(判断用)与 name+message(打印用)，都是普通对象(当 Error 用也能读 .message)。
- 拉取型对象名是 `<能力>.<动作>`(例如 `camera.takePhoto`)，能力 ID 就是第一个点之前那段 —— `canIUse` 的判据也是它。

#### gx/device — 设备信息与系统状态(24 个导出)

```js
import {
  deviceInfo, useDeviceInfo, deviceId,
  battery, useBattery, isCharging, onBatteryChange, offBatteryChange,
  network, useNetwork, isOnline, onNetworkChange, offNetworkChange,
  vibrate, vibrateShort, vibrateLong,
  keepScreenOn, getBrightness, setBrightness, openSystemSettings,
  canIUse, capabilities, reportBattery, reportNetwork,
} from "gx/device";
```

| 导出 | 说明 |
| --- | --- |
| deviceInfo() / useDeviceInfo() / deviceId() | 平台 / 系统 / 机型 / 设备 ID / 区域 / 屏幕等;宿主未覆盖的字段取本机缺省值 |
| battery() / useBattery() / isCharging() | 电量与充电状态。**上报型** —— 没人上报时是 `{supported: false}` 这种明确的缺省值，不是错误 |
| network() / useNetwork() / isOnline() | 连接类型与在线状态;同为上报型 |
| vibrate(ms?) / vibrateShort() / vibrateLong() | 震动;桌面软降级(不报错) |
| keepScreenOn(on) / getBrightness() / setBrightness(v) | 屏幕常亮开关、亮度读写 |
| openSystemSettings(kind) | 打开系统设置页;`kind` 词表共 11 项(含 `privacy`),桌面上 10 项有 URI 映射 |
| canIUse(cap) / capabilities() | 能力判断与清单。判据依次是“宿主声明过 → 有对应内置模块 → 有对应原生注册”，因此声明与实现不一致时会说谎 |
| onBatteryChange / onNetworkChange(fn) | 订阅变化,返回取消函数;`offXxx(fn)` 亦可 |
| reportBattery(o) / reportNetwork(o) | **上报口**(宿主 / 模拟器 / 测试):桌面没有真设备时靠它驱动响应式刷新 |

#### gx/app — 应用生命周期(14 个导出)

```js
import {
  appState, useAppState, onAppStateChange, offAppStateChange,
  onMemoryWarning, offMemoryWarning, onBackPress, offBackPress,
  share, exitApp, setOrientation,
  reportAppState, reportMemoryWarning, reportBackPress,
} from "gx/app";
```

- appState() / useAppState():"active" / "background" / "inactive"(词表已归一化)。
- onBackPress(fn):返回键。回调返回真值 = 已处理，宿主据此决定要不要关界面。
- share(opts) / exitApp() / setOrientation(o):分享、退出、屏幕方向(桌面宿主未实现后者)。
- 三个 reportXxx 是上报口；onBackPress 在“脚本返回真值”与“宿主主动上报”两种通道下的优先级有专用用例锁住。

#### gx/geo — 定位(10 个导出)

```js
import {
  getLocation, watchLocation, clearWatch, clearAllWatches,
  lastLocation, useLastLocation, hasLocation,
  distanceBetween, locationPlatform, reportLocation,
} from "gx/geo";
```

- getLocation(opts) 取一次，watchLocation(fn) 持续监听并返回停止函数(宿主进程级会话,clearAllWatches() 一次清完)。
- lastLocation() / hasLocation() 读最近一次得到的位置；distanceBetween(a, b) 走 haversine，返回米。
- 桌面上“没有定位”是诚实的缺失：getLocation() 报 unavailable，而不是编一个坐标出来。

#### gx/media — 相机与相册(8 个导出)

```js
import {
  takePhoto, chooseImage, chooseOneImage, chooseVideo,
  saveImage, previewImage, mediaInfo, humanSize,
} from "gx/media";
```

- takePhoto({count}) / chooseImage({count}) 多张时返回数组，chooseOneImage() 只要一张（返回单个对象）。
- 用户取消走 cancelled 错误码( 不是 null )，与 gx/dialog.openFile 的取消语义不同的原因在这里。
- mediaInfo() 列举当前平台可用的能力；humanSize(bytes) 是纯函数(字节数 → 可读字符串)。

#### gx/permission — 权限(10 个导出)

```js
import {
  checkPermission, authorize, requestPermissions, openAppSettings,
  getSetting, permissionState, permissionKinds,
  onPermissionChange, offPermissionChange, reportPermission,
} from "gx/permission";
```

- checkPermission(kind) 查状态，authorize(kind) 申请单个，requestPermissions(kinds) 批量，openAppSettings() 跳到应用设置页。
- permissionKinds() 给出平台词表(宿主可报的权限类型)。
- onPermissionChange(fn) 订阅状态变化(用户去设置页开完回来会触发)。

#### gx/viewport — 安全区 / 键盘 / 分屏(21 个导出)

```js
import {
  viewport, useViewport, insets, useInsets,
  keyboardHeight, useKeyboardHeight, keyboardVisible,
  contentArea, safeAreaStyle,
  widthClass, isCompactWidth, isTabletLayout,
  multiWindow, useMultiWindow, isSplit, splitInfo,
  onViewportChange, offViewportChange, reportViewport, resetViewport,
  viewportModes,
} from "gx/viewport";
```

- 与 `gx/screen` 分工:前者答“我这台设备是什么样”(显示器 / 姿态 / 折痕)，后者答“我这个窗口被怎么摆”(安全区 / 键盘 / 分屏)。
- insets() / keyboardHeight() / splitInfo() 全部靠宿主上报，桌面拿不到这些值(默认全 0 / 非分屏)。
- useInsets() / useViewport() 同样返回取值函数，要再调一次。
- safeAreaStyle(v, withKeyboard?) 直接给出可用于 padding 的四边值；第二个参数为 true 时把键盘高度也算进下边距。

#### 桌面上的行为(不要把它当移动端用)

- 能真实给出的就给真值:电量、网络、亮度、屏幕常亮、打开系统设置页、震动(软降级)。
- 给不出的一律明说:相机 / 定位 / 相册 / 权限reject 报 unsupported 或 unavailable，不返回假数据。
- 移动端接入时只需实现同一个宿主契约(新增能力 = 内核加一个方法名 + 宿主加一个分支)，不必改内核。语义与用法详见 GUI 开发指南 §9.6。

### 模块层常见误用速查 {#m-pitfalls}

| 现象 | 原因与解法 |
| --- | --- |
| 用了 JSX 但窗口起不来,报 `h is not defined` | **已在框架里修掉(2026-09-22)**:JSX 仍是降级成 `h(...)` 调用,但文件里没有 `h` 时编译器会自动补 `import { h } from "gx/gfx"`。显式写 `import { h, render } from "gx/gfx"` 仍推荐、也仍优先,自己定义/导入的 `h` 不会被顶掉。老引擎上手动加那一行即可 |
| `alert is not a function` / 拿到 `undefined` | 从 `gx/gfx` 取了 —— `alert` / `confirm` / `openFile` 在 **`gx/dialog`**(或直接用 `gox` 聚合)。命名导入取不到时只会静默拿到 `undefined`,所以**现在从内置模块 import 不存在的名字是编译期报错**,并会指出它在哪个模块 / 是不是拼错 |
| `usePosture()` 拿到的不是字符串 | 这是设计:所有 `useXxx()` 返回的都是**取值函数**(信号语义,放进函数 prop / 函数子节点才会跟着变),再调一次:`const r = usePosture(); r()`。只要"此刻的值"就用 `posture(win)`(返回字符串)。别把它直接当字符串比 —— 恒为 false 且不报错 |
| `each` / `show` 从 `gx/view` 里 import 不到 | 这是设计:它们是**元素级指令**(写在 JSX 属性上、在 `h()` 里展开),**不在任何模块的导出表里**;`gx/view` 只导出 `Switch` / `Match`。误 import 现在编译期报错 |
| `const [data, {refetch}] = createResource(f)` 不起作用 | **已在框架里修掉(2026-09-22)**:嵌套解构(数组里套对象)当年是 parser 的 bug,现在直接可写。等价写法 `const [data, res] = createResource(f)` + `res.refetch()` 照旧可用 |
| 折叠双栏不生效 | 这是设计:Windows / X11 没有折叠姿态查询 API,**没人上报 ⇒ 姿态恒为 `flat`** ⇒ 不分栏。宿主侧调 `reportPosture`;排查第一步用 `posture(win)` 确认读到的是 `"half-open"`,三步排查见 GUI 路由手册 §9.2 |
| 折痕宽度读出来是 0 | **已在框架里修掉(2026-09-22)**:`hinge()` / `regions()` 的输出用 `width/height`,而 `reportPosture` 的入参历史上只读 `w/h` ⇒ 回填时静默读成 0(只影响分栏比例,什么都不报)。现在**两种拼法都认**(短名优先),`reportPosture({ hinge: hinge() })` 可以直接写 |

::: tip 标注"已在框架里修掉"的四条
JSX 缺省工厂、缺名导入、嵌套解构、折痕键名这四件事都修在了内核里(parser / compiler / `gx/screen`), 换成新版引擎后不必再按"解法"那栏绕行;文档与手册里其它地方若还写着"必须自己 import `h`""嵌套解构不支持",以本表为准。
:::

## 响应式全局 API {#reactive-globals}

除 `gx/solid` 的信号体系外,全局还提供一套 Dart GetX 风格的响应式原语, **无需 import**。

| API | 签名 | 说明 |
| --- | --- | --- |
| obs | (value) => obsValue | 创建可观察值,读写走 `.value` |
| computed | (fn) => obsValue | 由其它 obs 派生的计算值,依赖变化时自动重算 |
| ever | (obs, fn) | 持续订阅,每次变化都回调;**订阅时立即以当前值回调一次** |
| once | (obs, fn) | 只在下一次变化时回调一次 |

```js
let count = obs(0);
ever(count, v => console.log("count =", v));   // 先打印 count = 0

count.value = 1;
count.value = 2;
count.value = 2;    // 值未变化,不触发通知
```

```text
count = 0
count = 1
count = 2
```

::: tip 两套响应式怎么选
写界面用 `gx/solid` 的 `createSignal` —— 它与渲染层的 依赖追踪直接对接([组件参考 · 响应式](/components/patterns#reactive))。 `obs` 这套更适合纯数据流的脚本,或在移植 Dart / GetX 代码时保持写法一致。
:::
