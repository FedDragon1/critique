<script setup lang="ts">
import {useFileStore} from "~/stores/fileStore";
import CritiqueEditor from "~/components/editor/CritiqueEditor.vue";
import EditorUnavailable from "~/components/editor/EditorUnavailable.vue";
import ForfeitDialog from "~/components/uploading/ForfeitDialog.vue";
import DashboardFrame from "~/components/dashboard/DashboardFrame.vue";
import ContextMenu from "~/components/editor/ContextMenu.vue";
import ReviewContextMenu from "~/components/editor/ReviewContextMenu.vue";
import type {BaseResponse, NewFileRequest} from "~/types/requests";

definePageMeta({
    middleware: 'auth'
})

const fileStore = useFileStore()
const router = useRouter()
const route = useRoute()

const timeout = ref(false)
const returning = ref(false)
const frame = useTemplateRef<HTMLDivElement>("frame")
const editor = useTemplateRef<typeof CritiqueEditor>("editor")

const uploading = ref(false)
const fileName = ref("")
const fileNameError = ref("")

function toDashboard() {
    fileStore.setOcrResult("")
    router.push("/")
}

function validateFileName() {
    if (!fileName.value.trim().length) {
        fileNameError.value = "File name cannot be empty"
        return false;
    }
    if (fileName.value.length > 50) {
        fileNameError.value = "File name must be less than 50 letters"
        return false;
    }
    fileNameError.value = ""
    return true;
}

/**
 * Ask the user of file name, then upload the file to database
 */
function uploadCritique() {
    if (!validateFileName()) {
        return;
    }

    // assume the user has corrected all low
    ignoreAll()

    const content = editor.value!.editor.getHTML()
    console.log("create critique")

    const message = ElMessage.info({
        message: "Uploading file",
        duration: 0
    })

    // TODO preview for the file
    const request: NewFileRequest = {
        fileName: fileName.value,
        dataMarkUp: content,
    }
    $fetch<BaseResponse<Critique>>("/api/file", {
        method: "POST",
        body: request
    }).then(resp => {
        if (!resp.success) {
            ElMessage.error(resp.errorMessage)
            return;
        }
        ElMessage.success("File created")
        router.push(`/analytic/${resp.data?.uuid}`)
    }).finally(() => message.close())
}

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

onMounted(() => setTimeout(() => timeout.value = true, 5000))
</script>

<template>
    <el-dialog
        v-model="uploading"
        title="Edit"
        width="500"
        :before-close="() => uploading = false"
    >
        <template v-if="uploading">
            <span style="line-height: 2rem">What do you want to name the file?</span>
            <br>
            <el-input
                maxlength="50"
                placeholder="New file name"
                v-model="fileName"></el-input>
            <el-text type="danger">{{ fileNameError }}</el-text>
        </template>
        <template v-else>
            Operation complete.
        </template>

        <template #footer>
            <div class="dialog-footer">
                <el-button @click="uploading = false">Cancel</el-button>
                <el-button type="primary" @click="uploadCritique">
                    Confirm
                </el-button>
            </div>
        </template>
    </el-dialog>

    <DashboardFrame activate="/analytic"
                    padding="0px"
                    style="display: flex; flex-direction: column; overflow: hidden">
        <UploadingNav @return="() => returning = true"
                      @continue="() => uploading = true"
                      title="New Critique File"></UploadingNav>
        <div class="content-wrapper" ref="frame">
            <CritiqueEditor v-if="fileStore.ocrResult || timeout || route.query.new"
                            ref="editor"
                            :html="fileStore.ocrResult"/>
            <EditorUnavailable v-else />
        </div>

        <ForfeitDialog :returning="returning"
                       :before-close="() => returning = false"
                       @confirm="toDashboard"
                       @cancel="() => returning = false"/>
    </DashboardFrame>
    <ContextMenu :scope="frame" v-if="frame !== null">
        <ReviewContextMenu @fix-selected="fixSelected"
                           @fix-matching="fixMatching"
                           @paste="paste"
                           @ignore-all="ignoreAll"></ReviewContextMenu>
    </ContextMenu>
</template>

<style scoped>
.content-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    overflow-y: auto;
}
</style>