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

export async function rotateImage(buffer: Buffer, degrees: 90 | 180 | 270 | number) {
    const {image, width, height} = await bufferToMat(buffer)

    const newWidth = degrees === 180 ? width : height
    const newHeight = degrees === 180 ? height : width
    const rotateCode = degrees === 90 ? cv.ROTATE_90_CLOCKWISE
        : degrees === 180 ? cv.ROTATE_180
            : degrees === 270 ? cv.ROTATE_90_COUNTERCLOCKWISE
                : -1
    if (rotateCode === -1) {
        image.delete()
        throw Error(`rotateImage received degrees of ${degrees}, should only be 90, 180, or 270`)
    }

    const output = new cv.Mat()
    return withMat([image, output], () => {
        cv.rotate(image, output, rotateCode)
        return matToSharp(output, newWidth, newHeight, output.channels() as 1)  // get rid of type check
    })
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
 * Converts an opencv Mat to sharp object
 *
 * @param mat
 * @param width
 * @param height
 * @param channels
 */
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
    const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(2, 2))

    withMat([kernel], () => {
        cv.cvtColor(image, dst, cv.COLOR_BGR2GRAY)    // greyscale
        cv.GaussianBlur(dst, dst, new cv.Size(7, 7), 0)
        cv.threshold(dst, dst, 150, 255, cv.THRESH_TOZERO)
        cv.adaptiveThreshold(dst, dst, 255,
            cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY,
            19, 19
        )
        // cv.threshold(dst, dst, 138, 255, cv.THRESH_BINARY)
        sharpen(dst, dst)
        cv.Canny(dst, dst, 255, 255)
        cv.dilate(dst, dst, kernel)
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
        cv.approxPolyDP(mat, approx, 0.05 * perimeter, true)
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
 * Predicate indicating whether there are parallel lines
 * using the four points provided
 *
 * @param points
 */
export function parallelLines(points: FourPoints) {
    const [topLeft, topRight, bottomRight, bottomLeft] = points;

    const topSlope = (topRight.y - topLeft.y) / (topRight.x - topLeft.x)
    const bottomSlope = (bottomRight.x - bottomLeft.x) / (bottomRight.y - bottomLeft.y)

    // same slope (e = 0.01) -> parallel lines
    if (Math.abs(topSlope - bottomSlope) < 0.01) {
        return true;
    }

    // take the reciprocal as x might be the same, which results in NaN
    const leftSlope = (topLeft.x - bottomLeft.x) / (topLeft.y - bottomLeft.y)
    const rightSlope = (topRight.x - bottomRight.x) / (topRight.y - bottomRight.y)

    return Math.abs(leftSlope - rightSlope) < 0.01;
}

/**
 * Perform four point transform on the source image with points provided.
 * Automatically deallocates matrix created on the fly, except `src` and `dst`
 *
 * @param src source matrix of image, greyscale
 * @param dst destination matrix
 * @param points four points file entered, no need to order
 * @param imageDimension width x height of original image
 */
export function fourPointTransform(src: cv.Mat, dst: cv.Mat, points: FourPoints, imageDimension: [number, number]) {
    const rect = orderPoints(points)
    const [topLeft, topRight, bottomRight, bottomLeft] = rect;

    // width of new image is the maximum of top side or the bottom side
    const newWidth = Math.max(distance(topLeft, topRight), distance(bottomLeft, bottomRight))

    // height of new image is the maximum of left side or right side
    const newHeight = Math.max(distance(topLeft, bottomLeft), distance(topRight, bottomRight))

    // depending on parallelity, choose different algorithm of getting aspect ratio
    const parallel = parallelLines(rect)

    const arVisible = newWidth / newHeight
    // set it NaN to prevent meaningless calculation. Sometimes it will still be NaN
    // despite parallel is false
    const arReal = parallel ? NaN : aspectRatio(rect, imageDimension)

    // in this case 2 of the lines are parallel, true aspect ratio cannot be resolved
    if (isNaN(arReal)) {
        // the four points needs to be transformed reaching this state, find the perspective matrix
        const rectDst = [0, 0, newWidth - 1, 0, newWidth - 1, newHeight - 1, 0, newHeight - 1]
        const rectMat = cv.matFromArray(4,2, cv.CV_32F, rect.flatMap(p => [p.x, p.y]))
        const rectDstMat = cv.matFromArray(4, 2, cv.CV_32F, rectDst)
        // may cause memory leak if exception here, but should be fine for now
        const M = cv.getPerspectiveTransform(rectMat, rectDstMat)

        withMat([rectMat, rectDstMat, M], () => {
            cv.warpPerspective(src, dst, M, new cv.Size(Math.round(newWidth), Math.round(newHeight)))
        })
        return [Math.round(newWidth), Math.round(newHeight)]
    }

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

    withMat([rectMat, rectDstMat, M], () => {
        cv.warpPerspective(src, dst, M, new cv.Size(adjustedWidth, adjustedHeight))
    })

    return [adjustedWidth, adjustedHeight]
}

/**
 * Sharpens the image with Laplacian filter
 *
 * @param image
 * @param dst
 */
export function sharpen(image: cv.Mat, dst: cv.Mat) {
    const kernel = cv.matFromArray(3, 3, cv.CV_8S, [-1, -1, -1, -1, 9, -1, -1, -1, -1])
    withMat([kernel], () => {
        cv.filter2D(image, dst, -1, kernel)
    })
}

/**
 * Converts image to greyscale, blue it, sharpen it, and then
 * use `cv.adaptiveThreshold` in gaussian mode
 *
 * @param image
 * @param dst
 */
export function adaptiveThresholding(image: cv.Mat, dst: cv.Mat) {
    const blurred = new cv.Mat();
    withMat([blurred], () => {
        // blur and greyscale original image
        cv.cvtColor(image, blurred, cv.COLOR_BGR2GRAY)
        cv.GaussianBlur(blurred, blurred, new cv.Size(3, 3), -5)
        sharpen(blurred, blurred)

        cv.adaptiveThreshold(blurred, dst, 255,
            cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY,
            11, 15
        )
    })
}

/**
 * Internal function used to test if a point is inside a triangle
 * https://www.gamedev.net/forums/topic.asp?topic_id=295943
 *
 * @param p1
 * @param p2
 * @param p3
 */
function sign(p1: cv.Point, p2: cv.Point, p3: cv.Point) {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y)
}

/**
 * Detect whether point `p` is inside the triangle `v1, v2, v3`
 * https://www.gamedev.net/forums/topic.asp?topic_id=295943
 *
 * @param p point to test
 * @param v1 vertex 1
 * @param v2 vertex 2
 * @param v3 vertex 3
 */
export function pointInTriangle(p: cv.Point, v1: cv.Point, v2: cv.Point, v3: cv.Point) {
    const d1 = sign(p, v1, v2),
        d2 = sign(p, v2, v3),
        d3 = sign(p, v3, v1)

    const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0),
        hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0)

    return !(hasNeg && hasPos)
}

/**
 * Predicate indicating whether the four-point contour is convex or concave
 *
 * @param contour quadrilateral contour
 */
export function convexContour(contour: Contour) {
    // create triangles and see if the other point is inside the triangle
    for (let i = 0; i < 4; i++) {
        const p = contour.points[i],
            v1 = contour.points[(i + 1) % 4],
            v2 = contour.points[(i + 2) % 4],
            v3 = contour.points[(i + 3) % 4]
        if (pointInTriangle(p, v1, v2, v3)) {
            return false;
        }
    }

    return true;
}
