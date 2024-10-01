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

interface FilePostRequest {
    name: string,
    markup: string,
    raw: string
}

interface UserPostRequest {
    name: string,
    uuid: string,
    email: string,
    avatar?: string,
    validated: boolean
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