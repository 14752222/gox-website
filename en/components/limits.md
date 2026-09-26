---
title: Global Limits, Common Pitfalls, and Platform Differences
description: "A quick reference for Gox GUI's global limits and common pitfalls: causes and fixes for unknown tag, missing controlled write-back, a non-blinking cursor and more, workarounds for unimplemented components, and a Windows/Linux/macOS platform differences table."
---

# Global Limits, Common Pitfalls, and Platform Differences

### Syntax-level pitfalls

| Symptom | Cause & fix |
| --- | --- |
| Tag renders as blank and prints `unknown tag` | The tag name is misspelled or it's an unimplemented component. Implemented tags are listed in the section headings on this page |

### Behavior-level pitfalls

| Symptom | Cause & fix |
| --- | --- |
| Typing in an input does nothing / the slider won't drag | The controlled component isn't writing back. Write the value back to the signal in `onInput` / `onChange` |
| The input's cursor doesn't blink | The event pump has fallen asleep. Attach an idle `requestAnimationFrame` loop |
| Clicking a button does nothing (pure Go embedding scenario) | When embedding with pure Go, script closures need a VM callback bridge; tests must run the full event loop rather than pumping bare |
| Wrapped text has the wrong height / covers sibling nodes | Wrapping needs a width constraint: write an explicit `width`, or provide width via the parent container's stretch |
| All children of a container with a background pile up in the top-left corner | That isn't a `column`/`row`; a generic box doesn't lay out its children |
| Rows scrolled out of the viewport are invisible but "seem clickable" | That can't happen — `scroll`'s painting and hit testing share the same viewport, by design |
| Sizes jitter during animation | Property reads should go through the render layer's interpolation; if layout reads the prop's final value and then falls back to the intrinsic size, it jitters. You won't hit this in normal use |

### Unimplemented components (can be simulated with existing capabilities)

| Want | Status / workaround |
| --- | --- |
| tabs | Write it directly with [Switch / Match](/en/components/patterns#view) (or [conditional rendering](/en/components/patterns#reactive)'s `{() => tab() === 0 ? panelA : panelB}`); not packaged as a component |
| list / table / tree | List rendering + `scroll` is enough already; tables and trees you assemble from `row` yourself |
| Virtualized long lists | The [each directive](/en/components/patterns#view) gives you keyed reuse, but "mount only the visible range" windowing is still not implemented |
| tooltip | `onMouseMove` exists, so you can build one yourself |
| icon / rich text / spinner / video | Not implemented |

### Platform differences at a glance

| Capability | Windows | Linux (X11) | macOS |
| --- | --- | --- | --- |
| Windows & rendering | ✅ | ✅ (needs real-hardware verification) | ✅ (cocoa, since 0.6.0) |
| Input method (IME) | ✅ | ❌ | ✅ |
| Clipboard | ✅ | ❌ degraded (reads empty string / write returns false) | ✅ (NSPasteboard) |
| Native dialogs | ✅ | ❌ degraded (confirm returns true, openFile returns null) | ✅ (alert / confirm / openFile / saveFile) |
| Fonts | ✅ static candidates | ✅ lazy scan of font directories, CJK prioritized | ✅ scans system font directories (darwin selection adapted) |
| Native capabilities (battery / network / brightness / settings page) | ✅ via the win32 host | — | — |
| Native capabilities (camera / location / photo library / permissions) | ❌ explicitly missing (reports unsupported) | — | — |

::: tip Full demo scripts (42 in total, all under testdata/ in the repo)
Run them from the command line with `gox testdata/<name>.js`, e.g. `gox testdata/menu_demo.js`.

- Elements: button_demo.js, form_demo.js, input_demo.js, textarea_demo.js, multiline_demo.js, select_demo.js, slider_demo.js, progress_demo.js, scroll_demo.js, image_demo.js, canvas_demo.js, dialog_demo.js, dialog_native_demo.js, menu_demo.js
- Lists & conditionals: view_demo.js, view_demo2.js, list_demo.js, tabs_demo.js, resource_demo.js
- Layout & styling: grid_demo.js, elastic_layout_demo.js, model_demo.js, jsx_demo.js
- Interaction & animation: events_demo.js, focus_demo.js, hover_demo.js, transition_demo.js, resize_demo.js, clipboard_demo.js, ime_demo.js
- Module capabilities: router_demo.js (+ the lazy-loaded module router_page_detail.js), router_window_demo.js, routing_demo.js, multiwindow_demo.js, storage_demo.js, dev_panel_demo.js, native_demo.js, counter_demo.js, rx_demo.js, kit_demo.js, gui_demo.js

There's also `routing_demo.js`, a "userland routing" implementation that doesn't depend on `gx/router` (one signal + a page table) — useful as a reference for small utilities with three pages or fewer.
:::
