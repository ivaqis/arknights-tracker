import { config } from "@/config";
import { SyncPullsSigner } from "@models/signers/syncPullsSigner/SyncPullsSigner";

export const syncPullsSigner = new SyncPullsSigner(config.signSecret, config.signIssuer);