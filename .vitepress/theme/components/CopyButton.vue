<script setup lang="ts">
// 一键复制按钮：用于首页安装命令等片段。
// 用法：<CopyButton text="npm i -g @goxjs/goxjs" />
import { ref, computed } from 'vue'
import { useData } from 'vitepress'

const props = defineProps<{ text: string; label?: string }>()

const { lang } = useData()
const isEn = computed(() => lang.value.startsWith('en'))

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

const label = computed(() => {
  if (copied.value) return isEn.value ? 'Copied ✓' : '已复制 ✓'
  return props.label ?? (isEn.value ? 'Copy' : '复制')
})

async function copy() {
  try {
    await navigator.clipboard.writeText(props.text)
  } catch {
    // 剪贴板 API 不可用时降级：选中文本让用户手动 Ctrl+C
    const ta = document.createElement('textarea')
    ta.value = props.text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  copied.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (copied.value = false), 1600)
}
</script>

<template>
  <button type="button" class="copy-btn" :class="{ copied }" @click="copy">{{ label }}</button>
</template>
