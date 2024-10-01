// POST /api/user/verify

import { serverSupabaseClient } from '#supabase/server'
import type {BaseResponse, VerifyUserRequest} from "~/types/requests"

// Checks whether a user with the email already exists
export default defineEventHandler(async (event): Promise<BaseResponse<CritiqueUser>> => {
    const client = await serverSupabaseClient(event)
    const request = await readBody(event) as VerifyUserRequest

    const resp = await client
        .from('user')
        // @ts-ignore
        .update({ validated: true, bytes_used: 4 })
        .eq("uuid", request.uuid)
        .select()

    if (resp.error) {
        return {
            success: false,
            errorMessage: resp.error.message
        }
    }

    const ret = (resp.data as CritiqueUser[])[0]

    if (!ret) {
        return {
            success: false,
            errorMessage: `Failed to update user ${request.uuid}`
        }
    }

    console.log(`Verified user: `, ret)

    return {
        success: true,
        data: ret
    }
})