import Database from "better-sqlite3";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eq, and } from "drizzle-orm";
import { initializeDb } from "./database.js";
import type {
    User,
    UserRepository as UserDataRepository,
} from "../types/userTypes.js";
import {users} from "./schema/users.js";

export class UserRepository implements UserDataRepository {
    db: BetterSQLite3Database<Record<string, never>> & {
        $client: Database.Database;
    };

    constructor() {
        const { db } = initializeDb();
        this.db = db;
    }

    async createUser(item: User): Promise<string> {
        await this.db.insert(users).values({
            id: item.id,
            dateCreated: item.dateCreated
        });

        return item.id;
    }

    async deleteUser(id: string): Promise<boolean> {
        const deleted = await this.db
            .delete(users)
            .where(eq(users.id, id))
            .returning();
        return deleted !== null;
    }

    async userExists(id: string): Promise<boolean> {
        const rows = await this.db.select().from(users).where(eq(users.id, id));

        return rows && rows.length > 0;
    }
}
