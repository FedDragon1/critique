// GET /api/file/tag

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { BaseResponse } from "~/types/requests"
import {transformTagFull} from "~/server/utils/dbutils";

export default defineEventHandler(async (event): Promise<BaseResponse<CritiqueTagFull[]>> => {
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

    if (error) {
        return {
            success: false,
            errorMessage: error.message
        }
    }

    const ret: CritiqueTagFull[] = data.map((dbTag) => transformTagFull(dbTag))

    return {
        success: true,
        data: ret
    }
})