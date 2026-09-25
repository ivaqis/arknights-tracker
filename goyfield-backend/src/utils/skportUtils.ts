import crypto from "node:crypto";

export function generateSign(path: string, query: string, timestamp: string, token: string): string {
    const header = {
        platform: "3",
        timestamp: timestamp,
        dId: "",
        vName: "1.0.0"
    };

    const headerStr = JSON.stringify(header);
    const strToSign = `${path}${query}${timestamp}${headerStr}`;

    const hmacSha256 = crypto
        .createHmac("sha256", token)
        .update(strToSign)
        .digest("hex");

    return crypto.createHash("md5")
        .update(hmacSha256)
        .digest("hex");
}

export function getTimestampNow(): string {
    return String(Math.floor(Date.now() / 1000));
}