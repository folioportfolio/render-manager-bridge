type RenderEvent = "render-start" | "render-end" | "render-frame-write" | "render-cancel"; 

export interface RenderStartRequest {
    event: RenderEvent;
    frameStart: number,
    frameStep: number,
    frameEnd: number,
    engine: string,
    timestamp: number,
    project: string,
    resolutionX: number,
    resolutionY: number
}

export interface RenderEndRequest {
    event: RenderEvent;
    timestamp: number
}

export interface RenderReportRequest {
    event: RenderEvent;
    currentFrame: number,
    timestamp: number
}