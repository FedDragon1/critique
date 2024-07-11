// post /api/image/scan

import cv from "@techstark/opencv-js"
import sharp from 'sharp'

/*
Request body:
multipart form
  - 1x binary file

Response body:
{
    success: boolean,
    data: {}
}

Process:
    1. Read the image
    2. Preprocess image
    3. Paragraph bounding box detection (yolov8)
    4. OCR of each bounding box
 */

export default defineEventHandler(async (event) => {
    const request = await readMultipartFormData(event)

    // ideally there should only be 1 image
    const file = request![0]

    console.log("4")

    // preprocess
    const { data, info} = await sharp(file["data"])
        .ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    const { width, height } = info

    const image = cv.matFromImageData({ data, width, height })
    const dst = new cv.Mat()

    cv.cvtColor(image, image, cv.COLOR_BGR2GRAY)    // greyscale
    cv.GaussianBlur(image, image, new cv.Size(5, 5), 0)
    cv.Canny(image, dst, 75, 200)


    const output = sharp(Buffer.from(dst.data), {
        raw: {
            width,
            height,
            channels: 1
        }
    }).png();


    const ret = {
        success: true,
        data: `${(await output.png().toBuffer()).toString("base64")}`
    }

    image.delete()
    dst.delete()

    return ret
})
