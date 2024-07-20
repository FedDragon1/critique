interface Point {
    x: number,
    y: number
}

interface Contour {
    area: number,
    points: Point[]
}

type FourPoints = [Point, Point, Point, Point]

export type NotArray = (object | string | bigint | number | boolean) & { length?: never; };

interface CanvasOptions {
    strokeStyle?: string,
    fillStyle?: string,
    lineWidth?: number,
    pointRadius?: number,
    pointFill?: string,
    height?: number,
    width?: number
}

interface UploadedImage {
    url: string,
    image: string
    canny: string
}
