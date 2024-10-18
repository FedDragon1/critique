<script setup lang="ts">
import {useFile} from "~/composibles/useFile";
import {DeleteFilled, Edit, Comment} from "@element-plus/icons-vue";
import {computedAsync} from "@vueuse/core";
import useEventBus from "~/composibles/useEventBus";

const props = defineProps<{
    cards: CritiqueCardFull[],
    offset: number
}>();

const emitter = useEventBus()
const emit = defineEmits(['chat', 'delete', 'rename', 'detail'])
const { ellipses } = useFile()
const client = useSupabaseClient()
const message = ref("")
const dom = useTemplateRef<HTMLDivElement>("wrapper")

const currentIndex = ref(0)
const currentCard = computed(() => props.cards[currentIndex.value])
const title = computed(() => ellipses(currentCard.value.title, 24))
const type = computed(() => {
    const cardType = currentCard.value.type;
    switch (cardType) {
        case "analysis":
            return "Analysis"
        case "summary":
            return "Summary"
        case "question":
            return "Question"
        default:
            throw Error(`Unknown card type ${cardType}`)
    }
})
const tags = computed(() => Object.values(currentCard.value.tags).map((t) => `#${t.name}`).join(" ") || "No Tags")
const cardContents = computedAsync(
    async () => {
        const contentPromises = Object.values(props.cards)
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

function chat(e: Event | KeyboardEvent) {
    if (!("key" in e) || e.key !== "Enter") {
        return
    }
    emit("chat", {
        prompt: message.value,
        type: currentCard.value.type,
        context: cardContents.value[currentCard.value.uuid]
    })
    message.value = ""
}

watch(() => props.cards, (...args) => console.log("card changed", args), {deep: true})
watch(currentIndex, (newIndex, oldIndex) => {
    const card = props.cards[oldIndex]
    emitter.emit("critique-remove-underline-focus", {
        node: card.node!,
        from: card.from!,
        to: card.to!
    })
    const newCard = props.cards[newIndex]
    emitter.emit("critique-underline-focus", {
        node: newCard.node!,
        from: newCard.from!,
        to: newCard.to!
    })
})

function mouseEnter() {
    emitter.emit("critique-hover", {
        node: currentCard.value.node!,
        from: currentCard.value.from!,
        to: currentCard.value.to!
    })
}

function mouseLeave() {
    emitter.emit("critique-remove-hover", {
        node: currentCard.value.node!,
        from: currentCard.value.from!,
        to: currentCard.value.to!
    })
}

onMounted(() => {
    for (const card of props.cards) {
        emitter.emit("critique-remove-underline-focus", {
            node: card.node!,
            from: card.from!,
            to: card.to!
        })
    }
    emitter.emit("critique-underline-focus", {
        node: currentCard.value.node!,
        from: currentCard.value.from!,
        to: currentCard.value.to!
    })

    dom.value?.addEventListener("mouseenter", mouseEnter)
    dom.value?.addEventListener("mouseleave", mouseLeave)
})
</script>

<template>
<div class="card-wrapper" :style="{ top: `${offset}px` }" ref="wrapper">
    <header>
        <CritiqueProfilePicture/>
        <div class="info">
            <div>
                <span :title="currentCard.title">{{ title }}</span>
                <div class="extra">
                    <span class="secondary" v-if="cards.length > 1">
                        {{ `<${currentIndex + 1}/${cards.length}>` }}
                    </span>
                    <el-dropdown>
                        <el-icon>
                            <el-icon-more-filled></el-icon-more-filled>
                        </el-icon>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item @click="() => emit('delete', currentCard.uuid)" :icon="DeleteFilled">Delete</el-dropdown-item>
                                <el-dropdown-item :icon="Edit"
                                                  @click="() => emit('rename', currentCard.uuid, currentCard.title)">Rename
                                </el-dropdown-item>
                                <el-dropdown-item :icon="Comment"
                                                  @click="() => emit('detail', currentCard)">Detail
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </div>
            <div>
                <span class="secondary" :title="type">{{ type }}</span>
                <span class="secondary" :title="tags">{{ ellipses(tags, 20) }}</span>
            </div>
        </div>
    </header>
    <main>
        <div class="swap-card left" v-if="cards.length > 1">
            <el-icon size="1.2rem"
                     class="secondary icon"
                     :class="{ disabled: currentIndex === 0 }"
                     @click="() => currentIndex > 0 && (currentIndex--)"><el-icon-arrow-left/></el-icon>
        </div>
        <div class="content" v-if="cardContents">
            {{ cardContents[currentCard.uuid] }}
        </div>
        <EditorUnavailable v-else/>
        <div class="swap-card right" v-if="cards.length > 1">
            <el-icon size="1.2rem"
                     class="secondary icon"
                     :class="{ disabled: currentIndex + 1 === cards.length }"
                     @click="() => currentIndex < cards.length - 1 && (currentIndex++)"><el-icon-arrow-right/></el-icon>
        </div>
    </main>
    <footer>
        <el-input class="message"
                  type="text"
                  placeholder="Message Critique"
                  @keydown="chat"
                  v-model="message"></el-input>
    </footer>
</div>
</template>

<style scoped>
.icon {
    transition: 0.2s ease-in-out color;
    cursor: pointer;
}

.icon:hover {
    color: var(--el-color-primary);
}

.icon.disabled, .icon.disabled:hover {
    cursor: not-allowed;
    color: var(--el-disabled-text-color);
}

.extra {
    display: flex;
    align-items: center;
    gap: 10px;
}

.message {
    height: 40px;
}

.swap-card {
    width: 20px;
}

.swap-card.left {
    margin-left: -5px;
    padding-right: 2px;
}

.swap-card.right {
    margin-right: -5px;
    padding-left: 2px;
}

.content {
    font-size: 0.9rem;
    padding: 0 10px;
    overflow: auto;
    max-height: 150px;
}

main {
    display: flex;
    flex-direction: row;
    padding: 16px 0;
    align-items: center;
}

.secondary {
    color: var(--el-text-color-secondary);
    font-size: 0.8rem;
}

header {
    display: flex;
    flex-direction: row;
    gap: 10px;
}

.info {
    display: flex;
    flex-direction: column;
    flex-grow: 999;
}

.info > div {
    flex-grow: 999;
    display: flex;
    justify-content: space-between;
}

.card-wrapper {
    max-height: 300px;
    width: 380px;
    box-sizing: border-box;
    border: 1px solid var(--el-color-danger);
    border-radius: var(--el-border-radius-round);
    position: absolute;
    padding: 20px;
}
</style>