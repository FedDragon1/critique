<script setup lang="ts">
import {useFileStore} from "~/stores/fileStore";
import CritiqueEditor from "~/components/editor/CritiqueEditor.vue";
import EditorUnavailable from "~/components/editor/EditorUnavailable.vue";
import ForfeitDialog from "~/components/uploading/ForfeitDialog.vue";

const fileStore = useFileStore()
const router = useRouter()

const timeout = ref(false)
const returning = ref(false)

function toDashboard() {
    fileStore.setOcrResult("")
    router.push("/")
}

function uploadCritique() {
    console.log("create critique")
    // TODO
}

onMounted(() => setTimeout(() => timeout.value = true, 5000))
</script>

<template>
    <DashboardFrame activate="/analytic" padding="0px" style="display: flex; flex-direction: column;">
        <UploadingNav @return="() => returning = true"
                      @continue="uploadCritique"
                      title="New Critique File"></UploadingNav>
        <CritiqueEditor v-if="fileStore.ocrResult || timeout" :html="fileStore.ocrResult"/>
        <EditorUnavailable v-else />

        <ForfeitDialog :returning="returning"
                       :before-close="() => returning = false"
                       @confirm="toDashboard"
                       @cancel="() => returning = false"/>
    </DashboardFrame>
</template>

<style scoped>

</style>