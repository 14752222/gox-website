---
title: 打包成独立可执行文件
description: 用 jsbuild packager 把 JS 脚本打包成自带运行时的单文件可执行程序：GUI 应用、交叉编译 windows/linux/darwin，目标机零依赖。
---

# 打包成独立可执行文件

`packager`(仓库 `packager/` 目录,自带帮助里的命令名是 `jsbuild`) 把入口脚本及其相对 import 的模块嵌入一个生成的 Go 工程,编译成自带完整运行时的单文件程序 —— 目标机器不需要装 Gox、Go 或任何运行时:

```bash
go run ./packager app.js -o app.exe                    # CLI 应用
go run ./packager counter.js --gui -o counter.exe      # GUI 应用
go run ./packager app.js --gui --target linux/amd64    # 纯 Go 交叉编译
```

| 选项 | 说明 |
| --- | --- |
| `-o, --out <path>` | 输出文件路径(默认:`<输入文件名>.exe`;非 Windows 目标默认不带 `.exe`) |
| `--name <name>` | 应用名,用于错误信息显示,默认取输入文件名 |
| `--windowed` | 窗口模式:不显示控制台窗口(仅 Windows) |
| `--gui` | GUI 应用:窗口消息泵事件循环(配合 gx/gfx render) |
| `--target <os>/<arch>` | 交叉编译目标:windows / linux / darwin × amd64 / arm64 / 386 |
| `-v, --verbose` | 显示构建过程输出 |

::: tip 交叉编译零负担
整个运行时是纯 Go(无 cgo),所以 `--target linux/amd64` 在 Windows 上也能直接编,不需要目标机的交叉工具链。
:::

各平台的分发注意事项(Windows 图标与签名、Linux 打包格式、macOS .app bundle)见 [docs/desktop-distribution.md](https://github.com/14752222/Gox/blob/main/docs/desktop-distribution.md)。
