import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import {apiKeys} from "./apiKeys.js";
import {users} from "./users.js";

export const renderJobs = sqliteTable("render_jobs", {
    id: text("id").primaryKey(),

    frameStart: integer("frame_start").notNull(),
    frameStep: integer("frame_step").notNull(),
    frameEnd: integer("frame_end").notNull(),

    engine: text("engine").notNull(),

    timeStart: integer("time_start").notNull(),

    project: text("project").notNull(),

    resolutionX: integer("resolution_x").notNull(),
    resolutionY: integer("resolution_y").notNull(),

    software: text("software"),
    version: text("version"),

    userId: text("user_id")
        .notNull()
        .references(() => users.id, {
            onDelete: "cascade",
            onUpdate: "cascade",
        }),

    state: text("state", {
        enum: ["started", "inProgress", "finished", "canceled"],
    }).notNull(),
});
