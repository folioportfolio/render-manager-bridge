import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

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

    state: text("state", {
        enum: ["started", "inProgress", "finished", "canceled"],
    }).notNull(),
});
