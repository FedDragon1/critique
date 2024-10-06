<script setup lang="ts">
import {useFile} from '~/composibles/useFile'

const props = defineProps<{
    title: string,
    content: string | undefined,
    tags: string[]
}>()

const { ellipses } = useFile()

const tagsJoined = computed(() => props.tags.map(tag => `#${tag}`).join(" ") || 'Uncategorized')
const contentStripped = computed(() => ellipses(props.content, 60))
const tagsStripped = computed(() => ellipses(tagsJoined.value, 20))
</script>

<template>
<div class="card-wrapper pad">
    <h2>{{ title }}</h2>
    <span class="content" :title="content">{{ contentStripped }}</span>
    <span class="tag" :title="tagsJoined">{{ tagsStripped }}</span>
    <div class="detail pad">
        <el-icon size="1.5rem" class="icon"><el-icon-right></el-icon-right></el-icon>
    </div>
</div>
</template>

<style scoped>
.card-wrapper:hover {
    box-shadow: var(--el-box-shadow);
}

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
    transition: all 0.2s ease-in-out;
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
    flex-shrink: 0;
    margin-bottom: 5px;
}

h2 {
    margin: 8px 0 13px 0;
    text-wrap: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    padding-bottom: 10px;
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