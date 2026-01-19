import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import type { RenderJob } from "../types/jobTypes.js";
import admin from "firebase-admin";

let io: Server

export const initWebSockets = (server: HttpServer) => {
    io = new Server(server, {
        cors: { origin: "*" }
    })

    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;

        const decoded = await admin.auth().verifyIdToken(token);
        socket.data.userId = decoded.uid;

        next();
    });

    io.on("connection", socket => {
        const userId = socket.data.userId;
        socket.join(userId);

        socket.on("disconnect", (reason) => {
            console.log("client disconnected", reason);
        });

        console.log("client connected")
    })
}

export const notifyRenderStart = (jobId: string, job: RenderJob) => {
    console.log("Sockets in room:", io.sockets.adapter.rooms.get(job.userId));
    io.to(job.userId).emit("render-start", { jobId, job });
}

export const notifyFrame = (jobId: string, frame: number, userId: string) => {
    io.to(userId).emit("frame-update", { jobId, frame });
};

export const notifyRenderEnd = (jobId: string, state: string, userId: string) => {
    io.to(userId).emit("render-end", { jobId, state });
};