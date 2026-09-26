---
title: "Form Controls: button / input / select / slider"
description: "Gox GUI form controls: button, checkbox/radio/switch, input, textarea, select dropdown, slider — all controlled components, with model two-way binding where one directive replaces two props."
---

# Form Controls: button / input / select / slider

All of these are controlled components: display follows props only, and interaction only dispatches callbacks (see [convention ③ in Section 0](/en/components/)).

### `<button>` {#button}

`Stable` · `Controlled appearance`

A button. Sizes to its content (text + 8px horizontal padding) with vertically centered text; includes hover brightening and pressed-darkening feedback.

| Prop | Type | Description |
| --- | --- | --- |
| onClick | function | Fires on left-button release. **The callback takes no arguments** |
| disabled | boolean | Uniformly desaturated, clicks are intercepted, and it doesn't grab keyboard focus |
| background | color | Accent color, defaults to light gray `#e8e8e8` |
| border | color | Defaults to 1px `#999` |
| color | color | Text color, defaults to dark |

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

`Stable` · `Purely controlled`

Three boolean toggle controls. The checkbox is 18×18, the switch is 36×20 (square track + 16×16 thumb), and the radio is a 1px circle ring + a solid center dot. None of the three **holds any state of its own** — checked or not is decided entirely by the `checked` prop.

| Prop | Type | Description |
| --- | --- | --- |
| checked | boolean / function | Whether selected. Usually pass a function bound to a signal |
| onClick | function | Fires on click with no arguments; flip the signal yourself in the callback |
| disabled | boolean | Clicks are intercepted |
| background | color | Fill color in the selected state (accent-color semantics) |

::: info Radio Exclusivity Is Up to You
There is no "radio group" in the kernel. The approach is to have a group of radios share **one signal** and write `checked` as a "value equals" comparison — no extra group container needed.
:::

```js
const [agree, setAgree] = createSignal(false);
const [size, setSize] = createSignal("S");
const [notify, setNotify] = createSignal(true);

<row gap={8} alignItems="center">
  <checkbox checked={() => agree()} onClick={() => setAgree(v => !v)} />
  <text>{() => (agree() ? "Agreed" : "Not agreed")}</text>
</row>

<!-- Exclusivity via "shared signal + value comparison" -->
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

`Stable` · `IME: Windows only`

Single-line text input. On focus, the border turns blue and a blinking caret appears; clicking anywhere in the box places the caret at the nearest character boundary. Supports `Backspace` / `Delete` / `←` / `→` / `Home` / `End`, plus **batch commits** from Chinese IMEs on Windows.

| Prop | Type | Description |
| --- | --- | --- |
| value | string / function | Displayed content; display **follows only this** |
| model | signal / [get, set] | **Two-way binding directive**: one directive replaces the two props above (`value` + `onInput`); the recommended style. See [convention ③ in Section 0](/en/components/) |
| onInput | function | Dispatched when content changes, receives `{value}` (**string**). Moving the caret does not dispatch |
| placeholder | string | Shown in gray when the value is empty; the caret stays at the far left and is not pushed away by the placeholder |
| onKeyDown / onKeyUp | function | Unconsumed keys bubble up here, receiving `{key, ctrl, shift, alt}` |
| onFocus / onBlur | function | Focus gained / lost |
| width | number | Defaults to 160 (deliberately not sized to content, and does not participate in cross-axis stretch) |
| disabled | boolean | Not editable, doesn't participate in focus |

#### Key Ownership

The input only consumes **editing** keys; everything else passes through to upper layers, so "an input inside a dialog closed by Esc" keeps working.

| Key | Owner |
| --- | --- |
| Arrow keys / `Home` / `End` | Consumed by the input (moves the caret), doesn't bubble |
| `Backspace` / `Delete` | Consumed by the input (deletes characters) |
| `Enter` | **Passed through** to upper layers — commonly used for "submit on Enter" |
| `Escape` / `Tab` / function keys | Passed through |
| Combos with `Ctrl` / `Alt` | Passed through, left for scripts or the global shortcut table |

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

::: warning Caret Blinking Depends on an Awake Event Pump
When the window has neither events nor any timers, the event pump falls asleep while waiting and the caret freezes. Apps that need continuous blinking can run an idle `requestAnimationFrame` loop:

```js
function tick() { requestAnimationFrame(tick); }
tick();
```
:::

- No selection / drag-select / copy-paste keys (clipboard must be wired manually via gx/gfx's synchronous API).
- The direct single-character input path only handles the BMP; Chinese and other characters must go through the IME commit channel (supported on Windows; no IME on X11 yet).
- IME commits do not produce `onKeyDown` — don't use it to count "how many times keys were pressed".

### `<textarea>` {#textarea}

`Stable` · `IME: Windows only`

Multi-line text editing. The caret is two-dimensional `{row, column}`; content taller than the visible height scrolls vertically, and **scrolling follows the caret** (pressing Enter on the last line won't push the caret out of view).

| Prop | Type | Description |
| --- | --- | --- |
| value | string / function | Displayed content, controlled |
| onInput | function | Receives `{value}`; one IME commit dispatches only once |
| rows | number | Number of visible rows, determines the default height |
| placeholder | string | Gray hint text when empty |
| width / height | number | Explicit size |
| onKeyDown | function | Does **not** include `Enter` (consumed by the editor), but `Escape` bubbles up |
| disabled | boolean | Not editable |

::: info The Only Key Difference from `<input>`
In a multi-line box, `Enter` is **content** (it inserts a newline), so the editor **consumes** Enter; in a single-line box, Enter passes through to upper layers. All other key handling is identical.
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

- No soft wrapping: overlong lines are clipped on the right instead of wrapping — line breaks are decided solely by \n, so "caret line numbers" map strictly one-to-one to the text.
- No selection, no undo stack, no horizontal scrolling.

### `<select>` {#select}

`Stable` · `Popup`

A dropdown. Clicking opens an options popup (with escape clipping built in — it won't be clipped by the 28px field box, nor covered by later siblings), with keyboard open/close and highlight movement.

| Prop | Type | Description |
| --- | --- | --- |
| options | array | An array of strings, or an array of `{value, label}` objects |
| value | string / function | Current value; display follows only this |
| onChange | function | Dispatched on selection, receives `{value}` |
| placeholder | string | Gray text when no value is selected |
| width | number | Field width, defaults to content |
| disabled | boolean | Cannot be opened |

**Keyboard**: after focus, `Enter` / `Space` opens it, `↑` / `↓` moves the highlight (wrapping), `Enter` selects, `Esc` closes.

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

<!-- Plain string arrays + placeholder are also supported -->
<select
  width={220}
  placeholder="Pick a fruit"
  options={["apple", "banana", "cherry"]}
  value={() => fruit()}
  onChange={(e) => setFruit(e.value)}
/>
```

::: tip Clicking Outside Swallows That Click
When the popup is open, clicking elsewhere only closes the popup; the click does **not** also land on the control underneath — avoiding "accidentally triggering a button while closing the dropdown".
:::

### `<slider>` {#slider}

`Stable` · `Exclusive dragging`

A slider. Both dragging the thumb and **clicking anywhere on the track to jump to a value** update it; mouse capture during dragging is provided by the backend, so it stays attached even when dragged out of the window.

| Prop | Type | Description |
| --- | --- | --- |
| value | number / function | Current value, determines the thumb position |
| onInput | function | Dispatched while dragging/clicking, receives `{value}` — **a number, not a string** |
| min / max | number | Value range, defaults to 0 / 100 |
| step | number | Step size, defaults to 1; `step <= 0` means continuous values |
| width | number | Defaults to 160 |
| disabled | boolean | Cannot be dragged, uniformly desaturated |

```js
const [vol, setVol] = createSignal(40);

h("slider", {
  width: 200, min: 0, max: 100, step: 5,
  value: () => vol(),
  onInput: (e) => setVol(e.value),     // e.value is used directly as a number, no parseFloat needed
}),

// Values only land on 0/2/4/6/8/10
h("slider", { width: 200, min: 0, max: 10, step: 2,
  value: () => zoom(), onInput: (e) => setZoom(e.value) }),

// Disabled state
h("slider", { width: 200, min: 0, max: 100, step: 5, value: 70, disabled: true })
```

- No vertical slider, no dual-thumb range, no tick/value labels, no keyboard nudging (←/→).
- Dragging is an exclusive gesture: while dragging, hovering over other controls doesn't highlight them.
- Abnormal range values are handled safely: max < min collapses to min, and NaN never pollutes the geometry.
