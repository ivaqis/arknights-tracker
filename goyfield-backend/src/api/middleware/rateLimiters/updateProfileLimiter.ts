import { RateLimiterLogger } from "@api/middleware/RateLimiterLogger.js";
import { RequestHandler } from "express";
import rateLimit from "express-rate-limit";

export const updateProfileLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 15,
    message: {
        message: "Too many requests. Please wait a minute.",
        data: null
    },
    standardHeaders: true,
    legacyHeaders: false,
    logger: new RateLimiterLogger("UpdateProfileLimiter"),
}) as RequestHandler<any, any, any, any>;

