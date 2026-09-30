---
title: "Content Display: text / image / progress / Feedback & Data"
description: "Gox GUI content display and feedback elements: text block (wrap, ellipsis), image (PNG/JPEG/GIF synchronous decoding), progress bar, plus alert / tag / badge / avatar / empty / icon / spinner / skeleton / pagination."
---

# Content Display: text / image / progress

### `<text>` {#text}

`Stable`

Text. It is the **only carrier of text blocks** — bare string children in JSX become implicit `#text` nodes, and `#text` is always single-line. To wrap, you must use `<text>` with `wrap` enabled.

| Prop | Type | Description |
| --- | --- | --- |
| font | number | Font size in pixels |
| color | color | Text color, inherited along the ancestor chain |
| wrap | boolean | When true, greedily wraps at the available width; height grows with the line count |
| ellipsis | number | Caps the **number of lines**, appending "…" beyond it; **implies wrap** |
| width / height | number | Wrapping needs a width constraint (an explicit width, or cross-axis stretch from the parent container) |

```js
<text font={20}>{() => `count: ${count()}`}</text>

<!-- Wrapping: give it a width, or place it in a column and rely on stretch -->
<text wrap width={260} font={12}>
  {() => `value = "${text()}"`}
</text>

<!-- At most two lines, ellipsis beyond that -->
<text wrap ellipsis={2} width={200}>{longDescription}</text>
```

::: info Text Blocks with wrap On Participate in stretch by Default
Otherwise, inside a `column` it would expand to its unwrapped full-line width and overflow the container. If you don't want it stretched, set `width` explicitly. Also, a text block's height is "computed twice" (the parent settles the box width, then it recomputes). That's an implementation detail you don't need to handle, but know that it means "the height of wrapped text depends on the width the parent gives it".
:::

### `<image>` {#image}

`Stable` · `Synchronous decoding`

Image display. Decodes PNG / JPEG / GIF with the Go standard library (no new dependencies), decodes synchronously on mount, with a 16-entry LRU cache.

| Prop | Type | Description |
| --- | --- | --- |
| src | string | File path, resolved **relative to the process working directory** |
| width / height | number | Without them, the image's natural size is used; with them, nearest-neighbor scaling |
| disabled | boolean | Overlays a translucent gray layer |

```js
<image src="testdata/image_demo.png" />                    {/* Natural size */}
<image src="testdata/image_demo.png" width={96} height={96} />  {/* Nearest-neighbor upscale */}
<image src="testdata/missing.png" width={96} height={48} />     {/* Failure: gray background + cross lines */}
```

- Paths are interpreted against the process working directory, not "the script's directory" (scripts may come from stdin / a string / a bundled artifact, so there is no such directory). When running demo scripts from the repo root, testdata/xxx.png works.
- No network URLs, no async loading, no scaling quality options (always nearest-neighbor).
- On load failure, a gray placeholder with 45° cross lines is drawn, a warning is printed to stderr once per path, and other content is unaffected.

### `<progress>` {#progress}

`Stable`

A progress bar. `value` ranges from 0~1 (clamped automatically); defaults to 200×8, with a light-gray track + green foreground.

| Prop | Type | Description |
| --- | --- | --- |
| value | number / function | 0~1, clamped automatically when out of range |
| background | color | Foreground color (accent-color semantics), defaults to `#27ae60` |
| width / height | number | Defaults to 200×8 |

```js
// Step by integers (0..10) instead of accumulating floats, to avoid errors like 0.30000000000000004
const [step, setStep] = createSignal(0);
setInterval(() => setStep(s => (s >= 10 ? 0 : s + 1)), 400);

<progress value={() => step() / 10} />
<text>{() => `value: ${step() * 10}%`}</text>
```

## Feedback & Data Components {#feedback}

A set of `alert` / `tag` / `badge` / `avatar` / `empty` / `icon` / `spinner` / `skeleton` /
`pagination` covering the slots every app needs: hints, quantities, empty states, loading, paging.
See [`testdata/feedback_demo.js`](https://github.com/14752222/Gox/blob/main/testdata/feedback_demo.js) for a one-screen demo.

### `<alert>` {#alert}

`Stable` · `Feedback`

A banner. `level` drives the left accent strip and glyph color.

| Prop | Type | Notes |
| --- | --- | --- |
| level | string | `info` (default) / `success` / `warn` / `error` |
| closable | bool | Shows a close cross at the top-right when true |
| onClose | function | Dispatched on close-cross click; it does **not** remove the node — visibility is signal-driven |

```js
const [show, setShow] = createSignal(true);
{() => show() && (
  <alert level="warn" closable onClose={() => setShow(false)}>
    Storage is almost full.
  </alert>
)}
```

### `<tag>` {#tag}

`Stable` · `Tag`

A small, optionally closable tag.

| Prop | Type | Notes |
| --- | --- | --- |
| color | color | Pill background, light grey by default |
| closable | bool | Shows a close cross at the end |
| onClose | function | Dispatched on cross click |

### `<badge>` {#badge}

`Stable` · `Container`

A corner badge. It **wraps** its single flow child (the host) — the badge is drawn at the host's
top-right and the wrapper's size follows the host exactly.

| Prop | Type | Notes |
| --- | --- | --- |
| value | number | Numeric badge; shows `max+` above `max`; auto-hidden when 0/negative |
| max | number | Upper bound, default 99 |
| dot | bool | Small red dot (no number) |

```js
<badge value={5}><button><text>Inbox</text></button></badge>
<badge dot><icon name="bell" size={24} /></badge>
```

### `<avatar>` {#avatar}

`Stable`

An avatar box/circle. Shows the first character of `name`, with `color` as the background.

| Prop | Type | Notes |
| --- | --- | --- |
| name | string | First character is shown |
| size | number | Edge length, default 40 |
| color | color | Background, theme blue by default |
| round | bool | Perfect circle (otherwise a rounded square) |

### `<empty>` {#empty}

`Stable`

An empty state: a centered placeholder glyph + `desc` text, with children as the illustration.

```js
<empty desc="Nothing here yet"><icon name="folder" size={44} /></empty>
```

### `<icon>` {#icon}

`Stable`

A built-in icon. Drawn with pure raster primitives (lines/rects/circles) on a 24×24 logical grid —
zero dependencies on all three platforms.

| Prop | Type | Notes |
| --- | --- | --- |
| name | string | Built-in icon name (below); unknown names draw nothing silently |
| size | number | Edge length, default 16 |
| color | color | Inherits the text color by default (walks the ancestor chain) |

Built-in set: `home` / `search` / `user` / `gear` / `bell` / `chat` / `folder` / `calendar` /
`heart` / `plus` / `minus` / `close` / `check` / `arrow-left` / `arrow-right`.

```js
<row gap={12} align="center">
  <icon name="home" size={24} />
  <icon name="heart" size={24} color="#e01b24" />
</row>
```

### `<spinner>` / `<skeleton>` {#loading}

`Stable` · `Loading`

A spinner and a skeleton. Both repaint continuously from the **same animation heartbeat** (sharing
the 16ms table with transitions; the table stops when everything is idle — zero cost at rest).

| Element | Prop | Notes |
| --- | --- | --- |
| spinner | size / color | Edge length (default 24) / tick color |
| skeleton | rows / avatar / active | Row count (default 3) / round avatar / breathing shimmer (default true) |

### `<pagination>` {#pagination}

`Stable` · `Controlled`

A pager. **Fully controlled** — the display only follows `current`, and clicking a page only
dispatches `onChange`, waiting for the script to write the new value back.

| Prop | Type | Notes |
| --- | --- | --- |
| total | number | Total item count |
| pageSize | number | Items per page, default 10 |
| current | number / function | Current page (1-based, auto-clamped) |
| onChange | function | Receives `{page, pageSize}`; no dispatch when clicking `‹` on page 1 or `›` on the last page |

Above 7 pages an ellipsis collapses the middle (first/last always visible, ellipsis not clickable).

```js
const [page, setPage] = createSignal(3);
<pagination total={200} pageSize={20} current={() => page()} onChange={(e) => setPage(e.page)} />
```
