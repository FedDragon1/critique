<script setup lang="ts">
import {useFileStore} from "~/stores/fileStore";
import CritiqueEditor from "~/components/editor/CritiqueEditor.vue";
import EditorUnavailable from "~/components/editor/EditorUnavailable.vue";
import ForfeitDialog from "~/components/uploading/ForfeitDialog.vue";
import DashboardFrame from "~/components/dashboard/DashboardFrame.vue";
import ContextMenu from "~/components/editor/ContextMenu.vue";
import ReviewContextMenu from "~/components/editor/ReviewContextMenu.vue";

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

function toDashboard() {
    fileStore.setOcrResult("")
    router.push("/")
}

function uploadCritique() {
    console.log("create critique")
    // TODO
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
    <DashboardFrame activate="/analytic"
                    padding="0px"
                    style="display: flex; flex-direction: column; overflow: hidden">
        <UploadingNav @return="() => returning = true"
                      @continue="uploadCritique"
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