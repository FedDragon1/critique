// DELETE /api/file/card

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type {BaseResponse, DeleteCardRequest} from "~/types/requests"
import {transformCard} from "~/server/utils/dbutils";

export default defineEventHandler(async (event): Promise<BaseResponse<CritiqueCard[]>> => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)
    const request = await readBody(event) as DeleteCardRequest

    if (!user) {
        return {
            success: false,
            errorMessage: "No user"
        }
    }

    const removingUrls = request.uuids.map(id => `${user.id}/${id}.json`)

    console.log(removingUrls)

    const { error: storageError } = await client.storage
        .from("card")
        .remove(removingUrls)

    if (storageError) {
        console.error(storageError.message)
        return {
            success: false,
            errorMessage: storageError.message
        }
    }

    const { data, error } = await client
        .from("card")
        .delete()
        .in("uuid", request.uuids)
        .select()

    if (error) {
        return {
            success: false,
            errorMessage: error.message
        }
    }

    if (!data.length) {
        return {
            success: false,
            errorMessage: "No entry was deleted"
        }
    }

    const ret: CritiqueCard[] = data.map((critique) =>
        transformCard(critique)
    )

    return {
        success: true,
        data: ret
    }
})