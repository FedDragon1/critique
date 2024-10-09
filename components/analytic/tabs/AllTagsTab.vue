<script setup lang="ts">
import CritiqueTag from "~/components/analytic/CritiqueTag.vue";
import NoContent from "~/components/analytic/NoContent.vue";

const props = defineProps<{
    tab: Tab
}>();

const genericTab = computed(() => props.tab as GenericTabs)
const tags = computed(() => Object.values(genericTab.value.content())
    .filter(t => t.type === genericTab.value.uuid))
</script>

<template>
<div class="wrapper">
    <header>
        <h1>Tags for {{ genericTab.display }}</h1>
    </header>
    <div class="tags">
        <CritiqueTag v-for="tag in tags"
                     @detail="() => $emit('view-tag', tag)"
                     :key="tag.uuid"
                     :name="tag.name"
                     :count="Object.keys(tag.cards).length"></CritiqueTag>
        <NoContent style="height: 300px; width: 100%;" v-if="!tags.length"></NoContent>
    </div>
</div>
</template>

<style scoped>
.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 40px;
}

.wrapper {
    padding: 0 40px;
    min-width: 650px;
    height: 100%;
    display: flex;
    position: relative;
    justify-content: center;
    flex-direction: column;
}

header {
    margin: 30px 0;
    width: 100%;
    display: flex;
    justify-content: center;
}
</style>