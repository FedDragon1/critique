type Status = "success" | "error" | "warning"

interface OcrResult {
    status: Status,
    errorMessage?: string,
    warningMessage?: string,
    data?: OcrData
}

interface OcrData {
    paragraphs: OcrParagraph[],
    confidence: number
}

interface OcrParagraph {
    segments: OcrSegment[]
}

interface OcrSegment {
    text: string,
    isLowConfidence: boolean
}

interface OcrSegmentIntermediate {
    words: string[],
    isLowConfidence: boolean
}

interface OsdResult {
    status: Status,
    errorMessage?: string,
    warningMessage?: string,
    data?: Buffer
}
