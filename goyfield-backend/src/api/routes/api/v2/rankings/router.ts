import { database } from "@/serviceInstances.js";
import { Controller } from "@api/controllers/Controller.js";
import { RankingRate } from "@api/controllers/rankings/RankingRate.js";
import { generalLimiter } from "@api/middleware/rateLimiters/generalLimiter.js";
import { RequireService } from "@api/middleware/RequireService.js";
import { RankingRateRequestValidator } from "@api/middleware/validators/rankings/RankingRateRequestValidator.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import { Router } from "express";

export const rankingsRouter = Router();

rankingsRouter.use(RequireService.require(database));

rankingsRouter.get("/rate",
    generalLimiter,
    RequestValidator.with(RankingRateRequestValidator),
    Controller.with(RankingRate)
);