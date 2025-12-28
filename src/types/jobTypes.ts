export interface RenderJob {
    id: string;
    frameStart: number;
    frameStep: number;
    frameEnd: number;
    engine: string;
    timeStart: number;
    project: string;
    resolutionX: number;
    resolutionY: number;
    currentFrame?: number;
    frames?: JobFrame[];
    state: "started" | "inProgress" | "finished" | "canceled";
}

export interface JobFrame {
    id: string;
    jobId: string;
    frameNumber: number;
    timestamp: number;
}

export type OrderType = "startTimeASC" | "startTimeDESC";

export interface JobsRepository {
    createJob(job: Omit<RenderJob, "id">): Promise<string>;
    updateJob(job: RenderJob): Promise<void>;
    getJob(id: string): Promise<RenderJob | null>;
    getJobsPaged(order: OrderType, count?: number, page?: number): Promise<RenderJob[] | null>;

    createJobFrame(frame: Omit<JobFrame, "id">): Promise<string>;
    getAllFrameForJob(id: string): Promise<JobFrame[] | null>;
    getLastFrameForJob(id: string): Promise<number | null>;
}
