---
title: 组件参考：总览与共同约定
description: Gox GUI 组件参考总览：25 个内置元素的分类地图，以及导入方式、响应式绑定、受控语义、样式写法、未知标签警告五个共同约定。
---

# 组件参考：总览与共同约定

## 先读:五个共同约定 {#concepts}

下面每个组件只说自己的差异,但这五条对**所有**组件都成立。先理解它们,后面的表格会好读很多。

### ① 导入方式

JSX 需要 `h` 在作用域里,所以每个 GUI 脚本都要从 `gx/gfx` 引入它; 响应式信号来自 `gx/solid`:

```js
import { createSignal } from "gx/solid";
import { h, render } from "gx/gfx";
```

JSX 标签在编译期被降级成 `h(tag, props, ...children)` 调用,所以 `h` 是**必须导入**的 —— 哪怕你一次都没显式调用它。也可以用 `h()` 手写树,与 JSX 完全等价。

### ② 响应式:传函数就是绑定

任何 prop 或文本子节点,只要传**函数**,就会被包成 effect:函数体里读到的 signal 变化时, 这个值自动重新求值并标脏该区域。

```js
<text>静态文本</text>                      // 直接写的文本求值一次,固定值永不更新(不需要大括号)
<text>{"静态文本"}</text>                 // 大括号里是普通表达式,同样只求值一次(与上一行等价)
<text>{() => `count: ${count()}`}</text>   // 函数 → 响应式绑定

<rect width={200} />                      // 固定宽
<rect width={() => count() * 20} />       // 宽度跟随 count
```

::: info 依赖来自"函数体里读到了什么"
没有读取就没有订阅。把 `count()` 藏进 `if (ctx.width > 0)` 这类 运行时可能不进入的分支里,订阅就收不到 —— 表现为"数据变了界面不动"。
:::

### ③ 受控组件:显示只看 prop,编辑只派发事件

所有输入类组件(`input` / `textarea` / `select` / `slider` / `checkbox` / `radio` / `switch` / `progress` / `dialog`)都**不存自己的状态**。 它们显示什么完全由 prop 决定,用户操作只派发回调。

```js
// 推荐(2026-09-20 起):一条指令接好读与写
<input model={name} />                       // input / textarea / slider / select 读写 value
<checkbox model={agree} />                   // checkbox / switch 读写 checked(写入取反)
<radio model={plan} value="pro" />           // radio:选中时把 value 属性写进 model
<input model={[() => user().name, (v) => setUser({ ...user(), name: v })]} />   // 自定义来源

// 手写等价物:onInput 里把值写回 signal,显示才会变
<input value={() => name()} onInput={(e) => setName(e.value)} />

// 错误:不回写 → 敲键盘没反应(显示永远来自 value prop)
<input value={() => name()} onInput={(e) => console.log(e.value)} />
```

滑块不回写会"弹回原位",显示"拖不动";输入框不回写则"打字没反应"。这与 DOM 受控组件的语义一致。 `model` 收 **signal**(`createSignal` 的 getter,自带 `.set`)或 **`[get, set]` 二元组**; 与元素自己的 `onInput` 等回调**可以并存**(写回在前,两个都跑); 写错(如 `model={name()}`)会打一条去重警告,不会静默。

### ④ 尺寸、颜色与装饰的写法

尺寸默认是**整数像素**,但也接受**百分比字符串**(如 `width="50%"`,按父容器内容区解析),并可用 `minWidth` / `maxWidth` 等钳位。 颜色支持命名色与 `#rgb` / `#rgba` / `#rrggbb` / `#rrggbbaa` / `rgb()` / `rgba()`,其中 alpha 可写 `0~255` 或 `0~1`。

| 属性 | 作用于 | 说明 |
| --- | --- | --- |
| `width` / `height` / `margin` | 所有元素 | 数字为整数像素,也接受 `"50%"` 百分比;不写时由 `intrinsicSize` 按内容算 |
| `minWidth` / `maxWidth` / `minHeight` / `maxHeight` | 所有元素 | 尺寸钳位,在所有分配落定后生效 |
| `padding` | 容器 | 四边统一值,不可分边设置 |
| `gap` | column / row / grid | 子元素间距;grid 里同时是行间距与列间距 |
| `background` | 所有元素 | 容器上是填充色;**组件标签上是"强调色"语义**(选中填充、进度前景、开关轨道)。**可写线性渐变**:`"linear-gradient(to right, #a, #b)"` |
| `border` / `borderWidth` / `borderStyle` | 所有元素 | 描边色 + 宽度(缺省 1)+ 样式(`solid` / `dashed`) |
| `radius` | 所有元素 | 圆角半径,自动钳到短边一半(够大即胶囊形) |
| `shadow` | 所有元素 | <code v-pre>{{x, y, blur, color}}</code>,四项全可省;blur 钳 0~24,color 缺省 25% 黑 |
| `color` | 所有元素 | 文本色。CSS 式继承:**自身 → 最近祖先 → 缺省近黑**,所以 `<button color="#fff">文字</button>` 这类写法生效 |
| `font` | 所有元素 | 像素字号。同样沿祖先链继承:**自身 → 最近祖先 → 16**(小于 8 的值被忽略) |
| `disabled` | 所有元素 | 沿祖先链继承;子树既不响应事件也不参与焦点切换,整体降饱和 |

```js
<!-- 卡片:圆角 + 渐变底 + 阴影 + 2px 虚线框 -->
<column
  gap={8} padding={14}
  radius={12}
  background="linear-gradient(to bottom, #ffffff, #eef2f8)"
  shadow={{ x: 0, y: 4, blur: 12, color: "#00000033" }}
  border="#c9d4e2" borderWidth={2} borderStyle="dashed"
>
  <text>card</text>
</column>
```

::: info 装饰的生效范围
圆角 / 渐变 / 阴影 / 边框宽度作用于**通用盒子分支**(`rect`、`column`、`row`、`grid` 等)与 `button`。`input` / `select` / `scroll` 等组件的**内部配色**不认这些属性。 另外渐变面不参与 button 的悬停提亮(提亮只定义在纯色面); `radius=0` 的纯色填充与 1px 实线边框走零开销快路径,性能与不加装饰完全一致。
:::

### ⑤ 未知标签会被警告

`h()` 对标签名做白名单校验,集合外的标签会往 stderr 打印**一次**警告并渲染成普通盒子:

```text
gfx: unknown tag "foo" (rendered as a plain box; see docs/gui-guide.md)
```

这是刻意设计的 —— 没登记的组件此前会静默渲染成空白,最难排查。看到这行警告就说明标签名拼错了或用了未实现的组件。

::: warning 通用盒子不布局子元素
非 `column` / `row` 的标签(包括未知标签、`rect`) 即使有了尺寸,子元素也**全部叠在左上角**。需要分组容器就老实用 `<column>` 或 `<row>`。
:::
