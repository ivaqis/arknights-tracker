import { GetContractList } from "@api/controllers/contract/GetContractList";
import { GetContractRun } from "@api/controllers/contract/GetContractRun";
import { Controller } from "@api/controllers/Controller";
import { GetContractListRequestValidator } from "@api/middleware/validators/contract/GetContractListRequestValidator";
import { GetContractRunRequestValidator } from "@api/middleware/validators/contract/GetContractRunRequestValidator";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { Router } from "express";

export const contractRouter = Router();

contractRouter.get("/list", RequestValidator.with(GetContractListRequestValidator), Controller.with(GetContractList));
contractRouter.get("/run", RequestValidator.with(GetContractRunRequestValidator), Controller.with(GetContractRun));