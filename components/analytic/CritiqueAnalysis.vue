<script setup lang="ts">
import { computedAsync } from '@vueuse/core'
import CritiqueCard from "~/components/analytic/CritiqueCard.vue";
import CritiqueTag from "~/components/analytic/CritiqueTag.vue";

const props = defineProps<{
    file: CritiqueFull
}>();

const RECENT_LIMIT = 10
const TAG_LIMIT = 8

const emit = defineEmits([
    "all-analysis",
    "all-summary",
    "all-questions",
    "all-cards",
    "view-card",
    "view-tag"
])
const client = useSupabaseClient()
const showAnalysis = ref(true)
const showSummary = ref(true)
const showQuestions = ref(true)

const tags = computed(() => {
    const analysis: CritiqueTagFull[] = [],
        summary: CritiqueTagFull[] = [],
        question: CritiqueTagFull[] = []
    Object.values(props.file.tags).forEach(t => {
        switch (t.type) {
            case "analysis":
                analysis.push(t)
                break
            case "question":
                question.push(t)
                break
            case "summary":
                summary.push(t)
                break
            default:
                ElMessage.error(`Unknown tag type "${t.type}"`)
        }
    })
    return {
        analysis,
        summary,
        question
    }
})
const analysisTags = computed(() => tags.value.analysis.slice(0, TAG_LIMIT))
const summaryTags = computed(() => tags.value.summary.slice(0, TAG_LIMIT))
const questionTags = computed(() => tags.value.question.slice(0, TAG_LIMIT))
const tagGroups = ref([
    {
        type: "analysis",
        title: "Analysis Section",
        tags: analysisTags,
        ref: showAnalysis,
        seeAll: () => emit("all-analysis")
    },
    {
        type: "summary",
        title: "Summary Section",
        tags: summaryTags,
        ref: showSummary,
        seeAll: () => emit("all-summary")
    },
    {
        type: "question",
        title: "Critical Questions",
        tags: questionTags,
        ref: showQuestions,
        seeAll: () => emit("all-questions")
    },
])

const recentCards = computed(() => {
    const sorted = Object.values(props.file.cards).toSorted((card1, card2) =>
        new Date(card2.createdAt).getTime() - new Date(card1.createdAt).getTime())
    return sorted.slice(0, RECENT_LIMIT)
})
const uncategorizedCards = computed(() => Object.values(props.file.cards).filter(c => !c.tags.length))
const cardContents = computedAsync(
    async () => {
        const contentPromises = Object.values(props.file.cards)
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

console.log(props.file)
</script>

<template>
<div class="summary-wrapper">
    <div class="recent-cards-wrapper">
        <h3>Recently Created</h3>
        <div class="horizontal-flex">
            <template v-if="cardContents">
                <CritiqueCard v-for="card in recentCards"
                              @click="() => emit('view-card', card)"
                              :key="card.uuid"
                              :content="cardContents[card.uuid]"
                              :tags="Object.values(card.tags).map(t => t.name)"
                              :title="card.title">
                </CritiqueCard>
                <div class="no-content" style="height: 180px" v-if="!recentCards.length">
                    <h3>Nothing Here!</h3>
                    <span>Talk to Critique to generate cards</span>
                </div>
                <div class="tag-detail" title="see all tags" @click="() => emit('all-cards')">
                    <el-icon size="1.5rem"><el-icon-right/></el-icon>
                </div>
            </template>
            <EditorUnavailable v-else style="height: 200px"></EditorUnavailable>
        </div>
    </div>

    <div class="tag-wrapper" v-for="section of tagGroups" :key="section.type">
        <div class="summary" @click="() => section.ref = !section.ref">
            <h3>{{ section.title }}</h3>
            <el-icon :class="{ rotate: !section.ref }"><el-icon-arrow-down/></el-icon>
        </div>
        <div class="tags horizontal-flex" :class="{ hidden: !section.ref }">
            <CritiqueTag v-for="tag of (section.tags as CritiqueTagFull[])"
                         @detail="() => emit('view-tag', tag)"
                         :key="tag.uuid"
                         :name="tag.name"
                         :count="Object.values(tag.cards).length" />
            <div class="no-content" style="height: 300px" v-if="!(section.tags as CritiqueTagFull[]).length">
                <h3>It is empty here</h3>
                <span>Talk to Critique AI to generate some</span>
            </div>
            <div class="tag-detail" title="see all tags" @click="section.seeAll">
                <el-icon size="1.5rem"><el-icon-right/></el-icon>
            </div>
        </div>
    </div>

    <div class="uncategorized-wrapper">
        <h3>Uncategorized Cards</h3>
        <div class="uncategorized horizontal-flex">
            <CritiqueCard v-for="card in uncategorizedCards"
                          v-if="cardContents"
                          @click="() => emit('view-card', card)"
                          :key="card.uuid"
                          :title="card.title"
                          :tags="Object.values(card.tags).map(t => t.name)"
                          :content="cardContents[card.uuid]"></CritiqueCard>
            <EditorUnavailable v-else style="height: 200px"></EditorUnavailable>
            <div class="no-content" style="height: 180px" v-if="!uncategorizedCards.length">
                <h3>Nothing Here!</h3>
                <span>You have organized all your cards!</span>
            </div>
        </div>
    </div>
</div>
</template>

<style scoped>
.uncategorized.horizontal-flex {
    flex-wrap: wrap;
}

.no-content {
    width: 300px;
    border: var(--el-border);
    border-radius: var(--el-border-radius-round);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
}

.no-content span {
    margin-bottom: 2rem;
}

.tag-detail {
    width: 50px;
    height: 50px;
    background: var(--el-color-danger);
    flex-shrink: 0;
    color: var(--el-color-white);
    border-radius: var(--el-border-radius-circle);
    display: flex;
    justify-content: center;
    align-items: center;
    transition: 0.2s ease-in-out;
}

.tag-detail:hover {
    background: var(--el-color-primary);
}

.rotate {
    transform: rotateX(180deg);
}

.summary {
    display: flex;
    gap: 10px;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}

.summary:hover {
    color: var(--el-color-primary);
}

.summary i {
    transition: all 0.5s ease-out;
}

.summary-wrapper {
    min-width: 800px;
    margin: 30px;
}

.horizontal-flex {
    display: flex;
    flex-wrap: nowrap;
    gap: 30px;
    padding-left: 15px;
    overflow-y: hidden;
    overflow-x: auto;
    padding-bottom: 15px;
    align-items: center;
}

.hidden.tags {
    overflow: hidden;
    padding-bottom: 0;
    max-height: 0;
}

.tags {
    max-height: 400px;
    overflow-y: visible;
    transition: max-height 0.5s ease-out;
}
</style>