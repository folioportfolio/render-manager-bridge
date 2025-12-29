import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { renderJobs } from "./renderJobs.js";

export const jobFrames = sqliteTable("job_frames", {
    id: text("id").primaryKey(),
    jobId: text("jobId")
        .notNull()
        .references(() => renderJobs.id, {
            onDelete: "cascade",
            onUpdate: "cascade",
        }),

    frameNumber: integer("frame_number").notNull(),
    time: real("time").notNull(),
    timestamp: real("timestamp").notNull(),
    info: text("info"),
});
