import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import VersionSwitcher from './components/VersionSwitcher.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    // 版本切换器注入导航栏右侧（官方 nav-bar-content-after 槽位，
    // 位于搜索框之后、语言切换器之前）
    return h(DefaultTheme.Layout, null, {
      'nav-bar-content-after': () => h(VersionSwitcher),
    })
  },
}
