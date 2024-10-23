import {hash} from "~/utils/hashUtil";
import {v4 as uuid} from 'uuid'

function onlyPunctuations(s?: string) {
    if (!s) {
        return false
    }
    return !s
        .replace(/[.,\/#!?$%^&*;:{}=\-_`~()]/g,"")   // no punctuation
        .replace(/\s{2,}/g," ")     // no redundant space
        .trim()
        .length
}

function joinTwoSentences(sentence1: string, sentence2: string) {
    sentence1 = sentence1.trim()
    sentence2 = sentence2.trim()

    // s2 is full of punctuations
    if (onlyPunctuations(sentence2)) {
        return `${sentence1}${sentence2.replace(" ", "")}`
    }

    const s1EndWithPunctuation = sentence1.match(/[.!?)\-,]$/g)
    if (s1EndWithPunctuation) {
        return `${sentence1} ${sentence2}`
    }

    // only possible when both sentences are at the end of two lines
    // assume sentence 1 is a complete sentence
    return `${sentence1}. ${sentence2}`
}


function joinSentences(sentences: string[]) {
    if (sentences.length < 1) {
        throw Error(`merging sentences with an array of length ${sentences.length}`)
    }
    if (sentences.length === 1) {
        return sentences[0].trim()
    }
    return sentences.reduce((s1, s2) => joinTwoSentences(s1, s2))
}

function aggregateLength(arr: string[]) {
    return arr.map(s => s.length)
              .reduce((l1, l2) => l1 + l2, 0)
}

function mergeShortSentences(matches: string[]) {
    const SENTENCE_MIN_LENGTH = 50;

    const matchesTransformed: string[] = [];

    for (let i = 0; i < matches.length;) {
        const temp: string[]  = []

        while (i < matches.length && (aggregateLength(temp) < SENTENCE_MIN_LENGTH || onlyPunctuations(matches[i]))) {
            const segment = matches[i++]
            temp.push(segment)
        }

        // either end of array or long enough sentences
        const joined = joinSentences(temp)
        matchesTransformed.push(joined)
    }

    return matchesTransformed
}

function chunkBySentences(paragraph: string) {
    const matcher = /\(?[^.?!\n]+[.!?]+\)?|(?<= ).+(?=\n)|(?<= ).+$|(?<=\n).+$|(?<=\n).+(?=\n)|^.+$|^.+(?=\n)/g
    const matches = paragraph.match(matcher)
    if (!matches) {
        return [paragraph]
    }

    return mergeShortSentences(matches)
}

function transformNode(node: Element) {
    const nodeUuid = uuid()
    const nodeName = node.nodeName === "P" ? "critique-paragraph" : node.nodeName
    const transformedNode = document.createElement(nodeName)

    // terminate node
    if (["P", "H1", "H2", "H3"].includes(node.nodeName)) {
        if (!node.textContent) {
            return transformedNode
        }

        const sentences = chunkBySentences(node.textContent)
        for (const [index, sentence] of sentences.entries()) {
            const critique = document.createElement("critique");
            critique.innerText = sentence
            critique.setAttribute("index", `${index}`)
            critique.setAttribute("node", nodeUuid)
            critique.setAttribute("hash", hash(sentence))
            critique.setAttribute("uuid", uuid())
            transformedNode.appendChild(critique)
        }

        return transformedNode
    }

    // non-terminate node
    for (const child of node.children) {
        const transformedChild = transformNode(child)
        transformedNode.appendChild(transformedChild)
    }

    return transformedNode
}

function htmlToCritiqueChunks(html: string) {
    const from = document.createElement("div")
    from.innerHTML = html

    const to = transformNode(from)
    return to.innerHTML
}

export function useEnglish() {
    return {
        chunkBySentences,
        htmlToCritiqueChunks
    }
}