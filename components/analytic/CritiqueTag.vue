<script setup lang="ts">
import {useFile} from "~/composibles/useFile";

const props = defineProps<{
    name: string,
    count: number
}>()

const { ellipses } = useFile()

const display = computed(() => props.count < 1 ? "Critique" : "Critiques")
</script>

<template>
    <div class="tag-wrapper">
        <div class="content">
            <h3 :title="name">#{{ ellipses(name, 20) }}</h3>
            <span class="count">{{count}} {{ display }}</span>
            <el-button type="primary" title="see all" class="button" @click="$emit('detail')">
                <el-icon size="1rem"><el-icon-right></el-icon-right></el-icon>
                <span class="detail-text">See All</span>
            </el-button>
        </div>
    </div>
</template>

<style scoped>
.tag-wrapper {
    height: 300px;
    width: 300px;
    background: var(--tag-decoration-color);
    position: relative;
    border-radius: var(--el-border-radius-round);
    overflow: hidden;
    box-shadow: var(--tag-box-shadow);
    flex-shrink: 0;
}

h3 {
    margin-top: 20px;
    margin-bottom: 0;
}

.button {
    width: 200px;
    height: 50px;
    border-radius: var(--el-border-radius-round);
    justify-content: flex-start;
    margin-top: 20px;
}

.count {
    color: var(--el-text-color-secondary)
}

.detail-text {
    font-family: "poppins", sans-serif;
    padding-left: 10px;
}

.content {
    background: var(--el-color-white);
    height: 55%;
    width: 100%;
    position: absolute;
    bottom: 0;
    display: flex;
    flex-direction: column;
    padding: 0 20px;
}
</style>