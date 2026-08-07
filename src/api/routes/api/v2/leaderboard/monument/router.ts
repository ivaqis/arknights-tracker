import { Controller } from "@api/controllers/Controller.js";
import { GetMonumentGroupList } from "@api/controllers/monument/GetMonumentGroupList.js";
import { GetMonumentGroupRun } from "@api/controllers/monument/GetMonumentGroupRun.js";
import { GetMonumentList } from "@api/controllers/monument/GetMonumentList.js";
import { GetMonumentRun } from "@api/controllers/monument/GetMonumentRun.js";
import {
    GetMonumentGroupListRequestValidator
} from "@api/middleware/validators/monument/GetMonumentGroupListRequestValidator.js";
import {
    GetMonumentGroupRunResponseValidator
} from "@api/middleware/validators/monument/GetMonumentGroupRunResponseValidator.js";
import { GetMonumentListRequestValidator } from "@api/middleware/validators/monument/GetMonumentListRequestValidator.js";
import { GetMonumentRunRequestValidator } from "@api/middleware/validators/monument/GetMonumentRunRequestValidator.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import { Router } from "express";

export const monumentRouter = Router();

monumentRouter.get("/list",
    RequestValidator.with(GetMonumentListRequestValidator),
    Controller.with(GetMonumentList)
);
monumentRouter.get("/group-list",
    RequestValidator.with(GetMonumentGroupListRequestValidator),
    Controller.with(GetMonumentGroupList)
);
monumentRouter.get("/run",
    RequestValidator.with(GetMonumentRunRequestValidator),
    Controller.with(GetMonumentRun)
);
monumentRouter.get("/group-run",
    RequestValidator.with(GetMonumentGroupRunResponseValidator),
    Controller.with(GetMonumentGroupRun)
);