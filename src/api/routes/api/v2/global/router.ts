import { database } from "@/serviceInstances.js";
import { Controller } from "@api/controllers/Controller.js";
import { GlobalStats } from "@api/controllers/globalStats/GlobalStats.js";
import { RequireService } from "@api/middleware/RequireService.js";
import { GlobalStatsRequestValidator } from "@api/middleware/validators/globalStats/GlobalStatsRequestValidator.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import { Router } from "express";

export const globalRouter = Router();

globalRouter.use(RequireService.require(database));

globalRouter.get("/stats",
    RequestValidator.with(GlobalStatsRequestValidator),
    Controller.with(GlobalStats)
);