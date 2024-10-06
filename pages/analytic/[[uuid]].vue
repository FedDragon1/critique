<script setup lang="ts">
import AnalyticNav from "~/components/analytic/AnalyticNav.vue";
import {CollectionTag, Promotion, QuestionFilled, Tickets} from "@element-plus/icons-vue";
import PanelWrapper from "~/components/analytic/PanelWrapper.vue";
import NoFile from "~/components/analytic/NoFile.vue";
import ContentWrapper from "~/components/analytic/ContentWrapper.vue";
import {v4 as uuid} from 'uuid';
import ChatBox from "~/components/analytic/ChatBox.vue";
import MessageEntry from "~/components/analytic/MessageEnrty.vue";
import type {BaseResponse, DeleteFileRequest, UpdateFileRequest} from "~/types/requests";
import CritiqueViewer from "~/components/editor/CritiqueViewer.vue";
import DocumentNav from "~/components/analytic/DocumentNav.vue";
import CritiqueEditor from "~/components/editor/CritiqueEditor.vue";
import ReviewContextMenu from "~/components/editor/ReviewContextMenu.vue";
import ContextMenu from "~/components/editor/ContextMenu.vue";
import CritiqueAnalysis from "~/components/analytic/CritiqueAnalysis.vue";

definePageMeta({
    middleware: 'auth'
})

const route = useRoute()
const router = useRouter()

const critiqueUuid = route.params.uuid as string
const critiqueResp = await useFetch(`/api/file/${critiqueUuid}`)
const critique = ref(critiqueResp?.data.value?.data as CritiqueFull | null)
const critiqueStorage = ref("")

if (critiqueUuid && (critiqueResp.error.value !== null || critiqueResp.status.value !== "success" || !critique.value)) {
    console.error(critiqueResp.error);
    ElMessage.error(`Error fetching file: ${critiqueResp.error.value}`)
}

const client = useSupabaseClient()
if (critiqueUuid){
    client.storage.from("file").download(critique.value!.fileLink)
        .then((resp) => resp.data?.text())
        .then((text) => critiqueStorage.value = text!)
}

const isDeletingFile = ref(false)
const isRenamingFile = ref(false)
const renamingError = ref("")
const renamingTo = ref("")
const viewMode = ref("document")
const documentActiveTool = ref("selector")

function favorite() {
    if (!critique.value) {
        ElMessage.error("No file opened")
        return;
    }

    const request: UpdateFileRequest = {
        uuid: critique.value.uuid,
        favorite: true
    }
    $fetch<BaseResponse<Critique>>("/api/file", {
        method: "PUT",
        body: request
    }).then(resp => {
        if (!critique.value) {
            ElMessage.error("No files")
            return;
        }
        if (!resp.success) {
            ElMessage.error(resp.errorMessage)
            return;
        }
        ElMessage.success({
            message: `Added "${resp.data?.fileName}" to favorite`,
            grouping: true
        })
        critique.value.isFavorite = true
    })
}

function unfavorite() {
    if (!critique.value) {
        ElMessage.error("No file opened")
        return;
    }

    const request: UpdateFileRequest = {
        uuid: critique.value.uuid,
        favorite: false
    }
    $fetch<BaseResponse<Critique>>("/api/file", {
        method: "PUT",
        body: request
    }).then(resp => {
        if (!critique.value) {
            ElMessage.error("No files")
            return;
        }
        if (!resp.success) {
            ElMessage.error(resp.errorMessage)
            return;
        }
        ElMessage.success({
            message: `Removed "${resp.data?.fileName}" from favorite`,
            grouping: true
        })
        critique.value.isFavorite = false
    })
}

function deleteFile() {
    if (!critique.value) {
        ElMessage.error("No file opened")
        return;
    }

    const request: DeleteFileRequest = {
        uuids: [critique.value.uuid]
    }
    $fetch<BaseResponse<Critique>>("/api/file", {
        method: "DELETE",
        body: request
    }).then(() => {
        ElMessage.success(`File "${critique.value?.fileName}" is deleted`)
        router.push("/dashboard")
    })
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

    const request: UpdateFileRequest = {
        uuid: critique.value.uuid,
        fileName: renamingTo.value
    }
    $fetch<BaseResponse<Critique>>("/api/file", {
        method: "PUT",
        body: request
    }).then(resp => {
        if (!critique.value) {
            ElMessage.error("No files")
            return;
        }
        if (!resp.success) {
            ElMessage.error(resp.errorMessage)
            return;
        }
        ElMessage.success(`Renamed to "${renamingTo.value}"`)
        critique.value.fileName = renamingTo.value;
        resetRenaming()
    })
}

// Editor

const frame = useTemplateRef<HTMLElement>("frame")
const editor = useTemplateRef<typeof CritiqueEditor>("editor")

function fixSelected() {
    editor.value!.menu.fixSelected()
}

function ignoreAll() {
    editor.value!.menu.ignoreAll()
}

function fixMatching() {
    editor.value!.menu.fixMatching()
}

function paste() {
    editor.value!.editor.commands.paste()
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

// summary view tabs
//TODO
const genericTabStatus = reactive({
    cards: false,
    analysis: false,
    summary: false,
    questions: false,
})

function allCards() {
    ElMessage.info("view all cards")
}

function allAnalysis() {
    ElMessage.info("view all analysis")
}

function allSummary() {
    ElMessage.info("view all summaries")
}

function allQuestions() {
    ElMessage.info("view all questions")
}

function viewCard(card: CritiqueCardFull) {
    ElMessage.info(`view card with title ${card.title}`)
}

function viewTag(tag: CritiqueTagFull) {
    ElMessage.info(`view tag with title ${tag.name}`)
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
                maxlength="50"
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

    <ContextMenu :scope="frame" v-if="frame !== null && viewMode === 'edit'">
        <ReviewContextMenu @fix-selected="fixSelected"
                           @fix-matching="fixMatching"
                           @paste="paste"
                           @ignore-all="ignoreAll"></ReviewContextMenu>
    </ContextMenu>

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
            <ContentWrapper ref="frame">
                <template #header>
                    <DocumentNav v-model:view-mode="viewMode"
                                 v-model:doc-active-tool="documentActiveTool"></DocumentNav>
                </template>
                <CritiqueViewer :html="critiqueStorage" v-if="viewMode === 'document'"></CritiqueViewer>
<!--                TODO: save edit changes-->
                <CritiqueEditor :html="critiqueStorage" v-else-if="viewMode === 'edit'" ref="editor"></CritiqueEditor>
                <CritiqueAnalysis :file="critique"
                                  v-else-if="critique && viewMode === 'summary'"
                                  @all-cards="allCards"
                                  @all-analysis="allAnalysis"
                                  @all-summary="allSummary"
                                  @all-questions="allQuestions"
                                  @view-card="viewCard"
                                  @view-tag="viewTag"
                                  :element-loading-background></CritiqueAnalysis>
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