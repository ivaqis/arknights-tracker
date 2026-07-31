import { database } from "@/serviceInstances";
import { RequireService } from "@api/middleware/RequireService";
import { RankingDataRequestValidator } from "@api/middleware/validators/rankings/RankingDataRequestValidator";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { Router } from "express";

export const rankingsRouter = Router();

rankingsRouter.use(RequireService.require(database));

rankingsRouter.get("/data",
    RequestValidator.with(RankingDataRequestValidator)
    // todo
);