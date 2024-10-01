// POST /api/file

import { v4 as uuid } from 'uuid'
import { serverSupabaseClient } from '#supabase/server'
import type {BaseResponse, FilePostRequest} from "~/types/requests"

export default defineEventHandler(async (event): Promise<BaseResponse<CritiqueFileDesc>> => {
    const client = await serverSupabaseClient(event)
    const request = await readBody(event) as FilePostRequest

    const fileUuid = uuid()
    const { name, markup, raw } = request

    const { data, error } = await client.storage
        .from("markup")
        .upload(``, markup)

    return {
        success: true
    }
})