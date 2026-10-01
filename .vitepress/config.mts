import { defineConfig } from 'vitepress'

const BASE = '/Gox/'
const SITE = 'https://14752222.github.io'
const ORIGIN = SITE + BASE
const REPO = 'https://github.com/14752222/Gox'
const SITE_REPO = 'https://github.com/14752222/gox-website'

// 结构化数据：SoftwareApplication + WebSite（中文首页注入；英文首页文案不同，不注入避免语义混搭）
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
  softwareVersion: '0.9.0',
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
      name: 'Gox 支持 var 吗?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '支持。0.8.0 起 var 与 let / const 并存：var 按传统语义工作——函数作用域、重复声明允许、声明提升到函数顶部（得到 undefined 而非 TDZ）。日常仍推荐 let / const（块级作用域、语义更清晰），保留 var 是为了让已有的 ES5 风格代码能直接跑起来。',
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

// 中文（根 locale）侧边栏
const sidebarGuideZh = {
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
}

// 英文（/en/ locale）侧边栏
const sidebarGuideEn = {
  '/en/guide/': [
    {
      text: 'Guide',
      items: [
        { text: 'Overview', link: '/en/guide/' },
        { text: 'Installation & Creating a Project', link: '/en/guide/install' },
        { text: 'REPL & Command Line', link: '/en/guide/repl' },
        { text: 'Language Basics & Limits', link: '/en/guide/language' },
        { text: 'ES Modules', link: '/en/guide/modules' },
        { text: 'Async & the Event Loop', link: '/en/guide/async' },
        { text: 'Built-in Objects at a Glance', link: '/en/guide/builtins' },
        { text: 'Files & System: fs / path / process', link: '/en/guide/fs' },
        { text: 'Networking & HTTP Server', link: '/en/guide/http' },
        { text: 'Reactive Programming', link: '/en/guide/reactive' },
        { text: 'GUI Desktop Apps', link: '/en/guide/gui' },
        { text: 'Packaging a Standalone Executable', link: '/en/guide/package' },
        { text: 'FAQ', link: '/en/guide/faq' },
      ],
    },
  ],
  '/en/components/': [
    {
      text: 'Components',
      items: [
        { text: 'Overview & Conventions', link: '/en/components/' },
        { text: 'Layout Containers', link: '/en/components/layout' },
        { text: 'Form Controls', link: '/en/components/form' },
        { text: 'Content Display', link: '/en/components/content' },
        { text: 'Feedback & Overlays', link: '/en/components/overlay' },
        { text: 'Navigation & Menus', link: '/en/components/navigation' },
        { text: 'Custom-drawn Canvas', link: '/en/components/canvas' },
        { text: 'Cross-cutting Patterns', link: '/en/components/patterns' },
        { text: 'Module APIs', link: '/en/components/modules' },
        { text: 'Limits & Common Pitfalls', link: '/en/components/limits' },
      ],
    },
  ],
  '/en/api/': [
    {
      text: 'API Reference',
      items: [
        { text: 'Runtime & Global Scope', link: '/en/api/' },
        { text: 'Standard Built-ins & Timers', link: '/en/api/builtins' },
        { text: 'Host Modules', link: '/en/api/host' },
        { text: 'Built-in Modules gx/*', link: '/en/api/gx' },
        { text: 'Differences & Missing APIs', link: '/en/api/differences' },
      ],
    },
  ],
}

export default defineConfig({
  base: '/Gox/',
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
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: BASE + 'favicon.png' }],
    ['meta', { name: 'theme-color', content: '#0b0f14' }],
    ['meta', { property: 'og:site_name', content: 'Gox' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'robots', content: 'index, follow, max-image-preview:large' }],
  ],
  // 中英双语：根 locale = 简体中文，/en/ = English；导航栏右侧会出现语言切换器
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'Gox',
      titleTemplate: ':title · 用 Go 从零实现的 JavaScript 运行时',
      description:
        'Gox 是用 Go 从零实现的 JavaScript 运行时：自研 lexer / parser / 字节码 VM 完整编译管线，单二进制、零 cgo、零外部依赖，自带软件光栅化 GUI 渲染层，支持 ES6+ 与 JSX，能把脚本打包成独立可执行文件。',
      themeConfig: {
        nav: [
          { text: '首页', link: '/' },
          { text: '使用教程', link: '/guide/', activeMatch: '/guide/' },
          { text: '组件参考', link: '/components/', activeMatch: '/components/' },
          { text: 'API 参考', link: '/api/', activeMatch: '/api/' },
        ],
        sidebar: sidebarGuideZh,
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
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      title: 'Gox',
      titleTemplate: ':title · JavaScript runtime built from scratch in Go',
      description:
        'Gox is a JavaScript runtime built from scratch in Go: a full lexer / parser / bytecode VM pipeline in a single binary with zero cgo and zero external dependencies, a software-rasterized GUI layer, ES6+ and JSX support, and a bundler that turns scripts into standalone executables.',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Guide', link: '/en/guide/', activeMatch: '/en/guide/' },
          { text: 'Components', link: '/en/components/', activeMatch: '/en/components/' },
          { text: 'API Reference', link: '/en/api/', activeMatch: '/en/api/' },
        ],
        sidebar: sidebarGuideEn,
        outline: { level: [2, 3], label: 'On this page' },
        search: { provider: 'local' },
        socialLinks: [{ icon: 'github', link: REPO }],
        footer: {
          message: 'Apache License 2.0 · Written in Go with ❤',
          copyright: `Copyright © 2026 <a href="${REPO}" target="_blank" rel="noopener">Gox</a> · <a href="${SITE_REPO}" target="_blank" rel="noopener">Website source</a>`,
        },
        docFooter: { prev: 'Previous', next: 'Next' },
        lastUpdated: { text: 'Last updated' },
        editLink: {
          pattern: SITE_REPO + '/edit/main/:path',
          text: 'Edit this page on GitHub',
        },
        darkModeSwitchLabel: 'Appearance',
        sidebarMenuLabel: 'Table of Contents',
        returnToTopLabel: 'Back to top',
      },
    },
  },
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
    const isEn = rel.startsWith('en/')
    const isHome = rel === 'index.md' || rel === 'en/index.md'
    const url = ORIGIN + rel.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '.html')
    const rawTitle = (pageData.frontmatter?.title as string) || 'Gox'
    const title = isHome
      ? isEn
        ? 'Gox — JavaScript runtime built from scratch in Go'
        : 'Gox — 用 Go 从零实现的 JavaScript 运行时'
      : `${rawTitle} · Gox`
    const desc =
      (pageData.frontmatter?.description as string) ||
      (isEn
        ? 'JavaScript runtime built from scratch in Go: full compiler pipeline + custom GUI rendering + single-file bundling.'
        : '用 Go 从零实现的 JavaScript 运行时：完整编译管线 + 自研 GUI 渲染层 + 单文件打包。')
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
      ['meta', { property: 'og:locale', content: isEn ? 'en_US' : 'zh_CN' }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: desc }],
      ['meta', { name: 'twitter:image', content: ORIGIN + 'og-image.png' }],
    )
    // JSON-LD 只注入中文首页（英文首页不注入，避免语义与语言不匹配）
    if (rel === 'index.md') {
      h.push(
        ['script', { type: 'application/ld+json' }, JSON.stringify(jsonLdApp)],
        ['script', { type: 'application/ld+json' }, JSON.stringify(jsonLdSite)],
      )
    }
    if (rel === 'guide/faq.md') {
      h.push(['script', { type: 'application/ld+json' }, JSON.stringify(jsonLdFaq)])
    }
  },
})
