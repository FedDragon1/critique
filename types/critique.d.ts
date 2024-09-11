import type {ElIcon} from "#components";

interface QuickActions {
    [string]: {
        icon: typeof ElIcon,
        caption: string,
        handler: (...args: any[]) => void
    }
}

interface Message {
    from: "user" | "critique",
    content: string,
    uuid: string
}
