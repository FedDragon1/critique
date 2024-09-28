// POST /api/critique/merge

import {BaseResponse} from "~/types/requests";
import {createCompletion, getMessages} from "~/server/utils/aiutils";
import OpenAI from "openai";

const systemPrompt = `The user will prompt with two segments from one or multiple paragraphs. 
These segments will be separated by eight dollar signs ($$$$$$$$). 
Determine whether or not these segments are from the same paragraph, when joined together with the second segment immediately following the first. 
If there are any spelling errors where the two segments join, then they are not part of the same paragraph. 
If the second segment has a transition word that would lead into a new paragraph, then they are not part of the same paragraph. 
If these segments are from the same paragraph, respond with "true", but if not, respond with "false" (without the quotes).`

function userPrompt(tail: string, head: string) {
    return `${tail}\n$$$$$$$$\n${head}`
}

export default defineEventHandler(async (event): Promise<BaseResponse<"true" | "false">> => {
    const request = await readBody(event)

    const response = await createCompletion(
        getMessages(systemPrompt, userPrompt(request.tail, request.head))
    ) as OpenAI.Chat.Completions.ChatCompletion

    const content = response.choices[0].message.content
    if (content === null || (content !== "true" && content !== "false")) {
        return {
            success: false,
            errorMessage: "Merging Failed"
        }
    }

    return {
        success: true,
        data: content
    }
})