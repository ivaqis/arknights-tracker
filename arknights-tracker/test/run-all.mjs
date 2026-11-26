import { createServer } from "vite";
import { verifyDataIntegrity } from "./data-integrity.mjs";
import { verifyStoragesAndAssets } from "./storages-and-assets.mjs";
import { verifyPulls } from "./pulls.mjs";
import { verifyMathAndRotations } from "./math-and-rotations.mjs";

const suites = [
    { name: "data-integrity", fn: verifyDataIntegrity },
    { name: "storages-and-assets", fn: verifyStoragesAndAssets },
    { name: "pulls", fn: verifyPulls },
    { name: "math-and-rotations", fn: verifyMathAndRotations }
];

const vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "silent"
});

let failed = 0;

try {
    for (const suite of suites) {
        const start = Date.now();
        try {
            const info = await suite.fn(vite);
            const ms = Date.now() - start;
            console.log(`PASS ${suite.name} (${ms}ms)`, info ? JSON.stringify(info) : "");
        } catch (err) {
            failed++;
            console.error(`FAIL ${suite.name}:`, err?.stack || err);
        }
    }
} finally {
    await vite.close();
}

if (failed > 0) {
    process.exit(1);
}

