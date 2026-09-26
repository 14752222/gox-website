---
title: GUI 模块 API：gx/gfx · 多窗口 · gx/router · gx/screen
description: Gox GUI 模块 API：gx/gfx 的 render/剪贴板/动画、gx/storage 持久化、多窗口句柄、gx/router 路由（守卫/历史栈/懒加载）、gx/screen 屏幕与折叠姿态、gx/dev 快照。
---

# GUI 模块 API：gx/gfx · 多窗口 · gx/router · gx/screen

## gx/gfx 模块函数 {#api-gfx}

`稳定`

除组件标签外,`gx/gfx` 还导出这些函数。

| 导出 | 签名 | 说明 |
| --- | --- | --- |
| h | (tag, props, ...children) | 创建元素。JSX 编译后就是它,所以必须导入 |
| render | (vnode, config?) | 挂载窗口,**返回窗口句柄**。三种写法见下 |
| requestAnimationFrame | (fn) | 16ms 定时器实现;也用来让事件泵保持醒着(驱动光标闪烁) |
| clipboardReadText | () => string | **同步**读剪贴板;读不到返回空串,不抛异常 |
| clipboardWriteText | (text) => boolean | **同步**写剪贴板;失败返回 false |
| animate | 见[过渡动画](/components/patterns#animation) | 命令式补间 |
| openContextMenu | (x, y, items) | 弹出右键菜单 |

### render 的三种形态

```js
// ① JSX:窗口配置写在根元素属性上(最常用)
render(<window title="Counter" width={400} height={300}>...</window>);

// ② h() 手拼树:窗口配置作为第二个参数
render(h("column", { gap: 10 }, ...), { title: "Slider demo", width: 260, height: 260 });

// ③ 省略配置:用缺省 Gox 400x300
render(h("text", null, "hello"));
```

### 剪贴板(同步 API)

```js
import { clipboardReadText, clipboardWriteText } from "gx/gfx";

const ok = clipboardWriteText(text());
const s  = clipboardReadText();        // 读不到是空串
```

两者都是**同步**的 —— 脚本与窗口在同一个 OS 线程,直接调原生 API 就是正确的线程,不需要 `await`。后端不支持时静默降级(写返回 false、读返回空串),不抛异常。

## gx/storage 本地持久化 {#api-storage}

`稳定`

应用级 kv 存储:值经 JSON 序列化落盘到用户配置目录,下次启动还在。

| API | 返回 | 说明 |
| --- | --- | --- |
| setAppName(name) | void | 指定应用名(数据目录的一段);**推荐在任何 storage 调用前先调** |
| appDataDir() | string | 数据目录绝对路径(`UserConfigDir/Gox/<appName>`) |
| setStorage(key, value) | void | 写入。value 只能是纯数据(对象/数组/标量);**写穿透立即落盘** |
| getStorage(key) | value | 读回。不存在返回 `undefined`,不抛异常 |
| removeStorage(key) / clearStorage() | void | 删一个键 / 清空 |
| getStorageInfo() | {keys, currentSize, limit} | 键列表与字节数;`limit` 恒 -1(v1 不做配额) |

```js
import { setAppName, setStorage, getStorage } from "gx/storage";

setAppName("my-app");              // → %APPDATA%/Gox/my-app (Linux: ~/.config/Gox/my-app)
setStorage("theme", "dark");
setStorage("profile", { name: "gox", level: 3 });   // 对象也行,序列化后整存整取
const t = getStorage("theme");     // "dark"; 首次运行为 undefined
if (t === undefined) setStorage("theme", "light");
```

- 全部同步 API,无 Promise —— 本地小文件读写,不需要异步仪式。
- 单文件 storage.json 整读整写,临时文件 + rename 原子替换;文件损坏按空存储处理并打告警,应用照常起。
- 存函数 / 循环引用会在写入时抛 TypeError(而不是静默存成 null 读不回来)。
- GOX_STORAGE_DIR 环境变量可整体替换根目录(测试隔离 / 便携部署)。

## 多窗口 {#multiwindow}

`稳定`

`render()` 可以调用多次,每次都开一个独立窗口,返回句柄用于关闭与运行期控制(标题 / 尺寸)。

| 句柄方法 | 说明 |
| --- | --- |
| close() | 关闭该窗口。内部经 `Post` 投回 GUI 线程,**异步受理** —— 返回时可能还没真关 |
| isClosed() | 查询是否已关闭 |
| title() / setTitle(t) | 读 / 改窗口标题。做成**方法**而非属性 —— 属性值在构造时被快照,会永远返回旧标题。后端不支持改标题时只更新句柄内记录(`title()` 仍读得回),不报错 |
| resize(w, h) | 改**客户区**尺寸(与 `<window>` 的 `width`/`height` 同口径)。支持的后端连带触发 `onResize`(useWindowSize 断点布局跟着自动切);缺参 / 非数字抛 `TypeError`,数值 ≤0 静默拒绝 |

```js
const makeCounter = (title) => {
  const [n, setN] = createSignal(0);
  let self = null;

  self = render(
    <window title={`Multi-window ${title}`} width={380} height={340}>
      <column gap={12} padding={16}>
        <text font={22}>{() => `${title} count = ${n()}`}</text>
        <button onClick={() => setN(n() + 1)}>+1</button>
        <button onClick={() => self.setTitle(`${title} count = ${n()}`)}>Rename</button>
        <button onClick={() => self.resize(520, 400)}>Resize 520x400</button>
        <button onClick={() => self.close()}>Close this window</button>
      </column>
    </window>
  );
  return self;
};

const a = makeCounter("A");   // 两个窗口各有独立元素树、焦点与快捷键表
const b = makeCounter("B");
```

- 关掉其中一个,其余继续正常响应;全部关闭后进程才退出。
- 窗口之间不共享节点。想同步状态就共享同一个 createSignal(在脚本顶层建),不要指望 prop 自动串起来。
- 每个窗口是独立的 app 实例:悬停链、按压态、键盘焦点、快捷键表、弹层状态互不干扰。
- 关了"最近 Mount 的窗口"之后,剪贴板 / 原生对话框这类没有节点上下文的 API 会自动改指到幸存窗口。
- 改标题 / 改尺寸在 win32 已验证;X11 后端已实现但未实机验证。无窗口位置控制、无模态子窗口。

## gx/router 路由 {#router}

路由是**内置模块**(2026-09-21 落地,渲染内核一行未改):路由表、参数匹配、三级守卫、 历史栈、懒加载、多窗口作用域都在模块里,而页面切换仍然走内核既有的"函数子节点 + keep-alive 分支"。 完整手册见 [docs/gui-router.md](https://github.com/14752222/Gox/blob/main/docs/gui-router.md)。

| 视图 / 函数 | 说明 |
| --- | --- |
| `createRouter({routes, initial, backKeys, foldable})` | 建路由器。路由记录字段:`path` / `name` / `component` / `children` / `meta` / `redirect` / `props` / `beforeEnter` / `keepAlive` / `dualPane` |
| `<RouterView />` | 当前路由的挂载点;可传 `loading` / `error` 分支与 `scope`(显式作用域,一个窗口里放两套独立导航) |
| `<RouterLink to="…" />` | 导航链接;`to` 收路径串或 `{name, params}` |
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
- to 一律按绝对路径解析(不支持 "./sub");正则路径约束 / alias 不做,参数校验写在 beforeEnter 里。
- 状态保留两档:路由记录 keepAlive: true 保住整棵子树(滚动位置 / 焦点 / 草稿),useRouteState() 只存值。保活页常驻内存,只给真正需要的页开。
- 默认绑定 Alt+← / Alt+→;实现是包装根节点脚本自己的 onKeyDown(两层都跑,不是覆盖),backKeys: false 可关。
- 多屏与折叠(配套模块 gx/screen):Windows / X11 没有姿态查询 API,框架不猜姿态 —— 只提供 reportPosture() 上报通道,没人上报就恒为平展;半折时 RouterView 自动变双栏(左栏放历史的上一条)。
- 3 页以内、不要守卫与历史栈的小工具,继续用"一个 signal + 页面表"的用户态写法更省事 —— 见用户态模式手册 §1。

## gx/screen 屏幕与折叠 {#api-screen}

`稳定` · `窗口归属:后端提供`

显示器表、窗口所在屏,以及折叠(铰链)设备的姿态与折痕。信息**分两层**: **几何与窗口归属由后端报**(`MonitorFromWindow` 的语义和"用坐标算面积重叠"并不相同, 且负坐标副屏容易翻车,所以判据留在后端); **折叠姿态由宿主经 `reportPosture()` 上报** —— Windows / X11 没有姿态查询 API, 框架不猜姿态,没人上报就恒为平展。

| 导出 | 签名 / 返回 | 说明 |
| --- | --- | --- |
| screens() | Display[] | 全部显示器,字段见下 |
| primaryScreen() | Display | 主显示器 |
| screen(id) | Display \| null | 按 id 取一块屏 |
| screenOf(win?) | Display \| null | 窗口所在显示器;省略参数 = 最近挂载的窗口(没有窗口时为 `null`) |
| useScreen(win?) / useScreens() | **getter** | 响应式版。**返回的是取值函数,要再调一次**:`const f = useScreens(); f()` |
| windowInfo(win?) / useWindowInfo(win?) | object / **getter** | 窗口尺寸与所属屏:`{width, height, scale, screenWidth, screenHeight, workWidth, workHeight, screenId, platform}` |
| posture(win?) / usePosture(win?) | string / **getter** | 折叠姿态:`"flat"` / `"half-open"` / `"folded"` / `"unknown"` |
| hinge(win?) / regions(win?) | object \| null / array | 折痕 `{x, y, width, height, orientation}` 与分段面板 `[{id, x, y, width, height}]`。**hinge 是设备几何,不随 posture 清除** —— 折回平展再折回来比例不会变成 0.5 |
| platform() | string | `"win32"` / `"x11"` / `"cocoa"` / `"headless"` |
| reportPosture(opts) | undefined | 宿主上报姿态。字段:`{display?, posture?, foldable?, width?, height?, hinge?{x, y, w, h, orientation}, regions?}` |
| resetDisplays() | undefined | 清掉上报覆盖,回退到后端枚举 |
| onDisplayChange(fn) | off() | 显示器 / 姿态变化订阅;**返回值就是注销函数**(也可用 `offDisplayChange(fn)`) |

::: warning 两处最容易踩的写法
**① `useXxx` 返回的是取值函数**,不是值本身 —— 写 `usePosture() === "half-open"` 永远为 `false` (拿函数比字符串)。要先 `const getPosture = usePosture()`。<br> **② 折痕写入用 `w` / `h`,读出是 `width` / `height`** —— 把 `hinge()` 的结果直接回填给 `reportPosture` 会得到 0 宽的折痕。
:::

```js
import { usePosture, hinge, screens, reportPosture, screenOf } from "gx/screen";
import { createMemo } from "gx/solid";

// usePosture() 先拿到取值函数,再放进函数 prop / 函数子节点才会跟着姿态重算
const getPosture = usePosture();
const folded = createMemo(() => getPosture() === "half-open");

<text>{() => `${screens().length} 屏`}</text>
<text>{() => `折痕:${hinge() ? "有" : "无"}`}</text>
<text show={folded}>半折:左右分栏</text>

// 宿主上报 —— 桌面没有姿态查询 API,只能这样告诉内核
reportPosture({
  display: screenOf().id,
  posture: "half-open",
  hinge: { x: 980, y: 0, w: 40, h: 1400, orientation: "vertical" },
});
```

- 半折时 RouterView 会自动变双栏(左栏放历史的上一条),分割比例的分母是显示器长度而不是折痕长度。
- 姿态只能上报,不能查询;桌面后端下它恒为平展。移动宿主接入时可能要按 Android 的 posture 词表补映射。
- 显示器变化的通知依赖后端:WM_DISPLAYCHANGE / WM_DPICHANGED 目前由 win32 后端投递。

## gx/dev 开发期快照 {#api-dev}

`稳定` · `开发期`

`devSnapshot()` 一次性取回当前运行时的内部状况,用来做调试面板: 帧统计、图像与字形缓存占用、当前节点树、存活的 effect、最近的警告(含 [未知标签](/components/)与指令误用的去重警告)。

| 字段 | 内容 |
| --- | --- |
| `snap.frame` | `{count, full, partial, fullRatio}` —— 帧数与整帧 / 局部占比 |
| `snap.imageCache` | `{size, cap, hits, misses, evicts}` |
| `snap.glyphCache` | `{size, cap, hits, misses, evicts}`(字形缓存) |
| `snap.tree` | `{windows, nodes, depth}` |
| `snap.solid` | `{effects}` —— 存活 effect 数;gx/solid 未注册时为 `-1` |
| `snap.warnings` | `[{at, text}]` —— 最近若干条内核警告 |

```js
import { devSnapshot } from "gx/dev";

// 拉取式:面板自己按间隔读,不推送。别用 requestAnimationFrame(会和渲染抢帧)
setInterval(() => {
  const s = devSnapshot();
  console.log("frames:", s.frame.count, "整帧率:", Math.round(s.frame.fullRatio * 100) + "%");
  console.log("字形缓存:", s.glyphCache.size + "/" + s.glyphCache.cap, "节点:", s.tree.nodes);
  if (s.warnings.length) console.log("最近警告:", s.warnings[s.warnings.length - 1].text);
}, 1000);
```

三个要点:**字段名是 API**(结构有专门用例锁住,可放心当数据源)、 **一次调用返回整棵 JSON 形状的纯对象**、 **不 import 就是零成本的死代码路径**。 可运行的调试面板见演示脚本 `testdata/dev_panel_demo.js`。
