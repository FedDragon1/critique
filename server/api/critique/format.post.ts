// POST /api/critique/format

import OpenAI from "openai";
import {BaseResponse} from "~/types/requests";
import {createCompletion, getMessages} from "~/server/utils/aiutils";

// noinspection HtmlRequiredLangAttribute
const systemPrompt = `The user will input plain text that will need to be neatly displayed in HTML format. 
Determine the headings (<h1>), subheadings (<h2>), section headings (<h3>) and document content (<p>) from the context of the segment. 
If there is a clear transition from third-person perspective to first-person perspective for a prolonged length (as in a paragraph of quote), you may use <blockquote> to wrap the text. This should rarely be used
Leave [low-confidence] and [/low-confidence] tags in place, they do not impact the meaning of other segments. 
Use plain text, no markdown at all time (very important). 
Not all segments start with a title, they may be excerpts in a larger piece of text. Make sure the rest of paragraph makes sense when creating titles. 
Use title only when it is obvious. A title should be five words at max in length. Use as few titles as possible
Return only the tags, no <html> tag and <body> tag. 
No markdown, generate <h1>Title!</h1> instead of \`\`\`html <h1>Title!</h1> \`\`\`.
Do not modify the user's content. Generate as much text as you need to completely format the text.`

export default defineEventHandler(async (event): Promise<BaseResponse<string[]>> => {
    const request = await readBody(event)

    const options = {
        max_tokens: 1200,
    }

    const promises = request.segments.map(
        (segment: string) => createCompletion(getMessages(systemPrompt, segment), options)
    )

    let response: OpenAI.Chat.Completions.ChatCompletion[] = await Promise.all(promises)

    const error = response.some(resp => resp.choices[0].message.content === null)
    if (error) {
        return {
            success: false,
            errorMessage: "Formatting Failed"
        }
    }

    const ret = response.map(resp => resp.choices[0].message.content!)

    return {
        success: true,
        data: ret
    }
})