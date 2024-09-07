<script setup lang="ts">
import AnalyticNav from "~/components/analytic/AnalyticNav.vue";
import type {Critique} from "~/types/requests";
import {Promotion, QuestionFilled, Tickets} from "@element-plus/icons-vue";
import type {QuickActions} from "~/types/critique";
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

const quickActions: QuickActions = {
  'annotate': {
    icon: Promotion,
    caption: "Annotate Selection",
    handler: annotateSelection
  },
  'summarize': {
    icon: Tickets,
    caption: "Summarize Selection",
    handler: summarizeSelection
  },
  'questions': {
    icon: QuestionFilled,
    caption: "Critical Questions",
    handler: generateQuestions
  }
}

function uploadFile() {
  // TODO
}

function pasteText() {
  // TODO
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
      <PanelWrapper :quick-actions="quickActions">
        <!--          TODO-->
        <div>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci aliquid architecto aspernatur
          atque,
          consectetur, consequuntur cum cupiditate dignissimos doloremque dolores dolorum esse eveniet obcaecati
          odit
          officiis sed totam unde voluptate?
        </div>
        <div>Aperiam asperiores blanditiis consequatur debitis deserunt dignissimos doloribus ea eum excepturi
          facere
          illo inventore ipsum iste labore minus, nam, neque nesciunt nihil nostrum porro rem sapiente sint sit
          unde
          velit.
        </div>
        <div>Aperiam blanditiis, earum error esse iure molestiae nam neque quisquam quod sed! Alias distinctio
          quisquam
          velit. Ad alias enim illum nisi provident voluptate. Asperiores inventore iure laborum reprehenderit
          sequi
          tempore?
        </div>
        <div>Autem, ratione, reprehenderit. Accusamus animi asperiores eaque, eligendi facere molestiae molestias
          nulla
          quaerat repellat tempore? Aspernatur consequuntur culpa eaque labore natus nulla, pariatur perferendis,
          quasi
          ratione repellendus reprehenderit rerum vel!
        </div>
        <div>A ab aliquam animi consequatur, deleniti dicta dolorem doloribus enim eveniet exercitationem facilis
          harum
          illum incidunt laudantium maiores molestiae odit officiis optio pariatur perspiciatis rem soluta sunt
          totam
          voluptas voluptatum.
        </div>
      </PanelWrapper>
    </main>
    <NoFile v-else @upload="uploadFile" @paste="pasteText"></NoFile>
  </DashboardFrame>
</template>

<style scoped>
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