-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firebase_uid" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "picture" TEXT,
    "name" TEXT,
    "avatar_strike" INTEGER NOT NULL DEFAULT 0,
    "upload_count" INTEGER NOT NULL DEFAULT 0,
    "last_upload_reset" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_private" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_user_account" ("avatar_strike", "created_at", "firebase_uid", "id", "last_upload_reset", "name", "picture", "updated_at", "upload_count") SELECT "avatar_strike", "created_at", "firebase_uid", "id", "last_upload_reset", "name", "picture", "updated_at", "upload_count" FROM "user_account";
DROP TABLE "user_account";
ALTER TABLE "new_user_account" RENAME TO "user_account";
CREATE UNIQUE INDEX "user_account_firebase_uid_key" ON "user_account"("firebase_uid");
CREATE UNIQUE INDEX "user_account_picture_key" ON "user_account"("picture");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
