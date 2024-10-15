<script setup lang="ts">
import {throttle} from "lodash-es";
import {v4 as uuid} from 'uuid';

const props = defineProps<{
    draggingPanel: boolean,
    disabled: boolean,
    textareaReflow: () => void,
    chat: (message: Message, endpoint?: string) => Promise<Message>
}>()

const promptDom = defineModel<HTMLTextAreaElement>("dom");

const prompt = ref<string>("");
const generating = ref(false)
const multiline = ref(false)

watchEffect(() => {
    prompt.value;
    props.textareaReflow()
})

function registerListener() {
    if (promptDom.value) {
        promptDom.value.addEventListener("keypress", multilineGuard)
    }
    setTimeout(registerListener, 0)
}


onMounted(registerListener)
onBeforeUnmount(() => {
    promptDom.value!.removeEventListener("keypress", multilineGuard)
})

function multilineGuard(e: KeyboardEvent) {
    if (e.key !== "Enter"
        || multiline.value
        || e.shiftKey
        || !prompt.value.trim().length
        || generating.value) {
        return;
    }

    // hitting enter on the first line with non-white space character
    // send the message
    e.preventDefault()
    sendMessage()
}

function postChat(message: Message) {
    generating.value = false
    return message
}

function sendMessageRaw(endpoint?: string): Promise<Message> {
    if (!prompt.value.trim().length) {
        ElMessage.error("Empty prompt")
        return Promise.reject("Empty prompt");
    }

    // let the promise resolve itself, initiate here
    const promise = props.chat({
        uuid: uuid(),
        role: "user",
        // content: promptToHTML()
        content: prompt.value
    }, endpoint).then(postChat)

    prompt.value = ""
    generating.value = true
    multiline.value = false
    setTimeout(props.textareaReflow, 0)

    // finish the promise
    return promise
}

const sendMessage = throttle(sendMessageRaw, 3000)

defineExpose({
    sendMessage
})
</script>

<template>
    <div class="panel-message-box">
        <el-icon size="1.2rem">
            <el-icon-circle-plus></el-icon-circle-plus>
        </el-icon>
        <textarea class="panel-message-input"
                  placeholder="Chat to the critique bot"
                  :class="{ 'no-select': draggingPanel, 'disabled': disabled }"
                  :readonly="draggingPanel || disabled"
                  v-model="prompt"
                  ref="promptDom"
                  maxlength="2000"/>
        <el-icon size="1.2rem" @click="() => !disabled && sendMessage()" v-if="!generating">
            <el-icon-promotion></el-icon-promotion>
        </el-icon>
        <el-icon size="1.2rem" v-else>
            <el-icon-loading class="spin"></el-icon-loading>
        </el-icon>
    </div>
</template>

<style scoped>
.panel-message-input {
    font-family: var(--el-font-family), sans-serif;
    border: none;
    flex-grow: 999;
    resize: none;
    height: 1rem;
    max-height: 200px;
    overflow-y: hidden;
    word-break: break-word;
}

.panel-message-input:focus {
    outline: none;
}

/*noinspection ALL*/
.panel-message-box:has(.panel-message-input:not(.disabled):focus) {
    border: 1px solid var(--el-color-primary);
}

.panel-message-box {
    margin: 10px;
    flex-shrink: 0;
    border-radius: var(--el-border-radius-round);
    border: var(--el-border);
    display: flex;
    gap: 20px;
    align-items: center;
    padding: 15px;
    transition: border 0.2s ease-in-out;
}

.panel-message-box i {
    color: var(--el-text-color-secondary);
    transition: color 0.2s ease-in-out;
}

/*noinspection ALL*/
.panel-message-box:has(.panel-message-input:not(.disabled):focus) i {
    color: var(--el-text-color);
}

/*noinspection ALL*/
.panel-message-box:not(:has(.disabled)) i:hover {
    color: var(--el-color-primary) !important;
}
</style>