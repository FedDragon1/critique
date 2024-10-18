<script setup lang="ts">
import {useTiptapViewer} from "~/composibles/useTiptapEditor";
import useEventBus from "~/composibles/useEventBus";
import CritiqueComment from "~/components/analytic/CritiqueComment.vue";
import {hash} from "~/utils/hashUtil";

// Selection Logic

const props = defineProps<{
    html: string | null,
    disableSelection: boolean,
    file: CritiqueFull,
    rename: (uuid: string, title: string) => void,
    showCritiques: boolean
}>()

const emitter = useEventBus()
const editor = useTiptapViewer(props.html)
const selectionRegistry = ref<SelectionRegistry>({})

function sortByIndex(a: CritiqueSelect, b: CritiqueSelect) {
    return a.index - b.index
}

function sortedSelection() {
    return Object.values(selectionRegistry.value).toSorted(sortByIndex);
}

/**
 * Must be bordering existing selection in the same node
 */
function validSelection(selection: CritiqueSelect): boolean {
    // empty
    if (!Object.keys(selectionRegistry.value).length) {
        return true
    }

    let bordering = false
    for (const existing of Object.values(selectionRegistry.value)) {
        if (existing.node !== selection.node) {
            return false
        }
        if (Math.abs(existing.index - selection.index) === 1) {
            bordering = true
        }
    }

    return bordering
}

/**
 * Keep the first chunk of selection when unselect from the middle
 */
function removeInvalidSelection() {
    const sortedSelections = sortedSelection();

    let deleting = false
    let lastIndex = -1
    for (const selection of sortedSelections) {
        if (lastIndex === -1) {
            lastIndex = selection.index
            continue
        }

        if (selection.index - lastIndex !== 1) {
            deleting = true
        }

        if (deleting) {
            delete selectionRegistry.value[selection.uuid]
            selection.unselect()
        } else {
            lastIndex = selection.index
        }
    }
}

emitter.on('critique-select', (selection) => {
    if (props.disableSelection) {
        selection.unselect()
        return
    }

    if (!validSelection(selection)) {
        for (const existing of Object.values(selectionRegistry.value)) {
            existing.unselect()
            delete selectionRegistry.value[existing.uuid]
        }
    }

    selectionRegistry.value[selection.uuid] = selection
})
emitter.on('critique-unselect', ({ uuid, select }) => {
    if (props.disableSelection) {
        select()
        return
    }

    delete selectionRegistry.value[uuid]
    removeInvalidSelection()
})

// Hooks

watch(() => props.html, () => {
    editor.value?.commands.setContent(props.html)
})
onBeforeUnmount(() => {
    unref(editor)?.destroy()
})

// Exposes

const selectedText = computed(() =>
    Object.values(selectionRegistry.value)
        .toSorted(sortByIndex)
        .map(s => s.content)
        .join(" ")
)

const selectedInfo = computed(() => {
    if (!Object.keys(selectionRegistry.value).length) {
        return null
    }
    const sorted = sortedSelection()

    return {
        node: sorted[0].node,
        from: sorted[0].index,
        to: sorted[sorted.length - 1].index
    }
})

defineExpose({
    selectedText,
    selectedInfo
})

// Render

class CardRegistry {
    CARD_HEIGHT = 300;
    cards
    registry: {
        left: [number, CritiqueCardFull[]][],
        right: [number, CritiqueCardFull[]][],
    }

    constructor(cards: CritiqueCardFull[]) {
        this.cards = cards
        this.registry = {
            left: [],
            right: [],
        }
    }

    clear() {
        this.registry = {
            left: [],
            right: [],
        }
    }

    /**
     * Finds the dom element and attach its offsetTop with the card
     */
    get cardOffsets(): CardOffset[] {
        const targetParent = document.querySelector("div.tiptap.ProseMirror");

        if (!targetParent) {
            throw Error("Editor not found")
        }

        return this.cards.map((card) => {
            const dom = document.querySelector(`critique[node="${card.node!}"][index="${card.from!}"]`) as HTMLElement;

            if (!dom) {
                const s = `critique[node="${card.node!}"][index="${card.from!}"] Not found`;
                ElMessage.error(s)
                throw Error(s)
            }

            let offset = 0,
                temp = dom
            do {
                offset += temp.offsetTop
                temp = temp.offsetParent as HTMLElement
            } while (temp !== targetParent);

            return {
                card,
                offset
            }
        })
    }

    /**
     * Returns the offsets in ascending order
     */
    get orderedOffsets(): CardOffset[] {
        return this.cardOffsets.toSorted((a, b) => a.offset - b.offset)
    }

    free(position: "left" | "right", offsetStart: number) {
        const entries = this.registry[position]

        if (!entries.length) {
            return true
        }

        const lastEntry = entries[entries.length - 1]
        return offsetStart - lastEntry[0] > this.CARD_HEIGHT
    }

    popAround(position: "left" | "right", offsetStart: number) {
        const entries = this.registry[position]

        if (!entries.length) {
            return null
        }

        for (const entry of entries.toReversed()) {
            if (Math.abs(entry[0] - offsetStart) < this.CARD_HEIGHT) {
                this.registry[position] = this.registry[position]
                    .filter(([offset, card]) => !(offset === entry[0] && this.cardMatches(entry[1], card)))
                return entry
            }
        }

        return null
    }

    cardMatches(cards1: CritiqueCardFull[], cards2: CritiqueCardFull[]) {
        if (cards1.length !== cards2.length) {
            return false
        }

        for (let i = 0; i < cards1.length; i++) {
            if (cards1[i].uuid !== cards2[i].uuid) {
                return false
            }
        }

        return true
    }

    merge(around: number, extra: CardOffset) {
        const leftCandidate: [number, CritiqueCardFull[]] = this.popAround("left", around)
            ?? [Number.MIN_SAFE_INTEGER, []]
        const rightCandidate: [number, CritiqueCardFull[]] = this.popAround("right", around)
            ?? [Number.MIN_SAFE_INTEGER, []]

        const offsets = [leftCandidate[0], rightCandidate[0], extra.offset]
        let newOffset = around;

        for (const offset of offsets) {
            if (this.free("right", offset)) {
                newOffset = offset;
                break
            }
        }

        const merged = [...rightCandidate[1], ...leftCandidate[1], extra.card]
        this.registry.right.push([newOffset, merged])
    }

    put(card: CardOffset) {
        // try to put cards to the right first,
        // if it doesn't work then move to the left.
        // if still not enough space, merge all to the right

        if (this.free("right", card.offset)) {
            this.registry.right.push([card.offset, [card.card]])
            return
        }
        if (this.free("left", card.offset)) {
            this.registry.left.push([card.offset, [card.card]])
            return
        }

        this.merge(card.offset, card)
    }

    render() {
        for (const card of this.orderedOffsets) {
            this.put(card)
        }
        return this.registry
    }

    static render(cards: CritiqueCardFull[]) {
        return new CardRegistry(cards).render()
    }
}

const cards = computed<CritiqueCardFull[]>(() => Object.values(props.file.cards).filter((card) => !!card.node))
const domLoaded = ref(false)
const cardRegistry = ref<{
    left: [number, CritiqueCardFull[]][],
    right: [number, CritiqueCardFull[]][],
}>({
    left: [],
    right: []
})

function initialRender() {
    if (!editor.value || !document.querySelector("critique")) {
        setTimeout(initialRender, 100)
        return
    }
    cardRegistry.value = CardRegistry.render(cards.value)
    domLoaded.value = true
    cards.value.forEach((newCard) => {
        if (!newCard.node || newCard.from === null || newCard.to === null) {
            return
        }
        emitter.emit("critique-underline", {
            node: newCard.node,
            from: newCard.from,
            to: newCard.to
        })
    })
}

onMounted(initialRender)

// Events

const emit = defineEmits(['chat', 'delete', 'detail', 'rename'])

const renaming = ref({
    status: false,
    uuid: "",
    from: "",
    to: "",
    error: "",
})

function resetRenaming() {
    renaming.value = {
        status: false,
        uuid: "",
        from: "",
        to: "",
        error: "",
    }
}

function renameFile() {
    const newName = renaming.value.to.trim()

    if (newName.length === 0) {
        renaming.value.error = "Card title cannot be empty!"
        return;
    }
    if (newName.length > 20) {
        renaming.value.error = ("Card title cannot be longer than 20 characters")
        return;
    }
    if (newName.match(/[^A-Za-z0-9_\- :]/)) {
        renaming.value.error = ("Card title can only contain A-Z, a-z, 0-9, _, -, :, and whitespace")
        return;
    }

    props.rename(renaming.value.uuid, newName)
    ElMessage.success(`Renamed card to "${newName}"`)
    resetRenaming()
}

watch(() => cards.value, (newCards, oldCards) => {
    debugger;

    const olds = (oldCards as CritiqueCardFull[]).map((c) => c.uuid);
    const news = (newCards as CritiqueCardFull[]).map((c) => c.uuid);
    const created = [];
    const deleted = [];

    for (const oldC of oldCards) {
        if (!news.includes(oldC.uuid)) {
            deleted.push(oldC)
        }
    }

    for (const newC of newCards) {
        if (!olds.includes(newC.uuid)) {
            created.push(newC)
        }
    }

    deleted.forEach((oldCard) => {
        if (!oldCard.node || oldCard.from === null || oldCard.to === null) {
            return
        }
        emitter.emit("critique-remove-underline", {
            node: oldCard.node,
            from: oldCard.from,
            to: oldCard.to
        })
    });
    created.forEach((newCard) => {
        if (!newCard.node || newCard.from === null || newCard.to === null) {
            return
        }
        emitter.emit("critique-underline", {
            node: newCard.node,
            from: newCard.from,
            to: newCard.to
        })
    })
    cardRegistry.value = CardRegistry.render(cards.value)
}, {deep: true})

function makeKey(offset: number, cards: CritiqueCardFull[]) {
    return `${offset}-${hash(cards.map((c) => c.uuid).join())}`
}
</script>

<template>
    <Teleport to="body">
        <el-dialog
            v-model="renaming.status"
            title="Rename"
            width="500"
            :before-close="resetRenaming"
        >
            <span style="line-height: 2rem">Renaming "{{ renaming.from }}" to</span>
            <br>
            <el-input
                maxlength="50"
                placeholder="New card title"
                v-model="renaming.to"></el-input>
            <el-text type="danger">{{ renaming.error }}</el-text>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="resetRenaming">Cancel</el-button>
                    <el-button type="primary" @click="renameFile">
                        Confirm
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </Teleport>
    <div class="wrapper">
        <div class="critique-card-slot" v-if="cardRegistry?.left.length && showCritiques">
            <CritiqueComment v-for="[offset, cards] in cardRegistry?.left"
                             @chat="emit('chat', $event)"
                             @delete="emit('delete', $event)"
                             @detail="emit('detail', $event)"
                             @rename="(uuid, from) => {
                                 renaming.uuid = uuid
                                 renaming.from = from
                                 renaming.status = true
                             }"
                             :key="makeKey(offset, cards)"
                             :cards="cards"
                             :offset="offset"></CritiqueComment>
        </div>
        <div class="editor-wrapper">
            <div v-if="editor" class="editor">
                <TiptapEditorContent :editor="editor"></TiptapEditorContent>
            </div>
            <EditorUnavailable v-else />
        </div>
        <div class="critique-card-slot" v-if="cardRegistry?.right.length && showCritiques">
            <CritiqueComment v-for="[offset, cards] in cardRegistry?.right"
                             @chat="emit('chat', $event)"
                             @delete="emit('delete', $event)"
                             @detail="emit('detail', $event)"
                             @rename="(uuid, from) => {
                                 renaming.uuid = uuid
                                 renaming.from = from
                                 renaming.status = true
                             }"
                             :key="makeKey(offset, cards)"
                             :cards="cards"
                             :offset="offset"></CritiqueComment>
        </div>
    </div>
</template>

<style scoped>
.wrapper {
    flex-shrink: 0;
    margin: 20px auto;
    display: flex;
    flex-direction: row;
    justify-content: center;
    padding: 0 20px;
}

.critique-card-slot {
    width: 380px;
    flex-shrink: 0;
    height: 100%;
    position: relative;
}

.editor-wrapper {
    width: 800px;
    flex-shrink: 0;
}

.editor {
    width: 100%;
    height: 100%;
}
</style>