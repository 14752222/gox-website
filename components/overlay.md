---
title: 反馈与弹层：dialog / toast / 原生对话框
description: Gox GUI 弹层：dialog 模态对话框（40% 遮罩 + Esc 关闭）、toast 轻提示，以及 gx/dialog 的系统原生 alert/confirm/openFile。
---

# 反馈与弹层：dialog / toast / 原生对话框

这一类的标签自带弹层层级基线(`overlayZBase`),会自动逃逸祖先裁剪,不需要手动写 `escapeClipping`。

### `<dialog>` {#dialog}

`稳定` · `模态遮罩`

模态对话框:40% 黑遮罩铺满窗口 + 居中卡片。**流内子节点就是卡片内容**, 卡片之外的区域属于遮罩。遮罩存在时会吞掉其下所有点击。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| open | boolean / function | 受控显示开关;**关闭时不绘制也不参与命中** |
| onClose | function | 点击遮罩 / 按 Esc 时派发;通常在里面把 `open` 置 false |
| 子节点 | 元素 | 卡片内容(居中),点它自身不会误关 |

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

::: info Esc 的关闭优先级
按一次 Esc 只关**一层**,优先级是:**菜单 > 下拉框 > 对话框**。 所以对话框里展开着的下拉框会先收起来,再按才轮到对话框。
:::

### `<toast>` {#toast}

`稳定` · `非模态`

轻提示:固定在窗口右上角,非模态(它下面的内容照常可点)。**挂在树上就显示,挂载/卸载完全由 JS 控制**, 内核不管定时器。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| message | string | 提示文本 |
| level | string | `success` / `warn` / `error` / `info`,决定色条 |

```js
const [showToast, setShowToast] = createSignal(false);

const notify = () => {
  setShowToast(true);
  setTimeout(() => setShowToast(false), 3000);   // 自动消失靠 JS 定时器
};

{() => (showToast() ? <toast message="Saved successfully" level="success" /> : null)}
```

### `<tooltip>` {#tooltip}

`稳定` · `非模态` · `不挡交互`

悬停提示:包裹一个触发元素,鼠标在它上面停留 `delay` 毫秒后,在旁边弹出一段深色小字。移开鼠标、按下鼠标或按 Esc 都会收起。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| text | string | 提示文本(单行,过长会被截断;空串不弹) |
| placement | string | `top` / `bottom` / `left` / `right`,默认 `bottom`;贴边放不下会自动翻到另一侧 |
| delay | number | 显示延迟毫秒,默认 `500` |

`<tooltip>` 对布局透明——它的盒子就是触发元素的盒子,想给谁加提示就把它包起来:

```js
<tooltip text="保存到云端 (Ctrl+S)" placement="bottom">
  <button>保存</button>
</tooltip>

<tooltip text="删除后不可恢复" placement="top" delay={200}>
  <button background="#c0392b">删除</button>
</tooltip>
```

::: info 提示不挡交互
弹层是纯展示,没有事件处理器——即使它盖在别的控件上,点击仍然穿过去命中下面的控件。想改字号直接在 `<tooltip>` 上写 `font={12}`,文字沿父链继承。
:::

### gx/dialog 原生系统对话框 {#native-dialog}

`稳定` · `仅 Windows 原生` · `async`

调起**操作系统原生**的消息框与文件选择框,而不是自绘弹层。三个 API 都返回 Promise。

| API | 返回 | 说明 |
| --- | --- | --- |
| alert(msg, title?) | `Promise<void>` | 系统消息框,只有一个"确定" |
| confirm(msg, title?) | `Promise<boolean>` | 确定 / 取消,返回用户选择 |
| openFile({title, filter}) | `Promise<string \| null>` | 系统"打开文件"对话框;**取消返回 null**,不是抛异常 |

`filter` 是 `{name, pattern}` 数组, pattern 里多个通配符用 `;` 分隔。

```js
import { alert, confirm, openFile } from "gx/dialog";

// 事件处理器的两种写法都可以: async function () {} 与 async () => {}
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

- 只有这三个 API:无自定义按钮、无多选、无选目录。
- 模态期间界面仍会重绘(系统替我们泵消息),但不派发任何 JS 回调。
- 非 Windows 后端会降级:内容打到 stderr 并立即返回 —— confirm 取 true、openFile 取 null(视作已取消)。
