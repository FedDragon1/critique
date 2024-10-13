interface QuickActions {
    [action: string]: {
        icon: any,
        caption: string,
        handler: (...args: any[]) => void
    }
}

interface Message {
    content: string,
    role: "assistant" | "user"
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

type MapOf<T> = { [uuid: string]: T }
type HaveUuid = { uuid: string }

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
    node: string,
    from: number | null,
    to: number | null,
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
    node: string,
    from: number | null,
    to: number | null,
    createdAt: string,
    contentLink: string,
    fileUuid: string,
    userUuid: string,
    tags: MapOf<CritiqueTag>
}

interface CritiqueTagFull {
    uuid: string,
    name: string,
    type: "analysis" | "summary" | "question",
    createdAt: string,
    fileUuid: string,
    userUuid: string,
    cards: MapOf<CritiqueCard>
}

interface CritiqueFull {
    uuid: string,
    size: number,
    fileLink: string,
    previewLink: string,
    fileName: string,
    isFavorite: boolean,
    lastModified: string,
    cards: MapOf<CritiqueCardFull>,
    tags: MapOf<CritiqueTagFull>,
    userUuid: string
}

interface CritiqueCardStorage {
    originalText: string,
    critique: string,
}

type GenericTabTypes = "cards" | "analysis" | "summary" | "questions"

interface AllCardsTab {
    display: "Cards"
    type: "generic",
    uuid: "cards",
    content: () => MapOf<CritiqueCardFull>
}

interface AllAnalysisTab {
    display: "Analysis"
    type: "generic",
    uuid: "analysis",
    content: () => MapOf<CritiqueTagFull>
}

interface AllSummaryTab {
    display: "Summary"
    type: "generic",
    uuid: "summary",
    content: () => MapOf<CritiqueTagFull>
}

interface AllQuestionsTab {
    display: "Questions"
    type: "generic",
    uuid: "questions",
    content: () => MapOf<CritiqueTagFull>
}

type GenericTabs = AllCardsTab | AllAnalysisTab | AllQuestionsTab | AllSummaryTab

interface CardTab {
    display: string,
    type: "card",
    uuid: string,
    content: () => CritiqueCardFull
}

interface TagTab {
    display: string,
    type: "tag",
    uuid: string,
    content: () => MapOf<CritiqueCardFull>
}

type Tab = GenericTabs | CardTab | TagTab

interface CritiqueSelect {
    uuid: string,
    hash: string,
    content: string,
    node: string,
    index: number,
    dom: HTMLElement | null,
    unselect: () => void
}

interface SelectionRegistry {
    [uuid: string]: CritiqueSelect
}

interface CritiqueUnselect {
    uuid: string,
    hash: string,
}

type CritiqueEvents = {
    "critique-select": CritiqueSelect,
    "critique-unselect": CritiqueUnselect
}