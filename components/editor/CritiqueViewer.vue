<script setup lang="ts">
import {useTiptapViewer} from "~/composibles/useTiptapEditor";

const props = defineProps<{
    html: string | null,
}>()

// const html = `
// <critique-paragraph>
//     <critique uuid="123123" hash="168678">test content</critique>
//     <critique uuid="123123" hash="168678">test content</critique>
// </critique-paragraph>
//
// <blockquote>
// <critique uuid="123123" hash="168678">test content</critique>
//     <critique uuid="123123" hash="168678">test content</critique>
// </blockquote>
//
// <!--<critique-heading><critique uuid="123123" hash="168678">test content</critique></critique-heading>-->
// <h2><critique uuid="123123" hash="168678">test content</critique></h2>
// <h1><critique uuid="123123" hash="168678">test content</critique></h1>
// <h3><critique uuid="123123" hash="168678">test content</critique></h3>
//
// <ol>
//     <li>
//         <critique uuid="123123" hash="168678">test content</critique>
//         <critique uuid="123123" hash="168678">test content</critique>
//         <critique uuid="123123" hash="168678">test content</critique>
//     </li>
//     <li>
//         <critique uuid="123123" hash="168678">test content</critique>
//         <critique uuid="123123" hash="168678">test content</critique>
//         <critique uuid="123123" hash="168678">test content</critique>
//     </li>
// </ol>
//
//
// <blockquote>
// <p>Normal content</p>
// <p>Normal content</p>
// <p>Normal content</p>
// <p>Normal content</p>
//
// </blockquote>
// `

const editor = useTiptapViewer(props.html)
// const editor = useTiptapViewer(html)
console.log(editor)
watch(() => props.html, () => {
    editor.value?.commands.setContent(props.html)
    console.log(props.html)
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