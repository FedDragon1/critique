// post /api/image/ocr

import {createWorker, OEM} from 'tesseract.js'

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

    const worker = await createWorker("eng", OEM.DEFAULT)
    const data = await worker.recognize(Buffer.from(image, "base64"))
    return {
        success: true,
        data: data
    }
})