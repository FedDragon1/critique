// post /api/image/ocr

import {workers} from "~/server/utils/tesseract";
import "tesseract.js-core/tesseract-core-simd.wasm"

/**
 * Request body:
 * {
 *     image: string (base64)
 * }
 */
export default defineEventHandler(async (event) => {
    const request = await readBody(event)
    const image = request.image

    const worker = (await workers).get()
    return await worker.osd(image)

    // TODO: vercel has some problems with tessaract, use pseudo value for now
})