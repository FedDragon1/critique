// POST /api/critique/fix

import OpenAI from 'openai'
import {BaseResponse} from "~/types/requests";
import {createCompletion, getMessages} from "~/server/utils/aiutils";

const systemPrompt = `The user will input the output text from an optical character recognition software.
Text with enclosed dollar signs (Ex: $$Revolutlon$$) are low-confidence phrases that may have errors.
Correct these phrases if necessary according to the context and remove the dollar signs.
Do not add any additional text or formatting features, and do not remove any formatting of the file.
For each segment of low confidence, your output should be about the same length.
For segments involving both text and punctuation (Ex. 5:), generate concise fix for the segment only, do not restate text around it.
It is more probable that the letters that look similar both uppercase and lowercase may be confused in the OCR, for example the letter C.
Sometimes, the letter C will also be incorrectly interpreted as a (, which should be fixed.
Excess whitespace, like double spaces, should be condensed into one space.
Output all corrected phrases in javascript array format (Ex: [\\"Revolution\\", \\"The war\\"]).
The user will provide how many low confidence segments are in the paragraph.
Make sure you return an array of the same length as that number.`

export default defineEventHandler(async (event): Promise<BaseResponse<string[]>> => {
    const request = await readBody(event)

    const userPrompt = `${request.context} (Total low confidence segments: ${request.total})`
    const response = await createCompletion(
        getMessages(systemPrompt, userPrompt)
    ) as OpenAI.Chat.Completions.ChatCompletion;

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
