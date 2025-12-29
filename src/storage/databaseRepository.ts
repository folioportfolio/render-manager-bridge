import Database from "better-sqlite3";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type {
    JobFrame,
    JobsRepository, OrderType,
    RenderJob
} from "../types/jobTypes.js";
import {renderJobs} from "./schema/renderJobs.js";
import {jobFrames} from "./schema/jobFrames.js";
import { desc, eq, max, count as countRows } from "drizzle-orm";
import {initializeDb} from "./database.js";

export class SqliteJobRepository implements JobsRepository {
    db: BetterSQLite3Database<Record<string, never>> & {
        $client: Database.Database;
    };

    constructor() {
        const { db } = initializeDb();
        this.db = db;
    }

    async createJob(job: Omit<RenderJob, "id">): Promise<string> {
        const id = crypto.randomUUID();

        await this.db.insert(renderJobs).values({
            id: id,
            frameStart: job.frameStart,
            frameEnd: job.frameEnd,
            frameStep: job.frameStep,
            resolutionX: job.resolutionX,
            resolutionY: job.resolutionY,
            engine: job.engine,
            timeStart: job.timeStart,
            project: job.project,
            state: job.state,
            software: job.software,
            version: job.version
        });

        return id;
    }

    async updateJob(job: RenderJob): Promise<void> {
        await this.db
            .update(renderJobs)
            .set({
                state: job.state,
            })
            .where(eq(renderJobs.id, job.id));
    }

    async getJob(id: string): Promise<RenderJob | null> {
        const rows = await this.db
            .select({
                job: renderJobs,
                frames: jobFrames,
            })
            .from(renderJobs)
            .leftJoin(jobFrames, eq(jobFrames.jobId, renderJobs.id))
            .where(eq(renderJobs.id, id));

        if (!rows || rows.length === 0) return null;

        const job = rows[0]!.job;

        const frames = rows
            .map((r) => r.frames)
            .filter((f): f is NonNullable<typeof f> => f !== null);

        return job ? this.mapJob(job, frames) : null;
    }

    async getJobsPaged(
        order: OrderType,
        count?: number,
        page?: number,
    ): Promise<{items: RenderJob[], totalCount: number} | null> {

        const rowsPromise = this.db
            .select({
                job: renderJobs,
                lastFrame: max(jobFrames.frameNumber),
            })
            .from(renderJobs)
            .orderBy(this.GetOrder(order))
            .leftJoin(jobFrames, eq(jobFrames.jobId, renderJobs.id))
            .groupBy(renderJobs.id);

        if (count)
            rowsPromise.limit(count);

        if (page && count)
            rowsPromise.offset((page - 1) * count);

        const rows = await rowsPromise;

        const counts = await this.db
            .select({ total: countRows() })
            .from(renderJobs);

        const result = rows?.map((x) => ({
            ...this.mapJob(x.job),
            currentFrame: x.lastFrame ?? 0,
        })) ?? null;

        return {items: result, totalCount: counts[0]?.total ?? 0}
    }

    private GetOrder(order: OrderType) {
        switch (order) {
            case "startTimeASC":
                return renderJobs.timeStart;

            case "startTimeDESC":
            default:
                return desc(renderJobs.timeStart);
        }
    }

    async createJobFrame(frame: JobFrame): Promise<string> {
        const id = crypto.randomUUID();

        await this.db.insert(jobFrames).values({
            id: id,
            jobId: frame.jobId,
            frameNumber: frame.frameNumber,
            time: frame.time,
            timestamp: frame.timestamp,
            info: frame.info
        });

        return id;
    }

    async getAllFrameForJob(id: string): Promise<JobFrame[] | null> {
        const frames = await this.db
            .select()
            .from(jobFrames)
            .where(eq(jobFrames.jobId, id));

        return frames?.map((x) => this.mapFrame(x)) ?? null;
    }

    async getLastFrameForJob(id: string): Promise<number | null> {
        const frames = await this.db
            .select({
                maxFrame: max(jobFrames.frameNumber),
            })
            .from(jobFrames)
            .where(eq(jobFrames.jobId, id));

        return frames[0]?.maxFrame ?? null;
    }

    private mapJob(
        row: typeof renderJobs.$inferSelect,
        frames: (typeof jobFrames.$inferSelect)[] = [],
    ): RenderJob {
        const framesMapped = frames.map((x) => this.mapFrame(x));
        return {
            id: row.id,
            frameStart: row.frameStart,
            frameStep: row.frameStep,
            frameEnd: row.frameEnd,
            engine: row.engine,
            timeStart: row.timeStart,
            project: row.project,
            resolutionX: row.resolutionX,
            resolutionY: row.resolutionY,
            state: row.state,
            software: row.software ?? "",
            version: row.version ?? "",

            frames: framesMapped,
            currentFrame: Math.max(...framesMapped.map((x) => x.frameNumber)),
        };
    }

    private mapFrame(frame: typeof jobFrames.$inferSelect): JobFrame {
        return {
            id: frame.id,
            jobId: frame.jobId,
            time: frame.time,
            timestamp: frame.timestamp,
            frameNumber: frame.frameNumber,
            info: frame.info ?? ""
        };
    }
}