<script setup lang="ts">
import AnalyticNav from "~/components/analytic/AnalyticNav.vue";
import type {Critique} from "~/types/requests";
import {Edit, Position} from "@element-plus/icons-vue";

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

function toPercentage(x: number) {
  return Math.round(x * 100)
}

const documentTools = {
  'selector': [Position, 'Selector'],
  'edit': [Edit, 'Edit Text'],
} as const
const controls = {
  'Show/Hide all critiques': 'Ctrl+H',
  'Show/Hide all summaries': 'Ctrl+Shift+H'
}
const viewModeDisplay = {
  'document': 'Document View',
  'summary': 'Summary View'
} as const

const viewMode = ref<keyof typeof viewModeDisplay>("document")
const documentActiveTool = ref<keyof typeof documentTools>("selector")
const currentZoom = ref(1)
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
      <span>Are you sure you want to delete "{{critique.fileName}}"?</span>
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


      <div class="content">
        <nav>
          <div class="view-selector">
            {{ viewModeDisplay[viewMode] }}
            <el-dropdown>
              <el-icon><el-icon-arrow-down></el-icon-arrow-down></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="(display, view) in viewModeDisplay"
                                    @click="viewMode = view"
                                    :key="view">{{ display }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div v-if="viewMode === 'document'" class="document-controls">
            <div class="document-tool">
              <div class="document-tool-item"
                   v-for="(value, key) in documentTools"
                   :key="key"
                   @click="documentActiveTool = key"
                   :class="{'document-tool-selected': documentActiveTool === key}">
                <el-icon size="1.5rem"><component :is="value[0]"></component></el-icon>
                <span>{{ value[1] }}</span>
              </div>
            </div>
            <div class="document-view">
              <span class="document-zoom">{{ toPercentage(currentZoom) }}%</span>
              <el-dropdown placement="bottom-end">
                <el-icon size="1.8rem">
                  <el-icon-expand class="hover-color"></el-icon-expand>
                </el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :key="control"
                                      v-for="(hotkey, control) in controls">
                      <div class="document-control-container">
                        <span class="document-control-option">{{ control }}</span>
                        <span class="document-control-hotkey">{{ hotkey }}</span>
                      </div>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          <div v-else class="summary-tabs">
<!--TODO-->
          </div>
        </nav>
        {{ critiqueUuid }}
        {{ critique }}
      </div>
      <div class="panel">

      </div>

    </main>
    <main v-else class="no-file">
      <div class="file-upload block">
        <img alt="upload" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAABSCAYAAAARiVn+AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAMiSURBVHgB7Zy7axRRGMXPaIwvTFR8gagrRFGDFipYhCBoxEIEEQRjoZVWghIsBSOIVv4BKvFR2NgJEcSgaRKxEUHExhdIithoihTBB+O5jPER3c3s2Z39HOb7weEmu3P37vyS+5pZNkKNxHHcxWIA+eILcyiKorsQmIFiMou5wz/4AQgUVVqgmemjuN2okiJLCyxmblNcZzWVii4tsJzpp7gdaSu4tIQW5j7FbU1zsEv7xUJmgOK2THegS/uTMMY9pLj2Sge5tL9ZwjyiuFK5A1zav1nGDJYT59LKU2KGKK5t6hMurTIrkXTVdb8/6NKmZxXzgOLWTD7QxF9Op6j4lbnJDe44ikkJyXJkFx2MRPwhTlFpglnLCqNTn8jpVQ6V18we757VESaFQZdWPSVracPMZqaVmVtjwmp+L/MGGdMEOx4znRwn04ypaQjjbpjlOli+QyIyEyz/087XUdhP+JofWNxChlhKG0F2jCJDLKVtRHa0IUMspZ3j+NOKOsPX3MRiPzLEciIIs+YTnuQZJDPeBGpjPrOTuYBkNs4MS2mBDUw/coYvbgVcmoBLE3BpAi5NwHr2DHxkXiK50NkIFiBZ7jRDxFJa2HeeZS5lsQet2HAcz2HRxxyBgGX3vE5ZFxstLMA2w0L6GPMCApbSbsAQigvDgXQ1xFLaJ9gjbd0spe2DPR0QsJTWwwF5PYxg290sDkPAcvZcwTzjm7/G8j3zDY1hJrON6YaI9TptHnMKOcN3BAIuTcClCbg0AZcmYD17Tm5lXqFxhHMOH30/CBFLaWNMF/eAT2EA14cnWFyBgGX37LUSFmDbV1ncg4CltGHYI90+tJT2Gfa0QMBS2nEYwjEtYnEUApbSTvKN98AAthv2vOHjC+1CdfMlx2WeQNiwP0fjbqzMZrYzSyHyP9yNWv0jucF3BAIuTcClCbg0AZcm4NIEXJqASxNwaQIuTcClCbg0AZcm4NIEXJpAPa6nvWV6USBq/oqJIuLdU8ClCbg0AZcm4NIE0s6e4Z7kEPLJOGf9un4RQFppeWaM0hahjnj3FHBpAi5NwKUJuDSB7xSewOx66mW8AAAAAElFTkSuQmCC" />
        <span>File Upload</span>
      </div>
      <div class="paste-text block">
        <img alt="from text" src="data:image/png;base64,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">
        <span>Paste Text</span>
      </div>
    </main>
  </DashboardFrame>
</template>

<style scoped>
.hover-color {
  color: var(--el-text-color);
  transition: color 0.2s ease-in-out;
}

.hover-color:hover {
  color: var(--el-color-danger);
}

.document-view {
  display: flex;
  gap: 10px;
  align-items: center;
}

.document-tool-selected {
  background: var(--el-color-danger);
  color: var(--el-color-white)
}

.document-tool {
  display: flex;
  height: 100%;
}

.document-tool-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 15px 0 10px;
}

.document-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-grow: 999;
}

.view-selector {
  display: flex;
  align-items: center;
  gap: 4px;
}

nav {
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid var(--el-border-color);
  padding: 0 15px;
  gap: 5px;
  height: 40px;
}

.document-control-hotkey {
  color: var(--el-text-color-secondary)
}

.document-control-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
}

main {
  flex-grow: 9999;
}

.no-file {
  display: flex;
  flex-direction: row;
  gap: 150px;
  width: 100%;
  align-items: center;
  justify-content: center;
}

.paste-text {
  border: 1px solid var(--el-color-danger);
  color: var(--el-color-danger);
  background: white;
}

.file-upload {
  background: var(--el-color-danger);
  color: white;
}

.block {
  display: flex;
  flex-direction: column;
  width: 200px;
  height: 200px;
  align-items: center;
  justify-content: center;
  gap: 20px;
  transition: 0.2s ease-out filter;
}

.block:hover {
  filter: drop-shadow(10px 10px 10px var(--el-color-danger));
}

.block > img {
  width: 60px;
}
</style>