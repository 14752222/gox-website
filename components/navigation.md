---
title: 导航与菜单：menubar 菜单栏 / 右键菜单
description: Gox GUI 导航：自绘 menubar 菜单栏与下拉/子菜单（快捷键全局生效、键盘导航），openContextMenu 数据式右键菜单 API。
---

# 导航与菜单：menubar 菜单栏 / 右键菜单

### `<menubar> / <menu> / <menuitem>` {#menubar}

`稳定` · `弹层`

自绘菜单栏 + 下拉菜单 + 子菜单。支持互斥展开、点击外部关闭、键盘导航,菜单项可挂全局快捷键。

| 元素 | Prop | 说明 |
| --- | --- | --- |
| menubar | — | **普通容器**:高度固定 26px,横向排列子项 |
| menubar | 子节点 | `<menu>` 标题与任意其它元素(如右侧的 status 文本) |
| menu | label | 菜单标题(顶级)或多个菜单项的容器(子菜单) |
| menu | 子节点 | `<menuitem>` / `<separator>` |
| menuitem | label | 菜单项文本 |
| menuitem | shortcut | 快捷键文本,如 `"Ctrl+S"`。显示在右侧,并**全应用生效**(无需展开菜单) |
| menuitem | disabled | 灰字,点了没反应 |
| menuitem | onClick | 点击触发;快捷键命中时收到 `{x, y, shortcut}` |

```js
<column>
  <menubar>
    <menu label="File">
      <menuitem label="New"  shortcut="Ctrl+N" onClick={() => say("New")} />
      <menuitem label="Open" shortcut="Ctrl+O" onClick={() => say("Open")} />
      <separator />
      <menuitem label="Save As" disabled={true} onClick={() => say("不该被触发")} />
    </menu>

    <menu label="View">
      <menuitem label="Zoom In" onClick={() => say("Zoom In")} />
      <!-- 子菜单:在 menuitem 里再嵌一个 menu -->
      <menuitem label="Theme">
        <menu>
          <menuitem label="Dark"  onClick={() => say("Dark")} />
          <menuitem label="Light" onClick={() => say("Light")} />
        </menu>
      </menuitem>
    </menu>

    <text>ready</text>    {/* menubar 是普通容器,右侧放什么都行 */}
  </menubar>

  <column gap={12} padding={16}>
    {/* 窗口主体内容 */}
  </column>
</column>
```

#### 快捷键规则

快捷键表在 Go 侧(`Pump` 层)匹配 —— 因为 JS 看不到已被输入框消费的按键。规则:

- 只认带 Ctrl / Alt 的组合。shortcut="S" 这种裸字母键不会被受理(否则全应用都打不出 s)。
- 修饰键全等比较:Ctrl+S 不会被 Ctrl+Shift+S 触发。
- Cmd 自动归一到 Ctrl。
- 菜单项没有 onClick 也可以挂 shortcut,只是命中后无事发生。

#### 键盘导航

焦点在菜单栏时:`←` / `→` 在标题间循环切换(换过去就展开), `↓` / `Enter` / `Space` 展开, `Esc` 收起当前层。

- 无鼠标滑过切换标题、无悬停自动展开子菜单、无勾选项(checked menu item)。
- 分隔线本身也能命中(命中测试只认带处理器的节点,所以每一行都挂了内置处理器)。

### openContextMenu(x, y, items) {#context-menu}

`稳定` · `弹层` · `同步 API`

在指定坐标就地弹出右键菜单。**这是数据式 API,不是 `contextMenu` prop** —— 理由见下方提示。

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| x, y | number | 弹出的屏幕坐标,通常来自 `onContextMenu` 的 `e.x`/`e.y` |
| items | array | `<menuitem>` / `<separator>` 元素数组,与菜单栏里的写法完全一致 |

```js
import { h, render, openContextMenu } from "gx/gfx";

<rect
  width={340}
  height={140}
  background="#e8eef7"
  onContextMenu={(e) =>
    openContextMenu(e.x, e.y, [
      <menuitem label="Copy"    shortcut="Ctrl+C" onClick={() => say("Copy")} />
      <menuitem label="Paste"   shortcut="Ctrl+V" onClick={() => say("Paste")} />
      <separator />
      <menuitem label="Inspect" onClick={() => say("Inspect")} />
    ])
  }
/>
```

::: info 为什么不做成 prop
JSX 元素是**单次挂载**的对象,一个节点只有一个 `Parent` 字段。 把同一个 `<menu>` 做成 prop 挂到多处会互相争抢宿主。做成"每次调用现构造一份"的数据式 API 就没有这个问题。
:::

行为:靠近屏幕右下角时会自动向左上翻折保证整块可见;点选项或点外部关闭;在菜单上再点右键会被吞掉(不会误关)。

### `<tabs> / <tab>` {#tabs}

`稳定` · `容器`

选项卡:顶部标签条(自绘,激活项主题绿 + 下划线)+ 内容区。`<tab>` 直接堆在 `<tabs>` 下即为页,页内容按 column 语义竖排(多元素不必再包一层容器)。

| 元素 | Prop | 说明 |
| --- | --- | --- |
| tabs | value | 存在即**受控**:激活页 = `value`(数字,越界自动钳位),点击标签条**不改内部状态**,只派发 `onChange` 等脚本写回 signal —— 不回写就是切不动(受控的定义) |
| tabs | onChange | 切页时收到 `{index, title}`,受控/非受控都派发 |
| tab | title | 标签条文字,缺省兜底 `Tab N` |
| tab | 子节点 | 页内容;**全部页都是 keep-alive 的** —— 节点留树,输入框打的字、滚动位置切走再回来都还在,非激活页只是不布局、不绘制、不命中 |

```js
import { createSignal } from "gx/solid";
import { h, render } from "gx/gfx";

const [tab, setTab] = createSignal(0);

<tabs value={() => tab()} onChange={(e) => setTab(e.index)}>
  <tab title="文件">
    <input width={240} placeholder="切走再回来,打的字还在" />
  </tab>
  <tab title="编辑">
    <text>编辑页</text>
  </tab>
</tabs>
```

::: info keep-alive 与条件渲染的区别
`<tabs>` 的页语义与 [`show` 指令](/components/patterns#reactive)、路由 `keepAlive` 是同一套哲学:隐藏 ≠ 销毁。想要"每次切来都全新构建",请在 `value` 驱动下用条件渲染自己写。
:::
