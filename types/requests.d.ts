import type {FourPoints} from "~/types/cvtypes";

interface TransformRequest {
    image: string  // base64
    points: FourPoints
}

// database store
interface CritiqueFileDesc {
    uuid: number,
    fileName: string,
    lastModified: number,
    preview: string,
    size: number,
    isFavorite: boolean
}

// transformed object
interface CritiqueFileMeta {
    uuid: number,
    fileName: string,
    lastModified: string,
    preview: string,
    size: string,
    isFavorite: boolean
}