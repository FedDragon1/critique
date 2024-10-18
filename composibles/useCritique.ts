import type {
    BaseResponse,
    CardType,
    DeleteCardRequest, DeleteTagRequest,
    NewCardRequest, NewCardTagRequest,
    NewTagRequest,
    UpdateCardRequest, UpdateFileRequest, UpdateTagRequest
} from "~/types/requests";
import type {Ref} from "vue";
import {isEqual} from 'lodash'

export function objectFilter<T extends HaveUuid>(obj: MapOf<T>, predicate: (e: T) => boolean) {
    const ret: MapOf<T> = {}
    Object.values(obj).forEach(value => {
        if (predicate(value)) {
            ret[value.uuid] = value
        }
    })
    return ret
}


export class CritiqueHandler {
    file
    tabHandler
    onError

    constructor(file: Ref<CritiqueFull>, tabHandler: TabHandler, onError: (errorMessage?: string) => any) {
        this.file = file
        this.tabHandler = tabHandler
        this.onError = onError
    }

    // INTERNAL SERVICES

    /**
     * Guard to ensure a response is success with data
     * 
     * @param callback gets called when the response is success
     */
    guard<T, R>(callback: (resp: T) => R): (resp: BaseResponse<T>) => R | undefined {
        return (resp: BaseResponse<T>) => {
            if (!resp.success) {
                this.onError(resp.errorMessage)
                console.error(resp)
                return
            }
            return callback(resp.data!)
        }
    }

    /**
     * Traverse through all the tags referenced within cards.
     * 
     * @param filter predicate indicating whether to perform the operation or not
     * @param op the operation to perform on the tag with the parent card context
     */
    traverseTags<R>(filter: (tag: CritiqueTag) => boolean, 
                    op: (tag: CritiqueTag, parentCard: CritiqueCardFull) => R) {
        Object.values(this.file.value.cards).forEach(card =>
            Object.values(card.tags).forEach(tag => {
                if (filter(tag)) {
                    op(tag, card)
                }
            })
        )
    }

    /**
     * Traverse through all the cards referenced within tags.
     *
     * @param filter predicate indicating whether to perform the operation or not
     * @param op the operation to perform on the card with the parent tag context
     */
    traverseCards<R>(filter: (card: CritiqueCard) => boolean,
                    op: (card: CritiqueCard, parentTag: CritiqueTagFull) => R) {
        Object.values(this.file.value.tags).forEach(tag =>
            Object.values(tag.cards).forEach(card => {
                if (filter(card)) {
                    op(card, tag)
                }
            })
        )
    }

    /**
     * Delete tags that does not exist anymore from cards,
     * Reassign existing tags to cards
     */
    removeTags(uuids: string[]) {
        const tags = this.file.value.tags
        uuids.forEach(uuid => delete tags[uuid])
        this.traverseTags(
            (tag) => tag.uuid in uuids, 
            (tag, parentCard) => delete parentCard.tags[tag.uuid]
        )
        this.tabHandler.removeTagTabs(uuids)
    }

    /**
     * Delete cards that does not exist anymore from tags
     * Reassign existing cards to tags
     */
    removeCards(uuids: string[]) {
        const cards = this.file.value.cards
        uuids.forEach(uuid => delete cards[uuid])
        this.traverseCards(
            (card) => card.uuid in uuids,
            (card, parentTag) => delete parentTag.cards[card.uuid]
        )
        this.tabHandler.removeCardTabs(uuids)
    }

    /**
     * Merge the current tag with the updated one,
     * and update the same tag referenced by cards
     *
     * @param updatedTag
     */
    mergeTag(updatedTag: CritiqueTag) {
        const tag = this.file.value.tags[updatedTag.uuid]
        if (!tag) {
            this.onError(`No tag with uuid ${updatedTag.uuid}`)
            return
        }
        const newTag = {
            ...updatedTag,
            cards: tag.cards
        };
        this.file.value.tags[updatedTag.uuid] = newTag
        
        this.traverseTags(
            (tag) => tag.uuid === updatedTag.uuid,
            (tag, card) => card.tags[tag.uuid] = newTag
        )
    }

    /**
     * Merge the current card with the updated one,
     * and update the same card referenced by tags
     *
     * @param updatedCard
     */
    mergeCard(updatedCard: CritiqueCard) {
        const card = this.file.value.cards[updatedCard.uuid]
        if (!card) {
            this.onError(`No tag with uuid ${updatedCard.uuid}`)
            return
        }
        const newCard = {
            ...updatedCard,
            tags: card.tags
        };
        this.file.value.cards[updatedCard.uuid] = newCard

        this.traverseCards(
            (card) => card.uuid === updatedCard.uuid,
            (card, tag) => tag.cards[card.uuid] = newCard
        )
    }

    /**
     * Updates client side file model,
     * adds relationship between the card and the tag
     *
     * @param cardUuid
     * @param tagUuid
     */
    linkCardAndTag(cardUuid: string, tagUuid: string) {
        // may be deleted during networking
        const targetCard = this.file.value.cards[cardUuid]
        if (!targetCard) {
            this.onError(`Card with uuid ${cardUuid} does not exist`)
            return
        }

        const targetTag = this.file.value.tags[tagUuid]
        if (!targetTag) {
            this.onError(`Tag with uuid ${tagUuid} does not exist`)
            return
        }

        targetCard.tags[tagUuid] = targetTag
        targetTag.cards[cardUuid] = targetCard
    }

    /**
     * Updates client side file model,
     * removes relationship between the card and the tag
     *
     * @param cardUuid
     * @param tagUuid
     */
    unlinkCardAndTag(cardUuid: string, tagUuid: string) {
        // may be deleted during networking
        const targetCard = this.file.value.cards[cardUuid]
        if (!targetCard) {
            this.onError(`Card with uuid ${cardUuid} does not exist`)
            return
        }

        const targetTag = this.file.value.tags[tagUuid]
        if (!targetTag) {
            this.onError(`Tag with uuid ${tagUuid} does not exist`)
            return
        }

        delete targetCard.tags[tagUuid]
        delete targetTag.cards[cardUuid]
    }
    
    // EXPOSED API

    newCard(title: string, type: CardType, data: CritiqueCardStorage, nodeUuid?: string, fromIndex?: number, toIndex?: number) {
        if (!nodeUuid && (fromIndex || toIndex)) {
            throw Error("indices provided without a node uuid")
        }

        const body: NewCardRequest = {
            title,
            type,
            data,
            node: nodeUuid,
            from: fromIndex,
            to: toIndex,
            fileUuid: this.file.value.uuid,
        }
        return $fetch<BaseResponse<CritiqueCard>>("/api/file/card", {
            method: "POST",
            body
        }).then(this.guard((data) => {
            const card: CritiqueCardFull = {
                ...data,
                tags: {}
            }
            this.file.value.cards[card.uuid] = card
        }))
    }

    updateCard(uuid: string, to: Omit<UpdateCardRequest, 'uuid'>) {
        const body: UpdateCardRequest = {
            uuid,
            ...to
        }
        return $fetch<BaseResponse<CritiqueCard>>("/api/file/card", {
            method: "PUT",
            body
        }).then(this.guard(this.mergeCard.bind(this)))
    }

    deleteCard(uuid: string) {
        const body: DeleteCardRequest = {
            uuids: [uuid],
        }
        return $fetch<BaseResponse<CritiqueCard[]>>("/api/file/card", {
            method: "DELETE",
            body
        }).then(this.guard(() => this.removeCards([uuid])))
    }

    deleteCards(uuids: string[]) {
        const body: DeleteCardRequest = {
            uuids
        }
        return $fetch<BaseResponse<CritiqueCard[]>>("/api/file/card", {
            method: "DELETE",
            body
        }).then(this.guard(() => this.removeCards(uuids)))
    }

    newTag(name: string, type: CardType) {
        const body: NewTagRequest = {
            name,
            type,
            fileUuid: this.file.value.uuid
        }
        return $fetch<BaseResponse<CritiqueTag>>("/api/file/tag", {
            method: "POST",
            body
        }).then(this.guard((resp) => {
            const tag: CritiqueTagFull = {
                ...resp,
                cards: {}
            }
            this.file.value.tags[tag.uuid] = tag
            return tag
        }))
    }

    updateTag(uuid: string, name?: string, type?: CardType) {
        const body: UpdateTagRequest = {
            uuid,
            name,
            type
        }
        return $fetch<BaseResponse<CritiqueTag>>("/api/file/tag", {
            method: "PUT",
            body
        }).then(this.guard(this.mergeTag))
    }

    deleteTag(uuid: string) {
        const body: DeleteTagRequest = {
            uuids: [uuid],
        }
        return $fetch<BaseResponse<CritiqueTag[]>>("/api/file/card", {
            method: "DELETE",
            body
        }).then(this.guard(() => this.removeTags([uuid])))
    }

    deleteTags(uuids: string[]) {
        const body: DeleteTagRequest = {
            uuids
        }
        return $fetch<BaseResponse<CritiqueTag[]>>("/api/file/card", {
            method: "DELETE",
            body
        }).then(this.guard(() => this.removeTags(uuids)))
    }
    
    link(card: { uuid: string, type: CardType }, tag: { uuid: string, type: CardType }) {
        const body: NewCardTagRequest = {
            cardUuid: card.uuid,
            tagUuid: tag.uuid,
            cardType: card.type,
            tagType: tag.type
        }
        return $fetch("/api/file/group", {
            method: "POST",
            body
        }).then(this.guard(() => this.linkCardAndTag(card.uuid, tag.uuid)))
    }

    unlink(card: { uuid: string, type: CardType }, tag: { uuid: string, type: CardType }) {
        $fetch(`/api/file/group/${card.uuid}/${tag.uuid}`, {
            method: "DELETE"
        }).then(this.guard(() => this.unlinkCardAndTag(card.uuid, tag.uuid)))
    }

    makeFilePreview(): string | undefined {
        // TODO
        return undefined
    }

    updateFileContent(content: string) {
        const body: UpdateFileRequest = {
            uuid: this.file.value.uuid,
            dataMarkUp: content,
            previewBase64: this.makeFilePreview()
        }
        $fetch("/api/file", {
            method: "PUT",
            body
        }).then(this.guard(() => {}))
    }

    updateFileProperties(postProcess: (file: Critique) => any, options : {
        favorite?: boolean,
        fileName?: string,
        size?: number })
    {
        const request: UpdateFileRequest = {
            uuid: this.file.value.uuid,
            ...options
        }
        $fetch<BaseResponse<Critique>>("/api/file", {
            method: "PUT",
            body: request
        }).then(this.guard((resp) => {
            this.file.value.isFavorite = options.favorite ?? this.file.value.isFavorite
            this.file.value.fileName = options.fileName ?? this.file.value.fileName
            this.file.value.size = options.size ?? this.file.value.size
            postProcess(resp)
        }))
    }
}

export class TabHandler {
    tabs: Tab[]
    file: CritiqueFull
    focused: boolean
    on: number

    readonly cards: AllCardsTab = {
        display: "Cards",
        type: "generic",
        uuid: "cards",
        content: () => this.file.cards
    }
    readonly analysis: AllAnalysisTab = {
        display: "Analysis",
        type: "generic",
        uuid: "analysis",
        content: () => objectFilter(this.file.tags,
            (t: CritiqueTagFull) => t.type === 'analysis'
        )
    }
    readonly summary: AllSummaryTab = {
        display: "Summary",
        type: "generic",
        uuid: "summary",
        content: () => objectFilter(this.file.tags,
            (t: CritiqueTagFull) => t.type === 'summary'
        )
    }
    readonly questions: AllQuestionsTab = {
        display: "Questions",
        type: "generic",
        uuid: "questions",
        content: () => objectFilter(this.file.tags,
            (t: CritiqueTagFull) => t.type === 'question'
        )
    }

    constructor(file: CritiqueFull) {
        this.tabs = []
        this.file = file
        this.focused = false
        this.on = -1    // not focused on anything
    }

    checkPush(tab: Tab) {
        let sameTab = -1;
        this.tabs.forEach((t, i) => {
            if (isEqual(tab, t)) {
                sameTab = i
            }
        })

        if (sameTab !== -1) {
            this.focusTo(sameTab)
            return
        }

        this.tabs.push(tab)
        this.focusTo(this.tabs.length - 1)
    }

    removeCardTabs(uuids: string[]) {
        this.tabs = this.tabs.filter(tab => tab.type === "card" && tab.uuid in uuids)
        // Don't bother with shifting tabs
        // when delete multiple, you can't be focusing on anything
        // when deleting single, and you are on the tab to be deleted
        // just navigate to the next one if there is any
        this.focusTo(Math.min(this.tabs.length - 1, this.on))
    }

    removeTagTabs(uuids: string[]) {
        this.tabs = this.tabs.filter(tab => tab.type === "tag" && tab.uuid in uuids)
        this.focusTo(Math.min(this.tabs.length - 1, this.on))
    }

    removeByIndex(index: number) {
        this.tabs = [...this.tabs.slice(0, index), ...this.tabs.slice(index + 1)]
        if (this.on === index) {
            this.focusTo(Math.min(this.tabs.length - 1, this.on))
        } else if (this.on > index) {
            this.on--
        }
        // do nothing if before the removed element
    }

    pushTagTab(tag: CritiqueTag | CritiqueTagFull) {
        const content = () => this.file.cards
        this.checkPush({
            display: tag.name,
            type: "tag",
            uuid: tag.uuid,
            content
        })
    }

    pushCardTab(card: CritiqueCard | CritiqueCardFull) {
        const content = () => this.file.cards[card.uuid]
        this.checkPush({
            display: card.title,
            type: "card",
            uuid: card.uuid,
            content
        })
    }

    pushAllCardsTab() {
        this.checkPush(this.cards)
    }

    pushAllAnalysisTab() {
        this.checkPush(this.analysis)
    }

    pushAllSummaryTab() {
        this.checkPush(this.summary)
    }

    pushAllQuestionsTab() {
        this.checkPush(this.questions)
    }

    blur() {
        this.focused = false
        this.on = -1
    }

    focusTo(index: number) {
        if (index >= this.tabs.length || index < 0) {
            if (index === -1) {
                // no more tabs open
                this.blur()
                return;
            }
            throw Error(`Index out of bound (${index})`)
        }
        if (index % 1 !== 0) {
            this.blur()
            throw Error("Index must be an integer")
        }
        this.on = index
    }
}

export default function useCritique(file: Ref<CritiqueFull>, onError: (errorMessage?: string) => any) {
    return new CritiqueHandler(file, new TabHandler(unref(file)), onError)
}