// GET /api/file

import type { BaseResponse } from "~/types/requests";
import {serverSupabaseClient, serverSupabaseUser} from "#supabase/server";
import {transformCritiqueFull} from "~/server/utils/dbutils";

export default defineEventHandler(async (event): Promise<BaseResponse<CritiqueFull[]>> => {
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

    if (error) {
        return {
            success: false,
            errorMessage: error.message
        }
    }

   const ret: CritiqueFull[] = data.map(transformCritiqueFull)
    return {
        success: true,
        data: ret
    }
})