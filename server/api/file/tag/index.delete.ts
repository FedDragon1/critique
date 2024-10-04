// DELETE /api/file/tag

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type {BaseResponse, DeleteTagRequest} from "~/types/requests"

export default defineEventHandler(async (event): Promise<BaseResponse<CritiqueTag[]>> => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)
    const request = await readBody(event) as DeleteTagRequest

    if (!user) {
        return {
            success: false,
            errorMessage: "No user"
        }
    }

    const { data, error } = await client
        .from("tag")
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

    const ret: CritiqueTag[] = data.map(transformTag)

    return {
        success: true,
        data: ret
    }
})