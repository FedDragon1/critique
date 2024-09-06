// get /api/file/recent

// TODO
import {CritiqueFileDesc} from "~/types/requests";

export default defineEventHandler((): CritiqueFileDesc[] => {
    return [
        {
            uuid: 1,
            fileName: "Recent File 1",
            lastModified: new Date("December 17, 1995 03:24:00").getTime(),
            preview: `https://picsum.photos/360/270?${Math.random()}`,
            size: Math.floor(Math.random() * 1_000_000_000),
            isFavorite: true
        },
        {
            uuid: 2,
            fileName: "Recent File 2",
            lastModified: new Date("July 17, 2024 03:24:00").getTime(),
            preview: `https://picsum.photos/360/270?${Math.random()}`,
            size: Math.floor(Math.random() * 1_000_000_000),
            isFavorite: true
        },
        {
            uuid: 3,
            fileName: "Recent File 3",
            lastModified: new Date("August 5, 2024 03:24:00").getTime(),
            preview: `https://picsum.photos/360/270?${Math.random()}`,
            size: Math.floor(Math.random() * 1_000_000_000),
            isFavorite: false
        },
        {
            uuid: 4,
            fileName: "Recent File 4",
            lastModified: new Date("August 4, 2024 18:25:00").getTime(),
            preview: `https://picsum.photos/360/270?${Math.random()}`,
            size: Math.floor(Math.random() * 1_000_000_000),
            isFavorite: true
        }
    ]
})