import rateLimit from "express-rate-limit";

export const importLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 3,
    message: {
        message: "Too many requests. Please wait a minute before trying again.",
        data: null
    },
    standardHeaders: true,
    legacyHeaders: false,
});