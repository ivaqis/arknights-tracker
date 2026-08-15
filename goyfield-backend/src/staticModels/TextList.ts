import { logger } from "@/logger.js";
import * as fs from "node:fs";
import path from "node:path";

export class TextList {
    private static readonly EXAMPLE_NAME = "example.txt";

    private readonly _set: Set<string> = new Set();
    private readonly _rootDir = process.cwd();
    private readonly _newLineOnly: boolean;

    public constructor(newLineOnly: boolean = false) {
        this._newLineOnly = newLineOnly;
    }

    public addFromFile(filePath: string): void {
        const normalized = path.normalize(filePath);

        if (path.isAbsolute(normalized)) {
            this.addFile(normalized);
            return;
        }

        this.addFile(path.resolve(this._rootDir, normalized));
    }

    public addFromDir(dirPath: string, includeExample: boolean = false): void {
        const normalized = path.normalize(dirPath);

        if (path.isAbsolute(normalized)) {
            this.addDir(normalized, includeExample);
            return;
        }

        this.addDir(path.resolve(this._rootDir, normalized), includeExample);
    }

    public getList(): string[] {
        return [...this._set];
    }

    private add(list: string[]): void {
        for (const item of list) {
            this._set.add(item);
        }
    }

    private addFile(filePath: string): void {
        logger.debug(`TextList: Reading file ${filePath}`);

        const file = fs.readFileSync(filePath, "utf8");

        const list = this.split(file);

        this.add(list);
    }

    private addDir(dirPath: string, includeExample: boolean): void {
        logger.debug(`TextList: Reading directory ${dirPath}`);

        const files = fs.readdirSync(dirPath);

        for (const fileName of files) {
            if (!fileName.endsWith(".txt")) {
                continue;
            }

            if (!includeExample && fileName === TextList.EXAMPLE_NAME) {
                continue;
            }

            this.addFile(path.resolve(dirPath, fileName));
        }
    }

    private split(str: string) {
        if (this._newLineOnly) {
            return str
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter(Boolean);
        }

        return str
            .split(/\s+/)
            .map((line) => line.trim())
            .filter(Boolean);
    }
}