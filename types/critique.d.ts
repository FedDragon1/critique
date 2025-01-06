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

interface AnalysisCard {
    content: string
    title: string
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
        action: () => void
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
    bytesUsed: number,
    email: string
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

type CardType = "analysis" | "summary" | "question";

interface CritiqueCard {
    uuid: string,
    title: string,
    type: CardType,
    node: string | null,
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
    type: CardType,
    createdAt: string,
    fileUuid: string,
    userUuid: string,
}

interface CritiqueCardFull {
    uuid: string,
    title: string,
    type: CardType,
    node: string | null,
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
    type: CardType,
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
    select: () => void
}

interface CritiqueUnderline {
    node: string,
    from: number,
    to: number
}

type CritiqueEvents = {
    "critique-select": CritiqueSelect,
    "critique-focus": CritiqueUnderline,
    "critique-unselect": CritiqueUnselect,
    "critique-underline": CritiqueUnderline,
    "critique-underline-focus": CritiqueUnderline,
    "critique-remove-underline-focus": CritiqueUnderline,
    "critique-remove-underline": CritiqueUnderline,
    "critique-hover": CritiqueUnderline,
    "critique-remove-hover": CritiqueUnderline,
    "critique-toggle": void,
    "context-menu-off": string | undefined
}

interface CardOffset {
    card: CritiqueCardFull,
    offset: number,
}

interface TaggingCard {
    uuid: string,
    type: CardType,
    title: string,
    content: CritiqueCardStorage
}

interface TaggingTag {
    uuid: string,
    type: CardType,
    name: string
}

interface DocumentOptions {
    view: "icon" | "list"
    sortBy: "date" | "name" | "size"
    order: "ascending" | "descending"
}

interface ContextMenuEntry {
    icon: any,
    text: string,
    callback?: () => void,
    hotkey?: string,
    divided?: boolean
}

interface FileListEntry {
    uuid: string
    type: "file" | "folder"
    name: string,
    lastModified: string,
    size: string,
}

interface FileType {
    uuid: string,
    name: string,
    lastModified: string,
    preview: string,
    size: number
}

interface FolderType {
    uuid: string,
    name: string,
    lastModified: string,
    size: number
}