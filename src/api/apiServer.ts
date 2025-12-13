import express from "express"
import { createJob, endJob, getJob, getJobs, updateJobFrame, type RenderJob } from "../state/renderJobs.js"
import { notifyFrame, notifyRenderEnd, notifyRenderStart } from "../sockets/socketServer.js"
import type { Request, Response } from "express"
import type { RenderEndRequest, RenderReportRequest, RenderStartRequest } from "../types/requests.js"
import type { Express } from "express"

export const initApiServer = (app: Express) => {
    app.use(express.json())

    app.use(function (req: Request, res: Response, next: () => void) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.post('/api/render/start', (req: Request, res: Response) => {
        console.log("Received Render Start")
        const data = req.body as RenderStartRequest;

        const job : Omit<RenderJob, "id"> = {
            engine: data.engine,
            frameStart: data.frameStart,
            frameEnd: data.frameEnd,
            frameStep: data.frameStep,
            timeStart: new Date(data.timestamp * 1000),
            project: data.project,
            resolutionX: data.resolutionX,
            resolutionY: data.resolutionY,
            state: "started"
        }

        const id = createJob(job);

        notifyRenderStart(id, {id, ...job});

        return res.send(id);
    })

    app.post('/api/render/end/:id', (req: Request, res: Response) => {
        console.log("Received Render End")

        const id = req.params.id;

        if (!id)
            return res.status(404).json({ "error": "No key specified" });

        const data = req.body as RenderEndRequest;

        endJob(id, data.event === "render-cancel");
        notifyRenderEnd(id);

        return res.sendStatus(200);
    })

    app.post('/api/render/report/:id', (req: Request, res: Response) => {
        console.log("Received Render Frame")

        const id = req.params.id;

        if (!id)
            return res.status(404).json({ "error": "No key specified" });

        const data = req.body as RenderReportRequest;

        updateJobFrame(id, data.currentFrame, new Date(data.timestamp * 1000));
        notifyFrame(id, data.currentFrame);

        return res.sendStatus(200);
    })

    app.get('/api/render', (req: Request, res: Response) => {
        return res.json(getJobs());
    })

    app.get('/api/render/:id', (req: Request, res: Response) => {
        const id = req.params.id;

        if (!id)
            return res.status(404).json({ "error": "No key specified" });

        return res.json(getJob(id));
    })

}