import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import VersionSwitcher from './components/VersionSwitcher.vue'
import CopyButton from './components/CopyButton.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // 桌面端：版本切换器在导航栏右侧（搜索框之后、语言切换器之前）
      'nav-bar-content-after': () => h(VersionSwitcher, { variant: 'nav' }),
      // 移动端：导航栏空间不足，版本切换器放进汉堡菜单面板，全宽展示
      'nav-screen-content-after': () => h(VersionSwitcher, { variant: 'screen' }),
    })
  },
  enhanceApp({ app }) {
    // 全局注册，markdown 里直接 <CopyButton text="..." /> 使用（首页安装命令复制）
    app.component('CopyButton', CopyButton)
  },
}
