---
title: "Layout Containers: column / row / grid / scroll"
description: "Gox GUI layout containers: column/row main-axis containers (gap, padding, flexGrow/flexShrink, percentages and clamps), grid equal-width lattice, scroll vertical scrolling, separator/spacer/rect."
---

# Layout Containers: column / row / grid / scroll

Seven elements: two main-axis containers (`column` / `row`), the equal-width lattice (`grid`), plus scrolling (`scroll`), separators (`separator`), spacers (`spacer`), and the generic box (`rect`).

### `<column> / <row>` {#column}

`Stable` · `Layout primitive`

The only two real layout containers. Children are laid out sequentially along the main axis (`column` vertically, `row` horizontally), and can be aligned on the cross axis via `alignItems`. When size is not given explicitly, they size to content.

| Prop | Type | Description |
| --- | --- | --- |
| gap | number | Spacing between children (pixels), default 0 |
| padding | number | Uniform padding on all four sides, default 0 |
| alignItems | string | `stretch` (default) / `start` / `center` / `end` |
| justifyContent | string | `start` (default) / `center` / `end` / `between` |
| wrap | boolean | **`<row>` only**: items that don't fit wrap onto the next line (tag flows / toolbars) |
| width / height | number / string | Numbers are pixels; **percentages** like `"50%"` are also accepted (resolved against the parent's content area). When omitted, sizes to content; when omitted on a root container, fills the window |
| minWidth / maxWidth / minHeight / maxHeight | number | Size **clamps**, applied after stretch / grow / shrink / percentages all settle; 0 or omitted means unconstrained |
| background / border / color | color | The container itself can have a fill and a stroke |

Children can set `flexGrow` (consume leftover main-axis space) and `flexShrink` (when the main axis overflows, shrink proportionally by **factor × base size**) — combined with `<spacer flexGrow={1}/>` you can push elements to both ends.

When `<row wrap>` wraps, `gap` is both the inline spacing and the line spacing; grow / shrink / justifyContent **only take effect within a line, not across lines**, while `alignItems` applies to **line heights** (not the container's total height). When the container has no explicit height, the height is back-filled from the wrapping result. Note that `stretch` makes children without intrinsic size fill the cross axis, while built-in controls (buttons, inputs, etc.) keep their content size.

```js
<column gap={12} padding={16}>
  <text font={18}>标题</text>

  <!-- Horizontal row, vertically centered -->
  <row gap={8} alignItems="center">
    <rect width={10} height={10} background="#27ae60" />
    <text>一行内容</text>
  </row>

  <!-- Justify to both ends: the spacer consumes all the space in between -->
  <row>
    <rect width={80} height={24} background="#c0392b" />
    <spacer flexGrow={1} />
    <rect width={80} height={24} background="#27ae60" />
  </row>
</column>
```

**Three ways to adapt to the screen** (see `testdata/elastic_layout_demo.js`):

```js
{/* ① Percentages: three equal cards, zero JS at any window width */}
<row gap={10}>
  <rect width="30%" height={60} background="#c0392b" />
  <rect width="30%" height={60} background="#27ae60" />
  <rect width="30%" height={60} background="#1a5fb4" />
</row>

{/* ② min/max clamps + grow */}
<rect flexGrow={1} minWidth={160} maxWidth={360} height={16} background="#f2c94c" />

{/* ③ Weighted shrinking: overflow is distributed by factor × base size */}
<rect width={300} flexShrink={1} height={16} background="#8e44ad" />

{/* ④ Wrapping: tag flows / toolbars */}
<row wrap gap={8}>
  {() => tags().map((t) => <button>{t}</button>)}
</row>
```

- Not yet implemented: order and alignSelf.
- Percentage children don't stretch their parent (they contribute 0 under auto sizing, same as CSS); malformed percentage strings are silently ignored and fall back to intrinsic size.
- Clamps don't reclaim the difference: surplus grow beyond maxWidth is not redistributed to others (simple, predictable behavior).

### `<grid>` {#grid}

`Stable` · `Equal-width lattice`

A grid container: children are automatically filled **row-first**, in declaration order, into a fixed number of columns; column widths and row heights are taken from the largest content item in each track. Good for card arrays, icon panels, and form groups.

| Prop | Type | Description |
| --- | --- | --- |
| columns | number | Number of columns, default 1; automatically clamped to `[1, 32]` |
| gap | number | Column and row gap (a single value; no row-gap / column-gap split) |
| padding | number | Uniform padding on all four sides |
| alignItems | string | `stretch` (default, fills the cell) / `start` / `center` / `end` |
| width / height | number / string | Same as other containers; percentages and min/max clamps supported |

```js
// Three-column card array: children are laid into it automatically in declaration order
<grid columns={3} gap={10} padding={12}>
  {() => items().map((it) => (
    <column gap={6}>
      <rect height={48} background="#1a5fb4" />
      <text font={12}>{it.title}</text>
    </column>
  ))}
</grid>
```

- Equal column widths: no spanning across columns / rows, no per-column content-based sizing, no grid-template syntax.
- flexGrow / flexShrink / justifyContent don't participate — the grid has no main-axis distribution.
- Content inside cells must lay itself out; to make "certain columns wider", use a nested row + percentage widths instead.

### `<scroll>` {#scroll}

`Stable` · `Vertical scrolling`

A vertical scrolling container: when content exceeds the viewport it can be scrolled with the wheel; an 8px track + proportional thumb automatically appear on the right. **Paint clipping and hit clipping share the same viewport** — rows scrolled out of view can neither be drawn nor clicked, so there are no "invisible but clickable" ghost hits.

| Prop | Type | Description |
| --- | --- | --- |
| width / height | number | **height defaults to 200 when not given**; no scrollbar if content fits within one screen |
| onWheel | function | Wheel events only bubble out to the script after the container has reached its boundary; the callback receives `{deltaY}` |
| Children | element / array | Array children are expanded into sibling nodes one by one; no manual map needed |

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

- Vertical scrolling only; horizontal scrolling and mouse-dragging the scrollbar are not implemented in v1 (wheel or script-driven offsetY only).
- No virtualization: 20 rows means 20 mounted nodes; for long lists, mount only the visible range yourself.
- Wheel behavior follows DOM scroll-chain semantics: consumed inside the container first, bubbles only at the boundary.

### `<separator>` {#separator}

`Stable`

A 1px divider line. Horizontal: fixed 1px height, width stretched to fill the container; with `vertical` it becomes a 1px-wide vertical line.

| Prop | Type | Description |
| --- | --- | --- |
| vertical | boolean | When true, draws a vertical line; in that case the main axis (height) requires an explicit `height` |
| background | color | Line color |

```js
<text>上半区</text>
<separator />
<text>下半区</text>
```

### `<spacer>` {#spacer}

`Stable` · `Zero painting`

A flexible placeholder: zero intrinsic size, zero painting, dedicated to consuming leftover main-axis space. The most common use is "pushing two elements to opposite ends".

```js
<row>
  <text>左</text>
  <spacer flexGrow={1} />
  <text>右</text>
</row>
```

### `<rect>` {#rect}

`Stable` · `Generic box`

A rectangular color block, and also the most versatile "box": fill via `background`, stroke via `border`; width/height are commonly used for color bars, divider blocks, and gauge backgrounds. Interactions like hit areas and context menus are often attached directly to it.

| Prop | Type | Description |
| --- | --- | --- |
| width / height | number | Size; defaults to 0 (must be given, otherwise invisible) |
| background | color | Fill color (alpha supported) |
| border | color | Fixed 1px stroke |
| onClick / onMouseMove / onWheel / onContextMenu / onKeyDown … | function | Generic boxes can carry any events; the standard way to build a "clickable panel" |

```js
<rect width={80} height={24} background="#c0392b" />

{/* Signal-bound width → a progress color bar */}
<rect height={12} background="#c0392b" width={() => vol() * 1.6} />

{/* A panel with events */}
<rect width={340} height={140} background="#e8eef7"
      onContextMenu={(e) => openContextMenu(e.x, e.y, items)} />
```

::: warning rect Does Not Lay Out Children
It belongs to the generic box branch; children are **all stacked in the top-left corner**. To lay out inside a color block, use `<column>` / `<row>` as the container and treat `<rect>` as a pure color block.
:::
