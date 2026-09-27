---
title: 安装与创建工程
description: 安装 Gox JavaScript 运行时的三种方式：npm i -g @goxjs/goxjs（内置 5 平台预编译二进制）、gox create 脚手架一键创建 GUI 工程、从源码 go build 构建。
---

# 安装与创建工程

三种进入方式,按目标挑一个。三种方式装出来的都是**同一个二进制**,命令名有 `goxjs` 与 `gox` 两个(互为别名,用法完全相同);从源码构建则得到 `gox` (Windows 下 `gox.exe`)。

## 方式一:`gox create` 脚手架(要写 GUI 应用时最省事)

等价于前端的 `npm create vite`:一条命令铺出一个开箱即跑的 GUI 工程,目录布局已经排好, 照着一路加功能即可。**需要 0.4.0 及以上版本**。

```bash
npm i -g @goxjs/goxjs
gox create my-app      # new / init 是同一个子命令的别名
cd my-app
npm install            # 只为拿到 goxjs 命令,运行时本身零依赖
npm run dev            # = goxjs src/main.js
```

生成物(默认输出,已通过测试固定下来):

```text
.
├── package.json          # 元信息 + 两个脚本(dev / start)
├── README.md             # 模板自带的说明与踩坑清单
├── .gitignore
└── src/
    ├── main.js           # 入口:建窗口 + 挂根组件
    ├── app.js            # 根组件:页签 + 面板组合
    ├── store.js          # 应用状态:signal 建在模块作用域,组件共享
    ├── theme.js          # 设计令牌:颜色 / 间距 / 字号
    └── components/
        ├── counter.js    # 局部状态 + 受控滑块
        ├── todo-list.js  # 列表(each 指令 + keyed 复用)+ 输入绑定
        └── status-bar.js # 派生值 + Switch / Match 多状态
```

目录**非空时默认拒绝生成**,加 `--force` 放行; `--force` 只覆盖同名文件,**不会**顺手清理其它文件。

## 方式二:npm 安装运行时

[`@goxjs/goxjs`](https://www.npmjs.com/package/@goxjs/goxjs) 包内置 Windows / Linux / macOS × x64 / arm64(windows-arm64 除外共 5 个平台)的预编译二进制,无需 Go 环境:

```bash
npm i -g @goxjs/goxjs   # 安装后得到 gox 与 goxjs 两个命令
gox                 # 进入 REPL
gox app.js          # 运行脚本
npx goxjs app.js    # 或者不全局安装,直接跑
```

## 方式三:从源码构建

环境要求 Go 1.26+:

```bash
git clone https://github.com/14752222/Gox.git
cd Gox
go build ./cmd/gox  # Windows 下生成 gox.exe,类 Unix 下生成 gox
./gox app.js        # 之后用 ./gox 替代教程中的 gox
```

::: tip 提示
教程统一用 `gox` 演示命令。源码构建请自行替换成 `./gox`(Windows 为 `gox.exe`),用法完全相同。
:::
