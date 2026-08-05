import { Controller } from "@api/controllers/Controller";
import { GetImportErrors } from "@api/controllers/importErrors/GetImportErrors";
import { RequireAuth } from "@api/middleware/RequireAuth";
import { AuthType } from "@services/auth/AuthType";
import { Router } from "express";

export const errorsRouter = Router();

errorsRouter.get("/import",
    RequireAuth.require(AuthType.ADMIN_SECRET),
    Controller.with(GetImportErrors)
);