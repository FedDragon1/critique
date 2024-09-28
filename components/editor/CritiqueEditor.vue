<script setup lang="ts">

import CritiqueBubbleMenu from "~/components/editor/CritiqueBubbleMenu.vue";
import {useEditorTransforms, useTiptapEditor} from "~/composibles/useTiptapEditor";

const props = defineProps<{
  html: string | null,
}>()

const textTf = useEditorTransforms()
const text = textTf.lowConfidenceInvisibleMarking(props.html);
const editor = useTiptapEditor(text)
const menu = useTemplateRef<typeof CritiqueBubbleMenu>("menu")

watch(() => props.html, () => editor.value?.commands.setContent(props.html))

onBeforeUnmount(() => {
  unref(editor)?.destroy()
})

defineExpose({
    menu,
    editor
})
</script>

<template>
  <div class="editor-wrapper">
    <div v-if="editor" class="editor">
      <CritiqueBubbleMenu :editor="editor" ref="menu"></CritiqueBubbleMenu>
      <TiptapEditorContent :editor="editor"></TiptapEditorContent>
    </div>
    <EditorUnavailable v-else />
  </div>
</template>

<style scoped lang="css">
.editor-wrapper {
  margin: 20px;
  width: 800px;
}

.editor {
  width: 100%;
  height: 100%;
}
</style>