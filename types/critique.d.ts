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
    type: "analysis" | "summary" | "question",
    createdAt: string,
    contentLink: string,
    fileUuid: string,
    userUuid: string,
}

interface CritiqueTag {
    uuid: string,
    name: string,
    type: "analysis" | "summary" | "question",
    createdAt: string,
    fileUuid: string,
    userUuid: string,
}

interface CritiqueCardFull {
    uuid: string,
    title: string,
    type: "analysis" | "summary" | "question",
    createdAt: string,
    contentLink: string,
    fileUuid: string,
    userUuid: string,
    tags: { [uuid: string]: CritiqueTag }
}

interface CritiqueTagFull {
    uuid: string,
    name: string,
    type: "analysis" | "summary" | "question",
    createdAt: string,
    fileUuid: string,
    userUuid: string,
    cards: { [uuid: string]: CritiqueCard }
}

interface CritiqueFull {
    uuid: string,
    size: number,
    fileLink: string,
    previewLink: string,
    fileName: string,
    isFavorite: boolean,
    lastModified: string,
    cards: { [uuid: string]: CritiqueCardFull },
    tags: { [uuid: string]: CritiqueTagFull },
    userUuid: string
}

interface CritiqueCardStorage {
    originalText: string,
    critique: string
}

type GenericTabTypes = "cards" | "analysis" | "summary" | "questions"

interface AllCardsTab {
    display: "Cards"
    type: "generic",
    uuid: "cards"
}

interface AllAnalysisTab {
    display: "Analysis"
    type: "generic",
    uuid: "analysis"
}

interface AllSummaryTab {
    display: "Summary"
    type: "generic",
    uuid: "summary"
}

interface AllQuestionsTab {
    display: "Questions"
    type: "generic",
    uuid: "questions"
}

type GenericTabs = AllCardsTab | AllAnalysisTab | AllQuestionsTab | AllSummaryTab

interface CardTab {
    display: string,
    type: "card",
    uuid: string
}

interface TagTab {
    display: string,
    type: "tag",
    uuid: string
}

type Tab = GenericTabs | CardTab | TagTab