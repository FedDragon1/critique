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
    uuid: string,
    fileName: string,
    lastModified: number,
    preview: string,
    size: number,
    isFavorite: boolean
}

// transformed object
interface CritiqueFileMeta {
    uuid: string,
    fileName: string,
    lastModified: string,
    preview: string,
    size: string,
    isFavorite: boolean
}

// file

interface Critique {
    uuid: string,
    size: number,
    fileLink: string,
    previewLink: string,
    fileName: string,
    isFavorite: boolean,
    lastModified: string,
    userUuid: string
}

interface CritiqueCard {
    uuid: string,
    title: string,
    contentLink: string,
    fileUuid: string,
    userUuid: string,
}

interface CritiqueTag {
    uuid: string,
    name: string,
    type: "analysis" | "summary",
    fileUuid: string,
    userUuid: string,
}

interface CritiqueCardFull {
    uuid: string,
    title: string,
    contentLink: string,
    fileUuid: string,
    userUuid: string,
    tags: CritiqueTag[]
}

interface CritiqueTagFull {
    uuid: string,
    name: string,
    type: "analysis" | "summary",
    fileUuid: string,
    userUuid: string,
    cards: CritiqueCard[]
}

interface CritiqueFull {
    uuid: string,
    size: number,
    fileLink: string,
    previewLink: string,
    fileName: string,
    isFavorite: boolean,
    lastModified: string,
    cards: CritiqueCardFull[],
    tags: CritiqueTagFull[],
    userUuid: string
}

interface CritiqueCardStorage {
    originalText: string,
    critique: string
}