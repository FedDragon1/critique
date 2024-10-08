import type {
    BaseResponse,
    CardType,
    DeleteCardRequest, DeleteTagRequest,
    NewCardRequest, NewCardTagRequest,
    NewTagRequest,
    UpdateCardRequest, UpdateFileRequest, UpdateTagRequest
} from "~/types/requests";
import type {Ref} from "vue";

// TODO: add test

class CritiqueHandler {
    file
    onError

    constructor(file: Ref<CritiqueFull>, onError: (errorMessage?: string) => any) {
        this.file = file
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

    newCard(title: string, type: CardType, data: CritiqueCardStorage) {
        const body: NewCardRequest = {
            title,
            type,
            data,
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

    updateCard(uuid: string, title?: string, data?: CritiqueCardStorage) {
        const body: UpdateCardRequest = {
            uuid,
            title,
            data
        }
        return $fetch<BaseResponse<CritiqueCard>>("/api/file/card", {
            method: "PUT",
            body
        }).then(this.guard(this.mergeCard))
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
    
    link(card: CritiqueCard | CritiqueCardFull, tag: CritiqueTag | CritiqueTagFull) {
        const body: NewCardTagRequest = {
            cardUuid: card.uuid,
            tagUuid: tag.uuid,
            cardType: card.type,
            tagType: tag.type
        }
        $fetch("/api/file/group", {
            method: "POST",
            body
        }).then(this.guard(() => this.linkCardAndTag(card.uuid, tag.uuid)))
    }

    unlink(card: CritiqueCard | CritiqueCardFull, tag: CritiqueTag | CritiqueTagFull) {
        $fetch(`/api/file/group/${card.uuid}/${tag.uuid}`, {
            method: "DELETE"
        }).then(this.guard(() => this.unlinkCardAndTag(card.uuid, tag.uuid)))
    }

    makeFilePreview(): string | undefined {
        // TODO
        return undefined
    }

    updateFile(content: string) {
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
}