// POST /api/file/group

import type {BaseResponse, NewCardTagRequest} from "~/types/requests";
import {serverSupabaseClient, serverSupabaseUser} from "#supabase/server";

export default defineEventHandler(async (event): Promise<BaseResponse<void>> => {
    const request = await readBody(event) as NewCardTagRequest
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        return {
            success: false,
            errorMessage: "No user"
        }
    }

    if (request.cardType !== request.tagType) {
        return {
            success: false,
            errorMessage: `Mismatch in card type ${request.cardType} and ${request.tagType}`
        }
    }

    const { error } = await client
        .from("card_tag")
        // @ts-ignore
        .insert({
            tag_uuid: request.tagUuid,
            card_uuid: request.cardUuid,
            user_uuid: user.id
        });

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