---
title: 横切能力：响应式渲染、each/show 指令、事件、无障碍、层叠、动画
description: Gox GUI 横切能力：gx/solid 响应式渲染与函数子节点、each/show 元素级指令（keyed 复用）、事件与焦点模型、无障碍与键盘导航（ Tab 遍历 / 方向键 / 焦点陷阱 / aria / 验收清单）、zIndex/absolute/escapeClipping 层叠、transition 过渡动画。
---

# 横切能力：响应式渲染、each/show 指令、事件、无障碍、层叠、动画

## 响应式与列表渲染 {#reactive}

`稳定`

来自 `gx/solid` 的这几个 API,是"界面为什么会更新"的答案。 完整导出、签名与边界见 [API 参考 · gx/solid](/api/gx#m-solid)。

| API | 签名 | 说明 |
| --- | --- | --- |
| createSignal | (initial) => [get, set] | 创建信号。调用 `get()` 读值(同时登记依赖),`set(v)` 或 `set(fn)` 写值;**新旧值 `===` 相同不通知** |
| createEffect | (fn) => dispose | 立即跑一次 `fn`,并订阅其中读到的所有信号;**返回值是注销函数** |
| createMemo | (fn) => getter | 派生计算值,**惰性**:依赖变化只标脏,读取时才重算 |
| createResource | (fetcher) => [data, res] | 异步取数三件套。`data()` 取当前值;`res.state()` 为 `"pending"` / `"ready"` / `"refreshing"` / `"error"`;`res.error()` 取错误;`res.refetch()` 重取(保留旧值显示)。**controls 必须作为第二个元素取出**——嵌套解构 `[data, {refetch}]` 引擎不支持 |
| onMount | (fn) | 本代子树挂载后执行一次 |
| onCleanup | (fn) | 本代子树被替换 / 销毁时执行 —— 用来收定时器、解绑回调 |
| untrack | (fn) => value | 在**不登记依赖**的前提下执行 `fn` 并返回结果。路由内部靠它调页面组件,避免"页面体里读的信号变成路由 effect 的依赖" |
| devStats | () => object | 开发期统计(信号数 / 订阅数等),配合 `gx/dev` 的调试面板 |

**函数子节点**是列表渲染与条件渲染的统一入口:求值结果可以是元素、数组、标量或 `null`/`false`(渲染为空)。

```js
const [items, setItems] = createSignal(["alpha", "beta"]);
const [tab, setTab] = createSignal(0);

// 列表渲染:函数返回数组,逐元素挂载
<column gap={6}>
  {() => items().map((t) => <text>{t}</text>)}
</column>

// 条件渲染:函数返回元素 或 null
{() => (tab() === 0 ? <text>面板 A</text> : <text>面板 B</text>)}

// 静态数组子节点也支持:直接写 {rows} 会逐个展开成兄弟节点
<scroll height={120}>{rows}</scroll>
```

::: info 函数子节点是"整组重建"
数组或条件变化时整组**重建**子树(旧子树的 effect 会被注销):增删几行没问题, 但每一行的输入焦点、滚动位置、行内 signal 都会丢。要**带 key 的复用**(只重建真正 变了的行)请用 [each 指令](/components/patterns#view);超长列表用 [`<scroll vlist>`](/components/layout#scroll) 虚拟化,只物化可见区间。
:::

## 列表与条件(元素级指令 + gx/view) {#view}

`稳定`

列表与条件是**元素级指令**(写在元素上),多分支用 `gx/view` 的 `Switch` / `Match`。对照 Vue 即 `v-for` / `v-show` / `v-if` 链。 **2026-09-20 起**:`<For>` / `<Show>` 组件已移除,改用下面的指令 (语义未变:`<view each={x}>` 与旧 `<For each={x}>` 逐像素一致)。

```js
import { Switch, Match } from "gx/view";   // each / show 是 h() 层的指令, 不用 import

<view each={rows} key="id" fallback={<text>暂无数据</text>}>
  {(row, i) => <row><text>{(i + 1) + ". " + row.title}</text></row>}
</view>

<view show={open} fallback={<text>已隐藏</text>}>
  <input width={150} model={draft} />
</view>

<Switch fallback={<text>未知状态</text>}>
  <Match when={() => phase() === "loading"}><text>加载中…</text></Match>
</Switch>
```

| 指令 / API | 签名 | 说明 |
| --- | --- | --- |
| `each` | {each, key?, fallback?, stable?, gap?} + `(item, i) => node` | 列表循环(**元素级指令**,写在元素上)。**同 key + 同行引用 + 同下标**的行原样复用(行内输入框、滚动位置、局部 signal 都留着),只重渲染真正变了的行;`each` 也接受数字(0..n-1);`key="id"` 是 `key={(r) => r.id}` 的简写 |
| `show` | {show, fallback?} + children | 条件显隐(**保活**):隐藏只是摘出布局流,子树保持挂载,再显示瞬间切回。条件写 `show={open}`(signal 本身就是取值函数) |
| `view` | —(标签) | **布局透明容器**(Fragment):单子时尺寸完全跟随子节点、多子按父向堆叠,自己不占盒子。它是指令的"无盒子模板"——`<view each={rows}>` 与旧 `<For>` 一致;`<row each={rows}>` 则每项一个盒子 |
| Switch / Match | `({fallback?}, ...<Match/>) / ({when}, ...children)` | 多分支:取声明序里第一个 `when` 为真的分支,都不真用 `fallback`(仍是 `gx/view` 的导出组件) |

::: info 写错会出声,不再静默
`each` / `show` 要收**取值函数**: 写 `each={rows()}` / `show={open()}` 只拿到一张快照, 之后信号再变也不会重渲染。这类非法形态(`each` 收到字符串/对象、 忘了括号的静态布尔、`key` 收到数字、`stable` 传函数) 现在各打一条去重警告(stderr + `gx/dev` 的缓冲)。
:::

```js
import { Switch, Match } from "gx/view";   // each / show 是元素级指令, 不需要 import

<view each={() => rows()} key={(r) => r.id} fallback={<text>暂无数据</text>}>
  {(row, i) => <row><text>{(i + 1) + ". " + row.title}</text></row>}
</view>

<view show={() => open()} fallback={<text>已隐藏</text>}>
  <input width={150} model={draft} />
</view>

<Switch>
  <Match when={() => phase() === "loading"}><progress value={0.5} /></Match>
  <Match when={() => phase() === "error"}><text>出错了</text></Match>
</Switch>
```

::: info each / when 要传函数
属性在调用当场求值:写 `each={rows()}` 只拿到一张快照,之后信号再变也不会重渲染; 写 `each={() => rows()}` 才是"跟着信号走"。这与受控 `input` 的 `value` 必须传函数是同一条纪律; 传数组 / 数字字面量是合法的**静态**列表(渲染一次)。

**子节点同理, 但这条不报错也不警告**: ``<text>count: {count()}</text>`` 里的 `count()` 在 `h()` 之前就求值完了, 于是永远停在第一帧; 要写 ``<text>{() => `count: ${count()}`}</text>``。文本子节点天生收标量(``<text>你好</text>`` 就是字符串子节点), 运行期分不出"静态文本"与"快照", 所以这条只能靠纪律。

**三元 / 短路还有一条同族的静默坑**: 订阅型读数(`useXxx()` 一族)写在**首帧没走到的分支**里, 那次调用根本没发生 ⇒ 订阅没建立, effect 一个依赖都没有、之后永不重跑, 且没有任何警告。正解是**先无条件取一次订阅型读数, 再按值分支**:

```js
// ❌ 首帧 hasFold() 为 false ⇒ useReservedRegions()() 没被调用 ⇒ 之后永不更新
const bad = () => hasFold() ? "折痕 " + useReservedRegions()().division.length + " 条" : "未检测到折痕";

// ✅ 先订阅, 再分支
const good = () => {
  const r = useReservedRegions()();   // 先建立订阅
  if (!hasFold()) return "未检测到折痕";
  return "折痕 " + r.division.length + " 条";
};
```
:::

- 复用判定含下标:重排或删除中间一项会让后续行的下标前移,那些行就地重渲染(序号才跟着位置走)。 行不显示位置时加 stable 把下标移出判定(代价:下标参数停在挂载时的值)。
- show / Switch 不是 v-if:隐藏只摘出布局流、子树保活 —— 隐藏期间内容仍在跟着信号走,再显示状态原样。 要"每次显示都全新构建"就用函数子节点 `{() => cond() ? <X/> : null}`。
- 行被删除时该行子树销毁(onCleanup 执行);keyed "移动"动画未做(虚拟化长列表见 [`<scroll vlist>`](/components/layout#scroll))。
- 宿主是透明占位节点:放进 column 竖排、放进 row 横排,自己不占盒子; row wrap 的折行不认它(要折行标签流请用普通 row)。

## 事件与焦点 {#events}

`稳定`

所有事件都是"沿祖先链找第一个处理器",找到就停 —— **不冒泡、无捕获、无 `stopPropagation`**。

| 事件 | 回调参数 | 说明 |
| --- | --- | --- |
| onClick | 无 | 左键抬起 |
| onMouseMove | `{x, y}` | 鼠标在节点内移动 |
| onWheel | `{deltaY}` | 向下滚为正(DOM 约定)。`scroll` 内先被容器消费 |
| onContextMenu | `{x, y}` | 右键抬起;常用来调 `openContextMenu` |
| onKeyDown / onKeyUp | `{key, ctrl, shift, alt}` | 投给焦点节点,再沿祖先链上溯 |
| onFocus / onBlur | 无 | 焦点进入 / 离开 |
| onInput | `{value}` | 输入类组件的编辑回调(string;slider 是 number) |
| onResize | `{width, height}` | **窗口级**事件:窗口尺寸变化时投给布局根,**挂非根节点不触发**。配合 signal 就是 useWindowSize 模式(见下) |

### useWindowSize:拖窗口自适应

```js
// onResize 只认布局根;断点是脚本里的普通 memo,不烧进内核
const [win, setWin] = createSignal({ width: 520, height: 360 });
const wide = createMemo(() => win().width >= 480);

<window title="app" width={520} height={360}>
  <column onResize={(e) => setWin({ width: e.width, height: e.height })}>
    {() => (wide() ? <Sidebar /> : <text font={12}>(narrow)</text>)}
  </column>
</window>
```

**焦点模型**：点击任意节点即成为键盘焦点，焦点节点会画 1px 蓝色虚线框。`disabled` 子树不响应任何事件、也不参与焦点切换。键盘也能改焦点（`Tab` / `Shift+Tab` 遍历、方向键、`Enter` / `Space` 激活）—— 见下面的[无障碍与键盘导航](#a11y)。

```js
<rect
  width={380} height={110} background="#eef3f8"
  onClick={() => setLast("click")}
  onMouseMove={(e) => setPos(`${e.x}, ${e.y}`)}
  onWheel={(e) => setLast(`wheel deltaY=${e.deltaY}`)}
  onContextMenu={(e) => setLast(`context menu at ${e.x}, ${e.y}`)}
  onKeyDown={(e) => setLast(`keydown ${e.key}`)}
>
  <text>click to focus, then move / scroll / right-click / type</text>
</rect>
```

## 无障碍与键盘导航 {#a11y}

`稳定` · `纯计算`

键盘是一条**与鼠标并列**的路，不是替代：点击仍然能改焦点，键盘只是多了一条"不碰鼠标也能把事做完"的路。内核把这件事收在一层里（`gfx/a11y.go`），组件只负责声明自己的语义。

**它不做读屏桥**（Windows UIA / macOS AX / Android AccessibilityService）—— 三平台三套 API，与"零 cgo"的承诺冲突。它做的是**键盘用户能不能把事做完**，这是纯计算，能在 CI 里断言。

### 谁进 Tab 序，按什么顺序

| Prop | 行为 |
| --- | --- |
| 不写 | 按**标签表**：`button` / `checkbox` / `radio` / `switch` / `slider` / `input` / `search` / `textarea` / `select` / `rating` / `tabs` / `pagination` / `datepicker` / `colorpicker` / `upload` 进序 |
| `focusable={true}` | 强制进序（给容器 / 图标用） |
| `focusable={false}` | 强制不进序（"用 Tab 跳过这个搜索框"） |
| `tabIndex` | `>0` 升序排在最前、`0`（缺省）按树序、`<0` 不进序但仍可被程序聚焦 |

容器类（`column` / `row` / `view` / `rect` / 弹层）**默认不进序** —— 给纯布局盒子加停留点，会让键盘用户为到达真正的控件多按好几次空 Tab。

这些节点永远不进序：`disabled` 子树、`hidden` / `aria-hidden="true"`、**未布局**（关闭弹层里的节点、`tabs` 的非激活页）、**与窗口矩形不相交**（滚出视口的行，"不让键盘用户跳进看不见的地方"）、以及弹层**内部结构**（下拉项 / 日历格 / 色板格 —— 它们是"方向键在里面走"的复合控件内部，与浏览器里 listbox 选项不进 Tab 序一致）。

### 按键

| 键 | 语义 |
| --- | --- |
| `Tab` / `Shift+Tab` | 遍历序前后移动，两端**绕回**；遍历序为空时不消费这个键（还给脚本） |
| `Enter` / `Space` | **激活** = 用鼠标点一下这个控件（走同一个 `onClick` 出口） |
| `←` `→` / `↑` `↓` | `radio` 组内移动并选中；`slider` ± 一步；`rating` ± 一星；`tabs` / `pagination` 上下页；`select` 移动高亮；`datepicker` 前后一天 / 一周；`colorpicker` 前后一格 / 上下**一列** |
| `PageUp` / `PageDown` / `Home` / `End` | 日历里翻月、跳本月首末日 |
| `Esc` | 收起弹层（下拉 / 日历 / 色板 / 弹窗） |

两条通用约定：

1. **带 `Ctrl` / `Alt` 的一律不碰** —— 那是快捷键的地盘；
2. **边界行为看维度**：一维组（radio / tabs / pagination / select）**环绕**，二维组（日历 / 色板）**停住**（色板上从第一行按 `↑` 绕到最后一行与直觉相反）。

"能不能被激活"看 **role** 而不是"标签能不能点"：浏览器里 `Enter` 触发 click 的是 `button` / `checkbox` / `radio` 这类原生控件，一个普通的 `<div onclick>` 按 `Enter` 什么都不会发生。所以 `<rect onClick>` 想被 `Enter` 激活，要显式写 `role="button"`。

**回车提交表单**：焦点在 `input` / `search` 里按 `Enter` = 提交所在的 `<form>`（派发 `onSubmit({values})`）；焦点在按钮上按 `Enter` 是按下这个按钮。

### 弹层与焦点校正

- 模态弹层（`dialog` / `drawer`）打开时，`Tab` 只在弹层内循环 —— 不需要额外维护"陷阱栈"，遍历序按"最上层可见的模态弹层"算；
- 弹层打开会把焦点交给弹层内第一个可聚焦控件；`Esc` / 点遮罩关闭后，焦点**自动校正**回弹层外的第一个可聚焦控件（否则焦点框会停在看不见的地方，"Tab 从这里继续走但看不见框"）。

### aria

| 概念 | 口径 |
| --- | --- |
| 隐式 role | 每个内置标签有一行默认 role（HTML 隐式 role 优先，HTML 没有对应物的取 ARIA 里最接近的：`input`→`textbox`、`select`→`combobox`、`rating`→`slider`、`upload`→`group`…）。显式 `role` prop 永远覆盖，写错告警一次并回落 |
| 无障碍名 | `aria-label` → `title` → 文本内容 → `placeholder`（字段类）。空串就是"没有可读名字"，**不会**替你编一个"button 3" |
| `aria-*` | 认 ARIA 1.2 全集，但不执行语义（只读 `aria-hidden` 参与"是否进序"）。拼错（`aria-lable`）会**告警一次** —— 要挡的是拼错，不是"用得多" |

```jsx
<button onClick={del} aria-label="删除" />        {/* 图标按钮必须给名字 */}
<row focusable={true} aria-label="结果列表">…</row> {/* 容器想被 Tab 到就显式声明 */}
<rect onClick={go} role="button" focusable />      {/* 自定义可点区域: 有 role 才吃 Enter */}
```

### `gx/a11y`：把焦点链读出来

```js
import { focusOrder, focusNode, focusNext, focusPrev, roles } from "gx/a11y";
```

| API | 返回 | 用途 |
| --- | --- | --- |
| `focusOrder()` | 数组 | 当前遍历序快照：`{ role, name, tag, tabIndex, disabled, focused, description?, keyHint?, box }` |
| `focusNode(el)` | boolean | 程序化聚焦（等价 `el.focus()`） |
| `focusNext()` / `focusPrev()` | boolean | 与 `Tab` / `Shift+Tab` **完全同一条路径**（含绕回与弹层范围） |
| `roles()` | 数组 | 隐式 role 表（`{tag, role, keyHint?}`） |

它不是"给读屏用的"，而是**自检**：`focusOrder()` 里出现 `name` 为空的按钮或图片，就是漏了 `aria-label` —— 比"读屏用户反馈读不出东西"早得多。

### 验收清单

**纯键盘（不碰鼠标）完成"填表 → 提交 → 关弹窗"**，逐步走一遍：

| # | 操作 | 期望 |
| --- | --- | --- |
| 1 | 启动后按 `Tab` | 焦点进第一个可聚焦控件，焦点框可见 |
| 2 | 继续按 `Tab` | 按树序 / `tabIndex` 前进，**不漏、不重、不跳进不可见的节点** |
| 3 | 在末尾再按 `Tab` | 绕回第一个控件（不卡死在最后一个） |
| 4 | 焦点到 `input`，直接打字 | 文字进入输入框（`onInput` 派发，值受控回写） |
| 5 | 焦点到 `select` / `datepicker` / `colorpicker`，按 `Enter` | 弹层展开 |
| 6 | 按方向键 | 高亮 / 光标在弹层里移动 |
| 7 | 按 `Enter` | 选中并收起，`onChange` 派发，**焦点回到字段本身** |
| 8 | 弹层展开时按 `Esc` | 收起，值不变 |
| 9 | 焦点到 `radio` 组，按 `→` | 组内移到下一个并选中 |
| 10 | 焦点到按钮，按 `Enter` / `Space` | 按钮被触发（不是"提交表单"的 Enter） |
| 11 | 焦点在 `input` 里按 `Enter` | 提交所在的 `<form>`，`onSubmit({values})` 派发 |
| 12 | 触发一个 `dialog` | 弹层打开，遮罩可见 |
| 13 | 在 `dialog` 里反复按 `Tab` | 焦点在弹层内循环，**永远不跑到弹层外** |
| 14 | 按 `Esc` | 弹层关闭 |
| 15 | 关闭后按 `Tab` | 焦点自动回到弹层外的第一个可聚焦控件（焦点校正生效） |

可跑版本：仓库里的 `testdata/a11y_form_demo.js`（`./gox testdata/a11y_form_demo.js`）—— 一张表单 + 一个弹窗，第 ② / ③ 行分别是提交结果与 `focusOrder()` 投影，走一遍就能看到每一条。

**加新组件时的自检**（内核文档 `docs/accessibility.md` §7.2 的同一份清单）：

- [ ] 标签进了"原生可聚焦"表（如果它天然该被 Tab 到），或明确说明为什么不该；
- [ ] 标签有隐式 role（否则无障碍层把它当无名容器）；
- [ ] 有 `onClick` 且"点击 = 主要动作"的控件，确认它的 role 可被激活（否则 `Enter` 激活不到它）；
- [ ] 复合控件的**内部结构**不进 Tab 序，方向键在内部走；
- [ ] 写了键盘用法提示（官网这张表与 `focusOrder()` 的 `keyHint` 都读它）；
- [ ] 键盘能完成它支持的所有鼠标动作（点选、展开、收起、切换、取消）；
- [ ] 弹层类：`Esc` 能收起、点外部能收起、收起时焦点**回到触发它的字段**；
- [ ] 缺名字的控件（图标按钮、只有图形的按钮）能通过 `aria-label` 命名；
- [ ] 键盘行为有自动化用例（不是"手工试过就行"）。

### 已知边界

| 现象 | 说明 |
| --- | --- |
| 读屏软件读不出任何东西 | 内核**没有**读屏桥。role / name 只是"可读"，朗读由宿主实现（移动壳可拿 `focusOrder()` 翻成平台无障碍树） |
| 焦点不能在窗口之间跳 | 多窗口各有独立焦点 |
| 输入框里没有 `Home` / `End` / 选区 / 撤销 | 文本编辑的高级键不在一期范围（`Home` / `End` 只在日历里生效） |
| `radio` 不带 `name` 时按"同一个父节点"分组 | 一个容器里放两组单选会串成一组；给 `name` 即可 |
| `tabs` 非激活页里的控件不能被 Tab | 那正是 keep-alive 的语义（切走再切回来状态还在，但不参与 Tab） |
| 滚出视口的控件不能被 Tab | 有意的：不让键盘用户跳进看不见的地方。需要时先把 `scroll` 滚到它 |

## 层叠与定位 {#layering}

`稳定` · `逃逸裁剪`

控制谁盖在谁上面、以及元素脱离常规流。三组 prop 各管一件事。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| zIndex | number | 同层内的绘制与命中顺序,越大越靠上。用稳定排序,**不改变子节点顺序** |
| position | string | 设成 `"absolute"` 即脱离常规流,此时 `left` / `top` 生效(相对父内容区) |
| left / top | number | 绝对定位的偏移 |
| escapeClipping | boolean | 让该子树的绘制与命中**溢出父盒**,并收集到根层级最后绘制 |

::: warning absolute 不解除父盒裁剪
`position="absolute"` 只负责"脱离常规流",元素默认**仍然被父盒裁掉**。 要让弹层溢出父边界显示,必须显式加 `escapeClipping`。 内置弹层标签(`dialog` / `toast` / `select` 的弹出层 / 菜单) 已经自带这一能力,不用手写。
:::

```js
{/* 覆盖层:绝对定位于父内容区左上角 */}
<rect position="absolute" left={12} top={8} width={100} height={20} background="#f2c94c" />

{/* 自定义弹层:溢出父盒显示必须加 escapeClipping */}
<column position="absolute" top={30} escapeClipping={true}>
  <text>浮在外面</text>
</column>
```

## 过渡动画 {#animation}

`稳定` · `非元素`

动画不是某个组件,而是一条可以挂在**任何**节点上的横切能力:值变化时在给定时长内按 ease-out 平滑逼近。

| Prop / API | 类型 | 说明 |
| --- | --- | --- |
| transition | number 或对象 | `transition={400}` 是简写(对所有可动属性生效);<code v-pre>transition={{width: 400, opacity: 350}}</code> 按属性分别定时长 |
| opacity | number | 0~1,**成组**:父节点半透明 = 整棵子树一起淡 |
| animate(node, prop, to, ms) | 命令式 | 让某节点的某属性动到目标值,返回 cancel 函数 |
| animate(from, to, ms, onUpdate, onDone) | 命令式 | 不经过任何元素属性,自己拿插值(配合 `setStatus` 之类用) |

声明式 `transition` 只认这五个数值属性: `width` / `height` / `left` / `top` / `opacity`。

```js
// 宽度过渡:切换时在 400ms 内平滑伸展/收缩
h("rect", {
  height: 18,
  background: "#2f80ed",
  transition: { width: 400 },
  width: () => (wide() ? 300 : 60)
}),

// 成组淡出:父节点半透明 = 整棵子树一起淡
h("row", {
  gap: 6, height: 28,
  transition: { opacity: 350 },
  opacity: () => (visible() ? 1 : 0.15)
},
  h("rect", { width: 24, height: 24, background: "#c0392b" }),
  h("text", { font: 12, width: 80, height: 24 }, "fading")
),

// 命令式:自己拿插值,onUpdate 每帧(~60fps)调用
h("button", {
  onClick: () => {
    animate(0, 100, 600,
      (v) => setStatus("progress " + Math.round(v) + "%"),
      () => setStatus("done"));
  }
}, "bounce")
```

::: info 三条容易误判的行为
**① 首次赋值不做过渡**(与 CSS 一致):元素刚挂上时不会"从 0 长出来",想要入场动画请用命令式 `animate()`。<br> **② 过渡期间布局读的是插值**,所以兄弟节点会跟着让位 —— 不只是视觉在动。<br> **③ 动画没结束前脚本读到的 prop 已经是终值**:prop 是唯一真相,插值只活在渲染层。 想读"当前显示值"得自己在 signal 里维护。
:::

- 缓动曲线固定为 ease-out,不可自定义;无 keyframes、无 transition-delay。
- 颜色过渡 v1 不做。
- value / padding / gap / margin / flexGrow 刻意排除:前者的过渡会与脚本自己的受控写回打架,后者半像素中间值会让文字穿透。
- 静止时零开销(没有活动动画就不续表)。
