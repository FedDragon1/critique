<script setup lang="ts">
let attrs = useAttrs();
</script>

<template>
<nav v-bind="attrs">
  <NuxtLink to="/">
    <el-icon size="1.5rem" class="hover-color"><el-icon-back></el-icon-back></el-icon>
  </NuxtLink>
</nav>
</template>

<style scoped>
nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  border-bottom: 1px solid var(--el-border-color);
  padding: 20px 20px 10px;
    height: var(--nav-height);
    box-sizing: border-box;
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