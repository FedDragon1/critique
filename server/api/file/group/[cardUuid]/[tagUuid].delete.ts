// DELETE /api/file/group/[cardUuid]/[tagUuid]

import type { BaseResponse } from "~/types/requests";
import {serverSupabaseClient, serverSupabaseUser} from "#supabase/server";

export default defineEventHandler(async (event): Promise<BaseResponse<void>> => {
    const { cardUuid, tagUuid } = getRouterParams(event)
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        return {
            success: false,
            errorMessage: "No user"
        }
    }

    const { error } = await client
        .from("card_tag")
        .delete()
        .eq("card_uuid", cardUuid)
        .eq("tag_uuid", tagUuid)
        .eq("user_uuid", user.id);

    if (error) {
        return {
            success: false,
            errorMessage: error.message
        }
    }

    return {
        success: true,
    }
})