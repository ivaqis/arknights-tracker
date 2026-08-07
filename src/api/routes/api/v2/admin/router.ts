import { errorsRouter } from "@api/routes/api/v2/admin/errors/router.js";
import { Router } from "express";

export const adminRouter = Router();

adminRouter.use("/errors", errorsRouter);