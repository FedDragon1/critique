import type {FourPoints} from "~/types/cvtypes";

interface TransformRequest {
    image: string  // base64
    points: FourPoints
}