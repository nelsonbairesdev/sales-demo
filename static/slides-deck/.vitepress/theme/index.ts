import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import BubbleChart from './components/BubbleChart.vue'
import './custom.css'

export default {
  ...DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('BubbleChart', BubbleChart)
  }
}