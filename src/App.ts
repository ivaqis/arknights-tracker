import express, {Express} from "express";

export class App {
    private readonly _app: Express;

    constructor() {
        this._app = express();
    }

    get app() {
        return this._app;
    }

    private configureRoutes() {
        this._app.use()
    }
}