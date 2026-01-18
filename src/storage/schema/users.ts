import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { renderJobs } from "./renderJobs.js";

export const users = sqliteTable("users", {
    id: text("id").primaryKey(),
    dateCreated: integer("date_created").notNull()
});
