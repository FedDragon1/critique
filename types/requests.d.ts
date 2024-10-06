import type {FourPoints} from "~/types/cvtypes";

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

interface NewCardRequest {
    uuid?: string,
    createdAt?: string,
    title: string,
    fileUuid: string,
    data: CritiqueCardStorage
}

interface UpdateCardRequest {
    uuid: string,
    title?: string,
    data?: CritiqueCardStorage
}

interface DeleteCardRequest {
    uuids: string[]
}

interface NewTagRequest {
    uuid?: string,
    createdAt?: string,
    name: string,
    type: string
    fileUuid: string,
}

interface UpdateTagRequest {
    uuid: string,
    name?: string,
    type?: string
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
    previewBase64?: string
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
