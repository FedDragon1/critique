// POST /api/critique/generate

import {ChatRequest} from "~/types/requests";
import { createStream } from "~/server/utils/aiutils";
import OpenAI from "openai";
import {useSSE} from "~/server/utils/sseutils";

const systemPrompt = `Just chat with the user. 
No not use markdown format. use '\\n' to break line`

export default defineEventHandler(async (event): Promise<void> => {
    const request = await readBody(event) as ChatRequest

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: systemPrompt
        },
        ...request.messages
    ]

    const { send, close } = useSSE(event, "sse:event")

    try {
        const response = await createStream(messages)

        for await (const resp of response) {
            const choice = resp.choices[0];
            send(() => choice)
        }
    } finally {
        close()
    }
})