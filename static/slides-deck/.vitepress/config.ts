import { defineConfig } from 'vitepress'

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
  title: 'Modo Slides',
  description: 'Modo presentation slides',
  base: '/slides-deck/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Slides', link: '/slides' }
    ],
    sidebar: [
      {
        text: 'Presentations',
        items: [
          { text: 'Introduction', link: '/' },
          { text: 'Main Deck', link: '/slides' }
        ]
      }
    ]
  }
})
