// 官网版本清单 —— 版本切换器（VersionSwitcher）的唯一数据源。
//
// 规则：
// - current：本站文档当前对应的 Gox 版本，切到它时留在本站（link 为站内路径）。
// - 其余历史版本：官网只部署最新一份文档，旧版本跳到 GitHub 对应 tag 的
//   代码树（README 即该版本文档），保证链接永远有效。
// - latest：npm / Releases 上的最新发布版。当 latest !== current 时单列一项，
//   提示"本站文档滞后于最新发布"。
//
// 发版流程：发布新文档时把 current 改为新版本，并把旧 current 挪进 archived
// （同时更新 config.mts 的 softwareVersion 与首页版本历史表，CI 有一致性检查）。

const REPO = 'https://github.com/14752222/Gox'

export interface VersionEntry {
  /** 版本号，如 '0.14.1'（不带 v 前缀） */
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
export const CURRENT_VERSION = '0.14.1'

const tag = (v: string) => `${REPO}/tree/v${v}`

/** 历史版本（倒序），跳到对应 tag */
const ARCHIVED = [
  '0.14.0', '0.13.0', '0.12.0', '0.11.0', '0.10.0',
  '0.9.0', '0.8.0', '0.7.0', '0.6.0', '0.5.0',
  '0.4.3', '0.4.2', '0.4.1', '0.4.0', '0.3.0', '0.2.0', '0.1.1', '0.1.0',
]

export const VERSIONS: VersionEntry[] = [
  // 最新版领先于本站文档时单列；一致时由 current 项兼标 latest
  ...(LATEST_VERSION !== CURRENT_VERSION
    ? [{ version: LATEST_VERSION, link: `${REPO}/releases/latest`, latest: true }]
    : []),
  {
    version: CURRENT_VERSION,
    link: '/',
    current: true,
    latest: LATEST_VERSION === CURRENT_VERSION || undefined,
  },
  ...ARCHIVED.map((v) => ({ version: v, link: tag(v) })),
]

export const ALL_RELEASES = `${REPO}/releases`
