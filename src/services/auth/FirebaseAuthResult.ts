import { AuthResult } from "@services/auth/AuthResult";

export interface FirebaseAuthResult extends AuthResult {
    firebaseUid: string;
}