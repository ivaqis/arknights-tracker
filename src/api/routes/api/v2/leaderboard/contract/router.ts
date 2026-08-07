import { GetContractList } from "@api/controllers/contract/GetContractList.js";
import { GetContractRun } from "@api/controllers/contract/GetContractRun.js";
import { Controller } from "@api/controllers/Controller.js";
import { GetContractListRequestValidator } from "@api/middleware/validators/contract/GetContractListRequestValidator.js";
import { GetContractRunRequestValidator } from "@api/middleware/validators/contract/GetContractRunRequestValidator.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import { Router } from "express";

export const contractRouter = Router();

contractRouter.get("/list",
    RequestValidator.with(GetContractListRequestValidator),
    Controller.with(GetContractList)
);
contractRouter.get("/run",
    RequestValidator.with(GetContractRunRequestValidator),
    Controller.with(GetContractRun)
);