// POST /api/user

import {serverSupabaseServiceRole } from '#supabase/server'
import type {BaseResponse, UserPostRequest} from "~/types/requests";

export default defineEventHandler(async (event): Promise<BaseResponse<CritiqueUser>> => {
    const service = serverSupabaseServiceRole(event)
    const request = await readBody(event) as UserPostRequest

    if (!request.uuid) {
        return {
            success: false,
            errorMessage: "Attribute 'id' does not exist on the user"
        }
    }

    const { data, error } = await service
        .from("user")
        // @ts-ignore
        .insert({
            uuid: request.uuid,
            display_name: request.name,
            avatar: request.avatar
        })
        .select()

    if (error) {
        return {
            success: false,
            errorMessage: error.message
        }
    }

    const ret = data as CritiqueUser[]

    return {
        success: true,
        data: ret[0]
    }
})