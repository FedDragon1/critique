<script setup lang="ts">
import NoContent from "~/components/analytic/NoContent.vue";
import CritiqueCard from "~/components/analytic/CritiqueCard.vue";
import {computedAsync} from "@vueuse/core";

const props = defineProps<{
    tab: Tab
}>();

const client = useSupabaseClient()
const tagTab = computed(() => props.tab as TagTab)
const cards = computed(() => Object.values(tagTab.value.content())
    .filter(card => !!card.tags[tagTab.value.uuid]))
const cardContents = computedAsync(
    async () => {
        const contentPromises = cards.value
            .map(card => new Promise<{ uuid: string, content: string}>((resolve, reject) => {
                client.storage.from("card").download(card.contentLink)
                    .then((data) => data.data?.text())
                    .then((text) => resolve({ uuid: card.uuid, content: JSON.parse(text ?? '{}').critique }))
                    .catch(e => {
                        ElMessage.error((e as unknown as Error).message)
                        reject(e)
                    })
            }))
        const content = await Promise.all(contentPromises)
        const ret: { [key: string]: string } = {}
        content.forEach(({ uuid, content }) => ret[uuid] = content)
        return ret
    },
    undefined
)
</script>

<template>
<div class="wrapper">
    <header>
        <h1>Critiques containing #{{ tagTab.display }}</h1>
    </header>
    <div class="tags">
        <NoContent style="height: 300px; width: 100%;" v-if="!cards.length"></NoContent>
        <template v-else-if="cardContents">
            <CritiqueCard v-for="card in cards"
                          @click="() => $emit('view-card', card)"
                          :key="card.uuid"
                          :title="card.title"
                          :content="cardContents[card.uuid]"
                          :tags="Object.values(card.tags).map(t => t.name)"></CritiqueCard>
        </template>
        <EditorUnavailable v-else></EditorUnavailable>
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