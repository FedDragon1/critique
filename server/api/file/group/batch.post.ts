// POST /api/file/group/batch

import type {BaseResponse, NewCardTagRequest} from "~/types/requests";
import {serverSupabaseClient, serverSupabaseUser} from "#supabase/server";

export default defineEventHandler(async (event): Promise<BaseResponse<void>> => {
    const request = await readBody(event) as NewCardTagRequest[]
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        return {
            success: false,
            errorMessage: "No user"
        }
    }

    if (request.some(r => r.tagType !== r.cardType)) {
        return {
            success: false,
            errorMessage: `Mismatch in card type and tag type`
        }
    }

    const body = request.map(r => ({
        tag_uuid: r.tagUuid,
        card_uuid: r.cardUuid,
        user_uuid: user.id
    }))

    const { error } = await client
        .from("card_tag")
        // @ts-ignore
        .insert(body);

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