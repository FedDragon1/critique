import Tesseract, {createWorker, OEM, PSM} from "tesseract.js";
import { Buffer } from "buffer";

class Workers {
    workers: WorkerWrapper[]
    pointer: number

    constructor(workers: WorkerWrapper[]) {
        this.workers = workers
        this.pointer = 0
    }

    get() {
        return this.workers[this.pointer++ % this.workers.length];
    }
}

class WorkerWrapper {
    ocrWorker: Tesseract.Worker

    constructor(ocrWorker: Tesseract.Worker) {
        this.ocrWorker = ocrWorker
    }

    /*
    Transforms the ocr result to an HTML description (object)
     */
    ocrPostProcess(result: Tesseract.RecognizeResult): OcrData {
        const paragraphs: OcrParagraph[] = [];
        let paragraph: OcrParagraph = {
            segments: []
        }
        let segment: OcrSegmentIntermediate = {
            isLowConfidence: false,
            words: []
        };

        function segmentToText(segment: OcrSegmentIntermediate): OcrSegment {
            return {
                text: segment.words.join(" "),
                isLowConfidence: segment.isLowConfidence
            }
        }

        function toggleLowConfidence(to: boolean, word: Tesseract.Word) {
            if (segment.isLowConfidence === to) {
                segment.words.push(word.text)
                return;
            }

            if (segment.words.length) {
                // finish current segment and start new segment with
                // low confidence level
                paragraph.segments.push(segmentToText(segment))
            }
            segment = {
                isLowConfidence: to,
                words: [word.text]
            }
        }

        function reset() {
            if (segment.words.length) {
                paragraph.segments.push(segmentToText(segment))
            }
            paragraphs.push(paragraph)
            paragraph = {
                segments: []
            }
            segment = {
                isLowConfidence: false,
                words: []
            }
        }

        for (const rawParagraph of result.data.paragraphs) {
            for (const line of rawParagraph.lines) {
                for (const word of line.words) {
                    // low confidence mode is true if the current
                    // word is not considered as confidence
                    toggleLowConfidence(word.confidence < WORD_CONFIDENCE_THRESHOLD, word)
                }
            }
            reset()
        }

        return {
            paragraphs,
            confidence: result.data.confidence
        }
    }

    async ocr(osdResult: OsdResult): Promise<OcrResult> {
        const startTime = performance.now()
        const {
            status: osdStatus,
            warningMessage: osdWarning,
            data: base64
        } = osdResult

        if (!base64) {
            throw Error("Buffer is not defined")
        }

        const buffer = Buffer.from(base64, "base64");

        // 1000 words ~ 10 seconds
        const rawOcrData = await this.ocrWorker.recognize(buffer, {}, {
            text: false,
            hocr: false,
            tsv: false,
        })

        // less than 1ms
        const ocrData = this.ocrPostProcess(rawOcrData)
        const endTime = performance.now()

        return {
            status: osdStatus,
            warningMessage: osdWarning,
            timeMs: endTime - startTime,
            data: ocrData,
        }
    }
}

// noinspection DuplicatedCode
async function createEnglishWorker(pageSegMode: PSM, options?: Partial<Tesseract.WorkerOptions>) {
    const worker = await createWorker("eng", OEM.DEFAULT, options);
    await worker.setParameters({
        "tessedit_pageseg_mode": pageSegMode,
        "user_defined_dpi": "70"
    })
    return worker;
}

// noinspection DuplicatedCode
async function spawnWorkers(numWorkers: number) {
    const workers: Promise<Tesseract.Worker>[] = [];
    for (let i = 0; i < numWorkers; i++) {
        workers.push(createEnglishWorker(PSM.SINGLE_BLOCK, {legacyCore: true, legacyLang: true}))
    }
    const workersResolved = await Promise.all(workers)
    return new Workers(workersResolved.map(p => new WorkerWrapper(p)))
}

const WORD_CONFIDENCE_THRESHOLD = 85

export async function useTesseract(numWorkers: number) {
    return spawnWorkers(numWorkers)
}
