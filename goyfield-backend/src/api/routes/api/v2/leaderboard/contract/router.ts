import { AttachContractVideo } from "@api/controllers/contract/AttachContractVideo.js";
import { DeleteContractVideo } from "@api/controllers/contract/DeleteContractVideo.js";
import { GetContractList } from "@api/controllers/contract/GetContractList.js";
import { GetContractRun } from "@api/controllers/contract/GetContractRun.js";
import { Controller } from "@api/controllers/Controller.js";
import { RequireAuth } from "@api/middleware/RequireAuth.js";
import { GetContractListRequestValidator } from "@api/middleware/validators/contract/GetContractListRequestValidator.js";
import { GetContractRunRequestValidator } from "@api/middleware/validators/contract/GetContractRunRequestValidator.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import { AuthType } from "@services/auth/AuthType.js";
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
contractRouter.post("/video",
    RequireAuth.require(AuthType.FIREBASE),
    Controller.with(AttachContractVideo)
);
contractRouter.delete("/video",
    RequireAuth.require(AuthType.FIREBASE),
    Controller.with(DeleteContractVideo)
);
