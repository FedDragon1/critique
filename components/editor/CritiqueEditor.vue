<script setup lang="ts">

import CritiqueBubbleMenu from "~/components/editor/CritiqueBubbleMenu.vue";
import {useEditorTransforms, useTiptapEditor} from "~/composibles/useTiptapEditor";

const props = defineProps<{
  html: string | null,
}>()

const textTf = useEditorTransforms()
const text = textTf.lowConfidenceInvisibleMarking(props.html);
const editor = useTiptapEditor(text)

watch(() => props.html, () => editor.value?.commands.setContent(props.html))

onBeforeUnmount(() => {
  unref(editor)?.destroy()
})
</script>

<template>
  <div class="editor-wrapper">
    <div v-if="editor" class="editor">
      <CritiqueBubbleMenu :editor="editor"></CritiqueBubbleMenu>
      <TiptapEditorContent :editor="editor"></TiptapEditorContent>
    </div>
    <EditorUnavailable v-else />
  </div>
</template>

<style scoped lang="css">
.editor-wrapper {
  margin: 20px;
  height: 800px;
  width: 800px;
  overflow: hidden;
}

.editor {
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>