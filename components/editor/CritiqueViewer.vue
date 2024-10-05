<script setup lang="ts">
import {useTiptapViewer} from "~/composibles/useTiptapEditor";

const props = defineProps<{
    html: string | null,
}>()

const editor = useTiptapViewer(props.html)
watch(() => props.html, () => editor.value?.commands.setContent(props.html))

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