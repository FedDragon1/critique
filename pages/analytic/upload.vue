<script setup lang="ts">

import ImageUploader from "~/components/uploading/ImageUploader.vue";
import {throttle} from "lodash-es";
import {useFileStore} from "~/stores/fileStore";

const returning = ref(false)
const cleanUpSignal = ref<() => any | undefined>()
const imageLength = ref(0)

const router = useRouter()
const fileStore = useFileStore()

function returnGuard() {
  if (imageLength.value === 0) {
    router.push("/")
    return
  }
  returning.value = true
}

function cleanUp(fn: () => void) {
  cleanUpSignal.value = (void 0)
  returning.value = false
  fn()
}

async function getOcr() {
  const ocrResult = await $fetch("/api/image/ocr", {
    method: "POST",
    body: "123"
  });
  fileStore.setOcrResult(ocrResult.data as unknown as OcrResult)
}

function continueReviewRaw() {
  if (imageLength.value === 0) {
    ElMessage.error("No images")
    return
  }
  getOcr().then(cleanUpSignal.value = () => router.push('/analytic/review'))
}

const continueReview = throttle(continueReviewRaw, 2000)
</script>

<template>
<DashboardFrame activate="/analytic" padding="0px" style="display: flex; flex-direction: column;">
  <UploadingNav title="New Critique File" @return="returnGuard"
                @continue="continueReview"></UploadingNav>
  <div class="page-wrapper">
    <div class="frame">
      <ImageUploader @image-change="(i) => imageLength = i"
                     @cleaned-up="cleanUp"
                     :clean-up-signal="cleanUpSignal"
                     class="upload-wrapper"/>
    </div>
  </div>
  <el-dialog v-model="returning"
             title="Warning"
             width="500"
             :before-close="() => returning = false">
    <span>Are you sure you want to discard this file?</span><br>
    <span>You cannot undo this operation.</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="returning = false">Cancel</el-button>
        <el-button @click="cleanUpSignal = () => router.push('/')" type="danger">Confirm</el-button>
      </div>
    </template>
  </el-dialog>

</DashboardFrame>
</template>

<style scoped>
.upload-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
  max-width: 950px;
}

.frame {
  flex-grow: 9999;
  height: 100%;
}

.page-wrapper {
  flex-grow: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>