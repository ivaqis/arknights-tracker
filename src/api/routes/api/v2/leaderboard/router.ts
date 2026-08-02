import { database, firebase } from "@/serviceInstances";
import { RequireService } from "@api/middleware/RequireService";
import { contractRouter } from "@api/routes/api/v2/leaderboard/contract/router";
import { monumentRouter } from "@api/routes/api/v2/leaderboard/monument/router";
import { Router } from "express";

export const leaderboardRouter = Router();

leaderboardRouter.use(RequireService.require(database, firebase));

leaderboardRouter.use("/contract", contractRouter);
leaderboardRouter.use("/monument", monumentRouter);