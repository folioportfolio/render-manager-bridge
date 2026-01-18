import type { Request, Response, NextFunction } from "express";
import {ApiKeyRepository} from "../storage/apiKeyRepository.js";

export async function requireApiKey(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const apiKeyRepo: ApiKeyRepository = new ApiKeyRepository();

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing API key" });
    }

    const apiKey = authHeader.slice("Bearer ".length);

    if (!apiKey)
        return res.status(401).json({ error: "Missing API key" });

    const userId = await apiKeyRepo.getUserForApiKey(apiKey);

    if (!userId) return res.status(401).json({ error: "Invalid API key" });

    try {
        req.userId = userId;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid API key" });
    }
}
