import type { JobsRepository, RenderJob } from "../types/jobTypes.js";

export class MemoryRepository implements JobsRepository {
    readonly jobs = new Map<string, RenderJob>();

    createJob(job: Omit<RenderJob, "id">): string {
        const id = crypto.randomUUID();
        this.jobs.set(id, { ...job, id });

        return id;
    }

    updateJob(job: RenderJob): void {
        this.jobs.set(job.id, job);
    }

    getJob(id: string): RenderJob | null {
        return this.jobs.get(id) ?? null;
    }

    getAllJobs(): RenderJob[] {
        return this.jobs.values().toArray();
    }
}