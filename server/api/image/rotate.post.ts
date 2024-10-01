// post /api/image/rotate

import {rotateImage} from "~/server/utils/cvutils";
import {BaseResponse, RotateImageRequest} from "~/types/requests";

export default defineEventHandler(async (event): Promise<BaseResponse<string>> => {
    const request = await readBody(event) as RotateImageRequest
    const buffer = Buffer.from(request.image, "base64")

    await opencvReady()
    try {
        const sharp = await rotateImage(buffer, request.degrees)
        const ret = (await sharp.png().toBuffer()).toString("base64")
        return {
            data: ret,
            success: true
        };
    } catch(e) {
        return {
            success: false,
            errorMessage: (e as unknown as Error).message
        }
    }
})