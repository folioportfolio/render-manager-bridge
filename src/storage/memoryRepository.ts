import type { JobsRepository, OrderType, RenderJob } from "../types/jobTypes.js";

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

    getJobs(order: OrderType, count?: number, cursor?: string): RenderJob[] {
        const sorted = this.jobs.values().toArray().toSorted((x, y) => x.timeStart - y.timeStart);
        const index = sorted.findIndex(item => item.id === cursor) ?? -1;
        const limit = count ?? sorted.length;

        return sorted.slice(index + 1, index + 1 + limit);
    }
}