import type { Ref } from "vue";
import type { CanvasOptions, FourPoints } from "~/types/cvtypes";


class CanvasProxy {
    // canvas
    canvas
    ctx

    // styles
    strokeStyle
    fillStyle
    pointFill
    lineWidth
    pointRadius

    // content
    image?: string
    imageNode?: HTMLImageElement
    imageHeight?: number
    imageWidth?: number
    imageLoaded?: boolean

    constructor(canvas: HTMLCanvasElement, options?: CanvasOptions) {
        // canvas
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d")!

        // styles
        const { strokeStyle, fillStyle,
            lineWidth, pointRadius, pointFill } = options ?? {}
        this.strokeStyle = strokeStyle ?? "#00ff00"
        this.pointFill = pointFill ?? "#ff00ff"
        this.fillStyle = fillStyle ?? "#ff00ff33"
        this.lineWidth = lineWidth ?? 2
        this.pointRadius = pointRadius ?? 10
    }

    style() {
        this.ctx.strokeStyle = this.strokeStyle
        this.ctx.fillStyle = this.fillStyle
        this.ctx.lineWidth = this.lineWidth
    }

    /**
     * Returns the current width of canvas
     */
    canvasWidth() {
        return this.canvas.width
    }

    /**
     * Returns the current height of canvas
     */
    canvasHeight() {
        return this.canvas.height
    }

    /**
     * Creates an image node with the base64 encoded string,
     * store it in `imageNode` attribute.
     *
     * @param image
     */
    prepareImage(image: string) {
        this.image = image
        this.imageLoaded = false
        this.imageNode = new Image();
        this.imageNode.src = `data:image/png;base64,${image}`

        this.imageNode.addEventListener("load", () => {
            this.imageLoaded = true;
            this.imageWidth = this.imageNode!.width
            this.imageHeight = this.imageNode!.height

            this.canvas.height = this.imageHeight
            this.canvas.width = this.imageWidth
        })
    }

    /**
     * Draws the base64 encoded image on the canvas.
     * Pass in `then` callback function to perform operations after
     * the image is drawn.
     * Due to the async nature of image load listener, synchronous
     * sequence of operation may result in unexpected behavior
     *
     * @param then callback function after image is drawn
     */
    drawImage(then?: () => void) {
        if (!this.imageNode) {
            throw TypeError("No prepared image. Call `prepareImage` first to create DOM node.")
        }
        const img = this.imageNode!

        // wait until the image is loaded
        const draw = () => {
            if (!this.imageLoaded) {
                setTimeout(draw, 10)
                return
            }
            this.style()
            this.ctx.drawImage(img, 0, 0)
            then && then()
        }
        draw()
    }

    /**
     * Draws the quadrilateral created by the four points
     * passed in. In normal cases, use this as the `then`
     * callback to `drawImage` method
     *
     * @param points
     */
    drawFourPoints(points: FourPoints) {
        // const pointsOrdered = orderPoints(points)
        const pointsOrdered = points

        // debugger;
        const { x: xl, y: yl } = pointsOrdered[pointsOrdered.length - 1]

        this.ctx.beginPath()
        this.ctx.moveTo(xl, yl)
        for (const p of pointsOrdered) {
            this.ctx.lineTo(p.x, p.y)
        }
        this.ctx.stroke()
        this.ctx.fillStyle = this.fillStyle
        this.ctx.fill()
        this.ctx.fillStyle = this.pointFill

        for (const p of pointsOrdered) {
            this.ctx.moveTo(p.x, p.y)
            this.ctx.beginPath()
            this.ctx.ellipse(p.x, p.y, this.pointRadius, this.pointRadius, 0, 0, 2 * Math.PI)
            this.ctx.fill()
        }
    }

    /**
     * Converts the client coordinate to canvas coordinate
     *
     * @param clientX
     * @param clientY
     */
    clientToCanvas(clientX: number, clientY: number) {
        const rect = this.canvas.getBoundingClientRect()
        const canvasX = rect.x,
            canvasY = rect.y
        return [clientX - canvasX, clientY - canvasY]
    }
}

/**
 * Returns a canvas controller
 *
 * @param elementRef
 * @param options
 */
export function useCanvas(elementRef: Ref<HTMLCanvasElement>, options?: CanvasOptions) {
    return new CanvasProxy(elementRef.value, options)

    // return {
    //     paint: bind(imageToCanvas, elementRef.value),
    //     drawContour: bind(drawContour, ctx),
    //     drawFourPoints: bind(drawFourPoints, ctx),
    // }
}