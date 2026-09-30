---
title: 内容展示：text / image / progress / table / tree / 反馈与数据类
description: Gox GUI 内容展示与反馈组件：text 文本块（wrap 折行、ellipsis 省略）、image 图片（PNG/JPEG/GIF 同步解码）、progress 进度条、table 数据表格、tree 树形控件、list-item 列表行，以及 alert / tag / badge / avatar / empty / icon / spinner / skeleton / pagination。
---

# 内容展示：text / image / progress / table / tree / 反馈与数据类

### `<text>` {#text}

`稳定`

文本。它是**文本块唯一载体** —— JSX 里的裸字符串子节点会变成隐式的 `#text` 节点, 而 `#text` 永远是单行的。想折行必须用 `<text>` 并开 `wrap`。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| font | number | 像素字号 |
| color | 颜色 | 文本色,沿祖先链继承 |
| wrap | boolean | true 时按可用宽度贪心折行,高度按行数增长 |
| ellipsis | number | 限制**行数上限**,超出补 "…";**隐含开启 wrap** |
| width / height | number | 折行需要一个宽度约束(显式 width,或父容器交叉轴 stretch) |

```js
<text font={20}>{() => `count: ${count()}`}</text>

<!-- 折行:给宽度,或者放在 column 里靠 stretch -->
<text wrap width={260} font={12}>
  {() => `value = "${text()}"`}
</text>

<!-- 最多两行,超出显示省略号 -->
<text wrap ellipsis={2} width={200}>{longDescription}</text>
```

::: info 开了 wrap 的文本块默认参与 stretch
否则它在 `column` 里会按"未折行的整行宽"撑开并溢出容器。 不想被拉满就显式写 `width`。另外文本块高度是"算两遍"的(父容器定下盒宽后回头重算), 这是实现细节,你不需要管,但要知道它意味着"折行文本的高度依赖父容器给的宽度"。
:::

### `<image>` {#image}

`稳定` · `同步解码`

图片显示。用 Go 标准库解码 PNG / JPEG / GIF(不引入新依赖),挂载时同步解码并带 16 项 LRU 缓存。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| src | string | 文件路径,**相对进程工作目录**解析 |
| width / height | number | 不给用图片自然尺寸;给了则最近邻缩放 |
| disabled | boolean | 罩一层半透明灰 |

```js
<image src="testdata/image_demo.png" />                    {/* 自然尺寸 */}
<image src="testdata/image_demo.png" width={96} height={96} />  {/* 最近邻放大 */}
<image src="testdata/missing.png" width={96} height={48} />     {/* 失败:灰底 + 交叉线 */}
```

- 路径按进程工作目录解释,不是"脚本所在目录"(脚本可能来自 stdin / 字符串 / 打包产物,没有所在目录这个概念)。从仓库根运行演示脚本时可写 testdata/xxx.png。
- 不支持网络 URL、无异步加载、无缩放质量选项(总是最近邻)。
- 加载失败画灰底 + 45° 交叉线占位,并每个路径只往 stderr 警告一次,不影响其它内容。

### `<progress>` {#progress}

`稳定`

进度条。`value` 取 0~1(自动钳位),缺省 200×8,轨道浅灰 + 前景绿。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| value | number / function | 0~1,超出范围自动钳位 |
| background | 颜色 | 前景色(强调色语义),缺省 `#27ae60` |
| width / height | number | 缺省 200×8 |

```js
// 用整数步进(0..10)而不是浮点累加,避免 0.30000000000000004 这类误差
const [step, setStep] = createSignal(0);
setInterval(() => setStep(s => (s >= 10 ? 0 : s + 1)), 400);

<progress value={() => step() / 10} />
<text>{() => `value: ${step() * 10}%`}</text>
```

## 反馈与数据类组件 {#feedback}

`alert` / `tag` / `badge` / `avatar` / `empty` / `icon` / `spinner` / `skeleton` / `pagination` 一组,
覆盖"提示、量化、空态、加载、分页"这些每个应用都会用到的槽位。一屏示例见
[`testdata/feedback_demo.js`](https://github.com/14752222/Gox/blob/main/testdata/feedback_demo.js)。

### `<alert>` {#alert}

`稳定` · `提示`

横幅提示。`level` 决定左侧色条与图标色。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| level | string | `info`(缺省) / `success` / `warn` / `error` |
| closable | bool | 为真时右上角出现关闭叉 |
| onClose | function | 点关闭叉时派发;**不替脚本摘树**,显隐归信号管 |

```js
const [show, setShow] = createSignal(true);
{() => show() && (
  <alert level="warn" closable onClose={() => setShow(false)}>
    Storage is almost full.
  </alert>
)}
```

### `<tag>` {#tag}

`稳定` · `标签`

小标签,可关闭。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| color | 颜色 | 胶囊底色,缺省浅灰 |
| closable | bool | 尾部出现关闭叉 |
| onClose | function | 点叉派发 |

### `<badge>` {#badge}

`稳定` · `容器`

角标。**包裹式**——唯一流内子节点是宿主,角标画在宿主右上角,自身尺寸完全跟随宿主。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| value | number | 数字角标;超过 `max` 显示 `max+`;0/负数自动隐藏 |
| max | number | 上限,缺省 99 |
| dot | bool | 小红点(不显示数字) |

```js
<badge value={5}><button><text>Inbox</text></button></badge>
<badge dot><icon name="bell" size={24} /></badge>
```

### `<avatar>` {#avatar}

`稳定`

头像方块/圆。显示 `name` 首字,`color` 为底色。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| name | string | 取首字显示 |
| size | number | 边长,缺省 40 |
| color | 颜色 | 底色,缺省主题蓝 |
| round | bool | 正圆(否则圆角方块) |

### `<empty>` {#empty}

`稳定`

空状态:居中占位图形 + `desc` 文案,子节点作插图。

```js
<empty desc="Nothing here yet"><icon name="folder" size={44} /></empty>
```

### `<icon>` {#icon}

`稳定`

内置图标。纯光栅原语(直线/矩形/圆)在 24×24 逻辑网格里绘制,三平台零依赖。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| name | string | 内置图标名(见下),未知名字静默不画 |
| size | number | 边长,缺省 16 |
| color | 颜色 | 缺省继承文字色(沿祖先链) |

内置清单:`home` / `search` / `user` / `gear` / `bell` / `chat` / `folder` / `calendar` /
`heart` / `plus` / `minus` / `close` / `check` / `arrow-left` / `arrow-right`。

```js
<row gap={12} align="center">
  <icon name="home" size={24} />
  <icon name="heart" size={24} color="#e01b24" />
</row>
```

### `<spinner>` / `<skeleton>` {#loading}

`稳定` · `加载态`

转圈与骨架屏。两者都靠**同一根动画心跳**持续重绘(与过渡动画共用 16ms 表,静止时一起停表,零开销)。

| 元素 | Prop | 说明 |
| --- | --- | --- |
| spinner | size / color | 边长(缺省 24)/ 刻度色 |
| skeleton | rows / avatar / active | 行数(缺省 3)/ 是否带圆形头像 / 是否呼吸闪烁(缺省真) |

### `<pagination>` {#pagination}

`稳定` · `受控`

分页器。**完全受控**——显示只看 `current`,点击页码只派发 `onChange`,等脚本把新值写回。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| total | number | 总条数 |
| pageSize | number | 每页条数,缺省 10 |
| current | number / function | 当前页(1-based,越界自动钳位) |
| onChange | function | 收到 `{page, pageSize}`;第 1 页点 `‹`、末页点 `›` 不派发 |

页数超过 7 时折叠出省略号(首尾恒可见、省略号不可点)。

```js
const [page, setPage] = createSignal(3);
<pagination total={200} pageSize={20} current={() => page()} onChange={(e) => setPage(e.page)} />
```
### `<table>` {#table}

`稳定` · `声明式数据`

数据表格。喂 `columns` + `rows` 两组数据即可,不需要手拼 `row`/`text` 的嵌套 —— 表头、网格线、对齐都由组件负责。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| columns | array | 列定义:字符串数组(简写)或 `{key, label, width?, align?}` 对象数组 |
| rows | array | 数据:二维数组(按列下标取)或对象数组(按 `key` 取) |
| zebra | boolean | 隔行浅灰底色,长表格更好读 |
| borderless | boolean | 去掉网格线(表头底线保留) |
| onRowClick | function | 行点击,收到 `{index, row}`;**不挂则行不可点** |
| width / height | number | 通常给 `width`;高度可交给内容算 |

**列宽**未显式给定时按该列内容的测量宽度占比分配剩余空间,所以不必逐列调宽度;想固定某列写 `width`。

```js
const FILES = [
  { name: "main.go", size: "1.2KB" },
  { name: "logo.png", size: "48KB" },
];

<table
  width={480}
  zebra
  columns={[
    { key: "name", label: "名称" },
    { key: "size", label: "大小", width: 90, align: "right" },
  ]}
  rows={FILES}
  onRowClick={(e) => console.log(e.index, e.row.name)}
/>
```

简写形式(字符串表头 + 二维数组数据)适合静态小表:

```js
<table columns={["页面", "耗时"]} rows={[["首页", "12ms"]]} />
```

::: info 行高与对齐
行高固定 **28px**,与 `select` / `input` 同一套常量,混排能对齐。`align` 针对**整列**(写在列定义上),取值 `left`(缺省)/ `right` / `center`。
:::

### `<tree>` {#tree}

`稳定` · `声明式数据`

树形控件。`nodes` 是递归数据,子节点通过 `children` 嵌套;展开/收起是**渲染层状态**,点一下有子节点的行就切换,不需要脚本回写。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| nodes | array | 节点数组:`{label, key?, children?}`,纯字符串数组当叶子简写 |
| onSelect | function | 点节点回调,收到 `{label, key, index, leaf}` |

**初始全收起**。展开态跨重建保留 —— 展开一个分支不会把别的分支收起来。

```js
<tree
  nodes={[
    { label: "src", children: [
      { label: "gfx", children: [{ label: "node.go" }] },
      { label: "main.go" },
    ]},
    { label: "README.md" },
  ]}
  onSelect={(n) => console.log(n.label, n.leaf)}
/>
```

::: info 缩进与占位
每层缩进 16px,箭头列 16px。**叶子节点不画箭头但保留占位宽度**,所以同层节点的文字左对齐 —— 这也是手拼 `row` 时最容易做漏的一点。
:::

### `<list-item>` {#list-item}

`稳定`

列表行。它是个普通容器(可以包任意内容),但带上了"行"这套跨应用一致的视觉约定:固定 28px 行高、左右 10px 留白、悬停高亮、选中底色、可选行底线。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| selected | boolean | 受控选中态,只影响底色,**状态由脚本持有** |
| divider | boolean | 行底线,缺省 **开**(写 `divider={false}` 关掉) |
| height | number | 缺省 28,与表格/字段控件对齐 |

搭配 `each` 指令与 `scroll` 就是一张列表:

```js
const [picked, setPicked] = createSignal(0);

<scroll height={200}>
  <view each={items}>
    {(item, i) => (
      <list-item selected={picked() === i} onClick={() => setPicked(i)}>
        {item}
      </list-item>
    )}
  </view>
</scroll>
```

::: info 悬停反馈只在可点时给
`selected` 优先于悬停底色(选中是持续态,不该被瞬时悬停盖掉);没挂 `onClick` 的行悬停**不变色** —— 对纯展示的行做悬停反馈会误导用户以为可点。
:::
