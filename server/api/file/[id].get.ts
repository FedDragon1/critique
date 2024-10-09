// get /api/file/[id]

import type { BaseResponse } from "~/types/requests";
import {serverSupabaseClient, serverSupabaseUser} from "#supabase/server";
import {transformCritiqueFull} from "~/server/utils/dbutils";

export default defineEventHandler(async (event): Promise<BaseResponse<CritiqueFull>> => {
    const fileUuid = getRouterParam(event, 'id')

    if (!fileUuid) {
        return {
            success: false,
            errorMessage: "No file uuid specified"
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
        .from("file")
        .select("uuid, created_at, modified_at, size, favorite, file_name, preview_link, file_link, user_uuid, " +
            "card(*, tag(*)), tag(*, card(*))")
        .eq("user_uuid", user.id)
        .eq("uuid", fileUuid)

    if (error) {
        return {
            success: false,
            errorMessage: error.message
        }
    }
    if (data.length > 1) {
        return {
            success: false,
            errorMessage: "Multiple files with the same uuid"
        }
    }
    if (!data.length) {
        return {
            success: false,
            errorMessage: "No file found with the uuid"
        }
    }

    const ret: CritiqueFull = data.map(transformCritiqueFull)[0]

    return {
        success: true,
        data: ret
    }
})