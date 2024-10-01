import { pgTable, uuid, text, bigint, timestamp} from "drizzle-orm/pg-core"

export const user = pgTable('user', {
    uuid: uuid("uuid"),
    createdAt: timestamp("created_at", { mode: 'date' }),
    avatar: text("avatar").default("default_avatar.jpg"),
    bytesUsed: bigint("bytes_used", { mode: 'number' })
})


