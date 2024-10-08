<script setup lang="ts">
defineProps<{
    display: string,
    index: number,
    focused: boolean
}>()
</script>

<template>
<div :class="{ focused }" class="wrapper" @click="$emit('focus', index)">
    <span :title="display">{{ display }}</span>
    <el-icon class="icon" @click.stop="$emit('close')">
        <el-icon-close-bold/>
    </el-icon>
</div>
</template>

<style scoped>
.focused {
    background: var(--el-color-danger);
    color: var(--el-color-white);
}

.focused .icon {
    color: var(--el-color-white);
}

.focused .icon:hover {
    color: var(--el-color-white);
    transform: rotate(90deg);
}

.wrapper {
    display: flex;
    gap: 10px;
    width: 150px;
    border-right: var(--el-border);
    height: 100%;
    justify-content: space-between;
    padding: 0 10px;
    align-items: center;
    box-sizing: border-box;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}

span {
    width: 120px;
    text-overflow: ellipsis;
    overflow: hidden;
    text-wrap: nowrap;
}

.icon {
    color: var(--el-text-color-secondary);
    transition: 0.2s ease-in all;
}

.icon:hover {
    color: var(--el-color-primary);
}
</style>