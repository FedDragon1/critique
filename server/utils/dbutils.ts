export function transformCard(card: any): CritiqueCard {
    return {
        uuid: card.uuid,
        title: card.title,
        contentLink: card.content_link,
        fileUuid: card.file_uuid,
        userUuid: card.user_uuid,
    }
}

export function transformTag(tag: any): CritiqueTag {
    return {
        uuid: tag.uuid,
        name: tag.name,
        type: tag.type,
        fileUuid: tag.file_uuid,
        userUuid: tag.user_uuid,
    }
}

export function transformCardFull(card: any): CritiqueCardFull {
    const normal = transformCard(card)
    const tags = card.tag.map(transformTag)
    return {
        ...normal,
        tags
    }
}

export function transformTagFull(tag: any): CritiqueTagFull {
    const normal = transformTag(tag)
    const cards = tag.card.map((dbCard: any) => transformCard(dbCard))
    return {
        ...normal,
        cards
    }
}

export function transformCritiqueFull(file: any): CritiqueFull {
    const normal = transformCritique(file)
    const cards = (file.card as any[]).map((dbCard) => transformCardFull(dbCard))
    const tags = (file.tag as any[]).map((dbTag) => transformTagFull(dbTag))
    return {
        ...normal,
        cards,
        tags
    }
}

export function transformCritique(file: any): Critique {
    return {
        uuid: file.uuid,
        fileName: file.file_name,
        lastModified: file.modified_at,
        size: file.size,
        isFavorite: file.favorite,
        fileLink: file.file_link,
        previewLink: file.preview_link,
        userUuid: file.user_uuid,
    }
}

