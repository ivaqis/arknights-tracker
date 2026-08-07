import { Controller } from "@api/controllers/Controller.js";
import { GetImportErrors } from "@api/controllers/importErrors/GetImportErrors.js";
import { RequireAuth } from "@api/middleware/RequireAuth.js";
import { AuthType } from "@services/auth/AuthType.js";
import { Router } from "express";

export const errorsRouter = Router();

errorsRouter.get("/import",
    RequireAuth.require(AuthType.ADMIN_SECRET),
    Controller.with(GetImportErrors)
);