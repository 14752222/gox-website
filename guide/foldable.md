---
title: 折叠屏适配
description: Gox 折叠屏适配教程：姿态与折痕读数（posture / hinge / regions）、布局建议（layoutMode）、折痕避让（avoidReserved）、Tabletop 上下分屏与跨屏拖拽，以及贯穿全篇的四条纪律。附四场景可运行示例。
---

# 折叠屏适配

折叠屏的独有能力不是"屏幕更大"，而是**屏幕被折痕切成两段、用户物理上只能看一段**。

框架只出**信号**（姿态 / 折痕 / 保留区）与一个**联合判定入口**，**布局形态由应用决定**。
这是官方立场（华为"不推荐用折叠状态监听接口实现响应式布局"）与内核既有立场的共同结论。

::: tip 先记住四条纪律
1. **布局只信宽度，不信姿态** —— 姿态会落后一帧
2. **订阅型读数先取再分支，别塞进三元** —— 否则界面像"死"了一样
3. **折痕坐标是显示器坐标**（设备像素），全屏时等于窗口坐标，分屏时不等价
4. **没人上报就恒为平展** —— 框架提供通道不猜姿态，真机由平台壳工程上报
:::

## 一、三件套读数

```js
import { reservedRegions, hasFold, layoutMode } from "gx/viewport";
import { posture, hinge, regions, splitRatio, hingeOrientation } from "gx/screen";

const r = reservedRegions();   // 纯读数（不订阅）: { division:[…], occlusion:[…], all:[…] }
const m = layoutMode();        // 同上: { posture, widthClass, foldAware, suggested }
```

| 读数 | 返回 | 要点 |
| --- | --- | --- |
| `posture(win?)` | string | `"flat"` / `"half-open"` / `"folded"`；**没人上报恒为 `"flat"`** |
| `hinge(win?)` | object \| null | 折痕矩形 `{x, y, width, height, orientation}`，无折痕为 `null` |
| `hingeOrientation(win?)` | string | `"vertical"`（左右折，折痕是竖条）/ `"horizontal"`（上下折） |
| `regions(win?)` | array | 折痕切出的分区列表 |
| `splitRatio(win?)` | number | 折痕分割比例，钳 `[0.2, 0.8]`；无折痕退化 `0.5` |
| `reservedRegions(win?)` | `{division, occlusion, all}` | 三个键恒存在（空时是空数组），`.division.length` 永远可写 |
| `hasFold(win?)` | bool | **结构性**信号：有折痕的机器恒 `true`，不随折叠/平展 flip-flop |
| `layoutMode(win?)` | `{posture, widthClass, foldAware, suggested}` | `suggested` ∈ `"single"` / `"dual"` / `"tablet"`，**只给建议，框架不改布局** |
| `widthClass(win?)` | string | `"compact"`（<600dp）/ `"medium"`（600–840dp）/ `"expanded"`（>840dp） |

### 订阅型 vs 纯读数

两者都是"对的"，**用错场合才是错的**。

- **订阅型**（调用时读版本号信号 = 建立订阅，环境变化会让引用它的 effect 重跑）
  - **两段式**（外层绑窗口返回 getter，内层再调才订阅 + 取值）：
    `usePosture()()` / `useWindowInfo()()` / `useReservedRegions()()` / `useLayoutMode()()`
  - **一段式**（调用即订阅）：`useViewport()` / `useBreakpoint()` / `useInsets()`
- **纯读数**（每次读当前快照，**不订阅**）：上面表格里的全部，加上 `viewport()` / `insets()` / `contentArea()`

```js
const getP = usePosture();          // 外层：绑窗口，返回 getter
// … 后面一定要 getP() 再调一层括号；少写一层拿到的是函数对象，属性全是 undefined
```

::: warning 两段式的括号陷阱
`usePosture` 返回的是个**函数**，`usePosture().posture` 是 `undefined`。
必须 `usePosture()()` 才是当前值。少一层括号不报错，只是拿到个函数对象。
:::

## 二、纪律 ①：布局只信宽度

这是**最容易踩、后果最隐蔽**的一条。

上下折机型（如 Pocket 系列）**展开后宽度可能仍 < 600dp**。用 `posture === "flat"` 推
"该变宽了"必然翻车。而且官方时序里 `windowSizeChange` **早于** `foldStatusChange(展开态)`
—— 用姿态驱动布局会**落后一帧**。

```js
// ✅ 正确：列数只由宽度决定
import { widthClass, useBreakpoint } from "gx/viewport";

function panes(width) {
  return width >= 600 ? 2 : 1;
}
```

同一个窗口，把宽度拖到 600 以下就从双栏变单栏 —— 代码一个字都不用改。

`hasFold()` 是唯一的例外：它是**结构性**信号（有折痕的机器恒 `true`），
不随折叠/平展 flip-flop，所以拿它做"要不要走折叠屏分支"的开关是安全的
（否则列数会跟着姿态跳）。但它**不代表当前是展开态**。

## 三、纪律 ②：订阅型读数先取再分支

**把订阅型读数写进三元 / 短路的某条分支是静默坑**：

```js
// ❌ 错：首帧没走到的分支不建立订阅
const label = hasFold() ? postureText(usePosture()()) : "平展";
```

首帧如果 `hasFold()` 是 `false`，`usePosture()()` 根本不会执行 ⇒ 订阅**从未建立**，
effect 零依赖、**永不重跑且无警告**。界面看起来就像"死了"——折叠了也不更新。

```js
// ✅ 对：无条件先取一次，再进分支
const getP = usePosture();
const p = getP();                       // 无条件建立订阅
const label = hasFold() ? postureText(p) : "平展";
```

这条对**元素子节点**同样成立 —— 插值 `{expr}` 0.14.0 起在解析期自动包成函数子节点，
但裸标识符 `{sig}` 不包、手写 `h()` 也没有这层包装，写错仍是只求值一次（`GOX_DEV=1` 下 gfx 会就这类陷阱发警告）。

## 四、纪律 ③：折痕坐标是显示器坐标

`hinge()` / `reservedRegions()` 返回的坐标是**显示器坐标（设备像素）**。

- **全屏时**：显示器和窗口原点重合，可以直接当窗口坐标用；
- **分屏 / 自由窗口下**：**不等价** —— 要减去窗口在屏上的原点
  （`windowInfo().x` / `.y`）。

```js
const win = useWindowInfo();
const hg = hinge(win());          // 显示器坐标
const localX = hg.x - win().x;    // 换算成窗口内坐标
```

跨屏拖拽场景（窗口在两块物理屏之间移动）下，`screenOf()` /
`windowInfo().screenId` 会变，折痕读数随之变 —— 这是同一个机制的两种表现。

## 五、折痕避让 avoidReserved（opt-in）

内核元素**默认不避让**保留区 —— 历史行为不变，避免老界面莫名位移。
要避让就显式声明：

```jsx
<row avoidReserved="division">      {/* 只避折痕 */}
  …
</row>
```

取值：`"division"` 只避折痕 / `"occlusion"` 只避遮挡 / `"all"` 或 `true` 全避。

::: danger avoidReserved 不适用于 `<scroll>`
滚动容器里收缩可用区会让内容与滚动条语义打架（内核会打一条一次性告警并**忽略**）。

需要在滚动区里避让时，自己在内容**外层**加一层带 `avoidReserved` 的容器
（工具栏 / 按钮组的 `row` / `column`）。
:::

## 六、Tabletop：横折上下分屏

`hingeOrientation() === "horizontal"` 表示横折 —— 屏幕被折成上下两段，
典型的 Tabletop（笔记本模式）用法是**上段当显示屏、下段当操作台**。

```js
import { layoutMode } from "gx/viewport";
import { hingeOrientation, usePosture } from "gx/screen";

const m = layoutMode();
// suggested === "tablet" 时给上下分屏布局
if (m.suggested === "tablet") { /* 上段内容 + 下段控件 */ }
```

用 `hingeOrientation()` 区分横折/竖折，**别拿宽度猜** —— 900×1440 的横折屏
宽度比 1440×900 的竖折屏窄，但两者语义完全不同。

`suggested` 只是建议。框架**永不动你的布局** —— 这是刻意的设计。

## 七、跨屏拖拽

窗口在两块物理屏之间移动时读到的 `display` 变化：

```js
import { screenOf, useWindowInfo } from "gx/screen";

const win = useWindowInfo();
const s = screenOf();                              // 当前窗口所在屏
// s: { id, width, height, scale, foldable, … }
```

把窗口拖到另一块屏（或调 `moveTo`）时，`screenOf()` / `windowInfo().screenId`
都会变。折痕坐标按上面第四条换算。

## 八、纪律 ④：上报是宿主的活

**没人上报 ⇒ 姿态恒 `flat`**。Windows / X11 没有姿态查询 API（WinRT 没有、
X11 没有对应扩展）。

这不是 bug，是"**提供通道不猜姿态**"的立场。真机上由平台壳工程上报：

| 平台 | 上报者 |
| --- | --- |
| Android | `DisplayManager`（`gfx/mobile.ReportDisplayFold`） |
| iOS | `UITraitCollection` |
| 鸿蒙 | ArkUI 折叠状态回调 |

脚本侧写法三端完全一样。桌面上的开发者工具 / 模拟器 / 自动化测试同样可以
调 `reportPosture(opts)` 上报（本教程示例就是这么演示的）。

```js
import { reportPosture } from "gx/screen";

reportPosture({
  foldable: true,          // 首次上报必须带
  width: 900,              // 首次上报必须带
  height: 1440,            // 首次上报必须带
  posture: "half-open",
  hinge: { x: 0, y: 700, w: 900, h: 40, orientation: "horizontal" },
});
```

::: warning 首次上报必须带 width / height / foldable
否则"窗口所在显示器"解析不到，之后的姿态读了也是**空的** —— 这是最容易踩的一条。
:::

退出时调 `resetDisplays()` 把屏表交还后端；测试里对应
`gfx.ResetDisplaysForTest()`（不清会让下一个用例读到上一轮塞进来的假屏）。

## 九、四场景可运行示例

仓库里 `apps/foldable-demo` 把上面四条纪律做成了并排四个场景：

| 场景 | 演示什么 |
| --- | --- |
| **S1 单双栏自适应** | 列数只由宽度决定，拖窄窗口自动从双栏变单栏 |
| **S2 折痕避让** | `avoidReserved="division"` 让内容主动让开折痕带 |
| **S3 Tabletop** | 横折 → 上下分屏，上段内容 / 下段操作台 |
| **S4 跨屏拖拽** | 窗口换屏时 `screenOf()` / `screenId` 的变化 |

```bash
gox apps/foldable-demo/src/main.js
```

应用自己扮演"宿主"：点形态按钮 = 往内核上报一次姿态，脚本侧读数随之变化。

## 十、排查清单

| 症状 | 最可能的原因 |
| --- | --- |
| 折起来但没变双栏 | 姿态**没人上报** ⇒ 恒为平展。先 `posture(win)` 确认读到的确实是 `"half-open"` |
| 折一下不更新，转个屏才更新 | **只订阅了两个信号里的一个** —— `useReservedRegions()()` 同时订阅窗口环境 + 屏表 |
| 界面像"死了"，折了没反应 | 订阅型读数被写进了三元/短路的某条分支，首帧没走到 ⇒ 订阅从未建立 |
| 界面撞在折痕带上 | `avoidReserved` 没写，或者写在了 `<scroll>` 上（被忽略） |
| `hinge()` 宽度读出来是 0，回填后折痕像丢了 | 早期 `reportPosture` 入参只认 `w`/`h`；现在两种拼法都认（短名优先），可直接 `reportPosture({ hinge: hinge() })` |
| 列数跟着折叠状态跳 | 用了 `posture()` 而不是 `widthClass()` / `hasFold()` 推列数 |

---

下一站：[组件参考](/components/) 看内置元素完整参数，或回到 [GUI 桌面应用](/guide/gui) 看响应式与布局基础。
