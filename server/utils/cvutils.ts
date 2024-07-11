import sharp from "sharp";
import cv from "@techstark/opencv-js";

/**
 * Converts a Buffer object to opencv Mat object.
 * Width and height are included
 *
 * @param buffer buffer object
 */
export async function bufferToMat(buffer: Buffer) {
    const { data, info} = await sharp(buffer)
        .ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    const { width, height } = info
    const image = cv.matFromImageData({ data, width, height })

    return { image, width, height }
}

/**
 * Auto deletes used matrix. Content manager.
 *
 * @param mats Matrices used in the function
 * @param callback callable taking the matrices and perform operations
 */
export async function withMatAsync<T>(mats: (cv.Mat | cv.MatVector)[], callback: () => T) {
    let ret;
    try {
        ret = await callback()
    } finally {
        for (const mat of mats) {
            mat.delete()
        }
    }
    return ret;
}

/**
 * Auto deletes used matrix. Content manager.
 *
 * @param mats Matrices used in the function
 * @param callback callable taking the matrices and perform operations
 */
export function withMat<T>(mats: (cv.Mat | cv.MatVector)[], callback: () => T) {
    let ret;
    try {
        ret = callback()
    } finally {
        for (const mat of mats) {
            mat.delete()
        }
    }
    return ret;
}

export function grabContours(cnts: cv.Vector<cv.Mat>) {
    console.log(cnts.size());

    if (cnts.size() == 2) {
        return cnts.get(0)
    }

    if (cnts.size() == 3) {
        return cnts.get(1)
    }
}

/**
 * Converting a variable bit-depth image into greyscale
 *
 * @param image
 */
export function image1d(image: cv.Mat) {
    cv.cvtColor(image, image, cv.COLOR_BGR2GRAY)
}

/**
 * Performs `cv.Canny` on image to `dst`.
 * Returns a sharp object for converting across types of media.
 *
 * @param image
 * @param dst
 * @param width
 * @param height
 */
export function detectEdges(image: cv.Mat, dst: cv.Mat, width: number, height: number) {
    cv.cvtColor(image, image, cv.COLOR_BGR2GRAY)    // greyscale
    cv.GaussianBlur(image, image, new cv.Size(5, 5), 0)
    cv.Canny(image, dst, 75, 200)

    return sharp(Buffer.from(dst.data), {
        raw: {
            width,
            height,
            channels: 1
        }
    })
}

/**
 * Approximate the contour with points
 * Returns an object with area and the points
 *
 * Modified from https://github.com/heymind/webScanner/blob/master/index.html
 *
 * @param mat matrix representing the contour
 */
export function approximateContour(mat: cv.Mat) {
    const perimeter = cv.arcLength(mat, true)
    const approx = new cv.Mat();

    const result: Contour = {
        area: cv.contourArea(mat),
        points: []
    }

    withMat([approx], () => {
        cv.approxPolyDP(mat, approx, 0.02 * perimeter, true)
        const pointsData = approx.data32S

        for (let i = 0; i < pointsData.length / 2; i++) {
            result.points.push({
                x: pointsData[2 * i],
                y: pointsData[2 * i + 1]
            })
        }
    })

    return result
}

/**
 * Predicate returning true only when contour can be approximated
 * with 4 points (quadrilateral)
 *
 * @param contour
 */
export function quadrilateralContour(contour: Contour) {
    return contour.points.length === 4;
}