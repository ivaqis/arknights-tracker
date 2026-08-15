import { RateLimiterLogger } from "@api/middleware/RateLimiterLogger.js";
import { RequestHandler } from "express";
import rateLimit from "express-rate-limit";

export const leaderboardLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: {
        message: "Too many leaderboard requests. Please slow down.",
        data: null
    },
    standardHeaders: true,
    legacyHeaders: false,
    logger: new RateLimiterLogger("LeaderboardLimiter"),
}) as RequestHandler<any, any, any, any>;