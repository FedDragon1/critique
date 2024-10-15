// POST /api/critique/question

import {type QuestionRequest} from "~/types/requests";
import {stream} from "~/server/utils/aiutils";

function getSystemPrompt(summary: string, context: string) {
    return `You are a critical reading chat bot. Your name is Critique.
Based on the document summary, a section selected by the user, and the user's input in the text box, generate a question as your response. 
A plain response is required; do not add additional statements that answer the question. 
Also make sure that the question adheres to the selected section, if provided, and the user's input in the text box. 
Do not copy the user's input; rephrase entirely if necessary. 
The user may use markdown syntax as appropriate. 
You will only have 200 tokens to analyze the text throughout.
Avoid adding quotes from the summary.

The summary of the document you are questioned upon is the following enclosed within $$:
$$${summary}$$

The text you are asked to generate summary upon is attached here within $$:
$$${context}$$`
}

export default defineEventHandler(async (event): Promise<void> => {
    const request = await readBody(event) as QuestionRequest
    await stream(event, getSystemPrompt(request.summary, request.context), request.messages)
})