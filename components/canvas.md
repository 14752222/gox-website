---
title: 自绘画布 canvas：onDraw 与绘制原语
description: Gox GUI canvas 自绘画布：onDraw(ctx) 里 7 个绘制原语（矩形/圆/线/文本），读到 signal 自动重绘，画布局部坐标与依赖收集规则。
---

# 自绘画布 canvas：onDraw 与绘制原语

### `<canvas>` {#canvas}

`稳定` · `响应式自绘`

自绘画布。在 `onDraw(ctx)` 里用 7 个原语直接落笔,坐标是**画布局部坐标** (`0,0` 就是画布左上角),越界部分自动裁掉,不会溢出到界面其它地方。 在 `onDraw` 里读到的 signal 变化会自动触发重绘。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| onDraw | function | 绘制函数,收到 `ctx`。必须传**函数本身** |
| width / height | number | 缺省 200×120;canvas 不是容器,拿不到父容器交叉轴 stretch |
| background / border | 颜色 | 画布盒自身的底色与描边 |
| disabled | boolean | 降饱和 |

#### ctx 提供的能力

| 原语 | 签名 | 说明 |
| --- | --- | --- |
| fillRect | (x, y, w, h, color) | 实心矩形 |
| strokeRect | (x, y, w, h, color) | 空心矩形(1px 边框) |
| fillCircle | (cx, cy, r, color) | 实心圆 |
| strokeCircle | (cx, cy, r, color) | 圆环 |
| line | (x1, y1, x2, y2, color) | 直线 |
| drawText | (text, x, y, size, color) | 文本 |
| clear | (color) | 整块填充 |
| width / height | number(只读) | 画布尺寸 |

```js
const [tick, setTick] = createSignal(0);
const DATA = [4, 7, 3, 8, 5, 9, 6, 2];

const chart = h("canvas", {
  width: 246, height: 110,
  onDraw: (ctx) => {
    // 读到 tick() → 订阅它,变化时自动重绘
    const cur = tick() % DATA.length;
    ctx.fillRect(0, 0, ctx.width, ctx.height, "#fafafa");
    ctx.line(0, 96, ctx.width - 1, 96, "#cccccc");
    ctx.drawText("bars " + DATA.length, 4, 2, 12, "#555555");
    for (let i = 0; i < DATA.length; i++) {
      const bh = DATA[i] * 8;
      const x = 6 + i * 30;
      ctx.fillRect(x, 96 - bh, 24, bh, i === cur ? "#c0392b" : "#7f8c8d");
    }
  },
});

setInterval(() => setTick(tick() + 1), 500);
```

::: warning 三个最容易踩的坑
**① 传函数本身**:写 `onDraw={draw()}` 会在挂载时先调一次,再把返回值 (`undefined`)当回调 —— 现象是"什么都不画"且不报错。<br> **② 依赖靠"读"**:必须在 `onDraw` 里读 signal 才会订阅。读普通变量不会产生依赖, 数据变了画布不动。<br> **③ 画布不铺底**:与 HTML canvas 一样是透明的,要底色就自己 `ctx.fillRect` 或挂 `background`。
:::

`onDraw` 每次依赖变化会**执行两遍**(一遍用空操作 ctx 收集依赖、一遍用真 ctx 落笔), 所以它必须是**纯绘制函数** —— 别在里面改状态、别做耗时计算、也别把 signal 读取藏在 `if (ctx.width > 0)` 之后(依赖收集时尺寸可能还是 0,那条分支不跑就收不到订阅)。

- 无路径 / 变换 / 渐变 / 抗锯齿开关 / 可调线宽 / drawImage。
- 无内置帧循环:动画要自己挂 requestAnimationFrame。
- 7 个原语都是"最后一笔覆盖"的即时绘制,没有图层与合成模式。
