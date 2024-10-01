<script setup lang="ts">
const menu = [
    {
        display: "Smart fix selected",
        event: "fix-selected"
    },
    {
        display: "Fix matching",
        event: "fix-matching"
    },
    {
        display: "Ignore All",
        event: "ignore-all"
    },
    {
        display: "Paste",
        event: "paste"
    }
]
</script>

<template>
<div class="menu-wrapper">
    <div class="menu-item"
         v-for="item in menu"
         @click="() => $emit(item.event)"
         :key="item.event">{{ item.display }}</div>
</div>
</template>

<style scoped>
.menu-wrapper {
    width: 200px;
    max-height: 300px;
    overflow-y: auto;
    overflow-x: hidden;
    border-radius: var(--el-border-radius-base);
    border: var(--el-border);
    display: flex;
    flex-direction: column;
    background: var(--el-color-white);
    box-shadow: var(--el-border-color) 2px 2px 4px;
}

.menu-item:not(:last-child) {
    border-bottom: var(--el-border);
}

.menu-item {
    width: 100%;
    height: 35px;
    color: var(--el-text-color);
    align-items: center;
    display: flex;
    padding: 0 15px;
    font-size: 0.875rem;
    cursor: pointer;
}

.menu-item:hover {
    background: var(--editor-selection-color);
    color: var(--el-color-primary);
}
</style>