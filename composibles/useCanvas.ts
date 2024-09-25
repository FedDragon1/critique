import type { Ref } from "vue";
import type {CanvasOptions, FourPoints, Point} from "~/types/cvtypes";

export class ImgProxy {
    image
    canny
    index
    hash

    constructor(image: string, canny: string, index: number) {
        this.image = image
        this.canny = canny
        this.index = index
        this.hash = Math.random().toString(36).slice(2, 7)
    }

    get url(): string {
        return `data:image/png;base64,${this.image}`
    }

    set url(newValue: string) {
        console.log(newValue)
    }
}

class CanvasProxy {
    // canvas
    canvas
    ctx
    width
    height

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
            lineWidth, pointRadius, pointFill,
            width, height} = options ?? {}
        this.strokeStyle = strokeStyle ?? "#00ff00"
        this.pointFill = pointFill ?? "#ff00ff"
        this.fillStyle = fillStyle ?? "#ff00ff33"
        this.lineWidth = lineWidth ?? 2
        this.pointRadius = pointRadius ?? 10
        this.width = width
        this.height = height
    }

    style() {
        this.ctx.strokeStyle = this.strokeStyle
        this.ctx.fillStyle = this.fillStyle
        this.ctx.lineWidth = this.lineWidth
    }

    /**
     * Returns the current width of canvas
     */
    get canvasWidth() {
        return this.canvas.width
    }

    /**
     * Returns the current height of canvas
     */
    get canvasHeight() {
        return this.canvas.height
    }

    get paintedImageWidth() {
        return this.canvas.width - 2 * this.pointRadius
    }

    get paintedImageHeight() {
        return this.canvas.height - 2 * this.pointRadius
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

            if (this.height && this.width) {
                // set height and width
                // content size fit
                const imgAspRatio = this.imageWidth / this.imageHeight,
                    boxAspRatio = this.width / this.height
                // image is "wider" than the box, thus width is limited
                if (imgAspRatio > boxAspRatio) {
                    this.canvas.width = this.width
                    this.canvas.height = this.width * this.imageHeight / this.imageWidth
                } else {
                    this.canvas.height = this.height
                    this.canvas.width = this.height * this.imageWidth / this.imageHeight
                }
            } else if (this.width) {
                // auto height
                this.canvas.width = this.width
                this.canvas.height = this.width * this.imageHeight / this.imageWidth
            } else if (this.height) {
                // auto width
                this.canvas.height = this.height
                this.canvas.width = this.height * this.imageWidth / this.imageHeight
            } else {
                // size of image
                this.canvas.height = this.imageHeight + 2 * this.pointRadius
                this.canvas.width = this.imageWidth + 2 * this.pointRadius
            }
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
            this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
            this.ctx.drawImage(img, ...this.imageToCanvas(0, 0),
                this.canvasWidth - 2 * this.pointRadius,
                this.canvasHeight - 2 * this.pointRadius
            )
            then && then()
        }
        draw()
    }

    /**
     * Coerce the point to fit canvas dimension
     *
     * @param p
     */
    coerce(p: Point) {
        if (!this.imageLoaded) {
            throw TypeError("Image not loaded")
        }
        return {
            x: Math.max(Math.min(p.x, this.paintedImageWidth), 0),
            y: Math.max(Math.min(p.y, this.paintedImageHeight), 0),
        }
    }

    /**
     * Draws the quadrilateral created by the four points
     * passed in. In normal cases, use this as the `then`
     * callback to `drawImage` method
     *
     * @param points
     */
    drawFourPoints(points: FourPoints) {
        const pointsOrdered = points
            .map(imagePoint => {
                const [x, y] = this.imageToCanvas(imagePoint.x, imagePoint.y)
                return { x, y }
            })

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
    clientToCanvas(clientX: number, clientY: number): [number, number] {
        const rect = this.canvas.getBoundingClientRect()
        const canvasX = rect.x,
            canvasY = rect.y
        return [clientX - canvasX, clientY - canvasY]
    }

    /**
     * The image on canvas is not painted from top left to
     * leave space for the points.
     * This method converts canvas coordinate to the image coordinate
     *
     * @param canvasX
     * @param canvasY
     */
    canvasToImage(canvasX: number, canvasY: number): [number, number] {
        return [canvasX - this.pointRadius, canvasY - this.pointRadius]
    }

    /**
     * Inverse function of `canvasToImage`
     *
     * @param imageX
     * @param imageY
     */
    imageToCanvas(imageX: number, imageY: number): [number, number] {
        return [imageX + this.pointRadius, imageY + this.pointRadius]
    }

    /**
     * Returns the raw image coordinate based on coordinate of painted image
     *
     * @param paintedX
     * @param paintedY
     */
    paintedToRaw(paintedX: number, paintedY: number): [number, number] {
        if (!this.imageLoaded) {
            throw TypeError("Image not loaded")
        }
        return [
            paintedX / this.paintedImageWidth * this.imageWidth!,
            paintedY / this.paintedImageHeight * this.imageHeight!
        ]
    }

    /**
     * Inverse function of `paintedToRaw`
     *
     * @param rawX
     * @param rawY
     */
    rawToPainted(rawX: number, rawY: number): [number, number] {
        if (!this.imageLoaded) {
            throw TypeError("Image not loaded")
        }
        return [
            rawX / this.imageWidth! * this.paintedImageWidth,
            rawY / this.imageHeight! * this.paintedImageHeight
        ]
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