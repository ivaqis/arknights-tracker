import { GetContractRunRequestValidator } from "@api/middleware/validators/contract/GetContractRunRequestValidator";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { Router } from "express";

export const contractRouter = Router();

// contractRouter.get("/list"); // todo
contractRouter.get("/run", RequestValidator.with(GetContractRunRequestValidator)); // todo