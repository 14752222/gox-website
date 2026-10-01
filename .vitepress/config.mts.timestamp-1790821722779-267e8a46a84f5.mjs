// .vitepress/config.mts
import { defineConfig } from "file:///F:/desktop/go/website/node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.59.0_postcss@8.5.28_search-insights@2.17.3/node_modules/vitepress/dist/node/index.js";
var BASE = "/Gox/";
var SITE = "https://14752222.github.io";
var ORIGIN = SITE + BASE;
var REPO = "https://github.com/14752222/Gox";
var SITE_REPO = "https://github.com/14752222/gox-website";
var jsonLdApp = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Gox",
  alternateName: "@goxjs/goxjs",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Windows, Linux, macOS",
  description: "Gox \u662F\u7528 Go \u4ECE\u96F6\u5B9E\u73B0\u7684 JavaScript \u8FD0\u884C\u65F6\uFF1A\u8BCD\u6CD5\u5206\u6790 \u2192 \u8BED\u6CD5\u5206\u6790 \u2192 \u5B57\u8282\u7801\u7F16\u8BD1 \u2192 \u6808\u5F0F\u865A\u62DF\u673A\u6267\u884C\u3002\u5355\u4E8C\u8FDB\u5236\u3001\u96F6 cgo\u3001\u96F6\u5916\u90E8\u4F9D\u8D56\uFF0C\u81EA\u5E26\u8F6F\u4EF6\u5149\u6805\u5316 GUI \u4E0E\u811A\u672C\u6253\u5305\u5668\u3002",
  url: ORIGIN,
  softwareVersion: "0.9.0",
  license: "https://opensource.org/licenses/Apache-2.0",
  author: { "@type": "Person", name: "14752222", url: REPO },
  codeRepository: REPO,
  programmingLanguage: ["Go", "JavaScript"],
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
};
var jsonLdSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Gox",
  alternateName: "Gox JavaScript \u8FD0\u884C\u65F6",
  url: ORIGIN,
  inLanguage: "zh-CN",
  description: "\u7528 Go \u4ECE\u96F6\u5B9E\u73B0\u7684 JavaScript \u8FD0\u884C\u65F6\uFF1A\u5B8C\u6574\u7F16\u8BD1\u7BA1\u7EBF + \u81EA\u7814 GUI \u6E32\u67D3\u5C42 + \u5355\u6587\u4EF6\u6253\u5305\u3002"
};
var jsonLdFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Gox \u4E3A\u4EC0\u4E48\u4E0D\u652F\u6301 var?",
      acceptedAnswer: {
        "@type": "Answer",
        text: 'Gox \u523B\u610F\u53EA\u5B9E\u73B0 ES6+ \u5B50\u96C6\uFF1Alet / const \u5177\u5907\u5757\u7EA7\u4F5C\u7528\u57DF\uFF0C\u8BED\u4E49\u66F4\u6E05\u6670\uFF0C\u7701\u53BB\u4E86 var \u63D0\u5347\u7B49\u5386\u53F2\u5305\u88B1\u3002REPL \u542F\u52A8\u63D0\u793A\u8BED "ES6 subset, no var" \u8BF4\u7684\u5C31\u662F\u8FD9\u4EF6\u4E8B\u3002'
      }
    },
    {
      "@type": "Question",
      name: "Gox \u548C Node.js / Bun / Deno \u662F\u4EC0\u4E48\u5173\u7CFB?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "\u5B9A\u4F4D\u4E0D\u540C\u3002Gox \u7684\u4EF7\u503C\u5728\u4E8E\u4ECE\u96F6\u8D70\u901A\u5B8C\u6574\u7F16\u8BD1\u7BA1\u7EBF\uFF08lexer \u2192 parser \u2192 compiler \u2192 \u5B57\u8282\u7801 VM\uFF09\u5E76\u63D0\u4F9B\u53EF\u7528\u7684\u8BED\u8A00\u4E0E\u5BBF\u4E3B\u80FD\u529B\uFF0C\u9002\u5408\u5199\u811A\u672C\u5DE5\u5177\u3001CLI\u3001\u5C0F\u578B\u684C\u9762\u7A0B\u5E8F\uFF0C\u4EE5\u53CA\u5B66\u4E60\u8FD0\u884C\u65F6\u539F\u7406\u3002\u5B83\u4E0D\u8FFD\u6C42\u66FF\u4EE3\u751F\u4EA7\u73AF\u5883\u7684 Node \u751F\u6001\u2014\u2014\u6CA1\u6709 npm \u751F\u6001\u517C\u5BB9\uFF0C\u4E5F\u6CA1\u6709 JIT\u3002"
      }
    },
    {
      "@type": "Question",
      name: "Gox \u5728 macOS \u4E0A\u80FD\u7528\u5417?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CLI \u4E0E GUI \u90FD\u53EF\u7528\uFF1Anpm i -g @goxjs/goxjs \u7684\u9884\u7F16\u8BD1\u4E8C\u8FDB\u5236\u5305\u542B darwin-amd64 \u4E0E darwin-arm64\uFF1B0.6.0 \u8D77 GUI \u4E5F\u6709 macOS \u7A97\u53E3\u540E\u7AEF\uFF08cocoa\uFF09\uFF0C\u7A97\u53E3\u3001IME \u4E0E\u539F\u751F\u5BF9\u8BDD\u6846\u90FD\u53EF\u7528\u3002"
      }
    },
    {
      "@type": "Question",
      name: "Gox \u600E\u4E48\u8C03\u8BD5 / \u53C2\u4E0E\u5F00\u53D1?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "\u7528 gox version \u786E\u8BA4\u5F53\u524D\u6784\u5EFA\u7248\u672C\uFF1Bgo test ./... \u8FD0\u884C\u5168\u90E8\u6D4B\u8BD5\uFF1Bgo run ./test/bench \u505A\u6027\u80FD\u5256\u6790\u57FA\u51C6\uFF1Bgo run ./packager -h \u67E5\u770B\u6253\u5305\u5668\u7528\u6CD5\u3002\u9047\u5230\u663E\u793A\u7C7B\u95EE\u9898\u5148\u5347\u7EA7\u5230\u6700\u65B0\u7248\u518D\u590D\u73B0\u3002"
      }
    }
  ]
};
var sidebarGuideZh = {
  "/guide/": [
    {
      text: "\u4F7F\u7528\u6559\u7A0B",
      items: [
        { text: "\u603B\u89C8", link: "/guide/" },
        { text: "\u5B89\u88C5\u4E0E\u521B\u5EFA\u5DE5\u7A0B", link: "/guide/install" },
        { text: "REPL \u4E0E\u547D\u4EE4\u884C", link: "/guide/repl" },
        { text: "\u8BED\u8A00\u57FA\u7840\u4E0E\u8FB9\u754C", link: "/guide/language" },
        { text: "ES \u6A21\u5757", link: "/guide/modules" },
        { text: "\u5F02\u6B65\u4E0E\u4E8B\u4EF6\u5FAA\u73AF", link: "/guide/async" },
        { text: "\u5185\u7F6E\u5BF9\u8C61\u901F\u89C8", link: "/guide/builtins" },
        { text: "\u6587\u4EF6\u4E0E\u7CFB\u7EDF fs / path / process", link: "/guide/fs" },
        { text: "\u7F51\u7EDC\u4E0E HTTP \u670D\u52A1", link: "/guide/http" },
        { text: "\u54CD\u5E94\u5F0F\u7F16\u7A0B", link: "/guide/reactive" },
        { text: "GUI \u684C\u9762\u5E94\u7528", link: "/guide/gui" },
        { text: "\u6253\u5305\u72EC\u7ACB\u53EF\u6267\u884C\u6587\u4EF6", link: "/guide/package" },
        { text: "\u5E38\u89C1\u95EE\u9898 FAQ", link: "/guide/faq" }
      ]
    }
  ],
  "/components/": [
    {
      text: "\u7EC4\u4EF6\u53C2\u8003",
      items: [
        { text: "\u603B\u89C8\u4E0E\u5171\u540C\u7EA6\u5B9A", link: "/components/" },
        { text: "\u5E03\u5C40\u5BB9\u5668", link: "/components/layout" },
        { text: "\u8868\u5355\u63A7\u4EF6", link: "/components/form" },
        { text: "\u5185\u5BB9\u5C55\u793A", link: "/components/content" },
        { text: "\u53CD\u9988\u4E0E\u5F39\u5C42", link: "/components/overlay" },
        { text: "\u5BFC\u822A\u4E0E\u83DC\u5355", link: "/components/navigation" },
        { text: "\u81EA\u7ED8\u753B\u5E03", link: "/components/canvas" },
        { text: "\u6A2A\u5207\u80FD\u529B", link: "/components/patterns" },
        { text: "\u6A21\u5757 API", link: "/components/modules" },
        { text: "\u9650\u5236\u4E0E\u5E38\u89C1\u8BEF\u533A", link: "/components/limits" }
      ]
    }
  ],
  "/api/": [
    {
      text: "API \u53C2\u8003",
      items: [
        { text: "\u8FD0\u884C\u65F6\u4E0E\u5168\u5C40\u4F5C\u7528\u57DF", link: "/api/" },
        { text: "\u6807\u51C6\u5185\u5EFA\u5BF9\u8C61\u4E0E\u5B9A\u65F6\u5668", link: "/api/builtins" },
        { text: "\u5BBF\u4E3B\u6A21\u5757", link: "/api/host" },
        { text: "\u5185\u7F6E\u6A21\u5757 gx/*", link: "/api/gx" },
        { text: "\u5DEE\u5F02\u4E0E\u7F3A\u5931 API", link: "/api/differences" }
      ]
    }
  ]
};
var sidebarGuideEn = {
  "/en/guide/": [
    {
      text: "Guide",
      items: [
        { text: "Overview", link: "/en/guide/" },
        { text: "Installation & Creating a Project", link: "/en/guide/install" },
        { text: "REPL & Command Line", link: "/en/guide/repl" },
        { text: "Language Basics & Limits", link: "/en/guide/language" },
        { text: "ES Modules", link: "/en/guide/modules" },
        { text: "Async & the Event Loop", link: "/en/guide/async" },
        { text: "Built-in Objects at a Glance", link: "/en/guide/builtins" },
        { text: "Files & System: fs / path / process", link: "/en/guide/fs" },
        { text: "Networking & HTTP Server", link: "/en/guide/http" },
        { text: "Reactive Programming", link: "/en/guide/reactive" },
        { text: "GUI Desktop Apps", link: "/en/guide/gui" },
        { text: "Packaging a Standalone Executable", link: "/en/guide/package" },
        { text: "FAQ", link: "/en/guide/faq" }
      ]
    }
  ],
  "/en/components/": [
    {
      text: "Components",
      items: [
        { text: "Overview & Conventions", link: "/en/components/" },
        { text: "Layout Containers", link: "/en/components/layout" },
        { text: "Form Controls", link: "/en/components/form" },
        { text: "Content Display", link: "/en/components/content" },
        { text: "Feedback & Overlays", link: "/en/components/overlay" },
        { text: "Navigation & Menus", link: "/en/components/navigation" },
        { text: "Custom-drawn Canvas", link: "/en/components/canvas" },
        { text: "Cross-cutting Patterns", link: "/en/components/patterns" },
        { text: "Module APIs", link: "/en/components/modules" },
        { text: "Limits & Common Pitfalls", link: "/en/components/limits" }
      ]
    }
  ],
  "/en/api/": [
    {
      text: "API Reference",
      items: [
        { text: "Runtime & Global Scope", link: "/en/api/" },
        { text: "Standard Built-ins & Timers", link: "/en/api/builtins" },
        { text: "Host Modules", link: "/en/api/host" },
        { text: "Built-in Modules gx/*", link: "/en/api/gx" },
        { text: "Differences & Missing APIs", link: "/en/api/differences" }
      ]
    }
  ]
};
var config_default = defineConfig({
  base: "/Gox/",
  // 构建时检查站内死链，断链直接构建失败（CI 兜底）
  ignoreDeadLinks: false,
  markdown: {
    config(md) {
      md.renderer.rules.code_inline = (tokens, idx) => {
        const token = tokens[idx];
        return `<code v-pre>${md.utils.escapeHtml(token.content)}</code>`;
      };
    }
  },
  head: [
    ["link", { rel: "icon", type: "image/png", href: BASE + "favicon.png" }],
    ["meta", { name: "theme-color", content: "#0b0f14" }],
    ["meta", { property: "og:site_name", content: "Gox" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "robots", content: "index, follow, max-image-preview:large" }]
  ],
  // 中英双语：根 locale = 简体中文，/en/ = English；导航栏右侧会出现语言切换器
  locales: {
    root: {
      label: "\u7B80\u4F53\u4E2D\u6587",
      lang: "zh-CN",
      title: "Gox",
      titleTemplate: ":title \xB7 \u7528 Go \u4ECE\u96F6\u5B9E\u73B0\u7684 JavaScript \u8FD0\u884C\u65F6",
      description: "Gox \u662F\u7528 Go \u4ECE\u96F6\u5B9E\u73B0\u7684 JavaScript \u8FD0\u884C\u65F6\uFF1A\u81EA\u7814 lexer / parser / \u5B57\u8282\u7801 VM \u5B8C\u6574\u7F16\u8BD1\u7BA1\u7EBF\uFF0C\u5355\u4E8C\u8FDB\u5236\u3001\u96F6 cgo\u3001\u96F6\u5916\u90E8\u4F9D\u8D56\uFF0C\u81EA\u5E26\u8F6F\u4EF6\u5149\u6805\u5316 GUI \u6E32\u67D3\u5C42\uFF0C\u652F\u6301 ES6+ \u4E0E JSX\uFF0C\u80FD\u628A\u811A\u672C\u6253\u5305\u6210\u72EC\u7ACB\u53EF\u6267\u884C\u6587\u4EF6\u3002",
      themeConfig: {
        nav: [
          { text: "\u9996\u9875", link: "/" },
          { text: "\u4F7F\u7528\u6559\u7A0B", link: "/guide/", activeMatch: "/guide/" },
          { text: "\u7EC4\u4EF6\u53C2\u8003", link: "/components/", activeMatch: "/components/" },
          { text: "API \u53C2\u8003", link: "/api/", activeMatch: "/api/" }
        ],
        sidebar: sidebarGuideZh,
        outline: { level: [2, 3], label: "\u672C\u9875\u76EE\u5F55" },
        search: {
          provider: "local",
          options: {
            translations: {
              button: { buttonText: "\u641C\u7D22\u6587\u6863", buttonAriaLabel: "\u641C\u7D22\u6587\u6863" },
              modal: {
                noResultsText: "\u6CA1\u6709\u627E\u5230\u7ED3\u679C",
                resetButtonTitle: "\u6E05\u9664\u67E5\u8BE2\u6761\u4EF6",
                footer: { selectText: "\u9009\u62E9", navigateText: "\u5207\u6362", closeText: "\u5173\u95ED" }
              }
            }
          }
        },
        socialLinks: [{ icon: "github", link: REPO }],
        footer: {
          message: "Apache License 2.0 \xB7 \u7528 \u2764 \u548C Go \u7F16\u5199",
          copyright: `Copyright \xA9 2026 <a href="${REPO}" target="_blank" rel="noopener">Gox</a> \xB7 <a href="${SITE_REPO}" target="_blank" rel="noopener">\u5B98\u7F51\u6E90\u7801</a>`
        },
        docFooter: { prev: "\u4E0A\u4E00\u9875", next: "\u4E0B\u4E00\u9875" },
        lastUpdated: { text: "\u6700\u540E\u66F4\u65B0\u4E8E" },
        editLink: {
          pattern: SITE_REPO + "/edit/main/:path",
          text: "\u5728 GitHub \u4E0A\u7F16\u8F91\u6B64\u9875"
        },
        darkModeSwitchLabel: "\u5916\u89C2",
        sidebarMenuLabel: "\u76EE\u5F55",
        returnToTopLabel: "\u56DE\u5230\u9876\u90E8"
      }
    },
    en: {
      label: "English",
      lang: "en-US",
      link: "/en/",
      title: "Gox",
      titleTemplate: ":title \xB7 JavaScript runtime built from scratch in Go",
      description: "Gox is a JavaScript runtime built from scratch in Go: a full lexer / parser / bytecode VM pipeline in a single binary with zero cgo and zero external dependencies, a software-rasterized GUI layer, ES6+ and JSX support, and a bundler that turns scripts into standalone executables.",
      themeConfig: {
        nav: [
          { text: "Home", link: "/en/" },
          { text: "Guide", link: "/en/guide/", activeMatch: "/en/guide/" },
          { text: "Components", link: "/en/components/", activeMatch: "/en/components/" },
          { text: "API Reference", link: "/en/api/", activeMatch: "/en/api/" }
        ],
        sidebar: sidebarGuideEn,
        outline: { level: [2, 3], label: "On this page" },
        search: { provider: "local" },
        socialLinks: [{ icon: "github", link: REPO }],
        footer: {
          message: "Apache License 2.0 \xB7 Written in Go with \u2764",
          copyright: `Copyright \xA9 2026 <a href="${REPO}" target="_blank" rel="noopener">Gox</a> \xB7 <a href="${SITE_REPO}" target="_blank" rel="noopener">Website source</a>`
        },
        docFooter: { prev: "Previous", next: "Next" },
        lastUpdated: { text: "Last updated" },
        editLink: {
          pattern: SITE_REPO + "/edit/main/:path",
          text: "Edit this page on GitHub"
        },
        darkModeSwitchLabel: "Appearance",
        sidebarMenuLabel: "Table of Contents",
        returnToTopLabel: "Back to top"
      }
    }
  },
  sitemap: {
    hostname: SITE + BASE,
    // 404 页不应进 sitemap（1.6.x 不读 frontmatter sitemap:false，用官方钩子过滤）
    transformItems(items) {
      return items.filter((it) => !it.url.endsWith("404.html"));
    }
  },
  srcExclude: ["README.md"],
  transformPageData(pageData) {
    const rel = pageData.relativePath;
    const isEn = rel.startsWith("en/");
    const isHome = rel === "index.md" || rel === "en/index.md";
    const url = ORIGIN + rel.replace(/(^|\/)index\.md$/, "$1").replace(/\.md$/, ".html");
    const rawTitle = pageData.frontmatter?.title || "Gox";
    const title = isHome ? isEn ? "Gox \u2014 JavaScript runtime built from scratch in Go" : "Gox \u2014 \u7528 Go \u4ECE\u96F6\u5B9E\u73B0\u7684 JavaScript \u8FD0\u884C\u65F6" : `${rawTitle} \xB7 Gox`;
    const desc = pageData.frontmatter?.description || (isEn ? "JavaScript runtime built from scratch in Go: full compiler pipeline + custom GUI rendering + single-file bundling." : "\u7528 Go \u4ECE\u96F6\u5B9E\u73B0\u7684 JavaScript \u8FD0\u884C\u65F6\uFF1A\u5B8C\u6574\u7F16\u8BD1\u7BA1\u7EBF + \u81EA\u7814 GUI \u6E32\u67D3\u5C42 + \u5355\u6587\u4EF6\u6253\u5305\u3002");
    pageData.frontmatter.head ??= [];
    const h = pageData.frontmatter.head;
    h.push(
      ["link", { rel: "canonical", href: url }],
      ["meta", { property: "og:title", content: title }],
      ["meta", { property: "og:description", content: desc }],
      ["meta", { property: "og:url", content: url }],
      ["meta", { property: "og:type", content: "website" }],
      ["meta", { property: "og:image", content: ORIGIN + "og-image.png" }],
      ["meta", { property: "og:image:width", content: "1200" }],
      ["meta", { property: "og:image:height", content: "630" }],
      ["meta", { property: "og:locale", content: isEn ? "en_US" : "zh_CN" }],
      ["meta", { name: "twitter:title", content: title }],
      ["meta", { name: "twitter:description", content: desc }],
      ["meta", { name: "twitter:image", content: ORIGIN + "og-image.png" }]
    );
    if (rel === "index.md") {
      h.push(
        ["script", { type: "application/ld+json" }, JSON.stringify(jsonLdApp)],
        ["script", { type: "application/ld+json" }, JSON.stringify(jsonLdSite)]
      );
    }
    if (rel === "guide/faq.md") {
      h.push(["script", { type: "application/ld+json" }, JSON.stringify(jsonLdFaq)]);
    }
  }
});
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLnZpdGVwcmVzcy9jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRjpcXFxcZGVza3RvcFxcXFxnb1xcXFx3ZWJzaXRlXFxcXC52aXRlcHJlc3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkY6XFxcXGRlc2t0b3BcXFxcZ29cXFxcd2Vic2l0ZVxcXFwudml0ZXByZXNzXFxcXGNvbmZpZy5tdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Y6L2Rlc2t0b3AvZ28vd2Vic2l0ZS8udml0ZXByZXNzL2NvbmZpZy5tdHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlcHJlc3MnXG5cbmNvbnN0IEJBU0UgPSAnL0dveC8nXG5jb25zdCBTSVRFID0gJ2h0dHBzOi8vMTQ3NTIyMjIuZ2l0aHViLmlvJ1xuY29uc3QgT1JJR0lOID0gU0lURSArIEJBU0VcbmNvbnN0IFJFUE8gPSAnaHR0cHM6Ly9naXRodWIuY29tLzE0NzUyMjIyL0dveCdcbmNvbnN0IFNJVEVfUkVQTyA9ICdodHRwczovL2dpdGh1Yi5jb20vMTQ3NTIyMjIvZ294LXdlYnNpdGUnXG5cbi8vIFx1N0VEM1x1Njc4NFx1NTMxNlx1NjU3MFx1NjM2RVx1RkYxQVNvZnR3YXJlQXBwbGljYXRpb24gKyBXZWJTaXRlXHVGRjA4XHU0RTJEXHU2NTg3XHU5OTk2XHU5ODc1XHU2Q0U4XHU1MTY1XHVGRjFCXHU4MkYxXHU2NTg3XHU5OTk2XHU5ODc1XHU2NTg3XHU2ODQ4XHU0RTBEXHU1NDBDXHVGRjBDXHU0RTBEXHU2Q0U4XHU1MTY1XHU5MDdGXHU1MTREXHU4QkVEXHU0RTQ5XHU2REY3XHU2NDJEXHVGRjA5XG5jb25zdCBqc29uTGRBcHAgPSB7XG4gICdAY29udGV4dCc6ICdodHRwczovL3NjaGVtYS5vcmcnLFxuICAnQHR5cGUnOiAnU29mdHdhcmVBcHBsaWNhdGlvbicsXG4gIG5hbWU6ICdHb3gnLFxuICBhbHRlcm5hdGVOYW1lOiAnQGdveGpzL2dveGpzJyxcbiAgYXBwbGljYXRpb25DYXRlZ29yeTogJ0RldmVsb3BlckFwcGxpY2F0aW9uJyxcbiAgb3BlcmF0aW5nU3lzdGVtOiAnV2luZG93cywgTGludXgsIG1hY09TJyxcbiAgZGVzY3JpcHRpb246XG4gICAgJ0dveCBcdTY2MkZcdTc1MjggR28gXHU0RUNFXHU5NkY2XHU1QjlFXHU3M0IwXHU3Njg0IEphdmFTY3JpcHQgXHU4RkQwXHU4ODRDXHU2NUY2XHVGRjFBXHU4QkNEXHU2Q0Q1XHU1MjA2XHU2NzkwIFx1MjE5MiBcdThCRURcdTZDRDVcdTUyMDZcdTY3OTAgXHUyMTkyIFx1NUI1N1x1ODI4Mlx1NzgwMVx1N0YxNlx1OEJEMSBcdTIxOTIgXHU2ODA4XHU1RjBGXHU4NjVBXHU2MkRGXHU2NzNBXHU2MjY3XHU4ODRDXHUzMDAyXHU1MzU1XHU0RThDXHU4RkRCXHU1MjM2XHUzMDAxXHU5NkY2IGNnb1x1MzAwMVx1OTZGNlx1NTkxNlx1OTBFOFx1NEY5RFx1OEQ1Nlx1RkYwQ1x1ODFFQVx1NUUyNlx1OEY2Rlx1NEVGNlx1NTE0OVx1NjgwNVx1NTMxNiBHVUkgXHU0RTBFXHU4MTFBXHU2NzJDXHU2MjUzXHU1MzA1XHU1NjY4XHUzMDAyJyxcbiAgdXJsOiBPUklHSU4sXG4gIHNvZnR3YXJlVmVyc2lvbjogJzAuOS4wJyxcbiAgbGljZW5zZTogJ2h0dHBzOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvQXBhY2hlLTIuMCcsXG4gIGF1dGhvcjogeyAnQHR5cGUnOiAnUGVyc29uJywgbmFtZTogJzE0NzUyMjIyJywgdXJsOiBSRVBPIH0sXG4gIGNvZGVSZXBvc2l0b3J5OiBSRVBPLFxuICBwcm9ncmFtbWluZ0xhbmd1YWdlOiBbJ0dvJywgJ0phdmFTY3JpcHQnXSxcbiAgb2ZmZXJzOiB7ICdAdHlwZSc6ICdPZmZlcicsIHByaWNlOiAnMCcsIHByaWNlQ3VycmVuY3k6ICdVU0QnIH0sXG59XG5jb25zdCBqc29uTGRTaXRlID0ge1xuICAnQGNvbnRleHQnOiAnaHR0cHM6Ly9zY2hlbWEub3JnJyxcbiAgJ0B0eXBlJzogJ1dlYlNpdGUnLFxuICBuYW1lOiAnR294JyxcbiAgYWx0ZXJuYXRlTmFtZTogJ0dveCBKYXZhU2NyaXB0IFx1OEZEMFx1ODg0Q1x1NjVGNicsXG4gIHVybDogT1JJR0lOLFxuICBpbkxhbmd1YWdlOiAnemgtQ04nLFxuICBkZXNjcmlwdGlvbjogJ1x1NzUyOCBHbyBcdTRFQ0VcdTk2RjZcdTVCOUVcdTczQjBcdTc2ODQgSmF2YVNjcmlwdCBcdThGRDBcdTg4NENcdTY1RjZcdUZGMUFcdTVCOENcdTY1NzRcdTdGMTZcdThCRDFcdTdCQTFcdTdFQkYgKyBcdTgxRUFcdTc4MTQgR1VJIFx1NkUzMlx1NjdEM1x1NUM0MiArIFx1NTM1NVx1NjU4N1x1NEVGNlx1NjI1M1x1NTMwNVx1MzAwMicsXG59XG4vLyBGQVFQYWdlIFx1N0VEM1x1Njc4NFx1NTMxNlx1NjU3MFx1NjM2RVx1RkYwOGd1aWRlL2ZhcS5tZCBcdTZDRThcdTUxNjVcdUZGMDlcbmNvbnN0IGpzb25MZEZhcSA9IHtcbiAgJ0Bjb250ZXh0JzogJ2h0dHBzOi8vc2NoZW1hLm9yZycsXG4gICdAdHlwZSc6ICdGQVFQYWdlJyxcbiAgbWFpbkVudGl0eTogW1xuICAgIHtcbiAgICAgICdAdHlwZSc6ICdRdWVzdGlvbicsXG4gICAgICBuYW1lOiAnR294IFx1NEUzQVx1NEVDMFx1NEU0OFx1NEUwRFx1NjUyRlx1NjMwMSB2YXI/JyxcbiAgICAgIGFjY2VwdGVkQW5zd2VyOiB7XG4gICAgICAgICdAdHlwZSc6ICdBbnN3ZXInLFxuICAgICAgICB0ZXh0OiAnR294IFx1NTIzQlx1NjEwRlx1NTNFQVx1NUI5RVx1NzNCMCBFUzYrIFx1NUI1MFx1OTZDNlx1RkYxQWxldCAvIGNvbnN0IFx1NTE3N1x1NTkwN1x1NTc1N1x1N0VBN1x1NEY1Q1x1NzUyOFx1NTdERlx1RkYwQ1x1OEJFRFx1NEU0OVx1NjZGNFx1NkUwNVx1NjY3MFx1RkYwQ1x1NzcwMVx1NTNCQlx1NEU4NiB2YXIgXHU2M0QwXHU1MzQ3XHU3QjQ5XHU1Mzg2XHU1M0YyXHU1MzA1XHU4OEIxXHUzMDAyUkVQTCBcdTU0MkZcdTUyQThcdTYzRDBcdTc5M0FcdThCRUQgXCJFUzYgc3Vic2V0LCBubyB2YXJcIiBcdThCRjRcdTc2ODRcdTVDMzFcdTY2MkZcdThGRDlcdTRFRjZcdTRFOEJcdTMwMDInLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgICdAdHlwZSc6ICdRdWVzdGlvbicsXG4gICAgICBuYW1lOiAnR294IFx1NTQ4QyBOb2RlLmpzIC8gQnVuIC8gRGVubyBcdTY2MkZcdTRFQzBcdTRFNDhcdTUxNzNcdTdDRkI/JyxcbiAgICAgIGFjY2VwdGVkQW5zd2VyOiB7XG4gICAgICAgICdAdHlwZSc6ICdBbnN3ZXInLFxuICAgICAgICB0ZXh0OiAnXHU1QjlBXHU0RjREXHU0RTBEXHU1NDBDXHUzMDAyR294IFx1NzY4NFx1NEVGN1x1NTAzQ1x1NTcyOFx1NEU4RVx1NEVDRVx1OTZGNlx1OEQ3MFx1OTAxQVx1NUI4Q1x1NjU3NFx1N0YxNlx1OEJEMVx1N0JBMVx1N0VCRlx1RkYwOGxleGVyIFx1MjE5MiBwYXJzZXIgXHUyMTkyIGNvbXBpbGVyIFx1MjE5MiBcdTVCNTdcdTgyODJcdTc4MDEgVk1cdUZGMDlcdTVFNzZcdTYzRDBcdTRGOUJcdTUzRUZcdTc1MjhcdTc2ODRcdThCRURcdThBMDBcdTRFMEVcdTVCQkZcdTRFM0JcdTgwRkRcdTUyOUJcdUZGMENcdTkwMDJcdTU0MDhcdTUxOTlcdTgxMUFcdTY3MkNcdTVERTVcdTUxNzdcdTMwMDFDTElcdTMwMDFcdTVDMEZcdTU3OEJcdTY4NENcdTk3NjJcdTdBMEJcdTVFOEZcdUZGMENcdTRFRTVcdTUzQ0FcdTVCNjZcdTRFNjBcdThGRDBcdTg4NENcdTY1RjZcdTUzOUZcdTc0MDZcdTMwMDJcdTVCODNcdTRFMERcdThGRkRcdTZDNDJcdTY2RkZcdTRFRTNcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTc2ODQgTm9kZSBcdTc1MUZcdTYwMDFcdTIwMTRcdTIwMTRcdTZDQTFcdTY3MDkgbnBtIFx1NzUxRlx1NjAwMVx1NTE3Q1x1NUJCOVx1RkYwQ1x1NEU1Rlx1NkNBMVx1NjcwOSBKSVRcdTMwMDInLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgICdAdHlwZSc6ICdRdWVzdGlvbicsXG4gICAgICBuYW1lOiAnR294IFx1NTcyOCBtYWNPUyBcdTRFMEFcdTgwRkRcdTc1MjhcdTU0MTc/JyxcbiAgICAgIGFjY2VwdGVkQW5zd2VyOiB7XG4gICAgICAgICdAdHlwZSc6ICdBbnN3ZXInLFxuICAgICAgICB0ZXh0OiAnQ0xJIFx1NEUwRSBHVUkgXHU5MEZEXHU1M0VGXHU3NTI4XHVGRjFBbnBtIGkgLWcgQGdveGpzL2dveGpzIFx1NzY4NFx1OTg4NFx1N0YxNlx1OEJEMVx1NEU4Q1x1OEZEQlx1NTIzNlx1NTMwNVx1NTQyQiBkYXJ3aW4tYW1kNjQgXHU0RTBFIGRhcndpbi1hcm02NFx1RkYxQjAuNi4wIFx1OEQ3NyBHVUkgXHU0RTVGXHU2NzA5IG1hY09TIFx1N0E5N1x1NTNFM1x1NTQwRVx1N0FFRlx1RkYwOGNvY29hXHVGRjA5XHVGRjBDXHU3QTk3XHU1M0UzXHUzMDAxSU1FIFx1NEUwRVx1NTM5Rlx1NzUxRlx1NUJGOVx1OEJERFx1Njg0Nlx1OTBGRFx1NTNFRlx1NzUyOFx1MzAwMicsXG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgJ0B0eXBlJzogJ1F1ZXN0aW9uJyxcbiAgICAgIG5hbWU6ICdHb3ggXHU2MDBFXHU0RTQ4XHU4QzAzXHU4QkQ1IC8gXHU1M0MyXHU0RTBFXHU1RjAwXHU1M0QxPycsXG4gICAgICBhY2NlcHRlZEFuc3dlcjoge1xuICAgICAgICAnQHR5cGUnOiAnQW5zd2VyJyxcbiAgICAgICAgdGV4dDogJ1x1NzUyOCBnb3ggdmVyc2lvbiBcdTc4NkVcdThCQTRcdTVGNTNcdTUyNERcdTY3ODRcdTVFRkFcdTcyNDhcdTY3MkNcdUZGMUJnbyB0ZXN0IC4vLi4uIFx1OEZEMFx1ODg0Q1x1NTE2OFx1OTBFOFx1NkQ0Qlx1OEJENVx1RkYxQmdvIHJ1biAuL3Rlc3QvYmVuY2ggXHU1MDVBXHU2MDI3XHU4MEZEXHU1MjU2XHU2NzkwXHU1N0ZBXHU1MUM2XHVGRjFCZ28gcnVuIC4vcGFja2FnZXIgLWggXHU2N0U1XHU3NzBCXHU2MjUzXHU1MzA1XHU1NjY4XHU3NTI4XHU2Q0Q1XHUzMDAyXHU5MDQ3XHU1MjMwXHU2NjNFXHU3OTNBXHU3QzdCXHU5NUVFXHU5ODk4XHU1MTQ4XHU1MzQ3XHU3RUE3XHU1MjMwXHU2NzAwXHU2NUIwXHU3MjQ4XHU1MThEXHU1OTBEXHU3M0IwXHUzMDAyJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgXSxcbn1cblxuLy8gXHU0RTJEXHU2NTg3XHVGRjA4XHU2ODM5IGxvY2FsZVx1RkYwOVx1NEZBN1x1OEZCOVx1NjgwRlxuY29uc3Qgc2lkZWJhckd1aWRlWmggPSB7XG4gICcvZ3VpZGUvJzogW1xuICAgIHtcbiAgICAgIHRleHQ6ICdcdTRGN0ZcdTc1MjhcdTY1NTlcdTdBMEInLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAgeyB0ZXh0OiAnXHU2MDNCXHU4OUM4JywgbGluazogJy9ndWlkZS8nIH0sXG4gICAgICAgIHsgdGV4dDogJ1x1NUI4OVx1ODhDNVx1NEUwRVx1NTIxQlx1NUVGQVx1NURFNVx1N0EwQicsIGxpbms6ICcvZ3VpZGUvaW5zdGFsbCcgfSxcbiAgICAgICAgeyB0ZXh0OiAnUkVQTCBcdTRFMEVcdTU0N0RcdTRFRTRcdTg4NEMnLCBsaW5rOiAnL2d1aWRlL3JlcGwnIH0sXG4gICAgICAgIHsgdGV4dDogJ1x1OEJFRFx1OEEwMFx1NTdGQVx1Nzg0MFx1NEUwRVx1OEZCOVx1NzU0QycsIGxpbms6ICcvZ3VpZGUvbGFuZ3VhZ2UnIH0sXG4gICAgICAgIHsgdGV4dDogJ0VTIFx1NkEyMVx1NTc1NycsIGxpbms6ICcvZ3VpZGUvbW9kdWxlcycgfSxcbiAgICAgICAgeyB0ZXh0OiAnXHU1RjAyXHU2QjY1XHU0RTBFXHU0RThCXHU0RUY2XHU1RkFBXHU3M0FGJywgbGluazogJy9ndWlkZS9hc3luYycgfSxcbiAgICAgICAgeyB0ZXh0OiAnXHU1MTg1XHU3RjZFXHU1QkY5XHU4QzYxXHU5MDFGXHU4OUM4JywgbGluazogJy9ndWlkZS9idWlsdGlucycgfSxcbiAgICAgICAgeyB0ZXh0OiAnXHU2NTg3XHU0RUY2XHU0RTBFXHU3Q0ZCXHU3RURGIGZzIC8gcGF0aCAvIHByb2Nlc3MnLCBsaW5rOiAnL2d1aWRlL2ZzJyB9LFxuICAgICAgICB7IHRleHQ6ICdcdTdGNTFcdTdFRENcdTRFMEUgSFRUUCBcdTY3MERcdTUyQTEnLCBsaW5rOiAnL2d1aWRlL2h0dHAnIH0sXG4gICAgICAgIHsgdGV4dDogJ1x1NTRDRFx1NUU5NFx1NUYwRlx1N0YxNlx1N0EwQicsIGxpbms6ICcvZ3VpZGUvcmVhY3RpdmUnIH0sXG4gICAgICAgIHsgdGV4dDogJ0dVSSBcdTY4NENcdTk3NjJcdTVFOTRcdTc1MjgnLCBsaW5rOiAnL2d1aWRlL2d1aScgfSxcbiAgICAgICAgeyB0ZXh0OiAnXHU2MjUzXHU1MzA1XHU3MkVDXHU3QUNCXHU1M0VGXHU2MjY3XHU4ODRDXHU2NTg3XHU0RUY2JywgbGluazogJy9ndWlkZS9wYWNrYWdlJyB9LFxuICAgICAgICB7IHRleHQ6ICdcdTVFMzhcdTg5QzFcdTk1RUVcdTk4OTggRkFRJywgbGluazogJy9ndWlkZS9mYXEnIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIF0sXG4gICcvY29tcG9uZW50cy8nOiBbXG4gICAge1xuICAgICAgdGV4dDogJ1x1N0VDNFx1NEVGNlx1NTNDMlx1ODAwMycsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7IHRleHQ6ICdcdTYwM0JcdTg5QzhcdTRFMEVcdTUxNzFcdTU0MENcdTdFQTZcdTVCOUEnLCBsaW5rOiAnL2NvbXBvbmVudHMvJyB9LFxuICAgICAgICB7IHRleHQ6ICdcdTVFMDNcdTVDNDBcdTVCQjlcdTU2NjgnLCBsaW5rOiAnL2NvbXBvbmVudHMvbGF5b3V0JyB9LFxuICAgICAgICB7IHRleHQ6ICdcdTg4NjhcdTUzNTVcdTYzQTdcdTRFRjYnLCBsaW5rOiAnL2NvbXBvbmVudHMvZm9ybScgfSxcbiAgICAgICAgeyB0ZXh0OiAnXHU1MTg1XHU1QkI5XHU1QzU1XHU3OTNBJywgbGluazogJy9jb21wb25lbnRzL2NvbnRlbnQnIH0sXG4gICAgICAgIHsgdGV4dDogJ1x1NTNDRFx1OTk4OFx1NEUwRVx1NUYzOVx1NUM0MicsIGxpbms6ICcvY29tcG9uZW50cy9vdmVybGF5JyB9LFxuICAgICAgICB7IHRleHQ6ICdcdTVCRkNcdTgyMkFcdTRFMEVcdTgzRENcdTUzNTUnLCBsaW5rOiAnL2NvbXBvbmVudHMvbmF2aWdhdGlvbicgfSxcbiAgICAgICAgeyB0ZXh0OiAnXHU4MUVBXHU3RUQ4XHU3NTNCXHU1RTAzJywgbGluazogJy9jb21wb25lbnRzL2NhbnZhcycgfSxcbiAgICAgICAgeyB0ZXh0OiAnXHU2QTJBXHU1MjA3XHU4MEZEXHU1MjlCJywgbGluazogJy9jb21wb25lbnRzL3BhdHRlcm5zJyB9LFxuICAgICAgICB7IHRleHQ6ICdcdTZBMjFcdTU3NTcgQVBJJywgbGluazogJy9jb21wb25lbnRzL21vZHVsZXMnIH0sXG4gICAgICAgIHsgdGV4dDogJ1x1OTY1MFx1NTIzNlx1NEUwRVx1NUUzOFx1ODlDMVx1OEJFRlx1NTMzQScsIGxpbms6ICcvY29tcG9uZW50cy9saW1pdHMnIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIF0sXG4gICcvYXBpLyc6IFtcbiAgICB7XG4gICAgICB0ZXh0OiAnQVBJIFx1NTNDMlx1ODAwMycsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7IHRleHQ6ICdcdThGRDBcdTg4NENcdTY1RjZcdTRFMEVcdTUxNjhcdTVDNDBcdTRGNUNcdTc1MjhcdTU3REYnLCBsaW5rOiAnL2FwaS8nIH0sXG4gICAgICAgIHsgdGV4dDogJ1x1NjgwN1x1NTFDNlx1NTE4NVx1NUVGQVx1NUJGOVx1OEM2MVx1NEUwRVx1NUI5QVx1NjVGNlx1NTY2OCcsIGxpbms6ICcvYXBpL2J1aWx0aW5zJyB9LFxuICAgICAgICB7IHRleHQ6ICdcdTVCQkZcdTRFM0JcdTZBMjFcdTU3NTcnLCBsaW5rOiAnL2FwaS9ob3N0JyB9LFxuICAgICAgICB7IHRleHQ6ICdcdTUxODVcdTdGNkVcdTZBMjFcdTU3NTcgZ3gvKicsIGxpbms6ICcvYXBpL2d4JyB9LFxuICAgICAgICB7IHRleHQ6ICdcdTVERUVcdTVGMDJcdTRFMEVcdTdGM0FcdTU5MzEgQVBJJywgbGluazogJy9hcGkvZGlmZmVyZW5jZXMnIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIF0sXG59XG5cbi8vIFx1ODJGMVx1NjU4N1x1RkYwOC9lbi8gbG9jYWxlXHVGRjA5XHU0RkE3XHU4RkI5XHU2ODBGXG5jb25zdCBzaWRlYmFyR3VpZGVFbiA9IHtcbiAgJy9lbi9ndWlkZS8nOiBbXG4gICAge1xuICAgICAgdGV4dDogJ0d1aWRlJyxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHsgdGV4dDogJ092ZXJ2aWV3JywgbGluazogJy9lbi9ndWlkZS8nIH0sXG4gICAgICAgIHsgdGV4dDogJ0luc3RhbGxhdGlvbiAmIENyZWF0aW5nIGEgUHJvamVjdCcsIGxpbms6ICcvZW4vZ3VpZGUvaW5zdGFsbCcgfSxcbiAgICAgICAgeyB0ZXh0OiAnUkVQTCAmIENvbW1hbmQgTGluZScsIGxpbms6ICcvZW4vZ3VpZGUvcmVwbCcgfSxcbiAgICAgICAgeyB0ZXh0OiAnTGFuZ3VhZ2UgQmFzaWNzICYgTGltaXRzJywgbGluazogJy9lbi9ndWlkZS9sYW5ndWFnZScgfSxcbiAgICAgICAgeyB0ZXh0OiAnRVMgTW9kdWxlcycsIGxpbms6ICcvZW4vZ3VpZGUvbW9kdWxlcycgfSxcbiAgICAgICAgeyB0ZXh0OiAnQXN5bmMgJiB0aGUgRXZlbnQgTG9vcCcsIGxpbms6ICcvZW4vZ3VpZGUvYXN5bmMnIH0sXG4gICAgICAgIHsgdGV4dDogJ0J1aWx0LWluIE9iamVjdHMgYXQgYSBHbGFuY2UnLCBsaW5rOiAnL2VuL2d1aWRlL2J1aWx0aW5zJyB9LFxuICAgICAgICB7IHRleHQ6ICdGaWxlcyAmIFN5c3RlbTogZnMgLyBwYXRoIC8gcHJvY2VzcycsIGxpbms6ICcvZW4vZ3VpZGUvZnMnIH0sXG4gICAgICAgIHsgdGV4dDogJ05ldHdvcmtpbmcgJiBIVFRQIFNlcnZlcicsIGxpbms6ICcvZW4vZ3VpZGUvaHR0cCcgfSxcbiAgICAgICAgeyB0ZXh0OiAnUmVhY3RpdmUgUHJvZ3JhbW1pbmcnLCBsaW5rOiAnL2VuL2d1aWRlL3JlYWN0aXZlJyB9LFxuICAgICAgICB7IHRleHQ6ICdHVUkgRGVza3RvcCBBcHBzJywgbGluazogJy9lbi9ndWlkZS9ndWknIH0sXG4gICAgICAgIHsgdGV4dDogJ1BhY2thZ2luZyBhIFN0YW5kYWxvbmUgRXhlY3V0YWJsZScsIGxpbms6ICcvZW4vZ3VpZGUvcGFja2FnZScgfSxcbiAgICAgICAgeyB0ZXh0OiAnRkFRJywgbGluazogJy9lbi9ndWlkZS9mYXEnIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIF0sXG4gICcvZW4vY29tcG9uZW50cy8nOiBbXG4gICAge1xuICAgICAgdGV4dDogJ0NvbXBvbmVudHMnLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAgeyB0ZXh0OiAnT3ZlcnZpZXcgJiBDb252ZW50aW9ucycsIGxpbms6ICcvZW4vY29tcG9uZW50cy8nIH0sXG4gICAgICAgIHsgdGV4dDogJ0xheW91dCBDb250YWluZXJzJywgbGluazogJy9lbi9jb21wb25lbnRzL2xheW91dCcgfSxcbiAgICAgICAgeyB0ZXh0OiAnRm9ybSBDb250cm9scycsIGxpbms6ICcvZW4vY29tcG9uZW50cy9mb3JtJyB9LFxuICAgICAgICB7IHRleHQ6ICdDb250ZW50IERpc3BsYXknLCBsaW5rOiAnL2VuL2NvbXBvbmVudHMvY29udGVudCcgfSxcbiAgICAgICAgeyB0ZXh0OiAnRmVlZGJhY2sgJiBPdmVybGF5cycsIGxpbms6ICcvZW4vY29tcG9uZW50cy9vdmVybGF5JyB9LFxuICAgICAgICB7IHRleHQ6ICdOYXZpZ2F0aW9uICYgTWVudXMnLCBsaW5rOiAnL2VuL2NvbXBvbmVudHMvbmF2aWdhdGlvbicgfSxcbiAgICAgICAgeyB0ZXh0OiAnQ3VzdG9tLWRyYXduIENhbnZhcycsIGxpbms6ICcvZW4vY29tcG9uZW50cy9jYW52YXMnIH0sXG4gICAgICAgIHsgdGV4dDogJ0Nyb3NzLWN1dHRpbmcgUGF0dGVybnMnLCBsaW5rOiAnL2VuL2NvbXBvbmVudHMvcGF0dGVybnMnIH0sXG4gICAgICAgIHsgdGV4dDogJ01vZHVsZSBBUElzJywgbGluazogJy9lbi9jb21wb25lbnRzL21vZHVsZXMnIH0sXG4gICAgICAgIHsgdGV4dDogJ0xpbWl0cyAmIENvbW1vbiBQaXRmYWxscycsIGxpbms6ICcvZW4vY29tcG9uZW50cy9saW1pdHMnIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIF0sXG4gICcvZW4vYXBpLyc6IFtcbiAgICB7XG4gICAgICB0ZXh0OiAnQVBJIFJlZmVyZW5jZScsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7IHRleHQ6ICdSdW50aW1lICYgR2xvYmFsIFNjb3BlJywgbGluazogJy9lbi9hcGkvJyB9LFxuICAgICAgICB7IHRleHQ6ICdTdGFuZGFyZCBCdWlsdC1pbnMgJiBUaW1lcnMnLCBsaW5rOiAnL2VuL2FwaS9idWlsdGlucycgfSxcbiAgICAgICAgeyB0ZXh0OiAnSG9zdCBNb2R1bGVzJywgbGluazogJy9lbi9hcGkvaG9zdCcgfSxcbiAgICAgICAgeyB0ZXh0OiAnQnVpbHQtaW4gTW9kdWxlcyBneC8qJywgbGluazogJy9lbi9hcGkvZ3gnIH0sXG4gICAgICAgIHsgdGV4dDogJ0RpZmZlcmVuY2VzICYgTWlzc2luZyBBUElzJywgbGluazogJy9lbi9hcGkvZGlmZmVyZW5jZXMnIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGJhc2U6ICcvR294LycsXG4gIC8vIFx1Njc4NFx1NUVGQVx1NjVGNlx1NjhDMFx1NjdFNVx1N0FEOVx1NTE4NVx1NkI3Qlx1OTRGRVx1RkYwQ1x1NjVBRFx1OTRGRVx1NzZGNFx1NjNBNVx1Njc4NFx1NUVGQVx1NTkzMVx1OEQyNVx1RkYwOENJIFx1NTE1Q1x1NUU5NVx1RkYwOVxuICBpZ25vcmVEZWFkTGlua3M6IGZhbHNlLFxuICBtYXJrZG93bjoge1xuICAgIGNvbmZpZyhtZCkge1xuICAgICAgLy8gaW5saW5lIGNvZGUgXHU0RTJEXHU3Njg0IHt7IH19IFx1NEYxQVx1ODhBQiBWdWUgXHU3RjE2XHU4QkQxXHU1NjY4XHU1RjUzXHU0RjVDXHU2M0QyXHU1MDNDXHVGRjA4ZmVuY2VkIGNvZGUgXHU1NzU3XHU2NzA5IHYtcHJlIFx1NEZERFx1NjJBNFx1RkYwQ1xuICAgICAgLy8gaW5saW5lIGNvZGUgXHU2Q0ExXHU2NzA5XHVGRjA5XHUzMDAyXHU3RURGXHU0RTAwXHU3RUQ5IGNvZGVfaW5saW5lIFx1OEY5M1x1NTFGQVx1NTJBMCB2LXByZVx1RkYwQ1x1NEUwMFx1NTJCM1x1NkMzOFx1OTAzOFx1MzAwMlxuICAgICAgbWQucmVuZGVyZXIucnVsZXMuY29kZV9pbmxpbmUgPSAodG9rZW5zLCBpZHgpID0+IHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSB0b2tlbnNbaWR4XVxuICAgICAgICByZXR1cm4gYDxjb2RlIHYtcHJlPiR7bWQudXRpbHMuZXNjYXBlSHRtbCh0b2tlbi5jb250ZW50KX08L2NvZGU+YFxuICAgICAgfVxuICAgIH0sXG4gIH0sXG4gIGhlYWQ6IFtcbiAgICBbJ2xpbmsnLCB7IHJlbDogJ2ljb24nLCB0eXBlOiAnaW1hZ2UvcG5nJywgaHJlZjogQkFTRSArICdmYXZpY29uLnBuZycgfV0sXG4gICAgWydtZXRhJywgeyBuYW1lOiAndGhlbWUtY29sb3InLCBjb250ZW50OiAnIzBiMGYxNCcgfV0sXG4gICAgWydtZXRhJywgeyBwcm9wZXJ0eTogJ29nOnNpdGVfbmFtZScsIGNvbnRlbnQ6ICdHb3gnIH1dLFxuICAgIFsnbWV0YScsIHsgbmFtZTogJ3R3aXR0ZXI6Y2FyZCcsIGNvbnRlbnQ6ICdzdW1tYXJ5X2xhcmdlX2ltYWdlJyB9XSxcbiAgICBbJ21ldGEnLCB7IG5hbWU6ICdyb2JvdHMnLCBjb250ZW50OiAnaW5kZXgsIGZvbGxvdywgbWF4LWltYWdlLXByZXZpZXc6bGFyZ2UnIH1dLFxuICBdLFxuICAvLyBcdTRFMkRcdTgyRjFcdTUzQ0NcdThCRURcdUZGMUFcdTY4MzkgbG9jYWxlID0gXHU3QjgwXHU0RjUzXHU0RTJEXHU2NTg3XHVGRjBDL2VuLyA9IEVuZ2xpc2hcdUZGMUJcdTVCRkNcdTgyMkFcdTY4MEZcdTUzRjNcdTRGQTdcdTRGMUFcdTUxRkFcdTczQjBcdThCRURcdThBMDBcdTUyMDdcdTYzNjJcdTU2NjhcbiAgbG9jYWxlczoge1xuICAgIHJvb3Q6IHtcbiAgICAgIGxhYmVsOiAnXHU3QjgwXHU0RjUzXHU0RTJEXHU2NTg3JyxcbiAgICAgIGxhbmc6ICd6aC1DTicsXG4gICAgICB0aXRsZTogJ0dveCcsXG4gICAgICB0aXRsZVRlbXBsYXRlOiAnOnRpdGxlIFx1MDBCNyBcdTc1MjggR28gXHU0RUNFXHU5NkY2XHU1QjlFXHU3M0IwXHU3Njg0IEphdmFTY3JpcHQgXHU4RkQwXHU4ODRDXHU2NUY2JyxcbiAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAnR294IFx1NjYyRlx1NzUyOCBHbyBcdTRFQ0VcdTk2RjZcdTVCOUVcdTczQjBcdTc2ODQgSmF2YVNjcmlwdCBcdThGRDBcdTg4NENcdTY1RjZcdUZGMUFcdTgxRUFcdTc4MTQgbGV4ZXIgLyBwYXJzZXIgLyBcdTVCNTdcdTgyODJcdTc4MDEgVk0gXHU1QjhDXHU2NTc0XHU3RjE2XHU4QkQxXHU3QkExXHU3RUJGXHVGRjBDXHU1MzU1XHU0RThDXHU4RkRCXHU1MjM2XHUzMDAxXHU5NkY2IGNnb1x1MzAwMVx1OTZGNlx1NTkxNlx1OTBFOFx1NEY5RFx1OEQ1Nlx1RkYwQ1x1ODFFQVx1NUUyNlx1OEY2Rlx1NEVGNlx1NTE0OVx1NjgwNVx1NTMxNiBHVUkgXHU2RTMyXHU2N0QzXHU1QzQyXHVGRjBDXHU2NTJGXHU2MzAxIEVTNisgXHU0RTBFIEpTWFx1RkYwQ1x1ODBGRFx1NjI4QVx1ODExQVx1NjcyQ1x1NjI1M1x1NTMwNVx1NjIxMFx1NzJFQ1x1N0FDQlx1NTNFRlx1NjI2N1x1ODg0Q1x1NjU4N1x1NEVGNlx1MzAwMicsXG4gICAgICB0aGVtZUNvbmZpZzoge1xuICAgICAgICBuYXY6IFtcbiAgICAgICAgICB7IHRleHQ6ICdcdTk5OTZcdTk4NzUnLCBsaW5rOiAnLycgfSxcbiAgICAgICAgICB7IHRleHQ6ICdcdTRGN0ZcdTc1MjhcdTY1NTlcdTdBMEInLCBsaW5rOiAnL2d1aWRlLycsIGFjdGl2ZU1hdGNoOiAnL2d1aWRlLycgfSxcbiAgICAgICAgICB7IHRleHQ6ICdcdTdFQzRcdTRFRjZcdTUzQzJcdTgwMDMnLCBsaW5rOiAnL2NvbXBvbmVudHMvJywgYWN0aXZlTWF0Y2g6ICcvY29tcG9uZW50cy8nIH0sXG4gICAgICAgICAgeyB0ZXh0OiAnQVBJIFx1NTNDMlx1ODAwMycsIGxpbms6ICcvYXBpLycsIGFjdGl2ZU1hdGNoOiAnL2FwaS8nIH0sXG4gICAgICAgIF0sXG4gICAgICAgIHNpZGViYXI6IHNpZGViYXJHdWlkZVpoLFxuICAgICAgICBvdXRsaW5lOiB7IGxldmVsOiBbMiwgM10sIGxhYmVsOiAnXHU2NzJDXHU5ODc1XHU3NkVFXHU1RjU1JyB9LFxuICAgICAgICBzZWFyY2g6IHtcbiAgICAgICAgICBwcm92aWRlcjogJ2xvY2FsJyxcbiAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICB0cmFuc2xhdGlvbnM6IHtcbiAgICAgICAgICAgICAgYnV0dG9uOiB7IGJ1dHRvblRleHQ6ICdcdTY0MUNcdTdEMjJcdTY1ODdcdTY4NjMnLCBidXR0b25BcmlhTGFiZWw6ICdcdTY0MUNcdTdEMjJcdTY1ODdcdTY4NjMnIH0sXG4gICAgICAgICAgICAgIG1vZGFsOiB7XG4gICAgICAgICAgICAgICAgbm9SZXN1bHRzVGV4dDogJ1x1NkNBMVx1NjcwOVx1NjI3RVx1NTIzMFx1N0VEM1x1Njc5QycsXG4gICAgICAgICAgICAgICAgcmVzZXRCdXR0b25UaXRsZTogJ1x1NkUwNVx1OTY2NFx1NjdFNVx1OEJFMlx1Njc2MVx1NEVGNicsXG4gICAgICAgICAgICAgICAgZm9vdGVyOiB7IHNlbGVjdFRleHQ6ICdcdTkwMDlcdTYyRTknLCBuYXZpZ2F0ZVRleHQ6ICdcdTUyMDdcdTYzNjInLCBjbG9zZVRleHQ6ICdcdTUxNzNcdTk1RUQnIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHNvY2lhbExpbmtzOiBbeyBpY29uOiAnZ2l0aHViJywgbGluazogUkVQTyB9XSxcbiAgICAgICAgZm9vdGVyOiB7XG4gICAgICAgICAgbWVzc2FnZTogJ0FwYWNoZSBMaWNlbnNlIDIuMCBcdTAwQjcgXHU3NTI4IFx1Mjc2NCBcdTU0OEMgR28gXHU3RjE2XHU1MTk5JyxcbiAgICAgICAgICBjb3B5cmlnaHQ6IGBDb3B5cmlnaHQgXHUwMEE5IDIwMjYgPGEgaHJlZj1cIiR7UkVQT31cIiB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub29wZW5lclwiPkdveDwvYT4gXHUwMEI3IDxhIGhyZWY9XCIke1NJVEVfUkVQT31cIiB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub29wZW5lclwiPlx1NUI5OFx1N0Y1MVx1NkU5MFx1NzgwMTwvYT5gLFxuICAgICAgICB9LFxuICAgICAgICBkb2NGb290ZXI6IHsgcHJldjogJ1x1NEUwQVx1NEUwMFx1OTg3NScsIG5leHQ6ICdcdTRFMEJcdTRFMDBcdTk4NzUnIH0sXG4gICAgICAgIGxhc3RVcGRhdGVkOiB7IHRleHQ6ICdcdTY3MDBcdTU0MEVcdTY2RjRcdTY1QjBcdTRFOEUnIH0sXG4gICAgICAgIGVkaXRMaW5rOiB7XG4gICAgICAgICAgcGF0dGVybjogU0lURV9SRVBPICsgJy9lZGl0L21haW4vOnBhdGgnLFxuICAgICAgICAgIHRleHQ6ICdcdTU3MjggR2l0SHViIFx1NEUwQVx1N0YxNlx1OEY5MVx1NkI2NFx1OTg3NScsXG4gICAgICAgIH0sXG4gICAgICAgIGRhcmtNb2RlU3dpdGNoTGFiZWw6ICdcdTU5MTZcdTg5QzInLFxuICAgICAgICBzaWRlYmFyTWVudUxhYmVsOiAnXHU3NkVFXHU1RjU1JyxcbiAgICAgICAgcmV0dXJuVG9Ub3BMYWJlbDogJ1x1NTZERVx1NTIzMFx1OTg3Nlx1OTBFOCcsXG4gICAgICB9LFxuICAgIH0sXG4gICAgZW46IHtcbiAgICAgIGxhYmVsOiAnRW5nbGlzaCcsXG4gICAgICBsYW5nOiAnZW4tVVMnLFxuICAgICAgbGluazogJy9lbi8nLFxuICAgICAgdGl0bGU6ICdHb3gnLFxuICAgICAgdGl0bGVUZW1wbGF0ZTogJzp0aXRsZSBcdTAwQjcgSmF2YVNjcmlwdCBydW50aW1lIGJ1aWx0IGZyb20gc2NyYXRjaCBpbiBHbycsXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgJ0dveCBpcyBhIEphdmFTY3JpcHQgcnVudGltZSBidWlsdCBmcm9tIHNjcmF0Y2ggaW4gR286IGEgZnVsbCBsZXhlciAvIHBhcnNlciAvIGJ5dGVjb2RlIFZNIHBpcGVsaW5lIGluIGEgc2luZ2xlIGJpbmFyeSB3aXRoIHplcm8gY2dvIGFuZCB6ZXJvIGV4dGVybmFsIGRlcGVuZGVuY2llcywgYSBzb2Z0d2FyZS1yYXN0ZXJpemVkIEdVSSBsYXllciwgRVM2KyBhbmQgSlNYIHN1cHBvcnQsIGFuZCBhIGJ1bmRsZXIgdGhhdCB0dXJucyBzY3JpcHRzIGludG8gc3RhbmRhbG9uZSBleGVjdXRhYmxlcy4nLFxuICAgICAgdGhlbWVDb25maWc6IHtcbiAgICAgICAgbmF2OiBbXG4gICAgICAgICAgeyB0ZXh0OiAnSG9tZScsIGxpbms6ICcvZW4vJyB9LFxuICAgICAgICAgIHsgdGV4dDogJ0d1aWRlJywgbGluazogJy9lbi9ndWlkZS8nLCBhY3RpdmVNYXRjaDogJy9lbi9ndWlkZS8nIH0sXG4gICAgICAgICAgeyB0ZXh0OiAnQ29tcG9uZW50cycsIGxpbms6ICcvZW4vY29tcG9uZW50cy8nLCBhY3RpdmVNYXRjaDogJy9lbi9jb21wb25lbnRzLycgfSxcbiAgICAgICAgICB7IHRleHQ6ICdBUEkgUmVmZXJlbmNlJywgbGluazogJy9lbi9hcGkvJywgYWN0aXZlTWF0Y2g6ICcvZW4vYXBpLycgfSxcbiAgICAgICAgXSxcbiAgICAgICAgc2lkZWJhcjogc2lkZWJhckd1aWRlRW4sXG4gICAgICAgIG91dGxpbmU6IHsgbGV2ZWw6IFsyLCAzXSwgbGFiZWw6ICdPbiB0aGlzIHBhZ2UnIH0sXG4gICAgICAgIHNlYXJjaDogeyBwcm92aWRlcjogJ2xvY2FsJyB9LFxuICAgICAgICBzb2NpYWxMaW5rczogW3sgaWNvbjogJ2dpdGh1YicsIGxpbms6IFJFUE8gfV0sXG4gICAgICAgIGZvb3Rlcjoge1xuICAgICAgICAgIG1lc3NhZ2U6ICdBcGFjaGUgTGljZW5zZSAyLjAgXHUwMEI3IFdyaXR0ZW4gaW4gR28gd2l0aCBcdTI3NjQnLFxuICAgICAgICAgIGNvcHlyaWdodDogYENvcHlyaWdodCBcdTAwQTkgMjAyNiA8YSBocmVmPVwiJHtSRVBPfVwiIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vb3BlbmVyXCI+R294PC9hPiBcdTAwQjcgPGEgaHJlZj1cIiR7U0lURV9SRVBPfVwiIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vb3BlbmVyXCI+V2Vic2l0ZSBzb3VyY2U8L2E+YCxcbiAgICAgICAgfSxcbiAgICAgICAgZG9jRm9vdGVyOiB7IHByZXY6ICdQcmV2aW91cycsIG5leHQ6ICdOZXh0JyB9LFxuICAgICAgICBsYXN0VXBkYXRlZDogeyB0ZXh0OiAnTGFzdCB1cGRhdGVkJyB9LFxuICAgICAgICBlZGl0TGluazoge1xuICAgICAgICAgIHBhdHRlcm46IFNJVEVfUkVQTyArICcvZWRpdC9tYWluLzpwYXRoJyxcbiAgICAgICAgICB0ZXh0OiAnRWRpdCB0aGlzIHBhZ2Ugb24gR2l0SHViJyxcbiAgICAgICAgfSxcbiAgICAgICAgZGFya01vZGVTd2l0Y2hMYWJlbDogJ0FwcGVhcmFuY2UnLFxuICAgICAgICBzaWRlYmFyTWVudUxhYmVsOiAnVGFibGUgb2YgQ29udGVudHMnLFxuICAgICAgICByZXR1cm5Ub1RvcExhYmVsOiAnQmFjayB0byB0b3AnLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBzaXRlbWFwOiB7XG4gICAgaG9zdG5hbWU6IFNJVEUgKyBCQVNFLFxuICAgIC8vIDQwNCBcdTk4NzVcdTRFMERcdTVFOTRcdThGREIgc2l0ZW1hcFx1RkYwODEuNi54IFx1NEUwRFx1OEJGQiBmcm9udG1hdHRlciBzaXRlbWFwOmZhbHNlXHVGRjBDXHU3NTI4XHU1Qjk4XHU2NUI5XHU5NEE5XHU1QjUwXHU4RkM3XHU2RUU0XHVGRjA5XG4gICAgdHJhbnNmb3JtSXRlbXMoaXRlbXMpIHtcbiAgICAgIHJldHVybiBpdGVtcy5maWx0ZXIoKGl0KSA9PiAhaXQudXJsLmVuZHNXaXRoKCc0MDQuaHRtbCcpKVxuICAgIH0sXG4gIH0sXG4gIHNyY0V4Y2x1ZGU6IFsnUkVBRE1FLm1kJ10sXG4gIHRyYW5zZm9ybVBhZ2VEYXRhKHBhZ2VEYXRhKSB7XG4gICAgY29uc3QgcmVsID0gcGFnZURhdGEucmVsYXRpdmVQYXRoXG4gICAgY29uc3QgaXNFbiA9IHJlbC5zdGFydHNXaXRoKCdlbi8nKVxuICAgIGNvbnN0IGlzSG9tZSA9IHJlbCA9PT0gJ2luZGV4Lm1kJyB8fCByZWwgPT09ICdlbi9pbmRleC5tZCdcbiAgICBjb25zdCB1cmwgPSBPUklHSU4gKyByZWwucmVwbGFjZSgvKF58XFwvKWluZGV4XFwubWQkLywgJyQxJykucmVwbGFjZSgvXFwubWQkLywgJy5odG1sJylcbiAgICBjb25zdCByYXdUaXRsZSA9IChwYWdlRGF0YS5mcm9udG1hdHRlcj8udGl0bGUgYXMgc3RyaW5nKSB8fCAnR294J1xuICAgIGNvbnN0IHRpdGxlID0gaXNIb21lXG4gICAgICA/IGlzRW5cbiAgICAgICAgPyAnR294IFx1MjAxNCBKYXZhU2NyaXB0IHJ1bnRpbWUgYnVpbHQgZnJvbSBzY3JhdGNoIGluIEdvJ1xuICAgICAgICA6ICdHb3ggXHUyMDE0IFx1NzUyOCBHbyBcdTRFQ0VcdTk2RjZcdTVCOUVcdTczQjBcdTc2ODQgSmF2YVNjcmlwdCBcdThGRDBcdTg4NENcdTY1RjYnXG4gICAgICA6IGAke3Jhd1RpdGxlfSBcdTAwQjcgR294YFxuICAgIGNvbnN0IGRlc2MgPVxuICAgICAgKHBhZ2VEYXRhLmZyb250bWF0dGVyPy5kZXNjcmlwdGlvbiBhcyBzdHJpbmcpIHx8XG4gICAgICAoaXNFblxuICAgICAgICA/ICdKYXZhU2NyaXB0IHJ1bnRpbWUgYnVpbHQgZnJvbSBzY3JhdGNoIGluIEdvOiBmdWxsIGNvbXBpbGVyIHBpcGVsaW5lICsgY3VzdG9tIEdVSSByZW5kZXJpbmcgKyBzaW5nbGUtZmlsZSBidW5kbGluZy4nXG4gICAgICAgIDogJ1x1NzUyOCBHbyBcdTRFQ0VcdTk2RjZcdTVCOUVcdTczQjBcdTc2ODQgSmF2YVNjcmlwdCBcdThGRDBcdTg4NENcdTY1RjZcdUZGMUFcdTVCOENcdTY1NzRcdTdGMTZcdThCRDFcdTdCQTFcdTdFQkYgKyBcdTgxRUFcdTc4MTQgR1VJIFx1NkUzMlx1NjdEM1x1NUM0MiArIFx1NTM1NVx1NjU4N1x1NEVGNlx1NjI1M1x1NTMwNVx1MzAwMicpXG4gICAgcGFnZURhdGEuZnJvbnRtYXR0ZXIuaGVhZCA/Pz0gW11cbiAgICBjb25zdCBoID0gcGFnZURhdGEuZnJvbnRtYXR0ZXIuaGVhZCBhcyBhbnlbXVxuICAgIGgucHVzaChcbiAgICAgIFsnbGluaycsIHsgcmVsOiAnY2Fub25pY2FsJywgaHJlZjogdXJsIH1dLFxuICAgICAgWydtZXRhJywgeyBwcm9wZXJ0eTogJ29nOnRpdGxlJywgY29udGVudDogdGl0bGUgfV0sXG4gICAgICBbJ21ldGEnLCB7IHByb3BlcnR5OiAnb2c6ZGVzY3JpcHRpb24nLCBjb250ZW50OiBkZXNjIH1dLFxuICAgICAgWydtZXRhJywgeyBwcm9wZXJ0eTogJ29nOnVybCcsIGNvbnRlbnQ6IHVybCB9XSxcbiAgICAgIFsnbWV0YScsIHsgcHJvcGVydHk6ICdvZzp0eXBlJywgY29udGVudDogJ3dlYnNpdGUnIH1dLFxuICAgICAgWydtZXRhJywgeyBwcm9wZXJ0eTogJ29nOmltYWdlJywgY29udGVudDogT1JJR0lOICsgJ29nLWltYWdlLnBuZycgfV0sXG4gICAgICBbJ21ldGEnLCB7IHByb3BlcnR5OiAnb2c6aW1hZ2U6d2lkdGgnLCBjb250ZW50OiAnMTIwMCcgfV0sXG4gICAgICBbJ21ldGEnLCB7IHByb3BlcnR5OiAnb2c6aW1hZ2U6aGVpZ2h0JywgY29udGVudDogJzYzMCcgfV0sXG4gICAgICBbJ21ldGEnLCB7IHByb3BlcnR5OiAnb2c6bG9jYWxlJywgY29udGVudDogaXNFbiA/ICdlbl9VUycgOiAnemhfQ04nIH1dLFxuICAgICAgWydtZXRhJywgeyBuYW1lOiAndHdpdHRlcjp0aXRsZScsIGNvbnRlbnQ6IHRpdGxlIH1dLFxuICAgICAgWydtZXRhJywgeyBuYW1lOiAndHdpdHRlcjpkZXNjcmlwdGlvbicsIGNvbnRlbnQ6IGRlc2MgfV0sXG4gICAgICBbJ21ldGEnLCB7IG5hbWU6ICd0d2l0dGVyOmltYWdlJywgY29udGVudDogT1JJR0lOICsgJ29nLWltYWdlLnBuZycgfV0sXG4gICAgKVxuICAgIC8vIEpTT04tTEQgXHU1M0VBXHU2Q0U4XHU1MTY1XHU0RTJEXHU2NTg3XHU5OTk2XHU5ODc1XHVGRjA4XHU4MkYxXHU2NTg3XHU5OTk2XHU5ODc1XHU0RTBEXHU2Q0U4XHU1MTY1XHVGRjBDXHU5MDdGXHU1MTREXHU4QkVEXHU0RTQ5XHU0RTBFXHU4QkVEXHU4QTAwXHU0RTBEXHU1MzM5XHU5MTREXHVGRjA5XG4gICAgaWYgKHJlbCA9PT0gJ2luZGV4Lm1kJykge1xuICAgICAgaC5wdXNoKFxuICAgICAgICBbJ3NjcmlwdCcsIHsgdHlwZTogJ2FwcGxpY2F0aW9uL2xkK2pzb24nIH0sIEpTT04uc3RyaW5naWZ5KGpzb25MZEFwcCldLFxuICAgICAgICBbJ3NjcmlwdCcsIHsgdHlwZTogJ2FwcGxpY2F0aW9uL2xkK2pzb24nIH0sIEpTT04uc3RyaW5naWZ5KGpzb25MZFNpdGUpXSxcbiAgICAgIClcbiAgICB9XG4gICAgaWYgKHJlbCA9PT0gJ2d1aWRlL2ZhcS5tZCcpIHtcbiAgICAgIGgucHVzaChbJ3NjcmlwdCcsIHsgdHlwZTogJ2FwcGxpY2F0aW9uL2xkK2pzb24nIH0sIEpTT04uc3RyaW5naWZ5KGpzb25MZEZhcSldKVxuICAgIH1cbiAgfSxcbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW9SLFNBQVMsb0JBQW9CO0FBRWpULElBQU0sT0FBTztBQUNiLElBQU0sT0FBTztBQUNiLElBQU0sU0FBUyxPQUFPO0FBQ3RCLElBQU0sT0FBTztBQUNiLElBQU0sWUFBWTtBQUdsQixJQUFNLFlBQVk7QUFBQSxFQUNoQixZQUFZO0FBQUEsRUFDWixTQUFTO0FBQUEsRUFDVCxNQUFNO0FBQUEsRUFDTixlQUFlO0FBQUEsRUFDZixxQkFBcUI7QUFBQSxFQUNyQixpQkFBaUI7QUFBQSxFQUNqQixhQUNFO0FBQUEsRUFDRixLQUFLO0FBQUEsRUFDTCxpQkFBaUI7QUFBQSxFQUNqQixTQUFTO0FBQUEsRUFDVCxRQUFRLEVBQUUsU0FBUyxVQUFVLE1BQU0sWUFBWSxLQUFLLEtBQUs7QUFBQSxFQUN6RCxnQkFBZ0I7QUFBQSxFQUNoQixxQkFBcUIsQ0FBQyxNQUFNLFlBQVk7QUFBQSxFQUN4QyxRQUFRLEVBQUUsU0FBUyxTQUFTLE9BQU8sS0FBSyxlQUFlLE1BQU07QUFDL0Q7QUFDQSxJQUFNLGFBQWE7QUFBQSxFQUNqQixZQUFZO0FBQUEsRUFDWixTQUFTO0FBQUEsRUFDVCxNQUFNO0FBQUEsRUFDTixlQUFlO0FBQUEsRUFDZixLQUFLO0FBQUEsRUFDTCxZQUFZO0FBQUEsRUFDWixhQUFhO0FBQ2Y7QUFFQSxJQUFNLFlBQVk7QUFBQSxFQUNoQixZQUFZO0FBQUEsRUFDWixTQUFTO0FBQUEsRUFDVCxZQUFZO0FBQUEsSUFDVjtBQUFBLE1BQ0UsU0FBUztBQUFBLE1BQ1QsTUFBTTtBQUFBLE1BQ04sZ0JBQWdCO0FBQUEsUUFDZCxTQUFTO0FBQUEsUUFDVCxNQUFNO0FBQUEsTUFDUjtBQUFBLElB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
