export interface RenderJob {
    id: string;
    frameStart: number;
    frameStep: number;
    frameEnd: number;
    engine: string;
    timeStart: number;
    timeEnd?: number | undefined;
    framesRendered?: number | undefined;
    project: string;
    resolutionX: number;
    resolutionY: number;
    software?: string;
    version?: string;

    currentFrame?: number;
    frames?: JobFrame[];
    state: "started" | "inProgress" | "finished" | "canceled";

    userId: string;
}

export interface JobFrame {
    id: string;
    jobId: string;
    frameNumber: number;
    time: number;
    timestamp: number;
    info?: string;
}

export type OrderType = "startTimeASC" | "startTimeDESC";

export interface JobsRepository {
    createJob(job: Omit<RenderJob, "id">): Promise<string>;
    updateJob(job: RenderJob): Promise<void>;
    getJob(id: string, userId: string): Promise<RenderJob | null>;
    getJobsPaged(
        userId: string,
        order: OrderType,
        count?: number,
        page?: number,
    ): Promise<{ items: RenderJob[]; totalCount: number } | null>;

    createJobFrame(frame: Omit<JobFrame, "id">): Promise<string>;
    getAllFrameForJob(id: string): Promise<JobFrame[] | null>;
    getLastFrameForJob(id: string): Promise<number | null>;
}
