import { RequestLogger } from "@api/middleware/RequestLogger.js";
import { apiRouter } from "@api/routes/api/router.js";
import { uploadsRouter } from "@api/routes/uploads/router.js";
import e, { NextFunction, Request, Response, Router } from "express";

export const root = Router();

root.use(e.json({ limit: "10mb" }));
root.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && "body" in err) {
        res.status(400).json({
            message: "Invalid JSON",
            data: null
        });
        return;
    }
    next(err);
});
root.use(RequestLogger.handle);

root.use("/api", apiRouter);
root.use("/uploads", uploadsRouter);