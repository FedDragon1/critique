// POST /api/file/tag

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type {BaseResponse, NewTagRequest} from "~/types/requests"
import { transformTag } from "~/server/utils/dbutils";
import {v4 as uuid} from "uuid";

export default defineEventHandler(async (event): Promise<BaseResponse<CritiqueTag>> => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)
    const request = await readBody(event) as NewTagRequest

    if (!user) {
        return {
            success: false,
            errorMessage: "No user"
        }
    }

    const newTag = {
        uuid: request.uuid ?? uuid(),
        name: request.name,
        type: request.type,
        created_at: request.createdAt,
        file_uuid: request.fileUuid,
        user_uuid: user.id
    }
    const { data, error } = await client
        .from("tag")
        // @ts-ignore
        .insert(newTag)
        .select()

    if (error) {
        return {
            success: false,
            errorMessage: error.message
        }
    }

    const ret: CritiqueTag = data.map(transformTag)[0]

    return {
        success: true,
        data: ret
    }
})