---
title: 布局容器：column / row / grid / scroll
description: Gox GUI 布局容器：column/row 主轴容器（gap、padding、flexGrow/flexShrink、百分比与钳位）、grid 等宽栅格、scroll 纵向滚动、separator/spacer/rect。
---

# 布局容器：column / row / grid / scroll

七个元素:两个方向的主轴容器(`column` / `row`)、等宽栅格(`grid`), 加上滚动(`scroll`)、分隔(`separator`)、占位(`spacer`)与通用盒子(`rect`)。

### `<column> / <row>` {#column}

`稳定` · `布局原语`

唯一的两个真布局容器。子元素按主轴依次排列(`column` 纵排、`row` 横排), 交叉轴可按 `alignItems` 对齐。尺寸未显式给出时按内容自适应。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| gap | number | 子元素间距(像素),缺省 0 |
| padding | number | 四边统一内边距,缺省 0 |
| alignItems | string | `stretch`(默认) / `start` / `center` / `end` |
| justifyContent | string | `start`(默认) / `center` / `end` / `between` |
| wrap | boolean | **仅 `<row>`**:一行放不下就折到下一行(标签流 / 工具栏换行) |
| width / height | number / string | 数字是像素;也接受 `"50%"` 这样的**百分比**(按父容器内容区解析)。不写则按内容算;作为根容器时不写则铺满窗口 |
| minWidth / maxWidth / minHeight / maxHeight | number | 尺寸**钳位**,在 stretch / grow / shrink / 百分比全部落定后生效;0 或缺省表示不约束 |
| background / border / color | 颜色 | 容器自身可描底与描边 |

子元素可写 `flexGrow`(吃主轴富余空间)与 `flexShrink`(主轴溢出时按 **系数 × 基础尺寸** 加权分摊收缩)—— 配合 `<spacer flexGrow={1}/>` 可以把两侧元素推到两端。

`<row wrap>` 折行时,`gap` 同时是行内间距与行间距; grow / shrink / justifyContent **只在行内生效、不跨行**,而 `alignItems` 作用于**行高**(不是容器总高)。 容器未显式给高时,高度按折行结果自动回填。 注意 `stretch` 会让无固有尺寸的子元素占满交叉轴, 而内置控件(按钮、输入框等)保持自己的内容尺寸。

```js
<column gap={12} padding={16}>
  <text font={18}>标题</text>

  <!-- 横向排列,垂直居中 -->
  <row gap={8} alignItems="center">
    <rect width={10} height={10} background="#27ae60" />
    <text>一行内容</text>
  </row>

  <!-- 两端对齐:spacer 吃掉中间所有空余 -->
  <row>
    <rect width={80} height={24} background="#c0392b" />
    <spacer flexGrow={1} />
    <rect width={80} height={24} background="#27ae60" />
  </row>
</column>
```

**屏幕适配的三种写法**(见 `testdata/elastic_layout_demo.js`):

```js
{/* ① 百分比:三等分卡片,改窗口宽度全程零 JS */}
<row gap={10}>
  <rect width="30%" height={60} background="#c0392b" />
  <rect width="30%" height={60} background="#27ae60" />
  <rect width="30%" height={60} background="#1a5fb4" />
</row>

{/* ② min/max 钳位 + grow */}
<rect flexGrow={1} minWidth={160} maxWidth={360} height={16} background="#f2c94c" />

{/* ③ 加权收缩:溢出时按 系数×基础尺寸 分摊 */}
<rect width={300} flexShrink={1} height={16} background="#8e44ad" />

{/* ④ 折行:标签流 / 工具栏 */}
<row wrap gap={8}>
  {() => tags().map((t) => <button>{t}</button>)}
</row>
```

- 仍未实现:order 与 alignSelf。
- 百分比子节点不撑大父容器(auto 尺寸下贡献 0,与 CSS 一致);格式不合法的百分比字符串会被静默忽略,回退固有尺寸。
- 钳位不回收差额:grow 超过 maxWidth 的富余不再分给别人(行为简单可预测)。

### `<grid>` {#grid}

`稳定` · `等宽栅格`

网格容器:子节点按声明序**行优先**自动填充到固定列数的格子里, 列宽与行高按该轨道内最大的内容项取。适合做卡片阵列、图标面板、表单分组。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| columns | number | 列数,缺省 1;自动钳到 `[1, 32]` |
| gap | number | 列间距与行间距(单一值,不拆 row-gap / column-gap) |
| padding | number | 四边统一内边距 |
| alignItems | string | `stretch`(默认,拉满格子) / `start` / `center` / `end` |
| width / height | number / string | 同其它容器,支持百分比与 min/max 钳位 |

```js
// 三列卡片阵列:子节点按声明序自动排进去
<grid columns={3} gap={10} padding={12}>
  {() => items().map((it) => (
    <column gap={6}>
      <rect height={48} background="#1a5fb4" />
      <text font={12}>{it.title}</text>
    </column>
  ))}
</grid>
```

- 列宽相等:没有跨列 / 跨行(span)、没有按内容自适应单列、没有 grid-template 那套语法。
- flexGrow / flexShrink / justifyContent 不参与 —— 网格没有主轴分配。
- 格子里的内容要自己排;要"某几列更宽"就改用嵌套 row + 百分比宽度。

### `<scroll>` {#scroll}

`稳定` · `纵向滚动`

纵向滚动容器:内容超出视口时可滚轮滚动,右侧自动出现 8px 轨道 + 比例滑块。 **绘制裁剪与命中裁剪共用同一个视口** —— 滚出视口的行既画不出来也点不中,不会出现"看不见却点得到"的幽灵点击。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| width / height | number | **height 不给时缺省 200**;内容不足一屏则不出滚动条 |
| onWheel | function | 容器滚到边界后,滚轮事件才继续往外冒泡给脚本;回调收到 `{deltaY}` |
| 子节点 | 元素 / 数组 | 数组子节点会逐个展开成兄弟节点,不需要手动 map |

```js
const rows = [];
for (let i = 0; i < 20; i++) {
  rows.push(
    h("rect", { height: 36, background: i % 2 ? "#eef2f7" : "#ffffff" },
      h("text", { font: 13 }, `row ${i}`))
  );
}

<scroll width={240} height={120} onWheel={(e) => log(`overscroll ${e.deltaY}`)}>
  {rows}
</scroll>
```

- 只支持纵向滚动;横向滚动与滚动条鼠标拖拽 v1 未实现(只能滚轮或脚本改 offsetY)。
- 没有虚拟化:20 行就挂 20 个节点,长列表请自行只挂可见区间。
- 滚轮遵循 DOM 滚动链语义:先在容器内消费,到边界才冒泡。

### `<separator>` {#separator}

`稳定`

1px 分隔线。横向时高度固定 1px、宽度由容器 stretch 拉满;加 `vertical` 后变成 1px 宽的竖线。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| vertical | boolean | true 时画竖线;此时主轴(高度)需显式给 `height` |
| background | 颜色 | 线条颜色 |

```js
<text>上半区</text>
<separator />
<text>下半区</text>
```

### `<spacer>` {#spacer}

`稳定` · `零绘制`

弹性占位:零固有尺寸、零绘制,专门用来吃主轴的富余空间。最常见的用法是"把两个元素推到两端"。

```js
<row>
  <text>左</text>
  <spacer flexGrow={1} />
  <text>右</text>
</row>
```

### `<rect>` {#rect}

`稳定` · `通用盒子`

矩形色块,也是最通用的"盒子":填充 `background`、描边 `border`, 宽高常用来做色条、分隔块、仪表底色。点击区域、右键菜单等交互常直接挂在它上面。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| width / height | number | 尺寸;缺省为 0(必须给,否则看不见) |
| background | 颜色 | 填充色(支持 alpha) |
| border | 颜色 | 固定 1px 描边 |
| onClick / onMouseMove / onWheel / onContextMenu / onKeyDown … | function | 通用盒子可挂任意事件,是"可点击面板"的标准写法 |

```js
<rect width={80} height={24} background="#c0392b" />

{/* 宽度绑定信号 → 做进度色条 */}
<rect height={12} background="#c0392b" width={() => vol() * 1.6} />

{/* 带事件的面板 */}
<rect width={340} height={140} background="#e8eef7"
      onContextMenu={(e) => openContextMenu(e.x, e.y, items)} />
```

::: warning rect 不做子元素布局
它是通用盒子分支,子元素**全部叠放在左上角**。想在色块里排版,就用 `<column>` / `<row>` 当容器,把 `<rect>` 当纯色块用。
:::
