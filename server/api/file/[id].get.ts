// get /api/file/[id]

// TODO
import {Critique} from "~/types/requests";

export default defineEventHandler((event): Critique => {
    const { id } = getRouterParams(event)
    return {
        uuid: Number(id),
        fileName: `Recent File ${id}`,
        lastModified: new Date("December 17, 1995 03:24:00").getTime(),
        size: Math.floor(Math.random() * 1_000_000_000),
        isFavorite: true,
        document: {
            markup: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            raw: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
        analysis: [],
        tags: []
    }
})