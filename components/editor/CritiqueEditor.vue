<script setup lang="ts">

import CritiqueBubbleMenu from "~/components/editor/CritiqueBubbleMenu.vue";
import {useTiptapEditor} from "~/composibles/useTiptapEditor";
import Loading from "~/components/svg/Loading.vue";

const props = defineProps<{
  html: string,
}>()

const editor = useTiptapEditor(props.html)

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
    <div v-else class="editor-unavailable">
        <Loading/>
    </div>
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

.editor-unavailable {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    gap: 20px;
    align-items: center;
    flex-direction: column;
}
</style>