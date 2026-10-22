// 官网版本清单 —— 版本切换器（VersionSwitcher）的唯一数据源。
//
// 规则：
// - current：本站文档当前对应的 Gox 版本，切到它时留在本站（link 为站内路径）。
// - 其余历史版本：官网只部署最新一份文档，旧版本跳到 GitHub 对应 tag 的
//   代码树（README 即该版本文档），保证链接永远有效。
// - latest：npm / Releases 上的最新发布版，用于提示"本站文档可能滞后"。
//
// 发版流程：发布新文档时把 current 改为新版本，并把旧 current 挪进 archived。

const REPO = 'https://github.com/14752222/Gox'

export interface VersionEntry {
  /** 版本号，如 '0.9.0'（不带 v 前缀） */
  version: string
  /** 跳转地址：站内路径或完整 URL */
  link: string
  /** 是否本站当前文档版本 */
  current?: boolean
  /** 是否最新发布版（可能领先于本站文档） */
  latest?: boolean
}

/** 最新发布版（与 npm @goxjs/goxjs 对齐） */
export const LATEST_VERSION = '0.14.1'

/** 本站文档对应的版本 */
export const CURRENT_VERSION = '0.9.0'

const tag = (v: string) => `${REPO}/tree/v${v}`

export const VERSIONS: VersionEntry[] = [
  {
    version: LATEST_VERSION,
    link: `${REPO}/releases/latest`,
    latest: true,
  },
  { version: CURRENT_VERSION, link: '/', current: true },
  // 历史版本（倒序），跳到对应 tag
  ...['0.8.0', '0.7.0', '0.6.0', '0.5.0', '0.4.3', '0.4.2', '0.4.1', '0.4.0',
     '0.3.0', '0.2.0', '0.1.1', '0.1.0'].map((v) => ({ version: v, link: tag(v) })),
]

export const ALL_RELEASES = `${REPO}/releases`
