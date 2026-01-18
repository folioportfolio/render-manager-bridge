import type { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";

export async function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing auth token" });
    }

    const token = authHeader.split(" ")[1];

    if (!token)
        return res.status(401).json({ error: "Missing auth token" });

    try {
        const decoded = await admin.auth().verifyIdToken(token);
        req.userId = decoded.uid;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid auth token" });
    }
}
