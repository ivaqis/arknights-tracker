import { UserAuthResult } from "@services/auth/UserAuthResult";

export interface FirebaseAuthResult extends UserAuthResult {
    firebaseUid: string;
}