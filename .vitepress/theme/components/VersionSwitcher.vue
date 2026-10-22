<script setup lang="ts">
// 导航栏版本切换器：显示本站文档版本，下拉可跳到最新 Release 或历史版本对应 tag。
// 数据源见 .vitepress/versions.ts。
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useData, withBase } from 'vitepress'
import { VERSIONS, CURRENT_VERSION, ALL_RELEASES } from '../../versions'

const { lang } = useData()
const isEn = computed(() => lang.value.startsWith('en'))

const open = ref(false)
const root = ref<HTMLElement | null>(null)

const t = computed(() =>
  isEn.value
    ? {
        current: 'current docs',
        latest: 'latest',
        all: 'All releases & changelog',
        ariaLabel: 'Switch documentation version',
      }
    : {
        current: '当前文档',
        latest: '最新版',
        all: '全部版本与更新日志',
        ariaLabel: '切换文档版本',
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
  <div ref="root" class="version-switcher">
    <button
      type="button"
      class="vs-button"
      :aria-label="t.ariaLabel"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      <span class="vs-tag">v{{ CURRENT_VERSION }}</span>
      <svg class="vs-caret" :class="{ open }" width="12" height="12" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <Transition name="vs-flyout">
      <div v-if="open" class="vs-menu" role="menu">
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
          <span v-if="v.current" class="vs-badge current">{{ t.current }}</span>
          <span v-else-if="v.latest" class="vs-badge latest">{{ t.latest }}</span>
        </a>
        <div class="vs-divider" />
        <a :href="ALL_RELEASES" target="_blank" rel="noopener" class="vs-item vs-all" @click="open = false">
          {{ t.all }} ↗
        </a>
      </div>
    </Transition>
  </div>
</template>
