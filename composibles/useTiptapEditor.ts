import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Underline from "@tiptap/extension-underline";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Blockquote from "@tiptap/extension-blockquote";
import BulletList from "@tiptap/extension-bullet-list";
import HardBreak from "@tiptap/extension-hard-break";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import Heading from "@tiptap/extension-heading";
import Dropcursor from "@tiptap/extension-dropcursor";
import Gapcursor from "@tiptap/extension-gapcursor";
import History from "@tiptap/extension-history";
import Placeholder from "@tiptap/extension-placeholder";
import NodeRange from "@tiptap-pro/extension-node-range";
import DragHandle from "@tiptap-pro/extension-drag-handle";
import {Editor, Extension} from "@tiptap/core";
import {Node} from '@tiptap/pm/model';
import {Decoration, DecorationSet} from '@tiptap/pm/view';
import {Plugin, PluginKey} from "@tiptap/pm/state";
import type {NodeTypeRepr, ParagraphCache, PromiseCache} from "~/types/tiptap";
import {LRUCache} from 'lru-cache'
import {$fetch} from "ofetch";
import type {BaseResponse, FixRequest} from "~/types/requests";
import {debounce} from "lodash-es";

const cacheOptions = {
    max: 200
}
export const cacheOfPromises: PromiseCache = new LRUCache(cacheOptions)
const cacheOfStrings: ParagraphCache = new LRUCache(cacheOptions)

// https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js
const hash = (str: string, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString();
};

/**
 * Use the context of current paragraph to predict
 * the low confidence words
 *
 * @param node current node
 * @param regexArr the array of low confidence segments in the node
 * @param nodeHash hash code of the paragraph
 * @param position
 */
function getReplacements(node: Node, regexArr: RegExpExecArray[], nodeHash: string, position: number) {
    const context = node.text?.split("‎").join("$$");

    if (!context) {
        throw Error("Context is empty")
    }

    const requestBody: FixRequest = {
        context,
        total: regexArr.length
    }

    const replacePromise: Promise<BaseResponse<string[]>> = $fetch("/api/critique/fix", {
        method: "POST",
        body: requestBody
    })

    const fixId = regexArr.map((dedicatedSegment) => {
        const from = (dedicatedSegment.index || 0) + position
        const to = dedicatedSegment[0].length + from
        return `${nodeHash}-${from}-${to}`
    })

    replacePromise.then((replacement) => {
        if (!replacement.success) {
            throw Error(replacement.errorMessage)
        }

        // this replacement will have all the low confidence words in it
        // put them in cache so when other words in the same paragraph
        // ask for a fix we don't have to call the model again

        const words = replacement!.data!
        words.forEach((word, i) => cacheOfStrings.set(fixId[i], word))
    })

    fixId.forEach(cacheId => {
        const wordPromise: Promise<string> = new Promise((resolve) => {
            replacePromise.then(() => {
                const ret = cacheOfStrings?.get(cacheId);
                if (!ret) {
                    throw Error("Error in returning value")
                }
                resolve(ret)
            })
        })
        cacheOfPromises?.set(cacheId, wordPromise)
    })

    return fixId
}

const getReplacementDebounce = debounce(getReplacements, 500, {
    leading: true,
    trailing: false
})

function findLowConfidenceSegments(doc: Node): DecorationSet {
    // suppose the low confidence segments are within the boundary ‎TEXT‎
    const lowConfidenceSegments = /‎.+?‎/gi
    const decorations: Decoration[] = []

    doc.descendants((node, position) => {
        if (!node.text) {
          return
        }

        const nodeHash = hash(node.text)
        const regexArr = Array.from(node.text.matchAll(lowConfidenceSegments));
        if (!regexArr.length) {
            return
        }

        const fixId: string[] = getReplacementDebounce(node, regexArr, nodeHash, position)
        const decoration = regexArr.map((match, i) => {
            const segment = match[0]
            const index = match.index || 0
            const from = position + index
            const to = from + segment.length

            return Decoration.inline(from, to, {
                class: "low-confidence",
                nodeName: "low-confidence",
                "data-id": fixId[i],
                contenteditable: "false"
            })
        })
        decorations.push(...decoration)
    })

    return DecorationSet.create(doc, decorations)
}

const SelectText = Extension.create({
    // @ts-ignore
    addCommands() {
        // noinspection JSUnusedGlobalSymbols
        return {
            getSelectedText: () => ({ editor }: { editor: Editor }) => {
                const { from, to, empty } = editor.state.selection

                if (empty) {
                    return null
                }

                return editor.state.doc.textBetween(from, to, ' ')
            }
        }
    },
    name: "selectText"
})

const NodeType = Extension.create({
    // @ts-ignore
    addCommands() {
        return {
            getCurrentNode: () => ({ editor }: { editor: Editor }) => {
                const { type: { name }, attrs } = editor.state.selection.$head.parent
                return { name, attrs }
            }
        }
    },
    name: "nodeType"
})

// noinspection JSUnusedGlobalSymbols
const LowConfidenceMarker = Extension.create({
    name: "lowConfidenceMarker",

    addProseMirrorPlugins: () => [
        new Plugin({
            key: new PluginKey("marking"),
            state: {
                init(_, instance) {
                    // return DecorationSet.create(instance.doc, [])
                    return findLowConfidenceSegments(instance.doc)
                },
                apply: (transaction, oldState) => {
                    return transaction.docChanged ? findLowConfidenceSegments(transaction.doc)! : oldState
                }
            },
            props: {
                decorations(state) {
                    return this.getState(state)
                }
            },
        })
    ]
})

const marks = [Bold, Italic, Strike, Underline]
const nodes = [
    Document,
    Paragraph,
    Text,
    Blockquote,
    BulletList,
    HardBreak,
    ListItem,
    OrderedList,
    Heading.configure({
            levels: [1, 2, 3]
        }
    )]
const func = [
    NodeType,
    SelectText,
    Dropcursor,
    Gapcursor,
    History,
    LowConfidenceMarker,
    Placeholder.configure({
       placeholder: "Start your critique here..."
    }),
    NodeRange.configure({
        key: null,
    }),
    DragHandle.configure({
        render() {
            const element = document.createElement('div')

            element.classList.add('custom-drag-handle')

            return element
        },
    }),
]

export function useTiptapEditor(html: string) {
    return useEditor({
        content: html,
        extensions: [
            ...marks,
            ...nodes,
            ...func,
        ]
    })
}

export function useEditorTransforms() {
    return {
        getTextType(node: NodeTypeRepr): string {
            if (node.name === "paragraph") {
                return "Text"
            }
            if (node.name === "heading") {
                return `Heading ${node.attrs.level}`
            }
            throw Error(`Unrecognized node name ${node.name}`)
        },
        lowConfidenceInvisibleMarking(text: string): string {
            return text.replaceAll(/\[low-confidence]|\[\/low-confidence]/g, "‎")
        }
    }
}