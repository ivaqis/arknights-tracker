import { globalStatsRouter } from "@api/routes/api/global/stats/router";
import { Router } from "express";

export const globalRouter = Router();

globalRouter.use("/stats", globalStatsRouter);