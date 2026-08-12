import { authenticator, database, firebase } from "@/serviceInstances.js";
import { leaderboardLimiter } from "@api/middleware/rateLimiters/leaderboardLimiter.js";
import { RequireService } from "@api/middleware/RequireService.js";
import { contractRouter } from "@api/routes/api/v2/leaderboard/contract/router.js";
import { monumentRouter } from "@api/routes/api/v2/leaderboard/monument/router.js";
import { Router } from "express";

export const leaderboardRouter = Router();

leaderboardRouter.use(RequireService.require(database, firebase, authenticator));
leaderboardRouter.use(leaderboardLimiter);

leaderboardRouter.use("/contract", contractRouter);
leaderboardRouter.use("/monument", monumentRouter);