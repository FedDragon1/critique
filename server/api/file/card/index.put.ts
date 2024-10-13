// PUT /api/file/card

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type {BaseResponse, UpdateCardRequest} from "~/types/requests"
import {transformCard} from "~/server/utils/dbutils";

export default defineEventHandler(async (event): Promise<BaseResponse<CritiqueCard>> => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)
    const request = await readBody(event) as UpdateCardRequest

    if (!user) {
        return {
            success: false,
            errorMessage: "No user"
        }
    }

    // the content of a card is changed
    if (request.data) {
        const cardSerialized = JSON.stringify(request.data)
        const { data: storageLink, error: storageError } = await client.storage
            .from("card")
            .upload(`${user.id}/${request.uuid}.json`, cardSerialized, {
                upsert: true
            })

        if (storageError || !storageLink) {
            return {
                success: false,
                errorMessage: storageError.message
            }
        }
    }

    // the storage link is never changed during an update
    const updateData = {
        title: request.title,
        node: request.node,
        from: request.from,
        to: request.to
    }

    const { data, error } = await client
        .from("card")
        // @ts-ignore
        .update(updateData)
        .eq("uuid", request.uuid)
        .select()

    if (error) {
        return {
            success: false,
            errorMessage: error.message
        }
    }

    const ret: CritiqueCard = data.map((critique) =>
        transformCard(critique)
    )[0]

    return {
        success: true,
        data: ret
    }
})