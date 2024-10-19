// POST /api/critique/merge

import {BaseResponse, type MergeRequest} from "~/types/requests";
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

export default defineEventHandler(async (event): Promise<BaseResponse<{ [key: string]: Boolean }>> => {
    const request = await readBody(event) as MergeRequest[]

    const promises = request.map((req, i) => [i, req] as const)
        .filter(([_, req]) => req !== null)
        .map(async ([i, req]) => {
            const response = await createCompletion(
                getMessages(systemPrompt, userPrompt(req.tail, req.head))
            ) as OpenAI.Chat.Completions.ChatCompletion

            const content = response.choices[0].message.content
            if (content === null || (content !== "true" && content !== "false")) {
                throw Error("Merging Failed")
            }

            return [i, content === "true"] as const
        })

    try {
        const content = Object.fromEntries(await Promise.all(promises))
        return {
            success: true,
            data: content
        }
    } catch (e) {
        return {
            success: false,
            errorMessage: (e as unknown as Error).message
        }
    }
})