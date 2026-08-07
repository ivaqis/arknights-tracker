import { SyncPullsSignInput } from "@models/signers/syncPullsSigner/interfaces/SyncPullsSignInput.js";
import { SyncPullsSignOutput } from "@models/signers/syncPullsSigner/interfaces/SyncPullsSignOutput.js";
import jwt from "jsonwebtoken";
import { StringValue } from "ms";

export class SyncPullsSigner {
    private readonly _secret: string;
    private readonly _issuer: string;

    public constructor(secret: string, issuer: string) {
        this._secret = secret;
        this._issuer = issuer;
    }

    public sign(data: SyncPullsSignInput, lifeTime: number | StringValue): string {
        return jwt.sign(
            data,
            this._secret,
            {
                algorithm: "HS256",
                expiresIn: lifeTime,
                issuer: this._issuer
            }
        );
    }

    public verify(token: string): SyncPullsSignOutput | null {
        let data: jwt.JwtPayload | string;
        try {
            data = jwt.verify(
                token,
                this._secret,
                {
                    algorithms: ["HS256"],
                    issuer: this._issuer
                }
            );
        } catch (e) {
            return null;
        }

        if (typeof data === "string") {
            return null;
        }

        const isCorrect = typeof data.id === "string"
            && !!data.id
            && typeof data.iat === "number"
            && typeof data.exp === "number"
            && typeof data.iss === "string";

        return isCorrect
            ? data as SyncPullsSignOutput
            : null;
    }
}