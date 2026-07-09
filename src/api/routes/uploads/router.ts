import e, { Router } from "express";
import path from "node:path";

export const uploadsRouter = Router();

uploadsRouter.use("/", e.static(path.resolve(process.cwd(), "uploads")));