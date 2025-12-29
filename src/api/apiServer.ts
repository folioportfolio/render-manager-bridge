import express from "express";
import { notifyFrame, notifyRenderEnd, notifyRenderStart } from "../sockets/socketServer.js";
import type { Request, Response } from "express";
import type { RenderEndRequest, RenderReportRequest, RenderStartRequest } from "../types/requestTypes.js";
import type { Express } from "express";
import type { JobsRepository, RenderJob } from "../types/jobTypes.js";
import "../storage/databaseRepository.js";
import { SqliteJobRepository } from "../storage/databaseRepository.js";

export const initApiServer = (app: Express) => {
    const repo: JobsRepository = new SqliteJobRepository();

    app.use(express.json())

    app.use(function (req: Request, res: Response, next: () => void) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.post("/api/render/start", async (req: Request, res: Response) => {
        console.log("Received Render Start");
        const data = req.body as RenderStartRequest;

        const job: Omit<RenderJob, "id"> = {
            engine: data.engine,
            frameStart: data.frameStart,
            frameEnd: data.frameEnd,
            frameStep: data.frameStep,
            timeStart: data.timestamp,
            project: data.project,
            resolutionX: data.resolutionX,
            resolutionY: data.resolutionY,
            state: "started",
            software: data.software,
            version: data.version
        };

        const id = await repo.createJob(job);

        notifyRenderStart(id, { id, ...job });

        return res.send(id);
    });

    app.post('/api/render/end/:id', async (req: Request, res: Response) => {
        console.log("Received Render End")

        const id = req.params.id;

        if (!id)
            return res.status(404).json({ "error": "No key specified" });

        const data = req.body as RenderEndRequest;

        const job = await repo.getJob(id);

        if (!job)
            return res.status(404).json({ "error": "No job found" });

        const state = data.event === "render-cancel" ? "canceled" : "finished";
        await repo.updateJob({...job, state: state});
        notifyRenderEnd(id, state);

        return res.sendStatus(200);
    })

    app.post("/api/render/report/:id", async (req: Request, res: Response) => {
        console.log("Received Render Frame");

        const id = req.params.id;

        if (!id)
            return res.status(404).json({ error: "No key specified" });

        const data = req.body as RenderReportRequest;

        await repo.createJobFrame({
            jobId: id,
            frameNumber: data.currentFrame,
            time: data.time,
            timestamp: data.timestamp,
            info: data.info
        });
        notifyFrame(id, data.currentFrame);

        return res.sendStatus(200);
    });

    app.get("/api/render", async (req: Request, res: Response) => {
        const id = req.query.id as string | undefined;
        const countParam = req.query.count as string | undefined;
        const pageParam = req.query.page as string | undefined;

        // ID set, return single job
        if (id) {
            return res.json(await repo.getJob(id));
        }

        // Count set, return paginated jobs
        const count = countParam ? parseInt(countParam, 10) : undefined;
        const page = pageParam ? parseInt(pageParam, 10) : undefined;

        if (countParam && Number.isNaN(count)) {
            return res.status(400).json({ error: "count must be a number" });
        }

        if (pageParam && Number.isNaN(page)) {
            return res.status(400).json({ error: "page must be a number" });
        }

        // No params parsed, return all
        if (!count && !page) {
            return res.json(await repo.getJobsPaged("startTimeDESC"));
        }

        // No cursor parsed, return first X
        if (count && !page) {
            return res.json(await repo.getJobsPaged("startTimeDESC", count));
        }

        // Cursor and count parsed, return page
        return res.json(
            await repo.getJobsPaged("startTimeDESC", count, page)
        );
    })
}