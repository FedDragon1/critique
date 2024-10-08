export function transformCard(card: any): CritiqueCard {
    return {
        uuid: card.uuid,
        title: card.title,
        type: card.type,
        createdAt: card.created_at,
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
        createdAt: tag.created_at,
        fileUuid: tag.file_uuid,
        userUuid: tag.user_uuid,
    }
}

export function transformCardFull(card: any): CritiqueCardFull {
    const normal = transformCard(card)
    const tags: { [uuid: string]: CritiqueTag } = {}
    card.tag.forEach((t: any) => {
        const tag = transformTag(t)
        tags[tag.uuid] = tag
    })
    return {
        ...normal,
        tags
    }
}

export function transformTagFull(tag: any): CritiqueTagFull {
    const normal = transformTag(tag)
    const cards: { [uuid: string]: CritiqueCard } = {}
    tag.card.forEach((c: any) => {
        const card = transformCard(c)
        cards[card.uuid] = card
    })
    return {
        ...normal,
        cards
    }
}

export function transformCritiqueFull(file: any): CritiqueFull {
    const normal = transformCritique(file)
    const cards: { [uuid: string]: CritiqueCardFull } = {};
    const tags: { [uuid: string]: CritiqueTagFull } = {};
    (file.card as any[]).forEach((dbCard: any) => {
        const card = transformCardFull(dbCard);
        cards[card.uuid] = card
    });
    (file.tag as any[]).map((dbTag: any) => {
        const tag = transformTagFull(dbTag);
        tags[tag.uuid] = tag
    });
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

