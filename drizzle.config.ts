import type { Config } from "drizzle-kit";

export default {
    schema: "./dist/storage/schema/**/*.js",
    out: "./drizzle",
    dialect: "sqlite",
    dbCredentials: {
        url: "./database/app.db",
    }
} satisfies Config;
