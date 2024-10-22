// POST /api/critique/punctuation

import {BaseResponse, PunctuationRequest} from "~/types/requests";
import {createCompletion, getMessages} from "~/server/utils/aiutils";
import OpenAI from "openai";

const systemPrompt = `The user will give you a selection of text parsed from a PDF file, 
you are supposed to revise the punctuation of paragraph.
Two types of error to look for: White space error and line break error.
For white space error, some text will include excessive white space, like "weak   to   hold   together." and "C H A P T E R   1 2",
other ones may have too little of white space, for example "Independence—that gov- ernments" should be "Independence - that governments".
You should also merge the line break, just like how "gov- ernments" is turned into "governments".
You should add line break as necessary to construct paragraphs for the ease to read.
DO NOT summarize, paraphrase, or alter the language used in the text.
You are NOT changing the meaning of the text nor the language of the text. Change only whitespace and break lines.
If no text is provided to you, return an empty string.
If only a single punctuation is provided, return it as it is.`

export default defineEventHandler(async (event): Promise<BaseResponse<string[]>> => {
    const request = await readBody(event) as PunctuationRequest

    const options = {
        max_tokens: 2000,
    }

    const response = request.content.map(async (text) => {
        const response = await createCompletion(
            getMessages(systemPrompt, text),
            options
        ) as OpenAI.Chat.Completions.ChatCompletion

        const content = response.choices[0].message.content
        if (content === null) {
            throw Error("content is null")
        }

        return content
    })

    try {
        const content = await Promise.all(response)
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