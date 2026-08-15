import { config } from "@/config.js";
import { logger } from "@/logger.js";
import { FirebaseAuthData } from "@services/firebaseAuth/FirebaseAuthData.js";
import { IService } from "@services/IService.js";
import axios, { AxiosResponse } from "axios";
import crypto from "node:crypto";

export class FirebaseAuthenticator implements IService {
    public static readonly PUBLIC_TOKEN_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

    public readonly name: string = "FirebaseAuthenticator";

    private readonly _projectId: string;

    private _certificateCache: GoogleCertificates | null = null;
    private _certificateExpire: number = 0;

    public constructor(projectId: string) {
        this._projectId = projectId;
    }

    private static base64UrlDecode(str: string): string {
        let base64 = str
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        while (base64.length % 4) {
            base64 += "=";
        }

        return Buffer
            .from(base64, "base64")
            .toString("utf8");
    }

    public get projectId(): string {
        return this._projectId;
    }

    public async verifyToken(token: string): Promise<FirebaseAuthData | null> {
        try {
            const result = await this.verify(token);

            logger.info("FirebaseAuthenticator: Verification successfully verify token");

            return result;
        } catch (e) {
            logger.info("FirebaseAuthenticator: Verification failed");
            logger.debug(`FirebaseAuthenticator: ${e}`);

            return null;
        }
    }

    public async getFirebaseUid(token?: string | null): Promise<string | null> {
        if (!token) {
            return null;
        }

        const data = await this.verifyToken(token);

        return data?.sub ?? null;
    }

    public isActive(): boolean {
        return !!this.projectId;
    }

    private async verify(token: string): Promise<FirebaseAuthData> {
        if (token.startsWith("mock_") && config.envName !== "production") {
            return {
                sub: token,
                name: token.replace("mock_", ""),
                email: `${token}@goyfield.moe`
            };
        }

        const parts = token.split(".");
        if (parts.length !== 3) {
            throw new Error("Invalid token provided");
        }

        const [headerStr, payloadStr, signatureStr] = parts;

        let header: TokenHeader;
        let payload: TokenPayload;

        try {
            header = JSON.parse(FirebaseAuthenticator.base64UrlDecode(headerStr));
            payload = JSON.parse(FirebaseAuthenticator.base64UrlDecode(payloadStr));
        } catch (e) {
            throw new Error("Failed to parse token payload");
        }

        if (header.alg !== "RS256") {
            throw new Error("Unsupported algorithm");
        }

        const certs = await this.getCertificate();
        const cert = certs[header.kid];
        if (!cert) {
            throw new Error("Key ID not found in Google certificates");
        }

        const signature = Buffer.from(signatureStr, "base64url");
        const verifier = crypto.createVerify("RSA-SHA256");
        verifier.update(`${headerStr}.${payloadStr}`);

        const isValid = verifier.verify(cert, signature);
        if (!isValid) {
            throw new Error("Invalid signature");
        }

        const now = Math.floor(Date.now() / 1000);
        if (payload.iss !== `https://securetoken.google.com/${this.projectId}`) {
            throw new Error("Invalid issuer");
        }
        if (payload.aud !== this.projectId) {
            throw new Error("Invalid audience");
        }
        if (!payload.exp || payload.exp < now) {
            throw new Error("Token expired");
        }
        if (!payload.sub) {
            throw new Error("Subject is missing");
        }

        return {
            sub: payload.sub,
            name: payload.name,
            email: payload.email
        };
    }

    private async getCertificate(): Promise<GoogleCertificates> {
        const now = Date.now();

        if (this._certificateCache && this._certificateExpire > now) {
            return this._certificateCache;
        }

        let certData = await this.fetchGooglePublicCertificate();

        this._certificateCache = certData.certs;
        this._certificateExpire = certData.expire;

        return this._certificateCache;
    }

    private async fetchGooglePublicCertificate() {
        try {
            const now = Date.now();

            const resp: AxiosResponse<GoogleCertificates> = await axios.get(FirebaseAuthenticator.PUBLIC_TOKEN_URL);

            const cacheControl = resp.headers["cache-control"] as string | undefined;

            const maxAge = this.getMaxAgeMs(cacheControl);

            return {
                certs: resp.data,
                expire: now + maxAge
            };
        } catch (e) {
            logger.error(`FirebaseAuthenticator: Failed to fetch Google public certs: ${e}`);

            throw new Error("Authentication service temporarily unavailable");
        }
    }

    private getMaxAgeMs(cacheControl?: string): number {
        if (!cacheControl) {
            throw new Error("FirebaseAuthenticator: No cache control found");
        }

        const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);

        if (!maxAgeMatch) {
            throw new Error(`FirebaseAuthenticator: No max age match:\n${cacheControl}`);
        }

        return parseInt(maxAgeMatch[1], 10) * 1000;
    }
}

interface GoogleCertificates extends Record<string, string> {}

interface TokenHeader {
    alg?: string;
    kid: string;
}

interface TokenPayload {
    iss?: string;
    aud?: string;
    exp?: number;
    sub?: string;
    name?: string;
    email?: string;
}