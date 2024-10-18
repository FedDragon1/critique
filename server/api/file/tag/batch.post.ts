// POST /api/file/tag/batch

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type {BaseResponse, NewTagRequest} from "~/types/requests"
import { transformTag } from "~/server/utils/dbutils";
import {v4 as uuid} from "uuid";

export default defineEventHandler(async (event): Promise<BaseResponse<CritiqueTag[]>> => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)
    const request = await readBody(event) as NewTagRequest[]

    if (!user) {
        return {
            success: false,
            errorMessage: "No user"
        }
    }

    const newTags = request.map(r => ({
        uuid: r.uuid ?? uuid(),
        name: r.name,
        type: r.type,
        created_at: r.createdAt,
        file_uuid: r.fileUuid,
        user_uuid: user.id
    }))
    const { data, error } = await client
        .from("tag")
        // @ts-ignore
        .insert(newTags)
        .select()

    if (error) {
        return {
            success: false,
            errorMessage: error.message
        }
    }

    const ret: CritiqueTag[] = data.map(transformTag)

    return {
        success: true,
        data: ret
    }
})