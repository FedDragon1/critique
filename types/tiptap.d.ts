import type {Attrs} from "prosemirror-model";
import {LRUCache} from "lru-cache";

interface NodeTypeRepr {
    name: string,
    attrs: Attrs   // attributes
}

interface NodeType {
    display: string,
    icon: any,   // vue component
    callback: () => any
}

type PromiseCache = LRUCache<string, Promise<string>, any>
type ParagraphCache = LRUCache<string, string, any>