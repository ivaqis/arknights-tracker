import { Controller } from "@api/controllers/Controller.js";
import { GetWarEchoesGroupList } from "@api/controllers/warEchoes/GetWarEchoesGroupList.js";
import { GetWarEchoesGroupRun } from "@api/controllers/warEchoes/GetWarEchoesGroupRun.js";
import { GetWarEchoesList } from "@api/controllers/warEchoes/GetWarEchoesList.js";
import { GetWarEchoesRun } from "@api/controllers/warEchoes/GetWarEchoesRun.js";
import {
    GetWarEchoesGroupListRequestValidator
} from "@api/middleware/validators/warEchoes/GetWarEchoesGroupListRequestValidator.js";
import {
    GetWarEchoesGroupRunResponseValidator
} from "@api/middleware/validators/warEchoes/GetWarEchoesGroupRunResponseValidator.js";
import { GetWarEchoesListRequestValidator } from "@api/middleware/validators/warEchoes/GetWarEchoesListRequestValidator.js";
import { GetWarEchoesRunRequestValidator } from "@api/middleware/validators/warEchoes/GetWarEchoesRunRequestValidator.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import { Router } from "express";

export const warEchoesRouter = Router();

warEchoesRouter.get("/list",
    RequestValidator.with(GetWarEchoesListRequestValidator),
    Controller.with(GetWarEchoesList)
);
warEchoesRouter.get("/group-list",
    RequestValidator.with(GetWarEchoesGroupListRequestValidator),
    Controller.with(GetWarEchoesGroupList)
);
warEchoesRouter.get("/run",
    RequestValidator.with(GetWarEchoesRunRequestValidator),
    Controller.with(GetWarEchoesRun)
);
warEchoesRouter.get("/group-run",
    RequestValidator.with(GetWarEchoesGroupRunResponseValidator),
    Controller.with(GetWarEchoesGroupRun)
);
