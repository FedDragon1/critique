// POST /api/critique/generate

import OpenAI from 'openai'
import { OpenAIStream } from "ai"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

function getMessages(userPrompt: string): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    return [
        {
            role: "system",
            content: "You are an AI writing assistant that improves existing text. " +
                "Limit your response to no more than 200 characters, but make sure to construct complete sentences." +
                "Use Markdown formatting when appropriate."
        },
        {
            role: "user",
            content: userPrompt
        }
    ]
}

export default defineEventHandler(async (event) => {

    const request = JSON.parse(await readBody(event))

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        stream: true,
        messages: getMessages(request.prompt),
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        n: 1,
    });

    return OpenAIStream(response)
})
