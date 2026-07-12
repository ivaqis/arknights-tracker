import rateLimit from "express-rate-limit";

export const syncLimiter = rateLimit({
    windowMs: 1 * 10 * 1000, // 15 minutes todo ПОМЕНЯТЬ 15 * 60 * 1000
    max: 10,
    message: {
        message: "Too many sync attempts. Sync is allowed once every 7 minutes.",
        data: null
    },
    standardHeaders: true,
    legacyHeaders: false,
});