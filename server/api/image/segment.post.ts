// POST /api/image/segment

import cv from '@techstark/opencv-js'
import {
    approximateContour,
    bufferToMat,
    convexContour,
    image1d,
    opencvReady,
    quadrilateralContour
} from "~/server/utils/cvutils";
import { Contour, FourPoints } from "~/types/cvtypes";

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
 *          contour: Contour
 *     }
 * }
 *
 * Process:
 *     1. Read the image
 *     2. Find contour lines
 *     3. Return biggest contour line with exactly 4 edges
 */
export default defineEventHandler(async (event) => {
    const request = await readBody(event);

    const imageBase64 = request.image;
    const imageBuffer = Buffer.from(imageBase64, "base64")

    await opencvReady()
    const {image} = await bufferToMat(imageBuffer)

    const cnts = new cv.MatVector();
    const dst = new cv.Mat()
    image1d(image)  // coerce from png to greyscale

    const contoursRaw: cv.Mat[] = []
    const imageArea = image.rows * image.cols

    const bigContours = (contour: Contour) => contour.area > imageArea * 0.2
    const orderContourPoints = (contour: Contour): Contour => {
        return {
            area: contour.area,
            points: orderPoints(contour.points as FourPoints)
        }
    }

    const contours = withMat([image, cnts, dst], () => {

        cv.findContours(image, cnts, dst, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
        for (let i = 0; i < cnts.size(); i++) {
            contoursRaw.push(cnts.get(i))
        }

        // Sort by area, assuming the biggest is the target
        return contoursRaw
            .map(approximateContour)
            .filter(bigContours)
            .filter(quadrilateralContour)
            .map(orderContourPoints)
            .filter(convexContour)
    })
    contours.sort((a, b) => b.area - a.area)

    return {
        success: contours.length !== 0,
        data: {
            contours: contours.slice(0, 5)
        }
    }
})

