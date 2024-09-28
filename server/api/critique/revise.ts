// POST /api/critique/revise

import {BaseResponse} from "~/types/requests";
import {createCompletion, getMessages} from "~/server/utils/aiutils";
import OpenAI from "openai";

const systemPrompt = `The user will give you a selection of text, 
you are supposed to revise the paragraph so it makes sense grammatically.
This includes correct punctuation, agreement, tenses, etc.
Your output should follow the standard English convention, with the exception for documents with a historical antique tone.
in the case of historical writings and documents, follow the same convention as the text uses.
You should make as fewest modifications as possible. 
You are not changing the meaning of the text.
Your response should be about the same length as the prompt.`

export default defineEventHandler(async (event): Promise<BaseResponse<string>> => {
    const request = await readBody(event)

    const options = {
        max_tokens: 1000,
    }

    const response = await createCompletion(
        getMessages(systemPrompt, request.selection),
        options
    ) as OpenAI.Chat.Completions.ChatCompletion

    const content = response.choices[0].message.content
    if (content === null) {
        return {
            success: false,
            errorMessage: "Revising Failed"
        }
    }

    return {
        success: true,
        data: content
    }
})