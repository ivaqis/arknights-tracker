import { RequestLogger } from "@api/middleware/RequestLogger";
import { apiRouter } from "@api/routes/api/router";
import { uploadsRouter } from "@api/routes/uploads/router";
import e, { Router } from "express";

export const root = Router();

root.use(e.json({ limit: "10mb" }));
root.use(RequestLogger.handle);

root.use("/api", apiRouter);
root.use("/uploads", uploadsRouter);