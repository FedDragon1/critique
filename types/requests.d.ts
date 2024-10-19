import type {FourPoints} from "~/types/cvtypes";
import OpenAI from "openai";

interface BaseResponse<T> {
    success: boolean,
    errorMessage?: string,
    data?: T
}

interface TransformRequest {
    image: string  // base64
    points: FourPoints
}

interface FixRequest {
    context: string,
    total: number
}

interface FormatRequest {
    segments: string[]
}

interface MergeRequest {
    tail: string,
    head: string
}

interface ReviseRequest {
    selection: string
}

interface RotateImageRequest {
    image: string,
    degrees: number
}

interface EmailExistRequest {
    email: string
}

interface VerifyUserRequest {
    uuid: string
}

interface EmailExistResponse {
    exist: boolean,
    verified: boolean
}

interface NewUserRequest {
    name: string,
    uuid: string,
    email: string,
    avatar?: string,
    validated: boolean
}

type CardType = "analysis" | "summary" | "question";

interface NewCardRequest {
    uuid?: string,
    createdAt?: string,
    node?: string,
    from?: number,
    to?: number,
    type: CardType,
    title: string,
    fileUuid: string,
    data: CritiqueCardStorage
}

interface UpdateCardRequest {
    uuid: string,
    title?: string,
    node?: string,
    from?: number,
    to?: number,
    data?: CritiqueCardStorage
}

interface DeleteCardRequest {
    uuids: string[]
}

interface NewTagRequest {
    uuid?: string,
    createdAt?: string,
    name: string,
    type: CardType
    fileUuid: string,
}

interface UpdateTagRequest {
    uuid: string,
    name?: string,
    type?: CardType
}

interface DeleteTagRequest {
    uuids: string[]
}

interface NewFileRequest {
    uuid?: string,
    createdAt?: string,
    modifiedAt?: string,
    size?: number,
    favorite?: boolean,
    fileName: string,
    dataMarkUp: string,
    previewBase64?: string,
    summary: string
}

interface UpdateFileRequest {
    uuid: string,
    modifiedAt?: string,
    size?: number,
    favorite?: boolean,
    fileName?: string,
    dataMarkUp?: string,
    previewBase64?: string
}

interface DeleteFileRequest {
    uuids: string[]
}

interface NewCardTagRequest {
    cardUuid: string,
    tagUuid: string,
    cardType: CardType,
    tagType: CardType
}

type Messages = OpenAI.Chat.Completions.ChatCompletionMessageParam[]

interface ChatRequest {
    summary: string
    context?: string
    messages: Messages
}

interface SummaryRequest {
    chunks: string[]
}

interface CritiqueRequest {
    summary: string,
    context: string,
    messages: Messages
}

type AnnotateRequest = CritiqueRequest
type SummarizeRequest = CritiqueRequest
type QuestionRequest = CritiqueRequest

interface TaggingRequest {
    cards: TaggingCard[]
    tags: {
        [key in CardType]?: TaggingTag[]
    }
}

interface NewTag {
    name: string,
    type: CardType,
    cards: string[]
}

interface ReuseTag {
    uuid: string
    type: CardType,
    cards: string[]
}

type TaggingResponse = {
    new: NewTag[],
    reuse: ReuseTag[]
}

interface TitleRequest {
    content: string
}

interface PunctuationRequest {
    content: string[]
}
