// post /api/image/ocr

import {workers} from "~/server/utils/tesseract";

/**
 * Request body:
 * {
 *     image: string (base64)
 * }
 *
 * Response body:
 * {
 *     success: boolean,
 *     data: {
 *         text: string
 *     }
 * }
 *
 * Process:
 *     1. Read the image
 *     2. Tesseract ocr
 *     3. Fix potential error with ChatGPT
 *     3. Return text
 */
export default defineEventHandler(async (event) => {
    const request = await readBody(event)
    const image = request.image

    const worker = (await workers).get()
    return await worker.ocr(image)
})