import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const defaultParams = {
    model: "gpt-4o-mini",
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