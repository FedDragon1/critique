<script setup lang="ts">
import ImageUploader from "~/components/uploading/ImageUploader.vue";
import {throttle} from "lodash-es";
import {useTesseract} from "~/composibles/useTesseract";
import ForfeitDialog from "~/components/uploading/ForfeitDialog.vue";
import {useUploader} from "~/composibles/useUploader";

definePageMeta({
    middleware: 'auth'
})

const imageUploader = useTemplateRef<typeof ImageUploader>("imageUploader")

const returning = ref(false)
const imageLength = ref(0)
const uploading = ref(false)
const uploadingStatus = ref("Uploading...")

const router = useRouter()
const tesseract = await useTesseract(5)
const uploader = useUploader(uploadingStatus, tesseract)

function returnGuard() {
    if (imageLength.value === 0) {
        router.push("/")
        return
    }
    returning.value = true
}

function continueReviewRaw() {
    if (imageLength.value === 0) {
        ElMessage.error("No images")
        return
    }

    uploading.value = true
    const closer = ElMessage.info({
        message: () => h('span', { style: 'color: var(--el-color-info); font-size: 14px' }, uploadingStatus.value),
        plain: true,
        duration: 0
    })

    uploader.uploadImages(imageUploader).then(() => {
        imageUploader.value?.clearImages()
        router.push('/analytic/review')
    }).catch(e => {
        ElMessage.error((e as unknown as Error).message)
    }).finally(() => {
        closer.close()
        uploading.value = false
    })
}

function forfeit() {
    imageUploader.value?.clearImages()
    returning.value = false
    router.push("/")
}

const continueReview = throttle(continueReviewRaw, 2000)
</script>

<template>
    <DashboardFrame activate="/analytic" padding="0px" style="display: flex; flex-direction: column;">
        <UploadingNav title="New Critique File" @return="returnGuard"
                      @continue="continueReview" :disabled="uploading" ></UploadingNav>
        <div class="page-wrapper">
            <div class="frame">
                <ImageUploader @image-change="(i) => imageLength = i"
                               @uploading="uploading = true"
                               :disabled="uploading"
                               ref="imageUploader"
                               class="upload-wrapper"/>
            </div>
        </div>
        <ForfeitDialog :before-close="() => returning = false"
                       :returning="returning"
                       @cancel="returning = false"
                       @confirm="forfeit" />
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