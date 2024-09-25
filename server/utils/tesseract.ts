import Tesseract, {createWorker, OEM, PSM} from "tesseract.js";
import {rotateImage} from "~/server/utils/cvutils";

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
    osdWorker: Tesseract.Worker

    constructor(osdWorker: Tesseract.Worker) {
        this.osdWorker = osdWorker
    }

    async orientate(buffer: Buffer, degrees: 90 | 180 | 270 | number): Promise<Buffer> {
        await opencvReady()
        const sharp = await rotateImage(buffer, degrees)
        return sharp.png().toBuffer();
    }

    async osd(base64: string): Promise<OsdResult> {
        const buffer = Buffer.from(base64, "base64");

        const {
            data: {
                orientation_confidence,
                orientation_degrees,
                script,
                script_confidence
            }
        } = await this.osdWorker.detect(buffer)

        const [status, warningMessage]: [Status, string?] = (script === null && script_confidence === null)
        || (script_confidence as number) <= 0.1
            ? ["warning", "No script detected, assuming English"]
            : script !== "Latin" && (script_confidence as number) > 0.1
                ? ["warning", `Detected script "${script}", are you sure this document is in English?`]
                : ["success", undefined]

        let image = buffer;
        if (orientation_degrees !== null &&
            orientation_confidence !== null &&
            orientation_degrees !== 0 &&
            orientation_confidence > ORIENTATION_CONFIDENCE_THRESHOLD) {
            try {
                image = await this.orientate(buffer, orientation_degrees)
            } catch (e) {
                return {
                    status: "error",
                    errorMessage: (e as Error).message
                }
            }
        }

        const ret = image.toString("base64")

        return {
            status,
            warningMessage,
            data: ret
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

const NUM_WORKERS = 5
const ORIENTATION_CONFIDENCE_THRESHOLD = 0.1

export const workers = spawnWorkers(NUM_WORKERS)
