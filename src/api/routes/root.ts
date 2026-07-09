import { apiRouter } from "@api/routes/api/router";
import { uploadsRouter } from "@api/routes/uploads/router";
import { Router } from "express";

export const root = Router();

root.use("/api", apiRouter);
root.use("/uploads", uploadsRouter);