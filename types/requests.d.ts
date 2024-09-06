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

// file

interface CritiqueCard {
    uuid: number,
    title: string,
    analysis: string,
    tags: string[],
}

interface CritiqueTag {
    name: string,
    cards: number[],
    type: "analysis" | "summary"
}

interface CritiqueDocument {
    markup: string,
    raw: string
}

interface Critique {
    uuid: number,
    fileName: string,
    lastModified: number,
    size: number,
    isFavorite: boolean,
    document: CritiqueDocument,
    analysis: CritiqueCard[],
    tags: CritiqueTag[]
}