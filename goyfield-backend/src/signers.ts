import { config } from "@/config.js";
import { SyncPullsSigner } from "@models/signers/syncPullsSigner/SyncPullsSigner.js";

export const syncPullsSigner = new SyncPullsSigner(config.signSecret, config.signIssuer);