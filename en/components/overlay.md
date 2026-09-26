---
title: "Feedback and Overlays: dialog / toast / Native Dialogs"
description: "Gox GUI overlays: the modal dialog (40% mask + Esc to close), toast lightweight notifications, and gx/dialog's native system alert/confirm/openFile."
---

# Feedback and Overlays: dialog / toast / Native Dialogs

Tags in this category carry the overlay z-order baseline (`overlayZBase`) and automatically escape ancestor clipping — no need to write `escapeClipping` manually.

### `<dialog>` {#dialog}

`Stable` · `Modal mask`

A modal dialog: a 40% black mask covering the window + a centered card. **In-flow children are the card's content**; the area outside the card belongs to the mask. While the mask exists, it swallows all clicks beneath it.

| Prop | Type | Description |
| --- | --- | --- |
| open | boolean / function | Controlled visibility switch; **when closed, it is neither painted nor hit-tested** |
| onClose | function | Dispatched when the mask is clicked / Esc is pressed; usually sets `open` to false inside |
| Children | element | The card's content (centered); clicking it does not accidentally close the dialog |

```js
const [open, setOpen] = createSignal(false);

<button onClick={() => setOpen(true)}>Open dialog</button>

<dialog open={() => open()} onClose={() => setOpen(false)}>
  <column gap={8} padding={14}>
    <text font={16}>Confirm</text>
    <text>Click the mask or press Esc to close.</text>
    <button onClick={() => setOpen(false)}>Close</button>
  </column>
</dialog>
```

::: info Esc Close Priority
One Esc press closes only **one layer**, with the priority: **menu > dropdown > dialog**. So an open dropdown inside a dialog collapses first, and another press gets to the dialog.
:::

### `<toast>` {#toast}

`Stable` · `Non-modal`

A lightweight notification: pinned to the top-right corner of the window, non-modal (content underneath stays clickable). **It shows as soon as it's mounted to the tree; mounting/unmounting is entirely under JS control** — the kernel doesn't manage timers.

| Prop | Type | Description |
| --- | --- | --- |
| message | string | Notification text |
| level | string | `success` / `warn` / `error` / `info`, determines the color bar |

```js
const [showToast, setShowToast] = createSignal(false);

const notify = () => {
  setShowToast(true);
  setTimeout(() => setShowToast(false), 3000);   // Auto-dismiss via a JS timer
};

{() => (showToast() ? <toast message="Saved successfully" level="success" /> : null)}
```

### gx/dialog Native System Dialogs {#native-dialog}

`Stable` · `Windows native only` · `async`

Invokes the **operating system's native** message boxes and file pickers, not self-drawn overlays. All three APIs return a Promise.

| API | Returns | Description |
| --- | --- | --- |
| alert(msg, title?) | `Promise<void>` | System message box with a single "OK" |
| confirm(msg, title?) | `Promise<boolean>` | OK / Cancel; returns the user's choice |
| openFile({title, filter}) | `Promise<string \| null>` | System "open file" dialog; **canceling returns null**, it doesn't throw |

`filter` is an array of `{name, pattern}`, where multiple wildcards in a pattern are separated by `;`.

```js
import { alert, confirm, openFile } from "gx/dialog";

// Both event handler styles work: async function () {} and async () => {}
h("button", {
  onClick: async function () {
    const yes = await confirm("Proceed with the operation?", "Please confirm");
    log("confirm -> " + (yes ? "yes" : "no"));
  }
}, "Confirm"),

h("button", {
  onClick: async function () {
    const path = await openFile({
      title: "Pick a file",
      filter: [
        { name: "Text files", pattern: "*.txt;*.md" },
        { name: "All files", pattern: "*.*" }
      ]
    });
    log(path === null ? "cancelled" : "picked " + path);
  }
}, "Open file")
```

- Only these three APIs: no custom buttons, no multi-select, no directory picking.
- While the dialog is modal, the UI still repaints (the system pumps messages for us), but no JS callbacks are dispatched.
- Non-Windows backends degrade: the content is printed to stderr and the call returns immediately — confirm resolves to true, openFile to null (treated as canceled).
