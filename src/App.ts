import { root } from "@api/routes/root.js";
import cors from "cors";
import e, { Express } from "express";

export class App {
    private readonly _app: Express;
    private readonly _port: number;

    public constructor(port: number) {
        this._app = e();
        this._port = port;

        this._app.use(cors());
        this._app.use("/", root);

        this._app.listen(this._port);
    }

    public get app() {
        return this._app;
    }

    public get port(): number {
        return this._port;
    }
}