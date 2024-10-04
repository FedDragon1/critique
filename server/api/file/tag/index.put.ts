// PUT /api/file/tag

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type {BaseResponse, UpdateTagRequest} from "~/types/requests"

export default defineEventHandler(async (event): Promise<BaseResponse<CritiqueTag>> => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)
    const request = await readBody(event) as UpdateTagRequest

    if (!user) {
        return {
            success: false,
            errorMessage: "No user"
        }
    }

    const updateData = {
        name: request.name,
        type: request.type
    }

    const { data, error } = await client
        .from("tag")
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

    const ret: CritiqueTag = data.map(transformTag)[0]

    return {
        success: true,
        data: ret
    }
})