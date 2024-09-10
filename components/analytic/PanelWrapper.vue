<script setup lang="ts">

import PanelNav from "~/components/analytic/PanelNav.vue";
import type {QuickActions} from "~/types/critique";

defineProps<{
  quickActions: QuickActions,
}>()

function dragPanel(e: MouseEvent) {
  if (!panel.value) {
    return;
  }
  if (dragStartX.value === -1) {
    dragStartX.value = e.x
    dragStartWidth.value = panel.value.clientWidth ?? -1
    return;
  }
  const newWidth = Math.min(Math.max(Math.round(dragStartWidth.value + dragStartX.value - e.x), 45), 1000)
  panel.value!.style.width = `${newWidth}px`
  dragEnd.value = (newWidth ?? 0) < 60
}

function togglePanel() {
  panel.value!.classList.add('ease-width')
  if (dragEnd.value) {
    panel.value!.style.width = '50%'
    dragEnd.value = false
  } else {
    panel.value!.style.width = '45px'
    dragEnd.value = true
  }
  setTimeout(() => panel.value!.classList.remove('ease-width'), 500)
}

function reset() {
  draggingPanel.value = false
}

const panel = ref<HTMLDivElement>();
const draggingPanel = ref(false);
const dragStartX = ref(-1);
const dragStartWidth = ref(-1);
const dragEnd = ref(false)

watchEffect(() => {
  if (draggingPanel.value) {
    document.addEventListener("mousemove", dragPanel)
  } else if (panel.value) {
    document.removeEventListener("mousemove", dragPanel)
    dragStartX.value = -1
    dragStartWidth.value = -1
  }
})

onMounted(() => {
  document.addEventListener("mouseup", reset)
})

onBeforeUnmount(() => {
  document.removeEventListener("mouseup", reset)
})
</script>

<template>
  <div class="panel-wrapper" ref="panel">
    <PanelNav :drag-end="dragEnd"
              :dragging-panel="draggingPanel"
              :toggle-panel="togglePanel"
              :quick-actions="quickActions"></PanelNav>
    <div class="panel">
      <div class="panel-resizer" @mousedown="draggingPanel = true">
        <el-icon class="panel-resizer-bar">
          <el-icon-minus></el-icon-minus>
        </el-icon>
      </div>
      <div class="panel-inner">
        <div class="panel-chat" :class="{ 'no-select': draggingPanel }">
          <slot/>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-resizer-bar {
  transform: rotate(90deg) scaleX(5) scaleY(3);
  color: var(--el-border-color-dark);
  transition: 0.2s ease-in-out color;
}

.panel-inner {
  overflow: auto;
}

.panel-chat {
  min-width: 600px;
}

.panel {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
}

.panel-wrapper {
  border-left: var(--el-border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 50%;
  flex-shrink: 0;
}

.panel-resizer {
  width: 45px;
  display: flex;
  align-items: center;
  cursor: ew-resize;
  flex-shrink: 0;
}

.panel-resizer:hover > .panel-resizer-bar {
  color: var(--el-text-color-secondary);
}
</style>