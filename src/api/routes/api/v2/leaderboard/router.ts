import { authenticator, database, firebase } from "@/serviceInstances.js";
import { RequireService } from "@api/middleware/RequireService.js";
import { contractRouter } from "@api/routes/api/v2/leaderboard/contract/router.js";
import { monumentRouter } from "@api/routes/api/v2/leaderboard/monument/router.js";
import { Router } from "express";

export const leaderboardRouter = Router();

leaderboardRouter.use(RequireService.require(database, firebase, authenticator));

leaderboardRouter.use("/contract", contractRouter);
leaderboardRouter.use("/monument", monumentRouter);