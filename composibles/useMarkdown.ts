import {marked} from "marked";
import DOMPurify from "dompurify";

const unifyHTML = (s: string) => {
    const txt = document.createElement("textarea")
    txt.innerHTML = s
    return txt.value
}

export default function useMarkdown(rawContent: string) {
    const content = unifyHTML(marked.parse(rawContent, {
        breaks: true,
    }) as string)

    const purified = unifyHTML(DOMPurify.sanitize(content, {
        ALLOWED_TAGS: ['p', 'b', 'strong', 'em', 'i', 'u', 's', 'del', 'blockquote', 'h1', 'h2', 'h3', 'br']
    }))

    if (content.length - purified.length) {
        ElMessage.warning("Do not use HTML tags in the chat")
        return
    }
    return purified
}