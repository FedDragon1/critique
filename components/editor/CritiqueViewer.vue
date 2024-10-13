<script setup lang="ts">
import {useTiptapViewer} from "~/composibles/useTiptapEditor";
import useEventBus from "~/composibles/useEventBus";

const props = defineProps<{
    html: string | null,
}>()

const emitter = useEventBus()
const editor = useTiptapViewer(props.html)
const selectionRegistry = ref<SelectionRegistry>({})

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
    const sortedSelections = Object.values(selectionRegistry.value).toSorted((a, b) => a.index - b.index);

    debugger;

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
    if (!validSelection(selection)) {
        for (const existing of Object.values(selectionRegistry.value)) {
            existing.unselect()
            delete selectionRegistry.value[existing.uuid]
        }
    }

    selectionRegistry.value[selection.uuid] = selection
})
emitter.on('critique-unselect', ({ uuid }) => {
    delete selectionRegistry.value[uuid]
    removeInvalidSelection()
})

watch(() => props.html, () => {
    editor.value?.commands.setContent(props.html)
})

onBeforeUnmount(() => {
    unref(editor)?.destroy()
})
</script>

<template>
    <div class="editor-wrapper">
        <div v-if="editor" class="editor">
            <TiptapEditorContent :editor="editor"></TiptapEditorContent>
        </div>
        <EditorUnavailable v-else />
    </div>
</template>

<style scoped>
.editor-wrapper {
    width: 800px;
    margin: 20px auto;
}

.editor {
    width: 100%;
    height: 100%;
}
</style>