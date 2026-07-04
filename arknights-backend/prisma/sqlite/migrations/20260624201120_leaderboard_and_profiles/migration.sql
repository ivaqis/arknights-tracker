-- CreateTable
CREATE TABLE "user_account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firebase_uid" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "picture" TEXT,
    "name" TEXT,
    "avatar_strike" INTEGER NOT NULL DEFAULT 0,
    "upload_count" INTEGER NOT NULL DEFAULT 0,
    "last_upload_reset" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "user_account_details" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "game_uid" TEXT NOT NULL,
    "account_info" TEXT NOT NULL,
    CONSTRAINT "user_account_details_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_leaderboard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "game_uid" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "clear_time" REAL NOT NULL,
    "leaderboard_info" TEXT NOT NULL,
    CONSTRAINT "user_leaderboard_game_uid_fkey" FOREIGN KEY ("game_uid") REFERENCES "user_account_details" ("game_uid") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_account_firebase_uid_key" ON "user_account"("firebase_uid");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_picture_key" ON "user_account"("picture");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_details_game_uid_key" ON "user_account_details"("game_uid");
