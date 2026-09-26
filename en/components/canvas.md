---
title: "Custom Canvas: onDraw and Drawing Primitives"
description: "Gox GUI canvas: 7 drawing primitives (rect/circle/line/text) inside onDraw(ctx), automatic redraws on signal reads, canvas-local coordinates, and dependency collection rules."
---

# Custom Canvas: onDraw and Drawing Primitives

### `<canvas>` {#canvas}

`Stable` · `Reactive self-drawing`

A self-drawing canvas. Inside `onDraw(ctx)` you paint directly with 7 primitives; coordinates are **canvas-local** (`0,0` is the top-left corner of the canvas), and anything out of bounds is clipped automatically — nothing bleeds into the rest of the UI. Signals read inside `onDraw` automatically trigger redraws when they change.

| Prop | Type | Description |
| --- | --- | --- |
| onDraw | function | The drawing function, which receives `ctx`. You must pass **the function itself** |
| width / height | number | Defaults to 200×120; canvas is not a container and cannot get cross-axis stretch from its parent |
| background / border | color | Background and border of the canvas box itself |
| disabled | boolean | Desaturates the canvas |

#### What ctx provides

| Primitive | Signature | Description |
| --- | --- | --- |
| fillRect | (x, y, w, h, color) | Filled rectangle |
| strokeRect | (x, y, w, h, color) | Outlined rectangle (1px border) |
| fillCircle | (cx, cy, r, color) | Filled circle |
| strokeCircle | (cx, cy, r, color) | Circle outline |
| line | (x1, y1, x2, y2, color) | Straight line |
| drawText | (text, x, y, size, color) | Text |
| clear | (color) | Fill the entire canvas |
| width / height | number (read-only) | Canvas size |

```js
const [tick, setTick] = createSignal(0);
const DATA = [4, 7, 3, 8, 5, 9, 6, 2];

const chart = h("canvas", {
  width: 246, height: 110,
  onDraw: (ctx) => {
    // Reading tick() subscribes to it; changes trigger an automatic redraw
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

::: warning The three most common pitfalls
**① Pass the function itself**: writing `onDraw={draw()}` calls it once at mount time and uses the return value (`undefined`) as the callback — the symptom is "nothing gets drawn" with no error.<br> **② Dependencies come from reads**: signals must be read inside `onDraw` to be subscribed. Reading a plain variable creates no dependency, so the canvas won't move when the data changes.<br> **③ The canvas has no background**: like an HTML canvas it is transparent; paint a base color yourself with `ctx.fillRect` or set `background`.
:::

On every dependency change, `onDraw` **runs twice** (once with a no-op ctx to collect dependencies, once with the real ctx to paint), so it must be a **pure drawing function** — don't mutate state inside it, don't do expensive computation, and don't hide signal reads behind `if (ctx.width > 0)` (during dependency collection the size may still be 0, so that branch never runs and the subscription is never registered).

- No paths / transforms / gradients / antialiasing toggles / adjustable line width / drawImage.
- No built-in frame loop: drive animations yourself with requestAnimationFrame.
- All 7 primitives are immediate "last draw wins" painting; there are no layers or composite modes.
