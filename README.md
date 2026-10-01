# Gox 官网（gox-website）

基于 [VitePress](https://vitepress.dev/zh/)（Vite/Vitest/Pinia 官网同款技术栈）重构的 Gox 官网。
构建产物是**纯静态 HTML**（每页预渲染），部署在 GitHub Pages：`https://14752222.github.io/Gox/`。

## 本地开发

```bash
pnpm install        # 安装依赖（Node ≥ 18）
pnpm dev            # 开发服务器，改 markdown 实时热更新
pnpm build          # 构建到 .vitepress/dist（内建死链检查：内部链接/锚点失效会构建失败）
pnpm preview        # 本地预览构建产物
```

> GitHub Pages 是项目页，站点带 `/Gox/` 前缀（配置在 `.vitepress/config.mts` 的 `base`），
> 本地 `pnpm dev` 访问 `http://localhost:5173/Gox/`。

## 目录结构

```
├── .vitepress/
│   ├── config.mts          # 站点配置：nav / sidebar / sitemap / OG / JSON-LD / 本地搜索
│   ├── theme/custom.css    # 品牌主题（暗底 #0b0f14 + 荧光绿 #4ade9c，沿用旧官网配色）
│   └── dist/               # 构建产物（gitignore）
├── index.md                # 首页（hero + features + 终端演示 + 管线图 + 能力总览）
├── guide/                  # 使用教程（12 节，一节一页）
├── components/             # 组件参考（43 个元素按类分页 + 横切能力 + 限制）
├── api/                    # API 参考（运行时 / 内建 / 宿主模块 / gx 模块 / 差异）
├── public/                 # 原样拷贝的静态文件
│   ├── logo.png / favicon.png / og-image.png   # og-image 1200x630 分享图
│   ├── robots.txt          # 指向 sitemap
│   └── guide.html / components.html / api.html # 旧 URL 跳转页（带锚点级精确映射）
└── deploy/pages.yml        # 放到主仓库 .github/workflows/pages.yml 的部署工作流
```

## 发版时同步版本号（三处）

官网版本号出现在三个地方，发新版本时同步改：

1. `package.json` 的 `version`
2. `index.md` 首页「版本与现状」表格
3. `.vitepress/config.mts` 里 JSON-LD 的 `softwareVersion`

## 部署流程

1. 本仓库提交并推送到 `gox-website` 的 `main`；
2. 回主仓库 Gox 更新子模块指针并推送 —— `git add website && git commit -m "chore(site): ..." && git push`，
   这一步触发主仓库的 `pages` 工作流：pnpm install → vitepress build → 部署 dist；
3. 确认主仓库 Settings → Pages → Source 选的是 **GitHub Actions**。

`deploy/pages.yml` 是给主仓库用的最新工作流（构建 + 产物 sanity check + 部署），
改动部署逻辑时把这份文件拷到主仓库 `.github/workflows/pages.yml`。

## 内置的 SEO 设施（改内容时别弄丢）

| 设施 | 位置 |
| --- | --- |
| sitemap.xml（29 个 URL，自动生成） | `.vitepress/config.mts` 的 `sitemap.hostname`（必须带 `/Gox` 路径） |
| robots.txt（指向 sitemap） | `public/robots.txt` |
| 每页 canonical + Open Graph + Twitter Card | `config.mts` 的 `transformPageData` |
| 结构化数据 SoftwareApplication + WebSite | `config.mts` 的 `jsonLdApp` / `jsonLdSite`（首页注入） |
| 每页独立 title / description | 各 `.md` 的 frontmatter（新增页面必须写，description 控制在 ~100 字内） |
| 旧链接 301 式跳转（meta refresh + JS，锚点级映射） | `public/*.html` |
| 404 页 | `404.md` |
| 语义化 H1（每页一个） | 各 `.md` 正文首行 |

## 内容修改须知

- 正文是 markdown，直接改；表格、代码块语法见相邻页面照抄即可。
- 行内代码里写 `{{ }}` 会被 Vue 当插值解析导致构建失败，需写成 `<code v-pre>...</code>`；
  裸的 `<标签>` 文本（不在反引号内）会被 Vue 吞掉，一律放进反引号。
- 内部链接请用 `/guide/install` 这种绝对路径（构建时自动带 base，且参与死链检查）。
