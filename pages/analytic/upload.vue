<script setup lang="ts">
import ImageUploader from "~/components/uploading/ImageUploader.vue";
import {throttle} from "lodash-es";
import {useFileStore} from "~/stores/fileStore";
import {useTesseract} from "~/composibles/useTesseract";
import type {FourPoints} from "~/types/cvtypes";
import ForfeitDialog from "~/components/uploading/ForfeitDialog.vue";
import type {BaseResponse, FormatRequest, MergeRequest} from "~/types/requests";

definePageMeta({
    middleware: 'auth'
})

const imageUploader = useTemplateRef<typeof ImageUploader>("imageUploader")

const returning = ref(false)
const imageLength = ref(0)
const uploading = ref(false)
const uploadingStatus = ref("Uploading...")

const router = useRouter()
const fileStore = useFileStore()
const tesseract = await useTesseract(5)

/**
 * Puts a temporary critique file in the file storage
 *
 * @param critique
 */
function storeCritique(critique: string) {
    uploadingStatus.value = "Storing File..."
    fileStore.setOcrResult(critique)
}

/**
 * Formats the raw paragraphs into HTML.
 * Separate requests into small chunks of text
 *
 * @param paragraphs each element is a paragraph
 * @returns a string of html representing critique
 */
async function formatting(paragraphs: string[]): Promise<string> {
    uploadingStatus.value = "Formatting File..."

    // chunk the paragraphs so each segment is less than 3000 characters (~750 tokens)
    // if the paragraph itself is bigger than 3000 characters, it is considered as plain text
    const tokenMax = 3000

    const chunkedParagraphs: string[] = []
    const extraLong: { [index: number]: string } = {}
    let currentChunk: string[] = []
    let currentChunkLength = 0

    paragraphs.forEach((para, i) => {
        if (para.length > tokenMax) {
            extraLong[i] = `<p>${para}</p>`
            if (currentChunk.length) {
                chunkedParagraphs.push(currentChunk.join("\n"))
            }
            currentChunk = []
            currentChunkLength = 0
            return
        }
        if (currentChunkLength + para.length > tokenMax) {
            chunkedParagraphs.push(currentChunk.join("\n"))
            currentChunk = []
            currentChunkLength = 0
        }
        currentChunk.push(para)
        currentChunkLength += para.length
    })
    if (currentChunk.length) {
        chunkedParagraphs.push(currentChunk.join("\n"))
    }

    const body: FormatRequest = {
        segments: chunkedParagraphs
    }

    const formatted = await $fetch<BaseResponse<string[]>>("/api/critique/format", {
        method: "POST",
        body: body
    })
    if (!formatted.success) {
        throw new Error(formatted.errorMessage)
    }

    const ret = []
    let arrP = 0;
    for (let i = 0; i < chunkedParagraphs.length + Object.keys(extraLong).length; i++) {
        ret[i] = extraLong[i] ? extraLong[i] : formatted.data![arrP++]
    }

    console.log('Formatting: before', paragraphs, 'Formatting: after', ret)

    return ret.join("\n")
}

/**
 * Merges the last segment of page 1 and first segment of page 2
 * if they belong to the same paragraph
 *
 * @param ocrResults success results only (data exists)
 * @returns an array of string, each element representing one paragraph
 */
async function mergeTail(ocrResults: OcrResult[]): Promise<string[]> {
    uploadingStatus.value = "Merging Images..."

    if (ocrResults.some(ocrResult => ocrResult?.data?.paragraphs === undefined)) {
        throw Error(ocrResults.map(r => r.errorMessage).reduce((e1, e2) => e1 ?? e2))
    }

    // if merged paragraph is longer than 3000 characters,
    // it is considered as separate paragraphs
    const maxToken = 3000;

    const pages: string[][] = ocrResults.map(ocrResult => ocrResult!.data!.paragraphs.map(
        para => para.segments.map(
                segment => segment.isLowConfidence ? `[low-confidence]${segment.text}[/low-confidence]` : segment.text
            ).join(" ")
    ))

    if (pages.length === 1 && pages[0].length === 1) {
        // only 1 paragraph
        return Promise.resolve(pages[0])
    }

    // if not last paragraph, append it in
    // otherwise grab the last and first and resolve it into a promise
    const paragraphPromises: (string | Promise<string[]>)[] = []
    for (let pageN = 0; pageN < pages.length; pageN++) {
        const paras = pages[pageN]

        // first page
        if (pageN === 0) {
            paragraphPromises.push(paras[0])
        }
        paragraphPromises.push(...paras.slice(1, -1))

        // last page
        if (pageN === pages.length - 1) {
            paragraphPromises.push(paras[paras.length - 1])
            break;
        }

        const thisTail = paras[paras.length - 1]
        const nextHead = pages[pageN + 1][0]

        // too long
        if (thisTail.length + nextHead.length > maxToken) {
            paragraphPromises.push(thisTail, nextHead)
            continue;
        }

        // check merge
        const requestBody: MergeRequest = {
            tail: thisTail,
            head: nextHead
        }
        const mergePromise: Promise<string[]> = new Promise((resolve) => {
            $fetch<BaseResponse<"true" | "false">>("/api/critique/merge", {
                method: "POST",
                body: requestBody
            }).then((resp) => {
                console.log("merging", thisTail, nextHead, resp)

                // treat errors as false
                if (!resp.success) {
                    console.error(resp.errorMessage)
                    resolve([thisTail, nextHead])
                }
                if (resp.data === "true") {
                    resolve([`${thisTail} ${nextHead}`])
                } else if (resp.data === "false") {
                    resolve([thisTail, nextHead])
                } else {
                    console.error(`Unknown merge action: ${resp.data}`);
                    resolve([thisTail, nextHead])
                }
            })
        })
        paragraphPromises.push(mergePromise)
    }
    const paragraphRaw = await Promise.all(paragraphPromises)
    const ret = paragraphRaw.flat()

    console.log("Merging: before", ocrResults, "Merging: after", ret)

    return ret
}

/**
 * Performs OCR for an image which went through OSD
 *
 * @param osdResult
 */
async function ocr(osdResult: OsdResult) {
    uploadingStatus.value = "Performing OCR..."
    const ocrResult = await tesseract.get().ocr(osdResult)
    if (ocrResult.status === "error") {
        ElMessage.error(ocrResult.errorMessage)
        throw Error(ocrResult.errorMessage)
    }
    if (ocrResult.status === "warning") {
        ElMessage.warning(ocrResult.warningMessage)
    }
    return ocrResult
}

/**
 * Performs OSD for a base64-encoded image
 *
 * @param image
 */
async function osd(image: string): Promise<OsdResult> {
    uploadingStatus.value = "Performing OSD..."
    const osdResult = await tesseract.get().osd(image)
    if (osdResult.status === "error") {
        ElMessage.error(osdResult.errorMessage)
        throw Error(osdResult.errorMessage)
    }
    if (osdResult.status === "warning") {
        ElMessage.warning(osdResult.warningMessage)
    }
    return osdResult
}

/**
 * Performs perspective transformation for a
 * base64-encoded image with a contour
 *
 * @param image
 * @param contour
 */
async function perspective(image: string, contour: FourPoints): Promise<string> {
    uploadingStatus.value = "Transforming Images..."
    const resp = await $fetch("/api/image/transform", {
        method: "POST",
        body: {
            points: contour,
            image: image
        }
    })
    if (!resp.success) {
        ElMessage.error("Error converting the perspective of image")
    }
    return resp.data.png
}

/**
 * For each image, do:
 *  1. adjust the perspective (opencv backend)
 *  2. osd (opencv backend)
 *  3. ocr (tesseract frontend)
 */
async function uploadImages() {
    const promises: Promise<OcrResult>[] = []
    for (const item of imageUploader.value?.items()) {
        const promise = perspective(item.image, item.contour)
            .then(osd)
            .then(ocr)
        promises.push(promise)
    }

    return Promise.all(promises)
        .then(mergeTail)
        .then(formatting)
}

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

    uploadImages().then((resp) => {
        // storeOcrResults(resp)
        storeCritique(resp)
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