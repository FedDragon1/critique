<script setup lang="ts">
import AnalyticNav from "~/components/analytic/AnalyticNav.vue";
import {CollectionTag, Promotion, QuestionFilled, Tickets} from "@element-plus/icons-vue";
import PanelWrapper from "~/components/analytic/PanelWrapper.vue";
import NoFile from "~/components/analytic/NoFile.vue";
import ContentWrapper from "~/components/analytic/ContentWrapper.vue";
import {v4 as uuid} from 'uuid';
import ChatBox from "~/components/analytic/ChatBox.vue";
import MessageEntry from "~/components/analytic/MessageEnrty.vue";
import type {Critique} from "~/types/requests";

const route = useRoute()
const router = useRouter()

const critiqueUuid = route.params.uuid as string
const critiqueResp = await useFetch(`/api/file/${critiqueUuid}`)
const critique = ref(critiqueResp?.data as unknown as Critique | null)

if (critiqueUuid && (critiqueResp.error.value !== null || critiqueResp.status.value !== "success")) {
    console.error(critiqueResp.error);
    ElMessage.error(`Error fetching file: ${critiqueResp.error.value}`)
}

const isDeletingFile = ref(false)
const isRenamingFile = ref(false)
const renamingError = ref("")
const renamingTo = ref("")

function favorite() {
    if (!critique.value) {
        ElMessage.error("No file opened")
        return;
    }
    critique.value.isFavorite = true
    // TODO: network
}

function unfavorite() {
    if (!critique.value) {
        ElMessage.error("No file opened")
        return;
    }
    critique.value.isFavorite = false
    // TODO: network
}

function deleteFile() {
    // TODO: Sync database
    ElMessage.success(`File "${critique.value?.fileName}" is deleted`)
}

function resetRenaming() {
    isRenamingFile.value = false
    renamingError.value = ""
    renamingTo.value = ""
}

function renameFile() {
    if (!critique.value) {
        ElMessage.error("No file opened")
        return;
    }

    const newName = renamingTo.value.trim()

    if (newName.length === 0) {
        renamingError.value = "File name cannot be empty!"
        return;
    }
    if (newName.length > 20) {
        renamingError.value = ("File name cannot be longer than 20 characters")
        return;
    }
    if (newName.match(/[^A-Za-z0-9_\- ]/)) {
        renamingError.value = ("File name can only contain A-Z, a-z, 0-9, _, -, and whitespace")
        return;
    }

    // TODO: Sync database

    critique.value.fileName = renamingTo.value;
    resetRenaming()
}

// Panel data models / functions

function annotateSelection() {
    // TODO
}

function summarizeSelection() {
    // TODO
}

function generateQuestions() {
    // TODO
}

function generateTags() {
    // TODO
}

const quickActions: QuickActions = {
    'annotate': {
        icon: Promotion,
        caption: "Annotate",
        handler: annotateSelection
    },
    'summarize': {
        icon: Tickets,
        caption: "Summarize",
        handler: summarizeSelection
    },
    'questions': {
        icon: QuestionFilled,
        caption: "Critical Question",
        handler: generateQuestions
    },
    'tags': {
        icon: CollectionTag,
        caption: "Tag Critiques",
        handler: generateTags
    }
}

function uploadFile() {
    router.push("/analytic/upload")
}

function pasteText() {
    router.push("/analytic/review?new=true")
}

// Conversations
const promptDom = ref<HTMLTextAreaElement>();

const conversation = ref<Message[]>([{
    uuid: uuid(),
    from: "critique",
    content: "Hi, I'm Critique, an AI tool designed to enhance your critical reading skills. I don't have personal experiences or emotions, but I can help you analyze and evaluate texts, generate questions, and provide explanations based on what you’re reading. My goal is to assist you with understanding complex materials, improving your analytical skills, and making your reading experience more interactive and insightful. How can I help you today?"
}])

function textareaReflow() {
    if (!promptDom.value) {
        return;
    }

    if (!promptDom.value) {
        return;
    }
    promptDom.value.style.height = '1rem';
    promptDom.value.style.height = Math.min((promptDom.value.scrollHeight - 6), 200) + "px";

    if (promptDom.value.scrollHeight - 6 > 200) {
        promptDom.value.style.overflowY = "auto"
    } else {
        promptDom.value.style.overflowY = "hidden"
    }
}

function reflowDuring(ms: number, per: number = 50) {
    return () => {
        const start = Date.now()
        const fn = () => {
            const now = Date.now()

            console.log(now - start)

            textareaReflow()
            if (now - start > ms) {
                return;
            }

            // reflow the text, and wait for `per` ms
            setTimeout(fn, per)
        }
        fn()
    }
}

function chat(message: Message, postChat?: () => void): Promise<Message> {
    conversation.value.push(message)

    return new Promise((resolve) => {
        // TODO

        setTimeout(() => {
            const newMessage: Message = {
                uuid: uuid(),
                from: "critique",
                content: `This is an auto-response for ${message.content}`
            }

            conversation.value.push(newMessage)

            postChat && postChat()
            resolve(newMessage)
        }, 2000)
    })
}
</script>

<template>
    <SeoHead title="Analytics"></SeoHead>

    <el-dialog
        v-model="isDeletingFile"
        title="Warning"
        width="500"
        :before-close="() => isDeletingFile = false"
    >
        <template v-if="critique">
            <span>Are you sure you want to delete "{{ critique.fileName }}"?</span>
            <br>
            <span>You cannot undo this operation.</span>
        </template>
        <template v-else>
            Operation complete.
        </template>

        <template #footer>
            <div class="dialog-footer">
                <el-button @click="isDeletingFile = false">Cancel</el-button>
                <el-button type="primary" @click="deleteFile()">
                    Confirm
                </el-button>
            </div>
        </template>
    </el-dialog>
    <el-dialog
        v-model="isRenamingFile"
        title="Edit"
        width="500"
        :before-close="resetRenaming"
    >
        <template v-if="critique">
            <span style="line-height: 2rem">Renaming "{{ critique.fileName }}" to</span>
            <br>
            <el-input
                maxlength="20"
                placeholder="New file name"
                v-model="renamingTo"></el-input>
            <el-text type="danger">{{ renamingError }}</el-text>
        </template>
        <template v-else>
            Operation complete.
        </template>

        <template #footer>
            <div class="dialog-footer">
                <el-button @click="isRenamingFile = false">Cancel</el-button>
                <el-button type="primary" @click="renameFile()">
                    Confirm
                </el-button>
            </div>
        </template>
    </el-dialog>

    <DashboardFrame activate="/analytic" padding="0px"
                    :post-toggle="reflowDuring(200)"
                    style="display: flex; flex-direction: column;">
        <AnalyticNav :title="critique?.fileName || 'New Critique File'"
                     :disable-op="!critiqueUuid"
                     @favorite="favorite"
                     @unfavorite="unfavorite"
                     @rename="isRenamingFile = true"
                     @delete="isDeletingFile = true"
                     :is-favorite="!!critique?.isFavorite"></AnalyticNav>
        <main v-if="critiqueUuid" class="critique">
            <ContentWrapper>
                <!--          TODO-->
                {{ critique }}
            </ContentWrapper>
            <PanelWrapper :quick-actions="quickActions"
                          :post-drag="textareaReflow" v-slot="slotProps">
                <div class="panel-message-wrapper">
                    <MessageEntry v-for="message in conversation" :message="message"></MessageEntry>
                </div>
                <ChatBox :dragging-panel="slotProps.draggingPanel"
                         :textarea-reflow="textareaReflow"
                         :chat="chat"
                         v-model:dom="promptDom"></ChatBox>
            </PanelWrapper>
        </main>
        <NoFile v-else @upload="uploadFile" @text="pasteText"></NoFile>
    </DashboardFrame>
</template>

<style scoped>
.panel-message-wrapper {
    flex-grow: 999;
    min-height: 0;
    overflow-y: auto;
}

/*noinspection CssUnusedSymbol*/
.ease-width {
    transition: 0.2s width ease-out;
}

.critique {
    display: flex;
    flex-direction: row;
    overflow: hidden;
}

main {
    flex-grow: 9999;
}
</style>