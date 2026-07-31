import { database } from "@/serviceInstances";
import { Controller } from "@api/controllers/Controller";
import { RankingRate } from "@api/controllers/rankings/RankingRate";
import { RequireService } from "@api/middleware/RequireService";
import { RankingRateRequestValidator } from "@api/middleware/validators/rankings/RankingRateRequestValidator";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { Router } from "express";

export const rankingsRouter = Router();

rankingsRouter.use(RequireService.require(database));

rankingsRouter.get("/rate",
    RequestValidator.with(RankingRateRequestValidator),
    Controller.with(RankingRate)
);