import express from "express";
import { notifyFrame, notifyRenderEnd, notifyRenderStart } from "../sockets/socketServer.js";
import type { Request, Response } from "express";
import type {
    RenderEndRequest,
    RenderReportRequest,
    RenderStartRequest,
} from "../types/requestTypes.js";
import type { Express } from "express";
import type { JobsRepository, RenderJob } from "../types/jobTypes.js";
import "../storage/renderJobRepository.js";
import { RenderJobRepository } from "../storage/renderJobRepository.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { ApiKeyRepository } from "../storage/apiKeyRepository.js";
import { requireApiKey } from "../auth/apiKeyMiddleware.js";
import { UserRepository } from "../storage/userRepository.js";

export const initApiServer = (app: Express) => {
    const jobsRepo: JobsRepository = new RenderJobRepository();
    const apiKeyRepo: ApiKeyRepository = new ApiKeyRepository();
    const userRepo: UserRepository = new UserRepository();

    app.use(express.json())

    app.use(function (req: Request, res: Response, next: () => void) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

        if (req.method === "OPTIONS") {
            return res.sendStatus(204);
        }

        next();
    });

    app.post("/api/render/start", requireApiKey, async (req: Request, res: Response) => {
        console.log("Received Render Start");
        const data = req.body as RenderStartRequest;
        const userId = req.userId!;

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
            version: data.version,
            userId: userId,
        };

        const id = await jobsRepo.createJob(job);

        notifyRenderStart(id, { id, ...job });

        return res.send(id);
    });

    app.post("/api/render/end/:id", requireApiKey, async (req: Request, res: Response) => {
        console.log("Received Render End");

        const id = req.params.id;
        const userId = req.userId!;

        if (!id)
            return res.status(404).json({ error: "No key specified" });

        const data = req.body as RenderEndRequest;

        const job = await jobsRepo.getJob(id, userId);

        if (!job)
            return res.status(404).json({ error: "No job found" });

        const state =
            data.event === "render-cancel" ? "canceled" : "finished";
        await jobsRepo.updateJob({ ...job, state: state });
        notifyRenderEnd(id, state, userId);

        return res.sendStatus(200);
    });

    app.post("/api/render/report/:id", requireApiKey, async (req: Request, res: Response) => {
            console.log("Received Render Frame");

            const id = req.params.id;
            const userId = req.userId!;

            if (!id)
                return res.status(404).json({ error: "No key specified" });

            const job = await jobsRepo.getJob(id, userId);

            if (!job)
                return res.status(404).json({ error: "No job found" });

            const data = req.body as RenderReportRequest;

            await jobsRepo.createJobFrame({
                jobId: id,
                frameNumber: data.currentFrame,
                time: data.time,
                timestamp: data.timestamp,
                info: data.info,
            });

            notifyFrame(id, data.currentFrame, userId);

            return res.sendStatus(200);
        }
    );

    app.get("/api/render", requireAuth, async (req: Request, res: Response) => {
        const id = req.query.id as string | undefined;
        const countParam = req.query.count as string | undefined;
        const pageParam = req.query.page as string | undefined;

        const userId = req.userId!;

        // ID set, return single job
        if (id) {
            return res.json(await jobsRepo.getJob(id, userId));
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
            return res.json(await jobsRepo.getJobsPaged(userId, "startTimeDESC", ));
        }

        // No cursor parsed, return first X
        if (count && !page) {
            return res.json(await jobsRepo.getJobsPaged(userId, "startTimeDESC", count));
        }

        // Cursor and count parsed, return page
        return res.json(
            await jobsRepo.getJobsPaged(userId, "startTimeDESC", count, page)
        );
    })

    app.get("/api/apps", requireAuth, async (req: Request, res: Response) => {
        const userId = req.userId!;

        const keys = await apiKeyRepo.getApiKeysForUser(userId);

        return res.json(keys?.map(x => ({
            apiKey: x.apiKey,
            dateCreated: x.dateCreated
        })));
    });

    app.post("/api/apps", requireAuth, async (req: Request, res: Response) => {
        const userId = req.userId!;
        const dateCreated = Date.now();

        const apiKey = await apiKeyRepo.createApiKey({
            userId: userId,
            revoked: false,
            dateCreated: dateCreated
        });

        return res.json({
            apiKey: apiKey,
            dateCreated: dateCreated,
        });
    });

    app.delete("/api/apps/:id", requireAuth, async (req: Request, res: Response) => {
        const id = req.params.id;
        const userId = req.userId!;

        if (!id)
            return res.status(404).json({ "error": "No key specified" });

        const success = await apiKeyRepo.deleteApiKey(id, userId);

        if (!success)
            return res.status(404).json({ "error": "No key found" });

        return res.status(200).json(success);
    })

    app.post("/api/user", requireAuth, async (req: Request, res: Response) => {
        const userId = req.userId!;

        const exists = await userRepo.userExists(userId);

        if (exists)
            return res.status(200);

        const id = await userRepo.createUser({
            id: userId,
            dateCreated: Date.now()
        });

        return res.status(200);
    })

    app.delete("/api/user", requireAuth, async (req: Request, res: Response) => {
        const userId = req.userId!;

        const success = await userRepo.deleteUser(userId);

        if (!success)
            return res.status(404).json({ "error": "No user found" });

        return res.status(200);
    })
}