// POST /api/file

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type {BaseResponse, NewFileRequest} from "~/types/requests"
import { v4 as uuid } from 'uuid'

export default defineEventHandler(async (event): Promise<BaseResponse<Critique>> => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)
    const request = await readBody(event) as NewFileRequest

    if (!user) {
        return {
            success: false,
            errorMessage: "No user"
        }
    }

    const fileUuid = request.uuid ?? uuid()
    const { data: storageLink, error: storageError } = await client.storage
        .from("file")
        .upload(`${user.id}/${fileUuid}.ctq`, request.dataMarkUp)

    if (storageError || !storageLink) {
        console.error(storageError.message)
        return {
            success: false,
            errorMessage: storageError.message
        }
    }

    let preview = undefined;
    if (request.previewBase64) {
        // base64 encoded
        const { data: previewLink, error: previewError } = await client.storage
            .from("file-preview")
            .upload(`${user.id}/${fileUuid}`, request.previewBase64)

        if (previewError || !previewLink) {
            console.error(previewError.message)
            return {
                success: false,
                errorMessage: previewError.message
            }
        }
        preview = previewLink.path
    }

    const insertData = {
        uuid: fileUuid,
        file_name: request.fileName,
        created_at: request.createdAt,
        modified_at: request.modifiedAt,
        size: request.size,
        favorite: request.favorite,
        user_uuid: user.id,
        preview_link: preview,
        file_link: storageLink.path
    }

    const { data, error } = await client
        .from("file")
        // @ts-ignore
        .insert(insertData)
        .select()

    if (error) {
        return {
            success: false,
            errorMessage: error.message
        }
    }

    const ret: Critique = data.map(transformCritique)[0]

    return {
        success: true,
        data: ret
    }
})