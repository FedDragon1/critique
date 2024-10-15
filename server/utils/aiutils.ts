import OpenAI from "openai";
import {useSSE} from "~/server/utils/sseutils";
import {H3Event} from "h3";
import type {Messages} from "~/types/requests";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const defaultParams = {
    model: "gpt-4o",
    stream: false,
    temperature: 0.4,
    top_p: 0.5,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 200,
    n: 1,
}

export function getMessages(systemPrompt: string, userPrompt: string): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    return [
        {
            role: "system",
            content: systemPrompt
        },
        {
            role: "user",
            content: userPrompt
        }
    ]
}

export function createCompletion(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
                                 options?: Partial<Omit<OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming, "messages">>) {
    return openai.chat.completions.create({
        ...defaultParams,
        ...options,
        messages
    })
}

export function createStream(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
                                 options?: Partial<Omit<OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming, "messages">>) {
    return openai.chat.completions.create({
        ...defaultParams,
        stream: true,
        ...options,
        messages
    })
}

export async function stream(event: H3Event, systemPrompt: string, history: Messages) {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: systemPrompt
        },
        ...history
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
}