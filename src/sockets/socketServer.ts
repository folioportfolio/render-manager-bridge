import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import type { RenderJob } from "../types/jobTypes.js";

let io: Server

export const initWebSockets = (server: HttpServer) => {
    io = new Server(server, {
        cors: { origin: "*" }
    })

    io.on("connection", socket => {
        console.log("client connected")
    })
}

export const notifyRenderStart = (jobId: string, job: RenderJob) => {
    io.emit("render-start", { jobId, job });
}

export const notifyFrame = (jobId: string, frame: number) => {
    io.emit("frame-update", { jobId, frame });
}

export const notifyRenderEnd = (jobId: string) => {
    io.emit("render-end", { jobId });
}