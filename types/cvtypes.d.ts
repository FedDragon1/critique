import type {Point} from "@techstark/opencv-js";

interface Contour {
    area: number,
    points: Point[]
}

type FourPoints = [Point, Point, Point, Point]

export type NotArray = (object | string | bigint | number | boolean) & { length?: never; };