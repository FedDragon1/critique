// POST /api/critique/generate

import {ChatRequest} from "~/types/requests";
import { createStream } from "~/server/utils/aiutils";
import OpenAI from "openai";
import {useSSE} from "~/server/utils/sseutils";

function getSystemPrompt(summary: string) {
    return `You are a critical reading chat bot. Your name is Critique.
    Your objective is to answer the user's question on a document concisely.
    You will only have 200 tokens to answer the question throughout.
    
    The summary of the document you are questioned upon is the following enclosed within $$:
    $$${summary}$$`
}

export default defineEventHandler(async (event): Promise<void> => {
    const request = await readBody(event) as ChatRequest

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: getSystemPrompt(request.summary)
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