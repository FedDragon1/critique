// DELETE /api/file

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type {BaseResponse, DeleteFileRequest} from "~/types/requests"

export default defineEventHandler(async (event): Promise<BaseResponse<Critique[]>> => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)
    const request = await readBody(event) as DeleteFileRequest

    if (!user) {
        return {
            success: false,
            errorMessage: "No user"
        }
    }

    const removingFiles = request.uuids.map(id => `${user.id}/${id}.ctq`)
    const removingPreviews = request.uuids.map(id => `${user.id}/${id}`)

    const { error: fileStorageError } = await client.storage
        .from("file")
        .remove(removingFiles)

    if (fileStorageError) {
        console.error(fileStorageError.message)
        return {
            success: false,
            errorMessage: fileStorageError.message
        }
    }

    const { error: previewStorageError } = await client.storage
        .from("file-preview")
        .remove(removingPreviews)

    if (previewStorageError) {
        console.error(previewStorageError.message)
        return {
            success: false,
            errorMessage: previewStorageError.message
        }
    }

    const { data, error } = await client
        .from("file")
        .delete()
        .in("uuid", request.uuids)
        .select()

    if (error) {
        return {
            success: false,
            errorMessage: error.message
        }
    }

    if (!data.length) {
        return {
            success: false,
            errorMessage: "No entry was deleted"
        }
    }

    const ret: Critique[] = data.map(transformCritique)

    return {
        success: true,
        data: ret
    }
})