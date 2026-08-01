import { database } from "@/serviceInstances";
import { Controller } from "@api/controllers/Controller";
import { GlobalStats } from "@api/controllers/globalStats/GlobalStats";
import { RequireService } from "@api/middleware/RequireService";
import { GlobalStatsRequestValidator } from "@api/middleware/validators/globalStats/GlobalStatsRequestValidator";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { Router } from "express";

export const globalRouter = Router();

globalRouter.use(RequireService.require(database));

globalRouter.get("/stats",
    RequestValidator.with(GlobalStatsRequestValidator),
    Controller.with(GlobalStats)
);