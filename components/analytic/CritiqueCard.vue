<script setup lang="ts">
defineProps<{
    title: string,
    content: string,
    tags: string[]
}>()
</script>

<template>
<div class="card-wrapper pad">
    <h2>{{ title }}</h2>
    <span class="content">{{ `${content.slice(0, 60)}...` }}</span>
    <span class="tag">#{{ tags.join(", ") }}</span>
    <div class="detail pad">
        <el-icon size="1.5rem" class="icon"><el-icon-right></el-icon-right></el-icon>
    </div>
</div>
</template>

<style scoped>
.tag {
    color: var(--el-text-color-secondary)
}

.icon {
    color: var(--el-color-white)
}

.pad {
    --padding-size: 20px;
}

.card-wrapper {
    height: 180px;
    width: 300px;
    display: flex;
    flex-direction: column;
    background: var(--dashboard-background-color);
    padding: var(--padding-size);
    border-radius: var(--el-border-radius-round);
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
}

h2 {
    margin: 8px 0 13px 0;
}

.content {
    height: 100px;
}

.detail {
    display: flex;
    background: var(--el-color-primary);
    height: 40px;
    width: 40px;
    position: absolute;
    bottom: 0;
    right: 0;
    border-radius: var(--el-border-radius-round) 0 0 0;
    justify-content: center;
    align-items: center;
}
</style>