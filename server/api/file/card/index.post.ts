// POST /api/file/card

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type {BaseResponse, NewCardRequest} from "~/types/requests"
import {transformCard} from "~/server/utils/dbutils";
import { v4 as uuid } from 'uuid'

export default defineEventHandler(async (event): Promise<BaseResponse<CritiqueCard>> => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)
    const request = await readBody(event) as NewCardRequest

    if (!user) {
        return {
            success: false,
            errorMessage: "No user"
        }
    }

    const cardUuid = request.uuid ?? uuid()
    const cardSerialized = JSON.stringify(request.data)
    const { data: storageLink, error: storageError } = await client.storage
        .from("card")
        .upload(`${user.id}/${cardUuid}.json`, cardSerialized)

    if (storageError || !storageLink) {
        return {
            success: false,
            errorMessage: storageError.message
        }
    }

    const insertData = {
        uuid: cardUuid,
        type: request.type,
        created_at: request.createdAt,
        title: request.title,
        file_uuid: request.fileUuid,
        user_uuid: user.id,
        node: request.node,
        from: request.from,
        to: request.to,
        content_link: storageLink.path
    }

    const { data, error } = await client
        .from("card")
        // @ts-ignore
        .insert(insertData)
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