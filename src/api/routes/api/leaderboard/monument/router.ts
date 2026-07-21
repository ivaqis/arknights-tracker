import { Controller } from "@api/controllers/Controller";
import { GetMonumentGroupList } from "@api/controllers/monument/GetMonumentGroupList";
import { GetMonumentGroupRun } from "@api/controllers/monument/GetMonumentGroupRun";
import { GetMonumentList } from "@api/controllers/monument/GetMonumentList";
import { GetMonumentRun } from "@api/controllers/monument/GetMonumentRun";
import {
    GetMonumentGroupListRequestValidator
} from "@api/middleware/validators/monument/GetMonumentGroupListRequestValidator";
import {
    GetMonumentGroupRunResponseValidator
} from "@api/middleware/validators/monument/GetMonumentGroupRunResponseValidator";
import { GetMonumentListRequestValidator } from "@api/middleware/validators/monument/GetMonumentListRequestValidator";
import { GetMonumentRunRequestValidator } from "@api/middleware/validators/monument/GetMonumentRunRequestValidator";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { Router } from "express";

export const monumentRouter = Router();

monumentRouter.get("/list", RequestValidator.with(GetMonumentListRequestValidator), Controller.with(GetMonumentList));
monumentRouter.get("/group-list", RequestValidator.with(GetMonumentGroupListRequestValidator), Controller.with(GetMonumentGroupList));
monumentRouter.get("/run", RequestValidator.with(GetMonumentRunRequestValidator), Controller.with(GetMonumentRun));
monumentRouter.get("/group-run", RequestValidator.with(GetMonumentGroupRunResponseValidator), Controller.with(GetMonumentGroupRun));