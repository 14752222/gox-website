---
title: "Content Display: text / image / progress"
description: "Gox GUI content display elements: text block (wrap, ellipsis), image (PNG/JPEG/GIF synchronous decoding), progress bar."
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
