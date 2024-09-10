<script setup lang="ts">
import AnalyticNav from "~/components/analytic/AnalyticNav.vue";
import type {Critique} from "~/types/requests";
import {CollectionTag, Promotion, QuestionFilled, Tickets} from "@element-plus/icons-vue";
import type {QuickActions, Message} from "~/types/critique";
import PanelWrapper from "~/components/analytic/PanelWrapper.vue";
import NoFile from "~/components/analytic/NoFile.vue";
import ContentWrapper from "~/components/analytic/ContentWrapper.vue";

const route = useRoute()

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
  // TODO
}

function pasteText() {
  // TODO
}

// Conversations
const prompt = ref<string>("");
const promptDom = ref<HTMLTextAreaElement>();
const generating = ref(false)

watchEffect(() => {
    prompt.value
    promptDom.value
    textareaReflow()
})

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

function messageUuid() {
  return Math.round(Math.random() * 1_000_000)
}

const conversation = ref<Message[]>([{
  uuid: messageUuid(),
  from: "critique",
  content: "Hi, I'm Critique, an AI tool designed to enhance your critical reading skills. I don't have personal experiences or emotions, but I can help you analyze and evaluate texts, generate questions, and provide explanations based on what you’re reading. My goal is to assist you with understanding complex materials, improving your analytical skills, and making your reading experience more interactive and insightful. How can I help you today?"
}])

function promptToHTML() {
  const segments = prompt.value.split("\n").map(
      s => `<p class="wrap no-margin">${s}</p>`
  );
  const joined = segments.join("<br>")

  return `${joined}`
}

// TODO: call backend api
function sendMessage() {
  conversation.value.push({
    uuid: messageUuid(),
    from: "user",
    content: promptToHTML()
  })

  prompt.value = ""
  generating.value = true
  setTimeout(textareaReflow, 0)

  setTimeout(() => {
    conversation.value.push({
      uuid: messageUuid(),
      from: "critique",
      content: "This is an auto-response"
    })

    generating.value = false
  }, 2000)
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

  <DashboardFrame activate="/analytic" padding="0px" style="display: flex;
  flex-direction: column;">
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
          <div class="panel-message-entry"
               v-for="message in conversation"
               :class="{ 'panel-message-entry-critique': message.from === 'critique' }"
               :key="message.uuid">
            <div class="critique-pfp" v-if="message.from === 'critique'">
              <img alt="critique"
                   src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAYAAACN1PRVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAANGSURBVHgBnZZNSFRRFMfPuW+cmaJFGfQhQUHQhzVj6hh9WDmYw/gF2rIgsl20ahMkoQuZsVW0CVqU5EYiglYzQuKoiKSSaQoRWlhgUQtDSLLJ9+7p3MnRGX2Md+a/mPvufeee35xzz3nvIWSh5d7IeVPKagThQ6LDBLRHrSPgHAHOIslBi8zo1mDjqN1+1IHEeyKXJdEtNvbp2CPCe7Aw5ArWdmnDliKR/ZgHnQB0AXIQATyDvOU7W/yNn9VcZDLGbXlOTpUHchSn+pRbsosVZYS5LwRmhGX4Of55yBYEMOtyiAqsrP2SspauoUBgFzitl1JC07lo77Rai3d3e8kwu9m8ADSkQE4D/akgpQ2RYZ5s5d8ziNjfV1N1Qq25qqsneahgL18hR9DKvTW9bggekKY5u7pA8JOr8HQywkWO0GFYMb7cmS1oY2SWdXfd7nwhsG+wpvKQmm7jCF2Ifr6czxaUBqPWVsFRNNrYFAiDgXWBooTTqtopiNNp1cjZgNJgoxPDZ3nIt7UiKDBAxpJAd339DEnDzzU9zw2sBUqDmdI8msmQHecbKKMjDf9T6g4GPwpOqVPogdJgRGLfZsbEEZomV2ldxRE1d3FKdUFpMHbl1tyz10lGF2k+V21hAvCPzgZVDLhE9ZjIbI4wQjm3mbECkZT+M7FYorlDxceutvm8h0FTqzCLHBOgATobjSXOKFTiuUbCeIoEA+2+omLICrYYf8seF2ytCKZlHMuToHCp9wa/tDow8eqC3dyfvTrAVZi/v98kko/AJiIgGSjv6fmWiKiMIwJ4COkFssMiGQ2Xeo5owZQcv+EBD0upoPWpA4kdYFOJ/ETZIwH6wsWFhaADOxWL/eCU3VfX3FPTqaC2Ek+TSh1kKPkEUDiGQqXekk1hSovLop0PPQJ/cS0in+cmPy2egEZvscF2TnNvqKzwhM29zAr5jl8HEo91bNMd03ce/M1jUx/W1jIoXFZ0iSS9gCxBSXGEC9JBF1tGpsbUPOM3iHTACG/phFxF+NyK//qUnGr943CJ54oEvM1N5dWx5+oa4HNvbR6fGkhdzio9904eKzJNo0EIKifCfbz5IKdqWZ0PSZgEIYYthFctb96N2+3/B38BUYfm1GsgAAAAAElFTkSuQmCC">
            </div>
            <div class="panel-message-entry-data" v-html="message.content"></div>
          </div>
        </div>
        <div class="panel-message-box">
          <el-icon size="1.2rem">
            <el-icon-circle-plus></el-icon-circle-plus>
          </el-icon>
          <textarea class="panel-message-input"
                    placeholder="Chat to the critique bot"
                    :class="{ 'no-select': slotProps.draggingPanel }"
                    :readonly="slotProps.draggingPanel"
                    v-model="prompt"
                    ref="promptDom"
                    maxlength="2000" />
          <el-icon size="1.2rem" @click="sendMessage" v-if="!generating">
            <el-icon-promotion></el-icon-promotion>
          </el-icon>
          <el-icon size="1.2rem" v-else>
            <el-icon-loading class="spin"></el-icon-loading>
          </el-icon>
        </div>
      </PanelWrapper>
    </main>
    <NoFile v-else @upload="uploadFile" @paste="pasteText"></NoFile>
  </DashboardFrame>
</template>

<style scoped>
.panel-message-entry:not(.panel-message-entry-critique) {
  display: flex;
  flex-direction: row-reverse;
}

.panel-message-entry:not(.panel-message-entry-critique) .panel-message-entry-data {
  width: auto;
  max-width: 80%;
  white-space: wrap;
  padding: 20px;
  background: var(--el-border-color-lighter);
  border-radius: var(--el-border-radius-round) var(--el-border-radius-round) 0 var(--el-border-radius-round);
}

.panel-message-box i {
  color: var(--el-text-color-secondary);
  transition: color 0.2s ease-in-out;
}

.panel-message-box:has(.panel-message-input:focus) i {
  color: var(--el-text-color);
}

.panel-message-box i:hover {
  color: var(--el-color-primary) !important;
}

.panel-message-wrapper {
  flex-grow: 999;
  min-height: 0;
  overflow-y: auto;
}

.panel-message-input {
  font-family: var(--el-font-family), sans-serif;
  border: none;
  flex-grow: 999;
  resize: none;
  height: 1rem;
  max-height: 200px;
  overflow-y: hidden;
}

.panel-message-input:focus {
  outline: none;
}

.panel-message-box:has(.panel-message-input:focus) {
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

.panel-message-entry {
  display: flex;
  flex-direction: row;
  padding: 10px;
  gap: 20px;
  width: 95%;
  line-height: 1.8rem;
}

.panel-message-entry.panel-message-entry-critique > .panel-message-entry-data {
  margin-top: 8px;
}

.critique-pfp {
  border: var(--el-border);
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: var(--el-border-radius-circle);
  flex-shrink: 0;
}

.critique-pfp > img {
  translate: -2px 0;
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