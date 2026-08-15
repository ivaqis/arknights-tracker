import { UserAuthResult } from "@services/auth/UserAuthResult.js";

export interface FirebaseAuthResult extends UserAuthResult {
    firebaseUid: string;
}