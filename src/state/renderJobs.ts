import type { UUID } from "crypto";
import type { RenderStartRequest } from "../types/requests.js";

export interface RenderJob {
    id: string
    frameStart: number,
    frameStep: number,
    frameEnd: number,
    currentFrame?: number,
    engine: string,
    timeStart: Date,
    timeLastFrame?: Date,
    project: string,
    resolutionX: number,
    resolutionY: number
    state: "started" | "inProgress" | "finished" | "canceled"
}

const jobs = new Map<string, RenderJob>();

export const createJob = (job : Omit<RenderJob, "id">) : string => {
    const id = crypto.randomUUID();

    jobs.set(id, {...job, id});

    return id;
}

export const updateJobFrame = (id: string, currentFrame: number, timestamp: Date) : void => {
    const job = jobs.get(id)

    if (job) {
        jobs.set(id, {...job, currentFrame, timeLastFrame: timestamp, state: "inProgress"})
    }
}

export const endJob = (id : string, isCancelled : boolean = false) : void => {
    const job = jobs.get(id)

    if (job) {
        jobs.set(id, {...job, state: isCancelled ? "canceled" : "finished"})
    }
}

export const getJob = (id: string) : RenderJob | undefined => {
    return jobs.get(id);
}

export const getJobs = () : RenderJob[] => {
    return jobs.values().toArray();
}