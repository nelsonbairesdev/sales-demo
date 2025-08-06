<template>
  <div class="bubble-chart-container">
    <svg ref="svgRef" class="bubble-chart-svg" :width="svgWidth" :height="svgHeight"></svg>

    <!-- Modal -->
    <div v-if="modal.show" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ modal.title }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="modal-description">{{ modal.description }}</div>
          <div class="modal-priority">
            <span class="priority-label">Priority:</span>
            <span class="priority-value">{{ modal.priority }}%</span>
          </div>
          <div class="modal-controls">
            <button class="modal-control-btn decrease" @click="decreaseBubbleSize" title="Decrease priority">
              -
            </button>
            <button class="modal-control-btn increase" @click="increaseBubbleSize" title="Increase priority">
              +
            </button>
          </div>
          <div class="modal-actions">
            <!--
            <button class="modal-action-btn primary" @click="navigateToDetail">
              View Details
            </button>
            -->
            <button class="modal-action-btn secondary" @click="closeModal">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import * as d3 from 'd3'
import { problemDataSets } from '../../../data/problemDataSets'
import slidesDeckStore from '../../../slidesDeckStore'

const svgRef = ref(null)

const svgWidth = 800
const svgHeight = 600
const margin = { top: 60, right: 60, bottom: 60, left: 60 }
const chartWidth = svgWidth - margin.left - margin.right
const chartHeight = svgHeight - margin.top - margin.bottom

let svg, g

const modal = reactive({
  show: false,
  title: '',
  description: '',
  priority: 0,
  bubbleId: null,
  bubbleData: null
})

const closeModal = () => {
  modal.show = false
  modal.title = ''
  modal.description = ''
  modal.priority = 0
  modal.bubbleId = null
  modal.bubbleData = null
}

const openModal = (bubble) => {
  modal.show = true
  modal.title = bubble.label
  modal.description = bubble.description
  modal.priority = slidesDeckStore.getSizeMap().find(s => s.id === bubble.id)?.size || 50
  modal.bubbleId = bubble.id
  modal.bubbleData = bubble
}

const increaseBubbleSize = () => {
  if (modal.bubbleId) {
    slidesDeckStore.increaseBubbleSize(modal.bubbleId)
    modal.priority = slidesDeckStore.getSizeMap().find(s => s.id === modal.bubbleId)?.size || 50
    updateBubbleVisualization()
  }
}

const decreaseBubbleSize = () => {
  if (modal.bubbleId) {
    slidesDeckStore.decreaseBubbleSize(modal.bubbleId)
    modal.priority = slidesDeckStore.getSizeMap().find(s => s.id === modal.bubbleId)?.size || 50
    updateBubbleVisualization()
  }
}

const navigateToDetail = () => {
  if (modal.bubbleData) {
    window.location.href = modal.bubbleData.detailPage
  }
}

const initializeChart = () => {
  svg = d3.select(svgRef.value)
  svg.selectAll("*").remove()

  g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)

  // Draw quadrant backgrounds
  const quadrants = [
    { class: 'efficiency-quantitative', x: 0, y: 0, width: chartWidth / 2, height: chartHeight / 2 },
    { class: 'growth-quantitative', x: chartWidth / 2, y: 0, width: chartWidth / 2, height: chartHeight / 2 },
    { class: 'efficiency-qualitative', x: 0, y: chartHeight / 2, width: chartWidth / 2, height: chartHeight / 2 },
    { class: 'growth-qualitative', x: chartWidth / 2, y: chartHeight / 2, width: chartWidth / 2, height: chartHeight / 2 }
  ]

  g.selectAll('.quadrant-bg')
    .data(quadrants)
    .enter()
    .append('rect')
    .attr('class', d => `quadrant-bg ${d.class}`)
    .attr('x', d => d.x)
    .attr('y', d => d.y)
    .attr('width', d => d.width)
    .attr('height', d => d.height)

  // Draw axes
  g.append('line')
    .attr('x1', chartWidth / 2)
    .attr('y1', 0)
    .attr('x2', chartWidth / 2)
    .attr('y2', chartHeight)
    .attr('stroke', '#6b7280')
    .attr('stroke-width', 2)

  g.append('line')
    .attr('x1', 0)
    .attr('y1', chartHeight / 2)
    .attr('x2', chartWidth)
    .attr('y2', chartHeight / 2)
    .attr('stroke', '#6b7280')
    .attr('stroke-width', 2)

  // Add axis labels
  g.append('text')
    .attr('class', 'axis-label')
    .attr('x', chartWidth / 4)
    .attr('y', -10)
    .attr('text-anchor', 'middle')
    .text('Cut Hard Costs')

  g.append('text')
    .attr('class', 'axis-label')
    .attr('x', chartWidth * 3 / 4)
    .attr('y', -10)
    .attr('text-anchor', 'middle')
    .text('Recover Actual Revenue')

  g.append('text')
    .attr('class', 'axis-label')
    .attr('x', -10)
    .attr('y', chartHeight / 4)
    .attr('text-anchor', 'middle')
    .attr('transform', `rotate(-90, -10, ${chartHeight / 4})`)
    .text('Quantitative')

  g.append('text')
    .attr('class', 'axis-label')
    .attr('x', -10)
    .attr('y', chartHeight * 3 / 4)
    .attr('text-anchor', 'middle')
    .attr('transform', `rotate(-90, -10, ${chartHeight * 3 / 4})`)
    .text('Qualitative')

  // Add corner labels
  g.append('text')
    .attr('class', 'quadrant-label')
    .attr('x', chartWidth / 4)
    .attr('y', 25)
    .text('Efficiency + Quantitative')

  g.append('text')
    .attr('class', 'quadrant-label')
    .attr('x', chartWidth * 3 / 4)
    .attr('y', 25)
    .text('Growth + Quantitative')

  g.append('text')
    .attr('class', 'quadrant-label')
    .attr('x', chartWidth / 4)
    .attr('y', chartHeight - 10)
    .text('Efficiency + Qualitative')

  g.append('text')
    .attr('class', 'quadrant-label')
    .attr('x', chartWidth * 3 / 4)
    .attr('y', chartHeight - 10)
    .text('Growth + Qualitative')

  drawBubbles()
}

const drawBubbles = () => {
  const radiusScale = d3.scaleLinear()
    .domain([10, 100])
    .range([15, 60])

  const bubbleGroups = g.selectAll('.bubble-group')
    .data(problemDataSets)
    .enter()
    .append('g')
    .attr('class', 'bubble-group')

  // Add bubbles
  bubbleGroups.append('circle')
    .attr('class', 'bubble')
    .attr('cx', d => d.x * chartWidth)
    .attr('cy', d => (1 - d.y) * chartHeight)
    .attr('r', d => radiusScale(slidesDeckStore.getSizeMap().find(s => s.id === d.id)?.size || 50))
    .attr('fill', d => d.color)
    .attr('opacity', 0.7)
    .on('click', (event, d) => {
      event.preventDefault()
      openModal(d)
    })
    .on('dblclick', (event, d) => {
      event.preventDefault()
      navigateToDetail(d)
    })

  // Add labels
  bubbleGroups.append('text')
    .attr('x', d => d.x * chartWidth)
    .attr('y', d => (1 - d.y) * chartHeight)
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .attr('fill', 'white')
    .attr('font-size', '12px')
    .attr('font-weight', 'bold')
    .attr('pointer-events', 'none')
    .text(d => d.shortLabel)
}

const updateBubbleVisualization = () => {
  const radiusScale = d3.scaleLinear()
    .domain([10, 100])
    .range([15, 60])

  g.selectAll('.bubble')
    .transition()
    .duration(300)
    .attr('r', d => radiusScale(slidesDeckStore.getSizeMap().find(s => s.id === d.id)?.size || 50))
}

onMounted(() => {
  initializeChart()
})
</script>

<style scoped>
/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.modal-close:hover {
  background-color: #f3f4f6;
}

.modal-body {
  padding: 20px;
}

.modal-description {
  margin-bottom: 20px;
  color: #374151;
  line-height: 1.6;
}

.modal-priority {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 6px;
}

.priority-label {
  font-weight: 500;
  color: #374151;
  margin-right: 8px;
}

.priority-value {
  font-weight: 600;
  color: #059669;
  font-size: 1.1rem;
}

.modal-controls {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.modal-control-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #d1d5db;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-control-btn:hover {
  border-color: #059669;
  color: #059669;
}

.modal-control-btn.decrease {
  color: #dc2626;
}

.modal-control-btn.increase {
  color: #059669;
}

.modal-control-btn.decrease:hover {
  border-color: #dc2626;
  background-color: #fef2f2;
}

.modal-control-btn.increase:hover {
  border-color: #059669;
  background-color: #f0fdf4;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modal-action-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.modal-action-btn.primary {
  background-color: #059669;
  color: white;
}

.modal-action-btn.primary:hover {
  background-color: #047857;
}

.modal-action-btn.secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.modal-action-btn.secondary:hover {
  background-color: #e5e7eb;
}
</style>
