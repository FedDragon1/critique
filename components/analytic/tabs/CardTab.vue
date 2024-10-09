<script setup lang="ts">
import {useTime} from "~/composibles/useTime";
import ReturnButton from "~/components/analytic/tabs/ReturnButton.vue";

const props = defineProps<{
    tab: Tab
}>();

const client = useSupabaseClient()
const cardTab = computed(() => props.tab as CardTab)
const card = computed(() => cardTab.value.content())
const tags = computed(() => Object.values(card.value.tags).map(t => `#${t.name}`))
const critique = ref<CritiqueCardStorage>()
client.storage.from("card").download(card.value.contentLink)
    .then(r => r.data?.text())
    .then(t => critique.value = JSON.parse(t ?? '{}'))

const { formatDate } = useTime()

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1)
}
</script>

<template>
<div class="wrapper">
    <div class="content">
        <ReturnButton @close="$emit('close')"></ReturnButton>
        <header>
            <h1 class="title">{{ card.title }}</h1>
            <span class="secondary">Created on {{ formatDate(card.createdAt) }}</span>
            <div class="tags">
                <span class="secondary" v-for="tag in tags">{{ tag }}</span>
                <span class="secondary" v-if="!tags.length">No tags</span>
            </div>
        </header>
        <div class="card-info">
            <div class="info">
                <h1 class="section-title">{{ capitalize(card.type) }}</h1>
                <span class="secondary"
                      v-if="critique && !critique.critique.length">This note card is empty</span>
                <span class="critique-content" v-else-if="critique">{{ critique.critique }}</span>
                <EditorUnavailable v-else class="editor-unavailable"></EditorUnavailable>
            </div>
            <div class="info">
                <h1 class="section-title">Original Text <el-icon class="icon" size="1.0rem"><el-icon-zoom-in/></el-icon></h1>
                <span class="secondary"
                      v-if="critique && !critique.originalText.length">This note card has no reference</span>
                <span class="critique-content" v-else-if="critique">{{ critique.originalText }}</span>
                <EditorUnavailable v-else class="editor-unavailable"></EditorUnavailable>
            </div>
        </div>
    </div>
</div>
</template>

<style scoped>
.icon {
    color: var(--el-text-color-secondary);
    transition: 0.2s ease-in-out color;
}

.icon:hover {
    color: var(--el-color-primary)
}

.info {
    margin-bottom: 40px;
}

.editor-unavailable {
    height: 300px;
}

.section-title {
    border-bottom: var(--el-border);
    padding-bottom: 6px;
}

header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 80px;
}

.title {
    margin: 1rem 0;
}

.tags {
    display: flex;
    gap: 10px;
}

.secondary {
    color: var(--el-text-color-secondary)
}

.wrapper {
    padding: 0 40px;
    min-width: 800px;
    height: 100%;
    display: flex;
    position: relative;
}

.content {
    margin: 0 auto;
    width: 800px;
}
</style>