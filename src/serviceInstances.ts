import { config } from "@/config.js";
import { Database } from "@database/Database.js";
import { PrismaClient } from "@generated/prisma-v2/index.js";
import { Authenticator } from "@services/auth/Authenticator.js";
import { AvatarUploader } from "@services/avatarUploader/AvatarUploader.js";
import { FirebaseAuthenticator } from "@services/firebaseAuth/FirebaseAuthenticator.js";
import { SightengineNsfwValidator } from "@services/sightengineNsfwValidator/SightengineNsfwValidator.js";

const prisma = new PrismaClient();
export const database = new Database(prisma);

export const firebase = new FirebaseAuthenticator("goyfield-73");

export const authenticator = new Authenticator(database, firebase);

export const avatarUploader = new AvatarUploader();

export const sightengine = new SightengineNsfwValidator(config.sightengineUser ?? "", config.sightengineSecret ?? "");