import { contractRouter } from "@api/routes/api/leaderboard/contract/router";
import { monumentRouter } from "@api/routes/api/leaderboard/monument/router";
import { Router } from "express";

export const leaderboardRouter = Router();

leaderboardRouter.use("/contract", contractRouter);
leaderboardRouter.use("/monument", monumentRouter);