<script setup lang="ts">
import UploadImage from "~/components/uploading/UploadImage.vue";
import ImageSingle from "~/components/uploading/ImageSingle.vue";
import UploadButton from "~/components/uploading/UploadButton.vue";
import {ImgProxy} from "~/composibles/useCanvas";
import type {FourPoints} from "~/types/cvtypes";
import {useFileStore} from "~/stores/fileStore";
import useMarkdown from "~/composibles/useMarkdown";
import usePdf from "~/composibles/usePdf";
import {formatting} from "~/composibles/useUploader";

defineProps<{
    disabled?: boolean
}>()
const emit = defineEmits(["imageChange", "cleanedUp"])

function useUploadRef(value: any) {
    return customRef((track: () => void, trigger: () => void) => {
        return {
            get() {
                track()
                return value
            },
            set(newValue) {
                trigger()

                // filter the newValue
                if (!Array.isArray(newValue)) {
                    return;
                }

                const filtered = newValue.filter(p => p.constructor === ImgProxy)
                if (filtered.length === value.length && filtered.map((p, i) => p.image === value[i].image).reduce((a, b) => a && b, true)) {
                    // the array did not change after removing invalid elements
                    return;
                }
                value = filtered
            }
        }
    })
}

const attrs = useAttrs();
const images = useUploadRef([])
const contours = useTemplateRef("contours")
const status = ref("")
const tempImage = ref<string>()
const switching = ref()
const currentSlide = ref(0)
const fileStore = useFileStore()
const router = useRouter()
const { readPdf, revisePdf, mergePages } = usePdf()

const wordMime = [
    "application/msword",                                                           // .doc .dot
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",      // .docx
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template",      // .dotx
    "application/vnd.ms-word.document.macroEnabled.12",                             // .docm
    "application/vnd.ms-word.template.macroEnabled.12"                              // .dotm
]

const handleWord = (file: File) => {

}

const handlePdf = (file: File) => {
    const reader = new FileReader()
    reader.readAsArrayBuffer(file)

    status.value = "Uploading File"
    const closer = ElMessage.info({
        message: () => h('span', { style: 'color: var(--el-color-info); font-size: 14px' }, status.value),
        plain: true,
        duration: 0
    })

    reader.onload = () => {
        if (!(reader.result instanceof ArrayBuffer)) {
            ElMessage.error("Error while reading the file!")
            throw Error(`Type mismatch while reading text file, expected string, received ${typeof reader.result}`)
        }

        const data = new Uint8Array(reader.result)
        readPdf(data)
            .then((d) => revisePdf(d, status))
            .then((d) => mergePages(d, status))
            .then((d) => formatting(d, status))
            .then((s) => {
                fileStore.setOcrResult(s)
                router.push("/analytic/review")
            })
            .catch((e) => ElMessage.error(e.message))
            .finally(closer.close)
    }
}

const handleText = (file: File) => {
    const reader = new FileReader()
    reader.readAsText(file)

    reader.onload = () => {
        if (typeof reader.result !== "string") {
            ElMessage.error("Error while reading the file!")
            throw Error(`Type mismatch while reading text file, expected string, received ${typeof reader.result}`)
        }
        const messageHtml = useMarkdown(reader.result)
        fileStore.setOcrResult(messageHtml ?? reader.result)
        router.push("/analytic/review")
    }
}

const storeFile = (file: File) => {
    if (file.type.split("/")[0] === "image") {
        storeImage(file)
        return
    }

    if (tempImage.value) {
        ElMessage.error(`Only images are permitted when images are uploaded. Got type ${file.type}`)
        return
    }

    if (wordMime.includes(file.type)) {
        handleWord(file)
        return
    }

    if (file.type === "application/pdf") {
        handlePdf(file)
        return
    }

    if (file.type.split("/")[0] === "text") {
        handleText(file)
        return
    }

    console.log(file)
}

const storeImage = (file: File) => {
    if (tempImage.value) {
        ElMessage.error("Please wait for the current image to be uploaded")
        return
    }
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = () => {
        tempImage.value = (reader.result as string).split(',')[1]
    }
}

const submitted = (resp: any) => {
    if (!tempImage.value) {
        if (resp.success) {
            throw TypeError("No file is found")
        }
        return  // not image
    }
    images.value = [...images.value, new ImgProxy(tempImage.value!, resp.data.png, images.value.length)]
    tempImage.value = undefined
    currentSlide.value = images.value.length - 1
}

function switchImage(resp: any) {
    if (!tempImage.value) {
        throw TypeError("No file is found")
    }
    const newValue = [...images.value]
    newValue[switching.value] = new ImgProxy(tempImage.value!, resp.data.png, switching.value)
    images.value = newValue
    tempImage.value = undefined
    currentSlide.value = switching.value
}

function handlePreview(p: any) {
    const img = p as ImgProxy
    currentSlide.value = img.index
}

function handleRemove() {
    images.value = images.value.forEach((p: ImgProxy, i: number) => p.index = i)
    currentSlide.value = Math.min(currentSlide.value, images.value.length ?? 0)
}

function handleDelete() {
    const firstHalf = images.value.slice(0, currentSlide.value)
    const secondHalf = images.value.slice(currentSlide.value + 1)
    secondHalf.forEach((p: ImgProxy) => p.index--)
    images.value = [...firstHalf, ...secondHalf]
    currentSlide.value = Math.min(currentSlide.value, images.value.length ?? 0)
}

function clearImages() {
    images.value = []
    currentSlide.value = 0
}

function* items() {
    for (let i = 0; i < images.value.length; i++) {
        const image = images.value[i]
        const contour = (contours.value as { fourPoints: FourPoints }[])[i].fourPoints
        yield {
            ...image,
            contour
        }
    }
}

watch(images, () => emit("imageChange", images.value.length ?? 0))

defineExpose({
    items,
    clearImages
})
</script>

<template>
    <div class="upload" v-bind="attrs">
        <div class="gallery">
            <el-button class="move-page" :disabled="currentSlide === 0" @click="currentSlide--">
                <el-icon>
                    <el-icon-ArrowLeftBold/>
                </el-icon>
            </el-button>
            <div class="gallery-inner">
                <template v-for="({image, canny, hash}, i) in images" :key="`${hash}`">
                    <KeepAlive>
                        <ImageSingle
                            v-show="currentSlide === i"
                            ref="contours"
                            class="image"
                            :image="image"
                            :canny="canny"></ImageSingle>
                    </KeepAlive>
                </template>
                <KeepAlive>
                    <UploadImage @success="submitted"
                                 @upload="storeFile"
                                 :disabled="disabled"
                                 v-if="currentSlide === images.length"></UploadImage>
                </KeepAlive>

                <div class="footer" :style="{ justifyContent: currentSlide === images.length ? 'center' : '' }">
          <span v-if="currentSlide !== images.length">
            <em>{{ currentSlide + 1 }}</em> of {{ images.length }} Picture(s)
          </span>
                    <div class="preview">
                        <el-upload
                            :disabled="disabled ?? false"
                            v-model:file-list="images"
                            action="/api/image/scan"
                            list-type="picture-card"
                            :on-success="submitted"
                            :before-upload="storeFile"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove">
                            <el-icon>
                                <el-icon-Plus/>
                            </el-icon>
                        </el-upload>
                    </div>
                    <div class="operations" v-if="currentSlide !== images.length">
                        <el-button class="delete" plain @click="handleDelete">
                            <el-icon>
                                <el-icon-Delete/>
                            </el-icon>
                        </el-button>
                        <UploadButton @success="switchImage" @upload="(f) => {switching = currentSlide; storeFile(f)}">
                            <el-icon>
                                <el-icon-Switch/>
                            </el-icon>
                        </UploadButton>
                    </div>
                </div>
            </div>
            <el-button class="move-page"
                       :disabled="currentSlide === images.length" @click="currentSlide++">
                <el-icon>
                    <el-icon-ArrowRightBold/>
                </el-icon>
            </el-button>
        </div>
    </div>
</template>

<style scoped>
/*noinspection CssUnusedSymbol*/
:deep(.el-upload-list--picture-card .el-upload-list__item-thumbnail) {
    object-fit: cover !important;
}

.upload {
    flex-grow: 999;
    width: 700px;
}

.move-page {
    border-radius: 50%;
    height: 30px;
    width: 30px;
}

.gallery {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-grow: 9999;
    margin: 50px 0;
}

.preview {
    max-width: 400px;
    overflow-x: auto;
    overflow-y: hidden;
}

.image {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
}

.operations {
    display: flex;
    gap: 10px;
}

.delete {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    transition: color 0.2s ease-in-out, border 0.2s ease-in-out;
}

.gallery-inner {
    display: flex;
    flex-grow: 9999;
    flex-direction: column;
    gap: 50px;
}

/*noinspection CssUnusedSymbol*/
:deep(.el-upload-list--picture-card .el-upload-list__item) {
    margin: 0 2px 0 0;
}

/*noinspection CssUnusedSymbol*/
:deep(.el-upload--picture-card) {
    --el-upload-picture-card-size: 100px;
}

/*noinspection CssUnusedSymbol*/
:deep(.el-upload-list--picture-card) {
    flex-wrap: nowrap !important;
    --el-upload-list-picture-card-size: 100px;
}

/*noinspection CssUnusedSymbol*/
:deep(.el-upload-list__item-status-label) {
    display: none !important;
}

.delete:hover {
    --el-button-hover-text-color: var(--el-color-danger) !important;
    --el-button-hover-border-color: var(--el-color-danger) !important;
}
</style>