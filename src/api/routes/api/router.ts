import { adminRouter } from "@api/routes/api/admin/router";
import { globalRouter } from "@api/routes/api/global/router";
import { importRouter } from "@api/routes/api/import/router";
import { leaderboardRouter } from "@api/routes/api/leaderboard/router";
import { userRouter } from "@api/routes/api/user/router";
import e, { Router } from "express";

export const apiRouter = Router();

apiRouter.use(e.json({ limit: "10mb" }));

apiRouter.use("/leaderboard", leaderboardRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/global", globalRouter);
apiRouter.use("/import", importRouter);