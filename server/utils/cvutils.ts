import sharp from "sharp";
import cv from "@techstark/opencv-js";
import type {Contour, FourPoints} from "~/types/cvtypes";
import {sleep} from "@antfu/utils";
import {matrixOf, vectorOf} from "~/server/utils/linalg";

/**
 * Blocks server code from running until opencv is ready
 */
export async function opencvReady() {
    while (!cv.getBuildInformation) {
        console.log("Loading opencv...")
        await sleep(100)
    }
}

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

/**
 * Converting a variable bit-depth image into greyscale
 *
 * @param image
 */
export function image1d(image: cv.Mat) {
    cv.cvtColor(image, image, cv.COLOR_BGR2GRAY)
}

export function matToSharp(mat: cv.Mat, width: number, height: number, channels: 1 | 2 | 3 | 4 = 1) {
    return sharp(Buffer.from(mat.data), {
        raw: {
            width,
            height,
            channels
        }
    })
}

/**
 * Performs `cv.Canny` on image to `dst`.
 * Returns a sharp object for converting across types of media.
 *
 * @param image
 * @param dst
 */
export function detectEdges(image: cv.Mat, dst: cv.Mat) {
    cv.cvtColor(image, image, cv.COLOR_BGR2GRAY)    // greyscale
    cv.GaussianBlur(image, image, new cv.Size(5, 5), 0)
    cv.Canny(image, dst, 50, 100)
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

/**
 * Mimic of `np.sum` for points
 * Return an array of number, each element is the sum of
 * x and y coordinate of corresponding point
 *
 * @param points
 */
export function sumPoints(points: cv.Point[]) {
    return points.map(point => point.x + point.y)
}

/**
 * Mimic of `np.diff` for points
 * Return an array of number, each element is the difference of
 * y and x coordinate of corresponding point
 *
 * @param points
 */
export function diffPoints(points: cv.Point[]) {
    return points.map(point => point.y - point.x)
}

/**
 * Mimic of `np.argmax` with custom comparator
 * Returns the index of the biggest element
 *
 * @param array
 * @param comparator returns true if `a` is bigger than `b`
 */
export function argmax<T>(array: T[], comparator: (a: T, b: T) => boolean = (a, b) => a > b) {
    const max = array.reduce((a, b) => comparator(a, b) ? a: b)
    return array.indexOf(max)
}

/**
 * Mimic of `np.argmin` with custom comparator
 * Returns the index of the smallest element
 *
 * @param array
 * @param comparator returns true if `a` is bigger than `b`
 */
export function argmin<T>(array: T[],  comparator: (a: T, b: T) => boolean = (a, b) => a > b) {
    const min = array.reduce((a, b) => comparator(a, b) ? b: a) // reverse selection
    return array.indexOf(min)
}

/**
 * Order the four points passed in with clockwise rotation
 * starting from top-left
 *
 * @param points
 */
export function orderPoints(points: FourPoints): FourPoints {
    // order: top-left -> top-right -> bottom-right -> bottom-left
    // clockwise rotation
    const rect = []

    // top left (0, 0) will have the smallest sum (0)
    // bottom-right (x, y) will have the largest sum (x+y)
    const sumOfPoints = sumPoints(points)
    rect[0] = points[argmin(sumOfPoints)]
    rect[2] = points[argmax(sumOfPoints)]

    // top right (x, 0) will have the smallest difference (-x)
    // bottom left (0, y) will have the largest difference (y)
    const diffOfPoints = diffPoints(points)
    rect[1] = points[argmin(diffOfPoints)]
    rect[3] = points[argmax(diffOfPoints)]

    return rect as FourPoints
}

/**
 * Compute the distance between point1 and point2.
 * Default using l2 norm.
 * Default using l2 norm.
 *
 * @param point1
 * @param point2
 * @param l norm index, default to 2
 */
export function distance(point1: cv.Point, point2: cv.Point, l: number = 2) {
    return Math.pow(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2), 1 / l)
}

/**
 * Compute the real aspect ratio from four points and the image dimension
 *
 * @param points
 * @param imageDimension
 */
export function aspectRatio(points: FourPoints, imageDimension: [number, number]) {
    const [horizontalCenter, verticalCenter] = imageDimension.map(x => x / 2.)

    // pad 1 in the end for linear algebra
    const [ topLeft, topRight, bottomRight, bottomLeft ] = points.map(
        p => vectorOf([p.x, p.y, 1])
    )

    const focalDist2 = topLeft.cross(bottomRight).dot(bottomLeft) /
        topRight.cross(bottomRight).dot(bottomLeft)
    const focalDist3 = topLeft.cross(bottomRight).dot(topRight) /
        bottomLeft.cross(bottomRight).dot(topRight)

    // No comment on original code, I suspect this is
    // related to determinant of 3x3 matrix.
    const n2 = topRight.muls(focalDist2).sub(topLeft)
    const n3 = bottomLeft.muls(focalDist3).sub(topLeft)
    const [n21, n22, n23] = n2.data.flat()
    const [n31, n32, n33] = n3.data.flat()
    const f = Math.sqrt(Math.abs(
        (1. / (n23 * n33))
        * (
            (n21 * n31 - (n21 * n33 + n23 * n31) * horizontalCenter + n23 * n33 * horizontalCenter * horizontalCenter)
            + (n22 * n32 - (n22 * n33 + n23 * n32) * verticalCenter + n23 * n33 * verticalCenter * verticalCenter)
        )
    ))

    // linear algebra operations without comment
    const A = matrixOf([
        [f, 0, horizontalCenter],
        [0, f, verticalCenter],
        [0, 0, 1]
    ])
    const At = A.transpose()
    const Ati = At.inverse()
    const Ai = A.inverse()

    return Math.sqrt(
        Ati.apply(Ai).apply(n2).dot(n2) / Ati.apply(Ai).apply(n3).dot(n3)
    )
}

/**
 * Perform four point transform on the source image with points provided.
 * Automatically deallocates matrix created on the fly, except `src` and `dst`
 *
 * @param src source matrix of image, greyscale
 * @param dst destination matrix
 * @param points four points user entered, no need to order
 * @param imageDimension width x height of original image
 */
export function fourPointTransform(src: cv.Mat, dst: cv.Mat, points: FourPoints, imageDimension: [number, number]) {
    const rect = orderPoints(points)
    const [topLeft, topRight, bottomRight, bottomLeft] = rect;

    // width of new image is the maximum of top side or the bottom side
    const newWidth = Math.max(distance(topLeft, topRight), distance(bottomLeft, bottomRight))

    // height of new image is the maximum of left side or right side
    const newHeight = Math.max(distance(topLeft, bottomLeft), distance(topRight, bottomRight))

    const arVisible = newWidth / newHeight
    const arReal = aspectRatio(rect, imageDimension)
    let adjustedWidth, adjustedHeight
    if (arReal < arVisible) {
        adjustedWidth = newWidth
        adjustedHeight = adjustedWidth / arReal
    } else {
        adjustedHeight = newHeight
        adjustedWidth = arReal * adjustedHeight
    }
    adjustedWidth = Math.round(adjustedWidth)
    adjustedHeight = Math.round(adjustedHeight)

    // reflow the four points into TL, TR, BL, BR
    const rectZigzag = [
        topLeft.x, topLeft.y,
        topRight.x, topRight.y,
        bottomLeft.x, bottomLeft.y,
        bottomRight.x, bottomRight.y,
    ]
    const rectDstZigZag = [
        0, 0,
        adjustedWidth, 0,
        0, adjustedHeight,
        adjustedWidth, adjustedHeight
    ]
    const rectMat = cv.matFromArray(4, 2, cv.CV_32F, rectZigzag)
    const rectDstMat = cv.matFromArray(4, 2, cv.CV_32F, rectDstZigZag)
    const M = cv.getPerspectiveTransform(rectMat, rectDstMat)

    // // the four points needs to be transformed reaching this state, find the perspective matrix
    // const rectDst = [[0, 0], [newWidth - 1, 0], [newWidth - 1, newHeight - 1], [0, newHeight - 1]]
    // const rectMat = fourPointsToMat(rect)
    // const rectDstMat = cv.matFromArray(4, 2, cv.CV_32F, rectDst)
    // // may cause memory leak if exception here, but should be fine for now
    // const M = cv.getPerspectiveTransform(rectMat, rectDstMat)

    withMat([rectMat, rectDstMat, M], () => {
        cv.warpPerspective(src, dst, M, new cv.Size(adjustedWidth, adjustedHeight))
    })

    return [adjustedWidth, adjustedHeight]
}

export function sharpen(image: cv.Mat, dst: cv.Mat) {
    const kernel = cv.matFromArray(3, 3, cv.CV_8S, [-1, -1, -1, -1, 9, -1, -1, -1, -1])
    withMat([kernel], () => {
        cv.filter2D(image, dst, -1, kernel)
    })
}

export function adaptiveThresholding(image: cv.Mat, dst: cv.Mat) {
    const blurred = new cv.Mat();
    withMat([blurred], () => {
        // blur and greyscale original image
        cv.cvtColor(image, blurred, cv.COLOR_BGR2GRAY)
        cv.GaussianBlur(blurred, blurred, new cv.Size(3, 3), -5)
        sharpen(blurred, blurred)

        cv.adaptiveThreshold(blurred, dst, 255,
            cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY,
            11, 15
        )
    })
}