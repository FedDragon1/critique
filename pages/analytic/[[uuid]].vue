<script setup lang="ts">
import AnalyticNav from "~/components/analytic/AnalyticNav.vue";
import {CollectionTag, Promotion, QuestionFilled, Tickets} from "@element-plus/icons-vue";
import PanelWrapper from "~/components/analytic/PanelWrapper.vue";
import NoFile from "~/components/analytic/NoFile.vue";
import ContentWrapper from "~/components/analytic/ContentWrapper.vue";
import {v4 as uuid} from 'uuid';
import ChatBox from "~/components/analytic/ChatBox.vue";
import MessageEntry from "~/components/analytic/MessageEnrty.vue";
import type {BaseResponse, ChatRequest, DeleteFileRequest} from "~/types/requests";
import CritiqueViewer from "~/components/editor/CritiqueViewer.vue";
import DocumentNav from "~/components/analytic/DocumentNav.vue";
import CritiqueEditor from "~/components/editor/CritiqueEditor.vue";
import ReviewContextMenu from "~/components/editor/ReviewContextMenu.vue";
import ContextMenu from "~/components/editor/ContextMenu.vue";
import CritiqueAnalysis from "~/components/analytic/CritiqueAnalysis.vue";
import useCritique, {TabHandler} from "~/composibles/useCritique";
import type {Ref} from "vue";
import TagTab from "~/components/analytic/tabs/TagTab.vue";
import CardTab from "~/components/analytic/tabs/CardTab.vue";
import AllTagsTab from "~/components/analytic/tabs/AllTagsTab.vue";
import AllCardsTab from "~/components/analytic/tabs/AllCardsTab.vue";
import {useFetchStream} from "~/composibles/useFetchStream";
import OpenAI from "openai";

definePageMeta({
    middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const fetchStream = useFetchStream()

const critiqueUuid = route.params.uuid as string
const critiqueResp = await useFetch<BaseResponse<CritiqueFull>>(`/api/file/${critiqueUuid}`)
const critique = ref<CritiqueFull | null>(critiqueResp?.data.value?.data as CritiqueFull || null)
const critiqueStorage = ref("")
const critiqueHandler = critique.value ? useCritique(critique as Ref<CritiqueFull>, ElMessage.error) : undefined

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

    critiqueHandler?.updateFileProperties((resp) => {
        ElMessage.success({
            message: `Added "${resp.fileName}" to favorite`,
            grouping: true
        })
    }, { favorite: true })
}

function unfavorite() {
    if (!critique.value) {
        ElMessage.error("No file opened")
        return;
    }

    critiqueHandler?.updateFileProperties((resp) => {
        ElMessage.success({
            message: `Removed "${resp.fileName}" to favorite`,
            grouping: true
        })
    }, { favorite: false })
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

    critiqueHandler?.updateFileProperties(() => {
        ElMessage.success({
            message: `Renamed to "${renamingTo.value}`,
            grouping: true
        })
        resetRenaming()
    }, {
        fileName: newName
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
const chatUuid = ref<string>()
const chatStream = ref<string[]>([])
const chatContent = computed(() => chatStream.value.join(''))
const panel = useTemplateRef<HTMLDivElement>('panel')

const conversation = ref<Message[]>([{
    uuid: uuid(),
    role: "assistant",
    content: "Hi, I'm Critique, an AI tool designed to enhance your critical reading skills. I don't have personal experiences or emotions, but I can help you analyze and evaluate texts, generate questions, and provide explanations based on what you’re reading. My goal is to assist you with understanding complex materials, improving your analytical skills, and making your reading experience more interactive and insightful. How can I help you today?"
}])

const reactiveConversation = computed<Message[]>(() => {
    if (!chatUuid.value) {
        return conversation.value
    }
    const newConversation: Message = {
        uuid: chatUuid.value,
        role: "assistant",
        content: chatContent.value
    }
    return [
        ...conversation.value,
        newConversation
    ]
})

function startScrolling() {
    if (!panel.value || !chatUuid.value) {
        return
    }
    panel.value.scrollTo(0, panel.value.scrollHeight)
    setTimeout(startScrolling, 100)
}

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

function messagesRequest(): ChatRequest {
    const messages = conversation.value.map(message => ({
        role: message.role,
        content: message.content
    }))
    return {
        messages
    }
}

function stopChat(chunk: OpenAI.Chat.Completions.ChatCompletionChunk.Choice) {
    if (chunk.finish_reason === 'stop') {
        return true
    }
    if (chunk.finish_reason === 'length') {
        ElMessage.error("Critique reached its length limit")
        return true
    }
    if (chunk.finish_reason === 'content_filter') {
        ElMessage.error("Critique generated something bad")
        return true
    }
    if (chunk.finish_reason) {
        ElMessage.error(`Error while generating: '${chunk.finish_reason}'`)
        return true
    }
    if (chunk.delta.content === null) {
        ElMessage.error("Received no content")
        return true
    }
    return false
}

async function chat(message: Message, postChat?: () => void): Promise<void> {
    conversation.value.push(message)

    chatUuid.value = uuid()

    const stream = await fetchStream<OpenAI.Chat.Completions.ChatCompletionChunk.Choice>("/api/critique/generate", {
        method: "POST",
        body: messagesRequest()
    })

    for await (const chunk of stream) {
        if (stopChat(chunk)) {
            break
        }
        chatStream.value.push(chunk.delta.content!)
    }

    const newChat: Message = {
        uuid: chatUuid.value,
        role: "assistant",
        content: chatContent.value
    }
    conversation.value.push(newChat)

    chatUuid.value = undefined
    chatStream.value = []
    postChat && postChat()
}

watch([chatUuid], startScrolling)

// summary view tabs

const tabHandler = ref(critiqueHandler!.tabHandler)

function mapComponent(tab: Tab) {
    switch (tab.type) {
        case "card":
            return CardTab
        case "tag":
            return TagTab
        case "generic":
            switch (tab.uuid) {
                case "summary":
                    return AllTagsTab
                case "analysis":
                    return AllTagsTab
                case "cards":
                    return AllCardsTab
                case "questions":
                    return AllTagsTab
                default:
                    // @ts-ignore
                    throw Error(`Unknown generic tab ${tab.uuid}`)
            }
        default:
            // @ts-ignore
            throw Error(`Unknown tab type ${tab.type}`)
    }
}

function allCards() {
    tabHandler.value.pushAllCardsTab()
}

function allAnalysis() {
    tabHandler.value.pushAllAnalysisTab()
}

function allSummary() {
    tabHandler.value.pushAllSummaryTab()
}

function allQuestions() {
    tabHandler.value.pushAllQuestionsTab()
}

function viewCard(card: CritiqueCardFull) {
    tabHandler.value.pushCardTab(card)
}

function viewTag(tag: CritiqueTagFull) {
    tabHandler.value.pushTagTab(tag)
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
                                 :tab-handler="tabHandler as TabHandler"
                                 v-model:doc-active-tool="documentActiveTool"></DocumentNav>
                </template>
                <CritiqueViewer :html="critiqueStorage" v-if="viewMode === 'document'"></CritiqueViewer>
<!--                TODO: save edit changes-->
                <CritiqueEditor :html="critiqueStorage" v-else-if="viewMode === 'edit'" ref="editor"></CritiqueEditor>
                <KeepAlive>
                    <CritiqueAnalysis :file="critique"
                                      v-if="critique && viewMode === 'summary' && tabHandler.on === -1"
                                      @all-cards="allCards"
                                      @all-analysis="allAnalysis"
                                      @all-summary="allSummary"
                                      @all-questions="allQuestions"
                                      @view-card="viewCard"
                                      @view-tag="viewTag"></CritiqueAnalysis>
                </KeepAlive>
                <template v-for="[i, tab] in tabHandler.tabs.entries()" :key="i">
                    <component v-if="tabHandler.on === i"
                               @close="() => tabHandler.removeByIndex(i)"
                               @view-card="viewCard"
                               @view-tag="viewTag"
                               :tab="tab"
                               :is="mapComponent(tab)" />
                </template>

            </ContentWrapper>
            <PanelWrapper :quick-actions="quickActions"
                          :disabled="viewMode !== 'document'"
                          :post-drag="textareaReflow" v-slot="slotProps">
                <div class="panel-message-wrapper" ref="panel">
                    <MessageEntry v-for="message in reactiveConversation" :key="message.uuid" :message="message"></MessageEntry>
                </div>
                <ChatBox :dragging-panel="slotProps.draggingPanel"
                         :disabled="viewMode === 'edit'"
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