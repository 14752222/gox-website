---
title: 内容展示：text / image / progress
description: Gox GUI 内容展示元素：text 文本块（wrap 折行、ellipsis 省略）、image 图片（PNG/JPEG/GIF 同步解码）、progress 进度条。
---

# 内容展示：text / image / progress

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
