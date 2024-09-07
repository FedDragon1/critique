<script setup lang="ts">

import BrandIconLight from "~/components/svg/BrandIconLight.vue";

withDefaults(defineProps<{
  headerMaxHeight: number
}>(), {
  headerMaxHeight: 200
})
</script>

<template>
<div class="screen-wrapper">
  <div class="card">
    <div class="header" :style="{ maxHeight: `${headerMaxHeight}px` }">
      <BrandIconLight :width="200" />
    </div>
    <div class="title">
      <h1><slot name="title"/></h1>
    </div>
    <div class="content-wrapper">
      <slot />
    </div>
    <div class="footer">
      <slot name="footer">
        <el-text size="small">©2024 Critiques. All rights reserved.</el-text>
      </slot>
    </div>
  </div>
</div>
</template>

<style scoped>
.screen-wrapper {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card {
  margin-top: 100px;
  height: 80vh;
  width: 80vw;
  max-width: 550px;
  border-radius: var(--el-border-radius-base);
  padding: 50px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 1000px;
}

.header {
  height: 20%;
}
</style>