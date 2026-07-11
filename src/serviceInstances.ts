import { Database } from "@database/Database";
import { PrismaClient } from "@prisma/client";
import { FirebaseAuthenticator } from "@services/firebaseAuth/FirebaseAuthenticator";

const prisma = new PrismaClient();
export const database = new Database(prisma);

export const firebase = new FirebaseAuthenticator("goyfield-73");