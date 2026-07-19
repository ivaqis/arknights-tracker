import { Controller } from "@api/controllers/Controller";
import { GetMonumentGroupRun } from "@api/controllers/monument/GetMonumentGroupRun";
import { GetMonumentRun } from "@api/controllers/monument/GetMonumentRun";
import {
    GetMonumentGroupRunResponseValidator
} from "@api/middleware/validators/monument/GetMonumentGroupRunResponseValidator";
import { GetMonumentRunRequestValidator } from "@api/middleware/validators/monument/GetMonumentRunRequestValidator";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { Router } from "express";

export const monumentRouter = Router();

// monumentRouter.get("/list"); // todo
// monumentRouter.get("/groupList"); // todo
monumentRouter.get("/run", RequestValidator.with(GetMonumentRunRequestValidator), Controller.with(GetMonumentRun));
monumentRouter.get("/groupRun", RequestValidator.with(GetMonumentGroupRunResponseValidator), Controller.with(GetMonumentGroupRun));