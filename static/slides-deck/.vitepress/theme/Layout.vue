<template>
  <div class="layout">
    <!-- Header -->
    <header class="header">
      <div class="logo">
        <img src="/img/logo-white.webp" alt="Modo Payments">
      </div>
      
      <!-- Sidebar Toggle Button -->
      <button class="sidebar-toggle" @click="toggleSidebar">
        ☰
      </button>
    </header>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ active: sidebarActive }">
      <div class="sidebar-header">
        <div class="logo">
          <img src="/img/logo-white.webp" alt="Modo Payments">
        </div>
        <button class="sidebar-close" @click="toggleSidebar">×</button>
      </div>
      
      <nav class="sidebar-nav">
        <ul>
          <li class="nav-section">
            <a href="/platform/" class="nav-section-title">Slides Deck</a>
            <ul class="nav-submenu">
            </ul>
            <ul class="nav-submenu">
              <li v-for="(slide, index) in slideSequence" :key="index">
                <a 
                  :href="`/sales-demo/slides-deck/problems/problem-${slide.id}`" 
                  @click.prevent="loadSlideContent(slide)"
                >
                  {{ slide.title }}
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Sidebar Overlay -->
    <div class="sidebar-overlay" :class="{ active: sidebarActive }" @click="toggleSidebar"></div>

    <!-- Main content area -->
    <main class="main-content">
      <!-- Content area -->
      <div class="content-wrapper">
        <div class="content">
          <!-- Show current slide content -->
          <div v-if="currentSlideContent" class="slide-content">
            <div v-html="currentSlideContent"></div>
          </div>
          <!-- Fallback to default content -->
          <div v-else>
            <Content />
          </div>
          <BubbleChart v-if="showBubbleChart" />
        </div>
      </div>
    </main>

    <!-- Navigation Buttons -->
    <div class="slide-navigation">
      <button 
        class="nav-button prev-button" 
        @click="goToPreviousSlide"
        @keydown.enter="goToPreviousSlide"
        @keydown.space="goToPreviousSlide"
        :disabled="!canGoPrevious"
        :aria-label="canGoPrevious ? 'Go to previous slide' : 'No previous slide available'"
        tabindex="0"
      >
        <span class="nav-button-icon">←</span>
        <span class="nav-button-text">Previous</span>
      </button>
      
      <button 
        class="nav-button next-button" 
        @click="goToNextSlide"
        @keydown.enter="goToNextSlide"
        @keydown.space="goToNextSlide"
        :disabled="!canGoNext"
        :aria-label="canGoNext ? 'Go to next slide' : 'No next slide available'"
        tabindex="0"
      >
        <span class="nav-button-text">Next</span>
        <span class="nav-button-icon">→</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import slidesDeckStore from '../../slidesDeckStore'
import BubbleChart from './components/BubbleChart.vue'
import { problemDataSets } from '../../data/problemDataSets'

const sidebarActive = ref(false)
const showBubbleChart = ref(false)

// Navigation state
const currentSlideIndex = ref(0)
const totalSlides = ref(0)
const currentSlideContent = ref('')

const slidesByPriority = computed(() => {
  return slidesDeckStore.getProblemsSortedByPriority().map(problemObj => {
    return problemDataSets.find(problem => problem.id === problemObj.id)
  }).filter(problem => problem !== undefined)
})

// Define the slide sequence as a computed property to make it reactive
const slideSequence = computed(() => [
  { type: 'intro', title: 'Intro' },
  { type: 'bubble-chart', id: 0, title: 'Bubble Chart' },
  ...slidesByPriority.value.map((problem, index) => ({
    type: 'problem',
    id: problem.id,
    title: `Problem ${index + 1}: ${problem.name}`,
    description: problem.description
  }))
]);

const canGoPrevious = computed(() => currentSlideIndex.value > 0)
const canGoNext = computed(() => currentSlideIndex.value < totalSlides.value - 1)

const toggleSidebar = () => {
  sidebarActive.value = !sidebarActive.value
  if (sidebarActive.value) {
    document.body.classList.add('sidebar-open')
  } else {
    document.body.classList.remove('sidebar-open')
  }
}

const loadSlideContent = async (slide: any) => {
  showBubbleChart.value = false;
  // Load problem slides
  if (slide.type === 'problem') {
    try {
      const response = await fetch(`/sales-demo/slides-deck/problems/problem-${slide.id}.md`)
      if (response.ok) {
        const content = await response.text()
        // Convert markdown to HTML (basic conversion)
        currentSlideContent.value = convertMarkdownToHtml(content)
      } else {
        currentSlideContent.value = `<h1>${slide.title}</h1><p>Content not available</p>`
      }
    } catch (error) {
      console.error('Error loading slide content:', error)
      currentSlideContent.value = `<h1>${slide.title}</h1><p>Error loading content</p>`
    }
  } 
  // Load intro slide
  if (slide.type === 'intro') {
    try {
      const response = await fetch(`/sales-demo/slides-deck/index.md`)
      if (response.ok) {
        const content = await response.text()
        // Convert markdown to HTML (basic conversion)
        currentSlideContent.value = convertMarkdownToHtml(content)
      }
    } catch (error) {
      console.error('Error loading intro content:', error)
      currentSlideContent.value = `<h1>${slide.title}</h1><p>Welcome to the Modo presentation</p>`
    }
  }
  // Load bubble chart slide
  if (slide.type === 'bubble-chart') {
    try {
      showBubbleChart.value = true
      const response = await fetch(`/sales-demo/slides-deck/bubble-chart.md`)
      if (response.ok) {
        const content = await response.text()
        // Convert markdown to HTML (basic conversion)
        currentSlideContent.value = convertMarkdownToHtml(content)
      }
    } catch (error) {
      console.error('Error loading bubble chart content:', error)
      currentSlideContent.value = `<h1>${slide.title}</h1><p>Error loading content</p>`
    }
  }
}

const convertMarkdownToHtml = (markdown: string) => {
  // Remove frontmatter
  let html = markdown.replace(/---[\s\S]*?---/, '')
  
  // Split into lines for processing
  const lines = html.split('\n')
  const processedLines: string[] = []
  let inCodeBlock = false
  let inList = false
  let listType = ''
  let listDepth = 0
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()
    
    // Handle code blocks
    if (trimmedLine.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true
        processedLines.push('<pre><code>')
      } else {
        inCodeBlock = false
        processedLines.push('</code></pre>')
      }
      continue
    }
    
    if (inCodeBlock) {
      processedLines.push(line)
      continue
    }
    
    // Handle headers
    if (trimmedLine.startsWith('### ')) {
      processedLines.push(`<h3>${processInlineElements(trimmedLine.substring(4))}</h3>`)
      continue
    }
    
    if (trimmedLine.startsWith('## ')) {
      processedLines.push(`<h2>${processInlineElements(trimmedLine.substring(3))}</h2>`)
      continue
    }
    
    if (trimmedLine.startsWith('# ')) {
      processedLines.push(`<h1>${processInlineElements(trimmedLine.substring(2))}</h1>`)
      continue
    }
    
    // Handle blockquotes
    if (trimmedLine.startsWith('> ')) {
      processedLines.push(`<blockquote>${processInlineElements(trimmedLine.substring(2))}</blockquote>`)
      continue
    }
    
    // Handle lists
    const listMatch = trimmedLine.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/)
    if (listMatch) {
      const [, indent, marker, content] = listMatch
      const depth = indent.length / 2
      const isOrdered = /^\d+\.$/.test(marker)
      const currentListType = isOrdered ? 'ol' : 'ul'
      
      // Close previous list if type changed or depth decreased
      if (inList && (listType !== currentListType || depth < listDepth)) {
        processedLines.push(`</${listType}>`)
        inList = false
      }
      
      // Open new list if not in list or type/depth changed
      if (!inList || listType !== currentListType || depth > listDepth) {
        processedLines.push(`<${currentListType}>`)
        inList = true
        listType = currentListType
        listDepth = depth
      }
      
      processedLines.push(`<li>${processInlineElements(content)}</li>`)
      continue
    }
    
    // Handle empty lines (close lists, add paragraph breaks)
    if (trimmedLine === '') {
      if (inList) {
        processedLines.push(`</${listType}>`)
        inList = false
      }
      processedLines.push('')
      continue
    }
    
    // Handle regular paragraphs
    if (trimmedLine !== '') {
      processedLines.push(`<p>${processInlineElements(trimmedLine)}</p>`)
    }
  }
  
  // Close any open list
  if (inList) {
    processedLines.push(`</${listType}>`)
  }
  
  return processedLines.join('\n')
}

const processInlineElements = (text: string): string => {
  // Handle inline code
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>')
  
  // Handle bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  
  // Handle italic
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>')
  
  // Handle links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  
  // Handle images
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
  
  // Handle line breaks
  text = text.replace(/\n/g, '<br>')
  
  return text
}

const goToPreviousSlide = () => {
  if (canGoPrevious.value) {
    currentSlideIndex.value--
    updateSlide()
  }
}

const goToNextSlide = () => {
  if (canGoNext.value) {
    currentSlideIndex.value++
    updateSlide()
  }
}

const updateSlide = () => {
  const currentSlide = slideSequence.value[currentSlideIndex.value]
  if (currentSlide) {
    slidesDeckStore.setCurrentSlide({
      id: currentSlideIndex.value,
      title: currentSlide.title
    })
    loadSlideContent(currentSlide)
  }
}

onMounted(() => {
  // Close sidebar when clicking on a link
  const sidebarLinks = document.querySelectorAll('.sidebar-nav a')
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      sidebarActive.value = false
      document.body.classList.remove('sidebar-open')
    })
  })

  // Close sidebar when pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebarActive.value) {
      toggleSidebar()
    }
  })

  // Keyboard navigation for slides
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      goToPreviousSlide()
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault()
      goToNextSlide()
    }
  })

  // Initialize slide count and load first slide
  totalSlides.value = slideSequence.value.length
  updateSlide()
});
</script>

<style>
/* Import the custom CSS styles */
@import './custom.css';

/* Layout specific styles */
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.content {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 2rem;
}

/* Ensure header stays on top */
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

/* Slide Navigation Buttons */
.slide-navigation {
  position: fixed;
  bottom: 2rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  z-index: 1000;
  pointer-events: none;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  pointer-events: auto;
  min-width: 140px;
  justify-content: center;
}

.nav-button:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
}

.nav-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

.nav-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
  box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
}

.nav-button:focus {
  outline: 3px solid rgba(0, 123, 255, 0.5);
  outline-offset: 2px;
}

.nav-button-icon {
  font-size: 1.25rem;
  font-weight: bold;
}

.nav-button-text {
  font-family: 'Titillium Web', sans-serif;
  letter-spacing: 0.5px;
}

/* Mobile menu styles */
.mobile-menu {
  position: fixed;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100vh;
  background: #ffffff;
  z-index: 2000;
  transition: left 0.3s ease;
  overflow-y: auto;
}

.mobile-menu.active {
  left: 0;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e5e5;
}

.mobile-menu-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
}

.mobile-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mobile-nav ul ul {
  padding-left: 1rem;
  background: #f8f9fa;
}

.mobile-nav li {
  border-bottom: 1px solid #e5e5e5;
}

.mobile-nav a {
  display: block;
  padding: 1rem;
  text-decoration: none;
  color: #14132A;
}

.mobile-nav ul ul a {
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
}

.mobile-nav a:hover {
  background: #f8f9fa;
}

/* Desktop navigation styles */
.nav {
  display: none;
}

@media (min-width: 768px) {
  .nav {
    display: block;
  }
  
  .mobile-menu-toggle {
    display: none;
  }
}



/* Slide Content Styles */
.slide-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 0;
}

.slide-content h1 {
  color: #14132A;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
}

.slide-content h2 {
  color: #14132A;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  margin-top: 2rem;
}

.slide-content h3 {
  color: #14132A;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  margin-top: 1.5rem;
}

.slide-content p {
  color: #4A5568;
  font-size: 1.125rem;
  line-height: 1.7;
  margin-bottom: 1rem;
}

.slide-content ul {
  margin: 1rem 0;
  padding-left: 2rem;
}

.slide-content li {
  color: #4A5568;
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.slide-content strong {
  color: #14132A;
  font-weight: 600;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .content {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem 0;
  }

  .slide-navigation {
    bottom: 1rem;
    padding: 0 1rem;
  }

  .nav-button {
    padding: 0.875rem 1.25rem;
    font-size: 1rem;
    min-width: 120px;
  }

  .nav-button-text {
    display: none;
  }

  .nav-button-icon {
    font-size: 1.5rem;
  }

  .slide-content h1 {
    font-size: 2rem;
  }

  .slide-content h2 {
    font-size: 1.75rem;
  }

  .slide-content h3 {
    font-size: 1.25rem;
  }

  .slide-content p,
  .slide-content li {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .slide-navigation {
    bottom: 0.75rem;
    padding: 0 0.75rem;
  }

  .nav-button {
    padding: 0.75rem 1rem;
    min-width: 60px;
    border-radius: 50%;
  }
}
</style>