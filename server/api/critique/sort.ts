// POST /api/critique/sort

import {BaseResponse, CardType, TaggingRequest, type TaggingResponse} from "~/types/requests";
import {createCompletion} from "~/server/utils/aiutils";
import OpenAI from "openai";

function getSystemPrompt(tags?: TaggingTag[]) {
    if (!tags) {
        return `The user will prompt numerous unsorted cards (in JSON) to you.
Each card consists a title, some context from the a document, and content of analysis.
Your objective is to create tags to sort the cards.

Your output format should be a json object, specifically, the key is the card name and value is a list of tag names, for example:
{ "card name 1": [ "tag1", "tag2" ], "card name 2": [ "tag1", "tag3" ] }

Please do not generate too many niche tags. The tags are supposed to be generic and concise.
The tag names are limited to 5 words. No not use whitespace, attach the words like MyTagFun.
Reuse the tags as much as possible, do not generate duplicate tags with similar meanings.
For example, if you have Revolutionary War, then do not generate new tags like American Revolution.
DO NOT use markdown, return the bare json object as if you are a backend api.`
    }

    const tagNames = JSON.stringify(tags.map(t => t.name))

    return `The user will prompt numerous unsorted cards (in JSON) to you.
Each card consists a title, some context from the a document, and content of analysis.
Your objective is to sort the cards to the tags provided below:

${tagNames}

Your output format should be a json object, specifically, the key is the card name and value is a list of tag names, for example:
{ "card name 1": [ "tag1", "tag2" ], "card name 2": [ "tag1", "tag3" ] }

If the tags provided for you is not sufficient to encapsulate the idea of some cards, you may create new tags by putting in tag names not specified above.
Please do not abuse this feature and generate too many niche tags. The tags are supposed to be generic and concise.
The tag names are limited to 5 words. No not use whitespace, attach the words like MyTagFun.
Reuse the tags as much as possible, do not generate duplicate tags with similar meanings.
For example, if you have Revolutionary War, then do not generate new tags like American Revolution.
DO NOT use markdown, return the bare json object as if you are a backend api.`
}

function getUserPrompt(card: TaggingCard) {
    return JSON.stringify({
        title: card.title,
        context: card.content.originalText,
        content: card.content.critique,
    })
}

function resolveCardUuid(name: string, cards: TaggingCard[]) {
    for (const card of cards) {
        if (card.title === name) {
            return card.uuid
        }
    }
    throw Error(`Cannot find card with title "${name}"`)
}

function resolveTagUuid(name: string, tags?: TaggingTag[]) {
    if (!tags) {
        return null
    }

    const matchingTagName = name.toLowerCase()
    for (const tag of tags) {
        if (tag.name.toLowerCase() === matchingTagName) {
            return tag.uuid
        }
    }
    return null
}

export default defineEventHandler(async (event): Promise<BaseResponse<TaggingResponse>> => {
    const request = await readBody(event) as TaggingRequest

    const cards: { [key in CardType]: TaggingCard[] } = {
        analysis: [],
        summary: [],
        question: []
    }
    request.cards.forEach(c => cards[c.type].push(c))

    const tagPromises = Object.entries(cards)
        .map(([type, typedCards]) => new Promise<[CardType, string]>((resolve, reject) => {
            if (!typedCards.length) {
                resolve([type as CardType, "{}"])
                return
            }

            const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                {
                    role: "system",
                    content: getSystemPrompt(request.tags[type as CardType])
                }
            ]

            for (const taggingCard of typedCards) {
                messages.push({
                    role: "user",
                    content: getUserPrompt(taggingCard)
                })
            }

            createCompletion(messages, { max_tokens: 1200 }).then((response): void => {
                const content = (response as OpenAI.Chat.Completions.ChatCompletion)
                    .choices[0].message.content
                if (content === null) {
                    reject({
                        success: false,
                        errorMessage: "Tagging Failed"
                    })
                    return
                }
                resolve([type as CardType, content])
            })
        }))

    try {
        const tags = (await Promise.all(tagPromises)).map(([type, tag]) => {
            const tagObject = JSON.parse(tag);

            if (typeof tagObject !== "object" && !Array.isArray(tagObject)) {
                throw Error("Generated tags are not in an object")
            }
            if (Object.values(tagObject).some((value) => !Array.isArray(value))) {
                throw Error("Generated tags contain non-array element(s)")
            }

            return [type, tagObject]
        })
        const tagEntries: {
            [type in CardType]: {
                [name: string]: string[]
            }
        } = Object.fromEntries(tags)

        const tagNames = Object.entries(tagEntries).map(([type, typedCards]) => {
            const tagRegistry: { [name: string]: string[] } = {}
            Object.entries(typedCards).forEach(([cardName, tags]) => {
                tags.forEach(t => {
                    if (!tagRegistry[t]) {
                        tagRegistry[t] = []
                    }
                    const cardUuid = resolveCardUuid(cardName, cards[type as CardType])
                    tagRegistry[t].push(cardUuid)
                })
            })
            return [type as CardType, tagRegistry] as const
        })

        const classifiedTags: TaggingResponse = {
            new: [],
            reuse: []
        }

        tagNames.forEach(([type, taggedCards]) => {
            Object.entries(taggedCards).forEach(([tagName, cardUuids]) => {
                const tagUuid = resolveTagUuid(tagName, request.tags[type])
                if (tagUuid) {
                    // reuse card
                    classifiedTags.reuse.push({
                        uuid: tagUuid,
                        type: type,
                        cards: cardUuids
                    })
                } else {
                    classifiedTags.new.push({
                        name: tagName,
                        type: type,
                        cards: cardUuids
                    })
                }
            })
        })

        // console.log(JSON.stringify(tagNames))

        return {
            success: true,
            data: classifiedTags
        }

    } catch (e) {
        return {
            success: false,
            errorMessage: (e as unknown as Error).message
        }
    }
})