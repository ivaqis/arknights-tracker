import rateLimit from "express-rate-limit";

export const uploadLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: {
        message: "Too many avatar upload attempts. Please try again later.",
        data: null
    },
    standardHeaders: true,
    legacyHeaders: false,
});