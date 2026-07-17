import { GetContractRun } from "@api/controllers/contract/GetContractRun";
import { Controller } from "@api/controllers/Controller";
import { GetContractRunRequestValidator } from "@api/middleware/validators/contract/GetContractRunRequestValidator";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { Router } from "express";

export const contractRouter = Router();

// contractRouter.get("/list"); // todo
contractRouter.get("/run", RequestValidator.with(GetContractRunRequestValidator), Controller.with(GetContractRun));