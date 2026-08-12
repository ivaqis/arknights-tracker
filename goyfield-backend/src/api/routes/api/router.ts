import { apiV2Router } from "@api/routes/api/v2/router.js";
import { Router } from "express";

export const apiRouter = Router();

apiRouter.use("/v2", apiV2Router);