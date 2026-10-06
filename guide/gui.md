---
title: GUI 桌面应用
description: 用 Gox 写 GUI 桌面应用：JSX + gx/gfx 声明式 UI、gx/solid 信号驱动、纯 Go 软件光栅化、44 个内置元素、路由与多窗口，16 行代码起一个计数器。
---

# GUI 桌面应用

`gx/gfx` 模块 + JSX 语法提供声明式 UI:渲染器是纯 Go 软件光栅化(无 cgo、无动态库依赖),flex 风格布局,脏矩形局部重绘。一个 16 行的计数器:

```js
// counter.js
import { createSignal } from "gx/solid"
import { h, render } from "gx/gfx"

const [count, setCount] = createSignal(0)

render(
  <window title="Counter" width={400} height={300}>
    <column gap={8} padding={16}>
      <text font={20}>{() => `count: ${count()}`}</text>
      <button onClick={() => setCount(c => c + 1)}>加一</button>
    </column>
  </window>
)
```

```bash
gox counter.js          # 直接运行,弹出 400x300 窗口
```

## 它是怎么工作的

- JSX 在编译期降级为 h(tag, props, ...children) 调用 —— 没有虚拟 DOM diff,属性和文本节点直接与信号关联;h 因此必须 import(用了 JSX 的每个文件都要有它)
- 属性或文本传函数(如 {() => `count: ${count()}`})即为响应式绑定:信号更新 → 依赖该信号的节点标脏 → 脏矩形合并后只重绘受影响区域
- 点击按钮 → setCount 更新信号 → 上述链路自动完成,无需手写刷新
- 输入类组件是受控的:显示只看 value,编辑只派发 onInput / onChange,所以别忘在回调里把值写回 signal;或者直接用双向绑定指令 model={draft},读写一次接好

## 内置元素与属性

共 **44 个**脚本可写的内置元素(`select-popup` / `menu-item` 等由 Go 侧构造的内部标签不计), 按用途分七类;另有布局透明的容器标签 `<view>`(Fragment,自己不占盒子,是 `each` / `show` 指令的宿主)。下面是速查表,每个元素的完整参数与示例见 [组件参考](/components/)。

| 类别 | 元素 |
| --- | --- |
| 布局容器<br>7 个 | `<column>`、`<row>`、`<grid>`、`<scroll>`、`<separator>`、`<spacer>`、`<rect>` |
| 表单控件<br>10 个 | `<button>`、`<checkbox>`、`<radio>`、`<switch>`、`<input>`、`<search>`、`<textarea>`、`<select>`、`<rating>`、`<slider>` |
| 内容展示<br>16 个 | `<text>`(`wrap` / `ellipsis`)、`<image>`、`<video>`(标签 + 宿主契约,解码交给平台视频层)、`<progress>`、`<alert>`、`<tag>`、`<badge>`、`<avatar>`、`<empty>`、`<icon>`、`<spinner>`、`<skeleton>`、`<pagination>`、`<table>`、`<tree>`、`<list-item>` |
| 反馈与弹层<br>4 个 | `<dialog>`、`<drawer>`、`<toast>`、`<tooltip>`,以及 `gx/dialog` 的原生 `alert` / `confirm` / `openFile` / `saveFile` |
| 导航与菜单<br>5 个 | `<menubar>`、`<menu>`、`<menuitem>`(全局 `shortcut`)、`<tabs>`、`<tab>`、`openContextMenu(x, y, items)` |
| 媒体与自绘<br>1 个 | `<canvas>`(`onDraw(ctx)` + 7 个绘制原语) |
| 窗口<br>1 个 | `<window>`(仅作 `render()` 的根元素,可多次调用开多窗口;返回的句柄提供 `close` / `isClosed` / `title` / `setTitle` / `resize`) |

常用属性:

| 属性 | 说明 |
| --- | --- |
| `width` / `height` / `margin` | 整数像素,也接受 `"50%"` 百分比;不写则由内容决定 |
| `minWidth` / `maxWidth` / `minHeight` / `maxHeight` | 尺寸钳位 |
| `gap` / `padding` / `flexGrow` / `flexShrink` / `wrap` | 间距、内边距、主轴富余分配与收缩、`row` 折行 |
| `alignItems` / `justifyContent` | 交叉轴 / 主轴对齐 |
| `background` / `border` / `color` / `font` | 样式;颜色支持 alpha(`#rrggbbaa` / `rgba()`)与线性渐变 |
| `radius` / `shadow` / `borderWidth` / `borderStyle` | 圆角、阴影、边框宽度与虚实线 |
| `value` / `checked` / `open` | 受控组件的状态,全部由 JS 的 signal 驱动 |
| `disabled` | 沿祖先链继承;子树不响应事件也不参与焦点 |
| `zIndex` / `position` / `escapeClipping` | 层叠、绝对定位、逃逸父盒裁剪 |
| `transition` / `opacity` | 过渡动画(可动属性:`width`/`height`/`left`/`top`/`opacity`) |

::: info 继承规则:font 与 color 都沿祖先链继承
`font`(字号):元素自己的 `font` 优先,没有就取最近祖先的,再没有才是默认 16。 所以 `<button font={13}>` 的标签会按 13 号测量并绘制,不用在每个子元素上重复写。<br> `color`(文字色):同为 CSS 式继承 —— 自身 → 最近祖先 → 缺省近黑, 因此 `<button color="#fff">文字</button>` 这类写法是生效的。
:::

事件回调:`onClick`、`onMouseMove`、`onWheel`、 `onContextMenu`、`onKeyDown` / `onKeyUp`、 `onFocus` / `onBlur`、`onInput` / `onChange`、 `onClose`、`onDraw`、`onResize`(窗口级:挂布局根,载荷 `{width, height}`)。 事件沿祖先链"找第一个处理器"即停,**不冒泡**;其中 `onClick` 回调没有参数。

::: info 受控语义
所有输入类组件都不存自己的状态 —— `value` 决定显示什么,操作只派发 `onInput` / `onChange`。忘记把值写回 signal,输入框就会"打字没反应"、 滑块会"弹回原位"。这与 DOM 受控组件一致。省掉这一步的写法是双向绑定指令: `<input model={draft} />` —— 它内部就是这个 `value` + `onInput` 对,由内核接好。
:::

::: warning 平台支持
窗口后端:Windows(纯 syscall win32)、Linux(X11,Wayland 下走 XWayland)与 macOS(cocoa,0.6.0 起,purego 纯 Go 驱动 AppKit)。 输入法(IME)与原生对话框在 Windows 与 macOS 后端提供,其余平台会安全降级。
:::

## 内置模块速查:该 import 什么

`gx/*` 是**内置模块**(优先于文件系统解析),一共 16 个细分模块, 外加一个把它们合起来的聚合入口 `gox`。应用代码可以一行拿常用的那批, 库代码按细分模块导入更清楚 —— 两种写法指向的是同一份实现。

| 要做什么 | import 什么 |
| --- | --- |
| 响应式信号、异步资源 | `import { createSignal, createMemo, createResource } from "gx/solid"` |
| 建元素树、开窗口、帧回调、剪贴板、动画 | `import { h, render, requestAnimationFrame, clipboardWriteText, animate } from "gx/gfx"` |
| 多分支条件 | `import { Switch, Match } from "gx/view"` |
| 路由 | `import { createRouter, RouterView, RouterLink, useRoute } from "gx/router"` |
| 多屏 / 折叠姿态 | `import { screens, screenOf, usePosture, reportPosture } from "gx/screen"` |
| 原生消息框 / 选文件 | `import { alert, confirm, openFile, saveFile } from "gx/dialog"` |
| 本地持久化 | `import { setAppName, setStorage, getStorage } from "gx/storage"` |
| 开发期调试面板 | `import { devSnapshot } from "gx/dev"` |
| 设备信息 / 电量 / 网络 / 震动 / 亮度 | `import { deviceInfo, battery, isOnline, canIUse } from "gx/device"` |
| 前后台 / 返回键 / 分享退出 | `import { appState, onBackPress, share, exitApp } from "gx/app"` |
| 定位 | `import { getLocation, watchLocation } from "gx/geo"` |
| 拍照 / 选图 / 选视频 | `import { takePhoto, chooseImage, chooseVideo } from "gx/media"` |
| 权限 | `import { checkPermission, authorize, requestPermissions } from "gx/permission"` |
| 安全区 / 软键盘 / 分屏 | `import { insets, keyboardHeight, isSplit } from "gx/viewport"` |
| 主题与暗色模式 | `import { setTheme, toggleDark, current } from "gx/theme"` |
| 桌面自动更新 | `import { currentVersion, checkForUpdate, downloadAndInstall } from "gx/update"` |
| 懒得记模块名 | `import { h, render, createSignal, createRouter } from "gox"`(上面 16 个的并集) |

::: warning 四个最容易记错的地方
**①** `alert` / `confirm` / `openFile` / `saveFile` 在 **`gx/dialog`**, **不在 `gx/gfx`**(从后者导入现在是**编译期报错**)。<br> **②** `each` / `show` / `model` 是**元素级指令**,写在元素上、**不需要 import**; `gx/view` 只导出 `Switch` 与 `Match`。<br> **③** `gx/screen` 的 `useXxx` **返回取值函数**,要再调一次:`const r = usePosture(); r()`。<br> **④** 原生能力模块的 `useBattery()` / `useInsets()` 同样**返回取值函数**;动作型 API(拍照 / 定位)缺能力时**会 reject**,先用 `canIUse("camera")` 判断。

逐个导出、签名与调用约定见 [API 参考 · 内置模块 gx/*](/api/gx)。
:::

## 列表与条件:元素级指令

循环与显隐是**写在元素上的指令**,由 `h()` 层展开,不需要 import; 多分支用 `gx/view` 的 `Switch` / `Match`。 `<view>` 是布局透明的宿主,用它才能"列表不凭空多一层盒子"。

```js
import { Switch, Match } from "gx/view";

<view each={rows} key="id">
  {(row, i) => <text>{(i + 1) + ". " + row.title}</text>}
</view>

<view show={open}><input model={draft} /></view>
```

**属性在调用当场求值一次**,所以响应式的 `each` / `show` 要传取值函数(`each={() => rows()}`),这与受控组件的 `value` 必须传函数是同一条纪律; **子节点同理** —— ``count: {count()}`` 是一张快照, 要写 ``{() => `count: ${count()}`}``(这条没有警告)。详见 [组件参考 · 列表与条件](/components/patterns#view)。**三元 / 短路会吃掉订阅**: 订阅型读数(`useXxx()` 一族)写在首帧没走到的分支里就没建立订阅, effect 一个依赖都没有、永不重跑且无警告 —— 先无条件取一次订阅型读数再分支: `const r = useReservedRegions()(); if (!hasFold()) return "未检测到折痕"; …`; 哪些读数带订阅见 [组件参考 · 列表与条件](/components/patterns#view)。

## 路由:用 gx/router

页面切换不用自己拼 —— 内置模块 `gx/router`(2026-09-21 落地)提供路由表、 `:param` 匹配、三级守卫、历史栈、懒加载与多窗口作用域:

```js
import { createRouter, RouterView, RouterLink } from "gx/router";

const router = createRouter({
  routes: [
    { path: "/",           name: "home",   component: HomePage },
    { path: "/detail/:id", name: "detail", component: DetailPage },
  ],
  initial: "/",
});

render(
  <window title="app" width={420} height={300}>
    <column gap={8} padding={12}>
      <RouterLink to="/detail/7"><text>详情</text></RouterLink>
      <RouterView />
    </column>
  </window>
);
```

开箱就有 `Alt+←` / `Alt+→` 后退前进、`*` 兜底、 路由记录 `keepAlive: true` 保页面状态,以及半折屏下自动双栏。 桌面应用**没有 URL,也没有 history 模式** —— "历史"是内存里的一个栈。 完整手册见仓库 [docs/gui-router.md](https://github.com/14752222/Gox/blob/main/docs/gui-router.md); 三页以内、不要守卫与历史栈的小工具,用[模式手册](https://github.com/14752222/Gox/blob/main/docs/gui-patterns.md)里 "一个 signal + 页面表"的写法更省事。

## 屏幕与折叠姿态:gx/screen

配套模块 `gx/screen` 给出显示器表与窗口所在屏,并提供折叠姿态通道。 **Windows / X11 没有姿态查询 API,框架不猜姿态** —— 只提供 `reportPosture()` 上报; 没人上报就恒为平展。半折时 `RouterView` 会自动变成双栏(左栏放历史的上一条)。

## 本地持久化:gx/storage

```js
import { setAppName, setStorage, getStorage } from "gx/storage";

setAppName("my-app");                       // 决定数据落在哪个子目录,建议最先调
setStorage("theme", "dark");
const theme = getStorage("theme") ?? "light";   // 不存在返回 undefined,没有默认值参数
```

完整示例见仓库 `testdata/` 目录:计数器 `counter_demo.js`、 表单 `form_demo.js`、菜单 `menu_demo.js`、 画布 `canvas_demo.js`、滑动条 `slider_demo.js`、 多窗口 `multiwindow_demo.js`、路由 `router_demo.js` 等 **40 余个**演示脚本,每个都可直接 `gox testdata/xxx_demo.js` 运行。

## 跑在手机上:Android / iOS / 鸿蒙

桌面之外,同一份 JSX + `gx/gfx` 代码也能跑在手机上 —— 渲染内核(node / layout / raster / font)一行不改,差别只在**宿主外壳**:Windows 用 win32、macOS 用 cocoa,移动端则由各平台的壳工程把同一份 `libgox` 驱动起来。**界面逻辑仍然全部写在 JS 里**,壳工程只负责"上屏 + 输入 + 上报系统状态"。

### 三平台现状

| 平台 | 外壳 | 脚本侧能用到什么 | 验证到哪一步 |
| --- | --- | --- | --- |
| **Android** | Kotlin(`SurfaceView` + `Choreographer`) | 上屏 / 触摸 / 软键盘 IME / 安全区 / 折叠姿态;原生能力 `gx/device` `gx/app` `gx/geo` `gx/media` `gx/permission` 基本齐备 | 模拟器 x86_64 / API 34 **实测通过**(渲染、触摸、IME、安全区、折叠屏) |
| **iOS** | Swift(`UIView` + `CADisplayLink`) | 上屏 / 触摸 / IME / 安全区 / 折叠姿态(`reservedRegions`,iOS 27.1+);原生能力大部分齐备 —— 只有 `exitApp` 例外(iOS 不允许应用自杀) | 壳工程与构建脚本(含 TestFlight 打包)**齐备**,**真机 / 模拟器验收待做** |
| **鸿蒙** | ArkTS(`PixelMap` + `onTouch`) | 上屏 / 触摸 / 安全区 / 折叠上报 | 交叉编译 + 契约测试 + HAP 构建**通过**,**设备上尚未实跑**;软键盘未接,原生能力六模块仍是桩(只通了安全区与折叠上报) |

::: warning v1 边界(都不是 bug,是没做)
单缓冲 —— Go 写入与宿主拷贝可能重叠一帧(撕裂)｜多指手势不识别,第二根手指按下即作废整个手势｜**density 只上报不换算** —— `font={20}` 就是 20 个物理像素,在高密度屏上偏小,用 `gx/device` 的 `pixelRatio` 自行换算｜软键盘是**结果提交制**,拼音中间态不逐键上报(逐键属 P1)。
:::

### 前置环境

移动端打包**需要 Gox 源码仓库**(壳工程与交叉编译脚本都在仓库内;设 `GOX_REPO` 环境变量或在仓库内运行),外加对应平台工具链:

| 平台 | 需要 |
| --- | --- |
| Android | Android SDK(platform 35 + build-tools)、NDK r25+、JDK 17、Gradle 8.7+ |
| iOS | macOS + Xcode |
| 鸿蒙 | DevEco Studio + HarmonyOS SDK(Native,apiVersion 26) |

### 构建 Android

三平台里 Android 最直接,四步:

```bash
# 1) 交叉编译 libgox.so(脚本自带 ELF 目标校验,发现"编成功但链错目标")
bash scripts/build-android.sh                 # arm64-v8a(真机)
bash scripts/build-android.sh --abi x86_64    # 模拟器(x86 主机上原生执行,比 arm64 转译快得多)

# 2) 拷进壳工程(jniLibs/ 不入库,每次重建都要重新拷)
mkdir -p app/android/app/src/main/jniLibs/arm64-v8a app/android/app/src/main/jniLibs/x86_64
cp dist/android/arm64-v8a/libgox.so app/android/app/src/main/jniLibs/arm64-v8a/
cp dist/android/x86_64/libgox.so   app/android/app/src/main/jniLibs/x86_64/

# 3) 打 APK
cd app/android && gradle assembleDebug

# 4) 装机看日志
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb logcat -s Gox:I
```

界面脚本是壳工程里的 `app/android/app/src/main/assets/app.js`。**日志为什么要专门看 `Gox` 这个 tag**:Android 在 fork 应用进程前把 stdout / stderr 接进了 `/dev/null`,原生代码往 fd 2 写的东西真机上根本看不到 —— 所以 Go 侧所有"跳过了、失败了"的分支都走 `Gox` tag。"黑屏 + 无日志"是没法查的,这一条就是为它准备的。

### 构建 iOS:一条命令

iOS 有统一入口,自动 `sync` 注入权限 → `icon` 生成 AppIconSet → 交叉编译 `libgox.a` → xcodebuild 组装 `dist/<name>.app`:

```bash
gox build ios my-app                        # 缺省模拟器目标,免签名(可直接 simctl install)
gox build ios my-app --device               # 真机(需签名证书,无证书时给出配置指引)
gox build ios my-app --entry src/main.js    # 指定入口脚本(缺省 src/main.js)
DEVELOPMENT_TEAM=<TeamID> bash scripts/build-ios.sh --archive   # 真机 Release + .ipa(TestFlight 用)
```

iOS 壳**只支持单文件入口**:那份脚本可以 import 内置 `gx/*` 模块,但不能 import 相对路径文件(壳走单文件求值,没有模块基路径)—— 反过来 `--entry` 会把入口自动合并进 `.app`,这一点比 Android 省事(Android 目前要手工替换 `assets/app.js`)。

### 构建鸿蒙:两步(暂无 `gox build` 目标)

```bash
# 1) 交叉编译(鸿蒙没有 GOOS=openharmony —— 脚本走 GOOS=linux + OHOS clang + musl sysroot)
bash scripts/build-harmony.sh --abi arm64     # 真机;模拟器用 --abi x86_64
cp dist/harmony/arm64/libgox.so app/harmony/entry/libs/arm64-v8a/

# 2) 构建 HAP(命令行姿势,不依赖 wrapper)
export DEVECO_HOME="<DevEco Studio 安装目录>"   # 内含 sdk/ 与 tools/
export DEVECO_SDK_HOME="$DEVECO_HOME/sdk"
node "$DEVECO_HOME/tools/ohpm/bin/pm-cli.js" install --all
node "$DEVECO_HOME/tools/hvigor/bin/hvigorw.js" --mode module \
     -p module=entry@default -p product=default -p buildMode=debug assembleHap --no-daemon
```

界面脚本在 `app/harmony/entry/src/main/resources/rawfile/app.js`。`.so` 要放 `entry/libs/<abi>/`,目录名用 `arm64-v8a` 这套**安卓风格的 ABI 名**(不是 LLVM 三元组 `aarch64-linux-ohos`)—— 放错的症状是构建绿、运行时加载失败。

::: info 脚手架只生成 Android / iOS 骨架
`gox create` 铺出的工程含 `android/`(清单 + gradle)与 `ios/`(Info.plist + 图标)骨架,**不含鸿蒙**。要用鸿蒙请参考仓库里的壳工程 `app/harmony/`。
:::

### 移动端要消费的三件事

写 UI 时只有三处与桌面不同,而且都是**响应式消费、桌面自动退化**(桌面 insets 恒为 0,同一份代码自然退化成普通 padding):

| 要处理 | 用什么 | 说明 |
| --- | --- | --- |
| 安全区(刘海 / 手势条 / 挖孔) | `import { useInsets } from "gx/viewport"` | 贴边组件按 insets 响应式加 padding(顶栏吃 `top`、TabBar 吃 `bottom`、侧栏吃 `left` / `right`),组件内不写死数值 |
| 软键盘避让 | `useKeyboardHeight()` | 键盘高度是**独立通道**;输入框获焦时容器抬升或压缩内容区,底部贴边组件让位,不得浮在键盘上 |
| 断点 | `widthClass()` / `isCompactWidth()` | 宽三档 600 / 840dp(`compact` / `medium` / `expanded`),高两档 480dp;手机竖屏单列、平板竖屏双列可选 |

折叠屏再补一条:`import { hasFold, useReservedRegions, layoutMode } from "gx/viewport"`。半折(book 模式)时 `RouterView` 会自动变双栏(左栏放历史的上一条),折痕带上不落任何内容。注意 `hasFold()` / `layoutMode()` 是**纯读数(不订阅)**,订阅型读数是 `useReservedRegions()` / `useLayoutMode()` / `useInsets()` 那一族 —— 把纯读数写进三元条件**短路掉**订阅调用,会让那个 effect 一个依赖都没有、之后永不重跑,**且没有任何警告**;正解是**先无条件取一次订阅型读数再分支**。

移动端交互规范(触控目标 48dp、按压态、compact 断点弹层底部贴边、输入框获焦保持可见等)见仓库 [docs/mobile-adaptation.md](https://github.com/14752222/Gox/blob/main/docs/mobile-adaptation.md);壳工程的构建细节、JNI / NAPI 契约与首帧自检清单见 [app/NATIVE-HOST.md](https://github.com/14752222/Gox/blob/main/app/NATIVE-HOST.md)。
