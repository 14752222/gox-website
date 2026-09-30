---
title: "Navigation and Menus: menubar / Context Menus"
description: "Gox GUI navigation: custom-drawn menubar with dropdown/submenus (global shortcuts, keyboard navigation), and the openContextMenu data-driven context menu API."
---

# Navigation and Menus: menubar / Context Menus

### `<menubar> / <menu> / <menuitem>` {#menubar}

`Stable` · `Overlay`

Custom-drawn menubar + dropdown menus + submenus. Supports mutually exclusive expansion, closing on outside click, and keyboard navigation; menu items can carry global shortcuts.

| Element | Prop | Description |
| --- | --- | --- |
| menubar | — | **A plain container**: fixed height of 26px, children laid out horizontally |
| menubar | Children | `<menu>` titles plus any other elements (e.g. a status text on the right) |
| menu | label | Menu title (top level) or a container for multiple menu items (submenu) |
| menu | Children | `<menuitem>` / `<separator>` |
| menuitem | label | Menu item text |
| menuitem | shortcut | Shortcut text, e.g. `"Ctrl+S"`. Shown on the right and **works app-wide** (no need to open the menu) |
| menuitem | disabled | Grayed-out text; clicks do nothing |
| menuitem | onClick | Fired on click; when a shortcut is triggered it receives `{x, y, shortcut}` |

```js
<column>
  <menubar>
    <menu label="File">
      <menuitem label="New"  shortcut="Ctrl+N" onClick={() => say("New")} />
      <menuitem label="Open" shortcut="Ctrl+O" onClick={() => say("Open")} />
      <separator />
      <menuitem label="Save As" disabled={true} onClick={() => say("This should not fire")} />
    </menu>

    <menu label="View">
      <menuitem label="Zoom In" onClick={() => say("Zoom In")} />
      <!-- Submenu: nest a menu inside a menuitem -->
      <menuitem label="Theme">
        <menu>
          <menuitem label="Dark"  onClick={() => say("Dark")} />
          <menuitem label="Light" onClick={() => say("Light")} />
        </menu>
      </menuitem>
    </menu>

    <text>ready</text>    {/* menubar is a plain container; put anything on the right */}
  </menubar>

  <column gap={12} padding={16}>
    {/* Main window content */}
  </column>
</column>
```

#### Shortcut rules

The shortcut table is matched on the Go side (in the `Pump` layer) — because JS cannot see keystrokes already consumed by input fields. The rules:

- Only combinations with Ctrl / Alt are recognized. A bare letter key like shortcut="S" is never accepted (otherwise you couldn't type "s" anywhere in the app).
- Modifier keys are compared exactly: Ctrl+S is not triggered by Ctrl+Shift+S.
- Cmd is normalized to Ctrl.
- A menu item can carry a shortcut without onClick; nothing happens when it's triggered.

#### Keyboard navigation

When the menubar has focus: `←` / `→` cycles between titles (the one you land on opens), `↓` / `Enter` / `Space` opens, `Esc` collapses the current level.

- No hover-to-switch titles, no hover auto-open submenus, no checked menu items.
- Separators can also be hit (hit testing only recognizes nodes with handlers, so every row has a built-in handler attached).

### openContextMenu(x, y, items) {#context-menu}

`Stable` · `Overlay` · `Synchronous API`

Pops up a context menu in place at the given coordinates. **This is a data-driven API, not a `contextMenu` prop** — see the note below for the reasoning.

| Parameter | Type | Description |
| --- | --- | --- |
| x, y | number | Screen coordinates where the menu pops up, usually from `e.x`/`e.y` of `onContextMenu` |
| items | array | An array of `<menuitem>` / `<separator>` elements, written exactly like in the menubar |

```js
import { h, render, openContextMenu } from "gx/gfx";

<rect
  width={340}
  height={140}
  background="#e8eef7"
  onContextMenu={(e) =>
    openContextMenu(e.x, e.y, [
      <menuitem label="Copy"    shortcut="Ctrl+C" onClick={() => say("Copy")} />
      <menuitem label="Paste"   shortcut="Ctrl+V" onClick={() => say("Paste")} />
      <separator />
      <menuitem label="Inspect" onClick={() => say("Inspect")} />
    ])
  }
/>
```

::: info Why it isn't a prop
A JSX element is an object for **a single mount**; a node has only one `Parent` field. Attaching the same `<menu>` as a prop to multiple places would make them fight over the host. A data-driven API that constructs a fresh copy on each call has no such problem.
:::

Behavior: near the bottom-right corner of the screen, it automatically folds up and to the left so the whole menu stays visible; clicking an option or clicking outside closes it; right-clicking again on the menu is swallowed (it won't close accidentally).

### `<tabs> / <tab>` {#tabs}

`stable` · `container`

Tabbed panes: a self-drawn tab strip on top (the active item in the theme green with an underline) plus a content area. `<tab>` elements stacked directly under `<tabs>` are the pages; page content stacks vertically (column semantics), so multiple elements need no extra wrapper.

| Element | Prop | Description |
| --- | --- | --- |
| tabs | value | When present, **controlled**: the active page = `value` (a number, clamped); clicking the strip **does not change internal state**, it only dispatches `onChange` and waits for the script to write the new index back to a signal — no write-back means no switch (that's the definition of controlled) |
| tabs | onChange | Fired on a switch with `{index, title}`; dispatched in both controlled and uncontrolled modes |
| tab | title | The strip label; falls back to `Tab N` |
| tab | children | The page content; **every page is keep-alive** — nodes stay in the tree (text typed into inputs, scroll positions survive a switch), the inactive pages are simply not laid out, not painted and not hit-tested |

```js
import { createSignal } from "gx/solid";
import { h, render } from "gx/gfx";

const [tab, setTab] = createSignal(0);

<tabs value={() => tab()} onChange={(e) => setTab(e.index)}>
  <tab title="File">
    <input width={240} placeholder="Switch away and back — the text is still here" />
  </tab>
  <tab title="Edit">
    <text>Edit page</text>
  </tab>
</tabs>
```

::: info keep-alive vs. conditional rendering
`<tabs>` pages follow the same philosophy as the [`show` directive](/en/components/patterns#reactive) and the router's `keepAlive`: hidden ≠ destroyed. If you want a page rebuilt fresh every time, drive it with `value` and write the conditional rendering yourself.
:::
