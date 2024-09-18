<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <nav>
    <div class="wrapper">
<!--      Match the icon height-->
      <div style="height: 1.8rem" @click="$emit('return')">
        <el-icon size="1.5rem" class="hover-color"><el-icon-back></el-icon-back></el-icon>
      </div>
      <div>
        <span>{{ title }}</span>
      </div>
      <el-button plain @click="$emit('continue')">Continue</el-button>
    </div>
  </nav>
</template>

<style scoped>
.wrapper {
  flex-grow: 9999;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--el-border-color);
  align-items: center;
  flex-shrink: 0;
  height: 100%;
}

nav {
  width: 100%;
  height: 60px;
  flex-shrink: 0;
  display: flex;
}

nav > div {
  display: flex;
  align-items: center;
  gap: 3px;
}

.hover-color {
  color: var(--el-text-color-secondary);
  transition: 0.2s ease-in-out all;
  border-radius: var(--el-border-radius-circle);
  padding: 2px;
}

.hover-color:hover {
  color: var(--el-color-danger);
  background-color: var(--el-border-color-lighter);
}
</style>