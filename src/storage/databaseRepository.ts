import Database from "better-sqlite3";
import type {Database as SqliteDb} from "better-sqlite3";
import type { JobsRepository, OrderType, RenderJob, RenderJobDb } from "../types/jobTypes.js";

export class SqliteJobRepository implements JobsRepository {
    db: SqliteDb;

    constructor() {
        this.db = new Database("./database/app.db");
        this.initDb();
    }

    createJob(job: Omit<RenderJob, "id">): string {
        const id = crypto.randomUUID();

        this.db.prepare(`
            INSERT INTO render_jobs (
                id, 
                frame_start, 
                frame_step,
                frame_end,
                engine,
                time_start,
                project,
                resolution_x,
                resolution_y,
                state
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            id,
            job.frameStart,
            job.frameStep,
            job.frameEnd,
            job.engine,
            job.timeStart,
            job.project,
            job.resolutionX,
            job.resolutionY,
            job.state
        );

        return id;
    }

    updateJob(job: RenderJob): void {
        this.db.prepare(`
            UPDATE render_jobs
            SET
                frame_start     = @frameStart,
                frame_step      = @frameStep,
                frame_end       = @frameEnd,
                current_frame   = @currentFrame,
                engine          = @engine,
                time_start      = @timeStart,
                time_last_frame = @timeLastFrame,
                project         = @project,
                resolution_x    = @resolutionX,
                resolution_y    = @resolutionY,
                state           = @state
            WHERE id = @id
        `).run({
            id: job.id,
            frameStart: job.frameStart,
            frameStep: job.frameStep,
            frameEnd: job.frameEnd,
            currentFrame: job.currentFrame ?? null,
            engine: job.engine,
            timeStart: job.timeStart,
            timeLastFrame: job.timeLastFrame ?? null,
            project: job.project,
            resolutionX: job.resolutionX,
            resolutionY: job.resolutionY,
            state: job.state
        });
    }

    getJob(id: string): RenderJob | null {
        const job = this.db.prepare(`
            SELECT * FROM render_jobs WHERE id = ?
        `).get(id) as RenderJobDb;

        return job ? this.mapJob(job) : null;
    }

    getJobs(order: OrderType = "startTimeDESC", count?: number, cursor?: string): RenderJob[] {
        const orderColumn = this.getOrderColumn(order);
        const orderDirection = this.getOrderDirection(order);
        
        let query = `
            SELECT *
            FROM render_jobs
        `;

        if (cursor) {
            query += `
                WHERE (${orderColumn}, id) < (
                    SELECT ${orderColumn}, id
                    FROM render_jobs
                    WHERE id = @cursor
                )
            `;
        }

        query += `ORDER BY ${orderColumn} ${orderDirection}`;

        if (count) {
            query += ` LIMIT @count`;
        }

        const jobs = this.db.prepare(query).all({
                cursor: cursor,
                count: count
            }) as RenderJobDb[];

        return jobs.map(x => this.mapJob(x));
    }

    initDb(): void {
        try {
            this.db.prepare(`
                CREATE TABLE IF NOT EXISTS render_jobs (
                    id TEXT PRIMARY KEY,

                    frame_start     INTEGER NOT NULL,
                    frame_step      INTEGER NOT NULL,
                    frame_end       INTEGER NOT NULL,
                    current_frame   INTEGER,

                    engine          TEXT,

                    time_start      REAL NOT NULL,
                    time_last_frame REAL,

                    project         TEXT,

                    resolution_x    INTEGER NOT NULL,
                    resolution_y    INTEGER NOT NULL,

                    state TEXT NOT NULL
                        CHECK (state IN ('started', 'inProgress', 'finished', 'canceled'))
                )
            `).run();
        } catch (error) {
        console.log(error);
        }
    }

    private mapJob(row: RenderJobDb): RenderJob {
        return {
            id: row.id,
            frameStart: row.frame_start,
            frameStep: row.frame_step,
            frameEnd: row.frame_end,
            engine: row.engine,
            timeStart: row.time_start,
            project: row.project,
            resolutionX: row.resolution_x,
            resolutionY: row.resolution_y,
            state: row.state,
            ...(row.time_last_frame !== null && {
                timeLastFrame: row.time_last_frame
            }),
            ...(row.current_frame !== null && {
                currentFrame: row.current_frame
            }),
        };
    }

    private getOrderColumn(order: OrderType): string {
        switch (order) {
            case "startTimeASC":
            case "startTimeDESC":
                return "time_start";
            case "lastFrameTimeASC":
            case "lastFrameTimeDESC":
                return "time_last_frame";
            default:
                throw new Error("Invalid order type");
        }
    }

    private getOrderDirection(order: OrderType): string {
        switch (order) {
            case "startTimeASC":
            case "lastFrameTimeASC":
                return "ASC";
            case "startTimeDESC":
            case "lastFrameTimeDESC":
                return "DESC";
            default:
                throw new Error("Invalid order type");
        }
    }
}