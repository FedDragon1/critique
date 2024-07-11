// POST /api/image/segment

/*
Request body:
binary file

Response body:
{
    success: boolean,
    mask: //TODO: unknown SAM type
}

Process:
    1. Read the image
    2. Extract document page with segment anything
    3. Return the segmented mask
 */

export default defineEventHandler(async (event) => {
    let request = await readBody(event);

})