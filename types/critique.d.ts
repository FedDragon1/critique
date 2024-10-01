interface QuickActions {
    [action: string]: {
        icon: any,
        caption: string,
        handler: (...args: any[]) => void
    }
}

interface Message {
    from: "user" | "critique",
    content: string,
    uuid: string
}

interface ViewModes {
    [mode: string]: {
        display: string,
        callback: () => any
    }
}

interface ShortCut {
    [shortCut: string]: {
        display: string,
        hotkey: string,
        callback: () => any
    }
}

interface UserActions {
    display: string,
    icon: any   // font-awesome
    callback: () => any
}

interface CritiqueUser {
    uuid: string,
    displayName: string,
    createdAt: number,
    avatar: string,
    bytesUsed: number
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
