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
| Tooltip is slow to appear while the pointer rests still | The `tooltip` delay is driven by the event pump waking up; it works normally as long as the app has JS timers or window events, and in the worst case (no wake source at all) it appears at the next event |
| Table rows are not clickable | `table` rows are **not clickable by default** (presentation only). For row interaction attach `onRowClick` and the component bridges it onto every row |
| Table/tree does not refresh after changing data | `columns` / `rows` / `nodes` are materialised into internal rows at **first layout**. Rebuild the component when data changes (change the prop value to trigger a reactive rebuild); mutating array elements in place will not reach the rows already built |
| Expanding one tree branch collapsed all the others | That does not happen — expansion survives rebuilds (keyed by the node's `key`). But **two branches sharing the same `key` will interfere**; keep `key` unique across the whole tree (it falls back to `label` when omitted) |

### Unimplemented components (can be simulated with existing capabilities)

| Want | Status / workaround |
| --- | --- |
| Rich text | `text` supports `wrap` / `ellipsis`; inline mixed styling (bold / colored runs) is not available — assemble with `row` if needed |
| Inline video playback (platform video layer) | The `<video>` **tag and host contract are implemented** (S8): it mounts, receives events, and treats `playing` / `muted` / `loop` / `volume` as controlled props. **Decoding is not in the core** — it is delegated to the backend's platform video layer (MF / AVPlayerLayer / SurfaceView), which none of the three desktop backends implement yet ⇒ falls back to a poster / placeholder plus one `onError({code:"unsupported"})`, with `canIUse("video")` returning `false`. Picking / saving / system preview live in [`gx/media`](/en/components/modules); rationale and backend integration steps are in the [decision record](https://github.com/14752222/Gox/blob/main/docs/video-decision.md) |

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

::: tip Full demo scripts (all under testdata/ in the repo)
Run them from the command line with `gox testdata/<name>.js`, e.g. `gox testdata/menu_demo.js`.

- Elements: button_demo.js, form_demo.js, input_demo.js, search_demo.js, rating_demo.js, textarea_demo.js, multiline_demo.js, select_demo.js, tabs_demo.js, feedback_demo.js, slider_demo.js, progress_demo.js, scroll_demo.js, image_demo.js, video_demo.js, canvas_demo.js, dialog_demo.js, dialog_native_demo.js, menu_demo.js, tooltip_demo.js, tabbar_demo.js
- Lists & conditionals: view_demo.js, view_demo2.js, list_demo.js, vlist_demo.js, condrender_demo.js, resource_demo.js
- Data display: table_demo.js, tree_demo.js
- Layout & styling: grid_demo.js, elastic_layout_demo.js, model_demo.js, jsx_demo.js
- Interaction & animation: events_demo.js, focus_demo.js, hover_demo.js, transition_demo.js, resize_demo.js, clipboard_demo.js, ime_demo.js
- Module capabilities: router_demo.js (+ the lazy-loaded module router_page_detail.js), router_window_demo.js, routing_demo.js, multiwindow_demo.js, storage_demo.js, dev_panel_demo.js, native_demo.js, counter_demo.js, rx_demo.js, kit_demo.js, gui_demo.js, http_demo.js
- Runtime & tutorial walkthroughs: demo.js, acceptance.js, tutorial_util.js, tutorial_api.js, tutorial_modules.js, tutorial_gui.js, tutorial_router.js

There's also `routing_demo.js`, a "userland routing" implementation that doesn't depend on `gx/router` (one signal + a page table) — useful as a reference for small utilities with three pages or fewer.
:::
