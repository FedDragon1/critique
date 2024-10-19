import {getDocument, GlobalWorkerOptions} from "pdfjs-dist/legacy/build/pdf.mjs"
import type {BaseResponse, MergeRequest, PunctuationRequest} from "~/types/requests";
import type {Ref} from "vue";

GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs"

async function readPdf(data: Uint8Array) {
    const pdf = await getDocument(data).promise
    const maxPages = pdf.numPages;// get all pages text

    const pagePromises = []
    for (let j = 1; j <= maxPages; j++) {
        pagePromises.push(pdf.getPage(j))
    }
    const pages = await Promise.all(pagePromises)

    const textPromises = pages.map(page => page.getTextContent())
    const pageTexts = await Promise.all(textPromises)

    return pageTexts.map((text) =>
        text.items
            .map(s => (s as { str: string }).str)
            .join(' ')
    )
}

async function revisePdf(data: string[], status: Ref<string>) {
    status.value = "Processing PDF"

    const maxLength = 2000;
    const sentences = data.flatMap((page) => page.split(/(\.)/));

    const paragraphs: string[] = []
    let currentLength = 0
    let tempParagraph: string[] = []
    for (const sentence of sentences) {
        currentLength += sentence.length
        tempParagraph.push(sentence)

        if (currentLength > maxLength) {
            const paragraph = tempParagraph.join(" ")
            paragraphs.push(paragraph)
            tempParagraph = []
            currentLength = 0
        }
    }
    if (tempParagraph.length) {
        paragraphs.push(tempParagraph.join(" "))
    }

    const body: PunctuationRequest = {
        content: paragraphs
    }
    const resp = await $fetch<BaseResponse<string[]>>("/api/critique/punctuation", {
        method: "POST",
        body
    })

    if (!resp.success) {
        ElMessage.error(resp.errorMessage)
        throw Error(resp.errorMessage)
    }

    return resp.data!
}

async function mergePages(pages: string[], status: Ref<string>) {
    status.value = "Merging Pages"
    const maxToken = 3000;

    if (pages.length === 1 && pages[0].length === 1) {
        // only 1 paragraph
        return Promise.resolve(pages)
    }

    const merging: MergeRequest[] = []

    // if not last paragraph, append it in
    // otherwise grab the last and first and resolve it into a promise
    const paragraphPromises: (string | (() => Promise<string[]>))[] = []
    for (let pageN = 0; pageN < pages.length; pageN++) {
        const paras = pages[pageN].split("\n")

        // first page
        // noinspection DuplicatedCode
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
        const nextHead = pages[pageN + 1].split("\n")[0]

        // too long
        // noinspection DuplicatedCode
        if (thisTail.length + nextHead.length > maxToken) {
            paragraphPromises.push(thisTail, nextHead)
            continue;
        }

        // check merge
        merging[pageN] = {
            tail: thisTail,
            head: nextHead
        }
        const mergePromise: () => Promise<string[]> = () => new Promise((resolve) => {
            merged.then((resp) => {
                if (!resp.success) {
                    resolve([thisTail, nextHead])
                    return
                }

                const merge = resp.data![pageN]
                if (merge) {
                    resolve([`${thisTail} ${nextHead}`])
                } else {
                    resolve([thisTail, nextHead])
                }
            })
        })
        paragraphPromises.push(mergePromise)
    }
    const merged = $fetch<BaseResponse<{ [key: string]: Boolean }>>("/api/critique/merge", {
        method: "POST",
        body: merging
    })
    const hookedParagraphPromises = paragraphPromises.map(
        (s) => typeof s === 'string' ? s : s()
    )
    const paragraphRaw = await Promise.all(hookedParagraphPromises)
    return paragraphRaw.flat()
}

export default function usePdf() {
    return {
        readPdf,
        revisePdf,
        mergePages,
    }
}


