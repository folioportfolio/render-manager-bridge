import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import {users} from "./users.js";

export const apiKeys = sqliteTable("api_keys", {
    apiKey: text("api_key").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, {
            onDelete: "cascade",
            onUpdate: "cascade",
        }),
    dateCreated: integer("date_created").notNull(),
    revoked: integer("revoked").default(0),
});
