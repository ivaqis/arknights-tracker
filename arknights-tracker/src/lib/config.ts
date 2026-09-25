export const config = {
    API_BASE: getApiBase()
} as const;

function getApiBase(): string {
    const runtimeBase: string | undefined =
        typeof window !== "undefined"
        && "__CONFIG__" in window
        && typeof window.__CONFIG__ === "object"
        && window.__CONFIG__ !== null
        && "API_BASE" in window.__CONFIG__
        && window.__CONFIG__.API_BASE
        && typeof window.__CONFIG__.API_BASE === "string"
            ? window.__CONFIG__.API_BASE
            : undefined;

    const viteApiBase: string | undefined =
        typeof import.meta.env.VITE_API_BASE === "string"
            ? import.meta.env.VITE_API_BASE
            : undefined;

    const rawBase = runtimeBase
        ?? viteApiBase
        ?? (import.meta.env.PROD ? "" : "http://localhost:3001");

    return rawBase.replace(/\/api\/v2\/?$/, "").replace(/\/$/, "");
}