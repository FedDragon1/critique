// PUT /api/file

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type {BaseResponse, UpdateFileRequest} from "~/types/requests"

export default defineEventHandler(async (event): Promise<BaseResponse<Critique>> => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)
    const request = await readBody(event) as UpdateFileRequest

    if (!user) {
        return {
            success: false,
            errorMessage: "No user"
        }
    }

    if (request.dataMarkUp) {
        const { data: storageLink, error: storageError } = await client.storage
            .from("file")
            .upload(`${user.id}/${request.uuid}.ctq`, request.dataMarkUp, {
                upsert: true
            })

        if (storageError || !storageLink) {
            return {
                success: false,
                errorMessage: storageError.message
            }
        }
    }

    if (request.previewBase64) {
        const { data: storageLink, error: storageError } = await client.storage
            .from("file-preview")
            .upload(`${user.id}/${request.uuid}`, request.previewBase64, {
                upsert: true
            })

        if (storageError || !storageLink) {
            return {
                success: false,
                errorMessage: storageError.message
            }
        }
    }

    const updateData = {
        modified_at: request.modifiedAt,
        size: request.size,
        favorite: request.favorite,
        file_name: request.fileName
    }
    const { data, error } = await client
        .from("file")
        // @ts-ignore
        .update(updateData)
        .eq("uuid", request.uuid)
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