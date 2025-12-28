export default {
    schema: "./src/storage/schema/**/*.ts",
    out: "./src/storage/migrations",
    dialect: "sqlite",
    dbCredentials: {
        url: "./database/app.db",
    }
};
//# sourceMappingURL=drizzle.config.js.map