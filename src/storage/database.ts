import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

export function initializeDb() {
    const sqlite = new Database("./database/app.db");

    sqlite.pragma("foreign_keys = ON");
    sqlite.pragma("journal_mode = WAL");

    const db = drizzle(sqlite);

    migrate(db, { migrationsFolder: "drizzle" });

    return { db, sqlite };
}
