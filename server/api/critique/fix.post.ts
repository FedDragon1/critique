// POST /api/critique/fix

import OpenAI from 'openai'
import {BaseResponse} from "~/types/requests";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

function getMessages(userPrompt: string, total: number): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    return [
        {
            role: "system",
            content: "The user will input the output text from an optical character recognition software. " +
                "Text with enclosed dollar signs (Ex: $$Revolutlon$$) are low-confidence phrases " +
                "that may have errors. Correct these phrases if necessary according to the context and remove the " +
                "dollar signs. Do not add any additional text or formatting features, and do not remove any formatting " +
                "of the file. For each segment of low confidence, your output should be about the same length. " +
                "Output all corrected phrases in javascript array " +
                "format (Ex: [\"Revolution\", \"The war\"]). The user will provide how many low confidence segments " +
                "are in the paragraph. Make sure you return an array of the same length as that number."
        },
        {
            role: "user",
            content: `${userPrompt} (Total low confidence segments: ${total})`
        }
    ]
}

export default defineEventHandler(async (event): Promise<BaseResponse<string[]>> => {

    const request = await readBody(event)

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        stream: false,
        messages: getMessages(request.context, request.total),
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        n: 1,
    });

    console.log(request)

    const ret = response.choices[0].message.content
    if (ret === null) {
        return {
            success: false,
            errorMessage: "Fix Failed"
        }
    }

    // ensure the response is a javascript array
    try {
        if (!Array.isArray(JSON.parse(ret))) {
            return {
                success: false,
                errorMessage: "Fix Failed"
            }
        }
    } catch(e) {
        return {
            success: false,
            errorMessage: (e as Error).message
        }
    }

    return {
        success: true,
        data: JSON.parse(ret)
    }
})
