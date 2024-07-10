import { pgTable, serial, text, bigint, timestamp} from "drizzle-orm/pg-core"

export const user = pgTable('user', {
    id: bigint("id", { mode: 'number' }).primaryKey(),
    createdAt: timestamp("created_at", { mode: 'date' }),
    avatar: text("avatar"),
    banner: text("banner"),
    bytesUsed: bigint("bytes_used", { mode: 'number' })
})


