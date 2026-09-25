import { RequestLogger } from "@api/middleware/RequestLogger.js";
import { apiRouter } from "@api/routes/api/router.js";
import { uploadsRouter } from "@api/routes/uploads/router.js";
import e, { Router } from "express";

export const root = Router();

root.use(e.json({ limit: "10mb" }));
root.use(RequestLogger.handle);

root.use("/api", apiRouter);
root.use("/uploads", uploadsRouter);