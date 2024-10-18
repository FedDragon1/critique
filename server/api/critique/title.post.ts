// POST /api/critique/title

import {BaseResponse, TitleRequest} from "~/types/requests";
import {createCompletion} from "~/server/utils/aiutils";
import OpenAI from "openai";

const systemPrompt = `The user will prompt with a piece of critical analysis form a document.
The critical analysis can either be an analysis paragraph, a summary, or a critical question.
Your objective is to generate a concise and meaningful title for the critical analysis.
You are limited to 5 words. Be as concise as possible.
Avoid using quotes and punctuations as much as possible.`

export default defineEventHandler(async (event): Promise<BaseResponse<string>> => {
    const request = await readBody(event) as TitleRequest

    const response = await createCompletion(
        getMessages(systemPrompt, request.content)
    ) as OpenAI.Chat.Completions.ChatCompletion

    const content = response.choices[0].message.content
    if (content === null) {
        return {
            success: false,
            errorMessage: "Titling Failed"
        }
    }

    return {
        success: true,
        data: content
    }
})