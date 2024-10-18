<script setup lang="ts">
import {marked} from "marked"
import DOMPurify from 'dompurify'

const props = defineProps<{
    message: Message
}>();

const unifyHTML = (s: string) => {
    const txt = document.createElement("textarea")
    txt.innerHTML = s
    return txt.value
}

const messageHtml = computed(() => {
    const content = unifyHTML(marked.parse(props.message.content, {
        breaks: true,
    }) as string)

    const purified = unifyHTML(DOMPurify.sanitize(content, {
        ALLOWED_TAGS: ['p', 'b', 'strong', 'em', 'i', 'u', 's', 'del', 'blockquote', 'h1', 'h2', 'h3', 'br']
    }))

    if (content.length - purified.length) {
        ElMessage.warning("Do not use HTML tags in the chat")
        return
    }
    return purified
})
</script>

<template>
    <div class="panel-message-entry"
         :class="{ 'panel-message-entry-critique': message.role === 'assistant' }"
         :key="message.uuid">
        <CritiqueProfilePicture v-if="message.role === 'assistant'"/>
        <div class="panel-message-entry-data" v-if="messageHtml" v-html="messageHtml"></div>
        <div class="panel-message-entry-data" v-else>{{ message.content }}</div>
    </div>
</template>

<style scoped>
/*noinspection CssUnusedSymbol*/
.panel-message-entry:not(.panel-message-entry-critique) {
    display: flex;
    flex-direction: row-reverse;
}

.panel-message-entry-data {
    white-space: wrap;
    word-break: break-word;
}

/*noinspection CssUnusedSymbol*/
.panel-message-entry:not(.panel-message-entry-critique) .panel-message-entry-data {
    width: auto;
    max-width: 80%;
    padding: 10px 30px;
    background: var(--el-border-color-lighter);
    border-radius: var(--el-border-radius-round) var(--el-border-radius-round) 0 var(--el-border-radius-round);
}

.panel-message-entry {
    display: flex;
    flex-direction: row;
    padding: 10px;
    gap: 20px;
    width: 95%;
    line-height: 1.8rem;
}

.panel-message-entry.panel-message-entry-critique > .panel-message-entry-data {
    margin-top: -8px;
}
</style>