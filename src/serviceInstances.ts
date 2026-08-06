import { config } from "@/config";
import { Database } from "@database/Database";
import { PrismaClient } from "@generated/prisma-v2";
import { Authenticator } from "@services/auth/Authenticator";
import { AvatarUploader } from "@services/avatarUploader/AvatarUploader";
import { FirebaseAuthenticator } from "@services/firebaseAuth/FirebaseAuthenticator";
import { SightengineNsfwValidator } from "@services/sightengineNsfwValidator/SightengineNsfwValidator";

const prisma = new PrismaClient();
export const database = new Database(prisma);

export const firebase = new FirebaseAuthenticator("goyfield-73");

export const authenticator = new Authenticator(database, firebase);

export const avatarUploader = new AvatarUploader();

export const sightengine = new SightengineNsfwValidator(config.sightengineUser ?? "", config.sightengineSecret ?? "");