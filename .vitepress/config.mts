import { defineConfig } from 'vitepress'

const BASE = '/Gox/'
const SITE = 'https://14752222.github.io'
const ORIGIN = SITE + BASE
const REPO = 'https://github.com/14752222/Gox'
const SITE_REPO = 'https://github.com/14752222/gox-website'

// 结构化数据：SoftwareApplication + WebSite（首页注入）
const jsonLdApp = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Gox',
  alternateName: '@goxjs/goxjs',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Windows, Linux, macOS',
  description:
    'Gox 是用 Go 从零实现的 JavaScript 运行时：词法分析 → 语法分析 → 字节码编译 → 栈式虚拟机执行。单二进制、零 cgo、零外部依赖，自带软件光栅化 GUI 与脚本打包器。',
  url: ORIGIN,
  softwareVersion: '0.6.0',
  license: 'https://opensource.org/licenses/Apache-2.0',
  author: { '@type': 'Person', name: '14752222', url: REPO },
  codeRepository: REPO,
  programmingLanguage: ['Go', 'JavaScript'],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}
const jsonLdSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Gox',
  alternateName: 'Gox JavaScript 运行时',
  url: ORIGIN,
  inLanguage: 'zh-CN',
  description: '用 Go 从零实现的 JavaScript 运行时：完整编译管线 + 自研 GUI 渲染层 + 单文件打包。',
}
// FAQPage 结构化数据（guide/faq.md 注入）
const jsonLdFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Gox 为什么不支持 var?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Gox 刻意只实现 ES6+ 子集：let / const 具备块级作用域，语义更清晰，省去了 var 提升等历史包袱。REPL 启动提示语 "ES6 subset, no var" 说的就是这件事。',
      },
    },
    {
      '@type': 'Question',
      name: 'Gox 和 Node.js / Bun / Deno 是什么关系?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '定位不同。Gox 的价值在于从零走通完整编译管线（lexer → parser → compiler → 字节码 VM）并提供可用的语言与宿主能力，适合写脚本工具、CLI、小型桌面程序，以及学习运行时原理。它不追求替代生产环境的 Node 生态——没有 npm 生态兼容，也没有 JIT。',
      },
    },
    {
      '@type': 'Question',
      name: 'Gox 在 macOS 上能用吗?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'CLI 与 GUI 都可用：npm i -g @goxjs/goxjs 的预编译二进制包含 darwin-amd64 与 darwin-arm64；0.6.0 起 GUI 也有 macOS 窗口后端（cocoa），窗口、IME 与原生对话框都可用。',
      },
    },
    {
      '@type': 'Question',
      name: 'Gox 怎么调试 / 参与开发?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '用 gox version 确认当前构建版本；go test ./... 运行全部测试；go run ./test/bench 做性能剖析基准；go run ./packager -h 查看打包器用法。遇到显示类问题先升级到最新版再复现。',
      },
    },
  ],
}

export default defineConfig({
  lang: 'zh-CN',
  base: '/Gox/',
  title: 'Gox',
  titleTemplate: ':title · 用 Go 从零实现的 JavaScript 运行时',
  // 构建时检查站内死链，断链直接构建失败（CI 兜底）
  ignoreDeadLinks: false,
  markdown: {
    config(md) {
      // inline code 中的 {{ }} 会被 Vue 编译器当作插值（fenced code 块有 v-pre 保护，
      // inline code 没有）。统一给 code_inline 输出加 v-pre，一劳永逸。
      md.renderer.rules.code_inline = (tokens, idx) => {
        const token = tokens[idx]
        return `<code v-pre>${md.utils.escapeHtml(token.content)}</code>`
      }
    },
  },
  description:
    'Gox 是用 Go 从零实现的 JavaScript 运行时：自研 lexer / parser / 字节码 VM 完整编译管线，单二进制、零 cgo、零外部依赖，自带软件光栅化 GUI 渲染层，支持 ES6+ 与 JSX，能把脚本打包成独立可执行文件。',
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: BASE + 'favicon.png' }],
    ['meta', { name: 'theme-color', content: '#0b0f14' }],
    ['meta', { property: 'og:site_name', content: 'Gox' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'robots', content: 'index, follow, max-image-preview:large' }],
  ],
  sitemap: {
    hostname: SITE + BASE,
    // 404 页不应进 sitemap（1.6.x 不读 frontmatter sitemap:false，用官方钩子过滤）
    transformItems(items) {
      return items.filter((it) => !it.url.endsWith('404.html'))
    },
  },
  srcExclude: ['README.md'],
  transformPageData(pageData) {
    const rel = pageData.relativePath
    const isHome = rel === 'index.md'
    const url = ORIGIN + rel.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '.html')
    const rawTitle = (pageData.frontmatter?.title as string) || 'Gox'
    const title = isHome
      ? 'Gox — 用 Go 从零实现的 JavaScript 运行时'
      : `${rawTitle} · Gox`
    const desc =
      (pageData.frontmatter?.description as string) ||
      '用 Go 从零实现的 JavaScript 运行时：完整编译管线 + 自研 GUI 渲染层 + 单文件打包。'
    pageData.frontmatter.head ??= []
    const h = pageData.frontmatter.head as any[]
    h.push(
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: desc }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:image', content: ORIGIN + 'og-image.png' }],
      ['meta', { property: 'og:image:width', content: '1200' }],
      ['meta', { property: 'og:image:height', content: '630' }],
      ['meta', { property: 'og:locale', content: 'zh_CN' }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: desc }],
      ['meta', { name: 'twitter:image', content: ORIGIN + 'og-image.png' }],
    )
    if (isHome) {
      h.push(
        ['script', { type: 'application/ld+json' }, JSON.stringify(jsonLdApp)],
        ['script', { type: 'application/ld+json' }, JSON.stringify(jsonLdSite)],
      )
    }
    if (rel === 'guide/faq.md') {
      h.push(['script', { type: 'application/ld+json' }, JSON.stringify(jsonLdFaq)])
    }
  },
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '使用教程', link: '/guide/', activeMatch: '/guide/' },
      { text: '组件参考', link: '/components/', activeMatch: '/components/' },
      { text: 'API 参考', link: '/api/', activeMatch: '/api/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '使用教程',
          items: [
            { text: '总览', link: '/guide/' },
            { text: '安装与创建工程', link: '/guide/install' },
            { text: 'REPL 与命令行', link: '/guide/repl' },
            { text: '语言基础与边界', link: '/guide/language' },
            { text: 'ES 模块', link: '/guide/modules' },
            { text: '异步与事件循环', link: '/guide/async' },
            { text: '内置对象速览', link: '/guide/builtins' },
            { text: '文件与系统 fs / path / process', link: '/guide/fs' },
            { text: '网络与 HTTP 服务', link: '/guide/http' },
            { text: '响应式编程', link: '/guide/reactive' },
            { text: 'GUI 桌面应用', link: '/guide/gui' },
            { text: '打包独立可执行文件', link: '/guide/package' },
            { text: '常见问题 FAQ', link: '/guide/faq' },
          ],
        },
      ],
      '/components/': [
        {
          text: '组件参考',
          items: [
            { text: '总览与共同约定', link: '/components/' },
            { text: '布局容器', link: '/components/layout' },
            { text: '表单控件', link: '/components/form' },
            { text: '内容展示', link: '/components/content' },
            { text: '反馈与弹层', link: '/components/overlay' },
            { text: '导航与菜单', link: '/components/navigation' },
            { text: '自绘画布', link: '/components/canvas' },
            { text: '横切能力', link: '/components/patterns' },
            { text: '模块 API', link: '/components/modules' },
            { text: '限制与常见误区', link: '/components/limits' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '运行时与全局作用域', link: '/api/' },
            { text: '标准内建对象与定时器', link: '/api/builtins' },
            { text: '宿主模块', link: '/api/host' },
            { text: '内置模块 gx/*', link: '/api/gx' },
            { text: '差异与缺失 API', link: '/api/differences' },
          ],
        },
      ],
    },
    outline: { level: [2, 3], label: '本页目录' },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            noResultsText: '没有找到结果',
            resetButtonTitle: '清除查询条件',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
          },
        },
      },
    },
    socialLinks: [{ icon: 'github', link: REPO }],
    footer: {
      message: 'Apache License 2.0 · 用 ❤ 和 Go 编写',
      copyright: `Copyright © 2026 <a href="${REPO}" target="_blank" rel="noopener">Gox</a> · <a href="${SITE_REPO}" target="_blank" rel="noopener">官网源码</a>`,
    },
    docFooter: { prev: '上一页', next: '下一页' },
    lastUpdated: { text: '最后更新于' },
    editLink: {
      pattern: SITE_REPO + '/edit/main/:path',
      text: '在 GitHub 上编辑此页',
    },
    darkModeSwitchLabel: '外观',
    sidebarMenuLabel: '目录',
    returnToTopLabel: '回到顶部',
  },
})
