import { RateLimiterLogger } from "@api/middleware/RateLimiterLogger.js";
import { RequestHandler } from "express";
import rateLimit from "express-rate-limit";

export const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: {
        message: "Too many requests",
        data: null
    },
    standardHeaders: true,
    legacyHeaders: false,
    logger: new RateLimiterLogger("GeneralLimiter"),
}) as RequestHandler<any, any, any, any>;