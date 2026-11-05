<script setup lang="ts">
// 导航栏版本切换器：显示的是 **最新发布版**（= npm 上 `@goxjs/goxjs` 可安装的版本），
// 不是本站文档对应的版本 —— 两者经常不一致（发版当天代码已发、文档还没跟上），
// 用户点版本号是为了确认"我该 npm i 哪个版本"，所以徽标必须跟 npm 对齐；
// 本站文档对应的版本在展开菜单里单独列一项并标注「本站文档」。
// 桌面端注入 nav-bar-content-after，移动端注入 nav-screen-content-after（variant=screen）。
// 数据源见 .vitepress/versions.ts。
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useData, withBase } from 'vitepress'
import { VERSIONS, LATEST_VERSION, ALL_RELEASES } from '../../versions'

const props = defineProps<{ variant?: 'nav' | 'screen' }>()
const variant = props.variant ?? 'nav'

const { lang } = useData()
const isEn = computed(() => lang.value.startsWith('en'))

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const menuId = `vs-menu-${variant}`

const t = computed(() =>
  isEn.value
    ? {
        current: 'docs here',
        all: 'All releases & changelog',
        ariaLabel: 'Latest release version, switch documentation version',
      }
    : {
        current: '本站文档',
        all: '全部版本与更新日志',
        ariaLabel: '最新发布版号，可切换文档版本',
      },
)

function toggle() {
  open.value = !open.value
}

function onClickOutside(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="root" class="version-switcher" :class="`vs-${variant}`">
    <button
      type="button"
      class="vs-button"
      :aria-label="t.ariaLabel"
      :aria-expanded="open"
      aria-haspopup="menu"
      :aria-controls="menuId"
      @click.stop="toggle"
    >
      <span class="vs-tag">v{{ LATEST_VERSION }}</span>
      <span class="vs-tag-kind">npm</span>
      <svg class="vs-caret" :class="{ open }" width="12" height="12" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <Transition name="vs-flyout">
      <div v-if="open" :id="menuId" class="vs-menu" role="menu">
        <a
          v-for="v in VERSIONS"
          :key="v.version"
          :href="v.current ? withBase(isEn ? '/en/' : '/') : v.link"
          class="vs-item"
          :class="{ active: v.current }"
          :target="v.current ? undefined : '_blank'"
          rel="noopener"
          role="menuitem"
          @click="open = false"
        >
          <span class="vs-item-version">v{{ v.version }}</span>
          <span v-if="v.latest" class="vs-badge current">{{ isEn ? 'latest' : '最新发布' }}</span>
          <span v-else-if="v.current" class="vs-badge docs">{{ t.current }}</span>
        </a>
        <div class="vs-divider" />
        <a :href="ALL_RELEASES" target="_blank" rel="noopener" class="vs-item vs-all" @click="open = false">
          {{ t.all }} ↗
        </a>
      </div>
    </Transition>
  </div>
</template>
