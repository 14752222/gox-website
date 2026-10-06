---
title: 表单控件：button / input / select / datepicker / colorpicker / upload
description: Gox GUI 表单控件：button、checkbox/radio/switch、input、textarea、search、select 下拉框、rating 星级、slider 滑块、label/form 表单容器、datepicker 日期选择器、colorpicker 取色器、upload 文件选择 —— 全部受控组件，model 双向绑定一条顶两条。
---

# 表单控件：button / input / search / select / rating / slider / datepicker / colorpicker / upload

全部是受控组件,显示只看 prop,交互只派发回调(见[第 0 节约定 ③](/components/))。唯一的例外是 [`<upload>`](#upload):选文件的结果(系统给的路径)无法由脚本自己构造,所以它**受控/非受控两用**。

::: tip 各小节顶部的截图不是画的,是渲染出来的
截图由 [`testdata/shots/<组件>.js`](https://github.com/14752222/Gox/tree/main/testdata/shots) 经离屏光栅化生成(弹层类拍的是展开态),图上就是渲染层真实会画出的像素。本仓库提交的是 macOS 一套;Windows / Linux 由 [CI 矩阵](https://github.com/14752222/Gox/blob/main/.github/workflows/desktop-shots.yml)各出一套 artifact —— 字体来自各平台系统字体,三平台的像素本来就该不一样。自己重新生成:`GOX_SHOTS_OUT=<目录> go test ./gfx/ -run TestGalleryShotScripts`。
:::

### `<button>` {#button}

![button 组件截图](/components/shots/darwin/button.png)

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

**键盘操作**:Tab 停到按钮上之后,`Enter` 或 `Space` = 点一下(走同一个 `onClick` 出口,不另写一份键盘逻辑)。图标按钮(只有图形没有文字)记得给名字:`aria-label="删除"` —— 否则 `focusOrder()` 里它是一个无名控件。

### `<checkbox> / <radio> / <switch>` {#checkbox}

![checkbox / radio / switch 组件截图](/components/shots/darwin/checkbox.png)

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

**键盘操作**:三个都在 Tab 序里;`Enter` / `Space` **= 点一下**(走同一个 `onClick`),所以取反逻辑不用为键盘重写一遍。一组 `radio` 在 Tab 序里只占**一个**停留点(停留点是"当前选中的那个",没有选中的就是组里第一个),进组之后 `←` / `↑` / `→` / `↓` 在组内移动**并且选中跟着焦点走**(ARIA 约定)。

`radio` 的分组键是 `name` prop;不写时按"同一个父节点"分组 —— 所以"两个 radio 并排当开关用"这种最简用法不用被迫起名,但一个容器里**两组**单选必须给不同的 `name`。

### `<input>` {#input}

![input 组件截图](/components/shots/darwin/input.png)

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
| `Enter` | **放行**给上层 —— 表单层据此"回车提交"(见 [`<form>`](#form)) |
| `Escape` / 功能键 | 放行 |
| `Tab` / `Shift+Tab` | **无障碍层消费**(离开这个字段,不插入制表符);遍历序为空时才放行 |
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

![search 组件截图](/components/shots/darwin/search.png)

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

![rating 组件截图](/components/shots/darwin/rating.png)

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

**键盘操作**:获焦后 `←` / `→` 减 / 加一颗星(派发 `onChange({value})`,值不变不派发);`Enter` / `Space` 不改变值(评分是"选第几颗",没有"展开"这一步)。

### `<textarea>` {#textarea}

![textarea 组件截图](/components/shots/darwin/textarea.png)

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
多行框里 `Enter` 是**内容**(插入换行),所以它**消费** Enter; 单行框里 Enter 放行给上层。其余键序完全一致 —— 包括 `Tab`(`Shift+Tab`)由无障碍层消费为"离开这个字段",不插入制表符。
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

![select 组件截图](/components/shots/darwin/select.png)

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

**键盘操作**:获焦后 `Enter` / `Space` 展开, `↑` / `↓` 移动高亮(环绕),`Enter` 选中, `Esc` 收起。未展开时按 `↑` / `↓` 会**先展开**;展开中按 `Tab` / `Shift+Tab` 会先收起再移动焦点(Tab 是"离开这个字段"的动作,弹层跟着走会让人以为焦点还在下拉里)。

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

![slider 组件截图](/components/shots/darwin/slider.png)

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

- 无纵向滑块、无双端 range、无刻度/数值标签。
- **键盘可以微调**:获焦后 `←` / `↓` 减一个 `step`,`→` / `↑` 加一个 `step`(到端点**停住**,不绕回),派发的是与拖动同一个 `onInput({value})` —— 所以 `step ≤ 0`(连续取值)时方向键按 1 走。
- 拖动是独占手势:期间鼠标划过别的控件不会给它们加悬停高亮。
- 量程异常值会被安全处理:max < min 塌缩到 min,NaN 不污染几何。

### `<label>` {#label}

![label 组件截图](/components/shots/darwin/label.png)

`稳定`

字段标签。单行文字 + 可选的**必填星号**;`align="right"` 时整段贴内容区右缘(表单里标签列右对齐是最常见的排版需求)。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| required | boolean | 在文字之后画一个红色 `*` |
| align | `"right"` | 右对齐;缺省左对齐 |
| width / height | number | 标签列宽靠它对齐(见下方示例) |
| color / font | — | 与所有元素一致,沿祖先链继承 |

```js
<row gap={8} alignItems="center">
  <label width={72} required>手机号</label>
  <input model={phone} placeholder="11 位手机号" />
</row>

<row gap={8} alignItems="center">
  <label width={72} align="right">邮箱</label>
  <input model={mail} />
</row>
```

::: tip 星号是标记,不是内容
`<label required>姓名</label>` 的文本内容仍然是 `"姓名"` —— 星号不进 `TextContent()`, 也不进无障碍名,更不会混进[表单取值](#form)。纯视觉标记不该污染数据面。
:::

### `<form>` {#form}

![form 组件截图](/components/shots/darwin/form.png)

`稳定`

表单容器:纵排(语义与 [`<column>`](/components/layout) 一致),缺省行距 10px,并且是**回车提交**与**整表取值**的归属节点。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| gap | number | 行距,缺省 10 |
| onSubmit | function | 收到 `{values}` —— 一个 `{name: 值}` 对象 |
| 其它 | — | 与 column 一致(padding / background / width …) |

```js
const [name, setName] = createSignal("");
const [note, setNote] = createSignal("");
const [birthday, setBirthday] = createSignal("");
const [tint, setTint] = createSignal("#1e88e5");
const [files, setFiles] = createSignal([]);

<form gap={12} padding={16} onSubmit={(e) => save(e.values)}>
  <row gap={8} alignItems="center">
    <label width={72} required>姓名</label>
    <input name="name" model={name} />
  </row>
  <row gap={8} alignItems="center">
    <label width={72}>出生日期</label>
    <datepicker name="birthday" model={birthday} />
  </row>
  <row gap={8} alignItems="center">
    <label width={72}>主题色</label>
    <colorpicker name="theme" model={tint} />
  </row>
  <row gap={8} alignItems="center">
    <label width={72}>附件</label>
    <upload name="resume" model={files} accept=".pdf,.png" />
  </row>
  <row gap={8}>
    <label width={72}>备注</label>
    <textarea name="note" model={note} height={60} />
  </row>
  <button onClick={() => submitForm()}>保存</button>
</form>
```

- **回车提交**:焦点在 `input` / `search` 里按 `Enter` 会提交所在的 form(浏览器里 `<input>` 回车提交表单的同一套直觉)。焦点在按钮 / 复选框 / 下拉上按 `Enter` 归它们自己,不会顺手提交。
- **只收带 `name` 的字段**:与 HTML 表单一致。没有 `name` 的字段不进 `values`,免得后端收到一堆空键。
- 取值一律读**受控 prop**:所以"提交上去的是旧值"只有一个原因 —— 脚本没收 `onInput` / `onChange` 写回 signal(那就是受控的定义,不是 bug)。
- 关闭的弹层里的字段不算(它们的值不属于这次提交)。

### `<datepicker>` {#datepicker}

![datepicker 组件截图](/components/shots/darwin/datepicker.png)

`稳定` · `弹层` · `纯受控`

日期选择器:28px 字段行(当前值 + 右侧日历图标),点击展开**日历弹层**(月份头 `‹ 2026年11月 ›` + 星期行 + 日期格 + 底部回显)。与 [`<select>`](#select) 同一套"字段 + 贴字段弹层"交互模型(弹层自带逃逸裁剪)。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| value | string / function | 当前日期,格式 `"YYYY-MM-DD"`。**不认的格式当没有值**(显示 placeholder),不会猜一个相近日期 |
| onChange | function | 选中时派发,收到 `{value}`(字符串,`"YYYY-MM-DD"`) |
| min / max | string | 可选范围(`"YYYY-MM-DD"`)。范围外的格子画成灰字、点了没反应 |
| placeholder | string | 无值时的灰字,缺省 `请选择日期` |
| width | number | 字段宽度,缺省按内容(不小于 130) |
| disabled | boolean | 不可展开 |

**键盘操作**(获焦后):

| 键 | 未展开 | 已展开 |
| --- | --- | --- |
| `Enter` / `Space` | 展开 | 选中光标那天 |
| `←` / `→` | 展开 | 前后一天(可跨月) |
| `↑` / `↓` | 展开 | 前后一周 |
| `PageUp` / `PageDown` | 展开 | 前后一月(日子按目标月天数钳位) |
| `Home` / `End` | — | 本月首 / 末日 |
| `Esc` | — | 收起 |

```js
const [birthday, setBirthday] = createSignal("");

<datepicker model={birthday} />

<datepicker
  value={birthday()}
  onChange={(e) => setBirthday(e.value)}
  min="2020-01-01"
  max="2030-12-31"
  placeholder="请选择日期"
/>
```

- 字段显示的是 `value` 原文;`min` / `max` 之外的日期画成灰字(今天的那一格带一圈强调色描边)。
- 「今天」只用于描边与"没有 value 时展开到哪个月",不参与取值 —— 缺省值仍然是**空**,不会偷偷替你选今天。
- v1 边界:只认 `"YYYY-MM-DD"` 一种格式;无范围选择(range)、无时间部分;弹层不会向上翻转(字段贴着窗口底边时会被裁掉)。

### `<colorpicker>` {#colorpicker}

![colorpicker 组件截图](/components/shots/darwin/colorpicker.png)

`稳定` · `弹层` · `纯受控`

取色器:28px 字段行(左侧色块 + 十六进制文本),点击展开**色板弹层**(N×M 色块 + 底部回显光标色)。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| value | string \| `{r,g,b}` / function | 当前颜色。字符串原样显示(`#rgb` / `#rrggbb` / `#rrggbbaa` 都认);对象按 `{r,g,b}`(0~255,与 canvas 的 ImageData 同字段名)转成 `#rrggbb` |
| colors | string[] | 色板;缺省 24 色(灰阶 + 色环)。**显式给 `[]` 就是空色板**(常见于"色板还没加载完"),不会回落到缺省色 |
| columns | number | 色板列数,缺省 8 |
| onChange | function | 选中时派发,收到 `{value}`(色板里那一格的字符串) |
| placeholder | string | 无值时的灰字,缺省 `选择颜色` |
| width | number | 字段宽度,缺省按内容 |
| disabled | boolean | 不可展开 |

**键盘操作**:`Enter` / `Space` 展开(再按选中光标那格);`←` / `→` 前后一格,`↑` / `↓` 上下**一列**;`Home` / `End` 首 / 末格;`Esc` 收起。方向键在边界**停住**而不是绕回(色板是二维的,绕回会让"往上按"跳到最下面)。

```js
const BRAND = ["#1e88e5", "#43a047", "#fdd835", "#e53935", "#000000"];
const [tint, setTint] = createSignal("#1e88e5");

<colorpicker model={tint} />

<colorpicker value={tint()} colors={BRAND} columns={5}
             onChange={(e) => setTint(e.value)} />

// 值也可以写成 {r,g,b}
<colorpicker value={{ r: 30, g: 136, b: 229 }} colors={BRAND} />
```

- 字段上的小色块按当前值填充;值解析不出来时只画一个**空框** —— 空框比"一个不对的颜色"更容易让人发现自己写错了。
- 同一个颜色的大小写 / 空白差异("`#FFF`" 与 "`#ffffff`")不会造成误派发:点当前值不发 `onChange`。
- v1 边界:只有预设色板,没有取色盘(HSV 色环 + 饱和度方块)、没有吸管、没有自定色输入框。想要任意色就自己写一个 `<canvas>` + `onDraw`,或者用 `<input>` 收十六进制串。

### `<upload>` {#upload}

![upload 组件截图](/components/shots/darwin/upload.png)

`稳定` · `受控/非受控两用` · `需要平台对话框`

文件选择:28px 虚线边框字段行(文件夹图标 + 已选文件的**文件名**列表)。点击直接调平台的原生"打开文件"对话框(**没有弹层**)。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| value | string[] \| `{name, path}`[] / function | **有它就是受控**:字符串数组(路径),或对象数组(路径取 `path` 字段)。没有它则内部维护已选列表(非受控) |
| onChange | function | 选择之后派发,收到 `{files, paths}`:`paths` 是字符串数组,`files` 是 `[{name, path}]` |
| multiple | boolean | `true` 时每次选择**累加**;缺省 `false` 时**替换** |
| accept | string | HTML `accept` 风格的后缀串,如 `".png,.jpg"` 或 `"image/*"` |
| filter | string \| string[] \| `{name, pattern}` | 完整形态的过滤规则,如 `"图片|*.png;*.jpg"`。**与 `accept` 同时写时 `filter` 优先** |
| title | string | 原生对话框标题,缺省 `选择文件` |
| placeholder | string | 未选文件时的灰字,缺省 `选择文件` |
| width | number | 字段宽度,缺省不小于 180 |
| disabled | boolean | 不弹对话框 |

**键盘操作**:获焦后 `Enter` / `Space` 打开文件对话框。

```js
// 非受控:选完立刻显示(内部列表),onChange 当通知用
<upload multiple accept=".png,.jpg" onChange={(e) => upload(e.paths)} />

// 受控:显示只看 value,选择后等脚本回写
const [files, setFiles] = createSignal([]);
<upload value={files()} multiple
        onChange={(e) => setFiles(e.paths)} />

// 结构化过滤 + 自定义标题
<upload title="选择附件" filter={["图片|*.png;*.jpg", "所有文件|*.*"]} />
```

::: warning 能力缺失时"点了没反应",不编造文件名
`<upload>` 依赖窗口后端的原生对话框能力(`gx/dialog` 的 `openFile`)。后端没实现时(如 Linux X11)会把提示打到 stderr 并返回"未选择", `<upload>` 只表现为"点了没反应" —— 刻意**不**静默编一个假文件名去填,那会让业务逻辑以为真的选到了文件。需要事前判断就查 `canIUse("dialog")`。

用户按下**取消**也不派发 `onChange`:取消不是"选了空"。
:::

- v1 边界:底层对话框一次只返回一个路径,所以 `multiple` 的语义是"多次选择累加";不做拖拽入框、不做上传进度(那是 `gx/http` 的事,组件只负责"选到文件"),也不做单个文件的删除叉 —— 受控态改 `value`,非受控态再选一次即可。
