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
        .select("uuid, display_name, created_at, avatar, bytes_used, email")
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

    const ret = data[0]
    const transformed: CritiqueUser = {
        avatar: ret.avatar,
        bytesUsed: ret.bytes_used,
        createdAt: ret.created_at,
        displayName: ret.display_name,
        uuid: ret.uuid,
        email: ret.email
    }

    return {
        success: true,
        data: transformed
    }
})

