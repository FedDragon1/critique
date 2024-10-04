// GET /api/file/recent

import {serverSupabaseClient, serverSupabaseUser} from "#supabase/server";
import {transformCritiqueFull} from "~/server/utils/dbutils";
import {BaseResponse} from "~/types/requests";

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
            "card(uuid, created_at, title, content_link, file_uuid, user_uuid, tag(*)), tag(*, card(*))")
        .eq("user_uuid", user.id)
        .order("modified_at", { ascending: false })
        .limit(10)

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