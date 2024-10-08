// get /api/file/card/[id]

import type { BaseResponse } from "~/types/requests";
import {serverSupabaseClient, serverSupabaseUser} from "#supabase/server";
import {transformCardFull} from "~/server/utils/dbutils";

export default defineEventHandler(async (event): Promise<BaseResponse<CritiqueCardFull>> => {
    const cardUuid = getRouterParam(event, 'id')

    if (!cardUuid) {
        return {
            success: false,
            errorMessage: "No card uuid specified"
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
        .from("card")
        .select("uuid, created_at, file_uuid, title, user_uuid, content_link, type, tag(*)")
        .eq("user_uuid", user.id)
        .eq("uuid", cardUuid)

    if (error) {
        return {
            success: false,
            errorMessage: error.message
        }
    }
    if (data.length > 1) {
        return {
            success: false,
            errorMessage: "Multiple cards with the same uuid"
        }
    }
    if (!data.length) {
        return {
            success: false,
            errorMessage: "No card found with the uuid"
        }
    }

    const ret: CritiqueCardFull = data.map((dbCard) => transformCardFull(dbCard))[0]

    return {
        success: true,
        data: ret
    }
})