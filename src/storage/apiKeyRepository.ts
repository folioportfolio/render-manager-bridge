import Database from "better-sqlite3";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eq, and} from "drizzle-orm";
import {initializeDb} from "./database.js";
import type {
    ApiKey,
    ApiKeyRepository as ApiRepository,
} from "../types/apiKeyTypes.js";
import {apiKeys} from "./schema/apiKeys.js";

export class ApiKeyRepository implements ApiRepository {
    db: BetterSQLite3Database<Record<string, never>> & {
        $client: Database.Database;
    };

    constructor() {
        const { db } = initializeDb();
        this.db = db;
    }

    async createApiKey(item: Omit<ApiKey, "apiKey">): Promise<string> {
        const id = crypto.randomUUID();

        await this.db.insert(apiKeys).values({
            apiKey: id,
            userId: item.userId,
            dateCreated: item.dateCreated,
            revoked: 0,
        });

        return id;
    }

    async deleteApiKey(apiKey: string, userId: string): Promise<boolean> {
        const id = crypto.randomUUID();

        const deleted = await this.db
            .delete(apiKeys)
            .where(eq(apiKeys.apiKey, apiKey))
            .returning();
        return deleted !== null;
    }

    async getApiKeysForUser(userId: string): Promise<ApiKey[] | null> {
        const keys = await this.db
            .select()
            .from(apiKeys)
            .where(and(eq(apiKeys.userId, userId), eq(apiKeys.revoked, 0)));

        return keys.map((x) => this.mapApiKey(x));
    }

    async getUserForApiKey(apiKey: string): Promise<string | null> {
        const userIds = await this.db
            .select({ userId: apiKeys.userId })
            .from(apiKeys)
            .where(and(eq(apiKeys.apiKey, apiKey), eq(apiKeys.revoked, 0)));

        if (!userIds || userIds.length <= 0)
            return null;

        return userIds[0]?.userId ?? null;
    }

    private mapApiKey(key: typeof apiKeys.$inferSelect): ApiKey {
        return {
            apiKey: key.apiKey,
            userId: key.userId,
            dateCreated: key.dateCreated,
            revoked: key.revoked === 1,
        };
    }
}