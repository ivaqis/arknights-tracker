import { Controller } from "@api/controllers/Controller";
import { GetMonumentRun } from "@api/controllers/monument/GetMonumentRun";
import { GetMonumentRunRequestValidator } from "@api/middleware/validators/monument/GetMonumentRunRequestValidator";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { Router } from "express";

export const monumentRouter = Router();

// monumentRouter.get("/list"); // todo
monumentRouter.get("/run", RequestValidator.with(GetMonumentRunRequestValidator), Controller.with(GetMonumentRun));