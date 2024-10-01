// get /api/user/[id]

import { serverSupabaseClient } from "#supabase/server";
import type {BaseResponse} from "~/types/requests";

export default defineEventHandler(async (event): Promise<BaseResponse<CritiqueUser>> => {
    const supabase = await serverSupabaseClient(event);
    const userId = getRouterParam(event, "id")

    if (!userId) {
        return {
            success: false,
            errorMessage: "Required parameter 'id' is not defined"
        }
    }

    const { data, error } = await supabase
        .from("user")
        .select("uuid, display_name, created_at, avatar, bytes_used")
        .eq("uuid", userId);

    if (error) {
        return {
            success: false,
            errorMessage: error.message
        }
    }

    if (!data.length) {
        return {
            success: false,
            errorMessage: "No user"
        }
    }

    const ret = data[0] as unknown as CritiqueUser

    return {
        success: true,
        data: ret
    }
})

