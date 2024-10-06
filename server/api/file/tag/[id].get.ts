// get /api/file/tag/[id]

import type { BaseResponse } from "~/types/requests";
import {serverSupabaseClient, serverSupabaseUser} from "#supabase/server";

export default defineEventHandler(async (event): Promise<BaseResponse<CritiqueTagFull>> => {
    const tagUuid = getRouterParam(event, 'id')

    if (!tagUuid) {
        return {
            success: false,
            errorMessage: "No tag uuid specified"
        }
    }

    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        return {
            success: false,
            errorMessage: "No user"
        }
    }

    const { data, error } = await client
        .from("tag")
        .select("uuid, name, file_uuid, type, user_uuid, created_at, card(*)")
        .eq("user_uuid", user.id)
        .eq("uuid", tagUuid)

    if (error) {
        return {
            success: false,
            errorMessage: error.message
        }
    }
    if (data.length > 1) {
        return {
            success: false,
            errorMessage: "Multiple tags with the same uuid"
        }
    }
    if (!data.length) {
        return {
            success: false,
            errorMessage: "No tag found with the uuid"
        }
    }

    const ret: CritiqueTagFull = data.map((dbTag) => transformTagFull(dbTag))[0]

    return {
        success: true,
        data: ret
    }
})