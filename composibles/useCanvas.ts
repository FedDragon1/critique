import type {Ref} from "vue";
import {Point} from "@techstark/opencv-js";


/**
 * Draws an image to canvas. Make the canvas fit the image size
 *
 * @param image base64
 * @param canvas
 */
function imageToCanvas(canvas: HTMLCanvasElement, image: string) {
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = `data:image/png;base64,${image}`

    img.addEventListener("load", () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
    })
}

/**
 * Draws the contour line with provided context
 *
 * @param ctx
 * @param points
 */
function drawContour(ctx: CanvasRenderingContext2D, points: Point[]) {
    const begin = points[0]
    const other = points.slice(1)
    const { x: beginX, y: beginY } = begin

    ctx.strokeStyle = "#00FF00"
    ctx.lineWidth = 2

    ctx.beginPath()
    ctx.moveTo(beginX, beginY)

    for (const { x, y } of other) {
        ctx.lineTo(x, y)
    }

    // complete loop
    ctx.closePath()
    ctx.stroke()
}

function bind(fn: Function, arg: any) {
    return (...args: any[]) => fn(arg, ...args)
}

export function useCanvas(elementRef: Ref<HTMLCanvasElement>) {
    let ctx = elementRef.value.getContext("2d")!;

    return {
        paint: bind(imageToCanvas, elementRef.value),
        drawContour: bind(drawContour, ctx),
    }
}