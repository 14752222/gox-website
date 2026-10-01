---
title: 表单控件：button / input / select / slider
description: Gox GUI 表单控件：button、checkbox/radio/switch、input、textarea、select 下拉框、rating 星级、slider 滑块 —— 全部受控组件，model 双向绑定一条顶两条。
---

# 表单控件：button / input / search / select / rating / slider

全部是受控组件,显示只看 prop,交互只派发回调(见[第 0 节约定 ③](/components/))。

### `<button>` {#button}

`稳定` · `受控外观`

按钮。尺寸按内容自适应(文本 + 8px 左右内边距),文本垂直居中;自带悬停提亮与按压压暗反馈。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| onClick | function | 左键抬起时触发。**回调没有参数** |
| disabled | boolean | 整体降饱和,点击被拦截,也不抢键盘焦点 |
| background | 颜色 | 强调色,缺省浅灰 `#e8e8e8` |
| border | 颜色 | 缺省 1px `#999` |
| color | 颜色 | 文字色,缺省深色 |

```js
<button onClick={() => setCount(c => c + 1)}>默认按钮</button>

<button
  background="#1a5fb4"
  border="#1a5fb4"
  color="#ffffff"
  onClick={() => setCount(c => c + 1)}
>自定义配色</button>

<button disabled={true} onClick={() => setCount(c => c + 100)}>禁用按钮</button>
```

### `<checkbox> / <radio> / <switch>` {#checkbox}

`稳定` · `纯受控`

三个布尔开关控件。勾选框 18×18,开关 36×20(方形轨道 + 16×16 滑块),单选框是 1px 圆环 + 中心实心点。 三者都**不自带任何状态** —— 勾上还是不勾,完全由 `checked` prop 决定。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| checked | boolean / function | 是否选中。通常传函数绑定 signal |
| onClick | function | 点击时触发,无参数;自己在回调里翻转 signal |
| disabled | boolean | 点击被拦截 |
| background | 颜色 | 选中态填充色(强调色语义) |

::: info 单选互斥要自己实现
内核里没有"radio group"。做法是让一组 radio 共享**同一个 signal**, 把 `checked` 写成"值相等"的比较即可,无需额外的分组容器。
:::

```js
const [agree, setAgree] = createSignal(false);
const [size, setSize] = createSignal("S");
const [notify, setNotify] = createSignal(true);

<row gap={8} alignItems="center">
  <checkbox checked={() => agree()} onClick={() => setAgree(v => !v)} />
  <text>{() => (agree() ? "Agreed" : "Not agreed")}</text>
</row>

<!-- 互斥靠"共享 signal + 比较值" -->
<row gap={14} alignItems="center">
  <row gap={4} alignItems="center">
    <radio checked={() => size() === "S"} onClick={() => setSize("S")} />
    <text>S</text>
  </row>
  <row gap={4} alignItems="center">
    <radio checked={() => size() === "M"} onClick={() => setSize("M")} />
    <text>M</text>
  </row>
</row>

<row gap={8} alignItems="center">
  <switch checked={() => notify()} onClick={() => setNotify(v => !v)} />
  <text>{() => (notify() ? "Notifications on" : "Notifications off")}</text>
</row>
```

### `<input>` {#input}

`稳定` · `IME:仅 Windows`

单行文本输入。获焦时边框转蓝并出现闪烁竖线光标;点击框内任意位置可把光标落到最近的字符边界。 支持 `Backspace` / `Delete` / `←` / `→` / `Home` / `End`, 以及 Windows 上的中文输入法**整批提交**。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| value | string / function | 显示内容,显示**只看它** |
| model | signal / [get, set] | **双向绑定指令**:一条顶上面两条(`value` + `onInput`),推荐写法。见[第 0 节约定 ③](/components/) |
| onInput | function | 内容变化时派发,收到 `{value}`(**string**)。移动光标不派发 |
| placeholder | string | 值为空时以灰字显示;此时光标停在最左,不被灰字挤走 |
| onKeyDown / onKeyUp | function | 未被消费的键冒泡上来,收到 `{key, ctrl, shift, alt}` |
| onFocus / onBlur | function | 焦点进入 / 离开 |
| width | number | 缺省 160(刻意不按内容算宽,也不参与交叉轴 stretch) |
| disabled | boolean | 不可编辑、不参与焦点 |

#### 键盘归属

输入框只消费**编辑类**按键;其余一律放行给上层,这样"输入框放在对话框里按 Esc 关掉"能照常工作。

| 按键 | 归属 |
| --- | --- |
| 方向键 / `Home` / `End` | 输入框**消费**(移动光标),不冒泡 |
| `Backspace` / `Delete` | 输入框消费(删字符) |
| `Enter` | **放行**给上层 —— 常用来做"回车提交" |
| `Escape` / `Tab` / 功能键 | 放行 |
| 带 `Ctrl` / `Alt` 的组合键 | 放行,留给脚本或全局快捷键表 |

```js
const [name, setName] = createSignal("");
const [enters, setEnters] = createSignal(0);

<input
  width={260}
  placeholder="Type your name"
  value={() => name()}
  onInput={(e) => setName(e.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") setEnters((n) => n + 1);
  }}
/>
```

::: warning 光标闪烁依赖事件泵醒着
窗口既没有事件、也没有任何定时器时,事件泵会在等待里睡着,光标就冻住了。 需要持续闪烁的应用挂一个空转的 `requestAnimationFrame` 循环即可:

```js
function tick() { requestAnimationFrame(tick); }
tick();
```
:::

- 无选区/拖选/复制粘贴按键(剪贴板要走 gx/gfx 的同步 API 手动接)。
- 单字符直输路径只认 BMP;中文等需经输入法提交通道(Windows 已支持,X11 暂无 IME)。
- 输入法提交不产生 `onKeyDown` —— 统计"敲了几次键盘"不能用它代替。

### `<search>` {#search}

`稳定` · `IME:仅 Windows`

`<input>` 的字段变体:左侧多一个放大镜,获焦时按 `Enter` **整段提交** `onSearch({value})` —— 逐键 `onInput` 之外再给一个明确的搜索提交点(与 DOM 搜索框一致)。其余(受控 value / model / placeholder / 光标 / 键盘归属 / IME)与 [`<input>`](#input) 完全相同。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| value / model / onInput / placeholder / width / disabled | — | 与 [`<input>`](#input) 完全一致 |
| onSearch | function | 获焦时按 `Enter` 派发,收到 `{value}`(**string**,当前受控值);带 `Ctrl` / `Alt` 的组合键不抢 |

```js
const [q, setQ] = createSignal("");

<search
  model={q}
  placeholder="Search…"
  width={260}
  onSearch={(e) => console.log("search:", e.value)}
/>
```

::: tip 与 `<input>` 的分工
用 `<input>` + `onKeyDown` 判键名也能做"回车提交";`<search>` 把这个最常见的形状做成了组件 —— 图标提示这是搜索位,`Enter` 有专门的 `onSearch` 事件,不必再在 `onKeyDown` 里手判键名。
:::

### `<rating>` {#rating}

`稳定`

星级评分:每颗星占一个方格,前 `value` 颗实心(可 `color` 覆盖,缺省主题强调色),其余空心描边。**完全受控**(与 [`<select>`](#select) 同一哲学):显示只看 `value`,点击第几格就派发 `onChange({value})`,值不变不派发(与分页器同款)。`model` 口径与 `select` 相同 —— 读 `value` / 写 `onChange`。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| value | number | 当前星级(0 = 全空;显示只看它) |
| max | number | 星数,缺省 5,上限 10 |
| color | color | 实心星颜色,缺省主题强调色 |
| disabled | boolean | 禁用(不命中、降饱和) |
| onChange | function | 点击派发,收到 `{value}`(**number**,第几颗星) |

```js
const [score, setScore] = createSignal(3);

<rating value={score()} onChange={(e) => setScore(e.value)} />
<rating value={7} max={10} color="#e01b24" />
```

### `<textarea>` {#textarea}

`稳定` · `IME:仅 Windows`

多行文本编辑。光标是二维的 `{行, 列}`,内容超出可视高度时纵向滚动,并且**滚动跟随光标** (在最后一行回车时不会把光标顶出框外)。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| value | string / function | 显示内容,受控 |
| onInput | function | 收到 `{value}`;输入法一次提交只派发一次 |
| rows | number | 可见行数,决定缺省高度 |
| placeholder | string | 空值时的灰字提示 |
| width / height | number | 显式尺寸 |
| onKeyDown | function | **不**含 `Enter`(被编辑框消费了),但 `Escape` 会冒泡上来 |
| disabled | boolean | 不可编辑 |

::: info 与 `<input>` 唯一的按键差异
多行框里 `Enter` 是**内容**(插入换行),所以它**消费** Enter; 单行框里 Enter 放行给上层。其余键序完全一致。
:::

```js
const [text, setText] = createSignal("");

<textarea
  rows={4}
  width={260}
  placeholder="Type here..."
  value={() => text()}
  onInput={(e) => setText(e.value)}
  onKeyDown={(e) => {
    if (e.key === "Escape") closeDialog();
  }}
/>
```

- 不做软换行:超长行被右侧裁掉,而不是折到下一行 —— 换行只由 \n 决定,这样"光标行号"与文本严格一一对应。
- 无选区、无撤销栈、无横向滚动。

### `<select>` {#select}

`稳定` · `弹层`

下拉框。点击展开选项弹层(自带逃逸裁剪,不会被 28px 的字段盒裁剪,也不会被后面的兄弟节点盖住), 支持键盘开合与移动高亮。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| options | array | 字符串数组,或 `{value, label}` 对象数组 |
| value | string / function | 当前值,显示只看它 |
| onChange | function | 选中时派发,收到 `{value}` |
| placeholder | string | 无选中值时的灰字 |
| width | number | 字段宽度,缺省按内容 |
| disabled | boolean | 不可展开 |

**键盘操作**:获焦后 `Enter` / `Space` 展开, `↑` / `↓` 移动高亮(环绕),`Enter` 选中, `Esc` 收起。

```js
const CITIES = [
  { value: "sh", label: "Shanghai" },
  { value: "bj", label: "Beijing" },
  { value: "sz", label: "Shenzhen" },
];

const [city, setCity] = createSignal("sh");

<select
  width={220}
  options={CITIES}
  value={() => city()}
  onChange={(e) => setCity(e.value)}
/>

<!-- 也支持纯字符串数组 + placeholder -->
<select
  width={220}
  placeholder="Pick a fruit"
  options={["apple", "banana", "cherry"]}
  value={() => fruit()}
  onChange={(e) => setFruit(e.value)}
/>
```

::: tip 点外部关闭会吞掉那一次点击
弹层展开时点击画面别处,这次点击只用来收起弹层,**不会**顺带按到下面的控件 —— 避免"关下拉框时误触发按钮"。
:::

### `<slider>` {#slider}

`稳定` · `拖动独占`

滑块。拖动滑块或**单击轨道任意位置跳值**都会更新;拖动期间鼠标捕获由后端提供,拖出窗口仍然跟手。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| value | number / function | 当前值,决定滑块位置 |
| onInput | function | 拖动/点击时派发,收到 `{value}` —— **是 number,不是字符串** |
| min / max | number | 取值范围,缺省 0 / 100 |
| step | number | 步长,缺省 1;`step <= 0` 表示连续取值 |
| width | number | 缺省 160 |
| disabled | boolean | 拖不动,整体降饱和 |

```js
const [vol, setVol] = createSignal(40);

h("slider", {
  width: 200, min: 0, max: 100, step: 5,
  value: () => vol(),
  onInput: (e) => setVol(e.value),     // e.value 直接当数字用,不用 parseFloat
}),

// 数值只会落在 0/2/4/6/8/10 上
h("slider", { width: 200, min: 0, max: 10, step: 2,
  value: () => zoom(), onInput: (e) => setZoom(e.value) }),

// 禁用态
h("slider", { width: 200, min: 0, max: 100, step: 5, value: 70, disabled: true })
```

- 无纵向滑块、无双端 range、无刻度/数值标签、无键盘微调(←/→)。
- 拖动是独占手势:期间鼠标划过别的控件不会给它们加悬停高亮。
- 量程异常值会被安全处理:max < min 塌缩到 min,NaN 不污染几何。
