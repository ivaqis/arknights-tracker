-- CreateTable
CREATE TABLE "user_account" (
    "id" SERIAL NOT NULL,
    "firebase_uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "picture" TEXT,
    "name" TEXT,
    "avatar_strike" INTEGER NOT NULL DEFAULT 0,
    "upload_count" INTEGER NOT NULL DEFAULT 0,
    "last_upload_reset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_private" INTEGER NOT NULL DEFAULT 0,
    "background" TEXT,
    "favorite_game_uid" TEXT,

    CONSTRAINT "user_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_account_details" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "game_uid" TEXT NOT NULL,
    "account_info" TEXT NOT NULL,
    "records_uid" TEXT,

    CONSTRAINT "user_account_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_leaderboard" (
    "id" SERIAL NOT NULL,
    "game_uid" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "clear_time" DOUBLE PRECISION NOT NULL,
    "leaderboard_info" TEXT NOT NULL,

    CONSTRAINT "user_leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_account_firebase_uid_key" ON "user_account"("firebase_uid");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_picture_key" ON "user_account"("picture");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_details_game_uid_key" ON "user_account_details"("game_uid");

-- AddForeignKey
ALTER TABLE "user_account_details" ADD CONSTRAINT "user_account_details_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_leaderboard" ADD CONSTRAINT "user_leaderboard_game_uid_fkey" FOREIGN KEY ("game_uid") REFERENCES "user_account_details"("game_uid") ON DELETE CASCADE ON UPDATE CASCADE;
