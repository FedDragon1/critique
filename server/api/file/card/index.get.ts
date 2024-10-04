// GET /api/file/card

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { BaseResponse } from "~/types/requests"
import {transformCardFull} from "~/server/utils/dbutils";

export default defineEventHandler(async (event): Promise<BaseResponse<CritiqueCardFull[]>> => {
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
        .select("uuid, created_at, file_uuid, title, user_uuid, content_link, tag(*)")
        .eq("user_uuid", user.id)

    console.log(data, error)

    if (error) {
        return {
            success: false,
            errorMessage: error.message
        }
    }

    const ret: CritiqueCardFull[] = data.map((dbCard) => transformCardFull(dbCard))

    return {
        success: true,
        data: ret
    }
})