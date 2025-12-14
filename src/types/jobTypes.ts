export interface RenderJob {
    id: string;
    frameStart: number;
    frameStep: number;
    frameEnd: number;
    currentFrame?: number;
    engine: string;
    timeStart: number;
    timeLastFrame?: number;
    project: string;
    resolutionX: number;
    resolutionY: number;
    state: "started" | "inProgress" | "finished" | "canceled";
}

export type RenderJobDb = {
    id: string;
    frame_start: number;
    frame_step: number;
    frame_end: number;
    current_frame: number | null;
    engine: string;
    time_start: number;
    time_last_frame: number | null;
    project: string;
    resolution_x: number;
    resolution_y: number;
    state: "started" | "inProgress" | "finished" | "canceled";
};

export interface JobsRepository {
    createJob(job: Omit<RenderJob, "id">): string;
    updateJob(job: RenderJob): void;
    getJob(id: string): RenderJob | null;
    getAllJobs(): RenderJob[];
}
