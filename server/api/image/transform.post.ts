// post /api/image/transform

import {bufferToMat, fourPointTransform, opencvReady, matToSharp, adaptiveThresholding} from "~/server/utils/cvutils";
import cv from '@techstark/opencv-js'
import type {TransformRequest} from "~/types/requests";


/**
 * Request body:
 * {
 *     image: string (base64)
 *     points: Point[]
 * }
 *
 * Response body:
 * {
 *     success: boolean,
 *     data: {
 *          png: string (base64)
 *     }
 * }
 *
 * Process:
 *     1. Read the image
 *     2. Transform the image with the points
 *     3. Apply threshold to the image
 *     3. Return the base64 representation
 */
export default defineEventHandler(async (event) => {
    const request: TransformRequest = await readBody(event)

    const imageBase64 = request.image;
    const imageBuffer = Buffer.from(imageBase64, "base64")

    await opencvReady()
    const { image, width, height } = await bufferToMat(imageBuffer)

    const dst = new cv.Mat()
    const data = await withMatAsync([image, dst], async () => {
        const [w, h] = fourPointTransform(image, dst, request.points, [width, height])
        adaptiveThresholding(dst, dst)
        const sharp = matToSharp(dst, w, h, 1);
        return (await sharp.png().toBuffer()).toString("base64")
    })

    return {
        success: true,
        data: {
            png: data
        }
    }
})