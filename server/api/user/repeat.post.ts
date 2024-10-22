// POST /api/user/repeat

import { serverSupabaseServiceRole } from '#supabase/server'
import type {BaseResponse, EmailExistRequest, EmailExistResponse} from "~/types/requests"

// Checks whether a user with the email already exists
export default defineEventHandler(async (event): Promise<BaseResponse<EmailExistResponse>> => {
    const client = serverSupabaseServiceRole(event)
    const request = await readBody(event) as EmailExistRequest

    const { data, error } = await client
        .from('user')
        .select('email, validated')
        .eq('email', request.email)

    console.log(`Repeat user: `, data)

    if (error) {
        return {
            success: false,
            errorMessage: error.message
        }
    }

    return {
        success: true,
        data: {
            exist: data.length > 0,
            verified: data[0]?.validated ?? false
        }
    }
})
