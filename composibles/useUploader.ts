import type {Ref} from "vue";
import type {BaseResponse, FormatRequest, MergeRequest} from "~/types/requests";
import type {Workers} from "~/composibles/useTesseract";
import type {FourPoints} from "~/types/cvtypes";
import {useFileStore} from "#imports";

class Uploader {
    uploadingStatus
    tesseract
    fileStore

    constructor(uploadingStatus: Ref<string>, tesseract: Workers) {
        this.uploadingStatus = uploadingStatus
        this.tesseract = tesseract
        this.fileStore = useFileStore()
    }

    /**
     * Puts a temporary critique file in the file storage
     *
     * @param critique
     */
    storeCritique(critique: string) {
        this.uploadingStatus.value = "Storing File..."
        this.fileStore.setOcrResult(critique)
    }

    /**
     * Formats the raw paragraphs into HTML.
     * Separate requests into small chunks of text
     *
     * @param paragraphs each element is a paragraph
     * @returns a string of html representing critique
     */
    async formatting(paragraphs: string[]): Promise<string> {
        this.uploadingStatus.value = "Formatting File..."

        // if the paragraph itself is bigger than 2000 characters, it is considered as plain text
        const tokenMax = 2000
        const chunkedParagraphs: string[] = []
        const extraLong: { [index: number]: string } = {}
        paragraphs.forEach((para, i) => {
            if (para.length > tokenMax) {
                extraLong[i] = para
                return
            }
            chunkedParagraphs.push(para)
        })

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

        return ret.join("\n")
    }

    /**
     * Merges the last segment of page 1 and first segment of page 2
     * if they belong to the same paragraph
     *
     * @param ocrResults success results only (data exists)
     * @returns an array of string, each element representing one paragraph
     */
    async mergeTail(ocrResults: OcrResult[]): Promise<string[]> {
        this.uploadingStatus.value = "Merging Images..."

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
        return paragraphRaw.flat()
    }

    /**
     * Performs OCR for an image which went through OSD
     *
     * @param osdResult
     */
    async ocr(osdResult: OsdResult) {
        this.uploadingStatus.value = "Performing OCR..."
        const ocrResult = await this.tesseract.get().ocr(osdResult)
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
    async osd(image: string): Promise<OsdResult> {
        this.uploadingStatus.value = "Performing OSD..."
        const osdResult = await this.tesseract.get().osd(image)
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
    async perspective(image: string, contour: FourPoints): Promise<string> {
        this.uploadingStatus.value = "Transforming Images..."
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
    async uploadImages(imageUploader: any) {
        const promises: Promise<OcrResult>[] = []
        for (const item of imageUploader.value?.items()) {
            const promise = this.perspective(item.image, item.contour)
                .then(this.osd.bind(this))
                .then(this.ocr.bind(this))
            promises.push(promise)
        }

        return Promise.all(promises)
            .then(this.mergeTail.bind(this))
            .then(this.formatting.bind(this))
            .then(this.storeCritique.bind(this))
    }
}

export function useUploader(uploadingStatus: Ref<string>, tesseract: Workers) {
    return new Uploader(uploadingStatus, tesseract)
}