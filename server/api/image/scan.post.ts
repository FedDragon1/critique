// post /api/image/scan

import cv from "@techstark/opencv-js"
import {bufferToMat, detectEdges, matToSharp, opencvReady, withMatAsync} from "~/server/utils/cvutils";

/**
 * Request body:
 * multipart form
 *   - 1x binary file
 *
 * Response body:
 * {
 *     success: boolean,
 *     data: string (base64)
 * }
 *
 * Process:
 *     1. Read the image
 *     2. Preprocess image
 *     3. Return the base64 representation
 */
export default defineEventHandler(async (event) => {
    const request = await readMultipartFormData(event)

    // ideally there should only be 1 image
    const file = request![0]
    await opencvReady()

    // preprocess
    const { image, width, height } = await bufferToMat(file["data"])
    const dst = new cv.Mat()

    return withMatAsync([image, dst], async () => {
        detectEdges(image, dst)
        const preprocessed = matToSharp(dst, width, height)

        return {
            success: true,
            data: {
                png:(await preprocessed.png().toBuffer()).toString("base64"),
            }
        }
    })
})

