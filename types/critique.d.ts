interface QuickActions {
    [action: string]: {
        icon: any,
        caption: string,
        handler: (...args: any[]) => void
    }
}

interface Message {
    from: "user" | "critique",
    content: string,
    uuid: string
}

interface ViewModes {
    [mode: string]: {
        display: string,
        callback: () => any
    }
}

interface ShortCut {
    [shortCut: string]: {
        display: string,
        hotkey: string,
        callback: () => any
    }
}
